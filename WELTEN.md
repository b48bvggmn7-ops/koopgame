# WELTEN – Design je Welt (Ausbau 7/8)

Pro Welt ein Eintrag: Thema, Look, Tiere, Deko, Musik/Ambiente, Mechaniken (Plan pro Level) und die Rolle von Affe
und Schweinchen in jeder Mechanik. Technisch steht der Look in `levels/worlds.json` (Feld `aussehen` der Welt) und in
`js/10a-themen.js` (Farben/Ebenen); Tageszeit und Wetter wählt jedes Level selbst.

## Leveldesign für alle Welten (Bild-Regel, AUSBAU-REGELWERK Punkt 12)
- **Bild-Regel**: Hebel/Platte/Spiegel und das, was sie schalten, höchstens 20 Spalten auseinander; Fahrten und Tore
  bringen niemanden weiter als 20 Spalten vom Partner weg. Verfolgungen (Stachelwand, Dornendecke, Fels, Lava) dürfen
  das Ziel am Ende der Flucht öffnen – man sieht beim Ziehen, was losgeht, und läuft auf das Ziel zu.
- **Haken** (Koop-Bot, 3 Haken über einer Dornengrube, Reichweite 4,5 Kästchen, 8 Loslass-Arten):

  | Abstand | Haken 6 Reihen über dem Boden | 7 Reihen | 8 Reihen |
  |---|---|---|---|
  | 4 | 6/8 | 6/8 | 6/8 |
  | 5 | 7/8 | 7/8 | 7/8 |
  | 6 | 7/8 | 8/8 (3,9 s) | 6/8 |
  | 7 | 4/8 | 6/8 | 5/8 |
  | 8 | 4/8 | 3/8 | 5/8 |
  | 9–10 | 2–3/8 | 4/8 | 2/8 |

  Richtwerte daraus: Abstand 5–6 (höchstens 8), Haken 6–7 Reihen über dem Absprung, unter Schwung-Haken 3 Reihen frei,
  hinter der Reihe mindestens 3 Stehplätze (gelandet wird 0–11 Spalten hinter dem letzten Haken). Unter 4 Spalten
  greift der Affe oft den alten Haken wieder (das Spiel nimmt immer den nächsten in Reichweite).
  Umgebaute Stellen (vorher -> nachher, Bot): Dschungel 1 Dornengrube 2/8 -> 4/8, Dschungel 1 Hebel-Sims 1/8 -> 7/8
  (4,0 s, Landung 2–8 Spalten hinter der Kante), Dschungel 2 hoher Sims 3/8 -> 8/8 (3,8 s) – je 3 Haken im Abstand 7
  statt 2 im Abstand 9.
- **Checkpoints**: 25–70 Spalten auseinander, nach einer Leistung und vor dem nächsten schweren Stück; nie zwischen
  einem Hebel/Spiegel und seinem Ziel (nach einem Tod ist alles wieder aus). Verfolgungen und Rätsel mit zwei
  getrennten Wegen laufen am Stück ohne Checkpoint.
- **Wandsprung** (gemessen, Kombi-Nachschärfen; Breite = freie Kästchen): Kamin bequem 3–5 (4–5 Reihen je Sprung),
  knapp 6–7, Grenze 8, zu eng 1–2, zu weit ab 9; Wand mindestens 4 Reihen hoch. Einzelwand -> Plattform höchstens
  9,9 Kästchen (gleich hoch) bzw. 8,1 (3 Reihen höher), bequem ¾ davon. Wandsprung -> Segeln bis 17,1 Kästchen (gleich
  hoch) bzw. 12,1 (3 Reihen höher); Wandsprung -> Haken: Haken 3–8 Kästchen von der Wand, 6–8 Reihen über dem Absprung.
  Alle 18 Kamine der Breite 2 sind jetzt Breite 3.
