# tests/haken_pruefen.py – Haken-Prüfung (Nutzerwunsch „Haken aufräumen“): für jeden Schwung-Haken in jedem Level
#   Bahn  – freie Schwungbahn: der Affe hängt UNTER dem Haken (Hände am Seil-Ende, Körper darunter). Geprüft wird sein Körper
#           bei voller Seillänge (= Reichweite) und bei ¾ davon, Ausschlag bis ±BAHN_WINKEL Grad: kein Boden, keine Wand,
#           keine Stacheln/Fallen/Pressen darin (sonst stößt er beim Schwingen an).
#   Ring  – Reichweiten-Kreise zweier Haken überdecken sich nicht (Abstand der Haken ≥ Reichweite 1 + Reichweite 2); so
#           greift man nie den falschen Haken. Mit Schwung schafft der Affe bequem 9–10 Spalten (gemessen mit der echten
#           Physik: aus einem Schwung bis 13 Spalten, mit Schwung holen bis 16, Reichweite 4,5 Kästchen).
#   Landen (nur die Füße setzen von oben auf Boden/Wand auf) ist kein Anstoßen. Fahrende Haken zählen mit ihrem Startplatz (auf der Fahrt an anderen vorbei = gewollt). Haken, die bewusst anders stehen, kommen mit Begründung in
#   tests/haken_ausnahmen.json ({"level", "spalte", "regel", "grund"}).
# Aufruf: python3 tests/haken_pruefen.py [--level <welt>/<datei>] [--alle]  (Ausgabe: Befunde je Level; Rückgabe 1 bei Befunden)
import json, math, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
T = 40
W, H = 28.5, 32.3            # Figur (js/04-figuren-kollision.js)
HAENDE = 0.6                 # Seil-Ende = Füße - 0,6 * Höhe (js/08-figur-physik-seil.js)
BAHN_WINKEL = 50             # so weit (Grad) schwingt man beim normalen Spielen sicher aus
RING_TOLERANZ = 4            # px: so knapp dürfen sich zwei Kreise berühren
STD_RADIUS = 260             # HOOK_MAX_RANGE (js/02-physik-werte.js)

def welten_level():
    w = json.loads((ROOT / 'levels' / 'worlds.json').read_text(encoding='utf-8'))
    out = []
    for welt in w['welten']:
        out += welt.get('level', [])
        if welt.get('boss'): out.append(welt['boss'])
    return out

def hindernisse(d):
    """Rechtecke (x, y, w, h, art), an die der Affe beim Schwingen stoßen kann"""
    L = [(s['x'], s['y'], s['w'], s['h'], s.get('type', 'ground')) for s in d.get('solids', [])
         if s.get('type', 'ground') in ('ground', 'wall', 'crumble', 'bruch')]
    L += [(s['x'], s['y'], s.get('w', T), s.get('h', T), 'bruch') for s in d.get('bruchWaende', [])]
    L += [(s['x'], s['y'], s.get('w', T), s.get('h', T), 'wechsel') for s in d.get('switchFloors', []) if s.get('gruppe', 'A') == 'A']
    for o in d.get('spikes', []): L.append((o['x'] - o.get('w', T)/2, o['y'] - o.get('h', T), o.get('w', T), o.get('h', T), 'Stacheln'))
    for o in d.get('traps', []) + d.get('pressen', []): L.append((o['x'] - T/2, o['y'] - T/2, T, T, 'Falle/Presse'))
    return L

def koerper(hx, hy):
    """Box des Affen, wenn seine Hände bei (hx, hy) sind"""
    fy = hy + HAENDE * H
    return hx - W/2, fy - H, hx + W/2, fy

LANDE_TIEFE = 12             # px: berühren nur die Füße die Oberseite (so tief), ist das eine Landung, kein Anstoßen

def stoss(hind, box):
    """erstes Hindernis, an das der Körper stößt – Füße auf einer Oberseite (Landung) zählen nicht, Stacheln/Fallen immer"""
    x0, y0, x1, y1 = box
    for (x, y, w, h, art) in hind:
        if x < x1 - 0.5 and x + w > x0 + 0.5 and y < y1 - 0.5 and y + h > y0 + 0.5:
            if art in ('ground', 'wall', 'crumble', 'bruch', 'wechsel') and y1 - y <= LANDE_TIEFE: continue
            return (x, y, art)
    return None

def bahn_pruefen(hind, h):
    R = h.get('radius') or STD_RADIUS
    for L in (R, R * 0.75):
        for g in range(-BAHN_WINKEL, BAHN_WINKEL + 1, 5):
            a = math.radians(g)
            t = stoss(hind, koerper(h['x'] + L * math.sin(a), h['y'] + L * math.cos(a)))
            if t: return {'winkel': g, 'laenge': round(L), 'spalte': int(t[0] // T), 'reihe': int(t[1] // T), 'art': t[2]}
    return None

def punkte(h):
    # fahrende Haken: nur der Startplatz – dass sie auf ihrer Fahrt an anderen vorbeikommen, ist gewollt (Timing)
    return [(h['x'], h['y'])]

def pruefen(datei, ausnahmen):
    d = json.loads((ROOT / 'levels' / datei).read_text(encoding='utf-8'))
    hind = hindernisse(d)
    hs = d.get('hooks', [])
    aus = {(a['spalte'], a['regel']) for a in ausnahmen if a['level'] == datei}
    bef = []
    for h in hs:
        c = int(h['x'] // T)
        b = bahn_pruefen(hind, h)
        if b and (c, 'Bahn') not in aus:
            bef.append({'regel': 'Bahn', 'spalte': c, 'reihe': int(h['y'] // T),
                        'text': f"Haken {c}/{int(h['y'] // T)}: stößt bei {b['winkel']}° (Seil {b['laenge']}) an {b['art']} bei {b['spalte']},{b['reihe']}"})
    for i, a in enumerate(hs):
        for b in hs[i + 1:]:
            ra, rb = a.get('radius') or STD_RADIUS, b.get('radius') or STD_RADIUS
            dmin = min(math.hypot(p[0] - q[0], p[1] - q[1]) for p in punkte(a) for q in punkte(b))
            if dmin < ra + rb - RING_TOLERANZ:
                ca, cb = int(a['x'] // T), int(b['x'] // T)
                if (ca, 'Ring') in aus or (cb, 'Ring') in aus: continue
                bef.append({'regel': 'Ring', 'spalte': ca, 'reihe': int(a['y'] // T),
                            'text': f"Haken {ca}/{int(a['y'] // T)} und {cb}/{int(b['y'] // T)}: Kreise überdecken sich "
                                    f"(Abstand {dmin / T:.1f}, nötig {(ra + rb) / T:.1f} Kästchen)"})
    return bef

def main():
    args = sys.argv[1:]
    nur = args[args.index('--level') + 1] if '--level' in args else None
    pf = ROOT / 'tests' / 'haken_ausnahmen.json'
    ausnahmen = json.loads(pf.read_text(encoding='utf-8')) if pf.exists() else []
    gesamt = 0
    for datei in ([nur] if nur else welten_level()):
        bef = pruefen(datei, ausnahmen)
        gesamt += len(bef)
        if bef or '--alle' in args:
            print(f'{datei}: {len(bef)} Befund(e)')
            for b in bef: print('   ', b['regel'].ljust(5), b['text'])
    print(f'Haken-Prüfung: {gesamt} Befund(e)')
    return 1 if gesamt else 0

if __name__ == '__main__':
    sys.exit(main())
