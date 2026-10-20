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
// Nacht-Ausbau: Meister-Münze (klasse 'meister', an den schwersten Stellen) – zwei kleine Sterne kreisen um sie (nur Aussehen)
function muenzeMeisterZeichnen(x, y, t, s){
  ctx.save();
  for(let k = 0; k < 2; k++){
    const a = t*0.004 + s*0.01 + k*Math.PI, px = x + Math.cos(a)*15, py = y + Math.sin(a)*7;
    ctx.globalAlpha = 0.85; ctx.fillStyle = '#fff6c2';
    ctx.beginPath();
    for(let i = 0; i < 8; i++){ const rr = i % 2 ? 1.3 : 3.4, w = i*Math.PI/4; ctx.lineTo(px + Math.cos(w)*rr, py + Math.sin(w)*rr); }
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
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
// Bröckelboden: rieselnde Krümel während der Vorwarnung (ohne Spielzustand zu ändern: alles wird aus s.timer berechnet).
// Neues Aussehen: keine wachsenden Risse mehr (Regel „keine Risse und Kratzer für brüchig“); Zittern + roter Schein bleiben.
function crumbleRnd(a, b){ const v = Math.sin(a*12.9898 + b*78.233)*43758.5453; return v - Math.floor(v); }
// Farben der Bruchstücke beim Zerbrechen (drawCrumbleBreak; je Level-Thema überschrieben in setTheme, 10a-themen.js)
const CRUMBLE_PAL = {light:'#e6c88f', mid:'#cfa66a', dark:'#a97c47', edge:'#6b4a26', gap:'rgba(60,35,15,.75)',
                     moss:'#9bab5c', mossLight:'#c2cf7e', speck:'rgba(120,85,45,.55)'};
const CRUMBLE_PAL_DEFAULT = {...CRUMBLE_PAL};   // je Level-Thema überschrieben (setTheme, 10a-themen.js)
function drawCrumbleWarning(s, x, y, t){
  ctx.save();
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
    L.addColorStop(0, '#e9eef3'); L.addColorStop(1, '#8e98a4');   // Design-Politur C: dunkler, satter Stahl
    g.fillStyle = L; g.beginPath(); g.moveTo(cx, tip); g.lineTo(cx - hw, base); g.lineTo(cx, base); g.closePath(); g.fill();
    const R = g.createLinearGradient(cx, 0, cx + hw, 0);
    R.addColorStop(0, '#5f6874'); R.addColorStop(1, '#2c3139');
    g.fillStyle = R; g.beginPath(); g.moveTo(cx, tip); g.lineTo(cx, base); g.lineTo(cx + hw, base); g.closePath(); g.fill();
    g.strokeStyle = '#121418'; g.lineWidth = 1.5; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(cx - hw, base); g.lineTo(cx, tip); g.lineTo(cx + hw, base); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.arc(cx - 0.6, tip + 3, 0.9, 0, Math.PI*2); g.fill();   // Glanz an der Spitze
    g.fillStyle = 'rgba(190,30,25,.75)'; g.beginPath(); g.moveTo(cx, tip); g.lineTo(cx - 2.2, tip + 5); g.lineTo(cx + 2.2, tip + 5); g.closePath(); g.fill(); // rote Spitze = gefährlich
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
// Auffälligkeit (Nutzerwunsch: Hebel, Pilze, Druckplatten wurden übersehen): leichter, pulsierender Schein und – statt
// Pfeilen, die nicht zur Spielwelt passten – drei Glühwürmchen in der Farbe des Elements, die langsam darüber kreisen,
// solange man es noch benutzen muss. Nur Zeichnen (performance.now), kein Spielzustand.
let hinweisPfeile = 0;   // Zähler je Bild (für Tests)
// Farbe mit Deckkraft (für Verläufe ins Durchsichtige – 'rgba(0,0,0,0)' würde zum Rand hin abdunkeln)
function farbeMitAlpha(col, a){
  if(col[0] === '#'){
    const h = col.length === 4 ? col.slice(1).split('').map(c => c + c).join('') : col.slice(1, 7);
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
  }
  if(col.startsWith('hsl(')) return col.replace('hsl(', 'hsla(').replace(')', `,${a})`);
  return col;
}
function elementLeuchten(x, y, radius, col, staerke = 1){
  const puls = 0.7 + 0.3*Math.sin(performance.now()*0.004);
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, farbeMitAlpha(col, 0.9)); g.addColorStop(0.4, farbeMitAlpha(col, 0.45)); g.addColorStop(1, farbeMitAlpha(col, 0));
  ctx.save(); ctx.globalAlpha = 0.5*puls*staerke; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI*2); ctx.fill(); ctx.restore();
}
function hinweisPfeil(x, y, col){
  hinweisPfeile++;
  const t = performance.now()*0.0016;
  ctx.save();
  for(let i = 0; i < 3; i++){
    const a = t + i*Math.PI*2/3;
    const fx = x + Math.cos(a)*16, fy = y + Math.sin(a*2)*5 + Math.sin(a)*4;
    const blink = 0.55 + 0.45*Math.sin(performance.now()*0.006 + i*2.1);
    const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 12);
    g.addColorStop(0, farbeMitAlpha(col, 1)); g.addColorStop(1, farbeMitAlpha(col, 0));
    ctx.globalAlpha = 0.7*blink; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, 12, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = blink; ctx.fillStyle = '#fffbe8'; ctx.beginPath(); ctx.arc(fx, fy, 2.8, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
// Edelstein (Raute) in der Verknüpfungs-Farbe – wie auf den Türen, damit man sieht, was zusammengehört
function elementEdelstein(x, y, r, col){
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r*0.9, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r*0.9, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,22,8,.7)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x - r*0.35, y - r*0.6, r*0.3, r*0.4);
}
// ---------- Neues Aussehen, Runde 1: Boden und Wand als EINE zusammenhängende Schicht ----------
// Übersetzung von buildChunk aus der abgenommenen Vorschau (aussehen-paket/basis): alle Boden-/Wand-Kästchen kommen in ein
// Raster (Tc); daraus entstehen gemeinsame Formen – runde Ecken nur an Außenecken, keine Fugen zwischen Kästchen, Gras-Kappe
// nur auf freien Oberkanten, die Outline (outlineDraw, 10b-design-look.js) nur um die Gesamtform (auch Treppen, L-Formen,
// Löcher). Zeichenschritte, Farben und Zahlen wie in der Vorschau. Material-Funktionen: js/10b-design-look.js.
// Leistung: die Vorschau zeichnet Stücke einmal in Bilder. Im Spiel geht das nicht: Chrome hat je Bild ein festes Budget
// (rund 32 MB) für Bilder, die in die Leinwand gemalt werden, und der Hintergrund braucht davon schon fast alles – darüber
// rendert der Browser mitten im Bild (gemessen 100–250 ms). Darum wird hier je Stück (MAT_STUECK Welt-px) EINMAL alles
// berechnet und in fertige Zeichenpfade (Path2D) gelegt – je Farbe ein Pfad; pro Bild werden nur diese Pfade gefüllt
// (rund 25 Aufrufe für den ganzen Bildausschnitt). Die Erd-Körnung ist ein kleines, einmal gezeichnetes Muster.
const MAT_STUECK = 320;          // Breite eines Stücks (Welt-px, Vielfaches von 40)
const MAT_RAND = 60;             // so weit links/rechts außerhalb des Bilds wird mitgezeichnet (Ziegel-/Gras-Überstand)
const MAT_KORN_KACHEL = 160;     // Größe der Körnungs-Kachel (Welt-px): 4×4 Kästchen mit je eigener Körnung, dann Wiederholung
const MAT_ZIEGEL = ['#b98a66','#a97b5a','#c49872','#9b6f50','#b08868'];   // Ziegelfarben (wallTile 'B')
let matRaster = {quelle: null, n: -1, nf: -1, version: 0, zellen: new Map(), fake: new Set(), spalten: new Map()};
// Raster aller Boden-/Wand-/Bröckel-Kästchen (1 = Boden, 2 = Wand – auch Haftfläche und Scheinwand –, 3 = Bröckelboden)
function matRasterHolen(){
  if(matRaster.quelle === solids && matRaster.n === solids.length && matRaster.nf === fakeWalls.length) return matRaster;
  const zellen = new Map(), fake = new Set(), spalten = new Map();
  const eintragen = (s, t, istFake) => {
    for(let c = Math.floor(s.x/40 + 1e-6); c < Math.ceil((s.x + s.w)/40 - 1e-6); c++)
      for(let r = Math.floor(s.y/40 + 1e-6); r < Math.ceil((s.y + s.h)/40 - 1e-6); r++){
        const k = c + ',' + r;
        if(istFake){ if(zellen.has(k)) continue; fake.add(k); } else fake.delete(k);
        zellen.set(k, t);
      }
  };
  for(const f of fakeWalls) eintragen(f, 2, true);
  for(const s of solids){
    const t = s.type === 'ground' ? 1 : s.type === 'wall' ? 2 : s.type === 'crumble' ? 3 : 0;
    if(t) eintragen(s, t, false);
  }
  // Nutzerwunsch: reicht eine Fläche bis an den oberen Bildrand, läuft sie über den Rand hinaus weiter (keine runden Ecken,
  // kein Gras, keine Linie oben) – dazu bekommt sie unsichtbar weitere Kästchen bis über den Rand (nur fürs Zeichnen)
  const randReihe = Math.floor(-SKY_ROOM/40) - 1;
  for(const [k, t] of [...zellen]){
    const [c, r] = k.split(',').map(Number);
    if(fake.has(k) || t === 3 || r*40 >= -SKY_ROOM + 40 || zellen.has(c + ',' + (r - 1))) continue;
    for(let rr = r - 1; rr >= randReihe; rr--) zellen.set(c + ',' + rr, t);
  }
  for(const [k, t] of zellen){ const [c, r] = k.split(',').map(Number); if(!spalten.has(c)) spalten.set(c, []); spalten.get(c).push({c, r, t, fake: fake.has(k)}); }
  matRaster = {quelle: solids, n: solids.length, nf: fakeWalls.length, version: matRaster.version + 1, zellen, fake, spalten};
  matStuecke.clear(); matSicht = {key: ''};
  return matRaster;
}
// Kästchen-Art an Spalte/Reihe (0 = leer) – wie Tc in der Vorschau
function Tc(c, r){ return matRaster.zellen.get(c + ',' + r) || 0; }
// Körnung (Erde, grain aus 10b) als Muster: MAT_KORN_KACHEL Welt-px groß, je 40er-Kästchen eigene Körnung, in Bildschirm-
// Auflösung S einmal gezeichnet; das Muster hängt an der Welt (wandert nicht mit der Kamera)
let matKornCache = {S: 0, c: null, muster: null};
function matKornMuster(q, S){
  if(matKornCache.S !== S){
    const c = document.createElement('canvas'); c.width = c.height = Math.ceil(MAT_KORN_KACHEL*S);
    const qq = c.getContext('2d'); qq.setTransform(c.width/MAT_KORN_KACHEL, 0, 0, c.width/MAT_KORN_KACHEL, 0, 0);
    const n = MAT_KORN_KACHEL/40;
    for(let i = 0; i < n; i++) for(let j = 0; j < n; j++){ qq.save(); qq.beginPath(); qq.rect(i*40, j*40, 40, 40); qq.clip(); grain(qq, i*40, j*40, rnd(4100 + i*97 + j*13)); qq.restore(); }
    matKornCache = {S, c, muster: null};
  }
  if(!matKornCache.muster){
    const m = q.createPattern(matKornCache.c, 'repeat'), k = MAT_KORN_KACHEL/matKornCache.c.width;
    if(m.setTransform) m.setTransform(new DOMMatrix([k, 0, 0, k, 0, 0]));
    matKornCache.muster = m;
  }
  return matKornCache.muster;
}
// leere Zeichenpfade eines Stücks bzw. Ausschnitts
function matPfadeNeu(){
  const P = () => new Path2D();
  return {PG: P(), PW: P(), PA: P(), edge: P(), gras: P(), grasLinie: P(), grasLicht: P(), baender: new Map(),
          ecke: P(), eckeLinie: P(), eckeLicht: P(), ziegel: MAT_ZIEGEL.map(P), zLicht: P(), zSchatten: P(), zMoos: P(), zRiss: P(),
          wLicht: P(), wGras: P(), wGrasHell: P(), wMoos: P(), hatG: false, hatW: false};
}
// Berechnet für die Kästchen 'liste' ({c, r, t}) alle Zeichenschritte von buildChunk (Vorschau) als Pfade in Welt-Koordinaten.
// ziegelVon/ziegelBis: nur Ziegel mit linker Kante in diesem Bereich (jeder Ziegel gehört genau einem Stück); weitere
// Kästchen für Ziegel, die von nebenan herüberragen, in 'nachbarn'. Zufall der Vorschau (r()) hier je Kästchen fest.
function matPfadeBauen(liste, nachbarn, ziegelVon, ziegelBis){
  const D = matPfadeNeu(), ziegelGesehen = new Set();
  const kaestchen = liste.map(({c: cc, r: rr, t}) => {
    const n=Tc(cc,rr-1)>0,s=Tc(cc,rr+1)>0,wl=Tc(cc-1,rr)>0,e=Tc(cc+1,rr)>0,rad=[(!n&&!wl)?9:0,(!n&&!e)?9:0,(!s&&!e)?9:0,(!s&&!wl)?9:0],x=cc*40,y=rr*40;
    return {t,x,y,n,s,wl,e,rad,cc,rr,nG:Tc(cc,rr-1)==1};
  });
  for(const k of kaestchen){
    const {x, y, rad, n, s, wl, e} = k, edge = D.edge;
    (k.t==1?D.PG:D.PW).roundRect(x,y,40,40,rad); D.PA.roundRect(x,y,40,40,rad);
    if(!n){edge.moveTo(x+rad[0],y);edge.lineTo(x+40-rad[1],y)}if(!e){edge.moveTo(x+40,y+rad[1]);edge.lineTo(x+40,y+40-rad[2])}if(!s){edge.moveTo(x+40-rad[2],y+40);edge.lineTo(x+rad[3],y+40)}if(!wl){edge.moveTo(x,y+40-rad[3]);edge.lineTo(x,y+rad[0])}
    if(rad[0]){edge.moveTo(x,y+rad[0]);edge.arc(x+rad[0],y+rad[0],rad[0],Math.PI,1.5*Math.PI)}if(rad[1]){edge.moveTo(x+40-rad[1],y);edge.arc(x+40-rad[1],y+rad[1],rad[1],1.5*Math.PI,2*Math.PI)}if(rad[2]){edge.moveTo(x+40,y+40-rad[2]);edge.arc(x+40-rad[2],y+40-rad[2],rad[2],0,.5*Math.PI)}if(rad[3]){edge.moveTo(x+rad[3],y+40);edge.arc(x+rad[3],y+40-rad[3],rad[3],.5*Math.PI,Math.PI)}
  }
  // Erde: Gras-Kappe auf freien Oberseiten (Schatten-Band, Grasfläche, dunkle Wellenlinie, helle Oberkante)
  for(const k of kaestchen){
    if(k.t!=1) continue; D.hatG = true;
    if(!k.nG){const xa=k.x,xb=k.x+40,y=k.y;
     if(!D.baender.has(y)) D.baender.set(y, new Path2D()); D.baender.get(y).rect(xa,y+12,40,14);
     const G=D.gras;G.moveTo(xa,y-3);G.lineTo(xb+.5,y-3);for(let px=xb+.5;px>=xa;px-=5)G.lineTo(px,y+12+waveY(px));G.lineTo(xa,y+12+waveY(xa));G.closePath();
     const L=D.grasLinie;for(let px=xa;px<=xb+.5;px+=5){const yy=y+13+waveY(px);px==xa?L.moveTo(px,yy):L.lineTo(px,yy)}
     D.grasLicht.rect(xa,y+2,40.5,3)}
    // Gras-Kanten: an Stufen nach oben läuft das Gras ein Stück an der höheren Fläche hoch
    if(!k.n)[[1,k.x+40],[-1,k.x]].forEach(([dir,xw])=>{const nb=dir>0?k.e:k.wl;if(!nb||Tc(k.cc+dir,k.rr-1)<=0)return;const y=k.y;
     const F=D.ecke;F.moveTo(xw,y+12+waveY(xw));F.lineTo(xw,y-14);F.quadraticCurveTo(xw-dir*3,y-9,xw-dir*17,y+1);F.lineTo(xw-dir*17,y+14);F.closePath();
     D.eckeLinie.moveTo(xw-dir*1,y-14);D.eckeLinie.quadraticCurveTo(xw-dir*4,y-9,xw-dir*17,y+1.5);
     D.eckeLicht.moveTo(xw-dir*1.5,y-11);D.eckeLicht.quadraticCurveTo(xw-dir*3.5,y-6,xw-dir*12,y-.5)});
  }
  // Ziegelwand (wallTile 'B'): Ziegel aus der Weltlage, jeder Ziegel einmal (auch wenn er über zwei Kästchen reicht)
  const ziegelAus = (x, y) => {
    for(let j=0;j<4;j++){const row=Math.round(y/10)+j,off=(row&1)?10:0;
     for(let bx=off-20;bx<40;bx+=20){if(bx+20<=0)continue;const ci=Math.floor((x+bx)/20),hv=hsh(ci,row),by=y+j*10,X=x+bx;
      if(X<ziegelVon||X>=ziegelBis||ziegelGesehen.has(ci+','+row))continue;ziegelGesehen.add(ci+','+row);
      D.ziegel[Math.floor(hv*5)].roundRect(X+1,by+1,18,8,1.5);
      D.zLicht.rect(X+2,by+1,16,1.5);D.zSchatten.rect(X+2,by+7,16,2);
      if(hsh(ci*3+1,row)<.22){D.zMoos.moveTo(X+6+hsh(ci,row+9)*8+5,by+8);D.zMoos.ellipse(X+6+hsh(ci,row+9)*8,by+8,5,2.4,0,0,7)}
      if(hsh(ci*5+2,row)<.1){D.zRiss.moveTo(X+8,by+1);D.zRiss.lineTo(X+11,by+5);D.zRiss.lineTo(X+9,by+9)}}}
  };
  for(const k of kaestchen){
    if(k.t!=2) continue; D.hatW = true;
    ziegelAus(k.x, k.y);
    const r = rnd(Math.round(k.cc*7919 + k.rr*104729 + 13));
    if(!k.n){D.wLicht.rect(k.x+2,k.y+1.5,36,1.5);const G=D.wGras;G.moveTo(k.x,k.y-2);G.lineTo(k.x+40,k.y-2);for(let px=k.x+40;px>=k.x;px-=5)G.lineTo(px,k.y+6+waveY(px)*.8);G.closePath();D.wGrasHell.rect(k.x,k.y,40,2)}
    if(!k.wl&&r()<.5){const my=k.y+10+r()*20,mr=5+r()*4;D.wMoos.moveTo(k.x+3+mr,my);D.wMoos.ellipse(k.x+3,my,mr,4,0,0,7)}
  }
  for(const z of nachbarn) if(z.t==2) ziegelAus(z.c*40, z.r*40);
  return D;
}
// mehrere Stücke zu einem Ausschnitt zusammenfügen (je Pfad ein Aufruf beim Zeichnen, keine Nahtstellen zwischen Stücken)
function matPfadeVereinen(liste){
  const V = matPfadeNeu();
  for(const D of liste){
    for(const k of ['PG','PW','PA','edge','gras','grasLinie','grasLicht','ecke','eckeLinie','eckeLicht','zLicht','zSchatten','zMoos','zRiss','wLicht','wGras','wGrasHell','wMoos']) V[k].addPath(D[k]);
    D.ziegel.forEach((p, i) => V.ziegel[i].addPath(p));
    for(const [y, p] of D.baender){ if(!V.baender.has(y)) V.baender.set(y, new Path2D()); V.baender.get(y).addPath(p); }
    V.hatG = V.hatG || D.hatG; V.hatW = V.hatW || D.hatW;
  }
  return V;
}
// Zeichnen der Pfade in den Kontext q (Welt-Koordinaten) – Reihenfolge wie buildChunk: Erde, Gras, Gras-Kanten, Wand, Outline
function matPfadeZeichnen(q, V, S){
  if(V.hatG){
    q.fillStyle=SOILBASE[soilK];q.fill(V.PG);
    q.fillStyle=matKornMuster(q,S);q.fill(V.PG);   // Vorschau: grain(q,k.x,k.y,r) je Kästchen
    q.save();q.clip(V.PG);
    if(!V.grad) V.grad = new Map();
    for(const [y, p] of V.baender){ let sg = V.grad.get(y); if(!sg){ sg=q.createLinearGradient(0,y+12,0,y+26);sg.addColorStop(0,'rgba('+EA.edge+',.24)');sg.addColorStop(1,'rgba('+EA.edge+',0)'); V.grad.set(y, sg); } q.fillStyle=sg;q.fill(p); }
    q.fillStyle=EA.grass;q.fill(V.gras);q.strokeStyle=EA.gd;q.lineWidth=2.5;q.stroke(V.grasLinie);q.fillStyle=EA.gt;q.fill(V.grasLicht);
    q.restore();
    q.fillStyle=EA.grass;q.fill(V.ecke);q.strokeStyle=EA.gd;q.lineWidth=2;q.stroke(V.eckeLinie);q.strokeStyle=EA.gt;q.lineWidth=1.6;q.stroke(V.eckeLicht);
  }
  if(V.hatW){
    q.fillStyle='#7d7062';q.fill(V.PW);q.save();q.clip(V.PW);
    V.ziegel.forEach((p,i)=>{q.fillStyle=MAT_ZIEGEL[i];q.fill(p)});
    q.fillStyle='rgba(255,235,200,.25)';q.fill(V.zLicht);q.fillStyle='rgba(40,20,10,.25)';q.fill(V.zSchatten);
    q.fillStyle='rgba(92,150,70,.65)';q.fill(V.zMoos);q.strokeStyle='rgba(40,22,12,.5)';q.lineWidth=1;q.stroke(V.zRiss);
    q.fillStyle='rgba(255,255,255,.3)';q.fill(V.wLicht);q.fillStyle='#5aa35a';q.fill(V.wGras);q.fillStyle='#7cc36f';q.fill(V.wGrasHell);
    q.fillStyle='rgba(90,163,90,.55)';q.fill(V.wMoos);
    q.restore();
  }
  outlineDraw(q,V.edge,V.PA,outK,S);
}
// Zeichen-Maßstab (echte Bildschirm-Pixel je Welt-Pixel; für die Körnung)
function matMassstab(){ return Math.min(4, Math.max(0.5, RS*zoom)); }
let matStuecke = new Map(), matSicht = {key: ''};
// Pfade eines Stücks (Spalten ci*MAT_STUECK … +MAT_STUECK); Scheinwand und Bröckelboden zeichnen sich selbst
function matStueckDaten(ci){
  if(matStuecke.has(ci)) return matStuecke.get(ci);
  const R = matRaster, c0 = ci*MAT_STUECK/40, c1 = c0 + MAT_STUECK/40, liste = [], nachbarn = [];
  for(let c = c0 - 1; c <= c1; c++) for(const z of (R.spalten.get(c) || [])){
    if(z.fake || z.t === 3) continue;
    if(c >= c0 && c < c1) liste.push(z); else nachbarn.push(z);
  }
  const D = liste.length ? matPfadeBauen(liste, nachbarn, c0*40, c1*40) : null;
  matStuecke.set(ci, D);
  return D;
}
// Boden und Wand des Levels: Pfade der sichtbaren Stücke (einmal je Ausschnitt vereint) füllen
function materialZeichnen(){
  const R = matRasterHolen();
  const a = Math.floor((camX - MAT_RAND)/MAT_STUECK), b = Math.floor((camX + VW + MAT_RAND)/MAT_STUECK), key = R.version + ':' + a + ':' + b;
  if(matSicht.key !== key){
    const L = []; for(let ci = a; ci <= b; ci++){ const D = matStueckDaten(ci); if(D) L.push(D); }
    matSicht = {key, V: matPfadeVereinen(L)};
  }
  ctx.save(); ctx.translate(-camX, 0);
  matPfadeZeichnen(ctx, matSicht.V, matMassstab());
  ctx.restore();
}
// Scheinwand: dieselbe Wand (Ziegel aus der Weltlage -> nahtlos zur echten Wand) als eigenes kleines Bild je Scheinwand,
// damit sie beim Hineingehen als Ganzes durchsichtig werden kann (wenige, kleine Flächen)
function matScheinwandBild(f){
  const R = matRasterHolen(), S = matMassstab();
  if(f._mat && f._mat.S === S && f._mat.v === R.version) return f._mat;
  const liste = [];
  for(let c = Math.floor(f.x/40 + 1e-6); c < Math.ceil((f.x + f.w)/40 - 1e-6); c++)
    for(let r = Math.floor(f.y/40 + 1e-6); r < Math.ceil((f.y + f.h)/40 - 1e-6); r++) if(R.fake.has(c + ',' + r)) liste.push({c, r, t: 2});
  const X = Math.floor(f.x/40 + 1e-6)*40 - 4, Y = Math.floor(f.y/40 + 1e-6)*40 - 20, w = Math.ceil((f.x + f.w)/40 - 1e-6)*40 + 4 - X, h = Math.ceil((f.y + f.h)/40 - 1e-6)*40 + 6 - Y;
  const c = document.createElement('canvas'); c.width = Math.ceil(w*S); c.height = Math.ceil(h*S);
  const q = c.getContext('2d'); q.setTransform(S, 0, 0, S, -X*S, -Y*S);
  matPfadeZeichnen(q, matPfadeBauen(liste, [], -Infinity, Infinity), S);
  return f._mat = {c, x: X, y: Y, w, h, S, v: R.version};
}
// Bewegliche Plattform aus Boden/Wand (pieceDraw aus der Vorschau): ein abgerundeter Block in Erde mit Gras-Kappe bzw. Wand,
// Outline wie die Flächen, kein Schatten. Gezeichnet 2-fach in ein eigenes Bild (Rand 24 px), vorher geleert (kein Restschatten).
function pieceDraw(p){const [x,y,w,h,look]=p.m,q=p.c.getContext('2d');q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,p.c.width,p.c.height);q.setTransform(2,0,0,2,24*2,24*2);const sv=g;g=q;const r=rnd(w*7+h);const path=()=>{q.beginPath();q.roundRect(0,0,w,h,9)};
 if(look=='wall'&&wallK!='O'){path();q.fillStyle='#98a8b2';q.fill();q.save();path();q.clip();for(let cx=0;cx<w;cx+=40)for(let cy=0;cy<h;cy+=40)wallTile({x:cx,y:cy},r,wallK);q.restore()}
 else if(look=='wall'){path();q.fillStyle='#98a8b2';q.fill();q.save();path();q.clip();for(let cy=0;cy<h;cy+=20)for(let cx=-((cy/20&1)?20:0);cx<w;cx+=40){q.fillStyle='rgba(58,70,79,.42)';q.fillRect(cx-1,cy,2,20);q.fillRect(0,cy-1,w,2);const v=r();q.fillStyle=v>.5?'rgba(255,255,255,'+((v-.5)*.16)+')':'rgba(30,40,48,'+((.5-v)*.14)+')';q.fillRect(cx+1,cy+1,38,18)}q.fillStyle='rgba(255,255,255,.3)';q.fillRect(3,1.5,w-6,1.5);q.restore()}
 else{path();q.fillStyle=SOILBASE[soilK];q.fill();q.save();path();q.clip();for(let cx=0;cx<w;cx+=40)for(let cy=0;cy<h;cy+=40)grain(q,cx,cy,r);q.beginPath();q.moveTo(0,-3);q.lineTo(w,-3);for(let px=w;px>=0;px-=5)q.lineTo(px,12+waveY(px));q.closePath();q.fillStyle=EA.grass;q.fill();q.strokeStyle=EA.gd;q.lineWidth=2.5;q.beginPath();for(let px=0;px<=w;px+=5){px?q.lineTo(px,13+waveY(px)):q.moveTo(px,13+waveY(px))}q.stroke();q.fillStyle=EA.gt;q.fillRect(0,2,w,3);q.restore()}
 {const pp=new Path2D();pp.roundRect(0,0,w,h,9);outlineDraw(q,pp,pp,outK,2)}g=sv;p.done=1}
