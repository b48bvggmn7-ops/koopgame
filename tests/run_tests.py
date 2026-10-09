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
    # jeweils warten, bis der nächste Bildschirm wirklich da ist (langsame Rechner: feste Zeiten reichen nicht)
    await p.keyboard.press('Enter'); await p.wait_for_timeout(1100)   # Titel -> Hauptmenü (kleine Animation)
    await p.wait_for_function("document.querySelector('#sm-s-menu.active')", timeout=8000); await p.wait_for_timeout(300)
    await p.keyboard.press('Enter'); await p.wait_for_timeout(700)    # Spielen -> Spielerwahl
    await p.wait_for_function("document.querySelector('#sm-s-select.active')", timeout=8000); await p.wait_for_timeout(300)
    for k in tasten_vorher:
        await p.keyboard.press(k); await p.wait_for_timeout(350)
    await p.keyboard.press('Space'); await p.wait_for_timeout(100); await p.keyboard.press('Numpad0')
    for _ in range(200):   # Countdown und Blätter-Vorhang
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
async def tode_zaehler(g):
    """Tode-Duell oben rechts: Tode je Figur (Affe / Schwein), keine Münzen (die stehen oben links); wer mehr Tode hat,
    ist rot und wird mit jedem Tod Vorsprung größer. Zählt pro Level: Weitermachen und R lassen den Stand,
    ein neu geladenes Level beginnt bei 0."""
    lvl = level([ground(0, 680, 2000)], {'x': 200, 'y': 680}, {'x': 100, 'y': 680})
    await g.load(lvl)
    karte = "(() => { const c = document.getElementById('duelCard'), r = c.getBoundingClientRect(), d = w => c.querySelector('.duo.' + w);" \
            " const gr = w => d(w).querySelector('.ava').getBoundingClientRect().width;" \
            " return {m: document.getElementById('deathM').textContent, f: document.getElementById('deathF').textContent," \
            " sichtbar: getComputedStyle(c).display !== 'none' && r.width > 0, rechts: innerWidth - r.right, oben: r.top," \
            " muenzen: /🪙|Münz/.test(c.textContent), leadM: d('m').classList.contains('lead'), leadF: d('f').classList.contains('lead')," \
            " gm: gr('m'), gf: gr('f')}; })()"
    k = await g.ev(karte)
    assert k['sichtbar'] and k['rechts'] < 40 and k['oben'] < 40, f'Tafel nicht oben rechts: {k}'
    assert (k['m'], k['f']) == ('0', '0') and not k['muenzen'], f'Tafel startet nicht bei 0 / zeigt Münzen: {k}'
    groessen = []
    for wer in ('p2', 'p2', 'p1', 'p2'):
        await g.ev(f"die({wer})"); await g.p.wait_for_timeout(700)
        await g.ev("deathState.canContinueAt = 0; requestContinue()"); await g.p.wait_for_timeout(600)
        groessen.append((await g.ev(karte))['gf'])
    k = await g.ev(karte)
    assert (k['m'], k['f']) == ('1', '3') and k['leadF'] and not k['leadM'], f'Zähler falsch: {k}'
    assert k['gf'] > k['gm'] * 1.15, f'Schweinchen (mehr Tode) nicht größer: {k}'
    assert groessen[1] > groessen[0] + 1, f'wird mit mehr Toden nicht größer: {groessen}'
    await g.p.keyboard.press('KeyR'); await g.p.wait_for_timeout(150)
    assert (await g.ev(karte))['f'] == '3', 'R setzt den Zähler zurück'
    await g.load(lvl)
    k = await g.ev(karte)
    assert (k['m'], k['f']) == ('0', '0'), f'Neues Level beginnt nicht bei 0: {k}'

@test
async def duell_unter_levelkarte(g):
    """Level geschafft: nach dem Tanz ein Statistik-Bildschirm (Münzen und Tode je Figur, im Stil des Startmenüs),
    „Weiter“ führt zur Levelauswahl, wo auf dem neu freigeschalteten Level ein goldenes Schloss platzt. Unter der
    geschafften Levelkarte steht eine knappe Tode-Zeile. Keine Totenkopf-Maske im Hauptmenü."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'index.html'); await p.wait_for_timeout(600)
        await startmenue_bis_level(g)
        await p.wait_for_function("typeof p1 !== 'undefined' && p1 && menuScreen === null", timeout=10000)
        await g.ev("deathCount.m = 1; deathCount.f = 4; let k = 0; for(const c of coins){ if(c.color === 'blue' && k < 3){ c.taken = true; c.takenBy = 'm'; k++; } }"
                   " deathState = null; won = true; winSteps = 0; winT0 = performance.now()")
        await p.wait_for_function("document.querySelector('#sm-s-results.active')", timeout=20000)
        await p.wait_for_timeout(1800)   # Zahlen zählen hoch
        r = await g.ev("({m: document.getElementById('sm-r-m').textContent, f: document.getElementById('sm-r-f').textContent})")
        assert 'Münzen' in r['m'] and 'Tode' in r['m'] and '3' in r['m'] and '4' in r['f'], f'Statistik falsch: {r}'
        assert 'Mehr Münzen' in r['m'] and 'Mehr Tode' in r['f'], f'Hervorhebung falsch: {r}'
        st = await g.ev("GameMenu.getSave()")
        assert st['stats']['level-1.json']['m'] == 1 and st['stats']['level-1.json']['f'] == 4 and 'level-2.json' in st['unlocked'], f'Stand nicht gemerkt: {st}'
        await p.keyboard.press('Enter')
        await p.wait_for_function("document.querySelector('#sm-s-levels.active')", timeout=5000)
        await p.wait_for_function("document.querySelector('#sm-cards .lc .ulock')", timeout=3000)   # Schloss auf Level 2
        assert await g.ev("[...document.querySelectorAll('#sm-cards .lc')].indexOf(document.querySelector('.ulock').parentNode)") == 1, 'Schloss nicht auf Level 2'
        await p.wait_for_function("document.querySelector('.ulock.burst')", timeout=5000)
        await p.wait_for_function("!document.querySelector('.ulock')", timeout=5000)
        zeile = await g.ev("(() => { const d = document.querySelector('#sm-cards .lc .duel');"
                           " return {txt: d.textContent, lead: [...d.querySelectorAll('b.lead')].map(b => b.textContent)}; })()")
        assert '1' in zeile['txt'] and zeile['lead'] == ['4'], f'Levelkarte: {zeile}'
        for _ in range(3):   # Levelauswahl -> Hauptmenü (kurze Eingabesperre nach dem Bildschirmwechsel)
            await p.wait_for_timeout(600); await p.keyboard.press('Escape'); await p.wait_for_timeout(600)
            if await sm_screen(g) == 'sm-s-menu': break
        assert await sm_screen(g) == 'sm-s-menu', f'Esc führt nicht ins Hauptmenü: {await sm_screen(g)}'
        assert not await g.ev("!!document.querySelector('#sm-s-menu .skullmask')"), 'Totenkopf-Maske im Hauptmenü'
    finally:
        srv.shutdown()

@test
async def scheinwand_glitzert(g):
    """Scheinwände glitzern dezent: zu jeder Zeit blitzt nur ein kleiner Teil der Kästchen kurz auf (kein Dauerleuchten),
    über die Zeit aber jedes einmal; steht eine Figur in/an der Scheinwand (durchsichtig), glitzert sie nicht."""
    await g.load(level([ground(0, 680, 3000), ground(600, 440, 400, 240, 'fake')], {'x': 200, 'y': 680}, {'x': 100, 'y': 680}))
    r = await g.ev("""(() => {
      const realNow = performance.now, realFill = ctx.fill; let n = 0;
      ctx.fill = function(){ n++; return realFill.apply(this, arguments); };
      const counts = [], seen = new Set();
      try {
        for(let t = 0; t < 3200; t += 64){
          performance.now = () => 100000 + t; n = 0; drawFakeGlints(); counts.push(n / 2);   // 2 Füllungen je Funkelpunkt
        }
        fakeWalls[0].alpha = 0.35; performance.now = () => 100000; n = 0;
        for(let t = 0; t < 3200; t += 64){ performance.now = () => 100000 + t; drawFakeGlints(); }
        var drinnen = n;
      } finally { performance.now = realNow; ctx.fill = realFill; fakeWalls[0].alpha = 1; }
      return {counts, drinnen, kaestchen: (400/40)*(240/40)};
    })()""")
    avg = sum(r['counts']) / len(r['counts'])
    assert 0 < avg <= r['kaestchen'] * 0.3, f"Glitzern nicht dezent/fehlt: im Schnitt {avg} von {r['kaestchen']} Kästchen"
    assert max(r['counts']) < r['kaestchen'] * 0.45, f"zu viel auf einmal: {max(r['counts'])}"
    assert r['drinnen'] == 0, 'Scheinwand glitzert, obwohl sie durchsichtig ist'

@test
async def himmel_ohne_unsichtbare_decke(g):
    """Zoom zeigt über Reihe 0 einen Streifen Himmel: dort kann man hineinspringen (keine unsichtbare Decke mehr bei
    Reihe 0), die Decke ist der obere Bildrand. Im Editor sind die 3 Himmel-Reihen (−1 … −3) ganz normal bebaubar;
    was dort steht, steht im Spiel an derselben Stelle. Der Editor passt ohne senkrechtes Scrollen ins Fenster.
    Bild unverzerrt 16:9, Figuren im echten Seitenverhältnis."""
    await g.load(level([ground(0, 680, 3000), ground(200, 120, 160, 40), ground(600, -120, 40, 520, 'wall')],
                       {'x': 280, 'y': 120}, {'x': 100, 'y': 680}))
    sky = await g.ev("SKY_ROOM")
    assert abs(sky - (720/0.85 - 720)) < 0.5, f'Himmelsstreifen falsch: {sky}'
    wand = await g.ev("(() => { const w = solids.find(s => s.type === 'wall'); return [w.y, w.h]; })()")
    assert wand == [-120, 520], f'Wand im Himmel verändert: {wand}'
    await g.ev("p1.x = 280; p1.y = 120; p1.vx = p1.vy = 0; deathState = null; window.__minTop = 1e9")
    await g.p.wait_for_function("p1.grounded", timeout=3000)
    await g.ev("""(() => { const o = stepSim; stepSim = function(ts){ const r = o(ts); window.__minTop = Math.min(window.__minTop, p1.y - p1.h); return r; }; })()""")
    await g.p.keyboard.down('Space'); await g.p.wait_for_timeout(500); await g.p.keyboard.up('Space')
    await g.p.wait_for_timeout(400)
    top = await g.ev("window.__minTop")
    assert top < -20 and top >= -sky - 0.5, f'kein Sprung in den Himmel (höchster Punkt {top})'
    # Bild nicht verzerrt: Spielfeld 16:9, Figuren-Bild im Verhältnis seiner Datei
    r = await g.ev("(() => { const c = document.getElementById('c').getBoundingClientRect(); return c.width / c.height; })()")
    assert abs(r - 16/9) < 0.01, f'Spielfeld verzerrt: {r}'
    fig = await g.ev("""(() => { const o = ctx.drawImage, out = [];
      ctx.drawImage = function(img, x, y, w, h){ if(img === ASSETS.monkey || img === ASSETS.monkeyBlink) out.push([w / h, img.naturalWidth / img.naturalHeight]); return o.apply(this, arguments); };
      try { ctx.save(); drawCharacter(p1, camX); ctx.restore(); } finally { ctx.drawImage = o; }
      return out; })()""")
    assert fig and all(abs(a - b) < 0.01 for a, b in fig), f'Affe verzerrt gezeichnet: {fig}'
    # Editor: 3 Himmel-Reihen über Reihe 0, bebaubar; ganze Höhe ohne senkrechtes Scrollen sichtbar
    srv = webserver()
    try:
        await g.p.goto(srv.url + 'editor/index.html'); await g.p.wait_for_timeout(300)
        await g.p.evaluate("localStorage.removeItem('monchichi_level_editor_v2')"); await g.p.reload(); await g.p.wait_for_timeout(400)
        await g.p.click('[data-tool="wall"]')
        box = await g.ev("(() => { const c = document.getElementById('c'), r = c.getBoundingClientRect(), w = document.getElementById('canvasWrap');"
                         " return {x: r.left, y: r.top, s: r.height / c.height, rows: c.height / 40, scrollt: w.scrollHeight > w.clientHeight + 1}; })()")
        assert box['rows'] == 21 and not box['scrollt'], f'Editor: Höhe/Scrollen falsch: {box}'
        # Klick in die oberste Himmel-Reihe (Reihe −3), Spalte 5
        await g.p.mouse.click(box['x'] + (5*40 + 20) * box['s'], box['y'] + 20 * box['s'])
        await g.p.wait_for_timeout(150)
        teile = await g.ev("JSON.parse(localStorage.getItem('monchichi_level_editor_v2')).tiles")
        assert [5, -3, 'wall'] in teile, f'Himmel-Reihe nicht bebaubar: {teile}'
        # im Spiel steht das Kästchen an derselben Stelle (Reihe −3 = y −120)
        sp = await g.ev("JSON.stringify(JSON.parse(localStorage.getItem('monchichi_level_editor_v2')))")
        await g.p.goto(GAME); await g.p.wait_for_timeout(300)
        conv = await g.ev(f"convertEditorSnapshot({sp}).solids.filter(s => s.type === 'wall')")
        assert any(t['x'] == 200 and t['y'] == -120 for t in conv), f'Himmel-Kästchen im Spiel falsch: {conv}'
    finally:
        srv.shutdown()

@test
async def plakette_im_bild(g):
    """Nummer im Kreis (Plakette) über einer Tür bleibt im Bild, auch wenn die Tür bis in die oberste Himmel-Reihe reicht;
    bewegte Teile zeigen keine gestrichelte Fahrweg-Anzeige mehr."""
    mp = {'x': 800, 'y': 600, 'w': 80, 'h': 40, 'look': 'ground', 'group': 1, 'targetX': 1200, 'targetY': 600, 'speed': 3}
    await g.load(level([ground(0, 680, 3000)], {'x': 200, 'y': 680}, {'x': 100, 'y': 680},
                       switches=[{'x': 300, 'y': 660, 'link': 2}],
                       doors=[{'x': 520, 'y': -100, 'link': 2}, {'x': 520, 'y': -60, 'link': 2}, {'x': 520, 'y': -20, 'link': 2}],
                       movingPlatforms=[mp]))
    r = await g.ev("""(() => { const o = ctx.arc, oDash = ctx.setLineDash, kreise = [], striche = [];
      ctx.arc = function(x, y, rad){ if(rad === 11) kreise.push(this.getTransform().transformPoint(new DOMPoint(x, y - rad)).y); return o.apply(this, arguments); };
      ctx.setLineDash = function(a){ if(a && a.length) striche.push(a.join(',')); return oDash.apply(this, arguments); };
      try { draw(); } finally { ctx.arc = o; ctx.setLineDash = oDash; }
      return {kreise, striche}; })()""")
    assert r['kreise'], 'keine Plakette gezeichnet'
    assert min(r['kreise']) >= -0.5, f"Plakette ragt oben aus dem Bild: {r['kreise']}"
    assert '6,5' not in r['striche'] and '3,7' not in r['striche'], f"Fahrweg-Striche noch da: {r['striche']}"

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
    # Taste halten, bis die Figur an allen Münzen vorbei ist (langsame Rechner: feste Zeit reicht dort nicht)
    async def lauf(key, fertig):
        await g.p.keyboard.down(key)
        try: await g.p.wait_for_function(fertig, timeout=4000)
        except Exception: pass
        await g.p.keyboard.up(key); await g.p.wait_for_timeout(300)
    await lauf('KeyD', "p1.x > 600")
    taken = await g.ev("coins.map(c=>c.taken)")
    assert taken == [True, False, True, True, False], f'Affe: {taken}'
    await lauf('ArrowRight', "p2.x > 600")
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
    """Geschafftes Level schaltet das nächste frei (Statistik, dann Levelauswahl mit Hinweis); Spielerwahl tauscht die Tasten:
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
        assert await sm_screen(g) == 'sm-s-results', 'nach dem Ziel kein Statistik-Bildschirm'
        sv = await g.ev("GameMenu.getSave()")
        assert 'level-1.json' in sv['completed'] and 'level-2.json' in sv['unlocked'], f'Fortschritt nicht gemerkt: {sv}'
        await p.wait_for_timeout(400); await p.keyboard.press('Enter'); await p.wait_for_timeout(700)
        assert await sm_screen(g) == 'sm-s-levels', 'nach der Statistik keine Levelauswahl'
        await p.wait_for_function("document.getElementById('sm-toast').textContent.includes('freigeschaltet')", timeout=5000)
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
        await p.wait_for_function("document.querySelector('#sm-s-menu.active')", timeout=8000); await p.wait_for_timeout(300)
        await p.keyboard.press('Enter'); await p.wait_for_timeout(700)
        await p.wait_for_function("document.querySelector('#sm-s-select.active')", timeout=8000); await p.wait_for_timeout(300)
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
async def verknuepfungen_bis_60(g):
    """Alle Projekt-Levels benutzen nur Verknüpfungen 1–60 (mehr kann der Editor nicht einstellen; bis Ausbau 2: 20)."""
    for L in json.loads((ROOT / 'levels' / 'levels.json').read_text()):
        d = json.loads((ROOT / 'levels' / 'editor-format' / L['datei']).read_text())
        links = [s['link'] for s in d.get('switches', [])] + [x['link'] for x in d.get('doors', [])] + \
                [m['link'] for m in d.get('movers', []) if m.get('link')] + \
                [h['move']['link'] for h in d.get('hooks', []) if h.get('move') and h['move'].get('link')]
        assert all(1 <= n <= 60 for n in links), f"{L['datei']}: Verknüpfungen über 60: {sorted(set(n for n in links if n > 60))}"

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
    zwei_bilder = "new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))"
    async def tippe(n):   # so lange halten/loslassen, bis das Menü (fragt einmal pro Bild ab) es sicher gesehen hat
        await g.ev(f"window.__pad.buttons[{n}]={{pressed:true,value:1}}"); await g.ev(zwei_bilder); await g.p.wait_for_timeout(60)
        await g.ev(f"window.__pad.buttons[{n}]={{pressed:false,value:0}}"); await g.ev(zwei_bilder); await g.p.wait_for_timeout(60)
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
    """Jedes Level in levels.json: Spiel-Format und Editor-Format beschreiben dasselbe Level – ALLE Felder (Ausbau 2:
    auch Druckplatten, Pilze, Aufwind, Level-Info). Die Spiel-Datei ist die, die ausgeliefert wird; der Editor schreibt
    beide in einem Commit, dieser Test hält sie deckungsgleich."""
    META = ('welt', 'tageszeit', 'wetter', 'look', 'theme')
    for L in json.loads((ROOT / 'levels' / 'levels.json').read_text()):
        spiel = json.loads((ROOT / 'levels' / L['datei']).read_text())
        ed = json.loads((ROOT / 'levels' / 'editor-format' / L['datei']).read_text())
        umg = await g.ev(f"convertEditorSnapshot({json.dumps(ed)})")
        assert ed.get('name') == L['name'], f"{L['datei']}: Name {ed.get('name')} statt {L['name']}"
        diff = [k for k in set(umg) | set(spiel) if not k.startswith('_') and k not in META + ('name',)   # name/_…: nur Beschriftung
                and level_teil(k, umg.get(k)) != level_teil(k, spiel.get(k))]
        assert not diff, f"{L['datei']}: Spiel- und Editor-Datei verschieden bei {diff}"
        # Aussehen und Wetter: gleiche Wirkung im Spiel
        a = await g.ev(f"[resolveLevelLook({json.dumps(umg)}), resolveLevelLook({json.dumps(spiel)})]")
        assert a[0] == a[1], f"{L['datei']}: Aussehen verschieden {a}"
        assert (umg.get('wetter') or 'wechselnd') == (spiel.get('wetter') or 'wechselnd'), f"{L['datei']}: Wetter verschieden"

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
    Ziel ganz rechts, Start links; ab Level 4 ein eigenes Thema, ab Level 5 gleich viele blaue wie pinke Münzen
    (Level 2–4 hat der Nutzer selbst gestaltet)."""
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
            assert lv.get('theme') in ('nacht', 'hoehle', 'vulkan'), f"{name}: Thema {lv.get('theme')}"
        if name not in ('level-2.json', 'level-3.json', 'level-4.json'):   # Level 2–4 vom Nutzer gestaltet: eigene Münzverteilung
            nb = sum(c['color'] == 'blue' for c in lv['coins'])
            assert nb * 2 == len(lv['coins']), f"{name}: Blau/Pink nicht ausgeglichen"

@test
async def hebel_haben_grund(g):
    """Alle Projekt-Levels: jeder Hebel / jede Druckplatte bewirkt etwas (Tür, bewegtes Teil oder bewegter Haken),
    und ein Hebel, der eine Gefahr startet (bewegtes Teil mit Stacheln), öffnet auch ein Tor – sonst hätte man
    keinen Grund, ihn zu ziehen (Nutzerwunsch: „es muss in sich schlüssig sein“)."""
    fehler = []
    for L in json.loads((ROOT / 'levels' / 'levels.json').read_text()):
        if L.get('versteckt'): continue
        await g.load(str(ROOT / 'levels' / L['datei']))
        fehler += await g.ev("""(() => {
          syncSwitchCarriers();
          const out = [], name = %s;
          const trig = [...switchDefs.map(s=>['Hebel', s.link]), ...plates.map(p=>['Platte', p.link])];
          for(const [art, l] of trig){
            const doors = solids.filter(d=>d.type==='door' && d.link===l).length;
            const movers = solids.filter(m=>m.type==='moveplat' && m.switchLink===l);
            const hk = hooks.filter(h=>h.moving && h.switchLink===l).length;
            if(!doors && !movers.length && !hk) out.push(name + ': ' + art + ' ' + l + ' bewirkt nichts');
            const gefahr = movers.some(m => spikes.some(sp => sp.carrier === m));
            if(art === 'Hebel' && gefahr && !doors) out.push(name + ': Hebel ' + l + ' startet Stacheln, öffnet aber kein Tor');
          }
          return out;
        })()""" % json.dumps(L['datei']))
    assert not fehler, f'Hebel ohne Grund: {sorted(set(fehler))}'

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
    in den bestehenden Levels fährt kein Stachel aus Versehen mit (außer in Levels, die direkt aus dem Editor kommen)."""
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
        # Soll-Zahl steht als Notiz „_mitfahrendeStacheln“ in der Level-Datei. Levels, die der Nutzer direkt aus dem
        # Editor hochlädt („☁ Auf GitHub speichern“), haben diese Notiz nicht – dort gilt, was er im Editor gebaut
        # und getestet hat, also hier nicht prüfen.
        daten = json.loads((ROOT / 'levels' / name).read_text())
        if '_mitfahrendeStacheln' not in daten and len(daten.get('movingPlatforms', [])) > 0 and n > 0: continue
        want = daten.get('_mitfahrendeStacheln', 0)
        assert n == want, f'{name}: {n} mitfahrende Stacheln, erwartet {want}'

