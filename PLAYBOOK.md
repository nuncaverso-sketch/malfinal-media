# Mal Final: autopilot (scheduled task)

Goal: there must ALWAYS be scheduled in Metricool every free slot for the rest of today plus the next 2 days.
**Rhythm: 3 videos per day** (user decision, 11 Nov evening): **Mon–Fri 12:00, 18:00, 20:30 · Sat 11:00, 17:00, 20:00 · Sun 09:00, 13:00, 19:00**. Target: get each video as close to 10 as possible.
Each video passes through a **pre-production filter**: the reviewer, fed with the real metrics of the videos already published.

## Hard rules (from the user)
- Spanish channel "morbo educativo": real, absurd deaths, **no gore**. The moment of death is implied (cut away, hat, dust, flash).
- Mark every video as AI on all 4 networks:
  - `isAiGeneratedContent` (YouTube)
  - `isAigc` (TikTok)
  - `isAiGenerated` (Instagram)
  - the text "Animación hecha con apoyo de IA." in the copy
- Budget:
  - Don't buy or sign up for anything.
  - Don't clone real voices: use only the reference voices in `tts/`.
  - No bots, no bought engagement.
- Don't copy third-party characters or styles. Only use free CC0 assets.
- Never enter passwords. The user's email is private.
- Each video gets at most 1 attempt + 1 maximized redo. After that it gets published whether it passes or not.

## 0. Setup
```
git clone --depth 1 --single-branch -b pipeline https://github.com/nuncaverso-sketch/malfinal-media pipeline
cd pipeline && bash setup.sh && cd engine && npm i --silent three@0.187.0 puppeteer-core@25.16.0
```

## 1. Inventory (Metricool)
- blogId `8014220`, timezone `America/Mexico_City`.
- Slots (America/Mexico_City): **Mon–Fri 12:00, 18:00, 20:30 · Sat 11:00, 17:00, 20:00 · Sun 09:00, 13:00, 19:00**. The Sunday 13:00 slot ALSO carries the weekly compilation (YouTube only), so it still gets a short.
- `getScheduledPosts` from now to the end of day+2. Count the non-draft future posts.
- `needed = free slots in that window − count`. If `needed ≤ 0`, do only step 2 and finish.
- **Produce at most 1 video per run.** Assign it to the earliest free slot.

## 1b. Metricool free-plan limit (user decision, 11 Nov: do NOT pay; when it runs out, switch to Buffer)
- The free plan allows **20 posts per calendar month**. In November 2026, 13 had already been used as of 11 Nov (faro + 001–012).
- Keep the count in `state/posts.json` → `metricool_month_count` (`{"2026-11": 13}`). Add 1 for each `createScheduledPost`.
- With **2 or fewer** left: tell the user in the final summary ("quedan N publicaciones gratis en Metricool este mes").
- With **0 left**, or if Metricool rejects a post for the limit:
  - do NOT create more posts and do NOT get around the limit;
  - save the finished video to the repo and record it as `pendiente de publicar`;
  - **tell the user clearly**: "Se acabó el plan gratis de Metricool: configuremos Buffer". Do NOT configure Buffer without them: it needs their OAuth / approval.
- A new month resets the counter.

## 2. Analytics → `state/insights.md` (filter input)
Pull data with `getAnalyticsDataByMetrics` for the last 14 days:
- **TikTok** `posts`: views, likes, shares, comments, fullVideoWatchedRate, average time watched, forYou.
- **Instagram** `reels`.
- **YouTube** `videos`: if those metrics are deprecated, use the alternatives the tool suggests.

Map each post to its VID by its title or copy, using `state/posts.json`.

Then rewrite `state/insights.md`:
1. A table per video.
2. Top 3 vs bottom 3.
3. **Patterns**: hook type, topic (flood, invention, animal…), era, length, title format, retention.
4. **Concrete rules for the next script**, for example: "hooks that show the absurd object in frame 0 retain +X %".

Don't invent numbers. With fewer than 3 videos that have data, say "insufficient data" and keep the previous rules.

## 3. Idea
- **Backlog**: dashboard artifact `https://claude.ai/artifact/BPtNgZJa9uM6pVFTxi3cvz`, DB collection `ideas` with status `pendiente` (use ArtifactData).
- **If it's empty**: research new stories with WebSearch, using 2 reliable sources. They must be real, absurd and free of gore. Add 3 to the backlog.
- **Prioritize** according to the rules in `insights.md`.

## 4. PRE-PRODUCTION FILTER (reviewer, BEFORE rendering)
Write `script.txt` with these rules:
- **Length 62–75 s** (TikTok Creator Rewards needs more than 1 minute; the user does NOT want shorter videos). 15–20 lines.
- Line 1 = hook with the twist.
- Numbers spelled out so the TTS reads them well.

Also write `plan.md`, with one line per phrase: what is SEEN on screen, the camera, and the key action. It also contains the title, the copy and the hook text (≤ 4 words).

