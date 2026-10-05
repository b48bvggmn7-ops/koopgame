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
  m.addColorStop(0, `rgba(${bgMistCol},0)`);
  m.addColorStop(0.5, `rgba(${bgMistCol},${alpha})`);
  m.addColorStop(1, `rgba(${bgMistCol},0)`);
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
  const T = THEME;
  BG_LAYERS.length = 0; BG_WATERFALLS.length = 0;
  bgMistCol = T.mistCol || (T.dark ? '60,70,110' : '240,248,238');
  // Himmel (fest, ganz weit weg): Verlauf + Sonne bzw. Mond und Sterne
  BG_SKY = bgCanvas(W, H);
  {
    const g = BG_SKY.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, H);
    for(const [k, c] of T.sky) sky.addColorStop(k, c);
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    if(T.stars){
      const rnd = bgRand(77);
      for(let i = 0; i < T.stars; i++){
        const x = rnd()*W, y = rnd()*H*0.6, r = 0.5 + rnd()*1.3;
        g.fillStyle = `rgba(255,255,240,${(0.35 + rnd()*0.6).toFixed(2)})`;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI*2); g.fill();
      }
    }
    if(T.sun){
      const S = T.sun, sun = g.createRadialGradient(S.x, S.y, 0, S.x, S.y, S.r);
      sun.addColorStop(0, `rgba(${S.core},1)`); sun.addColorStop(0.06, `rgba(${S.core},0.95)`); sun.addColorStop(0.14, `rgba(${S.glow},0.55)`);
      sun.addColorStop(0.45, `rgba(${S.glow},0.18)`); sun.addColorStop(1, `rgba(${S.glow},0)`);
      g.fillStyle = sun; g.fillRect(0, 0, W, H);
    }
    if(T.moon){
      const M = T.moon, glow = g.createRadialGradient(M.x, M.y, M.r*0.8, M.x, M.y, M.glow);
      glow.addColorStop(0, 'rgba(210,225,255,0.35)'); glow.addColorStop(1, 'rgba(210,225,255,0)');
      g.fillStyle = glow; g.fillRect(0, 0, W, H);
      g.fillStyle = '#f4f2e0'; g.beginPath(); g.arc(M.x, M.y, M.r, 0, Math.PI*2); g.fill();
      g.fillStyle = 'rgba(200,196,170,0.5)';
      for(const [dx, dy, r] of [[-14, -8, 9], [12, 10, 7], [6, -18, 5], [-6, 16, 5]]){ g.beginPath(); g.arc(M.x + dx, M.y + dy, r, 0, Math.PI*2); g.fill(); }
    }
  }

  // Wolken (weich, ziehen langsam) – in der Höhle keine
  if(T.clouds) makeLayer(0.03, g=>{
    const rnd = bgRand(7);
    for(let i = 0; i < 7; i++){
      const x = i * 230 + rnd()*80, y = 60 + rnd()*120, s = 0.7 + rnd()*0.7;
      bgWrap(x, X=>{
        g.fillStyle = T.clouds;
        for(const [dx, dy, rx, ry] of [[0,0,70,24],[50,-14,52,26],[-46,4,48,18],[96,6,44,16]]){
          g.beginPath(); g.ellipse(X + dx*s, y + dy*s, rx*s, ry*s, 0, 0, Math.PI*2); g.fill();
        }
      });
    }
    bgBlur(g, 7);
  }, {drift: 0.004});

  makeLayer(0.07, g=> bgFar(g, T.far));
  const backLayer = makeLayer(0.14, g=> bgBack(g, T.back));
  for(const wf of BG_WATERFALLS) wf.layer = backLayer;
  makeLayer(0.27, g=> bgMid(g, T.mid));
  makeLayer(0.45, g=> bgNear(g, T.near));
}
let bgMistCol = '240,248,238';

