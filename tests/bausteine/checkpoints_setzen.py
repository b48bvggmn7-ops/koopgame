# Nacht-Ausbau Phase 3: Checkpoint-Lücken über 60 Spalten schließen (Ziel 40–60). Es werden NUR Checkpoints ergänzt
# (keine verschoben/entfernt): auf einem Kästchen, durch das ein alter Bot-Weg läuft (= sicher erreichbarer Hauptweg),
# mit Boden darunter, ohne Stacheln/Lava/Elemente daneben, nicht zwischen Hebel und Tür (Bild-Regel-Prüfung).
# Vom Nutzer gestaltete Level (Dschungel 2, Ruinen 1, Mondnacht) bleiben unberührt.
# Aufruf: python3 tests/bausteine/checkpoints_setzen.py [--zeigen] [datei ...]
import sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import level_bau as L
import bildregel_pruefen as B

NUTZER = {'dschungel/02-baumkronen.json', 'ruinen/01-ruinen.json', 'ruinen/02-mondnacht.json'}
GRENZE, MIN_AB = 60, 30

def gefahr_zellen(d):
    z = set()
    for f in ('spikes', 'traps', 'pressen', 'boulders', 'switches', 'doors', 'plates', 'teleporters', 'bouncers', 'checkpoints'):
        for o in d.get(f, []): z.add((B.spalte(o['x']), B.reihe(o['y'] - 1)))
    for f in ('lava', 'movingPlatforms', 'switchFloors', 'baender', 'eis', 'winds', 'bruchWaende'):
        for o in d.get(f, []):
            for c in (B.felder_zellen(o) if 'w' in o else [(B.spalte(o['x']), B.reihe(o['y']))]): z.add(c)
    return z

def jagd_spalten(d):
    """Spalten von Verfolgungen/Fahrten: rollende Felsen (80 Spalten in Rollrichtung), bewegte Teile (Weg ±3),
    steigende Lava (Becken mit Lava-Marke ±5) – dort kein Checkpoint (sonst Wiedereinstieg mitten in der Jagd)"""
    z = set()
    for b in d.get('boulders', []):
        c = B.spalte(b['x']); z.update(range(c - 3, c + 81) if b.get('richtung', 'r') == 'r' else range(c - 80, c + 4))
    for m in d.get('movingPlatforms', []):
        a, e = sorted((B.spalte(m['x']), B.spalte(m.get('targetX', m['x'])))); z.update(range(a - 3, e + 4))
    for lp in d.get('lavaPegel', []):
        c = B.spalte(lp['x'])
        for l in d.get('lava', []):
            a, e = B.spalte(l['x']), B.spalte(l['x'] + l['w'] - 1)
            if a - 3 <= c <= e + 3: z.update(range(a - 5, e + 6))
    return z

def bild_befunde(lv):
    """Bild-Regel-Befunde (Checkpoint zwischen Auslöser und Ziel) des aktuellen Stands"""
    d = json.loads(json.dumps(lv.alt_spiel))
    d['checkpoints'] = [{'x': p['c'] * 40 + 20, 'y': (p['r'] + 1) * 40} for p in lv.ed['checkpoints']]
    return {v['text'] for v in B.bild_pruefen(d)[1] if 'Checkpoint' in v['text']} | \
           {f"keine Stelle {v['spalte']}" for v in B.checkpoints_pruefen(d)[1] if 'keine Stelle' in v['text']}

def setzen(datei, nur_zeigen=False):
    lv = L.Level(datei); d = lv.alt_spiel
    bot = L.bot_zellen(datei); gef = gefahr_zellen(d); jagd = jagd_spalten(d)
    start = B.spalte(d['startM']['x']) if 'startM' in d else 0
    ziel = lv.ed['goal']['c']
    vorher = bild_befunde(lv)
    # bewusste Lücken (Rätsel am Stück, z. B. zwei getrennte Wege): Checkpoint-Ausnahme am Lücken-Ende -> nicht anfassen
    bewusst = {a['spalte'] for a in B.ausnahmen() if a['level'] == datei and a['regel'] == 'Checkpoint'}
    neu = []
    while True:
        cps = sorted([start] + [p['c'] for p in lv.ed['checkpoints']] + [ziel])
        luecken = [(a, b) for a, b in zip(cps, cps[1:]) if b - a > GRENZE and b not in bewusst and (a, b) not in [x[2] for x in neu if x[0] is None]]
        if not luecken: break
        a, b = luecken[0]
        mitte = (a + b) / 2
        kand = sorted({(c, r) for (c, r) in bot if a + MIN_AB <= c <= b - min(MIN_AB, (b - a) // 2)
                       and c not in jagd and lv.typ(c, r + 1) in L.FEST and lv.typ(c, r) is None and lv.typ(c, r - 1) is None
                       and not any((c + dc, r + dr) in gef for dc in (-1, 0, 1) for dr in (-1, 0, 1))},
                      key=lambda z: abs(z[0] - mitte))
        # zwei getrennte Wege (Staffel): in der Nähe stehen Bot-Wege auf deutlich anderer Höhe -> dort kein Checkpoint
        stehen = [(c, r) for (c, r) in bot if lv.typ(c, r + 1) in L.FEST]
        kand = [(c, r) for (c, r) in kand if not any(abs(c2 - c) <= 8 and abs(r2 - r) >= 3 for (c2, r2) in stehen)]
        gesetzt = None
        for (c, r) in kand[:40]:
            lv.checkpoint(c, r)
            if bild_befunde(lv) <= vorher: gesetzt = (c, r); break   # keine neue Bild-Regel-Verletzung, auf beiden Seiten eine Stelle
            lv.checkpoint_weg(c)
        if gesetzt: neu.append((gesetzt[0], gesetzt[1], (a, b)))
        else: neu.append((None, None, (a, b)))
    if not nur_zeigen and any(c is not None for c, r, _ in neu): L.speichern([lv])
    return neu

if __name__ == '__main__':
    dateien = [a for a in sys.argv[1:] if not a.startswith('--')] or [f for f in B.welten_level() if 'boss' not in f and f not in NUTZER]
    for f in dateien:
        print(f, setzen(f, nur_zeigen='--zeigen' in sys.argv))
