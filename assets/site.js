/* SKILLMERC site behaviour: nav, reveals, card tilt, table of contents. No dependencies. */
(() => {
  const d = document, root = d.documentElement;
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

  // reveal on scroll
  const rv = d.querySelectorAll('[data-rv]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    rv.forEach(el => io.observe(el));
  } else rv.forEach(el => el.classList.add('in'));

  // card tilt and glare
  if (fine && !reduce) {
    d.querySelectorAll('.card[data-tilt]').forEach(card => {
      let raf = 0;
      card.addEventListener('pointermove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => { raf = 0;
          const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          const k = +card.dataset.tilt || 5;
          card.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
          card.style.setProperty('--ry', ((x - .5) * k).toFixed(2) + 'deg'); card.style.setProperty('--rx', ((.5 - y) * k).toFixed(2) + 'deg');
        });
      });
      card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
    });
  }

  // table of contents on long documents
  const prose = d.querySelector('.prose[data-toc]'), grid = d.querySelector('.doc-grid');
  if (prose && grid) {
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
      grid.classList.add('has-toc'); grid.appendChild(toc);
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { const i = hs.indexOf(e.target); links.forEach((l, k) => l.classList.toggle('on', k === i)); } }), { rootMargin: '-90px 0px -70% 0px' });
        hs.forEach(h => io.observe(h));
      }
    }
  }

  // wide tables scroll instead of breaking the layout
  d.querySelectorAll('.prose table').forEach(t => { if (t.parentElement.style.overflowX === 'auto' || t.parentElement.classList.contains('tw')) return; const w = d.createElement('div'); w.className = 'tw'; w.style.overflowX = 'auto'; t.parentNode.insertBefore(w, t); w.appendChild(t); });

  // year
  d.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
