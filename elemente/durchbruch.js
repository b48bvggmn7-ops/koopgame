// elemente/durchbruch.js – Element „Durchbruch-Wand“ (Nacht-Ausbau; Punkt-Element mit eigener Auswahl, siehe 00-register.js).
// Rissige Steinkästchen: fest wie Boden/Wand, aber ein DASH zerbricht sie (Welten ohne Dash, DASH_AUS_WELTEN: der Affe PUSTET sie um) (normales Laufen/Springen nicht – dann ist es eine
// ganz normale Wand bzw. ein normaler Boden). Trefferstopp, Kamera-Wackeln, Bruchstücke und Staub, ein Teil des
// Dash-Schwungs bleibt (BRUCH_BEHALTEN); kurz danach geht ein Sprung in der Luft (BRUCH_FENSTER; der kostenlose Anschluss-Dash ist raus, Nutzerwunsch).
// Senkrecht (Wand), waagerecht (Boden, Decke) und in jeder Größe aus Kästchen baubar.
// Option „wächst nach“: nach X Sekunden ist das Kästchen wieder da – steht dort gerade jemand, wartet es (wie Türen und
// Wechselboden), niemand wird eingeklemmt. Standard: bleibt kaputt bis Neustart bzw. Tod (zurück zum Checkpoint).
// Die Bruch-Logik selbst (wann ein Dash bricht) steht in js/32-neue-bewegung.js (bruchTreffen).
// Rolle: wer dasht, bricht den Weg frei – beide Figuren können dashen; Rätsel trennen das z. B. so, dass der eine einen
// Hebel hält, während der andere die Wand im richtigen Moment durchbricht, oder der Durchbruch nur aus dem Seil-Schwung
// (Affe) bzw. aus dem Segeln (Schweinchen) erreichbar ist.
// Im Spiel: solids mit type 'bruch' {x, y, w, h, nachwachsen (s, 0 = nie), gone, bruchT, wartet}.
const BRUCH_LOOK = {
  dschungel: {hell: '#c8b08a', mitte: '#a38866', dunkel: '#5b4630', riss: '#3a2a1a', glut: null},
  ruinen:    {hell: '#e2c98f', mitte: '#c3a464', dunkel: '#7a6232', riss: '#4a3818', glut: null},
  hoehle:    {hell: '#a9b2c4', mitte: '#7f889c', dunkel: '#454b5c', riss: '#232733', glut: '#8fe3ff'},
  vulkan:    {hell: '#8a6a5a', mitte: '#664a3e', dunkel: '#382620', riss: '#1c1210', glut: '#ff8a3a'},
};
function bruchLook(){
  const w = (typeof levelLayers !== 'undefined' && levelLayers.welt) || (typeof levelTheme === 'string' ? levelTheme : 'dschungel');
  return BRUCH_LOOK[w] || BRUCH_LOOK[String(w).split('-')[0]] || BRUCH_LOOK.dschungel;
}
// feste Riss-Linien je Kästchen (aus der Lage, flackert nicht)
function bruchRisse(c, x, y, w, h, s, farbe, breite){
  let n = Math.abs(Math.floor(s*9301 + 49297)) % 233280;
  const rnd = () => (n = (n*9301 + 49297) % 233280) / 233280;
  c.save();
  if(farbe === 'erde'){
    for(let i = 0; i < (rnd() < .3 ? 1 : 2); i++){
      const px = x + 8 + rnd()*(w - 16), py = y + 14 + rnd()*(h - 22);
      for(let j = 0; j < 3; j++){ const qx = px + (rnd() - .5)*10, qy = py + (rnd() - .5)*6, r = 1.6 + rnd()*1.8;
        c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(qx + .4, qy + 1, r, r*.8, 0, 0, 7); c.fill();
        c.fillStyle = j ? 'rgba(206,176,134,.9)' : 'rgba(168,140,104,.95)'; c.beginPath(); c.ellipse(qx, qy, r, r*.8, 0, 0, 7); c.fill(); }
    }
  } else {
    // marode, modrige Wand: braune Tönung, dunklere Flecken unten, unregelmäßige Löcher und kurze Kratzer
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.fillStyle = 'rgba(78,56,30,.34)'; c.fillRect(x, y, w, h);
    const gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(34,24,12,.22)'); c.fillStyle = gr; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(96,104,48,.18)'; for(let i = 0; i < 2; i++){ c.beginPath(); c.ellipse(x + rnd()*w, y + rnd()*h, 5 + rnd()*5, 3 + rnd()*3, rnd()*3, 0, 7); c.fill(); }
    const nl = 2 + Math.floor(rnd()*2);
    for(let i = 0; i < nl; i++){
      const hx = x + 8 + rnd()*(w - 16), hy = y + 8 + rnd()*(h - 16), R = 3.2 + rnd()*3.4, pts = [];
      for(let j = 0; j < 8; j++){ const an = j/8*Math.PI*2, rr = R*(0.62 + rnd()*0.7); pts.push([hx + Math.cos(an)*rr*1.15, hy + Math.sin(an)*rr*0.85]); }
      const bahn = (dx, dy) => { c.beginPath(); pts.forEach((p, k) => k ? c.lineTo(p[0] + dx, p[1] + dy) : c.moveTo(p[0] + dx, p[1] + dy)); c.closePath(); };
      c.fillStyle = 'rgba(210,190,150,.4)'; bahn(.5, 1.3); c.fill();
      c.fillStyle = 'rgba(28,20,12,.9)'; bahn(0, 0); c.fill();
      c.fillStyle = 'rgba(0,0,0,.45)'; c.save(); c.translate(hx, hy); c.scale(.6, .6); c.translate(-hx, -hy); bahn(0, -.6); c.fill(); c.restore();
    }
    c.lineCap = 'round';
    { const bx = x + 5 + rnd()*(w - 22), by = y + 5 + rnd()*(h - 22), ang = 1.2 + rnd()*1.0;
      for(let k = 0; k < 2; k++){ const px = bx + k*3.2, py = by + rnd()*2, len = 8 + rnd()*9, ex = px + Math.cos(ang)*len, ey = py + Math.sin(ang)*len;
        c.strokeStyle = 'rgba(232,218,196,.34)'; c.lineWidth = .9; c.beginPath(); c.moveTo(px, py); c.lineTo(ex, ey); c.stroke();
        c.strokeStyle = 'rgba(10,6,4,.4)'; c.lineWidth = .8; c.beginPath(); c.moveTo(px + .8, py + .8); c.lineTo(ex + .8, ey + .8); c.stroke(); } }
  }
  c.restore();
}
// Nachwachsen (einmal pro Physik-Schritt, aus js/32-neue-bewegung.js)
function bruchNachwachsen(figuren){
  for(const s of solids){
    if(s.type !== 'bruch' || !s.gone || !(s.nachwachsen > 0)) continue;
    s.bruchT = (s.bruchT || 0) + 1;
    if(s.bruchT < s.nachwachsen*60) continue;
    if(figuren.some(p => p && rectsOverlap({x: p.x - p.w/2, y: p.y - p.h, w: p.w, h: p.h}, s))){ s.wartet = true; continue; }
    s.gone = false; s.wartet = false; s.bruchT = 0; s.neuT = 12;
    if(typeof SFX !== 'undefined' && SFX.bruchZurueck) SFX.bruchZurueck(s.x + s.w/2);
  }
}
const __matC = {};
function matTile(kind, seed){
  const key = kind + seed; if(__matC[key]) return __matC[key];
  const c = document.createElement('canvas'); c.width = c.height = 80; const q = c.getContext('2d'); q.setTransform(2,0,0,2,0,0);
  const sv = g; g = q; const r = rnd(seed);
  if(kind === 'wall') wallTile({x:0, y:0}, r, wallK);
  else { q.fillStyle = SOILBASE[soilK]; q.fillRect(0,0,40,40); grain(q, 0, 0, r); }
  g = sv; return __matC[key] = c;
}
function grasKappe(x, y, w, wx, farben, c){
  const F = farben || EA, q2 = c || ctx; q2.save(); q2.beginPath(); q2.rect(x, y - 3, w, 22); q2.clip();
  q2.beginPath(); q2.moveTo(x, y - 3); q2.lineTo(x + w, y - 3); for(let px = w; px >= 0; px -= 5) q2.lineTo(x + px, y + 12 + waveY(wx + px)); q2.closePath(); q2.fillStyle = F.grass; q2.fill();
  q2.strokeStyle = F.gd; q2.lineWidth = 2.5; q2.beginPath(); for(let px = 0; px <= w; px += 5){ px ? q2.lineTo(x + px, y + 13 + waveY(wx + px)) : q2.moveTo(x + px, y + 13 + waveY(wx + px)); } q2.stroke();
  q2.fillStyle = F.gt; q2.fillRect(x, y + 2, w, 3); q2.restore();
}
function matBlock(x, y, w, h, kind, seed, a, nachbarn){ // Kachelraster aus echtem Material
  ctx.save(); ctx.globalAlpha = a;
  for(let cx = 0; cx < w; cx += 40) for(let cy = 0; cy < h; cy += 40) ctx.drawImage(matTile(kind, seed + ((x + cx)*7 + (y + cy)*13 | 0) % 5), x + cx, y + cy, 40, 40);
  ctx.restore();
}
const __bruchT = {};
function bruchKachel(v, va){   // marode Wandkachel, drei Entwürfe (va 0/1/2), einmal gezeichnet, KEINE Löcher
  const key = va + '_' + v; if(__bruchT[key]) return __bruchT[key];
  const c = document.createElement('canvas'); c.width = c.height = 80; const q = c.getContext('2d'); q.setTransform(2,0,0,2,0,0);
  const sv = g; g = q; const r = rnd(900 + v + va*50); wallTile({x:0, y:0}, r, wallK); g = sv;
  const blobP = (cx, cy, rad, n) => { const P = []; for(let i = 0; i < n; i++){ const a = i/n*Math.PI*2, rr = rad*(0.62 + r()*0.5); P.push([cx + Math.cos(a)*rr*1.25, cy + Math.sin(a)*rr*0.85]); } return P; };
  const blob = (P) => { q.beginPath(); P.forEach((pt, i) => i ? q.lineTo(pt[0], pt[1]) : q.moveTo(pt[0], pt[1])); q.closePath(); };
  const ziegel = (fn) => { for(let j = 0; j < 4; j++){ const off = (j & 1) ? 10 : 0; for(let bx = off - 20; bx < 40; bx += 20){ const x0 = Math.max(0, bx + 1), x1 = Math.min(40, bx + 19), y0 = j*10 + 1; if(x1 - x0 >= 3) fn(x0, x1, y0, j, bx); } } };
  let mCol = 'rgba(78,102,34,.92)', mSpk = 'rgba(158,188,78,.7)';
  const moosBand = (mx, my, mw, h) => { q.fillStyle = mCol; q.beginPath(); q.moveTo(mx, my - 1); for(let i = 0; i <= 8; i++) q.lineTo(mx + mw*i/8, my + h*(0.5 + 0.5*Math.sin(i*2.3 + r()*3)) + (i % 2 ? 1 : 0)); q.lineTo(mx + mw, my - 1); q.closePath(); q.fill();
    q.fillStyle = mSpk; for(let i = 0; i < mw/3; i++) q.fillRect(mx + r()*mw, my - .5 + r()*h*.6, 1, 1); };
  const vor = (x0, x1, y0, tief) => { q.fillStyle = 'rgba(12,7,3,.55)'; q.fillRect(x0 - tief, y0 + 8 - 1, x1 - x0 + tief, 1.2 + tief); q.fillRect(x0 - tief, y0, tief + .4, 8); q.fillStyle = 'rgba(255,236,200,.25)'; q.fillRect(x0 + 1, y0, x1 - x0 - 1, 1.2); };
  const basis = (tint, gruen, dunkel) => { q.fillStyle = tint; q.fillRect(0, 0, 40, 40);
    ziegel((x0, x1, y0) => { const u = r(); if(u < gruen){ q.fillStyle = 'rgba(70,98,32,.38)'; q.fillRect(x0, y0, x1 - x0, 8); } else if(u < gruen + dunkel){ q.fillStyle = 'rgba(30,20,8,.3)'; q.fillRect(x0, y0, x1 - x0, 8); } if(r() < .25) vor(x0, x1, y0, 1.2); }); };
  if(va === 0){
    // 1 dichter: frisches, helleres Moos, zwei Bänder pro Fuge, Moos wächst auch oben auf den vorstehenden Ziegeln
    mCol = 'rgba(96,128,40,.95)'; mSpk = 'rgba(204,230,110,.8)';
    basis('rgba(62,72,22,.5)', .5, .15);
    for(let j = 0; j < 4; j++) for(let k = 0; k < 3; k++) if(r() < .85) moosBand(r()*22 + k*2, j*10, 12 + r()*18, 3.4);
    for(let i = 0; i < 5; i++){ const px = r()*34, py = r()*36; moosBand(px, py, 6 + r()*6, 2); }
  } else if(va === 1){
    // 2 feucht: dunkler, nass glänzend, dunkle Tropfspuren laufen von den Fugen nach unten, dunkles Moos
    mCol = 'rgba(52,74,24,.95)'; mSpk = 'rgba(120,152,64,.6)';
    basis('rgba(52,50,22,.36)', .3, .2);
    for(let i = 0; i < 4; i++){ const sx = 3 + r()*34, sy = Math.floor(r()*3)*10 + 1, len = 12 + r()*18; const gr = q.createLinearGradient(0, sy, 0, sy + len); gr.addColorStop(0, 'rgba(8,10,4,.6)'); gr.addColorStop(1, 'rgba(8,10,4,0)'); q.fillStyle = gr; q.fillRect(sx, sy, 1.8 + r()*1.6, len); }
    ziegel((x0, x1, y0) => { if(r() < .3){ q.fillStyle = 'rgba(210,235,230,.3)'; q.fillRect(x0 + 2, y0 + 1, 4 + r()*5, 1.3); } });
    for(let j = 0; j < 4; j++) for(let k = 0; k < 2; k++) if(r() < .7) moosBand(r()*16 + k*2, j*10, 12 + r()*16, 2.8);
  } else {
    // 3 Blüten: wie 1 (kräftig), aber im Moos wachsen winzige weiße Blümchen und kleine Pilze
    mCol = 'rgba(78,102,34,.92)'; mSpk = 'rgba(158,188,78,.7)';
    basis('rgba(62,68,22,.5)', .4, .2);
    const orte = [];
    for(let j = 0; j < 4; j++) for(let k = 0; k < 2; k++) if(r() < .75){ const mx = r()*16 + k*2, mw = 12 + r()*16; moosBand(mx, j*10, mw, 2.8); orte.push([mx + mw*(.2 + r()*.6), j*10 + 1]); }
    orte.slice(0, 3).forEach((o, i) => { const x = o[0], y = o[1];
      if(i % 2 === 0){ q.fillStyle = '#fff8e8'; for(let k = 0; k < 5; k++){ const a = k*1.2566; q.beginPath(); q.arc(x + Math.cos(a)*1.5, y - 1.5 + Math.sin(a)*1.5, 1, 0, 7); q.fill(); } q.fillStyle = '#f2b830'; q.beginPath(); q.arc(x, y - 1.5, .9, 0, 7); q.fill(); }
      else { q.fillStyle = '#efe2c4'; q.fillRect(x - .6, y - 2, 1.2, 3); q.fillStyle = '#d65a3a'; q.beginPath(); q.ellipse(x, y - 2.2, 2.6, 1.7, 0, Math.PI, 0); q.fill(); q.fillStyle = 'rgba(255,255,255,.85)'; q.fillRect(x - 1, y - 3.2, .8, .8); } });
  }
  return __bruchT[key] = c;
}
function bruchVariante(s){ return 1; }   // gewählt: Entwurf 2 „Feucht“
function bruchZeichnen(){
  for(const s of solids){
    if(s.type !== 'bruch') continue;
    let x = Math.round(s.x - camX);
    if(x + s.w < -20 || x > VW + 20) continue;
    if(!s.gone && s.pusteDruck > 0) x += Math.sin(performance.now()*0.09 + s.y)*2.2*Math.min(1, s.pusteDruck/BRUCH_PUSTE_NOETIG + 0.3);   // wackelt im Wind
    if(s.gone){
      if(!(s.nachwachsen > 0)) continue;
      const k = Math.min(1, (s.bruchT || 0)/(s.nachwachsen*60));
      ctx.save(); ctx.globalAlpha = (s.wartet ? 0.5 + 0.3*Math.sin(performance.now()/90) : 0.35)*.8; ctx.fillStyle = '#6b5a48';
      ctx.fillRect(x + 3, s.y + s.h - 3 - (s.h - 6)*k, s.w - 6, (s.h - 6)*k); ctx.restore(); continue;
    }
    // Ecken (Nutzerwunsch): frei hängende Ecken rund wie Wand/Boden, wo sie an Wand, Boden, Bröckelboden oder eine andere
    // Durchbruch-Wand stößt gerade (kachelRad aus 12-welt-zeichnen.js)
    for(let cx = 0; cx < s.w; cx += 40) for(let cy = 0; cy < s.h; cy += 40){
      const rad = typeof kachelRad === 'function' ? kachelRad(Math.floor((s.x + cx)/40 + 1e-6), Math.floor((s.y + cy)/40 + 1e-6)) : [0, 0, 0, 0];
      const bild = bruchKachel(Math.abs(((s.x + cx)*7 + (s.y + cy)*13)|0) % 6, bruchVariante(s));
      if(rad.some(v => v)){ ctx.save(); ctx.beginPath(); ctx.roundRect(x + cx, s.y + cy, 40, 40, rad); ctx.clip(); ctx.drawImage(bild, x + cx, s.y + cy, 40, 40); ctx.restore(); }
      else ctx.drawImage(bild, x + cx, s.y + cy, 40, 40);
    }
    { const l = ((s.x - 200) % 1200 + 1200) % 1200;
      if(false && s.y === 520 && (l === 80 || l === 320 || l === 560) && s.x - 200 > 0 && ((s.x - 200) % 1200) === l){ ctx.save(); ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 3; const t2 = l === 80 ? '1  Dichter' : l === 320 ? '2  Feucht' : '3  Blümchen & Pilze'; ctx.strokeText(t2, x, s.y - 10); ctx.fillText(t2, x, s.y - 10); ctx.restore(); } }
    if(s.neuT > 0){ s.neuT -= 0.5; ctx.globalAlpha = s.neuT/12*0.5; ctx.fillStyle = '#fff'; ctx.fillRect(x, s.y, s.w, s.h); ctx.globalAlpha = 1; }
  }
}
// Pusten bricht Durchbruch-Wände (Nutzerwunsch, seit der Dash im Dschungel aus ist): trifft der Puste-Wind des Affen ein
// Kästchen, sammelt es Druck (wackelt dabei); nach BRUCH_PUSTE_NOETIG Schritten voller Wind bricht die ganze zusammenhängende Wand.
function bruchPustenSchritt(){
  const st = typeof pusteStrahlJetzt !== 'undefined' ? pusteStrahlJetzt : null;
  for(const s of solids){
    if(s.type !== 'bruch' || s.gone) continue;
    const k = st && typeof pusteTrifft === 'function' ? pusteTrifft(s) : 0;
    if(k > 0){
      s.pusteDruck = (s.pusteDruck || 0) + k;
      if(s.pusteDruck >= BRUCH_PUSTE_NOETIG) bruchWandZerbrechen(s, typeof pusteSeiteVon === 'function' ? pusteSeiteVon(st.dir) : 0, st.dir === 'hoch' ? -1 : 0);
    } else if(s.pusteDruck) s.pusteDruck = Math.max(0, s.pusteDruck - 0.5);
  }
}
function bruchWandZerbrechen(start, dx, dy){   // ganze zusammenhängende Durchbruch-Wand (Kästchen, die sich berühren)
  const offen = [start], seen = new Set([start]);
  while(offen.length){
    const s = offen.pop();
    if(typeof bruchZerbrechen === 'function') bruchZerbrechen(s, dx, dy); else s.gone = true;
    s.pusteDruck = 0;
    for(const o of solids){
      if(o.type !== 'bruch' || o.gone || seen.has(o)) continue;
      const beruehrt = o.x <= s.x + s.w + 0.5 && o.x + o.w >= s.x - 0.5 && o.y <= s.y + s.h + 0.5 && o.y + o.h >= s.y - 0.5 &&
                       !(Math.abs(o.x - (s.x + s.w)) < 0.5 && Math.abs(o.y - (s.y + s.h)) < 0.5);   // keine Ecken
      if(beruehrt){ seen.add(o); offen.push(o); }
    }
  }
  if(typeof kameraStoss === 'function') kameraStoss(6);
}
ELEMENT_SOLID_TYPEN.add('bruch');
elementRegistrieren({
  id: 'durchbruch', name: 'Durchbruch-Wand', feld: 'bruchWaende',
  editor: {
    werkzeug: 'bruch', gruppe: 'gelaende', vor: 'fake', art: 'punkt', ziehbar: true,
    titel: 'Durchbruch-Wand: fest wie eine Wand, aber ein Dash zerbricht sie (im Dschungel ohne Dash: der Affe pustet sie um; Laufen/Springen nicht). Senkrecht oder waagerecht bauen. ' +
           'Option: bleibt kaputt (bis Neustart/Tod) oder wächst nach X Sekunden nach (wartet, wenn jemand drin steht)',
    farbe: '#a38866',
    optionen: [
      {key: 'nachwachsen', label: 'Nach dem Bruch', zahl: true, titel: 'bleibt kaputt (bis Neustart oder Tod) oder wächst nach X Sekunden wieder nach',
       werte: [['0', 'bleibt kaputt'], ['2', 'wächst nach 2 s'], ['3', 'wächst nach 3 s'], ['5', 'wächst nach 5 s'], ['8', 'wächst nach 8 s']]},
    ],
    zeichnen(ctx, c, r, TILE, p){
      const X = c*TILE, Y = r*TILE;
      ctx.fillStyle = '#a38866'; ctx.fillRect(X + 1, Y + 1, TILE - 2, TILE - 2);
      bruchRisse(ctx, X, Y, TILE, TILE, c*13 + r*7, '#3a2a1a', 2);
      ctx.strokeStyle = '#5b4630'; ctx.lineWidth = 2; ctx.strokeRect(X + 2, Y + 2, TILE - 4, TILE - 4);
      if(p && p.nachwachsen > 0){
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('↻' + p.nachwachsen, X + TILE/2, Y + TILE/2 + 1);
      }
    },
    // Spiel-Format: je Kästchen ein Rechteck (obere linke Ecke); nachwachsen nur, wenn gesetzt (abwärtskompatibel)
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, w: TILE, h: TILE, ...(p.nachwachsen > 0 ? {nachwachsen: Number(p.nachwachsen)} : {})})),
  },
  spiel: {
    laden(daten){
      for(const b of (daten.bruchWaende || []))
        solids.push({x: b.x, y: b.y, w: b.w || 40, h: b.h || 40, type: 'bruch', nachwachsen: Number(b.nachwachsen) || 0, gone: false, bruchT: 0, wartet: false});
    },
    zuruecksetzen(){ for(const s of solids) if(s.type === 'bruch'){ s.gone = false; s.bruchT = 0; s.wartet = false; s.neuT = 0; s.pusteDruck = 0; } },
    schritt: bruchPustenSchritt,
    zeichnen: bruchZeichnen,
  },
});
