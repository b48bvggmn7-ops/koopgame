# Checkpoints prüfen: die Fahne (Mast 2 Kästchen hoch in Spalte c, Fahne ragt in Spalte c+1) darf nicht in Boden, Wand,
# Tür, Durchbruch, Haftfläche oder Bröckelboden stecken, und unter dem Mast muss fester Boden sein.
# Mit --reparieren: Checkpoint auf die nächste gute Stelle setzen – schwebt er, auf den Boden darunter; sonst 1–3 Spalten
# nach rechts auf gleicher Höhe,
# dann 1–3 nach links, sonst oben auf den Block (gleiche Spalte bzw. daneben).
# Aufruf: python3 tests/umbau/checkpoints_frei.py [--reparieren]   (alle Level aus worlds.json, ohne Wasser-Welt und Bosse)
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tests'))

def belegt_zellen(ed):
    z = {(c, r) for c, r, t in ed['tiles'] if t not in ('wind',)}
    for f in ('doors', 'bruchWaende'):
        for p in ed.get(f, []): z.add((p['c'], p['r']))
    return z

def gut(z, c, r):
    frei = all(k not in z for k in ((c, r), (c, r - 1), (c + 1, r), (c + 1, r - 1)))
    return frei and (c, r + 1) in z

def stelle(z, c, r):
    for dr in (1, 2):   # schwebt der Checkpoint über dem Boden: auf den Boden darunter setzen
        if all((c, r + k) not in z for k in range(1, dr + 1)) and gut(z, c, r + dr): return (c, r + dr)
    for dc in (1, 2, 3, -1, -2, -3):
        if gut(z, c + dc, r): return (c + dc, r)
    for dc in (0, 1, -1, 2, -2):   # oben drauf: in der Spalte nach oben bis zur ersten freien Stelle über festem Boden
        for rr in range(r - 1, r - 16, -1):
            if gut(z, c + dc, rr): return (c + dc, rr)
    return None

def level_liste():
    w = json.loads((ROOT / 'levels' / 'worlds.json').read_text(encoding='utf-8'))
    import abschnitt as A   # Dschungel-Neu: Abschnitte -> ihre Teile
    return [l for welt in w['welten'] if welt['id'] != 'wasser' for l in A.level_dateien(welt)]

if __name__ == '__main__':
    import level_bau as L
    schlecht = []
    for datei in level_liste():
        lv = L.Level(datei); z = belegt_zellen(lv.ed); neu = False
        for cp in lv.ed.get('checkpoints', []):
            if gut(z, cp['c'], cp['r']): continue
            ziel = stelle(z, cp['c'], cp['r'])
            schlecht.append((datei, (cp['c'], cp['r']), ziel))
            if '--reparieren' in sys.argv and ziel: cp['c'], cp['r'] = ziel; neu = True
        if neu: L.speichern(lv)
    for s in schlecht: print(s[0], 'Checkpoint', s[1], '->', s[2])
    print(len(schlecht), 'Checkpoints stecken in Material oder stehen nicht auf Boden')
