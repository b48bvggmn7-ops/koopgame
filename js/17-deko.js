// 17-deko.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Dschungel-Deko in der Spielwelt: Pflanzen, Moos, Vögel ----------
// Reine Deko: nichts davon hat Kollision oder beeinflusst das Spiel. Pflanzen stehen auf freien
// Oberseiten von Boden/Wand, aber NICHT dort, wo Münzen, Stacheln, Hebel, Checkpoints, Start oder Ziel sind
// (damit alles Spielwichtige gut erkennbar bleibt). Vögel sitzen auf dem Boden und flattern weg,
// wenn eine Figur näher als BIRD_SCARE_DIST kommt; nach BIRD_RETURN_MS kommen sie zurück.
const BIRD_SCARE_DIST = 170;
const BIRD_RETURN_MS = 9000;
const DECO_PLANT_CHANCE = 0.38;   // Anteil der freien Boden-Kästchen mit Pflanze
const DECO_BIRD_EVERY = 640;      // ungefähr ein Vogel pro so vielen Pixeln freiem Boden …
const DECO_BIRD_GAP = 520;        // … und waagerecht mind. so weit vom nächsten Vogel

let decoFor = null;               // für welches solids-Array die Deko berechnet ist
let decoPlants = [], decoMoss = [], birds = [];

