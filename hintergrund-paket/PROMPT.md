# Auftrag: neuer Dschungel-Hintergrund (nur Dschungel-Welt) mit Wind – ins Spiel übernehmen

Du arbeitest am Browser-Spiel „Monchichi Koop“ (Repo `koopgame`). Lies zuerst `CLAUDE.md` und halte dich an die Regeln dort (Datei-Aufbau, Tests, Doku-Pflege).

## Ziel
In einer Vorschau-Seite habe ich (Leon) einen neuen **Dschungel-Hintergrund** entworfen und über viele Rückfragen abgenommen: dunkleres, sattes Blattgrün, mehrere Tiefen-Ebenen, Riesenblätter und Heliconien, Hängende Wedel und Lianen oben, Dunst und leichter Wind, der die Pflanzen sanft wiegt. Übertrage **genau diesen Look** in die **Dschungel-Welt** des Spiels. Das ist eine reine **Optik-Übernahme** des Hintergrunds: Physik, Logik, Level-Daten, Boden/Wand/Elemente und Editor-Funktionen bleiben unverändert.

**Nur diese Runde:** der Hintergrund der Dschungel-Welt (Welt 1). Die anderen Welten (Ruinen, Höhle, Vulkan, Wasser …) bleiben **exakt wie sie sind**. Sie werden später einzeln nachgezogen; baue es deshalb so, dass sich pro Welt ein eigener Hintergrund einhängen lässt (z. B. über `WORLD_LOOKS`/`aussehen` der Welt), ohne die anderen Welten anzufassen.

## Reihenfolge / Abhängigkeit
Diese Runde läuft **nach** dem `aussehen-paket` (neue Materialien und Elemente). Hole zuerst den neuesten Stand von `main` und prüfe, dass dieser Stand drin ist. Falls nicht: stopp und sag mir Bescheid, statt darauf aufzubauen.

**Arbeitsweise:** Parallel kann eine andere Sitzung an Level-Dateien arbeiten. Arbeite in einem eigenen Git-Worktree auf einem **neuen Branch** und fasse keine Level-Dateien (`levels/…`) an. Nach `main` übernimmst du **nicht** selbst: erst fragen.

## Wichtigste Regel: nicht neu erfinden, übernehmen
Zeichenschritte, Farben, Zahlen, Größen und Reihenfolge sind Absicht. Bitte **nicht** „verbessern“, vereinfachen oder in eigene Worte umsetzen. Übernimm die Logik aus `referenz/dschungel-hintergrund.js` und passe nur die Anbindung ans Spiel an. Geht etwas technisch nicht 1:1, sag es mir, statt still etwas anderes zu bauen.

## Paket-Inhalt (Ordner `hintergrund-paket/`)
- `referenz/dschungel-hintergrund.js` – Vorschau-Code des Hintergrunds. **Referenz, nicht direkt einkopieren.** Der Kopf der Datei erklärt die Koordinaten (Bild-Einheiten, Zoom 0,85, Ebenen wiederholen sich alle `PER = 2000`). Dinge wie `hex`, `SC`, `cv`, `g`, `camX` heißen im Spiel anders. Enthalten sind: Himmel/Farbverlauf (`drawBG`), alle Pflanzen-Bilder (`drawFrond`, `frondSprite`, `palmSprite`, `bananaSprite`, `monsteraSprite`, `heliSprite`, `mkTrunk`), die Ebenen (`makeLayers`, `band`, `trunks`, `mushrooms` = hier Riesenblatt-Pflanzen, `lianas`/`drawLiana`), Dunst (`mist`), Lichtstaub (`BOK`), Vignette und der Wind (`wind`).
- `bilder/*.png` – sechs Bildschirmfotos aus der Vorschau (Boden, Dornen, Haken, Schalter/Türen, Aufwind, Durchbruchwand). Sie zeigen, wie der Hintergrund hinter Spielgeschehen wirkt. **Der Boden und die Elemente auf den Fotos sind alter Stand und gehören nicht zu dieser Runde**; es geht nur um alles, was dahinter liegt.

## Was zum Look gehört (Reihenfolge von hinten nach vorne)
1. Himmel: dunkler Grün-Verlauf (Vorschau-Farben übernehmen, nicht das bisherige helle Morgen-Blau).
2. Sehr ferne und ferne Ebene (`xfar`, `far`): blassgrüne Dschungelhänge im Dunst.
3. Hängende Wedel am oberen Rand (`dach1` hell und dunstig, `dach2` dunkler, dazu die dichten Dachblätter).
4. Mittlere Ebenen: Palmen, Bananenblätter, Monstera, Heliconien, Stämme (`mid`, `stems`, `trunks`).
5. Riesenblatt-Pflanzen (in der Vorschau die Ebene `mushrooms()`).
6. Lianen: **weit oben und zurückhaltend**, nicht prominent (Länge 110–290, halbtransparent).
7. Dunst/Nebel und Lichtstaub (`mist`, `BOK`), nahe Ebene (`near`), Vignette.
**Lichtstrahlen sind aus** (`show.strahl = 0`): gefielen mir nicht. Nicht einbauen, nicht „zur Sicherheit“ als Schalter lassen.

