// 12b-haken-aussehen.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.
//
// Haken passend zur Welt (Nutzerwunsch „nicht einfach ein blauer Punkt in der Luft, sondern so, dass er ins Level passt –
// irgendwo dranhängt, wenn es passt“): ein Ring, der an einer Liane (Dschungel) bzw. Kette (Ruinen, Höhle, Vulkan) hängt.
// Ist über dem Haken Boden/Wand (höchstens HAKEN_HAENGEN_MAX px), führt die Liane/Kette bis dorthin; sonst verläuft sie
// nach oben weich ins Bild hinein (HAKEN_KETTE_FREI px) – im Dschungel hängt die Liane immer von oben (Blätterdach).
// In Reichweite leuchtet der Ring auf (warm je Welt), wie vorher das Cyan-Leuchten – gut erkennbar bleibt er immer.
// Nur Zeichnen: ändert nie Spielzustand (Aufhänge-Höhe wird je Haken zwischengespeichert, bewegte Haken je Spalte).
const HAKEN_HAENGEN_MAX = 9*40;     // so weit (px) über dem Haken darf das Material sein, an dem er hängt
const HAKEN_KETTE_FREI = 2.2*40;    // ohne Material: so lang ist die sichtbare Kette, nach oben ausgeblendet
const HAKEN_STIL = {
  dschungel: {ring: '#8a5a2b', ringHell: '#d9a46a', schein: '255,214,120', art: 'liane'},
  ruinen:    {ring: '#b07a2a', ringHell: '#f3cf72', schein: '255,205,110', art: 'kette', glied: '#8d6a3a', gliedHell: '#d8b46a'},
  hoehle:    {ring: '#5d6b7a', ringHell: '#c9e6ff', schein: '150,220,255', art: 'kette', glied: '#4b5563', gliedHell: '#aab8c8', kristall: true},
  vulkan:    {ring: '#6a4a3a', ringHell: '#ff9a4a', schein: '255,140,60', art: 'kette', glied: '#3a302c', gliedHell: '#8a6a5a', glut: true},
};
function hakenWelt(){
  const w = typeof designWeltZeit === 'function' ? designWeltZeit(typeof themeName !== 'undefined' ? themeName : '').welt : 'dschungel';
  return HAKEN_STIL[w] ? w : 'dschungel';
}
// Unterkante des nächsten festen Materials über (x, y) – oder null
function hakenAufhaengeY(x, y){
  let best = null;
  for(const s of solids){
    if(s.type !== 'ground' && s.type !== 'wall' && s.type !== 'crumble') continue;
    if(s.moving || x < s.x + 2 || x > s.x + s.w - 2) continue;
    const u = s.y + s.h;
    if(u <= y - 14 && y - u <= HAKEN_HAENGEN_MAX && (best === null || u > best)) best = u;
  }
  return best;
}
function hakenAufhaengung(h){
  if(h.moving){   // bewegter Haken: je Spalte merken
    const k = Math.round(h.x/40);
    if(h._haengK !== k){ h._haengK = k; h._haengY = hakenAufhaengeY(h.x, h.y); }
    return h._haengY;
  }
  if(h._haengY === undefined) h._haengY = hakenAufhaengeY(h.x, h.y);
  return h._haengY;
}
// Kette aus ovalen Gliedern von (x, y0) nach oben bis y1; alpha blendet nach oben aus, wenn frei
function hakenKette(x, yUnten, yOben, S, frei){
  const L = 9;
  ctx.save(); ctx.lineCap = 'round';
  for(let y = yUnten, i = 0; y > yOben - 1; y -= L - 1, i++){
    const t = (yUnten - y)/Math.max(1, yUnten - yOben);
    ctx.globalAlpha = frei ? Math.max(0, 1 - t*t) : 1;
    const cy = y - L/2;
    ctx.strokeStyle = 'rgba(20,14,10,.55)'; ctx.lineWidth = 3.6;
    ctx.beginPath(); i % 2 ? ctx.moveTo(x, cy - L/2 + 1) : ctx.ellipse(x, cy, 2.6, L/2, 0, 0, Math.PI*2);
    if(i % 2) ctx.lineTo(x, cy + L/2 - 1);
    ctx.stroke();
    ctx.strokeStyle = S.glied; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.strokeStyle = S.gliedHell; ctx.lineWidth = 0.9;
    ctx.beginPath(); if(i % 2) { ctx.moveTo(x - 0.6, cy - L/2 + 2); ctx.lineTo(x - 0.6, cy + L/2 - 2); } else ctx.ellipse(x, cy, 2.6, L/2, 0, Math.PI*0.9, Math.PI*1.5);
    ctx.stroke();
  }
  ctx.restore();
}
// kleine Halterung am Material (Eisenplatte bzw. Wurzelknoten)
function hakenHalter(x, y, S, welt){
  ctx.save();
  if(welt === 'dschungel'){
    ctx.fillStyle = '#4b3420'; ctx.beginPath(); ctx.ellipse(x, y + 1, 7, 4, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#6b4a2c'; ctx.beginPath(); ctx.ellipse(x - 1, y, 5, 2.6, 0, 0, Math.PI*2); ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(15,10,8,.5)'; ctx.fillRect(x - 8, y, 16, 6);
    ctx.fillStyle = S.glied; ctx.fillRect(x - 7, y, 14, 5);
    ctx.fillStyle = S.gliedHell; ctx.fillRect(x - 7, y, 14, 1.2);
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.arc(x - 4.5, y + 2.5, 1, 0, Math.PI*2); ctx.arc(x + 4.5, y + 2.5, 1, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
// Haken zeichnen (x = Bildschirm-x, h.y = Welt-y wie im übrigen draw())
function hakenZeichnen(h, x, inRange){
  const welt = hakenWelt(), S = HAKEN_STIL[welt], t = performance.now();
  const y = h.y, ringR = 12, oben = -SKY_ROOM - 10;
  const haeng = hakenAufhaengung(h);
  // Liane / Kette nach oben
  if(S.art === 'liane'){
    const y0 = haeng !== null ? haeng : oben;
    if(typeof lianeZeichnen === 'function') lianeZeichnen(x + Math.sin(h.x*0.013)*3, y0, x, y - ringR + 1, 0.35, 0, h.x);
    if(haeng !== null) hakenHalter(x, haeng, S, welt);
  } else {
    if(haeng !== null){ hakenKette(x, y - ringR + 1, haeng + 3, S, false); hakenHalter(x, haeng, S, welt); }
    else hakenKette(x, y - ringR + 1, y - ringR - HAKEN_KETTE_FREI, S, true);
  }
  // Schein (immer dezent, in Reichweite kräftig) – so bleibt der Haken zwischen Pflanzen gut zu sehen
  const puls = inRange ? 0.75 + 0.25*Math.sin(t*0.008 + h.x*0.05) : 0.35;
  { const g = ctx.createRadialGradient(x, y, 2, x, y, 30); g.addColorStop(0, `rgba(${S.schein},${0.55*puls})`); g.addColorStop(1, `rgba(${S.schein},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI*2); ctx.fill(); }
  // dunkle Unterlage, dann Ring mit Glanz
  ctx.save();
  ctx.strokeStyle = 'rgba(10,8,6,.6)'; ctx.lineWidth = 7.5; ctx.beginPath(); ctx.arc(x, y, ringR, 0, Math.PI*2); ctx.stroke();
  ctx.strokeStyle = S.ring; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, ringR, 0, Math.PI*2); ctx.stroke();
  ctx.strokeStyle = inRange ? S.ringHell : 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.arc(x, y, ringR + 0.5, Math.PI*1.05, Math.PI*1.7); ctx.stroke();
  if(welt === 'dschungel'){   // Holz-Ring mit Blatt
    ctx.strokeStyle = 'rgba(60,35,15,.6)'; ctx.lineWidth = 1;
    for(let i = 0; i < 6; i++){ const a = i*Math.PI/3 + 0.3; ctx.beginPath(); ctx.moveTo(x + Math.cos(a)*(ringR - 2), y + Math.sin(a)*(ringR - 2)); ctx.lineTo(x + Math.cos(a)*(ringR + 2), y + Math.sin(a)*(ringR + 2)); ctx.stroke(); }
    ctx.fillStyle = '#4f9a3e'; ctx.beginPath(); ctx.ellipse(x + 8, y - 9, 6, 3, -0.6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(200,250,160,.5)'; ctx.beginPath(); ctx.ellipse(x + 7, y - 10, 3, 1, -0.6, 0, Math.PI*2); ctx.fill();
  }
  if(S.kristall){   // Höhle: kleiner Leuchtkristall oben am Ring
    ctx.fillStyle = inRange ? '#bfeaff' : '#7fb8d8';
    ctx.beginPath(); ctx.moveTo(x, y - ringR - 7); ctx.lineTo(x + 3.5, y - ringR - 1); ctx.lineTo(x, y - ringR + 2); ctx.lineTo(x - 3.5, y - ringR - 1); ctx.closePath(); ctx.fill();
  }
  if(S.glut){   // Vulkan: glühender Kern im Eisenring
    ctx.strokeStyle = `rgba(255,120,40,${inRange ? 0.95 : 0.55})`; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(x, y, ringR - 2.4, 0, Math.PI*2); ctx.stroke();
  }
  ctx.restore();
  if(typeof glanzFunkeln === 'function') glanzFunkeln(x - 7, y - 7, 6, h.x*0.11 + h.y);
}
