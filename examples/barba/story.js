// VID-010 v3 Hans Steininger (Braunau 1567): tripped on his own 1.4 m beard fleeing a fire. Death implied (hat rolls), no gore.
import * as T from './toon.js';
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
const HANS = { jacket: '#2a3a5a', pants: '#2a2a30', boots: T.INK, hat: 'tophat', buttons: '#e8c45a', build: 'stout', skin: T.SKINS[0] };
const town = (v) => T.townsfolk(v);
const LIGHTS = {
  day: { skyTop: 0x6a9ed8, skyBot: 0xe8e4dc, sun: 0xfff2dc, sunI: 2.2, sunDir: [-0.45, 0.75, 0.5], hemiTop: 0xe0ecff, hemiBot: 0x6a5a4a, hemiI: 1.05, fogNear: 60, fogFar: 260 },
  fire: { skyTop: 0x2a1a20, skyBot: 0x8a4a2a, sun: 0xffa060, sunI: 1.6, sunDir: [0.6, 0.6, 0.4], hemiTop: 0xd89a6a, hemiBot: 0x2a1410, hemiI: 0.9, fogNear: 50, fogFar: 200 },
  museum: { skyTop: 0x2a2018, skyBot: 0x3a2a20, sun: 0xffe8c8, sunI: 1.7, sunDir: [0.3, 0.9, 0.6], hemiTop: 0xfff0d8, hemiBot: 0x2a1a10, hemiI: 1.0, fogNear: 40, fogFar: 150, fillI: 2.5, fill: 0xffc080 },
  dusk: { skyTop: 0x2a3c74, skyBot: 0xe8a08a, sun: 0xffb08a, sunI: 2.0, sunDir: [-0.8, 0.3, 0.4], hemiTop: 0x9aa0d8, hemiBot: 0x3a2a3a, hemiI: 0.95, fogNear: 60, fogFar: 300 },
};
export const lightFor = (k) => LIGHTS[k];
const S = [];
const K = (pos, look, fov = 40, roll = 0) => ({ pos, look, fov, roll });
const glide = (k0, k1, e = ss, x = {}) => (u) => ({ pos: L3(k0.pos, k1.pos, e(u)), look: L3(k0.look, k1.look, e(u)), fov: k0.fov + (k1.fov - k0.fov) * e(u), roll: (k0.roll || 0) + ((k1.roll || 0) - (k0.roll || 0)) * e(u), ...x });
const shot = (id, a, light, cam, actors = () => []) => S.push({ id, a: a === 0 ? 0 : a - 1, light, cam, actors });
const HP = [-1, 0, 2], CHIN = 1.2;
const runX = (f, f0, f1) => 4 - lin(f, f0, f1) * 6;
// 0 HOOK: Hans runs from the fire, his beard trailing, steps on it and goes down (frame 0 running)
const TRIP0 = frac(0, 0.55);
shot('hook', 0, 'fire', glide(K([-3, 2.2, 10], [5, 3, -6], 50), K([-2.4, 1.8, 8.6], [3, 2.2, -4], 48), ss, { shadow: 12, kick: 0.02 }),
  (f) => { const x = runX(f, 0, TRIP0); return [A('hs', HANS, [x, 0, 0.4], f < TRIP0 ? { view: 'side', mode: 'march', phase: (f * 0.13) % 1, expr: 'shock', flip: true } : { mode: 'fall', expr: 'shock', roll: lin(f, TRIP0, TRIP0 + 10) * 1.2 })]; });
// 1 Braunau, Austria, 1567 (square with the town hall)
shot('braunau', at(1), 'day', glide(K([10, 6, 13], [-4, 6, -9], 50), K([5, 4, 12], [-4, 7, -9], 50), ss, { shadow: 30 }),
  (f) => [A('t1', town(1), [2, 0, 4], { view: 'side', mode: 'stroll', phase: (f * 0.05) % 1 }), A('t2', town(4), [-6, 0, 3], { expr: 'smile' })]);
// 2 Hans Steininger was the mayor, highly respected (on the town hall steps, people bow)
shot('mayor', at(2), 'day', glide(K([-4, 2.6, 7], [-4, 2.0, -6.4], 46), K([-4, 2.4, 5.6], [-4, 2.0, -6.4], 42), ss, { shadow: 14 }),
  (f) => [A('hs', HANS, [-4, 1.2, -6.6], { expr: 'smile', wave: 0.5, blink: blink(f, 1) }), A('t3', town(2), [-6, 0, -3], { expr: 'grin', facing: 1 }), A('t4', town(3), [-2, 0, -3], { expr: 'grin', facing: -1 })]);
