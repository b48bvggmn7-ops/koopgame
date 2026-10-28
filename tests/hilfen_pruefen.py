# tests/hilfen_pruefen.py – „Jede Hilfe wird auch gebraucht“ (Nutzerwunsch, Dschungel ganzheitlich): für jeden Haken,
# Pilz und Aufwind eines Levels die Stelle suchen, an der er hilft (Stehfläche A davor -> Stehfläche B dahinter), und mit
# der echten Spiel-Physik (Koop-Bot, viele Pläne: Laufen, Sprung, Schirm, seitlicher Dash, andere Pilze/Haken/Aufwinde)
# prüfen: schafft die Figur A -> B MIT der Hilfe, und schafft sie es auch OHNE (Hilfe aus dem Level genommen)?
#   nötig      = mit ja, ohne nein (gut)
#   überflüssig= ohne geht es auch (Stelle schwerer machen oder Hilfe entfernen)
#   unklar     = auch mit nicht geschafft (Werkzeug kennt den Weg nicht -> von Hand ansehen)
#   keine Stelle = keine passende Stehfläche davor/dahinter gefunden (Deko, Rätsel-Teil, Rückweg …)
# Aufruf: python3 tests/hilfen_pruefen.py <welt>/<datei> [--nur haken|pilz|wind] [--spalten von-bis] [--json]
# Näherung: A/B werden aus der Geometrie geraten (nächste Stehflächen); Türen/Hebel/Fahrten/Teleporter zählen nicht.
import asyncio, json, sys, itertools
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tests'))
import level_bau as L

STEH = {'ground', 'wall', 'crumble', 'oneway', 'haft', 'eis', 'band'}
RELS = ['P.x > P.anchor.x + 30 && P.vx > 1', 'P.x > P.anchor.x + P.ropeLen*0.6 && P.vy < 0',
        'P.x > P.anchor.x + P.ropeLen*0.8 && P.vy < 0', 'P.x > P.anchor.x + P.ropeLen*0.4 && P.vy < 0']

def stehflaechen(lv):
    """Abschnitte (von, bis, Reihe): feste Kachel, darüber frei, keine Stacheln darauf"""
    stacheln = {(s['c'], s['r']) for s in lv.ed.get('spikes', [])}
    steh = sorted((c, r) for (c, r), t in lv.t.items() if t in STEH and lv.typ(c, r - 1) not in STEH and (c, r - 1) not in stacheln and r > -3)
    runs, rows = [], {}
    for c, r in steh: rows.setdefault(r, []).append(c)
    for r, cs in rows.items():
        cs.sort(); a = cs[0]; p = a
        for c in cs[1:] + [None]:
            if c is None or c != p + 1: runs.append((a, p, r)); a = c
            p = c if c is not None else p
    return runs

def luecke(runs, a, b):
    """zwischen A und B keine Stehfläche, auf der man „unten herum“ laufen könnte (bis 4 Reihen tiefer)"""
    tief = max(a[2], b[2]) + 4
    return not any(r <= tief and r >= min(a[2], b[2]) - 2 and s <= b[0] - 1 and e >= a[1] + 1 for (s, e, r) in runs if (s, e, r) not in (a, b))

def stellen(lv, nur=None, spalten=None):
    runs = stehflaechen(lv)
    out = []
    def ziel_nach(a, c_min, c_max, hoch_max=12):
        kand = [b for b in runs if c_min <= b[0] <= c_max and b[0] > a[1] + 1 and b[2] <= a[2] + 3 and a[2] - b[2] <= hoch_max and luecke(runs, a, b)]
        return min(kand, key=lambda b: (b[0], b[2])) if kand else None
    if nur in (None, 'haken'):
        for h in lv.ed.get('hooks', []):
            if h.get('move'): continue
            hc, hr = h['c'], h['r']
            kand = [a for a in runs if hc - 10 <= a[1] <= hc + 1 and 2 <= a[2] - hr <= 12]
            a = min(kand, key=lambda a: (abs(a[1] - hc) + abs(a[2] - hr - 6))) if kand else None
            b = ziel_nach(a, hc + 1, hc + 16) if a else None
            out.append({'art': 'haken', 'c': hc, 'r': hr, 'wer': 'm', 'a': a, 'b': b})
    if nur in (None, 'pilz'):
        for p in lv.ed.get('bouncers', []):
            pc, pr = p['c'], p['r']
            a = next((x for x in runs if x[2] == pr + 1 and x[0] <= pc <= x[1]), None)
            b = None
            if a:
                b = ziel_nach(a, pc + 1, pc + 20)
                if not b:   # Pilz-Turm: Fläche deutlich höher, gleich daneben
                    hoch = [x for x in runs if x[2] <= a[2] - 3 and pc - 2 <= x[0] <= pc + 12 and x[0] > pc]
                    b = min(hoch, key=lambda x: (x[0], -x[2])) if hoch else None
            out.append({'art': 'pilz', 'c': pc, 'r': pr, 'wer': 'mf', 'a': a, 'b': b})
    if nur in (None, 'wind'):
        wind = sorted({c for (c, r), t in lv.t.items() if t == 'wind'})
        gruppen = []
        for c in wind:
            if gruppen and c == gruppen[-1][-1] + 1: gruppen[-1].append(c)
            else: gruppen.append([c])
        for g in gruppen:
            wc = g[0]; oben = min(r for (c, r), t in lv.t.items() if t == 'wind' and c in g)
            kand = [a for a in runs if wc - 10 <= a[1] <= wc - 1 and a[2] > oben]
            a = max(kand, key=lambda a: (a[1], -a[2])) if kand else None
            b = None
            if a:
                kb = [x for x in runs if g[-1] + 1 <= x[0] <= g[-1] + 15 and x[2] <= a[2] + 2 and x[0] > a[1] + 1]
                b = min(kb, key=lambda x: (x[2], x[0])) if kb else None
            out.append({'art': 'wind', 'c': wc, 'r': oben, 'wer': 'f', 'a': a, 'b': b, 'spalten': g})
    if spalten: out = [s for s in out if spalten[0] <= s['c'] <= spalten[1]]
    return out

