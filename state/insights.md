# Insights (analytics → rules)

Updated: 2026-11-11 13:50 (America/Mexico_City). **Insufficient data**: keep the previous rules.

## Analytics status
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
- Hook with action in frame 0 plus a 3-4 word top title that does not repeat the subtitle.
- Every key beat shown on screen; the twist is clear in the last line.
- 50-65 s; average shot ≤2.5 s; loop ending.
- Burned-in subtitles, numbers as digits.