// bewegliche Boden-/Wand-Stücke je Gruppe: bilden sie (am Start) ein volles Rechteck, wird die ganze Gruppe EIN Block,
// sonst jedes Stück für sich
let matBeweglich = {quelle: null, n: -1, liste: []};
function matBeweglicheStuecke(){
  if(matBeweglich.quelle === solids && matBeweglich.n === solids.length) return matBeweglich.liste;
  const gruppen = new Map();
  for(const s of solids){
    if(s.type !== 'moveplat' || (s.look !== 'ground' && s.look !== 'wall')) continue;
    const k2 = s.group === undefined || s.group === null ? s : s.group + '|' + s.look;
    if(!gruppen.has(k2)) gruppen.set(k2, []);
    gruppen.get(k2).push(s);
  }
  const liste = [], stueck = (teile, look) => {
    const x0 = Math.min(...teile.map(s => s.startX)), y0 = Math.min(...teile.map(s => s.startY));
    const w = Math.max(...teile.map(s => s.startX + s.w)) - x0, h = Math.max(...teile.map(s => s.startY + s.h)) - y0;
    const c = document.createElement('canvas'); c.width = Math.ceil((w + 48)*2); c.height = Math.ceil((h + 48)*2);
    liste.push({teile, x0, y0, w, h, piece: {m: [0, 0, w, h, look], c, done: 0}});
  };
  for(const teile of gruppen.values()){
    const look = teile[0].look;
    const x0 = Math.min(...teile.map(s => s.startX)), y0 = Math.min(...teile.map(s => s.startY));
    const w = Math.max(...teile.map(s => s.startX + s.w)) - x0, h = Math.max(...teile.map(s => s.startY + s.h)) - y0;
    if(Math.abs(teile.reduce((a, s) => a + s.w*s.h, 0) - w*h) < 1) stueck(teile, look);
    else for(const s of teile) stueck([s], look);
  }
  matBeweglich = {quelle: solids, n: solids.length, liste};
  return liste;
}
function matBeweglichZeichnen(){
  for(const B of matBeweglicheStuecke()){
    const s0 = B.teile[0], x = Math.round(B.x0 + (s0.x - s0.startX) - camX), y = Math.round(B.y0 + (s0.y - s0.startY));
    if(x + B.w < -20 || x > VW + 20) continue;
    if(!B.piece.done) pieceDraw(B.piece);
    ctx.drawImage(B.piece.c, x - 24, y - 24, B.w + 48, B.h + 48);
  }
}
// Bröckelboden (aussehen-paket/vorschau-code): Erde wie der normale Boden, trockenes hellbraunes Gras obendrauf, Klumpen
// und Kiesel (bruchRisse 'erde', elemente/durchbruch.js), glatte Unterkante. Je Kästchen einmal gezeichnet (Zwischenspeicher).
function crumbTile(k,r){const x=k.x,y=k.y;g.drawImage(matTile('soil',71+Math.floor(hsh(x,y)*5)),x,y,40,40);
 if(!k.n)grasKappe(x,y,40,x,{grass:'#bfa468',gd:'#8d7242',gt:'#dccb96'},g);
 bruchRisse(g,x,y,40,40,x*3+y*7,'erde',1);g.strokeStyle='rgba(30,22,16,.4)';g.lineWidth=1.2;g.strokeRect(x+.6,y+.6,38.8,38.8)}
