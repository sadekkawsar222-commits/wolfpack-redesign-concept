// WolfPack particle field: one persistent cloud of wireframe triangles that
// morphs between shapes as the page scrolls. Any element with [data-shape]
// becomes a keyframe; the field blends between neighbouring keyframes based
// on which one is closest to the viewport centre.
import * as THREE from 'three';

const PALETTE = [
  ['#00B4D8', 0.30], ['#1372E3', 0.22], ['#C8963E', 0.17],
  ['#E0B050', 0.08], ['#CBD5E0', 0.17], ['#FFFFFF', 0.06],
];
const mobile = matchMedia('(max-width: 760px)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const N = mobile ? 2600 : 6000;
// Global dimmer so the field stays a backdrop and text stays readable.
const DIM = 0.55;

let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const TAU = Math.PI * 2;

/* ---------- geometry helpers ---------- */

function rotateBake(arr, rx, ry) {
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
  for (let i = 0; i < arr.length; i += 3) {
    let x = arr[i], y = arr[i + 1], z = arr[i + 2];
    const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
    arr[i] = x1; arr[i + 1] = y2; arr[i + 2] = z2;
  }
  return arr;
}

function sampleMesh(V, T, edgeFrac = 0.35, jitter = 0.012) {
  const out = new Float32Array(N * 3);
  const area = (a, b, c) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    return Math.hypot(cx, cy, cz) / 2;
  };
  const cum = []; let tot = 0;
  T.forEach(([a, b, c]) => { tot += area(V[a], V[b], V[c]); cum.push(tot); });
  const edgeSet = new Map();
  T.forEach(([a, b, c]) => [[a, b], [b, c], [c, a]].forEach(([p, q]) => {
    const k = p < q ? `${p}-${q}` : `${q}-${p}`;
    if (!edgeSet.has(k)) edgeSet.set(k, [p, q]);
  }));
  const edges = [...edgeSet.values()];
  const ecum = []; let etot = 0;
  edges.forEach(([p, q]) => { etot += Math.hypot(V[q][0] - V[p][0], V[q][1] - V[p][1], V[q][2] - V[p][2]); ecum.push(etot); });
  const pick = (c, t) => { const r = rnd() * t; let lo = 0, hi = c.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (c[m] < r) lo = m + 1; else hi = m; } return lo; };

  for (let i = 0; i < N; i++) {
    let x, y, z;
    if (rnd() < edgeFrac) {
      const [p, q] = edges[pick(ecum, etot)], t = rnd();
      x = V[p][0] + (V[q][0] - V[p][0]) * t; y = V[p][1] + (V[q][1] - V[p][1]) * t; z = V[p][2] + (V[q][2] - V[p][2]) * t;
    } else {
      const [a, b, c] = T[pick(cum, tot)];
      let u = rnd(), v = rnd(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
      x = V[a][0] + u * (V[b][0] - V[a][0]) + v * (V[c][0] - V[a][0]);
      y = V[a][1] + u * (V[b][1] - V[a][1]) + v * (V[c][1] - V[a][1]);
      z = V[a][2] + u * (V[b][2] - V[a][2]) + v * (V[c][2] - V[a][2]);
    }
    out[i * 3] = x + (rnd() - 0.5) * jitter; out[i * 3 + 1] = y + (rnd() - 0.5) * jitter; out[i * 3 + 2] = z + (rnd() - 0.5) * jitter;
  }
  return out;
}

/* ---------- shapes (unit space, roughly radius 1) ---------- */

