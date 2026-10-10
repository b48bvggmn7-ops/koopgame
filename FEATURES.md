# Funktionsliste – Monchichi Koop

Diese Liste beschreibt ALLES, was Spiel und Editor können. Vor jeder Änderung prüfen, dass nichts davon
verloren geht; nach jeder Verhaltensänderung hier ergänzen. Nichts entfernen ohne Rückfrage beim Nutzer.

## Spiel (index.html + js/)
```
  - Immer neueste Dateien: index.html lädt alle js/-Dateien mit ?v=<Zeit>, der Editor seine editor.js ebenso
    (kein Strg+F5 mehr nötig, nachdem eine Änderung online ist)
  MONCHICHI KOOP – SPIEL – FUNKTIONSLISTE
  - Figuren: süßer Affe (eigene Zeichnung, ersetzt Kenney-Affe) und pinkes Schweinchen, beide mit Zwinker-Bild
    (monkeyBlink/pigBlink, alle ~3-5 s kurz). Bild immer im echten Seitenverhältnis (nicht verzerrt); gedreht wird
    genau um die Mitte des runden Kopfes (HEAD_CENTER, Ohren zählen nicht), damit die Kugel rund rollt statt zu eiern.
    Weicher, natürlicher Schatten auf dem Boden darunter (verlaufend), auch im Sprung: je höher, desto kleiner und blasser.
  - Scharfes Bild: die Leinwand wird in der echten Bildschirmauflösung gezeichnet (CSS-Größe × Pixeldichte, höchstens
    2560 Pixel breit; Spiel-Koordinaten bleiben 1280×720, Skalierung RS in 00-setup.js) statt 1280×720 hochzuskalieren
    – Level und Figuren wirken dadurch glatt statt verpixelt/verschwommen; passt sich beim Vollbild/Fenstergröße an.
  - Spieler 1 (♂): A/D, Leertaste springen/Wandsprung, G Haken, W ranziehen, S Seil geben (H/J fürs Seil entfallen;
    Controller: Steuerkreuz/Stick hoch = ranziehen, runter = Seil geben; R/L-Tasten fürs Seil entfallen)
  - Seil ist elastisch: streift man beim Schwingen eine Wand, löst es NICHT, die Figur wird aufgehalten/rutscht
    entlang; hängt sie fest, dehnt sich das Seil (dünner, orange-rot, zittert, zieht zurück). Es REISST NIE
    (bei >70 px Dehnung gibt es Seil nach). Gelöst wird es per G, Springen oder wenn man am Seil auf etwas LANDET
    (Boden, Wand-Oberseite, Bröckelboden, bewegter Boden …). Vom Boden aus eingehakt bleibt es dran
    (ropeWasAirborne), damit man sich mit W / Hoch hochziehen kann. Ranziehen langsamer (ROPE_PULL_SPEED 2,4)
    und ohne Schwung Richtung Haken (kein Hüpfen oben); runterlassen bis zum Rand des Reichweiten-Rings (ropeMax).
  - Abflug vom Seil (Springen oder G): Abfluggeschwindigkeit = Schwunggeschwindigkeit, KEIN künstlicher Schub
    (Nutzerwunsch: muss sich natürlich anfühlen; ein kurz eingebauter Extra-Schub/Mindest-Absprung wurde wieder entfernt).
    Springen gibt nur den kleinen Hub nach oben (HOOK_RELEASE_BOOST). Der Schwung wird danach nicht mehr gekappt/stark
    gebremst (bis ROPE_FLING_MAX 15, ohne Taste nur ROPE_FLING_DRAG 0,993 statt 0,94); Taste halten macht nicht schneller
    als normal; endet beim Landen oder an einer Wand.
  - Schwung holen am Haken wie beim Schaukeln (SWING_PUSH 0,2): die Laufen-Taste schiebt nur, wenn man in die
    Richtung drückt, in die der Affe gerade schwingt (oder er fast stillhängt). Taste nur halten drückt ihn nicht
    mehr sofort weit zur Seite (0,5 s halten: früher ~45°, jetzt ~26°); im Takt rechts/links baut schnell Schwung auf.
  - Spielerin 2 (♀, pinkes Schweinchen – eigenes Sprite im Kenney-Round-Stil, Asset "pig"): Pfeil links/rechts, Nummernblock-0 springen/Wandsprung (normale 0 geht auch),
    Nummernblock-1 in der Luft halten = Segelschirm (eigene Taste, normale 1 geht auch) (klappt weich auf, schwingt, sie hängt aufrecht); Start aus Editor (startF)
  - Spielerin 2 kann NICHT eingehakt werden (bewusst entfernt, Nutzerwunsch) – G greift nur Haken
  - ZOOM 15 % heraus (zoom 0,85; Nutzerwunsch: erst 10 % = 0,9, dann „5 % weniger“ = 0,95, dann „noch mal 10 % raus“;
    früher „kein Zoom“): Bild bleibt 16:9, Boden unten bündig, oben ein Streifen Hintergrund/Himmel; sichtbare
    Weltbreite VW = 1280/0,85 ≈ 1506 px (≈ 37,6 Kästchen).
  - Himmel über dem Level (Nutzerwunsch „keine durchsichtige Decke“): durch den Zoom sind über Reihe 0 gut 3 Kästchen
    Himmel sichtbar (SKY_ROOM = 720/0,85 − 720 ≈ 127 px). Dort kann man hineinspringen; die Decke ist der obere
    Bildrand (früher: unsichtbare Decke genau bei Reihe 0). Im Editor sind das die 3 Himmel-Reihen −1 … −3 über
    Reihe 0 – dort kann man ganz normal bauen (Nutzerwunsch), deshalb ohne besondere Kennzeichnung; im Spiel steht
    alles an derselben Stelle. In Level 1–6 wurden Wände/Böden/Türen/Scheinwände und waagerecht fahrende Wände, die
    bis Reihe 0 reichten, einmalig bis Reihe −3 verlängert (sonst könnte man jetzt darüber springen). (früher kurz:
    automatisch verlängert + nicht bebaubarer Himmelsstreifen im Editor – ersetzt.)
  - Editor-Ansicht passt sich der Fensterhöhe an: Himmel + 18 Reihen (21 Reihen) passen ohne senkrechtes Scrollen
    ins Fenster (nie größer als 1:1); seitlich scrollt man weiter (Test himmel_ohne_unsichtbare_decke).
  - Unverzerrt: Spielfeld immer genau 16:9 (bei jeder Fenstergröße geprüft); Affe/Schweinchen werden im echten
    Seitenverhältnis ihrer Bilder gezeichnet (308 × 257 – früher ins Quadrat gestreckt, also 20 % zu hoch),
    Unterkante unverändert; ebenso das Gesicht im Pfeil am Bildrand.
  - Ruhige Kamera gegen Wackeln bei zwei Spielern (Totzone, cameraTarget in 09-kamera.js): solange die hintere
    Figur 180–420 px (CAM_BACK_MIN/CAM_BACK_PUSH) vom linken Rand steht, bleibt das Bild stehen – Zappeln,
    Springen, Schaukeln am Seil bewegen es nicht; erst darüber/darunter fährt es mit, weicher als vorher
    (CAM_FOLLOW 0,08 statt 0,12). Test kamera_ruhig_bei_zwei.
  - Spieltempo 10 % langsamer (GAME_SPEED 0,9 in 14-spielschleife.js): alles läuft gleichmäßig langsamer (Figuren,
    bewegte Teile, Bröckelboden, Stachelwände); Sprunghöhen/-weiten bleiben gleich -> Levels bleiben schaffbar.
    Test spieltempo_langsamer.
  - (früher: KEIN ZOOM, Spielfeld immer gleich groß; jetzt durch Zoom 0,85 ersetzt.) Kamera: hintere Figur 180–420 px vom linken Rand (früher fest ~300 px), vordere höchstens bei 75 % der
    Bildbreite (FRONT_MAX). Passen beide nicht ins Bild, folgt die Kamera der VORDEREN Figur (Abstand max.
    1,25 Bildschirmbreiten = hintere höchstens einen halben Bildschirm außerhalb, keepTogether/MAX_SEPARATION); die hintere erscheint als Pfeil mit
    Gesicht + Abstand in Kästchen am linken Rand.
    Sichtbare Weltbreite = VW (für Ausschnitt-/Sichtbarkeitsprüfungen VW statt W benutzen!)
  - Gemeinsame Kamera schaut nach vorn: hintere Figur ~300 px vom linken Rand, vordere mind. 70 px vom rechten
    (CAM_LEFT/CAM_RIGHT) -> man sieht möglichst viel vom Weg; max. Abstand ~1 Bildschirmbreite; Ziel erst geschafft, wenn BEIDE da sind
  - Im Ziel (beide da): Affe und Schweinchen tanzen 4,5 s (ohne Hinweis „Beide im Ziel“ – Nutzerwunsch) (im Wechsel
    hüpfen, wippen, zur Seite schauen, jeder 4. Takt eine Drehung, Herzchen; WIN_DANCE_STEPS in 21-figuren-leben.js),
    Eingaben ruhen solange; danach öffnet sich das Hauptmenü (früher: Hinweis „Drücke R für einen neuen Versuch“)
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
    Fallhöhe, an den Füßen verankert) – beides nur kurz und dezent; kein Dauer-Atmen und kein Stauchen beim Fallen mehr
    (Nutzerwunsch: Figuren sollen nicht verzerrt wirken). Staubwölkchen bei Landung/Sprung/Wandsprung.
    Entdeckung: stehen Affe und Schweinchen ~1,5 s dicht beieinander, steigen Herzchen auf (mit leisem Ton).
  - Süße Tiere & Entdeckungen (js/20-tiere.js, reine Deko): Schmetterlinge (flattern, weichen aus), Frösche (atmen,
    quaken ab und zu, hüpfen weg wenn man kommt), Schnecken (kriechen, ziehen sich ins Haus zurück), Pilze (federn +
    „boing“ beim Drüberlaufen), Blumenknospen (gehen beim Vorbeikommen mit Glitzer + Ton auf), selten: schlafendes
    Faultier unter schwebendem Boden (Zzz, wacht auf und winkt, Entdecker-Glitzer-Ton) und EIN goldener Schmetterling
    pro Level (Entdecker-Ton). Verteilung fest je Level (nicht auf Münzen/Stacheln/Hebeln/Checkpoints/Ziel/Start).
  - Eigene Aufnahmen des Nutzers (assets/audio/, js/23-audio-dateien.js) haben Vorrang vor dem erzeugten Klang:
    musik.mp3 (20 min Akkorde) wird gestreamt, setzt erst nach 2,5 s Stille ein und blendet über 7 s ein; beim Tod
    sanft aus, nach dem Weitermachen 1,5 s Pause, dann von vorne mit 5 s Einblenden. Pausenmenü: Musik gedämpft
    (Tiefpass, „hinter einer Tür“), Regenbogen: heller (Höhen +6 dB), Regen: 30 % leiser. voegel.mp3 bei Sonne
    (verstummen im Regen, kommen danach langsam zurück), regen.mp3 mit dem Schauer (ersetzt den erzeugten Regen, nur
    leise „Plopps“ bleiben), fluss.mp3 immer leise, lauter nach Regen und wenn der Wasserfall im Bild ist. Kurze
    Dateien = nahtlose Schleife (MP3-Stille abgeschnitten, letzte Sekunde in den Anfang geblendet). Lautstärken:
    FILE_VOL (Musik 0,38, Vögel 0,6, Regen 0,8, Fluss 2,0). Gesamtlautstärke aller Töne: MASTER_VOL 0,7 (07-…js). Blockiert der Browser das Abspielen, startet die Musik beim
    nächsten Tastendruck/Klick. Leistungsanzeige (F) zeigt den Musik-Zustand (spielt/lädt/blockiert/Datei lädt nicht).
    Lädt eine Datei nicht, bleibt der erzeugte Klang (Klavier, Grillen, Bach, Regen) als Ersatz.
  - Hintergrundmusik + Sonnen-Ambiente (js/22-musik-ambiente.js, alles im Browser erzeugt, keine Aufnahmen):
    ruhiges, verträumtes Klavier (Nutzerwahl), live komponiert: warme Akkordfolgen in F-Dur (~64 Schläge/min), gebrochene
    Akkorde links, Melodie-Motive rechts (wiederholt + leicht verändert, Atempausen), weicher Raumhall. Klavierton aus
    Obertönen mit Saiten-Unschärfe, Hammer-Anschlag und zwei leicht verstimmten Saiten (vorberechnet in Häppchen).
    Regenbogen: dieselbe Musik heller (Melodie eine Oktave höher + funkelnde Doppelung). Bei Regen etwas leiser.
    Sonne: Wind in den Blättern (Böen), leise Grillen, plätschernder Bach (Stereo-Schleifen; Vogelgezwitscher im
    Hintergrund dafür entfernt – Nutzerwahl). Lautstärken: MUSIC_VOL, AMB_VOL. M schaltet alles stumm.
  - Wetter & Stimmung (js/19-wetter.js, reine Deko): wärmerer Himmel (goldenes Licht am Horizont, kräftigere Sonne
    mit sich langsam drehenden Strahlen), immer leichter warmer Schimmer + weiche Vignette. Ablauf: Sonne 4–7 min (erste Sonne
    2,5 min; früher 70–120 s, Nutzer: wechselt zu oft) -> zieht zu (7 s) -> Regenschauer 45–75 s -> klart auf (7 s) mit Regenbogen (~22 s) -> Sonne … Regen: schräge Tropfen
    vor der Welt, Spritzer auf allen Oberseiten, Hintergrund dunkler/kühler (Spielfeld bleibt hell). Regen-Klang (ASMR,
    wie auf schrägem Blechdach/Dachfenster, dicht + tiefes Dach-Brummen): vorab im Hintergrund in kleinen Häppchen berechnete Stereo-Schleifen aus
    tausenden Einzeltropfen – warmes rosa Rauschen als Bett, dichtes Prasseln (winzige Einschläge links/rechts verteilt),
    gläserne „tick“-Tropfen, metallische „ping/plonk“-Tropfen mit Nachklang; live dazu satte „Plopps“ aus der Dachrinne;
    bei leichtem Regen nur vereinzelte Tropfen.
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
  - Leistungs-Anzeige unten rechts (Taste F ein/aus, beim Start AUS – Nutzerwunsch): Bilder/Sek., Ruckler, Arbeitszeit pro Bild (Logik/Zeichnen)
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
  - (entfernt auf Nutzerwunsch: Fahrweg-Anzeige bewegter Böden und Haken – gepunktete Schiene, Endpunkte, gestrichelte
    Umrisse an Start und Ziel. Bewegte Teile zeigen ihren Weg nicht mehr an.)
  - Plaketten (Nummer im Kreis über Türen usw.) bleiben immer im Bild: reicht eine Tür bis in die oberste Himmel-Reihe,
    sitzt die Plakette im obersten Türteil statt darüber (Test plakette_im_bild).
  - Bewegte Teile sind fest: fährt ein Stück in eine Figur hinein (von oben, unten oder seitlich), wird sie zur
    nächsten freien Seite hinausgeschoben – bevorzugt in Fahrtrichtung, nie gegen sie (eine sinkende Platte setzt
    niemanden plötzlich obendrauf; wer darunter steht, wird zur Seite geschoben). Mitfahren auf einem Stück geht
    nicht durch Wände/Decken (pushOutOfMover/playerBlocked in 05-level-objekte.js, Test fahrende_platte_kein_durchfahren).
  - Stacheln-Aussehen (SPIKE_SPRITE): 4 glänzende Metallkegel mit Glanz und rötlicher Spitze auf einer Eisenleiste
    mit Nieten, leichter Schatten; gedreht je Richtung
  - Stacheln können in 4 Richtungen zeigen (spike.dir 0=oben,1=rechts,2=unten,3=links; Treffer = ganzes Kästchen)
  - Mitfahrende Stacheln (syncSpikeCarriers in 05-level-objekte.js): klebt ein Stachel mit seinem Fuß an einem
    bewegten Stück (zeigt nach oben -> Stück darunter, nach unten -> darüber, nach rechts -> links daneben, nach links
    -> rechts daneben), fährt er mit -> Stachelwände, Stachel-Pressen, rutschende Stachelblöcke. Im Editor einfach
    Stacheln direkt an ein bewegtes Teil setzen (der Editor zeigt sie an der Startstelle).
  - Schalter, bewegter Boden, Stacheln, Checkpoints gelten für beide Spieler
  - Münzfarben (coin.color): blau = nur Affe, pink = nur Schweinchen, gold = beide; falsche Figur -> Münze wackelt;
    Effekte (Ring/Funken) in Münzfarbe; Münz-Kasten zeigt zusätzlich "● Affe a/b  ● Schwein a/b"
  - Geräusche ASMR-artig (js/18-sound.js, alle im Browser erzeugt): Klangbibliothek aus feinen Material-Klängen, einmal
    im Hintergrund in kleinen Häppchen berechnet (~1 s nach dem ersten Tastendruck), Stereo, mehrere Varianten + kleine
    Zufalls-Tonhöhe (nie zweimal gleich), links/rechts je nach Ort im Bild, Hauch Nachhall. Laufen = Knistern auf
    Moos/Laub (Schweinchen leiser/heller), Springen = weiches Stoff-„Fwip“, Landen = gedämpfter Plumps ins Moos mit
    Knistern (je nach Fallhöhe), Wandsprung = Holz-„Tock“, Münze = gläsernes Murmel-Klirren mit Glitzern (Folge-Münzen
    höher), Haken = Karabiner-„Klick-Klink“, Loslassen = Seil-Surren, Schirm = Stoff ploppt auf + flattert, Hebel =
    hölzernes Ratschen-Klick-Klack (ein höher/aus tiefer), Tür = knarzendes Holz + Klopfen, Bröckelboden = rieselnder
    Sand, dann kullernde Steinchen + Rumpeln, Sterben = niedlicher Seifenblasen-„Plopp“ + Staubwölkchen + Glitzer (vorher traurige Kalimba – Nutzer fand es nicht gut), Checkpoint = Holz-Klopfen + Rascheln,
    Pilz = Gummi-„Boing“, Frosch = Quaken, Knospe = weiches Laub-Plopp, Herzchen = leises „Pomf“, Vögel = Flügelflattern,
    Entdeckung = Laub-Rascheln mit Holz-Tock (Klingeln NUR bei Münzen – Nutzerwunsch), Menü = sanfte Klicks. Lautstärken je Geräusch in SFX_VOL. Ein Beobachter (sfxObserve)
    erkennt Ereignisse an Zustandsänderungen und ändert nichts am Spiel. Taste M = Ton aus/an (gemerkt), auch im Pausenmenü.
  - Münzen-Aussehen (drawCoin3D): etwas größer (Radius 12,5 statt 11, nur Zeichnung – Einsammel-Bereich
    unverändert), 3D: sichtbare Kante beim Drehen, Lichtverlauf, geprägter Innenring mit Stern, Glanzlicht;
    dunkler Umriss, weicher Schein in Münzfarbe und leichter Schatten -> heben sich vom Dschungel ab
  - Münzen (data.coins [{x,y}] aus dem Editor): blau = Affe, pink = Schweinchen. Keine Mindest-Münzen mehr fürs Ziel
    (die gemeinsame Gold-Zählung „x / 10“ und der Hinweis „Noch X Münzen!“ wurden auf Nutzerwunsch entfernt).
    Münz-Anzeige oben links (modern, wächst mit der Bildschirmgröße): dunkle Glas-Karte mit je einer Spalte pro
    Figur – leuchtende Münze in Figurenfarbe, große Zahl „gesammelt / vorhanden“, Fortschrittsbalken; voll = Zahl grün;
    beim Einsammeln dreht sich die Münze der passenden Spalte und die Zahl hüpft. Beim Sterben bleiben
    gesammelte Münzen, bei Neustart (R) sind alle wieder da; Aufsammel-Effekt: Münze schnellt hoch/dreht/verpufft,
    Funkelsterne, Lichtring, "+1", Zähler hüpft, kleiner "Bling"-Ton (WebAudio), schnelle Folge = jeweils höherer Ton
  - Bewegte Haken (hook.targetX/targetY/speed/switchLink aus dem Editor): pendeln wie bewegter Boden,
    optional per Schalter gestartet, dann dauerhaft (ohne Schalter: erst ab Sichtbarkeit, s. activateVisibleMovers); Seil zieht Spieler 1 mit
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
  - Startmenü (js/24-startmenue.js + css/startmenue.css, nach der Artefakt-Vorlage „Startscreens“ des Nutzers):
    Titelbild „Monchichi Koop“ mit Affe und Schweinchen („Beliebige Taste drücken“) → Hauptmenü „Spielen ·
    Fortfahren (erst nach dem ersten Spiel) · Optionen · Beenden“ → Spielerwahl „Wer spielt wen?“ (Spieler 1 =
    A/D/Leertaste + Controller 1, Spieler 2 = Pfeile/Num 0 + Controller 2; mit links/rechts die Seite = Figur
    wählen, Springen = bereit, beide bereit → Countdown 3-2-1-Los) → „Spielen“ startet Level 1. Gab es schon einen
    Spielstand, kommt vorher die Rückfrage „Neues Spiel starten?“; mit „Neues Spiel“ wird ALLES gelöscht (Nutzerwunsch):
    freigeschaltete/geschaffte Level und Tode-Statistik, Packages, alle Items/Skins (besessen und angelegt) und das
    Münz-Konto – man fängt komplett von vorn an (resetSave in 24 + cosmeticsReset in 26; Test neues_spiel_loescht_alles). „Fortfahren“ führt ERST zur Weltkarte (seit Ausbau 3; früher direkt zur Levelauswahl), dann zur Welt-Seite, nach der Wahl eines Levels kommt die Spielerwahl
    (Countdown startet dann dieses Level; Zurück führt wieder zur Levelauswahl, die Auswahl bleibt).
  - WELTEN (Ausbau 1, levels/worlds.json): Welten mit id, name, titel, reihenfolge, level (Level-Dateien in
    Spielreihenfolge) und boss (vorerst null): Dschungel = Level 1, 2 · Ruinen = Level 3, 4 · Höhle = Level 5 ·
    Wasser = noch leer · Vulkan = Level 6. Die Levelauswahl nimmt ihre Reihenfolge aus worlds.json (sieht damit
    genau aus wie vorher), die Namen aus levels.json. levels.json bleibt als Rückfall: fehlt worlds.json, gilt ihre
    Reihenfolge; Level aus levels.json, die in keiner Welt stehen (nicht versteckt), kommen hinten dran (Test welten_laden).
  - WELT + TAGESZEIT + WETTER als Schichten (Ausbau 1, 10a-themen.js + 19-wetter.js): neue Level-Felder
    "welt" (dschungel, ruinen, hoehle, wasser, vulkan), "tageszeit" (morgen, mittag, abend, nacht), "wetter"
    (wechselnd = wie bisher Sonne/Regen im Wechsel, trocken = nie Regen, regen = dauernd Regen) und optional "look"
    (= bisheriges Thema behalten, z. B. "nacht" für Mondnacht). Die Tageszeit legt sich als Schicht über den Welt-Look:
    Himmel, Sonne bzw. Mond + Sterne, Licht-Teilchen (abends/nachts Glühwürmchen), Farbstich der Hintergrund-Ebenen,
    Dunkelheit mit Licht um Figuren/Münzen (nachts), nachts Eulen und leuchtende Pilze. Die natürliche Tageszeit einer
    Welt ergibt genau ihren bisherigen Look (Dschungel = morgen, Ruinen = mittag). Höhle und Vulkan haben keinen Himmel:
    dort macht nur „nacht“ es dunkler; Regen gibt es dort weiterhin nicht (auch nicht bei „regen“). Wasser sieht
    vorerst aus wie der Dschungel (eigener Look mit Ausbau 5).
    Alte Level-Dateien ohne die neuen Felder laden weiter mit ihrem „theme“ – exakt wie vorher (Startbilder aller 6
    Levels per Screenshot verglichen: identisch) und mit wechselndem Wetter (Tests schichten_tageszeit_wetter,
    alte_levels_unveraendert).
    Testlevel levels/test/schichten-dschungel.json: öffnen mit index.html?testlevel=schichten-dschungel (startet sofort,
    ohne Hauptmenü); dort schaltet T die Tageszeit (morgen → mittag → abend → nacht) und Z (oder Y) das Wetter
    (wechselnd → trocken → regen) durch, die Anzeige oben nennt beides. Allgemein: index.html?testlevel=<name> lädt
    levels/test/<name>.json; T/Z nur in Leveln mit "schichtenVorschau": true.
  - SPIELSTAND nach Dateinamen (Ausbau 1): Freischaltungen, Geschafft-Liste und Levelkarten-Statistik merken sich
    die Level-DATEI (z. B. level-3.json) statt der Nummer (Format v 2: unlocked, completed, stats). Ein alter
    Spielstand (Nummern) wird beim ersten Start umgerechnet, nichts geht verloren; das Original bleibt unverändert
    als Sicherung unter „monchichi.save_v1_backup“ im Browser (wird nie überschrieben). Test spielstand_migration.
  - Levelstart aus dem Startmenü (Nutzerwahl): Vorhang aus EINZELNEN Blättern (~240 Blätter: schlanke Blätter,
    Herzblätter mit Schlitzen, Palmwedel; hinten dunkel, vorne hell) – jedes fliegt vom nächsten Bildrand an seinen
    Platz (außen zuerst, zur Mitte später), bis alles voller Blätter ist; darauf die Titeltafel „Level N“ + Name
    (z. B. „Dschungel“), dann fliegen die Blätter wieder hinaus (curtainIntoLevel in 24-startmenue.js,
    menuScreen = 'curtain', Spiel steht still). Die Figuren stehen dabei einfach an ihren Startplätzen
    (Nutzerwunsch; die frühere Ankunfts-Animation mit Schirm/Liane/Salto ist entfernt).
  - Spielerwahl tauscht die Tasten: Tasten gehören zu SPIELERN (KEYSETS in 03-eingabe.js), nicht zu Figuren.
    Spielt Spieler 1 das Schweinchen: Schweinchen A/D, Leertaste, G = Schirm, J = Hebel; Affe Pfeile, Num 0,
    Num 1 = Haken, ↑/↓ = Seil, Num 2 = Hebel; Controller 1 steuert dann das Schweinchen. Anzeige oben passt sich an.
  - Pausenmenü: Esc bzw. Options im Spiel (nicht auf dem Tod-Bildschirm, dort macht jede Taste wie bisher weiter):
    „Weiterspielen“, „Level neu starten“, „Zurück zum Menü“; Esc/Options/○ schließt die Pause wieder
    Knöpfe unten links („Level neu starten“, „☰ Menü“, „Level laden (JSON)“) sind auf Nutzerwunsch AUSGEBLENDET
    (R = Neustart, Esc / Options = Pause gehen weiter; Level aus Datei laden geht damit nicht mehr per Knopf).
  - Spielansicht aufgeräumt (Nutzerwunsch): Steuerungs-Erklärungen oben links/rechts ausgeblendet (stehen im
    Startmenü unter Optionen), nur der Münz-Zähler bleibt. Spielbild füllt den Bildschirm (16:9, ohne Rand).
  - Tode-Duell oben rechts (25-duell.js; Nutzerwunsch „wer stirbt öfter?“, größer und moderner): dunkle Glas-Karte,
    wächst mit der Bildschirmgröße; Gesichter in Farbringen (Affe blau, Schweinchen pink), große Zahlen, in der Mitte
    Totenkopf mit „TODE“; wer vorne liegt (mehr Tode): Ring und Zahl rot leuchtend. Nur Tode, keine Münzen (die stehen im
    Münz-Zähler oben links). Wer mehr Tode hat: Zahl rot und das Gesicht wird mit jedem Tod Vorsprung größer (+12 % je
    Tod, höchstens +80 %); bei jedem Tod hüpft die Zahl. Zählt pro Level: Weitermachen und R lassen den Stand, ein neu
    geladenes Level beginnt bei 0 (deathCount in 01-level.js; Test tode_zaehler).
  - Level starten aus der Levelauswahl: Level-Datei wird bis zu 3× versucht zu laden; klappt es nicht (oder bricht der
    Aufbau ab), zeigt die Levelauswahl ein Fenster „Level konnte nicht starten“ mit dem Grund (z. B. HTTP 404) statt
    still zurückzuspringen (Test level_ladefehler_mit_grund).
  - Beide im Ziel: während des Tanzes keine Einblendung; danach ein Statistik-Bildschirm im Stil von
    Hauptmenü/Levelauswahl („LEVEL GESCHAFFT“, Level-Nummer + Name): für Affe und Schweinchen je eine Glas-Karte mit
    Gesicht, Münzen (selbst gesammelt, / Münzen der eigenen Farbe) und Toden; Zahlen zählen hoch; Schilder
    „Mehr Münzen“ (grün) / „Mehr Tode“ (rot). „Weiter“ (Springen/Enter/✕) -> Welt-Seite dieses Levels (seit Ausbau 3;
    nach dem letzten Level einer Welt -> Weltkarte mit Freischalt-Animation der neuen Welt).
  - Levelauswahl nach „Level geschafft“: auf der Karte des neu freigeschalteten Levels liegt ein goldenes Schloss,
    es wackelt, der Bügel springt auf und es platzt in goldene Splitter, die Karte leuchtet golden auf; danach
    „Level x freigeschaltet!“. War nichts neu freizuschalten (Level schon geschafft), geht es ohne Schloss weiter.
  - WELTKARTE (Ausbau 3, S.map in 24-startmenue.js, Stil in css/startmenue.css): „Fortfahren“ öffnet eine Pergament-Karte
    (Dschungel-Hintergrund des Startmenüs) mit je einer Insel pro Welt in der Reihenfolge aus worlds.json, im Zickzack
    von links nach rechts, verbunden durch gestrichelte Pfade. Jede Insel: eigenes Bild je Welt (Palme, Säulen,
    Kristalle, Wellen, Vulkan), Name, Fortschritt „x / y Level“ (✓ wenn alle geschafft) und Boss-Symbol (Totenkopf
    mit Krone, „bald“ solange es keinen Boss gibt). Gesperrte Welten verschleiert (grau, unscharf) mit Schloss; Welten
    ohne Level (z. B. Wasser) gesperrt mit „Bald“, nicht anwählbar. Affe und Schweinchen stehen auf der gewählten
    Insel. ◀ ▶ (auch ▲ ▼, Stick/Steuerkreuz) wählen, Springen/✕/Enter öffnet, Esc/○ zurück ins Hauptmenü; gesperrt =
    Wackeln + Hinweis „Gesperrt – schafft erst alle Level in …“. Unten rechts „Welten x / y“.
  - WELT-SEITE (Ausbau 3): die bisherige Levelkarten-Seite, aber nur mit den Leveln der gewählten Welt (Titel = Name
    der Welt, darunter „Welt n – Name“) plus einer Boss-Karte am Ende (Platzhalter „Boss – Bald verfügbar“, nicht
    startbar, bis Ausbau 6). Alles andere wie vorher: Schloss-Animation, Statistik-Zeile unter geschafften Karten,
    „Packages öffnen“, „Umkleide“, Fortschritt (jetzt x / y dieser Welt), Spielerwahl; Esc/○ zurück zur Weltkarte.
    Ohne worlds.json (oder für Level ohne Welt) gibt es eine eigene Insel „Level“ bzw. „Weitere Level“.
  - FREISCHALTUNG (Ausbau 3): Welt 1 ist immer offen; die nächste Welt öffnet, wenn alle Level (später auch der Boss)
    der vorigen Welt mit Leveln geschafft sind – Welten ohne Level (Wasser) werden übersprungen, Level 6 (Vulkan)
    öffnet also wie bisher nach Level 5. In einer Welt geht es Level für Level. Alte Spielstände passen: was schon
    freigeschaltet war, bleibt offen; „Alle Level freischalten“ öffnet auch alle Welten. Das Spielen selbst ist
    unverändert. Tests weltkarte_und_navigation, welten_freischaltung.
  - Unter jeder geschafften Levelkarte eine knappe Zeile: Totenkopf, Affe x, Schweinchen y (höhere Zahl rot); gemerkt
    wird die letzte geschaffte Runde (save.stats). Keine Totenkopf-Maske im Hauptmenü (Nutzerwunsch, wieder entfernt).
    (Tests duell_unter_levelkarte, startmenue_fortschritt_und_wahl)
  - Vollbild: beim ersten Tastendruck/Klick im Titelbild schaltet das Spiel in den Vollbild-Modus (Browser-Regel:
    nicht per Controller); in den Optionen „Vollbild an / aus“. Im Vollbild wird Esc fürs Spiel gesperrt
    (Tastatur-Sperre, Chrome/Edge): Esc öffnet die Pause, LANGES Halten von Esc verlässt das Vollbild
    (Nutzerwunsch). Andere Browser (Firefox/Safari) erlauben das nicht – dort verlässt Esc das Vollbild.
  - Level 1 (levels/level-1.json + editor-format): Teil des Nutzers bis Spalte 240 unverändert, danach
    Erweiterung bis Spalte ~800 (Ziel bei 796), 10 Abschnitte mit Münzen und Koop-Rätseln, getrennte Wege:
    2) Schweinchen segelt vom Turm zur Insel, Hebel 3 fährt die Plattform für den Affen; 3) Affe schwingt am
    Haken auf die hohe Insel, Hebel 4 fährt die Brücke fürs Schweinchen; 4) Affe schwingt ins obere Stockwerk,
    Schweinchen bleibt unten, Hebel unten öffnet Tür oben und umgekehrt (5/6); 5) Bröckel-Brücke über Stacheln
    + Wandsprung-Kamin; 6) Schweinchen segelt zu Hebel 7 (fährt den Affen), Aufzug, Hebel 8 öffnet Tür;
    7) Münzjagd auf fahrenden Plattformen + Bonus-Turm (Bröckelstufen); 8) Stachelgrube: Affe hangelt an zwei
    Haken, Schweinchen segelt vom hohen Turm; 9) Affe oben an zwei Haken, Schweinchen unten, Hebel 11/12 öffnen
    sich gegenseitig die Türen; 10) Finale: Segeln → Hebel 14 fährt den Affen, Aufzug zum Münz-Plateau, Ziel.
    Regeln (Nutzerwunsch): nur blaue (Affe) und pinke (Schweinchen) Münzen, jeweils auf dem Weg der Figur
    (Segel-/Schwungbahnen vom Test-Bot gemessen); keine Münze in Boden/Wand/Tür; Haken-Radius höchstens 5 Kästchen;
    Wege eindeutig: Nur-Schweinchen-Lücken sind mind. ~5 Kästchen weiter als der Affe springen kann (mit Gefälle,
    Stacheln darunter), Nur-Affe-Stellen sind für das Schweinchen klar zu weit (>= 18 flach) oder 4 Reihen höher.
  - Level 2 „Baumkronen“ (levels/level-2.json, 800 Spalten, etwas knapper als Level 1, neue Mechaniken):
    1) Bröckel-Trittsteine; 2) hoher Wandsprung-Kamin für beide; 3) Schweinchen segelt tief zu Hebel 2 → schräg
    fahrende Plattform bringt den Affen; 4) Fahrstuhl anhalten: Schweinchen schaltet Hebel 3 an/aus, Affe steigt oben
    durchs Loch aus; dann getrennt (Affe oben an zwei Haken, Schweinchen unten über Bröckel), Hebel 4/5 öffnen sich
    gegenseitig die Türen; 5) Hebel AUF der fahrenden Plattform (beide fahren mit); 6) Bröckel-Treppe nach oben;
    7) Seilbahn: Schweinchen segelt zu Hebel 7, der den Haken mit dem hängenden Affen schräg rüberfährt; 8) Türen-
    Staffel mit 4 Hebeln (Affe oben per Haken, Schweinchen unten); 9) fahrender Haken (Affe) / hoher Turm (Schweinchen);
    Erweiterung (Nutzer: zu kurz/zu einfach): 11) Stachel-Pressen (Stachelblöcke fahren von der Decke auf und ab –
    im richtigen Moment durchlaufen); 12) Hebel in der Luft (Hebel 12 auf kleinem Sims, nur der Affe kommt per
    Haken hin; Tür für beide); 13) Stachelwand-Jagd (Hebel 13 öffnet das Tor UND lässt eine Stachelwand los, die
    über Gruben und Bröckel-Stege hinterherfährt – ~2 s Vorsprung); 14) Welcher Hebel? (drei Hebel 14/15/16, nur
    15 öffnet die Tür, 14 und 16 lassen eine Presse auf den Ziehenden fallen – auf Nummern/Farben achten);
    15) Stachel-Pendel (rutschende Stachelblöcke am Boden überspringen); 16) Aufzug zum Münz-Plateau, Ziel (794).
    Level 2 wurde vom Nutzer im Editor überarbeitet und eingespielt (u. a. Stacheln über dem Fahrstuhl in
    Abschnitt 4, schnellere Stachelwände, ~814 Spalten) – die Abschnittsliste oben ist nur noch grob gültig.
    Beim Einspielen wurden Verknüpfungen über 20 umnummeriert (28 -> 14 Stachelwand-Jagd, 30 -> 15), damit
    Spiel und Editor zusammenpassen; Spiel- und Editor-Format sind daraus neu erzeugt und identisch.
  - Level 3 „Ruinen“ (levels/level-3.json, 800 Spalten, schwerer, mehr Timing): 1) Bröckel-Hüpfer (kleine Inseln
    halten nur kurz); 2) Zickzack-Kamin (zwei versetzte Schächte); 3) Schweinchen segelt mit Zwischenlandung auf einer
    Bröckel-Säule, Hebel 3 → Plattform für den Affen; 4) Fahrstuhl unter Stacheln: der Affe muss ihn mit Hebel 4
    rechtzeitig anhalten, sonst sticht die Decke; Schweinchen öffnet oben Tür 5 für den Affen; 5) Stachel-Tunnel mit
    Bröckelboden (nicht springen, nicht stehen bleiben) fürs Schweinchen, Dreier-Haken-Kette für den Affen;
    6) Schweinchen fährt auf der Plattform und legt unterwegs die mitfahrenden Hebel 7/8 um → Türen oben auf dem Steg
    für den Affen; 7) fahrender + feste Haken (Affe), Turm → Bröckel-Säule → Boden (Schweinchen); 8) Türen-Staffel
    über Bröckelboden; Erweiterung: 10) Pressen über Gruben (unter jeder zweiten Presse fehlt der Boden ->
    im richtigen Moment springen); 11) Stachelwand-Jagd 2 (schneller, mitten im Lauf Hebel 14 für die Tür);
    12) Ein Hebel, zwei Folgen (Hebel 15 öffnet Tür 15, startet aber die Presse davor; Tür 16 hat ihren Hebel VOR
    der Presse -> Reihenfolge überlegen); 13) Zwei Fähigkeiten (Hebel 18 nur segelnd erreichbar, Hebel 17 nur am
    Haken; zwei Türen hintereinander); 14) Endspurt-Jagd (schnellste Stachelwand + rutschender Stachelblock);
    15) Finale: Schweinchen durch den Kamin über die Bröckel-Brücke, Affe an drei Haken darunter, Ziel (796).
  - Level 4: jetzt die vom Nutzer im Editor überarbeitete Fassung (hochgeladen und eingespielt, 463 Spalten,
    Thema nacht; Editor-Format aus seiner Spiel-Datei zurückgerechnet, beide Formate geprüft gleich). Eigene
    Münzverteilung (32 blau / 31 pink) – die Regel „gleich viele“ gilt deshalb erst ab Level 5.
    Auf Wunsch des Nutzers reichen alle Wände, Türen (5, 10) und die obere fahrende Stachelwand, die bis Reihe 0 gingen,
    jetzt bis in den Himmel (Reihe −3).
    Die folgende Beschreibung ist der frühere Entwurf, auf dem die Fassung des Nutzers aufbaut:
  - (früher) Level 4 „Mondnacht“ (levels/level-4.json, 520 Spalten, Thema nacht = dunkel, SEHR schwer; jede Stelle mit dem
    Koop-Bot geprüft, viele an der Grenze des Schaffbaren): 1) Bröckel-Sprint: 2 Kästchen schmale Bröckel-Inseln,
    Lücken 6/6/5/5 (Sprunggrenze, nicht stehen bleiben); 2) Schleuse: Druckplatte 1 außen hält Tür 1 offen, drinnen
    liegt Platte 1 auf einem hohen Sims (nur per Wand-Rücksprung von der hängenden Wand), dann Platte 2 / Tür 2 /
    Platte 2 draußen – nur zu zweit; 3) versteckter Hebel: Tür 3 ohne sichtbaren Hebel, Kamin (Breite 3) über einen
    Felsblock, an dessen Rückseite unten eine Scheinwand in eine Kammer mit Hebel 3 führt (Münzen als Hinweis);
    4) getrennte Höhen: Kamin auf einen Turm, Schweinchen segelt über Dach-Lücken (13 = Segelgrenze), Affe hangelt
    darunter an fünf Haken; 5) Stachelwand-Jagd: Hebel 5 öffnet die Tore 5 (unten vor den Haken, oben auf der Brücke) – startet aber
    zwei Stachelwände (oben 6,3 / unten 5,4), Affe an
    sieben Haken, Tür 9 versperrt seine Bahn bis das Schweinchen oben im Lauf Hebel 9 zieht, ihre Tür 10 öffnet
    Hebel 10 (mit kurzer Reaktionszeit bleiben ~2–3 Kästchen Vorsprung); 6) Fahrstuhl zwischen Stachelwänden:
    Schweinchen hält Druckplatte 6, Affe fährt; zu lange gedrückt = Stacheldecke; oben Hebel 7 -> Tür 7 unten im
    Schacht; 7) Wandsprung-Schlucht: zwei Kamine (Breite 4) im Zickzack, dann drei weite Sprünge auf schmale Simse
    über Stacheln (Affe an der Sprunggrenze); 8) Finale: Kamin der Breite 5 hinauf zum Ziel (440).
  - Level 5 „Kristallhöhle“ (levels/level-5.json, 480 Spalten, Thema hoehle = noch dunkler, SEHR schwer, alles mit
    dem Koop-Bot geprüft; neues Element Aufwind): 1) Aufstieg: Schweinchen fliegt in zwei Wind-Säulen auf Stufe und
    Klippe, der Affe zieht sich an zwei Haken hoch; 2) Windtür: eine waagerechte Tür sperrt die Wind-Säule – der Affe
    hält unten Druckplatte 2, das Schweinchen fliegt hoch und zieht Hebel 3 für Tür 3; 3) versteckter Gang: niedriger
    Tunnel, der scheinbar endet (Scheinwand); Hebel 4 steckt in einer Nische über der Decke und ist nur im Sprung durch
    eine Scheindecke erreichbar (Münze darunter als Hinweis); 4) steigende Stacheln: Hebel 5 öffnet das Tor am Startsims
    – und lässt dabei einen Stachelboden aus der Grube steigen (1,3 px/Schritt; mit kurzen Denkpausen knapp) – Affe an zwei Haken, Schweinchen durch zwei
    Wind-Säulen hinauf aufs Plateau; 5) Fähre unter den Pressen: die Fähre fährt nur, solange jemand auf einer
    Druckplatte 6 steht (je eine an jedem Ufer); zwei Stachelpressen stampfen über der Strecke, wer die Platte hält,
    muss im richtigen Moment loslassen (dauernd drücken = Fahrer erwischt); Strecke so kurz, dass Fahrer und Platte
    nie mehr als 40 Kästchen auseinander sind; 6) Wind-Slalom: oben fliegt das Schweinchen über die Stachel-Trennwand
    (vier Kästchen breite Landepolster, Wind-Säule mit Stacheldecke: Schirm rechtzeitig zu), unten hangelt der Affe
    an sechs Haken; 7) Finale: zwei Haken (Affe) und zwei Wind-Säulen (Schweinchen), die obere mit Tür, die nur
    aufgeht, wenn der Affe oben auf dem Turm Druckplatte 8 hält; Ziel auf dem Turm (410).
  - Level 6 „Feuerberg“ (levels/level-6.json, 520 Spalten, Thema vulkan, das SCHWERSTE Level, alles mit dem Koop-Bot
    geprüft; neues Element Sprungpilz): 1) Pilz-Sprünge über die Lava: 2 Kästchen schmale Säulen mit je zwei Pilzen,
    die hinteren bröckeln, Abstand 10 (in der Luft voll nach rechts halten); 2) Pilz-Jagd: Hebel 2 öffnet das Tor gleich daneben
    (und Tür 2 am Ende) – startet aber die Stachelwand (4,5), über zwei Mauern nur per Pilz, Bröckelboden, Pilzsäule mitten in der Lava, Tür 2 am Ende;
    3) geheime Kammer: Tür 3 öffnet nur Druckplatte 3, die in einer versteckten Kammer über der Decke liegt – hinein
    nur mit dem Sprungpilz durch eine Scheindecke; drüben Platte 3 für den Partner; 4) über der Lava: Affe springt per
    Pilz an zwei hohe Haken, landet auf der nächsten Pilzsäule und nimmt zwei weitere Haken; Schweinchen nimmt den
    ersten Pilz und fliegt dann von Wind-Säule zu Wind-Säule; 5) Feuerschlot: im Kamin (Breite 4) öffnet Hebel 5
    oben das Ausgangstor – und startet steigende Lava (2,0) – beide per Wandsprung nach oben (mit kurzer Denkpause knapp); 6) Pressen-Gang: vier
    Stachelpressen im niedrigen Gang, Bröckelboden genau darunter – nicht unter einer Presse springen, nicht stehen
    bleiben; 7) Finale am Vulkangipfel: Hebel 7 öffnet das Kratertor – und lässt die Lava im Krater steigen (1,15); Affe Pilz -> Haken -> Sims ->
    Pilz -> Haken -> Gipfel, Schweinchen Wind -> Sims -> Pilz -> Wind -> Gipfel; Ziel auf dem Gipfel (432).
  - Jeder Hebel hat einen Grund (Test hebel_haben_grund): jeder Hebel / jede Druckplatte bewirkt etwas, und ein
    Hebel, der eine Gefahr startet (Stachelwand, steigende Stacheln/Lava), öffnet immer auch ein Tor, durch das man
    muss – „ich muss ihn ziehen, sonst komme ich nicht weiter, aber dann wird es gefährlich“.
  - Startmenü: alle sechs Levelkarten sind jetzt echte Levels (Dschungel, Baumkronen, Ruinen, Mondnacht, Kristallhöhle,
    Feuerberg); kein „Coming soon“ mehr.
  - Alle Levels benutzen nur Verknüpfungen 1–20 (mehr kann der Editor nicht einstellen; Level 2/3 umnummeriert).
    Seit Ausbau 2 kann der Editor 1–60; die Farben ab 21 erzeugt das Spiel automatisch (Test verknuepfungen_bis_60).
  - Alle neuen Levels (2/3) folgen denselben Regeln wie Level 1 (nur blaue/pinke Münzen, keine Münzen in Steinen,
    Haken-Radius ≤ 5, eindeutige Wege); jede Stelle wurde mit einem Test-Bot im echten Spiel durchgespielt.
  - Das frühere vom Nutzer hochgeladene „Level 3“ heißt jetzt „Level 3 (alter Entwurf)“
    (levels/level-3-alter-entwurf.json), unverändert, am Ende der Levelliste.
  - LEVEL-THEMEN (Nutzerwunsch: jedes Level sieht anders aus; js/10a-themen.js, Level-Feld "theme"):
    Ein Thema ändert NUR das Aussehen (keine Physik): Himmel (Sonne/Mond/Sterne), alle 4 Hintergrund-Ebenen,
    Farben von Boden, Wand, Bröckelboden, Moos, Plattform-Holz und Pflanzen, Vögel, welche Tiere vorkommen,
    Licht-Teilchen, Wetter, Lichtstrahlen, Farbstich und ob es dunkel ist.
      dschungel = Dschungel am Morgen (wie bisher; Level 1)
      abend     = Baumkronen im Abendrot: violett-oranger Himmel, tiefe Sonne, Silhouetten-Wald, Aras/Tukane,
                  Glühwürmchen-Lichter (Level 2)
      ruinen    = Tempelruinen am Mittag: Stufentempel/Stupas in der Ferne, Säulen und Bögen, Sandstein-Wände,
                  trockenes Gras, Eidechsen (flitzen davon), Tauben/Spatzen, Fledermäuse unter Vorsprüngen (Level 3)
      nacht     = Mondnacht: Mond + Sterne, dunkelblau, Eulen, Glühwürmchen, Leuchtpilze, Fledermäuse; DUNKEL –
                  um Figuren, Münzen, Haken, Hebel, Checkpoints, Ziel und leuchtende Tiere bleibt es hell (Level 4)
      hoehle    = Kristallhöhle: Tropfsteine, leuchtende Kristalle (leuchten heller, wenn man nah ist; kein Ton,
                  Klingeln bleibt den Münzen vorbehalten), unterirdischer Wasserfall, Leuchtmoos, keine Vögel,
                  kein Regen; noch dunkler (Level 5)
      vulkan    = Feuerberg: roter Himmel, Vulkan mit Lavaströmen und Rauch, Lavafall, verkohlte Bäume, Basalt-Wände
                  mit glühenden Fugen, Glut-Funken steigen auf, Asche rieselt statt Regen, Feuer-Salamander (Level 6)
    Neue Tiere: Glühwürmchen, Eidechse, Kristall, Fledermaus (flattert weg, kommt später zurück). Ohne "theme" = Dschungel.
    Editor: Auswahl „Thema“ oben in der Leiste (wird gespeichert, exportiert, beim Testen benutzt; Editor-Fläche
    in der Grundfarbe des Themas). Test level_themen.
  - NEUE ELEMENTE (für schwere Koop-Rätsel ab Level 4; Spiel-Format: plates, winds, bouncers, solids type 'fake'):
      Druckplatte (plates {x,y,link}): Verknüpfung ist AN, solange mindestens eine Figur darauf steht; runter ->
        AUS (Tür schließt, sobald niemand mehr drin steht; Bewegung hält an). Eine Figur hält, die andere geht durch.
        Gold-Steinplatte mit Nummer, sinkt beim Draufstehen ein; Klack-Ton. Gleiche Nummer nicht zusätzlich für
        einen Hebel benutzen. Bewegte Teile/Haken „per Schalter“ funktionieren auch mit Druckplatten.
      Aufwind (winds {x,y,w,h}): trägt das Schweinchen mit offenem Schirm nach oben (WIND_LIFT 1,15, höchstens
        WIND_MAX_UP 6,5 px/Schritt), auch wenn sie gerade steigt; Schirm-Zeit beginnt im Wind von vorn. Den Affen
        trägt er NICHT. Sichtbar als heller Streifen mit aufsteigenden Schlieren und Blättchen.
      Scheinwand (solids type 'fake', im Spiel in fakeWalls): sieht exakt aus wie Wand (nahtlos mit echten
        Wänden), liegt ÜBER Hebeln/Münzen und versteckt sie; keine Kollision (man läuft hindurch, kein Wandsprung).
        Steht eine Figur drin oder direkt davor, wird sie halb durchsichtig.
        Kein Verrat durch Deko: auf Flächen direkt unter einer Scheinwand wächst kein Moos/Gras, keine Pflanzen/Vögel,
        und an Wandseiten daneben keine Ranken (Scheinwände zählen für die Deko als fest; Test scheinwand_ohne_moos_verrat). In dunklen Themen leuchten versteckte
        Hebel/Münzen nicht durch.
        Dezentes Glitzern (Nutzerwunsch: „ein bisschen erkennen, nicht zu auffällig“): je Kästchen ein kleiner
        heller Funkelstern an fester Stelle, der etwa alle 3 s kurz weich aufblitzt (16 % der Zeit, Deckkraft
        höchstens 55 %); auch in dunklen Leveln sichtbar; ist die Wand durchsichtig (Figur davor), kein Glitzern
        (drawFakeGlints in 12-welt-zeichnen.js; Test scheinwand_glitzert).
      Sprungpilz (bouncers {x,y} Fußpunkt): nur wer von oben darauf springt/fällt, wird hochgeschleudert
        (einfach drüberlaufen tut nichts – Nutzerwunsch)
        (BOUNCE_V -17,2 ≈ 5,8 Kästchen; Wandsprung danach wieder möglich), Pilz staucht sich, Quietsch-Ton.
    Tests neue_elemente, editor_neue_werkzeuge.
  - ELEMENT-REGISTER (Ausbau 2, elemente/): Hebel (hebel.js), Tür (tuer.js) und Druckplatte (druckplatte.js) stehen
    ebenfalls im Register (Daten, Editor-Knopf in „Schalter & Logik“, Editor-Zeichnen, Export mit Nummer, ✓-Markierung,
    Kopieren/Neu-Nummerieren, Spiel-Laden, Spiel-Zeichnen von Hebel und Platte; die Tür wird als Wand mit den Wänden
    gezeichnet). Die Schalt-Logik der Nummern bleibt gemeinsam in js/05-level-objekte.js. Aussehen unverändert
    (Bilder an den Hebel-/Tür-/Platten-Stellen aller Level verglichen: identisch).
  - ELEMENT-REGISTER (Ausbau 2, elemente/): Sprungpilz (elemente/sprungpilz.js) und Aufwind (elemente/aufwind.js) stehen
    je in EINER Datei mit Daten-Feld, Editor-Werkzeug (Knopf in der Gruppe Bewegung, Zeichnen, Export), Spiel-Laden,
    Spiel-Zeichnen und Spiel-Logik (Sprungpilz nach dem Bewegen, Aufwind beim Segeln). Spiel und Editor laden dieselben
    Dateien. Verhalten und Aussehen unverändert (Startbilder und Pilz-/Aufwind-Stellen der Levels per Screenshot
    verglichen: identisch; Editor-Export aller Level Byte für Byte gleich). Test element_register; Checkliste
    „Neues Element hinzufügen“ in CLAUDE.md.
  - WECHSELBODEN (Ausbau 4, elemente/wechselboden.js; Spiel-Feld switchFloors [{x, y, w, h, gruppe 'A'|'B', link | takt}],
    im Spiel solids type 'wechsel'): Boden-Kästchen in zwei gegenläufigen Gruppen.
      Per Nummer (Hebel oder Druckplatte): Gruppe A ist fest, solange die Nummer AUS ist, Gruppe B, solange sie AN ist –
        ein Hebelzug tauscht also A und B. Plakette mit Nummer (eine je Reihe, bei Säulen oben) wie bei Türen.
      Takt-Variante: wechselt von selbst alle X Sekunden (1,5 / 2 / 3 / 4 / 6), A und B abwechselnd; 1 Spielsekunde vorher
        blinkt der Boden (immer schneller) und drei leise Holz-Ticks warnen; kleine Uhr am Anfang jeder Reihe.
      Aussehen: A türkis mit schrägen STREIFEN, B orange mit PUNKTEN (unterscheidbar auch ohne Farbe); nicht fester Boden
        ist ein gestrichelter „Geist“ mit zartem Muster (man sieht, wo er wieder erscheint); kurzes Aufleuchten beim Wechsel.
      Sicherheit (Entscheidung Ausbau 4): Steht eine Figur dort, wo Boden gerade fest werden soll, wartet GENAU dieses
        Kästchen (pulsierender Umriss), bis sie weg ist – wie eine Tür, die erst schließt, wenn niemand darin steht.
        Niemand wird eingeklemmt oder durch den Boden geschoben. Verschwinden geht sofort (dann fällt man, wie beim
        Bröckelboden). Gilt auch beim Neustart/Checkpoint (Takt-Uhr beginnt dort wieder bei 0, Hebel aus).
      Ton: erscheinen = weicher Holz-Klack, verschwinden = Wusch nach unten (nur wenn im Bild).
      Welche Rolle haben Affe und Schweinchen? Per Hebel/Druckplatte: einer schaltet bzw. hält die Platte, der andere läuft
        über den Boden, der gerade da ist – keiner kommt allein durch, wenn A und B klug verteilt sind. Im Takt: das
        Schweinchen „wartet“ mit offenem Schirm in der Luft, bis die nächsten Steine erscheinen; der Affe wartet am Haken
        hängend oder überbrückt mit dem Seil. Keine Figur wird überflüssig.
      Testlevel levels/test/wechselboden.json (index.html?testlevel=wechselboden). Tests wechselboden, editor_wechselboden.
  - TELEPORTER (Ausbau 4, elemente/teleporter.js; Spiel-Feld teleporters [{x, y (Fußpunkt), paar, fuer, link?}]):
      Immer zwei Tore gehören zusammen (Paar-Nummer + Farbe, Nummer unten am Tor). Wer hineinläuft/-springt/-fällt
        (deutlich im Tor-Kästchen), kommt sofort beim Partner heraus – automatisch, ohne Taste.
      Regeln (festgelegt in Ausbau 4): Schwung bleibt erhalten (Tempo und Richtung gleich) · hängt der Affe am Seil,
        LÖST sich das Seil (der Haken bleibt zurück), der Schwung fliegt mit · der Schirm bleibt offen, das Schweinchen
        segelt drüben weiter · Abklingzeit 1 Spielsekunde je Figur UND erst wieder, nachdem man das Tor einmal verlassen
        hat (kein Hin-und-her) · ist der Ausgang zu (Wand/Tür/Wechselboden darin) oder wäre man zu weit vom Partner weg
        (Abstandsgrenze der Kamera), passiert nichts.
      Optional „nur Affe“ (blaues Inneres + „A“) oder „nur Schweinchen“ (pink + „S“), sonst für beide (weiß).
      Optional per Verknüpfung (Hebel/Druckplatte): an, solange die Nummer an ist; aus = graues Tor ohne Wirbel;
        Plakette mit der Nummer über dem Tor wie bei Türen.
      Effekt: Funken-Ring und Sterne an beiden Toren, Tor blitzt auf; Ton „Luft-Sog – Plopp – Luft-Stoß“ (kein Klingeln).
        Die Kamera springt nicht hart, sie gleitet wie immer weich zum neuen Ziel (09-kamera.js).
      Welche Rolle haben Affe und Schweinchen? „nur Affe“/„nur Schweinchen“ trennt die Wege (jeder hat seinen eigenen
        Durchgang und muss drüben oft dem anderen helfen); per Hebel muss einer das Tor für den anderen anschalten. Ein
        Ausgang in der Luft ist für das Schweinchen ein Segel-Start, der Affe braucht dort einen Haken. Keine Figur
        wird überflüssig, weil Teleporter keine Fähigkeit ersetzen, nur Wege verbinden.
      Testlevel levels/test/teleporter.json (index.html?testlevel=teleporter). Tests teleporter, editor_teleporter.
  - EINSEITIGE PLATTFORM / STEG (Ausbau 4, elemente/einseitig.js; Spiel-Feld oneways [{x, y, w, h=12}], im Spiel solids
    type 'oneway'): Holzsteg mit Fugen und Stützen.
      Von unten (und von der Seite) springt/läuft man hindurch; von oben landet und steht man darauf (fest ist nur die
        Oberkante, und nur für Figuren, deren Füße vor dem Schritt darüber waren – collideAxis in 04-figuren-kollision.js).
      Kein Wandsprung an seiner Seite (zählt nicht als Wand), keine Decke beim Hochspringen; die Seil-Sicht geht
        hindurch (Haken über einem Steg bleiben erreichbar); bewegte Teile schieben nicht gegen ihn.
      Kein „Runterfallen per Taste“: wer runter will, läuft über die Kante.
      Ton: beim Landen auf dem Steg zusätzlich ein kurzes Holz-Knarzen.
      Welche Rolle haben Affe und Schweinchen? Beide nutzen ihn gleich – er verkürzt Wege nach oben und gibt Landeplätze
        für Segel- und Seilflüge. Er ersetzt keine Fähigkeit: an Stegen gibt es keinen Wandsprung, der Affe kommt durch
        seine Seil-Sicht weiter an Haken darüber, das Schweinchen segelt auf ihn hinunter. Keine Figur wird überflüssig.
      Testlevel levels/test/einseitig.json (index.html?testlevel=einseitig). Tests einseitige_plattform, editor_einseitige_plattform.
  - WASSER UND SCHWIMMEN (Ausbau 5, elemente/wasser.js; Spiel-Feld waters [{x, y, w, h}], im Spiel wasserBecken;
    Werte in js/02-physik-werte.js SWIM_*, LUFT_*):
      Schwimmen: steckt die Körpermitte im Wasser, schwimmt die Figur frei in alle Richtungen – Links/Rechts wie
        Laufen, Hoch/Runter = Affe W/S, Schweinchen ↑/↓, Controller Stick/Steuerkreuz hoch/runter (dieselben Tasten wie
        Seil ranziehen/geben). Springen = Schwimmstoß nach oben (SWIM_KICK 5,2); an der Oberfläche springt man damit aus
        dem Wasser (SWIM_JUMP_OUT −11,4, reicht ca. 2 Kästchen hoch auf einen Rand). Ohne Taste treibt man langsam nach
        oben (Auftrieb SWIM_AUFTRIEB 0,07), Wasser bremst (SWIM_DRAG 0,9), Höchsttempo SWIM_MAX_SPEED 3,6 (Laufen 4,4).
        An der Oberfläche treibt man ruhig mit dem Kopf über Wasser (kräftiger Auftrieb in den obersten SWIM_OBEN_ZONE
        16 px, gedämpftes Wippen). Am Grund kann man stehen und laufen.
      Unter Wasser: KEIN Haken (G tut nichts, ein hängendes Seil löst sich beim Eintauchen) und KEIN Schirm (Num 1 tut
        nichts), kein Wandsprung. Einzel-Fähigkeiten unter Wasser gibt es auf Nutzerwunsch erst einmal nicht.
      Luft je Figur: 12 Spielsekunden (LUFT_MAX 720 Schritte). Sie sinkt, solange die Nase unter Wasser ist; an der
        Oberfläche (Nase draußen) ist sie in 1 s wieder voll (LUFT_AUFFUELLEN). Anzeige: 6 kleine Blasen über dem Kopf,
        sobald Luft fehlt; in den letzten 3 s (LUFT_WARN 180) blinken sie rot und es tickt jede Sekunde ein „Blubb“.
        Luft leer = Tod (zurück zum Checkpoint, danach volle Luft).
      Aussehen: Wasser liegt halb durchsichtig VOR den Figuren (hell oben, dunkler in der Tiefe), Oberfläche mit
        weichen Wellen und heller Linie (registriert als zeichnenVorne).
      Ton: Platschen beim Ein- und Auftauchen (lauter bei Tempo), „Blubb“-Warnung, tiefes Luftholen beim Auftauchen.
      Welche Rolle haben Affe und Schweinchen? Beide schwimmen gleich gut; ihre Land-Fähigkeiten fallen unter Wasser
        weg, deshalb zählt dort die Zusammenarbeit (gemeinsame Luftblase, Hebel/Schleusen) – keine Figur ist überflüssig.
      Tests wasser_schwimmen_luft, editor_wasser.
      GEMEINSAME LUFTBLASE (Nutzerwunsch: gemeinsame Fähigkeit statt Einzel-Fähigkeiten): Schwimmen beide dicht
        zusammen (Mitte zu Mitte höchstens BLASE_ABSTAND 80 px = 2 Kästchen) und jeder drückt seine Fähigkeitstaste
        (Affe G, Schweinchen Num 1, Controller □), entsteht um beide eine Luftblase. Nicht genau gleichzeitig nötig: ein
        Druck „ruft“ 0,75 s lang (BLASE_RUF; kleines Bläschen mit Herz über dem Kopf, leises Blubb). In der Blase atmen
        beide (Luft füllt sich wie an der Oberfläche, voll in 1 s). Sie wächst mit dem Abstand der beiden (mindestens
        BLASE_RADIUS 46 px) und hält ohne Zeitlimit, bis sie weiter als BLASE_HALTEN 130 px auseinander schwimmen, einer
        das Wasser verlässt oder stirbt – dann platzt sie (Ring + Tröpfchen, Plopp).
        Animation: wächst mit kleinem Nachfedern, wabbelt weich, Regenbogen-Schimmer am Rand, Glanzpunkt, kreisende
        Glitzer, aufsteigende Bläschen und Herzchen; beim Entstehen Herzchen-Funken und „Blubb-blubb-blubb“.
        Rolle: Luft reicht allein 12 s – lange Tauchgänge schafft man nur zusammen (beide müssen zusammen bleiben).
        Test wasser_luftblase.
      STRÖMUNG (elemente/stroemung.js; Spiel-Feld currents [{x, y, w, h, dx, dy, staerke}]): schiebt Figuren, deren
        Körpermitte im Wasser in der Strömung liegt, in ihre Richtung (→ ← ↑ ↓). Stärke 1/2/3 (STROEMUNG_KRAFT 0,15 pro
        Stufe): gegen „schwach“ schwimmt man gut an, gegen „mittel“ nur knapp, gegen „stark“ gar nicht; ohne Taste treibt
        man mit (höchstens SWIM_MAX_SPEED + STROEMUNG_EXTRA 4). Sichtbar als fließende helle Striche (nur im Wasser).
      WASSERSTAND / SCHLEUSE (Spiel-Feld waterLevels [{x, y, link}]): Marke mit Verknüpfungs-Nummer über oder in einem
        Becken. Ist die Nummer AN (Hebel = bleibt an; Druckplatte = Schleuse, nur solange jemand draufsteht), steigt
        bzw. sinkt das Wasser des Beckens weich (WASSER_PEGEL_TEMPO 1 px pro Schritt, 1 Kästchen in ~0,7 s) bis zur
        Oberkante der Marke; AUS = zurück auf den gemalten Stand. Beim Steigen wachsen die obersten Wasser-Rechtecke nach
        oben. Zarte gestrichelte Linie in der Farbe der Nummer zeigt das Ziel, Plakette mit Nummer wie bei Türen,
        tiefes Gurgeln beim Anlaufen. Neustart/Tod: Wasser wieder auf dem gemalten Stand.
      Rolle (Strömung/Schleuse): einer legt den Hebel um oder hält die Schleuse, der andere schwimmt hindurch; starke
        Strömungen trennen Wege oder tragen beide schnell weiter.
      Tests wasser_stroemung_pegel, editor_stroemung_pegel.
      Optik unter Wasser (nur Zeichnen): je Wasser-Rechteck bis zu 3 schräge, sanft wandernde Lichtstrahlen von der
        Oberfläche, bis zu 10 aufsteigende Bläschen, Atem-Bläschen über dem Kopf von Figuren unter Wasser.
        Leistung gemessen: Wasser-Zeichnen kostet ca. 0,7 ms pro Bild (Testlevel, Tunnel mit Strömung im Bild).
      Ton unter Wasser gedämpft: Tiefpass hinter allen Geräuschen und der Musik (js/07 audioOut) – ein Kopf unter Wasser
        WASSER_TON_EINER 2600 Hz, beide WASSER_TON_BEIDE 900 Hz, sonst klar; weich überblendet; neues Level, Neustart und
        Startmenü machen den Ton wieder klar. Schwimmstoß = leiser Wasser-Wusch.
      Welt „Wasser“ vorbereitet: eigener Look „Lagune“ (THEMES.wasser: türkiser Himmel, bläulicher Dunst, Sand statt Erde,
        Seegras-Moos, Möwen; Welt-Look in WORLD_LOOKS), in levels/worlds.json mit "look": "wasser" und Hinweis, noch ohne
        Level (Weltkarte zeigt sie als „Bald“).
      Testlevel levels/test/wasser.json (index.html?testlevel=wasser): Becken zum Üben, Tauch-Tunnel mit Strömung gegen
        die Schwimmrichtung (allein reicht die Luft nicht – nur mit Luftblase), Strömung nach oben, Schleuse per Hebel bis
        zur Linie, danach aus dem Wasser auf den hohen Rand springen. Test wasser_testlevel_ton_welt.
  - PACKAGES & COSMETICS (js/26-kosmetik-daten.js, 27-kosmetik-zeichnen.js, 28-packages.js, css/packages.css):
      Rein optisch – KEIN Spielvorteil (Tempo, Sprung, Kollision, Münzen, Level unverändert; Test cosmetics_kein_vorteil).
      Vergabe: pro geschafftem Level je Figur 1 Package, +1 wenn ALLE Münzen des Levels gesammelt (max. 2).
        Affe und Schweinchen haben ihr eigenes Inventar. Gespeichert im Browser (monchichi_cosmetics_v1).
      Gewinner-Animation im Statistik-Bildschirm „Level geschafft“: jede Figurenkarte hat eine Zeile „Packages“
        (darunter „Ziel geschafft“ bzw. „Ziel + alle Münzen“); nach dem Hochzählen von Münzen/Toden regnet Konfetti,
        je Karte fällt ein kleines oranges Geschenkpaket mit weichem runden Leuchten herein (pulsiert bei jedem Zählschritt), und ein eigener Zähler je Figur zählt
        einzeln hoch (0 → 1 → 2), jeder Schritt mit Aufploppen und aufsteigendem Glockenton.
      Öffnen: freiwillig – im Statistik-Bildschirm Knopf „Packages öffnen (n)“ neben „Weiter“ („Weiter“ ist
        vorausgewählt), oder später in der Levelauswahl über den eigenen Menüpunkt „Packages öffnen“.
        Ungeöffnete bleiben im Inventar. Der Packages-Bereich ist nie gesperrt (auch ohne Packages erreichbar).
      Münz-Konto + Paket kaufen: am Levelende kommen die selbst gesammelten Münzen jeder Figur auf ihr Konto
        (Affe blau, Schweinchen pink; gespeichert in cosmeticsSave.coins). Hat eine Figur keine Packages mehr, steht
        auf ihrer Seite ein blasses Paket und der Knopf „Paket kaufen · 200 Münzen“ (PACKAGE_PRICE in 26); Springen
        oder Klick kauft (Konto −200, Paket fällt herein). Zu wenig Münzen: Knopf zeigt „noch X“, Wackeln + Hinweis.
        Kontostand steht oben in der Kopfzeile jeder Seite (Münze in Figurenfarbe).
        Bildschirm geteilt: links Affe, rechts Schweinchen, beide gleichzeitig mit ihrer eigenen Springen-Taste
        (Spieler 1: Leertaste/✕, Spieler 2: Enter/✕), oder Klick auf die Hälfte. Esc/„Fertig“ zurück (nicht mitten im Öffnen).
        Paket-Look (aktuell): modern und glatt – Hochglanz-Orange mit weichem Lichtreflex, feinen hellen Lichtkanten statt
        dicker Umrisse, braunes Satinband mit Glanz; leuchtet orange (pulsiert). Wartet es auf das Öffnen, „tanzt“ es
        alle 2,6 s: drei Hüpfer mit Kippeln, der Deckel lugt hoch und Licht blitzt heraus, leises Klopfen (der Inhalt
        will raus). WOW beim Aufgehen: Wusch-Ton, Deckel schießt wirbelnd nach oben weg, Lichtsäule aus dem Paket in
        der Seltenheitsfarbe, zwei Druckwellen-Ringe, Glitzer-Fontäne aus der Öffnung, leuchtendes Inneres.
        Ablauf „Geschenkpaket“ (realistisch, leicht schräg von vorn mit Vorderseite, Seite und Deckel-Oberseite,
        oranges Papier mit feiner Struktur, dunkelbraunes Satinband mit Schleife, Licht von oben; 1,3× groß; weicher
        Schatten nur unter dem Paket auf dem Boden – beim Hüpfen bleibt er unten; früher eine Nuss, dann bunte Pakete): fällt herein → wackelt immer stärker (Klacker-Ticks,
        steigender Spannungston), Bandfasern fliegen → das Band spannt sich und franst an der Deckelkante aus, der
        Deckel drückt nach oben, Licht dringt aus dem Spalt (zuletzt in der Farbe der Seltenheit) → Band reißt
        („Schnapp“), Deckel fliegt weg, Band- und Papierfetzen, Funken, Blitz → Figur erscheint mit dem Item → Seltenheit + Name + „Neu!“/„Doppelt ×n“ → „Anlegen“ / „Behalten“.
        Je seltener, desto größer: längeres Wackeln, mehr Funken, ab Selten drehende Lichtstrahlen und Sterne,
        ab Episch Bildschirmwackeln und Akkord, ab Legendär Konfetti-Regen und großer Schriftzug, Prestige mit
        Regenbogen-Strahlen und schwebendem Chor-Akkord. Leer: Rauchwolke, Deckel hebt sich nur müde und kippt zur Seite, eine Fliege
        summt heraus, trauriges „Wah-wah-wah-waaah“, kurzer trockener Spruch, Knopf „Weiter“.
      Seltenheiten: Leer 10 %, Gewöhnlich 42 %, Ungewöhnlich 25 %, Selten 13 %, Episch 7 %, Legendär 2,5 %, Prestige 0,5 %
        (Farben grau, weiß, grün, blau, lila, gold, pink/Regenbogen).
      Duplikate: Gewöhnlich/Ungewöhnlich erlaubt (fehlende bevorzugt); Selten/Episch nur, wenn alles dieser Stufe
        schon da ist (dann lieber ein fehlendes einer tieferen Stufe); Legendär/Prestige nie (dann ein fehlendes
        Item der nächsttieferen Stufe).
      60 Items in 6 Slots (je Slot eins angelegt; auf Nutzerwunsch entfernt: Kategorie „Anhängsel“, Kategorie „Kugel-Skin“
        (samt Prestige Galaxie und Blitzkugel), Ei, Eiswürfel, Schatten-Aura): Roll-Spur (je schneller, desto mehr; ALLE Spuren nur beim Rollen am Boden – nicht im Stehen, nicht im Sprung/Flug;
        das Regenbogen-Band nur auf gerollten Strecken), Aura, Begleiter (folgt,
        hüpft beim Springen mit, Leerlauf-Animation; Geist/Fledermaus/Roboter schweben), Kreisende Objekte (seltener =
        mehr Objekte), Sonnenbrillen (GROSS und auffällig auf den Augen, kräftige Rahmen: Coole Sonnenbrille, Retro, Piloten,
        Gitter, Herz, 3D, Stern, Cyber-Visier mit Lauflicht, Gold-Bling mit Funkeln) und Tattoos (Tribal-Muster über die
        GANZE Figur inkl. Ohren, Augen und Mund/Nase bleiben frei: Tribal-Streifen, Punkte-Tribal, Wellen-Tribal, Zacken-Tribal,
        Flammen-Tribal, Maori-Spiralen, Drachen-Tribal, Dornenranke mit Rosen, Glühende Runen (pulsiert)) – beide sitzen fest
        auf der Figur und rollen mit (Augen-/Kopf-Positionen gemessen an den Figurenbildern, FACE_SPOTS in 27; das Tattoo-Muster
        wird einmal je Figur auf deren Form zugeschnitten und dann nur noch darübergelegt). Prestige: Saturn,
        Riesenblase, Inferno, Regenbogen (mit Funkeln).
        Alles funktioniert bei voller 360°-Drehung (Test cosmetics_zeichnen_rollfest); Partikel/Begleiter laufen im
        festen Takt (cosmeticsStep in stepSim).
      Levelauswahl: oben rechts neben dem Titel zwei eigene Menüpunkte im modernen Kachel-Stil ohne Emojis
        (Linien-Icons): „Packages öffnen“ (Geschenk-Icon mit Zahl, darunter „Affe x · Schweinchen y“; ohne Packages
        „Packages – Kaufen für 200 Münzen“, öffnet trotzdem) und „Umkleide“ (Kleiderbügel-Icon, „x / 120 Items gesammelt“). Sie liegen so hoch,
        dass sie sich nie mit den Figuren über der gewählten Levelkarte überschneiden. „Fortschritt x / 6“ steht
        jetzt unten rechts. ▲ wählt „Packages öffnen“, ◀ ▶ wechselt zur Umkleide, Springen öffnet, ▼ zurück zu den
        Levelkarten; E / Num 1 / □ / △ oder Klick öffnen die Umkleide direkt. Hinweise ohne Emojis.
      Umkleide (früher „Sammlung“, nur zum Ausrüsten):
        Je Figur (umschalten mit E / Num 1 / □):
        Fortschritt modern und aufgeräumt: Ring mit Prozent + „Sammlung x / 60 Items gesammelt“, darunter je Seltenheit
        Farbpunkt, Name, Zahl und dünner leuchtender Balken (zwei Spalten), Slot-Reiter mit x/y, Kacheln mit Bild – auch alle GESPERRTEN
        Items mit Namen, grau und dunkel mit gezeichnetem Schloss und gestricheltem Rahmen in der Seltenheitsfarbe; „Angelegt“, „×n“ bei
        Duplikaten; Springen legt an bzw. ab; gesperrte lassen sich nicht anlegen (Wackeln).
        Große Vorschau: die Figur rollt mit allen Cosmetics hin und her. (Packages werden nicht hier geöffnet.)
      Tests packages_wahrscheinlichkeiten, packages_duplikate, packages_vergabe, packages_oeffnen, sammlung_ausruesten,
        packages_menue_design.
```
  - GESCHICHTE / SPIELSZENEN (Ausbau 6, js/29-story.js, Texte in story/story.json):
      Entführer: Baron Krähwald – eine eitle Krähe mit Sonnenbrille und rotem Schal (Krähen lieben Glänzendes: er klaut
        die Zahnräder vom Wolken-Fernrohr des Professors; als Vogel kann er den Professor einfach wegtragen; passt zu
        „süß und cool“). Professor Uhu: kleine Eule mit Brille und Laborkittel. Jeder Boss ist ein Handlanger des Barons
        und bewacht ein Zahnrad (5 Zahnräder, 5 Welten).
      Intro „Die Nacht der Sternschnuppe“: Bühne mit Dschungel am Abend, Kino-Balken oben/unten, Titel, Sprechblasen mit
        Namen (Farbe je Figur), Figuren bewegen sich (Krähe fliegt herein, klaut die Zahnräder, packt den Professor,
        fliegt davon; Affe und Schweinchen gehen los), Geräusche (Krähe, Klau-Glitzern). Springen (Leertaste, Num 0,
        Enter, Controller ✕) blättert weiter, Esc / Options / ○ überspringt alles. Spiel steht still (menuScreen 'szene'),
        Anzeigen oben sind ausgeblendet, Kamera steht fest (kameraFest in 09-kamera.js).
      Läuft beim allerersten „Spielen“ (nach der Spielerwahl, vor Level 1; gemerkt in monchichi.introGesehen – auch ein
        neues Spiel zeigt sie nicht wieder); jederzeit über den Hauptmenü-Punkt „Geschichte“ (danach zurück ins Menü).
      story/story.json: Namen der Figuren, je Szene Titel, Welt/Tageszeit, Startplätze und Schritte (wer + text, geh,
        dauer, aktion, ton, von) – Texte lassen sich dort ändern, ohne Code. Test intro_szene.
  - ENDGEGNER-GERÜST (Ausbau 6, elemente/boss.js; Spiel-Felder boss [{x, y, typ, name, treffer, tempo, siegSzene,
    startSzene, phasen: [{treffer, angriffe, pause, schildDauer}]}], bossPlaetze [{x, y, phase, link}], bossArena [{x}];
    Werte BOSS_* in js/02-physik-werte.js):
      Boss-Level: feste Kamera an der linken Arena-Grenze (kameraFest), kein Ziel – gewonnen wird durch den Sieg.
      Zustandsautomat aus den Level-Daten: je Phase Platz, Treffer, Angriffe (Reihenfolge), Pause zwischen Angriffen,
        Schild-Nummer; Zustände Auftritt (1,5 s still) → Warten ↔ Angriff → Wechsel (Sprung zum Platz der nächsten Phase,
        unverwundbar) → Besiegt. Angriffe: „kokos“ (3 Kokosnüsse auf die Figuren, vorher Warn-Schatten am Boden und ▼ oben),
        „kokosregen“ (6, breiter gestreut), „stampf“ (ausholen, Sprung, Druckwelle läuft am Boden nach links und rechts –
        drüberspringen; endet an Wänden/Podesten). Kokosnüsse fallen durch Stege (einseitige Plattformen).
      Treffer NUR zusammen: Der Boss trägt einen Helm (Bruno: Kokos-Schale). Solange die Schild-Nummer der Phase AN ist
        (Druckplatte/Hebel mit dieser Nummer), schwebt der Helm (mit der Nummer) über ihm – dann zählt ein Sprung auf den
        Kopf (Treffer-Boing, Sterne, kurz unverwundbar). Mit Helm prallt man nur ab (hohles „Tock“). schildDauer > 0: ein
        Hebel klappt nach so vielen Sekunden von selbst zurück (Helm wieder drauf).
      Berührung des Boss-Körpers, Kokosnuss oder Druckwelle = Tod. Checkpoint pro Phase: nach dem Tod startet die AKTUELLE
        Phase von vorn (Boss an seinem Platz, volle Treffer, Schilde aus); Phasenwechsel zeigt „Checkpoint · Phase n von m“.
        R / Neustart = Kampf von Phase 1.
      Lebensbalken oben in der Mitte: Name, Untertitel, Treffer der aktuellen Phase als Segmente (Phase 3 rot), Phasen-Punkte.
      Sieg: Boss taumelt mit Sternchen und lässt sein Zahnrad fallen; wer es berührt, startet die Sieges-Szene in der
        Arena (story/story.json, z. B. boss1_sieg), danach „Level geschafft“. Start-Szene (startSzene) nach dem Vorhang.
      Menü: Welten haben in worlds.json "boss": "<datei>". Die Boss-Karte der Welt-Seite ist gesperrt, bis alle Level der
        Welt geschafft sind („Boss freigeschaltet!“ mit Schloss-Animation), dann „Bereit“ → Spielerwahl → Vorhang „Boss“;
        besiegt = „✓ Besiegt“ (nochmal spielbar). Eine Welt mit Boss gilt erst mit besiegtem Boss als geschafft – erst dann
        öffnet die nächste Welt (Weltkarte mit Freischalt-Animation). Spielstand: save.bosse (Welt-ids).
      Tests boss_geruest, boss_angriffe, editor_boss; Testlevel levels/test/boss.json.
  - BOSS 1: BRUNO, DER KOKOS-GORILLA (Dschungel; levels/boss-1.json + editor-format, in worlds.json "boss" der Welt
    Dschungel, in levels.json versteckt): Arena 37 Kästchen breit, Dschungel am Abend, Wände links/rechts bis in den Himmel.
      Aufbau: Podest links mit Druckplatte 1, Podest rechts mit Druckplatte 2, Ast (Steg) in der Mitte hoch oben
        (Reihe 8), zwei Haken links/rechts über dem Ast (Radius 10,5 Kästchen – vom Boden erreichbar), Aufwind rechts vom Ast
        bis in den Himmel, daneben ein hoher Sims mit Hebel 3.
      Phase 1 (3 Treffer): Bruno steht in der Mitte am Boden, wirft Kokosnüsse und stampft (Druckwellen). Helm ab, solange
        jemand auf Platte 1 (links) steht – die andere Figur springt ihm auf den Kopf.
      Phase 2 (3 Treffer): Bruno springt auf den Ast; Kokosnüsse + Stampfen (Wellen laufen unten am Boden). Helm ab mit
        Platte 2 (rechts). Auf den Ast kommt der Affe nur per Haken-Schwung, das Schweinchen nur per Aufwind + Segeln.
      Phase 3 (3 Treffer, wütend: rote Augen, roter Balken): Kokos-Regen (6) + Stampfen, kürzere Pausen. Helm ab mit Hebel 3
        auf dem hohen Sims (am besten per Aufwind) – der Hebel klappt nach 5 s von selbst zurück, also muss der Treffer
        schnell kommen.
      Welche Rolle haben Affe und Schweinchen? Immer einer am Schalter, einer am Kopf: Phase 1 beliebig verteilt, Phase 2
        Platte rechts + Aufstieg per Seil ODER Aufwind, Phase 3 meist Schweinchen am Hebel (Aufwind), Affe am Kopf (Seil).
        Allein ist Bruno nicht zu schaffen (Platte/Hebel und Kopf sind weit auseinander).
      Schwierigkeit (Ziel 5–10 Versuche): 9 Treffer in 3 Phasen, Checkpoint pro Phase; Warnzeit der Kokosnüsse 0,9 s,
        Wellen mit Sprung leicht zu meiden; kniffligster Teil ist Phase 3 (5-Sekunden-Fenster). Nach Feedback justierbar
        (Treffer/Tempo im Editor am Boss-Marker, Pausen/Angriffe in BOSS_TYPEN bzw. den Level-Daten).
      Story: Start-Szene „Boss: Bruno, der Kokos-Gorilla“ (Bruno, Affe, Schweinchen; das Schweinchen erklärt den Helm-Trick),
        Sieges-Szene „Zahnrad 1 von 5“ (Baron Krähwald schimpft mit Bruno und fliegt davon). Danach öffnen die Ruinen.
      Test boss1_bruno.
  - WELT DSCHUNGEL (Ausbau 7; Design in WELTEN.md):
    - Welt-Look als Eintrag in der Welt-Definition: levels/worlds.json, Welt „dschungel“ hat jetzt
      "aussehen": {basis, zeit, himmel, ambiente}. Das Spiel übernimmt ihn beim Laden der Welten
      (weltAussehenUebernehmen in js/10a-themen.js, ersetzt den Eintrag in WORLD_LOOKS).
      - Ohne den Eintrag gilt wie bisher der feste Eintrag in WORLD_LOOKS.
      - ambiente = Grundlautstärke von Vögeln, Grillen und Fluss dieser Welt (1 = wie bisher).
    - Tageszeiten färben jetzt auch den Vordergrund (TIME_LAYERS.terrain). Vorher blieben Boden und Wände nachts
      taghell.
      - abend: Boden, Wände, Moos und Bröckelboden 45 % zur Abendrot-Palette hin, Pflanzen mit Abend-Filter.
      - nacht: 60 % zur Mondnacht-Palette hin, Pflanzen mit Nacht-Filter; zusätzlich Fledermaus statt Faultier (zu
        Eulen und Glühwürmchen).
      - morgen und mittag bleiben wie bisher.
      - Gilt für alle Welten mit Himmel, die über welt + tageszeit aussehen. Alte Levels mit "theme" sind unverändert.
    - Ambiente je Tageszeit (THEME.ambiente; js/22 Grillen, js/23 Vogel- und Fluss-Aufnahme):
      | Tageszeit | Vögel | Grillen |
      |---|---|---|
      | morgen | 1 | 0 |
      | mittag | 0,8 | 0 |
      | abend | 0,4 | 0,6 |
      | nacht | 0 | 1 |
      - Bei alten Levels (ohne welt/tageszeit) ändert sich nichts.
    - Freischaltung: Ein Level einer Welt ist auch offen, wenn das Level davor geschafft ist. So öffnen neu
      eingefügte Level in alten Spielständen, ohne dass man das vorige Level nochmal spielen muss.
    - Tests: dschungel_welt_look (jede Tageszeit × jedes Wetter), neues_level_in_welt_offen, schichten_tageszeit_wetter
      (Nacht-Boden jetzt abgedunkelt).
    - Welt Dschungel hat jetzt 4 Level + Bruno: Dschungel (Level 1), Baumkronen (2), Lianenschlucht (7), Glühwald (8).
      Weltkarte zeigt „x / 4 Level“; Bruno öffnet erst, wenn alle 4 geschafft sind. Alte Spielstände: wer Level 2 schon
      geschafft hat, für den ist Lianenschlucht sofort offen; schon offene Ruinen bleiben offen.
      Angepasste Tests (Erwartungen von 2 auf 4 Dschungel-Level): welten_laden, welten_freischaltung,
      weltkarte_und_navigation, menue_projekt_levels, spielstand_migration (Levelnummern jetzt über die Datei),
      editor_rundreise_alle_level (8 Level), boss1_bruno, level2_und_3_regeln (Welt + Tageszeit statt Thema erlaubt),
      hebel_haben_grund (Wechselboden und Teleporter zählen als Wirkung), editor_level_info (nächste freie Nummer).
    - Level 7 „Lianenschlucht“ (levels/level-7.json, Dschungel Level 3, mittags, Dauerregen, 800 Spalten). Seit dem
      Abschluss in worlds.json hinter Level 2 („Baumkronen“), vor Bruno. Etappe 1 (Spalten 0–200): Steg-Treppe über die Mauer
      (beide), Seil-Aufzug (Affe zieht sich am Haken auf den Sims, Hebel 1 öffnet Tür 1), Segel-Schlucht (nur das
      Schweinchen segelt rüber zu Hebel 2, der fährt die Plattform mit dem Affen), Kamin (beide). Etappe 2 (200–400): Brunnen (Hebel 3 hängt tief über den
      Stacheln – der Affe lässt sich am Seil herunter, J, zieht sich hoch und schwingt weiter; Tür 3), Felsdecke (das
      Schweinchen segelt im Tunnel unter dem Felsen zu Hebel 4, der Affe zieht sich am Haken auf den Felsen, Tür 4 oben),
      Schleuse mit Graben (Druckplatte 5 auf beiden Seiten hält Tür 5 offen; über den Graben segelt das Schweinchen, der
      Affe nimmt den Haken), Bröckel-Steine (beide). Etappe 3 (400–600): Pilz-Kreuzung (vor einer breiten
      Stachelgrube: das Schweinchen prallt vom Pilz hoch und segelt zur unteren Landung mit Hebel 6 – öffnet Tür 6 oben;
      der Affe prallt hoch und nimmt zwei Haken auf den oberen Sims mit Hebel 7 – öffnet Tür 7 unten), fahrende Haken
      (Schweinchen steigt über Stege auf den Turm und segelt zu Hebel 8 am anderen Ufer; erst dann fahren die zwei Haken,
      an denen der Affe rüberkommt – Zeitpunkt abpassen), Pilz-Treppe (drei Pilze auf Säulen, beide). Etappe 4 (600–800): Lianen-Staffel
      (Meister-Stelle: das Schweinchen steigt über Stege aufs Blätterdach und segelt über zwei Lücken, der Affe hangelt
      unten an Haken über die Stachelgrube zu zwei Säulen; Hebel 9/11 auf dem Dach öffnen die Türen des Affen, Hebel 10/12
      auf den Säulen die Türen des Schweinchens – nur abwechselnd geht es weiter), Finale (zwei Pilze auf die Äste, die
      letzte Schlucht segelt das Schweinchen, der Affe nimmt zwei Haken; Ziel auf dem Gipfel, Spalte 795). 16 Checkpoints,
      142 Münzen (71 blau / 71 pink). Test level7_lianenschlucht
      (Koop-Bot tests/koop_bot.js spielt die Stellen nach).
    - Level 8 „Glühwald“ (levels/level-8.json, Dschungel Level 4, nachts, trocken, 700 Spalten; Meister-Level vor Bruno).
      In worlds.json hinter Level 7. Etappe 1 (Spalten 0–130, Wechselboden lernen): Segel-Brücke (das Schweinchen segelt vom Baumstumpf
      über die Grube zu Hebel 1 – die Brücke B erscheint für den Affen), Haken-Tor (der Affe zieht sich am Haken auf den
      Sims, Hebel 2 lässt die Wand A verschwinden), Takt-Steine (A/B wechseln alle 2 s; springen, wenn es blinkt).
      Etappe 2 (130–300, Teleporter lernen): Tor 1 für beide durch den Felsen; blaues und pinkes Tor (das pinke Tor bringt
      das Schweinchen über Mauer 1 auf einen Sims mit Hebel 3 = Tür 3 für den Affen, das blaue Tor den Affen über Mauer 2
      zu Hebel 4 = Tür 4 für das Schweinchen); Teleporter-Schleuse (Tor 4 über die breite Grube geht nur, solange jemand
      auf einer Druckplatte 5 steht – je eine an jedem Ufer).
      Etappe 3 (300–480, Kombi): Luft-Tor (der Affe zieht sich am Haken auf den Sims, Hebel 6 schaltet Tor 5 an; dessen
      Ausgang liegt hoch über der Stachelgrube – das Schweinchen segelt hinaus, der Affe greift sofort zwei Haken),
      Wechsel-Schleuse (Druckplatte 7 oben auf einem Haken-Sims und drüben am Boden: Brücke B erscheint, Wand A
      verschwindet – einer hält, der andere geht), Takt-Steine 1,5 s und eine letzte weite Lücke (segeln / Haken).
      Etappe 4 (480–700, Meister-Stelle vor Bruno): Doppel-Gang-Staffel (der Affe nimmt das blaue Tor in den oberen Gang
      auf der Steinplatte, das Schweinchen läuft unten; Wände A versperren beide Gänge, jeder Hebel öffnet die Wand im
      ANDEREN Gang: unten 9 -> oben, oben 10 -> unten, unten 11, oben 12, unten 13; oben Stacheln mit Haken darüber, unten
      Gruben zum Segeln; Checkpoint mitten im unteren Gang, ein zweites blaues Tor bringt den Affen nach einem Tod wieder
      hinauf), Takt-Tempeltreppe (A/B-Steine steigen Stufe für Stufe an, 1,5 s; Haken helfen dem Affen) und Tor 7 zum
      Tempeltor (Ziel, Spalte 694). 700 Spalten, 14 Checkpoints, 110 Münzen (55 / 55). Test level8_gluehwald.

  - FALLE (Ausbau 7, Welt Ruinen; elemente/falle.js, Spiel-Feld traps [{x, y, art: pfeil|flamme, richtung: r|l|o|u,
    takt (s), versatz (0…¾), link?}]): Stein-Kopf in einem Kästchen (fest wie eine Wand) mit Gesicht zur Schussrichtung.
    - Pfeil: zu Beginn jedes Takts fliegt ein Pfeil los (8 px pro Schritt), bis er auf Stein, eine Tür oder Wechselboden
      trifft. Er bleibt kurz stecken; durch Stege und Scheinwände fliegt er hindurch. Trifft er eine Figur, stirbt sie.
    - Flamme: brennt die ersten 40 % jedes Takts bis zu 3 Kästchen weit (Stein stoppt sie); wer hineingerät, stirbt.
    - Vorwarnung 45 Schritte vorher: Der Pfeil-Schlitz glüht (erst gelb, dann rot), die Flammen-Düse raucht und glüht,
      dazu ein leises Stein-Klicken.
    - Versatz verschiebt den Takt nach hinten (Rhythmus aus mehreren Fallen).
    - „per Nummer aus“: Solange die Verknüpfung an ist (Hebel oder Druckplatte), ist die Falle still und grau.
    - Takt-Uhr fallenSchritte: Bei Levelstart, Neustart und Tod beginnt sie neu – immer erst die Warnung, dann der Schuss.
      Werte FALLE_WARN, PFEIL_*, FLAMME_* in 02-physik-werte.js.
    - Sound: Sehne/Holz-Tock + Zischen (Pfeil), dumpfes „Wuff“ (Flamme), Stein-Klicken (Warnung).
    - Editor: Werkzeug „Falle“ (Gruppe Gefahren) mit Auswahl Art, Richtung, Takt (1,5–4 s), Versatz, an/aus. Klick auf
      eine vorhandene Falle dreht die Richtung.
    - Testlevel levels/test/falle.json; Tests falle_pfeil_flamme, editor_falle. hebel_haben_grund zählt „Falle aus“ als
      Wirkung.
    - Welche Rolle haben Affe und Schweinchen? Der Affe wartet am Seil hängend den Takt ab oder schwingt durch die
      Lücke. Das Schweinchen segelt langsam und lässt Pfeile unter sich durch. Oft stellt einer per Hebel die Fallen für
      den anderen ab.

  - ROLLENDER FELS (Ausbau 7, Welt Ruinen; elemente/fels.js, Spiel-Feld boulders [{x (Mitte), y (Unterkante), link,
    richtung: r|l, tempo}]): großer runder Sandstein (Durchmesser 2,5 Kästchen, mit Rissen und Moos).
    - Start: Er wartet, bis seine Verknüpfung AN geht (Hebel oder Druckplatte), und rollt dann los, auch wenn die Nummer
      wieder aus geht.
    - Rollen: Er wird schneller bis zu seinem Tempo (langsam 3,6 / mittel 4,4 / schnell 5,4; FELS_* in 02-physik-werte.js)
      und dreht sich dabei. Er fällt über Kanten, landet auch auf Stegen und nimmt Stufen bis 12 px mit. Bröckelboden
      unter ihm bricht los.
    - Ende: An einer Wand, einer geschlossenen Tür oder einer höheren Stufe zerschellt er (Geröll-Wolke). Fällt er aus
      dem Level, ist er weg.
    - Berührung bedeutet Tod. Nach Tod oder Neustart liegt er wieder am Start und wartet.
    - Sound: Grollen beim Losrollen, Rumpeln je Umdrehung, Aufprall, Zerschellen.
    - Editor: Werkzeug „Rollender Fels“ (Gruppe Gefahren, mit Verknüpfung) mit Richtung und Tempo. Klick auf einen
      vorhandenen Fels dreht die Richtung.
    - hebel_haben_grund: Ein Fels zählt als Gefahr; ein Hebel, der ihn startet, muss auch ein Tor öffnen.
    - Testlevel levels/test/fels.json; Tests fels_rollt, editor_fels.
    - Welche Rolle haben Affe und Schweinchen? Einer startet die Flucht, beide müssen weg: Der Affe flieht nach oben an
      Haken, der Fels rollt darunter durch. Das Schweinchen segelt über Gruben, in die der Fels fällt.

  - LICHT (Ausbau 7, Welt Ruinen; elemente/licht.js). Spiel-Felder: lichtquellen [{x, y, richtung}],
    spiegel [{x, y, stellung: / oder \}], kristalle [{x, y, link}].
    - Lichtquelle: eine Sonnen-Scheibe im Stein, fest wie eine Wand. Sie schickt einen Strahl Kästchen für Kästchen in
      ihre Richtung (bis 80 Kästchen weit).
    - Was den Strahl stoppt: Stein, geschlossene Türen, Wechselboden und Fallen. Stege, Scheinwände und Figuren lässt er
      durch.
    - Spiegel (/ oder \): lenkt den Strahl um 90° um. Beide Figuren drehen ihn mit der Hebel-Taste (J / Num 2 / Kreis),
      wenn kein Hebel näher ist. Er dreht sich sichtbar, dazu ein Stein-Schaben.
    - Lichtkristall: Solange der Strahl darauf fällt, ist seine Nummer AN, wie eine gedrückte Druckplatte (Türen auf,
      Bewegung fährt …). Er leuchtet, Ton: warmes Aufrauschen bzw. Verwehen (kein Klingeln).
    - Strahl: goldene, leicht pulsierende Linie mit Funkeln.
    - Neustart und Tod: Die Spiegel stehen wieder wie im Editor gesetzt.
    - Einbau ins Verknüpfungs-System (js/05): Der Kristall wirkt in updatePlates über lichtWunsch; die Hebel-Taste ohne
      Hebel in Reichweite dreht einen Spiegel (spiegelBedienen).
    - Editor: Werkzeuge „Lichtquelle“ (Richtung), „Spiegel“ (Stellung; Klick wechselt sie) und „Lichtkristall“ (mit
      Verknüpfung) in der Gruppe Schalter & Logik. Eine gestrichelte gelbe Linie zeigt den Strahl schon im Editor.
    - Testlevel levels/test/licht.json; Tests licht_spiegel_kristall, editor_licht.
    - Welche Rolle haben Affe und Schweinchen? Spiegel stehen dort, wo nur der Affe (Haken) oder nur das Schweinchen
      (segelnd) hinkommt. Einer lenkt das Licht, der andere geht durch die Tür, die der Kristall öffnet.

  - WELT RUINEN – Look (Ausbau 7; Design in WELTEN.md): levels/worlds.json, Welt „ruinen“ hat jetzt
    "aussehen": {basis: ruinen, zeit: mittag, himmel, ambiente: Vögel 0,6 · Grillen 0,5 · Fluss 0,4} (Tempel: weniger
    Vögel, leise Grillen auch am Tag, Fluss nur fern).
    - Zur natürlichen Tageszeit (mittag) gibt es dafür eine Kopie des Ruinen-Looks mit diesem Ambiente
      („ruinen@mittag~amb“); Welten ohne eigenes Ambiente bleiben genau beim Welt-Look.
    - Die übrigen Tageszeiten wie im Dschungel: Boden und Wände abends/nachts dunkler, nachts Eulen und Glühwürmchen.
    - Fallen-Köpfe und Lichtquellen nehmen im Spiel die Wandfarben des Levels an, nachts also auch dunkler.
    - Alte Level mit theme „ruinen“ (Level 3) sind unverändert. Test ruinen_welt_look.

  - Level 9 „Fallengang“ (levels/level-9.json, Ruinen Level 3 der Welt, morgens, wechselndes Wetter, 806 Spalten): bis
    es fertig ist in levels.json versteckt.
    - Etappe 1 (Spalten 0–200):
      - Pfeil-Vorhänge: Fallen in der Decke schießen nach unten; warten, bis der Pfeil unten ist (beide).
      - Flammen-Tunnel: Das Schweinchen segelt unter dem Felsen durch zwei Flammen-Vorhänge. Hebel 1 oben auf dem Felsen
        (Affe, per Haken) stellt die Flammen ab und öffnet Tür 1 am Ausgang. Hebel 2 unten (Schweinchen) öffnet Tür 2
        oben für den Affen.
      - Flammen-Welle: Neun Flammen zünden nacheinander; vor jeder warten (beide).
      - Takt-Steine (2 s).
    - Etappe 2 (Spalten 200–400):
      - Pfeil-Galerie: von einem hohen Turm (Stege) über die Stachelgrube; eine Falle in einem schwebenden Pfeiler
        schießt quer. Das Schweinchen segelt, der Affe nimmt drei Haken – beide im Takt.
      - Flammen-Schleuse: Vier Flammen aus dem Boden; Druckplatte 3 an jedem Ende stellt sie ab, solange jemand
        draufsteht.
      - Pfeil-Schacht: hinab, Pfeile schießen quer aus beiden Wänden. Das Schweinchen segelt langsam, der Affe passt den
        Moment ab.
      - Pfeil-Gang mit Hebeln über Kreuz: In den niedrigen Gang mit Pfeil-Vorhängen kommt nur das Schweinchen (Grube
        davor). Hebel 4 oben auf der Decke (Affe) stellt die Pfeile ab und öffnet Tor 4 am Ende. Hebel 5 im Gang
        (Schweinchen) öffnet Tür 5 oben für den Affen.
    - Etappe 3 (Spalten 400–600):
      - Deckung: Unten schießt eine Falle quer durch den Gang. Der Affe steht oben auf der Decke und schaltet mit
        Hebel 6 die Deckungen A/B um (Wechselboden-Wände), das Schweinchen läuft von Deckung zu Deckung zu Hebel 7
        (stellt die Falle ab, öffnet Tür 7).
      - Teleporter zwischen Flammen: Das pinke Tor bringt das Schweinchen zu Hebel 8 (Flammen aus, blaues Tor an),
        das blaue Tor bringt den Affen zu Hebel 9 (Tür 9).
      - Takt-Steine (1,5 s) unter Pfeil-Vorhängen (beide).
    - Etappe 4 (Spalten 600–806, Ziel bei 795):
      - Flammen-Doppelgang (schwerste Stelle): Der Affe geht durchs blaue Tor in den oberen Gang, das Schweinchen läuft
        unten. Jeder Gang ist von Flammen-Paaren versperrt (Flammen von oben und unten im Wechsel, ohne Hebel kein
        Durchkommen). Jeder Hebel stellt ein Paar im ANDEREN Gang ab (10 → oben, 11 → unten, 12 → oben, 13 → unten,
        14 → oben). Oben Stacheln mit Haken (Affe), unten Gruben (Schweinchen segelt).
      - Rhythmus-Lauf zum Ziel: Pfeil-Vorhänge, eine Flammen-Welle (vor jeder Flamme warten), Takt-Steine (1,5 s).
    - Checkpoints höchstens etwa 60 Spalten auseinander (Ausnahme: der Doppelgang 604–680 ist ein einziges Rätsel).
    - Test level9_fallengang (Koop-Bot).

  - Level 10 „Sonnentempel“ (levels/level-10.json, Ruinen Level 4 der Welt, abends, Regen): IN ARBEIT, bis es fertig ist
    in levels.json versteckt. Schwerpunkt Licht: Spiegel, die nur einer erreicht.
    - Etappe 1 (Spalten 0–200):
      - Erster Spiegel: Der Strahl läuft über den Köpfen, der Spiegel lenkt ihn hinauf zum Kristall → Tür 1 (beide).
      - Affen-Spiegel: hoch auf einem Sims, nur per Haken erreichbar; der Kristall im Boden öffnet Tür 2 für das
        Schweinchen.
      - Schweinchen-Spiegel: Das Schweinchen segelt von der Treppe auf eine Insel und dreht den Spiegel; der Kristall lässt
        eine Brücke (Wechselboden) für den Affen erscheinen.
      - Spiegel zwischen zwei Pfeil-Vorhängen → Tür 4 (beide).
    - Etappe 2 (Spalten 200–400):
      - Zwei-Spiegel-Kette: Das Licht fällt von oben auf den Affen-Spiegel (Sims per Haken) und muss weiter zum
        Schweinchen-Spiegel auf einer Insel (nur übers pinke Tor und segelnd erreichbar) → Kristall → Tür 5. Der Affe
        schwingt an zwei Haken über die Grube, das Schweinchen segelt.
      - Licht-Takt: Ein Takt-Stein (1,5 s) unterbricht den Strahl, Tür 6 ist nur jede zweite Phase offen; direkt vor
        der Tür fällt ein Pfeil im Takt (nicht an der Tür warten!).
      - Flammen-Tunnel mit Kristall: Das Schweinchen hält Druckplatte 7 (ein Trittstein erscheint), der Affe springt
        darauf, greift den Haken und dreht oben den Spiegel → der Kristall stellt die Flammen im Tunnel ab.
    - Etappe 3 (Spalten 400–600):
      - Zwei Wege: oben (Haken, Stacheln) der Affe, unten (Grube) das Schweinchen. Das Schweinchen öffnet über das pinke
        Tor und Spiegel 8 die obere Tür 9 für den Affen; der Affe dreht am Ende des oberen Wegs Spiegel 9 → untere Tür 10.
      - Spiegel-Kette unter Pfeilen: drei Boden-Spiegel müssen richtig stehen (zwei feste Spiegel oben lenken den Strahl
        im Zickzack); über jedem hängt eine Pfeilfalle – drehen und schnell weg (beide).
      - Flammen-Gang: Flammen aus dem Boden als Welle – das Schweinchen läuft der Welle nach, der Affe nimmt das blaue Tor.
    - Test level10_sonnentempel (Koop-Bot).

