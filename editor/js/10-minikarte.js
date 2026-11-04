// editor/js/10-minikarte.js – Teil des Level-Editors für "Monchichi Koop".
// Alle editor/js/*.js teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags, kein Build)
// und werden in editor/index.html in fester Reihenfolge geladen.
// Minikarte (Navigation in langen Leveln, z. B. Dschungel-Abschnitte mit ~2500 Spalten): schmaler Streifen unter der
// Kopfzeile, zeigt das GANZE Level verkleinert (Boden/Wände als Silhouette, Stacheln rot, wichtige Dinge als Punkte,
// Spalten-Zahlen alle 100). Der gelbe Rahmen = sichtbarer Ausschnitt; Klick/Ziehen scrollt die Ansicht dorthin (Stelle mittig).
// Effizienz: Das Level-Bild wird nur nach Änderungen (save/applySnapshot = Malen, Radieren, Rückgängig, Laden) neu
// vorgezeichnet; pro Bild wird nur das fertige Bild + Rahmen gemalt – und auch das nur, wenn sich etwas bewegt hat.
// Ein/Aus: Knopf „▭ Minikarte“ oben oder Taste M; gemerkt in localStorage 'monchichi.editorMinikarte' (Standard: an).
// Test-Hilfen: minikarteKlick(anteil 0…1), minikarteAn(), minikarteSchalten(an), minikarteZaehler (wie oft neu vorgezeichnet).

const MINIKARTE_SPEICHER = 'monchichi.editorMinikarte';
const MINIKARTE_HOEHE = 78;          // Höhe des Streifens in px (Lineal oben + Karte)
const MINIKARTE_LINEAL = 13;         // Höhe der Zahlen-Zeile über der Karte
const MINIKARTE_RAND = 8;            // Abstand links/rechts
const MINIKARTE_MAL_PAUSE = 200;     // ms: beim gedrückten Malen höchstens so oft neu vorzeichnen
const MINIKARTE_FARBEN = {
  stachel: '#ff5a5a', checkpoint: '#ff7a59', startM: '#4d94ff', startF: '#ff6fb0', ziel: '#5fe39a',
  haken: '#ffd166', hebel: '#ffa94d', tuer: '#c3a6ff', platte: '#ffa94d', rahmen: '#ffd23f',
};

let minikarteSichtbar = true;
try{ if(localStorage.getItem(MINIKARTE_SPEICHER) === 'aus') minikarteSichtbar = false; }catch(e){}
let minikarteVersion = 1, minikarteGezeichnet = 0, minikarteZaehler = 0, minikarteLetztesMal = 0;
let minikarteBildSchluessel = '';    // was zuletzt auf die sichtbare Leinwand kam (Scroll, Größe, Version)

// ---------- Aufbau: Streifen zwischen Kopfzeile und Arbeitsfläche, Knopf in der Kopfzeile ----------
const minikarteBox = document.createElement('div');
minikarteBox.id = 'minikarte';
minikarteBox.title = 'Minikarte: ganzes Level im Überblick – klicken oder ziehen springt an die Stelle (Taste M = ein/aus)';
minikarteBox.style.cssText = `position:relative; flex:0 0 ${MINIKARTE_HOEHE}px; height:${MINIKARTE_HOEHE}px; background:#121a23;` +
  ` border-bottom:1px solid var(--border); padding:0 ${MINIKARTE_RAND}px; user-select:none;`;
const minikarteCvs = document.createElement('canvas');
minikarteCvs.id = 'minikarteCvs';
minikarteCvs.style.cssText = 'display:block; width:100%; height:100%; cursor:pointer; touch-action:none;';
minikarteBox.appendChild(minikarteCvs);
document.getElementById('app').insertBefore(minikarteBox, document.getElementById('main'));
const minikarteCtx = minikarteCvs.getContext('2d');
// vorgezeichnetes Bild: 1 Pixel je Kästchen (COLS × Reihen), wird beim Anzeigen gestreckt; dazu das fertige Bild in Anzeige-Größe
const minikarteRaster = document.createElement('canvas');
const minikarteFertig = document.createElement('canvas');

