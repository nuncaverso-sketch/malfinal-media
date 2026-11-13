#!/bin/bash
# fetch_assets.sh -> pipeline/assets/{quaternius,hdri}  (all CC0: Quaternius packs via github mirror, Poly Haven HDRIs)
set -e; A=$(cd "$(dirname "$0")/.." && pwd)/assets; mkdir -p $A/hdri
if [ ! -d $A/quaternius/medieval_village_pack ]; then
  T=$(mktemp -d); git clone -q --filter=blob:none --no-checkout --depth 1 https://github.com/trebeljahr/quaternius-showcase $T/qs
  (cd $T/qs && git sparse-checkout set --no-cone 'public/glb/*' && git checkout -q) && rm -rf $A/quaternius && cp -r $T/qs/public/glb $A/quaternius && rm -rf $T
fi
for n in venice_sunset kloppenheim_06_puresky qwantani_dusk_2 satara_night_no_lamps blouberg_sunrise_2 lebombo; do [ -s $A/hdri/$n.hdr ] || curl -s -m 60 -o $A/hdri/$n.hdr https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/${n}_1k.hdr; done
cd $(dirname "$0")/web && [ -e node_modules ] || ln -sfn ../../engine/node_modules node_modules
echo ASSETS_OK
