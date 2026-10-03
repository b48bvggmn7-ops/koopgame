"""
Automatische Tests für "Monchichi Koop".

Startet das Spiel in einem unsichtbaren Browser (Chromium über Playwright), spielt wichtige Abläufe
durch und prüft das Ergebnis. Vor jeder Änderung am Spiel laufen lassen – und danach nochmal.

Einrichtung (einmalig):
    pip install playwright
    playwright install chromium

Ausführen (im Projektordner):
    python tests/run_tests.py            # alle Tests
    python tests/run_tests.py decke      # nur Tests, deren Name "decke" enthält

Die Spiel-Dateien sind klassische <script>-Dateien mit gemeinsamem Gültigkeitsbereich. Deshalb können
die Tests Spielzustände direkt lesen (z. B. p1.x, solids, coins) – im Spiel selbst ist dafür nichts nötig.
"""
import asyncio, json, os, sys, tempfile
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
GAME = (ROOT / 'index.html').as_uri()
TMP = Path(tempfile.mkdtemp())

def level(solids, start_m, start_f, **extra):
    d = {'solids': solids, 'hooks': [], 'switches': [], 'doors': [], 'spikes': [], 'coins': [],
         'movingPlatforms': [], 'checkpoints': [], 'startM': start_m, 'startF': start_f,
         'goal': {'x': 4000, 'y': 680}}
    d.update(extra)
    p = TMP / f'lvl_{abs(hash(json.dumps(d, sort_keys=True)))}.json'
    p.write_text(json.dumps(d))
    return str(p)

def ground(x, y, w, h=40, t='ground'):
    return {'x': x, 'y': y, 'w': w, 'h': h, 'type': t}

PAD_STUB = """window.__pad = {axes:[0,0,0,0], buttons: Array.from({length:17},()=>({pressed:false,value:0})), mapping:'standard'};
navigator.getGamepads = () => [window.__pad, null, null, null];"""

class Game:
    def __init__(self, page): self.p = page
    async def load(self, path):
        await self.p.set_input_files('#loadLevelInput', path)
        await self.p.wait_for_timeout(250)
        await self.p.keyboard.press('KeyR'); await self.p.wait_for_timeout(120)
    async def ev(self, js): return await self.p.evaluate(js)
    async def hold(self, keys, ms):
        for k in keys: await self.p.keyboard.down(k)
        await self.p.wait_for_timeout(ms)
        for k in keys: await self.p.keyboard.up(k)
    async def start_trace(self):
        await self.ev("""window.__trace=[]; if(!window.__origStep){ window.__origStep=stepSim;
          stepSim=function(ts){ __trace.push([p1.x,p1.y,p2.x,p2.y]); return __origStep(ts); }; }""")
    async def trace(self): return await self.ev('window.__trace')

TESTS = []
def test(fn): TESTS.append(fn); return fn

# ---------------------------------------------------------------- Tests

@test
async def start_ohne_fehler(g):
    """Spiel startet, Figuren existieren, Spielschleife läuft."""
    await g.p.wait_for_timeout(600)
    ok = await g.ev("typeof p1==='object' && typeof p2==='object' && solids.length>0")
    assert ok, 'Spielzustand fehlt'
    t0 = await g.ev('performance.now()'); n0 = await g.ev('perf.n')
    await g.p.wait_for_timeout(400)
    assert await g.ev('typeof frameDt==="number"'), 'Spielschleife läuft nicht'

@test
async def decke_kein_teleport(g):
    """Springen unter Decken aller Höhen (links/rechts, beide Figuren): niemand springt quer >15 px."""
    bad = []
    for corridor in (40, 80, 120):
        for ceil in range(80, 640, 40):
            floor = ceil + corridor
            if floor > 680: continue
            await g.load(level([ground(0, floor, 1400), ground(200, ceil-40, 800)],
                               {'x': 560, 'y': floor}, {'x': 640, 'y': floor}))
            await g.start_trace()
            for keys in (('KeyA', 'ArrowLeft'), ('KeyD', 'ArrowRight')):
                for k in keys: await g.p.keyboard.down(k)
                await g.p.wait_for_timeout(80)
                await g.hold(('Space', 'Numpad0'), 260)
                await g.p.wait_for_timeout(300)
                for k in keys: await g.p.keyboard.up(k)
            tr = await g.trace()
            for i in range(1, len(tr)):
                for who, ix in (('Affe', 0), ('Schwein', 2)):
                    if abs(tr[i][ix]-tr[i-1][ix]) > 15 or abs(tr[i][ix+1]-tr[i-1][ix+1]) > 15:
                        bad.append((ceil, corridor, who)); break
    assert not bad, f'Teleport bei (Decke, Ganghöhe, Figur): {bad[:5]}'

