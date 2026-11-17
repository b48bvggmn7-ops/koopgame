// elemente/rammbalken.js – Element „Rammbalken“ (Nutzerwunsch 16.11.; Punkt-Element mit Verknüpfungs-Nummer, siehe 00-register.js).
// Ein schwerer, verwitterter Eichenbalken mit Eisenkappe ragt waagerecht aus einer Wand (Führungsklotz mit Eisenbändern an
// einer Mauerplatte). NUR ein DASH gegen seine Stirnseite rammt ihn hinein (Laufen, Springen, Pusten nicht) – im Dschungel
// dasht nur das Schweinchen (DASH_SCHWEIN_IN_AUS_WELTEN, js/02), dort ist er also SEIN Schalter, so wie das Windrad der
// Schalter des Affen ist. Zwei Arten (Editor-Auswahl „Rammbalken“):
//   zeit       – eingerammt ist die Nummer AN; der Balken gleitet langsam wieder heraus (Sperrklinke klickt über die Kerben =
//                sichtbare und hörbare Uhr), nach „Zeit“ Sekunden ist die Nummer wieder AUS (Standard, wie das Nachdrehen des Windrads)
//   umschalten – jeder Rammstoß schaltet die Nummer einmal um (wie ein Hebel); der Balken kommt schnell wieder heraus
// Er ist fest (solids type 'ramm'): man kann darauf stehen – wird er eingerammt, fällt, wer darauf steht. Beim
// Herausgleiten schiebt er Figuren sanft vor sich her (klemmt jemand fest, wartet er).
// Hoch an einer Wand angebracht muss das Schweinchen heranfliegen und im richtigen Moment dashen (Dash nur waagerecht:
// die Stirnseite muss RAMM_TREFFER_MIN px in der Höhe getroffen werden).
// Rolle: nur wer dasht, schaltet – das Schweinchen öffnet dem Affen den Weg (Zeitfenster!), der Affe hilft ihm zum Balken
// (Puste-Wind, Liane) bzw. bringt sich währenddessen in Stellung. Treffer-Erkennung: rammTreffen aus dashBewegen (js/32).
const RAMM_LAENGE = 80;        // px: so weit ragt der Balken in Ruhe aus der Wand (2 Kästchen)
const RAMM_DICK = 22;          // px: Dicke (= Höhe der Stirnseite)
const RAMM_REST = 30;          // px: so viel schaut noch heraus, wenn er ganz eingerammt ist (die Eisenkappe bleibt vor dem Führungsklotz sichtbar)
const RAMM_REIN = 4;           // Schritte: so schnell fährt er beim Treffer hinein
const RAMM_HALT = 30;          // Schritte: so lange bleibt er ganz drin, bevor er zurückgleitet
const RAMM_AN = 0.08;          // „zeit“: die Nummer ist an, solange er tiefer als das steckt
const RAMM_ZEIT_STD = 5;       // Sekunden: Standard-Zeitfenster
const RAMM_UM_ZURUECK = 60;    // Schritte: „umschalten“ – so schnell kommt er wieder ganz heraus
const RAMM_TREFFER_MIN = 6;    // px: so viel muss die Figur die Stirnseite in der Höhe überdecken
const RAMM_KERBEN = 8;         // Kerben auf dem Balken = Klicks der Sperrklinke beim Zurückgleiten
const RAMM_STOPP = 4;          // Trefferstopp (Schritte)
const RAMM_RUECK = 3.2;        // px/Schritt: so stark federt die Figur vom Balken zurück
const RAMM_HUEPFER = 5;        // px/Schritt: kleiner Hüpfer nach einem Stampfer von oben
let rammbalken = [];           // {x, y (Mitte der Stelle, wo er aus der Fläche kommt), dx, dy (wohin er ragt), link, art, zeit, tief (0…1), phase, t, solid}
const rammFx = [];             // Holzsplitter (nur Anzeige, im Takt gerechnet)

