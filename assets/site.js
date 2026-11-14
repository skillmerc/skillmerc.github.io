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
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: .05 });
    rv.forEach(el => io.observe(el));
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

  d.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
