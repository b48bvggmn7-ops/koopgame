// 01-eingabe.js – Spielwiese: die EINE Eingabe-Schicht. Tasten umlegen = nur die Tabellen TASTEN / PAD_KNOEPFE ändern.
// Die Physik fragt nur Aktionen ab (gehalten('springen'), ein.gedrueckt.dash, richtungLesen()), nie Tasten-Codes.

const TASTEN = {
  links: ['KeyA', 'ArrowLeft'], rechts: ['KeyD', 'ArrowRight'], hoch: ['KeyW', 'ArrowUp'], runter: ['KeyS', 'ArrowDown'],
  springen: ['Space'],
  dash: ['KeyJ'],          // Teil 2
  haken: ['KeyK', 'KeyG'], // Teil 3 (G wie im Spiel – praktisch, wenn das Schweinchen mitspielt)
  greifen: ['KeyL'],       // Teil 4
  neustart: ['KeyR'],      // zurück zum Rücksetzpunkt
  panel: ['Tab'],          // Einstellungen auf/zu
  bauen: ['KeyB'],         // Mini-Editor an/aus
  ziffer5: ['Digit5', 'Numpad5'], ziffer6: ['Digit6', 'Numpad6'], ziffer7: ['Digit7', 'Numpad7'], ziffer8: ['Digit8', 'Numpad8'], ziffer9: ['Digit9', 'Numpad9'],
  // Schweinchen (2. Spieler, nur wenn „Schweinchen spielt mit“ an ist – sonst gehören die Tasten wie bisher dem Affen)
  schweinLinks: ['ArrowLeft'], schweinRechts: ['ArrowRight'], schweinHoch: ['ArrowUp'], schweinRunter: ['ArrowDown'],
  schweinSprung: ['Numpad0'], schweinSchirm: ['Numpad1'],
  variante1: ['Digit1', 'Numpad1'], variante2: ['Digit2', 'Numpad2'], variante3: ['Digit3', 'Numpad3'], variante4: ['Digit4', 'Numpad4'],
};
// Controller (Standard-Belegung, PS4): 0 ✕, 1 ○, 2 □, 3 △, 4 L1, 5 R1, 6 L2, 7 R2, 8 Share, 9 Options, 12–15 Steuerkreuz
const PAD_KNOEPFE = {
  springen: [0], dash: [2], haken: [5], greifen: [4], neustart: [8], panel: [9], varianteWeiter: [7],
  hoch: [12], runter: [13], links: [14], rechts: [15],
};
const PAD_TOTZONE = 0.28;
// Tasten, die das Schweinchen übernimmt, solange es mitspielt
const SCHWEIN_CODES = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Numpad0', 'Numpad1']);
const schweinTasten = () => typeof V !== 'undefined' && !!V.schweinAn;

const ein = {
  gedrueckt: {},     // Aktionen, die seit dem letzten Physik-Schritt NEU gedrückt wurden (gilt genau einen Schritt)
  stick: {x: 0, y: 0}, stickR: {x: 0, y: 0}, padDa: false,
  pad2: {x: 0, sprung: false, schirm: false},   // zweiter Controller = Schweinchen
  maus: {x: 0, y: 0, da: false, taste: false, zeit: 0},   // Maus über dem Bild (in Bild-Pixeln 0…1280 / 0…720)
};
// Maus: Position fürs freie Zielen (Haken-Variante D), linke Taste = Haken
function mausPos(e){
  const r = leinwand.getBoundingClientRect();
  ein.maus.x = (e.clientX - r.left) / r.width * BILD_B; ein.maus.y = (e.clientY - r.top) / r.height * BILD_H;
  ein.maus.da = true; ein.maus.zeit = performance.now();
}
leinwand.addEventListener('pointermove', mausPos);
leinwand.addEventListener('pointerdown', e => { mausPos(e); if(e.button === 0 && !(typeof bau !== 'undefined' && bau.an)){ ein.maus.taste = true; aktionAusloesen('haken'); } });
window.addEventListener('pointerup', e => { if(e.button === 0) ein.maus.taste = false; });
leinwand.addEventListener('contextmenu', e => e.preventDefault());
const gehaltenCodes = new Set();
let flanken = {};              // gesammelt zwischen zwei Physik-Schritten
let padVorher = {};
const sofortAktionen = [];     // Bedien-Aktionen (Panel, Variante, Neustart) – werden sofort ausgeführt, nicht in der Physik

