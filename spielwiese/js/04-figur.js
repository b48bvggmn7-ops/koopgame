// 04-figur.js – Spielwiese: die Testfigur und ihre eigene, kleine Physik (fester Takt, ein Aufruf = ein Schritt).
// Position x, y = linke obere Ecke der Figur (Breite FIG_B, Höhe FIG_H).

const fig = {
  x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0,
  amBoden: false, coyote: 0, puffer: 0,
  wand: 0, letzteWand: 0, wandZeit: 0, sperre: 0,
  blick: 1, sprint: 0, sprungAktiv: false,
  sx: 1, sy: 1, svx: 0, svy: 0,          // Dehnen/Stauchen (nur Anzeige, im Takt gerechnet)
  tot: 0, station: STATIONEN[0], rueck: STATIONEN[0].start,
  messFall: 0,
};

function figurAufPunkt(p){
  fig.x = p.c * K + K / 2 - FIG_B / 2; fig.y = p.r * K - FIG_H;
  fig.vx = fig.vy = 0; fig.px = fig.x; fig.py = fig.y;
  fig.amBoden = false; fig.coyote = fig.puffer = fig.wandZeit = fig.sperre = 0; fig.sprint = 0; fig.sprungAktiv = false;
  fig.sx = fig.sy = 1; fig.svx = fig.svy = 0;
}
function zurueckSetzen(){ figurAufPunkt(fig.rueck); fig.tot = 0; ton('teleport'); kameraSpringen(); }
function zuStation(st){
  fig.station = st; fig.rueck = st.start; if(st.mech) aktiveMechanik = st.mech;
  zurueckSetzen(); hinweis('Station ' + st.nr + ': ' + st.name);
}

