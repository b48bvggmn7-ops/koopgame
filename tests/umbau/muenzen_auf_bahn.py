# Umbau: Münzen, die keine Prüfung einsammelt (Haken-Ketten, Fahrten …), auf die echte Bahn der Test-Bots legen.
# Eingabe: offene Münzen (JSON {level: [[c, r, farbe, hilfe], ...]}) und die Bahnen der Bots aus einem Testlauf mit
#   MUENZ_BAHN=<datei> MUENZ_LEVELS=<level,...> python3 tests/run_tests.py
# Die Spalte bleibt; die Reihe wird so gewählt, dass die Figur (blau = Affe, pink = Schweinchen) in ihrer Bahn durch die
# Münze fliegt (wie updateCoins: |dx| < 24, |dy| < 26). Ohne Bahn in dieser Spalte: Münze wird nur gemeldet.
# Aufruf: python3 tests/umbau/muenzen_auf_bahn.py <offen.json> <bahnen.jsonl> [--schreiben]
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tests'))

def plan(offen, bahnen):
    pkt = {}
    for zeile in open(bahnen, encoding='utf-8'):
        e = json.loads(zeile)
        for wer in ('m', 'f'): pkt.setdefault((e['level'], wer), []).extend(e['trace'][wer])
    out = {}
    for level, liste in offen.items():
        for c, r, farbe, hilfe in liste:
            wer = 'm' if farbe == 'blue' else 'f'
            mx = c * 40 + 20
            ys = [y for x, y in pkt.get((level, wer), []) if abs(x - mx) < 20]
            if not ys: out.setdefault(level, []).append((c, r, None, hilfe)); continue
            # nächste Reihe zur alten Lage, durch die die Bahn geht
            kand = sorted({int((y - 20 + 20) // 40) for y in ys} | {int(y // 40) for y in ys}, key=lambda rr: abs(rr - r))
            neu = next((rr for rr in kand if any(abs(y - (rr * 40 + 20)) < 22 for y in ys)), None)
            out.setdefault(level, []).append((c, r, neu, hilfe))
    return out

if __name__ == '__main__':
    offen = json.load(open(sys.argv[1], encoding='utf-8'))
    p = plan(offen, sys.argv[2])
    for level, liste in p.items():
        for c, r, neu, hilfe in liste:
            print(level, f'({c},{r})', hilfe, '->', 'keine Bahn' if neu is None else f'Reihe {neu}')
    if '--schreiben' in sys.argv:
        import level_bau as L
        lvs = []
        for level, liste in p.items():
            lv = L.Level(level); n = 0
            for c, r, neu, hilfe in liste:
                if neu is None or neu == r: continue
                for m in lv.ed['coins']:
                    if m['c'] == c and m['r'] == r: m['r'] = neu; n += 1; break
            if n: lvs.append(lv)
        if lvs: L.speichern(lvs)
        print(len(lvs), 'Level geschrieben')
