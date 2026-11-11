#!/bin/bash
# One-time setup in a fresh session (Linux cloud workspace). Idempotent.
set -e
P=$(cd "$(dirname "$0")" && pwd)
pip install --break-system-packages -q chatterbox-tts==0.1.7 faster-whisper==1.2.1 soundfile scipy pillow opencv-python-headless 2>&1 | tail -2 || true
mkdir -p "$P/engine" && cd "$P/engine" && [ -d node_modules/three ] || npm i --silent three@0.187.0 puppeteer-core@25.16.0
fc-list | grep -qi poppins || { mkdir -p ~/.fonts && echo "WARN: Poppins font missing (subtitles fall back); install from Google Fonts if allowed"; }
which google-chrome chromium 2>/dev/null | head -1
echo SETUP_OK
