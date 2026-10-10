# WELTEN – Design je Welt (Ausbau 7/8)

Pro Welt ein Eintrag: Thema, Look, Tiere, Deko, Musik/Ambiente, Mechaniken (Plan pro Level) und die Rolle von Affe
und Schweinchen in jeder Mechanik. Technisch steht der Look in `levels/worlds.json` (Feld `aussehen` der Welt) und in
`js/10a-themen.js` (Farben/Ebenen); Tageszeit und Wetter wählt jedes Level selbst.

## Welt 1 – Dschungel

**Thema:** Grüner, lebendiger Regenwald – der Einstieg. Hier lernen beide, dass sie nur zusammen weiterkommen.
Es fängt mild an (1–2 Versuche) und steigt bis zu Bruno deutlich an (schwerste Stellen 3–4 Versuche).

**Look:**
- Himmel und Licht: Je nach Tageszeit des Levels. Morgen = goldener Dunst, Mittag = klares Licht, Abend = Abendrot
  mit Silhouetten, Nacht = Mond, Glühwürmchen und leuchtende Pilze.
- Hintergrund-Ebenen: Karstfelsen in der Ferne, Wasserfall mit Felsen, Baumkronen mit Palmen und Lianen, Farn- und
  Blattwerk ganz vorne.
- Boden und Wände: sattgrünes Gras auf warmer, orangebrauner Erde; graublaue Steinwände mit Moos und Ranken.
- Wetter: Alle drei Arten sehen passend aus.
  - wechselnd: Sonne und Schauer, danach ein Regenbogen
  - trocken: nie Regen
  - regen: Dauerregen im Regenwald

**Tiere:** Bunte Vögel (bei Nacht Eulen), Frösche, Schnecken, Schmetterlinge (bei Nacht Glühwürmchen), ein hängendes
Faultier, Pilze und Knospen. Die Tiere reagieren auf die Figuren.

**Deko:** Blumen, Farne, Moospolster an Wandkanten, Ranken an Wandseiten und Vögel, die auffliegen. Die Deko steht nie
auf Münzen, Hebeln, Checkpoints oder Türen.

**Musik und Ambiente:** Klavier-Musik (eigene Aufnahme `musik.mp3`). Dazu Vogelstimmen bei Sonne, Regen-Aufnahme beim
Schauer und leises Flussrauschen, das lauter wird, wenn der Wasserfall ins Bild kommt.

**Mechanik-Set:** Haken/Seil, Segeln, Hebel/Türen, Bröckelboden, fahrende Plattformen, Sprungpilze, einseitige Stege,
Wechselboden und Teleporter (die letzten beiden nur sanft, als erste Begegnung).

### Plan pro Level

| Nr. | Level | Tageszeit / Wetter | Rolle | Schwerpunkt | typisch / schwerste |
|---|---|---|---|---|---|
| 1 | Dschungel (vorhanden) | morgen / wechselnd | Lehr-Level | Haken, Segeln, Hebel/Türen, Bröckelboden | 1 / 2 |
| 2 | Baumkronen (vorhanden) | abend / wechselnd | Kombi-Level | fahrende Plattformen, Fahrstuhl anhalten, Stachelwand-Jagd, Pressen | 1–2 / 3 |
| 3 | **Lianenschlucht** (neu, level-7) | mittag / regen | Lehr- und Kombi-Level | Seil-Rätsel (ranziehen, runterlassen, Schwung), Segel-Rätsel, einseitige Stege, Sprungpilz | 2 / 3 |
| 4 | **Glühwald** (neu, level-8) | nacht / trocken | Meister-Level | Wechselboden (Hebel, Druckplatte, Takt) und Teleporter, sanft eingeführt, dann mit Seil und Segeln kombiniert | 2–3 / 4 |
| Boss | Bruno, der Kokos-Gorilla (vorhanden) | abend / trocken | Boss | Helm-Trick nur zusammen | 5–10 |

**Lianenschlucht (levels/level-7.json, ca. 800 Spalten, 4 Etappen, wie gebaut):**
1. Etappe 1 (Spalten 0–200), Lehr-Teil:
   - Steg-Treppe über eine hohe Mauer (beide).
   - Seil-Aufzug: Der Affe zieht sich am Haken auf den Sims, Hebel 1 öffnet Tür 1.
   - Segel-Schlucht: Das Schweinchen segelt zu Hebel 2, der die Plattform mit dem Affen fährt.
   - Kamin (beide, Wandsprung).
