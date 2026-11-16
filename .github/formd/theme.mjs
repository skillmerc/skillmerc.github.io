// SKILLMERC site theme v8 (Nov 2026). Shared by gen.mjs (local build) and the Form D GitHub Action.
// Exports: render(rel,title,desc,body), reshell(rel,html), homeBody(ctx), guidesBody(), copyAssets(out).
// Look: black, giant white type, glass orbs that hold real product screens, one warm ribbon of light (site.js),
// a hairline frame. No 3D renders.
// Page copy for content pages lives in gen.mjs and the help-*/ folders. This file owns the shell, the homepage,
// the product headers on hub pages and the /guides/ index. Node builtins only (the Action copies this one file).
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const BASE = 'https://skillmerc.com';
const REG = '2025/673155/07';
const nod = s => String(s ?? '').replace(/\u2014/g, '-').replace(/\u2013/g, '-');
const esc = s => nod(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

let _v;
const ver = () => { if (_v) return _v; const h = crypto.createHash('sha1'); let n = 0;
  for (const dir of [path.join(HERE, 'static/assets'), path.join(process.cwd(), 'assets')]) { if (!fs.existsSync(dir)) continue; for (const f of ['site.css', 'site.js']) { const p = path.join(dir, f); if (fs.existsSync(p)) { h.update(fs.readFileSync(p)); n++; } } if (n) break; }
  return (_v = n ? h.digest('hex').slice(0, 8) : '1'); };

// ---------- marks ----------
const ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" aria-hidden="true"><path d="M2 8h11M8.5 3.5 13 8l-4.5 4.5"/></svg>';
const ARROW_UP = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const ARROW_DN = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" aria-hidden="true"><path d="M8 2v11M3.5 8.5 8 13l4.5-4.5"/></svg>';
// The mark: a disc with a small dot.
const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><mask id="lg-m"><rect width="32" height="32" fill="#fff"/><circle cx="24.6" cy="7.9" r="7" fill="#000"/></mask><circle cx="13.6" cy="18.2" r="11.8" fill="currentColor" mask="url(#lg-m)"/><circle cx="24.6" cy="7.9" r="5.1" fill="#ff5a36"/></svg>';
const FAVICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#050506"/><mask id="m"><rect width="32" height="32" fill="#fff"/><circle cx="23.4" cy="9.2" r="6.2" fill="#000"/></mask><circle cx="14" cy="18" r="10.2" fill="#fff" mask="url(#m)"/><circle cx="23.4" cy="9.2" r="4.5" fill="#ff5a36"/></svg>';
const brand = `<a class="brand" href="/" aria-label="SKILLMERC home">${LOGO}<span>SKILLMERC</span></a>`;

// ---------- catalogue ----------
const WP = (slug) => `https://wordpress.org/plugins/${slug}/`;
const AMO = (slug) => `https://addons.mozilla.org/firefox/addon/${slug}/`;
const PRO_SHIP = 'https://checkout.freemius.com/plugin/43024/plan/74888/licenses/1/';
const CATS = {
  shipping: { label: 'Shipping', n: '01', a: '/#shipping' }, payments: { label: 'Payments', n: '02', a: '/#payments' },
  books: { label: 'Bookkeeping', n: '03', a: '/#books' }, tables: { label: 'Web tables', n: '04', a: '/#tables' },
  data: { label: 'Data', n: '05', a: '/#data' }, more: { label: 'SKILLMERC', n: '', a: '/' },
};
// Hub pages: first URL segment -> product meta. `hero` turns the header into a full product header.
// doc = which specimen document stands for the product, stamp = what gets stamped on it, tale = the job in a few plain sentences.
const HUBS = {
  'sa-shipping-woocommerce': { cat: 'shipping', name: 'Shipping for WooCommerce', doc: 'label', stamp: 'Quoted', hero: true,
    tag: 'Real courier prices. <em>Zero copy&#8209;paste.</em>',
    tale: 'A flat rate is a guess. Guess high and the shopper leaves. Guess low and you pay the difference. This plugin asks the courier, while the shopper is still at checkout.',
    say: 'Shoppers see live The Courier Guy and Fastway rates at checkout, or pick a Pudo locker or PAXI point. Pro books The Courier Guy and downloads the label PDF from the order.',
    facts: ['Free plugin', '*Pro USD 49 a year', 'Checkout block ready'],
    cta: [['Get it free', WP('skillmerc-shipping-courier-guy-pudo-paxi'), 'up'], ['Get Pro', PRO_SHIP, 'up']],
    promo: ['Live courier rates and locker pickers. Pro adds booking and labels.', 'Get it free', WP('skillmerc-shipping-courier-guy-pudo-paxi')] },
  'payfast-woocommerce': { cat: 'payments', name: 'PayFast for WooCommerce', doc: 'slip', stamp: 'Paid', hero: true,
    tag: 'Get paid. <em>The order updates itself.</em>',
    tale: 'The shopper paid. PayFast has the money. The order still says Pending, so nobody packs the box. This gateway checks each payment notice, then moves the order on by itself. When a notice fails a check, the log says why.',
    say: 'Card, instant EFT, SnapScan and Mobicred through PayFast. Every payment notice is checked before the order is marked paid.',
    facts: ['Free', 'PayFast hosted checkout', 'Signed ITN checks'],
    cta: [['Get it free', WP('skillmerc-payment-gateway-for-payfast'), 'up'], ['Fix a PayFast problem', '/payfast-woocommerce/help/', '']],
    promo: ['Card and EFT payments that mark orders paid by themselves.', 'Get it free', WP('skillmerc-payment-gateway-for-payfast')] },
  'sage-accounting-woocommerce': { cat: 'books', name: 'WooCommerce to Sage Accounting', doc: 'inv', stamp: 'In Sage', hero: true,
    tag: 'Every sale, <em>already in Sage.</em>',
    tale: 'Month end. Orders in one window, Sage in the other, and an afternoon of typing between them. This plugin does the typing the moment an order is paid.',
    say: 'Each paid order becomes a customer, a sales invoice with the right VAT and a payment in Sage Accounting. No retyping at month end.',
    facts: ['Free', 'Sage Accounting UK', 'Failed sends retry'],
    cta: [['Get it free', WP('skillmerc-sync-for-sage-accounting'), 'up'], ['Setup guide', '/sage-accounting-woocommerce/help/send-woocommerce-orders-to-sage-accounting/', '']],
    promo: ['Paid orders become Sage invoices with the right VAT.', 'Get it free', WP('skillmerc-sync-for-sage-accounting')] },
  'freeagent-woocommerce': { cat: 'books', name: 'WooCommerce to FreeAgent', doc: 'inv', stamp: 'In FreeAgent', hero: true,
    tag: 'Every sale, <em>already in FreeAgent.</em>',
    tale: 'Month end. Orders in one window, FreeAgent in the other, and an afternoon of typing between them. This plugin does the typing the moment an order is paid.',
    say: 'Each paid order becomes a contact, an invoice with the VAT rate per line and a payment, so it shows as paid in FreeAgent. No retyping.',
    facts: ['Free', 'FreeAgent', 'Keys stay on your site'],
    cta: [['Get it free', WP('skillmerc-sync-for-freeagent'), 'up'], ['Setup guide', '/freeagent-woocommerce/help/send-woocommerce-orders-to-freeagent/', '']],
    promo: ['Paid orders become FreeAgent invoices with the right VAT.', 'Get it free', WP('skillmerc-sync-for-freeagent')] },
  'shopify-freeagent': { cat: 'books', name: 'Ledgerline', doc: 'inv', docNo: 'SHOP-1042', stamp: 'Booked', hero: true,
    tag: 'Shopify sales, <em>straight into FreeAgent.</em>',
    tale: 'On 30 April 2025 FreeAgent switched off its Shopify integration and told sellers to record sales by hand. Ledgerline puts the link back.',
    say: 'Ledgerline sends paid Shopify orders to FreeAgent as invoices with VAT, marked paid, with refunds as credit notes.',
    facts: ['Shopify app', '*In review at Shopify', 'FreeAgent'], cta: [['Get the launch email', '#notify', 'dn']],
    promo: ['Paid Shopify orders into FreeAgent, with VAT. In review at Shopify.', 'Get the launch email', '/shopify-freeagent/#notify'] },
  'shopify-sage-accounting': { cat: 'books', name: 'Shopify to Sage Accounting', doc: 'inv', stamp: 'Booked', hero: true,
    tag: 'Shopify sales, <em>into Sage.</em>',
    say: 'Your options for getting Shopify orders into Sage Accounting today, and what Ledgerline for Sage UK will do.',
    facts: ['Guide', 'Ledgerline coming soon'], cta: [] },
  'list-table-scraper': { cat: 'tables', name: 'List & Table Scraper', doc: 'print', stamp: 'Exported', hero: true,
    tag: 'Any web table. <em>Into Excel.</em>',
    tale: 'You need that table in Excel. You select it, copy it, paste it, and get one long column of soup. One click on this add-on finds the rows and keeps the columns.',
    say: 'One click finds the rows on a page. It follows the Next button and exports CSV, Excel or JSON. Nothing leaves your browser.',
    facts: ['Free up to 3 pages', '*Pro up to 500 pages', 'From USD 4 a month'],
    cta: [['Add to Firefox, free', AMO('list-table-scraper'), 'up'], ['Watch the demo', '#demo', 'dn']],
    promo: ['Any table or list on the web, into Excel in one click.', 'Add to Firefox, free', AMO('list-table-scraper')] },
  privacy: { cat: 'more', name: 'Privacy' },
  threadkeep: { cat: 'more', name: 'Threadkeep', doc: 'chat', stamp: 'Saved', hero: true,
    tag: 'DeepSeek chats, <em>saved properly.</em>',
    tale: 'A long DeepSeek chat that finally got somewhere. Close the tab and it becomes a scroll you will never find again. Threadkeep saves the whole thing to a file on your own computer.',
    say: 'Save the DeepSeek chat you have open as Markdown, text, JSON, PDF or Word. Long chats are joined in order, and everything stays in your browser.',
    facts: ['Firefox, in review', 'Chrome coming soon', 'Stays in your browser'], cta: [['Ask a question', 'mailto:kyle@skillmerc.com', '']] },
  riskwell: { cat: 'more', name: 'Riskwell for Jira', doc: 'risk', stamp: 'Reviewed', hero: true,
    tag: 'Every project risk, <em>in one register.</em>',
    tale: 'The risk register is a spreadsheet. It was last opened at kickoff. Riskwell keeps it inside the Jira project, next to the work, and emails the risk owner when a review is due.',
    say: 'Riskwell keeps a risk register in each Jira project: inherent and residual scores, a heat map, review reminders, CSV export and a Rovo agent.',
    facts: ['Jira', 'Heat map', 'CSV export'], cta: [] },
  apify: { cat: 'data', name: 'Data tools', link: '/#data',
    promo: ['11 scrapers and monitors on Apify. Pay only for the rows you get.', 'Browse on Apify', 'https://apify.com/skillmerc'] },
  'form-d': { cat: 'data', name: 'Form D filings' },
  guides: { cat: 'more', name: 'Guides' },
  'open-books': { cat: 'more', name: 'Open books' },
  'decision-log-confluence': { cat: 'more', name: 'Decision Keeper for Confluence', doc: 'min', stamp: 'On record', hero: true,
    tag: 'Every decision, <em>on the record.</em>',
    tale: 'Six months on, someone asks why you chose that vendor. The answer was said out loud in a meeting. Decision Keeper gives each decision a record in Confluence and lists them in one register.',
    say: 'Decision records, the Decision Register, a draft check and the Decision Keeper Rovo agent, inside Confluence.',
    facts: ['Confluence', 'Decision Register', 'Rovo agent'], cta: [] },
  'ship-rules': { cat: 'more', name: 'Ship Rules for Jira', doc: 'tag', stamp: 'Not yet', hero: true,
    tag: 'Proof first. <em>Then it ships.</em>',
    tale: '"Done" means one thing to whoever wrote the code and another to whoever gets the call when it breaks. Ship rules say what must be true before a Jira work item ships, and ask for the proof.',
    say: 'Ship rules say what must be true before a Jira work item ships. People and coding agents attach the evidence, and rules marked for a person stay open until a person confirms.',
    facts: ['Jira', 'Atlassian MCP server', 'Built on Forge'], cta: [] }, closewell: { cat: 'more', name: 'Closewell', link: '/closewell/install/' },
};
// schema.org SoftwareApplication facts for released products (prices as listed on each page)
const SCHEMA = {
  'sa-shipping-woocommerce': { name: 'Skillmerc Shipping for The Courier Guy, Pudo and PAXI', os: 'WordPress, WooCommerce', cat: 'BusinessApplication', offers: [['Free', 0], ['Pro, one site, one year', 49]], url: WP('skillmerc-shipping-courier-guy-pudo-paxi') },
  'payfast-woocommerce': { name: 'Skillmerc Payment Gateway for PayFast', os: 'WordPress, WooCommerce', cat: 'BusinessApplication', offers: [['Free', 0]], url: WP('skillmerc-payment-gateway-for-payfast') },
  'sage-accounting-woocommerce': { name: 'Skillmerc Sync for Sage Accounting', os: 'WordPress, WooCommerce', cat: 'BusinessApplication', offers: [['Free', 0]], url: WP('skillmerc-sync-for-sage-accounting') },
  'freeagent-woocommerce': { name: 'Skillmerc Sync for FreeAgent', os: 'WordPress, WooCommerce', cat: 'BusinessApplication', offers: [['Free', 0]], url: WP('skillmerc-sync-for-freeagent') },
  'list-table-scraper': { name: 'List & Table Scraper', os: 'Firefox', cat: 'BrowserApplication', offers: [['Free', 0], ['Pro, monthly', 4], ['Pro, yearly', 29], ['Pro, lifetime', 49]], url: AMO('list-table-scraper') },
};
const CARDS = [
  { k: 'sa-shipping-woocommerce', m: 'Shipping', b: 'Shipping for WooCommerce', p: 'Live courier rates and locker pickers. Pro adds booking and labels.', ft: 'Free / Pro', href: '/sa-shipping-woocommerce/' },
  { k: 'shopify-freeagent', m: 'Bookkeeping', b: 'Ledgerline for Shopify', p: 'Paid Shopify orders into FreeAgent, with VAT. In review at Shopify.', ft: 'In review', href: '/shopify-freeagent/' },
  { k: 'list-table-scraper', m: 'Web tables', b: 'List & Table Scraper', p: 'Any web table or list into Excel in one click.', ft: 'Free / Pro', href: '/list-table-scraper/' },
  { k: 'payfast-woocommerce', m: 'Payments', b: 'PayFast for WooCommerce', p: 'Card and EFT payments that mark orders paid by themselves.', ft: 'Free', href: '/payfast-woocommerce/' },
  { k: 'sage-accounting-woocommerce', m: 'Bookkeeping', b: 'WooCommerce to Sage', p: 'Paid orders become Sage invoices with the right VAT.', ft: 'Free', href: '/sage-accounting-woocommerce/' },
  { k: 'freeagent-woocommerce', m: 'Bookkeeping', b: 'WooCommerce to FreeAgent', p: 'Paid orders become FreeAgent invoices with the right VAT.', ft: 'Free', href: '/freeagent-woocommerce/' },
  { k: 'form-d', m: 'Data', b: 'Who raised money this week', p: 'New SEC Form D filings, largest first. Updated daily.', ft: 'Free', href: '/form-d/' },
];
const GUIDE_GROUPS = [['sa-shipping-woocommerce', 'Shipping in South Africa'], ['payfast-woocommerce', 'PayFast'], ['shopify-freeagent', 'Shopify and FreeAgent'], ['list-table-scraper', 'Web tables to spreadsheets'], ['sage-accounting-woocommerce', 'WooCommerce and Sage'], ['freeagent-woocommerce', 'WooCommerce and FreeAgent']];
// The price list on the homepage. st: live | review. Prices and statuses must match the product pages and the Board.
const PLIST = ({ nData, minPrice }) => [
  ['WooCommerce', '4 plugins', [
    ['101', 'Show real courier prices at checkout', 'Shipping for WooCommerce: The Courier Guy, Fastway, Pudo, PAXI', '<b>Free.</b> Pro USD 49 a year', 'live', 'Live', '/sa-shipping-woocommerce/'],
    ['102', 'Take card and EFT payments that mark the order paid', 'PayFast for WooCommerce', '<b>Free</b>', 'live', 'Live', '/payfast-woocommerce/'],
    ['103', 'Put every paid order into Sage, with the VAT right', 'WooCommerce to Sage Accounting', '<b>Free</b>', 'live', 'Live', '/sage-accounting-woocommerce/'],
    ['104', 'Put every paid order into FreeAgent, marked paid', 'WooCommerce to FreeAgent', '<b>Free</b>', 'live', 'Live', '/freeagent-woocommerce/']]],
  ['Shopify', '1 app', [
    ['201', 'Send paid Shopify orders to FreeAgent as invoices', 'Ledgerline', 'From USD 9 a month, planned', 'review', 'In review at Shopify', '/shopify-freeagent/']]],
  ['Jira and Confluence', '3 apps', [
    ['301', 'Keep a risk register and heat map in each Jira project', 'Riskwell', 'Not on sale yet', 'review', 'In review at Atlassian', '/riskwell/'],
    ['302', 'Write decisions down where the team already works', 'Decision Keeper for Confluence', 'Not on sale yet', 'review', 'In review at Atlassian', '/decision-log-confluence/'],
    ['303', 'Ask for proof before a Jira work item ships', 'Ship Rules', 'Not on sale yet', 'review', 'In review at Atlassian', '/ship-rules/']]],
  ['Your browser', '2 add-ons', [
    ['401', 'Turn any web table or list into Excel', 'List & Table Scraper for Firefox', '<b>Free.</b> Pro from USD 4 a month', 'live', 'Live', '/list-table-scraper/'],
    ['402', 'Save a DeepSeek chat as PDF, Markdown or Word', 'Threadkeep', 'Free plan and Pro at launch', 'review', 'In review at Firefox', '/threadkeep/']]],
  ['Public data', `${nData} tools, 1 free list`, [
    ['501', 'Pull company filings, funding rounds and listings into a sheet', `${nData} data tools on Apify`, minPrice != null ? `From USD ${minPrice} per 1,000 rows` : 'Pay per result', 'live', 'Live', '#data'],
    ['502', 'See which companies raised money this week', 'SEC Form D filings, updated daily', '<b>Free</b>', 'live', 'Live', '/form-d/']]],
];

// ---------- orbs ----------
// A glass sphere with a small product screen inside. Figures in the screens are examples (the Form D one is live data).
const row = (a, b, cls = '') => `<span class="row${cls ? ' ' + cls : ''}"><span>${esc(a)}</span><b>${esc(b)}</b></span>`;
const SCREEN = {
  ship: () => `<span class="cap">Checkout &middot; shipping</span>${row('The Courier Guy', 'R 99.00', 'on')}${row('Fastway', 'R 85.00')}${row('Pudo locker', 'R 60.00')}`,
  pay: () => `<span class="cap">Order #1042</span><span class="big">R 1 249</span><span class="chip">Paid</span><span class="sub">Order moved to Processing</span>`,
  books: ({ no = 'Invoice 1042' } = {}) => `<span class="cap">${esc(no)}</span>${row('Net', '\u00a379.17')}${row('VAT 20%', '\u00a315.83')}${row('Total', '\u00a395.00', 'tot')}<span class="chip">In the books</span>`,
  tables: () => `<span class="cap">6 rows &middot; export.xlsx</span>${row('Desk lamp', '$39')}${row('Office chair', '$189')}${row('Monitor arm', '$59')}${row('USB-C hub', '$29')}`,
  data: ({ rows = [], date = '' } = {}) => `<span class="cap">Form D${date ? ' &middot; ' + esc(date) : ''}</span>${(rows.length ? rows : [['Updated every weekday', '']]).map(([a, b]) => row(a, b)).join('')}`,
  chat: () => `<span class="cap">DeepSeek chat</span><span class="big">24 of 24</span><span class="sub">messages saved, in order</span><span class="fm"><span>MD</span><span>TXT</span><span>JSON</span><span>PDF</span><span>DOC</span></span>`,
  risk: () => `<span class="cap">Risk register</span><span class="grid5">${['', '', 'm', 'h', 'h', '', '', 'm', 'x', 'h', '', '', 'm', 'm', 'h', '', '', '', 'm', 'm', '', '', '', '', ''].map(c => `<i${c ? ` class="${c}"` : ''}></i>`).join('')}</span><span class="chip wait">Review due</span>`,
  min: () => `<span class="cap">Decision record</span><span class="bar" style="width:100%"></span><span class="bar" style="width:82%"></span><span class="bar" style="width:64%"></span><span class="chip">Decided</span>`,
  tag: () => `<span class="cap">Ship rules</span><span class="tick y"><i></i>Tests linked</span><span class="tick y"><i></i>Rollback noted</span><span class="tick"><i></i>Reviewed by a person</span><span class="chip wait">Not ready yet</span>`,
};
const orb = (kind, { tag = 'span', attrs = '', opts } = {}) => `<${tag} class="orb"${attrs}><span class="scr">${SCREEN[kind](opts)}</span></${tag}>`;
const DOC2SCR = { label: 'ship', slip: 'pay', inv: 'books', print: 'tables', card: 'data', chat: 'chat', risk: 'risk', min: 'min', tag: 'tag' };
const orbFig = (doc, opts) => DOC2SCR[doc] ? `<div class="ex-doc" aria-hidden="true">${orb(DOC2SCR[doc], { opts })}</div>` : '';
const WIRE = '<svg viewBox="0 0 100 100" aria-hidden="true"><g transform="rotate(-18 50 50)"><circle cx="50" cy="50" r="49"/>' + [12, 26, 40].map(v => `<ellipse cx="50" cy="50" rx="49" ry="${v}"/><ellipse cx="50" cy="50" rx="${v}" ry="49"/>`).join('') + '<path d="M1 50h98M50 1v98"/></g></svg>';

const registry = [];
let SHOTS = {}; try { SHOTS = JSON.parse(fs.readFileSync(path.join(HERE, 'shots.json'), 'utf8')); } catch {}
const shotSrc = (s) => s.p || `/assets/shots/${s.f}`;

// ---------- shared chrome ----------
const head = ({ title, desc, url, extra = '' }) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:site_name" content="SKILLMERC"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${BASE}/assets/og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#050506"><meta name="color-scheme" content="dark"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/touch.png"><link rel="preload" href="/assets/fonts/geist.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/site.css?v=${ver()}"><script>document.documentElement.classList.add('js')</script>${extra}</head>`;
const navHtml = () => `<a class="skip" href="#main">Skip to content</a><header class="nav"><div class="wrap nav-in">${brand}<button class="kbtn" type="button" data-k aria-label="Search tools and guides"><svg class="ki" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="6"/><path d="m14 14 3.5 3.5"/></svg><span>Search</span><kbd>&#8984;K</kbd></button><nav class="nav-links" aria-label="Main"><a href="/#kit">Tools</a><a href="/guides/">Guides</a><a href="/#data">Data</a><a class="boxed" href="mailto:kyle@skillmerc.com">Contact</a></nav><button class="burger" aria-label="Menu" aria-expanded="false"><i></i><i></i></button></div></header>`;
const footHtml = () => `<footer class="foot"><div class="wrap"><div class="foot-grid">
<div class="foot-about">${brand}<p>The boring parts, handled. Small tools for online shops, bookkeeping, project teams and public data.</p><p>SKILLMERC (Pty) Ltd, South Africa.<br>Reg. ${REG}<br><a href="mailto:kyle@skillmerc.com">kyle@skillmerc.com</a></p></div>
<div><h2 class="fh">Tools</h2><ul><li><a href="/sa-shipping-woocommerce/">Shipping for WooCommerce</a></li><li><a href="/payfast-woocommerce/">PayFast for WooCommerce</a></li><li><a href="/sage-accounting-woocommerce/">WooCommerce to Sage</a></li><li><a href="/freeagent-woocommerce/">WooCommerce to FreeAgent</a></li><li><a href="/shopify-freeagent/">Ledgerline for Shopify</a></li><li><a href="/list-table-scraper/">List &amp; Table Scraper</a></li></ul></div>
<div><h2 class="fh">Data and help</h2><ul><li><a href="/#data">Data tools on Apify</a></li><li><a href="/form-d/">Form D filings this week</a></li><li><a href="/guides/">All guides</a></li><li><a href="/open-books/">Open books: our real numbers</a></li><li><a href="/payfast-woocommerce/help/">PayFast fixes</a></li><li><a href="/shopify-sage-accounting/">Shopify to Sage</a></li></ul></div>
<div><h2 class="fh">Elsewhere</h2><ul><li><a href="https://profiles.wordpress.org/skillmerc/">WordPress.org</a></li><li><a href="https://apify.com/skillmerc">Apify</a></li><li><a href="https://www.youtube.com/@skillmerc">YouTube</a></li><li><a href="/privacy/list-table-scraper/">Privacy: List &amp; Table Scraper</a></li><li><a href="/privacy/transcript-pull/">Privacy: Transcript Pull</a></li><li><a href="/shopify-freeagent/privacy/">Privacy: Ledgerline</a></li><li><a href="/privacy/website/">Privacy: this website</a></li></ul></div>
</div><div class="wordmark" aria-hidden="true">SKILLMERC</div><div class="foot-base"><span>&copy; <span data-year>2026</span> SKILLMERC (Pty) Ltd. Reg. ${REG}</span><span>The boring parts, handled.</span></div></div></footer>`;
const scripts = () => `<script src="/assets/site.js?v=${ver()}" defer></script>`;
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const btn = ([label, href, dir, aria], cls) => `<a class="btn ${cls}${dir ? ' ' + dir : ''}" href="${href}"${aria ? ` aria-label="${esc(aria)}"` : ''}${/^https?:/.test(href) ? ' rel="noopener"' : ''}>${esc(label)} ${dir === 'up' ? ARROW_UP : dir === 'dn' ? ARROW_DN : ARROW}</a>`;
const facts = (list) => `<ul class="facts">${list.map(f => f.startsWith('*') ? `<li class="hot">${esc(f.slice(1))}</li>` : `<li>${esc(f)}</li>`).join('')}</ul>`;
const tcard = (c) => `<a class="tcard" href="${c.href}"><span class="lbl">${esc(c.m)}</span><b>${esc(c.b)}</b><p>${esc(c.p)}</p><span class="ft"><span>${esc(c.ft)}</span>${ARROW}</span></a>`;
const secRule = (no, label, note = '') => `<div class="sec-rule"><span class="tab">${esc(no)} &middot; ${esc(label)}</span>${note ? `<span class="typed">${note}</span>` : ''}</div>`;

// Readme text arrives with bare URLs and a "Screenshots" caption list: label the links, drop what the gallery already shows,
// and give a button its own line when a sentence follows it.
const linkLabel = (u) => /youtu\.?be/.test(u) ? 'Watch the video' : /checkout\.freemius\.com/.test(u) ? 'Pro checkout' : u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
const autolink = (html) => html.split(/(<a\b[\s\S]*?<\/a>|<pre\b[\s\S]*?<\/pre>|<code\b[\s\S]*?<\/code>|<script\b[\s\S]*?<\/script>|<[^>]+>)/).map((seg, i) => i % 2 ? seg : seg.replace(/https?:\/\/[^\s<>"')]*[^\s<>"').,;:]/g, (u) => `<a href="${u}"${/skillmerc\.com/.test(u) ? '' : ' rel="noopener"'}>${linkLabel(u)}</a>`)).join('');
const tidy = (html, isHub) => { let h = html.replace(/https:\/\/skillmerc\.github\.io\//g, 'https://skillmerc.com/'); if (isHub) h = h.replace(/<h2[^>]*>Screenshots<\/h2>\s*<ol>[\s\S]*?<\/ol>/, '');
  h = h.replace(/<p>([\s\S]*?)<\/p>/g, (m, inner) => { const mm = inner.match(/^((?:\s*<a class="cta[^"]*"[^>]*>[^<]*<\/a>)+)\s*([\s\S]*\S[\s\S]*)$/); return mm ? `<p>${mm[1]}</p><p>${mm[2]}</p>` : m; });
  h = h.replace(/<a href="(https?:\/\/[^"]+)">\1<\/a>/g, (m, u) => `<a href="${u}"${/skillmerc\.com/.test(u) ? '' : ' rel="noopener"'}>${linkLabel(u)}</a>`);
  return autolink(h); };

// Product pages: each h2 section folds shut so the page reads as a short list. The first one, and any with a form or a video, start open.
// Questions under an FAQ heading fold one by one. Nothing is removed: closed sections stay in the page for search engines and find-in-page.
const qa = (body) => body.split(/(?=<h3[\s>])/).map(q => { const m = q.match(/^<h3[^>]*>([\s\S]*?)<\/h3>/); return m ? `<details class="qa"><summary>${m[1]}</summary><div>${q.slice(m[0].length)}</div></details>` : q; }).join('');
// topNodes: the top-level pieces of a block of HTML (elements whole, text between them), so a section is never cut through a wrapper.
const VOID = new Set(['br', 'img', 'hr', 'input', 'meta', 'link', 'source', 'col', 'wbr', 'area', 'base', 'embed', 'track']);
const topNodes = (html) => { const out = []; const re = /<!--[\s\S]*?-->|<(script|style)\b[\s\S]*?<\/\1>|<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g; let depth = 0, start = 0, last = 0, m;
  while ((m = re.exec(html))) { const whole = m[1] || !m[3]; const tag = (m[3] || '').toLowerCase();
    if (depth === 0) { if (m.index > last && html.slice(last, m.index).trim()) out.push({ html: html.slice(last, m.index) }); if (whole || VOID.has(tag) || m[4]) { out.push({ html: m[0] }); last = re.lastIndex; continue; } if (m[2]) { last = re.lastIndex; continue; } start = m.index; depth = 1; out.push({ tag, open: m[0], from: start }); continue; }
    if (whole || VOID.has(tag) || m[4]) continue; if (m[2]) { depth--; if (depth === 0) { const n = out[out.length - 1]; n.html = html.slice(n.from, re.lastIndex); n.inner = html.slice(n.from + n.open.length, m.index); last = re.lastIndex; } } else depth++; }
  if (depth !== 0) return null; if (last < html.length && html.slice(last).trim()) out.push({ html: html.slice(last) }); return out; };
const fold = (html) => { const nodes = topNodes(html); if (!nodes) return html; const secs = []; let cur = null;
  for (const n of nodes) {
    if (!n.tag && /^<hr\b/i.test(n.html)) { cur = null; continue; } // a rule ends the section above it
    if (n.tag === 'h2') { cur = { attrs: n.open.slice(3, -1), title: n.inner, body: '' }; secs.push(cur); continue; }
    const card = n.tag === 'div' && /class="card"/.test(n.open) && n.inner.match(/^\s*<h2([^>]*)>([\s\S]*?)<\/h2>/);
    if (card) { secs.push({ id: (n.open.match(/\sid="([^"]+)"/) || [])[1], attrs: card[1], title: card[2], body: n.inner.slice(card[0].length) }); cur = null; continue; } // a card's id moves to its fold, so links to it still land
    if (cur) cur.body += n.html; else secs.push({ raw: n.html, tag: n.tag, inner: n.inner }); }
  // Loose text outside any h2 (a plugin's long description) becomes sections too: one per h3 or bold one-line heading.
  // Its lead stays as the page's opening text when it comes first, and becomes "How it works" when it comes later.
  const isHead = (r) => r.tag === 'h3' || (r.tag === 'p' && /^\s*<(strong|b)>[^<]{2,80}<\/\1>\s*$/.test(r.inner || ''));
  const out = []; let seen = false, run = [];
  const flush = () => { const items = run; const after = seen; run = []; if (!items.length) return; const g = []; const lead = []; let c = null;
    for (const r of items) { if (isHead(r)) { c = { attrs: '', title: r.inner.replace(/<\/?(strong|b)>/g, '').trim(), body: '' }; g.push(c); } else if (c) c.body += r.raw; else lead.push(r); }
    const text = lead.map(r => r.raw).join(''); if (after && strip(lead.filter(r => !/^<(script|style)\b/i.test(r.raw)).map(r => r.raw).join('')).length >= 500) out.push({ attrs: '', title: 'How it works', body: text }); else out.push(...lead);
    out.push(...g); if (g.length) seen = true; };
  for (const x of secs) { if (x.raw) run.push(x); else { flush(); out.push(x); seen = true; } } flush();
  if (out.filter(x => !x.raw).length < 3) return html;
  const real = out.filter(x => !x.raw); const leadSec = real.find(x => /^(how it works|what it does)$/i.test(strip(x.title).trim())) || real.find(x => !/^guides$/i.test(strip(x.title).trim())) || real[0];
  return out.map(x => { if (x.raw) return x.raw; const title = strip(x.title); let body = x.body; if (/frequently asked|^faq/i.test(title)) body = qa(body);
    // open at the start: how it works (or the first real section), anything with a form or a video, and everything a buyer or a store reviewer must see without a click: limits, prices, licence, privacy, data, permissions, outside services
    const lead = x === leadSec;
    const open = lead || /<form[\s>]|<iframe[\s>]|class="yt"|id="(demo|notify)"/.test(body) || /does not do|limits|not affiliated|pricing|free and pro|free tier|licen[cs]e|privacy|stays on your device|^data$|permissions|external services?/i.test(title);
    return `<details class="fold"${x.id ? ` id="${x.id}"` : ''}${open ? ' open' : ''}><summary><h2${x.attrs}>${x.title}</h2></summary><div class="fold-b">${body}</div></details>`; }).join(''); };

// ---------- content page shell ----------
function docPage(rel, title, desc, body) {
  const url = BASE + '/' + rel.replace(/index\.html$/, '');
  const segs = rel.replace(/\/?index\.html$/, '').split('/').filter(Boolean);
  const hub = HUBS[segs[0]] || { cat: 'more', name: 'SKILLMERC' }; const cat = CATS[hub.cat];
  const isHub = segs.length === 1 && hub.hero; const isGuide = segs[1] === 'help' && segs.length > 2;
  let rest = nod(body); let h1;
  const m = rest.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (m) { h1 = m[1]; rest = rest.replace(m[0], ''); } else h1 = esc(title);
  if (segs[0] === 'list-table-scraper' && segs.length === 1) rest = rest.replace('<div style="position:relative;padding-bottom:56.25%', '<div id="demo" style="position:relative;padding-bottom:56.25%');
  rest = tidy(rest, isHub);
  if (isHub) rest = fold(rest);
  registry.push({ rel, segs, h1: strip(h1), url: '/' + rel.replace(/index\.html$/, '') });
  const crumbs = [['Home', '/']];
  if (hub.cat !== 'more') crumbs.push([cat.label, cat.a]);
  if (segs.length > 1 && !['privacy'].includes(segs[0])) crumbs.push([hub.name, hub.link || `/${segs[0]}/`]);
  if (isGuide) crumbs.push(['Guide', '/guides/']);
  const here = strip(h1); crumbs.push([here.length > 54 ? here.slice(0, 52).replace(/\s+\S*$/, '') + '...' : here, null]);
  const crumbHtml = `<ol class="crumbs">${crumbs.map(([t, h]) => `<li>${h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol>`;
  const sc = isHub && SCHEMA[segs[0]] ? SCHEMA[segs[0]] : null;
  const app = sc ? ld({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: sc.name, applicationCategory: sc.cat, operatingSystem: sc.os, url, sameAs: sc.url, description: nod(desc), publisher: { '@type': 'Organization', name: 'SKILLMERC', url: BASE + '/' }, offers: sc.offers.map(([n, p]) => ({ '@type': 'Offer', name: n, price: String(p), priceCurrency: 'USD' })) }) : '';
  const bl = ld({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map(([t, h], i) => ({ '@type': 'ListItem', position: i + 1, name: nod(t), item: h ? BASE + h : url })) });
  const wide = segs[0] === 'form-d' || segs[0] === 'guides';
  const words = strip(rest).split(' ').length;
  const meta = isGuide ? [`${Math.max(2, Math.round(words / 220))} min read`, hub.name] : segs[0] === 'apify' ? ['Runs on Apify', 'Pay per result'] : [];
  let band;
  if (isHub) {
    band = `<header class="band hub"><canvas id="ribbon" aria-hidden="true"></canvas><div class="wrap">${crumbHtml}<div class="hub-grid"><div class="ex-tx"><h1>${h1}</h1><p class="display">${hub.tag}</p>${hub.tale ? `<p class="tale">${esc(hub.tale)}</p>` : ''}<p class="say">${esc(hub.say)}</p>${facts(hub.facts)}${hub.cta.length ? `<div class="row-ctas">${hub.cta.map((c, i) => btn(c, i ? 'btn-line' : '')).join('')}</div>` : ''}</div>${orbFig(hub.doc, hub.docNo ? { no: hub.docNo } : undefined)}</div></div></header>`;
  } else {
    band = `<header class="band"><div class="wrap">${crumbHtml}<h1>${h1}</h1>${meta.length ? `<div class="meta">${meta.map(x => `<span>${esc(x)}</span>`).join('')}</div>` : ''}</div></header>`;
  }
  // The tool for this page: a card beside the text on wide screens, a dock along the bottom on small ones.
  const offer = isHub ? (hub.cta[0] ? [hub.say, hub.cta[0][0], hub.cta[0][1]] : null) : (hub.promo || null);
  const ext = offer && /^https?:/.test(offer[2]);
  const promo = offer ? `<a class="promo" href="${offer[2]}"${ext ? ' rel="noopener"' : ''}><span class="ph">${isHub ? 'This tool' : 'The tool for this job'}</span><span class="pb"><b>${esc(hub.name)}</b><p>${esc(isHub ? (hub.promo ? hub.promo[0] : hub.say) : offer[0])}</p></span><span class="go">${esc(offer[1])} ${ext ? ARROW_UP : ARROW}</span></a>` : '';
  const dock = offer ? `<a class="dock" href="${offer[2]}"${ext ? ' rel="noopener"' : ''} data-dock><b>${esc(hub.name)}</b><span>${esc(offer[1])} ${ext ? ARROW_UP : ARROW}</span></a>` : '';
  const shots = isHub ? (SHOTS[segs[0]] || []) : [];
  const gallery = shots.length ? `<section class="shots"><div class="wrap"><div class="shots-head"><h2 class="hx">See it working.</h2><span class="typed">${shots.length} real screenshots. Click one to enlarge.</span></div><div class="strip">${shots.map((s, i) => `<figure class="shot"><a href="${shotSrc(s)}" data-zoom aria-label="Enlarge screenshot ${i + 1}${s.cap ? ': ' + esc(s.cap) : ''}"><img src="${shotSrc(s)}" alt="${esc(s.cap || hub.name)}" loading="lazy" decoding="async"></a>${s.cap ? `<figcaption><b>${String(i + 1).padStart(2, '0')}</b>${esc(s.cap)}</figcaption>` : ''}</figure>`).join('')}</div></div></section>` : '';
  const pick = CARDS.filter(c => c.k !== segs[0]).slice(0, 3);
  const more = `<section class="more"><div class="wrap"><div class="more-head"><h2 class="hx">More from the price list.</h2><a class="tlink" href="/#kit">All tools ${ARROW}</a></div><div class="tcards">${pick.map(tcard).join('')}</div></div></section>`;
  return `${head({ title, desc, url, extra: bl + app })}<body class="doc-page">${navHtml()}<main id="main">${band}${gallery}<div class="wrap doc-grid${wide ? ' wide' : ''}"><article class="prose"${wide ? '' : ' data-toc'}>${rest}</article>${wide ? '' : `<aside class="side">${promo}</aside>`}</div>${more}</main>${footHtml()}${dock}${scripts()}</body></html>`;
}

// ---------- homepage ----------
const money = n => n == null ? '' : n >= 1e9 ? '$' + (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? '$' + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e3 ? '$' + Math.round(n / 1e3) + 'K' : '$' + n;
const longDate = day => new Date(day + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const shortDate = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Johannesburg' });
const jtab = (j, on) => `<button type="button" role="tab" id="jt-${j.id}" aria-controls="${j.id}" aria-selected="${on}"${on ? '' : ' tabindex="-1"'}><b>${j.n}</b>${j.label}</button>`;
// One job: an orb with its small screen, the story in two short paragraphs, the facts and the way in. Only one shows at a time.
const job = ({ id, n, label, plat, h2, tale, say, fx, ctas, also = '', doc, on = false, extra = '' }) => `<section class="exhibit jpanel${on ? ' on' : ''}" id="${id}" role="tabpanel" aria-labelledby="jt-${id}">${doc}<div class="ex-tx"><p class="kick lbl"><b>${n}</b><span>${label}</span><span>${plat}</span></p><h3 class="hx">${h2}</h3><p class="tale">${tale}</p><p class="say">${say}</p>${facts(fx)}<div class="row-ctas">${ctas.map((c, k) => k ? `<a class="tlink" href="${c[1]}"${c[3] ? ` aria-label="${esc(c[3])}"` : ''}>${esc(c[0])} ${ARROW}</a>` : btn(c, '')).join('')}</div>${also ? `<p class="also">${also}</p>` : ''}</div>${extra}</section>`;

const PICK = {
  q: 'Where do you sell?', a: [
    ['WooCommerce', { q: 'What eats your time?', a: [
      ['Shipping', 'ship'], ['Taking payments', 'pay'],
      ['Bookkeeping', { q: 'Which accounting app?', a: [['Sage Accounting', 'sage'], ['FreeAgent', 'fa']] }]] }],
    ['Shopify', { q: 'What eats your time?', a: [
      ['Bookkeeping', { q: 'Which accounting app?', a: [['FreeAgent', 'll'], ['Sage Accounting', 'shsage']] }],
      ['Copying data off websites', 'lts']] }],
    ["I don't run a store", { q: 'What do you need?', a: [
      ['Tables and lists from websites', 'lts'], ['Company and funding data', 'data'], ['Saving DeepSeek chats', 'tk']] }]] };
const PICKS = {
  ship: ['Shipping for WooCommerce', 'Live The Courier Guy and Fastway rates, Pudo lockers and PAXI points at checkout. Pro books The Courier Guy and downloads the label PDF.', 'Get it free', WP('skillmerc-shipping-courier-guy-pudo-paxi'), '/sa-shipping-woocommerce/'],
  pay: ['PayFast for WooCommerce', 'Card, instant EFT, SnapScan and Mobicred. Each payment is checked, then the order marks itself paid.', 'Get it free', WP('skillmerc-payment-gateway-for-payfast'), '/payfast-woocommerce/'],
  sage: ['WooCommerce to Sage Accounting', 'Every paid order becomes a customer, a VAT invoice and a payment in Sage. Free.', 'Get it free', WP('skillmerc-sync-for-sage-accounting'), '/sage-accounting-woocommerce/'],
  fa: ['WooCommerce to FreeAgent', 'Every paid order becomes a contact, a VAT invoice and a payment in FreeAgent. Free.', 'Get it free', WP('skillmerc-sync-for-freeagent'), '/freeagent-woocommerce/'],
  ll: ['Ledgerline for Shopify', 'Paid Shopify orders into FreeAgent as VAT invoices, marked paid. In review at Shopify: get one email at launch.', 'Get the launch email', '/shopify-freeagent/#notify', '/shopify-freeagent/'],
  shsage: ['Shopify to Sage Accounting', 'Your options for getting Shopify sales into Sage today, and what Ledgerline for Sage UK will do.', 'Read the options', '/shopify-sage-accounting/', ''],
  lts: ['List & Table Scraper', 'One click turns any table or list on a web page into Excel, CSV or JSON. Free up to 3 pages per run.', 'Add to Firefox, free', AMO('list-table-scraper'), '/list-table-scraper/'],
  data: ['Data tools on Apify', 'Company filings, funding rounds and listings, straight into a spreadsheet. Pay per row.', 'Browse on Apify', 'https://apify.com/skillmerc', '/#data'],
  tk: ['Threadkeep', 'Save the DeepSeek chat you have open as Markdown, text, JSON, PDF or Word. In review at Firefox Add-ons.', 'See Threadkeep', '/threadkeep/', ''],
};
// In the in-tray: built and tested, waiting on a store's review. Update as reviews land.
const LAB = [
  ['/shopify-freeagent/', 'Ledgerline', 'Paid Shopify orders into FreeAgent, with VAT. From USD 9 a month, planned.', 'In review', 'Shopify'],
  ['/threadkeep/', 'Threadkeep', 'Save a DeepSeek chat as PDF, Markdown or Word.', 'In review', 'Firefox'],
  ['/riskwell/', 'Riskwell', 'A risk register and risk matrix inside Jira.', 'In review', 'Atlassian'],
  ['/decision-log-confluence/', 'Decision Keeper', 'Decision records and a register in Confluence.', 'In review', 'Atlassian'],
  ['/ship-rules/', 'Ship Rules', 'Proof before a Jira work item ships.', 'In review', 'Atlassian'],
];
export function homeBody({ actors = [], priceLine = () => '', fdDays = [] } = {}) {
  const day = fdDays.find(d => d.rows && d.rows.some(r => !r.pooled && r.sold));
  const guides = registry.filter(r => r.segs[1] === 'help' && r.segs.length > 2);
  const per1k = actors.map(a => (String(priceLine(a)).match(/USD ([\d.]+) per 1,000/) || [])[1]).filter(Boolean).sort((x, y) => x - y);
  const minPrice = per1k.length ? per1k[0] : null;
  const ops = day ? day.rows.filter(r => !r.pooled && r.sold).sort((a, b) => (b.sold || 0) - (a.sold || 0)) : [];
  const dataOpts = { rows: ops.slice(0, 4).map(r => [r.name.length > 20 ? r.name.slice(0, 19).replace(/[\s,.]+$/, '') : r.name, money(r.sold)]), date: day ? new Date(day.day + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }) : '' };
  // hero orbs: [screen, size, x%, y%, z, parallax depth, link, name, mobile size, mobile x%, mobile y%, opts]
  const O = [
    ['pay', 'clamp(150px,15vw,228px)', 54, 5, 2, .6, '#payments', 'Payments', '34vw', 2, 2],
    ['ship', 'clamp(200px,21.5vw,330px)', 76, 13, 4, 1.4, '#shipping', 'Courier shipping', '50vw', 38, 0],
    ['books', 'clamp(170px,18vw,276px)', 55, 47, 4, 1.1, '#books', 'Bookkeeping', '42vw', 6, 46],
    ['tables', 'clamp(150px,15.5vw,236px)', 80, 52, 2, 1.8, '#tables', 'Web tables into Excel', '36vw', 56, 54],
    ['data', 'clamp(130px,12.5vw,190px)', 69, 71, 5, .9, '#data', 'Public data', '0px', 0, 0, dataOpts],
  ];
  const dlist = `<div class="ledger" data-rv><div class="ledger-head"><h3>All ${actors.length} data tools</h3><p>Run on Apify. Pay per result.</p></div><div class="dlist">${actors.map(a => `<a href="/apify/${a.name}/" title="${esc(a.title.split(' - ')[0])}"><b>${esc(a.title.split(' - ')[0])}</b><span>${esc((String(priceLine(a)).match(/USD [\d.]+ per 1,000/) || ['Apify'])[0])}</span></a>`).join('')}</div></div>`;
  const pickG = ['payfast-order-still-pending', 'courier-guy-no-shipping-method', 'wikipedia-table-to-excel', 'freeagent-shopify-integration-discontinued', 'pudo-woocommerce', 'importhtml-not-working'];
  const glinks = pickG.map(s => guides.find(g => g.segs[2] === s)).filter(Boolean).concat(guides).filter((g, i, a) => a.indexOf(g) === i).slice(0, 6);
  const groupName = (seg) => (GUIDE_GROUPS.find(g => g[0] === seg) || [, 'Guide'])[1];
  const plist = PLIST({ nData: actors.length, minPrice });
  const allRows = plist.flatMap(g => g[2]); const nLive = allRows.filter(r => r[4] === 'live').length; const nReview = allRows.filter(r => r[4] === 'review').length; const nFree = allRows.filter(r => /<b>Free/.test(r[3])).length;

  const JOBS = [
    { id: 'shipping', n: '01', label: 'Shipping', plat: 'WooCommerce', h2: 'Real courier prices. Zero copy&#8209;paste.',
  tale: 'A flat rate is a guess. Guess high and the shopper leaves. Guess low and you pay the difference. This plugin asks the courier, while the shopper is still at checkout.',
  say: 'Live The Courier Guy and Fastway rates, a Pudo locker picker and a PAXI point picker. Pro books The Courier Guy and downloads the label PDF from the order.',
  fx: ['Free plugin', '*Pro USD 49 a year', 'South Africa'], ctas: [['Get it free', WP('skillmerc-shipping-courier-guy-pudo-paxi'), 'up', 'Get the shipping plugin free on WordPress.org'], ['How it works', '/sa-shipping-woocommerce/', '', 'How the shipping plugin works']], doc: orbFig('label') },
    { id: 'payments', n: '02', label: 'Payments', plat: 'WooCommerce', h2: 'Get paid. The order updates itself.',
  tale: 'The shopper paid. PayFast has the money. The order still says Pending, so nobody packs the box. This gateway checks each payment notice, then moves the order on by itself.',
  say: 'Card, instant EFT, SnapScan and Mobicred through PayFast. Every payment notice is checked before the order is marked paid.',
  fx: ['Free', 'PayFast', 'Signed ITN checks'], ctas: [['Get it free', WP('skillmerc-payment-gateway-for-payfast'), 'up', 'Get the PayFast gateway free on WordPress.org'], ['PayFast fixes', '/payfast-woocommerce/help/', '']], doc: orbFig('slip') },
    { id: 'books', n: '03', label: 'Bookkeeping', plat: 'Sage &middot; FreeAgent', h2: 'Every sale, already in the books.',
  tale: 'Month end. Orders in one window, your accounts in the other, and an afternoon of typing between them. These plugins do the typing the moment an order is paid.',
  say: 'Paid orders become invoices with the right VAT, plus the payment, in Sage or FreeAgent. No retyping at month end.',
  fx: ['Free for WooCommerce', 'Sage Accounting', 'FreeAgent'], ctas: [['Sage plugin', '/sage-accounting-woocommerce/', ''], ['FreeAgent plugin', '/freeagent-woocommerce/', '']],
  also: 'On Shopify? FreeAgent switched off its own Shopify link in 2025. <a href="/shopify-freeagent/">Ledgerline</a> is coming to fill it.', doc: orbFig('inv') },
    { id: 'tables', n: '04', label: 'Web tables', plat: 'Firefox', h2: 'Any web table. Into Excel.',
  tale: 'You need that table in Excel. You select it, copy it, paste it, and get one long column of soup. One click on this add-on finds the rows and keeps the columns.',
  say: 'List &amp; Table Scraper follows the Next button and exports CSV, Excel or JSON. Nothing leaves your browser.',
  fx: ['Free up to 3 pages', '*Pro up to 500', 'From USD 4 a month'], ctas: [['Add to Firefox, free', AMO('list-table-scraper'), 'up'], ['Watch the demo', '/list-table-scraper/#demo', '']], doc: orbFig('print') },
    { id: 'data', n: '05', label: 'Data', plat: 'Apify', h2: 'Public data, by the row.',
  tale: 'Public records are free. Getting them into a spreadsheet is the part that eats the afternoon. These tools run on Apify, and you pay only for the rows you get.',
  say: 'Company filings, funding rounds, transcripts and car listings, pulled straight into a spreadsheet.',
  fx: [`${actors.length} data tools`, minPrice != null ? `From USD ${minPrice} per 1,000 rows` : 'Pay per result', 'Nothing to install'], ctas: [['Browse on Apify', 'https://apify.com/skillmerc', 'up'], ['Who raised money this week', '/form-d/', '']],
  doc: orbFig('card', dataOpts) },
  ];
  JOBS[JOBS.length - 1].extra = `<div class="jx">${dlist}</div>`.replace(/ data-rv/g, '');
  return `<section class="hero"><canvas id="ribbon" aria-hidden="true"></canvas><div class="ribbon-fb" aria-hidden="true"></div>
<div class="orbs" data-orbs><span class="orb wire" style="--s:clamp(120px,13vw,200px);--x:90%;--y:38%;--z:1;--k:.4;--i:0;--ms:26vw;--mx:74%;--my:62%">${WIRE}</span>${O.map(([k, s, x, y, z, dep, href, name, ms, mx, my, opts], i) => orb(k, { tag: 'a', opts, attrs: ` href="${href}" aria-label="${esc(name)}" style="--s:${s};--x:${x}%;--y:${y}%;--z:${z};--k:${dep};--i:${i + 1};--bt:${8 + i * 1.3}s;--bd:-${i * 2}s;--ms:${ms};--mx:${mx}%;--my:${my}%"` })).join('')}</div>
<div class="wrap">
<p class="fact"><i></i><span><b>${nLive} tools live.</b> ${nFree} cost nothing. ${nReview} more in review.</span></p>
<h1><span class="ln">The boring parts,</span> <span class="ln dim">handled.</span></h1>
<p class="lede">Quoting couriers. Chasing payments. Retyping invoices. Copying tables. <b>One small tool per job.</b></p>
<div class="row-ctas">${btn(['See the tools', '#jobs', 'dn'], '')}<a class="tlink" href="#pick">Find my tool ${ARROW}</a></div>
</div>
<div class="wrap"><div class="runs"><span>Built for</span><a href="#kit">WooCommerce</a><a href="/shopify-freeagent/">Shopify</a><a href="/riskwell/">Jira</a><a href="/decision-log-confluence/">Confluence</a><a href="/list-table-scraper/">Firefox</a><a href="#data">Apify</a></div></div>
</section>

<section class="sec" id="jobs"><div class="wrap">${secRule('02', 'What they do', 'Example figures')}
<div class="sec-head"><h2 class="hx">Five jobs, off your desk.</h2><p>Pick one.</p></div>
<div class="jobs" data-jobs><div class="jtabs" role="tablist" aria-label="The five jobs">${JOBS.map((j, i) => jtab(j, i === 0)).join('')}</div>
${JOBS.map((j, i) => job({ ...j, on: i === 0 })).join('\n')}
</div>
<noscript><style>.jtabs{display:none}.jpanel{display:grid!important;margin-top:30px;padding-top:30px;border-top:1px solid var(--line)}</style></noscript>
</div></section>

<section class="sec" id="kit"><div class="wrap">${secRule('03', 'Price list', 'Prices in US dollars')}
<div class="sec-head"><h2 class="hx">The price list.</h2><p>${nLive} tools you can have today.</p></div>
<div class="plist">${plist.map(([g, sub, rows]) => [g, sub, rows.filter(r => r[4] === 'live'), rows.length]).filter(([, , rows]) => rows.length).map(([g, sub, rows, all]) => `<div class="pgroup"><h3>${esc(g)}${rows.length === all ? `<small>${esc(sub)}</small>` : ''}</h3><div>${rows.map(([no, job, tool, price, st, stl, href]) => `<a class="prow" href="${href}"><span class="no">${no}</span><span class="job">${esc(job)}<small>${esc(tool)}</small></span><span class="pr">${price}</span><span class="stc"><span class="st ${st}">${esc(stl)}</span></span><span class="go">${ARROW}</span></a>`).join('')}</div></div>`).join('')}</div>

<div class="pick" id="pick"><div class="pform" data-pick><div class="ph"><h2>Not sure which? <span class="dim">Three clicks at most.</span></h2><button class="back" type="button" hidden>Back</button></div><div class="pb"><div class="pq"><div><span class="lbl step" style="color:var(--mute)">Question 1</span><b class="ptitle" style="margin-top:8px">Where do you sell?</b></div><div class="opts2"></div></div><div class="pres" hidden><div><span class="lbl">Your tool</span><b class="pn"></b><p></p><div class="row-ctas"><a class="btn" href="#"></a><a class="tlink pmore" href="#">How it works ${ARROW}</a><button class="again" type="button">Start over</button></div></div></div></div>
<script type="application/json" id="pick-data">${JSON.stringify({ tree: PICK, picks: Object.fromEntries(Object.entries(PICKS).map(([k, v]) => [k, { n: v[0], p: v[1], c: v[2], h: v[3], m: v[4] }])) }).replace(/</g, '\\u003c')}</script></div>
</div></section>

<section class="sec" id="lab"><div class="wrap"><div class="duo">
<div>${secRule('04', 'In review', 'Waiting on store review')}
<h2 class="hx duo-h">Next up. <span class="dim">Built and tested.</span></h2>
<ul class="mini">${LAB.map(([h, n, p, , who]) => `<li><a href="${h}"><span class="nu"><b>${esc(n)}</b><small>${esc(p)}</small></span><span class="w">${esc(who)}</span></a></li>`).join('')}</ul></div>
<div id="guides">${secRule('05', 'The manual', `${guides.length} guides`)}
<h2 class="hx duo-h">Stuck? <span class="dim">Read the fix.</span></h2>
<ul class="mini">${glinks.map(g => `<li><a href="${g.url}"><span class="t1">${esc(g.h1)}</span>${ARROW}</a></li>`).join('')}</ul>
<div class="row-ctas"><a class="tlink" href="/guides/">All ${guides.length} guides ${ARROW}</a></div></div>
</div></div></section>

<section class="contact" id="contact"><div class="wrap">${secRule('06', 'Contact')}
<div class="ct-grid"><div><h2 class="hx">Got a boring job? <span class="dim">Hand it over.</span></h2>
<p><a class="mail" href="mailto:kyle@skillmerc.com">kyle@skillmerc.com</a></p>
<p class="say">Questions, bugs, or a tool you wish existed. Every email gets read.</p></div>
<div class="sig"><div><span class="lbl">Company</span><p>SKILLMERC (Pty) Ltd</p></div><div><span class="lbl">Registration</span><p>${REG}, South Africa</p></div><div><span class="lbl">Sells through</span><p>WordPress.org, Firefox Add-ons, Apify, Freemius</p></div></div></div>
</div></section>`;
}

export function guidesBody() {
  const guides = registry.filter(r => r.segs[1] === 'help' && r.segs.length > 2);
  const groups = GUIDE_GROUPS.map(([seg, label]) => { const gs = guides.filter(g => g.segs[0] === seg); if (!gs.length) return ''; return `<section class="glist"><h2>${esc(label)} <span>${String(gs.length).padStart(2, '0')}</span></h2><ul class="toc-list">${gs.map((g, i) => `<li><a href="${g.url}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(g.h1)}</span><span class="dl"></span><span class="g">Read</span></a></li>`).join('')}</ul></section>`; }).join('');
  return `<h1>Guides</h1><p>Short, practical fixes for the problems online stores hit most: payments stuck on pending, missing shipping methods, VAT that is a penny out, tables that will not paste. Most apply whichever plugin you use.</p>${groups}`;
}

function homePage(rel, title, desc, body) {
  const org = ld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': BASE + '/#org', name: 'SKILLMERC', legalName: 'SKILLMERC (Pty) Ltd', url: BASE + '/', email: 'kyle@skillmerc.com', logo: BASE + '/assets/touch.png', address: { '@type': 'PostalAddress', addressCountry: 'ZA' }, sameAs: ['https://profiles.wordpress.org/skillmerc/', 'https://apify.com/skillmerc', 'https://www.youtube.com/@skillmerc', 'https://github.com/skillmerc'] },
    { '@type': 'WebSite', '@id': BASE + '/#site', url: BASE + '/', name: 'SKILLMERC', publisher: { '@id': BASE + '/#org' } }] });
  return `${head({ title, desc, url: BASE + '/', extra: org })}<body class="home">${navHtml()}<main id="main">${nod(body)}</main>${footHtml()}${scripts()}</body></html>`;
}

export function notFoundBody() {
  return `<section class="lost"><div class="wrap"><div class="num">404</div><h1 class="hx">This page is not here.</h1><p>The link is old or mistyped. Everything we make is one click from the front page.</p><div class="row-ctas">${btn(['Back to the front page', '/', ''], '')}<a class="tlink" href="/guides/">Browse the guides ${ARROW}</a></div></div></section>`;
}

/** Render any page. Same signature as the old gen.mjs template. */
export function render(rel, title, desc, body) {
  if (rel === 'index.html') return homePage(rel, title, desc, body);
  if (rel === '404.html') return `${head({ title, desc, url: BASE + '/404.html', extra: '<meta name="robots" content="noindex">' })}<body class="home">${navHtml()}<main id="main">${body}</main>${footHtml()}${scripts()}</body></html>`;
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

/** Search index for the Cmd+K palette: every tool, then every page. */
export function searchIndex() {
  const tools = [['Shipping for WooCommerce', '/sa-shipping-woocommerce/', 'Tool', 'courier guy fastway pudo paxi locker rates label'], ['PayFast for WooCommerce', '/payfast-woocommerce/', 'Tool', 'payment gateway card eft snapscan mobicred itn'], ['WooCommerce to Sage Accounting', '/sage-accounting-woocommerce/', 'Tool', 'sage invoices vat bookkeeping'], ['WooCommerce to FreeAgent', '/freeagent-woocommerce/', 'Tool', 'freeagent invoices vat bookkeeping'], ['Ledgerline: Shopify to FreeAgent', '/shopify-freeagent/', 'Tool', 'shopify freeagent invoices vat'], ['List & Table Scraper', '/list-table-scraper/', 'Tool', 'scraper excel csv json table list firefox'], ['Threadkeep', '/threadkeep/', 'Tool', 'deepseek chat export pdf markdown word'], ['Riskwell for Jira', '/riskwell/', 'Tool', 'risk register matrix heat map jira'], ['Decision Keeper for Confluence', '/decision-log-confluence/', 'Tool', 'decision log record register confluence'], ['Ship Rules for Jira', '/ship-rules/', 'Tool', 'ship rules evidence release jira'], ['Data tools on Apify', '/#data', 'Tool', 'scraper companies house sec edgar form d youtube transcripts threads wayback'], ['Form D filings this week', '/form-d/', 'Data'], ['All guides', '/guides/', 'Guides']];
  const seen = new Set(tools.map(x => x[1]));
  const pages = registry.filter(r => !(r.segs[0] === 'form-d' && r.segs.length > 1) && !seen.has(r.url)).map(r => {
    const hub = HUBS[r.segs[0]]; const kind = r.segs[1] === 'help' ? 'Guide' : r.segs[0] === 'apify' ? 'Data tool' : (r.segs[0] === 'privacy' || r.segs.includes('privacy')) ? 'Privacy' : r.segs.includes('terms') ? 'Terms' : (hub ? hub.name : 'Page');
    return [r.h1, r.url, kind];
  });
  return JSON.stringify(tools.concat(pages));
}

/** Copy theme assets into the build output and write the theme's root files. */
export function copyAssets(out) {
  const src = path.join(HERE, 'static/assets'); const walk = (d, rel = '') => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p, rel + f + '/'); else { const o = path.join(out, 'assets', rel + f); fs.mkdirSync(path.dirname(o), { recursive: true }); fs.copyFileSync(p, o); } } };
  walk(src);
  fs.writeFileSync(path.join(out, 'favicon.svg'), FAVICON);
  fs.writeFileSync(path.join(out, 'assets', 'search.json'), searchIndex());
  fs.writeFileSync(path.join(out, '404.html'), render('404.html', 'Page not found: SKILLMERC', 'This page does not exist.', notFoundBody()));
}
