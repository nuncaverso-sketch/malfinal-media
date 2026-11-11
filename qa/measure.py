#!/usr/bin/env python3
"""Objective QA measurements for a finished short.
usage: measure.py VIDEO SCRIPT.txt OUTDIR [--voice VOICE.wav] [--timing timing.json]
Writes OUTDIR/metrics.json, OUTDIR/sheet.jpg, OUTDIR/frames/*.jpg (full-res samples), OUTDIR/ocr.txt
"""
import argparse, json, os, re, subprocess, unicodedata
import numpy as np, soundfile as sf, scipy.signal as ss

ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('script'); ap.add_argument('out')
ap.add_argument('--voice'); ap.add_argument('--timing'); a = ap.parse_args()
os.makedirs(a.out + '/frames', exist_ok=True)
sh = lambda c: subprocess.run(c, shell=True, capture_output=True, text=True)
M = {}

# ---------- container ----------
pr = json.loads(sh(f'ffprobe -v error -show_streams -show_format -of json "{a.video}"').stdout)
v = next(s for s in pr['streams'] if s['codec_type'] == 'video'); au = [s for s in pr['streams'] if s['codec_type'] == 'audio']
num, den = map(int, v['r_frame_rate'].split('/'))
M['video'] = {'w': v['width'], 'h': v['height'], 'fps': round(num / den, 2), 'duration': round(float(pr['format']['duration']), 2), 'size_mb': round(int(pr['format']['size']) / 1e6, 1), 'has_audio': bool(au)}
dur = M['video']['duration']

# ---------- loudness ----------
r = sh(f'ffmpeg -hide_banner -i "{a.video}" -af ebur128=peak=true -f null - 2>&1').stdout + sh(f'ffmpeg -hide_banner -i "{a.video}" -af ebur128=peak=true -f null -').stderr
gi = lambda k: float(re.findall(rf'{k}:\s+(-?[\d.]+)', r)[-1]) if re.findall(rf'{k}:\s+(-?[\d.]+)', r) else None
M['loudness'] = {'integrated_lufs': gi('I'), 'lra_lu': gi('LRA'), 'true_peak_dbtp': gi('Peak')}
sh(f'ffmpeg -y -loglevel error -i "{a.video}" -ac 1 -ar 16000 {a.out}/a16.wav')
x, sr = sf.read(f'{a.out}/a16.wav'); x = x.astype('float32')
M['loudness']['clipped_samples'] = int((np.abs(x) > 0.995).sum())

# ---------- intelligibility (Whisper on the FINAL mix vs script) ----------
def norm(t):
    t = unicodedata.normalize('NFD', t.lower()); t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9ñ ]+', ' ', t).split()
from faster_whisper import WhisperModel
wm = WhisperModel('small', device='cpu', compute_type='int8')
segs, _ = wm.transcribe(x, language='es', word_timestamps=True)
segs = list(segs); hyp = ' '.join(s.text for s in segs)
ref = norm(open(a.script).read()); hw = norm(hyp)
d = np.arange(len(hw) + 1)
for i, rw in enumerate(ref, 1):
    prev, d[0] = d.copy(), i
    for j, h in enumerate(hw, 1): d[j] = min(prev[j] + 1, d[j - 1] + 1, prev[j - 1] + (rw != h))
M['intelligibility'] = {'wer': round(d[-1] / max(1, len(ref)), 3), 'ref_words': len(ref), 'transcript': hyp.strip(),
  'low_conf_words': [w.word.strip() for s in segs for w in s.words if w.probability < 0.5][:40]}

# ---------- voice vs background ----------
spans = None
if a.timing: spans = [(p['start'], p['end']) for p in json.load(open(a.timing))['phrases']]
else: spans = [(s.start, s.end) for s in segs]
rms = lambda y: float(np.sqrt(np.mean(y ** 2)) + 1e-9)
sp = np.concatenate([x[int(s * sr):int(e * sr)] for s, e in spans]) if spans else x
gaps = [(spans[i][1] + 0.05, spans[i + 1][0] - 0.05) for i in range(len(spans) - 1) if spans[i + 1][0] - spans[i][1] > 0.25]
gp = np.concatenate([x[int(s * sr):int(e * sr)] for s, e in gaps]) if gaps else np.zeros(1)
M['mix'] = {'speech_rms_db': round(20 * np.log10(rms(sp)), 1), 'pause_bg_rms_db': round(20 * np.log10(rms(gp)), 1)}
M['mix']['speech_over_pause_db'] = round(M['mix']['speech_rms_db'] - M['mix']['pause_bg_rms_db'], 1)
if a.voice:
    vo, vsr = sf.read(a.voice); vo = vo.mean(1) if vo.ndim > 1 else vo
    vo = ss.resample_poly(vo, 16000, vsr).astype('float32')
    n = min(len(vo), len(x)); seg = slice(0, min(n, 16000 * 20))
    c = ss.correlate(x[seg], vo[seg], mode='full', method='fft'); lag = int(np.argmax(c) - (len(vo[seg]) - 1))
    vv = np.zeros_like(x); src = vo[max(0, -lag):]; vv[max(0, lag):max(0, lag) + len(src)] = src[:len(x) - max(0, lag)]
    mask = np.zeros(len(x), bool)
    for s, e in spans: mask[int(s * sr):int(e * sr)] = True
    g = float(np.dot(x[mask], vv[mask]) / (np.dot(vv[mask], vv[mask]) + 1e-9)); res = x - g * vv
    # per-band SNR in the speech band (300-3400 Hz) where masking hurts clarity
    b, aa = ss.butter(4, [300, 3400], btype='band', fs=sr)
    vb, rb = ss.filtfilt(b, aa, g * vv), ss.filtfilt(b, aa, res)
    M['mix'].update({'voice_lag_ms': round(lag / sr * 1000, 1), 'voice_to_bg_db': round(20 * np.log10(rms(g * vv[mask]) / rms(res[mask])), 1),
                     'voice_to_bg_speechband_db': round(20 * np.log10(rms(vb[mask]) / rms(rb[mask])), 1)})
    # worst 1-second windows
    win = []
    for t0 in range(0, int(dur)):
        sl = slice(t0 * sr, (t0 + 1) * sr); m = mask[sl]
        if m.mean() > 0.6: win.append((round(20 * np.log10(rms(vb[sl][m]) / rms(rb[sl][m])), 1), t0))
    M['mix']['worst_seconds'] = sorted(win)[:5]

