# Umbau: Haken-Ketten ohne Test-Bot – Affe schwingt die Kette (Einstellungen werden durchprobiert), die Bahn der ersten
# geschafften Fahrt wird für das Umlegen der Münzen gespeichert (Format wie MUENZ_BAHN aus tests/run_tests.py).
# Aufruf: python3 tests/umbau/haken_ketten.py <bahnen.jsonl> [Start-Spalten,…]
import asyncio, json, os, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tests'))

# (Level, Start Affe (Spalte, Reihe), Anlauf bis Spalte, Zahl der Haken, Ziel-Spalte, Einstieg: 'sprung' | 'pilz' | 'fallen')
# 'fallen' = über Bröckelboden laufen und beim Fallen den ersten Haken greifen
KETTEN = [
    ('hoehle/01-kristallhoehle.json', (299, 14), 302, 6, 351, 'sprung'),
    ('ruinen/01-ruinen.json', (147, 14), 150, 3, 178, 'sprung'),
    ('ruinen/01-ruinen.json', (736, 6), 741, 3, 759, 'fallen'),
    ('vulkan/03-feuerberg.json', (216, 14), 219, 4, 270, 'pilz'),
]
# Münzen an den Ketten (nach dem Umlegen auf die Schwungbahn), die die Fahrten zusammen holen müssen
MUENZEN = {302: [(320, 12), (328, 11), (336, 13)], 150: [(158, 10), (161, 13), (164, 13), (167, 11), (170, 12)],
           741: [(742, 12), (745, 13), (747, 9), (748, 12), (751, 12), (755, 9)], 219: [(238, 8), (254, 6)]}
# die andere Figur wird jeden Schritt zum Affen gesetzt (sonst hält der Bildrand ihn fest)
MITNEHMEN = 'p2.x = p1.x; p2.y = p1.y; p2.vx = 0; p2.vy = 0;'

def kette(rt, anlauf, n, pull, rel, pilz):
    k = rt.k_lauf(anlauf, -6)
    if pilz == 'pilz': pl = [k, {'press': ['jump'], 'hold': ['right', 'jump'], 'frames': 4}, {'hold': ['right'], 'until': 'P.vy < -10', 'frames': 80},
                             {'hold': ['right'], 'until': 'P.vy > -3', 'frames': 80}, {'press': ['dash'], 'hold': ['right', 'swimUp'], 'frames': 3},
                             {'hold': ['right'], 'hookWhen': 'P.vy > -3', 'until': 'P.hookAttached', 'frames': 120}]   # Pilz + Dash nach oben
    elif pilz == 'fallen': pl = [rt.k_lauf(anlauf, 0), {'hookWhen': 'P.vy > 1', 'until': 'P.hookAttached', 'frames': 400}]   # stehen bleiben, bis der Bröckelboden bricht
    else: pl = [k, {'press': ['jump'], 'hold': ['right', 'jump'], 'hookWhen': 'P.vy > -3', 'until': 'P.hookAttached', 'frames': 120}]
    for _ in range(n): pl += [{'swing': True, 'pull': pull, 'release': rel, 'frames': 900},
                              {'hold': ['right'], 'hookWhen': 'P.vy > -3', 'until': 'P.hookAttached || P.grounded', 'frames': 200}]
    return pl + [{'hold': ['right'], 'until': 'P.grounded', 'frames': 300}]

async def main(ziel):
    import run_tests as rt
    from playwright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
        p = await b.new_page(viewport={'width': 1280, 'height': 720}); await p.goto(rt.GAME); await p.wait_for_timeout(400)
        g = rt.Game(p)
        for lv, (c, r), anlauf, n, ende, pilz in [k for k in KETTEN if not NUR or k[1][0] in NUR]:
            await rt.koop_level(g, lv); gut = 0
            for pull in (0, 10, 20, 40):
                for d in (20, 40, 60, 80):
                    rel = f'f > 30 && P.vy < 0 && P.x > P.anchor.x + {d}'
                    res = await rt.koop(g, m=rt.kat(c, r), f=rt.kat(c - 2, r), plans={'m': kette(rt, anlauf, n, pull, rel, pilz)},
                                        maxFrames=4000, trace=True, traceStep=2, jeBild=MITNEHMEN)
                    if res.get('done') and not res.get('dead') and res['pos']['m'][0] >= ende - 1:
                        gut += 1
                        with open(ziel, 'a', encoding='utf-8') as fh: fh.write(json.dumps({'level': lv, 'trace': res['trace']}) + '\n')
            print(lv, c, 'geschafft mit', gut, 'von 16 Einstellungen', flush=True)
        await b.close()

NUR = []
if __name__ == '__main__':
    NUR = [int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else []   # nur diese Start-Spalten
    asyncio.run(main(sys.argv[1]))
