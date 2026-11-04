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
  // Wand: eine MAUER, die das Spiel einmal selbst aufbaut (fotoMatMauer) – Nutzer: „mehr Steine, die sich weniger
  // wiederholen, man sieht Copy-Paste; die Steine sollen richtig aufeinander liegen“. Jeder Stein ist ein anderer
  // Ausschnitt aus dem Mauer-Foto des Nutzers (wand-steine.webp), in Reihen versetzt gemauert; wiederholt sich erst
  // nach FOTO_MAT_MAUER.periode Welt-px (12 Kästchen) in beide Richtungen.
  wand:  {weltB: 480, weltH: 480, y: true, quelle: 'wand-steine'},
  // Moos-/Wurzel-Kante des Nutzers (freigestellt, per Schnitt nahtlos, 1628×374); nur auf Boden-Oberkanten.
  // Nutzer „Moos-Streifen muss kleiner sein“: 220×51 Welt-px (vorher 326×75)
  kante: {weltB: 220, weltH: 51, y: false},
};
// Kante: die Bodenoberfläche liegt 'ueber' Welt-px unter dem oberen Rand des Streifens (darüber Gras/Blätter; die
// Moosmatte beginnt knapp darüber, die Füße sinken leicht ein; darunter hängen die Wurzeln)
const FOTO_MAT_KANTE = {ueber: 20, weltH: FOTO_MAT_TEXTUREN.kante.weltH};
// Kontur: im Foto-Look keine (Nutzerwunsch „nimm die Kontur weg“); Schatten innen am Rand gibt es auch nicht
// Boden dunkler (Nutzerwunsch, zweimal): so viel Schwarz über das Erde-Foto (vorher 0,38)
const FOTO_MAT_ERDE_DUNKEL = 0.52;
// Mauer (Welt-px): Wiederholung nach 'periode', Reihen 'reiheMin'–'reiheMax' hoch, Steine 'breitMin'–'breitMax' breit,
// Fuge 'fuge'; 'aufloesung' Bildpunkte je Welt-px beim Aufbauen; 'quelleJeWelt' Foto-Bildpunkte je Welt-px (Steingröße
// im Foto ≈ Steingröße im Spiel)
const FOTO_MAT_MAUER = {periode: 480, reiheMin: 13, reiheMax: 19, breitMin: 20, breitMax: 44, fuge: 1.6, aufloesung: 2.5,
                        quelleJeWelt: 3.6, saat: 7};

