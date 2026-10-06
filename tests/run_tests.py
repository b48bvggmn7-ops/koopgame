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
        def handle(self):
            try: super().handle()
            except (ConnectionResetError, BrokenPipeError): pass   # Browser bricht Musik-Streams ab – harmlos
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Leise, directory=str(ROOT)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    srv.url = f'http://127.0.0.1:{srv.server_address[1]}/'
    return srv

async def startmenue_bis_level(g, tasten_vorher=()):
    """Startmenü bedienen: Titel -> Menü -> Spielen -> Spielerwahl (beide bereit) -> Countdown -> Level 1."""
    p = g.p
    await p.keyboard.press('Enter'); await p.wait_for_timeout(1100)   # Titel -> Hauptmenü (kleine Animation)
    await p.keyboard.press('Enter'); await p.wait_for_timeout(700)    # Spielen -> Spielerwahl
    for k in tasten_vorher:
        await p.keyboard.press(k); await p.wait_for_timeout(350)
    await p.keyboard.press('Space'); await p.wait_for_timeout(100); await p.keyboard.press('Numpad0')
    for _ in range(120):   # Countdown und Blätter-Vorhang
        if await g.ev("menuScreen === null"): return
        await p.wait_for_timeout(100)
    raise AssertionError('Level startet nach der Spielerwahl nicht')

async def sm_screen(g):
    return await g.ev("(()=>{ const a = document.querySelector('#sm.on .screen.active'); return a ? a.id : null; })()")

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
async def fahrende_platte_kein_durchfahren(g):
    """Bewegte Platten (hoch/runter) schieben Figuren hinaus statt sie durchzulassen: wer unter einer sinkenden
    Platte springt oder steht, steckt nie darin und landet nie plötzlich obendrauf; mitfahren geht nicht durch Wände."""
    mps = [{'x': 400, 'y': 40, 'w': 120, 'h': 40, 'look': 'ground', 'group': 1, 'targetX': 400, 'targetY': 640, 'speed': 3},
           {'x': 600, 'y': 640, 'w': 120, 'h': 40, 'look': 'wall', 'group': 2, 'targetX': 600, 'targetY': 40, 'speed': 4.5},
           {'x': 900, 'y': 560, 'w': 120, 'h': 40, 'look': 'ground', 'group': 3, 'targetX': 1400, 'targetY': 560, 'speed': 3}]
    await g.load(level([ground(0, 680, 2000), ground(760, 200, 40, 480, 'wall'), ground(1200, 400, 40, 150, 'wall')],
                       {'x': 300, 'y': 680}, {'x': 100, 'y': 680}, movingPlatforms=mps))
    await g.ev("closeMenu(); deathState=null")
    bad = await g.p.evaluate("""() => {
      const bad = []; let seed = 7;
      const rnd = () => { seed = (seed*16807) % 2147483647; return seed/2147483647; };
      const plats = solids.filter(s=>s.type==='moveplat').slice(0, 2);
      const inside = () => { const b={x:p1.x-p1.w/2,y:p1.y-p1.h,w:p1.w,h:p1.h};
        return solids.some(s=>{ if(s.gone) return false;
          const ox=Math.min(b.x+b.w,s.x+s.w)-Math.max(b.x,s.x), oy=Math.min(b.y+b.h,s.y+s.h)-Math.max(b.y,s.y); return ox>1&&oy>1; }); };
      for(let run=0; run<150; run++){
        resetLevel(); menuScreen='pause'; deathState=null; for(const k in KEYS) KEYS[k]=false;
        plats.forEach(s=>s.tripActive=true);
        p2.x=100; p2.y=680; p1.x=300+rnd()*450; p1.y=680; p1.vx=0; p1.vy=0;
        const pre=Math.floor(rnd()*400); for(let i=0;i<pre;i++) updateMovingPlatforms(16.6, []);
        if(inside()) continue;
        let keys={}, ts=0;
        for(let f=0; f<300 && !deathState; f++){
          ts+=16.6; for(const k in KEYS) KEYS[k]=false;
          if(f%15===0) keys={l:rnd()<0.35, r:rnd()<0.35, j:rnd()<0.5};
          if(keys.l) KEYS[p1.keys.left]=true; if(keys.r) KEYS[p1.keys.right]=true;
          if(keys.j){ KEYS[p1.keys.jump]=true; if(f%15===0) KEYS[p1.keys.jump+'_pressed']=true; }
          const y0=p1.y; stepSim(ts);
          if(inside()) { bad.push(['steckt drin', run, f]); break; }
          if(p1.y - y0 < -22) { bad.push(['nach oben versetzt', run, f]); break; }
        }
      }
      // Mitfahren auf der waagerechten Platte gegen die Wand: Figur bleibt an der Wand stehen
      resetLevel(); menuScreen='pause'; deathState=null; for(const k in KEYS) KEYS[k]=false;
      const h = solids.filter(s=>s.type==='moveplat')[2]; h.tripActive = true;
      p1.x = h.x + 100; p1.y = h.y; p1.vx = 0; p1.vy = 0; p1.grounded = true;
      for(let f=0; f<120; f++){ stepSim(f*16.6); if(p1.x + p1.w/2 > 1200.5) { bad.push(['durch die Wand', p1.x]); break; } }
      return bad;
    }""")
    assert not bad, f'Figur fährt durch bewegte Platte / Wand: {bad[:5]}'

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
    """Beim Start erscheint das Titelbild des Startmenüs, das Spiel steht still; Taste -> Hauptmenü
    (Spielen · Optionen · Beenden, ohne Level-Editor), Tastatur navigiert, Esc führt zurück."""
    p = g.p
    assert await g.ev("menuScreen") == 'start' and await sm_screen(g) == 'sm-s-title', 'kein Titelbild beim Start'
    x0 = await g.ev('p1.x'); await g.hold(('KeyD',), 400)
    assert abs(await g.ev('p1.x') - x0) < 0.01, 'Spiel läuft hinter dem Menü weiter'
    await p.keyboard.press('KeyX'); await p.wait_for_timeout(1100)
    assert await sm_screen(g) == 'sm-s-menu', 'Taste führt nicht ins Hauptmenü'
    texte = await p.eval_on_selector_all('#sm-menu .mi', 'els => els.map(e => e.textContent)')
    assert texte == ['Spielen', 'Optionen', 'Beenden'], f'Menü: {texte}'
    await p.keyboard.press('ArrowDown'); await p.wait_for_timeout(100)
    assert await p.text_content('#sm-menu .mi.sel') == 'Optionen', 'Pfeil runter wählt nicht'
    await p.keyboard.press('Enter'); await p.wait_for_timeout(700)
    assert await sm_screen(g) == 'sm-s-options', 'Enter öffnet Optionen nicht'
    await p.keyboard.press('Escape'); await p.wait_for_timeout(700)
    assert await sm_screen(g) == 'sm-s-menu', 'Esc führt nicht zurück'

@test
async def menue_projekt_levels(g):
    """Spielen -> Spielerwahl -> Countdown startet Level 1 aus levels.json. Levelkarten: Dschungel, Baumkronen,
    Ruinen, dann „Coming soon“; versteckter alter Entwurf fehlt; Level 2 erst nach Freischalten spielbar."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'index.html'); await p.wait_for_timeout(600)
        await startmenue_bis_level(g)
        spiel = json.loads((ROOT / 'levels' / 'level-1.json').read_text())
        assert await g.ev('coins.length') == len(spiel['coins']), 'Level 1 nicht geladen'
        assert not await g.ev("document.getElementById('sm').classList.contains('on')"), 'Startmenü bleibt offen'
        # Pause -> zurück zum Menü -> Fortfahren -> Levelauswahl
        await p.keyboard.press('Escape'); await p.wait_for_timeout(100)
        assert await p.text_content('#menuTitle') == 'Pause', 'Esc öffnet keine Pause'
        await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter')
        await p.wait_for_timeout(700)
        assert await sm_screen(g) == 'sm-s-menu', 'Zurück zum Menü geht nicht'
        texte = await p.eval_on_selector_all('#sm-menu .mi', 'els => els.map(e => e.textContent)')
        assert texte == ['Spielen', 'Fortfahren', 'Optionen', 'Beenden'], f'Menü: {texte}'
        await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.wait_for_timeout(700)
        assert await sm_screen(g) == 'sm-s-levels', 'Fortfahren führt nicht direkt zur Levelauswahl'
        namen = await p.eval_on_selector_all('#sm-cards .lc .nm', 'els => els.map(e => e.textContent)')
        echte = [L['titel'] for L in json.loads((ROOT / 'levels' / 'levels.json').read_text()) if not L.get('versteckt')]
        assert echte[:4] == ['Dschungel', 'Baumkronen', 'Ruinen', 'Mondnacht'], f'Levelliste: {echte}'
        assert namen == (echte + ['Coming soon']*6)[:max(6, len(echte))], f'Karten: {namen}'
        # Level 2 gesperrt
        await p.keyboard.press('ArrowRight'); await p.wait_for_timeout(100); await p.keyboard.press('Enter'); await p.wait_for_timeout(600)
        assert await g.ev("menuScreen") == 'start', 'gesperrtes Level startet'
        # Coming soon startet nie
        await g.ev("GameMenu.unlockAll()")
        await g.ev("startMenuShow('levels')"); await p.wait_for_timeout(700)
        pos = len(echte) - 1                                     # Auswahl steht auf dem letzten echten Level
        if len(echte) < 6:
            await p.keyboard.press('ArrowRight'); await p.wait_for_timeout(100); pos += 1   # erste „Coming soon“-Karte
            await p.keyboard.press('Enter'); await p.wait_for_timeout(600)
            assert await g.ev("menuScreen") == 'start', 'Coming-soon-Level startet'
        # freigeschaltetes Level 2: erst Spielerwahl, dann startet es
        for _ in range(pos - 1): await p.keyboard.press('ArrowLeft')
        await p.wait_for_timeout(100)
        await p.keyboard.press('Enter'); await p.wait_for_timeout(700)
        assert await sm_screen(g) == 'sm-s-select', 'nach der Levelwahl keine Spielerwahl'
        await p.keyboard.press('Escape'); await p.wait_for_timeout(700)
        assert await sm_screen(g) == 'sm-s-levels', 'Zurück aus der Spielerwahl führt nicht zur Levelauswahl'
        await p.keyboard.press('Enter'); await p.wait_for_timeout(700)
        await p.keyboard.press('Space'); await p.wait_for_timeout(100); await p.keyboard.press('Numpad0')
        for _ in range(120):
            if await g.ev("menuScreen === null"): break
            await p.wait_for_timeout(100)
        spiel2 = json.loads((ROOT / 'levels' / 'level-2.json').read_text())
        assert await g.ev('coins.length') == len(spiel2['coins']), 'Level 2 nicht geladen'
    finally:
        srv.shutdown()

@test
async def startmenue_fortschritt_und_wahl(g):
    """Geschafftes Level schaltet das nächste frei (Levelauswahl mit Hinweis); Spielerwahl tauscht die Tasten:
    Spieler 1 aufs Schweinchen -> Schweinchen mit A/D/Leertaste, Affe mit Pfeilen/Num 0/Num 1."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'index.html'); await p.wait_for_timeout(600)
        await startmenue_bis_level(g, tasten_vorher=('KeyD',))       # Spieler 1 wechselt nach rechts (Schweinchen)
        k = await g.ev("({m: p1.keys, f: p2.keys})")
        assert k['f']['left'] == 'KeyA' and k['f']['jump'] == 'Space' and k['f']['glide'] == 'KeyG', f'Schweinchen-Tasten: {k}'
        assert k['m']['left'] == 'ArrowLeft' and k['m']['hook'] == 'Numpad1' and k['m']['use'] == 'Numpad2', f'Affen-Tasten: {k}'
        assert 'Spieler 2' in await p.text_content('#hudMHead'), 'Anzeige zeigt die Tauschung nicht'
        x0 = await g.ev('p2.x'); await g.hold(('KeyD',), 400)
        assert await g.ev('p2.x') > x0 + 20, 'Spieler 1 steuert das Schweinchen nicht'
        await g.ev("winFinish()"); await p.wait_for_timeout(700)
        assert await sm_screen(g) == 'sm-s-levels', 'nach dem Ziel keine Levelauswahl'
        sv = await g.ev("GameMenu.getSave()")
        assert 1 in sv['completed'] and sv['unlocked'] >= 2, f'Fortschritt nicht gemerkt: {sv}'
        assert 'freigeschaltet' in await p.text_content('#sm-toast'), 'kein Freischalt-Hinweis'
    finally:
        srv.shutdown()

