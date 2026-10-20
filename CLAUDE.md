# Monchichi Koop – Hinweise für Claude Code

## Wer und was
- Der Nutzer ist **kein Programmierer**. Antworte auf **Deutsch**, kurz und verständlich, ohne Fachchinesisch.
  Erkläre nach jeder Änderung in 2–3 Sätzen, was sich für ihn im Spiel ändert und wie er es testet.
- Spiel: 2D-Koop-Jump'n'Run für zwei Spieler an einem Gerät (Couch-Koop, Tastatur + PS4-Controller),
  läuft im Browser. Ziel: Vollbild 16:9. Spieler 1 = Affe (Haken/Seil), Spielerin 2 = pinkes Schweinchen (Schirm).
- **FEATURES.md** beschreibt alles, was Spiel und Editor können. Das ist die Wahrheit über das gewünschte Verhalten.

## Arbeitsregeln (wichtig!)
0. **Ausbau-Schritte:** Vor jedem Ausbau-Schritt `AUSBAU-REGELWERK.md` und `AUSBAU-VISION.md` lesen und befolgen.
1. **Tests in zwei Stufen** (Nutzerwunsch: nicht nach jeder Kleinigkeit den vollen Lauf von ~45 Minuten):
   - **Kurztest nach jeder Anpassung** (wenige Minuten): nur die Tests, die zur Änderung passen, plus der neue Test,
     z. B. `python tests/run_tests.py editor` (Filter = Teil des Testnamens). Grün -> lokal committen, noch NICHT pushen.
   - **Großer Lauf** `python tests/run_tests.py` (einmalig vorher: `pip install playwright && playwright install chromium`):
     wenn der Nutzer „jetzt testen und hochladen“ sagt, nach etwa 3–5 gesammelten Anpassungen und immer am Ende eines
     Ausbau-Schritts. Ist er rot: die schuldige Änderung finden und beheben, bevor etwas nach `main` geht.
   Für jede neue Funktion und jeden behobenen Fehler einen Test in `tests/run_tests.py` ergänzen.
2. **Nur das ändern, was der Nutzer verlangt.** Kein „Aufräumen nebenbei“, keine stillen Verhaltensänderungen.
   Wenn eine Anfrage mehrdeutig ist oder eine bestehende Funktion beeinflusst, kurz nachfragen.
3. **FEATURES.md pflegen:** Jede Verhaltensänderung dort eintragen. Nichts entfernen, ohne den Nutzer zu fragen.
4. **Kleine Schritte:** pro Wunsch ein Commit mit kurzer deutscher Beschreibung.
5. Wenn der Nutzer mit etwas unzufrieden ist: lieber auf den letzten guten Stand zurück (git) als lange herumprobieren.
6. **Vor dem Arbeiten `main` holen** (`git fetch origin main` + auf den neuesten Stand bringen): Der Nutzer speichert
   Levels auch direkt aus dem Editor auf GitHub („☁ Auf GitHub speichern“ = eigene Commits auf `main`).
7. **Nach `main` übernehmen:** Nach jedem grünen großen Lauf alle gesammelten Commits nach `main` pushen (vom Nutzer
   ausdrücklich so gewünscht), damit sie automatisch online gehen. Bei roten Tests nichts nach `main`.

