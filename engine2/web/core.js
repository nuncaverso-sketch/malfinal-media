// Mal Final engine v2: stylized 3D (CC0 Quaternius kits + Poly Haven HDRI light), ACES, soft shadows,
// bloom, depth-of-field, depth-edge ink lines, display-space grade. A video supplies scene.js:
//   export const FRAMES; export async function build(K); export function frame(f, K)  (K.cam/K.light/K.dof set per frame)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { makeChar, poseChar } from './char.js';
import * as S from './scene.js';

const qs = new URLSearchParams(location.search);
const W = +(qs.get('w') || 1080), H = Math.round(W * 16 / 9);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(35, W / H, 0.1, 900);

// ---------- lights ----------
const sun = new THREE.DirectionalLight(0xffffff, 3); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4; scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x6b4a3a, 0.6); scene.add(hemi);
const rim = new THREE.DirectionalLight(0x9fc4ff, 0.0); scene.add(rim, rim.target);
const pmrem = new THREE.PMREMGenerator(renderer);
const envs = {};
async function env(name) { if (!envs[name]) { const t = await new RGBELoader().loadAsync(`assets/hdri/${name}.hdr`); t.mapping = THREE.EquirectangularReflectionMapping; envs[name] = pmrem.fromEquirectangular(t).texture; t.dispose(); } return envs[name]; }

// ---------- sky ----------
const skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { top: { value: new THREE.Color(0x3a6fd8) }, mid: { value: new THREE.Color(0x9cc7ff) }, bot: { value: new THREE.Color(0xffe2b8) }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color(0xfff0c0) }, sunSize: { value: 0.0 } },
  vertexShader: 'varying vec3 vp; void main(){ vp=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position.z=gl_Position.w; }',
  fragmentShader: `uniform vec3 top,mid,bot,sunCol,sunDir; uniform float sunSize; varying vec3 vp;
  void main(){ float y=vp.y; vec3 c = y>0.12 ? mix(mid,top,smoothstep(0.12,0.75,y)) : mix(bot,mid,smoothstep(-0.05,0.12,y));
    float d=max(dot(normalize(vp),normalize(sunDir)),0.); c += sunCol*(smoothstep(1.-sunSize*0.004,1.-sunSize*0.0035,d)*3.0 + pow(d,64.)*0.5*sunSize);
    gl_FragColor=vec4(c,1.); }` });
const sky = new THREE.Mesh(new THREE.SphereGeometry(800, 32, 16), skyMat); sky.renderOrder = -1; scene.add(sky);
scene.fog = new THREE.Fog(0xffe2b8, 40, 260);

// ---------- post ----------
const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 0 });
const depthRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.UnsignedByteType }); const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
const composer = new EffectComposer(renderer, rt); composer.setPixelRatio(1); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, cam));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.22, 0.5, 2.2); composer.addPass(bloom);
const lensPass = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, tDepth: { value: depthRT.texture }, res: { value: new THREE.Vector2(W, H) }, near: { value: 0.1 }, far: { value: 900 },
    focus: { value: 6 }, aperture: { value: 0.0 }, maxBlur: { value: 14 }, ink: { value: 0.75 }, inkCol: { value: new THREE.Color(0x1a1218) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `#include <packing>
  uniform sampler2D tDiffuse, tDepth; uniform vec2 res; uniform float near,far,focus,aperture,maxBlur,ink; uniform vec3 inkCol; varying vec2 vUv;
  float lin(vec2 uv){ float d=unpackRGBAToDepth(texture2D(tDepth,uv)); return near*far/(far-d*(far-near)); }
  float coc(float z){ float c=abs(1.-focus/max(z,0.001))*aperture*res.y*0.01; return clamp(c-0.8, 0., maxBlur); }
  void main(){
    float z=lin(vUv); float c=coc(z); vec3 acc=texture2D(tDiffuse,vUv).rgb; float wsum=1.;
    if(c>0.3){ for(int i=0;i<24;i++){ float a=float(i)*2.39996; float r=sqrt((float(i)+0.5)/24.)*c; vec2 o=vec2(cos(a),sin(a))*r/res;
        float zs=lin(vUv+o); float cs=coc(zs); float w = zs<z ? smoothstep(0.,1.,cs/max(r,0.5)) : 1.; acc+=texture2D(tDiffuse,vUv+o).rgb*w; wsum+=w; } }
    vec3 col=acc/wsum;
    // depth-edge ink (silhouettes), fades with blur and distance
    vec2 px=1.2/res; float zl=lin(vUv-vec2(px.x,0.)), zr=lin(vUv+vec2(px.x,0.)), zu=lin(vUv+vec2(0.,px.y)), zd=lin(vUv-vec2(0.,px.y));
    float e=max(max(abs(zl-z),abs(zr-z)),max(abs(zu-z),abs(zd-z)))/z; float edge=smoothstep(0.035,0.09,e)*ink*(1.-smoothstep(1.,5.,c))*(1.-smoothstep(60.,180.,z));
    col=mix(col,inkCol*0.08,edge);
    if(maxBlur<0.){ gl_FragColor=vec4(vec3(texture2D(tDepth,vUv).x), 1.); return; }
    gl_FragColor=vec4(col,1.); }` });
