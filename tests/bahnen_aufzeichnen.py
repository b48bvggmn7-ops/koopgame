"""Bahnen-Test (Nacht-Ausbau): Referenz-Bahnen der alten Mechaniken EINMAL aufzeichnen (vor dem Einbau neuer Mechaniken).
Aufruf: python3 tests/bahnen_aufzeichnen.py [--schreiben]
Ohne --schreiben: zeichnet auf und zeigt nur eine Übersicht (zum Prüfen der Szenarien). Mit --schreiben wird
tests/bahnen_referenz.json angelegt – aber NIE überschrieben, wenn sie schon existiert (die Referenz ist heilig)."""
import asyncio, json, os, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from playwright.async_api import async_playwright
import run_tests as rt

REF = rt.ROOT / 'tests' / 'bahnen_referenz.json'

async def main(schreiben):
    srv = rt.webserver()
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
        p = await b.new_page(viewport={'width': 1400, 'height': 840})
        fehler = []; p.on('pageerror', lambda e: fehler.append(str(e)))
        await p.goto(srv.url + 'index.html?testlevel=bahnen')
        await p.wait_for_function("typeof p1 !== 'undefined' && p1 && solids.length > 3 && menuScreen === null", timeout=15000)
        await p.evaluate("() => {" + (rt.ROOT / 'tests' / 'bahnen.js').read_text(encoding='utf-8') + "}")
        daten = await p.evaluate("() => bahnenAufzeichnen()")
        for sz in daten:
            bahn = sz['bahn']
            def spur(w):
                xs = [s[w][0] / 40 for s in bahn]; ys = [s[w][1] / 40 for s in bahn]
                return (f"x {min(xs):.1f}..{max(xs):.1f} y {min(ys):.1f}..{max(ys):.1f} Boden->Ende {bahn[-1][w][4]} "
                        f"Seil {sum(s[w][6] for s in bahn)} Schirm {sum(s[w][7] for s in bahn)} Wand {sum(1 for s in bahn if s[w][5])}")
            # Wand-Rutsch-Bedingung (neue Mechanik, Nacht-Ausbau): an der Wand, kein Seil, kein Schirm, Fall schneller als 4,5.
            # In der Referenz darf sie NIE vorkommen – sonst wäre ein Unterschied durch das neue Rutschen erwartbar.
            rutsch = sum(1 for s in bahn for w in (0, 1) if s[w][5] and not s[w][4] and not s[w][6] and not s[w][7] and s[w][3] > 4.5)
            print(f"{sz['name']:20s} Affe: {spur(0)}\n{'':20s} Schw: {spur(1)}  Rutsch-Bedingung: {rutsch}")
        print('Fehler:', fehler)
        if schreiben:
            if REF.exists(): print('Referenz existiert schon – NICHT überschrieben.'); return
            REF.write_text(json.dumps(daten, separators=(',', ':')), encoding='utf-8')
            print('Referenz geschrieben:', REF, REF.stat().st_size, 'Bytes')
        await b.close()

asyncio.run(main('--schreiben' in sys.argv))
