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

### Umsetzung (Abweichungen vom Plan)
- **Fallengang:** wie geplant; dazu am Ende ein Flammen-Doppelgang (Affe oben, Schweinchen unten, Hebel über Kreuz) als
  schwerste Stelle. Flammen-Sperren ohne Hebel sind Flammen von oben UND unten im Wechsel – sonst könnte man mit gutem
  Timing durchschlüpfen und die Hebel-Staffel umgehen.
- **Sonnentempel:** Licht geht nicht durch Teleporter. Darum sind Etappe 2/3 „Spiegel, die nur einer erreicht“: der
  Affe per Haken, das Schweinchen übers pinke Tor und segelnd; zwei getrennte Wege, auf denen jeder die Tür des anderen
  per Spiegel öffnet; dazu Licht im Takt (ein Takt-Stein unterbricht den Strahl).
- **Felsenflucht:** Ruhende Felsen liegen auf kleinen Simsen über dem Weg (sonst liefe man durch sie hindurch) und
  rollen herunter, sobald ihr Hebel gezogen ist. Jeder Fels-Hebel öffnet auch ein Tor.

### Balance-Bericht Ruinen (Ausbau 7, Koop-Bot-Messungen)

Einstufungen wie im Dschungel (komfortabel / knapp / Grenze). „stur“ = Bot läuft ohne zu warten einfach durch (verschiedene
Startzeiten); „Spielraum“ = so lange darf man nach dem Hebel zögern (Physik-Schritte, 54 pro Sekunde).

**Härteste Stellen Level 9 „Fallengang“ (Ziel: typisch 2, schwerste 4):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 606–690 | Flammen-Doppelgang: Hebel 10–14 über Kreuz, oben Haken über Stacheln, unten Gruben segeln | Koordination | knapp (schwerste Stelle; ohne Hebel 0 von 8 durch) |
| 688–728 | Rhythmus-Lauf: Pfeile + Flammen-Welle | Timing | knapp (stur 1 von 10) |
| 412–456 | Deckung: Affe schaltet oben, Schweinchen läuft im Pfeil-Takt | Koordination | knapp |
| 100–140 | Flammen-Welle | Timing | knapp (stur 1 von 25) |
| 542–564 / 737–757 | Takt-Steine 1,5 s (unter Pfeilen / zum Ziel) | Timing | knapp |
| 301–311 | Einstieg Pfeil-Gang (Schweinchen segelt) | Segeln | knapp (3 von 6) |

**Härteste Stellen Level 10 „Sonnentempel“ (Ziel: typisch 2–3, schwerste 5):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 629–691 | Doppelstrahl-Tor: beide Kristalle zugleich, Strahl 2 im Takt, Pfeil in der Tür | Koordination + Timing | Grenze (schwerste Stelle; stur 5 von 9 erst NACH beiden Spiegeln) |
| 712–725 | Licht-Brücken im Takt (Affe läuft, Schweinchen segelt) | Timing | knapp bis Grenze (stur 1 von 9) |
| 276–289 | Licht-Takt mit Pfeil vor Tür 6 | Timing | knapp (stur 5 von 9) |
| 540–568 | Flammen-Gang (Schweinchen läuft der Welle nach) | Timing | knapp (stur 0 von 10, mit Warten sicher) |
| 228–256 | Affe an zwei Haken über die Grube | Seil-Schwung | knapp (11 von 16 Varianten) |
| 427–466 | oberer Weg: Haken über Stacheln (Affe) | Seil-Schwung | knapp |
| 486–518 | Spiegel-Kette unter Pfeilen | Timing | knapp |

**Härteste Stellen Level 11 „Felsenflucht“ (Ziel: typisch 3, schwerste 6, Meister-Level):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 612–704 | Finale: Fels so schnell wie die Figuren; Grube, Spiegel im Laufen, Stege | Verfolgung | Grenze (schwerste Stelle; Spielraum 42 Schritte ≈ 0,8 s) |
| 110–170 | Flucht nach oben: schneller Fels, rauf auf die Stege | Verfolgung | Grenze (Spielraum 30 Schritte ≈ 0,55 s) |
| 480–518 | Takt-Steine mit Fels im Nacken | Timing unter Druck | knapp bis Grenze (an der Kante kaum warten) |
| 210–258 | Pfeil-Flucht | Timing unter Druck | knapp (stur 0 von 10) |
| 287–300 | Schleuse: Platte halten, Hebel 6, gemeinsam durch Tür 5 | Koordination | knapp |
| 330–388 | Flammen-Welle mit Fels im Nacken | Timing unter Druck | knapp |
| 74–96 | Fels und Grube (Haken / segeln) | Verfolgung | knapp (Spielraum 72 Schritte ≈ 1,3 s) |
| 412–445 | Teleporter-Flucht | Verfolgung | knapp |

