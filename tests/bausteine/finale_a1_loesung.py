# tests/bausteine/finale_a1_loesung.py – spielt das Logik-Rätsel am Ende von Abschnitt 1 (tests/bausteine/finale_a1.py) mit der
# ECHTEN Spielphysik durch (feste Tasten je Schritt, stepSim) und prüft nach jedem Schritt, dass genau das Erwartete passiert ist.
# Dazu ein paar Gegenproben (Abkürzungen, die NICHT gehen dürfen). Kein Test in run_tests.py (Level-Tests laufen dort nicht mehr),
# sondern das Werkzeug, mit dem das Rätsel beim Bauen geprüft wurde:  python tests/bausteine/finale_a1_loesung.py [--bilder]
import asyncio, functools, http.server, json, sys, threading
from pathlib import Path
from playwright.async_api import async_playwright
ROOT = Path(__file__).resolve().parent.parent.parent
BILDER = '--bilder' in sys.argv
ZIELORDNER = Path(sys.argv[sys.argv.index('--bilder') + 1]) if BILDER and len(sys.argv) > sys.argv.index('--bilder') + 1 else ROOT / 'entwurf-figuren'

class Leise(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def handle_one_request(self):
        try: super().handle_one_request()
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError): pass

HILFEN = r"""
window.F = (() => {
  const T = 40, BODEN = 16*T, X = c => c*T + T/2;
  const K = P => P.keys, an = (P, k) => { const c = K(P)[k]; if(!KEYS[c]) KEYS[c + '_pressed'] = true; KEYS[c] = true; }, aus = (P, k) => { KEYS[K(P)[k]] = false; };
  const los = () => { for(const P of [p1, p2]) for(const k of Object.values(P.keys)) if(typeof k === 'string'){ KEYS[k] = false; KEYS[k + '_pressed'] = false; } };
  const st = () => stepSim(), n = k => { for(let i = 0; i < k; i++) st(); };
  const log = [];
  const sag = (was, ok, mehr) => { log.push({was, ok: !!ok, mehr}); return !!ok; };
  // laufen, bis die Figur bei Spalte c (Mitte) steht
  const lauf = (P, c, max) => { const x = typeof c === 'number' && c > 100000 ? c : X(c); let i = 0;
    while(Math.abs(P.x - x) > 22 && i++ < (max || 900)){ const d = x > P.x ? 'right' : 'left'; aus(P, d === 'right' ? 'left' : 'right'); an(P, d); st(); }
    aus(P, 'left'); aus(P, 'right'); n(10);
    // die letzten Pixel antippen (nach dem Loslassen rutscht die Figur noch ein Stück)
    for(let k = 0; k < 14 && Math.abs(P.x - x) > 5; k++){ const d = x > P.x ? 'right' : 'left'; an(P, d); st(); aus(P, d); n(9); }
    return Math.abs(P.x - x) <= 12; };
  const tuerAuf = l => solids.filter(s => s.type === 'door' && s.link === l).every(s => s.gone);
  const wand = (c, r) => solids.find(s => s.type === 'wechsel' && Math.abs(s.x - c*T) < 1 && Math.abs(s.y - r*T) < 1);
  const wandOffen = c => [13, 14, 15].every(r => { const s = wand(c, r); return s && s.gone; });
  // Affe pustet k Schritte in eine Richtung ('right' | 'left' | 'hoch')
  const puste = (dir, k) => { an(p1, 'pusten'); an(p1, dir === 'hoch' ? 'pull' : dir); n(k); aus(p1, 'pusten'); aus(p1, dir === 'hoch' ? 'pull' : dir); n(4); };
  const warteWind = () => { let i = 0; while((windraeder.some(w => w.dreh > 0.1) || (p1.puste !== undefined && (p1.puste < 0.98 || p1.pusteLeer))) && i++ < 500) st(); n(10); };
  const dashBereit = () => { let i = 0; while(p2.dashPunkte < 1 && i++ < 400) st(); n(3); return p2.dashPunkte >= 1; };
  const dash = dir => { dashBereit(); if(dir) an(p2, dir); an(p2, 'dash'); st(); aus(p2, 'dash'); if(dir) aus(p2, dir); n(40); };
  // Boden-Balken bei Spalte c stampfen: daneben stellen, hochspringen, über der Stirnseite nach unten dashen
  const stampf = c => { dashBereit(); lauf(p2, X(c) - 44); an(p2, 'jump'); an(p2, 'right'); st(); let i = 0, ok = false;
    while(i++ < 60){ if(i > 6) aus(p2, 'jump'); if(Math.abs(p2.x - X(c)) < 7 && !p2.grounded){ aus(p2, 'right'); an(p2, 'swimDown'); an(p2, 'dash'); st(); aus(p2, 'dash'); ok = true; break; } st(); }
    n(8); aus(p2, 'swimDown'); aus(p2, 'jump'); aus(p2, 'right'); n(50); return ok; };
  // über einen Boden-Balken (Pfosten) bei Spalte c springen: davor stellen, Anlauf, Sprung
  const ueber = (P, c) => { if(P.x > X(c) + 16) return true; lauf(P, X(c) - 60); an(P, 'right'); n(6); an(P, 'jump'); let i = 0; while(P.x < X(c) + 34 && i++ < 80) st(); aus(P, 'jump'); n(14); aus(P, 'right'); n(14); return P.x > X(c) + 16; };
  // Sprung: Richtung dir halten, springen, bis gelandet
  const sprung = (P, dir) => { const d = dir > 0 ? 'right' : 'left'; an(P, d); an(P, 'jump'); let i = 0; while(i++ < 120){ st(); if(i > 3 && P.grounded) break; } aus(P, 'jump'); aus(P, d); n(8); };
  // Weitsprung von einer Kante: bis zur Kante laufen (kanteX = x der Kante), genau dort abspringen
  const weitsprung = (P, dir, kanteX) => { const d = dir > 0 ? 'right' : 'left'; an(P, d); let i = 0; while(i++ < 200 && (dir > 0 ? P.x + P.w/2 < kanteX - 3 : P.x - P.w/2 > kanteX + 3)) st();
    an(P, 'jump'); i = 0; while(i++ < 140){ st(); if(i > 3 && P.grounded) break; } aus(P, 'jump'); aus(P, d); n(8); };
  // Schweinchen: Sprung + Dash nach dn Schritten in der Luft (taste '' = Laufrichtung, 'swimUp' = nach oben)
  const sprungDash = (dir, dn, taste) => { dashBereit(); const d = dir > 0 ? 'right' : dir < 0 ? 'left' : null; if(d) an(p2, d); an(p2, 'jump'); n(dn);
    if(taste){ if(d) aus(p2, d); an(p2, taste); } an(p2, 'dash'); st(); aus(p2, 'dash'); n(3); aus(p2, 'jump'); if(d) aus(p2, d); if(taste) aus(p2, taste); n(50); };
  // Affe pustet nach oben, k Schritte
  const pusteHoch = k => { an(p1, 'pusten'); an(p1, 'pull'); n(k); aus(p1, 'pusten'); aus(p1, 'pull'); n(4); };
  // Schirm-Trampolin: Schweinchen steht bei x, Affe springt von links auf den Schirm und steuert oben nach rechts
  const trampolin = (x, obenY) => { lauf(p2, x); lauf(p1, x - 45); an(p2, 'trampolin'); n(45); an(p1, 'right'); an(p1, 'jump'); n(2); aus(p1, 'right'); let i = 0, boing = false;
    while(i++ < 160){ if(p1.vy < -15) boing = true; if(boing){ if(p1.y < obenY + 70 && p1.x < x + 70) an(p1, 'right'); else aus(p1, 'right'); } st(); if(boing && p1.grounded) break; }
    aus(p1, 'right'); aus(p1, 'jump'); aus(p2, 'trampolin'); n(20); return p1.grounded && Math.abs(p1.y - obenY) < 2; };
  const hebel = P => { an(P, 'use'); st(); aus(P, 'use'); n(25); };
  const stell = (P, c, y) => { P.x = P._px = X(c); P.y = P._py = y || BODEN; P.vx = P.vy = 0; };
  const zustand = () => ({affe: [Math.round(p1.x/T*10)/10, Math.round(p1.y)], schwein: [Math.round(p2.x/T*10)/10, Math.round(p2.y)], tot: !!deathState,
    an: Object.keys(linkOn).filter(k => linkOn[k] && k >= 66).join(',')});
  return {T, BODEN, X, an, aus, los, st, n, log, sag, lauf, tuerAuf, wandOffen, puste, warteWind, dash, dashBereit, stampf, ueber, hebel, stell, zustand, sprung, weitsprung, sprungDash, pusteHoch, trampolin};
})();
"""

