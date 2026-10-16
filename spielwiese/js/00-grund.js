// 00-grund.js – Spielwiese (eigenständig, nutzt NICHTS aus ../js/ des Spiels).
// Grundwerte wie im Spiel: Bild 1280×720, Kästchen 40 px, Zoom 0,85, fester Takt 60 Schritte pro Spielsekunde.

const BILD_B = 1280, BILD_H = 720;   // Spielfeld (16:9)
const K = 40;                        // Kästchengröße in px
const ZOOM = 0.85;                   // wie im Spiel (15 % herausgezoomt)
const SICHT_B = BILD_B / ZOOM, SICHT_H = BILD_H / ZOOM;   // sichtbare Welt in px
const SCHRITT_MS = 1000 / 60;        // ein Physik-Schritt
const FIG_B = 28.5, FIG_H = 32.3;    // Figurengröße wie im Spiel
const SPEICHER_PRAEFIX = 'spielwiese-';   // alle eigenen localStorage-Schlüssel beginnen damit (nie die des Spiels)

const leinwand = document.getElementById('leinwand');
const ctx = leinwand.getContext('2d');

function speicherLesen(schluessel, standard){
  try{ const t = localStorage.getItem(SPEICHER_PRAEFIX + schluessel); return t ? JSON.parse(t) : standard; }
  catch(err){ return standard; }
}
function speicherSchreiben(schluessel, wert){
  try{ localStorage.setItem(SPEICHER_PRAEFIX + schluessel, JSON.stringify(wert)); }catch(err){ /* privat/voll: egal */ }
}

function bildLaden(src){ const i = new Image(); i.src = src; return i; }
// nur lesen: die Figuren-Bilder des Spiels (sonst einfache Formen)
const BILDER = { affe: bildLaden('../assets/monkey.png'), schwein: bildLaden('../assets/pig.png') };
const KOPF_MITTE = { affe: [153.5/308, 132/257], schwein: [153.5/308, 139.5/257] };   // Kopfmitte im Bild (wie im Spiel)

const klemmen = (v, a, b) => Math.max(a, Math.min(b, v));
const mischen = (a, b, t) => a + (b - a) * t;

// Leinwand an die Fenstergröße anpassen (16:9, scharf auf hochauflösenden Bildschirmen)
function leinwandAnpassen(){
  const fb = window.innerWidth, fh = window.innerHeight;
  const s = Math.min(fb / BILD_B, fh / BILD_H);
  const cssB = Math.floor(BILD_B * s), cssH = Math.floor(BILD_H * s);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  leinwand.style.width = cssB + 'px'; leinwand.style.height = cssH + 'px';
  leinwand.width = Math.round(cssB * dpr); leinwand.height = Math.round(cssH * dpr);
}
window.addEventListener('resize', leinwandAnpassen);
leinwandAnpassen();