- **Kombi-Stellen** (Regelwerk Punkt 12, Kombi-Regel): zwei Fähigkeiten ohne Boden dazwischen (Pilz/Aufwind zählen
  mit). Dschungel L1 ≥ 6, L2 ≥ 8, L3–L6 ≥ 10, je Etappe 2 (L1: 1), Boss ≥ 3; Ruinen/Höhle ≥ 12 (⅓ mit Timing), Vulkan
  ≥ 15, je Etappe 3. Prüfwerkzeug `python3 tests/kombi_pruefen.py`, Bot-Gegenprobe je Stelle.
  Baustein **Pilz-Grube** (Dschungel): Pilz -> Stachel- oder Todesgrube (6–8 breit) mit hohem Haken -> Landeplatz 4 Reihen
  über dem Boden; der Affe braucht Pilz + Haken, das Schweinchen Pilz + Segeln, ohne Pilz kommt keiner hinauf. Baustein
  **Kamin-Grube**: Kamin (Breite 4) endet über einer Grube mit Haken -> erhöhter Landeplatz (Wandsprung + Haken /
  Wandsprung + Segeln). Zwei Gruben direkt hintereinander nur, wenn man die zweite NICHT vom Landeplatz der ersten aus
  ohne Pilz schafft (sonst „Kette“, zählt einmal).
  Stand Dschungel (vorher -> nachher, eigenständige Stellen): L1 0 -> 4, L2 1 -> 8, L3 2 -> 10, L4 0 -> 4, L5 6 -> 6
  (Hoher Kamin jetzt für beide echt), L6 2 -> 5, Boss 0 -> 0. Unter dem Soll bleiben die rätseldichten Level (Teleporter
  in L4, Jagden in L5/L6) und der Boss – Umbau braucht eine Entscheidung (siehe Bericht).

## Welt 1 – Dschungel

**Thema:** Grüner, lebendiger Regenwald – der Einstieg. Hier lernen beide, dass sie nur zusammen weiterkommen.
Es fängt mild an (1–2 Versuche) und steigt bis zu Bruno deutlich an (6er-Welten: Dornenpfad und Wipfelsturm typisch
3–4, schwerste Stellen bis 6 Versuche).

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
| 5 | **Dornenpfad** (neu, dschungel/05-dornenpfad) | abend / regen | Meister-Level | Dornen überall: Bröckel-Steine zu zweit, Stachelwand-Jagden, sinkende Dornendecke (flach springen!), Stachel-Pendel, Takt 1,2 s, Hebel über Kreuz | 3 / 5 |
| 6 | **Wipfelsturm** (neu, dschungel/06-wipfelsturm) | nacht / wechselnd | Meister-Level (schwerstes) | alles kombiniert: Wechselboden + Teleporter + Seil + Segeln + Jagden, lange Stellen am Stück | 3–4 / 6 |
| Boss | Bruno, der Kokos-Gorilla (vorhanden) | abend / trocken | Boss | Helm-Trick nur zusammen | 5–10 |

**Dornenpfad (dschungel/05-dornenpfad.json, 800 Spalten, 4 Etappen, wie gebaut):**
1. Etappe 1 (0–200): Bröckel-Steine über Dornen (beide dicht hintereinander – wer trödelt, findet keine Steine mehr);
   Dornenfeld: Affe an vier Haken, Schweinchen per Pilz + Aufwind; Hebel über Kreuz (Hebel 1 nur per Aufwind,
   Hebel 2 nur per Haken); Stachelwand-Jagd über Bröckel-Steine (die Wand steckt im Absatz, von dem man hinunterspringt).
2. Etappe 2 (200–400): Inseln im Wechsel (vier Plattformen, zwei steigen, zwei sinken); Seilbahn + Fähre (Schweinchen
   lässt den Haken mit dem Affen fahren, der Affe holt mit Hebel 5 die Fähre); hoher Kamin (13 Kästchen Wandsprung);
   Dornendecke: Hebel 6 öffnet die Tür am Tunnelende UND lässt die Stacheldecke sinken – nur flach springen.
3. Etappe 3 (400–600): Takt-Steine 1,2 s über Dornen; Stachel-Pendel (vier Stachelblöcke im eigenen Takt);
   Druckplatten-Schleuse (Schweinchen hält Platte 7, Affe über zwei Haken zu Hebel 8, der den Deckel über dem
   Aufwind-Schacht öffnet); Pilz-Flucht vor der schnellen Stachelwand.
4. Etappe 4 (600–800): Zwei-Gänge-Staffel (Affe nur durchs blaue Tor in den unteren Gang, Schweinchen nur per Aufwind
   in den oberen; Hebel 10–13 öffnen jeweils die Tür des anderen); Finale: schnellste Stachelwand (5,2) – Grube, Pilz
   über die breite Grube, unter der Dornendecke flach landen, Ziel.

