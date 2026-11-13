// VID-015 — H. L. Hunley (Charleston, 1863-64): his hand-cranked submarine had already sunk once (5 dead); he took command himself and sank with 7 crew;
// raised again, named after him, it became the first sub to sink a warship (Housatonic, 1864)... and sank a third time that night. No gore: hats float, bubbles, a candle goes out.
export let FRAMES = 2000;
let ship2, fball, metros, fgDock, K, T, HU, crew = [], sailors = [], subH, subD, subN, toy, hats = [], bubbles = [], waters = [], crane, rope, cranePosts, paint = [], ship, hatchLidH, candleFl, candleL, crank, glow = [], spray = [], nameSign, flashL;
const HARB = [0, 0, 0], OFF = [200, 0, 0], INS = [400, 0, 0], DEEP = [600, 0, 0], NSEA = [800, 0, 0];
const add = (a, b) => a.map((x, i) => x + b[i]);
const P = (c, p, f) => K.poseChar(c, p, f);
const HL = (e = 1) => K.preset('golden', { sunDir: [0.35, 0.55, 0.75], sunI: 3.4, hemiI: 1.15, exposure: 1.22 * e, rimI: 1.2 });
const NL = () => K.preset('night', { sunDir: [0.3, 0.6, 0.8], sunI: 2.2, hemiI: 1.0, exposure: 1.45 });

function makeSub(o = {}) { // ~9 m iron tube, two hatch towers, rudder, propeller; hatch lid hinged
  const THREE = K.THREE, g = new THREE.Group(); const iron = o.col || 0x5a6a74;
  const body = K.cyl(0.8, 0.8, 7.2, iron, [0, 0, 0], { parent: g, seg: 28 }); body.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) { const n = K.sph(0.8, iron, [s * 3.6, 0, 0], { parent: g }); n.scale.set(1.6, 1, 1); }
  for (let i = -3; i <= 3; i++) { const r = K.cyl(0.82, 0.82, 0.06, 0x2a3036, [i * 1.1, 0, 0], { parent: g, seg: 28 }); r.rotation.z = Math.PI / 2; } // rivet bands
  const towers = []; for (const x of [-1.6, 2.0]) { const t = K.cyl(0.36, 0.42, 0.55, iron, [x, 0.95, 0], { parent: g }); towers.push(t); for (let k = 0; k < 4; k++) K.sph(0.07, 0xffc870, [x + Math.cos(k * 1.57) * 0.38, 1.05, Math.sin(k * 1.57) * 0.38], { parent: g, emissive: 0xffa040, emissiveIntensity: 0 }); }
  const lid = new THREE.Group(); K.cyl(0.38, 0.38, 0.08, 0x2a3036, [0.38, 0, 0], { parent: lid }); lid.position.set(-1.98, 1.24, 0); g.add(lid);
  K.box(0.08, 1.0, 0.7, iron, [-5.0, 0.1, 0], { parent: g }); // rudder
  const prop = new THREE.Group(); for (let k = 0; k < 3; k++) { const b = K.box(0.06, 0.7, 0.18, 0xb08a3a, [0, 0.3, 0], { parent: prop, metalness: 0.6 }); b.geometry.translate(0, 0, 0); prop.add(b); b.rotation.x = 0; const pv = new THREE.Group(); pv.rotation.x = k * 2.09; pv.add(b); prop.add(pv); }
  prop.position.set(-4.8, 0, 0); g.add(prop);
  if (o.spar) { const sp = K.cyl(0.05, 0.05, 5, 0x6a4a2a, [6.0, -0.3, 0], { parent: g }); sp.rotation.z = Math.PI / 2 - 0.12; K.cyl(0.18, 0.18, 0.5, 0x1a1a1a, [8.5, -0.6, 0], { parent: g }).rotation.z = Math.PI / 2; }
  g.userData = { lid, prop, towers, lamps: g.children.filter((c) => c.material && c.material.emissive && c.material.emissive.getHex() === 0xffa040) };
  K.scene.add(g); return g;
}
function water(c, size, col, o = {}) { // animated stylised water: striped texture scrolling + a darker underside
  const tx = K.tex(256, 256, (g, w, h) => { g.fillStyle = o.base || '#2a8aa6'; g.fillRect(0, 0, w, h); g.strokeStyle = o.line || 'rgba(190,240,255,0.55)'; g.lineWidth = 5; for (let i = 0; i < 9; i++) { g.beginPath(); const y = i * 29 + 10; g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x / 20 + i) * 5); g.stroke(); } }, [size / 6, size / 6]);
  const m = K.plane(size, size, K.std(0xffffff, { map: tx, transparent: !!o.alpha, opacity: o.alpha || 1 }), add(c, [0, 0, 0])); waters.push(tx); return m;
}
function bowler(col = 0x1a1a1a) { const g = new K.THREE.Group(); K.cyl(0.22, 0.26, 0.24, col, [0, 0.14, 0], { parent: g }); K.cyl(0.38, 0.38, 0.04, col, [0, 0.02, 0], { parent: g }); const b = K.cyl(0.265, 0.265, 0.05, 0x8a2a2a, [0, 0.08, 0], { parent: g }); K.scene.add(g); return g; }

