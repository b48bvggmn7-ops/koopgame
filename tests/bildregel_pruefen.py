# tests/bildregel_pruefen.py – Prüfwerkzeug für die Leveldesign-Regeln (AUSBAU-REGELWERK.md Punkt 12):
#   Bild      – Auslöser (Hebel, Druckplatte, Licht-Kristall) und alles, was sie auslösen (Tür, Wechselboden,
#               Plattform, Falle, Fels, Tor, Band, Lava, Presse …), liegen höchstens BILD_MAX_SPALTEN auseinander
#   Plattform – bewegte Plattformen / fahrende Haken / Ein-Figur-Tore fahren niemanden weiter als BILD_MAX_SPALTEN
#               vom Partner weg (Partner bleibt am Einstieg bzw. am Hebel)
#   Haken     – Hakenreihen: Abstand, Höhe über dem Absprung, freier Schwungbogen, Landefläche (Richtwerte unten)
#   Checkpoint– Abstand zum vorigen (nicht unter CP_MIN, nicht über CP_MAX) und eine „Stelle“ dazwischen
# Näherung, kein Spieltest: Abstände werden waagerecht in Spalten gemessen (die Höhe ist immer ganz im Bild).
# Aufruf:  python3 tests/bildregel_pruefen.py [--alle] [--level dschungel/05-dornenpfad.json] [--json]
#   ohne --alle: nur Verstöße/Warnungen;  Ausnahmen (begründet) stehen in tests/bildregel_ausnahmen.json
import json, math, re, sys
from pathlib import Path

import os
ROOT = Path(os.environ.get('BILDREGEL_ROOT') or Path(__file__).resolve().parent.parent)   # BILDREGEL_ROOT: anderer Stand (Vorher-Vergleich)
T = 40
# zentraler Wert aus der Kamera (js/09-kamera.js), nicht hier doppelt pflegen
BILD_MAX_SPALTEN = int(re.search(r'const BILD_MAX_SPALTEN = (\d+)', (ROOT / 'js' / '09-kamera.js').read_text(encoding='utf-8')).group(1))
# Haken-Richtwerte (Koop-Bot-Messung, siehe WELTEN.md „Leveldesign“): Abstand in einer Reihe 5–7 Spalten
HAKEN_ABSTAND_MIN, HAKEN_ABSTAND_MAX = 4, 8        # außerhalb -> Warnung (zu eng / zu weit)
HAKEN_HOEHE_MIN, HAKEN_HOEHE_MAX = 4, 8            # Reihen zwischen Absprung-Boden (Oberkante) und Haken
HAKEN_REIHE_LUECKE = 10                            # weiter auseinander = neue Reihe
LANDUNG_MIN = 3                                    # so viele Stehplätze braucht die Landung (2–10 Spalten hinter dem letzten Haken)
CP_MIN, CP_MAX = 25, 70                            # Checkpoint-Abstände (Spalten)
KLETTER_REIHEN = 4                                 # so hoch (Reihen) muss eine Wand sein, damit Hochklettern als „Stelle“ zählt

def spalte(x): return int(math.floor(x / T))
def reihe(y): return int(math.floor(y / T))

def welten_level():
    w = json.loads((ROOT / 'levels' / 'worlds.json').read_text(encoding='utf-8'))
    out = []
    for welt in sorted(w['welten'], key=lambda x: x['reihenfolge']):
        for d in welt['level']: out.append(d)
        if welt.get('boss'): out.append(welt['boss'])
    return out

def lade(datei): return json.loads((ROOT / 'levels' / datei).read_text(encoding='utf-8'))

def felder_zellen(o):
    """Kästchen eines Rechtecks (x,y,w,h)"""
    w, h = o.get('w', T), o.get('h', T)
    return [(spalte(o['x']) + i, reihe(o['y']) + j) for i in range(max(1, round(w / T))) for j in range(max(1, round(h / T)))]

def gruppen(zellen):
    """zusammenhängende Kästchen-Gruppen (waagerecht/senkrecht benachbart) -> Liste von Listen"""
    rest = set(zellen); out = []
    while rest:
        st = [rest.pop()]; g = []
        while st:
            c = st.pop(); g.append(c)
            for n in ((c[0]+1, c[1]), (c[0]-1, c[1]), (c[0], c[1]+1), (c[0], c[1]-1)):
                if n in rest: rest.remove(n); st.append(n)
        out.append(sorted(g))
    return out