@test
async def levelstart_vorhang(g):
    """Levelstart aus dem Menü: Vorhang aus einzelnen Blättern fliegt zusammen, Titeltafel „Level 1“ + Name,
    Blätter fliegen wieder weg; die Figuren stehen dabei einfach an ihren Startplätzen und sind sofort steuerbar."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'index.html'); await p.wait_for_timeout(600)
        assert await g.ev("document.querySelectorAll('#leafCurtain .leaf').length") > 100, 'zu wenige Blätter'
        await p.keyboard.press('Enter'); await p.wait_for_timeout(1100)
        await p.keyboard.press('Enter'); await p.wait_for_timeout(700)
        await p.keyboard.press('Space'); await p.wait_for_timeout(100); await p.keyboard.press('Numpad0')
        sah_titel = False
        for _ in range(200):
            if await g.ev("document.getElementById('leafCurtain').classList.contains('title')"):
                sah_titel = True
                assert await g.ev("document.querySelector('#leafCurtain .lt-n').textContent") == 'Level 1'
                st = await g.ev("({ax: p1.x, bx: p2.x, sm: levelStartM.x, sf: levelStartF.x})")
                assert abs(st['ax'] - st['sm']) < 2 and abs(st['bx'] - st['sf']) < 2, f'Figuren nicht am Start: {st}'
            if sah_titel and await g.ev("menuScreen === null"): break
            await p.wait_for_timeout(50)
        assert sah_titel, 'keine Titeltafel'
        assert await g.ev("menuScreen") is None, 'Spiel startet nach dem Vorhang nicht'
        assert await g.ev("typeof levelIntro === 'undefined'"), 'Ankunfts-Animation soll weg sein'
        x0 = await g.ev("p2.x"); await g.hold(('ArrowRight',), 400)
        assert await g.ev("p2.x") > x0 + 20, 'nach dem Vorhang nicht steuerbar'
    finally:
        srv.shutdown()

@test
async def verknuepfungen_bis_20(g):
    """Alle Projekt-Levels benutzen nur Verknüpfungen 1–20 (mehr kann der Editor nicht einstellen)."""
    for L in json.loads((ROOT / 'levels' / 'levels.json').read_text()):
        d = json.loads((ROOT / 'levels' / 'editor-format' / L['datei']).read_text())
        links = [s['link'] for s in d.get('switches', [])] + [x['link'] for x in d.get('doors', [])] + \
                [m['link'] for m in d.get('movers', []) if m.get('link')] + \
                [h['move']['link'] for h in d.get('hooks', []) if h.get('move') and h['move'].get('link')]
        assert all(1 <= n <= 20 for n in links), f"{L['datei']}: Verknüpfungen über 20: {sorted(set(n for n in links if n > 20))}"

@test
async def vollbild_esc_bleibt(g):
    """Im Vollbild wird Esc fürs Spiel gesperrt (Tastatur-Sperre), damit Esc die Pause öffnet statt das Vollbild zu verlassen."""
    await g.ev("""(()=>{ window.__lock = null;
        Object.defineProperty(navigator, 'keyboard', {configurable: true, value: {lock: k => { window.__lock = k; return Promise.resolve(); }, unlock: () => { window.__lock = 'frei'; }}});
        Object.defineProperty(document, 'fullscreenElement', {configurable: true, get: () => document.documentElement});
        document.dispatchEvent(new Event('fullscreenchange')); })()""")
    assert await g.ev("JSON.stringify(window.__lock)") == '["Escape"]', 'Esc wird im Vollbild nicht gesperrt'
    await g.ev("""(()=>{ Object.defineProperty(document, 'fullscreenElement', {configurable: true, get: () => null});
        document.dispatchEvent(new Event('fullscreenchange')); })()""")
    assert await g.ev("window.__lock") == 'frei', 'Sperre wird nach dem Vollbild nicht gelöst'

@test
async def startmenue_lautstaerke(g):
    """Optionen: Regler Gesamt/Musik/Effekte ändern die Lautstärke im Spiel und werden gemerkt."""
    p = g.p
    await p.keyboard.press('Enter'); await p.wait_for_timeout(1100)
    await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.wait_for_timeout(700)
    await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.wait_for_timeout(100)   # Musik
    await p.keyboard.press('ArrowLeft'); await p.keyboard.press('ArrowLeft'); await p.wait_for_timeout(200)
    assert abs(await g.ev("VOL.music") - 0.8) < 0.01, f"Musik-Regler wirkt nicht: {await g.ev('VOL.music')}"
    assert '0.8' in await g.ev("localStorage.getItem('monchichi_vol')"), 'Lautstärke nicht gemerkt'
    assert await g.ev("VOL.master") == 1 and await g.ev("VOL.sfx") == 1, 'andere Regler verstellt'

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
    await tippe(9); await tippe(13); await tippe(13); await tippe(0); await g.p.wait_for_timeout(400)
    assert await sm_screen(g) == 'sm-s-menu', 'Controller-Auswahl geht nicht'
    await tippe(0); await g.p.wait_for_timeout(500)
    assert await sm_screen(g) == 'sm-s-select', '✕ öffnet Spielerwahl nicht'
    await tippe(1); await g.p.wait_for_timeout(500)
    assert await sm_screen(g) == 'sm-s-menu', '○ führt nicht zurück'

@test
async def menue_knopf_und_editor_schliessen(g):
    """Spielansicht aufgeräumt: keine Knöpfe unten links, keine Steuerungs-Erklärung, keine FPS-Anzeige (F zeigt sie),
    Spielbild füllt die Breite; Esc öffnet die Pause; ✕ oben rechts im Editor führt zurück zum Spiel-Menü."""
    await g.load(level([ground(0, 680, 2000)], {'x': 200, 'y': 680}, {'x': 100, 'y': 680}))
    p = g.p
    for sel in ('#gameBtns', '#perf', '#hudMKeys', '#hudFKeys'):
        assert not await p.is_visible(sel), f'{sel} soll unsichtbar sein'
    w = await g.ev("document.getElementById('c').getBoundingClientRect().width")
    assert w > 1390, f'Spielbild füllt den Bildschirm nicht: {w}'
    await p.keyboard.press('KeyF'); await p.wait_for_timeout(100)
    assert await p.is_visible('#perf'), 'F zeigt die Leistungsanzeige nicht'
    await p.keyboard.press('KeyF')
    await p.keyboard.press('Escape'); await p.wait_for_timeout(100)
    assert await p.text_content('#menuTitle') == 'Pause', 'Esc öffnet keine Pause'
    srv = webserver()
    try:
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(300)
        box = await p.locator('#closeEditorBtn').bounding_box()
        assert box and box['x'] > 1200 and box['y'] < 120, f'✕ nicht oben rechts: {box}'
        await p.click('#closeEditorBtn'); await p.wait_for_timeout(500)
        assert p.url.endswith('/index.html') and '/editor/' not in p.url, f'nicht zurück im Spiel: {p.url}'
        for _ in range(30):
            if await sm_screen(g) == 'sm-s-title': break
            await p.wait_for_timeout(100)
        assert await sm_screen(g) == 'sm-s-title', 'Startmenü fehlt'
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
        assert umg.get('theme') == spiel.get('theme'), f"{L['datei']}: Thema verschieden"
        for k in ('coins', 'hooks', 'checkpoints', 'spikes', 'switches', 'doors'):
            a = sorted(json.dumps(o, sort_keys=True) for o in umg[k])
            b = sorted(json.dumps(o, sort_keys=True) for o in spiel[k])
            assert a == b, f"{L['datei']}: {k} verschieden"

@test
async def level1_bis_spalte_800(g):
    """Level 1 geht bis Spalte ~800; Abschnitt 3: Affe legt Hebel 4 auf der hohen Insel um,
    die Brücke trägt das Schweinchen über die Grube (beide helfen sich gegenseitig)."""
    await g.load(str(ROOT / 'levels' / 'level-1.json'))
    assert await g.ev("goal.x") >= 790 * 40, "Ziel nicht am Ende (Spalte ~800)"
    assert await g.ev("coins.length") >= 200, "zu wenige Münzen"
    # Affe steht am Hebel auf der Insel (Spalte 314), Schweinchen auf der Brücke (Spalte 302)
    await g.ev("p1.x=314*40+20; p1.y=10*40; p2.x=302*40+20; p2.y=14*40; p1.vx=p1.vy=p2.vx=p2.vy=0; deathState=null;")
    await g.p.wait_for_timeout(300)
    await g.p.keyboard.press('KeyJ')
    for _ in range(300):
        if await g.ev("p2.x") >= 319 * 40: break
        await g.p.wait_for_timeout(30)
    else:
        raise AssertionError("Brücke fährt das Schweinchen nicht rüber")
    await g.p.keyboard.down('ArrowRight'); await g.p.wait_for_timeout(1000); await g.p.keyboard.up('ArrowRight')
    st = await g.ev("({x:p2.x, y:p2.y, dead:!!deathState})")
    assert not st['dead'] and st['x'] > 323 * 40 and abs(st['y'] - 14 * 40) < 2, f"Schweinchen nicht drüben: {st}"

@test
async def level1_muenzen_und_haken(g):
    """Level 1: nur blaue/pinke Münzen, keine Münze in Boden/Wand/Tür, Haken-Radius höchstens 5 Kästchen."""
    lv = json.loads((ROOT / 'levels' / 'level-1.json').read_text())
    farben = {c['color'] for c in lv['coins']}
    assert farben <= {'blue', 'pink'}, f"andere Münzfarben: {farben}"
    feste = lv['solids'] + lv['doors'] + lv['movingPlatforms']
    for c in lv['coins']:
        for s in feste:
            w, h = s.get('w', 40), s.get('h', 40)
            x0, y0 = (s['x'], s['y']) if 'w' in s else (s['x'] - 20, s['y'] - 20)
            assert not (x0 < c['x'] < x0 + w and y0 < c['y'] < y0 + h), f"Münze im Stein: {c} in {s}"
    for hk in lv['hooks']:
        assert hk['radius'] <= 5 * 40, f"Haken zu groß: {hk}"

@test
async def level2_und_3_regeln(g):
    """Level 2 bis 6: nur blaue/pinke Münzen, keine Münze in Stein/Tür/bewegtem Teil, Haken höchstens 5 Kästchen,
    Ziel ganz rechts, Start links; ab Level 4 gleich viele blaue wie pinke Münzen und ein eigenes Thema."""
    namen = [L['datei'] for L in json.loads((ROOT / 'levels' / 'levels.json').read_text())
             if not L.get('versteckt') and L['datei'] != 'level-1.json']
    assert 'level-4.json' in namen, 'Level 4 fehlt in levels.json'
    for name in namen:
        lv = json.loads((ROOT / 'levels' / name).read_text())
        farben = {c['color'] for c in lv['coins']}
        assert farben <= {'blue', 'pink'}, f"{name}: andere Münzfarben {farben}"
        assert len(lv['coins']) >= 40, f"{name}: zu wenige Münzen"
        feste = [s for s in lv['solids'] if s.get('type') != 'fake'] + lv['doors'] + lv['movingPlatforms']
        for c in lv['coins']:
            for s in feste:
                w, h = s.get('w', 40), s.get('h', 40)
                x0, y0 = (s['x'], s['y']) if 'w' in s else (s['x'] - 20, s['y'] - 20)
                assert not (x0 < c['x'] < x0 + w and y0 < c['y'] < y0 + h), f"{name}: Münze im Stein {c}"
        for hk in lv['hooks']:
            assert hk['radius'] <= 5 * 40, f"{name}: Haken zu groß {hk}"
        assert lv['goal']['x'] > 400 * 40 and lv['startM']['x'] < 10 * 40, f"{name}: Start/Ziel falsch"
        if name not in ('level-2.json', 'level-3.json'):
            nb = sum(c['color'] == 'blue' for c in lv['coins'])
            assert nb * 2 == len(lv['coins']), f"{name}: Blau/Pink nicht ausgeglichen"
            assert lv.get('theme') in ('nacht', 'hoehle', 'vulkan'), f"{name}: Thema {lv.get('theme')}"

@test
async def level2_fahrstuhl_anhalten(g):
    """Level 2, Abschnitt 4 (Nutzer-Version): Schweinchen schaltet den Fahrstuhl (Hebel 3) an und auf Höhe des oberen
    Bodens wieder aus; der Affe läuft oben heraus (ganz oben warten Stacheln an der Decke)."""
    await g.load(str(ROOT / 'levels' / 'level-2.json'))
    await g.ev("p1.x=111*40+40; p1.y=14*40; p2.x=107*40+20; p2.y=14*40; p1.vx=p1.vy=p2.vx=p2.vy=0; deathState=null;")
    await g.p.wait_for_timeout(300)
    await g.p.keyboard.press('Numpad2')
    for _ in range(400):
        if await g.ev("p1.y") <= 8 * 40 + 1: break
        await g.p.wait_for_timeout(5)
    else:
        raise AssertionError("Fahrstuhl fährt nicht hoch")
    await g.p.keyboard.press('Numpad2'); await g.p.wait_for_timeout(300)
    y = await g.ev("p1.y"); await g.p.wait_for_timeout(300)
    assert abs(await g.ev("p1.y") - y) < 1, "Fahrstuhl hält nicht an"
    await g.p.keyboard.down('KeyD'); await g.p.wait_for_timeout(900); await g.p.keyboard.up('KeyD')
    st = await g.ev("({x:p1.x, y:p1.y, d:!!deathState})")
    assert not st['d'] and st['x'] > 114 * 40 and abs(st['y'] - 8 * 40) < 2, f"Affe nicht oben ausgestiegen: {st}"

@test
async def level3_fahrstuhl_unter_stacheln(g):
    """Level 3, Abschnitt 4: fährt der Fahrstuhl ganz hoch, sticht die Decke; hält der Affe ihn an (Hebel 4),
    steigt das Schweinchen oben aus."""
    await g.load(str(ROOT / 'levels' / 'level-3.json'))
    await g.ev("p2.x=131*40+40; p2.y=14*40; p1.x=127*40+20; p1.y=15*40; p1.vx=p1.vy=p2.vx=p2.vy=0; deathState=null;")
    await g.p.wait_for_timeout(300)
    await g.p.keyboard.press('KeyJ')
    for _ in range(300):
        if await g.ev("p2.y") <= 8 * 40 + 4: break
        await g.p.wait_for_timeout(16)
    else:
        raise AssertionError("Fahrstuhl fährt nicht hoch")
    await g.p.keyboard.press('KeyJ'); await g.p.wait_for_timeout(300)
    await g.p.keyboard.down('ArrowRight'); await g.p.keyboard.press('Numpad0'); await g.p.wait_for_timeout(900); await g.p.keyboard.up('ArrowRight')
    st = await g.ev("({x:p2.x, y:p2.y, d:!!deathState})")
    assert not st['d'] and st['x'] > 134 * 40 and abs(st['y'] - 8 * 40) < 2, f"Schweinchen nicht ausgestiegen: {st}"
    assert await g.ev("spikes.some(s => Math.abs(s.x - (131*40+20)) < 1 && s.dir === 2)"), "Stacheln an der Decke fehlen"

@test
async def nur_muenzen_klingeln(g):
    """Glocken-/Spieluhr-Klänge nur bei Münzen: Checkpoint, Entdeckung, Knospe (Blumen), Herzchen klingen nicht."""
    src = (ROOT / 'js' / '18-sound.js').read_text()
    for name in ('checkpoint', 'discover', 'bud', 'heart'):
        zeile = next(l for l in src.splitlines() if l.strip().startswith(name + ':'))
        i = src.index(zeile); block = src[i:src.index('return b; },', i)]
        for klang in ('musicbox', 'kalimba', 'glass', 'NOTE('):
            assert klang not in block, f'{name} klingelt noch ({klang})'
    assert 'glass' in src[src.index('    coin:'):src.index('return b; },', src.index('    coin:'))], 'Münze klingt nicht mehr'

@test
async def wetter_wechselt_selten(g):
    """Wetter wechselt seltener: Sonne 4–7 Minuten, Regen 45–75 s, am Anfang 2,5 Minuten Sonne."""
    assert await g.ev("WEATHER_SUN_S[0]") >= 240 and await g.ev("WEATHER_RAIN_S[1]") <= 75
    assert await g.ev("weather.phase === 'sun' && weather.len >= 150")

@test
async def stachelwand_faehrt_mit(g):
    """Stacheln, die mit dem Fuß an einem bewegten Stück kleben, fahren mit (bewegliche Stachelwand) und töten;
    in den bestehenden Levels fährt kein Stachel aus Versehen mit."""
    wall = {'x': 400, 'y': 360, 'w': 40, 'h': 320, 'type': 'moveplat', 'look': 'wall', 'group': 1,
            'targetX': 2400, 'targetY': 360, 'speed': 3}
    sp = [{'x': 460, 'y': 680 - 40*k, 'w': 40, 'h': 40, 'dir': 1} for k in range(8)]
    await g.load(level([ground(0, 680, 3000)], {'x': 900, 'y': 680}, {'x': 860, 'y': 680},
                       movingPlatforms=[wall], spikes=sp))
    assert await g.ev("spikes.every(s => s.carrier)"), 'Stacheln hängen nicht an der Wand'
    x0 = await g.ev("spikes[0].x")
    await g.p.wait_for_timeout(1200)
    assert await g.ev("spikes[0].x") > x0 + 60, 'Stacheln fahren nicht mit'
    for _ in range(60):
        if await g.ev("!!deathState"): break
        await g.p.wait_for_timeout(100)
    assert await g.ev("!!deathState"), 'fahrende Stacheln töten nicht'
    for name in [L['datei'] for L in json.loads((ROOT / 'levels' / 'levels.json').read_text()) if not L.get('versteckt')]:
        await g.load(str(ROOT / 'levels' / name))
        n = await g.ev("spikes.filter(s => s.carrier).length")
        want = json.loads((ROOT / 'levels' / name).read_text()).get('_mitfahrendeStacheln', 0)
        assert n == want, f'{name}: {n} mitfahrende Stacheln, erwartet {want}'

@test
async def ziel_tanz_dann_menue(g):
    """Beide im Ziel: Figuren tanzen (Eingaben ruhen), danach öffnet sich das Hauptmenü."""
    await g.load(level([ground(0, 680, 3000)], {'x': 300, 'y': 680}, {'x': 330, 'y': 680},
                       goal={'x': 315, 'y': 680}))
    for _ in range(40):
        if await g.ev("won"): break
        await g.p.wait_for_timeout(50)
    assert await g.ev("won"), "Sieg nicht erkannt"
    assert await g.ev("document.getElementById('toast').classList.contains('show')")
    x0 = await g.ev("p1.x")
    await g.hold(['KeyD'], 600)
    await g.p.keyboard.up('KeyD')
    assert abs(await g.ev("p1.x") - x0) < 1, "Figur läuft während des Tanzes weg"
    d = await g.ev("danceMove(p1)")
    assert d['dy'] <= 0 and abs(d['sx']) > 0.5, f"Tanz-Bewegung seltsam: {d}"
    assert await g.ev("menuScreen") is None, "Menü kommt zu früh"
    for _ in range(120):
        if await g.ev("menuScreen") == 'start': break
        await g.p.wait_for_timeout(50)
    assert await g.ev("menuScreen") == 'start', "nach dem Tanz kein Menü"
    assert await sm_screen(g) == 'sm-s-menu', "nach dem Tanz nicht im Hauptmenü"
    assert not await g.ev("document.getElementById('toast').classList.contains('show')")

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
    # sieht anders aus als normaler Boden: eigene Zeichenfunktion mit Sandstein-Farben
    assert await g.ev("typeof drawCrumbleBlocks==='function' && CRUMBLE_PAL.light!==undefined"), 'kein eigenes Bröckelboden-Aussehen'

@test
async def editor_testen_knopf(g):
    """Editor „▶ Testen“ öffnet das Spiel sofort mit dem aktuellen Editor-Level; Pause -> „Zurück zum Editor“."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(200)
        draft = {'cols': 60, 'tiles': [[c, 17, 'ground'] for c in range(40)],
                 'coins': [{'c': 10, 'r': 15, 'color': 'gold'}, {'c': 12, 'r': 15, 'color': 'blue'}, {'c': 14, 'r': 15, 'color': 'pink'}],
                 'startM': {'c': 3, 'r': 16}, 'startF': {'c': 2, 'r': 16}, 'goal': {'c': 35, 'r': 16},
                 'hooks': [], 'switches': [], 'doors': [], 'spikes': [], 'checkpoints': [], 'movers': []}
        await p.evaluate("d => localStorage.setItem('monchichi_level_editor_v2', JSON.stringify(d))", draft)
        await p.reload(); await p.wait_for_timeout(300)
        # Enter im Namensfeld (Levels-Fenster) startet KEINEN Test
        await p.click('#levelsBtn'); await p.fill('#levelName', 'x'); await p.keyboard.press('Escape')
        await p.keyboard.press('Enter'); await p.wait_for_timeout(300)
        assert '/editor/' in p.url, 'Enter im Textfeld hat den Test gestartet'
        await p.click('#c', position={'x': 5, 'y': 5}, button='right'); await p.wait_for_timeout(100)   # Fokus weg vom Feld
        await p.evaluate("document.activeElement && document.activeElement.blur()")
        await p.keyboard.press('Enter'); await p.wait_for_timeout(800)   # Enter = Testen
        assert 'index.html?test=1' in p.url and '/editor/' not in p.url, f'Enter startet den Test nicht: {p.url}'
        assert not await g.ev("document.getElementById('menu').classList.contains('show')"), 'Menü statt Test-Level'
        assert await g.ev("coins.length===3 && coins.some(c=>c.color==='pink')"), 'Editor-Level nicht geladen'
        assert abs(await g.ev('p1.x') - 140) < 30, 'Start nicht aus dem Editor'
        # Pausenmenü bietet „Zurück zum Editor“; Esc beendet den Test direkt
        await p.evaluate("showPauseMenu()"); await p.wait_for_timeout(100)
        texte = await menu_texte(p)
        assert any('Zurück zum Editor' in t for t in texte), f'Pausenmenü: {texte}'
        await p.keyboard.press('Escape'); await p.wait_for_timeout(100)   # schließt erst die Pause
        await p.keyboard.press('Escape'); await p.wait_for_timeout(600)   # beendet den Test
        assert '/editor/' in p.url, f'Esc führt nicht zurück in den Editor: {p.url}'
        # Editor weiter rechts gescrollt -> Figuren starten dort (auf dem Boden, nicht im Loch/auf Stacheln)
        draft['cols'] = 120
        draft['tiles'] = [[c, 17, 'ground'] for c in range(120) if not 60 <= c <= 62] + [[c, 12, 'crumble'] for c in range(70, 74)]
        draft['spikes'] = [{'c': c, 'r': 16, 'dir': 0} for c in range(66, 70)]
        await p.evaluate("d => localStorage.setItem('monchichi_level_editor_v2', JSON.stringify(d))", draft)
        await p.reload(); await p.wait_for_timeout(300)
        await p.evaluate("const w=document.getElementById('canvasWrap'); w.scrollLeft = 50*40 / (document.getElementById('c').width / document.getElementById('c').getBoundingClientRect().width)")
        await p.wait_for_timeout(100)
        vis = await p.evaluate("(()=>{ const w=document.getElementById('canvasWrap'), c=document.getElementById('c'); const k=c.width/c.getBoundingClientRect().width; return [w.scrollLeft*k/40, (w.scrollLeft+w.clientWidth)*k/40]; })()")
        await p.click('#testBtn'); await p.wait_for_timeout(800)
        pos = await g.ev("({m:[p1.x,p1.y], f:[p2.x,p2.y], cam:camPos, dead:!!deathState})")
        assert vis[0]*40 <= pos['m'][0] <= vis[1]*40 and vis[0]*40 - 40 <= pos['f'][0] <= vis[1]*40 + 40, f'Start nicht im Editor-Ausschnitt {vis}: {pos}'
        assert abs(pos['m'][1] - 680) < 2 and abs(pos['f'][1] - 680) < 2 and not pos['dead'], f'nicht auf dem Boden: {pos}'
        for x in (pos['m'][0], pos['f'][0]):
            assert not (60*40 <= x < 63*40) and not (66*40 <= x < 70*40), f'Start im Loch/auf Stacheln: {x}'
        assert pos['cam'] > 1000, f'Kamera nicht an der Startstelle: {pos}'
        await g.p.wait_for_timeout(1200)
        assert not await g.ev('!!deathState'), 'Figur stirbt direkt nach dem Start'
        # weiterlaufen, dann Esc -> Editor zeigt die Stelle, wo die Figuren JETZT stehen (Nutzerwunsch)
        await g.ev("p1.x = 95*40+20; p2.x = 94*40+20; p1.y = p2.y = 680; p1.vx = p2.vx = 0")
        await p.wait_for_timeout(100)
        await p.keyboard.press('Escape'); await p.wait_for_timeout(700)
        assert '/editor/' in p.url, f'Esc führt nicht zurück: {p.url}'
        back = await p.evaluate("(()=>{ const w=document.getElementById('canvasWrap'), c=document.getElementById('c'); const k=c.width/c.getBoundingClientRect().width; return [w.scrollLeft*k/40, (w.scrollLeft+w.clientWidth)*k/40]; })()")
        assert back[0] + 1 < 94 < back[1] - 1, f'Editor zeigt nicht die Figuren (Spalte 94): Ansicht {back}'
        # nochmal Enter -> Test startet wieder bei den Figuren
        await p.keyboard.press('Enter'); await p.wait_for_timeout(800)
        x2 = await g.ev('p1.x') / 40
        assert abs(x2 - 94) < 4, f'Erneuter Test startet nicht bei den Figuren: Spalte {x2}'
        # normaler Spielstart (ohne ?test=1) zeigt weiter das Hauptmenü, kein „Zurück zum Editor“
        await p.goto(srv.url + 'index.html'); await p.wait_for_timeout(400)
        assert await sm_screen(g) == 'sm-s-title', 'Startmenü fehlt beim normalen Start'
    finally:
        srv.shutdown()

