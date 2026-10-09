# Monchichi Koop – Hinweise für Claude Code

## Wer und was
- Der Nutzer ist **kein Programmierer**. Antworte auf **Deutsch**, kurz und verständlich, ohne Fachchinesisch.
  Erkläre nach jeder Änderung in 2–3 Sätzen, was sich für ihn im Spiel ändert und wie er es testet.
- Spiel: 2D-Koop-Jump'n'Run für zwei Spieler an einem Gerät (Couch-Koop, Tastatur + PS4-Controller),
  läuft im Browser. Ziel: Vollbild 16:9. Spieler 1 = Affe (Haken/Seil), Spielerin 2 = pinkes Schweinchen (Schirm).
- **FEATURES.md** beschreibt alles, was Spiel und Editor können. Das ist die Wahrheit über das gewünschte Verhalten.

## Arbeitsregeln (wichtig!)
0. **Ausbau-Schritte:** Vor jedem Ausbau-Schritt `AUSBAU-REGELWERK.md` und `AUSBAU-VISION.md` lesen und befolgen.
1. **Vor und nach jeder Änderung die Tests laufen lassen:** `python tests/run_tests.py`
   (einmalig vorher: `pip install playwright && playwright install chromium`).
   Nur committen, wenn alle Tests grün sind. Für jede neue Funktion und jeden behobenen Fehler einen Test
   in `tests/run_tests.py` ergänzen.
2. **Nur das ändern, was der Nutzer verlangt.** Kein „Aufräumen nebenbei“, keine stillen Verhaltensänderungen.
   Wenn eine Anfrage mehrdeutig ist oder eine bestehende Funktion beeinflusst, kurz nachfragen.
3. **FEATURES.md pflegen:** Jede Verhaltensänderung dort eintragen. Nichts entfernen, ohne den Nutzer zu fragen.
4. **Kleine Schritte:** pro Wunsch ein Commit mit kurzer deutscher Beschreibung.
5. Wenn der Nutzer mit etwas unzufrieden ist: lieber auf den letzten guten Stand zurück (git) als lange herumprobieren.
6. **Vor dem Arbeiten `main` holen** (`git fetch origin main` + auf den neuesten Stand bringen): Der Nutzer speichert
   Levels auch direkt aus dem Editor auf GitHub („☁ Auf GitHub speichern“ = eigene Commits auf `main`).
7. **Direkt in `main` übernehmen:** Sind alle Tests grün, die Änderung immer sofort committen und nach `main` pushen
   (vom Nutzer ausdrücklich so gewünscht), damit sie automatisch online geht. Bei roten Tests nichts nach `main`.

## Aufbau
- `index.html` – Spielseite (HTML/CSS) und lädt die Skripte in `js/` **in fester Reihenfolge**.
- `js/00-…` bis `js/99-start.js` – das Spiel. **Klassische `<script>`-Dateien ohne Module und ohne Build-Schritt**:
  alle teilen sich einen gemeinsamen Gültigkeitsbereich (z. B. `p1`, `solids`, `KEYS` sind überall sichtbar).
  Neue Dateien in `index.html` in die Lade-Liste (kleines Skript am Ende, hängt `?v=<Zeit>` gegen alte Browser-Kopien an)
  an der passenden Stelle eintragen. Keine globalen Namen verwenden, die es im
  Browser schon gibt (z. B. `top`, `name`, `status`, `parent`).
  - 00 Canvas/Bilder · 01 Level-Aufbau · 02 Physik-Werte · 03 Eingabe (Tastatur/Controller) ·
    04 Figuren/Kollision · 05 Level-Objekte (Bröckelboden, Hebel, Türen, bewegte Teile/Haken) ·
    06 Tod/Checkpoints (+ Test-Sprung C/X) · 07 Effekte/Ton/Münzen · 08 Figuren-Physik/Seil ·
    09 Kamera · 10 Figuren zeichnen · 10a Level-Themen (Aussehen je Level: Himmel, Farben, Tiere, Dunkelheit) · 11 Hintergrund (je Thema) · 12 Welt zeichnen · 13 Anzeige/Leistung ·
    14 Spielschleife · 15 Level laden · 16 Hauptmenü/Levelauswahl/Pause · 17 Deko (Pflanzen, Moos, Vögel) · 18 Geräusche (SFX, Ton aus/an) · 19 Wetter/Licht (Regen, Sonne, Regenbogen) · 20 Tiere/Entdeckungen · 21 Figuren-Effekte (Stauchen, Staub, Herzchen) · 22 Musik (Klavier) + Sonnen-Ambiente (Ersatz) · 23 eigene Aufnahmen (assets/audio: Musik, Vögel, Regen, Fluss) · 24 Startmenü (Titel, Menü, Optionen, Spielerwahl, Levelkarten, „Level geschafft“ + Schloss-Animation, Blätter-Vorhang; Stil in css/startmenue.css) · 25 Duell (Tode je Figur oben rechts, Münzen/Tode für den Statistik-Bildschirm „Level geschafft“, Levelkarten-Zeile) · 26 Cosmetics-Katalog, Seltenheiten, Package-Vergabe/-Öffnen, Speicher · 27 Cosmetics zeichnen (rollfest; Partikel im festen Takt `cosmeticsStep`) · 28 Packages-Öffnen-Bildschirm + Sammlung (Stil in css/packages.css; nutzt `GameMenu.ui` aus 24) · 99 Start
