# tests/level_bau.py – Nacht-Ausbau Phase 3: Level ändern wie im Editor, ohne Klicken.
# Ein Level wird im Editor-Format (levels/editor-format/<datei>) geladen, mit kleinen Bau-Befehlen geändert und dann
# über den ECHTEN Editor-Export (editor/index.html: applySnapshot + exportLevel) in beide Formate geschrieben –
# so bleiben Spiel- und Editor-Datei deckungsgleich (Test projekt_levels_beide_formate_gleich), genau wie beim
# Speichern im Editor. Felder mit „_“ (Test-Notizen) und Level-Info der alten Spiel-Datei bleiben erhalten.
#
#   import level_bau as L
#   lv = L.Level('dschungel/02-baumkronen.json')
#   lv.kachel(120, 14, 'wall'); lv.leer(121, 14); lv.bruch(130, 12); lv.haft(140, 9); lv.stachel(141, 16)
#   lv.muenze_klasse(130, 10, 'meister'); lv.checkpoint_weg(96); lv.checkpoint(100, 13)
#   L.speichern([lv])          # schreibt beide Dateien (Browser im Hintergrund)
import asyncio, json, os, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tests'))

class Level:
    def __init__(self, datei):
        self.datei = datei
        self.ed = json.loads((ROOT / 'levels' / 'editor-format' / datei).read_text(encoding='utf-8'))
        self.alt_spiel = json.loads((ROOT / 'levels' / datei).read_text(encoding='utf-8'))
        self.t = {(c, r): t for c, r, t in self.ed['tiles']}
        self.notiz = []
    # --- Kacheln (Boden, Wand, Bröckel, Steg-Plattform, Eis, Band, Aufwind, Haftfläche, Lava …: werkzeug-Name) ---
    def kachel(self, c, r, typ):
        self.t[(c, r)] = typ; return self
    def leer(self, c, r):
        self.t.pop((c, r), None); return self
    def rechteck(self, c0, r0, c1, r1, typ):
        for c in range(c0, c1 + 1):
            for r in range(r0, r1 + 1):
                if typ is None: self.leer(c, r)
                else: self.kachel(c, r, typ)
        return self
    def typ(self, c, r): return self.t.get((c, r))
    # --- Punkt-Elemente ---
    def _punkte(self, feld): return self.ed.setdefault(feld, [])
    def punkt(self, feld, c, r, **extra):
        self.punkt_weg(feld, c, r)
        self._punkte(feld).append({'c': c, 'r': r, **extra}); return self
    def punkt_weg(self, feld, c, r):
        self.ed[feld] = [p for p in self.ed.get(feld, []) if not (p['c'] == c and p['r'] == r)]; return self
    def bruch(self, c, r, nachwachsen=0):
        self.leer(c, r)
        return self.punkt('bruchWaende', c, r, **({'nachwachsen': nachwachsen} if nachwachsen else {}))
    def bruch_rechteck(self, c0, r0, c1, r1, nachwachsen=0):
        for c in range(c0, c1 + 1):
            for r in range(r0, r1 + 1): self.bruch(c, r, nachwachsen)
        return self
    def haft(self, c, r): return self.kachel(c, r, 'haft')
    def stachel(self, c, r, richtung=0):
        self.leer(c, r); return self.punkt('spikes', c, r, dir=richtung)
    def stachel_weg(self, c, r): return self.punkt_weg('spikes', c, r)
    def haken(self, c, r, radius=5.0): return self.punkt('hooks', c, r, radius=radius)
    def haken_weg(self, c, r): return self.punkt_weg('hooks', c, r)
    def pilz(self, c, r): return self.punkt('bouncers', c, r)
    def muenze(self, c, r, farbe='gold', klasse=None):
        return self.punkt('coins', c, r, color=farbe, **({'klasse': klasse} if klasse and klasse != 'pfad' else {}))
    def muenze_klasse(self, c, r, klasse):
        for m in self.ed.get('coins', []):
            if m['c'] == c and m['r'] == r:
                if klasse == 'pfad': m.pop('klasse', None)
                else: m['klasse'] = klasse
                return self
        raise KeyError(f'keine Münze bei {c},{r} in {self.datei}')
    def muenze_verschieben(self, c, r, c2, r2):
        """Münze an neuen Platz – gleiche Stelle in der Liste (Reihenfolge/Identität bleibt)"""
        for m in self.ed.get('coins', []):
            if m['c'] == c and m['r'] == r: m['c'], m['r'] = c2, r2; return self
        raise KeyError(f'keine Münze bei {c},{r} in {self.datei}')
    def checkpoint(self, c, r): return self.punkt('checkpoints', c, r)
    def checkpoint_weg(self, c):
        self.ed['checkpoints'] = [p for p in self.ed.get('checkpoints', []) if p['c'] != c]; return self
    def checkpoint_verschieben(self, c, c2, r2):
        for p in self.ed.get('checkpoints', []):
            if p['c'] == c: p['c'], p['r'] = c2, r2; return self
        raise KeyError(f'kein Checkpoint in Spalte {c} in {self.datei}')
    def merke(self, text): self.notiz.append(text); return self
    def snapshot(self):
        ed = dict(self.ed)
        ed['tiles'] = [[c, r, t] for (c, r), t in sorted(self.t.items(), key=lambda x: (x[0][1], x[0][0]))]
        return ed