async function harbor() {
  water(HARB, 300);
  // dock behind the sub (z=-4), planks + posts
  const plank = K.tex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#7a5634' : '#8a6440'; g.fillRect(i * 32, 0, 31, h); } }, [6, 1]);
  K.box(34, 0.25, 5, 0xffffff, add(HARB, [0, 0.9, -5.5]), { map: plank });
  for (let x = -16; x <= 16; x += 2.4) K.cyl(0.16, 0.16, 2.2, 0x4a3420, add(HARB, [x, 0, -3.1]));
  for (const [x, n, h] of [[-9, 'survival_pack/Barrel', 1.0], [-8.2, 'survival_pack/Barrel', 1.0], [7, 'cute_fish_pack/Crate', 1.0]]) await K.placeH(n.includes('Crate') ? 'survival_pack/Crate' : n, add(HARB, [x, 1.02, -4.2]), x, h).catch(() => {});
  // Charleston waterfront behind: coloured row houses (boxes with windows)
  const cols = [0xd88a6a, 0xe8d0a0, 0x8ab0c8, 0xc8a0c8, 0xe8b070, 0xa8c890, 0xd8b8a0];
  const win = K.tex(128, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a3a4a'; for (let y = 0; y < 3; y++) for (let x = 0; x < 2; x++) g.fillRect(18 + x * 56, 30 + y * 76, 36, 50); g.fillStyle = '#ffd890'; g.fillRect(18, 30, 36, 50); });
  for (let i = 0; i < 9; i++) { const h = 6 + (i % 3) * 1.6; K.box(4.2, h, 4, cols[i % 7], add(HARB, [-19 + i * 4.6, h / 2 + 0.9, -10.5]), { map: win }); K.box(4.6, 0.4, 4.4, 0x5a3a2a, add(HARB, [-19 + i * 4.6, h + 1.1, -10.5])); }
  K.sign('CHARLESTON · 1863', add(HARB, [3.5, 4.2, -8.3]), { w: 5.2, h: 1.1, bg: '#1e4a5a' });
  
  metros = K.sign('12 METROS', add(HARB, [1.0, 2.3, 1.0]), { w: 2.4, h: 0.7, bg: '#1e4a5a' }); metros.visible = false;
  // moored sailing ship to the left
  ship = await K.placeH('ships_pack/Sail_ship', add(HARB, [-13, -0.6, -2.0]), Math.PI / 2, 11);
  // crane (two posts + beam + rope) over the sub, only visible in shot 8
  ship2 = await K.placeH('ships_pack/Sail_ship', add(HARB, [-5.5, -0.6, -7.2]), Math.PI / 2, 9); ship2.visible = false;
  crane = new K.THREE.Group(); for (const s of [-1, 1]) K.box(0.4, 9, 0.4, 0x5a3a24, [s * 3.2, 4.5, -2.6], { parent: crane }); K.box(7.2, 0.45, 0.45, 0x5a3a24, [0, 9, -2.6], { parent: crane }); K.box(0.5, 0.5, 3.0, 0x5a3a24, [0, 9, -1.2], { parent: crane });
  rope = K.cyl(0.04, 0.04, 1, 0xc8b080, [0, 0, 0], { parent: crane }); crane.position.set(...HARB); K.scene.add(crane);
  fgDock = K.box(8, 0.2, 3, 0x6a4a30, add(HARB, [0, 0.95, 6.8])); fgDock.visible = false;
  for (let i = 0; i < 5; i++) hats.push(bowler([0x8a5a2a, 0xb08a5a, 0x6a6a72, 0xa04a2a, 0xd8c8a0][i]));
  for (let i = 0; i < 26; i++) bubbles.push(K.sph(0.09 + (i % 4) * 0.04, 0xd8f4ff, [0, -99, 0], { emissive: 0x6ac8ff, emissiveIntensity: 0.4 }));
  for (let i = 0; i < 18; i++) spray.push(K.sph(0.07, 0x8ad8f0, [0, -99, 0], { emissive: 0x3aa8d8, emissiveIntensity: 0.5 }));
  for (let i = 0; i < 6; i++) K.cloud(add(HARB, [-80 + i * 32, 38 + (i % 3) * 6, -150]), 7, 0xffd8c8);
  subH = makeSub(); subH.position.set(...add(HARB, [0, 0.15, 0]));
  hatchLidH = subH.userData.lid; { const ys = K.sign('YA SE HUNDIÓ', [0, 0, 0], { w: 2.0, h: 0.55, bg: '#8a1f2e' }); K.scene.remove(ys); ys.position.set(-1.7, 0.36, 0.84); ys.rotation.x = -0.3; subH.add(ys); }
  // name plate painted on the hull (shot 14), built letter by letter as separate signs
  nameSign = K.sign('H. L. HUNLEY', add(HARB, [0.4, 0.45, 0.82]), { w: 3.2, h: 0.62, bg: '#2a3036', fg: '#ffffff', border: '#c9a24a' }); nameSign.visible = false;
}
async function office() {
  const wood = K.tex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#5a3a24' : '#6a4630'; g.fillRect(0, i * 32, w, 31); } }, [6, 6]);
  K.plane(16, 14, K.std(0xffffff, { map: wood }), add(OFF, [0, 0.01, 0]));
  const wp = K.tex(256, 256, (g, w, h) => { g.fillStyle = '#2a5a6a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.12)'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 12, h); }, [6, 2]);
  K.plane(16, 7, K.std(0xffffff, { map: wp }), add(OFF, [0, 3.5, -6]), [0, 0, 0]); K.plane(14, 7, K.std(0xffffff, { map: wp }), add(OFF, [-8, 3.5, 0]), [0, Math.PI / 2, 0]);
  const bp = K.tex(1024, 512, (g, w, h) => { g.fillStyle = '#1a4a8a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8f4ff'; g.lineWidth = 6; g.beginPath(); g.ellipse(w / 2, h / 2, 380, 90, 0, 0, 6.28); g.stroke(); g.strokeRect(w / 2 - 160, h / 2 - 150, 70, 60); g.strokeRect(w / 2 + 120, h / 2 - 150, 70, 60);
    g.lineWidth = 3; for (let x = -300; x <= 300; x += 60) { g.beginPath(); g.moveTo(w / 2 + x, h / 2 - 80); g.lineTo(w / 2 + x, h / 2 + 80); g.stroke(); } g.font = '900 54px Poppins, sans-serif'; g.fillStyle = '#e8f4ff'; g.fillText('SUBMARINO', 40, 70); g.fillText('12 m', w - 200, h - 40); });
  K.plane(4.6, 2.3, new K.THREE.MeshBasicMaterial({ map: bp }), add(OFF, [0.4, 3.6, -5.95]), [0, 0, 0]);
  K.sign('NO ES MARINO', add(OFF, [1.6, 1.9, -5.9]), { w: 2.4, h: 0.7, bg: '#8a1f2e' });
  await K.placeH('house_interior_pack/Bookcase_Books', add(OFF, [-5, 0, -5.4]), 0, 3.2).catch(() => {});
  await K.placeH('modular_dungeon_1/Table_Big', add(OFF, [0.6, 0, -2.4]), 0, 3.4, { byW: true }).catch(() => {});
  await K.placeH('rpg_items_pack/Scroll', add(OFF, [0.2, 1.05, -2.2]), 0.3, 0.5, { byW: true }).catch(() => {});
  await K.placeH('house_interior_pack/Light_Desk', add(OFF, [1.6, 1.05, -2.6]), 0.4, 0.8).catch(() => {});
  K.pointLight(0xffc880, 4, add(OFF, [1.5, 2.6, -1.6]), 10);
  // toy sub he holds up
  toy = new K.THREE.Group(); const tb = K.cyl(0.11, 0.11, 0.6, 0xf3c537, [0, 0, 0], { parent: toy }); tb.rotation.z = Math.PI / 2; for (const s of [-1, 1]) { const n = K.sph(0.11, 0xf3c537, [s * 0.3, 0, 0], { parent: toy }); n.scale.set(1.5, 1, 1); } K.cyl(0.06, 0.07, 0.14, 0xd8a020, [-0.08, 0.15, 0], { parent: toy }); for (let k = 0; k < 3; k++) { const bl = K.box(0.02, 0.16, 0.05, 0x8a8a90, [-0.48, 0, 0], { parent: toy }); bl.rotation.x = k * 2.09; } K.box(0.02, 0.18, 0.12, 0xd8a020, [-0.44, 0, 0], { parent: toy }); toy.scale.setScalar(0.6); K.scene.add(toy);
  for (let i = 0; i < 8; i++) glow.push(K.sph(0.04, 0xfff0a0, [0, -99, 0], { emissive: 0xffe060, emissiveIntensity: 2 }));
}
async function inside() { // cutaway iron tube: back half only, so the camera on +z never sits inside geometry
  const THREE = K.THREE; const g = new THREE.CylinderGeometry(1.75, 1.75, 13, 32, 1, true, Math.PI / 2, Math.PI);
  const riv = K.tex(256, 256, (c, w, h) => { c.fillStyle = '#4a5258'; c.fillRect(0, 0, w, h); c.fillStyle = '#2e3438'; for (let y = 16; y < h; y += 64) for (let x = 8; x < w; x += 32) { c.beginPath(); c.arc(x, y, 6, 0, 6.28); c.fill(); } c.fillRect(0, 60, w, 6); }, [6, 2]);
  const tube = new THREE.Mesh(g, K.std(0xffffff, { map: riv, side: THREE.DoubleSide })); tube.rotation.z = Math.PI / 2; tube.position.set(...add(INS, [0, 1.75, 0])); tube.receiveShadow = true; K.scene.add(tube);
  K.box(13, 0.1, 2.0, 0x3a2a1e, add(INS, [0, 0.35, -0.4]));
  crank = new THREE.Group(); const sh = K.cyl(0.06, 0.06, 9, 0x8a8a90, [0, 0, 0], { parent: crank, metalness: 0.6 }); sh.rotation.z = Math.PI / 2;
  for (let i = 0; i < 7; i++) { const arm = K.box(0.06, 0.4, 0.06, 0x8a8a90, [-3.3 + i * 1.1, 0.2, 0], { parent: crank, metalness: 0.6 }); K.cyl(0.05, 0.05, 0.3, 0x5a3a24, [-3.3 + i * 1.1, 0.4, 0.12], { parent: crank }).rotation.x = Math.PI / 2; }
  crank.position.set(...add(INS, [0.4, 1.45, 0.75])); K.scene.add(crank);
  // candle at the front
  K.box(0.5, 0.08, 0.5, 0x5a3a24, add(INS, [-5.2, 1.3, 0.2])); K.cyl(0.08, 0.09, 0.4, 0xf4ecd8, add(INS, [-5.2, 1.54, 0.2]));
  candleFl = K.sph(0.07, 0xffc060, add(INS, [-5.2, 1.84, 0.2]), { emissive: 0xffa040, emissiveIntensity: 4 }); candleFl.scale.y = 1.8;
  candleL = K.pointLight(0xffa860, 9, add(INS, [-5.0, 2.1, 0.6]), 14); K.pointLight(0xffa860, 6, add(INS, [0, 2.6, 1.8]), 12);
  K.sign('SIN MOTOR', add(INS, [1.2, 3.0, -1.0]), { w: 2.6, h: 0.7, bg: '#8a1f2e' });
  // dark sea outside the cutaway
  K.plane(60, 40, K.std(0x0a2a3a), add(INS, [0, 10, -6]), [0, 0, 0]);
}
async function deep() {
  K.plane(120, 120, K.std(0x6a6a50), add(DEEP, [0, 0, 0]));
  for (let i = 0; i < 9; i++) await K.placeH(`nature_pack/Rock_${(i % 5) + 1}`, add(DEEP, [-10 + i * 2.6, 0, -4 - (i % 3) * 2]), i, 0.8 + (i % 3) * 0.5).catch(() => {});
  for (let i = 0; i < 14; i++) { const s = K.cyl(0.06, 0.1, 1.2 + (i % 4) * 0.5, 0x2a7a4a, add(DEEP, [-8 + i * 1.3, 0.6, -2.5 - (i % 3)])); s.rotation.z = Math.sin(i) * 0.2; s.userData.sway = i; }
  subD = makeSub({ col: 0x7a8a94 }); K.pointLight(0x8ad8ff, 12, add(DEEP, [2, 5, 4]), 25); subD.position.set(...add(DEEP, [0, 0.55, -1])); subD.rotation.set(0.12, 0, 0.06);
  K.sign('HUNLEY + 7', add(DEEP, [0.6, 3.2, 0.5]), { w: 3.0, h: 0.9, bg: '#1e3a5a' });
}
async function nightsea() {
  water(NSEA, 300, 0, { base: '#0e2a44', line: 'rgba(140,190,255,0.35)' });
  const hs = await K.placeH('ships_pack/Sail_ship', add(NSEA, [3, -0.8, -9]), Math.PI / 2, 16); ship = ship; hs.userData.hous = true; NSEA.ship = hs;
  K.sign('HOUSATONIC · 1864', add(NSEA, [-1.5, 9.5, -4.0]), { w: 5.4, h: 1.2, bg: '#1a2a4a' });
  subN = makeSub({ spar: true }); subN.position.set(...add(NSEA, [-8, 0.1, 0]));
  flashL = K.pointLight(0xffc070, 0, add(NSEA, [2, 2, -6]), 30); fball = K.sph(1.0, 0xffb040, [0, -99, 0], { emissive: 0xff8a20, emissiveIntensity: 6 });
  const sg = new K.THREE.BufferGeometry(); const sp = []; for (let i = 0; i < 1500; i++) { const a = Math.random() * 6.28, b = Math.random() * 1.3, r = 300; sp.push(NSEA[0] + r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)); }
  sg.setAttribute('position', new K.THREE.Float32BufferAttribute(sp, 3)); const pts = new K.THREE.Points(sg, new K.THREE.PointsMaterial({ color: 0xffffff, size: 1.5, fog: false })); pts.userData.noDepth = true; K.scene.add(pts);
  const moon = K.sph(4, 0xfff4d8, add(NSEA, [-40, 45, -120]), { emissive: 0xfff0c0, emissiveIntensity: 2 });
}

