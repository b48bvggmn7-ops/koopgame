#!/bin/bash
# probe_kamera.sh <json> <himmel> <kamera> <ziel>
cd "$(dirname "$0")"; mkdir -p $4
FILMJSON=$PWD/$1 ZIELDIR=$PWD/$4 SAMPLES=${SAMPLES:-16} BG_SAMPLES=${BG_SAMPLES:-64} KINDER=${KINDER:-5} THREADS=2 KAMERA_TEST=$3 VON=${FRAME:-0} BIS=${FRAME:-0} \
  ../bvenv/bin/python requisiten.py -- $PWD/$4/x.png filmvoll 10 .75 $PWD/platzhalter.json $PWD/zimmer.py > $4/log.txt 2>&1
../bvenv/bin/python zusammensetzen.py $4 $2 $4/fertig ${FRAME:-0} >> $4/log.txt 2>&1
echo fertig $3 $(grep -c Traceback $4/log.txt)