def ausloeser(d):
    a = []
    for s in d.get('switches', []): a.append(('Hebel', s['link'], spalte(s['x']), reihe(s['y'])))
    for s in d.get('plates', []): a.append(('Platte', s['link'], spalte(s['x']), reihe(s['y'])))
    for s in d.get('kristalle', []): a.append(('Kristall', s['link'], spalte(s['x']), reihe(s['y'])))
    return a

def plattform_gruppen(d):
    pl = {}
    for o in d.get('movingPlatforms', []):
        pl.setdefault((o.get('group') if o.get('group') is not None else ('x', o['x'], o['y']), o.get('switchLink')), []).append(o)
    return pl

def mit_stacheln(d, teile):
    """Stacheln, die am Startplatz eines bewegten Teils kleben (fahren mit) -> Stachelwand/-presse"""
    zellen = set(c for p in teile for c in felder_zellen(p))
    for sp in d.get('spikes', []):
        c, r = spalte(sp['x']), reihe(sp['y'])
        if any((c + dc, r + dr) in zellen for dc, dr in ((1, 0), (-1, 0), (0, 1), (0, -1))): return True
    return False

def ziele(d):
    """(Art, Nummer, Spalte von, Spalte bis, Reihe) – Gruppen gleicher Art/Nummer zusammengefasst"""
    z = []
    def grp(art, liste, key='link'):
        by = {}
        for o in liste:
            n = o.get(key)
            if not n: continue
            by.setdefault(n, []).extend(felder_zellen(o))
        for n, zl in by.items():
            for g in gruppen(zl):
                cs = [c for c, r in g]; z.append((art, n, min(cs), max(cs), min(r for c, r in g)))
    grp('Tür', d.get('doors', []))
    grp('Wechselboden', d.get('switchFloors', []))
    grp('Band', d.get('baender', []))
    for o in d.get('traps', []):
        if o.get('link'): z.append(('Falle', o['link'], spalte(o['x']), spalte(o['x']), reihe(o['y'])))
    for o in d.get('boulders', []):
        if o.get('link'): z.append(('Fels', o['link'], spalte(o['x']), spalte(o['x']), reihe(o['y'])))
    for o in d.get('teleporters', []):
        if o.get('link'): z.append(('Tor', o['link'], spalte(o['x']), spalte(o['x']), reihe(o['y'])))
    for o in d.get('leuchtkristalle', []):
        if o.get('link'): z.append(('Leuchtkristall', o['link'], spalte(o['x']), spalte(o['x']), reihe(o['y'])))
    for o in d.get('lavaPegel', []):
        if o.get('link'): z.append(('Lava', o['link'], spalte(o['x']), spalte(o['x']), reihe(o['y'])))
    for o in d.get('pressen', []):
        if o.get('link'): z.append(('Presse', o['link'], spalte(o['x']), spalte(o['x']) + o.get('breite', 1) - 1, reihe(o['y'])))
    # bewegte Plattformen (Gruppe = ein Teil), fahrende Haken, Stachelwände/-pressen: der Startplatz (die Fahrt prüft plattform_pruefen)
    for (gid, n), teile in plattform_gruppen(d).items():
        if not n: continue
        if mit_stacheln(d, teile):
            xs = [p['x'] for p in teile] + [p['x'] + p['w'] - T for p in teile]
            z.append(('Stachelwand', n, spalte(min(xs)), spalte(max(xs)), reihe(min(p['y'] for p in teile))))
            continue
        xs = [p['x'] for p in teile] + [p['x'] + p['w'] - T for p in teile]
        z.append(('Plattform', n, spalte(min(xs)), spalte(max(xs)), reihe(min(p['y'] for p in teile))))
    for o in d.get('hooks', []):
        if o.get('switchLink'):
            z.append(('fahrender Haken', o['switchLink'], spalte(o['x']), spalte(o['x']), reihe(o['y'])))
    return z

