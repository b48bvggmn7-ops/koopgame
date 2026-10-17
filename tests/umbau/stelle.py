# Umbau aller Level: EINE Kombi-Stelle schnell prüfen (nach einer Änderung am Level oder am Plan):
#  1) Bot mit Kombi (Plan aus KOMBI_STELLEN_BOT) – beide Figuren müssen ankommen,
#  2) Bot ohne Kombi (*_ohne) – darf nicht ankommen,
#  3) Dash-Gegenprobe (tests/umbau/dashprobe.js) – ohne Hilfe nur mit Sprung/Schirm/Dash: Fenster (0 = unmöglich).
# Aufruf: python3 tests/umbau/stelle.py <level-datei> <Teiltext des Namens> [--ohne-dash]
import asyncio, os, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tests')); sys.path.insert(0, str(ROOT / 'tests' / 'umbau'))

async def main(datei, teil, mit_dash=True):
    import importlib, run_tests as rt
    from playwright.async_api import async_playwright
    eintr = [e for e in rt.KOMBI_STELLEN_BOT if e[0] == datei and teil in e[1]]
    if not eintr: print('keine Stelle gefunden'); return 1
    fehler = 0
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
        p = await b.new_page(viewport={'width': 1280, 'height': 720})
        await p.goto(rt.GAME); await p.wait_for_timeout(400)
        g = rt.Game(p)
        for lv, name, ms, fs, plaene, ziel in eintr:
            await rt.koop_level(g, lv)
            pl = plaene()
            for wer in ('m', 'f'):
                if wer not in pl: continue
                r = await rt.koop(g, m=ms if wer == 'm' else fs, f=fs if wer == 'm' else ms, plans={wer: pl[wer]}, maxFrames=4000)
                zc, zr = ziel[wer]
                ok = r.get('done') and r['pos'][wer][0] >= zc - 0.5 and r['pos'][wer][1] <= zr + 0.1
                print(f"{name} ({wer}) mit Kombi: {'OK' if ok else 'FEHLER'} {r.get('pos')} tot={r.get('dead')}"); fehler += not ok
                if wer + '_ohne' in pl:
                    r = await rt.koop(g, m=ms if wer == 'm' else fs, f=fs if wer == 'm' else ms, plans={wer: pl[wer + '_ohne']}, maxFrames=2500)
                    gs = r.get('done') and not r.get('dead') and r['pos'][wer][0] >= zc - 0.5 and r['pos'][wer][1] <= zr + 0.1
                    print(f"{name} ({wer}) ohne Kombi: {'FEHLER (geschafft)' if gs else 'OK (gescheitert)'}"); fehler += bool(gs)
        await b.close()
    if mit_dash:
        import dashprobe as DP
        res = await DP.pruefen([e for e in DP.eintraege(datei) if teil in e['name']])
        for e in res:
            if e['ergebnis']: fehler += 1
    return fehler

if __name__ == '__main__':
    n = asyncio.run(main(sys.argv[1], sys.argv[2], '--ohne-dash' not in sys.argv))
    print('FEHLER:', n); sys.exit(1 if n else 0)
