// 34-koop-aktionen.js – Teil des Spiels "Monchichi Koop" (Dschungel-Neu).
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.
//
// Zwei Koop-Aktionen auf der Spezial-Taste des Spielers (Standard: Affe H / R1, Schweinchen Num 4 / R1):
//   - Schweinchen HINLEGEN (Taste halten): liegt still am Boden; der Affe federt von ihm hoch wie früher vom Sprungpilz.
//   - Affe PUSTEN (Taste halten): steht still und bläst einen Windstrahl nach oben / links / rechts (W, A, D). Der Strahl
//     trägt das Schweinchen mit offenem Schirm (nach oben wie ein Aufwind, zur Seite als Schub) und bewegt leichte Dinge
//     (`pusteTrifft`, z. B. Windrad). Ein Balken über dem Kopf leert sich beim Pusten und lädt danach wieder auf.
// Rollen: das Schweinchen hilft dem Affen nach oben, der Affe dem Schweinchen – keine Figur kommt allein durch.
// Einklinken nur über die Haken der neuen Bewegung (js/32: neueBewegungVorher / neueBewegungNachher) – die alte Physik in
// 08 bleibt unberührt; ohne Spezial-Taste läuft alles Schritt für Schritt wie vorher (Test bahnen_alte_mechaniken).
// Werte: js/02-physik-werte.js (Abschnitt „Dschungel-Neu“). Zustand an der Figur: P.liegt, P.puste (0…1), P.pusteAn,
// P.pusteRichtung ('hoch' | -1 | 1), P.pusteT (Schritte seit Beginn), P.pusteLeer (ganz leer gepustet), P.pustePause.

// Der Windstrahl steht – solange der Affe pustet – als Aufwind-Bereich in `winds` (elemente/aufwind.js): so trägt er das
// Schweinchen beim Segeln mit genau derselben Regel wie ein Aufwind-Feld. Gezeichnet wird er hier (aufwind.js überspringt ihn).
const pusteWind = {x: 0, y: 0, w: 0, h: 0, puste: true};
let pusteStrahlJetzt = null;      // {x, y, w, h, dir, kraft} des laufenden Strahls (null = niemand pustet)

function koopTaste(P, name){ const k = P.keys && P.keys[name]; return !!(k && isDown(k)); }
function koopSchweinchen(){ return [p1, p2].find(P => P && !P.male); }
function koopAffe(){ return [p1, p2].find(P => P && P.male); }

// ---------- Schweinchen hinlegen ----------
function liegenVorher(P, moveDir, jumpPressed){
  const will = koopTaste(P, 'liegen') && P.grounded && !P.dash && !P.haft && !P.inWater && !(P.umbrella > 0.5);
  if(!will){ if(P.liegt){ P.liegt = false; P._liegtEndeT = performance.now(); } return false; }
  if(!P.liegt){ P.liegt = true; P._liegtT = performance.now(); if(typeof SFX !== 'undefined' && SFX.hinlegen) SFX.hinlegen(P); }
  P.vx *= 0.55; if(Math.abs(P.vx) < 0.05) P.vx = 0;
  P.vy = Math.min(MAX_FALL, P.vy + GRAVITY);
  return true;   // liegt still: kein Laufen, kein Springen
}
// Affe landet von oben auf dem liegenden Schweinchen -> hoch wie vom Sprungpilz
function polsterPruefen(P, altY){
  const S = koopSchweinchen();
  if(!S || !S.liegt || P.hookAttached || P.haft || P.inWater || (deathState && deathState.victim === S)) return false;
  const oben = S.y - POLSTER_HOEHE;
  if(!(P.vy >= 0 || P.grounded) || altY > oben + 2 || P.y < oben - 1) return false;
  if(Math.abs(P.x - S.x) >= POLSTER_TREFFER + P.w/2) return false;
  P.y = oben; P.vy = POLSTER_V; P.grounded = false; P.glideTimer = 0; P.lastWallJumpSide = 0;
  P.sprungKurzMoeglich = false; P.wjInputLock = 0;
  S._polsterT = performance.now();
  if(typeof SFX !== 'undefined' && SFX.polster) SFX.polster(S);
  return true;
}

