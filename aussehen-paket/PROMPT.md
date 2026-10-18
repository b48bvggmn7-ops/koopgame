# Auftrag: neues Aussehen – Materialien und Elemente ins Spiel übernehmen (Runde 1)

Du arbeitest am Browser-Spiel „Monchichi Koop“ (Repo `koopgame`). Lies zuerst `CLAUDE.md` und halte dich an die Regeln dort (Datei-Aufbau, Tests, Doku-Pflege).

## Ziel
Das neue Aussehen wurde in einer Vorschau-Seite entworfen und Element für Element abgenommen. Übertrage **genau dieses Aussehen** ins echte Spiel. Das ist eine reine **Optik-Übernahme**: Physik, Logik, Level-Daten und Editor-Funktionen bleiben unverändert.

**Nur diese Runde:** Materialien (Boden, Wand, Gras, Outline) und die unten aufgelisteten Elemente.
**Nicht Teil dieser Runde:** alle Elemente, die unten nicht aufgeführt sind, und der Boss. Sie bleiben unverändert.

**Arbeitsweise:** Parallel arbeitet eine andere Sitzung an den Münzen in den Level-Dateien. Arbeite deshalb in einem eigenen Git-Worktree auf einem neuen Branch und fasse keine Level-Dateien (`levels/…`) an. Der rollende Fels bleibt in dieser Runde unverändert.

## Wichtigste Regel: nicht neu erfinden, übernehmen
Die Vorschau hat den Look über viele Rückfragen mit mir (Leon) festgelegt. Zeichenschritte, Farben, Größen, Zahlen und Reihenfolge sind Absicht. Bitte **nicht** „verbessern“, vereinfachen oder in eigene Worte umsetzen, sondern den Code aus diesem Paket übernehmen und nur die Anbindung ans Spiel anpassen. Wenn etwas im Spiel technisch nicht 1:1 geht, sag es mir, statt still etwas anderes zu bauen.

## Paket-Inhalt (Ordner `aussehen-paket/`)
- `basis/materialien-vorschau.js` – Boden-Körnung, Wand-Ziegel, Gras-Farben, Outline, Kachel-Aufbau (`buildChunk`, davon nur Boden-/Wand-Kacheln, Gras-Kappe und Kanten; Dekoration wie Büschel und Blumen gehört nicht dazu), bewegliche Plattformen (`pieceDraw`). **Vorschau-Code, nicht direkt einkopieren**: ins Spiel übersetzen (js/12-welt-zeichnen.js, js/10b-design-look.js), Ergebnis muss gleich aussehen.
- `elemente-neu/*.js` – die **fertigen, geänderten Element-Dateien** für `elemente/` (durchbruch, druckplatte, foerderband, haftflaeche, lava, teleporter, wechselboden), dazu je eine `.patch` mit dem Unterschied zur aktuellen Repo-Version. Das sind die ganzen Dateien, die du übernimmst. `durchbruch.js` enthält außerdem die gemeinsamen Hilfen `matTile`, `matBlock`, `grasKappe`, `bruchRisse` (werden auch von Haftfläche und Wechselboden benutzt).
- `vorschau-code/*.js` – Look von Hebel, Tür, Haken, Bröckelboden, Stacheln. Vorschau-Code, dieselbe Übersetzungs-Regel wie bei `basis/`.

Die Elemente in `elemente-neu/` setzen die Basis-Globals voraus (`wallTile`, `grain`, `SOILBASE`, `soilK`, `wallK`, `outK`, `outlineDraw`, `pieceDraw`, `EA`, `hsh`, `rnd`). Baue zuerst die Basis, dann die Elemente.

## Reihenfolge
1. Basis-Material: Boden, Wand, Gras-Kappe, Outline (so, dass alles andere darauf aufbaut).
2. Bewegliche Plattformen (gleiches Material, siehe unten).
3. Bröckelboden, Durchbruch-Wand, Wechselboden, Haftfläche.
4. Hebel, Tür, Druckplatte, Teleporter, Förderband, Lava, Stacheln.
5. Zwischen den Schritten **keine** Testläufe und kein Hochfahren von Spiel/Editor, siehe „Tests“ unten.

