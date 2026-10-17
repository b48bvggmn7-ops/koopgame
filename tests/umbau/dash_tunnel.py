# Umbau (Regel 5): Dash-Tunnel bauen – Decke 3 Reihen über dem Boden, Stachelgruben (Breite b), dazwischen Podeste (3).
# Ohne Dash kommt man nicht hinüber (die Decke hält den Sprung flach), mit Dash schon – aber nach jeder Grube muss man
# auf dem Podest warten, bis der Dash wieder voll ist (Muster Wipfelsturm 767–793).
# Aufruf: python3 tests/umbau/dash_tunnel.py <level> <x0> <boden-reihe> <gruben> [breite]
#   x0 = erste Spalte der Decke (2 Spalten Boden vor der ersten Grube); Ausgabe: Kanten für dash_kette und Ende
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import level_bau as L

def bauen(lv, x0, F, n, b=10):
    gruben, c = [], x0 + 2
    for i in range(n):
        gruben.append((c, c + b - 1)); c += b + 3
    x1 = gruben[-1][1] + 2
    oben = -3 if F - 4 < 4 else F - 11            # Decke so dick, dass man nicht darüber kommt (Sprung + Dash ~8 Reihen)
    for cc in range(x0, x1 + 1):                    # Münzen in der neuen Decke weg
        for m in list(lv.ed.get('coins', [])):
            if m['c'] == cc and oben <= m['r'] <= F - 4: lv.ed['coins'].remove(m)
    lv.rechteck(x0, oben, x1, F - 4, 'wall')
    tief = min(F + 2, 17)
    for c0, c1 in gruben:
        lv.rechteck(c0, F, c1, tief, None)
        for cc in range(c0, c1 + 1): lv.stachel(cc, tief)
    kanten = [x0 + 1] + [g[1] + 3 for g in gruben[:-1]]
    return kanten, x1 + 2

if __name__ == '__main__':
    lv = L.Level(sys.argv[1])
    kanten, ende = bauen(lv, int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]) if len(sys.argv) > 5 else 10)
    L.speichern([lv])
    print('Kanten', kanten, 'Ende', ende)
