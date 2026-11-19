/* SKILLMERC site behaviour (theme v8). No dependencies. Everything here is an extra:
   the pages read and work with this file missing. */
(() => {
  const d = document;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" aria-hidden="true"><path d="M2 8h11M8.5 3.5 13 8l-4.5 4.5"/></svg>';

  // nav
  const nav = d.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('stuck', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const burger = nav.querySelector('.burger');
    if (burger) {
      const set = (open) => { nav.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); d.body.style.overflow = open ? 'hidden' : ''; };
      burger.addEventListener('click', () => set(!nav.classList.contains('open')));
      nav.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => set(false)));
      addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
    }
  }

  // the time where the work is done
  const clk = d.querySelector('[data-clock]');
  if (clk) { const f = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' }); const tick = () => { clk.textContent = 'South Africa ' + f.format(new Date()); }; tick(); setInterval(tick, 20000); }

  // reveal on scroll, and stamps that land when they come into view
  const rv = [...d.querySelectorAll('[data-rv],[data-thunk]')];
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    // a stamp is observed through its sheet so its own transform never hides it from the observer
    rv.forEach(el => { if (el.hasAttribute('data-thunk')) { const host = el.closest('.sheet,.pform,h2,.num') || el.parentElement; const o = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { setTimeout(() => el.classList.add('in'), 260); o.disconnect(); } }), { rootMargin: '0px 0px -22% 0px' }); o.observe(host); } else io.observe(el); });
    setTimeout(() => rv.forEach(el => { const r = (el.closest('.sheet') || el).getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('in'); }), 2200);
  } else rv.forEach(el => el.classList.add('in'));

  // orbs drift a little with the pointer
  const orbs = d.querySelector('[data-orbs]');
  if (orbs && fine && !reduce) {
    let raf = 0, tx = 0, ty = 0;
    addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - .5) * -22; ty = (e.clientY / innerHeight - .5) * -16; if (!raf) raf = requestAnimationFrame(() => { orbs.style.setProperty('--px', tx.toFixed(2)); orbs.style.setProperty('--py', ty.toFixed(2)); raf = 0; }); }, { passive: true });
  }

  // a section's orb leans toward the pointer
  if (fine && !reduce) d.querySelectorAll('.exhibit,.band.hub').forEach(sec => { const o = sec.querySelector('.ex-doc .orb'); if (!o) return;
    sec.addEventListener('pointermove', (e) => { const r = o.getBoundingClientRect(); const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight; o.style.setProperty('--ry', (dx * 16).toFixed(2) + 'deg'); o.style.setProperty('--rx', (dy * -14).toFixed(2) + 'deg'); }, { passive: true });
    sec.addEventListener('pointerleave', () => { o.style.setProperty('--ry', '0deg'); o.style.setProperty('--rx', '0deg'); }); });

  // the ribbon: one band of warm light behind the hero, drawn by a small shader. Falls back to a still gradient.
  (() => {
    const c = d.getElementById('ribbon'); if (!c) return;
    let gl = null; try { gl = c.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }); } catch {}
    if (!gl) { d.documentElement.classList.add('no-gl'); c.remove(); return; }
    const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const FS = `precision highp float;uniform vec2 r;uniform float t;
mat2 rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec3 band(vec2 p,float off,float t){
  float c=.16*sin(p.x*1.25+t+off)+.07*sin(p.x*2.9-t*1.4+off*2.);
  float w=.21+.13*sin(p.x*.9+t*.6+off*1.7);
  float v=(p.y-c)/w;
  float m=smoothstep(1.,.84,abs(v));
  float fold=.5+.5*sin(v*2.6+p.x*1.8+t*.9+off);
  float lines=.8+.2*sin(v*170.+sin(p.x*2.+t)*4.)*(.6+.4*sin(v*23.+p.x*3.));
  vec3 a=vec3(1.,.56,.24),b=vec3(1.,.22,.16),cc=vec3(1.,.3,.6),e=vec3(.46,.34,1.);
  float h=.5+.5*v;
  vec3 col=mix(mix(a,b,smoothstep(0.,.5,h)),mix(cc,e,smoothstep(.72,1.,h)),smoothstep(.45,.82,h));
  float edge=pow(abs(v),6.);
  return col*m*lines*(.16+.95*fold*fold+.55*edge);
}
void main(){
  vec2 uv=gl_FragCoord.xy/r; vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
  p-=vec2(.46,.1); p=rot(-.74)*p;
  vec3 col=band(p,0.,t)+.5*band(p*vec2(1.,1.3)+vec2(.34,.16),2.1,t*.8);
  col*=smoothstep(-1.1,.1,p.x)*smoothstep(1.5,.5,p.x);
  col*=.06+.94*smoothstep(.22,.62,uv.x);
  float g=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
  col+=(g-.5)*.05*smoothstep(.02,.2,max(col.r,max(col.g,col.b)));
  gl_FragColor=vec4(col,1.);
}`;
    const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
    const v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS); const pr = gl.createProgram();
    if (!v || !f) { d.documentElement.classList.add('no-gl'); c.remove(); return; }
    gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { d.documentElement.classList.add('no-gl'); c.remove(); return; }
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't');
    const size = () => { const dpr = Math.min(devicePixelRatio || 1, 1.5); const w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr); if (c.width !== w || c.height !== h) { c.width = w; c.height = h; gl.viewport(0, 0, w, h); } };
    let vis = true, raf = 0; const t0 = performance.now();
    const draw = () => { raf = 0; size(); gl.uniform2f(uR, c.width, c.height); gl.uniform1f(uT, reduce ? 2.4 : 2.4 + (performance.now() - t0) / 1000 * .22); gl.drawArrays(gl.TRIANGLES, 0, 3); if (vis && !reduce && !d.hidden) raf = requestAnimationFrame(draw); };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis) kick(); }).observe(c);
    d.addEventListener('visibilitychange', kick); addEventListener('resize', kick); kick();
    window.__ribbon = { draw: kick };
  })();

  // table of contents on long documents
  const prose = d.querySelector('.prose[data-toc]'), side = d.querySelector('.side');
  if (prose && side) {
    const hs = [...prose.querySelectorAll(':scope > h2, :scope > details.fold > summary > h2')];
    if (hs.length >= 3) {
      const used = new Set();
      const toc = d.createElement('nav'); toc.className = 'toc'; toc.setAttribute('aria-label', 'On this page');
      toc.innerHTML = '<h2>On this page</h2>';
      const links = hs.map(h => {
        if (!h.id) { let id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'section', n = id, i = 2; while (used.has(n) || d.getElementById(n)) n = id + '-' + i++; h.id = n; }
        used.add(h.id);
        const a = d.createElement('a'); a.href = '#' + h.id; a.textContent = h.textContent; a.addEventListener('click', () => { const f = h.closest('details'); if (f) f.open = true; }); toc.appendChild(a); return a;
      });
      side.prepend(toc);
      const mark = () => { let i = -1; const lim = Math.max(140, innerHeight * .4); hs.forEach((h, k) => { if (h.getBoundingClientRect().top < lim) i = k; }); links.forEach((l, k) => l.classList.toggle('on', k === i)); };
      addEventListener('scroll', mark, { passive: true }); mark();
    }
  }
  if (side && !side.children.length) side.remove();

  // the five jobs: one panel on screen at a time. Tabs pick it; so does any link to a panel's id (hero orbs, the price list, the nav).
  (() => {
    const root = d.querySelector('[data-jobs]'); if (!root) return;
    const tabs = [...root.querySelectorAll('[role="tab"]')], panels = tabs.map(t => d.getElementById(t.getAttribute('aria-controls')));
    const pick = (i, focus) => { tabs.forEach((t, k) => { const on = k === i; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; if (panels[k]) panels[k].classList.toggle('on', on); }); const tl = tabs[i].parentElement; tl.scrollLeft = tabs[i].offsetLeft - (tl.clientWidth - tabs[i].offsetWidth) / 2; if (focus) tabs[i].focus(); };
    tabs.forEach((t, i) => { t.addEventListener('click', () => pick(i));
      t.addEventListener('keydown', (e) => { if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); pick(e.key === 'Home' ? 0 : tabs.length - 1, true); return; } const k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!k) return; e.preventDefault(); pick((i + k + tabs.length) % tabs.length, true); }); });
    const go = (hash, focus) => { const i = panels.findIndex(p => p && '#' + p.id === hash); if (i < 0) return false; pick(i); if (focus) tabs[i].focus({ preventScroll: true }); (root.closest('section') || root).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); return true; };
    d.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a[href^="#"],a[href^="/#"]'); if (!a || location.pathname !== '/') return; const h = a.getAttribute('href').replace(/^\//, ''); if (go(h, true)) { e.preventDefault(); history.pushState(null, '', h); } });
    addEventListener('hashchange', () => go(location.hash)); go(location.hash);
  })();

  // folded sections open when a link points inside one
  (() => {
    const reveal = () => { if (location.hash.length < 2) return; let el; try { el = d.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) { return; } if (!el) return; let opened = false;
      for (let p = el; p; p = p.parentElement) if (p.tagName === 'DETAILS' && !p.open) { p.open = true; opened = true; } if (opened) el.scrollIntoView({ block: 'start' }); };
    if (d.querySelector('details.fold')) { addEventListener('hashchange', reveal); reveal(); }
  })();

  // screenshots: click one to see it full size; Escape or another click closes it
  d.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[data-zoom]'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault();
    const box = d.createElement('div'); box.className = 'zoom'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Screenshot, full size. ' + ((a.querySelector('img') || {}).alt || '') + ' Press Escape to close.'); box.tabIndex = -1;
    const img = new Image(); img.src = a.href; img.alt = (a.querySelector('img') || {}).alt || ''; box.appendChild(img);
    const key = (ev) => { if (ev.key === 'Escape') close(); else if (ev.key === 'Tab') { ev.preventDefault(); box.focus(); } }; const close = () => { box.remove(); removeEventListener('keydown', key); a.focus(); };
    box.addEventListener('click', close); addEventListener('keydown', key); d.body.appendChild(box); box.focus();
  });

  // wide tables scroll instead of breaking the layout
  d.querySelectorAll('.prose table').forEach(t => { const p = t.parentElement; if (p.style.overflowX === 'auto' || p.classList.contains('tw')) return; const w = d.createElement('div'); w.className = 'tw'; p.insertBefore(w, t); w.appendChild(t); });

  // dock: on small screens the tool for this page stays one tap away, out of the way at the top and the bottom
  const dock = d.querySelector('[data-dock]');
  if (dock) {
    const foot = d.querySelector('.foot');
    const upd = () => { const nearEnd = foot && foot.getBoundingClientRect().top < innerHeight - 40; dock.classList.toggle('on', scrollY > 520 && !nearEnd); };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  // search: every tool and guide (Cmd/Ctrl+K or "/")
  (() => {
    const btn = d.querySelector('[data-k]'); if (!btn) return;
    let idx = null, pal = null, input, list, sel = 0, items = [];
    const escH = (s) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const build = () => {
      pal = d.createElement('div'); pal.className = 'pal'; pal.setAttribute('role', 'dialog'); pal.setAttribute('aria-modal', 'true'); pal.setAttribute('aria-label', 'Search');
      pal.innerHTML = '<div class="pal-box"><div class="pal-in"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><circle cx="9" cy="9" r="6"/><path d="m14 14 3.5 3.5"/></svg><input type="search" placeholder="Search tools and guides" aria-label="Search tools and guides" autocomplete="off" spellcheck="false"><kbd>Esc</kbd></div><ul class="pal-list" role="listbox"></ul><div class="pal-foot"><span>&uarr; &darr; to move</span><span>Enter to open</span></div></div>';
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
    let qt = 0;
    const draw = () => {
      const q = input.value.toLowerCase().split(/\s+/).filter(Boolean);
      clearTimeout(qt); if (q.length) qt = setTimeout(() => { window.__smTrack && window.__smTrack({ e: 'search', q: q.join(' ').slice(0, 80), n: items.length }); }, 1400);
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

  // tool request form: two or three ticks, one answer
  (() => {
    const root = d.querySelector('[data-pick]'), data = d.getElementById('pick-data'); if (!root || !data) return;
    const { tree, picks } = JSON.parse(data.textContent);
    const pq = root.querySelector('.pq'), pres = root.querySelector('.pres'), title = root.querySelector('.ptitle'), opts = root.querySelector('.opts2'), step = root.querySelector('.step'), back = root.querySelector('.back'), stamp = pres.querySelector('.stamp');
    let path = [];
    const node = () => path.reduce((n, i) => n.a[i][1], tree);
    const show = () => {
      const n = node(); back.hidden = !path.length;
      if (typeof n === 'string') { const p = picks[n]; pq.hidden = true; pres.hidden = false;
        pres.querySelector('.pn').textContent = p.n; pres.querySelector('p').textContent = p.p;
        const c = pres.querySelector('.btn'); c.textContent = p.c + ' '; c.href = p.h; c.insertAdjacentHTML('beforeend', ARROW);
        if (/^https?:/.test(p.h)) c.setAttribute('rel', 'noopener'); else c.removeAttribute('rel');
        const m = pres.querySelector('.pmore'); m.hidden = !p.m; if (p.m) m.href = p.m;
        window.__smTrack && window.__smTrack({ e: 'pick', t: p.n });
        if (stamp && !reduce) { stamp.style.animation = 'none'; void stamp.offsetWidth; stamp.style.animation = 'thunk .4s cubic-bezier(.2,1.25,.4,1) .12s both'; }
        return; }
      pq.hidden = false; pres.hidden = true; title.textContent = n.q; step.textContent = 'Question ' + (path.length + 1);
      opts.innerHTML = ''; n.a.forEach(([label], i) => { const b = d.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', () => { path.push(i); show(); }); opts.appendChild(b); });
    };
    back.addEventListener('click', () => { path.pop(); show(); const f = opts.querySelector('button'); if (f) f.focus(); });
    root.querySelector('.again').addEventListener('click', () => { path = []; show(); const f = opts.querySelector('button'); if (f) f.focus(); });
    show();
  })();

  // page statistics: first-party, no cookies, no storage, nothing personal (see /privacy/website/). Off when the browser asks.
  (() => {
    if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl || !/^(www\.)?skillmerc\.com$/.test(location.hostname)) return;
    const EP = 'https://hq-production-e33c164a.up.railway.app/t';
    const id = Math.random().toString(36).slice(2, 10), t0 = Date.now(); let maxD = 0, tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch {}
    const send = (o) => { try { const b = JSON.stringify(Object.assign({ v: 1, id, p: location.pathname, w: innerWidth, tz, l: navigator.language || '' }, o)); fetch(EP, { method: 'POST', body: b, keepalive: true, headers: { 'content-type': 'text/plain' } }).catch(() => { try { navigator.sendBeacon && navigator.sendBeacon(EP, b); } catch {} }); } catch {} };
    let ref = ''; try { if (d.referrer) { const u = new URL(d.referrer); if (u.hostname !== location.hostname) ref = u.hostname + u.pathname; } } catch {}
    const qs = new URLSearchParams(location.search);
    send({ e: 'view', r: ref, us: qs.get('utm_source') || '', um: qs.get('utm_medium') || '', uc: qs.get('utm_campaign') || '', nf: /^Page not found/.test(d.title) ? 1 : 0 });
    addEventListener('scroll', () => { const h = d.documentElement.scrollHeight - innerHeight; if (h > 0) maxD = Math.max(maxD, Math.round(scrollY / h * 100)); }, { passive: true });
    d.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a,button'); if (!a) return; const href = a.getAttribute('href') || ''; const ext = /^(https?:|mailto:)/.test(href) && !href.includes('//' + location.hostname);
      if (!ext && !a.matches('.btn,.cta,.promo,.dock,.prow,.tcard,.orb,.tlink,.tray a,.toc-list a,.opts2 button')) return;
      const zone = a.closest('.dock,.promo,.hero,.plist,.pform,.exhibit,.band,.tray,.toc-list,.side,.prose,.more,.foot,.nav,.pal');
      send({ e: ext ? 'out' : 'click', h: href.slice(0, 200), t: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60), z: zone ? zone.className.split(' ')[0] : '' }); }, true);
    let left = false; const leave = () => { if (left) return; left = true; send({ e: 'leave', d: maxD, ms: Date.now() - t0 }); };
    addEventListener('pagehide', leave); d.addEventListener('visibilitychange', () => { if (d.visibilityState === 'hidden') leave(); });
    window.__smTrack = send;
  })();

  // videos: nothing loads from YouTube until the visitor presses play
  d.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('button[data-yt]'); if (!b) return;
    const f = d.createElement('iframe');
    f.src = b.dataset.yt + '?autoplay=1&rel=0'; f.title = (b.getAttribute('aria-label') || 'Video').replace(/^Play video: /, 'Video: ');
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'; f.allowFullscreen = true;
    b.parentNode.replaceChild(f, b); f.focus();
  });

  d.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // v10: a row of the struck list and its orb light up together (mouse and keyboard only)
  (() => {
    const list = d.querySelector('[data-struck]'), field = d.querySelector('[data-orbs]'); if (!list || !field) return;
    const rows = [...list.querySelectorAll('a[href^="#"]')];
    const set = (h, on) => { const o = field.querySelector('a.orb[href="' + h + '"]'), r = rows.find(x => x.getAttribute('href') === h); if (o) o.classList.toggle('lit', on); if (r) r.classList.toggle('lit', on); field.classList.toggle('has-lit', on && !!o); list.classList.toggle('has-lit', on && !!r); };
    rows.forEach(r => { const h = r.getAttribute('href'); if (fine) { r.addEventListener('pointerenter', () => set(h, true)); r.addEventListener('pointerleave', () => set(h, false)); } r.addEventListener('focus', () => set(h, true)); r.addEventListener('blur', () => set(h, false)); });
    if (fine) field.querySelectorAll('a.orb').forEach(o => { const h = o.getAttribute('href'); o.addEventListener('pointerenter', () => set(h, true)); o.addEventListener('pointerleave', () => set(h, false)); });
  })();
})();
