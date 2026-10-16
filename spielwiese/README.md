# Spielwiese – Bewegungs-Mechaniken ausprobieren

Die Spielwiese ist ein **eigenständiger Prototyp** für Monchichi Koop. Hier werden neue Bewegungs-Mechaniken gebaut und
erfühlt: Dash, Haken wie bei Spider-Man, an der Unterseite haften/rollen, Durchbrechen. Es geht ums Spielgefühl, nicht
um Aussehen. Alles lässt sich live verstellen (Taste **Tab**), und jede Mechanik hat Varianten zum Vergleichen.

## Öffnen
- **Online:** `…/spielwiese/index.html` (dieselbe GitHub-Pages-Adresse wie das Spiel, nur mit `/spielwiese/` dahinter).
- **Lokal:** über einen kleinen Webserver im Projektordner, z. B. `python3 -m http.server`, dann
  `http://localhost:8000/spielwiese/index.html` (direkt als Datei geöffnet fehlen evtl. die Figuren-Bilder).

## Tasten
| Was | Tastatur | Controller |
|---|---|---|
| Laufen | A / D (oder Pfeile) | Stick / Steuerkreuz |
| Springen (an der Wand: Wandsprung) | Leertaste | ✕ |
| Dash (ab Teil 2) | J | □ |
| Haken (halten) | K oder linke Maustaste | R1 |
| Greifen (ab Teil 4) | L | L1 |
| Seil ranziehen/geben, zielen | W / S | hoch / runter |
| Variante der Mechanik wechseln | 1 – 4 | R2 (weiter) |
| Zurück zum Rücksetzpunkt (heilt auch Zerbrochenes) | R | Share |
| Mini-Editor an/aus | B | – |
| Einstellungen, Teleport zu den Stationen | Tab | Options |

Tasten umlegen: Tabelle `TASTEN` bzw. `PAD_KNOEPFE` in `js/01-eingabe.js`.

## Stationen
1. Grundlagen – Stufen, Stachelgruben, Coyote-Lücke, Kamin (Varianten: Sprung)
2. Dash – Lücke nur mit Sprung + Dash, Slalom (Wand berühren lädt den Dash auf), Wand hoch mit Dash nach oben
   (Varianten: A fester Dash, B gleitender Dash, C Dash-Sprung, D Dash mit Abbruch)
3. Haken – Anker-Reihe in verschiedenen Abständen, hohe Decke, großer Bogen über Stacheln
   (Varianten: A automatisch zum besten Anker, B Decken überall, C Anker mit Magnet, D freies Zielen mit Maus/rechtem
   Stick). K halten = festhalten, loslassen = Abwurf mit Schwung; W/S Seil ran/geben (S halten = rutschen);
   Leertaste am Seil = loslassen mit Hüpfer, an der Wand Wandsprung; J am Seil = Dash aus dem Schwung.
   Im Panel: „Taste halten“ aus = drücken zum An/Los, nochmal drücken hangelt direkt zum nächsten Anker.
4. Unterseite – Gang mit Haftfläche (lila) an der Decke über Stacheln; Roll-Parcours: Rampe hinunter, klebriger
   Boden, Wand hoch, unter der Decke zurück, außen herum, Schanze über Stacheln
   (Varianten: A Unterseiten-Haften = L halten an lila Flächen, S/Loslassen = fallen, Leertaste = Absprung;
   B Rollen = L halten, Kugel mit Schwung, klebt an lila Flächen auch um Ecken; C Haften an jeder Decke)
5. Durchbruch – Kästchen mit Rissen zerbrechen nur mit Dash (ohne Dash prallt man ab): Raum mit Wänden und Decke,
   Boden von oben, Kette aus fünf Wänden (nach jedem Bruch kurzes Fenster für den nächsten Dash/Sprung), hohe Wand mit
   Anker dahinter: durch die Wand dashen, dann Haken (Varianten: A bleibt kaputt bis R, B wächst nach, C nur mit
   viel Tempo = Dash plus Schwung)
6. Kombi – alles hintereinander: Kamin (Wandsprung) → Haftdecke über der Grube (L) → vom Hängen per Dash durch die
   Risswand → zwei Haken-Schwünge → Landeplatz → Sprung + Dash nach oben ins Ziel. Zwei Fähnchen = Zwischenpunkte.
7. Freie Fläche (zum Herumtoben und Selbstbauen) – mit Knick-Block neben einem Anker, Halfpipe aus normalen Wänden
   und einer Kristall-Strecke (Sprung + Dash, jeder grüne Kristall lädt den Dash in der Luft wieder auf)