// Low-poly wolf head, front facing. Centre ridge pushes towards the camera.
function wolf() {
  const C = { a: [0, .42, .35], b: [0, .1, .55], c: [0, -.45, .7], d: [0, -.78, .85], e: [0, -.98, .4] };
  const S = { f: [.18, .4, .35], g: [.56, 1, .08], h: [.8, .3, 0], i: [.62, .08, .3], j: [.92, -.12, 0], k: [.6, -.5, .15], l: [.22, -.72, .55], m: [.3, 0, .35], n: [.28, -.3, .45], o: [.45, .62, .2] };
  const V = [], idx = {};
  for (const k in C) idx[k] = V.push(C[k]) - 1;
  for (const k in S) { idx[k] = V.push(S[k]) - 1; idx[k + '_'] = V.push([-S[k][0], S[k][1], S[k][2]]) - 1; }
  const tris = [['a','f','b'],['f','o','i'],['f','g','o'],['o','g','h'],['o','h','i'],['f','i','m'],['f','m','b'],['b','m','c'],['m','i','j'],['m','j','n'],['m','n','c'],['n','j','k'],['n','k','l'],['n','l','c'],['c','l','d'],['l','k','e'],['l','e','d']];
  const T = [];
  tris.forEach(t => { T.push(t.map(k => idx[k])); T.push(t.map(k => (k in C ? idx[k] : idx[k + '_']))); });
  const out = sampleMesh(V, T, 0.4);
  // glowing eyes
  const eyes = Math.floor(N * 0.018);
  for (let i = 0; i < eyes; i++) {
    const side = i % 2 ? 1 : -1, a = rnd() * TAU, r = Math.sqrt(rnd()) * 0.045;
    out[i * 3] = side * 0.34 + Math.cos(a) * r; out[i * 3 + 1] = 0.02 + Math.sin(a) * r * 0.6; out[i * 3 + 2] = 0.45;
  }
  return out;
}

function gem() {
  const V = [], T = [], n = 8;
  const ct = V.push([0, .62, 0]) - 1, bot = V.push([0, -1.05, 0]) - 1;
  const g = [], t = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, a2 = a + Math.PI / n;
    g.push(V.push([Math.cos(a), .12, Math.sin(a)]) - 1);
    t.push(V.push([Math.cos(a2) * .55, .62, Math.sin(a2) * .55]) - 1);
  }
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    T.push([ct, t[i], t[j]], [t[i], g[j], t[j]], [g[i], g[j], t[i]], [g[i], bot, g[j]]);
  }
  return rotateBake(sampleMesh(V, T, 0.5), 0.22, 0);
}

function funnel() {
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    let x, y, z;
    if (rnd() < 0.1) { // inbound leads dropping into the mouth
      const a = rnd() * TAU, r = rnd() * 0.7;
      x = Math.cos(a) * r; z = Math.sin(a) * r; y = 1.05 + rnd() * 0.75;
    } else {
      y = rnd() * 2 - 1;
      if (rnd() < 0.35) y = Math.round(y * 7) / 7;
      const r = y > -0.2 ? 0.18 + (y + 0.2) * 0.9 : 0.18;
      const a = rnd() * TAU;
      x = Math.cos(a) * r; z = Math.sin(a) * r;
    }
    out[i * 3] = x; out[i * 3 + 1] = y * 1.05; out[i * 3 + 2] = z;
  }
  return rotateBake(out, 0.38, 0);
}

function knot() {
  const out = new Float32Array(N * 3), p = 2, q = 3;
  for (let i = 0; i < N; i++) {
    const t = rnd() * TAU;
    const r = 2 + Math.cos(q * t);
    let x = r * Math.cos(p * t), y = r * Math.sin(p * t), z = Math.sin(q * t);
    const a = rnd() * TAU, b = Math.acos(2 * rnd() - 1), tube = 0.42 * Math.cbrt(rnd() * 0.4 + 0.6);
    x += Math.sin(b) * Math.cos(a) * tube; y += Math.sin(b) * Math.sin(a) * tube; z += Math.cos(b) * tube;
    out[i * 3] = x * 0.34; out[i * 3 + 1] = y * 0.34; out[i * 3 + 2] = z * 0.34;
  }
  return rotateBake(out, 0.5, 0);
}

