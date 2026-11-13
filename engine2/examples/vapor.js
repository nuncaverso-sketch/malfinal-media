// VID-012 v2 — Mary Ward (Birr, Ireland, 1869): scientist and microscopist, thrown from her cousins' experimental steam carriage — one of the first motor-vehicle deaths.
export let FRAMES = 1740;
let K, T, MW, C1, C2, horseCart, steam, smoke = [], bug, scope, tele, drawing, bonnet, parts = [], dust = [];
const PARK = [0, 0, 0], STUDY = [200, 0, 0], MACRO = [400, 0, 0];
const add = (a, b) => a.map((x, i) => x + b[i]);

function steamCar(K) {
  const g = new K.THREE.Group(); const body = new K.THREE.Group(); g.add(body); const iron = 0x2a2a30, brass = 0xc9a24a;
  K.box(3.4, 0.25, 1.5, 0x5a3a24, [0, 1.0, 0], { parent: body, roughness: 0.6 });
  const boiler = K.cyl(0.55, 0.55, 1.7, iron, [-0.6, 1.65, 0], { parent: body, metalness: 0.5, roughness: 0.4 }); boiler.rotation.z = Math.PI / 2;
  for (const x of [-1.2, -0.6, 0]) { const r = K.cyl(0.57, 0.57, 0.08, brass, [x, 1.65, 0], { parent: body, metalness: 0.7, roughness: 0.3 }); r.rotation.z = Math.PI / 2; }
  K.cyl(0.13, 0.17, 1.6, iron, [-1.3, 2.9, 0], { parent: body, metalness: 0.5 }); K.cyl(0.22, 0.13, 0.25, brass, [-1.3, 3.75, 0], { parent: body, metalness: 0.7 });
  K.box(1.0, 0.5, 1.3, 0x7a1f2a, [1.0, 1.4, 0], { parent: body, roughness: 0.5 }); K.box(0.15, 0.7, 1.3, 0x7a1f2a, [1.45, 1.75, 0], { parent: body });
  const wheels = []; for (const [x, r] of [[-1.2, 0.9], [1.1, 0.65]]) for (const z of [-0.85, 0.85]) { const w = new K.THREE.Group(); w.position.set(x, r, z); body.add(w);
    const rim = new K.THREE.Mesh(new K.THREE.TorusGeometry(r, 0.07, 10, 32), K.std(iron, { metalness: 0.6 })); rim.castShadow = true; w.add(rim);
    for (let s = 0; s < 8; s++) { const sp = K.box(0.05, r * 2, 0.05, brass, [0, 0, 0], { parent: w, metalness: 0.6 }); sp.rotation.z = s * Math.PI / 8; } wheels.push(w); }
  g.userData.wheels = wheels; g.userData.body = body; K.scene.add(g); return g;
}
function bonnetHat(K) { const g = new K.THREE.Group(); const b = K.sph(0.3, 0x6a3a8a, [0, 0, 0], { parent: g }); b.scale.set(1, 0.7, 1); K.box(0.06, 0.3, 0.02, 0xf2d8e8, [0.2, -0.15, 0], { parent: g }); K.scene.add(g); return g; }

