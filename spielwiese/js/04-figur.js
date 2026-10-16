// 04-figur.js – Spielwiese: die Testfigur und ihre eigene, kleine Physik (fester Takt, ein Aufruf = ein Schritt).
// Position x, y = linke obere Ecke der Figur (Breite FIG_B, Höhe FIG_H).

const fig = {
  x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0,
  amBoden: false, coyote: 0, puffer: 0,
  wand: 0, letzteWand: 0, wandZeit: 0, sperre: 0, wandEintritt: 0, wandSprungSeite: 0, dashWand: 0, nachDashZeit: 0, dashSprungMerk: 0, wandAlter: 99, wandWarten: 0, losgelassen: false, sprungZahl: 0,
  blick: 1, sprint: 0, sprungAktiv: false,
  haengt: null, ball: null, rollWinkel: 0, laufWinkel: 0, laufWinkelVor: 0,
  hakenPuffer: 0, kette: 0,
  seil: null, hakenZiel: null, zielStrahl: null, fehlschuss: null, rutsch: 0,
  durchbruch: 0, ladung: 0,
  dash: null, luftDashes: 1, dashPuffer: 0, dashPause: 0, gleit: 0, hyperFenster: 0, nachDash: null, blitz: 0,
  sx: 1, sy: 1, svx: 0, svy: 0,          // Dehnen/Stauchen (nur Anzeige, im Takt gerechnet)
  tot: 0, station: STATIONEN[0], rueck: STATIONEN[0].start,
};
const luftDashMax = () => V.dashLuft >= 4 ? Infinity : V.dashLuft;

function figurAufPunkt(p){
  fig.x = p.c * K + K / 2 - FIG_B / 2; fig.y = p.r * K - FIG_H;
  fig.vx = fig.vy = 0; fig.px = fig.x; fig.py = fig.y;
  fig.amBoden = false; fig.coyote = fig.puffer = fig.wandZeit = fig.sperre = fig.wandWarten = fig.dashWand = fig.nachDashZeit = fig.dashSprungMerk = 0; fig.wandAlter = 99; fig.sprint = 0; fig.sprungAktiv = false;
  fig.dash = null; fig.luftDashes = luftDashMax(); fig.ladung = 0; fig.dashPuffer = fig.dashPause = fig.gleit = fig.hyperFenster = 0;
  fig.wandSprungSeite = 0; fig.seil = null; fig.fehlschuss = null; fig.rutsch = 0;
  fig.haengt = null; fig.ball = null; fig.rollWinkel = 0;
  fig.sx = fig.sy = 1; fig.svx = fig.svy = 0;
}
function zurueckSetzen(){ bruchAlleHeilen(); kristallAlleZurueck(); fig.durchbruch = 0; figurAufPunkt(fig.rueck); fig.tot = 0; schwein.da = false; ton('teleport'); kameraSpringen(); }
function zuStation(st){
  fig.station = st; fig.rueck = st.start; if(st.mech) aktiveMechanik = st.mech;
  zurueckSetzen(); hinweis('Station ' + st.nr + ': ' + st.name);
}

