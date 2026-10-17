# Umbau aller Level: Flammen-/Kamin-Gruben (Baustein kombi_flammen_kamin: linke Säule x0, Kamin breite, rechte Wand
# x0+breite+1, Grube, Landeplatz) gegen „Sprung + Dash hoch + Schirm“ absichern: rechte Kaminwand und Landeplatz um
# `hoch` Reihen höher (Bröckel-Spitze der Wand wandert mit nach oben). Danach reicht Sprung + Dash (~7,5 Reihen) nicht
# mehr, um den Kamin zu überspringen – Klettern + Haken bzw. Schirm bleiben nötig.
# Aufruf: python3 tests/umbau/kamine_heben.py <level-datei> <x0> [<x0> ...] [--hoch 3] [--breite 3] [--grube 9]
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import level_bau as L

FEST = ('ground', 'wall', 'haft')

def heben(lv, x0, hoch=3, breite=3, grube=9):
    rw = x0 + breite + 1; l0 = rw + 1 + grube
    # beide Kaminwände (Höhenverhältnis bleibt, sonst klettert die zweite Figur nach dem Abbröckeln links hinaus):
    # oberstes Kästchen (meist Bröckel-Spitze) finden, Wand nach oben verlängern, Spitze wandert mit
    for wc in (x0, rw):
        top = next(r for r in range(-3, 18) if lv.typ(wc, r) in FEST + ('crumble',))
        spitze = lv.typ(wc, top)
        for r in range(max(-3, top - hoch), top): lv.kachel(wc, r, 'wall')
        if spitze == 'crumble': lv.kachel(wc, top, 'wall'); lv.kachel(wc, max(-3, top - hoch), 'crumble')
        if wc == rw: wand_oben = top - hoch
    # Landeplatz: der ganze Block ab l0 (Spalten, die zwei Reihen unter der Oberkante fest sind – auch mit Versteck oben)
    alt = L.oberkante(lv, l0)
    fest = lambda c, r: lv.typ(c, r) in FEST or any(b['c'] == c and b['r'] == r for b in lv.ed.get('bruchWaende', []))
    c1 = l0
    while fest(c1 + 1, alt + 2): c1 += 1
    # die obersten 3 Reihen (mit Bröckel/Durchbruch, Versteck-Münzen, Münzen direkt darüber) wandern hoch Reihen nach oben,
    # darunter wird mit Boden aufgefüllt
    for c in range(l0, c1 + 1):
        teile = {r: lv.typ(c, r) for r in range(alt, alt + 3)}
        bruch = [b for b in lv.ed.get('bruchWaende', []) if b['c'] == c and alt <= b['r'] < alt + 3]
        for r in range(alt, alt + 3): lv.leer(c, r)
        for b in bruch: b['r'] -= hoch
        for r, t in teile.items():
            if t: lv.kachel(c, r - hoch, t)
        for r in range(alt + 3 - hoch, alt + 3):
            if lv.typ(c, r) is None and not any(b['c'] == c and b['r'] == r for b in lv.ed.get('bruchWaende', [])): lv.kachel(c, r, 'ground')
        for m in lv.ed.get('coins', []):
            if m['c'] == c and alt - 1 <= m['r'] < alt + 3: m['r'] -= hoch
    # Haft-Arm (S2) am Block (Haftfläche 4 Reihen über der alten Oberkante, Fels darüber, Münze am Arm-Ende): mit nach oben
    arm = [c for c in range(l0 - 2, c1 + 12) if lv.typ(c, alt - 4) == 'haft']
    for c in arm:
        teile = {r: lv.typ(c, r) for r in range(alt - 9, alt - 3)}
        for r in teile: lv.leer(c, r)
        for r, t in teile.items():
            if t: lv.kachel(c, r - hoch, t)
    if arm:
        for m in lv.ed.get('coins', []):
            if arm[0] <= m['c'] <= arm[-1] + 1 and alt - 4 <= m['r'] <= alt - 1 and not (l0 <= m['c'] <= c1): m['r'] -= hoch
    # Flamme über der Grube (Flammen-Kamin, Spalte rw+4) gehört zur Absprunghöhe -> mit nach oben
    for t in lv.ed.get('traps', []):
        if rw < t['c'] <= rw + grube and t['r'] < alt: t['r'] = max(-3, t['r'] - hoch)
    # Haken über der Grube ebenso (sonst greift der Affe von oben nach einem Haken unter sich)
    for h in lv.ed.get('hooks', []):
        if rw < h['c'] <= rw + grube and h['r'] < alt: h['r'] = max(-3, h['r'] - hoch)
    return {'x0': x0, 'arm': (arm[0], arm[-1]) if arm else None, 'wand': rw, 'wand_oben': wand_oben, 'landung': (l0, c1), 'landung_oben': alt - hoch}

if __name__ == '__main__':
    a = sys.argv[1:]
    def opt(n, d): return int(a[a.index(n) + 1]) if n in a else d
    hoch, breite, grube = opt('--hoch', 3), opt('--breite', 3), opt('--grube', 9)
    werte = [x for i, x in enumerate(a[1:], 1) if not x.startswith('--') and not (i > 0 and a[i - 1].startswith('--'))]
    lv = L.Level(a[0])
    for x in werte: print(heben(lv, int(x), hoch, breite, grube))
    L.speichern([lv])
