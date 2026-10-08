// 27-kosmetik-zeichnen.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Cosmetics zeichnen (rein optisch, für rollende Kugeln gedacht) ----------
// Ein "Rig" beschreibt die Kugel: {x, y (Mitte, Bildschirm), r, roll (Drehwinkel), vx, vy, grounded, facing, ox (camX)}.
// Je Figur gibt es einen Zustand st = {parts:[], hist:[], pet:{…}}: Partikel der Spur, Bahn für Bänder/Schwänze,
// Begleiter. Er wird NUR im festen Takt (cosmeticsStep aus stepSim bzw. 60×/s in der Vorschau) verändert –
// beim Zeichnen nichts, damit 120/144-Hz-Bildschirme nicht schneller sind.
// Regel für jedes Item: es muss auch funktionieren, wenn sich die Kugel dauernd um 360° dreht. Deshalb:
//   Spuren/Auren/Begleiter/kreisende Objekte drehen sich nicht mit;
//   Skins rollen komplett mit.

const COS_STATE = {m: cosNewState(), f: cosNewState()};
function cosNewState(){ return {parts:[], hist:[], pet:null, tick:0, sparks:[]}; }
function cosResetState(){ COS_STATE.m = cosNewState(); COS_STATE.f = cosNewState(); }
const cosRand = (a, b) => a + Math.random()*(b - a);

// Kugel-Daten einer Spielfigur (Weltkoordinaten; Mitte des Gesichts)
function playerRig(P){
  return {x:P.x, y:P.y - P.h*0.5 + 4, r:21, roll:P.rollAngle || 0, vx:P.vx, vy:P.vy, grounded:P.grounded, facing:P.facing || 1};
}

// ===== Schritt im festen Takt: Spur-Partikel erzeugen/bewegen, Bahn merken, Begleiter nachziehen =====
function cosStep(rig, st, who, items){
  st.tick++;
  const speed = Math.hypot(rig.vx, rig.vy), move = Math.min(1, speed/5);
  st.hist.unshift({x:rig.x, y:rig.y, s:speed}); if(st.hist.length > 40) st.hist.length = 40;
  const trail = items.trail;
  if(trail){
    const fx = trail.fx, rate = trailRate(fx.kind)*(0.15 + move*1.1);
    let n = Math.floor(rate) + (Math.random() < rate % 1 ? 1 : 0);
    while(n-- > 0) st.parts.push(newTrailPart(fx, rig, move));
  }
  for(let i = st.parts.length - 1; i >= 0; i--){
    const p = st.parts[i];
    p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag; p.rot += p.vr; p.life--;
    if(p.life <= 0) st.parts.splice(i, 1);
  }
  if(st.parts.length > 220) st.parts.splice(0, st.parts.length - 220);
  // Prestige-Funkeln (sofort als besonders erkennbar)
  if(Object.values(items).some(it => it && it.rarity === 'prestige') && Math.random() < 0.18)
    st.sparks.push({a:Math.random()*Math.PI*2, d:rig.r*cosRand(1.1, 1.7), life:40, max:40});
  for(let i = st.sparks.length - 1; i >= 0; i--) if(--st.sparks[i].life <= 0) st.sparks.splice(i, 1);
  // Begleiter: folgt mit Abstand hinter der Kugel, hüpft mit, wenn die Kugel springt
  const pet = items.pet;
  if(pet){
    const flyer = ['ghost', 'bat', 'robot'].includes(pet.fx.kind);
    if(!st.pet) st.pet = {x:rig.x - rig.facing*40, y:rig.y + rig.r, vy:0, ground:rig.y + rig.r, face:rig.facing, idle:0, hop:0};
    const pt = st.pet, back = rig.facing*(flyer ? 34 : 42);
    const tx = rig.x - back, groundY = rig.grounded ? rig.y + rig.r : pt.ground;
    pt.x += (tx - pt.x)*0.12;
    if(Math.abs(tx - pt.x) > 2) pt.face = Math.sign(tx - pt.x) || pt.face;
    if(rig.grounded) pt.ground = rig.y + rig.r;
    if(flyer){ pt.y += ((rig.y - rig.r*0.9) - pt.y)*0.1; }
    else {
      // springt die Kugel, hüpft der Begleiter kurz danach mit
      if(!rig.grounded && rig.vy < -3 && pt.hop <= 0 && pt.y >= pt.ground - 0.5){ pt.vy = -6.5; pt.hop = 1; }
      pt.vy += 0.5; pt.y += pt.vy;
      if(pt.y >= groundY){ pt.y = groundY; pt.vy = 0; pt.hop = 0; }
    }
    pt.idle = (speed < 0.3 && rig.grounded) ? pt.idle + 1 : 0;
  } else st.pet = null;
}
function trailRate(kind){
  return {puff:0.7, bubble:0.6, leaf:0.45, heart:0.45, star:0.6, slime:0.9, confetti:1.2, flame:1.6, ice:1.0, spark:1.1,
          gold:1.0, crystal:0.7, galaxy:1.4, rainbow:0}[kind] ?? 0.6;
}
function newTrailPart(fx, rig, move){
  const k = fx.kind, cols = fx.cols || ['#fff'], col = cols[Math.floor(Math.random()*cols.length)];
  const back = -Math.sign(rig.vx || rig.facing);
  const p = {kind:k, col, x:rig.x + back*rig.r*0.6 + cosRand(-4, 4), y:rig.y + cosRand(-rig.r*0.5, rig.r*0.8),
             vx:back*cosRand(0.2, 1.2), vy:cosRand(-0.6, 0.3), g:0, drag:0.97, life:40, max:40,
             size:cosRand(3, 6)*(0.7 + move*0.6), rot:Math.random()*6, vr:cosRand(-0.1, 0.1)};
  if(k === 'puff'){ p.y = rig.y + rig.r*0.8; p.vy = cosRand(-0.5, -0.1); p.size *= 1.4; p.life = p.max = 34; }
  if(k === 'bubble'){ p.vy = cosRand(-1.2, -0.4); p.life = p.max = 55; }
  if(k === 'leaf'){ p.g = 0.04; p.vr = cosRand(-0.15, 0.15); p.life = p.max = 60; }
  if(k === 'heart' || k === 'star'){ p.vy = cosRand(-1.1, -0.3); p.life = p.max = 46; }
  if(k === 'slime'){ p.y = rig.y + rig.r - 1; p.vx *= 0.1; p.vy = 0; p.drag = 0.9; p.life = p.max = 80; p.size *= 1.3; }
  if(k === 'confetti'){ p.vy = cosRand(-2.2, -0.6); p.g = 0.08; p.vr = cosRand(-0.3, 0.3); p.life = p.max = 60; }
  if(k === 'flame'){ p.vy = cosRand(-1.8, -0.6); p.life = p.max = 26; p.size *= 1.5; }
  if(k === 'ice'){ p.g = 0.03; p.life = p.max = 50; }
  if(k === 'spark'){ p.vx = cosRand(-2.5, 2.5); p.vy = cosRand(-2.5, 1); p.drag = 0.9; p.life = p.max = 22; }
  if(k === 'gold'){ p.vy = cosRand(-1.8, -0.4); p.g = 0.09; p.life = p.max = 50; }
  if(k === 'crystal'){ p.vy = cosRand(-0.6, 0.2); p.life = p.max = 55; p.size *= 1.3; }
  if(k === 'galaxy'){ p.vy = cosRand(-0.5, 0.5); p.life = p.max = 70; p.size *= cosRand(0.5, 1.4); }
  return p;
}