@test
async def dateien_immer_frisch(g):
    """Alle Spiel-Skripte werden mit ?v=<Zeit> geladen -> Browser nimmt nie alte Kopien aus dem Zwischenspeicher."""
    srcs = await g.ev("[...document.scripts].map(s=>s.src).filter(Boolean)")
    js = [x for x in srcs if '/js/' in x]
    assert len(js) >= 19 and all('?v=' in x for x in js), f'Skripte ohne ?v=: {[x for x in js if "?v=" not in x]}'
    html = (ROOT / 'editor' / 'index.html').read_text()
    assert "editor.js?v=" in html, 'editor.js ohne ?v='

@test
async def hebel_faehrt_mit_boden(g):
    """Ein Hebel auf bewegtem Boden fährt mit, lässt sich unterwegs betätigen und springt beim Neustart zurück."""
    mp = {'x': 400, 'y': 600, 'w': 120, 'h': 40, 'look': 'ground', 'group': 1, 'targetX': 800, 'targetY': 600, 'speed': 2}
    await g.load(level([ground(0, 680, 2000)], {'x': 100, 'y': 680}, {'x': 60, 'y': 680},
                       movingPlatforms=[mp], switches=[{'x': 460, 'y': 580, 'link': 3}, {'x': 1000, 'y': 660, 'link': 4}],
                       doors=[{'x': 1500, 'y': 660, 'link': 3}]))
    await g.ev("solids.filter(s=>s.type==='moveplat').forEach(s=>s.tripActive=true)")
    await g.p.wait_for_timeout(700)
    st = await g.ev("(()=>{ const pl=solids.find(s=>s.type==='moveplat'); const sw=switchDefs[0], fix=switchDefs[1]; return {px:pl.x, py:pl.y, sx:sw.x, sy:sw.y, fx:fix.x}; })()")
    assert st['px'] > 420, f'Boden fährt nicht: {st}'
    assert abs(st['sx'] - (st['px'] + 60)) < 0.01 and abs(st['sy'] - (st['py'] - 20)) < 0.01, f'Hebel fährt nicht mit: {st}'
    assert st['fx'] == 1000, f'Hebel auf festem Boden hat sich bewegt: {st}'
    # unterwegs betätigen: Affe neben den mitgefahrenen Hebel stellen
    await g.ev("p1.x = switchDefs[0].x - 20; p1.y = solids.find(s=>s.type==='moveplat').y; p1.vy = 0; p1.grounded = true")
    await g.p.keyboard.press('KeyJ'); await g.p.wait_for_timeout(150)
    assert await g.ev("solids.find(s=>s.type==='door').open"), 'mitgefahrener Hebel lässt sich nicht betätigen'
    await g.p.keyboard.press('KeyR'); await g.p.wait_for_timeout(100)
    st = await g.ev("(()=>{ const pl=solids.find(s=>s.type==='moveplat'); return {px:pl.x, sx:switchDefs[0].x}; })()")
    assert st['px'] < 520 and abs(st['sx'] - (st['px'] + 60)) < 0.01, f'Hebel nach Neustart nicht mit dem Boden am Start: {st}'

