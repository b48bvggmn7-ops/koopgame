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
            {'press': ['jump'], 'hold': ['jump', 'festhalten', 'right'], 'until': '!!P.haft', 'frames': 60},
            {'hold': ['festhalten', 'right'], 'until': f'P.x >= {kx(ende)} || !P.haft', 'frames': 1200}] + (nach_ende or [LANDEN])

def nb_haft_dash(absprung, ende):
    """B6: wie nb_haft, am Ende Dash nach vorn über den Rest der Grube"""
    return nb_haft(absprung, ende, [{'press': ['dash'], 'hold': ['right', 'swimUp'], 'frames': 2}, LANDEN])

def nb_bruchkamin(eingang, bruch_reihe, oben_rechts):
    """B4: in den Kamin, per Wandsprung hinauf bis auf Höhe des Durchbruchs (Reihe bruch_reihe, rechte Wand),
    dann Dash nach rechts durch die Wand und auf dem Sims dahinter bis Spalte oben_rechts"""
    return [{'hold': ['right'], 'until': f'P.x >= {kx(eingang)}'},
            {'climb': True, 'dir': 1, 'until': f'P.y < {ky(bruch_reihe + 1)} && P.vy < 0', 'frames': 900},
            {'press': ['dash'], 'hold': ['right'], 'frames': 2},
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

def nb_versteck(c, r, kurz=False):
    """S1: auf dem Durchbruch-Boden (Spalten c, c+1, Oberkante r) stehen (Start dort), Dash nach unten, in der Mulde
    landen, wieder hinausspringen (nach rechts)"""
    return [{'frames': 8},
            {'press': ['dash'], 'hold': ['swimDown'], 'until': f'P.grounded && P.y > {(r + 1) * 40}', 'frames': 60},
            {'frames': 10},
            {'press': ['jump'], 'hold': ['jump', 'right'], 'frames': 14 if not kurz else 9},
            {'hold': [] if kurz else ['right'], 'holdIf': {'left': f'P.x > {kx(c + 2) + 8}'} if kurz else {}, 'until': f'P.grounded && P.x >= {kx(c + 2) if kurz else kx(c + 3)} - 10', 'frames': 200}]

def nb_haftarm(c, r, laenge=7):
    """S2: von der Kante (c, Oberkante r) hochspringen, „hoch“ halten, bis zum Arm-Ende rollen (Münze), zurückrollen,
    über der Kante loslassen"""
    return [{'frames': 6}, {'press': ['jump'], 'hold': ['jump', 'festhalten'], 'until': '!!P.haft', 'frames': 50},
            {'hold': ['festhalten', 'right'], 'until': f'P.x >= {kx(c + laenge)} - 4 || !P.haft', 'frames': 600},
            {'hold': ['festhalten', 'left'], 'until': f'P.x <= {kx(c - 1)} || !P.haft', 'frames': 600},
            {'holdIf': {'left': f'P.x > {kx(c - 1)}', 'right': f'P.x < {kx(c - 2)}'}, 'until': 'P.grounded', 'frames': 200}]

def nb_haftarm_links(c, r, laenge=7):
    """S2 gespiegelt: Arm ragt nach links über den Abgrund"""
    return [{'frames': 6}, {'press': ['jump'], 'hold': ['jump', 'festhalten'], 'until': '!!P.haft', 'frames': 50},
            {'hold': ['festhalten', 'left'], 'until': f'P.x <= {kx(c - laenge)} + 4 || !P.haft', 'frames': 600},
            {'hold': ['festhalten', 'right'], 'until': f'P.x >= {kx(c + 1)} || !P.haft', 'frames': 600},
            {'holdIf': {'right': f'P.x < {kx(c + 1)}', 'left': f'P.x > {kx(c + 2)}'}, 'until': 'P.grounded', 'frames': 200}]

def nb_haftinsel(a, g, laenge=5):
    """S3: unter der Haft-Insel (Reihe g-4) hochspringen, „hoch“ halten, nach rechts rollen, um die Ecke hinauf (oben stehen,
    Münze), rechts hinunter und landen"""
    return [{'hold': ['right'], 'until': f'P.x >= {kx(a)}'},
            {'press': ['jump'], 'hold': ['jump', 'festhalten'], 'until': '!!P.haft', 'frames': 50},
            {'hold': ['festhalten', 'right'], 'until': '!P.haft', 'frames': 600},
            {'hold': ['right'], 'until': f'P.grounded && P.y > {(g - 1) * 40}', 'frames': 300}]

def nb_bruchnische(w):
    """S4: vor der Wand Dash nach vorn (bricht das Nischen-Kästchen), in die Nische (Münze), zurück nach links"""
    return [{'hold': ['right'], 'until': f'P.x >= {kx(w - 1)} || P.vx === 0 && f > 20', 'frames': 300},
            {'press': ['dash'], 'hold': ['right'], 'until': 'P.bruchFenster > 0', 'frames': 40},
            {'hold': ['right'], 'until': '!P.dash', 'frames': 30}, {'hold': ['right'], 'frames': 10},
            {'hold': ['left'], 'until': f'P.x <= {kx(w - 2)}', 'frames': 200}, {'until': 'P.grounded && Math.abs(P.vx) < 0.5', 'frames': 100}]

def nb_bruchnische_links(w):
    """S4 gespiegelt: Nische in einer Wandfläche, die nach rechts zeigt (von rechts her Dash nach links)"""
    return [{'hold': ['left'], 'until': f'P.x <= {kx(w + 1)} || P.vx === 0 && f > 20', 'frames': 300},
            {'press': ['dash'], 'hold': ['left'], 'until': 'P.bruchFenster > 0', 'frames': 40},
            {'hold': ['left'], 'until': '!P.dash', 'frames': 30}, {'hold': ['left'], 'frames': 10},
            {'hold': ['right'], 'until': f'P.x >= {kx(w + 2)}', 'frames': 200}, {'until': 'P.grounded && Math.abs(P.vx) < 0.5', 'frames': 100}]

def mit_pusten(plan):
    """Welten ohne Dash (Dschungel, DASH_AUS_WELTEN): statt gegen die Durchbruch-Wand zu dashen, pustet der Affe sie um –
    jeder Dash-Schritt eines Bruch-Plans wird zu „stehen und pusten, bis keine Durchbruch-Wand mehr vor ihm ist“"""
    vor = "!solids.some(s => s.type === 'bruch' && !s.gone && Math.abs(s.x + s.w/2 - P.x) < 140 && s.y < P.y && s.y + s.h > P.y - 60)"
    out = []
    for st in plan:
        if 'dash' in (st.get('press') or []):
            richtung = [h for h in st.get('hold', []) if h in ('left', 'right')] or ['right']
            out += [{'holdIf': {'left': 'P.vx > 0.4', 'right': 'P.vx < -0.4'}, 'until': 'P.grounded && Math.abs(P.vx) < 0.4', 'frames': 60},
                    {'hold': ['pusten', richtung[0]], 'until': vor, 'frames': 260}]
            continue
        st = dict(st)
        if isinstance(st.get('until'), str): st['until'] = st['until'].replace('P.bruchFenster > 0', 'true').replace('!P.dash', 'true')
        out.append(st)
    return out
