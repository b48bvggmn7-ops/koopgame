# S3-Haft-Inseln und S4-Durchbruch-Nischen setzen (optional, je eine Münze: Insel = Meister oben drauf, Nische = Geschick
# in der Nische). Die nächste freie Münze (bis 40 Spalten, keine Meister-Münze, nicht schon in einem Versteck) wandert hin.
# Aufruf: python3 tests/bausteine/extras_setzen.py [--zeigen] insel:hoehle/02-tropfsteingang.json:2 nische:hoehle/04-leuchtgrotte.json:3
#         (nische-links: Nische in einer Wandfläche, die nach rechts zeigt)
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import level_bau as L

def belegt(lv):
    """Münzen, die schon an einem Baustein liegen (Verstecke, Nischen, Meister)"""
    b = {(p['c'], p['r'] + 1) for p in lv.ed.get('bruchWaende', [])}
    b |= {(p['c'] + d, p['r']) for p in lv.ed.get('bruchWaende', []) for d in (-1, 1)}
    return b

def setzen(datei, art, anzahl, nur_zeigen=False):
    lv = L.Level(datei)
    ziel_c = lv.ed['goal']['c']
    if art == 'insel': plaetze = L.haftinsel_plaetze(lv)
    else: plaetze = L.bruchnische_plaetze(lv, richtung=-1 if art == 'nische-links' else 1)
    plaetze = [p for p in plaetze if 12 <= p[0] <= ziel_c - 15]
    # gleichmäßig verteilt: aus der Liste Plätze mit möglichst großem Abstand wählen
    if len(plaetze) > anzahl:
        schritt = len(plaetze) / anzahl
        plaetze = [plaetze[int(schritt * (i + 0.5))] for i in range(anzahl)]
    gewaehlt, frei = [], belegt(lv)
    for (c, g) in plaetze:
        mu = [m for m in lv.ed['coins'] if abs(m['c'] - c) <= 40 and m.get('klasse') != 'meister' and (m['c'], m['r']) not in frei]
        if not mu: continue
        m = min(mu, key=lambda m: abs(m['c'] - c) + abs(m['r'] - g))
        frei.add((m['c'], m['r']))
        gewaehlt.append((c, g, (m['c'], m['r']), m['color']))
    if not nur_zeigen:
        for c, g, mu, col in gewaehlt:
            if art == 'insel': L.s3_haftinsel(lv, c, g, muenze=mu)
            else: L.s4_bruchnische(lv, c, g, muenze=mu, richtung=-1 if art == 'nische-links' else 1)
        L.speichern([lv])
    return gewaehlt

if __name__ == '__main__':
    for a in [a for a in sys.argv[1:] if not a.startswith('--')]:
        art, f, n = a.split(':')
        print(art, f, setzen(f, art, int(n), nur_zeigen='--zeigen' in sys.argv))