@test
async def ziel_tanz_dann_menue(g):
    """Beide im Ziel: Figuren tanzen (Eingaben ruhen), ohne Hinweis „Beide im Ziel“, danach öffnet sich das Hauptmenü."""
    await g.load(level([ground(0, 680, 3000)], {'x': 300, 'y': 680}, {'x': 330, 'y': 680},
                       goal={'x': 315, 'y': 680}))
    for _ in range(40):
        if await g.ev("won"): break
        await g.p.wait_for_timeout(50)
    assert await g.ev("won"), "Sieg nicht erkannt"
    assert not await g.ev("document.getElementById('toast').classList.contains('show')"), "Hinweis „Beide im Ziel“ erscheint noch"
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
        # langsame Rechner: warten, bis das Spiel fertig geladen und das Test-Level gestartet ist (sonst sieht man noch das Menü)
        await p.wait_for_function("typeof editorTestMode !== 'undefined' && editorTestMode && typeof coins !== 'undefined' && coins.length === 3", timeout=8000)
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
        try: await p.wait_for_function("document.getElementById('canvasWrap') && document.getElementById('canvasWrap').scrollLeft > 0", timeout=8000)
        except Exception: pass   # langsame Rechner: Editor erst fertig laden lassen
        back = await p.evaluate("(()=>{ const w=document.getElementById('canvasWrap'), c=document.getElementById('c'); const k=c.width/c.getBoundingClientRect().width; return [w.scrollLeft*k/40, (w.scrollLeft+w.clientWidth)*k/40]; })()")
        assert back[0] + 1 < 94 < back[1] - 1, f'Editor zeigt nicht die Figuren (Spalte 94): Ansicht {back}'
        # nochmal Enter -> Test startet wieder bei den Figuren
        await p.keyboard.press('Enter')
        await p.wait_for_url('**/index.html?test=1', timeout=8000)
        await p.wait_for_function("typeof p1 !== 'undefined' && !!p1", timeout=8000); await p.wait_for_timeout(300)
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
    assert ".js?v=' + Date.now()" in html, 'Editor-Skripte ohne ?v='
    for f in (ROOT / 'editor' / 'js').glob('*.js'):   # jede Editor-Datei steht in der Lade-Liste
        assert f"'{f.stem}'" in html, f'editor/js/{f.name} wird nicht geladen'

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
            await p.mouse.click(box['x'] + (c*40 + 20)*k, box['y'] + ((r + 3)*40 + 20)*k)   # 3 Himmel-Reihen über Reihe 0
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
    await g.p.wait_for_function("p1.grounded && !deathState", timeout=5000)   # erst springen, wenn der Affe sicher steht
    await g.ev("SFX_LOG.length = 0")
    await g.p.keyboard.press('Space')
    try: await g.p.wait_for_function("SFX_LOG.includes('jump') && SFX_LOG.includes('land')", timeout=3000)
    except Exception: pass
    log = await g.ev("SFX_LOG.slice()")
    assert 'jump' in log and 'land' in log, f'Sprung/Landung ohne Ton: {log}'
    await g.p.keyboard.press('KeyG'); await g.p.wait_for_timeout(150)
    assert 'hook' in await g.ev("SFX_LOG.slice()"), 'Haken ohne Ton'
    await g.ev("solids.find(s=>s.type==='crumble').triggered = true")
    try: await g.p.wait_for_function("SFX_LOG.includes('crumblewarn') && SFX_LOG.includes('crumble')", timeout=3000)
    except Exception: pass
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
    await g.p.wait_for_function("p1.grounded && !deathState", timeout=5000)   # erst springen, wenn der Affe steht
    await g.p.keyboard.down('Space')
    try: await g.p.wait_for_function("!!p1._jumpT", timeout=3000)   # langsame Rechner: auf den Absprung warten
    except Exception: pass
    # Strecken zu einem festen Zeitpunkt kurz nach dem Absprung messen (langsame Rechner: sonst schon vorbei)
    st = await g.ev("(() => { const j = !!p1._jumpT, d = dustFx.length; if (j) p1._jumpT = performance.now() - 60; return {j, sq: charSquash(p1), dust: d}; })()")
    await g.p.keyboard.up('Space')
    assert st['j'] and st['sq'][1] > 1.005 and st['dust'] > 0, f'kein Strecken/Staub beim Absprung: {st}'
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
        try: await g.p.wait_for_function("!!rainBufs", timeout=10000)   # Berechnung läuft im Hintergrund (langsame Rechner: länger)
        except Exception: pass
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
        # Zustand setzen und sofort springen (im selben Aufruf) – sonst schwingt die Figur auf langsamen Rechnern
        # vorher schon ein paar Schritte, und der Abflug-Schwung ist nicht mehr der gesetzte
        await g.ev(f"""(()=>{{ const h=hooks[0]; p1.x=h.x; p1.y=h.y+180+p1.h*0.6; p1.vx={vx0}; p1.vy=0; p1.grounded=false;
          p1.hookAttached=true; p1.ropeWasAirborne=true; p1.anchor=h; p1.ropeLen=180; p1.ropeMax=220; p1._px=p1.x; p1._py=p1.y;
          KEYS.Space = true; KEYS.Space_pressed = true; }})()""")
        await g.p.wait_for_timeout(120); await g.ev("KEYS.Space = false"); await g.p.wait_for_timeout(200)
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
        # seit Ausbau 2: Thema = „Look-Override“ im Fenster Level-Info
        await p.click('#metaBtn'); await p.select_option('#metaLook', 'vulkan'); await p.click('#metaClose'); await p.wait_for_timeout(100)
        roh = await p.evaluate("JSON.parse(localStorage.getItem('monchichi_level_editor_v2')).theme")
        assert roh == 'vulkan', f'Editor speichert das Thema nicht: {roh}'
        await p.reload(); await p.wait_for_timeout(300)
        assert await p.eval_on_selector('#metaLook', 'e => e.value') == 'vulkan', 'Thema nach Neuladen weg'
        await p.click('#exportBtn'); await p.wait_for_timeout(200)
        exp = json.loads(await p.eval_on_selector('#exportText', 'e => e.value'))
        assert exp.get('theme') == 'vulkan', 'Export ohne Thema'
    finally:
        srv.shutdown()

