# tests/material_schoen.py – Material-Einsatz verschönern (Nutzerwunsch „Materialien schön und etwas realistischer, ohne den
# Spielfluss zu stören“). Arbeitet NUR an Stellen, an die keine Figur hinkommt:
#   A  Boden unten füllen: Boden im unteren Bereich (Oberkante ab Reihe UNTEN_AB), unter dem bis zum unteren Rand nur Leere ist,
#      wird nach unten auf DICKE Kästchen aufgefüllt (gleiches Material) – aber nur Kästchen, die von keinem Stehplatz aus
#      erreichbar sind (Sprung-Reichweite) und an denen kein Element liegt.
#   B  Decke oben: im obersten Streifen (Reihen −3 …) hängen Decken-/Überhang-Stücke aus Material, je Welt anders (Höhle:
#      zackige Decke mit Tropfsteinen, Ruinen: eingestürzte Decke/Gebälk, Vulkan: Felsdecke, Dschungel: einzelne Erd-Überhänge)
#      – nur, wo selbst mit Sprung + Dash, Pilz, Haken und Aufwind niemand hinkommt (großer Abstand, siehe REICH_*).
# Aufruf: python3 tests/material_schoen.py [--level <welt>/<datei>] [--trocken] [--nur A|B]
# Speichern über den echten Editor-Export (tests/level_bau.py), so bleiben Spiel- und Editor-Datei gleich.
import json, sys, math
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tests'))

OBEN, UNTEN = -3, 17            # bebaubare Reihen (Editor: −3 … 17)
UNTEN_AB = 13                    # A: Boden mit Oberkante ab dieser Reihe zählt als „unterer Einsatz“
DICKE = 3                        # A: so dick (Kästchen) soll unterer Boden mindestens sein
BREITE_MIN = 5                   # A: kürzere Stücke sind Trittsteine (darauf springt man – dürfen dünn bleiben)
REICH_SEITE_A, REICH_HOCH_A = 5, 5      # A: so weit (Spalten) / so hoch (Reihen) kommt man von einem Stehplatz aus
REICH_SEITE_B, REICH_HOCH_B = 8, 12     # B: Sprung + Dash (8 Reihen) + Körper + Luft
PILZ_SEITE, PILZ_HOCH = 9, 17           # B: Pilz (≈ 6 Reihen) + Dash darüber + Luft
HAKEN_LUFT = 5                          # B: so viele Reihen über einem Haken bleiben frei (Abflug nach oben)
DECKE_MAX = 5                           # B: höchstens so tief (Reihen ab −3) hängt eine Decke
STEH = {'ground', 'wall', 'crumble', 'oneway', 'platform', 'haft'}   # Kacheln, auf denen man stehen kann
FEST = {'ground', 'wall', 'crumble', 'haft'}                         # Kacheln, die Material sind

def welten_level():
    w = json.loads((ROOT / 'levels' / 'worlds.json').read_text(encoding='utf-8'))
    out = []
    for welt in w['welten']:
        out += welt.get('level', [])
    return out   # Boss-Arenen bleiben, wie sie sind

def hsh(c, s=0):
    x = (c * 374761393 + s * 668265263) & 0xffffffff
    x = (x ^ (x >> 13)) * 1274126177 & 0xffffffff
    return ((x ^ (x >> 16)) & 0xffff) / 0xffff

def analyse(ed):
    """Stehplätze, belegte Kästchen (Elemente) und Sperr-Spalten aus einem Level im Editor-Format"""
    t = {(c, r): ty for c, r, ty in ed['tiles']}
    belegt, steh = set(), set()
    genau = set()   # Element-Kästchen ohne Rand (für Regel A: unter festem Boden stört der Rand nicht)
    def mark(c, r, rand=0):
        genau.add((c, r))
        for dc in range(-rand, rand + 1):
            for dr in range(-rand, rand + 1): belegt.add((c + dc, r + dr))
    standfest = {k for k, ty in t.items() if ty in STEH}
    for feld, v in ed.items():
        if not isinstance(v, list) or not v or not isinstance(v[0], dict) or 'c' not in v[0]: continue
        for p in v:
            c, r = p['c'], p['r']
            mark(c, r, 2 if feld in ('coins', 'checkpoints', 'switches', 'plates', 'goal', 'startM', 'startF') else 1)
            if feld in ('switchFloors', 'eis', 'baender', 'bruchWaende', 'doors'): standfest.add((c, r))
            if feld == 'movers':   # Fahrweg: jedes Kästchen ist Stehplatz und belegt
                n = max(abs(p.get('dc', 0)), abs(p.get('dr', 0)))
                for i in range(n + 1):
                    cc = c + round(p.get('dc', 0) * i / max(1, n)); rr = r + round(p.get('dr', 0) * i / max(1, n))
                    standfest.add((cc, rr)); mark(cc, rr, 1)
            if feld == 'teleporters': steh.add((c, r))
            if feld in ('startM', 'startF', 'goal', 'checkpoints'): steh.add((c, r))
    for k in ('startM', 'startF', 'goal'):
        p = ed.get(k)
        if isinstance(p, dict) and 'c' in p: mark(p['c'], p['r'], 2); steh.add((p['c'], p['r']))
    gefahr = {(p['c'], p['r']) for p in ed.get('spikes', [])} | {(p['c'], p['r']) for p in ed.get('lava', [])}
    for (c, r) in standfest:
        if ((c, r - 1) not in t or t.get((c, r - 1)) in ('wind', 'fake')) and (c, r - 1) not in gefahr: steh.add((c, r - 1))
    analyse.genau = genau
    return t, belegt, steh

