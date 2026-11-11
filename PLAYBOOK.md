# Mal Final: autopilot (scheduled task)

Goal: there must ALWAYS be **6 videos scheduled** in Metricool for the rest of today plus the next 2 days.
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
- Slots: **07:30, 13:00, 19:30** (on weekends 09:30, 13:00, 19:30).
- `getScheduledPosts` from now to the end of day+2. Count the non-draft future posts.
- `needed = 6 − count`. If `needed ≤ 0`, do only step 2 and finish.
- **Produce at most 1 video per run.** Assign it to the earliest free slot.

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
- 12–18 lines, ≤ 60 s.
- Line 1 = hook with the twist.
- Numbers spelled out so the TTS reads them well.

Also write `plan.md`, with one line per phrase: what is SEEN on screen, the camera, and the key action. It also contains the title, the copy and the hook text (≤ 4 words).

Then launch the reviewer subagent (general-purpose) with:
- `plan.md`, `script.txt`, `state/insights.md`, `qa/LESSONS.md`;
- the task: "rate 1–10 the hook, clarity of every beat, visual feasibility, and predicted potential based on the metrics. List changes."

If the score is < 7, apply the changes once and move on.

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
5. Stills: `node render.mjs st1 "<frames at 25% and 80% of each phrase>" 360`. Make a contact sheet, look at it, and fix everything in ONE pass.
6. Render: `RESUME=1 node render.mjs frames 0-99999 720`.
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

## 8. Save what was learned
Commit and push the `pipeline` branch with:
- `state/insights.md`
- `state/posts.json` (VID → Metricool id/uuid, project, scores)
- `qa/LESSONS.md`, if the reviewer found a new failure

`LESSONS.md` must stay a short checklist.
