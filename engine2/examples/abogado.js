// VID-006 v2 — Clement Vallandigham (Ohio, 1871): demonstrating that the victim shot himself, he fired a pistol he thought unloaded. His client was acquitted.
export let FRAMES = 1690;
let K, T, CV, J, DEF, G, col1, col2, jury = [], gun, smoke = [], hatC, gavel;
const COURT = [0, 0, 0], HOTEL = [200, 0, 0], ST = [400, 0, 0];
const add = (a, b) => a.map((x, i) => x + b[i]);

export async function build(k) {
  K = k; await K.preloadEnvs(); T = await K.timing(); FRAMES = Math.ceil(T.duration * 30) + 6;
  const C = K.makeChar;
  CV = C(K.scene, { shirt: 0x1a1a22, tie: 0xe8e8e8, buttons: 0x888888, hair: 0x2a1a10, beard: '#3a2a1a', mustache: true, seed: 1 });
  J = C(K.scene, { shirt: 0x0e0e12, hat: 'wig', glasses: true, seed: 2 });
  DEF = C(K.scene, { shirt: 0x7a6a4a, hair: 0x5a3418, seed: 3 });
  G = C(K.scene, { shirt: 0x6a8ab8, hair: 0x3a2a1a, seed: 4 }); // reenactment "ghost" of the victim
  col1 = C(K.scene, { shirt: 0x3a2a4a, hat: 'bowler', hatColor: 0x2a2a2a, mustache: true, seed: 5 }); col2 = C(K.scene, { shirt: 0x4a3a2a, hat: 'top', hatColor: 0x1a1a1a, glasses: true, seed: 6 });
  for (let i = 0; i < 6; i++) jury.push(C(K.scene, { shirt: [0x3a4a5a, 0x5a3a3a, 0x3a5a3a, 0x5a5a3a, 0x4a3a5a, 0x2a2a2a][i], hat: ['bowler', 'hair', 'hair', 'top', 'hair', 'bowler'][i], hatColor: 0x2a2a2a, hair: 0x5a3418, seed: 20 + i }));
  // ---------- COURTROOM ----------
  const wood = K.tex(256, 256, (g, w, h) => { g.fillStyle = '#7a4a28'; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#6a3e22' : '#84522e'; g.fillRect(0, i * 16, w, 15); } }, [6, 6]);
  K.plane(16, 16, K.std(0xffffff, { map: wood, roughness: 0.6 }), add(COURT, [0, 0.01, 0]));
  const wm = K.std(0xd8ccb0, { roughness: 0.9 }); K.plane(16, 7, wm, add(COURT, [0, 3.5, -8]), [0, 0, 0]); K.plane(16, 7, wm, add(COURT, [-8, 3.5, 0]), [0, Math.PI / 2, 0]); K.plane(16, 7, wm, add(COURT, [8, 3.5, 0]), [0, -Math.PI / 2, 0]);
  K.box(16, 1.2, 0.1, 0x5a3418, add(COURT, [0, 0.6, -7.94]));
  K.box(4, 1.6, 1.4, 0x4a2a14, add(COURT, [0, 0.8, -6.2]), { roughness: 0.5 }); K.box(4.2, 0.1, 1.6, 0x6a3a1a, add(COURT, [0, 1.65, -6.2]));
  const seal = K.tex(256, 256, (g) => { g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.fillStyle = '#7a5a1a'; g.font = 'bold 60px Poppins'; g.textAlign = 'center'; g.fillText('OHIO', 128, 150); });
  K.box(1.4, 1.4, 0.05, 0xffffff, add(COURT, [0, 4.2, -7.9]), { map: seal });
  await K.placeH('house_interior_pack/Window_Large1', add(COURT, [-5, 1.6, -7.9]), 0, 3); await K.placeH('house_interior_pack/Window_Large1', add(COURT, [5, 1.6, -7.9]), 0, 3);
  K.box(1.0, 1.0, 1.0, 0x5a3418, add(COURT, [4.6, 0.5, -1.4])); // jury box rail
  K.box(5, 1.0, 0.2, 0x5a3418, add(COURT, [5.5, 0.5, 0.6]));
  K.box(2.4, 0.9, 0.8, 0x5a3418, add(COURT, [-3.6, 0.45, -2.2])); // defence table
  gavel = new K.THREE.Group(); K.cyl(0.08, 0.08, 0.25, 0x3a1a0a, [0, 0, 0], { parent: gavel }).rotation.z = Math.PI / 2; K.cyl(0.02, 0.02, 0.4, 0x3a1a0a, [0, -0.2, 0], { parent: gavel });
  K.pointLight(0xfff0d0, 6, add(COURT, [0, 5.5, 0]), 18);
  hatC = new K.THREE.Group(); K.cyl(0.38, 0.38, 0.03, 0x14141a, [0, 0, 0], { parent: hatC }); K.cyl(0.24, 0.25, 0.4, 0x14141a, [0, 0.2, 0], { parent: hatC }); K.scene.add(hatC);
  // ---------- HOTEL ROOM ----------
  K.plane(10, 9, K.std(0x6a3a2a, { roughness: 0.8 }), add(HOTEL, [0, 0.01, 0])); const hw = K.std(0x8a7a5a, { roughness: 0.9 });
  K.plane(10, 5, hw, add(HOTEL, [0, 2.5, -4.5]), [0, 0, 0]); K.plane(9, 5, hw, add(HOTEL, [-5, 2.5, 0]), [0, Math.PI / 2, 0]); K.plane(9, 5, hw, add(HOTEL, [5, 2.5, 0]), [0, -Math.PI / 2, 0]);
  await K.placeH('house_interior_pack/Bed_Single', add(HOTEL, [-2.8, 0, -2.8]), 0, 2.2, { byW: true }); await K.placeH('house_interior_pack/Window_Small2', add(HOTEL, [1.8, 1.6, -4.45]), 0, 1.4);
  await K.placeH('house_interior_pack/Table_RoundSmall', add(HOTEL, [2.2, 0, -1.6]), 0, 0.9); await K.placeH('house_interior_pack/Light_Desk', add(HOTEL, [2.2, 0.9, -1.6]), 0, 0.5);
  await K.placeH('house_interior_pack/Chair_1', add(HOTEL, [2.4, 0, 0.3]), Math.PI * 0.8, 1.1); await K.placeH('house_interior_pack/Chair_1', add(HOTEL, [3.4, 0, -0.7]), -Math.PI * 0.6, 1.1);
  K.pointLight(0xffc888, 5, add(HOTEL, [1.5, 2.5, -1]), 10);
  gun = await K.placeH('survival_pack/Revolver_1', [0, -99, 0], 0, 0.36, { byW: true });
  for (let i = 0; i < 12; i++) smoke.push(K.sph(0.15, 0xdedede, [0, -99, 0], { roughness: 1, transparent: true, opacity: 0.7 }));
  // ---------- STREET (Ohio 1871) ----------
  K.plane(300, 300, K.std(0x8a9a5a, { roughness: 1 }), add(ST, [0, -0.02, 0])); K.plane(10, 200, K.std(0x9a7a5a, { roughness: 1 }), add(ST, [0, 0, -40]));
  const blds = ['2Story_Sign_Mat', '2Story_Balcony_Mat', '3Story_Small_Mat', '2Story_Columns_Mat', '2Story_Wide_Mat', '1Story_Sign_Mat'];
  for (let i = 0; i < 6; i++) { await K.placeH(`buildings_pack_3/${blds[i]}`, add(ST, [-11, 0, 4 - i * 9]), Math.PI / 2, 7 + (i % 2) * 2); await K.placeH(`buildings_pack_3/${blds[(i + 2) % 6]}`, add(ST, [11, 0, 0 - i * 9]), -Math.PI / 2, 7 + ((i + 1) % 2) * 2); }
  const cart = new K.THREE.Group(); await K.placeH('medieval_village_pack/Cart', [0, 0, 0], 0, 1.8, { parent: cart }); await K.placeH('animals_pack/Horse', [0, 0, 2.4], 0, 2.0, { parent: cart }); cart.position.set(...add(ST, [2, 0, -8])); K.scene.add(cart); cart.name = 'cart';
  for (let i = 0; i < 6; i++) K.cloud(add(ST, [-70 + i * 28, 45 + (i % 3) * 8, -170]), 7);
}

const P = (c, p, f) => K.poseChar(c, p, f);
function hideAll() { for (const c of [CV, J, DEF, G, col1, col2, ...jury]) c.root.visible = false; for (const s of smoke) s.position.y = -99; hatC.visible = false; G.root.traverse((o) => { if (o.material && o.material.transparent === false && o.userData.ghost) o.material.opacity = 1; }); if (gun.parent !== K.scene) K.scene.add(gun); gun.position.set(0, -99, 0); }
function court(f, o = {}) { // judge + jury + defendant
  P(J, { pos: add(COURT, [0, 0.5, -6.9]), yaw: 0, expr: o.judge || 'neutral', arms: o.gavel ? 'hammer' : 'cross' }, f);
  jury.forEach((c, i) => P(c, { pos: add(COURT, [3.6 + (i % 3) * 1.1, 0, 1.4 + Math.floor(i / 3) * 1.2]), yaw: -2.0, expr: o.jury || 'neutral', nod: o.nod ? 1 : 0, arms: o.clap ? 'reach' : 'down' }, f));
  if (o.def !== false) P(DEF, { pos: add(COURT, [-4.3, 0, -1.2]), yaw: 0.4, expr: o.defExpr || 'worried', arms: o.defArms || 'cross' }, f);
}
function smokeAt(f, at, t0) { smoke.forEach((s, i) => { const age = (f - t0) / 40; if (age < 0) return; const a = i * 2.4; s.position.set(at[0] + Math.cos(a) * age * 0.6, at[1] + age * 0.8 + (i % 3) * 0.05, at[2] + Math.sin(a) * age * 0.6); s.scale.setScalar(0.3 + age * 1.3); s.material.opacity = Math.max(0, 0.7 - age * 0.5); }); }

export function frame(f, k) {
  hideAll(); const ph = K.at(f), t = f / 30, u = (i, j) => K.u(f, i, j);
  switch (ph) {
    case 0: { // HOOK: this lawyer won his last case — fists up in court, the jury applauds
      K.preset('interior', { exposure: 1.15 }); court(f, { jury: 'happy', clap: true, judge: 'shock', defExpr: 'laugh', defArms: 'up' }); P(CV, { pos: add(COURT, [-1.2, 0, -1.0]), yaw: 0.2, expr: 'laugh', arms: 'up', bounce: 0.6 }, f);
      K.move(K.frame([add(COURT, [-1.2, 0, -1.0])], { yaw: 0.25, pitch: 0.05, h: 2.6 }), K.frame([add(COURT, [-1.2, 0, -1.0])], { yaw: 0.15, pitch: 0.03, h: 2.6, push: 0.82 }), u(0), 1, f); K.focusOn(add(COURT, [-1.2, 1.7, -1.0])); break; }
    case 1: { // the problem: he had to die to win it — his hat alone on the chair, spotlight, desaturated
      K.preset('interior', { exposure: 0.85, hemiI: 0.4 }); K.grade.sat.value = 0.5; K.grade.vig.value = 0.6; hatC.visible = true; hatC.position.set(...add(COURT, [-3.0, 0.92, -2.2])); hatC.rotation.set(0, 0.3, 0);
      K.move({ p: add(COURT, [-1.6, 1.8, 0.4]), l: add(COURT, [-3.0, 1.0, -2.2]), fov: 34 }, { p: add(COURT, [-2.0, 1.6, -0.4]), l: add(COURT, [-3.0, 1.0, -2.2]), fov: 30 }, u(1), 0.2, f); K.focusOn(add(COURT, [-3.0, 1.0, -2.2])); break; }
    case 2: { // Ohio, 1871: street
      K.preset('day'); K.move({ p: add(ST, [0, 9, 16]), l: add(ST, [0, 2, -16]), fov: 42 }, { p: add(ST, [-1.5, 4, 11]), l: add(ST, [1, 2, -10]), fov: 40 }, u(2), 0.3, f); K.focusOn(add(ST, [1, 2, -8])); K.lens.aperture.value = 0.2; break; }
    case 3: { // one of the most famous lawyers in the country: proud, pointing
      K.preset('interior', { exposure: 1.15 }); court(f, { jury: 'shock' }); P(CV, { pos: add(COURT, [0, 0, -2.8]), yaw: 0.6, expr: 'proud', arms: 'point', talk: 0.8 }, f);
      K.move(K.frame([add(COURT, [0, 0, -2.8])], { yaw: 0.5, pitch: 0.06, h: 2.6 }), K.frame([add(COURT, [0, 0, -2.8])], { yaw: 0.35, pitch: 0.05, h: 2.6, push: 0.78 }), u(3), 0.4, f); K.focusOn(add(COURT, [0, 1.7, -2.8])); break; }
    case 4: { // defending a man accused of murder: the defendant, worried
      K.preset('interior', { exposure: 1.1 }); court(f, { jury: 'angry' }); P(CV, { pos: add(COURT, [-3.0, 0, -1.4]), yaw: 0.6, expr: 'neutral', arms: 'akimbo' }, f);
      K.move(K.frame([add(COURT, [-4.3, 0, -1.2]), add(COURT, [-3.0, 0, -1.4])], { yaw: 0.3, pitch: 0.05 }), K.frame([add(COURT, [-4.3, 0, -1.2]), add(COURT, [-3.0, 0, -1.4])], { yaw: 0.2, pitch: 0.05, push: 0.85 }), u(4), 0.4, f); K.focusOn(add(COURT, [-3.7, 1.7, -1.3])); break; }
    case 5: { // the theory: the victim shot himself drawing the pistol while getting up off the floor — a blue reenactment figure
      K.preset('interior', { exposure: 1.15 }); court(f, { jury: 'shock', def: false }); const v = u(5);
      P(CV, { pos: add(COURT, [-1.8, 0, -2.4]), yaw: 0.7, expr: 'smug', arms: 'point', talk: 0.8 }, f);
      const rise = Math.min(1, Math.max(0, (v - 0.35) / 0.4)); P(G, { pos: add(COURT, [0.4, -0.4 * (1 - rise), -1.6]), yaw: -0.6, sit: rise < 0.5 ? 1 : 0, expr: 'scared', arms: 'reach', lean: 0.3 * (1 - rise) }, f);
      if (v > 0.78) { const t0 = K.ph[5].a + Math.round((K.ph[6].a - K.ph[5].a) * 0.78); K.grade.flash.value = Math.max(0, 0.6 - (f - t0) / 8); smokeAt(f, add(COURT, [0.4, 1.1, -1.4]), t0); }
      K.move(K.frame([add(COURT, [-1.8, 0, -2.4]), add(COURT, [0.4, 0, -1.6])], { yaw: 0.15, pitch: 0.08 }), K.frame([add(COURT, [-1.8, 0, -2.4]), add(COURT, [0.4, 0, -1.6])], { yaw: 0.05, pitch: 0.06, push: 0.88 }), v, 0.5, f); K.focusOn(add(COURT, [-0.7, 1.4, -2])); break; }
    case 6: { // in his hotel room, he wanted to show his colleagues how it happened
      K.preset('interior', { exposure: 1.1 }); P(CV, { pos: add(HOTEL, [0, 0, -1.2]), yaw: 0.9, expr: 'happy', arms: 'shrug', talk: 0.9 }, f); P(col1, { pos: add(HOTEL, [2.4, 0.15, 0.3]), yaw: -2.2, sit: 1, expr: 'neutral' }, f); P(col2, { pos: add(HOTEL, [3.4, 0.15, -0.7]), yaw: -1.6, sit: 1, expr: 'smug' }, f);
      K.move(K.frame([add(HOTEL, [0, 0, -1.2]), add(HOTEL, [2.4, 0, 0.3]), add(HOTEL, [3.4, 0, -0.7])], { yaw: 0.6, pitch: 0.1 }), K.frame([add(HOTEL, [0, 0, -1.2]), add(HOTEL, [2.4, 0, 0.3]), add(HOTEL, [3.4, 0, -0.7])], { yaw: 0.45, pitch: 0.08, push: 0.9 }), u(6), 0.4, f); K.focusOn(add(HOTEL, [1.5, 1.4, -0.6])); break; }
    case 7: { // took a pistol, sure it was unloaded: close on the revolver, smug
      K.preset('interior', { exposure: 1.1 }); P(CV, { pos: add(HOTEL, [0, 0, -1.2]), yaw: 0.6, expr: 'smug', arms: 'hold', look: [0.2, -0.2] }, f); CV.hold(gun, [0, -0.05, 0.12], [0, Math.PI / 2, 0]);
      K.move(K.frame([add(HOTEL, [0, 0, -1.2])], { yaw: 0.9, pitch: 0.02, h: 2.4, lookY: 1.4, push: 0.62 }), K.frame([add(HOTEL, [0, 0, -1.2])], { yaw: 0.8, pitch: 0.02, h: 2.4, lookY: 1.45, push: 0.55 }), u(7), 0.4, f); K.focusOn(add(HOTEL, [0, 1.5, -1.2])); break; }
    case 8: { // pocket, kneel... and get up, like the victim
      K.preset('interior', { exposure: 1.1 }); const v = u(8); const kneel = v > 0.3 && v < 0.75; P(CV, { pos: add(HOTEL, [0, kneel ? -0.4 : 0, -1.2]), yaw: 0.9, sit: kneel ? 1 : 0, expr: 'proud', arms: v < 0.3 ? 'hold' : 'down', talk: 0.5 }, f);
      P(col1, { pos: add(HOTEL, [2.4, 0.15, 0.3]), yaw: -2.2, sit: 1, expr: 'shock' }, f); P(col2, { pos: add(HOTEL, [3.4, 0.15, -0.7]), yaw: -1.6, sit: 1, expr: 'worried' }, f);
      K.move(K.frame([add(HOTEL, [0, 0, -1.2])], { yaw: 0.3, pitch: 0.08, h: 2.6, pad: 1.3 }), K.frame([add(HOTEL, [0, 0, -1.2])], { yaw: 0.2, pitch: 0.06, h: 2.6, pad: 1.2 }), v, 0.4, f); K.focusOn(add(HOTEL, [0.8, 1.3, -0.6])); break; }
    case 9: { // the pistol snagged on his clothes: close on the pocket tug
      K.preset('interior', { exposure: 1.1 }); P(CV, { pos: add(HOTEL, [0, 0, -1.2]), yaw: 0.9, expr: 'worried', arms: 'hold', tremble: 2, look: [0, -0.5] }, f); CV.hold(gun, [0, -0.05, 0.12], [0, Math.PI / 2, 0]);
      K.move({ p: add(HOTEL, [1.9, 1.4, 0.8]), l: add(HOTEL, [0.1, 1.15, -1.1]), fov: 34 }, { p: add(HOTEL, [1.6, 1.3, 0.4]), l: add(HOTEL, [0.1, 1.15, -1.1]), fov: 32 }, u(9), 1.5, f); K.focusOn(add(HOTEL, [0.2, 1.05, -1.0])); break; }
    case 10: { // ...and it fired: flash, smoke, shock (no gore)
      K.preset('interior', { exposure: 1.1 }); const a = f - K.ph[10].a + 4; K.grade.flash.value = Math.max(0, 1 - a / 6);
      P(CV, { pos: add(HOTEL, [0, 0, -1.2]), yaw: 0.9, expr: 'shock', arms: 'flail' }, f); P(col1, { pos: add(HOTEL, [2.4, 0.15, 0.3]), yaw: -2.2, sit: 1, expr: 'shock', arms: 'up' }, f); P(col2, { pos: add(HOTEL, [3.4, 0.15, -0.7]), yaw: -1.6, sit: 1, expr: 'scared', arms: 'up' }, f);
      smokeAt(f, add(HOTEL, [0.3, 1.0, -0.9]), K.ph[10].a - 4);
      K.move(K.frame([add(HOTEL, [0, 0, -1.2]), add(HOTEL, [2.4, 0, 0.3]), add(HOTEL, [3.4, 0, -0.7])], { yaw: 0.6, pitch: 0.1 }), {}, 0, 4, f); K.focusOn(add(HOTEL, [1.4, 1.4, -0.6])); break; }
    case 11: { // hit in the stomach; died the next day: the window goes from night to day, the bed is empty
      const v = u(11); K.preset(v < 0.5 ? 'night' : 'day', { exposure: 1.2 }); K.grade.sat.value = 0.6; hatC.visible = true; hatC.position.set(...add(HOTEL, [-2.2, 0.62, -2.4])); hatC.rotation.set(0, 0.3, 0);
      K.move({ p: add(HOTEL, [0.6, 1.8, 1.4]), l: add(HOTEL, [-2.6, 0.8, -2.8]), fov: 38 }, { p: add(HOTEL, [0.2, 1.6, 0.6]), l: add(HOTEL, [-2.6, 0.8, -2.8]), fov: 34 }, v, 0.2, f); K.focusOn(add(HOTEL, [-2.6, 0.8, -2.8])); break; }
    case 12: { // the irony: he proved his theory was possible — the jury nods
      K.preset('interior', { exposure: 1.1 }); court(f, { jury: 'shock', nod: true, judge: 'worried' });
      const JP = [0, 1, 2, 3, 4, 5].map((i) => add(COURT, [3.6 + (i % 3) * 1.1, 0, 1.4 + Math.floor(i / 3) * 1.2])); K.move(K.frame(JP, { yaw: -2.0, pitch: 0.12 }), K.frame(JP, { yaw: -2.1, pitch: 0.1, push: 0.9 }), u(12), 0.4, f); K.focusOn(add(COURT, [4.7, 1.5, 1.8])); break; }
    case 13: { // his client walked free: the defendant throws his arms up and leaves
      K.preset('interior', { exposure: 1.15 }); court(f, { def: false, gavel: true, judge: 'smug' }); const v = u(13);
      P(DEF, { pos: add(COURT, [-4.3 + v * 2.5, 0, -1.2 + v * 3]), yaw: 0.6, walk: t * 1.4, expr: 'laugh', arms: 'up' }, f);
      K.move(K.frame([add(COURT, [-3.3, 0, 0])], { yaw: 0.2, pitch: 0.06, h: 2.6, pad: 1.6 }), K.frame([add(COURT, [-2.5, 0, 0.6])], { yaw: 0.1, pitch: 0.06, h: 2.6, pad: 1.6 }), v, 0.5, f); K.focusOn(add(COURT, [-3, 1.6, 0.3])); break; }
    case 14: { // he won the case, lost everything else: the empty court, his hat on the chair
      K.preset('interior', { exposure: 0.95 }); K.grade.sat.value = 0.7; hatC.visible = true; hatC.position.set(...add(COURT, [-3.0, 0.92, -2.2])); hatC.rotation.set(0, 0.3, 0);
      K.move({ p: add(COURT, [0, 3, 6]), l: add(COURT, [-1.5, 1.0, -3]), fov: 40 }, { p: add(COURT, [-0.8, 2.2, 3.4]), l: add(COURT, [-2.6, 1.0, -2.2]), fov: 36 }, u(14), 0.2, f); K.focusOn(add(COURT, [-3.0, 1.0, -2.2])); break; }
    default: { // nobody plans their end: the street at dusk -> loops to the courtroom hook
      K.preset('dusk'); K.move({ p: add(ST, [0, 3, 12]), l: add(ST, [0, 3, -20]), fov: 42 }, { p: add(ST, [1, 2, 8]), l: add(ST, [1, 2, -10]), fov: 40 }, u(15), 0.3, f); K.focusOn(add(ST, [1, 2, -10]));
    }
  }
}