const __broeckel = {};
function broeckelKachel(cc, rr){
  const R = matRasterHolen(), key = R.version + ':' + cc + ',' + rr;
  if(__broeckel[key]) return __broeckel[key];
  const x = cc*40, y = rr*40, c = document.createElement('canvas'); c.width = 80; c.height = 88;   // 40×44 (4 px Gras darüber)
  const q = c.getContext('2d'); q.setTransform(2, 0, 0, 2, -x*2, -(y - 4)*2);
  const sv = g; g = q;
  const n=Tc(cc,rr-1)>0,s=Tc(cc,rr+1)>0,wl=Tc(cc-1,rr)>0,e=Tc(cc+1,rr)>0,rad=[(!n&&!wl)?9:0,(!n&&!e)?9:0,(!s&&!e)?9:0,(!s&&!wl)?9:0];
  crumbTile({x, y, n}, null);
  // Outline an den freien Kanten wie bei der Gesamtform (in der Vorschau gehört der Bröckelboden mit zur Form)
  const PA = new Path2D(), edge = new Path2D(); PA.roundRect(x,y,40,40,rad);
  if(!n){edge.moveTo(x+rad[0],y);edge.lineTo(x+40-rad[1],y)}if(!e){edge.moveTo(x+40,y+rad[1]);edge.lineTo(x+40,y+40-rad[2])}if(!s){edge.moveTo(x+40-rad[2],y+40);edge.lineTo(x+rad[3],y+40)}if(!wl){edge.moveTo(x,y+40-rad[3]);edge.lineTo(x,y+rad[0])}
  if(rad[0]){edge.moveTo(x,y+rad[0]);edge.arc(x+rad[0],y+rad[0],rad[0],Math.PI,1.5*Math.PI)}if(rad[1]){edge.moveTo(x+40-rad[1],y);edge.arc(x+40-rad[1],y+rad[1],rad[1],1.5*Math.PI,2*Math.PI)}if(rad[2]){edge.moveTo(x+40,y+40-rad[2]);edge.arc(x+40-rad[2],y+40-rad[2],rad[2],0,.5*Math.PI)}if(rad[3]){edge.moveTo(x+rad[3],y+40);edge.arc(x+rad[3],y+40-rad[3],rad[3],.5*Math.PI,Math.PI)}
  outlineDraw(q, edge, PA, outK, 2);
  g = sv;
  return __broeckel[key] = c;
}
function drawCrumbleBlocks(s, x, y){
  for(let cx = 0; cx < s.w - 1; cx += 40) for(let cy = 0; cy < s.h - 1; cy += 40)
    ctx.drawImage(broeckelKachel(Math.floor((s.x + cx)/40 + 1e-6), Math.floor((s.y + cy)/40 + 1e-6)), x + cx, y + cy - 4, 40, 44);
}
// Tür (aussehen-paket/vorschau-code/tuer-vorschau.js): zusammenhängende Tür-Kästchen derselben Nummer = EINE Tür (auch lang,
// dick oder ein einzelner Block), Holzbretter mit Eisenbändern, dunkler Rahmen (nicht farbig) und EIN Diamant in der
// Hebel-Farbe mittig auf dunkler Fassung. Öffnen: das Tor fährt ein (nur Anzeige – die Kollision schaltet je Kästchen).
let tuerFlaechen = {quelle: null, n: -1, liste: []};
function tuerFlaechenHolen(){
  if(tuerFlaechen.quelle === solids && tuerFlaechen.n === solids.length) return tuerFlaechen.liste;
  const cells = {}, teil = {};
  for(const s of solids) if(s.type === 'door'){ const k = s.link + '|' + s.x + '|' + s.y; cells[k] = 1; teil[k] = s; }
  const used = {}, out = [];
  Object.keys(cells).map(k => k.split('|').map(Number)).sort((a, b) => a[2] - b[2] || a[1] - b[1]).forEach(([l, x, y]) => {
    const k0 = l + '|' + x + '|' + y; if(used[k0]) return;
    let w = 1; while(cells[l + '|' + (x + 40*w) + '|' + y] && !used[l + '|' + (x + 40*w) + '|' + y]) w++;
    let h = 1; ok: while(true){ for(let i = 0; i < w; i++){ const kk = l + '|' + (x + 40*i) + '|' + (y + 40*h); if(!cells[kk] || used[kk]) break ok; } h++; }
    const teile = [];
    for(let j = 0; j < h; j++) for(let i = 0; i < w; i++){ const kk = l + '|' + (x + 40*i) + '|' + (y + 40*j); used[kk] = 1; teile.push(teil[kk]); }
    out.push({x, y, w: w*40, h: h*40, l, teile});
  });
  tuerFlaechen = {quelle: solids, n: solids.length, liste: out};
  return out;
}
const gateAnim = {};
function drawGate(d, open, x){
 const y=d.y,w=d.w,h=d.h,col=linkColor(d.l),key=d.l+'|'+d.x+'|'+y;
 const tg=open?1:0;gateAnim[key]=gateAnim[key]===undefined?tg:gateAnim[key]+(tg-gateAnim[key])*(1-Math.pow(.88,frameDt/STEP));const an=gateAnim[key];   // Vorschau: *.12 je Bild – hier gleich schnell bei jeder Bildrate
 const sv=g;g=ctx;g.save();
 const rr=(a,b,c,e,r)=>{g.beginPath();g.roundRect(a,b,c,e,r)};
 // Nische
 rr(x+1,y+1,w-2,h-2,6);g.fillStyle='rgba(28,16,8,.55)';g.fill();
 const vert=h>=w,ix=x+4,iy=y+4,iw=w-8,ih=h-8;
 const vis=vert?ih*(1-an*.88):ih,vw=vert?iw:iw*(1-an*.88);
 if(vis>1&&vw>1){g.save();g.beginPath();g.rect(ix,iy,vert?iw:vw,vert?vis:ih);g.clip();
  const off=vert?-(ih-vis):0,offx=vert?0:-(iw-vw);
  g.translate(offx,off);
  // Bretter entlang der langen Achse
  const cross=vert?iw:ih,np=Math.max(2,Math.round(cross/13)),pw=cross/np;
  for(let i=0;i<np;i++){const bx=vert?ix+i*pw:ix,by=vert?iy:iy+i*pw,bw=vert?pw:iw,bh=vert?ih:pw;
   const gr=vert?g.createLinearGradient(bx,0,bx+bw,0):g.createLinearGradient(0,by,0,by+bh);const sh=hsh(d.x+i*7,y)*.12;
   gr.addColorStop(0,'#9a6330');gr.addColorStop(.5,'#b7773c');gr.addColorStop(1,'#80501f');g.fillStyle=gr;g.fillRect(bx,by,bw,bh);
   g.fillStyle='rgba(255,230,170,'+(.08+sh)+')';g.fillRect(bx,by,vert?2:bw,vert?bh:2);
   g.strokeStyle='rgba(46,26,10,.65)';g.lineWidth=1;g.strokeRect(bx+.5,by+.5,bw-1,bh-1);
   // Maserung
   g.strokeStyle='rgba(70,40,14,.3)';g.beginPath();
   if(vert){const m=bx+bw*(.3+hsh(i,y)*.4);g.moveTo(m,by+5);g.quadraticCurveTo(m+3,by+bh*.5,m-1,by+bh-5)}else{const m=by+bh*(.3+hsh(i,d.x)*.4);g.moveTo(bx+5,m);g.quadraticCurveTo(bx+bw*.5,m+3,bx+bw-5,m-1)}g.stroke();
   if(hsh(d.x+i,y+3)<.35){const kx=vert?bx+bw/2:bx+bw*(.2+hsh(i,y)*.6),ky=vert?by+bh*(.15+hsh(i,d.x)*.7):by+bh/2;g.fillStyle='rgba(60,34,12,.5)';g.beginPath();g.ellipse(kx,ky,2.4,3.2,0,0,7);g.fill()}}
  // Eisenbänder quer zur langen Achse
  const L=vert?ih:iw,ns=Math.max(1,Math.round(L/56));
  for(let i=0;i<ns;i++){const p=(i+.5)/ns*L,bx=vert?ix:ix+p-3.5,by=vert?iy+p-3.5:iy,bw=vert?iw:7,bh=vert?7:ih;
   const gr=vert?g.createLinearGradient(0,by,0,by+bh):g.createLinearGradient(bx,0,bx+bw,0);gr.addColorStop(0,'#6b727c');gr.addColorStop(.5,'#4a5059');gr.addColorStop(1,'#2c3036');g.fillStyle=gr;g.fillRect(bx,by,bw,bh);
   g.fillStyle='rgba(255,255,255,.3)';g.fillRect(bx,by,vert?bw:1.3,vert?1.3:bh);g.strokeStyle='rgba(18,20,24,.8)';g.lineWidth=1;g.strokeRect(bx+.5,by+.5,bw-1,bh-1);
   g.fillStyle='#b8c0c9';const n=Math.max(2,Math.round((vert?bw:bh)/16));for(let k=0;k<n;k++){const q=((k+.5)/n)*(vert?bw:bh);g.beginPath();g.arc(vert?bx+q:bx+bw/2,vert?by+bh/2:by+q,1.4,0,7);g.fill()}}
  // Edelstein-Platte, mittig (ein Diamant pro Tür)
  const ng=1;
  for(let i=0;i<ng;i++){const p=(i+.5)/ng*L,cx=vert?ix+iw/2:ix+p,cy=vert?iy+p:iy+ih/2;
   g.fillStyle='#3a3f46';g.beginPath();g.roundRect(cx-12,cy-12,24,24,5);g.fill();g.strokeStyle='#15171a';g.lineWidth=1;g.stroke();
   g.fillStyle=col;g.beginPath();g.moveTo(cx,cy-10);g.lineTo(cx+9,cy);g.lineTo(cx,cy+10);g.lineTo(cx-9,cy);g.closePath();g.fill();g.strokeStyle='rgba(0,0,0,.5)';g.stroke();
   g.fillStyle='rgba(255,255,255,.75)';g.fillRect(cx-3.5,cy-6,3,4);glanzFunkeln(cx-2,cy-3,5,d.x*.03+y+i*5)}
  // Weiche Tiefe: Licht von oben links
  const sg=g.createLinearGradient(ix,iy,ix+iw*.6,iy+ih*.6);sg.addColorStop(0,'rgba(255,240,200,.16)');sg.addColorStop(1,'rgba(20,10,0,.12)');g.fillStyle=sg;g.fillRect(ix,iy,iw,ih);
  g.restore()}
 // dunkler Rahmen, durchgehend um die ganze Tür
 rr(x+1.5,y+1.5,w-3,h-3,6);g.strokeStyle='rgba(34,20,8,.85)';g.lineWidth=3;g.stroke();
 // Eckbeschläge bei größeren Türen
 if(w>=80||h>=80){g.fillStyle='#4a5059';[[x+2,y+2],[x+w-12,y+2],[x+2,y+h-12],[x+w-12,y+h-12]].forEach(([a,b])=>{g.beginPath();g.roundRect(a,b,10,10,2);g.fill();g.strokeStyle='#15171a';g.lineWidth=.8;g.stroke();g.fillStyle='#b8c0c9';g.beginPath();g.arc(a+5,b+5,1.3,0,7);g.fill();g.fillStyle='#4a5059'})}
 g.restore();g=sv}
