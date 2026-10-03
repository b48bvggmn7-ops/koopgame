// 11-hintergrund.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Dezenter Hintergrund (Parallax) ----------
// Einmal vorgezeichnet in nahtlos kachelbare Ebenen, danach pro Bild nur 2 drawImage je Ebene (billig).
// Farben bewusst nah am Himmel: wenig Kontrast, heller als alle Spielelemente -> lenkt nicht ab.
const BG_TW = 1600;
const BG_LAYERS = [];
function makeLayer(par, draw){
  const c = document.createElement('canvas'); c.width = BG_TW; c.height = H;
  const g = c.getContext('2d'); draw(g); BG_LAYERS.push({c, par});
}
function hillPath(g, base, parts, color){
  g.fillStyle = color; g.beginPath(); g.moveTo(0, H);
  for(let x=0; x<=BG_TW; x+=8){
    let y = base;
    for(const [amp, k, ph] of parts) y += amp*Math.sin(2*Math.PI*x/BG_TW*k + ph);
    g.lineTo(x, y);
  }
  g.lineTo(BG_TW, H); g.closePath(); g.fill();
}
function buildBackground(){
  // Wolken (ganz weit weg, halbtransparent)
  makeLayer(0.05, g=>{
    g.fillStyle = 'rgba(255,255,255,0.32)';
    for(const [x,y,s] of [[140,110,1],[520,70,0.8],[900,140,1.15],[1280,90,0.9]]){
      for(const [dx,dy,r] of [[0,0,34],[38,-12,42],[80,0,32],[40,12,36]]){
        for(const off of [0, BG_TW, -BG_TW]){
          g.beginPath(); g.arc(x+off+dx*s, y+dy*s, r*s, 0, Math.PI*2); g.fill();
        }
      }
    }
  });
  // ferne Hügel
  makeLayer(0.12, g=>{
    hillPath(g, 470, [[38,2,0.3],[22,5,1.7],[9,11,0.9]], '#bde3cf');
  });
  // nähere Hügel mit runden Bäumchen (gleiche Farbe = Silhouette)
  makeLayer(0.26, g=>{
    const col = '#aad8bf';
    const yAt = x => 575 + 26*Math.sin(2*Math.PI*x/BG_TW*3+1.1) + 12*Math.sin(2*Math.PI*x/BG_TW*7+0.4);
    hillPath(g, 575, [[26,3,1.1],[12,7,0.4]], col);
    g.fillStyle = col;
    for(let i=0;i<14;i++){
      const x = (i*117 + (i%3)*31) % BG_TW, r = 16 + (i*7)%12;
      for(const off of [0, BG_TW, -BG_TW]){
        const tx = x+off, ty = yAt(x) + 6;
        g.fillRect(tx-2, ty-r*1.2, 4, r*1.2);
        g.beginPath(); g.arc(tx, ty - r*1.4, r, 0, Math.PI*2); g.fill();
        g.beginPath(); g.arc(tx - r*0.6, ty - r*1.05, r*0.7, 0, Math.PI*2); g.fill();
        g.beginPath(); g.arc(tx + r*0.6, ty - r*1.1, r*0.72, 0, Math.PI*2); g.fill();
      }
    }
  });
}
buildBackground();
function drawBackground(){
  const sky = ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0, '#d8f2e6'); sky.addColorStop(1, '#c4e8d6');
  ctx.fillStyle = sky; ctx.fillRect(0,0,W,H);
  const t = performance.now();
  for(const L of BG_LAYERS){
    let off = camX*L.par + (L.par===0.05 ? t*0.004 : 0);   // Wolken ziehen zusätzlich langsam
    off = Math.round(((off % BG_TW) + BG_TW) % BG_TW);
    ctx.drawImage(L.c, -off, 0);
    if(BG_TW - off < W) ctx.drawImage(L.c, BG_TW - off, 0);
  }
}
