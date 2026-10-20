// 32-neue-bewegung.js – Teil des Spiels "Monchichi Koop" (Nacht-Ausbau).
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.
//
// Neue Mechaniken aus der Spielwiese (Werte: js/02-physik-werte.js, Abschnitt „Nacht-Ausbau“), NEU gebaut für die echte
// Physik. HARTE REGEL: Sprung, Wandsprung, Haken, Laufen, Schwerkraft, Segeln, Aufwind und Pilze bleiben unverändert.
// Alles hier sind EIGENE, zusätzliche Zustände, die nur anspringen, wenn
//   - die Dash-Taste gedrückt wird (Dash, inkl. Durchbruch-Wände, die nur ein Dash zerbricht),
//   - die Figur die Rutsch-Bedingung erfüllt (an der Wand, nicht am Seil, ohne Schirm, Fall schneller als 4,5),
//   - die Figur sich an einer Haftfläche festhält („hoch“-Taste halten unter einer Haftfläche).
// Ohne diese drei verhält sich das Spiel Schritt für Schritt wie vorher (Beweis: Test bahnen_alte_mechaniken).
// Aufrufe aus js/08-figur-physik-seil.js: neueBewegungVorher (vor dem Tempo), wandRutschen (nach der Wandprüfung),
// dashBewegen (statt der normalen Bewegung, nur während eines Dashs), neueBewegungNachher (nach dem Bewegen).
// Trefferstopp (kurzes Anhalten beim Dash-Start und beim Durchbruch): js/14-spielschleife.js (neuTrefferStopp).

let neuTrefferStopp = 0;   // Schritte, die das ganze Spiel kurz anhält (Dash-Start, Durchbruch) – nur nach neuen Mechaniken
const neuFx = [];          // kurze Effekte (Nachbilder, Bruchstücke, Kratzspuren); im Takt gerechnet, nur gezeichnet

// ---------- Hilfen ----------
function neuOben(P){ return P.keys && P.keys.swimUp && isDown(P.keys.swimUp); }
function neuUnten(P){ return P.keys && P.keys.swimDown && isDown(P.keys.swimDown); }
function neuFxDazu(o){ neuFx.push(o); if(neuFx.length > 260) neuFx.splice(0, neuFx.length - 260); }
function neuFigurBox(P, x, y){ return {x: (x === undefined ? P.x : x) - P.w/2, y: (y === undefined ? P.y : y) - P.h, w: P.w, h: P.h}; }

