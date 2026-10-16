# tests/level_vermessen.py – Nacht-Ausbau Phase 2: Level-Vermesser (statisch, aus den Level-Daten + tests/reichweiten.json).
#   Gruben    – Lücken zwischen zwei Stehflächen, unter denen nichts Rettendes liegt: Breite (Kästchen), Höhenunterschied,
#               je Figur die einfachste Kombination, die reicht (alte Mittel: Sprung/Segeln; neue: + Dash), Anteil an
#               der Höchstweite, Erfolgsfenster (Schritte) und Einstufung komfortabel / knapp / Grenze / verboten.
#               „nur mit Hilfe“ = ohne Haken/Pilz/Aufwind/Plattform … nicht schaffbar (Level-Absicht).
#   Abkürzung – Grube, die früher NUR mit Hilfe ging und jetzt mit Dash ohne Hilfe geht -> Exploit-Kandidat.
#   Sperren   – Wände/Türen, die man hochklettern müsste (Kletterhöhe in Reihen): früher zu hoch (> Sprung), jetzt mit
#               Sprung+Dash nach oben machbar -> Exploit-Kandidat (vor allem Türen: über die geschlossene Tür hinweg).
#   Neue Elemente je Level (Durchbruch, Haftfläche), Checkpoint-Abstände (Nacht-Regel 40–60 Spalten).
# Näherung (keine Physik mit der echten Geometrie): Kopffreiheit, Decken über der Flugbahn und Kanten-Hüpfer zählen
# nicht. Kandidaten deshalb mit tests/stelle_pruefen.py (echte Physik im Level) bestätigen.
# Aufruf: python3 tests/level_vermessen.py [--level dschungel/01-dschungel.json] [--gruben] [--json]
import json, math, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import bildregel_pruefen as B

ROOT = B.ROOT
T = 40
RW = json.loads((ROOT / 'tests' / 'reichweiten.json').read_text(encoding='utf-8'))
ANTEIL = [(0.70, 'komfortabel'), (0.90, 'knapp'), (0.97, 'Grenze')]
FENSTER_MIN = 3
CP_NACHT = (40, 60)
GRUBE_MAX = 30          # breitere Lücken werden nicht gesucht
DY_MIN, DY_MAX = -8, 10

ALT = {'m': ['m:sprung'], 'f': ['f:sprung', 'f:sprung_segeln']}
NEU = {'m': ['m:sprung', 'm:boden_dash', 'm:sprung_dash', 'm:sprung_dash_hoch', 'm:sprung_dash_oben'],
       'f': ['f:sprung', 'f:sprung_segeln', 'f:boden_dash', 'f:sprung_dash', 'f:sprung_segeln_dash',
             'f:sprung_dash_hoch', 'f:sprung_segeln_dash_hoch']}

def tab(key, dy):
    t = RW[key]['tabelle']
    dy = max(DY_MIN, dy)
    return t.get(str(dy))

def max_weite(key, dy):
    e = tab(key, dy)
    return e['max'] if e else -1

def fenster(key, dy, g):
    e = tab(key, dy)
    if not e or g > e['max']: return 0
    q = math.ceil(g * 4 - 1e-9) / 4
    q = max(0.25, q)
    return e['fenster'].get(str(q)) or e['fenster'].get(f'{q:.2f}'.rstrip('0').rstrip('.')) or e['fenster'].get(str(float(q)), 0)

def einstufen(anteil, fen):
    if fen < FENSTER_MIN: return 'verboten'
    for g, n in ANTEIL:
        if anteil <= g + 1e-9: return n
    return 'verboten'

def bewerten(keys, g, dy):
    """einfachste Kombination aus keys, die Lücke g (Kästchen) bei Höhe dy schafft (am bequemsten eingestuft)"""
    best = None
    for k in keys:
        mx = max_weite(k, dy)
        if mx <= 0 or g > mx: continue
        a = g / mx; f = fenster(k, dy, g); kl = einstufen(a, f)
        rang = ['komfortabel', 'knapp', 'Grenze', 'verboten'].index(kl)
        if best is None or rang < best[0]: best = (rang, {'kombi': k.split(':')[1], 'anteil': round(a, 2), 'fenster': f, 'klasse': kl})
        if rang == 0: break
    return best[1] if best else None

