// Turn each provider's export into one shape:
// { provider, chats: [{ id, title, start }], messages: [{ chatId, role: "user"|"ai", time (ms), text }] }
// Detection is by the JSON's shape, never the file name (ChatGPT and Claude both ship conversations.json).

export const PROVIDERS = { chatgpt: "ChatGPT", claude: "Claude", gemini: "Gemini" };
export class ExportError extends Error { constructor(code, message) { super(message); this.code = code; } }

const isObj = (x) => x && typeof x === "object" && !Array.isArray(x);

export function detectProvider(data) {
  const list = Array.isArray(data) ? data : Array.isArray(data?.conversations) ? data.conversations : null;
  if (!list) return null;
  const sample = list.slice(0, 20).filter(isObj);
  if (!sample.length) return list.length === 0 ? "empty" : null;
  if (sample.some((c) => isObj(c.mapping))) return "chatgpt";
  if (sample.some((c) => Array.isArray(c.chat_messages))) return "claude";
  if (sample.some((c) => typeof c.time === "string" && (Array.isArray(c.products) || typeof c.header === "string") && "title" in c)) return "gemini";
  return null;
}

function chatgptBranch(conv) {
  const m = conv.mapping || {};
  if (conv.current_node && m[conv.current_node]) {
    const path = []; const seen = new Set();
    for (let id = conv.current_node; id && m[id] && !seen.has(id); id = m[id].parent) { seen.add(id); path.push(m[id]); }
    return path.reverse();
  }
  return Object.values(m);
}

export function parseChatGPT(list) {
  const chats = [], messages = [];
  list.forEach((conv, i) => {
    if (!isObj(conv)) return;
    const id = "c" + (conv.conversation_id || conv.id || i);
    const startSec = Number(conv.create_time);
    chats.push({ id, title: String(conv.title || "Untitled chat"), start: Number.isFinite(startSec) ? startSec * 1000 : null });
    for (const node of chatgptBranch(conv)) {
      const msg = node?.message; if (!isObj(msg)) continue;
      const r = msg.author?.role; if (r !== "user" && r !== "assistant") continue;
      const parts = Array.isArray(msg.content?.parts) ? msg.content.parts : [];
      const text = parts.filter((p) => typeof p === "string").join("\n").trim()
        || (typeof msg.content?.text === "string" ? msg.content.text.trim() : "");
      if (!text) continue;
      const t = Number(msg.create_time ?? conv.create_time);
      if (!Number.isFinite(t)) continue;
      messages.push({ chatId: id, role: r === "user" ? "user" : "ai", time: t * 1000, text });
    }
  });
  return { provider: "chatgpt", chats, messages };
}

export function parseClaude(list) {
  const chats = [], messages = [];
  list.forEach((conv, i) => {
    if (!isObj(conv)) return;
    const id = "k" + (conv.uuid || i);
    const start = Date.parse(conv.created_at);
    chats.push({ id, title: String(conv.name || "Untitled chat"), start: Number.isFinite(start) ? start : null });
    for (const msg of conv.chat_messages || []) {
      if (!isObj(msg)) continue;
      const role = msg.sender === "human" ? "user" : msg.sender === "assistant" ? "ai" : null; if (!role) continue;
      let text = typeof msg.text === "string" ? msg.text.trim() : "";
      if (!text && Array.isArray(msg.content)) text = msg.content.filter((c) => c?.type === "text" && typeof c.text === "string").map((c) => c.text).join("\n").trim();
      if (!text) continue;
      const t = Date.parse(msg.created_at || conv.created_at);
      if (!Number.isFinite(t)) continue;
      messages.push({ chatId: id, role, time: t, text });
    }
  });
  return { provider: "claude", chats, messages };
}

const ENTITIES = { nbsp: " ", emsp: " ", ensp: " ", thinsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'" };
export const decodeEntities = (t) => String(t).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e) => {
  if (e[0] === "#") { const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); try { return String.fromCodePoint(n); } catch { return all; } }
  return ENTITIES[e.toLowerCase()] ?? all;
});
export const stripHtml = (h) => decodeEntities(String(h).replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " "))
  .replace(/[\u00a0\u2000-\u200b\u202f]/g, " ").replace(/\s+/g, " ").trim();

export const GEMINI_SESSION_GAP_MS = 30 * 60 * 1000;