# Der Lösungsweg in Etappen (nach jeder gibt es ein Bild). Jede Etappe ist ein JS-Stück, das F.sag(...) für jede Prüfung ruft.
# %(name)s = Spalte aus finale_a1.S
sys.path.insert(0, str(Path(__file__).resolve().parent))
import finale_a1 as FA
from finale_a1 import S
# Helfer für die dritte Fassung (Zeit-Hindernisse + Maschine)
HILFEN2 = r"""
window.G = (() => { const T = 40, NR = [71, 72, 73, 74];
  const an = () => NR.map((n, i) => linkOn[n] ? 'ABCD'[i] : '').join('');
  const raum = P => { const c = P.x/T, e = P.y < 420 ? 'U' : 'G'; if(c >= %(tor)s + 2) return 'Z';
    const i = c < %(w0)s ? 0 : c < %(w0)s + 2 ? -1 : c < %(w1)s ? 1 : c < %(w1)s + 2 ? -1 : c < %(tor)s ? 2 : -1; return i < 0 ? 'Wand' : e + i; };
  const lage = () => raum(p1) + ' ' + raum(p2) + ' ' + an();
  const pruef = (was, soll) => F.sag(was + '   [' + soll + ']', lage() === soll && !deathState, lage());
  // alles zurück auf Anfang (ohne resetLevel – das startet die Start-Szene am Level-Anfang)
  const neu = () => { F.los(); for(let k = 60; k <= 80; k++) if(linkOn[k]) setLink(k, false);
    for(const b of rammbalken){ b.tief = 0; b.phase = 'ruhe'; b.t = 0; rammSolidSetzen(b); }
    for(const w of windraeder){ w.dreh = 0; w.gezaehlt = false; }
    for(const P of [p1, p2]){ P.dash = null; P.dashPunkte = 1; P.dashPause = 0; P.vx = P.vy = 0; P.puste = 1; P.pusteLeer = false; P.pustePause = 0; P.pusteAn = false; }
    F.n(40); };
  // Schweinchen: Sprung + Dash nach oben; gibt den Schritt zurück, in dem die Nummer anging (0 = nicht)
  const rammHoch = nr => { F.dashBereit(); const vor = !!linkOn[nr]; F.an(p2, 'jump'); F.n(18); F.an(p2, 'swimUp'); F.an(p2, 'dash'); F.st(); F.aus(p2, 'dash'); let i = 0, t0 = 0;
    while(i++ < 90){ F.st(); if(!t0 && !!linkOn[nr] !== vor) t0 = simSteps; if(i > 6 && p2.grounded) break; } F.los(); return t0; };
  // ohne anzuhalten nach rechts rennen und an jeder Kante (x in px) abspringen
  const rennKurs = (P, kanten, bisX) => { F.an(P, 'right'); for(const kx of kanten){ let i = 0; while(P.x + P.w/2 < kx - 3 && i++ < 300) F.st(); F.an(P, 'jump'); i = 0; while(i++ < 140){ F.st(); if(i > 3 && P.grounded) break; } F.aus(P, 'jump'); F.st(); }
    let i = 0; while(P.x < bisX && i++ < 300) F.st(); F.aus(P, 'right'); };
  // Affe pustet, bis die Nummer umschaltet
  const blas = (dir, nr, max) => { const vor = !!linkOn[nr]; F.warteWind(); const k = dir === 'hoch' ? 'pull' : dir; F.an(p1, 'pusten'); F.an(p1, k); let i = 0; while(i++ < (max || 150) && !!linkOn[nr] === vor) F.st(); F.n(3); F.aus(p1, 'pusten'); F.aus(p1, k); F.n(6); return !!linkOn[nr] !== vor; };
  const blasSchraeg = (dir, k) => { F.warteWind(); F.an(p1, 'pusten'); F.an(p1, 'pull'); F.an(p1, dir); F.n(k || 45); F.los(); F.n(6); };
  // Schweinchen allein durch die Luke (Sprung + Dash nach oben), oben nach dir
  const schweinHoch = (c, dir) => { F.dashBereit(); F.lauf(p2, (c + 1)*T + 10*dir); F.n(6); F.an(p2, 'jump'); F.n(20); F.an(p2, 'swimUp'); F.an(p2, 'dash'); F.st(); F.aus(p2, 'dash');
    const d = dir > 0 ? 'right' : 'left'; let i = 0; while(i++ < 120){ if(p2.y < 404){ F.aus(p2, 'swimUp'); F.an(p2, d); } F.st(); if(i > 12 && p2.grounded) break; } F.los(); F.n(12); return p2.y < 420; };
  // Affe über den Schirm des Schweinchens durch die Luke, oben nach dir
  const affeHoch = (c, dir) => { const x = (c + 1)*T; F.lauf(p2, x); F.lauf(p1, x); F.n(6); F.an(p2, 'trampolin'); F.n(45); F.an(p1, 'jump'); const d = dir > 0 ? 'right' : 'left'; let i = 0, boing = false;
    while(i++ < 220){ if(p1.vy < -15) boing = true; if(boing && p1.y < 430) F.an(p1, d); F.st(); if(boing && i > 30 && p1.grounded && (p1.y > 420 || Math.abs(p1.x - x) > 56)) break; } F.los(); F.n(12); return p1.y < 420; };
  // durch die offene Luke hinunter
  const runter = (P, c) => { F.lauf(P, (c + 1)*T, 300); let i = 0; while(P.y < 600 && i++ < 120) F.st(); F.n(15); return P.y > 600; };
  // über die offene Luke springen (dir = Richtung)
  const ueber = (P, c, dir) => { const d = dir > 0 ? 'right' : 'left'; F.lauf(P, dir > 0 ? c*T - 70 : (c + 2)*T + 70); F.an(P, d); let i = 0; while(i++ < 60 && (dir > 0 ? P.x + P.w/2 < c*T - 4 : P.x - P.w/2 > (c + 2)*T + 4)) F.st();
    F.an(P, 'jump'); i = 0; while(i++ < 120){ F.st(); if(i > 3 && P.grounded) break; } F.los(); F.n(12); return P.y < 420; };
  // auf einen Sims (2 breit, Spalte c) springen: von der Seite seite (+1 = von rechts) aus
  const aufSims = (P, c, seite) => { F.lauf(P, seite > 0 ? (c + 2)*T + 60 : c*T - 60); F.sprung(P, -seite); F.n(6); };
  return {an, raum, lage, pruef, neu, rammHoch, rennKurs, blas, blasSchraeg, schweinHoch, affeHoch, runter, ueber, aufSims};
})();
"""
ETAPPEN_ROH = [
 ('h1_affe_wartet_oben', r"""
   F.stell(p1, %(haeng1)s - 2); F.stell(p2, %(haeng1)s - 1); F.n(20);
   F.sag('Start: Tür H1 zu', !F.tuerAuf(66));
   F.lauf(p2, %(haeng1)s*40 + 20); F.dash('swimUp'); F.sag('Gegenprobe: Dash vom Boden rammt den hängenden Balken nicht', !linkOn[66]);
   F.an(p2, 'jump'); F.n(50); F.los(); F.n(20); F.sag('Gegenprobe: nur springen auch nicht', !linkOn[66]);
   F.lauf(p1, %(stufe1)s*40 - 60); F.sprung(p1, 1); F.sag('Affe auf der Stufe', p1.grounded && Math.abs(p1.y - 520) < 2, {y: p1.y});
   F.lauf(p1, %(stufe1)s*40 + 16); F.weitsprung(p1, 1, (%(stufe1)s + 2)*40); F.sag('Weitsprung: Affe auf der Kanzel', p1.grounded && Math.abs(p1.y - 400) < 2, {x: p1.x/40, y: p1.y});
   F.lauf(p1, (%(kanzel1)s + 1)*40 + 20);"""),
 ('h1_rammen_und_rennen', r"""
   F.lauf(p2, %(haeng1)s*40 + 20); const t0 = G.rammHoch(66); F.sag('Schweinchen rammt (Sprung + Dash nach oben): 66 AN, Tür offen', t0 && linkOn[66] && F.tuerAuf(66));
   G.rennKurs(p2, [%(stufe1)s*40 - 50, (%(stufe1)s + 2)*40, (%(kanzel1)s + 2)*40], (%(tuer1)s + 2)*40 + 20); const tS = simSteps - t0;
   F.sag('Schweinchen ist rechtzeitig durch die Tür', p2.x > (%(tuer1)s + 2)*40 && linkOn[66], {schritte: tS, von: %(zeit1)s*60, x: p2.x/40, y: p2.y});
   G.rennKurs(p1, [(%(kanzel1)s + 2)*40], (%(tuer1)s + 2)*40 + 20); const tA = simSteps - t0;
   F.sag('Affe (wartete auf der Kanzel) kommt im selben Zeitfenster durch', p1.x > (%(tuer1)s + 2)*40 && linkOn[66], {schritte: tA, von: %(zeit1)s*60});
   let i = 0; while(linkOn[66] && i++ < 500) F.st(); F.n(60); F.sag('danach Tür wieder zu, beide drüben', !F.tuerAuf(66) && p1.y > 600 && p2.y > 600, {zeitfenster: simSteps - 60 - t0});"""),
 ('h2_atem_treppe', r"""
   F.lauf(p1, %(wind2)s); F.lauf(p2, %(tritt1)s*40 - 60);
   F.sag('Start: Stufen sind nicht fest', !linkOn[67]);
   F.an(p1, 'pusten'); F.an(p1, 'pull'); let i = 0; while(!linkOn[67] && i++ < 150) F.st(); const tAn = i, t0 = simSteps;
   G.rennKurs(p2, [%(tritt1)s*40 - 50, (%(tritt1)s + 2)*40, (%(tritt2)s + 2)*40], %(mauer)s*40 + 30); const tS = simSteps - t0; const oben = p2.grounded && Math.abs(p2.y - 280) < 2 && linkOn[67];
   i = 0; while(linkOn[67] && i++ < 300) F.st(); const tAus = simSteps - t0; F.los(); F.n(10);
   F.sag('Schweinchen ist auf der Mauer, bevor dem Affen die Puste ausgeht', oben, {windradBraucht: tAn, schweinBraucht: tS, pusteReichtNoch: tAus, y: p2.y});"""),
 ('h2_affe_hinterher', r"""
   F.lauf(p2, %(haeng2)s*40 + 20, 400); F.sag('Schweinchen steht drüben unter dem Balken', p2.y > 600 && p2.x > (%(mauer)s + 2)*40);
   F.warteWind(); F.lauf(p1, %(tritt1)s*40 - 60);
   const t0 = G.rammHoch(67); F.sag('Schweinchen rammt: 67 AN', t0 && linkOn[67]);
   G.rennKurs(p1, [%(tritt1)s*40 - 50, (%(tritt1)s + 2)*40, (%(tritt2)s + 2)*40], %(mauer)s*40 + 30); const tA = simSteps - t0;
   F.sag('Affe ist rechtzeitig auf der Mauer', p1.grounded && Math.abs(p1.y - 280) < 2 && linkOn[67], {schritte: tA, von: %(zeit2)s*60, y: p1.y, x: p1.x/40});
   F.lauf(p1, %(checkpoint)s, 500); F.lauf(p2, %(checkpoint)s + 1, 500); F.n(40); F.sag('beide am Checkpoint vor der Maschine', p1.y > 600 && p2.y > 600 && activeCp === checkpointDefs.length - 1, {cp: activeCp});"""),
 ('m_schalter_proben', r"""
   // jeder Schalter der Maschine: geht mit der gedachten Technik, nicht mit der einfachen
   G.neu(); F.stell(p1, %(m0)s + 4); F.stell(p2, %(m0)s + 5); F.n(20);
   F.lauf(p1, %(m0)s + 2); G.blasSchraeg('left'); F.sag('Gegenprobe Windrad A: vom Boden schräg kommt nichts in den Schacht', !linkOn[71]);
   F.lauf(p1, %(m0)s + 3); G.blasSchraeg('left'); F.sag('Gegenprobe Windrad A: schräg von weiter weg auch nicht', !linkOn[71]);
   F.stell(p1, %(m0)s); F.n(10); F.warteWind(); F.puste('hoch', 60); F.sag('Gegenprobe Windrad A: unter dem Sims nach oben pusten geht nicht', !linkOn[71]);
   G.aufSims(p1, %(sims_a)s, 1); F.sag('Affe steht auf dem Sims', p1.grounded && Math.abs(p1.y - 520) < 2, {y: p1.y, x: p1.x/40});
   F.lauf(p1, %(sims_a)s + 1); F.warteWind(); F.puste('hoch', 60); F.sag('Gegenprobe Windrad A: auf dem Sims neben dem Schacht geht es nicht', !linkOn[71]);
   F.lauf(p1, %(sims_a)s); F.sag('Windrad A: auf dem Sims unter dem Schacht nach oben pusten schaltet', G.blas('hoch', 71) && linkOn[71]);
   // U0: Rammbalken C (ragt nach rechts aus dem Klotz)
   G.neu(); F.stell(p2, %(m0)s + 5, 400); F.stell(p1, %(m0)s + 8, 400); F.n(20); const spC = (%(balken_c)s + 2)*40;
   F.lauf(p2, spC + 60); F.dash('left'); F.sag('Gegenprobe Balken C: Dash am Boden trifft nicht', !linkOn[73]);
   F.lauf(p2, spC + 100); F.sprungDash(-1, 20, ''); F.sag('Balken C: Sprung + Dash zur Seite schaltet', !!linkOn[73]);
   // U1: hängender Balken D
   G.neu(); F.stell(p2, %(haeng_d)s, 400); F.stell(p1, %(haeng_d)s + 1, 400); F.n(20);
   F.lauf(p2, %(haeng_d)s*40 + 20); F.dash('swimUp'); F.sag('Gegenprobe Balken D: Dash vom Boden reicht nicht', !linkOn[74]);
   F.sag('Balken D: Sprung + Dash nach oben schaltet', G.rammHoch(74) && linkOn[74]);
   // U2: Windrad D hoch oben
   G.neu(); F.stell(p1, %(wind_d)s, 400); F.stell(p2, %(wind_d)s + 1, 400); F.n(20);
   F.sag('Windrad D: von der oberen Etage nach oben pusten schaltet', G.blas('hoch', 74) && linkOn[74]);
   G.neu(); F.stell(p1, %(wind_d)s, 640); F.stell(p2, %(wind_d)s + 1, 640); F.n(20); F.puste('hoch', 60); F.sag('Gegenprobe Windrad D: von unten nicht', !linkOn[74]);
   G.neu();"""),
 ('m01_A_an', r"""
   F.stell(p1, %(checkpoint)s + 1); F.stell(p2, %(checkpoint)s + 2); F.n(20); G.pruef('Start in der Maschine', 'G0 G0 ');
   F.lauf(p2, %(w0)s + 4, 300); F.sag('Gegenprobe: Wand G0|G1 ist zu', p2.x < %(w0)s*40);
   G.schweinHoch(%(luke0)s, 1); F.sag('Gegenprobe: Luke 0 ist zu', p2.y > 600);
   G.aufSims(p1, %(sims_a)s, 1); F.lauf(p1, %(sims_a)s); F.sag('Affe pustet vom Sims in den Schacht', G.blas('hoch', 71)); G.pruef('A ist an', 'G0 G0 A');"""),
 ('m02_schwein_nach_G1', r"""
   F.lauf(p2, %(w0)s + 4, 500); G.pruef('Schweinchen geht durch die Wand nach G1', 'G0 G1 A');
   G.schweinHoch(%(luke1)s, -1); F.sag('Gegenprobe: Luke 1 ist zu (A an)', p2.y > 600);"""),
 ('m03_A_aus_schwein_hoch', r"""
   F.sag('Affe pustet noch einmal', G.blas('hoch', 71)); G.pruef('A ist aus – Luke 1 offen', 'G0 G1 ');
   F.sag('Schweinchen springt + dasht durch die Luke hinauf', G.schweinHoch(%(luke1)s, -1)); G.pruef('Schweinchen ist oben in U1', 'G0 U1 ');"""),
 ('m04_A_an_C_an', r"""
   F.sag('Affe pustet', G.blas('hoch', 71)); G.pruef('A an', 'G0 U1 A');
   F.lauf(p2, %(w1)s + 2, 300); F.sag('Gegenprobe: Wand U1|U2 lässt noch nicht durch (das zweite Kästchen braucht C)', p2.x < (%(w1)s + 1)*40);
   G.aufSims(p2, %(sims_c)s, 1); F.lauf(p2, %(sims_c)s); F.sag('Schweinchen steht auf dem Sims beim Hebel', p2.grounded && Math.abs(p2.y - 280) < 2, {y: p2.y, x: p2.x/40});
   F.hebel(p2); G.pruef('Hebel: C an', 'G0 U1 AC');"""),
 ('m05_schwein_rammt_B', r"""
   F.lauf(p2, %(w1)s + 2, 600); G.pruef('Schweinchen geht oben nach U2', 'G0 U2 AC');
   F.sag('Sprung über die offene Luke 2', G.ueber(p2, %(luke2)s, 1) && p2.x > (%(luke2)s + 2)*40, {x: p2.x/40, y: p2.y});
   const spB = %(balken_b)s*40 - 40; F.lauf(p2, spB - 100); F.sprungDash(1, 20, ''); G.pruef('Balken über dem Tor gerammt: B an', 'G0 U2 ABC'); F.sag('Tor noch zu (D fehlt)', !F.tuerAuf(71));"""),
 ('m06_affe_nach_G2', r"""
   F.lauf(p2, %(w1)s - 2, 600); G.pruef('Schweinchen zurück nach U1', 'G0 U1 ABC');
   F.lauf(p1, %(sims_a)s + 3, 200); F.lauf(p1, %(w0)s + 4, 600); G.pruef('Affe geht nach G1', 'G1 U1 ABC');
   F.lauf(p1, %(w1)s + 4, 400); F.sag('Gegenprobe: Wand G1|G2 lässt nicht durch (das zweite Kästchen braucht C aus)', p1.x < (%(w1)s + 1)*40); F.lauf(p1, %(w1)s - 2);
   G.aufSims(p2, %(sims_c)s, 1); F.lauf(p2, %(sims_c)s); F.hebel(p2); G.pruef('Hebel: C aus', 'G1 U1 AB');
   F.lauf(p1, %(w1)s + 4, 600); G.pruef('Affe geht nach G2', 'G2 U1 AB');
   F.hebel(p2); G.pruef('Hebel: C wieder an', 'G2 U1 ABC');"""),
 ('m07_schwein_faellt_nach_G2', r"""
   F.lauf(p2, %(w1)s + 2, 600); const spB = %(balken_b)s*40 - 40; F.lauf(p2, spB - 100, 400); G.pruef('Schweinchen oben in U2', 'G2 U2 ABC');
   F.sprungDash(1, 20, ''); G.pruef('rammt noch einmal: B aus – Luke 2 offen', 'G2 U2 AC');
   F.sag('Schweinchen lässt sich durch die Luke fallen', G.runter(p2, %(luke2)s)); G.pruef('beide unten in G2', 'G2 G2 AC');
   F.lauf(p1, (%(luke2)s + 1)*40); F.an(p1, 'jump'); F.n(60); F.los(); F.n(20); F.sag('Gegenprobe: der Affe kommt allein nicht durch die Luke', p1.y > 600);"""),
 ('m08_affe_hoch_D_an', r"""
   F.sag('Schirm-Trampolin: Affe durch die Luke hinauf', G.affeHoch(%(luke2)s, 1)); G.pruef('Affe oben in U2', 'U2 G2 AC');
   F.lauf(p1, %(wind_d)s); F.sag('Affe pustet nach oben zum Windrad D', G.blas('hoch', 74)); G.pruef('D an', 'U2 G2 ACD');"""),
 ('m09_schwein_hoch_tor', r"""
   F.sag('Schweinchen springt + dasht durch Luke 2 hinauf', G.schweinHoch(%(luke2)s, 1)); G.pruef('beide oben in U2', 'U2 U2 ACD');
   const spB = %(balken_b)s*40 - 40; F.lauf(p2, spB - 100); F.sprungDash(1, 20, ''); G.pruef('letzter Rammstoß: B an', 'U2 U2 ABCD'); F.sag('Tor offen (A + B + D)', F.tuerAuf(71));
   F.lauf(p2, %(ziel)s - 1, 600); F.lauf(p1, %(ziel)s - 1, 600); F.n(60);
   F.sag('beide durch das Tor am Ziel', p1.x > (%(tor)s + 2)*40 && p2.x > (%(tor)s + 2)*40 && !deathState, F.zustand());"""),
]

