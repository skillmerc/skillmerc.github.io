// The story: 6 screens, one stat each, then the card. Pure: returns words, the app puts them on screen.
import { fmt, hourLabel, pct } from "./stats.js";

export function storyScreens(s) {
  const plural = (n, one, many) => `${fmt(n)} ${n === 1 ? one : many}`;
  const screens = [
    { key: "messages", kicker: `Your ${s.year} with AI`, big: fmt(s.messagesSent), line: `messages sent, across ${plural(s.chats, "chat", "chats")}.`,
      sub: s.wordsRead > 0 ? `You read about ${fmt(s.wordsRead)} words of replies${s.novels >= 1 ? `: ${s.novels} novels' worth` : ""}.` : `You typed ${fmt(s.wordsTyped)} words.` },
    { key: "days", kicker: "Showing up", big: fmt(s.activeDays), line: `days with at least one chat.`,
      sub: s.longestStreak > 1 ? `Longest streak: ${fmt(s.longestStreak)} days in a row.` : `No two days in a row in ${s.year}.` },
    { key: "when", kicker: "Your peak", big: hourLabel(s.busiestHour), line: `is your busiest hour.`,
      sub: `Busiest day: ${s.busiestWeekday}. Busiest month: ${s.busiestMonth}.` },
    { key: "topics", kicker: "On your mind", big: s.topTopics[0] || "A bit of everything", line: s.topTopics.length > 1 ? `then ${s.topTopics.slice(1).join(", ")}.` : s.topTopics.length === 1 ? "was the word that kept coming back." : "No one word kept coming back.",
      sub: s.lateNightShare > 0 ? `${pct(s.lateNightShare)} of your chats started between midnight and 5 am.` : "Not one chat started between midnight and 5 am." },
    { key: "longest", kicker: "The marathon", big: fmt(s.longestChat?.messages || 0), line: `messages in your longest chat: "${clip(s.longestChat?.title || "Untitled chat", 60)}".`,
      sub: s.politeCount > 0 ? `You said please or thank you ${plural(s.politeCount, "time", "times")}.` : "You never once said please. Bold." },
  ];
  if (s.providers.length > 1) {
    const [a, b] = s.providers;
    screens.push({ key: "providers", kicker: "Your main AI", big: a.name, line: `got ${pct(a.share)} of your messages.`,
      sub: `${b.name} got ${fmt(b.count)} on the side${s.providers[2] ? `, ${s.providers[2].name} ${fmt(s.providers[2].count)}` : ""}.` });
  }
  screens.push({ key: "persona", kicker: "Your AI type", big: s.persona.name, line: s.persona.why, sub: "Your card is next." });
  return screens;
}

export function clip(t, n) { t = String(t).replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n - 3).trimEnd() + "..." : t; }
