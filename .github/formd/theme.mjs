// SKILLMERC site theme ("Hg"). Shared by gen.mjs (local build) and the Form D GitHub Action.
// Exports: render(rel,title,desc,body), reshell(rel,html), homeBody(ctx), guidesBody(), copyAssets(out).
// Page copy for content pages lives in gen.mjs and the help-*/ folders. This file owns the shell, the homepage,
// the product heroes on hub pages and the /guides/ index. Node builtins only.
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const BASE = 'https://skillmerc.com';
const nod = s => String(s ?? '').replace(/\u2014/g, '-').replace(/\u2013/g, '-');
const esc = s => nod(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

let _v;
const ver = () => { if (_v) return _v; const h = crypto.createHash('sha1'); let n = 0;
  for (const dir of [path.join(HERE, 'static/assets'), path.join(process.cwd(), 'assets')]) { if (!fs.existsSync(dir)) continue; for (const f of ['site.css', 'site.js', 'merc.js']) { const p = path.join(dir, f); if (fs.existsSync(p)) { h.update(fs.readFileSync(p)); n++; } } if (n) break; }
  return (_v = n ? h.digest('hex').slice(0, 8) : '1'); };

// ---------- marks ----------
const ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 8h11M9 3.5 13.5 8 9 12.5"/></svg>';
const ARROW_UP = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const ARROW_DN = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2.5v11M3.5 9 8 13.5 12.5 9"/></svg>';
const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="lg-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#c3c7ce"/><stop offset=".52" stop-color="#4a4f58"/><stop offset=".66" stop-color="#a2a8b1"/><stop offset="1" stop-color="#f6f7f8"/></linearGradient><radialGradient id="lg-r" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#ff936f"/><stop offset=".42" stop-color="#f0431c"/><stop offset="1" stop-color="#96200a"/></radialGradient><mask id="lg-m"><rect width="32" height="32" fill="#fff"/><circle cx="24.6" cy="7.9" r="7" fill="#000"/></mask></defs><circle cx="13.6" cy="18.2" r="11.8" fill="url(#lg-c)" mask="url(#lg-m)"/><circle cx="24.6" cy="7.9" r="5.1" fill="url(#lg-r)"/></svg>';
const brand = `<a class="brand" href="/" aria-label="SKILLMERC home">${LOGO}<span>SKILLMERC</span></a>`;
const R = (n) => `/assets/r/${n}.webp`;

// ---------- catalogue ----------
const WP = (slug) => `https://wordpress.org/plugins/${slug}/`;
const AMO = (slug) => `https://addons.mozilla.org/firefox/addon/${slug}/`;
const PRO_SHIP = 'https://checkout.freemius.com/plugin/43024/plan/74888/licenses/1/';
const CATS = {
  shipping: { label: 'Shipping', n: '01', a: '/#shipping' }, payments: { label: 'Payments', n: '02', a: '/#payments' },
  books: { label: 'Bookkeeping', n: '03', a: '/#books' }, tables: { label: 'Web tables', n: '04', a: '/#tables' },
  data: { label: 'Data', n: '05', a: '/#data' }, more: { label: 'SKILLMERC', n: '', a: '/' },
};
// hub pages: first URL segment -> product meta. `hero` turns the header into a full product hero.
const HUBS = {
  'sa-shipping-woocommerce': { cat: 'shipping', name: 'Shipping for WooCommerce', form: 1, r: 'parcel', hero: true,
    tag: 'Real courier prices. <em class="hg">Zero copy&#8209;paste.</em>',
    say: 'Shoppers see live The Courier Guy and Fastway rates at checkout, or pick a Pudo locker or PAXI point. Pro books The Courier Guy and prints the label from the order.',
    facts: ['Free plugin', '*Pro USD 49 a year', 'Checkout block ready'],
    cta: [['Get it free', WP('skillmerc-shipping-courier-guy-pudo-paxi'), 'up'], ['Get Pro', PRO_SHIP, 'up']],
    promo: ['Live courier rates, locker pickers and one-click labels.', 'Get it free', WP('skillmerc-shipping-courier-guy-pudo-paxi')] },
  'payfast-woocommerce': { cat: 'payments', name: 'PayFast for WooCommerce', form: 2, r: 'coin', hero: true,
    tag: 'Get paid. <em class="hg">The order updates itself.</em>',
    say: 'Card, instant EFT, SnapScan and Mobicred through PayFast. Every payment notice is checked before the order is marked paid.',
    facts: ['Free', 'PayFast hosted checkout', 'Signed ITN checks'],
    cta: [['Get it free', WP('skillmerc-payment-gateway-for-payfast'), 'up'], ['Fix a PayFast problem', '/payfast-woocommerce/help/', '']],
    promo: ['Card and EFT payments that mark orders paid by themselves.', 'Get it free', WP('skillmerc-payment-gateway-for-payfast')] },
  'sage-accounting-woocommerce': { cat: 'books', name: 'WooCommerce to Sage Accounting', form: 3, r: 'ledger', hero: true,
    tag: 'Every sale, <em class="hg">already in Sage.</em>',
    say: 'Each paid order becomes a customer, a sales invoice with the right VAT and a payment in Sage Accounting. No retyping at month end.',
    facts: ['Free', 'Sage Accounting UK', 'Failed sends retry'],
    cta: [['Get it free', WP('skillmerc-sync-for-sage-accounting'), 'up'], ['Setup guide', '/sage-accounting-woocommerce/help/send-woocommerce-orders-to-sage-accounting/', '']],
    promo: ['Paid orders become Sage invoices with the right VAT.', 'Get it free', WP('skillmerc-sync-for-sage-accounting')] },
  'freeagent-woocommerce': { cat: 'books', name: 'WooCommerce to FreeAgent', form: 3, r: 'ledger', hero: true,
    tag: 'Every sale, <em class="hg">already in FreeAgent.</em>',
    say: 'Each paid order becomes a contact, an invoice with the VAT rate per line and a payment, so it shows as paid in FreeAgent. No retyping.',
    facts: ['Free', 'FreeAgent', 'Keys stay on your site'],
    cta: [['Get it free', WP('skillmerc-sync-for-freeagent'), 'up'], ['Setup guide', '/freeagent-woocommerce/help/send-woocommerce-orders-to-freeagent/', '']],
    promo: ['Paid orders become FreeAgent invoices with the right VAT.', 'Get it free', WP('skillmerc-sync-for-freeagent')] },
  'shopify-freeagent': { cat: 'books', name: 'Ledgerline', form: 3, r: 'ledger',
    promo: ['Paid Shopify orders into FreeAgent, with VAT. Coming soon.', 'Get the launch email', '#notify'] },
  'shopify-sage-accounting': { cat: 'books', name: 'Shopify to Sage Accounting', form: 3, r: 'ledger', hero: true,
    tag: 'Shopify sales, <em class="hg">into Sage.</em>',
    say: 'Your options for getting Shopify orders into Sage Accounting today, and what Ledgerline for Sage UK will do.',
    facts: ['Guide', 'Ledgerline coming soon'], cta: [] },
  'list-table-scraper': { cat: 'tables', name: 'List & Table Scraper', form: 4, r: 'window', hero: true,
    tag: 'Any web table. <em class="hg">Into Excel.</em>',
    say: 'One click finds the rows on a page. It follows the Next button and exports CSV, Excel or JSON. Nothing leaves your browser.',
    facts: ['Free up to 3 pages', '*Pro up to 500 pages', 'From USD 4 a month'],
    cta: [['Add to Firefox, free', AMO('list-table-scraper'), 'up'], ['Watch the demo', '#demo', 'dn']],
    promo: ['Any table or list on the web, into Excel in one click.', 'Add to Firefox, free', AMO('list-table-scraper')] },
  privacy: { cat: 'tables', name: 'Privacy', form: 4 },
  apify: { cat: 'data', name: 'Data tools', form: 5, r: 'grid', link: '/#data',
    promo: ['11 scrapers and monitors on Apify. Pay only for the rows you get.', 'Browse on Apify', 'https://apify.com/skillmerc'] },
  'form-d': { cat: 'data', name: 'Form D filings', form: 5 },
  guides: { cat: 'more', name: 'Guides', form: 6 },
  'decision-log-confluence': { cat: 'more', name: 'Decision Keeper for Confluence', form: 3 },
  'ship-rules': { cat: 'more', name: 'Ship Rules for Jira', form: 0 }, closewell: { cat: 'more', name: 'Closewell', form: 0, link: '/closewell/install/' },
};
const CARDS = [
  { k: 'sa-shipping-woocommerce', m: 'Shipping', b: 'Shipping for WooCommerce', p: 'Live courier rates and one-click labels.', ft: 'Free / Pro', r: 'parcel', href: '/sa-shipping-woocommerce/' },
  { k: 'shopify-freeagent', m: 'Bookkeeping', b: 'Ledgerline for Shopify', p: 'Paid Shopify orders into FreeAgent, with VAT. Coming soon.', ft: 'Coming soon', r: 'ledger', href: '/shopify-freeagent/' },
  { k: 'list-table-scraper', m: 'Web tables', b: 'List & Table Scraper', p: 'Any web table or list into Excel in one click.', ft: 'Free / Pro', r: 'window', href: '/list-table-scraper/' },
  { k: 'payfast-woocommerce', m: 'Payments', b: 'PayFast for WooCommerce', p: 'Card and EFT payments that mark orders paid by themselves.', ft: 'Free', r: 'coin', href: '/payfast-woocommerce/' },
  { k: 'sage-accounting-woocommerce', m: 'Bookkeeping', b: 'WooCommerce to Sage', p: 'Paid orders become Sage invoices with the right VAT.', ft: 'Free', r: 'ledger', href: '/sage-accounting-woocommerce/' },
  { k: 'freeagent-woocommerce', m: 'Bookkeeping', b: 'WooCommerce to FreeAgent', p: 'Paid orders become FreeAgent invoices with the right VAT.', ft: 'Free', r: 'ledger', href: '/freeagent-woocommerce/' },
  { k: 'form-d', m: 'Data', b: 'Who raised money this week', p: 'New SEC Form D filings, largest first. Updated daily.', ft: 'Free', r: 'grid', href: '/form-d/' },
];
const GUIDE_GROUPS = [['sa-shipping-woocommerce', 'Shipping in South Africa'], ['payfast-woocommerce', 'PayFast'], ['shopify-freeagent', 'Shopify and FreeAgent'], ['list-table-scraper', 'Web tables to spreadsheets'], ['sage-accounting-woocommerce', 'WooCommerce and Sage'], ['freeagent-woocommerce', 'WooCommerce and FreeAgent']];

const registry = [];

// ---------- shared chrome ----------
const head = ({ title, desc, url, extra = '' }) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:site_name" content="SKILLMERC"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${BASE}/assets/og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#08090b"><meta name="color-scheme" content="dark"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/touch.png"><link rel="preload" href="/assets/fonts/geist.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/fraunces-italic.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/site.css?v=${ver()}"><script>document.documentElement.classList.add('js')</script>${extra}</head>`;
const navHtml = () => `<a class="skip" href="#main">Skip to content</a><header class="nav"><div class="wrap nav-in">${brand}<span class="clock mono" aria-hidden="true"><i></i><span data-clock>Pretoria</span></span><button class="burger" aria-label="Menu" aria-expanded="false"><i></i><i></i></button><nav class="nav-links" aria-label="Main"><a href="/#kit">Tools</a><a href="/guides/">Guides</a><a href="https://apify.com/skillmerc">Data</a><a class="pill" href="mailto:kyle@skillmerc.com">Contact</a></nav></div></header>`;
const footHtml = () => `<footer class="foot"><div class="wrap"><div class="foot-grid">
<div class="foot-about">${brand}<p>The boring parts, handled. Plugins and tools for online stores, bookkeeping and public data.</p><p>SKILLMERC (Pty) Ltd, South Africa.<br><a href="mailto:kyle@skillmerc.com">kyle@skillmerc.com</a></p></div>
<div><h5>Tools</h5><ul><li><a href="/sa-shipping-woocommerce/">Shipping for WooCommerce</a></li><li><a href="/payfast-woocommerce/">PayFast for WooCommerce</a></li><li><a href="/sage-accounting-woocommerce/">WooCommerce to Sage</a></li><li><a href="/freeagent-woocommerce/">WooCommerce to FreeAgent</a></li><li><a href="/shopify-freeagent/">Ledgerline for Shopify</a></li><li><a href="/list-table-scraper/">List &amp; Table Scraper</a></li><li><a href="${AMO('transcript-pull-for-youtube')}">Transcript Pull</a></li></ul></div>
<div><h5>Data and help</h5><ul><li><a href="/#data">Data tools on Apify</a></li><li><a href="/form-d/">Form D filings this week</a></li><li><a href="/guides/">All guides</a></li><li><a href="/payfast-woocommerce/help/">PayFast fixes</a></li><li><a href="/shopify-sage-accounting/">Shopify to Sage</a></li></ul></div>
<div><h5>Elsewhere</h5><ul><li><a href="https://profiles.wordpress.org/skillmerc/">WordPress.org</a></li><li><a href="https://apify.com/skillmerc">Apify</a></li><li><a href="https://www.youtube.com/@skillmerc">YouTube</a></li><li><a href="/privacy/list-table-scraper/">Privacy: List &amp; Table Scraper</a></li><li><a href="/privacy/transcript-pull/">Privacy: Transcript Pull</a></li><li><a href="/shopify-freeagent/privacy/">Privacy: Ledgerline</a></li></ul></div>
</div><div class="wordmark" aria-hidden="true">SKILLMERC</div><div class="foot-base"><span>&copy; <span data-year>2026</span> SKILLMERC (Pty) Ltd</span><span class="mono">Hg &middot; 80 &middot; 25.75&deg; S 28.23&deg; E</span></div></div></footer>`;
const scripts = (merc) => `${merc ? `<script src="/assets/merc.js?v=${ver()}" defer></script>` : ''}<script src="/assets/site.js?v=${ver()}" defer></script>`;
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const btn = ([label, href, dir], cls) => `<a class="btn ${cls}${dir ? ' ' + dir : ''}" href="${href}"${/^https?:/.test(href) ? ' rel="noopener"' : ''}>${esc(label)} ${dir === 'up' ? ARROW_UP : dir === 'dn' ? ARROW_DN : ARROW}</a>`;
const facts = (list) => `<ul class="facts">${list.map(f => f.startsWith('*') ? `<li class="hot">${esc(f.slice(1))}</li>` : `<li>${esc(f)}</li>`).join('')}</ul>`;
const tcard = (c) => `<a class="tcard" href="${c.href}" data-rv><div class="pic"><img src="${R(c.r)}" alt="" width="1000" height="1000" loading="lazy"></div><div class="tx"><span class="mono">${esc(c.m)}</span><b>${esc(c.b)}</b><p>${esc(c.p)}</p><div class="ft"><span class="mono">${esc(c.ft)}</span><span class="go">${ARROW}</span></div></div></a>`;

// ---------- content page shell ----------
function docPage(rel, title, desc, body) {
  const url = BASE + '/' + rel.replace(/index\.html$/, '');
  const segs = rel.replace(/\/?index\.html$/, '').split('/').filter(Boolean);
  const hub = HUBS[segs[0]] || { cat: 'more', name: 'SKILLMERC', form: 0 }; const cat = CATS[hub.cat];
  const isHub = segs.length === 1 && hub.hero; const isGuide = segs[1] === 'help' && segs.length > 2;
  let rest = nod(body); let h1;
  const m = rest.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (m) { h1 = m[1]; rest = rest.replace(m[0], ''); } else h1 = esc(title);
  if (segs[0] === 'list-table-scraper' && segs.length === 1) rest = rest.replace('<div style="position:relative;padding-bottom:56.25%', '<div id="demo" style="position:relative;padding-bottom:56.25%');
  registry.push({ rel, segs, h1: strip(h1), url: '/' + rel.replace(/index\.html$/, '') });
  const crumbs = [['Home', '/']];
  if (hub.cat !== 'more') crumbs.push([cat.label, cat.a]);
  if (segs.length > 1 && !['privacy'].includes(segs[0])) crumbs.push([hub.name, hub.link || `/${segs[0]}/`]);
  if (isGuide) crumbs.push(['Guide', '/guides/']);
  const here = strip(h1); crumbs.push([here.length > 54 ? here.slice(0, 52).replace(/\s+\S*$/, '') + '...' : here, null]);
  const crumbHtml = `<ol class="crumbs mono">${crumbs.map(([t, h]) => `<li>${h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol>`;
  const bl = ld({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map(([t, h], i) => ({ '@type': 'ListItem', position: i + 1, name: nod(t), item: h ? BASE + h : url })) });
  const wide = segs[0] === 'form-d' || segs[0] === 'guides';
  const words = strip(rest).split(' ').length;
  const meta = isGuide ? [`${Math.max(2, Math.round(words / 220))} min read`, hub.name] : segs[0] === 'apify' ? ['Runs on Apify', 'Pay per result'] : [];
  let band;
  if (isHub) {
    band = `<header class="band tall"><canvas id="merc" data-form="${hub.form}" data-side="band" aria-hidden="true"></canvas><div class="wrap">${crumbHtml}<h1>${h1}</h1><p class="display" data-wipe>${hub.tag}</p><p class="say" data-rv style="--d:2">${esc(hub.say)}</p><div data-rv style="--d:3">${facts(hub.facts)}</div>${hub.cta.length ? `<div class="row-ctas" data-rv style="--d:4">${hub.cta.map((c, i) => btn(c, i ? 'btn-ghost' : 'btn-cin')).join('')}</div>` : ''}</div><div class="scrolldown mono"><span>Details</span><i></i></div></header>`;
  } else {
    band = `<header class="band"><canvas id="merc" data-form="${hub.form}" data-side="band" aria-hidden="true"></canvas><div class="wrap">${crumbHtml}<h1>${h1}</h1>${meta.length ? `<div class="meta">${meta.map(x => `<span>${esc(x)}</span>`).join('')}</div>` : ''}</div></header>`;
  }
  const promo = !isHub && hub.promo && hub.r ? `<a class="promo" href="${hub.promo[2]}"${/^https?:/.test(hub.promo[2]) ? ' rel="noopener"' : ''}><img src="${R(hub.r)}" alt="" width="1000" height="1000" loading="lazy"><span class="mono">The tool for this</span><b>${esc(hub.name)}</b><p>${esc(hub.promo[0])}</p><span class="tlink">${esc(hub.promo[1])} ${ARROW_UP}</span></a>` : '';
  const pick = CARDS.filter(c => c.k !== segs[0]).slice(0, 3);
  const more = `<section class="more"><div class="wrap"><div class="more-head"><h2 class="h2" style="font-size:clamp(2rem,4vw,3.6rem)">More from <em class="hg">the kit.</em></h2><a class="tlink" href="/#kit">All tools ${ARROW}</a></div><div class="tcards">${pick.map(tcard).join('')}</div></div></section>`;
  return `${head({ title, desc, url, extra: bl })}<body class="doc"><div class="grain" aria-hidden="true"></div>${navHtml()}<main id="main">${band}<div class="wrap doc-grid${wide ? ' wide' : ''}"><article class="prose"${wide ? '' : ' data-toc'}>${rest}</article>${wide ? '' : `<aside class="side">${promo}</aside>`}</div>${more}</main>${footHtml()}${scripts(true)}</body></html>`;
}

// ---------- homepage ----------
const money = n => n == null ? '' : n >= 1e9 ? '$' + (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? '$' + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e3 ? '$' + Math.round(n / 1e3) + 'K' : '$' + n;
const longDate = day => new Date(day + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const scene = ({ i, side, id, rail, n, label, plat, h2, say, fx, ctas, also = '' }) => `<section class="scene" id="${id}" data-stage="${i}" data-side="${side}" data-rail="${rail}"><span class="ghost" aria-hidden="true">${n}</span><div class="wrap"><div class="scene-in"><div class="tag mono" data-rv><b>${n}</b><i></i><span>${label}</span><i></i><span>${plat}</span></div><h2 data-wipe style="--d:1">${h2}</h2><p class="say" data-rv style="--d:2">${say}</p><div data-rv style="--d:3">${facts(fx)}</div><div class="row-ctas" data-rv style="--d:4">${ctas.map((c, k) => btn(c, k ? 'btn-ghost' : 'btn-bone')).join('')}</div>${also ? `<p class="also" data-rv style="--d:5">${also}</p>` : ''}</div></div></section>`;

export function homeBody({ actors = [], priceLine = () => '', fdDays = [] } = {}) {
  const guides = registry.filter(r => r.segs[1] === 'help' && r.segs.length > 2);
  const per1k = actors.map(a => (String(priceLine(a)).match(/USD ([\d.]+) per 1,000/) || [])[1]).filter(Boolean).sort((x, y) => x - y);
  const minPrice = per1k.length ? per1k[0] : null;
  const kit = [
    ['01', 'Shipping', 'Live courier rates at checkout. Labels in one click.', 'WooCommerce', 'Free / Pro', '#shipping', 'parcel'],
    ['02', 'Payments', 'Card and EFT payments that mark orders paid by themselves.', 'WooCommerce', 'Free', '#payments', 'coin'],
    ['03', 'Bookkeeping', 'Every paid order lands in Sage or FreeAgent with the right VAT.', 'WooCommerce, Shopify', 'Free / Soon', '#books', 'ledger'],
    ['04', 'Web tables', 'Any table or list on the web, into Excel in one click.', 'Firefox', 'Free / Pro', '#tables', 'window'],
    ['05', 'Data', 'Company filings, funding rounds and transcripts, by the row.', 'Apify', 'Pay per row', '#data', 'grid'],
  ];
  let formd = '';
  const day = fdDays.find(d => d.rows && d.rows.some(r => !r.pooled && r.sold));
  if (day) {
    const ops = day.rows.filter(r => !r.pooled).sort((a, b) => (b.sold || 0) - (a.sold || 0)); const top = ops.slice(0, 5);
    formd = `<div class="slab" data-rv><div class="slab-head"><div><div class="live mono"><i></i>Free list &middot; updated daily</div><h3 style="margin-top:12px">Who raised money on ${longDate(day.day)}</h3></div><a class="btn btn-ghost" href="/form-d/">See this week ${ARROW}</a></div>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Company</th><th class="hide-s">Where</th><th class="hide-s">Industry</th><th class="n">Raised so far</th></tr></thead><tbody>${top.map(r => `<tr><td>${esc(r.name)}</td><td class="hide-s">${esc([r.city, r.state].filter(Boolean).join(', '))}</td><td class="hide-s">${esc(r.industry || '')}</td><td class="n">${money(r.sold)}</td></tr>`).join('')}</tbody></table></div></div>`;
  }
  const dlist = `<div class="slab" data-rv><div class="slab-head"><h3>All ${actors.length} data tools</h3><p>Run on Apify. Pay per result.</p></div><div class="dlist">${actors.map(a => `<a href="/apify/${a.name}/"><b>${esc(a.title.split(' - ')[0])}</b><span>${esc((String(priceLine(a)).match(/USD [\d.]+ per 1,000/) || ['Apify'])[0])}</span></a>`).join('')}</div></div>`;
  const pickG = ['payfast-order-still-pending', 'courier-guy-no-shipping-method', 'wikipedia-table-to-excel', 'freeagent-shopify-integration-discontinued', 'pudo-woocommerce', 'importhtml-not-working'];
  const glinks = pickG.map(s => guides.find(g => g.segs[2] === s)).filter(Boolean).concat(guides).filter((g, i, a) => a.indexOf(g) === i).slice(0, 6);
  const groupName = (seg) => (GUIDE_GROUPS.find(g => g[0] === seg) || [, 'Guide'])[1];

  return `<canvas id="merc" aria-hidden="true"></canvas><div class="peek" aria-hidden="true"><img alt="" src="${R('parcel')}"></div>
<div class="rail" aria-hidden="true"><span class="lbl mono">Intro</span><div class="tube"><div class="hgcol"></div><div class="ticks"></div></div><div class="bulb"></div></div>
<section class="hero" data-stage="0" data-side="right" data-rail="Intro">
<span class="anno tl mono">Fig. 01 &middot; Quicksilver, mid-pour</span><span class="anno tr mono">Hg &middot; 80 &middot; Liquid at room temperature</span>
<div class="wrap">
<h1><span class="ln"><span>The boring</span></span><span class="ln" style="--d:1"><span>parts, <em class="hg">handled.</em></span></span></h1>
<p class="lede">Plugins and tools that <b>take payments, book couriers, keep the books and pull data</b> for you. Most are free.</p>
<div class="row-ctas">${btn(['Explore the kit', '#kit', 'dn'], 'btn-cin')}${btn(['Talk to a human', 'mailto:kyle@skillmerc.com', ''], 'btn-ghost')}</div>
</div>
<div class="hero-foot"><div class="wrap"><ul class="stats"><li><b>4</b><span class="mono">WordPress plugins</span></li><li><b>2</b><span class="mono">Browser add-ons</span></li><li><b>${actors.length}</b><span class="mono">Data tools</span></li><li><b>${guides.length}</b><span class="mono">How-to guides</span></li></ul><div class="coords mono">25.75&deg; S, 28.23&deg; E<br>Made in South Africa</div></div></div>
</section>

<section class="kit" id="kit" data-rail="The kit"><div class="wrap">
<div class="kit-head"><h2 class="h2" data-wipe>The <em class="hg">kit.</em></h2><p data-rv>Five jobs you can stop doing by hand. Pick one.</p></div>
<div class="rows">${kit.map(([n, nm, ds, pl, pr, href, r], i) => `<a href="${href}" data-peek="${R(r)}" data-rv style="--d:${i}"><span class="n mono">${n}</span><span class="nm">${nm}</span><span class="ds">${ds}</span><span class="pl mono">${pl}</span><span class="pr mono">${pr}</span><span class="go">${ARROW_DN}</span></a>`).join('')}</div>
</div></section>

${scene({ i: 1, side: 'left', id: 'shipping', rail: 'Shipping', n: '01', label: 'Shipping', plat: 'WooCommerce', h2: 'Real courier prices. <em class="hg">Zero copy&#8209;paste.</em>',
  say: 'Shoppers see live The Courier Guy and Fastway rates, or pick a Pudo locker or PAXI point. Pro books The Courier Guy and prints the label from the order.',
  fx: ['Free plugin', '*Pro USD 49 a year', 'South Africa'], ctas: [['Get it free', WP('skillmerc-shipping-courier-guy-pudo-paxi'), 'up'], ['How it works', '/sa-shipping-woocommerce/', '']] })}
${scene({ i: 2, side: 'right', id: 'payments', rail: 'Payments', n: '02', label: 'Payments', plat: 'WooCommerce', h2: 'Get paid. <em class="hg">The order updates itself.</em>',
  say: 'Card, instant EFT, SnapScan and Mobicred through PayFast. Every payment notice is checked before the order is marked paid.',
  fx: ['Free', 'PayFast', 'Signed ITN checks'], ctas: [['Get it free', WP('skillmerc-payment-gateway-for-payfast'), 'up'], ['PayFast fixes', '/payfast-woocommerce/help/', '']] })}
${scene({ i: 3, side: 'left', id: 'books', rail: 'Books', n: '03', label: 'Bookkeeping', plat: 'Sage &middot; FreeAgent', h2: 'Every sale, <em class="hg">already in the books.</em>',
  say: 'Paid orders become invoices with the right VAT, plus the payment, in Sage or FreeAgent. No retyping at month end.',
  fx: ['Free for WooCommerce', 'Sage Accounting', 'FreeAgent'], ctas: [['Sage plugin', '/sage-accounting-woocommerce/', ''], ['FreeAgent plugin', '/freeagent-woocommerce/', '']],
  also: 'On Shopify? FreeAgent switched off its own Shopify link in 2025. <a href="/shopify-freeagent/">Ledgerline</a> is coming to fill it.' })}
${scene({ i: 4, side: 'right', id: 'tables', rail: 'Tables', n: '04', label: 'Web tables', plat: 'Firefox', h2: 'Any web table. <em class="hg">Into Excel.</em>',
  say: 'List &amp; Table Scraper finds the rows in one click, follows the Next button and exports CSV, Excel or JSON. Nothing leaves your browser.',
  fx: ['Free up to 3 pages', '*Pro up to 500', 'From USD 4 a month'], ctas: [['Add to Firefox, free', AMO('list-table-scraper'), 'up'], ['Watch the demo', '/list-table-scraper/#demo', '']],
  also: 'Need YouTube transcripts instead? <a href="' + AMO('transcript-pull-for-youtube') + '">Transcript Pull</a> does that, free.' })}
${scene({ i: 5, side: 'left', id: 'data', rail: 'Data', n: '05', label: 'Data', plat: 'Apify', h2: 'Public data, <em class="hg">by the row.</em>',
  say: 'Company filings, funding rounds, transcripts and car listings, pulled straight into a spreadsheet. Pay only for the rows you get.',
  fx: [`${actors.length} data tools`, minPrice != null ? `From USD ${minPrice} per 1,000 rows` : 'Pay per result', 'Nothing to install'], ctas: [['Browse on Apify', 'https://apify.com/skillmerc', 'up'], ['Who raised money this week', '/form-d/', '']] })}
${formd}
${dlist}

<div class="slab" id="guides" data-rail="Guides" style="margin-top:14px"><div class="slab-head"><h2 class="h2" data-wipe style="font-size:clamp(2.2rem,4.4vw,4.2rem)">Stuck? <em class="hg">Read the fix.</em></h2><p data-rv>${guides.length} short guides for the errors stores actually hit.</p></div>
<ul class="glinks">${glinks.map(g => `<li data-rv><a href="${g.url}">${esc(g.h1)}<span>${esc(groupName(g.segs[0]))}</span></a></li>`).join('')}</ul>
<div class="row-ctas" style="margin-top:30px">${btn(['All guides', '/guides/', ''], 'btn-ghost')}</div></div>

<section class="scene contact" id="contact" data-stage="6" data-side="center" data-rail="Contact"><div class="wrap"><div class="scene-in"><div class="tag mono" data-rv><b>06</b><i></i><span>Contact</span></div><h2 data-wipe style="--d:1">Got a boring job <em class="hg">for us?</em></h2><p data-rv style="--d:2"><a class="mail" href="mailto:kyle@skillmerc.com">kyle@skillmerc.com</a></p><p class="say" data-rv style="--d:3">Questions, bugs, or a tool you wish existed. A person reads every email.</p></div></div></section>`;
}

export function guidesBody() {
  const guides = registry.filter(r => r.segs[1] === 'help' && r.segs.length > 2);
  const groups = GUIDE_GROUPS.map(([seg, label]) => { const gs = guides.filter(g => g.segs[0] === seg); if (!gs.length) return ''; return `<section class="glist"><h2>${esc(label)} <span>${String(gs.length).padStart(2, '0')}</span></h2><ul class="glinks">${gs.map(g => `<li><a href="${g.url}">${esc(g.h1)}<span>Read</span></a></li>`).join('')}</ul></section>`; }).join('');
  return `<h1>Guides</h1><p>Short, practical fixes for the problems online stores hit most: payments stuck on pending, missing shipping methods, VAT that is a penny out, tables that will not paste. Most apply whichever plugin you use.</p>${groups}`;
}

function homePage(rel, title, desc, body) {
  const org = ld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': BASE + '/#org', name: 'SKILLMERC', legalName: 'SKILLMERC (Pty) Ltd', url: BASE + '/', email: 'kyle@skillmerc.com', logo: BASE + '/assets/touch.png', address: { '@type': 'PostalAddress', addressCountry: 'ZA' }, sameAs: ['https://profiles.wordpress.org/skillmerc/', 'https://apify.com/skillmerc', 'https://www.youtube.com/@skillmerc', 'https://github.com/skillmerc'] },
    { '@type': 'WebSite', '@id': BASE + '/#site', url: BASE + '/', name: 'SKILLMERC', publisher: { '@id': BASE + '/#org' } }] });
  return `${head({ title, desc, url: BASE + '/', extra: org + `<link rel="preload" href="/assets/r/parcel.webp" as="image">` })}<body class="home"><div class="grain" aria-hidden="true"></div>${navHtml()}<main id="main">${nod(body)}</main>${footHtml()}${scripts(true)}</body></html>`;
}

export function notFoundBody() {
  return `<canvas id="merc" data-form="6" data-side="center" aria-hidden="true"></canvas><section class="lost"><div class="wrap"><div class="num">404</div><h1 class="h2" style="margin-top:14px">This page <em class="hg">evaporated.</em></h1><p style="color:var(--bone2);max-width:30em;margin:18px auto 30px">The link is old or mistyped. Everything we make is one click from the front page.</p><div class="row-ctas" style="justify-content:center">${btn(['Back to the front page', '/', ''], 'btn-cin')}${btn(['Browse the guides', '/guides/', ''], 'btn-ghost')}</div></div></section>`;
}

/** Render any page. Same signature as the old gen.mjs template. */
export function render(rel, title, desc, body) {
  if (rel === 'index.html') return homePage(rel, title, desc, body);
  if (rel === '404.html') return `${head({ title, desc, url: BASE + '/404.html', extra: '<meta name="robots" content="noindex">' })}<body class="home"><div class="grain" aria-hidden="true"></div>${navHtml()}<main id="main">${body}</main>${footHtml()}${scripts(true)}</body></html>`;
  return docPage(rel, title, desc, body);
}

/** Re-shell an already published page that uses an older template (static pages kept outside gen.mjs). */
export function reshell(rel, html) {
  const headPart = html.split(/<body[^>]*>/)[0] || '';
  if (/http-equiv/i.test(headPart) || /<script/i.test(headPart)) return null;
  const t = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || 'SKILLMERC'; const d = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const m = html.match(/<main[^>]*>([\s\S]*)<\/main>/) || html.match(/<body[^>]*>([\s\S]*)<\/body>/); if (!m) return null;
  const un = s => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  return docPage(rel, un(t), un(d), m[1]);
}

/** Copy theme assets into the build output and write the theme's root files. */
export function copyAssets(out) {
  const src = path.join(HERE, 'static/assets'); const walk = (d, rel = '') => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p, rel + f + '/'); else { const o = path.join(out, 'assets', rel + f); fs.mkdirSync(path.dirname(o), { recursive: true }); fs.copyFileSync(p, o); } } };
  walk(src);
  fs.writeFileSync(path.join(out, 'favicon.svg'), LOGO.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(' aria-hidden="true"', ''));
  fs.writeFileSync(path.join(out, '404.html'), render('404.html', 'Page not found: SKILLMERC', 'This page does not exist.', notFoundBody()));
}
