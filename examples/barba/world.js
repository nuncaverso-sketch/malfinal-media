// VID-010 v3 world: Braunau 1567. Town square at origin (town hall z=-10, steps), burning house x=14; museum x=300.
let G = {};
export function build(E) {
  const { THREE, scene, add, box, toon, R, ctex, P } = E;
  const ink = toon(0x2a2430);
  const sq = new THREE.Mesh(new THREE.PlaneGeometry(120, 80), toon(0xffffff, P.cobble([24, 16]))); sq.rotation.x = -Math.PI / 2; sq.receiveShadow = true; scene.add(sq);
  const walls = ['#e8d8b8', '#d8c0a0', '#f0e0c0', '#c8b098', '#e0c8a8'], roofs = [0xa83a2a, 0x8a3a2a, 0x9a4a2a];
  const house = (x, z, w, h, k, ry = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); box(w, h, 6, toon(0xffffff, P.plaster(walls[k % 5], [1, 1])), [0, h / 2, 0], null, g, 1);
    const rf = add(new THREE.ConeGeometry(w * 0.72, 3.6, 4), toon(roofs[k % 3]), [0, h + 1.8, 0], [0, Math.PI / 4, 0], g, 1); rf.scale.z = 0.85;
    for (let fl = 0; fl < Math.floor(h / 3); fl++) for (const wx of [-w / 4, w / 4]) box(1, 1.4, 0.1, toon(0x2a3448), [wx, 1.8 + fl * 3, 3.05], null, g, 0); box(1.2, 2.2, 0.1, toon(0x4a2e1a), [0, 1.1, 3.05], null, g, 0); return g; };
  for (let k = 0; k < 6; k++) house(-30 + k * 9, -14, 8, 7 + (k % 2) * 3, k);
  for (let k = 0; k < 6; k++) house(-30 + k * 9, 18, 8, 7 + (k % 2) * 3, k + 2, Math.PI);
  // town hall with tower and steps (z=-10)
  const th = new THREE.Group(); th.position.set(-4, 0, -9); scene.add(th); box(10, 9, 5, toon(0xffffff, P.plaster('#f0e4c8', [2, 2])), [0, 4.5, -1], null, th, 1); box(3, 16, 3, toon(0xffffff, P.plaster('#e8d8b8', [1, 3])), [0, 8, -1], null, th, 1); add(new THREE.ConeGeometry(2.6, 5, 8), toon(0x3a6a5a), [0, 18.5, -1], [0, 0, 0], th, 1);
  add(new THREE.CircleGeometry(1, 24), toon(0xf4ecd8), [0, 13, 0.55], [0, 0, 0], th, 0); add(new THREE.PlaneGeometry(5, 1), new THREE.MeshBasicMaterial({ map: P.sign('RATHAUS · BRAUNAU', '#2d1b10', '#f2c14e') }), [-4, 7.2, -6.4], [0, 0, 0], scene, 0);
  for (let k = 0; k < 4; k++) box(6, 0.3, 0.6, toon(0xa8a49a), [0, 0.15 + k * 0.3, 2.6 - k * 0.6], null, th, 1);
  add(new THREE.CylinderGeometry(1.2, 1.4, 1, 16), toon(0xa8a49a), [8, 0.5, 2], [0, 0, 0], scene, 1); add(new THREE.CylinderGeometry(0.15, 0.15, 3, 8), toon(0xa8a49a), [8, 2, 2], [0, 0, 0], scene, 1);
  // the burning house (x=14, z=-14 is house k=5? we add flames over house at x=15 z=-14)
  G.fire = []; for (let k = 0; k < 22; k++) G.fire.push(add(new THREE.ConeGeometry(0.6 + R(k) * 0.8, 1.6 + R(k * 3) * 2, 8), new THREE.MeshBasicMaterial({ color: [0xff6a10, 0xffa020, 0xffd040][k % 3], transparent: true, opacity: 0.9 }), [0, -10, 0], [0, 0, 0], scene, 0));
  G.smoke = []; for (let k = 0; k < 20; k++) G.smoke.push(add(new THREE.SphereGeometry(1.2 + R(k) * 1.2, 8, 6), new THREE.MeshToonMaterial({ color: 0x4a4a4a, gradientMap: E.grad, transparent: true, opacity: 0.55, depthWrite: false }), [0, -10, 0], [0, 0, 0], scene, 0));
  G.fl = new THREE.PointLight(0xff8a30, 0, 30, 1.4); G.fl.position.set(12, 6, -8); scene.add(G.fl);
  // the beard: hanging strip from the chin + trailing strip on the ground; pouch
  const btex = ctex(96, 512, (g, w, h) => { g.clearRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8a5a30'); gr.addColorStop(1, '#6a3e1c'); g.fillStyle = gr; g.beginPath(); g.moveTo(10, 0); g.lineTo(86, 0); for (let y = 0; y <= h; y += 16) g.lineTo(78 + Math.sin(y * 0.05) * 8, y); g.quadraticCurveTo(48, h + 10, 18, h - 4); for (let y = h; y >= 0; y -= 16) g.lineTo(18 + Math.sin(y * 0.05 + 1) * 8, y); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(200,150,90,0.55)'; g.lineWidth = 3; for (let k = 0; k < 9; k++) { g.beginPath(); for (let y = 0; y < h; y += 8) g.lineTo(26 + k * 6 + Math.sin(y * 0.04 + k) * 5, y); g.stroke(); } g.strokeStyle = '#2a1608'; g.lineWidth = 4; g.stroke(); });
  const bm = new THREE.MeshToonMaterial({ map: btex, gradientMap: E.grad, side: THREE.DoubleSide, transparent: true, alphaTest: 0.4 });
  G.beard = new THREE.Group(); scene.add(G.beard); G.bHang = add(new THREE.PlaneGeometry(0.34, 1, 1, 8), bm, [0, 0, 0], [0, 0, 0], G.beard, 0); G.bTrail = add(new THREE.PlaneGeometry(0.34, 1, 1, 8), bm, [0, 0, 0], [-Math.PI / 2, 0, 0], G.beard, 0);
  G.pouch = add(new THREE.SphereGeometry(0.2, 12, 10), toon(0x5a3a1a), [0, 0, 0], [0, 0, 0], scene, 1); G.pouch.scale.set(0.55, 0.7, 0.4);
  // his hat rolling away (aftermath)
  G.hat = new THREE.Group(); scene.add(G.hat); add(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16), toon(0x2a2228), [0, 0, 0], [0, 0, 0], G.hat, 1); add(new THREE.CylinderGeometry(0.24, 0.28, 0.32, 14), toon(0x2a2228), [0, 0.17, 0], [0, 0, 0], G.hat, 1); add(new THREE.SphereGeometry(0.06, 6, 5), toon(0xe8c45a), [0.25, 0.2, 0], [0, 0, 0], G.hat, 0);
  // ---- museum x=300 ----
  const mu = new THREE.Group(); mu.position.set(300, 0, 0); scene.add(mu); box(10, 0.2, 8, toon(0xffffff, P.planks('#6a4a2a', [3, 3])), [0, -0.1, 0], null, mu, 0); box(10, 5, 0.3, toon(0xffffff, P.wallpaper([2, 1])), [0, 2.5, -3.5], null, mu, 0);
  box(1.4, 1.0, 1.0, toon(0x3a2416), [0, 0.5, -2.2], null, mu, 1); add(new THREE.BoxGeometry(1.3, 1.9, 0.9), new THREE.MeshToonMaterial({ color: 0xc8e4f4, gradientMap: E.grad, transparent: true, opacity: 0.25, depthWrite: false }), [0, 1.95, -2.2], [0, 0, 0], mu, 0);
  G.mbeard = add(new THREE.PlaneGeometry(0.3, 1.5, 1, 8), bm, [300, 1.95, -2.2], [0, 0, 0], scene, 0);
  add(new THREE.PlaneGeometry(2.6, 0.5), new THREE.MeshBasicMaterial({ map: P.sign('HANS STEININGER · 1567', '#2d1b10', '#f2c14e') }), [300, 3.6, -3.3], [0, 0, 0], scene, 0);
  G.scissors = new THREE.Group(); scene.add(G.scissors); for (const s of [-1, 1]) box(0.5, 0.04, 0.06, toon(0xa8a8b0), [0, 0, 0], [0, 0, s * 0.3], G.scissors, 0);
  for (let k = 0; k < 10; k++) { const c = new THREE.Group(); for (let j = 0; j < 4; j++) add(new THREE.SphereGeometry(8 + R(k * 4 + j) * 5, 10, 8), toon(0xffffff, null, { emissive: 0x777777 }), [j * 9 - 14, R(j + k) * 4, R(j * 3) * 5], [0, 0, 0], c, 0); c.position.set(-300 + R(k) * 600, 70 + R(k * 3) * 30, -300 + R(k * 7) * 200); scene.add(c); }
}
const rnd = (i, k) => { const x = Math.sin((i + k) * 9301 + 49297) * 233280; return x - Math.floor(x); };
export function update(f, Wd, E) {
  const t = f / 30;
  const fi = Wd.fire || 0; G.fire.forEach((m, k) => { m.visible = fi > 0; if (!fi) return; m.position.set(15 + (rnd(k, 1) - 0.5) * 7, 6 + rnd(k, 2) * 6 + Math.sin(t * 8 + k) * 0.3, -11 + rnd(k, 3) * 1.5); m.scale.set(fi, fi * (1 + Math.sin(t * 9 + k) * 0.2), fi); });
  G.smoke.forEach((m, k) => { m.visible = fi > 0; if (!fi) return; const u = (t * 0.25 + rnd(k, 4)) % 1; m.position.set(15 + (rnd(k, 5) - 0.5) * 6, 12 + u * 14, -11 + (rnd(k, 6) - 0.5) * 3); m.scale.setScalar(1 + u * 2); m.material.opacity = 0.55 * (1 - u); });
  G.fl.intensity = fi * (60 + Math.sin(t * 13) * 15);
  const b = Wd.beard; G.beard.visible = !!b; G.pouch.visible = !!(b && b.pouch);
  if (b) { const [x, y, z] = b.chin, drop = b.pouch ? 0.5 : y; G.bHang.scale.y = drop; G.bHang.position.set(x, y - drop / 2, z + 0.08); G.bHang.rotation.z = b.tilt || 0;
    const tl = b.pouch ? 0 : (b.trail ?? 0.4); G.bTrail.visible = tl > 0.05; G.bTrail.scale.y = Math.max(0.05, tl); G.bTrail.position.set(x + (b.dir || 0) * tl / 2, 0.02, z + 0.08 + (b.dir ? 0 : tl / 2)); G.bTrail.rotation.set(-Math.PI / 2, 0, b.dir ? Math.PI / 2 : 0);
    if (b.pouch) G.pouch.position.set(x + 0.1, y - 0.7, z + 0.15); }
  const h = Wd.hat; G.hat.visible = !!h; if (h) { G.hat.position.set(...h); G.hat.rotation.set(1.57, 0, t * 3); }
  G.mbeard.visible = Wd.museum !== false; const sc = Wd.scissors; G.scissors.visible = !!sc; if (sc) { G.scissors.position.set(...sc); G.scissors.children[0].rotation.z = 0.3 + Math.sin(f * 0.8) * 0.25; G.scissors.children[1].rotation.z = -0.3 - Math.sin(f * 0.8) * 0.25; }
}
