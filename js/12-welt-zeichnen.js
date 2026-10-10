// 12-welt-zeichnen.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

let camX = 0;     // gerundete Kamera zum Zeichnen (ganze Pixel -> kein Flimmern/Zittern der Welt)
let camPos = 0;   // weiche, ungerundete Kameraposition
// Licht-Teilchen je Thema (10a-themen.js): schweben hoch (float), Glühwürmchen (firefly) oder Glut (ember)
let particles = [];
function initParticles(){
  const P = THEME.particles;
  particles = Array.from({length: P.n}, () => ({
    x: Math.random()*LEVEL_W, y: Math.random()*H,
    r: 1+Math.random()*2, speed: (P.mode === 'ember' ? 0.5 : 0.15)+Math.random()*0.35,
    phase: Math.random()*Math.PI*2, par: 0.5+Math.random()*0.4, wx: Math.random()*1000,
  }));
}
initParticles();
// Münze in 3D: Kante (Dicke) wird beim Drehen seitlich sichtbar, Fläche mit Licht oben links,
// geprägter Innenring, Glanzlicht; dunkler Umriss + weicher Schein und Schatten -> hebt sich vom
// Dschungel-Hintergrund ab. Nur Zeichnung – der Einsammel-Bereich (updateCoins) ist unabhängig davon.
const COIN_DRAW_R = 12.5;   // vorher 11
function drawCoin3D(x, y, r, ang, pal, alpha, glow, g){
  if(r < 1) return;
  const c = g || ctx;   // g: andere Zeichenfläche (für Tests)
  const cs = Math.cos(ang), face = Math.max(0.12, Math.abs(cs)), rx = r*face;
  const thick = r*0.28*Math.sqrt(1 - face*face) + r*0.04;    // sichtbare Kante, am größten in Seitenansicht
  const side = Math.sin(ang) >= 0 ? 1 : -1;
  c.save(); c.globalAlpha = alpha; c.translate(x, y);
  if(glow){
    const gl = c.createRadialGradient(0, 0, r*0.6, 0, 0, r*1.9);
    gl.addColorStop(0, `rgba(${pal[3]},0.38)`); gl.addColorStop(1, `rgba(${pal[3]},0)`);
    c.fillStyle = gl; c.beginPath(); c.arc(0, 0, r*1.9, 0, Math.PI*2); c.fill();
    c.fillStyle = 'rgba(20,40,20,0.18)';                    // weicher Schatten nach unten rechts
    c.beginPath(); c.ellipse(2.5, 3.5, Math.max(rx, thick) + 1, r, 0, 0, Math.PI*2); c.fill();
  }
  // Kante (Rückseite + Verbindungsstück)
  c.fillStyle = pal[0];
  c.beginPath(); c.ellipse(-side*thick, 0, rx, r, 0, 0, Math.PI*2); c.fill();
  c.fillRect(Math.min(0, -side*thick), -r, thick, r*2);
  c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 1;
  for(let k = -3; k <= 3; k++){ const yy = k*r/4; c.beginPath(); c.moveTo(0, yy); c.lineTo(-side*thick, yy); c.stroke(); }
  // Vorderseite mit Lichtverlauf
  const fg = c.createLinearGradient(-rx, -r, rx, r);
  fg.addColorStop(0, pal[2]); fg.addColorStop(0.45, pal[1]); fg.addColorStop(1, pal[0]);
  c.fillStyle = fg; c.beginPath(); c.ellipse(0, 0, rx, r, 0, 0, Math.PI*2); c.fill();
  c.strokeStyle = 'rgba(40,25,0,0.45)'; c.lineWidth = 1.4; c.stroke();
  // geprägter Innenring (oben dunkel, unten hell = vertieft)
  const ir = r*0.68, irx = rx*0.68;
  if(irx > 1.2){
    c.lineWidth = Math.max(1, r*0.12);
    c.strokeStyle = pal[0]; c.beginPath(); c.ellipse(0, 0, irx, ir, 0, Math.PI, Math.PI*2); c.stroke();
    c.strokeStyle = pal[2]; c.beginPath(); c.ellipse(0, 0, irx, ir, 0, 0, Math.PI); c.stroke();
    // Stern in der Mitte
    if(face > 0.3){
      c.fillStyle = pal[2]; c.beginPath();
      for(let k = 0; k < 10; k++){
        const a = -Math.PI/2 + k*Math.PI/5, rr = (k % 2 ? 0.18 : 0.42)*r;
        c.lineTo(Math.cos(a)*rr*face, Math.sin(a)*rr);
      }
      c.closePath(); c.fill();
      c.strokeStyle = pal[0]; c.lineWidth = 0.8; c.stroke();
    }
  }
  // Glanzlicht
  c.fillStyle = 'rgba(255,255,255,0.75)';
  c.beginPath(); c.ellipse(-rx*0.42, -r*0.48, Math.max(0.6, rx*0.22), r*0.14, -0.6, 0, Math.PI*2); c.fill();
  c.restore();
}
// Bröckelboden: wachsende Risse und rieselnde Krümel während der Vorwarnung (ohne Spielzustand zu ändern:
// alles wird aus s.timer berechnet)
function crumbleRnd(a, b){ const v = Math.sin(a*12.9898 + b*78.233)*43758.5453; return v - Math.floor(v); }
// Bröckelboden-Aussehen: lose, sandfarbene Steinbrocken mit dunklen Fugen, trockenes Moos oben,
// bröselige Unterseite mit hängenden Krümeln und ab und zu rieselndem Sand -> klar anders als normaler Boden.
const CRUMBLE_PAL = {light:'#e6c88f', mid:'#cfa66a', dark:'#a97c47', edge:'#6b4a26', gap:'rgba(60,35,15,.75)',
                     moss:'#9bab5c', mossLight:'#c2cf7e', speck:'rgba(120,85,45,.55)'};