def boden_fuellen(ed, t, belegt, steh):
    """Regel A – liefert neue Kacheln {(c, r): typ}"""
    neu = {}
    hooks = ed.get('hooks', [])
    spalten = {}
    for (c, r), ty in t.items(): spalten.setdefault(c, []).append(r)
    for c, rs in spalten.items():
        rs = sorted(rs)
        unterste = rs[-1]
        ty = t[(c, unterste)]
        if ty not in FEST or unterste >= UNTEN: continue
        # zusammenhängendes Stück, zu dem die unterste Kachel gehört
        oben = unterste
        while (c, oben - 1) in t and t[(c, oben - 1)] in FEST: oben -= 1
        if oben < UNTEN_AB: continue
        # nur echter Boden (mindestens BREITE_MIN Spalten breit), keine Trittsteine über Gruben
        l = rr = c
        while (l - 1, oben) in t and t[(l - 1, oben)] in FEST and (l - 1, oben - 1) not in t: l -= 1
        while (rr + 1, oben) in t and t[(rr + 1, oben)] in FEST and (rr + 1, oben - 1) not in t: rr += 1
        if rr - l + 1 < BREITE_MIN: continue
        ziel = min(UNTEN, oben + DICKE - 1)
        for r in range(unterste + 1, ziel + 1):
            if (c, r) in analyse.genau or (c, r) in t: break
            if any(abs(sc - c) <= REICH_SEITE_A and 0 <= sr - r <= REICH_HOCH_A for sc, sr in steh): break
            if any(math.hypot(h['c'] - c, h['r'] - r) <= (h.get('radius') or 6.5) + 1 for h in hooks): break
            neu[(c, r)] = 'wall' if ty == 'wall' else 'ground'
    return neu

def decke_erlaubt(ed, t, belegt, steh):
    """Regel B – je Spalte: wie viele Reihen ab −3 darf Deko-Decke hängen"""
    cols = ed['cols']
    tiefe = {}
    pilze = [(p['c'], p['r']) for p in ed.get('bouncers', [])]
    hooks = ed.get('hooks', [])
    wind = {c for (c, r), ty in t.items() if ty == 'wind'}
    sperr = set()
    for feld in ('lichtquellen', 'spiegel', 'kristalle', 'pressen', 'traps', 'boulders', 'leuchtkristalle', 'teleporters', 'boss', 'bossArena'):
        for p in ed.get(feld, []) if isinstance(ed.get(feld), list) else []:
            for dc in range(-3, 4): sperr.add(p['c'] + dc)
    for c in wind:
        for dc in range(-6, 7): sperr.add(c + dc)
    steh_s = {}
    for sc, sr in steh: steh_s.setdefault(sc, []).append(sr)
    for c in range(cols):
        if c in sperr: tiefe[c] = 0; continue
        grenze = UNTEN + 1   # erste verbotene Reihe (von oben gezählt)
        for dc in range(-REICH_SEITE_B, REICH_SEITE_B + 1):
            for sr in steh_s.get(c + dc, []): grenze = min(grenze, sr - REICH_HOCH_B)
        for pc, pr in pilze:
            if abs(pc - c) <= PILZ_SEITE: grenze = min(grenze, pr - PILZ_HOCH)
        for h in hooks:
            R = (h.get('radius') or 6.5)
            cs = [h['c']] + ([h['c'] + h['move'].get('dc', 0)] if h.get('move') else [])
            if any(abs(hc - c) <= R + 3 for hc in cs) or (h.get('move') and min(cs) - R - 3 <= c <= max(cs) + R + 3):
                grenze = min(grenze, h['r'] - HAKEN_LUFT)
        n = 0
        for r in range(OBEN, min(grenze, OBEN + DECKE_MAX)):
            if (c, r) in belegt or (t.get((c, r)) not in (None,) + tuple(FEST)): break
            n += 1
        tiefe[c] = n
    return tiefe

