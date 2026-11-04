// 12c-foto-material.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.
// Die Werkstatt (werkstatt.html) lädt diese Datei ebenfalls – beim Laden darum nichts vom Spiel benutzen.

// ---------- Foto-Material für Boden und Wand (Nutzerwunsch 04.11.: fotorealistischer Look, Schritt 2) ----------
// Boden und Wand behalten ihre Formen aus 12-welt-zeichnen.js (Raster, runde Ecken, Pfade je Stück). Liegt eine
// Foto-Textur vor, wird sie ÜBER die bisherige Füllung gelegt (an der Welt verankert, wandert nicht mit der Kamera):
//  - erde:  Inneres des Bodens (nahtlos in beide Richtungen),
//  - wand:  Inneres der Wand (nahtlos in beide Richtungen),
//  - kante: Gras-/Moos-Streifen auf jeder freien Oberkante (Boden UND Wand; nahtlos nach links/rechts, oben durchsichtig).
// Statt der Comic-Kontur gibt es dann eine dünne, weiche Kontur. Fehlt eine Textur, bleibt dort der alte Look.
// Herkunft je Textur: zuerst eine Probe aus der Werkstatt (localStorage 'monchichi.werkstatt.<id>', nur in diesem Browser),
// sonst die Datei assets/texturen/<id>.webp. Gilt wie der Foto-Hintergrund (11c) nur in der Dschungel-Welt und nur,
// solange der Foto-Look an ist (Taste B / Optionen). Ganz entfernen: diese Datei + Eintrag in index.html + die zwei
// Aufrufe in 12-welt-zeichnen.js (streifen, fotoMatUeber).
// Maße: Bildpunkte der Textur (w × h) und wie groß sie in der Welt ist (weltB × weltH, 1 Kästchen = 40).
const FOTO_MAT_TEXTUREN = {
  // Erde/Wand: ein Bild = 480×480 Welt-px (12×12 Kästchen) – mit 240 wirkten die Steine im Spiel doppelt so grob wie
  // in der Werkstatt-Vorschau (Nutzer: „plötzlich so grob“)
  erde:  {name: 'Erde',            w: 1024, h: 1024, weltB: 480, weltH: 480, x: true, y: true},
  wand:  {name: 'Wand',            w: 1024, h: 1024, weltB: 480, weltH: 480, x: true, y: true},
  kante: {name: 'Gras-/Moos-Kante', w: 1024, h: 256,  weltB: 320, weltH: 80,  x: true, y: false},
};
// Gras-Kante: die Bodenoberfläche liegt 'ueber' Welt-px unter dem oberen Rand des Streifens (darüber ragt Gras hoch)
const FOTO_MAT_KANTE = {ueber: 32, weltH: FOTO_MAT_TEXTUREN.kante.weltH};
const FOTO_MAT_KONTUR = 'rgba(14,12,8,.55)', FOTO_MAT_KONTUR_B = 2.2;   // weiche Kontur
// (Schatten innen am Rand entfernt – Nutzer: „wie ein Schlagschatten nach innen“)

const fotoMat = {bilder: {}, muster: {}};
function fotoMatQuelle(id){
  let probe = null; try { probe = localStorage.getItem('monchichi.werkstatt.' + id); } catch(e){}
  return probe || ('assets/texturen/' + id + '.webp?v=' + (window.__ladeZeit || (window.__ladeZeit = Date.now())));
}
// Textur laden (einmal); null, solange sie lädt oder fehlt
function fotoMatBild(id){
  let B = fotoMat.bilder[id];
  if(!B){ B = fotoMat.bilder[id] = {img: new Image(), ok: false}; B.img.onload = () => { B.ok = true; }; B.img.onerror = () => {}; B.img.src = fotoMatQuelle(id); }
  return B.ok ? B.img : null;
}
// Muster der Textur, auf Weltgröße skaliert; dy = Versatz nach unten (Gras-Kante: je Oberkante eigene Höhe)
function fotoMatMuster(q, id, dy){
  const img = fotoMatBild(id); if(!img) return null;
  let m = fotoMat.muster[id];
  if(!m){ m = fotoMat.muster[id] = q.createPattern(img, FOTO_MAT_TEXTUREN[id].y ? 'repeat' : 'repeat-x'); }
  const T = FOTO_MAT_TEXTUREN[id];
  if(m.setTransform) m.setTransform(new DOMMatrix([T.weltB/img.width, 0, 0, T.weltH/img.height, 0, dy || 0]));
  return m;
}
// gilt der Foto-Look gerade (wie der Foto-Hintergrund)?
function fotoMatAn(){ return typeof fotoHgAn === 'function' && fotoHgAn() && typeof BG_STIL !== 'undefined' && !!BG_STIL; }
// Foto-Gras-Kante da? Dann entfallen die gezeichneten Comic-Pflanzen am Boden (Dickicht, Gras, Farne, Blumen aus 17a) –
// die Kante bringt ihre eigenen Pflanzen mit. Tiere und ihre Abstands-Regeln bleiben unverändert.
function fotoMatOhneDeko(){ return fotoMatAn() && !!fotoMatBild('kante'); }
// aus matPfadeZeichnen (12): Texturen über die gezeichnete Füllung legen; true = erledigt (dann keine Comic-Kontur)
function fotoMatUeber(q, V){
  if(!fotoMatAn()) return false;
  const erde = V.hatG && fotoMatMuster(q, 'erde'), wand = V.hatW && fotoMatMuster(q, 'wand'), kante = fotoMatBild('kante');
  if(!erde && !wand && !kante) return false;
  if(erde){ q.fillStyle = erde; q.fill(V.PG); }
  if(wand){ q.fillStyle = wand; q.fill(V.PW); }
  q.strokeStyle = FOTO_MAT_KONTUR; q.lineWidth = FOTO_MAT_KONTUR_B; q.stroke(V.edge);
  if(kante) for(const [y, p] of V.streifen){ q.fillStyle = fotoMatMuster(q, 'kante', y - FOTO_MAT_KANTE.ueber); q.fill(p); }
  return true;
}
