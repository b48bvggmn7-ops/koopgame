# Nacht-Ausbau Phase 3: neue Stellen in den Leveln (aus den Bausteinen) – je Stelle Start, Bot-Plan, Ziel und Gegenprobe.
# Getestet von tests/run_tests.py (Tests nacht_stellen_<welt>): jede Stelle mit dem Plan schaffen (Ziel-Spalte erreicht,
# auf dem Boden, nicht tot), die Gegenprobe (ohne die neue Mechanik) darf das Ziel NICHT erreichen.
# Eintrag: {'level', 'name', 'wer': 'm'|'f', 'start': (c, r), 'partner': (c, r), 'plan': [...], 'ziel': c (Spalte >=),
#           'ziel_reihe': r (optional: Standreihe), 'gegen': [...] oder None, 'links': [...] (vorher an), 'baustein': 'B1'…}
from plaene import *

STELLEN = []

# Vom Nutzer neu gebaute Level (ersetzt): die alten Stellen dort gibt es nicht mehr – Nutzer-Entscheidung: deren Stellen-Prüfungen
# entfallen (allgemeine Prüfungen wie Bild-Regel, Leistung, Laden laufen weiter)
ERSETZTE_LEVEL = {'dschungel/01-dschungel.json', 'dschungel/02-baumkronen.json'}
def stelle(**e):
    if e['level'] in ERSETZTE_LEVEL: return
    e.setdefault('partner', (e['start'][0] - 2, e['start'][1]))
    e.setdefault('gegen', None); e.setdefault('links', [])
    STELLEN.append(e)

def je_welt(welt): return [s for s in STELLEN if s['level'].startswith(welt + '/')]

# ---------------- Dschungel 4 (Glühwald) ----------------
for _w in 'mf':
    stelle(level='dschungel/04-gluehwald.json', name='Haftdecke über der Dornengrube 272–285 (B3)', wer=_w, start=(268, 14), partner=(266, 14),
           plan=nb_haft(271, 286), ziel=286, ziel_reihe=14, baustein='B3',
           gegen=[{'hold': ['right'], 'until': f'P.x >= {kx(271)}'}, {'press': ['jump'], 'hold': ['right', 'jump'], 'frames': 14}, LANDEN])

# ---------------- Dschungel 3 (Lianenschlucht) ----------------
_lauf_sprung = lambda c: [{'hold': ['right'], 'until': f'P.x >= {kx(c)}'}, {'press': ['jump'], 'hold': ['right', 'jump'], 'frames': 14}, LANDEN]
_laufen = [{'hold': ['right'], 'frames': 240}]
for _w in 'mf':
    stelle(level='dschungel/03-lianenschlucht.json', name='Haftdecke über der Grube 196–207 (B3)', wer=_w, start=(194, 14), partner=(191, 10),
           plan=nb_haft(195, 208), ziel=208, ziel_reihe=14, baustein='B3', gegen=_lauf_sprung(195))
    stelle(level='dschungel/03-lianenschlucht.json', name='Durchbruch-Säule 322 (B2)', wer=_w, start=(317, 15), partner=(315, 15),
           plan=nb_bruch_durch(322), ziel=324, ziel_reihe=15, baustein='B2', gegen=_laufen)
    stelle(level='dschungel/03-lianenschlucht.json', name='Haftdecke über der Grube 520–528 (B3)', wer=_w, start=(515, 14), partner=(513, 14),
           plan=nb_haft(519, 529), ziel=529, ziel_reihe=14, baustein='B3', gegen=_lauf_sprung(519))
    # (Durchbruch-Säule 570 + Grube: vom Nutzer im Editor entfernt, Commit a8acb1d)
    stelle(level='dschungel/03-lianenschlucht.json', name='Durchbruch-Säule 676 (B2)', wer=_w, start=(670, 14), partner=(668, 14),
           plan=nb_bruch_durch(676), ziel=678, ziel_reihe=14, baustein='B2', gegen=_laufen)

