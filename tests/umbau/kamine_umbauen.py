# Umbau aller Level: Kamin-Gruben (kombi_flammen_kamin) eines Levels auf 17 verbreitern – Ablauf je Kamin (rechts nach links):
# 1. Ausgleichsstrecke (8 Spalten schlichter Boden) rechts hinter dem Landeplatz oder links vor dem Kamin suchen – die
#    Seite mit dem kürzeren verschobenen Stück (höchstens 60 Spalten); tests/umbau/grube_weiten.py
# 2. Spaltenzahlen in den Tests nachziehen (tests/umbau/tests_verschieben.py)
# 3. Kombi-Eintrag in KOMBI_STELLEN_BOT: weit=8 (Gegenproben mit Dash), Ziel Schweinchen eine Spalte früher (Kante)
# Aufruf: python3 tests/umbau/kamine_umbauen.py <level> <x0> [<x0> ...]
import sys, re, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tests')); sys.path.insert(0, str(ROOT / 'tests' / 'umbau'))
import level_bau as L, grube_weiten as G, tests_verschieben as T

def profil(lv, c): return tuple(lv.typ(c, r) for r in range(-3, 18))
def belegt(lv, c):
    return any(o['c'] == c for k, v in G._listen(lv) if k != 'coins' for o in v) or \
        any(isinstance(lv.ed.get(k), dict) and lv.ed[k].get('c') == c for k in ('startM', 'startF', 'goal'))
def schlicht(p0):
    """schlichter Boden: oben frei, ab der Oberkante bis ganz unten nur Boden/Wand (keine schwebenden Inseln, Stege …)"""
    i = next((i for i, t in enumerate(p0) if t is not None), None)
    return i is not None and all(t in ('ground', 'wall') for t in p0[i:])
def frei(lv, q, n=8):
    p0 = profil(lv, q)
    return schlicht(p0) and all(profil(lv, c) == p0 and not belegt(lv, c) for c in range(q, q + n))
def suche_rechts(lv, start): return next((q for q in range(start, start + 200) if frei(lv, q)), None)
def suche_links(lv, start): return next((q for q in range(start - 8, max(0, start - 200), -1) if frei(lv, q)), None)

def kombi_eintrag(datei, x0):
    p = ROOT / 'tests' / 'run_tests.py'; s = p.read_text(encoding='utf-8')
    pat = re.compile(r"(\('" + re.escape(datei) + r"', '[^']*\(\d+\)'[^\n]*?kombi_flammen_kamin\(" + str(x0) + r", (\d+)([^)]*))\), \{'m': \((\d+), (\d+)\), 'f': \((\d+), (\d+)\)\}")
    m = pat.search(s)
    if not m: print('  Kombi-Eintrag nicht gefunden:', x0); return
    rest = m.group(3)
    if 'weit=' in rest: return
    neu = f"{m.group(1)}, weit=8, versatz_f=0), {{'m': ({m.group(4)}, {m.group(5)}), 'f': ({int(m.group(6)) - 1}, {m.group(7)})}}"
    p.write_text(s[:m.start()] + neu + s[m.end():], encoding='utf-8')