function rammLaenge(b){ return RAMM_REST + (RAMM_LAENGE - RAMM_REST)*(1 - b.tief); }
// Richtung (Nutzerwunsch 17.11.: alle vier): b.dx/b.dy = wohin der Balken aus seiner Fläche ragt. Level-Feld „wand“ = wo die
// Fläche ist: rechts (Standard, ragt nach links), links, unten (Boden, ragt nach oben), oben (Decke, hängt nach unten).
const RAMM_RICHTUNG = {rechts: [-1, 0], links: [1, 0], unten: [0, -1], oben: [0, 1]};
const rammRichtungVon = p => RAMM_RICHTUNG[p && p.wand] || RAMM_RICHTUNG.rechts;
// Editor: Kästchen (c, r) direkt an der Fläche -> Punkt, an dem der Balken aus der Fläche kommt
function rammAnker(c, r, T, dx, dy){
  return dx ? [dx > 0 ? c*T : (c + 1)*T, r*T + T/2] : [c*T + T/2, dy < 0 ? (r + 1)*T : r*T];
}
function rammSolidSetzen(b){
  const S = b.solid, len = rammLaenge(b), D = RAMM_DICK;
  if(b.dx){ S.x = b.dx < 0 ? b.x - len : b.x; S.w = len; S.y = b.y - D/2; S.h = D; }
  else { S.y = b.dy < 0 ? b.y - len : b.y; S.h = len; S.x = b.x - D/2; S.w = D; }
}
// Punkt an der Stirnseite (Mitte)
function rammSpitze(b){ const len = rammLaenge(b); return [b.x + b.dx*len, b.y + b.dy*len]; }
// steht die Figur auf der Stirnseite eines Balkens, der aus dem Boden ragt? (dann darf sie am Boden nach unten dashen, js/32)
function rammUnter(P){
  for(const b of rammbalken){
    if(b.dy >= 0) continue; const S = b.solid;
    if(Math.abs(P.y - S.y) <= 3 && Math.min(P.x + P.w/2, S.x + S.w) - Math.max(P.x - P.w/2, S.x) >= RAMM_TREFFER_MIN) return true;
  }
  return false;
}
// „zeit“: wirkt wie eine gedrückte Druckplatte, solange der Balken drin steckt (aus updatePlates, js/05)
function rammWunsch(want){
  for(const b of rammbalken) if(b.art === 'zeit' && b.link) want[b.link] = want[b.link] || b.phase === 'rein' || b.tief > RAMM_AN;
}
// aus dashBewegen (js/32): die Figur ist im Dash gegen etwas gestoßen (sx/sy = Dash-Richtung, eins davon 0) – war es die
// Stirnseite eines Rammbalkens? true = eingerammt
function rammTreffen(P, sx, sy){
  for(const b of rammbalken){
    if(b.dx !== -sx || b.dy !== -sy) continue;           // nur genau in Richtung der Fläche, aus der er ragt
    const S = b.solid;
    if(sx){
      const spitze = b.dx < 0 ? S.x : S.x + S.w, vorn = P.x + sx*P.w/2;
      if(Math.abs(vorn - spitze) > 3) continue;          // steht nicht an der Stirnseite
      if(Math.min(P.y, S.y + S.h) - Math.max(P.y - P.h, S.y) < RAMM_TREFFER_MIN) continue;   // zu hoch / zu tief
    } else {
      const spitze = b.dy < 0 ? S.y : S.y + S.h, vorn = sy > 0 ? P.y : P.y - P.h;   // Füße bzw. Kopf
      if(Math.abs(vorn - spitze) > 3) continue;
      if(Math.min(P.x + P.w/2, S.x + S.w) - Math.max(P.x - P.w/2, S.x) < RAMM_TREFFER_MIN) continue;   // seitlich daneben
    }
    rammEinschlag(b);
    return true;
  }
  return false;
}
function rammEinschlag(b){
  b.phase = 'rein'; b._hitT = performance.now(); b._klickT = 0;
  if(b.link){
    if(b.art === 'umschalten'){ const an = !linkOn[b.link]; setLink(b.link, an); if(typeof SFX !== 'undefined') SFX.lever(an, b.x); }
    if(typeof spiegelAusloesen === 'function') spiegelAusloesen(b.link);
    if(typeof zielHinweisMerken === 'function') zielHinweisMerken(b.link);
  }
  if(typeof neuTrefferStopp !== 'undefined') neuTrefferStopp = Math.max(neuTrefferStopp, RAMM_STOPP);
  if(typeof kameraStoss === 'function') kameraStoss(6);
  if(typeof SFX !== 'undefined' && SFX.rammTreffer) SFX.rammTreffer(b.x);
  // Staub aus der Führung an der Wand, Splitter von der Stirnseite
  const [sx, sy] = rammSpitze(b), qx = -b.dy, qy = b.dx;   // q = quer zum Balken
  if(typeof dustPuff === 'function'){ dustPuff(b.x + b.dx*10 - qx*6, b.y + b.dy*10 - qy*6, 8, b.dx*0.9, 5); dustPuff(b.x + b.dx*6 + qx*10, b.y + b.dy*6 + qy*10, 5, b.dx*0.5, 4); }
  for(let i = 0; i < 9; i++){
    const q = (Math.random() - 0.5)*RAMM_DICK, v = 1 + Math.random()*3.5, s = (Math.random() - 0.5)*3;   // v = von der Fläche weg, s = seitlich
    rammFx.push({x: sx + b.dx*2 + qx*q, y: sy + b.dy*2 + qy*q, vx: b.dx*v + qx*s, vy: b.dy*v + qy*s - (b.dx ? 1 + Math.random()*3.2 : 0.6),
      w: Math.random()*Math.PI, vw: (Math.random() - 0.5)*0.6, l: 3 + Math.random()*6, f: i % 3, leben: 34 + Math.random()*20, max: 54});
  }
}
// aus neueBewegungNachher (js/32), nach dem Dash-Ende: die Figur federt ein Stück zurück (sx/sy = Dash-Richtung)
function rammRueckstoss(P, sx, sy){
  if(sx){ P.vx = -sx*RAMM_RUECK; if(!P.grounded) P.vy = Math.min(P.vy, -2.4); }
  else if(sy > 0){ P.vy = -RAMM_HUEPFER; P.grounded = false; }   // von oben draufgestampft: kleiner Hüpfer
  else P.vy = RAMM_RUECK;                                        // von unten gegen den hängenden Balken: fällt zurück
}
function rammSchritt(figuren){
  for(const f of rammFx){ f.leben--; f.x += f.vx; f.y += f.vy; f.vy += 0.42; f.vx *= 0.97; f.w += f.vw; }
  for(let i = rammFx.length - 1; i >= 0; i--) if(rammFx[i].leben <= 0) rammFx.splice(i, 1);
  for(const b of rammbalken){
    if(b.phase === 'rein'){
      b.tief = Math.min(1, b.tief + 1/RAMM_REIN);
      if(b.tief >= 1){ b.phase = 'halt'; b.t = b.art === 'umschalten' ? 10 : RAMM_HALT; }
      rammSolidSetzen(b);
    } else if(b.phase === 'halt'){
      if(--b.t <= 0) b.phase = 'raus';
    } else if(b.phase === 'raus'){
      // „zeit“: genau b.zeit Sekunden nach dem Treffer ist er bis RAMM_AN heraus (dann geht die Nummer aus)
      const dauer = b.art === 'umschalten' ? RAMM_UM_ZURUECK : Math.max(30, (b.zeit*60 - RAMM_HALT - RAMM_REIN)/(1 - RAMM_AN));
      const alt = b.tief; b.tief = Math.max(0, alt - 1/dauer); rammSolidSetzen(b);
      // wer vor der Stirnseite steht, wird sanft mitgeschoben; klemmt jemand fest, wartet der Balken
      let klemmt = false;
      for(const P of figuren){
        if(!P || (deathState && deathState.victim === P)) continue;
        const S = b.solid, box = {x: P.x - P.w/2, y: P.y - P.h, w: P.w, h: P.h};
        if(b.dx){
          if(!rectsOverlap(box, S)) continue;
          const nx = b.dx < 0 ? S.x - P.w/2 - 0.01 : S.x + S.w + P.w/2 + 0.01;
          if(spotFree(nx, P.y, P)) P.x = nx; else klemmt = true;
        } else if(b.dy < 0){   // ragt aus dem Boden: wer oben draufsteht, fährt mit hoch
          if(!rectsOverlap(box, {x: S.x, y: S.y - 2, w: S.w, h: S.h + 2}) || P.vy < 0) continue;
          const ny = S.y - 0.01;
          if(spotFree(P.x, ny, P)){ P.y = ny; if(P.vy > 0) P.vy = 0; } else klemmt = true;
        } else {               // hängt von der Decke: schiebt nach unten
          if(!rectsOverlap(box, S)) continue;
          const ny = S.y + S.h + P.h + 0.01;
          if(spotFree(P.x, ny, P)) P.y = ny; else klemmt = true;
        }
      }
      if(klemmt){ b.tief = alt; rammSolidSetzen(b); continue; }
      if(Math.floor(alt*RAMM_KERBEN - 1e-9) !== Math.floor(b.tief*RAMM_KERBEN - 1e-9) && b.tief > 0){   // Sperrklinke springt über eine Kerbe
        b._klickT = performance.now();
        if(typeof SFX !== 'undefined' && SFX.rammKlick) SFX.rammKlick(b.x, 1 - b.tief);
      }
      if(b.tief <= 0){ b.phase = 'ruhe'; b._rausT = performance.now(); if(typeof SFX !== 'undefined' && SFX.rammRaus) SFX.rammRaus(b.x); }
    }
  }
}