export async function build(k) {
  K = k; await K.preloadEnvs(); T = await K.timing(); FRAMES = Math.ceil(T.duration * 30) + 6;
  const C = K.makeChar;
  MW = C(K.scene, { shirt: 0x5a2a6a, belt: 0x2a1a2a, hair: 0x4a2a14, seed: 1, glasses: false });
  const bon = K.sph(0.33, 0x6a3a8a, [0, 0.13, -0.1], { roughness: 0.6 }); bon.scale.set(1.02, 0.78, 0.95); const skirt = K.cyl(0.2, 0.45, 0.6, 0x5a2a6a, [0, -0.02, 0]); MW.head.add(bon); MW.torso.add(skirt); skirt.position.set(0, 0.05, 0);
  C1 = C(K.scene, { shirt: 0x2a4a6a, hat: 'top', hatColor: 0x1a1a1a, mustache: true, seed: 2 }); C2 = C(K.scene, { shirt: 0x4a5a3a, hat: 'bowler', hatColor: 0x3a2a1a, beard: '#5a3a1a', seed: 3 });
  // ---------- PARK / CASTLE (Birr, 1869) ----------
  K.ground(0x6aa04a);
  K.plane(7, 300, K.std(0xb8a07a, { roughness: 1 }), add(PARK, [0, 0.01, -60]));
  const cast = [['LargeSquareTowerBricks', -14, -52, 0, 14], ['TallWallBricks', -4, -56, 0, 9], ['TallWallEntrance', 6, -56, 0, 9], ['LargeTower', 16, -52, 0, 15], ['SmallSquareTowerBricks', -24, -40, 0, 10]];
  for (const [n, x, z, r, h] of cast) await K.placeH(`modular_medieval_buildings_pack/${n}`, add(PARK, [x, 0, z]), r, h);
  for (let i = 0; i < 12; i++) await K.placeH(`nature_pack/${['CommonTree', 'Willow', 'BirchTree'][i % 3]}_${(i % 5) + 1}`, add(PARK, [(i % 2 ? 1 : -1) * (7 + (i % 4) * 3), 0, 14 - i * 8]), i, 6 + (i % 3));
  for (let i = 0; i < 20; i++) await K.placeH('nature_pack/Bush_1', add(PARK, [(i % 2 ? 1 : -1) * (4.2 + (i % 3)), 0, 10 - i * 4]), i, 1.0);
  for (let i = 0; i < 7; i++) K.cloud(add(PARK, [-80 + i * 26, 45 + (i % 3) * 10, -180]), 7);
  steam = steamCar(K);
  horseCart = new K.THREE.Group(); await K.placeH('medieval_village_pack/Cart', [0, 0, 0], 0, 1.8, { parent: horseCart }); await K.placeH('animals_pack/Horse_White', [0, 0, 2.4], 0, 2.0, { parent: horseCart }); K.scene.add(horseCart);
  for (let i = 0; i < 22; i++) smoke.push(K.sph(0.35, 0xe8e8e8, [0, -99, 0], { roughness: 1, transparent: true, opacity: 0.7 }));
  for (let i = 0; i < 16; i++) dust.push(K.sph(0.3, 0xc8b08a, [0, -99, 0], { roughness: 1, transparent: true, opacity: 0.8 }));
  for (let i = 0; i < 6; i++) parts.push(K.box(0.6, 0.15, 0.4, [0x2a2a30, 0xc9a24a, 0x7a1f2a][i % 3], [0, -99, 0], { metalness: 0.4 }));
  bonnet = bonnetHat(K);
  // ---------- STUDY ----------
  K.plane(12, 10, K.std(0x6a4a30), add(STUDY, [0, 0.01, 0])); const wp = K.std(0x3a4a6a, { roughness: 0.9 });
  K.plane(12, 6, wp, add(STUDY, [0, 3, -5]), [0, 0, 0]); K.plane(10, 6, wp, add(STUDY, [-6, 3, 0]), [0, Math.PI / 2, 0]); K.plane(10, 6, wp, add(STUDY, [6, 3, 0]), [0, -Math.PI / 2, 0]);
  await K.placeH('house_interior_pack/Bookshelf', add(STUDY, [-3, 0, -4.6]), 0, 3.2); await K.placeH('house_interior_pack/Window_Large1', add(STUDY, [2.6, 1.4, -4.9]), 0, 2.6);
  K.box(2.4, 0.1, 1.2, 0x4a2a18, add(STUDY, [-0.6, 1.0, -2.2])); for (const x of [-1.7, 0.5]) for (const z of [-0.5, 0.5]) K.box(0.1, 1.0, 0.1, 0x2a1a10, add(STUDY, [x, 0.5, -2.2 + z]));
  const ins = K.tex(512, 512, (g, w, h) => { g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a1a10'; g.lineWidth = 5; g.fillStyle = '#7a5a2a'; g.beginPath(); g.ellipse(256, 280, 70, 120, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(256, 140, 40, 0, 7); g.fill(); g.stroke();
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(256 + s * 60, 220 + i * 60); g.lineTo(256 + s * 170, 180 + i * 90); g.lineTo(256 + s * 200, 260 + i * 90); g.stroke(); } g.beginPath(); g.moveTo(240, 110); g.lineTo(200, 40); g.moveTo(272, 110); g.lineTo(312, 40); g.stroke(); g.fillStyle = 'rgba(160,200,230,0.5)'; g.beginPath(); g.ellipse(160, 240, 90, 40, -0.5, 0, 7); g.ellipse(352, 240, 90, 40, 0.5, 0, 7); g.fill(); });
  drawing = K.box(0.7, 0.01, 0.7, 0xffffff, add(STUDY, [-0.8, 1.06, -2.1]), { map: ins, roughness: 0.9 });
  scope = new K.THREE.Group(); K.cyl(0.18, 0.22, 0.08, 0x2a2a30, [0, 0.04, 0], { parent: scope, metalness: 0.6 }); K.cyl(0.03, 0.03, 0.5, 0xc9a24a, [0, 0.3, -0.08], { parent: scope, metalness: 0.7 }); const tb = K.cyl(0.06, 0.05, 0.45, 0x2a2a30, [0, 0.45, 0], { parent: scope, metalness: 0.6 }); tb.rotation.x = 0.4; scope.position.set(...add(STUDY, [0.1, 1.05, -2.3])); K.scene.add(scope);
  tele = new K.THREE.Group(); for (const a of [0, 2.1, 4.2]) { const l = K.cyl(0.03, 0.03, 1.8, 0x5a3a24, [Math.cos(a) * 0.4, 0.85, Math.sin(a) * 0.4], { parent: tele }); l.rotation.set(Math.sin(a) * 0.22, 0, -Math.cos(a) * 0.22); }
  const tt = K.cyl(0.14, 0.1, 1.8, 0xc9a24a, [0, 1.85, 0], { parent: tele, metalness: 0.7, roughness: 0.25 }); tt.rotation.z = 1.0; tele.position.set(...add(STUDY, [2.6, 0, -3.2])); K.scene.add(tele);
  K.pointLight(0xffe0b0, 5, add(STUDY, [0, 3.5, 0]), 12);
  // ---------- MACRO: tiny insect vs the giant wheel ----------
  K.plane(40, 40, K.std(0xb8a07a, { roughness: 1 }), add(MACRO, [0, 0.01, 0]));
  bug = new K.THREE.Group(); const sh = K.sph(0.12, 0xc81e1e, [0, 0.08, 0], { parent: bug, roughness: 0.3 }); sh.scale.set(1, 0.6, 1.2); K.sph(0.06, 0x1a1a1a, [0, 0.07, 0.13], { parent: bug }); for (let i = 0; i < 5; i++) K.sph(0.025, 0x1a1a1a, [Math.cos(i * 1.3) * 0.06, 0.15, Math.sin(i * 1.3) * 0.07], { parent: bug });
  bug.position.set(...add(MACRO, [0, 0, 1])); K.scene.add(bug);
}

