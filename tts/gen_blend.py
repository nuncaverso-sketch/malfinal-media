"""Usage: gen_blend.py script.txt outdir  — blended voice (grave+calido), per-phrase Whisper check, resumable."""
import sys, os, re, json, difflib, unicodedata, torch, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from faster_whisper import WhisperModel
script, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
lines = [l.strip() for l in open(script, encoding='utf-8') if l.strip()]
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
wm = WhisperModel("small", device="cpu", compute_type="int8")
import os
R = os.path.dirname(os.path.abspath(__file__)) + '/'
with torch.no_grad():
    m.prepare_conditionals(R + 'ref_grave.wav', exaggeration=0.5); sa = m.conds.t3.speaker_emb.detach().clone(); ga = m.conds.gen['embedding'].detach().clone()
    m.prepare_conditionals(R + 'ref_calido.wav', exaggeration=0.5)
    m.conds.t3.speaker_emb = (sa + m.conds.t3.speaker_emb.detach()) / 2; m.conds.gen['embedding'] = (ga + m.conds.gen['embedding'].detach()) / 2
CONDS = m.conds
def norm(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn'); return re.sub(r'[^a-z ]', ' ', s).split()
def trim(w, sr, th=0.012):
    a = w.abs().squeeze(0); idx = (a > th).nonzero()
    if len(idx) == 0: return w
    return w[:, max(0, int(idx[0]) - int(0.03 * sr)):min(a.shape[0], int(idx[-1]) + int(0.08 * sr))]
for i, t in enumerate(lines):
    fn = f'{out}/{i:02d}.wav'
    if os.path.exists(fn): continue
    ex = 0.65 if (i >= len(lines) - 2 or i == 0 or '?' in t or '...' in t or len(t) < 28) else 0.56
    best = None
    for att in range(3):
        m.conds = CONDS
        w = trim(m.generate(t.replace('...', '…'), language_id="es", exaggeration=ex, cfg_weight=0.3, temperature=0.9), m.sr)
        a16 = ta.functional.resample(w, m.sr, 16000).squeeze(0).numpy().astype('float32')
        hyp = ' '.join(s.text for s in wm.transcribe(a16, language='es')[0])
        sc = difflib.SequenceMatcher(None, norm(t), norm(hyp)).ratio(); dur = w.shape[-1] / m.sr
        ok = sc >= 0.9 and dur < 1.0 + len(t.split()) * 0.55
        if best is None or sc > best[0]: best = (sc, w, hyp)
        print(i, att, round(sc, 2), round(dur, 2), hyp, flush=True)
        if ok: break
    ta.save(fn, best[1], m.sr)
print('DONE', flush=True)
