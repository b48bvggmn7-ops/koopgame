# Umbau aller Level: Dash-Gegenprobe für alle Kombi-Stellen (KOMBI_STELLEN_BOT in tests/run_tests.py): kommt eine Figur
# OHNE Hilfe (Pilz/Aufwind aus, kein Haken) nur mit Sprung, Schirm und Dash ans Kombi-Ziel? -> Fenster in Schritten.
# Aufruf: python3 tests/umbau/dashprobe.py [welt|level-datei] [--name Teiltext] [--json]
import asyncio, json, os, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tests'))

def eintraege(filter_=''):
    import run_tests as rt
    out = []
    for lv, name, ms, fs, plaene, ziel in rt.KOMBI_STELLEN_BOT:
        if filter_ and not lv.startswith(filter_): continue
        for wer in ('m', 'f'):
            if wer not in plaene(): continue
            x, y = ms if wer == 'm' else fs
            out.append({'level': lv, 'name': name, 'wer': wer, 'x': x, 'y': y, 'zc': ziel[wer][0], 'zr': ziel[wer][1]})
    return out

async def pruefen(liste):
    from playwright.async_api import async_playwright
    import run_tests as rt
    out = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
        p = await b.new_page(viewport={'width': 1280, 'height': 720})
        await p.goto(rt.GAME); await p.wait_for_timeout(400)
        g = rt.Game(p); geladen = None
        for e in liste:
            if e['level'] != geladen:
                await g.load(str(ROOT / 'levels' / e['level']))
                await p.evaluate("() => { closeMenu(); stepSim = () => {}; }")
                await p.evaluate("() => {" + (ROOT / 'tests' / 'stelle_pruefen.js').read_text(encoding='utf-8') + "}")
                await p.evaluate("() => {" + (ROOT / 'tests' / 'umbau' / 'dashprobe.js').read_text(encoding='utf-8') + "}")
                geladen = e['level']
            r = await p.evaluate("o => DASHPROBE.pruefen(o)", e)
            if r and os.environ.get('BAHN'): r['bahn'] = await p.evaluate("([o, b]) => DASHPROBE.zeigen(o, b)", [e, r])
            out.append(dict(e, ergebnis=r))
            print(f"{e['level']} {e['name']} ({e['wer']}): {'–' if not r else str(r)}", flush=True)
        await b.close()
    return out

if __name__ == '__main__':
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    liste = eintraege(a[0] if a else '')
    if '--name' in sys.argv: liste = [e for e in liste if sys.argv[sys.argv.index('--name') + 1] in e['name']]
    res = asyncio.run(pruefen(liste))
    if '--json' in sys.argv: print(json.dumps(res, ensure_ascii=False))
