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
    kante: 0.5,                  // Deckkraft der dunklen Kontur an freien Rändern (0 = aus)
    kanteBreite: 2.5,            // Breite der Kontur in Spiel-Pixeln
    kanteFarbe: '26,18,12',      // Farbe der Kontur (r,g,b)
    licht: 0.3,                  // Randlicht oben auf Wänden/Plattformen (weiß, Deckkraft)
    innenSchatten: 0.22,         // Schatten unter der Graskante / Erde nach unten dunkler
    bodenSchatten: 0.28,         // weicher Schatten unter schwebenden Stücken (Deckkraft am Rand)
    bodenSchattenHoehe: 14,      // Höhe dieses Schattens in Spiel-Pixeln
    dunst: {col: '#eef4ee', a: 0.2},   // Luftperspektive der Hintergrund-Ebenen (fern = volle Stärke)
    hgSatt: 1,                   // Sättigung der Hintergrund-Ebenen (1 = unverändert)
    hgHell: 1,                   // Helligkeit der Hintergrund-Ebenen (1 = unverändert)
  },
  welt: {
    dschungel: {dunst: {col: '#e8f4f0', a: 0.34}, hgSatt: 1.0, hgHell: 1.05, kanteFarbe: '24,30,14'},
    ruinen:    {dunst: {col: '#f8f0de', a: 0.34}, hgSatt: 0.95, hgHell: 1.05, kanteFarbe: '52,32,16'},
    wasser:    {dunst: {col: '#e8f7f6', a: 0.3}, hgSatt: 1.0, hgHell: 1.04, kanteFarbe: '20,40,44'},
    hoehle:    {dunst: {col: '#120e24', a: 0.4}, hgSatt: 0.8, hgHell: 0.8, kanteFarbe: '6,4,14', kante: 0.7, licht: 0.4},
    vulkan:    {dunst: {col: '#26100e', a: 0.28}, hgSatt: 0.9, hgHell: 0.85, kanteFarbe: '8,2,2', kante: 0.7, licht: 0.38},
  },
  zeit: {
    morgen: {},
    mittag: {},
    abend:  {dunst: {col: '#9a6a8c', a: 0.22}, hgHell: 0.95},
    nacht:  {dunst: {col: '#0c1430', a: 0.3}, hgHell: 0.85, kante: 0.65, licht: 0.22},
  },
  paar: {
    'hoehle@nacht': {dunst: {col: '#0a0818', a: 0.34}},
    'vulkan@abend': {dunst: {col: '#2a0c1c', a: 0.3}},
    'vulkan@nacht': {dunst: {col: '#100406', a: 0.34}},
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
  const D = Object.assign({}, DESIGN_LOOK.basis, DESIGN_LOOK.welt[welt], DESIGN_LOOK.zeit[zeit] || {}, DESIGN_LOOK.paar[welt + '@' + zeit] || {});
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
