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

**Lianenschlucht (Level 3 der Welt, ca. 800 Spalten, 4 Etappen):**
1. Etappe 1 (Spalten 0–200), Lehr-Teil:
   - Steg-Treppe: einseitige Stege, von unten durchspringen.
   - Seil-Aufzug: Der Affe zieht sich mit W hoch auf einen Sims und legt dort einen Hebel um.
   - Segel-Abstieg: Das Schweinchen segelt über eine weite Schlucht zum Hebel, der eine Plattform für den Affen fährt.
2. Etappe 2 (Spalten 200–400), Kombi-Teil:
   - Seil runterlassen (S) durch ein Loch zu einem Hebel unter der Decke.
   - Das Schweinchen segelt unter einer Felsdecke durch, wo kein Haken hängt.
   - Druckplatte halten, während der andere durchgeht.
3. Etappe 3 (Spalten 400–600):
   - Sprungpilz und Schirm: Das Schweinchen prallt hoch und segelt weit.
   - Fahrende Haken über Stacheln.
   - Steg-Stockwerke mit getrennten Wegen.
4. Etappe 4 (Spalten 600–800), Meister-Stelle des Levels:
   - Lianen-Staffel: Der Affe schwingt über mehrere Haken, während das Schweinchen oben Türen öffnet.
   - Finale zum Ziel.

**Glühwald (Level 4 der Welt, ca. 800 Spalten, 4 Etappen):**
1. Etappe 1, Lehr-Teil Wechselboden:
   - Hebel: A an = B aus.
   - Einer schaltet, der andere läuft über die Brücke.
   - Danach Takt-Trittsteine, die vorher blinken.
2. Etappe 2, Lehr-Teil Teleporter:
   - Ein Paar für beide.
   - Getrennte Tore nur für den Affen bzw. nur für das Schweinchen, mit Hebeln, die dem anderen die Tür öffnen.
3. Etappe 3, Kombi-Teil:
   - Teleporter-Ausgang in der Luft: Das Schweinchen segelt heraus, der Affe greift gleich einen Haken.
   - Wechselboden per Druckplatte: Einer hält, der andere geht.
4. Etappe 4, Meister-Stelle vor Bruno:
   - Takt-Wechselboden über Stacheln, kombiniert mit Haken und Segeln.
   - Ziel am Tempeltor zu Brunos Arena.

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