def plaene(rt, wer, a, b, d_spiel):
    """viele Bot-Pläne von Stehfläche a nach b (Ende: holdIf auf b zu)"""
    kx = rt.kx
    c0 = b[0]
    lande = {'holdIf': {'right': f'P.x < {kx(c0 + 1)}', 'left': f'P.x > {kx(c0 + 2)}'}, 'until': 'P.grounded && !P.dash', 'frames': 500}
    gl = ['glide'] if wer == 'f' else []
    out = [[{'hold': ['right'] + gl, 'until': f'P.grounded && P.x >= {kx(c0)}', 'frames': 400}]]
    for an, h in itertools.product((-10, 0), (6, 14)):
        base = [rt.k_lauf(a[1], an), {'press': ['jump'], 'hold': ['right', 'jump'], 'frames': h}]
        out.append(base + [dict(lande, hold=gl)])
        for vy in (-2, 2):
            out.append(base + [{'hold': ['right'] + gl, 'until': f'P.vy > {vy}', 'frames': 80}, {'press': ['dash'], 'hold': ['right'], 'frames': 3}, dict(lande, hold=gl)])
    # Pilze (alle in der Nähe, auch auf A)
    for p in d_spiel.get('bouncers', []):
        pc = int(p['x'] // 40)
        if a[0] - 4 <= pc <= c0:
            out.append(rt.kombi_pilz(pc) + [{'hold': ['right'] + gl, 'until': 'P.vy > -1', 'frames': 100}, dict(lande, hold=gl)])
            for vy in (-6, -1, 3):
                out.append(rt.kombi_pilz(pc) + [{'hold': ['right'] + gl, 'until': f'P.vy > {vy}', 'frames': 100}, {'press': ['dash'], 'hold': ['right'], 'frames': 3}, dict(lande, hold=gl)])
            if wer == 'm':
                for rel in RELS[:3]:
                    out.append(rt.kombi_pilz(pc) + [{'hold': ['right'], 'hookWhen': 'P.vy > -8', 'until': 'P.hookAttached || P.grounded', 'frames': 150}]
                               + [{'swing': True, 'release': rel, 'frames': 600}, {'hold': ['right'], 'hookWhen': 'P.vy > -3', 'until': 'P.hookAttached || P.grounded', 'frames': 150}] * 3 + [lande])
                    out.append(rt.kombi_pilz(pc) + [{'hold': ['right'], 'hookWhen': 'P.vy > -8', 'until': 'P.hookAttached || P.grounded', 'frames': 150},
                               {'swing': True, 'release': rel, 'frames': 600}, {'hold': ['right'], 'until': 'P.vy > -2', 'frames': 60}, {'press': ['dash'], 'hold': ['right'], 'frames': 3}, lande])
    # Aufwinde (Schweinchen)
    if wer == 'f':
        for w in d_spiel.get('winds', []):
            wx = w['x'] + w.get('w', 40) / 2
            if kx(a[0]) - 200 <= wx <= kx(c0) + 80:
                for an in (-10, 0):
                    out.append([rt.k_lauf(a[1], an), {'press': ['jump'], 'hold': ['right', 'jump'], 'frames': 10},
                                {'hold': ['glide'], 'holdIf': {'right': f'P.x < {wx}', 'left': f'P.x > {wx + 10}'}, 'until': f'P.y < {rt.ky(b[2] - 3)}', 'frames': 700},
                                dict(lande, hold=['glide'])])
    # Haken (Affe), auch Ketten
    if wer == 'm':
        for an, rel, pull in itertools.product((-10, 0), RELS, (0, 30)):
            out.append([rt.k_lauf(a[1], an), {'press': ['jump'], 'hold': ['right', 'jump'], 'hookWhen': 'P.vy > -5', 'until': 'P.hookAttached || (P.grounded && f > 5)', 'frames': 150}]
                       + [{'swing': True, 'pull': pull, 'release': rel, 'frames': 600}, {'hold': ['right'], 'hookWhen': 'true', 'until': 'P.hookAttached || P.grounded', 'frames': 150}] * 3 + [lande])
        out.append([rt.k_lauf(a[1], -10), {'press': ['jump'], 'hold': ['right', 'jump'], 'hookWhen': 'P.vy > -5', 'until': 'P.hookAttached || (P.grounded && f > 5)', 'frames': 150},
                    {'swing': True, 'release': RELS[1], 'frames': 600}, {'hold': ['right'], 'until': 'P.vy > -2', 'frames': 60}, {'press': ['dash'], 'hold': ['right'], 'frames': 3}, lande])
    return out

def ohne_js(s):
    if s['art'] == 'haken': return f"hooks = hooks.filter(h => !(Math.abs(h.x - {s['c'] * 40 + 20}) < 3 && Math.abs(h.y - {s['r'] * 40 + 20}) < 3));"
    if s['art'] == 'pilz': return f"bouncers = bouncers.filter(b => Math.abs(b.x - {s['c'] * 40 + 20}) > 3);"
    return f"winds.splice(0, winds.length, ...winds.filter(w => w.x < {s['spalten'][0] * 40 - 1} || w.x > {s['spalten'][-1] * 40 + 41}));"

async def schafft(rt, g, wer, a, b, d_spiel, pre):
    anders = 'f' if wer == 'm' else 'm'
    for pl in plaene(rt, wer, a, b, d_spiel):
        st = max(a[0], a[1] - 5)   # nicht auf einem Pilz am Kanten-Ende starten
        r = await rt.koop(g, **{wer: rt.kat(st, a[2] - 1), anders: rt.kat(max(a[0], st - 2), a[2] - 1)}, plans={wer: pl}, pre=pre, maxFrames=2500)
        if r.get('done') and not r.get('dead') and r['pos'][wer][0] >= b[0] - 0.5 and abs(r['pos'][wer][1] - (b[2] - 1)) < 0.6: return True
    return False

async def pruefen(datei, nur=None, spalten=None):
    import run_tests as rt
    from playwright.async_api import async_playwright
    lv = L.Level(datei); d_spiel = json.loads((ROOT / 'levels' / datei).read_text(encoding='utf-8'))
    liste = stellen(lv, nur, spalten)
    async with async_playwright() as pw:
        br = await pw.chromium.launch(); p = await br.new_page(viewport={'width': 1400, 'height': 840})
        await p.goto(rt.GAME); await p.wait_for_timeout(400); g = rt.Game(p)
        await rt.koop_level(g, datei)
        for s in liste:
            if not s['a'] or not s['b']: s['ergebnis'] = 'keine Stelle'; yield s; continue
            erg = {}
            for wer in s['wer']:
                mit = await schafft(rt, g, wer, s['a'], s['b'], d_spiel, '')
                ohne = await schafft(rt, g, wer, s['a'], s['b'], d_spiel, ohne_js(s)) if mit else None
                erg[wer] = 'nötig' if mit and not ohne else ('überflüssig' if mit else 'unklar')
            s['je_figur'] = erg
            if any(v == 'nötig' for v in erg.values()): s['ergebnis'] = 'nötig'
            elif any(v == 'überflüssig' for v in erg.values()): s['ergebnis'] = 'überflüssig'
            else: s['ergebnis'] = 'unklar'
            yield s
        await br.close()

async def main():
    a = sys.argv[1:]
    datei = a[0]
    nur = a[a.index('--nur') + 1] if '--nur' in a else None
    sp = tuple(map(int, a[a.index('--spalten') + 1].split('-'))) if '--spalten' in a else None
    async for s in pruefen(datei, nur, sp):
        if '--json' in a: print(json.dumps(s, ensure_ascii=False), flush=True)
        else: print(f"{s['art']:5} {s['c']:4},{s['r']:3}  A={s['a']} B={s['b']}  -> {s['ergebnis']} {s.get('je_figur', '')}", flush=True)

if __name__ == '__main__':
    asyncio.run(main())