**Checkpoints:** Fallengang und Sonnentempel höchstens etwa 60 Spalten auseinander (Ausnahme je ein zusammenhängendes
Rätsel: Doppelgang 604–680 bzw. zwei Wege 401–474). In der Felsenflucht wird jede Verfolgung am Stück gespielt (bis 106
Spalten ohne Checkpoint im Finale) – das macht sie zum Meister-Level.

**Sonst:** Alle anderen Stellen sind komfortabel (Lehr-Teile, Spiegel am Boden, Tore, Schleusen).

## Welt 3 – Höhle

**Thema:** Kristallhöhlen tief unter dem Berg. Hier geht es um **Präzision und Koordination**: enge Kamine,
schmale Stege, Förderbänder, rutschiges Eis und dunkle Gänge, in denen nur Leuchtkristalle den Weg zeigen.
Typisch 3–4 Versuche, die schwersten Stellen ca. 8 – nie unmöglich (Regelwerk Punkt 13).

**Look:**
- Kein Himmel (unter Tage). Hintergrund: Höhlenwände mit leuchtenden Adern in der Ferne, Kristall-Felsen und
  unterirdische Wasserfälle, Säulen mit leuchtenden Kappen, dunkle Felsen vorne.
- Boden und Wände: violett-grauer Fels, türkis leuchtendes Moos und Gras; Kristalle in Cyan, Violett und Mint.
- Dunkelheit: Die ganze Welt ist dämmrig, um Figuren, Hebel, Kristalle und Pilze leuchtet es.
- Tageszeiten: Unter Tage gibt es keine Sonne – morgens/mittags/abends sehen gleich aus (Licht von oben durch Spalten),
  **nachts** ist es deutlich dunkler: dann braucht man die Leuchtkristalle wirklich.
- Wetter: trocken = stille Höhle; **Regen** = Tropfwasser von der Decke (Tropfen statt Regenschauer), Tropf-Geräusche.

**Tiere:** Fledermäuse (hängen an der Decke, flattern auf), leuchtende Glühwürmchen, Schnecken, Höhlen-Pilze, die
glimmen; kleine Kristalle am Boden funkeln, wenn man vorbeiläuft.

**Deko:** Stalaktiten und Stalagmiten, leuchtendes Moos an Kanten, Kristall-Büschel, Pfützen; dazu die neuen Elemente
(Förderband mit Rollen, Eisflächen mit Glanz, Leuchtkristalle).

**Musik und Ambiente:** dieselbe Klavier-Musik, gedämpft; keine Vögel, kaum Grillen, dafür leises Wasserrauschen in
der Ferne und Tropfen.

**Mechanik-Set:** Aufwind, Scheinwände, Stege (einseitige Plattformen), Kamine (Wandsprung), Teleporter, Dunkelheit
(schon vorhanden). Neu in Ausbau 7:
- **Förderband:** Boden, der alles darauf mitnimmt (links oder rechts, langsam/schnell); per Nummer (Hebel/Platte)
  umschaltbar oder anhaltbar.
- **Eis:** rutschiger Boden – man beschleunigt und bremst langsam; Sprünge von Eis brauchen Gefühl.
- **Leuchtkristall:** Kristall im Dunkeln; mit der Hebel-Taste angeschlagen leuchtet er einige Sekunden hell und
  vertreibt die Dunkelheit weit um sich; per Nummer kann er auch dauerhaft leuchten.

### Plan pro Level

| Nr. | Level | Tageszeit / Wetter | Rolle | Schwerpunkt | typisch / schwerste |
|---|---|---|---|---|---|
| 1 | Kristallhöhle (vorhanden, level-5) | – (alter Look) | Kombi | Aufwind, Scheinwände, Kamine | 3 / 5 |
| 2 | **Tropfsteingang** (neu, level-12) | morgen / trocken | Lehr-Level | Förderband, Stege, enge Kamine | 2–3 / 4 |
| 3 | **Eisgrotte** (neu, level-13) | abend / regen (Tropfwasser) | Lehr-Level | Eis, Aufwind, Präzisionssprünge | 3 / 5 |
| 4 | **Leuchtgrotte** (neu, level-14) | nacht / trocken | Kombi-Level | Dunkelheit + Leuchtkristalle, Scheinwände, Teleporter | 3 / 6 |
| 5 | **Förderwerk** (neu, level-15) | mittag / wechselnd | Kombi-Level | Förderband + Eis + Hebel über Kreuz, Kamine | 3–4 / 7 |
| 6 | **Tiefenschlund** (neu, level-16) | nacht / regen | Meister-Level | alles kombiniert, lange Präzisions-Passagen im Dunkeln | 4 / 8 |