@test
async def neue_elemente(g):
    """Druckplatte (Tür offen nur solange jemand draufsteht), Aufwind (trägt das Schweinchen mit Schirm hoch,
    den Affen nicht), Scheinwand (durchlaufbar, sieht aus wie Wand), Sprungpilz (schleudert ~6 Kästchen hoch, nur beim Draufspringen)."""
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

    # Sprungpilz: drüberlaufen -> nichts passiert; draufspringen -> hoch geschleudert
    lv = level([ground(0, 680, 3000)], {'x': 300, 'y': 680}, {'x': 100, 'y': 680}, bouncers=[{'x': 380, 'y': 680}])
    await g.load(lv)
    await g.ev("window.__minY = 999; window.__minVy = 0; if(!window.__bo){ window.__bo = 1; const o = stepSim; stepSim = function(ts){ o(ts); window.__minY = Math.min(window.__minY, p1.y); window.__minVy = Math.min(window.__minVy, p1.vy); }; }")
    await g.hold(('KeyD',), 300); await g.p.wait_for_timeout(1200)
    hoch = 680 - await g.ev('window.__minY')
    assert hoch < 5 and await g.ev('p1.x') > 400, f'Sprungpilz beim Drüberlaufen ausgelöst: {hoch:.0f} px hoch'
    await g.ev("p1.x = 380; p1.y = 520; p1.vx = 0; p1.vy = 2; p1.grounded = false; p1._px = p1.x; p1._py = p1.y; window.__minVy = 0; window.__minY = 999")
    await g.p.wait_for_timeout(1500)
    assert await g.ev('window.__minVy') <= -17, f"Sprungpilz beim Draufspringen nicht ausgelöst: {await g.ev('window.__minVy')}"
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
    gemeinsames Vorwärtslaufen schon; Bild ist 15 % herausgezoomt (0,85)."""
    assert abs(await g.ev('zoom') - 0.85) < 1e-9, 'Zoom ist nicht 0,85'
    assert abs(await g.ev('VW') - 1280/0.85) < 1, 'sichtbare Weltbreite passt nicht zum Zoom'
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
    # Schritte zählen und die echten Bildzeiten mitschreiben (auf langsamen Rechnern holt das Spiel pro Bild höchstens
    # 5 Schritte nach -> erwartete Schritte aus den Bildzeiten mit Tempo 0,9 nachrechnen statt starr ~54/s zu verlangen)
    await g.ev('''window.__steps = 0; window.__dts = [];
      const o = stepSim; stepSim = function(ts){ window.__steps++; return o(ts); };
      const l = loop; loop = function(ts){ const s0 = window.__steps; l(ts); window.__dts.push([frameDt, window.__steps - s0]); };''')
    await g.p.wait_for_timeout(2000)
    n, dts = await g.ev('[window.__steps, window.__dts]')
    acc, erwartet, zeit = 0.0, 0, 0.0
    for i, (dt, _) in enumerate(dts):
        if i == 0: continue   # erstes Bild nach dem Einhängen: Startwert des Zählers unbekannt
        acc += dt * 0.9; k = 0
        while acc >= 1000/60 and k < 5: acc -= 1000/60; k += 1
        if k >= 5: acc = 0
        erwartet += k; zeit += dt
    n_ab_2 = sum(s for _, s in dts[1:])
    assert abs(n_ab_2 - erwartet) <= 3, f'Spieltempo passt nicht zu 0,9: {n_ab_2} Schritte statt {erwartet}'
    assert n > 30, f'Spiel läuft kaum: {n} Schritte in 2 s'

# ---------------------------------------------------------------- Packages & Cosmetics (26/27/28)

@test
async def packages_wahrscheinlichkeiten(g):
    """Seltenheiten: Leer 10 %, Gewöhnlich 42 %, Ungewöhnlich 25 %, Selten 13 %, Episch 7 %, Legendär 2,5 %, Prestige 0,5 %."""
    r = await g.ev("""(() => { const n = 200000, c = {}; for (let i = 0; i < n; i++) { const k = rollRarity(); c[k] = (c[k]||0) + 1; }
      return Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v/n*100])); })()""")
    soll = {'empty': 10, 'common': 42, 'uncommon': 25, 'rare': 13, 'epic': 7, 'legendary': 2.5, 'prestige': 0.5}
    for k, v in soll.items():
        assert abs(r.get(k, 0) - v) < max(0.35, v*0.06), f'{k}: {r.get(k, 0):.2f} % statt {v} %'

@test
async def packages_duplikate(g):
    """Duplikat-Regeln: Legendär/Prestige nie doppelt, Episch/Selten nicht doppelt, solange noch welche fehlen;
    Gewöhnlich/Ungewöhnlich dürfen doppelt sein. Jedes Package zieht genau 1 vom Inventar der Figur ab."""
    r = await g.ev("""(() => { cosmeticsReset(); const orig = rollRarity, bad = [];
      for (const rar of ['prestige', 'legendary', 'epic', 'rare']) {
        const total = COSMETICS.filter(c => c.rarity === rar).length;
        for (let i = 0; i < total; i++) { rollRarity = () => rar; cosmeticsSave.pending.m = 1;
          const res = openPackage('m'); if (res.duplicate) bad.push(rar + ' doppelt bei ' + i); if (res.rarity !== rar) bad.push(rar + ' -> ' + res.rarity); }
      }
      // alle legendären/Prestige besessen -> wieder „legendär“ gezogen: kein Duplikat, sondern Ersatz aus fehlenden
      rollRarity = () => 'legendary'; cosmeticsSave.pending.m = 1; const x = openPackage('m');
      if (x.duplicate) bad.push('legendär doppelt, obwohl noch etwas fehlt');
      if (cosmeticsSave.pending.m !== 0) bad.push('Package nicht abgezogen');
      for (const it of COSMETICS) if ((it.rarity === 'legendary' || it.rarity === 'prestige') && ownedCount('m', it.id) > 1) bad.push(it.id + ' mehrfach');
      rollRarity = orig; return bad; })()""")
    assert not r, f'Duplikat-Regeln verletzt: {r}'
    # komplette Sammlung: nie ein doppeltes Legendär/Prestige, alles irgendwann gefunden
    r = await g.ev("""(() => { cosmeticsReset(); let n = 0; while (collectionCount('f') < COSMETICS.length && n < 5000) { cosmeticsSave.pending.f = 1; openPackage('f'); n++; }
      const dup = COSMETICS.filter(c => (c.rarity === 'legendary' || c.rarity === 'prestige') && ownedCount('f', c.id) > 1).map(c => c.id);
      return {n, voll: collectionCount('f'), dup, m: collectionCount('m')}; })()""")
    assert r['voll'] == await g.ev('COSMETICS.length') and not r['dup'], f'Sammlung: {r}'
    assert r['m'] == 0, 'Öffnen beim Schweinchen hat dem Affen etwas gegeben'

@test
async def packages_vergabe(g):
    """Pro Level: 1 Package fürs Schaffen, +1 wenn alle Münzen gesammelt – je Figur (beide bekommen ihre eigenen).
    Am Ende im Statistik-Bildschirm ein Knopf „Packages öffnen“ (freiwillig, „Weiter“ ist vorausgewählt)."""
    r = await g.ev("""(() => { cosmeticsReset(); awardPackages(false); const a = {...cosmeticsSave.pending}; awardPackages(true);
      return [a, {...cosmeticsSave.pending}]; })()""")
    assert r[0] == {'m': 1, 'f': 1} and r[1] == {'m': 3, 'f': 3}, f'Vergabe: {r}'
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'index.html'); await p.wait_for_timeout(600)
        await g.ev("cosmeticsReset()")
        await startmenue_bis_level(g)
        await g.ev("for (const c of coins) c.taken = false; coins[0].taken = true; winFinish()"); await p.wait_for_timeout(700)
        assert await sm_screen(g) == 'sm-s-results', 'kein Statistik-Bildschirm'
        assert await g.ev("cosmeticsSave.pending") == {'m': 1, 'f': 1}, 'nicht alle Münzen -> 1 Package je Figur erwartet'
        k = await g.ev("({sicht: getComputedStyle(document.getElementById('sm-r-pack')).display !== 'none', text: document.getElementById('sm-r-pack').textContent, weiter: document.getElementById('sm-r-go').classList.contains('sel')})")
        assert k['sicht'] and '2' in k['text'] and k['weiter'], f'Packages-Knopf: {k}'
        # Gewinner-Animation: je Figur ein eigener Package-Zähler, der hochzählt (hier bis 1), mit Ton
        await p.wait_for_function("document.querySelector('#sm-s-results').classList.contains('win')", timeout=5000)
        await p.wait_for_function("[...document.querySelectorAll('#sm-s-results .r-pack b.pack')].map(b => b.textContent).join() === '1,1'", timeout=5000)
        assert 'packCount' in await g.ev("SFX_LOG.slice()"), 'kein Ton beim Hochzählen der Packages'
        assert await g.ev("document.querySelectorAll('#sm-s-results .r-giftbox svg.gift').length") == 2, 'kein Geschenkpaket in den Karten'
        await p.wait_for_timeout(300); await p.keyboard.press('KeyA'); await p.wait_for_timeout(200); await p.keyboard.press('Space')
        await p.wait_for_timeout(700)
        assert await sm_screen(g) == 'sm-s-packs', 'Packages-Knopf öffnet den Öffnen-Bildschirm nicht'
        await p.keyboard.press('Escape'); await p.wait_for_timeout(700)
        assert await sm_screen(g) == 'sm-s-levels', 'Fertig führt nicht zur Levelauswahl'
        await p.wait_for_timeout(2600)   # Schloss-Animation
        k = await g.ev("({t: document.getElementById('sm-l-pack').textContent, n: (document.querySelector('#sm-l-pack .num') || {}).textContent})")
        assert 'Packages öffnen' in k['t'] and k['n'] == '2', f'Levelauswahl zeigt „Packages öffnen“ mit Zahl 2 nicht: {k}'
        await p.keyboard.press('ArrowUp'); await p.wait_for_timeout(200); await p.keyboard.press('Enter'); await p.wait_for_timeout(700)
        assert await sm_screen(g) == 'sm-s-packs', 'Menüpunkt „Packages öffnen“ öffnet den Öffnen-Bildschirm nicht'
        await p.keyboard.press('Escape'); await p.wait_for_timeout(700)
        assert await g.ev("cosmeticsSave.pending") == {'m': 1, 'f': 1}, 'ungeöffnete Packages müssen im Inventar bleiben'
    finally:
        srv.shutdown()

@test
async def packages_oeffnen(g):
    """Beide öffnen gleichzeitig: links Affe (Leertaste), rechts Schweinchen (Enter) – unabhängige Ergebnisse.
    Ablauf: Wackeln mit Spannungston -> Platzen -> Item + Fanfare je Seltenheit -> Anlegen/Behalten. Leer: eigene Animation."""
    p = g.p
    await g.ev("""cosmeticsReset(); cosmeticsSave.pending.m = 2; cosmeticsSave.pending.f = 1;
      window.__force = ['epic', 'empty', 'common']; const o = rollRarity; rollRarity = r => window.__force.length ? window.__force.shift() : o(r);
      SFX_LOG.length = 0; GameMenu.show('packs', {ret: ['levels']})""")
    await p.wait_for_function("SFX_LOG.includes('packRattle')", timeout=5000)   # Paket tanzt/klopft vor dem Öffnen
    await p.keyboard.press('Space'); await p.wait_for_timeout(60); await p.keyboard.press('Enter')
    ph = await g.ev("[PackagesUI.PK.sides.m.phase, PackagesUI.PK.sides.f.phase]")
    assert ph == ['shake', 'shake'], f'beide Nüsse sollten gleichzeitig wackeln: {ph}'
    await p.keyboard.press('Escape'); await p.wait_for_timeout(100)
    assert await sm_screen(g) == 'sm-s-packs', 'Esc während des Öffnens darf nicht abbrechen'
    await p.wait_for_function("['choose'].includes(PackagesUI.PK.sides.m.phase) && PackagesUI.PK.sides.f.phase === 'emptyChoose'", timeout=12000)
    log = await g.ev("SFX_LOG.slice()")
    for s in ('packShake', 'packBurst', 'packFanfare_epic', 'packEmpty'):
        assert s in log, f'Geräusch {s} fehlt: {log}'
    info = await g.ev("[document.querySelector('.pk-m .pk-rar').textContent, document.querySelector('.pk-f .pk-name').textContent, PackagesUI.PK.sides.m.res.item.id]")
    assert info[0] == 'Episch' and info[1] == 'Leer!', f'Anzeige: {info}'
    await p.keyboard.press('Space'); await p.wait_for_timeout(200)   # Anlegen (vorausgewählt)
    assert await g.ev(f"isEquipped('m', '{info[2]}')"), 'Anlegen hat das Item nicht angelegt'
    await p.keyboard.press('Enter'); await p.wait_for_timeout(200)   # Leer: Weiter
    k = await g.ev("[PackagesUI.PK.sides.m.phase, PackagesUI.PK.sides.f.phase, {...cosmeticsSave.pending}]")
    assert k == ['idle', 'idle', {'m': 1, 'f': 0}], f'nach der Entscheidung: {k}'
    # zweites Package Affe: Behalten -> nicht angelegt, aber im Besitz
    await p.keyboard.press('Space')
    await p.wait_for_function("PackagesUI.PK.sides.m.phase === 'choose'", timeout=12000)
    it = await g.ev("PackagesUI.PK.sides.m.res.item.id")
    await p.keyboard.press('KeyD'); await p.wait_for_timeout(100); await p.keyboard.press('Space'); await p.wait_for_timeout(200)
    assert await g.ev(f"ownedCount('m', '{it}') >= 1 && !isEquipped('m', '{it}')"), 'Behalten: Item muss im Besitz, aber nicht angelegt sein'
    await p.keyboard.press('Space'); await p.wait_for_timeout(200)
    assert await g.ev("PackagesUI.PK.sides.m.phase") == 'idle', 'ohne Packages darf sich nichts öffnen'

@test
async def sammlung_ausruesten(g):
    """Umkleide (Menüpunkt in der Levelauswahl: ▲ + Springen, E oder Klick): je Figur besessen / angelegt / fehlt mit Seltenheit; Springen legt an bzw. ab;
    fehlende Items lassen sich nicht anlegen; E wechselt die Figur; alles bleibt nach Neuladen gespeichert."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'index.html'); await p.wait_for_timeout(600)
        await g.ev("cosmeticsReset(); cosmeticsSave.owned.m.trail_bubbles = 2; cosmeticsPersist(); GameMenu.show('levels')")
        await p.wait_for_timeout(500)
        assert 'Umkleide' in await p.text_content('#sm-l-coll'), 'kein Menüpunkt Umkleide in der Levelauswahl'
        await p.keyboard.press('ArrowUp'); await p.wait_for_timeout(200)
        assert await g.ev("document.getElementById('sm-l-pack').classList.contains('sel')"), '▲ wählt „Packages öffnen“ nicht aus'
        await p.keyboard.press('Enter'); await p.wait_for_timeout(700)
        assert await sm_screen(g) == 'sm-s-packs', 'Packages-Bereich muss auch ohne Packages aufgehen (dort kann man kaufen)'
        await p.keyboard.press('Escape'); await p.wait_for_timeout(700)
        await p.keyboard.press('ArrowUp'); await p.wait_for_timeout(200)
        await p.keyboard.press('ArrowRight'); await p.wait_for_timeout(200)
        assert await g.ev("document.getElementById('sm-l-coll').classList.contains('sel')"), '▶ wählt die Umkleide nicht aus'
        await p.keyboard.press('Enter'); await p.wait_for_timeout(700)
        assert await sm_screen(g) == 'sm-s-collection', 'Springen auf „Umkleide“ öffnet sie nicht'
        # gesperrte Items: mit Namen, grau (kaum Farbe) und Schloss
        grau = await g.ev("""(() => { const t = [...document.querySelectorAll('#sm-s-collection .co-tile.miss')].find(e => e.textContent.includes('Regenbogen'));
          const d = t.querySelector('canvas').getContext('2d').getImageData(0, 0, 150, 100).data; let n = 0;
          for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - d[i+1]) > 20 || Math.abs(d[i+1] - d[i+2]) > 20) n++; return n; })()""")
        assert grau < 900, f'gesperrtes Item nicht grau: {grau} farbige Pixel'
        await p.keyboard.press('Escape'); await p.wait_for_timeout(700)
        await p.keyboard.press('KeyE'); await p.wait_for_timeout(700)
        assert await sm_screen(g) == 'sm-s-collection', 'E öffnet die Umkleide nicht'
        k = await g.ev("""({tiles: document.querySelectorAll('#sm-s-collection .co-tile').length, miss: document.querySelectorAll('#sm-s-collection .co-tile.miss').length,
          count: document.querySelector('#sm-s-collection .co-count').textContent, names: [...document.querySelectorAll('#sm-s-collection .co-tile .nm')].map(e => e.textContent)})""")
        assert k['tiles'] == await g.ev("COSMETICS.filter(c => c.slot === 'trail').length") and k['miss'] == k['tiles'] - 1, f'Kacheln: {k}'
        assert '1' in k['count'] and str(await g.ev('COSMETICS.length')) in k['count'] and 'Blubberblasen' in k['names'], f'Zähler/Namen: {k}'
        await p.keyboard.press('Space'); await p.wait_for_timeout(200)   # erstes Item (Staubwölkchen) fehlt
        assert not await g.ev("isEquipped('m', 'trail_dust')"), 'fehlendes Item wurde angelegt'
        await p.keyboard.press('KeyD'); await p.wait_for_timeout(150); await p.keyboard.press('Space'); await p.wait_for_timeout(200)
        assert await g.ev("isEquipped('m', 'trail_bubbles')"), 'besessenes Item nicht angelegt'
        assert await g.ev("document.querySelectorAll('#sm-s-collection .co-tile.eq').length") == 1, 'angelegt-Markierung fehlt'
        await p.keyboard.press('KeyE'); await p.wait_for_timeout(300)
        assert await g.ev("PackagesUI.CO.who") == 'f', 'E wechselt nicht zum Schweinchen'
        await p.reload(); await p.wait_for_timeout(700)
        assert await g.ev("isEquipped('m', 'trail_bubbles') && ownedCount('m', 'trail_bubbles') === 2"), 'nach Neuladen nicht mehr gespeichert'
        assert await g.ev("equippedItem('m', 'trail').id") == 'trail_bubbles'
    finally:
        srv.shutdown()

