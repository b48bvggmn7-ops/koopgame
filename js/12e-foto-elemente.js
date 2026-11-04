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
function fotoLiane(q, x0, y0, x1, y1, seed, dick){
  const D = dick || 5, len = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0)/len, ny = (x1 - x0)/len;
  const cx = (x0 + x1)/2 + nx*Math.min(10, len/30)*(Math.sin(seed*0.7) > 0 ? 1 : -1), cy = (y0 + y1)/2 + ny*4;
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
// Haken im Foto-Look: Liane von oben (oder vom Material darüber) bis zum rostigen Eisenring; Schein nur in Reichweite
// (spielwichtig: zeigt, dass der Affe greifen kann), sonst kaum
function fotoHakenZeichnen(x, y, y0, seed, ringR, inRange, hx){
  const x0 = x + Math.sin(seed*0.013)*3, dx = x0 - x, dy = y0 - y, d = Math.hypot(dx, dy) || 1;
  fotoLiane(ctx, x0, y0, x + dx/d*(ringR + 1), y + dy/d*(ringR + 1), seed, 5);
  const t = performance.now(), puls = inRange ? 0.7 + 0.3*Math.sin(t*0.008 + hx*0.05) : 0.12;
  const g = ctx.createRadialGradient(x, y, 2, x, y, 30); g.addColorStop(0, `rgba(255,236,190,${0.42*puls})`); g.addColorStop(1, 'rgba(255,236,190,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 30, 0, 7); ctx.fill();
  ctx.save();
  ctx.strokeStyle = 'rgba(12,9,7,.75)'; ctx.lineWidth = 7.5; ctx.beginPath(); ctx.arc(x, y + 0.6, ringR, 0, 7); ctx.stroke();
  const rg = ctx.createLinearGradient(x - ringR, y - ringR, x + ringR, y + ringR);
  rg.addColorStop(0, '#7a5a42'); rg.addColorStop(0.45, '#4d382b'); rg.addColorStop(1, '#2a1e17');
  ctx.strokeStyle = rg; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, ringR, 0, 7); ctx.stroke();
  for(let i = 0; i < 9; i++){ const a = i*0.7 + seed*0.01; ctx.fillStyle = i % 3 ? 'rgba(150,80,35,.55)' : 'rgba(40,30,22,.6)';
    ctx.beginPath(); ctx.arc(x + Math.cos(a)*ringR, y + Math.sin(a)*ringR, 1 + (i % 2)*0.6, 0, 7); ctx.fill(); }   // Rost
  ctx.strokeStyle = inRange ? 'rgba(255,240,215,.75)' : 'rgba(255,240,215,.28)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(x, y, ringR + 0.6, Math.PI*1.05, Math.PI*1.65); ctx.stroke();
  // Liane einmal um den Ring geschlungen
  ctx.strokeStyle = '#3e3326'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.ellipse(x, y - ringR + 1, 4, 2.6, 0, 0, 7); ctx.stroke();
  ctx.restore();
}
// ---------- Floß (Foto-Look, statt Blatt; aus blattBild in elemente/blattfloss.js) ----------
// Bretter quer über zwei Tragebalken, Stehfläche = y; schwankt wie das Blatt. Alles HINTER den Figuren ('vorne' = nichts).
function fotoFlossBild(q, x, y, w, schwank, teil){
  if(teil === 'vorne') return;
  q.save(); q.translate(x + w/2, y); q.rotate(schwank || 0);
  const L = w/2;
  q.fillStyle = 'rgba(10,8,6,.55)'; q.fillRect(-L - 2, -1, w + 4, 14);                 // dunkle Unterkante/Schatten
  q.fillStyle = fotoHolzMuster(q, true, -L, -3); q.fillRect(-L, -3, w, 11);            // Bretter (quer)
  q.fillStyle = 'rgba(0,0,0,.25)'; for(let i = 1; i < 6; i++) q.fillRect(-L + i*w/6 - 0.6, -3, 1.2, 11);   // Brettfugen
  for(const s of [-1, 1]){ q.fillStyle = fotoHolzMuster(q, false, s*(L - 14), 6); q.fillRect(s*(L - 14) - 5, 6, 10, 6); }   // Tragebalken unten
  const g = q.createLinearGradient(0, -3, 0, 12); g.addColorStop(0, 'rgba(255,240,210,.14)'); g.addColorStop(0.3, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
  q.fillStyle = g; q.fillRect(-L - 2, -3, w + 4, 15);
  q.restore();
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