## Regeln, die für alle Elemente gelten
- **Material folgt der Ausrichtung:** Wand ist senkrecht (Stein), Boden ist waagerecht (Erde mit Gras obendrauf). Neue Elemente nutzen genau diese Materialien (gleiche Körnung, gleiche Gras-Kappe), sie erfinden keine eigenen.
- **Kachel 40 px**, alles sitzt genau auf dem Raster.
- **Kanten:** Gras-Kappe bzw. dunkle Innenlinie nur an **freien** Kanten, nicht zwischen zusammenhängenden Kacheln.
- **Lesbarkeit zuerst:** Haken, Hebel und Türen müssen zwischen Blumen und Gras sofort erkennbar sein.
- **Keine Zahlen und Buchstaben mehr im Spiel-Bild:** weder auf Hebel, Druckplatte, Portal noch Wechselboden. Verknüpfungen erkennt man nur über **Farbe** (Hebel, Diamant an Tür, Platte, Wechselboden, Portal). Im Editor darfst du die Nummern lassen, damit man Verknüpfungen setzen kann (so bestätigt).
- **Keine Risse und Kratzer** für „brüchig“ (wurde mehrfach ausprobiert und verworfen).
- Bei „Edelstein/Diamant“: immer **mittig** auf einer dunklen Fassung, einheitlich bei Tür, Druckplatte, Wechselboden, Portal.

## Festgelegte Materialien (Boden, Wand, Gras, Outline, Stacheln)
| Bereich | Gewählt |
|---|---|
| Gras | „Weich“. Fläche #34c46c, dunkle Kante #23a257, helle Oberkante #5fe093 |
| Erde (Boden) | „Fein“, Grundfarbe #533b2c, feine Körnung (`soilK = 'A'`) |
| Stein (Wand) | „Alt“: Ziegelwand in warmem Braun-Orange (`wallK = 'B'`) |
| Outline | „Weich“ (`outK = 'A'`): dünne, dunkle Innenlinie an Kanten. **Kein** Schatten. Gilt auch für bewegliche Plattformen (kein Restschatten beim Neuzeichnen: Zeichenfläche vorher leeren) |
| Stacheln | „Stahl“: dick, rund, verdreht wie Stacheldraht im Gefängnis. Alle anderen Varianten verworfen |

## Boden und Wand: eine zusammenhängende Schicht
Setze ich im Editor viele Boden- oder Wand-Kacheln neben- und übereinander, muss daraus **eine durchgehende Fläche** werden, keine Einzelteile:
- Keine Fugen, Linien, Flecken oder Rahmen zwischen zusammenhängenden Kacheln. Körnung (Boden) bzw. Ziegelmuster (Wand) laufen über die Kachelgrenzen hinweg durch.
- Gras-Kappe nur oben auf freien Oberkanten, die dünne Außenlinie (Outline) nur rund um die **Gesamtform**, nicht um einzelne Kacheln. Das gilt auch für Treppen, L-Formen und Löcher in der Fläche.
- Das ist in `buildChunk` (Vorschau) bereits so gelöst: die Kacheln werden zu einer gemeinsamen Form zusammengefasst. Genau so übernehmen, nicht pro Kachel zeichnen.
- Dasselbe gilt für Wechselboden, Förderband und Haftfläche (eine zusammenhängende Reihe/Fläche = ein Stück, siehe Elemente).