// ---------- Affe pusten ----------
function pusteRichtungAus(P){
  if(koopTaste(P, 'pull')) return 'hoch';
  if(koopTaste(P, 'left')) return -1;
  if(koopTaste(P, 'right')) return 1;
  return P.pusteRichtung === 'hoch' ? 'hoch' : (P.facing < 0 ? -1 : 1);
}
// Strahl-Rechteck für eine Richtung (vom Mund aus)
// Mund der (kleinen, runden) 3D-Figur: seitlich gut 10 px über dem Boden und PUSTE_MUND_VOR vor der Mitte, nach oben (Kopf
// im Nacken) oben am Kopf – gemessen an der 3D-Figur (P._mund, js/33)
const PUSTE_MUND_SEITE_Y = 11, PUSTE_MUND_VOR = 24, PUSTE_MUND_HOCH_Y = 40;
function pusteBereich(P, richtung){
  if(richtung === 'hoch') return {x: P.x - PUSTE_BREITE/2, y: P.y - PUSTE_MUND_HOCH_Y - PUSTE_WEITE_HOCH, w: PUSTE_BREITE, h: PUSTE_WEITE_HOCH};
  const mundY = P.y - PUSTE_MUND_SEITE_Y;
  return {x: richtung > 0 ? P.x + PUSTE_MUND_VOR : P.x - PUSTE_MUND_VOR - PUSTE_WEITE_SEITE, y: mundY - PUSTE_BREITE/2, w: PUSTE_WEITE_SEITE, h: PUSTE_BREITE};
}
// Wand kürzt den Strahl: bis zum ersten festen Kästchen in Blasrichtung (Wind geht nicht durch Wände)
function pusteKuerzen(P, b, richtung){
  const fest = (x, y) => solids.some(s => !s.gone && !s.open && s.type !== 'oneway' && s.type !== 'fake' && x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h);
  if(richtung === 'hoch'){
    for(let d = 10; d < b.h; d += 10) if(fest(P.x, P.y - PUSTE_MUND_HOCH_Y - d)){ b.y = P.y - PUSTE_MUND_HOCH_Y - d; b.h = d; break; }
  } else {
    const y = P.y - PUSTE_MUND_SEITE_Y;
    for(let d = 10; d < b.w; d += 10) if(fest(P.x + richtung*(PUSTE_MUND_VOR + d), y)){ if(richtung > 0) b.w = d; else { b.x = P.x - PUSTE_MUND_VOR - d; b.w = d; } break; }
  }
  return b;
}
function pustenVorher(P){
  if(P.puste === undefined){ P.puste = 1; P.pustePause = 0; }
  const kann = P.grounded && !P.hookAttached && !P.dash && !P.haft && !P.inWater && !P.zielWartet;
  const will = koopTaste(P, 'pusten') && kann && !(P.pusteLeer && P.puste < PUSTE_NEUSTART);
  if(P.pusteLeer && P.puste >= PUSTE_NEUSTART && !koopTaste(P, 'pusten')) P.pusteLeer = false;
  if(!will || P.puste <= 0){
    if(P.pusteAn){ P.pusteAn = false; P._pusteEndeT = performance.now(); }
    if(P.puste <= 0) P.pusteLeer = true;
    return false;
  }
  if(!P.pusteAn){ P.pusteAn = true; P.pusteT = 0; P._pusteStartT = performance.now(); if(typeof SFX !== 'undefined' && SFX.pustenStart) SFX.pustenStart(P); }
  P.pusteRichtung = pusteRichtungAus(P);
  if(P.pusteRichtung !== 'hoch') P.facing = P.pusteRichtung;
  P.pusteT++;
  P.puste = Math.max(0, P.puste - 1/PUSTE_DAUER);
  P.pustePause = PUSTE_PAUSE;
  P.vx *= 0.5; if(Math.abs(P.vx) < 0.05) P.vx = 0;   // steht still, nur Ausrichten
  P.vy = Math.min(MAX_FALL, P.vy + GRAVITY);
  return true;
}
// einmal je Schritt nach dem Affen: Strahl festlegen (Aufwind-Bereich), Balken laden
function pusteStrahlSetzen(P){
  const i = winds.indexOf(pusteWind);
  if(!P || !P.pusteAn){
    pusteStrahlJetzt = null; if(i >= 0) winds.splice(i, 1);
    if(P && P.puste !== undefined && !P.pusteAn){
      if(P.pustePause > 0) P.pustePause--;
      else P.puste = Math.min(1, P.puste + 1/PUSTE_LADEN);
    }
    return;
  }
  const r = P.pusteRichtung, kraft = Math.min(1, P.pusteT/PUSTE_ANLAUF);
  const b = pusteKuerzen(P, pusteBereich(P, r), r);
  pusteStrahlJetzt = Object.assign({dir: r, kraft, von: P}, b);
  if(r === 'hoch' && kraft >= 1){ Object.assign(pusteWind, b); if(i < 0) winds.push(pusteWind); }
  else if(i >= 0) winds.splice(i, 1);
}
// trifft der Strahl das Rechteck? -> Stärke 0…1 (nimmt zur Spitze hin ab), sonst 0
function pusteTrifft(rect){
  const s = pusteStrahlJetzt; if(!s || !rect) return 0;
  if(!(rect.x < s.x + s.w && rect.x + rect.w > s.x && rect.y < s.y + s.h && rect.y + rect.h > s.y)) return 0;
  const P = s.von, mx = rect.x + rect.w/2, my = rect.y + rect.h/2;
  const d = s.dir === 'hoch' ? (P.y - PUSTE_MUND_HOCH_Y - my) : Math.abs(mx - P.x);
  const weite = s.dir === 'hoch' ? PUSTE_WEITE_HOCH : PUSTE_WEITE_SEITE;
  return s.kraft*Math.max(0.35, 1 - Math.max(0, d)/weite*0.65);
}
// Seiten-Wind schiebt das Schweinchen (vor seiner Physik, im selben Schritt)
function pusteSchieben(S){
  const s = pusteStrahlJetzt; if(!s || s.dir === 'hoch' || S.male) return;
  const k = pusteTrifft({x: S.x - S.w/2, y: S.y - S.h, w: S.w, h: S.h}); if(!k) return;
  const schirm = !S.grounded && S.keys && isDown(S.keys.glide);
  const a = (schirm ? PUSTE_SCHUB : PUSTE_SCHUB_OHNE)*k*s.dir, max = schirm ? PUSTE_SEITE_MAX : 3;
  if(s.dir*S.vx < max) S.vx = s.dir > 0 ? Math.min(max, S.vx + a) : Math.max(-max, S.vx + a);
  if(schirm && S.vy > 0) S.vy *= 0.9;   // trägt ein wenig (fällt langsamer, solange der Wind drückt)
}

