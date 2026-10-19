# Auftrag: Dschungel-Welt – neuer Hintergrund mit Wind, Tag und Nacht, Tiere/Deko

Du arbeitest am Browser-Spiel „Monchichi Koop“ (Repo `koopgame`). Lies zuerst `CLAUDE.md` und halte dich an die Regeln dort (Datei-Aufbau, Tests, Doku-Pflege).

## Ziel
In einer Vorschau-Seite habe ich (Leon) für die **Dschungel-Welt** einen neuen Look entworfen und über viele Rückfragen abgenommen. Er besteht aus vier Teilen:
- **A. Hintergrund (Tag):** dunkleres, sattes Blattgrün, mehrere Tiefen-Ebenen, Riesenblätter und Heliconien, Hängende Wedel und Lianen oben, Dunst.
- **B. Wind:** die Pflanzen wiegen sich leicht.
- **C. Nacht:** dichter, dunkelblauer Dschungel mit leuchtenden Pflanzen.
- **D. Tiere/Deko:** weniger, dezenter, nur auf freien Stellen.

Übertrage **genau diesen Look und diese Regeln** in die **Dschungel-Welt** des Spiels. Es ist eine **reine Optik-/Deko-Übernahme**: Physik, Logik, Level-Daten, Boden/Wand/Elemente und Editor-Funktionen bleiben unverändert.

**Nur diese Runde:** Dschungel-Welt (Welt 1), nur die Tageszeiten **Tag** und **Nacht**. Alle anderen Welten (Ruinen, Höhle, Vulkan, Wasser …) bleiben **exakt wie sie sind**. Andere Tageszeiten der Dschungel-Welt (Morgen, Abend …) bekommen **nichts Neues** und verhalten sich wie bisher (bekommen aber den neuen Hintergrund A+B); sag mir, wie das im Spiel aussieht. Baue es so, dass sich pro Welt und pro Tageszeit später ein eigener Look einhängen lässt (z. B. über `WORLD_LOOKS`/`aussehen` der Welt), ohne andere Welten anzufassen.

## Reihenfolge / Abhängigkeit
Diese Runde läuft **nach** dem `aussehen-paket` (neue Materialien und Elemente). Hole zuerst den neuesten Stand von `main` und prüfe, dass dieser Stand drin ist. Falls nicht: stopp und sag mir Bescheid, statt darauf aufzubauen.

**Falls es einen früheren Auftrag „hintergrund-paket“ gab:** dieses Paket ersetzt ihn und enthält alles davon. Prüfe, ob davon schon etwas im Spiel ist (Dschungel-Hintergrund, Wind). Wenn ja: nicht doppelt bauen, sondern den vorhandenen Stand an diese Beschreibung angleichen und nur Fehlendes ergänzen. Sag mir, was schon da war. Ein evtl. noch im Repo liegender Ordner `hintergrund-paket/` ist veraltet: nicht mehr benutzen und am Ende löschen.

**Arbeitsweise:** Parallel kann eine andere Sitzung an Level-Dateien arbeiten. Arbeite in einem eigenen Git-Worktree auf einem **neuen Branch** und fasse keine Level-Dateien (`levels/…`) an. Nach `main` übernimmst du **nicht** selbst: erst fragen.

## Wichtigste Regel: nicht neu erfinden, übernehmen
Zeichenschritte, Farben, Zahlen, Größen, Abstände und Reihenfolge sind Absicht. Bitte **nicht** „verbessern“, vereinfachen oder in eigene Worte umsetzen. Übernimm die Logik aus den Referenz-Dateien und passe nur die Anbindung ans Spiel an. Geht etwas technisch nicht 1:1, sag es mir, statt still etwas anderes zu bauen.

