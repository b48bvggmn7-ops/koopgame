// 12f-foto-elemente2.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Weitere Elemente im Foto-Look: Windrad, bewegter Boden/bewegte Wand (+ Wechselboden), Bröckelboden ----------
// Gilt nur im Foto-Look (fotoLookAktiv, Taste B) – der Comic-Look bleibt genau wie bisher. Stil wie 12e: nebliger
// Herbstwald, gedämpftes Grau-Braun-Oliv, verwittertes Holz (fotoHolzMuster), rostiges Eisen (fotoEisenBand), Erde/Mauer/
// Moos-Kante aus dem Foto-Material (12c). Keine Konturen, keine schwebenden Schatten.
// Eingebunden über kleine Abfragen am Anfang der Zeichen-Funktionen: windradBild/windradArm/Liane (elemente/windrad.js),
// pieceDraw + matBeweglichZeichnen + drawLinkBadge + Bröckelboden (12-welt-zeichnen.js), wechselEdelstein/wechselZeichnen
// (elemente/wechselboden.js). Ganz entfernen: diese Datei + Eintrag in index.html (die Abfragen prüfen mit typeof).
function fotoEl2An(){ return typeof fotoLookAktiv === 'function' && fotoLookAktiv(); }
function fotoEl2Zufall(a, b){ const v = Math.sin(a*12.9898 + b*78.233)*43758.5453; return v - Math.floor(v); }

