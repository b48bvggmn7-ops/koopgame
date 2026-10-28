# Nutzerwunsch „entweder ich brauche den Haken oder nicht“ (Dschungel ganzheitlich): an jeder Pilz-Grube mit Haken muss
# der Affe den Haken wirklich brauchen. Je Stelle wird (echte Physik, Koop-Bot) probiert: Pilz und Haken k = 0 … 4 Spalten
# weiter von der Grube weg – gesucht ist das kleinste k mit
#   Affe: Pilz + Haken schafft es · Affe ohne Haken (Pilz + Dash) nicht · Schweinchen: Pilz + Schirm (+ Dash) schafft es ·
#   ohne Pilz schafft es keiner (Sprung/Schirm/Dash bzw. Sprung + Haken).
# Gibt es kein solches k, wird der Haken entfernt (Affe dann: Pilz + Dash). Ergebnis je Stelle: tests/umbau/pilzgruben_haken_<welt>_<datei>.json
# Aufruf: python3 tests/umbau/pilzgruben_haken.py <welt>/<datei> [pilz-spalte …]   (ohne Spalten: alle Pilz-Gruben mit Haken)
import asyncio, json, sys, itertools
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tests'))
import level_bau as L

FEST = ('ground', 'wall', 'haft', 'crumble')
RELS = ['P.x > P.anchor.x + 30 && P.vx > 1', 'P.x > P.anchor.x + P.ropeLen*0.6 && P.vy < 0',
        'P.x > P.anchor.x + P.ropeLen*0.8 && P.vy < 0', 'P.x > P.anchor.x + P.ropeLen*0.4 && P.vy < 0']

def turm(lv, c, unten):
    """Oberkante des Blocks in Spalte c, der bis zur Reihe unten reicht"""
    if lv.typ(c, unten) not in FEST: return None
    r = unten
    while lv.typ(c, r - 1) in FEST: r -= 1
    return r

def gruben(lv):
    """Pilz-Gruben: Pilz auf dem Boden, danach (bis 12 Spalten) eine Grube und ein Turm, der höher ist; Haken dazwischen"""
    out = []
    for b in lv.ed.get('bouncers', []):
        pc, pr = b['c'], b['r']; unten = pr + 1
        rand = pc
        while lv.typ(rand + 1, unten) in FEST and lv.typ(rand + 1, unten - 1) not in FEST: rand += 1
        l0 = next((c for c in range(rand + 2, rand + 14) if (turm(lv, c, unten) or 99) < unten - 2), None)
        if l0 is None: continue
        haken = [h for h in lv.ed.get('hooks', []) if pc - 1 <= h['c'] <= l0 and h['r'] < unten - 3 and not h.get('move')]
        out.append({'pilz': pc, 'reihe': pr, 'rand': rand, 'l0': l0, 'oben': turm(lv, l0, unten), 'haken': haken[0] if haken else None})
    return out

class Pruefer:
    def __init__(self, rt, g, datei): self.rt, self.g, self.datei = rt, g, datei
    async def geht(self, wer, plaene, ziel, oben, start, pre=''):
        rt = self.rt; anders = 'f' if wer == 'm' else 'm'
        for pl in plaene:
            r = await rt.koop(self.g, **{wer: rt.kat(*start), anders: rt.kat(start[0] - 2, start[1])}, plans={wer: pl}, pre=pre, maxFrames=2500)
            if r.get('done') and not r.get('dead') and r['pos'][wer][0] >= ziel - 0.5 and r['pos'][wer][1] <= oben - 0.9: return True
        return False
    async def stelle(self, s, pz, haken):
        rt, kx = self.rt, self.rt.kx
        l0, oben = s['l0'], s['oben']
        lande = {'holdIf': {'right': f'P.x < {kx(l0 + 1)}', 'left': f'P.x > {kx(l0 + 2)}'}, 'until': 'P.grounded && !P.dash', 'frames': 500}
        start = (pz - 4, s['reihe'])
        pilz = rt.kombi_pilz(pz)
        m_haken = [pilz + [{'hold': ['right'], 'hookWhen': hw, 'until': 'P.hookAttached || P.grounded', 'frames': 150},
                           {'swing': True, 'pull': pull, 'release': rel, 'frames': 600}, lande]
                   for rel, hw, pull in itertools.product(RELS, ('P.vy > -8', 'P.vy > -3'), (0, 20))]
        m_ohne = [pilz + [{'hold': ['right'], 'until': f'P.vy > {vy}', 'frames': 100}] + ([{'press': ['dash'], 'hold': ['right'], 'frames': 3}] if d else []) + [lande]
                  for vy in (-10, -6, -3, -1, 2, 5) for d in (True, False)]
        f_pl = [pilz + [{'hold': ['right', 'glide'] if g else ['right'], 'until': f'P.vy > {vy}', 'frames': 100}] + ([{'press': ['dash'], 'hold': ['right'], 'frames': 3}] if d else []) + [dict(lande, hold=['glide'])]
                for vy in (-6, -1, 3) for d in (False, True) for g in (False, True)]
        rand = s['rand']
        ohne_pilz = lambda wer: [[rt.k_lauf(rand, an), {'press': ['jump'], 'hold': ['right', 'jump'], 'frames': 14}]
                                 + ([{'hold': ['right'], 'until': 'P.vy > -2', 'frames': 80}, {'press': ['dash'], 'hold': ['right'], 'frames': 3}] if d else [])
                                 + ([{'hold': ['right'], 'hookWhen': 'true', 'until': 'P.hookAttached || P.grounded', 'frames': 150}, {'swing': True, 'release': RELS[1], 'frames': 600}] if wer == 'm' else [])
                                 + [dict(lande, hold=['glide'] if wer == 'f' else [])] for an in (-10, 0) for d in (False, True)]
        kein_pilz = f"bouncers = bouncers.filter(b => Math.abs(b.x - {kx(pz)}) > 3);"
        e = {}
        e['m_haken'] = await self.geht('m', m_haken, l0, oben, start) if haken else None
        kein_haken = f"hooks = hooks.filter(h => !(Math.abs(h.x - {kx(haken['c'])}) < 3 && Math.abs(h.y - {haken['r'] * 40 + 20}) < 3));" if haken else ''
        e['m_ohne_haken'] = await self.geht('m', m_ohne, l0, oben, start, kein_haken)
        e['f'] = await self.geht('f', f_pl, l0, oben, start)
        e['m_ohne_pilz'] = await self.geht('m', ohne_pilz('m'), l0, oben, (rand - 4, s['reihe']), kein_pilz)
        e['f_ohne_pilz'] = await self.geht('f', ohne_pilz('f'), l0, oben, (rand - 4, s['reihe']), kein_pilz)
        return e