**Tropfsteingang (level-12):** 1. Förderband lernen (mit und gegen den Strom). 2. Stege von unten durchspringen,
Kamine mit Wandsprung. 3. Hebel dreht das Band – einer schaltet, der andere fährt mit. 4. Bänder über Stachelgruben.

**Eisgrotte (level-13):** 1. Eis lernen (Anlauf, Bremsweg). 2. Eis-Sprünge auf schmale Säulen. 3. Aufwind über
Eisflächen (Schweinchen). 4. Eis-Rampe mit Haken als Bremse (Affe).

**Leuchtgrotte (level-14):** 1. Leuchtkristall anschlagen, im Licht laufen. 2. Einer schlägt Kristalle an, der andere
läuft im Dunkeln durch Stachelgänge. 3. Scheinwände, die man nur im Licht erkennt. 4. Kristalle per Nummer, Teleporter.

**Förderwerk (level-15):** 1. Förderband-Kaskaden. 2. Eis + Förderband. 3. Bänder über Kreuz: jeder Hebel dreht das
Band des anderen. 4. Kamin-Aufstieg mit Bändern.

**Tiefenschlund (level-16):** 1. Dunkler Abstieg mit Leuchtkristallen. 2. Eis-Kamine. 3. Förderband-Labyrinth mit
Teleportern. 4. Finale: lange Präzisions-Passage im Dunkeln.

### Rolle von Affe und Schweinchen je Mechanik (Höhle)

| Mechanik | Affe | Schweinchen |
|---|---|---|
| Förderband | hängt sich am Haken fest und hält gegen den Strom; schaltet hohe Band-Hebel | segelt über Bänder hinweg (Band wirkt nur am Boden) und landet genau |
| Eis | bremst mit dem Seil: am Haken hängen stoppt jedes Rutschen | landet segelnd punktgenau auf schmalen Eissäulen |
| Leuchtkristall | schlägt hohe Kristalle per Haken an | schlägt ferne Kristalle segelnd an; im Licht läuft der andere |
| Kamine / Stege | Wandsprung + Seil als Sicherung | Wandsprung + Schirm bremst den Fall |
| Aufwind | – (fällt durch) | steigt mit dem Schirm hoch, erreicht Hebel/Kristalle |
| Dunkelheit | sieht nur, was in seinem Licht-Kreis ist | ebenso – wer vorne läuft, leuchtet dem anderen den Weg |

**Regeln, die in jedem Höhlen-Level gelten:**
- Münzen nur blau und pink, gleich viele.
- Checkpoints alle 40–60 Spalten und vor jeder harten Stelle.
- Jeder Hebel hat einen Grund.
- Im Dunkeln nie ein Sprung ins Unbekannte: Gefahren sind vor dem Sprung sichtbar (Leuchtkristall, Pilz, Moos).
- Keine Zufallstode.

### Umsetzung Höhle (Ausbau 7)

- Neue Elemente: **Eis** (elemente/eis.js), **Förderband** (elemente/foerderband.js, Tempo langsam/schnell/reißend, per
  Nummer umdrehen oder anhalten; Band-Schwung beim Absprung), **Leuchtkristall + Dunkelzone** (elemente/leuchtkristall.js).
- Abweichungen vom Plan (begründet):
  - Eisgrotte: die „Eis-Rampe mit Haken als Bremse“ ist als **Bremsen am Seil** (Hebel ganz vorn an der vereisten Kante)
    und **Doppel-Rutsche** (Hebel im Vorbeirutschen ziehen) umgesetzt – im Spiel gibt es keine schrägen Böden.
  - Leuchtgrotte: Scheinwände sind nicht nur „im Licht zu erkennen“ – sie werden durchsichtig, sobald man direkt davor
    steht (so findet man sie auch ohne Kristall). Dunkelheit selbst ist ein Seh-, kein Spiel-Hindernis.
  - Förderwerk: „Kamin-Aufstieg mit Bändern“ = Kamin mit Gegenband oben; dazu Bänder über Kreuz mit einer Druckplatte
    (ein Hebel hätte beide Bänder dauerhaft gedreht – dann bräuchte man den Partner nicht).
  - Tiefenschlund: „Eis-Kamine“ = Kamin mit vereistem Sims oben + Doppel-Rutsche im Dunkeln.
- Abstandsgrenze (40 Spalten zwischen den Figuren) bestimmt die Länge der Passagen, die einer allein vorausgeht
  (Gruben mit Haken, Tor-Ketten): höchstens ~38 Spalten.

### Balance-Bericht Höhle (Ausbau 7, Koop-Bot-Messungen)

