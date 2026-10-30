#!/bin/bash
cd "$(dirname "$0")"
P=../bvenv/bin/python; J=$PWD/platzhalter.json; Z=$PWD/zimmer.py
lauf(){ $P requisiten.py -- $PWD/r_$1.png $2 $3 $4 $J $Z > log_r_$1.txt 2>&1; echo "$1 fertig" >> log_req.txt; }
lauf hinten hinten 96 1.5
lauf sofa_s sofa_s 64 1.5
lauf sofa_sa sofa_sa 64 1.5
lauf sessel_p sessel_p 64 1.5
lauf decke decke_3_7_11_15_19_23_28_34_42_55 48 1.5
lauf keks keks 64 1.5
lauf buendel buendel 64 1.5
lauf zettel_liegt zettel_liegt 64 1.5
for b in 0 1 2 3; do lauf spr_keks$b spr_keks$b 48 3; done
lauf spr_zettel spr_zettel 48 3
lauf spr_buendel spr_buendel 48 3
echo ALLES >> log_req.txt
