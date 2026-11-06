# tests/bausteine/rhythmus_umbau.py – Nutzerwunsch 04.11. „Action-Bereich an Action-Bereich“: Level-Rhythmus umbauen.
# Je 3–4 Action-Stellen werden zu einem Block zusammengerückt (kurze, gleichförmige Laufstücke dazwischen gekürzt), zwischen
# den Blöcken kommt eine ENTSPANNTE STRECKE (30–40 s Laufen ≈ 180–235 Spalten): leichte Gruben (manche mit Stacheln – man
# kann sterben), kleine Mauern und Stufen, Münzbögen und -reihen, ab und zu ein oberer Weg; Checkpoint am Anfang und
# höchstens alle ~70 Spalten. Die Reihenfolge der Stellen bleibt; nichts wird zwischen Hebel und Tür getrennt.
#
#   python tests/bausteine/rhythmus_umbau.py dschungel/abschnitt-1-sternschnuppenspur.json          -> nur Plan anzeigen
#   python tests/bausteine/rhythmus_umbau.py dschungel/abschnitt-1-sternschnuppenspur.json --schreiben
# Schreibt Spiel- und Editor-Format (über den echten Editor, tests/level_bau.py), passt "_teile" und die Begleitdatei
# levels/partner/<datei> an (Spalten und P.x-Werte werden mitverschoben).
import json, math, random, re, sys
from collections import defaultdict
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / 'tests'))

FEST = {'ground', 'wall', 'haft', 'crumble'}
PUNKT_FELDER = None   # alle Listen mit c/r
ENTSPANNT = (180, 235)      # Spalten je entspannter Strecke (30–40 s bei ~5,9 Spalten/s)
BLOCK_STELLEN = (3, 4)      # Stellen je Action-Block
LUECKE_BLEIBT = 7           # so viele Spalten bleiben zwischen zwei Stellen eines Blocks (vorher 6–35)
HAKEN_ABSTAND = 10          # Haken-Kreise dürfen sich nicht überdecken (Regelwerk 12)
CP_MIN, CP_MAX = 25, 70     # Checkpoint-Abstände (Regelwerk 12)

def lade(datei):
    E = json.loads((ROOT / 'levels' / 'editor-format' / datei).read_text(encoding='utf-8'))
    return E

def analyse(E):
    COLS = E['cols']
    tiles = defaultdict(dict)
    for c, r, t in E['tiles']: tiles[c][r] = t
    def boden(c):
        col = tiles.get(c, {})
        if col.get(17) not in FEST: return None
        r = 17
        while r - 1 >= -3 and col.get(r - 1) in FEST: r -= 1
        return r
    B = [boden(c) for c in range(COLS)]
    aktion = defaultdict(list)
    def mark(c0, c1, g):
        for c in range(int(c0), int(c1) + 1): aktion[c].append(g)
    for h in E.get('hooks', []): mark(h['c'] - 4, h['c'] + 4, 'haken')
    for k in ('switches', 'doors', 'plates', 'windraeder', 'flossRaeder', 'bruchWaende', 'switchFloors'):
        for o in E.get(k, []): mark(o['c'] - 1, o['c'] + 1, k)
    for s in E.get('spikes', []): mark(s['c'], s['c'], 'stachel')
    for m in E.get('movers', []): mark(min(m['c'], m['c'] + m.get('dc', 0)) - 1, max(m['c'], m['c'] + m.get('dc', 0)) + 1, 'bewegt')
    for b in E.get('blattFloesse', []): mark(b['c'] - 1, b['c'] + b.get('schiene', 6) + 3, 'floss')
    for c, col in tiles.items():
        for r, t in col.items():
            if t in ('crumble', 'haft', 'oneway', 'platform'): mark(c, c, t)
    for c in range(COLS):
        if B[c] is None: mark(c - 1, c + 1, 'grube')
        elif c + 1 < COLS and B[c + 1] is not None and abs(B[c + 1] - B[c]) >= 3: mark(c - 1, c + 2, 'stufe')
        col = tiles.get(c, {})
        if B[c] is not None and any(t in FEST for r, t in col.items() if B[c] - 7 < r < B[c] - 1): mark(c, c, 'decke')
    st = []
    for c in range(COLS):
        if aktion.get(c):
            if st and c - st[-1][1] <= 6: st[-1][1] = c
            else: st.append([c, c])
    # kleine reine Gelände-Stückchen (< 8 Spalten, nur Stufe/Decke) gehören zur Stelle davor
    st2 = []
    for a, b in st:
        klein = b - a + 1 < 8 and all(set(aktion[c]) <= {'stufe', 'decke'} for c in range(a, b + 1))
        if klein and st2: st2[-1][1] = b
        else: st2.append([a, b])
    # Nummern-Bereiche (Auslöser bis Ziel): dort nie schneiden oder einfügen
    links = defaultdict(list)
    for k in ('switches', 'doors', 'plates', 'switchFloors', 'windraeder', 'blattFloesse', 'flossRaeder', 'movers'):
        for o in E.get(k, []):
            n = o.get('link') or o.get('switchLink')
            if n: links[n] += [o['c'], o['c'] + o.get('dc', 0) + (o.get('schiene', 0) or 0)]
    # dieselbe Nummer kann an zwei weit getrennten Stellen vorkommen (z. B. Nr. 14: Plattform-Hebel und Floß) -> Gruppen
    sperr = []
    for v in links.values():
        v = sorted(v); a = b = v[0]
        for c in v[1:]:
            if c - b > 40: sperr.append((a, b)); a = c
            b = c
        sperr.append((a, b))
    return dict(COLS=COLS, tiles=tiles, B=B, aktion=aktion, st=st2, sperr=sperr)