8. Spaß-Level – kurzes Level, jede Sache einmal: Hügel mit Rampen, kleiner Sprung, Kamin (Wandsprung), Haftdecke (L),
   Risswand (Dash), Kristall-Grube (Sprung + Dash, Kristalle laden auf), zwei Haken-Schwünge (K), Ziel-Podest
   (Sprung + Dash nach oben). Drei Fähnchen = Zwischenpunkte.

## Zusatz-Schalter (Ideen 1–4, im Panel)
1. Dash-Kristalle (Gruppe Dash): grüne Rauten laden den Dash auf, kommen nach ein paar Sekunden wieder; im Editor Taste 9.
2. Lochgröße beim Durchbruch (Gruppe Durchbruch): 0 nur figurgroß · 1 3×3 · 2 ganze Wand/Reihe quer zum Dash.
3. „Liane knickt an Ecken“ (Gruppe Haken): die Liane wickelt sich um Ecken und wieder ab, statt durchzuschneiden.
4. „Schwung auch an normalen Wänden umlenken“ (Gruppe Unterseite, Rollen B): Halfpipe – an Wänden hochrollen,
   wer oben langsam wird, fällt ab.

## Aussehen und Dash-Aufladen
- Spiel-Look (Panel „Aussehen“): Dschungel wie im Spiel – Himmel mit Sonne, Hügel und Bäume, Boden mit Gras,
  Erdschichten und dunkler Kontur, Stacheln und Haken-Punkte wie im Spiel, Schatten unter der Figur. Nachgezeichnet,
  kein Code aus `../js/`. Die Figur rollt beim Laufen wie im Spiel (Schalter „Figur rollt“).
- Dash lädt langsam auf (Panel „Dash“, Standard an): jeder Dash kostet einen Punkt, der sich in ca. 0,9 s wieder
  füllt (Tortenstück über dem Kopf). Kristalle füllen sofort. Aus = alter Modus (Landung/Wand/Haken füllen sofort).
- Haken ohne Ziel: keine Liane mehr (Schalter „Ohne Ziel: Liane kurz ins Leere“ holt sie zurück).

## Mini-Editor (Taste B)
- B schaltet Bauen an/aus, das Spiel läuft dabei weiter (gleich ausprobieren).
- Linke Maustaste (auch gedrückt ziehen) setzt, rechte löscht. Ziffern 1–9 oder Mausrad wählen:
  1 Boden/Wand · 2 Haftfläche · 3 Brechbar · 4 Anker · 5 Stacheln · 6 Rampe ↗ · 7 Rampe ↖ · 8 Radierer · 9 Kristall.
- Im Panel (Tab) unter „Karte“: speichern (`spielwiese-karte`), gespeicherte laden, Original-Arena, Export/Import als JSON.

Im Panel außerdem: Wandsprung-Varianten (A einfach, B wie im Spiel) und die Kantenhilfe (Kopf rutscht an Ecken
vorbei, Dash hüpft auf knappe Stufen).

## Einstellungen (Tab)
- Schieberegler und Schalter für alle Werte, nach Mechanik gruppiert, je Gruppe „Standard“.
- Varianten je Mechanik (auch mit 1–4; sie gelten für die Mechanik der Station, in der man steht).
- Spielgefühl-Hilfen einzeln an/aus: Wackeln, Trefferstopp, Staub, Nachbilder, Dehnen/Stauchen, Töne.
- Voreinstellungen speichern/laden, Export/Import als JSON-Text, Figur (Affe/Schweinchen, nur Aussehen).

## Aufbau
`index.html` lädt `js/*.js` in fester Reihenfolge (klassische Skripte, kein Build): 00 Grundwerte · 01 Eingabe ·
02 Werte/Varianten/Speichern · 03 Karte/Stationen · 04 Figur/Physik · 05 Spielgefühl/Töne · 06 Kamera/Zeichnen ·
07 Einstellungs-Panel · 99 Start. Fester Takt: 60 Physik-Schritte pro Spielsekunde (Spieltempo 0,9 wie im Spiel),
Kästchen 40 px, Bild 1280×720, Zoom 0,85, Figurengröße wie im Spiel.

## Regel: getrennt vom Spiel
- Die Spielwiese benutzt **keinen** Code aus `../js/` und teilt keinen Zustand mit dem Spiel.
- Sie liest nur die Bilder `../assets/monkey.png` und `../assets/pig.png`.
- Sie speichert nur unter eigenen Schlüsseln (`spielwiese-einstellungen`, `spielwiese-voreinstellungen`,
  `spielwiese-karte`), nie unter denen des Spiels.
- Sie ist nirgends im Spiel verlinkt. Alles liegt nur im Ordner `spielwiese/`; am Spiel wird nichts geändert.
