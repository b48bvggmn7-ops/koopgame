// 12c-foto-material.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Foto-Material für Boden und Wand (Nutzerwunsch 04.11.: fotorealistischer Look, Schritt 2) ----------
// Boden und Wand behalten ihre Formen aus 12-welt-zeichnen.js (Raster, runde Ecken, Pfade je Stück). Liegt eine
// Foto-Textur vor, wird sie ÜBER die bisherige Füllung gelegt (an der Welt verankert, wandert nicht mit der Kamera):
//  - erde:  Inneres des Bodens (nahtlos in beide Richtungen),
//  - wand:  Inneres der Wand (nahtlos in beide Richtungen),
//  - kante: Moos-/Wurzel-Streifen auf jeder freien Oberkante von BODEN (nahtlos nach links/rechts, oben durchsichtig).
// Statt der Comic-Kontur gibt es dann keine Kontur. Fehlt eine Textur, bleibt dort der alte Look.
// Herkunft je Textur: die Datei assets/texturen/<id>.webp (die Werkstatt-Seite wurde auf Nutzerwunsch gelöscht). Gilt wie der Foto-Hintergrund (11c) nur in der Dschungel-Welt und nur,
// solange der Foto-Look an ist (Taste B / Optionen). Ganz entfernen: diese Datei + Eintrag in index.html + die zwei
// Aufrufe in 12-welt-zeichnen.js (streifen, fotoMatUeber).
// Maße: wie groß ein Texturbild in der Welt ist (weltB × weltH, 1 Kästchen = 40); y: auch senkrecht wiederholen.
const FOTO_MAT_TEXTUREN = {
  // Erde: Waldboden-Foto des Nutzers (727×727, nahtlos gemacht) = 180×180 Welt-px (4,5 Kästchen) – Steinchen klein
  erde:  {weltB: 180, weltH: 180, y: true},
  // Wand: Bruchstein-Mauer des Nutzers (per Schnitt entlang der Fugen nahtlos, 579×595) – Nutzer „kleinere Blöcke“:
  // ein Bild 74×76 Welt-px, ein Stein rund 15 Welt-px hoch (vorher 148×152)
  wand:  {weltB: 74, weltH: 76, y: true},
  // Moos-/Wurzel-Kante des Nutzers (freigestellt, per Schnitt nahtlos, 1628×374) = 326×75 Welt-px; nur auf Boden-Oberkanten
  kante: {weltB: 326, weltH: 75, y: false},
};
// Kante: die Bodenoberfläche liegt 'ueber' Welt-px unter dem oberen Rand des Streifens (darüber Gras/Blätter; die
// Moosmatte beginnt rund 4 Welt-px über der Oberfläche, die Füße sinken leicht ein; darunter hängen die Wurzeln)
const FOTO_MAT_KANTE = {ueber: 30, weltH: FOTO_MAT_TEXTUREN.kante.weltH};
// Kontur: im Foto-Look keine (Nutzerwunsch „nimm die Kontur weg“); Schatten innen am Rand gibt es auch nicht
// Boden dunkler (Nutzerwunsch): so viel Schwarz über das Erde-Foto
const FOTO_MAT_ERDE_DUNKEL = 0.38;