@test
async def seil_vom_boden_hochziehen(g):
    """Vom Boden einhaken bleibt dran; W zieht hoch."""
    await g.load(level([ground(0, 680, 1400)], {'x': 300, 'y': 680}, {'x': 100, 'y': 680},
                       hooks=[{'x': 300, 'y': 420, 'radius': 300}]))
    await g.p.keyboard.press('KeyG'); await g.p.wait_for_timeout(100)
    assert await g.ev('p1.hookAttached'), 'Seil löst sich sofort'
    y0 = await g.ev('p1.y'); await g.hold(('KeyW',), 700)
    assert await g.ev('p1.hookAttached') and await g.ev('p1.y') < y0 - 60, 'W zieht nicht hoch'

@test
async def seil_runterlassen_bis_ring(g):
    """Mit S bis an den Rand des Reichweiten-Rings runterlassen; oben kein Hüpfer."""
    await g.load(level([ground(0, 400, 260), ground(700, 680, 700)], {'x': 230, 'y': 400}, {'x': 100, 'y': 400},
                       hooks=[{'x': 330, 'y': 230, 'radius': 300}]))
    await g.p.keyboard.press('KeyG'); await g.p.wait_for_timeout(100)
    await g.hold(('KeyD',), 500); await g.p.wait_for_timeout(1200)
    await g.hold(('KeyS',), 2500); await g.p.wait_for_timeout(800)
    assert round(await g.ev('p1.ropeLen')) == 300, 'nicht bis zum Ring runtergelassen'
    await g.hold(('KeyW',), 3000); await g.p.wait_for_timeout(300)
    y1 = await g.ev('p1.y'); await g.p.wait_for_timeout(500); y2 = await g.ev('p1.y')
    assert abs(y2 - y1) < 3, f'hüpft oben ({y1} -> {y2})'

@test
async def seil_loest_beim_landen(g):
    await g.load(level([ground(0, 680, 1400)], {'x': 200, 'y': 680}, {'x': 60, 'y': 680},
                       hooks=[{'x': 300, 'y': 590, 'radius': 300}]))
    await g.p.keyboard.press('Space'); await g.p.wait_for_timeout(150)
    await g.p.keyboard.press('KeyG'); await g.p.wait_for_timeout(50)
    await g.hold(('KeyD',), 1200); await g.p.wait_for_timeout(300)
    assert not await g.ev('p1.hookAttached'), 'Seil bleibt nach dem Landen dran'

@test
async def muenzen_nach_farbe(g):
    coins = [{'x': 300, 'y': 660, 'color': 'blue'}, {'x': 360, 'y': 660, 'color': 'pink'},
             {'x': 420, 'y': 660, 'color': 'gold'}, {'x': 480, 'y': 660, 'color': 'blue'},
             {'x': 540, 'y': 660, 'color': 'pink'}]
    await g.load(level([ground(0, 680, 1400)], {'x': 140, 'y': 680}, {'x': 100, 'y': 680}, coins=coins))
    await g.hold(('KeyD',), 1100); await g.p.wait_for_timeout(500)
    taken = await g.ev("coins.map(c=>c.taken)")
    assert taken == [True, False, True, True, False], f'Affe: {taken}'
    await g.hold(('ArrowRight',), 1100); await g.p.wait_for_timeout(500)
    assert await g.ev("coins.every(c=>c.taken)"), 'Schweinchen sammelt pink nicht'

