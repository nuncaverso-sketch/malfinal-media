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

## 5. Production (one project per video)
1. `bash engine/new_project.sh /home/claude/work/VID-XXX 8810` → `cd` into it and copy `script.txt` there.
2. TTS: `python3 ../../pipeline/tts/gen_blend.py script.txt frases` (resumable; about 1 min per line on CPU). Check it with Whisper: key words must be correct.
3. Voice: `python3 assemble_voice.py` creates `voice/voice.wav` and `web/timing.json`.
4. Write `web/world.js` + `web/story.js` following `examples/` (cerveza, barba, eiffel) and **the whole checklist in `qa/LESSONS.md`**:
   - hook with action in frame 0;
   - every key action ON screen;
   - camera never inside geometry; check the horizontal framing;
   - no smiles in tragedies;
   - animated fluids;
   - loop ending.
5. Stills: `node render.mjs st1 "<frames at 25% and 80% of each phrase>" 360`. Make a contact sheet.
5b. **POLISH TOWARD 10 (before rendering — stills are cheap, renders are not):**
   - Launch the reviewer subagent with the contact sheet, `plan.md`, `voice/voice.wav` (it may transcribe it) and `qa/LESSONS.md`.
   - Ask it for a **1–10 score per shot** plus an overall score, and for every shot below 9, the exact change.
   - Apply ALL the changes, render the stills again, and repeat. **Up to 3 rounds, or until the overall score is ≥ 9 AND every shot ≥ 8.** It must also pass the strict tests in `qa/review_prompt.md` on the stills: silent, first second, composition, variety.
   - Only then do the full render. That keeps the final review from finding things that need a re-render.
6. Render at **native 1080** (sharper): `RESUME=1 node render.mjs frames 0-99999 1080`. That takes about 2 s/frame, so use 9-minute chunks.
   - At 0.9 s/frame on 2 CPUs. Use background calls ≤ 2 h, or 9-minute foreground chunks.
   - Never run 2 renders in parallel.
7. Audio: adapt the cues in `audio.py` (use `audio_example.py` as the base, with ducking already in it). Run `python3 audio.py web/timing.json voice/voice.wav audio`.
8. Subtitles: `python3 ../../pipeline/qa/words_gen.py $(pwd)` and `HOOK_Y=700 python3 ../../pipeline/qa/captions_gen.py $(pwd) "HOOK|TEXT"`.
   - If a shot has a face in the center: `TOP_PHRASES=n,m`.
9. `bash finish.sh` creates `out/final.mp4`.
10. Measure: `python3 ../../pipeline/qa/measure.py out/final.mp4 script.txt qa --voice voice/voice.wav --timing web/timing.json`.

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
