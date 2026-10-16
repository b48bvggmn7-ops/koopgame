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
| P1 | Dash, Durchbruch-Wand, Wand-Rutschen, Haftfläche, Tastenbelegung (+ Editor, Tests, Doku) | fertig (großer Lauf grün) |
| P2 | Messwerkzeuge (Reichweite + Erfolgsfenster, Einstufung, Level-Vermesser, Exploit-Suche, Bild-Regel, Checkpoints, Münzen) | fertig (reichweite_messen, level_vermessen, stelle_pruefen, level_ascii, level_bau; Kombi-Zählung erweitert) |
| P3 | Alle 25 Level vermessen und anpassen | fertig bis auf Kombi-Mindestzahlen (braucht Entscheidung, siehe unten) |
| P4 | Zweiter Durchgang, Gesamtprüfung, Bericht | offen |

## Abnahme-Liste (25 Level)
Spalten = Level-Checkliste Phase 3: 1 Vermessen · 2 Kombis (Ist, Mindestzahl laut `tests/kombi_pruefen.py`; optionale
Bausteine zählen nicht) · 3 Landeplätze (Plattform-Regel) · 4 Zusammenarbeit · 5 Kamine (mit Wand-Rutschen nachgemessen,
Entscheidung 13) · 6 Haken (Haken-Regel) · 7 Münzen Pfad/Geschick/Meister · 8 Checkpoints (Anzahl, größte Lücke inkl.
Start/Ziel; über 70 nur mit begründeter Ausnahme in `tests/bildregel_ausnahmen.json`) · 9 Bild-Regel · 10 Fairness (jede
neue Stelle per Bot geschafft, Gegenprobe ohne neue Mechanik scheitert) · 11 Bot-Plan (neue Stellen je Baustein,
`tests/bausteine/stellen.py`) · 12 Doku · neue Elemente im Level (Gruppen).

