# tests/bausteine/dschungel_neu.py – Dschungel-Neu: Pilz-Gruben der Dschungel-Teile auf die Koop-Aktionen umbauen.
# Eine Pilz-Grube = Sprungpilz in einer Mulde (Spalte c, Boden-Reihe F) -> Stachel-Grube -> 4–5 Reihen hoher Block (b0 …).
# Zwei Bausteine (beide brauchen BEIDE Figuren, die Reihenfolge entscheidet):
#   A „Puste-Grube“: Pilz weg, Mulde zu. Der Affe pustet in der Mulde nach oben, das Schweinchen steigt mit dem Schirm
#     im Wind hoch und segelt auf den Block; der Affe schwingt am Haken hinüber (Haken neu, wenn dort keiner hängt).
#   B „Windrad-Treppe“: Pilz weg, Mulde zu. Das Schweinchen spannt in der Mulde den Schirm (Trampolin), der Affe federt
#     hoch und dasht auf den Block; dort pustet er das Windrad an -> in der Grube erscheint eine Wechselboden-Treppe (B)
#     für das Schweinchen. Pustet der Affe das Schweinchen zuerst hoch, kommt er selbst nicht nach (Denk-Moment).
#   X: nur Pilz weg und Mulde zu (die Stelle braucht keine Hilfe mehr, z. B. weil man vom höheren Block davor hinüberkommt).
# Aufruf: python3 tests/bausteine/dschungel_neu.py --teil dschungel/03-lianenschlucht.json   (oder --alle)
# Schreibt über den echten Editor in beide Formate (tests/level_bau.py). Bereits umgebaute Gruben werden übersprungen.
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / 'tests'))
import level_bau as L

# (Teil, Pilz-Spalte c, Boden-Reihe F, Baustein, Haken (Spalte, Reihe) für A oder None = vorhandener Haken, Nummer für B)
GRUBEN = [
    ('dschungel/01-dschungel.json', 233, 12, 'B', None, 15),
    ('dschungel/02-baumkronen.json', 23, 15, 'A', 'neu', None),
    ('dschungel/02-baumkronen.json', 209, 14, 'B', None, 18),
    ('dschungel/02-baumkronen.json', 443, 15, 'A', 'neu', None),
    ('dschungel/02-baumkronen.json', 572, 15, 'B', None, 19),
    ('dschungel/03-lianenschlucht.json', 70, 15, 'A', 'neu', None),
    ('dschungel/03-lianenschlucht.json', 180, 15, 'B', None, 15),
    ('dschungel/03-lianenschlucht.json', 360, 15, 'A', 'neu', None),
    ('dschungel/03-lianenschlucht.json', 386, 15, 'A', 'neu', None),
    ('dschungel/03-lianenschlucht.json', 740, 9, 'A', 'neu', None),
    ('dschungel/03-lianenschlucht.json', 760, 9, 'B', None, 16),
    ('dschungel/03-lianenschlucht.json', 780, 9, 'A', 'neu', None),
    ('dschungel/04-gluehwald.json', 121, 15, 'A', 'neu', None),
    ('dschungel/04-gluehwald.json', 164, 15, 'B', None, 16),
    ('dschungel/04-gluehwald.json', 469, 15, 'A', 'neu', None),
    ('dschungel/04-gluehwald.json', 668, 7, 'B', None, 15),
    ('dschungel/04-gluehwald.json', 681, 7, 'X', None, None),   # vom Block davor schaffen es beide allein (Sprung + Dash / Segeln)
    ('dschungel/06-wipfelsturm.json', 166, 16, 'A', 'neu', None),
    ('dschungel/06-wipfelsturm.json', 190, 16, 'B', None, 15),
    ('dschungel/06-wipfelsturm.json', 388, 16, 'A', 'neu', None),
]
HAKEN = {}   # (Teil, c) -> (Spalte, Reihe) des neuen Hakens (gemessen, tests/bausteine/dschungel_neu_haken.json)
_hp = Path(__file__).with_name('dschungel_neu_haken.json')
if _hp.exists(): HAKEN = {(d['teil'], d['c']): tuple(d['haken']) for d in json.loads(_hp.read_text(encoding='utf-8'))}

