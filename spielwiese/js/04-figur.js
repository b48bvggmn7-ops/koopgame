// 04-figur.js – Spielwiese: die Testfigur und ihre eigene, kleine Physik (fester Takt, ein Aufruf = ein Schritt).
// Position x, y = linke obere Ecke der Figur (Breite FIG_B, Höhe FIG_H).

const fig = {
  x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0,
  amBoden: false, coyote: 0, puffer: 0,
  wand: 0, letzteWand: 0, wandZeit: 0, sperre: 0, wandEintritt: 0, wandSprungSeite: 0,
  blick: 1, sprint: 0, sprungAktiv: false,
  haengt: null, ball: null, rollWinkel: 0,
  seil: null, hakenZiel: null, zielStrahl: null, fehlschuss: null, rutsch: 0,
  dash: null, luftDashes: 1, dashPuffer: 0, dashPause: 0, gleit: 0, hyperFenster: 0, nachDash: null, blitz: 0,
  sx: 1, sy: 1, svx: 0, svy: 0,          // Dehnen/Stauchen (nur Anzeige, im Takt gerechnet)
  tot: 0, station: STATIONEN[0], rueck: STATIONEN[0].start,
};
const luftDashMax = () => V.dashLuft >= 4 ? Infinity : V.dashLuft;

