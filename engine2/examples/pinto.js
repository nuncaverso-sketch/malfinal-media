// VID-009 v2 — AVE Mizar (1973): a Ford Pinto bolted to the back half of a Cessna. A wing strut failed; Smolinski and Blake died.
export let FRAMES = 2030;
let K, T, H, B, I1, I2, car, wings, prop, strutR, strutL, wingR, wingL, tail, beans = [], dust = [], clouds = [], strutLoose, weld;
const GAR = [0, 0, 0], AIR = [200, 0, 0], FIELD = [400, 0, 0], SKY = [600, 60, 0], LAB = [800, 0, 0];
const add = (a, b) => a.map((x, i) => x + b[i]);

function buildCar(K) {
  const g = new K.THREE.Group(); const col = 0xe0661a;
  K.box(3.8, 0.62, 1.7, col, [0, 0.72, 0], { parent: g, roughness: 0.3, metalness: 0.25 });
  K.box(2.1, 0.62, 1.6, col, [-0.35, 1.32, 0], { parent: g, roughness: 0.3, metalness: 0.25 });
  K.box(2.0, 0.5, 1.62, 0x9ad0ff, [-0.35, 1.34, 0], { parent: g, roughness: 0.08, metalness: 0.4, transparent: true, opacity: 0.35 });
  K.box(3.85, 0.12, 1.72, 0xd8d8d8, [0, 0.5, 0], { parent: g, metalness: 0.7, roughness: 0.25 });
  for (const x of [-1.2, 1.2]) for (const z of [-0.82, 0.82]) { const w = K.cyl(0.36, 0.36, 0.26, 0x151515, [x, 0.36, z], { parent: g }); w.rotation.x = Math.PI / 2; K.cyl(0.15, 0.15, 0.28, 0xcfcfcf, [x, 0.36, z], { parent: g, metalness: 0.8 }).rotation.x = Math.PI / 2; }
  for (const z of [-0.52, 0.52]) K.sph(0.12, 0xfff2b0, [1.9, 0.82, z], { parent: g, emissive: 0xffe08a, emissiveIntensity: 1.2 });
  // airplane rear half
  const W = new K.THREE.Group(); g.add(W);
  wingR = K.box(0.9, 0.08, 5.0, 0xf2f2f2, [-0.3, 1.78, 2.9], { parent: W, roughness: 0.35 }); wingL = K.box(0.9, 0.08, 5.0, 0xf2f2f2, [-0.3, 1.78, -2.9], { parent: W, roughness: 0.35 });
  for (const w of [wingR, wingL]) K.box(0.92, 0.09, 0.5, 0xc82020, [0, 0, (w === wingR ? 2.3 : -2.3)], { parent: w });
  K.box(1.0, 0.1, 1.6, 0xf2f2f2, [-0.3, 1.78, 0], { parent: W });
  strutR = K.cyl(0.035, 0.035, 2.6, 0xd8d8d8, [-0.3, 1.25, 1.85], { parent: W, metalness: 0.6 }); strutR.rotation.x = -1.05;
  strutL = K.cyl(0.035, 0.035, 2.6, 0xd8d8d8, [-0.3, 1.25, -1.85], { parent: W, metalness: 0.6 }); strutL.rotation.x = 1.05;
  tail = new K.THREE.Group(); W.add(tail);
  K.box(3.0, 0.3, 0.3, 0xf2f2f2, [-3.2, 1.25, 0], { parent: tail }); K.box(0.8, 1.1, 0.08, 0xf2f2f2, [-4.5, 1.8, 0], { parent: tail }); K.box(0.8, 0.07, 2.2, 0xf2f2f2, [-4.5, 1.3, 0], { parent: tail }); K.box(0.5, 0.35, 0.09, 0xc82020, [-4.6, 2.15, 0], { parent: tail });
  K.cyl(0.25, 0.32, 0.7, 0x606870, [-1.95, 1.25, 0], { parent: tail, metalness: 0.6 }).rotation.z = Math.PI / 2;
  prop = new K.THREE.Group(); prop.position.set(-2.35, 1.25, 0); W.add(prop); K.box(0.06, 1.7, 0.16, 0x2a2a2a, [0, 0, 0], { parent: prop }); K.sph(0.11, 0xc82020, [0, 0, 0], { parent: prop });
  K.scene.add(g); return { g, W };
}
function propSpin(f, on = 1) { prop.rotation.x = on ? f * 1.3 : 0.4; }
function puffs(K, n, col) { const a = []; for (let i = 0; i < n; i++) a.push(K.sph(0.3, col, [0, -99, 0], { roughness: 1, transparent: true, opacity: 0.8 })); return a; }
function burst(f, arr, c, t0, sp = 2.5, life = 50) { arr.forEach((p, i) => { const age = (f - t0) / life; if (age < 0) { p.position.y = -99; return; } const a = i * 2.39; p.position.set(c[0] + Math.cos(a) * age * sp, c[1] + age * sp * 0.6 * (0.5 + (i % 3) * 0.3), c[2] + Math.sin(a) * age * sp); p.scale.setScalar(0.4 + age * 3); p.material.opacity = Math.max(0, 0.8 - age * 0.8); }); }

