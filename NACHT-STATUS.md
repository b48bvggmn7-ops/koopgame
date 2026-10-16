# NACHT-STATUS – Nacht-Ausbau (Quelle der Wahrheit für diese Nacht)

Auftrag: vier neue Mechaniken aus der Spielwiese ins echte Spiel (Dash, Durchbruch-Wand, Wand-Rutschen, Haftfläche),
Tastenbelegung in den Optionen, Messwerkzeuge, danach alle Level von Dschungel, Ruinen, Höhle und Vulkan vermessen und
anpassen. **Nicht angefasst:** Wasserwelt, alle Boss-Level, `spielwiese/`. **Harte Regel:** alte Mechaniken
(Sprung, Wandsprung, Haken, Laufen, Schwerkraft, Segeln, Schweben, Aufwind, Pilz) Frame für Frame unverändert –
Beweis: Test `bahnen_alte_mechaniken` (Referenz `tests/bahnen_referenz.json`, vor dem Ausbau aufgezeichnet).

Sicherung: Tag `vor-nacht-ausbau` (lokal) **und** Branch `vor-nacht-ausbau` auf GitHub (Commit a80bbe0) – GitHub nimmt
über diesen Zugang keine Tags an, deshalb der Branch als Ersatz.

## Aufgabenliste
| Nr | Aufgabe | Status |
|---|---|---|
| P0.1 | Sicherung `vor-nacht-ausbau` (Tag lokal + Branch auf GitHub) | fertig |
| P0.2 | Bahnen-Test alte Mechaniken (7 Szenarien, 2 Figuren, ~2400 Schritte) aufgezeichnet | fertig |
| P0.3 | Ausgangs-Testlauf (voll): 200 bestanden, 0 fehlgeschlagen | fertig |
| P0.4 | Level-Liste (Abnahme-Liste) | fertig |
| P1 | Dash, Durchbruch-Wand, Wand-Rutschen, Haftfläche, Tastenbelegung (+ Editor, Tests, Doku) | fertig (Kurztests grün, großer Lauf folgt) |
| P2 | Messwerkzeuge (Reichweite + Erfolgsfenster, Einstufung, Level-Vermesser, Exploit-Suche, Bild-Regel, Checkpoints, Münzen) | offen |
| P3 | Alle 25 Level vermessen und anpassen | offen |
| P4 | Zweiter Durchgang, Gesamtprüfung, Bericht | offen |

## Abnahme-Liste (25 Level)
Spalten = Level-Checkliste Phase 3: 1 Vermessen · 2 Kombis · 3 Landeplätze · 4 Zusammenarbeit · 5 Kamine · 6 Haken ·
7 Münzen · 8 Checkpoints · 9 Bild-Regel · 10 Fairness · 11 Bot-Plan · 12 Doku.

| Welt | Nr | Datei | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Dschungel | 1 | dschungel/01-dschungel.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Dschungel | 2 | dschungel/02-baumkronen.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Dschungel | 3 | dschungel/03-lianenschlucht.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Dschungel | 4 | dschungel/04-gluehwald.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Dschungel | 5 | dschungel/05-dornenpfad.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Dschungel | 6 | dschungel/06-wipfelsturm.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Ruinen | 1 | ruinen/01-ruinen.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Ruinen | 2 | ruinen/03-fallengang.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Ruinen | 3 | ruinen/04-sonnentempel.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Ruinen | 4 | ruinen/02-mondnacht.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Ruinen | 5 | ruinen/05-felsenflucht.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Ruinen | 6 | ruinen/06-tempelherz.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Höhle | 1 | hoehle/02-tropfsteingang.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Höhle | 2 | hoehle/03-eisgrotte.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Höhle | 3 | hoehle/01-kristallhoehle.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Höhle | 4 | hoehle/04-leuchtgrotte.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Höhle | 5 | hoehle/05-foerderwerk.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Höhle | 6 | hoehle/06-tiefenschlund.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Vulkan | 1 | vulkan/01-glutpfad.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Vulkan | 2 | vulkan/02-aschefeld.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Vulkan | 3 | vulkan/03-feuerberg.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Vulkan | 4 | vulkan/04-magmakammer.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Vulkan | 5 | vulkan/05-schlackewerk.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Vulkan | 6 | vulkan/06-feuerschlund.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |
| Vulkan | 7 | vulkan/07-kraterherz.json | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen | offen |

**Nicht in der Liste (mit Grund):**
- `dschungel/boss-bruno.json` – Boss-Level (bewusst nicht angefasst).
- Welt Wasser – in `worlds.json` ohne Level (nur Probe-Level `levels/test/wasser.json`), bewusst nicht angefasst.
- `archiv/level-3-alter-entwurf.json` – alter Entwurf, in keiner Welt.
- `levels/test/*` – Mini-Testlevel (neue kommen dazu: `bahnen.json` und die Testlevel der neuen Elemente).
- `levels/editor-format/*` – gespiegelte Editor-Fassungen; werden mit jedem geänderten Level mitgezogen.

## Entscheidungen (ohne Rückfrage getroffen)
1. **Sicherung als Branch statt Tag auf GitHub:** Tags werden vom Git-Zugang abgelehnt (bekannt aus allen früheren
   Ausbau-Schritten); der Branch `vor-nacht-ausbau` zeigt auf denselben Commit. Lokal gibt es zusätzlich den Tag.
