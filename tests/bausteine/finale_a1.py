# tests/bausteine/finale_a1.py – Nutzerwunsch 20.11.: das Ende von Abschnitt 1 (Spalten 4756 bis Ziel) als großes Logik-Rätsel.
# DRITTE Fassung („deutlich schwerer … das ist mir echt zu einfach“; gewählt: mehr Denken, knappere Zeit, härtere Sprünge – KEINE
# Stacheln). Weiter gilt aus der zweiten Fassung: Türen/Wände immer 2 dick, Schalter nur mit Sprung + Dash bzw. von einem Sims aus
# gerade so, die Höhe nutzen.
#
# Teil 1 – zwei Hindernisse auf Zeit:
#   H1 „Rammen und rennen“  Der hängende Balken (66, Zeitfenster 4 s) öffnet eine Tür HOCH oben in der Wand. Das Schweinchen rammt
#       ihn (Sprung + Dash nach oben) und muss dann selbst über Stufe -> Kanzel (Weitsprung, 3 Reihen höher) -> Tür-Schwelle hinauf,
#       bevor der Balken wieder draußen ist. Der Affe wartet oben auf der Kanzel und schlüpft im selben Zeitfenster durch.
#   H2 „Atem-Treppe“        Über die hohe Mauer führen nur zwei Wechselboden-Stufen (67, fest solange AN). Diesseits hängt ein Windrad
#       (67, „solange es dreht“): der Affe pustet, das Schweinchen muss hinüber, bevor ihm die Puste ausgeht. Drüben hängt ein Balken
#       (67, Zeitfenster 3 s): das Schweinchen rammt ihn, der Affe klettert in dieser Zeit hinterher.
# Checkpoint – danach
# Teil 2 – die „Maschine“: sechs Räume auf zwei Etagen (unten G0 G1 G2, oben U0 U1 U2), vier Nummern A B C D (71–74).
#   Wände (2 dick, jedes Kästchen ein eigener Wechselboden – man kommt nur durch, wenn BEIDE offen sind):
#       G0|G1: A AN und D AUS      G1|G2: B AN und C AUS      U0|U1: C AUS und A AUS      U1|U2: A AN und C AN
#   Luken im Boden der oberen Etage (offen = man fällt hinunter; hinauf kommt das Schweinchen allein mit Sprung + Dash nach oben,
#   der Affe nur über den Schirm des Schweinchens darunter):   Luke 0: D AN     Luke 1: A AUS     Luke 2: B AUS
#   Schalter:  G0 Windrad A (im Schacht über dem Sims: hinaufspringen, nach oben pusten)    U0 Rammbalken C (Sprung + Dash)
#              U1 Hebel C (auf dem Sims) und Rammbalken D (hängt, Sprung + Dash nach oben)
#              U2 Rammbalken B (über dem Tor) und Windrad D (hoch oben, gerade so)
#   Tor (oben rechts, 2 dick): braucht A + B + D.
#   Kürzester Weg: 10-mal schalten (durchgerechnet in tests/bausteine/finale_a1_logik.py, dort steht auch der Lösungsweg). Es gibt
#   wenige Lagen, aus denen es nicht weitergeht (beide getrennt, keiner erreicht mehr einen passenden Schalter) – dafür der
#   Checkpoint am Eingang und im Pausenmenü „Zurück zum Checkpoint“ (setzt nur die Maschine zurück).
# Geprüft mit tests/bausteine/finale_a1_loesung.py (echte Physik, Gegenproben).
# Aufruf: python tests/bausteine/finale_a1.py   (baut neu, schreibt beide Level-Formate über den Editor-Export)
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import level_bau as L

