// VID-003 v3 Franz Reichelt, Eiffel Tower jump (1912). Every beat shown; the fall cuts away before impact (dust, no gore).
import * as T from './toon.js';
import { PLAT, RAIL_Z } from './world.js';
export const FPS = 30;
const TIM = await (await fetch('timing.json')).json();
const P = TIM.phrases.map((p) => ({ s: Math.round(p.start * FPS), e: Math.round(p.end * FPS) }));
const N = Math.round(TIM.duration * FPS);
const cl = (t) => Math.max(0, Math.min(1, t));
const ss = (t) => { t = cl(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const lin = (f, a, b) => cl((f - a) / Math.max(1, b - a));
const at = (i, o = 0) => P[i].s + o, nx = (i) => (i + 1 < P.length ? P[i + 1].s : N);
const frac = (i, k) => at(i) + Math.round((nx(i) - at(i)) * k);
const blink = (f, s) => ((f + s * 37) % 97) < 3;
const A = (id, outfit, pos, o = {}) => ({ id, outfit, pos, view: 'front', mode: 'stand', expr: 'neutral', seed: id.length * 7 + id.charCodeAt(0), blink: false, ...o });
const FR = { jacket: '#3a2a2a', pants: '#2a2228', boots: T.INK, hat: 'cap', cap: '#6a4a2a', moustache: '#3a2a1a', buttons: '#c8a050', skin: T.SKINS[0] };
const COP = { jacket: '#2a3a6a', pants: '#2a2a3a', boots: T.INK, hat: 'cap', cap: '#1a2a5a', moustache: '#2a2020', buttons: '#e8c45a', skin: T.SKINS[1] };
const CHIEF = { ...COP, build: 'stout', moustache: '#8a8a8a', skin: T.SKINS[0] };
const town = (v) => T.townsfolk(v);
const LIGHTS = {
  winter: { skyTop: 0x8aa0bc, skyBot: 0xdfe2e4, sun: 0xfff2e4, sunI: 2.0, sunDir: [-0.4, 0.6, 0.6], hemiTop: 0xe0e8f0, hemiBot: 0x6a6a5a, hemiI: 1.1, fogNear: 200, fogFar: 1100 },
  shop: { skyTop: 0x3a2a22, skyBot: 0x5a4030, sun: 0xffe2b8, sunI: 1.9, sunDir: [0.5, 0.85, 0.6], hemiTop: 0xfff0d8, hemiBot: 0x4a3020, hemiI: 1.15, fogNear: 60, fogFar: 200, fillI: 2.5, fill: 0xffc080 },
  dusk: { skyTop: 0x2a3c74, skyBot: 0xf0a07a, sun: 0xffb08a, sunI: 2.0, sunDir: [-0.8, 0.3, 0.4], hemiTop: 0x9aa0d8, hemiBot: 0x3a2a3a, hemiI: 0.95, fogNear: 200, fogFar: 1100 },
};
export const lightFor = (k) => LIGHTS[k];
const S = [];
const K = (pos, look, fov = 40, roll = 0) => ({ pos, look, fov, roll });
const glide = (k0, k1, e = ss, x = {}) => (u) => ({ pos: L3(k0.pos, k1.pos, e(u)), look: L3(k0.look, k1.look, e(u)), fov: k0.fov + (k1.fov - k0.fov) * e(u), roll: (k0.roll || 0) + ((k1.roll || 0) - (k0.roll || 0)) * e(u), ...x });
const shot = (id, a, light, cam, actors = () => []) => S.push({ id, a: a === 0 ? 0 : a - 1, light, cam, actors });
const WS = 300, CY = 600, OF = -300, RX = 2, RY = PLAT + 1.42, RZ = RAIL_Z + 0.15;
const JUMP = at(12) + 4, LAND = nx(13) - 2;
const fallP = (f) => { const u = lin(f, JUMP, LAND); return [RX, RY - (RY - 0.2) * u * u, RZ + 0.6 + u * 2.2]; };
const reich = (f, o = {}) => A('fr', FR, o.pos || [RX, RY, RZ], { expr: 'neutral', blink: blink(f, 1), ...o });
// 0 HOOK: on the railing 57 m up, the camera swoops in; he leans out
shot('hook', 0, 'winter', glide(K([9, RY + 5, RZ + 16], [RX, RY + 1, RZ], 48), K([4.5, RY + 2.0, RZ + 6], [RX, RY + 1.0, RZ], 42), (t) => 1 - Math.pow(1 - cl(t), 3), { shadow: 20, kick: 0.012 }),
  (f) => [reich(f, { expr: f > frac(0, 0.6) ? 'grin' : 'nervous', wave: 0.9, tilt: Math.sin(f * 0.1) * 0.05 })]);
// 1 Franz Reichelt, tailor in Paris (workshop)
shot('shop', at(1), 'shop', glide(K([WS + 0.6, 2.2, 4.6], [WS, 2.0, -2], 46), K([WS + 0.4, 2.1, 3.6], [WS, 2.0, -2], 42), ss, { shadow: 10 }),
  (f) => [A('fr', FR, [WS - 0.2, 0, -1.2], { expr: 'smile', talk: true, blink: blink(f, 1) })]);
// 2 obsessed: a suit that opens like a parachute so pilots could survive (plan + biplane model)
shot('plan', at(2), 'shop', glide(K([WS + 2, 2.6, -0.6], [WS + 2, 2.6, -3.8], 40), K([WS + 2.8, 2.9, 0.6], [WS + 3.2, 3.3, -2.4], 46), ss, { shadow: 8 }),
  (f) => [A('fr', FR, [WS + 0.6, 0, -2.6], { expr: 'grin', facing: 1, wave: 0.5, blink: blink(f, 1) })]);
// 3 tested with dummies: they all fell like stones (dummy drops from a window, thud)
const DROP = frac(3, 0.15), THUD = frac(3, 0.5);
shot('dummy', at(3), 'winter', glide(K([CY + 6, 4, 12], [CY, 4, -2], 50), K([CY + 6.5, 3, 13], [CY, 2, -2], 50), ss, { shadow: 16, kick: 0.01 }),
  (f) => [A('fr', FR, [CY + 3, 0, 1.4], { expr: f > THUD ? 'nervous' : 'neutral', facing: -1, blink: blink(f, 1) })]);
// 4 but he was sure (close, confident)
shot('sure', at(4), 'shop', glide(K([WS + 0.4, 2.0, 1.8], [WS - 0.2, 1.9, -1.2], 36), K([WS + 0.3, 2.0, 1.2], [WS - 0.2, 1.9, -1.2], 32), ss, { shadow: 8 }),
  (f) => [A('fr', FR, [WS - 0.2, 0, -1.2], { expr: 'grin', blink: blink(f, 1) })]);
// 5 Feb 1912: permission for a test at the Eiffel Tower (establishing)
shot('tower', at(5), 'winter', glide(K([0, 8, 150], [0, 60, 0], 50), K([10, 14, 120], [0, 70, 0], 52), ss, { shadow: 60 }));
// 6 the police's condition: use a dummy
shot('cop', at(6), 'winter', glide(K([3.6, 2.1, 26], [2.4, 1.9, 21], 40), K([3.4, 2.0, 25.2], [2.4, 1.9, 21], 36), ss, { shadow: 10 }),
  (f) => [A('cp', COP, [2.0, 0, 21], { expr: 'stern', talk: true, wave: 0.5, blink: blink(f, 2) })]);
// 7 arrived early with the suit on (walks across the Champ de Mars)
const walk7 = (f) => -4 + lin(f, at(7), nx(7)) * 5;
shot('arrive', at(7), 'winter', (u) => { const f = at(7) + u * (nx(7) - at(7)), x = walk7(f); return { pos: [x + 1, 2.0, 30], look: [x, 1.6, 22], fov: 44, shadow: 12 }; },
  (f) => [reich(f, { pos: [walk7(f), 0, 22], view: 'side', mode: 'march', phase: (f * 0.07) % 1, expr: 'grin' }), A('ph', town(2), [3, 0, 25.5], { expr: 'neutral', facing: -1 })]);
// 8 no dummy: he would jump himself (crowd shocked)
shot('himself', at(8), 'winter', glide(K([1.2, 2.2, 28], [1, 1.8, 22], 46), K([1.0, 2.1, 26.6], [1, 1.8, 22], 42), ss, { shadow: 10 }),
  (f) => [reich(f, { pos: [1, 0, 22], expr: 'grin', talk: true, wave: 0.7 }), A('cp', COP, [-0.6, 0, 21.2], { expr: 'shock', facing: 1 }), A('ph', town(2), [2.6, 0, 21.4], { expr: 'shock', facing: -1 })]);
// 9 friends begged him not to
shot('beg', at(9), 'winter', glide(K([1.6, 2.1, 27], [1, 1.8, 22], 42), K([1.2, 2.0, 26], [1, 1.8, 22], 40), ss, { shadow: 10 }),
  (f) => [reich(f, { pos: [1, 0, 22], expr: 'neutral' }), A('f1', town(0), [-0.5, 0, 22.4], { expr: 'nervous', facing: 1, wave: 0.8 }), A('f2', town(3), [2.5, 0, 22.4], { expr: 'nervous', facing: -1, wave: 0.6 })]);
// 10 he climbed onto the first-floor railing, 57 m up (looking down past him to the tiny crowd)
shot('rail', at(10), 'winter', glide(K([RX - 0.9, RY + 2.2, RZ - 4.5], [RX, RY - 2, RZ + 6], 52), K([RX - 0.7, RY + 2.0, RZ - 3.8], [RX, RY - 5, RZ + 9], 54), ss, { shadow: 20 }),
  (f) => [reich(f, { expr: 'nervous', pos: [RX, RY - 1.3 + lin(f, at(10), frac(10, 0.4)) * 1.3, RZ - 0.3 + lin(f, at(10), frac(10, 0.4)) * 0.3] })]);
// 11 he hesitated 40 seconds (slow push-in on his face, wind)
shot('doubt', at(11), 'winter', glide(K([RX + 1.2, RY + 1.6, RZ + 4], [RX, RY + 1.3, RZ], 40), K([RX + 0.5, RY + 1.5, RZ + 2.6], [RX, RY + 1.4, RZ], 30), ss, { shadow: 8, kick: 0.006 }),
  (f) => [reich(f, { expr: 'nervous', look: 1, tilt: Math.sin(f * 0.15) * 0.04 })]);
// 12-13 and he jumped; the suit never opened (tracking the fall, cut before the ground)
shot('jump', at(12), 'winter', (u) => { const f = at(12) + u * (LAND - at(12)), p = fallP(f); return { pos: [p[0] + 7, p[1] + 3, p[2] + 10], look: [p[0], p[1] - 1, p[2]], fov: 48, shadow: 20, kick: 0.015 }; },
  (f) => { const p = fallP(f); return [reich(f, f < JUMP ? { expr: 'nervous' } : { pos: p, mode: 'fall', expr: 'shock', roll: lin(f, JUMP, LAND) * 2.4, noBlob: true })]; });
// 14 newspaper cameras filmed everything (photographers, dust settling far behind)
shot('film', at(14), 'winter', glide(K([10, 2, 33], [6, 1.6, 26], 44), K([9.4, 1.9, 32], [5, 1.4, 22], 46), ss, { shadow: 12 }),
  (f) => [A('p1', town(2), [4.6, 0, 27.6], { expr: 'shock', facing: -1 }), A('p2', town(5), [8.6, 0, 28.4], { expr: 'stern', facing: -1 })]);
// 15 the first accidental death ever filmed (old-film replay of the leap)
shot('reel', at(15), 'winter', (u) => { const p = fallP(JUMP + u * (LAND - JUMP) * 0.55); return { pos: [p[0] + 8, p[1] + 2, p[2] + 16], look: [p[0], p[1] - 1, p[2]], fov: 46, shadow: 20 }; },
  (f) => { const g = JUMP + lin(f, at(15), nx(15)) * (LAND - JUMP) * 0.55; return [reich(f, { pos: fallP(g), mode: 'fall', expr: 'shock', roll: 1, noBlob: true, still: true })]; });
// 16 the police chief: he'd never have allowed him to jump himself (office, newspaper)
shot('chief', at(16), 'shop', glide(K([OF + 0.6, 2.2, 3.4], [OF, 1.9, -1.6], 44), K([OF + 0.5, 2.1, 2.6], [OF, 1.9, -1.6], 40), ss, { shadow: 10 }),
  (f) => [A('ch', CHIEF, [OF - 0.6, 0, -2.4], { expr: 'stern', talk: true, blink: blink(f, 3) })]);
// 17 too late (empty folded suit on the ground, crowd walking away)
shot('late', at(17), 'dusk', glide(K([RX + 2.6, 1.2, 18], [RX, 0.2, 13], 40), K([RX + 2.2, 1.6, 19], [RX, 0.2, 13], 44), ss, { shadow: 10 }));
// 18 the invention only proved it didn't work (plan with a red X, suit on the mannequin)
shot('nofun', at(18), 'shop', glide(K([WS + 0.6, 2.4, 2.4], [WS + 1, 2.2, -3.4], 46), K([WS + 1.6, 2.6, 0.6], [WS + 2, 2.6, -3.8], 42), ss, { shadow: 8 }));
// 19 nobody plans their end (dusk tower, pull back) -> loop
shot('end', at(19), 'dusk', glide(K([0, 10, 110], [0, 60, 0], 50), K([0, 6, 170], [0, 70, 0], 54), ss, { shadow: 60 }));
shot('loop', N - 14, 'winter', glide(K([9, RY + 5, RZ + 16], [RX, RY + 1, RZ], 48), K([9, RY + 5, RZ + 16], [RX, RY + 1, RZ], 48), ss, { shadow: 20 }),
  (f) => [reich(f, { expr: 'nervous', wave: 0.9 })]);
S.forEach((s, i) => { s.b = i + 1 < S.length ? S[i + 1].a : N; });
export const SHOTS = S;
export const shotAt = (f) => S.findLast((s) => f >= s.a) || S[0];
export const camAt = (f) => { const s = shotAt(f); return s.cam((f - s.a) / Math.max(1, s.b - s.a)); };
export const actorsAt = (f) => shotAt(f).actors(f);
export const worldAt = (f) => {
  const s = shotAt(f), id = s.id, W = { flash: 0, black: 0 };
  const onRail = { p: [RX, RY, RZ - 0.05], open: 0.3 };
  if (['hook', 'rail', 'doubt', 'loop'].includes(id)) W.cape = id === 'rail' ? { p: [RX, RY - 1.3 + lin(f, at(10), frac(10, 0.4)) * 1.3, RZ - 0.35] } : onRail;
  if (id === 'jump') { if (f < JUMP) W.cape = onRail; else { const p = fallP(f); W.cape = { p: [p[0], p[1], p[2] - 0.05], open: 0.12, fast: true, rz: lin(f, JUMP, LAND) * 2.4 }; } }
  if (id === 'reel') { const g = JUMP + lin(f, at(15), nx(15)) * (LAND - JUMP) * 0.55, p = fallP(g); W.cape = { p: [p[0], p[1], p[2] - 0.05], open: 0.12, fast: true, rz: 1 }; W.sepia = 1; }
  if (id === 'arrive' || id === 'himself' || id === 'beg') { const x = id === 'arrive' ? walk7(f) : 1; W.cape = { p: [x, 0, 21.95], open: 0.25 }; }
  if (id === 'shop' || id === 'sure') W.cape = null;
  if (id === 'dummy') { const u = lin(f, DROP, THUD); W.dummy = f < THUD ? { p: [CY - 1.5, 9.4 - u * u * 9.4, -2.6 + u * 1.2], rz: u * 2.5 } : { p: [CY - 1.5, 0.15, -1.4], rz: 1.57 }; W.dust = f > THUD ? lin(f, THUD, THUD + 18) : 0; W.dustAt = [CY - 1.5, 0, -1.4]; }
  if (id === 'film') { W.dust = 0.4 + lin(f, at(14), nx(14)) * 0.6; W.dustAt = [RX, 0, RZ + 3]; W.camFlash = (f - at(14)) % 24 < 2; }
  if (id === 'late') W.cape = { p: [RX, 0.05, 13], open: 1.4, rz: 1.57 };
  if (id === 'nofun') W.planX = f > frac(18, 0.35);
  return W;
};
