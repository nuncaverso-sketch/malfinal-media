// Mal Final v2 characters: 3D stick people (own design). White round head with ink outline, pill torso in outfit
// colour, thin black limbs with FK, painted face texture (expressions + talking mouth), simple hats/props.
import * as THREE from 'three';

const INK = 0x16121a;
const hull = (k) => { const m = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
  m.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = position + normal * ${k.toFixed(4)};`); }; return m; };
const HULL = { head: hull(0.022), body: hull(0.02), hat: hull(0.016), thin: hull(0.01) };
const inkMat = new THREE.MeshStandardMaterial({ color: INK, roughness: 0.5 });
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.42, metalness: 0, ...o });
function mesh(geo, mat, parent, pos = [0, 0, 0], ink = null, shadow = true) {
  const m = new THREE.Mesh(geo, mat); m.position.set(...pos); m.castShadow = shadow; m.receiveShadow = true; parent.add(m);
  if (ink) { const h = new THREE.Mesh(geo, ink); h.castShadow = false; m.add(h); }
  return m;
}
const capsule = (r, len) => { const g = new THREE.CapsuleGeometry(r, len, 6, 12); g.translate(0, -len / 2, 0); return g; }; // hangs down from origin

// ---------- face painter ----------
function drawFace(g, S, e) {
  const { expr = 'neutral', blink = 0, talk = 0, look = [0, 0] } = e;
  g.clearRect(0, 0, S, S); const k = S / 512; g.save(); g.scale(k, k); g.translate(256, 262); g.scale(1.45, 1.45); g.translate(-256, -262);
  g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#16121a'; g.fillStyle = '#16121a';
  const lx = look[0] * 14, ly = -look[1] * 10;
  const ex = 92, ey = 228; // eye offset from centre (256)
  const eye = (sx) => {
    const cx = 256 + sx * ex + lx, cy = ey + ly;
    if (blink > 0.5 || expr === 'happy' || expr === 'laugh') { g.lineWidth = 15; g.beginPath(); g.arc(cx, cy + 10, 26, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); return; }
    if (expr === 'shock' || expr === 'scared' || expr === 'worried') { const r = expr === 'shock' ? 40 : 34; g.fillStyle = '#fff'; g.lineWidth = 9; g.beginPath(); g.ellipse(cx, cy, r, r * 1.08, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#16121a'; g.beginPath(); g.arc(cx + lx * 0.6, cy + ly * 0.6, expr === 'shock' ? 9 : 12, 0, 7); g.fill(); return; }
    if (expr === 'smug' || expr === 'angry' || expr === 'tired') { g.beginPath(); g.ellipse(cx, cy + 6, 17, 12, 0, 0, 7); g.fill(); return; }
    g.beginPath(); g.ellipse(cx, cy, 16, 22, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(cx - 5, cy - 8, 5, 0, 7); g.fill(); g.fillStyle = '#16121a';
  };
  eye(-1); eye(1);
  // brows
  g.lineWidth = 13; const brow = (sx, a, dy) => { const cx = 256 + sx * ex + lx * 0.5; g.beginPath(); g.moveTo(cx - 30, ey - 56 + dy - sx * a); g.lineTo(cx + 30, ey - 56 + dy + sx * a); g.stroke(); };
  const B = { angry: [16, 10], worried: [-14, -4], scared: [-16, -14], shock: [0, -22], smug: [6, 6], sad: [-12, 0], tired: [4, 10], laugh: [0, -8], happy: [0, -8], neutral: [0, 0], talk: [0, 0], proud: [-4, -10] }[expr] || [0, 0];
  brow(-1, -B[0], B[1]); brow(1, -B[0], B[1]);
  // mouth
  const my = 352; g.lineWidth = 12;
  const open = Math.max(0, Math.min(1, talk));
  if (expr === 'shock' || expr === 'scared') { const h = 34 + open * 14; g.fillStyle = '#3a1020'; g.beginPath(); g.ellipse(256, my + 4, 26, h, 0, 0, 7); g.fill(); g.stroke(); }
  else if (expr === 'laugh' || (expr === 'happy' && open > 0.15)) { g.fillStyle = '#3a1020'; g.beginPath(); g.moveTo(196, my - 14); g.quadraticCurveTo(256, my + 70 + open * 20, 316, my - 14); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#e8566a'; g.beginPath(); g.ellipse(256, my + 22 + open * 8, 22, 12, 0, 0, 7); g.fill(); }
  else if (open > 0.12) { g.fillStyle = '#3a1020'; g.beginPath(); g.ellipse(256, my + 4, 30 + open * 6, 8 + open * 30, 0, 0, 7); g.fill(); g.stroke(); }
  else if (expr === 'happy' || expr === 'proud') { g.beginPath(); g.arc(256, my - 34, 52, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); }
  else if (expr === 'smug') { g.beginPath(); g.moveTo(214, my + 4); g.quadraticCurveTo(262, my + 18, 300, my - 14); g.stroke(); }
  else if (expr === 'sad' || expr === 'worried' || expr === 'angry' || expr === 'tired') { g.beginPath(); g.arc(256, my + 40, 40, Math.PI * 1.22, Math.PI * 1.78); g.stroke(); }
  else { g.beginPath(); g.moveTo(228, my); g.lineTo(284, my); g.stroke(); }
  if (e.blush) { g.fillStyle = 'rgba(240,110,120,0.45)'; g.beginPath(); g.ellipse(150, 300, 30, 14, 0, 0, 7); g.ellipse(362, 300, 30, 14, 0, 0, 7); g.fill(); }
  if (e.sweat) { g.fillStyle = '#7fc8ff'; g.strokeStyle = '#16121a'; g.lineWidth = 6; g.beginPath(); g.moveTo(388, 150); g.quadraticCurveTo(410, 196, 388, 206); g.quadraticCurveTo(366, 196, 388, 150); g.fill(); g.stroke(); }
  if (e.mustache) { g.fillStyle = '#16121a'; g.beginPath(); g.ellipse(226, my - 26, 34, 14, 0.2, 0, 7); g.ellipse(286, my - 26, 34, 14, -0.2, 0, 7); g.fill(); }
  if (e.beard) { g.fillStyle = e.beard; g.beginPath(); g.moveTo(150, 330); g.quadraticCurveTo(256, 560, 362, 330); g.quadraticCurveTo(256, 420, 150, 330); g.fill(); }
  if (e.glasses) { g.lineWidth = 8; g.strokeStyle = '#16121a'; g.beginPath(); g.arc(256 - ex, ey, 40, 0, 7); g.moveTo(256 + ex + 40, ey); g.arc(256 + ex, ey, 40, 0, 7); g.moveTo(256 - ex + 40, ey); g.lineTo(256 + ex - 40, ey); g.stroke(); }
  g.restore();
}

// ---------- hats ----------
function addHat(head, type, col) {
  const c = std(col || 0x2a2a3a);
  const H = new THREE.Group(); head.add(H);
  if (type === 'top') { mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 24), c, H, [0, 0.24, 0], HULL.hat); mesh(new THREE.CylinderGeometry(0.24, 0.25, 0.42, 24), c, H, [0, 0.46, 0], HULL.hat); mesh(new THREE.CylinderGeometry(0.255, 0.255, 0.07, 24), std(0x8a1f2a), H, [0, 0.3, 0]); }
  else if (type === 'cap') { mesh(new THREE.SphereGeometry(0.3, 24, 12, 0, 7, 0, 1.45), c, H, [0, 0.06, 0], HULL.hat); const v = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 20, 1, false, 0, Math.PI), c, H, [0, 0.12, 0.2], HULL.thin); v.rotation.y = -Math.PI / 2; }
  else if (type === 'bowler') { mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.03, 24), c, H, [0, 0.2, 0], HULL.hat); mesh(new THREE.SphereGeometry(0.26, 24, 12, 0, 7, 0, 1.6), c, H, [0, 0.2, 0], HULL.hat); }
  else if (type === 'helmet') { mesh(new THREE.SphereGeometry(0.33, 24, 12, 0, 7, 0, 1.5), std(col || 0x9aa2ad, { metalness: 0.6, roughness: 0.3 }), H, [0, 0.04, 0], HULL.hat); }
  else if (type === 'hard') { mesh(new THREE.SphereGeometry(0.32, 24, 12, 0, 7, 0, 1.45), std(col || 0xf2c230), H, [0, 0.06, 0], HULL.hat); mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.025, 24), std(col || 0xf2c230), H, [0, 0.07, 0], HULL.thin); }
  else if (type === 'tricorn') { const b = mesh(new THREE.ConeGeometry(0.44, 0.22, 3), c, H, [0, 0.27, 0], HULL.hat); b.rotation.y = Math.PI; b.scale.set(1, 1, 0.8); }
  else if (type === 'crown') { mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.18, 8, 1, true), std(0xf3c537, { metalness: 0.7, roughness: 0.25, side: THREE.DoubleSide }), H, [0, 0.33, 0], HULL.thin); }
  else if (type === 'chef') { mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.22, 20), std(0xffffff), H, [0, 0.36, 0], HULL.hat); mesh(new THREE.SphereGeometry(0.27, 20, 12), std(0xffffff), H, [0, 0.52, 0], HULL.hat); }
  else if (type === 'hair') { mesh(new THREE.SphereGeometry(0.31, 24, 12, 0, 7, 0, 1.25), c, H, [0, 0.02, -0.01], HULL.hat); }
  else if (type === 'wig') { for (const s of [-1, 1]) for (let i = 0; i < 3; i++) mesh(new THREE.SphereGeometry(0.11, 12, 10), std(0xf4f0e6), H, [s * 0.3, 0.05 - i * 0.15, -0.05], HULL.thin); mesh(new THREE.SphereGeometry(0.31, 24, 12, 0, 7, 0, 1.3), std(0xf4f0e6), H, [0, 0.03, 0], HULL.hat); }
  return H;
}

// ---------- character ----------
export function makeChar(scene, o = {}) {
  const root = new THREE.Group(); scene.add(root);
  const hips = new THREE.Group(); hips.position.y = 0.92; root.add(hips);
  const outfit = o.shirt ?? 0x3d6fd8;
  const torso = new THREE.Group(); hips.add(torso);
  const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; const y = t * 0.66; const r = 0.2 + 0.035 * Math.sin(Math.PI * t) - (t > 0.85 ? (t - 0.85) * 0.9 : 0) - (t < 0.08 ? (0.08 - t) * 1.3 : 0); pts.push(new THREE.Vector2(Math.max(0.02, r), y)); }
  const bodyGeo = new THREE.LatheGeometry(pts, 28); bodyGeo.scale(1, 1, o.slim ? 0.78 : 0.86);
  const body = mesh(bodyGeo, std(outfit, { roughness: 0.35 }), torso, [0, -0.04, 0], HULL.body);
  if (o.pants) mesh(new THREE.CylinderGeometry(0.205, 0.19, 0.16, 28), std(o.pants), torso, [0, 0.02, 0]).scale.z = 0.86;
  if (o.belt) mesh(new THREE.CylinderGeometry(0.212, 0.212, 0.05, 28), std(o.belt), torso, [0, 0.12, 0]).scale.z = 0.88;
  if (o.buttons) for (let i = 0; i < 3; i++) mesh(new THREE.SphereGeometry(0.022, 8, 6), std(o.buttons), torso, [0, 0.22 + i * 0.12, 0.185]);
  if (o.tie) { const t = mesh(new THREE.ConeGeometry(0.05, 0.3, 4), std(o.tie), torso, [0, 0.42, 0.19]); t.rotation.z = Math.PI; }
  if (o.apron) mesh(new THREE.BoxGeometry(0.3, 0.42, 0.02), std(o.apron), torso, [0, 0.25, 0.19], HULL.thin);
  if (o.cape) { const c = mesh(new THREE.PlaneGeometry(0.5, 0.75), std(o.cape, { side: THREE.DoubleSide }), torso, [0, 0.28, -0.2]); c.rotation.x = 0.12; }
  const neck = new THREE.Group(); neck.position.y = 0.6; torso.add(neck);
  const head = new THREE.Group(); head.position.y = 0.33; neck.add(head);
  const hs = o.headScale || 1; head.scale.setScalar(hs);
  mesh(new THREE.SphereGeometry(0.3, 40, 28), std(o.skin ?? 0xfbf8f2, { roughness: 0.3 }), head, [0, 0, 0], HULL.head);
  const FS = 512, fc = document.createElement('canvas'); fc.width = fc.height = FS; const fg = fc.getContext('2d');
  const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 8;
  const face = mesh(new THREE.SphereGeometry(0.302, 40, 28, Math.PI / 2 - 1.05, 2.1, Math.PI / 2 - 1.0, 2.0), new THREE.MeshStandardMaterial({ map: ft, transparent: true, roughness: 0.4, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), head, [0, 0, 0], null, false);
  if (o.hat) addHat(head, o.hat, o.hatColor);
  if (o.hair) addHat(head, 'hair', o.hair);
  // limbs
  const limb = (parent, pos, len1, len2, r) => {
    const a = new THREE.Group(); a.position.set(...pos); parent.add(a);
    mesh(capsule(r, len1), inkMat, a);
    const b = new THREE.Group(); b.position.y = -len1; a.add(b); mesh(capsule(r * 0.95, len2), inkMat, b);
    const end = new THREE.Group(); end.position.y = -len2; b.add(end);
    return { a, b, end };
  };
  const armL = limb(torso, [0.2, 0.5, 0], 0.3, 0.28, 0.026), armR = limb(torso, [-0.2, 0.5, 0], 0.3, 0.28, 0.026);
  for (const A of [armL, armR]) mesh(new THREE.SphereGeometry(0.052, 14, 10), inkMat, A.end, [0, -0.02, 0]);
  const legL = limb(hips, [0.09, 0, 0], 0.46, 0.44, 0.03), legR = limb(hips, [-0.09, 0, 0], 0.46, 0.44, 0.03);
  for (const L of [legL, legR]) { const f = mesh(new THREE.SphereGeometry(0.075, 14, 10), std(o.shoes ?? INK, { roughness: 0.5 }), L.end, [0, -0.03, 0.05]); f.scale.set(0.85, 0.55, 1.5); }
  let prop = null;
  const C = { root, hips, torso, head, neck, armL, armR, legL, legR, face, fg, ft, faceKey: '', o,
    hold(obj, off = [0, -0.06, 0.06], rot = [0, 0, 0]) { if (prop) armR.end.remove(prop); prop = obj; if (obj) { obj.position.set(...off); obj.rotation.set(...rot); armR.end.add(obj); } },
  };
  return C;
}

const lerp = (a, b, t) => a + (b - a) * t;
// pose: {pos:[x,y,z], yaw, walk (phase, 0=still), run, arms:'down|point|up|wave|akimbo|shrug|hold|cross|reach|think|fists|flail',
//        lean, look:[yaw,pitch], expr, talk(0..1), blink, scale, sit, fall(0..1), bounce, tremble, f}
export function poseChar(C, p, f) {
  const t = f / 30;
  C.root.visible = p.visible !== false;
  C.root.position.set(...(p.pos || [0, 0, 0]));
  C.root.rotation.set(0, p.yaw || 0, 0); C.root.scale.setScalar(p.scale || 1);
  const run = p.run ? 1 : 0, w = p.walk || 0, moving = w !== 0;
  const sw = moving ? Math.sin(w * Math.PI * 2) : 0, sw2 = moving ? Math.cos(w * Math.PI * 2) : 0;
  const amp = run ? 0.95 : 0.55;
  const breathe = Math.sin(t * 2.2 + (C.o.seed || 0)) * 0.012;
  C.hips.position.y = 0.92 + (moving ? Math.abs(sw2) * (run ? 0.07 : 0.035) : 0) + (p.bounce ? Math.abs(Math.sin(t * 9)) * 0.06 * p.bounce : 0) - (p.sit ? 0.4 : 0);
  C.torso.rotation.set((p.lean || 0) + (run ? 0.22 : 0) + breathe, moving ? sw * 0.08 : 0, 0);
  C.torso.scale.set(1, 1 + breathe, 1);
  // legs
  if (p.sit) { C.legL.a.rotation.set(-1.45, 0, 0.04); C.legR.a.rotation.set(-1.45, 0, -0.04); C.legL.b.rotation.x = C.legR.b.rotation.x = 1.45; }
  else { C.legL.a.rotation.set(-sw * amp, 0, 0.03); C.legR.a.rotation.set(sw * amp, 0, -0.03);
    C.legL.b.rotation.x = Math.max(0, -sw2) * (run ? 1.3 : 0.7) * (moving ? 1 : 0); C.legR.b.rotation.x = Math.max(0, sw2) * (run ? 1.3 : 0.7) * (moving ? 1 : 0); }
  // arms (L = character's left = +x)
  const A = p.arms || 'down', wav = Math.sin(t * 10);
  const set = (arm, ax, az, bx, bz = 0, ay = 0) => { arm.a.rotation.set(ax, ay, az); arm.b.rotation.set(bx, 0, bz); };
  const swing = moving ? sw * amp * 0.9 : 0;
  switch (A) {
    case 'point': set(C.armL, swing * 0.5, 0.12, 0); set(C.armR, -1.5 + 0.03 * Math.sin(t * 3), -0.15, -0.05); break;
    case 'up': set(C.armL, -2.9, 0.35 + 0.1 * Math.sin(t * 7), -0.2); set(C.armR, -2.9, -0.35 - 0.1 * Math.sin(t * 7 + 1), -0.2); break;
    case 'wave': set(C.armL, swing * 0.5, 0.12, 0); set(C.armR, -2.6, -0.5, -0.4, -0.5 * wav); break;
    case 'akimbo': set(C.armL, -0.1, 0.75, -0.2, -1.9); set(C.armR, -0.1, -0.75, -0.2, 1.9); break;
    case 'shrug': set(C.armL, -0.2, 0.9, -1.6, 0); set(C.armR, -0.2, -0.9, -1.6, 0); break;
    case 'hold': set(C.armL, swing * 0.5, 0.12, 0); set(C.armR, -0.75, -0.08, -0.9); break;
    case 'hold2': set(C.armL, -0.9, 0.25, -0.7); set(C.armR, -0.9, -0.25, -0.7); break;
    case 'cross': set(C.armL, -0.9, 0.2, -1.8, 0, -0.5); set(C.armR, -0.9, -0.2, -1.8, 0, 0.5); break;
    case 'reach': set(C.armL, -1.6, 0.15, 0); set(C.armR, -1.6, -0.15, 0); break;
    case 'think': set(C.armL, 0, 0.6, -0.4, -1.5, 0); set(C.armR, -0.6, -0.1, -2.3); break;
    case 'fists': set(C.armL, -0.4 + 0.25 * wav, 0.35, -1.9); set(C.armR, -0.4 - 0.25 * wav, -0.35, -1.9); break;
    case 'flail': set(C.armL, -2.2 + 0.8 * Math.sin(t * 14), 0.6, -0.5 * Math.sin(t * 11)); set(C.armR, -2.2 + 0.8 * Math.sin(t * 13 + 2), -0.6, -0.5 * Math.sin(t * 12)); break;
    case 'drink': set(C.armL, swing * 0.5, 0.12, 0); set(C.armR, -1.2, -0.3, -1.9); break;
    case 'hammer': { const k = Math.max(0, Math.sin(t * 8)); set(C.armL, swing * 0.4, 0.12, 0); set(C.armR, -2.6 + 1.8 * k, -0.15, -0.3); break; }
    default: set(C.armL, swing, 0.1, moving ? -0.35 : -0.05); set(C.armR, -swing, -0.1, moving ? -0.35 : -0.05);
  }
  if (p.armsOverride) p.armsOverride(C, t);
  const look = p.look || [0, 0];
  C.neck.rotation.set(-look[1] + (p.nod ? Math.sin(t * 8) * 0.08 * p.nod : 0), look[0], p.headTilt || 0);
  if (p.tremble) C.root.position.x += Math.sin(f * 2.7) * 0.012 * p.tremble;
  if (p.fall) { C.root.rotation.x = -p.fall * 1.45; }
  // face
  const talk = p.talk ? Math.max(0, Math.sin(t * 13.5) * 0.6 + Math.sin(t * 7.3) * 0.4) * p.talk : 0;
  const blink = p.blink ?? ((Math.floor(t * 30) % 113) < 4 ? 1 : 0);
  const E = { expr: p.expr || 'neutral', talk: Math.round(talk * 4) / 4, blink, look: p.eyes || [0, 0], blush: p.blush, sweat: p.sweat, mustache: C.o.mustache, beard: C.o.beard, glasses: C.o.glasses };
  const key = JSON.stringify(E);
  if (key !== C.faceKey) { C.faceKey = key; drawFace(C.fg, 512, E); C.ft.needsUpdate = true; }
}