## Aufbau
- `index.html` – Spielseite (HTML/CSS) und lädt die Skripte in `js/` **in fester Reihenfolge**.
- `js/00-…` bis `js/99-start.js` – das Spiel. **Klassische `<script>`-Dateien ohne Module und ohne Build-Schritt**:
  alle teilen sich einen gemeinsamen Gültigkeitsbereich (z. B. `p1`, `solids`, `KEYS` sind überall sichtbar).
  Neue Dateien in `index.html` in die Lade-Liste (kleines Skript am Ende, hängt `?v=<Zeit>` gegen alte Browser-Kopien an)
  an der passenden Stelle eintragen. Keine globalen Namen verwenden, die es im
  Browser schon gibt (z. B. `top`, `name`, `status`, `parent`).
  - 00 Canvas/Bilder · 01 Level-Aufbau · 02 Physik-Werte · 03 Eingabe (Tastatur/Controller) ·
    01a Level-Umzug (alte Dateinamen -> Welt-Ordner) · 04 Figuren/Kollision · 05 Level-Objekte (Bröckelboden, Hebel, Türen, bewegte Teile/Haken) ·
    06 Tod/Checkpoints (+ Test-Sprung C/X, im Editor-Test Q = andere Figur holen) · 07 Effekte/Ton/Münzen · 08 Figuren-Physik/Seil ·
    09 Kamera (+ Kamera-Wackeln kameraStoss) · 10 Figuren zeichnen · 10a Level-Themen (Aussehen je Level: Himmel, Farben, Tiere, Dunkelheit) · 10b Design-Look (zentrale Tabelle
    `DESIGN_LOOK` je Welt/Tageszeit: Kontur, Randlicht, Tiefe, Dunst; Glanz-Muster `glanzSchatten/glanzFunkeln/glanzBand`
    für alle Elemente; Neues Aussehen: Materialien `wallTile`/`grain`/`outlineDraw`, Farben `EA`/`SOILBASE`, Stil-Wahl
    `wallK`/`soilK`/`outK`, Hilfen `rnd`/`hsh`/`waveY` und der Zeichen-Kontext `g` der Vorschau) · 11 Hintergrund (je Thema) · 11b Dschungel-Hintergrund (Dschungel-Paket: eigener Stil je Welt/Tageszeit über
    `HG_STIL_TABELLE`/`BG_STIL` – fehlt der Eintrag, bleibt der Hintergrund aus 11; Pflanzen-Sprites, Wind nur vorne, stille Ebenen als
    Kacheln, Nacht-Einfärbung beim Vorzeichnen, Leuchtpflanzen, Hintergrund-Licht; Haken `hgBodenLicht`/`hgStilVorne` in 12; Schalter
    localStorage `monchichi.dschungelWind`/`monchichi.dschungelNachtlicht`; Tier-Regeln `buildCrittersDschungel`, Hintergrund-Tiere und
    `tierLeuchtenNacht` in 20, Vogel-Sitzplätze `vogelSitzplaetze` in 17) · 11a Welt-Details (Details in der mittleren Ebene, Fackeln/Tropfen/
    Asche) · 12 Welt zeichnen (Neues Aussehen: Boden/Wand als EINE Schicht – Raster `Tc`, je Abschnitt `MAT_STUECK` einmal
    zu Zeichenpfaden berechnet (`matPfadeBauen`), pro Bild nur gefüllt (`materialZeichnen`); KEINE vorgezeichneten Bilder
    dafür: Chrome hat je Bild ~32 MB Bild-Budget und der Hintergrund braucht fast alles. Bewegliche Plattformen `pieceDraw`,
    Bröckelboden `broeckelKachel`, Türen `drawGate` (zusammenhängend = eine Tür); Moos/Lianen an hohen Flächen `hoheFlaechen`) · 13 Anzeige/Leistung ·
    14 Spielschleife · 15 Level laden · 16 Hauptmenü/Levelauswahl/Pause · 17 Deko (Pflanzen, Moos, Vögel) · 17a Dschungel-Boden-Dekor (Dickicht, Gras, Farn, Blumen, Pilze; Freihalte-Zone `bodenSperre`; ersetzt im Dschungel das alte Dekor) · 18 Geräusche (SFX, Ton aus/an) · 19 Wetter/Licht (Regen, Sonne, Regenbogen) · 20 Tiere/Entdeckungen · 21 Figuren-Effekte (Stauchen, Staub, Herzchen) · 22 Musik (Klavier) + Sonnen-Ambiente (Ersatz) · 23 eigene Aufnahmen (assets/audio: Musik, Vögel, Regen, Fluss) · 24 Startmenü (Titel, Menü, Optionen, Spielerwahl, Weltkarte + Welt-Seite mit Levelkarten, „Level geschafft“ + Schloss-Animation, Blätter-Vorhang; Stil in css/startmenue.css) · 25 Duell (Tode je Figur oben rechts, Münzen/Tode für den Statistik-Bildschirm „Level geschafft“, Levelkarten-Zeile) · 26 Cosmetics-Katalog, Seltenheiten, Package-Vergabe/-Öffnen, Speicher · 27 Cosmetics zeichnen (rollfest; Partikel im festen Takt `cosmeticsStep`) · 28 Packages-Öffnen-Bildschirm + Sammlung (Stil in css/packages.css; nutzt `GameMenu.ui` aus 24) · 29 Spielszenen (Intro/Zwischensequenzen aus `story/story.json`, Sprechblasen, Kino-Balken) · 30 Computer-Partner (nur Testmodus: Folgen, Vorausrechnung mit echter Physik, Wegsuche, Gefahren, Steuerung Q/E/V/P; Konstanten `PARTNER_*` in 02) · 31 Begleiter-Aufgaben (Begleitdatei `levels/partner/<welt>/<datei>.json`, Auto-Aufgaben) · 32 neue Bewegung (Nacht-Ausbau: Dash, Durchbruch-Treffer, Wand-Rutschen, Haftfläche; Aufrufe aus 08 über `neueBewegungVorher`/`neueBewegungNachher`, Trefferstopp `neuTrefferStopp` in 14) · 99 Start