export async function build(k) {
  K = k; await K.preloadEnvs(); T = await K.timing(); FRAMES = Math.ceil(T.duration * 30) + 6;
  const C = K.makeChar;
  HU = C(K.scene, { shirt: 0x3a3a4a, buttons: 0xc9a24a, belt: 0x2a1a10, tie: 0x8a1f2e, hat: 'bowler', hatColor: 0x1a1a1a, hair: 0x3a2414, mustache: true, seed: 1 });
  const cc = [0x2a4a7a, 0x6a3a2a, 0x4a5a3a, 0x7a6a3a, 0x3a3a5a, 0x5a2a3a, 0x2a5a5a];
  for (let i = 0; i < 7; i++) crew.push(C(K.scene, { shirt: cc[i], hat: i % 2 ? 'cap' : 'hair', hatColor: 0x2a2a3a, hair: [0x2a1a10, 0x6a4a2a, 0xa86a2a, 0x1a1a1a][i % 4], mustache: i % 3 === 0, seed: 10 + i }));
  for (let i = 0; i < 4; i++) sailors.push(C(K.scene, { shirt: 0x1e3a6a, hat: 'cap', hatColor: 0x1e2a4a, hair: 0x3a2414, seed: 30 + i }));
  await harbor(); await office(); await inside(); await deep(); await nightsea();
}