// ---------- Kollision mit den Kästchen ----------
function frei(x, y){   // passt die Figur mit linker oberer Ecke (x, y) hin?
  const c0 = Math.floor(x / K), c1 = Math.floor((x + FIG_B - 0.01) / K);
  const r0 = Math.floor(y / K), r1 = Math.floor((y + FIG_H - 0.01) / K);
  for(let r = r0; r <= r1; r++) for(let c = c0; c <= c1; c++) if(fest(c, r)) return false;
  return true;
}
function kollisionX(f, dx){
  if(!dx) return 0;
  const r0 = Math.floor(f.y / K), r1 = Math.floor((f.y + FIG_H - 0.01) / K);
  if(dx > 0){
    const c = Math.floor((f.x + FIG_B - 0.01) / K);
    for(let r = r0; r <= r1; r++) if(fest(c, r)){ f.x = c * K - FIG_B; return 1; }
  } else {
    const c = Math.floor(f.x / K);
    for(let r = r0; r <= r1; r++) if(fest(c, r)){ f.x = (c + 1) * K; return -1; }
  }
  return 0;
}
function kollisionY(f, dy){
  if(!dy) return 0;
  const c0 = Math.floor(f.x / K), c1 = Math.floor((f.x + FIG_B - 0.01) / K);
  if(dy > 0){
    const r = Math.floor((f.y + FIG_H - 0.01) / K);
    for(let c = c0; c <= c1; c++) if(fest(c, r)){ f.y = r * K - FIG_H; return 1; }
  } else {
    const r = Math.floor(f.y / K);
    for(let c = c0; c <= c1; c++) if(fest(c, r)){ f.y = (r + 1) * K; return -1; }
  }
  return 0;
}
// Kantenhilfe: Kopf stößt knapp an eine Ecke -> seitlich vorbeirutschen; Dash knapp gegen eine Stufe -> hinaufhüpfen
function kanteSeitlich(f, dy){
  if(!V.kantenhilfe) return false;
  for(let d = 1; d <= V.kantenPx; d++) for(const s of [1, -1]){
    if(frei(f.x + s * d, f.y) && frei(f.x + s * d, f.y + dy)){ f.x += s * d; return true; }
  }
  return false;
}
function stufeHoch(f, dx, max){
  for(let d = 1; d <= max; d++) if(frei(f.x, f.y - d) && frei(f.x + dx, f.y - d)){ f.y -= d; return true; }
  return false;
}
function kanteStufe(f, dx, max){
  if(!V.kantenhilfe || !max) return false;
  for(let d = 1; d <= max; d++) if(frei(f.x, f.y - d) && frei(f.x + dx, f.y - d)){ f.y -= d; return true; }
  return false;
}
// in kleinen Teilschritten bewegen (nie mehr als 10 px auf einmal -> kein Durchrutschen bei hohem Tempo)
function bewegen(f){
  let dx = f.vx, dy = f.vy, stossX = 0, stossY = 0;
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 10));
  for(let i = 0; i < n; i++){
    if(dx){
      const sx = dx / n;
      if(!frei(f.x + sx, f.y)){
        if(f.dash) kanteStufe(f, sx, V.kantenStufe);   // beim Dash auf die Stufe (Kantenhilfe)
        else if(f.amBoden) stufeHoch(f, sx, 16);       // Laufen: kleine Kanten (z. B. Rampe -> Block) einfach hinauf
      }
      f.x += sx; const s = kollisionX(f, dx); if(s){ stossX = s; dx = 0; }
    }
    if(dy){
      const sy = dy / n;
      if(sy < 0 && !frei(f.x, f.y + sy)) kanteSeitlich(f, sy);
      f.y += sy; const s = kollisionY(f, dy); if(s){ stossY = s; dy = 0; }
    }
  }
  return {stossX, stossY};
}
function bodenUnter(f){
  const r = Math.floor((f.y + FIG_H + 0.5) / K), c0 = Math.floor(f.x / K), c1 = Math.floor((f.x + FIG_B - 0.01) / K);
  for(let c = c0; c <= c1; c++) if(fest(c, r)) return true;
  return false;
}
function wandNeben(f, seite, reichweite){   // reichweite: wie weit neben der Figur noch „Wand“ zählt (Spiel: 4 px)
  const d = reichweite || 0.5;
  const c = seite > 0 ? Math.floor((f.x + FIG_B + d) / K) : Math.floor((f.x - d) / K);
  const r0 = Math.floor((f.y + 4) / K), r1 = Math.floor((f.y + FIG_H - 4) / K);
  for(let r = r0; r <= r1; r++) if(fest(c, r)) return true;
  return false;
}
function stachelTreffer(f){
  const x0 = f.x + 3, x1 = f.x + FIG_B - 3, y0 = f.y + 3, y1 = f.y + FIG_H - 2;
  for(let r = Math.floor(y0 / K); r <= Math.floor(y1 / K); r++)
    for(let c = Math.floor(x0 / K); c <= Math.floor(x1 / K); c++)
      if(zelle(c, r) === '^' && x1 > c * K + 6 && x0 < c * K + K - 6 && y1 > r * K + 18) return true;
  return false;
}