**Wipfelsturm (dschungel/06-wipfelsturm.json, 800 Spalten, 4 Etappen, wie gebaut):**
1. Etappe 1 (0–200): Luft-Tor über Dornen (Tor 1 setzt beide hoch über der Grube ab: Affe greift sofort den Haken,
   Schweinchen segelt); Brücke für die Partnerin (Affe auf Platte 2 = Brücke B, Schweinchen zu Hebel 3 = Tür 3, Affe
   an zwei Haken nach); Takt-Treppe im 1-s-Takt; Jagd durchs Tor (Stachelwand in der Stufe, am Gangende Tor 2).
2. Etappe 2 (200–400): wippende Haken (zwei fahren hin und her) / Aufwinde; Tor-Staffel (pinkes Tor -> Hebel 5 = Tür 5
   für den Affen, blaues Tor -> Hebel 6 = Tür 6 für das Schweinchen); Pilz-Turm über Dornen; Bröckel-Abstieg.
3. Etappe 3 (400–600): hohes Luft-Tor (drei Haken, der letzte fährt / Aufwind); Takt-Steine 1 s; Wechsel-Schleuse
   (Platte 7 = Brücke B + Wand A weg; Hebel 8 öffnet eine Klappe im Boden, darunter das blaue Tor für den Affen);
   Doppel-Jagd (Hebel 9 = Tür 9 + Stachelwand + sinkende Dornendecke).
4. Etappe 4 (600–800): Wipfel-Staffel (blaues Tor auf den oberen Ast: Haken über Dornengruben; pinkes Tor in den Gang:
   Takt-Steine 1,2 s; Hebel 10–13 über Kreuz); Sturm-Finale (Stachelwand 5,4 – Grube, Pilz über die breite Grube,
   die Stege hinauf, bevor die Wand unten durchfährt; Ziel oben auf dem Wipfel).

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
| 612–640 | Lianen-Staffel: Säule A → zwei Haken (Reihe 6) → Säule B (Affe) | Seil-Schwung auf schmale Säule | Grenze (2 von 12 Varianten) |
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

**Härteste Stellen Dschungel 5 „Dornenpfad“ (Ziel: typisch 3, schwerste 5):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 670–760 | Finale: schnellste Stachelwand (5,2), Pilz über die breite Grube, unter der Dornendecke flach landen | Verfolgung | Grenze (1 s gezögert = eingeholt) |
| 337–398 | Dornendecke: nur flach über die Stufen springen | Verfolgung + Sprunghöhe | Grenze (2 s gezögert oder voller Sprung an der letzten Stufe = Dornen) |
| 476–503 | Druckplatten-Schleuse: Affe an zwei Haken auf den Sims | Seil-Schwung | Grenze (2 von 3 Loslass-Varianten) |
| 512–597 | Pilz-Flucht (Wand 5,0) | Verfolgung | knapp bis Grenze |
| 604–665 | Zwei-Gänge-Staffel (Bröckel-Steine unten, Segeln oben, Hebel über Kreuz) | Koordination | knapp |
| 408–440 | Takt-Steine 1,2 s über Dornen | Timing | knapp (früh losspringen) |
| 446–473 | Stachel-Pendel | Timing | knapp (stur 1 von 10) |
| 131–200 | Stachelwand-Jagd über Bröckel-Steine | Verfolgung | knapp (1 s gezögert = eingeholt) |
| 14–38 | Bröckel-Steine zu zweit | Koordination | knapp (1,5 s Abstand = Steine weg) |
| 60–92 | Dornenfeld (Affe vier Haken, Schweinchen Pilz + Aufwind) | Seil/Segeln | knapp |

**Härteste Stellen Dschungel 6 „Wipfelsturm“ (Ziel: typisch 3–4, schwerste 6, Meister-Level vor Bruno):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 670–766 | Sturm-Finale: Stachelwand 5,4, Pilz, Stege hinauf, bevor die Wand unten durchfährt | Verfolgung | Grenze (schwerste Stelle) |
| 600–661 | Wipfel-Staffel: Haken über Dornen oben, Takt-Steine 1,2 s unten, Hebel über Kreuz | Koordination + Timing | Grenze |
| 524–584 | Doppel-Jagd (Stachelwand + sinkende Dornendecke, nur flach springen) | Verfolgung | Grenze (1,5 s gezögert = tot) |
| 82–108 | Takt-Treppe 1 s (aufwärts) | Timing | Grenze (ein voller Sprung braucht fast den halben Takt) |
| 449–483 | Takt-Steine 1 s | Timing | Grenze |
| 405–448 | Hohes Luft-Tor (drei Haken, der letzte fährt / Schweinchen landet knapp) | Seil/Segeln | knapp |
| 14–43 | Luft-Tor über Dornen (Haken sofort greifen) | Reaktion | knapp |
| 208–240 | wippende Haken / Aufwinde | Seil-Schwung | knapp |
| 115–162 | Jagd durchs Tor | Verfolgung | knapp |
| 345–374 | Bröckel-Abstieg (zu zweit) | Koordination | knapp (0,5 s Abstand = Stufen weg) |

