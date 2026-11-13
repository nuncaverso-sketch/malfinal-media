# Rick-style guide (from ~200 frames of 28 RicksClips3000 shorts, 13 Nov) — applies to every NEW video
Goal: look like a premium cartoon channel. Engine v2 now renders this by default (`style=rick`: cel shading + ink lines on every edge, big heads, saturated grade, whip/punch at every cut).

## Look
- **Characters**: huge round off-white head (≈ torso height), short colourful pill body with details (buttons, belt, collar, tie, cape, patterns), thin black stick limbs, dot hands. Thick ink outline. Expressive brows; sweat drops; blush. 1–3 characters per shot, never tiny in frame.
- **Sets**: dense, specific, colour-themed per scene (pink cell, teal checker floor, red throne room). Lots of props telling WHERE we are. Nothing empty: floors with pattern/texture, walls with decor, foreground objects.
- **Signs**: big readable signs/boards that explain the beat (e.g. "PARDONS", "YEARS AT WAR 100", "OUR WINNERS"). Use `K.sign('TEXTO', pos, {w,h,bg,fg})` — Spanish, 1–3 words, create in `build()` (never in `frame()`).
- **Light**: stylised and moody: warm lamps, moonlight blue, god rays/bloom on bright sources, coloured sky gradients. Each set has ONE dominant colour mood.

## Camera (most important difference with our old videos)
- **Close**: faces fill 30–60 % of the frame in most shots; medium-close is the default, wide only for 1 establishing shot per set.
- **Wide lens** (44–50° vertical) with strong perspective; **low angles** (pitch ≈ −0.05…0.05) looking slightly up at characters; occasional top-down and extreme close-up of the key object.
- **Foreground**: put an object or a shoulder in the foreground of ~1 in 4 shots.
- New shot every 2–3 s; within a shot the camera always drifts/pushes (never static). Re-use the hook framing at the end (loop).
- Cuts: engine adds whip-blur + punch-in automatically at every phrase start (`K.AUTO_CUTS`). Extra cut inside a long phrase = switch camera at u≈0.5.

## Script (from transcripts: 47–69 s, ~3.4 words/s)
- Line 1: the absurd concrete detail + stakes ("Este astrónomo tenía la nariz de metal… y lo mató la cortesía").
- A **rule/setup** the viewer remembers (a strange object, a custom, a law).
- Re-hooks every ~10 s: "Pero eso no fue lo más raro.", "Y aquí todo salió mal."
- 1–2 comic asides (a pet elk, a math duel).
- Payoff in the last 8 s, then end at the peak (short "Nadie planea su final." tag). No intro, no "sígueme".

## Captions
1–2 words, white Poppins Black with thick black outline, lower-middle (`STYLE=rick`, default).
