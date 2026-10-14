// 10b-design-look.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Design-Politur B: zentrale Look-Tabelle je Welt und Tageszeit ----------
// Hier stehen alle Werte, die das Spielfeld vom Hintergrund trennen: dunkle Kontur an den freien Rändern von Boden,
// Wand und Plattform, heller Randlicht-Streifen oben, Tiefe (Schatten unter der Graskante, weicher Schatten unter
// schwebenden Stücken) und die Luftperspektive des Hintergrunds (je weiter weg, desto mehr Dunst in Dunst-Farbe,
// dazu Sättigung/Helligkeit der Hintergrund-Ebenen). Reihenfolge: basis <- welt <- zeit <- paar ('welt@zeit').
// Nutzerwunsch: Trennung „klar, aber weich“; nachts dunkler, aber lesbar; Tageszeiten bleiben unterscheidbar.
const DESIGN_LOOK = {
  basis: {
    kante: 0.8,                  // Deckkraft der dunklen Kontur an freien Rändern (0 = aus; Nutzerwunsch: deutlich sichtbar)
    kanteBreite: 3,              // Breite der Kontur in Spiel-Pixeln
    kanteFarbe: '26,18,12',      // Farbe der Kontur (r,g,b)
    licht: 0.3,                  // Randlicht oben auf Wänden/Plattformen (weiß, Deckkraft)
    innenSchatten: 0.22,         // Schatten unter der Graskante / Erde an einer freien Unterkante dunkler
    bodenSchatten: 0.28,         // weicher Schatten unter schwebenden Stücken (Deckkraft am Rand)
    bodenSchattenHoehe: 14,      // Höhe dieses Schattens in Spiel-Pixeln
    dunst: {col: '#fff0d6', a: 0.2},   // Luftperspektive der Hintergrund-Ebenen (fern = volle Stärke), warm
    hgSatt: 1,                   // Sättigung der Hintergrund-Ebenen (1 = unverändert)
    hgHell: 1,                   // Helligkeit der Hintergrund-Ebenen (1 = unverändert)
    // Gemütlichkeit (Design-Politur 2, Nutzerwunsch „cozy, warm, Wohlfühl-Atmosphäre“):
    gegenlicht: null,            // warmes Licht hinter den Bäumen: {x, y (Anteil Bildbreite/-höhe), r (Anteil Breite), col, a}
    strahlen: null,              // Lichtstrahlen von oben: {n, col, a}
    pollen: null,                // Farbe der schwebenden Lichtteilchen (r,g,b) – sonst die des Themas
    waerme: {col: '255,190,110', a: 0.06},   // warmer Schimmer über allem
    vignette: '60,30,10',        // Farbe der weichen Vignette (warmes Braun)
    goldHauch: null,             // {col, a}: goldener Hauch über allen Hintergrund-Ebenen (beim Aufbau)
    nahTiefe: null,              // {col, a}: nahe Hintergrund-Ebenen satter/dunkler (beim Aufbau)
    nebel: null,                 // Farbe der Nebelbänder im Hintergrund (r,g,b) – sonst die des Themas
  },
  welt: {
    dschungel: {dunst: {col: '#ffe9c2', a: 0.16}, hgSatt: 1, hgHell: 1.0, kanteFarbe: '30,24,10',
                gegenlicht: {x: 0.7, y: 0.32, r: 0.6, col: '255,206,120', a: 0.24}, strahlen: {n: 4, col: '255,228,160', a: 0.22},
                pollen: '255,236,170', waerme: {col: '255,196,120', a: 0.08},
                goldHauch: {col: '#ffb24a', a: 0.1}, nahTiefe: {col: '#24401a', a: 0.6}, nebel: '255,232,196'},
    ruinen:    {dunst: {col: '#ffe2b0', a: 0.18}, hgSatt: 1, hgHell: 1.04, kanteFarbe: '52,32,16',
                gegenlicht: {x: 0.75, y: 0.25, r: 0.6, col: '255,196,110', a: 0.26}, strahlen: {n: 4, col: '255,224,150', a: 0.24},
                pollen: '255,230,170', waerme: {col: '255,190,110', a: 0.09},
                goldHauch: {col: '#ffa840', a: 0.1}, nahTiefe: {col: '#3e3418', a: 0.5}, nebel: '255,228,186'},
    wasser:    {dunst: {col: '#f6f3dc', a: 0.18}, hgSatt: 1.0, hgHell: 1.04, kanteFarbe: '20,40,44',
                gegenlicht: {x: 0.7, y: 0.3, r: 0.75, col: '255,226,170', a: 0.35}, strahlen: {n: 3, col: '255,240,190', a: 0.18}, pollen: '255,244,200',
                goldHauch: {col: '#ffc060', a: 0.07}, nahTiefe: {col: '#1f4a40', a: 0.45}, nebel: '250,240,215'},
    hoehle:    {dunst: {col: '#1a1228', a: 0.36}, hgSatt: 0.85, hgHell: 0.85, kanteFarbe: '6,4,14', kante: 0.9, licht: 0.4,
                gegenlicht: {x: 0.5, y: 0.75, r: 0.7, col: '255,170,100', a: 0.16}, pollen: '255,210,150', waerme: {col: '255,170,110', a: 0.05}},
    vulkan:    {dunst: {col: '#2a120c', a: 0.28}, hgSatt: 0.95, hgHell: 0.9, kanteFarbe: '8,2,2', kante: 0.9, licht: 0.38,
                gegenlicht: {x: 0.6, y: 0.35, r: 0.5, col: '255,130,60', a: 0.1}},
  },
  zeit: {
    morgen: {},
    mittag: {},
    abend:  {dunst: {col: '#ffb47e', a: 0.2}, hgHell: 0.97, gegenlicht: {x: 0.55, y: 0.62, r: 0.7, col: '255,150,90', a: 0.3},
             strahlen: {n: 4, col: '255,170,110', a: 0.22}, pollen: '255,200,120', waerme: {col: '255,150,90', a: 0.1},
             goldHauch: {col: '#ff8a40', a: 0.1}, nebel: '255,190,150', nahTiefe: {col: '#2e1430', a: 0.75}},
    nacht:  {dunst: {col: '#141c40', a: 0.3}, hgHell: 0.85, kante: 0.9, licht: 0.22,
             gegenlicht: {x: 0.75, y: 0.2, r: 0.55, col: '200,215,255', a: 0.14}, strahlen: null, pollen: '255,220,130',
             waerme: {col: '255,190,120', a: 0.035}, vignette: '10,8,30', nebel: '50,60,100', goldHauch: null, nahTiefe: {col: '#0a1024', a: 0.15}},
  },
  paar: {
    'hoehle@nacht': {dunst: {col: '#0a0818', a: 0.34}},
    'vulkan@abend': {dunst: {col: '#2a0c1c', a: 0.3}},
    'vulkan@nacht': {dunst: {col: '#100406', a: 0.34}, gegenlicht: {x: 0.6, y: 0.35, r: 0.5, col: '255,100,40', a: 0.08}},
  },
};
// Welt und Tageszeit eines Look-Namens (themeName, z. B. 'ruinen@nacht', 'dschungel', altes Thema 'abend')
function designWeltZeit(name){
  const [vorne] = String(name || 'dschungel').split('~');
  let [welt, zeit] = vorne.split('@');
  if(welt === 'abend' || welt === 'nacht'){ zeit = zeit || welt; welt = 'dschungel'; }   // alte Themen
  if(!DESIGN_LOOK.welt[welt]) welt = 'dschungel';
  if(!zeit) zeit = (typeof WORLD_LOOKS !== 'undefined' && WORLD_LOOKS[welt] && WORLD_LOOKS[welt].time) || 'mittag';
  return {welt, zeit};
}
const designCache = {};
function designFuer(name){
  if(designCache[name]) return designCache[name];
  const {welt, zeit} = designWeltZeit(name);
  // Höhle hat keinen Himmel: nur die Nacht wirkt (dunkler); Vulkan nimmt von Abend/Nacht nur Dunst/Kontur (eigener Feuer-Himmel)
  let Z = DESIGN_LOOK.zeit[zeit] || {};
  if(welt === 'hoehle' && zeit !== 'nacht') Z = {};
  if(welt === 'vulkan') Z = {dunst: Z.dunst, kante: Z.kante, licht: Z.licht, hgHell: Z.hgHell};
  for(const k in Z) if(Z[k] === undefined) delete Z[k];
  const D = Object.assign({}, DESIGN_LOOK.basis, DESIGN_LOOK.welt[welt], Z, DESIGN_LOOK.paar[welt + '@' + zeit] || {});
  D.welt = welt; D.zeit = zeit;
  return designCache[name] = D;
}
// Werte des gerade aktiven Looks
function designLook(){ return designFuer(typeof themeName !== 'undefined' ? themeName : 'dschungel'); }
// Dunst-Anteil einer Hintergrund-Ebene nach ihrer Tiefe (Parallaxe: klein = weit weg = mehr Dunst)
function designTiefe(par){ return Math.max(0.45, Math.min(1, 1 - par*1.2)); }