// ===== kleine Formen =====
function cosStar(c, x, y, r, rot, points){
  points = points || 5; c.beginPath();
  for(let i = 0; i < points*2; i++){
    const a = rot + i*Math.PI/points - Math.PI/2, rr = i % 2 ? r*0.45 : r;
    i ? c.lineTo(x + Math.cos(a)*rr, y + Math.sin(a)*rr) : c.moveTo(x + Math.cos(a)*rr, y + Math.sin(a)*rr);
  }
  c.closePath();
}
function cosHeart(c, x, y, s){
  c.beginPath(); c.moveTo(x, y + s*0.35);
  c.bezierCurveTo(x - s, y - s*0.35, x - s*0.5, y - s, x, y - s*0.45);
  c.bezierCurveTo(x + s*0.5, y - s, x + s, y - s*0.35, x, y + s*0.35); c.closePath();
}
function cosLeaf(c, x, y, s, rot, col){
  c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = col;
  c.beginPath(); c.moveTo(-s, 0); c.quadraticCurveTo(0, -s*0.8, s, 0); c.quadraticCurveTo(0, s*0.8, -s, 0); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-s, 0); c.lineTo(s, 0); c.stroke(); c.restore();
}
function cosCrystal(c, x, y, s, rot, col){
  c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = col;
  c.beginPath(); c.moveTo(0, -s*1.3); c.lineTo(s*0.6, 0); c.lineTo(0, s*1.3); c.lineTo(-s*0.6, 0); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.moveTo(0, -s*1.3); c.lineTo(s*0.25, 0); c.lineTo(0, s*0.4); c.closePath(); c.fill();
  c.restore();
}
function cosBolt(c, x1, y1, x2, y2, segs, jitter){
  c.beginPath(); c.moveTo(x1, y1);
  for(let i = 1; i < segs; i++){ const t = i/segs; c.lineTo(x1 + (x2 - x1)*t + cosRand(-jitter, jitter), y1 + (y2 - y1)*t + cosRand(-jitter, jitter)); }
  c.lineTo(x2, y2); c.stroke();
}
function glowCircle(c, x, y, r0, r1, col0, col1){
  const g = c.createRadialGradient(x, y, r0, x, y, r1); g.addColorStop(0, col0); g.addColorStop(1, col1);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r1, 0, Math.PI*2); c.fill();
}