Einstufungen wie bisher (komfortabel / knapp / Grenze). Zahlen = wie viele der vom Bot probierten Varianten
(Absprung-Spalte, Sprung-Haltedauer, Loslass-Strategie am Seil) klappen.

**Härteste Stellen Level 12 „Tropfsteingang“ (Ziel: typisch 2–3, schwerste 4):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 64–84 | Band-Schleuder: Affe über die Grube (Hebel 1 vom Schweinchen) | Absprung-Timing | knapp (2 von 6, nur ganz am Bandende) |
| 600–640 | Schleuder-Kette: drei Bänder vor drei Gruben | Absprung-Timing | knapp (ohne Band-Schwung 0 von 3) |
| 241–280 | Zickzack-Kamin (zwei versetzte Schächte) | Wandsprung | knapp |
| 641–672 | Kamin hinter dem Gegenband | Band + Wandsprung | knapp |
| 210–232 | Band-Schleuder 2 (Hebel 3) | Absprung-Timing | knapp |

**Härteste Stellen Level 13 „Eisgrotte“ (Ziel: typisch 3, schwerste 5):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 604–680 | Doppel-Rutsche: Hebel 6/7 im Vorbeirutschen ziehen | Koordination + Eis | knapp (schwerste Stelle) |
| 250–271 | vereister Sims: Hebel 3 im Vorbeirutschen (Affe) | Eis + Timing | knapp (2 von 6) |
| 466–512 | Bremsen am Seil: Hebel 5 an der Eiskante, dann über die Grube | Seil + Eis | knapp |
| 541–590 | Eissäulen: Affe an den Haken | Seil-Schwung | knapp (2 von 3 Strategien) |
| 541–590 | Eissäulen im Aufwind (Schweinchen) | Segeln | komfortabel |

**Härteste Stellen Level 14 „Leuchtgrotte“ (Ziel: typisch 3, schwerste 6):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 525–557 | dunkle Schlucht: Affe an vier Haken | Seil-Schwung | knapp bis Grenze (1 von 3 Strategien) |
| 641–644 | getrennte Wege: Sprung über die Lücke oben | Absprung | knapp (nur von der letzten Spalte) |
| 398–442 | Stachel-Tunnel (niedrige Decke, flache Hüpfer) | Präzision | knapp |
| 128–160 | Schlucht mit Platten-Licht und Haken (Affe), Brücke per Hebel | Koordination | knapp |
| 458–490 | Kammer-Kette (Tor, Hebel 6, Tor, Platte 7, Hebel 8) | Koordination | komfortabel (Reihenfolge finden) |

**Härteste Stellen Level 15 „Förderwerk“ (Ziel: typisch 3–4, schwerste 7):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 645–664 | Schleuder A: Affe über Grube A | Absprung-Timing | knapp bis Grenze (2 von 8, nur von Spalte 657) |
| 204–239 | Eis-Anlauf zum Band-Sprung | Absprung-Timing | knapp bis Grenze (1 von 3) |
| 110–129 | Schleuder mit Aufwind-Hebel: Affe über die Grube | Absprung-Timing | knapp (2 von 6) |
| 500–534 | über das reißende Band (Inseln / Haken) | Präzision | knapp (Haken 5 von 12) |
| 262–296 | Platte auf dem Band (dagegen anlaufen) + Platte auf dem Eis | Koordination | knapp |
| 673–695 | Schleuder B: Schweinchen segelt mit Schwung | Absprung + Segeln | komfortabel (4 von 6) |

**Härteste Stellen Level 16 „Tiefenschlund“ (Ziel: typisch 4, schwerste 8, Meister-Level):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 607–645 | lange Steg-Passage im Dunkeln (2 Kästchen breite Stege, wechselnde Höhe) | Präzision | Grenze (schwerste Stelle) |
| 665–684 | Doppel-Schleuder A im Dunkeln | Absprung-Timing | knapp bis Grenze (2 von 4, nur von Spalte 677) |
| 534–568 | Tor-Kette über die Stachelgrube | Präzision | knapp |
| 735–768 | letzte Eissäulen (Affe an fünf Haken) | Seil-Schwung | knapp (2 von 3 Strategien) |
| 90–124 | Eissäulen ohne Aufwind (Schweinchen springt sofort weiter) | Eis + Segeln | knapp (Affe 2 von 3) |
| 214–231 | Eis-Kamin: vereister Sims, Sprung über die dunkle Lücke | Eis + Timing | knapp |
| 262–335 | Doppel-Rutsche im Dunkeln | Koordination + Eis | knapp |


## Welt 5 – Vulkan

