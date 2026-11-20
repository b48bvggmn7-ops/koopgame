# tests/bausteine/finale_a1_logik.py – das Logik-Modell der „Maschine“ am Ende von Abschnitt 1 (Nutzer 20.11.: „deutlich schwerer …
# mehr Denken“). Die Maschine hat 6 Räume auf zwei Etagen (unten G0 G1 G2, oben U0 U1 U2) und einen Ausgang Z:
#   - zwischen Nachbar-Räumen einer Etage steht eine Wand, 2 Kästchen dick; jedes der beiden Kästchen ist ein eigener Wechselboden
#     (offen, wenn seine Nummer AN bzw. AUS ist) – man kommt nur durch, wenn BEIDE offen sind;
#   - zwischen Gi und Ui liegt eine Luke (Wechselboden im Boden der oberen Etage): offen = man fällt hinunter; hinauf kommt das
#     Schweinchen durch die offene Luke allein (Sprung + Dash nach oben, gemessen 254 px bei 240 px Höhe), der Affe nur mit dem
#     Schweinchen im Raum darunter (Schirm-Trampolin, 257 px);
#   - Schalter: W = Windrad (nur der Affe), R = Rammbalken (nur das Schweinchen), H = Hebel (beide) – jeder schaltet eine Nummer um;
#   - das Tor (2 dick) zum Ausgang braucht mehrere Nummern AN.
# Wer in einem offenen Durchgang steht, hält dieses Kästchen offen (so ist das im Spiel) – das Modell rechnet das mit.
# Drei Lesarten (halten=): True = wie im Spiel (wer drinsteht, hält offen), False = ohne Aufhalten durch den Partner, 'streng' = nur
# durch, wenn beide Kästchen einer Wand gleichzeitig offen sind (der „saubere“ Weg, den man ohne Tricks findet).
# Dieses Skript  (a) sucht per Zufall + Durchrechnen eine Belegung mit möglichst langem kürzestem Lösungsweg
#                (python finale_a1_logik.py --suchen [Anzahl]) – ganz ohne Sackgassen gab es unter 1,5 Mio. Belegungen keine mit
#                mehr als 4 Schaltvorgängen, deshalb gibt es im Spiel „Zurück zum Checkpoint“ im Pausenmenü,
#                (b) prüft die gewählte Belegung MASCHINE und druckt ihren kürzesten Lösungsweg (ohne Argumente).
import random, sys
from collections import deque

RAEUME = ['G0', 'G1', 'G2', 'U0', 'U1', 'U2', 'Z']
WAENDE = [('G0', 'G1'), ('G1', 'G2'), ('U0', 'U1'), ('U1', 'U2')]          # + Tor (TOR_VON -> Z)

def modell(m):
    """m = {'n': Anzahl Nummern, 'wand': [[(nr, an), (nr, an)] je Wand], 'luke': [(nr, an) je Spalte 0..2],
            'tor': [nr, …] (alle AN), 'tor_von': 'G2'|'U2', 'schalter': {raum: [(typ, nr), …]}}"""
    waende = [(a, b, [[lit] for lit in m['wand'][i]]) for i, (a, b) in enumerate(WAENDE)]
    waende.append((m['tor_von'], 'Z', [[(n, 1) for n in m['tor']]] * 2))
    return waende

def loesen(m, mit_weg=False, halten=True):
    waende = modell(m)
    # Orte: Räume und Durchgangs-Kästchen ('w', i, spalte)
    def wahr(lits, bits): return all(((bits >> n) & 1) == an for n, an in lits)
    def nachbarn(ort, anderer, bits, wer):
        out = []
        if isinstance(ort, str):
            for i, (a, b, sp) in enumerate(waende):
                if halten == 'streng':                                                     # strenge Lesart: nur durch, wenn BEIDE Kästchen gleichzeitig offen sind
                    if ort in (a, b) and wahr(sp[0], bits) and wahr(sp[1], bits): out.append(b if ort == a else a)
                    continue
                if ort == a and (wahr(sp[0], bits) or (halten and anderer == ('w', i, 0))): out.append(('w', i, 0))
                if ort == b and (wahr(sp[1], bits) or (halten and anderer == ('w', i, 1))): out.append(('w', i, 1))
            if ort[0] in 'GU' and ort != 'Z':
                i = int(ort[1]); n, an = m['luke'][i]; offen = ((bits >> n) & 1) == an
                if ort[0] == 'U' and offen: out.append('G' + ort[1])                       # hinunterfallen
                if ort[0] == 'G' and offen and (wer == 's' or anderer == ort): out.append('U' + ort[1])   # hinauf: Schweinchen allein (Sprung + Dash), Affe nur mit dem Schweinchen darunter (Schirm-Trampolin)
        else:
            _, i, s = ort; a, b, sp = waende[i]
            out.append(a if s == 0 else b)                                                 # hinaus in den eigenen Raum
            t = 1 - s
            if wahr(sp[t], bits) or (halten and anderer == ('w', i, t)): out.append(('w', i, t))       # ins zweite Kästchen
        return out
    start = ('G0', 'G0', 0); ziel = lambda z: z[0] == 'Z' and z[1] == 'Z'
    dist = {start: 0}; vor = {start: None}; dq = deque([start]); gefunden = None
    kanten = {}                                                                            # für die Sackgassen-Prüfung
    while dq:
        z = dq.popleft(); a, s, bits = z; d = dist[z]; nach = []
        for o in nachbarn(a, s, bits, 'a'): nach.append(((o, s, bits), 0, ('Affe', o)))
        for o in nachbarn(s, a, bits, 's'): nach.append(((a, o, bits), 0, ('Schwein', o)))
        for wer, ort, typen in (('Affe', a, 'WH'), ('Schwein', s, 'RH')):
            if isinstance(ort, str):
                for typ, n in m['schalter'].get(ort, []):
                    if typ in typen: nach.append(((a, s, bits ^ (1 << n)), 1, (wer, typ, n, ort)))
        kanten[z] = [x[0] for x in nach]
        for z2, k, was in nach:
            nd = d + k
            if z2 not in dist or nd < dist[z2]:
                dist[z2] = nd; vor[z2] = (z, was)
                (dq.append if k else dq.appendleft)(z2)
    ziele = [z for z in dist if ziel(z)]
    if not ziele: return None
    bestes = min(ziele, key=lambda z: dist[z])
    # Sackgassen: von jedem erreichbaren Zustand muss ein Ziel erreichbar sein
    rueck = {}
    for z, ns in kanten.items():
        for z2 in ns: rueck.setdefault(z2, []).append(z)
    ok = set(ziele); st = list(ziele)
    while st:
        z = st.pop()
        for y in rueck.get(z, []):
            if y not in ok: ok.add(y); st.append(y)
    sack = len(dist) - len(ok)
    weg = None
    if mit_weg:
        weg = []; z = bestes
        while vor[z]: z, was = vor[z]; weg.append(was)
        weg.reverse()
    return {'schalten': dist[bestes], 'zustaende': len(dist), 'sackgassen': sack, 'weg': weg}