// ---------- Sprünge ----------
// Zeitfenster des Spiels in Schritten (Spiel rechnet in echten ms, 54 Schritte/s): Controller-Wandsprung 250 ms,
// ✕ an der Wand gedrückt, Stick zeigt noch nicht weg: Sprung wartet 150 ms
const WAND_PAD_FENSTER = 14, WAND_PAD_WARTEN = 8;
function springen(){
  const mond = MECHANIKEN.sprung.aktiv === 3;
  fig.vy = -V.sprungKraft * (mond ? V.mondKraft : 1);
  fig.amBoden = false; fig.coyote = 0; fig.puffer = 0; fig.sprungAktiv = true; fig.losgelassen = false; fig.sprungZahl++;
  dehnen(fig, 0.72, 1.32); staubWolke(fig.x + FIG_B / 2, fig.y + FIG_H, 6, 0); ton('sprung');
}
function wandSprungMoeglich(rx){
  if(!V.wandsprung) return false;
  // nach einem Dash gegen die Wand: Wandsprung immer (Richtung egal, auch dieselbe Wandseite nochmal)
  if(V.dashWandsprung && fig.dashWand > 0 && fig.wand){ fig.letzteWand = fig.wand; return true; }
  if(MECHANIKEN.wand.aktiv === 1){
    // genau wie im Spiel (js/08-figur-physik-seil.js): Tastatur nur, solange die Wand berührt wird; Controller darf die
    // Wand bis 250 ms (14 Schritte) vorher berührt haben. Taste von der Wand weg, je Seite einmal, nicht aus dem Stand.
    let seite = fig.wand;
    if(!seite && fig.padSprung && fig.wandAlter <= WAND_PAD_FENSTER) seite = fig.letzteWand;
    if(!seite || rx !== -seite || seite === fig.wandSprungSeite || fig.wandEintritt <= 1.3) return false;
    fig.letzteWand = seite;
    return true;
  }
  if(fig.wandZeit <= 0) return false;
  return true;
}
function wandSpringen(){
  const s = fig.letzteWand;
  if(MECHANIKEN.wand.aktiv === 1){
    const m = Math.min(1, fig.wandEintritt / V.sprintTempo);   // 0 = ohne Schwung, 1 = voller Sprint
    fig.vx = -s * mischen(V.wandSpielXmin, V.wandSpielXmax, m);
    fig.vy = -mischen(V.wandSpielYmin, V.wandSpielYmax, m);
    fig.wandSprungSeite = s;
  } else { fig.vx = -s * V.wandSprungX; fig.vy = -V.wandSprungY; }
  const spiel = MECHANIKEN.wand.aktiv === 1;
  fig.blick = -s; fig.sperre = spiel ? V.wandSpielSperre : V.wandSperre; fig.wandZeit = 0; fig.puffer = 0; fig.wandWarten = 0;
  fig.wandAlter = 99; fig.dashWand = 0; fig.dashSprungMerk = 0; fig.sprungAktiv = !spiel; fig.losgelassen = false; fig.sprungZahl++;
  dehnen(fig, 0.75, 1.28); staubWolke(s > 0 ? fig.x + FIG_B : fig.x, fig.y + FIG_H / 2, 6, -s);
  trefferStopp(1); wackeln(0.12); ton('wand');
}

