# Insights (analytics → rules)

Updated: 2026-11-13 16:20 (America/Mexico_City). Metricool still returns null YTVP metrics and 0 TikTok rows → insufficient new data, rules unchanged (Studio data below still rules).
- 2026-11-13 15:47 run: VID-015 Hunley (own invention / tested it himself) scheduled Sun 15 19:00; Tycho moved to 13:00 to avoid adjacency with the lawyer video. Metricool 16/20 used.
- 2026-11-13 07:50 run ABORTED: Metricool connector failed to connect (CONNECT_TIMEOUT). No inventory, no video produced, count unchanged (14/20).


## REAL YouTube Studio data (screenshots from the user, 12 Nov 17:24) — HIGHEST PRIORITY
| VID | hours live | views | stayed to watch (not swiped) | avg view duration | watch h | subs |
|---|---|---|---|---|---|---|
| niágara (002) | 28 | 1,344 | **58.2 %** | 0:26 | 5.9 | 0 |
| ventana (004) | 5 | 1.2K | 49.5 % | **0:31** | – | – |
| eiffel (003) | 21 | 1,024 (still climbing, 2nd wave) | 43.4 % | 0:26 | 3.4 | +1 |
- 97–98 % of views come from the Shorts feed → the first 1–2 s decide everything.
- Diagnosis: (1) **Hook**: 42–57 % swipe immediately. Target ≥ 65 %. Niágara (contrast "survived X… died from Y" visible from frame 0) is best. (2) **Mid-video drop**: avg 26–31 s of a 62–75 s video (~40 %). Viewers leave in the middle, not at the start only. (3) Almost 0 subs: no reason to follow.
## RULES derived from this (apply to EVERY new script, override older tentative rules)
1. **Frame 0 = the absurd payoff image** (barrel in falls, man in wing suit on the tower edge, wave of beer) + 3-4 word on-screen text. No establishing shot, no scenery, no "en 1912…" opener.
2. **Line 1 ≤ 9 words and contains the contrast/twist** ("Sobrevivió al Niágara en un barril… y lo mató una cáscara"). Don't explain before the hook.
3. **Open loop**: line 1 or 2 promises the ending ("lo que lo mató fue ridículo"); the payoff is delivered in the LAST 8 s. Never reveal the cause of death in the middle.
4. **Re-hooks at ~20 s and ~40 s**: a short line that raises stakes ("Pero eso no fue lo peor…", "Y aquí todo salió mal."), with a visual change (new location / zoom / SFX hit) on the same frame.
5. No dead air: every shot ≤ 2.5 s, camera always moving; cut any line that only gives background (dates, names) unless it's ≤ 5 words.
6. **Last line = twist + a loop back to frame 0** and an implicit follow reason (e.g. series tag "Muertes absurdas #N" on screen) — no begging CTA.
7. KPI targets to judge future videos: stayed ≥ 60 %, avg view ≥ 35 s, ≥ 1 sub per 500 views.
8. Topics: "survived the impossible / died from something silly" and "own invention killed him" first (niágara, ventana top on stayed/avg).

## Latest read (2026-11-12 ~23:50 CST, run during PAUSE — analytics only)
- Metricool: TikTok `posts` / IG `reels` 0 rows; YTVP rows (faro, cerveza, niágara, Eiffel) still all null.
- RYD API: faro 1276 v / 28 l; cerveza 1285 / 36 (unchanged, cached); niágara 1329 / 35 (unchanged). Plateau confirmed; rules unchanged (Studio data above still rules).
- Still missing YT ids for Eiffel/ventana/jarabe.

## Previous read (2026-11-12 ~15:50 CST)
- Metricool: TikTok `posts` / IG `reels` still 0 rows; YTVP rows (faro, cerveza, niágara, now also Eiffel) all null. Ventana (12 Nov 12:00) not listed yet.
- Return YouTube Dislike API:
  | VID | hours live | views | likes | Δviews last ~8 h |
  |---|---|---|---|---|
  | niágara (002) | ~27 | 1329 | 35 | +65 |
  | cerveza (001) | ~32 | 1285 | 36 | +56 |
  | faro | ~44 | 1254 | 28 | +13 |
- All three have plateaued at ~1.25–1.35k on YouTube (Shorts feed push ended ~24 h). Ranking unchanged: niágara ≥ cerveza > faro. Still n=3 → rules unchanged.
- Next run: find YT ids for Eiffel/ventana (from Metricool post links once published) to grow n.

