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
// ---------- Halteseil (Nutzer: „ist ein Hebel mit einer Liane verknüpft, sollte ein Seil die Liane halten – das Seil wird
// durch das Betätigen des Hebels durchgeschnitten“) ----------
// Eine per Schalter gestartete Pendel-Liane hängt bis dahin schräg am Start ihres Bogens; ein Tau hält sie zur Seite (an der
// nächsten Wand/Erde auf dieser Seite, sonst schräg hinauf ins Blätterdach). Beim Schalten reißt es in der Mitte (h.schnitt
// zählt die Schritte seither, js/05): das Ende an der Wand baumelt, das am Ring fällt ab. Neustart/Tod: wieder ganz.
const HALTESEIL_SUCHE = 360;     // px: so weit zur Seite wird eine Wand zum Anbinden gesucht
const HALTESEIL_RISS = 45;       // Schritte: so lange fallen die Enden nach dem Durchschneiden
function hakenHalteseilPunkt(h){
  if(h._halteseil) return h._halteseil;
  const d = -Math.sign(h.targetX - h.startX) || -1, y = h.startY;
  let best = null;
  for(const s of solids){
    if(s.moving || s.gone || !['ground', 'wall', 'crumble'].includes(s.type) || y < s.y || y > s.y + s.h) continue;
    const fx = d < 0 ? s.x + s.w : s.x, ab = (fx - h.startX)*d;
    if(ab > 10 && ab <= HALTESEIL_SUCHE && (!best || ab < best.ab)) best = {x: fx, y: y - 6, ab, wand: true};
  }
  return (h._halteseil = best || {x: h.startX + d*90, y: Math.max(-SKY_ROOM - 10, y - 240), wand: false});
}
function hakenHalteseilZeichnen(h, x, y, ringR){
  if(typeof tauZeichnen !== 'function') return;
  const A = hakenHalteseilPunkt(h), ax = A.x - camX, ay = A.y;
  const rx = x + Math.sign(ax - x)*ringR*0.7, ry = y + 2;   // am Ring angeknotet
  const knoten = () => { if(A.wand){ ctx.fillStyle = '#2a2f36'; ctx.beginPath(); ctx.arc(ax, ay, 4.2, 0, Math.PI*2); ctx.fill();
                                     ctx.fillStyle = '#9aa3ad'; ctx.beginPath(); ctx.arc(ax - 1, ay - 1, 1.4, 0, Math.PI*2); ctx.fill(); } };
  if(h.schnitt === undefined){   // noch ganz: straff mit leichtem Durchhang
    tauZeichnen(ax, ay, rx, ry, 6, 2.4); knoten(); return;
  }
  const k = Math.min(1, h.schnitt/HALTESEIL_RISS), fall = 1 - Math.pow(1 - k, 2);
  const mx = (ax + rx)/2, my = (ay + ry)/2, L = Math.hypot(rx - ax, ry - ay)/2;
  // Nutzer: „das Seil kann sich auflösen, nachdem es durchgeschnitten wurde“ – beide Enden fallen und blenden aus
  const weg = Math.min(1, h.schnitt/HALTESEIL_WEG);
  if(weg < 1){
    ctx.save(); ctx.globalAlpha = 1 - weg;
    tauZeichnen(ax, ay, mx + (ax - mx)*fall*0.85, my + L*fall*0.95, 4*(1 - fall), 2.4);   // Ende an der Wand schwingt herunter
    if(k < 1){ ctx.globalAlpha = (1 - k)*(1 - weg); tauZeichnen(rx, ry, mx + (rx - mx)*fall*0.3, my + 60*fall*fall + 12*fall, 2, 2.4); }   // Ende am Ring fällt ab
    ctx.restore();
  }
  knoten();
}
const HALTESEIL_WEG = 80;        // Schritte nach dem Schnitt, bis auch das Ende an der Wand ganz verschwunden ist
// Haken zeichnen (x = Bildschirm-x, h.y = Welt-y wie im übrigen draw())
function hakenZeichnen(h, x, inRange){
  const welt = hakenWelt(), S = HAKEN_STIL[welt], t = performance.now();
  const y = h.y, ringR = 12, oben = -SKY_ROOM - 10;
  const P = h.moving && typeof hakenPendel === 'function' ? hakenPendel(h) : null;
  const haeng = P ? P.halt : hakenAufhaengung(h);
  const seed = h.moving ? h.startX : h.x;   // feste Lage der Blätter (Nutzer: „die Blätter bewegen sich viel zu schnell“)
  // Liane / Kette nach oben – ein pendelnder Haken hängt an seinem festen Aufhängepunkt (schwingt um ihn)
  if(S.art === 'liane'){
    const y0 = haeng !== null ? haeng : oben, x0 = P ? P.cx - camX : x + Math.sin(seed*0.013)*3;
    // Nutzer: „die Liane mittig am Diamanten ausrichten“ – sie endet am Ring genau in Richtung Ring-Mitte (auch schräg)
    const dx = x0 - x, dy = y0 - y, d = Math.hypot(dx, dy) || 1;
    if(typeof lianeZeichnen === 'function') lianeZeichnen(x0, y0, x + dx/d*(ringR - 1), y + dy/d*(ringR - 1), 0.35, 0, seed, P ? 0.15 : undefined);
    if(haeng !== null) hakenHalter(x0, haeng, S, welt);
  } else {
    if(haeng !== null){ hakenKette(x, y - ringR + 1, haeng + 3, S, false); hakenHalter(x, haeng, S, welt); }
    else hakenKette(x, y - ringR + 1, y - ringR - HAKEN_KETTE_FREI, S, true);
  }
  if(P && h.switchCtl) hakenHalteseilZeichnen(h, x, y, ringR);   // per Schalter gestartete Pendel-Liane: Halteseil
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