## Wind
In der Vorschau wiegen sich die Pflanzen leicht (`wind(x,t) * Stärke` je Ebene, Stärke nimmt nach vorne zu). Im Spiel sind die Ebenen bisher **einmal vorgezeichnet** (`js/11-hintergrund.js`, `BG_TW = 1600`, danach nur 2 × `drawImage` je Ebene). Deshalb:
- Mache **Wind-Ebenen**: die Pflanzen einzeln als kleine Bilder (Sprites) vorzeichnen und pro Bild nur mit einem kleinen Wiege-Winkel/Versatz zeichnen, wie in `band(...)` der Referenz. **Nicht** pro Bild die Pflanzen neu zeichnen.
- **Messe die Bildrate** (vorher/nachher, Dschungel-Level mit viel Bildschirm-Inhalt). Der Wind darf das Spiel nicht spürbar langsamer machen.
- Fallback, falls es zu teuer wird: Wind nur für die vorderen Ebenen (`near`, `mid`), die hinteren bleiben vorgezeichnet. Wenn du den Fallback brauchst, sag mir, was wo bewegt wird.
- Wind soll auf schwachen Geräten **abschaltbar** sein (wie das Hitzeflimmern der Lava): dann ist alles still, sieht aber gleich aus.
- Der Wind ist reine Deko (zeitbasiert, `performance.now`), kein Einfluss auf Figuren, Aufwind oder Physik.

## Regeln
- **Lesbarkeit zuerst:** Boden, Wände, Figuren, Münzen, Haken, Hebel und Türen müssen vor dem Hintergrund sofort erkennbar bleiben. Der Hintergrund bleibt kontrastarm/dunstig. Wirkt es im Spiel zu unruhig, sag es mir, statt es still zu ändern.
- **Nahtlos:** Ebenen wiederholen sich ohne sichtbare Kante (Kachel `BG_TW`/`PER`).
- **Das Parallax-Verhalten der bestehenden Ebenen bleibt** (Faktoren, Kamera, Zoom); bring die Referenz-Ebenen auf diese Faktoren, ändere nicht die Kamera.
- **Vorhandene Dschungel-Deko im Hintergrund** (Wasserfall, Vogelschwarm, Wolken) bleibt nur, wenn sie zum neuen Look passt. In der Vorschau gibt es keine Wolken und keinen Wasserfall. Frag mich im Zweifel, bevor du etwas streichst.
- Die Tageszeit-/Wetter-Themen der Level (`10a-themen.js`, `10b-design-look.js`) dürfen den neuen Hintergrund nicht kaputt machen. Wenn ein Dschungel-Level z. B. „Nacht“ ist, soll es weiter funktionieren. Nenne mir, wie du das gelöst hast.
- Alles, was bei Start/Levelwechsel aufgebaut wird, darf die Ladezeit nicht merklich verlängern. Aufbau einmal, Zwischenspeicher nicht entfernen.
- Keine Zahlen, Buchstaben oder Debug-Anzeigen im Spiel-Bild.

## Tests (wichtig)
Ein vollständiger Testlauf dauert ca. 5 Stunden. **Nicht zwischendurch** starten. Zwischendurch nur das Nötigste (Datei lädt fehlerfrei, Dschungel-Level öffnet). **Ganz am Ende einmal**: Spiel und Editor starten, kompletten Testlauf, Ergebnis melden. Mach am Ende außerdem je ein Bildschirmfoto aus 2–3 Dschungel-Levels und eins aus einem anderen Welt-Level (zum Beleg, dass dort nichts geändert ist).

## Abnahme (bitte abhaken und mir melden)
- [ ] Dschungel-Hintergrund sieht aus wie in der Vorschau (Himmel, Ebenen, Hängende Wedel, Riesenblätter, Heliconien, Lianen oben)
- [ ] Lichtstrahlen sind nicht vorhanden
- [ ] Wind wiegt die Pflanzen; Bildrate vorher/nachher gemessen; Wind abschaltbar
- [ ] Boden, Figuren, Münzen, Elemente bleiben klar lesbar
- [ ] Andere Welten sehen unverändert aus; pro Welt lässt sich ein eigener Hintergrund einhängen
- [ ] Doku aktualisiert (`FEATURES.md`, `WELTEN.md`, `CLAUDE.md` wo nötig)
- [ ] Am Ende einmal: Spiel und Editor starten, kompletten Testlauf, alles grün
- [ ] Ordner `hintergrund-paket/` am Ende **gelöscht** (nicht im Repo lassen)

## Rückmeldung am Ende
Kurz und in einfachem Deutsch (ich bin kein Programmierer): was übernommen ist, was **nicht 1:1** ging und warum, Bildrate vorher/nachher, in welchem Level ich es mir ansehen soll, und die Frage, ob ich es nach `main` übernehmen soll.