export function parseGemini(list) {
  const entries = [];
  for (const e of list) {
    if (!isObj(e)) continue;
    const tag = [e.header, ...(Array.isArray(e.products) ? e.products : [])].join(" ");
    if (!/gemini|bard/i.test(tag)) continue;
    const title = typeof e.title === "string" ? e.title : "";
    const m = title.match(/^Prompted\s+([\s\S]+)/);
    if (!m) continue; // feedback, settings, extensions: not a prompt
    const t = Date.parse(e.time); if (!Number.isFinite(t)) continue;
    const reply = (Array.isArray(e.safeHtmlItem) ? e.safeHtmlItem : []).map((x) => stripHtml(x?.html || "")).join(" ").trim();
    entries.push({ t, prompt: m[1].trim(), reply });
  }
  entries.sort((a, b) => a.t - b.t);
  const chats = [], messages = [];
  let last = -Infinity, chat = null;
  for (const e of entries) {
    if (e.t - last > GEMINI_SESSION_GAP_MS) { chat = { id: "g" + chats.length, title: e.prompt.slice(0, 60), start: e.t }; chats.push(chat); }
    last = e.t;
    messages.push({ chatId: chat.id, role: "user", time: e.t, text: e.prompt });
    if (e.reply) messages.push({ chatId: chat.id, role: "ai", time: e.t, text: e.reply });
  }
  return { provider: "gemini", chats, messages };
}

// Google Takeout's default format for My Activity is HTML (MyActivity.html). The file is one long line of
// <div class="outer-cell ..."> blocks; inside each: a header-cell with the product ("Gemini Apps"), a body-1
// content-cell holding "Prompted&nbsp;<prompt>", <br>, the date ("Nov 4, 2026, 10:29:00 AM SAST", often with a
// narrow no-break space before AM), <br>, then the reply as HTML; and a caption cell with "Products:" and
// "Why is this here?". Plain string code (no DOMParser) so Node tests run the same code the page does.
const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };
// Zone names Takeout prints, in minutes from UTC. An unknown name falls back to this browser's own zone.
const ZONES = { UTC: 0, GMT: 0, WET: 0, WEST: 60, BST: 60, IST: 330, CET: 60, CEST: 120, EET: 120, EEST: 180, SAST: 120, CAT: 120, EAT: 180, WAT: 60,
  MSK: 180, GST: 240, PKT: 300, ICT: 420, WIB: 420, SGT: 480, HKT: 480, AWST: 480, PHT: 480, KST: 540, JST: 540, ACST: 570, ACDT: 630, AEST: 600, AEDT: 660,
  NZST: 720, NZDT: 780, HST: -600, AKST: -540, AKDT: -480, PST: -480, PDT: -420, MST: -420, MDT: -360, CST: -360, CDT: -300, EST: -300, EDT: -240,
  AST: -240, ADT: -180, NST: -210, NDT: -150, BRT: -180, ART: -180 };

/** "Nov 4, 2026, 10:29:00 AM SAST" or "4 Nov 2026, 10:29:00 GMT+02:00" to ms, or NaN. */
export function parseTakeoutDate(raw) {
  const s = decodeEntities(String(raw)).replace(/[\u00a0\u2000-\u200b\u202f]/g, " ").replace(/\s+/g, " ").trim();
  let m = s.match(/^([A-Za-z]{3,9})\.? (\d{1,2}), (\d{4}),? (\d{1,2}):(\d{2})(?::(\d{2}))? ?([AaPp]\.?[Mm]\.?)? ?(.*)$/);
  let mon, day, year, h, mi, sec, ampm, zone;
  if (m) [, mon, day, year, h, mi, sec, ampm, zone] = m;
  else {
    m = s.match(/^(\d{1,2}) ([A-Za-z]{3,9})\.? (\d{4}),? (\d{1,2}):(\d{2})(?::(\d{2}))? ?([AaPp]\.?[Mm]\.?)? ?(.*)$/);
    if (!m) return NaN;
    [, day, mon, year, h, mi, sec, ampm, zone] = m;
  }
  const mo = MONTHS[mon.toLowerCase()] ?? MONTHS[mon.slice(0, 3).toLowerCase()];
  if (mo === undefined) return NaN;
  let hour = Number(h);
  if (ampm) { const pm = /^p/i.test(ampm); if (hour === 12) hour = pm ? 12 : 0; else if (pm) hour += 12; }
  const parts = [Number(year), mo, Number(day), hour, Number(mi), Number(sec || 0)];
  if (hour > 23 || parts[4] > 59 || parts[2] < 1 || parts[2] > 31) return NaN;
  zone = (zone || "").trim();
  const off = zone.match(/^(?:UTC|GMT)?\s*([+-])(\d{1,2})(?::?(\d{2}))?$/i);
  let mins;
  if (off) mins = (off[1] === "-" ? -1 : 1) * (Number(off[2]) * 60 + Number(off[3] || 0));
  else if (ZONES[zone.toUpperCase()] !== undefined) mins = ZONES[zone.toUpperCase()];
  if (mins === undefined) return new Date(...parts).getTime(); // unknown or no zone: read as this browser's time
  return Date.UTC(...parts) - mins * 60000;
}

