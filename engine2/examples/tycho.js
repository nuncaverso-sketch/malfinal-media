// VID-014 (first RICK-STYLE reference) — Tycho Brahe (1601): metal nose; at a Prague banquet he refused to leave the table before the host, held his bladder, died 11 days later.
// Rick-style rules used here: wide lens (44°), close & low framing, cel shading + ink lines, a BIG sign that explains each beat, something moving in every shot, whip/punch cuts at every phrase.
export let FRAMES = 2000;
let K, T, days = [], TY, BA, G1, G2, DU, guests = [], elk, chalice, clock, hand1, hand2, stars = [], noseFly, glue, chair, dizzy = [];
const ISL = [0, 0, 0], DUEL = [200, 0, 0], HALL = [400, 0, 0], BED = [600, 0, 0], NIGHT = [800, 0, 0];
const add = (a, b) => a.map((x, i) => x + b[i]);
const P = (c, p, f) => K.poseChar(c, p, f);

async function hall() {
  const wood = K.tex(256, 256, (g, w, h) => { g.fillStyle = '#6a3a1e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#5a2e16' : '#7a4424'; g.fillRect(0, i * 32, w, 30); } }, [8, 8]);
  K.plane(24, 20, K.std(0xffffff, { map: wood }), add(HALL, [0, 0.01, 0]));
  const wall = K.tex(256, 256, (g, w, h) => { g.fillStyle = '#2f5a3a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(243,197,55,0.35)'; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.beginPath(); g.moveTo(x * 64 + 32, y * 64 + 12); g.lineTo(x * 64 + 46, y * 64 + 32); g.lineTo(x * 64 + 32, y * 64 + 52); g.lineTo(x * 64 + 18, y * 64 + 32); g.fill(); } }, [6, 2]);
  const wm = K.std(0xffffff, { map: wall }); K.plane(24, 7, wm, add(HALL, [0, 3.5, -10]), [0, 0, 0]); K.plane(20, 7, wm, add(HALL, [-12, 3.5, 0]), [0, Math.PI / 2, 0]); K.plane(20, 7, wm, add(HALL, [12, 3.5, 0]), [0, -Math.PI / 2, 0]);
  K.box(24, 0.3, 0.2, 0xc9a24a, add(HALL, [0, 5.4, -9.9]));
  // long banquet table along x
  K.box(9, 0.14, 1.8, 0x7a4424, add(HALL, [0, 1.05, -2])); K.box(9.1, 0.04, 1.9, 0xf2ece0, add(HALL, [0, 1.14, -2]));
  for (const x of [-4, 4]) for (const z of [-0.7, 0.7]) K.box(0.16, 1.05, 0.16, 0x4a2a14, add(HALL, [x, 0.52, -2 + z]));
  const foods = ['rpg_items_pack/ChickenLeg', 'rpg_items_pack/Chalice', 'house_interior_pack/Plate_1', 'rpg_items_pack/Chalice', 'rpg_items_pack/ChickenLeg', 'house_interior_pack/Plate_2'];
  for (let i = 0; i < 12; i++) await K.placeH(foods[i % 6], add(HALL, [-4 + i * 0.72, 1.17, -2 + (i % 2 ? 0.45 : -0.45)]), i, foods[i % 6].includes('Plate') ? 0.5 : 0.32, { byW: foods[i % 6].includes('Plate') });
  for (let i = 0; i < 3; i++) { K.cyl(0.05, 0.07, 0.5, 0xc9a24a, add(HALL, [-3 + i * 3, 1.42, -2]), { metalness: 0.7 }); K.cyl(0.04, 0.04, 0.22, 0xf4ecd8, add(HALL, [-3 + i * 3, 1.78, -2])); const fl = K.sph(0.05, 0xffc060, add(HALL, [-3 + i * 3, 1.95, -2]), { emissive: 0xffa040, emissiveIntensity: 10 }); fl.scale.y = 1.7; }
  K.pointLight(0xffb870, 14, add(HALL, [0, 3.2, 0]), 20);
  for (const s of [-1, 1]) await K.placeH('house_interior_pack/Curtains_Double', add(HALL, [s * 7, 0, -9.7]), 0, 6.5);
  await K.placeH('house_interior_pack/Fireplace', add(HALL, [0, 0, -9.6]), 0, 3.2);
  K.sign('PRAGA · 1601', add(HALL, [0, 5.0, -9.75]), { w: 4.6, h: 1.0, bg: '#5a1a2a' });
  // wall clock
  clock = new K.THREE.Group(); const face = K.cyl(0.7, 0.7, 0.12, 0xf4ecd8, [0, 0, 0], { parent: clock }); face.rotation.x = Math.PI / 2; const rim = new K.THREE.Mesh(new K.THREE.TorusGeometry(0.72, 0.06, 8, 32), K.std(0xc9a24a, { metalness: 0.6 })); clock.add(rim);
  hand1 = K.box(0.05, 0.45, 0.03, 0x1a1a1a, [0, 0.2, 0.08], { parent: clock }); hand2 = K.box(0.04, 0.6, 0.03, 0x1a1a1a, [0, 0.28, 0.1], { parent: clock });
  for (const h of [hand1, hand2]) { h.geometry.translate(0, h === hand1 ? 0.2 : 0.28, 0); h.position.set(0, 0, h === hand1 ? 0.08 : 0.1); }
  clock.position.set(...add(HALL, [-3.2, 4.0, -9.7])); K.scene.add(clock);
}