// ---- ferne Ebene: Felstürme (Karst), Tempel, Höhlen-Zapfen oder Vulkan ----
function bgFar(g, F){
  const rnd = bgRand(21);
  if(F.kind === 'cave'){
    // Tropfsteine von oben und unten, dazwischen schwaches Kristall-Leuchten
    for(let i = 0; i < 10; i++){
      const x = i*160 + rnd()*60, gl = F.glow[i % 2];
      bgWrap(x, X=>{
        const gr = g.createRadialGradient(X, 420, 0, X, 420, 160);
        gr.addColorStop(0, gl); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(X - 160, 260, 320, 320);
      });
    }
    g.fillStyle = F.rock;
    g.beginPath(); g.moveTo(0, 0);
    for(let x = 0; x <= BG_TW; x += 8) g.lineTo(x, 70 + 30*Math.sin(2*Math.PI*x/BG_TW*3) + 14*Math.sin(2*Math.PI*x/BG_TW*7 + 1));
    g.lineTo(BG_TW, 0); g.closePath(); g.fill();
    for(let i = 0; i < 22; i++){
      const x = i*72 + rnd()*40, len = 60 + rnd()*170, w = 14 + rnd()*26, up = rnd() < 0.5;
      bgWrap(x, X=>{
        g.fillStyle = up ? F.rock : F.rock2;
        g.beginPath();
        if(up){ g.moveTo(X - w, 60); g.quadraticCurveTo(X - w*0.3, 60 + len*0.6, X, 60 + len); g.quadraticCurveTo(X + w*0.3, 60 + len*0.6, X + w, 60); }
        else { g.moveTo(X - w*1.3, H); g.quadraticCurveTo(X - w*0.3, H - len*0.7 - 120, X, H - len - 140); g.quadraticCurveTo(X + w*0.3, H - len*0.7 - 120, X + w*1.3, H); }
        g.closePath(); g.fill();
      });
    }
    g.fillStyle = F.rock2; g.beginPath(); g.moveTo(0, H);
    for(let x = 0; x <= BG_TW; x += 8) g.lineTo(x, 560 + 20*Math.sin(2*Math.PI*x/BG_TW*4 + 0.5));
    g.lineTo(BG_TW, H); g.closePath(); g.fill();
    bgBlur(g, 1.4);
    bgHaze(g, F.haze, 0.35);
    return;
  }
  // flacher Bergrücken
  g.fillStyle = F.ridge; g.beginPath(); g.moveTo(0, H);
  for(let x = 0; x <= BG_TW; x += 8){
    g.lineTo(x, 440 + 26*Math.sin(2*Math.PI*x/BG_TW*2 + 0.7) + 12*Math.sin(2*Math.PI*x/BG_TW*5 + 2.1));
  }
  g.lineTo(BG_TW, H); g.closePath(); g.fill();
  if(F.kind === 'volcano'){
    // großer Vulkan mit glühendem Krater, Lavaströmen und Rauch
    const X = 800, base = 520, top = 170;
    const gr = g.createLinearGradient(0, top, 0, base);
    gr.addColorStop(0, F.top); gr.addColorStop(1, F.bottom);
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(X - 520, base); g.quadraticCurveTo(X - 200, base - 120, X - 80, top); g.lineTo(X + 80, top);
    g.quadraticCurveTo(X + 200, base - 120, X + 520, base); g.closePath(); g.fill();
    const glow = g.createRadialGradient(X, top, 0, X, top, 200);
    glow.addColorStop(0, 'rgba(255,200,80,0.8)'); glow.addColorStop(0.3, 'rgba(255,90,30,0.4)'); glow.addColorStop(1, 'rgba(255,60,20,0)');
    g.fillStyle = glow; g.fillRect(X - 220, top - 200, 440, 400);
    g.strokeStyle = F.lava[1]; g.lineCap = 'round';
    for(const [dx, len, wob] of [[-30, 230, 18], [20, 300, -24], [55, 170, 12]]){
      g.lineWidth = 5; g.beginPath(); g.moveTo(X + dx*0.6, top + 6);
      g.bezierCurveTo(X + dx + wob, top + len*0.35, X + dx*1.8 - wob, top + len*0.7, X + dx*2.4, top + len); g.stroke();
      g.strokeStyle = F.lava[0]; g.lineWidth = 2; g.stroke(); g.strokeStyle = F.lava[1];
    }
    for(let i = 0; i < 9; i++){
      g.fillStyle = F.smoke;
      g.beginPath(); g.ellipse(X - 20 + i*18 + Math.sin(i)*30, top - 40 - i*28, 40 + i*10, 26 + i*6, 0, 0, Math.PI*2); g.fill();
    }
    for(let i = 0; i < 6; i++){
      const x = i*270 + rnd()*90, w = 80 + rnd()*120, h = 80 + rnd()*120;
      if(Math.abs(x - X) < 450) continue;
      bgWrap(x, XX=>{ g.fillStyle = F.top; g.beginPath(); g.moveTo(XX - w, 480); g.lineTo(XX - w*0.2, 480 - h); g.lineTo(XX + w*0.25, 480 - h*0.9); g.lineTo(XX + w, 480); g.closePath(); g.fill(); });
    }
    bgBlur(g, 1.2);
    bgHaze(g, F.haze, 0.25);
    bgMist(g, 380, 560, F.mist);
    return;
  }
  for(let i = 0; i < 9; i++){
    const x = i * 178 + rnd()*90, w = 60 + rnd()*110, h = 150 + rnd()*200, base = 470;
    bgWrap(x, X=>{
      const gr = g.createLinearGradient(0, base - h, 0, base);
      gr.addColorStop(0, F.top); gr.addColorStop(1, F.bottom);
      g.fillStyle = gr;
      if(F.kind === 'temple'){
        // Stufentempel / Stupa
        const steps = 5, sw = w*1.3, sh = h*0.75;
        if(i % 3 === 1){
          g.beginPath(); g.moveTo(X - sw*0.45, base); g.lineTo(X - sw*0.45, base - sh*0.35);
          g.quadraticCurveTo(X - sw*0.4, base - sh*0.9, X, base - sh); g.quadraticCurveTo(X + sw*0.4, base - sh*0.9, X + sw*0.45, base - sh*0.35);
          g.lineTo(X + sw*0.45, base); g.closePath(); g.fill();
          g.fillRect(X - 3, base - sh - 30, 6, 32);
        } else {
          for(let k = 0; k < steps; k++){
            const ww = sw*(1 - k/steps*0.8), hh = sh/steps;
            g.fillRect(X - ww/2, base - hh*(k + 1), ww, hh + 1);
          }
          g.fillRect(X - sw*0.08, base - sh - 22, sw*0.16, 24);
        }
        g.fillStyle = F.light; g.fillRect(X + sw*0.05, base - sh, sw*0.12, sh);
      } else {
        g.beginPath(); g.moveTo(X - w/2, base);
        g.bezierCurveTo(X - w*0.62, base - h*0.55, X - w*0.48, base - h*0.95, X - w*0.08, base - h);
        g.bezierCurveTo(X + w*0.32, base - h*1.02, X + w*0.56, base - h*0.7, X + w/2, base);
        g.closePath(); g.fill();
        // weiche Licht-Kante (Sonne von rechts)
        g.fillStyle = F.light;
        g.beginPath(); g.ellipse(X + w*0.2, base - h*0.72, w*0.16, h*0.24, 0.12, 0, Math.PI*2); g.fill();
      }
    });
  }
  bgBlur(g, 1.2);
  bgHaze(g, F.haze, 0.35);
  bgMist(g, 360, 560, F.mist);
}

