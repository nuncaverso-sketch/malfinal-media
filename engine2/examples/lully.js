// VID-007 v2 — Jean-Baptiste Lully (1687): struck his own foot with his conducting staff, refused amputation, died of gangrene.
export let FRAMES = 1650;
let K, T, L, KING, D1, D2, MUS = [], CROWD = [], staff, staffFloor, footBand, parts = [], portrait;
const HALL = [0, 0, 0], BED = [200, 0, 0], SICK = [400, 0, 0], MEM = [600, 0, 0];
const add = (a, b) => a.map((x, i) => x + b[i]);

function marble(K) { return K.tex(512, 512, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#e9e2d4' : '#3a2f3a'; g.fillRect(x * 64, y * 64, 64, 64); } g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 512); g.moveTo(0, i * 64); g.lineTo(512, i * 64); g.stroke(); } }, [6, 8]); }
function wallpaper(K, base = '#7a1f2e') { return K.tex(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,210,120,0.22)'; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.beginPath(); g.ellipse(x * 64 + 32, y * 64 + 32, 10, 18, 0, 0, 7); g.fill(); } g.fillStyle = '#c9a24a'; g.fillRect(0, 0, w, 6); }, [6, 2]); }

async function room(o, w, d, h, wallTex, floorMat) {
  K.plane(w, d, floorMat, add(o, [0, 0.01, 0]));
  const wm = K.std(0xffffff, { map: wallTex, roughness: 0.85 });
  K.plane(w, h, wm, add(o, [0, h / 2, -d / 2]), [0, 0, 0]);
  K.plane(d, h, wm, add(o, [-w / 2, h / 2, 0]), [0, Math.PI / 2, 0]);
  K.plane(d, h, wm, add(o, [w / 2, h / 2, 0]), [0, -Math.PI / 2, 0]);
  K.plane(w, d, K.std(0x3a2418), add(o, [0, h, 0]), [Math.PI / 2, 0, 0]);
  // gold trim + skirting
  K.box(w, 0.35, 0.12, 0xc9a24a, add(o, [0, 0.17, -d / 2 + 0.06]), { metalness: 0.5, roughness: 0.35 });
  K.box(w, 0.25, 0.12, 0xc9a24a, add(o, [0, h - 0.6, -d / 2 + 0.06]), { metalness: 0.5, roughness: 0.35 });
}

export async function build(k) {
  K = k; await K.preloadEnvs(); T = await K.timing();
  FRAMES = Math.ceil(T.duration * 30) + 6;
  const C = K.makeChar;
  // ---------------- HALL ----------------
  const mf = K.std(0xffffff, { map: marble(K), roughness: 0.35, metalness: 0.05 });
  await room(HALL, 26, 34, 9, wallpaper(K), mf);
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const x = s * 12.4, z = 14 - i * 5.6; K.cyl(0.42, 0.42, 8.2, 0xece4d2, add(HALL, [x, 4.4, z]), { roughness: 0.45 }); K.box(1.2, 0.5, 1.2, 0xd8ccb2, add(HALL, [x, 0.25, z])); K.box(1.2, 0.4, 1.2, 0xc9a24a, add(HALL, [x, 8.6, z]), { metalness: 0.5, roughness: 0.35 }); }
  for (let i = 0; i < 3; i++) { const cz = 9 - i * 8; const ring = new K.THREE.Mesh(new K.THREE.TorusGeometry(1.1, 0.06, 8, 32), K.std(0xc9a24a, { metalness: 0.7, roughness: 0.3 })); ring.rotation.x = Math.PI / 2; ring.position.set(...add(HALL, [0, 7.0, cz])); K.scene.add(ring);
    K.cyl(0.02, 0.02, 2, 0x3a2a1a, add(HALL, [0, 8, cz])); for (let j = 0; j < 8; j++) { const a = j / 8 * Math.PI * 2; K.cyl(0.04, 0.04, 0.25, 0xf4ecd8, add(HALL, [Math.cos(a) * 1.1, 7.15, cz + Math.sin(a) * 1.1])); const fl = K.sph(0.045, 0xffc060, add(HALL, [Math.cos(a) * 1.1, 7.33, cz + Math.sin(a) * 1.1]), { emissive: 0xffa040, emissiveIntensity: 10 }); fl.scale.y = 1.7; } }
  K.pointLight(0xffc27a, 9, add(HALL, [0, 6, 0]), 22); K.pointLight(0xffc27a, 7, add(HALL, [0, 6, -12]), 22);
  for (const s of [-1, 1]) { await K.placeH('house_interior_pack/Curtains_Double', add(HALL, [s * 6, 0, -16.8]), 0, 8.5); }
  // stage + orchestra
  K.box(14, 0.5, 5, 0x6a3a22, add(HALL, [0, 0.25, -6.6]), { roughness: 0.6 });
  K.box(14.2, 0.06, 5.2, 0x8a1f2e, add(HALL, [0, 0.52, -6.6]));
  const coats = [0x2d4a8a, 0x6a2a6a, 0x2f6a4a, 0x8a5a2a, 0x3a3a5a, 0x7a2a2a];
  for (let i = 0; i < 6; i++) {
    const m = C(K.scene, { shirt: coats[i], buttons: 0xe8c45a, hat: 'wig', seed: i + 3 });
    const vio = new K.THREE.Group(); const body = K.box(0.18, 0.42, 0.08, 0x8a4a1e, [0, 0, 0], { parent: vio, roughness: 0.4 }); K.box(0.04, 0.3, 0.04, 0x2a1a10, [0, 0.33, 0], { parent: vio });
    m.hold(vio, [0, -0.1, 0.12], [0.3, 0, 0.2]); MUS.push(m);
  }
  // throne + king
  K.box(4, 0.6, 3, 0x8a1f2e, add(HALL, [-8, 0.3, 4]));
  K.box(1.4, 2.6, 0.3, 0xc9a24a, add(HALL, [-8, 1.9, 3.0]), { metalness: 0.6, roughness: 0.3 });
  K.box(1.3, 0.5, 1.1, 0x9a1a2a, add(HALL, [-8, 0.85, 3.6]));
  KING = C(K.scene, { shirt: 0xb81d2e, buttons: 0xf3c537, hat: 'crown', cape: 0x5a1a8a, seed: 9, mustache: true });
  for (let i = 0; i < 8; i++) CROWD.push(C(K.scene, { shirt: [0x3a5a9a, 0xa83a5a, 0x4a7a3a, 0x9a7a2a][i % 4], hat: i % 3 ? 'wig' : 'hair', hatColor: 0x6a4a2a, hair: 0x5a3418, seed: 20 + i }));
  L = C(K.scene, { shirt: 0x1f3f8f, buttons: 0xf3c537, belt: 0xc9a24a, hat: 'wig', seed: 1 });
  staff = new K.THREE.Group(); K.cyl(0.035, 0.03, 2.1, 0x5a3418, [0, -1.0, 0], { parent: staff, roughness: 0.5 }); K.sph(0.08, 0xf3c537, [0, 0.05, 0], { parent: staff, metalness: 0.7, roughness: 0.25 });
  L.hold(staff, [0, -0.02, 0.0], [0, 0, 0]);
  staffFloor = new K.THREE.Group(); K.cyl(0.035, 0.03, 2.1, 0x5a3418, [0, 1.05, 0], { parent: staffFloor }); K.sph(0.08, 0xf3c537, [0, 2.12, 0], { parent: staffFloor, metalness: 0.7, roughness: 0.25 }); staffFloor.position.set(...add(HALL, [0.6, 0, 2])); K.scene.add(staffFloor);
  footBand = K.sph(0.13, 0xffffff, [0, 0, 0], { roughness: 0.9 }); footBand.scale.set(1, 0.75, 1.4); L.legR.end.add(footBand); footBand.position.set(0, -0.03, 0.05); footBand.visible = false;
  // dust / impact particles
  for (let i = 0; i < 14; i++) { const p = K.sph(0.06 + (i % 3) * 0.03, 0xe8dcc0, [0, -10, 0], { roughness: 1 }); parts.push(p); }
  // ---------------- KING BEDROOM ----------------
  await room(BED, 12, 10, 6, wallpaper(K, '#2a3f6a'), K.std(0x6a4028, { roughness: 0.7 }));
  await K.placeH('house_interior_pack/Bed_King', add(BED, [0, 0, -2.6]), 0, 2.4, { byW: true });
  await K.placeH('house_interior_pack/Window_Large1', add(BED, [3.5, 1.4, -4.9]), 0, 2.8);
  await K.placeH('house_interior_pack/NightStand_1', add(BED, [-2.3, 0, -3.6]), 0, 0.9);
  await K.placeH('house_interior_pack/Carpet_1', add(BED, [0, 0.02, 0.5]), 0, 4.5, { byW: true });
  await K.placeH('house_interior_pack/Houseplant_3', add(BED, [4.8, 0, -3.8]), 0, 1.6);
  K.pointLight(0xffd7a0, 6, add(BED, [1, 4, 1]), 14);
  D1 = C(K.scene, { shirt: 0x1a1a22, hat: 'top', hatColor: 0x1a1a22, seed: 30, glasses: true });
  D2 = C(K.scene, { shirt: 0x2a2a30, hat: 'top', hatColor: 0x2a2a30, seed: 31, beard: '#4a3a2a' });
  // ---------------- SICKROOM ----------------
  await room(SICK, 10, 9, 5.5, wallpaper(K, '#3a3428'), K.std(0x4a3020, { roughness: 0.8 }));
  await K.placeH('house_interior_pack/Bed_Single', add(SICK, [0, 0, -2.4]), 0, 2.2, { byW: true });
  K.pointLight(0xffc890, 4, add(SICK, [0, 2.4, 1.2]), 9);
  await K.placeH('house_interior_pack/NightStand_2', add(SICK, [1.8, 0, -3.3]), 0, 0.8);
  await K.placeH('survival_pack/WoodenTorch_Fire', add(SICK, [1.8, 0.8, -3.3]), 0, 0.6);
  await K.placeH('house_interior_pack/Window_Small1', add(SICK, [-2.5, 2.0, -4.4]), 0, 1.4);
  K.pointLight(0xff9a4a, 7, add(SICK, [1.6, 1.8, -2.6]), 10);
  // ---------------- MEMORIAL ----------------
  await room(MEM, 10, 8, 6, wallpaper(K, '#1e1a22'), K.std(0x2a1e1a));
  const ptex = K.tex(256, 320, (g, w, h) => { g.fillStyle = '#3a2a1a'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8b090'; g.fillRect(20, 20, w - 40, h - 40); g.fillStyle = '#fbf8f2'; g.beginPath(); g.arc(128, 130, 60, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#16121a'; g.stroke(); g.fillStyle = '#f4f0e6'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(128 + s * 62, 110 + i * 34, 20, 0, 7); g.fill(); g.stroke(); } g.fillStyle = '#16121a'; g.beginPath(); g.arc(108, 128, 7, 0, 7); g.arc(148, 128, 7, 0, 7); g.fill(); g.fillStyle = '#1f3f8f'; g.fillRect(70, 200, 116, 90); });
  portrait = K.box(1.6, 2.0, 0.08, 0xffffff, add(MEM, [0, 2.6, -3.7]), { map: ptex, roughness: 0.6 });
  K.box(1.8, 2.2, 0.06, 0xc9a24a, add(MEM, [0, 2.6, -3.76]), { metalness: 0.6, roughness: 0.3 });
  K.box(0.5, 0.08, 0.02, 0x0a0a0a, add(MEM, [0.55, 3.45, -3.64]), {}).rotation.z = -0.7;
  for (const s of [-1, 1]) { K.cyl(0.08, 0.08, 1.2, 0xc9a24a, add(MEM, [s * 1.4, 0.6, -3.2]), { metalness: 0.6 }); K.cyl(0.05, 0.05, 0.3, 0xf4ecd8, add(MEM, [s * 1.4, 1.35, -3.2]));
    const fl = K.sph(0.05, 0xffb040, add(MEM, [s * 1.4, 1.56, -3.2]), { emissive: 0xffa030, emissiveIntensity: 8 }); fl.scale.y = 1.8; K.pointLight(0xff9a40, 3, add(MEM, [s * 1.4, 1.8, -2.8]), 8); }
  await K.placeH('nature_pack/Flowers', add(MEM, [0, 0, -3]), 0, 0.6);
}

const hideAll = () => { for (const c of [L, KING, D1, D2, ...MUS, ...CROWD]) c.root.visible = false; staffFloor.visible = false; for (const p of parts) p.position.y = -10; };
const P = (c, p, f) => K.poseChar(c, p, f);
// staff strike curve: 0 = on the floor, 1 = raised. period in frames
const strike = (f, per = 15) => { const u = (f % per) / per; return u < 0.55 ? Math.sin(u / 0.55 * Math.PI / 2) : 1 - Math.pow((u - 0.55) / 0.45, 2); };
function conduct(f, o = {}) { // Lully conducting with the staff in right hand; arm angle from strike curve
  const s = strike(f, o.per || 15);
  P(L, { pos: o.pos || add(HALL, [0, 0, 2]), yaw: o.yaw ?? Math.PI, expr: o.expr || 'angry', talk: 0, look: [0, -0.1], lean: 0.08 * (1 - s),
    armsOverride: (C) => { C.armR.a.rotation.set(-0.35 - s * 1.5, -0.2, -0.15); C.armR.b.rotation.set(-0.4 + s * 0.2, 0, 0); C.armL.a.rotation.set(-1.2 - 0.3 * s, 0.6, 0); C.armL.b.rotation.set(-0.5, 0, 0); } }, f);
  staff.rotation.set(1.9 - s * 0.6, 0, 0); return s;
}
function orchestra(f, on = true) {
  MUS.forEach((m, i) => { const x = -5 + i * 2, z = -5.6 - (i % 2) * 1.6; P(m, { pos: add(HALL, [x, 0.55, z]), yaw: 0, arms: 'hold', expr: i % 2 ? 'happy' : 'neutral', bounce: on ? 0.3 : 0, headTilt: on ? Math.sin(f * 0.2 + i) * 0.12 : 0 }, f);
    m.armL.a.rotation.set(-1.0, 0.5, 0); m.armL.b.rotation.set(-1.2 + (on ? Math.sin(f * 0.6 + i) * 0.5 : 0), 0, 0); });
}
function crowd(f, expr = 'happy', clap = true) {
  CROWD.forEach((c, i) => { const x = -6 + (i % 4) * 3.6 + (i > 3 ? 1.6 : 0), z = 6 + (i > 3 ? 3 : 0); P(c, { pos: add(HALL, [x, 0, z]), yaw: Math.PI + (x > 0 ? 0.2 : -0.2), expr, arms: clap ? 'reach' : 'down', talk: 0 }, f);
    if (clap) { const k = Math.abs(Math.sin(f * 0.5 + i)); c.armL.a.rotation.z = 0.15 + k * 0.4; c.armR.a.rotation.z = -0.15 - k * 0.4; } });
}
function dust(f, center, t0) { const age = (f - t0) / 30; parts.forEach((p, i) => { const a = i / parts.length * Math.PI * 2; const r = age * (1.2 + (i % 3) * 0.4); p.position.set(center[0] + Math.cos(a) * r, center[1] + 0.05 + Math.sin(age * 3) * 0.2 * (i % 2) + age * 0.3, center[2] + Math.sin(a) * r); p.scale.setScalar(Math.max(0.01, 1 - age * 1.4)); }); }

export function frame(f, k) {
  hideAll(); const ph = K.at(f), t = f / 30; const u = (i, j) => K.u(f, i, j);
  K.lens.aperture.value = 0.45; K.shadowSpan = 12;
  L.root.visible = true; staff.visible = true; footBand.visible = ph >= 9 && ph <= 13; footBand.material.color.set(ph >= 13 ? 0x5a7a2a : ph >= 9 ? 0xd8e6b0 : 0xffffff);
  switch (ph) {
    case 0: { // HOOK: bang bang... BANG on his own foot
      K.preset('interior'); orchestra(f); const s = conduct(f, { per: 13, expr: 'angry' });
      if (f > 40) { L.armR.a.rotation.x = -0.25; staff.rotation.x = 1.75; P(L, { pos: add(HALL, [0, 0, 2]), yaw: Math.PI, expr: 'shock', tremble: 2, armsOverride: (C) => { C.armR.a.rotation.set(-0.3, -0.2, -0.15); C.armL.a.rotation.set(-2.6, 0.5, 0); } }, f); K.grade.flash.value = Math.max(0, 1 - (f - 41) / 6) * 0.8; dust(f, add(HALL, [-0.1, 0, 2.3]), 41); }
      else if (s < 0.08) dust(f, add(HALL, [-0.1, 0, 2.6]), f - 1);
      K.move(K.frame([add(HALL, [0, 0, 2])], { yaw: Math.PI - 0.45, pitch: -0.02, h: 2.6, lookY: 1.2 }), K.frame([add(HALL, [0, 0, 2])], { yaw: Math.PI - 0.3, pitch: -0.05, h: 2.6, lookY: 1.0, push: 0.8 }), f / 55, 1.5, f);
      K.focusOn(add(HALL, [0, 1.2, 2])); break; }
    case 1: { // the king's favourite composer: Lully bows, the king applauds
      K.preset('interior'); orchestra(f); crowd(f);
      P(KING, { pos: add(HALL, [-8, 0.6, 3.6]), yaw: 0.9, expr: 'happy', arms: 'reach', talk: 0 }, f); KING.root.visible = true;
      KING.armL.a.rotation.z = 0.2 + Math.abs(Math.sin(f * 0.5)) * 0.4; KING.armR.a.rotation.z = -0.2 - Math.abs(Math.sin(f * 0.5)) * 0.4;
      const bow = Math.min(1, Math.max(0, (f - K.ph[1].a - 40) / 20)) * (1 - Math.min(1, Math.max(0, (f - K.ph[1].a - 120) / 20)));
      P(L, { pos: add(HALL, [-3.5, 0, 3]), yaw: -1.2, expr: 'proud', lean: bow * 0.9, arms: 'wave' }, f); staff.rotation.set(1.6, 0, 0);
      K.move(K.frame([add(HALL, [-3.5, 0, 3]), add(HALL, [-8, 0.6, 3.6])], { yaw: 0.35, pitch: 0.15, h: 2.9, pad: 1.1 }), K.frame([add(HALL, [-3.5, 0, 3]), add(HALL, [-8, 0.6, 3.6])], { yaw: 0.2, pitch: 0.1, h: 2.9, pad: 1.0, push: 0.92 }), u(1), 0.6, f);
      K.focusOn(add(HALL, [-5.5, 1.8, 3.4])); break; }
    case 2: { // 1687: the king recovered from an operation
      K.preset('interior'); L.root.visible = false; staff.visible = false; KING.root.visible = true; D1.root.visible = D2.root.visible = true;
      P(KING, { pos: add(BED, [0, 0.55, -2.5]), yaw: 0, sit: 1, expr: 'happy', arms: 'up', talk: 0.6 }, f);
      P(D1, { pos: add(BED, [-1.25, 0, -1.0]), yaw: 0.7, expr: 'happy', arms: 'akimbo' }, f); P(D2, { pos: add(BED, [1.25, 0, -0.9]), yaw: -0.7, expr: 'proud', arms: 'reach' }, f);
      K.move(K.frame([add(BED, [0, 0.3, -2.5]), add(BED, [-1.25, 0, -1.0]), add(BED, [1.25, 0, -0.9])], { yaw: 0.15, pitch: 0.18 }), K.frame([add(BED, [0, 0.3, -2.5]), add(BED, [-1.25, 0, -1.0]), add(BED, [1.25, 0, -0.9])], { yaw: 0, pitch: 0.12, push: 0.92 }), u(2), 0.5, f);
      K.focusOn(add(BED, [0, 1.6, -2.4])); break; }
    case 3: { // a huge concert to celebrate
      K.preset('interior', { exposure: 1.15 }); orchestra(f); crowd(f); KING.root.visible = true; P(KING, { pos: add(HALL, [-8, 0.6, 3.6]), yaw: 0.9, expr: 'happy', arms: 'down' }, f);
      conduct(f, { pos: add(HALL, [0, 0.55, -4.4]), yaw: Math.PI, expr: 'happy' });
      K.move({ p: add(HALL, [0, 8.5, 16]), l: add(HALL, [0, 1.5, -3]), fov: 42 }, { p: add(HALL, [0, 6.0, 12]), l: add(HALL, [0, 1.6, -5]), fov: 40 }, u(3), 0.4, f);
      K.focusOn(add(HALL, [0, 1.6, -5])); K.lens.aperture.value = 0.2; break; }
    case 4: { // no baton back then: close on the long staff
      K.preset('interior'); orchestra(f, false);
      P(L, { pos: add(HALL, [0, 0, 2]), yaw: Math.PI * 0.85, expr: 'smug', look: [0.3, -0.25], armsOverride: (C) => { C.armR.a.rotation.set(-1.0, -0.1, 0); C.armR.b.rotation.set(-0.6, 0, 0); } }, f); staff.rotation.set(0.9, 0, 0);
      K.move(K.frame([add(HALL, [0, 0, 2])], { yaw: Math.PI - 0.4, pitch: 0.05, h: 2.4, lookY: 1.25, push: 0.75 }), K.frame([add(HALL, [0, 0, 2])], { yaw: Math.PI - 0.3, pitch: 0.05, h: 2.4, lookY: 1.3, push: 0.62 }), u(4), 0.4, f);
      K.focusOn(add(HALL, [-0.3, 1.6, 2.2])); break; }
    case 5: { // struck the floor with a long heavy staff: low floor close, dust on every hit
      K.preset('interior'); orchestra(f); const s = conduct(f, { per: 18, expr: 'neutral' }); const t0 = f - (f % 18) + 10; if (f >= t0) dust(f, add(HALL, [-0.15, 0, 1.4]), t0);
      K.move(K.frame([add(HALL, [0, 0, 2])], { yaw: Math.PI - 1.25, pitch: 0.0, h: 2.6, lookY: 1.0 }), K.frame([add(HALL, [0, 0, 2])], { yaw: Math.PI - 1.15, pitch: -0.03, h: 2.6, lookY: 0.9, push: 0.85 }), u(5), 0.6, f);
      K.focusOn(add(HALL, [-0.1, 0.4, 2.4])); if (s < 0.06) K.grade.flash.value = 0.08; break; }
    case 6: { // Lully conducted with everything: bang bang bang (camera kicks on the beats)
      K.preset('interior', { exposure: 1.12 }); orchestra(f); crowd(f, 'shock', false); const s = conduct(f, { per: 10, expr: 'angry' });
      const kick = s < 0.15 ? (0.15 - s) * 0.5 : 0; const A6 = K.frame([add(HALL, [0, 0, 2])], { yaw: Math.PI + 0.2, pitch: 0.02, h: 2.6, push: 0.85 - kick }), B6 = K.frame([add(HALL, [0, 0, 2])], { yaw: Math.PI - 0.15, pitch: 0.02, h: 2.6, push: 0.7 - kick });
      K.move(A6, B6, u(6), 2.5, f);
      K.focusOn(add(HALL, [0, 1.7, 2])); break; }
    case 7: { // until one blow missed the floor... slow descent, close on the foot
      K.preset('interior', { exposure: 1.0 }); orchestra(f, false); const v = u(7); const s = 1 - K.ease(v);
      P(L, { pos: add(HALL, [0, 0, 2]), yaw: Math.PI, expr: 'angry', armsOverride: (C) => { C.armR.a.rotation.set(-0.35 - s * 1.5, -0.2, -0.15); C.armR.b.rotation.set(-0.4 + s * 0.2, 0, 0); C.armL.a.rotation.set(-1.4, 0.6, 0); } }, f); staff.rotation.set(1.9 - s * 0.6 - v * 0.15, 0.1 * v, 0);
      K.move(K.frame([add(HALL, [0, 0, 2])], { yaw: Math.PI - 0.6, pitch: 0.0, h: 2.6, lookY: 0.9, push: 0.8 }), K.frame([add(HALL, [0, 0, 2])], { yaw: Math.PI - 0.5, pitch: -0.05, h: 2.6, lookY: 0.45, push: 0.5 }), v, 0.3, f);
      K.focusOn(add(HALL, [-0.05, 0.15, 1.9])); K.grade.vig.value = 0.28 + v * 0.25; break; }
    case 8: { // ...it hit his own foot! flash, hop, stars
      K.preset('interior'); orchestra(f, false); crowd(f, 'shock', false); const a = f - K.ph[8].a + 4; K.grade.flash.value = Math.max(0, 1 - a / 5) * 0.9;
      const hop = Math.abs(Math.sin(a * 0.35)) * 0.35;
      P(L, { pos: add(HALL, [0, hop, 2]), yaw: Math.PI + Math.sin(a * 0.2) * 0.4, expr: 'shock', arms: 'flail', sweat: true }, f); L.legR.a.rotation.x = -1.2; L.legR.b.rotation.x = 1.4; staff.visible = false; staffFloor.visible = true; staffFloor.rotation.set(0, 0, Math.min(1.5, a * 0.08));
      dust(f, add(HALL, [0, 0.3, 2.2]), K.ph[8].a - 4);
      K.move(K.frame([add(HALL, [0, 0, 2])], { yaw: Math.PI + 0.3, h: 2.8 }), K.frame([add(HALL, [0, 0, 2])], { yaw: Math.PI + 0.25, h: 2.8, push: 0.9 }), u(8), 3, f);
      K.focusOn(add(HALL, [0, 1.6, 2])); K.grade.vig.value = 0.28; break; }
    case 9: { // infected, gangrene: in bed, foot bandaged going green
      K.preset('candle', { exposure: 1.25 }); staff.visible = false;
      P(L, { pos: add(SICK, [0, 0.55, -2.2]), yaw: 0, sit: 1, expr: 'worried', look: [0, -0.4], sweat: true }, f);
      L.legR.a.rotation.x = -1.45; L.legL.a.rotation.x = -1.45; footBand.material.color.lerpColors(new K.THREE.Color(0xffffff), new K.THREE.Color(0x7aa83a), K.ease(u(9)));
      K.move(K.frame([add(SICK, [0, 0.3, -2.0])], { yaw: 0.45, pitch: 0.2, h: 2.0 }), K.frame([add(SICK, [0, 0.3, -1.9])], { yaw: 0.3, pitch: 0.18, h: 2.0, lookY: 0.75, push: 0.85 }), u(9), 0.4, f);
      K.focusOn(add(SICK, [0.1, 0.65, -1.4])); break; }
    case 10: { // the doctors: we have to cut the toe
      K.preset('candle', { exposure: 1.25 }); staff.visible = false; D1.root.visible = D2.root.visible = true;
      P(L, { pos: add(SICK, [0, 0.55, -2.2]), yaw: 0, sit: 1, expr: 'scared', look: [0.4, 0] }, f); L.legR.a.rotation.x = -1.45; L.legL.a.rotation.x = -1.45;
      const saw = new K.THREE.Group(); if (!D1.sawSet) { K.box(0.5, 0.12, 0.02, 0xb8c0c8, [0, -0.1, 0.25], { parent: saw, metalness: 0.8, roughness: 0.25 }); K.box(0.12, 0.14, 0.05, 0x6a3a1a, [0, -0.1, 0], { parent: saw }); D1.hold(saw, [0, -0.04, 0.04], [0, 0, 0]); D1.sawSet = 1; }
      P(D1, { pos: add(SICK, [1.15, 0, -1.0]), yaw: -1.2, expr: 'smug', arms: 'hold', talk: 1 }, f); P(D2, { pos: add(SICK, [-1.15, 0, -1.1]), yaw: 1.2, expr: 'neutral', arms: 'cross' }, f);
      K.move(K.frame([add(SICK, [0, 0.3, -2.2]), add(SICK, [1.15, 0, -1.0]), add(SICK, [-1.15, 0, -1.1])], { yaw: 0.1, pitch: 0.15 }), K.frame([add(SICK, [0, 0.3, -2.2]), add(SICK, [1.15, 0, -1.0]), add(SICK, [-1.15, 0, -1.1])], { yaw: -0.05, pitch: 0.12, push: 0.92 }), u(10), 0.5, f);
      K.focusOn(add(SICK, [0, 1.3, -1.6])); break; }
    case 11: { // he refused
      K.preset('candle', { exposure: 1.25 }); staff.visible = false; D1.root.visible = true;
      P(L, { pos: add(SICK, [0, 0.55, -2.2]), yaw: 0, sit: 1, expr: 'angry', arms: 'cross', look: [Math.sin(f * 0.6) * 0.5, 0] }, f); L.legR.a.rotation.x = -1.45; L.legL.a.rotation.x = -1.45;
      P(D1, { pos: add(SICK, [1.15, 0, -1.0]), yaw: -1.2, expr: 'shock', arms: 'hold' }, f);
      K.move(K.frame([add(SICK, [0, 0.55, -2.2])], { yaw: -0.15, pitch: 0.02, h: 2.0, lookY: 1.4, push: 0.6 }), K.frame([add(SICK, [0, 0.55, -2.2])], { yaw: -0.1, pitch: 0.02, h: 2.0, lookY: 1.45, push: 0.52 }), u(11), 0.6, f);
      K.focusOn(add(SICK, [0, 2.0, -2.2])); break; }
    case 12: { // they say he didn't want to stop dancing — dream dance in the hall, warm
      K.preset('golden', { exposure: 1.15, fog: [0xf5c9a8, 15, 120] }); staff.visible = false; orchestra(f);
      P(L, { pos: add(HALL, [Math.sin(t * 2) * 0.5, Math.abs(Math.sin(t * 6)) * 0.12, 1.5 + Math.cos(t * 2) * 0.3]), yaw: Math.sin(t * 3) * 1.2, expr: 'laugh', talk: 0.6, arms: 'up', walk: t * 1.6, blush: true }, f);
      K.move(K.frame([add(HALL, [0, 0, 1.5])], { yaw: 0.45, pitch: 0.08, h: 2.6, pad: 1.4 }), K.frame([add(HALL, [0, 0, 1.5])], { yaw: -0.45, pitch: 0.08, h: 2.6, pad: 1.4 }), u(12), 0.5, f);
      K.focusOn(add(HALL, [0, 1.4, 1.5])); K.grade.sat.value = 1.3; break; }
    case 13: { // the gangrene kept spreading
      K.preset('candle', { exposure: 1.15 }); staff.visible = false; K.grade.sat.value = 0.9;
      P(L, { pos: add(SICK, [0, 0.4, -2.2]), yaw: 0, sit: 1, expr: 'tired', lean: -0.3, look: [0, 0.2] }, f); L.legR.a.rotation.x = -1.45; L.legL.a.rotation.x = -1.45;
      footBand.material.color.set(0x3a5a1a);
      K.move(K.frame([add(SICK, [0, 0.3, -2.0])], { yaw: -0.45, pitch: 0.18, h: 2.0 }), K.frame([add(SICK, [0, 0.3, -1.9])], { yaw: -0.3, pitch: 0.15, h: 2.0, lookY: 0.75, push: 0.85 }), u(13), 0.3, f);
      K.focusOn(add(SICK, [0.1, 0.65, -1.5])); break; }
    case 14: { // weeks later the king's composer was dead: memorial, the king sad
      K.preset('candle', { exposure: 1.2 }); L.root.visible = false; staff.visible = false; KING.root.visible = true; K.grade.sat.value = 0.85;
      P(KING, { pos: add(MEM, [1.6, 0, -1.4]), yaw: -0.6, expr: 'sad', arms: 'down', look: [0, 0.2], lean: 0.1 }, f);
      K.move(K.frame([add(MEM, [0, 1.3, -3.6]), add(MEM, [1.6, 0, -1.4])], { yaw: -0.2, pitch: 0.05, h: 3.2 }), K.frame([add(MEM, [0, 1.3, -3.6]), add(MEM, [1.6, 0, -1.4])], { yaw: -0.1, pitch: 0.05, h: 3.2, push: 0.9 }), u(14), 0.3, f);
      K.focusOn(add(MEM, [0, 2.5, -3.6])); break; }
    case 15: { // killed by his own rhythm: the staff tips over in the empty hall
      K.preset('interior', { exposure: 0.95, hemiI: 0.5 }); L.root.visible = false; staff.visible = false; staffFloor.visible = true; K.grade.sat.value = 0.8;
      const v = K.ease(u(15)); staffFloor.position.set(...add(HALL, [0, 0, 2])); staffFloor.rotation.set(0, 0.4, -v * 1.5);
      if (v > 0.98) K.grade.flash.value = 0.05;
      K.move({ p: add(HALL, [2.6, 1.0, 5.2]), l: add(HALL, [0, 1.1, 2]), fov: 34 }, { p: add(HALL, [2.2, 0.7, 4.6]), l: add(HALL, [-0.4, 0.5, 2]), fov: 32 }, u(15), 0.3, f);
      K.focusOn(add(HALL, [0, 0.8, 2])); break; }
    default: { // nobody plans their end — empty hall, slow push back toward the hook framing (loop)
      K.preset('interior', { exposure: 1.0 }); L.root.visible = false; staff.visible = false; staffFloor.visible = true; staffFloor.position.set(...add(HALL, [0, 0, 2])); staffFloor.rotation.set(0, 0.4, -1.5);
      orchestra(f, false); MUS.forEach((m) => { m.root.visible = false; });
      K.move({ p: add(HALL, [0, 6, 14]), l: add(HALL, [0, 1.2, 0]), fov: 40 }, { p: add(HALL, [1.2, 1.4, 6]), l: add(HALL, [0, 0.6, 2]), fov: 36 }, u(16), 0.3, f);
      K.focusOn(add(HALL, [0, 0.6, 2])); K.grade.black.value = Math.max(0, (f - (FRAMES - 12)) / 12) * 0.6;
    }
  }
}