async def _speichern(levels):
    from playwright.async_api import async_playwright
    import run_tests as rt
    srv = rt.webserver()
    try:
        async with async_playwright() as pw:
            b = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
            p = await b.new_page(viewport={'width': 1400, 'height': 840})
            fehler = []; p.on('pageerror', lambda e: fehler.append(str(e)))
            await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(600)
            for lv in levels:
                ed = lv.snapshot()
                spiel = await p.evaluate("ed => { applySnapshot(ed); return JSON.parse(exportLevel()); }", ed)
                for k, v in lv.alt_spiel.items():
                    if k.startswith('_') and k not in spiel: spiel[k] = v
                for k in ('welt', 'wetter', 'tageszeit', 'look', 'theme', 'titel', 'position'):   # Level-Info wie in der alten Datei
                    if k not in lv.alt_spiel: spiel.pop(k, None)
                    else: spiel[k] = lv.alt_spiel[k]
                (ROOT / 'levels' / lv.datei).write_text(json.dumps(spiel, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
                (ROOT / 'levels' / 'editor-format' / lv.datei).write_text(json.dumps(ed), encoding='utf-8')
            assert not fehler, fehler
            await b.close()
    finally:
        srv.shutdown()

def speichern(levels):
    asyncio.run(_speichern(levels if isinstance(levels, list) else [levels]))

if __name__ == '__main__':
    # Probe: Level unverändert durch den Editor schicken und zeigen, ob sich die Daten ändern (sollte nicht)
    import run_tests as rt
    datei = sys.argv[1]
    alt = json.loads((ROOT / 'levels' / datei).read_text(encoding='utf-8'))
    lv = Level(datei); speichern([lv])
    neu = json.loads((ROOT / 'levels' / datei).read_text(encoding='utf-8'))
    diff = [k for k in set(alt) | set(neu) if rt.level_teil(k, alt.get(k)) != rt.level_teil(k, neu.get(k))]
    print('verschieden:', diff)

# ---------------------------------------------------------------------------------------------------------------------
# Bausteine (Nacht-Ausbau Phase 3) auf eine flache Strecke setzen. r = Reihe der Boden-OBERKANTE (Figur steht in r-1).
def _boden_weg(lv, c, r):
    """Boden in Spalte c ab Reihe r nach unten entfernen (bis zur untersten Reihe 17 – die bleibt als Grund)"""
    for rr in range(r, 17): lv.leer(c, rr)

def grube(lv, c0, c1, r, stacheln=True):
    """Grube Spalten c0..c1 in einen Boden (Oberkante r) graben; unten Stacheln auf Reihe 16 (Grund Reihe 17)"""
    for c in range(c0, c1 + 1):
        _boden_weg(lv, c, r)
        if lv.typ(c, 17) is None: lv.kachel(c, 17, 'ground')
        if stacheln: lv.stachel(c, 16)
    return lv

def b1_dashgrube(lv, c0, r, breite=10):
    """B1: Dash-Grube (Affe: Sprung + Dash; Schweinchen: Segeln). Kante = c0-1, Landung ab c0+breite"""
    return grube(lv, c0, c0 + breite - 1, r)

def b3_haftgrube(lv, c0, r, breite=14, dicke=5):
    """B3: Grube mit Haftdecke. Haftfläche Reihe r-4 von c0-1 bis c0+breite, darüber Fels (dicke Reihen, oben drauf
    unerreichbar), Grube c0..c0+breite-1. Absprung an Spalte c0-1, Landung ab c0+breite"""
    grube(lv, c0, c0 + breite - 1, r)
    for c in range(c0 - 3, c0 + breite + 2):
        for rr in range(r - 4 - dicke, r - 4): lv.kachel(c, rr, 'wall')
    for c in range(c0 - 1, c0 + breite + 1): lv.haft(c, r - 4)
    return lv

def b2_bruchsaeule(lv, c, r, hoehe=3, bis=-3):
    """B2 ohne Grube: Säule in Spalte c – unten hoehe Kästchen Durchbruch (auf dem Boden), darüber feste Wand bis Reihe bis"""
    lv.bruch_rechteck(c, r - hoehe, c, r - 1)
    for rr in range(bis, r - hoehe): lv.kachel(c, rr, 'wall')
    return lv

def b6_haftdash(lv, c0, r, breite=16, haft=11, dicke=5):
    """B6: Grube c0..c0+breite-1, Haftdecke nur über den ersten haft Spalten (ab c0-1), Rest per Dash"""
    grube(lv, c0, c0 + breite - 1, r)
    for c in range(c0 - 3, c0 + haft + 1):
        for rr in range(r - 4 - dicke, r - 4): lv.kachel(c, rr, 'wall')
    for c in range(c0 - 1, c0 + haft): lv.haft(c, r - 4)
    return lv

def flache_strecken(datei, abdeckung=None, laenge=20, frei_hoehe=10):
    """flache Bodenstrecken (gleiche Oberkante, darüber frei_hoehe Reihen frei, keine Elemente drauf), nicht auf
    alten Bot-Wegen -> [(c0, c1, r)]"""
    import bildregel_pruefen as B
    d = json.loads((ROOT / 'levels' / datei).read_text(encoding='utf-8'))
    fest = B.feste_kaestchen(d, stege=True)
    belegt = set()
    for f in ('hooks', 'switches', 'doors', 'plates', 'bouncers', 'checkpoints', 'teleporters', 'traps', 'pressen', 'boulders',
              'lichtquellen', 'spiegel', 'kristalle', 'leuchtkristalle', 'spikes'):
        for o in d.get(f, []): belegt.add(B.spalte(o['x']))
    for f in ('winds', 'movingPlatforms', 'switchFloors', 'lava', 'baender', 'eis', 'oneways', 'dunkelzonen'):
        for o in d.get(f, []):
            for c, rr in B.felder_zellen(o): belegt.add(c)
    bedeckt = set()
    if abdeckung and datei in abdeckung:
        for a, b in abdeckung[datei]['m'] + abdeckung[datei]['f']: bedeckt.update(range(a, b + 1))
    breite = max(c for c, r in fest) + 1
    out = []
    for r in range(0, 18):
        c = 0
        while c < breite:
            ok = lambda cc: (cc, r) in fest and all((cc, r - 1 - i) not in fest for i in range(frei_hoehe)) and cc not in belegt and cc not in bedeckt
            if ok(c):
                c0 = c
                while c < breite and ok(c): c += 1
                if c - c0 >= laenge: out.append((c0, c - 1, r))
            c += 1
    return out

def s1_versteck(lv, c, r, muenze=None):
    """S1: Versteck unter einem Durchbruch-Boden. Boden-Oberkante Reihe r, Spalten c, c+1 werden Durchbruch; darunter eine
    Mulde (c..c+1, r+1), Wände (c-1, r+1), (c+2, r+1) und Grund (c-1..c+2, r+2) – fehlende Kästchen werden ergänzt.
    muenze=(c0, r0): diese Münze (Liste/Identität bleibt) in die Mulde verschieben, Klasse Geschick."""
    for cc in (c, c + 1): lv.bruch(cc, r)
    for cc in (c, c + 1): lv.leer(cc, r + 1)
    for z in ((c - 1, r + 1), (c + 2, r + 1)) + tuple((cc, r + 2) for cc in range(c - 1, c + 3)):
        if lv.typ(*z) is None: lv.kachel(z[0], z[1], 'ground')
    if muenze:
        lv.muenze_verschieben(muenze[0], muenze[1], c, r + 1); lv.muenze_klasse(c, r + 1, 'geschick')
    return lv

def bot_zellen(datei):
    """Kästchen, durch die die alten Bot-Tests laufen (tests/bausteine/abdeckung_zellen.json)"""
    p = ROOT / 'tests' / 'bausteine' / 'abdeckung_zellen.json'
    if not p.exists(): return set()
    return set(map(tuple, json.loads(p.read_text(encoding='utf-8')).get(datei, [])))

def versteck_plaetze(lv, abstand=10):
    """mögliche S1-Plätze: zwei Bodenkästchen (Reihe r, frei darüber 2 Reihen), darunter die 2x2 bzw. 4x2 Kästchen frei oder
    fest (kein Element), nicht an Elementen/Türen/Hebeln -> [(c, r)]"""
    import bildregel_pruefen as B
    d = lv.alt_spiel
    el = set()
    for f in ('hooks', 'switches', 'doors', 'plates', 'bouncers', 'checkpoints', 'teleporters', 'traps', 'pressen', 'boulders',
              'lichtquellen', 'spiegel', 'kristalle', 'leuchtkristalle', 'spikes', 'coins'):
        for o in d.get(f, []):
            el.add((B.spalte(o['x']), B.reihe(o['y'])))
    for f in ('winds', 'movingPlatforms', 'switchFloors', 'lava', 'baender', 'eis', 'oneways', 'dunkelzonen', 'bruchWaende', 'haftflaechen'):
        for o in d.get(f, []):
            for z in B.felder_zellen(o) if 'w' in o else [(B.spalte(o['x']), B.reihe(o['y']))]: el.add(z)
    out = []
    bot = bot_zellen(lv.datei)
    for (c, r), t in sorted(lv.t.items()):
        if t not in ('ground', 'wall') or not (0 <= r <= 15): continue
        if lv.typ(c + 1, r) not in ('ground', 'wall') or lv.typ(c - 1, r) is None or lv.typ(c + 2, r) is None: continue
        if any(lv.typ(cc, rr) for cc in (c, c + 1) for rr in (r - 1, r - 2)): continue
        if any((cc, rr) in el for cc in range(c - 2, c + 4) for rr in range(r - 3, r + 4)): continue
        unten = [(cc, rr) for cc in range(c - 1, c + 3) for rr in (r + 1, r + 2)]
        if any(lv.typ(*z) not in (None, 'ground', 'wall') for z in unten): continue
        if r + 2 > 17: continue
        if any(z in bot for z in unten if lv.typ(*z) is None): continue   # darunter läuft ein alter Bot-Weg
        if out and c - out[-1][0] < abstand and out[-1][1] == r: continue
        out.append((c, r))
    return out

def haftgang_plaetze(lv, min_lang=7):
    """S2-Plätze: Unterseite einer Decke (Reihe rc, Boden/Wand) – links ein Einstieg (darunter Boden 2–3 Reihen tiefer,
    also mit Sprung erreichbar), weiter rechts mindestens 4 Kästchen ohne Boden in Sprungweite (dort die Meister-Münze).
    -> [(c0, c_ende, rc, c_muenze)]"""
    import bildregel_pruefen as B
    d = lv.alt_spiel
    el = set()
    for f in ('hooks', 'switches', 'doors', 'plates', 'bouncers', 'checkpoints', 'teleporters', 'traps', 'pressen', 'boulders',
              'lichtquellen', 'spiegel', 'kristalle', 'leuchtkristalle', 'spikes', 'coins'):
        for o in d.get(f, []): el.add((B.spalte(o['x']), B.reihe(o['y'])))
    for f in ('winds', 'movingPlatforms', 'switchFloors', 'lava', 'baender', 'eis', 'oneways', 'dunkelzonen', 'bruchWaende', 'haftflaechen', 'lavaPegel'):
        for o in d.get(f, []):
            for z in B.felder_zellen(o) if 'w' in o else [(B.spalte(o['x']), B.reihe(o['y']))]: el.add(z)
    belegt = lambda c, r: lv.typ(c, r) is not None
    def abstand(c, rc):   # freie Reihen unter der Decke bis zum nächsten Boden (99 = keiner)
        for k in range(1, 20):
            if rc + k > 17: return 99
            if belegt(c, rc + k): return k - 1
        return 99
    out = []
    breite = max(c for c, r in lv.t) + 1
    for rc in range(-2, 14):
        c = 0
        while c < breite:
            if lv.typ(c, rc) in ('ground', 'wall') and not belegt(c, rc + 1):
                c0 = c
                while c < breite and lv.typ(c, rc) in ('ground', 'wall') and not belegt(c, rc + 1): c += 1
                c1 = c - 1
                if c1 - c0 + 1 >= min_lang:
                    ab = [abstand(cc, rc) for cc in range(c0, c1 + 1)]
                    # Einstieg: die ersten beiden Spalten 2–3 Reihen frei (darunter Boden), dann eine Leere (>= 5 frei)
                    if 2 <= ab[0] <= 3 and 2 <= ab[1] <= 3:
                        leer = [i for i in range(2, len(ab)) if ab[i] >= 5]
                        if len(leer) >= 4 and leer[0] <= 4:
                            cm = c0 + leer[min(3, len(leer) - 1)]
                            if not any((cc, rr) in el for cc in range(c0, cm + 2) for rr in range(rc + 1, rc + 4)):
                                out.append((c0, c1, rc, cm))
            c += 1
    return out

def haft_ueber_grube_plaetze(lv, dicke=5):
    """B3 über einer VORHANDENEN Grube (6–16 breit, beide Ränder gleich hoch): Fels + Haftfläche passen darüber, ohne
    Kästchen, Elemente oder alte Bot-Wege zu berühren -> [(c0, breite, r)] (c0 = erste Grubenspalte, r = Rand-Oberkante)"""
    import level_vermessen as LV, bildregel_pruefen as B
    d = lv.alt_spiel
    el = set()
    for f in ('hooks', 'switches', 'doors', 'plates', 'bouncers', 'checkpoints', 'teleporters', 'traps', 'pressen', 'boulders',
              'lichtquellen', 'spiegel', 'kristalle', 'leuchtkristalle', 'coins'):
        for o in d.get(f, []): el.add((B.spalte(o['x']), B.reihe(o['y'])))
    for f in ('winds', 'movingPlatforms', 'switchFloors', 'lava', 'baender', 'oneways', 'dunkelzonen', 'lavaPegel'):
        for o in d.get(f, []):
            for z in B.felder_zellen(o) if 'w' in o else [(B.spalte(o['x']), B.reihe(o['y']))]: el.add(z)
    for h in d.get('hooks', []):   # Haken-Umkreis frei lassen
        hc, hr = B.spalte(h['x']), B.reihe(h['y'])
        for dc in range(-5, 6):
            for dr in range(-5, 6): el.add((hc + dc, hr + dr))
    bot = bot_zellen(lv.datei)
    out = []
    for g in LV.vermessen(lv.datei)['gruben']:
        if not (6 <= g['breite'] <= 16) or g['dy'] != 0: continue
        c0, c1, r = g['von'] + 1, g['nach'] - 1, g['reihe']
        zellen = [(c, rr) for c in range(c0 - 3, c1 + 3) for rr in range(r - 4 - dicke, r - 3)]
        if any(lv.typ(*z) is not None or z in el or z in bot for z in zellen): continue
        if any((c, rr) in bot for c in range(c0 - 1, c1 + 2) for rr in (r - 4, r - 5)): continue
        out.append((c0, c1 - c0 + 1, r))
    return out

def _elemente_zellen(d, haken_umkreis=4):
    import bildregel_pruefen as B
    el = set()
    for f in ('hooks', 'switches', 'doors', 'plates', 'bouncers', 'checkpoints', 'teleporters', 'traps', 'pressen', 'boulders',
              'lichtquellen', 'spiegel', 'kristalle', 'leuchtkristalle', 'coins', 'spikes'):
        for o in d.get(f, []): el.add((B.spalte(o['x']), B.reihe(o['y'])))
    for f in ('winds', 'movingPlatforms', 'switchFloors', 'baender', 'oneways', 'bruchWaende', 'haftflaechen'):   # Dunkelzonen/Lava-Marken sind kein Hindernis
        for o in d.get(f, []):
            for z in B.felder_zellen(o) if 'w' in o else [(B.spalte(o['x']), B.reihe(o['y']))]: el.add(z)
            if f == 'movingPlatforms' and 'targetX' in o:
                el.update(B.felder_zellen({**o, 'x': o['targetX'], 'y': o.get('targetY', o['y'])}))
    for h in d.get('hooks', []):
        hc, hr = B.spalte(h['x']), B.reihe(h['y'])
        for dc in range(-haken_umkreis, haken_umkreis + 1):
            for dr in range(-haken_umkreis, haken_umkreis + 1): el.add((hc + dc, hr + dr))
    return el

def haftarm_plaetze(lv, laenge=7, abstand=25, richtung=1):
    """S2-Plätze: Bodenkante (c_l, r) – rechts davon Leere; darüber passt ein Felsarm (Reihen r-6..r-5) mit Haftfläche
    (Reihe r-4) von c_l-2 bis c_l+laenge, ohne Kästchen, Elemente oder alte Bot-Wege zu berühren -> [(c_l, r)]"""
    el = _elemente_zellen(lv.alt_spiel); bot = bot_zellen(lv.datei)
    out = []
    for (c, r), t in sorted(lv.t.items()):
        if t not in ('ground', 'wall') or r < 7 or r > 16 or c < 12: continue
        R = richtung
        if lv.typ(c, r - 1) is not None or lv.typ(c + R, r) is not None: continue   # Kante: zur Arm-Seite kein Boden
        if lv.typ(c - R, r) is None or lv.typ(c - 2 * R, r) is None: continue       # auf der anderen Seite Boden zum Stehen
        spalten = lambda a, b: range(min(c + a * R, c + b * R), max(c + a * R, c + b * R) + 1)
        arm = [(cc, rr) for cc in spalten(-2, laenge) for rr in range(r - 6, r - 3)]
        unter = [(cc, rr) for cc in spalten(-2, laenge + 1) for rr in range(r - 3, r)]
        leer = [(cc, rr) for cc in spalten(1, laenge) for rr in range(r, min(18, r + 4))]
        if any(lv.typ(*z) is not None or z in el or z in bot for z in arm): continue
        if any(lv.typ(*z) is not None or z in el for z in unter): continue
        if any(lv.typ(*z) not in (None, 'lava') for z in leer): continue   # unter dem Arm darf Lava sein
        if out and c - out[-1][0] < abstand: continue
        out.append((c, r))
    return out

def s2_haftarm(lv, c, r, laenge=7, muenze=None, richtung=1):
    """S2 bauen: Fels Reihen r-6..r-5, Haftfläche Reihe r-4 von c-2 bis c+laenge; Münze (verschoben, Meister) unter dem
    Arm-Ende (c+laenge, r-3)"""
    R = richtung
    for k in range(-2, laenge + 1):
        cc = c + k * R
        for rr in (r - 6, r - 5): lv.kachel(cc, rr, 'wall')
        lv.haft(cc, r - 4)
    if muenze:
        ce = c + laenge * R
        lv.muenze_verschieben(muenze[0], muenze[1], ce, r - 3); lv.muenze_klasse(ce, r - 3, 'meister')
    return lv

FEST = ('ground', 'wall')

def haftinsel_plaetze(lv, laenge=5, abstand=25):
    """S3-Plätze: flacher Boden (Oberkante Reihe g) über laenge+6 Spalten, darüber 7 Reihen frei; dort schwebt eine Insel
    aus Haftfläche in Reihe g-4 (Spalten a..a+laenge-1): Oberseite 4 Reihen hoch (Sprung schafft 3) -> [(a, g)]"""
    el = _elemente_zellen(lv.alt_spiel); bot = bot_zellen(lv.datei)
    out = []
    for (c, g), t in sorted(lv.t.items()):
        a = c + 3
        if t not in FEST or g < 5 or g > 17: continue
        spalten = range(a - 3, a + laenge + 3)
        if any(lv.typ(cc, g) not in FEST for cc in spalten): continue
        if any(lv.typ(cc, rr) is not None or (cc, rr) in el for cc in spalten for rr in range(g - 8, g)): continue
        if any((cc, rr) in bot for cc in range(a - 1, a + laenge + 1) for rr in range(g - 6, g - 2)): continue
        if out and a - out[-1][0] < abstand: continue
        out.append((a, g))
    return out

def s3_haftinsel(lv, a, g, laenge=5, muenze=None):
    """S3 bauen: Haftfläche Reihe g-4, Spalten a..a+laenge-1; Münze (verschoben, Meister) oben auf dem rechten Ende"""
    for cc in range(a, a + laenge): lv.haft(cc, g - 4)
    if muenze:
        ce = a + laenge - 1
        lv.muenze_verschieben(muenze[0], muenze[1], ce, g - 5); lv.muenze_klasse(ce, g - 5, 'meister')
    return lv

def bruchnische_plaetze(lv, abstand=25, richtung=1):
    """S4-Plätze: Wandfläche (Kästchen w, Reihe g-1 fest, davor frei mit Boden; richtung 1 = Fläche zeigt nach links, man
    kommt von links), dahinter Fels (w+R und w oben/unten, w+2R hinten) -> [(w, g)]; dort wird (w, g-1) Durchbruch und
    (w+R, g-1) eine Mulde mit Münze"""
    el = _elemente_zellen(lv.alt_spiel); R = richtung
    out = []
    for (w, r), t in sorted(lv.t.items()):
        g = r + 1
        if t not in FEST or g > 17 or g < 1: continue
        if lv.typ(w - R, g - 1) is not None or lv.typ(w - R, g - 2) is not None or lv.typ(w - R, g) not in FEST: continue
        if lv.typ(w - 2 * R, g - 1) is not None or lv.typ(w - 2 * R, g) not in FEST: continue
        if any(lv.typ(*z) not in FEST for z in ((w, g - 2), (w, g), (w + R, g - 2), (w + R, g - 1), (w + R, g), (w + 2 * R, g - 1))): continue
        if any((w + dc * R, rr) in el for dc in range(-3, 3) for rr in range(g - 3, g + 1)): continue
        if out and abs(w - out[-1][0]) < abstand: continue
        out.append((w, g))
    return out

def s4_bruchnische(lv, w, g, muenze=None, richtung=1):
    """S4 bauen: (w, g-1) Durchbruch, (w+R, g-1) leer; Münze (verschoben, Geschick) in die Nische"""
    R = richtung
    lv.bruch(w, g - 1); lv.leer(w + R, g - 1)
    if muenze:
        lv.muenze_verschieben(muenze[0], muenze[1], w + R, g - 1); lv.muenze_klasse(w + R, g - 1, 'geschick')
    return lv

# ---------------- Umbau aller Level (nach dem Nacht-Ausbau) ----------------
def oberkante(lv, c, ab=-3, bis=17):
    """oberste feste Reihe (ground/wall/haft) in Spalte c zwischen ab und bis, sonst None"""
    for r in range(ab, bis + 1):
        if lv.typ(c, r) in ('ground', 'wall', 'haft'): return r
    return None

def landung_heben(lv, c0, c1, neue_oben, typ='ground', unter=None):
    """Landeplatz in den Spalten c0..c1 nach oben verlängern, bis die Oberkante in Reihe neue_oben liegt. Münzen, die
    dabei im Stein landen würden, wandern direkt über die neue Oberkante (Liste/Identität bleibt).
    unter: nur Stein unterhalb dieser Reihe zählt als bisheriger Landeplatz (Standard: alles)"""
    for c in range(c0, c1 + 1):
        alt = oberkante(lv, c, ab=neue_oben if unter is None else unter)
        if alt is None or alt <= neue_oben: continue
        for r in range(neue_oben, alt): lv.kachel(c, r, typ)
        for m in lv.ed.get('coins', []):
            if m['c'] == c and neue_oben <= m['r'] < alt: m['r'] = neue_oben - 1 - (alt - 1 - m['r'])
    return lv