Then launch the reviewer subagent (general-purpose) with:
- `plan.md`, `script.txt`, `state/insights.md`, `qa/LESSONS.md`;
- the task: "rate 1–10 the hook, clarity of every beat, visual feasibility, and predicted potential based on the metrics. List changes."

If the score is < 8, apply the changes and evaluate again (up to 2 rounds).

## 4b. A/B hooks (applies to every video)
- Write **2 hooks**: A and B (title + on-screen text of up to 4 words).
- A goes to **YouTube + Facebook** (`youtubeData.title`, `facebookData.title`).
- B goes to **TikTok + Instagram** (`tiktokData.title` and the first line of the copy).
- The on-screen text alternates by video number: even = A, odd = B. Use the same video for all 4 networks.
- Record in `state/posts.json`: `hookA`, `hookB`, `burned: A|B`.
- In step 2, compare retention and views of A vs B against the network average, and keep the winning type in `insights.md`.

## 4c. Recycle what works WITHOUT being repetitive (user: "don't repeat too much")
- Recycle the **hook formula and the narrative structure** of the top performers, NOT the same topic over and over.
- At most 1 of every 4 videos may share a mechanism with the top performer, and never two in a row.
- Rotate country, era, setting and color palette. Don't reuse a set (street, room) that appeared in the last 3 videos.
- The pre-production filter checks this against the last 10 titles in `state/posts.json`.
- Old reference for mechanisms: Examples: absurd floods (beer, syrup), "survived the hard thing and died from the silly thing", "own invention", "his trick/wish came true". Also reuse its winning hook formula.
- The other video explores a new type, so we keep learning.

## 5. Production — ENGINE v2 ("pro" look, user decision 12 Nov: like RicksClips but in Spanish)
**Read `qa/RICK_STYLE.md` first (mandatory style guide).** Reference example (rick style, full pipeline): `engine2/examples/tycho.js` + `tycho_audio.py` (SFX: whoosh at every cut, themed cues) + `tycho_script.txt`. Reference look: RicksClips3000: rich detailed 3D sets, warm/cool cinematic light, shallow depth of field, simple round-head characters with ink outlines, 1–2 word captions, a new shot every ~2–3 s.
Setup once per session: `bash engine2/fetch_assets.sh` (CC0 Quaternius kits + Poly Haven HDRIs) and make sure `engine2/web/node_modules` → `engine/node_modules`.
1. Voice (unchanged, old engine tools): `bash engine/new_project.sh /home/claude/work/VID-XXX 8810` → `script.txt` → `tts/gen_blend.py` → `assemble_voice.py` (gives `voice/voice.wav` + `web/timing.json`) → `audio.py` (SFX cues + music, ducked) → `audio/mix.wav` → master to −14 LUFS as `finish.sh` does (`audio/final.wav`). `words_gen.py` for `words.json`.
2. Visuals: `bash engine2/new_project2.sh /home/claude/v2/NAME`; copy `web/timing.json` and `words.json` into it.
3. Write `web/scene.js` (copy the structure of `engine2/examples/*.js (lully, poleas, pinto, barba, pollo, vapor, abogado)`):
   - `build(K)`: `await K.preloadEnvs(); await K.timing();` then build each SET 200 m apart on x (sets farther than 140 m from the camera are culled automatically).
   - Assets: `await K.placeH('<pack>/<Model>', pos, rotY, heightMeters, {byW, tint})` — list models with `ls assets/quaternius/<pack>` (medieval_village_pack, house_interior_pack, buildings_pack_3, nature_pack, street_pack, rpg_items_pack, survival_pack, animals_pack, crops_pack, modular_medieval_buildings_pack…). Primitives: `K.box / K.cyl / K.sph / K.plane / K.tex(canvas)`; lights `K.pointLight` (few!).
   - Characters: `K.makeChar(K.scene, {shirt, pants, belt, buttons, tie, cape, hat:'top|bowler|cap|helmet|hard|tricorn|crown|chef|wig', hatColor, hair, mustache, beard, glasses, seed})`; per frame `K.poseChar(C, {pos, yaw, walk, run, sit, arms:'point|up|wave|akimbo|shrug|hold|hold2|cross|reach|think|fists|flail|drink|hammer', lean, look, expr:'neutral|happy|laugh|proud|smug|shock|scared|worried|sad|angry|tired', talk, tremble, fall, bounce, sweat, blush}, f)`; props via `C.hold(obj, offset, rot)`.
   - Per frame: pick the phrase `K.at(f)` / progress `K.u(f, i)`; light `K.preset('day|golden|dusk|night|interior|candle|storm', overrides)`; camera `K.move(A, B, u, shake, f)` where A/B come from **`K.frame([feet positions], {yaw, pitch, h, lookY, push, pad})` (auto-fits 9:16 — use it for every character shot)**; `K.focusOn(point)` for depth of field; `K.grade.flash/black/sat/vig`.
   - `hideAll()` at the top of `frame()` must RESET every object you move/scale in any shot (positions, visibility, parents) — a missed reset broke the wings in VID-009.
