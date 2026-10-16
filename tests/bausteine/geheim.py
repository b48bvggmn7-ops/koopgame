# Nacht-Ausbau Phase 3: testsichere Plätze für neue Elemente finden
#   versteck(d)  – Durchbruch-Boden über einer Mulde (S1): Boden 2 Kästchen breit, darunter fest (Mulde wird gegraben), darunter
#                  Grund; links/rechts fest; darüber 2 Reihen frei; keine Elemente in der Nähe. Alte Bots laufen darüber
#                  hinweg (nur Dash nach unten bricht ihn).
#   haftdecke(d) – Decke über einer Grube (S2): unter einer festen Decke 2–3 Reihen frei über dem Rand, darunter Grube ->
#                  die Unterseite wird Haftfläche (neuer Weg über die Grube, sonst wie vorher)
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import bildregel_pruefen as B
import kombi_pruefen as K

def elemente_spalten(d):
    s = set()
    for f in ('hooks', 'switches', 'doors', 'plates', 'bouncers', 'checkpoints', 'teleporters', 'traps', 'pressen', 'boulders',
              'lichtquellen', 'spiegel', 'kristalle', 'leuchtkristalle', 'spikes', 'coins'):
        for o in d.get(f, []): s.add(B.spalte(o['x']))
    for f in ('winds', 'movingPlatforms', 'switchFloors', 'lava', 'baender', 'eis', 'oneways', 'dunkelzonen', 'bruchWaende', 'haftflaechen', 'lavaPegel'):
        for o in d.get(f, []):
            for c, rr in B.felder_zellen(o) if 'w' in o else [(B.spalte(o['x']), 0)]: s.add(c)
    return s

def hilfe_spalten(d):
    h = [B.spalte(o['x']) for o in d.get('hooks', [])] + [B.spalte(o['x']) for o in d.get('bouncers', [])]
    h += [(k['c'] + k['c2']) // 2 for k in K.kamine(d)] + [B.spalte(o['x']) for o in d.get('winds', [])]
    return h

def nur_boden(d):
    """nur Boden/Wand-Kästchen (keine Türen, Bröckel, Elemente) – eine Mulde nur in festem Boden"""
    z = set()
    for s in d.get('solids', []):
        if s.get('type') in ('ground', 'wall'): z.update(B.felder_zellen(s))
    return z

def versteck(d):
    fest = B.feste_kaestchen(d, stege=True); boden = nur_boden(d)
    el = elemente_spalten(d); hi = hilfe_spalten(d)
    out = []
    for (c, r) in sorted(boden):
        if not (2 <= r <= 15): continue
        zell = [(c, r), (c + 1, r), (c, r + 1), (c + 1, r + 1), (c, r + 2), (c + 1, r + 2), (c - 1, r), (c - 1, r + 1), (c + 2, r), (c + 2, r + 1)]
        if not all(z in boden for z in zell): continue
        if any((cc, rr) in fest for cc in (c, c + 1) for rr in (r - 1, r - 2)): continue
        if any(cc in el for cc in range(c - 2, c + 4)): continue
        if any(abs(h - c) <= 9 for h in hi): continue
        out.append((c, r))
    return out

def haftdecke(d):
    fest = B.feste_kaestchen(d, stege=False)
    import level_vermessen as LV
    out = []
    for g in LV.vermessen_daten(d, 'x/x.json')['gruben']:
        r = g['reihe']
        for frei in (2, 3):
            rc = r - 1 - frei   # Decken-Reihe
            cs = [c for c in range(g['von'] - 1, g['nach'] + 2) if (c, rc) in fest and all((c, rr) not in fest for rr in range(rc + 1, r))]
            if len(cs) >= 6: out.append({'grube': (g['von'], g['nach']), 'reihe': r, 'decke': rc, 'spalten': cs}); break
    return out

if __name__ == '__main__':
    for f in B.welten_level():
        if 'boss' in f: continue
        d = B.lade(f)
        v = versteck(d)
        print(f, 'Verstecke:', len(v), v[:6], '| Haftdecken:', [(h['grube'], h['decke'], len(h['spalten'])) for h in haftdecke(d)][:4])