// ---------- Dash ----------
function dashKannStarten(P){
  if(P.dash || P.dashPause > 0 || P.inWater) return false;
  return P.dashPunkte > 0 || P.bruchFenster > 0;   // im Durchbruch-Fenster kostet der Anschluss-Dash nichts
}
function dashRichtung(P, moveDir){
  let dx = moveDir, dy = neuOben(P) ? -1 : (neuUnten(P) ? 1 : 0);
  if(!dx && !dy && P.hookAttached && Math.hypot(P.vx, P.vy) > 3){   // aus dem Schwung: in Flugrichtung (8 Richtungen)
    const w = Math.round(Math.atan2(P.vy, P.vx) / (Math.PI/4)) * Math.PI/4;
    dx = Math.round(Math.cos(w)); dy = Math.round(Math.sin(w));
  }
  // an der Haft-Unterseite hält „hoch“ nur fest – zählt nicht als Dash-Richtung (sonst klebt man sofort wieder an)
  if(P.haft && P.haft.flaeche === 'unten' && dy < 0) dy = 0;
  if(!dx && !dy) dx = P.facing || 1;
  if(P.grounded && dy > 0 && !dx && !bruchUnter(P)) dx = P.facing || 1;   // am Boden nach unten: flach (außer auf Bruch-Boden)
  const l = Math.hypot(dx, dy);
  return {dx: dx/l, dy: dy/l};
}
function dashStarten(P, moveDir){
  const {dx, dy} = dashRichtung(P, moveDir);
  if(P.hookAttached){ P.hookAttached = false; if(typeof SFX !== 'undefined') SFX.hookRelease(P); }   // Dash aus dem Schwung: Seil los
  P.haft = null; P.gliding = false; P.ropeFling = false; P.sprungKurzMoeglich = false;
  if(P.bruchFenster > 0) P.bruchFenster = 0; else P.dashPunkte--;
  P.dashLadung = 0;
  P.dash = {zeit: DASH_DAUER, dx, dy, faktor: 1, stossX: 0, stossY: 0};
  P.dashPuffer = 0;
  if(dx) P.facing = Math.sign(dx);
  P.vx = dx*DASH_TEMPO; P.vy = dy*DASH_TEMPO;
  neuTrefferStopp = Math.max(neuTrefferStopp, DASH_STOPP);
  P._dashT = performance.now(); P._dashDx = dx; P._dashDy = dy;
  if(typeof kameraStoss === 'function') kameraStoss(2.5);
  if(typeof dustPuff === 'function') dustPuff(P.x, P.y - P.h*0.5, 7, -Math.sign(dx)*1.2 || 0, 4);
  if(typeof SFX !== 'undefined' && SFX.dash) SFX.dash(P);
}
function dashBeenden(P){
  const d = P.dash; if(!d) return;
  P.dash = null;
  P.vx *= DASH_BEHALTEN;
  P.vy = P.vy < 0 ? Math.max(P.vy*DASH_BEHALTEN, JUMP_V) : P.vy*DASH_BEHALTEN;
  if(P.grounded) P.dashPause = DASH_PAUSE;
}
// während des Dashs: Tempo fest in Dash-Richtung, keine Schwerkraft, kein Schirm
function dashSchritt(P){
  const d = P.dash;
  P.vx = d.dx*DASH_TEMPO*d.faktor; P.vy = d.dy*DASH_TEMPO*d.faktor;
  if(P.grounded && d.dy > 0 && !bruchUnter(P)) P.vy = 0;   // schräg nach unten am Boden: flach weiter
  P.gliding = false;
}
// Bewegen während des Dashs in Teilschritten (nie mehr als DASH_TEILSCHRITT px auf einmal: kein Durchtunneln durch Wände,
// Durchbruch-Wände werden VOR dem Hineinbewegen geprüft und zerbrechen)
function dashBewegen(P){
  const d = P.dash;
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(P.vx), Math.abs(P.vy)) / DASH_TEILSCHRITT));
  const sx = P.vx/n, sy = P.vy/n;
  d.stossX = 0; d.stossY = 0;
  let bx = sx !== 0, by = sy !== 0;
  for(let i = 0; i < n; i++){
    if(bx){
      bruchTreffen(P, sx, 0);
      const v = P.vx; P.x += sx; collideAxis(P, 'x');
      if(P.vx === 0 && v !== 0){ d.stossX = Math.sign(v); bx = false; }
    }
    if(by){
      bruchTreffen(P, 0, sy);
      const v = P.vy; P.y += sy; collideAxis(P, 'y');
      if(P.vy === 0 && v !== 0){ d.stossY = Math.sign(v); by = false; }
    }
  }
  // Teilschritte haben P.vx/P.vy evtl. auf 0 gesetzt; für die Auswertung zählt das Dash-Tempo
  if(bx) P.vx = sx*n; if(by) P.vy = sy*n;
}