const fotoMat = {bilder: {}, muster: {}};
// (window.fotoMatTestQuellen: nur für automatische Tests – eigene Bilder statt der Dateien)
function fotoMatQuelle(id){
  const T = window.fotoMatTestQuellen;
  if(T) return T[id] || 'assets/texturen/fehlt-im-test.webp';
  return 'assets/texturen/' + id + '.webp?v=' + (window.__ladeZeit || (window.__ladeZeit = Date.now()));
}
// Textur laden (einmal); null, solange sie lädt oder fehlt
function fotoMatBild(id){
  let B = fotoMat.bilder[id];
  if(!B){ B = fotoMat.bilder[id] = {img: new Image(), ok: false}; B.img.onload = () => { B.ok = true; }; B.img.onerror = () => {}; B.img.src = fotoMatQuelle(id); }
  return B.ok ? B.img : null;
}
// Textur einmal sauber auf Bildschirmgröße verkleinert (in Halbierungs-Schritten, hohe Glättung) – sonst flimmern
// feine Muster (1024 Bildpunkte auf ~180), wenn das Muster beim Zeichnen stark verkleinert wird
function fotoMatSkaliert(id, img){
  const T = FOTO_MAT_TEXTUREN[id], sc = typeof RS === 'number' && typeof zoom === 'number' ? RS*zoom : 1;
  const zw = Math.max(16, Math.round(T.weltB*sc)), zh = Math.max(4, Math.round(T.weltH*sc));
  if(img.width <= zw*1.4) return img;
  let c = img, w = img.width, h = img.height;
  while(w/2 >= zw){
    w = Math.round(w/2); h = Math.round(h/2);
    const n = document.createElement('canvas'); n.width = w; n.height = h;
    const q = n.getContext('2d'); q.imageSmoothingQuality = 'high'; q.drawImage(c, 0, 0, w, h); c = n;
  }
  const n = document.createElement('canvas'); n.width = zw; n.height = zh;
  const q = n.getContext('2d'); q.imageSmoothingQuality = 'high'; q.drawImage(c, 0, 0, zw, zh);
  return n;
}
// Muster der Textur, auf Weltgröße skaliert; dy = Versatz nach unten (Gras-Kante: je Oberkante eigene Höhe)
function fotoMatMuster(q, id, dy){
  const img = fotoMatBild(id); if(!img) return null;
  const sc = typeof RS === 'number' ? RS : 1;
  let M = fotoMat.muster[id];
  if(!M || M.sc !== sc){ const b = fotoMatSkaliert(id, img); M = fotoMat.muster[id] = {sc, b, m: q.createPattern(b, FOTO_MAT_TEXTUREN[id].y ? 'repeat' : 'repeat-x')}; }
  const T = FOTO_MAT_TEXTUREN[id];
  if(M.m.setTransform) M.m.setTransform(new DOMMatrix([T.weltB/M.b.width, 0, 0, T.weltH/M.b.height, 0, dy || 0]));
  return M.m;
}
// gilt der Foto-Look gerade (wie der Foto-Hintergrund)?
function fotoMatAn(){ return typeof fotoHgAn === 'function' && fotoHgAn() && typeof BG_STIL !== 'undefined' && !!BG_STIL; }
// Im Foto-Look entfallen die gezeichneten grünen Comic-Pflanzen am Boden (Dickicht, Gras, Farne, Blumen aus 17a) –
// Nutzerwunsch „grüne Pflanzen im Vordergrund im Foto-Look raus“. Tiere und ihre Abstands-Regeln bleiben unverändert.
function fotoMatOhneDeko(){ return typeof fotoLookAktiv === 'function' && fotoLookAktiv(); }
// aus matPfadeZeichnen (12): Texturen über die gezeichnete Füllung legen; true = erledigt (dann keine Comic-Kontur)
function fotoMatUeber(q, V){
  if(!fotoMatAn()) return false;
  const erde = V.hatG && fotoMatMuster(q, 'erde'), wand = V.hatW && fotoMatMuster(q, 'wand'), kante = fotoMatBild('kante');
  if(!erde && !wand && !kante) return false;
  if(erde){ q.fillStyle = erde; q.fill(V.PG); q.fillStyle = 'rgba(0,0,0,' + FOTO_MAT_ERDE_DUNKEL + ')'; q.fill(V.PG); }
  if(wand){ q.fillStyle = wand; q.fill(V.PW); }
  if(kante) for(const [y, p] of V.streifen){ q.fillStyle = fotoMatMuster(q, 'kante', y - FOTO_MAT_KANTE.ueber); q.fill(p); }
  return true;
}