# ---------------- Umbau (Regel 6): Pflicht-Durchbruch auf dem Hauptweg in Dschungel 2, 5, 6 ----------------
for _w in 'mf':
    stelle(level='dschungel/02-baumkronen.json', name='Durchbruch-Säule 172 (B2, Pflicht)', wer=_w, start=(167, 13), partner=(165, 13),
           plan=nb_bruch_durch(172), ziel=174, ziel_reihe=13, baustein='B2', gegen=_laufen)
    stelle(level='dschungel/05-dornenpfad.json', name='Durchbruch-Säule 298 (B2, Pflicht)', wer=_w, start=(293, 15), partner=(291, 15),
           plan=nb_bruch_durch(298), ziel=300, ziel_reihe=15, baustein='B2', gegen=_laufen)
    stelle(level='dschungel/06-wipfelsturm.json', name='Durchbruch-Säule 381 (B2, Pflicht)', wer=_w, start=(377, 15), partner=(375, 15),
           plan=nb_bruch_durch(381), ziel=383, ziel_reihe=15, baustein='B2', gegen=_laufen)

# ---------------- Umbau (Regel 6): Pflicht-Durchbruch auf dem Hauptweg in Ruinen, Höhle, Vulkan ----------------
for _w in 'mf':
    for _lv, _c, _r in (('ruinen/01-ruinen.json', 296, 15), ('ruinen/04-sonnentempel.json', 331, 16), ('ruinen/05-felsenflucht.json', 532, 16),
                        ('hoehle/01-kristallhoehle.json', 115, 15), ('hoehle/02-tropfsteingang.json', 585, 8), ('hoehle/05-foerderwerk.json', 400, 16),
                        ('vulkan/05-schlackewerk.json', 194, 16), ('vulkan/06-feuerschlund.json', 589, 16),
                        # zweite Runde (Checkliste „Pflicht-Stelle neue Mechanik“): je Level eine Säule auf einem flachen Wegstück
                        ('ruinen/02-mondnacht.json', 342, 15), ('ruinen/03-fallengang.json', 356, 16), ('ruinen/06-tempelherz.json', 590, 16),
                        ('hoehle/03-eisgrotte.json', 196, 16), ('hoehle/04-leuchtgrotte.json', 381, 16), ('vulkan/02-aschefeld.json', 176, 16),
                        ('vulkan/03-feuerberg.json', 287, 15), ('vulkan/07-kraterherz.json', 390, 16),
                        ('vulkan/01-glutpfad.json', 392, 16), ('vulkan/04-magmakammer.json', 7, 16), ('hoehle/06-tiefenschlund.json', 511, 16)):
        stelle(level=_lv, name=f'Durchbruch-Säule {_c} (B2, Pflicht)', wer=_w, start=(_c - 2, _r - 1), partner=(_c + 4, _r - 1),
               plan=nb_bruch_durch(_c), ziel=_c + 2, ziel_reihe=_r - 1, baustein='B2', gegen=_laufen)

# ---------------- Umbau (Regel 1): Haken-/Aufwind-Gruben dashfest ----------------
# Absprung so tief unter der Landung, dass Sprung + Dash nicht reicht; Affe: Haken (früher + Dash nach oben, seit Dash nur waagerecht: Haken allein),
# Schweinchen: Aufwind. Gegenprobe: Affe nur mit Sprung + Dash schräg hoch (ohne Haken).
def _haken_grube(c, z):
    return [{'holdIf': {'right': f'P.x < {kx(c)} - 4', 'left': f'P.x > {kx(c)} + 4'}, 'until': f'P.grounded && Math.abs(P.x - {kx(c)}) <= 4', 'frames': 200},
            {'press': ['jump'], 'hold': ['right', 'jump'], 'hookWhen': 'P.vy > -3', 'until': 'P.hookAttached', 'frames': 120},
            {'swing': True, 'pull': 20, 'release': 'P.x > P.anchor.x + P.ropeLen*0.6 && P.vy < 0', 'frames': 400},   # Liane 2: Seil etwas einholen, spät loslassen (Dash nur noch waagerecht: Haken allein reicht)
            {'holdIf': {'right': f'P.x < {kx(z + 2)}', 'left': f'P.x > {kx(z + 4)}'}, 'until': 'P.grounded', 'frames': 300},
            {'holdIf': {'right': f'P.x < {kx(z + 2)}'}, 'frames': 60}]   # nach der Landung an der Kante noch ein Stück hinein
