// elemente/00-register.js – Element-Register von "Monchichi Koop" (Ausbau 2).
// EIN Eintrag pro Spiel-Element mit allem, was dazugehört: Daten (Feld im Spiel-Format), Editor-Werkzeug
// (Knopf, Zeichnen, Export) und Spiel (Laden, Zeichnen, Logik). Die Dateien in elemente/ lädt das Spiel
// (index.html) UND der Editor (editor/index.html) – jede Seite benutzt nur ihren Teil. Klassische Skripte ohne Build.
// Beim Laden selbst darf eine Element-Datei nichts vom Spiel oder Editor benutzen (nur Funktionen definieren);
// alles andere (ctx, camX, TILE …) erst in den Funktionen, die Spiel bzw. Editor später aufrufen.
//
// Aufbau eines Eintrags (Beispiele: sprungpilz.js = Punkt-Element, aufwind.js = Kachel-Element):
//   id, name, feld          – Name im Spiel-Format (z. B. 'bouncers')
//   editor: { werkzeug      – data-tool des Knopfs
//             gruppe, vor   – Werkzeug-Gruppe (gelaende, gefahren, logik, bewegung, sammeln, marken), Knopf davor einsortieren
//             titel, farbe  – Tooltip und Farbfeld des Knopfs
//             art           – 'punkt' (Liste {c,r} pro Kästchen) oder 'kachel' (Kästchen-Sorte im Raster)
//             ziehbar       – mit gedrückter Maus malbar
//             zeichnen(ctx, c, r, TILE)            – Editor-Bild eines Kästchens/Punkts
//             exportieren(liste, TILE, mergeRects) – Punkte bzw. Kästchen [{c,r}] -> Spiel-Format }
//   spiel:  { laden(daten)                         – Level-Daten übernehmen (setzt die Spiel-Liste)
//             zeichnen()                           – in der Welt zeichnen (12-welt-zeichnen.js)
//             nachBewegung(figur, warAmBoden, fallVy) – nach dem Bewegen einer Figur (08-figur-physik-seil.js) }
// Neue Elemente: Datei hier anlegen und in index.html + editor/index.html in die Lade-Liste eintragen
// (Checkliste in CLAUDE.md).
const ELEMENTE = [];
function elementRegistrieren(def){ ELEMENTE.push(def); return def; }
const elementNachWerkzeug = werkzeug => ELEMENTE.find(E => E.editor && E.editor.werkzeug === werkzeug) || null;
