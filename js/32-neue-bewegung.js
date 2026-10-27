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
  return P.dashPunkte > 0;   // kein kostenloser Anschluss-Dash nach einem Durchbruch mehr (Nutzerwunsch: ein Dash, dann aufladen)
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
  P.bruchFenster = 0; P.dashPunkte--;
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
// Nutzerwunsch: festhalten nur an der UNTERSEITE (hangeln links/rechts), kein Hochziehen an den Seiten; bewegte
// Haftflächen (moveplat mit haft: true, Editor-Werkzeug „Bewegung“) nehmen die Figur mit, loslassen geht überall.
let haftZellenCache = {src: null, n: -1, zellen: new Set(), fest: new Set(), bewegt: false};
function haftZellen(){
  if(haftZellenCache.src === solids && haftZellenCache.n === solids.length) return haftZellenCache;
  const zellen = new Set(), fest = new Set(); let bewegt = false;
  for(const s of solids){
    if(s.type === 'moveplat'){ if(s.haft) bewegt = true; continue; }
    if(s.type === 'oneway') continue;
    for(let x = s.x; x < s.x + s.w - 1; x += 40) for(let y = s.y; y < s.y + s.h - 1; y += 40){
      const k = Math.floor(x/40) + ',' + Math.floor(y/40);
      if(s.haft) zellen.add(k); else fest.add(k);
    }
  }
  haftZellenCache = {src: solids, n: solids.length, zellen, fest, bewegt};
  return haftZellenCache;
}
const haftIst = (c, r) => haftZellen().zellen.has(c + ',' + r);
const festIst = (c, r) => { const H = haftZellen(); return H.zellen.has(c + ',' + r) || H.fest.has(c + ',' + r); };
// Haftfläche direkt über dem Kopf (Kopfmitte, höchstens HAFT_FANG px darunter)? -> {c, r} der Zelle bzw. {mp} (bewegt)
function haftUeberKopf(P){
  const H = haftZellen(), kopf = P.y - P.h;
  if(H.zellen.size){
    const r = Math.round(kopf/40) - 1, c = Math.floor(P.x/40);
    const abstand = kopf - (r + 1)*40;   // > 0: Kopf unter der Fläche
    if(abstand >= -2.5 && abstand <= HAFT_FANG && haftIst(c, r) && !festIst(c, r + 1)) return {c, r};
  }
  if(H.bewegt) for(const s of solids){
    if(s.type !== 'moveplat' || !s.haft || s.gone) continue;
    const abstand = kopf - (s.y + s.h);
    if(abstand >= -2.5 && abstand <= HAFT_FANG && P.x >= s.x && P.x <= s.x + s.w) return {mp: s};
  }
  return null;
}
function haftLos(P){ P.haft = null; }
function haftStarten(P, z){
  P.haft = z.mp ? {flaeche: 'unten', mp: z.mp, v: P.vx} : {flaeche: 'unten', c: z.c, r: z.r, v: P.vx};
  P.y = (z.mp ? z.mp.y + z.mp.h : (z.r + 1)*40) + P.h; P.vy = 0; P.gliding = false; P.glideTimer = 0;
  P._haftT = performance.now();
  if(typeof dustPuff === 'function') dustPuff(P.x, P.y - P.h, 4, 0, 3);
  if(typeof SFX !== 'undefined' && SFX.haft) SFX.haft(P);
}
// Hangeln unter der Fläche: setzt vx so, dass die normale Bewegung die Figur entlang schiebt (Kollision bleibt wie immer)
function haftSchritt(P, moveDir){
  const h = P.haft;
  h.v += (moveDir*HAFT_TEMPO - h.v)*HAFT_BESCHL;
  if(Math.abs(h.v) < 0.03) h.v = 0;
  // Ende der Fläche (Nutzerwunsch): vorher anhalten – die Hände bleiben unter der Fläche, kein Weiterhangeln in der Luft
  if(h.v !== 0 && !haftWeiter(P, P.x + h.v + Math.sign(h.v)*HAFT_RAND)) h.v = 0;
  P.vx = h.v; P.vy = 0;
  P.grounded = false;
}
// trägt die Haftfläche an Stelle x noch (gleiche Fläche/Gruppe, gleiche Unterkante)?
function haftWeiter(P, x){
  const h = P.haft;
  if(h.mp){
    const unten = h.mp.y + h.mp.h;
    return solids.some(s => s.type === 'moveplat' && s.haft && !s.gone && haftGleichesStueck(s, h.mp) &&
                            Math.abs(s.y + s.h - unten) < 1 && x >= s.x && x <= s.x + s.w);
  }
  const c = Math.floor(x/40);
  return haftIst(c, h.r) && !festIst(c, h.r + 1);
}
// gleiche bewegte Haftfläche (auch ein anderes Teil derselben Gruppe)?
function haftGleichesStueck(a, b){ return a === b || (a.group !== undefined && a.group !== null && a.group === b.group); }
// nach dem Bewegen: noch unter der Fläche? Am Ende anhalten (wie eine Schiene) – nicht um die Ecke an die Seite
function haftNachher(P, altX, altY){
  const h = P.haft; if(!h) return;
  if(P.hookAttached || P.grounded){ haftLos(P); return; }
  if(P.vx === 0 && h.v !== 0){ h.v = 0; return; }      // gegen eine Wand gehangelt: anhalten
  if(h.mp){
    const mp = h.mp, unten = mp.y + mp.h;
    if(P.x >= mp.x && P.x <= mp.x + mp.w) return;
    const weiter = solids.find(s => s !== mp && s.type === 'moveplat' && s.haft && !s.gone && haftGleichesStueck(s, mp) &&
      Math.abs(s.y + s.h - unten) < 1 && P.x >= s.x && P.x <= s.x + s.w);
    if(weiter){ h.mp = weiter; return; }
    P.x = Math.max(mp.x, Math.min(mp.x + mp.w, P.x)); h.v = 0;   // Ende der bewegten Fläche: anhalten
    return;
  }
  const c = Math.floor(P.x/40);
  if(c === h.c) return;
  if(haftIst(c, h.r) && !festIst(c, h.r + 1)){ h.c = c; return; }   // geht unter der Fläche weiter
  P.x = altX; h.v = 0;                                  // Ende der Fläche: anhalten (Schiene)
}

