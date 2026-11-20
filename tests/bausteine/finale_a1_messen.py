# tests/bausteine/finale_a1_messen.py – misst die knappen Stellen des Rätsels am Ende von Abschnitt 1 (finale_a1.py) mit echter Physik:
# je Stelle ein Raster aus Absprung-Ort und Tasten-Zeitpunkt; Ergebnis = bei welchen es klappt (= wie groß das Zeitfenster ist),
# dazu Gegenproben (nur Dash / nur Sprung / vom Boden aus). Aufruf: python tests/bausteine/finale_a1_messen.py [L T]
import asyncio, functools, http.server, json, sys, threading
from pathlib import Path
from playwright.async_api import async_playwright
sys.path.insert(0, str(Path(__file__).resolve().parent))
import finale_a1_loesung as LS
from finale_a1 import S
ROOT = LS.ROOT
MESS = r"""
window.M = (() => {
  const T = 40, B = 640, X = c => c*T + T/2;
  // die andere Figur kommt mit (am Boden darunter): die beiden dürfen höchstens 40 Kästchen auseinander sein
  const setz = (P, x, y) => { for(const Q of [P === p1 ? p2 : p1, P]){ Q.x = Q._px = x; Q.y = Q._py = Q === P ? y : 640; Q.vx = Q.vy = 0; Q.grounded = true; } };
  // nur das Rätsel zurücksetzen (resetLevel startet die Start-Szene am Level-Anfang)
  const neu = () => { F.los(); for(let k = 60; k <= 80; k++) if(linkOn[k]) setLink(k, false);
    for(const b of rammbalken){ b.tief = 0; b.phase = 'ruhe'; b.t = 0; rammSolidSetzen(b); }
    for(const w of windraeder){ w.dreh = 0; w.gezaehlt = false; }
    for(const s of blattFloesse){ s.x = s.x0; s.y = s.y0; s.v = 0; s.vy = 0; }
    for(const P of [p1, p2]){ P.dash = null; P.dashPunkte = 1; P.dashPause = 0; P.vx = P.vy = 0; P.puste = 1; P.pusteLeer = false; P.pustePause = 0; P.pusteAn = false; P.gliding = false; }
    };
  // Sprung auf etwas: Start x0, Richtung dir, springt nach vor Schritten Anlauf, hält Sprung, Erfolg(P)
  const sprung = (P, x0, y0, dir, vor, ok, max) => { neu(); setz(P, x0, y0); F.n(4); const d = dir > 0 ? 'right' : 'left';
    F.an(P, d); F.n(vor); F.an(P, 'jump'); let i = 0, gut = false; while(i++ < (max || 90)){ F.st(); if(i > 3 && P.grounded){ break; } } F.aus(P, 'jump'); F.aus(P, d); F.n(8); return ok(P); };
  // Sprung + Dash: wie oben, nach dashNach Schritten in der Luft Dash in Richtung taste ('' = Laufrichtung)
  const sprungDash = (x0, y0, dir, vor, dashNach, taste, ok) => { neu(); const P = p2; setz(P, x0, y0); F.n(4); P.dashPunkte = 1; P.dashPause = 0; const d = dir > 0 ? 'right' : dir < 0 ? 'left' : null;
    if(d) F.an(P, d); F.n(vor); F.an(P, 'jump'); F.n(dashNach); if(taste){ if(d) F.aus(P, d); F.an(P, taste); } F.an(P, 'dash'); F.st(); F.aus(P, 'dash'); F.n(3); F.los(); F.n(50); return ok(); };
  return {T, B, X, neu, setz, sprung, sprungDash};
})();
"""
STELLEN = [
 ('L  Luke 1: Schweinchen allein hinauf (Sprung + Dash nach oben) – bei welchem Dash-Zeitpunkt, je Abstand von der Lukenmitte', r"""(() => { const out = {}, T = 40, mitte = (%(luke1)s + 1)*T;
     for(const vers of [0, 10, 20, 27]){ const gut = [];
       for(let dn = 8; dn <= 30; dn++){ M.neu(); M.setz(p2, mitte + vers, 640); p1.x = p1._px = mitte - 160; F.n(4); F.an(p2, 'jump'); F.n(dn); F.an(p2, 'swimUp'); F.an(p2, 'dash'); F.st(); F.aus(p2, 'dash');
         let i = 0; while(i++ < 120){ if(p2.y < 404){ F.aus(p2, 'swimUp'); F.an(p2, 'right'); } F.st(); if(i > 12 && p2.grounded) break; } F.los(); F.n(10);
         if(p2.grounded && Math.abs(p2.y - 400) < 2) gut.push(dn); }
       out['abstand ' + vers] = gut; }
     return out; })()"""),
 ('T  Luke 1: Affe über den Schirm hinauf – Schweinchen-Platz (Versatz) und Abstand des Affen', r"""(() => { const out = {}, T = 40, mitte = (%(luke1)s + 1)*T;
     for(const sv of [-15, 0, 15]) for(const ab of [0, 30, 45]){ M.neu(); M.setz(p2, mitte + sv, 640); p1.x = p1._px = mitte + sv - ab; p1.y = p1._py = 640; F.n(4); F.an(p2, 'trampolin'); F.n(45); F.an(p1, 'jump'); if(ab) F.an(p1, 'right'); F.n(2); F.aus(p1, 'right');
       let i = 0, boing = false; while(i++ < 200){ if(p1.vy < -15) boing = true; if(boing && p1.y < 430) F.an(p1, 'left'); F.st(); if(boing && i > 30 && p1.grounded) break; } F.los(); F.n(10);
       out['schwein ' + sv + ', affe ' + ab] = p1.grounded && Math.abs(p1.y - 400) < 2; }
     M.neu(); M.setz(p1, mitte, 640); F.n(4); F.an(p1, 'jump'); let m = 640; for(let i = 0; i < 80; i++){ F.st(); m = Math.min(m, p1.y); } F.los(); out.affeAlleinHoehe_px = Math.round(640 - m);
     return out; })()"""),
]
async def main():
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(LS.Leise, directory=str(ROOT)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'])
        p = await b.new_page(viewport={'width': 1280, 'height': 720})
        fehler = []; p.on('pageerror', lambda e: fehler.append(str(e)))
        await p.goto(f'http://127.0.0.1:{srv.server_address[1]}/index.html?testlevel=koop-aktionen'); await p.wait_for_timeout(3000)
        await p.evaluate("""async () => { window.baumIntroAus = true; const d = await (await fetch('levels/dschungel/abschnitt-1-sternschnuppenspur.json?x=' + Date.now())).json(); startLevel(d); }""")
        await p.wait_for_timeout(2500); await p.evaluate(LS.HILFEN); await p.evaluate(MESS); await p.evaluate("menuScreen = 'pause'; 0")
        nur = sys.argv[1:] 
        for name, js in STELLEN:
            if nur and name[0] not in nur: continue
            try: r = await p.evaluate(js % S)
            except Exception as e: r = 'FEHLER ' + str(e)[:300]
            print(name); print('   ', json.dumps(r, ensure_ascii=False))
        print(fehler[:3]); await b.close()
asyncio.run(main())
