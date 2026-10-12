// elemente/licht.js – Elemente „Lichtquelle“, „Spiegel“ und „Lichtkristall“ (Ausbau 7, Welt Ruinen; Punkt-Elemente).
// Eine Lichtquelle (Sonnen-Scheibe im Stein, fest wie eine Wand) schickt einen Lichtstrahl in ihre Richtung (→ ← ↑ ↓).
// Der Strahl läuft Kästchen für Kästchen, bis er auf Stein, eine geschlossene Tür, Wechselboden oder eine Falle trifft
// (Stege, Scheinwände und Figuren lässt er durch). Ein SPIEGEL ( / oder \ ) lenkt ihn um 90° um; jede Figur kann einen
// Spiegel in Reichweite mit ihrer Hebel-Taste (J / Num 2 / Kreis) umdrehen. Trifft der Strahl einen LICHTKRISTALL, ist
// dessen Verknüpfungs-Nummer AN, solange das Licht darauf fällt (wie eine Druckplatte: Türen auf, Bewegung fährt …).
// Rolle: Spiegel stehen oft dort, wo nur der Affe (per Haken) oder nur das Schweinchen (segelnd) hinkommt – einer lenkt
// das Licht, der andere geht durch die Tür, die der Kristall öffnet.
// Spiel-Daten: lichtquellen [{x, y (linke obere Ecke), richtung}], spiegel [{x, y, stellung: '/'|'\\'}], kristalle [{x, y, link}]
let lichtquellen = [], spiegelListe = [], kristalle = [];
let lichtWege = [];   // je Quelle: [[x, y], …] Punkte des Strahls (Welt-Koordinaten, Kästchen-Mitten)
const LICHT_RICHTUNG = {r: [1, 0], l: [-1, 0], o: [0, -1], u: [0, 1]};
const LICHT_PFEIL = {r: '→', l: '←', o: '↑', u: '↓'};
// Spiegel: '/' lenkt (dx, dy) nach (-dy, -dx), '\' nach (dy, dx) (y wächst nach unten)
function lichtUmlenken(st, dx, dy){ return st === '/' ? [-dy, -dx] : [dy, dx]; }
// Strahl verfolgen (gemeinsam für Spiel und Editor): fest(c, r) = blockiert?, spiegelBei(c, r), kristallBei(c, r)
function lichtVerfolgen(c, r, dx, dy, fest, spiegelBei, kristallBei){
  const weg = [[c, r]], getroffen = [], besucht = new Set();
  const MAX = typeof LICHT_REICHWEITE !== "undefined" ? LICHT_REICHWEITE : 80;   // Editor lädt 02-physik-werte.js nicht
  for(let i = 0; i < MAX; i++){
    c += dx; r += dy;
    const key = c + ',' + r + ',' + dx + ',' + dy;
    if(besucht.has(key)) break; besucht.add(key);
    const k = kristallBei(c, r);
    if(k){ weg.push([c, r]); getroffen.push(k); break; }
    const sp = spiegelBei(c, r);
    if(sp){ weg.push([c, r]); [dx, dy] = lichtUmlenken(sp.stellung, dx, dy); continue; }
    if(fest(c, r)){ weg.push([c - dx*0.5, r - dy*0.5]); break; }
    if(i === MAX - 1) weg.push([c, r]);
  }
  return {weg, getroffen};
}
function lichtFestImSpiel(c, r){
  const px = c*40 + 20, py = r*40 + 20;
  for(const s of solids){
    if(s.gone || s.type === 'oneway' || s.type === 'fake' || s.type === 'lichtquelle') continue;
    if(px >= s.x && px < s.x + s.w && py >= s.y && py < s.y + s.h) return true;
  }
  return false;
}
function lichtSchritt(){
  const spIdx = new Map(spiegelListe.map(s => [s.c + ',' + s.r, s])), kIdx = new Map(kristalle.map(k => [k.c + ',' + k.r, k]));
  const vorher = kristalle.map(k => k.an);
  for(const k of kristalle) k.an = false;
  lichtWege = lichtquellen.map(q => {
    const v = lichtVerfolgen(q.c, q.r, q.dx, q.dy, lichtFestImSpiel, (c, r) => spIdx.get(c + ',' + r), (c, r) => kIdx.get(c + ',' + r));
    for(const k of v.getroffen) k.an = true;
    return v.weg;
  });
  kristalle.forEach((k, i) => {
    if(k.an !== vorher[i] && k.x > camX - 80 && k.x < camX + VW + 80) SFX.kristall(k.x, k.an);
    if(k.an) k.leuchtT = Math.min(1, (k.leuchtT || 0) + 0.08); else k.leuchtT = Math.max(0, (k.leuchtT || 0) - 0.05);
  });
  for(const s of spiegelListe) if(s.drehT > 0) s.drehT--;
}
// (05-level-objekte.js, updatePlates) Kristall im Licht = Nummer an, wie eine gedrückte Druckplatte
function lichtWunsch(want){ for(const k of kristalle) if(k.link) want[k.link] = want[k.link] || !!k.an; }
// (05-level-objekte.js) Hebel-Taste ohne Hebel in Reichweite: nächsten Spiegel drehen
// nächster Spiegel in Reichweite der Hebel-Taste (oder null)
function spiegelInReichweite(player){
  let best = null, bd = Infinity;
  for(const s of spiegelListe){
    if(Math.abs(player.x - (s.x + 20)) >= LEVER_RANGE_X || Math.abs((player.y - player.h*0.5) - (s.y + 20)) >= LEVER_RANGE_Y) continue;
    const d = Math.abs(player.x - (s.x + 20)); if(d < bd){ bd = d; best = s; }
  }
  return best;
}
function spiegelBedienen(player){
  const best = spiegelInReichweite(player);
  if(!best) return false;
  best.stellung = best.stellung === '/' ? '\\' : '/'; best.drehT = 12;
  player.leverAnim = {t0: performance.now(), dir: Math.sign(best.x + 20 - player.x) || player.facing || 1};
  SFX.spiegel(best.x);
  return true;
}
function lichtZuruecksetzen(){ for(const s of spiegelListe){ s.stellung = s.start; s.drehT = 0; } for(const k of kristalle){ k.an = false; k.leuchtT = 0; } }
// --- Zeichnen (nur Anzeige) ---
function lichtQuelleBild(c, x, y, dx, dy, an){
  // Sonnenstein (Ruinen-Überarbeitung): dunkler Basaltblock mit Goldeinlage, glühende Sonnenscheibe mit drehendem
  // Strahlenkranz und Schein, Linse auf der Seite, aus der das Licht kommt
  const t = typeof performance !== 'undefined' ? performance.now()*0.001 : 0, cx = x + 20, cy = y + 20;
  const gr = c.createLinearGradient(x, y, x + 40, y + 40); gr.addColorStop(0, '#4a3f36'); gr.addColorStop(1, '#231c17');
  c.fillStyle = gr; roundRectPfad(c, x + 1, y + 1, 38, 38, 6); c.fill();
  c.strokeStyle = '#c9963a'; c.lineWidth = 2; roundRectPfad(c, x + 3, y + 3, 34, 34, 5); c.stroke();
  c.strokeStyle = 'rgba(255,214,120,.35)'; c.lineWidth = 1; roundRectPfad(c, x + 6, y + 6, 28, 28, 4); c.stroke();
  for(const [u, v] of [[7, 7], [33, 7], [7, 33], [33, 33]]){ c.fillStyle = '#e0b04a'; c.beginPath(); c.arc(x + u, y + v, 1.6, 0, Math.PI*2); c.fill(); }
  // Schein hinter der Scheibe
  const puls = an ? 0.85 + 0.15*Math.sin(t*3) : 0.4;
  const sch = c.createRadialGradient(cx, cy, 2, cx, cy, 20);
  sch.addColorStop(0, `rgba(255,240,170,${0.9*puls})`); sch.addColorStop(0.5, `rgba(255,190,60,${0.45*puls})`); sch.addColorStop(1, 'rgba(255,160,40,0)');
  c.fillStyle = sch; c.beginPath(); c.arc(cx, cy, 20, 0, Math.PI*2); c.fill();
  // Strahlenkranz (dreht sich langsam)
  c.save(); c.translate(cx, cy); c.rotate(t*0.6);
  c.strokeStyle = an ? '#ffd76a' : '#a8843a'; c.lineWidth = 2; c.lineCap = 'round';
  for(let i = 0; i < 12; i++){ const a = i/12*Math.PI*2, r1 = 10.5, r2 = i % 2 ? 14 : 16; c.beginPath(); c.moveTo(Math.cos(a)*r1, Math.sin(a)*r1); c.lineTo(Math.cos(a)*r2, Math.sin(a)*r2); c.stroke(); }
  c.restore();
  // Scheibe
  const sd = c.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 9);
  sd.addColorStop(0, '#ffffff'); sd.addColorStop(0.4, an ? '#fff1a8' : '#e8d08a'); sd.addColorStop(1, an ? '#ffb02e' : '#b8862e');
  c.fillStyle = sd; c.beginPath(); c.arc(cx, cy, 8.5, 0, Math.PI*2); c.fill();
  c.strokeStyle = '#8a5a14'; c.lineWidth = 1.2; c.stroke();
  // Linse in Strahlrichtung
  const lx = cx + dx*16, ly = cy + dy*16;
  c.fillStyle = '#c9963a'; c.beginPath(); c.arc(lx, ly, 4.5, 0, Math.PI*2); c.fill();
  c.fillStyle = an ? '#fffbe6' : '#d8c08a'; c.beginPath(); c.arc(lx, ly, 2.8, 0, Math.PI*2); c.fill();
}
function roundRectPfad(c, x, y, w, h, r){
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
// Halterung eines Spiegels (damit er nicht in der Luft hängt): einmal beim ersten Zeichnen aus dem Gelände bestimmt –
// Boden direkt darunter: Sockel · Boden 1–3 Kästchen tiefer: Ständer · Decke bis 8 Kästchen höher: Kette ·
// Wand daneben: Wandarm · sonst ein Ständer bis zum nächsten Boden bzw. eine Kette bis zum oberen Rand
function spiegelHalt(s, ohneWand){
  const fest = (c, r) => { const px = c*40 + 20, py = r*40 + 20;
    return solids.some(o => !o.gone && o.type !== 'fake' && o.type !== 'wechsel' && px >= o.x && px < o.x + o.w && py >= o.y && py < o.y + o.h); };
  for(let k = 1; k <= 4; k++) if(fest(s.c, s.r + k)) return {art: k === 1 ? 'sockel' : 'staender', n: k - 1};
  for(let k = 1; k <= 10; k++) if(fest(s.c, s.r - k)) return {art: 'kette', n: k - 1};
  if(!ohneWand && fest(s.c - 1, s.r)) return {art: 'wand', seite: -1};
  if(!ohneWand && fest(s.c + 1, s.r)) return {art: 'wand', seite: 1};
  for(let k = 5; k <= 18; k++) if(fest(s.c, s.r + k)) return {art: 'staender', n: k - 1};
  return {art: 'kette', n: s.r + 4};
}
function spiegelHalterungBild(c, x, y, h){
  const cx = x + 20, cy = y + 20;
  if(!h || h.art === 'sockel' || h.art === 'staender'){
    const unten = y + 40 + (h ? h.n : 0)*40;
    c.strokeStyle = '#4a3214'; c.lineWidth = 5; c.beginPath(); c.moveTo(cx, cy + 18); c.lineTo(cx, unten - 6); c.stroke();
    c.strokeStyle = '#c9963a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(cx, cy + 18); c.lineTo(cx, unten - 6); c.stroke();
    const st = c.createLinearGradient(0, unten - 9, 0, unten); st.addColorStop(0, '#b9a98c'); st.addColorStop(1, '#6d5c46');
    c.fillStyle = st; c.beginPath(); c.moveTo(cx - 12, unten); c.lineTo(cx - 8, unten - 9); c.lineTo(cx + 8, unten - 9); c.lineTo(cx + 12, unten); c.closePath(); c.fill();
    c.strokeStyle = '#3a2c1c'; c.lineWidth = 1.2; c.stroke();
  } else if(h.art === 'kette'){
    const oben = y - h.n*40;
    c.strokeStyle = '#3a2c1c'; c.lineWidth = 1.6;
    for(let yy = cy - 18; yy > oben; yy -= 7){ c.beginPath(); c.ellipse(cx, yy - 3, 2.4, 3.8, 0, 0, Math.PI*2); c.stroke(); }
    c.fillStyle = '#6b4a1e'; c.fillRect(cx - 6, oben, 12, 4);
  } else if(h.art === 'wand'){
    const wx = h.seite < 0 ? x : x + 40;
    c.strokeStyle = '#4a3214'; c.lineWidth = 5; c.beginPath(); c.moveTo(wx, cy); c.lineTo(cx + h.seite*18, cy); c.stroke();
    c.strokeStyle = '#c9963a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(wx, cy); c.lineTo(cx + h.seite*18, cy); c.stroke();
    c.fillStyle = '#6b4a1e'; c.fillRect(wx - (h.seite < 0 ? 0 : 5), cy - 7, 5, 14);
  }
}
function spiegelBild(c, x, y, stellung, dreh, halt){
  // Spiegel (Ruinen-Überarbeitung): Halterung (Sockel/Ständer/Kette/Wandarm), Kardanring aus Bronze mit Achse, ovaler
  // Spiegel im Goldrahmen mit hellem Glas, Glanzstreifen und Funkeln; die Schräge zeigt / bzw. \ (Lichtweg)
  const cx = x + 20, cy = y + 20, t = typeof performance !== 'undefined' ? performance.now()*0.001 : 0;
  spiegelHalterungBild(c, x, y, halt);
  c.strokeStyle = '#4a3214'; c.lineWidth = 4.5; c.beginPath(); c.arc(cx, cy, 18, 0, Math.PI*2); c.stroke();
  c.strokeStyle = '#d4a23c'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, 18, 0, Math.PI*2); c.stroke();
  // kleiner Drehpfeil am Ring (man kann ihn drehen)
  c.strokeStyle = '#fff3c8'; c.lineWidth = 1.6; c.beginPath(); c.arc(cx, cy, 18, -Math.PI*0.95, -Math.PI*0.6); c.stroke();
  c.save(); c.translate(cx, cy);
  c.rotate((stellung === '/' ? -Math.PI/4 : Math.PI/4) + (dreh || 0));
  c.fillStyle = '#3a2610'; c.beginPath(); c.ellipse(0, 0, 17, 8, 0, 0, Math.PI*2); c.fill();
  const rg = c.createLinearGradient(0, -8, 0, 8); rg.addColorStop(0, '#ffe08a'); rg.addColorStop(0.5, '#d4a23c'); rg.addColorStop(1, '#8a6020');
  c.fillStyle = rg; c.beginPath(); c.ellipse(0, 0, 15.5, 6.6, 0, 0, Math.PI*2); c.fill();
  const gg = c.createLinearGradient(-12, -5, 12, 5); gg.addColorStop(0, '#ffffff'); gg.addColorStop(0.45, '#cfe9f7'); gg.addColorStop(1, '#7fb3d0');
  c.fillStyle = gg; c.beginPath(); c.ellipse(0, 0, 12.5, 4.4, 0, 0, Math.PI*2); c.fill();
  c.save(); c.beginPath(); c.ellipse(0, 0, 12.5, 4.4, 0, 0, Math.PI*2); c.clip();
  c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(-8, -6, 3, 12); c.fillRect(-3.5, -6, 1.5, 12);
  c.restore();
  c.fillStyle = '#6b4a1e'; for(const ax of [-18, 18]){ c.beginPath(); c.arc(ax, 0, 2.6, 0, Math.PI*2); c.fill(); }
  c.restore();
  const fk = 0.5 + 0.5*Math.sin(t*2.4 + x*0.05);
  if(fk > 0.6){
    const fx = cx + (stellung === '/' ? 5 : -5), fy = cy - 5, r = 4.5*(fk - 0.6)/0.4 + 1.5;
    c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath();
    c.moveTo(fx, fy - r); c.lineTo(fx + r*0.25, fy - r*0.25); c.lineTo(fx + r, fy); c.lineTo(fx + r*0.25, fy + r*0.25);
    c.lineTo(fx, fy + r); c.lineTo(fx - r*0.25, fy + r*0.25); c.lineTo(fx - r, fy); c.lineTo(fx - r*0.25, fy - r*0.25); c.closePath(); c.fill();
  }
}
function kristallBild(c, x, y, leucht, halt){
  // Lichtkristall auf Steinsockel; leuchtet er, glüht er warm mit großem Schein. Halterung wie beim Spiegel
  // (Ständer bis zum Boden oder Kette zur Decke), damit er nicht in der Luft hängt
  const t = typeof performance !== 'undefined' ? performance.now()*0.001 : 0;
  if(halt && halt.art === 'staender'){
    const unten = y + 40 + halt.n*40;
    c.strokeStyle = '#4a3214'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 20, y + 40); c.lineTo(x + 20, unten - 6); c.stroke();
    c.strokeStyle = '#c9963a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x + 20, y + 40); c.lineTo(x + 20, unten - 6); c.stroke();
    c.fillStyle = '#6d5c46'; c.beginPath(); c.moveTo(x + 8, unten); c.lineTo(x + 12, unten - 7); c.lineTo(x + 28, unten - 7); c.lineTo(x + 32, unten); c.closePath(); c.fill();
  } else if(halt && halt.art === 'kette'){
    const oben = y - halt.n*40;
    c.strokeStyle = '#3a2c1c'; c.lineWidth = 1.6;
    for(let yy = y + 2; yy > oben; yy -= 7){ c.beginPath(); c.ellipse(x + 20, yy - 3, 2.4, 3.8, 0, 0, Math.PI*2); c.stroke(); }
    c.fillStyle = '#6b4a1e'; c.fillRect(x + 14, oben, 12, 4);
    c.strokeStyle = '#c9963a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 9, y + 15); c.lineTo(x + 20, y + 1); c.lineTo(x + 31, y + 15); c.stroke();
  }
  const st = c.createLinearGradient(0, y + 30, 0, y + 40); st.addColorStop(0, '#4a3f36'); st.addColorStop(1, '#231c17');
  c.fillStyle = st; c.beginPath(); c.moveTo(x + 7, y + 40); c.lineTo(x + 10, y + 31); c.lineTo(x + 30, y + 31); c.lineTo(x + 33, y + 40); c.closePath(); c.fill();
  c.strokeStyle = '#c9963a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 10, y + 33); c.lineTo(x + 30, y + 33); c.stroke();
  if(leucht > 0){
    const g = c.createRadialGradient(x + 20, y + 17, 2, x + 20, y + 17, 40);
    g.addColorStop(0, `rgba(255,245,190,${0.85*leucht})`); g.addColorStop(0.4, `rgba(255,200,80,${0.35*leucht})`); g.addColorStop(1, 'rgba(255,190,70,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x + 20, y + 17, 40, 0, Math.PI*2); c.fill();
  }
  const kg = c.createLinearGradient(x + 9, y + 2, x + 31, y + 33);
  if(leucht > 0.5){ kg.addColorStop(0, '#ffffff'); kg.addColorStop(0.5, '#ffe98a'); kg.addColorStop(1, '#ffae2e'); }
  else { kg.addColorStop(0, '#d8f4fb'); kg.addColorStop(0.5, '#7cc6dc'); kg.addColorStop(1, '#3a7f98'); }
  c.fillStyle = kg;
  c.beginPath(); c.moveTo(x + 20, y + 1); c.lineTo(x + 31, y + 15); c.lineTo(x + 26, y + 32); c.lineTo(x + 14, y + 32); c.lineTo(x + 9, y + 15); c.closePath(); c.fill();
  c.strokeStyle = leucht > 0.5 ? '#a8681a' : '#20495a'; c.lineWidth = 1.8; c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 20, y + 1); c.lineTo(x + 20, y + 32); c.moveTo(x + 9, y + 15); c.lineTo(x + 31, y + 15); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.moveTo(x + 20, y + 3); c.lineTo(x + 25, y + 14); c.lineTo(x + 20, y + 14); c.closePath(); c.fill();
  if(leucht <= 0.5){ c.globalAlpha = 0.5 + 0.5*Math.sin(t*2); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 15, y + 12, 1.4, 0, Math.PI*2); c.fill(); c.globalAlpha = 1; }
}
// Strahl mit echtem Glow: mehrere Schichten im Modus „lighter“ (Licht addiert sich), wandernde helle Wellen, Funken,
// Aufblitzen an Spiegeln, am Kristall und dort, wo der Strahl auf Stein trifft
function lichtStrahlPfad(weg){
  ctx.beginPath(); ctx.moveTo(weg[0][0]*40 + 20 - camX, weg[0][1]*40 + 20);
  for(let i = 1; i < weg.length; i++) ctx.lineTo(weg[i][0]*40 + 20 - camX, weg[i][1]*40 + 20);
}
function lichtFleck(x, y, r, a){
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,250,220,${a})`); g.addColorStop(0.35, `rgba(255,210,100,${a*0.5})`); g.addColorStop(1, 'rgba(255,180,60,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
}
function lichtZeichnen(){
  const t = performance.now()*0.001;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'lighter';
  const puls = 1 + 0.08*Math.sin(t*5);
  for(const weg of lichtWege){
    if(weg.length < 2) continue;
    for(const [breit, farbe] of [[38, 'rgba(255,170,50,.07)'], [24, 'rgba(255,190,70,.12)'], [13, 'rgba(255,215,110,.28)'], [6, 'rgba(255,240,180,.6)'], [2.4, 'rgba(255,255,245,1)']]){
      ctx.strokeStyle = farbe; ctx.lineWidth = breit*(breit > 10 ? puls : 1); lichtStrahlPfad(weg); ctx.stroke();
    }
    // wandernde helle Wellen entlang des Strahls (zeigen die Richtung)
    ctx.setLineDash([10, 46]); ctx.lineDashOffset = -t*90; ctx.strokeStyle = 'rgba(255,255,230,.55)'; ctx.lineWidth = 7;
    lichtStrahlPfad(weg); ctx.stroke(); ctx.setLineDash([]);
    // Funken
    for(let i = 0; i < weg.length - 1; i++){
      const ph = (t*0.8 + i*0.37) % 1, ax = weg[i][0], ay = weg[i][1], bx = weg[i + 1][0], by = weg[i + 1][1];
      const px = (ax + (bx - ax)*ph)*40 + 20 - camX, py = (ay + (by - ay)*ph)*40 + 20, wob = Math.sin(t*7 + i)*4;
      ctx.globalAlpha = Math.sin(ph*Math.PI)*0.9; ctx.fillStyle = '#fff6c8';
      ctx.beginPath(); ctx.arc(px + (ay === by ? 0 : wob), py + (ax === bx ? 0 : wob), 2, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
    }
    // Aufblitzen an den Knickstellen (Spiegel) und am Ende (Stein oder Kristall)
    for(let i = 1; i < weg.length; i++){
      const x = weg[i][0]*40 + 20 - camX, y = weg[i][1]*40 + 20;
      if(i === weg.length - 1) lichtFleck(x, y, 30*puls, 0.75);
      else lichtFleck(x, y, 24*puls, 0.55);
    }
  }
  ctx.restore();
  for(const q of lichtquellen){ const x = q.x - camX; if(x > -60 && x < VW + 60) lichtQuelleBild(ctx, x, q.y, q.dx, q.dy, true); }
  for(const s of spiegelListe){
    const x = s.x - camX; if(x < -60 || x > VW + 60) continue;
    if(!s.halt) s.halt = spiegelHalt(s);   // nur Anzeige (Gelände ändert sich dafür nicht)
    const dreh = s.drehT > 0 ? (s.stellung === '/' ? 1 : -1)*(s.drehT/12)*Math.PI/2 : 0;
    spiegelBild(ctx, x, s.y, s.stellung, dreh, s.halt);
  }
  for(const k of kristalle){
    const x = k.x - camX; if(x < -60 || x > VW + 60) continue;
    if(!k.halt) k.halt = spiegelHalt(k, true);   // nur Anzeige
    kristallBild(ctx, x, k.y, k.leuchtT || 0, k.halt);
  }
}
// Lichter in dunklen Leveln (10a drawThemeDarkness): Sonnensteine und Strahl leuchten die Dunkelheit aus
function lichtLichter(L){
  for(const q of lichtquellen) L.push([q.x + 20, q.y + 20, 90]);
  for(const weg of lichtWege) for(let i = 0; i < weg.length - 1; i++){
    const [ax, ay] = weg[i], [bx, by] = weg[i + 1], n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay)/2));
    for(let k = 0; k <= n; k++) L.push([(ax + (bx - ax)*k/n)*40 + 20, (ay + (by - ay)*k/n)*40 + 20, 70]);
  }
  for(const k of kristalle) if(k.an) L.push([k.x + 20, k.y + 18, 110]);
}
ELEMENT_SOLID_TYPEN.add('lichtquelle');
// (Editor) Strahl-Vorschau über dem Raster: blockiert von festen Kästchen (nicht Steg/Schein/Aufwind), Spiegel/Kristalle
function lichtEditorVorschau(ctx, liste, TILE){
  const fest = (c, r) => { const t = typeof tiles !== 'undefined' ? tiles[c + ',' + r] : null; return !!t && !['oneway', 'fake', 'wind'].includes(t); };
  const pk = typeof elementPunkte !== 'undefined' ? elementPunkte : {};
  const sp = new Map((pk.spiegel || []).map(s => [s.c + ',' + s.r, {stellung: s.stellung || '/'}]));
  const kr = new Map((pk.kristalle || []).map(k => [k.c + ',' + k.r, k]));
  const falle = new Set((pk.traps || []).map(f => f.c + ',' + f.r)), quellen = new Set(liste.map(q => q.c + ',' + q.r));
  ctx.save(); ctx.strokeStyle = 'rgba(255,215,60,.85)'; ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
  for(const q of liste){
    const [dx, dy] = LICHT_RICHTUNG[q.richtung] || [1, 0];
    const v = lichtVerfolgen(q.c, q.r, dx, dy, (c, r) => fest(c, r) || falle.has(c + ',' + r) || quellen.has(c + ',' + r), (c, r) => sp.get(c + ',' + r), (c, r) => kr.get(c + ',' + r));
    ctx.beginPath(); ctx.moveTo(v.weg[0][0]*TILE + TILE/2, v.weg[0][1]*TILE + TILE/2);
    for(const [c, r] of v.weg.slice(1)) ctx.lineTo(c*TILE + TILE/2, r*TILE + TILE/2);
    ctx.stroke();
  }
  ctx.restore();
}
elementRegistrieren({
  id: 'lichtquelle', name: 'Lichtquelle', feld: 'lichtquellen',
  editor: {
    werkzeug: 'lichtquelle', gruppe: 'licht', vor: '#linkSelect', art: 'punkt', ziehbar: false, farbe: '#ffd24a',
    titel: 'Lichtquelle (Sonnen-Stein, fest): schickt einen Lichtstrahl in die gewählte Richtung. Spiegel lenken ihn um, ' +
           'ein Lichtkristall schaltet seine Nummer an, solange Licht darauf fällt. Gelbe Linie = Strahl. Klick = Richtung drehen',
    optionen: [{key: 'richtung', label: 'Richtung', werte: [['r', '→ rechts'], ['l', '← links'], ['o', '↑ hoch'], ['u', '↓ runter']]}],
    klick(p){ const o = ['r', 'u', 'l', 'o']; p.richtung = o[(o.indexOf(p.richtung || 'r') + 1) % 4]; },
    zeichnen(ctx, c, r, TILE, p){ const [dx, dy] = LICHT_RICHTUNG[p.richtung] || [1, 0]; ctx.save(); ctx.translate(c*TILE, r*TILE); ctx.scale(TILE/40, TILE/40); lichtQuelleBild(ctx, 0, 0, dx, dy, true); ctx.restore(); },
    zeichnenAlle: lichtEditorVorschau,
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, richtung: p.richtung || 'r'})),
  },
  spiel: {
    laden(daten){
      lichtquellen = (daten.lichtquellen || []).map(q => {
        const [dx, dy] = LICHT_RICHTUNG[q.richtung] || [1, 0];
        solids.push({x: q.x, y: q.y, w: 40, h: 40, type: 'lichtquelle'});
        return {x: q.x, y: q.y, c: Math.round(q.x/40), r: Math.round(q.y/40), dx, dy};
      });
      lichtWege = [];
    },
    schritt: lichtSchritt,
    zuruecksetzen: lichtZuruecksetzen,
    zeichnen(){
      if(lichtquellen.length || spiegelListe.length || kristalle.length) lichtZeichnen();
      // Tasten-Blase über dem Spiegel, den die Hebel-Taste gerade drehen würde (Hebel haben Vorrang)
      for(const s of spiegelListe){
        const nah = P => !!P && !hebelInReichweite(P) && spiegelInReichweite(P) === s;
        if(nah(p1) || nah(p2)) aktionsHinweis(Math.round(s.x + 20 - camX), s.y - 34, nah(p1), nah(p2));
      }
    },
  },
});
elementRegistrieren({
  id: 'spiegel', name: 'Spiegel', feld: 'spiegel',
  editor: {
    werkzeug: 'spiegel', gruppe: 'licht', vor: '#linkSelect', art: 'punkt', ziehbar: false, farbe: '#bfe0f0',
    titel: 'Spiegel: lenkt den Lichtstrahl um 90° ( / oder \\ ). Im Spiel drehen ihn beide Figuren mit der Hebel-Taste. ' +
           'Klick auf einen vorhandenen Spiegel = Stellung wechseln',
    optionen: [{key: 'stellung', label: 'Stellung', werte: [['/', '/'], ['\\', '\\']]}],
    klick(p){ p.stellung = p.stellung === '/' ? '\\' : '/'; },
    zeichnen(ctx, c, r, TILE, p){ ctx.save(); ctx.translate(c*TILE, r*TILE); ctx.scale(TILE/40, TILE/40); spiegelBild(ctx, 0, 0, p.stellung || '/', 0); ctx.restore(); },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, stellung: p.stellung === '\\' ? '\\' : '/'})),
  },
  spiel: {
    laden(daten){
      spiegelListe = (daten.spiegel || []).map(s => ({x: s.x, y: s.y, c: Math.round(s.x/40), r: Math.round(s.y/40),
        stellung: s.stellung === '\\' ? '\\' : '/', start: s.stellung === '\\' ? '\\' : '/', drehT: 0}));
    },
  },
});
elementRegistrieren({
  id: 'kristall', name: 'Lichtkristall', feld: 'kristalle',
  editor: {
    werkzeug: 'kristall', gruppe: 'licht', vor: '#linkSelect', art: 'punkt', ziehbar: false, farbe: '#8fd0e0',
    mitNummer: true, nummerName: 'Lichtkristall',
    titel: 'Lichtkristall: solange ein Lichtstrahl darauf fällt, ist seine Verknüpfung AN (wie eine gedrückte Druckplatte)',
    zeichnen(ctx, c, r, TILE, p){
      ctx.save(); ctx.translate(c*TILE, r*TILE); ctx.scale(TILE/40, TILE/40); kristallBild(ctx, 0, 0, 0); ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.strokeText(String(p.link), c*TILE + TILE - 8, r*TILE + 9); ctx.fillText(String(p.link), c*TILE + TILE - 8, r*TILE + 9);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, link: p.link})),
  },
  spiel: {
    laden(daten){ kristalle = (daten.kristalle || []).map(k => ({x: k.x, y: k.y, c: Math.round(k.x/40), r: Math.round(k.y/40), link: k.link, an: false, leuchtT: 0})); },
  },
});