function bars() {
  const out = new Float32Array(N * 3);
  const H = [.35, .55, .5, .82, 1.08, 1.45], w = .27, base = -.8, gap = .44, x0 = -1.1;
  for (let i = 0; i < N; i++) {
    const r = rnd(); let x, y, z;
    if (r < 0.6) {
      const b = Math.floor(rnd() * H.length), h = H[b], cx = x0 + b * gap;
      const face = Math.floor(rnd() * 5);
      const u = rnd() - 0.5, v = rnd();
      if (face === 0) { x = cx + u * w; y = base + v * h; z = w / 2; }
      else if (face === 1) { x = cx + u * w; y = base + v * h; z = -w / 2; }
      else if (face === 2) { x = cx + w / 2; y = base + v * h; z = u * w; }
      else if (face === 3) { x = cx - w / 2; y = base + v * h; z = u * w; }
      else { x = cx + u * w; y = base + h; z = (v - 0.5) * w; }
    } else if (r < 0.78) {
      x = -1.55 + rnd() * 3.1; z = -0.7 + rnd() * 1.4; y = base;
      if (rnd() < 0.5) x = Math.round(x * 4) / 4; else z = Math.round(z * 4) / 4;
    } else {
      const t = rnd(), fx = t * (H.length - 1), k = Math.min(H.length - 2, Math.floor(fx)), f = fx - k;
      x = x0 + fx * gap; y = base + H[k] + (H[k + 1] - H[k]) * f + 0.28 + (rnd() - 0.5) * 0.03; z = 0;
    }
    out[i * 3] = x; out[i * 3 + 1] = y + 0.15; out[i * 3 + 2] = z;
  }
  return rotateBake(out, 0.2, -0.5);
}

function sphere() {
  const out = new Float32Array(N * 3), g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    let x, y, z;
    if (rnd() < 0.25) {
      const lat = (Math.floor(rnd() * 9) - 4) / 5 * (Math.PI / 2), a = rnd() * TAU;
      x = Math.cos(lat) * Math.cos(a); y = Math.sin(lat); z = Math.cos(lat) * Math.sin(a);
    } else {
      y = 1 - (i / (N - 1)) * 2; const r = Math.sqrt(1 - y * y), th = g * i;
      x = Math.cos(th) * r; z = Math.sin(th) * r;
    }
    const j = 1 + (rnd() - 0.5) * 0.04;
    out[i * 3] = x * j; out[i * 3 + 1] = y * j; out[i * 3 + 2] = z * j;
  }
  return out;
}

function cluster() {
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = rnd() * TAU, b = Math.acos(2 * rnd() - 1), r = 0.25 + Math.pow(rnd(), 0.8) * 0.75;
    out[i * 3] = Math.sin(b) * Math.cos(a) * r; out[i * 3 + 1] = Math.sin(b) * Math.sin(a) * r; out[i * 3 + 2] = Math.cos(b) * r;
  }
  return out;
}

const SHAPES = { wolf: wolf(), gem: gem(), funnel: funnel(), knot: knot(), bars: bars(), sphere: sphere(), cluster: cluster() };
let scatter = new Float32Array(N * 3);
let intro = new Float32Array(N * 3);

/* ---------- three setup ---------- */

const canvas = document.getElementById('field');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  document.documentElement.classList.add('no-webgl');
  throw e;
}
const pr = Math.min(devicePixelRatio, mobile ? 1.25 : 1.5);
renderer.setPixelRatio(pr);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 60);
camera.position.set(0, 0, 9);

