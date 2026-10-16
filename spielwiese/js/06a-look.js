// 06a-look.js – Spielwiese: Aussehen wie im Spiel (Dschungel am Morgen), nachgebaut – es wird KEIN Code aus ../js/ benutzt.
// Himmel mit Sonne, ferne Hügel und Bäume (Parallaxe), Boden als Erdblock mit welligem Gras, Erdschichten und einer
// dunklen Kontur an freien Seiten, Stacheln und Haken-Punkte wie im Spiel. Schalter „Spiel-Look“ im Panel (Aussehen).

const LOOK = {
  himmel: [[0, '#8fcbe0'], [0.35, '#d6ecdf'], [0.58, '#ffe9bf'], [0.7, '#f8e2b0'], [1, '#d5e8cc']],
  grasOben: '#5fe093', gras: '#34c46c', grasDunkel: '#23a257', erde: '#d78e4e', schicht: 'rgba(150,85,35,.28)',
  kante: 'rgba(30,24,10,0.8)', kanteBreite: 3, innenSchatten: 'rgba(30,24,10,0.18)',
};
const ECKE_R = 9, GRAS_H = 12, SCHICHT_ABSTAND = 22;
function zufall(s){ const v = Math.sin(s * 12.9898) * 43758.5453; return v - Math.floor(v); }

// ---------- Hintergrund: einmal vorgezeichnete Ebenen (nur zwei, klein gehalten), dann verschoben ----------
let lookEbenen = null;
const EBENE_B = 2560;
function lookEbenenBauen(){
  const himmel = document.createElement('canvas'); himmel.width = BILD_B; himmel.height = BILD_H;
  let g = himmel.getContext('2d');
  const v = g.createLinearGradient(0, 0, 0, BILD_H); for(const [p, f] of LOOK.himmel) v.addColorStop(p, f);
  g.fillStyle = v; g.fillRect(0, 0, BILD_B, BILD_H);
  const sonne = g.createRadialGradient(930, 290, 0, 930, 290, 470);
  sonne.addColorStop(0, 'rgba(255,252,230,0.9)'); sonne.addColorStop(0.15, 'rgba(255,232,170,0.5)'); sonne.addColorStop(1, 'rgba(255,232,170,0)');
  g.fillStyle = sonne; g.fillRect(0, 0, BILD_B, BILD_H);
  g.fillStyle = 'rgba(255,255,255,0.42)';   // Wolken
  for(const [x, y, s] of [[160, 110, 1], [520, 70, 0.8], [1080, 130, 1.1], [1240, 60, 0.7]]){
    for(const [dx, dy, r] of [[0, 0, 34], [36, 8, 28], [-34, 10, 24], [70, 14, 20]]){ g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); g.fill(); }
  }
  // ferne Karst-Hügel
  const fern = document.createElement('canvas'); fern.width = EBENE_B; fern.height = BILD_H;
  g = fern.getContext('2d');
  const fv = g.createLinearGradient(0, 300, 0, BILD_H); fv.addColorStop(0, '#87aca6'); fv.addColorStop(1, '#b5d0c4');
  g.fillStyle = fv; g.beginPath(); g.moveTo(0, BILD_H);
  for(let x = 0; x <= EBENE_B; x += 16){
    const t = x / EBENE_B * Math.PI * 2;
    g.lineTo(x, 430 - Math.abs(Math.sin(t * 3)) * 120 - Math.sin(t * 7 + 1) * 30 - Math.sin(t * 13) * 12);
  }
  g.lineTo(EBENE_B, BILD_H); g.fill();
  g.fillStyle = 'rgba(214,234,220,0.45)'; g.fillRect(0, 470, EBENE_B, BILD_H - 470);   // Dunst
  // Bäume (mittlere Ebene)
  const mitte = document.createElement('canvas'); mitte.width = EBENE_B; mitte.height = BILD_H;
  g = mitte.getContext('2d');
  const kronen = ['#4f8467', '#66997a', '#86b98d', '#acd59f'];
  for(let i = 0; i < 26; i++){
    const x = (i + zufall(i) * 0.6) * EBENE_B / 26, h = 200 + zufall(i + 40) * 140, y = BILD_H - 60;
    g.fillStyle = '#6a8a74'; g.fillRect(x - 7, y - h, 14, h);
    g.fillStyle = 'rgba(255,245,210,0.18)'; g.fillRect(x - 7, y - h, 4, h);
    for(let k = 0; k < 4; k++){
      g.fillStyle = kronen[k]; const r = 58 - k * 11;
      for(const [dx, dy] of [[-30, 8], [28, 4], [0, -22], [-12, -6], [14, -10]]){ g.beginPath(); g.arc(x + dx * (1 - k * 0.15), y - h + dy - k * 6, r * 0.62, 0, Math.PI * 2); g.fill(); }
    }
  }
  g.fillStyle = 'rgba(212,233,214,0.35)'; g.fillRect(0, 0, EBENE_B, BILD_H);   // Dunst davor
  lookEbenen = {himmel, ebenen: [{c: fern, par: 0.06}, {c: mitte, par: 0.18}]};
}
function lookHintergrund(kx){
  if(!lookEbenen) lookEbenenBauen();
  ctx.drawImage(lookEbenen.himmel, 0, 0);
  for(const L of lookEbenen.ebenen){
    const off = Math.round(((kx * L.par) % EBENE_B + EBENE_B) % EBENE_B);
    ctx.drawImage(L.c, -off, 0);
    if(EBENE_B - off < BILD_B) ctx.drawImage(L.c, EBENE_B - off, 0);
  }
}

