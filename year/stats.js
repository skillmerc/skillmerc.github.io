// Every number in the recap, computed from the merged export. Pure functions, no DOM, so tests run in Node.
// Times: { utc: true } for tests; the app uses the browser's own time zone.
import { PROVIDERS } from "./parsers.js";

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MIN_MESSAGES = 10;

export const STOPWORDS = new Set(`a about above after again against all also am an and any are aren't as at be because been before being below
between both but by can can't cannot could couldn't did didn't do does doesn't doing don't down during each few for from further get got
had hadn't has hasn't have haven't having he her here hers herself him himself his how i i'd i'll i'm i've if in into is isn't it it's its
itself just let's like make me more most my myself need no nor not now of off on once one only or other ought our ours ourselves out over
own please same she should shouldn't so some such than thank thanks that that's the their theirs them themselves then there there's these
they they're this those through to too under until up us use using very want was wasn't way we we're were weren't what what's when where
which while who whom why will with won't would wouldn't you you'd you'll you're you've your yours yourself yourselves yes ok okay hi hello
hey sure really thing things something anything know think go going new good better best also lot much many well give tell show write help
work list example examples get make made way time year day today tomorrow question answer can could would should might im dont cant whats
first two three still even back around another every here there right left keep take see look looking around maybe actually basically
pls thx ty yeah yep nope sorry chat chats untitled conversation chatgpt claude gemini gpt bard openai
add shorter longer explain rewrite summarize summarise again same instead version`.split(/\s+/));

const CODE_WORDS = new Set("code error bug function python javascript typescript java sql api css html react node regex json script debug exception stack compile npm git docker class variable array query database server deploy test tests".split(" "));

export function dayParts(ms, utc) {
  const d = new Date(ms);
  return utc
    ? { y: d.getUTCFullYear(), mo: d.getUTCMonth(), day: d.getUTCDate(), wd: d.getUTCDay(), h: d.getUTCHours() }
    : { y: d.getFullYear(), mo: d.getMonth(), day: d.getDate(), wd: d.getDay(), h: d.getHours() };
}
const dayKey = (p) => Date.UTC(p.y, p.mo, p.day) / 86400000;

export function yearsIn(merged, utc = false) {
  const c = new Map();
  for (const m of merged.messages) if (m.role === "user") { const y = dayParts(m.time, utc).y; c.set(y, (c.get(y) || 0) + 1); }
  return [...c.entries()].sort((a, b) => b[0] - a[0]).map(([year, count]) => ({ year, count }));
}

/** The year to show first: the latest year with at least MIN_MESSAGES of the person's messages, else the latest year. */
export function defaultYear(merged, utc = false) {
  const ys = yearsIn(merged, utc);
  return (ys.find((y) => y.count >= MIN_MESSAGES) || ys[0])?.year ?? null;
}