**Thema:** Der Feuerberg – die **härteste Welt**. Fast alle bisherigen Mechaniken kommen zusammen, dazu das, was den
Vulkan ausmacht: **steigende Lava** (Flucht nach oben, Zeitdruck), **Stachelpressen** im Takt, **Sprungpilze**
(hohe Sprünge über Lava) und **Förderbänder** (Schlacke-Werk). Typisch 4–5 Versuche, die schwersten Stellen 10+ –
aber immer fair: jede Gefahr ist vorher sichtbar, es gibt keine Zufallstode, Lava steigt nie schneller, als man
klettern kann (Regelwerk Punkt 13).

**Look:**
- Eigener Feuer-Himmel (rot-orange, Asche, Glut-Funken), Vulkan mit Lavaströmen und Rauch in der Ferne,
  Lavafälle, verkohlte Bäume, Basalt-Felsen vorne.
- Boden und Wände: dunkler Basalt mit glühenden Fugen, Schlacke, verbranntes Gras; Glut-Kristalle.
- Tageszeiten (Ausbau 7): der Feuer-Himmel bleibt, wird aber eingefärbt – **morgens** goldener Dunst, **mittags**
  grell und klar, **abends** tief violett-rot, **nachts** dunkel, nur Lava und Glut leuchten.
- Wetter: trocken = Ascheflocken und Glut; **Regen** = heißer Regen, über der Lava zischt Dampf auf;
  wechselnd = mal so, mal so.

**Tiere:** Feuersalamander (Eidechsen), Raben, Fledermäuse in Höhlen-Abschnitten, Glut-Falter statt Glühwürmchen.

**Deko:** Glut-Kristalle, Schlackebrocken, verkohlte Stämme, Dampf-Spalten; dazu die neuen Elemente (glühende Lava mit
Blasen, eiserne Stachelpressen mit Ketten).

**Musik und Ambiente:** dieselbe Klavier-Musik; keine Vögel, kaum Grillen; dafür tiefes Grollen und Brodeln der Lava
(eigenes Lava-Geräusch, lauter, je näher man ist), Stampfen der Pressen.

**Mechanik-Set:** Sprungpilze, Förderband, Aufwind, Haken, Bröckelboden, Wechselboden, Teleporter, Fallen (Pfeil/Flamme),
Eis (Obsidian-Glas) – alles vorhanden. Neu in Ausbau 7:
- **Lava (neues Element):** glühende Lava-Becken – wer hineinfällt, ist tot. Mit einer **Lava-Marke** steigt die Lava:
  per Nummer (Hebel = steigt bis zur Marke und bleibt, Druckplatte = nur solange jemand draufsteht) oder
  **„sobald beide da sind“** (Lava-Flucht – erst wenn beide Figuren das Becken erreicht haben). Tempo langsam / mittel / schnell; nach dem Tod wieder unten.
- **Stachelpresse (neues Element):** schwerer Eisenblock mit Stacheln unten, der im festen Takt herunterkracht, kurz
  liegen bleibt und langsam wieder hochgezogen wird (Takt 2/3/4 s, Versatz für Wellen). Per Nummer anhaltbar oder nur
  bei Nummer an laufend. Vorher sichtbar: Kette zittert und Staub rieselt kurz vor dem Fall.

### Plan pro Level

| # | Level | Tageszeit / Wetter | Rolle | Mechaniken | Versuche (typisch / schwerste) |
|---|---|---|---|---|---|
| 1 | **Glutpfad** (neu, level-17) | morgen / trocken | Lehr-Level | Lava-Becken, steigende Lava (langsam), Sprungpilze | 3 / 5 |
| 2 | **Aschefeld** (neu, level-18) | mittag / regen | Lehr-Level | Stachelpressen im Takt, Förderband | 3 / 6 |
| 3 | Feuerberg (vorhanden, level-6) | – (alter Look) | Kombi-Level | Pilze, Wind, Stachelwand, Pressen, Lava-Schlot | 4 / 8 |
| 4 | **Magmakammer** (neu, level-19) | abend / trocken | Kombi-Level | Lava-Flucht nach oben (Kamine), Pilze, Aufwind | 4 / 8 |
| 5 | **Schlackewerk** (neu, level-20) | mittag / wechselnd | Kombi-Level | Pressen über Förderbändern, Hebel über Kreuz, Fallen | 4 / 9 |
| 6 | **Feuerschlund** (neu, level-21) | nacht / trocken | Kombi-/Meister-Level | steigende Lava + Teleporter + Dunkelheit, Wechselboden | 5 / 10 |
| 7 | **Kraterherz** (neu, level-22) | nacht / regen | Meister-Level | alles kombiniert: Lava-Flucht, Pressen, Bänder, Pilze, Haken, Eis | 5 / 10+ |