**Reihenfolge Dschungel (6er-Welten):** Dschungel, Baumkronen, Lianenschlucht, Glühwald, Dornenpfad, Wipfelsturm –
typisch/schwerste steigt von 1/2 bis 3–4/6, danach Bruno.

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
ein Fels rollt hinterher, Licht muss gelenkt werden. Typisch 2–3 Versuche, die schwersten Stellen 5–7
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
| 2 | **Fallengang** (neu, level-9) | morgen / wechselnd | Lehr-Level | Pfeil- und Flammenfallen im Takt, Hebel stellt Fallen ab, Wechselboden im Rhythmus | 2 / 4 |
| 3 | **Sonnentempel** (neu, level-10) | abend / regen | Kombi-Level | Licht-Rätsel (Spiegel nur per Haken bzw. nur segelnd erreichbar), Teleporter, Fallen | 2–3 / 5 |
| 4 | Mondnacht (vorhanden, level-4) | nacht | Kombi (sehr schwer) | Bröckel-Sprint, Schleuse, Stachelwände | 3 / 5 |
| 5 | **Felsenflucht** (neu, level-11) | mittag / regen | Meister-Level | Rollender Fels als Verfolgung, alles kombiniert | 3 / 6 |
| 6 | **Tempelherz** (neu, ruinen/06-tempelherz) | nacht / regen | Meister-Level (schwerstes) | Fels + Fallen + Licht + Wechselboden + Teleporter gleichzeitig, lange Stellen ohne Pause | 3–4 / 7 |

**Reihenfolge (6er-Welten):** Die Level sind nach Schwierigkeit sortiert (typisch / schwerste steigt). Darum steht
Mondnacht (3 / 5) jetzt hinter dem Sonnentempel; die Dateinamen bleiben gleich.

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
| Fels räumt den Weg (Bröckel-Wand) | startet den Fels oder öffnet das Tor davor – Reihenfolge zählt | das jeweils andere |
| Wechselboden Schalter/Läufer | Schalter auf der Haken-Galerie ODER Läufer im niedrigen Gang | Schalter auf der Aufwind-Galerie ODER Läuferin |
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
| 366–398 | Schalter/Läufer (Ruinen-Überarbeitung): Affe am Hebel 15 auf der Galerie, Schweinchen im niedrigen Gang über Wechselboden A – Insel – B – Naht – A | Koordination | knapp (2–3 Versuche: anhalten genau auf der Naht, Umlegen erst wenn es steht) |
| 100–140 | Flammen-Welle | Timing | knapp (stur 1 von 25) |
| 542–564 / 737–757 | Takt-Steine 1,5 s (unter Pfeilen / zum Ziel) | Timing | knapp |
| 301–311 | Einstieg Pfeil-Gang (Schweinchen segelt) | Segeln | knapp (3 von 6) |

**Härteste Stellen Level 10 „Sonnentempel“ (Ziel: typisch 2–3, schwerste 5):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 629–678 | Doppelstrahl-Tor in zwei Abschnitten: Strahl 1 öffnet Tür 12 vor der Brücke, Strahl 2 (im Takt) das Tor mit Pfeil dahinter = Treffpunkt | Koordination + Timing | Grenze (schwerste Stelle; stur 5 von 9 erst NACH beiden Spiegeln) |
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

**Checkpoints:** Fallengang und Sonnentempel höchstens 70 Spalten auseinander (Ausnahme je ein zusammenhängendes
Rätsel: Doppelgang 604–680 bzw. zwei Wege 401–474). In der Felsenflucht wird jede Verfolgung am Stück gespielt (bis 106
Spalten ohne Checkpoint im Finale) – das macht sie zum Meister-Level.

**Sonst:** Alle anderen Stellen sind komfortabel (Lehr-Teile, Spiegel am Boden, Tore, Schleusen).