export async function build(k) {
  K = k; await K.preloadEnvs(); T = await K.timing(); FRAMES = Math.ceil(T.duration * 30) + 6;
  const C = K.makeChar;
  TY = C(K.scene, { shirt: 0x2a3a8a, buttons: 0xf3c537, belt: 0xc9a24a, cape: 0x8a1f2e, hair: 0xc8762a, mustache: true, nose: 0xe2b23a, seed: 1 });
  BA = C(K.scene, { shirt: 0x6a1a3a, buttons: 0xf3c537, hat: 'wig', hatColor: 0xd8c8a8, cape: 0x2a1a4a, mustache: true, seed: 2 });
  DU = C(K.scene, { shirt: 0x3a5a2a, hair: 0x2a1a10, seed: 3, beard: '#2a1a10' });
  for (let i = 0; i < 4; i++) guests.push(C(K.scene, { shirt: [0x8a5a2a, 0x2a6a6a, 0x7a2a5a, 0x5a5a2a][i], hat: ['wig', 'hair', 'bowler', 'hair'][i], hatColor: 0x3a2a1a, hair: [0x5a3418, 0xa86a2a, 0x2a1a10, 0x6a6a6a][i], seed: 10 + i }));
  // ---------- ISLAND + castle (Uraniborg) ----------
  K.plane(600, 600, K.std(0x2a8ad8, { roughness: 0.3 }), add(ISL, [0, -0.4, 0]));
  const isl = new K.THREE.Mesh(new K.THREE.CylinderGeometry(26, 30, 1, 48), K.std(0x6ab84a)); isl.position.set(...add(ISL, [0, -0.45, -6])); isl.receiveShadow = true; K.scene.add(isl);
  for (const [n, x, z, h] of [['PointyTower', -6, -16, 12], ['LargeTower', 6, -16, 11], ['WallBricks', 0, -18, 6], ['SmallTower', -12, -10, 8], ['Watchtower', 12, -9, 9]]) await K.placeH(`modular_medieval_buildings_pack/${n}`, add(ISL, [x, 0, z]), 0, h);
  for (let i = 0; i < 9; i++) await K.placeH(`nature_pack/${['CommonTree', 'PineTree', 'BirchTree'][i % 3]}_${(i % 5) + 1}`, add(ISL, [(i % 2 ? 1 : -1) * (12 + (i % 4) * 3.5), 0, 4 - i * 3]), i, 5 + (i % 3));
  for (let i = 0; i < 12; i++) await K.placeH('nature_pack/Bush_1', add(ISL, [(i % 2 ? 1 : -1) * (3 + (i % 5)), 0, 6 - i * 1.6]), i, 0.9);
  for (const [x, z, r] of [[-2.6, 0, 0.6], [3, -2, -0.5]]) { const sc = new K.THREE.Group(); for (const a of [0, 2.1, 4.2]) { const l = K.cyl(0.05, 0.05, 2.0, 0x5a3a24, [Math.cos(a) * 0.45, 0.95, Math.sin(a) * 0.45], { parent: sc }); l.rotation.set(Math.sin(a) * 0.22, 0, -Math.cos(a) * 0.22); }
    const tb = K.cyl(0.22, 0.15, 2.6, 0xc9a24a, [0, 2.1, 0], { parent: sc, metalness: 0.75, roughness: 0.25 }); tb.rotation.z = 1.0; sc.position.set(...add(ISL, [x, 0, z])); sc.rotation.y = r; K.scene.add(sc); }
  elk = await K.placeH('animals_pack/Stag', add(ISL, [-5, 0, 3]), 0.8, 2.6);
  K.sign('URANIBORG', add(ISL, [4.2, 2.2, 1.5]), { w: 2.8, h: 0.8, bg: '#2a4a8a', posts: true, rotY: -0.4 });
  for (let i = 0; i < 6; i++) K.cloud(add(ISL, [-70 + i * 28, 40 + (i % 3) * 8, -160]), 7);
  // ---------- DUEL (night, torches) ----------
  K.plane(40, 40, K.std(0x5a5a62), add(DUEL, [0, 0.01, 0]));
  for (const [n, x, z, h] of [['TallWallBricks', 0, -8, 7], ['SmallSquareTowerBricks', -9, -7, 9], ['SmallSquareTowerBricks', 9, -7, 9]]) await K.placeH(`modular_medieval_buildings_pack/${n}`, add(DUEL, [x, 0, z]), 0, h);
  for (const x of [-3.5, 3.5]) { await K.placeH('survival_pack/WoodenTorch_Fire', add(DUEL, [x, 0, -5]), 0, 2.2); K.pointLight(0xff9a40, 10, add(DUEL, [x, 2.4, -4.6]), 12); }
  K.sign('1 + 1 = ?', add(DUEL, [0, 3.0, -7.8]), { w: 3.2, h: 1.1, bg: '#1e3a2a', fg: '#ffffff', border: '#d8d8d8' });
  noseFly = K.sph(0.08, 0xf2d8c8, [0, -99, 0]);
  for (let i = 0; i < 10; i++) stars.push(K.sph(0.06, 0xfff0a0, [0, -99, 0], { emissive: 0xffe060, emissiveIntensity: 6 }));
  glue = new K.THREE.Group(); K.cyl(0.18, 0.2, 0.4, 0xd8e8f0, [0, 0.2, 0], { parent: glue }); K.cyl(0.14, 0.14, 0.08, 0x8a5a2a, [0, 0.44, 0], { parent: glue }); K.scene.add(glue);
  // ---------- BANQUET HALL ----------
  await hall();
  chair = await K.placeH('house_interior_pack/Chair_2', add(HALL, [1.2, 0, -0.8]), Math.PI, 1.3);
  // ---------- BEDROOM ----------
  K.plane(12, 10, K.std(0x5a3a2a), add(BED, [0, 0.01, 0])); const bw = K.std(0x3a4a6a); K.plane(12, 6, bw, add(BED, [0, 3, -5]), [0, 0, 0]); K.plane(10, 6, bw, add(BED, [-6, 3, 0]), [0, Math.PI / 2, 0]); K.plane(10, 6, bw, add(BED, [6, 3, 0]), [0, -Math.PI / 2, 0]);
  await K.placeH('house_interior_pack/Bed_King', add(BED, [0, 0, -2.6]), 0, 2.6, { byW: true });
  await K.placeH('house_interior_pack/NightStand_1', add(BED, [-2.1, 0, -3.4]), 0, 0.9); await K.placeH('survival_pack/WoodenTorch_Fire', add(BED, [-2.1, 0.9, -3.4]), 0, 0.6);
  await K.placeH('house_interior_pack/Window_Round1', add(BED, [2.8, 2.4, -4.9]), 0, 1.4);
  K.pointLight(0xff9a50, 6, add(BED, [-1.6, 2.0, -2.4]), 10);
  for (let d = 1; d <= 11; d++) { const sg = K.sign('DÍA ' + d, add(BED, [2.6, 2.6, -4.8]), { w: 1.4, h: 0.6, bg: '#e8e2d4', fg: '#8a1f2e', border: '#2a1a10' }); sg.visible = false; days.push(sg); }
  K.sign('PEGAMENTO', add(HALL, [6.75, 1.75, 4.62]), { w: 0.9, h: 0.3, bg: '#e8e2d4', fg: '#2a1a10', border: '#2a1a10' });
  K.sign('NADIE SE LEVANTA', add(HALL, [-5.0, 3.3, -3.6]), { w: 3.0, h: 0.8, bg: '#8a1f2e' });
  for (let i = 0; i < 6; i++) dizzy.push(K.sph(0.08, 0xffe060, [0, -99, 0], { emissive: 0xffd040, emissiveIntensity: 5 }));
  // ---------- NIGHT SKY ----------
  K.plane(200, 200, K.std(0x2a3a2a), add(NIGHT, [0, 0, 0]));
  const sg = new K.THREE.BufferGeometry(); const sp = []; for (let i = 0; i < 2000; i++) { const a = Math.random() * 6.28, b = Math.random() * 1.4, r = 300; sp.push(NIGHT[0] + r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)); }
  sg.setAttribute('position', new K.THREE.Float32BufferAttribute(sp, 3)); const pts = new K.THREE.Points(sg, new K.THREE.PointsMaterial({ color: 0xffffff, size: 1.6, fog: false })); pts.userData.noDepth = true; K.scene.add(pts);
  const sc2 = new K.THREE.Group(); for (const a of [0, 2.1, 4.2]) { const l = K.cyl(0.05, 0.05, 2.0, 0x5a3a24, [Math.cos(a) * 0.45, 0.95, Math.sin(a) * 0.45], { parent: sc2 }); l.rotation.set(Math.sin(a) * 0.22, 0, -Math.cos(a) * 0.22); }
  const tb2 = K.cyl(0.22, 0.15, 2.6, 0xc9a24a, [0, 2.1, 0], { parent: sc2, metalness: 0.75 }); tb2.rotation.z = 1.0; sc2.position.set(...add(NIGHT, [0, 0, 0])); K.scene.add(sc2);
  await K.placeH('house_interior_pack/Chair_2', add(NIGHT, [1.4, 0, 0.6]), -0.6, 1.3);
}