def _aufwind(c, w, z):
    return [{'holdIf': {'right': f'P.x < {kx(c)}', 'left': f'P.x > {kx(c)} + 8'}, 'until': 'P.grounded', 'frames': 200},
            {'press': ['jump'], 'hold': ['right', 'jump'], 'frames': 10},
            {'hold': ['glide'], 'holdIf': {'right': f'P.x < {kx(w)} + 20', 'left': f'P.x > {kx(w + 1)}'}, 'until': f'P.y < {ky(4)}', 'frames': 600},
            {'hold': ['glide', 'right'], 'until': 'P.grounded', 'frames': 600}, {'holdIf': {'right': f'P.x < {kx(z + 2)}'}, 'frames': 60}]
def _sprung_dash(c):
    return [{'hold': ['right'], 'until': f'P.x >= {kx(c)}', 'frames': 200}, {'press': ['jump'], 'hold': ['right', 'jump'], 'frames': 14},
            {'press': ['dash'], 'hold': ['right'], 'frames': 3}, LANDEN]
for _c, _r, _w, _z, _zr in ((35, 14, 37, 46, 6), (200, 12, 202, 211, 4)):
    stelle(level='hoehle/01-kristallhoehle.json', name=f'Haken-Grube {_c} (Haken, dashfest)', wer='m', start=(_c - 2, _r - 1), partner=(_c - 1, _r - 1),
           plan=_haken_grube(_c, _z), ziel=_z, ziel_reihe=_zr, baustein='Umbau', gegen=_sprung_dash(_c))
    stelle(level='hoehle/01-kristallhoehle.json', name=f'Aufwind-Grube {_c} (Schweinchen)', wer='f', start=(_c - 2, _r - 1), partner=(_c - 1, _r - 1),
           plan=_aufwind(_c, _w, _z), ziel=_z, ziel_reihe=_zr, baustein='Umbau')

def _haken_kette(c, z, n=2, rel1='P.x > P.anchor.x + 40 && P.vx > 1'):
    pl = [{'holdIf': {'right': f'P.x < {kx(c)} - 4', 'left': f'P.x > {kx(c)} + 4'}, 'until': f'P.grounded && Math.abs(P.x - {kx(c)}) <= 4', 'frames': 200},
          {'press': ['jump'], 'hold': ['right', 'jump'], 'hookWhen': 'P.vy > -3', 'until': 'P.hookAttached', 'frames': 120},
          {'swing': True, 'release': rel1, 'frames': 400}]
    for _ in range(n - 1):
        pl += [{'hold': ['right'], 'hookWhen': 'P.vy > -3', 'until': 'P.hookAttached || P.grounded', 'frames': 120},
               {'swing': True, 'release': 'P.x > P.anchor.x + 40 && P.vx > 1', 'frames': 400}]
    return pl + [{'holdIf': {'right': f'P.x < {kx(z + 2)}', 'left': f'P.x > {kx(z + 4)}'}, 'until': 'P.grounded', 'frames': 300}]
# Kristallhöhle Ziel: Lücke 388–404 (17), Haken 391/397, Podest 3 Reihen höher; Schweinchen nur per Aufwind, wenn der Affe
# oben auf Platte 8 steht (Tür im Aufwind).
stelle(level='hoehle/01-kristallhoehle.json', name='Ziel: Haken-Kette 391/401 aufs Podest', wer='m', start=(385, 10), partner=(386, 10),
       plan=_haken_kette(387, 405, rel1='P.x > P.anchor.x + P.ropeLen*0.6 && P.vy < 0'),   # Haken aufgeräumt (391/401): erst Schwung holen; Dash nur noch waagerecht: die Kette allein reicht
       ziel=405, ziel_reihe=3, baustein='Umbau', gegen=_sprung_dash(387))
stelle(level='hoehle/01-kristallhoehle.json', name='Ziel: Schweinchen per Aufwind, Affe auf Platte 8', wer='f', start=(385, 10), partner=(409, 2),
       plan=[{'holdIf': {'right': f'P.x < {kx(387)}'}, 'until': 'P.grounded', 'frames': 100}, {'press': ['jump'], 'hold': ['right', 'jump'], 'frames': 12},
             {'hold': ['glide'], 'holdIf': {'right': f'P.x < {kx(401)} + 20', 'left': f'P.x > {kx(402)}'}, 'until': f'P.y < {ky(2)}', 'frames': 900},
             {'hold': ['glide', 'right'], 'until': 'P.grounded', 'frames': 600}], ziel=405, ziel_reihe=3, baustein='Umbau',
       gegen=_sprung_dash(387))

