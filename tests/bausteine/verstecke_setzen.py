# S1-Verstecke in die vom Nutzer gestalteten Level setzen (nur zusätzlich, nichts am Rätsel geändert):
# je Level 3 Verstecke bei ungefähr 1/4, 1/2, 3/4 der Länge; die nächste Münze (bis 25 Spalten) wandert in die Mulde.
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import level_bau as L

def setzen(datei, ziele=(0.25, 0.5, 0.75), nur_zeigen=False):
    lv = L.Level(datei)
    plaetze = L.versteck_plaetze(lv)
    breite = max(c for c, r in lv.t) + 1
    gewaehlt = []
    for z in ziele:
        ziel = int(breite * z)
        kand = sorted(plaetze, key=lambda p: abs(p[0] - ziel))
        for (c, r) in kand:
            muenzen = [m for m in lv.ed['coins'] if abs(m['c'] - c) <= 25 and m.get('klasse') != 'meister']
            if not muenzen or any(abs(c - g[0]) < 30 for g in gewaehlt): continue
            m = min(muenzen, key=lambda m: abs(m['c'] - c) + abs(m['r'] - r))
            gewaehlt.append((c, r, (m['c'], m['r']), m['color']))
            break
    if not nur_zeigen:
        for c, r, mu, col in gewaehlt: L.s1_versteck(lv, c, r, mu)
        L.speichern([lv])
    return gewaehlt

if __name__ == '__main__':
    for f in [a for a in sys.argv[1:] if not a.startswith("--")]:
        print(f, setzen(f, nur_zeigen='--zeigen' in sys.argv))
