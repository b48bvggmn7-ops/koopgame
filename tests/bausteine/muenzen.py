# Nacht-Ausbau Phase 3: Münz-Klassen (Pfad / Geschick / Meister) – Anzahl, Reihenfolge und Identität der Münzen bleiben.
#   pfad     – Münze höchstens 2 Reihen über einer Stehfläche (man nimmt sie im Vorbeigehen / mit einem normalen Sprung)
#   geschick – alle anderen (in der Luft, über Gruben, an Haken-Bögen, auf Umwegen)
#   meister  – von Hand: an den schwersten Stellen (neue Bausteine, Grenz-Stellen); dafür wird eine nahe Geschick-/Pfad-
#              Münze an die Meister-Stelle VERSCHOBEN (gleiche Stelle in der Liste = gleiche Münze)
# Aufruf: python3 tests/bausteine/muenzen.py --einstufen   (alle Level: pfad/geschick neu einstufen, meister bleibt)
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import bildregel_pruefen as B

def einstufen(lv):
    """lv: level_bau.Level – setzt klasse für alle Münzen ohne 'meister'"""
    fest = set((c, r) for (c, r), t in lv.t.items() if t not in ('wind', 'haft'))   # Aufwind ist kein Boden
    fest |= set((p['c'], p['r']) for p in lv.ed.get('bruchWaende', []))
    n = {'pfad': 0, 'geschick': 0, 'meister': 0}
    for m in lv.ed.get('coins', []):
        if m.get('klasse') == 'meister': n['meister'] += 1; continue
        c, r = m['c'], m['r']
        boden = any((c, r + k) in fest and (c, r + k - 1) not in fest for k in (1, 2, 3))
        if boden: m.pop('klasse', None); n['pfad'] += 1
        else: m['klasse'] = 'geschick'; n['geschick'] += 1
    return n

def meister(lv, c, r, suche=30):
    """nächste Nicht-Meister-Münze (bevorzugt Geschick) innerhalb `suche` Spalten an (c, r) verschieben und Meister machen"""
    kand = [m for m in lv.ed.get('coins', []) if m.get('klasse') != 'meister' and abs(m['c'] - c) <= suche]
    if not kand: raise ValueError(f'{lv.datei}: keine Münze nahe Spalte {c}')
    kand.sort(key=lambda m: (m.get('klasse') != 'geschick', abs(m['c'] - c) + abs(m['r'] - r)))
    m = kand[0]
    m['c'], m['r'] = c, r; m['klasse'] = 'meister'
    return m

if __name__ == '__main__':
    import level_bau as L
    if '--einstufen' in sys.argv:
        lvs = []
        for f in B.welten_level():
            if 'boss' in f: continue
            lv = L.Level(f); print(f, einstufen(lv)); lvs.append(lv)
        L.speichern(lvs)