function tuerenZeichnen(){
  for(const d of tuerFlaechenHolen()){
    const x = Math.round(d.x - camX);
    if(x + d.w < -20 || x > VW + 20) continue;
    drawGate(d, d.teile.some(s => s.open), x);   // offen, solange noch ein Teil offen ist (schließt erst, wenn niemand drinsteht)
  }
}
// ---------- Moos und Lianen an hohen freien Seitenflächen (Nutzerwunsch: ab 3 Reihen) ----------
// Senkrechte freie Kanten von Boden/Wand werden über Stückgrenzen hinweg zusammengefasst; ist eine Fläche mindestens
// FLAECHE_MIN_H hoch, wachsen Moospolster und ein bis zwei Lianen an ihr – nur innerhalb der Fläche (nie in den
// Laufweg), Lage aus der Weltposition (fest, flackert nicht). Nur Zeichnen.
const FLAECHE_MIN_H = 120;
let flaechenCache = {src: null, n: -1, list: []};
function hoheFlaechen(){
  if(flaechenCache.src === solids && flaechenCache.n === solids.length) return flaechenCache.list;
  const kanten = [];
  for(const s of solids){
    if((s.type !== 'ground' && s.type !== 'wall') || !s.nb) continue;
    if(!s.nb.l) kanten.push({x: s.x, y0: s.y, y1: s.y + s.h, seite: -1});
    if(!s.nb.r) kanten.push({x: s.x + s.w, y0: s.y, y1: s.y + s.h, seite: 1});
  }
  kanten.sort((a, b) => a.seite - b.seite || a.x - b.x || a.y0 - b.y0);
  const zus = [];
  for(const k of kanten){
    const v = zus[zus.length - 1];
    if(v && v.seite === k.seite && Math.abs(v.x - k.x) < 1 && k.y0 <= v.y1 + 1) v.y1 = Math.max(v.y1, k.y1);
    else zus.push({...k});
  }
  const list = [];
  for(const f of zus){
    const hoch = f.y1 - f.y0; if(hoch < FLAECHE_MIN_H) continue;
    const rnd = bgRand(Math.round(f.x*7 + f.y0*13) + 5), moos = [], lianen = [];
    for(let y = f.y0 + 18; y < f.y1 - 10; y += 30) if(rnd() < 0.65) moos.push({y, r: 5 + rnd()*5, t: rnd()});
    const nl = hoch >= 200 ? 2 : 1;
    for(let k = 0; k < nl; k++) lianen.push({d: 6 + k*12 + rnd()*4, len: hoch*(0.35 + rnd()*0.4), ph: rnd()*6});
    list.push({...f, moos, lianen});
  }
  flaechenCache = {src: solids, n: solids.length, list};
  return list;
}
function hoheFlaechenZeichnen(){
  const M = THEME.moss || {base: '#5d9a4a', light: '#7cb860', vine: '#3f6b3a', leaf: '#4f8a45'};
  const t = performance.now()*0.001;
  for(const f of hoheFlaechen()){
    const x = f.x - camX; if(x < -60 || x > VW + 60) continue;
    const innen = -f.seite;   // in die Fläche hinein
    for(const l of f.lianen){   // Liane hängt von oben an der Fläche herab, schwingt ganz leicht
      const lx = x + innen*l.d, sw = Math.sin(t*0.8 + l.ph)*2;
      ctx.strokeStyle = M.vine; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(lx, f.y0 + 2);
      ctx.bezierCurveTo(lx + 4 + sw*0.3, f.y0 + l.len*0.35, lx - 4 + sw*0.6, f.y0 + l.len*0.7, lx + sw, f.y0 + l.len); ctx.stroke();
      ctx.fillStyle = M.leaf;
      for(let q = 0.15; q < 1; q += 0.17){
        const ly = f.y0 + l.len*q, side = (Math.round(q*10) % 2) ? 1 : -1;
        ctx.beginPath(); ctx.ellipse(lx + sw*q + side*4, ly, 4.2, 2, side*0.6, 0, Math.PI*2); ctx.fill();
      }
    }
    for(const m of f.moos){   // Moospolster an der Kante, innen
      const mx = x + innen*(m.r*0.5);
      ctx.fillStyle = M.base; ctx.beginPath(); ctx.ellipse(mx, m.y, m.r*0.75, m.r, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = M.light; ctx.beginPath(); ctx.ellipse(mx - innen*1.5, m.y - m.r*0.3, m.r*0.4, m.r*0.5, 0, 0, Math.PI*2); ctx.fill();
    }
  }
}
// Holz-Plattform: Randlicht oben + dunkle Kontur rundum
function designPlattform(x, y, w, h){
  const D = designLook();
  if(D.licht > 0){ ctx.fillStyle = `rgba(255,240,210,${D.licht*0.8})`; ctx.fillRect(x + 3, y + 1, w - 6, 1.5); }
  if(D.kante > 0){ ctx.strokeStyle = `rgba(${D.kanteFarbe},${D.kante*0.85})`; ctx.lineWidth = 2; roundRect(x + 1, y + 1, w - 2, h - 2, 4); ctx.stroke(); }
}
function draw(){
  // Kamera schaut nach vorn: die hintere Figur steht nah am linken Rand (CAM_BACK_MIN..CAM_BACK_PUSH px,
  // Totzone gegen Wackeln, cameraTarget in 09-kamera.js), damit man möglichst viel von dem sieht,
  // was als Nächstes kommt. Die vordere Figur bleibt trotzdem immer im Bild (höchstens FRONT_MAX).
  const targetCam = cameraTarget(camPos);
  camPos += (targetCam-camPos) * (1 - Math.pow(1-CAM_FOLLOW, frameDt/STEP));   // gleich schnell bei jeder Bildrate
  camX = Math.round(camPos);
  const wackel = kameraWackelVersatz(); camX += wackel.x;   // Kamera-Wackeln (09-kamera.js), nur fürs Bild

  ctx.setTransform(RS, 0, 0, RS, 0, 0);   // volle Bildschirmauflösung (00-setup.js)
  ctx.clearRect(0,0,W,H);
  tNowCp = performance.now();
  hinweisPfeile = 0;
  drawBackground();
  ctx.save();
  ctx.translate(0, CEILING_MARGIN + wackel.y);
  // Zoom: Spielwelt verkleinern, unten bündig (Boden bleibt unten, oben wird mehr Himmel sichtbar)
  applyWorldZoom();

  // weiche Lichtstrahlen von oben (Design-Politur 2: warme, sanft schwankende Strahlen aus DESIGN_LOOK, sonst wie bisher)
  // (neuer Hintergrund-Stil, 11b: keine Lichtstrahlen und eigener Lichtstaub statt der Pollen)
  if(designLook().strahlen && !BG_STIL) gemuetlichStrahlen();
  ctx.save();
  for(let i=0;i<(THEME.ray && !designLook().strahlen && !BG_STIL ? 2 : 0);i++){
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
  const PM = THEME.particles, pCol = designLook().pollen || PM.col;   // warme Pollen (Design-Politur 2)
  for(const pt of (BG_STIL ? [] : particles)){
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
      ctx.fillStyle = `rgba(${pCol},${(0.12*flick).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(sx, pt.y, pt.r*4, 0, Math.PI*2); ctx.fill();
    }
    ctx.fillStyle = `rgba(${pCol},${(0.15+flick*0.6).toFixed(2)})`;
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
// Plakette an allem, was ein Hebel/eine Druckplatte steuert (bewegliche Plattform, bewegter Haken, Wasser-/Lava-Marke,
// Presse): neues Aussehen – keine Zahl mehr, sondern wie an der Tür ein Diamant in der Hebel-Farbe auf dunkler Fassung
function verknuepfungsDiamant(x, y, col){
  ctx.fillStyle = '#3a3f46'; ctx.beginPath(); ctx.roundRect(x - 10, y - 10, 20, 20, 4.5); ctx.fill();
  ctx.strokeStyle = '#15171a'; ctx.lineWidth = 1; ctx.stroke();
  elementEdelstein(x, y, 8, col);
}
function drawLinkBadge(x, y, link, active){
  const col = linkColor(link);
  if(active){ ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.arc(x, y, 15 + Math.sin(performance.now()*0.008)*1.5, 0, Math.PI*2); ctx.stroke(); ctx.globalAlpha = 1; }
  verknuepfungsDiamant(x, y, col);
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
  for(const b of lavaBecken) for(const m of b.marken){   // Lava-Marke (elemente/lava.js)
    if(m.link===link) pts.push({x:m.x, y:m.y-12, kind:'pegel', active:!!linkOn[link]});
  }
  for(const P of pressen){   // Stachelpresse per Nummer (elemente/presse.js): Plakette auf dem Block
    if(P.link===link) pts.push({x:P.x+P.w/2, y:P.y+20, kind:'plat', active:!!linkOn[link]});
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
    {
      const img = themedImg(look==='platform' ? ASSETS.platformWood : ASSETS.groundGrass);
      if(img.complete && img.naturalWidth) drawTiledH(img, s.x, s.y, s.w, s.h, ax);
      else { ctx.fillStyle = colorOf(look==='platform' ? '--platform' : '--ground'); ctx.fillRect(x,s.y,s.w,s.h); }
    }
  }
  // (Fahrweg-Linien/Umrisse bewegter Böden auf Nutzerwunsch entfernt)
  for(const E of ELEMENTE) if(E.spiel && E.spiel.zeichnenHinten) E.spiel.zeichnenHinten();   // HINTER Boden/Wänden, z. B. Lava (elemente/)
  // Neues Aussehen: Boden und Wand als eine zusammenhängende Schicht (Zwischenspeicher-Stücke), bewegliche Boden-/Wand-
  // Stücke als je ein Block (pieceDraw), Türen als je eine zusammenhängende Tür (drawGate)
  djbDickichtZeichnen();   // Dschungel: Dickicht hinter dem Boden, schaut an den Kanten heraus (17a-dschungel-boden.js)
  materialZeichnen();
  matBeweglichZeichnen();
  for(const s of solids){
    if(ELEMENT_SOLID_TYPEN.has(s.type)) continue;   // zeichnet sich selbst (elemente/, z. B. Wechselboden)
    if(s.type==='ground' || s.type==='wall' || s.type==='door') continue;   // schon gezeichnet (materialZeichnen, tuerenZeichnen)
    if(s.gone){
      if(s.type==='crumble' && s.fragments) drawCrumbleBreak(s);
      continue;
    }
    const x = s.x-camX;
    if(x+s.w < -20 || x > VW+20) continue;
    if(s.type==='moveplat' && (s.look==='ground' || s.look==='wall')) continue;   // matBeweglichZeichnen
    if(s.type==='moveplat' && s.look){ drawSolidLook(s, s.look, Math.round(x)); continue; }

    if(s.type==='platform'){
      ctx.fillStyle = colorOf('--platform-shadow');
      roundRect(x+6, s.y+s.h+2, Math.max(0,s.w-12), 6, 3); ctx.fill();
    }

    if(s.type==='moveplat'){
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
    } else {
      const img = themedImg(s.type==='platform' ? ASSETS.platformWood : ASSETS.groundGrass);
      if(img.complete && img.naturalWidth) drawTiledH(img, s.x, s.y, s.w, s.h);
      else {
        ctx.fillStyle = colorOf(s.type==='platform' ? '--platform' : '--ground');
        ctx.fillRect(x,s.y,s.w,s.h);
      }
      if(s.type==='platform') designPlattform(x, s.y, s.w, s.h);   // Design-Politur B
    }
  }

  tuerenZeichnen();
  hoheFlaechenZeichnen();   // Moos und Lianen an hohen Seitenflächen (Design-Politur)
  drawGroundDeco();   // Dschungel-Pflanzen und Moos (17-deko.js)
  hgBodenLicht();     // neuer Nacht-Look: Boden abdunkeln, Leuchtpflanzen, Licht um die Figuren (11b)

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
    // Neues Aussehen (aussehen-paket/vorschau-code/haken-vorschau.js): dunkle Unterlage, damit der Haken zwischen Blumen und
    // Gras sofort auffällt, darüber das Cyan-Leuchten (etwas kräftiger als bisher)
    { const bk = ctx.createRadialGradient(x, h.y, 0, x, h.y, 34); bk.addColorStop(0, 'rgba(5,32,46,.7)'); bk.addColorStop(.65, 'rgba(5,32,46,.5)'); bk.addColorStop(1, 'rgba(5,32,46,0)');
      ctx.fillStyle = bk; ctx.beginPath(); ctx.arc(x, h.y, 34, 0, Math.PI*2); ctx.fill(); }
    ctx.fillStyle = 'rgba(0,229,255,.7)';
    ctx.beginPath(); ctx.arc(x,h.y,20+pulse,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = colorOf('--hook-ring'); ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(x,h.y,9,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle = colorOf('--hook'); ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(x,h.y,12,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle = colorOf('--hook-core');
    ctx.beginPath(); ctx.arc(x,h.y,4.5,0,Math.PI*2); ctx.fill();
    // Design-Politur C: Metallglanz am Ring (oben links hell, unten rechts dunkel) + Funkeln
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(x, h.y, 12, Math.PI*1.05, Math.PI*1.6); ctx.stroke();
    ctx.strokeStyle = 'rgba(10,20,40,.35)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(x, h.y, 13, Math.PI*0.1, Math.PI*0.65); ctx.stroke();
    glanzFunkeln(x - 7, h.y - 7, 6, h.x*0.11 + h.y);
  }

  for(const sp of spikes){
    const x=sp.x-camX;
    if(x<-30||x>VW+30) continue;
    // Stacheln können in 4 Richtungen zeigen (dir 0=oben, 1=rechts, 2=unten, 3=links)
    ctx.save();
    ctx.translate(Math.round(x), sp.y - sp.h/2);
    ctx.rotate((sp.dir||0) * Math.PI/2);
    // Design-Politur C: Gefahr bleibt besonders lesbar – dunkler, warm-roter Schein hinter den Spitzen
    const gw = ctx.createLinearGradient(0, -sp.h/2, 0, sp.h/2);
    gw.addColorStop(0, 'rgba(120,20,10,0)'); gw.addColorStop(0.55, 'rgba(120,20,10,.22)'); gw.addColorStop(1, 'rgba(60,10,5,.3)');
    ctx.fillStyle = gw; ctx.fillRect(-sp.w/2 + 1, -sp.h/2 + 6, sp.w - 2, sp.h - 8);
    ctx.drawImage(SPIKE_SPRITE, -sp.w/2, -sp.h/2, sp.w, sp.h);
    glanzFunkeln(-sp.w/2 + 5 + ((sp.x/40)%4)*10, -sp.h/2 + 9, 5, sp.x*0.37 + sp.y);
    ctx.restore();
  }

  // Elemente aus dem Register (elemente/): Hebel, Druckplatten, Sprungpilze, Aufwind … (Türen: mit den Wänden oben)
  for(const E of ELEMENTE) if(E.spiel && E.spiel.zeichnen) E.spiel.zeichnen();

  // Plaketten an allem, was ein Schalter steuert (gleiche Farbe + Nummer wie der Hebel)
  const seen = new Set();
  for(const sw of [...switchDefs, ...plates]){
    if(seen.has(sw.link)) continue; seen.add(sw.link);
    for(const t of linkTargets(sw.link)){
      // Neues Aussehen: keine Zahlen mehr an Tür, Wechselboden und Portal – dort zeigt ein Diamant in der Hebel-Farbe die Verknüpfung
      if(t.kind === 'door' || t.kind === 'wechsel' || t.kind === 'tele') continue;
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
    // Mast + Fuß (Design-Politur C: Kontaktschatten, runder Mast, glänzender Knauf)
    glanzSchatten(x, base, 15, 3.5);
    ctx.fillStyle = '#8a7a66'; roundRect(x-7, base-5, 14, 5, 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(x-6, base-5, 12, 1.2);
    const mast = ctx.createLinearGradient(x-2, 0, x+2, 0); mast.addColorStop(0, '#fffaf0'); mast.addColorStop(1, '#b9ad98');
    ctx.fillStyle = mast; ctx.fillRect(x-2, base-poleH, 4, poleH);
    const knauf = ctx.createRadialGradient(x-1.5, base-poleH-3.5, 0.5, x, base-poleH-2, 4.5);
    knauf.addColorStop(0, '#fff6c8'); knauf.addColorStop(0.5, '#ffcf4d'); knauf.addColorStop(1, '#c48a12');
    ctx.fillStyle = knauf; ctx.beginPath(); ctx.arc(x, base-poleH-2, 4, 0, Math.PI*2); ctx.fill();
    glanzFunkeln(x - 1.5, base-poleH-3.5, 5, cp.x*0.07);
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
    if(!c.taken) glanzFunkeln(x - 4, c.y - lift - 5, 6, c.x*0.13 + c.y*0.07);   // Design-Politur C
    if(!c.taken && c.klasse === 'meister') muenzeMeisterZeichnen(x, c.y - lift, tNow, c.x);   // Nacht-Ausbau: Meister-Münze funkelt
  }

  const gx = goal.x-camX;
  const signImg = ASSETS.signExit;
  glanzSchatten(gx, goal.y, 26, 5);   // Design-Politur C: Kontaktschatten unter dem Ziel-Schild
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
    const B = matScheinwandBild(f);   // gleiche Wand wie ringsum (Zwischenspeicher je Scheinwand)
    ctx.save(); ctx.globalAlpha = f.alpha;
    ctx.drawImage(B.c, B.x - camX, B.y, B.w, B.h);
    ctx.restore();
  }
  drawCritters();   // Schmetterlinge, Frösche, Schnecken, Pilze, Knospen, Faultier (20-tiere.js)
  drawBirds();
  tierLeuchtenNacht();   // neuer Dschungel-Look nachts: Tiere leuchten sanft (20-tiere.js)
  drawDust();       // Staubwölkchen (21-figuren-leben.js)
  drawCharacter(p2, camX);
  drawCharacter(p1, camX);
  if(typeof neueBewegungZeichnen === 'function') neueBewegungZeichnen();   // Nacht-Ausbau: Dash-Punkt, Bruchstücke, Rutsch-Staub (nur Anzeige)
  drawHearts();     // Herzchen, wenn beide nah beieinander stehen
  drawCoinFx(camX);
  for(const E of ELEMENTE) if(E.spiel && E.spiel.zeichnenVorne) E.spiel.zeichnenVorne();   // vor den Figuren, z. B. Wasser (elemente/)
  if(typeof szeneZeichnen === 'function') szeneZeichnen();   // Spielszene: Figuren + Sprechblasen (29-story.js)
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
  hgStilVorne();   // neuer Hintergrund-Stil: Lichtstaub vor dem Spielfeld, nachts Glühwürmchen (11b)
  if(THEME.tint && !hgEigenesLicht()){ ctx.fillStyle = THEME.tint; ctx.fillRect(0, 0, W, H); }
  drawThemeDarkness();   // Nacht/Höhle: dunkel, Licht um Figuren und leuchtende Dinge (10a-themen.js)
  drawFakeGlints();      // dezentes Glitzern an Scheinwänden (auch im Dunkeln sichtbar)
  for(const E of ELEMENTE) if(E.spiel && E.spiel.zeichnenOben) E.spiel.zeichnenOben();   // Bildschirm-Anzeigen, z. B. Boss-Lebensbalken (elemente/)
  if(typeof partnerZeichnen === 'function') partnerZeichnen();   // Computer-Partner: Symbol über seiner Figur (30-partner.js, nur Testmodus)
  weatherFront();   // Regen, Spritzer, warmer Schimmer, Vignette (19-wetter.js)
  drawOffscreenArrows();
  drawZielHinweise();   // kurzer Pfeil am Bildrand zum Ziel eines eben geschalteten Hebels (07-effekte-ton-muenzen.js)
  drawContinuePrompt();
  if(typeof szeneRahmen === 'function') szeneRahmen();       // Spielszene: Kino-Balken, Titel, Hinweis (29-story.js)
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