**Tempelherz (ruinen/06-tempelherz.json, 800 Spalten, 4 Etappen, wie gebaut):**
1. Etappe 1 (0–200): Fels unter dem Pfeilregen (vier Pfeil-Fallen im 1,2-s-Takt); Schweinchen-Spiegel auf der Insel
   (nur segelnd) -> Kristall -> Tür 2, Affe an zwei Haken; Affen-Spiegel am Sims (nur per Haken) -> Kristall im Boden
   -> Tür 3; Fels-Flucht durch die Tore (blau/pink hinauf).
2. Etappe 2 (200–400): Takt-Steine 1,2 s mit Fels im Nacken; Licht-Takt-Tor (Takt-Stein unterbricht den Strahl, Pfeil
   im Tor); Pfeilgang mit Brücke (Platte 9 / Hebel 10 / zwei Haken); Flammen-Welle mit Fels im Nacken.
3. Etappe 3 (400–600): Wechsel-Flucht unter Pfeilen; Licht-Brücke im 1,5-s-Takt; Flammen-Kreuz (Affe oben per Haken
   über Flammen-Düsen, Schweinchen unten per pinkem Tor, Hebel 14/15 über Kreuz); Fels und Licht-Tor.
4. Etappe 4 (600–800): Doppelstrahl-Tor (zwei Spiegel, die nur je einer erreicht; Strahl 2 im Takt unterbrochen);
   letzte Felsflucht (Grube, zwei Pfeil-Fallen, Flammen-Düse, Stege) zum Tempelherz.

**Härteste Stellen Ruinen 6 „Tempelherz“ (Ziel: typisch 3–4, schwerste 7, schwerstes Ruinen-Level):**

| Spalte | Stelle | Typ | Einstufung |
|---|---|---|---|
| 643–744 | letzte Felsflucht (Grube, Pfeile, Flamme, Stege) | Verfolgung + Timing | Grenze (schwerste Stelle) |
| 599–641 | Doppelstrahl-Tor (Haken zum Sims, Insel, Takt-Fenster für beide Türen) | Koordination + Timing | Grenze |
| 3–62 | Fels unter dem Pfeilregen | Verfolgung + Timing | Grenze (stur 0 von 10) |
| 196–240 | Takt-Steine 1,2 s mit Fels im Nacken | Timing unter Druck | Grenze (5 von 6 Startzeiten) |
| 305–373 | Flammen-Welle mit Fels | Timing unter Druck | knapp |
| 380–418 | Wechsel-Flucht unter Pfeilen | Verfolgung | knapp |
| 446–498 | Flammen-Kreuz | Koordination + Timing | knapp |
| 425–448 | Licht-Brücke im Takt | Timing | knapp (stur 2 von 12) |
| 273–304 | Pfeilgang mit Brücke | Koordination + Timing | knapp |
| 500–576 | Fels und Licht-Tor | Verfolgung | knapp |
| 246–272 | Licht-Takt-Tor | Timing | komfortabel bis knapp (stur 10 von 12) |

### Licht-Rätsel in allen Ruinen-Leveln (Licht-Überarbeitung)
| Level | Stelle | Wer macht was | Einstufung |
|---|---|---|---|
| Ruinen 1 | 786–826 „Sonnenkammer“: Licht-Tor (Platte), Spiegel auf dem Aufwind-Sims, Tür im Fallweg (Hebel auf dem Haken-Sims), Kristall öffnet den Ausgang | Affe: Haken -> Hebel -> Platte · Schweinchen: Aufwind -> Spiegel | knapp (3–4 Versuche: Reihenfolge herausfinden) |
| Mondnacht | 451–500 „Mondspiegel“: zwei Kristalle nacheinander, Licht-Tor an der Platte, Rollentausch | erst Schweinchen auf der Platte, Affe stellt Spiegel A; dann Affe auf der Platte, Schweinchen segelt über die breite Grube zu Spiegel B | knapp (3–4) |
| Fallengang | 772–818 „Lichtweiche“: Brücken A/B über der Grube hängen am Licht, drei Spiegel | Schweinchen wartet auf der Naht, Affe (Haken) stellt die Weiche, Schweinchen (Aufwind) schaltet Ausgang und Brücke für den Affen | Grenze (4–5: zweimal Naht + Umlegen im richtigen Moment) |
| Felsenflucht | 752–800 „Felsbrecher-Licht“: Fels bricht die Wand (Strahl frei), Sonnenstein nur mit Platte, Licht-Tür per Hebel im Aufwind-Schacht | einer startet den Fels (alle hinten bleiben), Schweinchen Schacht-Hebel, Affe Haken-Spiegel, zuletzt Affe auf der Platte, Schweinchen dreht den Bodenspiegel | Grenze (4–5) |
| Tempelherz | 750–798 „Sonnenkrone“: drei Kristalle, Pfeilfalle über der Sonnenstein-Platte, breite Grube | Schweinchen hält die Platte (Pfeilen ausweichen), Affe stellt Spiegel 1; Tausch; Schweinchen segelt hinüber und lenkt das Licht erst auf Tor 2, dann auf die Brücke | Grenze (5–6, schwerste Licht-Stelle) |