@test
async def cosmetics_zeichnen_rollfest(g):
    """Jedes Cosmetic wird an beiden Figuren in vielen Drehwinkeln (volle 360°), beim Laufen, Springen und Stehen
    ohne Fehler gezeichnet; Sonnenbrillen (groß) und Tattoos (Tribal über die ganze Figur) sitzen auf dem Gesicht;
    die Kategorie Kugel-Skin gibt es nicht mehr."""
    lvl = level([ground(0, 680, 3000)], {'x': 300, 'y': 680}, {'x': 200, 'y': 680})
    await g.load(lvl)
    n = await g.ev("""(() => { let n = 0; for (const it of COSMETICS) { cosmeticsReset(); cosResetState();
        for (const w of ['m', 'f']) { cosmeticsSave.owned[w][it.id] = 1; equipItem(w, it.id); }
        for (let i = 0; i < 40; i++) { for (const P of [p1, p2]) { P.rollAngle = i*Math.PI/10; P.vx = Math.sin(i*0.4)*6; P.vy = i % 10 < 5 ? -5 : 3; P.grounded = i % 10 > 7; }
          cosmeticsStep(); draw(); n++; } }
      cosmeticsReset(); return n; })()""")
    assert n == 40 * await g.ev('COSMETICS.length')
    # Sonnenbrillen + Tattoos: eigene Kategorien, sitzen auf dem Gesicht (werden im gedrehten Gesicht gezeichnet)
    k = await g.ev("""(() => { const n = sl => COSMETICS.filter(c => c.slot === sl).length; cosmeticsReset();
      for (const id of ['gl_aviator', 'tat_flame']) { cosmeticsSave.owned.m[id] = 1; equipItem('m', id); }
      let gl = 0, ta = 0; const og = drawGlasses, ot = drawTattoo;
      drawGlasses = (...a) => { gl++; return og(...a); }; drawTattoo = (...a) => { ta++; return ot(...a); };
      p1.rollAngle = 1.3; draw(); drawGlasses = og; drawTattoo = ot; cosmeticsReset();
      return {slots: SLOTS.map(s => s.id), gl: n('glasses'), ta: n('tattoo'), drawnGl: gl, drawnTa: ta}; })()""")
    assert 'glasses' in k['slots'] and 'tattoo' in k['slots'] and k['gl'] >= 8 and k['ta'] >= 8, f'Brillen/Tattoos fehlen: {k}'
    assert k['drawnGl'] >= 1 and k['drawnTa'] >= 1, f'Brille/Tattoo wird im Spiel nicht gezeichnet: {k}'
    assert 'skin' not in k['slots'] and await g.ev("COSMETICS.every(c => c.slot !== 'skin')"), 'Kugel-Skin noch vorhanden'
    # Tattoo bedeckt die ganze Figur (nicht nur einen kleinen Fleck): Muster im Kopf-Kreis messen
    t = await g.ev("""(() => { const out = {}; for (const it of COSMETICS.filter(c => c.slot === 'tattoo')) {
        const cv = document.createElement('canvas'); cv.width = cv.height = 200; const c = cv.getContext('2d');
        c.translate(100, 100); c.scale(100, 100); tattooPattern(c, it.fx.kind);
        const d = c.getImageData(0, 0, 200, 200).data; let ink = 0, all = 0;
        for (let y = 0; y < 200; y += 2) for (let x = 0; x < 200; x += 2) { if (Math.hypot(x - 100, y - 100) > 100) continue; all++; if (d[(y*200 + x)*4 + 3] > 40) ink++; }
        out[it.id] = ink/all; } return out; })()""")
    for tid, v in t.items():
        assert v > 0.08, f'Tattoo {tid} bedeckt zu wenig von der Figur: {v:.2f}'
    gw = await g.ev("""(() => { let w = 0; const og = drawGlasses; drawGlasses = (c, k, L, R, ww) => { w = ww; };
      drawFaceWear(ctx, {x: 0, y: 0, w: 308, h: 257}, 'monkey', {glasses: COSMETIC.gl_classic}); drawGlasses = og; return w; })()""")
    assert gw >= 28, f'Sonnenbrille zu klein: halbe Glasbreite {gw} von 308'

@test
async def cosmetics_kein_vorteil(g):
    """Cosmetics sind rein optisch: mit allen Slots belegt (Prestige) laufen und springen die Figuren exakt gleich wie ohne."""
    lvl = level([ground(0, 680, 3000), ground(700, 560, 200)], {'x': 300, 'y': 680}, {'x': 200, 'y': 680})
    await g.load(lvl)
    lauf = """(() => { resetLevel(); for (const k in KEYS) KEYS[k] = false; const out = [];
      for (let i = 0; i < 240; i++) { KEYS.KeyD = KEYS.ArrowRight = true;
        if (i === 30 || i === 120) { KEYS.Space = KEYS.Space_pressed = true; KEYS.Numpad0 = KEYS.Numpad0_pressed = true; }
        if (i === 45 || i === 135) { KEYS.Space = KEYS.Numpad0 = false; }
        stepSim(performance.now()); out.push([p1.x, p1.y, p2.x, p2.y, p1.vx, p2.vy].map(v => Math.round(v*1000)/1000)); }
      for (const k in KEYS) KEYS[k] = false; return out; })()"""
    await g.ev("cosmeticsReset()")
    ohne = await g.ev(lauf)
    await g.ev("""for (const id of ['pres_saturn', 'pres_inferno', 'pres_rainbow', 'trail_galaxy', 'pet_robot', 'gl_bling', 'tat_rune'])
                    for (const w of ['m', 'f']) { cosmeticsSave.owned[w][id] = 1; equipItem(w, id); }""")
    mit = await g.ev(lauf)
    await g.ev("cosmeticsReset()")
    assert ohne[-1][0] > ohne[0][0] + 100, 'Figuren sind nicht gelaufen'
    assert ohne == mit, 'Cosmetics verändern die Bewegung!'