# Feuerberg Ziel-Plateau (Oberkante 1): Affe von der Pilz-Plattform an Haken 404, dann Haken 410 über der Kante (seit Dash nur
# waagerecht statt Dash hoch), Schweinchen per Aufwind 405
_fb_affe = [{'holdIf': {'right': f'P.x < {kx(396)} - 4', 'left': f'P.x > {kx(396)} + 4'}, 'until': f'P.grounded && Math.abs(P.x - {kx(396)}) <= 4', 'frames': 200},
            {'press': ['jump'], 'hold': ['right', 'jump'], 'hookWhen': 'P.vy > -3', 'until': 'P.hookAttached', 'frames': 120},
            {'swing': True, 'release': 'P.x > P.anchor.x + P.ropeLen*0.6 && P.vy < 0', 'frames': 400},
            {'hold': ['right'], 'hookWhen': 'P.vy > -3', 'until': 'P.hookAttached || P.grounded', 'frames': 120},
            {'swing': True, 'release': 'P.x > P.anchor.x + P.ropeLen*0.6 && P.vy < 0', 'frames': 400},
            {'holdIf': {'right': f'P.x < {kx(413)}', 'left': f'P.x > {kx(414)}'}, 'until': 'P.grounded', 'frames': 300}]
_fb_schwein = [{'holdIf': {'right': f'P.x < {kx(397)}'}, 'until': 'P.grounded', 'frames': 100}, {'press': ['jump'], 'hold': ['right', 'jump'], 'frames': 10},
               {'hold': ['glide'], 'holdIf': {'right': f'P.x < {kx(405)} + 20', 'left': f'P.x > {kx(406)}'}, 'until': f'P.y < {ky(0)}', 'frames': 900},
               {'hold': ['glide', 'right'], 'until': 'P.grounded', 'frames': 600}]
stelle(level='vulkan/03-feuerberg.json', name='Ziel-Plateau: Haken 404 + 410 (dashfest)', wer='m', start=(395, 8), partner=(396, 8),
       plan=_fb_affe, ziel=410, ziel_reihe=0, baustein='Umbau', gegen=_sprung_dash(397))
stelle(level='vulkan/03-feuerberg.json', name='Ziel-Plateau: Schweinchen per Aufwind', wer='f', start=(395, 8), partner=(396, 8),
       plan=_fb_schwein, ziel=410, ziel_reihe=0, baustein='Umbau')

# ---------------- Dschungel 1 (sanfte Probe) ----------------
for _w in 'mf':
    stelle(level='dschungel/01-dschungel.json', name='Durchbruch-Wand unter dem Münz-Sims 715 (sanfte Probe; oben herum per Lift geht auch)', wer=_w,
           start=(710, 14), partner=(708, 14), plan=nb_bruch_durch(715), ziel=717, ziel_reihe=14, baustein='B2', gegen=_laufen)

# ---------------- Verstecke (S1) in den vom Nutzer gestalteten Leveln: nur zusätzlich, optional ----------------
# Verstecke auf schmalen Sockeln: nach dem Hinausspringen nur kurz nach rechts (sonst fällt der Bot vom Sockel)
_KURZ = {('d02', 220), ('d06', 201), ('d06', 403), ('r04', 191), ('r04', 366), ('r04', 607), ('r05', 595), ('r06', 183),
         ('h01', 301), ('h02', 139), ('h02', 397), ('h05', 609), ('v01', 243), ('v01', 385), ('v04', 203), ('v04', 457),
         ('v04', 645), ('v07', 273), ('v07', 333)}