def zellen_von(d, feld, typ=None):
    z = set()
    for o in d.get(feld, []):
        if typ and o.get('type') != typ: continue
        z.update(B.felder_zellen(o))
    return z

def tuer_zellen(d):
    z = set()
    for o in d.get('doors', []):
        w, h = o.get('w', T), o.get('h', T)
        z.update(B.felder_zellen({'x': o['x'] - w / 2, 'y': o['y'] - h / 2, 'w': w, 'h': h}))
    return z

def welt(d, datei): return d.get('welt') or datei.split('/')[0]

def vermessen(datei):
    d = B.lade(datei)
    fest = B.feste_kaestchen(d, stege=True) | tuer_zellen(d) | zellen_von(d, 'bruchWaende') | zellen_von(d, 'haftflaechen')
    for s in d.get('solids', []):
        if s.get('type') == 'door': fest.update(B.felder_zellen(s))
    gefahr = set()
    for sp in d.get('spikes', []): gefahr.add((B.spalte(sp['x']), B.reihe(sp['y'] - 1)))   # y = Unterkante
    gefahr |= zellen_von(d, 'lava')
    hilfe = set()   # Kästchen mit Hilfe (Haken-Umkreis grob, Pilz, Aufwind, bewegte Plattform, Teleporter, Wechselboden)
    for h in d.get('hooks', []):
        hc, hr = B.spalte(h['x']), B.reihe(h['y'])
        for dc in range(-5, 6):
            for dr in range(0, 8): hilfe.add((hc + dc, hr + dr))
    for o in d.get('bouncers', []): hilfe.add((B.spalte(o['x']), B.reihe(o['y'])))
    for f in ('winds', 'movingPlatforms', 'switchFloors', 'teleporters'):
        for o in d.get(f, []):
            if 'w' in o: hilfe.update(B.felder_zellen(o))
            else: hilfe.add((B.spalte(o['x']), B.reihe(o['y'])))
            if f == 'movingPlatforms' and 'targetX' in o:
                hilfe.update(B.felder_zellen({**o, 'x': o['targetX'], 'y': o.get('targetY', o['y'])}))
    breite = max(c for c, r in fest) + 1
    steh = set((c, r) for (c, r) in fest if (c, r - 1) not in fest and (c, r) not in gefahr and r > -4)
    # Stehflächen-Abschnitte je Reihe
    laeufe = []
    for r in sorted(set(r for c, r in steh)):
        cs = sorted(c for c, rr in steh if rr == r)
        i = 0
        while i < len(cs):
            j = i
            while j + 1 < len(cs) and cs[j + 1] == cs[j] + 1: j += 1
            laeufe.append((cs[i], cs[j], r)); i = j + 1
    steh_spalte = {}
    for c, r in steh: steh_spalte.setdefault(c, []).append(r)
    gruben = []
    for (a0, a1, ra) in laeufe:
        kand = []
        for (b0, b1, rb) in laeufe:
            g = b0 - a1 - 1
            if g < 1 or g > GRUBE_MAX: continue
            dy = ra - rb
            if dy < DY_MIN or dy > DY_MAX: continue
            # Grube: dazwischen keine Stehfläche, die man von A aus „unten herum“ erreichen könnte (bis 4 Reihen tiefer)
            tief = max(ra, rb) + 4
            if any(r <= tief and r >= min(ra, rb) - 2 for c in range(a1 + 1, b0) for r in steh_spalte.get(c, [])): continue
            kand.append((g, abs(dy), b0, b1, rb))
        if not kand: continue
        g, _, b0, b1, rb = min(kand)
        dy = ra - rb
        mit_hilfe = any((c, r) in hilfe for c in range(a1, b0 + 1) for r in range(min(ra, rb) - 8, max(ra, rb) + 2))
        e = {'von': a1, 'nach': b0, 'reihe': ra, 'dy': dy, 'breite': g, 'hilfe': mit_hilfe}
        for wer in 'mf':
            e['alt_' + wer] = bewerten(ALT[wer], g, dy)
            e['neu_' + wer] = bewerten(NEU[wer], g, dy)
        e['abkuerzung'] = mit_hilfe and any(e['alt_' + w] is None and e['neu_' + w] is not None for w in 'mf')
        # Rollen-Abkürzung: früher schaffte nur EINE Figur die Lücke (Koop-Absicht), jetzt mit Dash auch die andere
        e['rolle'] = [w for w, o in (('m', 'f'), ('f', 'm')) if e['alt_' + w] is None and e['alt_' + o] is not None and e['neu_' + w] is not None]
        gruben.append(e)
    # Sperren: Kletterhöhe an Wänden/Türen (Lauf in Reihe r stößt rechts an eine Wand; frei erst h Reihen höher)
    sperren = []
    tueren = tuer_zellen(d) | set(z for s in d.get('solids', []) if s.get('type') == 'door' for z in B.felder_zellen(s))
    def klettern_max(keys):
        m = 0
        for k in keys:
            for dy in range(DY_MAX, 0, -1):
                if max_weite(k, dy) > 0: m = max(m, dy); break
        return m
    for (a0, a1, ra) in laeufe:
        c = a1 + 1
        if (c, ra - 1) not in fest: continue   # vorne keine Wand
        h = 1
        while (c, ra - 1 - h) in fest and h < 20: h += 1
        if ra - 1 - h < -3: continue           # bis zur Decke zu: unüberwindbar
        tuer = any((c, r) in tueren for r in range(ra - h, ra))
        kamin = any((cc, r) in fest for cc in range(c - 5, c - 1) for r in range(ra - h, ra - 1))
        e = {'spalte': c, 'reihe': ra, 'hoehe': h, 'tuer': tuer, 'kamin': kamin}
        for wer in 'mf':
            e['alt_' + wer] = h <= klettern_max(ALT[wer])
            e['neu_' + wer] = h <= klettern_max(NEU[wer])
        e['neu_ueberwindbar'] = any(not e['alt_' + w] and e['neu_' + w] for w in 'mf') and not kamin
        sperren.append(e)
    # Türen: über die geschlossene Tür hinweg? (Tür-Spalten samt Wand darüber bis zur ersten Lücke)
    tuer_check = []
    for grp in B.gruppen(tueren):
        cs = sorted(set(c for c, r in grp)); rs = sorted(set(r for c, r in grp))
        unten = max(rs)
        boden = unten + 1 if any((c, unten + 1) in fest for c in cs) else None
        frei = None
        for r in range(min(rs) - 1, -4, -1):
            if all((c, r) not in fest for c in cs): frei = r; break
        if frei is None: tuer_check.append({'spalte': cs[0], 'reihe': unten, 'zu': True}); continue
        h = (boden if boden is not None else unten + 1) - frei - 1   # so hoch muss man (Reihen über dem Boden)
        e = {'spalte': cs[0], 'reihe': unten, 'zu': False, 'hoehe': h}
        for wer in 'mf':
            e['alt_' + wer] = h <= klettern_max(ALT[wer]); e['neu_' + wer] = h <= klettern_max(NEU[wer])
        tuer_check.append(e)
    # neue Elemente und Checkpoints
    bruch = len(d.get('bruchWaende', []))
    haft = len(B.gruppen(zellen_von(d, 'haftflaechen')))
    cps = sorted(B.spalte(c['x']) for c in d.get('checkpoints', []))
    start = B.spalte(min(d['startM']['x'], d['startF']['x']))
    ziel = B.spalte(d['goal']['x']) if d.get('goal') else breite
    abst = []; vor = start
    for c in cps + [ziel]: abst.append(c - vor); vor = c
    cp_warn = [f'Abstand {a} (vor {"Ziel" if i == len(cps) else "Checkpoint " + str(i + 1)})'
               for i, a in enumerate(abst) if (a < CP_NACHT[0] and i > 0 and i < len(cps)) or a > CP_NACHT[1]]
    muenzen = {}
    for m in d.get('coins', []): muenzen[m.get('klasse', '—')] = muenzen.get(m.get('klasse', '—'), 0) + 1
    return {'datei': datei, 'welt': welt(d, datei), 'breite': breite, 'gruben': gruben, 'sperren': sperren, 'tueren': tuer_check,
            'bruch_kaestchen': bruch, 'bruch_gruppen': len(B.gruppen(zellen_von(d, 'bruchWaende'))), 'haft_gruppen': haft,
            'checkpoints': cps, 'cp_abstaende': abst, 'cp_warn': cp_warn, 'muenzen': muenzen}