function hideAll() { for (const d of days) d.visible = false; for (const c of [TY, BA, DU, ...guests]) c.root.visible = false; noseFly.position.y = -99; for (const s of stars) s.position.y = -99; for (const d of dizzy) d.position.y = -99; glue.position.y = -99; if (chalice && chalice.parent !== K.scene) { chalice.parent.remove(chalice); } }
function feast(f, o = {}) { // seated guests + baron at the head (x=-5)
  P(BA, { pos: add(HALL, [-5.0, 0, -2]), yaw: Math.PI / 2, expr: o.baron || 'happy', arms: o.baronArms || 'drink', talk: o.baronTalk || 0 }, f);
  guests.forEach((c, i) => { const x = -2.6 + (i % 2) * 2.8, z = i < 2 ? -3.2 : -0.8; P(c, { pos: add(HALL, [x, 0, z]), yaw: z < -2 ? 0 : Math.PI, expr: o.guests || 'laugh', arms: i % 2 ? 'drink' : 'wave', talk: o.guestTalk ?? 0.5, headTilt: Math.sin(f * 0.1 + i) * 0.1 }, f); });
}
const tySeat = add(HALL, [1.2, 0, -0.8]);
function tyAtTable(f, p = {}) { P(TY, { pos: tySeat, yaw: Math.PI, expr: 'happy', arms: 'drink', ...p }, f); }

