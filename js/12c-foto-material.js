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
const FOTO_MAT_KANTE = {ueber: 20, matteUnten: 27, weltH: FOTO_MAT_TEXTUREN.kante.weltH};   // matteUnten: Unterkante der Moosmatte
// Bodenkanten im Foto-Look (Nutzer: „die Kanten vom Boden müssen realistischer aussehen“): Moos hängt an freien Ecken
// FOTO_MAT_UEBERHANG Welt-px über die Kante, unter schwebendem Boden hängen Wurzeln (FOTO_MAT_WURZEL_H lang, aus der
// Moos-Kante), die Seiten und die Unterseite sind bröckelig (FOTO_MAT_BROECKEL: bis so weit hinein/heraus)
// Wurzeln unter schwebendem Boden: gezeichnet (die Wurzeln der Moos-Kante sahen dort als heller Streifen komisch aus):
// je Kästchen FOTO_MAT_WURZEL_ANZAHL dunkle Wurzeln, FOTO_MAT_WURZEL_LANG Welt-px lang (min–max), mit Seitenästchen
const FOTO_MAT_UEBERHANG = 6, FOTO_MAT_BROECKEL = 3, FOTO_MAT_WURZEL_ANZAHL = [2, 5], FOTO_MAT_WURZEL_LANG = [4, 20];
const FOTO_MAT_WURZEL_FARBE = 'rgba(38,27,18,.9)', FOTO_MAT_WURZEL_HELL = 'rgba(92,72,52,.55)';
// Kontur: im Foto-Look keine (Nutzerwunsch „nimm die Kontur weg“); Schatten innen am Rand gibt es auch nicht
// Boden dunkler (Nutzerwunsch, zweimal): so viel Schwarz über das Erde-Foto (vorher 0,38)
const FOTO_MAT_ERDE_DUNKEL = 0.52;
// Mauer (Welt-px): Wiederholung nach 'periode', Reihen 'reiheMin'–'reiheMax' hoch, Steine 'breitMin'–'breitMax' breit
// (Nutzer erst „noch etwas kleiner“ – 13–19 / 20–44 -> 9–14 / 14–32 –, dann „nicht zu klein“ -> 11–16 / 17–36), Fuge 'fuge' (mittlere Breite, schwankt durch die rauen Kanten),
// 'rau' = wie stark die Kanten ausgefranst sind, 'ecke' = abgeschlagene Ecken bis so viel; 'aufloesung' Bildpunkte je
// Welt-px beim Aufbauen; 'quelleJeWelt' Foto-Bildpunkte je Welt-px (Steingröße im Foto ≈ Steingröße im Spiel)
// 'verform' = so weit wandert jede Ecke (Stein leicht schief), 'woelbung' = Kanten nach außen/innen gewölbt,
// 'farben' = Tönungen je Stein (null = keine), 'moos' = Anteil der Steine mit Moos oben
const FOTO_MAT_MAUER = {periode: 480, reiheMin: 11, reiheMax: 16, breitMin: 17, breitMax: 36, fuge: 1.3, rau: 0.45, ecke: 1.6,
                        verform: 1.1, woelbung: 0.9, moos: 0.18,
                        farben: [null, null, 'rgba(120,90,60,.12)', 'rgba(90,95,100,.14)', 'rgba(70,90,50,.12)', 'rgba(40,30,20,.14)', 'rgba(170,150,120,.10)'],
                        aufloesung: 2.5, quelleJeWelt: 3.6, saat: 7};

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
// Reihe anders versetzt (die Fugen liegen nie übereinander) – nahtlos wiederholbar nach FOTO_MAT_MAUER.periode. Wie
// behauene Bruchsteine (Nutzer: „Steine haben eine Outline – achte darauf, wie die Steine geschnitten sind“): jeder Stein
// eine raue Form mit ausgefransten Kanten und abgeschlagenen Ecken (keine runden Rechtecke), eigener Ausschnitt aus dem
// Foto (bevorzugt ohne Fugen des Fotos), leicht heller/dunkler, weiches Licht von oben. Die Fugen sind KEIN dunkler
// Rand ringsum: dahinter liegt das abgedunkelte Foto (Mörtel/Moos), dazu nur ein weicher Schatten unter/rechts neben
// jedem Stein; dadurch schwankt die Fugenbreite natürlich.
function fotoMatMauer(img){
  const M = FOTO_MAT_MAUER, P = M.periode, s = M.aufloesung, c = document.createElement('canvas'), lage = [];
  c.width = c.height = Math.round(P*s);
  const q = c.getContext('2d'), r = rnd(M.saat);
  // Fugen-Grund: das Foto selbst, gekachelt und stark abgedunkelt (Mörtel, Moos, Erde in den Fugen)
  const k = s/M.quelleJeWelt;
  for(let x = 0; x < c.width; x += img.width*k) for(let y = 0; y < c.height; y += img.height*k) q.drawImage(img, x, y, img.width*k, img.height*k);
  q.fillStyle = 'rgba(14,12,8,.62)'; q.fillRect(0, 0, c.width, c.height);
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
  // raue Steinform (Punkte, Bildpunkte) – jeder Stein anders (Nutzer: „jeder einzelne Stein muss etwas Besonderes
  // sein“): Ecken unterschiedlich weit verschoben (der Stein ist leicht schief/trapezförmig), jede Kante eigene Wölbung
  // nach außen oder innen, manchmal eine große abgeschlagene Ecke, dazu feine Ausfransung alle ~2,5 Welt-px
  const form = (X, Y, Wd, Hd) => {
    const V = M.verform*s, ecken = [[X, Y], [X + Wd, Y], [X + Wd, Y + Hd], [X, Y + Hd]].map(([x, y]) => [x + (r() - 0.5)*2*V, y + (r() - 0.5)*2*V]);
    const ec = () => (r() < 0.2 ? 1.8 : 0.3 + r()*0.7)*M.ecke*s, pts = [];
    for(let i = 0; i < 4; i++){
      const [ax, ay] = ecken[i], [bx, by] = ecken[(i + 1) % 4], L = Math.hypot(bx - ax, by - ay) || 1, ux = (bx - ax)/L, uy = (by - ay)/L, nx = uy, ny = -ux;
      const ca = ec(), cb = ec(), w = (r() - 0.5)*2*M.woelbung*s, n = Math.max(2, Math.round(L/(2.5*s)));
      for(let k = 0; k <= n; k++){
        const t = k/n, d = ca + (L - ca - cb)*t, b = Math.sin(Math.PI*t)*w + (k && k < n ? (r() - 0.5)*2*M.rau*s : 0);
        pts.push([ax + ux*d + nx*b, ay + uy*d + ny*b]);
      }
    }
    return pts;
  };
  const pfad = (pts, dx, dy) => { q.beginPath(); pts.forEach(([x, y], i) => i ? q.lineTo(x + dx, y + dy) : q.moveTo(x + dx, y + dy)); q.closePath(); };
  const stein = (x, y, w, h) => {
    const g = M.fuge*s/2, X = x*s + g, Y = y*s + g, Wd = w*s - 2*g, Hd = h*s - 2*g, pts = form(X, Y, Wd, Hd);
    const sw = Math.min(img.width, w*M.quelleJeWelt), sh = Math.min(img.height, h*M.quelleJeWelt), [sx, sy] = ausschnitt(sw, sh);
    const v = r(), ton = v < 0.5 ? 'rgba(0,0,0,' + (0.26*(0.5 - v)) + ')' : 'rgba(255,245,225,' + (0.1*(v - 0.5)) + ')';
    // eigene Färbung je Stein (mal wärmer, grauer, grünlicher) und manchmal Moos an der Oberseite
    const f = M.farben[Math.floor(r()*M.farben.length)], moos = r() < M.moos, spiegel = r() < 0.5;
    for(const dx of [0, -P*s]) for(const dy of [0, -P*s]){
      if(X + dx > c.width || Y + dy > c.height || X + dx + Wd + 2*s < 0 || Y + dy + Hd + 2*s < 0) continue;
      // weicher Schatten unter/rechts neben dem Stein (in die Fuge), kein Rand ringsum
      q.fillStyle = 'rgba(0,0,0,.22)'; pfad(pts, dx + 0.5*s, dy + 0.8*s); q.fill();
      q.fillStyle = 'rgba(0,0,0,.18)'; pfad(pts, dx + 1.0*s, dy + 1.5*s); q.fill();
      q.save(); pfad(pts, dx, dy); q.clip();
      if(spiegel){ q.save(); q.translate(2*(X + dx) + Wd, 0); q.scale(-1, 1); }
      q.drawImage(img, sx, sy, sw, sh, X + dx - 2*s, Y + dy - 2*s, Wd + 4*s, Hd + 4*s);   // etwas größer: Form ist verschoben
      if(spiegel) q.restore();
      q.fillStyle = ton; q.fillRect(X + dx - 2*s, Y + dy - 2*s, Wd + 4*s, Hd + 4*s);
      if(f){ q.fillStyle = f; q.fillRect(X + dx - 2*s, Y + dy - 2*s, Wd + 4*s, Hd + 4*s); }
      if(moos){ const gm = q.createLinearGradient(0, Y + dy - 2*s, 0, Y + dy + Hd*0.6);
        gm.addColorStop(0, 'rgba(78,104,40,.45)'); gm.addColorStop(1, 'rgba(78,104,40,0)'); q.fillStyle = gm; q.fillRect(X + dx - 2*s, Y + dy - 2*s, Wd + 4*s, Hd + 4*s); }
      const gr = q.createLinearGradient(0, Y + dy, 0, Y + dy + Hd);   // weiches Licht von oben
      gr.addColorStop(0, 'rgba(255,240,215,.1)'); gr.addColorStop(0.35, 'rgba(255,240,215,0)'); gr.addColorStop(0.75, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.16)');
      q.fillStyle = gr; q.fillRect(X + dx, Y + dy, Wd, Hd);
      q.restore();
    }
  };
  let y = 0;
  while(y < P - 0.01){
    let h = M.reiheMin + r()*(M.reiheMax - M.reiheMin);
    if(P - y - h < M.reiheMin) h = P - y;                       // letzte Reihe passt genau (nahtlos)
    let x = 0; const off = r()*M.breitMax, fugen = [];
    while(x < P - 0.01){
      let w = M.breitMin + r()*(M.breitMax - M.breitMin);
      if(P - x - w < M.breitMin) w = P - x;
      stein((x + off) % P, y, w, h);
      fugen.push((x + off) % P);
      x += w;
    }
    lage.push({y, h, fugen: fugen.sort((a, b) => a - b)});
    y += h;
  }
  fotoMat.lage = lage;   // Reihen der Mauer mit ihren Fugen (Welt-px, eine Periode) – für den Wandrand
  return c;
}
// Wandrand wie bei einer Bruchsteinmauer im Wald (Nutzer: „muss keine 100 % glatte Kante sein“, dann „nur minimal
// uneben“, dann „Lücken an den Kanten nicht zu gerade, sieht teilweise gerade abgeschnitten aus“): an jeder freien Seite
// einer Wand endet jeder Randstein mit seiner eigenen leicht gerundeten Kante – an den Fugen der Mauer geht der Rand
// FOTO_MAT_RAND_DELLE Welt-px hinein, dazwischen wölbt sich jeder Stein bis zu FOTO_MAT_RAND_BUCKEL Welt-px heraus
// (je Stein anders). Oben/unten folgen die Buckel den Steinen der obersten/untersten Reihe, seitlich den Reihen.
// Nur Optik – die Kollision bleibt das Kästchen. kaestchen: Wand-Kästchen dieses Stücks ({cc, rr, n, s, wl, e});
// Rückgabe: Path2D (eine Form je Kästchen) oder null, solange die Mauer noch nicht gebaut ist.
// Damit am Rand keine dünnen Steinstreifen bleiben, endet der Rand an der nächsten Fuge, wenn sie höchstens
// FOTO_MAT_RAND_FUGE Welt-px von der Kästchenkante entfernt ist (oben/unten: Reihenfuge, seitlich: Fuge je Reihe).
const FOTO_MAT_RAND_BUCKEL = 2.4, FOTO_MAT_RAND_DELLE = 1.3, FOTO_MAT_RAND_SCHRITT = 1.5, FOTO_MAT_RAND_FUGE = 5;
function fotoMatWandMaske(kaestchen){
  const L = fotoMat.lage; if(!L || !kaestchen.length) return null;
  const P = FOTO_MAT_MAUER.periode, B = FOTO_MAT_RAND_BUCKEL, D = FOTO_MAT_RAND_DELLE, S = FOTO_MAT_RAND_SCHRITT, G = FOTO_MAT_RAND_FUGE;
  const zufall = (a, b) => { const v = Math.sin(a*12.9898 + b*78.233)*43758.5453; return v - Math.floor(v); };
  const mod = v => ((v % P) + P) % P;
  const reihe = y => { const yy = mod(y); for(const R of L) if(yy < R.y + R.h) return R; return L[L.length - 1]; };
  // Stein (Fugen a < b, Welt-px) in Reihe R, in dem x liegt
  const steinBei = (R, x) => {
    const xx = mod(x), F = R.fugen; let a = F[F.length - 1] - P, b = F[0];
    for(let i = 0; i < F.length; i++){ if(F[i] <= xx){ a = F[i]; b = i + 1 < F.length ? F[i + 1] : F[0] + P; } }
    return [x - xx + a, x - xx + b];
  };
  // Ausbeulung: an der Fuge -D, in der Steinmitte bis +Buckel (je Stein anders), dazu feine Rauheit
  const beule = (t, k1, k2, fein) => { const A = B*(0.45 + 0.55*zufall(k1, k2)), w = Math.pow(Math.sin(Math.PI*Math.max(0, Math.min(1, t))), 0.55);
    return -D + (D + A)*w + (zufall(fein, k2 + 3) - 0.5)*0.5; };
  // oben/unten: Buckel je Stein der angrenzenden Reihe (wy = Höhe in der Reihe)
  const waagerecht = (x, wy) => { const R = reihe(wy), [a, b] = steinBei(R, x); return beule((x - a)/(b - a), mod(a), R.y, x); };
  // links/rechts: Buckel je Reihe (wx = Stelle in der Wand, die den Randstein bestimmt)
  const senkrecht = (y, wx) => { const R = reihe(y), y0 = y - mod(y) + R.y, [a] = steinBei(R, wx); return beule((y - y0)/R.h, mod(a), R.y + 7, y); };
  // nächste Reihenfuge zu y (höchstens G entfernt), sonst y
  const reihenFuge = y => { const R = reihe(y), y0 = y - mod(y) + R.y, y1 = y0 + R.h, d0 = y - y0, d1 = y1 - y;
    return d0 <= d1 ? (d0 <= G ? y0 : y) : (d1 <= G ? y1 : y); };
  // seitlich: nächste Fuge in der Reihe bei y zu x (höchstens G entfernt), sonst x
  const seitenFuge = (y, x) => { const [a, b] = steinBei(reihe(y), x), da = x - a, db = b - x;
    return da <= db ? (da <= G ? a : x) : (db <= G ? b : x); };
  const pfad = new Path2D();
  for(const k of kaestchen){
    const X = k.cc*40, Y = k.rr*40, pts = [];
    const n = Math.max(2, Math.round(40/S)), oY = k.n ? Y : reihenFuge(Y), uY = k.s ? Y + 40 : reihenFuge(Y + 40);
    for(let i = 0; i <= n; i++){ const x = X + 40*i/n; pts.push([x, k.n ? Y : oY - waagerecht(x, oY + 0.5)]); }               // oben
    for(let i = 1; i <= n; i++){ const y = Y + 40*i/n, yy = Math.min(y, Y + 39.99);
      pts.push([k.e ? X + 40 : seitenFuge(yy, X + 40) + senkrecht(yy, X + 39.5), y]); }                                     // rechts
    for(let i = n - 1; i >= 0; i--){ const x = X + 40*i/n; pts.push([x, k.s ? Y + 40 : uY + waagerecht(x, uY - 0.5)]); }    // unten
    for(let i = n - 1; i > 0; i--){ const y = Y + 40*i/n; pts.push([k.wl ? X : seitenFuge(y, X) - senkrecht(y, X + 0.5), y]); }   // links
    pts.forEach(([x, y], i) => i ? pfad.lineTo(x, y) : pfad.moveTo(x, y)); pfad.closePath();
  }
  return pfad;
}
// Bodenform mit bröckeligen Seiten/Unterseite (je Kästchen ein Umriss): oben bleibt die Lauffläche gerade (darauf liegt
// die Moos-Kante), freie Seiten und Unterseiten wellen sich unregelmäßig (zwei Wellen + feine Krümel, an der Welt
// verankert, eher nach innen ausgebrochen als heraus); nahe der Oberkante läuft das weich auf null aus.
function fotoMatBodenMaske(kaestchen){
  if(!kaestchen.length) return null;
  const Bm = FOTO_MAT_BROECKEL, S = 1.4;
  const zufall = (a, b) => { const v = Math.sin(a*12.9898 + b*78.233)*43758.5453; return v - Math.floor(v); };
  const welle = (u, linie) => { const f1 = zufall(linie, 1)*6.28, f2 = zufall(linie, 2)*6.28;
    const v = 0.5*Math.sin(u*0.21 + f1) + 0.3*Math.sin(u*0.63 + f2) + 0.35*(zufall(Math.floor(u/2.3), linie) - 0.5)*2;
    return (v - 0.35)*Bm; };   // eher nach innen (Ausbrüche)
  const auslauf = d => Math.min(1, Math.max(0, d/6));   // nahe der Oberkante gerade
  const pfad = new Path2D();
  for(const k of kaestchen){
    const X = k.cc*40, Y = k.rr*40, n = Math.round(40/S), pts = [];
    pts.push([X, Y], [X + 40, Y]);                                                             // oben gerade
    for(let i = 1; i <= n; i++){ const y = Y + 40*i/n;
      pts.push([k.e ? X + 40 : X + 40 + welle(y, X + 40)*auslauf(k.n ? 40 : y - Y), y]); }    // rechts
    for(let i = n - 1; i >= 0; i--){ const x = X + 40*i/n; pts.push([x, k.s ? Y + 40 : Y + 40 + welle(x, Y + 40.5)]); }   // unten
    for(let i = n - 1; i > 0; i--){ const y = Y + 40*i/n; pts.push([k.wl ? X : X - welle(y, X)*auslauf(k.n ? 40 : y - Y), y]); }   // links
    pts.forEach(([x, y], i) => i ? pfad.lineTo(x, y) : pfad.moveTo(x, y)); pfad.closePath();
  }
  return pfad;
}
// Wurzeln unter freien Unterseiten von Boden (je Kästchen; an der Welt verankert, immer gleich): beginnen 2 Welt-px in der
// Erde, wachsen leicht schlängelnd nach unten, manche mit Seitenästchen. Rückgabe {dick, fein} oder null.
function fotoMatWurzeln(kaestchen){
  const liste = kaestchen.filter(k => !k.s); if(!liste.length) return null;
  const zufall = (a, b) => { const v = Math.sin(a*12.9898 + b*78.233)*43758.5453; return v - Math.floor(v); };
  const dick = new Path2D(), fein = new Path2D(), [nMin, nMax] = FOTO_MAT_WURZEL_ANZAHL, [lMin, lMax] = FOTO_MAT_WURZEL_LANG;
  const wurzel = (P, x, y, lang, seed, rich) => {
    P.moveTo(x, y); let dx = 0;
    for(let s = 2; s <= lang; s += 2){ dx += (zufall(seed, s) - 0.5)*1.4 + rich*0.15; P.lineTo(x + dx, y + s); }
    return x + dx;
  };
  for(const k of liste){
    const X = k.cc*40, Yu = k.rr*40 + 40, n = nMin + Math.floor(zufall(X, Yu)*(nMax - nMin + 1));
    for(let i = 0; i < n; i++){
      const x = X + 3 + zufall(X + i*7, Yu + 1)*34, lang = lMin + Math.pow(zufall(X + i*13, Yu + 2), 1.6)*(lMax - lMin), seed = X*3 + i*17 + Yu;
      wurzel(dick, x, Yu - 2, lang, seed, zufall(seed, 9) - 0.5);
      if(lang > 9){ const ay = Yu - 2 + lang*(0.35 + 0.3*zufall(seed, 3)), r = zufall(seed, 4) < 0.5 ? -1 : 1;   // Seitenast
        wurzel(fein, x + r*0.5, ay, lang*0.45, seed + 5, r*3); }
      wurzel(fein, x + (zufall(seed, 6) - 0.5)*6, Yu - 1.5, lang*0.5, seed + 11, 0);                       // Faser daneben
    }
  }
  return {dick, fein};
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
function fotoMatMuster(q, id, dy, gross){
  const img = fotoMatBild(id); if(!img) return null;
  const sc = typeof RS === 'number' ? RS : 1;
  let M = fotoMat.muster[id];
  if(!M || M.sc !== sc){ const b = fotoMatSkaliert(id, img); M = fotoMat.muster[id] = {sc, b, m: q.createPattern(b, FOTO_MAT_TEXTUREN[id].y ? 'repeat' : 'repeat-x')}; }
  const T = FOTO_MAT_TEXTUREN[id];
  const f = gross || 1;
  if(M.m.setTransform) M.m.setTransform(new DOMMatrix([f*T.weltB/M.b.width, 0, 0, f*T.weltH/M.b.height, 0, dy || 0]));
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
  const PG = V.bodenMaske || V.PG;
  if(erde){ q.fillStyle = erde; q.fill(PG); q.fillStyle = 'rgba(0,0,0,' + FOTO_MAT_ERDE_DUNKEL + ')'; q.fill(PG); }
  if(wand){
    q.fillStyle = wand;
    if(V.wandMaske && !V.maskeFehlt) q.fill(V.wandMaske);
    else q.fill(V.PW);
  }
  if(kante) for(const [y, p] of V.streifen){ q.fillStyle = fotoMatMuster(q, 'kante', y - FOTO_MAT_KANTE.ueber); q.fill(p); }
  // Wurzeln unter schwebendem Boden (gezeichnet): dicke dunkel, darüber feine hellere Fasern
  if(erde && V.wurzeln){ q.save(); q.lineCap = 'round'; q.lineJoin = 'round';
    q.strokeStyle = FOTO_MAT_WURZEL_FARBE; q.lineWidth = 1.3; q.stroke(V.wurzeln.dick);
    q.lineWidth = 0.6; q.stroke(V.wurzeln.fein); q.strokeStyle = FOTO_MAT_WURZEL_HELL; q.lineWidth = 0.4; q.stroke(V.wurzeln.dick); q.restore(); }
  return true;
}