function hideAll() {
  for (const c of [HU, ...crew, ...sailors]) c.root.visible = false; HU.hold(null);
  for (const h of hats) { h.position.set(0, -99, 0); h.rotation.set(0, 0, 0); } for (const b of bubbles) { b.position.y = -99; b.visible = true; } fgDock.visible = false; for (const s of spray) s.position.y = -99; for (const g of glow) g.position.y = -99;
  toy.position.set(0, -99, 0); if (toy.parent !== K.scene) { if (toy.parent) toy.parent.remove(toy); K.scene.add(toy); }
  subH.position.set(...add(HARB, [0, 0.15, 0])); subH.rotation.set(0, 0, 0); subH.visible = true; hatchLidH.rotation.z = 0;
  crane.visible = false; nameSign.visible = false; metros.visible = false;
  subN.position.set(...add(NSEA, [-8, 0.1, 0])); subN.rotation.set(0, 0, 0); subN.visible = true; NSEA.ship.rotation.set(0, Math.PI / 2, 0); NSEA.ship.position.set(...add(NSEA, [3, -0.8, -9])); flashL.intensity = 0; fball.position.y = -99; ship2.visible = false;
  for (const l of subD.userData.lamps) l.material.emissiveIntensity = 0;
  candleFl.visible = true; candleL.intensity = 9;
}
function tick(f) { const t = f / 30; for (const tx of waters) { tx.offset.set(Math.sin(t * 0.4) * 0.05, t * 0.03); } subH.userData.prop.rotation.x = t * 3; return t; }
const hatchTop = () => [subH.position.x - 1.6, subH.position.y + 1.27 - 0.92 - 0.35, subH.position.z]; // feet so the torso sticks out of the hatch
function hunleyInHatch(f, p = {}) { const lift = p.lift ?? 0; P(HU, { pos: add(hatchTop(), [0, lift, 0]), yaw: p.yaw ?? 0.2, expr: p.expr || 'proud', arms: p.arms || 'point', talk: p.talk || 0, look: p.look }, f); }
function bob(f, k = 1) { subH.position.y = 0.15 + Math.sin(f * 0.07) * 0.05 * k; subH.rotation.z = Math.sin(f * 0.05) * 0.015 * k; }
function floatHats(f, n, v, c) { for (let i = 0; i < 5; i++) { const h = hats[i]; if (i >= n) continue; const a = i * 1.26 + 0.4; const up = Math.min(1, Math.max(0, v * 10 - i * 1.2)); h.position.set(c[0] + Math.cos(a) * 1.4, -0.4 + up * 0.43 + Math.sin(f * 0.1 + i) * 0.04, c[2] + Math.sin(a) * 1.0 + 0.6); h.rotation.set(Math.sin(f * 0.08 + i) * 0.15, i, Math.cos(f * 0.07 + i) * 0.12); } }
function rise(f, c, n, spread = 0.6, speed = 1, top = 3) { for (let i = 0; i < n; i++) { const b = bubbles[i]; const ph = ((f * 0.03 * speed + i * 0.37) % 1); b.position.set(c[0] + Math.sin(i * 2.3) * spread, c[1] + ph * top, c[2] + Math.cos(i * 1.7) * spread * 0.6); } }
function crewOnDock(f, o = {}) { crew.forEach((c, i) => P(c, { pos: add(HARB, [-5.5 + i * 1.35, 1.03, -5.2]), yaw: 0, expr: o.expr || 'worried', arms: o.arms || (i % 3 ? 'down' : 'cross'), headTilt: Math.sin(f * 0.05 + i) * 0.08, tremble: o.tremble || 0 }, f)); }
function sailorsOnDock(f, o = {}) { sailors.forEach((c, i) => P(c, { pos: add(HARB, [-7.6 + i * 1.4, 1.03, -4.4]), yaw: 0.5, expr: o.expr || 'neutral', arms: o.arms || (i % 2 ? 'point' : 'down') }, f)); }

