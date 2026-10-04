# Funktionsliste – Monchichi Koop

Diese Liste beschreibt ALLES, was Spiel und Editor können. Vor jeder Änderung prüfen, dass nichts davon
verloren geht; nach jeder Verhaltensänderung hier ergänzen. Nichts entfernen ohne Rückfrage beim Nutzer.

## Spiel (index.html + js/)
```
  - Immer neueste Dateien: index.html lädt alle js/-Dateien mit ?v=<Zeit>, der Editor seine editor.js ebenso
    (kein Strg+F5 mehr nötig, nachdem eine Änderung online ist)
  MONCHICHI KOOP – SPIEL – FUNKTIONSLISTE
  - Figuren: süßer Affe (eigene Zeichnung, ersetzt Kenney-Affe) und pinkes Schweinchen, beide mit Zwinker-Bild
    (monkeyBlink/pigBlink, alle ~3-5 s kurz); Schatten nur wenn am Boden
  - Spieler 1 (♂): A/D, Leertaste springen/Wandsprung, G Haken, W ranziehen, S Seil geben (H/J fürs Seil entfallen;
    Controller: Steuerkreuz/Stick hoch = ranziehen, runter = Seil geben; R/L-Tasten fürs Seil entfallen)
  - Seil ist elastisch: streift man beim Schwingen eine Wand, löst es NICHT, die Figur wird aufgehalten/rutscht
    entlang; hängt sie fest, dehnt sich das Seil (dünner, orange-rot, zittert, zieht zurück). Es REISST NIE
    (bei >70 px Dehnung gibt es Seil nach). Gelöst wird es per G, Springen oder wenn man am Seil auf etwas LANDET
    (Boden, Wand-Oberseite, Bröckelboden, bewegter Boden …). Vom Boden aus eingehakt bleibt es dran
    (ropeWasAirborne), damit man sich mit W / Hoch hochziehen kann. Ranziehen langsamer (ROPE_PULL_SPEED 2,4)
    und ohne Schwung Richtung Haken (kein Hüpfen oben); runterlassen bis zum Rand des Reichweiten-Rings (ropeMax).
  - Schwung holen am Haken wie beim Schaukeln (SWING_PUSH 0,2): die Laufen-Taste schiebt nur, wenn man in die
    Richtung drückt, in die der Affe gerade schwingt (oder er fast stillhängt). Taste nur halten drückt ihn nicht
    mehr sofort weit zur Seite (0,5 s halten: früher ~45°, jetzt ~26°); im Takt rechts/links baut schnell Schwung auf.
  - Spielerin 2 (♀, pinkes Schweinchen – eigenes Sprite im Kenney-Round-Stil, Asset "pig"): Pfeil links/rechts, Nummernblock-0 springen/Wandsprung (normale 0 geht auch),
    Nummernblock-1 in der Luft halten = Segelschirm (eigene Taste, normale 1 geht auch) (klappt weich auf, schwingt, sie hängt aufrecht); Start aus Editor (startF)
  - Spielerin 2 kann NICHT eingehakt werden (bewusst entfernt, Nutzerwunsch) – G greift nur Haken
  - KEIN ZOOM (Nutzerentscheidung: Spielfeld bleibt immer 16:9 gleich groß, Ziel Vollbild; Zoom nach oben/
    nur seitlich verworfen). Kamera: hintere Figur ~300 px vom linken Rand, vordere höchstens bei 75 % der
    Bildbreite (FRONT_MAX). Passen beide nicht ins Bild, folgt die Kamera der VORDEREN Figur (Abstand max.
    1,25 Bildschirmbreiten = hintere höchstens einen halben Bildschirm außerhalb, keepTogether/MAX_SEPARATION); die hintere erscheint als Pfeil mit
    Gesicht + Abstand in Kästchen am linken Rand.
    Sichtbare Weltbreite = VW (für Ausschnitt-/Sichtbarkeitsprüfungen VW statt W benutzen!)
  - Gemeinsame Kamera schaut nach vorn: hintere Figur ~300 px vom linken Rand, vordere mind. 70 px vom rechten
    (CAM_LEFT/CAM_RIGHT) -> man sieht möglichst viel vom Weg; max. Abstand ~1 Bildschirmbreite; Ziel erst geschafft, wenn BEIDE da sind
  - Controller (Gamepad-API, Standard-Belegung): Controller 1 = Affe, Controller 2 = Schweinchen, parallel zur Tastatur;
    Stick/Steuerkreuz laufen, Kreuz springen, Viereck = Haken bzw. Schirm, Kreis = Hebel, hoch = ranziehen, runter = Seil geben,
    Options = Pausenmenü (darin „Level neu starten“; früher direkt Neustart); Status "Controller verbunden" in den Steuerungs-Kästen
  - Flüssigkeit: Kamera wird auf ganze Pixel gerundet (camPos weich, camX gerundet), Figuren und bewegte Teile
    ebenfalls -> kein Zittern gegeneinander; kein backdrop-filter über dem Spielbild (kostet GPU jedes Bild)
  - Dschungel-Hintergrund (js/11-hintergrund.js, ersetzt die früheren Hügel – Nutzerwunsch „mehr Dschungel“):
    dunstiges Morgenlicht mit Sonne, weich ziehende Wolken, ferne Felstürme im Nebel, Regenwald-Kronen mit
    Felswand und animiertem Wasserfall (fallende Streifen + Gischt), hohe Bäume mit Schirmkronen, Palmen und
    Lianen, Unterholz, nahe große Blätter und Farne; ab und zu zieht ein ferner Vogelschwarm vorbei.
    Parallax (weit weg = langsamer, heller, unschärfer), alles dunstig und heller als die Spielelemente;
    vorgezeichnet (billig pro Bild). Seitenrand der Seite dunkelgrün.
  - Figuren mit mehr Leben (js/21-figuren-leben.js, nur Anzeige): Strecken beim Absprung, Stauchen beim Landen (je nach
    Fallhöhe, an den Füßen verankert), sanftes Atmen im Stehen, Staubwölkchen bei Landung/Sprung/Wandsprung.
    Entdeckung: stehen Affe und Schweinchen ~1,5 s dicht beieinander, steigen Herzchen auf (mit leisem Ton).
  - Süße Tiere & Entdeckungen (js/20-tiere.js, reine Deko): Schmetterlinge (flattern, weichen aus), Frösche (atmen,
    quaken ab und zu, hüpfen weg wenn man kommt), Schnecken (kriechen, ziehen sich ins Haus zurück), Pilze (federn +
    „boing“ beim Drüberlaufen), Blumenknospen (gehen beim Vorbeikommen mit Glitzer + Ton auf), selten: schlafendes
    Faultier unter schwebendem Boden (Zzz, wacht auf und winkt, Entdecker-Glitzer-Ton) und EIN goldener Schmetterling
    pro Level (Entdecker-Ton). Verteilung fest je Level (nicht auf Münzen/Stacheln/Hebeln/Checkpoints/Ziel/Start).
  - Wetter & Stimmung (js/19-wetter.js, reine Deko): wärmerer Himmel (goldenes Licht am Horizont, kräftigere Sonne
    mit sich langsam drehenden Strahlen), immer leichter warmer Schimmer + weiche Vignette. Ablauf: Sonne 70–120 s ->
    zieht zu (7 s) -> Regenschauer 30–45 s -> klart auf (7 s) mit Regenbogen (~22 s) -> Sonne … Regen: schräge Tropfen
    vor der Welt, Spritzer auf allen Oberseiten, Hintergrund dunkler/kühler (Spielfeld bleibt hell). Regen-Klang (ASMR,
    wie auf schrägem Metalldach/Dachfenster): vorab im Hintergrund in kleinen Häppchen berechnete Stereo-Schleifen aus
    tausenden Einzeltropfen – warmes rosa Rauschen als Bett, dichtes Prasseln (winzige Einschläge links/rechts verteilt),
    gläserne „tick“-Tropfen, metallische „ping/plonk“-Tropfen mit Nachklang; live dazu satte „Plopps“ aus der Dachrinne;
    bei leichtem Regen nur vereinzelte Tropfen. Bei Sonne ab und zu Vogelgezwitscher.
    Zum Testen in der Konsole: weatherForce('rain') / weatherForce('sun').
  - Dschungel-Deko in der Welt (js/17-deko.js, reine Deko ohne Kollision): Farne, Gras, rote Helikonien,
    rosa Blümchen, große Blätter auf freien Boden-Oberseiten (wiegen sich, weichen Figuren aus), Moos auf
    Wand-Oberseiten und Ranken an Wandseiten; NIE auf/an Münzen, Stacheln, Hebeln, Checkpoints, Ziel, Türen,
    Bröckelboden, bewegtem Boden. Bunte Vögel (blau/rot/gelb/grün) sitzen auf dem Boden, picken/hüpfen und
    flattern mit leisem Zwitschern weg, wenn eine Figur näher als 170 px kommt (BIRD_SCARE_DIST); nach ~9 s
    kommen sie zurück, wenn niemand in der Nähe ist. Nicht in der Nähe des Starts, mind. 520 px Abstand.
  - Fester Spieltakt: Physik immer 60 Schritte/s (Akkumulator in loop/stepSim), Anzeige dazwischen interpoliert
    (drawInterpolated: Figuren, bewegter Boden, bewegte Haken) -> auf 120/144-Hz-Bildschirmen NICHT schneller;
    Kamera-Nachziehen und Lichtpartikel ebenfalls zeitbasiert
  - Leistungs-Anzeige unten rechts (Taste F ein/aus): Bilder/Sek., Ruckler, Arbeitszeit pro Bild (Logik/Zeichnen)
    und Einschätzung: Problem im Spiel-Code vs. Rechner/Browser liefert zu wenig Bilder vs. >70-Hz-Bildschirm
  - Schalter = kleiner HEBEL, mit Taste betätigen (nicht mehr drauftreten): Spieler 1 J / Controller Kreis,
    Spielerin 2 Num 2 (normale 2 geht auch) / Controller Kreis; Reichweite ~60 px; Figur lehnt sich animiert zum
    Hebel, Hebel kippt von links nach rechts (bleibt rechts, solange das Gesteuerte aktiv ist), "Klack"-Ton;
    Tasten-Hinweis (J / Num 2 / ○) über dem Hebel, wenn jemand davor steht. J ist zusätzlich "Seil geben" am Haken.
  - Schalter-Zuordnung sichtbar: Nummern 1–20 mit je eigener Farbe (LINK_COLORS, ab 21 automatisch); Hebel-Kugel, Tür-Rahmen und Plaketten an
    Türen/bewegtem Boden/bewegten Haken in derselben Farbe + Nummer. Verbindungslinien bewusst ENTFERNT (Nutzerwunsch).
  - Hebel = Ein/Aus-Schalter je Nummer (linkOn): 1. Betätigen ein (Türen auf, schaltergesteuerter Boden/Wand/Haken
    fahren los), 2. Betätigen aus (Türen schließen – erst sobald niemand darin steht –, Bewegungen bleiben genau
    dort stehen), 3. Betätigen wieder ein (fahren von dort weiter). Hebel steht rechts, solange ein. Tod/Neustart:
    alles aus (Türen zu, Bewegungen am Start).
  - Tür-Aussehen (drawDoor): Holztor aus 3 Brettern mit Eisenbändern, Nieten, Spitzen unten und Edelstein in der
    Hebel-Farbe; Rahmen in Hebel-Farbe bleibt auch offen sichtbar; Tor gleitet beim Öffnen/Schließen nach oben/unten
  - Hebel auf bewegtem Boden fahren mit (Hebel-Kästchen direkt über dem Stück; syncSwitchCarriers) und lassen
    sich unterwegs betätigen; bei Tod/Neustart zurück an den Start. Hebel auf festem Boden bleiben stehen.
  - Bewegter Boden zeigt seinen Fahrweg: gepunktete Schiene, Endpunkte, gestrichelter Umriss an Start und Ziel
  - Stacheln-Aussehen (SPIKE_SPRITE): 4 glänzende Metallkegel mit Glanz und rötlicher Spitze auf einer Eisenleiste
    mit Nieten, leichter Schatten; gedreht je Richtung
  - Stacheln können in 4 Richtungen zeigen (spike.dir 0=oben,1=rechts,2=unten,3=links; Treffer = ganzes Kästchen)
  - Schalter, bewegter Boden, Stacheln, Checkpoints gelten für beide Spieler
  - Münzfarben (coin.color): blau = nur Affe, pink = nur Schweinchen, gold = beide; falsche Figur -> Münze wackelt;
    Effekte (Ring/Funken) in Münzfarbe; Münz-Kasten zeigt zusätzlich "● Affe a/b  ● Schwein a/b"
  - Geräusche (js/18-sound.js, alle im Browser erzeugt): weiches „Hupp“ beim Springen (Schweinchen höher), Klopfer +
    höheres Hupp beim Wandsprung, dumpfes Aufsetzen beim Landen (je schneller, desto kräftiger), leises Gras-Rascheln
    beim Laufen, metallisches „Tink“ beim Einhaken, Wusch beim Loslassen, „Fwump“ beim Schirm, Holz-Klack am Hebel
    (ein höher, aus tiefer), schabendes Holztor + Klong, Knirschen/Zerbröseln beim Bröckelboden, „Plopp“ + traurig
    abwärts gleitendes Pfeifen beim Sterben. Ein Beobachter (sfxObserve) erkennt die Ereignisse an Zustandsänderungen
    und ändert nichts am Spiel. Taste M = Ton aus/an (gemerkt), auch im Pausenmenü („🔊 Ton ist an …“).
  - Münzen-Aussehen (drawCoin3D): etwas größer (Radius 12,5 statt 11, nur Zeichnung – Einsammel-Bereich
    unverändert), 3D: sichtbare Kante beim Drehen, Lichtverlauf, geprägter Innenring mit Stern, Glanzlicht;
    dunkler Umriss, weicher Schein in Münzfarbe und leichter Schatten -> heben sich vom Dschungel ab
  - Münzen (data.coins [{x,y}] aus dem Editor): beide sammeln gemeinsam, Zähler als Kästchen oben mittig (HTML-HUD); Ziel zählt erst
    mit 10 Münzen (oder allen, wenn weniger im Level); am Ziel Hinweis "Noch X Münzen!"; beim Sterben bleiben
    gesammelte Münzen, bei Neustart (R) sind alle wieder da; Aufsammel-Effekt: Münze schnellt hoch/dreht/verpufft,
    Funkelsterne, Lichtring, "+1", Zähler hüpft, kleiner "Bling"-Ton (WebAudio), schnelle Folge = jeweils höherer Ton
  - Bewegte Haken (hook.targetX/targetY/speed/switchLink aus dem Editor): pendeln wie bewegter Boden,
    optional per Schalter gestartet, dann dauerhaft (ohne Schalter: erst ab Sichtbarkeit, s. activateVisibleMovers); gepunktete Schiene zeigt den Weg; Seil zieht Spieler 1 mit
  - Sprint (länger halten = schneller), Wandsprung nur mit Schwung UND Richtungstaste von der Wand weg
    (Streichen wurde getestet: zu einfach -> wieder aktiv), skaliert mit Tempo; pro Wandseite nur
    einmal (lastWallJumpSide, Reset bei Bodenkontakt) -> keine Einzelwand-Kletterei, Kamin-Klettern geht;
    Zeitfenster für den Wandsprung 180 ms nach letztem Wandkontakt (Tastatur) bzw. 250 ms, wenn per Controller gesprungen;
    Controller zusätzlich: zuletzt berührte Wandseite zählt auch nach dem Loslösen (lastWallSide), und ✕ darf bis
    150 ms vor dem Stick-Umlenken kommen (wjPendingUntil). Tastatur bewusst unverändert.
  - Haken mit eigenem Radius pro Haken (Standard 260px), Reichweiten-Kreis grau/blau, greift nicht durch Wände
  - Bröckelboden-Aussehen (drawCrumbleBlocks): lose, sandfarbene Steinbrocken (2 pro Kästchen) mit dunklen Fugen,
    trockenes Moos oben, hängende Krümel unten, ab und zu rieselt Sand -> klar anders als normaler Boden;
    Brocken beim Zerspringen in denselben Farben
  - Bröckelboden (0,6 s, zerfällt in Fragmente; Animation: zittert immer stärker, Risse wachsen, Krümel rieseln,
    pulsiert rot; zerspringt in unregelmäßige Brocken mit Gras + Steinchen + Staubwolke, ~0,75 s sichtbar), Schalter+Tür (Tür bleibt offen, bis der Hebel nochmal betätigt wird – früher 5 s offen, Nutzerwunsch geändert), Stacheln (zurück zum Checkpoint)
  - Tür-Koordinaten aus dem Editor = Mittelpunkt des Kästchens (wird beim Laden in obere linke Ecke umgerechnet)
  - Bewegliche Stücke (movingPlatforms, look=ground/wall/platform, group, speed), pendeln, nehmen Spieler mit;
    Textur fährt mit dem Stück mit (am Stück verankert), kein Extra-Rand;
    optional switchLink: gibt es einen Schalter mit der Nummer, startet das Betreten des Schalters die Bewegung,
    danach pendelt es dauerhaft; ohne Schalter fährt es erst los, wenn sein Fahrweg ins Bild kommt
    (activateVisibleMovers, 40 px Vorlauf), dann dauerhaft; mehrteiliger Boden startet gemeinsam
  - Stirbt jemand (Stacheln/runtergefallen): ALLE bewegten Böden und Haken springen an ihren Start zurück (beim Weitermachen);
    ohne Schalter fahren sie sofort wieder los, mit Schalter warten sie auf erneutes Betätigen
  - Kollision (collideAxis): Überlappungen < 0,01 px (Rundungsfehler) ignoriert; seitliches Herausschieben um mehr
    als die Figurbreite bei nur knapper Höhen-Überlappung wird stattdessen senkrecht gelöst -> kein "Teleport" ans
    Ende eines Decken-/Bodenstreifens mehr (trat z. B. bei Decken-Unterkante 480 auf, Figur 32,3 px hoch)
  - Wand wird als Mauerwerk direkt gezeichnet (drawWallPiece): Steinquader 40x20 im Versatz, Fugen an der Welt
    ausgerichtet -> nahtlos über angrenzende Wandstücke, senkrecht/waagerecht/flächig; heller Rand oben, Schatten
    unten, runde Ecken nur an echten Enden (Nachbarn via computeGroundNeighbors, Familie 'w'/'mw')
  - Boden & Bröckelboden werden direkt gezeichnet (keine abgeschnittenen Textur-Streifen mehr): Gras mit Welle,
    runde Ecken nur an echten Enden, nahtlos zu Nachbarn (computeGroundNeighbors)
  - Test-Hilfe: Taste C = zum nächsten Checkpoint springen, X = zum vorherigen/Start (auch ungeschafft);
    Hinweis "Test: Checkpoint n von m" im Bild. Bewusst OHNE neue HTML-Elemente.
  - (Artifact-Zeit) Das Spiel startete in der Artifact-Ansicht nicht, wenn der Kommentar VOR <html> > ~8 KB war.
    Im GitHub-Projekt nicht mehr relevant, Bilder liegen jetzt als Dateien in assets/.
  - Checkpoints aus dem Editor (data.checkpoints [{x,y}]): zählen erst, wenn BEIDE vorbei sind (Punkte am Mast
    zeigen, wer schon durch ist) -> Fahne geht hoch + Funken + kleine Fanfare. Automatische Pro-Figur-Checkpoints
    entfernt. Ohne erreichten Checkpoint = Start.
  - Tod (Stacheln/Absturz): Spiel pausiert, Figur verpufft; NUR MANCHMAL (~1/3, spätestens nach 3 stillen Toden)
    schüttelt die andere genervt den Kopf mit Sprechblase (zufälliger Spruch: "Idiot!", "Einmal mit Profis…",
    "Arschloch!" …), dann "Beliebige Taste drücken" (Tastatur, Maus, JEDE Controller-Taste inkl. Options oder
    Stick kräftig bewegen, ab 0,6 s) -> BEIDE starten am letzten gemeinsamen Checkpoint; Bröckelboden/Türen/
    bewegte Teile zurückgesetzt, Münzen bleiben. Freie Stelle wird per nudgeFree gesichert.
  - Decken-Begrenzung, Kenney-Tiles
  - "Level laden (JSON)": liest Editor-Export (Spiel-Format) oder altes Editor-Rohformat (bleibt als Notlösung;
    auch im Hauptmenü als „Level-Datei laden (Notlösung)“; Laden schließt das Menü)
  - Hauptmenü beim Start (js/16-menue.js): Titel, „Spielen“ → Levelauswahl, „Level-Editor“ (öffnet editor/).
    Levelauswahl zeigt nur „Levels“ (levels/levels.json, Dateien im Spiel-Format aus levels/). Die frühere
    Gruppe „Meine Levels“ (im Browser gespeicherte Editor-Levels) ist auf Nutzerwunsch entfernt (irritierend).
    Projekt-Levels nur, wenn das Spiel über die Webseite läuft.
    Solange ein Menü offen ist, steht das Spiel still und bekommt keine Tastendrücke.
    Bedienung: ↑/↓ bzw. W/S, Enter/Leertaste/Num 0 bestätigen, Esc/Backspace zurück; Controller: Steuerkreuz/
    Stick, ✕ bestätigen, ○ zurück; Maus geht auch.
  - Pausenmenü: Esc bzw. Options im Spiel (nicht auf dem Tod-Bildschirm, dort macht jede Taste wie bisher weiter):
    „Weiterspielen“, „Level neu starten“, „Zurück zum Menü“; Esc/Options/○ schließt die Pause wieder
    Zusätzlich Knopf „☰ Menü (Esc)“ unten links im Spiel (öffnet dasselbe Pausenmenü)
```