def fest(lv, c, r):
    t = lv.typ(c, r)
    return t in ('ground', 'wall', 'crumble', 'haft')
def geometrie(lv, c, F):
    """Block hinter der Grube: erste Spalte rechts, deren Oberkante über F liegt"""
    oben = lambda col: next((r for r in range(-3, 18) if fest(lv, col, r)), 99)
    x = c + 1
    while oben(x) >= F: x += 1
    b0, bt = x, oben(x)
    b1 = b0
    while oben(b1 + 1) == bt: b1 += 1
    return {'b0': b0, 'b1': b1, 'bt': bt}

def treppe(c, F):
    """Wechselboden-Stufen (Gruppe B) der Windrad-Treppe: +2 und +4 Reihen über dem Muldenboden"""
    return [(c + 2, F - 2), (c + 3, F - 2), (c + 4, F - 2), (c + 5, F - 4), (c + 6, F - 4), (c + 7, F - 4)]

def umbauen(lv, c, F, art, haken, link):
    pilz = [p for p in lv.ed.get('bouncers', []) if p['c'] == c and p['r'] == F - 1]
    if not pilz: return None   # schon umgebaut
    lv.punkt_weg('bouncers', c, F - 1)
    if lv.typ(c, F) is None: lv.kachel(c, F, 'ground')   # Mulde zu
    g = geometrie(lv, c, F)
    if art == 'X': pass
    elif art == 'A':
        if haken == 'neu': g['haken'] = haken_setzen(lv, c, g)
    else:
        lv.punkt('windraeder', g['b0'] + 3, g['bt'] - 1, link=link)
        for cc, rr in treppe(c, F): lv.punkt('switchFloors', cc, rr, gruppe='B', link=link)
        g['windrad'] = (g['b0'] + 3, g['bt'] - 1)
    lv.merke(f'Dschungel-Neu: Pilz-Grube {c} -> {dict(A="Puste-Grube", B="Windrad-Treppe", X="ohne Pilz").get(art)}')
    return g

# --- Sonder-Stellen (je Teil von Hand entworfen, mit dem Koop-Bot gemessen; Bot-Pläne: DN_STELLEN_EXTRA in run_tests.py) ---
def s01_puste_insel(lv):
    """Teil 1, Abgrund 67–104 mit Säule 84–86 (früher Pilz 85): Puste-Insel. Der Affe pustet am Rand (66) das
    Schweinchen hoch, es segelt auf die Säule; der Affe schwingt am Haken 73 hinterher, pustet auf der Säule noch einmal,
    das Schweinchen segelt hinüber zum Block 105; der Affe nimmt den Haken 94 (früher 95, von der Säule aus nicht erreichbar)."""
    if not any(p['c'] == 85 and p['r'] == 16 for p in lv.ed.get('bouncers', [])): return False
    lv.punkt_weg('bouncers', 85, 16); lv.kachel(85, 17, 'ground')
    lv.haken_weg(95, 11); lv.haken(94, 11, 4.5)
    return lv.merke('Dschungel-Neu: Puste-Insel 85 (Pilz -> zweimal Pusten, Haken 95 -> 94)')
def s01_ende(lv):
    """Teil 1, vor dem Ziel (früher Pilz 776): der Affe federt vom Schirm-Trampolin (Schweinchen bei 775) zum Haken 784
    und dasht durch die Durchbruch-Wand 790; das Schweinchen schafft die Grube danach allein (Sprung, Schirm, Dash).
    Haken 784 (Reihe 3) -> 786 (Reihe 2): von 776 aus nur noch mit dem Trampolin zu greifen (gemessen 5/5 mit, 0/10 ohne)."""
    if any(h['c'] == 786 and h['r'] == 2 for h in lv.ed.get('hooks', [])): return False
    lv.punkt_weg('bouncers', 776, 8); lv.kachel(776, 9, 'ground')
    lv.haken_weg(784, 3); lv.haken(786, 2, 5.0)
    return lv.merke('Dschungel-Neu: Ende Teil 1 (Pilz 776 -> Schirm-Trampolin)')
