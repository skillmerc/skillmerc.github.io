// Shared renderer for the daily Form D pages. Used by gen.mjs (local) and by the GitHub Action in skillmerc/skillmerc.github.io (.github/formd/build.mjs).
export function renderFormD({ fdDays, page, esc, BASE }) {
  const fdLastmod = {};
  if (!fdDays.length) return fdLastmod;

  const actorUrl = 'https://apify.com/skillmerc/sec-form-d-funding-leads';
  const money = n => n==null ? '' : n>=1e9 ? '$'+(n/1e9).toFixed(2)+'B' : n>=1e6 ? '$'+(n/1e6).toFixed(n>=1e7?0:1)+'M' : n>=1e3 ? '$'+Math.round(n/1e3)+'K' : '$'+n;
  const long = day => new Date(day+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  const link = r => `https://www.sec.gov/Archives/edgar/data/${r.cik}/${r.accession.replace(/-/g,'')}/${r.accession}-index.htm`;
  const loc = r => [r.city, r.state].filter(Boolean).join(', ');
  const sortSold = (a,b) => (b.sold||0)-(a.sold||0) || (b.offering||0)-(a.offering||0);
  const opTable = rows => `<div style="overflow-x:auto"><table><thead><tr><th>Company</th><th>Location</th><th>Industry</th><th>Sold so far</th><th>Offering size</th><th>First sale</th><th>Exemption</th><th>Filing</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.name)}${r.new_co?' <small>(incorporated in the last 5 years)</small>':''}</td><td>${esc(loc(r))}</td><td>${esc(r.industry||'')}</td><td>${money(r.sold)}</td><td>${r.indefinite?'Indefinite':money(r.offering)}</td><td>${esc(r.first_sale||'')}</td><td>${esc((r.exemptions||[]).join(', '))}</td><td><a href="${link(r)}" rel="nofollow">SEC</a></td></tr>`).join('')}</tbody></table></div>`;
  const fundTable = rows => `<div style="overflow-x:auto"><table><thead><tr><th>Fund</th><th>Location</th><th>Sold so far</th><th>Offering size</th><th>Filing</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(loc(r))}</td><td>${money(r.sold)}</td><td>${r.indefinite?'Indefinite':money(r.offering)}</td><td><a href="${link(r)}" rel="nofollow">SEC</a></td></tr>`).join('')}</tbody></table></div>`;
  const cta = `<p><a class="cta" href="${actorUrl}">Get these as CSV or daily alerts</a> The <a href="/apify/sec-form-d-funding-leads/">SEC Form D Funding Leads</a> actor pulls the same filings with filters (state, industry, amount, new companies only), issuer phone and address, and the people named in each filing.</p>`;
  const note = `<p><small>Source: SEC EDGAR Form D filings (new notices only, amendments left out). Amounts are what the issuer reported. Not investment advice. Each row links to the original filing.</small></p>`;
  const dayNav = `<h2>Other days</h2><ul>${fdDays.map(d=>`<li><a href="/form-d/${d.day}/">${long(d.day)}</a>: ${d.rows.filter(r=>!r.pooled).length} companies, ${d.rows.filter(r=>r.pooled).length} funds</li>`).join('')}</ul>`;
  for (const d of fdDays) {
    const ops = d.rows.filter(r=>!r.pooled).sort(sortSold), funds = d.rows.filter(r=>r.pooled).sort(sortSold);
    const soldOps = ops.reduce((a,r)=>a+(r.sold||0),0);
    const states = Object.entries(ops.reduce((a,r)=>{ if(r.state) a[r.state]=(a[r.state]||0)+1; return a; },{})).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([s,n])=>`${s} ${n}`).join(', ');
    const top = ops.slice(0,3).map(r=>`${r.name} (${money(r.sold)||'not reported'})`).join(', ');
    const partial = d.collected_at.slice(0,10) <= d.day; const title = `New Form D filings ${long(d.day)}: ${ops.length} company raises${partial?' so far':''}`;
    const desc = `${ops.length} companies and ${funds.length} funds filed a new Form D with the SEC on ${long(d.day)}. Companies reported ${money(soldOps)} sold so far. Largest: ${top}.`;
    page(`form-d/${d.day}/index.html`, title, desc,
      `<h1>New Form D filings on ${long(d.day)}</h1><p>${ops.length} operating companies and ${funds.length} pooled investment funds filed a new Form D (notice of an exempt securities offering) with the SEC on ${long(d.day)}${partial?' (so far: this day was still in progress when the list was built at '+d.collected_at.slice(11,16)+' UTC)':''}. The companies reported ${money(soldOps)} sold so far in total.${states?` Most filings came from ${states}.`:''}</p>${cta}<h2>Companies (${ops.length}), largest amount sold first</h2>${opTable(ops)}<h2>Pooled investment funds (${funds.length})</h2>${fundTable(funds)}${note}${dayNav}`);
    fdLastmod[`${BASE}/form-d/${d.day}/`] = d.collected_at.slice(0,10);
  }
  const week = fdDays.slice(0,5); const wkOps = week.flatMap(d=>d.rows.filter(r=>!r.pooled).map(r=>({...r, day:d.day}))).sort(sortSold);
  page('form-d/index.html', 'New Form D filings this week: startup and company funding rounds', `Daily list of new SEC Form D filings: ${wkOps.length} company raises in the last ${week.length} filing days, largest first, with amount sold, offering size and a link to each filing.`,
    `<h1>New Form D filings this week</h1><p>Every US company raising money under Regulation D (Rule 506(b), 506(c), Rule 504) files a Form D with the SEC within 15 days of its first sale. This page lists the new filings from the last ${week.length} filing days (${long(week[week.length-1].day)} to ${long(week[0].day)}): ${wkOps.length} operating companies. Pooled investment funds are listed on each day's page.</p>${cta}<h2>Largest company raises this week</h2>${opTable(wkOps.slice(0,40))}${note}<h2>By day</h2><ul>${fdDays.map(d=>`<li><a href="/form-d/${d.day}/">${long(d.day)}</a>: ${d.rows.filter(r=>!r.pooled).length} companies, ${d.rows.filter(r=>r.pooled).length} funds</li>`).join('')}</ul>`);
  fdLastmod[`${BASE}/form-d/`] = fdDays[0].collected_at.slice(0,10);

  return fdLastmod;
}