- `elemente/` – **Element-Register** (Ausbau 2): eine Datei pro Spiel-Element mit allem, was dazugehört (Daten-Feld,
  Editor-Werkzeug + Zeichnen + Export, Spiel-Laden + Zeichnen + Logik). Spiel UND Editor laden diese Dateien zuerst.
  Umgestellt: `hebel.js`, `tuer.js`, `druckplatte.js` (Punkt-Elemente mit Verknüpfungs-Nummer), `sprungpilz.js`
  (Punkt-Element), `aufwind.js` (Kachel-Element); Aufbau in `00-register.js`. Die Schalt-Logik der Nummern bleibt
  gemeinsam im Verknüpfungs-System (`js/05-level-objekte.js`: setLink, updateDoorsAndSwitches, updatePlates).
- `assets/` – Bilder (Figuren, Schild …); `assets/audio/` – eigene Aufnahmen des Nutzers (FL Studio).
- `editor/` – Level-Editor: `editor/index.html` lädt `editor/js/*.js` in fester Reihenfolge (klassische Skripte,
  gemeinsamer Gültigkeitsbereich wie im Spiel): 01 Zustand/Autosave · 02 Werkzeuge (Maus, Radieren, Bewegungen) ·
  03 Zeichnen · 04 Export/Testen/Herunterladen · 05 Fenster „Levels“ (+ Projekt-Levels) · 06 „☁ Auf GitHub speichern“ ·
  07 Fenster „Level-Info“ (Welt, Position, Titel, Tageszeit, Wetter, Look) · 08 Rückgängig/Wiederholen + Rechteck-Auswahl ·
  99 Start (früher alles in einer `editor.js`).
- `levels/` – Levels im **Spiel-Format** (vom Editor exportiert), `levels/levels.json` = Liste der Levels (Namen; Rückfall),
  `levels/worlds.json` = Welten mit ihren Leveln (Reihenfolge der Levelauswahl), `levels/test/` = Mini-Testlevel
  (öffnen mit `index.html?testlevel=<name>`),
  `levels/editor-format/` = dieselben Levels im Editor-Speicherformat (Kästchen-Raster).
- `tests/run_tests.py` – automatische Tests (Playwright, Chromium).

## Technische Eckdaten
- Spielfeld 1280×720 (16:9), Kästchen = 40 px → 32×18 Kästchen sichtbar. Koordinaten in Pixeln, y wächst nach unten.
- **Fester Takt:** Physik immer 60 Schritte/s (`stepSim`), Zeichnen dazwischen interpoliert (`drawInterpolated`).
  Nichts darf pro gezeichnetem Bild Spielzustand ändern (sonst läuft es auf 120/144-Hz-Bildschirmen schneller).
- **Kollision:** `collideAxis` ignoriert Überlappungen < `COLLIDE_EPS` (Rundungsfehler) und schiebt nie quer
  über weite Strecken – sonst „teleportieren“ Figuren beim Springen unter Decken (Test `decke_kein_teleport`).
