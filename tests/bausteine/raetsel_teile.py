# tests/bausteine/raetsel_teile.py – Dschungel-Neu: die zwei schweren Logik-Rätsel als eigene kurze Teile am Ende der
# Abschnitte (Teil 4 von Abschnitt 1 bzw. 2). Gebaut über den echten Editor (tests/level_bau.py), beide Formate.
#
# Rätsel 1 „Windrad-Lichtung“ (07, nach der Lianenschlucht): EIN Windrad-Paar mit Nummer 1 schaltet drei Dinge
#   (ein Windrad vor, eins hinter Grube 1, ein drittes jenseits der Mauer) gleichzeitig – die Brücke über Grube 1 (B: da, wenn 1 an), den Riegel im Mauer-Tunnel (A: da, wenn 1 aus) und den
#   Boden über Grube 3 (A: da, wenn 1 aus). Lösung: Affe pustet Windrad 1 an (Brücke) -> beide hinüber -> Affe pustet das
#   Schweinchen über die hohe Mauer -> es legt Hebel 2 um (Tür im Tunnel) -> der Affe geht durch den Tunnel, SOLANGE 1 noch
#   an ist (sonst sperrt der Riegel) -> drüben pustet er das zweite Windrad 1 aus -> Boden über Grube 3 -> beide ins Ziel.
#   Denkfalle: „Windrad gleich wieder ausschalten“ sperrt den Tunnel (wieder anpusten hilft).
# Rätsel 2 „Meteoritenkrater“ (08, nach dem Wipfelsturm, mit dem Meteoriten vor dem Ziel): Windrad 1 (Brücke B / Sims A /
#   Boden über Grube 3 A), Hebel 2 (Tür im Tunnel), Windrad 3 (Riegel im Tunnel, A: da, wenn 3 aus). Lösung: Affe pustet 1
#   an -> beide hinüber -> Affe pustet 1 WIEDER AUS (Brücke weg, dafür Sims an der Mauer und Boden über Grube 3) ->
#   Schweinchen-Trampolin: der Affe federt aufs Sims, springt auf die Mauer, hinunter -> Hebel 2 + Windrad 3 -> Tunnel
#   offen -> das Schweinchen kommt nach -> beide über Grube 3. Denkfalle: pustet der Affe das Schweinchen (wie in Rätsel 1)
#   über die Mauer, kommt er selbst nie hinüber (kein Trampolin mehr auf seiner Seite) – Neustart am Checkpoint.
# Aufruf: python3 tests/bausteine/raetsel_teile.py   (baut beide Teile neu)
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / 'tests'))
import level_bau as L

FEST = 'ground'

def neues_level(datei, cols, info):
    """leeres Teil-Level (beide Formate werden beim Speichern über den Editor geschrieben)"""
    lv = L.Level.__new__(L.Level)
    lv.datei = datei
    lv.ed = {'name': info['titel'], 'cols': cols, 'tiles': [], 'hooks': [], 'switches': [], 'doors': [], 'spikes': [], 'coins': [],
             'checkpoints': [], 'startM': {'c': 9, 'r': 15}, 'startF': {'c': 11, 'r': 15}, 'goal': {'c': cols - 12, 'r': 15},
             'movers': [], 'plates': [], 'switchFloors': [], 'windraeder': [], 'meteoriten': [], **info}
    lv.alt_spiel = {k: v for k, v in info.items() if k != 'titel'}   # Titel steht nur in levels.json / Editor-Datei
    lv.t = {}
    lv.notiz = []
    return lv

def boden(lv, c0, c1, oben):
    for c in range(c0, c1 + 1):
        for r in range(oben, 18): lv.kachel(c, r, FEST)

def grube(lv, c0, c1, gruppe, link):
    """Grube c0..c1: Stacheln ganz unten (Reihe 17), darüber in Reihe 16 Wechselboden (gruppe/link) – fehlt er, fällt man"""
    for c in range(c0, c1 + 1):
        lv.punkt('spikes', c, 17, dir=0)
        if gruppe: lv.punkt('switchFloors', c, 16, gruppe=gruppe, link=link)

def eingang(lv, stufen):
    """Treppe hinunter vom Ende des vorigen Teils: [(c0, c1, oben), …]"""
    for c0, c1, oben in stufen: boden(lv, c0, c1, oben)