const geo = new THREE.BufferGeometry();
const pos = new Float32Array(N * 3);
const col = new Float32Array(N * 3), size = new Float32Array(N), rot = new Float32Array(N), spin = new Float32Array(N);
const stagger = new Float32Array(N), dir = new Float32Array(N * 3), phase = new Float32Array(N);
const cum = []; let acc = 0; PALETTE.forEach(([, w]) => { acc += w; cum.push(acc); });
const tmp = new THREE.Color();
for (let i = 0; i < N; i++) {
  const r = rnd(); const ci = cum.findIndex(c => r <= c);
  tmp.set(PALETTE[ci < 0 ? 0 : ci][0]);
  col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
  size[i] = 0.75 + Math.pow(rnd(), 7) * 4.2;
  rot[i] = rnd() * TAU; spin[i] = (rnd() - 0.5) * 1.2;
  stagger[i] = rnd(); phase[i] = rnd() * TAU;
  const a = rnd() * TAU, b = Math.acos(2 * rnd() - 1);
  dir[i * 3] = Math.sin(b) * Math.cos(a); dir[i * 3 + 1] = Math.sin(b) * Math.sin(a); dir[i * 3 + 2] = Math.cos(b);
}
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
geo.setAttribute('aRot', new THREE.BufferAttribute(rot, 1));
geo.setAttribute('aSpin', new THREE.BufferAttribute(spin, 1));

const uniforms = { uTime: { value: 0 }, uPR: { value: pr }, uOpacity: { value: 0 }, uScale: { value: mobile ? 46 : 58 } };
const mat = new THREE.ShaderMaterial({
  uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
  vertexShader: /* glsl */`
    attribute float aSize; attribute float aRot; attribute float aSpin;
    uniform float uTime; uniform float uPR; uniform float uScale;
    varying vec3 vColor; varying float vRot; varying float vFade; varying float vBig;
    void main(){
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = min(aSize * uPR * (uScale / -mv.z), 64.0 * uPR);
      vRot = aRot + uTime * aSpin;
      vColor = color;
      vFade = smoothstep(-24.0, -5.0, mv.z) * (1.0 - smoothstep(-2.2, -0.6, mv.z));
      vBig = step(2.2, aSize);
    }`,
  fragmentShader: /* glsl */`
    uniform float uOpacity;
    varying vec3 vColor; varying float vRot; varying float vFade; varying float vBig;
    float sdTri(vec2 p, float r){
      const float k = 1.7320508;
      p.x = abs(p.x) - r; p.y = p.y + r / k;
      if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
      p.x -= clamp(p.x, -2.0 * r, 0.0);
      return -length(p) * sign(p.y);
    }
    float seg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
    void main(){
      vec2 p = gl_PointCoord * 2.0 - 1.0; p.y = -p.y;
      float c = cos(vRot), s = sin(vRot);
      p = mat2(c, -s, s, c) * p;
      float r = 0.6;
      float d = abs(sdTri(p, r));
      float w = 0.11;
      float line = 1.0 - smoothstep(w * 0.5, w, d);
      // inner edges make the bigger ones read as tetrahedra
      vec2 apex = vec2(0.14, 0.06);
      float inner = min(min(seg(p, apex, vec2(r, -r / 1.732)), seg(p, apex, vec2(-r, -r / 1.732))), seg(p, apex, vec2(0.0, 2.0 * r / 1.732)));
      line = max(line, vBig * (1.0 - smoothstep(w * 0.35, w * 0.8, inner)) * 0.7);
      float a = line * vFade * uOpacity;
      if (a < 0.01) discard;
      gl_FragColor = vec4(vColor * 1.15, a);
    }`,
});
const points = new THREE.Points(geo, mat);
points.frustumCulled = false;
scene.add(points);

// Large wireframe tetrahedra floating in the open "scatter" scenes.
const tetras = [];
const tetraMat = [];
[['#00B4D8', .55], ['#C8963E', .42], ['#1372E3', .5], ['#CBD5E0', .32], ['#E0B050', .3], ['#00B4D8', .26], ['#FFFFFF', .22]].forEach(([c, r], i) => {
  const m = new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const l = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.TetrahedronGeometry(r)), m);
  l.userData = { home: new THREE.Vector3(), spin: new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).multiplyScalar(0.6), depth: 0.4 + rnd() };
  tetras.push(l); tetraMat.push(m); scene.add(l);
});

/* ---------- layout + keyframes ---------- */