// ---------- Dash (Teil 2) ----------
function dashRichtung(){
  const r = richtungLesen();
  let dx = Math.abs(r.x) > 0.35 ? Math.sign(r.x) : 0, dy = Math.abs(r.y) > 0.35 ? Math.sign(r.y) : 0;
  if(!dx && !dy && seilFest() && Math.hypot(fig.vx, fig.vy) > 3){   // aus dem Schwung: in Flugrichtung (8 Richtungen)
    const w = Math.round(Math.atan2(fig.vy, fig.vx) / (Math.PI / 4)) * Math.PI / 4;
    dx = Math.round(Math.cos(w)); dy = Math.round(Math.sin(w));
  }
  if(!dx && !dy) dx = fig.blick;
  const risseUnten = zelle(Math.floor((fig.x + FIG_B / 2) / K), Math.floor((fig.y + FIG_H + 1) / K)) === 'x';
  if(fig.amBoden && dy > 0 && !dx && !risseUnten) dx = fig.blick;   // am Boden nach unten: flach (außer auf Rissen)
  const l = Math.hypot(dx, dy);
  return {dx: dx / l, dy: dy / l};
}
function dashKannStarten(){
  if(fig.dash || fig.dashPause > 0) return false;
  if(V.dashLangsam) return fig.luftDashes > 0 || fig.durchbruch > 0;   // langsames Aufladen: jeder Dash kostet
  return fig.amBoden || fig.luftDashes > 0 || fig.durchbruch > 0;
}
function dashStarten(){
  if(fig.ball && !rollenBeenden()) return;   // aus dem Rollen: erst aufstehen
  fig.haengt = null;
  const {dx, dy} = dashRichtung();
  if(fig.seil) seilLoesen(false);   // Dash aus dem Schwung: Seil los
  if(fig.durchbruch > 0) fig.durchbruch = 0;   // Anschluss-Dash im Durchbruch-Fenster: kostet nichts
  else if(!fig.amBoden || V.dashLangsam) fig.luftDashes--;
  const extra = Math.max(0, fig.vx * dx + fig.vy * dy);   // Schwung davor in Dash-Richtung (für Durchbruch C)
  fig.dash = {zeit: V.dashDauer, dx, dy, startBoden: fig.amBoden, extra, faktor: 1};
  fig.dashPuffer = 0; fig.sprungAktiv = false; fig.gleit = 0; fig.hyperFenster = 0; fig.sperre = 0;
  if(dx) fig.blick = Math.sign(dx);
  fig.vx = dx * V.dashTempo; fig.vy = dy * V.dashTempo;
  // in Dash-Richtung gestreckt
  if(Math.abs(dx) > Math.abs(dy)) dehnen(fig, 1.4, 0.72); else if(dy) dehnen(fig, 0.72, 1.4); else dehnen(fig, 1.25, 0.85);
  trefferStopp(V.dashStopp);
  wackeln(0.14); ton('dash');
  staubWolke(fig.x + FIG_B / 2, fig.y + FIG_H / 2, 8, -Math.sign(dx) || 0);
}
function dashBeenden(abgebrochen){
  const d = fig.dash; if(!d) return;
  fig.dash = null; fig.nachDash = d; fig.nachDashZeit = 10;   // Schwung trägt noch kurz bis an eine Wand
  const variante = MECHANIKEN.dash.aktiv;
  if(variante === 1){ fig.gleit = V.dashGleitZeit; }   // B: Schwung bleibt ganz
  else {
    const b = abgebrochen ? V.abbruchBehalten : V.dashBehalten;
    fig.vx *= b;
    fig.vy = fig.vy < 0 ? Math.max(fig.vy * b, -V.sprungKraft) : fig.vy * b;
  }
  if(variante === 2) fig.hyperFenster = V.hyperFenster;
  if(fig.amBoden) fig.dashPause = V.dashPause;
}
function dashSprung(d){   // Variante C: weiter, höherer Sprung aus dem Dash
  const anWand = !fig.amBoden && fig.coyote <= 0 && fig.wandZeit > 0;
  let vx, vy;
  if(anWand){ vx = -fig.letzteWand * V.hyperX * 0.8; vy = -V.sprungKraft * V.hyperY * 1.05; fig.blick = -fig.letzteWand; fig.sperre = V.wandSperre; }
  else if(d.dy < 0 && !d.dx){ vx = fig.vx * 0.3; vy = -V.sprungKraft * V.hyperY * 1.2; }
  else { const s = Math.sign(d.dx) || fig.blick; vx = s * V.hyperX; vy = -V.sprungKraft * V.hyperY; }
  fig.dash = null; fig.nachDash = null; fig.hyperFenster = 0; fig.puffer = 0; fig.coyote = 0;
  fig.vx = vx; fig.vy = vy; fig.amBoden = false; fig.sprungAktiv = false; fig.gleit = 0;
  dehnen(fig, 0.62, 1.45); wackeln(0.3); trefferStopp(2); ton('hyper');
  staubWolke(fig.x + FIG_B / 2, fig.y + FIG_H, 12, 0);
}
// langsames Aufladen (Schalter „Dash lädt langsam auf“): jeder fehlende Punkt füllt sich über dashLadeZeit Sekunden
function dashLadenSchritt(){
  const max = luftDashMax();
  if(!V.dashLangsam || fig.dash || fig.luftDashes >= max){ fig.ladung = 0; return; }
  if(V.dashLadenNurBoden && !fig.amBoden && !fig.haengt) return;
  fig.ladung += 1 / (V.dashLadeZeit * 60);
  if(fig.ladung >= 1){ fig.ladung = 0; fig.luftDashes++; fig.blitz = 6; ton('aufladen'); }
}
function dashAufladen(){
  if(V.dashLangsam) return;   // langsames Aufladen: Landung/Wand/Haken füllen nicht sofort
  const max = luftDashMax();
  if(fig.luftDashes < max){
    const vorher = fig.luftDashes; fig.luftDashes = max;
    if(vorher <= 0){ fig.blitz = 10; ton('aufladen'); }
  }
}