def objekte_in_spalte(E, c):
    n = 0
    for k, v in E.items():
        if isinstance(v, list) and k != 'tiles':
            for o in v:
                if isinstance(o, dict) and o.get('c') == c and k not in ('coins', 'meteoriten', 'checkpoints'): n += 1
        elif isinstance(v, dict) and k in ('startM', 'startF', 'goal') and v.get('c') is not None and abs(v['c'] - c) <= 3: n += 1   # Start/Ziel samt Umfeld bleiben
    return n

def schnitt_ok(A, E, x):
    """an Spalte x (neue Spalten VOR x) darf eingefügt werden: ringsum flacher Boden, nichts darüber, kein Nummern-Bereich"""
    B, tiles = A['B'], A['tiles']
    R = B[x] if 0 <= x < A['COLS'] else None
    if R is None or R < 4: return None
    for c in range(x - 4, x + 4):
        if c < 0 or c >= A['COLS'] or B[c] != R or A['aktion'].get(c): return None
        if any(r < R for r in tiles.get(c, {})): return None
        if objekte_in_spalte(E, c): return None
    if any(a - 2 <= x <= b + 2 for a, b in A['sperr']): return None
    for h in E.get('hooks', []):
        if abs(h['c'] - x) < 8: return None
    return R

def planen(E):
    A = analyse(E)
    st = A['st']
    bloecke, einfuegen = [], []
    def schnitt_nach(j):
        """Schnitt in der Lücke nach Stelle j (möglichst mittig) oder None"""
        if j + 1 >= len(st): return None
        if A['COLS'] - st[j][1] < 80: return None   # kurz vor dem Ziel keine entspannte Strecke mehr
        a, b = st[j][1] + 1, st[j + 1][0] - 1
        kand = sorted(range(a + 4, b - 3), key=lambda x: abs(x - (a + b)/2))
        return next((x for x in kand if schnitt_ok(A, E, x) is not None), None)
    i = 0
    while i < len(st):
        j = i
        ende = None
        while j < len(st):
            n = j - i + 1
            if n >= BLOCK_STELLEN[0]:
                x = schnitt_nach(j)
                if x is not None:
                    # bei 3 Stellen: lieber 4, wenn dort auch geschnitten werden kann und der Block nicht zu lang wird
                    x4 = schnitt_nach(j + 1) if n == BLOCK_STELLEN[0] else None
                    if x4 is not None and st[j + 1][1] - st[i][0] <= 300: ende = (j + 1, x4)
                    else: ende = (j, x)
                    break
            j += 1
        if ende is None:
            bloecke.append((i, len(st) - 1)); break
        bloecke.append((i, ende[0])); einfuegen.append(ende[1]); i = ende[0] + 1
    # Kürzen innerhalb der Blöcke
    entfernen = set()
    for (bi, bj) in bloecke:
        for k in range(bi, bj):
            a, b = st[k][1] + 1, st[k + 1][0] - 1
            luecke = b - a + 1
            if luecke <= LUECKE_BLEIBT: continue
            weg = gleichfoermig(A, E, a, b, luecke - LUECKE_BLEIBT)
            # Haken über die Lücke hinweg: Abstand bleibt >= HAKEN_ABSTAND (oder wie vorher, falls schon kleiner)
            links_h = [h['c'] for h in E.get('hooks', []) if h['c'] < a]
            rechts_h = [h['c'] for h in E.get('hooks', []) if h['c'] > b]
            if weg and links_h and rechts_h:
                d = min(rechts_h) - max(links_h)
                erlaubt = max(0, d - max(HAKEN_ABSTAND, 0)) if d > HAKEN_ABSTAND else 0
                weg = weg[:erlaubt]
            entfernen.update(weg)
    return A, bloecke, einfuegen, entfernen

