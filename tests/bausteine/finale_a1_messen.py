# tests/bausteine/finale_a1_messen.py – misst die knappen Stellen des Rätsels am Ende von Abschnitt 1 (finale_a1.py) mit echter Physik:
# je Stelle ein Raster aus Absprung-Ort und Tasten-Zeitpunkt; Ergebnis = bei welchen es klappt (= wie groß das Zeitfenster ist),
# dazu Gegenproben (nur Dash / nur Sprung / vom Boden aus). Aufruf: python tests/bausteine/finale_a1_messen.py [A B D E F G H I]
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
 ('A  Boden -> Stufe (3 Reihen hoch), Affe', r"""(() => { let n = 0, alle = 0; const kante = %(stufe1)s*40, gut = [];
     for(let ab = 12; ab <= 90; ab += 6){ alle++; if(M.sprung(p1, kante - ab, 640, 1, 0, P => P.grounded && Math.abs(P.y - 520) < 2)){ n++; gut.push(ab); } }
     return {klappt: n, von: alle, abstand_px: gut}; })()"""),
 ('B  Stufe -> Kanzel (5 Kästchen Lücke, 3 Reihen höher), Affe', r"""(() => { let n = 0, alle = 0; const rechts = (%(stufe1)s + 2)*40, gut = [];
     for(let vor = 0; vor <= 14; vor++){ alle++; if(M.sprung(p1, rechts - 16, 520, -1, vor, P => P.grounded && Math.abs(P.y - 400) < 2 && P.x < (%(kanzel1)s + 2)*40 + 14, 120)){ n++; gut.push(vor); } }
     return {klappt: n, von: alle, anlauf_schritte: gut}; })()"""),
 ('D  K1 Balken über dem Durchgang: Sprung + Dash zur Seite, Schweinchen', r"""(() => { const spitze = %(balken1)s*40 - 40, out = {};
     for(const ab of [40, 70, 100, 130, 160]){ const gut = []; for(let dn = 2; dn <= 34; dn += 2){ if(M.sprungDash(spitze - ab, 640, 1, 0, dn, '', () => !!linkOn[66])) gut.push(dn); } out['abstand ' + ab] = gut; }
     // ohne Sprung (Dash am Boden) und nur Sprung (ohne Dash) dürfen nicht reichen
     M.neu(); M.setz(p2, spitze - 60, 640); F.n(4); p2.dashPunkte = 1; F.an(p2, 'right'); F.an(p2, 'dash'); F.st(); F.los(); F.n(40); out.nurDash = !!linkOn[66];
     M.neu(); M.setz(p2, spitze - 60, 640); F.n(4); F.an(p2, 'right'); F.an(p2, 'jump'); F.n(40); F.los(); F.n(30); out.nurSprung = !!linkOn[66];
     return out; })()"""),
 ('E  K2 Balken jenseits der Lücke: vom Sims abspringen, im Flug dashen, Schweinchen', r"""(() => { const kante = (%(sims_bis)s + 1)*40, out = {};
     for(const vor of [0, 2, 4, 6, 8]){ const gut = []; for(let dn = 6; dn <= 44; dn++){ if(M.sprungDash(kante - 14 - vor*7.2 - 2, 120, 1, vor, dn, '', () => !!linkOn[69])) gut.push(dn); } out['anlauf ' + vor] = gut; }
     M.neu(); M.setz(p2, kante - 20, 120); F.n(4); p2.dashPunkte = 1; F.an(p2, 'right'); F.an(p2, 'dash'); F.st(); F.los(); F.n(60); out.nurDashVomSims = !!linkOn[69];
     M.neu(); M.setz(p2, kante - 20, 120); F.n(4); F.an(p2, 'right'); F.an(p2, 'jump'); F.n(70); F.los(); F.n(30); out.nurSprung = !!linkOn[69]; out.lebt = !deathState;
     return out; })()"""),
 ('F  hängender Balken (Stirnseite 6 hoch): Sprung + Dash nach oben, Schweinchen', r"""(() => { const out = {};
     for(const versatz of [0, 8, 14]){ const gut = []; for(let dn = 4; dn <= 36; dn += 2){ if(M.sprungDash(%(haeng3)s*40 + 20 + versatz, 640, 0, 0, dn, 'swimUp', () => !!linkOn[69])) gut.push(dn); } out['versatz ' + versatz] = gut; }
     M.neu(); M.setz(p2, %(haeng3)s*40 + 20, 640); F.n(4); p2.dashPunkte = 1; F.an(p2, 'swimUp'); F.an(p2, 'dash'); F.st(); F.los(); F.n(50); out.nurDash = !!linkOn[69];
     return out; })()"""),
 ('I  Windräder: von der Kanzel nach oben, vom Boden nach oben (gerade so), Gegenproben', r"""(() => { const out = {}, rad = c => windraeder.filter(w => Math.abs(w.x - (c*40 + 20)) < 2);
     const blas = (x, y, n) => { M.neu(); M.setz(p1, x, y); F.n(4); F.an(p1, 'pusten'); F.an(p1, 'pull'); F.n(n || 40); const r = windraeder.map(w => w.dreh > 0.55 ? Math.round(w.x/40) + '/' + Math.round(w.y/40) : null).filter(Boolean); F.los(); return r; };
     out.kanzel1 = blas(%(kanzel1)s*40 + 20, 400); out.kanzel1_rand = blas(%(kanzel1)s*40 + 66, 400);
     out.unterKanzel1_vomBoden = blas(%(kanzel1)s*40 + 20, 640); out.nebenKanzel1_vomBoden = blas(%(kanzel1)s*40 - 30, 640);
     out.wind2_mitte = blas(%(wind2)s*40 + 20, 640); out.wind2_40daneben = blas(%(wind2)s*40 + 60, 640); out.wind2_70daneben = blas(%(wind2)s*40 + 90, 640);
     out.doppel = blas(%(wind3b)s*40 + 20, 640); out.kanzel4 = blas(%(kanzel4)s*40 + 20, 400); out.nebenKanzel4_vomBoden = blas(%(kanzel4)s*40 - 30, 640);
     return out; })()"""),
 ('H  Schirm-Trampolin -> Kanzel (6 Reihen), Affe springt von links auf den Schirm', r"""(() => { const out = {}, px = %(kanzel4)s*40 - 20, oben = 400;
     for(const ab of [30, 45, 60, 75]){ const gut = [];
       for(let los = 0; los <= 16; los += 2){ M.neu(); M.setz(p1, px - ab, 640); p2.x = p2._px = px; F.n(4); F.an(p2, 'trampolin'); F.n(45);
         F.an(p1, 'right'); F.an(p1, 'jump'); F.n(los); F.aus(p1, 'right'); let i = 0, boing = false;
         while(i++ < 140){ if(p1.vy < -15) boing = true; if(boing){ if(p1.y < 470 && p1.x < px + 70) F.an(p1, 'right'); else F.aus(p1, 'right'); } F.st(); if(boing && p1.grounded) break; }
         F.los(); F.n(10); if(p1.grounded && Math.abs(p1.y - oben) < 2) gut.push(los); }
       out['abstand ' + ab] = gut; }
     // ohne Schirm kommt der Affe nicht hinauf
     M.neu(); M.setz(p1, px - 40, 640); F.n(4); F.an(p1, 'right'); F.an(p1, 'jump'); F.n(60); F.los(); F.n(20); out.ohneSchirm = p1.grounded && Math.abs(p1.y - oben) < 2;
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
