// Shared cartoon-3D engine: toon materials + ink hulls, soft shadows, sky, billboard cards, camera drift/kicks, 2D composite.
// A video provides world.js (export build(E), update(f, Wd, E)) and story.js (SHOTS, shotAt, camAt, lightFor, worldAt, actorsAt).
import * as THREE from 'three';
import * as T from './toon.js';
import * as P from './paint.js';
import * as story from './story.js';
import * as world from './world.js';

const W = +(new URLSearchParams(location.search).get('w') || 720), H = Math.round(W * 16 / 9);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 1200);

const grad = (() => { const d = new Uint8Array([105, 105, 175, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.LinearFilter; t.needsUpdate = true; return t; })();
const toon = (col, map, o = {}) => new THREE.MeshToonMaterial({ color: col, map: map || null, gradientMap: grad, ...o });
const hullMat = (k) => { const m = new THREE.MeshBasicMaterial({ color: 0x1c1018, side: THREE.BackSide }); m.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = position + normal * ${k};`); }; return m; };
const inkMat = hullMat('0.04'), inkThin = hullMat('0.014');
function add(geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], parent = scene, ink = 1) {
  const m = new THREE.Mesh(geo, mat); m.position.set(...pos); m.rotation.set(...rot); m.castShadow = m.receiveShadow = true; parent.add(m);
  if (ink) m.add(new THREE.Mesh(geo, ink === 2 ? inkThin : inkMat));
  return m;
}
const hullBox = (w, h, d) => { const g = new THREE.BoxGeometry(w, h, d); const n = g.attributes.normal, p = g.attributes.position; for (let i = 0; i < n.count; i++) { const v = new THREE.Vector3(Math.sign(p.getX(i)), Math.sign(p.getY(i)), Math.sign(p.getZ(i))).normalize(); n.setXYZ(i, v.x, v.y, v.z); } return g; };
const uvBox = (w, h, d, tile = 2) => { const g = new THREE.BoxGeometry(w, h, d); const uv = g.attributes.uv; const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / tile, uv.getY(i) * dims[f][1] / tile); } return g; };
const box = (w, h, d, mat, pos, rot, parent, ink = 1) => {
  const m = new THREE.Mesh(uvBox(w, h, d), mat); m.position.set(...pos); if (rot) m.rotation.set(...rot); m.castShadow = m.receiveShadow = true; (parent || scene).add(m);
  if (ink) m.add(new THREE.Mesh(hullBox(w, h, d), ink === 2 ? inkThin : inkMat));
  return m;
};
const R = (s) => { const x = Math.sin(s * 9301 + 49297) * 233280; return x - Math.floor(x); };
const ctex = (w, h, fn, rep = [1, 1]) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.radius = 7; sun.shadow.blurSamples = 16;
Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 0.5, far: 160 }); sun.shadow.bias = -0.0004; scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0); scene.add(hemi);
const fill = new THREE.PointLight(0xffb060, 0, 16, 1.5); scene.add(fill);
const spot = new THREE.SpotLight(0xfff2c8, 0, 40, 0.38, 0.6, 1.2); spot.castShadow = true; scene.add(spot, spot.target);

const skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { top: { value: new THREE.Color() }, bot: { value: new THREE.Color() } },
  vertexShader: 'varying vec3 vp; void main(){ vp=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: 'uniform vec3 top; uniform vec3 bot; varying vec3 vp; void main(){ float t=clamp(vp.y*1.6+0.15,0.,1.); gl_FragColor=vec4(mix(bot,top,t),1.);\n#include <colorspace_fragment>\n}' });
const sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 24, 12), skyMat); scene.add(sky);
scene.fog = new THREE.Fog(0xffffff, 60, 400);

const E = { THREE, T, P, scene, cam, add, box, toon, R, ctex, inkMat, inkThin, grad, sun, spot, fill };
world.build(E);

// ---------- cards ----------
const cards = new Map();
function card(id) {
  if (cards.has(id)) return cards.get(id);
  const c = document.createElement('canvas'); c.width = 600; c.height = 1000;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const mat = new THREE.MeshLambertMaterial({ map: t, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.55 });
  const geo = new THREE.PlaneGeometry(1.35, 2.25); geo.translate(0, 2.25 / 2 - 0.06, 0);
  const m = new THREE.Mesh(geo, mat); m.castShadow = true;
  m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.5 });
  const blob = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), new THREE.MeshBasicMaterial({ color: 0x1a0c14, transparent: true, opacity: 0.32, depthWrite: false })); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.02; blob.scale.set(1, 0.6, 1);
  const g = new THREE.Group(); g.add(m, blob); scene.add(g);
  const o = { g, m, blob, ctx: c.getContext('2d'), t, key: '' }; cards.set(id, o); return o;
}
function drawActor(a, f) {
  const o = card(a.id); o.g.visible = true;
  const seed = a.seed || 1, idle = a.still ? 0 : 1;
  const bob = idle * (0.012 * Math.sin(f * 0.21 + seed) + (a.talk ? 0.02 * Math.abs(Math.sin(f * 0.55)) : 0));
  o.g.position.set(a.pos[0], a.pos[1] + bob, a.pos[2]); const sc = a.scale || 1; o.g.scale.set(sc, sc * (1 + idle * 0.012 * Math.sin(f * 0.17 + seed)), sc);
  const dx = cam.position.x - a.pos[0], dz = cam.position.z - a.pos[2]; o.m.rotation.y = a.yaw ?? Math.atan2(dx, dz);
  o.m.rotation.z = (a.roll || 0) + idle * 0.018 * Math.sin(f * 0.13 + seed * 2);
  o.blob.visible = !a.noBlob;
  const key = JSON.stringify([a.view, a.outfit, a.expr, a.mode, a.phase?.toFixed(2), a.blink, a.tilt?.toFixed(2), a.wave?.toFixed(2), a.facing, a.look, a.flip, a.headTilt?.toFixed(2), a.prop]);
  if (key !== o.key) {
    o.key = key; const g = o.ctx; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 600, 1000);
    if (a.flip) { g.translate(600, 0); g.scale(-1, 1); }
    const p = new T.Pen(g); p.ol = 12;
    if (a.view === 'side') T.bodySide(p, a.outfit, { phase: a.phase || 0, expr: a.expr, mode: a.mode || 'march', blink: a.blink, seed, stride: a.stride || 0.8 });
    else T.bodyFront(p, a.outfit, { expr: a.expr, mode: a.mode || 'stand', blink: a.blink, seed, tilt: a.tilt || 0, wave: a.wave, facing: a.facing || 0, look: a.look || 0, phase: a.phase || 0, headTilt: a.headTilt || 0, prop: a.prop || null });
    o.t.needsUpdate = true;
  }
}

const v3 = (a) => new THREE.Vector3(...a);
const outC = document.createElement('canvas'); outC.width = W; outC.height = H; const out2d = outC.getContext('2d');
const vig = (() => { const g = out2d.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.78); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(20,8,16,0.38)'); return g; })();
window.renderFrame = (f) => {
  const S = story.shotAt(f), L = story.lightFor(S.light);
  skyMat.uniforms.top.value.set(L.skyTop); skyMat.uniforms.bot.value.set(L.skyBot); scene.fog.color.set(L.skyBot); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  sun.color.set(L.sun); sun.intensity = L.sunI; hemi.color.set(L.hemiTop); hemi.groundColor.set(L.hemiBot); hemi.intensity = L.hemiI;
  const C = story.camAt(f);
  const dr = 0.012 * (C.drift ?? 1), kick = C.kick || 0;
  cam.position.copy(v3(C.pos)).add(new THREE.Vector3(Math.sin(f * 0.071) * dr * 3, Math.sin(f * 0.053 + 1) * dr * 2, 0)).add(new THREE.Vector3(Math.sin(f * 2.1) * kick, Math.cos(f * 2.7) * kick, 0));
  sky.position.copy(cam.position); cam.lookAt(v3(C.look)); cam.fov = C.fov; cam.rotateZ((C.roll || 0) + Math.sin(f * 0.043) * 0.004 * (C.drift ?? 1)); cam.updateProjectionMatrix();
  const span = C.shadow || 16; Object.assign(sun.shadow.camera, { left: -span, right: span, top: span, bottom: -span }); sun.shadow.camera.updateProjectionMatrix();
  sun.position.copy(v3(C.look)).add(new THREE.Vector3(...L.sunDir).multiplyScalar(70)); sun.target.position.copy(v3(C.look));
  fill.position.copy(v3(C.look)).add(new THREE.Vector3(0, 2.5, 2.5)); fill.intensity = L.fillI || 0; fill.color.set(L.fill || 0xffb060);
  const Wd = story.worldAt(f);
  spot.intensity = Wd.spot ? Wd.spot.i : 0; if (Wd.spot) { spot.position.set(...Wd.spot.pos); spot.target.position.set(...Wd.spot.at); }
  world.update(f, Wd, E);
  for (const o of cards.values()) o.g.visible = false;
  for (const a of story.actorsAt(f)) drawActor(a, f);
  renderer.render(scene, cam);
  out2d.filter = Wd.sepia ? `sepia(${Wd.sepia}) contrast(1.15) brightness(0.95)` : 'none';
  out2d.drawImage(renderer.domElement, 0, 0); out2d.filter = 'none';
  if (Wd.sepia) { out2d.fillStyle = 'rgba(0,0,0,0.5)'; for (let i = 0; i < 6; i++) { const x = ((f * 37 + i * 211) % W); out2d.fillRect(x, 0, 1.5, H); } out2d.fillStyle = 'rgba(20,10,0,0.9)'; out2d.fillRect(0, 0, W, H * 0.06); out2d.fillRect(0, H * 0.94, W, H * 0.06);
    for (let i = 0; i < 9; i++) { out2d.fillStyle = 'rgba(230,220,190,0.9)'; out2d.fillRect(i * W / 9 + 10, H * 0.015, W / 18, H * 0.03); out2d.fillRect(i * W / 9 + 10, H * 0.955, W / 18, H * 0.03); } }
  out2d.fillStyle = vig; out2d.fillRect(0, 0, W, H);
  if (Wd.flash > 0) { out2d.fillStyle = `rgba(255,255,255,${Math.min(1, Wd.flash)})`; out2d.fillRect(0, 0, W, H); }
  if (Wd.black > 0) { out2d.fillStyle = `rgba(0,0,0,${Math.min(1, Wd.black)})`; out2d.fillRect(0, 0, W, H); }
  return outC.toDataURL('image/jpeg', 0.93);
};
window.FRAMES = story.SHOTS.at(-1).b; window.ready = true;
