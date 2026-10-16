# tests/kombi_pruefen.py – Prüfwerkzeug „Kombi-Nachschärfen“ (AUSBAU-REGELWERK Punkt 12):
#   Kamine   – zwei gegenüberliegende Wände (gleiche Reihen, mindestens WAND_MIN_HOEHE hoch, innen frei, unten Boden):
#              freie Breite und Höhe messen -> zu eng / bequem / knapp / Grenze / zu weit (Richtwerte in js/02-physik-werte.js)
#   Kombis   – Stellen, an denen eine Figur zwei verschiedene Fähigkeiten ohne Boden dazwischen braucht (automatisch
#              erkannt + von Hand eingetragen in tests/kombi_stellen.json), je Level und Etappe (200 Spalten) gezählt,
#              gegen die Mindestzahlen der Welt (KOMBI_MINDEST unten / Tabelle im Regelwerk)
# Näherung aus den Level-Daten, kein Spieltest. Was es NICHT erkennt, steht in WELTEN.md („Leveldesign“).
# Aufruf: python3 tests/kombi_pruefen.py [--level dschungel/01-dschungel.json] [--alle]
import json, math, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import bildregel_pruefen as B

ROOT = B.ROOT
_PHYS = (ROOT / 'js' / '02-physik-werte.js').read_text(encoding='utf-8')
def _wert(name):
    return float(re.search(r'\b' + name + r'\s*=\s*([\d.]+)', _PHYS).group(1))
KAMIN_ZU_ENG = int(_wert('KAMIN_ZU_ENG')); KAMIN_BEQUEM_MIN = int(_wert('KAMIN_BEQUEM_MIN')); KAMIN_BEQUEM_MAX = int(_wert('KAMIN_BEQUEM_MAX'))
KAMIN_KNAPP_MAX = int(_wert('KAMIN_KNAPP_MAX')); KAMIN_MAX = int(_wert('KAMIN_MAX')); WAND_MIN_HOEHE = int(_wert('WAND_MIN_HOEHE'))
KOMBI_ABSTAND = int(_wert('KOMBI_ABSTAND'))
WS_HAKEN = (int(_wert('WANDSPRUNG_HAKEN_ABSTAND_MIN')), int(_wert('WANDSPRUNG_HAKEN_ABSTAND_MAX')))
ETAPPE = 200          # Spalten je Etappe (Zählung)
KAMIN_SUCHE = 12      # so weit (Kästchen) wird nach der gegenüberliegenden Wand gesucht
GRUBE_MIN = 5         # so viele Spalten ohne Stehplatz = Lücke, über die man segeln muss

# Mindestzahlen je Welt (Level in Welt-Reihenfolge; Boss eigener Wert) – gleiche Tabelle im AUSBAU-REGELWERK
KOMBI_MINDEST = {
    'dschungel': {'level': [6, 8, 10, 10, 10, 10], 'boss': 3, 'etappe': [1, 2, 2, 2, 2, 2]},
    'ruinen':    {'level': [12] * 6, 'etappe': [3] * 6, 'timing_anteil': 1 / 3},
    'hoehle':    {'level': [12] * 6, 'etappe': [3] * 6, 'timing_anteil': 1 / 3},
    'vulkan':    {'level': [15] * 7, 'etappe': [3] * 7},
}
REF_SPALTEN = 800     # Mindestzahlen gelten für ~800 Spalten; kürzere Level anteilig (aufgerundet)

def welt_von(datei): return datei.split('/')[0]

def fest_kaestchen(d):
    return B.feste_kaestchen(d)