def decke_formen(ed, t, tiefe):
    """Regel B – je Welt passend, immer an etwas befestigt:
       Höhle: Felsdecke als Band am oberen Rand (2 Reihen, über längere Stücke 3), sanft abgestuft – die Höhle hat oben zu.
       Ruinen/Vulkan: Sturz/Bogen zwischen zwei hohen Säulen (oben verbunden, 2 Reihen) – wie Tore alter Gebäude.
       Dschungel: nichts (offener Himmel; die Haken hängen dort an Lianen)."""
    welt = ed.get('welt', 'dschungel')
    cols = ed['cols']
    neu = {}
    def frei(c, bis_r): return tiefe.get(c, 0) >= bis_r - OBEN + 1
    if welt == 'hoehle':
        c = 0
        while c < cols:
            if not frei(c, OBEN + 1): c += 1; continue
            e = c
            while e + 1 < cols and frei(e + 1, OBEN + 1): e += 1
            if e - c + 1 >= 6:
                # Grundband 2 Reihen; Abschnitte von 5–9 Spalten abwechselnd 2 oder 3 tief (nur wo erlaubt), Ränder 1 Stufe
                x = c
                while x <= e:
                    L = 5 + int(hsh(x, 11) * 5)
                    d = 3 if hsh(x, 12) > 0.45 else 2
                    for xx in range(x, min(e, x + L - 1) + 1):
                        rand = min(xx - c, e - xx)
                        dd = min(d, 2 + max(0, rand - 1), tiefe[xx])
                        if rand == 0: dd = min(dd, 1 + (1 if tiefe[xx] >= 2 else 0))
                        for r in range(OBEN, OBEN + dd):
                            if (xx, r) not in t: neu[(xx, r)] = 'ground'
                    x += L
            c = e + 1
    elif welt in ('ruinen', 'vulkan'):
        # hohe Säulen: Spalten mit Material, dessen Oberkante weit oben liegt und das mind. 5 Reihen hoch ist
        oben_k = {}
        for (c, r), ty in t.items():
            if ty in ('ground', 'wall') and (c, r - 1) not in t:
                h = 0
                while (c, r + h) in t and t[(c, r + h)] in ('ground', 'wall'): h += 1
                if h >= 5 and r <= 4: oben_k[c] = min(oben_k.get(c, 99), r)
        saeulen = sorted(oben_k)
        for i, a in enumerate(saeulen):
            for b in saeulen[i + 1:]:
                if b - a < 4: continue
                if b - a > 12: break
                if any(x in oben_k for x in range(a + 1, b)): break   # Säule dazwischen -> der nähere Bogen zählt
                r0 = max(oben_k[a], oben_k[b])
                if r0 < OBEN: continue
                if all(frei(x, r0 + 1) and (x, r0) not in t and (x, r0 + 1) not in t for x in range(a + 1, b)):
                    mat = t.get((a, oben_k[a]), 'wall')
                    for x in range(a + 1, b):
                        for r in (r0, r0 + 1): neu[(x, r)] = mat
                break
    return neu

def bearbeiten(datei, nur=None):
    import level_bau as LB
    lv = LB.Level(datei)
    t, belegt, steh = analyse(lv.ed)
    a = boden_fuellen(lv.ed, t, belegt, steh) if nur in (None, 'A') else {}
    b = decke_formen(lv.ed, t, decke_erlaubt(lv.ed, t, belegt, steh)) if nur in (None, 'B') else {}
    for (c, r), ty in {**a, **b}.items(): lv.kachel(c, r, ty)
    return lv, len(a), len(b)

def main():
    args = sys.argv[1:]
    nur = args[args.index('--nur') + 1] if '--nur' in args else None
    dateien = [args[args.index('--level') + 1]] if '--level' in args else welten_level()
    import level_bau as LB
    fertig = []
    for d in dateien:
        lv, na, nb = bearbeiten(d, nur)
        print(f'{d}: Boden unten +{na} Kästchen, Decke oben +{nb} Kästchen')
        if na or nb: fertig.append(lv)
    if '--trocken' not in args and fertig: LB.speichern(fertig)

if __name__ == '__main__':
    main()