2. **Bahnen-Test:** eigenes Testlevel `levels/test/bahnen.json` und 7 Szenarien (`tests/bahnen.js`). Aufgezeichnet wird mit
   „spielenden“ Szenarien, gespeichert werden nur die Tasten je Schritt; der Test spielt diese festen Tasten ab und
   vergleicht x, y, vx, vy, Boden, Wand, Seil, Schirm und Seillänge **exakt** (Gleitkomma-genau).
   Die Szenarien enthalten bewusst KEIN Herunterfallen an einer Wand schneller als 4,5 (die spätere Wand-Rutsch-Bedingung);
   der Aufzeichner prüft das und meldet „Rutsch-Bedingung: 0“. Grund: genau dort greift das neue Wand-Rutschen
   (gewollt), überall sonst muss die Bahn gleich bleiben.
3. **Dash-Taste:** Affe/Spieler 1 = K, Spieler 2 = Num 3, Controller = △/Y (alle frei, keine Überschneidung mit
   alten Tasten). Richtung = Richtungstasten + „hoch/runter“ (= Seil-ranziehen/geben-Tasten, Controller Steuerkreuz/Stick).
4. **Dash lädt nur mit Halt** (Boden, Wand, Haken, Haftfläche) und dauert 1 s (Spielwiese-Wert) – sonst wäre der Dash in
   der Luft beliebig oft nutzbar. Ein Dash in der Luft.
5. **Festhalten an Haftflächen mit „hoch“ halten** (Affe W, Schweinchen ↑) – die Spielwiese hatte eine eigene Taste;
   im echten Spiel gibt es keine freie Taste ohne Konflikt, „hoch“ ist dort sonst nur am Seil belegt (Haken greifen löst
   die Haftfläche). An der Unterseite zählt „hoch“ nicht als Dash-Richtung (sonst klebt man nach dem Dash sofort wieder).
6. **Wand-Rutschen ohne Taste:** greift nur, wenn man an einer Wand SCHNELLER als 4,5 fällt (Spielwiese-Wert), nicht
   beim Segeln/Seil/Dash. Der Wandsprung selbst ist unverändert (gleiche Bedingungen, inkl. Anlauf-Schwung). Der
   Bahnen-Test enthält bewusst keine solche Stelle (siehe 2.) – überall sonst ist alles gleich. In Leveln ändert es
   nur, wie schnell man an Wänden herunterkommt (Kamine nachmessen: P2/P3).
7. **Durchbruch-Wand ohne Rückprall:** zerbricht sofort, 80 % Schwung bleiben; danach 14 Schritte „Bruch-Fenster“ mit
   kostenlosem Anschluss-Dash ODER Sprung in der Luft (aus der Spielwiese übernommen).
8. **Trefferstopp friert das ganze Spiel ein** (2 bzw. 3 Schritte), nicht nur die Figur – so wirkt er im Koop fair
   (beide sehen denselben Moment), und kein Gegner/keine Falle läuft unsichtbar weiter.
9. **Controller je Typ:** erkannt am Gerätenamen (Xbox/045e → Xbox, PlayStation/DualShock/DualSense/054c → PlayStation,
   sonst „anderer“). Gespeichert je Spieler × Typ; nie gesetzter Typ = Standard (✕/A springen, ○/B Hebel, □/X Fähigkeit,
   △/Y Dash, Steuerkreuz). Menü-Navigation am Controller bleibt fest (✕/A bestätigen, ○/B zurück) – sonst könnte man
   sich aussperren. **Echte Controller wurden NICHT getestet**, nur ein simulierter Gamepad (Test tasten_controller_je_typ).
10. **Konflikte:** sofort rot markiert; Verlassen öffnet einen Dialog („Weiter ändern“ / „Änderungen verwerfen“) –
    gespeichert wird nur konfliktfrei. Tastatur-Konflikte zählen über beide Spieler (gemeinsame Tastatur), Controller-
    Konflikte je Spieler und Typ (jeder hat seinen eigenen Controller).

## Geänderte Tests
- `element_register`: erwartete Element-Liste um `durchbruch` und `haftflaeche` ergänzt (neue Elemente; alle bisherigen
  Prüfungen unverändert).
- `level19_magmakammer` und `level21_feuerschlund`, Etappe 4 „Doppel-Schacht“: der Bot-Affe wartet jetzt unten, bis
  Platte 10 den Kamin öffnet (`{'wait': '!!linkOn[10]'}` vor dem Klettern). Grund: vorher hüpfte er im noch
  geschlossenen Kamin auf und ab; mit dem (gewollten) Wand-Rutschen fällt er dabei langsamer, landet unten und hüpfte in
  den Nachbarschacht. Geprüft wird dasselbe wie vorher (Platte 10 öffnet den Kamin, Hebel 11 die Klappe, beide kommen
  durch); Level und Spiel für Menschen unverändert. Ohne Wand-Rutschen war der alte Plan grün (gegengeprüft).
- `editor_einseitige_plattform`: erwartete Reihenfolge im Reiter „Gelände“ um die neuen Werkzeuge `bruch` und `haft`
  ergänzt (neue Elemente stehen dort; alle anderen Prüfungen unverändert).
