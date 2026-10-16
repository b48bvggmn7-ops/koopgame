// 06-zeichnen.js – Spielwiese: Kamera und Zeichnen (schlicht, klare Farben). Zeichnen ändert keinen Spielzustand.

// ---------- Kamera: waagerecht, glatt folgend, mit Blick nach vorn ----------
const kam = { x: 0, px: 0, voraus: 0, y: KARTE_H * K - SICHT_H };
function kameraZiel(){
  const ziel = fig.x + FIG_B / 2 - SICHT_B * V.kameraPos + kam.voraus;
  return klemmen(ziel, 0, KARTE_B * K - SICHT_B);
}
function kameraSchritt(){
  kam.px = kam.x;
  const vorausZiel = fig.blick * V.kameraVoraus * Math.min(1, Math.abs(fig.vx) / Math.max(1, V.laufTempo));
  kam.voraus += (vorausZiel - kam.voraus) * 0.04;
  kam.x += (kameraZiel() - kam.x) * V.kameraWeich;
}
function kameraSpringen(){ kam.voraus = 0; kam.x = kam.px = kameraZiel(); }

// ---------- kurze Hinweise oben in der Mitte (Variante, Station …) ----------
let hinweisText = '', hinweisBis = 0;
function hinweis(t){ hinweisText = t; hinweisBis = performance.now() + 1600; }

// ---------- Zeichnen ----------
const FARBE = { himmelO: '#8fd0f2', himmelU: '#dff3fb', erde: '#7b5638', erdeDunkel: '#5d3f28', gras: '#62b04f',
  stachel: '#c9d2dc', stachelDunkel: '#6d7886', schild: '#d9a35e', schildRand: '#7a4f24', text: '#2b1d10' };

function zeichnen(alpha){
  const s = leinwand.width / BILD_B;
  ctx.setTransform(s, 0, 0, s, 0, 0);
  const verlauf = ctx.createLinearGradient(0, 0, 0, BILD_H);
  verlauf.addColorStop(0, FARBE.himmelO); verlauf.addColorStop(1, FARBE.himmelU);
  ctx.fillStyle = verlauf; ctx.fillRect(0, 0, BILD_B, BILD_H);

  const kx = mischen(kam.px, kam.x, alpha);
  hintergrundHuegel(kx);
  let ox = 0, oy = 0;
  if(fx.trauma > 0){ const st = fx.trauma * fx.trauma * 16; ox = (Math.random() * 2 - 1) * st; oy = (Math.random() * 2 - 1) * st; }

  ctx.save();
  ctx.scale(ZOOM, ZOOM);
  ctx.translate(Math.round(-kx + ox), Math.round(-kam.y + oy));
  kaestchenZeichnen(kx);
  bauZeichnenWelt(kx);
  for(const sch of SCHILDER) schildZeichnen(sch);
  for(const z of ZWISCHENPUNKTE){   // Fähnchen (gelb = aktiv)
    const x = z.c * K + K / 2, y = z.r * K;
    ctx.fillStyle = '#5a4026'; ctx.fillRect(x - 2, y - 36, 4, 36);
    ctx.fillStyle = fig.rueck === z ? '#ffd24a' : '#e9eef5';
    ctx.beginPath(); ctx.moveTo(x + 2, y - 36); ctx.lineTo(x + 22, y - 29); ctx.lineTo(x + 2, y - 22); ctx.fill();
  }
  hakenZeichnen(alpha);
  for(const n of fx.nachbilder) figurBild(n.x, n.y, n.sx, n.sy, n.blick, 0.35 * n.leben / n.max, true);
  if(!fig.tot){
    const fx_ = mischen(fig.px, fig.x, alpha), fy_ = mischen(fig.py, fig.y, alpha);
    figurBild(fx_, fy_, fig.sx, fig.sy, fig.blick, 1, false, fig.ball ? fig.rollWinkel : (fig.haengt ? Math.PI : 0));
    if(fig.blitz > 0){   // Dash wieder voll: kurzer heller Ring
      ctx.strokeStyle = 'rgba(255,255,255,' + (fig.blitz / 10) + ')'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(fx_ + FIG_B / 2, fy_ + FIG_H / 2, 26 + (10 - fig.blitz) * 2.5, 0, Math.PI * 2); ctx.stroke();
    }
    if(V.dashPunkte) dashPunkteZeichnen(fx_, fy_);
  }
  for(const t of fx.teilchen){
    ctx.globalAlpha = Math.max(0, t.leben / t.max) * 0.85; ctx.fillStyle = t.farbe;
    ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for(const b of fx.brocken){
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.w); ctx.globalAlpha = Math.min(1, b.leben / 20);
    ctx.fillStyle = '#a08a74'; ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s);
    ctx.strokeStyle = '#4b3a2b'; ctx.lineWidth = 1.5; ctx.strokeRect(-b.s / 2, -b.s / 2, b.s, b.s); ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  anzeigeZeichnen();
}