function figurAufPunkt(p){
  fig.x = p.c * K + K / 2 - FIG_B / 2; fig.y = p.r * K - FIG_H;
  fig.vx = fig.vy = 0; fig.px = fig.x; fig.py = fig.y;
  fig.amBoden = false; fig.coyote = fig.puffer = fig.wandZeit = fig.sperre = 0; fig.sprint = 0; fig.sprungAktiv = false;
  fig.dash = null; fig.luftDashes = luftDashMax(); fig.dashPuffer = fig.dashPause = fig.gleit = fig.hyperFenster = 0;
  fig.wandSprungSeite = 0; fig.seil = null; fig.fehlschuss = null; fig.rutsch = 0;
  fig.haengt = null; fig.ball = null; fig.rollWinkel = 0;
  fig.sx = fig.sy = 1; fig.svx = fig.svy = 0;
}
function zurueckSetzen(){ figurAufPunkt(fig.rueck); fig.tot = 0; ton('teleport'); kameraSpringen(); }
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
      if(!frei(f.x + sx, f.y) && f.dash && kanteStufe(f, sx, V.kantenStufe)){}   // beim Dash auf die Stufe
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
function wandNeben(f, seite){
  const c = seite > 0 ? Math.floor((f.x + FIG_B + 0.5) / K) : Math.floor((f.x - 0.5) / K);
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
function springen(){
  const mond = MECHANIKEN.sprung.aktiv === 3;
  fig.vy = -V.sprungKraft * (mond ? V.mondKraft : 1);
  fig.amBoden = false; fig.coyote = 0; fig.puffer = 0; fig.sprungAktiv = true;
  dehnen(fig, 0.72, 1.32); staubWolke(fig.x + FIG_B / 2, fig.y + FIG_H, 6, 0); ton('sprung');
}
function wandSprungMoeglich(rx){
  if(!V.wandsprung || fig.wandZeit <= 0) return false;
  if(MECHANIKEN.wand.aktiv === 1){   // wie im Spiel: Taste von der Wand weg, je Seite einmal, nicht aus dem Stand
    return rx === -fig.letzteWand && fig.letzteWand !== fig.wandSprungSeite && fig.wandEintritt > 1.3;
  }
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
  fig.blick = -s; fig.sperre = V.wandSperre; fig.wandZeit = 0; fig.puffer = 0; fig.sprungAktiv = MECHANIKEN.wand.aktiv === 0;
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
  if(fig.amBoden && dy > 0 && !dx) dx = fig.blick;   // am Boden nach unten: flach in Blickrichtung
  const l = Math.hypot(dx, dy);
  return {dx: dx / l, dy: dy / l};
}
function dashKannStarten(){
  if(fig.dash || fig.dashPause > 0) return false;
  return fig.amBoden || fig.luftDashes > 0;
}
function dashStarten(){
  if(fig.ball && !rollenBeenden()) return;   // aus dem Rollen: erst aufstehen
  fig.haengt = null;
  const {dx, dy} = dashRichtung();
  if(fig.seil) seilLoesen(false);   // Dash aus dem Schwung: Seil los
  if(!fig.amBoden) fig.luftDashes--;
  fig.dash = {zeit: V.dashDauer, dx, dy, startBoden: fig.amBoden};
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
  fig.dash = null; fig.nachDash = d;
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
function dashAufladen(){
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

  // Eingaben merken (Puffer)
  if(E.springen) fig.puffer = V.sprungPuffer + 1;
  if(E.dash) fig.dashPuffer = V.dashPuffer + 1;
  fig.coyote = fig.amBoden ? V.coyote + 1 : fig.coyote - 1;
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
      fig.vx = d.dx * V.dashTempo; fig.vy = d.dy * V.dashTempo;
      if(fig.amBoden && d.dy > 0){ fig.vy = 0; }
    }
  }

  if(!fig.dash && amSeil && !fig.amBoden){
    seilSchwungEingabe(rx);
    fig.vy = Math.min(fig.vy + V.schwerkraft, V.maxFall * 1.5);
    seilNachSchwerkraft();
  } else if(!fig.dash){
    // Laufen (mit Anlauf-Sprint wie im Spiel)
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

    // Springen: Puffer (früh gedrückt) + Coyote-Time (kurz nach der Kante) + Wandsprung; C: Dash-Sprung im Fenster danach
    if(fig.puffer > 0 && !sprungVerbraucht){
      if(fig.hyperFenster > 0 && fig.nachDash && (fig.coyote > 0 || fig.wandZeit > 0)) dashSprung(fig.nachDash);
      else if(fig.coyote > 0) springen();
      else if(wandSprungMoeglich(rxs)) wandSpringen();
    }
    if(fig.hyperFenster > 0) fig.hyperFenster--;

    // Schwerkraft je Sprung-Variante
    const halten = gehalten('springen'), sv = MECHANIKEN.sprung.aktiv;
    let g = V.schwerkraft;
    if(sv === 1 && halten && !fig.amBoden && Math.abs(fig.vy) < V.gipfelBand) g *= V.gipfelSchwer;
    if(sv === 2 && fig.vy > 0) g *= V.fallSchwer;
    if(sv === 3) g *= V.mondSchwer;
    if(fig.sprungAktiv){
      if(fig.vy >= 0) fig.sprungAktiv = false;
      else if(!halten && V.variablerSprung && fig.vy < -V.sprungAbbruch) fig.vy = -V.sprungAbbruch + (fig.vy + V.sprungAbbruch) * 0.3;
    }
    fig.vy = Math.min(fig.vy + g, V.maxFall);
    if(fig.wand && fig.vy > V.wandRutschen) fig.vy = V.wandRutschen;   // an der Wand langsam rutschen
    if(amSeil) seilNachSchwerkraft();   // am Boden mit Seil: Seil hält trotzdem
  }
  if(fig.puffer > 0) fig.puffer--;

  // bewegen + Kollision
  const warBoden = fig.amBoden, fallTempo = fig.vy, vxVor = fig.vx;
  const stoss = bewegen(fig);
  if(stoss.stossX) fig.vx = 0;
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
  if(!fig.amBoden && !fig.seil && fig.vy >= 0 && rampeAufsetzen(fig, warBoden)) fig.amBoden = true;   // Rampen
  if(fig.amBoden && !fig.dash) fig.vy = 0;
  if(!warBoden && fig.amBoden && !fig.dash) landen(fallTempo);
  if(fig.amBoden){ fig.wandSprungSeite = 0; if(!fig.dash) dashAufladen(); }
  const wandVorher = fig.wand;
  fig.wand = 0;
  if(!fig.amBoden){
    if(wandNeben(fig, 1)) fig.wand = 1; else if(wandNeben(fig, -1)) fig.wand = -1;
    if(fig.wand){
      fig.letzteWand = fig.wand;
      if(!wandVorher){ fig.wandEintritt = Math.abs(vxVor); if(!fig.dash) dashAufladen(); }   // NEUE Wandberührung lädt auf
    }
  }

  figurSchrittEnde();
}
function figurSchrittEnde(){
  // Gefahren
  if(stachelTreffer(fig) || fig.y > KARTE_H * K + 120) sterben();

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