// ---------- Aussehen ----------
// Bild in eigenen Koordinaten: Ursprung = Wandkante auf Balkenmitte, +u zeigt von der Wand weg (der Aufrufer spiegelt).
// o: {len (sichtbare Länge), farbe (Nummer), an, wackel (px), klick (0…1 Klinke hebt sich), funke (0…1 Einschlag), foto}
function rammBild(g, o){
  const L = o.len, D = RAMM_DICK, h = D/2, foto = o.foto && typeof fotoHolzMuster === 'function';
  const eisen = (x, y, w, hh, niet) => { if(typeof fotoEisenBand === 'function') fotoEisenBand(g, x, y, w, hh, niet); else { g.fillStyle = '#3e352f'; g.fillRect(x, y, w, hh); } };
  const eisenV = (u, v, w, hh, niet) => { g.save(); g.translate(u + w, v); g.rotate(Math.PI/2); eisen(0, 0, hh, w, niet); g.restore(); };   // senkrechtes Band
  const senk = !!o.senk;   // senkrecht eingebaut (Boden/Decke): nichts zeichnen, was „nach unten“ hängt oder läuft – das läge sonst quer
  const bolzen = (u, v) => { if(!senk){ g.fillStyle = 'rgba(120,60,24,.35)'; g.beginPath(); g.ellipse(u + 0.3, v + 1.8, 1.4, 2.6, 0, 0, 7); g.fill(); }   // Rostfahne
    g.fillStyle = '#1b1613'; g.fillRect(u - 1.7, v - 1.7, 3.4, 3.4); g.fillStyle = 'rgba(255,235,210,.35)'; g.fillRect(u - 1.5, v - 1.5, 1.4, 0.7); };
  // Mauerplatte an der Wand (rostiges Eisen, vier Bolzen)
  eisenV(-2, -25, 4.5, 50, 0);
  for(const v of [-21, 21]) bolzen(0.3, v);

  // --- Balken (bewegt sich; die Maserung, Risse, Kerben und das Moos hängen an der Spitze und gleiten mit) ---
  g.save(); g.translate(0, o.wackel || 0);
  g.fillStyle = foto ? fotoHolzMuster(g, true, L, -h) : '#7d6245'; g.fillRect(0, -h, L, D);
  g.fillStyle = 'rgba(20,14,8,.26)'; g.fillRect(0, -h, L, D);                                    // altes, nasses Holz
  const gl = g.createLinearGradient(0, -h, 0, h);
  gl.addColorStop(0, 'rgba(255,240,210,.24)'); gl.addColorStop(0.3, 'rgba(255,240,210,0)'); gl.addColorStop(0.62, 'rgba(0,0,0,0)'); gl.addColorStop(1, 'rgba(0,0,0,.5)');
  g.fillStyle = gl; g.fillRect(0, -h, L, D);
  g.fillStyle = 'rgba(232,214,180,.32)'; g.fillRect(0, -h, L, 1);                                 // abgegriffene helle Oberkante
  g.fillStyle = 'rgba(8,6,4,.45)'; g.fillRect(0, h - 1.2, L, 1.2);                                // Unterkante im Schatten
  g.strokeStyle = 'rgba(18,12,7,.55)'; g.lineWidth = 0.7; g.lineCap = 'round';                    // Risse längs der Maserung
  for(const [a, l, v] of [[15, 17, -2.5], [36, 12, 4.5], [50, 10, -0.5], [24, 8, 6.5]]){ const u1 = L - a, u0 = Math.max(18, u1 - l); if(u1 <= 19) continue;
    g.beginPath(); g.moveTo(u0, v); g.quadraticCurveTo((u0 + u1)/2, v + 0.9, u1, v + 0.3); g.stroke(); }
  // Kerben für die Sperrklinke (oben), gleichmäßig über den Hub
  const hub = RAMM_LAENGE - RAMM_REST;
  for(let i = 0; i < RAMM_KERBEN; i++){
    const u = L - 13 - i*(hub - 4)/RAMM_KERBEN; if(u < 17) break;
    g.fillStyle = 'rgba(12,8,5,.9)'; g.beginPath(); g.moveTo(u - 2, -h); g.lineTo(u + 0.5, -h + 3); g.lineTo(u + 1.2, -h); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(232,214,180,.3)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(u + 0.5, -h + 3); g.lineTo(u + 1.2, -h); g.stroke();
  }
  // Moos oben (zwischen den Kerben) und zwei Moosfäden unten
  if(senk){   // senkrecht: Moos sitzt flach als Flecken auf beiden Seiten (wetterseitig mehr), keine Polster, keine Fäden
    g.fillStyle = 'rgba(70,88,40,.6)';
    for(const [a, rx, v, ry] of [[24, 5, -h + 2.2, 2.2], [45, 6.5, -h + 2.6, 2.6], [61, 4, -h + 1.8, 1.8], [52, 4, h - 2, 1.6]]){ const u = L - a; if(u < 22) continue;
      g.beginPath(); g.ellipse(u, v, rx, ry, 0, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(96,116,54,.5)';
    for(const [a, rx] of [[22, 2.2], [46.5, 3]]){ const u = L - a; if(u < 22) continue; g.beginPath(); g.ellipse(u, -h + 1.6, rx, 1.1, 0, 0, 7); g.fill(); }
  } else {
  g.fillStyle = 'rgba(70,88,40,.88)';
  for(const [a, rx] of [[22, 4.6], [43, 5.8], [60, 3.6]]){ const u = L - a; if(u < 20) continue; g.beginPath(); g.ellipse(u, -h + 0.2, rx, 1.9, 0, Math.PI, 0); g.fill(); }
  g.fillStyle = 'rgba(96,116,54,.7)';
  for(const [a, rx] of [[20.5, 2], [44.5, 2.6]]){ const u = L - a; if(u < 20) continue; g.beginPath(); g.ellipse(u, -h - 0.4, rx, 1, 0, Math.PI, 0); g.fill(); }
  g.strokeStyle = 'rgba(70,86,40,.75)'; g.lineWidth = 0.8;
  for(const [a, l] of [[30, 6], [47, 4], [58, 7]]){ const u = L - a; if(u < 20) continue; g.beginPath(); g.moveTo(u, h - 0.5); g.quadraticCurveTo(u + 1, h + l*0.6, u - 0.6, h + l); g.stroke(); }
  }
  // zweites, schmales Eisenband und die Eisenkappe an der Stirnseite (zwei Nieten, Dellen, helle Schlagkante)
  if(L - 34 > 19) eisenV(L - 34, -h - 0.6, 3.6, D + 1.2, 0);
  eisenV(L - 10, -h - 1.6, 10, D + 3.2, 0);
  for(const v of [-6, 6]){ g.fillStyle = '#17120f'; g.beginPath(); g.arc(L - 5.6, v, 1.5, 0, 7); g.fill(); g.fillStyle = 'rgba(255,235,210,.4)'; g.beginPath(); g.arc(L - 6, v - 0.5, 0.55, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(L - 2.2, 1.5, 1.6, 3, 0, 0, 7); g.fill();          // Delle vom vielen Rammen
  g.fillStyle = 'rgba(255,238,215,.3)'; g.fillRect(L - 1, -h - 1.2, 1, D + 2.4);                             // blanke Schlagkante
  if(!senk){ g.fillStyle = 'rgba(150,76,30,.4)'; g.fillRect(L - 10, h - 1, 9, 2.8); }                        // Rost läuft unten ab
  if(o.funke > 0){   // Einschlag: kurzes helles Aufblitzen an der Stirnseite
    g.save(); g.globalCompositeOperation = 'lighter';
    const gf = g.createRadialGradient(L, 0, 0, L, 0, 30); gf.addColorStop(0, `rgba(255,236,190,${0.75*o.funke})`); gf.addColorStop(1, 'rgba(255,200,120,0)');
    g.fillStyle = gf; g.beginPath(); g.arc(L, 0, 30, 0, 7); g.fill(); g.restore();
  }
  g.restore();

  // --- Führungsklotz an der Wand (fest): Hartholz mit zwei Eisenbändern, Bolzen, Edelstein in der Nummernfarbe ---
  const gs = g.createLinearGradient(16, 0, 26, 0); gs.addColorStop(0, 'rgba(0,0,0,.45)'); gs.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gs; g.fillRect(16, -h, 10, D);                                                              // Schatten des Klotzes auf dem Balken
  g.fillStyle = 'rgba(10,8,6,.55)'; g.fillRect(1.5, -20.5, 15.5, 41);                                        // dunkle Fuge rundum
  g.fillStyle = foto ? fotoHolzMuster(g, false, 2.5, -19.5) : '#6b5238'; g.fillRect(2.5, -19.5, 13.5, 39);
  g.fillStyle = 'rgba(20,14,8,.4)'; g.fillRect(2.5, -19.5, 13.5, 39);
  const gk = g.createLinearGradient(2.5, 0, 16, 0); gk.addColorStop(0, 'rgba(0,0,0,.4)'); gk.addColorStop(0.55, 'rgba(0,0,0,0)'); gk.addColorStop(1, 'rgba(255,240,210,.18)');
  g.fillStyle = gk; g.fillRect(2.5, -19.5, 13.5, 39);
  g.fillStyle = 'rgba(150,118,82,.5)'; g.fillRect(15, -19.5, 1, 39);                                         // Hirnholz-Kante vorn
  eisen(1.5, -20.5, 15.5, 4.2, 0); eisen(1.5, 16.3, 15.5, 4.2, 0);
  bolzen(9.2, -18.4); bolzen(9.2, 18.4);
  if(!senk){ g.fillStyle = 'rgba(64,78,36,.85)'; g.beginPath(); g.ellipse(7, -20.6, 4.6, 1.7, 0, Math.PI, 0); g.fill(); }   // Moos oben auf dem Klotz
  // Sperrklinke: kleiner Eisenhaken oben am Klotz, liegt in den Kerben (hebt sich bei jedem Klick)
  const lift = (o.klick || 0)*2.6;
  g.strokeStyle = '#14100d'; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(10, -22.5); g.lineTo(20.5, -17.5 - lift); g.lineTo(20.5, -h - 0.4 - lift); g.stroke();
  g.strokeStyle = '#4b423b'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(10, -22.5); g.lineTo(20.5, -17.5 - lift); g.lineTo(20.5, -h - 0.4 - lift); g.stroke();
  g.strokeStyle = 'rgba(255,238,215,.22)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(10.4, -23.4); g.lineTo(20, -18.4 - lift); g.stroke();   // Lichtkante
  g.fillStyle = '#1b1613'; g.beginPath(); g.arc(10, -22.5, 2.3, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,235,210,.35)'; g.beginPath(); g.arc(9.5, -23, 0.8, 0, 7); g.fill();
  // Edelstein in einer Eisenfassung (leuchtet, solange die Nummer an ist)
  if(o.an){ g.save(); g.globalCompositeOperation = 'lighter'; const ge = g.createRadialGradient(9.2, 0, 0, 9.2, 0, 20);
    ge.addColorStop(0, typeof farbeMitAlpha === 'function' ? farbeMitAlpha(o.farbe, 0.55) : 'rgba(255,220,150,.5)'); ge.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = ge; g.beginPath(); g.arc(9.2, 0, 20, 0, 7); g.fill(); g.restore(); }
  g.fillStyle = 'rgba(12,9,7,.9)'; g.beginPath(); g.arc(9.2, 0, 6.4, 0, 7); g.fill();
  g.strokeStyle = 'rgba(96,84,74,.9)'; g.lineWidth = 1; g.beginPath(); g.arc(9.2, 0, 5.9, 0, 7); g.stroke();
  if(typeof elementEdelstein === 'function' && typeof ctx !== 'undefined' && g === ctx) elementEdelstein(9.2, 0, 4.8, o.farbe);
  else { g.fillStyle = o.farbe; g.beginPath(); g.arc(9.2, 0, 4, 0, 7); g.fill(); }
}
// dreht das Bild so, dass +u in Balken-Richtung zeigt; die helle Seite (Bild-oben) liegt bei senkrechten Balken immer links
function rammDrehen(g, dx, dy){
  if(dx) g.scale(dx, 1);
  else if(dy < 0) g.rotate(-Math.PI/2);
  else { g.rotate(Math.PI/2); g.scale(1, -1); }
}
function rammZeichnen(){
  const now = performance.now(), foto = typeof fotoEl2An === 'function' && fotoEl2An();
  for(const b of rammbalken){
    const x = Math.round(b.x - camX);
    if(x < -130 || x > VW + 130) continue;
    const col = linkColor(b.link), an = !!linkOn[b.link];
    const seit = b._hitT ? now - b._hitT : 1e9, klick = b._klickT ? Math.max(0, 1 - (now - b._klickT)/140) : 0;
    const wackel = seit < 340 ? Math.sin(seit*0.075)*2.4*(1 - seit/340) : 0;
    ctx.save(); ctx.translate(x, b.y); rammDrehen(ctx, b.dx, b.dy);
    rammBild(ctx, {len: rammLaenge(b), farbe: col, an, wackel, klick, funke: seit < 160 ? 1 - seit/160 : 0, foto, senk: !b.dx});
    ctx.restore();
    if(b.phase === 'ruhe' && !an && typeof hinweisPfeil === 'function'){
      if(b.dx) hinweisPfeil(x + b.dx*(RAMM_LAENGE - 14), b.y - 36, col);
      else if(b.dy < 0) hinweisPfeil(x, b.y - RAMM_LAENGE - 30, col);
      else hinweisPfeil(x - 34, b.y + RAMM_LAENGE - 24, col);
    }
  }
  for(const f of rammFx){   // Holzsplitter
    const x = f.x - camX; if(x < -40 || x > VW + 40) continue;
    ctx.save(); ctx.translate(x, f.y); ctx.rotate(f.w); ctx.globalAlpha = Math.min(1, f.leben/14);
    ctx.fillStyle = ['#7a6248', '#4f3d2b', '#a08462'][f.f]; ctx.fillRect(-f.l/2, -0.9, f.l, 1.8);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
ELEMENT_SOLID_TYPEN.add('ramm');
elementRegistrieren({
  id: 'rammbalken', name: 'Rammbalken', feld: 'rammbalken',
  editor: {
    werkzeug: 'ramm', gruppe: 'logik', vor: '#linkSelect', art: 'punkt', ziehbar: false, farbe: '#7d6245',
    mitNummer: true, nummerName: 'Rammbalken',
    titel: 'Rammbalken: ragt 2 Kästchen aus einer Wand, dem Boden oder der Decke (Auswahl „Richtung“), nur ein Dash gegen die Stirnseite rammt ihn hinein (im Dschungel dasht nur das ' +
           'Schweinchen; hoch/runter + Dash = senkrecht). Ins Kästchen direkt AN der Fläche setzen. „Zeitfenster“: Nummer AN, bis er wieder herausgeglitten ist; ' +
           '„umschalten“: jeder Stoß schaltet um (wie ein Hebel)',
    optionen: [
      {key: 'wand', label: 'Richtung', titel: 'woraus der Balken ragt: Wand rechts/links, Boden (ragt nach oben, von oben draufstampfen) oder Decke (hängt nach unten, von unten rammen)',
       werte: [['rechts', 'Wand rechts'], ['links', 'Wand links'], ['unten', 'Boden (ragt hoch)'], ['oben', 'Decke (hängt runter)']]},
      {key: 'art', label: 'Rammbalken', titel: 'Zeitfenster: an, bis er wieder heraus ist – oder: jeder Stoß schaltet um', werte: [['zeit', 'Zeitfenster'], ['umschalten', 'umschalten']]},
      {key: 'zeit', label: 'Zeit', zahl: true, titel: 'so lange bleibt die Nummer nach dem Rammstoß an (nur „Zeitfenster“)',
       werte: [['5', '5 s'], ['3', '3 s'], ['8', '8 s'], ['12', '12 s']]},
    ],
    // sichtbar belegt: das Kästchen an der Wand und das davor (Rechtsklick/Radierer)
    bereich: p => { const [dx, dy] = rammRichtungVon(p); return [[p.c, p.r], [p.c + dx, p.r + dy]]; },
    zeichnen(ctx, c, r, TILE, p){
      const [dx, dy] = rammRichtungVon(p), [wx, y] = rammAnker(c, r, TILE, dx, dy), k = TILE/40;
      const col = typeof linkColor === 'function' && p ? linkColor(p.link) : '#ff9f43';
      ctx.save(); ctx.translate(wx, y); rammDrehen(ctx, dx, dy); ctx.scale(k, k);
      ctx.fillStyle = '#3e352f'; ctx.fillRect(-2, -25, 4.5, 50);
      ctx.fillStyle = '#7d6245'; ctx.fillRect(0, -11, RAMM_LAENGE, 22);
      ctx.fillStyle = 'rgba(255,240,210,.25)'; ctx.fillRect(0, -11, RAMM_LAENGE, 3); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(0, 6, RAMM_LAENGE, 5);
      ctx.fillStyle = '#3e352f'; ctx.fillRect(RAMM_LAENGE - 10, -12.5, 10, 25);
      ctx.fillStyle = '#5a4632'; ctx.fillRect(2.5, -19.5, 13.5, 39);
      ctx.fillStyle = '#3e352f'; ctx.fillRect(1.5, -20.5, 15.5, 4); ctx.fillRect(1.5, 16.5, 15.5, 4);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(9.2, 0, 4.6, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      if(p){
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; const t = (p.art === 'umschalten' ? '' : '~') + String(p.link);
        const tx = dx ? wx + dx*TILE*1.2 : wx + TILE*0.27, ty = dx ? r*TILE + 7 : y + dy*TILE*1.5;   // bleibt in den belegten Kästchen
        ctx.strokeText(t, tx, ty); ctx.fillText(t, tx, ty);
      }
    },
    exportieren: (liste, TILE) => liste.map(p => { const [dx, dy] = rammRichtungVon(p), [x, y] = rammAnker(p.c, p.r, TILE, dx, dy);
      return {x, y, link: p.link,
        ...(RAMM_RICHTUNG[p.wand] && p.wand !== 'rechts' ? {wand: p.wand} : {}), ...(p.art === 'umschalten' ? {art: 'umschalten'} : {}),
        ...(Number(p.zeit) > 0 && Number(p.zeit) !== RAMM_ZEIT_STD ? {zeit: Number(p.zeit)} : {})}; }),
  },
  spiel: {
    laden(daten){
      rammbalken = (daten.rammbalken || []).map(b => ({x: b.x, y: b.y, dx: rammRichtungVon(b)[0], dy: rammRichtungVon(b)[1], link: b.link, art: b.art === 'umschalten' ? 'umschalten' : 'zeit',
        zeit: Number(b.zeit) > 0 ? Number(b.zeit) : RAMM_ZEIT_STD, tief: 0, phase: 'ruhe', t: 0, solid: {type: 'ramm', x: 0, y: 0, w: 0, h: 0}}));
      rammFx.length = 0;
      for(const b of rammbalken){ rammSolidSetzen(b); solids.push(b.solid); }
    },
    zuruecksetzen(){ rammFx.length = 0; for(const b of rammbalken){ b.tief = 0; b.phase = 'ruhe'; b.t = 0; b._hitT = 0; b._klickT = 0; rammSolidSetzen(b); } },
    schritt(figuren){ if(rammbalken.length || rammFx.length) rammSchritt(figuren); },
    zeichnen: rammZeichnen,
  },
});
