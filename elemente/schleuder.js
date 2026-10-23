// elemente/schleuder.js – Element „Schleuder“ (Punkt-Element; Aufbau siehe 00-register.js). Nutzerwunsch: zweites
// Haken-Element neben dem Schwung-Haken. Oben ein Haken, darunter (1–4 Reihen) ein Ring an einem Gummiband. Der Affe wirft
// sein Seil an den Ring (Haken-Taste G gedrückt halten), läuft ein Stück weg und spannt das Seil wie ein Gummi. Lässt er
// die Taste los, schleudert ihn das Gummi zurück in Richtung Ring und schräg nach oben – je stärker gespannt, desto
// kräftiger, voll gespannt etwa 4,5 Reihen hoch und 6–7 Spalten weit (bewusst „nur ein bisschen“). Springen löst ohne Schub.
// Rolle: nur der Affe (er braucht sein Seil) – er kommt so auf eine Kante und hilft oben dem Schweinchen weiter (Hebel,
// Druckplatte, Tür); das Schweinchen braucht dafür einen eigenen Weg (Schirm, Aufwind, Pilz).
// Im Spiel: schleudern = [{x, y (Haken), rx, ry (Ring)}]; der Zustand am Affen steht in P.schleuder = {s}.
// Aufrufe: schleuderVorher aus neueBewegungVorher (js/32-neue-bewegung.js) – dort ist die Taste G frei, die alte
// Seil-Physik in js/08 bleibt unberührt.
const SCHLEUDER_GREIF = 110;      // so nah (Hände -> Ring, px) muss der Affe sein, um das Seil an den Ring zu werfen
const SCHLEUDER_RUHE = 34;        // ungespannte Seillänge (px)
const SCHLEUDER_MAX = 120;        // so weit lässt sich das Seil höchstens spannen (px über SCHLEUDER_RUHE)
const SCHLEUDER_MIN = 24;         // darunter gibt es beim Loslassen keinen Schub
const SCHLEUDER_VX = 6;           // Abflug bei voller Spannung: seitlich (px/Schritt) …
const SCHLEUDER_VY = -15.5;       // … und nach oben (Springen: -12,6) – ca. 4,5 Reihen hoch, 6–7 Spalten weit
const SCHLEUDER_ZUG = 0.9;        // Lauftempo beim Spannen (Anteil von MOVE_SPEED, wird zum Ende hin langsamer)
const SCHLEUDER_RUECK = 0.025;    // ohne Taste zieht das Gummi den Affen langsam zurück (Anteil der Spannung je Schritt)
let schleudern = [];