// ---- hintere Ebene: Regenwald mit Wasserfall (bzw. Lavafall), Ruinen oder Kristalle ----
function bgBack(g, B){
  const rnd = bgRand(5);
  const cx = 1060, top = 230, bottom = 560;
  if(B.kind === 'waterfall' || B.kind === 'crystals'){
    // Felswand mit Wasserfall
    const rock = g.createLinearGradient(cx - 120, 0, cx + 120, 0);
    rock.addColorStop(0, B.rock[0]); rock.addColorStop(0.55, B.rock[1]); rock.addColorStop(1, B.rock[2]);
    g.fillStyle = rock;
    g.beginPath(); g.moveTo(cx - 150, bottom);
    g.bezierCurveTo(cx - 160, top + 120, cx - 120, top + 10, cx - 50, top);
    g.lineTo(cx + 60, top - 8);
    g.bezierCurveTo(cx + 130, top + 20, cx + 165, top + 140, cx + 150, bottom);
    g.closePath(); g.fill();
    if(B.moss) for(let i = 0; i < 40; i++){
      const a = rnd(), x = cx - 140 + rnd()*280, y = top + 20 + rnd()*(bottom - top - 40);
      g.fillStyle = a < 0.5 ? B.moss[0] : B.moss[1];
      g.beginPath(); g.ellipse(x, y, 10 + rnd()*22, 6 + rnd()*10, rnd(), 0, Math.PI*2); g.fill();
    }
    const wfx = cx - 6, ww = 34;
    const water = g.createLinearGradient(0, top, 0, bottom);
    water.addColorStop(0, B.water[0]); water.addColorStop(1, B.water[1]);
    g.fillStyle = water;
    g.beginPath(); g.moveTo(wfx - ww/2, top - 4); g.lineTo(wfx + ww/2, top - 6);
    g.lineTo(wfx + ww/2 + 8, bottom); g.lineTo(wfx - ww/2 - 8, bottom); g.closePath(); g.fill();
    BG_WATERFALLS.push({x: wfx, top: top - 4, bottom, w: ww, flow: B.flow, spray: B.spray});
    const spray = g.createRadialGradient(wfx, bottom - 6, 0, wfx, bottom - 6, 120);
    spray.addColorStop(0, B.spray); spray.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = spray; g.fillRect(wfx - 130, bottom - 120, 260, 180);
  }
  if(B.kind === 'crystals'){
    // große leuchtende Kristall-Gruppen
    for(let i = 0; i < 8; i++){
      const x = i*200 + rnd()*80, y = 520 + rnd()*40, col = B.crystal[i % B.crystal.length], s = 0.7 + rnd()*0.8;
      if(Math.abs(x - cx) < 140) continue;
      bgWrap(x, X=> bgCrystal(g, X, y, s*1.6, col, 7 + i));
    }
  }
  if(B.kind === 'ruins'){
    // Säulen, Bögen und Mauerreste, halb überwachsen
    for(let i = 0; i < 7; i++){
      const x = i*230 + rnd()*60, h = 140 + rnd()*170, broken = rnd() < 0.5;
      bgWrap(x, X=>{
        g.fillStyle = B.stone[1];
        if(i % 3 === 0){
          // Bogen
          g.fillRect(X - 70, 560 - h, 26, h); g.fillRect(X + 44, 560 - h, 26, h);
          g.beginPath(); g.moveTo(X - 70, 560 - h); g.lineTo(X + 70, 560 - h); g.lineTo(X + 70, 560 - h - 30); g.lineTo(X - 70, 560 - h - 30); g.fill();
          g.fillStyle = B.stone[2]; g.beginPath(); g.arc(X, 560 - h + 2, 44, Math.PI, 0); g.fill();
        } else {
          const hh = broken ? h*0.6 : h;
          g.fillRect(X - 15, 560 - hh, 30, hh);
          g.fillStyle = B.stone[0];
          for(let k = 1; k < 5; k++) g.fillRect(X - 15 + k*6, 560 - hh, 2, hh);
          g.fillStyle = B.stone[1];
          if(broken){ g.beginPath(); g.moveTo(X - 15, 560 - hh); g.lineTo(X - 4, 560 - hh - 14); g.lineTo(X + 6, 560 - hh - 4); g.lineTo(X + 15, 560 - hh - 18); g.lineTo(X + 15, 560 - hh); g.fill(); }
          else g.fillRect(X - 22, 560 - hh - 12, 44, 12);
        }
      });
    }
  }
  // Baumkronen-Teppich
  const fade = g.createLinearGradient(0, 520, 0, H);
  fade.addColorStop(0, B.fade[0]); fade.addColorStop(1, B.fade[1]);
  g.fillStyle = fade; g.fillRect(0, 540, BG_TW, H - 540);
  for(let i = 0; i < 56; i++){
    const x = i * 29 + rnd()*20, y = 505 + 20*Math.sin(i*0.7) + rnd()*28, r = 30 + rnd()*26, seed = 100 + i;
    if(BG_WATERFALLS.length && Math.abs(x - cx) < 120 && rnd() < 0.75) continue;   // Wasserfall frei lassen
    if(B.kind === 'crystals' && i % 2) continue;
    bgWrap(x, X=> bgFoliage(g, X, y + (B.kind === 'crystals' ? 40 : 0), r*1.2, r*0.85, seed, B.canopy));
  }
  bgHaze(g, B.haze, 0.2);
  bgMist(g, 470, 640, 0.6);
}
// Kristall-Gruppe (Fuß unten bei x,y)
function bgCrystal(g, x, y, s, col, seed){
  const rnd = bgRand(seed*31 + 3);
  const glow = g.createRadialGradient(x, y - 30*s, 0, x, y - 30*s, 70*s);
  glow.addColorStop(0, col + '66'); glow.addColorStop(1, col + '00');
  g.fillStyle = glow; g.fillRect(x - 70*s, y - 100*s, 140*s, 140*s);
  for(let k = 0; k < 5; k++){
    const a = (k - 2)*0.32 + (rnd() - 0.5)*0.2, len = (30 + rnd()*40)*s, w = (6 + rnd()*6)*s;
    g.save(); g.translate(x + (k - 2)*6*s, y); g.rotate(a);
    g.fillStyle = col; g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w, -len*0.75); g.lineTo(0, -len); g.lineTo(w, -len*0.75); g.lineTo(w, 0); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(-w*0.2, 0); g.lineTo(-w*0.2, -len*0.75); g.lineTo(0, -len); g.lineTo(w*0.5, -len*0.75); g.lineTo(w*0.5, 0); g.closePath(); g.fill();
    g.restore();
  }
}