| Welt | Nr | Datei | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | neu |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Dschungel | 1 | dschungel/01-dschungel.json | fertig | 4 (mind. 6) **offen** | geprüft | unverändert | nachgemessen | geprüft | 147/99/0 | 16, max. Lücke 66 | geprüft | Bot | B2×1 | fertig | Haft 0 · Bruch 1 |
| Dschungel | 2 | dschungel/02-baumkronen.json | fertig | 8 (mind. 8) | geprüft | unverändert | nachgemessen | geprüft | 63/62/0 | 13, max. Lücke 101 (bewusst) | geprüft | Bot | S1×3 | fertig | Haft 0 · Bruch 3 |
| Dschungel | 3 | dschungel/03-lianenschlucht.json | fertig | 10 (mind. 10) | geprüft | unverändert | nachgemessen | geprüft | 76/64/2 | 15, max. Lücke 82 (bewusst) | geprüft | Bot | B2×3, B3×2 | fertig | Haft 2 · Bruch 3 |
| Dschungel | 4 | dschungel/04-gluehwald.json | fertig | 4 (mind. 9) **offen** | geprüft | unverändert | nachgemessen | geprüft | 55/53/2 | 13, max. Lücke 70 | geprüft | Bot | B3×1, S1×3, S2×1 | fertig | Haft 2 · Bruch 3 |
| Dschungel | 5 | dschungel/05-dornenpfad.json | fertig | 6 (mind. 10) **offen** | geprüft | unverändert | nachgemessen | geprüft | 53/43/2 | 16, max. Lücke 61 | geprüft | Bot | S1×3, S2×2 | fertig | Haft 2 · Bruch 3 |
| Dschungel | 6 | dschungel/06-wipfelsturm.json | fertig | 5 (mind. 10) **offen** | geprüft | unverändert | nachgemessen | geprüft | 35/55/2 | 15, max. Lücke 70 | geprüft | Bot | S1×3, S2×2 | fertig | Haft 2 · Bruch 3 |
| Ruinen | 1 | ruinen/01-ruinen.json | fertig | 4 (mind. 12) **offen** | geprüft | unverändert | nachgemessen | geprüft | 79/54/2 | 14, max. Lücke 100 (bewusst) | geprüft | Bot | S1×3, S3×2 | fertig | Haft 2 · Bruch 3 |
| Ruinen | 2 | ruinen/03-fallengang.json | fertig | 1 (mind. 12) **offen** | geprüft | unverändert | nachgemessen | geprüft | 85/39/2 | 15, max. Lücke 76 (bewusst) | geprüft | Bot | S1×3, S2×2 | fertig | Haft 2 · Bruch 3 |
| Ruinen | 3 | ruinen/04-sonnentempel.json | fertig | 4 (mind. 12) **offen** | geprüft | unverändert | nachgemessen | geprüft | 72/20/2 | 15, max. Lücke 73 (bewusst) | geprüft | Bot | S1×3, S2×2 | fertig | Haft 2 · Bruch 3 |
| Ruinen | 4 | ruinen/02-mondnacht.json | fertig | 2 (mind. 8) **offen** | geprüft | unverändert | nachgemessen | geprüft | 37/26/2 | 9, max. Lücke 70 | geprüft | Bot | S1×3, S3×2 | fertig | Haft 2 · Bruch 3 |
| Ruinen | 5 | ruinen/05-felsenflucht.json | fertig | 2 (mind. 12) **offen** | geprüft | unverändert | nachgemessen | geprüft | 69/19/2 | 12, max. Lücke 106 (bewusst) | geprüft | Bot | S1×3, S2×2 | fertig | Haft 2 · Bruch 3 |
| Ruinen | 6 | ruinen/06-tempelherz.json | fertig | 0 (mind. 12) **offen** | geprüft | unverändert | nachgemessen | geprüft | 67/29/2 | 17, max. Lücke 61 | geprüft | Bot | S1×3, S2×2 | fertig | Haft 2 · Bruch 3 |
| Höhle | 1 | hoehle/02-tropfsteingang.json | fertig | 2 (mind. 12) **offen** | geprüft | unverändert | nachgemessen | geprüft | 58/36/2 | 16, max. Lücke 70 | geprüft | Bot | S1×3, S3×2 | fertig | Haft 2 · Bruch 3 |
| Höhle | 2 | hoehle/03-eisgrotte.json | fertig | 1 (mind. 12) **offen** | geprüft | unverändert | nachgemessen | geprüft | 43/39/2 | 15, max. Lücke 69 | geprüft | Bot | S1×3, S2×2 | fertig | Haft 2 · Bruch 3 |
| Höhle | 3 | hoehle/01-kristallhoehle.json | fertig | 4 (mind. 7) **offen** | geprüft | unverändert | nachgemessen | geprüft | 26/48/2 | 6, max. Lücke 70 | geprüft | Bot | S1×3, S2×1, S3×1 | fertig | Haft 2 · Bruch 3 |
| Höhle | 4 | hoehle/04-leuchtgrotte.json | fertig | 4 (mind. 12) **offen** | geprüft | unverändert | nachgemessen | geprüft | 81/41/2 | 15, max. Lücke 61 | geprüft | Bot | S2×2, S4×3 | fertig | Haft 2 · Bruch 3 |
| Höhle | 5 | hoehle/05-foerderwerk.json | fertig | 5 (mind. 12) **offen** | geprüft | unverändert | nachgemessen | geprüft | 75/49/2 | 16, max. Lücke 60 | geprüft | Bot | S1×1, S2×1, S3×1, S4×2 | fertig | Haft 2 · Bruch 3 |
| Höhle | 6 | hoehle/06-tiefenschlund.json | fertig | 4 (mind. 12) **offen** | geprüft | unverändert | nachgemessen | geprüft | 63/45/2 | 15, max. Lücke 70 | geprüft | Bot | S2×1, S3×1, S4×2 | fertig | Haft 2 · Bruch 2 |
| Vulkan | 1 | vulkan/01-glutpfad.json | fertig | 13 (mind. 15) **offen** | geprüft | unverändert | nachgemessen | geprüft | 62/52/2 | 16, max. Lücke 70 | geprüft | Bot | S1×3, S2×2 | fertig | Haft 2 · Bruch 3 |
| Vulkan | 2 | vulkan/02-aschefeld.json | fertig | 5 (mind. 15) **offen** | geprüft | unverändert | nachgemessen | geprüft | 88/20/2 | 16, max. Lücke 61 | geprüft | Bot | S1×3, S2×1, S3×1 | fertig | Haft 2 · Bruch 3 |
| Vulkan | 3 | vulkan/03-feuerberg.json | fertig | 12 (mind. 9) | geprüft | unverändert | nachgemessen | geprüft | 27/41/2 | 6, max. Lücke 86 (bewusst) | geprüft | Bot | S1×3, S2×1, S3×1 | fertig | Haft 2 · Bruch 3 |
| Vulkan | 4 | vulkan/04-magmakammer.json | fertig | 12 (mind. 15) **offen** | geprüft | unverändert | nachgemessen | geprüft | 58/72/2 | 15, max. Lücke 66 | geprüft | Bot | S1×3, S2×2 | fertig | Haft 2 · Bruch 3 |
| Vulkan | 5 | vulkan/05-schlackewerk.json | fertig | 6 (mind. 15) **offen** | geprüft | unverändert | nachgemessen | geprüft | 85/29/2 | 15, max. Lücke 70 | geprüft | Bot | S1×2, S3×2, S4×1 | fertig | Haft 2 · Bruch 3 |
| Vulkan | 6 | vulkan/06-feuerschlund.json | fertig | 1 (mind. 15) **offen** | geprüft | unverändert | nachgemessen | geprüft | 70/40/2 | 15, max. Lücke 61 | geprüft | Bot | S1×2, S2×2, S4×1 | fertig | Haft 2 · Bruch 3 |
| Vulkan | 7 | vulkan/07-kraterherz.json | fertig | 5 (mind. 15) **offen** | geprüft | unverändert | nachgemessen | geprüft | 62/40/2 | 15, max. Lücke 60 | geprüft | Bot | S1×3, S2×1, S3×1 | fertig | Haft 2 · Bruch 3 |

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