Reihenfolge in der Welt: Glutpfad, Aschefeld, Feuerberg, Magmakammer, Schlackewerk, Feuerschlund, Kraterherz
(der alte Feuerberg rückt an Platz 3, damit die Welt mit zwei Lehr-Leveln beginnt).

**Glutpfad (level-17):** 1. Lava-Becken lernen (springen, Pilze über Lava). 2. Hebel lässt Lava steigen – und
öffnet das Tor: zügig nach oben. 3. Druckplatte hält die Lava unten (einer hält, einer läuft). 4. Pilz-Kette über
einen Lavasee.

**Aschefeld (level-18):** 1. Eine Presse, dann eine Pressen-Welle (Takt lesen). 2. Pressen über einem Förderband.
3. Hebel hält die Pressen für den anderen an. 4. Pressen-Gang mit Bröckelboden.

**Magmakammer (level-19):** 1. Lava-Flucht durch Kamine (Wandsprung) – Lava steigt, sobald man kommt. 2. Affe Haken /
Schweinchen Aufwind über die Lava. 3. Pilz-Turm mit steigender Lava. 4. Doppel-Schacht: jeder rettet den anderen.

**Schlackewerk (level-20):** 1. Bänder tragen unter Pressen hindurch. 2. Hebel über Kreuz: jeder stoppt die Pressen
des anderen. 3. Flammenfallen + Bänder. 4. Großes Werk: Band, Presse, Pilz, Haken.

**Feuerschlund (level-21):** 1. Dunkle Lavagänge mit Leuchtkristallen. 2. Teleporter vor steigender Lava.
3. Wechselboden über Lava. 4. Doppel-Flucht: zwei Schächte, zwei Lavastände.

**Kraterherz (level-22):** 1. Pressen + Pilze. 2. Lava-Flucht mit Bändern und Eis. 3. Hebel-Ketten über der Lava.
4. Finale: der Krater läuft voll – Flucht zum Gipfel.

### Rolle von Affe und Schweinchen je Mechanik (Vulkan)

| Mechanik | Affe | Schweinchen |
|---|---|---|
| Lava-Becken | Haken über die Lava; Seil hält ihn über der Glut | segelt über breite Becken |
| Steigende Lava | klettert per Wandsprung / Seil voraus und zieht oben den Hebel, der das Tor öffnet | steigt im Aufwind schnell hoch; hält Druckplatten, die die Lava bremsen |
| Stachelpresse | hängt am Haken über der Presse und wartet den Takt ab; zieht Hebel, die Pressen anhalten | gleitet zwischen zwei Schlägen hindurch; hält Platten, die Pressen stoppen |
| Sprungpilz | Pilz -> hoher Haken | Pilz -> Segelflug |
| Förderband | hält gegen das Band am Seil | segelt über Bänder hinweg |

**Regeln, die in jedem Vulkan-Level gelten:**
- Münzen nur blau und pink, gleich viele.
- Checkpoints alle 40–60 Spalten und vor jeder harten Stelle (vor jeder Lava-Flucht ein Checkpoint).
- Jeder Hebel hat einen Grund; ein Hebel, der Lava steigen lässt, öffnet immer auch ein Tor.
- Lava steigt höchstens so schnell, dass zwei geübte Spieler ohne Fehler sicher oben ankommen.
- Pressen fallen nie ohne Vorwarnung (Kette zittert, Staub rieselt).
- Keine Zufallstode.

### Umsetzung Vulkan (Ausbau 7)

- Neue Elemente: **Lava + Lava-Marke** (elemente/lava.js; Becken, steigt per Nummer oder „sobald beide da sind“, Tempo
  langsam/mittel/schnell, hinter Boden und Wänden gezeichnet, Dampf bei Regen) und **Stachelpresse** (elemente/presse.js;
  eigener Takt je Presse, Vorwarnung durch zitternde Kette und Staub, per Nummer anhalten oder nur bei Nummer an laufend).
- Welt-Look: eigener Feuer-Himmel mit Tageszeit-Farben (`zeitFarben: 'feuer'`), heißer Regen nur bei Wetter „Regen“;
  der alte Feuerberg (level-6) behält seinen Look und bleibt trocken.
