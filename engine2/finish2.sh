#!/bin/bash
# finish2.sh PROJ AUDIO.wav  : PROJ/frames/*.jpg (any width) + mastered audio -> PROJ/out/final.mp4 (1080x1920, subs burned)
set -e; P=$1; A=$2; mkdir -p $P/out
ffmpeg -y -loglevel error -framerate 30 -i $P/frames/f%04d.jpg -i $A \
  -vf "scale=1080:1920:flags=lanczos,unsharp=5:5:0.55:5:5:0.0,ass=$P/subs.ass" -c:v libx264 -preset veryfast -crf 17 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart $P/out/final.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 $P/out/final.mp4
ffmpeg -y -loglevel error -i $P/out/final.mp4 -vf "fps=1/3,scale=216:384,tile=7x3" -frames:v 1 $P/out/qa_sheet.jpg