// ---------- Boden: Erdblock mit Gras, Schichten, Kontur ----------
// Schnell: jede Sorte Kästchen (welche Seiten frei sind, Lage im 4er-Wellenmuster, Lage der Erdschicht) wird EINMAL
// vorgezeichnet und danach nur kopiert. Die Wellen wiederholen sich alle 4 Kästchen (160 px) -> nahtlos.
const WELLE = Math.PI * 2 / 160;
const welleY2 = wx => Math.sin(wx * WELLE * 2) * 2.4 + Math.sin(wx * WELLE * 5 + 1.3) * 1.2;
function rundPfad(g, x, y, w, h, r){
  g.beginPath();
  g.moveTo(x + r.tl, y);
  g.lineTo(x + w - r.tr, y); if(r.tr) g.arcTo(x + w, y, x + w, y + r.tr, r.tr);
  g.lineTo(x + w, y + h - r.br); if(r.br) g.arcTo(x + w, y + h, x + w - r.br, y + h, r.br);
  g.lineTo(x + r.bl, y + h); if(r.bl) g.arcTo(x, y + h, x, y + h - r.bl, r.bl);
  g.lineTo(x, y + r.tl); if(r.tl) g.arcTo(x, y, x + r.tl, y, r.tl);
  g.closePath();
}
const kachelCache = new Map();
const KACHEL_SCHARF = 2;   // vorgezeichnet in doppelter Auflösung
function bodenKachel(fo, fu, fl, fr, wx, wy){
  const key = (fo ? 1 : 0) + (fu ? 2 : 0) + (fl ? 4 : 0) + (fr ? 8 : 0) + '|' + wx + '|' + wy;
  let c = kachelCache.get(key); if(c) return c;
  c = document.createElement('canvas'); c.width = c.height = K * KACHEL_SCHARF;
  const g = c.getContext('2d'); g.scale(KACHEL_SCHARF, KACHEL_SCHARF);
  const ecke = {tl: fo && fl ? ECKE_R : 0, tr: fo && fr ? ECKE_R : 0, bl: fu && fl ? ECKE_R : 0, br: fu && fr ? ECKE_R : 0};
  rundPfad(g, 0, 0, K, K, ecke); g.fillStyle = LOOK.erde; g.fill();
  g.save(); g.clip();
  g.strokeStyle = LOOK.schicht; g.lineWidth = 3;
  for(let k = Math.floor((wy - 11) / SCHICHT_ABSTAND) - 1; k * SCHICHT_ABSTAND + 11 < wy + K + 3; k++){
    const y = k * SCHICHT_ABSTAND + 11 - wy; if(y < -3 || (fo && y < GRAS_H + 4)) continue;
    g.beginPath();
    for(let px = -2; px <= K + 2; px += 4){ const yy = y + Math.sin((wx + px) * WELLE * 6 + k * 1.7) * 2.2; if(px === -2) g.moveTo(px, yy); else g.lineTo(px, yy); }
    g.stroke();
  }
  if(fo){ const s = g.createLinearGradient(0, GRAS_H, 0, GRAS_H + 14); s.addColorStop(0, LOOK.innenSchatten); s.addColorStop(1, 'rgba(30,24,10,0)'); g.fillStyle = s; g.fillRect(0, GRAS_H, K, 14); }
  if(fu){ const s = g.createLinearGradient(0, K - 26, 0, K); s.addColorStop(0, 'rgba(30,24,10,0)'); s.addColorStop(1, LOOK.innenSchatten); g.fillStyle = s; g.fillRect(0, K - 26, K, 26); }
  g.restore();
  if(fo){   // Gras mit welliger Unterkante
    g.beginPath(); g.moveTo(0, ecke.tl);
    if(ecke.tl) g.arcTo(0, 0, ecke.tl, 0, ecke.tl); else g.lineTo(0, 0);
    g.lineTo(K - ecke.tr, 0);
    if(ecke.tr) g.arcTo(K, 0, K, ecke.tr, ecke.tr); else g.lineTo(K, 0);
    for(let px = K; px >= 0; px -= 4) g.lineTo(px, GRAS_H + welleY2(wx + px));
    g.closePath(); g.fillStyle = LOOK.gras; g.fill();
    g.strokeStyle = LOOK.grasDunkel; g.lineWidth = 2.5; g.beginPath();
    const a0 = ecke.tl ? 3 : 0, a1 = K - (ecke.tr ? 3 : 0);
    for(let px = a0; px <= a1; px += 4){ const yy = GRAS_H + welleY2(wx + px) + 1; if(px === a0) g.moveTo(px, yy); else g.lineTo(px, yy); }
    g.stroke();
    g.fillStyle = LOOK.grasOben; g.fillRect(Math.max(ecke.tl, 0), 2, K - Math.max(ecke.tl, 0) - Math.max(ecke.tr, 0), 3);
  }
  if(fo || fu || fl || fr){   // Kontur nur an freien Seiten
    const i = LOOK.kanteBreite / 2, kb = LOOK.kanteBreite;
    g.save(); g.beginPath();
    if(fl) g.rect(0, 0, kb + 1, K); if(fr) g.rect(K - kb - 1, 0, kb + 1, K);
    if(fo) g.rect(0, 0, K, kb + 1); if(fu) g.rect(0, K - kb - 1, K, kb + 1);
    g.clip();
    const k = v => Math.max(0, v - i);
    const x0 = fl ? i : -kb - 2, y0 = fo ? i : -kb - 2, x1 = fr ? K - i : K + kb + 2, y1 = fu ? K - i : K + kb + 2;
    rundPfad(g, x0, y0, x1 - x0, y1 - y0, {tl: k(ecke.tl), tr: k(ecke.tr), bl: k(ecke.bl), br: k(ecke.br)});
    g.strokeStyle = LOOK.kante; g.lineWidth = kb; g.lineJoin = 'round'; g.stroke();
    g.restore();
  }
  kachelCache.set(key, c);
  return c;
}
function lookBoden(c, r){
  const frei = (a, b) => !fest(a, b) && !istRampe(zelle(a, b));   // Rampen zählen als Nachbar (keine Kontur im Hang)
  const fo = frei(c, r - 1), fu = frei(c, r + 1), fl = frei(c - 1, r), fr = frei(c + 1, r);
  const bild = bodenKachel(fo, fu, fl, fr, ((c % 4) + 4) % 4 * K, (r * K) % (SCHICHT_ABSTAND * 20));
  ctx.drawImage(bild, c * K, r * K, K + (fr ? 0 : 0.5), K + (fu ? 0 : 0.5));   // ein Hauch Überlappung: keine Fugen beim Zoom
}
function lookRampe(c, r, z){
  const x = c * K, y = r * K, hoch = z === RAMPE_HOCH_RECHTS;
  ctx.beginPath();
  if(hoch){ ctx.moveTo(x, y + K); ctx.lineTo(x + K, y); ctx.lineTo(x + K, y + K + 0.6); }
  else { ctx.moveTo(x, y); ctx.lineTo(x + K, y + K); ctx.lineTo(x, y + K + 0.6); }
  ctx.closePath(); ctx.fillStyle = LOOK.erde; ctx.fill();
  const [ax, ay, bx, by] = hoch ? [x, y + K, x + K, y] : [x, y, x + K, y + K];
  ctx.lineCap = 'round';
  ctx.strokeStyle = LOOK.gras; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(ax, ay + 5); ctx.lineTo(bx, by + 5); ctx.stroke();
  ctx.strokeStyle = LOOK.grasOben; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax, ay + 2); ctx.lineTo(bx, by + 2); ctx.stroke();
  ctx.strokeStyle = LOOK.kante; ctx.lineWidth = LOOK.kanteBreite; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
  ctx.lineCap = 'butt';
}