const CRUMBLE_PAL_DEFAULT = {...CRUMBLE_PAL};   // je Level-Thema überschrieben (setTheme, 10a-themen.js)
function drawCrumbleBlocks(s, x, y){
  const T = 40, nx = Math.max(1, Math.round(s.w/T)), ny = Math.max(1, Math.round(s.h/T));
  ctx.save();
  // dunkle Fugen/Hintergrund
  ctx.fillStyle = CRUMBLE_PAL.gap; roundRect(x + 1, y + 2, s.w - 2, s.h - 3, 7); ctx.fill();
  for(let iy = 0; iy < ny; iy++){
    for(let ix = 0; ix < nx; ix++){
      const wx = s.x + ix*T, wy = s.y + iy*T, bx = x + ix*T, by = y + iy*T;
      const r = k => crumbleRnd(wx + k*7.3, wy + k*3.1);
      // zwei Brocken pro Kästchen (oben/unten versetzt) mit leicht schiefen Kanten
      const split = 17 + r(1)*6;
      for(const [y0, y1, k] of [[1, split, 2], [split + 2, T - 2, 5]]){
        const inset = 1.6;
        const pts = [[bx + inset + r(k)*2, by + y0 + r(k+1)*1.5], [bx + T - inset - r(k+2)*2, by + y0 + r(k+3)*1.5],
                     [bx + T - inset - r(k+4)*2.5, by + y1 - r(k+5)*1.5], [bx + inset + r(k+6)*2.5, by + y1 - r(k+7)*1.5]];
        const g = ctx.createLinearGradient(0, by + y0, 0, by + y1);
        g.addColorStop(0, CRUMBLE_PAL.light); g.addColorStop(0.6, CRUMBLE_PAL.mid); g.addColorStop(1, CRUMBLE_PAL.dark);
        ctx.fillStyle = g; ctx.beginPath();
        pts.forEach(([px, py], i)=> i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = CRUMBLE_PAL.edge; ctx.lineWidth = 1.2; ctx.stroke();
        // heller Lichtrand oben
        ctx.strokeStyle = 'rgba(255,245,215,.6)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(pts[0][0] + 2, pts[0][1] + 1.5); ctx.lineTo(pts[1][0] - 2, pts[1][1] + 1.5); ctx.stroke();
        // Steinchen-Sprenkel
        ctx.fillStyle = CRUMBLE_PAL.speck;
        for(let q = 0; q < 3; q++){
          ctx.beginPath(); ctx.arc(bx + 6 + r(k+8+q)*28, by + y0 + 4 + r(k+11+q)*(y1 - y0 - 8), 1 + r(k+14+q)*1.2, 0, Math.PI*2); ctx.fill();
        }
        // feiner Haarriss
        if(r(k+17) > 0.4){
          const cx0 = bx + 8 + r(k+18)*24;
          ctx.strokeStyle = 'rgba(80,50,20,.6)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(cx0, by + y0 + 2); ctx.lineTo(cx0 + 3 - r(k+19)*6, by + (y0 + y1)/2); ctx.lineTo(cx0 + 1, by + y1 - 2); ctx.stroke();
        }
      }
    }
  }
  // trockenes Moos oben (nur wo nichts darüber liegt) – kein sattes Gras wie beim normalen Boden
  for(let ix = 0; ix < nx; ix++){
    const wx = s.x + ix*T, bx = x + ix*T;
    ctx.fillStyle = CRUMBLE_PAL.moss;
    ctx.beginPath(); ctx.moveTo(bx + 2, y + 4);
    for(let q = 0; q <= 6; q++) ctx.lineTo(bx + 2 + q*6, y + 1 + crumbleRnd(wx + q, 3)*2.5);
    for(let q = 6; q >= 0; q--) ctx.lineTo(bx + 2 + q*6, y + 4 + crumbleRnd(wx + q, 5)*3.5);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = CRUMBLE_PAL.mossLight;
    for(let q = 0; q < 3; q++){ ctx.beginPath(); ctx.arc(bx + 6 + crumbleRnd(wx, q + 9)*28, y + 2.5, 1.4, 0, Math.PI*2); ctx.fill(); }
  }
  // bröselige Unterseite: hängende Krümel
  const bottom = y + s.h - 1;
  ctx.fillStyle = CRUMBLE_PAL.dark;
  for(let q = 0; q < s.w/9; q++){
    const px = x + 4 + crumbleRnd(s.x + q, 21)*(s.w - 8), len = 2 + crumbleRnd(q, s.x)*5;
    ctx.beginPath(); ctx.moveTo(px - 2.5, bottom - 1); ctx.lineTo(px + 2.5, bottom - 1); ctx.lineTo(px + crumbleRnd(q, 4) - 0.5, bottom + len); ctx.closePath(); ctx.fill();
  }
  // ab und zu rieselt etwas Sand herunter (rein zeitbasiert, kein Spielzustand)
  const tt = performance.now();
  for(let q = 0; q < Math.max(1, Math.round(s.w/60)); q++){
    const period = 1800 + crumbleRnd(s.x, q)*1400, ph = ((tt + crumbleRnd(q, s.y)*period) % period) / period;
    if(ph > 0.35) continue;
    const a = ph/0.35, px = x + 6 + crumbleRnd(s.x + q*13, Math.floor((tt + crumbleRnd(q, s.y)*period)/period))*(s.w - 12);
    ctx.globalAlpha = 1 - a; ctx.fillStyle = CRUMBLE_PAL.mid;
    for(let d = 0; d < 3; d++) ctx.fillRect(px + d*1.5 - 1.5, bottom + 3 + a*26 + d*4, 2, 2);
  }
  ctx.restore();
}
function drawCrumbleWarning(s, x, y, t){
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for(let cx0 = 12; cx0 < s.w - 6; cx0 += 26){
    const r = crumbleRnd(s.x + cx0, s.y);
    const px = x + cx0 + r*8, py = y + s.h*0.5;
    for(const dir of [-1, 1]){
      const len = (8 + r*10)*t;
      ctx.strokeStyle = 'rgba(60,28,8,.85)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(px, py);
      ctx.lineTo(px + dir*len*0.6, py - len*0.35); ctx.lineTo(px + dir*len, py + len*0.2*(r - 0.5)); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,220,180,.35)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(px + 1, py + 1); ctx.lineTo(px + dir*len*0.6 + 1, py - len*0.35 + 1); ctx.stroke();
    }
  }
  // Krümel rieseln unten heraus
  const n = Math.round(s.w/12);
  for(let i = 0; i < n; i++){
    const start = crumbleRnd(i, s.x)*CRUMBLE_TRIGGER_MS*0.7, age = s.timer - start;
    if(age < 0) continue;
    const fx = x + 4 + crumbleRnd(s.x, i)*(s.w - 8), fy = y + s.h - 2 + 0.00035*age*age + age*0.02;
    ctx.globalAlpha = Math.max(0, 1 - age/500);
    ctx.fillStyle = i % 3 ? '#8a5430' : '#c99468';
    ctx.fillRect(fx, fy, 2.5, 2.5);
  }
  ctx.restore();
}
// Zerbrechen: drehende Brocken (oben mit Gras), Steinchen und Staubwolke
function drawCrumbleBreak(s){
  const pal = {grass:'#9bab5c', grassTop:'#c2cf7e', dirt1:CRUMBLE_PAL.light, dirt2:CRUMBLE_PAL.dark, edge:CRUMBLE_PAL.edge};
  const k = Math.min(1, s.breakElapsed/CRUMBLE_FRAGMENT_LIFE);
  const fade = k < 0.6 ? 1 : 1 - (k - 0.6)/0.4;
  ctx.save();
  for(const d of (s.dust||[])){
    const dx = d.x - camX;
    if(dx < -40 || dx > VW + 40) continue;
    const a = 0.5*(1 - k);
    const g = ctx.createRadialGradient(dx, d.y, 0, dx, d.y, d.r);
    g.addColorStop(0, `rgba(200,165,120,${a.toFixed(3)})`); g.addColorStop(1, 'rgba(200,165,120,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(dx, d.y, d.r, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = Math.max(0, fade);
  for(const f of s.fragments){
    const fx = f.x - camX;
    if(fx < -40 || fx > VW + 40) continue;
    ctx.save(); ctx.translate(fx, f.y); ctx.rotate(f.rot);
    ctx.beginPath(); f.pts.forEach(([px, py], i)=> i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.closePath();
    const g = ctx.createLinearGradient(0, -12, 0, 12);
    g.addColorStop(0, pal.dirt1); g.addColorStop(1, pal.dirt2);
    ctx.fillStyle = f.pebble ? pal.dirt2 : g; ctx.fill();
    if(f.grassTop !== null){
      ctx.save(); ctx.clip();
      ctx.fillStyle = pal.grass; ctx.fillRect(-40, f.grassTop, 80, 11);
      ctx.fillStyle = pal.grassTop; ctx.fillRect(-40, f.grassTop, 80, 4);
      ctx.restore();
    }
    ctx.strokeStyle = pal.edge; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
// Tür als Holztor mit Eisenbeschlägen; Rahmen + Edelstein in der Farbe ihres Hebels.
// Öffnen/Schließen: das Tor gleitet nach oben/unten (nur Anzeige – die Kollision schaltet sofort).
function drawDoor(s, x, col){
  const target = s.open ? 1 : 0;
  s.anim = s.anim === undefined ? target : s.anim + (target - s.anim)*(1 - Math.pow(0.78, frameDt/STEP));
  if(Math.abs(s.anim - target) < 0.01) s.anim = target;
  const y = s.y, w = s.w, h = s.h;
  ctx.save();
  // Rahmen (immer sichtbar, damit man sieht, wo die Tür ist)
  ctx.fillStyle = 'rgba(40,25,10,.35)'; ctx.fillRect(x + 3, y, w - 6, h);
  // übereinander gestapelte Türen derselben Nummer bekommen EINEN durchgehenden Rahmen
  if(s.nbUp === undefined){
    s.nbUp = solids.some(d => d.type==='door' && d.link===s.link && d.x===s.x && Math.abs(d.y + d.h - s.y) < 1);
    s.nbDown = solids.some(d => d.type==='door' && d.link===s.link && d.x===s.x && Math.abs(s.y + s.h - d.y) < 1);
  }
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath();
  const t0 = s.nbUp ? y : y + 1.5, t1 = s.nbDown ? y + h : y + h - 1.5;
  ctx.moveTo(x + 1.5, t0); ctx.lineTo(x + 1.5, t1); ctx.moveTo(x + w - 1.5, t0); ctx.lineTo(x + w - 1.5, t1);
  if(!s.nbUp){ ctx.moveTo(x, y + 1.5); ctx.lineTo(x + w, y + 1.5); }
  if(!s.nbDown){ ctx.moveTo(x, y + h - 1.5); ctx.lineTo(x + w, y + h - 1.5); }
  ctx.stroke();
  const vis = h*(1 - s.anim);
  if(vis > 0.5){
    ctx.beginPath(); ctx.rect(x + 3, y, w - 6, vis); ctx.clip();
    const off = -(h - vis);                      // Tor schiebt sich nach oben weg
    // Bretter
    const nb = 3, bw = (w - 6)/nb;
    for(let i = 0; i < nb; i++){
      const bx = x + 3 + i*bw, g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      g.addColorStop(0, '#8d5a2b'); g.addColorStop(0.5, '#a96d36'); g.addColorStop(1, '#7a4b22');
      ctx.fillStyle = g; ctx.fillRect(bx, y + off, bw, h);
      ctx.strokeStyle = 'rgba(50,28,10,.6)'; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, y + off + 0.5, bw - 1, h - 1);
      ctx.strokeStyle = 'rgba(60,35,12,.35)';   // Maserung
      ctx.beginPath(); ctx.moveTo(bx + bw*0.35, y + off + 4); ctx.quadraticCurveTo(bx + bw*0.6, y + off + h*0.5, bx + bw*0.4, y + off + h - 4); ctx.stroke();
    }
    // Eisenbänder mit Nieten
    for(const fy of [0.22, 0.72]){
      const by = y + off + h*fy;
      ctx.fillStyle = '#4a4f57'; ctx.fillRect(x + 3, by - 3, w - 6, 6);
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(x + 3, by - 3, w - 6, 1.5);
      ctx.fillStyle = '#9aa3ad';
      for(const rx of [x + 7, x + w/2, x + w - 7]){ ctx.beginPath(); ctx.arc(rx, by, 1.6, 0, Math.PI*2); ctx.fill(); }
    }
    // Edelstein in Hebel-Farbe
    const gy = y + off + h*0.47;
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x + w/2, gy - 5); ctx.lineTo(x + w/2 + 4.5, gy); ctx.lineTo(x + w/2, gy + 5); ctx.lineTo(x + w/2 - 4.5, gy); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x + w/2 - 1.5, gy - 3, 1.5, 2);
    // Unterkante (Spitzen des Tors)
    ctx.fillStyle = '#4a4f57';
    for(let i = 0; i < 3; i++){
      const tx = x + 3 + (i + 0.5)*(w - 6)/3;
      ctx.beginPath(); ctx.moveTo(tx - 4, y + off + h - 3); ctx.lineTo(tx + 4, y + off + h - 3); ctx.lineTo(tx, y + off + h + 1); ctx.closePath(); ctx.fill();
    }
  } else {
    // offen: oben sieht man den eingefahrenen Torrand
    if(!s.nbUp){ ctx.fillStyle = '#6b4420'; ctx.fillRect(x + 3, y, w - 6, 3); }
  }
  ctx.restore();
}
// Stacheln: glänzende Metallkegel auf einer Eisenleiste (einmal vorgezeichnet, zeigt nach oben;
// beim Zeichnen je nach Richtung gedreht). Nur Aussehen – der Treffer-Bereich bleibt das ganze Kästchen.
const SPIKE_SPRITE = (()=>{
  const S = 2, c = document.createElement('canvas'); c.width = 40*S; c.height = 40*S;
  const g = c.getContext('2d'); g.scale(S, S);
  // Schatten am Boden
  g.fillStyle = 'rgba(30,20,10,.25)'; g.beginPath(); g.ellipse(20, 38.5, 19, 2.5, 0, 0, Math.PI*2); g.fill();
  // Spitzen
  const n = 4, bw = 40/n;
  for(let i = 0; i < n; i++){
    const cx = bw*(i + 0.5), tip = 5 + (i % 2)*2, base = 34, hw = bw*0.48;
    const L = g.createLinearGradient(cx - hw, 0, cx, 0);
    L.addColorStop(0, '#f4f7fa'); L.addColorStop(1, '#a9b2bd');
    g.fillStyle = L; g.beginPath(); g.moveTo(cx, tip); g.lineTo(cx - hw, base); g.lineTo(cx, base); g.closePath(); g.fill();
    const R = g.createLinearGradient(cx, 0, cx + hw, 0);
    R.addColorStop(0, '#7f8995'); R.addColorStop(1, '#454c56');
    g.fillStyle = R; g.beginPath(); g.moveTo(cx, tip); g.lineTo(cx, base); g.lineTo(cx + hw, base); g.closePath(); g.fill();
    g.strokeStyle = '#262a30'; g.lineWidth = 1.1; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(cx - hw, base); g.lineTo(cx, tip); g.lineTo(cx + hw, base); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.arc(cx - 0.6, tip + 3, 0.9, 0, Math.PI*2); g.fill();   // Glanz an der Spitze
    g.fillStyle = 'rgba(160,30,30,.55)'; g.beginPath(); g.moveTo(cx, tip); g.lineTo(cx - 1.4, tip + 3.2); g.lineTo(cx + 1.4, tip + 3.2); g.closePath(); g.fill(); // rötliche Spitze = gefährlich
  }
  // Eisenleiste mit Nieten
  const B = g.createLinearGradient(0, 33, 0, 40);
  B.addColorStop(0, '#6b727c'); B.addColorStop(0.5, '#4a5059'); B.addColorStop(1, '#2c3036');
  g.fillStyle = B; g.beginPath(); g.roundRect ? g.roundRect(0.5, 33, 39, 6.5, 2) : g.rect(0.5, 33, 39, 6.5); g.fill();
  g.strokeStyle = '#1f2227'; g.lineWidth = 1; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(2, 33.6, 36, 1);
  g.fillStyle = '#b8c0c9';
  for(const rx of [5, 15, 25, 35]){ g.beginPath(); g.arc(rx, 36.4, 1.2, 0, Math.PI*2); g.fill(); }
  return c;
})();
// Farbe je Schalter-Nummer: Schalter und alles, was er steuert, tragen dieselbe Farbe + Nummer
const LINK_COLORS = {1:'#ff922b', 2:'#339af0', 3:'#9775fa', 4:'#12b886', 5:'#f06595', 6:'#e0b000',
  7:'#e8590c', 8:'#1c7ed6', 9:'#7048e8', 10:'#2b8a3e', 11:'#c2255c', 12:'#a07800', 13:'#0b7285', 14:'#d6336c',
  15:'#5c940d', 16:'#862e9c', 17:'#e67700', 18:'#364fc7', 19:'#087f5b', 20:'#b02525'};
// ab 21 (falls je nötig): automatisch verteilte Farbtöne
const linkColor = n => LINK_COLORS[n] || `hsl(${(n*137.5)%360},60%,45%)`;
// (steht außerhalb von draw(), damit auch die Elemente in elemente/ – Hebel, Druckplatte – sie benutzen können)
function draw(){
  // Kamera schaut nach vorn: die hintere Figur steht nah am linken Rand (CAM_BACK_MIN..CAM_BACK_PUSH px,
  // Totzone gegen Wackeln, cameraTarget in 09-kamera.js), damit man möglichst viel von dem sieht,
  // was als Nächstes kommt. Die vordere Figur bleibt trotzdem immer im Bild (höchstens FRONT_MAX).
  const targetCam = cameraTarget(camPos);
  camPos += (targetCam-camPos) * (1 - Math.pow(1-CAM_FOLLOW, frameDt/STEP));   // gleich schnell bei jeder Bildrate
  camX = Math.round(camPos);

  ctx.setTransform(RS, 0, 0, RS, 0, 0);   // volle Bildschirmauflösung (00-setup.js)
  ctx.clearRect(0,0,W,H);
  tNowCp = performance.now();
  drawBackground();
  ctx.save();
  ctx.translate(0, CEILING_MARGIN);
  // Zoom: Spielwelt verkleinern, unten bündig (Boden bleibt unten, oben wird mehr Himmel sichtbar)
  applyWorldZoom();

  // weiche Lichtstrahlen von oben
  ctx.save();
  for(let i=0;i<(THEME.ray ? 2 : 0);i++){
    const rx = ((i*420 - camX*0.5) % (VW+500)) - 100;
    const rg = ctx.createLinearGradient(rx,0,rx+160,H);
    rg.addColorStop(0, THEME.ray);
    rg.addColorStop(1, 'rgba(255,244,200,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(rx,0); ctx.lineTo(rx+90,0); ctx.lineTo(rx-40,H); ctx.lineTo(rx-130,H);
    ctx.fill();
  }
  ctx.restore();

  // treibende Lichtpartikel
  const PM = THEME.particles;
  for(const pt of particles){
    const k = frameDt/STEP;
    pt.phase += 0.02 * k;
    if(PM.mode === 'firefly'){   // Glühwürmchen: schwirren langsam umher, blinken
      pt.y += Math.sin(pt.phase*0.7 + pt.wx)*0.35*k - pt.speed*0.2*k; pt.x += Math.cos(pt.phase*0.5 + pt.wx)*0.4*k;
    } else {
      pt.y -= pt.speed * k;
      if(PM.mode === 'ember') pt.x += Math.sin(pt.phase*1.5 + pt.wx)*0.5*k;
    }
    if(pt.y < -20){ pt.y = H+10; pt.x = Math.random()*LEVEL_W; }
    const sx = pt.x - camX*pt.par;
    if(sx<-10||sx>VW+10) continue;
    const flick = PM.mode === 'firefly' ? Math.max(0, Math.sin(pt.phase*1.6)) : 0.5 + Math.sin(pt.phase)*0.5;
    if(PM.mode !== 'float'){
      ctx.fillStyle = `rgba(${PM.col},${(0.12*flick).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(sx, pt.y, pt.r*4, 0, Math.PI*2); ctx.fill();
    }
    ctx.fillStyle = `rgba(${PM.col},${(0.15+flick*0.6).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(sx, pt.y, pt.r, 0, Math.PI*2); ctx.fill();
  }

  ctx.fillStyle = '#3a2416';
  ctx.fillRect(0-camX, LEVEL_H, LEVEL_W, 4);

  const STRIP_W = 140, STRIP_H = 140;
  // anchor: Bezugspunkt der Textur. Standard = Welt (feste Teile), bei bewegten Stücken = das Stück selbst
  function drawTiledH(img, sx, sy, sw, sh, anchor){
    const iw = img.naturalWidth||img.width, ih = img.naturalHeight||img.height;
    const a = anchor===undefined ? 0 : anchor;
    const worldStart = sx - ((((sx-a)%STRIP_W)+STRIP_W)%STRIP_W);
    for(let wx=worldStart; wx<sx+sw; wx+=STRIP_W){
      const tL = Math.max(wx, sx), tR = Math.min(wx+STRIP_W, sx+sw);
      if(tR<=tL) continue;
      const srcX=(tL-wx)/STRIP_W*iw, srcW=(tR-tL)/STRIP_W*iw;
      ctx.drawImage(img, srcX,0,srcW,ih, tL-camX, sy, tR-tL, sh);
    }
  }
  function drawTiledV(img, sx, sy, sw, sh, anchor){
    const iw = img.naturalWidth||img.width, ih = img.naturalHeight||img.height;
    const a = anchor===undefined ? 0 : anchor;
    const worldStart = sy - ((((sy-a)%STRIP_H)+STRIP_H)%STRIP_H);
    for(let wy=worldStart; wy<sy+sh; wy+=STRIP_H){
      const tT = Math.max(wy, sy), tB = Math.min(wy+STRIP_H, sy+sh);
      if(tB<=tT) continue;
      const srcY=(tT-wy)/STRIP_H*ih, srcH=(tB-tT)/STRIP_H*ih;
      ctx.drawImage(img, 0,srcY,iw,srcH, sx-camX, tT, sw, tB-tT);
    }
  }
  // Boden direkt gezeichnet (statt Textur-Streifen): durchgehendes Gras mit welliger Kante,
  // Erde mit Verlauf, runde Ecken nur an echten Enden, nahtlos zu angrenzenden Stücken.
  // off = Verschiebung der Wellen (bei bewegten Stücken fährt das Muster mit)
  const GROUND_PAL = {g: THEME.ground};   // Farben je Level-Thema (10a-themen.js)
  const R_CORNER = 9, GRASS_H = 12;
  function waveY(wx){ return Math.sin(wx*0.055)*2.4 + Math.sin(wx*0.137+1.3)*1.2; }
  function drawGroundPiece(s, x, y, off, pal, cracked){
    const w = s.w, h = s.h, nb = s.nb || {l:false,r:false,b:false,above:[]};
    const coveredAt = px => nb.above.some(([a,b]) => px >= a-0.5 && px <= b+0.5);
    const topFreeL = !coveredAt(1), topFreeR = !coveredAt(w-1);
    const tl = (!nb.l && topFreeL) ? R_CORNER : 0, tr = (!nb.r && topFreeR) ? R_CORNER : 0;
    const bl = (!nb.l && !nb.b) ? R_CORNER : 0, br = (!nb.r && !nb.b) ? R_CORNER : 0;
    // Erde
    const g = ctx.createLinearGradient(0, y, 0, y+h);
    g.addColorStop(0, pal.dirt1); g.addColorStop(1, pal.dirt2);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x+tl, y);
    ctx.lineTo(x+w-tr, y); if(tr) ctx.arcTo(x+w, y, x+w, y+tr, tr);
    ctx.lineTo(x+w, y+h-br); if(br) ctx.arcTo(x+w, y+h, x+w-br, y+h, br);
    ctx.lineTo(x+bl, y+h); if(bl) ctx.arcTo(x, y+h, x, y+h-bl, bl);
    ctx.lineTo(x, y+tl); if(tl) ctx.arcTo(x, y, x+tl, y, tl);
    ctx.closePath(); ctx.fill();
    // weiche Wellenstreifen in der Erde
    if(h >= 30){
      ctx.strokeStyle = pal.stripe; ctx.lineWidth = 3;
      for(const [fy, ph] of [[0.55, 0.7], [0.82, 2.1]]){
        ctx.beginPath();
        for(let px = 3; px <= w-3; px += 6){
          const yy = y + h*fy + Math.sin((x+camX+px-off)*0.045+ph)*2.2;
          if(px===3) ctx.moveTo(x+px, yy); else ctx.lineTo(x+px, yy);
        }
        ctx.stroke();
      }
    }
    if(!nb.b){ ctx.fillStyle = pal.edge; ctx.globalAlpha = 0.35; ctx.fillRect(x+bl, y+h-3, w-bl-br, 3); ctx.globalAlpha = 1; }
    // Gras nur auf freien Abschnitten der Oberseite
    const spans = []; let start = null;
    for(let px = 0; px <= w; px += 4){
      const free = !coveredAt(Math.min(w-0.5, Math.max(0.5, px)));
      if(free && start===null) start = px;
      if((!free || px>=w) && start!==null){ spans.push([start, free ? w : px]); start = null; }
    }
    for(const [a, b] of spans){
      const capL = (a===0) ? tl : 0, capR = (b===w) ? tr : 0;
      ctx.beginPath();
      ctx.moveTo(x+a, y+capL);
      if(capL) ctx.arcTo(x+a, y, x+a+capL, y, capL); else ctx.lineTo(x+a, y);
      ctx.lineTo(x+b-capR, y);
      if(capR) ctx.arcTo(x+b, y, x+b, y+capR, capR); else ctx.lineTo(x+b, y);
      for(let px = b; px >= a; px -= 5){
        ctx.lineTo(x+px, y + GRASS_H + waveY(x+camX+px-off));
      }
      ctx.lineTo(x+a, y + GRASS_H + waveY(x+camX+a-off));
      ctx.closePath();
      ctx.fillStyle = pal.grass; ctx.fill();
      ctx.strokeStyle = pal.grassDark; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for(let px = a+ (capL?3:0); px <= b-(capR?3:0); px += 5){
        const yy = y + GRASS_H + waveY(x+camX+px-off) + 1;
        if(px===a+(capL?3:0)) ctx.moveTo(x+px, yy); else ctx.lineTo(x+px, yy);
      }
      ctx.stroke();
      // heller Glanzstreifen oben
      ctx.fillStyle = pal.grassTop;
      ctx.fillRect(x+a+Math.max(capL,2), y+2, Math.max(0, (b-a)-Math.max(capL,2)-Math.max(capR,2)), 3);
    }
    // Risse beim Bröckelboden (fest an der Welt verankert, damit sie nicht flackern)
    if(cracked){
      ctx.strokeStyle = 'rgba(80,40,15,.75)'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
      for(let cx0 = 12; cx0 < w-6; cx0 += 26){
        const seed = Math.sin((s.x+cx0)*12.9898)*43758.5453, rnd = seed - Math.floor(seed);
        const sx0 = x + cx0 + rnd*8;
        ctx.beginPath();
        ctx.moveTo(sx0, y + GRASS_H + 2);
        ctx.lineTo(sx0 - 5 + rnd*4, y + h*0.45);
        ctx.lineTo(sx0 + 4, y + h*0.62);
        ctx.lineTo(sx0 - 2, y + h - 4);
        ctx.stroke();
      }
    }
  }

  // ---------- Wand als Mauerwerk ----------
  // Steinquader (40x20) direkt gezeichnet, Fugen an der Welt ausgerichtet -> laufen über alle
  // angrenzenden Wandstücke nahtlos durch (senkrecht wie waagerecht, auch große Flächen).
  // Kanten/Ecken nur dort, wo die Wand wirklich aufhört. offX/offY: bewegte Wand -> Muster fährt mit.
  const WALL = THEME.wall;   // Farben je Level-Thema (10a-themen.js)
  function drawWallPiece(s, x, y, offX, offY){
    const w = s.w, h = s.h, nb = s.nb || {l:false,r:false,b:false,above:[],below:[]};
    const cov = (list, px) => list.some(([a,b]) => px >= a-0.5 && px <= b+0.5);
    const topFreeL = !cov(nb.above, 1), topFreeR = !cov(nb.above, w-1);
    const botFreeL = !cov(nb.below, 1), botFreeR = !cov(nb.below, w-1);
    const R = 5;
    const tl = (!nb.l && topFreeL) ? R : 0, tr = (!nb.r && topFreeR) ? R : 0;
    const bl = (!nb.l && botFreeL) ? R : 0, br = (!nb.r && botFreeR) ? R : 0;
    // Grundfläche (leichter Verlauf, an der Welt ausgerichtet, damit Stapel nicht streifig wirken)
    const wy0 = y - offY;
    const g = ctx.createLinearGradient(0, y - (((wy0 % 80)+80)%80), 0, y - (((wy0 % 80)+80)%80) + 80);
    g.addColorStop(0, WALL.top); g.addColorStop(0.5, WALL.bottom); g.addColorStop(1, WALL.top);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x+tl, y);
    ctx.lineTo(x+w-tr, y); if(tr) ctx.arcTo(x+w, y, x+w, y+tr, tr);
    ctx.lineTo(x+w, y+h-br); if(br) ctx.arcTo(x+w, y+h, x+w-br, y+h, br);
    ctx.lineTo(x+bl, y+h); if(bl) ctx.arcTo(x, y+h, x, y+h-bl, bl);
    ctx.lineTo(x, y+tl); if(tl) ctx.arcTo(x, y, x+tl, y, tl);
    ctx.closePath(); ctx.fill();
    // Steinquader: leichte Helligkeits-Unterschiede + Fugen
    const CH = 20, BW = 40;
    const wx0 = x + camX - offX;                     // Weltkoordinate der linken Kante
    for(let cy = y - (((wy0 % CH)+CH)%CH); cy < y + h; cy += CH){
      const course = Math.round((cy - y + wy0) / CH);
      const shift = (course & 1) ? BW/2 : 0;
      const top = Math.max(cy, y), bot = Math.min(cy + CH, y + h);
      // Fuge oben an dieser Steinreihe (nicht am oberen Rand, außer dort grenzt Wand an)
      if(cy > y + 0.5 || (cy >= y - 0.5 && !topFreeL && !topFreeR)){
        if(cy > y - 0.5 && cy < y + h - 0.5){
          ctx.fillStyle = WALL.mortar; ctx.fillRect(x + (cy <= y+0.5 && tl ? tl : 0), cy - 1, w, 2);
        }
      }
      // senkrechte Fugen + Tönung je Stein
      let bx = x - ((((wx0 + shift) % BW) + BW) % BW);
      for(; bx < x + w; bx += BW){
        const L = Math.max(bx, x), Rr = Math.min(bx + BW, x + w);
        const seed = Math.sin((Math.round(bx - x + wx0)*0.731 + course*12.9898)) * 43758.5453;
        const v = seed - Math.floor(seed);
        ctx.fillStyle = v > 0.5 ? `rgba(255,255,255,${(v-0.5)*0.16})` : `rgba(30,40,48,${(0.5-v)*0.14})`;
        ctx.fillRect(L + 1, top + 1, Math.max(0, Rr - L - 2), Math.max(0, bot - top - 2));
        if(bx > x + 0.5 && bx < x + w - 0.5){ ctx.fillStyle = WALL.mortar; ctx.fillRect(bx - 1, top, 2, bot - top); }
      }
    }
    // Kanten: oben heller Rand, unten Schatten, Seiten dunkler – nur wo die Wand endet
    ctx.fillStyle = WALL.hi;
    const spans = (list) => { const out=[]; let st=null; for(let px=0; px<=w; px+=4){ const free=!cov(list, Math.min(w-0.5, Math.max(0.5,px))); if(free && st===null) st=px; if((!free || px>=w) && st!==null){ out.push([st, free?w:px]); st=null; } } return out; };
    for(const [a,b] of spans(nb.above)){ const l = a===0 ? tl : 0, r = b===w ? tr : 0; ctx.fillRect(x+a+l, y, (b-a)-l-r, 3); }
    ctx.fillStyle = WALL.shade;
    for(const [a,b] of spans(nb.below)){ const l = a===0 ? bl : 0, r = b===w ? br : 0; ctx.fillRect(x+a+l, y+h-3, (b-a)-l-r, 3); }
    ctx.fillStyle = WALL.side;
    if(!nb.l) ctx.fillRect(x, y+tl, 2, h-tl-bl);
    if(!nb.r) ctx.fillRect(x+w-3, y+tr, 3, h-tr-br);
  }

  // Bewegte Stücke sehen aus wie normaler Boden/Wand. Die Textur ist am Stück selbst verankert
  // (nicht an der Welt), damit sie mitfährt statt unter dem Stück durchzurutschen.
// bewegter Boden je Gruppe zusammengefasst: Umriss jetzt, Umriss am Start, Verschiebung
function moverGroupInfo(){
  const map = new Map();
  for(const s of solids){
    if(s.type!=='moveplat') continue;
    const key = s.group===undefined ? s : s.group;
    let g = map.get(key);
    if(!g){ g = {minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity, sMinX:Infinity,sMinY:Infinity,sMaxX:-Infinity,sMaxY:-Infinity,
                 dx:s.targetX-s.startX, dy:s.targetY-s.startY, switchCtl:s.switchCtl, switchLink:s.switchLink, tripActive:s.tripActive};
            map.set(key, g); }
    g.minX=Math.min(g.minX,s.x); g.minY=Math.min(g.minY,s.y); g.maxX=Math.max(g.maxX,s.x+s.w); g.maxY=Math.max(g.maxY,s.y+s.h);
    g.sMinX=Math.min(g.sMinX,s.startX); g.sMinY=Math.min(g.sMinY,s.startY); g.sMaxX=Math.max(g.sMaxX,s.startX+s.w); g.sMaxY=Math.max(g.sMaxY,s.startY+s.h);
  }
  return [...map.values()];
}
function drawLinkBadge(x, y, link, active){
  const col = linkColor(link);
  ctx.fillStyle = 'rgba(255,255,255,.92)';
  ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y, 8.5, 0, Math.PI*2); ctx.fill();
  if(active){ ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.arc(x, y, 14 + Math.sin(performance.now()*0.008)*1.5, 0, Math.PI*2); ctx.stroke(); ctx.globalAlpha = 1; }
  ctx.fillStyle = '#fff'; ctx.font = (link > 9 ? 'bold 9.5px' : 'bold 11px') + ' sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(link), x, y+0.5);
}
// Was steuert Schalter n? Liefert Punkte (Weltkoordinaten) für Plaketten und Verbindungslinien
function linkTargets(link){
  const pts = [];
  for(const d of solids){
    if(d.type!=='door' || d.link!==link) continue;
    // nur die oberste Tür einer Säule bekommt die Plakette
    const above = solids.some(o=>o.type==='door' && o.link===link && Math.abs(o.x-d.x)<1 && Math.abs(o.y+o.h-d.y)<1);
    if(!above) pts.push({x:d.x+d.w/2, y:d.y-12, kind:'door', active:d.open});
  }
  for(const g of moverGroupInfo()){
    // Plakette direkt AUF dem bewegten Boden (nicht darüber), damit sie nicht wie ein zweites Tür-Schild wirkt
    if(g.switchCtl && g.switchLink===link) pts.push({x:(g.minX+g.maxX)/2, y:(g.minY+g.maxY)/2 + 3, kind:'plat', active:g.tripActive});
  }
  for(const h of hooks){
    if(h.moving && h.switchCtl && h.switchLink===link) pts.push({x:h.x+18, y:h.y-18, kind:'hook', active:h.tripActive});
  }
  for(const b of wasserBecken) for(const pg of b.pegel){   // Wasserstand-Marke (elemente/stroemung.js)
    if(pg.link===link) pts.push({x:pg.x, y:pg.y-12, kind:'pegel', active:!!linkOn[link]});
  }
  for(const t of teleporters){   // Teleporter per Verknüpfung (elemente/teleporter.js): Plakette über dem Tor
    if(t.link===link) pts.push({x:t.x+20, y:t.y-46, kind:'tele', active:!!linkOn[link]});
  }
  for(const s of solids){   // Wechselboden (elemente/wechselboden.js): eine Plakette je Reihe (Säule: nur oben), mitten darauf
    if(s.type==='wechsel' && s.link===link && !(s.takt > 0) && s.reiheStart &&
       !solids.some(o=>o.type==='wechsel' && o.link===link && o.gruppe===s.gruppe && Math.abs(o.x-s.x)<1 && Math.abs(o.y+o.h-s.y)<1)) pts.push({x:s.x+s.reiheBreite/2, y:s.y+s.h/2+3, kind:'wechsel', active:!s.gone});
  }
  return pts;
}

function drawSolidLook(s, look, x){
    const ax = s.x - s.startX, ay = s.y - s.startY; // bisher gefahrene Strecke
    if(look==='platform'){
      ctx.fillStyle = colorOf('--platform-shadow');
      roundRect(x+6, s.y+s.h+2, Math.max(0,s.w-12), 6, 3); ctx.fill();
    }
    if(look==='wall'){
      drawWallPiece(s, x, Math.round(s.y), ax, ay);
    } else if(look==='ground'){
      drawGroundPiece(s, x, Math.round(s.y), ax, GROUND_PAL.g, false);
    } else {
      const img = themedImg(look==='platform' ? ASSETS.platformWood : ASSETS.groundGrass);
      if(img.complete && img.naturalWidth) drawTiledH(img, s.x, s.y, s.w, s.h, ax);
      else { ctx.fillStyle = colorOf(look==='platform' ? '--platform' : '--ground'); ctx.fillRect(x,s.y,s.w,s.h); }
    }
  }
  // (Fahrweg-Linien/Umrisse bewegter Böden auf Nutzerwunsch entfernt)
  for(const s of solids){
    if(ELEMENT_SOLID_TYPEN.has(s.type)) continue;   // zeichnet sich selbst (elemente/, z. B. Wechselboden)
    if(s.gone){
      if(s.type==='crumble' && s.fragments) drawCrumbleBreak(s);
      if(s.type==='door'){ const dx = s.x-camX; if(dx+s.w >= -20 && dx <= VW+20) drawDoor(s, dx, linkColor(s.link)); }
      continue;
    }
    const x = s.x-camX;
    if(x+s.w < -20 || x > VW+20) continue;
    if(s.type==='moveplat' && s.look){ drawSolidLook(s, s.look, Math.round(x)); continue; }

    if(s.type==='platform'){
      ctx.fillStyle = colorOf('--platform-shadow');
      roundRect(x+6, s.y+s.h+2, Math.max(0,s.w-12), 6, 3); ctx.fill();
    }

    if(s.type==='wall'){
      drawWallPiece(s, x, s.y, 0, 0);
    } else if(s.type==='door'){
      drawDoor(s, x, linkColor(s.link));
    } else if(s.type==='moveplat'){
      const grad = ctx.createLinearGradient(x,s.y,x,s.y+s.h);
      grad.addColorStop(0,'#6cc9ef'); grad.addColorStop(1,'#2e8fb8');
      ctx.fillStyle = grad;
      ctx.fillRect(x,s.y,s.w,s.h);
      ctx.strokeStyle='#1e6f96'; ctx.lineWidth=2;
      ctx.strokeRect(x+2,s.y+2,s.w-4,s.h-4);
    } else if(s.type==='crumble'){
      // Vorwarnung: zittert immer stärker, Risse wachsen, Krümel rieseln, glüht rot (nur Anzeige)
      const t = s.triggered ? Math.min(1, s.timer/CRUMBLE_TRIGGER_MS) : 0;
      const shake = t > 0 ? Math.sin(s.timer*0.09 + s.x)*(0.4 + 2.8*Math.pow(t, 1.5)) : 0;
      const sx = x + shake, sy = s.y + (t > 0 ? Math.cos(s.timer*0.13)*t*1.2 : 0);
      drawCrumbleBlocks(s, sx, sy);
      if(t > 0){
        drawCrumbleWarning(s, sx, sy, t);
        const pulse = t > 0.5 ? 0.16*(0.5 + 0.5*Math.sin(s.timer*0.05)) : 0;
        ctx.fillStyle = `rgba(220,40,30,${(t*0.3 + pulse).toFixed(2)})`;
        roundRect(sx, sy, s.w, s.h, 6); ctx.fill();
      }
    } else if(s.type==='ground'){
      drawGroundPiece(s, x, s.y, 0, GROUND_PAL.g, false);
    } else {
      const img = themedImg(s.type==='platform' ? ASSETS.platformWood : ASSETS.groundGrass);
      if(img.complete && img.naturalWidth) drawTiledH(img, s.x, s.y, s.w, s.h);
      else {
        ctx.fillStyle = colorOf(s.type==='platform' ? '--platform' : '--ground');
        ctx.fillRect(x,s.y,s.w,s.h);
      }
    }
  }

  drawGroundDeco();   // Dschungel-Pflanzen und Moos (17-deko.js)

  // (Fahrweg-Linie bewegter Haken auf Nutzerwunsch entfernt)
  for(const h of hooks){
    const x=h.x-camX, range=hookRange(h);
    if(x<-range-30||x>VW+range+30) continue;
    const originX = p1.x, originY = p1.y - p1.h*0.6;
    const dist = Math.hypot(h.x-originX, h.y-originY);
    const inRange = dist <= range;
    ctx.fillStyle = inRange ? 'rgba(80,170,255,0.16)' : 'rgba(150,150,150,0.12)';
    ctx.strokeStyle = inRange ? 'rgba(80,170,255,0.55)' : 'rgba(150,150,150,0.35)';
    ctx.lineWidth = inRange ? 2 : 1.4;
    ctx.beginPath(); ctx.arc(x,h.y,range,0,Math.PI*2); ctx.fill(); ctx.stroke();
  }
  for(const h of hooks){
    const x=h.x-camX;
    if(x<-30||x>VW+30) continue;
    const pulse = 3 + Math.sin(performance.now()*0.005 + h.x*0.05)*2;
    ctx.fillStyle = colorOf('--hook-glow');
    ctx.beginPath(); ctx.arc(x,h.y,20+pulse,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = colorOf('--hook-ring'); ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(x,h.y,9,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle = colorOf('--hook'); ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(x,h.y,12,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle = colorOf('--hook-core');
    ctx.beginPath(); ctx.arc(x,h.y,4.5,0,Math.PI*2); ctx.fill();
  }

  for(const sp of spikes){
    const x=sp.x-camX;
    if(x<-30||x>VW+30) continue;
    // Stacheln können in 4 Richtungen zeigen (dir 0=oben, 1=rechts, 2=unten, 3=links)
    ctx.save();
    ctx.translate(Math.round(x), sp.y - sp.h/2);
    ctx.rotate((sp.dir||0) * Math.PI/2);
    ctx.drawImage(SPIKE_SPRITE, -sp.w/2, -sp.h/2, sp.w, sp.h);
    ctx.restore();
  }

  // Elemente aus dem Register (elemente/): Hebel, Druckplatten, Sprungpilze, Aufwind … (Türen: mit den Wänden oben)
  for(const E of ELEMENTE) if(E.spiel && E.spiel.zeichnen) E.spiel.zeichnen();

  // Plaketten an allem, was ein Schalter steuert (gleiche Farbe + Nummer wie der Hebel)
  const seen = new Set();
  for(const sw of [...switchDefs, ...plates]){
    if(seen.has(sw.link)) continue; seen.add(sw.link);
    for(const t of linkTargets(sw.link)){
      const x = t.x - camX; if(x < -20 || x > VW+20) continue;
      // nie über den oberen Bildrand hinaus (Tür bis in die oberste Himmel-Reihe: Plakette ins oberste Türteil)
      drawLinkBadge(Math.round(x), Math.round(Math.max(t.y, -SKY_ROOM + 14)), sw.link, t.active);
    }
  }

  // Checkpoint-Fahnen
  for(let i=0;i<checkpointDefs.length;i++){
    const cp = checkpointDefs[i];
    const x = Math.round(cp.x - camX), base = cp.y;
    if(x < -40 || x > VW+60) continue;
    const poleH = 66;
    // Mast + Fuß
    ctx.fillStyle = '#8a7a66'; roundRect(x-7, base-5, 14, 5, 2); ctx.fill();
    ctx.fillStyle = '#efe6d6'; ctx.fillRect(x-2, base-poleH, 4, poleH);
    ctx.fillStyle = '#ffcf4d'; ctx.beginPath(); ctx.arc(x, base-poleH-2, 4, 0, Math.PI*2); ctx.fill();
    // Fahne: unten grau, geht hoch, sobald beide vorbei sind
    const raised = i <= activeCp && cp.raiseT;
    let k = raised ? Math.min(1, (tNowCp - cp.raiseT)/700) : 0;
    k = 1 - Math.pow(1-k, 3);
    const fy = base - 20 - k*(poleH-22);
    const wave = Math.sin(tNowCp*0.006 + i)*3*(raised?1:0.3);
    ctx.fillStyle = raised ? '#ff7a59' : '#c9c3b8';
    ctx.beginPath();
    ctx.moveTo(x+2, fy);
    ctx.quadraticCurveTo(x+16, fy-3+wave, x+28, fy+7+wave*0.5);
    ctx.quadraticCurveTo(x+16, fy+13+wave, x+2, fy+16);
    ctx.closePath(); ctx.fill();
    if(raised){ ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(x+12, fy+7+wave*0.4, 3, 0, Math.PI*2); ctx.fill(); }
    // Punkte: wer ist schon vorbei (braun = Affe, rosa = Schweinchen)
    if(!raised){
      ctx.fillStyle = cp.reachedM ? '#9b6340' : 'rgba(0,0,0,.15)';
      ctx.beginPath(); ctx.arc(x-8, base-11, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = cp.reachedF ? '#f48cab' : 'rgba(0,0,0,.15)';
      ctx.beginPath(); ctx.arc(x+8, base-11, 3.5, 0, Math.PI*2); ctx.fill();
    }
  }

  // Münzen: drehen sich (Breite pulsiert), eingesammelte hüpfen hoch und blenden aus
  const tNow = performance.now();
  for(const c of coins){
    let x = c.x-camX;
    if(x<-30||x>VW+30) continue;
    if(c.nudgeT && !c.taken){ const a = tNow - c.nudgeT; if(a < 380) x += Math.sin(a*0.07) * 4 * (1 - a/380); }
    const pal = COIN_PAL[c.color] || COIN_PAL.gold;
    let lift, alpha = 1, scale = 1, ang;
    if(c.taken){
      const k = Math.min(1, (tNow - (c.takenAt||tNow)) / 420);
      if(k >= 1) continue;
      lift = 46 * (1 - Math.pow(1-k, 3));                 // schnellt hoch, bremst ab
      scale = k < 0.35 ? 1 + k/0.35*0.5 : 1.5 * (1 - (k-0.35)/0.65);  // wächst kurz, schrumpft weg
      alpha = k < 0.6 ? 1 : 1 - (k-0.6)/0.4;
      ang = tNow*0.03 + c.x;                               // schnelle Drehung
    } else {
      lift = Math.sin(tNow*0.003 + c.x*0.02)*2.5;
      ang = tNow*0.004 + c.x*0.013;
    }
    drawCoin3D(x, c.y - lift, COIN_DRAW_R*scale, ang, pal, alpha, !c.taken);
  }

  const gx = goal.x-camX;
  const signImg = ASSETS.signExit;
  if(signImg.complete && signImg.naturalWidth){
    const sw=56, sh=56;
    ctx.drawImage(signImg, gx-sw/2, goal.y-sh, sw, sh);
  } else {
    ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(gx,goal.y); ctx.lineTo(gx,goal.y-48); ctx.stroke();
    ctx.fillStyle = '#5fb768';
    ctx.beginPath(); ctx.moveTo(gx,goal.y-48); ctx.lineTo(gx+28,goal.y-40); ctx.lineTo(gx,goal.y-32); ctx.fill();
  }

  // Scheinwände: sehen aus wie Wand und liegen ÜBER Hebeln/Münzen (versteckt); wer drinsteht, sieht hindurch
  for(const f of fakeWalls){
    const x = Math.round(f.x - camX);
    if(x + f.w < -20 || x > VW + 20) continue;
    const inside = [p1, p2].some(p => rectsOverlap({x:p.x-p.w/2, y:p.y-p.h, w:p.w, h:p.h}, {x:f.x-60, y:f.y-60, w:f.w+120, h:f.h+120}));
    f.alpha = f.alpha === undefined ? 1 : f.alpha + ((inside ? 0.35 : 1) - f.alpha)*Math.min(1, frameDt*0.01);
    ctx.save(); ctx.globalAlpha = f.alpha;
    drawWallPiece(f, x, f.y, 0, 0);
    ctx.restore();
  }
  drawCritters();   // Schmetterlinge, Frösche, Schnecken, Pilze, Knospen, Faultier (20-tiere.js)
  drawBirds();
  drawDust();       // Staubwölkchen (21-figuren-leben.js)
  drawCharacter(p2, camX);
  drawCharacter(p1, camX);
  drawHearts();     // Herzchen, wenn beide nah beieinander stehen
  drawCoinFx(camX);
  for(const E of ELEMENTE) if(E.spiel && E.spiel.zeichnenVorne) E.spiel.zeichnenVorne();   // vor den Figuren, z. B. Wasser (elemente/)
  if(deathState && deathState.phrase) drawDeathBubble();

  // Hinweis am Ziel, wenn noch Münzen fehlen
  const have = coinsCollected();
  if(coinsNeeded > 0 && have < coinsNeeded && (p1.atGoal || p2.atGoal)){
    const msg = 'Noch ' + (coinsNeeded-have) + ' Münze' + (coinsNeeded-have===1?'':'n') + '!';
    ctx.font = 'bold 15px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    const tw = ctx.measureText(msg).width + 20;
    ctx.fillStyle = 'rgba(20,28,38,.8)'; roundRect(gx-tw/2, goal.y-92, tw, 26, 8); ctx.fill();
    ctx.fillStyle = '#ffd23f'; ctx.fillText(msg, gx, goal.y-79);
  }
  ctx.restore();
  if(THEME.tint){ ctx.fillStyle = THEME.tint; ctx.fillRect(0, 0, W, H); }
  drawThemeDarkness();   // Nacht/Höhle: dunkel, Licht um Figuren und leuchtende Dinge (10a-themen.js)
  drawFakeGlints();      // dezentes Glitzern an Scheinwänden (auch im Dunkeln sichtbar)
  weatherFront();   // Regen, Spritzer, warmer Schimmer, Vignette (19-wetter.js)
  drawOffscreenArrows();
  drawContinuePrompt();
  if(testJumpMsg && performance.now() - testJumpT < 1800){
    ctx.font = 'bold 16px sans-serif';
    const tw = ctx.measureText(testJumpMsg).width + 28;
    ctx.fillStyle = 'rgba(20,28,38,.85)'; roundRect(W/2 - tw/2, 130, tw, 34, 10); ctx.fill();
    ctx.fillStyle = '#ffd23f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(testJumpMsg, W/2, 148);
  }
}

// ---------- Scheinwände glitzern dezent (Nutzerwunsch: „ein bisschen erkennen, nicht zu auffällig“) ----------
// Pro Kästchen ein fester, zufällig wirkender Funkelpunkt, der ab und zu kurz aufblitzt (nur Zeichnen, kein Spielzustand).
const FAKE_GLINT_PERIOD = 3200;   // ms bis ein Funkelpunkt wieder aufblitzt
const FAKE_GLINT_ON = 0.16;       // Anteil der Zeit, in der er sichtbar ist
const FAKE_GLINT_ALPHA = 0.55;    // höchste Deckkraft
function glintHash(a, b){ const s = Math.sin(a*127.1 + b*311.7)*43758.5453; return s - Math.floor(s); }
function drawFakeGlints(){
  if(!fakeWalls.length) return;
  const now = performance.now();
  ctx.save(); applyWorldZoom();
  for(const f of fakeWalls){
    const x0 = f.x - camX;
    if(x0 + f.w < -20 || x0 > VW + 20) continue;
    const vis = (f.alpha === undefined ? 1 : f.alpha);   // steht jemand drin (Wand durchsichtig), kein Glitzern
    if(vis < 0.6) continue;
    for(let ty = f.y; ty < f.y + f.h - 1; ty += 40){
      for(let tx = f.x; tx < f.x + f.w - 1; tx += 40){
        const c = Math.round(tx/40), r = Math.round(ty/40);
        const ph = ((now/FAKE_GLINT_PERIOD) + glintHash(c, r)) % 1;
        if(ph > FAKE_GLINT_ON) continue;
        const k = Math.sin(ph/FAKE_GLINT_ON*Math.PI);   // weich auf und ab
        const gx = tx - camX + 8 + glintHash(r, c)*24, gy = ty + 8 + glintHash(c + 7, r + 3)*24;
        const s = 2.5 + k*3;
        ctx.globalAlpha = k*FAKE_GLINT_ALPHA*vis;
        ctx.fillStyle = '#fffbe6';
        ctx.beginPath();                                   // vierzackiger Stern
        ctx.moveTo(gx, gy - s); ctx.quadraticCurveTo(gx, gy, gx + s, gy); ctx.quadraticCurveTo(gx, gy, gx, gy + s);
        ctx.quadraticCurveTo(gx, gy, gx - s, gy); ctx.quadraticCurveTo(gx, gy, gx, gy - s); ctx.fill();
        ctx.globalAlpha = k*0.25*vis;
        ctx.beginPath(); ctx.arc(gx, gy, s*0.9, 0, Math.PI*2); ctx.fill();   // leichter Schein
      }
    }
  }
  ctx.restore();
}