_VERSTECKE = {
    'dschungel/04-gluehwald.json': [(181, 15, 'pink'), (344, 15, 'pink'), (535, 8, 'blue')],
    'dschungel/05-dornenpfad.json': [(328, 3, 'pink'), (447, 3, 'pink'), (614, 8, 'pink')],
    'dschungel/06-wipfelsturm.json': [(201, 7, 'blue'), (403, 7, 'blue'), (627, 8, 'pink')],
    'ruinen/03-fallengang.json': [(238, 9, 'blue'), (389, 10, 'pink'), (631, 6, 'blue')],
    'ruinen/04-sonnentempel.json': [(191, 7, 'pink'), (366, 10, 'pink'), (607, 7, 'blue')],
    'ruinen/05-felsenflucht.json': [(223, 9, 'pink'), (373, 10, 'blue'), (595, 7, 'pink')],
    'ruinen/06-tempelherz.json': [(183, 7, 'pink'), (354, 10, 'blue'), (489, 11, 'blue')],
    'hoehle/01-kristallhoehle.json': [(103, 15, 'pink'), (217, 3, 'pink'), (301, 8, 'pink')],
    'hoehle/02-tropfsteingang.json': [(139, 4, 'pink'), (397, 13, 'pink'), (590, 8, 'blue')],
    'hoehle/03-eisgrotte.json': [(369, 8, 'pink'), (611, 6, 'blue'), (643, 6, 'blue')],
    'hoehle/05-foerderwerk.json': [(609, 10, 'pink')],
    'vulkan/01-glutpfad.json': [(243, 6, 'pink'), (385, 7, 'pink'), (685, 4, 'pink')],
    'vulkan/02-aschefeld.json': [(441, 8, 'pink'), (554, 8, 'pink'), (682, 8, 'pink')],
    'vulkan/03-feuerberg.json': [(126, 15, 'pink'), (211, 15, 'blue'), (323, 15, 'blue')],
    'vulkan/04-magmakammer.json': [(203, 7, 'pink'), (457, 2, 'pink'), (645, 1, 'pink')],
    'vulkan/05-schlackewerk.json': [(210, 8, 'pink'), (535, 4, 'pink')],
    'vulkan/06-feuerschlund.json': [(373, 5, 'pink'), (515, 10, 'pink')],
    'vulkan/07-kraterherz.json': [(273, 5, 'pink'), (333, 7, 'blue'), (639, 5, 'blue')],
    'dschungel/02-baumkronen.json': [(220, 5, 'blue'), (410, 15, 'blue'), (616, 15, 'pink')],
    'ruinen/01-ruinen.json': [(196, 10, 'blue'), (406, 15, 'pink'), (623, 15, 'pink')],
    'ruinen/02-mondnacht.json': [(118, 15, 'blue'), (243, 6, 'pink'), (368, 9, 'blue')],
}


# ---------------- Haft-Arme (S2): optional, Meister-Münze am Arm-Ende (nur hängend erreichbar) ----------------
_HAFTARME = {
    'dschungel/04-gluehwald.json': [(590, 8, 'blue')],
    'dschungel/05-dornenpfad.json': [(136, 12, 'blue'), (518, 12, 'pink')],
    'dschungel/06-wipfelsturm.json': [(119, 12, 'blue'), (527, 12, 'blue')],
    'ruinen/03-fallengang.json': [(145, 10, 'pink'), (396, 10, 'blue')],
    'ruinen/04-sonnentempel.json': [(25, 8, 'blue'), (321, 7, 'pink')],
    'ruinen/05-felsenflucht.json': [(252, 9, 'blue'), (382, 10, 'blue')],
    'ruinen/06-tempelherz.json': [(56, 9, 'pink'), (363, 10, 'blue')],
    'hoehle/01-kristallhoehle.json': [(62, 7, 'blue')],
    'hoehle/03-eisgrotte.json': [(334, 11, 'pink'), (399, 8, 'pink')],
    'hoehle/04-leuchtgrotte.json': [(442, 9, 'pink')],
    'hoehle/05-foerderwerk.json': [(392, 7, 'blue')],
    'hoehle/06-tiefenschlund.json': [(446, 8, 'pink')],
    'vulkan/01-glutpfad.json': [(596, 7, 'pink')],
    'vulkan/02-aschefeld.json': [(410, 10, 'blue')],
    'vulkan/04-magmakammer.json': [(367, 10, 'pink'), (404, 10, 'pink')],
    'vulkan/06-feuerschlund.json': [(135, 8, 'blue'), (550, 10, 'pink')],
    'vulkan/07-kraterherz.json': [(213, 10, 'blue')],
}
for _lvl, _liste in _HAFTARME.items():
    for (_c, _r, _farbe) in _liste:
        _w = 'm' if _farbe == 'blue' else 'f'
        stelle(level=_lvl, name=f'Haft-Arm über dem Abgrund an Kante {_c} (S2, optional, Meister-Münze)', wer=_w, start=(_c - 1, _r - 1), partner=(_c - 1, _r - 1),
               plan=nb_haftarm(_c, _r), ziel=_c - 3, ziel_reihe=_r - 1, baustein='S2', muenze=(_c + 7, _r - 3),
               gegen=[{'frames': 6}, {'press': ['jump'], 'hold': ['jump', 'right'], 'frames': 14}, {'until': 'P.grounded', 'frames': 200}], gegen_muenze=True)
