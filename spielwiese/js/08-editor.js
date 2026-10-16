// 08-editor.js – Spielwiese: Mini-Editor. Taste B schaltet Bauen an/aus; das Spiel läuft dabei weiter (gleich ausprobieren).
// Linke Maustaste (gedrückt ziehen) setzt das gewählte Kästchen, rechte Maustaste löscht. Ziffern 1–8 wählen das Werkzeug
// (solange gebaut wird, schalten die Ziffern keine Varianten). Speichern (localStorage „spielwiese-karte“) und
// Export/Import als JSON im Panel (Tab) unter „Karte“.

const WERKZEUGE = [
  {z: '#', name: 'Boden/Wand'}, {z: '=', name: 'Haftfläche'}, {z: 'x', name: 'Brechbar'}, {z: 'o', name: 'Anker'},
  {z: '^', name: 'Stacheln'}, {z: '/', name: 'Rampe ↗'}, {z: '\\', name: 'Rampe ↖'}, {z: '.', name: 'Radierer'},
  {z: 'k', name: 'Kristall'},
];
const bau = { an: false, werkzeug: 0, zelle: null, malt: 0 };

function bauenUmschalten(){
  bau.an = !bau.an;
  hinweis(bau.an ? 'Bauen: an (B = fertig)' : 'Bauen: aus');
  ton('klick');
}
function werkzeugWaehlen(i){
  if(i < 0 || i >= WERKZEUGE.length) return;
  bau.werkzeug = i; hinweis('Werkzeug: ' + WERKZEUGE[i].name); ton('klick');
}
function mausZelle(){
  const w = mausWelt();
  return {c: Math.floor(w.x / K), r: Math.floor(w.y / K)};
}
function kastenSetzen(c, r, z){
  if(c < 1 || c >= KARTE_B - 1 || r < 0 || r >= KARTE_H) return;   // äußerer Rand bleibt
  if(karte[r][c] === z) return;
  const warAnker = karte[r][c] === 'o';
  karte[r][c] = z;
  kaputt = kaputt.filter(k => k.c !== c || k.r !== r);
  if(warAnker || z === 'o') ankerSammeln();
}
function bauMalen(){
  if(!bau.an || !bau.malt) return;
  const {c, r} = mausZelle();
  kastenSetzen(c, r, bau.malt === 2 ? '.' : WERKZEUGE[bau.werkzeug].z);
}
leinwand.addEventListener('pointerdown', e => {
  if(!bau.an) return;
  bau.malt = e.button === 2 ? 2 : (e.button === 0 ? 1 : 0);
  bauMalen();
});
leinwand.addEventListener('pointermove', e => { if(bau.an && bau.malt) bauMalen(); });
window.addEventListener('pointerup', () => { bau.malt = 0; });
leinwand.addEventListener('wheel', e => {
  if(!bau.an) return;
  e.preventDefault();
  werkzeugWaehlen((bau.werkzeug + (e.deltaY > 0 ? 1 : -1) + WERKZEUGE.length) % WERKZEUGE.length);
}, {passive: false});

// ---------- Speichern / Laden / Export / Import ----------
function karteObjekt(){
  return {spielwiese_karte: 1, breite: KARTE_B, hoehe: KARTE_H, zeilen: karte.map(z => z.join(''))};
}
function karteAnwenden(o){
  if(!o || !Array.isArray(o.zeilen) || o.zeilen.length !== KARTE_H) return false;
  const breite = o.zeilen[0].length;
  if(breite < 40 || breite > 2000 || o.zeilen.some(z => typeof z !== 'string' || z.length !== breite)) return false;
  const erlaubt = new Set(['.', '#', '=', 'x', 'o', '^', '/', '\\', 'k']);
  KARTE_B = breite;
  karte = o.zeilen.map(z => Array.from(z, ch => erlaubt.has(ch) ? ch : '.'));
  kaputt = []; ankerSammeln(); zurueckSetzen();
  return true;
}
function karteOriginal(){ KARTE_B = 480; arenaBauen(); kaputt = []; ankerSammeln(); zurueckSetzen(); }

