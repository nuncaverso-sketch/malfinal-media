"""Generic: PROJDIR/voice/voice.wav + web/timing.json -> PROJDIR/words.json (word starts via faster-whisper per phrase)."""
import json, sys, numpy as np, soundfile as sf, scipy.signal as ss
from faster_whisper import WhisperModel
P = sys.argv[1]
T = json.load(open(f'{P}/web/timing.json')); v, sr = sf.read(f'{P}/voice/voice.wav'); v = v.mean(1) if v.ndim > 1 else v
m = WhisperModel("small", device="cpu", compute_type="int8"); out = []
for pi, p in enumerate(T['phrases']):
    words = p['text'].replace('...', '…').split()
    a = v[int(p['start'] * sr):int(p['end'] * sr) + int(0.1 * sr)].astype('float32'); a16 = ss.resample_poly(a, 16000, sr).astype('float32')
    segs, _ = m.transcribe(a16, language='es', word_timestamps=True); ws = [w for s in segs for w in s.words]
    n, k = len(words), len(ws)
    for i, w in enumerate(words):
        st = p['start'] + (ws[min(k - 1, int(i * k / n))].start if k else (p['end'] - p['start']) * i / n)
        out.append({'w': w, 's': round(st, 3), 'p': pi})
for i, o in enumerate(out): o['e'] = round(out[i + 1]['s'] if i + 1 < len(out) and out[i + 1]['p'] == o['p'] else T['phrases'][o['p']]['end'], 3)
# keep starts monotonic
for i in range(1, len(out)):
    if out[i]['s'] < out[i - 1]['s']: out[i]['s'] = out[i - 1]['s']
json.dump(out, open(f'{P}/words.json', 'w'), ensure_ascii=False); print(P, len(out), 'words')
