#!/bin/bash
# alle Außen-Ebenen + Nahaufnahmen fürs Hineinzoomen
cd "$(dirname "$0")"
P=../bvenv/bin/python
for e in fern mitte busch blatt haus; do $P aussen.py -- $PWD/a_$e.png 64 1.5 $e > log_a_$e.txt 2>&1; echo "$e fertig" >> log_aussen.txt; done
$P aussen.py -- $PWD/a_haus_mittel.png 64 4 haus '[505,257,905,487]' > log_a_hm.txt 2>&1; echo "mittel fertig" >> log_aussen.txt
$P aussen.py -- $PWD/a_haus_nah.png 64 10 haus '[630,327,780,417]' > log_a_hn.txt 2>&1; echo "nah fertig" >> log_aussen.txt
echo ALLES >> log_aussen.txt
