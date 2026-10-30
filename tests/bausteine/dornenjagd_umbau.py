# tests/bausteine/dornenjagd_umbau.py – Abschnitt 1, Spalten 1097–1148 neu gebaut (Nutzerwunsch 30.10.: „ganze Höhe nutzen,
# bestehende Elemente, Stachelwand ist gut, Bröckelwände, die sie zerschlägt – das Rennen spannender“).
#
#   unten (Reihe 12–14, Läufer): die Stachelwand (Gruppe ab Spalte 1096, Hebel 28) jagt EINMAL bis ans Ende; im Gang
#     Bröckel-Decken (drunter durch), ein Bröckel-Pfeiler (drüber springen), eine Grube mit Bröckel-Brücke – die Wand
#     zerschlägt alles hinter dem Läufer (js/05 stachelwandZerschlaegt); Türen 28/30, Hebel 29/31 für den Kletterer
#   oben (Reihe 2–5 auf Boden Reihe 6, Kletterer): Stufen oder Haken hinauf, Hebel 28 (startet die Jagd), Tür 29,
#     Hebel 30, Bröckel-Brücke über eine Lücke (Rettungs-Haken darüber), Tür 31, Sprung hinunter zum Checkpoint 1149;
#     über den Türen Wand bis ganz oben (Reihe −3) – man kommt nicht drüber
#   Wechsel wie vorher: 28 oben öffnet unten, 29 unten öffnet oben, 30 oben öffnet unten, 31 unten öffnet oben.
# Aufruf: python tests/bausteine/dornenjagd_umbau.py   (schreibt Spiel- und Editor-Datei über den Editor)
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import level_bau as L

DATEI = 'dschungel/abschnitt-1-sternschnuppenspur.json'
C0, C1 = 1098, 1148          # neu gebauter Bereich (1096/1097 = Stachelwand mit Stacheln, 1149 = Checkpoint bleiben)

lv = L.Level(DATEI)
# ---- alles im Bereich weg (Kacheln Reihe −3…14, Punkte), Boden ab Reihe 15 bleibt
lv.rechteck(C0, -3, C1, 14, None)
for feld in ('switches', 'doors', 'hooks', 'coins', 'spikes', 'plates', 'windraeder', 'switchFloors', 'bouncers'):
    lv.ed[feld] = [p for p in lv.ed.get(feld, []) if not (C0 <= p['c'] <= C1 and -3 <= p['r'] <= 14)]

# ---- Stachelwand: fährt nur noch EINMAL (nicht zurück durch alles)
for m in lv.ed.get('movers', []):
    if m['c'] == 1096 and m['r'] == 12 and m.get('link') == 28: m['einmal'] = True; m['dc'] = 1145 - 1096

# ---- unterer Gang (Läufer): Decke = Boden Reihe 11 von 1112 bis 1146
lv.rechteck(1112, 11, 1146, 11, 'ground')
lv.rechteck(1113, 12, 1115, 12, 'crumble')          # Bröckel-Decke (drunter durch – die Wand zerschlägt sie)
lv.punkt('doors', 1119, 12, link=28); lv.punkt('doors', 1119, 13, link=28); lv.punkt('doors', 1119, 14, link=28)
lv.punkt('switches', 1123, 14, link=29)              # öffnet oben Tür 29
lv.rechteck(1127, 13, 1127, 14, 'crumble')          # Bröckel-Pfeiler (drüber springen)
for c in (1129, 1130):                               # Grube mit Bröckel-Brücke
    lv.leer(c, 16); lv.leer(c, 17); lv.kachel(c, 15, 'crumble')
lv.punkt('doors', 1133, 12, link=30); lv.punkt('doors', 1133, 13, link=30); lv.punkt('doors', 1133, 14, link=30)
lv.punkt('switches', 1137, 14, link=31)              # öffnet oben Tür 31
lv.rechteck(1140, 12, 1141, 12, 'crumble')          # zweite Bröckel-Decke
for c, r, k in ((1104, 14, None), (1108, 14, None), (1114, 14, 'geschick'), (1121, 14, None), (1127, 12, 'geschick'),
                (1135, 14, None), (1143, 14, None)):
    lv.muenze(c, r, 'pink', k)

# ---- oberer Weg (Kletterer) auf Boden Reihe 6
lv.rechteck(1100, 8, 1101, 8, 'ground')             # Stufe vom Einstieg (Reihe 11 bei 1095–1097) hinauf
lv.haken(1102, 2, 5)                                 # oder per Haken
lv.rechteck(1104, 6, 1129, 6, 'ground')
lv.punkt('switches', 1110, 5, link=28)              # startet die Jagd und öffnet unten Tür 28
lv.rechteck(1118, -3, 1118, 1, 'wall')              # Wand über Tür 29 bis ganz oben
lv.punkt('doors', 1118, 2, link=29); lv.punkt('doors', 1118, 3, link=29); lv.punkt('doors', 1118, 4, link=29); lv.punkt('doors', 1118, 5, link=29)
lv.punkt('switches', 1126, 5, link=30)              # öffnet unten Tür 30
lv.rechteck(1112, 7, 1146, 10, 'ground')            # zwischen den Wegen voll Erde (sonst liefe man unten an den Türen vorbei)
lv.rechteck(1130, 7, 1133, 10, None)                # … bis auf die Grube unter der Bröckel-Brücke, unten Stacheln
for c in range(1130, 1134): lv.stachel(c, 10, 0)
lv.rechteck(1130, 6, 1133, 6, 'crumble')            # Bröckel-Brücke über die Grube
lv.haken(1131, 1, 4)                                 # Rettungs-Haken, falls die Brücke schon weg ist
lv.rechteck(1134, 6, 1146, 6, 'ground')
lv.rechteck(1140, -3, 1140, 1, 'wall')              # Wand über Tür 31 bis ganz oben
lv.punkt('doors', 1140, 2, link=31); lv.punkt('doors', 1140, 3, link=31); lv.punkt('doors', 1140, 4, link=31); lv.punkt('doors', 1140, 5, link=31)
for c, r, k in ((1100, 7, None), (1102, 4, 'geschick'), (1107, 5, None), (1114, 5, None), (1122, 5, None),
                (1131, 3, 'geschick'), (1137, 5, None), (1144, 5, None)):
    lv.muenze(c, r, 'blue', k)

lv.merke('Dornenjagd 1097–1148 neu (ganze Höhe, Bröckel, Stachelwand einmal)')
if __name__ == '__main__':
    L.speichern([lv])
    print('gespeichert:', DATEI)
