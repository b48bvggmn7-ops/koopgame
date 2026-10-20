# Auftrag: Boden-Dekor im Dschungel (Dickicht, Gras, Blumen, Farn) + Nachbesserung Tiere

Dieser Auftrag ergänzt den umgesetzten „dschungel-paket“-Auftrag. Dort fehlte der Teil **Boden-Dekor**, außerdem kamen die Hintergrund-Tiere nicht bei jeder Auswahl an. Leon hat im Spiel gemerkt: kein Dickicht, kein dichtes Gras, keine Blumen, keine Schnecken am Baum, keine kleinen Schmetterlinge im Hintergrund, und es steht alles durcheinander.

**Ziel:** Der Dschungel-Boden sieht im Spiel so aus wie in der Vorschau (Bilder in `bilder/`, Code in `referenz/boden-dekor.js`) – bei Tag und bei Nacht. Nichts davon darf still wegfallen. Am Ende steht eine Liste „übernommen / bewusst nicht übernommen“ (siehe Rückmeldung).

Arbeitsweise: eigener Worktree, neuer Branch, keine Level-Dateien anfassen. Tests nur ein einziges Mal am Ende. Vor dem Übernehmen nach `main` bei Leon fragen.

## 0. Grundeinstellung: gilt für Tag UND Nacht (Bild `bilder/einstellung-schalter.png`)

So ist es für beide Dschungel-Welten fest eingestellt:

- **AN:** Tiere am Boden, Tiere im Hintergrund, Ganz fern, Fern, Hängende Wedel, Baumstamm, Riesenblätter, Heliconien, Mitte, Unterwuchs hinten, Unterwuchs vorn, Nah, Dickicht, Lianen, Nebel, Gras & Blumen, Münzen, Objekte, Stacheln/Dornen, Figuren, Vignette.
- **AUS:** Schwebesamen, Lichtstrahlen, Leuchtkreise, Erd-Schatten, Moos an Seiten, Bröckelrand, Gras unten, Filmkorn.

Prüfe im Spiel jede dieser Ebenen einzeln gegen die Liste und nenne in der Rückmeldung, welche Ebene im Spiel wie heißt (Datei/Funktion). Auch **Tiere am Boden** ist an. Die Ebenen „Unterwuchs hinten/vorn“, „Heliconien“, „Hängende Wedel“ und „Nebel“ gehören ausdrücklich dazu.

## 1. Was dazugehört (alles muss ins Spiel – Haken setzen, wenn drin)

Die Vorschau erzeugt das Dekor pro 40-px-Bodenkästchen (Oberseite, in `referenz/boden-dekor.js` unter „Platzierung“). Übernimm genau diese Mengen und Wahrscheinlichkeiten:

1. **Dickicht** – pro Oberseiten-Kästchen 3 Chancen zu je 80 %: ein großes weiches Blatt-Sprite (aus dem Dickicht-Pool: 14 Farnwedel `frondSprite` + 8 Monstera `monsteraSprite`), Fuß 10 px unter der Bodenoberkante, leichte Schräge (±0,15 rad), Wind-Wiegen (amp 0,075). Wird **vor** den Bodenkacheln gezeichnet (hinter den Figuren, über dem Hintergrund) und schaut an den Kanten des Bodens heraus. Das ist die wichtigste Zutat für „dichter Dschungel“.
2. **Feines Gras** – auf jeder Oberseite alle 7–13 px ein Büschel (4–6 Halme, 5–13 px hoch), dazu an Unterseiten nach unten hängendes feines Gras (alle 8–14 px, 3–4 Halme).
3. **Grasbüschel** – pro Kästchen 70 %: ein größerer Büschel (3–5 Halme, 7–16 px hoch).
4. **Farnbusch („Agave“)** – pro Kästchen 7 %, Größe 0,44–0,71.
5. **Blumen** – pro Kästchen 10 %, drei Farben (rot, orange, rosa), Höhe 17–35 px, wiegen im Wind.
6. **Pilze** – pro Kästchen 6 %.
7. **Freihalte-Zone um alle Spielobjekte:** Schalter/Hebel, Stacheln, Türen, Federn/Sprungpilze, Druckplatten, Haken, Checkpoints und Ziel. Im Umkreis von **60 px links und rechts** (und 90 px senkrecht) steht **keine Pflanze, kein Gras, kein Dickicht, kein Tier und keine Leuchtpflanze**. Auch nichts davon hängt oder wächst in so ein Objekt hinein. Dekor und Tiere gibt es nur auf Boden/Wand, wo sie nicht stören. Das gilt für Tag und Nacht, für Pflanzen und Tiere, und auch beim Versetzen von Tieren (sie dürfen nicht in eine Freihalte-Zone ausweichen). Vorlage: `SPN(x,y,m)` in `referenz/freihalten.js`; es ergänzt `dekoSperre()` in `js/17-deko.js`.
8. **Nur auf echtem Boden/Wand-Material**, nicht auf Scheinwänden.

Das alte Deko-System (`17-deko.js`: einfache Grasbüschel, rosa Blumen usw.) wird im Dschungel **ersetzt**, nicht zusätzlich gelegt – sonst wird es doppelt und wirrt. Andere Welten bleiben unverändert.

## 2. Reihenfolge und „nicht übereinander“ (feste Regel, nicht Gefühl)

