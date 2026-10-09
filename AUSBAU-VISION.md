# AUSBAU-VISION – Monchichi Koop

Vor jedem Ausbau-Schritt lesen, zusammen mit AUSBAU-REGELWERK.md. Diese Datei beschreibt, WOHIN das Spiel wächst.
Was das Spiel heute schon kann, steht in FEATURES.md (das bleibt die Wahrheit über bestehendes Verhalten).

## Vision
Aus dem Prototyp wird ein großes, abwechslungsreiches Koop-Jump'n'Run für zwei Spieler an einem Gerät (Couch-Koop):
- **Affe** (Haken/Seil, Schwingen) und **Schweinchen** (Schirm, Segeln) sind nur zusammen stark. Das Zusammenspiel ist
  Pflicht und das Herzstück: Jede Passage braucht beide Figuren und beide Fähigkeiten, keine Figur ist je überflüssig.
- Rätsel sind kreativ, abwechslungsreich und klug durchdacht, mit vielen verschiedenen Ideen statt Wiederholung.
- **Hoher Schwierigkeitsgrad**: An harten Stellen braucht man mehrere Versuche, aber es ist immer fair und nie unmöglich
  (keine Zufallstode, klare Hinweise, Checkpoints vor harten Stellen). Welt 1 ist etwas milder, wird aber schnell
  deutlich schwerer (Kurve: siehe Regelwerk Punkt 13).
- Ton: süß und cool, nicht kindisch.

## Aufbau des Spiels
- **Weltkarte im Hauptmenü** statt einer langen Levelliste. Jede Welt ist ein eigener Bereich mit mehreren Leveln
  (je ca. 800 Spalten) und einem **Endgegner** am Ende.
- **Welten** (Reihenfolge): Dschungel → Ruinen → Höhle → Wasser → Vulkan (weitere später möglich, z. B. Himmel).
- **Die 6 bestehenden Levels** werden in die Welten einsortiert, nichts geht verloren (Vorschlag siehe „Offene
  Entscheidungen“). Alte Spielstände (freigeschaltete Level, Statistik, Cosmetics, Münz-Konto) bleiben gültig.
- **Welt, Tageszeit und Wetter sind getrennt** (heute steckt das alles zusammen im „Thema“ eines Levels):
  - Welt = Gelände, Hintergrund, Tiere, Farben und das Mechanik-Set.
  - Tageszeit = morgen, mittag, abend, nacht (Licht, Himmel, Dunkelheit).
  - Wetter = wechselnd, trocken, regen.
  - Tageszeit und Wetter sind pro Level frei wählbar und in jeder Welt möglich (Ausnahmen, wo es keinen Sinn ergibt,
    z. B. Regen in der Höhle, werden passend dargestellt statt verboten).

## Welten und ihr Mechanik-Set (Startidee)
| Welt | Charakter | typische Mechaniken |
|---|---|---|
| Dschungel | grün, lebendig, Einstieg | Haken, Segeln, Hebel/Türen, Bröckelboden, Pilze, Wechselboden, einseitige Plattformen |
| Ruinen | Sandstein, Timing | Pressen, Stachelwände, Fallen, Teleporter, Druckplatten |
| Höhle | dunkel, Präzision | Aufwind, Scheinwände, Kristalle, Dunkelheit, Förderband, Teleporter |
| Wasser | Schwimmen | Schwimmen mit Luft-Timer, Luftblase bei Nähe beider, Strömung |
| Vulkan | das Härteste | Lava (steigend), Sprungpilze, Wind, Fallen, alles kombiniert |
Weitere mögliche Elemente je nach Welt: Eis, Wolken (Himmel), Wind.

## Neue Mechaniken
- **Wechselboden**: Hebel oder Druckplatte blendet Boden ein/aus (A an = B aus).
- **Teleporter**: Paare von Toren; was rein geht, kommt am Partner heraus (mit Schwung).
- **Einseitige Plattformen**: von unten durchspringbar, von oben begehbar (evtl. nach unten durchfallen lassen).
- **Je nach Welt**: Fallen, Eis (rutschig), Förderband, Wolken, Wind (seitlich).
- **Wasser**: Schwimmen mit Luft-Timer je Figur. Unter Wasser gibt es keinen Haken und kein Segeln. Kommen beide
  Figuren dicht zusammen, bildet sich eine Luftblase, in der beide atmen können (Luft füllt sich auf).
