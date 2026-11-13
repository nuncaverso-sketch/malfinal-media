// VID-011 v2 — Francis Bacon (1626): stuffed a chicken with snow to test refrigeration, caught a chill, put in a damp bed, died of pneumonia.
export let FRAMES = 1900;
let K, T, FB, W, D, coach, horse, chicken, snowballs = [], flakes, thought, bulb, candle, candleL, book, hatSnow;
const ROAD = [0, 0, 0], STUDY = [200, 0, 0], MAN = [400, 0, 0], BOOK = [600, 0, 0];
const add = (a, b) => a.map((x, i) => x + b[i]);

function makeChicken(K) { const g = new K.THREE.Group(); const sk = 0xf2c8a8;
  const b = K.sph(0.28, sk, [0, 0.25, 0], { parent: g, roughness: 0.6 }); b.scale.set(1.25, 0.95, 1);
  for (const s of [-1, 1]) { const l = K.sph(0.11, sk, [s * 0.18, 0.08, 0.12], { parent: g }); l.scale.set(0.8, 1.4, 0.8); }
  const sn = K.sph(0.13, 0xffffff, [0.34, 0.3, 0], { parent: g, roughness: 1, emissive: 0xdfefff, emissiveIntensity: 0.3 }); sn.name = 'snow'; sn.visible = false;
  g.scale.setScalar(0.55); K.scene.add(g); return g; }

