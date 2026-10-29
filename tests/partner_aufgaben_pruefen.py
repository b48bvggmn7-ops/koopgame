# tests/partner_aufgaben_pruefen.py – Prüf- und Vorschlagswerkzeug für die Begleiter-Aufgaben des Computer-Partners
# (js/30-partner.js, js/31-partner-aufgaben.js; Format der Begleitdatei siehe dort und FEATURES.md).
#
# Für jede Verknüpfungs-Nummer eines Levels mit Hebel oder Druckplatte wird ausprobiert, ob der Partner sie erledigt:
# er startet am Checkpoint davor bzw. am nächsten Checkpoint (ich stehe daneben), einmal ohne und einmal mit den
# schon gelösten Rätseln davor (Nummern weiter links an), je als Affe und als Schweinchen. Gespielt wird mit der echten
# Spiel-Physik und denselben Tasten wie ein Spieler (Chromium, wie tests/run_tests.py).
#
# Aufruf:
#   python3 tests/partner_aufgaben_pruefen.py --level dschungel/03-lianenschlucht.json            Tabelle
#   python3 tests/partner_aufgaben_pruefen.py --level dschungel/03-lianenschlucht.json --schreiben
#       schreibt levels/partner/<welt>/<datei>.json neu: eine Aufgabe je erledigter Nummer (Rolle = Figuren, die es
#       schaffen), mit „probe“ (Startplatz, Figur, Schritte) für den Test; von Hand ergänzte Aufgaben („von_hand“: true)
#       bleiben erhalten. Nummern, die Felsen oder steigende Lava auslösen, bekommen nie eine Aufgabe.
#   --welt dschungel     alle Level einer Welt (aus levels/worlds.json)
# Nicht erledigte Nummern stehen in der Begleitdatei unter „offen“ (dort bleibt der Partner im Folge-Modus).
import asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import abschnitt as A   # Dschungel-Neu: Abschnitte aus Teilen
sys.path.insert(0, str(Path(__file__).resolve().parent))
import run_tests as T
from playwright.async_api import async_playwright

ROOT = T.ROOT
SCHRITTE = 2400   # höchstens so viele Spielschritte je Versuch (≈ 44 s)