def wind_weg(lv, c0, c1):
    """Aufwind-Kästchen der Spalten c0..c1 entfernen (Dschungel-Neu: der Affe pustet statt dessen)"""
    n = 0
    for (c, r), typ in list(lv.t.items()):
        if typ == 'wind' and c0 <= c <= c1: lv.leer(c, r); n += 1
    return n
def s02_haftgrube(lv):
    """Teil 2, Grube 383–397 unter der Haftdecke (früher Pilz 382): der Affe pustet am Rand (381) – links neben der Decke –,
    das Schweinchen steigt an der Decke vorbei, landet OBEN auf der Haftdecke und legt dort Hebel 20 um: Wechselboden-
    Steine (B) erscheinen in der Grube, beide springen hinüber und dashen durch die Durchbruch-Wand 398. Geht der Affe
    zuerst (Schirm-Trampolin an die Haftdecke), kommt das Schweinchen nicht nach – die Reihenfolge ist das Rätsel."""
    if not any(b['c'] == 399 for b in lv.ed.get('bruchWaende', [])) and any(s['c'] == 397 for s in lv.ed.get('switchFloors', [])): return False
    lv.punkt_weg('bouncers', 382, 14); lv.kachel(382, 15, 'ground')
    lv.punkt_weg('switches', 402, 14)   # (Zwischenstand: Hebel hinter der Wand – dort fahren die Stachel-Stampfer)
    lv.punkt('switches', 395, 6, link=20)
    for c in (385, 386, 390, 391, 395, 396, 397): lv.punkt('switchFloors', c, 15, gruppe='B', link=20)   # letzter Stein direkt vor der Wand
    for r in (9, 10, 11, 12): lv.punkt_weg('bruchWaende', 399, r)   # Durchbruch-Wand nur noch 1 Kästchen dick (ein Dash, dann gleich unter dem Stampfer durch)
    return lv.merke('Dschungel-Neu: Haftdecken-Grube 382 (Pusten, Hebel 20 oben auf der Decke -> Steine)')
def s02_aufwinde(lv):
    """Teil 2: Aufwind 569–571 (über der Windrad-Treppe 572, wird nicht mehr gebraucht) raus. Aufwind 639–640 ->
    Puste-Pfeiler: neuer Pfeiler 637–638 (Oberkante Reihe 14) in der Schlucht. Der Affe springt (+ Dash) vom Buckel auf
    den Pfeiler und pustet, das Schweinchen springt vom Buckel in den Wind, segelt zum Block 651 und legt Hebel 13 um –
    jetzt fährt der Haken 627 (eine Reihe tiefer: Reihe 7, sonst vom Pfeiler aus nicht zu greifen), der Affe fährt mit."""
    if not wind_weg(lv, 569, 571) + wind_weg(lv, 639, 640): return False
    lv.rechteck(637, 14, 638, 17, 'ground')
    for h in lv.ed.get('hooks', []):
        if h['c'] == 627 and h['r'] == 5: h['r'] = 7
    return lv.merke('Dschungel-Neu: Aufwind 569 raus, Puste-Pfeiler 637 statt Aufwind 639, Haken 627 auf Reihe 7')