export async function build(k) {
  K = k; await K.preloadEnvs(); T = await K.timing(); FRAMES = Math.ceil(T.duration * 30) + 6;
  const C = K.makeChar;
  FB = C(K.scene, { shirt: 0x1a1a24, buttons: 0xc9a24a, hat: 'top', hatColor: 0x14141a, beard: '#8a8a88', mustache: true, cape: 0x3a1a1a, seed: 1 });
  const ruff = new K.THREE.Mesh(new K.THREE.TorusGeometry(0.2, 0.07, 10, 24), K.std(0xf8f6f0, { roughness: 0.8 })); ruff.rotation.x = Math.PI / 2; ruff.position.y = 0.6; FB.torso.add(ruff);
  W = C(K.scene, { shirt: 0x6a3a2a, apron: undefined, hair: 0x8a5a2a, seed: 2, blush: true });
  D = C(K.scene, { shirt: 0x2a3a5a, hat: 'wig', seed: 3 });
  // ---------- SNOWY ROAD (London, winter 1626) ----------
  K.ground(0xf2f6fa); const snowM = K.std(0xf4f8ff, { roughness: 0.9 });
  K.plane(6, 200, K.std(0xc8c4c0, { roughness: 1 }), add(ROAD, [0, 0.01, -40]));
  const hs = ['House_1', 'House_2', 'House_3', 'House_4'];
  for (let i = 0; i < 6; i++) { await K.place(`medieval_village_pack/${hs[i % 4]}`, add(ROAD, [-9, 0, 2 - i * 9]), Math.PI / 2, 2.7, { tint: 0xd8e2f0 }); await K.place(`medieval_village_pack/${hs[(i + 2) % 4]}`, add(ROAD, [9, 0, -2 - i * 9]), -Math.PI / 2, 2.7, { tint: 0xd8e2f0 }); }
  for (let i = 0; i < 10; i++) await K.placeH(`nature_pack/${i % 2 ? 'PineTree_Snow' : 'CommonTree_Snow'}_${(i % 5) + 1}`, add(ROAD, [(i % 2 ? 1 : -1) * (15 + (i % 3) * 3), 0, 6 - i * 8]), i, 7);
  for (let i = 0; i < 18; i++) { const m = K.sph(0.7 + (i % 3) * 0.3, 0xf4f8ff, add(ROAD, [(i % 2 ? 1 : -1) * (3.6 + (i % 4) * 0.7), 0, 4 - i * 4]), { roughness: 1 }); m.scale.y = 0.35; }
  coach = new K.THREE.Group(); K.scene.add(coach);
  const cart = await K.placeH('medieval_village_pack/Cart', [0, 0, 0], 0, 1.9, { parent: coach });
  K.box(1.7, 1.3, 1.9, 0x3a1a14, [0, 1.6, -0.2], { parent: coach, roughness: 0.4 }); K.box(1.9, 0.12, 2.1, 0xc9a24a, [0, 2.3, -0.2], { parent: coach, metalness: 0.5 });
  horse = await K.placeH('animals_pack/Horse', [0, 0, 2.6], 0, 2.0, { parent: coach });
  chicken = makeChicken(K);
  for (let i = 0; i < 10; i++) snowballs.push(K.sph(0.08, 0xffffff, [0, -99, 0], { roughness: 1, emissive: 0xdfefff, emissiveIntensity: 0.3 }));
  const fg = new K.THREE.BufferGeometry(); const fp = []; for (let i = 0; i < 2500; i++) fp.push((Math.random() - 0.5) * 40, Math.random() * 16, (Math.random() - 0.5) * 40);
  fg.setAttribute('position', new K.THREE.Float32BufferAttribute(fp, 3)); const dot = K.tex(32, 32, (g) => { const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); });
  flakes = new K.THREE.Points(fg, new K.THREE.PointsMaterial({ color: 0xffffff, size: 0.09, map: dot, transparent: true, depthWrite: false })); flakes.userData.noDepth = true; K.scene.add(flakes);
  thought = new K.THREE.Mesh(new K.THREE.SphereGeometry(0.55, 24, 16), new K.THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.2 })); K.scene.add(thought);
  // ---------- STUDY ----------
  const wood = K.std(0x5a3a24, { roughness: 0.7 }); K.plane(12, 10, wood, add(STUDY, [0, 0.01, 0]));
  const wp = K.std(0x4a5a3a, { roughness: 0.9 }); K.plane(12, 6, wp, add(STUDY, [0, 3, -5]), [0, 0, 0]); K.plane(10, 6, wp, add(STUDY, [-6, 3, 0]), [0, Math.PI / 2, 0]); K.plane(10, 6, wp, add(STUDY, [6, 3, 0]), [0, -Math.PI / 2, 0]);
  for (const x of [-2.6, 2.6]) await K.placeH('house_interior_pack/Bookshelf', add(STUDY, [x, 0, -4.6]), 0, 3.4);
  K.box(2.6, 0.12, 1.2, 0x4a2a18, add(STUDY, [0, 1.05, -2.2])); for (const x of [-1.15, 1.15]) for (const z of [-0.5, 0.5]) K.box(0.12, 1.05, 0.12, 0x2a1a10, add(STUDY, [x, 0.52, -2.2 + z]));
  for (let i = 0; i < 4; i++) await K.placeH(`rpg_items_pack/${['Book2_Open', 'Scroll', 'Potion3_Filled', 'Book1_Closed'][i]}`, add(STUDY, [-0.9 + i * 0.6, 1.11, -2.3]), i * 0.4, [0.3, 0.25, 0.4, 0.25][i], { byW: i !== 2 });
  K.pointLight(0xffc888, 5, add(STUDY, [0, 3, 0]), 12);
  // ---------- MANSION BEDROOM (damp bed) ----------
  K.plane(12, 10, K.std(0x5a4a3a), add(MAN, [0, 0.01, 0])); const mw = K.std(0x5a6a7a, { roughness: 0.95 });
  K.plane(12, 6, mw, add(MAN, [0, 3, -5]), [0, 0, 0]); K.plane(10, 6, mw, add(MAN, [-6, 3, 0]), [0, Math.PI / 2, 0]); K.plane(10, 6, mw, add(MAN, [6, 3, 0]), [0, -Math.PI / 2, 0]);
  await K.placeH('house_interior_pack/Bed_King', add(MAN, [0, 0, -2.6]), 0, 2.4, { byW: true, tint: 0x9ab0c8 });
  for (let i = 0; i < 8; i++) { const d = K.sph(0.05, 0x9fd0ff, add(MAN, [-0.9 + i * 0.26, 1.2, -1.8]), { roughness: 0.05, transparent: true, opacity: 0.7 }); d.scale.y = 1.6; d.userData.drip = i; }
  await K.placeH('house_interior_pack/Window_Large1', add(MAN, [3, 1.5, -4.9]), 0, 2.4);
  candle = new K.THREE.Group(); K.cyl(0.08, 0.08, 0.4, 0xf4ecd8, [0, 0.2, 0], { parent: candle }); const fl = K.sph(0.06, 0xffc060, [0, 0.48, 0], { parent: candle, emissive: 0xffa040, emissiveIntensity: 9 }); fl.scale.y = 1.8; fl.name = 'flame';
  await K.placeH('house_interior_pack/NightStand_1', add(MAN, [-1.9, 0, -3.4]), 0, 0.9); candle.position.set(...add(MAN, [-1.9, 0.9, -3.4])); K.scene.add(candle);
  candleL = K.pointLight(0xffa860, 4, add(MAN, [-1.6, 1.8, -2.8]), 9);
  // ---------- CHRONICLE desk ----------
  K.plane(6, 6, K.std(0x3a2418), add(BOOK, [0, 0.9, 0]));
  book = await K.placeH('rpg_items_pack/Book3_Open', add(BOOK, [0, 0.92, 0]), 0, 1.2, { byW: true });
  const qc = K.cyl(0.01, 0.02, 0.6, 0xf8f8f0, add(BOOK, [0.5, 1.2, 0.2])); qc.rotation.z = -0.6;
  K.pointLight(0xffb070, 4, add(BOOK, [-0.8, 1.8, 0.6]), 6);
  hatSnow = new K.THREE.Group(); K.cyl(0.38, 0.38, 0.03, 0x14141a, [0, 0, 0], { parent: hatSnow }); K.cyl(0.24, 0.25, 0.42, 0x14141a, [0, 0.22, 0], { parent: hatSnow }); K.scene.add(hatSnow);
}