// ---------- Liane halten (Nutzerwunsch): Haken-Taste losgelassen -> abspringen ----------
// Leichter Schub in Richtung des Schwungs (Bahn-Richtung) plus kleiner Hub – nur mit Schwung, weich ansteigend, damit
// es zur Pendel-Physik passt. Danach fliegt die Figur wie nach jedem Loslassen weiter (ropeFling, ROPE_FLING_* in 02).
function lianeLoslassen(P){
  P.hookAttached = false; P._lianeA = null;
  const v = Math.hypot(P.vx, P.vy), k = Math.max(0, Math.min(1, (v - LIANE_MIN_SCHWUNG)/LIANE_SCHWUNG_VOLL));
  if(k > 0){
    P.vx += P.vx/v*LIANE_BOOST*k;
    P.vy += P.vy/v*LIANE_BOOST*k + LIANE_HUB*k;
    P.lianeSchub = k;
  } else P.lianeSchub = 0;
  ropeFling(P);
}

// ---------- Liane 2 (Nutzerwunsch „Schwingen fühlt sich wie ein Bug an“): echtes Pendel mit fester Länge ----------
// Gilt beim Halten der Haken-Taste (LIANE_HALTEN, nicht in der alten Antipp-Bedienung des Bahnen-Tests). Statt Gummi-Seil:
// - Länge fest (Fallen ins Seil: kurz nachfedern, LIANE2_FANG_*): beim Greifen die Entfernung, aber mindestens LIANE2_MIN (näher gegriffen: das Seil wird weich nachgegeben,
//   der Affe rutscht in LIANE2_ABROLL px/Schritt auf die Länge) und höchstens die Reichweite; W/S ändern sie wie bisher.
// - Schwung holen mit der Richtungstaste nur bis LIANE2_PUMP_WINKEL, ab LIANE2_BREMS_WINKEL bremst die Luft stärker, über
//   LIANE2_MAX_WINKEL wird er weich gebremst (kein
//   Überschlag). - Fällt der Affe ins Seil (z. B. von oben gegriffen), federt es kurz nach (LIANE2_FANG_*).
// - Das Seil gibt nie nach und dehnt sich nicht (keine rote Gummi-Liane mehr). Wände/Boden halten ihn normal auf.
function lianeNeu(P){ return !!(P.male && P.hookAttached && LIANE_HALTEN && !window.hakenTippen && !window.liane2Aus); }   // liane2Aus: nur zum Vergleichen (Tests)
// Kern des Pendels: S = {hx, hy (Griff-Punkt), vx, vy,
// len (Seillänge), ziel (Wunschlänge), max, dehn (Fang-Dehnung)} wird um einen Schritt weitergerechnet
function lianeKern(S, A, moveDir, ziehen, geben){
  if(ziehen) S.ziel = Math.max(HOOK_MIN_LEN, S.ziel - ROPE_PULL_SPEED);
  if(geben) S.ziel = Math.min(S.max, S.ziel + ROPE_ADJUST_SPEED);
  // Seillänge zur Wunschlänge
  S.len += Math.max(-LIANE2_ABROLL, Math.min(LIANE2_ABROLL, S.ziel - S.len));
  const hx = S.hx, hy = S.hy, dx0 = hx - A.x, dy0 = hy - A.y, d0 = Math.hypot(dx0, dy0) || 1;
  let vx = S.vx, vy = S.vy + GRAVITY*0.9;
  const tx = dy0/d0, ty = -dx0/d0, a = Math.atan2(dx0, dy0)*180/Math.PI;   // Tangente (rechts herum), Winkel (0 = unten)
  if(moveDir && Math.abs(a) < LIANE2_PUMP_WINKEL && vx*moveDir > -0.3) vx += moveDir*LIANE2_PUMP;   // wie bisher: waagerecht schieben
  const amSeil = d0 > S.len + S.dehn - 2;   // hängt straff (fliegt er frei über dem Haken / fällt hinein: kein Schwung-Verlust)
  const dmp = Math.abs(a) > LIANE2_BREMS_WINKEL && amSeil && vy < 0 ? LIANE2_DAEMPF_OBEN : LIANE2_DAEMPF; vx *= dmp; vy *= dmp;
  let nx = hx + vx, ny = hy + vy;
  const dx = nx - A.x, dy = ny - A.y, d = Math.hypot(dx, dy) || 1, ux = dx/d, uy = dy/d;
  // straff: auf den Kreis (Länge + kleine Fang-Dehnung). Fällt der Affe ins Seil, wird das Hinausfliegen über mehrere
  // Schritte gebremst (je Schritt bleibt LIANE2_FANG_REST davon) – das Seil federt kurz nach und zieht weich zurück
  const straff = d > S.len + S.dehn - 1;   // schlaffes Seil (Affe fliegt frei, z. B. über dem Haken): nichts bremsen
  if(d > S.len + S.dehn){
    let radial = vx*ux + vy*uy, ex = ux, ey = uy;
    if(radial > LIANE2_FANG_AB && Math.abs(a) < LIANE2_BREMS_WINKEL){
      // ins Seil gefallen: ein Teil des Hinausfliegens wird zu Schwung entlang des Bogens (Richtung = bisherige Bewegung)
      const tan = vx*tx + vy*ty, sg = tan ? Math.sign(tan) : (Math.sign(vx) || 1), rest = radial*LIANE2_FANG_REST;
      const zu = Math.sqrt(tan*tan + (radial*radial - rest*rest)*LIANE2_FANG_SCHWUNG) - Math.abs(tan);
      nx += tx*sg*zu; ny += ty*sg*zu;
      const d2 = Math.hypot(nx - A.x, ny - A.y) || 1; ex = (nx - A.x)/d2; ey = (ny - A.y)/d2;
    }
    if(radial > LIANE2_FANG_AB){ radial *= LIANE2_FANG_REST; S.dehn = Math.min(LIANE2_FANG_MAX, S.dehn + radial); }
    const Lw = S.len + S.dehn;
    if(Math.hypot(nx - A.x, ny - A.y) > Lw){ nx = A.x + ex*Lw; ny = A.y + ey*Lw; }
  }
  S.dehn *= LIANE2_FANG_ZURUECK; if(S.dehn < 0.3) S.dehn = 0;
  // über LIANE2_MAX_WINKEL (nach oben hinaus) weich bremsen – kein Überschlag
  const an = Math.atan2(nx - A.x, ny - A.y)*180/Math.PI;
  if(straff && Math.abs(an) > LIANE2_MAX_WINKEL && Math.abs(an) > Math.abs(a)){
    const k = 0.8; nx = hx + (nx - hx)*k; ny = hy + (ny - hy)*k;
  }
  S.vx = nx - hx; S.vy = ny - hy;
  const sp = Math.hypot(S.vx, S.vy);
  if(sp > ROPE_MAX_STEP){ S.vx *= ROPE_MAX_STEP/sp; S.vy *= ROPE_MAX_STEP/sp; }
}
function lianeSchritt(P, moveDir, jumpPressed){
  const A = P.anchor, K = P.keys || {};
  if(jumpPressed){   // Springen am Seil: loslassen mit Hub (wie bisher), Schwung bleibt
    P.hookAttached = false; P._lianeA = null; P.vy += HOOK_RELEASE_BOOST; ropeFling(P); return false;
  }
  const d0 = Math.hypot(P.x - A.x, P.y - P.h*0.6 - A.y) || 1;
  if(P._lianeA !== A){   // gerade gegriffen
    P._lianeA = A; P._dehn = 0;
    P.lianeZiel = Math.max(LIANE2_MIN, Math.min(hookRange(A), d0));
    P.ropeLen = d0; P.ropeMax = Math.max(P.lianeZiel, hookRange(A));
  }
  const S = {hx: P.x, hy: P.y - P.h*0.6, vx: P.vx, vy: P.vy, len: P.ropeLen, ziel: P.lianeZiel, max: P.ropeMax, dehn: P._dehn || 0};
  lianeKern(S, A, moveDir, K.pull && isDown(K.pull), K.slack && isDown(K.slack));
  P.vx = S.vx; P.vy = S.vy; P.ropeLen = S.len; P.lianeZiel = S.ziel; P._dehn = S.dehn;
  P.ropeStretch = 0; P.ropePulledNow = false;
  return true;
}

// ---------- Aufrufe aus 08-figur-physik-seil.js ----------
// vor dem Tempo: Dash-Taste, Dash, Haftfläche, Sprung im Durchbruch-Fenster. true = Tempo ist gesetzt (normale Physik aus)
function neueBewegungVorher(P, now, moveDir, jumpPressed, jumpHeld, nass){
  const K = P.keys || {};
  if(P.male && P.hookAttached && LIANE_HALTEN && !window.hakenTippen && K.hook && !isDown(K.hook)) lianeLoslassen(P);
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
    if(jumpPressed){                                     // Absprung: nach unten-vorn
      haftLos(P);
      P.vy = HAFT_ABSPRUNG_Y; P.vx += moveDir*HAFT_ABSPRUNG_X;
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
  // Liane 2: am Seil in der Luft das neue Pendel (am Boden bleibt die alte Seil-Regel: hochziehen mit W)
  if(!P.hookAttached) P._lianeA = null;
  else if(lianeNeu(P) && !P.grounded) return lianeSchritt(P, moveDir, jumpPressed);
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