# gespiegelte Arme (ragen nach links über den Abgrund)
_HAFTARME_LINKS = {
    'hoehle/04-leuchtgrotte.json': [(398, 9, 'blue')],
    'vulkan/01-glutpfad.json': [(400, 12, 'blue')],
    'vulkan/03-feuerberg.json': [(313, 15, 'pink')],
}
for _lvl, _liste in _HAFTARME_LINKS.items():
    for (_c, _r, _farbe) in _liste:
        _w = 'm' if _farbe == 'blue' else 'f'
        stelle(level=_lvl, name=f'Haft-Arm nach links über dem Abgrund an Kante {_c} (S2, optional, Meister-Münze)', wer=_w, start=(_c + 1, _r - 1), partner=(_c + 2, _r - 1),
               plan=nb_haftarm_links(_c, _r), ziel=_c, ziel_reihe=_r - 1, baustein='S2', muenze=(_c - 7, _r - 3),
               gegen=[{'frames': 6}, {'press': ['jump'], 'hold': ['jump', 'left'], 'frames': 14}, {'until': 'P.grounded', 'frames': 200}], gegen_muenze=True)

# ---------------- Haft-Inseln (S3): optional, Meister-Münze oben drauf (Oberseite 4 Reihen hoch, nur über die Haftfläche) ----------------
_HAFTINSELN = {
    'ruinen/01-ruinen.json': [(153, 5, 'pink'), (503, 15, 'pink')],
    'ruinen/02-mondnacht.json': [(137, 15, 'pink'), (414, 15, 'pink')],
    'hoehle/01-kristallhoehle.json': [(108, 15, 'blue')],
    'hoehle/02-tropfsteingang.json': [(308, 16, 'blue'), (574, 8, 'pink')],
    'hoehle/05-foerderwerk.json': [(308, 16, 'pink')],
    'hoehle/06-tiefenschlund.json': [(366, 5, 'blue')],
    'vulkan/02-aschefeld.json': [(339, 16, 'pink')],
    'vulkan/03-feuerberg.json': [(202, 15, 'pink')],
    'vulkan/05-schlackewerk.json': [(294, 16, 'pink'), (696, 16, 'blue')],
    'vulkan/07-kraterherz.json': [(545, 16, 'pink')],
}
# Seit „Haftfläche: Schleim nur unten, kein Hochziehen an den Seiten“ (Nutzerwunsch) kommt man nicht mehr um die Ecke
# auf die Insel; Nutzer-Entscheidung: die Regel bleibt, die Meister-Münzen oben bleiben liegen (nicht mehr erreichbar).
# Darum werden diese Stellen nicht mehr als „schaffbar“ geprüft (Liste bleibt als Nachweis, wo die Inseln liegen).
HAFTINSELN_ERREICHBAR = False
for _lvl, _liste in (_HAFTINSELN.items() if HAFTINSELN_ERREICHBAR else []):
    for (_a, _g, _farbe) in _liste:
        _w = 'm' if _farbe == 'blue' else 'f'
        stelle(level=_lvl, name=f'Haft-Insel {_a} (S3, optional, Meister-Münze oben)', wer=_w, start=(_a - 2, _g - 1), partner=(_a - 3, _g - 1),
               plan=nb_haftinsel(_a, _g), ziel=_a + 5, ziel_reihe=_g - 1, baustein='S3', muenze=(_a + 4, _g - 5),
               gegen=[{'hold': ['right'], 'until': f'P.x >= {kx(_a + 2)}'}, {'press': ['jump'], 'hold': ['jump', 'right'], 'frames': 14}, {'hold': ['right'], 'until': 'P.grounded', 'frames': 200}],
               gegen_muenze=True)

