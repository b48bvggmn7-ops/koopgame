// 11a-welt-details.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Design-Politur D: Details je Welt ----------
// 1) Details, einmal vorgezeichnet in die mittlere Hintergrund-Ebene (Parallaxe der Bäume):
//    Dschungel/Wasser: Lianen mit Blättern, Orchideen (violett/gelb), Moospolster, Tautropfen
//    Ruinen: Säulenreste mit Hieroglyphen und Rissen, Fackeln (flackern), Sandstaub-Schleier
//    Höhle: Tropfsteine von oben, Leuchtpilz-Gruppen, Nebelband
//    Vulkan: Felsen mit glühenden Rissen, Rauchfahnen
// 2) bewegte Kleinigkeiten pro Bild (nur Zeichnen, Zeit aus performance.now): Wasserfall-Regenbogen und Nebel,
//    Fackel-Flackern, fallende Tropfen, Sandstaub, Ascheflocken und Funken
// 3) Vordergrund NUR am unteren Bildrand (Nutzerwunsch): dunkle, weiche Farn-/Fels-Silhouetten unterhalb der
//    Bodenoberkante – liegen nie auf Münzen, Hebeln, Checkpoints oder Türen.
// Alles im Hintergrund bleibt weich und dunstig (das Spielfeld hat den klarsten Kontrast).
const VORDERGRUND_PAR = 1.25;     // Vordergrund bewegt sich schneller als die Welt (wirkt näher)
const VORDERGRUND_H = 30;         // höchstens so hoch (Bildschirm-Pixel) – unterhalb der Bodenoberkante
const BG_FACKELN = [];            // {x, y} in Ebenen-Koordinaten der Detail-Ebene
const BG_TROPFEN = [];            // {x, y} Tropfstein-Spitzen (Höhle)
let detailEbene = null, vordergrundBild = null, detailWelt = null;

function detailFarben(welt){
  return {
    dschungel: {liane: '#3f6b3a', blatt: ['#4f8a45', '#6aa556'], moos: ['#5d9a4a', '#7cb860'], bluete: ['#b46ad8', '#ffd84a', '#e889c9'], tau: 'rgba(255,255,255,.75)', vorne: '#1e3a22'},
    wasser:    {liane: '#3a6f5e', blatt: ['#4f9a7a', '#6fbf96'], moos: ['#4fa88a', '#78c9a6'], bluete: ['#c27ae0', '#ffe066', '#ff9fc8'], tau: 'rgba(255,255,255,.75)', vorne: '#1d3d38'},
    ruinen:    {stein: ['#c9b48a', '#a8916a', '#8a7552'], ritz: 'rgba(80,58,30,.55)', moos: ['#7a9a4a', '#98b85e'], vorne: '#3a2e1c'},
    hoehle:    {zapfen: ['#3e3456', '#2c2440', '#4c4268'], pilz: ['#7ef0e0', '#c49aff'], vorne: '#0f0c1a'},
    vulkan:    {fels: ['#2e2226', '#22181a'], glut: ['#ff7a2a', '#ffc04a'], rauch: 'rgba(70,56,56,.35)', vorne: '#140a0a'},
  }[welt] || null;
}

