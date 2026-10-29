// 34-koop-aktionen.js – Teil des Spiels "Monchichi Koop" (Dschungel-Neu).
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.
//
// Zwei Koop-Aktionen auf der Spezial-Taste des Spielers (Standard: Affe H / R1, Schweinchen Num 4 / R1):
//   - Schweinchen SCHIRM-TRAMPOLIN (Taste halten): steht still und spannt den offenen Schirm über sich; der Affe federt
//     vom Schirm hoch (höchster Punkt wie früher vom Sprungpilz).
//   - Affe PUSTEN (Taste halten): steht still und bläst einen Windstrahl nach oben / links / rechts (W, A, D) oder schräg
//     nach oben (W + A / W + D). Der Strahl
//     trägt das Schweinchen mit offenem Schirm (nach oben wie ein Aufwind, zur Seite als Schub) und bewegt leichte Dinge
//     (`pusteTrifft`, z. B. Windrad). Ein Balken über dem Kopf leert sich beim Pusten und lädt danach wieder auf.
// Rollen: das Schweinchen hilft dem Affen nach oben, der Affe dem Schweinchen – keine Figur kommt allein durch.
// Einklinken nur über die Haken der neuen Bewegung (js/32: neueBewegungVorher / neueBewegungNachher) – die alte Physik in
// 08 bleibt unberührt; ohne Spezial-Taste läuft alles Schritt für Schritt wie vorher (Test bahnen_alte_mechaniken).
// Werte: js/02-physik-werte.js (Abschnitt „Dschungel-Neu“). Zustand an der Figur: P.trampolin, P.puste (0…1), P.pusteAn,
// P.pusteRichtung ('hoch' | 'hl' | 'hr' | -1 | 1), P.pusteT (Schritte seit Beginn), P.pusteLeer (ganz leer gepustet), P.pustePause.

// Der Windstrahl steht – solange der Affe pustet – als Aufwind-Bereich in `winds` (elemente/aufwind.js): so trägt er das
// Schweinchen beim Segeln mit genau derselben Regel wie ein Aufwind-Feld. Gezeichnet wird er hier (aufwind.js überspringt ihn).
const pusteWind = {x: 0, y: 0, w: 0, h: 0, puste: true};
let pusteStrahlJetzt = null;      // {x, y, w, h, dir, kraft} des laufenden Strahls (null = niemand pustet)

function koopTaste(P, name){ const k = P.keys && P.keys[name]; return !!(k && isDown(k)); }
function koopSchweinchen(){ return [p1, p2].find(P => P && !P.male); }
function koopAffe(){ return [p1, p2].find(P => P && P.male); }

