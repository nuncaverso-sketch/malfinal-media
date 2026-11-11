# Lessons from the reviewer (use BEFORE rendering)

Rule (user): each video gets 1 attempt + at most 1 maximized redo, then it gets published whether it passes or not. Avoid re-rendering: get it right on the first try.

## Audio
- Music at ≈ −16 dB, SFX at −14 dB relative to the voice, ducking on the voice, high-pass at 120 Hz on the music.
- Thunder, crashes and big effects go in the PAUSES, never on top of key words.
- TP ≤ −1 dBTP (alimiter 0.8), −14 LUFS.
- Silences inside a phrase compressed to ≤ 0.32 s; gaps between phrases 0.24–0.45 s; tail 0.8 s.
- Whisper check per line: key words (twist, names, "mar", "peor") must come out right; if the TTS gets one wrong, change the wording ("Ni él" instead of the name).

## Subtitles
- 2–4 words, cut on punctuation, minimum 0.5 s, numbers as digits (years and counts), NFC accents.
- Poppins 96, MarginV 560; in shots with a face in the center, move them to the top (\an8).
- Hook title (2.8 s) must NOT repeat the first subtitle, and must not cover signs or text in the scene.

## Image / narrative (the most common failures)
1. **Every key action must be SHOWN on screen**, not implied: the burst, the impact, the fall, the capture, the collapse. A shot ≥ 1.5 s, with no fade on top.
2. **The hook in frame 0 already has action** and is readable in 0.5 s; never start on an empty shot or a white or black flash.
3. **The camera never goes inside geometry** (check houses on both sides, rocks, foam/spray particles near the camera).
4. **Check horizontal framing**: at 9:16 the half-width ≈ distance × tan(fov/2) × 0.5625. Characters outside that range DON'T show up.
5. When the voice mentions someone (the boss, the king, the victims), that character is on screen. When it gives a number ("8 people"), show it (8 figures or 8 candles).
6. Expressions match the moment: no smiles in tragedies (use neutral, nervous, pained or stern).
7. Fluids (water, beer, syrup): animated (bobbing, foam moving, particles), never a static slab.
8. No objects close to the camera covering it (scrolls, logs, foam).
9. Ending with a loop: the last shot cuts to the hook shot.
10. Recognizable objects: the crown on the head, iron that looks like iron, candles with a flame.

## Process
- Stills at 25 % and 80 % of each phrase BEFORE rendering the whole thing; fix all of it in one pass.
- Run measure.py (cheap) on every final video. Only run the reviewer agent on the first attempt of new videos.