def s02_bruecke(lv):
    """Teil 2, hohe Brücke (früher Pilz 764): der Affe pustet das Schweinchen am Brückenende (766) hoch, es segelt (mit
    einem Dash in der Luft) zum Block 788 und legt Hebel 17 um – die Plattform 775 senkt sich als Zwischenstein, der Affe
    springt (+ Dash) auf den Stein und schwingt am neuen Haken 782 auf den Block."""
    if any(h['c'] == 782 and h['r'] == 0 for h in lv.ed.get('hooks', [])): return False
    lv.punkt_weg('bouncers', 764, 4); lv.kachel(764, 5, 'ground')
    lv.rechteck(785, 6, 787, 14, None)   # (Zwischenstände: Landesims / breiterer Block – beides zu leicht fürs Schweinchen)
    lv.haken(782, 0, 4.5)                # vom Zwischenstein zum Block (gemessen 10/10)
    return lv.merke('Dschungel-Neu: Puste-Brücke 764 (+ Haken 782)')
def s03_haken_treppe(lv):
    """Teil 3, Stachelgrube 132–139 vor dem hohen Block 140 (früher Pilz 124 + Aufwind 134): der Affe federt vom
    Schirm-Trampolin an die Haken 130 und 136 und schwingt auf den Block, dort pustet er das Windrad 13 an – in der
    Grube erscheint eine Wechselboden-Treppe (4 Stufen, B) für das Schweinchen."""
    if any(p['c'] == 132 and p['r'] == 12 for p in lv.ed.get('switchFloors', [])): return False
    lv.punkt_weg('bouncers', 124, 12); lv.kachel(124, 13, 'ground')
    wind_weg(lv, 134, 135)
    lv.punkt('windraeder', 144, 3, link=13)
    for p in [p for p in lv.ed.get('switchFloors', []) if p.get('link') == 13]: lv.punkt_weg('switchFloors', p['c'], p['r'])
    for k in range(8): lv.punkt('switchFloors', 132 + k, 12 - k, gruppe='B', link=13)   # Treppe: je Spalte eine Reihe höher
    return lv.merke('Dschungel-Neu: Haken-Treppe 124 (Trampolin -> Haken -> Windrad 13 -> Treppe)')
def s03_kreuzung(lv):
    """Teil 3, Pilz-Kreuzung 414 (Hebel über Kreuz: oben Hebel 7 öffnet Tür 7 unten, unten Hebel 6 öffnet Tür 6 oben):
    neuer Pfeiler 419–421 (Oberkante Reihe 13) in der Stachelgrube. Der Affe springt hinüber und pustet, das Schweinchen
    fliegt auf den OBEREN Weg; der Affe schwingt am neuen Haken 425 (Reihe 9, statt 421/Reihe 5) auf den UNTEREN Weg.
    Allein kommen beide nur nach unten – oben braucht es den Wind."""
    if any(h['c'] == 425 and h['r'] == 9 for h in lv.ed.get('hooks', [])): return False
    lv.punkt_weg('bouncers', 414, 14); lv.kachel(414, 15, 'ground')
    lv.haken_weg(421, 5); lv.haken_weg(422, 8); lv.haken(425, 9, 4.5)
    for c in (419, 420, 421):
        lv.stachel_weg(c, 16)
        for r in range(13, 18): lv.kachel(c, r, 'ground')
    return lv.merke('Dschungel-Neu: Kreuzung 414 (Puste-Pfeiler 419, Haken 425)')
def s03_saeulen_treppe(lv):
    """Teil 3, Säulen-Treppe 545–564 (früher drei Pilze 546/553/560): nur die Pilze weg – mit Sprung + Dash (Schweinchen
    auch mit Schirm) kommen beide allein von Säule zu Säule (eine Geschick-Stelle zwischen den Rätseln)."""
    n = 0
    for c, r in ((546, 13), (553, 11), (560, 9)):
        if any(p['c'] == c and p['r'] == r for p in lv.ed.get('bouncers', [])):
            lv.punkt_weg('bouncers', c, r); lv.kachel(c, r + 1, 'ground'); n += 1
    return n > 0 and lv.merke('Dschungel-Neu: Säulen-Treppe ohne Pilze')
