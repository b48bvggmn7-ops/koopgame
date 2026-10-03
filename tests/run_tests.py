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
import asyncio, functools, http.server, json, os, sys, tempfile, threading
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

def webserver():
    """Kleiner Webserver für den Projektordner (fetch() geht nicht bei file://)."""
    class Leise(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Leise, directory=str(ROOT)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    srv.url = f'http://127.0.0.1:{srv.server_address[1]}/'
    return srv

async def menu_texte(p):
    return await p.eval_on_selector_all('#menuItems .mItem', 'els => els.map(e => e.textContent)')

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

@test
async def editor_projekt_levels(g):
    """Editor zeigt Levels aus levels/levels.json, lädt sie und lädt das aktuelle Level als 2 Dateien herunter."""
    srv = webserver()
    try:
        p = g.p
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(300)
        await p.click('#levelsBtn'); await p.wait_for_timeout(500)
        liste = json.loads((ROOT / 'levels' / 'levels.json').read_text())
        namen = await p.eval_on_selector_all('#projectList .lvl .nm', 'els => els.map(e => e.textContent)')
        assert namen == [L['name'] for L in liste], f'Projekt-Liste falsch: {namen}'
        await p.click('#projectList .lvl:nth-child(1) button'); await p.wait_for_timeout(400)
        erwartet = json.loads((ROOT / 'levels' / 'editor-format' / liste[0]['datei']).read_text())
        assert (await p.text_content('#curName')).startswith(liste[0]['name']), 'Name nicht übernommen'
        await p.click('#levelsBtn'); await p.wait_for_timeout(300)
        dateien = []
        p.on('download', lambda d: dateien.append(d))
        await p.click('#projectBtn'); await p.wait_for_timeout(800)
        namen = sorted(d.suggested_filename for d in dateien)
        assert namen == ['level-1.editor.json', 'level-1.json'], f'Downloads: {namen}'
        inhalt = {d.suggested_filename: json.loads(Path(await d.path()).read_text()) for d in dateien}
        ed = inhalt['level-1.editor.json']
        assert ed['name'] == 'Level 1' and sorted(map(tuple, ed['tiles'])) == sorted(map(tuple, erwartet['tiles'])), 'Editor-Datei falsch'
        assert 'solids' in inhalt['level-1.json'] and len(ed['coins']) == len(erwartet['coins']), 'Spiel-Datei falsch'
    finally:
        srv.shutdown()

@test
async def menue_beim_start(g):
    """Beim Start erscheint das Hauptmenü, das Spiel steht still; Tastatur navigiert."""
    p = g.p
    assert await g.ev("document.getElementById('menu').classList.contains('show')"), 'kein Menü beim Start'
    texte = await menu_texte(p)
    assert any('Spielen' in t for t in texte) and any('Level-Editor' in t for t in texte), f'Menü: {texte}'
    x0 = await g.ev('p1.x'); await g.hold(('KeyD',), 400)
    assert abs(await g.ev('p1.x') - x0) < 0.01, 'Spiel läuft hinter dem Menü weiter'
    await p.keyboard.press('ArrowDown')
    assert 'Level-Editor' in await p.text_content('.mItem.sel'), 'Pfeil runter wählt nicht'
    await p.keyboard.press('ArrowUp'); await p.keyboard.press('Enter'); await p.wait_for_timeout(200)
    assert await p.text_content('#menuTitle') == 'Level wählen', 'Enter öffnet Levelauswahl nicht'
    h2 = await p.eval_on_selector_all('#menuItems h2', 'els => els.map(e => e.textContent)')
    assert h2 == ['Levels'], f'Gruppen: {h2} (nur „Levels“, „Meine Levels“ entfernt)'
    await p.keyboard.press('Escape'); await p.wait_for_timeout(100)
    assert await p.text_content('#menuTitle') == 'Monchichi Koop', 'Esc führt nicht zurück'

@test
async def menue_projekt_levels(g):
    """Levelauswahl zeigt nur die Projekt-Levels (levels.json), nicht die im Browser gespeicherten, und lädt sie."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'index.html'); await p.wait_for_timeout(300)
        snap = {'cols': 40, 'tiles': [[c, 17, 'ground'] for c in range(30)], 'startM': {'c': 2, 'r': 16}}
        await p.evaluate("d => localStorage.setItem('monchichi_saved_levels_v1', JSON.stringify({mein: {name: 'Mein Test', updatedAt: 1, data: d}}))", snap)
        await p.keyboard.press('Enter'); await p.wait_for_timeout(500)
        liste = json.loads((ROOT / 'levels' / 'levels.json').read_text())
        texte = await menu_texte(p)
        assert texte[:len(liste)] == [L['name'] for L in liste], f'Projekt-Levels fehlen: {texte}'
        assert 'Mein Test' not in texte and len(texte) == len(liste) + 1, f'Browser-Levels sollen fehlen: {texte}'
        assert liste[0]['name'] in await p.text_content('.mItem.sel'), 'erstes Level nicht gewählt'
        await p.keyboard.press('Enter'); await p.wait_for_timeout(500)
        spiel = json.loads((ROOT / 'levels' / liste[0]['datei']).read_text())
        assert not await g.ev("document.getElementById('menu').classList.contains('show')"), 'Menü bleibt offen'
        assert await g.ev('coins.length') == len(spiel['coins']), 'falsches Projekt-Level geladen'
        # Pause -> zurück zum Menü -> zweites Level
        await p.keyboard.press('Escape'); await p.wait_for_timeout(100)
        assert await p.text_content('#menuTitle') == 'Pause', 'Esc öffnet keine Pause'
        await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter')
        assert await p.text_content('#menuTitle') == 'Monchichi Koop', 'Zurück zum Menü geht nicht'
        if len(liste) > 1:
            await p.keyboard.press('Enter'); await p.wait_for_timeout(500)
            await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.wait_for_timeout(500)
            spiel2 = json.loads((ROOT / 'levels' / liste[1]['datei']).read_text())
            assert await g.ev('coins.length') == len(spiel2['coins']), 'zweites Level nicht geladen'
    finally:
        srv.shutdown()

@test
async def pause_tastatur(g):
    """Esc öffnet die Pause (Spiel steht), Esc nochmal spielt weiter; Tasten springen danach nicht los."""
    await g.load(level([ground(0, 680, 2000)], {'x': 200, 'y': 680}, {'x': 100, 'y': 680}))
    p = g.p
    await p.keyboard.press('Escape'); await p.wait_for_timeout(100)
    assert await p.text_content('#menuTitle') == 'Pause', 'keine Pause'
    x0 = await g.ev('p1.x'); await g.hold(('KeyD',), 300)
    assert abs(await g.ev('p1.x') - x0) < 0.01, 'Spiel läuft in der Pause weiter'
    await p.keyboard.press('Space'); await p.wait_for_timeout(200)   # „Weiterspielen“
    assert not await g.ev("document.getElementById('menu').classList.contains('show')"), 'Weiterspielen geht nicht'
    assert await g.ev('p1.vy') == 0, 'Auswahl-Taste hat Sprung ausgelöst'
    await g.hold(('KeyD',), 300)
    assert await g.ev('p1.x') > x0 + 20, 'nach der Pause keine Steuerung'

@test
async def pause_controller(g):
    """Options öffnet/schließt die Pause; Steuerkreuz + ✕ wählen „Zurück zum Menü“."""
    await g.p.add_init_script(PAD_STUB); await g.p.reload(); await g.p.wait_for_timeout(500)
    await g.load(level([ground(0, 680, 2000)], {'x': 200, 'y': 680}, {'x': 100, 'y': 680}))
    async def tippe(n):
        await g.ev(f"window.__pad.buttons[{n}]={{pressed:true,value:1}}"); await g.p.wait_for_timeout(80)
        await g.ev(f"window.__pad.buttons[{n}]={{pressed:false,value:0}}"); await g.p.wait_for_timeout(80)
    await tippe(9)
    assert await g.p.text_content('#menuTitle') == 'Pause', 'Options öffnet keine Pause'
    await tippe(9)
    assert not await g.ev("document.getElementById('menu').classList.contains('show')"), 'Options schließt Pause nicht'
    await tippe(9); await tippe(13); await tippe(13); await tippe(0)
    assert await g.p.text_content('#menuTitle') == 'Monchichi Koop', 'Controller-Auswahl geht nicht'
    await tippe(0); await g.p.wait_for_timeout(200)
    assert await g.p.text_content('#menuTitle') == 'Level wählen', '✕ öffnet Levelauswahl nicht'
    await tippe(1)
    assert await g.p.text_content('#menuTitle') == 'Monchichi Koop', '○ führt nicht zurück'

@test
async def menue_knopf_und_editor_schliessen(g):
    """Knopf „☰ Menü“ im Spiel öffnet die Pause; ✕ oben rechts im Editor führt zurück zum Spiel-Menü."""
    await g.load(level([ground(0, 680, 2000)], {'x': 200, 'y': 680}, {'x': 100, 'y': 680}))
    p = g.p
    await p.click('#menuBtn'); await p.wait_for_timeout(100)
    assert await p.text_content('#menuTitle') == 'Pause', 'Menü-Knopf öffnet keine Pause'
    srv = webserver()
    try:
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(300)
        box = await p.locator('#closeEditorBtn').bounding_box()
        assert box and box['x'] > 1200 and box['y'] < 120, f'✕ nicht oben rechts: {box}'
        await p.click('#closeEditorBtn'); await p.wait_for_timeout(500)
        assert p.url.endswith('/index.html') and '/editor/' not in p.url, f'nicht zurück im Spiel: {p.url}'
        assert await p.text_content('#menuTitle') == 'Monchichi Koop', 'Hauptmenü fehlt'
    finally:
        srv.shutdown()

@test
async def projekt_levels_beide_formate_gleich(g):
    """Jedes Level in levels.json: Spiel-Format und Editor-Format beschreiben dasselbe Level."""
    def zellen(solids):
        out = set()
        for s in solids:
            for x in range(s['x'], s['x'] + s['w'], 40):
                for y in range(s['y'], s['y'] + s['h'], 40): out.add((x, y, s.get('look') or s.get('type')))
        return out
    for L in json.loads((ROOT / 'levels' / 'levels.json').read_text()):
        spiel = json.loads((ROOT / 'levels' / L['datei']).read_text())
        ed = json.loads((ROOT / 'levels' / 'editor-format' / L['datei']).read_text())
        umg = await g.ev(f"convertEditorSnapshot({json.dumps(ed)})")
        assert ed.get('name') == L['name'], f"{L['datei']}: Name {ed.get('name')} statt {L['name']}"
        assert zellen(umg['solids']) == zellen(spiel['solids']), f"{L['datei']}: Boden/Wände verschieden"
        assert zellen(umg['movingPlatforms']) == zellen(spiel['movingPlatforms']), f"{L['datei']}: bewegte Teile verschieden"
        for k in ('startM', 'startF', 'goal'):
            assert umg[k] == spiel[k], f"{L['datei']}: {k} verschieden"
        for k in ('coins', 'hooks', 'checkpoints', 'spikes', 'switches', 'doors'):
            a = sorted(json.dumps(o, sort_keys=True) for o in umg[k])
            b = sorted(json.dumps(o, sort_keys=True) for o in spiel[k])
            assert a == b, f"{L['datei']}: {k} verschieden"

@test
async def haken_schwung_holen(g):
    """Am Haken: Taste halten drückt NICHT sofort weit zur Seite; im Takt schaukeln baut Schwung auf."""
    await g.load(level([ground(0, 680, 3000)], {'x': 100, 'y': 680}, {'x': 60, 'y': 680},
                       hooks=[{'x': 1000, 'y': 250, 'radius': 260}]))
    setup = """(()=>{ const h=hooks[0]; p1.x=h.x; p1.y=h.y+150+p1.h*0.6; p1.vx=0; p1.vy=0; p1.grounded=false;
      p1.hookAttached=true; p1.ropeWasAirborne=true; p1.anchor=h; p1.ropeLen=150; p1.ropeMax=200; window.__ang=[];
      if(!window.__os){ window.__os=stepSim; stepSim=function(ts){
        if(window.__pump){ KEYS.KeyD = p1.vx>=0; KEYS.KeyA = p1.vx<0; }
        __os(ts); if(p1.hookAttached) __ang.push(Math.atan2(p1.x-hooks[0].x,(p1.y-p1.h*0.6)-hooks[0].y)*180/Math.PI); }; } })()"""
    await g.ev(setup); await g.hold(('KeyD',), 500)
    ang = await g.ev('__ang')
    assert ang and max(ang) < 32, f'rechts halten schwingt zu weit: {max(ang or [0]):.0f}°'
    await g.ev(setup); await g.ev('window.__pump=true'); await g.p.wait_for_timeout(3000)
    await g.ev('window.__pump=false; KEYS.KeyD=false; KEYS.KeyA=false')
    ang = await g.ev('__ang')
    assert ang and max(abs(a) for a in ang) > 55, f'Schaukeln baut zu wenig Schwung auf: {max(abs(a) for a in ang or [0]):.0f}°'

@test
async def deko_vogel_flattert_weg(g):
    """Vögel sitzen auf dem Boden und flattern weg, wenn eine Figur kommt (reine Deko, keine Kollision)."""
    await g.load(level([ground(0, 680, 3000)], {'x': 100, 'y': 680}, {'x': 60, 'y': 680}))
    await g.p.wait_for_timeout(200)
    n = await g.ev('birds.length')
    assert n >= 2, f'zu wenige Vögel: {n}'
    b0 = await g.ev("(()=>{ const b=birds.find(b=>b.state==='sit'); return b && {x:b.x, y:b.y}; })()")
    assert b0 and b0['y'] == 680, f'Vogel sitzt nicht auf dem Boden: {b0}'
    await g.ev(f"p1.x={b0['x']} - 60; p1.vx=0")
    await g.p.wait_for_timeout(500)
    b1 = await g.ev(f"(()=>{{ const b=birds.find(b=>b.homeX==={b0['x']}); return {{state:b.state, y:b.y}}; }})()")
    assert b1['state'] in ('fly', 'gone') and b1['y'] < 640, f'Vogel fliegt nicht weg: {b1}'

@test
async def deko_frei_von_spielobjekten(g):
    """Pflanzen und Vögel stehen nie auf Münzen, Stacheln, Hebeln, Checkpoints oder am Ziel."""
    await g.load(level([ground(0, 680, 3000)], {'x': 100, 'y': 680}, {'x': 60, 'y': 680},
                       coins=[{'x': x, 'y': 660} for x in range(420, 2900, 160)],
                       spikes=[{'x': 500, 'y': 680, 'w': 40, 'h': 40, 'dir': 0}, {'x': 1300, 'y': 680, 'w': 40, 'h': 40, 'dir': 0}],
                       switches=[{'x': 900, 'y': 660, 'link': 1}], checkpoints=[{'x': 1500, 'y': 680}],
                       goal={'x': 2800, 'y': 680}))
    await g.p.wait_for_timeout(200)
    bad = await g.ev("""(()=>{ const pts=[...coins.map(c=>c.x), ...spikes.map(s=>s.x), ...switchDefs.map(s=>s.x), ...checkpointDefs.map(c=>c.x), goal.x];
      const deko=[...decoPlants.map(p=>p.x), ...birds.map(b=>b.homeX)];
      return deko.filter(x=>pts.some(px=>Math.abs(px-x)<24)); })()""")
    assert not bad, f'Deko auf Spielobjekten bei x={bad}'
    assert await g.ev('decoPlants.length') > 0, 'gar keine Pflanzen'

@test
async def muenzen_groesser_3d(g):
    """Münzen werden größer gezeichnet (Radius > 11) und haben in Seitenansicht eine sichtbare Kante."""
    res = await g.ev("""(()=>{ const cv = document.createElement('canvas'); cv.width = cv.height = 200;
      const c = cv.getContext('2d'), a = (x,y)=>c.getImageData(x,y,1,1).data[3];
      drawCoin3D(100, 100, COIN_DRAW_R, 0, COIN_PAL.gold, 1, false, c);
      const face = [a(100,100+COIN_DRAW_R-1), a(100,100-COIN_DRAW_R+1), a(100+11.5,100)];
      c.clearRect(0,0,200,200);
      drawCoin3D(100, 100, COIN_DRAW_R, Math.PI/2 - 0.05, COIN_PAL.gold, 1, false, c);
      let w = 0; for(let x=80;x<120;x++) if(a(x,100)>200) w++;
      return {r: COIN_DRAW_R, face, w}; })()""")
    assert res['r'] > 11 and all(v > 0 for v in res['face']), f'Münze nicht größer: {res}'
    assert res['w'] >= 3, f'keine sichtbare Kante in Seitenansicht: {res}'

@test
async def broeckelboden_animation(g):
    """Bröckelboden hält weiter 0,6 s, zerspringt dann in viele Brocken mit Staub; danach ist alles weg."""
    await g.load(level([ground(0, 680, 300), ground(400, 600, 160, 40, 'crumble'), ground(400, 680, 600)],
                       {'x': 480, 'y': 600}, {'x': 60, 'y': 680}))
    await g.ev("solids.find(s=>s.type==='crumble').triggered=false")
    await g.ev("(()=>{ const s=solids.find(s=>s.type==='crumble'); s.triggered=true; s.timer=0; })()")
    await g.p.wait_for_timeout(420)
    st = await g.ev("(()=>{ const s=solids.find(s=>s.type==='crumble'); return {gone:s.gone, t:s.timer}; })()")
    assert not st['gone'], f'bricht zu früh: {st}'
    await g.p.wait_for_timeout(450)
    st = await g.ev("(()=>{ const s=solids.find(s=>s.type==='crumble'); return {gone:s.gone, n:(s.fragments||[]).length, d:(s.dust||[]).length, poly:!!(s.fragments&&s.fragments[0].pts)}; })()")
    assert st['gone'] and st['n'] >= 12 and st['d'] > 0 and st['poly'], f'kein Zerspringen: {st}'
    await g.p.wait_for_timeout(1000)
    assert await g.ev("solids.find(s=>s.type==='crumble').fragments === null"), 'Brocken verschwinden nicht'

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
