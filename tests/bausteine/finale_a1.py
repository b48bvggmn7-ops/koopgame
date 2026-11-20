# tests/bausteine/finale_a1.py – Nutzerwunsch 20.11.: das Ende von Abschnitt 1 (Spalten 4756 bis Ziel) als großes Logik-Rätsel
# neu bauen („mega schwer, mehrere Abhängigkeiten, der Spieler darf 5 min überlegen, es muss aber möglich sein; Rammbalken,
# Windrad, Wechselboden kombinieren“). Zweite Fassung nach der Rückmeldung des Nutzers: „Türen immer mindestens zwei dick, genauso
# die Wand darüber; Schalter wie Windrad und Rammbalken gerade eben so erwischen (weiter Sprung, Sprung + Dash) statt einfach
# drunter stehen; die Höhe nutzen – nicht mehrere Windräder nebeneinander auf dem Boden, das ist zu offensichtlich“.
#
# Vier abgeschlossene Kammern (Wände aus Erde, 2 dick, bis zum oberen Bildrand: kein Wandsprung, kein Darüberfliegen, kein Wind):
#   K0 Vorraum    Das Windrad (66, „solange“) hängt ganz oben über einer kleinen Kanzel. Der Affe muss über eine Stufe mit einem
#                 knappen Weitsprung hinauf und von dort NACH OBEN pusten; nur dann ist Tür 1 offen – das Schweinchen läuft durch.
#                 Drinnen rammt es mit Sprung + Dash den Balken über dem Durchgang (66, Zeitfenster): der Affe kommt nach.
#   K1 Schleuse   Der Hebel (67) sitzt auf einem Sims (hochspringen). Er schaltet zwei Wechselboden-Wände gegenläufig: hinein nur
#                 mit AN, hinaus nur mit AUS. Drüben hängt ein Windrad (67), das der Affe gerade so mit Wind nach oben erreicht –
#                 also muss der AFFE zuerst hindurch und holt dann das Schweinchen nach.
#   K2 Aufzug     Tür 3 braucht ZWEI Nummern zugleich: 69 = Rammbalken hoch oben jenseits einer Lücke (nur der Aufzug kommt
#                 hinauf: Affe kurbelt; das Schweinchen springt vom Sims ab und rammt ihn im Flug mit dem Dash, dann fällt es
#                 hinunter) und 70 = Windrad hoch über dem Platz vor der Tür (Affe pustet nach oben). Für den Affen rammt das
#                 Schweinchen drüben den hängenden Balken (69, Sprung + Dash nach oben), der Affe pustet und schlüpft durch.
#   K3 Sternentor Tor braucht 71 + 72 + 73. 71 schaltet zwei Wechselboden-Wände gegenläufig: AN = Weg in den Rammraum, AUS = Weg
#                 vom Rammraum in die Hebelkammer. Das Windrad für 71 hängt über einer Kanzel, auf die der Affe nur über den
#                 Schirm des Schweinchens kommt (Schirm-Trampolin). Lösung: Schweinchen hebt den Affen hinauf – Affe 71 AN –
#                 Schweinchen in den Rammraum, rammt 72 (Sprung + Dash nach oben) – Affe 71 AUS – Schweinchen in die Hebelkammer,
#                 Hebel 73 auf dem Sims – Affe 71 AN, springt hinunter und geht in den Rammraum – Schweinchen rammt den Balken
#                 über dem Tor (71 AUS) – Affe kommt in die Hebelkammer – Schweinchen rammt noch einmal (71 AN): das Tor geht auf.
# Keine Sackgassen: in jeder Lage kann einer von beiden die nötige Nummer wieder schalten (zwei Windräder übereinander hinter
# Tür 3 als Rückweg, zweites Windrad für 71 in der Hebelkammer). Kein Stachel im Rätsel: wer einen Sprung verpasst, fällt nur
# hinunter und versucht es noch einmal. Geprüft mit tests/bausteine/finale_a1_loesung.py (echte Physik, mit Gegenproben und
# gemessenen Zeitfenstern für jeden knappen Sprung).
# Aufruf: python tests/bausteine/finale_a1.py   (baut neu, schreibt beide Level-Formate über den Editor-Export)
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import level_bau as L