## Paket-Inhalt (Ordner `dschungel-paket/`)
- `referenz/dschungel-hintergrund.js` – Vorschau-Code des Tag-Hintergrunds (Teil A und B). **Referenz, nicht direkt einkopieren.** Der Kopf der Datei erklärt die Koordinaten (Bild-Einheiten, Zoom 0,85, Ebenen wiederholen sich alle `PER = 2000`). Dinge wie `hex`, `SC`, `cv`, `g`, `camX` heißen im Spiel anders. Enthalten sind: Himmel/Farbverlauf (`drawBG`), alle Pflanzen-Bilder (`drawFrond`, `frondSprite`, `palmSprite`, `bananaSprite`, `monsteraSprite`, `heliSprite`, `mkTrunk`), die Ebenen (`makeLayers`, `band`, `trunks`, `mushrooms` = hier Riesenblatt-Pflanzen, `lianas`/`drawLiana`), Dunst (`mist`), Lichtstaub (`BOK`), Vignette und der Wind (`wind`). Die dickeren Lianen sind hier schon eingearbeitet.
- `referenz/nacht-look.js` – Vorschau-Code der Nacht (Teil C). Der Kopf der Datei erklärt Kürzel und Einhak-Punkte.
- `referenz/tiere-platzierung.js` – Vorschau-Code für die neue Platzierung der Tiere, das Vogel-Verhalten, das Nacht-Leuchten der Tiere und die Hintergrund-Tiere (Teil D). Die Zeichenfunktionen der Tiere selbst gibt es im Spiel schon (`js/20-tiere.js`, `js/17-deko.js`); übernimm nur die **neuen Regeln**.
- `bilder/dschungel-tag.png`, `bilder/dschungel-nacht.png` – **so soll es aussehen** (Boden-Abschnitt, Tiere am Boden eingeschaltet).
- `bilder/dschungel-boden.png`, `-dornen`, `-haken`, `-schalter-tueren`, `-aufwind`, `-durchbruchwand` – älterer Stand des Tag-Hintergrunds hinter Spielgeschehen (zeigt Lesbarkeit). **Boden und Elemente auf allen Fotos sind Vorschau-Stand und gehören nicht zu dieser Runde**; es geht um Hintergrund, Licht und Tiere.

## A. HINTERGRUND TAG (Reihenfolge von hinten nach vorne)
1. Himmel: dunkler Grün-Verlauf (Vorschau-Farben übernehmen, nicht das bisherige helle Morgen-Blau).
2. Sehr ferne und ferne Ebene (`xfar`, `far`): blassgrüne Dschungelhänge im Dunst.
3. Hängende Wedel am oberen Rand (`dach1` hell und dunstig, `dach2` dunkler, dazu die dichten Dachblätter).
4. Mittlere Ebenen: Palmen, Bananenblätter, Monstera, Heliconien, Stämme (`mid`, `stems`, `trunks`).
5. Riesenblatt-Pflanzen (in der Vorschau die Ebene `mushrooms()`).
6. Lianen: **weit oben und zurückhaltend** (Länge 110–290), aber **kräftig genug sichtbar**: Hauptlinie `(nah ? 6,5 : 5) × (1 − k × 0,4)`, Glanzlinie `(nah ? 2,8 : 2,2) × (1 − k × 0,35)`, Grundtransparenz `nah ? 0,6 : 0,42` (so steht es in der Referenz).
7. Dunst/Nebel und Lichtstaub (`mist`, `BOK`), nahe Ebene (`near`), Vignette.
**Lichtstrahlen sind aus** (`show.strahl = 0`): gefielen mir nicht. Nicht einbauen, nicht „zur Sicherheit“ als Schalter lassen.

## B. WIND
In der Vorschau wiegen sich die Pflanzen leicht (`wind(x,t) * Stärke` je Ebene, Stärke nimmt nach vorne zu). Im Spiel sind die Ebenen bisher **einmal vorgezeichnet** (`js/11-hintergrund.js`, `BG_TW = 1600`, danach nur 2 × `drawImage` je Ebene). Deshalb:
- Mache **Wind-Ebenen**: die Pflanzen einzeln als kleine Bilder (Sprites) vorzeichnen und pro Bild nur mit einem kleinen Wiege-Winkel/Versatz zeichnen, wie in `band(...)` der Referenz. **Nicht** pro Bild die Pflanzen neu zeichnen.
- Fallback, falls es zu teuer wird: Wind nur für die vorderen Ebenen (`near`, `mid`), die hinteren bleiben vorgezeichnet. Wenn du den Fallback brauchst, sag mir, was wo bewegt wird.
- Wind soll auf schwachen Geräten **abschaltbar** sein (wie das Hitzeflimmern der Lava): dann ist alles still, sieht aber gleich aus.
- Der Wind ist reine Deko (zeitbasiert, `performance.now`), kein Einfluss auf Figuren, Aufwind oder Physik.