let halfW = 1, halfH = 1, keys = [];
function measure() {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
  halfH = Math.tan((camera.fov / 2) * Math.PI / 180) * camera.position.z; halfW = halfH * camera.aspect;
  for (let i = 0; i < N; i++) {
    scatter[i * 3] = (rnd() - 0.5) * halfW * 2.6;
    scatter[i * 3 + 1] = (rnd() - 0.5) * halfH * 2.8;
    scatter[i * 3 + 2] = -8 + rnd() * 10;
    intro[i * 3] = dir[i * 3] * halfW * 3; intro[i * 3 + 1] = dir[i * 3 + 1] * halfH * 3; intro[i * 3 + 2] = -18 - rnd() * 10;
  }
  const spots = [[-.72, .55, -1.5], [.78, -.5, -2], [-.35, -.62, -3], [.55, .62, -3.2], [-.85, -.1, -4], [.2, .25, -4.5], [.92, .15, -1]];
  tetras.forEach((t, i) => t.userData.home.set(spots[i][0] * halfW, spots[i][1] * halfH, spots[i][2]));
  refreshAnchors();
}

function refreshAnchors() {
  const m = innerWidth <= 900;
  keys = [...document.querySelectorAll('[data-shape]')].map(el => {
    const r = el.getBoundingClientRect();
    const d = el.dataset;
    const num = (k, f) => (d[k] !== undefined ? parseFloat(d[k]) : f);
    return {
      at: r.top + scrollY + r.height / 2 - innerHeight / 2,
      shape: d.shape,
      x: m ? num('mx', 0) : num('x', 0),
      y: m ? num('my', 0) : num('y', 0),
      s: m ? num('ms', num('s', 1) * 0.7) : num('s', 1),
      o: m ? num('mo', num('o', 1)) : num('o', 1),
      tetra: num('tetra', 0),
      rot: d.rot || 'sway',
    };
  }).sort((a, b) => a.at - b.at);
  if (keys[0]) keys[0].at = Math.min(keys[0].at, 0);
}
window.wpRefreshField = refreshAnchors;

/* ---------- interaction ---------- */

const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('pointermove', e => {
  mouse.tx = (e.clientX / innerWidth) * 2 - 1;
  mouse.ty = -((e.clientY / innerHeight) * 2 - 1);
}, { passive: true });

