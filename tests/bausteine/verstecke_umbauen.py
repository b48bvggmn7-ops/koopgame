# Dash nur noch waagerecht (Nutzerwunsch): die S1-Verstecke unter Durchbruch-Böden (nur per Dash nach unten erreichbar)
# werden zu S4-Durchbruch-Nischen mit seitlichem Eingang (Nutzer: „seitlicher Eingang“). Je Versteck: Boden wieder fest,
# Mulde zu, die Münze wandert in eine Nische in einer Wand in der Nähe (bis 40 Spalten, beide Richtungen); gibt es keine,
# liegt die Münze sichtbar über dem alten Versteck. Ergebnis: tests/bausteine/nischen_aus_verstecken.json (für stellen.py).
# Aufruf: python3 tests/bausteine/verstecke_umbauen.py [--zeigen]
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))
import level_bau as L
RADIUS = 80   # so weit (Spalten) darf die neue Nische vom alten Versteck weg sein

def umbauen(datei, verstecke, nur_zeigen=False):
    lv = L.Level(datei)
    neu, belegt = [], []
    # nur Verstecke, die es (noch) gibt – der Nutzer hat manche Level ersetzt
    verstecke = [v for v in verstecke if any(p['c'] == v[0] and p['r'] == v[1] for p in lv.ed.get('bruchWaende', []))
                 and any(m['c'] == v[0] and m['r'] == v[1] + 1 for m in lv.ed.get('coins', []))]
    # erst alle Verstecke dieses Levels schließen (sonst zählen ihre Mulden als Wandflächen)
    for (c, r, farbe) in verstecke:
        for cc in (c, c + 1):
            lv.punkt_weg('bruchWaende', cc, r); lv.kachel(cc, r, 'ground'); lv.kachel(cc, r + 1, 'ground')
    plaetze = [(w, g, 1) for (w, g) in L.bruchnische_plaetze(lv, abstand=1, richtung=1)] + \
              [(w, g, -1) for (w, g) in L.bruchnische_plaetze(lv, abstand=1, richtung=-1)]
    for (c, r, farbe) in verstecke:
        kand = [p for p in plaetze if abs(p[0] - c) <= RADIUS and all(abs(p[0] - b) >= 8 for b in belegt)]
        if kand:
            w, g, R = min(kand, key=lambda p: (abs(p[0] - c), abs(p[1] - r)))
            belegt.append(w)
            lv.muenze_verschieben(c, r + 1, c, r - 1)   # erst aus dem Stein holen, dann in die Nische
            L.s4_bruchnische(lv, w, g, muenze=(c, r - 1), richtung=R)
            neu.append([datei, w, g, farbe, R])
        else:
            lv.muenze_verschieben(c, r + 1, c, r - 1)   # sichtbar über dem alten Versteck
            for m in lv.ed['coins']:
                if m['c'] == c and m['r'] == r - 1: m.pop('klasse', None)
            neu.append([datei, None, None, farbe, None, c, r - 1])
    if not nur_zeigen: L.speichern([lv])
    return neu

if __name__ == '__main__':
    import stellen as S
    alle = []
    for datei, liste in S._VERSTECKE.items():
        e = umbauen(datei, liste, nur_zeigen='--zeigen' in sys.argv)
        print(datei, e); alle += e
    if '--zeigen' not in sys.argv:
        (Path(__file__).resolve().parent / 'nischen_aus_verstecken.json').write_text(json.dumps(alle, ensure_ascii=False, indent=0) + '\n', encoding='utf-8')