DATEI = 'dschungel/abschnitt-1-sternschnuppenspur.json'
AB = 4756            # ab dieser Spalte wird alles neu gebaut (Checkpoint bei 4755 bleibt)
BODEN = 16           # Reihe des Bodens (man steht auf seiner Oberkante)
OBEN = -3            # oberste bebaubare Reihe
N_TUER1, N_SCHLEUSE, N_AUFZUG, N_RAMM3, N_WIND3, N_STERN, N_RAMM4, N_HEBEL4 = 66, 67, 68, 69, 70, 71, 72, 73
KANZEL_REIHE = 10    # Kanzeln: 6 Reihen über dem Boden (ein Sprung reicht nicht, das Schirm-Trampolin gerade so)
STUFE_REIHE = 13     # Stufen/Simse: 3 Reihen über dem Boden (ein voller Sprung)
WIND_HOCH = 3        # Windrad über einer Kanzel (vom Boden aus reicht kein Wind hinauf, die Kanzel verdeckt es)
WIND_BODEN = 7       # Windrad, das der Wind nach oben vom Boden aus gerade so erreicht (8 Kästchen)
SIMS_REIHE = 3       # Sims des Aufzugs: 13 Reihen über dem Boden
HAENG_REIHE = 8      # hängender Rammbalken: Stirnseite 6 Kästchen über dem Boden – nur Sprung + Dash nach oben erreicht sie

# Alle Spalten an einer Stelle (das Lösungs-Skript finale_a1_loesung.py benutzt dieselben)
S = dict(
    kanzel1=4760,                     # K0: Kanzel (2 breit), darüber das Windrad 66
    stufe1=4767,                      # K0: Stufe (2 breit) – von hier der Weitsprung zur Kanzel (5 Kästchen Lücke, 3 Reihen höher)
    tuer1=4772,                       # Tür 1 (2 dick: tuer1, tuer1+1)
    sims2=4775,                       # K1: Sims mit dem Hebel der Schleuse
    balken1=4783,                     # K1: Rammbalken über dem Durchgang der Schleuse (ragt nach links aus der Wand)
    s1=4784, schleuse=4787, s2=4789,  # Schleuse: A-Wand (2 dick), Kammer (Mitte), B-Wand (2 dick)
    wind2=4792,                       # K2: Windrad „umschalten“ (Schleuse), hoch
    rad=4794, aufzug=4796,            # K2: Floß-Rad, Aufzug (3 breit)
    sims=4799, sims_bis=4800,         # Sims oben (kurz), danach die Lücke
    balken3=4807,                     # Rammbalken jenseits der Lücke, 4 Reihen ÜBER dem Sims: Stirnseite 5 Kästchen hinter der Kante – nur Sprung + Dash am höchsten Punkt
    wind3=4812,                       # K2: Windrad „solange“ hoch über dem Platz vor Tür 3
    tuer3=4813,                       # Tür 3 (2 dick)
    wind3b=4816,                      # K3: zwei Windräder übereinander (70 und 69) – Rückweg, falls einer drüben festsitzt
    haeng3=4819,                      # K3: hängender Rammbalken (69, Zeitfenster)
    kanzel4=4823,                     # K3: Kanzel (2 breit), darüber das Windrad 71 – nur über das Schirm-Trampolin
    wa=4829,                          # A-Wand (2 dick; offen, solange 71 AN) -> Rammraum
    haeng4=4834,                      # Rammraum: hängender Rammbalken (72 umschalten)
    wb=4838,                          # B-Wand (2 dick; offen, solange 71 AUS) -> Hebelkammer
    sims4=4840, wind5=4843, balken5=4848,   # Hebelkammer: Sims mit Hebel (73) gleich hinter der Wand, Windrad (71), Rammbalken über dem Tor (71)
    tor=4849, ziel=4856, boden_bis=4866,
)