11. **Exploit-Regel (was gilt als Exploit und wird im Level behoben):** (a) über eine geschlossene Tür / an einem Rätsel
    vorbei, (b) Rollen-Abkürzung – eine Stelle, die früher nur EINE Figur schaffte (Koop-Absicht), schafft jetzt auch die
    andere, (c) ein Hilfs-Abschnitt (Haken/Pilz/Aufwind/Plattform) wird mit Dash *komfortabel* übersprungen. Knappe oder
    Grenz-Abkürzungen über Hilfs-Abschnitte bleiben als „Abkürzung für Könner“ (passt zu „schwer, aber machbar“) und stehen
    in der Level-Tabelle. Werkzeuge: `tests/level_vermessen.py` (Kandidaten), `tests/stelle_pruefen.py` (echte Physik).
12. **Bausteine:** neue Stellen werden aus geprüften Bausteinen gebaut (`levels/test/bausteine-nacht.json`, Test
    `bausteine_nacht` mit Gegenprobe ohne neue Mechanik): B1 Dash-Grube, B2 Durchbruch-Tor + Grube (Bruch-Fenster-Sprung),
    B3 Haftfläche über Grube, B4 Kamin mit Durchbruch-Deckel, B5 Haken → Durchbruch, B6 Haftfläche + Dash, B7 Segel-Dash-
    Grube (nur Schweinchen). Wichtig gelernt: Decken über Haftflächen und Gängen müssen DICK sein (sonst läuft man oben
    drüber), Haft-Absprung direkt unter der Haftfläche.
13. **Kamine neu vermessen (mit Wand-Rutschen):** Reaktionsfenster an der Wand (Schritte, nach denen der nächste
    Wandsprung noch höher führt) – Breite 3: 16 → 22, Breite 4: 10 → 16, Breite 5: 5 → 10. Kamine werden also gnädiger.
    Die Richtwert-Konstanten `KAMIN_*` bleiben (Harte Regel: bestehende Konstanten nicht ändern); das Prüfwerkzeug stuft
    weiter wie bisher ein (eher zu streng als zu lasch).
14. **Spiel-Format Stacheln:** x = Mitte, y = Unterkante (wie der Editor exportiert) – im Vermesser/Text-Bild berücksichtigt.

