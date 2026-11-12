# Insights (analytics → rules)

Updated: 2026-11-12 07:55 (America/Mexico_City). YouTube views/likes only (3 videos); no retention data yet → previous rules stay, plus tentative notes below.

## Latest read (2026-11-12 ~07:55 CST)
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
- 50-65 s; average shot ≤2.5 s; loop ending.
- Burned-in subtitles, numbers as digits.