lensPass.uniforms.tDepth.value = depthRT.texture;
composer.addPass(lensPass);
composer.addPass(new OutputPass());
const gradePass = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, sat: { value: 1.18 }, con: { value: 1.06 }, warm: { value: new THREE.Vector3(1.03, 1.0, 0.96) }, shadowTint: { value: new THREE.Vector3(0.96, 0.98, 1.06) }, vig: { value: 0.28 }, grain: { value: 0.025 }, seed: { value: 0 }, flash: { value: 0 }, black: { value: 0 }, res: { value: new THREE.Vector2(W, H) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float sat,con,vig,grain,seed,flash,black; uniform vec3 warm,shadowTint; uniform vec2 res; varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233))+seed)*43758.5453); }
  void main(){ vec3 c=texture2D(tDiffuse,vUv).rgb; float l=dot(c,vec3(0.299,0.587,0.114));
    c=mix(vec3(l),c,sat); c=(c-0.5)*con+0.5; c*=mix(shadowTint,warm,smoothstep(0.1,0.8,l));
    vec2 q=vUv-0.5; q.x*=res.x/res.y; c*=1.-vig*smoothstep(0.35,0.95,length(q)*1.25);
    c+= (h(vUv*res)-0.5)*grain; c=mix(c,vec3(1.),flash); c=mix(c,vec3(0.),black);
    gl_FragColor=vec4(clamp(c,0.,1.),1.); }` });
composer.addPass(gradePass);
composer.addPass(new SMAAPass(W, H));

// ---------- assets ----------
const loader = new GLTFLoader(); const cache = {};
function stylize(root, o = {}) {
  root.traverse((m) => { if (!m.isMesh) return; m.castShadow = o.shadow !== false; m.receiveShadow = true;
    const fix = (mat) => { const n = mat.clone(); n.roughness = Math.max(n.roughness ?? 0.7, o.rough ?? 0.72); n.metalness = Math.min(n.metalness ?? 0, 0.15); n.envMapIntensity = o.env ?? 0.8;
      if (o.tint) n.color.multiply(new THREE.Color(o.tint)); if (n.color) { const hsl = {}; n.color.getHSL(hsl); n.color.setHSL(hsl.h, Math.min(1, hsl.s * (o.satBoost ?? 1.15)), hsl.l); } return n; };
    m.material = Array.isArray(m.material) ? m.material.map(fix) : fix(m.material); });
  return root;
}
async function load(path) { if (!cache[path]) cache[path] = (await loader.loadAsync(`assets/quaternius/${path}.glb`)).scene; return cache[path]; }
async function place(path, pos = [0, 0, 0], rotY = 0, scale = 1, o = {}) {
  const src = await load(path); const m = stylize(SkeletonUtils.clone(src), o);
  m.position.set(...pos); m.rotation.y = rotY; if (Array.isArray(scale)) m.scale.set(...scale); else m.scale.setScalar(scale);
  (o.parent || scene).add(m); return m;
}
function sizeOf(obj) { const b = new THREE.Box3().setFromObject(obj); const s = new THREE.Vector3(); b.getSize(s); return { box: b, size: s }; }
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, ...o });
function ground(col, size = 400, rough = 0.95) { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), std(col, { roughness: rough })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; scene.add(m); return m; }
function cloud(pos, s = 1, col = 0xffffff) { const g = new THREE.Group(); const mat = std(col, { roughness: 1, emissive: col, emissiveIntensity: 0.35 });
  const R = (k) => { const x = Math.sin(k * 91.7 + pos[0]) * 43758.5; return x - Math.floor(x); };
  for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), mat); const r = 0.7 + R(i) * 0.8; b.scale.set(r * 1.3, r * 0.8, r); b.position.set((i - 3) * 0.95 + R(i + 9) * 0.4, R(i + 3) * 0.5 + (3 - Math.abs(i - 3)) * 0.25, R(i + 5) * 0.6); g.add(b); }
  g.position.set(...pos); g.scale.setScalar(s); g.userData.noCull = true; scene.add(g); return g; }

// ---------- per-frame state ----------
const K = { THREE, scene, cam, sun, hemi, rim, sky, skyMat, composer, bloom, lens: lensPass.uniforms, grade: gradePass.uniforms, renderer,
  load, place, stylize, sizeOf, std, ground, cloud, env, makeChar, poseChar, W, H,
  async setEnv(name, intensity = 0.8) { scene.environment = await env(name); scene.environmentIntensity = intensity; },
  light(L) { // {sunDir:[x,y,z], sun, sunI, hemiTop, hemiBot, hemiI, rim, rimI, exposure, sky:[top,mid,bot], sunSize, fog:[col,near,far], envI}
    if (L.sunDir) sun.userData.dir = new THREE.Vector3(...L.sunDir).normalize();
    if (L.sun !== undefined) sun.color.set(L.sun); if (L.sunI !== undefined) sun.intensity = L.sunI;
    if (L.hemiTop !== undefined) hemi.color.set(L.hemiTop); if (L.hemiBot !== undefined) hemi.groundColor.set(L.hemiBot); if (L.hemiI !== undefined) hemi.intensity = L.hemiI;
    if (L.rim !== undefined) rim.color.set(L.rim); if (L.rimI !== undefined) rim.intensity = L.rimI;
    if (L.exposure !== undefined) renderer.toneMappingExposure = L.exposure;
    if (L.sky) { skyMat.uniforms.top.value.set(L.sky[0]); skyMat.uniforms.mid.value.set(L.sky[1]); skyMat.uniforms.bot.value.set(L.sky[2]); }
    if (L.sunSize !== undefined) skyMat.uniforms.sunSize.value = L.sunSize;
    if (L.fog) { scene.fog.color.set(L.fog[0]); scene.fog.near = L.fog[1]; scene.fog.far = L.fog[2]; }
    if (L.envI !== undefined) scene.environmentIntensity = L.envI;
  },
  focusOn(p) { K.lens.focus.value = cam.position.distanceTo(new THREE.Vector3(...p)); },
  shot(pos, look, fov = 35, roll = 0) { cam.position.set(...pos); cam.up.set(0, 1, 0); cam.lookAt(...look); cam.fov = fov; cam.rotateZ(roll); cam.updateProjectionMatrix();
    K.lens.focus.value = cam.position.distanceTo(new THREE.Vector3(...look)); },
  shadowSpan: 14, CULL: 140,
};

// ---------- authoring kit ----------
async function placeH(path, pos, rotY = 0, h = 1, o = {}) { // scale model so its height == h (or width if o.byW)
  const src = await load(path); const { size } = sizeOf(src); const k = o.byW ? h / Math.max(size.x, size.z) : h / size.y;
  return place(path, pos, rotY, k, o); }
const PRESETS = {
  golden: { sunDir: [-0.6, 0.35, -0.7], sun: 0xffbe85, sunI: 3.4, hemiTop: 0xa8c8ff, hemiBot: 0x7a5038, hemiI: 0.7, exposure: 1.05, sky: [0x3c5fb8, 0xf2a6a0, 0xffd29a], sunSize: 1, fog: [0xf5c9a8, 30, 220], envI: 0.55, env: 'venice_sunset' },
  day: { sunDir: [0.5, 0.8, 0.45], sun: 0xfff1dc, sunI: 3.2, hemiTop: 0xbfdcff, hemiBot: 0x8a7a60, hemiI: 0.8, exposure: 1.0, sky: [0x2f6fe0, 0x8ec2ff, 0xdcefff], sunSize: 0.6, fog: [0xd4e8ff, 40, 300], envI: 0.6, env: 'kloppenheim_06_puresky' },
  dusk: { sunDir: [0.7, 0.18, -0.6], sun: 0xff9a6a, sunI: 2.6, hemiTop: 0x7c86d8, hemiBot: 0x5a3a48, hemiI: 0.7, exposure: 1.05, sky: [0x232a6e, 0x9b5f9e, 0xff9f6e], sunSize: 1.2, fog: [0xc8849a, 30, 200], envI: 0.5, env: 'qwantani_dusk_2' },
  night: { sunDir: [-0.4, 0.7, 0.3], sun: 0x9fb8ff, sunI: 1.1, hemiTop: 0x4a5fa8, hemiBot: 0x1a1a30, hemiI: 0.55, exposure: 1.15, sky: [0x070b24, 0x1a2a66, 0x3a4a8a], sunSize: 0, fog: [0x1a2448, 20, 160], envI: 0.35, env: 'satara_night_no_lamps' },
  interior: { sunDir: [0.45, 0.75, 0.5], sun: 0xffd7a0, sunI: 2.2, hemiTop: 0xffe6c8, hemiBot: 0x5a3a2a, hemiI: 0.9, exposure: 1.1, sky: [0x2a1a14, 0x3a2418, 0x4a2e1e], sunSize: 0, fog: [0x2a1a14, 40, 200], envI: 0.45, env: 'venice_sunset' },
  candle: { sunDir: [0.3, 0.8, 0.6], sun: 0xffd2a0, sunI: 1.4, hemiTop: 0xc89a78, hemiBot: 0x2a1a14, hemiI: 0.65, exposure: 1.2, sky: [0x0a0606, 0x140a08, 0x1e100a], sunSize: 0, fog: [0x120a08, 12, 60], envI: 0.25, env: 'satara_night_no_lamps' },
  storm: { sunDir: [0.2, 0.9, -0.3], sun: 0xb8c8e0, sunI: 1.6, hemiTop: 0x8090a8, hemiBot: 0x2a3038, hemiI: 0.8, exposure: 1.0, sky: [0x2a3040, 0x4a5466, 0x6a7484], sunSize: 0, fog: [0x4a5466, 15, 140], envI: 0.4, env: 'kloppenheim_06_puresky' },
};
K.placeH = placeH; K.PRESETS = PRESETS;
K.preset = (name, over = {}) => { const L = { ...PRESETS[name], ...over }; if (L.env && envs[L.env]) scene.environment = envs[L.env]; K.light(L); };
K.preloadEnvs = async () => { for (const n of new Set(Object.values(PRESETS).map((p) => p.env))) await env(n); scene.environment = envs.venice_sunset; };
K.timing = async (url = 'timing.json') => { const t = await (await fetch(url)).json(); K.T = t; K.ph = t.phrases.map((p) => ({ a: Math.round(p.start * 30), b: Math.round(p.end * 30), text: p.text })); return t; };
K.ease = (u) => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
K.lerp = (a, b, u) => Array.isArray(a) ? a.map((x, i) => x + (b[i] - x) * u) : a + (b - a) * u;
// camera move: from {p,l,fov} to {p,l,fov} over u (0..1, eased); optional handheld shake
K.move = (A, B, u, shake = 0.6, f = 0) => { const e = K.ease(u); const p = K.lerp(A.p, B.p || A.p, e), l = K.lerp(A.l, B.l || A.l, e), fov = K.lerp(A.fov || 35, (B.fov || A.fov || 35), e);
  const s = 0.01 * shake; p[0] += Math.sin(f * 0.07) * s * 2; p[1] += Math.sin(f * 0.051 + 1) * s * 1.5; K.shot(p, l, fov, Math.sin(f * 0.033) * 0.004 * shake); };
// phrase helpers: which phrase index is active at frame f, and progress inside it
K.at = (f) => { let i = 0; for (let k = 0; k < K.ph.length; k++) if (f >= K.ph[k].a - 4) i = k; return i; };
K.u = (f, i, i2 = i) => { const a = K.ph[i].a - 4, b = (K.ph[i2 + 1] ? K.ph[i2 + 1].a - 4 : K.ph[i2].b + 30); return Math.min(1, Math.max(0, (f - a) / (b - a))); };
K.box = (w, h, d, col, pos, o = {}) => { const { parent: _p, seg: _s, ...mo } = o; const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), std(col, mo)); m.position.set(...pos); m.castShadow = m.receiveShadow = true; (o.parent || scene).add(m); return m; };
K.cyl = (r1, r2, h, col, pos, o = {}) => { const { parent: _p, seg: _s, ...mo } = o; const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, o.seg || 24), std(col, mo)); m.position.set(...pos); m.castShadow = m.receiveShadow = true; (o.parent || scene).add(m); return m; };
K.sph = (r, col, pos, o = {}) => { const { parent: _p, seg: _s, ...mo } = o; const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), std(col, mo)); m.position.set(...pos); m.castShadow = m.receiveShadow = true; (o.parent || scene).add(m); return m; };
K.tex = (w, h, fn, rep = [1, 1]) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
K.plane = (w, h, mat, pos, rot = [-Math.PI / 2, 0, 0]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(...pos); m.rotation.set(...rot); m.receiveShadow = true; scene.add(m); return m; };
K.pointLight = (col, i, pos, dist = 12) => { const l = new THREE.PointLight(col, i, dist, 1.6); l.position.set(...pos); scene.add(l); return l; };

// auto-framing for 9:16: targets = [[x,y,z],...] (feet positions of characters or object centres). yaw: direction FROM subjects TO camera (0 = camera on +z side)
K.frame = (targets, o = {}) => {
  const n = targets.length; const c = [0, 0, 0]; for (const t of targets) for (let i = 0; i < 3; i++) c[i] += t[i] / n;
  const yaw = o.yaw ?? 0, pitch = o.pitch ?? 0.12, fov = o.fov ?? 34, h = o.h ?? 2.3; // h = subject height
  const right = [Math.cos(yaw), 0, -Math.sin(yaw)]; let half = 0.6; for (const t of targets) half = Math.max(half, Math.abs((t[0] - c[0]) * right[0] + (t[2] - c[2]) * right[2]) + 0.55);
  const vf = fov * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * (W / H));
  let d = Math.max((half * (o.pad ?? 1.15)) / Math.tan(hf / 2), (h * 0.5 * (o.vpad ?? 1.25)) / Math.tan(vf / 2)) * (o.push ?? 1);
  const ly = c[1] + (o.lookY ?? h * 0.55);
  const p = [c[0] + Math.sin(yaw) * Math.cos(pitch) * d, ly + Math.sin(pitch) * d + (o.camY ?? 0), c[2] + Math.cos(yaw) * Math.cos(pitch) * d];
  return { p, l: [c[0] + (o.lx ?? 0) * right[0], ly, c[2] + (o.lx ?? 0) * right[2]], fov, d };
};

await S.build(K);
window.FRAMES = S.FRAMES;
window.renderFrame = (f) => {
  K.grade.seed.value = f * 0.37; K.grade.flash.value = 0; K.grade.black.value = 0; K.grade.sat.value = 1.18; K.grade.vig.value = 0.28; K.lens.aperture.value = 0.4;
  for (const o of scene.children) if (o.userData.culled) { o.visible = true; o.userData.culled = false; }
  S.frame(f, K);
  // set culling: everything farther than CULL m from the camera is hidden for this frame (sets live 200 m apart)
  const cp = cam.position;
  for (const o of scene.children) {
    if (!o.visible || o === sky || o === sun || o === sun.target || o === hemi || o === rim || o === rim.target || o.isPoints || o.userData.noCull) continue;
    if (o.userData.off === undefined) { if (o.isLight) o.userData.off = [0, 0, 0]; else { const b = new THREE.Box3().setFromObject(o); if (b.isEmpty()) { o.userData.off = [0, 0, 0]; } else { const c = new THREE.Vector3(); b.getCenter(c); o.userData.off = [c.x - o.position.x, c.y - o.position.y, c.z - o.position.z]; const sz = new THREE.Vector3(); b.getSize(sz); o.userData.rad = sz.length() / 2; } } }
    const off = o.userData.off; const dx = o.position.x + off[0] - cp.x, dy = o.position.y + off[1] - cp.y, dz = o.position.z + off[2] - cp.z;
    const lim = K.CULL + (o.userData.rad || 0) * (o.userData.rad > 60 ? 0 : 1);
    if (dx * dx + dy * dy + dz * dz > lim * lim) { o.visible = false; o.userData.culled = true; }
  }
  const look = new THREE.Vector3(); cam.getWorldDirection(look); look.multiplyScalar(K.lens.focus.value).add(cam.position);
  const d = sun.userData.dir || new THREE.Vector3(0.5, 1, 0.4).normalize();
  sun.target.position.copy(look); sun.position.copy(look).addScaledVector(d, 60);
  const s = K.shadowSpan; Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 140 }); sun.shadow.camera.updateProjectionMatrix();
  rim.target.position.copy(look); rim.position.copy(look).add(new THREE.Vector3(-d.x, 0.6, -d.z).multiplyScalar(40));
  skyMat.uniforms.sunDir.value.copy(d); sky.position.copy(cam.position);
  const nd = []; scene.traverse((o) => { if (o.userData.noDepth && o.visible) { o.visible = false; nd.push(o); } }); scene.overrideMaterial = depthMat; renderer.shadowMap.autoUpdate = false; renderer.setRenderTarget(depthRT); renderer.setClearColor(0xffffff, 1); renderer.clear(); renderer.render(scene, cam);
  scene.overrideMaterial = null; for (const o of nd) o.visible = true; renderer.shadowMap.autoUpdate = true; renderer.setRenderTarget(null);
  composer.render();
  return renderer.domElement.toDataURL('image/jpeg', 0.93);
};
window.ready = true;