// ===== Spur (hinter der Kugel, Weltkoordinaten) =====
function drawTrail(c, rig, st, item, ox){
  if(!item) return;
  const k = item.fx.kind;
  if(k === 'rainbow'){ drawRainbowRibbon(c, st, ox, rig.r); }
  for(const p of st.parts){
    const a = p.life/p.max, x = p.x - ox, y = p.y;
    c.save(); c.globalAlpha = Math.max(0, Math.min(1, a*1.3));
    switch(p.kind){
      case 'puff': c.fillStyle = p.col; c.beginPath(); c.arc(x, y, p.size*(1.6 - a*0.6), 0, Math.PI*2); c.fill(); break;
      case 'bubble': c.strokeStyle = p.col; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, p.size*0.8, 0, Math.PI*2); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(x - p.size*0.3, y - p.size*0.3, p.size*0.2, 0, Math.PI*2); c.fill(); break;
      case 'leaf': cosLeaf(c, x, y, p.size, p.rot, p.col); break;
      case 'heart': c.fillStyle = p.col; cosHeart(c, x, y, p.size*0.9); c.fill(); break;
      case 'star': c.fillStyle = p.col; cosStar(c, x, y, p.size, p.rot); c.fill(); break;
      case 'slime': c.fillStyle = p.col; c.beginPath(); c.ellipse(x, y, p.size*1.4, p.size*0.5, 0, 0, Math.PI*2); c.fill(); break;
      case 'confetti': c.fillStyle = p.col; c.translate(x, y); c.rotate(p.rot); c.fillRect(-p.size*0.6, -p.size*0.3, p.size*1.2, p.size*0.6); break;
      case 'flame': c.globalCompositeOperation = 'lighter';
        glowCircle(c, x, y, 0, p.size*(0.6 + a), p.col, 'rgba(255,80,20,0)'); break;
      case 'ice': c.fillStyle = p.col; cosStar(c, x, y, p.size*0.9, p.rot, 6); c.fill(); break;
      case 'spark': c.strokeStyle = p.col; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x - p.vx*3, y - p.vy*3); c.stroke(); break;
      case 'gold': { const g = c.createLinearGradient(x - p.size, y, x + p.size, y); g.addColorStop(0, '#fff1a8'); g.addColorStop(1, '#d99a00');
        c.fillStyle = g; c.beginPath(); c.ellipse(x, y, p.size*0.9*Math.abs(Math.cos(p.rot)) + 0.6, p.size*0.9, 0, 0, Math.PI*2); c.fill(); break; }
      case 'crystal': cosCrystal(c, x, y, p.size*0.7, p.rot, p.col); break;
      case 'galaxy': c.globalCompositeOperation = 'lighter';
        glowCircle(c, x, y, 0, p.size*2.2, 'rgba(160,140,255,.35)', 'rgba(160,140,255,0)');
        c.fillStyle = p.col; cosStar(c, x, y, p.size*0.8, p.rot, 4); c.fill(); break;
    }
    c.restore();
  }
}
// Prestige: Regenbogen-Band entlang der Bahn, breiter bei Tempo
function drawRainbowRibbon(c, st, ox, r){
  const h = st.hist; if(h.length < 3) return;
  const cols = ['#ff4b4b', '#ff9a2a', '#ffe14d', '#52d66b', '#4fa8ff', '#9a6bff'];
  const t = performance.now()*0.004;
  c.save(); c.globalCompositeOperation = 'lighter';
  cols.forEach((col, i) => {
    c.strokeStyle = col; c.lineCap = 'round';
    for(let j = 1; j < h.length; j++){
      const a = 1 - j/h.length, w = Math.min(1, h[j].s/4)*4 + 1.2;
      const off = (i - 2.5)*w + Math.sin(t + j*0.4)*1.5;
      c.globalAlpha = a*0.8; c.lineWidth = w;
      c.beginPath(); c.moveTo(h[j-1].x - ox, h[j-1].y + off + r*0.3); c.lineTo(h[j].x - ox, h[j].y + off + r*0.3); c.stroke();
    }
  });
  c.restore();
}