## Previous read (2026-11-12 ~07:55 CST)
- Metricool: TikTok `posts` / IG `reels` still 0 rows; YTVP rows for faro/cerveza/niágara still all null. Eiffel not listed yet.
- Return YouTube Dislike API:
  | VID | hours live | views | likes | likes/views | views/h total | Δviews last ~8 h |
  |---|---|---|---|---|---|---|
  | niágara (002) | ~19 | 1264 | 35 | 2.8 % | ~67 | +415 |
  | cerveza (001) | ~24 | 1229 | 36 | 2.9 % | ~50 | +426 |
  | faro | ~36 | 1241 | 28 | 2.3 % | ~34 | +23 (stalled) |
- Top: niágara ≈ cerveza (both still growing ~50/h overnight). Bottom: faro (plateaued at ~1.2k after ~28 h).
- Note: likes counts fluctuate in the API (cached); trust views more than likes.
- Still n=3, YouTube only → tentative pattern unchanged (twist-contrast hook + concrete object/number in a short CAPS title).

## Latest read (2026-11-11 ~23:50 CST)
- Metricool: TikTok `posts` and IG `reels` still 0 rows; YouTube YTVP rows exist for faro/cerveza/niágara but all metrics null (sync lag). Eiffel (11 Nov 19:30) not listed yet.
- Return YouTube Dislike API:
  | VID | hours live | views | likes | likes/views | views/h |
  |---|---|---|---|---|---|
  | niágara (002) | ~11 | 849 | 36 | 4.2 % | ~77 |
  | cerveza (001) | ~16 | 803 | 37 | 4.6 % | ~50 |
  | faro | ~28 | 1218 | 27 | 2.2 % | ~43 |
- Top: niágara (fastest views/h) and cerveza (best like rate). Bottom: faro (lowest like rate).
- Tentative pattern (n=3, YouTube only, NOT a rule yet): "survived the hard thing, died from the silly thing" (niágara) and absurd flood with a number in the title (cerveza, "8 personas") beat the long, descriptive faro title. Short CAPS-keyword titles with a concrete object/number look better than long titles.
- Hook A/B: no per-network data yet to compare.

## Analytics status (previous)
- Published on all 4 networks (Metricool status PUBLISHED):
  - faro (Winstanley), 10 Nov 19:30. YT p4m9-jI6EyE, TT 7706719998227565876, IG DflTrOhAk8q.
  - VID-20261110-001 cerveza, 11 Nov 07:30. YT 7PLnZXO0RNw, TT 7706906318979779861, IG DfmmOXxkYb-.
  - VID-20261110-002 niágara, 11 Nov 13:00. YT BHhIddLFpC4, TT 7706991138355711252, IG DfnL7y-gHi0.
- `getAnalyticsDataByMetrics` for the last 14 days returned **0 rows** on:
  - TikTok `posts` (TKPO*);
  - Instagram `reels` (IGRE*);
  - YouTube `videos published in range` (YTVP*). The old `videos` YTVI* fields are deprecated, so use YTVP*.
- This is probably sync lag on Metricool's side (24-48 h). The next run should retry.
- **External source (public, no login): Return YouTube Dislike API** `https://returnyoutubedislikeapi.com/votes?videoId=<id>`, which gives YouTube views and likes. Read 2026-11-11 ~14:00 CDT:
  | VID | YT id | views | likes | likes/views |
  |---|---|---|---|---|
  | faro (10 Nov 19:30) | p4m9-jI6EyE | 505 | 16 | 3.2 % |
  | cerveza (11 Nov 07:30) | 7PLnZXO0RNw | 0* | 0* | n/a |
  | niágara (11 Nov 13:00) | BHhIddLFpC4 | 0* | 0* | n/a |
  
  \*The API only started tracking these at 20:00Z today, so the 0 is not real; read them again on the next run.
- TikTok, Instagram and Facebook block automated reads (robots). Don't get around that. Retention, watch time and shares are not public anywhere, so they can only come from Metricool or the native apps.
- Metric IDs to use:
  - TikTok: TKPO02, 05, 06, 07, 08, 09, 10, 13 (full watch), 15 (avg watch), 16 (forYou).
  - Instagram: IGRE02, 03, 23 (views), 10, 21 (shares), 12, 24 (avg watch), 27 (retention), 30 (skip rate). IGRE13 and IGRE15 are deprecated.
  - YouTube: YTVP02, 17, 06, 08, 09, 11, 12.

## Current rules (from the reviewer, until there is data)
- Tentative (n=3): title ≤ 9 words, 1 CAPS keyword + concrete number or object; prefer twist-contrast hooks ("sobrevivió a X… lo mató Y").
- Hook with action in frame 0 plus a 3-4 word top title that does not repeat the subtitle.
- Every key beat shown on screen; the twist is clear in the last line.
- 62-75 s (user: do NOT shorten, monetization); average shot ≤2.5 s; loop ending.
- Burned-in subtitles, numbers as digits.
