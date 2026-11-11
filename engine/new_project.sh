#!/bin/bash
# new_project.sh DIR PORT  -> creates DIR with the engine wired in (web/, render.mjs on PORT, finish.sh, assemble_voice.py, audio.py template)
set -e
E=$(cd "$(dirname "$0")" && pwd); D=$1; PORT=${2:-8810}
mkdir -p $D/web $D/frases $D/voice $D/audio $D/out
cp $E/engine.js $E/toon.js $E/paint.js $E/index.html $D/web/
cp $E/render.mjs $E/finish.sh $E/assemble_voice.py $D/
cp $E/audio_example.py $D/audio.py
ln -sfn $E/node_modules $D/web/node_modules; ln -sfn $E/node_modules $D/node_modules
sed -i "s/listen([0-9]*)/listen($PORT)/; s/localhost:[0-9]*/localhost:$PORT/" $D/render.mjs
echo "project $D ready (port $PORT)"