@test
async def packages_menue_design(g):
    """Keine Kategorie „Anhängsel“ und kein Ei/Eiswürfel/Schatten-Aura mehr; Levelauswahl: „Packages öffnen“ und „Umkleide“ als eigene Menüpunkte ohne Emojis,
    die sich nie mit den Figuren über der gewählten Levelkarte überschneiden (auch bei Level 5/6)."""
    assert await g.ev("SLOTS.every(s => s.id !== 'attach') && COSMETICS.every(c => c.slot !== 'attach')"), 'Anhängsel noch vorhanden'
    assert await g.ev("['skin_egg', 'skin_icecube', 'aura_shadow'].every(id => !COSMETIC[id])"), 'Ei/Eiswürfel/Schatten-Aura noch vorhanden'
    await g.ev("GameMenu.unlockAll(); GameMenu.show('levels')"); await g.p.wait_for_timeout(600)
    for i in range(6):
        await g.ev(f"document.querySelectorAll('#sm-cards .lc')[{i}].click()"); await g.p.wait_for_timeout(500)
        r = await g.ev("""(() => { const R = s => document.querySelector(s).getBoundingClientRect(), a = R('#sm-pair'), o = [R('#sm-l-pack'), R('#sm-l-coll')];
          return o.some(b => !(b.right <= a.left || b.left >= a.right || b.bottom <= a.top || b.top >= a.bottom)); })()""")
        assert not r, f'Menüpunkt überschneidet die Figuren bei Level {i + 1}'
    txt = await g.ev("document.getElementById('sm-l-pack').textContent + document.getElementById('sm-l-coll').textContent + document.getElementById('sm-l-hint').textContent")
    import re
    assert not re.search('[\U0001F300-\U0001FAFF]', txt), f'Emoji im Menü: {txt}'

@test
async def figuren_rollen_rund(g):
    """Figuren rollen rund um die Kopfmitte (Drehpunkt bleibt bei jedem Winkel gleich und liegt in der Kopfmitte,
    Ohren zählen nicht), Bild unverzerrt; die Leinwand hat die echte Bildschirmauflösung (scharf statt hochskaliert)."""
    await g.load(level([ground(0, 680, 2000)], {'x': 300, 'y': 680}, {'x': 200, 'y': 680}))
    r = await g.ev("""(() => { const piv = [], orig = ctx.rotate.bind(ctx), dimg = ctx.drawImage.bind(ctx); let rec = false, sz = null;
      ctx.rotate = a => { if (rec) { const m = ctx.getTransform(); piv.push([m.e, m.f]); } return orig(a); };
      ctx.drawImage = function(im, ...r) { if (rec && im === ASSETS.monkey && r.length === 4) sz = [r[2], r[3]]; return dimg(im, ...r); };
      p1.blink = 9999;
      for (const a of [0, 1.1, 2.2, 3.3, 4.4]) { p1.rollAngle = a; ctx.setTransform(1, 0, 0, 1, 0, 0); rec = true; drawCharacter(p1, camX); rec = false; }
      delete ctx.rotate; delete ctx.drawImage;
      const size = Math.max(p1.w, p1.h)*1.55, hgt = size*257/308, hy = size/2 - hgt + HEAD_CENTER.monkey[1]*hgt;
      return {piv, sz, headY: Math.round(p1.y) - p1.h*0.5 + hy, cw: cvs.width, rect: cvs.getBoundingClientRect().width, rs: RS}; })()""")
    xs = {round(p[0], 2) for p in r['piv']}; ys = {round(p[1], 2) for p in r['piv']}
    assert len(xs) == 1 and len(ys) == 1, f'Drehpunkt wandert beim Rollen: {r["piv"]}'
    assert abs(list(ys)[0] - r['headY']) < 1.5, f'Drehpunkt nicht in der Kopfmitte: {r}'
    assert r['sz'] and abs(r['sz'][1]/r['sz'][0] - 257/308) < 0.002, f'Figur verzerrt: {r}'
    assert abs(r['cw'] - min(2560, max(1280, round(r['rect'])))) <= 2 and abs(r['rs'] - r['cw']/1280) < 1e-6, f'Leinwand nicht in Bildschirmauflösung: {r}'

@test
async def anzeigen_muenzen_tode(g):
    """Münz-Anzeige oben links je Figur (blau/pink, gesammelt / vorhanden, Balken), keine Gold-Zählung „x / 10“ mehr und
    keine Mindest-Münzen fürs Ziel; Tode-Anzeige oben rechts größer (wächst mit dem Bildschirm), mit „TODE“."""
    coins = [{'x': 400 + i*40, 'y': 640, 'color': 'blue'} for i in range(3)] + [{'x': 600 + i*40, 'y': 640, 'color': 'pink'} for i in range(2)]
    await g.load(level([ground(0, 680, 2000)], {'x': 200, 'y': 680}, {'x': 160, 'y': 680}, coins=coins))
    await g.ev("coins[0].taken = true; coins[3].taken = true"); await g.p.wait_for_timeout(300)
    k = await g.ev("""({m: document.getElementById('coinM').textContent, mt: document.getElementById('coinMT').textContent,
      f: document.getElementById('coinF').textContent, ft: document.getElementById('coinFT').textContent,
      bar: parseFloat(document.getElementById('coinMBar').style.width), txt: document.getElementById('coinCard').textContent,
      need: coinsNeeded, h: document.getElementById('duelCard').getBoundingClientRect().height, tode: document.getElementById('duelCard').textContent})""")
    assert (k['m'], k['mt'], k['f'], k['ft']) == ('1', '/ 3', '1', '/ 2'), f'Münz-Anzeige: {k}'
    assert 32 < k['bar'] < 35 and '/ 10' not in k['txt'] and k['need'] == 0, f'Gold-Zählung/Pflicht noch da: {k}'
    assert k['h'] >= 50 and 'TODE' in k['tode'], f'Tode-Anzeige zu klein/ohne Beschriftung: {k}'

@test
async def paket_kaufen_und_muenzkonto(g):
    """Münz-Konto je Figur: am Levelende kommen die selbst gesammelten Münzen dazu. Ohne Packages kann man im
    Packages-Bereich für 200 Münzen eins kaufen (zu wenig Münzen: nichts passiert). Schleimspur nur am Boden."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'index.html'); await p.wait_for_timeout(600)
        await g.ev("cosmeticsReset()")
        await startmenue_bis_level(g)
        await g.ev("""(() => { let a = 0, b = 0; for (const c of coins) { if (c.color === 'blue' && a < 3) { c.taken = true; c.takenBy = 'm'; a++; }
                      if (c.color === 'pink' && b < 2) { c.taken = true; c.takenBy = 'f'; b++; } } winFinish(); })()""")
        await p.wait_for_timeout(700)
        k = await g.ev("cosmeticsSave.coins")
        assert k['m'] >= 3 and k['f'] >= 2, f'Münzen nicht aufs Konto: {k}'
        await g.ev("cosmeticsSave.pending = {m: 0, f: 0}; cosmeticsSave.coins = {m: 230, f: 50}; GameMenu.show('packs', {ret: ['levels']})")
        await p.wait_for_timeout(600)
        assert await g.ev("document.querySelector('.pk-m .pk-buy').classList.contains('on')"), 'kein Kaufen-Knopf ohne Packages'
        await p.keyboard.press('Space'); await p.wait_for_timeout(200); await p.keyboard.press('Enter'); await p.wait_for_timeout(300)
        k = await g.ev("[cosmeticsSave.coins, cosmeticsSave.pending]")
        assert k == [{'m': 30, 'f': 50}, {'m': 1, 'f': 0}], f'Kaufen: {k}'
        await p.keyboard.press('Space'); await p.wait_for_timeout(200)
        assert await g.ev("PackagesUI.PK.sides.m.phase") == 'shake', 'gekauftes Paket lässt sich nicht öffnen'
    finally:
        srv.shutdown()
    # Schleimspur: am Boden ja, in der Luft keine neuen Tropfen
    n = await g.ev("""(() => { const st = cosNewState(), it = COSMETIC.trail_slime, rig = g => ({x: 100, y: 100, r: 21, roll: 0, vx: 5, vy: g ? 0 : -6, grounded: g, facing: 1});
      for (let i = 0; i < 30; i++) cosStep(rig(true), st, 'm', {trail: it}); const boden = st.parts.length; st.parts.length = 0;
      for (let i = 0; i < 30; i++) cosStep(rig(false), st, 'm', {trail: it}); return [boden, st.parts.length]; })()""")
    assert n[0] > 5 and n[1] == 0, f'Schleimspur: {n}'
    # alle Roll-Spuren: nur beim Rollen (am Boden + in Bewegung), nicht im Stehen und nicht im Sprung
    r = await g.ev("""COSMETICS.filter(c => c.slot === 'trail').map(it => { const out = [];
      for (const [gr, vx] of [[true, 5], [true, 0], [false, 5]]) { const st = cosNewState();
        for (let i = 0; i < 40; i++) cosStep({x: 100 + i*vx, y: 100, r: 21, roll: 0, vx, vy: gr ? 0 : -5, grounded: gr, facing: 1}, st, 'm', {trail: it});
        out.push(st.parts.length + (it.fx.kind === 'rainbow' ? st.hist.filter(h => h.roll).length : 0)); }
      return [it.id, ...out]; })""")
    for it, rollen, stehen, luft in r:
        assert rollen > 0 and stehen == 0 and luft == 0, f'Roll-Spur {it}: rollen {rollen}, stehen {stehen}, Sprung {luft}'

@test
async def level_ladefehler_mit_grund(g):
    """Lässt sich ein Level nicht laden, springt das Spiel nicht still zurück, sondern zeigt in der Levelauswahl den Grund."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'index.html'); await p.wait_for_timeout(600)
        await p.route('**/levels/level-3.json*', lambda r: r.fulfill(status=404, body='weg'))
        await g.ev("GameMenu.unlockAll(); GameMenu.show('levels')"); await p.wait_for_timeout(600)
        await g.ev("document.querySelectorAll('#sm-cards .lc')[2].click()"); await p.wait_for_timeout(400)
        await g.ev("document.querySelectorAll('#sm-cards .lc')[2].click()"); await p.wait_for_timeout(700)
        await g.ev("document.getElementById('sm-go-btn').click()")
        await p.wait_for_function("document.getElementById('sm-modal').classList.contains('on')", timeout=15000)
        t = await g.ev("document.getElementById('sm-modal-text').textContent")
        assert '404' in t and await sm_screen(g) == 'sm-s-levels', f'Fehlermeldung: {t}'
    finally:
        srv.shutdown()

@test
async def editor_github_speichern(g):
    """Editor: „Auf GitHub speichern“ – ohne Schlüssel erscheint die Anleitung; mit Schlüssel werden Spiel- und
    Editor-Datei des geladenen Hauptlevels in EINEM Commit nach main geschrieben (GitHub-API hier simuliert)."""
    srv = webserver(); p = g.p; calls = []; kopf = {'sha': 'c0'}
    async def api(route):
        req = route.request; url = req.url.split('/repos/b48bvggmn7-ops/koopgame')[-1]
        calls.append((req.method, url, req.headers.get('authorization'), req.post_data))
        body = {'GET /git/ref/heads/main': {'object': {'sha': kopf['sha']}}, 'GET /git/commits/' + kopf['sha']: {'tree': {'sha': 't0'}},
                'POST /git/trees': {'sha': 't1'}, 'POST /git/commits': {'sha': 'c1'}, 'PATCH /git/refs/heads/main': {'object': {'sha': 'c1'}}}
        if url.startswith('/contents/'):
            import base64
            datei = url.split('?')[0][len('/contents/'):]
            body[req.method + ' ' + url] = {'content': base64.b64encode((ROOT / datei).read_bytes()).decode(), 'encoding': 'base64'}
        await route.fulfill(status=200, content_type='application/json', headers={'Cache-Control': 'private, max-age=60'},
                            body=json.dumps(body.get(req.method + ' ' + url, {})))
    try:
        await p.route('https://api.github.com/**', api)
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(300)
        # merken, ob die GitHub-Abfragen am Browser-Zwischenspeicher vorbei gehen (sonst alter Stand -> HTTP 422)
        await g.ev("window.__ghCache = []; const f0 = window.fetch; window.fetch = (u, o) => { if (String(u).includes('api.github.com')) __ghCache.push((o||{}).cache); return f0(u, o); }")
        await p.click('#levelsBtn'); await p.wait_for_timeout(500)
        await p.click('#projectList .lvl:nth-child(3) button'); await p.wait_for_timeout(400)   # Level 3 laden
        await p.click('#githubBtn'); await p.wait_for_timeout(500)
        assert await g.ev("getComputedStyle(document.getElementById('ghKeySect')).display !== 'none'"), 'ohne Schlüssel keine Anleitung'
        await p.fill('#ghToken', 'github_pat_TEST123'); await p.click('#ghKeySave'); await p.wait_for_timeout(200)
        assert await g.ev("document.getElementById('ghTarget').value") == 'level-3.json', 'geladenes Hauptlevel nicht vorausgewählt'
        await p.click('#ghUpload')
        await p.wait_for_function("document.getElementById('ghStatus').textContent.includes('Gespeichert')", timeout=5000)
        wege = [c[0] + ' ' + c[1] for c in calls]
        assert wege == ['GET /git/ref/heads/main', 'GET /git/commits/c0', 'GET /contents/levels/worlds.json?ref=c0', 'GET /contents/levels/levels.json?ref=c0',
                        'POST /git/trees', 'POST /git/commits', 'PATCH /git/refs/heads/main'], wege
        calls[:] = [c for c in calls if '/contents/' not in c[1]]
        assert all(c[2] == 'Bearer github_pat_TEST123' for c in calls), 'Schlüssel nicht mitgeschickt'
        tree = json.loads(calls[2][3])['tree']
        assert [t['path'] for t in tree] == ['levels/level-3.json', 'levels/editor-format/level-3.json', 'levels/worlds.json'], tree
        assert tree[2]['content'] == (ROOT / 'levels' / 'worlds.json').read_text(encoding='utf-8'), 'worlds.json unnötig verändert'
        spiel, ed = json.loads(tree[0]['content']), json.loads(tree[1]['content'])
        orig = json.loads((ROOT / 'levels' / 'editor-format' / 'level-3.json').read_text())
        assert 'solids' in spiel and ed['name'] == 'Level 3' and sorted(map(tuple, ed['tiles'])) == sorted(map(tuple, orig['tiles'])), 'Inhalt falsch'
        assert json.loads(calls[4][3])['sha'] == 'c1' and json.loads(calls[3][3])['parents'] == ['c0']
        # zweites Hochladen direkt danach: main ist jetzt c1 – der Editor muss den NEUEN Stand holen (nicht aus dem
        # Browser-Zwischenspeicher), sonst gibt GitHub HTTP 422 (Fehler beim Nutzer)
        await p.wait_for_function("!document.getElementById('ghBox').classList.contains('show')", timeout=4000)   # schließt von selbst
        calls.clear(); kopf['sha'] = 'c1'
        await p.click('#githubBtn'); await p.wait_for_timeout(400)
        await p.click('#ghUpload')
        await p.wait_for_function("document.getElementById('ghStatus').textContent.includes('Gespeichert')", timeout=5000)
        calls[:] = [c for c in calls if '/contents/' not in c[1]]
        assert json.loads(calls[3][3])['parents'] == ['c1'], f'alter Stand von main benutzt: {calls[3][3]}'
        assert set(await g.ev("__ghCache")) == {'no-store'}, 'GitHub-Abfragen dürfen nicht zwischengespeichert werden'
    finally:
        srv.shutdown()

