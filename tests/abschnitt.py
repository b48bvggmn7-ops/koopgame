# tests/abschnitt.py – Abschnitte (Dschungel-Neu) für Tests und Prüfwerkzeuge: dieselbe Rechnung wie js/15a-abschnitte.js.
# Ein Abschnitt (levels/<welt>/abschnitt-<n>-<titel>.json) listet seine Teile ("teile"); beim Spielen werden sie
# hintereinander gesetzt (Teil k: x um die Breite der Teile davor, Nummern um 20·k). Hier:
#   zusammensetzen(def, [teil, …])  -> Spiel-Format des ganzen Abschnitts (gleich wie im Spiel, Test abschnitt_zusammensetzen)
#   laden('dschungel/abschnitt-1-….json') -> dasselbe direkt aus den Dateien
#   teil_versatz(datei) -> (Abschnitt, Teil-Nummer 0…, Spalten-Versatz, Nummern-Versatz) eines Teils, sonst None
#   level_dateien(welt)  -> alle Level-Dateien einer Welt, Abschnitte in ihre Teile aufgelöst (für die Prüfwerkzeuge)
import json, math
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
TILE = 40
NUMMERN_JE_TEIL = 20
X_FELDER = ('x', 'targetX')
NUMMER_FELDER = ('link', 'switchLink')

def lies(datei): return json.loads((ROOT / 'levels' / datei).read_text(encoding='utf-8'))
def ist_abschnitt(d): return isinstance(d, dict) and isinstance(d.get('teile'), list) and 'solids' not in d

def teil_spalten(d):
    mx = d['goal']['x'] + TILE if d.get('goal') else 0
    for s in d.get('solids', []): mx = max(mx, s['x'] + s['w'])
    return math.ceil(mx / TILE - 1e-6)

def zusammensetzen(defn, teile):
    out, spalte, N = {}, 0, len(teile)
    for k, d in enumerate(teile):
        dx, dl, sp = spalte * TILE, k * NUMMERN_JE_TEIL, teil_spalten(d)
        rechts = sp * TILE
        gy = d['goal']['y'] if d.get('goal') else -1e9
        sy = d['startM']['y'] if d.get('startM') else -1e9
        def naht_weg(s):
            return ((k < N - 1 and abs(s['x'] + s['w'] - rechts) < 0.5 and s['x'] >= rechts - 8 * TILE - 0.5 and s['y'] + s['h'] <= gy + 0.5)
                    or (k > 0 and s['x'] <= 0.5 and s['w'] <= TILE + 0.5 and s['y'] + s['h'] <= sy + 0.5))
        for feld, v in d.items():
            if not isinstance(v, list): continue
            liste = out.setdefault(feld, [])
            for o in v:
                if not isinstance(o, dict): continue
                if feld == 'solids' and naht_weg(o): continue
                n = dict(o)
                for f in X_FELDER:
                    if isinstance(n.get(f), (int, float)) and not isinstance(n.get(f), bool): n[f] += dx
                for f in NUMMER_FELDER:
                    if isinstance(n.get(f), (int, float)) and not isinstance(n.get(f), bool) and n[f] > 0: n[f] += dl
                if feld == 'teleporters' and 'paar' in n: n['paar'] = k * 1000 + int(n['paar'])
                if feld == 'movingPlatforms' and n.get('group') is not None: n['group'] = f't{k}-{n["group"]}'
                liste.append(n)
        if k == 0: out['startM'], out['startF'] = d.get('startM'), d.get('startF')
        if k == N - 1 and d.get('goal'): out['goal'] = {'x': d['goal']['x'] + dx, 'y': d['goal']['y']}
        spalte += sp
    for k in ('welt', 'tageszeit', 'wetter', 'look', 'theme'):
        if k in defn: out[k] = defn[k]
    out['abschnitt'] = defn.get('abschnitt', 1); out['abschnittTeile'] = len(teile)
    if defn.get('nachSzene'): out['nachSzene'] = defn['nachSzene']
    return out

def laden(datei):
    d = lies(datei)
    return zusammensetzen(d, [lies(t) for t in d['teile']]) if ist_abschnitt(d) else d

def abschnitte():
    w = json.loads((ROOT / 'levels' / 'worlds.json').read_text(encoding='utf-8'))
    return [d for x in w['welten'] for d in x['level'] if ist_abschnitt(lies(d))]

def teil_versatz(datei):
    for a in abschnitte():
        d = lies(a); spalte = 0
        for k, t in enumerate(d['teile']):
            if t == datei: return a, k, spalte, k * NUMMERN_JE_TEIL
            spalte += teil_spalten(lies(t))
    return None

def level_dateien(welt_eintrag):
    """Level einer Welt aus worlds.json, Abschnitte in ihre Teile aufgelöst"""
    out = []
    for d in welt_eintrag['level']:
        x = lies(d)
        out += x['teile'] if ist_abschnitt(x) else [d]
    return out