const P = (c, p, f) => K.poseChar(c, p, f);
function hideAll() { for (const c of [FB, W, D]) c.root.visible = false; for (const s of snowballs) s.position.y = -99; thought.visible = false; chicken.visible = false; chicken.getObjectByName('snow').visible = false; hatSnow.visible = false; flakes.visible = false; coach.position.set(0, -200, 0); if (chicken.parent !== K.scene) K.scene.add(chicken); }
function snowfall(f, c) { flakes.visible = true; flakes.position.set(c[0], c[1] - ((f * 0.04) % 16) + 0, c[2]); }
function stuff(f, at, t0, n = 10) { snowballs.slice(0, n).forEach((s, i) => { const age = ((f - t0) * 0.05 + i * 0.1) % 1; s.position.set(at[0] + 0.8 - age * 0.8, at[1] + 0.45 + Math.sin(age * Math.PI) * 0.4, at[2] + 0.3 - age * 0.3); s.scale.setScalar(1 - age * 0.5); }); }

export function frame(f, k) {
  hideAll(); const ph = K.at(f), t = f / 30, u = (i, j) => K.u(f, i, j);
  const snowDay = (o = {}) => K.preset('day', { sky: [0x8aa0c0, 0xc8d4e4, 0xe8eef6], fog: [0xdfe6f0, 35, 220], sun: 0xe8f0ff, sunI: 2.2, exposure: 1.0, ...o });
  switch (ph) {
    case 0: { // HOOK: a great scientist stuffing a chicken with snow, in the snow
      snowDay(); snowfall(f, ROAD); const at = add(ROAD, [1.2, 0, 1.6]); chicken.visible = true; chicken.position.set(...add(at, [0.5, 0.7, 0.5])); chicken.getObjectByName('snow').visible = true;
      P(FB, { pos: at, yaw: 0.4, expr: 'proud', arms: 'reach', lean: 0.25 }, f); stuff(f, add(at, [0.5, 0.4, 0.5]), 0);
      K.move(K.frame([at], { yaw: 0.9, pitch: 0.06, h: 2.6 }), K.frame([at], { yaw: 0.7, pitch: 0.04, h: 2.6, push: 0.8 }), u(0), 0.6, f); K.focusOn(add(at, [0.3, 1.3, 0.3])); break; }
    case 1: { // London, 1626: snowy street, a coach passes
      snowDay(); snowfall(f, ROAD); coach.position.set(...add(ROAD, [0, 0, -14 + u(1) * 10])); coach.rotation.y = 0;
      K.move({ p: add(ROAD, [2, 9, 18]), l: add(ROAD, [0, 2, -14]), fov: 42 }, { p: add(ROAD, [2.5, 4, 12]), l: add(ROAD, [0, 1.6, -8]), fov: 40 }, u(1), 0.4, f); K.focusOn(coach.position.toArray()); K.lens.aperture.value = 0.25; break; }
    case 2: { // Francis Bacon: philosopher, politician, father of the scientific method
      K.preset('interior', { exposure: 1.15 }); P(FB, { pos: add(STUDY, [0, 0, -0.9]), yaw: 0, expr: 'proud', arms: 'akimbo' }, f);
      K.move(K.frame([add(STUDY, [0, 0, -0.9])], { yaw: -0.3, pitch: 0.06, h: 2.7 }), K.frame([add(STUDY, [0, 0, -0.9])], { yaw: -0.1, pitch: 0.04, h: 2.7, push: 0.78 }), u(2), 0.4, f); K.focusOn(add(STUDY, [0, 1.8, -0.9])); break; }
    case 3: { // believe nothing until you test it: he raises a flask and points
      K.preset('interior', { exposure: 1.15 }); P(FB, { pos: add(STUDY, [0.3, 0, -1.0]), yaw: -0.3, expr: 'smug', arms: 'point', talk: 0.8, look: [0.3, 0] }, f);
      K.move(K.frame([add(STUDY, [0.3, 0, -1.0])], { yaw: 0.35, pitch: 0.04, h: 2.6, lookY: 1.5, push: 0.7 }), K.frame([add(STUDY, [0.3, 0, -1.0])], { yaw: 0.25, pitch: 0.04, h: 2.6, lookY: 1.6, push: 0.6 }), u(3), 0.4, f); K.focusOn(add(STUDY, [0.3, 1.8, -1])); break; }
    case 4: { // a winter day, riding his coach through the snow
      snowDay(); snowfall(f, ROAD); coach.position.set(...add(ROAD, [0, 0, -4 - u(4) * 8])); coach.rotation.y = Math.PI; P(FB, { pos: [0, 0, 0], yaw: 0, sit: 1, expr: 'happy', look: [0.6, 0] }, f); coach.add(FB.root); FB.root.position.set(0, 1.0, 0.6); FB.root.rotation.y = Math.PI; FB.root.scale.setScalar(0.75);
      const cp = coach.position.toArray(); K.move({ p: add(cp, [5, 2.2, -5]), l: add(cp, [0, 1.6, 0]), fov: 40 }, { p: add(cp, [4, 2.0, -3]), l: add(cp, [0, 1.8, 0]), fov: 36 }, u(4), 0.8, f); K.focusOn(add(cp, [0, 1.8, 0])); break; }
    case 5: { // the question: can cold preserve meat? (thought bubble with a chicken)
      snowDay(); snowfall(f, ROAD); const at = add(ROAD, [0, 0, -2]); P(FB, { pos: at, yaw: 0, expr: 'neutral', arms: 'think', look: [0.2, 0.35] }, f);
      thought.visible = true; thought.position.set(...add(at, [0.8, 3.3, 0])); chicken.visible = true; chicken.position.set(...add(at, [0.8, 3.08, 0])); chicken.rotation.y = t;
      K.move(K.frame([at], { yaw: 0.2, pitch: 0.05, h: 3.6, lookY: 2.3, push: 0.75 }), K.frame([at], { yaw: 0.1, pitch: 0.05, h: 3.6, lookY: 2.4, push: 0.68 }), u(5), 0.4, f); K.focusOn(add(at, [0.4, 2.6, 0])); break; }
    case 6: { // he didn't wait to get home: jumps out of the coach
      snowDay(); snowfall(f, ROAD); coach.position.set(...add(ROAD, [-1.8, 0, -4])); coach.rotation.y = Math.PI; const v = u(6); const at = add(ROAD, [0.6 + v * 0.8, Math.sin(Math.min(1, v * 1.6) * Math.PI) * 0.6, -3.5 + v]);
      P(FB, { pos: at, yaw: 0.6, expr: 'laugh', arms: 'up', run: 1, walk: t * 2 }, f);
      K.move(K.frame([at, add(ROAD, [-1.8, 0, -4])], { yaw: 0.5, pitch: 0.08, h: 2.8 }), K.frame([at], { yaw: 0.5, pitch: 0.06, h: 2.8, pad: 1.6 }), v, 0.8, f); K.focusOn(add(at, [0, 1.5, 0])); break; }
    case 7: { // bought a chicken from a woman right there
      snowDay(); snowfall(f, ROAD); const a = add(ROAD, [1.2, 0, 0]), b = add(ROAD, [-0.6, 0, 0.2]); const v = u(7);
      P(FB, { pos: a, yaw: -1.3, expr: 'happy', arms: v > 0.6 ? 'hold' : 'reach', talk: 0.6 }, f); P(W, { pos: b, yaw: 1.3, expr: 'happy', arms: v > 0.6 ? 'down' : 'hold', talk: v < 0.5 ? 0.6 : 0 }, f);
      chicken.visible = true; (v > 0.6 ? FB : W).hold(chicken, [0, -0.15, 0.2], [0, 0, 0]);
      K.move(K.frame([a, b], { yaw: 0.05, pitch: 0.06 }), K.frame([a, b], { yaw: -0.05, pitch: 0.05, push: 0.85 }), v, 0.4, f); K.focusOn(add(ROAD, [0.3, 1.5, 0])); break; }
    case 8: { // stuffed it with snow with his own hands
      snowDay(); snowfall(f, ROAD); const at = add(ROAD, [1.2, 0, 1.6]); chicken.visible = true; chicken.position.set(...add(at, [0.5, 0.7, 0.5])); chicken.getObjectByName('snow').visible = u(8) > 0.4;
      P(FB, { pos: at, yaw: 0.4, expr: 'laugh', arms: 'reach', lean: 0.3 }, f); stuff(f, add(at, [0.5, 0.4, 0.5]), K.ph[8].a);
      K.move({ p: add(at, [1.9, 1.4, 2.6]), l: add(at, [0.5, 0.8, 0.5]), fov: 34 }, { p: add(at, [1.5, 1.2, 2.0]), l: add(at, [0.5, 0.75, 0.5]), fov: 30 }, u(8), 0.5, f); K.focusOn(add(at, [0.5, 0.8, 0.5])); break; }
    case 9: { // caught a terrible chill: shivering, blue
      snowDay({ exposure: 0.95 }); snowfall(f, ROAD); K.grade.sat.value = 0.75; const at = add(ROAD, [1.2, 0, 1.6]);
      P(FB, { pos: at, yaw: 0.2, expr: 'worried', arms: 'cross', tremble: 3, sweat: true, nod: Math.sin(t * 3) > 0.85 ? 1 : 0 }, f);
      K.move(K.frame([at], { yaw: 0.15, pitch: 0.02, h: 2.4, lookY: 1.6, push: 0.62 }), K.frame([at], { yaw: 0.1, pitch: 0.02, h: 2.4, lookY: 1.7, push: 0.55 }), u(9), 1.5, f); K.focusOn(add(at, [0, 1.8, 0])); break; }
    case 10: { // far from home: taken to a friend's mansion (coach at night outside a big house)
      K.preset('night', { exposure: 1.3, fog: [0x2a3458, 15, 100] }); snowfall(f, ROAD); coach.position.set(...add(ROAD, [0, 0, -18 + u(10) * 6])); coach.rotation.y = 0;
      K.move({ p: add(ROAD, [5, 3, -2]), l: add(ROAD, [0, 2, -16]), fov: 40 }, { p: add(ROAD, [4, 2.5, -5]), l: add(ROAD, [0, 2, -14]), fov: 38 }, u(10), 0.4, f); K.focusOn(coach.position.toArray()); break; }
    case 11: { // a damp bed, unused for a year: drips, he lies down shivering
      K.preset('candle', { exposure: 1.3 }); K.grade.sat.value = 0.85; const at = add(MAN, [0, 0.85, -2.8]);
      P(FB, { pos: at, yaw: 0, sit: 1, expr: 'worried', fall: 0.9, tremble: 2 }, f); FB.root.rotation.x = -1.35;
      K.scene.children.forEach((o) => { if (o.userData.drip !== undefined) o.position.y = MAN[1] + 1.25 - ((f * 0.02 + o.userData.drip * 0.13) % 0.6); });
      K.move({ p: add(MAN, [2.2, 2.6, 1.8]), l: add(MAN, [0, 1.0, -2.4]), fov: 38 }, { p: add(MAN, [1.6, 2.2, 1.0]), l: add(MAN, [0, 1.0, -2.4]), fov: 36 }, u(11), 0.4, f); K.focusOn(add(MAN, [0, 1.0, -2.4])); break; }
    case 12: { // days later, pneumonia: the candle goes out over the empty bed (no gore)
      K.preset('candle', { exposure: 1.2 }); const v = u(12); candle.getObjectByName('flame').visible = v < 0.6; candleL.intensity = v < 0.6 ? 4 : 0.4; K.grade.sat.value = 0.7;
      K.move({ p: add(MAN, [-1.0, 1.4, -1.6]), l: add(MAN, [-1.9, 1.3, -3.4]), fov: 34 }, { p: add(MAN, [-1.2, 1.4, -2.2]), l: add(MAN, [-1.9, 1.3, -3.4]), fov: 30 }, v, 0.2, f); K.focusOn(add(MAN, [-1.9, 1.3, -3.4])); candle.getObjectByName('flame').visible = v < 0.6; break; }
    case 13: { // so say the chronicles of the time: an old book by candlelight
      K.preset('candle', { exposure: 1.3 }); K.move({ p: add(BOOK, [0.6, 2.6, 1.6]), l: add(BOOK, [0, 0.95, 0]), fov: 36 }, { p: add(BOOK, [0.3, 2.2, 1.0]), l: add(BOOK, [0, 0.95, 0]), fov: 34 }, u(13), 0.2, f); K.focusOn(add(BOOK, [0, 0.95, 0])); break; }
    case 14: { // his last experiment did give a result: the snow-stuffed chicken, still fresh, sparkling
      snowDay({ exposure: 1.1 }); snowfall(f, ROAD); const at = add(ROAD, [2, 0.02, 2]); chicken.visible = true; chicken.position.set(...at); chicken.rotation.y = 0.6; chicken.getObjectByName('snow').visible = true;
      K.grade.flash.value = Math.max(0, 0.12 * Math.sin(t * 5)); K.move({ p: add(at, [1.0, 0.8, 1.6]), l: add(at, [0, 0.25, 0]), fov: 34 }, { p: add(at, [0.7, 0.6, 1.1]), l: add(at, [0, 0.25, 0]), fov: 30 }, u(14), 0.3, f); K.focusOn(add(at, [0, 0.25, 0])); break; }
    case 15: { // just not the one he expected: pull back — his hat lies in the snow next to it
      snowDay({ exposure: 1.0 }); snowfall(f, ROAD); const at = add(ROAD, [2, 0.02, 2]); chicken.visible = true; chicken.position.set(...at); chicken.getObjectByName('snow').visible = true; hatSnow.visible = true; hatSnow.position.set(...add(at, [-0.9, 0.02, 0.3])); hatSnow.rotation.set(0, 0, 1.4);
      K.move({ p: add(at, [0.4, 1.2, 2.2]), l: add(at, [-0.4, 0.2, 0]), fov: 36 }, { p: add(at, [0.6, 2.6, 4.6]), l: add(at, [-0.4, 0.3, 0]), fov: 38 }, u(15), 0.3, f); K.focusOn(add(at, [-0.4, 0.2, 0])); K.grade.sat.value = 0.85; break; }
    default: { // nobody plans their end: the snowy street, wide -> loops to the hook
      snowDay(); snowfall(f, ROAD); K.move({ p: add(ROAD, [0, 6, 14]), l: add(ROAD, [0, 1.6, -6]), fov: 40 }, { p: add(ROAD, [2.5, 2.4, 6]), l: add(ROAD, [1.2, 1.2, 1.6]), fov: 38 }, u(16), 0.4, f); K.focusOn(add(ROAD, [1.2, 1.2, 1.6]));
    }
  }
  if (ph !== 4 && FB.root.parent !== K.scene) { K.scene.add(FB.root); FB.root.scale.setScalar(1); }
}