### Schaltbare Spiegel und Licht-Labyrinthe (Spiegel mit Nummer)
Spiegel mit Verknüpfungs-Nummer drehen sich NUR, wenn jemand eine Platte betritt oder einen Hebel umlegt (nie von selbst).
Die Licht-Rätsel oben wurden zu Labyrinthen mit falschen Pfaden umgebaut (Schwierigkeit steigt in Welt-Reihenfolge; der
Löser-Test `licht_raetsel_loeser` probiert alle Stellungen durch: genau eine Lösung, jeder Strahl endet sichtbar).
Labyrinthe sind Kopf-Rätsel: mehr Zeit zum Überlegen, kaum mehr Fehlversuche.
| Level (Welt-Reihenfolge) | Spalte | Rätsel | Wer macht was | Stellungen / Lösungen / falsche Pfade | Einstufung |
|---|---|---|---|---|---|
| Ruinen 1 | 786–812 | „Zwei Spiegel in Reihe“: Spiegel A (Platte 22) über Spiegel B (Hebel 21) | Schweinchen (Aufwind-Sims) betritt die Platte, Affe (Haken-Sims) legt den Hebel um | 4 / 1 / 2 (Decke, Ausgangstor) | komfortabel–knapp (2) |
| Fallengang | 772–805 | „Lichtweiche“: eine Platte, zwei Spiegel (35) + Weichen-Hebel 36; Licht plus Wechselboden | Affe (Haken-Sims) Platte, Schweinchen (Aufwind-Sims) Weiche; Brücke kommt nur per Licht | 4 / je Phase 1 / 1 (Boden) + falsche Weichen-Stellung | knapp (2–3) |
| Sonnentempel | 482–518 | „Licht plus Fallen“: Platte 15 lässt die Pfeile schweigen, dreht aber den richtig stehenden Spiegel 1; Platten 16/17 unter den Pfeilen | einer hält Platte 15, der andere tritt auf 16 und 17; dann ab- und wieder aufsteigen; zurück durch die Pfeile im Takt | 8 / 1 / 2 | knapp (3) |
| Mondnacht | 451–500 | „Strahl-Labyrinth“ in zwei Abschnitten: Platte 52 hält das Licht-Tor UND dreht Spiegel B bei jedem Betreten; Hebel 53 (Affen-Sims); jenseits der Grube Platte 55 (E+G) und Hebel 56 (F) | Übergabe auf der Platte ohne dass sie frei wird; Schweinchen segelt hinüber und löst Abschnitt 2 | 16 / 1 / 3 (Wand am Turm, Decke über E, Affen-Sims) | knapp–Grenze (3–4, Denkzeit) |
| Felsenflucht | 752–790 | „Felsbrecher-Licht“: Fels bricht die Wand, Sonnenstein nur mit Platte 44, Hebel 45 (Spiegel 1), Platte 46 auf dem Affen-Sims (Spiegel 2), Licht-Tür 41 im Schacht | Rollentausch: einer hält Platte 44, Affe Sims-Platte, Schweinchen Schacht-Hebel + Hebel 45 | 4 / 1 / 3 (Boden, Wand, Tür) | Grenze (4–5) |
| Tempelherz | 750–798 | „Geteilter Strahl“: Hebel 60 unter der Pfeilfalle (Sonnenstein 1), Hebel 23 (Spiegel 1), Hebel 24 dreht Spiegel 3 UND 5, Hebel 25 (Spiegel 4); zweiter Sonnenstein; Doppeltor nur offen, solange BEIDE Kristalle leuchten | Schweinchen: Pfeil-Hebel, segelt hinüber, Hebel 24/25; Affe: Haken-Sims, Hebel 23 zweimal; Brücke, dann Doppeltor | 8 / je Phase 1 / 2 (Decken über 3 und 5) + falsche Richtung von Spiegel 4 | Grenze (5–6, schwerste Licht-Stelle) |
Strahl über den Bildrand: Mondnacht (B -> E, 15–23 Spalten) und Tempelherz (Spiegel 2 -> 3, 22 Spalten). Am Bildrand
leuchtet dann ein Doppelpfeil in Laufrichtung, daneben ein Kristall-Zeichen (trifft draußen einen Kristall) oder ein
Funken-Stern (endet draußen in einer Sackgasse); schaltet ein Kristall außerhalb des Bildes, zeigt zusätzlich der
Ziel-Hinweis-Pfeil zur Tür.