let introT = reduce ? 1 : 0;
window.wpStartField = () => {
  if (reduce) return;
  const t0 = performance.now();
  const step = now => { introT = Math.min(1, (now - t0) / 2600); if (introT < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
};

/* ---------- frame ---------- */

const smooth = t => t * t * (3 - 2 * t);
function frame(now) {
  const time = now / 1000;
  uniforms.uTime.value = reduce ? 0 : time;
  mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;

  const center = scrollY;
  let k = 0;
  while (k < keys.length - 1 && keys[k + 1].at <= center) k++;
  const A = keys[k], B = keys[Math.min(k + 1, keys.length - 1)];
  let t = 0;
  if (A && B && B !== A) t = B.at > A.at ? Math.min(1, Math.max(0, (center - A.at) / (B.at - A.at))) : 1;
  const tt = smooth(Math.min(1, Math.max(0, (t - 0.18) / 0.64)));

  if (A) {
    uniforms.uOpacity.value = (A.o + (B.o - A.o) * tt) * smooth(Math.min(1, introT * 1.6)) * DIM;
    const tet = A.tetra + (B.tetra - A.tetra) * tt;
    tetras.forEach((m, i) => {
      const u = m.userData;
      m.material.opacity = tet * 0.75 * DIM;
      m.rotation.x += u.spin.x * 0.01; m.rotation.y += u.spin.y * 0.01;
      m.position.set(u.home.x - mouse.x * u.depth * 0.5, u.home.y - mouse.y * u.depth * 0.4 + Math.sin(time * 0.5 + i) * 0.12, u.home.z);
    });

    const angle = key => {
      const sway = reduce ? 0 : Math.sin(time * 0.35) * 0.28;
      if (key.rot === 'spin') return [reduce ? 0.4 : time * 0.22 + mouse.x * 0.4, mouse.y * -0.2];
      if (key.rot === 'none') return [mouse.x * 0.1, mouse.y * -0.06];
      return [sway + mouse.x * 0.45, mouse.y * -0.25];
    };
    const [ayA, axA] = angle(A), [ayB, axB] = angle(B);
    const cA = Math.cos(ayA), sA = Math.sin(ayA), cxA = Math.cos(axA), sxA = Math.sin(axA);
    const cB = Math.cos(ayB), sB = Math.sin(ayB), cxB = Math.cos(axB), sxB = Math.sin(axB);
    const sa = A.shape === 'scatter' ? scatter : SHAPES[A.shape] || scatter;
    const sb = B.shape === 'scatter' ? scatter : SHAPES[B.shape] || scatter;
    const scA = A.shape === 'scatter', scB = B.shape === 'scatter';
    const oxA = A.x * halfW, oyA = A.y * halfH, oxB = B.x * halfW, oyB = B.y * halfH;
    const mx = mouse.x * halfW, my = mouse.y * halfH, R = 1.0, R2 = R * R;
    const ie = smooth(introT);
    const drift = reduce ? 0 : 1;
    const burstAmp = reduce || A.shape === B.shape ? 0 : 0.9;

    for (let i = 0; i < N; i++) {
      const j = i * 3;
      let x1, y1, z1, x2, y2, z2;
      if (scA) { x1 = sa[j] - mouse.x * 0.3; y1 = sa[j + 1] - mouse.y * 0.2; z1 = sa[j + 2]; }
      else {
        const x = sa[j], y = sa[j + 1], z = sa[j + 2];
        const xr = x * cA + z * sA, zr = -x * sA + z * cA;
        const yr = y * cxA - zr * sxA, zr2 = y * sxA + zr * cxA;
        x1 = xr * A.s + oxA; y1 = yr * A.s + oyA; z1 = zr2 * A.s;
      }
      if (scB) { x2 = sb[j] - mouse.x * 0.3; y2 = sb[j + 1] - mouse.y * 0.2; z2 = sb[j + 2]; }
      else {
        const x = sb[j], y = sb[j + 1], z = sb[j + 2];
        const xr = x * cB + z * sB, zr = -x * sB + z * cB;
        const yr = y * cxB - zr * sxB, zr2 = y * sxB + zr * cxB;
        x2 = xr * B.s + oxB; y2 = yr * B.s + oyB; z2 = zr2 * B.s;
      }
      let p = Math.min(1, Math.max(0, tt * 1.5 - stagger[i] * 0.5));
      p = p * p * (3 - 2 * p);
      const burst = Math.sin(p * Math.PI) * burstAmp;
      let x = x1 + (x2 - x1) * p + dir[j] * burst;
      let y = y1 + (y2 - y1) * p + dir[j + 1] * burst;
      let z = z1 + (z2 - z1) * p + dir[j + 2] * burst;

      const ph = phase[i];
      x += Math.sin(time * 0.6 + ph) * 0.018 * drift;
      y += Math.cos(time * 0.5 + ph * 1.3) * 0.018 * drift;

      const dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy;
      if (d2 < R2 && z > -2) { const d = Math.sqrt(d2) + 1e-4, f = (1 - d / R) * 0.35; x += dx / d * f; y += dy / d * f; }

      if (ie < 1) {
        let q = Math.min(1, Math.max(0, ie * 1.5 - stagger[i] * 0.5)); q = q * q * (3 - 2 * q);
        x = intro[j] + (x - intro[j]) * q; y = intro[j + 1] + (y - intro[j + 1]) * q; z = intro[j + 2] + (z - intro[j + 2]) * q;
      }
      pos[j] = x; pos[j + 1] = y; pos[j + 2] = z;
    }
    geo.attributes.position.needsUpdate = true;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

measure();
addEventListener('resize', () => { clearTimeout(measure._t); measure._t = setTimeout(measure, 120); });
addEventListener('load', refreshAnchors);
requestAnimationFrame(frame);
if (window.wpWantStart) window.wpStartField();