// ---------- Stacheln wie im Spiel (eigene Nachzeichnung) ----------
let stachelBild = null;
function stachelBildBauen(){
  const S = 2, c = document.createElement('canvas'); c.width = 40 * S; c.height = 40 * S;
  const g = c.getContext('2d'); g.scale(S, S);
  g.fillStyle = 'rgba(30,20,10,.25)'; g.beginPath(); g.ellipse(20, 38.5, 19, 2.5, 0, 0, Math.PI * 2); g.fill();
  for(let i = 0; i < 4; i++){
    const cx = 10 * (i + 0.5), tip = 5 + (i % 2) * 2, base = 34, hw = 4.8;
    let L = g.createLinearGradient(cx - hw, 0, cx, 0); L.addColorStop(0, '#e9eef3'); L.addColorStop(1, '#8e98a4');
    g.fillStyle = L; g.beginPath(); g.moveTo(cx, tip); g.lineTo(cx - hw, base); g.lineTo(cx, base); g.closePath(); g.fill();
    L = g.createLinearGradient(cx, 0, cx + hw, 0); L.addColorStop(0, '#5f6874'); L.addColorStop(1, '#2c3139');
    g.fillStyle = L; g.beginPath(); g.moveTo(cx, tip); g.lineTo(cx, base); g.lineTo(cx + hw, base); g.closePath(); g.fill();
    g.strokeStyle = '#121418'; g.lineWidth = 1.5; g.lineJoin = 'round'; g.beginPath(); g.moveTo(cx - hw, base); g.lineTo(cx, tip); g.lineTo(cx + hw, base); g.stroke();
    g.fillStyle = 'rgba(190,30,25,.75)'; g.beginPath(); g.moveTo(cx, tip); g.lineTo(cx - 2.2, tip + 5); g.lineTo(cx + 2.2, tip + 5); g.closePath(); g.fill();
  }
  const B = g.createLinearGradient(0, 33, 0, 40); B.addColorStop(0, '#6b727c'); B.addColorStop(0.5, '#4a5059'); B.addColorStop(1, '#2c3036');
  g.fillStyle = B; g.fillRect(0.5, 33, 39, 6.5); g.fillStyle = '#b8c0c9';
  for(const rx of [5, 15, 25, 35]){ g.beginPath(); g.arc(rx, 36.4, 1.2, 0, Math.PI * 2); g.fill(); }
  return c;
}
function lookStacheln(c, r){
  if(!stachelBild) stachelBild = stachelBildBauen();
  ctx.drawImage(stachelBild, c * K, r * K, K, K);
}
// ---------- Haken-Punkt wie im Spiel: leuchtender Kreis, weißer Ring, pinker Kern ----------
function lookAnker(a){
  const p = 3 + Math.sin(performance.now() * 0.005 + a.x * 0.05) * 2;
  ctx.fillStyle = 'rgba(0,229,255,.55)'; ctx.beginPath(); ctx.arc(a.x, a.y, 20 + p, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(a.x, a.y, 9, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(a.x, a.y, 12, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#ff2e88'; ctx.beginPath(); ctx.arc(a.x, a.y, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(a.x, a.y, 12, Math.PI * 1.05, Math.PI * 1.6); ctx.stroke();
}
// ---------- weicher Schatten unter der Figur (wie im Spiel: kleiner und blasser, je höher) ----------
function lookSchatten(x, y){
  const fx = x + FIG_B / 2, fuss = y + FIG_H, c = Math.floor(fx / K);
  for(let r = Math.floor(fuss / K); r < KARTE_H && r * K < fuss + 220; r++){
    if(!fest(c, r)) continue;
    const gy = r * K, k = Math.max(0, 1 - (gy - fuss) / 220); if(k <= 0) return;
    const rw = FIG_B * (0.45 + 0.35 * k), a = 0.42 * k;
    const g = ctx.createRadialGradient(fx, gy, 0, fx, gy, rw);
    g.addColorStop(0, `rgba(10,18,8,${a})`); g.addColorStop(0.55, `rgba(10,18,8,${a * 0.55})`); g.addColorStop(1, 'rgba(10,18,8,0)');
    ctx.save(); ctx.translate(fx, gy); ctx.scale(1, 0.24); ctx.translate(-fx, -gy);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, gy, rw, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    return;
  }
}