2. Etappe 2 (Spalten 200–400):
   - Brunnen: Hebel 3 hängt über den Stacheln; der Affe lässt sich am Seil herunter und zieht sich wieder hoch.
   - Felsdecke: Das Schweinchen segelt im Tunnel zu Hebel 4, der Affe zieht sich auf den Felsen zu Tür 4.
   - Schleuse mit Graben: Druckplatte 5 an beiden Ufern; über den Graben segeln bzw. am Haken.
   - Bröckel-Steine (beide).
3. Etappe 3 (Spalten 400–600):
   - Pilz-Kreuzung: Das Schweinchen nimmt Pilz + Segeln nach unten, der Affe Pilz + zwei Haken nach oben; Hebel 6/7 über Kreuz.
   - Fahrende Haken: Erst Hebel 8 (Schweinchen, nach langem Segelflug vom Turm) lässt sie fahren.
   - Pilz-Treppe (beide).
4. Etappe 4 (Spalten 600–800):
   - Lianen-Staffel (Meister-Stelle): Hebel 9/11 auf dem Blätterdach (Schweinchen), Hebel 10/12 auf Säulen in der Grube (Affe).
   - Finale: zwei Pilze auf die Äste; die letzte Schlucht segeln bzw. mit zwei Haken nehmen; Ziel auf dem Gipfel.

**Glühwald (levels/level-8.json, ca. 700 Spalten, 4 Etappen, wie gebaut):**
1. Etappe 1, Wechselboden lernen:
   - Segel-Brücke: Hebel 1 (Schweinchen) lässt die Brücke B für den Affen erscheinen.
   - Haken-Tor: Hebel 2 (Affe) lässt die Wand A verschwinden.
   - Takt-Steine (2 s): springen, wenn es blinkt.
2. Etappe 2, Teleporter lernen:
   - Tor für beide.
   - Pinkes Tor → Hebel 3 → Tür für den Affen; blaues Tor → Hebel 4 → Tür für das Schweinchen.
   - Teleporter-Schleuse mit Druckplatten 5.
3. Etappe 3, Kombi:
   - Luft-Tor: Hebel 6 vom Affen; Ausgang hoch in der Luft, das Schweinchen segelt, der Affe greift Haken.
   - Wechsel-Schleuse: Druckplatte 7 lässt Brücke B erscheinen und Wand A verschwinden.
   - Takt-Steine (1,5 s) und eine weite Lücke.
4. Etappe 4, Meister-Stelle:
   - Doppel-Gang-Staffel: Der Affe ist oben, das Schweinchen unten; jeder Hebel 9–13 öffnet eine Wand A im anderen Gang.
   - Takt-Tempeltreppe (1,5 s, aufsteigend) und Tor 7 zum Tempeltor.

### Balance-Bericht (Ausbau 7, Koop-Bot-Messungen; „Versuche“ wie Regelwerk Punkt 13)

**Einstufungen**
- **komfortabel:** fast jeder Versuch klappt.
- **knapp:** einige Absprung- oder Loslass-Varianten klappen, andere nicht (etwa 1–2 Versuche).
- **Grenze:** nur wenige Varianten klappen, braucht Übung (3–4 Versuche).

**Härteste Stellen Level 7 „Lianenschlucht“ (Ziel: typisch 2, schwerste 3):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 612–640 | Lianen-Staffel: Säule A → zwei Haken → Säule B (Affe) | Seil-Schwung auf schmale Säule | Grenze (2 von 12 Varianten) |
| 610–621 | Lianen-Staffel: Rand → Haken → Säule A (Affe) | Seil-Schwung | knapp (3/12) |
| 482–508 | fahrende Haken (Affe) | Timing | knapp (Zeitpunkt abpassen) |
| 483–508 | Turm → Ufer, 25 Kästchen Segelflug (Schweinchen) | Segeln | knapp (3/6) |
| 252–268 | Felsdecke-Tunnel (Schweinchen) | Segeln mit wenig Höhe | knapp (2/6) |
| 225–240 | Brunnen: Seil runter, Hebel, hoch, zwei Haken (Affe) | Seil-Steuerung | knapp |
| 99–114 | Segel-Schlucht (Schweinchen) | Segeln | knapp (3/6) |