// ---------- Schweinchen: Schirm-Trampolin ----------
function trampolinVorher(P, moveDir, jumpPressed){
  const will = koopTaste(P, 'trampolin') && P.grounded && !P.dash && !P.haft && !P.inWater;
  if(!will){ if(P.trampolin){ P.trampolin = false; P._trampolinEndeT = performance.now(); } return false; }
  if(!P.trampolin){ P.trampolin = true; P._trampolinT = performance.now(); if(typeof SFX !== 'undefined' && SFX.schirmAuf) SFX.schirmAuf(P); }
  // Extra-Schub (Nutzerwunsch): Springen-Taste im richtigen Moment – kurz vor dem Aufprall gemerkt, kurz danach sofort
  if(jumpPressed){
    P._schubDruck = schrittNr();
    const A = P._trampolinAffe;
    if(A && schrittNr() - P._trampolinSchritt <= TRAMPOLIN_SCHUB_FENSTER && !P._schubGegeben && A.vy < 0) trampolinSchub(P, A);
  }
  P.vx *= 0.55; if(Math.abs(P.vx) < 0.05) P.vx = 0;
  P.vy = Math.min(MAX_FALL, P.vy + GRAVITY);
  return true;   // hält den Schirm: kein Laufen, kein Springen
}
// Affe landet von oben auf dem Schirm -> hoch (höchster Punkt wie früher vom Sprungpilz)
function trampolinPruefen(P, altY){
  const S = koopSchweinchen();
  if(!S || !S.trampolin || P.hookAttached || P.haft || P.inWater || (deathState && deathState.victim === S)) return false;
  const oben = S.y - TRAMPOLIN_HOEHE;
  if(!(P.vy >= 0 || P.grounded) || altY > oben + 2 || P.y < oben - 1) return false;
  if(Math.abs(P.x - S.x) >= TRAMPOLIN_TREFFER + P.w/2) return false;
  P.y = oben; P.vy = TRAMPOLIN_V; P.grounded = false; P.glideTimer = 0; P.lastWallJumpSide = 0;
  P.sprungKurzMoeglich = false; P.wjInputLock = 0;
  S._trampolinSprungT = performance.now(); S._trampolinSprungX = P.x - S.x;
  S._trampolinAffe = P; S._trampolinSchritt = schrittNr(); S._schubGegeben = false;
  if(typeof SFX !== 'undefined' && SFX.trampolin) SFX.trampolin(S);
  if(S._schubDruck !== undefined && schrittNr() - S._schubDruck <= TRAMPOLIN_SCHUB_FENSTER) trampolinSchub(S, P);   // kurz vorher gedrückt
  return true;
}
// Extra-Schub: der Affe fliegt mit TRAMPOLIN_V_SCHUB statt TRAMPOLIN_V hinauf (höchstens einmal je Aufprall)
function trampolinSchub(S, P){
  S._schubGegeben = true; S._schubDruck = undefined; S._schubT = performance.now();
  const schon = TRAMPOLIN_V - P.vy;   // seit dem Aufprall schon abgebremst
  P.vy = Math.min(P.vy, TRAMPOLIN_V_SCHUB - schon);
  if(typeof SFX !== 'undefined' && SFX.trampolinSchub) SFX.trampolinSchub(S);
}

