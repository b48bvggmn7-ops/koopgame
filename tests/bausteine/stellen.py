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
