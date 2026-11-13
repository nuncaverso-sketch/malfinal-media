"""Synthesized music bed + SFX stems for the Hunley short, plus the level-locked mix.
Usage: python3 audio.py web/timing.json voice.wav out_dir
"""
import json, sys, numpy as np, soundfile as sf
SR = 48000
tim = json.load(open(sys.argv[1])); voice, vsr = sf.read(sys.argv[2]); out = sys.argv[3]
if voice.ndim > 1: voice = voice.mean(1)
if vsr != SR:
    import scipy.signal as ss; voice = ss.resample_poly(voice, SR, vsr)
N = int(tim['duration'] * SR); voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
P = tim['phrases']; st = lambda i: P[i]['start']; en = lambda i: P[i]['end']
rng = np.random.default_rng(7)
t_ = lambda d: np.arange(int(d * SR)) / SR
def env(n, a=0.005, r=0.2):
    e = np.ones(n); na = max(1, min(n, int(a * SR))); nr = max(1, min(n, int(r * SR)))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr) ** 2; return e
def lp(x, k=8):  # cheap low-pass
    return np.convolve(x, np.ones(k) / k, 'same')
def place(buf, x, t, g=1.0):
    i = int(t * SR); j = min(len(buf), i + len(x));
    if i < len(buf) and j > i: buf[i:j] += x[:j - i] * g
noise = lambda d: rng.standard_normal(int(d * SR))
# ---------- instruments ----------
def pluck(f, d=0.35, g=0.5):
    t = t_(d); x = (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t) + 0.15 * np.sin(6 * np.pi * f * t)) * np.exp(-t * 9); return x * g
def kick(g=0.9):
    t = t_(0.25); f = 110 * np.exp(-t * 18) + 45; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14) * g
def tick(g=0.18):
    x = noise(0.03); x = x - lp(x, 6); return x * env(len(x), 0.001, 0.03) * g
def pad(f, d, g=0.12):
    t = t_(d); x = sum(np.sin(2 * np.pi * f * k * t + k) / k for k in (1, 2, 3)) ; return lp(x, 4) * env(len(t), 0.4, 0.6) * g
def drone(f, d, g=0.2):
    t = t_(d); x = np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.5 * t) + 0.3 * np.sin(2 * np.pi * f * 0.5 * t); return x * env(len(t), 1.0, 1.2) * g * (0.8 + 0.2 * np.sin(2 * np.pi * 0.25 * t))
# ---------- music ----------
music = np.zeros(N)
bpm = 96; beat = 60 / bpm
D_minor = [146.8, 174.6, 220.0, 196.0]  # D F A G
def section(t0, t1, root_set, tense=True):
    t = t0; k = 0
    while t < t1 - 0.05:
        bar = (k // 4) % 4; f = root_set[bar]
        if k % 2 == 0: place(music, kick(0.55), t)
        place(music, pluck(f / 2 if k % 4 == 0 else f, 0.3, 0.42), t)
        place(music, tick(), t + beat / 2)
        if k % 4 == 0: place(music, pad(f, min(beat * 4, t1 - t), 0.1), t)
        if tense and k % 8 == 6: place(music, pluck(f * 2, 0.2, 0.25), t + beat / 2)
        t += beat; k += 1
A_minor = [220.0, 174.6, 196.0, 164.8]
section(0.0, st(5) - 0.05, A_minor, tense=False)            # setup: harbor, office, the iron tube
place(music, drone(98.0, st(6) - st(5), 0.25), st(5))       # 'pero eso no fue lo peor'
section(st(6), st(10) - 0.05, D_minor)                      # first sinking, raised, 'lo manejo yo'
place(music, drone(73.4, st(14) - st(10), 0.32), st(10))    # it all went wrong
section(st(14), st(16) - 0.05, D_minor)                     # named after him, the attack
place(music, pad(110.0, en(17) + 0.5 - st(16), 0.16), st(16))
# ---------- sfx ----------
sfx = np.zeros(N)
def whoosh(d=0.6, g=0.5):
    x = noise(d); x = lp(x, 30) * np.sin(np.linspace(0, np.pi, len(x))) ** 2; return x * g
def rumble(d=1.5, g=0.6):
    x = lp(noise(d), 120); x /= np.abs(x).max() + 1e-9; return x * env(len(x), 0.02, d * 0.6) * g
def clank(g=0.6):
    t = t_(0.9); x = sum(np.sin(2 * np.pi * f * t) for f in (420, 1130, 1870)) * np.exp(-t * 5); return x * g / 3
def creak(d=0.9, g=0.35):
    t = t_(d); f = 180 + 60 * np.sin(2 * np.pi * 1.3 * t); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5; return lp(x, 12) * env(len(t), 0.1, 0.3) * g
def splash(d=1.2, g=0.6):
    x = noise(d); x = lp(x, 6) * np.exp(-t_(d) * 2.5); return x * g
def boom(g=0.9):
    r = rumble(1.2, 0.7); k = np.zeros(len(r)); kk = kick(1.0); k[:len(kk)] = kk
    return (k * 1.2 + r) * g
def sting(g=0.7):
    t = t_(1.6); x = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t)) * np.exp(-t * 2); return x * g
