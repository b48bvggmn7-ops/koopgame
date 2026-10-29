# tests/abschnitt.py – Abschnitte (Dschungel-Neu) für Tests und Prüfwerkzeuge: dieselbe Rechnung wie js/15a-abschnitte.js.
# Ein Abschnitt (levels/<welt>/abschnitt-<n>-<titel>.json) listet seine Teile ("teile"); beim Spielen werden sie
# hintereinander gesetzt (Teil k: x um die Breite der Teile davor, Nummern um 20·k). Hier:
#   zusammensetzen(def, [teil, …])  -> Spiel-Format des ganzen Abschnitts (gleich wie im Spiel, Test abschnitt_zusammensetzen)
#   laden('dschungel/abschnitt-1-….json') -> dasselbe direkt aus den Dateien
#   teil_versatz(datei) -> (Abschnitt, Teil-Nummer 0…, Spalten-Versatz, Nummern-Versatz) eines Teils, sonst None
#   level_dateien(welt)  -> alle Level-Dateien einer Welt, Abschnitte in ihre Teile aufgelöst (für die Prüfwerkzeuge)
#   Seit „Level 1–3 zusammen“ (Nutzerwunsch) sind die Abschnitte fest zusammengefügt ("_teile"): teil_sicht(teil) schneidet
#   einen alten Teil heraus, lies(teil) tut das automatisch, wenn die Teil-Datei im Archiv liegt.
import json, math
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
TILE = 40
NUMMERN_JE_TEIL = 20
X_FELDER = ('x', 'targetX')
NUMMER_FELDER = ('link', 'switchLink')

def lies(datei):
    p = ROOT / 'levels' / datei
    if p.exists(): return json.loads(p.read_text(encoding='utf-8'))
    t = teil_sicht(datei)   # Nutzerwunsch „Level 1–3 zusammen“: alte Teile gibt es nur noch als Ausschnitt des Abschnitts
    if t is None: raise FileNotFoundError(p)
    return t
def ist_abschnitt(d): return isinstance(d, dict) and isinstance(d.get('teile'), list) and 'solids' not in d
def ist_zusammengefuegt(d): return isinstance(d, dict) and isinstance(d.get('_teile'), list)

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

def _welt_level():
    w = json.loads((ROOT / 'levels' / 'worlds.json').read_text(encoding='utf-8'))
    return [d for x in w['welten'] for d in x['level']]

def _roh(datei):
    p = ROOT / 'levels' / datei
    return json.loads(p.read_text(encoding='utf-8')) if p.exists() else None

def abschnitte():
    """Abschnitte der Welten – als Teile-Liste (alt) oder fest zusammengefügt ("_teile", tests/bausteine/abschnitte_zusammenfuegen.py)"""
    return [d for d in _welt_level() if (x := _roh(d)) is not None and (ist_abschnitt(x) or ist_zusammengefuegt(x))]

def teile_von(abschnitt):
    d = _roh(abschnitt)
    return [t['datei'] for t in d['_teile']] if ist_zusammengefuegt(d) else list(d.get('teile', []))

def teil_versatz(datei):
    for a in abschnitte():
        d = _roh(a)
        if ist_zusammengefuegt(d):
            for k, t in enumerate(d['_teile']):
                if t['datei'] == datei: return a, k, t['von'], t['nummern']
            continue
        spalte = 0
        for k, t in enumerate(d['teile']):
            if t == datei: return a, k, spalte, k * NUMMERN_JE_TEIL
            spalte += teil_spalten(lies(t))
    return None