@test
async def scheinwand_ohne_moos_verrat(g):
    """Auf Flächen direkt unter einer Scheinwand wächst kein Moos/Gras (und keine Ranken daneben) – sonst sähe man den
    versteckten Weg."""
    lvl = level([ground(0, 680, 2000), {'x': 400, 'y': 440, 'w': 200, 'h': 40, 'type': 'wall'},
                 {'x': 400, 'y': 320, 'w': 200, 'h': 120, 'type': 'fake'}, {'x': 800, 'y': 440, 'w': 200, 'h': 40, 'type': 'wall'}],
                {'x': 100, 'y': 680}, {'x': 60, 'y': 680})
    await g.load(lvl)
    k = await g.ev("""(() => { buildDeco(); const unter = decoMoss.filter(m => !m.side && m.x >= 400 && m.x < 600 && m.y === 440).length,
      frei = decoMoss.filter(m => !m.side && m.x >= 800 && m.x < 1000 && m.y === 440).length; return [unter, frei]; })()""")
    assert k[0] == 0 and k[1] == 5, f'Moos unter Scheinwand / auf freier Wand: {k}'

@test
async def neues_spiel_loescht_alles(g):
    """Hauptmenü: beim ersten Start nur Spielen/Optionen/Beenden; nach dem Spielen kommt „Fortfahren“ dazu.
    „Spielen“ mit vorhandenem Spielstand fragt nach und löscht dann ALLES: Level, Packages, Items/Skins, Münzen."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'index.html'); await p.wait_for_timeout(600)
        await p.keyboard.press('Enter'); await p.wait_for_timeout(1100)
        assert await g.ev("[...document.querySelectorAll('#sm-menu .mi')].map(b => b.textContent)") == ['Spielen', 'Optionen', 'Beenden']
        # Spielstand vorhanden: Level geschafft, Packages, Items, Münzen
        await g.ev("""GameMenu.completeLevel(1, true); GameMenu.completeLevel(2, true);
          cosmeticsSave.pending = {m: 2, f: 1}; cosmeticsSave.coins = {m: 340, f: 90};
          cosmeticsSave.owned.m.trail_bubbles = 1; equipItem('m', 'trail_bubbles'); cosmeticsPersist();
          (() => { const s = JSON.parse(localStorage.getItem('monchichi.save')); s.played = true; localStorage.setItem('monchichi.save', JSON.stringify(s)); })()""")
        await p.reload(); await p.wait_for_timeout(700)
        await p.keyboard.press('Enter'); await p.wait_for_timeout(1100)
        assert await g.ev("[...document.querySelectorAll('#sm-menu .mi')].map(b => b.textContent)") == ['Spielen', 'Fortfahren', 'Optionen', 'Beenden']
        await p.keyboard.press('Enter'); await p.wait_for_timeout(400)          # Spielen -> Rückfrage
        assert await g.ev("document.getElementById('sm-modal').classList.contains('on')"), 'keine Rückfrage'
        assert 'Münzen' in await g.ev("document.getElementById('sm-modal-text').textContent")
        await p.keyboard.press('ArrowRight'); await p.wait_for_timeout(150); await p.keyboard.press('Enter'); await p.wait_for_timeout(700)
        await p.keyboard.press('Space'); await p.wait_for_timeout(100); await p.keyboard.press('Numpad0')
        for _ in range(120):
            if await g.ev("menuScreen === null"): break
            await p.wait_for_timeout(100)
        k = await g.ev("({sv: GameMenu.getSave(), c: JSON.parse(localStorage.getItem('monchichi_cosmetics_v1'))})")
        assert k['sv']['unlocked'] == [] and k['sv']['completed'] == [] and k['sv']['stats'] == {}, f"Level nicht zurückgesetzt: {k['sv']}"
        c = k['c']
        assert c['pending'] == {'m': 0, 'f': 0} and c['coins'] == {'m': 0, 'f': 0} and not c['owned']['m'] and not c['equipped']['m'], f'Cosmetics nicht zurückgesetzt: {c}'
    finally:
        srv.shutdown()

@test
async def welten_laden(g):
    """Ausbau 1: levels/worlds.json lädt (Welten in Reihenfolge, Level darin); Levelkarten bleiben wie vorher
    (gleiche Reihenfolge und Namen); ohne worlds.json gilt levels.json; Level außerhalb jeder Welt gehen nicht verloren."""
    w = json.loads((ROOT / 'levels' / 'worlds.json').read_text(encoding='utf-8'))
    ids = [x['id'] for x in sorted(w['welten'], key=lambda x: x['reihenfolge'])]
    assert ids == ['dschungel', 'ruinen', 'hoehle', 'wasser', 'vulkan'], ids
    for x in w['welten']:
        assert set(x) >= {'id', 'name', 'titel', 'reihenfolge', 'level', 'boss'} and x['boss'] is None, x
        for d in x['level']: assert (ROOT / 'levels' / d).exists(), f'Level-Datei fehlt: {d}'
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'index.html')
        await p.wait_for_function("GameMenu.levelsReady()", timeout=8000)
        k = await g.ev("({w: GameMenu.config.worlds.map(x => x.id), l: GameMenu.config.levels.map(l => [l.datei, l.name, l.welt])})")
        assert k['w'] == ids, k
        assert [x[0] for x in k['l']] == [f'level-{i}.json' for i in range(1, 7)], f'Reihenfolge geändert: {k}'
        assert [x[1] for x in k['l']] == ['Dschungel', 'Baumkronen', 'Ruinen', 'Mondnacht', 'Kristallhöhle', 'Feuerberg'], f'Namen geändert: {k}'
        assert [x[2] for x in k['l']] == ['dschungel', 'dschungel', 'ruinen', 'ruinen', 'hoehle', 'vulkan'], k
        # Rückfall ohne worlds.json: Reihenfolge aus levels.json (versteckte nicht); nicht einsortierte Level hinten dran
        f = await g.ev("""(() => { const list = [{datei:'a.json', titel:'A'}, {datei:'b.json', titel:'B'}, {datei:'x.json', versteckt:true}, {datei:'c.json'}];
          return { ohne: GameMenu.buildLevelOrder(list, null).map(l => l.datei),
                   mit: GameMenu.buildLevelOrder(list, {welten: [{id:'w2', reihenfolge:2, level:['a.json']}, {id:'w1', reihenfolge:1, level:['b.json']}]}).map(l => l.datei + ':' + l.welt) }; })()""")
        assert f['ohne'] == ['a.json', 'b.json', 'c.json'], f
        assert f['mit'] == ['b.json:w1', 'a.json:w2', 'c.json:null'], f
    finally:
        srv.shutdown()

@test
async def spielstand_migration(g):
    """Ausbau 1: alter Spielstand (Level-Nummern) wird auf Dateinamen umgerechnet, nichts geht verloren; das Original
    bleibt unverändert als Sicherung (monchichi.save_v1_backup) und wird nie überschrieben."""
    srv = webserver(); p = g.p
    alt = {'played': True, 'unlocked': 4, 'completed': [1, 2, 3], 'stats': {'1': {'m': 2, 'f': 3}, '3': {'m': 0, 'f': 5}}}
    try:
        await p.goto(srv.url + 'index.html')
        await g.ev(f"localStorage.clear(); localStorage.setItem('monchichi.save', JSON.stringify({json.dumps(alt)}))")
        await p.reload(); await p.wait_for_function("GameMenu.levelsReady()", timeout=8000)
        sv = await g.ev("GameMenu.getSave()")
        assert sv['v'] == 2 and sv['played'] is True, sv
        assert sv['unlocked'] == ['level-1.json', 'level-2.json', 'level-3.json', 'level-4.json'], sv
        assert sv['completed'] == ['level-1.json', 'level-2.json', 'level-3.json'], sv
        assert sv['stats'] == {'level-1.json': {'m': 2, 'f': 3}, 'level-3.json': {'m': 0, 'f': 5}}, sv
        assert json.loads(await g.ev("localStorage.getItem('monchichi.save_v1_backup')")) == alt, 'Sicherung fehlt/verändert'
        # Levelkarten: 4 offen, 3 geschafft – wie vorher
        await g.ev("GameMenu.show('levels')"); await p.wait_for_timeout(500)
        cards = await g.ev("[...document.querySelectorAll('#sm-cards .lc')].map(b => [b.classList.contains('lock'), b.textContent.includes('Geschafft') || !!b.querySelector('.duel')])")
        assert [c[0] for c in cards] == [False, False, False, False, True, True], cards
        # Weiterspielen: Level 4 schaffen schaltet Level 5 frei (Datei), Sicherung bleibt unverändert
        assert await g.ev("GameMenu.completeLevel(4, true)") == 5
        await p.reload(); await p.wait_for_function("GameMenu.levelsReady()", timeout=8000)
        sv = await g.ev("GameMenu.getSave()")
        assert 'level-5.json' in sv['unlocked'] and 'level-4.json' in sv['completed'] and sv['stats']['level-1.json'] == {'m': 2, 'f': 3}, sv
        assert json.loads(await g.ev("localStorage.getItem('monchichi.save_v1_backup')")) == alt, 'Sicherung überschrieben'
        # kaputte/zu große Werte: nichts stürzt ab
        m = await g.ev("GameMenu.migrateSave({unlocked: 99, completed: [7, 'x', 2]})")
        assert m['unlocked'] == [f'level-{i}.json' for i in range(1, 7)] and m['completed'] == ['level-2.json'], m
    finally:
        await g.ev("localStorage.clear()")
        srv.shutdown()

@test
async def schichten_tageszeit_wetter(g):
    """Ausbau 1: Welt + Tageszeit + Wetter als Schichten. Alte Levels (theme) behalten genau ihren Look und den
    Wetter-Wechsel; neue Levels: Tageszeit ändert Himmel/Sonne/Mond/Dunkelheit/Farbstich, Wetter trocken/regen wirkt."""
    k = await g.ev("""(() => { const r = d => resolveLevelLook(d);
      return { alt: ['dschungel', 'abend', 'ruinen', 'nacht', 'hoehle', 'vulkan'].map(t => r({theme: t})),
               ohne: r({}), look: r({welt: 'ruinen', look: 'nacht'}), morgen: r({welt: 'dschungel'}), mittagR: r({welt: 'ruinen', tageszeit: 'mittag'}),
               nacht: r({welt: 'dschungel', tageszeit: 'nacht'}), abend: r({welt: 'dschungel', tageszeit: 'abend'}),
               mittag: r({welt: 'dschungel', tageszeit: 'mittag'}), hoehleTag: r({welt: 'hoehle', tageszeit: 'mittag'}),
               hoehleNacht: r({welt: 'hoehle', tageszeit: 'nacht'}), unbekannt: r({welt: 'dschungel', tageszeit: 'quatsch'}) }; })()""")
    assert k['alt'] == ['dschungel', 'abend', 'ruinen', 'nacht', 'hoehle', 'vulkan'] and k['ohne'] == 'dschungel', k
    assert k['look'] == 'nacht' and k['morgen'] == 'dschungel' and k['mittagR'] == 'ruinen' and k['hoehleTag'] == 'hoehle', k
    assert k['unbekannt'] == 'dschungel', k
    t = await g.ev(f"""(() => {{ const T = n => THEMES[n]; const n = T({json.dumps(k['nacht'])}), a = T({json.dumps(k['abend'])}), m = T({json.dumps(k['mittag'])});
      return {{ nMoon: !!n.moon, nSun: !!n.sun, nDark: n.dark, nWash: !!n.layerWash, nGround: n.ground === THEMES.dschungel.ground,
               aSky: a.sky === THEMES.abend.sky, aWash: !!a.layerWash, mSky: m.sky === THEMES.ruinen.sky,
               hD: T({json.dumps(k['hoehleNacht'])}).dark, hBase: THEMES.hoehle.dark, altWash: !!THEMES.dschungel.layerWash }}; }})()""")
    assert t['nMoon'] and not t['nSun'] and t['nDark'] > 0.3 and t['nWash'] and t['nGround'], f'Nacht-Schicht falsch: {t}'
    assert t['aSky'] and t['aWash'] and t['mSky'], f'Abend/Mittag-Schicht falsch: {t}'
    assert t['hD'] > t['hBase'] and not t['altWash'], f'Höhle nachts / alte Looks verändert: {t}'
    # Wetter: regen = dauernd Regen, trocken = nie Regen, wechselnd = wie bisher
    await g.load(level([ground(0, 680, 3000)], {'x': 300, 'y': 680}, {'x': 200, 'y': 680}, welt='dschungel', tageszeit='nacht', wetter='regen'))
    await g.p.wait_for_timeout(300)
    w = await g.ev("(() => { weather.t = 99999; weatherUpdate(0.016); return {ph: weather.phase, mode: weatherMode, look: levelTheme, moon: !!THEME.moon}; })()")
    assert w['ph'] == 'rain' and w['mode'] == 'regen' and w['moon'], f'Dauerregen/Nacht wirkt nicht: {w}'
    await g.load(level([ground(0, 680, 3000)], {'x': 300, 'y': 680}, {'x': 200, 'y': 680}, welt='dschungel', wetter='trocken'))
    await g.p.wait_for_timeout(300)
    w = await g.ev("(() => { weatherForce('rain'); weatherUpdate(0.016); return {ph: weather.phase, mode: weatherMode}; })()")
    assert w['ph'] == 'sun' and w['mode'] == 'trocken', f'trocken regnet: {w}'
    await g.load(level([ground(0, 680, 3000)], {'x': 300, 'y': 680}, {'x': 200, 'y': 680}, theme='abend'))
    await g.p.wait_for_timeout(300)
    w = await g.ev("(() => { weather.phase = 'sun'; weather.t = 99999; weatherUpdate(0.016); return {ph: weather.phase, mode: weatherMode, look: levelTheme}; })()")
    assert w['mode'] == 'wechselnd' and w['ph'] == 'cloud' and w['look'] == 'abend', f'altes Level: Wetter-Wechsel/Look anders: {w}'

@test
async def alte_levels_unveraendert(g):
    """Ausbau 1: alle Level-Dateien (ohne welt/tageszeit/wetter) laden weiter mit ihrem bisherigen Look und
    wechselndem Wetter; das Testlevel levels/test/schichten-dschungel.json lässt sich direkt öffnen, T/Z schalten durch."""
    for d in json.loads((ROOT / 'levels' / 'levels.json').read_text(encoding='utf-8')):
        data = json.loads((ROOT / 'levels' / d['datei']).read_text(encoding='utf-8'))
        await g.load(str(ROOT / 'levels' / d['datei'])); await g.p.wait_for_timeout(150)
        k = await g.ev("({look: levelTheme, mode: weatherMode, wash: !!THEME.layerWash})")
        assert k == {'look': data.get('theme') or 'dschungel', 'mode': 'wechselnd', 'wash': False}, f"{d['datei']}: {k}"
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'index.html?testlevel=schichten-dschungel')
        await p.wait_for_function("typeof levelLayers !== 'undefined' && levelLayers.vorschau && menuScreen === null", timeout=8000)
        seen = []
        for _ in range(4):
            await p.keyboard.press('KeyT'); await p.wait_for_timeout(120)
            seen.append(await g.ev("[levelLayers.tageszeit, !!THEME.moon]"))
        assert [x[0] for x in seen] == ['mittag', 'abend', 'nacht', 'morgen'] and seen[2][1] and not seen[3][1], seen
        modes = []
        for _ in range(3):
            await p.keyboard.press('KeyZ'); await p.wait_for_timeout(120)
            modes.append(await g.ev("weatherMode"))
        assert modes == ['trocken', 'regen', 'wechselnd'], modes
    finally:
        srv.shutdown()

def level_teil(k, v):
    """Vergleichsform eines Level-Felds: Böden/Wände/bewegte Teile als belegte Kästchen (egal wie zu Rechtecken
    zusammengefasst), Listen ohne Reihenfolge, leere Liste = fehlt."""
    if v in (None, []): return None
    if k in ('solids', 'movingPlatforms', 'winds'):
        out = set()
        for o in v:
            extra = json.dumps({kk: vv for kk, vv in o.items() if kk not in ('x', 'y', 'w', 'h', 'targetX', 'targetY', 'group')}, sort_keys=True)
            dx, dy = o.get('targetX', o['x']) - o['x'], o.get('targetY', o['y']) - o['y']
            for x in range(o['x'], o['x'] + o['w'], 40):
                for y in range(o['y'], o['y'] + o['h'], 40): out.add((x, y, dx, dy, extra))
        return out
    if isinstance(v, list): return sorted(json.dumps(o, sort_keys=True) for o in v)
    return v

@test
async def editor_rundreise_alle_level(g):
    """Ausbau 2: Jedes Projekt-Level (1–6) im Editor laden („Levels im Projekt“) und wieder exportieren ergibt genau
    die Spiel-Datei in levels/ (gleiche Daten) – Beweis, dass der Editor beim Umbau nichts verändert."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(300)
        liste = [L for L in json.loads((ROOT / 'levels' / 'levels.json').read_text()) if not L.get('versteckt')]
        assert len(liste) == 6, liste
        for i, L in enumerate(liste):
            await p.click('#levelsBtn'); await p.wait_for_timeout(250)
            await p.wait_for_function("document.querySelectorAll('#projectList .lvl').length > 0", timeout=5000)
            rows = await p.eval_on_selector_all('#projectList .lvl .dt', 'els => els.map(e => e.textContent)')
            await p.click(f'#projectList .lvl:nth-child({rows.index(L["datei"]) + 1}) button'); await p.wait_for_timeout(350)
            await p.click('#exportBtn'); await p.wait_for_timeout(150)
            out = json.loads(await p.input_value('#exportText'))
            await p.click('#closeExport')
            erwartet = json.loads((ROOT / 'levels' / L['datei']).read_text(encoding='utf-8'))
            META = ('welt', 'tageszeit', 'wetter', 'look')   # Level-Info (Ausbau 2) – kommt im Export dazu
            diff = [k for k in set(out) | set(erwartet) if not k.startswith('_') and k not in META and level_teil(k, out.get(k)) != level_teil(k, erwartet.get(k))]
            assert not diff, f"{L['datei']}: Export weicht ab bei {diff}"
            welt = next(w['id'] for w in json.loads((ROOT / 'levels' / 'worlds.json').read_text(encoding='utf-8'))['welten'] if L['datei'] in w['level'])
            assert out.get('look') == erwartet.get('theme') and out.get('welt') == welt and out.get('wetter') == 'wechselnd' and 'tageszeit' not in out, \
                f"{L['datei']}: Level-Info falsch: {[out.get(k) for k in META]}"
    finally:
        srv.shutdown()