// ---------- Affe pusten ----------
function pusteRichtungAus(P){
  const hoch = koopTaste(P, 'pull'), li = koopTaste(P, 'left'), re = koopTaste(P, 'right');
  if(hoch && re && !li) return 'hr';   // Nutzerwunsch: auch schräg nach oben (W + D / W + A)
  if(hoch && li && !re) return 'hl';
  if(hoch) return 'hoch';
  if(li) return -1;
  if(re) return 1;
  return typeof P.pusteRichtung === 'string' ? P.pusteRichtung : (P.facing < 0 ? -1 : 1);
}
// Richtungs-Hilfen: 'hoch' | 'hr' | 'hl' (schräg nach oben) | 1 | -1 (zur Seite)
function pusteSchraeg(r){ return r === 'hr' || r === 'hl'; }
function pusteSeiteVon(r){ return r === 'hr' ? 1 : r === 'hl' ? -1 : r === 'hoch' ? 0 : r; }   // waagerechter Anteil -1/0/1
function pusteDrehung(r){ return r === 'hoch' ? 0 : pusteSchraeg(r) ? pusteSeiteVon(r)*Math.PI/4 : r*Math.PI/2; }   // Zeichnen: 0 = nach oben
// schräger Strahl: Ursprung (oberer Kopf, leicht zur Blasrichtung), Einheits-Richtung, Länge bis zur ersten Wand
function pusteSchraegStrahl(P, r){
  const sx = pusteSeiteVon(r), ux = sx*Math.SQRT1_2, uy = -Math.SQRT1_2;
  const ox = P.x + sx*PUSTE_MUND_VOR*0.5, oy = P.y - PUSTE_MUND_HOCH_Y*0.85;
  const fest = (x, y) => solids.some(t => !t.gone && !t.open && t.type !== 'oneway' && t.type !== 'fake' && x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h);
  let L = PUSTE_WEITE_SCHRAEG;
  for(let d = 10; d < L; d += 10) if(fest(ox + ux*d, oy + uy*d)){ L = d; break; }
  return {ox, oy, ux, uy, L, x: Math.min(ox, ox + ux*L) - PUSTE_BREITE/2, y: oy + uy*L - PUSTE_BREITE/2, w: Math.abs(ux*L) + PUSTE_BREITE, h: -uy*L + PUSTE_BREITE};
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
  // leer gepustet: erst Taste loslassen UND bis PUSTE_NEUSTART laden – sonst sprang er bei gehaltener Taste immer wieder
  // kurz an (Balken nie voll, Affe flackert hin und her; Nutzer-Rückmeldung)
  if(P.pusteLeer && P.puste >= PUSTE_NEUSTART && !koopTaste(P, 'pusten')) P.pusteLeer = false;
  const will = koopTaste(P, 'pusten') && kann && !P.pusteLeer;
  if(!will || P.puste <= 0){
    if(P.pusteAn){ P.pusteAn = false; P._pusteEndeT = performance.now(); }
    if(P.puste <= 0) P.pusteLeer = true;
    return false;
  }
  if(!P.pusteAn){ P.pusteAn = true; P.pusteT = 0; P._pusteStartT = performance.now(); if(typeof SFX !== 'undefined' && SFX.pustenStart) SFX.pustenStart(P); }
  P.pusteRichtung = pusteRichtungAus(P);
  if(P.pusteRichtung !== 'hoch') P.facing = pusteSeiteVon(P.pusteRichtung);
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
  if(pusteSchraeg(r)){   // schräg: eigener Strahl (kein Aufwind-Rechteck), Wirkung in pusteSchieben
    pusteStrahlJetzt = Object.assign({dir: r, kraft, von: P}, pusteSchraegStrahl(P, r));
    if(i >= 0) winds.splice(i, 1);
    return;
  }
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
  if(pusteSchraeg(s.dir)){   // schräg: Abstand zur Strahl-Achse
    const t = (mx - s.ox)*s.ux + (my - s.oy)*s.uy, q = Math.abs((mx - s.ox)*s.uy - (my - s.oy)*s.ux);
    if(t < -10 || t > s.L || q > PUSTE_BREITE/2 + Math.min(rect.w, rect.h)/2) return 0;
    return s.kraft*Math.max(0.35, 1 - Math.max(0, t)/PUSTE_WEITE_SCHRAEG*0.65);
  }
  const d = s.dir === 'hoch' ? (P.y - PUSTE_MUND_HOCH_Y - my) : Math.abs(mx - P.x);
  const weite = s.dir === 'hoch' ? PUSTE_WEITE_HOCH : PUSTE_WEITE_SEITE;
  return s.kraft*Math.max(0.35, 1 - Math.max(0, d)/weite*0.65);
}
// Seiten-Wind schiebt das Schweinchen in der Luft (vor seiner Physik, im selben Schritt)
function pusteSchieben(S){
  const s = pusteStrahlJetzt; if(!s || s.dir === 'hoch' || S.male || S.grounded) return;   // am Boden stemmt es sich dagegen
  const k = pusteTrifft({x: S.x - S.w/2, y: S.y - S.h, w: S.w, h: S.h}); if(!k) return;
  const schirm = !S.grounded && S.keys && isDown(S.keys.glide);
  if(pusteSchraeg(s.dir)){   // schräg nach oben: trägt (wie Aufwind, etwas schwächer) und schiebt zur Seite
    const sx = pusteSeiteVon(s.dir);
    if(schirm){ S.vy = Math.max(-PUSTE_SCHRAEG_HOCH_MAX, S.vy - PUSTE_SCHRAEG_HUB*k); if(sx*S.vx < PUSTE_SEITE_MAX) S.vx += sx*PUSTE_SCHUB*0.8*k; }
    else if(sx*S.vx < 3) S.vx += sx*PUSTE_SCHUB_OHNE*k;
    return;
  }
  const a = (schirm ? PUSTE_SCHUB : PUSTE_SCHUB_OHNE)*k*s.dir, max = schirm ? PUSTE_SEITE_MAX : 3;
  if(s.dir*S.vx < max) S.vx = s.dir > 0 ? Math.min(max, S.vx + a) : Math.max(-max, S.vx + a);
  if(schirm && S.vy > 0) S.vy *= 0.9;   // trägt ein wenig (fällt langsamer, solange der Wind drückt)
}