# ---------- motion / fluidity ----------
fr = sh(f'ffmpeg -hide_banner -i "{a.video}" -vf "freezedetect=n=0.002:d=0.4,blackdetect=d=0.15:pix_th=0.05" -an -f null - 2>&1').stdout + ''
r2 = subprocess.run(f'ffmpeg -hide_banner -i "{a.video}" -vf "freezedetect=n=0.002:d=0.4,blackdetect=d=0.15:pix_th=0.05" -an -f null -', shell=True, capture_output=True, text=True).stderr
M['fluidity'] = {'freezes': re.findall(r'freeze_start: ([\d.]+)', r2), 'freeze_durations': re.findall(r'freeze_duration: ([\d.]+)', r2), 'blacks': re.findall(r'black_start:([\d.]+)', r2)}
import cv2
cap = cv2.VideoCapture(a.video); prev = None; diffs = []
while True:
    ok, f = cap.read()
    if not ok: break
    g_ = cv2.cvtColor(cv2.resize(f, (135, 240)), cv2.COLOR_BGR2GRAY).astype('float32')
    if prev is not None: diffs.append(float(np.mean(np.abs(g_ - prev))))
    prev = g_
diffs = np.array(diffs); fps = M['video']['fps']
cut_thr = max(18.0, np.percentile(diffs, 99))
cuts = [round((i + 1) / fps, 2) for i, dd in enumerate(diffs) if dd > cut_thr]
static = diffs < 0.15; runs, cur = [], 0
for s_ in static:
    cur = cur + 1 if s_ else 0; runs.append(cur)
dup = float((diffs < 0.02).mean())
# stutter = alternating near-zero / big diffs within moving stretches
mv = diffs[(diffs > 0.3) & (diffs < cut_thr)]
jit = float(np.std(np.diff(diffs[(diffs < cut_thr)]))) if len(diffs) > 2 else 0
M['fluidity'].update({'cuts': len(cuts), 'cut_times': cuts[:60], 'avg_shot_s': round(dur / (len(cuts) + 1), 2), 'duplicate_frame_ratio': round(dup, 3),
  'longest_static_s': round(max(runs or [0]) / fps, 2), 'mean_motion': round(float(diffs.mean()), 2), 'motion_jitter': round(jit, 2),
  'first_cut_s': cuts[0] if cuts else None})

# ---------- frames for visual review ----------
sh(f'ffmpeg -y -loglevel error -i "{a.video}" -vf "fps=1/2,scale=180:320,tile=8x{int(np.ceil(dur / 2 / 8))}" -frames:v 1 {a.out}/sheet.jpg')
ts = [0.3, 1.0, 2.0] + list(np.linspace(4, dur - 1.5, 9))
for t in ts: sh(f'ffmpeg -y -loglevel error -ss {t:.2f} -i "{a.video}" -frames:v 1 -vf scale=540:-1 {a.out}/frames/t{t:05.1f}.jpg')
# crops at full res for detail/shadow inspection
for t in ts[3::3]: sh(f'ffmpeg -y -loglevel error -ss {t:.2f} -i "{a.video}" -frames:v 1 -vf "crop=iw/2:ih/3:iw/4:ih/3" {a.out}/frames/crop{t:05.1f}.jpg')
# ---------- subtitles (OCR of the lower-middle band every 0.5 s) ----------
ocr = []
for t in np.arange(0.5, dur, 0.5):
    p = f'{a.out}/o.png'; sh(f'ffmpeg -y -loglevel error -ss {t:.2f} -i "{a.video}" -frames:v 1 -vf "crop=iw:ih*0.28:0:ih*0.5,scale=iw/2:-1" {p}')
    txt = sh(f'tesseract {p} - -l spa --psm 6 2>/dev/null').stdout.strip().replace('\n', ' ')
    if not txt: txt = sh(f'tesseract {p} - --psm 6 2>/dev/null').stdout.strip().replace('\n', ' ')
    if re.search(r'[A-Za-zÁÉÍÓÚÑáéíóúñ]{3,}', txt): ocr.append((round(float(t), 1), txt))
M['subtitles'] = {'frames_with_text': len(ocr), 'samples': len(np.arange(0.5, dur, 0.5)), 'present': len(ocr) > 0.3 * len(np.arange(0.5, dur, 0.5))}
open(f'{a.out}/ocr.txt', 'w').write('\n'.join(f'{t}\t{s}' for t, s in ocr))
for f_ in ('a16.wav', 'o.png'):
    try: os.remove(f'{a.out}/{f_}')
    except OSError: pass
json.dump(M, open(f'{a.out}/metrics.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps({k: v for k, v in M.items() if k != 'intelligibility'}, ensure_ascii=False)); print('WER', M['intelligibility']['wer'])