// ---------- Einklinken (aus js/32-neue-bewegung.js) ----------
// vor dem Tempo: true = Tempo gesetzt (liegt / pustet), normale Physik aus
function koopAktionVorher(P, moveDir, jumpPressed, nass){
  if(nass){ P.liegt = false; P.pusteAn = false; return false; }
  if(P.male) return pustenVorher(P);
  pusteSchieben(P);
  return liegenVorher(P, moveDir, jumpPressed);
}
// nach dem Bewegen
function koopAktionNachher(P, altX, altY){
  if(P.male) polsterPruefen(P, altY);
}
// einmal pro Physik-Schritt: Windstrahl für den nächsten Schritt, Balken laden, Ton
function koopAktionSchritt(){
  // Strahl für den nächsten Schritt (das Schweinchen wird nach dem Affen gerechnet und spürt ihn ab dem nächsten Schritt)
  const A = koopAffe();
  if(A && (won || A.zielWartet || A.baumIntro || (deathState && deathState.victim === A))) A.pusteAn = false;
  pusteStrahlSetzen(A);
  const s = pusteStrahlJetzt;
  if(s && schrittNr() % 14 === 0 && typeof SFX !== 'undefined' && SFX.pusten) SFX.pusten(s.von, s.kraft);
}
function koopAktionZuruecksetzen(){
  pusteStrahlJetzt = null;
  for(const P of [p1, p2]) if(P){ P.liegt = false; P.pusteAn = false; P.puste = 1; P.pusteLeer = false; P.pustePause = 0; }
}