function hintergrundHuegel(kx){
  ctx.fillStyle = '#b8e0c8';
  ctx.beginPath(); ctx.moveTo(0, BILD_H);
  for(let x = 0; x <= BILD_B; x += 20){
    const w = (x + kx * 0.25) / 180;
    ctx.lineTo(x, 470 + Math.sin(w) * 38 + Math.sin(w * 0.37) * 50);
  }
  ctx.lineTo(BILD_B, BILD_H); ctx.fill();
}

function kaestchenZeichnen(kx){
  const c0 = Math.max(0, Math.floor(kx / K) - 1), c1 = Math.min(KARTE_B - 1, Math.ceil((kx + SICHT_B) / K) + 1);
  for(let r = 0; r < KARTE_H; r++) for(let c = c0; c <= c1; c++){
    const z = karte[r][c], x = c * K, y = r * K;
    if(istRampe(z)){ rampeZeichnen(c, r, z); continue; }
    if(z === 'x'){ risseZeichnen(c, r); continue; }
    if(z === '#' || z === '='){
      ctx.fillStyle = FARBE.erde; ctx.fillRect(x, y, K + 0.6, K + 0.6);   // etwas größer: keine hellen Fugen beim Zoom
      ctx.fillStyle = FARBE.erdeDunkel;
      if(!fest(c, r + 1)) ctx.fillRect(x, y + K - 4, K, 4);
      if(!fest(c - 1, r)) ctx.fillRect(x, y, 3, K);
      if(!fest(c + 1, r)) ctx.fillRect(x + K - 3, y, 3, K);
      if(!fest(c, r - 1) && z === '#'){ ctx.fillStyle = FARBE.gras; ctx.fillRect(x, y, K, 8); }
      if(z === '=') haftflaecheZeichnen(c, r);
    } else if(z === '^'){
      ctx.fillStyle = FARBE.stachel; ctx.strokeStyle = FARBE.stachelDunkel; ctx.lineWidth = 2;
      for(let i = 0; i < 2; i++){
        ctx.beginPath(); ctx.moveTo(x + i * 20 + 2, y + K); ctx.lineTo(x + i * 20 + 10, y + 16); ctx.lineTo(x + i * 20 + 18, y + K);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    }
  }
}

function schildZeichnen(sch){
  ctx.font = 'bold 15px system-ui, sans-serif';
  const breite = Math.max(...sch.zeilen.map(z => ctx.measureText(z).width)) + 20, hoehe = sch.zeilen.length * 19 + 12;
  const x = sch.c * K + K / 2, fuss = sch.r * K;
  ctx.fillStyle = FARBE.schildRand; ctx.fillRect(x - 3, fuss - 46, 6, 46);
  const bx = x - breite / 2, by = fuss - 46 - hoehe;
  ctx.fillStyle = FARBE.schild; ctx.strokeStyle = FARBE.schildRand; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, breite, hoehe, 6) : ctx.rect(bx, by, breite, hoehe); ctx.fill(); ctx.stroke();
  ctx.fillStyle = FARBE.text; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  sch.zeilen.forEach((z, i) => { if(i) ctx.font = '14px system-ui, sans-serif'; ctx.fillText(z, x, by + 8 + i * 19); });
  ctx.textAlign = 'left';
}