**Härteste Stellen Level 8 „Glühwald“ (Ziel: typisch 2–3, schwerste 4, Meister-Level vor Bruno):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 600–640 | Takt-Tempeltreppe, aufsteigend, 1,5 s (beide) | Timing | Grenze (nachts, nur das Blinken als Hilfe) |
| 488–592 | Doppel-Gang-Staffel: Haken über Stacheln oben, Gruben im niedrigen Gang unten | Koordination | knapp |
| 316–342 | Luft-Tor: Affe muss gleich nach dem Tor den Haken greifen | Reaktion | knapp (3/4) |
| 411–440 | Takt-Steine 1,5 s | Timing | knapp |
| 78–106 | Takt-Steine 2 s (erste Begegnung) | Timing | knapp |
| 364–369 | Haken auf den Sims mit Druckplatte 7 (Affe) | Seil | knapp-komfortabel |

**Sonst:** Alle anderen Stellen sind komfortabel (Lehr-Teile, Tore, Schleusen).

### Rolle von Affe und Schweinchen je Mechanik

| Mechanik | Affe | Schweinchen |
|---|---|---|
| Haken/Seil | schwingt über Lücken, zieht sich hoch (W) oder lässt sich runter (S), erreicht hohe Hebel | kommt nicht an Haken: öffnet ihm unten die Türen |
| Segeln | springt nur normal weit | segelt über weite Schluchten und unter Decken durch, erreicht ferne Hebel |
| Einseitige Stege | Abkürzung nach oben; das Seil geht durch Stege hindurch | landet beim Segeln von oben darauf |
| Hebel/Türen, Druckplatte | öffnet/hält für das Schweinchen | öffnet/hält für den Affen |
| Sprungpilz | prallt hoch zu einem Haken | prallt hoch und segelt dann weit |
| Wechselboden | schaltet per Hebel/Platte die Brücke für das Schweinchen | schaltet für den Affen; beide lernen das Blinken als Warnung |
| Teleporter | nimmt blaue Tore (nur Affe) und greift am Ausgang einen Haken | nimmt pinke Tore (nur Schwein) und segelt aus einem Ausgang in der Luft |

**Regeln, die in jedem Dschungel-Level gelten:**
- Münzen nur blau (Affe) und pink (Schweinchen), gleich viele, auf dem Weg der jeweiligen Figur.
- Checkpoints alle 40–60 Spalten und vor jeder harten Stelle.
- Jeder Hebel hat einen Grund.
- Haken-Radius höchstens 5 Kästchen.
- Keine Zufallstode.
- Jede Stelle ist als komfortabel, knapp oder Grenze eingestuft (Balance-Bericht am Ende von Ausbau 7).

## Welt 2 – Ruinen

**Thema:** Ein alter Sandstein-Tempel voller Fallen. Hier geht es um **Timing und Rhythmus**: Fallen schießen im Takt,
ein Fels rollt hinterher, Licht muss gelenkt werden. Typisch 2–3 Versuche, die schwersten Stellen 5–6
(Regelwerk Punkt 13).

**Look:**
- Himmel: Je nach Tageszeit des Levels; die natürliche Tageszeit ist Mittag (gleißendes Licht, Sonnenstrahlen).
- Hintergrund: Tempelberge in der Ferne, Ruinen-Mauern mit Grün, Bäume und Blattwerk vorne.
- Boden und Wände: sandiger, heller Boden mit gelblichem Gras; Sandstein-Wände mit Fugen; Moos olivgrün.
- Tageszeiten: Abends und nachts werden Boden und Wände dunkler (wie im Dschungel). Nachts gibt es Glühwürmchen und
  Fledermäuse.
- Wetter: wechselnd, trocken oder Dauerregen – alle passen.

**Tiere:** Eidechsen am Boden, Tauben und Spatzen, Schmetterlinge (nachts Glühwürmchen), Fledermäuse, Schnecken.

**Deko:** Gräser, Knospen, Moos an Mauerkanten, Ranken; dazu die neuen Fallen-Köpfe aus Stein (Pfeil-Schlitze,
Flammen-Düsen) und Lichtkristalle.

**Musik und Ambiente:** dieselbe Klavier-Musik; weniger Vögel als im Dschungel (Tempel), Grillen leise schon am Tag, der
Fluss nur leise in der Ferne.