// ===== Aura (um die Kugel, dreht nicht mit) =====
function drawAura(c, x, y, r, item, layer){
  if(!item) return;
  const k = item.fx.kind, cols = item.fx.cols || ['#fff', '#fff'], t = performance.now();
  c.save();
  if(layer === 'back'){
    if(k === 'glow'){ const s = 1 + Math.sin(t*0.004)*0.06; glowCircle(c, x, y, r*0.7, r*1.7*s, hexA(cols[0], 0.55), hexA(cols[1], 0)); }
    if(k === 'flames' || k === 'inferno'){
      const big = k === 'inferno', n = big ? 14 : 9;
      glowCircle(c, x, y, r*0.6, r*(big ? 2.3 : 1.7), big ? 'rgba(255,120,30,.55)' : 'rgba(255,150,40,.35)', 'rgba(255,90,20,0)');
      c.globalCompositeOperation = 'lighter';
      for(let i = 0; i < n; i++){
        const a = i/n*Math.PI*2 + t*0.0012, fl = 0.7 + 0.3*Math.sin(t*0.012 + i*1.7);
        const bx = x + Math.cos(a)*r*0.95, by = y + Math.sin(a)*r*0.95;
        const len = r*(big ? 0.95 : 0.6)*fl;
        const g = c.createLinearGradient(bx, by, bx, by - len*1.6);
        g.addColorStop(0, big ? '#ffe066' : (cols[0])); g.addColorStop(0.5, big ? '#ff6a1f' : cols[1]); g.addColorStop(1, 'rgba(255,40,10,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(bx - len*0.35, by); c.quadraticCurveTo(bx, by - len*1.9, bx + len*0.35, by); c.fill();
      }
    }
    if(k === 'frost'){ glowCircle(c, x, y, r*0.8, r*1.7, 'rgba(200,240,255,.45)', 'rgba(200,240,255,0)'); }
    if(k === 'toxic'){ const w = Math.sin(t*0.006)*2; glowCircle(c, x, y, r*0.8, r*1.6 + w, 'rgba(160,255,80,.45)', 'rgba(90,210,60,0)'); }
    if(k === 'magic'){ glowCircle(c, x, y, r*0.7, r*1.8, 'rgba(255,140,240,.35)', 'rgba(180,107,255,0)'); }
    if(k === 'lightning'){ glowCircle(c, x, y, r*0.8, r*1.8, 'rgba(140,200,255,.35)', 'rgba(140,200,255,0)'); }
    if(k === 'shards'){ glowCircle(c, x, y, r*0.8, r*1.9, 'rgba(200,180,255,.35)', 'rgba(127,216,255,0)'); }
    if(k === 'bubbles'){ glowCircle(c, x, y, r*0.8, r*1.5, 'rgba(200,240,255,.25)', 'rgba(200,240,255,0)'); }
  } else {
    if(k === 'frost'){
      c.strokeStyle = 'rgba(230,250,255,.9)'; c.lineWidth = 1.4;
      for(let i = 0; i < 8; i++){ const a = i/8*Math.PI*2 + t*0.0005, d0 = r*1.05, d1 = r*(1.32 + 0.06*Math.sin(t*0.005 + i));
        c.beginPath(); c.moveTo(x + Math.cos(a)*d0, y + Math.sin(a)*d0); c.lineTo(x + Math.cos(a)*d1, y + Math.sin(a)*d1); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.9)'; cosStar(c, x + Math.cos(a)*d1, y + Math.sin(a)*d1, 2.4, a, 6); c.fill(); }
    }
    if(k === 'toxic'){
      c.fillStyle = 'rgba(180,255,110,.85)';
      for(let i = 0; i < 6; i++){ const ph = ((t*0.0007 + i/6) % 1), a = i*1.9;
        c.globalAlpha = 1 - ph; c.beginPath(); c.arc(x + Math.cos(a)*r*0.9, y + r*0.4 - ph*r*2.1, 2 + i % 3, 0, Math.PI*2); c.fill(); }
    }
    if(k === 'bubbles'){
      c.strokeStyle = 'rgba(220,245,255,.9)'; c.lineWidth = 1.1;
      for(let i = 0; i < 6; i++){ const a = i/6*Math.PI*2 + t*0.0011*(i % 2 ? 1 : -1), d = r*(1.25 + 0.1*Math.sin(t*0.004 + i));
        c.beginPath(); c.arc(x + Math.cos(a)*d, y + Math.sin(a)*d, 2.5 + (i % 3), 0, Math.PI*2); c.stroke(); }
    }
    if(k === 'lightning'){
      c.strokeStyle = 'rgba(230,245,255,.95)'; c.lineWidth = 1.6; c.shadowColor = '#8fd0ff'; c.shadowBlur = 8;
      const seed = Math.floor(t/70);
      for(let i = 0; i < 3; i++){ const a0 = (seed*1.37 + i*2.1) % (Math.PI*2), a1 = a0 + 1.1;
        cosBolt(c, x + Math.cos(a0)*r*1.15, y + Math.sin(a0)*r*1.15, x + Math.cos(a1)*r*1.15, y + Math.sin(a1)*r*1.15, 5, 4); }
    }
    if(k === 'magic'){
      for(let i = 0; i < 8; i++){ const a = i/8*Math.PI*2 + t*0.0016, d = r*1.35;
        c.fillStyle = i % 2 ? '#ff9cf2' : '#d7b8ff'; c.globalAlpha = 0.6 + 0.4*Math.sin(t*0.01 + i);
        cosStar(c, x + Math.cos(a)*d, y + Math.sin(a)*d, 3, t*0.004, 4); c.fill(); }
    }
    if(k === 'shards'){
      for(let i = 0; i < 6; i++){ const a = i/6*Math.PI*2 - t*0.0012, d = r*(1.4 + 0.08*Math.sin(t*0.004 + i));
        cosCrystal(c, x + Math.cos(a)*d, y + Math.sin(a)*d, 4.2, a + Math.PI/2, i % 2 ? '#c9b3ff' : '#9fe6ff'); }
    }
    if(k === 'bigbubble'){
      // Prestige: die Figur steckt in einer großen, schillernden Seifenblase, die beim Rollen wabbelt
      const R = r*1.55, wob = Math.sin(t*0.006)*0.04;
      c.save(); c.translate(x, y); c.scale(1 + wob, 1 - wob);
      const g = c.createRadialGradient(-R*0.3, -R*0.35, R*0.1, 0, 0, R);
      g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(0.75, 'rgba(180,220,255,.08)'); g.addColorStop(1, 'rgba(255,170,240,.35)');
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, R, 0, Math.PI*2); c.fill();
      const ring = c.createLinearGradient(-R, -R, R, R);
      ['#ff8ad8', '#8fd8ff', '#b0ff9c', '#ffe58a', '#ff8ad8'].forEach((col, i, arr) => ring.addColorStop(((i/(arr.length - 1)) + t*0.0002) % 1, col));
      c.strokeStyle = ring; c.lineWidth = 2.2; c.globalAlpha = 0.85; c.beginPath(); c.arc(0, 0, R, 0, Math.PI*2); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.ellipse(-R*0.42, -R*0.5, R*0.2, R*0.09, -0.6, 0, Math.PI*2); c.fill();
      c.restore();
    }
    if(k === 'inferno'){
      c.globalCompositeOperation = 'lighter';
      for(let i = 0; i < 6; i++){ const ph = ((t*0.0011 + i/6) % 1), a = i*2.3 + t*0.0003;
        c.globalAlpha = 1 - ph; c.fillStyle = i % 2 ? '#ffd23f' : '#ff6a1f';
        c.beginPath(); c.arc(x + Math.cos(a)*r*1.2, y - ph*r*2.4, 1.6 + (i % 3)*0.6, 0, Math.PI*2); c.fill(); }
    }
  }
  c.restore();
}
function hexA(hex, a){ const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }

