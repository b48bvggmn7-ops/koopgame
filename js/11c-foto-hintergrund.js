// 11c-foto-hintergrund.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Foto-Hintergrund (Nutzerwunsch 04.11.: fotorealistischer Nebelwald statt gezeichnetem Dschungel) ----------
// Statt des gezeichneten Hintergrunds aus 11b zeigt das Spiel die Fotos aus assets/hintergrund/ als Ebenen:
//  - hinten ein langes Wald-Panorama (Fotos weich ineinander überblendet, wiederholt sich ohne Naht),
//  - davor ziehende Nebelschwaden (gezeichnet, verbinden die Fotos zu einer Szene),
//  - vorne dunkles Unterholz (untere Fotostreifen, oben weich ausgeblendet, bewegt sich schneller = Tiefe).
// Gilt für alle Level mit neuem Hintergrund-Stil (BG_STIL, also die Dschungel-Welt); nachts dunkelblau getönt.
// Abschaltbar: Taste B oder Optionen → „Foto-Hintergrund“ (localStorage 'monchichi.fotoHintergrund' = 'aus'). Solange die Fotos
// noch laden (oder fehlen), bleibt der gezeichnete Hintergrund. Ganz entfernen: diese Datei + Eintrag in index.html.
// Speicher: beide Ebenen zusammen rund 10 MB (Chrome-Budget je Bild ~32 MB, siehe CLAUDE.md).
const FOTO_HG_FERN = ['assets/hintergrund/wald-3.jpg', 'assets/hintergrund/wald-4.jpg', 'assets/hintergrund/wald-2.jpg'];
const FOTO_HG_NAH = ['assets/hintergrund/wald-2.jpg', 'assets/hintergrund/wald-4.jpg', 'assets/hintergrund/wald-3.jpg'];
const FOTO_HG_UEBERGANG = 0.18;     // Überblendung zweier Fotos (Anteil der Fotobreite)
const FOTO_HG_PAR_FERN = 0.1, FOTO_HG_PAR_NAH = 0.4;   // Parallaxe: Anteil der Kamerabewegung
const FOTO_HG_NAH_VON = 0.62;       // Unterholz = Foto ab diesem Höhenanteil bis unten
const FOTO_HG_NAH_HOEHE = 280;      // Unterholz-Ebene so hoch (Spiel-Bildpunkte), unten bündig
const FOTO_HG_NAH_DUNKEL = 0.45;    // Unterholz abdunkeln (näher = dunkler, wie im Nebel)
const FOTO_HG_TOENUNG = 'rgba(150,172,160,.16)';   // leichte grau-grüne Nebel-Tönung über den Fotos
const FOTO_HG_NEBEL = '232,238,234', FOTO_HG_NEBEL_A = 0.22;   // Nebelschwaden: Farbe, Deckkraft
const FOTO_HG_NACHT = 'rgba(8,22,48,.62)';         // Tönung nachts
const FOTO_HG_SCHAERFE_MAX = 1.5;   // Ebenen höchstens in 1,5-facher Spielauflösung vorzeichnen (Speicher)