export function frame(f, k) {
  hideAll(); const ph = K.at(f), t = f / 30, u = (i, j) => K.u(f, i, j);
  switch (ph) {
    case 0: { // HOOK: shiny metal nose in a close-up, at the feast, squirming
      K.preset('interior', { exposure: 1.15 }); feast(f); tyAtTable(f, { expr: 'worried', tremble: 2, sweat: true, arms: 'cross' });
      K.move(K.frame([tySeat], { yaw: Math.PI + 0.25, h: 2.9, lookY: 2.35, push: 0.64, pitch: 0.02 }), K.frame([tySeat], { yaw: Math.PI + 0.15, h: 2.9, lookY: 2.3, push: 0.58, pitch: 0.0 }), u(0), 1.2, f); K.focusOn(add(tySeat, [0, 2.3, 0])); break; }
    case 1: { // the most famous astronomer in Europe: proud by his telescope
      K.preset('day'); const p = add(ISL, [-1.4, 0, 1.2]); P(TY, { pos: p, yaw: 0.3, expr: 'proud', arms: 'akimbo' }, f);
      K.move(K.frame([p], { yaw: 0.6, pitch: -0.05, h: 3.0, push: 0.8 }), K.frame([p], { yaw: 0.45, pitch: -0.07, h: 3.0, push: 0.68 }), u(1), 0.6, f); K.focusOn(add(p, [0, 2, 0])); break; }
    case 2: { // an island, a castle full of telescopes... and a pet elk: crane over the island, the elk bobbing
      K.preset('day'); elk.rotation.y = 0.8 + Math.sin(t * 2) * 0.15; const p = add(ISL, [-1.4, 0, 1.2]); P(TY, { pos: p, yaw: -0.8, expr: 'laugh', arms: 'wave' }, f);
      const v = u(2); K.move({ p: add(ISL, [10, 14, 24]), l: add(ISL, [0, 3, -8]), fov: 48 }, { p: add(ISL, [-1, 3.2, 9]), l: add(ISL, [-3, 1.6, 2]), fov: 46 }, v, 0.5, f); K.focusOn(add(ISL, [-3, 1.5, 2])); K.lens.aperture.value = 0.25; break; }
    case 3: { // the nose? lost in a sword duel... over a math argument
      K.preset('night', { exposure: 1.35 }); const a = add(DUEL, [-1.0, 0, -1]), b = add(DUEL, [1.0, 0, -1]); const v = u(3);
      P(TY, { pos: a, yaw: 1.4, expr: 'angry', arms: 'point', talk: 0.6 }, f); P(DU, { pos: b, yaw: -1.4, expr: 'angry', arms: 'point' }, f);
      if (v > 0.55) { const w = (v - 0.55) / 0.45; noseFly.position.set(...add(a, [0.4 + w * 1.6, 2.35 + Math.sin(w * Math.PI) * 1.2, 0.2])); stars.forEach((s, i) => { const ang = i * 0.63; s.position.set(...add(a, [0.35 + Math.cos(ang) * w * 0.8, 2.3 + Math.sin(ang) * w * 0.8, 0.3])); }); if (w < 0.15) K.grade.flash.value = 0.5; P(TY, { pos: a, yaw: 1.4, expr: 'shock', arms: 'flail', tremble: 2 }, f); }
      K.move(K.frame([a, b], { yaw: 0.05, pitch: -0.04, h: 2.8, push: 0.78 }), K.frame([a, b], { yaw: -0.05, pitch: -0.06, h: 2.8, push: 0.7 }), v, 1.5, f); K.focusOn(add(DUEL, [0, 2, -1])); break; }
    case 4: { // since then, a metal nose stuck on with glue: macro on the shiny nose + glue pot
      K.preset('interior', { exposure: 1.2 }); const p = add(HALL, [6, 0, 4]); P(TY, { pos: p, yaw: 0, expr: 'smug', arms: 'think', look: [0.2, 0] }, f); glue.position.set(...add(p, [0.75, 1.1, 0.6]));
      K.move(K.frame([p], { yaw: 0.2, h: 2.9, lookY: 2.25, push: 0.62, pitch: 0.02 }), K.frame([p], { yaw: 0.1, h: 2.9, lookY: 2.3, push: 0.55 }), u(4), 0.5, f); K.focusOn(add(p, [0, 2.3, 0.4])); break; }
    case 5: { // but that wasn't the strangest part: punch-in, lights dim
      K.preset('interior', { exposure: 0.9 }); K.grade.vig.value = 0.55; const p = add(HALL, [6, 0, 4]); P(TY, { pos: p, yaw: 0, expr: 'worried', arms: 'down', look: [0.4, -0.1] }, f);
      K.move(K.frame([p], { yaw: -0.1, h: 2.9, lookY: 2.3, push: 0.72 }), K.frame([p], { yaw: -0.05, h: 2.9, lookY: 2.3, push: 0.56 }), K.ease(u(5)), 0.3, f); K.focusOn(add(p, [0, 2.3, 0])); break; }
    case 6: { // 1601, a banquet in Prague with an important baron: wide hall
      K.preset('interior', { exposure: 1.15 }); feast(f); tyAtTable(f, { expr: 'laugh', talk: 0.5 });
      K.move({ p: add(HALL, [6, 4.6, 7]), l: add(HALL, [-1, 1.4, -3]), fov: 48 }, { p: add(HALL, [3.6, 3.0, 4.6]), l: add(HALL, [-2, 1.5, -2]), fov: 46 }, u(6), 0.4, f); K.focusOn(add(HALL, [-1, 1.5, -2])); K.lens.aperture.value = 0.25; break; }
    case 7: { // the rule: nobody leaves the table before the host — big sign, the baron wags his finger
      K.preset('interior', { exposure: 1.15 }); feast(f, { baron: 'smug', baronArms: 'point', baronTalk: 0.8 }); guests.forEach((c) => { c.root.visible = false; }); tyAtTable(f, { expr: 'neutral' });
      K.move(K.frame([add(HALL, [-5, 0, -2])], { yaw: Math.PI / 2 + 0.5, h: 4.4, lookY: 2.4, pitch: -0.05, push: 0.85 }), K.frame([add(HALL, [-5, 0, -2])], { yaw: Math.PI / 2 + 0.35, h: 4.4, lookY: 2.5, pitch: -0.08, push: 0.75 }), u(7), 0.5, f); K.focusOn(add(HALL, [-5, 2.2, -2])); break; }
    case 8: { // he drank... and drank... and needed the bathroom: refills, squirming
      K.preset('interior', { exposure: 1.15 }); feast(f); const v = u(8); tyAtTable(f, { expr: v < 0.6 ? 'laugh' : 'worried', arms: 'drink', tremble: v > 0.6 ? 2 : 0, sweat: v > 0.6, talk: v < 0.6 ? 0.4 : 0 });
      K.move(K.frame([tySeat], { yaw: Math.PI - 0.5, h: 2.9, lookY: 1.9, push: 0.62, pitch: -0.04 }), K.frame([tySeat], { yaw: Math.PI - 0.35, h: 2.9, lookY: 1.9, push: 0.77, pitch: -0.06 }), v, 0.8, f); K.focusOn(add(tySeat, [0, 2.0, 0])); break; }
    case 9: { // but getting up would be terribly rude: he half-rises, the whole table stares
      K.preset('interior', { exposure: 1.15 }); feast(f, { baron: 'angry', guests: 'shock', guestTalk: 0, baronArms: 'cross' }); const v = u(9); const up = Math.sin(Math.min(1, v * 1.4) * Math.PI) * 0.35;
      P(TY, { pos: add(tySeat, [0, up, 0]), yaw: Math.PI, expr: 'scared', arms: 'shrug', sweat: true }, f);
      K.move(K.frame([tySeat, add(HALL, [-1.2, 0, -3.2]), add(HALL, [1.6, 0, -3.2])], { yaw: 0.35, h: 2.9, pitch: 0.3, push: 0.95 }), K.frame([tySeat, add(HALL, [-1.2, 0, -3.2]), add(HALL, [1.6, 0, -3.2])], { yaw: 0.25, h: 2.9, pitch: 0.26, push: 0.88 }), v, 0.6, f); K.focusOn(add(tySeat, [0, 2, -1])); break; }
    case 10: { // so he held it: one hour, two hours, the whole dinner — the clock spins
      K.preset('interior', { exposure: 1.1 }); feast(f); tyAtTable(f, { expr: 'tired', arms: 'cross', tremble: 3, sweat: true });
      const v = u(10); hand2.rotation.z = -v * Math.PI * 2 * 3; hand1.rotation.z = -v * Math.PI * 0.6;
      if (v < 0.45) { K.move({ p: add(HALL, [-2.6, 3.6, -6.0]), l: add(HALL, [-3.2, 4.0, -9.7]), fov: 42 }, {}, 0, 0.3, f); K.focusOn(add(HALL, [-3.2, 4.0, -9.7])); }
      else { K.move(K.frame([tySeat], { yaw: Math.PI + 0.2, h: 2.9, lookY: 2.3, push: 0.62 }), K.frame([tySeat], { yaw: Math.PI + 0.15, h: 2.9, lookY: 2.3, push: 0.56 }), (v - 0.45) / 0.55, 1.5, f); K.focusOn(add(tySeat, [0, 2.3, 0])); }
      break; }
    case 11: { // and here everything went wrong: dramatic dark punch on his face
      K.preset('candle', { exposure: 1.0 }); K.grade.vig.value = 0.6; K.grade.sat.value = 1.0; feast(f, { guests: 'neutral', guestTalk: 0 }); tyAtTable(f, { expr: 'scared', arms: 'cross', tremble: 4 });
      K.move(K.frame([tySeat], { yaw: Math.PI, h: 2.9, lookY: 2.3, push: 0.77, pitch: 0.12 }), K.frame([tySeat], { yaw: Math.PI, h: 2.9, lookY: 2.3, push: 0.52, pitch: 0.18 }), K.ease(u(11)), 0.5, f); K.focusOn(add(tySeat, [0, 2.3, 0])); break; }
    case 12: { // home at last, he couldn't pee: by the bed, worried, sign
      K.preset('candle', { exposure: 1.3 }); const p = add(BED, [1.6, 0, -0.6]); P(TY, { pos: p, yaw: -0.4, expr: 'worried', arms: 'shrug', tremble: 1.5, sweat: true }, f);
      K.move(K.frame([p], { yaw: 0.2, h: 2.9, pitch: 0.04, push: 0.75 }), K.frame([p], { yaw: 0.1, h: 2.9, pitch: 0.02, push: 0.65 }), u(12), 0.5, f); K.focusOn(add(p, [0, 2, 0])); break; }
    case 13: { // eleven days of fever and delirium: in bed, stars circling his head, DAY 11 sign
      K.preset('candle', { exposure: 1.3 }); const p = add(BED, [0, 0.62, -2.4]); P(TY, { pos: p, yaw: 0, sit: 1, lean: -0.35, expr: 'tired', sweat: true, look: [Math.sin(t * 2) * 0.4, 0.2] }, f);
      dizzy.forEach((d, i) => { const a = t * 3 + i * 1.05; d.position.set(...add(p, [Math.cos(a) * 0.55, 2.0 + Math.sin(a * 2) * 0.05 + 0.6, Math.sin(a) * 0.55])); });
      days[Math.min(10, Math.floor(u(13) * 11))].visible = true;
      K.move(K.frame([p], { yaw: 0.25, h: 2.4, lookY: 1.6, pitch: 0.12, push: 0.85 }), K.frame([p], { yaw: 0.15, h: 2.4, lookY: 1.7, pitch: 0.1, push: 0.7 }), u(13), 0.4, f); K.focusOn(add(p, [0, 1.8, 0])); break; }
    case 14: { // and he died: the torch goes out, the empty bed (no gore)
      K.preset('night', { exposure: 1.1 }); K.grade.sat.value = 0.7; K.move({ p: add(BED, [1.8, 2.2, 2.2]), l: add(BED, [0, 0.8, -2.4]), fov: 44 }, { p: add(BED, [1.4, 2.0, 1.4]), l: add(BED, [0, 0.8, -2.4]), fov: 42 }, u(14), 0.2, f); K.focusOn(add(BED, [0, 0.8, -2.4])); break; }
    case 15: { // the man who measured the stars...: night sky, his telescope and an empty chair
      K.preset('night', { exposure: 1.2 }); const v = u(15); K.move({ p: add(NIGHT, [3.5, 1.2, 5]), l: add(NIGHT, [0, 2, 0]), fov: 46 }, { p: add(NIGHT, [2.4, 1.0, 3.6]), l: add(NIGHT, [0, 6, -10]), fov: 48 }, v, 0.3, f); K.focusOn(add(NIGHT, [0, 2, 0])); break; }
    default: { // nobody plans their end -> loops back to the nose close-up at the feast
      K.preset('interior', { exposure: 1.1 }); feast(f, { guestTalk: 0 }); tyAtTable(f, { expr: 'worried', arms: 'cross', tremble: 1 });
      K.move(K.frame([tySeat], { yaw: Math.PI, h: 2.9, pitch: 0.06, push: 1.1 }), K.frame([tySeat], { yaw: Math.PI + 0.25, h: 2.9, lookY: 2.35, push: 0.67 }), u(16), 0.5, f); K.focusOn(add(tySeat, [0, 2.3, 0]));
    }
  }
}