- `elemente/` – **Element-Register** (Ausbau 2): eine Datei pro Spiel-Element mit allem, was dazugehört (Daten-Feld,
  Editor-Werkzeug + Zeichnen + Export, Spiel-Laden + Zeichnen + Logik). Spiel UND Editor laden diese Dateien zuerst.
  Umgestellt: `hebel.js`, `tuer.js`, `druckplatte.js` (Punkt-Elemente mit Verknüpfungs-Nummer), `sprungpilz.js`
  (Punkt-Element), `aufwind.js` (Kachel-Element); Ausbau 4: `wechselboden.js` (Punkt mit Nummer/Takt, eigene Auswahl-Felder
  `optionen`, Logik pro Schritt `spiel.schritt`, Neustart `spiel.zuruecksetzen`), `teleporter.js` (Paare per 2. Klick:
  `editor.neu`, Linie `editor.zeichnenAlle`, Einfügen `editor.einfuegen`), `einseitig.js` (Steg, Kachel; Kollision
  type 'oneway' in `collideAxis`); Ausbau 5: `wasser.js` (Wasserflächen, Schwimmen `schwimmPhysik`, Luft `luftSchritt`,
  vor den Figuren gezeichnet über `spiel.zeichnenVorne`), `stroemung.js` (Strömung + Wasserstand/Schleuse); Ausbau 6: `boss.js` (Endgegner-Gerüst: Boss/Arena/Boss-Platz, Zustandsautomat, Lebensbalken über `spiel.zeichnenOben`); Ausbau 7: `falle.js` (Pfeil/Flamme im Takt, Takt-Uhr `fallenSchritte`), `fels.js` (rollender Fels, startet per Nummer nach ½ s Wackeln, kündigt sich am Bildrand an, bricht durch Bröckel-Wände), `licht.js` (Lichtquelle/Spiegel/Kristall; Kristall wirkt in `updatePlates` über `lichtWunsch`, Spiegel drehen von Hand über `spiegelBedienen`, schaltbare Spiegel (Nummer) über `spiegelAusloesen` bei Platte-Betreten/Hebel; Strahl-Randzeichen `lichtRandListe`); Höhle: `eis.js` (rutschiger Boden, Sonderregel `aufEis` in 08), `foerderband.js` (nimmt Figuren in `nachBewegung` mit), `leuchtkristall.js` (Leuchtkristall anschlagen über `leuchtAnschlagen`, Dunkelzonen über `dunkelZeichnen` in `drawThemeDarkness`); Vulkan: `durchbruch.js` (Nacht-Ausbau: Durchbruch-Wand, solids type 'bruch', bricht nur per Dash, Option nachwachsen), `haftflaeche.js` (Nacht-Ausbau: Kachel, solids type 'wall' mit `haft: true`); `lava.js` (Lava-Becken + Lava-Marke, steigt per Nummer oder „sobald jemand kommt“; gezeichnet über den neuen Haken `spiel.zeichnenHinten` HINTER Boden/Wänden), `presse.js` (Stachelpresse im Takt, eigene Takt-Uhr je Presse); Aufbau in `00-register.js`. Die Schalt-Logik der Nummern bleibt
  gemeinsam im Verknüpfungs-System (`js/05-level-objekte.js`: setLink, updateDoorsAndSwitches, updatePlates).
