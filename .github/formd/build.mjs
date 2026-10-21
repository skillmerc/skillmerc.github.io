// Runs in GitHub Actions (skillmerc/skillmerc.github.io): collect new SEC Form D filings, rebuild /form-d/ pages, patch sitemap.xml.
import fs from 'node:fs'; import path from 'node:path';
import { parseHit, parseFormD } from './formd.js';
import { renderFormD } from './render.mjs';
const BASE = 'https://skillmerc.github.io'; const ROOT = process.cwd(); const DATA = path.join(ROOT, '_data/formd');
const nod = s => String(s||'').replace(/\u2014/g,'-').replace(/\u2013/g,'-');
const esc = s => nod(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const css=`body{font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;margin:0;color:#1a1f2b;background:#fafafa}header,footer{background:#0b1f3a;color:#fff;padding:14px 20px}header a,footer a{color:#fff;text-decoration:none;font-weight:600}main{max-width:860px;margin:0 auto;padding:24px 20px 48px;background:#fff}h1{font-size:1.9em;line-height:1.25}a{color:#0b5fd1}.cta{display:inline-block;background:#19c37d;color:#fff!important;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;margin:6px 8px 6px 0}.cta.alt{background:#0b1f3a}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}.card{border:1px solid #e3e6ec;border-radius:8px;padding:14px;background:#fff}.card h3{margin:.2em 0 .4em;font-size:1.05em}.card p{margin:0;font-size:.92em;color:#444}.price{color:#0b1f3a;font-weight:600;font-size:.9em}pre{background:#f3f4f7;padding:12px;overflow:auto;border-radius:6px;font-size:.85em}code{font-size:.9em}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:4px 8px}img.icon{width:56px;height:56px;border-radius:10px;float:right;margin-left:12px}`;
const pages = [];
function page(rel, title, desc, body){
  const url = BASE + '/' + rel.replace(/index\.html$/,'');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><style>${css}</style></head><body><header><a href="/">SKILLMERC tools</a></header><main>${nod(body)}</main><footer>SKILLMERC (Pty) Ltd, South Africa. Contact: <a href="mailto:kyle@skillmerc.com">kyle@skillmerc.com</a></footer></body></html>`;
  const f = path.join(ROOT, rel); fs.mkdirSync(path.dirname(f),{recursive:true}); fs.writeFileSync(f, html); pages.push(url);
}
const UA = 'skillmerc-site/0.1 (kyle@skillmerc.com)'; const GAP = 140; let next = 0;
async function sec(url, json) {
  for (let a = 1; a <= 4; a++) {
    const w = Math.max(0, next - Date.now()); next = Math.max(Date.now(), next) + GAP; if (w) await new Promise(r => setTimeout(r, w));
    try { const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: json ? 'application/json' : 'application/xml' } });
      if (r.status === 404) return null; if (!r.ok) throw new Error('HTTP ' + r.status); return json ? r.json() : r.text(); }
    catch (e) { if (a === 4) { console.error('fail', url, e.message); return null; } await new Promise(r => setTimeout(r, 1000 * a * a)); }
  }
}
const ymd = d => d.toISOString().slice(0, 10);
fs.mkdirSync(DATA, { recursive: true });
// Refresh today and the previous 2 weekdays (late filings land on the filing day's index).
const todo = []; for (let i = 0; todo.length < 3 && i < 10; i++) { const d = new Date(Date.now() - i * 86400000); if (![0, 6].includes(d.getUTCDay())) todo.push(ymd(d)); }
for (const day of todo) {
  const hits = [];
  for (let from = 0; from < 2000; from += 100) {
    const j = await sec(`https://efts.sec.gov/LATEST/search-index?forms=D&dateRange=custom&startdt=${day}&enddt=${day}&from=${from}`, true);
    const pg = j?.hits?.hits || []; hits.push(...pg); if (!pg.length || from + 100 >= (j?.hits?.total?.value || 0)) break;
  }
  const f = path.join(DATA, day + '.json');
  const old = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
  const known = new Map((old?.rows || []).map(r => [r.accession, r]));
  const seen = new Set(); const rows = [];
  for (const h of hits.map(parseHit).filter(h => h.accession && h.cik && h.filing_date === day && h.form === 'D')) {
    if (seen.has(h.accession)) continue; seen.add(h.accession);
    if (known.has(h.accession)) { rows.push(known.get(h.accession)); continue; }
    const xml = await sec(`https://www.sec.gov/Archives/edgar/data/${h.cik}/${h.accession.replace(/-/g, '')}/${h.doc}`, false);
    if (!xml) continue;
    const d = parseFormD(xml);
    if (d.is_amendment) continue;
    rows.push({ accession: h.accession, cik: h.cik, name: d.company_name || h.display_name, city: d.city, state: d.state, state_name: d.state_name,
      industry: d.industry_group, pooled: d.industry_group === 'Pooled Investment Fund' || !!d.pooled_fund_type, entity_type: d.entity_type,
      year_inc: d.year_of_incorporation, new_co: d.incorporated_within_five_years, exemptions: d.exemption_labels, first_sale: d.date_of_first_sale,
      offering: d.total_offering_amount, indefinite: d.offering_amount_indefinite, sold: d.total_amount_sold, investors: d.number_of_investors, min_inv: d.minimum_investment,
      securities: d.securities_offered, revenue: d.revenue_range });
  }
  if (!rows.length && old?.rows?.length) continue; // never replace good data with an empty fetch
  fs.writeFileSync(f, JSON.stringify({ day, collected_at: new Date().toISOString(), total_hits: hits.length, rows }));
  console.log(day, 'hits', hits.length, 'new filings', rows.length);
}
// Keep 60 days of pages.
const files = fs.readdirSync(DATA).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().reverse();
for (const f of files.slice(60)) { fs.rmSync(path.join(DATA, f)); fs.rmSync(path.join(ROOT, 'form-d', f.replace('.json', '')), { recursive: true, force: true }); }
const fdDays = files.slice(0, 60).map(f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'))).filter(d => d.rows.length);
const lastmod = renderFormD({ fdDays, page, esc, BASE });
// Patch sitemap: drop old /form-d/ entries, add current ones.
const smf = path.join(ROOT, 'sitemap.xml');
let sm = fs.readFileSync(smf, 'utf8').replace(/<url><loc>https:\/\/skillmerc\.github\.io\/form-d\/[^<]*<\/loc>(<lastmod>[^<]*<\/lastmod>)?<\/url>\n?/g, '');
sm = sm.replace('</urlset>', pages.map(u => `<url><loc>${u}</loc><lastmod>${lastmod[u] || ymd(new Date())}</lastmod></url>`).join('\n') + '\n</urlset>');
fs.writeFileSync(smf, sm);
console.log('pages', pages.length);
