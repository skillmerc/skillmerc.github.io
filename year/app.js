// The page. Everything happens in this tab: no network code at all, and the page's CSP blocks connections anyway.
import { readExports, ERROR_WORDS } from "./loader.js";
import { computeStats, yearsIn, defaultYear, MIN_MESSAGES } from "./stats.js";
import { storyScreens } from "./story.js";
import { cardOps, drawCard, canvasMeasure } from "./card.js";
import { shareLine } from "./share.js";

const $ = (id) => document.getElementById(id);
let merged = null, stats = null, screens = [], at = 0;

function notice(kind, title, body) {
  const n = $("notice"); n.replaceChildren();
  if (!title) return;
  const box = document.createElement("div"); box.className = `sk-notice sk-notice--${kind}`;
  const t = document.createElement("p"); t.className = "sk-notice__title"; t.textContent = title;
  const b = document.createElement("p"); b.className = "sk-notice__body"; b.textContent = body;
  box.append(t, b); n.append(box);
}

function show(id) { for (const s of ["start", "story", "final"]) $(s).hidden = s !== id; window.scrollTo(0, 0); }

async function handle(files) {
  if (!files.length) return;
  notice("info", `Reading ${files.length === 1 ? files[0].name : files.length + " files"}...`, "Big exports can take a few seconds. Nothing is uploaded.");
  let res;
  try { res = await readExports([...files]); } catch (e) { const w = ERROR_WORDS["read-failed"]; notice("error", w[0], w[1]); return; }
  if (!res.merged) { const e = res.errors[0]; const w = ERROR_WORDS[e.code] || ERROR_WORDS.unknown; notice("error", w[0], w[1]); return; }
  merged = res.merged;
  const ys = yearsIn(merged);
  const sel = $("year"); sel.replaceChildren(...ys.map((y) => { const o = document.createElement("option"); o.value = y.year; o.textContent = y.year; return o; }));
  const y = defaultYear(merged); sel.value = y;
  if (res.errors.length) notice("warning", `Read ${files.length - res.errors.length} of ${files.length} files.`, `${res.errors.map((e) => e.name).join(", ")}: ${(ERROR_WORDS[res.errors[0].code] || ERROR_WORDS.unknown)[0]}`);
  else notice();
  start(y);
}

function start(year) {
  stats = computeStats(merged, Number(year));
  if (!stats.enough) {
    show("start");
    const others = yearsIn(merged).filter((y) => y.count >= MIN_MESSAGES).map((y) => y.year);
    notice("warning", `Only ${stats.messagesSent} message${stats.messagesSent === 1 ? "" : "s"} in ${year}: not enough for a recap.`,
      others.length ? `Try ${others.join(" or ")} in the year list, or add another export.` : `A recap needs at least ${MIN_MESSAGES} of your messages in one year. Add another export, or come back after a few more chats.`);
    if (others.length) { $("year").value = others[0]; }
    return;
  }
  screens = storyScreens(stats); at = 0; show("story"); render();
}

function render() {
  const s = screens[at];
  $("kicker").textContent = s.kicker; $("big").textContent = s.big; $("line").textContent = s.line; $("sub").textContent = s.sub;
  $("screen").dataset.key = s.key;
  $("big").classList.toggle("ay-big--word", !/^[\d,.\s]+(am|pm)?$/.test(s.big));
  $("dots").replaceChildren(...screens.map((_, i) => { const d = document.createElement("span"); if (i <= at) d.className = "is-on"; return d; }));
  $("prev").disabled = at === 0;
  $("next").textContent = at === screens.length - 1 ? "See my card" : "Next";
}

async function paintCard() {
  const c = $("card"), ctx = c.getContext("2d");
  try { await Promise.all(['800 100px "SK Geist"', '500 40px "SK Geist Mono"'].map((f) => document.fonts.load(f))); } catch {}
  drawCard(ctx, cardOps(stats, canvasMeasure(ctx), { showTopics: $("topics").checked }));
  fillShare();
}

function fillShare() {
  $("share-text").value = shareLine(stats, { showTopics: $("topics").checked });
  copied(false);
}

function copied(on, words = "Copied") {
  const b = $("copy-share"); b.textContent = on ? words : "Copy"; b.dataset.state = on ? "copied" : "";
  $("share-status").textContent = on ? (words === "Copied" ? "Post line copied." : "Post line selected. Press Ctrl+C or Cmd+C to copy it.") : "";
}

async function copyShare() {
  const t = $("share-text"), text = t.value;
  try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); copied(true); setTimeout(() => copied(false), 2500); return; } } catch {}
  t.focus(); t.select(); t.setSelectionRange(0, text.length);
  let ok = false; try { ok = document.execCommand("copy"); } catch {}
  copied(true, ok ? "Copied" : "Selected");
  setTimeout(() => copied(false), 2500);
}

function download() {
  $("card").toBlob((blob) => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `my-ai-year-${stats.year}.png`;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, "image/png");
}

function wire() {
  const drop = $("drop");
  $("file").addEventListener("change", (e) => handle(e.target.files));
  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("is-over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("is-over"));
  drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("is-over"); handle(e.dataTransfer.files); });
  $("next").addEventListener("click", () => { if (at < screens.length - 1) { at++; render(); } else { show("final"); paintCard(); } });
  $("prev").addEventListener("click", () => { if (at > 0) { at--; render(); } });
  $("year").addEventListener("change", (e) => start(e.target.value));
  $("topics").addEventListener("change", paintCard);
  $("download").addEventListener("click", download);
  $("copy-share").addEventListener("click", copyShare);
  $("share-text").addEventListener("focus", (e) => e.target.select());
  $("again").addEventListener("click", () => { at = 0; show("story"); render(); });
  $("reset").addEventListener("click", () => { merged = null; $("file").value = ""; notice(); show("start"); });
  document.addEventListener("keydown", (e) => { if ($("story").hidden) return; if (e.key === "ArrowRight") $("next").click(); if (e.key === "ArrowLeft") $("prev").click(); });
}

wire();