function sterben(){
  if(fig.tot) return;
  fig.tot = 36; fig.dash = null; fig.seil = null; fig.ball = null; fig.haengt = null; wackeln(0.55); trefferStopp(6); ton('tod');
  teilchenBurst(fig.x + FIG_B / 2, fig.y + FIG_H / 2, 22, figurAussehen === 'affe' ? '#8a5a35' : '#ff8fc0');
}

// ---------- ein Physik-Schritt ----------
function figurSchritt(){
  fig.px = fig.x; fig.py = fig.y;
  if(fig.tot > 0){ if(--fig.tot === 0) zurueckSetzen(); return; }
  const E = ein.gedrueckt;
  const r = richtungLesen();
  const rx = Math.abs(r.x) < 0.2 ? 0 : Math.sign(r.x) * Math.min(1, Math.abs(r.x) * 1.25);
  const rxs = Math.sign(rx);
  if(rx && !fig.dash) fig.blick = rxs;
  if(fig.blitz > 0) fig.blitz--;
  if(fig.dashPause > 0 && !fig.dash) fig.dashPause--;
  dashLadenSchritt();

  // Eingaben merken (Puffer)
  const spielSprung = V.sprungWieSpiel;
  if(E.springen) fig.puffer = (spielSprung ? 0 : V.sprungPuffer) + 1;   // wie im Spiel: kein Puffer, nur genau dieser Schritt
  if(E.dash) fig.dashPuffer = V.dashPuffer + 1;
  // Wandsprung nach dem Dash: Springen während des Dashs (A/B) merken, bis er an der Wand endet
  if(E.springen && (fig.dash || fig.nachDashZeit > 0) && MECHANIKEN.dash.aktiv < 2) fig.dashSprungMerk = V.dashSprungMerken + 1;
  if(fig.dashWand > 0 && !(fig.dash && fig.dash.anWand)) fig.dashWand--;
  if(fig.nachDashZeit > 0) fig.nachDashZeit--;
  fig.coyote = fig.amBoden ? (spielSprung ? 0 : V.coyote) + 1 : fig.coyote - 1;   // wie im Spiel: keine Coyote-Time
  fig.wandAlter = fig.wand ? 0 : fig.wandAlter + 1;
  // Controller wie im Spiel: ✕ in der Luft gedrückt -> Wandsprung wartet kurz auf das Stick-Umlenken
  if(E.springen && E.springenPad && !fig.amBoden) fig.wandWarten = WAND_PAD_WARTEN + 1;
  fig.padSprung = !!E.springenPad || fig.wandWarten > 0;
  fig.wandZeit = fig.wand ? V.wandFenster + 1 : fig.wandZeit - 1;

  const sprungVerbraucht = hakenEingabe(E, rxs);   // Haken (04a-haken.js): schießen, loslassen, Sprung am Seil
  seilFlugSchritt();
  const amSeil = seilFest();

  const variante = MECHANIKEN.dash.aktiv;
  // Dash starten (mit Puffer: auch knapp vor der Landung gedrückt)
  if(fig.dashPuffer > 0 && dashKannStarten()) dashStarten();
  if(fig.dashPuffer > 0) fig.dashPuffer--;

  // Unterseite (04b-haften.js): Hängen oder Rollen übernimmt die Bewegung ganz
  if(!fig.dash && !amSeil && haftSchritt(E, rx)){ if(fig.puffer > 0) fig.puffer--; figurSchrittEnde(); return; }

  if(fig.dash){
    const d = fig.dash;
    // Springen während des Dashs: C = Dash-Sprung (am Boden/Wand), D = Abbruch
    if(fig.puffer > 0 && variante === 2 && (fig.coyote > 0 || fig.wandZeit > 0)){ dashSprung(d); }
    else if(fig.puffer > 0 && variante === 3){
      dashBeenden(true);
      if(fig.coyote > 0) springen(); else { fig.vy = Math.min(fig.vy, -V.abbruchHop); fig.puffer = 0; }
      dehnen(fig, 0.85, 1.18); ton('abbruch');
    } else {
      if(variante === 1){   // B: lenkbar
        const rr = richtungLesen(), l = Math.hypot(rr.x, rr.y);
        if(l > 0.3){
          d.dx += (rr.x / l - d.dx) * V.dashLenken; d.dy += (rr.y / l - d.dy) * V.dashLenken;
          const n = Math.hypot(d.dx, d.dy) || 1; d.dx /= n; d.dy /= n;
        }
      }
      fig.vx = d.dx * V.dashTempo * d.faktor; fig.vy = d.dy * V.dashTempo * d.faktor;
      if(fig.amBoden && d.dy > 0 && !(zelle(Math.floor((fig.x + FIG_B / 2) / K), Math.floor((fig.y + FIG_H + 1) / K)) === 'x')){ fig.vy = 0; }
    }
  }

  if(!fig.dash && amSeil && !fig.amBoden){
    seilSchwungEingabe(rx);
    fig.vy = Math.min(fig.vy + V.schwerkraft, V.maxFall * 1.5);
    seilNachSchwerkraft();
  } else if(!fig.dash){
    // Laufen wie im Spiel (Schalter): fester Schub je Schritt, Sprint-Zuwachs, ohne Taste Reibung, gedeckelt auf das
    // Sprint-Tempo – mehr Schwung (Dash, Seil, Ring) bleibt in der Luft erhalten und klingt am Boden ab
    if(V.laufWieSpiel && fig.gleit <= 0){
      const vor = fig.vx, kontrolle = fig.amBoden ? 1 : V.luftKontrolle;
      if(fig.sperre > 0){ fig.sperre--; fig.vx *= V.luftReibung; }
      else {
        fig.vx += rx * V.laufTempo * V.laufSchub * kontrolle;
        if(fig.amBoden && rx && Math.abs(fig.vx) >= V.laufTempo * 0.9 && Math.sign(fig.vx) === rxs) fig.vx += rxs * V.spielSprint;
        if(!rx){ fig.vx *= fig.amBoden ? V.bodenReibung : V.luftReibung; if(Math.abs(fig.vx) < 0.05) fig.vx = 0; }
        const grenze = Math.max(V.sprintTempo, Math.abs(vor) * (fig.amBoden ? 0.9 : 0.995));
        fig.vx = klemmen(fig.vx, -grenze, grenze);
      }
      fig.sprint = klemmen((Math.abs(fig.vx) - V.laufTempo) / Math.max(0.1, V.sprintTempo - V.laufTempo), 0, 1);
      if(fig.amBoden && rx && rxs !== Math.sign(vor) && Math.abs(vor) > 3 && Math.random() < 0.5)
        staubWolke(fig.x + FIG_B / 2, fig.y + FIG_H, 1, Math.sign(vor));
    } else {
    // Laufen (weich, mit langsamem Anlauf-Sprint – Spielwiese bisher)
    const gleicheRichtung = rx && rxs === Math.sign(fig.vx);
    if(V.sprint && gleicheRichtung && Math.abs(fig.vx) > V.laufTempo * 0.9) fig.sprint = Math.min(1, fig.sprint + V.sprintZuwachs);
    else if(fig.amBoden && !gleicheRichtung) fig.sprint = Math.max(0, fig.sprint - 0.08);
    const hoechst = V.laufTempo + (V.sprint ? (V.sprintTempo - V.laufTempo) * fig.sprint : 0);
    const ziel = rx * hoechst;
    let griff = fig.amBoden ? (rx ? V.bodenBeschl : V.bodenBremse) : (rx ? V.luftBeschl : V.luftBremse);
    // Schwung bleibt: wer schneller ist als sein Lauftempo und in dieselbe Richtung drückt, wird kaum gebremst
    if(gleicheRichtung && Math.abs(fig.vx) > Math.abs(ziel)) griff = fig.amBoden ? V.bodenBremse * 0.25 : V.luftBremse * 0.5;
    if(fig.gleit > 0){ fig.gleit--; griff = rx && !gleicheRichtung ? V.luftBeschl * 0.6 : (rx ? 0 : 0.01); }
    if(fig.sperre > 0){ griff *= 0.15; fig.sperre--; }
    const vorher = fig.vx;
    fig.vx += (ziel - fig.vx) * griff;
    if(fig.amBoden && rx && rxs !== Math.sign(vorher) && Math.abs(vorher) > 3 && Math.random() < 0.5)
      staubWolke(fig.x + FIG_B / 2, fig.y + FIG_H, 1, Math.sign(vorher));   // Bremsstaub beim Umdrehen
    }

    // Springen: Puffer (früh gedrückt) + Coyote-Time (kurz nach der Kante) + Wandsprung; C: Dash-Sprung im Fenster danach
    const sprungZahlVor = fig.sprungZahl;
    if(V.dashWandsprung && fig.dashSprungMerk > 0 && fig.dashWand > 0 && fig.wand){ fig.puffer = 1; fig.dashSprungMerk = 0; }
    if(fig.puffer <= 0 && fig.wandWarten > 0 && !sprungVerbraucht && !fig.amBoden && MECHANIKEN.wand.aktiv === 1 && wandSprungMoeglich(rxs)) wandSpringen();
    if(fig.puffer > 0 && !sprungVerbraucht){
      if(fig.hyperFenster > 0 && fig.nachDash && (fig.coyote > 0 || fig.wandZeit > 0)) dashSprung(fig.nachDash);
      else if(fig.coyote > 0) springen();
      else if(fig.durchbruch > 0){ fig.durchbruch = 0; springen(); }   // Sprung im Durchbruch-Fenster
      else if(wandSprungMoeglich(rxs)) wandSpringen();
    }
    if(fig.hyperFenster > 0) fig.hyperFenster--;

    // Schwerkraft je Sprung-Variante
    const halten = gehalten('springen'), sv = MECHANIKEN.sprung.aktiv;
    let g = V.schwerkraft;
    if(sv === 1 && halten && !fig.amBoden && Math.abs(fig.vy) < V.gipfelBand) g *= V.gipfelSchwer;
    if(sv === 2 && fig.vy > 0) g *= V.fallSchwer;
    if(sv === 3) g *= V.mondSchwer;
    if(spielSprung){
      // wie im Spiel: im Absprung-Schritt keine Schwerkraft (voller Schwung -12,6), sonst erst Schwerkraft, dann Bremsen;
      // einmal losgelassen bleibt der Sprung klein, auch wenn man wieder drückt
      if(fig.sprungZahl === sprungZahlVor) fig.vy = Math.min(fig.vy + g, V.maxFall);
      if(fig.sprungAktiv){
        if(fig.vy >= 0) fig.sprungAktiv = false;
        else {
          if(!halten) fig.losgelassen = true;
          if(fig.losgelassen && V.variablerSprung && fig.vy < -V.sprungAbbruch) fig.vy = -V.sprungAbbruch + (fig.vy + V.sprungAbbruch) * 0.3;
        }
      }
    } else {
      if(fig.sprungAktiv){
        if(fig.vy >= 0) fig.sprungAktiv = false;
        else if(!halten && V.variablerSprung && fig.vy < -V.sprungAbbruch) fig.vy = -V.sprungAbbruch + (fig.vy + V.sprungAbbruch) * 0.3;
      }
      fig.vy = Math.min(fig.vy + g, V.maxFall);
    }
    // an der Wand langsam rutschen (Variante A immer; „Wie im Spiel“ nur mit Schalter – im Spiel gibt es kein Rutschen)
    if(fig.wand && (MECHANIKEN.wand.aktiv !== 1 || V.wandRutschenAn) && fig.vy > V.wandRutschen) fig.vy = V.wandRutschen;
    if(amSeil) seilNachSchwerkraft();   // am Boden mit Seil: Seil hält trotzdem
  }
  if(fig.puffer > 0) fig.puffer--;
  if(fig.wandWarten > 0) fig.wandWarten--;
  if(fig.dashSprungMerk > 0) fig.dashSprungMerk--;

  // bewegen + Kollision
  const warBoden = fig.amBoden, fallTempo = fig.vy, vxVor = fig.vx, vyVor = fig.vy;
  if(fig.dash) bruchVorDash();   // Durchbruch (04c-bruch.js)
  const stoss = bewegen(fig);
  if(stoss.stossX) fig.vx = 0;
  bruchAbprallen(stoss, vxVor, vyVor);
  if(stoss.stossY < 0 && fig.vy < 0) fig.vy = 0;
  if(fig.dash){
    const d = fig.dash;
    if(stoss.stossX && d.dx && Math.abs(d.dy) < 0.5){ dashBeenden(false); wackeln(0.12); ton('bonk'); }   // waagerecht gegen die Wand
    else if(stoss.stossY && d.dy && !d.dx){ dashBeenden(false); }
    else if(stoss.stossY > 0 && d.dx){ d.dy = 0; d.dx = Math.sign(d.dx); }   // schräg auf den Boden: flach weiter
    else if(--d.zeit <= 0) dashBeenden(false);
    if(fig.dash && V.fxNachbilder) nachbild(fig);
  }
  fig.amBoden = fig.vy >= 0 && bodenUnter(fig);
  if(!fig.seil && fig.vy >= 0 && rampeAufsetzen(fig, warBoden || fig.amBoden)) fig.amBoden = true;   // Rampen (auch vom flachen Boden hinauf)
  if(fig.amBoden && !fig.dash) fig.vy = 0;
  if(!warBoden && fig.amBoden && !fig.dash) landen(fallTempo);
  if(fig.amBoden){ fig.wandSprungSeite = 0; if(!fig.dash) dashAufladen(); }
  const wandVorher = fig.wand;
  fig.wand = 0;
  if(!fig.amBoden){
    const reichweite = MECHANIKEN.wand.aktiv === 1 ? 4 : 0.5;   // Spiel: Wand zählt bis 4 px neben der Figur
    if(wandNeben(fig, 1, reichweite)) fig.wand = 1; else if(wandNeben(fig, -1, reichweite)) fig.wand = -1;
    if(fig.wand){
      fig.letzteWand = fig.wand;
      if(!wandVorher){ fig.wandEintritt = Math.abs(vxVor); if(!fig.dash) dashAufladen(); }   // NEUE Wandberührung lädt auf
      // per Dash an die Wand (kaputte Wand = kein Kontakt): Fenster zählt ab dem Aufprall, einmal pro Dash
      if(fig.dash || fig.nachDashZeit > 0){ fig.dashWand = V.dashWandFenster + 1; fig.nachDashZeit = 0; if(fig.dash) fig.dash.anWand = true; }
    }
  }

  figurSchrittEnde();
}
function figurSchrittEnde(){
  // Rollen beim Laufen wie im Spiel: Drehung = zurückgelegter Weg / halbe Figurbreite
  fig.laufWinkelVor = fig.laufWinkel;
  if(!fig.ball && !fig.haengt) fig.laufWinkel += fig.vx / (FIG_B * 0.5);
  if(Math.abs(fig.laufWinkel) > 1000){ fig.laufWinkel %= Math.PI * 2; fig.laufWinkelVor = fig.laufWinkel; }
  // Gefahren
  if(stachelTreffer(fig) || fig.y > KARTE_H * K + 120) sterben();

  // Zwischenpunkte (Kombi): darauf stehen = neuer Rücksetzpunkt
  if(fig.amBoden) for(const z of ZWISCHENPUNKTE){
    if(Math.abs(fig.x + FIG_B / 2 - (z.c * K + K / 2)) < K && Math.abs(fig.y + FIG_H - z.r * K) < 2 && fig.rueck !== z){
      fig.rueck = z; hinweis('Zwischenpunkt'); ton('aufladen');
    }
  }
  // Station / Rücksetzpunkt (gilt, sobald man in einer Station steht)
  const st = stationBei(fig.x + FIG_B / 2);
  if(st !== fig.station && fig.amBoden){
    fig.station = st; fig.rueck = st.start;
    if(st.mech) aktiveMechanik = st.mech;
    hinweis('Station ' + st.nr + ': ' + st.name);
  }
  // Nachbilder bei hohem Tempo
  if(V.fxNachbilder && !fig.dash && Math.hypot(fig.vx, fig.vy * 0.6) > V.nachbildTempo && schrittZaehler % 2 === 0) nachbild(fig);
  dehnenSchritt(fig);
}

function landen(tempo){
  const stark = klemmen(tempo / V.hartLandung, 0, 1.4);
  dehnen(fig, 1 + 0.32 * stark, 1 - 0.3 * stark);
  staubWolke(fig.x + FIG_B / 2, fig.y + FIG_H, Math.round(3 + 7 * stark), 0);
  ton('land', stark);
  if(tempo >= V.hartLandung){ wackeln(0.3); trefferStopp(3); }
}
