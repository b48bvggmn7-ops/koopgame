# Nacht-Bericht – Nacht-Ausbau (Dash, Durchbruch, Wand-Rutschen, Haftfläche, Tasten, alle Level)

Kurz gesagt: Die vier neuen Mechaniken aus der Spielwiese sind im echten Spiel, alle Tasten (Tastatur und Controller)
sind frei belegbar, und alle 25 Level von Dschungel, Ruinen, Höhle und Vulkan sind vermessen und ergänzt.
**Nicht angefasst:** Wasserwelt, alle Boss-Level (auch Bruno), `spielwiese/` – geprüft per Vergleich mit dem
Sicherungs-Stand `vor-nacht-ausbau` (kein einziger Unterschied in diesen Dateien).

**Wichtig:** Echte Controller wurden **NICHT** getestet – nur ein simulierter Controller im Test
(`tasten_controller_je_typ`, PlayStation und Xbox). Bitte einmal mit deinem PS4-Controller ausprobieren.

## Harte Regel: alte Bewegung unverändert
Sprung, Wandsprung, Haken/Seil, Laufen, Schwerkraft, Segeln, Schweben, Aufwind und Pilze verhalten sich Schritt für
Schritt wie vorher. Beweis: Test `bahnen_alte_mechaniken` – 7 Szenarien mit beiden Figuren (~2400 Schritte) wurden
**vor** dem Ausbau aufgezeichnet und werden in jedem Testlauf gleitkomma-genau verglichen (x, y, Tempo, Boden, Wand,
Seil, Schirm). Grün. Kein Wert in `js/02-physik-werte.js` wurde geändert (nur neue Werte dazu). Einzige neue Wirkung
ohne neue Taste: das Wand-Rutschen (wer an einer Wand schneller als 4,5 fällt, rutscht gebremst).

## Tasten (Standard-Belegung)
| | Affe (Spieler 1) | Schweinchen (Spielerin 2) | Controller |
|---|---|---|---|
| Laufen | A / D | ← / → | Stick / Steuerkreuz |
| Springen / Wandsprung | Leertaste | Num 0 | ✕ |
| Fähigkeit | G = Haken | Num 1 halten = Schirm | □ |
| Seil ranziehen / geben | W / S | – | hoch / runter |
| Hebel | J | Num 2 | ○ |
| **Dash (neu)** | **K** | **Num 3** | **△** |
| **Haftfläche festhalten (neu)** | W halten | ↑ halten | hoch |

**Tasten belegen:** Startmenü → Optionen → „⌨ 🎮 Tasten belegen …“. Spieler 1 und Spieler 2 getrennt, Tastatur und
Controller getrennt. Aktion anklicken → neue Taste bzw. Controller-Knopf drücken (Esc / Options = abbrechen).
Doppelte Belegungen werden sofort rot; verlassen geht erst, wenn alles eindeutig ist (oder „Änderungen verwerfen“).
„Auf Standard zurücksetzen“ je Spieler. Der Controller merkt sich die Belegung je Typ (PlayStation / Xbox / anderer).
Menü-Steuerung am Controller bleibt fest (✕ bestätigen, ○ zurück), damit man sich nicht aussperren kann.

## Was ist neu im Spiel
- **Dash:** kurzer Stoß in 8 Richtungen, am Boden und in der Luft (einmal in der Luft), lädt in 1 s wieder auf, aber nur
  mit Halt (Boden, Wand, Haken, Haftfläche).
- **Durchbruch-Wand:** rissiger Stein, nur ein Dash zerbricht ihn; danach kurz ein Gratis-Sprung oder -Dash in der Luft.
- **Wand-Rutschen:** automatisch, bremst schnelles Fallen an Wänden (Kamine werden etwas gnädiger).
- **Haftfläche:** lila Kleb-Decke – „hoch“ halten, festhalten, mit links/rechts entlangrollen, auch um Ecken.
- **Münz-Klassen:** Pfad / Geschick / Meister (Meister-Münzen funkeln). Im Editor beim Münz-Werkzeug wählbar.
- **Editor:** neue Werkzeuge „Durchbruch“ und „Haftfläche“ (Reiter Gelände).

## Die Level
Pflicht-Stellen (muss man spielen) gibt es nur dort, wo kein alter Level-Test läuft: Dschungel 1 (sanfte Probe,
Durchbruch-Wand 715), Dschungel 3 (2 Haftdecken über Stachelgruben, 3 Durchbruch-Säulen) und Dschungel 4 (Haftdecke).
Überall sonst sind die neuen Mechaniken **optionale Stellen mit einer Münze**: Wege und Rätsel bleiben genau wie
vorher, wer die Münze will, braucht die neue Mechanik:
- **Versteck (S1):** Durchbruch-Boden, darunter eine Mulde mit Münze (Dash nach unten).
- **Haft-Arm (S2):** Felsarm über dem Abgrund, Meister-Münze unter dem Arm-Ende – nur hängend erreichbar.
- **Haft-Insel (S3):** schwebende Haftfläche 4 Reihen hoch, Meister-Münze oben drauf (Sprung schafft nur 3 Reihen).
- **Durchbruch-Nische (S4):** Münze hinter einem rissigen Stein in der Wand.