**Mechanik-Set:** Pressen, Stachelwände, Fallen, Druckplatten (schon vorhanden). Neu in Ausbau 7:
- **Falle** mit Pfeil oder Flamme, im Takt; blinkt bzw. raucht vorher, ein Hebel kann sie abstellen.
- **Rollender Fels:** vom Hebel gestartet, rollt hinterher und zerschellt an Wänden.
- **Licht:** Lichtquelle, drehbare Spiegel und ein Kristall, der eine Nummer anschaltet, solange Licht auf ihn fällt.

Dazu Wechselboden und Teleporter als Kern-Rätsel.

### Plan pro Level

| Nr. | Level | Tageszeit / Wetter | Rolle | Schwerpunkt | typisch / schwerste |
|---|---|---|---|---|---|
| 1 | Ruinen (vorhanden, level-3) | mittag / wechselnd | Kombi | Pressen, Stachelwand-Jagd, Hebel-Reihenfolge | 2 / 3–4 |
| 2 | Mondnacht (vorhanden, level-4) | nacht | Kombi (sehr schwer) | Bröckel-Sprint, Schleuse, Stachelwände | 3 / 5 |
| 3 | **Fallengang** (neu, level-9) | morgen / wechselnd | Lehr-Level | Pfeil- und Flammenfallen im Takt, Hebel stellt Fallen ab, Wechselboden im Rhythmus | 2 / 4 |
| 4 | **Sonnentempel** (neu, level-10) | abend / regen | Kombi-Level | Licht-Rätsel (Spiegel nur per Haken bzw. nur segelnd erreichbar), Teleporter, Fallen | 2–3 / 5 |
| 5 | **Felsenflucht** (neu, level-11) | mittag / regen | Meister-Level | Rollender Fels als Verfolgung, alles kombiniert | 3 / 6 |

**Fallengang (level-9):**
1. Pfeile im Takt lesen (beide).
2. Flammen-Säulen, durch die das Schweinchen langsam hindurchsegelt, während der Affe am Seil abwartet.
3. Einer legt den Hebel um, der die Fallen abstellt, und der andere läuft durch.
4. Wechselboden und Fallen im selben Takt.

**Sonnentempel (level-10):**
1. Licht lernen: Spiegel drehen (J / Num 2), der Kristall öffnet die Tür.
2. Spiegel, die nur der Affe (Haken) oder nur das Schweinchen (segeln) erreicht.
3. Licht durch einen Teleporter-Gang, Fallen auf dem Weg.
4. Meister-Stelle: zwei Lichtstrahlen, zwei Kristalle.

**Felsenflucht (level-11):**
1. Erste Felsflucht: Hebel, Tor auf, Fels rollt; nach vorne fliehen (Affe am Haken, Schweinchen segelt über Gruben).
2. Fels und Fallen zusammen.
3. Wechselboden und Teleporter auf der Flucht.
4. Finale: lange Verfolgung mit Licht-Tor.

### Rolle von Affe und Schweinchen je Mechanik (Ruinen)

| Mechanik | Affe | Schweinchen |
|---|---|---|
| Pfeilfalle | wartet am Seil hängend den Takt ab, schwingt durch Lücken | segelt langsam und lässt Pfeile unter sich durch |
| Flammenfalle | zieht sich am Seil über Flammen-Düsen | segelt sanft herab, wenn die Flamme gerade aus ist |
| Fallen abstellen (Hebel) | erreicht hohe Hebel per Haken | erreicht ferne Hebel segelnd |
| Rollender Fels | flieht nach oben an Haken, der Fels rollt darunter durch | segelt über Gruben, in die der Fels fällt |
| Licht/Spiegel | dreht Spiegel, die nur per Haken erreichbar sind | dreht Spiegel auf fernen Simsen (segeln) |
| Kristall (Nummer) | – öffnet Türen für beide, solange das Licht trifft – | |
| Wechselboden/Teleporter | wie im Dschungel, hier im Takt der Fallen | wie im Dschungel |

**Regeln, die in jedem Ruinen-Level gelten:**
- Münzen nur blau und pink, gleich viele.
- Checkpoints alle 40–60 Spalten und vor jeder harten Stelle.
- Ein Hebel, der den Fels startet, öffnet auch ein Tor.
- Keine Zufallstode: Fallen laufen im festen Takt und warnen vorher.
