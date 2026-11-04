// 11c-foto-hintergrund.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Foto-Hintergrund (Nutzerwunsch 04.11.: fotorealistischer Nebelwald statt gezeichnetem Dschungel) ----------
// Statt des gezeichneten Hintergrunds aus 11b zeigt das Spiel ein Nebelwald-Bild des Nutzers (FOTO_HG_BILDER; mehrere
// Bilder, die aneinander passen, laufen als Endlos-Schleife; ein einzelnes wird gespiegelt wiederholt, FOTO_HG_SPIEGELN).
// Die alten flachen Panoramen (3:1) wirkten zu „rangezoomt“ – das neue Bild ist höher (2000×848, Look wie der
// Screenshot des Nutzers). Jedes Bild ist ein eigenes vorgezeichnetes Stück (bildhoch); an den Nahtstellen blendet das rechte Stück auf
// FOTO_HG_UEBERGANG Bildpunkten weich über das linke (kein harter Strich). Davor ziehen leichte Nebelschwaden.
// Gilt für alle Level mit neuem Hintergrund-Stil (BG_STIL, also die Dschungel-Welt); nachts dunkelblau getönt.
// Abschaltbar: Taste B oder Optionen → „Foto-Hintergrund“ (localStorage 'monchichi.fotoHintergrund' = 'aus'). Solange die
// Bilder noch laden (oder fehlen), bleibt der gezeichnete Hintergrund. Ganz entfernen: diese Datei + Eintrag in index.html.
// Speicher: ein Stück ~6 MB; weil jedes breiter als der Bildschirm ist, sind pro Bild höchstens 2 sichtbar (~12 MB,
// Chrome-Budget je Bild ~32 MB, siehe CLAUDE.md).
// Neues, höheres Bild (Original 2000×848) im Look des Nutzer-Screenshots. Gespiegelt wiederholen gefiel nicht (man sah
// es); darum einmal vorab zur nahtlosen Schleife gemacht (nebelwald-schleife.webp, 1580×848): Ende und Anfang
// überlappen 420 Bildpunkte, der Übergang läuft entlang eines Schnitts durch den Nebel, wo beide am ähnlichsten sind
// (nur ±6 Bildpunkte weich, kein Durchscheinen). Es schließt also an sich selbst an – keine Überblendung nötig.
const FOTO_HG_BILDER = ['assets/hintergrund/nebelwald-schleife.webp'];
const FOTO_HG_SPIEGELN = false;
const FOTO_HG_UEBERGANG = 0;        // weiche Überblendung an jeder Nahtstelle (Spiel-Bildpunkte; 0 = Bilder passen schon nahtlos)
const FOTO_HG_PAR = 0.15;           // Parallaxe: Anteil der Kamerabewegung
// Größe: Panorama FOTO_HG_HOEHE der Bildhöhe hoch, unten bündig. 1 = bildhoch (so wenig vergrößert wie möglich, ohne
// Lücke). Ein Versuch mit 0,75 (darüber Nebel-Himmel) gefiel nicht: „oben einfach eine graue Wand“ -> wieder 1.
// Nur bei < 1: darüber Nebel in der Himmel-Farbe der Bilder, der obere Bildrand blendet auf FOTO_HG_OBEN_WEICH weich hinein.
const FOTO_HG_HOEHE = 1, FOTO_HG_OBEN_WEICH = 170;
const FOTO_HG_HIMMEL_ERSATZ = '206,214,212';            // Himmel-Farbe, falls sie sich nicht aus den Bildern lesen lässt
// Zusätzlicher Nebel (über dem Bild). Verlauf der Nutzerwünsche: alte Panoramen Dunst 0,07/Schwaden 0,3/Bodennebel
// 0,38 -> neues Bild „mit weniger Nebel“ 0,02/0,12/0,14 -> „wieder mehr Nebel, gerne auch an der Naht“ (jetzt):
const FOTO_HG_DUNST_A = 0.05;       // leichter Dunst über dem ganzen Bild
const FOTO_HG_NEBEL = '232,238,234', FOTO_HG_NEBEL_A = 0.22;   // Nebelschwaden: Farbe, Deckkraft
// Nutzer 04.11.: „unten ganz viel, darüber kaum noch – hier und da mal ein bisschen Nebel, oben und unten, mal mehr mal
// weniger, ich will durchlaufen können“ -> Bodennebel hinten 0,26 -> 0,1, vorne 0,2 -> 0,06, die drei Bodenschwaden vorne
// weg; dafür Nebelfelder in der Welt (FOTO_HG_FELDER, unten).
const FOTO_HG_BODENNEBEL_A = 0.1, FOTO_HG_BODENNEBEL_H = 300;   // Bodennebel: steigt vom unteren Rand auf (Deckkraft unten, Höhe)
// Nebelwolke über der Naht der Schleife (wandert mit dem Bild): Mitte FOTO_HG_NAHT_X Bildpunkte (Original) nach dem
// Anfang jedes Stücks (dort liegt der Schnitt, 55–149), so breit/deckend
const FOTO_HG_NAHT_X = 100, FOTO_HG_NAHT_B = 260, FOTO_HG_NAHT_A = 0.32;
// leichter, durchsichtiger Nebel VOR dem Spielfeld (Nutzerwunsch): zieht schneller als die Kamera (nah = Tiefe)
// (Nutzer danach: „Nebel im Vordergrund und Hintergrund, damit es tiefer wirkt“ -> vorne kräftiger (vorher 0,1) + Bodennebel
// ganz vorne über der Erde; hinten eine Nebelbank zwischen Wald und Spielfeld mit eigener Parallaxe)
const FOTO_HG_VORNE_A = 0.16, FOTO_HG_VORNE_PAR = 1.15, FOTO_HG_VORNE_BODEN_A = 0.06, FOTO_HG_VORNE_BODEN_H = 150;
// Nebelfelder IN der Spielwelt (fest an ihrer Stelle, man läuft hindurch): je abstand px ein Platz, ob dort Nebel liegt,
// entscheidet eine langsam wechselnde Dichte (mal ein Stück mit viel Nebel, mal fast keiner); Höhe y (Welt-px) über die
// ganze Bildhöhe verteilt, Größe b/h, Deckkraft a. Jedes Feld atmet (dichter/dünner) und treibt leicht; wo eine Figur
// steht, wird es dünner (teilt sich um sie: in der Mitte des Felds bis teilen weniger). Reine Anzeige.
const FOTO_HG_FELDER = {abstand: 210, y: [-90, 640], b: [420, 1050], h: [150, 320], a: [0.3, 0.75], dichteWelle: 1900,
  treiben: 22, teilen: 0.55};
