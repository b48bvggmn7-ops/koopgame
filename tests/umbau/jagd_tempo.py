# Umbau aller Level: Verfolgungs-Tempo ausprobieren. Für eine Jagd aus JAGDEN_BOT (tests/run_tests.py) werden mehrere
# Tempos im Spiel gesetzt (ohne die Datei zu ändern) und je Tempo gespielt: mit Dash (beide müssen ankommen) und ohne
# Dash (jemand muss eingeholt werden). Ausgabe je Tempo: mit Dash ok?, ohne Dash eingeholt?
# Aufruf: python3 tests/umbau/jagd_tempo.py <level-datei> <Teil des Namens> 4.6 5.0 5.4 ...
import asyncio, os, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tests'))

def pre(art, link, tempo):
    if art == 'Fels': return f"for(const F of felsen) if(F.link === {link}) F.tempo = {tempo};"
    return f"for(const s of solids) if(s.type === 'moveplat' && s.switchLink === {link}) s.speed = {tempo};"

async def lauf(rt, g, e, dash, tempo=None):
    lv, name, ms, fs, links, art, link, plaene, ziel = e
    pl = plaene(dash)
    o = dict(m=ms, f=fs, plans=pl, links=links, maxFrames=5000)
    if tempo is not None: o['pre'] = pre(art, link, tempo)
    r = await rt.koop(g, **o)
    angekommen = r.get('done') and not r.get('dead') and all(r['pos'][w][0] >= ziel - 0.5 for w in pl)
    return angekommen, r

async def main(datei, teil, tempos):
    import run_tests as rt
    from playwright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
        p = await b.new_page(viewport={'width': 1280, 'height': 720}); await p.goto(rt.GAME); await p.wait_for_timeout(400)
        g = rt.Game(p)
        for e in [e for e in rt.JAGDEN_BOT if e[0] == datei and teil in e[1]]:
            await rt.koop_level(g, datei)
            for t in tempos:
                ok, r = await lauf(rt, g, e, True, t)
                ok2, r2 = await lauf(rt, g, e, False, t)
                print(f"{e[1]} Tempo {t}: mit Dash {'OK' if ok else 'NEIN'} {r.get('pos')} tot={r.get('dead')} | ohne Dash {'eingeholt' if r2.get('dead') else 'NICHT eingeholt'} {r2.get('pos')}", flush=True)
        await b.close()

if __name__ == '__main__':
    asyncio.run(main(sys.argv[1], sys.argv[2], [float(x) for x in sys.argv[3:]]))
