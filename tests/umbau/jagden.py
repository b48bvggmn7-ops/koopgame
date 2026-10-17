# Umbau aller Level: alle Verfolgungen auflisten – rollende Felsen (boulders), Stachelwände (Gruppe bewegter Teile mit
# Stacheln, fährt weit waagerecht) und steigende Lava (lavaPegel) – mit Tempo im Vergleich zum Laufen (MOVE_SPEED 4,4).
# Aufruf: python3 tests/umbau/jagden.py [--json]
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import bildregel_pruefen as B
LAUF = 4.4

def jagden(datei):
    d = B.lade(datei); out = []
    for b in d.get('boulders', []):
        out.append({'art': 'Fels', 'spalte': B.spalte(b['x']), 'tempo': b.get('tempo', 4.4), 'link': b.get('link'), 'richtung': b.get('richtung', 'r')})
    sp = {(B.spalte(s['x']), B.reihe(s['y'] - 1)) for s in d.get('spikes', [])}
    grp = {}
    for m in d.get('movingPlatforms', []):
        if m.get('group') is None or 'targetX' not in m: continue
        grp.setdefault((m['group'], m.get('switchLink')), []).append(m)
    for (g, link), ms in grp.items():
        weg = abs(ms[0]['targetX'] - ms[0]['x']) / 40
        zellen = {z for m in ms for z in B.felder_zellen(m)}
        stacheln = sum(1 for (c, r) in sp if any(abs(c - zc) + abs(r - zr) == 1 for zc, zr in zellen))
        if len(ms) >= 3 and weg >= 15 and stacheln:
            out.append({'art': 'Stachelwand', 'spalte': min(c for c, r in zellen), 'bis': B.spalte(ms[0]['targetX']), 'tempo': ms[0].get('speed', 2.5),
                        'link': link, 'gruppe': g, 'teile': len(ms)})
    for l in d.get('lavaPegel', []):
        out.append({'art': 'Lava', 'spalte': B.spalte(l['x']), 'tempo': l.get('tempo'), 'start': l.get('start')})
    return out

if __name__ == '__main__':
    alle = {f: jagden(f) for f in B.welten_level() if 'boss' not in f}
    if '--json' in sys.argv: print(json.dumps(alle, ensure_ascii=False, indent=1))
    else:
        for f, js in alle.items():
            if not js: continue
            print(f)
            for j in js:
                t = j['tempo']; rel = f" ({t / LAUF:.0%} vom Laufen)" if isinstance(t, (int, float)) else ''
                print(f"   {j['art']:11s} Spalte {j['spalte']}{'–' + str(j['bis']) if 'bis' in j else ''} Tempo {t}{rel} {j.get('start') or ''}")