export function frame(f, k) {
  hideAll(); const t = tick(f), ph = K.at(f), u = (i, j) => K.u(f, i, j); if (f < 10) { K.grade.whip.value = 0; K.grade.punch.value = 0; }
  const hook = (v, out = false) => { // shot 0 / 17: Hunley proud in the hatch, 5 hats floating, YA SE HUNDIÓ sign behind
    HL(); bob(f); hatchLidH.rotation.z = 1.9; hunleyInHatch(f, { expr: 'neutral', arms: v < 0.55 || out ? 'point' : 'wave' }); hats.forEach((h, i) => { h.position.set(HARB[0] - 2.9 + i * 0.58, 0.03 + Math.sin(f * 0.1 + i) * 0.04, 1.05 + (i % 2) * 0.3); h.rotation.set(Math.sin(f * 0.08 + i) * 0.15, i, 0.1); });
    const c = add(hatchTop(), [0, 0.35, 0]);
    K.move(K.frame([c, add(HARB, [-1.2, 0, 2.4])], { yaw: 0.25, h: 2.6, lookY: 1.0, pitch: 0.16, push: 0.95, lx: -0.15 }), K.frame([c, add(HARB, [-1.2, 0, 2.4])], { yaw: 0.15, h: 2.6, lookY: 1.05, pitch: 0.12, push: 0.86, lx: -0.15 }), v, 0.8, f); K.focusOn(add(c, [0, 1.6, 0]));
  };
  switch (ph) {
    case 0: hook(u(0)); break;
    case 1: { // what came next is a cruel joke: wide from the water, sub starts sinking, bubbles, crew worried on dock
      HL(); const v = u(1); subH.position.y = 0.15 - v * 0.9; hatchLidH.rotation.z = 1.9; hunleyInHatch(f, { expr: 'neutral', arms: 'down', lift: -v * 0.9 }); crewOnDock(f); rise(f, add(HARB, [0, 0, 0]), 18, 2.0, 1.4, 1.2);
      K.move({ p: add(HARB, [4.5, 1.2, 9]), l: add(HARB, [-1, 1.4, -2]), fov: 46 }, { p: add(HARB, [3.0, 1.0, 7]), l: add(HARB, [-1, 1.3, -2]), fov: 44 }, v, 0.6, f); K.focusOn(add(HARB, [0, 1, 0])); break; }
    case 2: { // not a sailor, obsessed with submarines: office, holds toy sub up, sparkles
      K.preset('interior', { exposure: 1.15 }); const p = add(OFF, [-1.0, 0, -0.6]); const v = u(2);
      P(HU, { pos: p, yaw: 0.1, expr: v < 0.4 ? 'neutral' : 'happy', arms: v < 0.4 ? 'think' : 'hold', talk: 0, look: [0.25, -0.1] }, f); if (v >= 0.4) HU.hold(toy, [0, 0.05, 0.22], [0, 0.0, 0.0]);
      if (v >= 0.4) glow.forEach((g, i) => { const a = t * 3 + i * 0.78; g.position.set(...add(p, [0.55 + Math.cos(a) * 0.5, 2.2 + Math.sin(a) * 0.4, 0.5])); });
      K.move(K.frame([p], { yaw: -0.25, h: 2.9, pitch: -0.03, lookY: 1.9, push: 0.82 }), K.frame([p], { yaw: -0.12, h: 2.9, pitch: -0.05, lookY: 2.0, push: 0.68 }), v, 0.5, f); K.focusOn(add(p, [0, 2, 0])); break; }
    case 3: { // paid for one in wartime: a 12 m iron tube — crane down from high to water level along the hull
      HL(); bob(f, 1.4); const v = u(3); sailorsOnDock(f, { arms: 'point' }); metros.visible = v > 0.35;
      K.move({ p: add(HARB, [8, 10, 14]), l: add(HARB, [0, 0, -2]), fov: 46 }, { p: add(HARB, [5.5, 1.0, 5.5]), l: add(HARB, [-1, 0.6, 0]), fov: 46 }, v, 0.4, f); K.focusOn(add(HARB, [0, 0.6, 0])); K.lens.aperture.value = 0.25; break; }
    case 4: { // no engine, 7 men cranking by hand, one candle: track along the cutaway
      K.preset('candle', { exposure: 1.35 }); const v = u(4); crank.rotation.x = t * 5;
      crew.forEach((c, i) => P(c, { pos: add(INS, [-2.9 + i * 1.1, 0.4, -0.55]), yaw: 0, sit: 1, expr: i % 2 ? 'tired' : 'worried', sweat: true, arms: 'reach', bounce: 0.5, lean: 0.15 + Math.sin(t * 5 + i) * 0.08 }, f));
      candleFl.scale.y = 1.8 + Math.sin(t * 17) * 0.3; candleL.intensity = 9 + Math.sin(t * 13) * 1.5;
      K.move({ p: add(INS, [-3.6, 2.0, 4.2]), l: add(INS, [-4.8, 1.7, 0.0]), fov: 46 }, { p: add(INS, [1.6, 1.9, 4.8]), l: add(INS, [-0.6, 1.4, -0.4]), fov: 48 }, v, 0.6, f); K.focusOn(K.lerp(add(INS, [-5.2, 1.8, 0.2]), add(INS, [-1, 1.5, -0.5]), K.ease(v))); break; }
    case 5: { // but that wasn't the worst: ECU candle flame trembling
      K.preset('candle', { exposure: 0.95 }); K.grade.vig.value = 0.6; const v = u(5); candleFl.scale.y = 1.8 + Math.sin(t * 23) * 0.6; candleFl.position.x = INS[0] - 5.2 + Math.sin(t * 19) * 0.02; candleL.intensity = 7 + Math.sin(t * 21) * 3;
      crew.forEach((c, i) => P(c, { pos: add(INS, [-2.9 + i * 1.1, 0.4, -0.55]), yaw: 0, sit: 1, expr: 'worried', arms: 'reach' }, f)); crank.rotation.x = t * 2;
      K.move({ p: add(INS, [-3.9, 2.0, 2.6]), l: add(INS, [-5.2, 1.75, 0.2]), fov: 44 }, { p: add(INS, [-4.4, 1.95, 1.7]), l: add(INS, [-5.2, 1.8, 0.2]), fov: 40 }, K.ease(v), 0.3, f); K.focusOn(add(INS, [-5.2, 1.8, 0.2])); break; }
    case 6: { // first outing: dives with the hatch OPEN, water rushes in
      HL(); const v = u(6); hatchLidH.rotation.z = 1.9; subH.position.y = 0.15 - v * 1.0; subH.rotation.z = -0.08 * v;
      const hx = subH.position.x - 1.6, hy = subH.position.y + 1.25; spray.forEach((s, i) => { const ph2 = ((f * 0.05 + i * 0.13) % 1); const a = i * 0.7; s.position.set(hx + Math.cos(a) * (0.9 - ph2 * 0.8), Math.max(hy, 0.05) + 0.25 * Math.sin(ph2 * Math.PI) + 0.05, Math.sin(a) * (0.9 - ph2 * 0.8)); });
      rise(f, add(HARB, [0, 0, 0]), 10, 1.8, 1.6, 0.8);
      K.move({ p: add(HARB, [1.5, 2.6, 7.0]), l: add(HARB, [-1.4, 0.6, 0]), fov: 44 }, { p: add(HARB, [0.6, 2.0, 5.6]), l: add(HARB, [-1.6, 0.4, 0]), fov: 44 }, v, 0.8, f); K.focusOn(add(HARB, [-1.6, 0.8, 0])); break; }
    case 7: { // water rushed in, five men didn't come out: 5 hats pop up one by one, top-down tilt
      HL(); const v = u(7);
      if (v < 0.55) { hatchLidH.rotation.z = 1.9; subH.position.y = -0.95; const hx = HARB[0] - 1.6, hy = subH.position.y + 1.25; spray.forEach((s2, i) => { const ph2 = ((f * 0.07 + i * 0.11) % 1); const a = i * 0.35; const r = 0.9 * (1 - ph2); s2.position.set(hx + Math.cos(a) * r, hy + 0.35 * (1 - ph2) - ph2 * 0.3, Math.sin(a) * r); }); rise(f, add(HARB, [-1.6, -0.3, 0]), 8, 0.8, 1.4, 0.5);
        K.move({ p: add(HARB, [0.2, 2.2, 2.6]), l: add(HARB, [-1.6, 0.25, 0]), fov: 42 }, { p: add(HARB, [-0.4, 1.8, 2.0]), l: add(HARB, [-1.6, 0.2, 0]), fov: 40 }, v / 0.55, 0.8, f); K.focusOn(add(HARB, [-1.6, 0.3, 0])); break; }
      subH.visible = false; floatHats(f, 5, (v - 0.55) / 0.45, add(HARB, [-1.6, 0, -0.4])); rise(f, add(HARB, [-1.6, -0.5, 0]), 12, 1.0, 1.2, 0.6);
      K.move({ p: add(HARB, [-1.6, 7.5, 2.4]), l: add(HARB, [-1.6, 0, 0.1]), fov: 44 }, { p: add(HARB, [-1.6, 4.6, 4.2]), l: add(HARB, [-1.6, 0, 0.1]), fov: 44 }, (v - 0.55) / 0.45, 0.3, f); K.focusOn(add(HARB, [-1.6, 0, 0.1])); break; }
    case 8: { // raised, cleaned, new crew: crane lifts the dripping sub, then new crew lines up
      HL(); const v = u(8); crane.visible = true; const y = -1.2 + Math.min(1, v * 1.8) * 2.4; subH.position.y = y; subH.rotation.z = 0.05;
      rope.position.set(0, (9 + y + 1.2) / 2, -1.2 + 1.2); rope.scale.y = Math.max(0.1, 9 - (y + 1.2)); rope.position.z = 0;
      spray.forEach((s, i) => { const ph2 = ((f * 0.06 + i * 0.17) % 1); s.position.set(-3.8 + i * 0.45, y - 0.7 - ph2 * 1.2, 0.3 * Math.sin(i)); });
      if (v > 0.5) crewOnDock(f, { expr: 'neutral', arms: 'down' });
      K.move({ p: add(HARB, [3.5, 3.2, 12]), l: add(HARB, [0, 2.6, -2]), fov: 48 }, { p: add(HARB, [2.4, 2.4, 9.5]), l: add(HARB, [-0.5, 1.8, -2.5]), fov: 46 }, v, 0.4, f); K.focusOn(add(HARB, [0, 1.5, -1])); break; }
    case 9: { // this time Hunley: "I'll drive it" — points at himself, crew shocked behind
      HL(); const v = u(9); const p = add(HARB, [-1, 1.03, -4.2]);
      P(HU, { pos: p, yaw: 0.15, expr: 'proud', arms: 'akimbo', talk: v < 0.7 ? 0.8 : 0, lean: -0.05 }, f);
      crew.slice(0, 4).forEach((c, i) => P(c, { pos: add(HARB, [-3.2 + i * 1.5 + (i > 1 ? 1.3 : 0), 1.03, -5.6]), yaw: i > 1 ? -0.4 : 0.4, expr: 'shock', arms: i % 2 ? 'shrug' : 'down', tremble: 1 }, f));
      K.move(K.frame([p], { yaw: 0.1, h: 2.9, pitch: -0.1, lookY: 1.9, push: 0.85 }), K.frame([p], { yaw: 0.0, h: 2.9, pitch: -0.12, lookY: 2.0, push: 0.72 }), v, 0.6, f); K.focusOn(add(p, [0, 2, 0])); break; }
    case 10: { // and here it all went wrong: Hunley's face inside, lit by the candle, scared
      K.preset('candle', { exposure: 1.25 }); K.grade.vig.value = 0.6; const v = u(10); const p = add(INS, [-4.2, 0.4, -0.3]);
      P(HU, { pos: p, yaw: 0.3, sit: 1, expr: 'worried', arms: 'reach', sweat: true, tremble: 2, look: [-0.3, 0] }, f); candleFl.scale.y = 1.8 + Math.sin(t * 25) * 0.7; candleL.intensity = 6 + Math.sin(t * 23) * 3;
      crew.slice(0, 3).forEach((c, i) => P(c, { pos: add(INS, [-2.9 + i * 1.1, 0.4, -0.55]), yaw: 0, sit: 1, expr: 'scared', arms: 'reach' }, f));
      K.move(K.frame([p], { yaw: 0.3, h: 2.2, lookY: 1.8, pitch: 0.06, push: 0.9 }), K.frame([p], { yaw: 0.25, h: 2.2, lookY: 1.85, pitch: 0.08, push: 0.62 }), K.ease(v), 0.5, f); K.focusOn(add(p, [0, 1.8, 0])); break; }
    case 11: { // dives in Charleston harbor, in front of another ship: over the sailors' shoulders (foreground)
      HL(); const v = u(11); hatchLidH.rotation.z = 0; subH.position.y = 0.15 - v * 1.6; ship2.visible = true; sailorsOnDock(f, { expr: 'worried', arms: 'point' }); rise(f, add(HARB, [0, -0.2, 0]), Math.round(v * 16), 1.8, 1.4, 0.8);
                  K.move({ p: add(HARB, [4.6, 2.2, 9.0]), l: add(HARB, [-2.5, 2.4, -3]), fov: 48 }, { p: add(HARB, [3.8, 1.9, 7.8]), l: add(HARB, [-2.5, 2.1, -3]), fov: 48 }, v, 0.4, f); K.focusOn(add(HARB, [0, 0.5, 0])); break; }
    case 12: { // bubbles rose... and it never came back up: low over water, bubbles thin out
      HL(0.95); K.grade.sat.value = 1.1; const v = u(12); subH.visible = false; const n = Math.round(22 * (1 - Math.min(1, v * 1.3)));
      rise(f, add(HARB, [0, -0.3, 0]), n, 1.6, 1.2, 0.7);
      sailors.forEach((c, i) => P(c, { pos: add(HARB, [-4 + i * 1.4, 1.03, -4.6]), yaw: 0, expr: 'scared', arms: v > 0.6 ? 'cross' : 'point' }, f));
      K.move({ p: add(HARB, [1.5, 0.55, 6]), l: add(HARB, [0, 0.4, 0]), fov: 46 }, { p: add(HARB, [1.0, 0.5, 4.6]), l: add(HARB, [-0.5, 0.6, -2]), fov: 46 }, v, 0.3, f); K.focusOn(add(HARB, [0, 0.3, 0])); break; }
    case 13: { // Hunley and his 7 men stayed on the bottom: seabed, porthole glow fades out
      K.preset('night', { exposure: 1.3, fog: [0x0a3a5a, 4, 32], sky: [0x02121e, 0x063048, 0x0a4a6a], hemiTop: 0x4ab0d8, hemiI: 0.9 }); const v = u(13);
      for (const l of subD.userData.lamps) l.material.emissiveIntensity = 5 * Math.max(0, 1 - v * 1.4);
      for (let i = 0; i < 8; i++) { const b = bubbles[i]; const ph2 = ((f * 0.02 + i * 0.125) % 1); b.position.set(DEEP[0] - 1.6 + Math.sin(i) * 0.3, 1.8 + ph2 * 5, -1 + Math.cos(i) * 0.3); }
      K.move({ p: add(DEEP, [5.5, 3.2, 12.5]), l: add(DEEP, [-0.5, 1.2, -1]), fov: 46 }, { p: add(DEEP, [3.6, 2.6, 10.0]), l: add(DEEP, [-1, 1.1, -1]), fov: 44 }, v, 0.3, f); K.focusOn(add(DEEP, [-1, 1, -1])); break; }
    case 14: { // raised again and named after him: sub on the dock edge, worker paints the name
      HL(); const v = u(14); subH.position.y = 0.35; nameSign.visible = v > 0.45; nameSign.scale.x = Math.min(1, Math.max(0.05, (v - 0.45) * 3.5));
      P(crew[2], { pos: add(HARB, [2.9, 0.05, 1.4]), yaw: -1.2, expr: 'neutral', arms: 'hammer' }, f); crew[2].root.position.y = -0.1;
      K.move({ p: add(HARB, [3.0, 1.5, 6.4]), l: add(HARB, [0.2, 0.7, 0.6]), fov: 46 }, { p: add(HARB, [2.0, 1.2, 5.0]), l: add(HARB, [0.4, 0.6, 0.8]), fov: 44 }, v, 0.4, f); K.focusOn(add(HARB, [0.4, 0.5, 0.8])); break; }
    case 15: { // months later, first sub ever to sink a warship: night, spar hits the Housatonic, flash, the ship tilts
      NL(); const v = u(15); const sx = -8 + Math.min(1, v / 0.3) * 5.2; subN.position.set(NSEA[0] + sx, 0.1, 0); subN.rotation.y = -0.35;
      if (v > 0.3) { const w = (v - 0.3) / 0.7; flashL.intensity = 60 * Math.max(0, 1 - w * 2.5); if (w < 0.35) { fball.position.set(NSEA[0] - 1.2, 0.6, -2.5); fball.scale.setScalar(0.5 + w * 6); } if (w < 0.12) K.grade.flash.value = 0.7 * (1 - w / 0.12); NSEA.ship.rotation.z = -0.8 * K.ease(Math.min(1, w * 1.6)); NSEA.ship.position.y = -0.8 - 2.6 * K.ease(w);
        spray.forEach((s, i) => { const a = i * 0.35; s.position.set(NSEA[0] + 1.8 + Math.cos(a) * w * 3, 0.3 + Math.sin(i * 1.7) * w * 3 + 1.2 * Math.sin(w * Math.PI), -6 + Math.sin(a) * w * 2); }); }
      K.move({ p: add(NSEA, [-7, 2.0, 20]), l: add(NSEA, [-0.5, 4.5, -6]), fov: 50 }, { p: add(NSEA, [-5, 1.8, 18]), l: add(NSEA, [0, 4.8, -7]), fov: 50 }, v, 0.6, f); K.focusOn(add(NSEA, [0, 2, -5])); K.lens.aperture.value = 0.25; break; }
    case 16: { // the most absurd part: that same night, it sank a third time — close at water level, last bubble
      NL(); const v = u(16); NSEA.ship.rotation.z = -0.8; NSEA.ship.position.y = -3.4; subN.position.set(NSEA[0] - 2.8, 0.1 - Math.min(1, v * 1.4) * 1.9, 0); subN.rotation.set(0, -0.35, -0.1 * v);
      for (let i = 0; i < 6; i++) { const b = bubbles[i]; const ph2 = ((f * 0.03 + i * 0.17) % 1); b.position.set(NSEA[0] - 3.5 + Math.sin(i * 2) * 0.6, -0.2 + ph2 * 0.5, Math.cos(i) * 0.4); b.visible = v > 0.3; }
      K.move({ p: add(NSEA, [-0.5, 0.7, 5.5]), l: add(NSEA, [-3, 0.4, 0]), fov: 44 }, { p: add(NSEA, [-1.2, 0.6, 4.4]), l: add(NSEA, [-3, 0.2, 0]), fov: 44 }, v, 0.4, f); K.focusOn(add(NSEA, [-3, 0.3, 0])); break; }
    default: hook(u(17), true); // nobody plans their end -> loop back to the hook framing
  }
}
