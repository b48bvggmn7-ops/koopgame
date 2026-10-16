# tests/reichweite_messen.py – Nacht-Ausbau Phase 2: Reichweiten-Tabelle mit Erfolgsfenstern.
#   Für jede Kombination (Sprung, Boden-Dash, Sprung+Dash gerade/schräg/hoch, Schweinchen: Segeln, Segeln+Dash …) und jede
#   Zielhöhe dy (Kästchen, + = höher) misst es im echten Spiel (Physik Schritt für Schritt, tests/reichweite.js):
#     max   – größte Lücke (Kästchen, Kante bis Kante), die irgendein Timing schafft
#     fenster[g] – Erfolgsfenster in Schritten (Frames) für Lücke g: wie viele aufeinanderfolgende Schritte man beim
#                  kritischen Tastendruck daneben liegen darf (bei zwei Eingaben das Kleinere von Absprung- und
#                  Aktions-Fenster, am besten Punkt)
#   Einstufung (Nacht-Auftrag): Anteil = Lücke / max  -> komfortabel ≤ 70 %, knapp ≤ 90 %, Grenze ≤ 97 %,
#   darüber oder Fenster < 3 Schritte = verboten (unfair).
#   Näherung: freier Flug ohne Ziel-Block (Kopfstoß an der Zielkante nicht mitgerechnet) – echte Stellen in Leveln prüft
#   tests/stelle_pruefen.py mit der echten Level-Geometrie.
# Aufruf: python3 tests/reichweite_messen.py            -> schreibt tests/reichweiten.json + druckt die Tabelle
#         python3 tests/reichweite_messen.py --nur-tabelle (liest tests/reichweiten.json)
import asyncio, json, os, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tests'))

ANTEIL = [(0.70, 'komfortabel'), (0.90, 'knapp'), (0.97, 'Grenze')]
FENSTER_MIN = 3
SCHRITT = 0.25          # Lücken-Raster in Kästchen

def einstufen(anteil, fenster):
    if fenster < FENSTER_MIN: return 'verboten'
    for grenze, name in ANTEIL:
        if anteil <= grenze + 1e-9: return name
    return 'verboten'

def laeufe(reihe):
    """längster Lauf von True je Position (für jede Zelle: Länge des True-Laufs, in dem sie liegt)"""
    out = [0] * len(reihe); i = 0
    while i < len(reihe):
        if not reihe[i]: i += 1; continue
        j = i
        while j < len(reihe) and reihe[j]: j += 1
        for q in range(i, j): out[q] = j - i
        i = j
    return out

def fenster_fuer(gitter, j, g_px, zwei):
    """bestes Fenster für Lücke g_px bei Zielhöhe-Index j: min(Absprung-Lauf, Aktions-Lauf) am besten Punkt"""
    ok = [[zelle[j] >= g_px for zelle in zeile] for zeile in gitter]
    nk, nt = len(ok), len(ok[0])
    lt = [laeufe(z) for z in ok]
    lk_spalten = [laeufe([ok[a][b] for a in range(nk)]) for b in range(nt)]
    best = 0
    for a in range(nk):
        for b in range(nt):
            if not ok[a][b]: continue
            w = min(lt[a][b], lk_spalten[b][a]) if zwei else lk_spalten[b][a]
            best = max(best, w)
    return best

def auswerten(m):
    zwei = len(m['ts']) > 1
    tab = {}
    for j, dy in enumerate(m['dy']):
        mx = max(z[j] for zeile in m['gitter'] for z in zeile)
        if mx <= 0: continue
        fen = {}
        g = SCHRITT
        while g * 40 <= mx:
            fen[round(g, 2)] = fenster_fuer(m['gitter'], j, g * 40, zwei)
            g += SCHRITT
        tab[dy] = {'max': round(mx / 40, 2), 'fenster': fen}
    return tab

async def messen():
    from playwright.async_api import async_playwright
    import run_tests as rt
    srv = rt.webserver(); erg = {}
    try:
        async with async_playwright() as pw:
            b = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
            p = await b.new_page(viewport={'width': 1280, 'height': 720})
            fehler = []; p.on('pageerror', lambda e: fehler.append(str(e)))
            await p.goto(srv.url + 'index.html?testlevel=bahnen')
            await p.wait_for_function("typeof p1 !== 'undefined' && p1 && solids.length > 3 && menuScreen === null", timeout=15000)
            # Spielschleife anhalten, damit sie nicht dazwischen rechnet
            await p.evaluate("() => { window.__stepAlt = stepSim; stepSim = () => {}; }")
            await p.evaluate("() => {" + (ROOT / 'tests' / 'reichweite.js').read_text(encoding='utf-8') + "}")
            kombis = await p.evaluate("Object.entries(RW.KOMBIS).map(([n, k]) => [n, k.wer])")
            for name, wer in kombis:
                for w in wer:
                    m = await p.evaluate("([n, w]) => RW.messen(n, w)", [name, w])
                    erg[f'{w}:{name}'] = {'figur': 'Affe' if w == 'm' else 'Schweinchen', 'kombi': name, 'kante': m['kante'],
                                         'tabelle': auswerten(m)}
                    print(f'  gemessen {w}:{name}', file=sys.stderr)
            assert not fehler, fehler
            await b.close()
    finally:
        srv.shutdown()
    return erg

def drucken(erg):
    print('Reichweiten (Kästchen Kante bis Kante, Fenster in Schritten bei 70 % / 90 % / 97 % der Höchstweite)')
    for key, e in erg.items():
        print(f"\n{e['figur']} – {e['kombi']}")
        print('   dy   max    70%: Fenster   90%: Fenster   97%: Fenster')
        for dy, t in sorted(e['tabelle'].items(), key=lambda x: -int(x[0])):
            zeile = f"  {int(dy):+3d}  {t['max']:5.2f}"
            for a in (0.7, 0.9, 0.97):
                g = max([float(x) for x in t['fenster'] if float(x) <= a * t['max'] + 1e-9] or [0])
                f = t['fenster'].get(str(g), t['fenster'].get(g, 0)) if g else 0
                zeile += f"   {g:5.2f}: {f:3d}    "
            print(zeile)

if __name__ == '__main__':
    ziel = ROOT / 'tests' / 'reichweiten.json'
    if '--nur-tabelle' in sys.argv:
        erg = json.loads(ziel.read_text(encoding='utf-8'))
    else:
        erg = asyncio.run(messen())
        ziel.write_text(json.dumps(erg, ensure_ascii=False, indent=1), encoding='utf-8')
    drucken(erg)