@test
async def editor_bewegung_nachbearbeiten(g):
    """Editor: Klick auf bewegtes Stück wählt es aus; Tempo/Schalter änderbar; Entf entfernt. Vergebene Nummern mit ✓."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(200)
        draft = {'cols': 60, 'tiles': [[c, 17, 'ground'] for c in range(40)] + [[10, 12, 'ground'], [11, 12, 'ground']],
                 'movers': [{'c': 10, 'r': 12, 'dc': 4, 'dr': 0, 'speed': 2, 'link': None}],
                 'switches': [{'c': 3, 'r': 16, 'link': 3}], 'doors': [{'c': 20, 'r': 16, 'link': 5}],
                 'hooks': [], 'spikes': [], 'coins': [], 'checkpoints': [], 'startM': {'c': 2, 'r': 16}}
        await p.evaluate("d => localStorage.setItem('monchichi_level_editor_v2', JSON.stringify(d))", draft)
        await p.reload(); await p.wait_for_timeout(300)
        opts = await p.eval_on_selector_all('#linkSelect option', 'os => os.map(o => [o.value, o.textContent])')
        o = dict(opts)
        assert '✓' in o['3'] and 'Schalter' in o['3'] and '✓' in o['5'] and 'Tür' in o['5'] and '✓' not in o['1'], f'Markierung: {opts[:6]}'
        async def click_cell(c, r):
            box = await p.locator('#c').bounding_box(); k = box['width'] / await p.evaluate("document.getElementById('c').width")
            await p.mouse.click(box['x'] + (c*40 + 20)*k, box['y'] + (r*40 + 20)*k)
        await p.click('.tool[data-tool="move"]')
        await click_cell(10, 12); await p.wait_for_timeout(100)
        assert await p.is_visible('#moveDelBtn'), 'Bewegung nicht ausgewählt'
        assert await p.input_value('#speedSelect') == '2', 'Tempo der Auswahl nicht angezeigt'
        await p.select_option('#speedSelect', '4.5'); await p.select_option('#moveSwitchSelect', '3')
        d = await p.evaluate("JSON.parse(localStorage.getItem('monchichi_level_editor_v2'))")
        assert d['movers'] and d['movers'][0]['speed'] == 4.5 and d['movers'][0]['link'] == 3, f'Änderung nicht übernommen: {d["movers"]}'
        assert d['movers'][0]['dc'] == 4, 'Ziel hat sich verändert'
        t3 = await p.evaluate("[...document.getElementById('moveSwitchSelect').options].find(o=>o.value==='3').textContent")
        assert 'Bewegung' in t3 and 'Schalter' in t3, f'per-Schalter-Liste: {t3}'
        await p.keyboard.press('Delete'); await p.wait_for_timeout(100)
        d = await p.evaluate("JSON.parse(localStorage.getItem('monchichi_level_editor_v2'))")
        assert d['movers'] == [], f'Entf entfernt die Bewegung nicht: {d["movers"]}'
        assert not await p.is_visible('#moveDelBtn'), 'Entfernen-Knopf bleibt sichtbar'
    finally:
        srv.shutdown()

@test
async def hebel_ein_aus(g):
    """Hebel schaltet ein/aus: Tür bleibt offen (kein 5-s-Zuklappen) und schließt beim 2. Mal – erst wenn frei;
    schaltergesteuerter Boden stoppt beim 2. Mal an Ort und Stelle und fährt beim 3. Mal von dort weiter."""
    mp = {'x': 600, 'y': 500, 'w': 80, 'h': 40, 'look': 'ground', 'group': 1, 'targetX': 1000, 'targetY': 500, 'speed': 3, 'switchLink': 2}
    await g.load(level([ground(0, 680, 2000)], {'x': 200, 'y': 680}, {'x': 60, 'y': 680},
                       switches=[{'x': 240, 'y': 660, 'link': 1}, {'x': 140, 'y': 660, 'link': 2}],
                       doors=[{'x': 420, 'y': 660, 'link': 1}], movingPlatforms=[mp]))
    door = "solids.find(s=>s.type==='door')"
    await g.p.keyboard.press('KeyJ'); await g.p.wait_for_timeout(150)
    assert await g.ev(door + ".open"), 'Tür geht nicht auf'
    await g.p.wait_for_timeout(5400)
    assert await g.ev(door + ".open"), 'Tür ist von allein wieder zugegangen'
    # Affe in die Tür stellen, Schweinchen betätigt den Hebel -> Tür wartet, bis der Affe raus ist
    await g.ev("p2.x = 240; p2.y = 680; p1.x = 420; p1.y = 680; p1.vx = 0")
    await g.p.wait_for_timeout(80)
    await g.p.keyboard.press('Numpad2'); await g.p.wait_for_timeout(150)
    assert await g.ev(door + ".open"), 'Tür klemmt den Affen ein'
    await g.ev("p1.x = 200"); await g.p.wait_for_timeout(150)
    assert not await g.ev(door + ".open"), 'Tür schließt beim 2. Betätigen nicht'
    # bewegter Boden über Hebel 2
    plat = "solids.find(s=>s.type==='moveplat')"
    await g.ev("p1.x = 140; p1.vx = 0"); await g.p.wait_for_timeout(80)
    await g.p.keyboard.press('KeyJ'); await g.p.wait_for_timeout(500)
    x1 = await g.ev(plat + ".x"); assert x1 > 610, f'Boden fährt nicht los: {x1}'
    await g.p.keyboard.press('KeyJ'); await g.p.wait_for_timeout(60)
    x2 = await g.ev(plat + ".x"); await g.p.wait_for_timeout(400)
    x3 = await g.ev(plat + ".x")
    assert abs(x3 - x2) < 0.01 and x3 > 610, f'Boden stoppt nicht an Ort und Stelle: {x2} -> {x3}'
    await g.p.keyboard.press('KeyJ'); await g.p.wait_for_timeout(300)
    assert await g.ev(plat + ".x") > x3 + 5, 'Boden fährt beim 3. Mal nicht weiter'

@test
async def stacheln_neues_aussehen(g):
    """Stacheln: Metall-Bild vorhanden; Berührung tötet weiterhin (Treffer-Bereich unverändert)."""
    await g.load(level([ground(0, 680, 1400)], {'x': 100, 'y': 680}, {'x': 60, 'y': 680},
                       spikes=[{'x': 300, 'y': 680, 'w': 40, 'h': 40, 'dir': 0}]))
    assert await g.ev("SPIKE_SPRITE instanceof HTMLCanvasElement && SPIKE_SPRITE.width >= 40"), 'Stachel-Bild fehlt'
    await g.hold(('KeyD',), 900)
    assert await g.ev('!!deathState'), 'Stacheln töten nicht mehr'

@test
async def geraeusche(g):
    """Springen, Landen, Haken, Bröckelboden, Tod lösen Geräusche aus; M schaltet den Ton aus/an (gemerkt)."""
    await g.load(level([ground(0, 680, 1400), ground(500, 560, 80, 40, 'crumble')], {'x': 100, 'y': 680}, {'x': 60, 'y': 680},
                       hooks=[{'x': 160, 'y': 500, 'radius': 260}]))
    await g.ev("SFX_LOG.length = 0")
    await g.p.keyboard.press('Space'); await g.p.wait_for_timeout(1200)
    log = await g.ev("SFX_LOG.slice()")
    assert 'jump' in log and 'land' in log, f'Sprung/Landung ohne Ton: {log}'
    await g.p.keyboard.press('KeyG'); await g.p.wait_for_timeout(150)
    assert 'hook' in await g.ev("SFX_LOG.slice()"), 'Haken ohne Ton'
    await g.ev("solids.find(s=>s.type==='crumble').triggered = true")
    await g.p.wait_for_timeout(900)
    log = await g.ev("SFX_LOG.slice()")
    assert 'crumblewarn' in log and 'crumble' in log, f'Bröckelboden ohne Ton: {log}'
    await g.p.keyboard.press('KeyM'); await g.p.wait_for_timeout(50)
    assert await g.ev("soundMuted && localStorage.getItem('monchichi_mute')==='1'"), 'M schaltet nicht stumm'
    await g.p.keyboard.press('Escape'); await g.p.wait_for_timeout(100)
    assert any('Ton ist aus' in t for t in await menu_texte(g.p)), 'Ton-Schalter fehlt im Pausenmenü'
    await g.p.keyboard.press('Escape'); await g.p.keyboard.press('KeyM'); await g.p.wait_for_timeout(50)
    assert not await g.ev("soundMuted"), 'M schaltet nicht wieder ein'
    assert await g.ev("!masterGain || Math.abs(masterGain.gain.value - MASTER_VOL) < 0.01"), 'Gesamtlautstärke nach Wieder-Einschalten falsch'
    assert await g.ev("MASTER_VOL < 1 && FILE_VOL.music < 0.5"), 'Gesamt-/Musiklautstärke nicht reduziert'

@test
async def wetter_regen_und_sonne(g):
    """Wetter: Regen (Tropfen-Spritzer, Hintergrund dunkler) und Sonne mit Regenbogen – ohne Einfluss aufs Spiel."""
    await g.load(level([ground(0, 680, 3000)], {'x': 100, 'y': 680}, {'x': 60, 'y': 680}))
    await g.ev("weatherForce('rain')"); await g.p.wait_for_timeout(800)
    st = await g.ev("({r: weather.rain, sp: weather.splashes.length, phase: weather.phase})")
    assert st['phase'] == 'rain' and st['r'] > 0.9 and st['sp'] > 0, f'kein Regen: {st}'
    x0 = await g.ev('p1.x'); await g.hold(('KeyD',), 500)
    assert await g.ev('p1.x') - x0 > 50, 'Figur läuft im Regen nicht normal'
    # Ablauf: nach dem Regen klart es auf und es gibt einen Regenbogen
    await g.ev("weather.t = weather.len"); await g.p.wait_for_timeout(100)
    st = await g.ev("({phase: weather.phase, bow: weather.rainbow})")
    assert st['phase'] == 'clear' and st['bow'] > 0, f'kein Aufklaren/Regenbogen: {st}'

@test
async def tiere_reagieren(g):
    """Süße Tiere: Frosch hüpft weg, Pilz federt mit Ton, Knospe geht auf, Faultier wacht auf (alles nur Deko)."""
    await g.load(level([ground(0, 680, 4000), ground(1200, 400, 200, 40)], {'x': 100, 'y': 680}, {'x': 60, 'y': 680}))
    await g.p.wait_for_timeout(200)
    # feste Testtiere einsetzen (die zufällige Verteilung hängt vom Level ab)
    await g.ev("""critters = [
      {kind:'frog', x:700, y:680, home:700, minX:300, maxX:3900, dir:1, hop:null, t:0, nextCroak:99},
      {kind:'mush', x:1000, y:680, squish:0, lastT:0, big:false},
      {kind:'bud', x:1600, y:680, open:0, target:0, col:'#ff7eb0'},
      {kind:'sloth', x:1300, y:440, awake:0, wave:0, found:false}]; critFor = solids; SFX_LOG.length = 0""")
    await g.ev("p1.x = 640; p1.vx = 0"); await g.p.wait_for_timeout(600)
    fx = await g.ev("critters[0].x")
    assert fx > 740, f'Frosch hüpft nicht weg: {fx}'
    await g.ev("p1.x = 1000"); await g.p.wait_for_timeout(150)
    assert 'mushroom' in await g.ev("SFX_LOG.slice()") and await g.ev("critters[1].squish") > 0.3, 'Pilz federt nicht'
    await g.ev("p1.x = 1300"); await g.p.wait_for_timeout(900)
    assert await g.ev("critters[3].awake") > 0.8 and 'discover' in await g.ev("SFX_LOG.slice()"), 'Faultier wacht nicht auf'
    await g.ev("p1.x = 1600"); await g.p.wait_for_timeout(800)
    assert await g.ev("critters[2].open") > 0.8, 'Knospe geht nicht auf'
    assert not await g.ev('!!deathState'), 'Deko beeinflusst das Spiel'

@test
async def figuren_leben(g):
    """Figuren: Strecken beim Absprung, Stauchen + Staub beim Landen, Herzchen wenn beide nah beieinander stehen."""
    await g.load(level([ground(0, 680, 2000)], {'x': 200, 'y': 680}, {'x': 160, 'y': 680}))
    await g.p.keyboard.down('Space'); await g.p.wait_for_timeout(60)
    st = await g.ev("({j: !!p1._jumpT, sq: charSquash(p1), dust: dustFx.length})")
    await g.p.keyboard.up('Space')
    assert st['j'] and st['sq'][1] > 1.02 and st['dust'] > 0, f'kein Strecken/Staub beim Absprung: {st}'
    await g.p.wait_for_timeout(1300)
    assert await g.ev("!!p1._landT && dustFx.length >= 0"), 'Landung nicht erkannt'
    sq = await g.ev("(()=>{ p1._landT = performance.now() - 100; p1._landV = 1; return charSquash(p1); })()")
    assert sq[1] < 0.9, f'kein Stauchen beim Landen: {sq}'
    await g.ev("p1.x = 200; p2.x = 170"); await g.p.wait_for_timeout(1600)
    for _ in range(20):
        if await g.ev("heartFx.length") > 0: break
        await g.p.wait_for_timeout(250)
    assert await g.ev("heartFx.length") > 0, 'keine Herzchen, obwohl beide beieinander stehen'

@test
async def regen_klang(g):
    """Regen-Klang: Stereo-Schleifen (Bett, Prasseln, Metall) werden im Hintergrund vorberechnet, nicht stumm, L≠R."""
    st = await g.ev("""(()=>{ const b = rainSynth(new OfflineAudioContext(2, 44100, 44100)); const out = {};
      for(const k of ['bed','patter','metal']){ const L=b[k].getChannelData(0), R=b[k].getChannelData(1); let e=0, d=0;
        for(let i=0;i<L.length;i+=7){ e+=Math.abs(L[i]); d+=Math.abs(L[i]-R[i]); } out[k]={ch:b[k].numberOfChannels, sec:b[k].duration, e, d}; }
      return out; })()""")
    for k, v in st.items():
        assert v['ch'] == 2 and v['sec'] >= 5 and v['e'] > 1 and v['d'] > 0.5, f'{k} kaputt: {v}'
    await g.p.keyboard.press('KeyF'); await g.p.keyboard.press('KeyF')   # Ton freischalten (erster Tastendruck)
    await g.ev("weatherForce('rain')"); await g.p.wait_for_timeout(2500)
    if await g.ev("audioCtx && audioCtx.state === 'running'"):
        assert await g.ev("!!rainBufs"), 'Regen-Klang wurde nicht vorberechnet'

@test
async def asmr_klangbibliothek(g):
    """Alle Geräusche: Klangbibliothek (Stereo, mehrere Varianten) wird gebaut; Abspielen klappt nach dem ersten Tastendruck."""
    st = await g.ev("""(()=>{ const out={}; const it=sfxBuild(new OfflineAudioContext(2,44100,44100), out); while(!it.next().done){}
      const names = Object.keys(out.bank); const bad = names.filter(k => !out.bank[k].length || out.bank[k][0].numberOfChannels !== 2);
      return {names, bad, steps: out.bank.step.length, ir: !!out.ir, vol: names.filter(k => !(k in SFX_VOL))}; })()""")
    need = ['step', 'land', 'jump', 'wall', 'coin', 'hookAttach', 'rope', 'umbrella', 'lever', 'doorOpen', 'doorClose',
            'crumbleWarn', 'crumbleBreak', 'death', 'checkpoint', 'mushroom', 'frog', 'discover', 'bud', 'heart', 'birdFlap', 'menuTick', 'menuOk']
    assert all(n in st['names'] for n in need) and not st['bad'] and st['steps'] >= 4 and st['ir'] and not st['vol'], f'Bibliothek: {st}'
    await g.p.keyboard.press('KeyF'); await g.p.keyboard.press('KeyF'); await g.p.wait_for_timeout(1500)
    if await g.ev("audioCtx && audioCtx.state === 'running'"):
        assert await g.ev("!!sfxBank && sfxPlay('coin', {x: p1.x})"), 'Geräusch lässt sich nicht abspielen'

@test
async def musik_und_ambiente(g):
    """Klaviermusik: Takte in F-Dur, beim Regenbogen heller (höher); Klavier/Wind/Grillen/Bach werden vorberechnet."""
    st = await g.ev("""(()=>{ const out={}; const it=musicBuild(new OfflineAudioContext(2,44100,44100), out); while(!it.next().done){}
      mus.motif = null; const normal=[], bright=[];
      for(let b=0;b<16;b++){ normal.push(...musicCompose(b,false)); }
      mus.motif = null; for(let b=0;b<16;b++){ bright.push(...musicCompose(b,true)); }
      const F = [5,7,9,10,0,2,4];
      const inKey = [...normal, ...bright].every(e => F.includes(((e.midi%12)+12)%12));
      const avg = a => a.filter(e=>e.midi>=60).reduce((s,e)=>s+e.midi,0)/Math.max(1,a.filter(e=>e.midi>=60).length);
      return {piano:Object.keys(out.piano).length, amb:!!(out.wind&&out.crickets&&out.brook), n:normal.length, inKey, up: avg(bright)-avg(normal)}; })()""")
    assert st['piano'] == 4 and st['amb'] and st['n'] > 100, f'Musik/Ambiente fehlt: {st}'
    assert st['inKey'], 'Töne außerhalb von F-Dur'
    assert st['up'] > 8, f'Regenbogen-Musik nicht heller: {st}'
    await g.p.keyboard.press('KeyF'); await g.p.keyboard.press('KeyF')
    if await g.ev("audioCtx && audioCtx.state === 'running'"):
        for _ in range(24):
            if await g.ev("mus.ready && mus.log.length > 0"): break
            await g.p.wait_for_timeout(500)
        assert await g.ev("mus.ready && mus.log.length > 0"), 'Musik spielt nicht'

@test
async def eigene_aufnahmen(g):
    """Eigene Aufnahmen: Vögel/Regen/Fluss laufen als nahtlose Schleife, Musik streamt, blendet ein,
    blendet beim Tod aus und startet nach dem Weitermachen von vorne."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'index.html'); await p.wait_for_timeout(300)
        await startmenue_bis_level(g)   # Ton freischalten + über das Startmenü ins Level
        if not await g.ev("audioCtx && audioCtx.state === 'running'"):
            return   # ohne Tonausgabe (manche Testumgebungen) nichts zu prüfen
        for _ in range(30):
            if await g.ev("fileAudio.ok.birds && fileAudio.ok.rain && fileAudio.ok.river && fileAudio.ok.music"): break
            await p.wait_for_timeout(500)
        ok = await g.ev("({...fileAudio.ok})")
        assert ok.get('birds') and ok.get('rain') and ok.get('river'), f'Schleifen nicht geladen: {ok}'
        assert ok.get('music'), f'Musik spielt nicht: {ok}'
        # nahtlose Schleife: Anfang/Ende ohne Stille
        assert await g.ev("""(()=>{ const src = audioCtx.createBuffer(2, 44100*4, 44100);
            for(let c=0;c<2;c++){ const d=src.getChannelData(c); for(let i=0;i<d.length;i++) d[i]=Math.random()*0.4-0.2; }
            const b = fileLoopBuffer(audioCtx, src, 1); const d = b.getChannelData(0);
            return Math.abs(b.length - 44100*3) < 50 && Math.abs(d[0]) < 0.25; })()"""), 'Schleife kaputt'
        await p.wait_for_timeout(3000)
        t1 = await g.ev("fileAudio.el.currentTime")
        assert t1 > 1, f'Musik läuft nicht weiter: {t1}'
        # Tod -> ausblenden; weitermachen -> von vorne
        await g.ev("die(p1)"); await p.wait_for_timeout(1500)
        assert await g.ev("fileAudio.gain.gain.value") < 0.05, 'Musik blendet beim Tod nicht aus'
        await p.keyboard.press('KeyA'); await p.wait_for_timeout(2600)
        assert await g.ev("fileAudio.el.currentTime") < 3, 'Musik startet nach dem Tod nicht von vorne'
    finally:
        srv.shutdown()