Außerdem: 11 neue Checkpoints in zu langen Lücken, 3 alte Checkpoints um 1–2 Spalten verschoben (man stand nach dem
Wiedereinstieg auf einem Pilz, einem Teleporter bzw. in einem Flammenstrahl), alle Münzen eingestuft (Anzahl, Reihenfolge,
Farbe und Lage gleich geblieben; nur einzelne Münzen sind zu den neuen Stellen gewandert).

### Tabelle je Level
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
Spalten: siehe NACHT-STATUS.md (Level-Checkliste 1–12). „neu“ = Anzahl Haftflächen-/Durchbruch-Gruppen im Level.

## Entscheidungen (ohne Rückfrage)
Alle 20 Entscheidungen stehen mit Begründung in NACHT-STATUS.md. Die wichtigsten:
1. Dash-Taste K / Num 3 / △; Haftfläche mit „hoch“ halten (keine freie Extra-Taste).
2. Dash lädt nur mit Halt – sonst wäre er in der Luft beliebig oft nutzbar.
3. Controller-Belegung je Spieler UND je Controller-Typ; Menü-Knöpfe fest.
4. Pflicht-Stellen nur, wo kein alter Test läuft; sonst optionale Stellen mit Münze (nichts Bestehendes kaputt machen).
5. Optionale Stellen zählen **nicht** als Kombi (ehrliche Zählung).
6. Checkpoints nur ergänzt, nie in Jagden, Zwei-Wege-Staffeln oder zwischen Hebel und Tür.
7. In deinen selbst gestalteten Leveln (Dschungel 2, Ruinen 1, Mondnacht) nur Ergänzungen (Verstecke, Haft-Inseln,
   Münz-Klassen) – keine Wege, keine Checkpoints geändert.

## Offen – braucht deine Entscheidung
- **Kombi-Mindestzahlen** (Ruinen/Höhle 12, Vulkan 15 je Level): nicht erreicht (Spalte 2 der Tabelle). Es gibt fast
  keine freie Strecke mehr, die nicht zu einem Rätsel oder einer Jagd gehört (im Vulkan keine einzige). Neue
  Pflicht-Kombis heißen: bestehende Rätsel/Jagden umbauen. Sag mir, welche Level ich dafür umbauen darf.
- **Tiefenschlund** hat 2 statt 3 Durchbruch-Stellen (keine weitere freie Wandfläche).
- **Lange Checkpoint-Lücken** in Jagden/Staffeln (z. B. Felsenflucht, Feuerberg) bleiben – ein Checkpoint mitten in
  einer Jagd wäre unfair.
- **Echte Controller** ungetestet (siehe oben).

## Tests
- 216 Tests (vorher 200). Neu u. a.: bahnen_alte_mechaniken, dash_richtungen_und_laden, durchbruch_wand, wand_rutschen,
  haftflaeche, tasten_belegen_menue, tasten_controller_je_typ, tasten_alter_spielstand, muenz_klassen,
  muenz_klassen_level, bausteine_nacht, nacht_stellen_dschungel/ruinen/hoehle/vulkan (jede neue Stelle per Bot +
  Gegenprobe ohne neue Mechanik), checkpoints_sicher.
- **Geänderte alte Tests** (mit Begründung in NACHT-STATUS.md): element_register (Liste um 2 neue Elemente ergänzt),
  editor_einseitige_plattform (Werkzeug-Reihenfolge um 2 neue Werkzeuge ergänzt), level19_magmakammer und
  level21_feuerschlund (Bot-Affe wartet im Doppel-Schacht, bis die Platte den Kamin öffnet – wegen Wand-Rutschen).
- Großer Lauf am Ende: **216 bestanden, 0 fehlgeschlagen** (danach nur noch dieser Bericht geändert).

## So testest du
1. Spiel starten, Dschungel 3 (Lianenschlucht): Stachelgrube mit lila Decke – springen, **W** (Affe) bzw. **↑**
   (Schweinchen) halten, mit links/rechts entlangrollen. Etwas weiter: rissige Säule – davor **K** (Affe) bzw. **Num 3**
   (Schweinchen) für den Dash.
2. In fast jedem Level: rissige Bodenstellen (Dash nach unten = **S + K** bzw. **↓ + Num 3**), lila Felsarme über
   Abgründen und lila schwebende Inseln mit funkelnder Meister-Münze.
3. Optionen → „Tasten belegen“: eine Taste ändern, absichtlich doppelt belegen (wird rot), wieder zurücksetzen.
4. Controller: in „Tasten belegen“ den Controller-Teil öffnen und einen Knopf umlegen.
5. Test-Sprung zu Checkpoints wie immer mit **C** / **X**.
6. Alle Tests: `python tests/run_tests.py` (einmalig vorher `pip install playwright && playwright install chromium`).

## Zurück zum Stand vor der Nacht
Branch `vor-nacht-ausbau` auf GitHub (Commit a80bbe0; ein Tag ging über diesen Zugang nicht). Zurück geht es z. B. mit
`git checkout vor-nacht-ausbau` (nur ansehen) oder `git reset --hard vor-nacht-ausbau` auf main (alles Neue weg).
Der fertige Stand hat den Branch `ausbau-nacht-fertig`.

## Bilder
Neun Screenshots der neuen Stellen (Haftdecke, Durchbruch-Säule, Versteck, Haft-Arm, Haft-Insel, Nische, neuer
Checkpoint) habe ich dir im Chat mitgeschickt; im Projekt liegen sie nicht (keine großen Bilddateien im Repo). Alle
Stellen mit Spalte und Reihe stehen in `tests/bausteine/stellen.py`.