// --- Detail-Ebene (einmal gezeichnet) ---
function bgDetail(g, welt){
  const F = detailFarben(welt); if(!F) return;
  const rnd = bgRand(97);
  BG_FACKELN.length = 0; BG_TROPFEN.length = 0;
  if(welt === 'dschungel' || welt === 'wasser'){
    for(let i = 0; i < 9; i++){   // Lianen von oben, mit Blättern und Blüten
      const x = i*178 + rnd()*80, len = 160 + rnd()*220, sw = (rnd() - 0.5)*40;
      const bl = Array.from({length: 9}, () => rnd());
      bgWrap(x, X => {
        g.strokeStyle = F.liane; g.lineWidth = 3; g.lineCap = 'round';
        g.beginPath(); g.moveTo(X, -10); g.bezierCurveTo(X + sw, len*0.35, X - sw, len*0.7, X + sw*0.3, len); g.stroke();
        for(let k = 0; k < 9; k++){
          const q = 0.12 + k*0.1, u = 1 - q;
          const px = u*u*u*X + 3*u*u*q*(X + sw) + 3*u*q*q*(X - sw) + q*q*q*(X + sw*0.3), py = -10*u*u*u + 3*u*u*q*len*0.35 + 3*u*q*q*len*0.7 + q*q*q*len;
          const side = k % 2 ? 1 : -1;
          g.fillStyle = F.blatt[k % 2];
          g.beginPath(); g.ellipse(px + side*7, py, 8, 3.6, side*0.6, 0, Math.PI*2); g.fill();
          if(bl[k] < 0.22){   // Orchidee
            const c = F.bluete[Math.floor(bl[k]*13) % F.bluete.length];
            g.fillStyle = c;
            for(let p = 0; p < 5; p++){ const a = p*Math.PI*2/5; g.beginPath(); g.ellipse(px - side*6 + Math.cos(a)*4, py + Math.sin(a)*4, 3.6, 2.2, a, 0, Math.PI*2); g.fill(); }
            g.fillStyle = '#fff6c0'; g.beginPath(); g.arc(px - side*6, py, 1.6, 0, Math.PI*2); g.fill();
          }
          if(bl[k] > 0.8){ g.fillStyle = F.tau; g.beginPath(); g.arc(px + side*10, py + 3, 1.3, 0, Math.PI*2); g.fill(); }   // Tautropfen
        }
      });
    }
    for(let i = 0; i < 18; i++){   // Moospolster unten mit Blüten
      const x = i*92 + rnd()*40, y = 640 + rnd()*30, r = 26 + rnd()*20;
      bgWrap(x, X => {
        bgFoliage(g, X, y, r*1.4, r*0.6, 900 + i, [F.moos[0], F.moos[0], F.moos[1], F.moos[1]]);
        if(i % 3 === 0){ g.fillStyle = F.bluete[i % F.bluete.length]; g.beginPath(); g.arc(X + 6, y - r*0.4, 3.2, 0, Math.PI*2); g.fill(); }
      });
    }
  } else if(welt === 'ruinen'){
    for(let i = 0; i < 6; i++){   // Säulenreste mit Hieroglyphen, Rissen und Fackeln
      const x = i*270 + rnd()*90, h = 120 + rnd()*160, w = 34 + rnd()*14, top = 640 - h, fackel = i % 2 === 0;
      const zeichen = Array.from({length: 8}, () => Math.floor(rnd()*4));
      bgWrap(x, X => {
        const sg = g.createLinearGradient(X - w/2, 0, X + w/2, 0);
        sg.addColorStop(0, F.stein[0]); sg.addColorStop(0.6, F.stein[1]); sg.addColorStop(1, F.stein[2]);
        g.fillStyle = sg;
        g.beginPath(); g.moveTo(X - w/2, 700); g.lineTo(X - w/2, top + 10); g.lineTo(X - w/4, top - 4); g.lineTo(X + 2, top + 8); g.lineTo(X + w/3, top - 10); g.lineTo(X + w/2, top + 6); g.lineTo(X + w/2, 700); g.closePath(); g.fill();
        g.fillStyle = F.ritz; g.strokeStyle = F.ritz; g.lineWidth = 1.4;
        for(let k = 0; k < 8; k++){   // Hieroglyphen: Auge, Welle, Vogel, Kreis
          const zy = top + 26 + k*((h - 50)/8), zx = X - 6;
          if(zy > 690) break;
          g.beginPath();
          if(zeichen[k] === 0){ g.ellipse(zx + 6, zy, 6, 3, 0, 0, Math.PI*2); g.stroke(); g.beginPath(); g.arc(zx + 6, zy, 1.4, 0, Math.PI*2); g.fill(); }
          else if(zeichen[k] === 1){ g.moveTo(zx, zy); g.quadraticCurveTo(zx + 3, zy - 4, zx + 6, zy); g.quadraticCurveTo(zx + 9, zy + 4, zx + 12, zy); g.stroke(); }
          else if(zeichen[k] === 2){ g.moveTo(zx + 1, zy + 3); g.lineTo(zx + 6, zy - 3); g.lineTo(zx + 11, zy + 3); g.moveTo(zx + 6, zy - 3); g.lineTo(zx + 6, zy + 4); g.stroke(); }
          else { g.arc(zx + 6, zy, 3.5, 0, Math.PI*2); g.stroke(); }
        }
        g.beginPath(); g.moveTo(X + w*0.2, top + 12); g.lineTo(X + w*0.05, top + h*0.3); g.lineTo(X + w*0.25, top + h*0.45); g.lineTo(X + w*0.1, top + h*0.6); g.stroke();   // Riss
        bgFoliage(g, X - w*0.3, top + 6, w*0.5, 9, 700 + i, [F.moos[0], F.moos[0], F.moos[1], F.moos[1]]);   // Moos oben
        if(fackel){
          g.fillStyle = '#4a3420'; g.fillRect(X + w/2, top + 36, 12, 4); g.fillRect(X + w/2 + 8, top + 22, 4, 16);
          if(X > -50 && X < BG_TW + 50) BG_FACKELN.push({x: X + w/2 + 10, y: top + 20});
        }
      });
    }
  } else if(welt === 'hoehle'){
    for(let i = 0; i < 16; i++){   // Tropfsteine von oben
      const x = i*100 + rnd()*60, len = 50 + rnd()*120, w = 10 + rnd()*16;
      bgWrap(x, X => {
        g.fillStyle = F.zapfen[i % 3];
        g.beginPath(); g.moveTo(X - w, -5); g.quadraticCurveTo(X - w*0.3, len*0.6, X, len); g.quadraticCurveTo(X + w*0.3, len*0.6, X + w, -5); g.closePath(); g.fill();
        g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(X - w*0.5, 0); g.quadraticCurveTo(X - w*0.2, len*0.5, X - 1, len - 4); g.lineTo(X - w*0.1, 0); g.fill();
        if(X > -20 && X < BG_TW + 20 && i % 2 === 0) BG_TROPFEN.push({x: X, y: len});
      });
    }
    for(let i = 0; i < 10; i++){   // Leuchtpilz-Gruppen
      const x = i*160 + rnd()*60, y = 650 + rnd()*30, col = F.pilz[i % 2];
      bgWrap(x, X => {
        const gl = g.createRadialGradient(X, y - 8, 0, X, y - 8, 34);
        gl.addColorStop(0, col + '55'); gl.addColorStop(1, col + '00');
        g.fillStyle = gl; g.fillRect(X - 34, y - 42, 68, 68);
        for(let k = 0; k < 3; k++){
          const mx = X + (k - 1)*9, mh = 8 + k*3;
          g.fillStyle = '#d8d0e8'; g.fillRect(mx - 1, y - mh, 2, mh);
          g.fillStyle = col; g.beginPath(); g.ellipse(mx, y - mh, 5 + k, 3, 0, Math.PI, Math.PI*2); g.fill();
        }
      });
    }
  } else if(welt === 'vulkan'){
    for(let i = 0; i < 8; i++){   // Felsen mit glühenden Rissen
      const x = i*205 + rnd()*70, w = 70 + rnd()*60, h = 50 + rnd()*60;
      const risse = Array.from({length: 3}, () => [rnd(), rnd()]);
      bgWrap(x, X => {
        g.fillStyle = F.fels[i % 2];
        g.beginPath(); g.moveTo(X - w, 700); g.quadraticCurveTo(X - w*0.7, 700 - h, X, 700 - h*1.05); g.quadraticCurveTo(X + w*0.6, 700 - h*0.9, X + w, 700); g.closePath(); g.fill();
        g.lineCap = 'round';
        for(const [a, b] of risse){
          const sx = X - w*0.5 + a*w, sy = 700 - h*0.2 - b*h*0.6;
          g.strokeStyle = 'rgba(255,90,30,.35)'; g.lineWidth = 5;
          g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + 8, sy + 10); g.lineTo(sx + 2, sy + 20); g.stroke();
          g.strokeStyle = F.glut[1]; g.lineWidth = 1.6; g.stroke();
        }
      });
    }
    for(let i = 0; i < 5; i++){   // Rauchfahnen
      const x = i*330 + rnd()*100;
      bgWrap(x, X => { for(let k = 0; k < 6; k++){ g.fillStyle = F.rauch; g.beginPath(); g.ellipse(X + Math.sin(k*1.3)*16 + k*6, 640 - k*40, 18 + k*7, 12 + k*4, 0, 0, Math.PI*2); g.fill(); } });
    }
  }
  bgBlur(g, 0.6);
}
// Die Details werden in die mittlere Ebene gemalt (eigene Ebene wäre eine Bildfläche mehr – das macht das Zeichnen
// im Browser spürbar langsamer); buildBackground (11-hintergrund.js) meldet die Ebene hier an
function detailEbeneSetzen(L, welt){
  detailEbene = L; detailWelt = welt;
  vordergrundBild = vordergrundBauen(welt);
}
// --- bewegte Kleinigkeiten (pro Bild, nur Zeichnen) ---
function detailBewegt(off, t){
  const W2 = BG_TW;
  // Fackeln flackern
  for(const f of BG_FACKELN) for(const base of [0, W2]){
    const x = f.x - off + base; if(x < -40 || x > W + 40) continue;
    const fl = 0.75 + 0.25*Math.sin(t*0.017 + f.x) * Math.sin(t*0.011 + f.y);
    const gl = ctx.createRadialGradient(x, f.y, 0, x, f.y, 34*fl);
    gl.addColorStop(0, 'rgba(255,190,90,.55)'); gl.addColorStop(1, 'rgba(255,140,40,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, f.y, 34*fl, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.moveTo(x - 4, f.y + 2); ctx.quadraticCurveTo(x, f.y - 14*fl, x + 4, f.y + 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff1b0'; ctx.beginPath(); ctx.ellipse(x, f.y - 1, 1.6, 4*fl, 0, 0, Math.PI*2); ctx.fill();
  }
  // Tropfen fallen von den Tropfsteinen
  ctx.fillStyle = 'rgba(190,220,255,.7)';
  for(const d of BG_TROPFEN) for(const base of [0, W2]){
    const x = d.x - off + base; if(x < -10 || x > W + 10) continue;
    const P = 2600 + (d.x % 7)*300, k = ((t + d.x*37) % P)/P;
    if(k < 0.5){ ctx.globalAlpha = 0.4 + k; ctx.beginPath(); ctx.ellipse(x, d.y + 2 + k*4, 1.6, 2.4, 0, 0, Math.PI*2); ctx.fill(); }
    else { const fy = d.y + 4 + (k - 0.5)*2*(600 - d.y); ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.ellipse(x, fy, 1.2, 3.2, 0, 0, Math.PI*2); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}
// Wasserfall: Nebel, Sprühregen und (bei Tag) ein kleiner Regenbogen in der Gischt
function wasserfallExtras(x, wf, t){
  for(let i = 0; i < 5; i++){   // aufsteigender Nebel
    const ph = (t*0.0006 + i*0.2) % 1;
    ctx.fillStyle = `rgba(255,255,255,${(0.16*(1 - ph)).toFixed(3)})`;
    ctx.beginPath(); ctx.ellipse(x + (i - 2)*22 + Math.sin(t*0.001 + i)*6, wf.bottom - 20 - ph*60, 26 + ph*30, 12 + ph*10, 0, 0, Math.PI*2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,.6)';   // Sprühtropfen
  for(let i = 0; i < 10; i++){
    const ph = ((t*0.0015 + i*0.1) % 1), a = -Math.PI/2 + (i - 4.5)*0.28;
    ctx.beginPath(); ctx.arc(x + Math.cos(a)*ph*40, wf.bottom - 6 + Math.sin(a)*ph*30 + ph*ph*30, 1.3, 0, Math.PI*2); ctx.fill();
  }
  if(!THEME.dark){
    const cols = ['255,80,80', '255,170,60', '255,240,90', '110,220,110', '90,160,255', '170,110,240'];
    ctx.save(); ctx.globalAlpha = 0.16 + 0.05*Math.sin(t*0.0007); ctx.lineWidth = 2.2;
    cols.forEach((c, k) => { ctx.strokeStyle = `rgb(${c})`; ctx.beginPath(); ctx.arc(x + 10, wf.bottom + 10, 62 - k*2.4, Math.PI*1.08, Math.PI*1.72); ctx.stroke(); });
    ctx.restore();
  }
}
// Sandstaub (Ruinen), Asche und Funken (Vulkan) – zeitbasiert, kein Zustand
function detailTeilchen(t){
  const w = detailWelt;
  if(w === 'ruinen'){
    for(let i = 0; i < 26; i++){
      const P = 9000 + (i % 5)*1500, k = ((t + i*977) % P)/P;
      const x = ((i*173 + k*W*1.3 - camX*0.5) % (W + 40) + W + 40) % (W + 40) - 20, y = 200 + (i*61 % 420) + Math.sin(k*Math.PI*4 + i)*10;
      ctx.fillStyle = `rgba(240,220,170,${(0.25*Math.sin(k*Math.PI)).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, 1.2 + (i % 3)*0.6, 0, Math.PI*2); ctx.fill();
    }
  } else if(w === 'vulkan'){
    for(let i = 0; i < 30; i++){   // Asche fällt
      const P = 7000 + (i % 6)*900, k = ((t + i*1231) % P)/P;
      const x = ((i*131 + Math.sin(k*6 + i)*30 - camX*0.6) % (W + 40) + W + 40) % (W + 40) - 20, y = -20 + k*(H + 40);
      ctx.fillStyle = 'rgba(190,180,175,.45)'; ctx.fillRect(x, y, 2, 2);
    }
    for(let i = 0; i < 14; i++){   // Funken steigen
      const P = 3000 + (i % 4)*700, k = ((t + i*733) % P)/P;
      const x = ((i*211 + Math.sin(k*9 + i)*14 - camX*0.8) % (W + 40) + W + 40) % (W + 40) - 20, y = H - k*H*0.7;
      ctx.fillStyle = `rgba(255,${150 + (i % 3)*30},60,${(0.9*(1 - k)).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2); ctx.fill();
    }
  }
}

// --- Vordergrund am unteren Bildrand (einmal gezeichnet, kachelbar) ---
function vordergrundBauen(welt){
  const F = detailFarben(welt); if(!F) return null;
  const c = bgCanvas(BG_TW, 80), g = c.getContext('2d'), rnd = bgRand(313);
  g.fillStyle = F.vorne;
  for(let i = 0; i < 26; i++){
    const x = i*62 + rnd()*30, h = 30 + rnd()*40, art = rnd();
    bgWrap(x, X => {
      if(welt === 'hoehle' || welt === 'vulkan'){
        g.beginPath(); g.moveTo(X - h*0.8, 80); g.quadraticCurveTo(X - h*0.4, 80 - h, X, 80 - h*0.9); g.quadraticCurveTo(X + h*0.5, 80 - h*0.8, X + h*0.9, 80); g.closePath(); g.fill();
      } else if(art < 0.5){   // Farn
        g.strokeStyle = F.vorne; g.lineWidth = 3; g.lineCap = 'round';
        for(let k = 0; k < 5; k++){ const a = -Math.PI/2 + (k - 2)*0.4; g.beginPath(); g.moveTo(X, 82); g.quadraticCurveTo(X + Math.cos(a)*h*0.6, 82 + Math.sin(a)*h*0.6 - 10, X + Math.cos(a)*h, 82 + Math.sin(a)*h*0.8); g.stroke(); }
      } else {   // Blatt
        const a = -Math.PI/2 + (rnd() - 0.5)*1.2, ex = X + Math.cos(a)*h*1.3, ey = 80 + Math.sin(a)*h*1.1;
        g.beginPath(); g.moveTo(X, 82); g.quadraticCurveTo((X + ex)/2 + 14, (80 + ey)/2, ex, ey); g.quadraticCurveTo((X + ex)/2 - 14, (80 + ey)/2, X, 82); g.fill();
      }
    });
  }
  bgBlur(g, 2.2);   // unscharf: liegt „vor der Kamera“
  return c;
}
// zeichnet den Vordergrund ganz unten (Bildschirm-Koordinaten); nur unterhalb der Bodenoberkante (VORDERGRUND_H)
// und nur über Boden-/Wandstücken
function vordergrundZeichnen(){
  if(!vordergrundBild) return;
  const off = ((Math.round(camX*VORDERGRUND_PAR) % BG_TW) + BG_TW) % BG_TW, y = H - VORDERGRUND_H;
  // nur über festem Boden/Wand (nie über Lava, Wasser, Gruben oder Gefahren): Ausschnitt aus deren Bildschirm-Lage
  const zoomY = wy => wy*zoom + H*(1 - zoom) + CEILING_MARGIN;
  ctx.save(); ctx.beginPath(); let n = 0;
  for(const so of solids){
    if((so.type !== 'ground' && so.type !== 'wall') || so.gone) continue;
    const x0 = (so.x - camX)*zoom, x1 = (so.x + so.w - camX)*zoom;
    if(x1 < 0 || x0 > W || zoomY(so.y) > H - 4 || zoomY(so.y + so.h) < y) continue;
    ctx.rect(x0, Math.max(y, zoomY(so.y) + 6), x1 - x0, H - Math.max(y, zoomY(so.y) + 6)); n++;
  }
  if(!n){ ctx.restore(); return; }
  ctx.clip(); ctx.globalAlpha = 0.85;
  ctx.drawImage(vordergrundBild, 0, 80 - VORDERGRUND_H, BG_TW, VORDERGRUND_H, -off, y, BG_TW, VORDERGRUND_H);
  if(BG_TW - off < W) ctx.drawImage(vordergrundBild, 0, 80 - VORDERGRUND_H, BG_TW, VORDERGRUND_H, BG_TW - off, y, BG_TW, VORDERGRUND_H);
  ctx.restore();
}
buildBackground();   // erster Aufbau des Hintergrunds (mit Details) – einmal beim Start