def frei(lv, c, r):
    return lv.typ(c, r) is None and lv.typ(c, r + 1) in FEST and not any(p.get('c') == c and p.get('r') == r for f, v in lv.ed.items()
               if isinstance(v, list) and f != 'tiles' for p in v if isinstance(p, dict))

async def main(datei, nur):
    import run_tests as rt
    from playwright.async_api import async_playwright
    ergebnisse = []
    async with async_playwright() as pw:
        br = await pw.chromium.launch(); p = await br.new_page(viewport={'width': 1400, 'height': 840})
        await p.goto(rt.GAME); await p.wait_for_timeout(400); g = rt.Game(p)
        P = Pruefer(rt, g, datei)
        for s in gruben(L.Level(datei)):
            if nur and s['pilz'] not in nur: continue
            if not s['haken']: continue
            gewaehlt = None
            for k in range(0, 5):
                lv = L.Level(datei)
                pz, h = s['pilz'] - k, dict(s['haken'])
                if k:
                    if not frei(lv, pz, s['reihe']): continue
                    lv.punkt_weg('bouncers', s['pilz'], s['reihe']); lv.pilz(pz, s['reihe'])
                    lv.haken_weg(h['c'], h['r']); h['c'] -= k; lv.haken(h['c'], h['r'], radius=h.get('radius', 4.5))
                    await L.speichern_async([lv])
                await rt.koop_level(g, datei)
                e = await P.stelle(s, pz, h)
                print(datei, 'Pilz', s['pilz'], 'k', k, e, flush=True)
                if e['m_haken'] and not e['m_ohne_haken'] and e['f'] and not e['m_ohne_pilz'] and not e['f_ohne_pilz']:
                    gewaehlt = {'art': 'verschoben', 'k': k, 'pilz': pz, 'haken': [h['c'], h['r']], 'pruefung': e}; break
                if k:   # zurück
                    lv = L.Level(datei); lv.punkt_weg('bouncers', pz, s['reihe']); lv.pilz(s['pilz'], s['reihe'])
                    lv.haken_weg(h['c'], h['r']); lv.haken(s['haken']['c'], s['haken']['r'], radius=s['haken'].get('radius', 4.5)); await L.speichern_async([lv])
            if not gewaehlt:
                lv = L.Level(datei); lv.haken_weg(s['haken']['c'], s['haken']['r']); await L.speichern_async([lv])
                await rt.koop_level(g, datei)
                e = await P.stelle(s, s['pilz'], None)
                print(datei, 'Pilz', s['pilz'], 'Haken weg', e, flush=True)
                gewaehlt = {'art': 'haken_weg', 'pilz': s['pilz'], 'haken_alt': [s['haken']['c'], s['haken']['r']], 'pruefung': e}
            ergebnisse.append({'level': datei, 'pilz_alt': s['pilz'], 'l0': s['l0'], 'oben': s['oben'], 'reihe': s['reihe'], **gewaehlt})
        await br.close()
    pfad = ROOT / 'tests' / 'umbau' / ('pilzgruben_haken_' + datei.replace('/', '_'))
    alt = json.loads(pfad.read_text(encoding='utf-8')) if pfad.exists() else []
    alt = [x for x in alt if not (x['level'] == datei and x['pilz_alt'] in [e['pilz_alt'] for e in ergebnisse])]
    pfad.write_text(json.dumps(alt + ergebnisse, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')

if __name__ == '__main__':
    asyncio.run(main(sys.argv[1], [int(x) for x in sys.argv[2:]]))
