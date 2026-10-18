# Umbau: Münzen an Hilfen (Haken, Pilz, Aufwind, Fahrt, Teleporter, Wechselboden – siehe hilfen() in
# muenzen_erreichbar.py) mit dem GANZEN Spiel prüfen (tests/umbau/muenzen_hilfen.js). Ohne --nur: alle Münzen eines
# Levels, die in der Nähe einer Hilfe liegen. Ausgabe: Münzen, die die passende Figur nicht holt (und dabei überlebt).
# Aufruf: python3 tests/umbau/muenzen_hilfen.py <level-datei> [--nur c,r;c,r] [--json]
import asyncio, json, os, sys, time
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tests')); sys.path.insert(0, str(ROOT / 'tests' / 'umbau'))
import bildregel_pruefen as B
from muenzen_erreichbar import hilfen

async def pruefen(datei, nur):
    from playwright.async_api import async_playwright
    import run_tests as rt
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
        p = await b.new_page(viewport={'width': 1280, 'height': 720})
        await p.goto(rt.GAME); await p.wait_for_timeout(400)
        g = rt.Game(p); await g.load(str(ROOT / 'levels' / datei))
        await p.evaluate("() => { closeMenu(); }")
        for js in ('stelle_pruefen.js', 'umbau/muenzen_erreichbar.js', 'umbau/muenzen_hilfen.js'):
            await p.evaluate("() => {" + (ROOT / 'tests' / js).read_text(encoding='utf-8') + "}")
        res = []
        for c, r in nur:   # einzeln, damit ein langer Lauf nicht an der Zeitgrenze von evaluate scheitert
            res += await p.evaluate("n => MH.alle(n)", [[c, r]])
        await b.close()
    return res

if __name__ == '__main__':
    datei = sys.argv[1]
    d = B.lade(datei); hz = hilfen(d)
    if '--nur' in sys.argv: nur = [list(map(int, x.split(','))) for x in sys.argv[sys.argv.index('--nur') + 1].split(';')]
    else: nur = [[B.spalte(m['x']), B.reihe(m['y'])] for m in d.get('coins', []) if (B.spalte(m['x']), B.reihe(m['y'])) in hz]
    t = time.time()
    res = asyncio.run(pruefen(datei, nur))
    schlecht = [e for e in res if not all(x['ok'] for x in e['ergebnisse'])]
    if '--json' in sys.argv: print(json.dumps(res, ensure_ascii=False))
    for e in schlecht: print(f"Münze {e['i']} ({e['c']},{e['r']}) {e['farbe']}: nicht geholt – {hz.get((e['c'], e['r']), 'keine Hilfe')} in der Nähe")
    print(f"{len(res)} Münzen an Hilfen geprüft, {len(schlecht)} nicht geholt ({time.time() - t:.0f} s)")