export async function build(k) {
  K = k; await K.preloadEnvs(); T = await K.timing(); FRAMES = Math.ceil(T.duration * 30) + 6;
  const C = K.makeChar;
  H = C(K.scene, { shirt: 0x3a6ab8, pants: 0x3a3a4a, hat: 'cap', hatColor: 0xd8a020, mustache: true, seed: 1 });
  B = C(K.scene, { shirt: 0x7a5a3a, pants: 0x2a2a3a, hair: 0x2a1a10, glasses: true, seed: 2 });
  I1 = C(K.scene, { shirt: 0x3a4a5a, tie: 0x1a1a1a, hat: 'bowler', hatColor: 0x2a2a2a, glasses: true, seed: 3 });
  I2 = C(K.scene, { shirt: 0x5a5a6a, tie: 0x8a1f2e, hair: 0x6a6a6a, seed: 4, mustache: true });
  const c = buildCar(K); car = c.g; wings = c.W;
  // ---------- GARAGE ----------
  const conc = K.tex(256, 256, (g, w, h) => { g.fillStyle = '#9a9690'; g.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); } g.strokeStyle = 'rgba(0,0,0,0.15)'; g.strokeRect(0, 0, w, h); }, [6, 6]);
  K.plane(16, 14, K.std(0xffffff, { map: conc, roughness: 0.9 }), add(GAR, [0, 0.01, 0]));
  const wm = K.std(0xb8c4c8, { roughness: 0.9 }); K.plane(16, 6, wm, add(GAR, [0, 3, -7]), [0, 0, 0]); K.plane(14, 6, wm, add(GAR, [-8, 3, 0]), [0, Math.PI / 2, 0]); K.plane(14, 6, wm, add(GAR, [8, 3, 0]), [0, -Math.PI / 2, 0]); K.plane(16, 14, K.std(0x8a8a8a), add(GAR, [0, 6, 0]), [Math.PI / 2, 0, 0]);
  await K.placeH('house_interior_pack/Shelf_Large', add(GAR, [-5, 0, -6.6]), 0, 2.6); await K.placeH('house_interior_pack/Shelf_Large', add(GAR, [5, 0, -6.6]), 0, 2.6);
  for (let i = 0; i < 5; i++) await K.placeH(['survival_pack/GasCan', 'survival_pack/PropaneTank', 'survival_pack/Axe', 'survival_pack/Shovel', 'survival_pack/Radio'][i], add(GAR, [-6.6 + i * 0.6, 0, -5.4 + (i % 2) * 0.3]), i, [0.6, 0.9, 0.8, 1.2, 0.4][i]);
  const bp = K.tex(512, 320, (g, w, h) => { g.fillStyle = '#1f4f9f'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8f0ff'; g.lineWidth = 4; g.strokeRect(14, 14, w - 28, h - 28); g.beginPath(); g.moveTo(80, 220); g.lineTo(300, 220); g.lineTo(330, 180); g.lineTo(420, 180); g.lineTo(440, 220); g.lineTo(80, 220); g.moveTo(140, 160); g.lineTo(430, 160); g.moveTo(60, 190); g.lineTo(60, 120); g.stroke(); g.fillStyle = '#e8f0ff'; g.font = 'bold 34px Poppins'; g.fillText('MIZAR', 200, 80); });
  K.box(3.0, 1.9, 0.06, 0xffffff, add(GAR, [0, 2.6, -6.9]), { map: bp, roughness: 0.8 });
  K.pointLight(0xfff0d8, 7, add(GAR, [0, 5, 1]), 18);
  for (let i = 0; i < 3; i++) await K.placeH(`nature_pack/PalmTree_${i + 1}`, add(GAR, [-12 + i * 12, 0, -14]), i, 9);
  // ---------- AIRFIELD ----------
  K.plane(500, 500, K.std(0x7aa84a, { roughness: 1 }), add(AIR, [0, -0.02, 0]));
  K.plane(12, 300, K.std(0x4a4a4e, { roughness: 0.9 }), add(AIR, [0, 0.0, -80]), [-Math.PI / 2, 0, 0]);
  for (let i = 0; i < 20; i++) K.plane(0.5, 5, K.std(0xf4f4f0), add(AIR, [0, 0.02, 10 - i * 14]));
  K.box(14, 8, 12, 0x9aa8b8, add(AIR, [-18, 4, -10]), { roughness: 0.6 }); K.box(8, 6, 0.2, 0x3a3a40, add(AIR, [-18, 3, -3.95]));
  for (let i = 0; i < 6; i++) await K.placeH(`nature_pack/PalmTree_${(i % 4) + 1}`, add(AIR, [18 + (i % 2) * 6, 0, -i * 16]), i, 9);
  for (let i = 0; i < 8; i++) clouds.push(K.cloud(add(AIR, [-80 + i * 25, 40 + (i % 3) * 10, -160]), 6 + (i % 3) * 2));
  // ---------- BEAN FIELD ----------
  K.plane(400, 400, K.std(0x8a6a3a, { roughness: 1 }), add(FIELD, [0, -0.01, 0]));
  for (let r = 0; r < 14; r++) for (let j = 0; j < 22; j++) { const b = K.sph(0.35, 0x4a9a3a, add(FIELD, [-14 + r * 2, 0.15, 10 - j * 1.6]), { roughness: 0.9 }); b.scale.set(1, 0.6, 1.2); beans.push(b); }
  // ---------- SKY ----------
  for (let i = 0; i < 14; i++) clouds.push(K.cloud(add(SKY, [-60 + (i % 7) * 20, -20 + (i % 3) * 14, -40 - Math.floor(i / 7) * 60]), 5 + (i % 3) * 2));
  // ---------- INVESTIGATION ----------
  K.plane(12, 10, K.std(0x8a8a86), add(LAB, [0, 0.01, 0])); K.plane(12, 5, K.std(0x6a7a8a), add(LAB, [0, 2.5, -5]), [0, 0, 0]);
  K.box(3.4, 0.1, 1.4, 0x6a4a32, add(LAB, [0, 1.0, -2])); for (const x of [-1.5, 1.5]) for (const z of [-0.6, 0.6]) K.box(0.1, 1.0, 0.1, 0x3a2418, add(LAB, [x, 0.5, -2 + z]));
  strutLoose = K.cyl(0.04, 0.04, 2.4, 0xd8d8d8, add(LAB, [0, 1.1, -2]), { metalness: 0.6 }); strutLoose.rotation.z = Math.PI / 2 - 0.1;
  weld = K.sph(0.09, 0xff3a1a, add(LAB, [0.6, 1.14, -2]), { emissive: 0xff2a00, emissiveIntensity: 0 });
  K.pointLight(0xffffff, 5, add(LAB, [0, 3.5, 0]), 12);
  dust = puffs(K, 20, 0xb89a6a);
}

const P = (c, p, f) => K.poseChar(c, p, f);
const hideAll = () => { for (const c of [H, B, I1, I2]) c.root.visible = false; wings.visible = true; wings.position.set(0, 0, 0); for (const d of dust) d.position.y = -99; wingR.rotation.set(0, 0, 0); wingR.position.set(-0.3, 1.78, 2.9); strutR.visible = true; strutR.rotation.set(-1.05, 0, 0); };
function fly(f, pos, o = {}) { car.position.set(...pos); car.rotation.set(o.roll || 0, o.yaw ?? 0, o.pitch || 0); propSpin(f, 1); }
function inCar(c, f, z, expr = 'happy') { c.root.visible = true; P(c, { pos: [0, 0, 0], sit: 1, expr, arms: 'down' }, f); car.add(c.root); c.root.position.set(-0.4, 0.35, z); c.root.rotation.y = Math.PI / 2; c.root.scale.setScalar(0.62); }
function outCar(c) { if (c.root.parent !== K.scene) K.scene.add(c.root); c.root.scale.setScalar(1); }

export function frame(f, k) {
  hideAll(); outCar(H); outCar(B); const ph = K.at(f), t = f / 30, u = (i, j) => K.u(f, i, j);
  switch (ph) {
    case 0: { // HOOK: a flying Ford Pinto, tracking shot
      K.preset('day'); const x = t * 14; fly(f, add(SKY, [x, Math.sin(t * 1.3) * 0.6, 0]), { roll: Math.sin(t * 1.1) * 0.08, pitch: 0.05 }); inCar(H, f, 0.35, 'laugh'); inCar(B, f, -0.35, 'happy');
      const cp = car.position.toArray(); K.move({ p: add(cp, [5, 1.2, 9]), l: add(cp, [-0.5, 1.2, 0]), fov: 40 }, { p: add(cp, [2, 0.6, 10.5]), l: add(cp, [-0.5, 1.2, 0]), fov: 38 }, u(0), 1.2, f); K.focusOn(cp); break; }
    case 1: { // California, a workshop near LA: palms, sunny garage
      K.preset('day', { exposure: 1.08 }); car.position.set(...add(GAR, [0, 0, -1.5])); car.rotation.set(0, 0.3, 0); wings.visible = false; propSpin(f, 0);
      P(H, { pos: add(GAR, [2.6, 0, 0.6]), yaw: -0.8, expr: 'happy', arms: 'akimbo' }, f);
      K.move({ p: add(GAR, [0, 3.5, 12]), l: add(GAR, [0, 1.6, -3]), fov: 42 }, K.frame([add(GAR, [0, 0, -1.5]), add(GAR, [2.6, 0, 0.6])], { yaw: 0.1, pitch: 0.12, h: 2.4 }), u(1), 0.5, f); K.focusOn(add(GAR, [1.2, 1.2, -0.5])); break; }
    case 2: { // Smolinski's dream: a car that could take off — blueprint + arms up
      K.preset('day', { exposure: 1.08 }); car.position.set(...add(GAR, [5.5, 0, 3])); car.rotation.set(0, 0.3, 0); wings.visible = false;
      P(H, { pos: add(GAR, [1.2, 0, -5.0]), yaw: 0.3, expr: 'laugh', arms: 'up', talk: 0.5, look: [0, 0.2] }, f);
      K.move(K.frame([add(GAR, [1.2, 0, -5.0]), add(GAR, [0, 0.4, -6.9])], { yaw: -0.25, pitch: 0.08, h: 3.2 }), K.frame([add(GAR, [1.2, 0, -5.0]), add(GAR, [0, 0.4, -6.9])], { yaw: -0.15, pitch: 0.06, h: 3.2, push: 0.88 }), u(2), 0.4, f); K.focusOn(add(GAR, [0.8, 2, -5.5])); break; }
    case 3: { // a Ford Pinto, a compact little car: orbit
      K.preset('day', { exposure: 1.08 }); car.position.set(...add(GAR, [0, 0, -1.5])); car.rotation.set(0, 0.3 + u(3) * 0.4, 0); wings.visible = false;
      K.move({ p: add(GAR, [6.0, 2.4, 5.0]), l: add(GAR, [0, 0.9, -1.5]), fov: 38 }, { p: add(GAR, [2.0, 2.0, 6.6]), l: add(GAR, [0, 0.9, -1.5]), fov: 36 }, u(3), 0.4, f); K.focusOn(add(GAR, [0, 0.9, -1.5])); break; }
    case 4: { // bolted on the back half of a plane: wings come down onto the roof, hammering
      K.preset('day', { exposure: 1.08 }); car.position.set(...add(GAR, [0, 0, -1.5])); car.rotation.set(0, 0.3, 0); const d = 1 - K.ease(Math.min(1, u(4) * 1.6)); wings.position.y = d * 2.5; propSpin(f, 0);
      P(H, { pos: add(GAR, [2.2, 0, 0.4]), yaw: -1.0, expr: 'angry', arms: 'hammer' }, f); P(B, { pos: add(GAR, [-2.4, 0, 0.6]), yaw: 1.0, expr: 'happy', arms: 'reach' }, f);
      K.move(K.frame([add(GAR, [0, 0, -1.5]), add(GAR, [2.2, 0, 0.4]), add(GAR, [-2.4, 0, 0.6])], { yaw: 0.2, pitch: 0.2, h: 3.2 }), K.frame([add(GAR, [0, 0, -1.5]), add(GAR, [2.2, 0, 0.4]), add(GAR, [-2.4, 0, 0.6])], { yaw: 0.05, pitch: 0.16, h: 3.2, push: 0.92 }), u(4), 0.5, f); K.focusOn(add(GAR, [0, 1.4, -1])); break; }
    case 5: { // the idea: drive -> take off -> land -> drop the wings -> drive away (4 beats)
      K.preset('day'); const v = u(5); const beat = Math.min(3, Math.floor(v * 4)), w = (v * 4) % 1; wings.position.y = 0;
      if (beat === 0) { car.position.set(...add(AIR, [0, 0, 20 - w * 30])); car.rotation.set(0, Math.PI / 2, 0); propSpin(f); K.move({ p: add(AIR, [6, 1.5, 12 - w * 20]), l: add(car.position.toArray(), [0, 1, 0]) }, {}, 0, 1, f); }
      else if (beat === 1) { car.position.set(...add(AIR, [0, w * w * 14, -10 - w * 40])); car.rotation.set(0, Math.PI / 2, -0.25 * w); propSpin(f); K.move({ p: add(AIR, [12, 2, -12]), l: add(car.position.toArray(), [0, 1, 0]), fov: 40 }, {}, 0, 0.6, f); }
      else if (beat === 2) { car.position.set(...add(AIR, [0, (1 - w) * 6, -60 + w * 10])); car.rotation.set(0, -Math.PI / 2, 0.08 * (1 - w)); propSpin(f); K.move({ p: add(AIR, [10, 2.2, -45]), l: add(car.position.toArray(), [0, 1, 0]), fov: 40 }, {}, 0, 0.6, f); }
      else { car.position.set(...add(AIR, [w * 6, 0, -50])); car.rotation.set(0, 0, 0); wings.position.set(-w * 2, 0, 0); wings.visible = w < 0.15 || true; wings.position.y = 0; if (w > 0.2) { wings.position.x = -(w - 0.2) * 8; } propSpin(f, 0); K.move({ p: add(AIR, [3, 2.5, -41]), l: add(AIR, [1, 1, -50]), fov: 40 }, {}, 0, 0.6, f); }
      K.focusOn(car.position.toArray()); break; }
    case 6: { // first test: a wing strut works loose in flight (wobble)
      K.preset('day'); fly(f, add(SKY, [t * 14, 0, 0]), { roll: Math.sin(t * 9) * 0.06 }); inCar(H, f, 0.35, 'worried'); wingR.rotation.x = Math.sin(t * 22) * 0.06 * K.ease(u(6)); strutR.rotation.x = -1.05 + Math.sin(t * 25) * 0.08;
      const cp = car.position.toArray(); K.move({ p: add(cp, [-3.0, 3.6, 10.5]), l: add(cp, [-0.3, 1.5, 2.2]), fov: 36 }, { p: add(cp, [-2.2, 3.2, 9.0]), l: add(cp, [-0.3, 1.5, 2.2]), fov: 34 }, u(6), 1.5, f); K.focusOn(add(cp, [-0.3, 1.5, 2.2])); break; }
    case 7: { // the pilot managed to land in a bean field
      K.preset('day'); const v = K.ease(u(7)); car.position.set(...add(FIELD, [-14 + v * 14, (1 - v) * 7, 0])); car.rotation.set(0, 0, 0.12 * (1 - v)); propSpin(f, v < 0.95);
      if (v > 0.9) burst(f, dust, add(FIELD, [0, 0.3, 0]), K.ph[7].a + 60, 2.2, 40);
      K.move({ p: add(FIELD, [4, 3, 12]), l: add(FIELD, [-4, 2, 0]), fov: 38 }, { p: add(FIELD, [3, 1.8, 9]), l: add(FIELD, [0, 1, 0]), fov: 36 }, u(7), 0.5, f); K.focusOn(car.position.toArray()); break; }
    case 8: { // anyone would have stopped there: the two look at each other, worried
      K.preset('day'); car.position.set(...add(FIELD, [0, 0, -2.5])); car.rotation.set(0, 0.2, 0); propSpin(f, 0);
      P(H, { pos: add(FIELD, [1.5, 0, 2.6]), yaw: -1.2, expr: 'worried', arms: 'shrug' }, f); P(B, { pos: add(FIELD, [-0.5, 0, 2.8]), yaw: 1.2, expr: 'worried', arms: 'think' }, f);
      K.move(K.frame([add(FIELD, [1.5, 0, 2.6]), add(FIELD, [-0.5, 0, 2.8])], { yaw: 0.1, pitch: 0.06 }), K.frame([add(FIELD, [1.5, 0, 2.6]), add(FIELD, [-0.5, 0, 2.8])], { yaw: 0, pitch: 0.06, push: 0.85 }), u(8), 0.4, f); K.focusOn(add(FIELD, [0.5, 1.6, 2.7])); break; }
    case 9: { // not them: big grins, thumbs up
      K.preset('day'); car.position.set(...add(FIELD, [0, 0, -2.5])); car.rotation.set(0, 0.2, 0); propSpin(f, 0);
      P(H, { pos: add(FIELD, [1.5, 0, 2.6]), yaw: -0.3, expr: 'laugh', arms: 'up', talk: 0.5 }, f); P(B, { pos: add(FIELD, [-0.5, 0, 2.8]), yaw: 0.3, expr: 'laugh', arms: 'up' }, f);
      K.move(K.frame([add(FIELD, [1.5, 0, 2.6]), add(FIELD, [-0.5, 0, 2.8])], { yaw: 0, pitch: 0.02, push: 0.8 }), K.frame([add(FIELD, [1.5, 0, 2.6]), add(FIELD, [-0.5, 0, 2.8])], { yaw: 0, pitch: 0.02, push: 0.72 }), u(9), 1.2, f); K.focusOn(add(FIELD, [0.5, 1.8, 2.7])); break; }
    case 10: { // two weeks later Smolinski climbs in to pilot it himself
      K.preset('golden', { exposure: 1.05 }); car.position.set(...add(AIR, [0, 0, 10])); car.rotation.set(0, Math.PI / 2, 0); propSpin(f, 0);
      const v = u(10); if (v < 0.7) P(H, { pos: add(AIR, [1.9 - v * 1.3, 0, 10.4]), yaw: -Math.PI / 2, walk: t * 1.2, expr: 'proud', arms: 'wave' }, f); else inCar(H, f, 0.35, 'proud');
      K.move({ p: add(AIR, [6, 2, 16]), l: add(AIR, [0, 1.4, 10]), fov: 38 }, { p: add(AIR, [4.5, 1.8, 14]), l: add(AIR, [0.5, 1.4, 10]), fov: 34 }, v, 0.4, f); K.focusOn(add(AIR, [0.5, 1.4, 10])); break; }
    case 11: { // with his partner Harold Blake: both waving from the car
      K.preset('golden', { exposure: 1.05 }); car.position.set(...add(AIR, [0, 0, 10])); car.rotation.set(0, Math.PI / 2, 0); propSpin(f, 1); inCar(H, f, 0.35, 'laugh'); inCar(B, f, -0.35, 'happy'); B.armL.a.rotation.x = -2.6;
      K.move({ p: add(AIR, [0.3, 2.0, 3.6]), l: add(AIR, [0, 1.3, 10]), fov: 36 }, { p: add(AIR, [0.2, 1.9, 5.0]), l: add(AIR, [0, 1.3, 10]), fov: 34 }, u(11), 0.4, f); K.focusOn(add(AIR, [0, 1.5, 10])); break; }
    case 12: { // took off, all good
      K.preset('golden'); const v = u(12); fly(f, add(SKY, [v * 40, 0, 0]), { roll: Math.sin(t) * 0.05 }); inCar(H, f, 0.35, 'happy'); inCar(B, f, -0.35, 'happy');
      const cp = car.position.toArray(); K.move({ p: add(cp, [4, -1.5, 10]), l: add(cp, [0, 1, 0]), fov: 40 }, { p: add(cp, [-6, 2, 9]), l: add(cp, [0, 1, 0]), fov: 40 }, v, 0.8, f); K.focusOn(cp); break; }
    case 13: { // until the right wing strut came loose: close on the strut, snap
      K.preset('golden'); fly(f, add(SKY, [t * 14, 0, 0]), { roll: Math.sin(t * 9) * 0.05 }); inCar(H, f, 0.35, 'shock'); const v = u(13);
      if (v > 0.55) { strutR.rotation.x = -1.05 + (v - 0.55) * 3; K.grade.flash.value = v < 0.6 ? 0.4 : 0; } else strutR.rotation.x = -1.05 + Math.sin(t * 30) * 0.06;
      const cp = car.position.toArray(); K.move({ p: add(cp, [-2.8, 3.4, 9.5]), l: add(cp, [-0.3, 1.4, 2.0]), fov: 34 }, { p: add(cp, [-2.0, 3.0, 8.0]), l: add(cp, [-0.3, 1.3, 2.0]), fov: 32 }, v, 2, f); K.focusOn(add(cp, [-0.3, 1.2, 1.9])); break; }
    case 14: { // the wing folded and the flying car stopped flying: wing folds, nose drops, cut wide to a dust puff far away
      const v = u(14); strutR.visible = false;
      if (v < 0.55) { K.preset('golden'); fly(f, add(SKY, [t * 10, -v * 6, 0]), { roll: v * 0.9, pitch: -v * 0.6 }); wingR.rotation.x = -K.ease(v / 0.55) * 1.6; wingR.position.y = 1.78 + K.ease(v / 0.55) * 1.2;
        const cp = car.position.toArray(); K.move({ p: add(cp, [3, 2, 11]), l: cp, fov: 40 }, {}, 0, 3, f); K.focusOn(cp); }
      else { K.preset('golden'); car.position.set(0, -500, 0); burst(f, dust, add(FIELD, [10, 0, -40]), K.ph[14].a + 50, 4, 70); K.move({ p: add(FIELD, [0, 3, 14]), l: add(FIELD, [8, 2, -40]), fov: 34 }, {}, 0, 0.3, f); K.focusOn(add(FIELD, [10, 2, -40])); }
      break; }
    case 15: { // investigators found badly done welds: magnifier, glowing weld
      K.preset('day', { exposure: 1.15, envI: 0.8 }); car.position.set(0, -500, 0); weld.material.emissiveIntensity = 2 + Math.sin(t * 6) * 1.5;
      P(I1, { pos: add(LAB, [0.6, 0, -0.8]), yaw: Math.PI, expr: 'angry', arms: 'point', look: [0, -0.4] }, f); P(I2, { pos: add(LAB, [-1.0, 0, -0.9]), yaw: Math.PI - 0.3, expr: 'shock', arms: 'cross', look: [0, -0.3] }, f);
      K.move(K.frame([add(LAB, [0, 0.5, -2]), add(LAB, [0.6, 0, -0.8]), add(LAB, [-1.0, 0, -0.9])], { yaw: Math.PI + 0.2, pitch: 0.3 }), K.frame([add(LAB, [0.6, 0.6, -2])], { yaw: Math.PI + 0.15, pitch: 0.5, h: 1.0, lookY: 0.55, push: 0.9 }), u(15), 0.4, f); K.focusOn(add(LAB, [0.6, 1.1, -2])); break; }
    case 16: { // the car of the future never reached the future: dusk, empty runway, a lone wing on the ground
      K.preset('dusk'); car.position.set(...add(AIR, [-6, 0, 0])); car.rotation.set(0, 0.6, 0); wings.visible = false; K.grade.sat.value = 0.95;
      K.move({ p: add(AIR, [4, 1.4, 16]), l: add(AIR, [-4, 1.2, 0]), fov: 38 }, { p: add(AIR, [2, 1.2, 12]), l: add(AIR, [-5, 1.0, 0]), fov: 34 }, u(16), 0.3, f); K.focusOn(add(AIR, [-6, 1, 0])); break; }
    default: { // nobody plans their end: empty sky, clouds -> loops to the flying hook
      K.preset('day'); car.position.set(0, -500, 0); K.move({ p: add(AIR, [0, 1.6, 40]), l: add(AIR, [0, 18, -120]), fov: 42 }, { p: add(AIR, [0, 1.6, 34]), l: add(AIR, [0, 24, -120]), fov: 42 }, u(17), 0.4, f); K.focusOn(add(AIR, [0, 30, -160]));
    }
  }
}
