# Ordner `levels/`

1. Jede Welt hat einen eigenen Ordner: `dschungel/`, `ruinen/`, `hoehle/`, `wasser/` (noch leer), `vulkan/`.
2. Darin heißt jedes Level `<Nummer>-<Titel>.json`, z. B. `vulkan/03-feuerberg.json`; Bosse heißen `boss-<Name>.json`.
3. Die Nummer wird beim Anlegen vergeben und bleibt; die Reihenfolge im Spiel steht in `worlds.json`.
4. `worlds.json` = Welten mit ihren Leveln und dem Boss (Pfade ab `levels/`), `levels.json` = Namen/Titel aller Level.
5. `editor-format/` = dieselben Level im Speicherformat des Editors, mit genau denselben Unterordnern und Namen.
6. `test/` = kleine Testlevel für einzelne Elemente (öffnen mit `index.html?testlevel=<name>`), gehören zu keiner Welt.
7. `archiv/` = alte Entwürfe, die nicht im Spiel vorkommen (z. B. der alte Entwurf von Ruinen 1).
7a. `partner/` = Begleitdateien für den Computer-Partner (Testmodus), gleiche Unterordner wie die Level.
8. „☁ Auf GitHub speichern“ im Editor legt neue Level automatisch im Ordner ihrer Welt an (Welt aus der Level-Info).
9. Früher lagen alle Level flach hier (`level-1.json` …); die Liste alt -> neu steht in `js/01a-level-umzug.js`
   und in `WELTEN.md`. Alte Spielstände werden beim Laden automatisch auf die neuen Namen umgeschrieben.
10. Nichts von Hand umbenennen: Spielstände merken sich Level über den Dateinamen.
