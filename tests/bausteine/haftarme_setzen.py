# S2-Haft-Arme setzen (optional, Meister-Münze am Arm-Ende): je Level bis zu `anzahl` Stück, nicht am Level-Ende,
# die nächste Münze (bis 40 Spalten, keine Meister-Münze) wandert ans Arm-Ende.
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import level_bau as L

def setzen(datei, anzahl=2, nur_zeigen=False, richtung=1):
    lv = L.Level(datei)
    ziel_c = lv.ed['goal']['c']
    gewaehlt = []
    for (c, r) in L.haftarm_plaetze(lv, richtung=richtung):
        if c > ziel_c - 15 or len(gewaehlt) >= anzahl: continue
        mulden = {(b['c'], b['r'] + 1) for b in lv.ed.get('bruchWaende', [])}   # Münzen in Verstecken bleiben
        mu = [m for m in lv.ed['coins'] if abs(m['c'] - c) <= 40 and m.get('klasse') != 'meister' and (m['c'], m['r']) not in mulden
              and not any(abs(m['c'] - g[0]) <= 1 and m['r'] == g[1] + 1 for g in gewaehlt)]
        if not mu: continue
        m = min(mu, key=lambda m: abs(m['c'] - c) + abs(m['r'] - r))
        gewaehlt.append((c, r, (m['c'], m['r']), m['color']))
    if not nur_zeigen:
        for c, r, mu, col in gewaehlt: L.s2_haftarm(lv, c, r, muenze=mu, richtung=richtung)
        L.speichern([lv])
    return gewaehlt

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    links = '--links' in sys.argv
    for f in args:
        if ':' in f: f, n = f.split(':'); n = int(n)
        else: n = 1 if f.endswith('04-gluehwald.json') else 2
        print(f, setzen(f, n, nur_zeigen='--zeigen' in sys.argv, richtung=-1 if links else 1))