Platziere in dieser Reihenfolge, jede Stufe nimmt Rücksicht auf die vorigen:

1. **Große Pflanzen zuerst:** Farnbusch, Blumen, Pilze, Leuchtpflanzen (Nacht). Mindestabstand zwischen zwei großen Pflanzen: 60 px; keine auf Kanten (45 px Rand zur Plattformkante).
2. **Dann Gras und Dickicht** – füllt die Lücken, darf hinter den großen Pflanzen stehen, aber nie vor Figuren oder Spezialobjekten.
3. **Zuletzt Tiere** – nur auf freie Stellen: kein Tier innerhalb von ±34 px einer großen Pflanze, kein Tier in Material (Rand 45 px, freie Laufstrecke ≥ 70 px). Tiere stehen **vor** Gras (Gras darf sie nicht verdecken).
4. Wenn eine Stelle doch belegt ist, wird das **Tier** versetzt (nicht die Pflanze), notfalls gestrichen.
5. Nichts davon darf am Level-Start (260 px um die Startpositionen) oder an Checkpoints/Ziel stehen.

## 3. Tiere – Nachbesserung

1. **Hintergrund-Tiere müssen bei jeder Dschungel-Tag/-Nacht-Auswahl laufen:** Schnecken am Baumstamm, kleine ferne Schmetterlinge (nachts Nachtfalter), Fledermäuse nachts. Im Code hängen sie an `BG_STIL.tiere`; die Auswahl „Dschungel (alter Hintergrund)“ hat das auf `false`. Leon sieht sie deshalb nicht. Setz `tiere: true` für **alle** Dschungel-Auswahlen, auch für die bisherige. Die Auswahl „Tiere im Hintergrund“ (Schalter) bleibt an.
2. Prüfe sichtbar, dass die Schnecken wirklich **am Stamm hochkriechen** (3 Stämme, je alle ~100 s) und die 8 fernen Schmetterlinge im Bild fliegen – mit Screenshot, nicht nur im Code.
3. Alle Mengen aus dem früheren Auftrag bleiben (Frosch .018, Schnecke .03, Pilz .035, Knospe .04 je 40-px-Schritt; Hänge-Tier max. 1 je 1300 px; Vögel sitzen und fliegen nicht weg; keine Schlangen/Geckos; nachts Frosch→Schnecke).

## 4. Nacht

- **Glühwürmchen leuchten kräftig orange** (statt gelbgrün): die fliegenden Nacht-Tiere (`firefly`, bisher `#d8ff6a`) und die schwebenden Nacht-Teilchen (bisher `210,255,120`) werden warmes Orange (Kern etwa `#ffb347`, Leuchthof `255,150,40`). Mit **dezentem** weichem Schein: heller Punkt (Radius ~2 px), kleiner Hof (~14 px, Deckkraft ~.3), großer sehr weicher Schein (~38 px, Deckkraft ~.16), der **weich ausläuft** (Verlauf mit Zwischenstufen: bei 40 % des Radius nur noch ~38 % der Deckkraft, bei 70 % ~10 %, am Rand 0; keine sichtbare Kante), leichtes langsames Pulsieren. Nicht größer oder greller, ruhig (kein wildes Blinken). Die Nachtfalter im Hintergrund bleiben getrennt davon.

- Dickicht, Gras, Blumen und Farn sind nachts **dieselben Formen**, nur eingefärbt wie der Rest (bei Vorzeichnen, nicht pro Bild).
- Leuchtpflanzen nachts stehen nur auf freien Oberseiten, in den Lücken, nach Abschnitt 2.

## 5. Leistung

- Dickicht-Sprites und Gras **einmal** vorzeichnen (wie die Boden-Kacheln pro Abschnitt), pro Bild nur Wind per einfacher Drehung/Versatz. Kein Weichzeichner pro Bild.
- Auf langsamen Geräten wie beim Wind: Dickicht-Wiegen zuerst abschalten, bevor Bilder ruckeln.
- Bildrate im Dschungel nicht schlechter als vorher (kurzer Vorher/Nachher-Vergleich).

## 6. Tests (nur einmal am Ende)

- Bestehende Tests grün.
- Neue Tests: (a) im Dschungel ist Dickicht/Gras/Blume/Farn gezeichnet (Pixelprobe über Oberseite); (b) kein Tier und keine Leuchtpflanze überlappt eine große Pflanze (Abstände); (c) Schnecken-am-Stamm und ferne Schmetterlinge werden bei allen Dschungel-Auswahlen gezeichnet; (d) nichts steht auf Münzen, Stacheln, Hebeln, Federn, Checkpoint, Ziel.

## 7. Abnahme (Leon)

Auf dem Level „Dschungel“ bei Tag und Nacht: sichtbares Dickicht an den Boden-Kanten, dichtes Gras, Blumen, Farnbüsche, **nichts steht übereinander**, Schnecken am Baumstamm, kleine Schmetterlinge im Hintergrund.

## 8. Rückmeldung (Pflicht)

Antworte mit einer Liste, Punkt für Punkt aus Abschnitt 1–5:

- **übernommen** (mit Datei/Funktion)
- **bewusst nicht übernommen** (mit Grund)
- **verändert** (was und warum)

Nichts weglassen und nichts stillschweigend streichen. Wenn etwas nicht geht, schreib es auf, statt es zu überspringen.