- Abweichungen vom Plan (begründet):
  - Lava-Flucht „sobald jemand kommt“ wurde zu **„sobald beide da sind“** – sonst sperrt die Lava den nachkommenden
    Partner aus, ohne dass er etwas falsch gemacht hat.
  - Lava-Kammern mit Flucht nach oben haben einen **Einstieg von oben** (Sprung hinunter, kein Weg zurück): wer vor der
    steigenden Lava zurückweicht, säße sonst fest.
  - Lava, die unter dem Boden steigt, liegt mindestens 2 Reihen tiefer als der Boden – sonst bleibt keine Reaktionszeit.
  - Schlackewerk „Flammenfallen + Bänder“: Flammen von der Decke über dem Band, Flammen **durch Stege** von unten
    (die Düse sitzt in der Lava) und ein Flammen-Vorhang, der nur per Hebel ausgeht.
  - Feuerschlund „Wechselboden über Lava“: einmal im Takt (2 s, im Finale 1,5 s) und einmal per Hebel, den das
    Schweinchen genau dann umlegt, wenn der Affe springt.
  - Kraterherz „Hebel-Ketten“: Hebel 1 → Brücke 1, Hebel 2 → Brücke 2, Hebel 3 → Tor **und** Lava (Regel: ein Hebel,
    der Lava steigen lässt, öffnet immer auch ein Tor) + eine Druckplatten-Staffel unter zwei schnellen Pressen.
- Abstandsgrenze (40 Spalten zwischen den Figuren) bestimmt, wie weit Hebel/Teleporter vom wartenden Partner liegen
  dürfen (z. B. Feuerschlund Etappe 3: Druckplatte, Teleporter und Hebel liegen höchstens 38 Spalten auseinander).

### Balance-Bericht Vulkan (Ausbau 7, Koop-Bot-Messungen)

Einstufungen wie bisher (komfortabel / knapp / Grenze). Zahlen = wie viele der vom Bot probierten Varianten
(Absprung-Spalte, Sprung-Haltedauer, Loslass-Strategie am Seil, Zeitfenster) klappen. Jede Lava-Flucht hat direkt
davor einen Checkpoint; nach einem Tod ist die Lava wieder unten.

**Härteste Stellen Level 17 „Glutpfad“ (Lehr-Level, Ziel: typisch 3, schwerste 5):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 605–652 | Pilz-Kette über den steigenden Lavasee | Pilz-Timing | knapp (das Schweinchen schafft sie auch ohne Segeln) |
| 463–500 | Lava-Raum 2: Hebel 4 öffnet das Tor, die Lava steigt schneller | Tempo | knapp |
| 255–280 | Lava-Kamin (Wandsprung, Lava steigt) | Wandsprung | knapp |
| 410–440 | Lava-Graben mit Druckplatte 2 | Koordination | komfortabel |

**Härteste Stellen Level 18 „Aschefeld“ (Lehr-Level, Ziel: typisch 3, schwerste 6):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| Etappe 2 | Gegenband unter Pressen (große Lücken abwarten) | Takt lesen | knapp (Bot braucht ein Zeitfenster von 70 Schritten) |
| Etappe 4 | Großer Pressen-Rhythmus (sechs Pressen, kurze Bänder) | Takt | knapp |
| Etappe 3 | Hebel 7: Tür auf, Pressen über der Lava-Brücke laufen an | Koordination + Takt | knapp |
| Etappe 1 | Pressen-Gang (niedrig, kein Segeln) | Takt | komfortabel |

**Härteste Stellen Level 19 „Magmakammer“ (Kombi, Ziel: typisch 4, schwerste 8):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 207–246 | Affe hinterher an vier Haken, während der See steigt | Seil-Schwung | knapp (1 von 3 Strategien) |
| 258–303 | Hebel 3 (Schweinchen oben): Tür auf, Lava über dem Steinweg – der Affe muss sofort los | Koordination + Tempo | knapp |
| 600–664 | Doppel-Schacht: Platte 10 (Schwein) öffnet den Kamin, Hebel 11 (Affe) die Klappe | Koordination | knapp |
| 24–80 | Zickzack-Kamin mit schneller Lava | Wandsprung + Tempo | knapp |

**Härteste Stellen Level 20 „Schlackewerk“ (Kombi, Ziel: typisch 4, schwerste 9):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 266–290 | Schleuder: das gedrehte Band wirft den Affen über die Grube | Absprung-Timing | knapp (4 von 6, nur von Spalte 278/279) |
| 62–106 | Gegenband-Tunnel mit drei breiten Pressen | Takt + Band | knapp (Zeitfenster 70 Schritte) |
| 659–700 | reißendes Gegenband: Schwein segelt über zwei Aufwinde, Affe passt danach zwei Pressen ab | Segeln + Takt | knapp (Segeln 7 von 7, die Landung liegt aber direkt hinter dem Band) |
| 458–498 | Flammen durch die Stege (der Flammen-Welle hinterherspringen) | Timing | komfortabel bis knapp (5 von 5 Zeitfenstern) |
| 721–799 | Finale: Kessel läuft voll (schnell) | Tempo | knapp |