- Figurenhöhe 32,3 px (Kommazahl!) – bei Positionsberechnungen an Rundung denken.
- Zoom 0,85 (15 % heraus, Nutzerwunsch; vorher 0,95, davor 0,9, früher kein Zoom) -> sichtbare Weltbreite `VW` statt `W` benutzen.
  Kamera mit Totzone gegen Wackeln (`cameraTarget`), folgt der vorderen Figur, wenn beide nicht ins Bild passen.
  Über Reihe 0 ist ein Streifen Himmel sichtbar (`SKY_ROOM` ≈ 127 px), Decke = oberer Bildrand. Im Editor sind das
  die bebaubaren Reihen −1 … −3 (`SKY` in editor.js; Level-Daten dürfen negative Reihen/y haben) – bei Zoom-Änderung
  mit anpassen! Editor-Ansicht skaliert auf die Fensterhöhe (`fitView`).
- Spieltempo `GAME_SPEED` 0,9 (14-spielschleife.js): 60 Schritte pro *Spielsekunde*, real also 54/s.
- Spielstand-Werte (Sprung, Tempo, Wandsprung-Zeitfenster …) stehen in `js/02-physik-werte.js` bzw. am Anfang
  der jeweiligen Datei als Konstanten in GROSSBUCHSTABEN.

## Neues Element hinzufügen (Checkliste)
1. Datei `elemente/<name>.js` nach dem Muster von `sprungpilz.js` (Punkt) bzw. `aufwind.js` (Kachel) anlegen:
   `elementRegistrieren({id, name, feld, editor:{werkzeug, gruppe, vor, art, ziehbar, titel, farbe, zeichnen, exportieren},
   spiel:{laden, zeichnen, nachBewegung}})`. Beim Laden der Datei nichts von Spiel/Editor benutzen, nur in den Funktionen.
2. Dateinamen in BEIDE Lade-Listen eintragen: `index.html` und `editor/index.html` (Test `element_register` prüft das).
3. Spiel-Liste (z. B. `let bouncers = []`) in `js/01-level.js` anlegen, wenn andere Spiel-Teile sie brauchen.
4. Laufende Spiel-Logik nur im festen Takt (`stepSim`), Zeichnen ohne Spielzustand zu ändern; Werte als Konstanten.
5. Sound (18-sound.js), Test in `tests/run_tests.py`, Mini-Testlevel in `levels/test/`, FEATURES.md, und die Frage
   „Welche Rolle haben Affe und Schweinchen?“ (AUSBAU-REGELWERK Punkt 11).
6. Element mit Verknüpfungs-Nummer: `editor.mitNummer: true` + `nummerName` (Muster `hebel.js`); was beim An/Aus der
   Nummer passiert, gehört ins Verknüpfungs-System in `js/05-level-objekte.js`. Sonderfälle in der Figuren-Physik
   (z. B. Aufwind beim Segeln) bleiben in `js/08-figur-physik-seil.js`, die Werte/Hilfsfunktionen in der Element-Datei.
7. Zeichen-Hilfen, die Elemente brauchen (z. B. `linkColor`), müssen außerhalb von `draw()` stehen (12-welt-zeichnen.js).

## Steuerung (Kurzfassung)
| | Affe (Spieler 1) | Schweinchen (Spielerin 2) | Controller |
|---|---|---|---|
| Laufen | A / D | ← / → | Stick / Steuerkreuz |
| Springen / Wandsprung | Leertaste | Num 0 | ✕ |
| Fähigkeit | G = Haken | Num 1 halten = Schirm | □ |
| Seil ranziehen / geben | W / S | – | hoch / runter |
| Hebel | J | Num 2 | ○ |
| Neustart / Leistungsanzeige / Test-Sprung | R / F / C, X | | – |
| Pausenmenü (mit Neustart) | Esc | | Options |
| (Tasten gehören zu Spielern; wer welche Figur spielt, wählt man im Startmenü) | | | |
| Ton aus/an | M | | (Pausenmenü) |

## Geplante nächste Schritte (mit dem Nutzer abgesprochen)
1. Alle Einstellwerte (Kamera, Seil, Wandsprung, Hebel …) übersichtlich in `js/02-physik-werte.js` bündeln
   – ohne Verhaltensänderung, Tests müssen grün bleiben.
2. Level-Auswahl im Spiel: Levels aus `levels/levels.json` direkt laden (ohne Datei-Upload).
3. Große Dateien (v. a. `js/12-welt-zeichnen.js`) weiter in sinnvolle Teile gliedern.