def s03_aeste(lv):
    """Teil 3, Finale (früher Pilze 692 und 702): zwei Puste-Aufzüge. Der Affe steht auf dem Aufzug (Wand-Kästchen, bewegt
    sich erst per Nummer, fährt einmal hoch und bleibt oben) und pustet, das Schweinchen fliegt hinauf und legt oben den Hebel
    um – der Aufzug fährt den Affen nach. Fährt er leer hoch, hilft das Schirm-Trampolin (keine Sackgasse). Aufzug 1 (692–694, Hebel 14 auf dem Ast) vom Boden auf den Ast, Aufzug 2 (704–705,
    Hebel 17 auf dem oberen Ast) vom Ast auf den oberen Ast; von dort Haken 717/726 (Affe) bzw. Segeln + Dash (Schweinchen)
    über die letzte Schlucht. Umgekehrt geht es auch: Schweinchen als Trampolin auf dem Aufzug, der Affe legt den Hebel um."""
    if lv.typ(695, 10) == 'ground': return False
    for c, r in ((692, 14), (702, 9)): lv.punkt_weg('bouncers', c, r)
    lv.kachel(702, 10, 'ground'); lv.kachel(695, 10, 'ground')   # Ast bis an den Aufzug
    for c in (692, 693, 694): lv.kachel(c, 15, 'wall')
    for c in (704, 705): lv.kachel(c, 10, 'wall')
    lv.ed['movers'] = [m for m in lv.ed.get('movers', []) if not (m['c'] in (692, 704) and m['r'] in (15, 10))]
    lv.ed['movers'].append({'c': 692, 'r': 15, 'dc': 0, 'dr': -5, 'speed': 2.5, 'link': 14, 'einmal': True})
    lv.ed['movers'].append({'c': 704, 'r': 10, 'dc': 0, 'dr': -5, 'speed': 2.5, 'link': 17, 'einmal': True})
    lv.punkt('switches', 698, 9, link=14); lv.punkt('switches', 709, 4, link=17)
    return lv.merke('Dschungel-Neu: Finale Teil 3 mit zwei Puste-Aufzügen (Hebel 14, 17)')
def s06_puste_insel(lv):
    """Teil 6, Stachel-Schlucht 210–239 (früher Aufwinde 218 und 229): Puste-Insel 226–231. Der Affe pustet am Rand (208)
    das Schweinchen hoch, es segelt auf die Insel; der Affe schwingt an den Haken 213/222 hinterher, pustet auf der Insel
    noch einmal, das Schweinchen segelt zum Boden 240; der Affe nimmt den Haken 235 (früher 231, direkt über der Insel)."""
    if lv.typ(229, 15) == 'ground': return False
    wind_weg(lv, 218, 230)
    for c in range(226, 232):
        for r in (15, 16): lv.kachel(c, r, 'ground')
    lv.haken_weg(231, 10); lv.haken(235, 10, 4.5)   # von der Insel aus mit Anlauf
    return lv.merke('Dschungel-Neu: Puste-Insel 226 (Aufwinde 218/229 -> zweimal Pusten)')
def s06_luft_tor(lv):
    """Teil 6, Hohes Luft-Tor (Teleporter-Ausgang 415 hoch über den Dornen, früher Aufwind 431): Puste-Pfeiler 427–428
    unten in der Dornen-Grube (weit genug weg, dass das Schweinchen von dort allein nicht hinüberkommt). Der Affe schwingt am Haken 420 hinüber, landet auf dem Pfeiler und pustet nach oben; das
    Schweinchen segelt aus dem Tor in den Wind, steigt und segelt zum Boden 445. Allein segelt es zu kurz (gemessen 441).
    Der Affe springt vom Pfeiler an den neuen Haken 434 und schwingt weiter."""
    if lv.typ(427, 16) == 'ground': return False
    wind_weg(lv, 431, 432)
    for c in (427, 428): lv.kachel(c, 16, 'ground')   # nur eine Reihe hoch: von dort springt das Schweinchen allein zu kurz
    lv.haken(434, 10, 4.5)
    return lv.merke('Dschungel-Neu: Hohes Luft-Tor 431 (Aufwind -> Puste-Pfeiler 427, Haken 434)')
