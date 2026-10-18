# Umbau aller Level: Grube um n Spalten verbreitern, OHNE dass sich der Rest des Levels verschiebt.
# Alles von Spalte p (erste Spalte hinter der Grube, z. B. Landeplatz) bis vor q rückt n Spalten nach rechts; dafür
# entfallen die n Spalten q..q+n-1 (müssen schlichter, gleichförmiger Boden ohne Elemente sein – „Ausgleichsstrecke“).
# Die frei gewordenen Spalten p..p+n-1 werden Grube wie Spalte p-1 (Stacheln/Lava unten). Ab q+n bleibt alles, wo es war.
# Haken über der Grube: kommt einer in die Mitte der neuen Grube dazu (Höhe/Radius wie der vorhandene).
# Aufruf: python3 tests/umbau/grube_weiten.py <level> <p> <q> [--n 8] [--grube-von g0]
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import level_bau as L

def _listen(lv):
    return [(k, v) for k, v in lv.ed.items() if isinstance(v, list) and v and isinstance(v[0], dict) and 'c' in v[0]]

def _profil(lv, c): return tuple(lv.typ(c, r) for r in range(-3, 18))

def weiten(lv, p, q, n=8, grube_von=None, haken=True):
    prof = _profil(lv, q)
    for c in range(q, q + n):
        if _profil(lv, c) != prof: raise ValueError(f'{lv.datei}: Ausgleichsstrecke {q}..{q + n - 1} nicht gleichförmig (Spalte {c})')
        for k, v in _listen(lv):
            if k != 'coins' and any(o['c'] == c for o in v): raise ValueError(f'{lv.datei}: {k} in der Ausgleichsstrecke (Spalte {c})')
    # Münzen in der Ausgleichsstrecke: rücken mit nach rechts (bleiben über demselben Boden)
    # Kacheln: [p, q) -> +n, [q, q+n) entfallen
    neu = {}
    for (c, r), t in lv.t.items():
        if c < p or c >= q + n: neu[(c, r)] = t
        elif c < q: neu[(c + n, r)] = t
    lv.t = neu
    for k, v in _listen(lv):
        for o in v:
            if p <= o['c'] < q: o['c'] += n
            elif q <= o['c'] < q + n and k == 'coins': o['c'] = min(o['c'] + n, q + n + n - 1)
            # Elemente mit Ziel-/Bereichsangaben in Spalten (bewegte Teile: dc ist relativ, bleibt)
    for k in ('startM', 'startF', 'goal'):
        o = lv.ed.get(k)
        if isinstance(o, dict) and p <= o.get('c', -1) < q: o['c'] += n
    # neue Grubenspalten p..p+n-1 wie Spalte p-1
    for c in range(p, p + n):
        for r in range(-3, 18):
            t = lv.typ(p - 1, r)
            if t: lv.kachel(c, r, t)
        for k, v in _listen(lv):
            if k in ('spikes', 'lava', 'dunkelzonen'):
                for o in [o for o in v if o['c'] == p - 1]: v.append(dict(o, c=c))
    info = {'grube': (grube_von, p + n - 1) if grube_von else (None, p + n - 1), 'verschoben': (p, q - 1), 'n': n}
    if haken and grube_von is not None:
        hs = [h for h in lv.ed.get('hooks', []) if grube_von <= h['c'] < p]
        if hs:
            mitte = (grube_von + p + n - 1) // 2 + 1   # +1: genug Stehplätze hinter dem letzten Haken (Bild-Regel)
            if all(abs(h['c'] - mitte) > 2 for h in hs):
                lv.haken(mitte, hs[0]['r'], hs[0].get('radius', 5.0)); info['haken_neu'] = mitte
    return info

def weiten_links(lv, rw, q, n=8, grube_bis=None, haken=True):
    """Spiegelbild: die n schlichten Spalten q..q+n-1 (LINKS vom Kamin) entfallen, alles von q+n bis rw (Kamin samt
    Anlauf) rückt n nach links; die frei gewordenen Spalten rw-n+1..rw werden Grube wie Spalte rw+1."""
    prof = _profil(lv, q)
    for c in range(q, q + n):
        if _profil(lv, c) != prof: raise ValueError(f'{lv.datei}: Ausgleichsstrecke {q}..{q + n - 1} nicht gleichförmig (Spalte {c})')
        for k, v in _listen(lv):
            if k != 'coins' and any(o['c'] == c for o in v): raise ValueError(f'{lv.datei}: {k} in der Ausgleichsstrecke (Spalte {c})')
    neu = {}
    for (c, r), t in lv.t.items():
        if c < q or c > rw: neu[(c, r)] = t
        elif c >= q + n: neu[(c - n, r)] = t
    lv.t = neu
    for k, v in _listen(lv):
        for o in v:
            if q + n <= o['c'] <= rw: o['c'] -= n
            elif q <= o['c'] < q + n and k == 'coins': o['c'] = max(o['c'] - n, q - n)
    for k in ('startM', 'startF', 'goal'):
        o = lv.ed.get(k)
        if isinstance(o, dict) and q + n <= o.get('c', -1) <= rw: o['c'] -= n
    for c in range(rw - n + 1, rw + 1):
        for r in range(-3, 18):
            t = lv.typ(rw + 1, r)
            if t: lv.kachel(c, r, t)
        for k, v in _listen(lv):
            if k in ('spikes', 'lava', 'dunkelzonen'):
                for o in [o for o in v if o['c'] == rw + 1]: v.append(dict(o, c=c))
    info = {'grube': (rw - n + 1, grube_bis), 'verschoben_links': (q + n, rw), 'n': n}
    if haken and grube_bis is not None:
        hs = [h for h in lv.ed.get('hooks', []) if rw < h['c'] <= grube_bis]
        if hs:
            mitte = (rw - n + 1 + grube_bis) // 2
            if all(abs(h['c'] - mitte) > 2 for h in hs):
                lv.haken(mitte, hs[0]['r'], hs[0].get('radius', 5.0)); info['haken_neu'] = mitte
    return info

if __name__ == '__main__':
    a = sys.argv[1:]
    n = int(a[a.index('--n') + 1]) if '--n' in a else 8
    g0 = int(a[a.index('--grube-von') + 1]) if '--grube-von' in a else None
    lv = L.Level(a[0]); print(weiten(lv, int(a[1]), int(a[2]), n, g0))
    lv.merke(f'Grube vor {a[1]} um {n} breiter (Ausgleich bei {a[2]})')
    L.speichern([lv])
