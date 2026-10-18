# Umbau: Münzen in den Dash-Tunneln (DASH_KETTEN_BOT in tests/run_tests.py) auf die echte Dash-Bahn ihrer Figur legen.
# Spielt je Tunnel den Plan „warten“ für Affe und Schweinchen, merkt sich die Bahn (Mitte der Figur) und setzt jede nicht
# eingesammelte Münze der Figur in derselben Spalte auf die Reihe, durch die die Figur dort fliegt (Spalte bleibt).
# Aufruf: python3 tests/umbau/tunnel_muenzen.py <level-datei> [--schreiben]
import asyncio, os, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tests'))

def mit_log(pl):
    out = []
    for st in pl:
        st = dict(st); L = "(window.__b[P === p1 ? 'm' : 'f'].push([P.x / 40, (P.y - P.h / 2) / 40]), false)"
        if 'until' in st: st['until'] = f"{L} || ({st['until']})"
        elif 'frames' in st: st['until'] = L
        out.append(st)
    return out

async def bahnen(datei):
    import run_tests as rt
    from playwright.async_api import async_playwright
    out = {}
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
        p = await b.new_page(viewport={'width': 1280, 'height': 720}); await p.goto(rt.GAME); await p.wait_for_timeout(400)
        g = rt.Game(p); await rt.koop_level(g, datei)
        for lv, name, ms, fs, kanten, ende in rt.DASH_KETTEN_BOT:
            if lv != datei: continue
            for wer in 'mf':
                start = {'m': ms, 'f': fs} if wer == 'm' else {'m': fs, 'f': ms}
                andere = 'f' if wer == 'm' else 'm'
                pl = {wer: mit_log(rt.dash_kette(kanten, ende, 'warten')), andere: [{'frames': 120}] + rt.dash_kette(kanten, ende, 'warten')}
                await rt.koop(g, **start, plans=pl, maxFrames=4000, pre="window.__b = {m: [], f: []}")
                out.setdefault(name, {'kanten': kanten, 'ende': ende})[wer] = (await g.ev('window.__b'))[wer]
        await b.close()
    return out

def main(datei, schreiben):
    import level_bau as L
    bb = asyncio.run(bahnen(datei))
    lv = L.Level(datei); n = 0
    for name, e in bb.items():
        for m in lv.ed['coins']:
            if not (e['kanten'][0] < m['c'] < e['ende']): continue
            for wer in ('m', 'f'):
                if m['color'] not in ({'m': 'blue', 'f': 'pink'}[wer], 'gold'): continue
                ys = [y for x, y in e[wer] if abs(x - (m['c'] + 0.5)) < 0.4]
                if not ys: print('keine Bahn in Spalte', m['c'], wer); continue
                ziel = min(range(-3, 18), key=lambda r: min(abs(y - (r + 0.5)) for y in ys))
                if ziel != m['r']: print(f"{name}: Münze ({m['c']},{m['r']}) {m['color']} -> Reihe {ziel}"); m['r'] = ziel; n += 1
                break
    if schreiben and n: L.speichern(lv)
    print(n, 'Münzen umgelegt' if schreiben else 'Münzen würden umgelegt')

if __name__ == '__main__':
    main(sys.argv[1], '--schreiben' in sys.argv)