def kurz(b):
    if not b: return 'nur mit Hilfe'
    return f"{b['kombi']} {int(b['anteil'] * 100)}% F{b['fenster']} {b['klasse']}"

def drucken(e, gruben=False):
    print(f"\n== {e['datei']} ({e['breite']} Spalten)")
    k = {}
    for g in e['gruben']:
        for w in 'mf':
            n = g['neu_' + w]; kl = n['klasse'] if n else 'Hilfe'
            k[(w, kl)] = k.get((w, kl), 0) + 1
    print('  Gruben:', len(e['gruben']), '| Affe:', {kl: v for (w, kl), v in k.items() if w == 'm'},
          '| Schwein:', {kl: v for (w, kl), v in k.items() if w == 'f'})
    ab = [g for g in e['gruben'] if g['abkuerzung']]
    print(f'  Abkürzungs-Kandidaten (früher nur mit Hilfe, jetzt mit Dash): {len(ab)}')
    for g in ab:
        print(f"    Spalte {g['von']}→{g['nach']} Reihe {g['reihe']} dy {g['dy']:+d} Breite {g['breite']}: "
              f"Affe {kurz(g['neu_m'])} | Schwein {kurz(g['neu_f'])}")
    sp = [s for s in e['sperren'] if s['neu_ueberwindbar']]
    print(f'  Sperren jetzt überwindbar (Wand/Tür, Sprung+Dash): {len(sp)}  (davon Türen: {sum(1 for s in sp if s["tuer"])})')
    for s in sp:
        print(f"    Spalte {s['spalte']} Reihe {s['reihe']} Höhe {s['hoehe']}{' TÜR' if s['tuer'] else ''}")
    ro = [g for g in e['gruben'] if g['rolle']]
    print(f'  Rollen-Abkürzungen (früher nur eine Figur, jetzt mit Dash beide): {len(ro)}')
    for g in ro:
        print(f"    Spalte {g['von']}→{g['nach']} Reihe {g['reihe']} dy {g['dy']:+d} Breite {g['breite']}: jetzt auch "
              + ', '.join('Affe ' + kurz(g['neu_m']) if w == 'm' else 'Schwein ' + kurz(g['neu_f']) for w in g['rolle']))
    tu = [t for t in e['tueren'] if not t['zu']]
    print(f"  Türen: {len(e['tueren'])}, oben offen: {len(tu)}" + ''.join(
        f"\n    Tür Spalte {t['spalte']} Reihe {t['reihe']}: drüber {t['hoehe']} Reihen – alt {'JA' if t['alt_m'] or t['alt_f'] else 'nein'}, "
        f"neu {'JA (Exploit!)' if (t['neu_m'] or t['neu_f']) and not (t['alt_m'] or t['alt_f']) else ('ja' if t['neu_m'] or t['neu_f'] else 'nein')}" for t in tu))
    print(f"  Durchbruch: {e['bruch_kaestchen']} Kästchen in {e['bruch_gruppen']} Stellen · Haftflächen: {e['haft_gruppen']}")
    print(f"  Checkpoints: {e['checkpoints']} Abstände {e['cp_abstaende']} {('⚠ ' + '; '.join(e['cp_warn'])) if e['cp_warn'] else 'ok'}")
    print(f"  Münzen nach Klasse: {e['muenzen']}")
    if gruben:
        for g in e['gruben']:
            print(f"    Grube {g['von']}→{g['nach']} r{g['reihe']} dy{g['dy']:+d} b{g['breite']}{' (Hilfe)' if g['hilfe'] else ''}: "
                  f"Affe alt {kurz(g['alt_m'])} / neu {kurz(g['neu_m'])} · Schwein alt {kurz(g['alt_f'])} / neu {kurz(g['neu_f'])}")

if __name__ == '__main__':
    args = sys.argv[1:]
    if '--level' in args: dateien = [args[args.index('--level') + 1]]
    else: dateien = [l for l in B.welten_level() if 'boss' not in l and not l.startswith('wasser')]
    alle = [vermessen(f) for f in dateien]
    if '--json' in args: print(json.dumps(alle, ensure_ascii=False, indent=1))
    else:
        for e in alle: drucken(e, '--gruben' in args)
