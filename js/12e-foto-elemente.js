// 12e-foto-elemente.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Elemente im Foto-Look (Nutzerwunsch: „alle Elemente umgestalten – Hebel und Druckplatte bleiben“) ----------
// Gilt nur im Foto-Look (fotoLookAktiv, Taste B). Holz macht das Spiel selbst (fotoHolz: verwitterte Bretter mit Maserung,
// Astlöchern, Rissen, Fugen und etwas Moos), Eisen wird gezeichnet (rostig, Nieten). Ganz entfernen: diese Datei +
// Eintrag in index.html + die Aufrufe fotoEl… in den Zeichen-Funktionen der Elemente.

// Holz-Textur (einmal): senkrechte Bretter, nahtlos wiederholbar; HOLZ.welt = Größe in Welt-px, HOLZ.brett = Brettbreite
const FOTO_HOLZ = {px: 512, welt: 128, bretter: 8, saat: 61};
const fotoEl = {holz: null, muster: null};
function fotoHolz(){
  if(fotoEl.holz) return fotoEl.holz;
  const N = FOTO_HOLZ.px, c = document.createElement('canvas'); c.width = c.height = N;
  const q = c.getContext('2d'), D = q.createImageData(N, N), d = D.data, r = rnd(FOTO_HOLZ.saat);
  const B = FOTO_HOLZ.bretter, bw = N/B, TAU = Math.PI*2;
  // je Brett: Grundfarbe (verwittertes Eichenholz: grau-braun), Maserungs-Phase, Astlöcher
  const bretter = [];
  for(let i = 0; i < B; i++){
    const hell = 0.78 + r()*0.32, warm = r();
    bretter.push({rgb: [92*hell + warm*14, 80*hell + warm*6, 66*hell - warm*4], ph: r()*TAU, f: 0.55 + r()*0.6,
      w1: 1 + Math.floor(r()*2), w2: 2 + Math.floor(r()*3), aeste: [0, 1].filter(() => r() < 0.55).map(() => ({y: r()*N, x: 0.25 + r()*0.5, g: 5 + r()*9})),
      riss: r() < 0.5 ? {x: 0.2 + r()*0.6, y0: r()*N, l: 60 + r()*160} : null, moos: r()});
  }
  const rausch = (x, y) => { const v = Math.sin(x*12.9898 + y*78.233)*43758.5453; return v - Math.floor(v); };
  // weiches Rauschen (Wertegitter, nahtlos über die Höhe: Gitter wiederholt sich nach 'py' Zellen)
  const glatt = t => t*t*(3 - 2*t);
  const noise = (x, y, py, s) => { const xi = Math.floor(x), yi = Math.floor(y), fx = glatt(x - xi), fy = glatt(y - yi);
    const h = (a, b) => rausch(a + s*31, ((b % py) + py) % py + s*17);
    const a = h(xi, yi), b = h(xi + 1, yi), c2 = h(xi, yi + 1), e = h(xi + 1, yi + 1);
    return a + (b - a)*fx + (c2 - a)*fy + (a - b - c2 + e)*fx*fy; };
  for(let y = 0; y < N; y++) for(let x = 0; x < N; x++){
    const i = Math.floor(x/bw), b = bretter[i], u = (x - i*bw)/bw;   // u: 0..1 quer übers Brett
    // Maserung: unregelmäßige Fasern entlang des Bretts (quer fein, längs stark gestreckt) + leichte Wellen
    const welle = Math.sin(y/N*TAU*b.w1 + b.ph)*3 + (noise(y/N*6, i, 6, i + 50) - 0.5)*6;
    const ux = u*bw + welle;
    let m = 0.74 + 0.2*noise(ux*0.45, y/N*4, 4, i) + 0.14*noise(ux*1.6, y/N*12, 12, i + 9) + 0.06*noise(ux*4, y/N*40, 40, i + 3);
    m *= 0.88 + 0.16*noise(ux*0.12, y/N*3, 3, i + 21);                // größere helle/dunkle Wetterflecken
    for(const a of b.aeste){   // Astloch: dunkler Kern mit Ringen, Maserung läuft drumherum
      let dy = y - a.y; if(dy > N/2) dy -= N; if(dy < -N/2) dy += N;
      const dx = (u - a.x)*bw, e = Math.hypot(dx, dy*0.55);
      if(e < a.g*2.2) m *= 0.78 + 0.22*Math.min(1, e/a.g) + 0.06*Math.sin(e*1.3);
    }
    if(b.riss){ let dy = y - b.riss.y0; if(dy < 0) dy += N; if(dy < b.riss.l && Math.abs(u - b.riss.x - Math.sin(y*0.05)*0.02) < 0.012) m *= 0.45; }
    m *= 0.93 + 0.12*rausch(x, y);                                   // feine Körnung
    const kante = Math.min(u, 1 - u)*bw; if(kante < 3) m *= 0.35 + 0.65*kante/3;   // Fuge zwischen den Brettern
    if(kante >= 3 && kante < 5) m *= 1.06;                           // leicht helle Kante
    const p = (y*N + x)*4;
    d[p] = b.rgb[0]*m; d[p + 1] = b.rgb[1]*m; d[p + 2] = b.rgb[2]*m; d[p + 3] = 255;
  }
  q.putImageData(D, 0, 0);
  // etwas Moos/Grünstich auf einigen Brettern (weich, unten stärker)
  for(let i = 0; i < B; i++) if(bretter[i].moos < 0.35){
    const g = q.createLinearGradient(0, N*0.4, 0, N); g.addColorStop(0, 'rgba(70,88,40,0)'); g.addColorStop(1, 'rgba(70,88,40,.28)');
    q.fillStyle = g; q.fillRect(i*bw + 2, 0, bw - 4, N);
  }
  return fotoEl.holz = c;
}
// Holz als Muster: senkrechte Bretter (quer = um 90° gedreht), an (x0, y0) verankert, Welt-px
function fotoHolzMuster(q, quer, x0, y0){
  const c = fotoHolz(); if(!fotoEl.muster) fotoEl.muster = q.createPattern(c, 'repeat');
  const k = FOTO_HOLZ.welt/c.width, m = fotoEl.muster;
  if(m.setTransform) m.setTransform(quer ? new DOMMatrix([0, k, -k, 0, x0 || 0, y0 || 0]) : new DOMMatrix([k, 0, 0, k, x0 || 0, y0 || 0]));
  return m;
}
// ---------- Tür (aus drawGate, 12-welt-zeichnen.js; dort bleiben Nische, Aufgleiten, Edelstein und Rahmen) ----------
// Holztor aus verwitterten Brettern entlang der langen Achse, rostige Eisenbänder quer (eins je ~56 px), Licht von oben,
// unten etwas dunkler und moosig. Das Holz ist an der Tür verankert (gleitet beim Öffnen mit).
function fotoTuerInnen(q, ix, iy, iw, ih, vert){
  q.fillStyle = fotoHolzMuster(q, !vert, ix, iy); q.fillRect(ix, iy, iw, ih);
  const L = vert ? ih : iw, ns = Math.max(1, Math.round(L/56));
  for(let i = 0; i < ns; i++){
    const p = (i + 0.5)/ns*L;
    if(vert) fotoEisenBand(q, ix, iy + p - 4, iw, 8, 11);
    else { q.save(); q.translate(ix + p + 4, iy); q.rotate(Math.PI/2); fotoEisenBand(q, 0, 0, ih, 8, 11); q.restore(); }
  }
  const sg = q.createLinearGradient(0, iy, 0, iy + ih);
  sg.addColorStop(0, 'rgba(255,240,210,.08)'); sg.addColorStop(0.6, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(20,24,10,.35)');
  q.fillStyle = sg; q.fillRect(ix, iy, iw, ih);
}
// ---------- Liane (Foto-Look): dicke, gedrehte Holz-Liane mit Moos und ein paar dunklen Blättern ----------
// von (x0, y0) nach (x1, y1) (Bildschirm-x, Welt-y), leicht durchhängend; seed = feste Lage der Blätter/Moosflecken.
// Auch für Floß-Lianen benutzt. dick = Grundstärke.
function fotoLiane(q, x0, y0, x1, y1, seed, dick, durchhang, jit){
  const D = dick || 5, len = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0)/len, ny = (x1 - x0)/len;
  // Durchhang: vorgegeben (Affen-Liane: nach unten, je nach Spannung) oder leichte feste Biegung (hängende Lianen)
  const cx = durchhang !== undefined ? (x0 + x1)/2 + (jit || 0) : (x0 + x1)/2 + nx*Math.min(10, len/30)*(Math.sin(seed*0.7) > 0 ? 1 : -1);
  const cy = durchhang !== undefined ? (y0 + y1)/2 + durchhang + (jit || 0) : (y0 + y1)/2 + ny*4;
  const pt = t => [(1 - t)*(1 - t)*x0 + 2*(1 - t)*t*cx + t*t*x1, (1 - t)*(1 - t)*y0 + 2*(1 - t)*t*cy + t*t*y1];
  const pfad = (off, ph, amp) => { q.beginPath(); const n = Math.max(8, Math.round(len/6));
    for(let i = 0; i <= n; i++){ const t = i/n, [px, py] = pt(t), w = Math.sin(t*len*0.09 + ph)*amp + off; i ? q.lineTo(px + nx*w, py + ny*w) : q.moveTo(px + nx*w, py + ny*w); } };
  q.save(); q.lineCap = 'round'; q.lineJoin = 'round';
  pfad(0, 0, 0); q.strokeStyle = 'rgba(18,14,10,.75)'; q.lineWidth = D + 2.2; q.stroke();            // Schattenkante
  pfad(0, 0, 0); q.strokeStyle = '#4a3d2c'; q.lineWidth = D; q.stroke();                              // Rinde
  pfad(0, seed, D*0.28); q.strokeStyle = '#2f271d'; q.lineWidth = D*0.35; q.stroke();                // gedrehte Stränge
  pfad(0, seed + 3.1, D*0.28); q.strokeStyle = '#6a5a43'; q.lineWidth = D*0.3; q.stroke();
  pfad(-D*0.25, 0, 0); q.strokeStyle = 'rgba(210,200,170,.22)'; q.lineWidth = D*0.22; q.stroke();     // Licht von links
  // Moos und dunkle Blätter
  const n = Math.floor(len/26);
  for(let i = 1; i < n; i++){
    const t = (i + 0.3*Math.sin(seed + i))/n, [px, py] = pt(t), z = Math.sin(seed*3.1 + i*7.7)*0.5 + 0.5;
    if(z < 0.45){ q.fillStyle = 'rgba(86,104,48,.75)'; q.beginPath(); q.ellipse(px + (z - 0.2)*4, py, D*0.65, D*0.9, 0, 0, 7); q.fill(); }
    else if(z > 0.72){
      const s = i % 2 ? 1 : -1; q.save(); q.translate(px + s*D*0.4, py); q.rotate(s*0.9 + Math.sin(seed + i)*0.3);
      q.fillStyle = z > 0.86 ? '#5b5a2c' : '#3f4c27'; q.beginPath(); q.moveTo(0, 0); q.quadraticCurveTo(s*5, -4, s*11, 0); q.quadraticCurveTo(s*5, 4, 0, 0); q.fill();
      q.strokeStyle = 'rgba(20,24,10,.5)'; q.lineWidth = 0.6; q.beginPath(); q.moveTo(0, 0); q.lineTo(s*10, 0); q.stroke(); q.restore();
    }
  }
  q.restore();
}
// Liane des Affen (vom Haken zur Hand) im Foto-Look – gleiche Holz-Liane wie am Haken, etwas dünner (Nutzer: „Liane vom
// Affen überarbeiten, damit sie besser ins Spiel passt“). Durchhang wie lianeZeichnen (10): 9 px × (sagF ?? 1 − Spannung);
// stark gedehnt wird sie dünner und zittert (jit).
function fotoAffenLiane(x0, y0, x1, y1, st, jit, seed, sagF){
  const len = Math.hypot(x1 - x0, y1 - y0) || 1, sag = 9*(sagF !== undefined ? sagF : 1 - st)*Math.min(1, len/120);
  fotoLiane(ctx, x0, y0, x1, y1, seed, 3.8 - (st || 0)*1.2, sag, jit);
}
// Haken im Foto-Look: Liane von oben (oder vom Material darüber) bis zum rostigen Eisenring. Kann der Affe greifen,
// leuchtet der Ring orange (Nutzerwunsch; der Reichweiten-Kreis ist im Foto-Look ausgeblendet), sonst kein Leuchten.
const FOTO_HAKEN_GLUT = '255,140,30';
// Glut an/aus (Nutzerwunsch „nicht direkt komplett aus, sondern erlöschen lassen“): in Reichweite in an s hell, außerhalb
// erlischt sie langsam in aus s wie Glut – wird dabei dunkler und röter (glutAus). Nur Anzeige: Stand je Haken (h._glut),
// fortgeschrieben mit der echten Uhr, ändert keinen Spielzustand.
const FOTO_HAKEN_GLUT_ZEIT = {an: 0.15, aus: 1.6};
const FOTO_HAKEN_GLUT_AUS = [190, 55, 18];
function fotoHakenGlutStand(h, inRange){
  if(!h) return inRange ? 1 : 0;
  const t = performance.now(), dt = h._glutT ? Math.min(0.25, (t - h._glutT)/1000) : 1; h._glutT = t;
  const g = h._glut || 0, Z = FOTO_HAKEN_GLUT_ZEIT;
  h._glut = inRange ? Math.min(1, g + dt/Z.an) : Math.max(0, g - dt/Z.aus);
  return h._glut;
}
function fotoHakenZeichnen(x, y, y0, seed, ringR, inRange, hx, h){
  const x0 = x + Math.sin(seed*0.013)*3, dx = x0 - x, dy = y0 - y, d = Math.hypot(dx, dy) || 1;
  fotoLiane(ctx, x0, y0, x + dx/d*(ringR + 1), y + dy/d*(ringR + 1), seed, 5);
  const t = performance.now(), gl = fotoHakenGlutStand(h, inRange), glE = gl*gl*(3 - 2*gl);
  const puls = (0.75 + 0.25*Math.sin(t*0.008 + hx*0.05))*glE;
  // Farbe: hell-orange, beim Erlöschen dunkler und röter (wie verglühende Glut)
  const farbe = inRange || gl >= 1 ? FOTO_HAKEN_GLUT : FOTO_HAKEN_GLUT.split(',').map((v, i) => Math.round(FOTO_HAKEN_GLUT_AUS[i] + (Number(v) - FOTO_HAKEN_GLUT_AUS[i])*glE)).join(',');
  if(gl > 0.01){ const rr = 22 + 12*glE, g = ctx.createRadialGradient(x, y, 2, x, y, rr); g.addColorStop(0, `rgba(${farbe},${0.7*puls})`); g.addColorStop(1, `rgba(${farbe},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill(); }
  ctx.save();
  ctx.strokeStyle = 'rgba(12,9,7,.75)'; ctx.lineWidth = 7.5; ctx.beginPath(); ctx.arc(x, y + 0.6, ringR, 0, 7); ctx.stroke();
  const rg = ctx.createLinearGradient(x - ringR, y - ringR, x + ringR, y + ringR);
  rg.addColorStop(0, '#7a5a42'); rg.addColorStop(0.45, '#4d382b'); rg.addColorStop(1, '#2a1e17');
  ctx.strokeStyle = rg; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, ringR, 0, 7); ctx.stroke();
  for(let i = 0; i < 9; i++){ const a = i*0.7 + seed*0.01; ctx.fillStyle = i % 3 ? 'rgba(150,80,35,.55)' : 'rgba(40,30,22,.6)';
    ctx.beginPath(); ctx.arc(x + Math.cos(a)*ringR, y + Math.sin(a)*ringR, 1 + (i % 2)*0.6, 0, 7); ctx.fill(); }   // Rost
  ctx.strokeStyle = 'rgba(255,240,215,.28)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(x, y, ringR + 0.6, Math.PI*1.05, Math.PI*1.65); ctx.stroke();
  if(gl > 0.01){ ctx.strokeStyle = `rgba(${farbe},${0.85*puls})`; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(x, y, ringR, 0, 7); ctx.stroke(); }   // Ring glüht orange
  // Liane einmal um den Ring geschlungen
  ctx.strokeStyle = '#3e3326'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.ellipse(x, y - ringR + 1, 4, 2.6, 0, 0, 7); ctx.stroke();
  ctx.restore();
}
// ---------- Floß (Foto-Look, statt Blatt; aus blattBild in elemente/blattfloss.js) ----------
// Bretter quer über zwei Tragebalken, Stehfläche = y; schwankt wie das Blatt. Alles HINTER den Figuren ('vorne' = nichts).
function fotoFlossBild(q, x, y, w, schwank, teil){
  if(teil === 'vorne') return;
  q.save(); q.translate(x + w/2, y); q.rotate(schwank || 0);
  // Seitenansicht einer Holzplattform (Nutzer: „sieht komisch aus“ – vorher ein flacher Block mit Strichen):
  // zwei übereinander liegende Bretter (Maserung längs, leicht unterschiedlich lang, dunkle Fuge dazwischen), an den
  // Enden Hirnholz mit Jahresringen, darunter zwei Querbalken (Stirnseiten), kein Block-Rahmen
  const L = w/2, brett = (x0, y0, bw, bh, ph) => {
    q.save(); q.beginPath();
    q.moveTo(x0 + 1, y0); for(let i = 1; i <= 8; i++) q.lineTo(x0 + bw*i/8, y0 + Math.sin(ph + i*1.7)*0.35);   // leicht unebene Oberkante
    q.lineTo(x0 + bw - 0.5, y0 + bh); q.lineTo(x0 + 0.5, y0 + bh); q.closePath(); q.clip();
    q.fillStyle = fotoHolzMuster(q, true, x0 + ph*37, y0 - ph*13); q.fillRect(x0, y0 - 1, bw, bh + 1);
    const g = q.createLinearGradient(0, y0, 0, y0 + bh); g.addColorStop(0, 'rgba(255,240,210,.18)'); g.addColorStop(0.35, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.4)');
    q.fillStyle = g; q.fillRect(x0, y0 - 1, bw, bh + 1);
    for(const ex of [x0, x0 + bw - 3]){   // Hirnholz an den Enden
      q.fillStyle = '#3a3026'; q.fillRect(ex, y0, 3, bh);
      q.strokeStyle = 'rgba(110,95,72,.6)'; q.lineWidth = 0.5; for(let k = 1; k < 3; k++){ q.beginPath(); q.ellipse(ex + 1.5, y0 + bh/2, 0.6*k, bh*0.18*k, 0, 0, 7); q.stroke(); }
    }
    q.restore();
  };
  for(const s of [-1, 1]){   // Querbalken: Stirnseite (fast quadratisch) mit Jahresringen
    const bx = s*(L - 16) - 5;
    q.fillStyle = '#2c241b'; q.fillRect(bx - 0.5, 4.5, 11, 8.5);
    q.fillStyle = '#5a4b3a'; q.fillRect(bx, 5, 10, 7.5);
    q.strokeStyle = 'rgba(30,24,18,.7)'; q.lineWidth = 0.6; for(let k = 1; k <= 3; k++){ q.beginPath(); q.ellipse(bx + 5, 8.7, 1.4*k, 1.1*k, 0, 0, 7); q.stroke(); }
    q.fillStyle = 'rgba(255,240,210,.15)'; q.fillRect(bx, 5, 10, 1);
  }
  brett(-L + 2, 0.5, w - 5, 4.5, 2.3);     // unteres Brett (etwas kürzer)
  q.fillStyle = 'rgba(8,6,4,.8)'; q.fillRect(-L + 2, 0, w - 5, 1);   // Fuge
  brett(-L, -4, w, 4.5, 0.7);             // oberes Brett (Lauffläche)
  q.restore();
}
// ---------- Stacheln (Foto-Look): angespitzte Holzpflöcke statt Metall (Nutzer: „warum ist das noch aus Metall?“) ----------
// Im gedrehten Kasten des Stachels (−w/2…w/2, −h/2…h/2, Spitzen nach oben = −y): je 40 px FOTO_PFLOCK_JE Pflöcke,
// unterschiedlich hoch und leicht schief (an der Welt verankert), Holz mit dunkel angekohlter, heller Spitze, unten Moos.
// Gefahr bleibt lesbar: helle, scharfe Spitzen vor dunklem Grund.
const FOTO_PFLOCK_JE = 4;
function fotoStachelnZeichnen(q, sp){
  const w = sp.w, h = sp.h, n = Math.max(2, Math.round(w/40*FOTO_PFLOCK_JE)), b = w/n;
  const zuf = (i, k) => { const v = Math.sin((sp.x + i*13.7)*12.9898 + (sp.y + k)*78.233)*43758.5453; return v - Math.floor(v); };
  const unten = h/2, holz = fotoHolzMuster(q, false, sp.x*0.37, 0);
  for(let i = 0; i < n; i++){
    const mx = -w/2 + (i + 0.5)*b, hoch = h*(0.62 + zuf(i, 1)*0.3), schief = (zuf(i, 2) - 0.5)*0.16, br = b*0.78;
    q.save(); q.translate(mx, unten); q.rotate(schief);
    const sy = -hoch, ss = -hoch + hoch*0.42;   // Spitze, Beginn der Spitze
    q.beginPath(); q.moveTo(-br/2, 0); q.lineTo(-br/2, ss); q.lineTo((zuf(i, 3) - 0.5)*2, sy); q.lineTo(br/2, ss); q.lineTo(br/2, 0); q.closePath();
    q.fillStyle = holz; q.fill();
    const g = q.createLinearGradient(-br/2, 0, br/2, 0); g.addColorStop(0, 'rgba(255,240,210,.14)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.42)');
    q.fillStyle = g; q.fill();
    q.save(); q.clip();   // angekohlter, scharf geschnitzter Spitzenbereich
    const gs = q.createLinearGradient(0, sy, 0, ss + 3); gs.addColorStop(0, 'rgba(230,215,185,.9)'); gs.addColorStop(0.25, 'rgba(70,52,36,.85)'); gs.addColorStop(1, 'rgba(30,22,16,0)');
    q.fillStyle = gs; q.fillRect(-br, sy, br*2, ss - sy + 3);
    q.restore();
    q.strokeStyle = 'rgba(12,9,6,.75)'; q.lineWidth = 0.8; q.stroke();
    q.restore();
  }
  // Moos/Erde am Fuß der Pflöcke
  q.fillStyle = 'rgba(62,76,36,.85)';
  for(let i = 0; i < n*2; i++){ const x = -w/2 + (i + zuf(i, 5))*b/2; q.beginPath(); q.ellipse(x, unten - 1, b*0.32, 2.4, 0, 0, 7); q.fill(); }
}
// Tür-Füße (Nutzer: „der Tür oben und unten noch einen Fuß geben, so dass sie richtig mit Boden/Wand befestigt ist“;
// danach: „nur da, wo sie etwas berühren, und mehr Liebe zum Detail“): an den Enden der langen Achse, aber NUR wo Boden,
// Wand o. Ä. direkt anliegt (fotoTuerAnliegend), ein dunkler, alter Holzbalken: etwas breiter als die Tür, greift ein
// Stück in Boden/Wand, Hirnholz mit Jahresringen an den Enden, abgegriffene helle Kante, Risse, zwei Vierkant-Bolzen,
// rostige Winkel hinüber zum Türrahmen, Moos auf der Schwelle bzw. unter dem Sturz hängende Moosfäden. Statisch.
const FOTO_TUER_FUSS = {dick: 9, ueber: 6, rein: 3, winkel: 9, moos: 'rgba(66,82,36,.9)'};   // Balkenstärke, Überstand je Seite, so weit in Boden/Wand hinein, Länge Eisenwinkel
// liegt an Seite 'oben'/'unten'/'links'/'rechts' der Tür (Weltmaße d) etwas Festes an? (gemerkt je Tür und solids-Stand)
function fotoTuerAnliegend(d){
  if(d._fussN === solids.length && d._fussQ === solids) return d._fuss;
  const fest = s => !s.gone && s.type !== 'door' && s.type !== 'oneway' && s.type !== 'moveplat' && s.type !== 'crumble' && s.type !== 'wechsel';
  const quer = (s, a0, a1) => s.x < a1 - 1 && s.x + s.w > a0 + 1, hoch = (s, b0, b1) => s.y < b1 - 1 && s.y + s.h > b0 + 1;
  const r = {oben: false, unten: false, links: false, rechts: false};
  for(const s of solids){ if(!fest(s)) continue;
    if(quer(s, d.x, d.x + d.w)){ if(Math.abs(s.y + s.h - d.y) < 2) r.oben = true; if(Math.abs(s.y - (d.y + d.h)) < 2) r.unten = true; }
    if(hoch(s, d.y, d.y + d.h)){ if(Math.abs(s.x + s.w - d.x) < 2) r.links = true; if(Math.abs(s.x - (d.x + d.w)) < 2) r.rechts = true; }
  }
  if(d.y <= -SKY_ROOM + 2) r.oben = true;   // Tür bis an den oberen Bildrand: hängt an der „Decke“
  d._fussN = solids.length; d._fussQ = solids; d._fuss = r;
  return r;
}
// Haken-Reichweite im Foto-Look (Nutzerwunsch): der Ring taucht regelmäßig auf (pulsAn s lang, dann pulsAus s nichts; alle
// Haken im selben Takt, außer nach dem Loslassen – s. u.). Hängt jemand an diesem Haken, ist sein Ring aus. Nur Zeichnen (Zeit aus der Uhr), ändert keinen
// Spielzustand. zeit = fest (für Tests). fotoHakenKreisAlpha = Helligkeit des Pulses (0 … pulsMax).
// Nutzerwunsch 04.11.: alle 20 s (pulsAn 6,9 s Ablauf – darin 3 s ganzer Ring, s. FOTO_HAKEN_BLAETTER – + pulsAus 13,1 s).
// Nach dem Loslassen eines Hakens (Affe springt ab) wartet DIESER Haken nachLoslassen s (20) und beginnt dann von vorn
// (vorher lief der allgemeine Takt weiter und der Ring tauchte mitten im Ablauf wieder auf). Stand je Haken: h._ringHing,
// h._ringBasis (nur Anzeige).
const FOTO_HAKEN_KREIS = {pulsAn: 6.9, pulsAus: 13.1, pulsMax: 0.6, nachLoslassen: 20, zeit: null};
// Stand im Puls: 0 … 1 während er sichtbar ist, -1 = nichts (Pause oder jemand hängt an diesem Haken)
function fotoHakenKreisPhase(h){
  const K = FOTO_HAKEN_KREIS;
  const s = K.zeit != null ? K.zeit : (typeof performance !== 'undefined' ? performance.now() : 0) / 1000;
  let haengt = false;
  for(const q of [p1, p2]) if(q && q.hookAttached && (q.anchor === h || q._lianeA === h)) haengt = true;
  if(haengt){ h._ringHing = true; return -1; }
  if(h._ringHing){ h._ringHing = false; h._ringBasis = s + K.nachLoslassen; }   // gerade losgelassen: erst in nachLoslassen s wieder, dann von vorn
  const basis = h._ringBasis != null ? h._ringBasis : 0;
  if(s < basis) return -1;
  const ph = (s - basis) % (K.pulsAn + K.pulsAus);
  return ph < K.pulsAn ? ph / K.pulsAn : -1;
}
function fotoHakenKreisAlpha(h){
  const p = fotoHakenKreisPhase(h);
  return p < 0 ? 0 : FOTO_HAKEN_KREIS.pulsMax * Math.pow(Math.sin(p * Math.PI), 2);
}
// Aussehen (Nutzerwunsch 04.11.): Ring aus Herbstblättern – feste Lage je Haken (kein Zufall pro Bild). Jedes Blatt fällt
// wie echtes Laub (Nutzer: „Liebe zum Detail, jedes Blatt natürlich fallen lassen, sodass sich der Kreis natürlich bildet
// und wieder auflöst“): Pendel-Taumeln – es schwingt seitlich hin und her, sinkt in der Mitte des Schwungs schneller und
// hebt sich an den Umkehrpunkten kurz an, neigt sich in Bewegungsrichtung und wendet sich dabei (Unterseite heller).
// Bilden: jedes Blatt kommt zu seiner eigenen (zufälligen, festen) Zeit von oben, das Pendeln klingt ab und es setzt sich
// weich auf seinen Platz – der Kreis entsteht Blatt für Blatt. Auflösen: kurz zittern, dann löst es sich, sinkt erst
// langsam, dann schneller, pendelt immer weiter aus, treibt etwas zur Seite und verblasst. Zeiten in s im Puls.
const FOTO_HAKEN_BLAETTER = {blattAbstand: 22, art: 'herbst',
  farben: {gruen: ['150,170,110', '196,186,140'], herbst: ['196,112,48', '214,158,62', '160,72,38', '186,140,84']},
  deckkraft: {gruen: 0.52, herbst: 0.66}, rippe: {gruen: '120,135,95', herbst: '110,62,30'},
  // letztes Blatt liegt nach einStreu + einDauer + 0,35 = 2,2 s; erstes löst sich bei fallAb = 5,2 s -> 3 s ganzer Ring
  // lianeAbstand: px Luft zwischen Blatt und Liane (Nutzerwunsch: Blätter und Liane sollen sich nicht berühren)
  lianeAbstand: 7,
  einStreu: 0.9, einDauer: 0.95, einHoehe: 55, fallAb: 5.2, fallStreu: 0.55, fallDauer: 0.85, fallWeg: 85, pendel: 11, zittern: 0.15};
// Was den Ring unterbricht: Boden, Wände, Türen, Bröckelboden, bewegte Teile (nicht offen/weg), Stacheln. Raster je 40 px
// (einmal je Level gebaut, Muster lichtGitterHolen) – pro Blatt nur ein paar Nachschläge.
let fotoRingGitter = null;
function fotoRingGitterHolen(){
  if(fotoRingGitter && fotoRingGitter.src === solids && fotoRingGitter.n === solids.length && fotoRingGitter.sp === spikes) return fotoRingGitter;
  const G = new Map(), dazu = (o, x0, y0, x1, y1) => {
    for(let cx = Math.floor(x0/40); cx <= Math.floor((x1 - 0.01)/40); cx++) for(let cy = Math.floor(y0/40); cy <= Math.floor((y1 - 0.01)/40); cy++){
      const k = cx + ',' + cy; if(!G.has(k)) G.set(k, []); G.get(k).push(o); } };
  const bewegt = [];   // was fährt (bewegter Boden/Wand, Blatt-Floß, Draisine), wird jedes Mal an seiner jetzigen Stelle geprüft
  for(const s of solids){ if(s.type === 'oneway') continue; if(s.type === 'moveplat' || s.type === 'blatt' || s.type === 'draisine'){ bewegt.push(s); continue; } dazu(s, s.x, s.y, s.x + s.w, s.y + s.h); }
  for(const sp of spikes) if(sp.carrier === undefined) dazu({x: sp.x - sp.w/2, y: sp.y - sp.h, w: sp.w, h: sp.h, stachel: true}, sp.x - sp.w/2, sp.y - sp.h, sp.x + sp.w/2, sp.y);
  return fotoRingGitter = {src: solids, n: solids.length, sp: spikes, G, bewegt};
}
// (auch für die 3D-Figur am Seil, js/33: ohneStacheln = nur feste Teile – gilt in beiden Looks)
function fotoRingFest(wx, wy, ohneStacheln){
  const R = fotoRingGitterHolen(), L = R.G.get(Math.floor(wx/40) + ',' + Math.floor(wy/40));
  if(L) for(const o of L) if(!o.gone && !(ohneStacheln && o.stachel) && wx >= o.x && wx <= o.x + o.w && wy >= o.y && wy <= o.y + o.h) return true;
  for(const o of R.bewegt) if(!o.gone && wx >= o.x && wx <= o.x + o.w && wy >= o.y && wy <= o.y + o.h) return true;
  return false;
}
// Blatt-Platz frei? = vom Haken aus geradeaus bis zum Ring nichts Festes (alle 8 px geprüft)
function fotoRingFrei(h, w, rr){
  const cw = Math.cos(w), sw = Math.sin(w);
  for(let d = 12; d <= rr + 6; d += 8) if(fotoRingFest(h.x + cw*d, h.y + sw*d)) return false;
  return true;
}
function fotoHakenKreis(h, x, range){
  const p = fotoHakenKreisPhase(h);
  if(p < 0) return;
  const c = ctx, B = FOTO_HAKEN_BLAETTER, t = p*FOTO_HAKEN_KREIS.pulsAn;
  const n = Math.max(10, Math.round(Math.PI*2*range/B.blattAbstand));
  const zeit = (typeof performance !== 'undefined' ? performance.now() : 0)/1000;
  const hs = (i, k) => { const v = Math.sin(h.x*0.37 + h.y*0.91 + i*12.9898 + k*78.233)*43758.5453; return v - Math.floor(v); };
  const clamp = v => Math.max(0, Math.min(1, v)), weich = v => v*v*(3 - 2*v);
  const F = B.farben[B.art] || B.farben.gruen, deck = B.deckkraft[B.art] || 0.52, rippe = B.rippe[B.art] || B.rippe.gruen;
  c.save();
  const wx = h.x - x;   // Bild -> Welt (waagerecht)
  for(let i = 0; i < n; i++){
    const einAb = hs(i, 6)*B.einStreu, einD = B.einDauer + hs(i, 8)*0.35;
    const fallAb = B.fallAb + hs(i, 9)*B.fallStreu, fallD = B.fallDauer + hs(i, 10)*0.3;
    const e = clamp((t - einAb)/einD), f = clamp((t - fallAb)/fallD);
    if(e <= 0 || f >= 1) continue;
    const seite = hs(i, 7) < 0.5 ? -1 : 1, phi = hs(i, 12)*Math.PI*2, amp0 = B.pendel + hs(i, 13)*6;
    const w = (i + hs(i, 1)*0.5)/n*Math.PI*2, rr = range + (hs(i, 2) - 0.5)*4;
    let px = x + Math.cos(w)*rr, py = h.y + Math.sin(w)*rr;
    const gr = 5.5 + hs(i, 3)*3;
    // Platz an der Liane (geht vom Haken senkrecht nach oben): dort kein Blatt
    if(py < h.y && Math.abs(px - x) < B.lianeAbstand + gr) continue;
    // unterbrochen durch Boden/Wand/Stacheln (Nutzerwunsch): verdeckt ODER dahinter (vom Haken aus gesehen) -> kein Blatt
    if(!fotoRingFrei(h, w, rr)) continue;
    let dreh = w + Math.PI/2 + (hs(i, 4) - 0.5)*0.9 + Math.sin(zeit*1.1 + i*1.7)*0.1, wende = 1, a = 1;
    if(e < 1){   // fällt pendelnd von oben auf seinen Platz und setzt sich weich
      const th = e*(2.2 + hs(i, 11)*1.4)*Math.PI + phi, rest = Math.pow(1 - e, 1.3), amp = amp0*rest;
      py -= (B.einHoehe + hs(i, 14)*30)*Math.pow(1 - e, 2.1) + amp*0.22*Math.pow(Math.sin(th), 2);   // an den Umkehrpunkten kurz angehoben
      px += amp*Math.sin(th) - seite*8*rest;
      dreh += 0.7*Math.cos(th)*rest; wende = Math.cos((th*0.6 + phi)*rest*1.6);
      a = weich(clamp(e/0.3));
    }
    if(t > fallAb - B.zittern && f <= 0) dreh += Math.sin(zeit*38 + i)*0.09*clamp((t - fallAb + B.zittern)/B.zittern);   // zittert kurz, bevor es sich löst
    if(f > 0){   // löst sich, sinkt erst langsam, dann schneller, pendelt immer weiter aus und verblasst
      const th = f*(2.4 + hs(i, 15)*1.2)*Math.PI + phi, an = clamp(f*2.2), amp = amp0*1.25*an;
      py += (B.fallWeg + hs(i, 16)*40)*Math.pow(f, 1.6) - amp*0.22*Math.pow(Math.sin(th), 2);
      px += amp*Math.sin(th) + seite*10*f;
      dreh += 0.7*Math.cos(th)*an + seite*0.5*f; wende = Math.cos((th*0.6 + phi)*an*1.6);
      a *= 1 - weich(clamp((f - 0.45)/0.55));
    }
    if(a < 0.01) continue;
    if(fotoRingFest(px + wx, py)) continue;                                 // fliegt gerade hinter Boden/Wand/Stacheln
    if(py < h.y - 4 && Math.abs(px - x) < B.lianeAbstand*0.6) continue;   // nie über die Liane
    c.save(); c.globalAlpha = a; c.translate(px, py); c.rotate(dreh); c.scale(1, Math.max(0.12, Math.abs(wende)));   // wendet sich
    c.fillStyle = `rgba(${F[Math.floor(hs(i, 5)*F.length)]},${deck})`;
    c.beginPath(); c.moveTo(-gr, 0); c.quadraticCurveTo(-gr*0.1, -gr*0.6, gr, 0); c.quadraticCurveTo(gr*0.1, gr*0.5, -gr, 0); c.fill();
    if(wende < 0){ c.fillStyle = 'rgba(255,236,200,0.2)'; c.fill(); }   // Unterseite: heller, matter
    c.strokeStyle = `rgba(${rippe},0.4)`; c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(-gr*0.8, 0); c.lineTo(gr*0.8, 0); c.moveTo(-gr, 0); c.lineTo(-gr - 2.2, 0.6); c.stroke();   // Mittelrippe + Stiel
    c.restore();
  }
  c.restore();
}

function fotoTuerFuesse(q, x, y, w, h, vert, d){
  const F = FOTO_TUER_FUSS, an = d ? fotoTuerAnliegend(d) : {oben: true, unten: true, links: true, rechts: true};
  const zuf = (a, b) => { const v = Math.sin((a + (d ? d.x : x)*0.13)*12.9898 + (b + y*0.07)*78.233)*43758.5453; return v - Math.floor(v); };
  // seite: wo der Boden/die Wand liegt (+1 = unten/rechts, -1 = oben/links)
  const balken = (bx, by, bw, bh, quer, seite) => {
    const L = quer ? bw : bh, D = quer ? bh : bw;
    q.fillStyle = 'rgba(10,8,6,.5)'; q.fillRect(bx - 1, by - 1, bw + 2, bh + 2);                     // dunkle Fuge rundum
    q.fillStyle = fotoHolzMuster(q, quer, bx, by); q.fillRect(bx, by, bw, bh);
    q.fillStyle = 'rgba(20,14,8,.38)'; q.fillRect(bx, by, bw, bh);                                  // dunkler als die Tür (altes, nasses Holz)
    const g2 = quer ? q.createLinearGradient(0, by, 0, by + bh) : q.createLinearGradient(bx, 0, bx + bw, 0);
    g2.addColorStop(0, 'rgba(255,240,210,.2)'); g2.addColorStop(0.25, 'rgba(255,240,210,0)'); g2.addColorStop(1, 'rgba(0,0,0,.42)');
    q.fillStyle = g2; q.fillRect(bx, by, bw, bh);
    q.fillStyle = 'rgba(232,214,180,.28)'; q.fillRect(bx + (quer ? 1 : 0), by + (quer ? 0 : 1), quer ? bw - 2 : 1, quer ? 1 : bh - 2);   // abgegriffene helle Kante
    // Hirnholz an beiden Enden: hellere Schnittfläche mit Jahresringen
    for(const e of [0, 1]){
      const ex = quer ? (e ? bx + bw - 2.5 : bx) : bx, ey = quer ? by : (e ? by + bh - 2.5 : by), ew = quer ? 2.5 : bw, eh = quer ? bh : 2.5;
      q.fillStyle = 'rgba(150,118,82,.85)'; q.fillRect(ex, ey, ew, eh);
      q.strokeStyle = 'rgba(70,48,28,.7)'; q.lineWidth = 0.5;
      const mx = ex + ew/2, my = ey + eh/2;
      for(const rr of [D*0.18, D*0.34]){ q.beginPath(); q.ellipse(mx, my, quer ? 1 : rr, quer ? rr : 1, 0, 0, 7); q.stroke(); }
    }
    // Risse längs der Maserung
    q.strokeStyle = 'rgba(18,12,7,.6)'; q.lineWidth = 0.6;
    for(let i = 0; i < 2; i++){ const a = L*(0.2 + zuf(i, L)*0.6), l = 4 + zuf(L, i)*Math.min(10, L*0.25), o = D*(0.35 + zuf(i + 3, 1)*0.3);
      q.beginPath(); if(quer){ q.moveTo(bx + a, by + o); q.lineTo(bx + a + l, by + o + 0.6); } else { q.moveTo(bx + o, by + a); q.lineTo(bx + o + 0.6, by + a + l); } q.stroke(); }
    // zwei Vierkant-Bolzen mit Rostfahne
    for(const t of [0.1, 0.9]){
      const px = quer ? bx + bw*t : bx + bw/2, py = quer ? by + bh/2 : by + bh*t;
      q.fillStyle = 'rgba(120,60,24,.35)'; q.beginPath(); q.ellipse(px + (quer ? 0 : 0.6), py + (quer ? 1.6 : 0.6), 1.4, 2.4, 0, 0, 7); q.fill();   // Rostfahne
      q.fillStyle = '#1b1613'; q.fillRect(px - 1.7, py - 1.7, 3.4, 3.4);
      q.fillStyle = 'rgba(255,235,210,.35)'; q.fillRect(px - 1.5, py - 1.5, 1.4, 0.7);
    }
    // rostige Winkel vom Balken hinüber auf den Türrahmen (nur bei Sturz/Schwelle der stehenden Tür bzw. Seiten der liegenden)
    const W = F.winkel;
    if(quer){ const wy = seite > 0 ? by - W + 1 : by + bh - 1;
      fotoEisenBand(q, x + 0.5, wy, 3, W, 0); fotoEisenBand(q, x + w - 3.5, wy, 3, W, 0); }
    else { const wx = seite > 0 ? bx - W + 1 : bx + bw - 1;
      fotoEisenBand(q, wx, y + 0.5, W, 3, 0); fotoEisenBand(q, wx, y + h - 3.5, W, 3, 0); }
    // Moos: auf der Schwelle (oben drauf) bzw. unter dem Sturz hängende Fäden
    q.fillStyle = F.moos;
    if(quer && seite > 0){ for(let i = 0; i < 5; i++){ const mx = bx + zuf(i, 7)*bw; if(Math.abs(mx - (x + w/2)) < w*0.32) continue;
        q.beginPath(); q.ellipse(mx, by + 0.5, 2 + zuf(7, i)*2.5, 1.3 + zuf(i, i)*0.8, 0, 0, 7); q.fill(); } }
    else if(quer){ q.strokeStyle = 'rgba(70,86,40,.75)'; q.lineWidth = 0.8; q.lineCap = 'round';
      for(let i = 0; i < 4; i++){ const mx = bx + 2 + zuf(i, 9)*(bw - 4), l = 3 + zuf(9, i)*7; q.beginPath(); q.moveTo(mx, by + bh); q.quadraticCurveTo(mx + 1, by + bh + l*0.6, mx - 0.5, by + bh + l); q.stroke(); } }
    else { for(let i = 0; i < 3; i++){ const my = by + 2 + zuf(i, 11)*(bh - 4); q.beginPath(); q.ellipse(bx + (seite > 0 ? 1 : bw - 1), my, 1.2, 2 + zuf(11, i)*2, 0, 0, 7); q.fill(); } }
  };
  if(vert){
    if(an.oben) balken(x - F.ueber, y - F.rein, w + 2*F.ueber, F.dick, true, -1);                 // oben (Sturz)
    if(an.unten) balken(x - F.ueber, y + h - F.dick + F.rein, w + 2*F.ueber, F.dick, true, 1);    // unten (Schwelle)
  } else {
    if(an.links) balken(x - F.rein, y - F.ueber, F.dick, h + 2*F.ueber, false, -1);               // links
    if(an.rechts) balken(x + w - F.dick + F.rein, y - F.ueber, F.dick, h + 2*F.ueber, false, 1);  // rechts
  }
}
// rostiges Eisen: Band (x, y, w, h) mit Nieten im Abstand 'niet' (0 = keine)
function fotoEisenBand(q, x, y, w, h, niet){
  const g = q.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#5b5049'); g.addColorStop(0.35, '#3e352f'); g.addColorStop(1, '#231d19');
  q.fillStyle = g; q.fillRect(x, y, w, h);
  q.fillStyle = 'rgba(140,70,30,.35)'; for(let i = 0; i < w; i += 7) q.fillRect(x + i + ((i*13) % 5), y + h*0.3 + ((i*7) % 3), 3, h*0.5);   // Rostflecken
  q.fillStyle = 'rgba(255,240,220,.12)'; q.fillRect(x, y, w, Math.max(0.6, h*0.15));
  if(niet) for(let i = niet/2; i < w; i += niet){
    q.fillStyle = '#1b1613'; q.beginPath(); q.arc(x + i, y + h/2, h*0.22, 0, 7); q.fill();
    q.fillStyle = 'rgba(255,235,210,.35)'; q.beginPath(); q.arc(x + i - h*0.06, y + h/2 - h*0.07, h*0.08, 0, 7); q.fill();
  }
}