const FOTO_HG_BANK_A = 0.3, FOTO_HG_BANK_PAR = 0.45;
const FOTO_HG_NACHT = 'rgba(8,22,48,.62)';         // Tönung nachts

const fotoHg = {an: null, bilder: {}, stuecke: null, per: 0, nebel: null, sichtbar: 0, himmel: null, hoehe: 0};
function fotoHgAn(){
  if(fotoHg.an === null){ let aus = false; try { aus = localStorage.getItem('monchichi.fotoHintergrund') === 'aus'; } catch(e){} fotoHg.an = !aus; }
  return fotoHg.an;
}
function fotoHgSetzen(an){
  fotoHg.an = !!an;
  try { localStorage.setItem('monchichi.fotoHintergrund', an ? 'an' : 'aus'); } catch(e){}
}
// Taste B schaltet um (wie M für den Ton), mit kurzem Hinweis oben im Bild
window.addEventListener('keydown', e => {
  if(e.code !== 'KeyB' || e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
  const el = document.activeElement; if(el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
  fotoHgSetzen(!fotoHgAn());
  testJumpMsg = fotoHgAn() ? '🌲 Foto-Look an (B)' : '🎨 Comic-Look (B)'; testJumpT = performance.now();
});
// Bild laden (einmal); null, solange es noch nicht da ist
function fotoHgBild(src){
  let B = fotoHg.bilder[src];
  if(!B){ B = fotoHg.bilder[src] = {img: new Image(), ok: false, fehler: false}; B.img.onload = () => { B.ok = true; }; B.img.onerror = () => { B.fehler = true; }; B.img.src = src; }
  return B.ok ? B.img : null;
}
// ein Stück: Bild auf Höhe h, linker Rand auf u Bildpunkten weich eingeblendet (liegt über dem Ende des vorigen),
// oberer Rand weich ausgeblendet (geht in den Nebel darüber über)
// Das Stück behält die Bildpunkte des Originals (wird erst beim Zeichnen EINMAL auf Bildschirmgröße gebracht – vorher
// wurde zweimal umgerechnet, das machte es unscharf). Rückgabe {c, w, h}: Leinwand + Größe in Spiel-Bildpunkten.
function fotoHgStueck(img, u, h, spiegel){
  const k = img.height/h, c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const q = c.getContext('2d');
  if(spiegel){ q.save(); q.translate(c.width, 0); q.scale(-1, 1); q.drawImage(img, 0, 0); q.restore(); } else q.drawImage(img, 0, 0);
  q.globalCompositeOperation = 'destination-in';
  if(u > 0){ const gr = q.createLinearGradient(0, 0, u*k, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
    q.fillStyle = gr; q.fillRect(0, 0, c.width, c.height); }
  if(h < H){ const go = q.createLinearGradient(0, 0, 0, FOTO_HG_OBEN_WEICH*k); go.addColorStop(0, 'rgba(0,0,0,0)'); go.addColorStop(1, 'rgba(0,0,0,1)'); q.fillStyle = go; q.fillRect(0, 0, c.width, c.height); }
  return {c, w: Math.round(img.width/k), h};
}
// Himmel-Farbe = Mittel der obersten Bildreihen (bei file:// nicht lesbar -> Ersatzfarbe)
function fotoHgHimmel(imgs){
  try {
    const c = document.createElement('canvas'); c.width = 32; c.height = 4; const q = c.getContext('2d'); let r = 0, g2 = 0, b = 0, n = 0;
    for(const img of imgs){ q.drawImage(img, 0, 0, img.width, img.height*0.04, 0, 0, 32, 4); const d = q.getImageData(0, 0, 32, 4).data;
      for(let i = 0; i < d.length; i += 4){ r += d[i]; g2 += d[i + 1]; b += d[i + 2]; n++; } }
    return [r, g2, b].map(v => Math.round(v/n)).join(',');
  } catch(e){ return FOTO_HG_HIMMEL_ERSATZ; }
}
// Stücke bauen, sobald alle Bilder geladen sind; false = noch nicht bereit
function fotoHgBereit(){
  if(fotoHg.stuecke) return true;
  const imgs = FOTO_HG_BILDER.map(fotoHgBild);
  if(imgs.some(b => !b)) return false;
  let x = 0;
  fotoHg.hoehe = Math.round(H*FOTO_HG_HOEHE); fotoHg.himmel = fotoHgHimmel(imgs);
  const folge = FOTO_HG_SPIEGELN ? imgs.flatMap(img => [[img, false], [img, true]]) : imgs.map(img => [img, false]);
  fotoHg.stuecke = folge.map(([img, sp]) => { const s = fotoHgStueck(img, FOTO_HG_UEBERGANG, fotoHg.hoehe, sp); s.x = x; x += s.w - FOTO_HG_UEBERGANG; return s; });
  fotoHg.per = x;   // Schleife: nach dem letzten Stück kommt wieder das erste (es blendet über das Ende des letzten)
  return true;
}
// Panorama mit Versatz off (Spiel-Bildpunkte) zeichnen: nur sichtbare Stücke, von links nach rechts (Überblendung)
function fotoHgPanorama(off){
  const per = fotoHg.per, o = Math.round((((off % per) + per) % per)*RS)/RS, liste = [];
  for(const s of fotoHg.stuecke) for(const k of [-1, 0, 1]){
    const x = s.x - o + k*per;
    if(x < W && x + s.w > 0) liste.push([x, s]);
  }
  liste.sort((a, b) => a[0] - b[0]);
  // Nebel-Himmel oben (oben etwas heller), Panorama unten bündig darauf
  const y0 = H - fotoHg.hoehe;
  if(y0 > 0){ const gr = ctx.createLinearGradient(0, 0, 0, y0 + FOTO_HG_OBEN_WEICH);
    gr.addColorStop(0, 'rgba(' + FOTO_HG_NEBEL + ',1)'); gr.addColorStop(1, 'rgba(' + fotoHg.himmel + ',1)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, y0 + FOTO_HG_OBEN_WEICH); }
  ctx.imageSmoothingQuality = 'high';
  for(const [x, s] of liste) ctx.drawImage(s.c, x, y0, s.w, s.h);
  ctx.fillStyle = 'rgba(' + fotoHg.himmel + ',' + FOTO_HG_DUNST_A + ')'; ctx.fillRect(0, 0, W, H);
  // Nebelwolke über jeder Naht (Anfang eines Stücks) – senkrecht, weich, über die ganze Höhe
  if(!fotoHg.nahtNebel){
    const c = document.createElement('canvas'); c.width = 64; c.height = 256; const q = c.getContext('2d');
    const gx = q.createLinearGradient(0, 0, 64, 0); gx.addColorStop(0, 'rgba(' + FOTO_HG_NEBEL + ',0)'); gx.addColorStop(0.5, 'rgba(' + FOTO_HG_NEBEL + ',1)'); gx.addColorStop(1, 'rgba(' + FOTO_HG_NEBEL + ',0)');
    q.fillStyle = gx; q.fillRect(0, 0, 64, 256);
    q.globalCompositeOperation = 'destination-in';
    const gy = q.createLinearGradient(0, 0, 0, 256); gy.addColorStop(0, 'rgba(0,0,0,.55)'); gy.addColorStop(0.5, 'rgba(0,0,0,1)'); gy.addColorStop(1, 'rgba(0,0,0,.8)');
    q.fillStyle = gy; q.fillRect(0, 0, 64, 256);
    fotoHg.nahtNebel = c;
  }
  ctx.save(); ctx.globalAlpha = FOTO_HG_NAHT_A;
  for(const [x, s] of liste){ const nx = x + FOTO_HG_NAHT_X*s.w/s.c.width; if(nx > -FOTO_HG_NAHT_B && nx < W + FOTO_HG_NAHT_B) ctx.drawImage(fotoHg.nahtNebel, nx - FOTO_HG_NAHT_B/2, y0, FOTO_HG_NAHT_B, s.h); }
  ctx.restore();
  fotoHg.sichtbar = liste.length;
}
// leichter Nebel VOR dem Spielfeld (aus 12-welt-zeichnen.js nach der Spielwelt): drei lockere Schwaden, reine Deko
function fotoHgVorne(){
  if(!(typeof fotoLookAktiv === 'function' && fotoLookAktiv()) || !fotoHg.nebel) return;
  const t = performance.now()/1000, breit = 1600, hoch = 300;
  ctx.save(); ctx.setTransform(RS, 0, 0, RS, 0, 0);
  fotoHgWolkenZeichnen(fotoHg.wolkenVorne || (fotoHg.wolkenVorne = fotoHgWolkenListe(FOTO_HG_WOLKEN_VORNE)), t);
  // Bodennebel ganz vorne: liegt unten über der Erde, zieht schneller als die Kamera (nah = Tiefe)
  ctx.globalAlpha = 1;
  const gb = ctx.createLinearGradient(0, H, 0, H - FOTO_HG_VORNE_BODEN_H);
  gb.addColorStop(0, 'rgba(' + FOTO_HG_NEBEL + ',' + FOTO_HG_VORNE_BODEN_A + ')'); gb.addColorStop(1, 'rgba(' + FOTO_HG_NEBEL + ',0)');
  ctx.fillStyle = gb; ctx.fillRect(0, H - FOTO_HG_VORNE_BODEN_H, W, FOTO_HG_VORNE_BODEN_H);
  fotoHgFelderZeichnen(t);
  ctx.restore();
}
// Nebelfelder in der Welt (FOTO_HG_FELDER): einmal je Level ausgewürfelt (fester Zufall nach Position)
function fotoHgFelderListe(){
  if(fotoHg.felder && fotoHg.felderFuer === solids) return fotoHg.felder;
  const E = FOTO_HG_FELDER, L = [], breite = typeof LEVEL_W === 'number' ? LEVEL_W : 4000;
  const zz = (i, k) => { const v = Math.sin(i*127.1 + k*311.7)*43758.5453; return v - Math.floor(v); };
  const z = (i, k, [a, b]) => a + zz(i, k)*(b - a);
  if(!fotoHg.wolkenBilder) fotoHgWolkenListe(FOTO_HG_WOLKEN_HINTEN);   // legt die weichen Wolken-Bilder an
  for(let i = 0, x = -400; x < breite + 400; i++, x += E.abstand){
    // Dichte wechselt langsam entlang des Levels (zwei überlagerte Wellen): 0 = fast kein Nebel, 1 = viel
    const d = 0.5 + 0.32*Math.sin(x/E.dichteWelle + 1.3) + 0.18*Math.sin(x/(E.dichteWelle*0.37) + 4.1);
    if(zz(i, 1) > d) continue;
    L.push({x: x + (zz(i, 2) - 0.5)*E.abstand, y: z(i, 3, E.y), b: z(i, 4, E.b), h: z(i, 5, E.h), a: z(i, 6, E.a)*(0.6 + 0.4*d),
            ph: zz(i, 7)*6.28, bild: fotoHg.wolkenBilder[i % 3]});
  }
  fotoHg.felderFuer = solids;
  return fotoHg.felder = L;
}
function fotoHgFelderZeichnen(t){
  const E = FOTO_HG_FELDER, L = fotoHgFelderListe(), oy = H*(1 - zoom);
  // Nebel liegt nur in der Luft: Boden/Wände (sichtbare, feste Teile) werden ausgespart (Ausschneide-Pfad, keine Zusatz-
  // Leinwand) – sonst lag ein grauer Fleck vor der Erde. Die Figuren laufen hindurch (Nebel wird vor ihnen gezeichnet).
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H);
  for(const s of solids){
    if(s.gone || s.type === 'oneway') continue;
    const x0 = (s.x - camX)*zoom, x1 = x0 + s.w*zoom; if(x1 < 0 || x0 > W) continue;
    const y0 = s.y*zoom + oy, y1 = y0 + s.h*zoom;
    ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.lineTo(x1, y0); ctx.closePath();   // gegen den Uhrzeigersinn = Loch
  }
  ctx.clip();
  for(const f of L){
    const dx = Math.sin(t*0.05 + f.ph)*E.treiben, dy = Math.sin(t*0.08 + f.ph*1.7)*E.treiben*0.4;
    const sx = (f.x + dx - f.b/2 - camX)*zoom, sb = f.b*zoom;
    if(sx > W || sx + sb < 0) continue;
    let a = f.a*(0.72 + 0.28*Math.sin(t*0.17 + f.ph*3));   // atmet
    // wo eine Figur drin steht, teilt sich der Nebel (dünner)
    for(const P of [p1, p2]){
      if(!P) continue;
      const nx = (P.x - f.x - dx)/(f.b/2), ny = (P.y - P.h*0.5 - f.y - dy)/(f.h/2), r = Math.hypot(nx, ny);
      if(r < 1) a *= 1 - E.teilen*(1 - r)*(1 - r)*(3 - 2*(1 - r));
    }
    ctx.globalAlpha = a;
    ctx.drawImage(f.bild, sx, (f.y + dy - f.h/2)*zoom + oy, sb, f.h*zoom);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
// Nebelschwade: einmal vorgezeichnet (weicher, breiter Fleck), pro Bild nur verschoben (Zeit aus der Uhr, reine Deko)
function fotoHgNebel(t){
  if(!fotoHg.nebel){
    const c = document.createElement('canvas'); c.width = 256; c.height = 64;
    const q = c.getContext('2d'); q.setTransform(1, 0, 0, 0.25, 0, 0);
    const gr = q.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(' + FOTO_HG_NEBEL + ',1)'); gr.addColorStop(1, 'rgba(' + FOTO_HG_NEBEL + ',0)');
    q.fillStyle = gr; q.fillRect(0, 0, 256, 256);
    fotoHg.nebel = c;
  }
  const gb = ctx.createLinearGradient(0, H, 0, H - FOTO_HG_BODENNEBEL_H);
  gb.addColorStop(0, 'rgba(' + FOTO_HG_NEBEL + ',' + FOTO_HG_BODENNEBEL_A + ')'); gb.addColorStop(1, 'rgba(' + FOTO_HG_NEBEL + ',0)');
  ctx.fillStyle = gb; ctx.fillRect(0, H - FOTO_HG_BODENNEBEL_H, W, FOTO_HG_BODENNEBEL_H);
  ctx.save();
  fotoHgWolkenZeichnen(fotoHg.wolkenHinten || (fotoHg.wolkenHinten = fotoHgWolkenListe(FOTO_HG_WOLKEN_HINTEN)), t);
  ctx.restore();
}
// ---------- Nebelwolken (Nutzer: „Nebel dynamischer – mal eine Wolke oben, mal eine unten“) ----------
// Statt gleichmäßiger Bänder einzelne weiche Wolken in verschiedenen Höhen, Größen und Dichten (fester Zufall), jede
// zieht mit eigenem Tempo, schwebt leicht auf und ab und wird mal dichter, mal dünner. Hinten: zwischen Wald und
// Spielfeld (Parallaxe kleiner als 1), vorne: vor dem Spielfeld (Parallaxe größer als 1, durchsichtiger). Reine Deko.
// Werte je Ebene: n Wolken, y (Bildschirm-px von–bis), b/h Größe, a Deckkraft, par Parallaxe, v Eigentempo (px/s).
const FOTO_HG_WOLKEN_HINTEN = {n: 9, saat: 31, y: [40, 700], b: [600, 1500], h: [180, 430], a: [0.12, 0.34], par: [0.15, 0.5], v: [2, 8]};
const FOTO_HG_WOLKEN_VORNE  = {n: 5, saat: 77, y: [110, 720], b: [700, 1400], h: [200, 380], a: [0.06, 0.15], par: [1.1, 1.5], v: [6, 14]};
function fotoHgWolkenListe(E){
  const r = rnd(E.saat), z = ([a, b]) => a + r()*(b - a), L = [];
  // weiche, unregelmäßige Wolken-Bilder (einmal): mehrere überlappende runde Flecken
  if(!fotoHg.wolkenBilder){
    fotoHg.wolkenBilder = [0, 1, 2].map(k => {
      const c = document.createElement('canvas'); c.width = 256; c.height = 128; const q = c.getContext('2d'), rr = rnd(500 + k);
      for(let i = 0; i < 9; i++){
        const x = 50 + rr()*156, y = 44 + rr()*40, rad = 26 + rr()*40, g = q.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, 'rgba(' + FOTO_HG_NEBEL + ',.55)'); g.addColorStop(1, 'rgba(' + FOTO_HG_NEBEL + ',0)');
        q.fillStyle = g; q.fillRect(0, 0, 256, 128);
      }
      return c;
    });
  }
  for(let i = 0; i < E.n; i++){
    // Höhe gleichmäßig über den Bereich verteilt (+ Zufall), damit oben UND unten Wolken sind
    const y = E.y[0] + (i + r())/E.n*(E.y[1] - E.y[0]);
    L.push({y, b: z(E.b), h: z(E.h), a: z(E.a), par: z(E.par), v: z(E.v), ph: r(), bild: fotoHg.wolkenBilder[i % 3]});
  }
  return L.sort((a, b) => a.par - b.par);
}
function fotoHgWolkenZeichnen(L, t){
  for(const w of L){
    const span = W + w.b, x = (((w.ph*span + t*w.v - camX*zoom*w.par) % span) + span) % span - w.b;
    const y = w.y + Math.sin(t*0.07 + w.ph*6.28)*18;
    ctx.globalAlpha = w.a*(0.7 + 0.3*Math.sin(t*0.19 + w.ph*9));
    ctx.drawImage(w.bild, x, y - w.h/2, w.b, w.h);
  }
  ctx.globalAlpha = 1;
}
// Foto-Look gerade sichtbar? Dann keine Farbfilter des Comic-Looks über dem Bild (Nutzer: „sieht nicht 1:1 so aus wie
// die Bilder“ – warmer Schimmer, Abend-Farbstich THEME.tint und grüne Vignette färbten die Fotos gelblich/dunkel)
function fotoLookAktiv(){ return !!BG_STIL && fotoHgAn() && !!fotoHg.stuecke; }
// aus drawBackground (11-hintergrund.js): true = Foto-Hintergrund gezeichnet, false = gezeichneten Stil nehmen
function fotoHgZeichnen(){
  if(!BG_STIL || !fotoHgAn() || !fotoHgBereit()) return false;
  const t = performance.now()/1000;
  ctx.save();
  ctx.setTransform(RS, 0, 0, RS, 0, 0);
  fotoHgPanorama(camX*FOTO_HG_PAR);
  fotoHgNebel(t);
  if(BG_STIL.nacht){ ctx.fillStyle = FOTO_HG_NACHT; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
  return true;
}
