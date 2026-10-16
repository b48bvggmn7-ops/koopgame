# Bot-Pläne der Nacht-Bausteine (für tests/run_tests.py und Level-Tests). Spalten = Kästchen, kx/ky wie in run_tests.
def kx(c): return c * 40 + 20
def ky(r): return (r + 1) * 40
LANDEN = {'hold': ['right'], 'until': 'P.grounded', 'frames': 400}

def nb_dashgrube(kante, hoch=False):
    """B1: an der Kante springen, am höchsten Punkt Dash nach vorn (hoch=True: schräg nach oben)"""
    return [{'hold': ['right'], 'until': f'P.x >= {kx(kante) - 8}'}, {'press': ['jump'], 'hold': ['right', 'jump'], 'frames': 10},
            {'hold': ['right'], 'until': 'P.vy > -3', 'frames': 60},
            {'press': ['dash'], 'hold': ['right'] + (['swimUp'] if hoch else []), 'frames': 2}, LANDEN]

def nb_bruchtor(wand, vorlauf=1):
    """B2: vorlauf Kästchen vor der Durchbruch-Wand Dash nach vorn, im Bruch-Fenster springen"""
    return [{'hold': ['right'], 'until': f'P.x >= {kx(wand - vorlauf)}'},
            {'press': ['dash'], 'hold': ['right'], 'until': 'P.bruchFenster > 0', 'frames': 40},
            {'hold': ['right'], 'until': '!P.dash', 'frames': 20},
            {'press': ['jump'], 'hold': ['right', 'jump'], 'frames': 10}, LANDEN]

def nb_bruch_durch(wand, vorlauf=1, weiter=3):
    """B2 ohne Grube: vor der Wand Dash nach vorn (bricht sie), danach bis Spalte wand+weiter laufen und stehen bleiben"""
    return [{'hold': ['right'], 'until': f'P.x >= {kx(wand - vorlauf)}'},
            {'press': ['dash'], 'hold': ['right'], 'until': 'P.bruchFenster > 0', 'frames': 40},
            {'hold': ['right'], 'until': f'!P.dash && P.x >= {kx(wand + weiter)}', 'frames': 120},
            {'holdIf': {'left': 'P.vx > 0.5'}, 'until': 'P.grounded && Math.abs(P.vx) < 0.5', 'frames': 120}]

def nb_haft(absprung, ende, nach_ende=None):
    """B3: unter der Haftfläche hochspringen, „hoch“ halten, nach rechts rollen bis Spalte ende, dann loslassen"""
    return [{'hold': ['right'], 'until': f'P.x >= {kx(absprung)}'},
            {'press': ['jump'], 'hold': ['jump', 'swimUp', 'right'], 'until': '!!P.haft', 'frames': 60},
            {'hold': ['swimUp', 'right'], 'until': f'P.x >= {kx(ende)} || !P.haft', 'frames': 1200}] + (nach_ende or [LANDEN])

def nb_haft_dash(absprung, ende):
    """B6: wie nb_haft, am Ende Dash nach vorn über den Rest der Grube"""
    return nb_haft(absprung, ende, [{'press': ['dash'], 'hold': ['right', 'swimUp'], 'frames': 2}, LANDEN])

def nb_bruchkamin(eingang, deckel_reihe, oben_rechts):
    """B4: in den Kamin, per Wandsprung hinauf, 3 Reihen unter dem Deckel Dash nach oben, dann rechts auf den Sims"""
    return [{'hold': ['right'], 'until': f'P.x >= {kx(eingang)}'},
            {'climb': True, 'dir': 1, 'until': f'P.y < {ky(deckel_reihe + 3)} && P.vy < 0', 'frames': 900},
            {'press': ['dash'], 'hold': ['swimUp'], 'until': f'P.y < {ky(deckel_reihe - 1)}', 'frames': 40},
            {'hold': ['right'], 'until': f'P.grounded && P.x >= {kx(oben_rechts)}', 'frames': 400}]

def nb_haken_bruch(absprung, wand):
    """B5 Affe: springen, Haken greifen, schwingen, loslassen, vor der Wand Dash nach vorn"""
    return [{'hold': ['right'], 'until': f'P.x >= {kx(absprung)}'},
            {'press': ['jump'], 'hold': ['right', 'jump'], 'hookWhen': 'P.vy > -3', 'until': 'P.hookAttached || (P.grounded && f > 5)', 'frames': 120},
            {'swing': True, 'pull': 0, 'release': 'P.x > P.anchor.x + 70 && P.vx > 1', 'frames': 500},
            {'press': ['dash'], 'hold': ['right'], 'frames': 2}, LANDEN]

def nb_segel_dash(absprung, dash_bei, hoch=False):
    """B5/B7 Schweinchen: springen, segeln, bei Spalte dash_bei Dash nach vorn, weiter segeln"""
    return [{'hold': ['right'], 'until': f'P.x >= {kx(absprung)}'}, {'press': ['jump'], 'hold': ['right', 'jump'], 'frames': 10},
            {'hold': ['right', 'glide'], 'until': f'P.x >= {kx(dash_bei)}', 'frames': 400},
            {'press': ['dash'], 'hold': ['right'] + (['swimUp'] if hoch else []), 'frames': 2},
            {'hold': ['right', 'glide'], 'until': 'P.grounded', 'frames': 400}]