// ---------- Durchbruch-Wand (elemente/durchbruch.js: solids mit type 'bruch') ----------
function bruchUnter(P){
  const box = {x: P.x - P.w/2 + 2, y: P.y, w: P.w - 4, h: 3};
  return solids.some(s => s.type === 'bruch' && !s.gone && rectsOverlap(box, s));
}
// bewegt sich die Figur gleich um (dx, dy): Durchbruch-Wände in diesem Weg zerbrechen (nur im Dash)
function bruchTreffen(P, dx, dy){
  const box = neuFigurBox(P, P.x + dx, P.y + dy);
  let zerbrochen = 0;
  for(const s of solids){
    if(s.type !== 'bruch' || s.gone) continue;
    if(!rectsOverlap(box, s)) continue;
    // nur, was wirklich in Bewegungsrichtung liegt (nicht der Boden, über den man nur hinwegdasht)
    const ox = Math.min(box.x + box.w, s.x + s.w) - Math.max(box.x, s.x), oy = Math.min(box.y + box.h, s.y + s.h) - Math.max(box.y, s.y);
    if(ox <= COLLIDE_EPS || oy <= COLLIDE_EPS) continue;
    bruchZerbrechen(s, P.dash ? P.dash.dx : 0, P.dash ? P.dash.dy : 0);
    zerbrochen++;
  }
  if(zerbrochen && P.dash){
    P.dash.faktor *= BRUCH_BEHALTEN;
    P.vx *= BRUCH_BEHALTEN; P.vy *= BRUCH_BEHALTEN;
    P.bruchFenster = BRUCH_FENSTER;
    neuTrefferStopp = Math.max(neuTrefferStopp, BRUCH_STOPP);
    if(typeof kameraStoss === 'function') kameraStoss(7);
  }
}
function bruchZerbrechen(s, dx, dy){
  s.gone = true; s.bruchT = 0; s.wartet = false;
  const n = BRUCH_STUECKE;
  for(let i = 0; i < n; i++){
    const g = 2 + Math.random()*6;
    neuFxDazu({art: 'brocken', x: s.x + Math.random()*s.w, y: s.y + Math.random()*s.h,
      vx: dx*g + (Math.random() - 0.5)*5, vy: dy*g + (Math.random() - 0.5)*5 - 2.5,
      w: Math.random()*Math.PI, vw: (Math.random() - 0.5)*0.5, gr: 5 + Math.random()*8, leben: 50 + Math.random()*30, max: 80});
  }
  if(typeof dustPuff === 'function') dustPuff(s.x + s.w/2, s.y + s.h/2, 8, dx, 6);
  if(typeof SFX !== 'undefined' && SFX.bruch) SFX.bruch(s.x + s.w/2);
}

// ---------- Wand-Rutschen ----------
// an der Wand (onWall aus der normalen Wandprüfung), ohne Seil, ohne Schirm, nicht im Dash: Fall auf WAND_RUTSCH_MAX_FALL
// begrenzt. Greift erst, wenn die Figur schneller fällt – Aufstieg, Wandsprung und alles andere bleiben unberührt.
function wandRutschen(P, gliding){
  if(P.onWall && !gliding && !P.dash && !P.hookAttached && P.vy > WAND_RUTSCH_MAX_FALL){ P.vy = WAND_RUTSCH_MAX_FALL; P.rutscht = true; }
  else P.rutscht = false;
}

