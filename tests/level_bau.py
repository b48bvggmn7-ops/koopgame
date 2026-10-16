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
