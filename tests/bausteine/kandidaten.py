# Nacht-Ausbau Phase 3: Kandidaten für neue Stellen in einem Level vorschlagen (Hilfe beim Leveldesign, keine Änderung).
#   gang   – Stellen, an denen ein Gang (Boden + Decke, 1–3 Reihen frei) mindestens 3 Spalten lang ist: dort passt ein
#            Durchbruch-Tor (Baustein B2 ohne Grube), das den Gang ganz verschließt
#   grube  – Gruben 6–16 breit mit freiem Raum darüber: dort passt eine Haftfläche (Baustein B3/B6) 3 Reihen über dem Rand
#   nah    – Abstand (Spalten) zur nächsten Hilfe (Haken, Kamin, Pilz, Aufwind) -> zählt als Kombi, wenn ≤ KOMBI_ABSTAND
#   frei   – liegt NICHT auf einem Weg, den die alten Bot-Tests laufen (dann bricht kein alter Test)
# Aufruf: python3 tests/bausteine/kandidaten.py dschungel/02-baumkronen.json [abdeckung.json]
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import bildregel_pruefen as B
import kombi_pruefen as K

def kandidaten(datei, abdeckung=None):
    d = B.lade(datei)
    fest = B.feste_kaestchen(d, stege=True)
    for o in d.get('doors', []):
        fest.update(B.felder_zellen({'x': o['x'] - 20, 'y': o['y'] - 20}))
    hilfe = [(B.spalte(h['x']), 'Haken') for h in d.get('hooks', [])]
    hilfe += [((k['c'] + k['c2']) // 2, 'Kamin') for k in K.kamine(d)]
    hilfe += [(B.spalte(o['x']), 'Pilz') for o in d.get('bouncers', [])]
    hilfe += [(B.spalte(o['x']), 'Aufwind') for o in d.get('winds', [])]
    def nah(c):
        if not hilfe: return (99, '')
        return min(((abs(hc - c), art) for hc, art in hilfe), key=lambda x: x[0])
    bedeckt = set()
    if abdeckung and datei in abdeckung:
        for a, b in abdeckung[datei]['m'] + abdeckung[datei]['f']: bedeckt.update(range(a, b + 1))
    breite = max(c for c, r in fest) + 1
    gang = []
    for c in range(breite):
        for r in range(-2, 18):
            if (c, r) not in fest or (c, r - 1) in fest: continue      # Bodenoberkante in Reihe r
            h = 0
            while h < 4 and (c, r - 1 - h) not in fest: h += 1
            if not (1 <= h <= 3) or (c, r - 1 - h) not in fest: continue
            # Gang: links und rechts gleiche Höhe frei (mindestens 3 Spalten)
            if all((c + dc, r) in fest and all((c + dc, r - 1 - i) not in fest for i in range(h)) and (c + dc, r - 1 - h) in fest for dc in (-1, 1)):
                gang.append({'spalte': c, 'reihe': r, 'hoehe': h, 'nah': nah(c), 'frei': c not in bedeckt})
    gruben = []
    import level_vermessen as LV
    for g in LV.vermessen(datei)['gruben']:
        if 6 <= g['breite'] <= 16 and abs(g['dy']) <= 1:
            r = g['reihe']
            frei_oben = all((c, rr) not in fest for c in range(g['von'], g['nach'] + 1) for rr in range(r - 8, r))
            if frei_oben:
                gruben.append({'von': g['von'], 'nach': g['nach'], 'reihe': r, 'breite': g['breite'], 'nah': nah((g['von'] + g['nach']) // 2),
                               'frei': not any(c in bedeckt for c in range(g['von'], g['nach'] + 1))})
    # Verstecke: zwei Bodenkästchen nebeneinander (Reihe r), darunter fest (Reihe r+1) und Boden (r+2) -> Durchbruch-Boden,
    # darunter eine Mulde mit Münzen (Dash nach unten öffnet sie)
    verstecke = []
    for c in range(1, breite - 2):
        for r in range(0, 16):
            if all((cc, r) in fest and (cc, r - 1) not in fest and (cc, r - 2) not in fest and (cc, r + 1) in fest and (cc, r + 2) in fest for cc in (c, c + 1)) \
               and (c - 1, r) in fest and (c + 2, r) in fest and (c - 1, r + 1) in fest and (c + 2, r + 1) in fest:
                verstecke.append({'spalte': c, 'reihe': r, 'nah': nah(c), 'frei': c not in bedeckt and c + 1 not in bedeckt})
    return gang, gruben, verstecke

if __name__ == '__main__':
    ab = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else None
    gang, gruben, verstecke = kandidaten(sys.argv[1], ab)
    zus = {}
    for e in gang:   # zusammenhängende Gang-Stücke
        k = (e['reihe'], e['hoehe'])
        if k in zus and zus[k][-1][-1]['spalte'] == e['spalte'] - 1: zus[k][-1].append(e)
        else: zus.setdefault(k, []).append([e])
    print('Gänge (Reihe, Höhe: Spalten, nächste Hilfe, frei von alten Bot-Wegen):')
    for (r, h), stuecke in sorted(zus.items()):
        for s in stuecke:
            if len(s) >= 3:
                m = s[len(s) // 2]
                print(f"  Reihe {r} Höhe {h}: {s[0]['spalte']}–{s[-1]['spalte']}  Hilfe {m['nah'][1]} {m['nah'][0]}  {'frei' if all(x['frei'] for x in s) else 'Bot-Weg'}")
    print('Gruben für Haftflächen:')
    for g in gruben:
        print(f"  {g['von']}–{g['nach']} Reihe {g['reihe']} Breite {g['breite']}  Hilfe {g['nah'][1]} {g['nah'][0]}  {'frei' if g['frei'] else 'Bot-Weg'}")
    print('Verstecke unter Durchbruch-Boden (erste Spalte, Reihe), nur frei:')
    vs = [v for v in verstecke if v['frei']]
    print('  ' + ', '.join(f"{v['spalte']}/{v['reihe']}" for v in vs[::3][:40]))
