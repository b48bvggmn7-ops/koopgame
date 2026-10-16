# tests/stelle_pruefen.py – Nacht-Ausbau Phase 2: eine Sprung-Stelle im echten Level mit echter Physik prüfen
# (tests/stelle_pruefen.js). Für Exploit-Kandidaten aus tests/level_vermessen.py und für neue schwere Stellen:
# geht es (mit alten Mitteln / mit Dash), mit welcher Kombination, wie groß ist das Erfolgsfenster (Schritte)?
# Aufruf: python3 tests/stelle_pruefen.py --level dschungel/01-dschungel.json --wer m --von 430,8 --dir 1 \
#                --ziel 448,460,16 [--mittel alt|neu|beide] [--links 3,4]
#   --von  Spalte,Reihe der Absprung-Kante (Reihe = Oberkante der Fläche, auf der die Figur steht)
#   --ziel Spalte von, Spalte bis, Reihe (Oberkante) der Zielfläche
import asyncio, json, os, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tests'))

async def seite_mit_level(pw, datei):
    import run_tests as rt
    b = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
    p = await b.new_page(viewport={'width': 1280, 'height': 720})
    await p.goto(rt.GAME); await p.wait_for_timeout(400)
    g = rt.Game(p); await g.load(str(ROOT / 'levels' / datei))
    await p.evaluate("() => { closeMenu(); window.__stepAlt = stepSim; stepSim = () => {}; }")
    await p.evaluate("() => {" + (ROOT / 'tests' / 'stelle_pruefen.js').read_text(encoding='utf-8') + "}")
    return b, p

async def pruefen(datei, stellen):
    """stellen: Liste von dicts {wer, c, r, dir, c0, c1, rz, mittel, links} -> Liste Ergebnisse"""
    from playwright.async_api import async_playwright
    out = []
    async with async_playwright() as pw:
        b, p = await seite_mit_level(pw, datei)
        for s in stellen:
            mittel = ['alt', 'neu'] if s.get('mittel', 'beide') == 'beide' else [s['mittel']]
            e = dict(s)
            for m in mittel:
                e[m] = await p.evaluate("o => STELLE.pruefen(o)", {**s, 'mittel': m})
            out.append(e)
        await b.close()
    return out

if __name__ == '__main__':
    a = sys.argv[1:]
    def arg(n, d=None): return a[a.index(n) + 1] if n in a else d
    c, r = map(int, arg('--von').split(',')); c0, c1, rz = map(int, arg('--ziel').split(','))
    st = {'wer': arg('--wer', 'm'), 'c': c, 'r': r, 'dir': int(arg('--dir', '1')), 'c0': c0, 'c1': c1, 'rz': rz,
          'mittel': arg('--mittel', 'beide'), 'links': [int(x) for x in arg('--links', '').split(',') if x]}
    for e in asyncio.run(pruefen(arg('--level'), [st])):
        print(json.dumps(e, ensure_ascii=False))