### Ruinen-Überarbeitung (vor der Wasserwelt)
- **Pfeile:** größer (52 px), dunkler Umriss, helles Holz, rote Federn, Bewegungsspur; nachts leuchten sie; Vorwarnung
  zeigt die Spitze schon im Schlitz; Einschlag mit Staub, Funken, Riss. Trefferfläche unverändert (10 × 10 px um die
  Spitze). Flamme sichtbar so breit wie ihre Trefferfläche.
- **Rollender Fels:** schwer und dunkel, Drehung gut sichtbar, Schatten am Boden, Kiesel/Staub, Kamera-Wackeln,
  Bruchstücke. Wackelt ½ s vor dem Losrollen; außerhalb des Bildes kündigt er sich am Bildrand an. Neu als Rätsel: er
  bricht durch Bröckel-Wände und räumt so einen Weg frei (levels/test/fels-wand.json). Zweite Idee (noch nicht gebaut):
  „Fels als Brücke“ – fällt er in eine Grube, die genau so breit ist wie er, bleibt er liegen und man kann über ihn gehen.
- **Wechselboden Schalter/Läufer:** Anzeige am Hebel (A/B), deutlichere Geisteranzeige; Bauweise mit Galerie (nur per
  Haken oder Aufwind) und niedrigem Gang; Testlevel levels/test/wechselboden-hebel.json; im Fallengang Spalte 366–398.

**Reihenfolge Ruinen (6er-Welten):** Ruinen, Fallengang, Sonnentempel, Mondnacht, Felsenflucht, Tempelherz – typisch/
schwerste steigt von 2/3–4 bis 3–4/7.

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
| 1 | **Tropfsteingang** (neu, level-12) | morgen / trocken | Lehr-Level | Förderband, Stege, enge Kamine | 2–3 / 4 |
| 2 | **Eisgrotte** (neu, level-13) | abend / regen (Tropfwasser) | Lehr-Level | Eis, Aufwind, Präzisionssprünge | 3 / 5 |
| 3 | Kristallhöhle (vorhanden, level-5) | – (alter Look) | Kombi | Aufwind, Scheinwände, Kamine | 3 / 5 |
| 4 | **Leuchtgrotte** (neu, level-14) | nacht / trocken | Kombi-Level | Dunkelheit + Leuchtkristalle, Scheinwände, Teleporter | 3 / 6 |
| 5 | **Förderwerk** (neu, level-15) | mittag / wechselnd | Kombi-Level | Förderband + Eis + Hebel über Kreuz, Kamine | 3–4 / 7 |
| 6 | **Tiefenschlund** (neu, level-16) | nacht / regen | Meister-Level | alles kombiniert, lange Präzisions-Passagen im Dunkeln | 4 / 8 |

**Reihenfolge (6er-Welten):** nach Schwierigkeit sortiert – die beiden Lehr-Level zuerst, die Kristallhöhle (3 / 5)
an Platz 3; die Dateinamen bleiben gleich.

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
des anderen (in zwei Hälften mit Treffpunkt in der Mitte, Hebel 4/11, dann 12/5). 3. Flammenfallen + Bänder. 4. Großes Werk: Band, Presse, Pilz, Haken.

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
| 136–170 / 472–505 | Teleporter-Kammern (Lavafeld 408–443 davor jetzt mit Zwischen-Insel: 2 Pilze – Insel – 2 Pilze): die Lava steigt, der Partner muss rechtzeitig schalten | Koordination + Tempo | knapp |
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