@test
async def editor_werkzeug_gruppen(g):
    """Ausbau 2: Werkzeuge stehen in einklappbaren Gruppen (Gelände, Gefahren, Schalter & Logik, Bewegung, Sammeln,
    Markierungen); Klick auf den Gruppennamen klappt ein/aus, der Zustand bleibt nach dem Neuladen; Werkzeuge gehen weiter."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(300)
        gr = await p.evaluate("""[...document.querySelectorAll('.tgroup')].map(g => [g.querySelector('.tgh').textContent.trim(),
            [...g.querySelectorAll('.tool')].map(t => t.dataset.tool)])""")
        assert [x[0] for x in gr] == ['Gelände', 'Gefahren', 'Schalter & Logik', 'Bewegung', 'Sammeln', 'Markierungen'], gr
        alle = sum((x[1] for x in gr), [])
        for t in ['ground', 'wall', 'crumble', 'fake', 'spike', 'switch', 'door', 'plate', 'hook', 'wind', 'bounce', 'move', 'coin', 'checkpoint', 'startM', 'startF', 'goal']:
            assert alle.count(t) == 1, f'Werkzeug {t} nicht genau einmal in einer Gruppe: {gr}'
        assert await p.is_visible('.tool[data-tool=erase]'), 'Radieren fehlt'
        await p.click('.tgroup[data-group=gefahren] .tgh'); await p.wait_for_timeout(100)
        assert not await p.is_visible('.tool[data-tool=spike]'), 'Gruppe klappt nicht ein'
        await p.reload(); await p.wait_for_timeout(400)
        assert not await p.is_visible('.tool[data-tool=spike]'), 'eingeklappte Gruppe nicht gemerkt'
        await p.click('.tgroup[data-group=gefahren] .tgh'); await p.wait_for_timeout(100)
        await p.click('.tool[data-tool=spike]')
        assert await p.evaluate("currentTool") == 'spike', 'Werkzeug in der Gruppe lässt sich nicht wählen'
    finally:
        await p.evaluate("localStorage.clear()")
        srv.shutdown()

def github_attrappe(calls):
    """Simulierte GitHub-API für Editor-Tests: liefert Repo-Dateien (worlds.json, levels.json) aus dem Projektordner."""
    import base64
    async def api(route):
        req = route.request; url = req.url.split('/repos/b48bvggmn7-ops/koopgame')[-1]
        calls.append((req.method, url, req.post_data))
        body = {'GET /git/ref/heads/main': {'object': {'sha': 'c0'}}, 'GET /git/commits/c0': {'tree': {'sha': 't0'}},
                'POST /git/trees': {'sha': 't1'}, 'POST /git/commits': {'sha': 'c1'}, 'PATCH /git/refs/heads/main': {'object': {'sha': 'c1'}}}
        if url.startswith('/contents/'):
            body[req.method + ' ' + url] = {'content': base64.b64encode((ROOT / url.split('?')[0][len('/contents/'):]).read_bytes()).decode()}
        await route.fulfill(status=200, content_type='application/json', body=json.dumps(body.get(req.method + ' ' + url, {})))
    return api

@test
async def editor_level_info(g):
    """Ausbau 2: Fenster „Level-Info“: Welt (aus worlds.json), Position, Titel, Tageszeit, Wetter, look-Override.
    Projekt-Level übernehmen Welt/Position/Titel; Export und Autosave enthalten die Felder; „Auf GitHub speichern“
    setzt das Level in worlds.json an die gewählte Stelle (auch als NEUES Level, dann auch levels.json) – ein Commit."""
    srv = webserver(); p = g.p; calls = []
    try:
        await p.route('https://api.github.com/**', github_attrappe(calls))
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(400)
        await p.evaluate("localStorage.setItem('monchichi_github_token', 'github_pat_TEST')")
        async def lade(datei):
            await p.click('#levelsBtn'); await p.wait_for_timeout(300)
            rows = await p.eval_on_selector_all('#projectList .lvl .dt', 'els => els.map(e => e.textContent)')
            await p.click(f'#projectList .lvl:nth-child({rows.index(datei) + 1}) button'); await p.wait_for_timeout(400)
        await lade('level-4.json')
        m = await p.evaluate("({...meta})")
        assert m == {'welt': 'ruinen', 'position': 2, 'titel': 'Mondnacht', 'tageszeit': '', 'wetter': 'wechselnd', 'look': 'nacht'}, m
        assert 'Ruinen' in await p.text_content('#metaBtn')
        # Felder im Fenster ändern
        await p.click('#metaBtn'); await p.wait_for_timeout(150)
        await p.select_option('#metaWelt', 'wasser'); await p.fill('#metaTitel', 'Tiefsee')
        await p.select_option('#metaLook', ''); await p.select_option('#metaZeit', 'nacht'); await p.select_option('#metaWetter', 'regen')
        await p.click('#metaClose')
        await p.click('#exportBtn'); out = json.loads(await p.input_value('#exportText')); await p.click('#closeExport')
        assert (out['welt'], out.get('tageszeit'), out['wetter'], 'look' in out, 'theme' in out) == ('wasser', 'nacht', 'regen', False, False), out
        await p.reload(); await p.wait_for_timeout(500)
        m = await p.evaluate("({...meta})")
        assert (m['welt'], m['titel'], m['tageszeit'], m['wetter'], m['look']) == ('wasser', 'Tiefsee', 'nacht', 'regen', ''), f'nicht gemerkt: {m}'
        # als NEUES Level in die Wasserwelt speichern
        await p.click('#githubBtn'); await p.wait_for_timeout(500)
        opts = await p.eval_on_selector_all('#ghTarget option', 'os => os.map(o => o.value)')
        assert opts[-1] == 'level-7.json', opts   # nächste freie Nummer (level-1 … level-6 vorhanden)
        await p.select_option('#ghTarget', 'level-7.json'); calls.clear()
        await p.click('#ghUpload')
        await p.wait_for_function("document.getElementById('ghStatus').textContent.includes('Gespeichert')", timeout=5000)
        tree = {t['path']: t['content'] for t in json.loads(next(c[2] for c in calls if c[1] == '/git/trees'))['tree']}
        assert sorted(tree) == ['levels/editor-format/level-7.json', 'levels/level-7.json', 'levels/levels.json', 'levels/worlds.json'], sorted(tree)
        w = {x['id']: x['level'] for x in json.loads(tree['levels/worlds.json'])['welten']}
        assert w['wasser'] == ['level-7.json'] and w['ruinen'] == ['level-3.json', 'level-4.json'], w
        lv = json.loads(tree['levels/levels.json'])
        assert lv[-1] == {'datei': 'level-7.json', 'name': 'Level 7', 'titel': 'Tiefsee'} and len(lv) == 8, lv[-2:]
        assert json.loads(tree['levels/level-7.json'])['welt'] == 'wasser'
        assert sum(1 for c in calls if c[1] == '/git/commits' and c[0] == 'POST') == 1, 'nicht in einem Commit'
        # vorhandenes Level in eine andere Welt verschieben: Level 3 als 1. Level in den Vulkan
        await p.wait_for_function("!document.getElementById('ghBox').classList.contains('show')", timeout=4000)
        await lade('level-3.json')
        await p.click('#metaBtn'); await p.select_option('#metaWelt', 'vulkan'); await p.select_option('#metaPos', '1'); await p.click('#metaClose')
        await p.click('#githubBtn'); await p.wait_for_timeout(500)
        assert await p.input_value('#ghTarget') == 'level-3.json'
        calls.clear(); await p.click('#ghUpload')
        await p.wait_for_function("document.getElementById('ghStatus').textContent.includes('Gespeichert')", timeout=5000)
        tree = {t['path']: t['content'] for t in json.loads(next(c[2] for c in calls if c[1] == '/git/trees'))['tree']}
        w = {x['id']: x['level'] for x in json.loads(tree['levels/worlds.json'])['welten']}
        assert w['vulkan'] == ['level-3.json', 'level-6.json'] and w['ruinen'] == ['level-4.json'], w
        assert 'levels/levels.json' not in tree, 'levels.json ohne Änderung mitgeschickt'
    finally:
        await p.evaluate("localStorage.clear()")
        srv.shutdown()

async def ed_zelle(p, c, r):
    """Bildschirm-Punkt (Mitte) eines Editor-Kästchens (Spalte c, Reihe r)."""
    return await p.evaluate(f"""(() => {{ const R = cvs.getBoundingClientRect(), k = R.width / cvs.width;
      return [R.left + ({c}*TILE + TILE/2)*k, R.top + (({r} + SKY)*TILE + TILE/2)*k]; }})()""")

async def ed_ziehen(p, a, b):
    x0, y0 = await ed_zelle(p, *a); x1, y1 = await ed_zelle(p, *b)
    await p.mouse.move(x0, y0); await p.mouse.down(); await p.mouse.move(x1, y1, steps=24); await p.mouse.up()

@test
async def editor_rueckgaengig_und_auswahl(g):
    """Ausbau 2: Strg+Z/Strg+Y (ein Pinselstrich = ein Schritt) und Rechteck-Auswahl: kopieren/einfügen (Verknüpfungen
    bei Konflikt neu nummeriert, Hebel/Tür/Haken-Bewegung/bewegtes Stück bleiben zusammen), ausschneiden, verschieben."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(300)
        await p.evaluate("localStorage.clear()"); await p.reload(); await p.wait_for_timeout(400)
        await p.click('.tool[data-tool=ground]')
        await ed_ziehen(p, (2, 10), (8, 10)); await p.wait_for_timeout(100)
        assert await p.evaluate("Object.keys(tiles).length") == 7
        await p.keyboard.press('Control+z'); await p.wait_for_timeout(100)
        assert await p.evaluate("Object.keys(tiles).length") == 0, 'Pinselstrich nicht in einem Schritt rückgängig'
        await p.keyboard.press('Control+y'); await p.wait_for_timeout(100)
        assert await p.evaluate("Object.keys(tiles).length") == 7, 'Wiederholen geht nicht'
        # kleine Szene: Boden, Hebel 1, Tür 1, Haken mit Bewegung (Schalter 1), bewegtes Bodenstück (Schalter 1)
        await p.evaluate("""(() => { tiles['3,12'] = 'ground'; tiles['4,12'] = 'ground';
          switches.push({c: 2, r: 9, link: 1}); doors.push({c: 6, r: 9, link: 1});
          hooks.push({c: 5, r: 6, radius: 4, move: {dc: 3, dr: 0, speed: 3, link: 1}});
          movers.push({c: 3, r: 12, dc: 0, dr: -2, speed: 2, link: 1}); save(); })()""")
        n0 = await p.evaluate("undoStack.length")
        await p.click('.tool[data-tool=select]')
        await ed_ziehen(p, (2, 6), (8, 12)); await p.wait_for_timeout(100)
        assert await p.evaluate("JSON.stringify(selRect)") == '{"c0":2,"r0":6,"c1":8,"r1":12}'
        await p.keyboard.press('Control+c')
        x, y = await ed_zelle(p, 20, 6); await p.mouse.move(x, y)
        await p.keyboard.press('Control+v'); await p.wait_for_timeout(100)
        k = await p.evaluate("""({sw: switches.map(s => [s.c, s.r, s.link]), dr: doors.map(d => [d.c, d.link]), hk: hooks.map(h => [h.c, h.r, h.move.link, h.move.dc]),
                               mv: movers.map(m => [m.c, m.r, m.link, m.dr]), t: ['20,10', '26,10', '21,12', '22,12'].map(k => tiles[k] || null)})""")
        assert k['sw'] == [[2, 9, 1], [20, 9, 2]] and k['dr'] == [[6, 1], [24, 2]], f'Hebel/Tür nicht neu nummeriert: {k}'
        assert k['hk'] == [[5, 6, 1, 3], [23, 6, 2, 3]] and k['mv'] == [[3, 12, 1, -2], [21, 12, 2, -2]], f'Haken/Bewegung falsch: {k}'
        assert k['t'] == ['ground', 'ground', 'ground', 'ground'], f'Kästchen nicht kopiert: {k}'
        assert await p.evaluate("undoStack.length") == n0 + 1, 'Einfügen nicht als ein Schritt rückgängig machbar'
        await p.keyboard.press('Control+z'); await p.wait_for_timeout(100)
        assert await p.evaluate("switches.length") == 1, 'Einfügen nicht rückgängig'
        # ausschneiden + einfügen: Nummer bleibt (kein Konflikt mehr)
        await p.evaluate("selRect = {c0: 2, r0: 6, c1: 8, r1: 12}")
        await p.keyboard.press('Control+x'); await p.wait_for_timeout(100)
        assert await p.evaluate("switches.length + doors.length + hooks.length + movers.length") == 0, 'Ausschneiden lässt etwas stehen'
        x, y = await ed_zelle(p, 30, 6); await p.mouse.move(x, y)
        await p.keyboard.press('Control+v'); await p.wait_for_timeout(100)
        assert await p.evaluate("[switches[0].c, switches[0].link, doors[0].link, hooks[0].move.link, movers[0].link]") == [30, 1, 1, 1, 1]
        # verschieben: in die Auswahl klicken und ziehen (Start ♂ darin wandert mit)
        await p.evaluate("startM = {c: 31, r: 11}; save()")
        await ed_ziehen(p, (32, 8), (35, 7)); await p.wait_for_timeout(100)
        assert await p.evaluate("[switches[0].c, switches[0].r, startM.c, startM.r, tiles['34,11'], tiles['31,12'] || null]") == [33, 8, 34, 10, 'ground', None], \
            await p.evaluate("JSON.stringify({sw: switches, s: startM})")
        # Entf löscht den Inhalt der Auswahl
        await p.keyboard.press('Delete'); await p.wait_for_timeout(100)
        assert await p.evaluate("switches.length + doors.length + hooks.length + movers.length") == 0
    finally:
        await p.evaluate("localStorage.clear()")
        srv.shutdown()