- `WELTEN.md` – Design je Welt (Thema, Look, Tiere, Musik, Mechaniken je Level, Rollen von Affe und Schweinchen; Ausbau 7/8).
- `story/story.json` – alle Texte und Abläufe der Spielszenen (Intro, Boss-Siege); vom Nutzer direkt änderbar.
- `assets/` – Bilder (Figuren, Schild …); `assets/audio/` – eigene Aufnahmen des Nutzers (FL Studio).
- `editor/` – Level-Editor: `editor/index.html` lädt `editor/js/*.js` in fester Reihenfolge (klassische Skripte,
  gemeinsamer Gültigkeitsbereich wie im Spiel): 01 Zustand/Autosave · 02 Werkzeuge (Maus, Radieren, Bewegungen) ·
  03 Zeichnen · 04 Export/Testen/Herunterladen · 05 Fenster „Levels“ (+ Projekt-Levels in Welt-Ordnern; Test-Helfer `projekt_laden`) · 06 „☁ Auf GitHub speichern“ ·
  07 Fenster „Level-Info“ (Welt, Position, Titel, Tageszeit, Wetter, Look) · 08 Rückgängig/Wiederholen + Rechteck-Auswahl ·
  09 Werkzeugleiste (Reiter, „Zuletzt“, Eigenschaften-Zeile nur fürs aktive Werkzeug, Welt-Voreinstellung, Hilfe) ·
  99 Start (früher alles in einer `editor.js`); davor `00-welt-werkzeuge.js` = Tabelle, welche Werkzeuge je Welt empfohlen sind.
- `levels/` – Levels im **Spiel-Format** (vom Editor exportiert), seit dem Editor-Umbau **nach Welten in Ordnern**:
  `levels/<welt>/<nr>-<titel>.json` (z. B. `vulkan/03-feuerberg.json`), Bosse `<welt>/boss-<name>.json`, alte Entwürfe in
  `archiv/`; die Nummer im Namen bleibt beim Umsortieren (Reihenfolge = `worlds.json`). `levels/levels.json` = Liste der
  Levels (Namen; Rückfall), `levels/worlds.json` = Welten mit ihren Leveln (Pfade ab `levels/`), `levels/test/` =
  Mini-Testlevel (öffnen mit `index.html?testlevel=<name>`), `levels/editor-format/` = dieselben Levels im
  Editor-Speicherformat (gleiche Unterordner). `levels/README.md` erklärt das in 10 Zeilen. Alte Dateinamen
  (`level-6.json` …) -> neue: Tabelle `js/01a-level-umzug.js` (Spiel + Editor laden sie; Spielstände werden beim Laden
  umgeschrieben). Level-Dateien NIE von Hand umbenennen.
- `tests/level_import.py <spiel.json> <welt>/<datei>.json` – Level aus dem Spiel-Format (z. B. Datei vom Nutzer) in beide Formate übernehmen (Rückweg geprüft).
- `tests/koop_bot.js` – Koop-Bot für Level-Tests (steuert beide Figuren nach Plänen, Helfer `koop()` in run_tests.py; Ausbau 7).
- `tests/bildregel_pruefen.py` – Prüfwerkzeug Bild-Regel/Plattform/Haken/Checkpoints (Grenze `BILD_MAX_SPALTEN` in js/09-kamera.js),
  begründete Ausnahmen in `tests/bildregel_ausnahmen.json`; Ziel-Hinweis-Pfeil am Bildrand: `zielHinweisMerken` (05) / `drawZielHinweise` (07).
- `tests/partner_aufgaben_pruefen.py` – probiert je Hebel-/Platten-Nummer aus, ob der Computer-Partner sie schafft, und
  schreibt mit `--schreiben` die Begleitdatei `levels/partner/<welt>/<datei>.json` (nicht Geschafftes unter „offen“).
- `tests/kombi_pruefen.py` – Prüfwerkzeug Wandsprung (Kamine: Breite/Höhe/Einstufung) und Kombi-Stellen je Level/Etappe,
  Ausnahmen in `tests/kombi_ausnahmen.json`, Testlevel `levels/test/kombis.json` (Kombi-Nachschärfen).
