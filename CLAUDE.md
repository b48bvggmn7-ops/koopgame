# Monchichi Koop – Hinweise für Claude Code

## Wer und was
- Der Nutzer ist **kein Programmierer**. Antworte auf **Deutsch**, kurz und verständlich, ohne Fachchinesisch.
  Erkläre nach jeder Änderung in 2–3 Sätzen, was sich für ihn im Spiel ändert und wie er es testet.
- Spiel: 2D-Koop-Jump'n'Run für zwei Spieler an einem Gerät (Couch-Koop, Tastatur + PS4-Controller),
  läuft im Browser. Ziel: Vollbild 16:9. Spieler 1 = Affe (Haken/Seil), Spielerin 2 = pinkes Schweinchen (Schirm).
- **FEATURES.md** beschreibt alles, was Spiel und Editor können. Das ist die Wahrheit über das gewünschte Verhalten.

## Arbeitsregeln (wichtig!)
1. **Vor und nach jeder Änderung die Tests laufen lassen:** `python tests/run_tests.py`
   (einmalig vorher: `pip install playwright && playwright install chromium`).
   Nur committen, wenn alle Tests grün sind. Für jede neue Funktion und jeden behobenen Fehler einen Test
   in `tests/run_tests.py` ergänzen.
2. **Nur das ändern, was der Nutzer verlangt.** Kein „Aufräumen nebenbei“, keine stillen Verhaltensänderungen.
   Wenn eine Anfrage mehrdeutig ist oder eine bestehende Funktion beeinflusst, kurz nachfragen.
3. **FEATURES.md pflegen:** Jede Verhaltensänderung dort eintragen. Nichts entfernen, ohne den Nutzer zu fragen.
4. **Kleine Schritte:** pro Wunsch ein Commit mit kurzer deutscher Beschreibung.
5. Wenn der Nutzer mit etwas unzufrieden ist: lieber auf den letzten guten Stand zurück (git) als lange herumprobieren.
6. **Direkt in `main` übernehmen:** Sind alle Tests grün, die Änderung immer sofort committen und nach `main` pushen
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
    09 Kamera · 10 Figuren zeichnen · 11 Dschungel-Hintergrund · 12 Welt zeichnen · 13 Anzeige/Leistung ·
    14 Spielschleife · 15 Level laden · 16 Hauptmenü/Levelauswahl/Pause · 17 Deko (Pflanzen, Moos, Vögel) · 18 Geräusche (SFX, Ton aus/an) · 19 Wetter/Licht (Regen, Sonne, Regenbogen) · 20 Tiere/Entdeckungen · 21 Figuren-Effekte (Stauchen, Staub, Herzchen) · 99 Start
- `assets/` – Bilder (Figuren, Schild …).
- `editor/` – Level-Editor (`editor/index.html` + `editor/editor.js`).
- `levels/` – Levels im **Spiel-Format** (vom Editor exportiert), `levels/levels.json` = Liste der Levels,
  `levels/editor-format/` = dieselben Levels im Editor-Speicherformat (Kästchen-Raster).
- `tests/run_tests.py` – automatische Tests (Playwright, Chromium).

## Technische Eckdaten
- Spielfeld 1280×720 (16:9), Kästchen = 40 px → 32×18 Kästchen sichtbar. Koordinaten in Pixeln, y wächst nach unten.
- **Fester Takt:** Physik immer 60 Schritte/s (`stepSim`), Zeichnen dazwischen interpoliert (`drawInterpolated`).
  Nichts darf pro gezeichnetem Bild Spielzustand ändern (sonst läuft es auf 120/144-Hz-Bildschirmen schneller).
- **Kollision:** `collideAxis` ignoriert Überlappungen < `COLLIDE_EPS` (Rundungsfehler) und schiebt nie quer
  über weite Strecken – sonst „teleportieren“ Figuren beim Springen unter Decken (Test `decke_kein_teleport`).
- Figurenhöhe 32,3 px (Kommazahl!) – bei Positionsberechnungen an Rundung denken.
- Kein Zoom (bewusste Entscheidung). Kamera folgt der vorderen Figur, Abstand max. 1,25 Bildschirmbreiten.
- Spielstand-Werte (Sprung, Tempo, Wandsprung-Zeitfenster …) stehen in `js/02-physik-werte.js` bzw. am Anfang
  der jeweiligen Datei als Konstanten in GROSSBUCHSTABEN.

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
| Ton aus/an | M | | (Pausenmenü) |

## Geplante nächste Schritte (mit dem Nutzer abgesprochen)
1. Alle Einstellwerte (Kamera, Seil, Wandsprung, Hebel …) übersichtlich in `js/02-physik-werte.js` bündeln
   – ohne Verhaltensänderung, Tests müssen grün bleiben.
2. Level-Auswahl im Spiel: Levels aus `levels/levels.json` direkt laden (ohne Datei-Upload).
3. Große Dateien (v. a. `js/12-welt-zeichnen.js`) weiter in sinnvolle Teile gliedern.
