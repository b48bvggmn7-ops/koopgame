// elemente/schleuder.js – Element „Schleuder“ (Punkt-Element; Aufbau siehe 00-register.js). Nutzerwunsch: zweites
// Haken-Element neben dem Schwung-Haken – EIN Punkt (an die Kante setzen, auf die es hinaufgehen soll). Der Affe wirft seine
// Liane an den Punkt (Haken-Taste G drücken und halten; ist er nah genug, leuchtet der Punkt auf – Kreis nur im Editor), läuft ein paar Schritte vom
// Punkt weg und spannt die Liane wie ein Gummi (wird zum Ende zäher). Lässt er G los, schleudert ihn die Liane hinauf zum
// Punkt: voll gespannt bis knapp über den Punkt und ein kleines Stück darüber hinaus (bewusst „nur ein bisschen“) – weniger
// gespannt entsprechend kürzer. Springen löst ohne Schub. Ersetzt die alten Aufzug-Haken, an denen man beim Hochziehen an
// die Kante stieß.
// Rolle: nur der Affe (er braucht seine Liane) – er kommt so auf eine Kante und hilft oben dem Schweinchen weiter (Hebel,
// Druckplatte, Tür); das Schweinchen braucht dafür einen eigenen Weg (Schirm, Aufwind, Pilz).
// Im Spiel: schleudern = [{x, y}]; der Zustand am Affen steht in P.schleuder = {s, x0 (Platz beim ersten Schritt), weg (Spann-Richtung, 0 = noch keine)}.
// Aufrufe: schleuderVorher aus neueBewegungVorher (js/32-neue-bewegung.js) – dort ist die Taste G frei, die alte
// Seil-Physik in js/08 bleibt unberührt.
const SCHLEUDER_REICHWEITE = 260; // (wie HOOK_MAX_RANGE) so nah (Hände -> Punkt, px) muss der Affe sein, um die Liane an den Punkt zu werfen
const SCHLEUDER_MAX = 120;        // so weit (px) läuft man beim Spannen höchstens vom Greif-Platz weg (= volle Spannung)
const SCHLEUDER_MIN = 20;         // darunter gibt es beim Loslassen keinen Schub
const SCHLEUDER_UEBER = 14;       // voll gespannt: die Füße kommen bis so weit (px) über den Punkt …
const SCHLEUDER_WEITER = 44;      // … und fliegen so weit (px) über den Punkt hinaus (dann landet er auf der Kante)
const SCHLEUDER_HOEHE_MAX = 380;  // höchstens so hoch (px, Füße) geht der Schub
const SCHLEUDER_ZUG = 0.85;       // Lauftempo beim Spannen (Anteil von MOVE_SPEED, wird zum Ende hin langsamer)
const SCHLEUDER_RUECK = 0.03;     // ohne Taste zieht die Liane den Affen langsam zurück (Anteil der Spannung je Schritt)
let schleudern = [];