@test
async def seil_abflug_mit_schwung(g):
    """Vom Seil loslassen (Springen) mit Schwung: Affe fliegt weit weiter, auch ohne Taste (kein Abbremsen auf 7,2)."""
    await g.load(level([ground(0, 680, 4000)], {'x': 900, 'y': 680}, {'x': 860, 'y': 680}, hooks=[{'x': 1000, 'y': 250, 'radius': 260}]))
    await g.ev("""(()=>{ const h=hooks[0]; p1.x=h.x-60; p1.y=h.y+170+p1.h*0.6; p1.vx=11; p1.vy=0; p1.grounded=false;
      p1.hookAttached=true; p1.ropeWasAirborne=true; p1.anchor=h; p1.ropeLen=180; p1.ropeMax=220; })()""")
    await g.p.wait_for_timeout(50)
    await g.p.keyboard.press('Space'); await g.p.wait_for_timeout(40)
    st = await g.ev("({hook: p1.hookAttached, vx: p1.vx, x: p1.x})")
    assert not st['hook'], 'Springen löst das Seil nicht'
    await g.p.wait_for_timeout(250)
    st2 = await g.ev("({vx: p1.vx, x: p1.x, g: p1.grounded})")
    assert st2['vx'] > 8 or st2['g'], f'Schwung nach dem Loslassen weg: {st} -> {st2}'
    assert st2['x'] - st['x'] > 100, f'Affe kommt nach dem Loslassen nicht nach vorne: {st} -> {st2}'

