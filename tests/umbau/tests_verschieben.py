# Umbau: nach tests/umbau/grube_weiten.py die Spaltenzahlen in den Tests nachziehen. In allen Test-Funktionen, die das Level
# laden, und in allen Listen-Einträgen (eine Zeile) mit dem Level-Namen werden Zahlen im verschobenen Bereich [a, b] um d
# verschoben – außer Bild-/Zeitangaben ('frames', maxFrames, 'pull', Wartezeiten). Ebenso stellen.py und die Ausnahme-JSONs.
# Aufruf: python3 tests/umbau/tests_verschieben.py <level> a:b:d [a:b:d ...]   (Bereiche des ALTEN Levels)
import re, sys, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
NICHT = re.compile(r"(frames'?\s*[:=]\s*|maxFrames=|'pull':\s*|frames=|range\(0,\s*|delay=|'wait':\s*f?'[^']*)$")

def neu(n, rng):
    for a, b, d in rng:
        if a <= n <= b: return n + d
    return n

def zeile_schieben(l, rng):
    out, pos = [], 0
    for m in re.finditer(r'(?<![\w.])(\d{2,3})(?![\w.])', l):
        vor = l[max(0, m.start() - 40):m.start()]
        n = int(m.group(1))
        if NICHT.search(vor) or 'ky(' in vor[-4:] or "'r'" in vor[-6:]: continue
        n2 = neu(n, rng)
        if n2 != n: out.append(l[pos:m.start()] + str(n2)); pos = m.end()
    out.append(l[pos:]); return ''.join(out)

def datei_schieben(pfad, lvl, rng, nur_zeilen=False):
    zeilen = pfad.read_text(encoding='utf-8').split('\n'); geaendert = 0
    in_fn = False
    for i, l in enumerate(zeilen):
        if l.startswith('async def ') or l.startswith('def ') or l.startswith('@test'): in_fn = False
        if not nur_zeilen and (f"koop_level(g, '{lvl}')" in l or f"'levels' / '{lvl}'" in l): in_fn = True
        if in_fn or lvl in l:
            andere = set(re.findall(r"'([a-z]+/\d\d-[a-z-]+\.json)'", l)) - {lvl}
            if lvl in l and andere: print('  VON HAND (mehrere Level in einer Zeile):', pfad.name, i + 1); continue
            n = zeile_schieben(l, rng)
            if n != l: zeilen[i] = n; geaendert += 1
    pfad.write_text('\n'.join(zeilen), encoding='utf-8'); return geaendert

def json_schieben(pfad, lvl, rng):
    d = json.loads(pfad.read_text(encoding='utf-8')); n = 0
    liste = d if isinstance(d, list) else [x for v in d.values() if isinstance(v, list) for x in v]
    for e in liste:
        if isinstance(e, dict) and e.get('level') == lvl and 'Etappe' not in str(e.get('regel')) and 'Level' not in str(e.get('regel')):
            for k in ('spalte', 'c', 'von', 'bis'):
                if isinstance(e.get(k), int) and neu(e[k], rng) != e[k]: e[k] = neu(e[k], rng); n += 1
    pfad.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding='utf-8'); return n

if __name__ == '__main__':
    lvl = sys.argv[1]; rng = [tuple(map(int, x.split(':'))) for x in sys.argv[2:]]
    print('run_tests.py', datei_schieben(ROOT / 'tests' / 'run_tests.py', lvl, rng))
    print('stellen.py', datei_schieben(ROOT / 'tests' / 'bausteine' / 'stellen.py', lvl, rng, nur_zeilen=True))
    kurz = lvl[0] + lvl.split('/')[1][:2]   # ('r04', 183) in _KURZ
    sp = ROOT / 'tests' / 'bausteine' / 'stellen.py'; t = sp.read_text(encoding='utf-8')
    t = re.sub(r"\('" + kurz + r"', (\d+)\)", lambda m: f"('{kurz}', {neu(int(m.group(1)), rng)})", t); sp.write_text(t, encoding='utf-8')
    for j in ('bildregel_ausnahmen.json', 'kombi_ausnahmen.json'):
        print(j, json_schieben(ROOT / 'tests' / j, lvl, rng))
