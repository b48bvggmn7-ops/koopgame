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
  - Im Ziel (beide da, genug Münzen): Affe und Schweinchen tanzen 4,5 s (ohne Hinweis „Beide im Ziel“ – Nutzerwunsch) (im Wechsel
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
    Fallhöhe, an den Füßen verankert), sanftes Atmen im Stehen, Staubwölkchen bei Landung/Sprung/Wandsprung.
    Entdeckung: stehen Affe und Schweinchen ~1,5 s dicht beieinander, steigen Herzchen auf (mit leisem Ton).
  - Arme, Hände, Beine, Füße (Nutzerwunsch; 10-figuren-zeichnen.js, nur Anzeige): das Gesicht ist der Körper und steht
    auf zwei Beinen mit Füßen, Arme mit Händen schauen seitlich hervor (Affe braun/hautfarben, Schweinchen rosa/pink).
    Die Figuren ROLLEN NICHT MEHR wie ein Ball (früher Rollrotation), sondern laufen seitlich: Beine treten in
    Laufrichtung (Schrittphase walkPhase), Arme schwingen gegengleich, der Körper ist leicht gedreht. Haltungen: im
    Sprung Arme hoch, am Haken eine Hand am Seil, mit Schirm eine Hand am Griff. Nach 5 s Stillstand
    (IDLE_FRONT_STEPS = 300 Schritte) dreht sich die Figur nach vorn zum Spieler und winkt bzw. tanzt im Wechsel
    (je 3 s; das Schweinchen beginnt mit Tanzen); Siegestanz ebenfalls von vorn. Körper etwas kleiner (38 px breit),
    damit die Figur mit Beinen etwa so hoch bleibt wie vorher (Test figuren_arme_beine).
  - Menü-Figuren (24-startmenue.js, SVG) passend dazu: Beine mit Füßen unter dem Körper (sichtbar, wo die Figur ganz
    im Bild ist: Levelauswahl, „Level geschafft“), eine Pfote unten am Körper und die zur Bildmitte zeigende Hand
    erhoben – sie winkt alle paar Sekunden (Affe und Schweinchen versetzt).
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
  - Münzen (data.coins [{x,y}] aus dem Editor): beide sammeln gemeinsam, Zähler als Kästchen oben mittig (HTML-HUD); Ziel zählt erst
    mit 10 Münzen (oder allen, wenn weniger im Level); am Ziel Hinweis "Noch X Münzen!"; beim Sterben bleiben
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
    wählen, Springen = bereit, beide bereit → Countdown 3-2-1-Los) → „Spielen“ startet Level 1 (Fortschritt neu,
    vorher Rückfrage). „Fortfahren“ führt ERST zur Levelauswahl, nach der Wahl eines Levels kommt die Spielerwahl
    (Countdown startet dann dieses Level; Zurück führt wieder zur Levelauswahl, die Auswahl bleibt).
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
  - Tode-Duell oben rechts (25-duell.js; Nutzerwunsch „wer stirbt öfter?“, modern und schlicht): dunkle Pille mit
    Affen-Gesicht, Zahl, kleinem Totenkopf, Zahl, Schweinchen-Gesicht. Nur Tode, keine Münzen (die stehen im
    Münz-Zähler oben links). Wer mehr Tode hat: Zahl rot und das Gesicht wird mit jedem Tod Vorsprung größer (+12 % je
    Tod, höchstens +80 %); bei jedem Tod hüpft die Zahl. Zählt pro Level: Weitermachen und R lassen den Stand, ein neu
    geladenes Level beginnt bei 0 (deathCount in 01-level.js; Test tode_zaehler).
  - Beide im Ziel: während des Tanzes keine Einblendung; danach ein Statistik-Bildschirm im Stil von
    Hauptmenü/Levelauswahl („LEVEL GESCHAFFT“, Level-Nummer + Name): für Affe und Schweinchen je eine Glas-Karte mit
    Gesicht, Münzen (selbst gesammelt, / Münzen der eigenen Farbe) und Toden; Zahlen zählen hoch; Schilder
    „Mehr Münzen“ (grün) / „Mehr Tode“ (rot). „Weiter“ (Springen/Enter/✕) -> Levelauswahl.
  - Levelauswahl nach „Level geschafft“: auf der Karte des neu freigeschalteten Levels liegt ein goldenes Schloss,
    es wackelt, der Bügel springt auf und es platzt in goldene Splitter, die Karte leuchtet golden auf; danach
    „Level x freigeschaltet!“. War nichts neu freizuschalten (Level schon geschafft), geht es ohne Schloss weiter.
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
        Steht eine Figur drin oder direkt davor, wird sie halb durchsichtig. In dunklen Themen leuchten versteckte
        Hebel/Münzen nicht durch.
        Dezentes Glitzern (Nutzerwunsch: „ein bisschen erkennen, nicht zu auffällig“): je Kästchen ein kleiner
        heller Funkelstern an fester Stelle, der etwa alle 3 s kurz weich aufblitzt (16 % der Zeit, Deckkraft
        höchstens 55 %); auch in dunklen Leveln sichtbar; ist die Wand durchsichtig (Figur davor), kein Glitzern
        (drawFakeGlints in 12-welt-zeichnen.js; Test scheinwand_glitzert).
      Sprungpilz (bouncers {x,y} Fußpunkt): wer darauf landet oder drüberläuft, wird hochgeschleudert
        (BOUNCE_V -17,2 ≈ 5,8 Kästchen; Wandsprung danach wieder möglich), Pilz staucht sich, Quietsch-Ton.
    Tests neue_elemente, editor_neue_werkzeuge.
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
  - Neue Werkzeuge: Scheinwand (Kachel, gestrichelt mit „?“; im Spiel durchlaufbar), Aufwind (Kachel, hellblau mit
    Pfeil; trägt das Schweinchen mit Schirm), Sprungpilz (Punkt), Druckplatte (Punkt mit Verknüpfungs-Nummer, wie
    Schalter; erscheint in den ✓-Markierungen als „Druckplatte“). Scheinwand und Aufwind lassen sich nicht bewegen.
  - Auswahl „Thema“ (oben): Aussehen des Levels im Spiel (Dschungel, Abendrot, Tempelruinen, Mondnacht,
    Kristallhöhle, Feuerberg); gespeichert in snapshot/Export als "theme"; Editor-Fläche in der Grundfarbe
  - Taste Enter im Editor = „▶ Testen“ (nicht beim Tippen in ein Feld, nicht bei offenem Levels-/Export-Fenster)
  - Knopf „▶ Testen“ (gelb, oben): legt das aktuelle Level im Browser ab (localStorage monchichi_test_level,
    Spiel-Format) und öffnet sofort das Spiel damit (index.html?test=1, ohne Hauptmenü, ohne Speichern/Hochladen).
    Beide Figuren starten dort, wo man im Editor gerade baut (sichtbarer Ausschnitt, ~1/3 von links; freies Kästchen
    über festem Boden/Wand, nicht Bröckelboden/bewegt/Stacheln, unterste Ebene; Spielerin 2 daneben); das gilt auch
    als Start nach dem Sterben. Ist der Editor ganz links, normaler Start. Kamera startet gleich dort.
    Esc beendet den Test sofort (ohne Pausenmenü, auch auf dem Tod-Bildschirm) und führt zurück in den Editor –
    an die Stelle, an der die Figuren gerade stehen (hintere Figur bei ~1/3 der Ansicht, Nutzerwunsch: testen und
    gleich dort anpassen; erneut Enter startet wieder dort). Fallback: Stelle, an der „Testen“ geklickt wurde
    (editor/index.html?from=test, localStorage monchichi_editor_focus bzw. monchichi_editor_scroll). Options/☰ öffnen im Test das Pausenmenü mit „✏️ Zurück zum Editor (Esc)“. Fürs schnelle Ausprobieren;
    für alle sichtbar wird ein Level weiterhin erst über das Projekt (levels/).
  - ✕ oben rechts schließt den Editor und führt zurück zum Spiel (Hauptmenü); Arbeitsstand bleibt im Browser
  - Fenster „Levels“ zeigt zusätzlich „Levels im Projekt“ (aus levels/levels.json) und lädt sie per „Laden“
    aus levels/editor-format/ (nur wenn der Editor über die Webseite geöffnet ist, nicht als lokale Datei)
  - Button „📦 Ins Projekt aufnehmen“ (im Fenster „Levels“): lädt das aktuelle Level als zwei Dateien herunter –
    <name>.json (Spiel-Format, gehört nach levels/) und <name>.editor.json (Editor-Format, gehört nach
    levels/editor-format/ als <name>.json); Eintrag in levels/levels.json bleibt Handarbeit
```