def kamine(d):
    """[{c (linke Wand), c2 (rechte Wand), breite, r0 (oberste Reihe), r1 (unterste), hoehe, art}]"""
    fest = fest_kaestchen(d)
    if not fest: return []
    hilfe = set()   # Kästchen mit anderer Kletterhilfe (Haken, Pilz, Aufwind, Steg, bewegte Plattform, Wasser)
    for h in d.get('hooks', []): hilfe.add((B.spalte(h['x']), B.reihe(h['y'])))
    for f in ('bouncers',):
        for o in d.get(f, []): hilfe.add((B.spalte(o['x']), B.reihe(o['y'])))
    for f in ('winds', 'oneways', 'movingPlatforms', 'waters'):
        for o in d.get(f, []): hilfe.update(B.felder_zellen(o))
    paare = {}
    rmin = min(r for c, r in fest); rmax = max(r for c, r in fest)
    for (c, r) in fest:
        if (c + 1, r) in fest: continue
        for w in range(1, KAMIN_SUCHE + 1):
            if (c + 1 + w, r) in fest:
                paare.setdefault((c, c + 1 + w), []).append(r); break
    out = []
    for (c, c2), rs in paare.items():
        rs = sorted(set(rs))
        # zusammenhängende Reihen = ein Abschnitt
        seg = [[rs[0]]]
        for r in rs[1:]:
            if r == seg[-1][-1] + 1: seg[-1].append(r)
            else: seg.append([r])
        for s in seg:
            r0, r1 = s[0], s[-1]
            h = r1 - r0 + 1
            if h < WAND_MIN_HOEHE: continue
            boden = any((cc, r1 + k) in fest for cc in range(c + 1, c2) for k in range(1, 5))   # Boden bis 4 Reihen unter dem Kamin (Einstieg unten offen)
            if not boden: continue                       # Grube zwischen zwei Rändern, kein Kamin
            innen = {(cc, rr) for cc in range(c + 1, c2) for rr in range(r0, r1 + 1)}
            if innen & hilfe: continue                   # Kletterhilfe drin -> kein reiner Wandsprung-Kamin
            if all((c - i, r0) in fest and (c2 + i, r0) in fest for i in (1, 2)): continue   # Spalt zwischen zwei Blöcken (man springt drüber)
            w = c2 - c - 1
            if w > KAMIN_MAX:
                decke = r0 <= rmin or all((cc, r0 - 1) in fest for cc in range(c + 1, c2))
                massiv = all((c - i, r1) in fest for i in (1, 2)) or all((c2 + i, r1) in fest for i in (1, 2))
                if decke or massiv: continue             # geschlossener Raum / Stufe neben einem Block – kein Kamin
            art = ('zu eng' if w <= KAMIN_ZU_ENG else 'bequem' if w <= KAMIN_BEQUEM_MAX else 'knapp' if w <= KAMIN_KNAPP_MAX
                   else 'Grenze' if w <= KAMIN_MAX else 'zu weit')
            out.append({'c': c, 'c2': c2, 'breite': w, 'r0': r0, 'r1': r1, 'hoehe': h, 'art': art})
    return sorted(out, key=lambda k: (k['c'], k['r0']))

def gruben(d):
    """Lücken ohne Stehplatz (Spalten-Bereiche ≥ GRUBE_MIN; Stachelboden zählt nicht), gemessen in der unteren Hälfte (Reihen 8–17)"""
    fest = fest_kaestchen(d) | {z for o in d.get('oneways', []) for z in B.felder_zellen(o)}
    cols = max([c for c, r in fest] + [0]) + 1
    stacheln = {(B.spalte(o['x']), B.reihe(o['y'])) for o in d.get('spikes', [])}
    # Stehplatz = festes Kästchen mit freiem Platz darüber (keine Stacheln); verschüttete Kästchen darunter zählen nicht
    fest = {(c, r) for c, r in fest if (c, r - 1) not in fest and (c, r - 1) not in stacheln and (c, r) not in stacheln}
    leer = [c for c in range(cols) if not any((c, r) in fest for r in range(8, 18))]
    out, start = [], None
    for c in range(cols + 1):
        if c in leer and start is None: start = c
        if (c not in leer) and start is not None:
            if c - start >= GRUBE_MIN: out.append((start, c - 1))
            start = None
    return out