// ---------- Windrad: altes Holz-Windrad (Klapper) auf einem Pfahl ----------
// Vier verwitterte Holzflügel (Brett an einer Latte, wie bei einer alten Windmühle) um eine rostige Eisennabe; der
// Edelstein in der Nummernfarbe sitzt mitten in der Nabe und bleibt aufrecht. Dreht es schnell, verwischen die Flügel
// (Nachbilder + leichter Schleier). Maße wie im Comic-Look (Rotor-Radius 22 = Trefferfläche des Windes).
const FOTO_WINDRAD = {radius: 22, nabe: 6.5, pfahl: 7, groesse: 0.95};   // groesse: Rotor-Maßstab (Nutzerwunsch 5 % kleiner)
function fotoWindradBild(g, x, y, winkel, farbe, dreh, s, ohnePfahl){
  s = s || 1;
  const H = WINDRAD_HOEHE, R = FOTO_WINDRAD.radius, holzL = fotoHolzMuster(g, false, x*0.37, 0);
  g.save(); g.translate(x, y); g.scale(s, s);
  if(!ohnePfahl){   // Pfahl: Rundholz, unten im Moos, oben ein Lagerklotz, zwei rostige Bänder
    const P = FOTO_WINDRAD.pfahl;
    g.fillStyle = holzL; g.fillRect(-P/2, -H + 2, P, H + 1);
    const gs = g.createLinearGradient(-P/2, 0, P/2, 0);
    gs.addColorStop(0, 'rgba(255,240,210,.16)'); gs.addColorStop(0.45, 'rgba(0,0,0,0)'); gs.addColorStop(1, 'rgba(0,0,0,.5)');
    g.fillStyle = gs; g.fillRect(-P/2, -H + 2, P, H + 1);
    const gu = g.createLinearGradient(0, -10, 0, 1); gu.addColorStop(0, 'rgba(40,46,20,0)'); gu.addColorStop(1, 'rgba(40,46,20,.55)');
    g.fillStyle = gu; g.fillRect(-P/2, -10, P, 11);
    fotoEisenBand(g, -P/2 - 0.5, -H + 9, P + 1, 3, 0);
    fotoEisenBand(g, -P/2 - 0.5, -16, P + 1, 2.6, 0);
    g.fillStyle = 'rgba(64,78,36,.9)';   // Moos am Fuß
    for(const [mx, mr] of [[-4.5, 3.4], [-1, 2.6], [3.5, 3.2], [5.5, 2]]){ g.beginPath(); g.ellipse(mx, 0, mr, 2, 0, 0, 7); g.fill(); }
  }
  g.translate(0, -H); g.scale(FOTO_WINDRAD.groesse, FOTO_WINDRAD.groesse);   // Rotor kleiner (Nutzer: „5 % kleiner“), Nabe bleibt an ihrer Stelle
  // Lagerklotz hinter dem Rotor (dunkles Holz)
  g.fillStyle = holzL; g.fillRect(-5, -4, 10, 9); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-5, -4, 10, 9);
  const fluegel = (w0, alpha) => {
    g.save(); g.rotate(w0); g.globalAlpha = alpha;
    const holzQ = fotoHolzMuster(g, true, 0, 0);
    for(let i = 0; i < 4; i++){
      g.save(); g.rotate(i*Math.PI/2);
      // Latte (Speiche) von der Nabe bis zur Spitze
      g.fillStyle = holzQ; g.fillRect(0, -1.3, R, 2.6);
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0.4, R, 0.9);
      // Flügelbrett an einer Seite der Latte: innen schmal, außen breit, Spitze schräg abgeschnitten
      g.beginPath(); g.moveTo(6.5, -1); g.lineTo(R - 0.5, -1); g.lineTo(R - 2.5, -11); g.lineTo(8, -4.8); g.closePath();
      g.fillStyle = holzQ; g.fill();
      const gb = g.createLinearGradient(0, -11, 0, -1);
      gb.addColorStop(0, 'rgba(255,238,205,.2)'); gb.addColorStop(0.55, 'rgba(0,0,0,0)'); gb.addColorStop(1, 'rgba(0,0,0,.38)');
      g.fillStyle = gb; g.fill();
      if(i % 2){ g.fillStyle = 'rgba(70,88,40,.28)'; g.fill(); }   // zwei Flügel leicht bemoost
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(8, -5.8, R - 10.5, 0.6);   // Fuge zwischen zwei Brettchen
      g.strokeStyle = 'rgba(225,210,178,.22)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(R - 2.5, -11); g.lineTo(8, -4.8); g.stroke();   // helle, abgegriffene Kante
      g.fillStyle = '#1d1712'; for(const nx of [10, R - 4]){ g.beginPath(); g.arc(nx, -0.1, 0.7, 0, 7); g.fill(); }   // Nägel
      g.restore();
    }
    g.restore();
  };
  // schnelles Drehen: Nachbilder der Flügel + leichter Schleier (nur Aussehen)
  if(dreh > 0.3){
    const k = Math.min(1, (dreh - 0.3)/0.7);
    g.fillStyle = `rgba(150,140,118,${(0.16*k).toFixed(3)})`; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill();
    fluegel(winkel - 0.32, 0.22*k); fluegel(winkel - 0.16, 0.35*k);
  }
  fluegel(winkel, dreh > 0.3 ? 1 - 0.35*Math.min(1, (dreh - 0.3)/0.7) : 1);
  // rostige Eisennabe mit vier Nieten (drehen mit), Edelstein aufrecht in der Mitte
  g.save(); g.rotate(winkel);
  const N = FOTO_WINDRAD.nabe, gn = g.createRadialGradient(-2, -2, 0.5, 0, 0, N + 1);
  gn.addColorStop(0, '#6a5c52'); gn.addColorStop(0.55, '#3d332d'); gn.addColorStop(1, '#1e1814');
  g.fillStyle = gn; g.beginPath(); g.arc(0, 0, N, 0, 7); g.fill();
  g.fillStyle = 'rgba(140,72,32,.45)'; for(let i = 0; i < 6; i++){ const a = i*1.1 + 0.4; g.beginPath(); g.arc(Math.cos(a)*N*0.7, Math.sin(a)*N*0.7, 1.1, 0, 7); g.fill(); }
  for(let i = 0; i < 4; i++){ const a = i*Math.PI/2 + Math.PI/4; g.fillStyle = '#17120f'; g.beginPath(); g.arc(Math.cos(a)*N*0.72, Math.sin(a)*N*0.72, 0.9, 0, 7); g.fill(); }
  g.restore();
  g.fillStyle = 'rgba(12,9,7,.8)'; g.beginPath(); g.arc(0, 0, 4.4, 0, 7); g.fill();   // Fassung des Edelsteins
  if(typeof elementEdelstein === 'function' && g === ctx) elementEdelstein(0, 0, 4.4, farbe);
  else { g.fillStyle = farbe; g.beginPath(); g.arc(0, 0, 3.6, 0, 7); g.fill(); }
  g.restore();
}
// Arm aus der Wand: Holzbalken mit rostigem Eisenwinkel an der Wand und etwas Moos oben
function fotoWindradArm(wx, x, y){
  const d = Math.sign(x - wx) || 1, x0 = Math.min(wx, x), L = Math.abs(x - wx);
  ctx.save();
  ctx.fillStyle = fotoHolzMuster(ctx, true, x0, y); ctx.fillRect(x0, y - 3, L, 6);
  const g = ctx.createLinearGradient(0, y - 3, 0, y + 3); g.addColorStop(0, 'rgba(255,240,210,.15)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)');
  ctx.fillStyle = g; ctx.fillRect(x0, y - 3, L, 6);
  // Eisenwinkel: Platte an der Wand + Band um den Balken
  ctx.save(); ctx.translate(wx + (d > 0 ? 0 : -4), y - 8); ctx.rotate(Math.PI/2); fotoEisenBand(ctx, 0, -4, 16, 4, 11); ctx.restore();
  fotoEisenBand(ctx, d > 0 ? wx + 4 : wx - 9, y - 3.4, 5, 6.8, 0);
  ctx.fillStyle = 'rgba(66,80,38,.8)';
  for(let i = 0; i < 3; i++){ const mx = wx + d*(8 + i*7 + fotoEl2Zufall(wx, i)*4); if((mx - x)*d > -6) break; ctx.beginPath(); ctx.ellipse(mx, y - 3, 3 + fotoEl2Zufall(i, wx)*2, 1.6, 0, 0, 7); ctx.fill(); }
  ctx.restore();
}
// hängt an einer Liane von oben: dieselbe bemooste Holz-Liane wie an den Haken (12e); true = gezeichnet
function fotoWindradLiane(x, y0, nabeY, seed){
  if(!fotoEl2An() || typeof fotoLiane !== 'function') return false;
  fotoLiane(ctx, x + Math.sin(seed*0.013)*3, y0, x, nabeY - FOTO_WINDRAD.nabe, seed, 4.5);
  return true;
}

