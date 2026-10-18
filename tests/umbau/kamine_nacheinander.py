# Umbau: alle noch nicht geweiteten Kamin-Gruben eines Levels nacheinander weiten – nach jedem Schritt werden die aktuellen
# Kamin-Spalten neu aus KOMBI_STELLEN_BOT gelesen (Verschiebungen bewegen auch andere Kamine), es kommt immer der Kamin mit
# dem kürzesten Verschiebestück dran. Aufruf: python3 tests/umbau/kamine_nacheinander.py <level> [--max 60]
import sys, re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tests')); sys.path.insert(0, str(ROOT / 'tests' / 'umbau'))
import level_bau as L, kamine_umbauen as K

def offene(datei):
    s = (ROOT / 'tests' / 'run_tests.py').read_text(encoding='utf-8')
    return [int(m.group(1)) for m in re.finditer(r"\('" + re.escape(datei) + r"', '[^']*', kat\([^)]*\), kat\([^)]*\), lambda: kombi_flammen_kamin\((\d+), \d+(?![^)]*weit=)[^)]*\)", s)]

def weg(lv, x0):
    rw = x0 + 4; p = rw + 10
    q = K.suche_rechts(lv, p + 3); ql = K.suche_links(lv, x0 - 2)
    return min((q - p) if q else 9999, (rw - (ql + 8)) if ql is not None else 9999)

if __name__ == '__main__':
    a = sys.argv[1:]; datei = a[0]; mw = int(a[a.index('--max') + 1]) if '--max' in a else 60
    erledigt = set()
    while True:
        xs = [x for x in offene(datei) if x not in erledigt]
        if not xs: break
        lv = L.Level(datei)
        x0 = min(xs, key=lambda x: weg(lv, x))
        if weg(lv, x0) > mw: print('Rest ohne kurze Ausgleichsstrecke:', xs, [weg(lv, x) for x in xs]); break
        log = K.umbauen(datei, [x0], mw)
        erledigt.add(log[-1].get('neu_x0', x0))