def teil_sicht(datei):
    """einen alten Teil aus dem zusammengefügten Abschnitt wieder herausschneiden (Spiel-Format, Teil-Koordinaten und
    -Nummern wie früher) – damit die Stellen-Tests ihre gewohnten Spalten benutzen können; None = kein solcher Teil"""
    for a in _welt_level():
        d = _roh(a)
        if not ist_zusammengefuegt(d): continue
        t = next((t for t in d['_teile'] if t['datei'] == datei), None)
        if not t: continue
        x0, x1, dl = t['von'] * TILE, (t['von'] + t['breite']) * TILE, t['nummern']
        out = {}
        for feld, v in d.items():
            if feld.startswith('_'): continue
            if not isinstance(v, list): out[feld] = v; continue
            liste = []
            for o in v:
                if not isinstance(o, dict) or not isinstance(o.get('x'), (int, float)): liste.append(o); continue
                n = dict(o)
                if 'w' in n and isinstance(n.get('w'), (int, float)) and feld != 'spikes':   # Fläche: auf den Teil zuschneiden
                    a0, a1 = max(n['x'], x0), min(n['x'] + n['w'], x1)
                    if a1 - a0 < 0.5: continue
                    n['x'], n['w'] = a0, a1 - a0
                elif not (x0 <= n['x'] < x1): continue
                for f in X_FELDER:
                    if isinstance(n.get(f), (int, float)) and not isinstance(n.get(f), bool): n[f] -= x0
                for f in NUMMER_FELDER:
                    if isinstance(n.get(f), (int, float)) and not isinstance(n.get(f), bool) and dl < n[f] <= dl + NUMMERN_JE_TEIL: n[f] -= dl
                liste.append(n)
            out[feld] = liste
        for k in ('startM', 'startF', 'goal'): out[k] = t.get(k)
        out.pop('nachSzene', None)
        return out
    return None

def partner_teil_sicht(datei):
    """Begleitdatei (levels/partner/) eines alten Teils aus der des Abschnitts herausschneiden – Spalten, Pixel und Nummern
    wie in teil_sicht; None = kein solcher Teil"""
    import re
    for a in _welt_level():
        d = _roh(a)
        if not ist_zusammengefuegt(d): continue
        t = next((t for t in d['_teile'] if t['datei'] == datei), None)
        if not t: continue
        q = ROOT / 'levels' / 'partner' / a
        if not q.exists(): return None
        pd = json.loads(q.read_text(encoding='utf-8'))
        c0, c1, dl = t['von'], t['von'] + t['breite'], t['nummern']
        x0 = c0 * TILE
        def nr(n): return n - dl if dl < n <= dl + NUMMERN_JE_TEIL else n
        def text(s):   # Pixel-Zahlen (x) in den Bot-Schritten verschieben, linkOn[n] umnummern
            s = re.sub(r'(?<![\w.])(\d+(?:\.\d+)?)', lambda m: str(round(float(m.group(1)) - x0, 3)).rstrip('0').rstrip('.') if float(m.group(1)) >= x0 else m.group(1), s)
            return re.sub(r'linkOn\[(\d+)\]', lambda m: f'linkOn[{nr(int(m.group(1)))}]', s)
        def tief(o):
            if isinstance(o, str): return text(o)
            if isinstance(o, list): return [tief(x) for x in o]
            if isinstance(o, dict): return {k: tief(v) for k, v in o.items()}
            return o
        aufgaben = []
        for au in pd.get('aufgaben', []):
            z = au.get('zone')
            if not z or not (c0 <= z[0] < c1): continue
            n = dict(au); n['zone'] = [z[0] - c0, z[1] - c0]
            if isinstance(n.get('nummer'), int): n['nummer'] = nr(n['nummer'])
            if isinstance(n.get('start'), dict): n['start'] = dict(n['start'], c=n['start']['c'] - c0)
            if isinstance(n.get('probe'), dict):
                pr = dict(n['probe'])
                if pr.get('start'): pr['start'] = [pr['start'][0] - c0] + pr['start'][1:]
                if pr.get('links'): pr['links'] = [nr(l) for l in pr['links']]
                n['probe'] = pr
            if 'schritte' in n: n['schritte'] = tief(n['schritte'])
            aufgaben.append(n)
        return dict(pd, level=datei, aufgaben=aufgaben, offen=[])
    return None

def level_dateien(welt_eintrag):
    """Level einer Welt aus worlds.json (alte Teile-Listen in ihre Teile aufgelöst; fest zusammengefügte Abschnitte sind ein Level)"""
    out = []
    for d in welt_eintrag['level']:
        x = lies(d)
        out += x['teile'] if ist_abschnitt(x) else [d]
    return out