PASSAGE_RUECKWEG = 5     # bis zu so vielen Spalten zurück zum Hebel sind nach einem Tod in Ordnung
NAH_ZIELE = ('Band', 'Wechselboden', 'Lava', 'Stachelwand')
def bild_pruefen(d):
    """je Ziel-Gruppe: Abstand zum NÄCHSTEN Auslöser derselben Nummer (bis zum fernsten Kästchen des Ziels);
    außerdem jedes Paar Auslöser–Ziel für die Tabelle"""
    a, z = ausloeser(d), ziele(d)
    zeilen = []
    for (art, n, c0, c1, r) in z:
        kandid = [x for x in a if x[1] == n]
        if not kandid: continue
        best = None
        for (aa, an, ac, ar) in kandid:
            # lange Ziele (Band, Wechselboden-Brücke, Lava-Becken): es reicht, einen Teil zu sehen -> nächstes Kästchen;
            # Plattform/fahrender Haken: der Startplatz (dort sieht man das Losfahren; die Fahrt prüft die Plattform-Regel)
            if art in NAH_ZIELE: dist = 0 if c0 <= ac <= c1 else min(abs(ac - c0), abs(ac - c1))
            else: dist = max(abs(ac - c0), abs(ac - c1))
            zeilen.append({'nummer': n, 'ausloeser': f'{aa} ({ac},{ar})', 'ziel': f'{art} ({c0}' + (f'–{c1}' if c1 != c0 else '') + f',{r})',
                           'abstand': dist, 'spalte': ac})
            if best is None or dist < best[0]: best = (dist, aa, ac, ar)
        # Verstoß nur, wenn auch der nächste Auslöser zu weit weg ist
        for zl in zeilen[-len(kandid):]: zl['ok_gruppe'] = best[0] <= BILD_MAX_SPALTEN; zl['bester'] = best[0]
    verstoesse = []
    gesehen = set()
    for zl in zeilen:
        if not zl['ok_gruppe']:
            key = (zl['nummer'], zl['ziel'])
            if key in gesehen: continue
            gesehen.add(key)
            verstoesse.append({'regel': 'Bild', 'nummer': zl['nummer'], 'spalte': zl['spalte'], 'text': f"Nummer {zl['nummer']}: {zl['ziel']} ist {zl['bester']} Spalten vom nächsten Auslöser entfernt"})
    # Passage: liegt ein Checkpoint zwischen Auslöser und Ziel, steht man nach einem Tod hinter dem Hebel (alles ist
    # wieder aus) und muss zurück – der Auslöser liegt dann „weit hinter dem Start der Passage“
    cps = sorted(spalte(c['x']) for c in d.get('checkpoints', []))
    for (art, n, c0, c1, r) in z:
        ac = [x[2] for x in a if x[1] == n]
        if not ac: continue
        for cp in cps:
            if max(ac) + PASSAGE_RUECKWEG < cp < c0:
                verstoesse.append({'regel': 'Bild', 'nummer': n, 'spalte': max(ac), 'text': f"Nummer {n}: Checkpoint {cp} liegt zwischen Auslöser ({max(ac)}) und {art} ({c0}) – nach einem Tod steht man hinter dem Hebel"})
                break
    return zeilen, verstoesse

