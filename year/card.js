// The share card: 1080 x 1920 (a phone story). cardOps() is pure layout and returns draw operations, so tests can
// check every word fits; drawCard() runs them on a canvas. Colours are the kit's dark theme (tokens.css), copied
// here because a canvas cannot read CSS variables; test/card.test.mjs checks they still match the kit.
import { fmt, hourLabel } from "./stats.js";

export const W = 1080, H = 1920, PAD = 80;
export const COLORS = {
  bg: "#050506", surface: "#121215", line: "#2a2a30", lineStrong: "#6b6b75",
  text: "#f5f5f6", muted: "#a8a8b2", accent: "#f27aa8", accentSoft: "#2e1220", mark: "#ff5a36",
  providers: { chatgpt: "#4fc4b5", claude: "#ff6a48", gemini: "#6aa8f2" },
};
export const FONT = '"SK Geist", Geist, system-ui, sans-serif';
export const MONO = '"SK Geist Mono", "Geist Mono", ui-monospace, monospace';
export const SHORT_URL = "skillmerc.com/year"; // the hosted address (site/gen.mjs copies dist/ to /year/, task 1880)

/** Fit text into maxWidth: shrink down to minSize, then cut with "...". */
export function fit(text, size, minSize, maxWidth, measure, weight = 700, font = FONT) {
  let s = size;
  while (s > minSize && measure(text, s, weight, font) > maxWidth) s -= 4;
  let t = text;
  while (measure(t, s, weight, font) > maxWidth && t.length > 1) t = t.slice(0, -4).trimEnd() + "...";
  return { text: t, size: s };
}

/** Wrap text into at most maxLines lines of maxWidth. */
export function wrap(text, size, maxWidth, maxLines, measure, weight = 400, font = FONT) {
  const out = []; let line = "";
  for (const w of String(text).split(/\s+/).filter(Boolean)) {
    const next = line ? line + " " + w : w;
    if (measure(next, size, weight, font) <= maxWidth || !line) line = next; else { out.push(line); line = w; }
  }
  if (line) out.push(line);
  if (out.length > maxLines) { out.length = maxLines; out[maxLines - 1] = out[maxLines - 1].replace(/\s*\S+$/, "") + "..."; }
  return out.map((l) => fit(l, size, size, maxWidth, measure, weight, font).text);
}

