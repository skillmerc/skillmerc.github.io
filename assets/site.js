/* SKILLMERC site behaviour. No dependencies. */
(() => {
  const d = document;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // nav
  const nav = d.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('stuck', scrollY > 24);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const burger = nav.querySelector('.burger');
    if (burger) {
      const set = (open) => { nav.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); d.body.style.overflow = open ? 'hidden' : ''; };
      burger.addEventListener('click', () => set(!nav.classList.contains('open')));
      nav.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => set(false)));
      addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
    }
  }

  // local time in Pretoria
  const clk = d.querySelector('[data-clock]');
  if (clk) { const f = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' }); const tick = () => { clk.textContent = 'Pretoria ' + f.format(new Date()); }; tick(); setInterval(tick, 20000); }

  // reveal on scroll
  const rv = d.querySelectorAll('[data-rv],[data-wipe]');
  if ('IntersectionObserver' in window && !reduce) {
    // clip-path hides [data-wipe] from the observer, so watch its parent instead
    const map = new Map();
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { (map.get(e.target) || []).forEach(el => el.classList.add('in')); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    rv.forEach(el => { const t = el.hasAttribute('data-wipe') ? el.parentElement : el; if (!map.has(t)) map.set(t, []); map.get(t).push(el); io.observe(t); });
    setTimeout(() => rv.forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('in'); }), 1800);
  } else rv.forEach(el => el.classList.add('in'));

  // table of contents on long documents
  const prose = d.querySelector('.prose[data-toc]'), side = d.querySelector('.side');
  if (prose && side) {
    const hs = [...prose.querySelectorAll(':scope > h2')];
    if (hs.length >= 3) {
      const used = new Set();
      const toc = d.createElement('nav'); toc.className = 'toc'; toc.setAttribute('aria-label', 'On this page');
      toc.innerHTML = '<h2>On this page</h2>';
      const links = hs.map(h => {
        if (!h.id) { let id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'section', n = id, i = 2; while (used.has(n) || d.getElementById(n)) n = id + '-' + i++; h.id = n; }
        used.add(h.id);
        const a = d.createElement('a'); a.href = '#' + h.id; a.textContent = h.textContent; toc.appendChild(a); return a;
      });
      side.prepend(toc);
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { const i = hs.indexOf(e.target); links.forEach((l, k) => l.classList.toggle('on', k === i)); } }), { rootMargin: '-90px 0px -70% 0px' });
        hs.forEach(h => io.observe(h));
      }
    }
  }
  if (side && !side.children.length) side.remove();

  // wide tables scroll instead of breaking the layout
  d.querySelectorAll('.prose table').forEach(t => { const p = t.parentElement; if (p.style.overflowX === 'auto' || p.classList.contains('tw')) return; const w = d.createElement('div'); w.className = 'tw'; p.insertBefore(w, t); w.appendChild(t); });

  // the kit: floating render follows the cursor
  const peek = d.querySelector('.peek');
  if (peek && fine && !reduce) {
    const img = peek.querySelector('img'); let x = innerWidth / 2, y = innerHeight / 2, px = x, py = y, raf = 0;
    const loop = () => { px += (x - px) * .16; py += (y - py) * .16; peek.style.left = px + 'px'; peek.style.top = py + 'px'; raf = Math.abs(x - px) + Math.abs(y - py) > .5 ? requestAnimationFrame(loop) : 0; };
    d.querySelectorAll('.rows a[data-peek]').forEach(a => {
      a.addEventListener('pointerenter', () => { img.src = a.dataset.peek; peek.classList.add('on'); });
      a.addEventListener('pointerleave', () => peek.classList.remove('on'));
      a.addEventListener('pointermove', (e) => { x = Math.max(e.clientX + 200, innerWidth * .66); y = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
    });
  }

  // mercury thermometer: fills as you scroll the page
  const rail = d.querySelector('.rail');
  if (rail) {
    const col = rail.querySelector('.hgcol'), lbl = rail.querySelector('.lbl');
    const marks = [...d.querySelectorAll('[data-rail]')];
    const upd = () => {
      const max = d.documentElement.scrollHeight - innerHeight; const p = max > 0 ? Math.min(1, scrollY / max) : 0;
      col.style.height = (p * 100).toFixed(2) + '%'; rail.classList.toggle('on', scrollY > innerHeight * .4);
      let cur = marks[0]; for (const m of marks) if (m.getBoundingClientRect().top < innerHeight * .5) cur = m;
      if (cur && lbl.textContent !== cur.dataset.rail) lbl.textContent = cur.dataset.rail;
    };
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  }

  // cursor ring and magnetic buttons (mouse only)
  if (fine && !reduce) {
    const cur = d.createElement('div'); cur.className = 'cur'; cur.setAttribute('aria-hidden', 'true'); d.body.appendChild(cur);
    let cx = 0, cy = 0, tx = 0, ty = 0, on = false;
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; if (!on) { on = true; cx = tx; cy = ty; cur.classList.add('on'); } }, { passive: true });
    d.addEventListener('pointerleave', () => { on = false; cur.classList.remove('on'); });
    const loop = () => { cx += (tx - cx) * .22; cy += (ty - cy) * .22; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); }; loop();
    d.querySelectorAll('a,button,input,textarea,select,label').forEach(el => { el.addEventListener('pointerenter', () => cur.classList.add('big')); el.addEventListener('pointerleave', () => cur.classList.remove('big')); });
    d.querySelectorAll('.btn').forEach(b => {
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${((e.clientX - r.left) / r.width - .5) * 10}px,${((e.clientY - r.top) / r.height - .5) * 8}px)`; });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  // live product demos: small loops that run only while on screen
  const demos = [...d.querySelectorAll('.demo')];
  if (demos.length) {
    const $ = (el, q) => [...el.querySelectorAll(q)];
    const runs = {
      ship: async (el, w) => { const li = $(el, '.opts li'); el.classList.remove('done'); li.forEach(x => x.classList.remove('on')); el.classList.add('loading'); await w(1200); el.classList.remove('loading'); for (const i of [0, 2, 1, 2]) { li.forEach((x, k) => x.classList.toggle('on', k === i)); await w(1100); } el.classList.add('done'); await w(2800); },
      pay: async (el, w) => { const st = $(el, '.steps li'), pill = el.querySelector('.st'); el.classList.remove('done'); st.forEach(x => x.classList.remove('on')); pill.textContent = pill.dataset.a; pill.classList.remove('paid'); await w(900); for (const x of st) { x.classList.add('on'); await w(850); } pill.textContent = pill.dataset.b; pill.classList.add('paid'); el.classList.add('done'); await w(3000); },
      books: async (el, w) => { el.classList.remove('go', 'done'); await w(1100); el.classList.add('go'); await w(1000); el.classList.add('done'); await w(3200); },
      tables: async (el, w) => { const rows = $(el, '.sheet .r:not(.h)'), cnt = el.querySelector('.cnt'), pg = el.querySelector('.pg'); el.classList.remove('done'); rows.forEach(r => r.classList.remove('on', 'flash')); cnt.textContent = '0 rows'; pg.textContent = 'Page 1'; await w(700);
        for (let i = 0; i < rows.length; i++) { if (i === 3) { pg.textContent = 'Next page'; await w(700); pg.textContent = 'Page 2'; } rows[i].classList.add('on', 'flash'); setTimeout(() => rows[i].classList.remove('flash'), 500); cnt.textContent = (i + 1) + (i ? ' rows' : ' row'); await w(420); }
        el.classList.add('done'); await w(3000); },
      feed: async (el, w) => { const ul = el.querySelector('.feed'); await w(2300); const last = ul.lastElementChild; ul.removeChild(last); ul.prepend(last); },
    };
    const start = (el) => {
      if (el._run) return; const fn = runs[el.dataset.demo]; if (!fn) return;
      el._run = true; const w = (ms) => new Promise(r => setTimeout(r, ms));
      (async () => { while (el._vis) { await fn(el, w); } el._run = false; })();
    };
    if (reduce || !('IntersectionObserver' in window)) demos.forEach(el => { el.classList.add('shown', 'done', 'go'); el.querySelectorAll('.opts li:first-child,.steps li,.sheet .r').forEach(x => x.classList.add('on')); const st = el.querySelector('.st'); if (st) { st.textContent = st.dataset.b; st.classList.add('paid'); } });
    else { const io = new IntersectionObserver((es) => es.forEach(e => { const el = e.target; el._vis = e.isIntersecting; if (e.isIntersecting) { el.classList.add('shown'); start(el); } }), { threshold: .35 }); demos.forEach(el => io.observe(el)); }
  }

  // command palette: search every tool and guide (Cmd/Ctrl+K or "/")
  (() => {
    const btn = d.querySelector('[data-k]'); if (!btn) return;
    let idx = null, pal = null, input, list, sel = 0, items = [];
    const escH = (s) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const build = () => {
      pal = d.createElement('div'); pal.className = 'pal'; pal.setAttribute('role', 'dialog'); pal.setAttribute('aria-modal', 'true'); pal.setAttribute('aria-label', 'Search');
      pal.innerHTML = '<div class="pal-box"><div class="pal-in"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="9" cy="9" r="6"/><path d="m14 14 3.5 3.5"/></svg><input type="search" placeholder="Search tools and guides" aria-label="Search tools and guides" autocomplete="off" spellcheck="false"><kbd>Esc</kbd></div><ul class="pal-list" role="listbox"></ul><div class="pal-foot"><span>&uarr; &darr; to move</span><span>Enter to open</span></div></div>';
      d.body.appendChild(pal); input = pal.querySelector('input'); list = pal.querySelector('.pal-list');
      pal.addEventListener('click', (e) => { if (e.target === pal) close(); });
      input.addEventListener('input', () => { sel = 0; draw(); });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); mark(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
        else if (e.key === 'Enter' && items[sel]) { e.preventDefault(); location.href = items[sel][1]; }
      });
    };
    const score = (q, t) => { t = t.toLowerCase(); let s = 0; for (const w of q) { const i = t.indexOf(w); if (i < 0) return -1; s += i === 0 ? 3 : (t[i - 1] === ' ' ? 2 : 1); } return s; };
    const hl = (t, q) => { let h = escH(t); for (const w of q) if (w.length > 1) h = h.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); return h; };
    const draw = () => {
      const q = input.value.toLowerCase().split(/\s+/).filter(Boolean);
      items = !q.length ? idx.filter(x => x[2] === 'Tool' || x[2] === 'Guides' || x[2] === 'Data') : idx.map(x => [x, score(q, x[0] + ' ' + x[2] + ' ' + (x[3] || ''))]).filter(x => x[1] >= 0).sort((a, b) => b[1] - a[1]).slice(0, 12).map(x => x[0]);
      list.innerHTML = items.length ? items.map((x, i) => `<li role="option"${i === sel ? ' class="on"' : ''}><a href="${x[1]}"><b>${hl(x[0], q)}</b><span>${escH(x[2])}</span></a></li>`).join('') : '<li class="pal-empty">Nothing found. Try "PayFast", "Pudo" or "Excel".</li>';
      list.querySelectorAll('li a').forEach((a, i) => a.addEventListener('mousemove', () => { if (sel !== i) { sel = i; mark(); } }));
    };
    const mark = () => list.querySelectorAll('li').forEach((li, i) => { li.classList.toggle('on', i === sel); if (i === sel) li.scrollIntoView({ block: 'nearest' }); });
    const open = async () => {
      if (!pal) build();
      pal.classList.add('open'); d.body.style.overflow = 'hidden'; input.value = ''; sel = 0;
      if (!idx) { list.innerHTML = '<li class="pal-empty">Loading</li>'; try { idx = await (await fetch('/assets/search.json')).json(); } catch { idx = []; } }
      draw(); setTimeout(() => input.focus(), 30);
    };
    const close = () => { if (!pal) return; pal.classList.remove('open'); d.body.style.overflow = ''; btn.focus(); };
    btn.addEventListener('click', open);
    addEventListener('keydown', (e) => {
      const typing = /input|textarea|select/i.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); pal && pal.classList.contains('open') ? close() : open(); }
      else if (e.key === 'Escape' && pal && pal.classList.contains('open')) close();
    });
    if (!/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) { const k = btn.querySelector('kbd'); if (k) k.textContent = 'Ctrl K'; }
  })();

  // tool picker: two or three questions, one answer
  (() => {
    const root = d.querySelector('[data-pick]'), data = d.getElementById('pick-data'); if (!root || !data) return;
    const { tree, picks } = JSON.parse(data.textContent);
    const pq = root.querySelector('.pq'), pres = root.querySelector('.pres'), title = root.querySelector('.ptitle'), opts = root.querySelector('.opts2'), step = root.querySelector('.step'), back = root.querySelector('.back');
    let path = [];
    const node = () => path.reduce((n, i) => n.a[i][1], tree);
    const show = () => {
      const n = node();
      if (typeof n === 'string') { const p = picks[n]; pq.hidden = true; pres.hidden = false;
        pres.querySelector('img').src = p.r; pres.querySelector('b').textContent = p.n; pres.querySelector('p').textContent = p.p;
        const c = pres.querySelector('.btn'); c.textContent = p.c + ' '; c.href = p.h; c.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 8h11M9 3.5 13.5 8 9 12.5"/></svg>');
        if (/^https?:/.test(p.h)) c.setAttribute('rel', 'noopener'); else c.removeAttribute('rel');
        const m = pres.querySelector('.pmore'); m.hidden = !p.m; if (p.m) m.href = p.m; return; }
      pq.hidden = false; pres.hidden = true; title.textContent = n.q; step.textContent = 'Step ' + String(path.length + 1).padStart(2, '0'); back.hidden = !path.length;
      opts.innerHTML = ''; n.a.forEach(([label], i) => { const b = d.createElement('button'); b.type = 'button'; b.textContent = label; b.style.setProperty('--i', i); b.addEventListener('click', () => { path.push(i); show(); }); opts.appendChild(b); });
    };
    back.addEventListener('click', () => { path.pop(); show(); });
    root.querySelector('.again').addEventListener('click', () => { path = []; show(); });
    show();
  })();

  d.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