def plattform_pruefen(d):
    """bewegte Plattformen und fahrende Haken: Strecke (Spalten); Partner bleibt am Einstieg (bzw. am nächsten Hebel)
    -> größter Abstand; Ein-Figur-Tore: Abstand der beiden Tore"""
    out, verst = [], []
    trig = ausloeser(d)
    def bewertung(art, n, sx, ex, r):
        strecke = abs(ex - sx)
        partner = [x[2] for x in trig if n and x[1] == n]
        # Partner bleibt am Einstieg ODER (wenn ein Hebel sie startet) am Hebel – der ungünstigere Fall zählt
        weit = max([strecke] + [max(abs(p - sx), abs(p - ex)) for p in partner]) if partner else strecke
        zeile = {'art': art, 'nummer': n, 'von': sx, 'bis': ex, 'reihe': r, 'strecke': strecke, 'abstand': weit}
        out.append(zeile)
        if weit > BILD_MAX_SPALTEN:
            verst.append({'regel': 'Plattform', 'nummer': n, 'spalte': sx, 'text': f'{art} ({sx}→{ex}, Reihe {r}): bis {weit} Spalten vom Partner weg'})
    for (gid, n), teile in plattform_gruppen(d).items():
        if mit_stacheln(d, teile): continue   # Stachelwand/-presse trägt niemanden
        sx = spalte(min(p['x'] for p in teile)); ex = spalte(min(p['targetX'] for p in teile))
        if sx == ex: continue   # fährt nur senkrecht
        bewertung('Plattform', n, sx, ex, reihe(min(p['y'] for p in teile)))
    for o in d.get('hooks', []):
        if 'targetX' in o and spalte(o['targetX']) != spalte(o['x']):
            bewertung('fahrender Haken', o.get('switchLink'), spalte(o['x']), spalte(o['targetX']), reihe(o['y']))
    paare = {}
    for t in d.get('teleporters', []): paare.setdefault(t['paar'], []).append(t)
    for p, ts in paare.items():
        if len(ts) == 2 and ts[0].get('fuer', 'beide') != 'beide':
            sx, ex = spalte(ts[0]['x']), spalte(ts[1]['x'])
            strecke = abs(ex - sx)
            out.append({'art': f"Tor ({ts[0]['fuer']})", 'nummer': p, 'von': sx, 'bis': ex, 'reihe': reihe(ts[1]['y']), 'strecke': strecke, 'abstand': strecke})
            if strecke > BILD_MAX_SPALTEN:
                verst.append({'regel': 'Plattform', 'nummer': p, 'spalte': sx, 'text': f"Tor {p} nur für {ts[0]['fuer']} ({sx}↔{ex}): {strecke} Spalten"})
    return out, verst

def feste_kaestchen(d, stege=False):
    fest = set()
    for s in d.get('solids', []):
        if s.get('type') in ('ground', 'wall', 'crumble', 'platform'):
            fest.update(felder_zellen(s))
    if stege:
        for o in d.get('oneways', []): fest.update(felder_zellen(o))
    return fest

def steh_reihe(fest, c, ab_reihe):
    """oberste feste Reihe in Spalte c unterhalb von ab_reihe (Oberkante eines Bodens), sonst None"""
    for r in range(ab_reihe + 1, 18):
        if (c, r) in fest and (c, r - 1) not in fest: return r
    return None

def haken_pruefen(d):
    fest = feste_kaestchen(d)
    steh = feste_kaestchen(d, stege=True)
    hs = sorted([(spalte(h['x']), reihe(h['y']), h) for h in d.get('hooks', []) if 'targetX' not in h], key=lambda t: t[0])
    hilfe = [spalte(b['x']) for b in d.get('bouncers', [])] + [c for w in d.get('winds', []) for c, r in felder_zellen(w)]
    reihen, akt = [], []
    for h in hs:
        if akt and (h[0] - akt[-1][0] > HAKEN_REIHE_LUECKE or abs(h[1] - akt[-1][1]) > 3): reihen.append(akt); akt = []
        akt.append(h)
    if akt: reihen.append(akt)
    warn, zeilen = [], []
    for rh in reihen:
        c0, r0 = rh[0][0], rh[0][1]
        # Absprung: der höchste Stehplatz links vor dem ersten Haken (bis 8 Spalten davor, unterhalb des Hakens)
        kand = [(steh_reihe(steh, c, r0), -c) for c in range(c0 - 8, c0)]
        kand = [(sr, -c) for sr, c in kand if sr is not None]
        abspr = min(kand) if kand else None
        hoehe = (abspr[0] - r0) if abspr else None
        abst = [b[0] - a[0] for a, b in zip(rh, rh[1:])]
        z = {'von': c0, 'bis': rh[-1][0], 'anzahl': len(rh), 'reihe': r0, 'abstaende': abst, 'hoehe': hoehe, 'warnungen': []}
        for a, b in zip(rh, rh[1:]):
            s_ = b[0] - a[0]
            # größere Reichweite erlaubt weitere Abstände (Messung mit Radius 180 = 4,5 Kästchen -> höchstens 8)
            weit_max = max(HAKEN_ABSTAND_MAX, int(1.8 * min(a[2].get('radius', 260), b[2].get('radius', 260)) / T))
            if s_ < HAKEN_ABSTAND_MIN: z['warnungen'].append(f'zu eng ({a[0]}→{b[0]}: {s_} Spalten)')
            if s_ > weit_max: z['warnungen'].append(f'zu weit ({a[0]}→{b[0]}: {s_} Spalten)')
        hilft = any(abs(x - c0) <= 8 for x in hilfe)   # Pilz/Aufwind im Anlauf-Bereich: die Höhe kommt von dort
        # Höhe nur für Schwung-Reihen (ab 2 Haken); ein einzelner Haken ist meist eine Kletterhilfe an einer Kante
        if len(rh) > 1 and hoehe is not None and not hilft and not (HAKEN_HOEHE_MIN <= hoehe <= HAKEN_HOEHE_MAX):
            z['warnungen'].append(f'Höhe {hoehe} Reihen über dem Absprung ({abspr[1]})')
        breit = 2 if len(rh) > 1 else 1
        for i, (c, r, h) in enumerate(rh):
            # beim letzten Haken einer Reihe ist Stein rechts davon meist die Landekante (Hochziehen) -> nur links/mittig prüfen
            rechts = c if (len(rh) > 1 and i == len(rh) - 1) else c + breit
            block = [(cc, rr) for cc in range(c - breit, rechts + 1) for rr in range(r + 1, r + 4) if (cc, rr) in fest]
            if block: z['warnungen'].append(f'Bogen blockiert bei Haken {c} (Stein bei {block[0][0]},{block[0][1]})')
        if len(rh) > 1:
            # Landung einer Schwungreihe: Stehplätze 2–10 Spalten hinter dem letzten Haken (unterhalb der Hakenreihe)
            cl, rl = rh[-1][0], rh[-1][1]
            n = [c for c in range(cl + 2, cl + 11) if steh_reihe(steh, c, rl) is not None]
            if len(n) < LANDUNG_MIN: z['warnungen'].append(f'Landung zu knapp hinter Haken {cl} ({len(n)} Stehplätze)')
        zeilen.append(z)
        for w in z['warnungen']: warn.append({'regel': 'Haken', 'nummer': None, 'spalte': c0, 'text': f'Hakenreihe {c0}–{rh[-1][0]}: {w}'})
    return zeilen, warn