const fotoMat = {bilder: {}, muster: {}};
// (window.fotoMatTestQuellen: nur für automatische Tests – eigene Bilder statt der Dateien)
function fotoMatQuelle(id){
  const T = window.fotoMatTestQuellen;
  if(T) return T[id] || 'assets/texturen/fehlt-im-test.webp';
  return 'assets/texturen/' + (FOTO_MAT_TEXTUREN[id].quelle || id) + '.webp?v=' + (window.__ladeZeit || (window.__ladeZeit = Date.now()));
}
// Textur laden (einmal); null, solange sie lädt oder fehlt. Wand: daraus einmal die Mauer bauen
function fotoMatBild(id){
  let B = fotoMat.bilder[id];
  if(!B){ B = fotoMat.bilder[id] = {img: new Image(), ok: false}; B.img.onload = () => { B.ok = true; }; B.img.onerror = () => {}; B.img.src = fotoMatQuelle(id); }
  if(!B.ok) return null;
  if(id === 'wand') return B.mauer || (B.mauer = fotoMatMauer(B.img));
  return B.img;
}
// Mauer aufbauen (einmal, fester Zufall): Reihen unterschiedlicher Höhe, darin Steine unterschiedlicher Breite, jede
// Reihe anders versetzt (die Fugen liegen nie übereinander) – nahtlos wiederholbar nach FOTO_MAT_MAUER.periode. Jeder
// Stein: eigener Ausschnitt aus dem Foto (bevorzugt ohne Fugen des Fotos), leicht heller/dunkler, Kante oben hell,
// unten dunkel; dazwischen dunkle Fuge.
function fotoMatMauer(img){
  const M = FOTO_MAT_MAUER, P = M.periode, s = M.aufloesung, c = document.createElement('canvas');
  c.width = c.height = Math.round(P*s);
  const q = c.getContext('2d'), r = rnd(M.saat);
  q.fillStyle = '#1f1b16'; q.fillRect(0, 0, c.width, c.height);
  // helle Zeilen des Fotos = Steinflächen (dunkle Zeilen = Fugen) – Ausschnitte möglichst dort hineinlegen
  let hell = null;
  try { const t = document.createElement('canvas'); t.width = 1; t.height = img.height; const tq = t.getContext('2d'); tq.drawImage(img, 0, 0, 1, img.height);
    const d = tq.getImageData(0, 0, 1, img.height).data, L = []; for(let y = 0; y < img.height; y++) L.push(d[y*4] + d[y*4 + 1] + d[y*4 + 2]);
    const sort = [...L].sort((a, b) => a - b), grenze = sort[Math.floor(L.length*0.3)]; hell = L.map(v => v >= grenze); } catch(e){}
  const ausschnitt = (sw, sh) => {
    let best = null, bestDunkel = Infinity;
    for(let v = 0; v < 8; v++){
      const sx = r()*Math.max(0, img.width - sw), sy = r()*Math.max(0, img.height - sh);
      let dunkel = 0; if(hell) for(let y = Math.floor(sy); y < sy + sh; y++) if(!hell[y]) dunkel++;
      if(dunkel < bestDunkel){ bestDunkel = dunkel; best = [sx, sy]; } if(!dunkel) break;
    }
    return best;
  };
  const stein = (x, y, w, h) => {
    const g = M.fuge*s/2, X = x*s + g, Y = y*s + g, Wd = w*s - 2*g, Hd = h*s - 2*g, rad = Math.min(3*s, Hd/3);
    const sw = Math.min(img.width, w*M.quelleJeWelt), sh = Math.min(img.height, h*M.quelleJeWelt), [sx, sy] = ausschnitt(sw, sh);
    for(const dx of [0, -P*s]) for(const dy of [0, -P*s]){
      if(X + dx > c.width || Y + dy > c.height || X + dx + Wd < 0 || Y + dy + Hd < 0) continue;
      q.save(); q.beginPath(); q.roundRect(X + dx, Y + dy, Wd, Hd, rad); q.clip();
      q.drawImage(img, sx, sy, sw, sh, X + dx, Y + dy, Wd, Hd);
      const v = r(); q.fillStyle = v < 0.5 ? 'rgba(0,0,0,' + (0.28*(0.5 - v)) + ')' : 'rgba(255,245,225,' + (0.12*(v - 0.5)) + ')'; q.fillRect(X + dx, Y + dy, Wd, Hd);
      const gr = q.createLinearGradient(0, Y + dy, 0, Y + dy + Hd);
      gr.addColorStop(0, 'rgba(255,240,210,.16)'); gr.addColorStop(0.25, 'rgba(255,240,210,0)'); gr.addColorStop(0.7, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.38)');
      q.fillStyle = gr; q.fillRect(X + dx, Y + dy, Wd, Hd);
      q.restore();
    }
  };
  let y = 0;
  while(y < P - 0.01){
    let h = M.reiheMin + r()*(M.reiheMax - M.reiheMin);
    if(P - y - h < M.reiheMin) h = P - y;                       // letzte Reihe passt genau (nahtlos)
    let x = 0; const off = r()*M.breitMax;
    while(x < P - 0.01){
      let w = M.breitMin + r()*(M.breitMax - M.breitMin);
      if(P - x - w < M.breitMin) w = P - x;
      stein((x + off) % P, y, w, h);
      x += w;
    }
    y += h;
  }
  return c;
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