const schleuderHand = P => ({x: P.x, y: P.y - P.h*0.6});
// Spannung = wie weit der Affe seit dem Greifen vom Punkt weggelaufen ist (px)
function schleuderSpannung(P){
  const S = P.schleuder; if(!S) return 0;
  return Math.max(0, (P.x - S.x0)*S.weg);
}
// Punkt in Reichweite (und freie Sicht)? Der nächste zählt.
function schleuderZiel(P){
  const h = schleuderHand(P);
  let best = null, bd = Infinity;
  for(const s of schleudern){
    const d = Math.hypot(s.x - h.x, s.y - h.y);
    if(d <= SCHLEUDER_REICHWEITE && d < bd && lineClear(h.x, h.y, s.x, s.y)){ best = s; bd = d; }
  }
  return best;
}
function schleuderLos(P, schub){
  const S = P.schleuder; if(!S) return;
  const k = schub ? Math.max(0, Math.min(1, (schleuderSpannung(P) - SCHLEUDER_MIN)/(SCHLEUDER_MAX - SCHLEUDER_MIN))) : 0;
  P.schleuder = null;
  if(k > 0){
    // Bahn zum Punkt: Gipfel (Füße) knapp über dem Punkt und ein Stück dahinter; weniger Spannung = kleinere Bahn (√k)
    const H = S.s, richtung = -S.weg;
    const hoch = Math.min(SCHLEUDER_HOEHE_MAX, Math.max(40, P.y - (H.y - SCHLEUDER_UEBER)));
    const vy = Math.sqrt(2*GRAVITY*hoch), t = vy/GRAVITY;
    const weit = Math.max(0, (H.x + richtung*SCHLEUDER_WEITER - P.x)*richtung);
    P.vx = richtung*(weit/t)*Math.sqrt(k); P.vy = -vy*Math.sqrt(k);
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
    const h = schleuderHand(P);
    if(P.hookAttached){   // derselbe Druck hat auch einen Schwung-Haken gegriffen: der nähere gewinnt
      if(Math.hypot(P.anchor.x - h.x, P.anchor.y - h.y) < Math.hypot(s.x - h.x, s.y - h.y)) return false;
      P.hookAttached = false;
    }
    // weg = Richtung, in die man spannt: die erste Laufrichtung nach dem Greifen (geschleudert wird in die Gegenrichtung –
    // man läuft also einfach von der Kante weg, auf die man will; egal, ob man links/rechts vom Punkt oder darunter steht)
    P.schleuder = {s, x0: P.x, weg: 0}; P.schleuderSchub = 0;
    if(typeof SFX !== 'undefined' && SFX.hookAttach) SFX.hookAttach(P);
  }
  const S = P.schleuder;
  if(P.dash || P.dashPuffer > 0 || P.hookAttached || P.haft){ P.schleuder = null; return false; }
  if(!g){ schleuderLos(P, true); return !!P.schleuderSchub; }
  if(jumpPressed){ P.schleuder = null; return false; }   // Springen: Liane los, normaler Sprung
  // Spannen: weg vom Punkt wird es zäher, bei voller Spannung geht es nicht weiter; ohne Taste zieht die Liane zurück
  if(!S.weg && moveDir){ S.weg = moveDir; S.x0 = P.x; }
  const sp = schleuderSpannung(P);
  if(moveDir && moveDir === S.weg){
    P.vx = moveDir*MOVE_SPEED*SCHLEUDER_ZUG*Math.max(0.35, 1 - sp/SCHLEUDER_MAX);
    if(sp + P.vx*S.weg > SCHLEUDER_MAX) P.vx = (SCHLEUDER_MAX - sp)*S.weg;   // genau bis zur vollen Spannung
  } else if(moveDir) P.vx = moveDir*MOVE_SPEED*SCHLEUDER_ZUG;
  else P.vx = sp > 4 ? -S.weg*Math.min(1.5, sp*SCHLEUDER_RUECK) : 0;
  if(moveDir) P.facing = moveDir;
  P.vy = Math.min(MAX_FALL, P.vy + GRAVITY);
  const h = schleuderHand(P);
  if(Math.hypot(h.x - S.s.x, h.y - S.s.y) > SCHLEUDER_REICHWEITE + SCHLEUDER_MAX + 80) P.schleuder = null;   // weggerissen (Teleporter, Fahrt)
  return true;
}