- `tests/bahnen.js` + `tests/bahnen_referenz.json` – Bahnen-Test der alten Mechaniken (Nacht-Ausbau, harte Regel):
  feste Tasten je Schritt, Vergleich exakt; Referenz NIE neu aufzeichnen/anpassen (`tests/bahnen_aufzeichnen.py`
  überschreibt nie). `tests/neue_mechaniken.js` – Prüf-Szenarien Dash/Durchbruch/Rutschen/Haftfläche.
- Nacht-Ausbau Werkzeuge: `tests/reichweite_messen.py` (Reichweiten/Erfolgsfenster -> `tests/reichweiten.json`),
  `tests/level_vermessen.py` (Gruben, Sperren, Exploit-Kandidaten), `tests/stelle_pruefen.py` (eine Stelle mit echter
  Physik), `tests/level_ascii.py <datei> <von> <bis>` (Text-Bild eines Level-Stücks), `tests/level_bau.py` (Level per
  Skript ändern, speichert über den Editor in beide Formate; Bausteine B1–B7, S1 Versteck, S2 Haft-Arm, S3 Haft-Insel,
  S4 Durchbruch-Nische). `tests/bausteine/`: `stellen.py` (alle neuen Level-Stellen mit Bot-Plan + Gegenprobe, Tests
  `nacht_stellen_<welt>`), `plaene.py` (Bot-Pläne), Setz-Skripte (`verstecke_setzen.py`, `haftarme_setzen.py`,
  `extras_setzen.py`, `checkpoints_setzen.py`), `muenzen.py --einstufen` (Münz-Klassen), `abdeckung*.json` (wo alte
  Bot-Tests laufen – dort keine Pflicht-Änderungen).
- `tests/run_tests.py` – automatische Tests (Playwright, Chromium). Für Bewegungen im Spiel nicht feste Millisekunden
  warten, sondern `g.steps(n)` (n Physik-Schritte, 54 = 1 s; Zähler `simSteps` in 14-spielschleife.js) bzw. `g.hold`
  (zählt ebenfalls Schritte) oder `wait_for_function` auf das erwartete Ereignis – sonst sind Tests auf langsamen
  Rechnern mal rot.

## Technische Eckdaten
- Spielfeld 1280×720 (16:9), Kästchen = 40 px → 32×18 Kästchen sichtbar. Koordinaten in Pixeln, y wächst nach unten.
- **Fester Takt:** Physik immer 60 Schritte/s (`stepSim`), Zeichnen dazwischen interpoliert (`drawInterpolated`).
  Nichts darf pro gezeichnetem Bild Spielzustand ändern (sonst läuft es auf 120/144-Hz-Bildschirmen schneller).
- **Kollision:** `collideAxis` ignoriert Überlappungen < `COLLIDE_EPS` (Rundungsfehler) und schiebt nie quer
  über weite Strecken – sonst „teleportieren“ Figuren beim Springen unter Decken (Test `decke_kein_teleport`).
  Einseitige Stege (type 'oneway') zählen nur beim Landen von oben; Wandprüfung, Seil-Sicht, `spotFree` ignorieren sie.
- Figurenhöhe 32,3 px (Kommazahl!) – bei Positionsberechnungen an Rundung denken.
- Zoom 0,85 (15 % heraus, Nutzerwunsch; vorher 0,95, davor 0,9, früher kein Zoom) -> sichtbare Weltbreite `VW` statt `W` benutzen.
  Kamera mit Totzone gegen Wackeln (`cameraTarget`), folgt der vorderen Figur, wenn beide nicht ins Bild passen.
  Über Reihe 0 ist ein Streifen Himmel sichtbar (`SKY_ROOM` ≈ 127 px), Decke = oberer Bildrand. Im Editor sind das
  die bebaubaren Reihen −1 … −3 (`SKY` in editor.js; Level-Daten dürfen negative Reihen/y haben) – bei Zoom-Änderung
  mit anpassen! Editor-Ansicht skaliert auf die Fensterhöhe (`fitView`).