STELLEN_FELDER = ('switches', 'plates', 'traps', 'boulders', 'spikes', 'hooks', 'movingPlatforms', 'switchFloors', 'teleporters',
                  'bouncers', 'winds', 'lava', 'pressen', 'eis', 'baender', 'leuchtkristalle', 'kristalle', 'spiegel', 'doors', 'boss')
def checkpoints_pruefen(d):
    cps = sorted(spalte(c['x']) for c in d.get('checkpoints', []))
    start = spalte(min(d['startM']['x'], d['startF']['x'])) if d.get('startM') else 0
    ziel = spalte(d['goal']['x']) if d.get('goal') else None
    stellen = set()
    for f in STELLEN_FELDER:
        for o in d.get(f, []):
            if isinstance(o, dict) and 'x' in o:
                for (c, r) in felder_zellen(o) if 'w' in o else [(spalte(o['x']), 0)]: stellen.add(c)
    for s in d.get('solids', []):
        if s.get('type') in ('crumble', 'fake'): stellen.update(c for c, r in felder_zellen(s))
    # Gruben (Spalten ohne Boden) zählen auch als Stelle (Sprung)
    fest = feste_kaestchen(d)
    breite = spalte(max([s['x'] + s.get('w', T) for s in d.get('solids', [])] + [0]))
    for c in range(breite):
        if not any((c, r) in fest for r in range(0, 18)): stellen.add(c)
    # Kletterstelle (Kamin/Wandsprung): die oberste Stein-Kante steigt um mindestens 4 Reihen
    oben = {c: min([r for r in range(-3, 18) if (c, r) in fest] or [99]) for c in range(breite + 1)}
    for c in range(breite):
        if oben[c] - oben[c + 1] >= KLETTER_REIHEN and oben[c] != 99: stellen.add(c + 1)
    zeilen, warn = [], []
    vor = start
    for i, c in enumerate(cps):
        ab = c - vor
        zw = [s for s in stellen if vor < s <= c]
        z = {'nr': i + 1, 'spalte': c, 'abstand': ab, 'stelle': bool(zw)}
        zeilen.append(z)
        if i > 0 and ab < CP_MIN: warn.append({'regel': 'Checkpoint', 'nummer': i + 1, 'spalte': c, 'text': f'Checkpoint {i+1} ({c}) nur {ab} Spalten nach dem vorigen'})
        elif not zw: warn.append({'regel': 'Checkpoint', 'nummer': i + 1, 'spalte': c, 'text': f'Checkpoint {i+1} ({c}): seit dem vorigen keine Stelle'})
        if ab > CP_MAX: warn.append({'regel': 'Checkpoint', 'nummer': i + 1, 'spalte': c, 'text': f'Checkpoint {i+1} ({c}): {ab} Spalten Lücke davor'})
        vor = c
    if ziel is not None and ziel - vor > CP_MAX:
        warn.append({'regel': 'Checkpoint', 'nummer': None, 'spalte': ziel, 'text': f'Ziel ({ziel}): {ziel - vor} Spalten nach dem letzten Checkpoint'})
    return zeilen, warn