// ---------- Design-Politur C: gemeinsames Glanz-Muster für Spiel-Elemente ----------
// Drei Bausteine, die alle Elemente gleich benutzen (nur Zeichnen, Zeit aus performance.now – ändert keinen Spielzustand):
//   glanzSchatten  – weicher Kontaktschatten am Boden (Tiefe)
//   glanzFunkeln   – kurzer Lichtstern auf Metall/Edelstein, je Element zeitversetzt (seed), selten und dezent
//   glanzBand      – schräger Lichtstreifen, der langsam über eine Fläche wandert (Aufrufer setzt vorher clip)
const GLANZ = {
  schatten: 0.3,          // Deckkraft des Kontaktschattens in der Mitte
  funkelPeriode: 3400,    // ms zwischen zwei Funkeln desselben Elements
  funkelDauer: 0.11,      // Anteil der Periode, in dem es funkelt
  bandPeriode: 4600,      // ms für einen Durchgang des Glanzstreifens
  bandA: 0.32,            // Deckkraft des Glanzstreifens
};
function glanzSchatten(x, y, rx, ry, a){
  const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
  g.addColorStop(0, `rgba(20,14,8,${a ?? GLANZ.schatten})`); g.addColorStop(1, 'rgba(20,14,8,0)');
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry/rx); ctx.translate(-x, -y);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, Math.PI*2); ctx.fill(); ctx.restore();
}
function glanzFunkeln(x, y, r, seed){
  const P = GLANZ.funkelPeriode, t = (((performance.now() + (seed || 0)*977) % P) + P) % P / P;
  if(t > GLANZ.funkelDauer) return;
  const k = Math.sin(Math.PI*t/GLANZ.funkelDauer), s = r*(0.4 + 0.6*k);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.85*k;
  ctx.fillStyle = '#fffbea';
  ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, s*0.22, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
function glanzBand(x, y, w, h, seed){
  const P = GLANZ.bandPeriode, t = (((performance.now() + (seed || 0)*613) % P) + P) % P / P;
  const bx = x - w*0.4 + t*w*1.8, b = Math.max(6, w*0.18);
  const g = ctx.createLinearGradient(bx - b, 0, bx + b, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${GLANZ.bandA})`); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.save(); ctx.fillStyle = g; ctx.beginPath();
  ctx.moveTo(bx - b + h*0.4, y); ctx.lineTo(bx + b + h*0.4, y); ctx.lineTo(bx + b - h*0.4, y + h); ctx.lineTo(bx - b - h*0.4, y + h); ctx.closePath();
  ctx.fill(); ctx.restore();
}

// ---------- Design-Politur 2: Gemütlichkeit (warmes Gegenlicht, Lichtstrahlen, Pollen, warme Vignette) ----------
// Warmes Gegenlicht hinter den Bäumen: nach den Hintergrund-Ebenen, vor dem Spielfeld (Bildschirm-Koordinaten).
// Der Verlauf hängt nur vom Look ab -> einmal je Look erzeugt.
let gegenlichtCache = {key: null, g: null};
function gemuetlichGegenlicht(){
  const D = designLook(), L = D.gegenlicht; if(!L || !L.a) return;
  const key = themeName;
  if(gegenlichtCache.key !== key){
    const x = W*L.x, y = H*L.y, r = W*L.r, g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${L.col},${L.a})`); g.addColorStop(0.35, `rgba(${L.col},${(L.a*0.45).toFixed(3)})`); g.addColorStop(1, `rgba(${L.col},0)`);
    gegenlichtCache = {key, g};
  }
  ctx.fillStyle = gegenlichtCache.g; ctx.fillRect(0, 0, W, H);   // normales Überblenden (billiger als 'screen')
}
// weiche Lichtstrahlen von oben (in Welt-Zoom, hinter dem Spielfeld), wiegen sich ganz langsam
function gemuetlichStrahlen(){
  const S = designLook().strahlen; if(!S || !S.n) return;
  const t = performance.now()*0.00012;
  ctx.save();
  for(let i = 0; i < S.n; i++){
    const basis = ((i*360 + 140 - camX*0.35) % (VW + 600) + VW + 600) % (VW + 600) - 200;
    const neig = 160 + Math.sin(t + i*1.7)*40, breit = 70 + (i % 2)*50, a = S.a*(0.7 + 0.3*Math.sin(t*1.3 + i));
    const g = ctx.createLinearGradient(basis, -SKY_ROOM, basis - neig*0.5, H);
    g.addColorStop(0, `rgba(${S.col},${a.toFixed(3)})`); g.addColorStop(0.6, `rgba(${S.col},${(a*0.35).toFixed(3)})`); g.addColorStop(1, `rgba(${S.col},0)`);
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(basis, -SKY_ROOM); ctx.lineTo(basis + breit, -SKY_ROOM); ctx.lineTo(basis + breit - neig, H); ctx.lineTo(basis - neig - breit*0.6, H); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// Himmel einmal beim Aufbau goldener machen: warmes Leuchten um das Gegenlicht und zum Horizont hin (kostet pro Bild nichts)
function gemuetlichHimmel(g){
  const L = designLook().gegenlicht; if(!L || !L.a) return;
  const x = W*L.x, y = H*L.y, r = W*L.r;
  const rg = g.createRadialGradient(x, y, 0, x, y, r);
  rg.addColorStop(0, `rgba(${L.col},${Math.min(0.85, L.a*1.6).toFixed(3)})`); rg.addColorStop(0.4, `rgba(${L.col},${(L.a*0.6).toFixed(3)})`); rg.addColorStop(1, `rgba(${L.col},0)`);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  const hg = g.createLinearGradient(0, H*0.35, 0, H);
  hg.addColorStop(0, `rgba(${L.col},0)`); hg.addColorStop(1, `rgba(${L.col},${(L.a*0.7).toFixed(3)})`);
  g.fillStyle = hg; g.fillRect(0, 0, W, H);
}