// ---------- Einklinken (aus js/32-neue-bewegung.js) ----------
// vor dem Tempo: true = Tempo gesetzt (hält den Schirm / pustet), normale Physik aus
function koopAktionVorher(P, moveDir, jumpPressed, nass){
  if(nass){ P.trampolin = false; P.pusteAn = false; return false; }
  if(P.male) return pustenVorher(P);
  pusteSchieben(P);
  return trampolinVorher(P, moveDir, jumpPressed);
}
// nach dem Bewegen
function koopAktionNachher(P, altX, altY){
  if(P.male) trampolinPruefen(P, altY);
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
  for(const P of [p1, p2]) if(P){ P.trampolin = false; P.pusteAn = false; P.puste = 1; P.pusteLeer = false; P.pustePause = 0; }
}

// ---------- Zeichnen (nur Anzeige) ----------
// Stauchen der Figur: Schweinchen geht beim Abfedern des Affen kurz in die Knie; pustender Affe holt Luft
function koopAktionSquash(P){
  let sx = 1, sy = 1;
  if(window.figur3dMass && typeof neueFigurenAn === 'function' && neueFigurenAn()) return [sx, sy];   // 3D-Figuren: eigene Posen (js/33)
  const t = performance.now();
  if(P.trampolin && P._trampolinSprungT){ const q = (t - P._trampolinSprungT)/300; if(q < 1){ const a = Math.sin(q*Math.PI)*(1 - q)*0.18; sy *= 1 - a; sx *= 1 + a*0.5; } }   // geht beim Abfedern in die Knie
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
  const w = 30, h = 5, seite = P.pusteAn && (P.pusteRichtung === 'hoch' || pusteSchraeg(P.pusteRichtung));   // pustet nach oben: Balken neben den Kopf (nicht in den Wind)
  const x = seite ? px - w - 34 : px - w/2, y = seite ? py - P.h - 4 : py - P.h - 34;
  ctx.fillStyle = 'rgba(20,30,40,0.5)'; roundRect(x - 1.5, y - 1.5, w + 3, h + 3, 3); ctx.fill();
  const leer = P.pusteLeer;   // grau, bis man loslässt und er wieder bis PUSTE_NEUSTART geladen hat
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
  const r = P.pusteRichtung, hoch = r === 'hoch' || pusteSchraeg(r);
  return {x: P.x + (r === 'hoch' ? 0 : (pusteSeiteVon(r) || P.facing || 1)*PUSTE_MUND_VOR*(hoch ? 0.5 : 1)), y: P.y - (hoch ? PUSTE_MUND_HOCH_Y*(r === 'hoch' ? 1 : 0.85) : PUSTE_MUND_SEITE_Y)};
}
// Windstrahl = derselbe Wind wie der Aufwind im Spiel (windInhaltZeichnen, elemente/aufwind.js: weiche helle Säule, lange
// Schlieren, Funkel-Staub, Blättchen), als gerade Säule vom Mund aus in Blasrichtung gedreht und etwas schneller.
// (mx, my) = Mund im aktuellen Zeichen-Bezugssystem. Die 3D-Figur ruft das direkt beim Zeichnen auf (js/33: genau an
// ihrem Mund, auch beim Hüpfen/Stauchen); für die bisherigen Figuren zeichnet pusteZeichnen an einer festen Stelle.
const PUSTE_SAEULE_BREITE = 76;   // px: so breit wie eine Aufwind-Säule von 2 Kästchen (sichtbar etwas schmaler, weich auslaufend)
function pusteSaeuleZeichnen(s, mx, my, len){
  if(typeof windInhaltZeichnen !== 'function') return;
  const hoch = s.dir === 'hoch', tw = performance.now()*0.001, B = PUSTE_SAEULE_BREITE;
  ctx.save();
  ctx.translate(mx, my);
  ctx.rotate(pusteDrehung(s.dir));   // Zeichenrichtung „nach oben“ = Blasrichtung (auch schräg)
  // am Mund schmal (Mundbreite), auf den ersten 30 px zur vollen Säule – sonst stünde vor dem Mund eine harte Kante
  ctx.beginPath(); ctx.moveTo(-9, 3); ctx.quadraticCurveTo(-B/2, -6, -B/2, -32); ctx.lineTo(-B/2, -len); ctx.lineTo(B/2, -len);
  ctx.lineTo(B/2, -32); ctx.quadraticCurveTo(B/2, -6, 9, 3); ctx.closePath(); ctx.clip();
  // das Schein-Bild reicht etwas hinter den Mund (dort ist es am hellsten, sein weicher Rand liegt hinter dem Mund)
  windInhaltZeichnen(-B/2, -len, B, len*1.25, tw, 7.3, (0.9 + 0.1*Math.sin(tw*9))*s.kraft, 1.5, 1);
  ctx.restore(); ctx.globalAlpha = 1;
}
function pusteLaenge(s, mWelt){
  if(pusteSchraeg(s.dir)) return Math.max(30, s.L);
  return Math.max(30, s.dir === 'hoch' ? mWelt.y - s.y : Math.abs((s.dir > 0 ? s.x + s.w : s.x) - mWelt.x));
}
function pusteAmMundZeichnen(P, mx, my){
  const s = pusteStrahlJetzt; if(!s || s.von !== P) return;
  P._mundGezeichnetT = performance.now();
  pusteSaeuleZeichnen(s, mx, my, pusteLaenge(s, pusteMund(P)));
}
function pusteZeichnen(){
  const s = pusteStrahlJetzt;
  if(s && !(s.von._mundGezeichnetT && performance.now() - s.von._mundGezeichnetT < 200)){   // nur ohne 3D-Figur (sonst zeichnet js/33)
    const m = pusteMund(s.von); pusteSaeuleZeichnen(s, m.x - camX, m.y, pusteLaenge(s, m));
  }
  const ohne3d = !(window.figur3dMass && typeof neueFigurenAn === 'function' && neueFigurenAn());
  for(const P of [p1, p2]){
    if(!P || (deathState && P === deathState.victim)) continue;
    const px = Math.round(P.x - camX), py = Math.round(P.y);
    if(!P.male && P._schubT && performance.now() - P._schubT < 350){   // Extra-Schub: kurze helle Schwünge über dem Schirm
      const q = (performance.now() - P._schubT)/350, y0 = py - TRAMPOLIN_HOEHE - 6 - q*40;
      ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#fff6c8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for(const dx of [-16, 0, 16]){ ctx.beginPath(); ctx.moveTo(px + dx, y0 + 18); ctx.lineTo(px + dx*1.3, y0); ctx.stroke(); }
      ctx.restore();
    }
    if(P.male) pusteBalkenZeichnen(P, px, py);
    else if(P.trampolin && ohne3d && typeof drawUmbrella === 'function')   // bisherige Figuren: Schirm über dem Kopf (3D: js/33)
      drawUmbrella(P, px, py, {u: 1, hand: [px, py - P.h - 9], stick: TRAMPOLIN_HOEHE - P.h - 13, tilt: 0, quetsch: 0,
                               haende: {schulter: [P.w*0.36, 13], farbe: '#f7aac4', rand: '#cf7d9b'}});   // Ärmchen vom Scheitel hinauf
  }
}
