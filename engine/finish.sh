#!/bin/bash
# frames/ + audio/mix.wav -> out/final.mp4 at 1080x1920, ~-14 LUFS, QA report + sheet
set -e
mkdir -p out
I=$(ffmpeg -hide_banner -i audio/mix.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
G=$(python3 -c "print(round(-14-($I),2))")
echo "mix LUFS $I -> gain $G dB"
ffmpeg -y -loglevel error -i audio/mix.wav -af "volume=${G}dB,alimiter=limit=0.8:level=false" -ar 48000 audio/final.wav
ffmpeg -y -loglevel error -framerate 30 -i frames/f%04d.jpg -i audio/final.wav \
  -vf "scale=1080:1920:flags=lanczos,unsharp=5:5:0.4,ass=subs.ass" -c:v libx264 -preset veryfast -crf 17 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/final.mp4
echo "--- QA ---"
ffmpeg -hide_banner -i out/final.mp4 -vf "freezedetect=n=0.002:d=0.4,blackdetect=d=0.15:pix_th=0.05" -af ebur128 -f null - 2>&1 | grep -E "freeze_start|freeze_duration|black_start|^\s+I:|^\s+LRA:" | tail -12
ffprobe -v error -show_entries format=duration -of csv=p=0 out/final.mp4
ffmpeg -y -loglevel error -i out/final.mp4 -vf "fps=1/3,scale=216:384,tile=7x3" -frames:v 1 out/qa_sheet.jpg