const P = (c, p, f) => K.poseChar(c, p, f);
function hideAll() { for (const c of [MW, C1, C2]) c.root.visible = false; for (const s of smoke) s.position.y = -99; for (const d of dust) d.position.y = -99; for (const p of parts) p.position.y = -99; bonnet.visible = false; steam.position.set(0, -200, 0); horseCart.position.set(0, -200, 0); steam.userData.body.rotation.set(0, 0, 0); if (MW.root.parent !== K.scene) K.scene.add(MW.root); MW.root.scale.setScalar(1); }
function puff(f, src, n = 22, dir = [-1, 0, 0]) { smoke.slice(0, n).forEach((s, i) => { const age = ((f * 0.8 + i * 9) % 70) / 70; s.position.set(src[0] + dir[0] * age * 4 + Math.sin(i) * 0.3 * age, src[1] + age * 3, src[2] + dir[2] * age * 4 + Math.cos(i * 1.7) * 0.3 * age); s.scale.setScalar(0.5 + age * 2.5); s.material.opacity = 0.7 * (1 - age); }); }
function drive(f, pos, yaw, spin = 1) { steam.position.set(...pos); steam.rotation.y = yaw; for (const w of steam.userData.wheels) w.rotation.z = -f * 0.12 * spin; const ch = steam.localToWorld(new K.THREE.Vector3(-1.3, 3.9, 0)).toArray(); puff(f, ch, 22, [-Math.cos(yaw), 0, Math.sin(yaw)]); }
function ride(f, expr = 'happy', arms = 'up') { P(MW, { pos: [0, 0, 0], sit: 1, expr, arms }, f); steam.userData.body.add(MW.root); MW.root.position.set(1.0, 1.15, 0); MW.root.rotation.y = Math.PI / 2; MW.root.scale.setScalar(0.85); }

