# tests/level_ascii.py – Hilfe zum Leveldesign: Ausschnitt eines Levels als Text-Bild (Spalten c0..c1, Reihen -3..17).
# # Boden/Wand  ~ Bröckel  = Steg  D Tür  B Durchbruch  H Haftfläche  ^ Stacheln  L Lava  o Haken  P Pilz  w Aufwind
# h Hebel  p Platte  M Affe-Start  F Schwein-Start  C Checkpoint  $ Münze  G Ziel  m bewegte Plattform
# Aufruf: python3 tests/level_ascii.py dschungel/01-dschungel.json 420 470
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import bildregel_pruefen as B

def bild(datei, c0, c1, r0=-3, r1=17):
    d = B.lade(datei); g = {}
    def setz(zellen, ch, nur_leer=False):
        for z in zellen:
            if not nur_leer or z not in g: g[z] = ch
    for s in d.get('solids', []):
        setz(B.felder_zellen(s), {'crumble': '~', 'door': 'D', 'fake': '%'}.get(s.get('type'), '#'))
    for f, ch in (('oneways', '='), ('bruchWaende', 'B'), ('haftflaechen', 'H'), ('lava', 'L'), ('winds', 'w'),
                  ('eis', 'I'), ('baender', '>'), ('movingPlatforms', 'm'), ('switchFloors', 'W')):
        for o in d.get(f, []): setz(B.felder_zellen(o), ch)
    for o in d.get('doors', []):
        w, h = o.get('w', 40), o.get('h', 40)
        setz(B.felder_zellen({'x': o['x'] - w / 2, 'y': o['y'] - h / 2, 'w': w, 'h': h}), 'D')
    pkt = lambda o: (B.spalte(o['x']), B.reihe(o['y']))
    for f, ch in (('spikes', '^'), ('hooks', 'o'), ('bouncers', 'P'), ('switches', 'h'), ('plates', 'p'), ('coins', '$'),
                  ('checkpoints', 'C'), ('teleporters', 'T'), ('traps', 't'), ('pressen', 'X'), ('boulders', 'O')):
        for o in d.get(f, []):
            z = pkt(o)
            if f in ('checkpoints', 'spikes'): z = (B.spalte(o['x']), B.reihe(o['y'] - 1))   # Fußpunkt / Unterkante
            g[z] = ch
    for k, ch in (('startM', 'M'), ('startF', 'F'), ('goal', 'G')):
        if d.get(k): g[(B.spalte(d[k]['x']), B.reihe(d[k]['y']) - 1)] = ch
    zeilen = []
    kopf = ''.join(str(c // 10 % 10) if c % 10 == 0 else ' ' for c in range(c0, c1 + 1))
    zeilen.append('     ' + kopf)
    zeilen.append('     ' + ''.join(str(c % 10) for c in range(c0, c1 + 1)))
    for r in range(r0, r1 + 1):
        zeilen.append(f'{r:4d} ' + ''.join(g.get((c, r), '.') for c in range(c0, c1 + 1)))
    return '\n'.join(zeilen)

if __name__ == '__main__':
    print(bild(sys.argv[1], int(sys.argv[2]), int(sys.argv[3])))