@test
async def checkpoint_sprung_und_tod(g):
    cps = [{'x': 600, 'y': 680}, {'x': 1200, 'y': 680}]
    await g.load(level([ground(0, 680, 2400)], {'x': 100, 'y': 680}, {'x': 60, 'y': 680},
                       checkpoints=cps, spikes=[{'x': 1500, 'y': 680, 'w': 40, 'h': 40}]))
    await g.p.keyboard.press('KeyC'); await g.p.keyboard.press('KeyC'); await g.p.wait_for_timeout(200)
    assert await g.ev('activeCp') == 1 and abs(await g.ev('p1.x') - 1182) < 40, 'Checkpoint-Sprung'
    await g.hold(('KeyD',), 1500); await g.p.wait_for_timeout(300)
    assert await g.ev('!!deathState'), 'Stacheln töten nicht'
    await g.p.wait_for_timeout(500); await g.p.keyboard.press('KeyK'); await g.p.wait_for_timeout(200)
    assert not await g.ev('!!deathState') and abs(await g.ev('p1.x') - 1182) < 40, 'Neustart nicht am Checkpoint'

@test
async def schalter_umschalten(g):
    await g.load(level([ground(0, 680, 1400)], {'x': 200, 'y': 680}, {'x': 60, 'y': 680},
                       switches=[{'x': 260, 'y': 660, 'link': 1}], doors=[{'x': 720, 'y': 660, 'link': 1}]))
    await g.hold(('KeyD',), 200); await g.p.wait_for_timeout(300)
    await g.p.keyboard.press('KeyJ'); await g.p.wait_for_timeout(150)
    assert await g.ev("solids.find(s=>s.type==='door').open"), 'Tür geht nicht auf'

@test
async def bildrate_unabhaengig(g):
    """Gleiche Eingabe -> gleiche Position bei 60 und 144 Bildern pro Sekunde."""
    lvl = level([ground(0, 680, 3000)], {'x': 140, 'y': 680}, {'x': 100, 'y': 680})
    await g.load(lvl); await g.hold(('KeyD',), 1000); await g.p.wait_for_timeout(500)
    x60 = await g.ev('p1.x')
    p2 = await g.p.context.new_page()
    await p2.add_init_script("window.requestAnimationFrame = cb => setTimeout(()=>cb(performance.now()), 1000/144);")
    await p2.goto(GAME); await p2.wait_for_timeout(500)
    g2 = Game(p2); await g2.load(lvl); await g2.hold(('KeyD',), 1000); await p2.wait_for_timeout(500)
    x144 = await g2.ev('p1.x'); await p2.close()
    assert abs(x60 - x144) < 60, f'60 Hz: {x60:.0f}, 144 Hz: {x144:.0f}'

@test
async def wandsprung_controller(g):
    await g.p.add_init_script(PAD_STUB); await g.p.reload(); await g.p.wait_for_timeout(500)
    await g.load(level([ground(0, 680, 800), ground(400, 360, 40, 320, 'wall')], {'x': 100, 'y': 680}, {'x': 60, 'y': 680}))
    await g.ev("window.__pad.axes[0]=1"); await g.p.wait_for_timeout(650)
    await g.ev("window.__pad.buttons[0]={pressed:true,value:1}"); await g.p.wait_for_timeout(60)
    await g.ev("window.__pad.buttons[0]={pressed:false,value:0}"); await g.p.wait_for_timeout(200)
    await g.ev("window.__pad.axes[0]=-1; window.__pad.buttons[0]={pressed:true,value:1}")
    await g.p.wait_for_timeout(250)
    assert await g.ev('p1.vx') < 0 or await g.ev('p1.x') < 360, 'kein Wandsprung'

# ---------------------------------------------------------------- Runner

async def main(filter_):
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
        ok = fail = 0
        for fn in TESTS:
            if filter_ and filter_ not in fn.__name__: continue
            ctx = await browser.new_context(viewport={'width': 1400, 'height': 840})
            page = await ctx.new_page(); errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            await page.goto(GAME); await page.wait_for_timeout(400)
            try:
                await fn(Game(page))
                assert not errors, f'JavaScript-Fehler: {errors[:3]}'
                print(f'  ✓ {fn.__name__}'); ok += 1
            except AssertionError as e:
                print(f'  ✗ {fn.__name__}: {e}'); fail += 1
            await ctx.close()
        await browser.close()
        print(f'\n{ok} bestanden, {fail} fehlgeschlagen')
        return fail

if __name__ == '__main__':
    sys.exit(1 if asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else '')) else 0)