const fotoHg = {an: null, bilder: {}, fern: null, nah: null, sc: 0, nebel: null};
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
  testJumpMsg = fotoHgAn() ? '🌲 Foto-Hintergrund an (B)' : '🎨 Gezeichneter Hintergrund (B)'; testJumpT = performance.now();
});
// Foto laden (einmal); null, solange es noch nicht da ist
function fotoHgBild(src){
  let B = fotoHg.bilder[src];
  if(!B){ B = fotoHg.bilder[src] = {img: new Image(), ok: false, fehler: false}; B.img.onload = () => { B.ok = true; }; B.img.onerror = () => { B.fehler = true; }; B.img.src = src; }
  return B.ok ? B.img : null;
}
// Panorama aus mehreren Fotos: je Foto der Höhenbereich [von, 1], auf Höhe h skaliert, Ränder weich überblendet,
// nahtlos wiederholbar (der Anfang blendet über das Ende des letzten Fotos)
function fotoHgPanorama(imgs, h, von, ausblendenOben, dunkel){
  const teile = imgs.map(img => { const sh = img.height*(1 - von); return {img, sy: img.height*von, sh, w: Math.round(img.width*h/sh)}; });
  const ueb = teile.map(t => Math.round(t.w*FOTO_HG_UEBERGANG));
  let per = 0; teile.forEach((t, i) => { t.x = per; per += t.w - ueb[i]; });
  const c = document.createElement('canvas'); c.width = per; c.height = h;
  const q = c.getContext('2d');
  const stueck = (t, u) => {   // Foto mit weich eingeblendetem linkem Rand
    const s = document.createElement('canvas'); s.width = t.w; s.height = h;
    const sq = s.getContext('2d'); sq.drawImage(t.img, 0, t.sy, t.img.width, t.sh, 0, 0, t.w, h);
    sq.globalCompositeOperation = 'destination-in';
    const gr = sq.createLinearGradient(0, 0, u, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
    sq.fillStyle = gr; sq.fillRect(0, 0, t.w, h);
    return s;
  };
  const letzte = teile[teile.length - 1];
  q.drawImage(stueck(letzte, ueb[teile.length - 1]), letzte.x - per, 0);   // Ende des letzten Fotos unter den Anfang
  teile.forEach((t, i) => q.drawImage(stueck(t, ueb[(i + teile.length - 1) % teile.length]), t.x, 0));
  q.globalCompositeOperation = 'source-atop';
  q.fillStyle = FOTO_HG_TOENUNG; q.fillRect(0, 0, per, h);
  if(dunkel){ q.fillStyle = 'rgba(10,20,14,' + dunkel + ')'; q.fillRect(0, 0, per, h); }
  if(ausblendenOben){
    q.globalCompositeOperation = 'destination-in';
    const gr = q.createLinearGradient(0, 0, 0, h*ausblendenOben); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
    q.fillStyle = gr; q.fillRect(0, 0, per, h);
  }
  return c;
}
// Ebenen bauen, sobald alle Fotos geladen sind (bei geänderter Bildschärfe RS neu); false = noch nicht bereit
function fotoHgBereit(){
  const fern = FOTO_HG_FERN.map(fotoHgBild), nah = FOTO_HG_NAH.map(fotoHgBild);
  if(fern.some(b => !b) || nah.some(b => !b)) return false;
  const sc = Math.min(Math.max(RS, 1), FOTO_HG_SCHAERFE_MAX);
  if(fotoHg.sc !== sc){
    fotoHg.sc = sc;
    fotoHg.fern = fotoHgPanorama(fern, Math.round(H*sc), 0, 0, 0);
    fotoHg.nah = fotoHgPanorama(nah, Math.round(FOTO_HG_NAH_HOEHE*sc), FOTO_HG_NAH_VON, 0.55, FOTO_HG_NAH_DUNKEL);
  }
  return true;
}
// Ebene wiederholt zeichnen (Versatz off in Spiel-Bildpunkten), unten bei y
function fotoHgEbene(c, off, y){
  const k = 1/fotoHg.sc, per = c.width*k, h = c.height*k;
  const x0 = -Math.round((((off % per) + per) % per)*RS)/RS;
  for(let x = x0; x < W; x += per) ctx.drawImage(c, x, y, per + 1/RS, h);
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
  const breit = 1100, hoch = 300;
  ctx.save();
  for(let i = 0; i < 4; i++){
    const y = 260 + i*95, x = ((t*(6 + i*2) - camX*(0.15 + i*0.05) + i*520) % (W + breit) + (W + breit)) % (W + breit) - breit;
    ctx.globalAlpha = FOTO_HG_NEBEL_A*(0.8 + 0.2*Math.sin(t*0.3 + i));
    ctx.drawImage(fotoHg.nebel, x, y - hoch/2, breit, hoch);
  }
  ctx.restore();
}
// aus drawBackground (11-hintergrund.js): true = Foto-Hintergrund gezeichnet, false = gezeichneten Stil nehmen
function fotoHgZeichnen(){
  if(!BG_STIL || !fotoHgAn() || !fotoHgBereit()) return false;
  const t = performance.now()/1000;
  ctx.save();
  ctx.setTransform(RS, 0, 0, RS, 0, 0);
  fotoHgEbene(fotoHg.fern, camX*FOTO_HG_PAR_FERN, 0);
  fotoHgNebel(t);
  fotoHgEbene(fotoHg.nah, camX*FOTO_HG_PAR_NAH, H - FOTO_HG_NAH_HOEHE);
  if(BG_STIL.nacht){ ctx.fillStyle = FOTO_HG_NACHT; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
  return true;
}
