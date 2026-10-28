# Dash nur noch waagerecht (Nutzerwunsch): die Pilz-Dash-Gruben (Landeplatz 9 Reihen hoch, nur Pilz + Dash nach OBEN reichte)
# wieder zu Pilz-Gruben machen: den Turm hinter der Grube (alle Spalten ab l0 mit derselben Oberkante) auf 4 Reihen (kurze
# Grube: 5) über die Absprung-Fläche absenken – Affe: Pilz + Haken, Schweinchen: Pilz + Schirm, Pilz allein reicht nicht. Münzen auf dem Turm
# wandern mit. Einträge in tests/run_tests.py (KOMBI_STELLEN_BOT) -> kombi_pilz_grube, Ziel-Reihe = neue Oberkante - 1.
# Aufruf: python3 tests/umbau/pilzgruben_zurueck.py [--zeigen]
import re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tests'))
import level_bau as L
HOEHE = 4
HOEHE_KURZ = 5   # Grube nur 8 Spalten breit: bei 4 Reihen reicht schon der Pilz allein
FEST = ('ground', 'wall', 'haft', 'crumble')
AUSNAHMEN = set()   # (datei, Pilz-Spalte), die nicht angefasst werden

def oberkante(lv, c, unten):
    """Oberkante des Blocks, der in Spalte c bis zur Reihe unten hinunterreicht (None: dort kein Stein)"""
    if lv.typ(c, unten) not in FEST: return None
    r = unten
    while lv.typ(c, r - 1) in FEST: r -= 1
    return r

if __name__ == '__main__':
    rt_pfad = ROOT / 'tests' / 'run_tests.py'
    rt = rt_pfad.read_text(encoding='utf-8')
    muster = re.compile(r"\('([\w/.-]+)', '([^']*Pilz-[^']*)', kat\((\d+), (-?\d+)\), (kat\([^)]*\)), lambda: kombi_pilz_(?:dash_)?grube\((\d+), (\d+)(?:, hoch=False)?\), \{'m': \(\d+, -?\d+\), 'f': \(\d+, -?\d+\)\}\)")   # erneut aufrufbar
    levels = {}
    for m in muster.finditer(rt):
        datei, name, sc, sr, fs, x0, l0 = m.group(1), m.group(2), int(m.group(3)), int(m.group(4)), m.group(5), int(m.group(6)), int(m.group(7))
        if (datei, x0) in AUSNAHMEN: print(datei, name, 'bleibt (vom Nutzer umgebaut)'); continue
        lv = levels.setdefault(datei, L.Level(datei))
        unten = sr + 1; neu = unten - (HOEHE_KURZ if l0 - x0 <= 8 else HOEHE)
        t = oberkante(lv, l0, unten)
        spalten = []
        c = l0
        while oberkante(lv, c, unten) == t: spalten.append(c); c += 1
        n = neu - t
        if n > 0:
            for c in spalten:
                for r in range(t, neu): lv.leer(c, r)
            for k in lv.ed.get('coins', []):
                if k['c'] in spalten and t - 3 <= k['r'] < t: k['r'] += n
        print(datei, name, 'Turm', spalten[0], '-', spalten[-1], 'Oberkante', t, '->', neu)
        neuer_name = name.replace('Pilz-Dash-Stachelgrube', 'Pilz-Stachelgrube').replace('Pilz-Dash-Grube', 'Pilz-Grube')
        ersatz = (f"('{datei}', '{neuer_name}', kat({sc}, {sr}), {fs}, lambda: kombi_pilz_grube({x0}, {l0}), "
                  f"{{'m': ({l0}, {neu - 1}), 'f': ({l0}, {neu - 1})}})")
        rt = rt.replace(m.group(0), ersatz)
    if '--zeigen' not in sys.argv:
        L.speichern(list(levels.values()))
        rt_pfad.write_text(rt, encoding='utf-8')