def wandflaechen(d, min_h=4):
    """senkrechte Wandflächen (Spalte, Seite, r0, r1) – mindestens min_h Reihen hoch, davor frei"""
    fest = fest_kaestchen(d); out = []
    for seite in (-1, 1):
        lauf = {}
        for (c, r) in fest:
            if (c + seite, r) not in fest: lauf.setdefault(c, []).append(r)
        for c, rs in lauf.items():
            rs = sorted(rs); s0 = rs[0]; prev = rs[0]
            for r in rs[1:] + [None]:
                if r is None or r != prev + 1:
                    if prev - s0 + 1 >= min_h: out.append((c, seite, s0, prev))
                    if r is not None: s0 = r
                if r is not None: prev = r
    return out

def timing_naehe(d, c):
    """Fallen, Pressen, Bänder, bewegte Teile, Bröckelboden, Lava, Wechselboden im Takt in der Nähe -> Timing/Tempo"""
    for f in ('traps', 'pressen', 'baender', 'movingPlatforms', 'lava', 'boulders'):
        for o in d.get(f, []):
            if abs(B.spalte(o['x']) - c) <= KOMBI_ABSTAND: return True
    for s in d.get('solids', []):
        if s.get('type') == 'crumble' and abs(B.spalte(s['x']) - c) <= KOMBI_ABSTAND: return True
    for o in d.get('switchFloors', []):
        if o.get('takt') and abs(B.spalte(o['x']) - c) <= KOMBI_ABSTAND: return True
    return False

def kombis_auto(d):
    """automatisch erkannte Kombi-Kandidaten: [{spalte, art, wer}]"""
    out = []
    ks = [k for k in kamine(d) if k['art'] not in ('zu eng',)]
    hooks = [(B.spalte(h['x']), B.reihe(h['y'])) for h in d.get('hooks', [])]
    gr = gruben(d)
    winds = [z for o in d.get('winds', []) for z in B.felder_zellen(o)]
    pilze = [(B.spalte(o['x']), B.reihe(o['y'])) for o in d.get('bouncers', [])]
    flaechen = wandflaechen(d)
    for k in ks:
        mitte = (k['c'] + k['c2']) // 2
        # Wandsprung -> Haken: Haken über/neben dem Kamin-Ausgang
        if any(k['c'] - KOMBI_ABSTAND <= hc <= k['c2'] + KOMBI_ABSTAND and k['r0'] - 9 <= hr <= k['r1'] for hc, hr in hooks):
            out.append({'spalte': mitte, 'art': 'Wandsprung + Haken', 'wer': 'm'})
        # Wandsprung -> Segeln: Lücke neben dem Kamin
        if any(k['c'] - KOMBI_ABSTAND <= g1 and g0 <= k['c2'] + KOMBI_ABSTAND for g0, g1 in gr):
            out.append({'spalte': mitte, 'art': 'Wandsprung + Segeln', 'wer': 'f'})
    # Haken -> Kamin: Haken, von dem man in einen Kamin schwingt und dort per Wandsprung weiterklettert
    for hc, hr in hooks:
        for k in ks:
            if k['c'] - 6 <= hc <= k['c'] and k['r0'] - 2 <= hr + 4 and hr <= k['r1']:   # Haken VOR dem Kamin (Laufrichtung rechts)
                out.append({'spalte': hc, 'art': 'Haken + Wandsprung', 'wer': 'm'}); break
    # Aufwind -> Wandsprung (Schweinchen): Aufwind direkt an einer hohen Wand
    wcols = sorted({c for c, r in winds})
    for (c, seite, r0, r1) in flaechen:
        if any(abs(wc - (c + seite)) <= 1 and any(r0 <= wr <= r1 for cc, wr in winds if cc == wc) for wc in wcols):
            out.append({'spalte': c, 'art': 'Aufwind + Wandsprung', 'wer': 'f'})
    # Pilz -> Segeln / Pilz -> Wandsprung
    for pc, pr in pilze:
        if any(pc - KOMBI_ABSTAND <= g1 and g0 <= pc + KOMBI_ABSTAND for g0, g1 in gr):
            out.append({'spalte': pc, 'art': 'Pilz + Segeln', 'wer': 'f'})
        if any(abs(c - pc) <= 4 and r1 - r0 >= 4 for (c, s, r0, r1) in flaechen):
            out.append({'spalte': pc, 'art': 'Pilz + Wandsprung', 'wer': 'beide'})
        if any(abs(hc - pc) <= 7 and 3 <= pr - hr <= 11 for hc, hr in hooks):
            out.append({'spalte': pc, 'art': 'Pilz + Haken', 'wer': 'm'})
    out += kombis_neu(d, ks, hooks, gr, winds, pilze, flaechen)
    return out