DATEI = 'dschungel/abschnitt-1-sternschnuppenspur.json'
AB = 4756            # ab dieser Spalte wird alles neu gebaut (Checkpoint bei 4755 bleibt)
BODEN = 16           # Reihe des Bodens (man steht auf seiner Oberkante)
OBEN = -3            # oberste bebaubare Reihe
ETAGE = 10           # Reihe des Bodens der oberen Etage (6 Reihen über dem Boden: ein Sprung reicht nicht)
N_H1, N_H2 = 66, 67
N_A, N_B, N_C, N_D = 71, 72, 73, 74
ZEIT_H1, ZEIT_H2 = 4, 3
STUFE_REIHE = 13     # Stufen/Simse unten: 3 Reihen über dem Boden (ein voller Sprung)
HAENG_REIHE = 8      # hängender Rammbalken unten: Stirnseite 6 Kästchen über dem Boden – nur Sprung + Dash nach oben erreicht sie
WIND_BODEN = 7       # Windrad, das der Wind nach oben vom Boden aus gerade so erreicht
MAUER_REIHE = 7      # Oberkante der Mauer von H2 (9 Reihen hoch)
SCHACHT_REIHE = 6    # Windrad A im Schacht: vom Boden aus reicht der Wind nach oben nur bis Reihe 7
M0 = 4806            # erste Spalte der Maschine (Raum 0); Räume je 10 breit, Wände je 2 dick

# Alle Spalten an einer Stelle (das Lösungs-Skript finale_a1_loesung.py benutzt dieselben)
S = dict(
    haeng1=4759,                      # H1: hängender Rammbalken (66, 5 s)
    stufe1=4763,                      # H1: Stufe (2 breit, Reihe 13)
    kanzel1=4769,                     # H1: Kanzel (2 breit, Reihe 10) – 4 Kästchen Lücke, 3 Reihen höher (5 gehen nur mit vollem Anlauf)
    tuer1=4776,                       # H1: Wand (2 dick) mit der Tür oben (Reihen 7–9), 5 Kästchen Lücke hinter der Kanzel
    wind2=4780,                       # H2: Windrad (67, solange es dreht), hoch
    tritt1=4783, tritt2=4789,         # H2: zwei Wechselboden-Stufen (je 2 breit; Reihe 13 und Reihe 10)
    mauer=4795,                       # H2: Mauer (2 dick, Oberkante Reihe 7)
    haeng2=4799,                      # H2: hängender Rammbalken (67, 3 s) hinter der Mauer
    checkpoint=4802,
    m0=M0,
    wand_links=M0 - 2,                # Außenwand der oberen Etage (2 dick)
    wind_a=M0, sims_a=M0,             # G0: Sims (Reihe 13, 2 breit); das Windrad A sitzt darüber in einem Schacht in der Decke (Reihe 6)
    balken_c=M0 + 2,                  # U0: Rammbalken C ragt aus dem Schacht-Klotz nach rechts
    luke0=M0 + 6,
    w0=M0 + 10,                       # Wand Raum 0 | Raum 1 (unten und oben)
    sims_c=M0 + 13,                   # U1: Sims mit dem Hebel C
    luke1=M0 + 16,
    haeng_d=M0 + 19,                  # U1: hängender Rammbalken D
    w1=M0 + 22,                       # Wand Raum 1 | Raum 2
    luke2=M0 + 26,
    wind_d=M0 + 30,                   # U2: Windrad D hoch oben
    balken_b=M0 + 33,                 # U2: Rammbalken B über dem Tor
    tor=M0 + 34,                      # Tor (2 dick, oben)
    ziel=M0 + 40, boden_bis=4866,
)

FELDER = ['hooks', 'switches', 'doors', 'spikes', 'coins', 'plates', 'switchFloors', 'windraeder', 'rammbalken', 'blattFloesse',
          'flossRaeder', 'draisinen', 'meteoriten', 'bouncers', 'bruchWaende', 'pusteblumen', 'trommeln', 'checkpoints']
UNTEN3 = (13, 14, 15)      # Reihen der Durchgänge unten
OBEN3 = (7, 8, 9)          # Reihen der Durchgänge oben

def gruppe(an):
    """Wechselboden, der OFFEN ist, wenn die Nummer AN (an=1) bzw. AUS (an=0) ist: A = fest solange aus, B = fest solange an."""
    return 'A' if an else 'B'

