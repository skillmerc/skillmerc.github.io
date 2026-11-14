/* SKILLMERC quicksilver scene. Raw WebGL2, no libraries.
   A raymarched body of liquid metal that pours itself into a new shape for each
   section of the page: droplets, a table of beads, a coin, a ledger stack, a browser window, one drop. */
(() => {
  const canvas = document.getElementById('merc');
  if (!canvas) return;
  const root = document.documentElement;
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!window.__mercKeep });
  if (!gl) { root.classList.add('no-gl'); return; }

  const VS = `#version 300 es
in vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`;

  const FS = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec4 uB[9]; uniform float uK;
uniform vec3 uW; uniform mat3 uRC, uRL, uRW; uniform vec2 uOff; uniform float uZoom; uniform float uHQ; uniform float uRip; uniform float uDim;
out vec4 o;
const float CAM = 7.0;
const float BOUND = 2.75;

float smin(float a, float b, float k){ float h = max(k - abs(a-b), 0.)/k; return min(a,b) - h*h*h*k*(1./6.); }
float smax(float a, float b, float k){ return -smin(-a, -b, k); }
float rbox(vec3 p, vec3 b, float r){ vec3 q = abs(p) - b + r; return length(max(q,0.)) + min(max(q.x, max(q.y,q.z)), 0.) - r; }
float rcyl(vec3 p, float R, float rb, float h){ vec2 d = vec2(length(p.xy) - R + rb, abs(p.z) - h + rb); return min(max(d.x,d.y),0.) + length(max(d,0.)) - rb; }
float caps(vec3 p, vec3 a, vec3 b, float r){ vec3 pa = p-a, ba = b-a; float h = clamp(dot(pa,ba)/dot(ba,ba), 0., 1.); return length(pa - ba*h) - r; }

float coin(vec3 p){
  float d = rcyl(p, 1.2, .055, .125);
  vec3 f = vec3(p.xy, abs(p.z) - .125);
  d = smax(d, -rcyl(f, 1.0, .03, .04), .03);
  float ring = abs(length(p.xy) - .72) - .028; ring = max(ring, abs(f.z + .03) - .03);
  d = smin(d, ring, .04);
  vec3 q = vec3(p.xy, abs(p.z) - .085) / vec3(.4, .4, .085);
  d = smin(d, (length(q) - 1.) * .085, .06);
  return d;
}
float ledger(vec3 p){
  float d = 1e5;
  for (int i = 0; i < 4; i++) {
    float fi = float(i) - 1.5; float a = fi * .19; float c = cos(a), s = sin(a);
    vec3 q = p - vec3(fi * .07, fi * .31, 0.); q.xz = mat2(c, -s, s, c) * q.xz;
    d = min(d, rbox(q, vec3(1.12, .085, .8), .07));
  }
  return d;
}
float win(vec3 p){
  float outer = rbox(p, vec3(1.45, 1.02, .11), .12);
  float inner = rbox(p - vec3(0., -.14, 0.), vec3(1.31, .74, .6), .07);
  float d = smax(outer, -inner, .03);
  for (int i = 0; i < 3; i++) {
    float y = .3 - float(i) * .4; float L = i == 0 ? 1.25 : (i == 1 ? .85 : 1.05);
    d = min(d, caps(p, vec3(-.98, y, 0.), vec3(-.98 + L, y, 0.), .085));
    d = min(d, caps(p, vec3(.62, y, 0.), vec3(.98, y, 0.), .085));
  }
  return d;
}
float map(vec3 p){
  float d = 1e5;
  for (int i = 0; i < 9; i++) { vec4 b = uB[i]; if (b.w > .002) d = smin(d, length(p - b.xyz) - b.w, uK); }
  if (uW.x > .02) d = smin(d, coin(uRC * p / uW.x) * uW.x, uK);
  if (uW.y > .02) d = smin(d, ledger(uRL * p / uW.y) * uW.y, uK);
  if (uW.z > .02) d = smin(d, win(uRW * p / uW.z) * uW.z, uK);
  d += uRip * .014 * sin(p.x*3.7 + uTime*1.1) * sin(p.y*4.3 - uTime*.9) * sin(p.z*3.9 + uTime*.7);
  return d;
}
vec3 nrm(vec3 p){ const vec2 e = vec2(.0025, -.0025); return normalize(e.xyy*map(p+e.xyy) + e.yyx*map(p+e.yyx) + e.yxy*map(p+e.yxy) + e.xxx*map(p+e.xxx)); }