def kombis_neu(d, ks, hooks, gr, winds, pilze, flaechen):
    """Nacht-Ausbau: Kombis mit den neuen Mechaniken (Dash, Durchbruch-Wand, Haftfläche), automatisch erkannt:
    Durchbruch (Gruppe) mit Haken / Kamin / Pilz / Aufwind / Grube davor oder dahinter in KOMBI_ABSTAND -> „X + Dash“;
    Haftfläche (Gruppe) mit Haken / Kamin / Pilz / Aufwind davor -> „X + Haftfläche“, mit Grube am Ende -> „Haftfläche + Dash“."""
    out = []
    A = KOMBI_ABSTAND
    def nah_kamin(c0, c1): return any(k['c'] - A <= c1 and c0 <= k['c2'] + A for k in ks)
    def nah_haken(c0, c1): return any(c0 - A <= hc <= c1 + A for hc, hr in hooks)
    def nah_pilz(c0, c1): return any(c0 - A <= pc <= c1 + A for pc, pr in pilze)
    def nah_wind(c0, c1): return any(c0 - A <= wc <= c1 + A for wc, wr in winds)
    def nah_grube(c0, c1, weite=A): return any(c0 - weite <= g1 and g0 <= c1 + weite for g0, g1 in gr)
    bruch = B.gruppen({z for o in d.get('bruchWaende', []) for z in B.felder_zellen(o)})
    for g in bruch:
        c0, c1 = g[0][0], g[-1][0]; m = (c0 + c1) // 2
        if nah_haken(c0, c1): out.append({'spalte': m, 'art': 'Haken + Dash (Durchbruch)', 'wer': 'm'})
        if nah_kamin(c0, c1): out.append({'spalte': m, 'art': 'Wandsprung + Dash (Durchbruch)', 'wer': 'beide'})
        if nah_pilz(c0, c1): out.append({'spalte': m, 'art': 'Pilz + Dash (Durchbruch)', 'wer': 'beide'})
        if nah_wind(c0, c1): out.append({'spalte': m, 'art': 'Aufwind + Dash (Durchbruch)', 'wer': 'f'})
        if nah_grube(c0, c1, 4): out.append({'spalte': m, 'art': 'Dash (Durchbruch) + Segeln/Sprung', 'wer': 'beide'})
    haft = B.gruppen({z for o in d.get('haftflaechen', []) for z in B.felder_zellen(o)})
    for g in haft:
        c0, c1 = min(c for c, r in g), max(c for c, r in g); m = (c0 + c1) // 2
        if nah_haken(c0, c1): out.append({'spalte': m, 'art': 'Haken + Haftfläche', 'wer': 'm'})
        if nah_kamin(c0, c1): out.append({'spalte': m, 'art': 'Wandsprung + Haftfläche', 'wer': 'beide'})
        if nah_pilz(c0, c1): out.append({'spalte': m, 'art': 'Pilz + Haftfläche', 'wer': 'beide'})
        if nah_wind(c0, c1): out.append({'spalte': m, 'art': 'Aufwind + Haftfläche', 'wer': 'f'})
        if any(c1 - 2 <= g0 <= c1 + 6 and g1 - g0 >= 4 for g0, g1 in gr): out.append({'spalte': c1, 'art': 'Haftfläche + Dash', 'wer': 'beide'})
    return out

def kombi_stellen_hand():
    p = ROOT / 'tests' / 'kombi_stellen.json'
    return json.loads(p.read_text(encoding='utf-8')) if p.exists() else []

