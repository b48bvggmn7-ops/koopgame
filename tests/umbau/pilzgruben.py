# Umbau aller Level: Pilz-Gruben (KOMBI_STELLEN_BOT mit kombi_pilz_grube(x0, l0)) zu Pilz-Dash-Gruben umbauen:
# Landeplatz (Spalten l0.. bis zu 4 breit, so weit dort Stein ist) bis 9 Reihen über die Pilz-Fläche verlängern,
# Eintrag in tests/run_tests.py auf kombi_pilz_dash_grube umstellen (Ziel-Reihe = neue Oberkante - 1).
# Aufruf: python3 tests/umbau/pilzgruben.py <level-datei> [x0 ...]   (ohne x0: alle Pilz-Gruben des Levels)
import re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tests'))
import level_bau as L
HOEHE = 9

def umbauen(datei, nur=None):
    rt = (ROOT / 'tests' / 'run_tests.py').read_text(encoding='utf-8')
    muster = re.compile(r"\('" + re.escape(datei) + r"', '([^']*)', (kat\([^)]*\)), (kat\([^)]*\)), lambda: kombi_pilz_grube\((\d+), (\d+)\), \{'m': \((\d+), (-?\d+)\), 'f': \((\d+), (-?\d+)\)\}\)")
    lv = L.Level(datei); neu = rt; gemacht = []
    for m in muster.finditer(rt):
        name, ms, fs, x0, l0 = m.group(1), m.group(2), m.group(3), int(m.group(4)), int(m.group(5))
        if nur and x0 not in nur: continue
        pilz = [b for b in lv.ed.get('bouncers', []) if b['c'] == x0]
        if not pilz: print('kein Pilz bei', x0); continue
        flaeche = pilz[0]['r'] + 1
        oben = flaeche - HOEHE
        spalten = [c for c in range(l0, l0 + 4) if L.oberkante(lv, c, ab=-3) is not None and L.oberkante(lv, c, ab=-3) > oben]
        bis = l0
        while bis + 1 in spalten: bis += 1
        L.landung_heben(lv, l0, bis, oben)
        alt = m.group(0)
        n = alt.replace(f"kombi_pilz_grube({x0}, {l0})", f"kombi_pilz_dash_grube({x0}, {l0})").replace("'" + name + "'", "'" + name.replace('Pilz-Grube', 'Pilz-Dash-Grube').replace('Pilz-Stachelgrube', 'Pilz-Dash-Stachelgrube') + "'")
        n = re.sub(r"\{'m': \(\d+, -?\d+\), 'f': \(\d+, -?\d+\)\}", f"{{'m': ({l0}, {oben - 1}), 'f': ({l0}, {oben - 1})}}", n)
        neu = neu.replace(alt, n)
        gemacht.append((x0, l0, bis, oben))
    L.speichern([lv])
    (ROOT / 'tests' / 'run_tests.py').write_text(neu, encoding='utf-8')
    return gemacht

if __name__ == '__main__':
    print(umbauen(sys.argv[1], [int(x) for x in sys.argv[2:]] or None))