function aktionenZuCode(code){
  const as = Object.keys(TASTEN).filter(a => TASTEN[a].includes(code));
  if(!SCHWEIN_CODES.has(code)) return as;
  return as.filter(a => a.startsWith('schwein') === schweinTasten());
}
const tasteZaehlt = (a, c) => !SCHWEIN_CODES.has(c) || a.startsWith('schwein') === schweinTasten();
function inTextfeld(e){
  const t = e.target;
  return t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.type === 'text') || t.tagName === 'SELECT');
}
function aktionAusloesen(a){
  flanken[a] = true;
  if(['panel', 'neustart', 'bauen', 'variante1', 'variante2', 'variante3', 'variante4', 'varianteWeiter', 'ziffer5', 'ziffer6', 'ziffer7', 'ziffer8', 'ziffer9'].includes(a)) sofortAktionen.push(a);
}

window.addEventListener('keydown', e => {
  if(e.code === 'Tab'){ e.preventDefault(); if(document.activeElement) document.activeElement.blur(); if(!e.repeat) aktionAusloesen('panel'); return; }
  if(inTextfeld(e)) return;
  const as = aktionenZuCode(e.code);
  if(as.length) e.preventDefault();
  if(!gehaltenCodes.has(e.code) && !e.repeat) as.forEach(aktionAusloesen);
  gehaltenCodes.add(e.code);
  tonEntsperren();
});
window.addEventListener('keyup', e => { gehaltenCodes.delete(e.code); });
window.addEventListener('blur', () => gehaltenCodes.clear());
window.addEventListener('pointerdown', () => tonEntsperren());

function padLesen(){
  let pads = [];
  try{ pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []; }catch(err){ pads = []; }
  const gp = pads[0];
  ein.padDa = !!gp;
  pad2Lesen(pads[1]);
  if(!gp){ ein.stick = {x: 0, y: 0}; ein.stickR = {x: 0, y: 0}; padVorher = {}; return; }
  const ax = i => { const v = gp.axes[i] || 0; return Math.abs(v) < PAD_TOTZONE ? 0 : v; };
  ein.stick = {x: ax(0), y: ax(1)}; ein.stickR = {x: ax(2), y: ax(3)};
  const jetzt = {};
  for(const a in PAD_KNOEPFE) jetzt[a] = PAD_KNOEPFE[a].some(n => gp.buttons[n] && (gp.buttons[n].pressed || gp.buttons[n].value > 0.5));
  for(const a in jetzt) if(jetzt[a] && !padVorher[a]){ aktionAusloesen(a); if(a === 'springen') flanken.springenPad = true; tonEntsperren(); }
  padVorher = jetzt;
}

let pad2Vorher = {sprung: false};
function pad2Lesen(gp){   // zweiter Controller: Stick/Steuerkreuz laufen, ✕ springen, □ Schirm
  if(!gp){ ein.pad2 = {x: 0, sprung: false, schirm: false}; pad2Vorher = {sprung: false}; return; }
  const knopf = n => !!(gp.buttons[n] && (gp.buttons[n].pressed || gp.buttons[n].value > 0.5));
  let x = Math.abs(gp.axes[0] || 0) < PAD_TOTZONE ? 0 : gp.axes[0];
  if(knopf(14)) x = -1; if(knopf(15)) x = 1;
  ein.pad2 = {x, sprung: knopf(0), schirm: knopf(2)};
  if(ein.pad2.sprung && !pad2Vorher.sprung){ flanken.schweinSprung = true; flanken.schweinSprungPad = true; tonEntsperren(); }
  pad2Vorher = {sprung: ein.pad2.sprung};
}

function gehalten(a){
  if(TASTEN[a] && TASTEN[a].some(c => gehaltenCodes.has(c) && tasteZaehlt(a, c))) return true;
  if(a === 'haken' && ein.maus.taste) return true;
  return !!padVorher[a];
}
// Richtung (x, y je -1 … 1): Tasten, Steuerkreuz oder linker Stick; y < 0 = hoch
function richtungLesen(){
  let x = (gehalten('rechts') ? 1 : 0) - (gehalten('links') ? 1 : 0);
  let y = (gehalten('runter') ? 1 : 0) - (gehalten('hoch') ? 1 : 0);
  if(!x && ein.stick.x) x = ein.stick.x;
  if(!y && ein.stick.y) y = ein.stick.y;
  return {x: klemmen(x, -1, 1), y: klemmen(y, -1, 1)};
}
// zu Beginn jedes Physik-Schritts: neu gedrückte Aktionen übernehmen (so geht kein Druck verloren, egal wie viele
// Bilder pro Sekunde der Bildschirm zeigt)
function eingabeSchritt(){ ein.gedrueckt = flanken; flanken = {}; }
