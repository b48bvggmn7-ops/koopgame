// 04e-schwein.js – Spielwiese: das Schweinchen als zweite Figur mit Schirm (Physik abgeschrieben aus dem Spiel,
// js/08-figur-physik-seil.js – nicht geladen) und die Idee „Fliegender Anker“: solange der Schirm offen ist, kann der
// Affe seinen Haken an den Schirm hängen. Schirm zu oder Landung = die Liane löst sich (mit Abwurf-Schwung).
// Mitspielen (Panel „Schweinchen“): Pfeiltasten, Num 0 springen, Num 1 halten = Schirm, oder ein zweiter Controller.
// Ohne zweiten Spieler (Solo-Test, auch automatisch in Station 11): das Schweinchen fliegt von allein vor dem Affen.

const schwein = {
  x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, amBoden: false, blick: 1,
  wand: 0, letzteWand: 0, wandAlter: 99, wandEintritt: 0, wandSprungSeite: 0, wandWarten: 0, sperre: 0,
  sprungAktiv: false, losgelassen: false, gleitZeit: 0, gleitet: false, schirm: 0, schirmVor: 0,
  laufWinkel: 0, laufWinkelVor: 0, sx: 1, sy: 1, svx: 0, svy: 0, tot: 0, da: false, solo: false,
};
// der Schirm als Anker (steht in der Anker-Liste von 04a-haken.js; weg = 1 heißt „gerade nicht greifbar“)
const schirmAnker = {x: 0, y: 0, px: 0, py: 0, bx: 0, by: 0, art: 'p', weg: 1, halt: 0, phase: 0};
const SCHIRM_HOEHE = 50;   // Schirmmitte über der Figurmitte (wie im Spiel gezeichnet: Hand 20 px + Stock 30 px)

const schweinSpielt = () => !!V.schweinAn;
const schweinAktiv = () => V.schweinAn || V.schweinAllein || !!(fig.station && fig.station.schwein);
const affeHaengtAmSchirm = () => !!(fig.seil && fig.seil.anker === schirmAnker && fig.seil.zustand === 'fest');

function schweinAufPunkt(p, versatz){
  schwein.x = p.c * K + K / 2 - FIG_B / 2 + (versatz || 0); schwein.y = p.r * K - FIG_H;
  schwein.vx = schwein.vy = 0; schwein.px = schwein.x; schwein.py = schwein.y;
  schwein.amBoden = false; schwein.wand = 0; schwein.wandAlter = 99; schwein.wandSprungSeite = 0; schwein.wandWarten = 0;
  schwein.sperre = 0; schwein.sprungAktiv = false; schwein.gleitZeit = 0; schwein.gleitet = false; schwein.schirm = 0;
  schwein.sx = schwein.sy = 1; schwein.svx = schwein.svy = 0; schwein.tot = 0;
}
// Solo-Test: Platz vor dem Affen (oben, in Blickrichtung)
function soloPlatz(){
  return {x: fig.x + fig.blick * V.soloVor * K, y: fig.y - V.soloHoch * K};
}

function schweinSchritt(){
  const s = schwein, aktiv = schweinAktiv(), solo = aktiv && !schweinSpielt();
  if(!aktiv){ s.da = false; schirmAnker.weg = 1; return; }
  if(!s.da || s.solo !== solo){   // gerade dazugekommen: neben dem Affen (bzw. vor ihm) erscheinen
    s.da = true; s.solo = solo;
    schweinAufPunkt({c: Math.floor((fig.x + FIG_B / 2) / K), r: Math.floor((fig.y + FIG_H) / K)}, -K);
    if(solo){ const p = soloPlatz(); s.x = s.px = p.x; s.y = s.py = p.y; }
  }
  if(!anker.includes(schirmAnker)) anker.push(schirmAnker);   // Editor/Karte laden baut die Anker-Liste neu
  s.px = s.x; s.py = s.y; s.schirmVor = s.schirm;
  s.laufWinkelVor = s.laufWinkel;
  schirmAnker.px = schirmAnker.x; schirmAnker.py = schirmAnker.y;
  if(solo) soloSchritt(); else if(s.tot > 0){ if(--s.tot === 0) schweinAufPunkt(fig.rueck, -K); } else schweinPhysik();
  // Schirm-Anker folgt dem Schirm; greifbar nur, solange er (fast) ganz offen ist
  schirmAnker.x = s.x + FIG_B / 2 + s.blick * 5; schirmAnker.y = s.y + FIG_H / 2 - SCHIRM_HOEHE;
  schirmAnker.weg = (V.schirmAnker && s.schirm > 0.6 && !s.tot) ? 0 : 1;
  if(schirmAnker.px === 0 && schirmAnker.py === 0){ schirmAnker.px = schirmAnker.x; schirmAnker.py = schirmAnker.y; }
}