def s06_puste_turm(lv):
    """Teil 6, Pilz-Turm 308–323 (früher vier Sprungpilze): Puste-Turm. Die Säulen stehen jetzt 4 Reihen auseinander
    (zu hoch zum Springen). Der Affe pustet am Boden (305), das Schweinchen fliegt auf die breite Säule 312–315 und legt
    dort Hebel 16 um -> Wechselboden-Stufen (B) zwischen den Säulen; über sie kommen beide hinauf."""
    if lv.typ(312, 8) == 'ground': return False
    for c, r in ((308, 12), (313, 9), (318, 6), (323, 3)): lv.punkt_weg('bouncers', c, r)
    lv.kachel(308, 12, 'ground'); lv.kachel(309, 12, 'ground')
    for c in range(312, 316):
        for r in range(8, 17): lv.kachel(c, r, 'ground')
    for c in (318, 319):
        for r in (4, 5, 6): lv.kachel(c, r, 'ground')
    for cc, rr in ((307, 13), (311, 9), (317, 5)): lv.punkt('switchFloors', cc, rr, gruppe='B', link=16)   # je 3 Reihen (springbar), dicht an der Säule (kein Kopfstoß)
    lv.punkt('switches', 314, 7, link=16)
    return lv.merke('Dschungel-Neu: Puste-Turm 308 (Pilze -> Pusten + Hebel 16 mit Wechsel-Stufen)')
SONDER = {
    'dschungel/01-dschungel.json': [s01_puste_insel, s01_ende],
    'dschungel/02-baumkronen.json': [s02_haftgrube, s02_aufwinde, s02_bruecke],
    'dschungel/03-lianenschlucht.json': [s03_haken_treppe, s03_kreuzung, s03_saeulen_treppe, s03_aeste],
    'dschungel/06-wipfelsturm.json': [s06_puste_insel, s06_puste_turm, s06_luft_tor],
}

def haken_setzen(lv, c, g):
    """Puste-Grube: Haken an den gemessenen Platz (dschungel_neu_haken.json); alte Haken über der Grube (nur vom Pilz
    aus erreichbar gewesen) kommen weg"""
    hc, hr = HAKEN.get((lv.datei, c), (c + 4, g['bt'] - 4))
    for h in list(lv.ed.get('hooks', [])):
        if c < h['c'] < g['b0'] and (h['c'], h['r']) != (hc, hr) and 'move' not in h: lv.haken_weg(h['c'], h['r'])
    lv.haken(hc, hr, 4.5)
    return (hc, hr)
def haken_nachtragen(lv):
    """schon umgebaute Puste-Gruben: fehlt der gemessene Haken, nachtragen"""
    n = 0
    for t, c, F, art, haken, link in GRUBEN:
        if t != lv.datei or art != 'A' or haken != 'neu' or (t, c) not in HAKEN: continue
        if any(p['c'] == c and p['r'] == F - 1 for p in lv.ed.get('bouncers', [])): continue
        hc, hr = HAKEN[(t, c)]
        if not any(h['c'] == hc and h['r'] == hr for h in lv.ed.get('hooks', [])):
            haken_setzen(lv, c, geometrie(lv, c, F)); n += 1
    return n > 0 and lv.merke('Dschungel-Neu: Haken der Puste-Gruben nachgetragen')

def teil_umbauen(datei, speichern=True):
    lv = L.Level(datei); out = []
    for t, c, F, art, haken, link in GRUBEN:
        if t != datei: continue
        g = umbauen(lv, c, F, art, haken, link)
        if g: out.append((c, art, g))
    for f in SONDER.get(datei, []) + [haken_nachtragen]:
        if f(lv): out.append(f.__name__)
    if out and speichern: L.speichern([lv])
    return out

if __name__ == '__main__':
    a = sys.argv[1:]
    teile = sorted({g[0] for g in GRUBEN}) if '--alle' in a else [a[a.index('--teil') + 1]]
    for t in teile: print(t, teil_umbauen(t))
