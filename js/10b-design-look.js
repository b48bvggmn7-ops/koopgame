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
    dschungel: {dunst: {col: '#e8f4f0', a: 0.5}, hgSatt: 0.85, hgHell: 1.1, kanteFarbe: '24,30,14'},
    ruinen:    {dunst: {col: '#f8f0de', a: 0.5}, hgSatt: 0.85, hgHell: 1.1, kanteFarbe: '52,32,16'},
    wasser:    {dunst: {col: '#e8f7f6', a: 0.38}, hgSatt: 0.88, hgHell: 1.08, kanteFarbe: '20,40,44'},
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
function designTiefe(par){ return Math.max(0.6, Math.min(1, 1 - par)); }
