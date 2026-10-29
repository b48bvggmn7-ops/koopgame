# tests/bausteine/abschnitte_zusammenfuegen.py – Nutzerwunsch: „Level 1–3 zusammen machen, genauso 4–6“ – auch im Editor EIN
# langes Level je Abschnitt. Die Teile einer Abschnitt-Datei (bisher nur beim Laden hintereinander gesetzt, js/15a) werden
# EINMAL fest zu einem Level zusammengefügt (gleiche Rechnung wie tests/abschnitt.py: Teil k rückt um die Breite der Teile
# davor, Nummern um 20·k) und in beide Formate geschrieben (Umwandlung im echten Editor, Rückweg geprüft – tests/level_import.py).
# Die Teil-Dateien wandern ins Archiv (levels/archiv/dschungel-teile/). Im Level steht unter „_teile“, wo jeder alte Teil
# liegt (für die Tests: tests/abschnitt.py teil_sicht schneidet einen Teil wieder heraus).
# Aufruf: python3 tests/bausteine/abschnitte_zusammenfuegen.py [--probe ZIELORDNER]
import asyncio, json, shutil, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / 'tests'))
import abschnitt as A
import level_import as LI

ARCHIV = 'archiv/dschungel-teile'

def zusammen(datei):
    d = A.lies(datei)
    merged = A.laden(datei)
    teile, spalte = [], 0
    for k, t in enumerate(d['teile']):
        td = A.lies(t); sp = A.teil_spalten(td)
        teile.append({'datei': t, 'von': spalte, 'breite': sp, 'nummern': k * A.NUMMERN_JE_TEIL,
                      'startM': td.get('startM'), 'startF': td.get('startF'), 'goal': td.get('goal')})
        spalte += sp
    for k in ('abschnitt', 'abschnittTeile'): merged.pop(k, None)
    merged['_teile'] = teile
    return merged

def main():
    probe = sys.argv[sys.argv.index('--probe') + 1] if '--probe' in sys.argv else None
    abschnitte = [a for a in A.abschnitte()]
    for a in abschnitte:
        spiel = zusammen(a)
        ed, fehler, rueck = asyncio.run(LI.umwandeln(spiel))
        x, y = LI.normal({k: v for k, v in spiel.items() if not k.startswith('_')}), LI.normal(rueck)
        unterschiede = [k for k in set(x) | set(y) if x.get(k) != y.get(k) and not (not x.get(k) and not y.get(k))]
        if fehler or unterschiede:
            print('NICHT verlustfrei:', a, fehler[:5], unterschiede)
            for k in unterschiede[:5]: print(' ', k, str(x.get(k))[:300], '|', str(y.get(k))[:300])
            sys.exit(1)
        rueck['_teile'] = spiel['_teile']
        defn = A.lies(a)
        ed['name'] = defn.get('titel') or a; ed['titel'] = defn.get('titel')
        if probe:
            z = Path(probe); z.mkdir(parents=True, exist_ok=True)
            (z / Path(a).name).write_text(json.dumps(rueck, indent=1, ensure_ascii=False), encoding='utf-8')
            (z / ('ed-' + Path(a).name)).write_text(json.dumps(ed), encoding='utf-8')
            print('Probe:', a, len(rueck.get('solids', [])), 'solids')
            continue
        teile = defn['teile']
        for t in teile:   # Teil-Dateien ins Archiv (beide Formate + Begleitdatei)
            for basis in ('levels', 'levels/editor-format', 'levels/partner'):
                q = ROOT / basis / t
                if q.exists():
                    ziel = ROOT / basis / ARCHIV / Path(t).name
                    ziel.parent.mkdir(parents=True, exist_ok=True)
                    subprocess.run(['git', 'mv', str(q), str(ziel)], cwd=ROOT, check=True)
        (ROOT / 'levels' / a).write_text(json.dumps(rueck, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
        (ROOT / 'levels' / 'editor-format' / a).write_text(json.dumps(ed), encoding='utf-8')
        print('zusammengefügt:', a, '<-', ', '.join(teile))

if __name__ == '__main__':
    main()