def zufall(rnd, n=4):
    lit = lambda: (rnd.randrange(n), rnd.randrange(2))
    m = {'n': n, 'wand': [[lit(), lit()] for _ in WAENDE], 'luke': [lit() for _ in range(3)],
         'tor': sorted(rnd.sample(range(n), 3)), 'tor_von': rnd.choice(['G2', 'U2']), 'schalter': {}}
    orte = ['G0', 'G1', 'G2', 'U0', 'U1', 'U2']
    for nr in range(n):                               # jede Nummer bekommt 1–2 Schalter
        for _ in range(rnd.choice([1, 1, 2])):
            m['schalter'].setdefault(rnd.choice(orte), []).append((rnd.choice('WRH'), nr))
    return m

def gut(m, r):
    if not r or r['sackgassen']: return False
    typen = {t for l in m['schalter'].values() for t, _ in l}
    if not {'W', 'R'} <= typen: return False
    if any(len(l) > 2 for l in m['schalter'].values()): return False
    if any(a == b for a, b in m['wand']): return False                      # beide Kästchen einer Wand gleich = langweilig
    benutzt = {n for w in m['wand'] for n, _ in w} | {n for n, _ in m['luke']}
    return len(benutzt) == m['n']

def suchen(anzahl, saat=1):
    rnd = random.Random(saat); beste = []
    for i in range(anzahl):
        m = zufall(rnd); r = loesen(m)
        if gut(m, r): beste.append((r['schalten'], r['zustaende'], m))
    beste.sort(key=lambda x: (-x[0], -x[1]))
    return beste[:8]

# ---- die gewählte Belegung (aus der Suche; Nummern 0..3 = A..D = im Level 71, 72, 73, 74) ----
# 10-mal schalten nötig (in allen drei Lesarten), 1531 erreichbare Lagen, davon 30 Sackgassen.
MASCHINE = {'n': 4, 'wand': [[(0, 1), (3, 0)], [(1, 1), (2, 0)], [(2, 0), (0, 0)], [(0, 1), (2, 1)]], 'luke': [(3, 1), (0, 0), (1, 0)],
            'tor': [0, 1, 3], 'tor_von': 'U2',
            'schalter': {'G0': [('W', 0)], 'U2': [('R', 1), ('W', 3)], 'U0': [('R', 2)], 'U1': [('H', 2), ('R', 3)]}}

def beschreiben(m):
    N = lambda n: 'ABCDE'[n]
    for i, (a, b) in enumerate(WAENDE): print(f'  Wand {a}|{b}: ' + ' und '.join(f'{N(n)} {"AN" if an else "AUS"}' for n, an in m['wand'][i]))
    for i in range(3): n, an = m['luke'][i]; print(f'  Luke {i}: offen bei {N(n)} {"AN" if an else "AUS"}')
    print('  Tor von', m['tor_von'], 'braucht', ' + '.join(N(n) for n in m['tor']))
    for ort, l in sorted(m['schalter'].items()): print(f'  {ort}: ' + ', '.join({"W": "Windrad", "R": "Rammbalken", "H": "Hebel"}[t] + ' ' + N(n) for t, n in l))

if __name__ == '__main__':
    if '--suchen' in sys.argv:
        k = sys.argv.index('--suchen'); anzahl = int(sys.argv[k + 1]) if len(sys.argv) > k + 1 else 20000
        for sch, zu, m in suchen(anzahl, int(sys.argv[k + 2]) if len(sys.argv) > k + 2 else 1):
            print(f'--- {sch}× schalten nötig, {zu} Zustände'); print('   ', m)
    else:
        for lesart in (True, False, 'streng'):
            r = loesen(MASCHINE, True, halten=lesart)
            print('Lesart', lesart, '– Schalten nötig:', r['schalten'], '| erreichbare Lagen:', r['zustaende'], '| Sackgassen:', r['sackgassen'])
        beschreiben(MASCHINE)
        for w in r['weg']: print('   ', w)