export function cardOps(s, measure, { showTopics = true } = {}) {
  const C = COLORS, inner = W - PAD * 2, ops = [];
  const rect = (x, y, w, h, fill) => ops.push({ type: "rect", x, y, w, h, fill });
  const box = (x, y, w, h, stroke, lw = 3) => ops.push({ type: "stroke", x, y, w, h, stroke, lw });
  const text = (t, x, y, size, color, o = {}) => ops.push({ type: "text", text: t, x, y, size, color, weight: o.weight ?? 400, font: o.font ?? FONT, align: o.align ?? "left", maxWidth: o.maxWidth ?? inner });

  rect(0, 0, W, H, C.bg);
  rect(0, 0, W, 20, C.accent);
  text(`MY AI YEAR ${s.year}`, PAD, 150, 36, C.accent, { font: MONO, weight: 500 });

  let y = 270;
  for (const l of wrap(s.persona.name, 120, inner, 2, measure, 800)) { text(l, PAD, y, 120, C.text, { weight: 800 }); y += 128; }
  y += 10;
  for (const l of wrap(s.persona.why, 40, inner, 2, measure)) { text(l, PAD, y, 40, C.muted); y += 54; }

  y += 40;
  const gap = 20, bw = (inner - gap) / 2, bh = 200;
  const cells = [
    [fmt(s.messagesSent), "messages sent"], [fmt(s.activeDays), "active days"],
    [fmt(s.longestStreak), "longest streak, days"], [hourLabel(s.busiestHour), "busiest hour"],
  ];
  cells.forEach(([big, label], i) => {
    const x = PAD + (i % 2) * (bw + gap), by = y + Math.floor(i / 2) * (bh + gap);
    rect(x, by, bw, bh, C.surface); box(x, by, bw, bh, C.line);
    const f = fit(big, 96, 56, bw - 80, measure, 800);
    text(f.text, x + 40, by + 115, f.size, C.text, { weight: 800, maxWidth: bw - 80 });
    text(label, x + 40, by + 165, 32, C.muted, { maxWidth: bw - 80 });
  });
  y += bh * 2 + gap + 70;

  if (showTopics && s.topTopics.length) {
    text("TOP TOPICS", PAD, y, 32, C.muted, { font: MONO, weight: 500 }); y += 66;
    s.topTopics.slice(0, 5).forEach((t, i) => {
      text(String(i + 1), PAD, y, 48, C.accent, { weight: 800, maxWidth: 60 });
      const f = fit(t, 50, 34, inner - 80, measure, 700);
      text(f.text, PAD + 80, y, f.size, C.text, { weight: 700, maxWidth: inner - 80 });
      y += 62;
    });
    y += 20;
  }

  if (s.providers.length > 1) {
    text("MAIN AI", PAD, y, 32, C.muted, { font: MONO, weight: 500 }); y += 36;
    let x = PAD;
    s.providers.forEach((p, i) => { const w = i === s.providers.length - 1 ? PAD + inner - x : Math.round(inner * p.share); rect(x, y, w, 36, C.providers[p.key] || C.lineStrong); x += w; });
    y += 90;
    const legend = s.providers.map((p) => `${p.name} ${Math.round(p.share * 100)}%`).join("   ");
    const f = fit(legend, 38, 28, inner, measure, 500);
    text(f.text, PAD, y, f.size, C.text, { weight: 500 });
  } else if (s.providers[0]) {
    text("MAIN AI", PAD, y, 32, C.muted, { font: MONO, weight: 500 }); y += 64;
    text(s.providers[0].name, PAD, y, 56, C.text, { weight: 700 });
  }

  rect(PAD, H - 160, inner, 3, C.line);
  // The kit mark (same shapes as the footer svg, 32 units drawn at 30 px).
  const mk = 30 / 32, mx = PAD, my = H - 104;
  ops.push({ type: "rrect", x: mx, y: my, w: 30, h: 30, r: 7 * mk, fill: C.bg, stroke: C.line });
  ops.push({ type: "circle", x: mx + 14 * mk, y: my + 18 * mk, r: 10.2 * mk, fill: C.text });
  ops.push({ type: "circle", x: mx + 23.4 * mk, y: my + 9.2 * mk, r: 6.2 * mk, fill: C.bg });
  ops.push({ type: "circle", x: mx + 23.4 * mk, y: my + 9.2 * mk, r: 4.5 * mk, fill: C.mark });
  text("Made by SKILLMERC", PAD + 44, H - 76, 36, C.text, { weight: 600, maxWidth: inner / 2 });
  text(SHORT_URL, W - PAD, H - 76, 36, C.muted, { align: "right", font: MONO, maxWidth: inner / 2 });
  return ops;
}

export function drawCard(ctx, ops) {
  for (const o of ops) {
    if (o.type === "rect") { ctx.fillStyle = o.fill; ctx.fillRect(o.x, o.y, o.w, o.h); }
    else if (o.type === "circle") { ctx.fillStyle = o.fill; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill(); }
    else if (o.type === "rrect") { ctx.fillStyle = o.fill; ctx.beginPath(); ctx.roundRect(o.x, o.y, o.w, o.h, o.r); ctx.fill(); ctx.strokeStyle = o.stroke; ctx.lineWidth = 1; ctx.stroke(); }
    else if (o.type === "stroke") { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw; ctx.strokeRect(o.x + o.lw / 2, o.y + o.lw / 2, o.w - o.lw, o.h - o.lw); }
    else if (o.type === "text") { ctx.font = `${o.weight} ${o.size}px ${o.font}`; ctx.fillStyle = o.color; ctx.textAlign = o.align; ctx.textBaseline = "alphabetic"; ctx.fillText(o.text, o.x, o.y); }
  }
}

/** A measure function backed by a real canvas context. */
export const canvasMeasure = (ctx) => (t, size, weight, font) => { ctx.font = `${weight} ${size}px ${font}`; return ctx.measureText(t).width; };