const schleuderHand = P => ({x: P.x, y: P.y - P.h*0.6});
function schleuderSpannung(P){
  const S = P.schleuder; if(!S) return 0;
  const h = schleuderHand(P);
  return Math.max(0, Math.hypot(h.x - S.s.rx, h.y - S.s.ry) - SCHLEUDER_RUHE);
}
// Ring in Reichweite (und freie Sicht)? Der nächste zählt.
function schleuderZiel(P){
  const h = schleuderHand(P);
  let best = null, bd = Infinity;
  for(const s of schleudern){
    const d = Math.hypot(s.rx - h.x, s.ry - h.y);
    if(d <= SCHLEUDER_GREIF && d < bd && lineClear(h.x, h.y, s.rx, s.ry)){ best = s; bd = d; }
  }
  return best;
}
function schleuderLos(P, schub){
  const S = P.schleuder; if(!S) return;
  const k = schub ? Math.max(0, Math.min(1, (schleuderSpannung(P) - SCHLEUDER_MIN)/(SCHLEUDER_MAX - SCHLEUDER_MIN))) : 0;
  P.schleuder = null;
  if(k > 0){
    const richtung = Math.sign(S.s.rx - P.x) || -P.facing || 1;   // zurück Richtung Ring (und darüber hinaus)
    P.vx = richtung*SCHLEUDER_VX*k; P.vy = SCHLEUDER_VY*k;
    P.grounded = false; P.ropeFling = true; P.facing = richtung;
    P.schleuderSchub = k;
    if(typeof SFX !== 'undefined' && SFX.schleuder) SFX.schleuder(P, k);
  } else { P.schleuderSchub = 0; if(typeof SFX !== 'undefined' && SFX.hookRelease) SFX.hookRelease(P); }
}
// aus neueBewegungVorher: true = Tempo gesetzt (normale Physik aus)
function schleuderVorher(P, moveDir, jumpPressed){
  const K = P.keys || {};
  const g = !!K.hook && isDown(K.hook), frisch = g && !P._gAlt;
  P._gAlt = g;
  if(!P.male || !schleudern.length){ P.schleuder = null; return false; }
  if(!P.schleuder){
    if(!frisch || P.dash || P.haft) return false;
    const s = schleuderZiel(P); if(!s) return false;
    if(P.hookAttached){   // derselbe Druck hat auch einen Schwung-Haken gegriffen: der nähere gewinnt
      const h = schleuderHand(P);
      if(Math.hypot(P.anchor.x - h.x, P.anchor.y - h.y) < Math.hypot(s.rx - h.x, s.ry - h.y)) return false;
      P.hookAttached = false;
    }
    P.schleuder = {s}; P.schleuderSchub = 0;
    if(typeof SFX !== 'undefined' && SFX.hookAttach) SFX.hookAttach(P);
  }
  const S = P.schleuder;
  if(P.dash || P.dashPuffer > 0 || P.hookAttached || P.haft){ P.schleuder = null; return false; }
  if(!g){ schleuderLos(P, true); return !!P.schleuderSchub; }
  if(jumpPressed){ P.schleuder = null; return false; }   // Springen: Seil los, normaler Sprung
  // Spannen: weg vom Ring wird es zäher, bei voller Spannung geht es nicht weiter; ohne Taste zieht das Gummi zurück
  const weg = Math.sign(P.x - S.s.rx) || moveDir, sp = schleuderSpannung(P);
  if(moveDir && moveDir === weg){
    P.vx = moveDir*MOVE_SPEED*SCHLEUDER_ZUG*Math.max(0.4, 1 - sp/SCHLEUDER_MAX);
    const h = schleuderHand(P), nx = h.x + P.vx;   // nie über die volle Spannung hinaus
    const rest = SCHLEUDER_MAX + SCHLEUDER_RUHE, dy = h.y - S.s.ry;   // genau bis zur vollen Spannung, nicht darüber
    if(Math.hypot(nx - S.s.rx, dy) > rest) P.vx = S.s.rx + weg*Math.sqrt(Math.max(0, rest*rest - dy*dy)) - h.x;
  } else if(moveDir) P.vx = moveDir*MOVE_SPEED*SCHLEUDER_ZUG;
  else P.vx = sp > 4 ? -weg*Math.min(1.5, sp*SCHLEUDER_RUECK) : 0;
  if(moveDir) P.facing = moveDir;
  P.vy = Math.min(MAX_FALL, P.vy + GRAVITY);
  if(sp > SCHLEUDER_MAX + 60) P.schleuder = null;   // weggerissen (z. B. Teleporter, bewegter Boden): Seil los
  return true;
}