function decoHash(a, b){ let h = Math.imul(a|0, 374761393) ^ Math.imul(b|0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function decoSprite(w, h, draw){ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }

// Pflanzen-Bilder einmal vorzeichnen (Fuß unten in der Mitte)
const DECO_SPRITES = [
  // Farn
  decoSprite(64, 44, (g, w, h)=>{
    for(let k = 0; k < 7; k++){
      const a = -Math.PI/2 + (k - 3)*0.36, len = 30 + (k % 2)*8;
      const ex = w/2 + Math.cos(a)*len, ey = h + Math.sin(a)*len*0.9;
      g.strokeStyle = k % 2 ? '#3f8a4c' : '#52a05c'; g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(w/2, h); g.quadraticCurveTo(w/2 + Math.cos(a)*len*0.6, h + Math.sin(a)*len*0.5 - 10, ex, ey); g.stroke();
      g.fillStyle = g.strokeStyle;
      for(let f = 0.3; f < 1; f += 0.12){
        const fx = w/2 + (ex - w/2)*f, fy = h + (ey - h)*f - Math.sin(f*Math.PI)*7;
        g.beginPath(); g.ellipse(fx, fy, 4*(1.1 - f) + 1.5, 1.6, a + 1.2, 0, Math.PI*2); g.fill();
      }
    }
  }),
  // Grasbüschel
  decoSprite(40, 30, (g, w, h)=>{
    for(let k = 0; k < 9; k++){
      const x = 8 + k*3, tip = w/2 + (k - 4)*4.5, top = 4 + (k % 3)*5;
      g.fillStyle = k % 2 ? '#4d9a50' : '#62b05e';
      g.beginPath(); g.moveTo(x - 2, h); g.quadraticCurveTo(x, h - 12, tip, top); g.quadraticCurveTo(x + 1, h - 10, x + 2, h); g.fill();
    }
  }),
  // rote Helikonie / Blüte
  decoSprite(40, 48, (g, w, h)=>{
    g.strokeStyle = '#3f8a4c'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(w/2, h); g.quadraticCurveTo(w/2 - 3, h - 22, w/2 + 2, 10); g.stroke();
    g.fillStyle = '#4f9b55';
    g.beginPath(); g.ellipse(w/2 - 9, h - 14, 9, 3.5, -0.6, 0, Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(w/2 + 9, h - 20, 9, 3.5, 0.6, 0, Math.PI*2); g.fill();
    for(let k = 0; k < 4; k++){
      const y = 12 + k*7, s = k % 2 ? 1 : -1;
      g.fillStyle = '#e8483a'; g.beginPath(); g.moveTo(w/2, y); g.lineTo(w/2 + s*10, y - 3); g.lineTo(w/2 + s*3, y + 5); g.closePath(); g.fill();
      g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(w/2 + s*10, y - 3); g.lineTo(w/2 + s*7, y - 1); g.lineTo(w/2 + s*8, y - 4); g.fill();
    }
  }),
  // kleine rosa Blumen
  decoSprite(36, 26, (g, w, h)=>{
    g.fillStyle = '#4f9b55';
    for(const [x, a] of [[12, -0.5], [24, 0.5], [18, 0]]){ g.beginPath(); g.ellipse(x, h - 5, 7, 3, a, 0, Math.PI*2); g.fill(); }
    for(const [x, y, c] of [[10, 9, '#ff8fc0'], [20, 5, '#ffffff'], [27, 11, '#ff8fc0']]){
      g.strokeStyle = '#3f8a4c'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(w/2, h); g.stroke();
      g.fillStyle = c;
      for(let p = 0; p < 5; p++){ const a = p*Math.PI*2/5; g.beginPath(); g.arc(x + Math.cos(a)*3, y + Math.sin(a)*3, 2.6, 0, Math.PI*2); g.fill(); }
      g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(x, y, 1.8, 0, Math.PI*2); g.fill();
    }
  }),
  // großes Blatt (Monstera-artig)
  decoSprite(46, 40, (g, w, h)=>{
    for(const [a, len, c] of [[-2.2, 30, '#3e8a4a'], [-0.95, 32, '#4f9f58'], [-1.6, 36, '#5bae62']]){
      const ex = w/2 + Math.cos(a)*len, ey = h + Math.sin(a)*len;
      const nx = -Math.sin(a), ny = Math.cos(a), wd = 9;
      g.fillStyle = c; g.beginPath(); g.moveTo(w/2, h);
      g.quadraticCurveTo((w/2 + ex)/2 + nx*wd, (h + ey)/2 + ny*wd, ex, ey);
      g.quadraticCurveTo((w/2 + ex)/2 - nx*wd, (h + ey)/2 - ny*wd, w/2, h); g.fill();
      g.strokeStyle = 'rgba(220,250,210,0.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(w/2, h); g.lineTo(ex, ey); g.stroke();
    }
  }),
];
const BIRD_PALS = [
  {body:'#3fa7e0', belly:'#cdeeff', wing:'#2a7fb5', beak:'#ffb02e'},
  {body:'#e8574a', belly:'#ffd9c2', wing:'#b83a30', beak:'#ffcf3a'},
  {body:'#ffcc33', belly:'#fff4c8', wing:'#e09a00', beak:'#ff8c3a'},
  {body:'#5cc27a', belly:'#e2f7d0', wing:'#3a9a58', beak:'#ffb02e'},
];

// Steht an (x,y) ein festes Teil? (bewegte Teile, Türen, Bröckelboden zählen nicht als "fest")
function decoSolidAt(x, y){
  for(const s of solids){
    if(s.type !== 'ground' && s.type !== 'wall' && s.type !== 'platform') continue;
    if(x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h) return true;
  }
  return false;
}
function buildDeco(){
  decoFor = solids; decoPlants = []; decoMoss = []; birds = [];
  // Spielwichtige Punkte, an denen keine Pflanze/kein Vogel stehen soll
  const keep = [];
  for(const c of coins) keep.push([c.x, c.y]);
  for(const sp of spikes) keep.push([sp.x, sp.y - 20]);
  for(const sw of switchDefs) keep.push([sw.x, sw.y]);
  for(const cp of checkpointDefs) keep.push([cp.x, cp.y - 20]);
  if(goal) keep.push([goal.x, goal.y - 20]);
  for(const s of solids) if(s.type === 'door' || s.type === 'crumble' || s.type === 'moveplat') keep.push([s.x + s.w/2, s.y]);
  const blocked = (x, top)=> keep.some(([kx, ky])=> Math.abs(kx - x) < 40 && ky > top - 90 && ky < top + 30);
  const nearStart = x => Math.abs(x - levelStartM.x) < 260 || (levelStartF && Math.abs(x - levelStartF.x) < 260);
  let sinceBird = DECO_BIRD_EVERY*0.6;
  const tops = solids.filter(s => s.type === 'ground' || s.type === 'wall').sort((a, b)=> a.x - b.x || a.y - b.y);
  for(const s of tops){
    for(let cx = s.x; cx < s.x + s.w; cx += 40){
      const mid = cx + 20;
      if(decoSolidAt(mid, s.y - 2)) continue;           // oben liegt noch etwas -> keine Oberseite
      if(s.y < 40) continue;
      const r = decoHash(cx, s.y);
      if(s.type === 'wall'){
        decoMoss.push({x: cx, y: s.y, seed: r});
        continue;
      }
      if(blocked(mid, s.y)) continue;
      sinceBird += 40;
      if(sinceBird >= DECO_BIRD_EVERY && !nearStart(mid) && r > 0.3 && !birds.some(b => Math.abs(b.homeX - mid) < DECO_BIRD_GAP)){
        sinceBird = 0;
        const pal = BIRD_PALS[Math.floor(decoHash(cx, 7)*BIRD_PALS.length)];
        birds.push({x: mid, y: s.y, homeX: mid, homeY: s.y, pal, dir: r > 0.65 ? -1 : 1,
                     state: 'sit', t: 0, vx: 0, vy: 0, flap: 0, hop: 0, peck: 0});
        continue;
      }
      if(r < DECO_PLANT_CHANCE){
        const kind = Math.floor(decoHash(cx, s.y + 3)*DECO_SPRITES.length);
        decoPlants.push({x: cx + 8 + decoHash(cx, 11)*24, y: s.y + 7, kind,
                         scale: 0.8 + decoHash(cx, 13)*0.4, flip: decoHash(cx, 17) < 0.5, ph: r*10});
      }
    }
  }
  // Moos/Ranken an Wandseiten, die zur Luft zeigen
  for(const s of solids){
    if(s.type !== 'wall') continue;
    for(let cy = s.y; cy < s.y + s.h; cy += 40){
      for(const side of [-1, 1]){
        const sx = side < 0 ? s.x - 2 : s.x + s.w + 2;
        if(decoSolidAt(sx, cy + 20)) continue;
        const r = decoHash(sx, cy);
        if(r < 0.3) decoMoss.push({x: side < 0 ? s.x : s.x + s.w, y: cy, side, seed: r});
      }
    }
  }
}

function drawGroundDeco(){
  if(decoFor !== solids) buildDeco();
  const t = performance.now();
  // Moos auf Wand-Oberseiten und Ranken an Wandseiten
  for(const m of decoMoss){
    const x = m.x - camX;
    if(x < -50 || x > VW + 50) continue;
    if(!m.side){
      ctx.fillStyle = '#5aa35a';
      ctx.beginPath(); ctx.moveTo(x, m.y + 6);
      for(let k = 0; k <= 8; k++) ctx.lineTo(x + k*5, m.y + 2 + Math.sin(k*1.9 + m.seed*20)*2.2);
      ctx.lineTo(x + 40, m.y + 8);
      for(let k = 8; k >= 0; k--) ctx.lineTo(x + k*5, m.y + 8 + (k % 3)*2.5 + m.seed*4);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7cc36f';
      for(let k = 0; k < 4; k++){ ctx.beginPath(); ctx.arc(x + 5 + k*10 + m.seed*6, m.y + 3, 2.6, 0, Math.PI*2); ctx.fill(); }
    } else {
      const sway = Math.sin(t*0.0012 + m.seed*30)*2;
      ctx.strokeStyle = '#3f8a4c'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, m.y + 2);
      ctx.quadraticCurveTo(x + m.side*(5 + sway), m.y + 20, x + m.side*(1 + sway*0.5), m.y + 36 + m.seed*20); ctx.stroke();
      ctx.fillStyle = '#5aae5e';
      for(let k = 0; k < 4; k++){
        const yy = m.y + 8 + k*8, xx = x + m.side*(3 + Math.sin(k + m.seed*9)*2 + sway*0.6);
        ctx.beginPath(); ctx.ellipse(xx + m.side*3, yy, 4, 2.2, m.side*(0.5 + k*0.2), 0, Math.PI*2); ctx.fill();
      }
    }
  }
  // Pflanzen (wiegen sich leicht, weichen Figuren aus)
  for(const pl of decoPlants){
    const img = DECO_SPRITES[pl.kind], x = pl.x - camX;
    if(x < -60 || x > VW + 60) continue;
    let bend = Math.sin(t*0.0016 + pl.ph)*0.05;
    for(const p of [p1, p2]){
      const dx = pl.x - p.x;
      if(Math.abs(dx) < 26 && Math.abs(p.y - pl.y) < 30) bend += Math.sign(dx || 1)*0.35*(1 - Math.abs(dx)/26);
    }
    ctx.save(); ctx.translate(x, pl.y); ctx.rotate(bend);
    ctx.scale(pl.flip ? -pl.scale : pl.scale, pl.scale);
    ctx.drawImage(img, -img.width/2, -img.height);
    ctx.restore();
  }
}

// Vögel: werden im festen Takt mit der Spiel-Physik bewegt (stepSim), gezeichnet mit Überblendung
function updateBirds(){
  if(decoFor !== solids) buildDeco();
  for(const b of birds){
    if(b.state === 'sit'){
      b.t += 16.6;
      if(b.hop > 0) b.hop -= 16.6;
      if(b.peck > 0) b.peck -= 16.6;
      if(b.hop <= 0 && b.peck <= 0 && Math.random() < 0.006){
        if(Math.random() < 0.5) b.peck = 380; else { b.hop = 280; if(Math.random() < 0.4) b.dir = -b.dir; }
      }
      for(const p of [p1, p2]){
        const dx = b.x - p.x, dy = b.y - p.y;
        if(Math.abs(dx) < BIRD_SCARE_DIST && Math.abs(dy) < 140){
          b.state = 'fly'; b.dir = dx >= 0 ? 1 : -1;
          b.vx = b.dir*(2.4 + Math.random()*1.2); b.vy = -3.2 - Math.random()*1.2; b.t = 0;
          const f = 2100 + Math.random()*500;   // leises Zwitschern
          playTones([[f, 0, 0.05], [f*1.2, 0.07, 0.05]], 'sine', 0.012);
          SFX.birdFlap(b.x);   // Flügelflattern (18-sound.js)
          break;
        }
      }
    } else if(b.state === 'fly'){
      b.t += 16.6; b.flap += 0.55;
      b.vy = Math.max(-5.5, b.vy - 0.05); b.vx *= 1.004;
      b.x += b.vx; b.y += b.vy + Math.sin(b.flap)*0.6;
      if(b.y < -80 || b.t > 4000){ b.state = 'gone'; b.t = 0; }
    } else {
      b.t += 16.6;
      const near = Math.abs(p1.x - b.homeX) < 700 || Math.abs(p2.x - b.homeX) < 700;
      if(b.t > BIRD_RETURN_MS && !near){
        b.state = 'sit'; b.x = b._px = b.homeX; b.y = b._py = b.homeY; b.t = 0;
      }
    }
  }
}
function drawBirds(){
  for(const b of birds){
    if(b.state === 'gone') continue;
    const x = b.x - camX;
    if(x < -40 || x > VW + 40) continue;
    const pal = b.pal, flying = b.state === 'fly';
    const hopY = b.hop > 0 ? -Math.sin((1 - b.hop/280)*Math.PI)*7 : 0;
    ctx.save(); ctx.translate(Math.round(x), Math.round(b.y + hopY)); ctx.scale(b.dir, 1);
    if(!flying){
      ctx.strokeStyle = '#c47a2a'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-2, -4); ctx.lineTo(-3, 0); ctx.moveTo(2, -4); ctx.lineTo(2, 0); ctx.stroke();
    }
    const by = flying ? -2 : -10;
    const tilt = flying ? -0.25 : (b.peck > 0 ? 0.45*Math.sin((1 - b.peck/380)*Math.PI) : 0);
    ctx.translate(0, by); ctx.rotate(tilt);
    // Schwanz
    ctx.fillStyle = pal.wing;
    ctx.beginPath(); ctx.moveTo(-7, -1); ctx.lineTo(-15, -6); ctx.lineTo(-14, 2); ctx.closePath(); ctx.fill();
    // Körper + Bauch
    ctx.fillStyle = pal.body; ctx.beginPath(); ctx.ellipse(0, 0, 9, 7, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = pal.belly; ctx.beginPath(); ctx.ellipse(2, 2.5, 6, 4, 0, 0, Math.PI*2); ctx.fill();
    // Kopf
    ctx.fillStyle = pal.body; ctx.beginPath(); ctx.arc(6, -6, 5.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = pal.beak; ctx.beginPath(); ctx.moveTo(10.5, -7); ctx.lineTo(15, -5.5); ctx.lineTo(10.5, -4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(7.5, -7, 2.2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1d1d1d'; ctx.beginPath(); ctx.arc(8, -7, 1.3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(8.4, -7.5, 0.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,120,140,0.45)'; ctx.beginPath(); ctx.arc(6, -4, 1.6, 0, Math.PI*2); ctx.fill();
    // Flügel
    ctx.fillStyle = pal.wing;
    if(flying){
      const f = Math.sin(b.flap);
      ctx.beginPath(); ctx.moveTo(-2, -2); ctx.quadraticCurveTo(-4, -2 - 14*f, -12, -4 - 12*f); ctx.quadraticCurveTo(-6, 0, -2, 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.ellipse(-2, -0.5, 6, 4, -0.3, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
}
