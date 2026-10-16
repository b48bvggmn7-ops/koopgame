# Nacht-Ausbau Phase 3: neue Stellen in den Leveln (aus den Bausteinen) – je Stelle Start, Bot-Plan, Ziel und Gegenprobe.
# Getestet von tests/run_tests.py (Tests nacht_stellen_<welt>): jede Stelle mit dem Plan schaffen (Ziel-Spalte erreicht,
# auf dem Boden, nicht tot), die Gegenprobe (ohne die neue Mechanik) darf das Ziel NICHT erreichen.
# Eintrag: {'level', 'name', 'wer': 'm'|'f', 'start': (c, r), 'partner': (c, r), 'plan': [...], 'ziel': c (Spalte >=),
#           'ziel_reihe': r (optional: Standreihe), 'gegen': [...] oder None, 'links': [...] (vorher an), 'baustein': 'B1'…}
from plaene import *

STELLEN = []

def stelle(**e):
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
    stelle(level='dschungel/03-lianenschlucht.json', name='Durchbruch-Säule 570 + Grube 571–577 (B2, Bruch-Fenster)', wer=_w, start=(566, 14), partner=(564, 14),
           plan=nb_bruchtor(570), ziel=578, ziel_reihe=14, baustein='B2', gegen=_lauf_sprung(569))
    stelle(level='dschungel/03-lianenschlucht.json', name='Durchbruch-Säule 676 (B2)', wer=_w, start=(670, 14), partner=(668, 14),
           plan=nb_bruch_durch(676), ziel=678, ziel_reihe=14, baustein='B2', gegen=_laufen)

# ---------------- Dschungel 1 (sanfte Probe) ----------------
for _w in 'mf':
    stelle(level='dschungel/01-dschungel.json', name='Durchbruch-Wand unter dem Münz-Sims 715 (sanfte Probe; oben herum per Lift geht auch)', wer=_w,
           start=(710, 14), partner=(708, 14), plan=nb_bruch_durch(715), ziel=717, ziel_reihe=14, baustein='B2', gegen=_laufen)

# ---------------- Verstecke (S1) in den vom Nutzer gestalteten Leveln: nur zusätzlich, optional ----------------
# Verstecke auf schmalen Sockeln: nach dem Hinausspringen nur kurz nach rechts (sonst fällt der Bot vom Sockel)
_KURZ = {('d02', 220), ('d06', 201), ('d06', 403), ('r04', 183), ('r04', 366), ('r04', 599), ('r05', 595), ('r06', 183),
         ('h01', 301), ('h02', 139), ('h02', 397), ('h05', 585), ('v01', 243), ('v01', 385), ('v04', 203), ('v04', 449),
         ('v04', 637), ('v07', 273), ('v07', 333)}
_VERSTECKE = {
    'dschungel/04-gluehwald.json': [(181, 15, 'pink'), (344, 15, 'pink'), (535, 8, 'blue')],
    'dschungel/05-dornenpfad.json': [(328, 3, 'pink'), (447, 3, 'pink'), (614, 8, 'pink')],
    'dschungel/06-wipfelsturm.json': [(201, 12, 'blue'), (403, 12, 'blue'), (627, 8, 'pink')],
    'ruinen/03-fallengang.json': [(238, 9, 'blue'), (389, 10, 'pink'), (631, 6, 'blue')],
    'ruinen/04-sonnentempel.json': [(183, 10, 'pink'), (366, 10, 'pink'), (599, 10, 'blue')],
    'ruinen/05-felsenflucht.json': [(223, 9, 'pink'), (373, 10, 'blue'), (595, 10, 'pink')],
    'ruinen/06-tempelherz.json': [(183, 7, 'pink'), (354, 10, 'blue'), (489, 11, 'blue')],
    'hoehle/01-kristallhoehle.json': [(103, 15, 'pink'), (217, 3, 'pink'), (301, 8, 'pink')],
    'hoehle/02-tropfsteingang.json': [(139, 4, 'pink'), (397, 13, 'pink'), (590, 8, 'blue')],
    'hoehle/03-eisgrotte.json': [(369, 8, 'pink'), (611, 6, 'blue'), (643, 6, 'blue')],
    'hoehle/05-foerderwerk.json': [(585, 10, 'pink')],
    'vulkan/01-glutpfad.json': [(243, 6, 'pink'), (385, 10, 'pink'), (685, 4, 'pink')],
    'vulkan/02-aschefeld.json': [(433, 8, 'pink'), (546, 8, 'pink'), (674, 8, 'pink')],
    'vulkan/03-feuerberg.json': [(126, 15, 'pink'), (211, 15, 'blue'), (323, 15, 'blue')],
    'vulkan/04-magmakammer.json': [(203, 12, 'pink'), (449, 2, 'pink'), (637, 1, 'pink')],
    'vulkan/05-schlackewerk.json': [(210, 8, 'pink'), (535, 4, 'pink')],
    'vulkan/06-feuerschlund.json': [(373, 5, 'pink'), (515, 10, 'pink')],
    'vulkan/07-kraterherz.json': [(273, 5, 'pink'), (333, 12, 'blue'), (634, 5, 'blue')],
    'dschungel/02-baumkronen.json': [(220, 10, 'blue'), (410, 15, 'blue'), (616, 15, 'pink')],
    'ruinen/01-ruinen.json': [(196, 10, 'blue'), (406, 15, 'pink'), (623, 15, 'pink')],
    'ruinen/02-mondnacht.json': [(118, 15, 'blue'), (243, 6, 'pink'), (368, 9, 'blue')],
}
for _lvl, _liste in _VERSTECKE.items():
    for (_c, _r, _farbe) in _liste:
        _w = 'm' if _farbe == 'blue' else 'f'
        stelle(level=_lvl, name=f'Versteck unter Durchbruch-Boden {_c} (S1, optional, Münze)', wer=_w, start=(_c, _r - 1), partner=(_c, _r - 1),
               plan=nb_versteck(_c, _r, kurz=(_lvl.split('/')[0][0] + _lvl.split('/')[1][:2], _c) in _KURZ), ziel=_c + 1, ziel_reihe=_r - 1, baustein='S1', muenze=(_c, _r + 1),
               gegen=[{'hold': ['right'], 'until': f'P.x >= {kx(_c + 3)}', 'frames': 200}, {'frames': 20}], gegen_muenze=True)