// ---------- Haftfläche (elemente/haftflaeche.js: Wände mit haft: true, liegen im 40er-Raster) ----------
let haftZellenCache = {src: null, n: -1, zellen: new Set(), fest: new Set()};
function haftZellen(){
  if(haftZellenCache.src === solids && haftZellenCache.n === solids.length) return haftZellenCache;
  const zellen = new Set(), fest = new Set();
  for(const s of solids){
    if(s.type === 'oneway' || s.type === 'moveplat') continue;
    for(let x = s.x; x < s.x + s.w - 1; x += 40) for(let y = s.y; y < s.y + s.h - 1; y += 40){
      const k = Math.floor(x/40) + ',' + Math.floor(y/40);
      if(s.haft) zellen.add(k); else fest.add(k);
    }
  }
  haftZellenCache = {src: solids, n: solids.length, zellen, fest};
  return haftZellenCache;
}
const haftIst = (c, r) => haftZellen().zellen.has(c + ',' + r);
const festIst = (c, r) => { const H = haftZellen(); return H.zellen.has(c + ',' + r) || H.fest.has(c + ',' + r); };
// Haftfläche direkt über dem Kopf (Kopfmitte, höchstens HAFT_FANG px darunter)? -> {c, r} der Zelle
function haftUeberKopf(P){
  if(!haftZellen().zellen.size) return null;
  const kopf = P.y - P.h, r = Math.round(kopf/40) - 1, c = Math.floor(P.x/40);
  if(Math.abs(kopf - (r + 1)*40) > HAFT_FANG) return null;
  return haftIst(c, r) && !festIst(c, r + 1) ? {c, r} : null;
}
function haftLos(P){ P.haft = null; }
function haftStarten(P, z){
  P.haft = {flaeche: 'unten', c: z.c, r: z.r, v: P.vx, taste: 0, sinn: 1};
  P.y = (z.r + 1)*40 + P.h; P.vy = 0; P.gliding = false; P.glideTimer = 0;
  P._haftT = performance.now();
  if(typeof dustPuff === 'function') dustPuff(P.x, P.y - P.h, 4, 0, 3);
  if(typeof SFX !== 'undefined' && SFX.haft) SFX.haft(P);
}
// Bewegung an der Fläche: setzt vx/vy so, dass die normale Bewegung die Figur entlang schiebt (Kollision bleibt wie immer)
function haftSchritt(P, moveDir){
  const h = P.haft;
  if(h.flaeche === 'unten'){
    h.v += (moveDir*HAFT_TEMPO - h.v)*HAFT_BESCHL;
    if(Math.abs(h.v) < 0.03) h.v = 0;
    P.vx = h.v; P.vy = 0;
  } else {
    // senkrechte Haftfläche: dieselbe Taste weiter halten = weiter in dieselbe Richtung (auch um die Ecke)
    if(moveDir){
      if(moveDir !== h.taste){ h.taste = moveDir; h.sinn = Math.sign(h.v) || -1; }
      h.v += (h.sinn*HAFT_TEMPO - h.v)*HAFT_BESCHL;
    } else { h.taste = 0; h.v *= 1 - HAFT_BESCHL; }
    h.v += GRAVITY*HAFT_KLEB_SCHWER;                    // klebt, rutscht aber langsam
    h.v = Math.max(-HAFT_TEMPO*1.5, Math.min(HAFT_TEMPO*1.5, h.v));
    P.vx = 0; P.vy = h.v;
  }
  P.grounded = false;
}
// nach dem Bewegen: noch an der Fläche? Um Kanten herum weiter, sonst am Ende anhalten (wie eine Schiene)
function haftNachher(P, altX, altY){
  const h = P.haft; if(!h) return;
  const frei = (x, y) => spotFree(x, y, P);
  if(P.hookAttached || P.grounded){ haftLos(P); return; }
  if(h.flaeche === 'unten'){
    const r = h.r;
    if(P.vx === 0 && h.v !== 0){                        // gegen eine Wand gerollt: innere Ecke? -> an ihr weiter nach unten
      const s = Math.sign(h.v), vor = Math.floor((P.x + s*(P.w/2 + 1))/40);
      if(haftIst(vor, r + 1)){
        const nx = s > 0 ? vor*40 - P.w/2 : (vor + 1)*40 + P.w/2;
        if(frei(nx, P.y)){ P.haft = {flaeche: s > 0 ? 'links' : 'rechts', c: vor, r: r + 1, v: Math.abs(h.v), taste: h.taste, sinn: 1}; P.x = nx; return; }
      }
      h.v = 0; return;
    }
    const c = Math.floor(P.x/40);
    if(c === h.c) return;
    const s = Math.sign(c - h.c);
    if(haftIst(c, r) && !festIst(c, r + 1)){ h.c = c; return; }   // geht unter der Fläche weiter
    const vor = h.c + s;
    if(haftIst(vor, r + 1)){                            // innere Ecke: Haftwand geht nach unten weiter
      const nx = s > 0 ? vor*40 - P.w/2 : (vor + 1)*40 + P.w/2;
      if(frei(nx, P.y)){ P.haft = {flaeche: s > 0 ? 'links' : 'rechts', c: vor, r: r + 1, v: Math.abs(h.v), taste: h.taste, sinn: 1}; P.x = nx; return; }
    }
    if(!festIst(vor, r)){                               // äußere Ecke: an der Seite der Zelle hinauf
      const nx = s > 0 ? (h.c + 1)*40 + P.w/2 : h.c*40 - P.w/2, ny = (r + 1)*40;
      if(frei(nx, ny)){ P.haft = {flaeche: s > 0 ? 'rechts' : 'links', c: h.c, r, v: -Math.abs(h.v), taste: h.taste, sinn: -1}; P.x = nx; P.y = ny; return; }
    }
    P.x = altX; h.v = 0;                                // Ende der Fläche: anhalten (Schiene)
    return;
  }
  // senkrechte Fläche: Mitte der Figur in Reihe h.r?
  const seite = h.flaeche === 'links' ? -1 : 1;        // Figur steht links bzw. rechts neben der Zelle
  if(P.vy === 0 && h.v !== 0){
    if(h.v < 0){                                        // nach oben gegen eine Decke: Haft-Decke? -> unter ihr weiter
      const kopfR = Math.floor((P.y - P.h - 1)/40), nachbarC = h.c + seite;
      if(haftIst(nachbarC, kopfR)){ P.haft = {flaeche: 'unten', c: nachbarC, r: kopfR, v: seite*Math.abs(h.v), taste: h.taste, sinn: 1}; return; }
    }
    h.v = 0; return;
  }
  const cy = P.y - P.h/2, r = Math.floor(cy/40);
  if(r === h.r) return;
  const s = Math.sign(r - h.r), nachbarC = h.c + seite;
  if(haftIst(h.c, r) && !festIst(nachbarC, r)){ h.r = r; return; }      // geht an der Wand weiter
  if(s < 0){
    if(haftIst(nachbarC, h.r - 1)){                     // innere Ecke oben: Haft-Decke -> unter ihr weiter (vom Wand weg)
      const ny = h.r*40 + P.h;
      if(frei(P.x, ny)){ P.haft = {flaeche: 'unten', c: nachbarC, r: h.r - 1, v: seite*Math.abs(h.v), taste: h.taste, sinn: 1}; P.y = ny; return; }
    }
    if(!festIst(h.c, h.r - 1)){                         // äußere Ecke oben: auf die Zelle hinauf (loslassen, stehen)
      const nx = h.c*40 + 20, ny = h.r*40;
      if(frei(nx, ny)){ P.x = nx; P.y = ny; P.vx = 0; P.vy = 0; haftLos(P); return; }
    }
  } else {
    if(!festIst(h.c, h.r + 1)){                         // äußere Ecke unten: unter die Zelle (Richtung Zelle)
      const nx = h.c*40 + 20 + seite*(20 - P.w/2), ny = (h.r + 1)*40 + P.h;
      if(frei(nx, ny)){ P.haft = {flaeche: 'unten', c: h.c, r: h.r, v: -seite*Math.abs(h.v), taste: h.taste, sinn: 1}; P.x = nx; P.y = ny; return; }
    }
  }
  P.y = altY; h.v = 0;                                  // Ende: anhalten
}