// ---- mittlere Ebene: Bäume/Palmen, Tropfstein-Säulen oder verbrannte Bäume ----
function bgMid(g, M){
  const rnd = bgRand(11);
  for(let i = 0; i < 11; i++){
    const x = i * 148 + rnd()*70, topY = 150 + rnd()*170, lean = (rnd() - 0.5) * 60, thick = 6 + rnd()*6;
    const palm = rnd() < 0.35;
    bgWrap(x, X=>{
      if(M.kind === 'pillars'){
        // Tropfstein-Säule mit leuchtenden Pilzen
        const w = 18 + thick*2;
        g.fillStyle = M.rock[i % 3];
        g.beginPath(); g.moveTo(X - w, H + 10); g.quadraticCurveTo(X - w*0.4, (H + topY)/2, X - w*0.5, topY - 40);
        g.quadraticCurveTo(X, topY - 220, X + w*0.5, topY - 40); g.quadraticCurveTo(X + w*0.4, (H + topY)/2, X + w, H + 10); g.closePath(); g.fill();
        g.fillRect(X - w*0.6, 0, w*1.2, Math.max(0, topY - 200));
        for(let k = 0; k < 3; k++){
          const my = topY + 60 + k*70, side = k % 2 ? 1 : -1, col = M.glowCap[(i + k) % 2];
          g.fillStyle = col + '55'; g.beginPath(); g.arc(X + side*w*0.7, my, 16, 0, Math.PI*2); g.fill();
          g.fillStyle = col; g.beginPath(); g.ellipse(X + side*w*0.7, my, 8, 4, 0, Math.PI, Math.PI*2); g.fill();
        }
        return;
      }
      // Stamm
      g.strokeStyle = M.trunk; g.lineWidth = thick; g.lineCap = 'round';
      g.beginPath(); g.moveTo(X, H + 10);
      g.quadraticCurveTo(X + lean*0.2, (H + topY)/2, X + lean, topY); g.stroke();
      g.strokeStyle = M.trunkHi; g.lineWidth = thick*0.35;
      g.beginPath(); g.moveTo(X + thick*0.25, H + 10);
      g.quadraticCurveTo(X + lean*0.2 + thick*0.25, (H + topY)/2, X + lean + thick*0.2, topY); g.stroke();
      const tx = X + lean, ty = topY;
      if(M.kind === 'deadtrees'){
        // kahle, verkohlte Äste
        g.strokeStyle = M.trunk; g.lineCap = 'round';
        for(let k = 0; k < 5; k++){
          const a = -Math.PI/2 + (k - 2)*0.55, len = 40 + ((i + k) % 3)*22, by = ty + k*14;
          g.lineWidth = Math.max(1.5, thick*0.45);
          g.beginPath(); g.moveTo(tx, by); g.quadraticCurveTo(tx + Math.cos(a)*len*0.5, by + Math.sin(a)*len*0.3, tx + Math.cos(a)*len, by + Math.sin(a)*len*0.8); g.stroke();
        }
        return;
      }
      if(palm){
        for(let k = 0; k < 9; k++){
          const a = -Math.PI/2 + (k - 4)*0.42;
          bgFrond(g, tx, ty, a, 62 + (k % 3)*14, 26 + Math.abs(k - 4)*7, k % 2 ? M.palm[0] : M.palm[1]);
        }
        g.fillStyle = '#6b5a3c'; g.beginPath(); g.arc(tx, ty + 4, 6, 0, Math.PI*2); g.fill();
      } else {
        // Schirmkrone aus Laubbüscheln
        for(let k = 0; k < 4; k++){
          bgFoliage(g, tx + (k - 1.5)*34, ty + Math.cos(k*2.3)*10 - 4, 46 - Math.abs(k - 1.5)*6, 24, 300 + i*10 + k, M.crown);
        }
        // Lianen
        g.strokeStyle = M.liana; g.lineWidth = 2;
        for(let k = 0; k < 3; k++){
          const lx = tx - 40 + k*38, len = 90 + ((i + k) % 4) * 45;
          g.beginPath(); g.moveTo(lx, ty + 14);
          g.bezierCurveTo(lx + 14, ty + len*0.4, lx - 12, ty + len*0.7, lx + 4, ty + len); g.stroke();
          g.fillStyle = M.lianaLeaf;
          for(let q = 0.3; q < 1; q += 0.2){
            g.beginPath(); g.ellipse(lx + Math.sin(q*9)*6, ty + 14 + len*q, 4, 2.2, q*3, 0, Math.PI*2); g.fill();
          }
        }
      }
    });
  }
  // Unterholz
  for(let i = 0; i < 30; i++){
    const x = i * 55 + rnd()*30, y = 650 + rnd()*30, r = 34 + rnd()*26, seed = 500 + i;
    bgWrap(x, X=> bgFoliage(g, X, y, r*1.3, r*0.9, seed, M.under));
  }
  bgBlur(g, 0.7);
  bgHaze(g, M.haze, 0.2);
  bgMist(g, 560, 720, 0.45);
}

