// 11-hintergrund.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Dschungel-Hintergrund (Parallax) ----------
// Einmal beim Start vorgezeichnet in nahtlos kachelbare Ebenen (weit weg = heller, blauer, unschärfer),
// danach pro Bild nur 2 drawImage je Ebene (billig). Bewegt pro Bild: Wasserfall-Streifen,
// Wolken und ein ferner Vogelschwarm – alles nur Deko, rein zeitbasiert (performance.now).
// Alles bleibt dunstig und kontrastarm, damit Boden, Figuren und Münzen klar davor stehen.
const BG_TW = 1600;
const BG_LAYERS = [];
let BG_SKY = null;
const BG_WATERFALLS = [];   // {layer, x, top, bottom, w} – Wasserfälle in Ebenen-Koordinaten

function bgRand(seed){ let s = seed >>> 0 || 1; return ()=>{ s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function bgCanvas(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function makeLayer(par, draw, opt){
  const c = bgCanvas(BG_TW, H), g = c.getContext('2d');
  draw(g);
  const L = {c, par, drift: (opt && opt.drift) || 0};
  BG_LAYERS.push(L);
  return L;
}
// Ebene einfärben (nur wo schon etwas gezeichnet ist) -> Luftperspektive / Dunst
function bgHaze(g, color, alpha){
  g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = alpha;
  g.fillStyle = color; g.fillRect(0, 0, BG_TW, H); g.restore();
}
// waagerechtes Nebelband
function bgMist(g, y0, y1, alpha){
  const m = g.createLinearGradient(0, y0, 0, y1);
  m.addColorStop(0, 'rgba(240,248,238,0)');
  m.addColorStop(0.5, `rgba(240,248,238,${alpha})`);
  m.addColorStop(1, 'rgba(240,248,238,0)');
  g.fillStyle = m; g.fillRect(0, y0, BG_TW, y1 - y0);
}
// zeichnet etwas dreimal versetzt, damit es über die Kachelkante nahtlos weitergeht
function bgWrap(x, fn){ for(const off of [0, BG_TW, -BG_TW]) fn(x + off); }
// Laubbüschel: viele kleine, verschieden helle Blatt-Kleckse in einer Ellipse -> wirkt wie echtes Blattwerk.
// Oben/rechts heller (Sonne), unten dunkler. Eigener Zufall pro Büschel (seed) -> nahtlos über bgWrap.
function bgFoliage(g, cx, cy, rx, ry, seed, pal){
  const rnd = bgRand(seed), n = Math.round(rx*ry/40);
  g.fillStyle = pal[0]; g.beginPath(); g.ellipse(cx, cy + ry*0.15, rx*0.92, ry*0.85, 0, 0, Math.PI*2); g.fill();
  for(let i = 0; i < n; i++){
    const a = rnd()*Math.PI*2, d = Math.sqrt(rnd());
    const x = cx + Math.cos(a)*rx*d, y = cy + Math.sin(a)*ry*d;
    const light = (cy - y)/ry*0.5 + (x - cx)/rx*0.25 + (rnd() - 0.5)*0.5;   // -1..1
    g.fillStyle = light > 0.35 ? pal[3] : light > 0 ? pal[2] : light > -0.35 ? pal[1] : pal[0];
    const r = 3 + rnd()*Math.min(9, rx*0.18);
    g.beginPath(); g.ellipse(x, y, r*1.25, r, rnd()*Math.PI, 0, Math.PI*2); g.fill();
  }
}
// Palmwedel: gebogene Mittelrippe mit herabhängenden Fiederblättchen
function bgFrond(g, x, y, a, len, droop, col){
  const ex = x + Math.cos(a)*len, ey = y + Math.sin(a)*len + droop;
  const qx = x + Math.cos(a)*len*0.5, qy = y + Math.sin(a)*len*0.5 - droop*0.35;
  g.strokeStyle = col; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(qx, qy, ex, ey); g.stroke();
  g.fillStyle = col;
  for(let f = 0.12; f < 0.98; f += 0.07){
    const u = 1 - f, px = u*u*x + 2*u*f*qx + f*f*ex, py = u*u*y + 2*u*f*qy + f*f*ey;
    const tx = 2*u*(qx - x) + 2*f*(ex - qx), ty = 2*u*(qy - y) + 2*f*(ey - qy), ta = Math.atan2(ty, tx);
    const ll = 16*Math.sin(Math.PI*Math.min(1, f + 0.15));
    for(const side of [-1, 1]){
      const la = ta + side*1.15 + 0.35*Math.sign(Math.cos(a))*side*0.5;
      g.beginPath(); g.ellipse(px + Math.cos(la)*ll*0.5, py + Math.sin(la)*ll*0.5 + 3, ll*0.55, 2.2, la, 0, Math.PI*2); g.fill();
    }
  }
}
// ganze Ebene einmal weichzeichnen (Tiefenunschärfe) – einmal am Ende, nicht pro Form (wäre sehr langsam)
function bgBlur(g, px){
  if(!('filter' in g)) return;
  const c = g.canvas, tmp = bgCanvas(c.width, c.height);
  tmp.getContext('2d').drawImage(c, 0, 0);
  g.clearRect(0, 0, c.width, c.height);
  g.save(); g.filter = `blur(${px}px)`; g.drawImage(tmp, 0, 0); g.restore();
}

function buildBackground(){
  // Himmel: dunstiges Morgenlicht mit Sonne (fest, ganz weit weg)
  BG_SKY = bgCanvas(W, H);
  {
    const g = BG_SKY.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#8fcbe0'); sky.addColorStop(0.35, '#d6ecdf');
    sky.addColorStop(0.58, '#ffe9bf'); sky.addColorStop(0.7, '#f8e2b0'); sky.addColorStop(1, '#d5e8cc');   // warmes Licht am Horizont
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    const sun = g.createRadialGradient(930, 290, 0, 930, 290, 470);
    sun.addColorStop(0, 'rgba(255,252,230,1)'); sun.addColorStop(0.06, 'rgba(255,244,200,0.95)'); sun.addColorStop(0.14, 'rgba(255,226,160,0.55)');
    sun.addColorStop(0.45, 'rgba(255,232,170,0.18)'); sun.addColorStop(1, 'rgba(255,232,170,0)');
    g.fillStyle = sun; g.fillRect(0, 0, W, H);
  }

  // Wolken (weich, ziehen langsam)
  makeLayer(0.03, g=>{
    const rnd = bgRand(7);
    for(let i = 0; i < 7; i++){
      const x = i * 230 + rnd()*80, y = 60 + rnd()*120, s = 0.7 + rnd()*0.7;
      bgWrap(x, X=>{
        g.fillStyle = 'rgba(255,255,255,0.42)';
        for(const [dx, dy, rx, ry] of [[0,0,70,24],[50,-14,52,26],[-46,4,48,18],[96,6,44,16]]){
          g.beginPath(); g.ellipse(X + dx*s, y + dy*s, rx*s, ry*s, 0, 0, Math.PI*2); g.fill();
        }
      });
    }
    bgBlur(g, 7);
  }, {drift: 0.004});

  // ferne Felstürme im Dunst (wie Karstberge)
  makeLayer(0.07, g=>{
    const rnd = bgRand(21);
    // flacher Bergrücken
    g.fillStyle = '#a9c8bd'; g.beginPath(); g.moveTo(0, H);
    for(let x = 0; x <= BG_TW; x += 8){
      g.lineTo(x, 440 + 26*Math.sin(2*Math.PI*x/BG_TW*2 + 0.7) + 12*Math.sin(2*Math.PI*x/BG_TW*5 + 2.1));
    }
    g.lineTo(BG_TW, H); g.closePath(); g.fill();
    for(let i = 0; i < 9; i++){
      const x = i * 178 + rnd()*90, w = 60 + rnd()*110, h = 150 + rnd()*200, base = 470;
      bgWrap(x, X=>{
        const gr = g.createLinearGradient(0, base - h, 0, base);
        gr.addColorStop(0, '#87aca6'); gr.addColorStop(1, '#b5d0c4');
        g.fillStyle = gr;
        g.beginPath(); g.moveTo(X - w/2, base);
        g.bezierCurveTo(X - w*0.62, base - h*0.55, X - w*0.48, base - h*0.95, X - w*0.08, base - h);
        g.bezierCurveTo(X + w*0.32, base - h*1.02, X + w*0.56, base - h*0.7, X + w/2, base);
        g.closePath(); g.fill();
        // weiche Licht-Kante (Sonne von rechts)
        g.fillStyle = 'rgba(255,246,214,0.22)';
        g.beginPath(); g.ellipse(X + w*0.2, base - h*0.72, w*0.16, h*0.24, 0.12, 0, Math.PI*2); g.fill();
      });
    }
    bgBlur(g, 1.2);
    bgHaze(g, '#d6eadc', 0.35);
    bgMist(g, 360, 560, 0.75);
  });

  // ferner Regenwald mit Felswand und Wasserfall
  const wfLayer = makeLayer(0.14, g=>{
    const rnd = bgRand(5);
    // Felswand mit Wasserfall
    const cx = 1060, top = 230, bottom = 560;
    const rock = g.createLinearGradient(cx - 120, 0, cx + 120, 0);
    rock.addColorStop(0, '#7e9b8c'); rock.addColorStop(0.55, '#93ae9d'); rock.addColorStop(1, '#7a978a');
    g.fillStyle = rock;
    g.beginPath(); g.moveTo(cx - 150, bottom);
    g.bezierCurveTo(cx - 160, top + 120, cx - 120, top + 10, cx - 50, top);
    g.lineTo(cx + 60, top - 8);
    g.bezierCurveTo(cx + 130, top + 20, cx + 165, top + 140, cx + 150, bottom);
    g.closePath(); g.fill();
    // Moos auf dem Fels
    for(let i = 0; i < 40; i++){
      const a = rnd(), x = cx - 140 + rnd()*280, y = top + 20 + rnd()*(bottom - top - 40);
      g.fillStyle = a < 0.5 ? 'rgba(110,150,105,0.55)' : 'rgba(140,175,120,0.45)';
      g.beginPath(); g.ellipse(x, y, 10 + rnd()*22, 6 + rnd()*10, rnd(), 0, Math.PI*2); g.fill();
    }
    // Wasserfall (Grundfläche; Streifen kommen pro Bild dazu)
    const wfx = cx - 6, ww = 34;
    const water = g.createLinearGradient(0, top, 0, bottom);
    water.addColorStop(0, 'rgba(232,246,250,0.95)'); water.addColorStop(1, 'rgba(214,238,244,0.85)');
    g.fillStyle = water;
    g.beginPath(); g.moveTo(wfx - ww/2, top - 4); g.lineTo(wfx + ww/2, top - 6);
    g.lineTo(wfx + ww/2 + 8, bottom); g.lineTo(wfx - ww/2 - 8, bottom); g.closePath(); g.fill();
    BG_WATERFALLS.push({x: wfx, top: top - 4, bottom, w: ww});
    // Gischt am Fuß
    const spray = g.createRadialGradient(wfx, bottom - 6, 0, wfx, bottom - 6, 120);
    spray.addColorStop(0, 'rgba(255,255,255,0.85)'); spray.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = spray; g.fillRect(wfx - 130, bottom - 120, 260, 180);

    // Baumkronen-Teppich
    const FAR = ['#6a9c82', '#7fb08f', '#98c49c', '#b7d9ad'];
    const fade = g.createLinearGradient(0, 520, 0, H);
    fade.addColorStop(0, '#6f9f84'); fade.addColorStop(1, '#79a98c');
    g.fillStyle = fade; g.fillRect(0, 540, BG_TW, H - 540);
    for(let i = 0; i < 56; i++){
      const x = i * 29 + rnd()*20, y = 505 + 20*Math.sin(i*0.7) + rnd()*28, r = 30 + rnd()*26, seed = 100 + i;
      if(Math.abs(x - cx) < 120 && rnd() < 0.75) continue;   // Wasserfall frei lassen
      bgWrap(x, X=> bgFoliage(g, X, y, r*1.2, r*0.85, seed, FAR));
    }
    bgHaze(g, '#d9ecdc', 0.2);
    bgMist(g, 470, 640, 0.6);
  });
  for(const wf of BG_WATERFALLS) wf.layer = wfLayer;

  // mittlerer Dschungel: hohe schlanke Bäume, Palmen, Lianen
  makeLayer(0.27, g=>{
    const rnd = bgRand(11);
    for(let i = 0; i < 11; i++){
      const x = i * 148 + rnd()*70, topY = 150 + rnd()*170, lean = (rnd() - 0.5) * 60, thick = 6 + rnd()*6;
      const palm = rnd() < 0.35;
      bgWrap(x, X=>{
        // Stamm
        g.strokeStyle = '#6a8a74'; g.lineWidth = thick; g.lineCap = 'round';
        g.beginPath(); g.moveTo(X, H + 10);
        g.quadraticCurveTo(X + lean*0.2, (H + topY)/2, X + lean, topY); g.stroke();
        g.strokeStyle = 'rgba(255,245,210,0.18)'; g.lineWidth = thick*0.35;
        g.beginPath(); g.moveTo(X + thick*0.25, H + 10);
        g.quadraticCurveTo(X + lean*0.2 + thick*0.25, (H + topY)/2, X + lean + thick*0.2, topY); g.stroke();
        const tx = X + lean, ty = topY;
        if(palm){
          for(let k = 0; k < 9; k++){
            const a = -Math.PI/2 + (k - 4)*0.42;
            bgFrond(g, tx, ty, a, 62 + (k % 3)*14, 26 + Math.abs(k - 4)*7, k % 2 ? '#5f9271' : '#73a682');
          }
          g.fillStyle = '#6b5a3c'; g.beginPath(); g.arc(tx, ty + 4, 6, 0, Math.PI*2); g.fill();
        } else {
          // Schirmkrone aus Laubbüscheln
          const MID = ['#4f8467', '#66997a', '#86b98d', '#acd59f'];
          for(let k = 0; k < 4; k++){
            bgFoliage(g, tx + (k - 1.5)*34, ty + Math.cos(k*2.3)*10 - 4, 46 - Math.abs(k - 1.5)*6, 24, 300 + i*10 + k, MID);
          }
          // Lianen
          g.strokeStyle = 'rgba(80,120,90,0.8)'; g.lineWidth = 2;
          for(let k = 0; k < 3; k++){
            const lx = tx - 40 + k*38, len = 90 + ((i + k) % 4) * 45;
            g.beginPath(); g.moveTo(lx, ty + 14);
            g.bezierCurveTo(lx + 14, ty + len*0.4, lx - 12, ty + len*0.7, lx + 4, ty + len); g.stroke();
            g.fillStyle = '#6fa27c';
            for(let q = 0.3; q < 1; q += 0.2){
              g.beginPath(); g.ellipse(lx + Math.sin(q*9)*6, ty + 14 + len*q, 4, 2.2, q*3, 0, Math.PI*2); g.fill();
            }
          }
        }
      });
    }
    // Unterholz
    const UND = ['#4e8366', '#649879', '#80b48a', '#a3cf98'];
    for(let i = 0; i < 30; i++){
      const x = i * 55 + rnd()*30, y = 650 + rnd()*30, r = 34 + rnd()*26, seed = 500 + i;
      bgWrap(x, X=> bgFoliage(g, X, y, r*1.3, r*0.9, seed, UND));
    }
    bgBlur(g, 0.7);
    bgHaze(g, '#d4e9d6', 0.2);
    bgMist(g, 560, 720, 0.45);
  });

  // nahe Blätter und Farne unten (am stärksten, aber noch dunstig)
  makeLayer(0.45, g=>{
    const rnd = bgRand(3);
    for(let i = 0; i < 16; i++){
      const x = i * 100 + rnd()*60, y = 720, kind = rnd();
      const leafLen = 90 + rnd()*60, leafA = -Math.PI/2 + (rnd() - 0.5)*1.2;   // Zufall NICHT in bgWrap (sonst Naht)
      const fernLen = Array.from({length:6}, ()=> 60 + rnd()*40);
      bgWrap(x, X=>{
        if(kind < 0.5){
          // großes Bananen-/Monstera-Blatt
          const len = leafLen, a = leafA;
          const ex = X + Math.cos(a)*len, ey = y - 20 + Math.sin(a)*len;
          const lg = g.createLinearGradient(X, y, ex, ey);
          lg.addColorStop(0, '#4c8462'); lg.addColorStop(1, '#7fb88a');
          g.fillStyle = lg; g.beginPath(); g.moveTo(X, y - 10);
          const nx = -Math.sin(a), ny = Math.cos(a), wd = len*0.32;
          g.quadraticCurveTo((X + ex)/2 + nx*wd, (y + ey)/2 + ny*wd, ex, ey);
          g.quadraticCurveTo((X + ex)/2 - nx*wd, (y + ey)/2 - ny*wd, X, y - 10);
          g.fill();
          g.strokeStyle = 'rgba(220,240,210,0.35)'; g.lineWidth = 1.5;
          g.beginPath(); g.moveTo(X, y - 10); g.lineTo(ex, ey); g.stroke();
        } else {
          // Farn
          g.strokeStyle = '#5a9068'; g.lineWidth = 2.2;
          for(let k = 0; k < 6; k++){
            const a = -Math.PI/2 + (k - 2.5)*0.32, len = fernLen[k];
            const ex = X + Math.cos(a)*len, ey = y + Math.sin(a)*len;
            g.beginPath(); g.moveTo(X, y); g.quadraticCurveTo(X + Math.cos(a)*len*0.6, y + Math.sin(a)*len*0.4 - 20, ex, ey); g.stroke();
            for(let f = 0.25; f < 1; f += 0.12){
              const fx = X + (ex - X)*f, fy = y + (ey - y)*f - Math.sin(f*Math.PI)*12;
              g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + 7*(1-f) + 2, fy - 6); g.moveTo(fx, fy); g.lineTo(fx - 7*(1-f) - 2, fy - 6); g.stroke();
            }
          }
        }
      });
    }
    bgHaze(g, '#d8ecd9', 0.18);
  });
}
buildBackground();

// ferner Vogelschwarm, der ab und zu durch den Himmel zieht (nur Deko)
function drawSkyFlock(t){
  const P = 24000, u = (t % P) / P;
  if(u > 0.6) return;
  const k = u / 0.6, baseX = W + 80 - k*(W + 260), baseY = 150 + Math.sin(k*Math.PI*2)*18;
  ctx.save(); ctx.strokeStyle = 'rgba(70,100,92,0.55)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for(let i = 0; i < 5; i++){
    const x = baseX + i*22 + (i % 2)*8, y = baseY + Math.abs(i - 2)*9, f = Math.sin(t*0.018 + i*1.3)*4;
    ctx.beginPath(); ctx.moveTo(x - 6, y - f); ctx.quadraticCurveTo(x - 2, y - 2, x, y); ctx.quadraticCurveTo(x + 2, y - 2, x + 6, y - f); ctx.stroke();
  }
  ctx.restore();
}
// fallende Wasser-Streifen auf dem Wasserfall
function drawWaterfallFlow(off, t){
  for(const wf of BG_WATERFALLS){
    for(const base of [0, BG_TW]){
      const x = wf.x - off + base;
      if(x < -80 || x > W + 80) continue;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(x - wf.w/2, wf.top); ctx.lineTo(x + wf.w/2, wf.top);
      ctx.lineTo(x + wf.w/2 + 8, wf.bottom); ctx.lineTo(x - wf.w/2 - 8, wf.bottom); ctx.closePath(); ctx.clip();
      ctx.lineWidth = 2; ctx.setLineDash([16, 24]);
      for(let i = 0; i < 6; i++){
        ctx.strokeStyle = i % 2 ? 'rgba(255,255,255,0.75)' : 'rgba(170,215,230,0.6)';
        ctx.lineDashOffset = -(t*(0.22 + i*0.03)) % 40;
        const sx = x - wf.w/2 + 4 + i*(wf.w - 8)/5;
        ctx.beginPath(); ctx.moveTo(sx, wf.top); ctx.lineTo(sx + (i - 2.5)*1.6, wf.bottom); ctx.stroke();
      }
      ctx.restore();
      // pulsierende Gischt
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for(let i = 0; i < 4; i++){
        const ph = (t*0.0012 + i*0.25) % 1;
        ctx.globalAlpha = 1 - ph;
        ctx.beginPath(); ctx.ellipse(x + (i - 1.5)*14, wf.bottom - 8 - ph*16, 10 + ph*14, 5 + ph*6, 0, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
}
function drawBackground(){
  ctx.drawImage(BG_SKY, 0, 0);
  if(typeof weatherSkyFx === 'function') weatherSkyFx();   // Sonnenstrahlen, Regenbogen (19-wetter.js)
  const t = performance.now();
  for(const L of BG_LAYERS){
    let off = camX*L.par + t*L.drift;
    off = Math.round(((off % BG_TW) + BG_TW) % BG_TW);
    ctx.drawImage(L.c, -off, 0);
    if(BG_TW - off < W) ctx.drawImage(L.c, BG_TW - off, 0);
    if(L.par === 0.03) drawSkyFlock(t);
    if(BG_WATERFALLS.length && BG_WATERFALLS[0].layer === L) drawWaterfallFlow(off, t);
  }
  if(typeof weatherBgTint === 'function') weatherBgTint();   // Regen: Hintergrund dunkler
}