@test
async def seil_absprung_wie_schwung(g):
    """Abspringen vom Seil: Abfluggeschwindigkeit = Schwunggeschwindigkeit (kein künstlicher Schub), Schwung bleibt erhalten."""
    for vx0 in (0, 6):
        await g.load(level([ground(0, 680, 4000)], {'x': 880, 'y': 680}, {'x': 840, 'y': 680}, hooks=[{'x': 1000, 'y': 300, 'radius': 260}]))
        await g.ev(f"""(()=>{{ const h=hooks[0]; p1.x=h.x; p1.y=h.y+180+p1.h*0.6; p1.vx={vx0}; p1.vy=0; p1.grounded=false;
          p1.hookAttached=true; p1.ropeWasAirborne=true; p1.anchor=h; p1.ropeLen=180; p1.ropeMax=220; }})()""")
        await g.ev("""window.__rv=null; window.__rv10=null; window.__rn=0; if(!window.__or){ window.__or=stepSim; stepSim=function(ts){ const was=p1.hookAttached; __or(ts);
          if(was && !p1.hookAttached && window.__rv===null){ window.__rv=p1.vx; window.__rn=0; }
          else if(window.__rv!==null && ++window.__rn===10) window.__rv10=p1.vx; }; }""")
        if vx0 == 0: await g.p.keyboard.down('KeyD')
        await g.p.keyboard.press('Space'); await g.p.wait_for_timeout(300)
        rv, vx = await g.ev("window.__rv"), await g.ev("window.__rv10")   # vx 10 Schritte nach dem Loslassen
        if vx0 == 0:
            await g.p.keyboard.up('KeyD')
            assert rv is not None and abs(rv) < 2, f'künstlicher Schub beim Abspringen aus dem Stand: {rv}'
            assert vx <= 7.3, f'zu schnell ohne Schwung: {vx}'
        else:
            assert rv is not None and abs(rv - 6) < 1.2, f'Abflug passt nicht zum Schwung (6): {rv}'
            assert vx > rv*0.88, f'Schwung nach dem Loslassen weg: {rv} -> {vx}'