4. Stills: `node render.mjs st "<frames at 30% and 85% of each phrase>" 360 PORT` + `python3 engine2/sheet.py st sheet.jpg 11` → Read the sheet. Fix: camera inside geometry, characters cut by the 9:16 frame, the key action not visible, giant/tiny props, dark shots.
   - **Polish toward 10 (stills are cheap, renders are not):** reviewer subagent with the sheet + `plan.md` + `qa/LESSONS.md`; 1–10 per shot + overall; apply every change; up to 3 rounds or until overall ≥ 9 and every shot ≥ 8.
5. Render: `RESUME=1 node render.mjs frames 0-99999 720 PORT` in ONE background call (≈1.7 s/frame → 50–65 min for 60–70 s). Never two renders at once; don't run stills while a render is going (it halves the speed).
6. Captions: `python3 qa/captions_gen.py PROJ` (default STYLE=rick: 1–2 words, no hook title). `bash engine2/finish2.sh PROJ audio/final.wav` → `out/final.mp4` (1080×1920, ≤ ~55 MB so GitHub accepts it).

## 6. Post-production review (once)
Run the reviewer with `qa/review_prompt.md`.
- **PUBLICAR**: go to step 7.
- **REHACER**: one redo applying the whole list, then publish as is.
- Save the scores in `state/posts.json`.

## 7. Publish
1. Upload the MP4 to `main` of `nuncaverso-sketch/malfinal-media` WITHOUT downloading the history:
```
git clone --filter=blob:none --no-checkout --depth 1 https://github.com/nuncaverso-sketch/malfinal-media media && cd media && git sparse-checkout set --no-cone /README.md && git checkout main
cp out/final.mp4 VID-YYYYMMDD-NNN.mp4 && git add VID-*.mp4 && git commit -m "VID-..." && git push
```
2. Check that `https://raw.githubusercontent.com/nuncaverso-sketch/malfinal-media/main/VID-....mp4` returns 200.
3. `createScheduledPost`, using the same payload shape as the earlier posts (in `state/posts.json`, field `example_info`):
   - all 4 networks;
   - the AI flags;
   - hashtags `#historia #datoscuriosos #curiosidades #malfinal #historiasreales`;
   - a "Fuente:" line;
   - YouTube `type: short`, category `EDUCATION`, `madeForKids: false`.
4. Dashboard: in the `videos` collection add `{num, order, title, story, slotAt, status: programado, durationS, platforms}`, and in `ideas` set status `producido`.

## 7b. WEEKLY LONG COMPILATION (YouTube only, for watch hours)
Do this in the **Saturday afternoon run (15:47 Monterrey)**, unless `state/posts.json → compilations` already has one for that week. It replaces producing a short in that run.
1. **Items**: the shorts published Sun–Sat of that week, plus older ones if fewer than 8, never repeating the previous compilation's #1.
   - Order them by performance from `insights.md`: worst first, **best LAST**, as #1.
   - Write an `items.json` with `{file, title (no emojis), thumb_frame}`. `file` is the raw MP4 downloaded from `main` (curl).
2. `python3 compile/weekly.py OUT items.json` → `compilation.mp4`, `thumb.jpg`, `chapters.txt`. It takes about 15 min on 2 CPUs; run it in the background.
3. Look at `thumb.jpg` (Read). It needs big readable text and 3 clear frames.
4. Push `VID-COMP-YYYYMMDD.mp4` + `VID-COMP-YYYYMMDD.jpg` to `main` (blobless clone, as in step 7).
5. `createScheduledPost` for **Sunday 13:00**, **YouTube only**:
   - `youtubeData {type: "video", title, category: "EDUCATION", madeForKids: false, isAiGeneratedContent: true}`, plus `videoThumbnailUrl` = the jpg.
   - If it fails because of the thumbnail, retry without it.
   - Copy: hook line, `chapters.txt`, "Fuentes en cada short del canal.", "Animación hecha con apoyo de IA.", hashtags.
   - Title: e.g. "Las N muertes más absurdas de la historia (historias reales)".
   - It counts toward the Metricool limit (1b). If only 1 post is left, prioritize the short.
6. Record it in `state/posts.json → compilations`.

## 8. Save what was learned
Commit and push the `pipeline` branch with:
- `state/insights.md`
- `state/posts.json` (VID → Metricool id/uuid, project, scores)
- `qa/LESSONS.md`, if the reviewer found a new failure

`LESSONS.md` must stay a short checklist.

## 2b. Real retention data
The user may paste YouTube Studio screenshots ("se quedaron para mirar", avg view duration). Those numbers beat any API estimate: put them at the top of `insights.md` and judge scripts against the KPI targets there (stayed ≥ 60 %, avg ≥ 35 s).