async def main():
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Leise, directory=str(ROOT)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{srv.server_address[1]}/'
    alles_ok = True
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'])
        p = await b.new_page(viewport={'width': 1920, 'height': 1080})
        fehler = []; p.on('pageerror', lambda e: fehler.append(str(e)))
        await p.goto(url + 'index.html?testlevel=koop-aktionen'); await p.wait_for_timeout(3000)
        await p.evaluate("""async () => { window.baumIntroAus = true; const d = await (await fetch('levels/dschungel/abschnitt-1-sternschnuppenspur.json?x=' + Date.now())).json(); startLevel(d); }""")
        await p.wait_for_timeout(2500)
        SS = dict(S, zeit1=FA.ZEIT_H1, zeit2=FA.ZEIT_H2)
        await p.evaluate(HILFEN); await p.evaluate(HILFEN2 % SS)
        await p.evaluate("menuScreen = 'pause'; 0")
        for name, js in [(n, j % SS) for n, j in ETAPPEN_ROH]:
            log = await p.evaluate("(() => { F.log.length = 0; try { " + js + " } catch(e){ F.sag('FEHLER im Skript: ' + e.message, false); } F.los(); return {log: F.log.slice(), z: F.zustand()}; })()")
            print(f'--- {name}   {log["z"]}')
            for e in log['log']:
                print(('   ok   ' if e['ok'] else '   NEIN ') + e['was'] + ('' if e.get('mehr') is None else '   ' + json.dumps(e['mehr'], ensure_ascii=False)))
                alles_ok = alles_ok and e['ok']
            if BILDER:
                await p.evaluate("menuScreen = null"); await p.wait_for_timeout(900); await p.evaluate("menuScreen = 'pause'"); await p.wait_for_timeout(120)
                await p.screenshot(path=str(ZIELORDNER / f'finale_{name}.png'))
            if not alles_ok: break
        print('Seitenfehler:', fehler[:3]); await b.close()
    print('\nERGEBNIS:', 'ALLES LÖSBAR, Gegenproben halten' if alles_ok else 'NOCH NICHT IN ORDNUNG')
    return 0 if alles_ok else 1

if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
