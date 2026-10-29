// editor/js/00-welt-werkzeuge.js – Teil des Level-Editors für "Monchichi Koop" (Editor-Umbau).
// Welche Werkzeuge der Editor zeigt (Voreinstellung, KEINE Sperre – „Alle Werkzeuge“ zeigt jederzeit alles):
//   - GRUND_WERKZEUGE: immer sichtbar, in jeder Welt.
//   - WELT_WERKZEUGE[welt]: zusätzlich empfohlen, wenn das Level (Level-Info) in dieser Welt liegt.
//   - Werkzeuge, die im geladenen Level schon vorkommen, sind immer sichtbar (Level mischen Elemente).
// Neue Welt: eine Zeile in WELT_WERKZEUGE. Neues Element: seinen Werkzeug-Namen (editor.werkzeug) in die passende
// Welt (oder in GRUND_WERKZEUGE) eintragen – sonst sieht man es nur mit „Alle Werkzeuge“ (Test werkzeug_welten).
const GRUND_WERKZEUGE = ['ground', 'wall', 'fake', 'spike', 'coin', 'checkpoint', 'startM', 'startF', 'goal',
  'hook', 'switch', 'door', 'plate', 'move', 'erase', 'select', 'bruch', 'haft'];   // Nacht-Ausbau: Durchbruch-Wand + Haftfläche in allen Welten
const WELT_WERKZEUGE = {
  dschungel: ['crumble', 'oneway', 'wind', 'bounce', 'tele', 'wechsel', 'windrad'],
  ruinen:    ['falle', 'fels', 'lichtquelle', 'spiegel', 'kristall'],
  hoehle:    ['eis', 'band', 'dunkel', 'leucht'],
  wasser:    ['water', 'current', 'waterlevel'],
  vulkan:    ['lava', 'lavapegel', 'presse'],
};
// Boss-Werkzeuge: nur in Boss-Leveln (= Level, in dem schon ein Boss/eine Arena liegt) oder mit „Alle Werkzeuge“
const BOSS_WERKZEUGE = ['boss', 'arena', 'bossplatz'];
