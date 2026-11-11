// VID-003 v3 world: Eiffel Tower at origin (first platform y=57, railing on the south side z=+9), Champ de Mars ground,
// workshop x=300, courtyard dummy test x=600, office x=-300.
let G = {};
export const PLAT = 57, RAIL_Z = 9.2;
export function build(E) {
  const { THREE, scene, add, box, toon, R, ctex, P } = E;
  const iron = toon(0x6a4e3a), ironD = toon(0x4a3626), ink = toon(0x2a2430);
  const g0 = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), toon(0xa8a888)); g0.rotation.x = -Math.PI / 2; g0.receiveShadow = true; scene.add(g0);
  for (const x of [-30, 30]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(14, 400), toon(0xc8b898)); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.01, 120); scene.add(p); }
  for (let k = 0; k < 30; k++) { const s = k % 2 ? 1 : -1, z = 30 + Math.floor(k / 2) * 12; add(new THREE.SphereGeometry(2.6, 10, 8), toon(0x6a8a5a), [s * 40, 3.6, z], [0, 0, 0], scene, 1); add(new THREE.CylinderGeometry(0.25, 0.35, 2.4, 8), toon(0x5a3a22), [s * 40, 1.2, z], [0, 0, 0], scene, 1); }
  // ---- the tower: 4 lattice legs -> first platform -> second -> spire ----
  const T = new THREE.Group(); scene.add(T); G.tower = T;
  const strut = (a, b, r, m) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const s = add(new THREE.BoxGeometry(r, A.distanceTo(B), r), m, [0, 0, 0], [0, 0, 0], T, 0); s.position.copy(A.clone().add(B).multiplyScalar(0.5)); s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); return s; };
  const leg = (sx, sz) => { const bot = (y) => 34 * (1 - y / PLAT) ** 1.6 + 9 * (y / PLAT); // half-width at height y (outer)
    const N = 8; for (let i = 0; i < N; i++) { const y0 = i / N * PLAT, y1 = (i + 1) / N * PLAT, o0 = bot(y0), o1 = bot(y1), i0 = o0 - 6 * (1 - y0 / PLAT) - 1.5, i1 = o1 - 6 * (1 - y1 / PLAT) - 1.5;
      const c = (o, y) => [sx * o, y, sz * o]; strut(c(o0, y0), c(o1, y1), 0.9, iron); strut(c(i0, y0), c(i1, y1), 0.7, iron);
      strut([sx * o0, y0, sz * i0], [sx * o1, y1, sz * i1], 0.6, iron); strut([sx * i0, y0, sz * o0], [sx * i1, y1, sz * o1], 0.6, iron);
      strut(c(o0, y0), c(i1, y1), 0.35, ironD); strut(c(i0, y0), c(o1, y1), 0.35, ironD); } };
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) leg(sx, sz);
  // arches between legs
  
  // first platform with railing (the jump spot)
  box(20, 2.4, 20, ironD, [0, PLAT - 1.2, 0], null, T, 1); box(20.6, 0.6, 20.6, toon(0x8a6a4e), [0, PLAT - 2.6, 0], null, T, 0);
  for (let k = 0; k < 40; k++) { const x = -9.6 + k * 0.49; box(0.08, 1.3, 0.08, ink, [x, PLAT + 0.65, RAIL_Z], null, T, 0); } box(19.6, 0.12, 0.16, ink, [0, PLAT + 1.3, RAIL_Z], null, T, 0); box(19.6, 0.08, 0.1, ink, [0, PLAT + 0.6, RAIL_Z], null, T, 0);
  for (const s of [-1, 1]) box(0.16, 0.12, 19.6, ink, [s * 9.6, PLAT + 1.3, 0], null, T, 0);
  // upper tower: tapering lattice to 2nd platform (y 115) and spire (y 190)
  const up = (y0, y1, w0, w1, n) => { for (let i = 0; i < n; i++) { const a = y0 + (y1 - y0) * i / n, b = y0 + (y1 - y0) * (i + 1) / n, wa = w0 + (w1 - w0) * i / n, wb = w0 + (w1 - w0) * (i + 1) / n;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) strut([sx * wa, a, sz * wa], [sx * wb, b, sz * wb], 0.6, iron);
    for (const s of [-1, 1]) { strut([-wa, a, s * wa], [wb, b, s * wb], 0.3, ironD); strut([wa, a, s * wa], [-wb, b, s * wb], 0.3, ironD); strut([s * wa, a, -wa], [s * wb, b, wb], 0.3, ironD); strut([s * wa, a, wa], [s * wb, b, -wb], 0.3, ironD); } } };
  up(PLAT, 115, 8, 4.5, 6); box(12, 1.6, 12, ironD, [0, 115.8, 0], null, T, 1); up(116.6, 186, 4, 0.9, 8); box(3, 3, 3, ironD, [0, 188, 0], null, T, 1); add(new THREE.CylinderGeometry(0.15, 0.3, 10, 6), iron, [0, 195, 0], [0, 0, 0], T, 0);
  // people on the platform are actors; crowd below is actors too. Dust puff at landing.
  G.dust = []; for (let k = 0; k < 24; k++) G.dust.push(add(new THREE.SphereGeometry(0.4 + R(k) * 0.5, 7, 5), toon(0xd8ccb0), [0, -10, 0], [0, 0, 0], scene, 0));
  // photographers' box cameras on tripods near the landing spot (x 6..14, z 26)
  G.cams = []; for (let k = 0; k < 3; k++) { const c = new THREE.Group(); c.position.set(4 + k * 4, 0, 27 + (k % 2)); scene.add(c); for (let j = 0; j < 3; j++) box(0.06, 1.5, 0.06, toon(0x5a3a22), [Math.cos(j * 2.1) * 0.35, 0.75, Math.sin(j * 2.1) * 0.35], [Math.sin(j * 2.1) * 0.2, 0, -Math.cos(j * 2.1) * 0.2], c, 0);
    box(0.5, 0.45, 0.6, ink, [0, 1.65, 0], null, c, 1); add(new THREE.CylinderGeometry(0.12, 0.14, 0.3, 10), toon(0x8a8a90), [0, 1.65, -0.42], [Math.PI / 2, 0, 0], c, 0); G.cams.push(c); }
  G.flash = new THREE.PointLight(0xffffff, 0, 14, 1.2); G.flash.position.set(8, 3, 26); scene.add(G.flash);
  // the suit's silk canopy (follows Reichelt; closed = folded bundle)
  G.cape = new THREE.Group(); scene.add(G.cape); const silk = toon(0x5a3a2a, null, { side: THREE.DoubleSide });
  G.capeL = add(new THREE.PlaneGeometry(0.55, 1.0), silk, [-0.35, 1.25, -0.12], [0, 0, 0.25], G.cape, 0); G.capeR = add(new THREE.PlaneGeometry(0.55, 1.0), silk, [0.35, 1.25, -0.12], [0, 0, -0.25], G.cape, 0);
  // ---- workshop x=300 ----
  const ws = new THREE.Group(); ws.position.set(300, 0, 0); scene.add(ws);
  box(12, 0.2, 9, toon(0xffffff, P.planks('#7a4e2c', [3, 3])), [0, -0.1, 0], null, ws, 0); box(12, 5, 0.3, toon(0xffffff, P.wallpaper([2, 1])), [0, 2.5, -4], null, ws, 0); box(0.3, 5, 9, toon(0xffffff, P.wallpaper([2, 1])), [-6, 2.5, 0], null, ws, 0);
  add(new THREE.PlaneGeometry(4.6, 0.9), new THREE.MeshBasicMaterial({ map: P.sign('F. REICHELT — TAILLEUR', '#2d1b10', '#f2c14e') }), [300, 4.3, -3.8], [0, 0, 0], scene, 0);
  box(3, 0.1, 1.4, toon(0x6a4024), [-1.5, 0.95, -2.4], null, ws, 1); for (const x of [-2.8, -0.2]) box(0.12, 0.95, 1.3, toon(0x4a2e1a), [x, 0.47, -2.4], null, ws, 0);
  for (let k = 0; k < 4; k++) box(0.6, 0.05, 0.4, toon([0x8a2a2a, 0x2a4a7a, 0xd8c8a8, 0x3a6a3a][k]), [-2.5 + k * 0.7, 1.03, -2.3], [0, k * 0.3, 0], ws, 0);
  G.plan = add(new THREE.PlaneGeometry(2.2, 1.6), new THREE.MeshToonMaterial({ map: ctex(440, 320, (g, w, h) => { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a1a10'; g.lineWidth = 4; g.beginPath(); g.arc(220, 70, 22, 0, 7); g.moveTo(220, 92); g.lineTo(220, 200); g.moveTo(220, 200); g.lineTo(190, 270); g.moveTo(220, 200); g.lineTo(250, 270); g.stroke(); g.fillStyle = 'rgba(90,58,42,0.6)'; g.beginPath(); g.moveTo(220, 110); g.lineTo(60, 60); g.lineTo(90, 200); g.closePath(); g.fill(); g.beginPath(); g.moveTo(220, 110); g.lineTo(380, 60); g.lineTo(350, 200); g.closePath(); g.fill(); g.fillStyle = '#2a1a10'; g.font = 'bold 26px Georgia'; g.textAlign = 'center'; g.fillText('TRAJE-PARACAÍDAS', w / 2, 305); }), gradientMap: E.grad }), [302, 2.6, -3.8], [0, 0, 0], scene, 0);
  G.planX = add(new THREE.PlaneGeometry(2.2, 1.6), new THREE.MeshBasicMaterial({ map: ctex(440, 320, (g, w, h) => { g.strokeStyle = '#c81e1e'; g.lineWidth = 22; g.beginPath(); g.moveTo(40, 30); g.lineTo(w - 40, h - 30); g.moveTo(w - 40, 30); g.lineTo(40, h - 30); g.stroke(); g.fillStyle = '#c81e1e'; g.font = 'bold 54px Georgia'; g.textAlign = 'center'; g.save(); g.translate(w / 2, h / 2); g.rotate(-0.2); g.fillText('NO FUNCIONA', 0, 18); g.restore(); }), transparent: true }), [302, 2.6, -3.78], [0, 0, 0], scene, 0);
  // biplane model hanging
  const pl = new THREE.Group(); pl.position.set(303.5, 3.8, -1.5); scene.add(pl); box(1.2, 0.18, 0.2, toon(0xe8dcc0), [0, 0, 0], null, pl, 1); for (const y of [0.18, -0.12]) box(0.24, 0.03, 1.6, toon(0xc8b898), [0.15, y, 0], null, pl, 1); G.plane = pl;
  // mannequin with the suit
  G.manq = new THREE.Group(); G.manq.position.set(298, 0, -2.2); scene.add(G.manq); add(new THREE.CylinderGeometry(0.04, 0.04, 1, 6), ink, [0, 0.5, 0], [0, 0, 0], G.manq, 0); add(new THREE.CylinderGeometry(0.3, 0.22, 0.9, 12), toon(0x3a2a2a), [0, 1.4, 0], [0, 0, 0], G.manq, 1); add(new THREE.SphereGeometry(0.16, 10, 8), toon(0xd8c8a8), [0, 2.0, 0], [0, 0, 0], G.manq, 1);
  for (const s of [-1, 1]) add(new THREE.PlaneGeometry(0.8, 1.2), silk, [s * 0.5, 1.4, -0.1], [0, 0, s * -0.3], G.manq, 0);
  // ---- courtyard dummy test x=600 ----
  const cy = new THREE.Group(); cy.position.set(600, 0, 0); scene.add(cy);
  box(14, 12, 6, toon(0xffffff, P.plaster('#d8c8a8', [3, 3])), [0, 6, -6], null, cy, 1); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) box(1.2, 1.6, 0.1, toon(0x2a3448), [-4.5 + c * 3, 2.6 + r * 3.4, -2.95], null, cy, 0);
  const cg = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), toon(0xffffff, P.cobble([10, 8]))); cg.rotation.x = -Math.PI / 2; cg.position.set(600, 0.01, 4); scene.add(cg);
  G.dummy = new THREE.Group(); scene.add(G.dummy); const wd = toon(0xc8a070); add(new THREE.CylinderGeometry(0.22, 0.2, 0.8, 10), wd, [0, 0.9, 0], [0, 0, 0], G.dummy, 1); add(new THREE.SphereGeometry(0.17, 10, 8), wd, [0, 1.45, 0], [0, 0, 0], G.dummy, 1); for (const s of [-1, 1]) { box(0.1, 0.6, 0.1, wd, [s * 0.1, 0.3, 0], null, G.dummy, 1); box(0.08, 0.5, 0.08, wd, [s * 0.3, 1.0, 0], [0, 0, s * 0.4], G.dummy, 1); add(new THREE.PlaneGeometry(0.5, 0.7), silk, [s * 0.35, 1.0, -0.1], [0, 0, s * -0.4], G.dummy, 0); }
  // ---- police office x=-300 ----
  const of = new THREE.Group(); of.position.set(-300, 0, 0); scene.add(of);
  box(10, 0.2, 8, toon(0xffffff, P.planks('#5a3a22', [3, 3])), [0, -0.1, 0], null, of, 0); box(10, 5, 0.3, toon(0xffffff, P.plaster('#c8c0a8', [2, 1])), [0, 2.5, -3.5], null, of, 0);
  box(3, 0.1, 1.3, toon(0x4a2e1a), [0, 1.0, -1.6], null, of, 1); for (const x of [-1.3, 1.3]) box(0.15, 1.0, 1.2, toon(0x3a2416), [x, 0.5, -1.6], null, of, 0);
  add(new THREE.PlaneGeometry(1.8, 2.3), new THREE.MeshToonMaterial({ map: ctex(360, 460, (g, w, h) => { g.fillStyle = '#efe6cc'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.font = 'bold 34px Georgia'; g.textAlign = 'center'; g.fillText('LE PETIT', w / 2, 46); g.fillText('JOURNAL', w / 2, 84); g.fillRect(20, 96, w - 40, 4); g.font = 'bold 36px Georgia'; g.fillText('SALTO MORTAL', w / 2, 150); g.fillText('DESDE LA', w / 2, 192); g.fillText('TORRE EIFFEL', w / 2, 234); g.strokeStyle = '#1a1a1a'; g.lineWidth = 4; g.beginPath(); g.moveTo(180, 270); g.lineTo(160, 420); g.lineTo(200, 420); g.closePath(); g.stroke(); for (let k = 0; k < 4; k++) g.fillRect(30, 300 + k * 26, 100, 4); }), gradientMap: E.grad }), [-298.2, 2.6, -3.3], [0, 0, 0], scene, 0);
  for (let k = 0; k < 10; k++) { const c = new THREE.Group(); for (let j = 0; j < 4; j++) add(new THREE.SphereGeometry(10 + R(k * 4 + j) * 6, 10, 8), toon(0xffffff, null, { emissive: 0x777777 }), [j * 11 - 16, R(j + k) * 4, R(j * 3) * 5], [0, 0, 0], c, 0); c.position.set(-300 + R(k) * 600, 230 + R(k * 3) * 40, -400 + R(k * 7) * 300); scene.add(c); }
}
const rnd = (i, k) => { const x = Math.sin((i + k) * 9301 + 49297) * 233280; return x - Math.floor(x); };
export function update(f, Wd, E) {
  const t = f / 30;
  const c = Wd.cape; G.cape.visible = !!c; if (c) { G.cape.position.set(...c.p); G.cape.rotation.set(0, c.ry || 0, c.rz || 0); const open = c.open ?? 0.25, fl = Math.sin(t * (c.fast ? 22 : 6)) * (c.fast ? 0.35 : 0.12); G.capeL.rotation.z = open + fl; G.capeR.rotation.z = -open - fl; }
  const d = Wd.dust || 0; G.dust.forEach((m, k) => { m.visible = d > 0; if (!d) return; const u = Math.min(1, d * (0.7 + rnd(k, 1) * 0.6)), a = rnd(k, 2) * Math.PI * 2; m.position.set(Wd.dustAt[0] + Math.cos(a) * u * 2.4, 0.3 + u * 1.2 * (1 - u * 0.5), Wd.dustAt[2] + Math.sin(a) * u * 2.4); m.scale.setScalar(0.6 + u * 1.4); });
  G.flash.intensity = Wd.camFlash ? 60 : 0;
  const dm = Wd.dummy; G.dummy.visible = !!dm; if (dm) { G.dummy.position.set(...dm.p); G.dummy.rotation.set(dm.rx || 0, 0, dm.rz || 0); }
  G.planX.visible = !!Wd.planX; G.plane.rotation.y = Math.sin(t * 0.5) * 0.3;
}