## Entscheidungen je Element
- **Haken, Sprungpilz, Checkpoint, Münzen:** Aussehen bleibt wie im Spiel (inkl. Schein). Haken: dunkle Unterlage plus Cyan-Leuchten.
- **Hebel:** Look wie im Spiel, aber **ohne Zahl/Buchstabe** auf der Plakette; nur Farbe plus kleiner Glanzpunkt. Die Tasten-Blase (J / Num 2 / ○) bleibt.
- **Tür:** Zusammenhängende Türen werden **eine** Tür (auch lang/dick/einzelner Block). Kein farbiger Rahmen; **ein** Diamant pro Tür zeigt, welcher Hebel dazu gehört. Farben klar unterscheidbar.
- **Bröckelboden:** Nur Boden, nie Wand. Erde wie der normale Boden, aber mit trockenem **hellbraunem** Gras obendrauf. Brüchigkeit durch Klumpen und Kiesel. Unterkante glatt (keine Krümel, die herunterhängen). Wenn die Steine weg sind: komplett unsichtbar, keine Uhr, kein Balken.
- **Durchbruch-Wand:** Entwurf 2 „Feucht“ (steckt in `durchbruch.js`): Wandmaterial senkrecht, braun-grün angelaufen, Moos an den Fugen, einzelne Ziegel stehen vor, dunkle Tropfspuren, kleine Glanzpunkte. Nicht zu dunkel. **Keine Löcher, keine Risse.** Pro Kachel einmal gezeichnet und zwischengespeichert. Beim Nachwachsen füllt sich ein blasser Block.
- **Wechselboden:** Waagerecht = normaler Boden mit Gras, senkrecht = normale Wand. Eine zusammenhängende Reihe ist **ein** Block ohne Nahtstellen (wie bewegliche Plattformen gezeichnet, einmal zwischengespeichert). Ist er „weg“: nur ein leichter, weicher Schatten (kein Blinken, keine Uhr). Ist er „da“: bei Takt-Böden ein Balken über die **ganze Breite** der Reihe (senkrecht: ganze Höhe), der schrumpft, bis der Boden verschwindet. Diamant mittig auf dunkler Platte wie bei der Tür; Gruppe A = voller Diamant, Gruppe B = Diamant mit dunklem Kern. Die A/B-Anzeige am Hebel entfällt. Der Balken gilt **nur** für Takt-Böden. Hebel-gesteuerte Wechselböden bekommen **keinen** Balken, sie wechseln ja nur per Hebel und haben nichts, was ablaufen könnte (Entscheidung von Leon, genau so steht es in `wechselboden.js`).
- **Haftfläche:** Normales Boden- oder Wandmaterial, mit Honig übergossen: welliger Rand, Glanzlichter, unten langsam tropfend.
- **Druckplatte:** Auf dem Boden (nicht eingelassen). Eisenrahmen mit Messingplatte, dunkle Fassung, **ein** Diamant in der Link-Farbe in der Mitte, keine Zahl. Sinkt beim Betreten ein.
- **Teleporter/Portale:** Keine Zahl, keine Buchstaben, kein Punkt oben. Ein Paar erkennt man nur an der Farbe; unten am Portal sitzt ein Diamant in der Paar-Farbe. „Nur Affe / nur Schweinchen“ zeigt nur noch die Innenfarbe.
- **Förderband:** Zusammenhängende Kästchen = **ein** Band ohne Nähte. Holzkörper mit Nieten, oben ein Lederband mit breiten weichen goldenen Pfeilen, die in Laufrichtung wandern (Stillstand: blass grau). Rollen nur an den beiden Enden des Bandes.
- **Lava:** Keine dunklen „Eier“, keine Schlieren, keine aufsteigenden Blasen, keine gestrichelte Steige-Linie (`lavaMarkenZeichnen` leer lassen). Ruhiges Hitzeflimmern über der Oberfläche, warmer Glut-Schein, an der Oberfläche kleine Blasen, die sich aufwölben, platzen und Tropfen hochschleudern.
- **Leuchtkristall:** bleibt wie im Spiel (gilt als Licht-Element).

## Leistung (wichtig für dich, nicht für den Look)
Aufwendige Zeichnungen (Honig, Wechselboden, Durchbruch-Wand, Förderband, Bröckelboden) werden in der Vorschau **einmal in ein kleines Bild gezeichnet und danach nur noch als Bild gezeigt** (Zwischenspeicher). Diese Zwischenspeicherung beim Übernehmen **nicht entfernen**, auch nicht „zur Vereinfachung“. Neu zeichnen nur, wenn sich Material, Outline oder Größe ändern. Das Hitzeflimmern der Lava ist ein Bildeffekt, der nur schon gezeichnete Pixel verschiebt, und soll auf schwachen Geräten abschaltbar sein. Das Spiel muss weiter flüssig laufen und gut aussehen; darum kümmerst du dich.

## Tests (wichtig)
Ein vollständiger Testlauf dauert ca. 5 Stunden. **Nicht nach jedem Schritt** starten und nicht zwischendurch. Zwischendurch nur das Nötigste (z. B. kurz prüfen, dass die geänderte Datei fehlerfrei lädt). **Ganz am Ende einmal**: Spiel und Editor starten, kompletten Testlauf, Ergebnis melden.

## Abnahme (bitte abhaken und mir melden)
- [ ] Basis: Boden (fein), Wand (alt), Gras (weich), Outline (weich) wie Vorschau
- [ ] Bewegliche Plattformen: gleiches Material, kein Restschatten
- [ ] Bröckelboden
- [ ] Durchbruch-Wand (Entwurf 2)
- [ ] Wechselboden (waagerecht und senkrecht, Balken, Schatten, Diamant)
- [ ] Haftfläche (Honig)
- [ ] Hebel ohne Zahl
- [ ] Tür (ein Diamant, zusammenhängend = eine Tür)
- [ ] Druckplatte
- [ ] Teleporter
- [ ] Förderband
- [ ] Lava
- [ ] Stacheln (Stahl)
- [ ] Alle nicht aufgeführten Elemente laufen unverändert, Doku (FEATURES/CLAUDE) aktualisiert
- [ ] Am Ende einmal: Spiel und Editor starten, kompletten Testlauf, alles grün

## Rückmeldung am Ende
Kurz und in einfachem Deutsch (ich bin kein Programmierer): was übernommen ist, was **nicht 1:1** ging und warum, was ich im Spiel selbst anschauen soll. Bitte zu jedem Element sagen, in welchem Level ich es sehen kann.