## Level-Editor (editor/)
```
  MONCHICHI LEVEL-EDITOR – FUNKTIONSLISTE
  - Werkzeuge: Boden, Wand, Bröckelboden, Stacheln, Haken (mit Radius in Kästchen),
    Checkpoint ⚐ (zählt, wenn beide vorbei sind; Export sortiert nach x, Fußpunkt wie Start),
    Stacheln in 4 Richtungen (Auswahl „Spitzen“ ▲▶▼◀; Klick auf vorhandene Stacheln dreht um 90°; Export dir 0-3),
    Münzen in 3 Farben (Auswahl „Farbe“: Blau = nur Affe, Pink = nur Schweinchen, Gold = beide; Klick auf
    vorhandene Münze wechselt die Farbe; Zähler in der Seitenleiste zeigt Blau/Pink/Gold + ob Blau = Pink;
    Export coin.color; gemeinsam 10 sammeln, sonst alle), Schalter + Tür (Verknüpfungs-Nummer 1–20; im Spiel ein Hebel, per Taste), Bewegung ➜ (zusammenhängendes Stück pendelt, Tempo wählbar,
    optional „per Schalter“ 1–20 → Schalter startet die Bewegung, danach dauerhaft; bei Tod zurück an Start; auch mit Haken:
    Bewegung vom Haken aus ziehen → Haken pendelt, Daten in hook.move {dc,dr,speed,link}),
    Bewegung nachträglich bearbeiten: Klick (ohne Ziehen) mit „Bewegung“ auf ein bewegtes Stück/einen bewegten Haken
    WÄHLT es aus (gelb umrandet; früher: Klick = Pfeil löschen). Tempo und „per Schalter“ zeigen dann dessen Werte,
    Änderungen gelten sofort; Ziehen = neues Ziel; „✕ Bewegung entfernen“ bzw. Entf/Backspace entfernt; Esc/Klick ins
    Leere/anderes Werkzeug hebt die Auswahl auf.
    Vergebene Verknüpfungs-Nummern: in „Verknüpfung“ und „per Schalter“ steht hinter benutzten Nummern „✓“ + wofür
    (Schalter, Tür, Bewegung, Haken) – trotzdem weiter wählbar.
    Start ♂, Start ♀, Ziel, Radieren
  - Rechtsklick (auch ziehen) = Radierer, unabhängig vom Werkzeug
  - Haken-Werkzeug auf bestehenden Haken = Radius übernehmen; Reichweiten-Kreis wird angezeigt
  - Level wächst nach rechts automatisch mit, „+20 Spalten“-Button, Mausrad scrollt seitlich
  - Bestätigungen (Löschen, Alles löschen, Neues Level, Laden/Überschreiben bei ungespeicherten Änderungen) per
    2. Klick direkt am Button (armConfirm) bzw. 2. Speichern – KEIN confirm()/alert(): ist im Artifact blockiert!
  - Levels speichern/laden/löschen mit Namen (Artifact-Datenbank, Collection "levels"), Strg+S
  - Arbeitsstand-Autosave im Browser (localStorage)
  - Plattform-Werkzeug bewusst entfernt (Nutzerwunsch, Boden reicht); alte Plattform-Kacheln in
    gespeicherten Levels werden weiter angezeigt/exportiert und lassen sich radieren
  - Export im Spiel-Format (Textfeld kopieren oder als .json-Datei speichern)
  - Taste Enter im Editor = „▶ Testen“ (nicht beim Tippen in ein Feld, nicht bei offenem Levels-/Export-Fenster)
  - Knopf „▶ Testen“ (gelb, oben): legt das aktuelle Level im Browser ab (localStorage monchichi_test_level,
    Spiel-Format) und öffnet sofort das Spiel damit (index.html?test=1, ohne Hauptmenü, ohne Speichern/Hochladen).
    Beide Figuren starten dort, wo man im Editor gerade baut (sichtbarer Ausschnitt, ~1/3 von links; freies Kästchen
    über festem Boden/Wand, nicht Bröckelboden/bewegt/Stacheln, unterste Ebene; Spielerin 2 daneben); das gilt auch
    als Start nach dem Sterben. Ist der Editor ganz links, normaler Start. Kamera startet gleich dort.
    Esc beendet den Test sofort (ohne Pausenmenü, auch auf dem Tod-Bildschirm) und führt zurück in den Editor –
    genau an die Stelle, an der „Testen“ geklickt wurde (editor/index.html?from=test, localStorage
    monchichi_editor_scroll). Options/☰ öffnen im Test das Pausenmenü mit „✏️ Zurück zum Editor (Esc)“. Fürs schnelle Ausprobieren;
    für alle sichtbar wird ein Level weiterhin erst über das Projekt (levels/).
  - ✕ oben rechts schließt den Editor und führt zurück zum Spiel (Hauptmenü); Arbeitsstand bleibt im Browser
  - Fenster „Levels“ zeigt zusätzlich „Levels im Projekt“ (aus levels/levels.json) und lädt sie per „Laden“
    aus levels/editor-format/ (nur wenn der Editor über die Webseite geöffnet ist, nicht als lokale Datei)
  - Button „📦 Ins Projekt aufnehmen“ (im Fenster „Levels“): lädt das aktuelle Level als zwei Dateien herunter –
    <name>.json (Spiel-Format, gehört nach levels/) und <name>.editor.json (Editor-Format, gehört nach
    levels/editor-format/ als <name>.json); Eintrag in levels/levels.json bleibt Handarbeit
```