## C. NACHT (Dschungel) – was gemeint ist
Der Nacht-Dschungel ist **genauso dicht wie am Tag** (gleiche Ebenen: ganz fern, fern, Hängende Wedel, Riesenblätter, Stamm, Heliconien, Unterwuchs, nah) – nur anders eingefärbt und beleuchtet. **Es soll kein offener Himmel sichtbar sein** (höchstens vereinzelt zwischen den Blättern). Ruhig, kein Blinken, kein „Weihnachtsbaum“.

1. **Grund hinter den Ebenen:** dunkler Blau-Verlauf (`#04122e` → `#082a58` → `#0b4068` → `#0e5070`), dazu Sterne und der Mond wie in der Referenz (sie sind durch die Blätter kaum zu sehen).
2. **Einfärbung der Ebenen** (`TZ.tintOn`): erst Farbton blau (`color`-Mischung mit `rgb(30,96,150)`, nur auf den gezeichneten Pixeln), dann Kontrast/Helligkeit (`contrast(2) brightness(.58) saturate(1)`), dann ein dünner dunkelblauer Verlauf darüber. Das hält die Blattformen lesbar und kräftig, statt matschig. **Wichtig für die Leistung:** in der Vorschau läuft das pro Bild. Im Spiel bitte **einmal beim Vorzeichnen der Ebenen/Sprites** anwenden (die Ebenen sind dort ja vorgezeichnet) oder auf andere Weise günstig lösen. **Bildrate messen** (siehe unten).
3. **Dunst und Lichtstaub:** Dunstfarbe nachts `34,100,160`; die großen durchscheinenden **Bokeh-Kreise sind nachts aus**. Lichtstaub-Punkte nachts nur ~20 statt ~90, Glühwürmchen nur 6 (kein Gewimmel).
4. **Riesenblätter:** leuchten **konstant und dezent** (türkise Füllung + hellere Adern, `lighter`-Mischung mit Deckkraft `0,3`). **Kein Pulsieren.** Die „Hängenden Wedel“ leuchten **nicht** (`dachGlow` aus).
5. **Licht im Hintergrund** (`TZ.bg`): drei sehr weiche Lichtschäfte durchs Blätterdach (Deckkraft ~0,075, atmen langsam), weiche Lichtflecken am Baumstamm, kleine leuchtende Baumpilze und ein feiner Moosstreifen an den Stammkanten (unregelmäßig verteilt), flache Nebelschwaden knapp über dem Boden, und **16 ferne, unscharfe Leuchtpflanzen** hinter dem Spielfeld (einmal vorgezeichnet und weich gemacht, dann nur noch Bild zeichnen).
6. **Leuchtpflanzen am Boden** (`TZ.pw`): drei Arten (Pilzgruppe, Glockenstängel, Leuchtfarn), nur auf **Oberseiten fester Erd-Flächen** (`'g'`, Breite ≥ 60, nicht an der Decke, nicht in einer anderen Fläche), nie im Boden, nie in der Luft. **Smart verteilt:** große Flächen mit unregelmäßigen Abständen (260 bis 780 Pixel), kleine Plattformen höchstens 1–2 Pflanzen, keine zwei gleichen Arten direkt nebeneinander. Gleichmäßiges Leuchten mit kleiner Lichtpfütze auf dem Boden, **kein Blinken**.
7. **Figuren:** der Boden-Bereich wird etwas abgedunkelt und die Figuren bekommen ein weiches kühles Licht (`TZ.figGlow`), damit sie lesbar bleiben.
8. **Bewusst nicht einbauen** (alles verworfen): Mondstrahlen, blinkende oder bunte Lichter/Lichterketten, pulsierende Blätter, Palmen- oder Hügel-Silhouetten als Hintergrund, Leuchten der Hängenden Wedel, Flechten-Punkte im Boden.

## D. TIERE und DEKO (Tag und Nacht)
**Dichte:** deutlich **weniger** als bisher. In meiner Vorschau steht im Boden-Abschnitt ungefähr: 1 Faultier (nachts Fledermaus), 1 Frosch (nachts statt dessen 1 Schnecke), 2 Vögel (nachts Eulen), 1–2 Schmetterlinge (nachts Glühwürmchen). Das ist der Maßstab.