// 3 but everybody knew him for something else (push in to his face/pouch)
shot('else', at(3), 'day', glide(K([HP[0], 1.8, HP[2] + 4.4], [HP[0], 1.5, HP[2]], 42), K([HP[0], 1.6, HP[2] + 3.2], [HP[0], 1.1, HP[2]], 40), ss, { shadow: 10 }),
  (f) => [A('hs', HANS, HP, { expr: 'smile_closed', blink: blink(f, 1) })]);
// 4 his beard was almost 1.5 m long, down to the floor (tilt from chin to the ground)
shot('beard', at(4), 'day', glide(K([HP[0], 1.7, HP[2] + 3.2], [HP[0], 1.5, HP[2]], 42), K([HP[0] + 0.4, 0.6, HP[2] + 3.4], [HP[0] + 0.2, 0.3, HP[2] + 0.6], 44), ss, { shadow: 10 }),
  (f) => [A('hs', HANS, HP, { expr: 'grin', blink: blink(f, 1) }), A('kd', T.KID, [HP[0] + 1.4, 0, HP[2] + 0.6], { expr: 'shock', facing: -1 })]);
// 5 so he kept it rolled up in a little leather pouch
shot('pouch', at(5), 'day', glide(K([HP[0] + 0.6, 1.3, HP[2] + 2.2], [HP[0] + 0.1, 0.8, HP[2]], 40), K([HP[0] + 0.5, 1.2, HP[2] + 1.8], [HP[0] + 0.1, 0.8, HP[2]], 36), ss, { shadow: 8 }),
  (f) => [A('hs', HANS, HP, { expr: 'smile', blink: blink(f, 1) })]);
// 6 one day, a fire broke out (house in flames, people run)
shot('firestart', at(6), 'fire', glide(K([8, 3, 12], [15, 7, -11], 48), K([6, 3, 10], [15, 8, -11], 46), ss, { shadow: 24, kick: 0.01 }),
  (f) => [A('r1', town(0), [9, 0, 0], { view: 'side', mode: 'march', phase: (f * 0.13) % 1, expr: 'shock', flip: true }), A('r2', town(5), [12, 0, 2], { view: 'side', mode: 'march', phase: (f * 0.13 + 0.5) % 1, expr: 'shock', flip: true })]);
// 7 Hans ran out... in such a hurry he didn't roll up the beard (side tracking, beard trailing)
const R7a = at(7), R7b = nx(8);
shot('run', at(7), 'fire', (u) => { const f = R7a + u * (nx(7) - R7a), x = -4 + lin(f, R7a, R7b) * 6; return { pos: [x + 0.6, 1.3, 6], look: [x + 0.6, 0.9, 0.4], fov: 42, shadow: 12 }; },
  (f) => [A('hs', HANS, [-4 + lin(f, R7a, R7b) * 6, 0, 0.4], { view: 'side', mode: 'march', phase: (f * 0.13) % 1, expr: 'shock' })]);
// 8 he stepped on it (low close: boot lands on the beard)
const STEP = frac(8, 0.4);
shot('step', at(8), 'fire', glide(K([0.8, 0.45, 2.6], [0.6, 0.2, 0.4], 40), K([0.8, 0.4, 2.3], [0.6, 0.2, 0.4], 38), ss, { shadow: 6 }),
  (f) => [A('hs', HANS, [-4 + lin(f, R7a, R7b) * 6, 0, 0.4], { view: 'side', mode: 'march', phase: f < STEP ? (f * 0.13) % 1 : 0.25, expr: 'shock', roll: f > STEP ? -0.2 : 0 })]);
// 9 tripped, fell and broke his neck (the fall; cut to his hat rolling away)
const FALL = at(9), DOWN = frac(9, 0.45);
shot('fall', at(9), 'fire', glide(K([2.4, 1.4, 5.4], [1.6, 0.8, 0.4], 44), K([2.4, 1.2, 5.0], [1.6, 0.6, 0.4], 42), ss, { shadow: 10, kick: 0.03 }),
  (f) => f < DOWN ? [A('hs', HANS, [2, lin(f, FALL, DOWN) * 0.2, 0.4], { mode: 'fall', expr: 'shock', roll: -0.3 - lin(f, FALL, DOWN) * 1.1 })] : []);