export const words = (t) => (String(t).toLowerCase().match(/[a-z][a-z0-9'+#.-]*[a-z0-9+#]|[a-z]/g) || []);
const wordCount = (t) => (String(t).match(/\S+/g) || []).length;

/** Top topics: TF-IDF over chats (each chat = the person's messages plus its title), stopwords out. */
export function topTopics(docs, n = 5) {
  const df = new Map(), tf = new Map();
  for (const doc of docs) {
    const seen = new Set();
    for (const w of words(doc)) {
      if (w.length < 3 || STOPWORDS.has(w) || /^\d/.test(w)) continue;
      tf.set(w, (tf.get(w) || 0) + 1);
      if (!seen.has(w)) { seen.add(w); df.set(w, (df.get(w) || 0) + 1); }
    }
  }
  const N = docs.length || 1;
  // Reward words that come up across many chats (df), damped so one long paste cannot win.
  const scored = [...tf.entries()].filter(([w]) => df.get(w) >= Math.min(2, N)).map(([w, f]) => [w, Math.log(1 + f) * df.get(w) * Math.log(1 + N / df.get(w))]);
  scored.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  return scored.slice(0, n).map(([w]) => w);
}

const POLITE = /\b(please|pls|plz|thank you|thanks|thank u|thx|ty|cheers|appreciate it)\b/gi;

export function computeStats(merged, year, { utc = false } = {}) {
  const inYear = merged.messages.filter((m) => dayParts(m.time, utc).y === year);
  const mine = inYear.filter((m) => m.role === "user");
  const replies = inYear.filter((m) => m.role === "ai");
  const s = { year, messagesSent: mine.length, enough: mine.length >= MIN_MESSAGES };
  if (!mine.length) return { ...s, chats: 0 };

  const chatTitle = new Map(merged.chats.map((c) => [c.id, c]));
  const byChat = new Map();
  for (const m of inYear) { const a = byChat.get(m.chatId) || { user: 0, all: 0, first: Infinity, text: [] }; a.all++; if (m.role === "user") { a.user++; a.text.push(m.text); a.first = Math.min(a.first, m.time); } byChat.set(m.chatId, a); }
  const myChats = [...byChat.entries()].filter(([, a]) => a.user > 0);
  s.chats = myChats.length;

  const month = Array(12).fill(0), weekday = Array(7).fill(0), hour = Array(24).fill(0); const days = new Set();
  for (const m of mine) { const p = dayParts(m.time, utc); month[p.mo]++; weekday[p.wd]++; hour[p.h]++; days.add(dayKey(p)); }
  const argmax = (a) => a.reduce((bi, v, i) => (v > a[bi] ? i : bi), 0);
  s.activeDays = days.size;
  s.month = month; s.weekday = weekday; s.hour = hour;
  s.busiestMonth = MONTHS[argmax(month)]; s.busiestWeekday = WEEKDAYS[argmax(weekday)]; s.busiestHour = argmax(hour);
  const sorted = [...days].sort((a, b) => a - b); let run = 0, best = 0, prev = null;
  for (const d of sorted) { run = prev !== null && d === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  s.longestStreak = best;

  let longest = null;
  for (const [id, a] of myChats) if (!longest || a.all > longest.messages) longest = { id, messages: a.all, title: chatTitle.get(id)?.title || "Untitled chat" };
  s.longestChat = longest;
  s.avgPerChat = Math.round((mine.length / myChats.length) * 10) / 10;

  const late = myChats.filter(([, a]) => { const h = dayParts(a.first, utc).h; return h < 5; }).length;
  const early = myChats.filter(([, a]) => { const h = dayParts(a.first, utc).h; return h >= 5 && h < 8; }).length;
  s.lateNightShare = late / myChats.length; s.earlyShare = early / myChats.length;
  s.weekendShare = (weekday[0] + weekday[6]) / mine.length;

  s.politeCount = mine.reduce((n, m) => n + (m.text.match(POLITE) || []).length, 0);
  s.wordsTyped = mine.reduce((n, m) => n + wordCount(m.text), 0);
  s.wordsRead = replies.reduce((n, m) => n + wordCount(m.text), 0);
  s.novels = Math.round((s.wordsRead / 90000) * 10) / 10; // a typical novel is about 90,000 words

  s.topTopics = topTopics(myChats.map(([id, a]) => (chatTitle.get(id)?.title || "") + " " + a.text.join(" ")));
  const codeChats = myChats.filter(([, a]) => words(a.text.join(" ")).some((w) => CODE_WORDS.has(w))).length;
  s.codeShare = codeChats / myChats.length;

  const prov = new Map();
  for (const m of mine) prov.set(m.provider, (prov.get(m.provider) || 0) + 1);
  s.providers = [...prov.entries()].sort((a, b) => b[1] - a[1]).map(([key, count]) => ({ key, name: PROVIDERS[key] || key, count, share: count / mine.length }));
  s.persona = persona(s);
  return s;
}

/** Fixed rules, first match wins. The label is the shareable hook, so each one has a line that explains it. */
export const PERSONAS = [
  { name: "The Two-Timer", why: "You split your year between AIs and never fully committed.", test: (s) => s.providers.length > 1 && s.providers[0].share <= 0.7 },
  { name: "The Night Owl", why: "Your best ideas show up after midnight.", test: (s) => s.lateNightShare >= 0.25 },
  { name: "The Debugger", why: "Errors, stack traces, one more fix. Your AI is your rubber duck.", test: (s) => s.codeShare >= 0.35 },
  { name: "The Rabbit Hole", why: "You never ask one question. You ask twelve.", test: (s) => s.avgPerChat >= 12 },
  { name: "The Daily Ritual", why: "Three weeks in a row, at least. AI is part of the routine.", test: (s) => s.longestStreak >= 21 },
  { name: "The Charmer", why: "Please and thank you, again and again. When the robots take over, you are safe.", test: (s) => s.politeCount / s.messagesSent >= 0.2 },
  { name: "The Early Riser", why: "Questions with the first coffee.", test: (s) => s.earlyShare >= 0.25 },
  { name: "The Weekend Thinker", why: "Saturdays and Sundays are for the big questions.", test: (s) => s.weekendShare >= 0.45 },
  { name: "The One-Liner", why: "In, answer, out. Straight to the point.", test: (s) => s.avgPerChat <= 2 },
  { name: "The All-Rounder", why: "A bit of everything. No one habit wins.", test: () => true },
];
export function persona(s) { const p = PERSONAS.find((x) => x.test(s)); return { name: p.name, why: p.why }; }

export const fmt = (n) => Math.round(n).toLocaleString("en-US");
export const hourLabel = (h) => (h === 0 ? "12 am" : h < 12 ? `${h} am` : h === 12 ? "12 pm" : `${h - 12} pm`);
export const pct = (x) => `${Math.round(x * 100)}%`;