def mauer(lv, c, r0, r1, frei=()):
    for cc in (c, c + 1):
        for r in range(r0, r1 + 1):
            if r in frei: lv.leer(cc, r)
            else: lv.kachel(cc, r, 'ground')

def wechselwand(lv, c, reihen, bed):
    """bed = [(nummer, an), (nummer, an)]: je Kästchen-Spalte eine Bedingung."""
    for k, (nr, an) in enumerate(bed):
        for r in reihen: lv.punkt('switchFloors', c + k, r, gruppe=gruppe(an), link=nr, takt=0)

def luke(lv, c, nr, an):
    for cc in (c, c + 1):
        lv.leer(cc, ETAGE); lv.punkt('switchFloors', cc, ETAGE, gruppe=gruppe(an), link=nr, takt=0)

def haengebalken(lv, c, reihe, link, **extra):
    """Erd-Klotz (2 breit) mit einem Rammbalken, der nach unten hängt."""
    lv.kachel(c, reihe - 1, 'ground'); lv.kachel(c + 1, reihe - 1, 'ground')
    lv.punkt('rammbalken', c, reihe, link=link, wand='oben', **extra)

def bauen():
    lv = L.Level(DATEI)
    # ---- alles ab AB abräumen ----
    for (c, r) in [k for k in lv.t if k[0] >= AB]: lv.leer(c, r)
    for f in FELDER: lv.ed[f] = [p for p in lv.ed.get(f, []) if p['c'] < AB]
    lv.ed['movers'] = [m for m in lv.ed.get('movers', []) if m['c'] < AB]
    lv.rechteck(AB, BODEN, S['boden_bis'], BODEN + 1, 'ground')

    # ---- H1 Rammen und rennen ----
    haengebalken(lv, S['haeng1'], HAENG_REIHE, N_H1, art='zeit', zeit=ZEIT_H1)
    lv.rechteck(S['stufe1'], STUFE_REIHE, S['stufe1'] + 1, STUFE_REIHE, 'ground')
    lv.rechteck(S['kanzel1'], ETAGE, S['kanzel1'] + 1, ETAGE, 'ground')
    mauer(lv, S['tuer1'], OBEN, BODEN - 1, frei=OBEN3)
    for cc in (S['tuer1'], S['tuer1'] + 1):
        for r in OBEN3: lv.punkt('doors', cc, r, link=N_H1)
    # ---- H2 Atem-Treppe ----
    lv.punkt('windraeder', S['wind2'], WIND_BODEN, link=N_H2, art='solange')
    for c, r in ((S['tritt1'], STUFE_REIHE), (S['tritt2'], ETAGE)):
        for cc in (c, c + 1): lv.punkt('switchFloors', cc, r, gruppe='B', link=N_H2, takt=0)
    mauer(lv, S['mauer'], MAUER_REIHE, BODEN - 1)
    haengebalken(lv, S['haeng2'], HAENG_REIHE, N_H2, art='zeit', zeit=ZEIT_H2)
    lv.checkpoint(S['checkpoint'], 15)

    # ---- die Maschine ----
    m = M0
    lv.rechteck(m - 2, ETAGE, S['tor'] + 1, ETAGE, 'ground')                    # Boden der oberen Etage
    mauer(lv, S['wand_links'], OBEN, ETAGE)                                     # Außenwand oben links
    for c, unten, oben in ((S['w0'], [(N_A, 1), (N_D, 0)], [(N_C, 0), (N_A, 0)]),
                           (S['w1'], [(N_B, 1), (N_C, 0)], [(N_A, 1), (N_C, 1)])):
        mauer(lv, c, OBEN, BODEN - 1, frei=UNTEN3 + OBEN3)
        wechselwand(lv, c, UNTEN3, unten); wechselwand(lv, c, OBEN3, oben)
    luke(lv, S['luke0'], N_D, 1); luke(lv, S['luke1'], N_A, 0); luke(lv, S['luke2'], N_B, 0)
    # rechte Außenwand: unten zu, oben das Tor
    mauer(lv, S['tor'], OBEN, BODEN - 1, frei=OBEN3)
    for cc in (S['tor'], S['tor'] + 1):
        for r in OBEN3: lv.punkt('doors', cc, r, link=N_A, und=N_B, und2=N_D)
    # G0: Sims; darüber ein Schacht durch die Decke (ragt als Klotz in U0), ganz oben das Windrad A – nur vom Sims aus nach oben
    # gepustet reicht der Wind hinauf (vom Boden aus ist es zu weit und der Sims ist im Weg, schräg kommt nichts in den Schacht)
    lv.leer(S['wind_a'], ETAGE)
    for r in range(SCHACHT_REIHE, ETAGE): lv.kachel(S['wind_a'] + 1, r, 'ground')
    lv.kachel(S['wind_a'], SCHACHT_REIHE - 1, 'ground'); lv.kachel(S['wind_a'] + 1, SCHACHT_REIHE - 1, 'ground')
    lv.punkt('windraeder', S['wind_a'], SCHACHT_REIHE, link=N_A)
    lv.rechteck(S['sims_a'], STUFE_REIHE, S['sims_a'] + 1, STUFE_REIHE, 'ground')
    # U0: Rammbalken C aus dem Schacht-Klotz, 3 Reihen über dem Boden
    lv.punkt('rammbalken', S['balken_c'], ETAGE - 4, link=N_C, wand='links', art='umschalten')
    # U1: Sims mit Hebel C, hängender Balken D
    lv.rechteck(S['sims_c'], ETAGE - 3, S['sims_c'] + 1, ETAGE - 3, 'ground'); lv.punkt('switches', S['sims_c'], ETAGE - 4, link=N_C)
    haengebalken(lv, S['haeng_d'], HAENG_REIHE - 6, N_D, art='umschalten')
    # U2: Windrad D hoch oben, Rammbalken B über dem Tor
    lv.punkt('windraeder', S['wind_d'], WIND_BODEN - 6, link=N_D)
    lv.punkt('rammbalken', S['balken_b'], ETAGE - 4, link=N_B, wand='rechts', art='umschalten')
    # ---- Ziel auf dem Podest hinter dem Tor ----
    lv.rechteck(S['tor'] + 2, ETAGE, S['boden_bis'], BODEN - 1, 'ground')
    lv.ed['goal'] = {'c': S['ziel'], 'r': ETAGE - 1}
    lv.punkt('meteoriten', S['ziel'] + 3, ETAGE - 1); lv.punkt('meteoriten', S['kanzel1'] + 3, 5); lv.punkt('meteoriten', S['luke1'] + 1, 3)
    # ---- Münzen: Blau (Affe) und Pink (Schweinchen) wieder gleich viele im ganzen Level ----
    blau = [(S['kanzel1'], 8), (S['kanzel1'] + 1, 8), (S['tritt2'], 8), (S['sims_a'], 11), (S['sims_a'] + 1, 11), (S['wind_d'], 6)]
    pink = [(S['haeng1'], 11), (S['stufe1'], 11), (S['tritt1'], 11), (S['mauer'], 5), (S['mauer'] + 1, 5), (S['haeng2'], 11),
            (S['balken_c'] + 2, 7), (S['sims_c'], 5), (S['haeng_d'], 6), (S['haeng_d'] + 1, 6), (S['tor'] + 4, 8)]
    for c, r in blau: lv.muenze(c, r, 'blue')
    for c, r in pink: lv.muenze(c, r, 'pink')
    n = {f: sum(1 for mz in lv.ed['coins'] if mz.get('color') == f) for f in ('blue', 'pink')}
    lv.merke('Ende ab Spalte 4756 neu (3. Fassung): zwei Zeit-Hindernisse + Maschine mit sechs Räumen (tests/bausteine/finale_a1.py)')
    return lv, n

if __name__ == '__main__':
    lv, n = bauen()
    print('Münzen', n)
    assert n['blue'] == n['pink'], f'Münzen nicht ausgeglichen: {n}'
    L.speichern([lv])
    print('gebaut und gespeichert')