def ausnahmen():
    p = ROOT / 'tests' / 'bildregel_ausnahmen.json'
    return json.loads(p.read_text(encoding='utf-8'))['ausnahmen'] if p.exists() else []

def ist_ausnahme(datei, v, aus):
    return any(a['level'] == datei and a['regel'] == v['regel'] and a.get('spalte') == v['spalte'] for a in aus)

def pruefe_level(datei):
    d = lade(datei)
    bz, bv = bild_pruefen(d)
    pz, pv = plattform_pruefen(d)
    hz, hv = haken_pruefen(d)
    cz, cv = checkpoints_pruefen(d)
    return {'level': datei, 'bild': bz, 'plattform': pz, 'haken': hz, 'checkpoints': cz, 'befunde': bv + pv + hv + cv}

def pruefe_alle(dateien=None):
    aus = ausnahmen()
    res = [pruefe_level(f) for f in (dateien or welten_level())]
    for r in res:
        for v in r['befunde']: v['ausnahme'] = ist_ausnahme(r['level'], v, aus)
    return res

def zusammenfassung(res):
    regeln = ('Bild', 'Plattform', 'Haken', 'Checkpoint')
    zeilen = ['| Level | ' + ' | '.join(regeln) + ' |', '|---|' + '---|' * len(regeln)]
    for r in res:
        n = {g: sum(1 for v in r['befunde'] if v['regel'] == g and not v['ausnahme']) for g in regeln}
        zeilen.append(f"| {r['level']} | " + ' | '.join(str(n[g]) for g in regeln) + ' |')
    return '\n'.join(zeilen)

if __name__ == '__main__':
    args = sys.argv[1:]
    dateien = [args[args.index('--level') + 1]] if '--level' in args else None
    res = pruefe_alle(dateien)
    if '--json' in args:
        print(json.dumps(res, ensure_ascii=False, indent=1)); sys.exit(0)
    print(f'BILD_MAX_SPALTEN = {BILD_MAX_SPALTEN}\n')
    print(zusammenfassung(res)); print()
    for r in res:
        bef = [v for v in r['befunde'] if not v['ausnahme']]
        if '--alle' in args:
            print(f"## {r['level']}")
            print('| Nummer | Auslöser | Ziel | Abstand | |'); print('|---|---|---|---|---|')
            for z in r['bild']: print(f"| {z['nummer']} | {z['ausloeser']} | {z['ziel']} | {z['abstand']} | {'OK' if z['abstand'] <= BILD_MAX_SPALTEN else ('OK (anderer Auslöser näher)' if z['ok_gruppe'] else 'Verstoß')} |")
            print('| Plattform | von→bis | Strecke | größter Abstand zum Partner | |'); print('|---|---|---|---|---|')
            for z in r['plattform']: print(f"| {z['art']} {z['nummer'] or ''} | {z['von']}→{z['bis']} | {z['strecke']} | {z['abstand']} | {'OK' if z['abstand'] <= BILD_MAX_SPALTEN else 'Verstoß'} |")
            print('| Checkpoint | Spalte | Abstand | Stelle dazwischen |'); print('|---|---|---|---|')
            for z in r['checkpoints']: print(f"| {z['nr']} | {z['spalte']} | {z['abstand']} | {'ja' if z['stelle'] else 'nein'} |")
            print()
        if bef:
            print(f"{r['level']}:")
            for v in bef: print(f"  [{v['regel']}] Spalte {v['spalte']}: {v['text']}")