// ---------- Aufrufe aus 08-figur-physik-seil.js ----------
// vor dem Tempo: Dash-Taste, Dash, Haftfläche, Sprung im Durchbruch-Fenster. true = Tempo ist gesetzt (normale Physik aus)
function neueBewegungVorher(P, now, moveDir, jumpPressed, jumpHeld, nass){
  const K = P.keys || {};
  if(nass){ if(P.dash) dashBeenden(P); P.haft = null; P.dashPuffer = 0; if(K.dash) KEYS[K.dash + '_pressed'] = false; return false; }   // im Wasser: keine neuen Mechaniken
  if(K.dash && KEYS[K.dash + '_pressed']){ KEYS[K.dash + '_pressed'] = false; P.dashPuffer = DASH_PUFFER + 1; }
  if(P.dashPause > 0 && !P.dash) P.dashPause--;
  if(P.bruchFenster > 0 && !P.dash) P.bruchFenster--;
  if(P.dashPuffer > 0){
    if(dashKannStarten(P)) dashStarten(P, moveDir);
    if(P.dashPuffer > 0) P.dashPuffer--;
  }
  if(P.dash){
    if(P.hookAttached){ dashBeenden(P); return false; }   // Haken mitten im Dash gegriffen: das Seil übernimmt
    dashSchritt(P); return true;
  }
  // Haftfläche
  if(P.haft){
    if(P.hookAttached || !neuOben(P)){ haftLos(P); return false; }   // losgelassen: fällt (normale Physik)
    if(jumpPressed){                                     // Absprung: unten weg nach unten-vorn, an der Seite weg von der Wand
      const h = P.haft; haftLos(P);
      if(h.flaeche === 'unten'){ P.vy = HAFT_ABSPRUNG_Y; P.vx += moveDir*HAFT_ABSPRUNG_X; }
      else { const w = h.flaeche === 'links' ? -1 : 1; P.vx = w*HAFT_ABSPRUNG_X; P.vy = -HAFT_ABSPRUNG_Y*2; P.facing = w; }
      P._jumpT = performance.now();
      return true;
    }
    haftSchritt(P, moveDir); return true;
  }
  if(!P.grounded && !P.hookAttached && P.vy <= 2 && neuOben(P)){
    const z = haftUeberKopf(P);
    if(z){ haftStarten(P, z); haftSchritt(P, moveDir); return true; }
  }
  // Durchbruch-Fenster: kurz nach einem Durchbruch geht ein Sprung auch in der Luft (Spielwiese: bruchFenster)
  if(P.bruchFenster > 0 && jumpPressed && !P.grounded && !P.hookAttached){
    P.bruchFenster = 0; P.vy = JUMP_V; P.sprungKurzMoeglich = true; P.sprungLosgelassen = false; P.glideTimer = 0;
    if(moveDir) P.vx = moveDir*Math.max(Math.abs(P.vx), MOVE_SPEED);
    return true;
  }
  return false;
}
// nach dem Bewegen: Dash auswerten, Haftfläche nachführen, Dash aufladen
// ---------- Kante: Fuß nicht mehr auf dem Boden -> abrutschen (Nutzerwunsch) ----------
// Die Kollisions-Box ist breiter als die gezeichneten Füße: ohne das hier „schwebt“ eine stehende Figur bis zu ~14 px über
// dem Abgrund. Sprünge bleiben gleich (wer läuft, ist schneller als KANTE_RUTSCH und wird nicht beeinflusst).
function kanteTraegt(P, x){
  return solids.some(s => !s.gone && s.type !== 'fake' && s.y >= P.y - 2 && s.y <= P.y + 3 && x >= s.x && x <= s.x + s.w);
}
// Abgrund-Seite (1 = rechts, -1 = links), wenn bei P.x ± rand nichts trägt, am anderen Rand der Box aber schon; sonst 0
function kanteRichtung(P, rand){
  if(!P.grounded) return 0;
  const halb = P.w/2 - 0.5;
  if(!kanteTraegt(P, P.x + rand) && kanteTraegt(P, P.x - halb)) return 1;
  if(!kanteTraegt(P, P.x - rand) && kanteTraegt(P, P.x + halb)) return -1;
  return 0;
}
function kanteAbrutschen(P){
  if(!P.grounded || P.hookAttached || P.dash || P.haft || P.inWater) return;
  if(kanteTraegt(P, P.x - KANTE_FUSS) || kanteTraegt(P, P.x + KANTE_FUSS)) return;   // Fuß steht noch (teilweise)
  const dir = kanteRichtung(P, KANTE_FUSS);
  if(!dir || P._moveDir === -dir) return;                                            // läuft zurück: nicht abrutschen
  if(Math.sign(P.vx) === dir && Math.abs(P.vx) >= KANTE_RUTSCH) return;               // läuft ohnehin runter
  const nx = P.x + dir*KANTE_RUTSCH;
  if(spotFree(nx, P.y, P)) P.x = nx;
}
function neueBewegungNachher(P, altX, altY){
  if(P.hookAttached || P.dash || P.haft || P.inWater) P.rutscht = false;
  const d = P.dash;
  if(d){
    if(d.dy >= 0 && P.vy < -10 && !d.stossY){ P.dash = null; }          // Sprungpilz hat übernommen
    else if(d.stossX && d.dx && Math.abs(d.dy) < 0.5){ dashBeenden(P); if(typeof SFX !== 'undefined' && SFX.dashBonk) SFX.dashBonk(P); }
    else if(d.stossY && d.dy && !d.dx){ dashBeenden(P); }
    else if(d.stossY > 0 && d.dx){ d.dy = 0; d.dx = Math.sign(d.dx); }  // schräg auf den Boden: flach weiter
    else if(--d.zeit <= 0) dashBeenden(P);
    // Dash nach oben gegen eine Haftfläche: festhalten, wenn „hoch“ gehalten wird
    if(P.dash && d.stossY < 0 && neuOben(P)){ const z = haftUeberKopf(P); if(z){ P.dash = null; haftStarten(P, z); } }
    if(d && schrittNr() % 2 === 0) neuFxDazu({art: 'nachbild', x: P.x, y: P.y, male: P.male, roll: P.rollAngle, facing: P.facing, leben: 12, max: 12});
  }
  if(P.haft) haftNachher(P, altX, altY);
  if(P.haft && P.haft.flaeche !== 'unten') P.rollAngle += P.vy/(P.w*0.5)*(P.haft.flaeche === 'links' ? 1 : -1);
  kanteAbrutschen(P);
  // Dash aufladen: immer (auch frei in der Luft; Nutzerwunsch – früher nur mit festem Halt, dafür doppelt so schnell)
  if(P.dashPunkte < DASH_LUFT && !P.dash){
    P.dashLadung += 1/DASH_LADEZEIT;
    if(P.dashLadung >= 1){ P.dashLadung = 0; P.dashPunkte++; P._dashVollT = performance.now(); if(typeof SFX !== 'undefined' && SFX.dashVoll) SFX.dashVoll(P); }
  } else P.dashLadung = 0;
  // Rutsch-Bild (nur Anzeige): Staub und Kratzspur an der Wand
  if(P.rutscht && schrittNr() % 3 === 0){
    const wx = P.x + P.onWall*P.w/2;
    neuFxDazu({art: 'staub', x: wx, y: P.y - P.h*0.65, vx: -P.onWall*(0.6 + Math.random()*1.4), vy: -0.4 - Math.random(), leben: 22, max: 22, r: 2.5 + Math.random()*2.5});
    if(schrittNr() % 9 === 0 && typeof SFX !== 'undefined' && SFX.rutschen) SFX.rutschen(P);
  }
}
const schrittNr = () => (typeof simSteps === 'number' ? simSteps : 0);
// einmal pro Physik-Schritt (14-spielschleife.js): Effekte weiterrechnen, Nachwachsen der Durchbruch-Wände
function neueBewegungSchritt(figuren){
  for(const f of neuFx){
    f.leben--;
    if(f.art === 'brocken'){ f.x += f.vx; f.y += f.vy; f.vy += 0.45; f.vx *= 0.98; f.w += f.vw; }
    else if(f.art === 'staub'){ f.x += f.vx; f.y += f.vy; f.vx *= 0.94; f.vy *= 0.94; }
  }
  for(let i = neuFx.length - 1; i >= 0; i--) if(neuFx[i].leben <= 0) neuFx.splice(i, 1);
  if(typeof bruchNachwachsen === 'function') bruchNachwachsen(figuren);
}
function neueBewegungZuruecksetzen(){ neuFx.length = 0; neuTrefferStopp = 0; }

