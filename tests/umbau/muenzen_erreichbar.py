# Umbau aller Level: Münz-Erreichbarkeit (tests/umbau/muenzen_erreichbar.js) je Level prüfen.
# Ausgabe: Münzen, an die die passende Figur ohne Haken/Pilz/Aufwind/Fahrt nicht sicher herankommt – mit Grund-Hinweis
# (Haken/Pilz/Aufwind/Fahrt in der Nähe = dort nicht geprüft) und Vorschlag (nächster sicherer Bahnpunkt).
# Aufruf: python3 tests/umbau/muenzen_erreichbar.py <level-datei> [--json] [--nur c,r;c,r]  (--nur: nur diese Münzen)
import asyncio, json, os, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tests'))
import bildregel_pruefen as B

def hilfen(d):
    """Kästchen in der Nähe von Haken (Radius), Pilzen, Aufwinden, Fahrten, Teleportern, Wechselböden"""
    z = {}
    for h in d.get('hooks', []):
        hc, hr, rad = B.spalte(h['x']), B.reihe(h['y']), int(h.get('radius', 200) / 40) + 2
        for dc in range(-rad, rad + 1):
            for dr in range(-2, rad + 3): z.setdefault((hc + dc, hr + dr), 'Haken')
    for o in d.get('bouncers', []):
        for dc in range(-6, 7):
            for dr in range(-14, 2): z.setdefault((B.spalte(o['x']) + dc, B.reihe(o['y']) + dr), 'Pilz')
    for o in d.get('winds', []):
        for (c, r) in B.felder_zellen(o):
            for dc in range(-3, 4):
                for dr in range(-3, 2): z.setdefault((c + dc, r + dr), 'Aufwind')
    for f, name in (('movingPlatforms', 'Fahrt'), ('teleporters', 'Teleporter'), ('switchFloors', 'Wechselboden')):
        for o in d.get(f, []):
            cs = [B.spalte(o['x']), B.spalte(o.get('targetX', o['x']))]; rs = [B.reihe(o['y']), B.reihe(o.get('targetY', o['y']))]
            for c in range(min(cs) - 4, max(cs) + 6):
                for r in range(min(rs) - 6, max(rs) + 4): z.setdefault((c, r), name)
    return z

async def pruefen(datei, vorschlag=True, nur=None):
    from playwright.async_api import async_playwright
    import run_tests as rt
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
        p = await b.new_page(viewport={'width': 1280, 'height': 720})
        await p.goto(rt.GAME); await p.wait_for_timeout(400)
        g = rt.Game(p); await g.load(str(ROOT / 'levels' / datei))
        await p.evaluate("() => { closeMenu(); stepSim = () => {}; }")
        await p.evaluate("() => {" + (ROOT / 'tests' / 'stelle_pruefen.js').read_text(encoding='utf-8') + "}")
        await p.evaluate("() => {" + (ROOT / 'tests' / 'umbau' / 'muenzen_erreichbar.js').read_text(encoding='utf-8') + "}")
        res = await p.evaluate("([v, n]) => MZ.alle(v, n)", [vorschlag, nur])
        await b.close()
    hz = hilfen(B.lade(datei))
    out = []
    for e in res:
        schlecht = [k for k, x in enumerate(e['ergebnisse']) if not x['ok']]
        if not schlecht: continue
        e['grund'] = hz.get((e['c'], e['r']))
        out.append(e)
    return out

if __name__ == '__main__':
    datei = sys.argv[1]
    nur = [list(map(int, x.split(','))) for x in sys.argv[sys.argv.index('--nur') + 1].split(';')] if '--nur' in sys.argv else None
    res = asyncio.run(pruefen(datei, nur=nur))
    if '--json' in sys.argv: print(json.dumps(res, ensure_ascii=False))
    else:
        for e in res:
            v = [x.get('vorschlag') for x in e['ergebnisse'] if not x['ok']]
            print(f"Münze {e['i']} ({e['c']},{e['r']}) {e['farbe']}: nicht erreichbar{' – ' + e['grund'] + ' in der Nähe (nicht geprüft)' if e['grund'] else ''}  Vorschlag {v}")
        print(f'{len(res)} Münzen auffällig')