def ping(g=0.45):
    t = t_(0.6); x = (np.sin(2 * np.pi * 1760 * t) + 0.5 * np.sin(2 * np.pi * 2640 * t)) * np.exp(-t * 6); return x * g
def bubble(g=0.4):
    t = t_(0.12); f = 300 + 900 * t / 0.12; x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 25); return x * g
def pop(g=0.4):
    t = t_(0.08); x = np.sin(2 * np.pi * 600 * t) * np.exp(-t * 60); return x * g
for i in range(1, len(P)): place(sfx, whoosh(0.35, 0.22), st(i) - 0.18)          # whip at every cut
place(sfx, clank(0.5), 0.1); place(sfx, splash(0.8, 0.25), 0.3)                    # hook: hatch clank, water
for k in range(6): place(sfx, bubble(0.35), st(1) + 0.3 + k * 0.35)               # sub starts to sink
place(sfx, ping(0.45), st(2) + 0.5 * (en(2) - st(2)))                              # the toy sub sparkles
for k in range(3): place(sfx, clank(0.35), st(3) + 0.4 + k * 0.6)                  # iron tube
for k in range(int((en(4) - st(4)) / 0.6)): place(sfx, creak(0.4, 0.22), st(4) + k * 0.6)   # hand crank
place(sfx, sting(0.7), st(5))
place(sfx, splash(1.4, 0.6), st(6) + 0.4)                                           # water rushes into the hatch
for k in range(5): place(sfx, pop(0.45), st(7) + 0.3 + k * 0.35)                   # 5 hats pop up
place(sfx, creak(1.2, 0.35), st(8) + 0.2); place(sfx, splash(1.0, 0.3), st(8) + 0.6)   # crane lifts it, dripping
place(sfx, ping(0.35), st(9) + 0.2)
place(sfx, boom(0.8), st(10))
place(sfx, splash(1.2, 0.4), st(11) + 0.3)
for k in range(8): place(sfx, bubble(0.35 * (1 - k / 9)), st(12) + 0.2 + k * 0.32)  # bubbles thin out
place(sfx, rumble(1.5, 0.3), st(13))
for k in range(4): place(sfx, clank(0.3), st(14) + 0.8 + k * 0.4)                  # painting/hammering the name
place(sfx, boom(0.9), st(15) + 0.45 * (en(15) - st(15)))                           # the torpedo hits the Housatonic
for k in range(4): place(sfx, bubble(0.3), st(16) + 1.0 + k * 0.4)
# ---------- level lock: music and SFX at 50 % of voice gated RMS ----------
def grms(x):
    b = int(0.4 * SR); r = np.array([np.sqrt(np.mean(x[i:i + b] ** 2)) for i in range(0, len(x) - b, b)]); r = r[r > r.max() * 0.1] if r.max() > 0 else r
    return np.sqrt(np.mean(r ** 2)) if len(r) else 1e-9
import scipy.signal as _ss
_b, _a = _ss.butter(2, 120, 'high', fs=SR); music = _ss.lfilter(_b, _a, music)
vr = grms(voice); music *= 0.25 * vr / grms(music); sfx *= 0.26 * vr / grms(sfx)
# ducking: bed drops under the voice (20 ms attack, 250 ms release)
_e = np.abs(voice); _env = np.zeros_like(_e); _ka, _kr = np.exp(-1 / (0.02 * SR)), np.exp(-1 / (0.25 * SR)); _v = 0.0
for _i in range(0, len(_e), 48):
    _x = _e[_i:_i + 48].max(); _k = _ka ** 48 if _x > _v else _kr ** 48; _v = _x + (_v - _x) * _k; _env[_i:_i + 48] = _v
_env = np.clip(_env / (np.percentile(_env[_env > 1e-4], 70) + 1e-9), 0, 1)
music *= (1 - 0.55 * _env); sfx *= (1 - 0.35 * _env)
cap = 0.7 * np.abs(voice).max(); pk = np.abs(sfx).max()
if pk > cap: sfx *= cap / pk
print('voice gRMS %.4f  music %+.1f dB  sfx %+.1f dB (vs voice)' % (vr, 20 * np.log10(grms(music) / vr), 20 * np.log10(grms(sfx) / vr)))
mix = voice + music + sfx
mix /= max(1.0, np.abs(mix).max() / 0.95)
sf.write(f'{out}/music.wav', music.astype(np.float32), SR); sf.write(f'{out}/sfx.wav', sfx.astype(np.float32), SR); sf.write(f'{out}/mix.wav', mix.astype(np.float32), SR)
