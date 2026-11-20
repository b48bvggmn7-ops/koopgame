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
from finale_a1 import S
ETAPPEN_ROH = [
 ('k0_affe_auf_die_kanzel', r"""
   F.stell(p1, %(kanzel1)s + 4); F.stell(p2, %(tuer1)s - 2); F.n(20);
   F.sag('Start: Tür 1 zu', !F.tuerAuf(66));
   // Gegenprobe: vom Boden aus (unter und neben der Kanzel) erreicht der Wind das Windrad nicht
   F.lauf(p1, %(kanzel1)s + 0.5); F.pusteHoch(40); F.lauf(p1, %(kanzel1)s - 1); F.pusteHoch(40);
   F.sag('Gegenprobe K0: vom Boden aus dreht das Windrad nicht', !F.tuerAuf(66) && !linkOn[66]); F.warteWind();
   // auf die Stufe springen, dann der Weitsprung zur Kanzel
   F.lauf(p1, %(stufe1)s*40 - 60); F.sprung(p1, 1); F.sag('Affe steht auf der Stufe', p1.grounded && Math.abs(p1.y - 520) < 2, {y: p1.y});
   F.lauf(p1, (%(stufe1)s + 2)*40 - 16); F.weitsprung(p1, -1, %(stufe1)s*40);
   F.sag('Weitsprung: Affe steht auf der Kanzel', p1.grounded && Math.abs(p1.y - 400) < 2, {x: p1.x/40, y: p1.y});"""),
 ('k0_schwein_durch', r"""
   F.lauf(p1, %(kanzel1)s + 0.5); F.an(p1, 'pusten'); F.an(p1, 'pull'); F.n(24); F.sag('Affe pustet von der Kanzel nach oben: Tür 1 offen', F.tuerAuf(66));
   F.an(p2, 'right'); let i = 0; while(p2.x < (%(tuer1)s + 2.7)*40 && i++ < 160) F.st(); F.aus(p2, 'right'); F.aus(p1, 'pusten'); F.aus(p1, 'pull'); F.n(90);
   F.sag('Schweinchen ist in K1', p2.x > (%(tuer1)s + 2)*40); F.sag('Tür 1 wieder zu', !F.tuerAuf(66));"""),
 ('k1_affe_nach', r"""
   const spitze = %(balken1)s*40 - 40;
   // Gegenproben: nur Dash am Boden bzw. nur Sprung rammt den Balken nicht
   F.lauf(p2, spitze - 60); F.dash('right'); F.sag('Gegenprobe: Dash am Boden trifft den Balken nicht', !linkOn[66]);
   F.lauf(p2, spitze - 100); F.sprungDash(1, 20, ''); F.sag('Sprung + Dash: Balken über dem Durchgang gerammt, Tür 1 offen', linkOn[66] && F.tuerAuf(66));
   F.sag('Affe läuft von der Kanzel nach', F.lauf(p1, %(tuer1)s + 3.5, 600) && p1.x > (%(tuer1)s + 2)*40);
   let i = 0; while(linkOn[66] && i++ < 700) F.st(); F.n(20); F.sag('Zeitfenster abgelaufen: Tür 1 zu, beide in K1', !F.tuerAuf(66) && p1.x > (%(tuer1)s + 2)*40 && p2.x > (%(tuer1)s + 2)*40);"""),
 ('k1_schleuse_affe', r"""
   F.sag('Schleuse am Anfang: vorn zu, hinten offen', !F.wandOffen(%(s1)s) && F.wandOffen(%(s2)s));
   F.lauf(p2, %(sims2)s); F.hebel(p2); F.sag('Gegenprobe: vom Boden aus erreicht man den Hebel nicht', !linkOn[67]);
   F.lauf(p2, (%(sims2)s + 2)*40 + 60); F.sprung(p2, -1); F.sag('Schweinchen springt (von rechts) auf den Sims', p2.grounded && Math.abs(p2.y - 520) < 2, {y: p2.y});
   F.lauf(p2, %(sims2)s); F.hebel(p2); F.sag('Hebel AN: vorn offen, hinten zu', F.wandOffen(%(s1)s) && !F.wandOffen(%(s2)s) && linkOn[67]);
   F.lauf(p1, %(s2)s + 3, 400); F.sag('Gegenprobe Schleuse: hinten bleibt zu', p1.x < %(s2)s*40);
   F.lauf(p1, %(schleuse)s); F.sag('Affe steht in der Schleuse', p1.x > (%(s1)s + 2)*40 && p1.x < %(s2)s*40);
   F.hebel(p2); F.sag('Hebel AUS: hinten offen', F.wandOffen(%(s2)s) && !F.wandOffen(%(s1)s));
   F.sag('Affe ist in K2', F.lauf(p1, %(wind2)s, 400) && p1.x > (%(s2)s + 2)*40);"""),
 ('k1_schleuse_schwein', r"""
   F.pusteHoch(40); F.sag('Affe pustet nach oben (gerade so in Reichweite): 67 AN, vorn offen', linkOn[67] && F.wandOffen(%(s1)s));
   F.sag('Schweinchen geht vom Sims in die Schleuse', F.lauf(p2, %(schleuse)s, 500) && p2.x > (%(s1)s + 2)*40);
   F.warteWind(); F.pusteHoch(40); F.sag('Affe pustet wieder: 67 AUS, hinten offen', !linkOn[67] && F.wandOffen(%(s2)s));
   F.sag('Schweinchen ist in K2', F.lauf(p2, %(wind2)s + 1, 400) && p2.x > (%(s2)s + 2)*40);"""),
 ('k2_aufzug', r"""
   const A = blattFloesse.find(s => s.link === 68);
   F.lauf(p1, %(rad)s + 0.7); F.lauf(p2, %(aufzug)s + 1); F.n(10); F.sag('Schweinchen steht auf dem Aufzug', p2.grounded && Math.abs(p2.y - A.y) < 2);
   F.an(p1, 'use'); F.an(p1, 'swimUp'); let i = 0; while(A.y > A.y1 && i++ < 500) F.st();
   F.sag('Aufzug oben, Schweinchen mit', A.y === A.y1 && Math.abs(p2.y - A.y1) < 2, {y: A.y, y1: A.y1, schwein: p2.y});
   F.an(p2, 'right'); i = 0; while(p2.x < (%(sims)s + 0.8)*40 && i++ < 200) F.st(); F.aus(p2, 'right'); F.n(6);
   F.aus(p1, 'use'); F.aus(p1, 'swimUp'); F.n(10);
   F.sag('Schweinchen steht auf dem Sims', p2.grounded && Math.abs(p2.y - 3*40) < 2 && p2.x > %(sims)s*40, {x: p2.x/40, y: p2.y});"""),
 ('k2_schwein_durch', r"""
   F.lauf(p1, %(wind3)s); F.pusteHoch(30); F.sag('Gegenprobe Tür 3: Windrad allein öffnet nicht', !F.tuerAuf(69)); F.warteWind();
   F.lauf(p2, (%(sims_bis)s + 1)*40 - 30); F.sprungDash(1, 22, '');
   F.sag('Vom Sims abgesprungen und den Balken im Flug gerammt: 69 AN', !!linkOn[69], {schwein: [p2.x/40, p2.y]});
   const t0 = simSteps; let i = 0; while(!p2.grounded && i++ < 200) F.st(); F.n(4);
   F.sag('Schweinchen ist unten gelandet, lebt', p2.y > 600 && !deathState, {y: p2.y});
   F.an(p2, 'right'); i = 0; while(p2.x < (%(tuer3)s - 2.5)*40 && i++ < 400) F.st();
   F.an(p1, 'pusten'); F.an(p1, 'pull'); i = 0; while(p2.x < (%(tuer3)s + 2.7)*40 && i++ < 300) F.st();
   F.aus(p2, 'right'); F.aus(p1, 'pusten'); F.aus(p1, 'pull'); F.n(10);
   F.sag('Schweinchen ist durch Tür 3 (in der Zeit)', p2.x > (%(tuer3)s + 2)*40, {schritte: simSteps - t0, von: 8*60, x: p2.x/40});
   i = 0; while(linkOn[69] && i++ < 700) F.st(); F.n(60); F.sag('Tür 3 wieder zu, Affe noch in K2', !F.tuerAuf(69) && p1.x < %(tuer3)s*40);"""),
 ('k2_affe_nach', r"""
   F.warteWind();
   F.lauf(p2, %(haeng3)s); F.dash('swimUp'); F.sag('Gegenprobe: Dash nach oben ohne Sprung erreicht den hängenden Balken nicht', !linkOn[69]);
   F.lauf(p2, %(haeng3)s); F.sprungDash(0, 18, 'swimUp'); F.sag('Sprung + Dash nach oben: hängender Balken gerammt, 69 AN', !!linkOn[69]);
   // das Windrad hängt gerade so in Reichweite: es läuft langsam an – erst voll drehen lassen, dann loslaufen
   F.lauf(p1, %(wind3)s); F.an(p1, 'pusten'); F.an(p1, 'pull'); F.n(70); F.sag('Windrad über dem Platz vor der Tür dreht: Tür 3 offen', F.tuerAuf(69), {an69: !!linkOn[69], an70: !!linkOn[70], balken: rammbalken.filter(b => b.link === 69).map(b => [b.phase, Math.round(b.tief*100)/100, b.staerke]), wind: windraeder.filter(w => w.link === 70).map(w => Math.round(w.dreh*100)/100), puste: p1.puste, affe: p1.x/40});
   F.aus(p1, 'pusten'); F.aus(p1, 'pull'); F.st(); F.an(p1, 'right'); let i = 0; while(p1.x < (%(tuer3)s + 2.7)*40 && i++ < 200) F.st(); F.aus(p1, 'right'); F.n(10);
   F.sag('Affe schlüpft durch Tür 3 (2 dick), bevor das Windrad ausläuft', p1.x > (%(tuer3)s + 2)*40, {x: p1.x/40});
   i = 0; while(linkOn[69] && i++ < 700) F.st(); F.n(60); F.sag('beide in K3, Tür 3 zu', !F.tuerAuf(69) && p1.x > (%(tuer3)s + 2)*40 && p2.x > (%(tuer3)s + 2)*40);
   F.warteWind(); F.lauf(p1, %(wind3b)s); F.an(p1, 'pusten'); F.an(p1, 'pull'); F.n(70);
   F.sag('von K3 aus: ein Puste-Strahl nach oben dreht beide Windräder und öffnet Tür 3 (Rückweg)', F.tuerAuf(69), {an70: !!linkOn[70], an69: !!linkOn[69]});
   F.aus(p1, 'pusten'); F.aus(p1, 'pull'); F.n(120);"""),
 ('k3_auf_die_kanzel', r"""
   F.sag('Sternentor: Weg in den Rammraum zu, Hebelkammer-Wand offen, Tor zu', !F.wandOffen(%(wa)s) && F.wandOffen(%(wb)s) && !F.tuerAuf(71));
   F.warteWind(); F.lauf(p1, %(kanzel4)s + 0.5); F.pusteHoch(40); F.lauf(p1, %(kanzel4)s - 1); F.pusteHoch(40);
   F.sag('Gegenprobe: vom Boden aus dreht das Windrad über der Kanzel nicht', !linkOn[71]);
   F.lauf(p1, %(kanzel4)s*40 - 60); F.sprung(p1, 1); F.sag('Gegenprobe: mit einem Sprung kommt der Affe nicht auf die Kanzel', !(p1.grounded && Math.abs(p1.y - 400) < 2));
   F.sag('Schirm-Trampolin: Affe steht auf der Kanzel', F.trampolin(%(kanzel4)s*40 - 20, 400), {affe: [p1.x/40, p1.y]});"""),
 ('k3_rammraum', r"""
   F.warteWind(); F.lauf(p1, %(kanzel4)s + 0.5); F.pusteHoch(40); F.sag('Affe pustet: 71 AN, Rammraum offen', linkOn[71] && F.wandOffen(%(wa)s) && !F.wandOffen(%(wb)s));
   F.lauf(p2, %(wind5)s, 700); F.sag('Gegenprobe: Hebelkammer bleibt mit 71 AN zu', p2.x < %(wb)s*40 && p2.x > (%(wa)s + 1)*40);
   F.lauf(p2, %(haeng4)s); F.sprungDash(0, 18, 'swimUp'); F.sag('Schweinchen rammt im Rammraum (Sprung + Dash nach oben): 72 AN', !!linkOn[72]);"""),
 ('k3_hebel', r"""
   F.warteWind(); F.pusteHoch(40); F.sag('Affe pustet: 71 AUS, Hebelkammer offen', !linkOn[71] && F.wandOffen(%(wb)s) && !F.wandOffen(%(wa)s));
   F.sag('Schweinchen geht in die Hebelkammer', F.lauf(p2, (%(sims4)s + 2)*40 + 60, 600) && p2.x > (%(wb)s + 2)*40);
   F.sprung(p2, -1); F.lauf(p2, %(sims4)s); F.sag('Schweinchen steht auf dem Sims beim Hebel', p2.grounded && Math.abs(p2.y - 520) < 2, {y: p2.y});
   F.hebel(p2); F.sag('Hebel: 73 AN', !!linkOn[73]); F.sag('Tor noch zu (71 fehlt)', !F.tuerAuf(71));"""),
 ('k3_affe_rammraum', r"""
   F.warteWind(); F.pusteHoch(40); F.sag('Affe pustet: 71 AN – alle drei an, Tor offen', linkOn[71] && linkOn[72] && linkOn[73] && F.tuerAuf(71));
   F.sag('Affe springt von der Kanzel und geht in den Rammraum', F.lauf(p1, %(haeng4)s, 700) && p1.x > (%(wa)s + 2)*40);
   F.lauf(p1, %(wind5)s, 400); F.sag('Gegenprobe: Affe kommt mit 71 AN nicht in die Hebelkammer', p1.x < %(wb)s*40);"""),
 ('k3_affe_hebelkammer', r"""
   const spitze = %(balken5)s*40 - 40;
   F.lauf(p2, spitze - 100); F.sprungDash(1, 20, ''); F.sag('Schweinchen rammt den Balken über dem Tor: 71 AUS', !linkOn[71]);
   F.sag('Tor wieder zu, Wand zur Hebelkammer offen', !F.tuerAuf(71) && F.wandOffen(%(wb)s));
   F.sag('Affe kommt in die Hebelkammer', F.lauf(p1, %(wind5)s, 600) && p1.x > (%(wb)s + 2)*40);"""),
 ('k3_tor', r"""
   const spitze = %(balken5)s*40 - 40;
   F.lauf(p2, spitze - 100); F.sprungDash(1, 20, ''); F.sag('Schweinchen rammt noch einmal: 71 AN', !!linkOn[71]);
   F.sag('Tor offen (71 + 72 + 73)', F.tuerAuf(71));
   F.lauf(p1, %(ziel)s - 1, 600); F.lauf(p2, %(ziel)s - 1, 600); F.n(30);
   F.sag('beide hinter dem Tor am Ziel', p1.x > (%(tor)s + 2)*40 && p2.x > (%(tor)s + 2)*40 && !deathState, F.zustand());"""),
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
        await p.evaluate(HILFEN)
        await p.evaluate("menuScreen = 'pause'; 0")
        for name, js in [(n, j % S) for n, j in ETAPPEN_ROH]:
            log = await p.evaluate("(() => { F.log.length = 0; try { " + js + " } catch(e){ F.sag('FEHLER im Skript: ' + e.message, false); } F.los(); return {log: F.log.slice(), z: F.zustand()}; })()")
            print(f'--- {name}   {log["z"]}')
            for e in log['log']:
                print(('   ok   ' if e['ok'] else '   NEIN ') + e['was'] + ('' if e['ok'] or e.get('mehr') is None else '   ' + json.dumps(e['mehr'], ensure_ascii=False)))
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