- Für jede Mechanik gilt die Frage: „Welche Rolle haben Affe und Schweinchen?“ (Regelwerk Punkt 11).

## Kleine Geschichte
- Zu Beginn wird **der Professor entführt**: kurze, überspringbare Spielszene mit den vorhandenen Figuren und
  Sprechblasen (kein Video, keine neuen großen Grafiken nötig).
- **Jeder Endgegner hält ein Teil**, das die nächste Welt öffnet. Am Ende werden alle Teile zusammengesetzt und der
  Professor befreit.
- Ton: süß und cool, kurze trockene Sprüche (passend zu den bestehenden Sprechblasen beim Tod), nicht kindisch.

## Editor
Der Editor wächst mit und wird besser strukturiert:
- Werkzeuge in Gruppen (Gelände, Gefahren, Schalter/Türen, Bewegung, Spezial, Deko/Start/Ziel)
- Undo/Redo, Kopieren/Einfügen von Bereichen
- Pro Level: Welt, Tageszeit, Wetter (ersetzt die heutige Auswahl „Thema“, alte Levels werden umgerechnet)
- Alle neuen Mechaniken als Werkzeuge; „☁ Auf GitHub speichern“ und „▶ Testen“ funktionieren weiter

## Die Schritte
| Nr. | Schritt | Inhalt |
|---|---|---|
| 0 | Briefing und Regelwerk | diese Datei + AUSBAU-REGELWERK.md |
| 1 | Fundament | Welten-Datenmodell, Tageszeit/Wetter getrennt vom Thema, Spielstand (mit Übernahme alter Stände) |
| 2 | Editor ausbauen | Werkzeug-Gruppen, Undo/Redo, Kopieren/Einfügen, Welt/Tageszeit/Wetter pro Level |
| 3 | Weltkarte und Welt-Seite | Weltkarte im Hauptmenü, Welt-Seite mit ihren Leveln und dem Boss |
| 4 | Neue Mechaniken | Wechselboden, Teleporter, einseitige Plattformen |
| 5 | Wasser und Schwimmen | Schwimmen, Luft-Timer, Luftblase, kein Haken/Segeln unter Wasser |
| 6 | Story-Intro und Boss-Gerüst | Entführungs-Szene, Boss-Gerüst, Boss 1 |
| 7 | Neue Level für eine Welt | pro Welt wiederholt |
| 8 | Boss und Abschluss für eine Welt | pro Welt wiederholt |
Jeder Schritt startet erst mit dem Prompt des Nutzers (Regelwerk Punkt 1).

## Offene Entscheidungen
- **Level pro Welt**: Vorschlag 4 Level + Boss je Welt (bei ca. 800 Spalten je Level schon viel Spielzeit).
- **Einsortierung der 6 bestehenden Levels**: Vorschlag Dschungel = Level 1 (morgen) + Level 2 (abend),
  Ruinen = Level 3 (mittag) + Level 4 „Mondnacht“ (nacht), Höhle = Level 5, Vulkan = Level 6, Wasser = noch leer.
  Level 4–6 sind kürzer (463–520 Spalten) als die neue Regel (600–900) – bleiben so oder werden später verlängert?
- **Der Entführer**: Name und Art (Vorschlag: ein eitler, cooler Gegenspieler, z. B. ein Krähen-Bandit oder
  Waschbär-Gauner mit Sonnenbrille – passt zu süß und cool). Bosse: seine Helfer je Welt oder er selbst in Varianten?
- **Was ist das „Teil“**, das jeder Boss hält (z. B. Zahnräder einer Maschine des Professors)?
- **Weitere Welten**: Himmel (Wolken, Wind), Eis/Schnee, Fabrik (Förderbänder)?
- **Wasser-Rollen**: Wenn Haken und Schirm unter Wasser wegfallen, was macht jede Figur dort besonders? (Vorschlag:
  Affe zieht/schiebt schwere Dinge oder taucht schneller, Schweinchen treibt leichter auf und kann Luft länger halten;
  über Wasser gelten Haken und Schirm normal.)
- **Bosse**: Ablauf (Phasen, Lebensanzeige), gemeinsamer Treffer nötig?
- **Weltkarte**: frei begehbar mit den Figuren oder als Auswahl-Karte mit Pfeiltasten?