// ---------- Zeichnen (nur Anzeige) ----------
// Stauchen/Strecken der Figur beim Dash, am Haftpunkt und beim Wand-Rutschen (multipliziert mit charSquash)
function neueBewegungSquash(P){
  let sx = 1, sy = 1;
  const t = performance.now();
  if(P._dashT){ const k = (t - P._dashT)/170; if(k < 1){ const a = Math.sin(k*Math.PI)*0.28;
    if(Math.abs(P._dashDx) >= Math.abs(P._dashDy)){ sx += a; sy -= a*0.6; } else { sy += a; sx -= a*0.6; } } }
  if(P.rutscht){ sx *= 0.9; sy *= 1.06; }
  if(P.haft && P.haft.flaeche === 'unten'){ sy *= 0.92; sx *= 1.05; }
  return [sx, sy];
}
function neueBewegungZeichnen(){
  for(const f of neuFx){
    const k = f.leben/f.max, x = f.x - camX;
    if(x < -80 || x > VW + 80) continue;
    if(f.art === 'brocken'){
      ctx.save(); ctx.translate(x, f.y); ctx.rotate(f.w); ctx.globalAlpha = Math.min(1, f.leben/20);
      ctx.fillStyle = '#a08a74'; ctx.fillRect(-f.gr/2, -f.gr/2, f.gr, f.gr);
      ctx.strokeStyle = '#4b3a2b'; ctx.lineWidth = 1.5; ctx.strokeRect(-f.gr/2, -f.gr/2, f.gr, f.gr); ctx.restore();
    } else if(f.art === 'staub'){
      ctx.globalAlpha = 0.55*k; ctx.fillStyle = '#efe2c8';
      ctx.beginPath(); ctx.arc(x, f.y, f.r*(1.4 - k*0.4), 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
    } else if(f.art === 'nachbild'){
      ctx.globalAlpha = 0.3*k; ctx.fillStyle = f.male ? '#c58a52' : '#ff9cc8';
      ctx.beginPath(); ctx.arc(x, f.y - 16, 15, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
    }
  }
  for(const P of [p1, p2]){
    if(!P || (deathState && P === deathState.victim)) continue;
    const px = Math.round(P.x - camX), py = Math.round(P.y);
    if(P.rutscht){   // Kratzspur an der Kontaktstelle
      const wx = px + P.onWall*(P.w/2 + 1), wy = py - P.h*0.75;
      ctx.strokeStyle = 'rgba(255,240,210,.55)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(wx, wy - 10); ctx.lineTo(wx, wy + 4); ctx.moveTo(wx - P.onWall*2.5, wy - 16); ctx.lineTo(wx - P.onWall*2.5, wy - 6); ctx.stroke();
      ctx.lineCap = 'butt';
    }
    if(P.haft){      // kleine Klebefäden am Haftpunkt
      const h = P.haft, a = 0.5 + 0.3*Math.sin(performance.now()/120);
      ctx.strokeStyle = `rgba(200,140,255,${a})`; ctx.lineWidth = 1.5;
      ctx.beginPath();
      if(h.flaeche === 'unten'){ for(const dx of [-8, 0, 8]){ ctx.moveTo(px + dx, py - P.h); ctx.lineTo(px + dx*0.6, py - P.h - 5); } }
      else { const s = h.flaeche === 'links' ? 1 : -1; for(const dy of [-22, -14, -6]){ ctx.moveTo(px + s*P.w/2, py + dy); ctx.lineTo(px + s*(P.w/2 + 5), py + dy); } }
      ctx.stroke();
    }
    dashPunktZeichnen(P, px, py);
  }
}
// Dash-Punkt über dem Kopf (wie in der Spielwiese: Punkt, das Tortenstück zeigt das Aufladen); nur sichtbar, wenn das Level
// Dash-Stellen hat oder der Punkt gerade fehlt/lädt
function dashPunktZeichnen(P, px, py){
  const voll = P.dashPunkte >= DASH_LUFT, t = performance.now();
  const frisch = P._dashVollT && t - P._dashVollT < 400;
  if(voll && !frisch && !P.dash) return;   // voll und ruhig: kein Punkt (Bild bleibt aufgeräumt)
  const x = px, y = py - P.h - 22;
  ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI*2);
  ctx.fillStyle = voll ? '#4fd2ff' : 'rgba(40,50,70,0.45)'; ctx.fill();
  if(!voll && P.dashLadung > 0){
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, 4.5, -Math.PI/2, -Math.PI/2 + P.dashLadung*Math.PI*2); ctx.closePath();
    ctx.fillStyle = 'rgba(79,210,255,0.8)'; ctx.fill();
  }
  ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI*2); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(15,20,30,0.6)'; ctx.stroke();
  if(frisch){ const k = (t - P._dashVollT)/400; ctx.strokeStyle = `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 6 + k*10, 0, Math.PI*2); ctx.stroke(); }
}
