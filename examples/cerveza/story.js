// VID-001 v3 La ola de cerveza (Londres 1814). Cartoon style, every key beat shown on screen. Pure in f.
import * as T from './toon.js';
export const FPS = 30;
const TIM = await (await fetch('timing.json')).json();
const P = TIM.phrases.map((p) => ({ s: Math.round(p.start * FPS), e: Math.round(p.end * FPS) }));
const N = Math.round(TIM.duration * FPS);
const WORDS = await (await fetch('words.json')).json();
const wordF = (re, p) => { const w = WORDS.find((x) => x.p === p && re.test(x.w.toLowerCase())); return w ? Math.round(w.s * FPS) : null; };
const cl = (t) => Math.max(0, Math.min(1, t));
const ss = (t) => { t = cl(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const eo = (t) => 1 - Math.pow(1 - cl(t), 3);
const L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const lin = (f, a, b) => cl((f - a) / Math.max(1, b - a));
const at = (i, o = 0) => P[i].s + o, nx = (i) => (i + 1 < P.length ? P[i + 1].s : N);
const frac = (i, k) => at(i) + Math.round((nx(i) - at(i)) * k);
const blink = (f, s) => ((f + s * 37) % 97) < 3;
const A = (id, outfit, pos, o = {}) => ({ id, outfit, pos, view: 'front', mode: 'stand', expr: 'neutral', seed: id.length * 7 + id.charCodeAt(0), blink: false, ...o });

const WORKER = { jacket: '#6a5a44', pants: '#3a3a30', boots: '#4a3426', hat: 'cap', cap: '#4a4a52', skin: T.SKINS[1] };
const BOSS = { jacket: '#3a4a3a', pants: '#2a2a22', boots: T.INK, hat: 'tophat', moustache: '#6a6a6a', buttons: '#e8c45a', build: 'stout', skin: T.SKINS[0] };
const MUM = { jacket: '#7a5a8a', pants: '#3b3f52', boots: '#4a3426', hat: 'bonnet', dress: '#7a5a8a', skin: T.SKINS[2] };
const DAD = { jacket: '#5a4a3a', pants: '#3a3a30', boots: '#4a3426', hat: 'cap', cap: '#3a3a3a', moustache: '#4a3020', skin: T.SKINS[0] };
const KID = { ...T.KID, jacket: '#c87a3a', skin: T.SKINS[0] };
const GRAN = { jacket: '#5a5a6a', pants: '#3b3f52', boots: '#4a3426', hat: 'bonnet', dress: '#5a5a6a', skin: T.SKINS[3] };
const JUDGE = { jacket: '#1e1e26', pants: '#1e1e26', boots: T.INK, hat: 'hair', hair: '#f0f0ea', build: 'stout', skin: T.SKINS[0] };
const town = (v) => T.townsfolk(v);

const LIGHTS = {
  day: { skyTop: 0x7a9ec8, skyBot: 0xe0e4e4, sun: 0xfff2dc, sunI: 2.2, sunDir: [-0.45, 0.75, 0.5], hemiTop: 0xe0ecff, hemiBot: 0x6a5a4a, hemiI: 1.05, fogNear: 60, fogFar: 260 },
  grey: { skyTop: 0x7a8290, skyBot: 0xc8ccd0, sun: 0xe8e8f0, sunI: 1.5, sunDir: [-0.3, 0.8, 0.5], hemiTop: 0xd0d4dc, hemiBot: 0x4a4a44, hemiI: 1.1, fogNear: 50, fogFar: 220 },
  inside: { skyTop: 0x3a2a22, skyBot: 0x5a4030, sun: 0xffe2b8, sunI: 1.9, sunDir: [0.5, 0.85, 0.6], hemiTop: 0xfff0d8, hemiBot: 0x4a3020, hemiI: 1.15, fogNear: 60, fogFar: 200, fillI: 2.5, fill: 0xffc080 },
  cellar: { skyTop: 0x1a1414, skyBot: 0x2a2220, sun: 0xc8d4e8, sunI: 1.3, sunDir: [0.2, 0.9, 0.7], hemiTop: 0x8a8070, hemiBot: 0x1a1210, hemiI: 0.8, fogNear: 30, fogFar: 120, fillI: 2, fill: 0xffb070 },
  wake: { skyTop: 0x141010, skyBot: 0x241c18, sun: 0xffd8a8, sunI: 0.9, sunDir: [0.3, 0.9, 0.6], hemiTop: 0x8a7060, hemiBot: 0x100a08, hemiI: 0.7, fogNear: 30, fogFar: 120, fillI: 3, fill: 0xffa860 },
  court: { skyTop: 0x2a2018, skyBot: 0x4a3828, sun: 0xffe8c8, sunI: 1.8, sunDir: [0.3, 0.9, 0.7], hemiTop: 0xfff0d8, hemiBot: 0x3a2818, hemiI: 1.1, fogNear: 60, fogFar: 200, fillI: 2, fill: 0xffd0a0 },
  dusk: { skyTop: 0x2a3c74, skyBot: 0xe8a08a, sun: 0xffb08a, sunI: 2.0, sunDir: [-0.8, 0.3, 0.4], hemiTop: 0x9aa0d8, hemiBot: 0x3a2a3a, hemiI: 0.95, fogNear: 60, fogFar: 300 },
};
export const lightFor = (k) => LIGHTS[k];
const S = [];
const K = (pos, look, fov = 40, roll = 0) => ({ pos, look, fov, roll });
const glide = (k0, k1, e = ss, x = {}) => (u) => ({ pos: L3(k0.pos, k1.pos, e(u)), look: L3(k0.look, k1.look, e(u)), fov: k0.fov + (k1.fov - k0.fov) * e(u), roll: (k0.roll || 0) + ((k1.roll || 0) - (k0.roll || 0)) * e(u), ...x });
const shot = (id, a, light, cam, actors = () => []) => S.push({ id, a: a === 0 ? 0 : a - 1, light, cam, actors });
const B = 300; // brewery x

// 0 HOOK: the brewery wall bursts and a wave of beer rushes at the camera (frame 0 already in motion)
const HOOK_B = frac(0, 0.55);
shot('hook', 0, 'day', glide(K([7, 6.5, 19], [0, 2.4, -5], 52), K([5, 5.2, 17], [0, 2.2, -3], 50), eo, { shadow: 30, kick: 0.04 }),
  (f) => { const k = lin(f, 0, HOOK_B); return [A('p1', town(1), [-3 + k * 1.5, 0, -1 + k * 7], { view: 'side', mode: 'march', phase: (f * 0.1) % 1, expr: 'shock', flip: true }), A('p2', town(4), [3.2, 0, 0.5 + k * 6], { view: 'side', mode: 'march', phase: (f * 0.11 + 0.4) % 1, expr: 'shock' })]; });
shot('hookB', HOOK_B, 'day', glide(K([-6, 7, 17], [1, 1.5, 0], 50), K([-7, 8.5, 18.5], [1, 1.2, 1], 50), ss, { shadow: 30, kick: 0.02 }),
  (f) => [A('p3', town(2), [-6, 0.0, 5], { expr: 'shock', wave: 1 }), A('p4', town(5), [6, 0.0, 4], { expr: 'shock', wave: 1 })]);
// 1 17 Oct, poor neighbourhood (calm street before)
shot('street', at(1), 'day', glide(K([-20, 4, 9], [-6, 3, -6], 46), K([-10, 3.5, 8], [4, 3, -6], 46), ss, { shadow: 24 }),
  (f) => [A('m1', MUM, [-9, 0, 0.5], { expr: 'smile', blink: blink(f, 1) }), A('k1', KID, [-7.8, 0, 1.0], { expr: 'grin', blink: blink(f, 2) }), A('w0', town(3), [-2 + lin(f, at(1), nx(1)) * 4, 0, -1.5], { view: 'side', mode: 'stroll', phase: (f * 0.05) % 1, expr: 'neutral' })]);
// 2 huge brewery, inside a 7 m tank (worker for scale)
shot('brew', at(2), 'day', glide(K([0, 3, 18], [0, 7, -7], 50), K([0, 2.5, 14], [0, 8, -7], 50), ss, { shadow: 30 }));
shot('tank', frac(2, 0.5), 'inside', glide(K([B + 7, 2, 7], [B, 3.6, -4], 46), K([B + 5, 1.8, 6], [B, 4.4, -4], 46), ss, { shadow: 16 }),
  (f) => [A('wk', WORKER, [B + 2.8, 0, -0.6], { expr: 'neutral', blink: blink(f, 3) })]);
// 3 giant iron hoops held it (pan up the tank)
shot('hoops', at(3), 'inside', glide(K([B + 3.4, 1.0, 2.4], [B, 1.0, -4], 40), K([B + 3.4, 6.2, 2.4], [B, 6.2, -4], 40), ss, { shadow: 12 }));
// 4 one 300 kg hoop slips (close, it drops)
shot('slip', at(4), 'inside', glide(K([B + 2.8, 2.8, 1.6], [B + 0.6, 2.2, -1.4], 40), K([B + 2.6, 2.0, 1.6], [B + 0.6, 1.0, -1.4], 40), ss, { shadow: 10, kick: 0.01 }));
// 5 a worker sees it and goes to tell his boss
shot('sees', at(5), 'inside', glide(K([B + 5, 2.2, 8], [B + 1.5, 1.6, -1.5], 46), K([B + 9.5, 2.2, 9], [B + 10, 1.6, 1.5], 46), ss, { shadow: 14 }),
  (f) => { const k = lin(f, frac(5, 0.4), nx(5)); return [A('bs', BOSS, [B + 10.4, 0, 2], { expr: 'neutral', facing: -1, blink: blink(f, 4) }), A('wk', WORKER, [B + 2.6 + k * 5, 0, 0.6], k > 0 ? { view: 'side', mode: 'march', phase: (f * 0.09) % 1, expr: 'nervous' } : { expr: 'shock', facing: -1, blink: blink(f, 3) })]; });
// 6 "relax, it's nothing"
shot('boss', at(6), 'inside', glide(K([B + 9.6, 2.3, 7], [B + 9.6, 1.9, 2], 38), K([B + 9.4, 2.2, 6.2], [B + 9.6, 1.9, 2], 34), ss, { shadow: 10 }),
  (f) => [A('bs', BOSS, [B + 10.4, 0, 2], { expr: 'smile_closed', talk: true, wave: 0.5, facing: -1, blink: blink(f, 4) }), A('wk', WORKER, [B + 8.6, 0, 2.6], { expr: 'nervous', facing: 1, blink: blink(f, 3) })]);
// 7 an hour later (clock spins) -> the tank BURSTS
const BURST = (wordF(/revent/, 7) ?? frac(7, 0.5)) - 3;
shot('clock', at(7), 'inside', glide(K([B - 6, 8, -6.4], [B - 6, 8, -9.7], 40), K([B - 6, 8, -6.9], [B - 6, 8, -9.7], 40), ss, { shadow: 8 }));
shot('burst', BURST, 'inside', glide(K([B + 9, 3.2, 12], [B + 1, 3.6, -4], 50), K([B + 10, 3.6, 14], [B + 1, 4, -4], 52), eo, { shadow: 24, kick: 0.07 }),
  (f) => { const k = lin(f, BURST, nx(7)); return [A('wk', WORKER, [B + 6 + k * 3, 0, 4 + k * 3], { view: 'side', mode: 'march', phase: (f * 0.13) % 1, expr: 'shock' })]; });
// 8 over half a million litres shoot out (wide, beer geyser + floor flooding)
shot('litres', at(8), 'inside', glide(K([B + 14, 6, 16], [B + 1, 4, -4], 54), K([B + 12, 7, 18], [B + 2, 4.5, -4], 54), ss, { shadow: 30, kick: 0.04 }));
// 9 dominoes: the neighbour tanks tip and burst
shot('domino', at(9), 'inside', glide(K([B + 2, 3, 12], [B + 9, 3, -4.5], 50), K([B + 6, 3.5, 13], [B + 12, 3, -4.8], 50), ss, { shadow: 24, kick: 0.05 }));
// 10 the wave knocks down the brewery wall and floods the streets (outside)
const WALL = at(10);
shot('wall', WALL, 'day', glide(K([10, 2.4, 14], [0, 3, -7], 50), K([12, 2.2, 18], [0, 2, -4], 52), eo, { shadow: 26, kick: 0.05 }),
  (f) => { const k = lin(f, WALL, nx(10)); return [A('r1', town(0), [6 + k * 8, 0, 1 + k * 4], { view: 'side', mode: 'march', phase: (f * 0.12) % 1, expr: 'shock' }), A('r2', town(5), [4 + k * 7, 0, 3 + k * 3], { view: 'side', mode: 'march', phase: (f * 0.12 + 0.5) % 1, expr: 'shock' })]; });
// 11 "and here comes the worst" (push in on a cellar window as beer pours in)
shot('worst', at(11), 'cellar', glide(K([601.2, 2.0, 2.4], [601.5, 2.4, -3.3], 46), K([600.6, 1.8, 3.6], [600.6, 1.6, -2], 46), ss, { shadow: 10 }),
  (f) => [A('d', DAD, [598.2, 0, -1], { expr: 'neutral' }), A('m', MUM, [599.4, 0, -0.6], { expr: 'neutral' }), A('k', KID, [600.6, 0, -0.4], { expr: 'neutral' })]);
// 12 families lived in cellars
shot('cellar', at(12), 'cellar', glide(K([600.4, 1.9, 4.6], [600, 1.2, -1.5], 46), K([600.3, 1.8, 3.8], [600, 1.2, -1.5], 42), ss, { shadow: 10 }),
  (f) => [A('d', DAD, [598.2, 0, -1], { expr: 'neutral', blink: blink(f, 5) }), A('m', MUM, [599.4, 0, -0.6], { expr: f > frac(12, 0.6) ? 'nervous' : 'neutral', look: 1, blink: blink(f, 6) }), A('k', KID, [600.6, 0, -0.4], { expr: 'neutral', blink: blink(f, 7) }), A('g', GRAN, [601.8, 0.0, -1.2], { mode: 'sit', expr: 'neutral' })]);
// 13 beer filled them in seconds
shot('fill', at(13), 'cellar', glide(K([600.4, 1.9, 4.6], [600.5, 1.4, -1.5], 46), K([600.4, 2.2, 5.2], [600.5, 1.6, -1.5], 48), ss, { shadow: 10, kick: 0.03 }),
  (f) => { const r = lin(f, at(13), nx(13)) * 1.3; return [A('d', DAD, [598.2, 0, -1], { expr: 'shock', wave: 1 }), A('m', MUM, [599.4, 0, -0.6], { expr: 'shock', wave: 0.8 }), A('k', KID, [600.6, r * 0.2, -0.4], { expr: 'shock' }), A('g', GRAN, [601.8, 0, -1.2], { expr: 'pained' })]; });
// 14 a family was holding a wake for a child (sombre, candles)
shot('wake', at(14), 'wake', glide(K([900.2, 2.7, 5.0], [900, 1.6, -2.0], 50), K([900.2, 2.6, 4.2], [900, 1.6, -2.0], 46), ss, { shadow: 10 }),
  (f) => [A('wm', MUM, [899.1, 0, -2.6], { expr: 'pained', headTilt: 0.15, blink: blink(f, 8) }), A('wd', DAD, [900.9, 0, -2.6], { expr: 'stern', headTilt: -0.1, blink: blink(f, 9) }), A('wg', GRAN, [898.3, 0, -1.0], { expr: 'pained', blink: blink(f, 10) })]);
// 15 the house came down (outside, the wake house collapses into the flood)
shot('collapse', at(15) - 6, 'grey', glide(K([22, 3, 9], [17, 4, -10], 50), K([23, 2.6, 11], [17, 3, -10], 52), ss, { shadow: 24, kick: 0.08 }));
// 16 eight died, none worked at the brewery (8 candles on a flooded doorstep, dusk)
shot('eight', at(16), 'dusk', glide(K([-25, 1.6, 3.2], [-25, 1.1, -5.5], 50), K([-25, 1.8, 4.4], [-25, 1.1, -5.5], 52), ss, { shadow: 10 }),
  (f) => { const n = Math.ceil(lin(f, at(16), frac(16, 0.55)) * 8); return [MUM, DAD, GRAN, KID, town(0), town(3), town(4), town(5)].map((o, k) => A('v' + k, o, [-27.2 + k * 0.62, 0, -6.2 + (k % 2) * 0.3], { expr: k % 3 ? 'pained' : 'stern', still: true })).slice(0, n); });
// 17 and the company? jury: "act of God"
shot('court', at(17), 'court', glide(K([-600, 3.3, 4.6], [-600, 3.2, -3], 44), K([-600.8, 3.1, 4.4], [-601.4, 3.3, -3], 42), ss, { shadow: 12 }),
  (f) => [A('jd', JUDGE, [-600, 2.3, -2.9], { expr: 'stern', talk: true, blink: blink(f, 11) }), ...[0, 1, 2].map((k) => A('ju' + k, town(k + 2), [-596.2 + k * 0.9, 0, -0.4 - k * 0.5], { expr: 'neutral', facing: -1 })), A('bs', BOSS, [-602.6, 0, 1.2], { expr: f > frac(17, 0.6) ? 'grin' : 'nervous', facing: 1, blink: blink(f, 4) })]);
// 18 it didn't pay the victims a penny (boss grins, gavel bangs)
shot('nopay', at(18), 'court', glide(K([-602.2, 2.0, 4.4], [-602.6, 1.9, 1.2], 38), K([-602.3, 2.0, 3.8], [-602.6, 1.9, 1.2], 34), ss, { shadow: 8 }),
  (f) => [A('bs', BOSS, [-602.6, 0, 1.2], { expr: 'grin', wave: 0.6, blink: blink(f, 4) }), A('vm', MUM, [-604.2, 0, 1.6], { expr: 'pained', facing: 1 })]);
// 19 the government even refunded the tax on the spilled beer (office, money bags, coins)
shot('tax', at(19), 'court', glide(K([-899.6, 2.4, 3.8], [-899.4, 1.4, -1.6], 48), K([-899.5, 2.1, 2.8], [-899.4, 1.4, -1.6], 44), ss, { shadow: 10 }),
  (f) => [A('bs', BOSS, [-898.0, 0, -2.6], { expr: f > frac(19, 0.55) ? 'laugh' : 'grin', wave: f > frac(19, 0.55) ? 0.9 : undefined, blink: blink(f, 4) })]);
// 20 bad ending for the neighbourhood (flooded street, families) / good business for the brewery (boss laughs)
shot('endA', at(20), 'dusk', glide(K([-15, 2.0, 7], [-20, 1.3, -4], 44), K([-14.4, 2.2, 7.8], [-19.6, 1.3, -4], 44), ss, { shadow: 20 }),
  (f) => [A('e1', MUM, [-21, 0.3, -3.2], { expr: 'pained' }), A('e2', KID, [-19.9, 0.3, -2.8], { expr: 'pained' }), A('e3', DAD, [-18.6, 0.3, -3.4], { expr: 'stern' })]);
shot('endB', frac(20, 0.5), 'court', glide(K([-897.9, 2.1, 1.4], [-898.0, 1.9, -2.6], 36), K([-897.9, 2.0, 0.6], [-898.0, 1.9, -2.6], 32), ss, { shadow: 8 }),
  (f) => [A('bs', BOSS, [-898.0, 0, -2.6], { expr: 'laugh', wave: 0.9 })]);
shot('loop', N - 14, 'day', glide(K([2, 2.2, 13], [0, 3.5, -7], 52), K([2, 2.2, 13], [0, 3.5, -7], 52), ss, { shadow: 24, kick: 0.05 }));
S.forEach((s, i) => { s.b = i + 1 < S.length ? S[i + 1].a : N; });
export const SHOTS = S;
export const shotAt = (f) => S.findLast((s) => f >= s.a) || S[0];
export const camAt = (f) => { const s = shotAt(f); return s.cam((f - s.a) / Math.max(1, s.b - s.a)); };
export const actorsAt = (f) => shotAt(f).actors(f);
export const worldAt = (f) => {
  const s = shotAt(f), id = s.id, W = { flash: 0, black: 0 };
  if (id === 'hook') { const k = lin(f, 0, HOOK_B); W.wallBurst = 0.15 + k * 0.85; W.wave = 0.1 + k * 0.75; W.flood = k * 0.6; W.spray = { c: [0, 2, -6 + k * 10], r: 3, out: 6, up: 5, flat: true }; }
  if (id === 'hookB') { W.wallBurst = 1; const k = lin(f, HOOK_B, nx(0)); W.wave = 0.85 + k * 0.7; W.flood = 0.6 + k * 0.4; W.spray = { c: [0, 1, 2 + k * 4], r: 3, out: 4, up: 2.5, flat: true }; }
  if (id === 'clock') W.clock = ss(lin(f, at(7), BURST)) * 1;
  if (id === 'hoops' || id === 'tank' || id === 'sees') W.hoop = 0;
  if (id === 'slip') W.hoop = ss(lin(f, frac(4, 0.35), frac(4, 0.8)));
  if (id === 'sees' || id === 'boss' || id === 'clock') W.hoop = 1;
  if (id === 'burst') { W.hoop = 1; const k = lin(f, BURST, nx(7)); W.burst1 = eo(k * 1.05) * 0.95; W.column = eo(k * 1.2); W.bflood = k * 0.6; W.spray = { c: [300, 2.5, -4], r: 2.6, out: 3 + 8 * k, up: 9 }; }
  if (id === 'litres') { W.burst1 = 0.95; const k = lin(f, at(8), nx(8)); W.column = 1 + Math.sin(f * 0.4) * 0.05; W.bflood = 0.6 + k * 0.6; W.spray = { c: [300, 3, -4], r: 2.4, out: 10, up: 11 }; }
  if (id === 'domino') { W.burst1 = 0.98; const k = lin(f, at(9), nx(9)); W.tilt2 = ss(k * 2) * 0.5; W.burst2 = ss((k - 0.3) * 2.2); W.tilt3 = ss((k - 0.4) * 2.2) * 0.5; W.burst3 = ss((k - 0.65) * 3); W.column = 0.6; W.bflood = 1.2 + k * 0.4; }
  if (id === 'wall') { const k = lin(f, WALL, nx(10)); W.wallBurst = eo(k * 1.4); W.wave = 0.1 + k * 1.3; W.flood = k * 0.9; W.spray = { c: [0, 1.5, -6 + k * 14], r: 4, out: 7, up: 4, flat: true }; }
  if (id === 'worst') { W.cflood = 0.02; W.black = lin(f, nx(11) - 8, nx(11)) * 0.6; }
  if (id === 'cellar') { W.cflood = -1; }
  if (id === 'fill') { const k = lin(f, at(13), nx(13)); W.cflood = 0.05 + ss(k) * 2.4; }
  if (id === 'wake') { const k = lin(f, at(14), nx(14)); W.wflood = k > 0.7 ? (k - 0.7) * 1.2 : -1; W.cracks = k > 0.55; W.debris = k > 0.85 ? (k - 0.85) * 3 : 0; }
  if (id === 'collapse') { W.wallBurst = 1; W.flood = 0.9; const k = lin(f, at(15) - 6, nx(15)); W.houseFall = eo(k * 1.2); W.spray = { c: [17, 0.8, -7], r: 3, out: 5, up: 3, flat: true }; }
  if (id === 'eight') { W.wallBurst = 1; W.flood = 0.0; W.houseFall = 1; W.c8 = Math.ceil(lin(f, at(16), frac(16, 0.55)) * 8); }
  if (id === 'court') W.gavel = f > frac(17, 0.75) ? lin(f, frac(17, 0.75), frac(17, 0.9)) : 0;
  if (id === 'nopay') W.gavel = lin(f, at(18), frac(18, 0.3));
  if (id === 'tax' || id === 'endB') { W.bags = id === 'endB' ? 1 : lin(f, at(19), frac(19, 0.6)); W.coins = id === 'endB' ? 1 : lin(f, frac(19, 0.45), nx(19)); }
  if (id === 'endA') { W.wallBurst = 1; W.flood = 0.35; W.houseFall = 1; }
  if (id === 'loop') { W.wallBurst = 0.15; W.wave = 0.1; }
  return W;
};