// ---------- Bewegte Boden-/Wand-Stücke (pieceDraw) und Wechselboden: dasselbe Material wie der feste Boden ----------
// Wand: Bruchsteinmauer (Muster 'wand' aus 12c, am Stück verankert – fährt mit), leicht unebener Rand, Licht oben, unten
// dunkler, an den Ecken rostige Eisenwinkel (zeigt: dieses Stück ist gebaut und bewegt sich). Boden: Erde-Foto (wie
// der Boden, abgedunkelt) mit bröckeligen Seiten/Unterseite, oben die Moos-Kante, unten ein paar Wurzeln.
// Zwischenspeicher: das Bild wird neu gezeichnet, sobald sich Foto-Look oder geladene Texturen ändern (fotoStueckVeraltet).
const FOTO_STUECK = {rand: 2.6, eisen: 11, wurzeln: [1, 3], wurzelLang: [4, 13], moosUeber: 3};
function fotoStueckSchluessel(){
  if(!fotoEl2An() || typeof fotoMatBild !== 'function') return '';
  return 'f' + (fotoMatBild('erde') ? 1 : 0) + (fotoMatBild('wand') ? 1 : 0) + (fotoMatBild('kante') ? 1 : 0);
}
function fotoStueckVeraltet(p){ return !!p && p.fotoKey !== fotoStueckSchluessel(); }
// aus pieceDraw (12): true = im Foto-Look gezeichnet (sonst zeichnet pieceDraw den Comic-Block)
function fotoStueckZeichnen(p){
  const key = fotoStueckSchluessel(); p.fotoKey = key; p.cm = null;
  if(!key) return false;
  const [, , w, h, look] = p.m, wand = look === 'wall', q = p.c.getContext('2d');
  const M = fotoMatMuster(q, wand ? 'wand' : 'erde'); if(!M) return false;
  q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, p.c.width, p.c.height); q.setTransform(2, 0, 0, 2, 48, 48);
  const B = FOTO_STUECK.rand, sd = w*7 + h*3;
  // Umriss: oben gerade (Lauffläche), Seiten und Unterseite leicht ausgebrochen (nach innen), Ecken etwas abgerundet
  const form = new Path2D(), schritt = 2.5, rw = (u, linie) => (0.55*Math.sin(u*0.23 + linie) + 0.45*(fotoEl2Zufall(Math.floor(u/2.5), linie + sd) - 0.5)*2)*0.5 + 0.5;
  form.moveTo(3, 0); form.lineTo(w - 3, 0);
  for(let y = 3; y <= h - 3; y += schritt) form.lineTo(w - rw(y, 1)*B*(wand ? 0.6 : 1)*Math.min(1, y/6), y);
  for(let x = w - 3; x >= 3; x -= schritt) form.lineTo(x, h - rw(x, 2)*B*(wand ? 0.6 : 1));
  for(let y = h - 3; y >= 3; y -= schritt) form.lineTo(rw(y, 3)*B*(wand ? 0.6 : 1)*Math.min(1, y/6), y);
  form.closePath();
  q.save(); q.clip(form);
  q.fillStyle = M; q.fillRect(-4, -4, w + 8, h + 8);
  if(!wand){ q.fillStyle = 'rgba(0,0,0,' + (typeof FOTO_MAT_ERDE_DUNKEL === 'number' ? FOTO_MAT_ERDE_DUNKEL : 0.5) + ')'; q.fillRect(-4, -4, w + 8, h + 8); }
  const gl = q.createLinearGradient(0, 0, 0, h);   // Licht von oben, unten dunkler
  gl.addColorStop(0, 'rgba(255,240,215,' + (wand ? .1 : .05) + ')'); gl.addColorStop(Math.min(0.4, 14/h), 'rgba(0,0,0,0)');
  gl.addColorStop(Math.max(0.6, 1 - 14/h), 'rgba(0,0,0,0)'); gl.addColorStop(1, 'rgba(0,0,0,.38)');
  q.fillStyle = gl; q.fillRect(-4, -4, w + 8, h + 8);
  for(const [x0, x1] of [[0, 6], [w, w - 6]]){ const gs = q.createLinearGradient(x0, 0, x1, 0); gs.addColorStop(0, 'rgba(0,0,0,.28)'); gs.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = gs; q.fillRect(Math.min(x0, x1), 0, 6, h); }
  q.restore();
  if(wand){
    // Moosbüschel oben auf der Mauer
    q.fillStyle = 'rgba(70,88,40,.75)';
    for(let x = 4; x < w - 4; x += 9){ const z = fotoEl2Zufall(x + sd, 3); if(z < 0.45) continue; q.beginPath(); q.ellipse(x + z*4, 0.5, 2.5 + z*3, 1.5 + z, 0, 0, 7); q.fill(); }
    // rostige Eisenwinkel an den vier Ecken (je ein waagerechtes und ein senkrechtes Stück mit Niete)
    const E = Math.min(FOTO_STUECK.eisen, w/3, h/3);
    for(const [ex, ey, sx, sy] of [[0, 0, 1, 1], [w, 0, -1, 1], [0, h, 1, -1], [w, h, -1, -1]]){
      q.save(); q.translate(ex, ey); q.scale(sx, sy);
      fotoEisenBand(q, 0.5, 0.5, E, 3.4, 0); q.save(); q.translate(3.9, 0.5); q.rotate(Math.PI/2); fotoEisenBand(q, 0, 0, E, 3.4, 0); q.restore();
      q.fillStyle = '#16110e'; q.beginPath(); q.arc(2.2, 2.2, 1, 0, 7); q.fill();
      q.restore();
    }
  } else {
    // Wurzeln unter der Unterseite (dunkel, schlängelnd)
    q.save(); q.lineCap = 'round'; q.strokeStyle = typeof FOTO_MAT_WURZEL_FARBE === 'string' ? FOTO_MAT_WURZEL_FARBE : 'rgba(38,27,18,.9)';
    const [nMin, nMax] = FOTO_STUECK.wurzeln, [lMin, lMax] = FOTO_STUECK.wurzelLang;
    for(let x0 = 0; x0 < w; x0 += 40){
      const n = nMin + Math.floor(fotoEl2Zufall(x0 + sd, 5)*(nMax - nMin + 1));
      for(let i = 0; i < n; i++){
        const x = x0 + 4 + fotoEl2Zufall(x0 + i*7, sd)*Math.min(32, w - x0 - 8), lang = lMin + fotoEl2Zufall(i, x0 + sd)*(lMax - lMin);
        q.lineWidth = 0.7 + fotoEl2Zufall(x, 2)*0.7; q.beginPath(); q.moveTo(x, h - 3); let dx = 0;
        for(let s = 2; s <= lang; s += 2){ dx += (fotoEl2Zufall(x + s, i) - 0.5)*1.4; q.lineTo(x + dx, h - 3 + s); }
        q.stroke();
      }
    }
    q.restore();
    // Moos-Kante oben (wie auf dem festen Boden), an den Seiten etwas überhängend – in eine EIGENE Leinwand p.cm
    // (Nutzerwunsch „beim Boden soll das Moos über dem Diamanten hängen“): gezeichnet erst nach den Plaketten
    // (fotoStueckMoosZeichnen bzw. wechselZeichnen)
    p.cm = document.createElement('canvas'); p.cm.width = p.c.width; p.cm.height = p.c.height;
    const qm = p.cm.getContext('2d'); qm.setTransform(2, 0, 0, 2, 48, 48);
    const K = fotoMatMuster(qm, 'kante', -FOTO_MAT_KANTE.ueber), U = typeof FOTO_MAT_UEBERHANG === 'number' ? FOTO_MAT_UEBERHANG : 5;
    if(K){ qm.fillStyle = K; const mu = FOTO_MAT_KANTE.matteUnten - FOTO_MAT_KANTE.ueber;
      qm.fillRect(-U*0.7, -FOTO_MAT_KANTE.ueber, w + 1.4*U, FOTO_MAT_KANTE.ueber + mu);
      qm.fillRect(1, mu, w - 2, Math.min(h - mu, FOTO_MAT_KANTE.weltH - FOTO_MAT_KANTE.ueber - mu)); }
  }
  p.done = 1;
  return true;
}
// Höhe der Plakette auf einem Erd-Stück im Foto-Look: ihre Oberkante FOTO_STUECK.moosUeber px unter der Oberfläche, so dass
// die Moos-Fransen der Kante (bis ~7 px tief dicht, darunter einzelne Fäden) über den Diamanten hängen; nie unter die Mitte
function fotoMoosPlaketteY(top, h, r){ return Math.min(top + h/2 + 3, top + r + FOTO_STUECK.moosUeber); }
// Moos-Schicht der bewegten Böden (p.cm) – aus 12 nach den Plaketten, an derselben Stelle wie matBeweglichZeichnen
function fotoStueckMoosZeichnen(){
  if(!fotoEl2An() || typeof matBeweglicheStuecke !== 'function') return;
  for(const B of matBeweglicheStuecke()){
    if(!B.piece.cm) continue;
    const s0 = B.teile[0], x = Math.round(B.x0 + (s0.x - s0.startX) - camX), y = Math.round(B.y0 + (s0.y - s0.startY));
    if(x + B.w < -20 || x > VW + 20) continue;
    ctx.drawImage(B.piece.cm, x - 24, y - 24 - B.oben, B.w + 48, B.h + B.oben + 48);
  }
}
// Plakette mit dem Edelstein (bewegte Plattform, Presse, Wasser-/Lava-Marke, Wechselboden): rostige Eisenplatte mit
// Nieten und dunkler Fassung statt der grauen Comic-Platte (der Edelstein selbst kommt vom Aufrufer). r = halbe Größe.
function fotoVerknuepfungsPlatte(x, y, r){
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x - r, y - r, 2*r, 2*r, 2.5);
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  g.addColorStop(0, '#5e524a'); g.addColorStop(0.45, '#3c332d'); g.addColorStop(1, '#211b17');
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = 'rgba(140,70,30,.42)';   // Rostflecken (fest je Stelle)
  for(let i = 0; i < 7; i++){ const z1 = fotoEl2Zufall(x*0.1 + i, y*0.1), z2 = fotoEl2Zufall(i, x*0.1 + y*0.07); ctx.beginPath(); ctx.ellipse(x - r + z1*2*r, y - r + z2*2*r, 1.2 + z1*2, 0.9 + z2*1.4, z1*3, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,238,215,.14)'; ctx.fillRect(x - r, y - r, 2*r, 1.2);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x - r, y + r - 1.6, 2*r, 1.6);
  ctx.restore();
  for(const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]){ ctx.fillStyle = '#17120f'; ctx.beginPath(); ctx.arc(x + sx*(r - 2.6), y + sy*(r - 2.6), 1.1, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,235,210,.3)'; ctx.beginPath(); ctx.arc(x + sx*(r - 2.6) - 0.3, y + sy*(r - 2.6) - 0.4, 0.4, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(10,8,6,.75)'; ctx.beginPath(); ctx.arc(x, y, r*0.72, 0, 7); ctx.fill();   // Vertiefung für den Edelstein
  ctx.restore();
}