- Schärfe: Leinwand bis `LEINWAND_MAX_BREITE` (3840, 4K) echte Pixel. **Keine zusätzlichen großen Offscreen-Leinwände**
  pro Bild zeichnen (Hintergrund-Ebene, Dunkel-Schicht …): ab einer gewissen Zahl zeichnet der Browser sie sehr langsam
  (gemessen 8–80 ms je Bild). Details lieber in vorhandene Ebenen malen, weiche Schichten in halber Auflösung
  (`DUNKEL_AUFLOESUNG`). Test leinwand_scharf_und_schnell wacht darüber. Grund (gemessen beim neuen Aussehen): alle Bilder/Leinwände,
  die in einem Bild ins Spielbild gemalt werden, zählen zusammen; über ~32 MB rendert Chrome mitten im Bild (100–250 ms) –
  die Hintergrund-Ebenen brauchen davon schon rund 31 MB (neuer Dschungel-Hintergrund, 11b: rund 20 MB – weiche Ebenen in halber
  Auflösung, `DJ_KACHEL_HALB`). Große Flächen daher als Zeichenpfade (Muster `matPfadeBauen`).
- Pro Spielschritt nie „für jedes Kästchen alle solids durchlaufen“ (Licht, Flammen …): Raster-Verzeichnis nutzen
  (Muster `lichtGitterHolen` in elemente/licht.js, `falleGitterHolen` in elemente/falle.js). Test spielschritt_schnell.
- Regen ist aus dem Spiel (`REGEN_AUS` in 19-wetter.js, Nutzerwunsch).
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
7. Eigene Auswahl-Felder im Editor: `editor.optionen`; eigene solids-Sorte, die das Element selbst zeichnet:
   `ELEMENT_SOLID_TYPEN.add('<type>')` (Muster `wechselboden.js`).
8. Zeichen-Hilfen, die Elemente brauchen (z. B. `linkColor`), müssen außerhalb von `draw()` stehen (12-welt-zeichnen.js).
9. Editor-Reiter: `editor.gruppe` = gelaende, gefahren, licht, logik, haken, bewegung, wasser, boss oder marken;
   Werkzeug-Namen in `editor/js/00-welt-werkzeuge.js` bei der passenden Welt (oder GRUND_WERKZEUGE) eintragen
   (Test `werkzeug_welten`); seine Optionen erscheinen automatisch in der Eigenschaften-Zeile.
10a. Element, das sich per Nummer nur EINMAL pro Auslöser bewegen soll (Muster schaltbarer Spiegel in `licht.js`): nicht an
   `linkOn` hängen, sondern an die Auslöse-Momente – `spiegelAusloesen(link)` wird in `triggerSwitch` (jede Hebel-Betätigung)
   und in `updatePlates` (Platte BETRETEN, `pl.down` von aus nach an) aufgerufen; Druckplatten setzen `pl.down` bei
   Neustart/Tod zurück. Optionen „von Hand / per Nummer“ wie beim Sonnenstein (`editor.optionen` key `schalter`,
   `neu`, `nummerAktiv`). Licht-Rätsel in `LICHT_RAETSEL` (tests/run_tests.py) eintragen -> Löser-Test.
11. Neue Bewegungs-Mechaniken (Muster Nacht-Ausbau): NIE die alte Physik in 08 umschreiben – nur über die Haken
   `neueBewegungVorher` (true = Tempo gesetzt, normale Physik aus) und `neueBewegungNachher` in `js/32-neue-bewegung.js`
   einklinken; Test `bahnen_alte_mechaniken` muss grün bleiben (Referenz `tests/bahnen_referenz.json` nie anpassen).
   Neue Aktion mit eigener Taste: in `TASTEN_STANDARD`/`PAD_STANDARD`/`TASTEN_AKTIONEN` (js/03-eingabe.js) und
   `TB_NAMEN` (Tasten-Menü in js/24-startmenue.js) eintragen.
10. Muss den Werkzeug-Test `editor_werkzeug_pruefung` bestehen (setzen, Optionen, Rechtsklick, Radierer, Undo/Redo,
   Speichern/Laden, Kopieren/Einfügen). Wird das Element im Editor größer als sein Kästchen gezeichnet, `editor.bereich(p)`
   angeben (Liste der sichtbar belegten Kästchen, Muster `fels.js`) – sonst trifft der Rechtsklick es nicht.