// ---------- Zeichnen ----------
// Schleuder-Punkt: kleine Astgabel mit Gummi (Steinschleuder). Im Spiel KEIN Reichweiten-Kreis (Nutzerwunsch, nur im Editor):
// ist der Affe nah genug (und die Sicht frei), „wacht“ der Punkt auf – er leuchtet warm, pulsiert und bekommt einen hellen
// Ring; sonst ruht er gedämpft.
function schleuderPunktZeichnen(x, y, an){
  const t = performance.now(), pulse = an ? 2 + Math.sin(t*0.009 + x*0.05)*2 : 0;
  if(an){ elementLeuchten(x, y, 34 + pulse*2, '#ffb15a'); }
  ctx.fillStyle = an ? 'rgba(60,30,10,.6)' : 'rgba(40,20,8,.35)'; ctx.beginPath(); ctx.arc(x, y, an ? 20 : 15, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = an ? 'rgba(255,175,85,.8)' : 'rgba(170,130,95,.45)'; ctx.beginPath(); ctx.arc(x, y, (an ? 14 : 10) + pulse, 0, Math.PI*2); ctx.fill();
  if(an){ ctx.strokeStyle = 'rgba(255,240,200,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 18 + pulse, 0, Math.PI*2); ctx.stroke(); }
  ctx.save(); ctx.lineCap = 'round'; ctx.globalAlpha = an ? 1 : 0.7;
  ctx.strokeStyle = '#4a2c14'; ctx.lineWidth = 5;   // Astgabel
  ctx.beginPath(); ctx.moveTo(x, y + 11); ctx.lineTo(x, y + 2); ctx.moveTo(x, y + 3); ctx.lineTo(x - 7, y - 8); ctx.moveTo(x, y + 3); ctx.lineTo(x + 7, y - 8); ctx.stroke();
  ctx.strokeStyle = an ? '#c98a4c' : '#8a6a4c'; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(x, y + 11); ctx.lineTo(x, y + 2); ctx.moveTo(x, y + 3); ctx.lineTo(x - 7, y - 8); ctx.moveTo(x, y + 3); ctx.lineTo(x + 7, y - 8); ctx.stroke();
  ctx.strokeStyle = an ? '#ff7a3c' : '#9a6650'; ctx.lineWidth = 2;   // Gummi zwischen den Gabel-Enden
  ctx.beginPath(); ctx.moveTo(x - 7, y - 8); ctx.quadraticCurveTo(x, y - 3, x + 7, y - 8); ctx.stroke();
  ctx.restore();
  if(an) glanzFunkeln(x - 6, y - 9, 5, x*0.11 + y);
}
// in Reichweite (Hände -> Punkt) und freie Sicht = der Punkt ist „an“ (genau dann greift G)
function schleuderAktiv(s, A){
  if(!A) return false;
  if(A.schleuder) return A.schleuder.s === s;
  const h = schleuderHand(A);
  return Math.hypot(s.x - h.x, s.y - h.y) <= SCHLEUDER_REICHWEITE && lineClear(h.x, h.y, s.x, s.y);
}
function schleuderZeichnen(){
  const A = p1 && p1.male ? p1 : p2;
  for(const s of schleudern){
    const x = s.x - camX;
    if(x < -40 || x > VW + 40) continue;
    for(const F of [p1, p2]) if(F && F.schleuder && F.schleuder.s === s && typeof lianeZeichnen === 'function'){
      // die normale Liane vom Punkt zur Hand – beim Spannen nur leicht gedehnt (bleibt eine Liane)
      const zug = Math.min(1, schleuderSpannung(F)/SCHLEUDER_MAX);
      lianeZeichnen(x, s.y, F.x - camX, F.y - F.h*0.6, zug*0.45, 0, s.x);
    }
    schleuderPunktZeichnen(x, s.y, schleuderAktiv(s, A));
  }
}

elementRegistrieren({
  id: 'schleuder', name: 'Schleuder', feld: 'schleudern',
  editor: {
    werkzeug: 'schleuder', gruppe: 'haken', vor: 'move', art: 'punkt', ziehbar: false,
    titel: 'Schleuder: EIN Punkt – an die Kante setzen, auf die es hinaufgehen soll (Reichweite 6,5 Kästchen, Kreis). Der Affe wirft ' +
           'seine Liane an den Punkt (G halten), läuft ein paar Schritte von der Kante weg und spannt sie; G loslassen schleudert ihn zum Punkt ' +
           'hinauf und knapp darüber. Nur der Affe.',
    farbe: '#c8643c',
    zeichnen(ctx, c, r, TILE){
      const X = c*TILE + TILE/2, Y = r*TILE + TILE/2;
      ctx.save(); ctx.lineCap = 'round';
      ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(255,170,80,0.45)'; ctx.lineWidth = 1.5; ctx.fillStyle = 'rgba(255,170,80,0.05)';
      ctx.beginPath(); ctx.arc(X, Y, SCHLEUDER_REICHWEITE*TILE/40, 0, Math.PI*2); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#ffb066'; ctx.beginPath(); ctx.arc(X, Y, TILE*0.3, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#7a3c14'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = '#4a2c14'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(X, Y + 7); ctx.lineTo(X, Y + 1); ctx.lineTo(X - 5, Y - 6); ctx.moveTo(X, Y + 1); ctx.lineTo(X + 5, Y - 6); ctx.stroke();
      ctx.restore();
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE + TILE/2})),
  },
  spiel: {
    laden(daten){
      schleudern = (daten.schleudern || []).map(s => ({x: s.x, y: s.y}));   // alte Daten mit „unten“ (Ring): der Punkt ist der alte Haken
    },
    zuruecksetzen(){ for(const P of [p1, p2]) if(P){ P.schleuder = null; P._gAlt = false; } },
    zeichnen: schleuderZeichnen,
  },
});
