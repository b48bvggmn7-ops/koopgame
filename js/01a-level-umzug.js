// js/01a-level-umzug.js – Level-Ordner nach Welten (Editor-Umbau, Teil I).
// Früher lagen alle Level flach in levels/ (level-1.json …), jetzt in levels/<welt>/<nr>-<titel>.json (Bosse:
// <welt>/boss-<name>.json, alter Entwurf: archiv/). Spielstände (Freischaltungen, Geschafft, Statistik) und der
// Editor-Arbeitsstand merken sich Level über den Dateinamen – mit dieser Tabelle werden alte Namen beim Laden auf die
// neuen umgeschrieben (js/24-startmenue.js: migrateSave; editor/js/01-zustand.js: load). Die Tabelle wird nur ergänzt,
// nie gekürzt (alte Spielstände können lange liegen). Wird von Spiel UND Editor geladen.
// Die Nummer im Dateinamen wird beim Anlegen vergeben und bleibt (Nutzerentscheidung); die Reihenfolge im Spiel kommt
// aus levels/worlds.json.
const LEVEL_UMZUG = {
  "level-1.json": "dschungel/01-dschungel.json",
  "level-2.json": "dschungel/02-baumkronen.json",
  "level-7.json": "dschungel/03-lianenschlucht.json",
  "level-8.json": "dschungel/04-gluehwald.json",
  "boss-1.json": "dschungel/boss-bruno.json",
  "level-3.json": "ruinen/01-ruinen.json",
  "level-4.json": "ruinen/02-mondnacht.json",
  "level-9.json": "ruinen/03-fallengang.json",
  "level-10.json": "ruinen/04-sonnentempel.json",
  "level-11.json": "ruinen/05-felsenflucht.json",
  "level-5.json": "hoehle/01-kristallhoehle.json",
  "level-12.json": "hoehle/02-tropfsteingang.json",
  "level-13.json": "hoehle/03-eisgrotte.json",
  "level-14.json": "hoehle/04-leuchtgrotte.json",
  "level-15.json": "hoehle/05-foerderwerk.json",
  "level-16.json": "hoehle/06-tiefenschlund.json",
  "level-17.json": "vulkan/01-glutpfad.json",
  "level-18.json": "vulkan/02-aschefeld.json",
  "level-6.json": "vulkan/03-feuerberg.json",
  "level-19.json": "vulkan/04-magmakammer.json",
  "level-20.json": "vulkan/05-schlackewerk.json",
  "level-21.json": "vulkan/06-feuerschlund.json",
  "level-22.json": "vulkan/07-kraterherz.json",
  "level-3-alter-entwurf.json": "archiv/level-3-alter-entwurf.json"
};
// alter Dateiname -> neuer (unbekannte Namen bleiben, wie sie sind)
function levelNeuerName(datei){ return LEVEL_UMZUG[datei] || datei; }
// Pfad für fetch: jeder Teil einzeln kodiert (der Schrägstrich zwischen Welt und Datei bleibt ein Schrägstrich)
function levelPfadUrl(datei){ return String(datei).split('/').map(encodeURIComponent).join('/'); }