FELDER = ['hooks', 'switches', 'doors', 'spikes', 'coins', 'plates', 'switchFloors', 'windraeder', 'rammbalken', 'blattFloesse',
          'flossRaeder', 'draisinen', 'meteoriten', 'bouncers', 'bruchWaende', 'pusteblumen', 'trommeln']
T3 = (13, 14, 15)    # Reihen der Durchgänge

def wand(lv, c, dick=2):
    """Erd-Wand (2 dick) bis zum oberen Bildrand, unten bleibt der Durchgang frei (dort kommt Tür bzw. Wechselboden hin)."""
    for cc in range(c, c + dick):
        for r in range(OBEN, BODEN):
            if r in T3: lv.leer(cc, r)
            else: lv.kachel(cc, r, 'ground')

def tuer(lv, c, **nummern):
    wand(lv, c)
    for cc in (c, c + 1):
        for r in T3: lv.punkt('doors', cc, r, **nummern)

def wechselwand(lv, c, gruppe, link):
    wand(lv, c)
    for cc in (c, c + 1):
        for r in T3: lv.punkt('switchFloors', cc, r, gruppe=gruppe, link=link, takt=0)

def haengebalken(lv, c, link, **extra):
    """Erd-Klotz (2 breit) mit einem Rammbalken, der nach unten hängt: Stirnseite 6 Kästchen über dem Boden."""
    lv.kachel(c, HAENG_REIHE - 1, 'ground'); lv.kachel(c + 1, HAENG_REIHE - 1, 'ground')
    lv.punkt('rammbalken', c, HAENG_REIHE, link=link, wand='oben', **extra)