def stellen(datei, d):
    """eigenständige Kombi-Stellen (auto + von Hand), zusammengefasst: Kandidaten näher als KOMBI_ABSTAND = eine Stelle"""
    kand = kombis_auto(d) + [dict(h, hand=True) for h in kombi_stellen_hand() if h['level'] == datei]
    kand.sort(key=lambda k: k['spalte'])
    out = []
    for k in kand:
        if out and k['spalte'] - out[-1]['bis'] <= KOMBI_ABSTAND:   # näher als KOMBI_ABSTAND = dieselbe Stelle (eine Kette zählt einmal)
            o = out[-1]; o['bis'] = max(o['bis'], k['spalte']); o['arten'].add(k['art']); o['wer'].add(k['wer']); o['hand'] |= bool(k.get('hand'))
        else:
            out.append({'von': k['spalte'], 'bis': k['spalte'], 'arten': {k['art']}, 'wer': {k['wer']}, 'hand': bool(k.get('hand'))})
    # Ketten (tests/kombi_ausnahmen.json, regel "Kette"): eine Stelle, die man vom erhöhten Landeplatz der Stelle davor ohne
    # neue Kombi erreicht, ist nicht eigenständig -> wird mit der vorigen Stelle zusammengezählt
    ketten = {a['spalte'] for a in ausnahmen() if a.get('level') == datei and a['regel'] == 'Kette'}
    zus = []
    for o in out:
        if zus and o['von'] in ketten:
            v = zus[-1]; v['bis'] = o['bis']; v['arten'] |= o['arten']; v['wer'] |= o['wer']; v['hand'] |= o['hand']; v['kette'] = True
        else: zus.append(o)
    out = zus
    for o in out:
        o['timing'] = timing_naehe(d, (o['von'] + o['bis']) // 2)
    return out

def mindest(datei, d):
    welt = welt_von(datei)
    m = KOMBI_MINDEST.get(welt)
    if not m: return None, None
    w = json.loads((ROOT / 'levels' / 'worlds.json').read_text(encoding='utf-8'))
    wl = next(x for x in w['welten'] if x['id'] == welt)
    cols = max(1, max([B.spalte(s['x'] + s.get('w', 40) - 1) for s in d.get('solids', [])] + [0]) + 1)
    if wl.get('boss') == datei: return m.get('boss'), m.get('boss')
    i = wl['level'].index(datei)
    faktor = min(1, cols / REF_SPALTEN)
    return math.ceil(m['level'][i] * faktor - 1e-9), m['etappe'][i]

def ausnahmen():
    p = ROOT / 'tests' / 'kombi_ausnahmen.json'
    return json.loads(p.read_text(encoding='utf-8')) if p.exists() else []

def pruefe_level(datei):
    d = B.lade(datei)
    ks = kamine(d)
    st = stellen(datei, d)
    m_lvl, m_et = mindest(datei, d)
    cols = max(1, max([B.spalte(s['x'] + s.get('w', 40) - 1) for s in d.get('solids', [])] + [0]) + 1)
    etappen = []
    for e0 in range(0, cols, ETAPPE):
        e1 = min(cols, e0 + ETAPPE) - 1
        if e1 - e0 < ETAPPE // 2 and etappen: etappen[-1][1] = e1; continue   # kurzer Rest gehört zur vorigen Etappe
        etappen.append([e0, e1])
    lage = lambda s: s['von'] if s.get('kette') else (s['von'] + s['bis']) // 2     # eine Kette zählt dort, wo sie beginnt
    pro_etappe = [sum(1 for s in st if e0 <= lage(s) <= e1) for e0, e1 in etappen]
    befunde = []
    for k in ks:
        if k['art'] in ('zu eng', 'zu weit'):
            befunde.append({'regel': 'Kamin', 'spalte': k['c'], 'text': f"Kamin {k['art']}: Breite {k['breite']}, Höhe {k['hoehe']} (Reihen {k['r0']}–{k['r1']})"})
    if m_lvl is not None and len(st) < m_lvl:
        befunde.append({'regel': 'Kombi-Level', 'spalte': None, 'text': f'nur {len(st)} Kombi-Stellen, Mindestzahl {m_lvl}'})
    if m_et is not None and '/boss-' not in datei:
        for (e0, e1), n in zip(etappen, pro_etappe):
            if n < m_et:
                befunde.append({'regel': 'Kombi-Etappe', 'spalte': e0, 'text': f'Etappe {e0}–{e1}: nur {n} Kombi-Stellen (mindestens {m_et})'})
    anteil = KOMBI_MINDEST.get(welt_von(datei), {}).get('timing_anteil')
    if anteil and st and sum(1 for s in st if s['timing']) < math.ceil(len(st) * anteil - 1e-9):
        befunde.append({'regel': 'Kombi-Timing', 'spalte': None, 'text': f"nur {sum(1 for s in st if s['timing'])} von {len(st)} Kombi-Stellen mit Timing/Tempo (mindestens {math.ceil(len(st) * anteil - 1e-9)})"})
    aus = ausnahmen()
    for b in befunde:
        b['ausnahme'] = any(a.get('level') == datei and a['regel'] == b['regel'] and a.get('spalte') == b['spalte'] for a in aus)
        # Welt noch nicht nachgeschärft (Eintrag {"welt", "regel": "Kombi-offen"}): Kombi-Befunde gelten als offen, Kamin-Befunde nicht
        if not b['ausnahme'] and b['regel'].startswith('Kombi-') and any(a.get('welt') == welt_von(datei) and a['regel'] == 'Kombi-offen' for a in aus):
            b['ausnahme'] = 'offen'
    return {'level': datei, 'kamine': ks, 'stellen': st, 'etappen': etappen, 'pro_etappe': pro_etappe, 'mindest': m_lvl, 'mindest_etappe': m_et, 'befunde': befunde}

def pruefe_alle(dateien=None):
    return [pruefe_level(d) for d in (dateien or B.welten_level())]

def main():
    args = sys.argv[1:]
    dateien = [args[args.index('--level') + 1]] if '--level' in args else None
    res = pruefe_alle(dateien)
    print('| Level | Kamine (eng/bequem/knapp/Grenze/weit) | Kombi-Stellen (mind.) | je Etappe | Timing | Befunde | noch offen |')
    print('|---|---|---|---|---|---|---|')
    for r in res:
        z = {a: sum(1 for k in r['kamine'] if k['art'] == a) for a in ('zu eng', 'bequem', 'knapp', 'Grenze', 'zu weit')}
        print(f"| {r['level']} | {z['zu eng']}/{z['bequem']}/{z['knapp']}/{z['Grenze']}/{z['zu weit']} | {len(r['stellen'])} ({r['mindest']}) | "
              f"{' '.join(map(str, r['pro_etappe']))} (mind. {r['mindest_etappe']}) | {sum(1 for s in r['stellen'] if s['timing'])} | "
              f"{sum(1 for b in r['befunde'] if not b['ausnahme'])} | {sum(1 for b in r['befunde'] if b['ausnahme'] == 'offen')} |")
    if '--alle' in args or dateien:
        for r in res:
            print(f"\n## {r['level']}")
            print('| Spalte | Breite | Höhe | Reihen | Einstufung |'); print('|---|---|---|---|---|')
            for k in r['kamine']: print(f"| {k['c']}–{k['c2']} | {k['breite']} | {k['hoehe']} | {k['r0']}–{k['r1']} | {k['art']} |")
            print('| Kombi-Stelle | Arten | wer | Timing | von Hand |'); print('|---|---|---|---|---|')
            for s in r['stellen']: print(f"| {s['von']}–{s['bis']} | {', '.join(sorted(s['arten']))} | {'/'.join(sorted(s['wer']))} | {'ja' if s['timing'] else ''} | {'ja' if s['hand'] else ''} |")
            for b in r['befunde']: print(f"- [{b['regel']}] {b['spalte']}: {b['text']}{' (noch offen)' if b['ausnahme'] == 'offen' else ' (Ausnahme)' if b['ausnahme'] else ''}")

if __name__ == '__main__':
    main()