// ---------- Kollision mit den Kästchen ----------
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
// in kleinen Teilschritten bewegen (nie mehr als 10 px auf einmal -> kein Durchrutschen bei hohem Tempo)
function bewegen(f){
  let dx = f.vx, dy = f.vy, stossX = 0, stossY = 0;
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 10));
  for(let i = 0; i < n; i++){
    if(dx){ f.x += dx / n; const s = kollisionX(f, dx); if(s){ stossX = s; dx = 0; } }
    if(dy){ f.y += dy / n; const s = kollisionY(f, dy); if(s){ stossY = s; dy = 0; } }
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
function wandSpringen(){
  const s = fig.letzteWand;
  fig.vx = -s * V.wandSprungX; fig.vy = -V.wandSprungY;
  fig.blick = -s; fig.sperre = V.wandSperre; fig.wandZeit = 0; fig.puffer = 0; fig.sprungAktiv = true;
  dehnen(fig, 0.75, 1.28); staubWolke(s > 0 ? fig.x + FIG_B : fig.x, fig.y + FIG_H / 2, 6, -s);
  trefferStopp(1); wackeln(0.12); ton('wand');
}

function sterben(){
  if(fig.tot) return;
  fig.tot = 36; wackeln(0.55); trefferStopp(6); ton('tod');
  teilchenBurst(fig.x + FIG_B / 2, fig.y + FIG_H / 2, 22, figurAussehen === 'affe' ? '#8a5a35' : '#ff8fc0');
}

// ---------- ein Physik-Schritt ----------
function figurSchritt(){
  fig.px = fig.x; fig.py = fig.y;
  if(fig.tot > 0){ if(--fig.tot === 0) zurueckSetzen(); return; }
  const E = ein.gedrueckt;
  const r = richtungLesen();
  const rx = Math.abs(r.x) < 0.2 ? 0 : r.x;
  if(rx) fig.blick = Math.sign(rx);

  // Laufen (mit Anlauf-Sprint wie im Spiel)
  const gleicheRichtung = rx && Math.sign(rx) === Math.sign(fig.vx);
  if(V.sprint && gleicheRichtung && Math.abs(fig.vx) > V.laufTempo * 0.9) fig.sprint = Math.min(1, fig.sprint + V.sprintZuwachs);
  else if(fig.amBoden && !gleicheRichtung) fig.sprint = Math.max(0, fig.sprint - 0.08);
  const hoechst = V.laufTempo + (V.sprint ? (V.sprintTempo - V.laufTempo) * fig.sprint : 0);
  const ziel = rx * hoechst;
  let griff = fig.amBoden ? (rx ? V.bodenBeschl : V.bodenBremse) : (rx ? V.luftBeschl : V.luftBremse);
  // Schwung in der Luft bleibt: wer schneller ist als sein Lauftempo und in dieselbe Richtung drückt, wird kaum gebremst
  if(!fig.amBoden && gleicheRichtung && Math.abs(fig.vx) > Math.abs(ziel)) griff = V.luftBremse * 0.5;
  if(fig.sperre > 0){ griff *= 0.15; fig.sperre--; }
  const vorher = fig.vx;
  fig.vx += (ziel - fig.vx) * griff;
  if(fig.amBoden && rx && Math.sign(rx) !== Math.sign(vorher) && Math.abs(vorher) > 3 && Math.random() < 0.5)
    staubWolke(fig.x + FIG_B / 2, fig.y + FIG_H, 1, Math.sign(vorher));   // Bremsstaub beim Umdrehen

  // Springen: Puffer (früh gedrückt) + Coyote-Time (kurz nach der Kante) + Wandsprung
  if(E.springen) fig.puffer = V.sprungPuffer + 1;
  fig.coyote = fig.amBoden ? V.coyote + 1 : fig.coyote - 1;
  fig.wandZeit = fig.wand ? V.wandFenster + 1 : fig.wandZeit - 1;
  if(fig.puffer > 0){
    if(fig.coyote > 0) springen();
    else if(V.wandsprung && fig.wandZeit > 0) wandSpringen();
  }
  if(fig.puffer > 0) fig.puffer--;

  // Schwerkraft je Sprung-Variante
  const halten = gehalten('springen'), variante = MECHANIKEN.sprung.aktiv;
  let g = V.schwerkraft;
  if(variante === 1 && halten && !fig.amBoden && Math.abs(fig.vy) < V.gipfelBand) g *= V.gipfelSchwer;
  if(variante === 2 && fig.vy > 0) g *= V.fallSchwer;
  if(variante === 3) g *= V.mondSchwer;
  if(fig.sprungAktiv){
    if(fig.vy >= 0) fig.sprungAktiv = false;
    else if(!halten && V.variablerSprung && fig.vy < -V.sprungAbbruch) fig.vy = -V.sprungAbbruch + (fig.vy + V.sprungAbbruch) * 0.3;
  }
  fig.vy = Math.min(fig.vy + g, V.maxFall);
  if(fig.wand && fig.vy > V.wandRutschen) fig.vy = V.wandRutschen;   // an der Wand langsam rutschen

  // bewegen + Kollision
  const warBoden = fig.amBoden, fallTempo = fig.vy;
  bewegen(fig);
  fig.amBoden = fig.vy >= 0 && bodenUnter(fig);
  if(fig.amBoden) fig.vy = 0;
  if(!warBoden && fig.amBoden) landen(fallTempo);
  fig.wand = 0;
  if(!fig.amBoden){
    if(wandNeben(fig, 1)) fig.wand = 1; else if(wandNeben(fig, -1)) fig.wand = -1;
    if(fig.wand) fig.letzteWand = fig.wand;
  }
  if(fig.amBoden || fig.vy < 0) fig.messFall = 0; else fig.messFall = fig.vy;

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
  if(V.fxNachbilder && Math.hypot(fig.vx, fig.vy * 0.6) > V.nachbildTempo && schrittZaehler % 2 === 0) nachbild(fig);
  dehnenSchritt(fig);
}

function landen(tempo){
  const stark = klemmen(tempo / V.hartLandung, 0, 1.4);
  dehnen(fig, 1 + 0.32 * stark, 1 - 0.3 * stark);
  staubWolke(fig.x + FIG_B / 2, fig.y + FIG_H, Math.round(3 + 7 * stark), 0);
  ton('land', stark);
  if(tempo >= V.hartLandung){ wackeln(0.3); trefferStopp(3); }
}