function karteBereichBauen(p){
  p.appendChild(el('h3', {text: 'Karte (Mini-Editor)'}));
  p.appendChild(el('div', {class: 'hilfe', text: 'B = Bauen an/aus · linke Maus setzt, rechte löscht · Ziffern 1–9 oder Mausrad wählen: ' +
    WERKZEUGE.map((w, i) => (i + 1) + ' ' + w.name).join(', ')}));
  p.appendChild(el('div', {class: 'knopfreihe'},
    el('button', {text: 'Bauen an/aus (B)', onclick: () => { bauenUmschalten(); }}),
    el('button', {text: 'Karte speichern', onclick: () => { speicherSchreiben('karte', karteObjekt()); meldung('Karte gespeichert'); }}),
    el('button', {text: 'Gespeicherte laden', onclick: () => {
      const o = speicherLesen('karte', null);
      meldung(o && karteAnwenden(o) ? 'Gespeicherte Karte geladen' : 'Keine gespeicherte Karte gefunden');
    }}),
    el('button', {text: 'Original-Arena', onclick: () => { karteOriginal(); meldung('Original-Arena wiederhergestellt'); }})));
  const feld = el('textarea', {placeholder: 'Karte als JSON: „Export“ füllt das Feld, „Import“ lädt eingefügten Text'});
  p.appendChild(feld);
  p.appendChild(el('div', {class: 'knopfreihe'},
    el('button', {text: 'Export', onclick: () => { feld.value = JSON.stringify(karteObjekt()); feld.select(); meldung('Karten-Export im Feld'); }}),
    el('button', {text: 'Kopieren', onclick: () => {
      if(!feld.value) feld.value = JSON.stringify(karteObjekt());
      (navigator.clipboard ? navigator.clipboard.writeText(feld.value) : Promise.reject()).then(() => meldung('Karte kopiert'), () => { feld.select(); meldung('Bitte mit Strg+C kopieren'); });
    }}),
    el('button', {text: 'Import', onclick: () => {
      try{ meldung(karteAnwenden(JSON.parse(feld.value)) ? 'Karte importiert' : 'Das ist keine Spielwiesen-Karte'); }
      catch(err){ meldung('Das ist kein gültiger JSON-Text'); }
    }})));
}

// ---------- Zeichnen: Raster, Zelle unter der Maus, Werkzeugleiste ----------
function bauZeichnenWelt(kx){
  if(!bau.an) return;
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1;
  const c0 = Math.floor(kx / K), c1 = Math.ceil((kx + SICHT_B) / K);
  ctx.beginPath();
  for(let c = c0; c <= c1; c++){ ctx.moveTo(c * K, 0); ctx.lineTo(c * K, KARTE_H * K); }
  for(let r = 0; r <= KARTE_H; r++){ ctx.moveTo(c0 * K, r * K); ctx.lineTo(c1 * K, r * K); }
  ctx.stroke();
  if(ein.maus.da){
    const {c, r} = mausZelle();
    ctx.strokeStyle = '#ffe27a'; ctx.lineWidth = 3; ctx.strokeRect(c * K + 1.5, r * K + 1.5, K - 3, K - 3);
  }
}
function bauZeichnenAnzeige(){
  if(!bau.an) return;
  const breite = 118, x0 = BILD_B / 2 - WERKZEUGE.length * breite / 2, y = BILD_H - 46;
  ctx.fillStyle = 'rgba(15,20,30,0.75)'; ctx.fillRect(x0 - 8, y - 8, WERKZEUGE.length * breite + 16, 44);
  WERKZEUGE.forEach((w, i) => {
    const x = x0 + i * breite;
    if(i === bau.werkzeug){ ctx.fillStyle = 'rgba(255,226,122,0.3)'; ctx.fillRect(x, y - 4, breite - 6, 36); }
    ctx.font = 'bold 14px system-ui, sans-serif'; ctx.fillStyle = '#ffe27a'; ctx.textBaseline = 'top';
    ctx.fillText(String(i + 1), x + 6, y + 6);
    ctx.font = '14px system-ui, sans-serif'; ctx.fillStyle = '#eef2f7'; ctx.fillText(w.name, x + 22, y + 6);
  });
  textMitRand('BAUEN – B = fertig · Tab: speichern/exportieren', BILD_B / 2, y - 34, 16, '#ffe27a', 'center');
}