def umbauen(datei, xs, max_weg=60, seite=None):
    lv = L.Level(datei); log = []
    for x0 in sorted(xs, reverse=True):
        rw = x0 + 4; p = rw + 10
        q = suche_rechts(lv, p + 3); ql = suche_links(lv, x0 - 2)
        rechts = (q - p) if q else 9999; links = (rw - (ql + 8)) if ql is not None else 9999
        ende = lv.ed.get('cols', 800) - p
        if seite == 'ende' or (seite is None and min(rechts, links) > max_weg and ende <= 40):
            info = G.weiten_ende(lv, p, 8, rw + 1); bereich = [(p, 9999, 8)]; neu_x0 = x0
            print(datei, x0, '->', neu_x0, info)
            for f in (ROOT / 'tests' / 'run_tests.py',): T.datei_schieben(f, datei, bereich)
            T.datei_schieben(ROOT / 'tests' / 'bausteine' / 'stellen.py', datei, bereich, nur_zeilen=True)
            kurz = datei[0] + datei.split('/')[1][:2]; sp = ROOT / 'tests' / 'bausteine' / 'stellen.py'; t = sp.read_text(encoding='utf-8')
            sp.write_text(re.sub(r"\('" + kurz + r"', (\d+)\)", lambda m: f"('{kurz}', {T.neu(int(m.group(1)), bereich)})", t), encoding='utf-8')
            for j in ('bildregel_ausnahmen.json', 'kombi_ausnahmen.json'): T.json_schieben(ROOT / 'tests' / j, datei, bereich)
            g0 = x0 + 5; alte = [h for h in lv.ed.get('hooks', []) if g0 <= h['c'] <= g0 + 16]
            if alte:
                hr = min(h['r'] for h in alte) + 1; rad = alte[0].get('radius', 5.0)
                lv.ed['hooks'] = [h for h in lv.ed['hooks'] if h not in alte] + [{'c': g0 + d, 'r': hr, 'radius': rad} for d in (3, 8, 13)]
            kombi_eintrag(datei, neu_x0)
            for v in T.VERDAECHTIG: print('  NICHT verschoben (prüfen):', v)
            T.VERDAECHTIG.clear(); log.append(dict(info, x0=x0, neu_x0=neu_x0)); continue
        if min(rechts, links) > max_weg: print('KEINE kurze Ausgleichsstrecke:', datei, x0, 'rechts', rechts, 'links', links); log.append({'x0': x0, 'fehlt': True}); continue
        if seite == 'rechts' or (seite is None and rechts <= links):
            info = G.weiten(lv, p, q, 8, rw + 1); bereich = [(p, q - 1, 8), (q, q + 7, '=', q + 7)]; neu_x0 = x0   # herausgenommenes Stück -> an das Blockende
        else:
            info = G.weiten_links(lv, rw, ql, 8, rw + 9); bereich = [(ql + 8, rw, -8), (ql, ql + 7, '=', ql - 1)]; neu_x0 = x0 - 8
        # Haken über der Grube neu: drei Haken (Abstand 5) eine Reihe tiefer als der alte – so reicht die Kette sicher
        # bis zur Landung (gemessen am Feuerschlund 560: 2 Haken 0/20, 3 Haken 20/20)
        g0 = neu_x0 + 5; alte = [h for h in lv.ed.get('hooks', []) if g0 <= h['c'] <= g0 + 16]
        if alte:
            hr = min(h['r'] for h in alte) + 1; rad = alte[0].get('radius', 5.0)
            lv.ed['hooks'] = [h for h in lv.ed['hooks'] if h not in alte] + [{'c': g0 + d, 'r': hr, 'radius': rad} for d in (3, 8, 13)]
            info['haken'] = [(g0 + d, hr) for d in (3, 8, 13)]
        print(datei, x0, '->', neu_x0, info)
        rng = bereich
        T.datei_schieben(ROOT / 'tests' / 'run_tests.py', datei, rng)
        T.datei_schieben(ROOT / 'tests' / 'bausteine' / 'stellen.py', datei, rng, nur_zeilen=True)
        kurz = datei[0] + datei.split('/')[1][:2]; sp = ROOT / 'tests' / 'bausteine' / 'stellen.py'; t = sp.read_text(encoding='utf-8')
        sp.write_text(re.sub(r"\('" + kurz + r"', (\d+)\)", lambda m: f"('{kurz}', {T.neu(int(m.group(1)), rng)})", t), encoding='utf-8')
        for j in ('bildregel_ausnahmen.json', 'kombi_ausnahmen.json'): T.json_schieben(ROOT / 'tests' / j, datei, rng)
        kombi_eintrag(datei, neu_x0)
        for v in T.VERDAECHTIG: print('  NICHT verschoben (prüfen):', v)
        T.VERDAECHTIG.clear()
        log.append(dict(info, x0=x0, neu_x0=neu_x0, bereich=bereich))
    lv.merke(f'Kamin-Gruben auf 17 verbreitert: {xs}')
    L.speichern([lv])
    return log

if __name__ == '__main__':
    a = sys.argv[1:]; seite = a[a.index('--seite') + 1] if '--seite' in a else None
    mw = int(a[a.index('--max') + 1]) if '--max' in a else 60
    xs = [int(x) for i, x in enumerate(a[1:], 1) if x.isdigit() and a[i - 1] not in ('--seite', '--max')]
    print(json.dumps(umbauen(a[0], xs, mw, seite), ensure_ascii=False))