// ---- nahe Ebene: große Blätter und Farne, bzw. Felsbrocken mit Kristallen/Glut ----
function bgNear(g, N){
  const rnd = bgRand(3);
  for(let i = 0; i < 16; i++){
    const x = i * 100 + rnd()*60, y = 720, kind = rnd();
    const leafLen = 90 + rnd()*60, leafA = -Math.PI/2 + (rnd() - 0.5)*1.2;   // Zufall NICHT in bgWrap (sonst Naht)
    const fernLen = Array.from({length:6}, ()=> 60 + rnd()*40);
    bgWrap(x, X=>{
      if(N.kind === 'rocks'){
        const w = leafLen*0.7, h = leafLen*0.45;
        g.fillStyle = N.rock[i % 2];
        g.beginPath(); g.moveTo(X - w, y); g.quadraticCurveTo(X - w*0.8, y - h, X - w*0.1, y - h*1.1); g.quadraticCurveTo(X + w*0.7, y - h*0.9, X + w, y); g.closePath(); g.fill();
        if(kind < 0.5) bgCrystal(g, X + w*0.3, y - h*0.6, 0.5, N.crystal[i % 2], i);
        return;
      }
      if(kind < 0.5){
        // großes Bananen-/Monstera-Blatt
        const len = leafLen, a = leafA;
        const ex = X + Math.cos(a)*len, ey = y - 20 + Math.sin(a)*len;
        const lg = g.createLinearGradient(X, y, ex, ey);
        lg.addColorStop(0, N.leaf[0]); lg.addColorStop(1, N.leaf[1]);
        g.fillStyle = lg; g.beginPath(); g.moveTo(X, y - 10);
        const nx = -Math.sin(a), ny = Math.cos(a), wd = len*0.32;
        g.quadraticCurveTo((X + ex)/2 + nx*wd, (y + ey)/2 + ny*wd, ex, ey);
        g.quadraticCurveTo((X + ex)/2 - nx*wd, (y + ey)/2 - ny*wd, X, y - 10);
        g.fill();
        g.strokeStyle = N.vein; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(X, y - 10); g.lineTo(ex, ey); g.stroke();
      } else {
        // Farn
        g.strokeStyle = N.fern; g.lineWidth = 2.2;
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
  bgHaze(g, N.haze, 0.18);
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
        ctx.strokeStyle = i % 2 ? wf.flow[0] : wf.flow[1];
        ctx.lineDashOffset = -(t*(0.22 + i*0.03)) % 40;
        const sx = x - wf.w/2 + 4 + i*(wf.w - 8)/5;
        ctx.beginPath(); ctx.moveTo(sx, wf.top); ctx.lineTo(sx + (i - 2.5)*1.6, wf.bottom); ctx.stroke();
      }
      ctx.restore();
      // pulsierende Gischt
      ctx.fillStyle = wf.spray;
      for(let i = 0; i < 4; i++){
        const ph = (t*0.0012 + i*0.25) % 1;
        ctx.globalAlpha = (1 - ph)*0.4;
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
    if(L.par === 0.03 && !THEME.dark) drawSkyFlock(t);
    if(BG_WATERFALLS.length && BG_WATERFALLS[0].layer === L) drawWaterfallFlow(off, t);
  }
  if(typeof weatherBgTint === 'function') weatherBgTint();   // Regen: Hintergrund dunkler
}