// ===== Kreisende Objekte (hintere Hälfte hinter, vordere vor der Kugel) =====
function drawOrbit(c, x, y, r, item, layer){
  if(!item) return;
  const k = item.fx.kind, t = performance.now();
  if(k === 'saturn'){ drawSaturn(c, x, y, r, layer, t); return; }
  const n = item.fx.n || 1, R = r*1.55, tilt = 0.38;
  for(let i = 0; i < n; i++){
    const a = t*0.0022 + i/n*Math.PI*2, front = Math.sin(a) > 0;
    if((layer === 'front') !== front) continue;
    const ox = x + Math.cos(a)*R, oy = y + Math.sin(a)*R*tilt - 4, sc = 0.85 + 0.25*Math.sin(a);
    c.save(); c.translate(ox, oy); c.scale(sc, sc);
    if(k === 'leaf') cosLeaf(c, 0, 0, 6, a*2, '#7cc36b');
    if(k === 'heart'){ c.fillStyle = '#ff6f9f'; cosHeart(c, 0, 0, 6); c.fill(); }
    if(k === 'star'){ c.fillStyle = '#ffe066'; cosStar(c, 0, 0, 6, a); c.fill(); c.strokeStyle = '#d99a00'; c.lineWidth = 1; c.stroke(); }
    if(k === 'crystal') cosCrystal(c, 0, 0, 5, a, i % 2 ? '#c9b3ff' : '#9fe6ff');
    if(k === 'rune'){ glowCircle(c, 0, 0, 0, 9, 'rgba(180,120,255,.6)', 'rgba(180,120,255,0)');
      c.strokeStyle = '#f1e6ff'; c.lineWidth = 1.6; c.beginPath();
      const g = i % 4; if(g === 0){ c.moveTo(-3, -5); c.lineTo(0, 5); c.lineTo(3, -5); } else if(g === 1){ c.moveTo(-4, 0); c.lineTo(4, 0); c.moveTo(0, -5); c.lineTo(0, 5); }
      else if(g === 2){ c.arc(0, 0, 4, 0.3, Math.PI*1.7); } else { c.moveTo(-4, -4); c.lineTo(4, 4); c.moveTo(4, -4); c.lineTo(-4, 4); } c.stroke(); }
    if(k === 'planet'){ const cols = ['#6fb7ff', '#ff9a5a', '#9be36a']; glowCircle(c, 0, 0, 0, 7, cols[i % 3], cols[i % 3]);
      c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(-2, -2, 2.4, 0, Math.PI*2); c.fill();
      if(i === 0){ c.strokeStyle = 'rgba(255,230,180,.8)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, 0, 11, 3, -0.3, 0, Math.PI*2); c.stroke(); } }
    c.restore();
  }
}
// Prestige Saturn: großer gekippter Ring (hinten/vorne getrennt), kleine Monde und Glitzer
function drawSaturn(c, x, y, r, layer, t){
  const R = r*2.0, tilt = 0.32, rot = -0.35;
  c.save(); c.translate(x, y); c.rotate(rot);
  const bands = [['rgba(255,226,170,.9)', 0], ['rgba(230,180,120,.8)', 3], ['rgba(255,240,210,.7)', 6]];
  for(const [col, off] of bands){
    c.strokeStyle = col; c.lineWidth = 2.6;
    c.beginPath(); c.ellipse(0, 0, R - off, (R - off)*tilt, 0, layer === 'back' ? Math.PI : 0, layer === 'back' ? Math.PI*2 : Math.PI); c.stroke();
  }
  for(let i = 0; i < 2; i++){
    const a = t*0.0015 + i*Math.PI, front = Math.sin(a) > 0;
    if((layer === 'front') !== front) continue;
    glowCircle(c, Math.cos(a)*R*1.08, Math.sin(a)*R*tilt*1.08, 0, 4, '#ffffff', 'rgba(255,240,200,.2)');
  }
  c.restore();
}

// ===== Kugel-Skins (rollen komplett mit; Gesicht bleibt darauf) =====
// wird INNERHALB der gedrehten Kugel aufgerufen (Ursprung = Kugelmitte, Drehung = Rollwinkel)
function drawSkinBall(c, r, item, faceImg, faceW, faceH, faceY){
  const k = item.fx.kind, t = performance.now();
  const face = (scale) => { if(faceImg && faceImg.complete && faceImg.naturalWidth){ c.drawImage(faceImg, -faceW*scale/2, faceY*scale - faceH*scale/2, faceW*scale, faceH*scale); } };
  c.save();
  const circle = (rr) => { c.beginPath(); c.arc(0, 0, rr || r, 0, Math.PI*2); };
  const shade = () => { const g = c.createRadialGradient(-r*0.35, -r*0.4, r*0.1, 0, 0, r); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(0.6, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.28)'); c.fillStyle = g; circle(); c.fill(); };
  const outline = (col) => { c.strokeStyle = col || 'rgba(0,0,0,.45)'; c.lineWidth = 1.4; circle(); c.stroke(); };
  switch(k){
    case 'football':
      c.fillStyle = '#ffffff'; circle(); c.fill();
      c.fillStyle = '#20232a'; for(const [a, d] of [[0, 0], [0.6, 0.78], [1.86, 0.78], [3.12, 0.78], [4.38, 0.78], [5.64, 0.78]]){ const px = Math.cos(a)*r*d, py = Math.sin(a)*r*d; cosStar(c, px, py, d ? 5 : 6, a, 5); c.fill(); }
      shade(); outline(); face(0.62); break;
    case 'tennis':
      c.fillStyle = '#d7f04a'; circle(); c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = 2.4; c.beginPath(); c.arc(-r*1.15, 0, r*0.85, -0.9, 0.9); c.stroke(); c.beginPath(); c.arc(r*1.15, 0, r*0.85, Math.PI - 0.9, Math.PI + 0.9); c.stroke();
      shade(); outline('rgba(90,110,20,.6)'); face(0.62); break;
    case 'cheese':
      c.fillStyle = '#ffd34d'; circle(); c.fill();
      c.fillStyle = '#e8b52a'; for(const [a, d, s] of [[0.5, 0.6, 3.5], [2.2, 0.55, 2.6], [3.9, 0.65, 3], [5.3, 0.4, 2.2], [1.3, 0.75, 2]]){ c.beginPath(); c.arc(Math.cos(a)*r*d, Math.sin(a)*r*d, s, 0, Math.PI*2); c.fill(); }
      shade(); outline('rgba(160,110,10,.7)'); face(0.6); break;
    case 'basketball':
      c.fillStyle = '#ef7d22'; circle(); c.fill();
      c.strokeStyle = '#3a1d08'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-r, 0); c.lineTo(r, 0); c.moveTo(0, -r); c.lineTo(0, r); c.stroke();
      c.beginPath(); c.arc(-r*1.3, 0, r*0.95, -0.75, 0.75); c.stroke(); c.beginPath(); c.arc(r*1.3, 0, r*0.95, Math.PI - 0.75, Math.PI + 0.75); c.stroke();
      shade(); outline('rgba(60,25,5,.7)'); face(0.6); break;
    case 'melon':
      c.fillStyle = '#4d9e3a'; circle(); c.fill();
      c.strokeStyle = '#2d6b22'; c.lineWidth = 3; for(let i = -2; i <= 2; i++){ c.beginPath(); c.ellipse(i*r*0.38, 0, r*0.12, r*0.98, 0, 0, Math.PI*2); c.stroke(); }
      shade(); outline('rgba(20,60,10,.7)'); face(0.6); break;
    case 'yarn':
      c.fillStyle = '#e46f8f'; circle(); c.fill();
      c.strokeStyle = 'rgba(255,190,210,.8)'; c.lineWidth = 1.3; for(let i = 0; i < 7; i++){ c.beginPath(); c.ellipse(0, 0, r*0.95, r*(0.2 + i*0.11), i*0.45, 0, Math.PI*2); c.stroke(); }
      shade(); outline('rgba(120,30,60,.6)'); face(0.6); break;
    case 'billiard':
      c.fillStyle = '#16181d'; circle(); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, -r*0.55, r*0.33, 0, Math.PI*2); c.fill();
      c.fillStyle = '#16181d'; c.font = `bold ${Math.round(r*0.45)}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('8', 0, -r*0.53);
      shade(); outline('rgba(255,255,255,.25)'); face(0.52); break;
    case 'pumpkin':
      c.fillStyle = '#f08a24'; circle(); c.fill();
      c.strokeStyle = '#b8560e'; c.lineWidth = 1.6; for(let i = -2; i <= 2; i++){ c.beginPath(); c.ellipse(i*r*0.32, 0, r*0.28, r*0.98, 0, 0, Math.PI*2); c.stroke(); }
      c.fillStyle = '#4f7a2a'; c.fillRect(-2, -r - 5, 4, 7);
      shade(); outline('rgba(110,50,5,.7)'); face(0.6); break;
    case 'disco': {
      c.save(); circle(); c.clip(); c.fillStyle = '#9aa3b0'; c.fillRect(-r, -r, 2*r, 2*r);
      const s = 5.2; for(let gx = -r; gx < r; gx += s) for(let gy = -r; gy < r; gy += s){
        const v = Math.sin(gx*0.7 + gy*1.3 + t*0.006); c.fillStyle = v > 0.6 ? '#ffffff' : v > 0 ? '#cfd6e0' : v > -0.6 ? '#8d97a6' : '#6b7584';
        c.fillRect(gx + 0.4, gy + 0.4, s - 0.8, s - 0.8); }
      c.restore(); shade(); outline(); face(0.58);
      c.fillStyle = 'rgba(255,255,255,.9)'; cosStar(c, Math.cos(t*0.003)*r*0.6, -r*0.5, 3, t*0.004, 4); c.fill(); break; }
    case 'planet': {
      c.save(); circle(); c.clip();
      c.fillStyle = '#2e7fd6'; c.fillRect(-r, -r, 2*r, 2*r);
      c.fillStyle = '#5cc25a'; for(const [a, d, s] of [[0.3, 0.4, 0.45], [2.4, 0.5, 0.38], [4.4, 0.35, 0.5], [3.4, 0.8, 0.25]]){ c.beginPath(); c.ellipse(Math.cos(a)*r*d, Math.sin(a)*r*d, r*s, r*s*0.7, a, 0, Math.PI*2); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.55)'; for(let i = 0; i < 3; i++){ const a = t*0.0004 + i*2; c.beginPath(); c.ellipse(Math.cos(a)*r*0.5, Math.sin(a*1.3)*r*0.5, r*0.3, r*0.08, a, 0, Math.PI*2); c.fill(); }
      c.restore(); shade(); glowCircle(c, 0, 0, r*0.95, r*1.25, 'rgba(120,190,255,.45)', 'rgba(120,190,255,0)'); face(0.56); break; }
    case 'crystalball':
      glowCircle(c, 0, 0, 0, r, 'rgba(210,180,255,.7)', 'rgba(120,80,220,.5)');
      c.save(); circle(); c.clip(); c.strokeStyle = 'rgba(255,220,255,.6)'; c.lineWidth = 2;
      for(let i = 0; i < 3; i++){ c.beginPath(); c.arc(0, 0, r*(0.3 + i*0.2), t*0.002 + i, t*0.002 + i + 2.2); c.stroke(); } c.restore();
      face(0.6);
      c.fillStyle = 'rgba(255,255,255,.12)'; circle(); c.fill(); c.strokeStyle = 'rgba(240,230,255,.9)'; c.lineWidth = 1.6; circle(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.ellipse(-r*0.4, -r*0.45, r*0.22, r*0.1, -0.6, 0, Math.PI*2); c.fill(); break;
    case 'galaxy': {
      // Prestige: die ganze Kugel ist eine kleine Galaxie mit wandernden Sternen und Spiralarmen
      c.save(); circle(); c.clip();
      const g = c.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, '#5a3db8'); g.addColorStop(0.6, '#24124f'); g.addColorStop(1, '#0b0620');
      c.fillStyle = g; c.fillRect(-r, -r, 2*r, 2*r);
      c.globalCompositeOperation = 'lighter';
      for(let arm = 0; arm < 2; arm++) for(let i = 0; i < 26; i++){
        const s = i/26, a = arm*Math.PI + s*4.2 + t*0.0006, d = s*r*0.95;
        c.fillStyle = `rgba(${200 + arm*40},${170 + i*2},255,${0.55*(1 - s) + 0.15})`;
        c.beginPath(); c.arc(Math.cos(a)*d, Math.sin(a)*d, 1.6*(1 - s) + 0.6, 0, Math.PI*2); c.fill(); }
      for(let i = 0; i < 14; i++){ const a = i*2.4, d = (i*0.37 % 1)*r, tw = 0.5 + 0.5*Math.sin(t*0.006 + i);
        c.fillStyle = `rgba(255,255,255,${tw})`; c.fillRect(Math.cos(a)*d, Math.sin(a)*d, 1.2, 1.2); }
      c.restore(); face(0.55);
      glowCircle(c, 0, 0, r*0.9, r*1.3, 'rgba(160,120,255,.5)', 'rgba(160,120,255,0)'); break; }
    case 'lightorb':
      // Prestige: Elektrizität läuft dauernd über die Oberfläche
      glowCircle(c, 0, 0, 0, r, '#bfe7ff', '#2b7fd6');
      face(0.7);
      c.strokeStyle = 'rgba(240,250,255,.95)'; c.lineWidth = 1.5; c.shadowColor = '#7fd0ff'; c.shadowBlur = 8;
      { const seed = Math.floor(t/60); for(let i = 0; i < 4; i++){ const a0 = (seed*0.9 + i*1.6) % (Math.PI*2), a1 = a0 + 1.4 + (i % 2)*0.6;
        cosBolt(c, Math.cos(a0)*r*0.95, Math.sin(a0)*r*0.95, Math.cos(a1)*r*0.95, Math.sin(a1)*r*0.95, 6, 3.5); } }
      c.shadowBlur = 0; c.strokeStyle = 'rgba(200,235,255,.8)'; circle(); c.stroke(); break;
    default: face(1);
  }
  c.restore();
}

// Begleiter zeichnen (Weltposition aus dem Zustand)
function drawPet(c, st, item, ox, who){
  if(!item || !st || !st.pet) return;
  const k = item.fx.kind, pt = st.pet, x = pt.x - ox, t = performance.now();
  const idle = pt.idle > 90, bob = Math.sin(t*0.008)*(idle ? 1.5 : 0.6);
  c.save(); c.translate(x, pt.y); c.scale((pt.face < 0 ? -1 : 1)*1.45, 1.45);   // 1,45× – sonst zu klein neben der Figur
  const eye = (ex, ey, s) => { c.fillStyle = '#1d1a1f'; c.beginPath(); c.arc(ex, ey, s || 1.3, 0, Math.PI*2); c.fill(); };
  switch(k){
    case 'snail':
      c.fillStyle = '#d8c39a'; c.beginPath(); c.ellipse(0, -2, 9, 3, 0, 0, Math.PI*2); c.fill();
      c.fillStyle = '#b07a3c'; c.beginPath(); c.arc(-1, -7 + bob*0.3, 6, 0, Math.PI*2); c.fill();
      c.strokeStyle = '#7a4f22'; c.lineWidth = 1; c.beginPath(); c.arc(-1, -7 + bob*0.3, 3, 0, Math.PI*1.6); c.stroke();
      c.strokeStyle = '#d8c39a'; c.beginPath(); c.moveTo(7, -4); c.lineTo(9, -10); c.moveTo(5, -4); c.lineTo(6, -9); c.stroke(); eye(9, -10, 1); break;
    case 'chick':
      c.translate(0, idle ? -Math.abs(Math.sin(t*0.01))*3 : 0);
      c.fillStyle = '#ffe14d'; c.beginPath(); c.arc(0, -6, 6, 0, Math.PI*2); c.fill();
      c.fillStyle = '#ff9a2a'; c.beginPath(); c.moveTo(5, -7); c.lineTo(9, -6); c.lineTo(5, -5); c.fill(); eye(2.5, -8); break;
    case 'mouse':
      c.fillStyle = '#a8a2a6'; c.beginPath(); c.ellipse(0, -4, 7, 4.5, 0, 0, Math.PI*2); c.fill();
      c.beginPath(); c.arc(-2, -9, 3, 0, Math.PI*2); c.fill(); c.fillStyle = '#ffb7cc'; c.beginPath(); c.arc(-2, -9, 1.6, 0, Math.PI*2); c.fill();
      c.strokeStyle = '#a8a2a6'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-7, -3); c.quadraticCurveTo(-13, -6 + bob, -14, -1); c.stroke(); eye(5, -5); break;
    case 'frog':
      c.fillStyle = '#5cbf4a'; c.beginPath(); c.ellipse(0, -5, 8, 5.5, 0, 0, Math.PI*2); c.fill();
      c.beginPath(); c.arc(-3, -10, 2.8, 0, Math.PI*2); c.arc(3, -10, 2.8, 0, Math.PI*2); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(-3, -10, 1.6, 0, Math.PI*2); c.arc(3, -10, 1.6, 0, Math.PI*2); c.fill(); eye(-3, -10, 0.9); eye(3, -10, 0.9);
      if(idle && Math.sin(t*0.004) > 0.85){ c.fillStyle = '#ff7fa0'; c.beginPath(); c.ellipse(9, -5, 4, 1.2, 0, 0, Math.PI*2); c.fill(); } break;
    case 'duck':
      c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(0, -5, 8, 5, 0, 0, Math.PI*2); c.fill(); c.beginPath(); c.arc(5, -11, 4, 0, Math.PI*2); c.fill();
      c.fillStyle = '#ff9a2a'; c.beginPath(); c.ellipse(9.5, -10.5, 2.6, 1.3, 0, 0, Math.PI*2); c.fill(); eye(6, -12, 1);
      c.strokeStyle = '#d9d9d9'; c.lineWidth = 1; c.beginPath(); c.moveTo(-6, -6); c.quadraticCurveTo(-3, -9 + bob, 1, -6); c.stroke(); break;
    case 'rabbit':
      c.translate(0, pt.vy ? 0 : -Math.abs(Math.sin(t*(idle ? 0.006 : 0.015)))*3);
      c.fillStyle = '#f3ece6'; c.beginPath(); c.ellipse(0, -5, 7, 5, 0, 0, Math.PI*2); c.fill(); c.beginPath(); c.arc(5, -9, 4, 0, Math.PI*2); c.fill();
      c.beginPath(); c.ellipse(4, -16, 1.6, 5, -0.2, 0, Math.PI*2); c.ellipse(6.5, -16, 1.6, 5, 0.25, 0, Math.PI*2); c.fill(); eye(6.5, -10, 1); break;
    case 'ghost':
      c.translate(0, bob*2); c.globalAlpha = 0.85; c.fillStyle = '#f5f7ff';
      c.beginPath(); c.arc(0, -8, 7, Math.PI, 0); c.lineTo(7, 2); for(let i = 0; i < 4; i++) c.quadraticCurveTo(5 - i*3.5, 5, 3.5 - i*3.5, 2); c.closePath(); c.fill();
      c.globalAlpha = 1; eye(-2.5, -8, 1.3); eye(2.5, -8, 1.3); break;
    case 'bat': {
      c.translate(0, bob*2.5); const f = Math.sin(t*0.03)*6;
      c.fillStyle = '#4a3b5c'; c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(-8, -8 - f, -14, -4 + f*0.3); c.quadraticCurveTo(-8, -2, 0, 0); c.quadraticCurveTo(8, -2, 14, -4 + f*0.3); c.quadraticCurveTo(8, -8 - f, 0, -4); c.fill();
      c.beginPath(); c.arc(0, -3, 4, 0, Math.PI*2); c.fill(); c.fillStyle = '#ffd23f'; c.fillRect(-2.2, -4, 1.4, 1.4); c.fillRect(0.8, -4, 1.4, 1.4); break; }
    case 'robot':
      c.translate(0, bob*1.5);
      c.fillStyle = '#b8c4d0'; c.strokeStyle = '#5b6773'; c.lineWidth = 1; c.beginPath(); c.roundRect ? c.roundRect(-6, -14, 12, 11, 3) : c.rect(-6, -14, 12, 11); c.fill(); c.stroke();
      c.fillStyle = '#4fe3ff'; c.fillRect(-4, -11, 8, 3); c.strokeStyle = '#5b6773'; c.beginPath(); c.moveTo(0, -14); c.lineTo(0, -18); c.stroke();
      glowCircle(c, 0, -19, 0, 2.2, '#ff5c6c', '#c22a2a');
      c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, 0, 0, 5 + Math.sin(t*0.04), 'rgba(120,220,255,.8)', 'rgba(120,220,255,0)'); break;
    case 'mini': {
      // kleine Version der eigenen Figur (Gesicht des Charakters), rollt hinterher
      const img = who === 'f' ? ASSETS.pig : ASSETS.monkey;
      c.rotate(pt.x*0.08);
      if(img && img.complete && img.naturalWidth){ const w = 16, h = w*img.naturalHeight/img.naturalWidth; c.drawImage(img, -w/2, -h/2 - 7, w, h); } break; }
  }
  c.restore();
}

// Prestige-Funkeln um die Kugel
function drawPrestigeSparkle(c, x, y, st){
  if(!st || !st.sparks.length) return;
  c.save(); c.globalCompositeOperation = 'lighter';
  for(const s of st.sparks){ const a = s.life/s.max, k = Math.sin(a*Math.PI);
    c.fillStyle = `rgba(255,250,230,${k})`; cosStar(c, x + Math.cos(s.a)*s.d, y + Math.sin(s.a)*s.d, 3.2*k + 0.5, s.a, 4); c.fill(); }
  c.restore();
}

// ===== Einbindung ins Spiel =====
const cosItemsOf = who => ({trail:equippedItem(who, 'trail'), aura:equippedItem(who, 'aura'), pet:equippedItem(who, 'pet'),
                            orbit:equippedItem(who, 'orbit'), skin:equippedItem(who, 'skin')});
// im festen Takt aus stepSim (14-spielschleife.js)
function cosmeticsStep(){
  if(!p1 || !p2) return;
  for(const [P, who] of [[p1, 'm'], [p2, 'f']]){
    if(deathState && P === deathState.victim){ COS_STATE[who].parts.length = 0; continue; }
    cosStep(playerRig(P), COS_STATE[who], who, cosItemsOf(who));
  }
}
// hinter der Figur (vor dem Körper aufgerufen, Bildschirmkoordinaten)
function cosmeticsDrawBack(P, camX){
  const who = P === p1 ? 'm' : 'f', it = cosItemsOf(who), st = COS_STATE[who], rig = playerRig(P), x = rig.x - camX;
  drawTrail(ctx, rig, st, it.trail, camX);
  drawPet(ctx, st, it.pet, camX, who);
  drawAura(ctx, x, rig.y, rig.r, it.aura, 'back');
  drawOrbit(ctx, x, rig.y, rig.r, it.orbit, 'back');
}
// vor der Figur
function cosmeticsDrawFront(P, camX){
  const who = P === p1 ? 'm' : 'f', it = cosItemsOf(who), st = COS_STATE[who], rig = playerRig(P), x = rig.x - camX;
  drawAura(ctx, x, rig.y, rig.r, it.aura, 'front');
  drawOrbit(ctx, x, rig.y, rig.r, it.orbit, 'front');
  drawPrestigeSparkle(ctx, x, rig.y, st);
}
const cosSkinOf = P => equippedItem(P === p1 ? 'm' : 'f', 'skin');