**Härteste Stellen Level 21 „Feuerschlund“ (Kombi/Meister, Ziel: typisch 5, schwerste 10):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 600–664 | Doppel-Flucht: zwei Schächte, zwei Lavastände (im Aufwind-Schacht schneller) | Koordination + Tempo | Grenze (mit schnellerer Lava im Kamin schafft es der Bot nicht mehr – deshalb dort langsam) |
| 505–556 | Klappen im Lavagang: Hebel 9 genau beim Sprung umlegen | Koordination | Grenze (Absprache nötig) |
| 136–170 / 472–505 | Teleporter-Kammern: die Lava steigt, der Partner muss rechtzeitig schalten | Koordination + Tempo | knapp |
| 206–255 / 668–705 | Wechselboden im Takt über der Lava (2 s / 1,5 s) | Rhythmus | knapp (Absprung-Fenster ~0,6 s) |
| 326–370 | der Schlund: Stege treppauf, der See steigt schnell | Tempo | knapp |

**Härteste Stellen Level 22 „Kraterherz“ (Meister, Ziel: typisch 5, schwerste 10+):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 286–318 | Eis unter Pressen: früh gegensteuern, um vor einer Presse zu warten | Eis + Takt | Grenze (ohne Gegensteuern 0 von 3, mit 3 von 3) |
| 337–376 | Affe hinterher an vier Haken, während der See steigt | Seil-Schwung | knapp bis Grenze (1 von 3 Strategien) |
| 401–490 | Hebel-Kette: Brücke 1, Brücke 2, Hebel 3 = Tor + Lava, zügig nach oben | Koordination + Tempo | knapp (Haken 1 von 6 Varianten zuerst erfolgreich) |
| 501–541 | Platten-Staffel unter zwei schnellen Pressen | Koordination | knapp |
| 200–281 | Flucht über Eis und Band, drei Stege hinauf | Tempo + Eis | knapp |
| 600–641 | Kessel: Band, Pilz, Stege (Lava schnell) | Tempo | knapp |
| 649–689 | Kraterschlucht: Affe an vier Haken / Schwein mit zwei Aufwinden | Seil / Segeln | knapp (Haken 2 von 3) |

## Level-Dateien nach Welten (Editor-Umbau)

Seit dem Editor-Umbau liegen die Level in `levels/<welt>/<nr>-<titel>.json` (Editor-Format gespiegelt in
`levels/editor-format/`). Die Nummer im Dateinamen wird beim Anlegen vergeben und bleibt; die Reihenfolge im Spiel
steht in `levels/worlds.json`. Alte Spielstände werden beim Laden automatisch umgeschrieben (`js/01a-level-umzug.js`).

| alt | neu |
|---|---|
| `levels/level-1.json` | `levels/dschungel/01-dschungel.json` |
| `levels/level-2.json` | `levels/dschungel/02-baumkronen.json` |
| `levels/level-7.json` | `levels/dschungel/03-lianenschlucht.json` |
| `levels/level-8.json` | `levels/dschungel/04-gluehwald.json` |
| `levels/boss-1.json` | `levels/dschungel/boss-bruno.json` |
| `levels/level-3.json` | `levels/ruinen/01-ruinen.json` |
| `levels/level-4.json` | `levels/ruinen/02-mondnacht.json` |
| `levels/level-9.json` | `levels/ruinen/03-fallengang.json` |
| `levels/level-10.json` | `levels/ruinen/04-sonnentempel.json` |
| `levels/level-11.json` | `levels/ruinen/05-felsenflucht.json` |
| `levels/level-5.json` | `levels/hoehle/01-kristallhoehle.json` |
| `levels/level-12.json` | `levels/hoehle/02-tropfsteingang.json` |
| `levels/level-13.json` | `levels/hoehle/03-eisgrotte.json` |
| `levels/level-14.json` | `levels/hoehle/04-leuchtgrotte.json` |
| `levels/level-15.json` | `levels/hoehle/05-foerderwerk.json` |
| `levels/level-16.json` | `levels/hoehle/06-tiefenschlund.json` |
| `levels/level-17.json` | `levels/vulkan/01-glutpfad.json` |
| `levels/level-18.json` | `levels/vulkan/02-aschefeld.json` |
| `levels/level-6.json` | `levels/vulkan/03-feuerberg.json` |
| `levels/level-19.json` | `levels/vulkan/04-magmakammer.json` |
| `levels/level-20.json` | `levels/vulkan/05-schlackewerk.json` |
| `levels/level-21.json` | `levels/vulkan/06-feuerschlund.json` |
| `levels/level-22.json` | `levels/vulkan/07-kraterherz.json` |
| `levels/level-3-alter-entwurf.json` | `levels/archiv/level-3-alter-entwurf.json` |
