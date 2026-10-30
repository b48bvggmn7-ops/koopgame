#!/bin/bash
cd "$(dirname "$0")"
P=../bvenv/bin/python; J=$PWD/platzhalter.json; Z=$PWD/zimmer.py
lauf(){ $P requisiten.py -- $PWD/r_$1.png $2 $3 $4 $J $Z > log_r_$1.txt 2>&1; echo "$1 fertig" >> log_req2.txt; }
lauf sofa_s sofa_s 64 1.5
lauf sofa_sa sofa_sa 64 1.5
lauf polster_s polster_s 48 1.5
lauf polster_sa polster_sa 48 1.5
lauf polster_p polster_p 48 1.5
lauf keks keks 64 1.5
lauf buendel buendel 64 1.5
lauf zettel_liegt zettel_liegt 64 1.5
echo ALLES >> log_req2.txt