# ---------------------------------------------------------------- Runner

@test
async def level_themen(g):
    """Jedes Level hat sein eigenes Aussehen (Thema): Level 1 Dschungel, 2 Abendrot, 3 Ruinen; alle 6 Themen
    zeichnen fehlerfrei; Nacht/Höhle sind dunkel mit Licht um die Figuren; der Editor speichert das Thema."""
    erwartet = {'level-1.json': 'dschungel', 'level-2.json': 'abend', 'level-3.json': 'ruinen', 'level-4.json': 'nacht', 'level-5.json': 'hoehle', 'level-6.json': 'vulkan'}
    for datei, th in erwartet.items():
        d = json.loads((ROOT / 'levels' / datei).read_text())
        assert d.get('theme') == th, f'{datei}: Thema {d.get("theme")} statt {th}'
    assert await g.ev("THEME_ORDER.join(',')") == 'dschungel,abend,ruinen,nacht,hoehle,vulkan'
    await g.load(level([ground(0, 680, 3000), ground(400, 560, 200, 40, 'wall'), ground(700, 680, 120, 40, 'crumble')],
                       {'x': 300, 'y': 680}, {'x': 260, 'y': 680}, theme='nacht',
                       coins=[{'x': 500, 'y': 600, 'color': 'blue'}], switches=[{'x': 900, 'y': 660, 'link': 1}],
                       hooks=[{'x': 1000, 'y': 400, 'radius': 160}], checkpoints=[{'x': 1100, 'y': 680}]))
    await g.p.wait_for_timeout(300)   # dunkles Thema mit Münzen, Hebel, Haken: Zeichnen ohne Fehler
    assert await g.ev('themeName') == 'nacht', 'Thema aus der Level-Datei nicht übernommen'
    farben = set()
    for th in ('dschungel', 'abend', 'ruinen', 'nacht', 'hoehle', 'vulkan'):
        await g.ev(f"setTheme('{th}')"); await g.p.wait_for_timeout(350)
        # Farbe des Himmels oben links unterscheidet sich je Thema
        farben.add(await g.ev("Array.from(BG_SKY.getContext('2d').getImageData(5, 5, 1, 1).data).slice(0,3).join(',')"))
        assert await g.ev('THEME.ground.grass'), 'keine Bodenfarbe'
    assert len(farben) == 6, f'Themen sehen gleich aus: {farben}'
    # dunkles Thema: Bild um die Figur heller als weit weg
    await g.ev("setTheme('hoehle')"); await g.p.wait_for_timeout(400)
    hell = await g.ev("""(()=>{ const sx=Math.round((p1.x-camX)*zoom), sy=Math.round((p1.y-p1.h*0.5)*zoom+H*(1-zoom));
        const a = darkCtx.getImageData(sx, sy, 1, 1).data[3], b = darkCtx.getImageData(Math.min(W-2, sx+600), 60, 1, 1).data[3]; return [a, b]; })()""")
    assert hell[0] < hell[1], f'kein Licht um die Figur: {hell}'
    # ohne Thema: Dschungel
    await g.load(level([ground(0, 680, 3000)], {'x': 300, 'y': 680}, {'x': 260, 'y': 680}))
    assert await g.ev('themeName') == 'dschungel'
    # Editor: Thema wählen -> gespeichert, exportiert und im Spiel-Format
    srv = webserver()
    try:
        p = g.p
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(300)
        await p.select_option('#themeSelect', 'vulkan'); await p.wait_for_timeout(100)
        roh = await p.evaluate("JSON.parse(localStorage.getItem('monchichi_level_editor_v2')).theme")
        assert roh == 'vulkan', f'Editor speichert das Thema nicht: {roh}'
        await p.reload(); await p.wait_for_timeout(300)
        assert await p.eval_on_selector('#themeSelect', 'e => e.value') == 'vulkan', 'Thema nach Neuladen weg'
        await p.click('#exportBtn'); await p.wait_for_timeout(200)
        exp = json.loads(await p.eval_on_selector('#exportText', 'e => e.value'))
        assert exp.get('theme') == 'vulkan', 'Export ohne Thema'
    finally:
        srv.shutdown()