Regeln (siehe `DK.build` in `referenz/tiere-platzierung.js`, Zahlen übernehmen):
- **Boden-Tiere** (Frosch, Schnecke, Pilz, Knospe): Wahrscheinlichkeit pro Schritt Frosch 0,018, Schnecke 0,03, Pilz 0,035, Knospe 0,04. Zwischen zwei Boden-Tieren mindestens **650 px**; Frosch und Schnecke untereinander mindestens **1400 px**.
- **Nachts wird aus dem Frosch eine Schnecke.**
- **Nie in Materialien:** nur dort, wo im Umkreis (±34 px, bis 46 px Höhe) kein Block und keine Stufe steht, mit **45 px Abstand zum Rand** der Fläche. Frösche und Schnecken brauchen mindestens **70 px freie Laufstrecke**, sonst gibt es sie dort nicht. Beim Laufen stoppen sie vor Stufen/Blöcken.
- **Nicht in den Pflanzen:** nicht direkt an Agaven, Blumen (und nachts Leuchtpflanzen). Steht ein Tier ungünstig, rückt es zur nächsten freien Stelle auf derselben Fläche; gibt es keine, entfällt es. Laufstrecke endet vor solchen Pflanzen. (Das dichte Unterholz/Gras am Boden zählt nicht als Hindernis.)
- **Hängende Tiere** (Faultier/Fledermaus): höchstens eins pro **1300 px** Level-Länge.
- **Schmetterlinge/Glühwürmchen:** seltener (Wahrscheinlichkeit 0,07, Abstand 800 px) und nur, wo darüber nichts im Weg ist.
- **Vögel:** sitzen auf **Oberseiten** fester Flächen (auf Wänden/Blöcken und Boden, nie an der Decke), bevorzugt auf der höchsten Fläche pro **900 px**; nachts Eulen. **Sie fliegen nicht weg** (kein Aufscheuchen durch Spieler/Maus), sondern bleiben sitzen, picken und hüpfen wie bisher.
- **Hintergrund-Tiere** (nur dezent, unscharf wie ihre Umgebung, `BA.B`): Schnecken, die den Baumstamm hochkriechen (Start knapp über dem Boden), ein paar ferne Schmetterlinge (nachts Nachtfalter), nachts Fledermäuse weit hinten im oberen Bereich. **Keine Schlangen und keine Geckos** (verworfen).
- **Nacht-Leuchten der Tiere** (`DK.glow`): Frosch, Schnecke, Knospe, Pilz und Eulen-Augen leuchten sanft in der Nacht.
- Alles ist reine Deko. Kein Einfluss auf Physik, Figuren, Punkte oder Level-Logik.

## Leistung (wichtig)
- **Messe die Bildrate** vorher/nachher (Dschungel-Level mit viel Bildschirm-Inhalt), für **Tag (mit Wind) und Nacht**. Das Spiel darf nicht spürbar langsamer werden.
- Alles Aufwendige (Einfärbung, ferne Leuchtpflanzen, Sprites) **einmal vorzeichnen und zwischenspeichern**, nicht pro Bild neu rechnen. Weichzeichner (`filter: blur`) sparsam: nur wenn nötig, nie pro Bild für viele Dinge.
- Wenn etwas zu teuer ist: sag mir, was du vereinfachst, statt es still zu streichen. Auf schwachen Geräten sollen sich **Wind** und die **Nacht-Beleuchtung** (Lichtschäfte, Nebel, ferne Pflanzen) **abschalten** lassen; dann sieht es gleich aus, nur ruhiger.
- Aufbau bei Start/Levelwechsel darf die Ladezeit nicht merklich verlängern.