15. **Pflicht nur, wo kein alter Test läuft:** Die alten Level-Tests (Bot-Pläne) gehen fast alle Wege der Level ab
    (`tests/bausteine/abdeckung*.json`). Pflicht-Stellen auf diesen Wegen hätten die alten Tests gebrochen („nichts
    Bestehendes verlieren“, „Grün oder gar nicht“). Deshalb: Pflicht-Stellen nur in Dschungel 1/3/4 (freie Strecken),
    sonst **optionale** Stellen mit Münze – Weg und Rätsel bleiben, wer will, holt die Münze mit der neuen Mechanik.
16. **Optionale Bausteine S1–S4** (Versteck, Haft-Arm, Haft-Insel, Durchbruch-Nische): aus dem Hauptweg heraus
    erreichbar, nie auf einem Bot-Weg, nie an Elementen; die Münze dafür ist die nächste freie Münze (Anzahl,
    Reihenfolge und Farbe aller Münzen bleiben gleich). Jede Stelle hat Bot-Plan + Gegenprobe („ohne neue Mechanik
    kommt man nicht an die Münze“). Sie zählen NICHT als Kombi-Stelle (ehrliche Zählung).
17. **Kombi-Mindestzahlen nicht erzwungen:** Ruinen/Höhle/Vulkan haben fast keine freien flachen Strecken mehr (Vulkan:
    keine), jede neue Pflicht-Kombi müsste ein Rätsel oder eine Jagd umbauen – das ist eine Design-Entscheidung des
    Nutzers. Stand und Fehlmengen in der Abnahme-Liste (Spalte 2).
18. **Checkpoints nur ergänzt, nie entfernt:** neue nur in Lücken über 60 Spalten, auf Bot-Wegen mit festem Boden, nicht in
    Jagden (Fels, steigende Lava, Fahrten), nicht in Zwei-Wege-Staffeln, nicht zwischen Hebel und Tür, nicht in
    Lücken, die bereits als „Rätsel am Stück“ begründet sind. Abstände unter 40 bleiben (stehen vor schweren Stellen).
    In den vom Nutzer gestalteten Leveln (Dschungel 2, Ruinen 1, Mondnacht) keine Checkpoint-Änderung.
19. **Drei alte Checkpoints verschoben** (gefunden vom neuen Test `checkpoints_sicher`): Dschungel 1 232→230 (das
    Schweinchen stand nach dem Wiedereinstieg auf dem Pilz), Glühwald 177→175 (stand auf dem Teleporter), Tempelherz
    340→341 (Affe stand im Flammenstrahl). Je 1–2 Spalten, sonst nichts geändert.
20. **Münz-Klassen automatisch** (`tests/bausteine/muenzen.py --einstufen`): Pfad = höchstens 2 Reihen über einer
    Stehfläche, sonst Geschick, Münzen in Verstecken/Nischen Geschick; Meister von Hand (Haft-Arme/-Inseln, Haftdecken).
    Dschungel 1 und 2 ohne Meister-Münze (Einführung bzw. vom Nutzer gestaltet).

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
- `tests/kombi_pruefen.py` (Werkzeug, kein Test, aber Grundlage von `kombi_pruefung`): optionale Bausteine S1–S4 zählen
  nicht als Kombi-Stelle; die Ausnahmen in `tests/kombi_ausnahmen.json` sind dadurch unverändert gültig.

## Neue Tests (Phase 3)
`nacht_stellen_dschungel/ruinen/hoehle/vulkan` (alle neuen Stellen per Bot + Gegenprobe), `checkpoints_sicher` (an jedem
Checkpoint stehen beide nach dem Wiedereinstieg sicher), `muenz_klassen_level` (Einstufung aktuell, ≥2 Meister ab D3),
`bausteine_nacht` (B1–B7 im Testlevel), `muenz_klassen` (Editor/Spiel).

## Offene Punkte (brauchen eine Entscheidung)
- Kombi-Mindestzahlen (siehe Entscheidung 17 und Spalte 2): Fehlmengen je Level in der Abnahme-Liste.
- Tiefenschlund hat 2 statt 3 Durchbruch-Stellen (keine weitere freie Wandfläche ohne Rätsel).
- Checkpoint-Lücken über 60 in Leveln, wo nur Jagd/Staffel/Rätsel liegt (z. B. Felsenflucht, Feuerberg) – dort wäre ein
  Checkpoint mitten in der Jagd unfair; bleibt wie vom Level-Design vorgesehen.