# ---------------- Durchbruch-Nischen (S4): optional, Münze hinter einem Durchbruch-Kästchen in der Wand ----------------
_NISCHEN = {   # (w, g, Farbe, Richtung): Richtung 1 = Wand zeigt nach links (von links her), -1 = nach rechts
    'hoehle/04-leuchtgrotte.json': [(206, 16, 'pink', -1), (356, 16, 'blue', -1), (594, 16, 'pink', -1)],
    'hoehle/05-foerderwerk.json': [(580, 16, 'blue', -1), (644, 16, 'pink', -1)],
    'hoehle/06-tiefenschlund.json': [(240, 16, 'blue', -1), (583, 16, 'pink', -1)],
    'vulkan/05-schlackewerk.json': [(744, 14, 'pink', 1)],
    'vulkan/06-feuerschlund.json': [(611, 16, 'blue', 1)],
}
# Dash nur noch waagerecht (Nutzerwunsch): die Boden-Verstecke (Dash nach unten) sind zu S4-Nischen mit seitlichem Eingang
# umgebaut (tests/bausteine/verstecke_umbauen.py -> nischen_aus_verstecken.json); wo keine Wand in der Nähe passte, liegt
# die Münze sichtbar über dem alten Versteck (kein Test nötig). _VERSTECKE bleibt nur als Eingabe des Umbau-Skripts.
import json as _json
from pathlib import Path as _Path
for _e in _json.loads((_Path(__file__).resolve().parent / 'nischen_aus_verstecken.json').read_text(encoding='utf-8')):
    _lvl, _w0, _g, _farbe, _R = _e[:5]
    if _w0 is None: continue
    _NISCHEN.setdefault(_lvl, []).append((_w0, _g, _farbe, _R))
# Sonderfälle: Partner-Platz auf einem Teleporter / nur 2 Kästchen Boden vor der Nische (_NISCHE_SCHMAL: eigener Start, und die
# Figur bleibt nach dem Dash in der Nische – zurücklaufen würde von der schmalen Kante fallen)
_NISCHE_PLATZ = {('dschungel/06-wipfelsturm.json', 405): ((408, 15), (411, 15))}
_NISCHE_SCHMAL = {('dschungel/05-dornenpfad.json', 670): ((668, 13), (666, 13)), ('hoehle/01-kristallhoehle.json', 370): ((372, 14), (371, 14))}
_IN_NISCHE_BLEIBEN = [{'until': 'P.grounded && Math.abs(P.vx) < 0.5', 'frames': 100}]
for _lvl, _liste in _NISCHEN.items():
    for (_w0, _g, _farbe, _R) in _liste:
        _w = 'm' if _farbe == 'blue' else 'f'
        _richtung = 'right' if _R > 0 else 'left'
        _start, _partner = _NISCHE_PLATZ.get((_lvl, _w0)) or _NISCHE_SCHMAL.get((_lvl, _w0)) or ((_w0 - 3 * _R, _g - 1), (_w0 - 4 * _R, _g - 1))
        _plan, _ziel = (nb_bruchnische(_w0), _w0 - 3) if _R > 0 else (nb_bruchnische_links(_w0), _w0 + 2)
        if (_lvl, _w0) in _NISCHE_SCHMAL: _plan, _ziel = _plan[:4] + _IN_NISCHE_BLEIBEN, (_w0 if _R > 0 else _w0 - 2)
        stelle(level=_lvl, name=f'Durchbruch-Nische {_w0} (S4, optional, Münze in der Wand)', wer=_w, start=_start, partner=_partner,
               plan=_plan, ziel=_ziel, ziel_reihe=_g - 1,
               baustein='S4', muenze=(_w0 + _R, _g - 1), gegen=[{'hold': [_richtung], 'frames': 90}], gegen_muenze=True)
