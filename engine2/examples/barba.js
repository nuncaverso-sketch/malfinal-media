// VID-010 v2 — Hans Steininger, mayor of Braunau (1567): 1.4 m beard; during a fire he stepped on it, fell and broke his neck (town legend).
export let FRAMES = 1580;
let K, T, H, folk = [], beard, beardTip, pouch, flames = [], smoke = [], fireLight, caseBeard, hat, scissors;
const TOWN = [0, 0, 0], MUS = [400, 0, 0];
const add = (a, b) => a.map((x, i) => x + b[i]);

export async function build(k) {
  K = k; await K.preloadEnvs(); T = await K.timing(); FRAMES = Math.ceil(T.duration * 30) + 6;
  const C = K.makeChar;
  H = C(K.scene, { shirt: 0x6a1f2a, buttons: 0xf3c537, belt: 0x3a2414, hat: 'bowler', hatColor: 0x1a1a1a, beard: '#6a4424', mustache: true, cape: 0x2a1a3a, seed: 1 });
  // 3D beard hanging from the chin to the floor (pivot at the chin)
  beard = new K.THREE.Group(); beard.position.set(0, 0.62, 0.2); H.torso.add(beard);
  const bg = new K.THREE.CylinderGeometry(0.17, 0.05, 1.5, 14, 6); bg.translate(0, -0.75, 0);
  const hairT = K.tex(128, 256, (g, w, h) => { g.fillStyle = '#6a4424'; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.strokeStyle = i % 2 ? 'rgba(40,20,8,0.5)' : 'rgba(150,100,60,0.45)'; g.lineWidth = 2 + (i % 3); const x = (i * 37) % w; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 10, h * 0.3, x - 10, h * 0.6, x + 4, h); g.stroke(); } }, [3, 1]);
  const bm = new K.THREE.Mesh(bg, K.std(0xffffff, { roughness: 0.85, map: hairT })); bm.castShadow = true; beard.add(bm);
  const hull = new K.THREE.Mesh(bg, new K.THREE.MeshBasicMaterial({ color: 0x16121a, side: K.THREE.BackSide })); hull.scale.set(1.12, 1.01, 1.12); beard.add(hull);
  pouch = K.sph(0.16, 0x8a5a2a, [0, -0.38, 0.05], { roughness: 0.7, parent: beard }); pouch.scale.set(1, 1.25, 0.9); pouch.visible = false;
  for (let i = 0; i < 10; i++) folk.push(C(K.scene, { shirt: [0x3a5a8a, 0x8a6a2a, 0x4a7a3a, 0x7a3a5a, 0x5a4a3a][i % 5], apron: undefined, hat: ['cap', 'hair', 'hair', 'bowler', 'hair'][i % 5], hatColor: 0x5a3a20, hair: [0x5a3418, 0x2a1a10, 0xc89a40][i % 3], seed: 10 + i }));
  // ---------- TOWN (Braunau 1567) ----------
  K.ground(0x6a9a4a);
  const cob = K.tex(256, 256, (g, w, h) => { g.fillStyle = '#8a7a6a'; g.fillRect(0, 0, w, h); for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = `hsl(30,${10 + (x * y) % 10}%,${50 + ((x * 7 + y * 3) % 12)}%)`; g.beginPath(); g.ellipse(x * 32 + 16 + (y % 2) * 8, y * 32 + 16, 14, 12, 0, 0, 7); g.fill(); } }, [10, 10]);
  K.plane(40, 40, K.std(0xffffff, { map: cob, roughness: 0.95 }), add(TOWN, [0, 0.01, -6]));
  const ring = [['House_1', -12, 2, 1.57], ['House_2', -12, -8, 1.57], ['Inn', -11, -18, 1.2], ['House_3', 12, 1, -1.57], ['House_4', 12, -9, -1.57], ['Blacksmith', 11, -19, -1.2], ['House_2', -4, -24, 0], ['Bell_Tower', 4, -24, 0]];
  for (const [n, x, z, r] of ring) await K.place(`medieval_village_pack/${n}`, add(TOWN, [x, 0, z]), r, n === 'Bell_Tower' ? 3.2 : 2.7);
  await K.placeH('medieval_village_pack/Well', add(TOWN, [0, 0, -8]), 0, 2.4);
  await K.placeH('medieval_village_pack/MarketStand_1', add(TOWN, [-6, 0, -2]), 1.2, 2.6); await K.placeH('medieval_village_pack/MarketStand_2', add(TOWN, [6, 0, -3]), -1.2, 2.6);
  for (let i = 0; i < 4; i++) await K.placeH('medieval_village_pack/Barrel', add(TOWN, [-7.5 + (i % 2) * 0.8, 0, 1 + i * 0.6]), i, 0.85);
  await K.placeH('medieval_village_pack/Cart', add(TOWN, [7, 0, 3]), -0.5, 1.6);
  for (let i = 0; i < 8; i++) await K.placeH(`nature_pack/CommonTree_${(i % 5) + 1}`, add(TOWN, [(i % 2 ? 1 : -1) * (20 + (i % 3) * 4), 0, 4 - i * 6]), i, 7);
  for (let i = 0; i < 6; i++) K.cloud(add(TOWN, [-70 + i * 28, 50 + (i % 3) * 8, -170]), 7);
  // fire on house_3 (right side)
  for (let i = 0; i < 14; i++) { const fl = K.sph(0.6, 0xff7a1a, add(TOWN, [11, 5, 1]), { emissive: 0xff5a0a, emissiveIntensity: 6, roughness: 1 }); fl.visible = false; flames.push(fl); }
  for (let i = 0; i < 16; i++) { const s = K.sph(0.8, 0x3a3434, [0, -99, 0], { roughness: 1, transparent: true, opacity: 0.6 }); smoke.push(s); }
  fireLight = K.pointLight(0xff7a2a, 0, add(TOWN, [9, 4, 1]), 30);
  hat = new K.THREE.Group(); K.cyl(0.38, 0.38, 0.03, 0x1a1a1a, [0, 0, 0], { parent: hat }); K.sph(0.26, 0x1a1a1a, [0, 0, 0], { parent: hat }); hat.visible = false; K.scene.add(hat);
  scissors = new K.THREE.Group(); for (const s of [-1, 1]) { const b = K.box(0.04, 0.5, 0.02, 0xc8c8d0, [s * 0.05, 0.2, 0], { parent: scissors, metalness: 0.8 }); b.rotation.z = s * 0.25; const r = new K.THREE.Mesh(new K.THREE.TorusGeometry(0.07, 0.02, 8, 16), K.std(0x2a2a2a)); r.position.set(s * 0.09, -0.1, 0); scissors.add(r); }
  // ---------- MUSEUM ----------
  K.plane(16, 12, K.std(0xc8b49a, { roughness: 0.6 }), add(MUS, [0, 0.01, 0]));
  const wm = K.std(0xf0ece4, { roughness: 0.9 }); K.plane(16, 6, wm, add(MUS, [0, 3, -6]), [0, 0, 0]); K.plane(12, 6, wm, add(MUS, [-8, 3, 0]), [0, Math.PI / 2, 0]); K.plane(12, 6, wm, add(MUS, [8, 3, 0]), [0, -Math.PI / 2, 0]);
  K.box(1.6, 1.0, 1.0, 0x3a2a20, add(MUS, [0, 0.5, -3]), { roughness: 0.5 });
  const glass = K.box(1.5, 2.2, 0.9, 0xdff2ff, add(MUS, [0, 2.1, -3]), { transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.2 }); glass.castShadow = false;
  caseBeard = new K.THREE.Mesh(bg, K.std(0xffffff, { roughness: 0.85, map: hairT })); caseBeard.position.set(...add(MUS, [0, 2.95, -3])); caseBeard.scale.set(1, 1.2, 1); K.scene.add(caseBeard);
  const plq = K.tex(512, 128, (g, w, h) => { g.fillStyle = '#c9a24a'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a1a0a'; g.font = 'bold 54px Poppins'; g.textAlign = 'center'; g.fillText('HANS STEININGER · 1567', w / 2, 84); });
  K.box(1.2, 0.3, 0.04, 0xffffff, add(MUS, [0, 0.75, -2.48]), { map: plq });
  for (const x of [-4.5, 4.5]) { const fr = K.tex(256, 320, (g, w, h) => { g.fillStyle = '#5a4a3a'; g.fillRect(0, 0, w, h); g.fillStyle = x < 0 ? '#7a9ab8' : '#b8946a'; g.fillRect(24, 24, w - 48, h - 48); }); K.box(1.4, 1.8, 0.06, 0xffffff, add(MUS, [x, 2.6, -5.9]), { map: fr }); }
  K.pointLight(0xfff4e0, 5, add(MUS, [0, 4.5, -1]), 14);
}

const P = (c, p, f) => K.poseChar(c, p, f);
function setBeard(len = 1, pouchOn = false, swing = 0, flat = 0) { beard.scale.set(1, len, 1); pouch.visible = pouchOn; pouch.scale.set(1, 1.25 / Math.max(0.2, len), 0.9); beard.rotation.set(-swing - flat * 1.2, 0, 0); }
function hideAll() { for (const c of [H, ...folk]) c.root.visible = false; for (const fl of flames) fl.visible = false; for (const s of smoke) s.position.y = -99; fireLight.intensity = 0; hat.visible = false; if (scissors.parent) scissors.parent.remove(scissors); }
function townsfolk(f, expr = 'happy', bow = 0) { folk.slice(0, 6).forEach((c, i) => { const a = -0.9 + i * 0.36; const p = add(TOWN, [Math.sin(a) * 4.2, 0, -1 + Math.cos(a) * 4.2]); P(c, { pos: p, yaw: Math.PI + a, expr, lean: bow * (0.5 + 0.3 * Math.sin(f * 0.1 + i)), arms: bow ? 'down' : 'wave' }, f); }); }
function fire(f, k = 1) { flames.forEach((fl, i) => { fl.visible = true; const a = i * 2.4; const h = (f * 0.05 + i * 0.37) % 1; fl.position.set(...add(TOWN, [10.5 + Math.cos(a) * 1.6, 4.5 + h * 3.5, 1 + Math.sin(a) * 1.6])); fl.scale.setScalar((1 - h) * 1.3 * k + 0.2); });
  smoke.forEach((s, i) => { const h = (f * 0.012 + i / smoke.length) % 1; s.position.set(...add(TOWN, [10 - h * 6 + Math.sin(i) * 1.5, 8 + h * 14, 1 + Math.cos(i * 2) * 2])); s.scale.setScalar(1 + h * 3); s.material.opacity = 0.65 * (1 - h); });
  fireLight.intensity = 60 * k * (0.8 + 0.2 * Math.sin(f * 0.9)); }

export function frame(f, k) {
  hideAll(); const ph = K.at(f), t = f / 30, u = (i, j) => K.u(f, i, j); setBeard(1);
  switch (ph) {
    case 0: { // HOOK: the longest beard in town... and it killed him. He strolls; on the last beat he steps on it and wobbles
      K.preset('day'); const v = u(0); const w = v < 0.82; const pos = add(TOWN, [0, 0, 4 - v * 3]);
      P(H, { pos, yaw: Math.PI, walk: w ? t * 1.0 : 0, expr: w ? 'proud' : 'shock', arms: w ? 'akimbo' : 'flail', lean: w ? 0 : 0.35, tremble: w ? 0 : 2 }, f); setBeard(1, false, w ? Math.sin(t * 6) * 0.08 : 0, w ? 0 : 0.6);
      K.move(K.frame([pos], { yaw: Math.PI - 0.35, pitch: 0.04, h: 2.6 }), K.frame([pos], { yaw: Math.PI - 0.2, pitch: 0.0, h: 2.6, push: 0.85 }), v, 0.8, f); K.focusOn(add(pos, [0, 1.5, 0])); break; }
    case 1: { // Braunau, Austria, 1567: crane down over the square
      K.preset('day'); townsfolk(f, 'neutral'); P(H, { pos: add(TOWN, [0, 0, -1]), yaw: 0, expr: 'proud', arms: 'akimbo' }, f);
      K.move({ p: add(TOWN, [0, 22, 26]), l: add(TOWN, [0, 2, -12]), fov: 40 }, { p: add(TOWN, [0, 6, 16]), l: add(TOWN, [0, 2.4, -6]), fov: 40 }, u(1), 0.4, f); K.focusOn(add(TOWN, [0, 2, -4])); K.lens.aperture.value = 0.2; break; }
    case 2: { // the mayor, very respected: folk bow, he waves
      K.preset('day'); townsfolk(f, 'happy', 1); P(H, { pos: add(TOWN, [0, 0, -1]), yaw: 0, expr: 'happy', arms: 'wave', talk: 0.4 }, f);
      K.move(K.frame([add(TOWN, [0, 0, -1]), add(TOWN, [-2.9, 0, 2]), add(TOWN, [2.9, 0, 2])], { yaw: 0, pitch: 0.18, h: 2.6 }), K.frame([add(TOWN, [0, 0, -1])], { yaw: 0.1, pitch: 0.1, h: 2.6, pad: 1.6 }), u(2), 0.4, f); K.focusOn(add(TOWN, [0, 1.8, -1])); break; }
    case 3: { // but everyone knew him for something else: close on the face, folk whispering
      K.preset('day'); townsfolk(f, 'smug'); P(H, { pos: add(TOWN, [0, 0, -1]), yaw: 0, expr: 'smug', arms: 'down', look: [0.3, 0] }, f);
      K.move(K.frame([add(TOWN, [0, 0, -1])], { yaw: 0.15, pitch: 0.0, h: 2.4, lookY: 1.8, push: 0.5 }), K.frame([add(TOWN, [0, 0, -1])], { yaw: 0.1, pitch: 0.0, h: 2.4, lookY: 1.75, push: 0.45 }), u(3), 0.3, f); K.focusOn(add(TOWN, [0, 1.8, -1])); break; }
    case 4: { // 1.5 m beard, down to the floor: tilt down along the beard
      K.preset('day'); P(H, { pos: add(TOWN, [0, 0, -1]), yaw: 0, expr: 'proud', arms: 'akimbo' }, f); setBeard(1);
      const v = K.ease(u(4)); K.move({ p: add(TOWN, [0.6, 1.8 - v * 1.3, 1.8]), l: add(TOWN, [0, 1.7 - v * 1.5, -0.8]), fov: 34 }, {}, 0, 0.3, f); K.focusOn(add(TOWN, [0, 1.0, -0.8])); break; }
    case 5: { // so he rolled it up in a little leather pouch
      K.preset('day'); P(H, { pos: add(TOWN, [0, 0, -1]), yaw: 0, expr: 'happy', arms: 'hold2' }, f); const v = K.ease(u(5)); setBeard(1 - v * 0.72, v > 0.4);
      K.move(K.frame([add(TOWN, [0, 0, -1])], { yaw: -0.3, pitch: 0.05, h: 2.4, lookY: 1.2, push: 0.75 }), K.frame([add(TOWN, [0, 0, -1])], { yaw: -0.2, pitch: 0.05, h: 2.4, lookY: 1.3, push: 0.62 }), u(5), 0.3, f); K.focusOn(add(TOWN, [0, 1.3, -1])); break; }
    case 6: { // one day a fire broke out: night, the house burns, people run
      K.preset('night', { exposure: 1.3 }); fire(f); folk.slice(0, 5).forEach((c, i) => P(c, { pos: add(TOWN, [-4 + i * 2 + Math.sin(t * 3 + i) * 0.3, 0, 2 - ((t * 2 + i) % 6)]), yaw: Math.PI, run: 1, walk: t * 2.2 + i * 0.3, expr: 'scared', arms: 'flail' }, f));
      K.move({ p: add(TOWN, [-6, 3, 12]), l: add(TOWN, [8, 4, -2]), fov: 40 }, { p: add(TOWN, [-4, 2.4, 9]), l: add(TOWN, [8, 4.5, -1]), fov: 38 }, u(6), 0.8, f); K.focusOn(add(TOWN, [8, 4, 0])); break; }
    case 7: { // Hans ran out so fast he didn't roll the beard: running, beard flapping
      K.preset('night', { exposure: 1.3 }); fire(f); const pos = add(TOWN, [-2 + u(7) * 3, 0, 3 - u(7) * 2]);
      P(H, { pos, yaw: 2.0, run: 1, walk: t * 2.2, expr: 'scared', arms: 'flail' }, f); setBeard(1, false, 0.5 + Math.sin(t * 13) * 0.25);
      K.move(K.frame([pos], { yaw: 0.6, pitch: 0.05, h: 2.6, pad: 1.4 }), K.frame([pos], { yaw: 0.9, pitch: 0.05, h: 2.6, pad: 1.4 }), u(7), 1.6, f); K.focusOn(add(pos, [0, 1.5, 0])); break; }
    case 8: { // he stepped on it: low close on the foot pinning the beard
      K.preset('night', { exposure: 1.7, hemiI: 1.0 }); fire(f, 0.7); const pos = add(TOWN, [1, 0, 1]); P(H, { pos, yaw: 2.0, expr: 'shock', arms: 'flail', lean: 0.4 }, f); H.legR.a.rotation.x = -0.7; setBeard(1, false, 0, 0.75);
      K.grade.flash.value = Math.max(0, 0.5 - (f - K.ph[8].a) / 10);
      K.move(K.frame([pos], { yaw: 2.0 + 1.45, pitch: 0.06, h: 2.6, lookY: 1.0, push: 1.15 }), K.frame([pos], { yaw: 2.0 + 1.4, pitch: 0.04, h: 2.6, lookY: 0.95, push: 1.05 }), u(8), 1.5, f); K.focusOn(add(pos, [0, 0.8, 0])); break; }
    case 9: { // tripped, fell... broke his neck — he topples out of frame; cut to the hat rolling (no gore)
      K.preset('night', { exposure: 1.6, hemiI: 0.9 }); fire(f, 0.7); const v = u(9); const pos = add(TOWN, [1, 0, 1]);
      if (v < 0.45) { P(H, { pos, yaw: 2.0, expr: 'scared', arms: 'flail', fall: K.ease(v / 0.45) * 0.95, eyes: [0, -1] }, f); setBeard(1, false, 0, 0.75); K.move({ p: add(pos, [3.2, 1.5, 3.2]), l: add(pos, [0, 1.2, 0]), fov: 38 }, {}, 0, 2.5, f); K.focusOn(add(pos, [0, 1.2, 0])); }
      else { hat.visible = true; const w = (v - 0.45) / 0.55; hat.position.set(...add(pos, [1.0 + w * 2.2, 0.26, 1.6 + w * 0.8])); hat.rotation.set(Math.PI / 2, 0, w * 8); K.move({ p: add(pos, [2.4, 0.6, 4.6]), l: add(pos, [2.2, 0.3, 2.0]), fov: 34 }, {}, 0, 0.5, f); K.focusOn(add(pos, [2.4, 0.3, 2.2])); K.grade.sat.value = 0.8; }
      break; }
    case 10: { // at least that's what the town story says: daytime, folk telling it at the well
      K.preset('golden'); folk.slice(0, 4).forEach((c, i) => { const a = i * 1.57; P(c, { pos: add(TOWN, [Math.cos(a) * 1.9, 0, -8 + Math.sin(a) * 1.9 + 2.2]), yaw: -a - Math.PI / 2, expr: i === 0 ? 'smug' : 'shock', talk: i === 0 ? 1 : 0, arms: i === 0 ? 'shrug' : 'down' }, f); });
      K.move(K.frame([add(TOWN, [0, 0, -5.8])], { yaw: 0.2, pitch: 0.25, h: 2.6, pad: 2.2 }), K.frame([add(TOWN, [0, 0, -5.8])], { yaw: -0.1, pitch: 0.2, h: 2.6, pad: 2.0 }), u(10), 0.4, f); K.focusOn(add(TOWN, [0, 1.6, -5.8])); break; }
    case 11: { // and the beard? the beard lying alone on the cobbles
      K.preset('golden'); const pz = add(TOWN, [1.2, 0.12, 1.6]); hat.visible = true; hat.position.set(...add(pz, [-0.9, 0.14, -0.4])); hat.rotation.set(Math.PI / 2, 0, 0.4); caseBeard.position.set(...pz); caseBeard.rotation.set(0, 0.3, Math.PI / 2); caseBeard.scale.set(1, 1, 1);
      K.move({ p: add(pz, [1.0, 1.9, 3.0]), l: add(pz, [0.8, 0.1, 0]), fov: 36 }, { p: add(pz, [0.9, 1.6, 2.5]), l: add(pz, [0.8, 0.1, 0]), fov: 34 }, u(11), 0.4, f); K.focusOn(add(pz, [0.8, 0.1, 0])); break; }
    case 12: { // they cut it off and kept it as a memento: a townsman holds the folded beard, another the scissors
      K.preset('golden'); const c1 = folk[0], c2 = folk[3]; P(c1, { pos: add(TOWN, [-0.7, 0, -1]), yaw: 0.3, expr: 'proud', arms: 'hold2' }, f); P(c2, { pos: add(TOWN, [0.9, 0, -1.1]), yaw: -0.4, expr: 'happy', arms: 'hold' }, f); c2.hold(scissors, [0, -0.08, 0.1], [0.4, 0, 0]);
      c1.torso.add(caseBeard); caseBeard.position.set(0, 0.55, 0.42); caseBeard.rotation.set(1.3, 0, 0); caseBeard.scale.set(1, 0.6, 1);
      K.move(K.frame([add(TOWN, [-0.7, 0, -1]), add(TOWN, [0.9, 0, -1.1])], { yaw: 0.05, pitch: 0.05 }), K.frame([add(TOWN, [-0.7, 0, -1]), add(TOWN, [0.9, 0, -1.1])], { yaw: -0.05, pitch: 0.05, push: 0.88 }), u(12), 0.4, f); K.focusOn(add(TOWN, [0, 1.6, -1])); break; }
    case 13: { // today you can still see it in a museum in Austria
      K.preset('interior', { exposure: 1.15 }); K.scene.add(caseBeard); caseBeard.position.set(...add(MUS, [0, 2.95, -3])); caseBeard.rotation.set(0, 0, 0); caseBeard.scale.set(1, 1.2, 1);
      folk.slice(5, 8).forEach((c, i) => P(c, { pos: add(MUS, [[-1.9, 1.9, 2.8][i], 0, [-1.6, -1.4, 0.2][i]]), yaw: Math.PI + (i - 1) * 0.2, expr: ['shock', 'happy', 'neutral'][i], arms: ['point', 'down', 'think'][i] }, f));
      K.move({ p: add(MUS, [0, 3.4, 7]), l: add(MUS, [0, 1.9, -3]), fov: 40 }, { p: add(MUS, [0.4, 3.0, 5.4]), l: add(MUS, [0, 2.0, -3]), fov: 38 }, u(13), 0.3, f); K.focusOn(add(MUS, [0, 2, -3])); break; }
    case 14: { // the man left, the beard stayed: slow push to the glass case
      K.preset('interior', { exposure: 1.15 }); K.scene.add(caseBeard); caseBeard.position.set(...add(MUS, [0, 2.95, -3])); caseBeard.rotation.set(0, 0, 0); caseBeard.scale.set(1, 1.2, 1);
      K.move({ p: add(MUS, [0.3, 2.3, 1.8]), l: add(MUS, [0, 2.1, -3]), fov: 36 }, { p: add(MUS, [0.1, 2.2, 0.6]), l: add(MUS, [0, 2.1, -3]), fov: 34 }, u(14), 0.2, f); K.focusOn(add(MUS, [0, 2.1, -3])); break; }
    default: { // nobody plans their end: the empty square at sunset -> loops to the stroll
      K.preset('golden'); K.move({ p: add(TOWN, [0, 2.6, 9]), l: add(TOWN, [0, 1.6, -4]), fov: 40 }, { p: add(TOWN, [0.4, 1.6, 6]), l: add(TOWN, [0, 1.4, 0]), fov: 38 }, u(15), 0.4, f); K.focusOn(add(TOWN, [0, 1.4, 0]));
    }
  }
  if (ph === 11 && caseBeard.parent !== K.scene) K.scene.add(caseBeard);
  if (ph !== 12 && ph !== 11 && (caseBeard.parent !== K.scene || true)) { K.scene.add(caseBeard); caseBeard.position.set(...add(MUS, [0, 2.95, -3])); caseBeard.rotation.set(0, 0, 0); caseBeard.scale.set(1, 1.2, 1); }
}
