// 28-packages.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Packages öffnen + Sammlung (Menü-Bildschirme, Stil in css/packages.css) ----------
// Geschenkpaket je Package (Papier in Figurenfarbe, goldenes Band mit Schleife). Öffnen: Paket fällt herein → wackelt
// immer stärker → Band spannt sich und franst aus, Licht dringt unter dem Deckel hervor (zuletzt in der Farbe der
// Seltenheit) → Spannungston → Band reißt, Deckel fliegt weg → Item erscheint
// (je seltener, desto mehr Funken, Strahlen, Konfetti, Fanfare) → Name + Seltenheit → „Anlegen“ oder „Behalten“.
// Leer: Rauchwölkchen, Deckel hebt sich nur müde, eine Fliege summt heraus, trauriges Posaunen-Wah-wah.
// Beide Figuren öffnen gleichzeitig: links Affe, rechts Schweinchen, jede mit ihrer eigenen Springen-Taste.
// Sammlung: alle Cosmetics je Figur (besessen / angelegt / fehlt, Seltenheit), Vorschau mit rollender Kugel.
// Alles hier ist reine Anzeige im Menü – nichts davon verändert das Spiel (Tempo, Sprung, Kollision, Münzen …).
(() => {
'use strict';
const UI = window.GameMenu && window.GameMenu.ui;
if (!UI) return;
const { S, go, toast, mk, $, $$, Snd, charSVG } = UI;
const WHO_NAME = { m: 'Affe', f: 'Schweinchen' };
const faceImg = who => who === 'm' ? ASSETS.monkey : ASSETS.pig;
const clamp01 = v => Math.max(0, Math.min(1, v));
const easeOutBack = k => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3*Math.pow(k - 1, 3) + c1*Math.pow(k - 1, 2); };
const keyName = who => (UI.playerOf(who) === 1 ? 'Leertaste' : 'Enter') + ' / ✕';

/* =====================================================================
   KLÄNGE (alle erzeugt, folgen Ton aus/an und dem Effekte-Regler)
   ===================================================================== */
const sv = v => v*(typeof VOL !== 'undefined' ? VOL.sfx : 1);
const semi = (f, n) => f*Math.pow(2, n/12);
const PSFX = {
  // Wackeln: Klacker-Ticks, immer schneller, dazu ein steigender Spannungston
  shake(durS, rk) {
    sfxLog('packShake');
    const n = 9 + rk*2;
    for (let i = 0; i < n; i++) {
      const t = durS*Math.sqrt(i/n);
      sNoise(t, 0.05, { f: 1500 + Math.random()*900, q: 4, vol: sv(0.07) });
      sTone(120 + i*6, t, 0.09, { type: 'triangle', vol: sv(0.05) });
    }
    sTone(170, durS*0.25, durS*0.78, { type: 'triangle', to: 170*(2.4 + rk*0.25), vol: sv(0.035), attack: durS*0.6 });
    sNoise(durS*0.3, durS*0.72, { f: 500, to: 5200, q: 1.4, vol: sv(0.05), attack: durS*0.6 });
  },
  burst(rank) {
    sfxLog('packBurst');
    sNoise(0, 0.05, { filter: 'highpass', f: 3000, vol: sv(0.16) }); sTone(900, 0, 0.12, { type: 'triangle', to: 300, vol: sv(0.05) });   // Band reißt (Schnapp)
    sNoise(0, 0.55, { filter: 'lowpass', f: 3600, to: 180, vol: sv(0.22), q: 0.7 });
    sTone(95, 0, 0.4, { to: 38, vol: sv(0.22) });
    if (rank >= 4) sNoise(0.02, 1.2, { filter: 'highpass', f: 4000, to: 9000, vol: sv(0.05), attack: 0.02 });
  },
  // Fanfare wird mit der Seltenheit größer
  fanfare(rank) {
    sfxLog('packFanfare_' + RARITIES[rank].id);
    const base = 523.25;
    const runs = [[], [0, 7], [0, 4, 7], [0, 4, 7, 12], [0, 4, 7, 11, 14], [0, 4, 7, 12, 16, 19], [0, 2, 4, 7, 9, 12, 16, 19, 24]];
    const notes = runs[rank] || [0, 7], step = rank >= 5 ? 0.09 : 0.075;
    notes.forEach((n, i) => {
      sTone(semi(base, n), 0.12 + i*step, 0.28 + (i === notes.length - 1 ? 0.5 : 0), { type: 'triangle', vol: sv(0.07) });
      sTone(semi(base, n + 12), 0.12 + i*step, 0.18, { vol: sv(0.025) });
    });
    const end = 0.12 + notes.length*step;
    if (rank >= 3) for (let i = 0; i < 6 + rank*3; i++) sTone(2000 + Math.random()*3000, end + i*0.045, 0.12, { vol: sv(0.018) });   // Glitzern
    if (rank >= 4) [0, 4, 7, 12].forEach(n => sTone(semi(base/2, n), end, 1.4 + rank*0.2, { type: 'sine', vol: sv(0.045), attack: 0.05 }));   // Akkord
    if (rank >= 6) [0, 4, 7, 11, 14].forEach((n, i) => { sTone(semi(base, n)*1.003, end + 0.3, 2.2, { vol: sv(0.03), attack: 0.3 }); sTone(semi(base, n)*0.997, end + 0.3 + i*0.02, 2.2, { vol: sv(0.03), attack: 0.3 }); });
  },
  // Leer: Puff + trauriges „Wah-wah-wah-waaah“
  empty() {
    sfxLog('packEmpty');
    sNoise(0, 0.6, { filter: 'lowpass', f: 900, to: 200, vol: sv(0.12), attack: 0.03 });
    const f0 = 233;
    [0, -1, -2].forEach((n, i) => sTone(semi(f0, n), 0.35 + i*0.38, 0.34, { type: 'sawtooth', vol: sv(0.03), attack: 0.03 }));
    const a = sfxCtx(); if (!a || soundMuted) return;
    try {   // letzter Ton lang mit Wackeln (Vibrato)
      const t = a.currentTime + 0.35 + 3*0.38, o = a.createOscillator(), g = a.createGain(), lfo = a.createOscillator(), lg = a.createGain(), flt = a.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(semi(f0, -3), t); o.frequency.linearRampToValueAtTime(semi(f0, -4.5), t + 1.1);
      lfo.frequency.value = 6; lg.gain.value = 5; lfo.connect(lg); lg.connect(o.frequency);
      flt.type = 'lowpass'; flt.frequency.value = 1400;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(sv(0.035), t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      o.connect(flt); flt.connect(g); g.connect(audioOut()); o.start(t); lfo.start(t); o.stop(t + 1.25); lfo.stop(t + 1.25);
    } catch (e) {}
  },
  equip() { sfxLog('packEquip'); [0, 7, 12].forEach((n, i) => sTone(semi(659, n), i*0.06, 0.18, { type: 'triangle', vol: sv(0.06) })); },
  keep() { sfxLog('packKeep'); sTone(587, 0, 0.12, { type: 'triangle', vol: sv(0.05) }); sTone(784, 0.07, 0.16, { type: 'triangle', vol: sv(0.05) }); },
  thud() { sNoise(0, 0.18, { filter: 'lowpass', f: 600, vol: sv(0.12) }); sTone(80, 0, 0.18, { to: 50, vol: sv(0.12) }); }
};

/* =====================================================================
   VORSCHAU: Figur rollt mit den Cosmetics hin und her (fester Takt 60/s, wie im Spiel)
   ===================================================================== */
function newPreview() { return { t: 0, x: 0, y: 0, roll: 0, vx: 0, vy: 0, grounded: true, st: cosNewState() }; }
function previewStep(pv, who, items) {
  pv.t++;
  const w = 0.045, A = 58, ox = pv.x;
  pv.x = Math.sin(pv.t*w)*A; pv.vx = pv.x - ox;
  const h = pv.t % 170, oy = pv.y;
  pv.y = h < 28 ? -Math.sin(Math.PI*h/28)*26 : 0; pv.vy = pv.y - oy; pv.grounded = h >= 28;
  pv.roll += pv.vx/21;
  const rig = previewRig(pv);
  cosStep(rig, pv.st, who, items);
}
function previewRig(pv) { return { x: pv.x, y: pv.y, r: 21, roll: pv.roll, vx: pv.vx*1.6, vy: pv.vy, grounded: pv.grounded, facing: pv.vx >= 0 ? 1 : -1 }; }
// zeichnet die Figur mit Cosmetics; (cx, cy) = Bodenmitte auf dem Bildschirm, sc = Vergrößerung
function drawPreview(c, cx, cy, sc, who, items, pv, ghost) {
  const rig = previewRig(pv), img = faceImg(who);
  c.save(); c.translate(cx, cy - 21*sc); c.scale(sc, sc);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(rig.x, 22, 18*(1 + rig.y/80), 3.5, 0, 0, Math.PI*2); c.fill();
  drawTrail(c, rig, pv.st, items.trail, 0);
  drawPet(c, pv.st, items.pet, 0, who);
  drawAura(c, rig.x, rig.y, 21, items.aura, 'back');
  drawOrbit(c, rig.x, rig.y, 21, items.orbit, 'back');
  const size = 32.3*1.55, hgt = img && img.naturalWidth ? size*img.naturalHeight/img.naturalWidth : size*0.83;
  c.save(); c.translate(rig.x, rig.y); c.rotate(rig.roll);
  if (ghost) { c.globalAlpha = 0.25; }
  if (items.skin) drawSkinBall(c, 21, items.skin, img, size, hgt, size/2 - hgt/2 - 4);
  else if (img && img.naturalWidth) c.drawImage(img, -size/2, size/2 - hgt - 4, size, hgt);
  c.restore();
  drawAura(c, rig.x, rig.y, 21, items.aura, 'front');
  drawOrbit(c, rig.x, rig.y, 21, items.orbit, 'front');
  drawPrestigeSparkle(c, rig.x, rig.y, pv.st);
  c.restore();
}
const itemsWith = (who, item) => { const it = cosItemsOf(who); if (item) it[item.slot] = item; return it; };

/* =====================================================================
   DAS GESCHENKPAKET (realistisch, leicht schräg von vorn: Vorderseite, rechte Seite, Deckel mit Oberseite;
   oranges Papier, dunkelbraunes Satinband mit Schleife; weicher Schatten nur unter dem Paket)
   ===================================================================== */
const GIFT_SCALE = 1.3;   // Grundgröße des Pakets
const PAPER = { front: ['#ffa040', '#e8741a'], side: ['#c85a0c', '#a8480a'], top: '#ffb766', edge: '#8a3c08' };
const GIFT = { m: { paper: [PAPER.front[0]] }, f: { paper: [PAPER.front[0]] } };   // (Fetzen-Farbe)
const RIB = '#4a2c1c', RIB_HI = '#7a4c34', RIB_D = '#2a160c';
function poly(c, pts) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); }
const DX = 22, DY = -10;   // Tiefe (Seite/Oberseite schräg nach hinten rechts)
// Karton: Vorderseite x -66…44, y -16…80; Seite nach rechts hinten
function giftBody(c, cut, open) {
  const F = [[-66, -16], [44, -16], [44, 80], [-66, 80]], SIDE = [[44, -16], [44 + DX, -16 + DY], [44 + DX, 80 + DY], [44, 80]];
  let g = c.createLinearGradient(0, -16, 0, 80); g.addColorStop(0, PAPER.front[0]); g.addColorStop(1, PAPER.front[1]);
  c.fillStyle = g; poly(c, F); c.fill();
  g = c.createLinearGradient(44, 0, 44 + DX, 0); g.addColorStop(0, PAPER.side[0]); g.addColorStop(1, PAPER.side[1]);
  c.fillStyle = g; poly(c, SIDE); c.fill();
  // feine Papierstruktur (dezente Streifen) auf der Vorderseite
  c.save(); poly(c, F); c.clip(); c.strokeStyle = 'rgba(255,255,255,.07)'; c.lineWidth = 6;
  for (let x = -110; x < 60; x += 18) { c.beginPath(); c.moveTo(x, 80); c.lineTo(x + 96, -16); c.stroke(); } c.restore();
  // Band: senkrecht vorn, waagerecht vorn + an der Seite
  const top = cut ? -4 : -16;
  c.fillStyle = RIB; c.fillRect(-22, top, 22, 80 - top); c.fillRect(-66, 24, 110, 16);
  poly(c, [[44, 24], [44 + DX, 24 + DY], [44 + DX, 40 + DY], [44, 40]]); c.fill();
  c.fillStyle = RIB_HI; c.fillRect(-20, top, 4, 80 - top); c.fillRect(-66, 26, 110, 3);
  if (cut) { c.fillStyle = RIB; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-22 + i*5.5, -4); c.lineTo(-19 + i*5.5, -11 - (i % 2)*4); c.lineTo(-16.5 + i*5.5, -4); c.fill(); } }
  // Licht von oben links: unten dunkler (nach dem Band, damit es auch das Band trifft)
  c.save(); poly(c, F); c.clip();
  g = c.createLinearGradient(0, -16, 0, 80); g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(0.6, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(60,20,0,.22)');
  c.fillStyle = g; c.fillRect(-70, -20, 120, 104);
  if (!open) { c.fillStyle = 'rgba(60,20,0,.28)'; c.fillRect(-70, -16, 120, 6); }   // Schatten, den der Deckel wirft
  c.restore();
  if (open) {   // offene Oberseite: dunkles Inneres
    c.fillStyle = '#3a1c08'; poly(c, [[-66, -16], [-66 + DX, -16 + DY], [44 + DX, -16 + DY], [44, -16]]); c.fill();
    c.fillStyle = 'rgba(255,190,120,.25)'; poly(c, [[-62, -16], [-62 + DX*0.7, -16 + DY*0.7], [44 + DX*0.7, -16 + DY*0.7], [40, -16]]); c.fill();
  }
  c.strokeStyle = PAPER.edge; c.lineWidth = 2.5; c.lineJoin = 'round';
  poly(c, F); c.stroke(); poly(c, SIDE); c.stroke();
}
// Deckel: Vorderkante x -74…52, y -42…-14, Oberseite und Seite schräg; Band + Schleife
function giftLid(c, cut, strain) {
  const F = [[-74, -42], [52, -42], [52, -14], [-74, -14]], SIDE = [[52, -42], [52 + DX, -42 + DY], [52 + DX, -14 + DY], [52, -14]];
  const TOP = [[-74, -42], [-74 + DX, -42 + DY], [52 + DX, -42 + DY], [52, -42]];
  c.fillStyle = PAPER.top; poly(c, TOP); c.fill();
  let g = c.createLinearGradient(0, -42, 0, -14); g.addColorStop(0, PAPER.front[0]); g.addColorStop(1, PAPER.front[1]);
  c.fillStyle = g; poly(c, F); c.fill();
  c.fillStyle = PAPER.side[0]; poly(c, SIDE); c.fill();
  // Band über Oberseite und Vorderkante; unter Spannung dünner, mit hellen Spannungslinien
  const bw = 22*(1 - 0.5*(strain || 0)), bx = -11 - bw/2;
  c.fillStyle = RIB;
  poly(c, [[bx, -42], [bx + DX, -42 + DY], [bx + bw + DX, -42 + DY], [bx + bw, -42]]); c.fill();
  c.fillRect(bx, -42, bw, cut ? 20 : 28);
  if (strain > 0.4 && !cut) { c.strokeStyle = 'rgba(255,220,180,.7)'; c.lineWidth = 1.3; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-11 + i*bw*0.3, -22); c.lineTo(-11 + i*bw*0.36, -14); c.stroke(); } }
  c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(-74, -42, 126, 3);
  c.strokeStyle = PAPER.edge; c.lineWidth = 2.5; c.lineJoin = 'round'; poly(c, F); c.stroke(); poly(c, SIDE); c.stroke(); poly(c, TOP); c.stroke();
  // Schleife (Satin, mit Glanz), sitzt auf der Mitte der Oberseite
  c.save(); c.translate(0, -47);
  for (const s of [-1, 1]) {
    const lg = c.createLinearGradient(0, -30, 0, 4); lg.addColorStop(0, RIB_HI); lg.addColorStop(1, RIB_D);
    c.fillStyle = lg; c.strokeStyle = RIB_D; c.lineWidth = 2;
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(s*12, -28, s*44, -30, s*38, -6); c.bezierCurveTo(s*32, 4, s*12, 2, 0, 0); c.fill(); c.stroke();
    c.fillStyle = RIB; c.beginPath(); c.moveTo(s*4, 2); c.lineTo(s*20, 20); c.lineTo(s*12, 22); c.lineTo(s*2, 5); c.fill();   // Bandenden
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 2; c.beginPath(); c.moveTo(s*8, -10); c.quadraticCurveTo(s*22, -22, s*32, -14); c.stroke();
  }
  c.fillStyle = RIB; c.strokeStyle = RIB_D; c.lineWidth = 2; c.beginPath(); c.ellipse(0, -2, 8, 7, 0, 0, Math.PI*2); c.fill(); c.stroke();
  c.restore();
}
// weicher Schatten auf dem Boden, nur unter dem Paket
function giftShadow(c, k) {
  const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, `rgba(0,0,0,${0.6*k})`); g.addColorStop(0.6, `rgba(0,0,0,${0.28*k})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.save(); c.translate(-11 + DX*0.3, 82); c.scale(96, 14); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, Math.PI*2); c.fill(); c.restore();
}
// o = {crack (Band-Spannung), open, leak, leakCol, rot, sc, fade, lazy, lift (springt hoch: Schatten bleibt am Boden)}
function drawGift(c, x, y, o) {
  const open = o.open || 0, fade = o.fade === undefined ? 1 : o.fade, sc = (o.sc || 1)*GIFT_SCALE, hop = o.hop || 0;
  c.save(); c.translate(x, y); c.scale(sc, sc);
  c.globalAlpha = fade; giftShadow(c, Math.max(0.3, 1 - hop/80)); c.globalAlpha = 1;
  c.translate(0, -hop); c.translate(0, 80); c.rotate(o.rot || 0); c.translate(0, -80);   // kippt um die Unterkante
  if (open <= 0) {
    const lift = (o.crack || 0)*5;   // Deckel drückt schon etwas nach oben
    if (o.leak > 0) {                // Licht dringt aus dem Spalt unter dem Deckel
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++) {
        const px = -64 + i*15, a = -Math.PI/2 + (i - 4)*0.3 + Math.sin(performance.now()*0.004 + i)*0.05, len = 60 + o.leak*240;
        const gg = c.createLinearGradient(px, -15, px + Math.cos(a)*len, -15 + Math.sin(a)*len);
        gg.addColorStop(0, hexA(o.leakCol, 0.55*o.leak)); gg.addColorStop(1, hexA(o.leakCol, 0));
        c.fillStyle = gg; c.beginPath(); c.moveTo(px - 4, -15); c.lineTo(px + Math.cos(a - 0.08)*len, -15 + Math.sin(a - 0.08)*len);
        c.lineTo(px + Math.cos(a + 0.08)*len, -15 + Math.sin(a + 0.08)*len); c.lineTo(px + 4, -15); c.fill();
      }
      c.restore();
    }
    giftBody(c, false, false);
    if (o.leak > 0) { c.fillStyle = hexA(o.leakCol, 0.9*o.leak); c.fillRect(-66, -16 - lift, 110, lift + 1); }   // heller Spalt
    c.save(); c.translate(0, -lift); giftLid(c, false, o.crack || 0); c.restore();
  } else {
    // Band reißt, Deckel fliegt weg (bei „leer“ hebt er sich nur müde und kippt zur Seite)
    c.globalAlpha = fade;
    const lz = o.lazy;
    giftBody(c, true, true);
    c.save();
    if (lz) { c.translate(34*open, -30*open); c.rotate(0.36*open + Math.sin(performance.now()*0.006)*0.04*open); }
    else { c.translate(-50*open, -190*open); c.rotate(-1.1*open); }
    giftLid(c, true, 0); c.restore();
  }
  c.restore();
}

/* =====================================================================
   BILDSCHIRM: PACKAGES ÖFFNEN
   ===================================================================== */
const host = $('#sm-modal').parentNode;
const sideHTML = w => `<div class="pk-side pk-${w}">
    <div class="pk-head glass"><span class="mini">${charSVG(w === 'm' ? 'monkey' : 'pig')}</span><b>${WHO_NAME[w]}</b><span class="cnt"></span></div>
    <div class="pk-info"><div class="pk-rar"></div><div class="pk-name"></div><div class="pk-tag"></div></div>
    <div class="pk-btns"><button class="btn" data-a="0" type="button" tabindex="-1">Anlegen</button><button class="btn" data-a="1" type="button" tabindex="-1">Behalten</button></div>
    <div class="pk-hint"></div>
  </div>`;
host.insertBefore(mk(`<section class="screen" id="sm-s-packs" aria-label="Packages öffnen">
    <canvas class="pk-cv" width="1600" height="900"></canvas>
    <div class="pk-title display grad">Packages</div>
    ${sideHTML('m')}${sideHTML('f')}
    <button class="btn back pk-back" type="button" tabindex="-1">← Fertig</button>
  </section>`), $('#sm-modal'));

const PK = {
  el: $('#sm-s-packs'), raf: 0, last: 0, acc: 0, ret: null, sides: {},
  newSide(who) { return { who, phase: 'idle', t0: 0, tb: 0, res: null, sel: 0, parts: [], pv: newPreview(), flash: 0, quake: 0, dur: 0, enter: performance.now() }; },
  enter(arg) {
    this.ret = (arg && arg.ret) || ['levels', 'keep'];
    this.sides = { m: this.newSide('m'), f: this.newSide('f') };
    for (const w of ['m', 'f']) this.paintSide(w);
    this.last = performance.now(); this.acc = 0;
    cancelAnimationFrame(this.raf); this.raf = requestAnimationFrame(t => this.frame(t));
  },
  leave() { cancelAnimationFrame(this.raf); this.raf = 0; },
  busy() { return Object.values(this.sides).some(s => s.phase === 'shake' || s.phase === 'reveal' || s.phase === 'empty'); },
  act(type, src) {
    if (type === 'back') { if (!this.busy()) this.exit(); return; }
    const who = UI.whoOf(src);
    if (who) this.sideAct(who, type);
  },
  exit() {
    // was noch offen auf der Hand liegt (Ergebnis angezeigt, nicht entschieden), ist schon im Inventar – also einfach gehen
    Snd.play('back'); go(this.ret[0], this.ret[1]);
  },
  sideAct(who, type) {
    const s = this.sides[who];
    if (s.phase === 'idle') { if (type === 'confirm') this.start(s); }
    else if (s.phase === 'choose') {
      if (['left', 'right', 'up', 'down'].includes(type)) { s.sel = 1 - s.sel; this.paintSide(who); Snd.play('move'); }
      else if (type === 'confirm') this.decide(s, s.sel);
    }
    else if (s.phase === 'emptyChoose') { if (type === 'confirm') this.decide(s, 1); }
  },
  start(s) {
    if (!cosmeticsSave.pending[s.who]) { Snd.play('locked'); return; }
    s.res = openPackage(s.who);
    const rank = RARITY[s.res.rarity].rank, rk = Math.max(1, rank);   // „leer“ wackelt wie gewöhnlich (keine Vorwarnung)
    s.phase = 'shake'; s.t0 = performance.now(); s.dur = 1500 + rk*260; s.parts.length = 0; s.pv = newPreview();
    PSFX.shake(s.dur/1000, rk);
    this.paintSide(s.who);
  },
  burst(s) {
    const rank = RARITY[s.res.rarity].rank, cx = this.cx(s.who), cy = 430, col = RARITY[s.res.rarity].color;
    s.tb = performance.now();
    if (s.res.empty) {
      s.phase = 'empty'; PSFX.empty();
      for (let i = 0; i < 34; i++) s.parts.push({ k: 'smoke', x: cx + (Math.random() - 0.5)*120, y: cy + (Math.random() - 0.5)*40, vx: (Math.random() - 0.5)*1.2, vy: -0.4 - Math.random()*1.1, r: 14 + Math.random()*22, life: 90 + Math.random()*70, max: 160 });
    } else {
      s.phase = 'reveal'; PSFX.burst(rank); setTimeout(() => PSFX.fanfare(rank), 120);
      s.flash = rank >= 2 ? 0.5 + rank*0.08 : 0.25; s.quake = rank >= 4 ? 6 + rank*3 : 0;
      const n = 30 + rank*28, sp = 4 + rank*1.6;
      for (let i = 0; i < n; i++) {
        const a = Math.random()*Math.PI*2, v = sp*(0.3 + Math.random());
        s.parts.push({ k: rank >= 3 && i % 3 === 0 ? 'star' : 'spark', x: cx, y: cy, vx: Math.cos(a)*v, vy: Math.sin(a)*v - 1, r: 2 + Math.random()*3 + rank*0.4, life: 50 + Math.random()*50, max: 100, col: i % 4 ? col : '#ffffff', rot: a });
      }
      for (let i = 0; i < 14; i++) {   // Band- und Papierfetzen
        const a = -Math.PI/2 + (Math.random() - 0.5)*2.6, v = 4 + Math.random()*5;
        s.parts.push({ k: 'chip', x: cx, y: cy, vx: Math.cos(a)*v, vy: Math.sin(a)*v, r: 3 + Math.random()*4, life: 80, max: 80, col: i % 2 ? RIB : GIFT[s.who].paper[0], rot: a, g: 0.25 });
      }
      if (rank >= 5) this.confetti(s, 70);
    }
    this.paintSide(s.who);
  },
  confetti(s, n) {
    const cx = this.cx(s.who), rb = s.res.rarity === 'prestige';
    const cols = rb ? ['#ff5f6d', '#ffb52e', '#fff35c', '#6fdc6a', '#4fa8ff', '#b46bff', '#ff5fd2'] : ['#ffb52e', '#ffe28a', '#ffffff', '#ffcf3d'];
    for (let i = 0; i < n; i++) s.parts.push({ k: 'conf', x: cx + (Math.random() - 0.5)*760, y: -20 - Math.random()*300, vx: (Math.random() - 0.5)*1.5, vy: 1.5 + Math.random()*2.5, r: 4 + Math.random()*4, life: 260, max: 260, col: cols[i % cols.length], rot: Math.random()*6, vr: (Math.random() - 0.5)*0.3 });
  },
  decide(s, action) {
    const it = s.res && s.res.item;
    if (it && action === 0) { if (!isEquipped(s.who, it.id)) equipItem(s.who, it.id); PSFX.equip(); toast(`${WHO_NAME[s.who]} trägt jetzt: ${it.name}`); }
    else PSFX.keep();
    s.phase = 'idle'; s.res = null; s.parts.length = 0; s.enter = performance.now(); s.sel = 0;
    if (cosmeticsSave.pending[s.who]) PSFX.thud();
    this.paintSide(s.who);
  },
  cx(who) { return who === 'm' ? 400 : 1200; },
  paintSide(who) {
    const s = this.sides[who], box = $('.pk-' + who, this.el), n = cosmeticsSave.pending[who];
    $('.cnt', box).innerHTML = `${UI.ICON.pack}<b>${n}</b>`;
    const info = $('.pk-info', box), btns = $('.pk-btns', box), hint = $('.pk-hint', box);
    const showInfo = s.phase === 'reveal' || s.phase === 'choose' || s.phase === 'empty' || s.phase === 'emptyChoose';
    info.className = 'pk-info' + (showInfo ? ' on r-' + s.res.rarity + (s.res.empty ? '' : ' rk' + RARITY[s.res.rarity].rank) : '');
    if (showInfo) {
      const r = RARITY[s.res.rarity];
      info.style.setProperty('--rc', r.color);
      $('.pk-rar', info).textContent = r.name;
      $('.pk-name', info).textContent = s.res.empty ? 'Leer!' : s.res.item.name;
      const dup = s.res.duplicate ? `Doppelt · jetzt ×${ownedCount(who, s.res.item.id)}` : 'Neu!';
      $('.pk-tag', info).textContent = s.res.empty ? s.joke : `${SLOTS.find(x => x.id === s.res.item.slot).name} · ${dup}`;
    }
    const choose = s.phase === 'choose' || s.phase === 'emptyChoose';
    btns.className = 'pk-btns' + (choose ? ' on' : '');
    const bb = $$('.btn', btns);
    bb[0].style.display = s.phase === 'emptyChoose' ? 'none' : '';
    bb[1].textContent = s.phase === 'emptyChoose' ? 'Weiter' : 'Behalten';
    bb.forEach((b, i) => b.classList.toggle('sel', choose && (s.phase === 'emptyChoose' ? i === 1 : i === s.sel)));
    hint.textContent = s.phase === 'idle' ? (n ? `${keyName(who)} – öffnen` : 'Keine Packages – schafft Level für neue!')
      : s.phase === 'emptyChoose' ? `${keyName(who)} – weiter` : choose ? `◀ ▶ wählen · ${keyName(who)} bestätigen` : '';
  },
  frame(t) {
    if (!this.el.classList.contains('active')) { this.raf = 0; return; }
    const dt = Math.min(50, t - this.last); this.last = t; this.acc += dt;
    let steps = 0;
    while (this.acc >= 1000/60 && steps < 4) { this.acc -= 1000/60; steps++; this.tick(); }
    if (steps >= 4) this.acc = 0;
    this.draw(t);
    this.raf = requestAnimationFrame(tt => this.frame(tt));
  },
  // fester Takt: Partikel, Vorschau, Phasenwechsel
  tick() {
    const now = performance.now();
    for (const w of ['m', 'f']) {
      const s = this.sides[w];
      if (s.phase === 'shake') {
        const k = (now - s.t0)/s.dur;
        if (k > 0.35 && Math.random() < k*0.35) s.parts.push({ k: 'chip', x: this.cx(w) + (Math.random() - 0.5)*24, y: 430 - 16, vx: (Math.random() - 0.5)*3, vy: -1.5 - Math.random()*2, r: 1.2 + Math.random()*1.5, life: 40, max: 40, col: RIB, rot: 0, g: 0.25 });   // Bandfasern
        if (k >= 1) this.burst(s);
      } else if (s.phase === 'reveal') {
        if (now - s.tb > 650 + RARITY[s.res.rarity].rank*170) { s.phase = 'choose'; this.paintSide(w); }
      } else if (s.phase === 'empty') {
        if (now - s.tb > 1700) { s.phase = 'emptyChoose'; this.paintSide(w); }
      }
      if ((s.phase === 'reveal' || s.phase === 'choose') && s.res && !s.res.empty) {
        previewStep(s.pv, w, itemsWith(w, s.res.item));
        const rank = RARITY[s.res.rarity].rank;
        if (rank >= 5 && Math.random() < 0.25) this.confetti(s, 1);
        if (rank >= 3 && Math.random() < 0.12*rank) { const a = Math.random()*Math.PI*2; s.parts.push({ k: 'star', x: this.cx(w) + Math.cos(a)*140, y: 400 + Math.sin(a)*110, vx: 0, vy: -0.4, r: 2 + Math.random()*3, life: 40, max: 40, col: RARITY[s.res.rarity].color, rot: a }); }
      }
      for (let i = s.parts.length - 1; i >= 0; i--) {
        const p = s.parts[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.k === 'spark' || p.k === 'star') { p.vx *= 0.95; p.vy = p.vy*0.95 + 0.06; }
        else if (p.k === 'chip') { p.vy += p.g || 0.25; p.rot += 0.2; }
        else if (p.k === 'smoke') { p.vx *= 0.98; p.r += 0.35; }
        else if (p.k === 'conf') { p.rot += p.vr; p.vx += Math.sin(p.life*0.08)*0.04; }
        if (p.life <= 0 || p.y > 960) s.parts.splice(i, 1);
      }
      s.flash *= 0.9; s.quake *= 0.9;
      if (s.parts.length > 700) s.parts.splice(0, s.parts.length - 700);
    }
  },
  draw(t) {
    const cv = $('.pk-cv', this.el), c = cv.getContext('2d');
    c.clearRect(0, 0, 1600, 900);
    for (const w of ['m', 'f']) this.drawSide(c, this.sides[w], t);
    c.fillStyle = 'rgba(198,255,61,.35)'; c.fillRect(798, 120, 4, 700);   // Trennlinie
  },
  drawSide(c, s, t) {
    const w = s.who, cx = this.cx(w), cy = 430, x0 = w === 'm' ? 0 : 800;
    c.save(); c.beginPath(); c.rect(x0, 0, 800, 900); c.clip();
    const revealed = (s.phase === 'reveal' || s.phase === 'choose') && s.res && !s.res.empty;
    const rk = s.res ? RARITY[s.res.rarity].rank : 0, rc = s.res ? RARITY[s.res.rarity].color : '#ffffff';
    // Hintergrund: weiches Licht, nach dem Öffnen in der Farbe der Seltenheit
    const bgA = revealed ? 0.22 + rk*0.06 : 0.12;
    const g = c.createRadialGradient(cx, cy, 20, cx, cy, 520);
    g.addColorStop(0, hexA(revealed ? rc : '#c6ff3d', bgA)); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(x0, 0, 800, 900);
    if (s.quake > 0.5) c.translate((Math.random() - 0.5)*s.quake, (Math.random() - 0.5)*s.quake);
    // drehende Strahlen ab „Selten“ (Prestige: Regenbogen)
    if (revealed && rk >= 3) {
      const k = clamp01((t - s.tb)/400), n = 10 + rk*2;
      c.save(); c.translate(cx, cy); c.rotate(t*0.0004*(rk >= 5 ? 1.6 : 1)); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < n; i++) {
        const a = i/n*Math.PI*2, col = rk === 6 ? `hsla(${(i/n*360 + t*0.05) % 360},90%,65%,${0.22*k})` : hexA(rc, 0.16*k);
        c.fillStyle = col; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 640, a, a + Math.PI/n*0.9); c.closePath(); c.fill();
      }
      c.restore();
    }
    const n = cosmeticsSave.pending[w];
    if (s.phase === 'idle') {
      if (n) {
        // weitere Nüsse klein dahinter (Stapel), vorne die nächste – fällt kurz herein
        for (let i = Math.min(n, 4) - 1; i >= 1; i--) drawGift(c, cx + (i % 2 ? 1 : -1)*(140 + i*18), 534 - 104*0.5, { who: w, sc: 0.5 });
        const k = clamp01((t - s.enter)/420), dropY = (1 - easeOutBack(k))*-160;
        drawGift(c, cx, cy, { who: w, hop: Math.max(0, (1 + Math.sin(t*0.003))*4 - dropY), rot: Math.sin(t*0.002)*0.03 });
      } else {
        c.strokeStyle = 'rgba(234,247,238,.25)'; c.setLineDash([10, 10]); c.lineWidth = 4;
        c.strokeRect(cx - 96, cy - 66, 172, 172); c.setLineDash([]);
      }
    } else if (s.phase === 'shake') {
      const k = clamp01((t - s.t0)/s.dur), amp = 2 + k*k*16, freq = 0.05 + k*0.05;
      const leak = clamp01((k - 0.5)/0.5), late = clamp01((k - 0.78)/0.22);
      const leakCol = s.res.empty ? mixHex('#fff2c0', '#9aa3ab', late) : mixHex('#fff2c0', rc, late);
      // leichtes Leuchten hinter dem Paket
      if (leak > 0) { const gg = c.createRadialGradient(cx, cy, 10, cx, cy, 260); gg.addColorStop(0, hexA(leakCol, 0.45*leak)); gg.addColorStop(1, hexA(leakCol, 0)); c.fillStyle = gg; c.fillRect(x0, 0, 800, 900); }
      drawGift(c, cx + Math.sin(t*freq*3.1)*amp, cy, { who: w, hop: Math.max(0, Math.cos(t*freq*2.3))*amp*0.6, rot: Math.sin(t*freq*2)*0.06*(0.3 + k), sc: 1 + k*0.1 + Math.sin(t*0.03)*0.01*k, crack: clamp01((k - 0.25)/0.55), leak, leakCol });
    } else if (s.res && s.res.empty) {
      const k = clamp01((t - s.tb)/600);
      drawGift(c, cx, cy, { who: w, open: easeOutBack(k)*0.8, lazy: true, fade: 1 });
      // Fliege summt heraus und kreist
      const ft = (t - s.tb)/1000, fx = cx + Math.sin(ft*3.1)*90*Math.min(1, ft), fy = cy - 40 - Math.min(ft, 1.2)*90 + Math.sin(ft*5.3)*24;
      c.fillStyle = '#1b1b1f'; c.strokeStyle = 'rgba(234,247,238,.8)'; c.lineWidth = 2; c.beginPath(); c.ellipse(fx, fy, 7, 5, 0, 0, Math.PI*2); c.fill(); c.stroke();
      c.fillStyle = 'rgba(220,235,255,.7)'; const fl = Math.sin(t*0.09)*4;
      c.beginPath(); c.ellipse(fx - 3, fy - 6 - fl*0.5, 5, 3 + fl*0.3, -0.5, 0, Math.PI*2); c.ellipse(fx + 3, fy - 6 - fl*0.5, 5, 3 + fl*0.3, 0.5, 0, Math.PI*2); c.fill();
      c.strokeStyle = 'rgba(234,247,238,.35)'; c.lineWidth = 2; c.setLineDash([3, 6]);
      c.beginPath(); for (let i = 1; i < 14; i++) { const tt = ft - i*0.05; if (tt < 0) break; const xx = cx + Math.sin(tt*3.1)*90*Math.min(1, tt), yy = cy - 40 - Math.min(tt, 1.2)*90 + Math.sin(tt*5.3)*24; if (i === 1) c.moveTo(xx, yy); else c.lineTo(xx, yy); } c.stroke(); c.setLineDash([]);
    } else if (revealed) {
      const k = clamp01((t - s.tb)/520);
      if (k < 1) drawGift(c, cx, cy, { who: w, open: k, fade: 1 - k });
      // Glanz hinter dem Item
      const gg = c.createRadialGradient(cx, cy, 10, cx, cy, 200); gg.addColorStop(0, hexA(rc, 0.55)); gg.addColorStop(1, hexA(rc, 0));
      c.fillStyle = gg; c.beginPath(); c.arc(cx, cy, 200, 0, Math.PI*2); c.fill();
      const pk = clamp01((t - s.tb - 100)/(420 + rk*60)), sc = Math.max(0.01, easeOutBack(pk)*3.3);
      drawPreview(c, cx, 540, sc, w, itemsWith(w, s.res.item), s.pv);
    }
    // Partikel
    for (const p of s.parts) {
      const a = clamp01(p.life/p.max*1.6);
      if (p.k === 'smoke') { c.fillStyle = `rgba(190,196,200,${0.35*a})`; c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI*2); c.fill(); }
      else if (p.k === 'spark') { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = hexA(p.col, a); c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI*2); c.fill(); c.restore(); }
      else if (p.k === 'star') { c.fillStyle = hexA(p.col, a); cosStar(c, p.x, p.y, p.r*1.8, p.rot + t*0.004, 4); c.fill(); }
      else if (p.k === 'chip') { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = hexA(p.col, a); c.fillRect(-p.r, -p.r*0.6, p.r*2, p.r*1.2); c.restore(); }
      else if (p.k === 'conf') { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col; c.fillRect(-p.r, -p.r*0.4, p.r*2, p.r*0.8); c.restore(); }
    }
    if (s.flash > 0.02) { c.fillStyle = `rgba(255,255,255,${s.flash*0.6})`; c.fillRect(x0, 0, 800, 900); }
    c.restore();
  }
};
function mixHex(a, b, k) {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), m = (s) => Math.round(((A >> s) & 255)*(1 - k) + ((B >> s) & 255)*k);
  return '#' + ((1 << 24) + (m(16) << 16) + (m(8) << 8) + m(0)).toString(16).slice(1);
}
const EMPTY_JOKES = ['Nur heiße Luft …', 'Hier wohnt nur eine Fliege.', 'Pfff … das Paket war leer.', 'Nichts drin. Nicht mal Staub.', 'Die Fliege sagt danke.'];
const origBurst = PK.burst;
PK.burst = function (s) { if (s.res && s.res.empty) s.joke = EMPTY_JOKES[Math.floor(Math.random()*EMPTY_JOKES.length)]; origBurst.call(this, s); };
S.packs = PK;
for (const w of ['m', 'f']) {
  const box = $('.pk-' + w, PK.el);
  $$('.pk-btns .btn', box).forEach(b => b.addEventListener('click', e => {
    e.stopPropagation(); const s = PK.sides[w];
    if (s.phase === 'choose') PK.decide(s, Number(b.dataset.a)); else if (s.phase === 'emptyChoose') PK.decide(s, 1);
  }));
}
$('.pk-cv', PK.el).addEventListener('click', e => {   // Klick auf eine Hälfte = dieses Paket öffnen
  const r = e.currentTarget.getBoundingClientRect(), w = (e.clientX - r.left) < r.width/2 ? 'm' : 'f';
  PK.sideAct(w, 'confirm');
});
$('.pk-back', PK.el).addEventListener('click', () => { if (!PK.busy()) PK.exit(); });

/* =====================================================================
   BILDSCHIRM: SAMMLUNG (besessen / angelegt / fehlt, Seltenheit, Vorschau, Ausrüsten)
   ===================================================================== */
host.insertBefore(mk(`<section class="screen" id="sm-s-collection" aria-label="Umkleide">
    <div class="l-title display">Umkleide</div>
    <div class="co-left glass">
      <div class="co-chars"><button class="btn" data-w="m" type="button" tabindex="-1"><span class="mini">${charSVG('monkey')}</span>Affe</button><button class="btn" data-w="f" type="button" tabindex="-1"><span class="mini">${charSVG('pig')}</span>Schweinchen</button></div>
      <canvas class="co-cv" width="560" height="420"></canvas>
      <div class="co-count"></div>
      <div class="co-bars"></div>
    </div>
    <div class="co-slots"></div>
    <div class="co-grid"></div>
    <div class="co-info glass"></div>
    <div class="hint co-hint"></div>
    <button class="btn back co-back" type="button" tabindex="-1">← Zurück</button>
  </section>`), $('#sm-modal'));

const ITEMS_BY_SLOT = Object.fromEntries(SLOTS.map(sl => [sl.id, COSMETICS.filter(c => c.slot === sl.id)
  .sort((a, b) => RARITY[a.rarity].rank - RARITY[b.rarity].rank)]));
const CO_COLS = 6;
// kleines Schloss (gesperrtes Item) als Linienzeichnung
function drawLock(c, x, y) {
  c.save(); c.translate(x, y); c.strokeStyle = 'rgba(234,247,238,.85)'; c.fillStyle = 'rgba(4,20,15,.75)'; c.lineWidth = 2.2; c.lineCap = 'round';
  c.beginPath(); c.arc(0, -3, 5.5, Math.PI, 0); c.lineTo(5.5, 2); c.moveTo(-5.5, 2); c.lineTo(-5.5, -3); c.stroke();
  c.beginPath(); c.rect(-8.5, 1, 17, 12); c.fill(); c.stroke();
  c.fillStyle = 'rgba(234,247,238,.85)'; c.beginPath(); c.arc(0, 6.5, 1.8, 0, Math.PI*2); c.fill(); c.restore();
}
// kleines Bild eines Items (einmal gezeichnet, keine Animation)
function drawItemIcon(cv, item, who, owned) {
  const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
  const pv = newPreview(), items = { trail: null, aura: null, pet: null, orbit: null, skin: null };
  items[item.slot] = item;
  for (let i = 0; i < 40; i++) { pv.t = 0; pv.x = -40 + i*1.6; pv.vx = 1.6; pv.y = 0; pv.vy = 0; pv.grounded = true; pv.roll += 0.08; cosStep(previewRig(pv), pv.st, who, items); }
  if (!owned) c.filter = 'grayscale(1) brightness(.55)';   // gesperrt: grau und dunkel, aber erkennbar
  drawPreview(c, cv.width/2 - 6, cv.height - 18, 1.35, who, items, pv);
  c.filter = 'none';
  if (!owned) drawLock(c, cv.width - 20, 20);
}
const CO = {
  el: $('#sm-s-collection'), who: 'm', slot: 0, area: 2, idx: 0, ci: 0, raf: 0, last: 0, acc: 0, pv: newPreview(), ret: null,
  enter(arg) {
    this.ret = (arg && arg.ret) || ['levels', 'keep'];
    if (arg && arg.who) this.who = arg.who;
    this.area = 2; this.idx = 0; this.pv = newPreview();
    this.build();
    this.last = performance.now(); this.acc = 0;
    cancelAnimationFrame(this.raf); this.raf = requestAnimationFrame(t => this.frame(t));
  },
  leave() { cancelAnimationFrame(this.raf); this.raf = 0; },
  list() { return ITEMS_BY_SLOT[SLOTS[this.slot].id]; },
  build() {
    const sl = $('.co-slots', this.el); sl.innerHTML = '';
    SLOTS.forEach((s, i) => {
      const own = ITEMS_BY_SLOT[s.id].filter(it => ownedCount(this.who, it.id)).length;
      const b = mk(`<button class="btn" type="button" tabindex="-1">${s.name}<small>${own}/${ITEMS_BY_SLOT[s.id].length}</small></button>`);
      b.addEventListener('click', () => { this.slot = i; this.idx = 0; this.area = 1; this.build(); Snd.play('move'); });
      sl.appendChild(b);
    });
    const grid = $('.co-grid', this.el); grid.innerHTML = '';
    this.list().forEach((it, i) => {
      const own = ownedCount(this.who, it.id), eq = isEquipped(this.who, it.id);
      const t = mk(`<button class="co-tile${own ? '' : ' miss'}${eq ? ' eq' : ''}" type="button" tabindex="-1" style="--rc:${RARITY[it.rarity].color}">
        <canvas width="150" height="100"></canvas><span class="nm">${it.name}</span>
        ${eq ? '<span class="eqb">Angelegt</span>' : ''}${own > 1 ? `<span class="dup">×${own}</span>` : ''}</button>`);
      t.addEventListener('click', () => { if (this.area === 2 && this.idx === i) this.act('confirm'); else { this.area = 2; this.idx = i; this.paint(); Snd.play('move'); } });
      grid.appendChild(t);
      drawItemIcon($('canvas', t), it, this.who, own);   // erst im Dokument zeichnen (sonst wirkt der Grau-Filter nicht)
    });
    const have = collectionCount(this.who);
    $('.co-count', this.el).innerHTML = `<b>${have}</b> / ${COSMETICS.length} gesammelt`;
    $('.co-bars', this.el).innerHTML = RARITIES.slice(1).map(r => {
      const all = COSMETICS.filter(c => c.rarity === r.id), own = all.filter(c => ownedCount(this.who, c.id)).length;
      return `<span style="--rc:${r.color}" title="${r.name}"><i style="width:${own/all.length*100}%"></i><em>${r.name} ${own}/${all.length}</em></span>`;
    }).join('');
    this.paint();
  },
  paint() {
    $$('.co-chars .btn', this.el).forEach(b => { b.classList.toggle('on', b.dataset.w === this.who); b.classList.toggle('sel', this.area === 0 && ['m', 'f'].indexOf(b.dataset.w) === this.ci); });
    $$('.co-slots .btn', this.el).forEach((b, i) => { b.classList.toggle('on', i === this.slot); b.classList.toggle('sel', this.area === 1 && i === this.slot); });
    $$('.co-tile', this.el).forEach((b, i) => b.classList.toggle('sel', this.area === 2 && i === this.idx));
    const it = this.list()[this.idx], info = $('.co-info', this.el);
    if (it) {
      const own = ownedCount(this.who, it.id), eq = isEquipped(this.who, it.id), r = RARITY[it.rarity];
      info.style.setProperty('--rc', r.color);
      info.innerHTML = `<span class="rar">${r.name}</span><b>${it.name}</b>
        <span class="st">${eq ? 'Angelegt – Springen zum Ablegen' : own ? `Im Besitz${own > 1 ? ' (×' + own + ')' : ''} – Springen zum Anlegen` : 'Gesperrt – vielleicht im nächsten Package'}</span>`;
    }
    $('.co-hint', this.el).textContent = 'Pfeile wählen · Springen an-/ablegen · E / Num 1 / □ Figur wechseln · Esc zurück';
  },
  setWho(w) { if (this.who === w) return; this.who = w; this.pv = newPreview(); this.build(); Snd.play('swap'); },
  act(type) {
    const list = this.list();
    if (type === 'back') { Snd.play('back'); go(this.ret[0], this.ret[1]); return; }
    if (type === 'swap') { this.setWho(this.who === 'm' ? 'f' : 'm'); return; }
    if (this.area === 2) {
      const r = Math.floor(this.idx/CO_COLS), rows = Math.ceil(list.length/CO_COLS);
      if (type === 'left') this.idx = Math.max(0, this.idx - 1);
      else if (type === 'right') this.idx = Math.min(list.length - 1, this.idx + 1);
      else if (type === 'up') { if (r === 0) this.area = 1; else this.idx -= CO_COLS; }
      else if (type === 'down') { if (r < rows - 1) this.idx = Math.min(list.length - 1, this.idx + CO_COLS); }
      else if (type === 'confirm') {
        const it = list[this.idx];
        if (!ownedCount(this.who, it.id)) { Snd.play('locked'); const t = $$('.co-tile', this.el)[this.idx]; t.classList.remove('shake'); void t.offsetWidth; t.classList.add('shake'); return; }
        equipItem(this.who, it.id); isEquipped(this.who, it.id) ? PSFX.equip() : PSFX.keep();
        const keep = this.idx; this.build(); this.idx = keep; this.paint(); return;
      }
      if (type !== 'confirm') Snd.play('move');
    } else if (this.area === 1) {
      if (type === 'left' || type === 'right') { this.slot = (this.slot + (type === 'left' ? SLOTS.length - 1 : 1)) % SLOTS.length; this.idx = 0; this.build(); Snd.play('move'); return; }
      if (type === 'down' || type === 'confirm') this.area = 2;
      else if (type === 'up') { this.area = 0; this.ci = this.who === 'm' ? 0 : 1; }
      Snd.play('move');
    } else {
      if (type === 'left') this.ci = Math.max(0, this.ci - 1);
      else if (type === 'right') this.ci = Math.min(1, this.ci + 1);
      else if (type === 'down') this.area = 1;
      else if (type === 'confirm') {
        this.setWho(this.ci ? 'f' : 'm');
        return;
      }
      Snd.play('move');
    }
    this.paint();
  },
  frame(t) {
    if (!this.el.classList.contains('active')) { this.raf = 0; return; }
    const dt = Math.min(50, t - this.last); this.last = t; this.acc += dt;
    const it = this.list()[this.idx], show = it && ownedCount(this.who, it.id) ? itemsWith(this.who, it) : cosItemsOf(this.who);
    let n = 0;
    while (this.acc >= 1000/60 && n < 4) { this.acc -= 1000/60; n++; previewStep(this.pv, this.who, show); }
    if (n >= 4) this.acc = 0;
    const cv = $('.co-cv', this.el), c = cv.getContext('2d');
    c.clearRect(0, 0, cv.width, cv.height);
    const g = c.createRadialGradient(280, 230, 10, 280, 230, 260); g.addColorStop(0, 'rgba(198,255,61,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(40, 330, 480, 4);
    drawPreview(c, 280, 330, 2.6, this.who, show, this.pv);
    this.raf = requestAnimationFrame(tt => this.frame(tt));
  }
};
S.collection = CO;
$$('.co-chars .btn', CO.el).forEach(b => b.addEventListener('click', () => CO.setWho(b.dataset.w)));
$('.co-back', CO.el).addEventListener('click', () => CO.act('back'));

window.PackagesUI = { PK, CO, PSFX, drawItemIcon };   // für Tests
})();
