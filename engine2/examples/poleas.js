// VID-008 v2 — Thomas Midgley Jr.: leaded petrol, CFCs, and the rope-and-pulley bed rig that killed him (1944).
export let FRAMES = 1650;
let K, T, M, MOLD, people = [], car, puffs = [], fridgeCloud = [], globe, hole, ropes = [], pulleys = [], bedM, glassesFloor, bulb, lamp;
const LAB = [0, 0, 0], ST = [200, 0, 0], KIT = [400, 0, 0], SPACE = [600, 50, 0], BED = [800, 0, 0];
const add = (a, b) => a.map((x, i) => x + b[i]);
const V = (K, a) => new K.THREE.Vector3(...a);

function wall(K, o, w, d, h, col, floorCol, tex) {
  K.plane(w, d, K.std(floorCol, { roughness: 0.8 }), add(o, [0, 0.01, 0]));
  const wm = K.std(col, { roughness: 0.9, map: tex || null });
  K.plane(w, h, wm, add(o, [0, h / 2, -d / 2]), [0, 0, 0]); K.plane(d, h, wm, add(o, [-w / 2, h / 2, 0]), [0, Math.PI / 2, 0]); K.plane(d, h, wm, add(o, [w / 2, h / 2, 0]), [0, -Math.PI / 2, 0]);
  K.plane(w, d, K.std(0xe8e0d0), add(o, [0, h, 0]), [Math.PI / 2, 0, 0]);
}
function makeCar(K, col) {
  const g = new K.THREE.Group();
  K.box(3.6, 0.7, 1.6, col, [0, 0.75, 0], { parent: g, roughness: 0.35, metalness: 0.2 });
  K.box(2.0, 0.75, 1.5, col, [-0.3, 1.45, 0], { parent: g, roughness: 0.35, metalness: 0.2 });
  K.box(1.9, 0.55, 1.52, 0x9ad0ff, [-0.3, 1.45, 0], { parent: g, roughness: 0.1, metalness: 0.3 });
  for (const x of [-1.15, 1.15]) for (const z of [-0.8, 0.8]) { const w = K.cyl(0.38, 0.38, 0.28, 0x1a1a1a, [x, 0.38, z], { parent: g }); w.rotation.x = Math.PI / 2; K.cyl(0.16, 0.16, 0.3, 0xd8d8d8, [x, 0.38, z], { parent: g, metalness: 0.8 }).rotation.x = Math.PI / 2; }
  for (const z of [-0.5, 0.5]) K.sph(0.13, 0xfff2b0, [1.82, 0.85, z], { parent: g, emissive: 0xffe08a, emissiveIntensity: 1.5 });
  K.cyl(0.06, 0.06, 0.3, 0x444444, [-1.9, 0.45, 0.5], { parent: g }).rotation.z = Math.PI / 2;
  K.scene.add(g); return g;
}
function rope(K) { const m = new K.THREE.Mesh(new K.THREE.CylinderGeometry(0.018, 0.018, 1, 6), K.std(0xd8c49a, { roughness: 1 })); m.castShadow = true; K.scene.add(m); return m; }
function seg(K, m, a, b) { const A = V(K, a), B = V(K, b); const d = B.clone().sub(A); m.position.copy(A).addScaledVector(d, 0.5); m.scale.set(1, d.length(), 1); m.quaternion.setFromUnitVectors(new K.THREE.Vector3(0, 1, 0), d.normalize()); m.visible = true; }
function label(K, txt, bg = '#f3c537', fg = '#1a1a1a', w = 512, h = 160) { return K.tex(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = `bold ${h * 0.55}px Poppins, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 4); g.lineWidth = 10; g.strokeStyle = fg; g.strokeRect(5, 5, w - 10, h - 10); }); }

export async function build(k) {
  K = k; await K.preloadEnvs(); T = await K.timing(); FRAMES = Math.ceil(T.duration * 30) + 6;
  const C = K.makeChar;
  M = C(K.scene, { shirt: 0xf4f2ec, tie: 0x8a1f2e, buttons: 0x888888, hair: 0x4a3020, glasses: true, mustache: true, seed: 1 });
  MOLD = C(K.scene, { shirt: 0xe8e2d4, hair: 0xb8b8b8, glasses: true, mustache: true, seed: 2 });
  // ---------- LAB ----------
  const brick = K.tex(256, 256, (g, w, h) => { g.fillStyle = '#d8c8a8'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8b490'; for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) g.fillRect(x * 64 + (y % 2) * 32 + 2, y * 32 + 2, 60, 28); }, [6, 2]);
  wall(K, LAB, 14, 10, 6, 0xffffff, 0x6a4a32, brick);
  for (const x of [-2.6, 2.6]) { K.box(3.2, 0.12, 1.2, 0x5a3a24, add(LAB, [x, 1.0, -2.6])); for (const sx of [-1.4, 1.4]) for (const sz of [-0.5, 0.5]) K.box(0.1, 1.0, 0.1, 0x3a2418, add(LAB, [x + sx, 0.5, -2.6 + sz])); }
  for (let i = 0; i < 7; i++) await K.placeH(`rpg_items_pack/Potion${(i % 9) + 1}_Filled`, add(LAB, [-3.8 + i * 0.45, 1.06, -2.7 + (i % 2) * 0.3]), i, 0.42);
  for (let i = 0; i < 5; i++) await K.placeH(`rpg_items_pack/Potion${(i % 9) + 3}_Filled`, add(LAB, [1.6 + i * 0.45, 1.06, -2.6 - (i % 2) * 0.3]), i, 0.42);
  await K.placeH('house_interior_pack/Shelf_Large', add(LAB, [0, 0, -4.7]), 0, 3.2);
  for (let i = 0; i < 6; i++) await K.placeH(`rpg_items_pack/Potion${(i % 9) + 2}_Filled`, add(LAB, [-1.0 + i * 0.4, 1.95, -4.6]), i, 0.4);
  const board = K.tex(512, 320, (g, w, h) => { g.fillStyle = '#2a3a2e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8e8e0'; g.fillStyle = '#e8e8e0'; g.font = 'bold 54px Poppins'; g.fillText('Pb(C₂H₅)₄', 40, 110); g.fillText('CCl₂F₂', 60, 230); g.lineWidth = 5; g.beginPath(); g.moveTo(330, 90); g.lineTo(450, 260); g.stroke(); });
  K.box(3.2, 2.0, 0.08, 0xffffff, add(LAB, [-4.6, 2.6, -4.9]), { map: board, roughness: 0.9 });
  lamp = K.pointLight(0xfff0d0, 6, add(LAB, [0, 4.5, 0]), 16);
  bulb = K.sph(0.22, 0xfff6c0, add(LAB, [0.0, 3.3, -1.0]), { emissive: 0xffe070, emissiveIntensity: 0 }); bulb.visible = false;
  // ---------- STREET (1920s, petrol) ----------
  K.plane(400, 400, K.std(0x6a7a4a, { roughness: 1 }), add(ST, [0, -0.02, 0]));
  K.plane(10, 160, K.std(0x3a3a40, { roughness: 0.95 }), add(ST, [0, 0.0, -40]));
  K.plane(3, 160, K.std(0xb8b0a0), add(ST, [-6.5, 0.02, -40])); K.plane(3, 160, K.std(0xb8b0a0), add(ST, [6.5, 0.02, -40]));
  const blds = ['2Story_Mat', '3Story_Balcony_Mat', '2Story_Sign_Mat', '4Story_Mat', '2Story_Wide_Mat', '3Story_Slim_Mat', '2Story_Columns_Mat', '6Story_Stack_Mat'];
  for (let i = 0; i < 8; i++) { await K.placeH(`buildings_pack_3/${blds[i]}`, add(ST, [-12, 0, 6 - i * 9]), Math.PI / 2, 7 + (i % 3) * 3); await K.placeH(`buildings_pack_3/${blds[(i + 3) % 8]}`, add(ST, [12, 0, 2 - i * 9]), -Math.PI / 2, 7 + ((i + 1) % 3) * 3); }
  const pump = new K.THREE.Group(); K.box(0.9, 2.4, 0.7, 0xc8282a, [0, 1.2, 0], { parent: pump, roughness: 0.4 }); K.sph(0.42, 0xfff4d8, [0, 2.75, 0], { parent: pump, emissive: 0xfff0c0, emissiveIntensity: 0.4 });
  const pl = K.box(0.8, 0.45, 0.02, 0xffffff, [0, 1.75, 0.36], { parent: pump, map: label(K, 'PLOMO') }); pump.position.set(...add(ST, [-5.6, 0, 1])); K.scene.add(pump);
  car = makeCar(K, 0x2a5a9a);
  for (let i = 0; i < 26; i++) puffs.push(K.sph(0.25, 0x7a7a6a, [0, -50, 0], { roughness: 1, transparent: true, opacity: 0.75 }));
  for (let i = 0; i < 6; i++) people.push(C(K.scene, { shirt: [0x6a4a8a, 0x2a6a5a, 0x8a5a2a, 0x3a3a6a, 0x7a2a2a, 0x4a6a2a][i], hat: ['bowler', 'cap', 'hair', 'bowler', 'cap', 'hair'][i], hatColor: 0x2a2a2a, hair: 0x5a3418, seed: 10 + i }));
  // ---------- KITCHEN ----------
  wall(K, KIT, 10, 8, 5, 0xbfe0d8, 0xd8d0c0);
  await K.placeH('house_interior_pack/Kitchen_Fridge', add(KIT, [0, 0, -3.4]), 0, 2.4);
  await K.placeH('house_interior_pack/Kitchen_2Drawers', add(KIT, [-2.1, 0, -3.5]), 0, 1.1);
  await K.placeH('house_interior_pack/Kitchen_Oven', add(KIT, [2.1, 0, -3.5]), 0, 1.1);
  await K.placeH('house_interior_pack/Window_Small2', add(KIT, [-2.1, 2.3, -3.95]), 0, 1.2);
  const can = new K.THREE.Group(); K.cyl(0.18, 0.18, 0.6, 0xe8e8e8, [0, 0.3, 0], { parent: can, metalness: 0.6, roughness: 0.3 }); K.cyl(0.18, 0.18, 0.2, 0x2a6ad8, [0, 0.4, 0], { parent: can });
  K.cyl(0.05, 0.08, 0.12, 0x222222, [0, 0.66, 0], { parent: can }); can.position.set(...add(KIT, [1.4, 1.1, -3.4])); K.scene.add(can);
  for (let i = 0; i < 18; i++) fridgeCloud.push(K.sph(0.3, 0xcfe8ff, [0, -50, 0], { roughness: 1, transparent: true, opacity: 0.6, emissive: 0x9fd0ff, emissiveIntensity: 0.4 }));
  K.pointLight(0xfff4e0, 5, add(KIT, [0, 3.6, 1]), 12);
  // ---------- SPACE: globe + ozone ----------
  const earth = K.tex(1024, 512, (g, w, h) => { g.fillStyle = '#2a6ad8'; g.fillRect(0, 0, w, h); g.fillStyle = '#4caf50'; const R = (s) => { const x = Math.sin(s * 127.1) * 43758.5; return x - Math.floor(x); };
    for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse(R(i) * w, h * 0.2 + R(i + 40) * h * 0.6, 30 + R(i + 9) * 110, 20 + R(i + 7) * 70, R(i + 3) * 3, 0, 7); g.fill(); } g.fillStyle = '#f4f8ff'; g.fillRect(0, 0, w, h * 0.07); g.fillRect(0, h * 0.93, w, h * 0.07); });
  globe = K.sph(6, 0xffffff, SPACE, { map: earth, roughness: 0.6 }); globe.scale.setScalar(1);
  const oz = new K.THREE.Mesh(new K.THREE.SphereGeometry(6.6, 48, 32), new K.THREE.MeshStandardMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.22, emissive: 0x6ab8ff, emissiveIntensity: 0.5, depthWrite: false })); oz.position.set(...SPACE); K.scene.add(oz);
  hole = new K.THREE.Mesh(new K.THREE.CircleGeometry(1, 40), new K.THREE.MeshBasicMaterial({ color: 0x3a1050, transparent: true, opacity: 0.85 })); hole.rotation.x = -Math.PI / 2; hole.position.set(...add(SPACE, [0, 6.62, 0])); K.scene.add(hole);
  const starG = new K.THREE.BufferGeometry(); const sp = []; for (let i = 0; i < 1500; i++) { const a = Math.random() * 6.28, b = Math.acos(Math.random() * 2 - 1), r = 300; sp.push(SPACE[0] + r * Math.sin(b) * Math.cos(a), SPACE[1] + r * Math.cos(b), r * Math.sin(b) * Math.sin(a)); }
  starG.setAttribute('position', new K.THREE.Float32BufferAttribute(sp, 3)); const stars = new K.THREE.Points(starG, new K.THREE.PointsMaterial({ color: 0xffffff, size: 1.3, fog: false })); K.scene.add(stars);
  // ---------- BEDROOM with rope rig ----------
  wall(K, BED, 10, 9, 5, 0xd8c8a8, 0x7a5236);
  bedM = await K.placeH('house_interior_pack/Bed_Single', add(BED, [0, 0, -2.2]), 0, 2.3, { byW: true });
  await K.placeH('house_interior_pack/NightStand_2', add(BED, [-1.6, 0, -3.3]), 0, 0.8);
  await K.placeH('house_interior_pack/Light_Desk', add(BED, [-1.6, 0.8, -3.3]), 0, 0.6);
  await K.placeH('house_interior_pack/Window_Large2', add(BED, [2.2, 1.4, -4.45]), 0, 2.2);
  for (const x of [-1.1, 1.1]) K.box(0.16, 4.6, 0.16, 0x5a3a24, add(BED, [x, 2.3, -3.6]));
  K.box(2.6, 0.16, 0.16, 0x5a3a24, add(BED, [0, 4.4, -3.6])); K.box(0.16, 0.16, 3.0, 0x5a3a24, add(BED, [0, 4.4, -2.1]));
  for (const p of [[0, 4.25, -3.0], [0, 4.25, -1.6], [-0.9, 4.25, -3.6], [0.9, 4.25, -3.6]]) { const w = K.cyl(0.18, 0.18, 0.08, 0xb8a070, add(BED, p), { metalness: 0.5, roughness: 0.4 }); w.rotation.z = Math.PI / 2; pulleys.push(w); }
  for (let i = 0; i < 8; i++) ropes.push(rope(K));
  const gl = new K.THREE.Group(); for (const s of [-1, 1]) { const r = new K.THREE.Mesh(new K.THREE.TorusGeometry(0.09, 0.015, 8, 20), K.std(0x1a1a1a)); r.position.x = s * 0.12; gl.add(r); } K.box(0.08, 0.015, 0.015, 0x1a1a1a, [0, 0, 0], { parent: gl });
  gl.rotation.x = -Math.PI / 2; gl.position.set(...add(BED, [0.6, 0.02, -0.6])); K.scene.add(gl); glassesFloor = gl;
  K.pointLight(0xffd8a0, 4, add(BED, [-1.6, 1.6, -3.0]), 9);
}

const P = (c, p, f) => K.poseChar(c, p, f);
function hideAll() { for (const c of [M, MOLD, ...people]) c.root.visible = false; for (const p of puffs) p.position.y = -50; for (const p of fridgeCloud) p.position.y = -50; for (const r of ropes) r.visible = false; glassesFloor.visible = false; bulb.visible = false; }
function exhaust(f, from, n = 26) { puffs.slice(0, n).forEach((p, i) => { const age = ((f * 0.9 + i * 11) % 90) / 90; p.position.set(from[0] - age * 4 - Math.sin(i) * 0.3, from[1] + age * 2.2 + Math.sin(i * 3) * 0.2, from[2] + Math.cos(i * 2) * age); p.scale.setScalar(0.4 + age * 2.4); p.material.opacity = 0.7 * (1 - age); }); }
function cloudFrom(f, from, t0) { fridgeCloud.forEach((p, i) => { const age = Math.max(0, (f - t0) / 50) + (i % 6) * 0.05; const a = i * 2.4; p.position.set(from[0] + Math.cos(a) * age * 1.2, from[1] + age * 1.5 + (i % 3) * 0.2, from[2] + 0.3 + Math.sin(a) * age * 0.6 + age); p.scale.setScalar(0.3 + age * 1.6); p.material.opacity = Math.max(0, 0.6 - age * 0.25); }); }
function rig(f, o) { // ropes from pulleys to the man (harness at chest) ; o.tangle adds crossing ropes
  const hb = o.body; const pts = [[0, 4.25, -3.0], [0, 4.25, -1.6], [-0.9, 4.25, -3.6], [0.9, 4.25, -3.6]].map((p) => add(BED, p));
  seg(K, ropes[0], pts[0], add(hb, [-0.1, 1.5, 0])); seg(K, ropes[1], pts[1], add(hb, [0.1, 1.4, 0.1])); seg(K, ropes[2], pts[2], add(hb, [-0.2, 1.2, 0])); seg(K, ropes[3], pts[3], add(hb, [0.2, 1.2, 0]));
  seg(K, ropes[4], pts[2], pts[0]); seg(K, ropes[5], pts[3], pts[1]);
  if (o.tangle) { seg(K, ropes[6], add(hb, [-0.5, 1.6, 0.2]), add(hb, [0.5, 0.9, 0.2])); seg(K, ropes[7], add(hb, [0.5, 1.7, 0.2]), add(hb, [-0.5, 1.0, 0.25])); }
  for (const w of pulleys) w.rotation.x = f * (o.spin || 0.1);
}

export function frame(f, k) {
  hideAll(); const ph = K.at(f), t = f / 30, u = (i, j) => K.u(f, i, j);
  switch (ph) {
    case 0: { // HOOK montage: exhaust -> fridge gas -> ropes tug
      if (f < 45) { K.preset('day', { fog: [0xb8b8a0, 20, 140] }); car.position.set(...add(ST, [-2 + f * 0.08, 0, -1.4])); car.rotation.y = 0; exhaust(f, add(car.position.toArray(), [-2, 0.45, 0.5]));
        K.move({ p: add(ST, [-2.0, 1.7, 8.5]), l: add(ST, [-1.2, 1.0, -1.4]), fov: 40 }, { p: add(ST, [0.0, 1.5, 7.5]), l: add(ST, [0.4, 1.0, -1.4]), fov: 38 }, f / 45, 1, f); K.focusOn(car.position.toArray()); }
      else if (f < 90) { K.preset('day', { exposure: 1.05 }); cloudFrom(f, add(KIT, [0, 1.2, -3.0]), 45); P(M, { pos: add(KIT, [0.9, 0, -1.6]), yaw: -0.4, expr: 'shock', arms: 'up' }, f);
        K.move(K.frame([add(KIT, [0, 0, -3.2]), add(KIT, [0.9, 0, -1.6])], { yaw: 0.25, pitch: 0.08 }), K.frame([add(KIT, [0, 0, -3.2]), add(KIT, [0.9, 0, -1.6])], { yaw: 0.15, pitch: 0.08, push: 0.85 }), (f - 45) / 45, 1, f); }
      else { K.preset('candle', { exposure: 1.2 }); const body = add(BED, [0, 0.55, -2.0]); P(MOLD, { pos: body, yaw: 0, sit: 1, expr: 'shock', arms: 'up', lean: -0.2 + Math.sin(f * 0.5) * 0.1 }, f); rig(f, { body, spin: 0.4 });
        K.move(K.frame([body], { yaw: 0.35, pitch: 0.3, h: 3.6, lookY: 2.0 }), K.frame([body], { yaw: 0.25, pitch: 0.25, h: 3.4, lookY: 2.0, push: 0.85 }), (f - 90) / 50, 1.5, f); }
      break; }
    case 1: { // Thomas Midgley, proud in the lab
      K.preset('interior', { exposure: 1.1 }); P(M, { pos: add(LAB, [0, 0, -1.4]), yaw: 0, expr: 'proud', arms: 'akimbo' }, f);
      K.move(K.frame([add(LAB, [0, 0, -1.4])], { yaw: -0.3, pitch: 0.05 }), K.frame([add(LAB, [0, 0, -1.4])], { yaw: -0.15, pitch: 0.05, push: 0.8 }), u(1), 0.5, f); K.focusOn(add(LAB, [0, 1.8, -1.4])); break; }
    case 2: { // lead in petrol — pump PLOMO, car fills; "Sí, plomo" (he grins)
      K.preset('day'); car.position.set(...add(ST, [-3.2, 0, 1.0])); car.rotation.y = Math.PI; P(M, { pos: add(ST, [-4.6, 0, 2.6]), yaw: 0.6, expr: u(2) > 0.6 ? 'smug' : 'happy', arms: 'point', talk: 0.5 }, f);
      K.move(K.frame([add(ST, [-5.6, 0, 1]), add(ST, [-4.6, 0, 2.6])], { yaw: 0.45, pitch: 0.08, h: 3 }), K.frame([add(ST, [-5.6, 0, 1]), add(ST, [-4.6, 0, 2.6])], { yaw: 0.3, pitch: 0.06, h: 3, push: 0.85 }), u(2), 0.5, f); K.focusOn(add(ST, [-5, 1.6, 2])); break; }
    case 3: { // decades of the whole world breathing lead: smoggy street, coughing people
      K.preset('day', { fog: [0x9a9a7a, 6, 60], sky: [0x8a8a6a, 0xa8a888, 0xb8b498], exposure: 0.95 }); K.grade.sat.value = 0.85;
      car.position.set(...add(ST, [0, 0, -14 + u(3) * 6])); car.rotation.y = -Math.PI / 2; exhaust(f, add(car.position.toArray(), [0, 0.45, 2]));
      people.forEach((c, i) => { const x = (i % 2 ? 1 : -1) * (2.0 + (i % 3) * 0.3), z = 1 - i * 2.0; P(c, { pos: add(ST, [x, 0, z]), yaw: x > 0 ? -0.6 : 0.6, expr: 'worried', arms: 'think', nod: 1, tremble: 0.6, walk: (i % 2) ? t * 0.8 : 0 }, f); });
      K.move({ p: add(ST, [0, 2.0, 9]), l: add(ST, [0, 1.6, -6]), fov: 40 }, { p: add(ST, [0, 1.8, 6]), l: add(ST, [0, 1.6, -8]), fov: 38 }, u(3), 0.5, f); K.focusOn(add(ST, [0, 1.6, -4])); break; }
    case 4: { // then the fridge gases
      K.preset('day', { exposure: 1.05 }); P(M, { pos: add(KIT, [1.0, 0, -1.6]), yaw: -0.5, expr: 'happy', arms: 'point', talk: 0.6 }, f);
      K.move(K.frame([add(KIT, [0, 0, -3.2]), add(KIT, [1.0, 0, -1.6])], { yaw: 0.3, pitch: 0.06 }), K.frame([add(KIT, [0, 0, -3.2]), add(KIT, [1.0, 0, -1.6])], { yaw: 0.15, pitch: 0.06, push: 0.85 }), u(4), 0.5, f); K.focusOn(add(KIT, [0.5, 1.5, -2.4])); break; }
    case 5: { // years later, a hole in the ozone layer
      K.preset('night', { fog: [0x000000, 400, 900], sky: [0x000004, 0x02020a, 0x050510], exposure: 1.1, sunI: 2.4, sunDir: [0.6, 0.5, 0.6] });
      const g = K.ease(u(5)); hole.scale.setScalar(0.2 + g * 2.6); globe.rotation.y = t * 0.2;
      K.move({ p: add(SPACE, [0, 14, 30]), l: add(SPACE, [0, 1, 0]), fov: 36 }, { p: add(SPACE, [0, 22, 20]), l: add(SPACE, [0, 2, 0]), fov: 36 }, u(5), 0.2, f); K.focusOn(add(SPACE, [0, 6, 0])); break; }
    case 6: { // he couldn't sit still: busy in the lab
      K.preset('interior', { exposure: 1.1 }); P(M, { pos: add(LAB, [-2.0 + Math.sin(t * 2) * 0.9, 0, -1.4]), yaw: Math.cos(t * 2) > 0 ? 1.4 : -1.4, walk: t * 1.8, run: 1, expr: 'happy', arms: 'hold' }, f);
      K.move(K.frame([add(LAB, [-2, 0, -1.4])], { yaw: 0, pitch: 0.1, pad: 1.9 }), K.frame([add(LAB, [-2, 0, -1.4])], { yaw: 0.1, pitch: 0.1, pad: 1.7 }), u(6), 0.6, f); K.focusOn(add(LAB, [-2, 1.6, -1.4])); break; }
    case 7: { // 1940: polio, he can't walk (in bed, older)
      K.preset('candle', { exposure: 1.25 }); const body = add(BED, [0, 0.55, -2.0]); P(MOLD, { pos: body, yaw: 0, sit: 1, expr: 'sad', lean: -0.25, look: [0, -0.3] }, f);
      K.move(K.frame([body], { yaw: -0.3, pitch: 0.15, h: 2.2 }), K.frame([body], { yaw: -0.2, pitch: 0.12, h: 2.2, push: 0.82 }), u(7), 0.4, f); K.focusOn(add(body, [0, 1.4, 0])); break; }
    case 8: { // what does an inventor do?
      K.preset('candle', { exposure: 1.25 }); const body = add(BED, [0, 0.55, -2.0]); P(MOLD, { pos: body, yaw: 0, sit: 1, expr: 'neutral', arms: 'think', look: [0.3, 0.3] }, f);
      K.move(K.frame([body], { yaw: 0.25, pitch: 0.05, h: 2.0, lookY: 1.5, push: 0.62 }), K.frame([body], { yaw: 0.2, pitch: 0.05, h: 2.0, lookY: 1.5, push: 0.55 }), u(8), 0.4, f); K.focusOn(add(body, [0, 1.5, 0])); break; }
    case 9: { // he invents! lightbulb grin
      K.preset('candle', { exposure: 1.3 }); const body = add(BED, [0, 0.55, -2.0]); P(MOLD, { pos: body, yaw: 0, sit: 1, expr: 'laugh', arms: 'up', talk: 0.5 }, f);
      bulb.visible = true; bulb.position.set(...add(body, [0, 2.75, 0])); const k = Math.min(1, (f - K.ph[9].a + 4) / 8); bulb.material.emissiveIntensity = 6 * k; bulb.scale.setScalar(0.5 + k * 0.6); K.grade.flash.value = Math.max(0, 0.3 - (f - K.ph[9].a) / 20);
      K.move(K.frame([body], { yaw: 0.0, pitch: 0.05, h: 2.6, lookY: 1.6, push: 0.62 }), K.frame([body], { yaw: 0.0, pitch: 0.05, h: 2.6, lookY: 1.6, push: 0.55 }), u(9), 0.4, f); K.focusOn(add(body, [0, 1.6, 0])); break; }
    case 10: { // ropes and pulleys to lift himself out of bed — he pulls and rises
      K.preset('interior', { exposure: 1.15 }); const r = Math.sin(t * 2) * 0.5 + 0.5; const body = add(BED, [0, 0.55 + r * 0.5, -2.0]);
      P(MOLD, { pos: body, yaw: 0, sit: 1, expr: 'proud', arms: 'reach', lean: -0.2 + r * 0.2 }, f); MOLD.armL.a.rotation.x = MOLD.armR.a.rotation.x = -2.6; rig(f, { body, spin: 0.15 });
      K.move(K.frame([body], { yaw: 0.45, pitch: 0.15, h: 4.4, lookY: 2.2 }), K.frame([body], { yaw: 0.3, pitch: 0.12, h: 4.4, lookY: 2.2, push: 0.9 }), u(10), 0.4, f); K.focusOn(add(body, [0, 1.6, 0])); break; }
    case 11: { // it worked... until one day: lights flicker
      const fl = (Math.sin(f * 1.7) > 0.2 || f < K.ph[11].a + 30) ? 1 : 0.35; K.preset('interior', { exposure: 1.15 * fl }); const body = add(BED, [0, 0.8, -2.0]);
      P(MOLD, { pos: body, yaw: 0, sit: 1, expr: f < K.ph[11].a + 30 ? 'happy' : 'scared', arms: 'reach' }, f); MOLD.armL.a.rotation.x = MOLD.armR.a.rotation.x = -2.6; rig(f, { body, spin: 0.15 });
      K.move(K.frame([body], { yaw: -0.3, pitch: 0.12, h: 3.8, lookY: 2 }), K.frame([body], { yaw: -0.2, pitch: 0.1, h: 3.8, lookY: 2, push: 0.8 }), u(11), 1.2, f); K.focusOn(add(body, [0, 1.6, 0])); break; }
    case 12: { // 1944: found caught in his own ropes — empty tangled bed, glasses on the floor
      K.preset('night', { exposure: 1.35, fog: [0x1a2448, 20, 80] }); K.grade.sat.value = 0.8; const body = add(BED, [0, 0.55, -2.0]); rig(f, { body, tangle: true, spin: 0 }); glassesFloor.visible = true;
      K.move({ p: add(BED, [2.6, 3.2, 2.6]), l: add(BED, [0, 1.2, -2.0]), fov: 38 }, { p: add(BED, [1.8, 2.2, 1.6]), l: add(BED, [0.3, 0.6, -1.4]), fov: 34 }, u(12), 0.3, f); K.focusOn(add(BED, [0.3, 0.8, -1.6])); break; }
    case 13: { // his last invention took him: slow push to the pulleys
      K.preset('night', { exposure: 1.35, fog: [0x1a2448, 20, 80] }); K.grade.sat.value = 0.8; const body = add(BED, [0, 0.55, -2.0]); rig(f, { body, tangle: true, spin: 0.02 }); glassesFloor.visible = true;
      K.move({ p: add(BED, [0.6, 2.4, 1.6]), l: add(BED, [0, 4.0, -2.4]), fov: 40 }, { p: add(BED, [0.5, 2.6, 1.2]), l: add(BED, [0, 3.6, -2.4]), fov: 38 }, u(13), 0.3, f); K.focusOn(add(BED, [0, 4.2, -2.6])); break; }
    case 14: { // still, of the three it did the least harm: globe with the hole, then smog
      K.preset('night', { fog: [0x000000, 400, 900], sky: [0x000004, 0x02020a, 0x050510], exposure: 1.1, sunI: 2.4, sunDir: [0.6, 0.5, 0.6] }); hole.scale.setScalar(2.8); globe.rotation.y = t * 0.2;
      K.move({ p: add(SPACE, [18, 12, 24]), l: add(SPACE, [0, 1, 0]), fov: 36 }, { p: add(SPACE, [0, 24, 20]), l: add(SPACE, [0, 2, 0]), fov: 36 }, u(14), 0.2, f); K.focusOn(SPACE); break; }
    default: { // nobody plans their end: smoggy street at dusk, the car drives off -> loops to the exhaust hook
      K.preset('dusk', { fog: [0x8a7a6a, 8, 80], exposure: 1.0 }); car.position.set(...add(ST, [-2 + u(15) * 3, 0, -1.4])); car.rotation.y = 0; exhaust(f, add(car.position.toArray(), [-2, 0.45, 0.5]));
      K.move({ p: add(ST, [3.0, 3.5, 9]), l: add(ST, [0, 1.2, -2]), fov: 40 }, { p: add(ST, [3.5, 1.2, 5]), l: add(ST, [0, 1, -1]), fov: 38 }, u(15), 0.4, f); K.focusOn(car.position.toArray()); K.grade.black.value = Math.max(0, (f - (FRAMES - 10)) / 10) * 0.5;
    }
  }
}
