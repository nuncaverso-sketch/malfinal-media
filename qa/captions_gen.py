"""Generic: <proj>/words.json -> <proj>/subs.ass. 2-4 word chunks on real word starts, spelled numbers -> digits, min 0.5 s, highlights.
usage: captions_gen.py PROJDIR [HOOKTEXT]"""
import json, re, sys
P = sys.argv[1]; hook = sys.argv[2] if len(sys.argv) > 2 else ''
import os, unicodedata
W = json.load(open(f'{P}/words.json'))
for w in W: w['w'] = unicodedata.normalize('NFC', w['w'])
TOP = set(int(x) for x in os.environ.get('TOP_PHRASES', '').split(',') if x)
def ts(s): s = max(0, s); h = int(s // 3600); m = int(s % 3600 // 60); return f"{h}:{m:02d}:{s % 60:05.2f}"
U = {'cero': 0, 'un': 1, 'uno': 1, 'una': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10, 'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
     'dieciséis': 16, 'dieciseis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20, 'veintiuno': 21, 'veintiuna': 21, 'treintaiuno': 31, 'veintiún': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29,
     'treinta': 30, 'cuarenta': 40, 'cincuenta': 50, 'sesenta': 60, 'setenta': 70, 'ochenta': 80, 'noventa': 90, 'cien': 100, 'ciento': 100, 'doscientos': 200, 'doscientas': 200, 'trescientos': 300, 'trescientas': 300, 'cuatrocientos': 400, 'quinientos': 500,
     'seiscientos': 600, 'setecientos': 700, 'ochocientos': 800, 'novecientos': 900, 'mil': 1000}
core = lambda w: re.sub(r'[^\wáéíóúñü]', '', w.lower())
def num_run(ws, i):
    """longest run of number words starting at i (allowing 'y' between tens and units); returns (len, value) or None"""
    j, toks = i, []
    while j < len(ws):
        c = core(ws[j]['w'])
        if c in U: toks.append(c); j += 1
        elif c == 'y' and toks and U.get(toks[-1], 0) in range(30, 100, 10) and j + 1 < len(ws) and core(ws[j + 1]['w']) in U and U[core(ws[j + 1]['w'])] < 10: j += 1
        else: break
        if re.search(r'[.,:;!?…]$', ws[j - 1]['w']): break
    if not toks or (len(toks) == 1 and U[toks[0]] < 2): return None
    total, cur = 0, 0
    for t in toks:
        v = U[t]
        if v == 1000: total += max(1, cur) * 1000; cur = 0
        else: cur += v
    return j - i, total + cur
ws, i = [], 0
while i < len(W):
    r = num_run(W, i)
    if r:
        n, v = r; tail = re.search(r'[.,:;!?…]*$', W[i + n - 1]['w']).group(0)
        ws.append({**W[i], 'w': f'{v}{tail}', 'e': W[i + n - 1]['e'], 'num': True}); i += n
    else: ws.append(dict(W[i])); i += 1
# highlight: numbers + the 2 longest content words of each phrase
STOP = set('para pero porque cuando donde como entonces durante mientras sobre entre hasta desde había estaba fueron tenía hacer quería siempre nunca todos todas'.split())
HL = set()
for p in sorted(set(w['p'] for w in ws)):
    cand = sorted({core(w['w']) for w in ws if w['p'] == p and len(core(w['w'])) >= 6 and core(w['w']) not in STOP}, key=len, reverse=True)[:1]
    HL |= set(cand)
RICK = os.environ.get('STYLE', 'rick') == 'rick'
chunks = []
for p in sorted(set(w['p'] for w in ws)):
    pw = [w for w in ws if w['p'] == p]; cur = []
    for k, w in enumerate(pw):
        cur.append(w)
        mx = 2 if RICK else 4
        if RICK and len(core(w['w'])) >= 8: mx = 1
        if k == len(pw) - 1 or len(cur) >= mx or (re.search(r'[.,:;!?…]$', w['w']) and (len(cur) >= 2 or RICK)): chunks.append(cur); cur = []
merged = []
for c in chunks:
    if merged and merged[-1][0]['p'] == c[0]['p'] and (c[-1]['e'] - c[0]['s'] < (0.28 if RICK else 0.5) or (len(c) == 1 and not RICK)) and len(merged[-1]) + len(c) <= (3 if RICK else 5): merged[-1] += c
    else: merged.append(c)
hdr0 = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: C,Poppins,96,&H00FFFFFF,&H00FFFFFF,&H00101010,&H80000000,-1,0,0,0,100,100,0,0,1,9,3,2,70,70,560,1
Style: H,Poppins,88,&H00FFFFFF,&H00FFFFFF,&H00101010,&H80000000,-1,0,0,0,100,100,0,0,1,9,4,8,60,60,int(os.environ.get('HOOK_Y','250')),1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
if RICK: hdr0 = hdr0.replace("Style: C,Poppins,96,&H00FFFFFF,&H00FFFFFF,&H00101010,&H80000000,-1,0,0,0,100,100,0,0,1,9,3,2,70,70,560,1", "Style: C,Poppins,106,&H00FFFFFF,&H00FFFFFF,&H00101010,&H90000000,-1,0,0,0,100,100,0,0,1,9,3,2,50,50,600,1")
hdr = hdr0.replace("int(os.environ.get('HOOK_Y','250'))", os.environ.get('HOOK_Y', '250'))
out = []
for k, c in enumerate(merged):
    s = c[0]['s'] - 0.05
    nxt = merged[k + 1][0]['s'] - 0.05 if k + 1 < len(merged) else c[-1]['e'] + 0.6
    e = min(nxt, max(c[-1]['e'] + 0.25, s + 0.5))
    if RICK:
        clean = lambda x: re.sub(r'[.,:;…]+$', '', x)
        txt = '{\\fscx82\\fscy82\\t(0,90,\\fscx100\\fscy100)}' + ' '.join(('{\\c&H3CD2FF&}' + re.sub(r'[.,:;…]+$', '', w['w']) + '{\\c&HFFFFFF&}') if w.get('num') else clean(w['w']) for w in c)
    else: txt = ' '.join(('{\\c&H3CD2FF&}' + w['w'].upper() + '{\\c&HFFFFFF&}') if (w.get('num') or core(w['w']) in HL) else w['w'].upper() for w in c)
    tag = '{\\an8\\pos(540,300)}' if c[0]['p'] in TOP else ''
    out.append(f"Dialogue: 0,{ts(s)},{ts(e)},C,,0,0,0,,{tag}{txt}")
if hook: out.append("Dialogue: 1,0:00:00.00,0:00:02.80,H,,0,0,0,,{\\fad(0,200)}" + hook.replace('|', '\\N'))
open(f'{P}/subs.ass', 'w').write(hdr + '\n'.join(out) + '\n')
print(P, len(out), 'subs; nums:', [w['w'] for w in ws if w.get('num')])
