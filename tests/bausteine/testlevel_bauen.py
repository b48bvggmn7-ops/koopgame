# Erzeugt levels/test/bausteine-nacht.json – die Bausteine des Nacht-Ausbaus nebeneinander (Boden-Oberkante Reihe 15):
#   B1 Dash-Grube (10 breit)            Affe: Sprung + Dash · Schweinchen: Segeln
#   B2 Durchbruch-Tor + Grube (9)       Dash durch die Wand, im Bruch-Fenster springen
#   B3 Haftfläche über Grube (14)       hoch halten, entlangrollen, am Ende loslassen
#   B4 Kamin mit Durchbruch-Deckel      Wandsprung hinauf, oben Dash nach oben durch den Deckel
#   B5 Haken -> Durchbruch-Wand         Affe: Schwung, loslassen, Dash durch die Wand · Schweinchen: Segeln + Dash
#   B6 Haftfläche + Dash (16)           an der Decke bis zum Ende, dann Dash über den Rest
#   B7 Segel-Dash-Grube (17)            nur Schweinchen: Segeln + Dash (Rolle)
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
T = 40
solids, spikes, bruch, haft, hooks = [], [], [], [], []
def rect(c0, r0, c1, r1, typ='ground'): solids.append({'x': c0*T, 'y': r0*T, 'w': (c1-c0+1)*T, 'h': (r1-r0+1)*T, 'type': typ})
def grube(c0, c1):
    rect(c0, 17, c1, 17)
    for c in range(c0, c1 + 1): spikes.append({'x': c*T + T//2, 'y': 17*T, 'dir': 0, 'w': T, 'h': T})   # Spiel-Format: x = Mitte, y = Unterkante
# B1
rect(0, 15, 19, 17); grube(20, 29); rect(30, 15, 38, 17)
# B2: Gang (dicke Decke bis Reihe 12) mit Durchbruch-Wand Spalte 38, direkt dahinter Grube 39–47
rect(33, 4, 38, 12, 'wall'); bruch += [{'x': 38*T, 'y': r*T, 'w': T, 'h': T} for r in (13, 14)]
grube(39, 47); rect(48, 15, 64, 17)
# B3: Grube 65–78, Haftdecke Reihe 11 über 63–79
grube(65, 78); rect(55, 5, 79, 10, 'wall'); haft.append({'x': 63*T, 'y': 11*T, 'w': 17*T, 'h': T}); rect(79, 15, 95, 17)   # dicker Fels über der Haftfläche
# B4: Kamin innen 97–100, Wände 96 (Reihen 6–13) und 101 (6–14), Deckel Reihe 5 aus Durchbruch, oben Boden ab 101
rect(96, 6, 96, 13, 'wall'); rect(101, 6, 101, 14, 'wall'); rect(96, 15, 101, 17)
bruch += [{'x': c*T, 'y': 5*T, 'w': T, 'h': T} for c in range(97, 101)]
rect(96, 5, 96, 5, 'wall'); rect(101, 5, 112, 5); rect(113, 5, 113, 14, 'wall')   # oben: Sims 101–112, rechts Wand runter
rect(102, 15, 125, 17)
# B5: Grube 126–137 mit Haken (132, 9), Durchbruch-Wand 138 direkt an der Grube (Reihen 11–14) unter fester Wand (4–10)
grube(126, 137); hooks.append({'x': 132*T + 20, 'y': 9*T + 20, 'radius': 200})
rect(138, 15, 150, 17); rect(138, 4, 138, 10, 'wall'); bruch += [{'x': 138*T, 'y': r*T, 'w': T, 'h': T} for r in range(11, 15)]
# B6: Grube 151–168, Haftdecke Reihe 11 über 150–160, Landung ab 169
grube(151, 166); rect(144, 5, 160, 10, 'wall'); haft.append({'x': 150*T, 'y': 11*T, 'w': 11*T, 'h': T}); rect(167, 15, 185, 17)
# B7: Grube 186–202 (nur Segeln + Dash), Landung ab 203
grube(186, 202); rect(203, 15, 220, 17)
lvl = {'hinweis': 'Testlevel Nacht-Ausbau: Bausteine B1–B7 (tests/bausteine/testlevel_bauen.py). Öffnen: index.html?testlevel=bausteine-nacht',
       'welt': 'dschungel', 'tageszeit': 'mittag', 'wetter': 'trocken', 'solids': solids, 'bruchWaende': bruch,
       'haftflaechen': haft, 'hooks': hooks, 'spikes': spikes, 'coins': [], 'movingPlatforms': [], 'checkpoints': [],
       'switches': [], 'doors': [], 'startM': {'x': 4*T + 20, 'y': 15*T}, 'startF': {'x': 2*T + 20, 'y': 15*T},
       'goal': {'x': 218*T + 20, 'y': 15*T}}
(ROOT / 'levels' / 'test' / 'bausteine-nacht.json').write_text(json.dumps(lvl, ensure_ascii=False, indent=1), encoding='utf-8')
print('ok')