def bauen():
    lv = L.Level(DATEI)
    # ---- alles ab AB abräumen ----
    for (c, r) in [k for k in lv.t if k[0] >= AB]: lv.leer(c, r)
    for f in FELDER: lv.ed[f] = [p for p in lv.ed.get(f, []) if p['c'] < AB]
    lv.ed['movers'] = [m for m in lv.ed.get('movers', []) if m['c'] < AB]
    lv.rechteck(AB, BODEN, S['boden_bis'], BODEN + 1, 'ground')

    # ---- K0 Vorraum ----
    lv.rechteck(S['kanzel1'], KANZEL_REIHE, S['kanzel1'] + 1, KANZEL_REIHE, 'ground')
    lv.punkt('windraeder', S['kanzel1'], WIND_HOCH, link=N_TUER1, art='solange')
    lv.rechteck(S['stufe1'], STUFE_REIHE, S['stufe1'] + 1, STUFE_REIHE, 'ground')
    tuer(lv, S['tuer1'], link=N_TUER1)
    # ---- K1: Sims mit Hebel, Rammbalken über dem Durchgang, Schleuse ----
    lv.rechteck(S['sims2'], STUFE_REIHE, S['sims2'] + 1, STUFE_REIHE, 'ground')
    lv.punkt('switches', S['sims2'], STUFE_REIHE - 1, link=N_SCHLEUSE)
    wechselwand(lv, S['s1'], 'A', N_SCHLEUSE); wechselwand(lv, S['s2'], 'B', N_SCHLEUSE)
    lv.punkt('rammbalken', S['balken1'], 12, link=N_TUER1, wand='rechts', art='zeit', zeit=8)
    # ---- K2: Windrad (Schleuse von drüben), Aufzug mit Rad, Sims, Lücke, Rammbalken, Tür mit zwei Nummern ----
    lv.punkt('windraeder', S['wind2'], WIND_BODEN, link=N_SCHLEUSE)
    lv.punkt('flossRaeder', S['rad'], 15, link=N_AUFZUG)
    lv.punkt('blattFloesse', S['aufzug'], 15, link=N_AUFZUG, schiene=BODEN - SIMS_REIHE, richtung='hoch', sinkt='ja')
    lv.rechteck(S['sims'], SIMS_REIHE, S['sims_bis'], SIMS_REIHE, 'ground')
    lv.rechteck(S['balken3'] + 1, OBEN, S['balken3'] + 2, SIMS_REIHE, 'ground')          # Kappe (2 dick), hängt von oben herab
    lv.punkt('rammbalken', S['balken3'], SIMS_REIHE - 4, link=N_RAMM3, wand='rechts', art='zeit', zeit=8)
    lv.punkt('windraeder', S['wind3'], WIND_BODEN, link=N_WIND3, art='solange')
    tuer(lv, S['tuer3'], link=N_RAMM3, und=N_WIND3, und2=0)
    # ---- K3 Eingang: von hier aus kann jeder dem anderen öffnen (keine Sackgasse, egal wer zuerst ging) ----
    lv.punkt('windraeder', S['wind3b'], WIND_BODEN, link=N_WIND3, art='solange')         # ein Puste-Strahl nach oben dreht beide …
    lv.punkt('windraeder', S['wind3b'], WIND_BODEN + 1, link=N_RAMM3, art='solange')     # … also 70 und 69 zugleich
    haengebalken(lv, S['haeng3'], N_RAMM3, art='zeit', zeit=8)
    # ---- K3 Sternentor ----
    lv.rechteck(S['kanzel4'], KANZEL_REIHE, S['kanzel4'] + 1, KANZEL_REIHE, 'ground')
    lv.punkt('windraeder', S['kanzel4'], WIND_HOCH, link=N_STERN)
    wechselwand(lv, S['wa'], 'A', N_STERN); wechselwand(lv, S['wb'], 'B', N_STERN)
    tuer(lv, S['tor'], link=N_STERN, und=N_RAMM4, und2=N_HEBEL4)
    haengebalken(lv, S['haeng4'], N_RAMM4, art='umschalten')
    lv.punkt('windraeder', S['wind5'], WIND_BODEN, link=N_STERN)
    lv.rechteck(S['sims4'], STUFE_REIHE, S['sims4'] + 1, STUFE_REIHE, 'ground')
    lv.punkt('switches', S['sims4'], STUFE_REIHE - 1, link=N_HEBEL4)
    lv.punkt('rammbalken', S['balken5'], 12, link=N_STERN, wand='rechts', art='umschalten')
    # ---- Ziel, Meteoriten-Spur ----
    lv.ed['goal'] = {'c': S['ziel'], 'r': 15}
    lv.punkt('meteoriten', S['ziel'] + 3, 15); lv.punkt('meteoriten', S['balken3'] - 2, 9); lv.punkt('meteoriten', S['kanzel4'] + 4, 5)
    # ---- Münzen: Blau (Affe) und Pink (Schweinchen) wieder gleich viele im ganzen Level ----
    blau = [(S['kanzel1'], 8), (S['kanzel1'] + 1, 8), (S['stufe1'], 11), (S['wind2'] + 1, 13), (S['kanzel4'], 8), (S['kanzel4'] + 1, 8)]
    pink = [(S['balken1'] - 2, 11), (S['sims'], 1), (S['sims'] + 1, 1), (S['balken3'] - 2, -2), (S['haeng3'], 11), (S['haeng4'], 11),
            (S['haeng4'] + 1, 11), (S['sims4'], 10), (S['sims4'] + 1, 10), (S['balken5'] - 2, 11), (S['tor'] + 4, 14)]
    for c, r in blau: lv.muenze(c, r, 'blue')
    for c, r in pink: lv.muenze(c, r, 'pink')
    n = {f: sum(1 for m in lv.ed['coins'] if m.get('color') == f) for f in ('blue', 'pink')}
    assert n['blue'] == n['pink'], f'Münzen nicht ausgeglichen: {n}'
    lv.merke('Ende ab Spalte 4756 neu: Logik-Rätsel in vier Kammern (tests/bausteine/finale_a1.py)')
    return lv, n

if __name__ == '__main__':
    lv, n = bauen()
    L.speichern([lv])
    print('gebaut und gespeichert; Münzen', n)