const minikarteKnopf = document.createElement('button');
minikarteKnopf.className = 'rtool';   // kleiner Knopf in der Reiter-Zeile (dort ist Platz; die Kopfzeile bricht sonst um)
minikarteKnopf.id = 'minikarteBtn';
minikarteKnopf.type = 'button';
minikarteKnopf.textContent = '▭ Minikarte';
minikarteKnopf.title = 'Minikarte ein-/ausblenden (Taste M)';
{ const vor = document.querySelector('#tabRow .alle'); vor.parentNode.insertBefore(minikarteKnopf, vor); }
minikarteKnopf.addEventListener('click', () => minikarteSchalten(!minikarteSichtbar));

function minikarteAn(){ return minikarteSichtbar; }
function minikarteSchalten(an){
  minikarteSichtbar = !!an;
  minikarteBox.style.display = minikarteSichtbar ? '' : 'none';
  minikarteKnopf.style.borderColor = minikarteSichtbar ? 'var(--accent)' : '';
  minikarteKnopf.style.color = minikarteSichtbar ? 'var(--accent)' : '';
  try{ localStorage.setItem(MINIKARTE_SPEICHER, minikarteSichtbar ? 'an' : 'aus'); }catch(e){}
  minikarteBildSchluessel = '';
  fitView();   // Arbeitsfläche wird höher/niedriger -> Raster neu einpassen
}

// ---------- Änderungen bemerken (Muster 09-werkzeugleiste.js: save/applySnapshot umhüllen) ----------
const _saveVorMinikarte = save;
save = function(){ const r = _saveVorMinikarte.apply(this, arguments); minikarteVersion++; return r; };
const _applyVorMinikarte = applySnapshot;
applySnapshot = function(){ const r = _applyVorMinikarte.apply(this, arguments); minikarteVersion++; return r; };

// ---------- Maße ----------
function minikarteMasse(){
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(10, minikarteCvs.clientWidth), h = Math.max(10, minikarteCvs.clientHeight);
  const kartenH = h - MINIKARTE_LINEAL - 3;
  return {dpr, w, h, x0: 0, y0: MINIKARTE_LINEAL, kw: w, kh: kartenH, sx: w / COLS, sy: kartenH / (ROWS + SKY)};
}