// 10 at least, that's what the town's story says (a chronicle page)
shot('legend', at(10), 'museum', glide(K([300.6, 2.2, 0.6], [300, 2.0, -2.2], 40), K([300.4, 2.0, -0.2], [300, 1.8, -2.2], 36), ss, { shadow: 8 }));
// 11 and the beard?
shot('andbeard', at(11), 'museum', glide(K([300, 2.0, 1.6], [300, 1.9, -2.2], 40), K([300, 2.0, 1.0], [300, 1.9, -2.2], 34), ss, { shadow: 8 }));
// 12 they cut it off and kept it as a keepsake (scissors snip)
shot('cut', at(12), 'museum', glide(K([300.6, 1.9, 0.6], [300, 1.6, -2.2], 40), K([300.4, 1.8, 0.2], [300, 1.6, -2.2], 36), ss, { shadow: 8 }));
// 13 today it's still on display in a museum in Austria (visitors at the case)
shot('museum', at(13), 'museum', glide(K([302.6, 2.2, 3.4], [300, 1.8, -2.2], 46), K([302.0, 2.1, 2.8], [300, 1.8, -2.2], 44), ss, { shadow: 10 }),
  (f) => [A('v1', town(2), [301.6, 0, -0.8], { expr: 'shock', facing: -1 }), A('v2', T.KID, [298.8, 0, -0.6], { expr: 'grin', facing: 1 })]);
// 14 the man left. The beard stayed. (empty square, hat on the cobbles / beard in the case)
shot('stayed', at(14), 'dusk', glide(K([1.6, 0.9, 3.6], [1.2, 0.2, 0.6], 40), K([2.0, 1.4, 4.6], [1.2, 0.2, 0.6], 44), ss, { shadow: 10 }));
// 15 nobody plans their end -> loop
shot('end', at(15), 'dusk', glide(K([10, 6, 13], [-4, 6, -9], 50), K([10, 16, 13], [-4, 6, -9], 54), ss, { shadow: 40 }));
shot('loop', N - 12, 'fire', glide(K([-3, 2.2, 10], [5, 3, -6], 50), K([-3, 2.2, 10], [5, 3, -6], 50), ss, { shadow: 12 }),
  (f) => [A('hs', HANS, [4, 0, 0.4], { view: 'side', mode: 'march', phase: (f * 0.13) % 1, expr: 'shock', flip: true })]);
S.forEach((s, i) => { s.b = i + 1 < S.length ? S[i + 1].a : N; });
export const SHOTS = S;
export const shotAt = (f) => S.findLast((s) => f >= s.a) || S[0];
export const camAt = (f) => { const s = shotAt(f); return s.cam((f - s.a) / Math.max(1, s.b - s.a)); };
export const actorsAt = (f) => shotAt(f).actors(f);
export const worldAt = (f) => {
  const s = shotAt(f), id = s.id, W = { flash: 0, black: 0, museum: true };
  const trail = (x, len = 1.3, d = -1) => ({ chin: [x - d * 0.25, CHIN, 0.4], trail: len, dir: d });
  if (['hook', 'firestart', 'run', 'step', 'fall', 'loop'].includes(id)) W.fire = 1;
  if (id === 'hook' || id === 'loop') { const x = id === 'loop' ? 4 : runX(f, 0, TRIP0); W.beard = f < TRIP0 || id === 'loop' ? trail(x, 1.3, 1) : { chin: [x - 0.4, 0.9 - lin(f, TRIP0, TRIP0 + 10) * 0.6, 0.4], trail: 1.3, dir: 1, tilt: -0.8 }; }
  if (id === 'mayor') W.beard = { chin: [-4, 1.2 + CHIN, -6.6], pouch: true };
  if (id === 'else' || id === 'pouch') W.beard = { chin: [HP[0], CHIN, HP[2]], pouch: true };
  if (id === 'beard') W.beard = { chin: [HP[0], CHIN, HP[2]], trail: 0.5 };
  if (id === 'run') W.beard = trail(-4 + lin(f, R7a, R7b) * 6);
  if (id === 'step') W.beard = trail(-4 + lin(f, R7a, R7b) * 6, 1.4);
  if (id === 'fall') { if (f < DOWN) W.beard = { chin: [2.2, 0.9, 0.4], trail: 1.2, dir: -1, tilt: 1 }; else W.hat = [2 + lin(f, DOWN, nx(9)) * 1.6, 0.4, 0.8]; }
  if (id === 'cut') W.scissors = [300.1, 2.5, -1.7];
  if (id === 'stayed') W.hat = [1.2, 0.4, 0.6];
  return W;
};