def gleichfoermig(A, E, a, b, anzahl):
    """bis zu `anzahl` Spalten aus der Lücke a..b, die man ohne Bruch entfernen kann: Spalte gleich wie ihre Nachbarn
    (gleiche Kacheln), keine Elemente (Münzen/Meteoriten/Checkpoints dürfen weg) – aus der Mitte des längsten Laufs"""
    tiles = A['tiles']
    sig = lambda c: tuple(sorted(tiles.get(c, {}).items()))
    laeufe, cur = [], []
    for c in range(a + 2, b - 1):   # je 2 Spalten an den Rändern bleiben
        ok = not objekte_in_spalte(E, c) and sig(c) == sig(c - 1) == sig(c + 1) and not A['aktion'].get(c)
        if ok: cur.append(c)
        else:
            if cur: laeufe.append(cur); cur = []
    if cur: laeufe.append(cur)
    out = []
    for lauf in sorted(laeufe, key=len, reverse=True):
        rest = anzahl - len(out)
        if rest <= 0: break
        m = len(lauf)//2; k = min(rest, len(lauf))
        s = max(0, m - k//2)
        out += lauf[s:s + k]
    return out

# ---------- Entspannte Strecke bauen (relativ, Spalten 0..L-1, Boden-Oberkante R) ----------
def entspannt(L, R, rnd):
    """-> (kacheln {(c, r): typ}, stacheln [(c, r)], muenzen [(c, r, farbe)], checkpoints [c], beschreibung)"""
    T, S, M, CP = {}, [], [], []
    hmin, hmax = max(5, R - 3), min(15, R + 2)
    h, c = R, 0
    farbe = rnd.choice(['blue', 'pink'])
    def saeule(c, top, typ='ground'):
        for r in range(top, 18): T[(c, r)] = typ
    def flach(n, muenzen=False):
        nonlocal c
        for k in range(n):
            saeule(c + k, h)
        if muenzen and n >= 5 and rnd.random() < 0.6:   # nicht auf jedem Stück Münzen (vorher zu viele)
            for k in range(2, min(n - 1, 12), 2): M.append((c + k, h - 1, farbe))
        c += n
    teile = []
    flach(8)              # Anlauf (Checkpoint)
    CP.append((3, R - 1))   # (Spalte, Reihe über dem Boden)
    while c < L - 16:
        wahl = rnd.random()
        rest = L - 16 - c
        if wahl < 0.22 and rest > 10:          # Grube mit Stacheln (tödlich, aber leicht: 2–4 breit)
            w = rnd.choice([2, 3, 3])          # (Lauf-Bot: 4 breit direkt hinter einer Grube war zu knapp)
            for k in range(w):
                T[(c + k, 17)] = 'ground'; S.append((c + k, 16))
            # Münzbogen darüber
            for k in range(-1, w + 1):
                t = (k + 1)/(w + 1)
                M.append((c + k, h - 2 - round(math.sin(t*math.pi)*1.6), farbe))
            c += w; teile.append(f'Grube{w}'); flach(rnd.randint(7, 10))   # danach genug Boden zum Landen/Durchatmen
        elif wahl < 0.34 and rest > 10:        # flache Mulde (2 tiefer, ohne Gefahr) – reinhüpfen, raushüpfen
            w = rnd.randint(3, 5); tief = min(16, h + 2)
            for k in range(w): saeule(c + k, tief)
            for k in range(1, w, 2): M.append((c + k, tief - 1, farbe))
            c += w; teile.append(f'Mulde{w}'); flach(rnd.randint(6, 9))
        elif wahl < 0.48 and rest > 8:         # kleine Mauer (1–2 hoch, 1–2 breit) zum Drüberspringen
            hoch, w = rnd.choice([1, 2, 2]), rnd.choice([1, 2])
            for k in range(w): saeule(c + k, h - hoch, 'wall')
            M.append((c + w//2, h - hoch - 2, farbe))
            c += w; teile.append(f'Mauer{hoch}'); flach(rnd.randint(6, 9))
        elif wahl < 0.64 and rest > 12:        # Stufe hoch oder runter (bleibt im Rahmen)
            d = rnd.choice([-2, -1, 1, 2])
            if not (hmin <= h + d <= hmax): d = -d
            if hmin <= h + d <= hmax: h += d
            teile.append(f'Stufe{d:+d}'); flach(rnd.randint(8, 12), muenzen=True)
        elif wahl < 0.76 and rest > 16:        # oberer Weg: schwebender Sims mit Münzen (wer hochspringt, kriegt mehr)
            n = rnd.randint(5, 8); p = h - 3
            flach(2)
            for k in range(n): T[(c + k, p)] = 'wall'
            for k in range(n): saeule(c + k, h)
            for k in range(0, n, 2): M.append((c + k, p - 1, 'pink' if farbe == 'blue' else 'blue'))
            c += n; teile.append(f'Sims{n}'); flach(6)
        else:
            flach(rnd.randint(6, 11), muenzen=True); teile.append('flach')
        if rnd.random() < 0.25: farbe = 'pink' if farbe == 'blue' else 'blue'
    # zurück auf R
    while h != R:
        h += 1 if h < R else -1
        flach(6)
    while c < L: flach(1)
    # weitere Checkpoints höchstens alle ~65 Spalten (an Stellen mit Boden, nicht vor Mauern)
    # Boden einer Spalte = oberste Reihe des durchgehenden Bodens von unten (ein schwebender Sims darüber zählt nicht;
    # Nutzer-Bild 06.11.: Checkpoints standen im Boden, weil immer die Grundhöhe R genommen wurde)
    def boden(k):
        if T.get((k, 17)) not in FEST: return None
        r = 17
        while T.get((k, r - 1)) in FEST: r -= 1
        return r
    stachel = {(s[0], s[1]) for s in S}
    letzter = CP[0][0]
    for k in range(1, L - 20):
        b = boden(k)
        if k - letzter >= 62 and b is not None and (k, b - 1) not in stachel and (k, b - 1) not in T and (k, b - 2) not in T:
            if all(boden(k + d) == b for d in (-2, -1, 1, 2)):
                CP.append((k, b - 1)); letzter = k
    return T, S, M, CP, teile

def umbauen(datei, schreiben=False, saat=7, nur_anfang=False):
    E = lade(datei)
    spiel_alt = json.loads((ROOT / 'levels' / datei).read_text(encoding='utf-8'))
    if spiel_alt.get('_rhythmus') and not nur_anfang:   # schon umgebaut: ein zweiter Lauf würde alles noch einmal einfügen
        raise RuntimeError(f'{datei} ist schon umgebaut ("_rhythmus": {spiel_alt["_rhythmus"]}) – nicht doppelt umbauen')
    A, bloecke, einfuegen, entfernen = planen(E)
    if nur_anfang:
        # Nutzerwunsch: „das Level startet direkt mit einem Action-Bereich – lieber entspannt starten“: nur EINE entspannte
        # Strecke vor der ersten Stelle (zwischen Startpunkt und erster Stelle), sonst nichts ändern
        erste = A['st'][0][0]
        x0 = next((x for x in range(erste - 4, 4, -1) if schnitt_ok(A, E, x) is not None), None)
        if x0 is None: raise RuntimeError('vor der ersten Stelle kein flacher Platz zum Einfügen')
        bloecke, einfuegen, entfernen = [(0, len(A['st']) - 1)], [x0], set()
        saat += 1000
    st, rnd = A['st'], random.Random(saat)
    laengen = [rnd.randint(*ENTSPANNT) for _ in einfuegen]
    # Abbildung alte Spalte -> neue Spalte
    ein = dict(zip(einfuegen, laengen))
    neu, versatz = {}, 0
    for c in range(A['COLS']):
        versatz += ein.get(c, 0)
        if c in entfernen: neu[c] = None; versatz -= 1; continue
        neu[c] = c + versatz
    neu_cols = A['COLS'] + sum(laengen) - len(entfernen)
    def nc(c):
        if c < 0: return c
        if c >= A['COLS']: return c + (neu_cols - A['COLS'])
        return neu[c]
    def nc_fest(c):   # wie nc, aber eine entfernte Spalte zählt wie die nächste erhaltene
        c = int(c)
        while 0 <= c < A['COLS'] and neu[c] is None: c += 1
        return nc(c)
    print(f'{datei}: {len(st)} Stellen -> {len(bloecke)} Blöcke, {len(einfuegen)} entspannte Strecken '
          f'({sum(laengen)} Spalten neu), {len(entfernen)} Spalten in Blöcken gekürzt; {A["COLS"]} -> {neu_cols} Spalten')
    for (bi, bj), x in zip(bloecke, einfuegen + [None]):
        print(f'  Block Stellen {bi}-{bj}: alt {st[bi][0]}-{st[bj][1]} -> neu {nc(st[bi][0])}-{nc(st[bj][1])}'
              + (f' | entspannt ab alt {x} (neu {nc(x) - ein[x]}), {ein[x]} Spalten, Boden {A["B"][x]}' if x is not None else ''))
    if not schreiben: return
    import level_bau as LB
    lv = LB.Level(datei)
    # Kacheln umrechnen
    t2 = {}
    for (c, r), t in lv.t.items():
        n = nc(c)
        if n is not None: t2[(n, r)] = t
    # Objekte umrechnen (entfernte Spalten: Münzen/Meteoriten/Checkpoints fallen weg)
    ed = lv.ed
    for k, v in list(ed.items()):
        if not isinstance(v, list) or k == 'tiles': continue
        neu_liste = []
        for o in v:
            if isinstance(o, dict) and 'c' in o:
                n = nc(o['c'])
                if n is None:
                    if k in ('coins', 'meteoriten', 'checkpoints'): continue
                    raise RuntimeError(f'{k} in entfernter Spalte {o["c"]}')
                o = dict(o, c=n)
            neu_liste.append(o)
        ed[k] = neu_liste
    for k in ('startM', 'startF', 'goal'):
        # (Start/Ziel nie verlieren: liegt es in einer gekürzten Spalte, rückt es auf die nächste erhaltene – vorher ging so
        #  das Ziel von Abschnitt 1 verloren)
        if isinstance(ed.get(k), dict) and isinstance(ed[k].get('c'), (int, float)): ed[k] = dict(ed[k], c=nc_fest(ed[k]['c']))
    # Sicherheitsprüfung: Start und Ziel vorhanden, Ziel am Ende (sonst nicht speichern)
    for k in ('startM', 'goal'):
        if not (isinstance(ed.get(k), dict) and isinstance(ed[k].get('c'), (int, float))): raise RuntimeError(f'{k} fehlt nach dem Umbau')
    if ed['goal']['c'] < neu_cols*0.9: raise RuntimeError(f'Ziel liegt nicht am Ende: Spalte {ed["goal"]["c"]} von {neu_cols}')
    # entspannte Strecken einsetzen
    cps_neu = []
    for x, L in zip(einfuegen, laengen):
        R = A['B'][x]; c0 = nc(x) - L
        T, S, M, CP, teile = entspannt(L, R, random.Random(saat * 1000 + x))
        for (c, r), t in T.items(): t2[(c0 + c, r)] = t
        for c, r in S: ed.setdefault('spikes', []).append({'c': c0 + c, 'r': r, 'dir': 0})
        for c, r, f in M: ed.setdefault('coins', []).append({'c': c0 + c, 'r': r, 'color': f, '_neu': True})
        for c, r in CP: cps_neu.append({'c': c0 + c, 'r': r, '_entspannt': True})
        print(f'    entspannt neu {c0}-{c0 + L - 1}: ' + ' '.join(teile))
    # Münz-Ausgleich (Münzregel: gleich viele blaue/Affe und pinke/Schweinchen): neue Münzen umfärben, bis es aufgeht
    alle_m = ed.get('coins', [])
    neu_m = [m for m in alle_m if m.get('_neu')]
    diff = sum(1 for m in alle_m if m.get('color') == 'blue') - sum(1 for m in alle_m if m.get('color') == 'pink')
    for m in neu_m:
        if diff == 0: break
        if diff > 0 and m['color'] == 'blue': m['color'] = 'pink'; diff -= 2
        elif diff < 0 and m['color'] == 'pink': m['color'] = 'blue'; diff += 2
    for m in alle_m: m.pop('_neu', None)
    # Checkpoints: alte + neue, nach Spalte; zu dicht (< CP_MIN) -> der neue (entspannte) fällt weg, sonst der spätere alte
    alle = sorted(ed.get('checkpoints', []) + cps_neu, key=lambda p: p['c'])
    behalten = []
    for p in alle:
        if behalten and p['c'] - behalten[-1]['c'] < CP_MIN:
            if p.get('_entspannt'): continue
            if behalten[-1].get('_entspannt'): behalten.pop()
            else: continue
        behalten.append(p)
    ed['checkpoints'] = [{k: v for k, v in p.items() if k != '_entspannt'} for p in behalten]
    im_boden = [p for p in ed['checkpoints'] if t2.get((p['c'], p['r'])) in FEST]
    if im_boden: raise RuntimeError(f'Checkpoints im Boden: {im_boden[:5]}')   # (Nutzer-Bild 06.11.)
    ed['cols'] = neu_cols
    lv.t = t2
    # "_teile" (Spiel-Format): Spalten der alten Teile mitrechnen
    teile = lv.alt_spiel.get('_teile')
    if teile:
        for tl in teile:
            von, br = tl['von'], tl['breite']
            v2 = nc_fest(von)
            ende = von + br
            e2 = nc_fest(ende) if ende < A['COLS'] else neu_cols
            for f in ('startM', 'startF', 'goal'):
                if isinstance(tl.get(f), dict):
                    alt_c = von + int(tl[f]['x'] // 40)
                    n = nc_fest(min(alt_c, A['COLS'] - 1))
                    tl[f] = dict(tl[f], x=(n - v2)*40 + tl[f]['x'] % 40)
            tl['von'], tl['breite'] = v2, e2 - v2
    lv.alt_spiel['_rhythmus'] = (lv.alt_spiel.get('_rhythmus', '') + (' +anfang' if nur_anfang else 'umgebaut')).strip()
    LB.speichern([lv])
    # Begleitdatei des Computer-Partners mitverschieben
    pd = ROOT / 'levels' / 'partner' / datei
    if pd.exists():
        P = json.loads(pd.read_text(encoding='utf-8'))
        def sp(c): return nc_fest(c)
        def px(x):
            c = int(x)//40; n = nc_fest(min(c, A['COLS'] - 1)); return n*40 + int(x) % 40
        def walk(o):
            if isinstance(o, dict):
                for k, v in list(o.items()):
                    if k in ('zone', 'ich_in') and isinstance(v, list): o[k] = [sp(z) for z in v]
                    elif k == 'start' and isinstance(v, dict) and 'c' in v: v['c'] = sp(v['c'])
                    elif k == 'start' and isinstance(v, list) and v: v[0] = sp(v[0])
                    elif isinstance(v, str): o[k] = re.sub(r'(P\.x\s*[<>]=?\s*)(\d+)', lambda m: m.group(1) + str(px(int(m.group(2)))), v)
                    else: walk(v)
            elif isinstance(o, list):
                for v in o: walk(v)
        walk(P.get('aufgaben')); walk(P.get('offen'))
        pd.write_text(json.dumps(P, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('geschrieben:', datei)

if __name__ == '__main__':
    umbauen(sys.argv[1], '--schreiben' in sys.argv, nur_anfang='--anfang' in sys.argv)