export function frame(f, k) {
  hideAll(); const ph = K.at(f), t = f / 30, u = (i, j) => K.u(f, i, j);
  switch (ph) {
    case 0: { // HOOK: a steam carriage thunders down the park road; Mary aboard
      K.preset('day'); const z = 8 - t * 6; drive(f, add(PARK, [0, 0, z]), Math.PI / 2, 1.6); ride(f, 'laugh', 'up');
      K.move({ p: add(PARK, [4.5, 1.5, z - 6]), l: add(PARK, [0, 1.8, z]), fov: 40 }, { p: add(PARK, [3.6, 1.2, z - 4.5]), l: add(PARK, [0, 1.8, z]), fov: 38 }, u(0), 1.4, f); K.focusOn(add(PARK, [0, 1.8, z])); break; }
    case 1: { // Ireland 1869: horses only — a horse cart passes the castle
      K.preset('day'); horseCart.position.set(...add(PARK, [0, 0, -8 + u(1) * 8])); horseCart.rotation.y = 0;
      K.move({ p: add(PARK, [-3, 9, 18]), l: add(PARK, [0, 5, -40]), fov: 42 }, { p: add(PARK, [-2, 4, 12]), l: add(PARK, [0, 4, -40]), fov: 40 }, u(1), 0.3, f); K.focusOn(add(PARK, [0, 2, -4])); K.lens.aperture.value = 0.2; break; }
    case 2: { // Mary Ward, a scientist (almost impossible for a woman then)
      K.preset('interior', { exposure: 1.15 }); P(MW, { pos: add(STUDY, [0.4, 0, -0.9]), yaw: -0.2, expr: 'proud', arms: 'akimbo' }, f);
      K.move(K.frame([add(STUDY, [0.4, 0, -0.9])], { yaw: 0.3, pitch: 0.06, h: 2.5 }), K.frame([add(STUDY, [0.4, 0, -0.9])], { yaw: 0.15, pitch: 0.05, h: 2.5, push: 0.78 }), u(2), 0.4, f); K.focusOn(add(STUDY, [0.4, 1.7, -0.9])); break; }
    case 3: { // she drew insects so precisely experts used her drawings: top-down on the drawing
      K.preset('interior', { exposure: 1.15 }); P(MW, { pos: add(STUDY, [-2.3, 0, -2.0]), yaw: Math.PI / 2, expr: 'happy', arms: 'hold', lean: 0.25, look: [0, -0.4] }, f);
      K.move({ p: add(STUDY, [-0.4, 2.6, -0.4]), l: add(STUDY, [-1.2, 1.1, -2.1]), fov: 38 }, { p: add(STUDY, [-0.5, 2.3, -0.8]), l: add(STUDY, [-1.0, 1.06, -2.1]), fov: 34 }, u(3), 0.3, f); K.focusOn(add(STUDY, [-0.8, 1.06, -2.1])); break; }
    case 4: { // books on the microscope and the telescope: she peers into the telescope
      K.preset('interior', { exposure: 1.15 }); P(MW, { pos: add(STUDY, [1.9, 0, -2.6]), yaw: 2.3, expr: 'happy', arms: 'reach', lean: 0.2, look: [0, 0.4] }, f);
      K.move(K.frame([add(STUDY, [1.9, 0, -2.6]), add(STUDY, [2.6, 0, -3.2]), add(STUDY, [0.1, 0.4, -2.3])], { yaw: 0.25, pitch: 0.1, h: 2.8 }), K.frame([add(STUDY, [1.9, 0, -2.6]), add(STUDY, [2.6, 0, -3.2])], { yaw: 0.35, pitch: 0.08, h: 2.8 }), u(4), 0.4, f); K.focusOn(add(STUDY, [2.2, 1.7, -2.9])); break; }
    case 5: { // her cousins built a new machine: hammering in the yard
      K.preset('day'); steam.position.set(...add(PARK, [0, 0, 2])); steam.rotation.y = 0.3; P(C1, { pos: add(PARK, [2.4, 0, 3.6]), yaw: -1.0, expr: 'angry', arms: 'hammer' }, f); P(C2, { pos: add(PARK, [-2.6, 0, 3.4]), yaw: 1.0, expr: 'proud', arms: 'akimbo' }, f);
      K.move(K.frame([add(PARK, [0, 0, 2]), add(PARK, [2.4, 0, 3.6]), add(PARK, [-2.6, 0, 3.4])], { yaw: 0.1, pitch: 0.12, h: 3.6 }), K.frame([add(PARK, [0, 0, 2]), add(PARK, [2.4, 0, 3.6]), add(PARK, [-2.6, 0, 3.4])], { yaw: -0.05, pitch: 0.1, h: 3.6, push: 0.92 }), u(5), 0.4, f); K.focusOn(add(PARK, [0, 1.8, 2.6])); break; }
    case 6: { // a carriage that moved by itself... with steam: it starts puffing and rolls
      K.preset('day'); const v = u(6); drive(f, add(PARK, [v * v * 4, 0, 2]), 0.3, v); P(C1, { pos: add(PARK, [2.4, 0, 4.6]), yaw: -0.5, expr: 'shock', arms: 'up' }, f); P(C2, { pos: add(PARK, [-2.6, 0, 4.4]), yaw: 0.5, expr: 'laugh', arms: 'up' }, f);
      K.move({ p: add(PARK, [1, 2.6, 13]), l: add(PARK, [1, 2.2, 2]), fov: 40 }, { p: add(PARK, [1.5, 2.4, 11]), l: add(PARK, [2, 2.4, 2]), fov: 40 }, v, 0.5, f); K.focusOn(add(PARK, [1, 2, 2])); break; }
    case 7: { // a summer day, Mary climbs aboard for a ride
      K.preset('golden', { exposure: 1.05 }); steam.position.set(...add(PARK, [0, 0, 2])); steam.rotation.y = Math.PI / 2; for (const w of steam.userData.wheels) w.rotation.z = 0; ride(f, 'laugh', 'wave');
      K.move({ p: add(PARK, [4, 2.4, 6]), l: add(PARK, [0, 2.0, 2]), fov: 36 }, { p: add(PARK, [3.2, 2.2, 4.8]), l: add(PARK, [0, 2.2, 1.6]), fov: 32 }, u(7), 0.4, f); K.focusOn(add(PARK, [0, 2.2, 1.6])); break; }
    case 8: { // smoke, noise, speed! low tracking shot, onlookers amazed
      K.preset('golden'); const z = 10 - u(8) * 40; drive(f, add(PARK, [0, 0, z]), Math.PI / 2, 2.2); ride(f, 'laugh', 'up');
      P(C1, { pos: add(PARK, [3.8, 0, -6]), yaw: -1.4, expr: 'shock', arms: 'up' }, f); P(C2, { pos: add(PARK, [4.6, 0, -9]), yaw: -1.4, expr: 'shock', arms: 'reach' }, f);
      K.move({ p: add(PARK, [2.2, 0.6, z - 5]), l: add(PARK, [0, 1.8, z]), fov: 40 }, {}, 0, 2.5, f); K.focusOn(add(PARK, [0, 1.8, z])); break; }
    case 9: { // on a curve the carriage jolts: it tilts, flash
      K.preset('golden'); const v = u(9); const z = -20 - v * 10; drive(f, add(PARK, [v * 2, 0, z]), Math.PI / 2 + v * 0.6, 2.2); steam.userData.body.rotation.x = Math.sin(v * Math.PI) * 0.25; ride(f, 'shock', 'flail');
      if (v > 0.6) K.grade.flash.value = Math.max(0, 0.5 - (v - 0.6) * 4); K.move({ p: add(PARK, [2.9, 2.0, z + 7]), l: add(PARK, [v * 2, 1.8, z]), fov: 40 }, {}, 0, 3, f); K.focusOn(add(PARK, [v * 2, 1.8, z])); break; }
    case 10: { // Mary was thrown from her seat: she flies up out of frame (no gore)
      K.preset('golden'); const v = u(10); drive(f, add(PARK, [2, 0, -30 - v * 5]), Math.PI / 2 + 0.6, 2.2);
      P(MW, { pos: add(PARK, [4 + v * 3, 2.2 + Math.sin(v * Math.PI) * 2.2, -28 - v * 1.5]), yaw: 1.2, expr: 'scared', arms: 'flail', fall: v * 0.8 }, f);
      K.move({ p: add(PARK, [14, 3.2, -22]), l: add(PARK, [5, 3.0, -29]), fov: 44 }, {}, 0, 2, f); K.focusOn(add(PARK, [3, 2.6, -30])); break; }
    case 11: { // ...and fell in front of the wheels: the big wheel rolls into the lens -> black
      K.preset('golden'); const v = u(11); drive(f, add(PARK, [0, 0, -32 + v * 4.5]), -Math.PI / 2, 2); steam.rotation.y = -Math.PI / 2;
      K.move({ p: add(PARK, [0.9, 0.5, -24.5]), l: add(PARK, [0.9, 0.9, -32]), fov: 40 }, {}, 0, 1.5, f); K.focusOn(add(PARK, [0.9, 0.9, -29])); K.grade.black.value = Math.max(0, (v - 0.75) * 4); break; }
    case 12: { // she died almost instantly: the empty road, her bonnet, dust settling (desaturated)
      K.preset('golden', { exposure: 0.95 }); K.grade.sat.value = 0.6; bonnet.visible = true; bonnet.position.set(...add(PARK, [0.5, 0.18, -30])); bonnet.rotation.set(0.4, 0.5, 0.2);
            K.move({ p: add(PARK, [2.6, 1.4, -26.4]), l: add(PARK, [0.5, 0.2, -30]), fov: 36 }, { p: add(PARK, [2.2, 1.1, -27.2]), l: add(PARK, [0.5, 0.2, -30]), fov: 32 }, u(12), 0.2, f); K.focusOn(add(PARK, [0.5, 0.2, -30])); break; }
    case 13: { // after the accident, the family destroyed the machine: hammer blows, parts fly
      K.preset('dusk', { exposure: 1.05 }); steam.position.set(...add(PARK, [0, 0, 2])); steam.rotation.y = 0.3; K.grade.sat.value = 0.85;
      P(C1, { pos: add(PARK, [2.3, 0, 3.4]), yaw: -1.0, expr: 'angry', arms: 'hammer' }, f); P(C2, { pos: add(PARK, [-2.4, 0, 3.4]), yaw: 1.0, expr: 'angry', arms: 'hammer' }, f);
      parts.forEach((p, i) => { const age = ((f - K.ph[13].a) * 0.03 + i * 0.17) % 1; p.position.set(...add(PARK, [(i % 2 ? 1 : -1) * (0.6 + age * 2), 1.6 + Math.sin(age * Math.PI) * 1.5 - age * 1.6, 2.5 + (i % 3) * 0.3])); p.rotation.set(age * 8, i, age * 5); });
      K.move(K.frame([add(PARK, [0, 0, 2]), add(PARK, [2.3, 0, 3.4]), add(PARK, [-2.4, 0, 3.4])], { yaw: 0, pitch: 0.12, h: 3.6 }), K.frame([add(PARK, [0, 0, 2])], { yaw: 0.1, pitch: 0.1, h: 3.6, pad: 1.5 }), u(13), 1.2, f); K.focusOn(add(PARK, [0, 1.8, 2.4])); break; }
    case 14: { // she studied the smallest things... and was beaten by a huge machine: macro of a tiny insect, a giant wheel rolls past
      K.preset('golden'); const v = u(14); steam.position.set(...add(MACRO, [-6 + v * 9, 0, -1.2])); steam.rotation.y = 0; for (const w of steam.userData.wheels) w.rotation.z = -f * 0.08; bug.rotation.y = t;
      K.move({ p: add(MACRO, [0.6, 0.25, 2.1]), l: add(MACRO, [0, 0.4, 0.4]), fov: 40 }, { p: add(MACRO, [0.4, 0.2, 1.8]), l: add(MACRO, [0, 0.6, 0]), fov: 44 }, v, 0.3, f); K.focusOn(add(MACRO, [0, 0.1, 1])); K.lens.aperture.value = 0.7; break; }
    default: { // nobody plans their end: the castle at dusk -> loops
      K.preset('dusk'); K.move({ p: add(PARK, [0, 3, 18]), l: add(PARK, [0, 5, -52]), fov: 42 }, { p: add(PARK, [2, 2, 12]), l: add(PARK, [0, 2.4, 0]), fov: 40 }, u(15), 0.3, f); K.focusOn(add(PARK, [0, 3, -20]));
    }
  }
}