// Figur: Bild des Spiels (Affe/Schweinchen) in derselben Größe wie im Spiel, gestaucht/gedehnt um die Füße
function figurBild(x, y, sx, sy, blick, deckkraft, schatten, winkel){
  const img = BILDER[figurAussehen], [kx, ky] = KOPF_MITTE[figurAussehen];
  const groesse = Math.max(FIG_B, FIG_H) * 1.55;
  const hoehe = img.naturalWidth ? groesse * img.naturalHeight / img.naturalWidth : groesse * 0.83;
  ctx.save();
  ctx.globalAlpha = deckkraft;
  if(winkel){   // gedreht um die Mitte (Rollen: Kugel; Hängen: kopfüber)
    ctx.translate(x + FIG_B / 2, y + FIG_H / 2); ctx.rotate(winkel); ctx.translate(0, FIG_H / 2);
  } else ctx.translate(x + FIG_B / 2, y + FIG_H);
  ctx.scale(sx * blick, sy);
  const mitteY = -FIG_H / 2;
  if(schatten) ctx.filter = 'brightness(1.6) saturate(0.4)';
  if(img.complete && img.naturalWidth) ctx.drawImage(img, -kx * groesse, mitteY - ky * hoehe, groesse, hoehe);
  else { ctx.fillStyle = figurAussehen === 'affe' ? '#8a5a35' : '#ff8fc0'; ctx.beginPath(); ctx.arc(0, mitteY, 17, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

function dashPunkteZeichnen(x, y){
  const max = luftDashMax();
  const n = max === Infinity ? 1 : max, voll = max === Infinity ? 1 : fig.luftDashes;
  for(let i = 0; i < n; i++){
    const px = x + FIG_B / 2 + (i - (n - 1) / 2) * 11, py = fig.haengt ? y + FIG_H + 14 : y - 20;
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = i < voll ? (max === Infinity ? '#b48cff' : '#4fd2ff') : 'rgba(40,50,70,0.35)'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(15,20,30,0.6)'; ctx.stroke();
  }
}

// ---------- Anzeige (Station, Variante, Legende, Messwerte) ----------
function textMitRand(t, x, y, groesse, farbe, ausr){
  ctx.font = 'bold ' + groesse + 'px system-ui, sans-serif'; ctx.textAlign = ausr || 'left'; ctx.textBaseline = 'top';
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(15,20,30,0.75)'; ctx.strokeText(t, x, y);
  ctx.fillStyle = farbe; ctx.fillText(t, x, y); ctx.textAlign = 'left';
}
function anzeigeZeichnen(){
  textMitRand('Station ' + fig.station.nr + ': ' + fig.station.name, 16, 12, 18, '#fff');
  const m = MECHANIKEN[aktiveMechanik];
  if(m) textMitRand(m.name + ': ' + m.varianten[m.aktiv].name + '   (1–' + m.varianten.length + ')', BILD_B / 2, 12, 18, '#ffe27a', 'center');
  textMitRand('Tab = Einstellungen', BILD_B - 16, 12, 15, '#dfe8f5', 'right');
  if(performance.now() < hinweisBis){
    const a = Math.min(1, (hinweisBis - performance.now()) / 400);
    ctx.globalAlpha = a; textMitRand(hinweisText, BILD_B / 2, 44, 26, '#fff', 'center'); ctx.globalAlpha = 1;
  }
  if(V.legende && !bau.an) legendeZeichnen();
  bauZeichnenAnzeige();
  if(V.zahlen){
    const z = ['Tempo x ' + fig.vx.toFixed(1) + '  y ' + fig.vy.toFixed(1), 'Boden ' + (fig.amBoden ? 'ja' : 'nein') + '  Wand ' + fig.wand,
      'Coyote ' + Math.max(0, fig.coyote) + '  Puffer ' + Math.max(0, fig.puffer) + '  Sprint ' + Math.round(fig.sprint * 100) + ' %',
      'Seil ' + (fig.seil ? (fig.seil.zustand === 'fest' ? Math.round(fig.seil.len) + ' px' : 'fliegt') : '–') + '  Ziel ' + (fig.hakenZiel ? (fig.hakenZiel.anker ? 'Anker' : 'Fläche') : '–'),
      'Dash ' + (fig.dash ? 'läuft (' + fig.dash.zeit + ')' : 'bereit') + '  Luft-Dashes ' + (fig.luftDashes === Infinity ? '∞' : fig.luftDashes)];
    z.forEach((t, i) => textMitRand(t, BILD_B - 16, 40 + i * 20, 14, '#bfe3ff', 'right'));
  }
}
const LEGENDE = [
  ['A / D', 'laufen'], ['Leertaste', 'springen (an der Wand: Wandsprung)'], ['J', 'Dash (mit Richtung: 8 Richtungen)'], ['K / Maus', 'Haken (halten = festhalten)'],
  ['L', 'Greifen: Decke halten / rollen'], ['W / S', 'Seil ran / geben (S halten = rutschen)'], ['1–4', 'Variante wechseln'], ['R', 'zurück zum Rücksetzpunkt'], ['B', 'selbst bauen (Mini-Editor)'],
  ['Tab', 'Einstellungen, Teleport'],
];
const LEGENDE_PAD = 'Controller: Stick laufen · ✕ springen · □ Dash · R1 Haken · L1 Greifen · R2 Variante · Share zurück · Options Einstellungen';
function legendeZeichnen(){
  const x = 16, zeile = 17, h = LEGENDE.length * zeile + 30, y = 44;   // oben links im Himmel (unten steht die Welt)
  ctx.fillStyle = 'rgba(15,20,30,0.55)'; ctx.fillRect(x - 6, y - 6, 356, h);
  ctx.textBaseline = 'top';
  LEGENDE.forEach(([t, w], i) => {
    ctx.font = 'bold 13px system-ui, sans-serif'; ctx.fillStyle = '#ffe27a'; ctx.fillText(t, x, y + i * zeile);
    ctx.font = '13px system-ui, sans-serif'; ctx.fillStyle = '#eef2f7'; ctx.fillText(w, x + 78, y + i * zeile);
  });
  ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = '#b9c4d6';
  const t = LEGENDE_PAD, mitte = t.indexOf('·', 50);
  ctx.fillText(t.slice(0, mitte), x, y + LEGENDE.length * zeile + 2);
  ctx.fillText(t.slice(mitte + 2), x, y + LEGENDE.length * zeile + 14);
}
