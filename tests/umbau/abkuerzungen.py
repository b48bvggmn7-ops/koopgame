# Umbau aller Level (nach dem Nacht-Ausbau): Abkürzungs-Kandidaten aus tests/level_vermessen.py mit ECHTER Physik
# (tests/stelle_pruefen.js) bestätigen. Je Grube und Figur: geht es mit alten Mitteln (Sprung/Segeln) bzw. mit Dash,
# und wie groß ist das Erfolgsfenster (Schritte)?
# Aufruf: python3 tests/umbau/abkuerzungen.py dschungel/01-dschungel.json [--json]
import asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import level_vermessen as LV
import stelle_pruefen as SP

def kandidaten(datei):
    v = LV.vermessen(datei)
    out = []
    for g in v['gruben']:
        wer = set()
        if g['abkuerzung']: wer |= {w for w in 'mf' if g['neu_' + w] is not None}
        wer |= set(g['rolle'])
        if not wer: continue
        for w in sorted(wer):
            out.append({'wer': w, 'c': g['von'], 'r': g['reihe'], 'dir': 1, 'c0': g['nach'], 'c1': g['nach'] + 3,
                        'rz': g['reihe'] - g['dy'], 'art': 'rolle' if w in g['rolle'] else 'abkuerzung', 'breite': g['breite']})
    return out

def pruefen(datei, kand=None):
    kand = kand if kand is not None else kandidaten(datei)
    return asyncio.run(SP.pruefen(datei, [dict(k, mittel='beide') for k in kand])) if kand else []

def text(e):
    def k(x): return '–' if not x else f"{x['dash'] or ''}{'+Schirm' if x['segeln'] else ''} F{x['fenster']}"
    return f"{'Affe' if e['wer'] == 'm' else 'Schwein':6s} {e['c']}→{e['c0']} r{e['r']}->{e['rz']} b{e['breite']} {e['art']:10s} alt {k(e['alt']):18s} neu {k(e['neu'])}"

if __name__ == '__main__':
    res = pruefen(sys.argv[1])
    if '--json' in sys.argv: print(json.dumps(res, ensure_ascii=False))
    else:
        for e in res: print(text(e))
