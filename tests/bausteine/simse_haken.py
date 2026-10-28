# Dash nur noch waagerecht (Nutzerwunsch): die Simse, auf die der Affe bisher per Sprung + Dash nach OBEN kam (früher die
# Schleuder), bekommen einen Haken davor: Haken zwei Spalten links vom Sims, 2 Reihen über seiner Oberkante, Reichweite 5.
# Der Affe springt hoch, greift, zieht mit W hoch und schwingt nach rechts aufs Sims (Bot-Plan k_haken_hoch in run_tests.py).
# Aufruf: python3 tests/bausteine/simse_haken.py [--zeigen]  -> schreibt die Level und tests/bausteine/simse_haken.json
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import level_bau as L

STELLEN = [('dschungel/03-lianenschlucht.json', 50), ('dschungel/03-lianenschlucht.json', 249), ('dschungel/04-gluehwald.json', 51),
           ('dschungel/04-gluehwald.json', 305), ('dschungel/04-gluehwald.json', 365), ('ruinen/03-fallengang.json', 49),
           ('ruinen/03-fallengang.json', 298), ('ruinen/03-fallengang.json', 372), ('dschungel/05-dornenpfad.json', 117),
           ('ruinen/06-tempelherz.json', 105)]
FEST = ('ground', 'wall', 'haft', 'crumble')

def sims(lv, c):
    """erstes Sims rechts von Spalte c: (erste Spalte s, Oberkante t) – fest, mindestens 3 Reihen über dem Boden bei c"""
    boden = min(r for r in range(-3, 18) if lv.typ(c, r) in FEST)
    for s in range(c, c + 10):
        oben = [r for r in range(boden - 9, boden - 2) if lv.typ(s, r) in FEST]
        if oben: return s, min(oben), boden
    raise ValueError(f'kein Sims bei {c}')

if __name__ == '__main__':
    erg, levels = [], {}
    for datei, c in STELLEN:
        lv = levels.setdefault(datei, L.Level(datei))
        s, t, boden = sims(lv, c)
        lv.haken(s - 2, t - 2, radius=5.0)
        erg.append({'level': datei, 'c': c, 'sims': s, 'oben': t, 'boden': boden, 'haken': [s - 2, t - 2]})
        print(datei, c, '-> Sims', s, 'Oberkante', t, 'Boden', boden, 'Haken', (s - 2, t - 2))
    if '--zeigen' not in sys.argv:
        L.speichern(list(levels.values()))
        (Path(__file__).resolve().parent / 'simse_haken.json').write_text(json.dumps(erg, indent=0) + '\n', encoding='utf-8')