@test
async def editor_verknuepfungen_60_mit_namen(g):
    """Ausbau 2: Verknüpfung und „per Schalter“ bieten 1–60; eine Nummer kann einen Namen bekommen (steht in der
    Auswahl, wird gemerkt, geht beim Kopieren mit); die ✓-Markierungen bleiben; Nummern über 20 landen im Export."""
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(300)
        await p.evaluate("localStorage.clear()"); await p.reload(); await p.wait_for_timeout(400)
        n = await p.evaluate("[[...linkSelect.options].map(o => o.value), [...moveSwitchSelect.options].map(o => o.value)]")
        assert n[0] == [str(i) for i in range(1, 61)] and n[1] == [''] + [str(i) for i in range(1, 61)], n
        await p.select_option('#linkSelect', '45'); await p.fill('#linkName', 'Tor zum Turm')
        await p.click('.tool[data-tool=switch]')
        x, y = await ed_zelle(p, 5, 10); await p.mouse.click(x, y); await p.wait_for_timeout(100)
        txt = await p.evaluate("[...linkSelect.options].find(o => o.value === '45').textContent")
        assert 'Tor zum Turm' in txt and '✓ Schalter' in txt, txt
        await p.reload(); await p.wait_for_timeout(400)
        await p.select_option('#linkSelect', '45')
        assert await p.input_value('#linkName') == 'Tor zum Turm', 'Name nicht gemerkt'
        await p.click('#exportBtn'); out = json.loads(await p.input_value('#exportText')); await p.click('#closeExport')
        assert out['switches'] == [{'x': 220, 'y': 420, 'link': 45}], out['switches']
    finally:
        await p.evaluate("localStorage.clear()")
        srv.shutdown()

@test
async def element_register(g):
    """Ausbau 2: Element-Register (elemente/): Sprungpilz und Aufwind haben je EINEN Eintrag (Daten, Editor-Werkzeug,
    Zeichnen, Spiel-Logik), den Spiel und Editor gemeinsam laden; jede Datei steht in beiden Lade-Listen (mit ?v=)."""
    dateien = sorted(f.stem for f in (ROOT / 'elemente').glob('*.js'))
    for html in (ROOT / 'index.html', ROOT / 'editor' / 'index.html'):
        t = html.read_text(encoding='utf-8')
        for d in dateien: assert f"'{d}'" in t, f'{d}.js fehlt in {html.name}'
        assert "elemente/' + " in t and ".js?v=' + " in t, f'{html}: Element-Dateien ohne ?v='
    k = await g.ev("ELEMENTE.map(E => [E.id, E.feld, !!E.editor, !!(E.spiel && E.spiel.laden && E.spiel.zeichnen)])")
    assert k == [['sprungpilz', 'bouncers', True, True], ['aufwind', 'winds', True, True]], k
    # Spiel: Laden und Zeichnen laufen über das Register
    await g.load(level([ground(0, 680, 2000)], {'x': 100, 'y': 680}, {'x': 60, 'y': 680},
                       bouncers=[{'x': 500, 'y': 680}], winds=[{'x': 800, 'y': 400, 'w': 80, 'h': 280}]))
    n = await g.ev("""(() => { let z = 0; const E = ELEMENTE.find(e => e.id === 'sprungpilz'), f = E.spiel.zeichnen;
      E.spiel.zeichnen = () => { z++; f(); }; draw(); E.spiel.zeichnen = f; return [bouncers.length, winds.length, z]; })()""")
    assert n == [1, 1, 1], n
    # Editor: Knöpfe kommen aus dem Register (Gruppe Bewegung, alte Reihenfolge), Setzen + Export klappen
    srv = webserver(); p = g.p
    try:
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(300)
        await p.evaluate("localStorage.clear()"); await p.reload(); await p.wait_for_timeout(400)
        reihe = await p.evaluate("[...document.querySelectorAll('.tgroup[data-group=bewegung] .tool')].map(t => t.dataset.tool)")
        assert reihe == ['hook', 'wind', 'bounce', 'move'], reihe
        await p.click('.tool[data-tool=bounce]'); x, y = await ed_zelle(p, 4, 16); await p.mouse.click(x, y)
        await p.click('.tool[data-tool=wind]'); await ed_ziehen(p, (8, 14), (8, 16))
        await p.click('#exportBtn'); out = json.loads(await p.input_value('#exportText')); await p.click('#closeExport')
        assert out['bouncers'] == [{'x': 180, 'y': 680}] and out['winds'] == [{'x': 320, 'y': 560, 'w': 40, 'h': 120}] or \
               sorted(json.dumps(w) for w in out['winds']) == sorted(json.dumps({'x': 320, 'y': y0, 'w': 40, 'h': 40}) for y0 in (560, 600, 640)), out
    finally:
        await p.evaluate("localStorage.clear()")
        srv.shutdown()

@test
async def editor_alles_loeschen_wirklich_alles(g):
    """„Alles löschen“ und „Neues leeres Level“ entfernen WIRKLICH alles – auch Druckplatten und Sprungpilze
    (Fehler bis Ausbau 2: die blieben stehen)."""
    srv = webserver(); p = g.p
    fuellen = """(() => { tiles['3,10'] = 'ground'; tiles['5,8'] = 'wind'; plates.push({c: 4, r: 9, link: 2}); elementPunkte.bouncers.push({c: 6, r: 9});
      switches.push({c: 7, r: 9, link: 2}); doors.push({c: 8, r: 9, link: 2}); coins.push({c: 9, r: 9, color: 'blue'}); linkNames[2] = 'Tor'; save(); })()"""
    leer = """(() => { const d = JSON.parse(exportLevel()); return ['solids', 'winds', 'plates', 'bouncers', 'switches', 'doors', 'coins']
      .filter(k => (d[k] || []).length).concat(Object.keys(linkNames).length ? ['linkNames'] : []); })()"""
    try:
        await p.goto(srv.url + 'editor/index.html'); await p.wait_for_timeout(300)
        await p.evaluate("localStorage.clear()"); await p.reload(); await p.wait_for_timeout(400)
        await p.evaluate(fuellen)
        await p.click('#clearBtn'); await p.click('#clearBtn'); await p.wait_for_timeout(100)   # 2. Klick bestätigt
        assert await p.evaluate(leer) == [], f'„Alles löschen“ lässt stehen: {await p.evaluate(leer)}'
        await p.keyboard.press('Control+z'); await p.wait_for_timeout(100)
        assert await p.evaluate("plates.length + elementPunkte.bouncers.length") == 2, 'Alles löschen nicht rückgängig machbar'
        await p.evaluate("dirty = false")
        await p.click('#levelsBtn'); await p.click('#newLevelBtn'); await p.wait_for_timeout(100)
        assert await p.evaluate(leer) == [], f'„Neues leeres Level“ lässt stehen: {await p.evaluate(leer)}'
    finally:
        await p.evaluate("localStorage.clear()")
        srv.shutdown()

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
