"""frases/NN.wav (raw TTS takes, one per script line) -> voice/voice.wav + web/timing.json.
Light tempo lift + clean-up, trims edges, compresses inner silences > 0.32 s, tight gaps between phrases.
Optional PAUSE overrides: python3 assemble_voice.py '{"7":0.45}'"""
import json, os, subprocess, sys, numpy as np, soundfile as sf
SR = 48000
lines = [l.strip() for l in open('script.txt', encoding='utf-8') if l.strip()]
PAUSE = {int(k): v for k, v in (json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}).items()}
os.makedirs('voice', exist_ok=True); os.makedirs('web', exist_ok=True)
parts, ph, t = [np.zeros(int(0.15 * SR))], [], 0.15
for i, txt in enumerate(lines):
    src, dst = f'frases/{i:02d}.wav', f'voice/p{i:02d}.wav'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', 'atempo=1.05,highpass=f=80,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120,aresample=48000', '-ac', '1', dst], check=True)
    x, sr = sf.read(dst); x = x.mean(1) if x.ndim > 1 else x
    e = np.convolve(np.abs(x), np.ones(480) / 480, 'same'); idx = np.nonzero(e > 0.01 * e.max())[0]
    x = x[max(0, idx[0] - int(0.04 * SR)):idx[-1] + int(0.12 * SR)]
    e2 = np.convolve(np.abs(x), np.ones(960) / 960, 'same'); q = e2 < 0.012 * e2.max(); keep = np.ones(len(x), bool); run = 0
    for j in range(len(x)):
        run = run + 1 if q[j] else 0
        if run > int(0.32 * SR): keep[j] = False
    x = x[keep]
    if i > 0: gap = PAUSE.get(i, 0.26); parts.append(np.zeros(int(gap * SR))); t += gap
    ph.append({'start': round(t, 3), 'end': round(t + len(x) / SR, 3), 'text': txt}); parts.append(x); t += len(x) / SR
parts.append(np.zeros(int(0.8 * SR))); t += 0.8
v = np.concatenate(parts); v = v / max(1e-9, np.abs(v).max()) * 0.89
sf.write('voice/voice.wav', v.astype(np.float32), SR)
json.dump({'duration': round(len(v) / SR, 3), 'phrases': ph}, open('web/timing.json', 'w'), ensure_ascii=False, indent=1)
print('voice', round(len(v) / SR, 2))
for i, p in enumerate(ph): print(i, f"{p['start']:6.2f}-{p['end']:6.2f}", p['text'][:60])