// Solo: fliegt mit offenem Schirm vor dem Affen her; hängt der Affe dran, segelt es geradeaus weiter und sinkt langsam
function soloSchritt(){
  const s = schwein;
  s.gleitet = true; s.schirm += (1 - s.schirm) * 0.28; s.tot = 0;
  if(affeHaengtAmSchirm()){
    s.vx += (s.blick * V.soloTempo - s.vx) * 0.08;
    s.vy += (V.soloSinken - s.vy) * 0.1;
  } else {
    const p = soloPlatz();
    s.blick = fig.blick;
    s.vx = klemmen((p.x - s.x) * 0.08, -12, 12); s.vy = klemmen((p.y - s.y) * 0.08, -8, 8);
  }
  s.x += s.vx; s.y += s.vy;
  s.y = Math.max(-2 * K, s.y);
  dehnenSchritt(s);
}

// Mitspielen: Bewegung wie das Schweinchen im Spiel (Laufen, Sprung, Wandsprung, Schirm)
function schweinPhysik(){
  const s = schwein, E = ein.gedrueckt, pad = ein.pad2;
  const links = gehalten('schweinLinks') || pad.x < -0.3, rechts = gehalten('schweinRechts') || pad.x > 0.3;
  const sprungDruck = !!E.schweinSprung, sprungHalten = gehalten('schweinSprung') || pad.sprung;
  const schirmHalten = gehalten('schweinSchirm') || pad.schirm;
  let richtung = 0;
  if(links){ richtung = -1; s.blick = -1; }
  if(rechts){ richtung = 1; s.blick = 1; }
  // Laufen (wie im Spiel; während der Wandsprung-Sperre nicht lenkbar)
  const kontrolle = s.amBoden ? 1 : V.luftKontrolle;
  if(s.sperre > 0){ s.sperre--; s.vx *= V.luftReibung; }
  else {
    s.vx += richtung * V.laufTempo * V.laufSchub * kontrolle;
    if(s.amBoden && richtung && Math.abs(s.vx) >= V.laufTempo * 0.9 && Math.sign(s.vx) === richtung) s.vx += richtung * V.spielSprint;
    if(!richtung){ s.vx *= s.amBoden ? V.bodenReibung : V.luftReibung; if(Math.abs(s.vx) < 0.05) s.vx = 0; }
    s.vx = klemmen(s.vx, -V.sprintTempo, V.sprintTempo);
  }
  // Schirm (wie im Spiel): segelt nur in der Luft und nicht im schnellen Aufstieg; wird mit der Zeit schwerer
  s.gleitet = schirmHalten && !s.amBoden && s.vy > -1;
  if(s.gleitet){
    s.gleitZeit++;
    const t = Math.min(1, s.gleitZeit / Math.max(1, V.schirmRampe));
    s.vy += mischen(V.schirmStartSchwer, V.schwerkraft, t) + (affeHaengtAmSchirm() ? V.schirmLast : 0);
    s.vy = Math.min(s.vy, mischen(V.schirmFallStart, V.schirmFallEnde, t));
  } else s.vy += V.schwerkraft;
  s.vy = Math.min(s.vy, V.maxFall);
  // Wandkontakt (Spiel: bis 4 px neben der Figur), Schwung beim frischen Kontakt merken
  s.wandAlter = s.wand ? 0 : s.wandAlter + 1;
  const padSprung = !!E.schweinSprungPad;
  if(sprungDruck && padSprung && !s.amBoden) s.wandWarten = WAND_PAD_WARTEN + 1;
  const warten = !sprungDruck && s.wandWarten > 0;
  if(sprungDruck || warten){
    if(s.amBoden && sprungDruck){
      s.vy = -V.sprungKraft; s.amBoden = false; s.gleitZeit = 0; s.sprungAktiv = true; s.losgelassen = false;
      dehnen(s, 0.72, 1.32); staubWolke(s.x + FIG_B / 2, s.y + FIG_H, 6, 0); ton('sprung');
    } else {
      let seite = s.wand;
      if(!seite && (padSprung || warten) && s.wandAlter <= WAND_PAD_FENSTER) seite = s.letzteWand;
      if(V.wandsprung && seite && richtung === -seite && seite !== s.wandSprungSeite && s.wandEintritt > 1.3){
        const m = Math.min(1, s.wandEintritt / V.sprintTempo);
        s.vy = -mischen(V.wandSpielYmin, V.wandSpielYmax, m); s.vx = richtung * mischen(V.wandSpielXmin, V.wandSpielXmax, m);
        s.wandSprungSeite = seite; s.wandAlter = 99; s.wandWarten = 0; s.gleitZeit = 0; s.sperre = V.wandSpielSperre;
        s.sprungAktiv = false;
        dehnen(s, 0.75, 1.28); staubWolke(seite > 0 ? s.x + FIG_B : s.x, s.y + FIG_H / 2, 6, -seite); ton('wand');
      }
    }
  }
  if(s.wandWarten > 0) s.wandWarten--;
  // kleiner Sprung: losgelassen -> Aufwärts-Tempo sanft bremsen (wie im Spiel)
  if(s.sprungAktiv){
    if(s.vy >= 0 || s.gleitet) s.sprungAktiv = false;
    else {
      if(!sprungHalten) s.losgelassen = true;
      if(s.losgelassen && V.variablerSprung && s.vy < -V.sprungAbbruch) s.vy = -V.sprungAbbruch + (s.vy + V.sprungAbbruch) * 0.3;
    }
  }
  // bewegen + Kollision (dieselben Kästchen-Regeln wie beim Affen)
  const warBoden = s.amBoden, fallTempo = s.vy, vxVor = s.vx;
  const stoss = bewegen(s);
  if(stoss.stossX) s.vx = 0;
  if(stoss.stossY < 0 && s.vy < 0) s.vy = 0;
  s.amBoden = s.vy >= 0 && bodenUnter(s);
  if(s.vy >= 0 && rampeAufsetzen(s, warBoden || s.amBoden)) s.amBoden = true;
  if(s.amBoden){
    s.vy = 0; s.gleitZeit = 0; s.sperre = 0; s.wandSprungSeite = 0;
    if(!warBoden){
      const stark = klemmen(fallTempo / V.hartLandung, 0, 1.4);
      dehnen(s, 1 + 0.32 * stark, 1 - 0.3 * stark); staubWolke(s.x + FIG_B / 2, s.y + FIG_H, Math.round(3 + 7 * stark), 0);
    }
  }
  const wandVorher = s.wand;
  s.wand = 0;
  if(!s.amBoden){
    if(wandNeben(s, 1, 4)) s.wand = 1; else if(wandNeben(s, -1, 4)) s.wand = -1;
    if(s.wand){ s.letzteWand = s.wand; if(!wandVorher) s.wandEintritt = Math.abs(vxVor); }
  }
  // Schirm auf-/zuklappen (weich); offen hängt sie aufrecht darunter, sonst rollt sie wie im Spiel
  s.schirm += ((s.gleitet ? 1 : 0) - s.schirm) * (s.gleitet ? 0.28 : 0.35);
  if(s.schirm < 0.01) s.schirm = 0;
  if(s.schirm > 0.05) s.laufWinkel = Math.atan2(Math.sin(s.laufWinkel), Math.cos(s.laufWinkel)) * 0.8;
  else s.laufWinkel += s.vx / (FIG_B * 0.5);
  if(Math.abs(s.laufWinkel) > 1000){ s.laufWinkel %= Math.PI * 2; s.laufWinkelVor = s.laufWinkel; }
  dehnenSchritt(s);
  // Gefahren: Stacheln oder herausgefallen -> kurz weg, dann am Rücksetzpunkt des Affen
  if(stachelTreffer(s) || s.y > KARTE_H * K + 120){
    s.tot = 40; s.schirm = 0; teilchenBurst(s.x + FIG_B / 2, s.y + FIG_H / 2, 14, '#ff9cc8'); ton('tod');
  }
  // weit zurückgeblieben (links aus dem Bild): zum Affen holen
  if(s.x < kam.x - 3 * K && s.x < fig.x - SICHT_B) schweinAufPunkt(fig.rueck, -K);
}

