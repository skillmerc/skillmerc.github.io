// A minimal zip reader for the browser and Node 22: reads only the central directory and the entries asked for,
// so a 2 GB export never has to sit in memory whole. Deflate via the built-in DecompressionStream("deflate-raw").
// Supports stored (0) and deflate (8) entries and Zip64 sizes and offsets. No dependencies.

const u16 = (v, o) => v.getUint16(o, true);
const u32 = (v, o) => v.getUint32(o, true);
const u64 = (v, o) => Number(v.getBigUint64(o, true));

async function bytes(blob, start, end) { return new Uint8Array(await blob.slice(start, end).arrayBuffer()); }

export class ZipError extends Error {}

/** List the entries of a zip Blob/File: [{ name, method, compressedSize, size, localOffset }]. */
export async function listZip(blob) {
  const size = blob.size;
  const tailLen = Math.min(size, 65557 + 20);
  const tail = await bytes(blob, size - tailLen, size);
  const tv = new DataView(tail.buffer, tail.byteOffset, tail.byteLength);
  let eocd = -1;
  for (let i = tail.length - 22; i >= 0; i--) if (u32(tv, i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new ZipError("not a zip file");
  let count = u16(tv, eocd + 10), cdSize = u32(tv, eocd + 12), cdOffset = u32(tv, eocd + 16);
  const loc = eocd - 20;
  if (loc >= 0 && u32(tv, loc) === 0x07064b50) {
    const z64Offset = u64(tv, loc + 8);
    const z = await bytes(blob, z64Offset, z64Offset + 56);
    const zv = new DataView(z.buffer, z.byteOffset, z.byteLength);
    if (u32(zv, 0) === 0x06064b50) { count = u64(zv, 32); cdSize = u64(zv, 40); cdOffset = u64(zv, 48); }
  }
  const cd = await bytes(blob, cdOffset, cdOffset + cdSize);
  const v = new DataView(cd.buffer, cd.byteOffset, cd.byteLength);
  const dec = new TextDecoder();
  const out = [];
  let p = 0;
  for (let n = 0; n < count && p + 46 <= cd.length; n++) {
    if (u32(v, p) !== 0x02014b50) throw new ZipError("broken zip directory");
    const method = u16(v, p + 10);
    let compressedSize = u32(v, p + 20), sz = u32(v, p + 24);
    const nameLen = u16(v, p + 28), extraLen = u16(v, p + 30), commentLen = u16(v, p + 32);
    let localOffset = u32(v, p + 42);
    const name = dec.decode(cd.subarray(p + 46, p + 46 + nameLen));
    let e = p + 46 + nameLen; const eEnd = e + extraLen;
    while (e + 4 <= eEnd) {
      const id = u16(v, e), len = u16(v, e + 2); let q = e + 4;
      if (id === 0x0001) {
        if (sz === 0xffffffff) { sz = u64(v, q); q += 8; }
        if (compressedSize === 0xffffffff) { compressedSize = u64(v, q); q += 8; }
        if (localOffset === 0xffffffff) { localOffset = u64(v, q); }
      }
      e += 4 + len;
    }
    if (!name.endsWith("/")) out.push({ name, method, compressedSize, size: sz, localOffset });
    p = eEnd + commentLen;
  }
  return out;
}

/** Read one entry as text. */
export async function readZipText(blob, entry) {
  const head = await bytes(blob, entry.localOffset, entry.localOffset + 30);
  const hv = new DataView(head.buffer, head.byteOffset, head.byteLength);
  if (u32(hv, 0) !== 0x04034b50) throw new ZipError("broken zip entry");
  const start = entry.localOffset + 30 + u16(hv, 26) + u16(hv, 28);
  const raw = blob.slice(start, start + entry.compressedSize);
  if (entry.method === 0) return await raw.text();
  if (entry.method !== 8) throw new ZipError(`zip method ${entry.method} is not supported`);
  const stream = raw.stream().pipeThrough(new DecompressionStream("deflate-raw")).pipeThrough(new TextDecoderStream());
  let text = ""; const reader = stream.getReader();
  for (;;) { const { done, value } = await reader.read(); if (done) break; text += value; }
  return text;
}

/** Which entries in an export zip hold chats. Names only; the shape check happens in parsers.js. */
export function pickExportEntries(entries) {
  return entries.filter((e) => {
    const base = e.name.split("/").pop().toLowerCase();
    if (/^conversations(-\d+)?\.json$/.test(base)) return true;
    if (base === "myactivity.json" && /gemini|bard/i.test(e.name)) return true;
    if (base === "myactivity.html" && /gemini|bard/i.test(e.name)) return true;
    return false;
  });
}
