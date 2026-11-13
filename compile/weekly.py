#!/usr/bin/env python3
"""Weekly long-form YouTube compilation (16:9, 8-10+ min) + thumbnail.
usage: weekly.py OUTDIR ITEMS.json
ITEMS.json: [{"file": "path.mp4", "title": "Murió por rellenar un pollo con nieve", "year": "1626", "thumb_frame": 12.0}, ...]  ordered worst -> best
(the countdown goes #N ... #1, best last to hold retention).
Writes OUTDIR/compilation.mp4, OUTDIR/thumb.jpg, OUTDIR/chapters.txt"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont
OUT, ITEMS = sys.argv[1], json.load(open(sys.argv[2]))
os.makedirs(OUT, exist_ok=True)
FB = '/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'
EB = '/usr/share/fonts/truetype/google-fonts/Poppins-ExtraBold.ttf' if os.path.exists('/usr/share/fonts/truetype/google-fonts/Poppins-ExtraBold.ttf') else FB
sh = lambda c: subprocess.run(c, shell=True, check=True)
dur = lambda f: float(subprocess.run(f'ffprobe -v error -show_entries format=duration -of csv=p=0 "{f}"', shell=True, capture_output=True, text=True).stdout)
N = len(ITEMS)
def wrap(d, txt, font, maxw):
    words, lines, cur = txt.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= maxw: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur); return lines
def panel(i, it):
    """1920x1080 transparent overlay: rank badge + title on the left, channel tag on the right"""
    im = Image.new('RGBA', (1920, 1080), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    rank = N - i
    f = ImageFont.truetype(EB, 120); bw = int(d.textlength(f'#{rank}', font=f)) + 70
    d.rounded_rectangle((70, 300, 70 + max(190, bw), 490), 40, fill=(255, 210, 60, 255))
    d.text((70 + max(190, bw) // 2, 395), f'#{rank}', font=f, fill=(20, 12, 16), anchor='mm')
    ft = ImageFont.truetype(EB, 58); y = 540
    for ln in wrap(d, it['title'].upper(), ft, 560)[:4]:
        d.text((70, y), ln, font=ft, fill='white', stroke_width=6, stroke_fill=(16, 10, 14)); y += 72
    if it.get('year'): d.text((70, y + 20), it['year'], font=ImageFont.truetype(FB, 48), fill=(255, 210, 60), stroke_width=5, stroke_fill=(16, 10, 14))
    d.text((1850, 1000), 'MAL FINAL', font=ImageFont.truetype(EB, 54), fill=(255, 255, 255, 230), anchor='rs', stroke_width=5, stroke_fill=(16, 10, 14))
    p = f'{OUT}/panel{i:02d}.png'; im.save(p); return p
def card(path, big, small, sec=4.0):
    im = Image.new('RGB', (1920, 1080), (18, 10, 16)); d = ImageDraw.Draw(im)
    for k in range(0, 1080, 6): d.line((0, k, 1920, k), fill=(26 + k // 60, 12, 20))
    fb = ImageFont.truetype(EB, 120); y = 330
    for ln in wrap(d, big, fb, 1600): d.text((960, y), ln, font=fb, fill='white', anchor='mm', stroke_width=10, stroke_fill=(0, 0, 0)); y += 140
    d.text((960, y + 40), small, font=ImageFont.truetype(EB, 64), fill=(255, 210, 60), anchor='mm', stroke_width=7, stroke_fill=(0, 0, 0))
    im.save(path + '.png')
    sh(f'ffmpeg -y -loglevel error -loop 1 -t {sec} -i {path}.png -f lavfi -t {sec} -i anullsrc=r=48000:cl=stereo -vf "scale=1920:1080,zoompan=z=\'min(zoom+0.0008,1.08)\':d=1:s=1920x1080:fps=30,fade=t=in:d=0.3,fade=t=out:st={sec-0.3}:d=0.3" -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest {path}.mp4')
    return path + '.mp4'
THUMB_ONLY = os.environ.get('THUMB_ONLY')
segs, chapters, t = [], [], 0.0
if not THUMB_ONLY:
    intro = card(f'{OUT}/intro', f'LAS {N} MUERTES MÁS ABSURDAS DE LA HISTORIA', 'Historias reales · Mal Final', 4.0); segs.append(intro); t += 4.0
    chapters.append('0:00 Intro')
    for i, it in enumerate(ITEMS):
        pn = panel(i, it); out = f'{OUT}/seg{i:02d}.mp4'
        sh(f'ffmpeg -y -loglevel error -i "{it["file"]}" -i {pn} -filter_complex "[0:v]split[a][b];[a]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=30:3,eq=brightness=-0.12[bg];[b]scale=-2:1080[fg];[bg][fg]overlay=(W-w)/2:0[v1];[v1][1:v]overlay=0:0,fps=30,format=yuv420p[v]" -map "[v]" -map 0:a -c:v libx264 -preset veryfast -crf 20 -c:a aac -b:a 192k -ar 48000 -ac 2 {out}')
        m, s = divmod(int(t), 60); chapters.append(f'{m}:{s:02d} #{N - i} {it["title"]}'); t += dur(out); segs.append(out)
    outro = card(f'{OUT}/outro', '¿CUÁL FUE LA MÁS ABSURDA?', 'Comenta · Suscríbete para más', 5.0); segs.append(outro); t += 5.0
    open(f'{OUT}/list.txt', 'w').write(''.join(f"file '{os.path.abspath(s)}'\n" for s in segs))
    # GitHub rejects files > 100 MB -> capped single-pass ABR to ~94 MB (2-pass broke on long concats) (bitrate from duration). tune animation keeps cartoon edges clean.
    vb = max(500, int(94e6 * 8 / t / 1000) - 128)
    sh(f'ffmpeg -y -loglevel error -f concat -safe 0 -i {OUT}/list.txt -c:v libx264 -preset medium -tune animation -b:v {vb}k -maxrate {int(vb*1.4)}k -bufsize {vb*2}k -c:a aac -b:a 128k -af loudnorm=I=-14:TP=-1.5:LRA=9 -movflags +faststart {OUT}/compilation.mp4')
    open(f'{OUT}/chapters.txt', 'w').write('\n'.join(chapters))
# ---- thumbnail 1280x720: hero frame + 2 tilted cards + huge text. Items may set "thumb": seconds (pick visually loud frames:
# the absurd object/disaster, a shocked face; no subtitles -> we crop y 150..1200 of the 9:16 frame)
picks = sorted([it for it in ITEMS if 'thumb' in it], key=lambda x: x.get('thumb_rank', 9))[:3] or ITEMS[-3:][::-1]
frames = []
for k, it in enumerate(picks):
    p = f'{OUT}/tf{k}.jpg'; sh(f'ffmpeg -y -loglevel error -ss {it.get("thumb", it.get("thumb_frame", 20))} -i "{it["file"]}" -frames:v 1 -vf crop=1080:1050:0:150 {p}'); frames.append(Image.open(p).convert('RGBA'))
th = frames[0].resize((1280, 1244)).crop((0, 262, 1280, 982))
th = Image.alpha_composite(th, Image.new('RGBA', (1280, 720), (12, 4, 8, 70)))
grad = Image.new('L', (1280, 1)); grad.putdata([max(0, 235 - int(x * 0.38)) for x in range(1280)]); grad = grad.resize((1280, 720))
th = Image.composite(Image.new('RGBA', (1280, 720), (10, 4, 8, 255)), th, grad)
def cardimg(fr, w, ang):
    img = fr.resize((w, int(w * 1050 / 1080))); bd = Image.new('RGBA', (w + 20, img.height + 20), (255, 255, 255, 255)); bd.paste(img, (10, 10))
    return bd.rotate(ang, expand=True, resample=Image.BICUBIC)
if len(frames) > 2: c = cardimg(frames[2], 300, 9); th.alpha_composite(c, (960, 330))
if len(frames) > 1: c = cardimg(frames[1], 330, -7); th.alpha_composite(c, (930, 20))
d = ImageDraw.Draw(th); fb = ImageFont.truetype(EB, 112)
d.text((40, 60), f'{N} MUERTES', font=fb, fill=(255, 210, 60), stroke_width=13, stroke_fill=(0, 0, 0))
d.text((40, 195), 'ABSURDAS', font=fb, fill='white', stroke_width=13, stroke_fill=(0, 0, 0))
d.text((40, 330), 'Y REALES', font=ImageFont.truetype(EB, 96), fill='white', stroke_width=12, stroke_fill=(0, 0, 0))
d.rounded_rectangle((40, 520, 560, 620), 26, fill=(215, 28, 38), outline=(0, 0, 0), width=6)
d.text((300, 570), '¿CÓMO ES POSIBLE?', font=ImageFont.truetype(EB, 46), fill='white', anchor='mm')
th.convert('RGB').save(f'{OUT}/thumb.jpg', quality=92)
print('OK', round(t, 1), 's')