// ---------- Zeichnen ----------
function schweinZeichnen(alpha){
  const s = schwein;
  if(!s.da || s.tot) return;
  const x = mischen(s.px, s.x, alpha), y = mischen(s.py, s.y, alpha), aussehen = figurAussehen === 'affe' ? 'schwein' : 'affe';
  const u = mischen(s.schirmVor, s.schirm, alpha);
  if(V.figurSchatten && !s.solo) lookSchatten(x, y);
  if(u > 0.02) schirmZeichnen(x + FIG_B / 2, y + FIG_H, u, s.vx, s.blick);
  const winkel = V.figurRollt ? mischen(s.laufWinkelVor, s.laufWinkel, alpha) : 0;
  figurBild(x, y, s.sx, s.sy, s.blick, s.solo ? 0.92 : 1, false, winkel, aussehen);
  if(s.solo){   // Solo-Test: kleines Schild „fliegt allein“
    ctx.font = 'bold 11px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText('Solo', x + FIG_B / 2, y + FIG_H + 14); ctx.textAlign = 'left';
  }
}
// Segelschirm wie im Spiel (js/10-figuren-zeichnen.js, drawUmbrella – abgeschrieben): px/py = Füße der Figur
function schirmZeichnen(px, py, u, vx, blick){
  const t = performance.now() * 0.004;
  const kipp = Math.max(-0.4, Math.min(0.4, -vx * 0.05)) + Math.sin(t) * 0.05 * u;
  const R = 36, ry = 22, stock = 30;
  const handX = px + blick * 5, handY = py - FIG_H * 0.5 - 20;
  ctx.save();
  ctx.translate(handX, handY); ctx.rotate(kipp); ctx.globalAlpha = Math.min(1, u * 1.4);
  ctx.strokeStyle = '#7a4a2e'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -stock); ctx.lineTo(0, 0); ctx.arc(-4, 0, 4, 0, Math.PI * 0.9); ctx.stroke();
  ctx.translate(0, -stock); ctx.scale(0.3 + 0.7 * u, 0.45 + 0.55 * u);
  const N = 6, rand = i => -R + (2 * R * i) / N;
  const kuppel = () => {
    ctx.beginPath(); ctx.moveTo(-R, 0); ctx.ellipse(0, 0, R, ry, 0, Math.PI, 2 * Math.PI);
    for(let i = N; i > 0; i--){ const x0 = rand(i), x1 = rand(i - 1); ctx.quadraticCurveTo((x0 + x1) / 2, -ry * 0.2, x1, 0); }
    ctx.closePath();
  };
  ctx.fillStyle = 'rgba(40,20,30,.12)'; ctx.beginPath(); ctx.ellipse(0, 3, R * 0.95, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); kuppel(); ctx.clip();
  const g = ctx.createLinearGradient(0, -ry, 0, 2); g.addColorStop(0, '#ffb3d0'); g.addColorStop(1, '#f06b9f');
  ctx.fillStyle = g; ctx.fillRect(-R - 2, -ry - 2, 2 * R + 4, ry + 6);
  ctx.fillStyle = 'rgba(255,248,250,.85)';
  for(let i = 0; i < N; i += 2){ ctx.beginPath(); ctx.moveTo(0, -ry - 1); ctx.lineTo(rand(i), 1); ctx.lineTo(rand(i + 1), 1); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = 'rgba(170,60,105,.45)'; ctx.lineWidth = 1;
  for(let i = 1; i < N; i++){ ctx.beginPath(); ctx.moveTo(0, -ry); ctx.quadraticCurveTo(rand(i) * 0.75, -ry * 0.75, rand(i), 0); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-R * 0.38, -ry * 0.62, R * 0.28, ry * 0.16, -0.35, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  kuppel(); ctx.strokeStyle = '#c94d82'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = '#c94d82';
  for(let i = 0; i <= N; i++){ ctx.beginPath(); ctx.arc(rand(i), 0, 1.6, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.arc(0, -ry - 2.5, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