// ---------- Zeichnen (nur Anzeige) ----------
// Stauchen der Figur: liegendes Schweinchen flach und breit, federt nach, wenn der Affe abspringt; pustender Affe holt Luft
function koopAktionSquash(P){
  let sx = 1, sy = 1;
  if(window.figur3dMass && typeof neueFigurenAn === 'function' && neueFigurenAn()) return [sx, sy];   // 3D-Figuren: eigene Posen (js/33)
  const t = performance.now();
  if(P.liegt){
    const k = Math.min(1, (t - (P._liegtT || 0))/140), e = k*k*(3 - 2*k);
    sx *= 1 + 0.22*e; sy *= 1 - 0.38*e;
    if(P._polsterT){ const q = (t - P._polsterT)/320; if(q < 1){ const a = Math.sin(q*Math.PI*2.5)*(1 - q)*0.22; sy *= 1 - a; sx *= 1 + a*0.6; } }
  }
  if(P.pusteAn){
    const k = (t - (P._pusteStartT || 0))/180;
    if(k < 1){ const a = Math.sin(k*Math.PI)*0.12; sy *= 1 + a; sx *= 1 - a*0.5; }   // Luft holen
    else { const w = Math.sin(t/45)*0.02; sx *= 1.04 + w; sy *= 0.97 - w; }        // pustet kräftig (leichtes Zittern)
  }
  return [sx, sy];
}
function pusteBalkenZeichnen(P, px, py){
  if(P.puste === undefined) return;
  const voll = P.puste >= 1 && !P.pusteAn;
  if(voll && !(P._pusteEndeT && performance.now() - P._pusteEndeT < 600)) return;   // voll und ruhig: kein Balken
  const w = 30, h = 5, seite = P.pusteAn && P.pusteRichtung === 'hoch';   // pustet nach oben: Balken neben den Kopf (nicht in den Wind)
  const x = seite ? px - w - 34 : px - w/2, y = seite ? py - P.h - 4 : py - P.h - 34;
  ctx.fillStyle = 'rgba(20,30,40,0.5)'; roundRect(x - 1.5, y - 1.5, w + 3, h + 3, 3); ctx.fill();
  const leer = P.pusteLeer && P.puste < PUSTE_NEUSTART;
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, leer ? '#9aa7b0' : '#bff4ff'); g.addColorStop(1, leer ? '#cfd8de' : '#5fd0ff');
  ctx.fillStyle = g; roundRect(x, y, Math.max(0.01, w*P.puste), h, 2.5); ctx.fill();
  if(leer){ ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + w*PUSTE_NEUSTART, y - 1); ctx.lineTo(x + w*PUSTE_NEUSTART, y + h + 1); ctx.stroke(); }
}
// Mund des Affen (Weltkoordinaten): die 3D-Figur meldet ihn je Bild (P._mund, js/33) – so kommt der Wind in jeder Ansicht
// (seitlich, von vorn, nach oben) wirklich aus dem Mund; sonst (bisherige Figuren) eine feste Stelle vorn am Kopf
function pusteMund(P){
  const m = P._mund;
  if(m && performance.now() - m.t < 200) return m;
  const hoch = P.pusteRichtung === 'hoch';
  return {x: P.x + (hoch ? 0 : (P.pusteRichtung || P.facing || 1)*PUSTE_MUND_VOR), y: P.y - (hoch ? PUSTE_MUND_HOCH_Y : PUSTE_MUND_SEITE_Y)};
}
// Windstrahl im Aussehen des Aufwinds (windInhaltZeichnen, elemente/aufwind.js): am Mund schmal, öffnet sich zum Trichter,
// in Blasrichtung gedreht und deutlich schneller als ein Aufwind; ein paar Druckringe direkt vor dem Mund
function pusteZeichnen(){
  const s = pusteStrahlJetzt;
  if(s && typeof windInhaltZeichnen === 'function'){
    const P = s.von, m = pusteMund(P), hoch = s.dir === 'hoch', tw = performance.now()*0.001;
    const len = Math.max(30, hoch ? m.y - s.y : Math.abs((s.dir > 0 ? s.x + s.w : s.x) - m.x)), B = PUSTE_BREITE;
    ctx.save();
    ctx.translate(m.x - camX, m.y);
    ctx.rotate(hoch ? 0 : s.dir*Math.PI/2);   // Zeichenrichtung „nach oben“ = Blasrichtung
    ctx.beginPath(); ctx.moveTo(-5, 2); ctx.quadraticCurveTo(-B*0.2, -len*0.35, -B/2, -len); ctx.lineTo(B/2, -len);
    ctx.quadraticCurveTo(B*0.2, -len*0.35, 5, 2); ctx.closePath(); ctx.clip();
    windInhaltZeichnen(-B/2, -len, B, len*1.2, tw, 7.3, (0.95 + 0.05*Math.sin(tw*20))*s.kraft, 2.6, 1);
    ctx.restore();
    ctx.save(); ctx.translate(m.x - camX, m.y); ctx.rotate(hoch ? 0 : s.dir*Math.PI/2);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.6;
    for(let i = 0; i < 3; i++){ const ph = ((tw*3.6 + i/3) % 1), r = 4 + ph*12;
      ctx.globalAlpha = (1 - ph)*0.7*s.kraft; ctx.beginPath(); ctx.ellipse(0, -6 - ph*30, r, r*0.3, 0, 0, Math.PI*2); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = 1;
  }
  for(const P of [p1, p2]){
    if(!P || !P.male || (deathState && P === deathState.victim)) continue;
    pusteBalkenZeichnen(P, Math.round(P.x - camX), Math.round(P.y));
  }
}
