// SKILLMERC site theme ("quicksilver and cinnabar"). Shared by gen.mjs (local build) and the Form D GitHub Action.
// Exports: render(rel,title,desc,body) -> full HTML for any page, homeBody(ctx), notFoundBody(), copyAssets(out), extras(out, BASE).
// No dependencies beyond node builtins. Page copy lives in gen.mjs and the help-*/ folders; this file owns the shell and the homepage.
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const BASE = 'https://skillmerc.com';
const nod = s => String(s ?? '').replace(/\u2014/g, '-').replace(/\u2013/g, '-');
const esc = s => nod(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

// ---------- asset version (cache busting) ----------
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

// Liquid-metal icon system: plain strokes and dots, poured into chrome by two SVG filters.
const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<filter id="q-ch" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.15" result="b"/><feColorMatrix in="b" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 18 -7.5" result="goo"/><feGaussianBlur in="goo" stdDeviation="1.7" result="h"/><feDiffuseLighting in="h" surfaceScale="6.5" diffuseConstant="1.1" lighting-color="#fff" result="dl"><feDistantLight azimuth="255" elevation="36"/></feDiffuseLighting><feComponentTransfer in="dl" result="ch"><feFuncR type="table" tableValues=".03 .07 .16 .74 .2 .1 .42 .88 1"/><feFuncG type="table" tableValues=".03 .075 .17 .76 .21 .11 .44 .9 1"/><feFuncB type="table" tableValues=".04 .09 .2 .8 .25 .13 .48 .93 1"/></feComponentTransfer><feSpecularLighting in="h" surfaceScale="6.5" specularConstant="1.25" specularExponent="34" lighting-color="#fff" result="sp"><feDistantLight azimuth="232" elevation="60"/></feSpecularLighting><feComposite in="sp" in2="ch" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="lit"/><feComposite in="lit" in2="goo" operator="in"/></filter>
<filter id="q-cn" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1" result="b"/><feColorMatrix in="b" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 18 -7.5" result="goo"/><feGaussianBlur in="goo" stdDeviation="1.7" result="h"/><feDiffuseLighting in="h" surfaceScale="6" diffuseConstant="1.2" lighting-color="#fff" result="dl"><feDistantLight azimuth="250" elevation="42"/></feDiffuseLighting><feComponentTransfer in="dl" result="ch"><feFuncR type="table" tableValues=".3 .55 .82 .95 1"/><feFuncG type="table" tableValues=".02 .07 .17 .27 .42"/><feFuncB type="table" tableValues="0 .01 .04 .08 .16"/></feComponentTransfer><feSpecularLighting in="h" surfaceScale="6" specularConstant="1.1" specularExponent="30" lighting-color="#ffe9df" result="sp"><feDistantLight azimuth="232" elevation="60"/></feSpecularLighting><feComposite in="sp" in2="ch" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="lit"/><feComposite in="lit" in2="goo" operator="in"/></filter>
</defs></svg>`;
const L = (d) => `<path d="${d}"/>`, DOT = (x, y, r = 3.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="none"/>`;
const ICONS = {
  payfast: [`<rect x="6" y="12" width="36" height="25" rx="6"/>${L('M6 21h36')}${L('M13 30h8')}`, DOT(34, 30)],
  shipping: [`${L('M24 6 40 14v19L24 42 8 33V14Z')}${L('M8 14l16 8 16-8')}${L('M24 22v20')}`, DOT(33, 30.5, 3.2)],
  sync: [`${L('M11 21a13.5 13.5 0 0 1 24-5')}${L('M37 27a13.5 13.5 0 0 1-24 5')}${L('M35 8v8h-8')}${L('M13 40v-8h8')}`, DOT(24, 24, 4)],
  doc: [`${L('M13 6h15l8 8v24a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4Z')}${L('M17 22h13')}${L('M17 29h13')}`, DOT(19, 36, 3.2)],
  ledger: [`${L('M9 13h24')}${L('M13 24h26')}${L('M9 35h24')}`, DOT(40, 13, 4)],
  bag: [`${L('M11 16h26l2 22a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4Z')}${L('M17 20v-6a7 7 0 0 1 14 0v6')}`, DOT(24, 31, 4)],
  window: [`<rect x="6" y="8" width="36" height="32" rx="6"/>${L('M6 18h36')}${L('M13 26h13')}${L('M13 33h9')}`, DOT(34, 29.5, 4)],
  play: [`${L('M29 13h12')}${L('M29 23h12')}${L('M8 35h33')}`, `<path d="M9 9.5 22 18 9 26.5Z" fill="#fff" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>`],
  guide: [`<circle cx="24" cy="24" r="16"/>${L('M12.5 12.5 18 18M35.5 12.5 30 18M12.5 35.5 18 30M35.5 35.5 30 30')}`, DOT(24, 24, 5.5)],
  building: [`${L('M7 17 24 7l17 10')}${L('M13 23v12')}${L('M24 23v12')}${L('M35 23v12')}${L('M7 41h34')}`, ''],
  buildingAlert: [`${L('M7 19 22 10l8 4.5')}${L('M13 25v10')}${L('M24 25v10')}${L('M35 25v10')}${L('M7 41h34')}`, DOT(38, 11, 4.6)],
  filing: [`${L('M13 6h15l8 8v24a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4Z')}${L('M17 20h6')}${L('M17 27h13')}${L('M17 34h13')}`, ''],
  filingAlert: [`${L('M27 7H13a4 4 0 0 0-4 4v27a4 4 0 0 0 4 4h19a4 4 0 0 0 4-4V21')}${L('M17 24h11')}${L('M17 32h11')}`, DOT(36, 10, 4.8)],
  bars: [`${L('M11 39v-8')}${L('M22 39V23')}${L('M33 39V15')}`, DOT(40, 8, 4.2)],
  clock: [`${L('M9 24a15 15 0 1 0 5-11')}${L('M8 8v7h7')}${L('M24 15v9l6 4')}`, ''],
  at: [`${L('M31 24a7 7 0 1 1-7-7c4 0 7 3 7 7v3c0 5 9 5 9-3A16 16 0 1 0 31 38')}`, DOT(24, 24, 3.4)],
  trend: [`${L('M6 36 17 25l8 6 12-15')}${L('M6 42h36')}`, DOT(39, 13, 4.6)],
  mail: [`<rect x="6" y="11" width="36" height="26" rx="6"/>${L('M8 15 24 27l16-12')}`, DOT(39, 36, 4.6)],
  car: [`${L('M6 30v-4l5-2 4-9h17l5 9 5 2v6')}${L('M21 32h6')}`, `${DOT(14, 33, 4.4)}`, `<circle cx="34" cy="33" r="4.4" fill="#fff" stroke="none"/>`],
  drop: [`${L('M24 7c7 9 11 14 11 20a11 11 0 0 1-22 0c0-6 4-11 11-20Z')}`, DOT(24, 28, 4)],
};
export const icon = (name) => { const i = ICONS[name] || ICONS.drop; return `<svg class="sig" viewBox="0 0 48 48" aria-hidden="true"><g filter="url(#q-ch)" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${i[0]}${i[2] || ''}</g>${i[1] ? `<g filter="url(#q-cn)" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${i[1]}</g>` : ''}</svg>`; };

// ---------- catalogue ----------
const WP = (slug) => `https://wordpress.org/plugins/${slug}/`;
const AMO = (slug) => `https://addons.mozilla.org/firefox/addon/${slug}/`;
const CATS = {
  commerce: { label: 'Commerce', form: 1, n: '01' },
  accounting: { label: 'Accounting', form: 2, n: '02' },
  browser: { label: 'Browser', form: 3, n: '03' },
  data: { label: 'Data', form: 4, n: '04' },
  more: { label: 'SKILLMERC', form: 5, n: '' },
};
const HUBS = {
  'payfast-woocommerce': ['PayFast for WooCommerce', 'commerce', true], 'sa-shipping-woocommerce': ['South African shipping for WooCommerce', 'commerce', true],
  'sage-accounting-woocommerce': ['WooCommerce to Sage Accounting', 'accounting', true], 'freeagent-woocommerce': ['WooCommerce to FreeAgent', 'accounting', true],
  'shopify-freeagent': ['Ledgerline', 'accounting', true], 'shopify-sage-accounting': ['Shopify to Sage Accounting', 'accounting', true],
  'list-table-scraper': ['List & Table Scraper', 'browser', true], threadkeep: ['Threadkeep', 'browser', true], privacy: ['Privacy', 'browser', false],
  apify: ['Data actors', 'data', false], 'form-d': ['Form D filings', 'data', true],
  'decision-log-confluence': ['Decision Keeper for Confluence', 'more', true], closewell: ['Closewell', 'more', false], 'ship-rules': ['Ship Rules', 'more', true],
};
const PRODUCTS = [
  { cat: 'commerce', icon: 'payfast', tag: 'Free', title: 'PayFast gateway for WooCommerce', href: '/payfast-woocommerce/', foot: 'WordPress plugin · South Africa',
    desc: 'Card, instant EFT, SnapScan and Mobicred through PayFast\'s hosted payment page, with signed ITN checks on every notification.' },
  { cat: 'commerce', icon: 'shipping', tag: 'Free + Pro', cin: true, title: 'The Courier Guy, Fastway, Pudo and PAXI shipping', href: '/sa-shipping-woocommerce/', foot: 'WordPress plugin · Pro USD 49 a year',
    desc: 'Live The Courier Guy and Fastway rates, a Pudo locker picker and a PAXI point picker, on the Checkout block and the classic checkout.' },
  { cat: 'commerce', icon: 'guide', tag: 'Guides', title: 'PayFast troubleshooting', href: '/payfast-woocommerce/help/', foot: 'Works with any PayFast plugin',
    desc: 'Orders stuck on pending, ITN invalid signature, passphrase mismatch, a bad source IP behind Cloudflare, refunds.' },
  { cat: 'accounting', icon: 'sync', tag: 'Free', title: 'WooCommerce to Sage Accounting', href: '/sage-accounting-woocommerce/', foot: 'WordPress plugin · Sage Accounting UK',
    desc: 'Every paid order becomes a customer, a sales invoice with VAT per line and a payment in Sage Accounting. Failed sends retry.' },
  { cat: 'accounting', icon: 'doc', tag: 'Free', title: 'WooCommerce to FreeAgent', href: '/freeagent-woocommerce/', foot: 'WordPress plugin · FreeAgent',
    desc: 'Paid orders land in FreeAgent as a contact, an invoice with the VAT rate per line and a payment, so the invoice shows as paid.' },
  { cat: 'accounting', icon: 'ledger', tag: 'Coming soon', soon: true, title: 'Ledgerline: Shopify to FreeAgent', href: '/shopify-freeagent/', foot: 'Shopify app · launch email on the page',
    desc: 'FreeAgent switched off its Shopify integration on 30 April 2025. Ledgerline sends paid Shopify orders to FreeAgent as invoices with VAT, with refunds as credit notes.' },
  { cat: 'accounting', icon: 'bag', tag: 'Coming soon', soon: true, title: 'Shopify to Sage Accounting', href: '/shopify-sage-accounting/', foot: 'Guide · Ledgerline for Sage UK',
    desc: 'Your options for getting Shopify sales into Sage Accounting today, and what Ledgerline for Sage UK will do.' },
  { cat: 'browser', icon: 'window', tag: 'Free + Pro', cin: true, title: 'List & Table Scraper', href: '/list-table-scraper/', foot: 'Firefox add-on',
    desc: 'Finds the tables, lists and product grids on any page and exports them to CSV, Excel or JSON. Follows Next buttons and infinite scroll.' },
  { cat: 'browser', icon: 'doc', tag: 'In review', soon: true, title: 'Threadkeep: chat exporter for DeepSeek', href: '/threadkeep/', foot: 'Browser extension · Firefox in review, Chrome soon',
    desc: 'Saves the DeepSeek chat you have open as Markdown, text, JSON, PDF or Word. Everything stays in your browser. Not affiliated with DeepSeek.' },
  { cat: 'browser', icon: 'play', tag: 'Free + Pro', title: 'Transcript Pull for YouTube', href: AMO('transcript-pull-for-youtube'), ext: true, foot: 'Firefox add-on',
    desc: 'Get the transcript of any YouTube video: read, search, copy, or download it as a TXT file. Pro adds SRT, VTT, Markdown, JSON and playlist ZIP export.' },
];
const ACTOR_ICON = { 'companies-house-scraper': 'building', 'threads-posts-scraper': 'at', 'internet-archive-search-scraper': 'clock', 'sec-edgar-filings-scraper': 'filing', 'youtube-transcript-scraper-pro': 'play', 'cars-co-za-listings-scraper': 'car', 'companies-house-monitor': 'buildingAlert', 'sec-filing-alerts': 'filingAlert', 'google-trends-trending-monitor': 'trend', 'sec-form-d-funding-leads': 'bars', 'bulk-email-checker': 'mail' };
const GUIDE_GROUPS = [['sa-shipping-woocommerce', 'Shipping in South Africa'], ['payfast-woocommerce', 'PayFast'], ['shopify-freeagent', 'Shopify and FreeAgent'], ['list-table-scraper', 'Web tables to spreadsheets'], ['sage-accounting-woocommerce', 'WooCommerce and Sage'], ['freeagent-woocommerce', 'WooCommerce and FreeAgent']];

// every page rendered in this build, so the homepage can list the guides
const registry = [];

// ---------- shared chrome ----------
const head = ({ title, desc, url, home, extra = '' }) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:site_name" content="SKILLMERC"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${BASE}/assets/og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#0a0b0d"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/touch.png"><link rel="preload" href="/assets/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/geist.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/site.css?v=${ver()}"><script>document.documentElement.classList.add('js')</script>${extra}</head>`;
const navHtml = () => `<a class="skip" href="#main">Skip to content</a><header class="nav"><div class="wrap nav-in">${brand}<button class="burger" aria-label="Menu" aria-expanded="false"><i></i><i></i></button><nav class="nav-links" aria-label="Main"><a href="/#commerce">Commerce</a><a href="/#accounting">Accounting</a><a href="/#browser">Browser</a><a href="/#data">Data</a><a href="/#guides">Guides</a><a class="pill" href="mailto:kyle@skillmerc.com">Contact</a></nav></div></header>`;
const footHtml = () => `<footer class="foot"><div class="wrap"><div class="foot-grid">
<div class="foot-about">${brand}<p>Small, single-purpose software for online stores, bookkeeping and public data.</p><p>SKILLMERC (Pty) Ltd, South Africa.<br><a href="mailto:kyle@skillmerc.com">kyle@skillmerc.com</a></p></div>
<div><h5>Commerce</h5><ul><li><a href="/payfast-woocommerce/">PayFast for WooCommerce</a></li><li><a href="/sa-shipping-woocommerce/">Courier Guy, Fastway, Pudo, PAXI</a></li><li><a href="/payfast-woocommerce/help/">PayFast troubleshooting</a></li></ul></div>
<div><h5>Accounting</h5><ul><li><a href="/sage-accounting-woocommerce/">WooCommerce to Sage</a></li><li><a href="/freeagent-woocommerce/">WooCommerce to FreeAgent</a></li><li><a href="/shopify-freeagent/">Ledgerline for Shopify</a></li><li><a href="/shopify-sage-accounting/">Shopify to Sage</a></li></ul></div>
<div><h5>Browser and data</h5><ul><li><a href="/list-table-scraper/">List &amp; Table Scraper</a></li><li><a href="${AMO('transcript-pull-for-youtube')}">Transcript Pull for YouTube</a></li><li><a href="/#data">Apify data actors</a></li><li><a href="/form-d/">Form D filings this week</a></li></ul></div>
<div><h5>Elsewhere</h5><ul><li><a href="https://profiles.wordpress.org/skillmerc/">WordPress.org</a></li><li><a href="https://apify.com/skillmerc">Apify Store</a></li><li><a href="https://www.youtube.com/@skillmerc">YouTube</a></li><li><a href="/privacy/list-table-scraper/">Privacy: List &amp; Table Scraper</a></li><li><a href="/privacy/transcript-pull/">Privacy: Transcript Pull</a></li><li><a href="/shopify-freeagent/privacy/">Privacy: Ledgerline</a></li></ul></div>
</div><div class="wordmark" aria-hidden="true">SKILLMERC</div><div class="foot-base"><span>&copy; <span data-year>2026</span> SKILLMERC (Pty) Ltd</span><span>Small tools, one job each.</span></div></div></footer>`;
const scripts = (merc) => `${merc ? `<script src="/assets/merc.js?v=${ver()}" defer></script>` : ''}<script src="/assets/site.js?v=${ver()}" defer></script>`;
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

const card = (p, i = 0, span = 'c4') => `<a class="card ${span}" data-tilt data-rv style="--d:${i}" href="${p.href}"${p.ext ? ' rel="noopener"' : ''}><div class="card-top">${icon(p.icon)}<span class="tag${p.cin ? ' cin' : ''}${p.soon ? ' soon' : ''}">${esc(p.tag)}</span></div><h4>${esc(p.title)}</h4><p>${esc(p.desc)}</p><div class="card-foot"><span>${esc(p.foot)}</span><span class="go">${ARROW}</span></div></a>`;

// ---------- content page shell ----------
function docPage(rel, title, desc, body) {
  const url = BASE + '/' + rel.replace(/index\.html$/, '');
  const segs = rel.replace(/\/?index\.html$/, '').split('/').filter(Boolean);
  const hub = HUBS[segs[0]] || ['SKILLMERC', 'more', false]; const cat = CATS[hub[1]];
  // lift the first h1 into the band
  let h1 = title; let rest = nod(body);
  const m = rest.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (m) { h1 = m[1]; rest = rest.replace(m[0], ''); } else h1 = esc(title);
  registry.push({ rel, segs, h1: strip(h1), url: '/' + rel.replace(/index\.html$/, '') });
  const crumbs = [['Home', '/']];
  if (hub[1] !== 'more') crumbs.push([cat.label, '/#' + hub[1]]);
  if (segs.length > 1 || !hub[2]) crumbs.push([hub[0], hub[2] ? `/${segs[0]}/` : (hub[1] === 'more' ? '/' : '/#' + hub[1])]);
  if (segs[1] === 'help' && segs.length > 2) crumbs.push(['Guides', segs[0] === 'payfast-woocommerce' ? '/payfast-woocommerce/help/' : `/${segs[0]}/`]);
  const here = strip(h1); crumbs.push([here.length > 58 ? here.slice(0, 56).replace(/\s+\S*$/, '') + '...' : here, null]);
  const crumbHtml = `<ol class="crumbs mono">${crumbs.map(([t, h]) => `<li>${h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol>`;
  const bl = ld({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map(([t, h], i) => ({ '@type': 'ListItem', position: i + 1, name: nod(t), item: h ? BASE + h : url })) });
  const wide = segs[0] === 'form-d';
  const others = PRODUCTS.filter(p => p.cat === hub[1] && p.href !== `/${segs[0]}/`).slice(0, 3);
  const pick = others.length ? others : PRODUCTS.filter(p => ['shipping', 'ledger', 'window'].includes(p.icon));
  const next = `<section class="next"><div class="wrap"><div class="kicker mono"><b>${hub[1] === 'more' || !others.length ? 'SKILLMERC' : cat.label}</b><i></i><span>More tools</span></div><h2 class="h2">${others.length ? `Also in <em>${esc(cat.label.toLowerCase())}</em>` : `More from <em>the bench</em>`}</h2><div class="grid">${pick.map((p, i) => card(p, i)).join('')}</div></div></section>`;
  return `${head({ title, desc, url, extra: bl })}<body class="doc">${DEFS}${navHtml()}<main id="main"><header class="band"><div class="band-bg"></div><canvas id="merc" data-form="${cat.form}" data-side="right" aria-hidden="true"></canvas><div class="wrap">${crumbHtml}<h1>${h1}</h1></div></header><div class="wrap doc-grid${wide ? ' wide' : ''}"><article class="prose"${wide ? '' : ' data-toc'}>${rest}</article></div>${next}</main>${footHtml()}${scripts(true)}</body></html>`;
}

// ---------- homepage ----------
const money = n => n == null ? '' : n >= 1e9 ? '$' + (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? '$' + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e3 ? '$' + Math.round(n / 1e3) + 'K' : '$' + n;
const longDate = day => new Date(day + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const stage = (i, side, id, n, label, h2, p, cta = '') => `<section class="stage" id="${id}" data-stage="${i}" data-side="${side}"><div class="wrap"><div class="stage-in"><div class="kicker mono" data-rv><b>${n}</b><i></i><span>${label}</span></div><h2 data-rv style="--d:1">${h2}</h2><p data-rv style="--d:2">${p}</p>${cta ? `<div class="cta-row" data-rv style="--d:3">${cta}</div>` : ''}</div></div></section>`;

export function homeBody({ actors = [], priceLine = () => '', fdDays = [] } = {}) {
  const guides = registry.filter(r => r.segs[1] === 'help' && r.segs.length > 2);
  const by = (cat) => PRODUCTS.filter(p => p.cat === cat);
  const plugins = PRODUCTS.filter(p => /WordPress plugin/.test(p.foot)).length, addons = PRODUCTS.filter(p => /Firefox add-on/.test(p.foot)).length;
  const lts = PRODUCTS.find(p => p.icon === 'window'), tp = PRODUCTS.find(p => p.icon === 'play');
  const works = ['WooCommerce', 'Shopify', 'PayFast', 'The Courier Guy', 'Pudo', 'PAXI', 'Fastway', 'Sage Accounting', 'FreeAgent', 'Firefox', 'Apify', 'SEC EDGAR', 'Companies House'];
  const marq = `<ul${''}><li class="k">Works with</li>${works.map(w => `<li>${esc(w)}</li>`).join('')}</ul>`;

  // Form D live table
  let formd = '';
  const day = fdDays.find(d => d.rows && d.rows.some(r => !r.pooled && r.sold));
  if (day) {
    const ops = day.rows.filter(r => !r.pooled).sort((a, b) => (b.sold || 0) - (a.sold || 0)); const top = ops.slice(0, 6);
    formd = `<div class="tick c12" data-rv><div class="tick-head"><div><div class="live mono"><i></i>Free data page · updated daily</div><h4 style="margin-top:10px">Largest company raises filed with the SEC on ${longDate(day.day)}</h4></div><a class="btn btn-ghost" href="/form-d/">All Form D filings this week ${ARROW}</a></div>
<div style="overflow-x:auto"><table><thead><tr><th>Company</th><th class="hide-s">Location</th><th class="hide-s">Industry</th><th class="n">Sold so far</th><th class="n hide-s">Offering</th></tr></thead><tbody>${top.map(r => `<tr><td>${esc(r.name)}</td><td class="hide-s">${esc([r.city, r.state].filter(Boolean).join(', '))}</td><td class="hide-s">${esc(r.industry || '')}</td><td class="n">${money(r.sold)}</td><td class="n hide-s">${r.indefinite ? 'Indefinite' : money(r.offering)}</td></tr>`).join('')}</tbody></table></div>
<div class="tick-foot"><span>${ops.length} operating companies filed a new Form D that day. Source: SEC EDGAR. Amounts are what each issuer reported.</span><a class="tlink" href="/apify/sec-form-d-funding-leads/">Get these as CSV or daily alerts ${ARROW_UP}</a></div></div>`;
  }
  const actorCards = actors.map((a, i) => `<a class="card c4" data-tilt data-rv style="--d:${i % 3}" href="/apify/${a.name}/"><div class="card-top">${icon(ACTOR_ICON[a.name] || 'drop')}<span class="tag">Pay per result</span></div><h4>${esc(a.title.split(' - ')[0])}</h4><p class="clamp">${esc(a.description)}</p><div class="card-foot"><span>${esc(priceLine(a).replace(' on Apify (pay per event)', '') || 'Runs on Apify')}</span><span class="go">${ARROW}</span></div></a>`).join('');
  const lib = GUIDE_GROUPS.map(([seg, label]) => { const gs = guides.filter(g => g.segs[0] === seg); if (!gs.length) return ''; return `<section data-rv><h4><a href="/${seg}/">${esc(label)}</a><span>${String(gs.length).padStart(2, '0')}</span></h4><ul>${gs.map(g => `<li><a href="${g.url}">${esc(g.h1)}</a></li>`).join('')}</ul></section>`; }).join('');

  return `<canvas id="merc" aria-hidden="true"></canvas>
<section class="hero" data-stage="0" data-side="right"><div class="wrap">
<div class="eyebrow mono"><span><b>SKILLMERC</b></span><span>Software tools</span><span>South Africa</span></div>
<h1><span class="ln"><span>Software that</span></span><span class="ln" style="--d:1"><span>takes the <em>shape</em></span></span><span class="ln" style="--d:2"><span>of the job.</span></span></h1>
<p class="lede">SKILLMERC makes small, single-purpose tools for <strong>online stores, bookkeeping and public data</strong>: WooCommerce plugins for South African payments and shipping, order sync into Sage and FreeAgent, a browser add-on that turns any web table into a spreadsheet, and pay-per-result scrapers.</p>
<div class="cta-row"><a class="btn btn-cin down" href="#commerce">See the tools ${ARROW_DN}</a><a class="btn btn-ghost" href="mailto:kyle@skillmerc.com">kyle@skillmerc.com</a></div>
</div><div class="hero-stats"><div class="wrap"><ul class="stats"><li><b>${plugins}</b>WordPress plugins</li><li><b>${addons}</b>browser add-ons</li><li><b>${actors.length}</b>data actors on Apify</li><li><b>${guides.length}</b>written guides</li></ul></div></div><div class="scrollcue mono"><span>Scroll</span><i></i></div></section>
<div class="marq" aria-label="Works with: ${esc(works.join(', '))}">${marq}${marq.replace('<ul', '<ul aria-hidden="true"')}</div>

${stage(1, 'left', 'commerce', '01', 'Commerce', 'Take the payment. <em>Book the courier.</em>', 'Free WooCommerce plugins for South African stores. PayFast checkout with signed ITN checks, plus live rates and pickup points for The Courier Guy, Fastway, Pudo and PAXI.', `<a class="btn btn-bone" href="/sa-shipping-woocommerce/">Shipping plugin ${ARROW}</a><a class="btn btn-ghost" href="/payfast-woocommerce/">PayFast gateway</a>`)}
<section class="panel"><div class="wrap"><div class="panel-head"><h3 data-rv>Checkout and delivery for WooCommerce</h3><p data-rv style="--d:1">Both plugins are free on WordPress.org. Shipping Pro books The Courier Guy from the order screen and prints the label.</p></div>
<div class="grid">
<div class="card big c7 lift" data-tilt="3" data-rv><div class="card-top">${icon('shipping')}<span class="tag cin">Free + Pro</span></div><h4>The Courier Guy, Fastway, Pudo and PAXI shipping for WooCommerce</h4><p>One plugin for the couriers South African stores actually use, on the Checkout block and the classic checkout.</p><ul class="ticks"><li>Live The Courier Guy and Fastway rates at checkout</li><li>Pudo locker picker and PAXI point picker on the official PAXI map</li><li>Pro: book a The Courier Guy shipment from the order screen and download the label PDF</li><li>Pro: tracking reference in the customer's email, and up to 50 orders booked at once</li></ul><div class="pricebar"><span><b>Free</b> on WordPress.org</span><span><b>Pro</b> USD 49 a year, one site</span><span>14-day money-back guarantee</span></div><div class="cta-row"><a class="btn btn-cin" href="/sa-shipping-woocommerce/">How it works ${ARROW}</a><a class="btn btn-ghost" href="${WP('skillmerc-shipping-courier-guy-pudo-paxi')}" rel="noopener">Get it free ${ARROW_UP}</a></div></div>
<div class="c5" style="display:grid;gap:16px">${card(by('commerce')[0], 1, '')}${card(by('commerce')[2], 2, '')}</div>
</div></div></section>

${stage(2, 'right', 'accounting', '02', 'Accounting', 'Paid orders, <em>already in the books.</em>', 'Each paid order becomes a customer, an invoice with VAT per line and a payment. The WooCommerce plugins talk to Sage and FreeAgent straight from your own site, with no middleman server.', `<a class="btn btn-bone" href="/shopify-freeagent/">Ledgerline for Shopify ${ARROW}</a><a class="btn btn-ghost" href="/freeagent-woocommerce/">WooCommerce sync</a>`)}
<section class="panel"><div class="wrap"><div class="panel-head"><h3 data-rv>Order sync for Sage and FreeAgent</h3><p data-rv style="--d:1">Free plugins for WooCommerce today. Ledgerline brings the same idea to Shopify, where FreeAgent no longer has an integration of its own.</p></div>
<div class="grid">${by('accounting').map((p, i) => card(p, i, 'c3')).join('')}</div></div></section>

${stage(3, 'left', 'browser', '03', 'Browser', 'Any web table, <em>straight to a spreadsheet.</em>', 'List &amp; Table Scraper finds the repeated rows on a page, shows a preview and exports CSV, Excel or JSON. The scraped data stays in your browser.', `<a class="btn btn-bone" href="${AMO('list-table-scraper')}" rel="noopener">Add to Firefox (free) ${ARROW_UP}</a><a class="btn btn-ghost" href="/list-table-scraper/">Watch the demo</a>`)}
<section class="panel"><div class="wrap"><div class="panel-head"><h3 data-rv>Browser add-ons</h3><p data-rv style="--d:1">Free to install and use. Pro is for long multi-page runs and saved recipes.</p></div>
<div class="grid">
<div class="card big c7 lift" data-tilt="3" data-rv><div class="card-top">${icon('window')}<span class="tag cin">Free + Pro</span></div><h4>List <span class="amp">&amp;</span> Table Scraper</h4><p>${esc(lts.desc)} Real HTML tables keep their header cells as column names, and duplicate rows are dropped.</p>
<div class="fan"><figure><img src="/list-table-scraper/1-hacker-news-3-pages.jpg" width="1280" height="800" loading="lazy" alt="List &amp; Table Scraper collecting three pages of Hacker News into one table"></figure><figure><img src="/list-table-scraper/2-wordpress-plugins-crawl.jpg" width="1280" height="800" loading="lazy" alt="List &amp; Table Scraper crawling a WordPress plugin search across pages"></figure><figure><img src="/list-table-scraper/3-wikipedia-table.jpg" width="1280" height="800" loading="lazy" alt="A Wikipedia table exported with its header cells as column names"></figure></div>
<div class="pricebar"><span><b>Free</b> up to 3 pages per run</span><span><b>Pro</b> up to 500 pages, saved recipes</span><span>USD 4 a month, 29 a year or 49 once</span></div>
<div class="cta-row"><a class="btn btn-cin" href="${AMO('list-table-scraper')}" rel="noopener">Add to Firefox (free) ${ARROW_UP}</a><a class="btn btn-ghost" href="/list-table-scraper/">Demo video and docs ${ARROW}</a><a class="tlink" href="/list-table-scraper/#free-and-pro">Free and Pro compared</a></div></div>
<div class="c5" style="display:grid;gap:16px;align-content:start">${card(tp, 1, '')}
<div class="card" data-rv style="--d:2"><div class="card-top">${icon('guide')}<span class="tag">Guides</span></div><h4>Common jobs, step by step</h4><ul class="ticks">${guides.filter(g => g.segs[0] === 'list-table-scraper').slice(0, 4).map(g => `<li><a class="tlink" style="border:0;font-weight:400;color:var(--bone2)" href="${g.url}">${esc(g.h1)}</a></li>`).join('')}</ul></div></div>
</div></div></section>

${stage(4, 'right', 'data', '04', 'Data', 'Public data, <em>by the row.</em>', 'Scrapers and monitors for company filings, funding notices, transcripts and listings. Each runs on Apify, so there is nothing to install and you pay per result.', `<a class="btn btn-bone" href="https://apify.com/skillmerc" rel="noopener">Open the Apify Store ${ARROW_UP}</a><a class="btn btn-ghost" href="/form-d/">Free Form D list</a>`)}
<section class="panel"><div class="wrap"><div class="panel-head"><h3 data-rv>${actors.length} data actors, and one free daily list</h3><p data-rv style="--d:1">Apify's free plan includes monthly platform credit, so small runs cost little or nothing to try.</p></div>
<div class="grid">${formd}${actorCards}</div></div></section>

<section class="panel" id="guides" style="margin-top:18px"><div class="wrap">
<div class="kicker mono" data-rv><b>05</b><i></i><span>How these are built</span></div>
<h2 class="h2" data-rv style="max-width:16ch">Plain tools, <em>written down.</em></h2>
<div class="rules" data-rv>
<div><h4>One job each</h4><p>Every tool does one thing, and its page says what that is and what it costs before you install anything.</p></div>
<div><h4>Free where it can be</h4><p>The WordPress plugins and the browser add-ons are free to use. Pro tiers cover the heavy work: booking couriers, long crawls, extra export formats.</p></div>
<div><h4>Your keys stay with you</h4><p>The WooCommerce sync plugins send orders to Sage and FreeAgent from your own site. Scraped tables stay in your browser.</p></div>
<div><h4>The errors, explained</h4><p>${guides.length} guides cover the problems stores actually hit: PayFast orders stuck on pending, a missing shipping method, VAT that is a penny out.</p></div>
</div>
<div class="panel-head" style="margin-top:84px"><h3 data-rv>The guide library</h3><p data-rv style="--d:1">Most of these apply whichever plugin you use.</p></div>
<div class="lib">${lib}</div>
</div></section>

<section class="stage" id="contact" data-stage="5" data-side="center"><div class="wrap"><div class="stage-in"><div class="kicker mono" data-rv><b>06</b><i></i><span>Contact</span></div><h2 data-rv style="--d:1">Questions, bug reports, a tool you wish existed.</h2><p data-rv style="--d:2"><a class="mail" href="mailto:kyle@skillmerc.com">kyle@skillmerc.com</a></p><p data-rv style="--d:3;max-width:34em;margin-inline:auto">Build WooCommerce stores for South African clients? Ask for a free Shipping Pro licence to test on a client store.</p></div></div></section>`;
}

function homePage(rel, title, desc, body) {
  const org = ld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': BASE + '/#org', name: 'SKILLMERC', legalName: 'SKILLMERC (Pty) Ltd', url: BASE + '/', email: 'kyle@skillmerc.com', logo: BASE + '/assets/touch.png', address: { '@type': 'PostalAddress', addressCountry: 'ZA' }, sameAs: ['https://profiles.wordpress.org/skillmerc/', 'https://apify.com/skillmerc', 'https://www.youtube.com/@skillmerc', 'https://github.com/skillmerc'] },
    { '@type': 'WebSite', '@id': BASE + '/#site', url: BASE + '/', name: 'SKILLMERC', publisher: { '@id': BASE + '/#org' } }] });
  return `${head({ title, desc, url: BASE + '/', extra: org })}<body class="home">${DEFS}${navHtml()}<main id="main">${nod(body)}</main>${footHtml()}${scripts(true)}</body></html>`;
}

export function notFoundBody() {
  return `<canvas id="merc" data-form="0" data-side="center" aria-hidden="true"></canvas><section class="lost"><div class="wrap"><div class="num">404</div><h1 class="h2" style="margin-top:10px">This page ran off.</h1><p style="color:var(--bone2);max-width:30em;margin:0 auto 30px">The link is old or mistyped. Everything SKILLMERC makes is one click from the front page.</p><div class="cta-row" style="justify-content:center"><a class="btn btn-cin" href="/">Back to the front page ${ARROW}</a><a class="btn btn-ghost" href="/#guides">Browse the guides</a></div></div></section>`;
}

/** Render any page. Same signature as the old gen.mjs template. */
export function render(rel, title, desc, body) {
  if (rel === 'index.html') return homePage(rel, title, desc, body);
  if (rel === '404.html') return `${head({ title, desc, url: BASE + '/404.html', extra: '<meta name="robots" content="noindex">' })}<body class="home">${DEFS}${navHtml()}<main id="main">${body}</main>${footHtml()}${scripts(true)}</body></html>`;
  return docPage(rel, title, desc, body);
}

/** Re-shell an already published page that uses the old template (static pages kept outside gen.mjs). */
export function reshell(rel, html) {
  const t = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || 'SKILLMERC'; const d = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const headPart = html.split(/<body[^>]*>/)[0] || '';
  if (/http-equiv/i.test(headPart) || /<script/i.test(headPart)) return null; // pages that redirect or run head scripts keep their own markup
  const m = html.match(/<main[^>]*>([\s\S]*)<\/main>/) || html.match(/<body[^>]*>([\s\S]*)<\/body>/); if (!m) return null;
  const un = s => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  return docPage(rel, un(t), un(d), m[1]);
}

/** Copy theme assets into the build output and write the root files that belong to the theme. */
export function copyAssets(out) {
  const src = path.join(HERE, 'static/assets'); const walk = (d, rel = '') => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p, rel + f + '/'); else { const o = path.join(out, 'assets', rel + f); fs.mkdirSync(path.dirname(o), { recursive: true }); fs.copyFileSync(p, o); } } };
  walk(src);
  fs.writeFileSync(path.join(out, 'favicon.svg'), LOGO.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(' aria-hidden="true"', ''));
  fs.writeFileSync(path.join(out, '404.html'), render('404.html', 'Page not found: SKILLMERC', 'This page does not exist.', notFoundBody()));
}