float card(vec3 d, vec3 n, vec3 u, vec2 size, float soft){
  float dn = dot(d, n); if (dn <= 0.) return 0.;
  vec3 v = cross(n, u); vec3 p = d / dn;
  vec2 q = abs(vec2(dot(p,u), dot(p,v))) - size;
  return (1. - smoothstep(-soft, soft, max(q.x, q.y))) * smoothstep(0., .25, dn);
}
vec3 env(vec3 d){
  vec3 c = mix(vec3(.012,.013,.016), vec3(.075,.08,.095), smoothstep(-.2, 1., d.y));
  c = mix(c, vec3(.02,.014,.012) + vec3(.05,.02,.01) * smoothstep(-.1, -1., d.y), smoothstep(.02, -.12, d.y));
  vec3 nK = normalize(vec3(.12, 1., .42)); vec3 uK = normalize(cross(vec3(0.,0.,1.), nK));
  float k = card(d, nK, uK, vec2(.95, .55), .1);
  vec3 pk = d / max(dot(d, nK), 1e-3); float gx = abs(fract(dot(pk, uK) * 1.6 + .5) - .5);
  c += vec3(1., .975, .94) * 2.9 * k * (1. - .55 * smoothstep(.035, .012, gx));
  vec3 nR = normalize(vec3(-1., .12, .32));
  c += vec3(1., .13, .02) * 2.6 * card(d, nR, vec3(0.,1.,0.) - nR*nR.y, vec2(1.25, .11), .05);
  vec3 nC = normalize(vec3(1., .35, -.15));
  c += vec3(.5, .68, 1.) * 1.9 * card(d, nC, normalize(vec3(0.,1.,0.) - nC*nC.y), vec2(1.1, .16), .06);
  vec3 nB = normalize(vec3(.2, .25, -1.));
  c += vec3(.9,.95,1.) * .85 * card(d, nB, normalize(vec3(1.,0.,0.) - nB*nB.x), vec2(2.2, .5), .3);
  vec3 nF = normalize(vec3(.25, -.2, 1.));
  c += vec3(.17, .175, .19) * card(d, nF, normalize(vec3(1.,0.,0.) - nF*nF.x), vec2(1.5, .8), .5);
  return c;
}
float accent(vec3 p){ return 1. - smoothstep(.015, .2, length(p - uB[0].xyz) - uB[0].w); }
float occ(vec3 p, vec3 n){ return mix(.22, 1., clamp(map(p + n*.1)/.1, 0., 1.)*.5 + clamp(map(p + n*.34)/.34, 0., 1.)*.5); }
vec3 lacquer(vec3 n, vec3 refl, float fr){
  float dif = .5 + .5 * dot(n, normalize(vec3(.15, .9, .45)));
  return vec3(.86, .075, .018) * (.2 + 1.0 * dif * dif) + refl * (.045 + .6 * fr);
}
vec3 shade(vec3 p, vec3 rd){
  vec3 n = nrm(p); vec3 r = reflect(rd, n);
  float fr = pow(1. - max(dot(-rd, n), 0.), 5.);
  vec3 refl = env(r);
  if (uHQ > .5) {
    float t2 = .06; bool h2 = false; vec3 p2 = p;
    for (int i = 0; i < 22; i++) { p2 = p + n*.012 + r*t2; float d = map(p2); if (d < .004) { h2 = true; break; } t2 += d; if (t2 > 4.5) break; }
    if (h2) {
      vec3 n2 = nrm(p2); vec3 r2 = reflect(r, n2); vec3 e2 = env(r2);
      float f2 = pow(1. - max(dot(-r, n2), 0.), 5.);
      vec3 c2 = mix(e2 * vec3(.84,.86,.9), lacquer(n2, e2, f2), accent(p2));
      refl = c2 * mix(.35, 1., clamp(map(p2 + n2*.2)/.2, 0., 1.)) * .88;
    }
  }
  float ao = occ(p, n);
  float rim = mix(.3, 1., smoothstep(0., .14, dot(n, -rd)));
  vec3 chrome = refl * mix(vec3(.84,.86,.9), vec3(1.), fr) * rim;
  return mix(chrome, lacquer(n, refl, fr), accent(p)) * ao;
}
float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec3 backdrop(vec2 uv, vec2 q){
  vec3 c = mix(vec3(.0105,.011,.013), vec3(.0045,.0045,.0055), smoothstep(-.9, 1.1, uv.y * -1.));
  c += vec3(.95,.16,.04) * .013 * exp(-dot(q + vec2(.5,.1), q + vec2(.5,.1)) * .9);
  c += vec3(.45,.6,.95) * .014 * exp(-dot(q - vec2(.55,.35), q - vec2(.55,.35)) * 1.1);
  c += vec3(.5,.52,.58) * .016 * exp(-dot(q, q) * .7);
  return c;
}
void main(){
  vec2 uv = (gl_FragCoord.xy * 2. - uRes) / uRes.y;
  vec2 q = (uv - uOff) / uZoom;
  const float F = 2.75;
  vec3 ro = vec3(0., 0., CAM); vec3 rd = normalize(vec3(q, -F));
  vec3 col = backdrop(uv, q);
  float b = dot(ro, rd); float c0 = dot(ro, ro) - BOUND*BOUND; float h = b*b - c0;
  if (h > 0.) {
    h = sqrt(h); float t = -b - h; float tf = -b + h;
    float e = 1e5; vec3 pc = ro; bool hit = false; vec3 p = ro;
    for (int i = 0; i < 64; i++) {
      p = ro + rd*t; float d = map(p); float r = d / t;
      if (r < e) { e = r; pc = p; }
      if (d < .0012 * t) { hit = true; break; }
      t += d * .92; if (t > tf) break;
    }
    float px = 2. / (uRes.y * F * uZoom);
    float cov = hit ? 1. : 1. - smoothstep(0., px * 1.6, e);
    if (cov > .003) col = mix(col, shade(hit ? p : pc, rd), cov);
    // soft bloom of the cinnabar bead
    vec3 oc = uB[0].xyz - ro; float tb = dot(oc, rd); float db = length(oc - rd*tb);
    col += vec3(1., .14, .03) * .07 * uB[0].w * exp(-db*db / max(uB[0].w*uB[0].w*5., 1e-4));
  }
  col *= 1. - .32 * dot(uv * vec2(.42, .5), uv * vec2(.42, .5));
  col *= uDim;
  col = (col * (2.51*col + .03)) / (col * (2.43*col + .59) + .14);
  col = pow(clamp(col, 0., 1.), vec3(1./2.2));
  col += (hash(gl_FragCoord.xy + fract(uTime) * 91.7) - .5) * (2.6/255.);
  o = vec4(col, 1.);
}`;

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error('merc shader', gl.getShaderInfoLog(s)); return null; } return s; };
  const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { root.classList.add('no-gl'); return; }
  const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error('merc link', gl.getProgramInfoLog(prog)); root.classList.add('no-gl'); return; }
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; for (const n of ['uRes','uTime','uB','uK','uW','uRC','uRL','uRW','uOff','uZoom','uHQ','uRip','uDim']) U[n] = gl.getUniformLocation(prog, n);

  // ---------- formations ----------
  const N = 9, TAU = Math.PI * 2;
  const mix = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, on: 0, live: 0, px: 0, py: 0, sx: 0, sy: 0 };
  // each formation returns N entries of [x,y,z,r]; index 0 is the cinnabar bead
  const forms = [
    // 0 quicksilver: a core with satellites that merge and split
    (t) => { const o = [];
      o.push([1.42*Math.cos(t*.42+1), .62*Math.sin(t*.61), 1.05*Math.sin(t*.42+1), .3]);
      o.push([.06*Math.sin(t*.5), .08*Math.sin(t*.37), 0, .96]);
      for (let i = 2; i < N; i++) { const a = i*2.399, R = .95 + .42*Math.sin(i*1.7), s = .22 + .05*i*.6;
        o.push([R*Math.cos(t*s + a), .85*Math.sin(t*s*1.31 + a*1.9), R*.8*Math.sin(t*s + a), .2 + .34*Math.abs(Math.sin(i*2.1))]); }
      return o; },
    // 1 the coin: beads fold into the disc, the red one circles it
    (t) => { const o = [[1.62*Math.cos(t*.7), .25*Math.sin(t*.7), 1.62*Math.sin(t*.7), .15]]; for (let i = 1; i < N; i++) o.push([0,0,0,0]); return o; },
    // 2 the ledger: a seal resting above the stack
    (t) => { const o = [[.72, .78 + .05*Math.sin(t*1.1), .38, .17]]; for (let i = 1; i < N; i++) o.push([0,0,0,0]); return o; },
    // 3 the window: three title-bar dots
    (t) => { const o = [[-1.14, .8, .17, .082], [-.9, .8, .17, .082], [-.66, .8, .17, .082]]; for (let i = 3; i < N; i++) o.push([0,-.1,0,0]); return o; },
    // 4 the table: nine beads in rows and columns
    (t) => { const o = []; const order = [2,0,1,3,4,5,6,7,8];
      for (let k = 0; k < N; k++) { const i = order[k]; const cx = (i%3) - 1, cy = 1 - Math.floor(i/3);
        o.push([cx*.86, cy*.86, .16*Math.sin(t*1.25 + cx*.9 + cy*.6), .285]); }
      return o; },
    // 5 one drop, with moons
    (t) => { const o = [[1.7*Math.cos(t*.55), .5*Math.sin(t*.4), 1.7*Math.sin(t*.55), .19], [0, .05*Math.sin(t*.6), 0, 1.08],
        [1.45*Math.cos(-t*.38+2), .9*Math.sin(t*.3+1), 1.45*Math.sin(-t*.38+2), .11], [1.9*Math.cos(t*.27+4), -.6*Math.sin(t*.33), 1.9*Math.sin(t*.27+4), .07]];
      for (let i = 4; i < N; i++) o.push([0,0,0,0]); return o; },
  ];
  const LAST = forms.length - 1;
  const KS = [.42, .24, .2, .09, .14, .36];
  const rotY = (a) => { const c = Math.cos(a), s = Math.sin(a); return [c,0,s, 0,1,0, -s,0,c]; };
  const rotX = (a) => { const c = Math.cos(a), s = Math.sin(a); return [1,0,0, 0,c,-s, 0,s,c]; };
  const mul = (A, B) => { const o = new Array(9); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o[r*3+c] = A[r*3]*B[c] + A[r*3+1]*B[3+c] + A[r*3+2]*B[6+c]; return o; };
  const tr = (M) => [M[0],M[3],M[6], M[1],M[4],M[7], M[2],M[5],M[8]];
  const apply = (M, v) => [M[0]*v[0]+M[1]*v[1]+M[2]*v[2], M[3]*v[0]+M[4]*v[1]+M[5]*v[2], M[6]*v[0]+M[7]*v[1]+M[8]*v[2]];
  // group orientation per formation (object-to-world, row-major)
  const orient = [
    (t) => rotY(0),
    (t) => mul(rotX(.28), rotY(t*.55)),
    (t) => mul(rotX(.42), rotY(.55 + .35*Math.sin(t*.4))),
    (t) => mul(rotX(.08*Math.sin(t*.5)), rotY(-.42 + .22*Math.sin(t*.33))),
    (t) => mul(rotX(-.18), rotY(.5*Math.sin(t*.35))),
    (t) => rotY(0),
  ];

  // ---------- stage tracking ----------
  let stages = [], visible = true, stageT = 0, stage = 0;
  let off = [0, 0], zoom = 1, dim = 1;
  const collect = () => { stages = [...document.querySelectorAll('[data-stage]')].map(el => ({ el, i: +el.dataset.stage, side: el.dataset.side || 'right' })).sort((a, b) => a.i - b.i); };
  const readStage = () => {
    if (!stages.length) { stageT = +(canvas.dataset.form || 0); return; }
    const vh = innerHeight, mid = vh * .5; let prev = null, best = stages[0].i, any = false;
    const cs = stages.map(s => { const r = s.el.getBoundingClientRect(); if (r.bottom > -vh*.15 && r.top < vh*1.15) any = true; return { i: s.i, c: r.top + Math.min(r.height, vh) * .5 }; });
    visible = any;
    if (mid <= cs[0].c) best = cs[0].i; else if (mid >= cs[cs.length-1].c) best = cs[cs.length-1].i;
    else for (let k = 0; k < cs.length - 1; k++) if (mid >= cs[k].c && mid < cs[k+1].c) { best = mix(cs[k].i, cs[k+1].i, (mid - cs[k].c) / (cs[k+1].c - cs[k].c)); break; }
    stageT = best;
  };
  const sideOf = (i) => { const s = stages.find(s => s.i === i); return s ? s.side : (canvas.dataset.side || 'center'); };
  const place = (i, aspect) => {
    const side = sideOf(i);
    if (aspect < .9) return { x: 0, y: side === 'center' ? .46 : .5, z: side === 'center' ? .46 : .5, d: side === 'center' ? .9 : .6 };
    if (side === 'left') return { x: -aspect * .44, y: 0, z: 1.0, d: 1 };
    if (side === 'center') return { x: 0, y: .5, z: .5, d: 1 };
    return { x: aspect * .5, y: .02, z: .97, d: 1 };
  };

  // ---------- render ----------
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const maxScale = Math.min(devicePixelRatio || 1, 2);
  let scale = Math.min(maxScale, innerWidth < 800 ? 1.25 : 1), hq = 1;
  let W = 0, H = 0, acc = 0, frames = 0, last = performance.now(), time = reduce ? 3.2 : 0, running = false, dirty = true;
  const resize = () => { const w = Math.max(2, Math.round(canvas.clientWidth * scale)), h = Math.max(2, Math.round(canvas.clientHeight * scale)); if (w !== W || h !== H) { W = canvas.width = w; H = canvas.height = h; gl.viewport(0, 0, W, H); } };
  const B = new Float32Array(N * 4);
  const frame = (now) => {
    running = false;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    readStage();
    const k = 1 - Math.exp(-dt * 5.5);
    const prevStage = stage; stage += (stageT - stage) * (reduce ? 1 : k);
    ptr.x += (ptr.tx - ptr.x) * k; ptr.y += (ptr.ty - ptr.y) * k;
    const moving = Math.abs(stage - prevStage) > 1e-4;
    if (!reduce) time += dt;
    if (visible && !document.hidden && (!reduce || moving || dirty)) {
      dirty = false; resize();
      const aspect = W / H, t = time;
      const i0 = Math.max(0, Math.min(LAST, Math.floor(stage))), i1 = Math.min(LAST, i0 + 1);
      const f = sstep(.12, .88, stage - i0);
      const A = forms[i0](t), Bf = forms[i1](t);
      const par = mul(rotX(-ptr.y * .22), rotY(ptr.x * .32));
      const O0 = mul(par, orient[i0](t)), O1 = mul(par, orient[i1](t));
      for (let i = 0; i < N; i++) {
        const a = apply(O0, A[i]), b = apply(O1, Bf[i]);
        // travel along a slight arc so merging beads swing rather than slide
        const arc = Math.sin(f * Math.PI) * .25 * Math.sin(i * 1.9);
        B[i*4] = mix(a[0], b[0], f) + arc; B[i*4+1] = mix(a[1], b[1], f) + arc * .6; B[i*4+2] = mix(a[2], b[2], f);
        B[i*4+3] = mix(A[i][3], Bf[i][3], f);
      }
      const p0h = place(0, aspect);
      ptr.live += ((performance.now() - ptr.on < 2600 ? 1 : 0) - ptr.live) * Math.min(1, dt * 3);
      const reach = ptr.live * Math.max(0, 1 - stage * 2.2);
      if (reach > .002) {
        const wx = ((ptr.px * aspect) - p0h.x) / p0h.z * (7 / 2.75), wy = ((-ptr.py) - p0h.y) / p0h.z * (7 / 2.75);
        const len = Math.hypot(wx, wy), m = len > 2.1 ? 2.1 / len : 1;
        ptr.sx += (wx * m - ptr.sx) * Math.min(1, dt * 4); ptr.sy += (wy * m - ptr.sy) * Math.min(1, dt * 4);
        B[8*4] = mix(B[8*4], ptr.sx, reach); B[8*4+1] = mix(B[8*4+1], ptr.sy, reach); B[8*4+2] = mix(B[8*4+2], .55, reach); B[8*4+3] = mix(B[8*4+3], .3, reach);
      }
      const w = (n) => 1 - sstep(.1, .78, Math.abs(stage - n));
      const p0 = place(i0, aspect), p1 = place(i1, aspect);
      off = [mix(p0.x, p1.x, f), mix(p0.y, p1.y, f)]; zoom = mix(p0.z, p1.z, f); dim = mix(p0.d, p1.d, f);
      gl.uniform2f(U.uRes, W, H); gl.uniform1f(U.uTime, t); gl.uniform4fv(U.uB, B);
      gl.uniform1f(U.uK, mix(KS[i0], KS[i1], f));
      gl.uniform3f(U.uW, w(1), w(2), w(3));
      gl.uniformMatrix3fv(U.uRC, false, new Float32Array(mul(par, orient[1](t))));   // column-major upload of row-major O == transpose == inverse
      gl.uniformMatrix3fv(U.uRL, false, new Float32Array(mul(par, orient[2](t))));
      gl.uniformMatrix3fv(U.uRW, false, new Float32Array(mul(par, orient[3](t))));
      gl.uniform2f(U.uOff, off[0], off[1]); gl.uniform1f(U.uZoom, zoom); gl.uniform1f(U.uHQ, hq);
      gl.uniform1f(U.uRip, mix(1, .25, Math.min(1, stage)) ); gl.uniform1f(U.uDim, dim);
      const t0 = performance.now();
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce) {
        acc += dt * 1000; frames++;
        if (frames >= 40) { const avg = acc / frames; acc = 0; frames = 0;
          if (avg > 24 && scale > .45) { scale = Math.max(.45, scale * .82); if (scale < .6) hq = 0; }
          else if (avg < 17.5 && scale < maxScale && !frame.capped) { scale = Math.min(maxScale, scale * 1.12); frame.tries = (frame.tries || 0) + 1; if (frame.tries > 6) frame.capped = true; }
        }
      }
      if (!canvas.classList.contains('on')) canvas.classList.add('on');
    }
    schedule();
  };
  const schedule = () => { if (!running) { running = true; requestAnimationFrame(frame); } };
  addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); ptr.tx = (e.clientX / innerWidth) * 2 - 1; ptr.ty = (e.clientY / innerHeight) * 2 - 1; ptr.px = ((e.clientX - r.left) / r.width) * 2 - 1; ptr.py = ((e.clientY - r.top) / r.height) * 2 - 1; if (e.pointerType !== 'touch') ptr.on = performance.now(); }, { passive: true });
  addEventListener('resize', () => { dirty = true; }, { passive: true });
  addEventListener('scroll', () => { dirty = true; }, { passive: true });
  document.addEventListener('visibilitychange', () => { last = performance.now(); });
  collect(); readStage(); stage = stageT;
  if (!stages.length && 'IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(canvas);
  window.__merc = { collect, get stage() { return stage; }, get scale() { return scale; }, set time(v) { time = v; dirty = true; }, snap() { readStage(); stage = stageT; dirty = true; } };
  schedule();
})();