def mauer_tunnel(lv, c0, c1, oben, tuer_link, riegel_link):
    """hohe Mauer c0..c1 (Oberkante oben) mit Tunnel in den Reihen 13–15: Tür (Hebel) links, Riegel (Wechsel A) rechts"""
    for c in range(c0, c1 + 1):
        for r in range(oben, 18):
            if not (13 <= r <= 15): lv.kachel(c, r, FEST)
    for r in (13, 14, 15):
        lv.punkt('doors', c0, r, link=tuer_link)
        lv.punkt('switchFloors', c1, r, gruppe='A', link=riegel_link)

def grube1(lv):
    """Grube 1 (20–30) unter einer niedrigen Decke (Baumstamm, Reihen 8–13: kein Segeln hinüber) mit Brücke B 1; Windrad 1
    an beiden Ufern (16 vor der Grube, 35 dahinter – nur der Affe dreht sie)"""
    grube(lv, 20, 30, 'B', 1)
    for c in range(20, 31):
        for r in range(8, 14): lv.kachel(c, r, FEST)
    lv.punkt('windraeder', 16, 15, link=1); lv.punkt('windraeder', 35, 15, link=1)

def muenzen(lv, liste):
    for c, r, farbe in liste: lv.muenze(c, r, farbe)

def raetsel1():
    info = {'welt': 'dschungel', 'tageszeit': 'mittag', 'wetter': 'regen', 'titel': 'Windrad-Lichtung'}
    lv = neues_level('dschungel/07-windrad-lichtung.json', 96, info)
    eingang(lv, [(0, 3, 9), (4, 5, 11), (6, 7, 13)])
    boden(lv, 8, 19, 16)
    grube1(lv)
    boden(lv, 31, 47, 16)
    mauer_tunnel(lv, 48, 50, 7, 2, 1)
    boden(lv, 51, 62, 16)
    lv.punkt('switches', 53, 15, link=2)
    lv.punkt('windraeder', 59, 15, link=1)               # zweites Windrad derselben Nummer, nur von hier
    grube(lv, 63, 74, 'A', 1)
    boden(lv, 75, 95, 16)
    lv.ed['goal'] = {'c': 84, 'r': 15}
    lv.checkpoint(10, 15)
    muenzen(lv, [(14, 13, 'blue'), (15, 13, 'pink'), (25, 15, 'blue'), (36, 13, 'pink'), (49, 4, 'pink'), (49, 14, 'blue'),
                 (57, 13, 'blue'), (66, 13, 'pink'), (70, 13, 'blue'), (80, 13, 'pink')])
    return lv.merke('Dschungel-Neu: Rätsel 1 Windrad-Lichtung')

def raetsel2():
    info = {'welt': 'dschungel', 'tageszeit': 'nacht', 'wetter': 'wechselnd', 'titel': 'Meteoritenkrater'}
    lv = neues_level('dschungel/08-meteoritenkrater.json', 100, info)
    eingang(lv, [(0, 3, 6), (4, 5, 9), (6, 7, 12)])
    boden(lv, 8, 19, 16)
    grube1(lv)
    boden(lv, 31, 47, 16)
    for c in (45, 46): lv.punkt('switchFloors', c, 11, gruppe='A', link=1)   # Sims an der Mauer: nur da, wenn 1 aus (5 Reihen: nur mit Trampolin)
    mauer_tunnel(lv, 48, 50, 8, 2, 3)
    boden(lv, 51, 62, 16)
    lv.punkt('switches', 53, 15, link=2)
    lv.punkt('windraeder', 59, 15, link=3)
    grube(lv, 63, 74, 'A', 1)
    boden(lv, 75, 99, 16)
    lv.ed['goal'] = {'c': 90, 'r': 15}
    lv.punkt('meteoriten', 83, 15, art='meteorit')       # der Meteorit, vor dem Ziel
    for c, art in ((78, 'brocken'), (87, 'splitter'), (33, 'splitter'), (40, 'splitter'), (55, 'brocken'), (12, 'splitter')):
        lv.punkt('meteoriten', c, 15, **({'art': art} if art != 'splitter' else {}))
    lv.checkpoint(10, 15)
    muenzen(lv, [(14, 13, 'blue'), (15, 13, 'pink'), (25, 15, 'blue'), (36, 13, 'pink'), (45, 9, 'blue'), (49, 5, 'pink'),
                 (49, 14, 'pink'), (57, 13, 'blue'), (66, 13, 'pink'), (70, 13, 'blue'), (79, 12, 'pink'), (80, 12, 'blue')])
    return lv.merke('Dschungel-Neu: Rätsel 2 Meteoritenkrater')

if __name__ == '__main__':
    lvs = [raetsel1(), raetsel2()]
    L.speichern(lvs)
    for lv in lvs: print(lv.datei, lv.notiz)
