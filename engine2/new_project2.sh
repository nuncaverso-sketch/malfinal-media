#!/bin/bash
# new_project2.sh DIR  -> project wired to engine v2 (web/ holds symlinks + your scene.js + timing.json)
set -e
E=$(cd "$(dirname "$0")" && pwd); D=$1
mkdir -p $D/web $D/out
for f in core.js char.js index.html; do ln -sfn $E/web/$f $D/web/$f; done
ln -sfn $E/web/node_modules $D/web/node_modules; ln -sfn $E/../assets $D/web/assets
ln -sfn $E/web/node_modules $D/node_modules; cp $E/render.mjs $D/render.mjs
echo "v2 project $D ready"
