// VID-001 v3 world: London St Giles 1814. Street at origin (x along street, brewery wall z=-7), brewery interior x=300,
// cellar x=600, wake room x=900, court x=-600, office x=-900. Wd keys drive the action.
let G = {};
export function build(E) {
  const { THREE, scene, add, box, toon, R, ctex, P } = E;
  const brick = (rep) => toon(0xffffff, P.brick('#8a4a36', '#4a2e24', rep)), dbrick = (rep) => toon(0xffffff, P.brick('#6a3a2e', '#3a2420', rep));
  const plaster = (c, rep) => toon(0xffffff, P.plaster(c, rep)), wood = (rep) => toon(0xffffff, P.planks('#7a4e2c', rep)), ink = toon(0x2a2430), iron = toon(0x3a3a40);
  const beer = toon(0xb8761e), foam = toon(0xfff2d6);
  // ---------- street ----------
  const st = new THREE.Mesh(new THREE.PlaneGeometry(200, 60), toon(0xffffff, P.cobble([40, 12]))); st.rotation.x = -Math.PI / 2; st.receiveShadow = true; scene.add(st);
  G.wall = new THREE.Group(); scene.add(G.wall); G.wallBricks = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 14; c++) { const m = box(2, 1, 0.8, brick([1, 0.5]), [-13 + c * 2 + (r % 2) * 0.5, 0.5 + r, -7], null, G.wall, 2); m.userData.home = m.position.clone(); m.userData.r = r; m.userData.c = c; G.wallBricks.push(m); }
  G.sign = add(new THREE.PlaneGeometry(14, 2.2), new THREE.MeshBasicMaterial({ map: P.sign('MEUX & CO.  HORSE SHOE BREWERY', '#2d1b10', '#f2c14e') }), [0, 10.4, -6.5], [0, 0, 0], scene, 0);
  box(30, 4, 6, dbrick([8, 1]), [0, 11, -10], null, scene, 1); add(new THREE.CylinderGeometry(1, 1.2, 8, 12), dbrick([2, 2]), [9, 16, -11], [0, 0, 0], scene, 1);
  // houses both sides; the wake house at x=22 north side is collapsible
  const roofs = [0x5a4a5a, 0x4a3a3a, 0x6a4a3a], walls = ['#d8c8a8', '#c8b090', '#e0d0b0', '#b89878'];
  const house = (x, z, w, h, k, flip) => { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); const parts = [];
    for (let fl = 0; fl < Math.round(h / 3); fl++) { const m = box(w, 3, 6, plaster(walls[(k + fl) % 4], [1, 1]), [0, 1.5 + fl * 3, 0], null, g, 1); parts.push(m); for (const wx of [-w / 4, w / 4]) parts.push(box(1.1, 1.5, 0.12, toon(0x2a3448), [wx, 1.8 + fl * 3, flip * 3.06], null, g, 0)); }
    const rf = add(new THREE.ConeGeometry(w * 0.75, 2.6, 4), toon(roofs[k % 3]), [0, h + 1.3, 0], [0, Math.PI / 4, 0], g, 1); rf.scale.z = 0.8; parts.push(rf);
    box(0.9, 0.5, 0.1, toon(0x14100e), [-w / 4, 0.3, flip * 3.06], null, g, 0); // cellar window
    box(1.3, 2.3, 0.12, toon(0x3a2416), [w / 4 + 0.6, 1.15, flip * 3.06], null, g, 0);
    parts.forEach((m) => (m.userData.home = { p: m.position.clone(), r: m.rotation.clone() })); return { g, parts }; };
  G.houses = [];
  for (let k = 0; k < 6; k++) { G.houses.push(house(17 + k * 7.2, -10, 6.6, 6 + (k % 3) * 3, k, 1)); G.houses.push(house(-17 - k * 7.2, -10, 6.6, 6 + ((k + 1) % 3) * 3, k + 1, 1)); }
  for (let k = 0; k < 14; k++) house(-48 + k * 7.2, 25, 6.6, 6 + (k % 3) * 3, k + 2, -1);
  G.wake = G.houses[0]; // x=17
  // flood + wave in the street
  G.flood = new THREE.Mesh(new THREE.PlaneGeometry(200, 36, 60, 12), beer); G.flood.rotation.x = -Math.PI / 2; scene.add(G.flood);
  G.wave = new THREE.Group(); scene.add(G.wave); add(new THREE.CylinderGeometry(4.5, 4.5, 30, 24, 1, false, 0, Math.PI), beer, [0, 0, 0], [0, 0, Math.PI / 2], G.wave, 1);
  G.waveFoam = []; for (let k = 0; k < 22; k++) G.waveFoam.push(add(new THREE.SphereGeometry(0.7 + R(k) * 0.8, 8, 6), foam, [-14 + k * 1.35, 4.3 + R(k * 3) * 0.6, 0.6], [0, 0, 0], G.wave, 0));
  G.bricks = []; for (let k = 0; k < 26; k++) G.bricks.push(box(0.9, 0.45, 0.45, brick([0.5, 0.25]), [0, -20, 0], null, scene, 2));
  G.spray = []; for (let k = 0; k < 130; k++) G.spray.push(add(new THREE.SphereGeometry(0.25 + R(k * 7) * 0.4, 7, 5), k % 3 ? beer : foam, [0, -20, 0], [0, 0, 0], scene, 0));
  G.c8 = []; for (let k = 0; k < 8; k++) { const g = new THREE.Group(); g.position.set(-27.2 + k * 0.62, 0.0, -6.3 + (k % 2) * 0.25); scene.add(g); add(new THREE.CylinderGeometry(0.07, 0.08, 0.42, 10), toon(0xf4ecd8), [0, 0.21, 0], [0, 0, 0], g, 2); g.userData.fl = add(new THREE.ConeGeometry(0.07, 0.22, 10), new THREE.MeshBasicMaterial({ color: 0xffc040 }), [0, 0.53, 0], [0, 0, 0], g, 0); G.c8.push(g); }
  G.c8light = new THREE.PointLight(0xffa850, 0, 6, 1.5); G.c8light.position.set(-25, 1, -5.5); scene.add(G.c8light);
  // ---------- brewery interior x=300 ----------
  const bw = new THREE.Group(); bw.position.set(300, 0, 0); scene.add(bw);
  box(40, 0.2, 24, wood([10, 6]), [0, -0.1, 0], null, bw, 0); box(40, 14, 0.4, brick([10, 4]), [0, 7, -10], null, bw, 0); box(0.4, 14, 24, brick([6, 4]), [-12, 7, 0], null, bw, 0);
  for (let k = 0; k < 5; k++) box(0.4, 0.5, 24, wood([6, 1]), [-8 + k * 6, 12.5, 0], null, bw, 1);
  for (let k = 0; k < 6; k++) add(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 12), wood([1, 1]), [-9 + (k % 3) * 1.1, 0.6 + Math.floor(k / 3) * 1.15, 5], [Math.PI / 2, 0, 0], bw, 1);
  // clock on the wall
  G.clock = new THREE.Group(); G.clock.position.set(-6, 8, -9.7); bw.add(G.clock);
  add(new THREE.CircleGeometry(1.2, 32), new THREE.MeshToonMaterial({ map: ctex(256, 256, (g, w) => { g.fillStyle = '#f4ecd8'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill(); g.lineWidth = 10; g.strokeStyle = '#2a1a10'; g.stroke(); g.fillStyle = '#2a1a10'; g.font = 'bold 34px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; ['XII', 'III', 'VI', 'IX'].forEach((s, i) => g.fillText(s, 128 + Math.sin(i * Math.PI / 2) * 92, 128 - Math.cos(i * Math.PI / 2) * 92)); }), gradientMap: E.grad }), [0, 0, 0], [0, 0, 0], G.clock, 0);
  G.hHour = box(0.12, 0.6, 0.04, ink, [0, 0.3, 0.05], null, G.clock, 0); G.hMin = box(0.08, 0.95, 0.04, ink, [0, 0.47, 0.06], null, G.clock, 0);
  [G.hHour, G.hMin].forEach((h) => { h.geometry.translate(0, h.geometry.parameters.height / 2, 0); h.position.y = 0; });
  // tanks: main (r 2.6, h 7) + 2 neighbours
  const tank = (x, z, r, h, n = 16) => { const g = new THREE.Group(); g.position.set(x, 0, z); bw.add(g); const staves = [], hoops = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, m = box(2 * Math.PI * r / n + 0.02, h, 0.32, wood([0.5, 2]), [Math.cos(a) * r, h / 2, Math.sin(a) * r], [0, -a + Math.PI / 2, 0], g, 2); m.userData.a = a; staves.push(m); }
    add(new THREE.CylinderGeometry(r, r, 0.3, 24), wood([2, 2]), [0, h, 0], [0, 0, 0], g, 1);
    for (let k = 0; k < 5; k++) { const m = add(new THREE.TorusGeometry(r + 0.18, 0.12, 8, 40), iron, [0, 0.8 + k * (h - 1.4) / 4, 0], [Math.PI / 2, 0, 0], g, 0); m.userData.y = m.position.y; hoops.push(m); }
    return { g, staves, hoops, r, h }; };
  G.t1 = tank(0, -4, 2.6, 7); G.t2 = tank(7.5, -4.5, 2.1, 6, 14); G.t3 = tank(13.5, -5, 2.0, 5.6, 14);
  G.col = add(new THREE.CylinderGeometry(1, 1.4, 1, 20, 1, true), beer, [0, 0, -4], [0, 0, 0], bw, 1); G.bfl = new THREE.Mesh(new THREE.PlaneGeometry(40, 24), beer); G.bfl.rotation.x = -Math.PI / 2; G.bfl.position.set(0, 0, 0); bw.add(G.bfl);
  // ---------- cellar x=600 ----------
  const ce = new THREE.Group(); ce.position.set(600, 0, 0); scene.add(ce);
  box(10, 0.2, 8, wood([3, 2]), [0, -0.1, 0], null, ce, 0); box(10, 3.4, 0.3, dbrick([3, 1]), [0, 1.7, -3.5], null, ce, 0); box(0.3, 3.4, 8, dbrick([2, 1]), [-4.8, 1.7, 0], null, ce, 0); box(10, 0.3, 8, wood([3, 2]), [0, 3.5, 0], null, ce, 0);
  G.cwin = box(1.4, 0.7, 0.1, toon(0xd8e0e8, null, { emissive: 0x606870 }), [1.5, 2.8, -3.33], null, ce, 0); for (const x of [1.15, 1.85]) box(0.06, 0.7, 0.12, ink, [x, 2.8, -3.3], null, ce, 0);
  box(1.8, 0.1, 1, wood([1, 1]), [-2.4, 0.8, -1.8], null, ce, 1); for (const x of [-3.2, -1.6]) box(0.1, 0.8, 0.9, wood([1, 1]), [x, 0.4, -1.8], null, ce, 0);
  box(2.4, 0.5, 1.2, toon(0x8a7a6a), [3, 0.25, -2.6], null, ce, 1); add(new THREE.CylinderGeometry(0.15, 0.15, 0.3, 10), toon(0xf4ecd8), [-2.2, 1.0, -1.8], [0, 0, 0], ce, 0);
  G.cfl = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), beer); G.cfl.rotation.x = -Math.PI / 2; G.cfl.position.set(600, -1, 0); scene.add(G.cfl);
  G.jet = add(new THREE.CylinderGeometry(0.25, 0.6, 2.8, 10), beer, [601.5, 1.4, -3.1], [0.35, 0, 0], scene, 0);
  // ---------- wake room x=900 ----------
  const wk = new THREE.Group(); wk.position.set(900, 0, 0); scene.add(wk);
  box(10, 0.2, 8, wood([3, 2]), [0, -0.1, 0], null, wk, 0); box(10, 4, 0.3, plaster('#b8a888', [2, 1]), [0, 2, -3.5], null, wk, 0); box(0.3, 4, 8, plaster('#b8a888', [2, 1]), [-4.8, 2, 0], null, wk, 0);
  box(2.4, 0.1, 1.1, wood([1, 1]), [0, 0.95, -1.6], null, wk, 1); for (const x of [-1, 1]) box(0.12, 0.95, 1, wood([1, 1]), [x, 0.47, -1.6], null, wk, 0);
  box(1.3, 0.4, 0.6, toon(0x5a3a22), [0, 1.2, -1.6], null, wk, 1); box(1.4, 0.04, 0.7, toon(0xf4f0e6), [0, 1.42, -1.6], null, wk, 0);
  for (let k = 0; k < 3; k++) add(new THREE.SphereGeometry(0.07, 8, 6), toon([0xe8a0a0, 0xf4f4f4, 0xe8a0a0][k]), [-0.15 + k * 0.15, 1.47, -1.45], [0, 0, 0], wk, 0);
  G.wflames = []; for (const x of [-1.1, 1.1]) { add(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8), toon(0xf4ecd8), [x, 1.22, -1.9], [0, 0, 0], wk, 0); G.wflames.push(add(new THREE.ConeGeometry(0.06, 0.22, 10), new THREE.MeshBasicMaterial({ color: 0xffc040 }), [x, 1.56, -1.9], [0, 0, 0], wk, 0)); }
  G.wlight = new THREE.PointLight(0xffb060, 18, 9, 1.6); G.wlight.position.set(900, 2, -1.2); scene.add(G.wlight);
  G.wcrack = []; for (let k = 0; k < 5; k++) G.wcrack.push(box(1.2 + R(k) * 1.5, 0.08, 0.05, ink, [-3 + k * 1.4, 2.6 + R(k * 3) * 1, -3.33], [0, 0, (R(k * 5) - 0.5) * 1.2], wk, 0));
  G.wfl = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), beer); G.wfl.rotation.x = -Math.PI / 2; G.wfl.position.set(900, -1, 0); scene.add(G.wfl);
  G.debris = []; for (let k = 0; k < 14; k++) G.debris.push(box(0.6 + R(k) * 1.2, 0.3, 0.5 + R(k * 3) * 0.6, [plaster('#b8a888', [1, 1]), wood([1, 1])][k % 2], [0, -20, 0], null, scene, 2));
  // ---------- court x=-600 ----------
  const ct = new THREE.Group(); ct.position.set(-600, 0, 0); scene.add(ct);
  box(16, 0.2, 12, wood([4, 3]), [0, -0.1, 0], null, ct, 0); box(16, 8, 0.3, toon(0xffffff, P.planks('#5a3a22', [4, 2])), [0, 4, -4], null, ct, 0);
  box(5, 2.2, 1.4, wood([2, 1]), [0, 1.1, -2.6], null, ct, 1); box(5.4, 0.2, 1.6, toon(0x3a2416), [0, 2.25, -2.6], null, ct, 1);
  add(new THREE.CircleGeometry(1.1, 32), new THREE.MeshToonMaterial({ map: ctex(256, 256, (g, w) => { g.fillStyle = '#e8c45a'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill(); g.fillStyle = '#7a1a1a'; g.beginPath(); g.arc(128, 128, 96, 0, 7); g.fill(); g.fillStyle = '#e8c45a'; g.font = 'bold 120px serif'; g.textAlign = 'center'; g.fillText('♛', 128, 170); }), gradientMap: E.grad }), [0, 6, -3.8], [0, 0, 0], ct, 0);
  box(4.5, 1.1, 1.2, wood([2, 1]), [5.2, 0.55, -0.6], [0, -0.5, 0], ct, 1);
  G.gavel = new THREE.Group(); G.gavel.position.set(-599, 2.45, -2.3); scene.add(G.gavel); box(0.5, 0.18, 0.18, toon(0x5a3a22), [0, 0, 0], null, G.gavel, 1); box(0.06, 0.06, 0.6, toon(0x5a3a22), [0, 0, 0.35], null, G.gavel, 0);
  G.scroll = add(new THREE.PlaneGeometry(3.4, 1.6), new THREE.MeshToonMaterial({ map: ctex(512, 240, (g, w, h) => { g.fillStyle = '#efe2c0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5a3a22'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#2a1a10'; g.font = 'bold 34px Georgia'; g.textAlign = 'center'; g.fillText('VEREDICTO:', w / 2, 80); g.font = 'bold 58px Georgia'; g.fillStyle = '#8a1a1a'; g.fillText('"ACTO DE DIOS"', w / 2, 160); }), gradientMap: E.grad }), [-604.5, 4.6, -3.8], [0, 0, 0], scene, 0);
  // ---------- office x=-900 ----------
  const of = new THREE.Group(); of.position.set(-900, 0, 0); scene.add(of);
  box(12, 0.2, 10, toon(0xffffff, P.planks('#6a4024', [3, 3])), [0, -0.1, 0], null, of, 0); box(12, 6, 0.3, toon(0xffffff, P.wallpaper([2, 1])), [0, 3, -4], null, of, 0);
  box(3.2, 0.12, 1.4, toon(0x4a2e1a), [0, 1.0, -1.4], null, of, 1); for (const x of [-1.4, 1.4]) box(0.2, 1, 1.2, toon(0x3a2416), [x, 0.5, -1.4], null, of, 0);
  G.doc = add(new THREE.PlaneGeometry(1.0, 0.7), new THREE.MeshToonMaterial({ map: ctex(360, 256, (g, w, h) => { g.fillStyle = '#efe6cc'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a1a10'; g.font = 'bold 30px Georgia'; g.textAlign = 'center'; g.fillText('IMPUESTOS', w / 2, 60); g.fillText('DEVUELTOS', w / 2, 100); g.font = '20px Georgia'; for (let k = 0; k < 4; k++) g.fillRect(40, 130 + k * 22, w - 80, 3); g.save(); g.translate(250, 200); g.rotate(-0.3); g.strokeStyle = '#b02020'; g.lineWidth = 6; g.strokeRect(-70, -26, 140, 52); g.fillStyle = '#b02020'; g.font = 'bold 26px Georgia'; g.fillText('PAGADO', 0, 10); g.restore(); }), gradientMap: E.grad, side: THREE.DoubleSide }), [-900.4, 1.07, -1.3], [-Math.PI / 2, 0, 0.12], scene, 0);
  G.bags = []; for (let k = 0; k < 4; k++) { const b = new THREE.Group(); scene.add(b); add(new THREE.SphereGeometry(0.32, 12, 10), toon(0xc8a86a), [0, 0.3, 0], [0, 0, 0], b, 1).scale.y = 1.15; add(new THREE.CylinderGeometry(0.08, 0.14, 0.18, 8), toon(0xc8a86a), [0, 0.68, 0], [0, 0, 0], b, 1);
    add(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshBasicMaterial({ map: ctex(64, 64, (g) => { g.fillStyle = '#2a1a10'; g.font = 'bold 50px serif'; g.textAlign = 'center'; g.fillText('£', 32, 50); }), transparent: true }), [0, 0.32, 0.33], [0, 0, 0], b, 0); G.bags.push(b); }
  G.coins = []; for (let k = 0; k < 18; k++) G.coins.push(add(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 14), toon(0xe8c45a), [0, -20, 0], [0, 0, 0], scene, 0));
  // clouds
  for (let k = 0; k < 12; k++) { const c = new THREE.Group(); for (let j = 0; j < 4; j++) add(new THREE.SphereGeometry(8 + R(k * 4 + j) * 5, 10, 8), toon(0xffffff, null, { emissive: 0x777777 }), [j * 9 - 14, R(j + k) * 4, R(j * 3) * 5], [0, 0, 0], c, 0); c.position.set(-300 + R(k) * 600, 70 + R(k * 3) * 30, -300 + R(k * 7) * 200); scene.add(c); }
}
const rnd = (i, k) => { const x = Math.sin((i + k) * 9301 + 49297) * 233280; return x - Math.floor(x); };
const ssf = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
export function update(f, Wd, E) {
  const t = f / 30;
  // wall burst (0..1): bricks of the central hole fly toward +z
  const wb = Wd.wallBurst || 0;
  G.wallBricks.forEach((m) => { const h = m.userData.home, inHole = Math.abs(h.x) < 7 - m.userData.r * 0.2 && m.userData.r < 7; if (!inHole || wb <= 0) { m.position.copy(h); m.rotation.set(0, 0, 0); m.visible = true; return; }
    const k = Math.max(0, wb - rnd(m.userData.c, m.userData.r) * 0.15), sp = 9 + rnd(m.userData.r, m.userData.c) * 7; m.position.set(h.x + (h.x) * k * 0.6, Math.max(0.25, h.y * (1 - k) + 5 * k * (1 - k)), h.z + k * sp); m.rotation.set(k * 6 * rnd(m.userData.c, 3), k * 4, k * 5 * rnd(3, m.userData.r)); m.visible = m.position.y > -1; });
  G.bricks.forEach((m, k) => { m.visible = wb > 0; if (!wb) return; const u = Math.min(1, wb * (0.9 + rnd(k, 1) * 0.4)); m.position.set((rnd(k, 2) - 0.5) * 12, Math.max(0.2, (2 + rnd(k, 3) * 5) * (1 - u) + 5 * u * (1 - u)), -7 + u * (10 + rnd(k, 4) * 12)); m.rotation.set(u * 7, u * 5 * rnd(k, 5), u * 3); });
  // wave across the street
  const wv = Wd.wave; G.wave.visible = wv != null; if (wv != null) { G.wave.position.set(Wd.waveX || 0, -1.5 + Math.min(1, wv * 2) * 2.2, -7 + wv * 16); G.wave.rotation.set(Math.sin(t * 3.1) * 0.06, 0, 0); G.wave.scale.set(1, 1 + Math.sin(t * 4.3) * 0.07, 1 + Math.sin(t * 3.7 + 1) * 0.08); G.waveFoam.forEach((m, k) => { m.position.y = 4.3 + Math.sin(t * 6 + k) * 0.35; m.position.z = 0.6 + Math.sin(t * 5 + k * 1.7) * 0.5; m.scale.setScalar(1 + Math.sin(t * 7 + k) * 0.25); }); }
  const fl = Wd.flood || 0; G.flood.visible = fl > 0; G.flood.position.y = fl; { const p = G.flood.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 0.3 + t * 2) * 0.08 + Math.sin(p.getY(i) * 0.5 - t * 2.4) * 0.06); p.needsUpdate = true; }
  const sp = Wd.spray; G.spray.forEach((m, k) => { m.visible = !!sp; if (!sp) return; const u = ((t * 1.1 + rnd(k, 9)) % 1), a = rnd(k, 7) * Math.PI * 2, r = sp.r + u * sp.out; m.position.set(sp.c[0] + Math.cos(a) * r * (sp.flat ? 1 : 0.5) + (sp.dir ? sp.dir[0] * u * sp.out : 0), sp.c[1] + u * sp.up * (1 - u) * 4 * (0.5 + rnd(k, 8)), sp.c[2] + Math.sin(a) * r * 0.5 + (sp.dir ? sp.dir[2] * u * sp.out : 0)); m.scale.setScalar(1.2 - u * 0.8); });
  // house collapse at the wake house
  const hc = Wd.houseFall || 0; G.wake.parts.forEach((m, i) => { const h = m.userData.home; if (!hc) { m.position.copy(h.p); m.rotation.copy(h.r); return; } const k = Math.max(0, hc * 1.3 - rnd(i, 4) * 0.3); m.position.set(h.p.x + (rnd(i, 1) - 0.5) * k * 4, Math.max(0.4, h.p.y - k * k * h.p.y * 1.1), h.p.z + k * (2 + rnd(i, 2) * 3)); m.rotation.set(h.r.x + k * (rnd(i, 3) - 0.5) * 2, h.r.y, h.r.z + k * (rnd(i, 5) - 0.5) * 1.6); });
  // clock
  const ck = Wd.clock ?? 0; G.hMin.rotation.z = -ck * Math.PI * 2; G.hHour.rotation.z = -(4 + ck) / 12 * Math.PI * 2;
  // hoop slip on tank 1 (hoop index 1)
  const hs = Wd.hoop || 0; const h1 = G.t1.hoops[1]; h1.position.y = Math.max(0.12, h1.userData.y - hs * hs * 2.6); h1.rotation.set(Math.PI / 2 + hs * 0.35, 0, hs * 0.2); h1.position.x = hs * 0.4;
  // tank bursts
  const burst = (T, k) => { T.staves.forEach((m, i) => { const a = m.userData.a, kk = Math.max(0, k - rnd(i, 6) * 0.1), r = T.r + kk * (5 + rnd(i, 7) * 6); m.position.set(Math.cos(a) * r, T.h / 2 * (1 - kk * 0.7) + kk * 2 - kk * kk * 3, Math.sin(a) * r); m.rotation.set(Math.sin(a) * kk * 1.4, -a + Math.PI / 2 + kk * rnd(i, 8), Math.cos(a) * kk * 1.4); m.visible = kk < 1.1; }); T.hoops.forEach((m, i) => { m.position.y = k ? Math.max(0.15, m.userData.y * (1 - k)) : m.userData.y; m.visible = k < 0.95; }); T.g.children.forEach((c) => c.geometry && c.geometry.type === 'CylinderGeometry' && (c.visible = k < 0.2)); };
  burst(G.t1, Wd.burst1 || 0); burst(G.t2, Wd.burst2 || 0); burst(G.t3, Wd.burst3 || 0);
  G.t2.g.rotation.z = -(Wd.tilt2 || 0); G.t3.g.rotation.z = -(Wd.tilt3 || 0);
  const col = Wd.column || 0; G.col.visible = col > 0; if (col) { const wob = 1 + Math.sin(t * 9) * 0.12; G.col.scale.set((0.6 + col * 1.1) * wob, (2 + col * 8) * (1 + Math.sin(t * 6) * 0.06), (0.6 + col * 1.1) / wob); G.col.rotation.y = t * 2; G.col.position.y = G.col.scale.y / 2; }
  G.bfl.visible = (Wd.bflood || 0) > 0; G.bfl.position.y = Wd.bflood || 0;
  // cellar + wake flood
  const cf = Wd.cflood ?? -1; G.cfl.position.y = cf; G.cfl.visible = cf > 0; G.jet.visible = cf > -0.5 && cf < 2.5;
  const wf = Wd.wflood ?? -1; G.wfl.position.y = wf; G.wfl.visible = wf > 0; G.wcrack.forEach((m) => (m.visible = !!Wd.cracks)); G.wflames.forEach((m, k) => (m.scale.setScalar(1 + 0.25 * Math.sin(f * 0.8 + k * 2)))); G.wlight.intensity = Wd.wakeLight ?? 18;
  G.debris.forEach((m, k) => { const d = Wd.debris || 0; m.visible = d > 0; if (!d) return; const u = Math.min(1, d * (0.8 + rnd(k, 2) * 0.5)); m.position.set(900 + (rnd(k, 3) - 0.5) * 6, 4.2 - u * u * 4 + 0.15, -2.4 + rnd(k, 4) * 3); m.rotation.set(u * 3 * rnd(k, 5), u * 2, u * 2 * rnd(k, 6)); });
  const c8 = Wd.c8 || 0; G.c8.forEach((g, k) => { g.position.z = -4.9; g.visible = k < c8; g.userData.fl.scale.set(1, 1 + 0.2 * Math.sin(f * 0.9 + k), 1); }); G.c8light.intensity = c8 ? 6 : 0;
  // gavel + coins
  const gv = Wd.gavel || 0; G.gavel.rotation.z = Math.sin(Math.min(1, gv) * Math.PI) * 1.1;
  const cn = Wd.coins || 0; G.coins.forEach((m, k) => { m.visible = cn > 0; if (!cn) return; const u = Math.min(1, Math.max(0, cn * 1.4 - rnd(k, 1) * 0.4)); m.position.set(-900 + (rnd(k, 2) - 0.5) * 1.6, 3.4 - u * 2.35, -1.2 + (rnd(k, 3) - 0.5) * 0.8); m.rotation.set(u * 9 * rnd(k, 4), 0, u * 6); });
  const bg = Wd.bags || 0; G.bags.forEach((b, k) => { b.visible = bg > 0; if (!bg) return; const u = Math.min(1, Math.max(0, bg * 4 - k * 0.6)); b.position.set(-901.1 + k * 0.62, 1.06 + (1 - u) * 1.5, -1.6 + (k % 2) * 0.2); b.scale.setScalar(Math.max(0.01, u)); });
}