## Regeln
- **Lesbarkeit zuerst:** Boden, Wände, Figuren, Münzen, Haken, Hebel und Türen müssen vor dem Hintergrund, auch nachts, sofort erkennbar bleiben. Der Hintergrund bleibt kontrastarm/dunstig. Wirkt es im Spiel zu dunkel oder unruhig, sag es mir, statt still zu ändern.
- **Nahtlos:** Ebenen wiederholen sich ohne sichtbare Kante (Kachel `BG_TW`/`PER`; auch bei den neuen Sprites und Verläufen. In der Vorschau gab es zwischendurch Kanten, bitte prüfen).
- **Das Parallax-Verhalten der bestehenden Ebenen bleibt** (Faktoren, Kamera, Zoom); bring die Referenz-Ebenen auf diese Faktoren, ändere nicht die Kamera.
- **Vorhandene Dschungel-Deko im Hintergrund** (Wasserfall, Vogelschwarm, Wolken) bleibt nur, wenn sie zum neuen Look passt. In der Vorschau gibt es keine Wolken und keinen Wasserfall. Frag mich im Zweifel, bevor du etwas streichst.
- **Zusammenspiel mit den bestehenden Tageszeit-/Wetter-Themen** (`10a-themen.js`, `10b-design-look.js`, `TIME_LAYERS`): Ein Dschungel-Level mit Tageszeit „Nacht“ bekommt den neuen Nacht-Look **statt** der bisherigen Nacht-Abdunklung (kein Doppel-Dunkel). Nenne mir, wie du die Auswahl gelöst hast und wie Wetter (Regen etc.) dazu aussieht (Wetter ist **nicht** Teil dieser Runde, darf aber nicht kaputtgehen).
- Keine Zahlen, Buchstaben oder Debug-Anzeigen im Spiel-Bild. Die Vorschau-Schalter („Tiere am Boden“, „Tiere im Hintergrund“, Zeit-Verschiebung) kommen **nicht** ins Spiel.

## Tests (wichtig)
Ein vollständiger Testlauf dauert ca. 5 Stunden. **Nicht zwischendurch** starten. Zwischendurch nur das Nötigste (Datei lädt fehlerfrei, Dschungel-Level öffnet in Tag und Nacht). **Ganz am Ende einmal**: Spiel und Editor starten, kompletten Testlauf, Ergebnis melden. Mach am Ende außerdem Bildschirmfotos aus 2–3 Dschungel-Leveln (Tag und Nacht) und eins aus einem anderen Welt-Level (zum Beleg, dass dort nichts geändert ist).

## Abnahme (bitte abhaken und mir melden)
- [ ] Tag: Hintergrund sieht aus wie in der Vorschau (Himmel, Ebenen, Hängende Wedel, Riesenblätter, Heliconien, Lianen oben und kräftig)
- [ ] Lichtstrahlen sind am Tag nicht vorhanden
- [ ] Wind wiegt die Pflanzen; Bildrate vorher/nachher gemessen; Wind abschaltbar
- [ ] Nacht: dichter blauer Dschungel ohne offenen Himmel, kräftig statt matschig, Riesenblätter leuchten konstant dezent
- [ ] Nacht-Licht: Schäfte, Stamm-Pilze, Bodennebel, ferne und nahe Leuchtpflanzen, wenige Glühwürmchen, nichts blinkt
- [ ] Leuchtpflanzen nur auf Oberseiten fester Flächen, smart verteilt
- [ ] Tiere deutlich weniger, nie in Materialien, nie in Pflanzen; Vögel sitzen und fliegen nicht weg; nachts Schnecke statt Frosch
- [ ] Bildrate Tag und Nacht gemessen; Nacht-Beleuchtung abschaltbar
- [ ] Boden, Figuren, Münzen, Elemente bleiben klar lesbar (Tag und Nacht)
- [ ] Andere Welten und andere Tageszeiten unverändert; pro Welt/Tageszeit lässt sich ein eigener Look einhängen
- [ ] Doku aktualisiert (`FEATURES.md`, `WELTEN.md`, `CLAUDE.md` wo nötig)
- [ ] Am Ende einmal: Spiel und Editor starten, kompletten Testlauf, alles grün
- [ ] Ordner `dschungel-paket/` (und ein evtl. alter `hintergrund-paket/`) am Ende **gelöscht** (nicht im Repo lassen)

## Rückmeldung am Ende
Kurz und in einfachem Deutsch (ich bin kein Programmierer): was übernommen ist, was **nicht 1:1** ging und warum, Bildrate vorher/nachher (Tag und Nacht), wie Nacht mit den bestehenden Themen zusammenspielt, in welchem Level ich es mir ansehen soll, und die Frage, ob ich es nach `main` übernehmen soll.