// ---------- Level-Bild vorzeichnen (nur bei Änderung) ----------
function minikarteVorzeichnen(){
  minikarteZaehler++;
  const M = minikarteMasse(), reihen = ROWS + SKY;
  // 1) Raster: 1 px je Kästchen
  if(minikarteRaster.width !== COLS) minikarteRaster.width = COLS;
  if(minikarteRaster.height !== reihen) minikarteRaster.height = reihen;
  const r = minikarteRaster.getContext('2d');
  r.clearRect(0, 0, COLS, reihen);
  for(const key in tiles){
    const i = key.indexOf(','), c = +key.slice(0, i), y = +key.slice(i + 1) + SKY;
    if(c < 0 || c >= COLS || y < 0 || y >= reihen) continue;
    r.fillStyle = COLORS[tiles[key]] || '#7a8890';
    r.fillRect(c, y, 1, 1);
  }
  r.fillStyle = MINIKARTE_FARBEN.stachel;
  for(const sp of spikes) r.fillRect(sp.c, sp.r + SKY, 1, 1);

  // 2) fertiges Bild in Anzeige-Größe: Hintergrund, Raster gestreckt, Spalten-Linien/Zahlen, Punkte
  const W = Math.round(M.w * M.dpr), H = Math.round(M.h * M.dpr);
  if(minikarteFertig.width !== W) minikarteFertig.width = W;
  if(minikarteFertig.height !== H) minikarteFertig.height = H;
  const g = minikarteFertig.getContext('2d');
  g.setTransform(M.dpr, 0, 0, M.dpr, 0, 0);
  g.clearRect(0, 0, M.w, M.h);
  g.fillStyle = THEME_BG[editorBgKey()] || THEME_BG.dschungel;
  g.fillRect(M.x0, M.y0, M.kw, M.kh);
  g.fillStyle = 'rgba(120,170,220,.10)';   // Himmel-Reihen (−1 … −3) etwas heller
  g.fillRect(M.x0, M.y0, M.kw, SKY * M.sy);
  // beim Verkleinern weich (dünne Stege bleiben sichtbar), beim Vergrößern (kurze Level) scharfe Kästchen
  g.imageSmoothingEnabled = M.sx < 1;
  if(g.imageSmoothingEnabled) g.imageSmoothingQuality = 'high';
  g.drawImage(minikarteRaster, 0, 0, COLS, reihen, M.x0, M.y0, M.kw, M.kh);
  g.imageSmoothingEnabled = true;

  // Spalten-Linien alle 100, Zahlen so dicht, wie Platz ist (100/200/500/1000)
  g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 1;
  if(100 * M.sx >= 4){
    g.beginPath();
    for(let c = 100; c < COLS; c += 100){ const x = Math.round(M.x0 + c * M.sx) + 0.5; g.moveTo(x, M.y0 - 3); g.lineTo(x, M.y0 + M.kh); }
    g.stroke();
  }
  const schritt = [100, 200, 500, 1000, 2000].find(s => s * M.sx >= 30) || 5000;
  g.fillStyle = '#9db2c4'; g.font = '10px sans-serif'; g.textBaseline = 'top'; g.textAlign = 'center';
  for(let c = schritt; c < COLS; c += schritt) g.fillText(String(c), M.x0 + c * M.sx, 1);
  g.textAlign = 'left'; g.fillText('0', M.x0 + 1, 1);

  // Punkte: Haken klein, Hebel/Türen/Platten, Checkpoints als Linie, Start/Ziel groß
  const px = c => M.x0 + (c + 0.5) * M.sx, py = rr => M.y0 + (rr + SKY + 0.5) * M.sy;
  const punkt = (p, farbe, rad) => {
    if(!p) return;
    g.fillStyle = farbe; g.beginPath(); g.arc(px(p.c), py(p.r), rad, 0, Math.PI * 2); g.fill();
  };
  for(const h of hooks) punkt(h, MINIKARTE_FARBEN.haken, 1.6);
  for(const p of elementPunkte.plates || []) punkt(p, MINIKARTE_FARBEN.platte, 1.6);
  for(const p of elementPunkte.doors || []){ g.fillStyle = MINIKARTE_FARBEN.tuer; g.fillRect(px(p.c) - 1, py(p.r) - 1.5, 2, 3); }
  for(const p of elementPunkte.switches || []){ g.fillStyle = MINIKARTE_FARBEN.hebel; g.fillRect(px(p.c) - 1.5, py(p.r) - 1.5, 3, 3); }
  for(const cp of checkpoints){
    const x = Math.round(px(cp.c)) + 0.5;
    g.strokeStyle = 'rgba(255,122,89,.75)'; g.beginPath(); g.moveTo(x, M.y0); g.lineTo(x, M.y0 + M.kh); g.stroke();
    punkt(cp, MINIKARTE_FARBEN.checkpoint, 2.4);
  }
  for(const [p, farbe] of [[startM, MINIKARTE_FARBEN.startM], [startF, MINIKARTE_FARBEN.startF], [goal, MINIKARTE_FARBEN.ziel]]){
    if(!p) continue;
    punkt(p, '#fff', 3.6); punkt(p, farbe, 2.6);
  }
  minikarteGezeichnet = minikarteVersion;
  minikarteLetztesMal = performance.now();
}

