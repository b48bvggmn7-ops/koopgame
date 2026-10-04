// 21-figuren-leben.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Mehr Leben für die Figuren (nur Anzeige) ----------
// Stauchen beim Landen / Strecken beim Absprung (an den Füßen verankert), sanftes Atmen im Stehen,
// Staubwölkchen bei Landung, Sprung und Wandsprung. Kleine Entdeckung: stehen Affe und Schweinchen eine Weile
// nah beieinander, steigen Herzchen auf. Ausgelöst vom Geräusch-Beobachter (18-sound.js) – ändert nichts am Spiel.
const dustFx = [];
const heartFx = [];
let togetherMs = 0;

function dustPuff(x, y, n, dirX, size){
  for(let i = 0; i < n; i++){
    const a = Math.PI + (i/(n - 1 || 1))*Math.PI;          // halbkreisförmig nach oben/seitlich
    dustFx.push({x, y, vx: Math.cos(a)*(1 + Math.random()*1.4) + (dirX || 0)*1.2, vy: Math.sin(a)*0.8 - 0.3,
                 r: (size || 4) + Math.random()*3, t0: performance.now(), life: 380 + Math.random()*200});
  }
}
function fxLand(pl, speed){
  pl._landT = performance.now(); pl._landV = Math.max(0.25, Math.min(1, (speed - 3)/9));
  dustPuff(pl.x, pl.y, 4 + Math.round(4*pl._landV), 0, 3 + 2*pl._landV);
}
function fxJump(pl, wall){
  pl._jumpT = performance.now();
  if(wall) dustPuff(pl.x - (pl.vx > 0 ? 1 : -1)*pl.w*0.5, pl.y - pl.h*0.5, 5, pl.vx > 0 ? 0.6 : -0.6, 3);
  else dustPuff(pl.x, pl.y, 4, 0, 3);
}
// Skalierung für die Figur: [breite, höhe], an den Füßen verankert (siehe drawCharacter)
function charSquash(pl){
  const t = performance.now();
  let sx = 1, sy = 1;
  if(pl._landT){ const k = (t - pl._landT)/200; if(k < 1){ const a = Math.sin(k*Math.PI)*0.2*pl._landV; sy -= a; sx += a*0.9; } }
  if(pl._jumpT){ const k = (t - pl._jumpT)/180; if(k < 1){ const a = Math.sin(k*Math.PI)*0.14; sy += a; sx -= a*0.6; } }
  if(pl.grounded && Math.abs(pl.vx) < 0.15){ const b = Math.sin(t*0.0035 + (pl.male ? 0 : 1.7))*0.018; sy += b; sx -= b*0.5; }   // atmen
  return [sx, sy];
}
function drawDust(){
  const t = performance.now();
  for(let i = dustFx.length - 1; i >= 0; i--){
    const d = dustFx[i], k = (t - d.t0)/d.life;
    if(k >= 1){ dustFx.splice(i, 1); continue; }
    const m = Math.min(3, frameDt/STEP);
    d.x += d.vx*m; d.y += d.vy*m; d.vx *= Math.pow(0.92, m); d.vy *= Math.pow(0.92, m);
    ctx.globalAlpha = 0.5*(1 - k);
    ctx.fillStyle = '#efe2c8';
    ctx.beginPath(); ctx.arc(d.x - camX, d.y, d.r*(0.7 + k*0.8), 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function drawHearts(){
  const t = performance.now();
  const close = p1 && p2 && !deathState && Math.abs(p1.x - p2.x) < 56 && Math.abs(p1.y - p2.y) < 10 && p1.grounded && p2.grounded &&
                Math.abs(p1.vx) < 0.3 && Math.abs(p2.vx) < 0.3;
  togetherMs = close ? togetherMs + Math.min(100, frameDt) : 0;
  if(togetherMs > 1500 && Math.random() < frameDt/700){
    heartFx.push({x: (p1.x + p2.x)/2 + (Math.random() - 0.5)*20, y: Math.min(p1.y, p2.y) - 40, t0: t, wob: Math.random()*6});
    if(heartFx.length === 1 || Math.random() < 0.3) sTone(1320 + Math.random()*300, 0, 0.12, {type: 'triangle', vol: 0.012});
  }
  for(let i = heartFx.length - 1; i >= 0; i--){
    const h = heartFx[i], k = (t - h.t0)/1400;
    if(k >= 1){ heartFx.splice(i, 1); continue; }
    const x = h.x - camX + Math.sin(k*6 + h.wob)*6, y = h.y - k*45, s = 0.6 + Math.min(1, k*4)*0.5;
    ctx.save(); ctx.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7)/0.3; ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#ff6f9f';
    ctx.beginPath(); ctx.moveTo(0, 4); ctx.bezierCurveTo(-9, -3, -5, -10, 0, -5); ctx.bezierCurveTo(5, -10, 9, -3, 0, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(-3, -5, 1.4, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
}
