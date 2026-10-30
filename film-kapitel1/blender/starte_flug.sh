#!/bin/bash
# Kameraflug in zwei Hälften rendern (überspringt fertige Bilder)
cd "$(dirname "$0")"; mkdir -p flug
for r in "0 59" "60 119"; do set -- $r
  FLUG=$PWD/flug FLUG_BILDER=120 VON=$1 BIS=$2 THREADS=2 setsid nohup ../bvenv/bin/python aussen.py -- $PWD/flug/x.png ${SAMPLES:-16} .75 > flug_log_$1.txt 2>&1 < /dev/null & disown
done