// ---------- pro Bild: nur fertiges Bild + Rahmen (und nur, wenn sich etwas geändert hat) ----------
function minikarteBild(){
  requestAnimationFrame(minikarteBild);
  if(!minikarteSichtbar) return;
  const M = minikarteMasse();
  const W = Math.round(M.w * M.dpr), H = Math.round(M.h * M.dpr);
  const groesse = W + 'x' + H + ':' + COLS + ':' + editorBgKey();
  // neu vorzeichnen: nach Änderungen (beim Malen höchstens alle MINIKARTE_MAL_PAUSE ms) oder neuer Größe/Länge/Welt
  const geaendert = minikarteGezeichnet !== minikarteVersion;
  const ziehen = painting || (typeof selDrag !== 'undefined' && selDrag) || (typeof verschiebDrag !== 'undefined' && verschiebDrag);
  if(minikarteFertig.dataset.groesse !== groesse || (geaendert && (!ziehen || performance.now() - minikarteLetztesMal > MINIKARTE_MAL_PAUSE))){
    minikarteVorzeichnen();
    minikarteFertig.dataset.groesse = groesse;
  }
  const links = wrap.scrollLeft / ansichtS, breite = wrap.clientWidth / ansichtS;   // sichtbarer Ausschnitt in Editor-px
  const schluessel = groesse + ':' + minikarteZaehler + ':' + Math.round(links) + ':' + Math.round(breite);
  if(schluessel === minikarteBildSchluessel) return;
  minikarteBildSchluessel = schluessel;
  if(minikarteCvs.width !== W) minikarteCvs.width = W;
  if(minikarteCvs.height !== H) minikarteCvs.height = H;
  const g = minikarteCtx;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, W, H);
  g.drawImage(minikarteFertig, 0, 0);
  g.setTransform(M.dpr, 0, 0, M.dpr, 0, 0);
  const s = M.sx / TILE;
  const rx = M.x0 + links * s, rw = Math.max(4, Math.min(M.kw, breite * s));
  g.fillStyle = 'rgba(255,255,255,.13)'; g.fillRect(rx, M.y0 - 2, rw, M.kh + 4);
  g.strokeStyle = MINIKARTE_FARBEN.rahmen; g.lineWidth = 1.5; g.strokeRect(rx + 0.75, M.y0 - 1.25, rw - 1.5, M.kh + 2.5);
}

// ---------- Bedienung: Klick/Ziehen = Ansicht dorthin (Stelle mittig) ----------
// anteil 0 … 1 der Karten-Breite; scrollt so, dass diese Spalte in der Mitte der Ansicht steht
function minikarteKlick(anteil){
  const a = Math.max(0, Math.min(1, Number(anteil) || 0));
  const levelPx = a * COLS * TILE;
  wrap.scrollLeft = Math.max(0, levelPx * ansichtS - wrap.clientWidth / 2);
  return Math.round(levelPx / TILE);   // Spalte, die jetzt mittig steht
}
let minikarteZiehen = false;
function minikarteAnteil(e){
  const b = minikarteCvs.getBoundingClientRect();
  return (e.clientX - b.left) / Math.max(1, b.width);
}
minikarteCvs.addEventListener('pointerdown', e => {
  if(e.button !== 0) return;
  e.preventDefault();
  minikarteZiehen = true;
  try{ minikarteCvs.setPointerCapture(e.pointerId); }catch(err){}
  minikarteKlick(minikarteAnteil(e));
});
minikarteCvs.addEventListener('pointermove', e => {
  if(minikarteZiehen) minikarteKlick(minikarteAnteil(e));
  else minikarteCvs.title = 'Spalte ' + Math.round(Math.max(0, Math.min(1, minikarteAnteil(e))) * COLS) + ' – klicken oder ziehen springt dorthin (Taste M = ein/aus)';
});
const minikarteLos = () => { minikarteZiehen = false; };
minikarteCvs.addEventListener('pointerup', minikarteLos);
minikarteCvs.addEventListener('pointercancel', minikarteLos);
// Mausrad über der Karte scrollt ebenfalls seitlich (größere Schritte als auf der Arbeitsfläche)
minikarteCvs.addEventListener('wheel', e => {
  e.preventDefault();
  wrap.scrollLeft += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * 4;
}, {passive: false});

// Taste M = Minikarte ein/aus (nicht beim Tippen in ein Feld, nicht mit Strg/Alt)
window.addEventListener('keydown', e => {
  if(e.ctrlKey || e.metaKey || e.altKey || e.repeat || e.key.toLowerCase() !== 'm') return;
  const el = document.activeElement, tag = el ? el.tagName : '';
  if(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el && el.isContentEditable)) return;
  e.preventDefault();
  minikarteSchalten(!minikarteSichtbar);
});

minikarteSchalten(minikarteSichtbar);   // gemerkten Zustand anwenden (Knopf-Farbe, Platz)
requestAnimationFrame(minikarteBild);
