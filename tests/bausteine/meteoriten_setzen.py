# tests/bausteine/meteoriten_setzen.py – Dschungel-Neu: die Spur des Meteoriten in die sechs Dschungel-Teile legen.
# Je weiter man kommt, desto mehr und größere Splitter (Teil 1 nur am Ende ein paar, Teil 6 viele mit Brocken);
# am Ende von Abschnitt 2 (Rätsel-Teil 08) liegt der Meteorit selbst (elemente/meteorit.js, nur Aussehen).
# Gesetzt wird auf freien Boden (darunter fest, darüber zwei Kästchen frei, kein anderes Element auf dem Platz).
# Aufruf: python3 tests/bausteine/meteoriten_setzen.py   (setzt nur, wo ein Teil noch keine Meteoriten hat)
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / 'tests'))
import level_bau as L

FEST = ('ground', 'wall')
# Teil -> (von Spalte, bis Spalte, Splitter, Brocken)
SPUR = {
    'dschungel/01-dschungel.json': (620, 790, 3, 0),
    'dschungel/02-baumkronen.json': (40, 790, 5, 0),
    'dschungel/03-lianenschlucht.json': (30, 790, 6, 1),
    'dschungel/04-gluehwald.json': (20, 790, 7, 1),
    'dschungel/05-dornenpfad.json': (20, 790, 8, 2),
    'dschungel/06-wipfelsturm.json': (20, 780, 10, 3),
    'dschungel/07-windrad-lichtung.json': (8, 90, 3, 0),
}
# der große Meteorit liegt im Rätsel-Teil 08 „Meteoritenkrater“ vor dem Ziel (tests/bausteine/raetsel_teile.py)

def belegt(lv):
    """alle Kästchen, auf denen schon ein Punkt-Element liegt"""
    out = set()
    for feld, liste in lv.ed.items():
        if isinstance(liste, list):
            for p in liste:
                if isinstance(p, dict) and 'c' in p and 'r' in p: out.add((p['c'], p['r']))
    return out

def platz(lv, c, frei):
    """Boden-Platz in Spalte c: am liebsten der unterste begehbare (dort laufen beide), sonst keiner"""
    for r in range(16, -3, -1):
        if lv.typ(c, r + 1) in FEST and lv.typ(c, r) is None and lv.typ(c, r - 1) is None and (c, r) not in frei and (c, r - 1) not in frei:
            return r
    return None

def setzen(datei):
    lv = L.Level(datei)
    if lv.ed.get('meteoriten'): return False
    c0, c1, n_s, n_b = SPUR[datei]
    frei = belegt(lv)
    n = n_s + n_b
    arten = ['splitter'] * n_s
    for k in range(n_b): arten.insert(round((k + 1) * n / (n_b + 1)), 'brocken')   # Brocken über die Strecke verteilt
    for k, art in enumerate(arten):
        ziel = c0 + round((k + 0.5) * (c1 - c0) / n)
        for d in (0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6):
            c = ziel + d
            r = platz(lv, c, frei)
            if r is None: continue
            if art == 'brocken' and not (platz(lv, c + 1, frei) == r): continue   # Brocken: 2 Kästchen breit
            lv.punkt('meteoriten', c, r, **({'art': art} if art != 'splitter' else {}))
            frei.add((c, r)); break
    lv.merke(f'Dschungel-Neu: Meteoriten-Spur ({len(lv.ed["meteoriten"])})')
    return lv

if __name__ == '__main__':
    lvs = [lv for d in SPUR if (lv := setzen(d))]
    for lv in lvs: print(lv.datei, [(p['c'], p['r'], p.get('art', 'splitter')) for p in lv.ed['meteoriten']])
    if lvs: L.speichern(lvs)
