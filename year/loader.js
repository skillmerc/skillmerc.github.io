// Files in, merged export out. Works on browser File objects and Node 22 Blobs alike (tests use Blobs).
import { listZip, readZipText, pickExportEntries, ZipError } from "./zip.js";
import { parseExportText, mergeExports, ExportError } from "./parsers.js";

const isZip = async (f) => { const b = new Uint8Array(await f.slice(0, 4).arrayBuffer()); return b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04; };

/** Read one file into [{ provider, chats, messages }]. Throws ExportError. */
export async function readExportFile(file) {
  const name = file.name || "";
  if (await isZip(file)) {
    let entries;
    try { entries = await listZip(file); } catch (e) { throw new ExportError("bad-zip", e instanceof ZipError ? "This zip file could not be opened." : String(e.message)); }
    const picked = pickExportEntries(entries);
    if (!picked.length) throw new ExportError("no-chats-in-zip", "This zip has no chat file in it.");
    const out = []; let lastErr = null;
    for (const e of picked) {
      try { out.push(parseExportText(await readZipText(file, e), e.name)); } catch (err) { lastErr = err; }
    }
    if (!out.length) throw lastErr instanceof ExportError ? lastErr : new ExportError("bad-zip", "This zip file could not be read.");
    return out;
  }
  return [parseExportText(await file.text(), name)];
}

/** Read every dropped file. Returns { merged, errors: [{ name, code, message }] }; merged is null if nothing was read. */
export async function readExports(files) {
  const parts = [], errors = [];
  for (const f of files) {
    try { parts.push(...(await readExportFile(f))); }
    catch (e) { errors.push({ name: f.name || "file", code: e.code || "unknown", message: e.message }); }
  }
  return { merged: parts.length ? mergeExports(parts) : null, errors, providers: [...new Set(parts.map((p) => p.provider))] };
}

/** The words for each error code, in the kit's error shape: what did not happen, then the one thing to do. */
export const ERROR_WORDS = {
  "html-not-gemini": ["Not read: that page is not Gemini Apps activity.", "For Gemini, drop MyActivity.html from the Gemini Apps folder of your Google Takeout. For ChatGPT or Claude, drop the .zip they emailed you."],
  "gemini-html": ["Not read: no prompts found in that Gemini page.", "Export again from Google Takeout with My Activity set to JSON (Multiple formats), then drop MyActivity.json here."],
  "not-json": ["Not read: that file is not a chat export.", "Drop the .zip your AI app emailed you, or the conversations.json inside it."],
  unknown: ["Not read: that file is not a ChatGPT, Claude or Gemini export.", "Drop the .zip your AI app emailed you, or the conversations.json inside it."],
  empty: ["Not read: that export has no chats in it.", "If you use this AI on another account, export from that one."],
  "bad-zip": ["Not read: that zip file could not be opened.", "Download the export again. A half-finished download is the usual cause."],
  "no-chats-in-zip": ["Not read: that zip has no chats in it.", "It needs conversations.json (ChatGPT, Claude) or the Gemini Apps My Activity file (Google Takeout)."],
  "read-failed": ["Not read: this browser could not open that file.", "Check the file opens on this device, then drop it again. Nothing was uploaded."],
};