def nummern(d):
    """Nummer -> Auslöser (Hebel/Platte) und Ziele (Türen, Fahrten, Wechselboden …) mit Spalten."""
    L = {}
    for s in d.get('switches', []): L.setdefault(s.get('link'), {'ausloeser': [], 'ziele': []})['ausloeser'].append(('hebel', s['x'], s['y']))
    for s in d.get('plates', []): L.setdefault(s.get('link'), {'ausloeser': [], 'ziele': []})['ausloeser'].append(('platte', s['x'], s['y']))
    for s in d.get('doors', []):
        if s.get('link') in L: L[s['link']]['ziele'].append(('tuer', s['x'] // 40))
    for s in d.get('movingPlatforms', []):
        if s.get('switchLink') in L: L[s['switchLink']]['ziele'].append(('fahrt', s['x'] // 40, s['y'] // 40, (s['x'] + s['w']) // 40 - 1))
    for s in d.get('switchFloors', []):
        if s.get('link') in L: L[s['link']]['ziele'].append(('wechsel', s['x'] // 40))
    gefaehrlich = {b.get('link') for b in d.get('boulders', [])} | {m.get('link') for m in d.get('lavaPegel', []) if m.get('start') == 'nummer'}
    for mp in d.get('movingPlatforms', []):   # fahrende Stachelwand (Jagd): Stacheln an/auf einem Boden dieser Nummer
        if mp.get('switchLink') is None: continue
        for sp in d.get('spikes', []):
            if mp['x'] - 40 <= sp['x'] <= mp['x'] + mp['w'] + 40 and mp['y'] - 40 <= sp['y'] <= mp['y'] + mp['h'] + 40: gefaehrlich.add(mp['switchLink'])
    licht = {sp.get('link') for sp in d.get('spiegel', []) if sp.get('link')}   # schaltbare Spiegel: Licht-Rätsel löst der Mensch
    return {k: v for k, v in L.items() if k is not None and v['ausloeser'] and k not in gefaehrlich and k not in licht}

async def probe(p, aufgabe, ich_xy, er_xy, partner_figur, links, n):
    await p.evaluate(f"(() => {{ partner.ich = '{'f' if partner_figur == 'm' else 'm'}'; partnerTastenNeu(); return 1; }})()")
    return await p.evaluate('o => __probe(o)', {'ich': ich_xy, 'er': er_xy, 'n': n, 'links': links, 'aufgabe': aufgabe})

async def level_pruefen(p, datei):
    d = json.loads((ROOT / 'levels' / datei).read_text(encoding='utf-8'))
    L = nummern(d)
    cps = sorted([(c['x'], c['y']) for c in d.get('checkpoints', [])] + [(d['startM']['x'], d['startM']['y'])])
    spalte = {k: min((x - 20) // 40 for _, x, _ in v['ausloeser']) for k, v in L.items()}
    ergebnisse = []
    for link in sorted(L):
        art, tx, ty = L[link]['ausloeser'][0]
        vor = [c for c in cps if c[0] <= tx - 40]
        starts = ([vor[-1]] if vor else []) + [min(cps, key=lambda c: abs(c[0] - tx) + 0.5 * abs(c[1] - ty))]
        vorher = [k for k, c in spalte.items() if c < spalte[link] - 2]
        aufgabe = {'id': f'nummer-{link}', 'aktion': art, 'nummer': link, 'rolle': 'beide'}
        gut = {}
        for (sx, sy) in dict.fromkeys(starts):
            for lks in ([], vorher) if vorher else ([],):
                for fig in ('m', 'f'):
                    if fig in gut: continue
                    r = await probe(p, aufgabe, [sx + 20, sy], [sx - 20, sy], fig, lks, SCHRITTE)
                    if r['an'] and not r['tod']: gut[fig] = {'start': [sx // 40, sy // 40 - 1], 'links': lks, 'schritte': r['f']}
        ergebnisse.append({'nummer': link, 'art': art, 'spalte': (tx - 20) // 40, 'reihe': (ty - 20) // 40, 'ziele': L[link]['ziele'], 'gut': gut})
        rolle = '+'.join('Affe' if f == 'm' else 'Schwein' for f in gut) or '–'
        print(f'  {datei:36s} Nummer {link:3d} {art:6s} Spalte {(tx - 20) // 40:4d}  schafft: {rolle}', flush=True)
    return ergebnisse

def aufgaben_bauen(datei, ergebnisse, alt):
    von_hand = [a for a in alt.get('aufgaben', []) if a.get('von_hand')]
    hand_nummern = {a.get('nummer') for a in von_hand}
    auf, offen = [], []
    for e in ergebnisse:
        if e['nummer'] in hand_nummern: continue
        if not e['gut']: offen.append({'nummer': e['nummer'], 'spalte': e['spalte'], 'grund': 'Partner erreicht den Auslöser nicht (Kamin/Umweg/Reihenfolge) – Rolle tauschen'}); continue
        sp = [e['spalte']] + [z[1] for z in e['ziele']]
        a = {'id': f"nummer-{e['nummer']}", 'zone': [max(0, min(sp) - 12), max(sp) + 3],
             'rolle': 'beide' if len(e['gut']) == 2 else next(iter(e['gut'])), 'aktion': e['art'], 'nummer': e['nummer']}
        fahrt = [z for z in e['ziele'] if z[0] == 'fahrt']
        mehrreihig = len({z[2] for z in fahrt}) > 1   # mehrere Reihen = fahrende Wand/Tor, kein Boden zum Mitfahren
        if fahrt and e['art'] == 'hebel' and not mehrreihig:   # bewegter Boden: erst schalten, wenn ich darauf stehe (er fährt mich)
            f0 = fahrt[0]
            a['wann'] = {'ich_in': [f0[1], f0[3]], 'ich_steht': True}
            a['text'] = f"Hebel {e['nummer']} (wenn du auf der Plattform stehst)"
        fig = 'm' if 'm' in e['gut'] else 'f'
        g = e['gut'][fig]
        a['probe'] = {'figur': fig, 'start': g['start'], 'links': g['links'], 'schritte': min(SCHRITTE, g['schritte'] * 2 + 300)}
        auf.append(a)
    return {'level': datei, 'hinweis': 'Begleiter-Aufgaben für den Computer-Partner (Testmodus). Erzeugt und geprüft mit '
            'tests/partner_aufgaben_pruefen.py; eigene Aufgaben mit "von_hand": true bleiben beim Neu-Erzeugen erhalten.',
            'aufgaben': von_hand + auf, 'offen': offen}

async def main(argv):
    if '--level' in argv: dateien = [argv[argv.index('--level') + 1]]
    elif '--welt' in argv:
        w = argv[argv.index('--welt') + 1]
        welt = next(x for x in json.loads((ROOT / 'levels' / 'worlds.json').read_text(encoding='utf-8'))['welten'] if x['id'] == w)
        dateien = A.level_dateien(welt)   # Abschnitte (Dschungel-Neu): ihre Teile
    else:
        print(__doc__ if __doc__ else 'Aufruf: --level <welt>/<datei> [--schreiben] | --welt <welt>'); return 1
    schreiben = '--schreiben' in argv
    async with async_playwright() as pw:
        import os
        b = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
        for datei in dateien:
            ctx = await b.new_context(viewport={'width': 1280, 'height': 720}); p = await ctx.new_page()
            await p.goto(T.GAME); g = T.Game(p)
            d = json.loads((ROOT / 'levels' / datei).read_text(encoding='utf-8'))
            srv = await T.partner_test_start(g, d, ich='m')
            try:
                await p.evaluate('(() => { window.__probe = ' + T.PARTNER_PROBE_JS + '; return 1; })()')
                erg = await level_pruefen(p, datei)
            finally:
                srv.shutdown(); await ctx.close()
            if schreiben:
                ziel = ROOT / 'levels' / 'partner' / datei
                alt = json.loads(ziel.read_text(encoding='utf-8')) if ziel.exists() else {}
                ziel.parent.mkdir(parents=True, exist_ok=True)
                ziel.write_text(json.dumps(aufgaben_bauen(datei, erg, alt), ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
                print(f'  -> {ziel.relative_to(ROOT)} geschrieben')
        await b.close()
    return 0

if __name__ == '__main__':
    sys.exit(asyncio.run(main(sys.argv[1:])))