// ---------- Zeichnen ----------
function schleuderHakenZeichnen(x, y){
  ctx.fillStyle = 'rgba(5,32,46,.55)'; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI*2); ctx.stroke();
  ctx.strokeStyle = '#d9b26a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI*2); ctx.stroke();
  ctx.fillStyle = '#ffe9b0'; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI*2); ctx.fill();
}
// Gummiband Haken -> Ring (zwei Stränge wie bei einer Steinschleuder), Ring mit Glanz
function schleuderBandZeichnen(x, y, rx, ry, zug){
  ctx.save(); ctx.lineCap = 'round';
  for(const d of [-3, 3]){
    ctx.strokeStyle = 'rgba(40,20,10,.7)'; ctx.lineWidth = 4.2; ctx.beginPath(); ctx.moveTo(x + d, y + 6); ctx.lineTo(rx + d*0.6, ry - 6); ctx.stroke();
    ctx.strokeStyle = zug > 0.05 ? `rgb(${200 + Math.round(zug*40)},${90 - Math.round(zug*30)},60)` : '#c8643c'; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(x + d, y + 6); ctx.lineTo(rx + d*0.6, ry - 6); ctx.stroke();
  }
  ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(rx, ry, 7, 0, Math.PI*2); ctx.stroke();
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(rx, ry, 7, 0, Math.PI*2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(rx, ry, 7, Math.PI*1.1, Math.PI*1.6); ctx.stroke();
  ctx.restore();
}
function schleuderZeichnen(){
  for(const s of schleudern){
    const x = s.x - camX, rx = s.rx - camX;
    if(x < -200 || x > VW + 200) continue;
    let zug = 0, P = null;
    for(const F of [p1, p2]) if(F && F.schleuder && F.schleuder.s === s){ P = F; zug = Math.min(1, schleuderSpannung(F)/SCHLEUDER_MAX); }
    // Reichweite zum Werfen (wie beim Haken: blau, wenn der Affe nah genug ist)
    const A = p1 && p1.male ? p1 : p2, h = A ? schleuderHand(A) : null;
    const nah = h && Math.hypot(s.rx - h.x, s.ry - h.y) <= SCHLEUDER_GREIF;
    ctx.fillStyle = nah ? 'rgba(80,170,255,0.14)' : 'rgba(150,150,150,0.1)';
    ctx.strokeStyle = nah ? 'rgba(80,170,255,0.5)' : 'rgba(150,150,150,0.3)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(rx, s.ry, SCHLEUDER_GREIF, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    schleuderBandZeichnen(x, s.y, rx, s.ry, zug);
    schleuderHakenZeichnen(x, s.y);
    if(P){   // Seil vom Ring zur Hand des Affen: gespannt dünner und rötlich (wie die gedehnte Liane)
      const hx = (P._px !== undefined ? P.x : P.x) - camX, hy = P.y - P.h*0.6;
      if(typeof lianeZeichnen === 'function') lianeZeichnen(rx, s.ry, hx, hy, zug, 0, s.x);
    }
  }
}

elementRegistrieren({
  id: 'schleuder', name: 'Schleuder', feld: 'schleudern',
  editor: {
    werkzeug: 'schleuder', gruppe: 'haken', vor: 'move', art: 'punkt', ziehbar: false,
    titel: 'Schleuder: Haken mit Gummiband und Ring darunter. Der Affe wirft sein Seil an den Ring (G halten), läuft weg ' +
           'und spannt es; G loslassen schleudert ihn zurück und schräg hoch (ca. 4 Reihen). Nur der Affe.',
    farbe: '#c8643c',
    optionen: [
      {key: 'unten', label: 'Ring', zahl: true, titel: 'so viele Reihen unter dem Haken hängt der Ring',
       werte: [['3', '3 Reihen tiefer'], ['2', '2 Reihen tiefer'], ['4', '4 Reihen tiefer'], ['1', '1 Reihe tiefer']]},
    ],
    bereich: p => { const n = Number(p.unten) || 3, L = []; for(let i = 0; i <= n; i++) L.push([p.c, p.r + i]); return L; },
    zeichnen(ctx, c, r, TILE, p){
      const n = Number(p && p.unten) || 3, X = c*TILE + TILE/2, Y = r*TILE + TILE/2, RY = Y + n*TILE;
      ctx.save(); ctx.lineCap = 'round';
      ctx.strokeStyle = '#c8643c'; ctx.lineWidth = 2.5;
      for(const d of [-3, 3]){ ctx.beginPath(); ctx.moveTo(X + d, Y + 6); ctx.lineTo(X + d*0.6, RY - 6); ctx.stroke(); }
      ctx.strokeStyle = '#d9b26a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X, Y, TILE*0.25, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X, RY, 7, 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(200,100,60,.5)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(X, RY, SCHLEUDER_GREIF*TILE/40, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE + TILE/2, unten: Number(p.unten) || 3})),
  },
  spiel: {
    laden(daten){
      schleudern = (daten.schleudern || []).map(s => { const n = Number(s.unten) || 3; return {x: s.x, y: s.y, unten: n, rx: s.x, ry: s.y + n*40}; });
    },
    zuruecksetzen(){ for(const P of [p1, p2]) if(P){ P.schleuder = null; P._gAlt = false; } },
    zeichnen: schleuderZeichnen,
  },
});