// ---------- Bröckelboden: trockene, rissige Erdscholle ----------
// Je Kästchen einmal gezeichnet (Zwischenspeicher wie broeckelKachel): Erde-Foto (heller und trockener als der feste
// Boden), feine Risse, an freien Seiten/unten ausgebrochen, lose Krümel unten, oben eine vertrocknete, lückenhafte
// Moos-Kante, unten ein paar dünne Würzelchen. Nebeneinander liegende Schollen sind durch dunkle Fugen getrennt (wirkt
// zerbrechlich). Vorwarnung (betreten): zittert wie bisher, die Risse wachsen und klaffen auf, die Fugen öffnen sich,
// Krümel und kleine Brocken fallen; Zerbrechen: Erdbrocken mit Moos statt gelber Comic-Stücke.
const FOTO_BROECKEL = {seite: 6, oben: 21, unten: 16, dunkel: 0.36, trocken: 'rgba(120,98,66,.2)', moosTrocken: 'rgba(118,100,62,.45)'};
const __fotoBroeckel = {};
// Risse einer Scholle (Welt-px, fest je Kästchen): je Riss eine Punktliste von oben nach unten
function fotoBroeckelRissListe(cc, rr){
  const x = cc*40, y = rr*40, L = [], n = 2 + Math.floor(fotoEl2Zufall(cc, rr)*2);
  for(let i = 0; i < n; i++){
    let px = x + 7 + fotoEl2Zufall(cc + i*3.1, rr)*26, py = y + 2 + fotoEl2Zufall(i, cc + rr)*6; const pts = [[px, py]];
    const schritte = 4 + Math.floor(fotoEl2Zufall(rr + i, cc)*4);
    for(let k = 0; k < schritte; k++){ px += (fotoEl2Zufall(cc*7 + i, k + rr)*2 - 1)*6; py += 3 + fotoEl2Zufall(k, cc + i)*5; pts.push([Math.max(x + 2, Math.min(x + 38, px)), Math.min(y + 39, py)]); }
    L.push(pts);
  }
  return L;
}
function fotoBroeckelKachel(cc, rr){
  const R = matRasterHolen(), key = R.version + ':' + cc + ',' + rr;
  if(__fotoBroeckel[key]) return __fotoBroeckel[key];
  const F = FOTO_BROECKEL, x = cc*40, y = rr*40, c = document.createElement('canvas');
  c.width = (40 + 2*F.seite)*2; c.height = (40 + F.oben + F.unten)*2;
  const q = c.getContext('2d'); q.setTransform(2, 0, 0, 2, -(x - F.seite)*2, -(y - F.oben)*2);
  const n = Tn(cc, rr - 1), s = Tn(cc, rr + 1), wl = Tc(cc - 1, rr), e = Tc(cc + 1, rr);
  // Umriss: freie Seiten/Unterseite deutlich ausgebrochen; neben einer Scholle eine Fuge (0,8 px eingerückt)
  const brech = (u, linie, a) => (0.5*Math.sin(u*0.37 + linie) + 0.5*fotoEl2Zufall(Math.floor(u/2), linie))*a;
  const seite = (frei, nb, yy, linie) => frei ? brech(yy, linie, 4)*Math.min(1, (yy - y)/5) : 0;
  const pts = [[x + (wl ? 0 : 1.5), y], [x + 40 - (e ? 0 : 1.5), y]];
  for(let yy = y + 2; yy <= y + 40; yy += 2) pts.push([x + 40 - seite(!e, e, yy, x + 40), yy]);
  for(let xx = x + 38; xx >= x; xx -= 2) pts.push([xx, y + 40 - (s ? 0 : brech(xx, y + 40, 4.5))]);
  for(let yy = y + 38; yy > y; yy -= 2) pts.push([x + seite(!wl, wl, yy, x), yy]);
  const form = new Path2D(); pts.forEach(([px, py], i) => i ? form.lineTo(px, py) : form.moveTo(px, py)); form.closePath();
  q.save(); q.clip(form);
  q.fillStyle = fotoMatMuster(q, 'erde'); q.fillRect(x - 2, y - 2, 44, 44);   // an der Welt verankert (nahtlos über die Schollen)
  q.fillStyle = 'rgba(0,0,0,' + F.dunkel + ')'; q.fillRect(x - 2, y - 2, 44, 44);
  q.fillStyle = F.trocken; q.fillRect(x - 2, y - 2, 44, 44);
  // Klumpen: hellere Buckel und dunkle Löcher (fester Zufall)
  for(let i = 0; i < 7; i++){
    const px = x + 3 + fotoEl2Zufall(cc*5 + i, rr)*34, py = y + 6 + fotoEl2Zufall(i, rr*5 + cc)*31, r0 = 2 + fotoEl2Zufall(i + 9, cc)*4;
    const gk = q.createRadialGradient(px - r0*0.3, py - r0*0.4, 0, px, py, r0);
    if(i % 3){ gk.addColorStop(0, 'rgba(190,165,128,.22)'); gk.addColorStop(1, 'rgba(190,165,128,0)'); }
    else { gk.addColorStop(0, 'rgba(8,6,4,.55)'); gk.addColorStop(1, 'rgba(8,6,4,0)'); }
    q.fillStyle = gk; q.fillRect(px - r0, py - r0, 2*r0, 2*r0);
  }
  // feine Risse (dunkel, darunter ein heller Grat)
  q.lineCap = 'round'; q.lineJoin = 'round';
  for(const L of fotoBroeckelRissListe(cc, rr)){
    q.strokeStyle = 'rgba(190,165,130,.16)'; q.lineWidth = 0.8; q.beginPath(); L.forEach(([px, py], i) => i ? q.lineTo(px + 0.7, py + 0.6) : q.moveTo(px + 0.7, py + 0.6)); q.stroke();
    q.strokeStyle = 'rgba(10,7,4,.75)'; q.lineWidth = 0.9; q.beginPath(); L.slice(0, Math.ceil(L.length*0.6)).forEach(([px, py], i) => i ? q.lineTo(px, py) : q.moveTo(px, py)); q.stroke();
  }
  const gl = q.createLinearGradient(0, y, 0, y + 40); gl.addColorStop(0, 'rgba(255,238,210,.06)'); gl.addColorStop(0.65, 'rgba(0,0,0,0)'); gl.addColorStop(1, 'rgba(0,0,0,.35)');
  q.fillStyle = gl; q.fillRect(x - 2, y - 2, 44, 44);
  q.restore();
  // Fuge zur rechten Nachbar-Scholle: ein unregelmäßiger Spalt von oben (je Kästchenpaar nur einmal gezeichnet,
  // schlängelt sich um die Kästchengrenze, verläuft nach unten) – die Schollen wirken lose aneinandergelegt
  const fuge = (fx, kc, clipX) => {   // kc = Spalte links der Fuge (gleiche Form von beiden Seiten); nur die eigene Hälfte zeichnen
    const pl = [], pr = [];
    for(let yy = y; yy <= y + 30; yy += 3){ const v = (fotoEl2Zufall(kc*3 + 1, yy) - 0.5)*3.2, b = 1.3*(1 - (yy - y)/32); pl.push([fx + v - b, yy]); pr.push([fx + v + b, yy]); }
    q.save(); q.beginPath(); q.rect(clipX, y - F.oben, 40 + F.seite, 40 + F.oben + F.unten); q.clip();
    q.fillStyle = 'rgba(8,6,4,.7)'; q.beginPath(); pl.forEach(([px, py], i) => i ? q.lineTo(px, py) : q.moveTo(px, py)); pr.reverse().forEach(([px, py]) => q.lineTo(px, py)); q.closePath(); q.fill();
    q.restore();
  };
  if(e === 3) fuge(x + 40, cc, x - F.seite);
  if(wl === 3) fuge(x, cc - 1, x);
  if(!s){   // lose Krümel an der Unterseite und dünne Würzelchen
    q.save(); q.lineCap = 'round';
    for(let i = 0; i < 3; i++){ const rx = x + 5 + fotoEl2Zufall(cc + i*2.7, rr + 4)*30, lang = 4 + fotoEl2Zufall(i, cc*3 + rr)*10;
      q.strokeStyle = 'rgba(40,29,19,.85)'; q.lineWidth = 0.6; q.beginPath(); q.moveTo(rx, y + 37); q.quadraticCurveTo(rx + (fotoEl2Zufall(i, rr) - 0.5)*5, y + 38 + lang*0.6, rx + (fotoEl2Zufall(rr, i) - 0.5)*4, y + 37 + lang); q.stroke(); }
    for(let i = 0; i < 6; i++){ const kx = x + 3 + fotoEl2Zufall(cc*2 + i, rr*3)*34, ky = y + 38.5 + fotoEl2Zufall(i, cc)*2.5, kr = 0.8 + fotoEl2Zufall(i + 4, rr)*1.4;
      q.fillStyle = i % 2 ? '#3b2f24' : '#54463a'; q.beginPath(); q.ellipse(kx, ky, kr*1.2, kr, fotoEl2Zufall(i, i)*3, 0, 7); q.fill(); }
    q.restore();
  }
  if(!n){   // vertrocknete, lückenhafte Moos-Kante (Moos-Foto, darüber trocken-braun getönt, Lücken ausgeschnitten)
    const K = fotoMatMuster(q, 'kante', y - FOTO_MAT_KANTE.ueber), mu = FOTO_MAT_KANTE.matteUnten - FOTO_MAT_KANTE.ueber;
    if(K){
      // eigene Ebene: Moos zeichnen, Lücken herausnehmen, trocken tönen (nur das Moos, nicht die Erde)
      const m = document.createElement('canvas'); m.width = c.width; m.height = c.height;
      const mq = m.getContext('2d'); mq.setTransform(2, 0, 0, 2, -(x - F.seite)*2, -(y - F.oben)*2);
      mq.fillStyle = K; mq.fillRect(x - (wl ? 0 : 3), y - F.oben, 40 + (wl ? 0 : 3) + (e ? 0 : 3), F.oben + mu);
      mq.globalCompositeOperation = 'destination-out';
      for(let i = 0; i < 2; i++){ const lx = x + 5 + fotoEl2Zufall(cc + i*5, rr + 1)*28, lb = 3 + fotoEl2Zufall(i, cc)*6;
        mq.beginPath(); mq.ellipse(lx, y - 8, lb, 8, 0, 0, 7); mq.fill(); }   // Lücken: dort ist das Moos abgebröckelt
      mq.globalCompositeOperation = 'source-atop'; mq.fillStyle = F.moosTrocken; mq.fillRect(x - 4, y - F.oben, 48, F.oben + mu + 2);
      q.save(); q.setTransform(1, 0, 0, 1, 0, 0); q.drawImage(m, 0, 0); q.restore();
    }
  }
  return __fotoBroeckel[key] = c;
}
// aus der Zeichen-Schleife (12, type 'crumble'): true = im Foto-Look gezeichnet. Zittern wie im Comic-Look (aus s.timer).
function fotoBroeckelZeichnen(s, x){
  if(!fotoEl2An() || typeof fotoMatBild !== 'function' || !fotoMatBild('erde')) return false;
  const F = FOTO_BROECKEL, t = s.triggered ? Math.min(1, s.timer/CRUMBLE_TRIGGER_MS) : 0;
  const shake = t > 0 ? Math.sin(s.timer*0.09 + s.x)*(0.4 + 2.8*Math.pow(t, 1.5)) : 0;
  const sx = x + shake, sy = s.y + (t > 0 ? Math.cos(s.timer*0.13)*t*1.2 : 0);
  for(let cx = 0; cx < s.w - 1; cx += 40) for(let cy = 0; cy < s.h - 1; cy += 40)
    ctx.drawImage(fotoBroeckelKachel(Math.floor((s.x + cx)/40 + 1e-6), Math.floor((s.y + cy)/40 + 1e-6)),
      sx + cx - F.seite, sy + cy - F.oben, 40 + 2*F.seite, 40 + F.oben + F.unten);
  if(t > 0) fotoBroeckelWarnung(s, sx, sy, t);
  return true;
}
// Vorwarnung (nur Anzeige, alles aus s.timer): Risse wachsen über die ganze Scholle und klaffen auf, Fugen öffnen
// sich, die Scholle dunkelt leicht nach, Krümel und kleine Brocken rieseln unten heraus
function fotoBroeckelWarnung(s, sx, sy, t){
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const dx = sx - s.x;
  for(let cx = 0; cx < s.w - 1; cx += 40) for(let cy = 0; cy < s.h - 1; cy += 40){
    const cc = Math.floor((s.x + cx)/40 + 1e-6), rr = Math.floor((s.y + cy)/40 + 1e-6);
    ctx.fillStyle = `rgba(10,7,4,${(0.18*t).toFixed(3)})`; ctx.fillRect(sx + cx, sy + cy, 40, 40);
    for(const L of fotoBroeckelRissListe(cc, rr)){
      const n = Math.max(2, Math.ceil(L.length*(0.35 + 0.65*t)));   // wachsen mit der Zeit
      ctx.beginPath(); for(let i = 0; i < n; i++){ const [px, py] = L[i]; i ? ctx.lineTo(px + dx, py + sy - s.y) : ctx.moveTo(px + dx, py + sy - s.y); }
      ctx.strokeStyle = 'rgba(200,175,140,.18)'; ctx.lineWidth = 0.9 + 1*t; ctx.save(); ctx.translate(0.7, 0.7); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = 'rgba(6,4,2,.8)'; ctx.lineWidth = 0.7 + 1.3*t; ctx.stroke();
    }
    if(Tc(cc + 1, rr) === 3 && cx + 40 < s.w - 1){   // Fuge zur Nachbar-Scholle öffnet sich (oben breiter)
      const fx = sx + cx + 40, b = 0.4 + 1.3*t, L = 40*(0.45 + 0.5*t);
      ctx.fillStyle = 'rgba(6,4,2,.8)'; ctx.beginPath(); ctx.moveTo(fx - b, sy + cy); ctx.lineTo(fx + b, sy + cy); ctx.lineTo(fx, sy + cy + L); ctx.closePath(); ctx.fill();
    }
  }
  // Krümel und Brocken (fallen beschleunigt, blenden aus)
  const n = Math.round(s.w/8);
  for(let i = 0; i < n; i++){
    const start = crumbleRnd(i, s.x)*CRUMBLE_TRIGGER_MS*0.7, age = s.timer - start;
    if(age < 0) continue;
    const fx = sx + 4 + crumbleRnd(s.x, i)*(s.w - 8), fy = sy + s.h - 1 + 0.00035*age*age + age*0.02, gr = i % 5 ? 1.2 + crumbleRnd(i, 3)*1.3 : 3;
    ctx.globalAlpha = Math.max(0, 1 - age/550);
    ctx.fillStyle = i % 3 ? '#3a2d22' : '#5d4c3c';
    ctx.beginPath(); ctx.ellipse(fx, fy, gr, gr*0.8, i + age*0.01, 0, 7); ctx.fill();
  }
  ctx.restore();
}
// Zerbrechen (aus drawCrumbleBreak, 12): Erdbrocken (Erde-Foto, an jedem Brocken verankert), obere tragen Moos,
// Steinchen dunkel, Staub grau-braun. true = gezeichnet.
function fotoBroeckelBruch(s){
  if(!fotoEl2An() || typeof fotoMatBild !== 'function' || !fotoMatBild('erde')) return false;
  const k = Math.min(1, s.breakElapsed/CRUMBLE_FRAGMENT_LIFE), fade = k < 0.6 ? 1 : 1 - (k - 0.6)/0.4;
  ctx.save();
  for(const d of (s.dust || [])){
    const dx = d.x - camX; if(dx < -40 || dx > VW + 40) continue;
    const a = 0.4*(1 - k), g = ctx.createRadialGradient(dx, d.y, 0, dx, d.y, d.r);
    g.addColorStop(0, `rgba(122,110,94,${a.toFixed(3)})`); g.addColorStop(1, 'rgba(122,110,94,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(dx, d.y, d.r, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = Math.max(0, fade);
  for(const f of s.fragments){
    const fx = f.x - camX; if(fx < -40 || fx > VW + 40) continue;
    ctx.save(); ctx.translate(fx, f.y); ctx.rotate(f.rot);
    // Brocken: Ecken leicht abgerundet und Kanten etwas ausgebrochen – Erdklumpen statt glatter Platten
    const P = f.pts, N = P.length, auf = (a, b, t) => [a[0] + (b[0] - a[0])*t, a[1] + (b[1] - a[1])*t];
    ctx.beginPath();
    for(let i = 0; i < N; i++){
      const a = P[i], b = P[(i + 1) % N], v = auf(P[(i + N - 1) % N], a, 0.78), h = auf(a, b, 0.22), mitte = auf(a, b, 0.5);
      const z = fotoEl2Zufall(a[0] + i, b[1]) - 0.5, nx = -(b[1] - a[1])*0.16*z, ny = (b[0] - a[0])*0.16*z;   // fest je Brocken (Form ändert sich nicht)
      i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]); ctx.quadraticCurveTo(a[0], a[1], h[0], h[1]); ctx.lineTo(mitte[0] + nx, mitte[1] + ny);
    }
    ctx.closePath();
    if(f.pebble){ ctx.fillStyle = '#3e342b'; ctx.fill(); ctx.restore(); continue; }
    ctx.fillStyle = fotoMatMuster(ctx, 'erde'); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,' + FOTO_BROECKEL.dunkel + ')'; ctx.fill();
    ctx.fillStyle = FOTO_BROECKEL.trocken; ctx.fill();
    ctx.save(); ctx.clip();
    const g = ctx.createLinearGradient(0, -12, 0, 12); g.addColorStop(0, 'rgba(255,238,210,.08)'); g.addColorStop(1, 'rgba(0,0,0,.4)');
    ctx.fillStyle = g; ctx.fillRect(-40, -40, 80, 80);
    if(f.grassTop !== null){ ctx.fillStyle = 'rgba(78,84,44,.95)'; ctx.fillRect(-40, f.grassTop, 80, 4); ctx.fillStyle = 'rgba(112,104,64,.8)'; ctx.fillRect(-40, f.grassTop, 80, 1.5); }
    ctx.restore();
    ctx.restore();
  }
  ctx.restore();
  return true;
}
