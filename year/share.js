// The post line under Download: built only from the person's own numbers. Topics go in only when they chose
// to show them on the card. Pure: tests check it fits one post and never says undefined or NaN.
import { fmt } from "./stats.js";
import { SHORT_URL } from "./card.js";

export const SHARE_MAX = 240; // room inside one X post (280), with space for the person's own words

export function shareLine(s, { showTopics = false } = {}) {
  const n = Number(s?.messagesSent) || 0;
  const persona = String(s?.persona?.name || "").trim();
  const y = Number(s?.year), year = Number.isInteger(y) && y > 2000 ? ` ${y}` : "";
  const head = `My AI Year${year}: ${persona ? persona + ", " : ""}${fmt(n)} ${n === 1 ? "message" : "messages"}`;
  const tail = `. Make yours at ${SHORT_URL}`;
  const topics = showTopics && Array.isArray(s?.topTopics) ? s.topTopics.filter((t) => typeof t === "string").map((t) => t.trim()).filter(Boolean).slice(0, 3) : [];
  for (let k = topics.length; k > 0; k--) {
    const list = k === 1 ? topics[0] : `${topics.slice(0, k - 1).join(", ")} and ${topics[k - 1]}`;
    const line = `${head}, mostly ${list}${tail}`;
    if (line.length <= SHARE_MAX) return line;
  }
  return head + tail;
}