## Neues oder geändertes Level (Checkliste)
1. Bild-Regel und Leveldesign-Regeln (AUSBAU-REGELWERK Punkt 12): Auslöser und Ziel höchstens `BILD_MAX_SPALTEN` (20)
   auseinander, Fahrten/Tore nie weiter vom Partner weg, Haken-Richtwerte (Abstand 5–6, Höhe 6–7 Reihen), Checkpoints
   25–70 Spalten auseinander mit einer Stelle dazwischen und nie zwischen Hebel und Tür.
2. Vor dem Commit `python3 tests/bildregel_pruefen.py --level <welt>/<datei>` (ohne `--level`: alle Level; `--alle` zeigt
   die ganzen Tabellen). Bleibt ein Befund bewusst, kommt er mit Begründung in `tests/bildregel_ausnahmen.json`.
3. Koop-Bot-Test des Levels grün; Münzen/Checkpoints nach Spalten-Verschiebungen neu prüfen.
4. Wandsprung-Richtwerte (gemessen, Konstanten `KAMIN_*`, `EINZELWAND_WEITE`, `WANDSPRUNG_*` in js/02-physik-werte.js):
   Kamin bequem 3–5 Kästchen breit (nie 1–2, höchstens 8), Wand ≥ 4 Reihen. Kombi-Regel (Regelwerk 12): Mindestzahl
   Kombi-Stellen je Welt/Etappe; vor dem Commit `python3 tests/kombi_pruefen.py --level <welt>/<datei>`. Jede neue
   Kombi-Stelle bekommt einen Eintrag in `KOMBI_STELLEN_BOT` (mit Gegenprobe ohne Kombi), dicht hintereinander liegende
   Stellen eine Abkürzungs-Probe in `KOMBI_ABKUERZUNG`; Ausnahmen/Ketten/„Kombi-offen“ in `tests/kombi_ausnahmen.json`.
   Bausteine Pilz-Grube/Kamin-Grube: WELTEN.md (Leveldesign). Vorher prüfen, dass keine Jagd/kein Rätsel dort liegt
   (Level-Test der Welt laufen lassen) – Gruben in Verfolgungen oder auf Rätsel-Wegen machen sie kaputt.
5. Begleiter-Aufgabe je Rätsel für den Computer-Partner: `python3 tests/partner_aufgaben_pruefen.py --level <welt>/<datei>
   --schreiben` (schreibt `levels/partner/<welt>/<datei>.json`; Offenes steht dort unter „offen“, schwierige Stellen von
   Hand als „ablauf“ mit `"von_hand": true`); danach Test `partner_aufgaben_<welt>` (falls vorhanden) grün.

## Steuerung (Kurzfassung)
| | Affe (Spieler 1) | Schweinchen (Spielerin 2) | Controller |
|---|---|---|---|
| Laufen | A / D | ← / → | Stick / Steuerkreuz |
| Springen / Wandsprung | Leertaste | Num 0 | ✕ |
| Fähigkeit | G = Haken | Num 1 halten = Schirm | □ |
| Seil ranziehen / geben | W / S | – | hoch / runter |
| Hebel | J | Num 2 | ○ |
| Dash (Nacht-Ausbau) | K | Num 3 | △ |
| Haftfläche festhalten | W halten | ↑ halten | hoch |
| Neustart / Leistungsanzeige / Test-Sprung | R / F / C, X | | – |
| Pausenmenü (mit Neustart) | Esc | | Options |
| (Tasten gehören zu Spielern; wer welche Figur spielt, wählt man im Startmenü) | | | |
| Ton aus/an | M | | (Pausenmenü) |
| (Standard-Belegung; frei änderbar unter Optionen → Tasten belegen, gespeichert `monchichi.tasten`, Controller je Typ) | | | |

## Geplante nächste Schritte (mit dem Nutzer abgesprochen)
1. Alle Einstellwerte (Kamera, Seil, Wandsprung, Hebel …) übersichtlich in `js/02-physik-werte.js` bündeln
   – ohne Verhaltensänderung, Tests müssen grün bleiben.
2. Level-Auswahl im Spiel: Levels aus `levels/levels.json` direkt laden (ohne Datei-Upload).
3. Große Dateien (v. a. `js/12-welt-zeichnen.js`) weiter in sinnvolle Teile gliedern.