const looksHtml = (text) => /^\s*(\ufeff)?\s*</.test(text);
const isGeminiTag = (t) => /gemini|bard/i.test(t);

/** My Activity HTML to the same entry shape as MyActivity.json, so one parser counts both. */
export function geminiHtmlEntries(html) {
  const blocks = String(html).split(/<div\s+class="outer-cell\b/i).slice(1);
  const entries = [];
  let gemini = 0;
  for (const b of blocks) {
    const hm = b.match(/class="[^"]*\bheader-cell\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const header = hm ? stripHtml(hm[1]) : "";
    const pm = b.match(/<b>\s*Products:?\s*<\/b>([\s\S]*?)(?:<b>|<\/div>)/i);
    const products = pm ? pm[1].split(/<br\s*\/?>/i).map(stripHtml).filter(Boolean) : [];
    if (!isGeminiTag([header, ...products].join(" "))) continue;
    gemini++;
    const open = b.match(/<div\s+class="[^"]*\bcontent-cell\b[^"]*\bbody-1\b[^"]*"[^>]*>/i);
    if (!open) continue;
    const from = open.index + open[0].length;
    const next = b.slice(from).search(/<div\s+class="[^"]*\bcontent-cell\b/i);
    const body = next < 0 ? b.slice(from) : b.slice(from, from + next);
    const segs = body.split(/<br\s*\/?>/i);
    const at = segs.findIndex((x, i) => i > 0 && Number.isFinite(parseTakeoutDate(stripHtml(x))));
    if (at < 0) continue;
    const t = parseTakeoutDate(stripHtml(segs[at]));
    const title = stripHtml(segs.slice(0, at).join("\n"));
    const reply = segs.slice(at + 1).join("<br>");
    entries.push({ header: header || "Gemini Apps", title, time: new Date(t).toISOString(), products, safeHtmlItem: stripHtml(reply) ? [{ html: reply }] : [] });
  }
  return { entries, blocks: blocks.length, gemini };
}

function parseHtmlText(text) {
  const { entries, blocks, gemini } = geminiHtmlEntries(text);
  if (!blocks || !gemini) throw new ExportError("html-not-gemini", "This web page is not Gemini Apps activity.");
  const out = parseGemini(entries);
  if (!out.messages.length) throw new ExportError("gemini-html", "No prompts could be read from this Gemini activity page.");
  return out;
}

/** Parse the text of one export file. Throws ExportError with a code the UI turns into words. Content decides, never the name. */
export function parseExportText(text, name = "") {
  if (looksHtml(text)) return parseHtmlText(text);
  let data;
  try { data = JSON.parse(text); } catch { throw new ExportError("not-json", "This file is not a chat export we can read."); }
  const p = detectProvider(data);
  if (p === "empty") throw new ExportError("empty", "This export has no chats in it.");
  if (!p) throw new ExportError("unknown", "This file is not a ChatGPT, Claude or Gemini export.");
  const list = Array.isArray(data) ? data : data.conversations;
  const out = p === "chatgpt" ? parseChatGPT(list) : p === "claude" ? parseClaude(list) : parseGemini(list);
  if (!out.messages.length) throw new ExportError("empty", "This export has no messages in it.");
  return out;
}

/** Merge several parsed exports (same provider twice, e.g. sharded ChatGPT files, is fine). */
export function mergeExports(parts) {
  return { chats: parts.flatMap((p) => p.chats.map((c) => ({ ...c, provider: p.provider }))),
           messages: parts.flatMap((p) => p.messages.map((m) => ({ ...m, provider: p.provider }))) };
}