@test
async def neue_elemente(g):
    """Druckplatte (Tür offen nur solange jemand draufsteht), Aufwind (trägt das Schweinchen mit Schirm hoch,
    den Affen nicht), Scheinwand (durchlaufbar, sieht aus wie Wand), Sprungpilz (schleudert ~6 Kästchen hoch)."""
    lv = level([ground(0, 680, 3000)], {'x': 140, 'y': 680}, {'x': 100, 'y': 680},
               plates=[{'x': 300, 'y': 660, 'link': 3}], doors=[{'x': 620, 'y': 660, 'link': 3}, {'x': 620, 'y': 620, 'link': 3}])
    await g.load(lv)
    tuer = "solids.filter(s=>s.type==='door').every(d=>d.gone)"
    assert not await g.ev(tuer), 'Tür ist am Anfang offen'
    await g.hold(('KeyD',), 420); await g.p.wait_for_timeout(250)
    x = await g.ev('p1.x')
    assert abs(x - 300) < 40, f'Affe nicht auf der Platte: {x}'
    if abs(x - 300) >= 16: await g.ev('p1.x = 300; p1.vx = 0')
    await g.p.wait_for_timeout(200)
    assert await g.ev(tuer), 'Druckplatte öffnet die Tür nicht'
    assert await g.ev('plates[0].down'), 'Platte nicht gedrückt'
    await g.ev('p1.x = 460'); await g.p.wait_for_timeout(250)
    assert not await g.ev(tuer), 'Tür bleibt offen, obwohl niemand mehr auf der Platte steht'

    # Aufwind: Schweinchen mit Schirm steigt, Affe nicht
    lv = level([ground(0, 680, 3000)], {'x': 700, 'y': 680}, {'x': 300, 'y': 680},
               winds=[{'x': 240, 'y': 120, 'w': 120, 'h': 560}])
    await g.load(lv); await g.p.wait_for_timeout(200)
    await g.p.keyboard.down('Numpad0'); await g.p.wait_for_timeout(60); await g.p.keyboard.down('Numpad1')
    await g.p.wait_for_timeout(1400)
    y = await g.ev('p2.y')
    await g.p.keyboard.up('Numpad0'); await g.p.keyboard.up('Numpad1')
    assert y < 400, f'Aufwind trägt das Schweinchen nicht: y={y:.0f}'
    await g.ev('p1.x = 300; p1.y = 680; p2.x = 700'); await g.p.wait_for_timeout(200)
    await g.hold(('Space',), 200); await g.p.wait_for_timeout(900)
    assert await g.ev('p1.y') > 660, 'Aufwind trägt auch den Affen'

    # Scheinwand: Affe läuft hindurch
    lv = level([ground(0, 680, 3000), {'x': 400, 'y': 440, 'w': 120, 'h': 240, 'type': 'fake'}],
               {'x': 300, 'y': 680}, {'x': 100, 'y': 680})
    await g.load(lv)
    assert await g.ev('fakeWalls.length') == 1 and await g.ev("!solids.some(s=>s.type==='fake')"), 'Scheinwand nicht geladen'
    await g.hold(('KeyD',), 900)
    assert await g.ev('p1.x') > 540, f"Affe kommt nicht durch die Scheinwand: {await g.ev('p1.x')}"

    # Sprungpilz: drüberlaufen -> hoch geschleudert
    lv = level([ground(0, 680, 3000)], {'x': 300, 'y': 680}, {'x': 100, 'y': 680}, bouncers=[{'x': 380, 'y': 680}])
    await g.load(lv)
    await g.ev("window.__minY = 999; if(!window.__bo){ window.__bo = 1; const o = stepSim; stepSim = function(ts){ o(ts); window.__minY = Math.min(window.__minY, p1.y); }; }")
    await g.hold(('KeyD',), 300); await g.p.wait_for_timeout(1200)
    hoch = 680 - await g.ev('window.__minY')
    assert 200 < hoch < 280, f'Sprungpilz: {hoch:.0f} px hoch (erwartet ~230)'

@test
async def editor_neue_werkzeuge(g):
    """Editor: Scheinwand, Aufwind, Sprungpilz und Druckplatte setzen -> Export und Spiel-Umwandlung enthalten sie."""
    srv = webserver()
    try:
        p = g.p
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(300)
        snap = {'cols': 60, 'tiles': [[c, 15, 'ground'] for c in range(20)] + [[5, 14, 'fake'], [5, 13, 'fake'], [8, 10, 'wind'], [8, 11, 'wind'], [9, 10, 'wind']],
                'plates': [{'c': 3, 'r': 14, 'link': 4}], 'bouncers': [{'c': 12, 'r': 14}], 'doors': [{'c': 15, 'r': 14, 'link': 4}],
                'startM': {'c': 1, 'r': 14}, 'startF': {'c': 2, 'r': 14}}
        await p.evaluate(f"localStorage.setItem('monchichi_level_editor_v2', JSON.stringify({json.dumps(snap)}))")
        await p.reload(); await p.wait_for_timeout(300)
        for tool in ('fake', 'wind', 'bounce', 'plate'):
            assert await p.query_selector(f'.tool[data-tool="{tool}"]'), f'Werkzeug {tool} fehlt'
        await p.click('#exportBtn'); await p.wait_for_timeout(200)
        exp = json.loads(await p.eval_on_selector('#exportText', 'e => e.value'))
        assert any(s['type'] == 'fake' for s in exp['solids']), 'Scheinwand fehlt im Export'
        assert sum(w['w']*w['h'] for w in exp['winds']) == 3*1600, f"Aufwind falsch: {exp['winds']}"
        assert exp['plates'] == [{'x': 140, 'y': 580, 'link': 4}], f"Druckplatte falsch: {exp['plates']}"
        assert exp['bouncers'] == [{'x': 500, 'y': 600}], f"Sprungpilz falsch: {exp['bouncers']}"
        # gleiche Umwandlung im Spiel (Projekt-Levels im Editor-Format)
        await p.goto(srv.url + 'index.html'); await p.wait_for_timeout(500)
        umg = await p.evaluate(f"convertEditorSnapshot({json.dumps(snap)})")
        assert umg['plates'] == exp['plates'] and umg['bouncers'] == exp['bouncers'], 'Spiel wandelt anders um als der Editor'
        assert sum(w['w']*w['h'] for w in umg['winds']) == 3*1600 and any(s['type'] == 'fake' for s in umg['solids'])
    finally:
        srv.shutdown()

@test
async def kamera_ruhig_bei_zwei(g):
    """Kamera wackelt nicht: kleine Hin-und-her-Bewegungen der hinteren Figur bewegen das Bild nicht,
    gemeinsames Vorwärtslaufen schon; Bild ist 5 % herausgezoomt."""
    assert abs(await g.ev('zoom') - 0.95) < 1e-9, 'Zoom ist nicht 0,95'
    assert abs(await g.ev('VW') - 1280/0.95) < 1, 'sichtbare Weltbreite passt nicht zum Zoom'
    await g.load(level([ground(0, 680, 6000)], {'x': 600, 'y': 680}, {'x': 700, 'y': 680}))
    await g.p.wait_for_timeout(1500)
    await g.hold(('KeyA',), 700); await g.p.wait_for_timeout(1200)   # Affe ganz hinten im ruhigen Bereich
    cam0 = await g.ev('camPos')
    for _ in range(20):   # unter Last braucht die Kamera länger zum Ausrollen -> warten, bis sie steht
        await g.p.wait_for_timeout(200)
        c = await g.ev('camPos')
        if abs(c - cam0) < 0.3: break
        cam0 = c
    for _ in range(3):   # Affe (hinten) zappelt hin und her und springt
        await g.hold(('KeyD', 'Space'), 150); await g.hold(('KeyA',), 150)
    await g.p.wait_for_timeout(300)
    cam1 = await g.ev('camPos')
    assert abs(cam1 - cam0) < 3, f'Kamera wackelt mit: {cam0:.0f} -> {cam1:.0f}'
    await g.hold(('KeyD', 'ArrowRight'), 1500); await g.p.wait_for_timeout(600)
    cam2 = await g.ev('camPos')
    assert cam2 > cam1 + 200, f'Kamera folgt beim Vorwärtslaufen nicht: {cam1:.0f} -> {cam2:.0f}'
    back = await g.ev('Math.min(p1.x,p2.x) - camPos')
    front = await g.ev('Math.max(p1.x,p2.x) - camPos')
    assert back > 100 and front < await g.ev('VW') - 100, f'Figuren nicht gut im Bild: {back:.0f} / {front:.0f}'

@test
async def spieltempo_langsamer(g):
    """Spiel läuft 10 % langsamer (GAME_SPEED 0,9): in 1 s laufen ~10 % weniger Weg, Sprünge gleich weit."""
    assert abs(await g.ev('GAME_SPEED') - 0.9) < 1e-9, 'GAME_SPEED ist nicht 0,9'
    await g.load(level([ground(0, 680, 6000)], {'x': 300, 'y': 680}, {'x': 200, 'y': 680}))
    await g.p.wait_for_timeout(500)
    n0 = await g.ev('window.__steps = 0, (function(){ if(!window.__cnt){ window.__cnt = 1; const o = stepSim; stepSim = function(ts){ window.__steps++; return o(ts); }; } })(), performance.now()')
    await g.p.wait_for_timeout(2000)
    n = await g.ev('window.__steps'); dt = await g.ev('performance.now()') - n0
    rate = n / dt * 1000
    assert 48 <= rate <= 56, f'Rechenschritte pro Sekunde: {rate:.1f} (erwartet ~54)'

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