## Level-Editor (editor/)
```
  MONCHICHI LEVEL-EDITOR – FUNKTIONSLISTE
  - Aufbau (Ausbau 2): editor/index.html lädt editor/js/01-zustand, 02-werkzeuge, 03-zeichnen, 04-export,
    05-levelliste, 06-github, 99-start (früher eine editor.js) – Verhalten unverändert: alle Projekt-Level laden und
    wieder exportieren ergibt dieselben Level-Daten wie in levels/ (Test editor_rundreise_alle_level).
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
  - Verknüpfungen 1–60 (Ausbau 2; früher 1–20) in „Verknüpfung“ und „per Schalter“; neben „Verknüpfung“ ein Feld
    „Name (optional)“: gibt der gewählten Nummer einen Namen (z. B. „Tor zum Turm“), der in beiden Auswahlen hinter der
    Nummer steht (vor den ✓-Markierungen), im Arbeitsstand/Editor-Format gemerkt wird (linkNames) und beim Kopieren
    mit der neuen Nummer mitgeht. Nur zur Übersicht – ins Spiel geht nur die Nummer. Test editor_verknuepfungen_60_mit_namen.
  - Rückgängig / Wiederholen (Ausbau 2, editor/js/08-auswahl.js): Strg+Z / Strg+Y (auch Strg+Umschalt+Z) und Knöpfe
    ↶ ↷ oben; jede Änderung ist ein Schritt, ein gezogener Pinselstrich zählt als EIN Schritt; bis 200 Schritte.
    Laden eines Levels / Neues Level beginnt einen frischen Verlauf. Auch Level-Info-Änderungen sind rückgängig machbar.
  - Rechteck-Auswahl (Werkzeug „Auswahl ⬚“ neben Radieren): Rechteck aufziehen (gelb gestrichelt); Strg+C kopieren,
    Strg+X ausschneiden, Strg+V fügt an der Maus ein (Mauskästchen = linke obere Ecke), darin ziehen = Inhalt
    verschieben, Entf = Inhalt löschen, Esc = Auswahl aufheben. Mit allen Objekten: Kästchen (auch Scheinwand/Aufwind),
    Haken (mit Bewegung), Hebel, Türen, Druckplatten, Pilze, Stacheln, Münzen, Checkpoints, bewegte Stücke (wenn ihr
    Anker-Kästchen in der Auswahl liegt). Start ♂/♀ und Ziel gibt es nur einmal: beim Kopieren nicht dabei, beim
    Verschieben wandern sie mit. Einfügen einer Kopie: Verknüpfungs-Nummern, die es im Level schon gibt, werden neu
    vergeben (nächste freie Nummer); alle Teile mit derselben Nummer bekommen dieselbe neue (Hebel, Tür, Bewegung und
    Haken bleiben zusammen). Ausschneiden + Einfügen und Verschieben behalten die Nummern. Test editor_rueckgaengig_und_auswahl.
  - Werkzeug-Gruppen (Ausbau 2): oben eine Zeile mit Thema/Name/Knöpfen, darunter die Werkzeuge in einklappbaren
    Gruppen – Gelände (Boden, Wand, Bröckelboden, Scheinwand) · Gefahren (Stacheln + Spitzen) · Schalter & Logik
    (Schalter, Tür, Druckplatte + Verknüpfung) · Bewegung (Haken + Radius, Aufwind, Sprungpilz, Bewegung ➜ + Tempo/per
    Schalter) · Sammeln (Münze + Farbe) · Markierungen (Checkpoint, Start ♂/♀, Ziel); Radieren steht immer daneben.
    Klick auf den Gruppennamen klappt sie ein/aus (▾/▸), gemerkt im Browser (monchichi_editor_groups). Test editor_werkzeug_gruppen.
  - Haken-Werkzeug auf bestehenden Haken = Radius übernehmen; Reichweiten-Kreis wird angezeigt
  - Level wächst nach rechts automatisch mit, „+20 Spalten“-Button, Mausrad scrollt seitlich
  - „Alles löschen“ und „Neues leeres Level“ entfernen wirklich alles (auch Druckplatten, Sprungpilze und Namen der
    Verknüpfungen – bis Ausbau 2 blieben Druckplatten und Pilze stehen); „Alles löschen“ behält die Level-Info und ist
    mit Strg+Z rückgängig machbar. Test editor_alles_loeschen_wirklich_alles.
  - Bestätigungen (Löschen, Alles löschen, Neues Level, Laden/Überschreiben bei ungespeicherten Änderungen) per
    2. Klick direkt am Button (armConfirm) bzw. 2. Speichern – KEIN confirm()/alert(): ist im Artifact blockiert!
  - Levels speichern/laden/löschen mit Namen (Artifact-Datenbank, Collection "levels"), Strg+S
  - Arbeitsstand-Autosave im Browser (localStorage)
  - Plattform-Werkzeug bewusst entfernt (Nutzerwunsch, Boden reicht); alte Plattform-Kacheln in
    gespeicherten Levels werden weiter angezeigt/exportiert und lassen sich radieren
  - Export im Spiel-Format (Textfeld kopieren oder als .json-Datei speichern)
  - Zwei Formate (Ausbau 2, Entscheidung): ausgeliefert wird weiter die Spiel-Datei (levels/<datei>); die Editor-Datei
    (levels/editor-format/<datei>) ist der Bau-Stand. Das Spiel liest die Editor-Datei NICHT direkt (sonst würde ein
    zweiter Umrechner bestimmen, wie die Level im Spiel aussehen) – „☁ Auf GitHub speichern“ schreibt beide im selben
    Commit, und der Test projekt_levels_beide_formate_gleich prüft für jedes Level ALLE Felder (Kästchen, bewegte Teile,
    Haken, Münzen, Hebel, Türen, Druckplatten, Pilze, Aufwind, Start/Ziel) und dass Aussehen und Wetter gleich wirken.
    Die Notlösung „Level laden (JSON)“ mit einer Editor-Datei übernimmt jetzt auch Welt/Tageszeit/Wetter/Look.
  - Neue Werkzeuge: Scheinwand (Kachel, gestrichelt mit „?“; im Spiel durchlaufbar), Aufwind (Kachel, hellblau mit
    Pfeil; trägt das Schweinchen mit Schirm), Sprungpilz (Punkt), Druckplatte (Punkt mit Verknüpfungs-Nummer, wie
    Schalter; erscheint in den ✓-Markierungen als „Druckplatte“). Scheinwand und Aufwind lassen sich nicht bewegen.
  - Wechselboden (Ausbau 4, Gruppe „Schalter & Logik“, ziehbar): daneben die Auswahl „Gruppe“ (A ▨ türkis / B ⠿ orange)
    und „Takt“ (per Nummer oder alle 1,5–6 s). Neue Kästchen bekommen Gruppe, Takt und die gewählte Verknüpfung;
    Klick auf ein vorhandenes Kästchen tauscht A/B. Im Raster mit Muster, Buchstabe und Nummer bzw. „⏱ Sekunden“;
    ✓-Markierung „Wechselboden“ (nur für Kästchen per Nummer). Kopieren/Einfügen und Rückgängig wie bei allen Punkten.
  - Teleporter (Ausbau 4, Gruppe „Bewegung“): 1. Klick setzt ein Tor, der 2. Klick seinen Partner (gleiche Paar-Nummer und
    Farbe); eine gestrichelte Bogen-Linie verbindet die beiden, ein Tor ohne Partner zeigt „?“. Danach beginnt der nächste
    Klick ein neues Paar. Wird ein Tor radiert, wird das nächste neue Tor sein Partner. Daneben „für“ (beide / nur Affe /
    nur Schweinchen) und „an/aus“ (immer an / per Verknüpfung – nimmt die Nummer aus „Schalter & Logik“); der Partner
    übernimmt die Einstellungen des ersten Tors. Eingefügte Paare (Strg+V) bekommen eine neue, freie Paar-Nummer.
  - Boss (Ausbau 6, neue Gruppe „Boss“): „Boss“ (Startplatz, nur einer pro Level; daneben Boss-Art, Treffer je Phase,
    Tempo), „Arena-Grenze“ (zwei Marken links/rechts, gestrichelte Linie über die ganze Höhe), „Boss-Platz“ (Platz in
    Phase 1/2/3 + Verknüpfungs-Nummer = Helm-Schalter dieser Phase; Klick wechselt die Phase; ✓-Markierung „Boss-Helm“).
    Der Export schreibt die Phasen mit ihren Angriffen in die Level-Daten. „☁ Auf GitHub speichern“ trägt ein Level mit
    Boss als Boss der gewählten Welt in worlds.json ein (nicht als Levelkarte; in levels.json versteckt).
  - Wasser (Ausbau 5, neue Gruppe „Wasser“, ziehbar wie Aufwind): halb durchsichtig blau mit kleiner Welle; Export fasst
    die Kästchen zu großen Rechtecken zusammen (nebeneinander UND untereinander).
    Strömung (ziehbar): daneben „Richtung“ (→ ← ↑ ↓) und „Stärke“ (schwach/mittel/stark); im Raster Pfeil, je stärker
    desto größer/dunkler; Klick auf ein vorhandenes Kästchen dreht die Richtung. Wasserstand: Kästchen mit gestrichelter
    Oberkante, Pfeil und Nummer (Verknüpfung aus „Schalter & Logik“), ✓-Markierung „Wasserstand“.
  - Steg (einseitig) (Ausbau 4, Gruppe „Gelände“, ziehbar wie Boden): im Raster ein Brett oben im Kästchen mit Pfeil nach
    oben; Export als 12 px dicke Stege (benachbarte Kästchen einer Reihe zusammengefasst). Lässt sich nicht bewegen.
  - (früher: Auswahl „Thema“ oben – Aussehen des Levels im Spiel (Dschungel, Abendrot, Tempelruinen, Mondnacht,
    Kristallhöhle, Feuerberg) als "theme"; auf Nutzerwunsch in Ausbau 2 ersetzt durch „Level-Info“, die Themen gibt
    es dort weiter als „Look-Override“.)
  - Level-Info (Ausbau 2, Knopf „🗺 …“ oben, editor/js/07-level-info.js): Welt (aus levels/worlds.json), Position in
    der Welt (1., 2., … oder ans Ende), Titel (steht auf der Levelkarte), Tageszeit (Standard der Welt / Morgen /
    Mittag / Abend / Nacht), Wetter (wechselnd / trocken / Regen) und Look-Override (eines der alten Themen – bestimmt
    dann das ganze Aussehen, Tageszeit ist dann gesperrt). Alte Levels/Arbeitsstände mit „theme“ bekommen ihr Thema
    als Look-Override (sehen also genau aus wie vorher). Ein aus „Levels im Projekt“ geladenes Level übernimmt Welt +
    Position aus worlds.json und den Titel aus levels.json. Gespeichert im Arbeitsstand und Editor-Format (welt,
    position, titel, tageszeit, wetter, theme = Look); Export ins Spiel: welt, tageszeit (nur wenn gewählt), wetter,
    look + theme (nur mit Look-Override). Editor-Fläche in der Grundfarbe von Look bzw. Welt (abends/nachts dunkler).
    „☁ Auf GitHub speichern“ setzt das Level im SELBEN Commit in worlds.json an die gewählte Welt/Position (aus anderen
    Welten heraus) und trägt Titel bzw. ein neues Level in levels.json ein (nur wenn sich dort etwas ändert); neue
    Auswahl „➕ Neues Level N (level-N.json)“ = nächste freie Nummer. Repo-Dateien werden dafür über die GitHub-API
    im Stand genau dieses Commits gelesen. Test editor_level_info.
  - Taste Enter im Editor = „▶ Testen“ (nicht beim Tippen in ein Feld, nicht bei offenem Levels-/Export-Fenster)
  - Knopf „▶ Testen“ (gelb, oben): legt das aktuelle Level im Browser ab (localStorage monchichi_test_level,
    Spiel-Format) und öffnet sofort das Spiel damit (index.html?test=1, ohne Hauptmenü, ohne Speichern/Hochladen).
    Beide Figuren starten dort, wo man im Editor gerade baut (sichtbarer Ausschnitt, ~1/3 von links; freies Kästchen
    über festem Boden/Wand, nicht Bröckelboden/bewegt/Stacheln, unterste Ebene; Spielerin 2 daneben); das gilt auch
    als Start nach dem Sterben. Ist der Editor ganz links, normaler Start. Kamera startet gleich dort.
    Esc beendet den Test sofort (ohne Pausenmenü, auch auf dem Tod-Bildschirm) und führt zurück in den Editor –
    an die Stelle, an der die Figuren gerade stehen (hintere Figur bei ~1/3 der Ansicht, Nutzerwunsch: testen und
    gleich dort anpassen; erneut Enter startet wieder dort). Fallback: Stelle, an der „Testen“ geklickt wurde
    (editor/index.html?from=test, localStorage monchichi_editor_focus bzw. monchichi_editor_scroll); das Scrollen passiert erst, wenn das Level im Editor fertig geladen ist – vorher blieb die Ansicht auf langsamen Rechnern manchmal ganz links stehen, Ausbau 4). Options/☰ öffnen im Test das Pausenmenü mit „✏️ Zurück zum Editor (Esc)“. Fürs schnelle Ausprobieren;
    für alle sichtbar wird ein Level weiterhin erst über das Projekt (levels/).
  - ✕ oben rechts schließt den Editor und führt zurück zum Spiel (Hauptmenü); Arbeitsstand bleibt im Browser
  - Fenster „Levels“ zeigt zusätzlich „Levels im Projekt“ (aus levels/levels.json) und lädt sie per „Laden“
    aus levels/editor-format/ (nur wenn der Editor über die Webseite geöffnet ist, nicht als lokale Datei)
  - Button „☁ Auf GitHub speichern“ (Werkzeugleiste): speichert das aktuelle Level direkt ins Projekt – Spiel-Datei
    (levels/<datei>) und Editor-Datei (levels/editor-format/<datei>) in EINEM Commit nach main; GitHub Pages baut die
    Seite neu, nach 1–2 Minuten ist es online (im Spiel Strg + F5). Auswahl „Als welches Level speichern?“ (Hauptlevels
    aus levels.json; ein aus „Levels im Projekt“ geladenes Level ist vorausgewählt, gemerkt als currentProjectFile).
    Einmalig: persönlicher GitHub-Schlüssel („Fine-grained token“, nur Repo koopgame, Contents: Read and write) –
    Anleitung im Fenster; der Schlüssel liegt nur im Browser (localStorage monchichi_github_token), „Schlüssel
    entfernen“ löscht ihn. Fehler werden verständlich angezeigt (Schlüssel ungültig, keine Berechtigung, Netz).
    Nach erfolgreichem Hochladen schließt sich das Fenster nach ~1 s von selbst (Hinweis unten links im Editor).
    Mehrmals hintereinander hochladen geht (GitHub-Abfragen ohne Zwischenspeicher).
    Test editor_github_speichern (GitHub-API simuliert).
  - Button „📦 Ins Projekt aufnehmen“ (im Fenster „Levels“): lädt das aktuelle Level als zwei Dateien herunter –
    <name>.json (Spiel-Format, gehört nach levels/) und <name>.editor.json (Editor-Format, gehört nach
    levels/editor-format/ als <name>.json); Eintrag in levels/levels.json bleibt Handarbeit
```
