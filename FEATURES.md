# Funktionsliste – Monchichi Koop

Diese Liste beschreibt ALLES, was Spiel und Editor können. Vor jeder Änderung prüfen, dass nichts davon
verloren geht; nach jeder Verhaltensänderung hier ergänzen. Nichts entfernen ohne Rückfrage beim Nutzer.

## Spiel (index.html + js/)
```
  - Immer neueste Dateien: index.html lädt alle js/-Dateien mit ?v=<Zeit>, der Editor seine editor.js ebenso
    (kein Strg+F5 mehr nötig, nachdem eine Änderung online ist)
  MONCHICHI KOOP – SPIEL – FUNKTIONSLISTE
  - VARIABLE SPRUNGHÖHE (normaler Sprung vom Boden, Affe und Schweinchen gleich, Tastatur und Controller gleich):
    wer die Sprungtaste/den Sprungknopf während des Aufstiegs loslässt, wird sanft gebremst (JUMP_CUT_VY in
    02-physik-werte.js, Bremsen über 2–3 Schritte). Antippen ≈ 1,2 Kästchen, 55 ms ≈ 2, 130 ms ≈ 3, ab ≈ 0,19 s
    (JUMP_FULL_STEPS = 10 Schritte) genau die bisherige Höchsthöhe 134 px (≈ 3,4 Kästchen) – länger halten bringt nichts
    mehr, höher als früher geht nie (es wird nur gebremst). Erneutes Drücken in der Luft ändert nichts. Wandsprung,
    Seil-Abflug, Sprungpilz, Aufwind/Schirm und Schwimmen sind ausgenommen und unverändert. Test variable_sprunghoehe.
  - BILD-REGEL (Leveldesign, AUSBAU-REGELWERK Punkt 12): bei jedem Rätsel, jeder Schalter-Stelle und jeder Zusammenarbeit
    können beide Figuren und alles, was sie brauchen, gleichzeitig im Bild sein. Auslöser (Hebel, Druckplatte,
    Licht-Kristall/Spiegel) und Ziel liegen höchstens BILD_MAX_SPALTEN = 20 Spalten auseinander (js/09-kamera.js; die
    Kamera hält beide sicher bis ≈ 23,7 Spalten im Bild). Fahrten (bewegte Plattformen, fahrende Haken, Ein-Figur-Tore,
    Tore mit Platte/Hebel) bringen niemanden weiter als 20 Spalten vom Partner weg. Alle Level sind danach umgebaut
    (Hebel näher an ihre Tür, kürzere Fahrten/Gruben/Tunnel, Tor-Ausgänge so, dass man nebeneinander weiterläuft).
    - Ziel-Hinweis: schaltet ein Hebel oder eine Druckplatte etwas außerhalb des Bildes, zeigt ≈ 1 s lang ein kleiner
      Pfeil in der Farbe der Nummer (mit Nummer) am Bildrand dorthin. Die Kamera ändert sich dabei nicht. Test
      ziel_hinweis_pfeil.
    - Haken-Richtwerte (Koop-Bot-Messung): Abstand in einer Hakenreihe 5–6 Spalten (4–8 erlaubt), Höhe 6–7 Reihen über
      dem Absprung, freier Bogen, mindestens 3 Stehplätze zum Landen. Die zu weiten Reihen in Dschungel 1 und 2 haben
      jetzt 3 Haken im Abstand 7. Test haken_richtwerte_bot (spielt 3 Hangel-Stellen, mindestens 4 von 8 Loslass-Arten).
      (Test entfallen, als Dschungel 1+2 durch neue Nutzer-Dateien ersetzt wurden – die drei Stellen gibt es nicht mehr.)
    - Haken aufgeräumt (Nutzerwunsch: „ich stoße beim Schwingen an Boden und Wand“): Prüfwerkzeug tests/haken_pruefen.py
      (Test haken_pruefung) für alle Level – (1) freie Schwungbahn: der Affe hängt UNTER dem Seil-Ende; sein Körper darf bei
      voller und ¾ Seillänge bis ±50° nirgends anstoßen (Landen von oben zählt nicht); (2) die Reichweiten-Kreise zweier
      Haken überdecken sich nicht (Abstand ≥ Reichweite 1 + Reichweite 2; fahrende Haken nur am Startplatz). Gemessen mit
      der echten Physik: aus einem Schwung schafft der Affe bis 2,4 × Reichweite + 2,3 Spalten (Reichweite 4,5 -> 13), mit
      Schwung holen mehr – Haken-Reihen haben daher jetzt etwa 2 × Reichweite Abstand (meist 9–10 Spalten bzw. 8 bei
      Reichweite 4); die Bild-Regel erlaubt bis 90 % der Schwung-Weite. Umbau in allen Welten: dichte Reihen ausgedünnt
      (oft reicht ein Haken weniger), Kreise auf halben Abstand verkleinert, Haken neben Säulen/Kanten 1–3 Spalten versetzt
      oder etwas kleinere Reichweite, Flammen-/Lava-Kamin-Gruben mit zwei Haken 6 und 16 Spalten hinter der Kaminwand,
      Aufzug-Haken (vom Boden hochziehen auf ein Sims) durch Schleudern ersetzt. Begründete Ausnahmen (Boss-Arena Bruno,
      zwei Hochzieh-Haken ohne Schwingen) in tests/haken_ausnahmen.json.
    - Checkpoints nur nach einer Leistung und vor dem nächsten schweren Stück: 25–70 Spalten Abstand mit einer Stelle
      dazwischen, nie zwischen Hebel und Tür. Überzählige Checkpoints sind entfernt oder zusammengelegt (insgesamt
      432 -> 356); die Spielstände merken sich keine Checkpoint-Nummern (Test spielstand_ohne_checkpoints).
      Zwei Checkpoints, nach denen man bei einem Tod nicht mehr zurück zum (zurückgestellten) Spiegel gekommen wäre,
      sind versetzt bzw. entfernt (Ruinen 4 Spalte 678, Ruinen 6 Spalte 91 -> 97).
      Auch die Level-Tests prüfen jetzt „höchstens 70 Spalten“ (vorher ~60); dadurch sind in 11 Leveln weitere
      doppelte Checkpoints weggefallen (Dschungel 6, Ruinen 4, Höhle 2/3/4/6, Vulkan 1/2/4/5/7).
    - Zwischenstationen statt „einer läuft aus dem Bild“ (die früheren 8 Stellen „BRAUCHT ENTSCHEIDUNG“; nicht leichter,
      nur in Abschnitte geteilt, nach jedem treffen sich beide wieder):
      - Ruinen 1: Insel in zwei Etappen; der Hebel steht auf der Plattform bzw. Fähre und fährt mit.
        Plattformen/Fähren mit eigenem mitfahrendem Hebel zählen im Prüfwerkzeug als „Plattform (Hebel fährt mit)“.
      - Ruinen 2: Hakenreihe mit 5 Haken im Abstand 8 statt 4 Haken im Abstand 10–11.
      - Ruinen 4: Doppelstrahl-Tor geteilt (Tür 12 vor der Brücke, Tor mit Pfeil dahinter = Treffpunkt).
      - Vulkan 2 / Vulkan 5: Pressen-Doppelgang in zwei Hälften mit Treffpunkt in der Mitte, je Gang 4 statt 3 Pressen.
      - Vulkan 6: Lavafeld mit Zwischen-Insel (2 Pilze – Insel – 2 Pilze), zweites Licht und zweiter Teleporter.
      - Dschungel 3: Lianen-Haken eine Reihe höher (Reihe 6); gleiche Trefferquote im Bot-Test, kein Weg aufs Dach.
    - Prüfwerkzeug `python3 tests/bildregel_pruefen.py` (alle Level, Tabellen mit `--alle`); begründete Ausnahmen in
      tests/bildregel_ausnahmen.json (die früheren Stellen „BRAUCHT ENTSCHEIDUNG“ sind alle umgebaut). Test bildregel_pruefung
      schlägt bei jedem neuen Befund fehl.
  - KOMBI-NACHSCHÄRFEN (Wandsprung gemessen, Fähigkeiten-Kombis):
    - Wandsprung-Richtwerte mit der echten Spiel-Physik gemessen und als Konstanten in js/02-physik-werte.js
      (`KAMIN_ZU_ENG` 2, `KAMIN_BEQUEM_MIN/MAX` 3/5, `KAMIN_KNAPP_MAX` 7, `KAMIN_MAX` 8, `WAND_MIN_HOEHE` 4,
      `EINZELWAND_WEITE`, `WANDSPRUNG_SEGELN_WEITE`, `WANDSPRUNG_HAKEN_*`, `KOMBI_ABSTAND` 8); Tabelle im Regelwerk Punkt 12.
    - Alle 18 zu engen Kamine (Breite 2) in Dschungel 3, Ruinen 1, Höhle 2/3/4/5/6, Vulkan 1/4/6 sind jetzt Breite 3
      (Säule eine Spalte nach außen); Magmakammer/Feuerschlund bekamen dafür einen Wechselboden-Stein (611, Reihe 8).
    - Prüfwerkzeug `python3 tests/kombi_pruefen.py` (Tabelle Level | Spalte | Breite | Höhe | Einstufung, dazu Kombi-
      Stellen je Level und Etappe, Timing-Anteil); Test kombi_pruefung (Ausnahmen, Ketten und „Kombi-offen“ in
      tests/kombi_ausnahmen.json).
    - Kombi-Stellen in der Welt Dschungel (Pilz-Gruben: Pilz + Haken / Pilz + Segeln; Kamin-Grube und Hoher Kamin:
      Wandsprung + Haken / Wandsprung + Segeln): Dschungel 1 (88, 233, 408, 746+773), Dschungel 2 (23, 209, 386, 443, 572,
      778, 797), Dschungel 3 (70, 130, 180, 360, 390, 740, 760, 780), Dschungel 4 (125, 164, 473, 668+681; Checkpoint
      168 -> 177, Teleporter-Ausgang 668 -> 665), Dschungel 5 (Hoher Kamin 311 endet über Stacheln, Haken 317, Wandspitzen
      bröckeln), Dschungel 6 (170, 190, 392). Jede Stelle mit Koop-Bot-Lauf und Gegenprobe ohne Kombi
      (kombi_stellen_dschungel), Abkürzungs-Proben für Gruben direkt hintereinander.
    - Testlevel levels/test/kombis.json (Wandsprung + Haken, Wandsprung + Segeln; Test kombi_testlevel).
    - Ruinen, Höhle und Vulkan (Fortsetzung): Ruinen ohne Sprungpilze (Nutzerentscheidung), dafür FLAMMEN-KAMIN: kompakter
      Kamin (Breite 3, Wandspitzen bröckeln) über einer Stachelgrube (9 breit) mit Haken, über der Grube eine Flamme im Takt
      (kurz nach dem Zünden losklettern), Landeplatz 6 Reihen hoch – Ruinen 1 (522), Mondnacht (89), Fallengang (579),
      Sonnentempel (168, 303, 584), Felsenflucht (580). Höhle: Leuchtpilz-Gruben und Kamin-Gruben – Kristallhöhle (273,
      359), Tropfsteingang (266, 445), Leuchtgrotte (180, 568, 760), Förderwerk (366, 546, 570, 772), Tiefenschlund (572,
      776). Vulkan: Lava-Kamine und Lava-Pilz-Gruben (Lava statt Stacheln) – Glutpfad (185, 346, 370, 546, 570, 768),
      Aschefeld (188, 352, 376, 766), Magmakammer (44, 194, 349, 378, 558, 580, 728, 752, 776), Schlackewerk (164, 346,
      370), Feuerschlund (560), Kraterherz (182, 324). Bot-Tests kombi_stellen_ruinen / _hoehle / _vulkan (mit Kombi
      geschafft, beide nacheinander, ohne gescheitert). Wo das Soll nicht erreicht ist, steht die Begründung in
      tests/kombi_ausnahmen.json.
    - Wandspitzen aller Kamin-Gruben bröckeln (auch Dschungel 1, Spalte 746, und Testlevel kombis): kein sicherer Halt
      zwischen Wandsprung und Haken/Segeln; die zweite Figur kommt trotzdem hinauf (Bot-Probe „beide nacheinander“).
  - AUFFÄLLIGE SPIELELEMENTE (Nutzerwunsch: Hebel, Sprungpilze und Druckplatten wurden übersehen, gerade wenn man
    schnell sein muss; nur Aussehen, Wirkung und Trefferbereiche unverändert; Design passend zur Spielwelt wie die Türen:
    Holz, Eisen, Edelstein in der Verknüpfungs-Farbe):
    - Hebel (alte Größe): Holzstange mit Eisenmanschette, Edelstein-Knauf in der Hebel-Farbe, Steinsockel mit Eisenband
      und Nummern-Plakette.
    - Druckplatte (etwas breiter, so breit wie der Bereich, der wirklich drückt): Messingplatte im Eisenrahmen mit
      Nieten, zwei Edelsteine in der Verknüpfungs-Farbe und Nummer; gedrückt dunkler und abgesenkt.
      Nutzerwunsch „die Figur soll sichtbar AUF der Platte stehen“: die Platte sitzt in einer Vertiefung im Boden
      (Eisenrahmen mit Nieten) und ragt frei 8 px heraus; gedrückt sinkt sie ganz ein, ihre Messing-Oberseite liegt dann
      genau auf Bodenhöhe unter den Füßen (Edelstein bleibt sichtbar); weiche Bewegung nur in der Anzeige
      (`anzeigeDruck`, bei jeder Bildrate gleich schnell). Test druckplatte_ganz_gedrueckt.
    - Sprungpilz (dicker, so breit wie der Bereich, der wirklich federt): warmes Gold-Orange mit cremefarbenen Tupfen,
      brauner Rand, gemaserter Stiel (grün ging im Gras unter, rot sähe aus wie die Deko-Pilze).
    - Leichter, pulsierender Schein und drei Glühwürmchen in der Farbe des Elements, die langsam darüber kreisen (statt
      Pfeilen) – beim Hebel, solange er aus ist; bei der Druckplatte, solange niemand draufsteht; beim Pilz immer.
    - Im Umkreis von 4 Kästchen (DEKO_FREI_ABSTAND 160 px) stehen keine Deko-Pflanzen und keine Tiere; Frosch, Schnecke
      und Eidechse laufen/hüpfen nicht hinein (17-deko.js, 20-tiere.js). Hilfen elementLeuchten, hinweisPfeil
      (Glühwürmchen), elementEdelstein in 12-welt-zeichnen.js. Test auffaellige_elemente.
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
    (bei >70 px Dehnung gibt es Seil nach). Gelöst wird es per G loslassen (siehe Liane halten), Springen oder wenn man am Seil auf etwas LANDET
    (Boden, Wand-Oberseite, Bröckelboden, bewegter Boden …). Vom Boden aus eingehakt bleibt es dran
    (ropeWasAirborne), damit man sich mit W / Hoch hochziehen kann. Ranziehen langsamer (ROPE_PULL_SPEED 2,4)
    und ohne Schwung Richtung Haken (kein Hüpfen oben); runterlassen bis zum Rand des Reichweiten-Rings (ropeMax).
  - Abflug vom Seil (Springen oder G): Abfluggeschwindigkeit = Schwunggeschwindigkeit, KEIN künstlicher Schub
    (Nutzerwunsch: muss sich natürlich anfühlen; ein kurz eingebauter Extra-Schub/Mindest-Absprung wurde wieder entfernt).
    Springen gibt nur den kleinen Hub nach oben (HOOK_RELEASE_BOOST). Der Schwung wird danach nicht mehr gekappt/stark
    gebremst (bis ROPE_FLING_MAX 15, ohne Taste nur ROPE_FLING_DRAG 0,993 statt 0,94); Taste halten macht nicht schneller
    als normal; endet beim Landen oder an einer Wand.
  - Liane HALTEN (Nutzerwunsch): Die Haken-Taste (G / Num 1 / □) muss GEDRÜCKT GEHALTEN werden, solange der Affe am Seil
    hängt; Taste loslassen = abspringen, ohne Leertaste (js/32 lianeLoslassen; LIANE_HALTEN in 02, false = alte
    Antipp-Bedienung). Mit Schwung gibt es einen leichten Absprung-Schub in Schwungrichtung (LIANE_BOOST 1,6 px/Schritt
    + kleiner Hub LIANE_HUB −1,2), weich ansteigend ab LIANE_MIN_SCHWUNG 2,5 bis voll bei 6,5; aus dem Stand kein Schub
    (fällt einfach). Danach normaler Abflug (ropeFling). Springen am Seil löst weiterhin (mit HOOK_RELEASE_BOOST).
    Koop-Bot und Computer-Partner halten die Taste am Seil; der Bahnen-Test fährt mit der alten Bedienung
    (window.hakenTippen, Referenz unverändert). Test liane_halten_loslassen_schub.
  - Schleuder (zweites Haken-Element, Nutzerwunsch; elemente/schleuder.js, Editor-Reiter „Haken“, alle Welten): oben ein
    Haken, darunter (1–4 Reihen, Option „Ring“) ein Ring an einem Gummiband. Der Affe wirft sein Seil an den Ring (G drücken
    und halten, Reichweite SCHLEUDER_GREIF 110 px ab den Händen, eigener Kreis), läuft vom Ring weg und spannt das Seil
    wie ein Gummi (wird zum Ende zäher, höchstens SCHLEUDER_MAX 120 px; ohne Laufen zieht es ihn langsam zurück). G
    loslassen schleudert ihn zurück Richtung Ring und schräg hoch – je stärker gespannt, desto kräftiger, voll gespannt
    ca. 4,5 Reihen hoch und 6–7 Spalten weit (SCHLEUDER_VX 6, SCHLEUDER_VY −15,5); kaum gespannt (< 24 px) kein Schub.
    Springen löst ohne Schub. Gespanntes Seil = gedehnte Liane (dünner, rötlich). Ton: Haken-Klick beim Greifen,
    Gummi-Schnalzen beim Abschuss. Rolle: nur der Affe (er braucht sein Seil) – kommt so auf eine Kante und hilft oben dem
    Schweinchen (Hebel, Platte, Tür); das Schweinchen braucht einen eigenen Weg. Testlevel levels/test/schleuder.json
    (Ring direkt neben einer 4 Reihen hohen Kante), Test schleuder_spannen_und_loslassen.
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
  - Hohler Baum als Start und Ziel (nur Dschungel-Look; andere Welten: Ziel-Schild wie bisher; js/12a-hohler-baum.js):
    großer alter Baum mit abgebrochener Krone, Wurzeln, Moos, Efeu, Pilzen und einem Loch als Eingang (Tag- und Nacht-Farben).
    Er steht ganz vorne vor Boden, Wänden und Pflanzen (Nutzerwunsch), Münzen und Figuren bleiben davor sichtbar.
    Start: früher zwischen den Startplätzen; jetzt etwas links hinter ihnen (60 px vor dem linken Platz), Eingang leuchtet
    warm; stünde er vor einer Wand oder links aus dem Level, rückt er bis 160 px zur Seite.
    Nur wo im Editor Start bzw. Ziel gesetzt ist, steht ein Baum (Nutzerwunsch); ohne gesetztes Ziel bleibt das Schild.
    Wurzeln schmaler (Nutzerwunsch: ca. ±90 statt ±115 px); wo Boden/Wand höher als der Fuß des Baums in seinen Bereich ragt,
    wird der Baum dort weggeschnitten (er liegt nie über Boden/Wand, baumSperrFlaechen). Vorher sucht er einen freien Platz
    (baumFreiSuchen: erst ganzer Baum mit Wurzeln, sonst nur der Stamm; nur wo Boden unter dem ganzen Stamm ist): Start und
    Ziel bis 160 px zur Seite (Ziel vorher 60 px – reichte neben erhöhtem Boden nicht, der Baum stand „im Boden“; Warten bleibt
    am Ziel, hineingehen zum Eingang des Baums, bei größerem Abstand entsprechend schneller). Unterkante von Stamm und Eingang ohne
    Umrisslinie (lag als Strich auf dem Gras).
    Beim Testen ab einer Stelle (Editor) steht der Start-Baum am echten Start (startEchtM/F), ohne Start-Ablauf.
    Start-Ablauf (Nutzerwunsch, bei jedem Level-Start und Neustart per R/Pausenmenü; nicht nach einem Tod, nicht bei
    Testlevel-Adressen ?testlevel= und nicht in den Spielszenen – deren Bühne hat keinen Baum): erst ist die Tür zu und beide sind
    im Baum (unsichtbar), dann fährt die Tür nach oben auf (die Figuren sind nur im Eingang zu sehen), dann laufen beide
    heraus zu ihren Startplätzen (wer dort direkt im Eingang stünde, geht bis 40/70 px rechts vom Eingang) – erst dann geht
    die Steuerung an (ca. 1 s; Nutzerwunsch „schneller“, vorher ca. 2,5 s).
    Ziel: Eingang zuerst dunkel. Wer den Baum zuerst erreicht (am Boden), lässt sich nicht mehr steuern (Nutzerwunsch), geht
    bis 30 px vor den Eingang und schaut zum Partner. Sind beide da: erst tanzen beide fröhlich (Herzchen, 2,5 s), dann gehen
    sie zusammen in den Baum, der Eingang leuchtet auf und eine Holztür mit rundem Fenster fährt herunter (Licht scheint durch
    Ritzen und Fenster). Im Baum tanzen sie nicht mehr; ist die Tür zu, sind sie nicht mehr zu sehen (auch keine Herzchen,
    Nutzerwunsch). Nach 5,5 s geht es weiter wie nach dem Tanz. Fester Takt über winSteps (BAUM_* Konstanten in
    12a; Steuerung aus über P.zielWartet). Test hohler_baum_start_ziel.
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
    (Seit dem Dschungel-Paket gilt dieser Hintergrund nur noch für Looks ohne eigenen Stil, z. B. die Lagune/Wasser-Welt;
    die Dschungel-Welt hat den neuen Dschungel-Hintergrund, siehe „Dschungel-Paket“ unten.)
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
    (Dschungel Tag und Nacht seit dem Dschungel-Paket: Vögel sitzen auf den Oberseiten von Boden UND Wänden, einer je
    900 px auf der höchsten Fläche, und fliegen nicht mehr weg – siehe „Dschungel-Paket“ unten.)
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
  - Münzen einsammeln (Nutzerwunsch „schon beim leichten Berühren“): zählt, sobald die GEZEICHNETE Figur den Münzrand
    berührt (Greif-Bereich `MUENZ_GREIF_X/Y` 36/38 px um die Figur-Mitte, vorher 24/26 um die schmalere Kollisions-Box).
    Am Seil zählt die Stelle, an der der Affe gezeichnet hängt (`muenzGreifPunkt`, unter dem Seil-Ende); schnelle
    Bewegungen (Dash, Schwung) werden in 8-px-Teilschritten abgefahren, damit keine Münze übersprungen wird – aber nicht
    nach Neustart/Test-Sprung/Q (Sprung passt nicht zum Tempo). Test muenzen_greifen_grosszuegig.
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
  - Test-Hilfe im Editor-Test („▶ Testen“, Nutzerwunsch): Taste Q holt die andere Figur direkt neben die eigene (die von
    Spieler 1, Tastatur links), Hinweis „… geholt (Q)“. Nur ohne Computer-Partner – mit Partner bleibt Q „Warte hier /
    Komm her“; im normalen Spiel ohne Wirkung. Test editor_test_q_holt_partner.
  - (Artifact-Zeit) Das Spiel startete in der Artifact-Ansicht nicht, wenn der Kommentar VOR <html> > ~8 KB war.
    Im GitHub-Projekt nicht mehr relevant, Bilder liegen jetzt als Dateien in assets/.
  - Checkpoints aus dem Editor (data.checkpoints [{x,y}]): zählen erst, wenn BEIDE vorbei sind (Punkte am Mast
    zeigen, wer schon durch ist) -> Fahne geht hoch + Funken + kleine Fanfare. Automatische Pro-Figur-Checkpoints
    entfernt. Ohne erreichten Checkpoint = Start.
  - Tod (Stacheln/Absturz): Spiel pausiert, Figur verpufft; KEINE Sprüche/Sprechblasen und kein
    Kopfschütteln mehr (Nutzerwunsch; früher manchmal ein Spruch wie "Idiot!" – Liste DEATH_PHRASES bleibt im Code ungenutzt), dann "Beliebige Taste drücken" (Tastatur, Maus, JEDE Controller-Taste inkl. Options oder
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
    Level-NUMMERN zählen in jeder Welt ab 1 (Nutzerwunsch, z. B. Höhle 1–6, Vulkan 1–7 statt durchgehend bis 22):
    auf den Karten, im Blätter-Vorhang („Level 3“), im Statistik-Bildschirm („Level 3 · Feuerberg“), in den Meldungen
    „Level n freigeschaltet/geschafft“ und im Hinweis „schafft erst Level n“ (nrInWelt in 24; Test level_nummern_je_welt).
    In jeder Welt sind die Level nach Schwierigkeit sortiert (6er-Welten, Reihenfolge in worlds.json, Dateinamen bleiben):
    Dschungel = Dschungel, Baumkronen, Lianenschlucht, Glühwald, Dornenpfad, Wipfelsturm (dann Bruno);
    Ruinen = Ruinen, Fallengang, Sonnentempel, Mondnacht, Felsenflucht, Tempelherz; Höhle = Tropfsteingang, Eisgrotte,
    Kristallhöhle, Leuchtgrotte, Förderwerk, Tiefenschlund (Test welten_laden).
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
  - Austausch (Nutzerwunsch): Dschungel 1 und 2 sind jetzt die vom Nutzer im Editor gebauten Dateien (Level 2 im normalen
    Dschungel-Look, nicht mehr Abendrot). Die Beschreibungen unten gelten für die alten Fassungen. Übernommen mit
    `python3 tests/level_import.py <spiel.json> <welt>/<datei>.json` (wandelt im echten Editor in beide Formate um und prüft
    den Rückweg). Alte Stellen-Tests dieser zwei Level sind raus; Regel-Befunde stehen begründet in den Ausnahme-Listen.
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
        trägt er NICHT. Sichtbar als heller Streifen mit aufsteigenden Schlieren und Blättchen. Neues Aussehen: übereinander
        liegende Kästchen-Reihen werden beim Zeichnen zu EINER Säule zusammengefasst (`windSaeulen`, gleich breite Reihen werden zu einem Rechteck verbunden – sonst feine Linien an den Kästchen-Nähten) – eine weiche,
        an den Seiten, oben und unten auslaufende Fläche (ohne Kante und ohne Körnung: EIN kleines, je Pixel berechnetes Schein-Bild `windScheinBild` 32×128, auf die Säule gezogen – keine gestapelten blassen Schichten, die flimmern; zum unteren Teil heller, sanftes „Atmen“), darin lange, sich schlängelnde
        Luftschlieren, Funkel-Staub und taumelnde Blättchen, gleichmäßig steigend über die ganze Säule. Test aufwind_saeule.
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
      Ruinen-Überarbeitung – Schalter und Läufer: Am Hebel zeigen zwei kleine Kacheln A ▨ / B ⠿, welche Gruppe gerade fest ist
        (die feste kräftig mit weißem Rand, die andere gestrichelt). Die Geisteranzeige ist deutlicher (blasse Fläche,
        kräftiger Umriss, Buchstabe der Gruppe am Anfang jeder Reihe). Bauweise „Schalter/Läufer“: der Läufer geht durch einen
        nur 1 Kästchen hohen Gang (kein Springen, kein Segeln) über Wechselboden mit Abgrund darunter, der Schalter steht oben
        auf einer Galerie am Hebel, die der Läufer nicht erreicht (nur per Haken = Affe oder per Aufwind = Schweinchen),
        höchstens 20 Spalten vom Boden weg. Haltestellen: Inseln (A – Insel – B) oder genau die Naht zwischen zwei Gruppen
        (A-B-A ohne Insel: zu früh umgelegt = der Läufer fällt). Testlevel levels/test/wechselboden-hebel.json mit 3 Rätseln
        (Affe schaltet, Schweinchen schaltet, A-B-A auf der Naht); eingebaut im Fallengang (Spalte 366–398). Tests
        wechselboden_schalter_laeufer, wechselboden_geisteranzeige.
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
        dem Wasser (SWIM_JUMP_OUT −11,4, reicht ca. 2 Kästchen hoch auf einen Rand; danach bremst das Wasser SWIM_RAUS_SCHRITTE = 6 Schritte lang nicht – behoben: war der Kopf beim Absprung knapp unter Wasser, verpuffte der Sprung früher etwa jedes zweite Mal). Ohne Taste treibt man langsam nach
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
      unten an Haken (Reihe 6, 4 Reihen über den Säulen) über die Stachelgrube zu zwei Säulen; Hebel 9/11 auf dem Dach öffnen die Türen des Affen, Hebel 10/12
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
    - Ruinen-Überarbeitung (Lesbarkeit): Der Pfeil ist 52 px lang (vorher 35), Schaft 5 px mit 2 px dunklem Umriss, helles
      Holz, rote Federn, Stahlspitze, dazu eine helle Bewegungsspur (46 px). Nachts leuchten fliegende Pfeile, glühende
      Köpfe und Flammen ein wenig (Lichtkreis). Vorwarnung: Schein um den Schlitz und die Pfeilspitze schaut schon heraus
      (zeigt die Richtung); Flammen-Düse mit Schein und Zündflamme. Einschlag: Staub, Funken, Riss im Stein, der Pfeil
      zittert nach. Die Flamme ist sichtbar so breit wie ihre Trefferfläche (26 px; vorher lief sie zur Spitze dünn aus).
      Die Trefferfläche des Pfeils ist UNVERÄNDERT 10 × 10 px um die Spitze (PFEIL_TREFFER); die sichtbare Spitze ist 14 px
      lang und 14 px breit, der Schaft ist (wie bisher) ungefährlich. Test pfeil_lesbarkeit misst am echten Bild vor jedem
      Ruinen-Hintergrund (morgens, mittags, abends, nachts, Regen): Länge mit Spur ≥ 60 Bildpunkte und ≥ 100 Bildpunkte mit
      Kontrast ≥ 3 : 1 zum Hintergrund (vorher: Länge ≈ 29, 0–86).
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
    - Ruinen-Überarbeitung: dunkler, schwerer Granit mit dickem Umriss und Steinband (man sieht die Drehung), Schatten liegt
      auf dem Boden darunter (kleiner, je höher er ist), Staub und hüpfende Kiesel beim Rollen, beim Zerschellen fliegen
      Bruchstücke; Aufprall und Bruch lassen die Kamera kurz wackeln (kameraStoss in 09-kamera.js, nur fürs Bild).
      Fairer Start: Geht seine Nummer an, wackelt er erst ½ s (FELS_WARN) mit Staub, rieselnden Kieseln und Grollen.
      Ankündigung: Rollt er außerhalb des Bildes auf die Figuren zu, rumpelt es und am Bildrand steigt Staub mit einem
      pulsierenden Warnzeichen auf (ab 1,2 Bildbreiten Abstand, je näher, desto stärker).
      Rätsel: Er bricht durch Bröckel-Wände (Bröckelboden-Kästchen in seinem Weg) und rollt langsamer weiter – so räumt er
      einen Weg frei. Aus großer Höhe hüpft er kurz. (Keiner der vorhandenen Felsen trifft eine Bröckel-Wand – bestehende
      Level verhalten sich gleich.) Testlevel levels/test/fels-wand.json (erst Hebel 2 = Tor auf, dann Hebel 1 = Fels).
      Test fels_verhalten (Start mit Warnung, Ankündigung, Schatten, Durchbruch, Zerschellen mit Bruchstücken und Wackeln,
      Tor zu = zerschellt davor, Neustart).
    - Welche Rolle haben Affe und Schweinchen? Einer startet die Flucht, beide müssen weg: Der Affe flieht nach oben an
      Haken, der Fels rollt darunter durch. Das Schweinchen segelt über Gruben, in die der Fels fällt.

  - LICHT (Ausbau 7, Welt Ruinen; elemente/licht.js). Spiel-Felder: lichtquellen [{x, y, richtung}],
    spiegel [{x, y, stellung: / oder \}], kristalle [{x, y, link}].
    - Lichtquelle: eine Sonnen-Scheibe im Stein, fest wie eine Wand. Sie schickt einen Strahl Kästchen für Kästchen in
      ihre Richtung (bis 80 Kästchen weit).
    - Was den Strahl stoppt: Stein, geschlossene Türen, Wechselboden und Fallen. Stege, Scheinwände und Figuren lässt er
      durch.
    - Spiegel (/ oder \): lenkt den Strahl um 90° um. Beide Figuren drehen ihn mit der Hebel-Taste (J / Num 2 / Kreis),
      wenn kein Hebel näher ist. Er dreht sich sichtbar, dazu ein Stein-Schaben. Steht eine Figur davor, zeigt eine
      Tasten-Blase (J / Num 2 bzw. ○) wie beim Hebel, dass man hier drücken kann (Test aktions_hinweis).
      Aussehen (besser als Spiegel erkennbar): Standspiegel – ovaler, glänzender Spiegel (helles Glas, Glanzstreifen,
      Funkeln) in einem Goldrahmen, gehalten von einer Bronze-Gabel auf einem Steinsockel mit kleinem Drehpfeil; die
      Schräge zeigt weiter / bzw. \ und damit, wohin das Licht geht.
    - Lichtkristall: Solange der Strahl darauf fällt, ist seine Nummer AN, wie eine gedrückte Druckplatte (Türen auf,
      Bewegung fährt …). Er leuchtet, Ton: warmes Aufrauschen bzw. Verwehen (kein Klingeln).
    - Strahl: goldene, leicht pulsierende Linie mit Funkeln.
    - Neustart und Tod: Die Spiegel stehen wieder wie im Editor gesetzt.
    - Einbau ins Verknüpfungs-System (js/05): Der Kristall wirkt in updatePlates über lichtWunsch; die Hebel-Taste ohne
      Hebel in Reichweite dreht einen Spiegel (spiegelBedienen).
    - Editor: Werkzeuge „Lichtquelle“ (Richtung), „Spiegel“ (Stellung; Klick wechselt sie) und „Lichtkristall“ (mit
      Verknüpfung) in der Gruppe Schalter & Logik. Eine gestrichelte gelbe Linie zeigt den Strahl schon im Editor.
    - Testlevel levels/test/licht.json; Tests licht_spiegel_kristall, editor_licht.
    - Licht-Überarbeitung (Nutzerwunsch „moderner, cooler, mit Glow“): Sonnenstein = dunkler Basaltblock mit Goldeinlage,
      glühender Sonnenscheibe, drehendem Strahlenkranz und Linse; Strahl mit echtem Glow (mehrere Schichten, Licht addiert
      sich), wandernden hellen Wellen, Funken und Aufblitzen an Spiegeln/Ende; nachts leuchten Sonnensteine und Strahlen die
      Dunkelheit aus. Spiegel und Kristalle hängen nicht mehr in der Luft: Sockel, Ständer bis zum Boden, Kette zur Decke
      oder Wandarm (aus dem Gelände bestimmt). Spiegel im Kardanring mit Drehpfeil; Kristall auf Basaltsockel.
    - Neue Optionen (alte Level unverändert): Sonnenstein „nur per Nummer“ (leuchtet nur, solange seine Nummer an ist –
      Plakette mit Nummer; Feld link) und Lichtkristall „bleibt an“ (einmal getroffen bleibt seine Nummer an bis Tod/Neustart
      – Goldring am Sockel; Feld bleibt). Test licht_optionen.
    - Licht-Rätsel in allen Ruinen-Leveln (jeweils mit Rollen: Affe per Haken, Schweinchen per Aufwind oder Segeln;
      Türen/Tore im Strahl, Platten, die jemand halten muss): Ruinen 1 „Sonnenkammer“ (786–826), Mondnacht „Mondspiegel“
      (neue Strecke 451–500), Fallengang „Lichtweiche“ (772–818, Brücken A/B am Licht), Felsenflucht „Felsbrecher-Licht“
      (752–800, der Fels bricht die Wand auf), Tempelherz „Sonnenkrone“ (750–798, drei Kristalle, Pfeile auf der Platte);
      Sonnentempel war schon ein Licht-Level. Tests ruinen1_sonnenkammer, mondnacht_mondspiegel, fallengang_lichtweiche,
      felsenflucht_felsbrecher_licht, tempelherz_sonnenkrone.
      Umgebaut mit schaltbaren Spiegeln (siehe unten „Licht-Labyrinthe“): die Spiegel dieser Rätsel drehen jetzt nur noch
      Platten und Hebel; Tempelherz heißt „Geteilter Strahl“ (Hebel 60 statt Platte 60 unter der Pfeilfalle).
    - Welche Rolle haben Affe und Schweinchen? Spiegel stehen dort, wo nur der Affe (Haken) oder nur das Schweinchen
      (segelnd) hinkommt. Einer lenkt das Licht, der andere geht durch die Tür, die der Kristall öffnet.
    - SCHALTBARER SPIEGEL (Option „drehen: per Nummer“, Feld link am Spiegel; ohne Nummer alles wie bisher, alte Level
      unverändert): Der Spiegel dreht sich NUR, wenn jemand etwas bedient – nie von selbst, kein Takt, kein Timer.
      - Druckplatte seiner Nummer: jedes BETRETEN dreht ihn genau einmal zwischen / und \. Verlassen und Stehenbleiben
        lösen nichts aus; erst wenn die Platte frei war und wieder jemand draufsteigt, dreht er wieder. Treten beide
        gleichzeitig drauf, zählt das als ein Betreten.
      - Hebel seiner Nummer: jede Betätigung dreht ihn genau einmal; der Hebel selbst verhält sich wie immer.
      - Drehung sichtbar animiert (≈ 0,3 s, SPIEGEL_DREH_SCHRITTE), der umgelenkte Strahl schwenkt mit, leiser heller
        Spiegel-Ton. Während der Drehung endet der Strahl am Spiegel.
      - Auslöser während einer Drehung: einer wird gemerkt und danach abgearbeitet, zwei weitere heben sich auf (hin und
        zurück). So passt die Endstellung immer zur Zahl der Auslöser, und nichts stapelt sich oder bleibt hängen.
      - Von Hand gesperrt (keine Tasten-Blase, Hebel-Taste wirkt nicht), damit niemand das Rätsel umgeht. Erkennbar an
        Plakette mit Nummer und Ring in der Farbe der Nummer (wie Tür/Hebel) und einem kleinen Kettenglied; kein Drehpfeil.
      - Mehrere Spiegel mit derselben Nummer drehen sich zusammen. Lichtkristalle drehen keine Spiegel (sonst könnten sich
        Licht und Spiegel endlos gegenseitig weiterschalten).
      - Neustart und Tod: Spiegel in Anfangsstellung (wie Hebel/Türen: alles wieder aus), gemerkte Auslöser verworfen,
        Druckplatten gelten wieder als frei. Ein Spiegel ist kein Hindernis, er schiebt nie eine Figur.
      - Der Ziel-Hinweis-Pfeil am Bildrand zeigt auch auf schaltbare Spiegel außerhalb des Bildes; die Bild-Regel prüft
        sie als Ziel; „jeder Hebel hat einen Grund“ zählt sie mit.
      - Editor: Werkzeug „Spiegel“ mit „drehen: von Hand / per Nummer“ + Verknüpfung (Name in der Nummern-Liste
        „Spiegel dreht“); Speichern, Laden, Rückgängig, Kopieren und Rechtsklick-Entfernen wie bei allen Punkt-Elementen.
      - Testlevel levels/test/licht-schalter.json; Tests spiegel_schaltbar, editor_licht.
      - Rollen: Wer auf die Platte tritt oder am Hebel steht, ist oft nicht der, der den Strahl sieht – einer bedient,
        der andere liest den Strahl und sagt an.
    - SACKGASSE (Licht-Labyrinth): Endet der Strahl an Stein, einer geschlossenen Tür, einem Wechselboden oder einer
      Falle, glüht dort ein Brandfleck und ein Funkenregen sprüht zurück (lichtSackgasse; nur Anzeige). So sieht man
      sofort, dass dieser Weg falsch ist. Strahl-Sperren nutzen die vorhandenen Elemente (Tür/Tor, Wechselboden, Stein,
      Falle); ein Kreis aus Spiegeln endet sicher (Besucht-Liste). Test spiegel_schaltbar.
    - STRAHL AM BILDRAND (Sichtbarkeit): Läuft ein Strahl aus dem Bild, leuchtet am Rand ein Doppelpfeil in Laufrichtung;
      liegt sein Ende draußen, zeigt ein Zeichen daneben, was ihn erwartet: Kristall (er trifft einen Kristall) oder
      Funken-Stern (Sackgasse). Schaltet ein Kristall ein Ziel außerhalb des Bildes, erscheint der Ziel-Hinweis-Pfeil
      (wie bei Hebel/Platte). Nur Anzeige (lichtRandListe / lichtRandZeichen).
    - LICHT-LABYRINTHE in den Ruinen (schaltbare Spiegel, falsche Pfade; Tabelle mit Einstufung in WELTEN.md):
      - Ruinen 1 (786–812) „Zwei Spiegel in Reihe“: Platte 22 auf dem Aufwind-Sims (Schweinchen) dreht Spiegel A, Hebel 21
        auf dem Haken-Sims (Affe) dreht Spiegel B; falsch: Decke bzw. Ausgangstor; richtig: Kristall 23 -> Ausgang.
      - Fallengang (772–805) „Lichtweiche“: Platte 35 (Affen-Sims) dreht Spiegel 1 und 2 zugleich, Hebel 36 (Schweinchen-
        Sims) stellt die Weiche: Brücke B über der Grube oder Ausgang.
      - Sonnentempel (482–518) „Licht plus Fallen“ (siehe Etappe 3).
      - Mondnacht (451–500) „Strahl-Labyrinth“, zwei Abschnitte: Platte 52 hält das Licht-Tor und dreht bei jedem
        Betreten Spiegel B (Übergabe, ohne dass die Platte frei wird!); Hebel 53 (Affen-Sims) dreht Spiegel A; jenseits der
        Grube dreht Platte 55 die Spiegel E und G, Hebel 56 Spiegel F; drei Sackgassen; Kristall 51 -> Brücke.
      - Felsenflucht (752–790) „Felsbrecher-Licht“: Hebel 45 (Boden) dreht Spiegel 1, Platte 46 (Affen-Sims) Spiegel 2.
      - Tempelherz (750–798) „Geteilter Strahl“: Hebel 60 unter der Pfeilfalle schaltet Sonnenstein 1, Hebel 23
        (Affen-Sims) Spiegel 1, Hebel 24 dreht Spiegel 3 UND 5, Hebel 25 Spiegel 4 (Brücke oder Tor); zweiter Sonnenstein;
        Doppeltor am Ausgang (Tor 2a Kristall 6, Tor 2b Kristall 26) nur offen, solange beide Kristalle Licht haben.
      - Löser-Test licht_raetsel_loeser: probiert jede Stellung aller schaltbaren Spiegel jedes Rätsels durch – genau eine
        Lösung, Mindestzahl Sackgassen, jeder Strahl endet sichtbar, jede Nummer hat Platte/Hebel. Koop-Bot-Pläne je
        Rätsel in den Level-Tests.

  - EIS (Ausbau 7, Welt Höhle; elemente/eis.js, Spiel-Feld eis [{x, y, w, h}]): fester, rutschiger Boden-Block.
    - Wer darauf steht, läuft langsam an und dreht langsam um (EIS_GRIFF) und rutscht ohne Taste lange weiter
      (EIS_REIBUNG, Werte in js/02-physik-werte.js). Springt man ab, behält man den Schwung. Landen mit Schwung: leises
      Schaben.
    - Editor: Werkzeug „Eis“ in der Gruppe Gelände, mit gedrückter Maus malbar.
    - Testlevel levels/test/eis.json; Tests eis_rutschen, editor_hoehlen_elemente.
    - Welche Rolle haben Affe und Schweinchen? Der Affe bremst mit dem Seil (am Haken hängen stoppt jedes Rutschen), das
      Schweinchen landet segelnd punktgenau auf schmalen Eissäulen.

  - FÖRDERBAND (Ausbau 7, Welt Höhle; elemente/foerderband.js, Spiel-Feld baender [{x, y, w, h, richtung, tempo, link?,
    schalter}]): fester Boden-Block, der jede Figur, die darauf steht, mitnimmt (rechts oder links, Tempo siehe unten).
    Gegen das Band kommt man langsamer voran, mit ihm schneller; Wände halten auf.
    - Wer richtig springt, segelt oder am Seil hängt, wird nicht mitgenommen.
    - Springt man vom Band ab, nimmt man dessen Schwung einmal mit (Band als Schleuder; höchstens Sprint-Tempo).
      Tempo-Stufen: langsam 1,6 · schnell 2,8 · reißend 8 (schneller als selbst Rennen – dagegen kommt man nicht an).
    - Wer nur knapp (bis 10 px) über dem Band schwebt, wird auch mitgenommen – in einem niedrigen Tunnel kann man ein
      reißendes Band also nicht „überhüpfen“; mit einem richtigen Sprung im Freien schon.
    - Optional an einer Verknüpfungs-Nummer: „Nummer dreht um“ (solange an, läuft es andersherum) oder „Nummer hält an“.
      Beim Umschalten klackt ein Zahnrad.
    - Aussehen: dunkler Rahmen mit Rollen, auf dem Gurt wandern gelbe Pfeile in Laufrichtung (still = grau).
    - Editor: Werkzeug „Förderband“ in der Gruppe Bewegung (Richtung, Tempo, Nummer), malbar; Klick tauscht die Richtung.
    - Testlevel levels/test/foerderband.json; Tests foerderband_mitnehmen, editor_hoehlen_elemente.
    - Welche Rolle haben Affe und Schweinchen? Der Affe hängt sich am Haken fest und hält gegen den Strom; das Schweinchen
      segelt über Bänder hinweg und landet genau; oft schaltet einer per Hebel das Band, auf dem der andere fährt.

  - LEUCHTKRISTALL und DUNKELZONE (Ausbau 7, Welt Höhle; elemente/leuchtkristall.js, Spiel-Felder
    leuchtkristalle [{x, y, link?}], dunkelzonen [{x, y, w, h}]).
    - Dunkelzone: dort ist es fast stockdunkel; um die Figuren leuchtet nur ein kleiner Kreis. Münzen, Haken, Hebel,
      Checkpoints und das Ziel glimmen schwach, damit man nie blind springt. Weicher Übergang am Rand.
    - Leuchtkristall: glimmt schwach. Mit der Hebel-Taste (J / Num 2 / Kreis) angeschlagen – wenn kein Hebel und kein
      Spiegel näher ist – leuchtet er 8 Sekunden hell und weit; in den letzten 2 Sekunden flackert er (Knistern).
      Steht eine Figur davor, zeigt eine Tasten-Blase (J / Num 2 bzw. ○) wie beim Hebel (Test aktions_hinweis).
      „per Nummer“: leuchtet dauerhaft, solange seine Verknüpfungs-Nummer an ist. Neustart/Tod: alle aus.
    - Er hellt sowohl die normale Höhlen-/Nacht-Dunkelheit als auch Dunkelzonen auf.
    - Editor: „Leuchtkristall“ (Gruppe Schalter & Logik; anschlagen oder per Nummer), „Dunkelzone“ (Gruppe Gelände,
      malbar).
    - Testlevel levels/test/leuchtkristall.json; Tests leuchtkristall_dunkelzone, editor_hoehlen_elemente.
    - Welche Rolle haben Affe und Schweinchen? Einer schlägt Kristalle an (der Affe hohe per Haken, das Schweinchen
      ferne segelnd), der andere läuft im Licht; wer vorne läuft, leuchtet dem anderen den Weg.

  - WELT RUINEN – Look (Ausbau 7; Design in WELTEN.md): levels/worlds.json, Welt „ruinen“ hat jetzt
    "aussehen": {basis: ruinen, zeit: mittag, himmel, ambiente: Vögel 0,6 · Grillen 0,5 · Fluss 0,4} (Tempel: weniger
    Vögel, leise Grillen auch am Tag, Fluss nur fern).
    - Zur natürlichen Tageszeit (mittag) gibt es dafür eine Kopie des Ruinen-Looks mit diesem Ambiente
      („ruinen@mittag~amb“); Welten ohne eigenes Ambiente bleiben genau beim Welt-Look.
    - Die übrigen Tageszeiten wie im Dschungel: Boden und Wände abends/nachts dunkler, nachts Eulen und Glühwürmchen.
    - Fallen-Köpfe und Lichtquellen nehmen im Spiel die Wandfarben des Levels an, nachts also auch dunkler.
    - Alte Level mit theme „ruinen“ (Level 3) sind unverändert. Test ruinen_welt_look.

  - LAVA und LAVA-MARKE (Ausbau 7, Welt Vulkan; elemente/lava.js, Spiel-Felder lava [{x, y, w, h}] und
    lavaPegel [{x, y, tempo, start, link?}]): glühende Lava-Kästchen (im Editor malbar, Gruppe Gefahren); zusammenhängende
    Kästchen bilden ein Becken. Wer mit den Füßen hineingerät (LAVA_GNADE px tief), verbrennt (Zischen). Lava ist flüssig:
    die Oberfläche ist im ganzen Becken gleich hoch; sie wird HINTER Boden und Wänden gezeichnet (neuer Register-Haken
    spiel.zeichnenHinten), mit Glut-Schein, treibender Schlacke und Blasen, leuchtet in dunklen Leveln und blubbert leise.
    - Lava-Marke über/in einem Becken: ist sie aktiv, steigt die Lava in den Spalten des Beckens bis zur Oberkante der
      Marke (Tempo langsam 0,35 / mittel 0,6 / schnell 1,0 px pro Schritt, LAVA_TEMPO). „per Nummer“: solange die
      Verknüpfung an ist (Hebel bleibt an, Druckplatte nur solange jemand draufsteht), aus = sinkt zurück; „sobald beide da
      sind“: startet, sobald BEIDE Figuren das Becken erreicht haben (Lava-Flucht; eine allein genügt nicht, sonst
      sperrt die Lava den Nachzügler aus). Gestrichelte Glut-Linie zeigt die Zielhöhe,
      beim Steigen grollt es. Tod/Neustart: Lava wieder unten.
    - Rolle: Affe klettert voraus (Wandsprung/Seil) und zieht oben den Hebel; Schweinchen steigt im Aufwind und hält
      Druckplatten. Test lava_steigen, Testlevel levels/test/lava.json.
  - STACHELPRESSE (Ausbau 7, Welt Vulkan; elemente/presse.js, Spiel-Feld pressen [{x, y, breite, takt, versatz, schalter,
    link?}]): Eisenblock (1–3 Kästchen breit) mit Stacheln unten an einer Kette, im Editor an die OBERE Stelle gesetzt.
    Im Takt (2 / 2,5 / 3 / 4 s, Versatz ¼-Schritte für Wellen): oben warten – Vorwarnung (Kette zittert, Staub rieselt,
    Rasseln; PRESSE_WARN) – kracht schnell bis auf den ersten festen Boden darunter (PRESSE_FALL), bleibt kurz liegen
    (PRESSE_LIEGEN, Stampfen), wird langsam hochgezogen. Berührung = Tod. Per Nummer: „hält bei Nummer an“ (fährt erst
    ganz hoch, dann steht sie) oder „läuft nur bei Nummer“. Jede Presse hat ihre eigene Takt-Uhr ab Start/Neustart/Tod.
    - Rolle: Affe wartet am Haken über der Presse den Takt ab und zieht Hebel, die Pressen anhalten; Schweinchen gleitet
      zwischen zwei Schlägen hindurch und hält Platten. Test presse_takt, Testlevel levels/test/presse.json.
  - Editor (Ausbau 7): Werkzeuge Lava, Lava-Marke und Stachelpresse in der Gruppe Gefahren (Test editor_vulkan_elemente);
    Hebel/Platten dürfen auch Lava steigen lassen oder Pressen schalten (Test hebel_haben_grund; ein Hebel, der Lava
    steigen lässt, muss auch ein Tor öffnen).
  - WELT VULKAN – Look (Ausbau 7; Design in WELTEN.md): levels/worlds.json, Welt „vulkan“ hat jetzt
    "aussehen": {basis: vulkan, himmel: false, zeitFarben: "feuer", ambiente: Vögel 0 · Grillen 0,2 · Fluss 0}.
    - Der eigene Feuer-Himmel bleibt, aber je Tageszeit eingefärbt (Farbsatz ZEIT_FARBEN_SAETZE.feuer in 10a-themen.js):
      morgens goldener Dunst, mittags der Welt-Look, abends violett-rot und etwas dunkler, nachts dunkel – nur Lava und
      Glut leuchten.
    - Wetter „regen“ (nur wenn im Level ausdrücklich gewählt): heißer Regen, über der Lava steigt Dampf auf; trocken /
      wechselnd = Asche und Glut wie bisher. Das alte Level 6 „Feuerberg“ (theme „vulkan“) bekommt nie Regen und sieht
      unverändert aus. Test vulkan_welt_look.
    - Level der Welt (Reihenfolge in worlds.json): Glutpfad (17), Aschefeld (18), Feuerberg (6), Magmakammer (19),
      Schlackewerk (20), Feuerschlund (21), Kraterherz (22) – 7 Level, Freischaltung Level für Level (Tests welten_laden,
      welten_freischaltung; Weltkarte zeigt „0 / 7 Level“). Der Vulkan öffnet nach dem letzten Höhlen-Level.
  - WELT HÖHLE – Look (Ausbau 7; Design in WELTEN.md): levels/worlds.json, Welt „hoehle“ hat jetzt
    "aussehen": {basis: hoehle, himmel: false, ambiente: Vögel 0 · Grillen 0,15 · Fluss 0,7} (unter Tage: keine Vögel,
    kaum Grillen, Wasser in der Ferne).
    - Unter Tage sehen morgens, mittags und abends gleich aus (Höhlen-Look mit diesem Ambiente, „hoehle@…~amb“); nachts ist
      es deutlich dunkler, das Ambiente bleibt.
    - Wetter „regen“ in der Höhle: Tropfwasser – an festen Stellen fallen einzelne Tropfen von der Decke, ab und zu ein
      leises „Plipp“ (statt Regenschauer); trocken/wechselnd = stille Höhle.
    - Das alte Level 5 „Kristallhöhle“ (theme „hoehle“) ist unverändert. Test hoehle_welt_look.
    - Welt Höhle hat 6 Level (worlds.json): Kristallhöhle (5), Tropfsteingang (12), Eisgrotte (13), Leuchtgrotte (14),
      Förderwerk (15), Tiefenschlund (16). Erst wenn alle 6 geschafft sind, geht die nächste Welt auf (Test
      welten_freischaltung); Hebel/Druckplatten dürfen auch Förderbänder drehen oder Leuchtkristalle anschalten (Test
      hebel_haben_grund).

  - Level 9 „Fallengang“ (levels/level-9.json, Ruinen Level 3 der Welt, morgens, wechselndes Wetter, 806 Spalten).
    Lehr-Level für die Fallen.
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
    - Checkpoints höchstens 70 Spalten auseinander (Ausnahme: der Doppelgang 604–680 ist ein einziges Rätsel).
    - Test level9_fallengang (Koop-Bot).

  - Level 10 „Sonnentempel“ (levels/level-10.json, Ruinen Level 4 der Welt, abends, Regen, 800 Spalten).
    Kombi-Level, Schwerpunkt Licht: Spiegel, die nur einer erreicht.
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
        im Zickzack). Seit „Schaltbare Spiegel“ = „Licht plus Fallen“: Platte 15 lässt die drei Pfeilfallen schweigen,
        solange jemand draufsteht, dreht aber bei jedem Betreten Spiegel 1 (steht anfangs richtig); Platten 16/17 unter den
        Pfeilen drehen Spiegel 2/3. Kristall 11 „bleibt an“ (der Rückweg führt über die Platten). Zurück durch die Pfeile im
        Takt.
      - Flammen-Gang: Flammen aus dem Boden als Welle – das Schweinchen läuft der Welle nach, der Affe nimmt das blaue Tor.
    - Etappe 4 (Spalten 600–800, Ziel bei 790):
      - Doppelstrahl-Tor (schwerste Stelle, in zwei Abschnitten): Strahl 1: Der Affe dreht den Spiegel auf dem Sims
        (Haken) → Kristall 12 öffnet Tür 12 am Anfang der Brücke (Spalte 645) und lässt die Brücke über die Grube
        erscheinen. Strahl 2: Das Schweinchen (pinkes Tor, segeln) dreht den Spiegel auf der Insel → Kristall 13 öffnet
        das Tor direkt hinter der Brücke (Spalte 670) – dort treffen sich beide; ein Takt-Stein (1,5 s) unterbricht
        Strahl 2, und im Tor fällt ein Pfeil im Takt.
      - Licht-Brücken im Takt: Ein Takt-Stein unterbricht den Strahl, die Brücken über zwei Gruben sind nur jede zweite
        Phase da. Das Schweinchen kann segeln, der Affe muss im Takt laufen (Pfeiler in der Mitte = sicher).
    - Checkpoints höchstens 70 Spalten auseinander (Ausnahme: die zwei Wege 401–474 sind ein einziges Rätsel).
    - Test level10_sonnentempel (Koop-Bot).

  - Level 11 „Felsenflucht“ (levels/level-11.json, Ruinen Level 5 der Welt, mittags, Regen, 800 Spalten).
    Meister-Level: der rollende Fels jagt die beiden. Ruhende Felsen liegen auf kleinen Simsen
    über dem Weg und rollen herunter, sobald ihr Hebel gezogen ist (jeder Fels-Hebel öffnet auch ein Tor).
    - Etappe 1 (Spalten 0–200):
      - Erste Flucht: Hebel 1 öffnet Tor 1 und lässt hinter den beiden einen langsamen Fels los; über die Stufe springen,
        dort zerschellt er.
      - Fels und Grube: Hebel 2 startet einen schnelleren Fels; über die Grube – das Schweinchen segelt, der Affe nimmt
        den Haken; der Fels stürzt in die Grube.
      - Flucht nach oben: Hebel 3 startet einen SCHNELLEN Fels (schneller als die Figuren) – rauf auf die Stege (von unten
        durchspringen), der Fels rollt darunter durch und zerschellt an der Mauer.
    - Etappe 2 (Spalten 200–400):
      - Pfeil-Flucht: Hebel 4 startet einen langsamen Fels; vorne fallen Pfeile im Takt – nur kurz warten, sonst holt der
        Fels auf.
      - Schleuse mit Fels: Das Schweinchen hält Druckplatte 5 (Tür 5 offen). Der Affe zieht Hebel 6 (Tor 6 vorne auf,
        hinten rollt ein Fels los), rennt durch Tür 5, das Schweinchen geht direkt hinterher; Tür 5 schließt hinter beiden
        und der Fels zerschellt daran. Wer Hebel 6 vergisst, steht vor Tor 6 und muss neu anfangen.
      - Flammen-Welle mit Fels im Nacken: vor jeder Flamme kurz warten, der langsame Fels kommt näher.
    - Etappe 3 (Spalten 400–600):
      - Teleporter-Flucht: Hebel 8 startet einen schnellen Fels; der Affe nimmt das blaue, das Schweinchen das pinke Tor
        hinauf auf den Sims, unten zerschellt der Fels an der Mauer.
      - Takt-Steine (1,5 s) mit Fels im Nacken: an der Kante nicht lange auf den Takt warten; der Fels stürzt in die Grube.
      - Wechsel-Schleuse auf der Flucht: Hebel 10 öffnet Tor 10, startet einen Fels und lässt den Boden vorne verschwinden;
        dafür erscheinen Trittsteine weiter oben – hinauf und hinüber, der Fels stürzt in die Grube.
    - Etappe 4 (Spalten 600–800, Ziel bei 790):
      - Finale (schwerste Stelle): Hebel 11 lässt den letzten Fels los (so schnell wie die Figuren). Über die Grube (Affe
        Haken, Schweinchen segelt), im Laufen den Spiegel drehen – der Kristall öffnet das Licht-Tor 12 –, hinauf auf die
        Stege; der Fels rollt darunter durch und zerschellt an der Mauer.
      - Ausklang: drei Pfeil-Vorhänge ohne Fels, dann das Ziel.
    - Checkpoints höchstens 70 Spalten auseinander – außer in den Verfolgungen, die jeweils am Stück gespielt werden.
    - Test level11_felsenflucht (Koop-Bot).

  - Level 12 „Tropfsteingang“ (levels/level-12.json, Höhle Level 2 der Welt, morgens, trocken, 800 Spalten). Seit
    Abschluss der Höhle sichtbar (Welt Höhle: Level 5, 12, 13, 14, 15, 16). Lehr-Level: Förderband, Stege, enge Kamine.
    - Etappe 1 (Spalten 0–200): Band mit dem Strom; gegen ein schnelles Band; Band-Schleuder (das Schweinchen segelt über
      die Stachelgrube und zieht drüben Hebel 1 – das reißende Band dreht sich und schleudert den Affen hinüber); enger
      Kamin hinauf, Stege hinunter; ein langsames Band trägt auf Stacheln zu – rechtzeitig auf den Steg springen.
    - Etappe 2 (Spalten 200–400): Tür und Schleuder (der Affe öffnet per Haken und Hebel 2 die Tür, das Schweinchen segelt
      über die Grube und dreht mit Hebel 3 das Band für den Affen); Zickzack-Kamin (ein Tropfstein davor fängt
      Fehlsprünge auf); Stege hinunter; Band-Inseln über der Stachelgrube (abwechselnd links/rechts laufend).
    - Etappe 3 (Spalten 400–600): Platten-Tunnel (im eine Reihe hohen Tunnel läuft ein reißendes Band; einer hält
      Druckplatte 4, der andere geht durch und zieht Hebel 5 – Tür 5 auf dem Tunneldach geht für den ersten auf);
      Band-Treppe aufwärts gegen den Strom; Steg-Turm zu Hebel 6, der das reißende Band im niedrigen Gang umdreht.
    - Etappe 4 (Spalten 600–800, Ziel bei 792): Schleuder-Kette (drei Bänder vor drei Gruben, ohne Band-Schwung schafft es
      der Affe nicht); Kamin hinter einem Gegenband; Platten-Staffel (der Affe hält per Haken oben Druckplatte 10, das
      Schweinchen geht durch den Band-Tunnel und öffnet mit Hebel 11 die Tür auf dem Tunneldach); Ziel.
    - Checkpoints höchstens 70 Spalten auseinander.
    - Test level12_tropfsteingang (Koop-Bot).

  - Level 13 „Eisgrotte“ (levels/level-13.json, Höhle Level 3 der Welt, abends, Tropfwasser, 800 Spalten).
    Lehr-Level: Eis, Aufwind, Präzisionssprünge.
    - Etappe 1 (Spalten 0–200): Eis lernen; Bremsweg bis an eine Stachelgrube (mit Schwung drüber); Eis-Säulen über der
      Grube (das Schweinchen landet und lenkt gegen, der Affe schwingt an den Haken darüber); Aufwind-Schacht: das
      Schweinchen steigt zum Sims, zieht Hebel 1 (Tür 1 unten für den Affen) und segelt über die Tür; Eisbahn.
    - Etappe 2 (Spalten 200–400): Platten-Schleuse auf Eis (Druckplatte 2 vorne und hinten – hinten liegt sie auf dem Eis,
      man muss genau darauf stehen bleiben); vereister Sims: der Affe greift den Haken hinauf und zieht Hebel 3 im
      Vorbeirutschen (Tür 3), dann über die Grube (Haken / segeln); Eisbrücke unter Stalaktiten (rutschen statt springen);
      Eis-Treppe hinauf.
    - Etappe 3 (Spalten 400–600): Aufwind-Leiter: das Schweinchen steigt zu Hebel 4 und über die Mauer, Tür 4 für den
      Affen; Bremsen am Seil: auf der vereisten Plattform steht Hebel 5 ganz vorn an der Kante – der Affe hängt am
      Haken darüber, Tür 5 öffnet unten; über die Grube (Haken / segeln); Eissäulen im Aufwind (Schweinchen) bzw. mit
      Haken darüber (Affe).
    - Etappe 4 (Spalten 600–800): Doppel-Rutsche: zwei vereiste Gänge übereinander, Hebel 6 unten öffnet Tür 6 oben,
      Hebel 7 oben öffnet Tür 7 unten (im Vorbeirutschen ziehen); Aufwind (Schweinchen) und enger Kamin (Affe) nebeneinander
      hinauf auf den Sims; Stege hinunter; Eisbahn zum Ziel.
    - Checkpoints höchstens 70 Spalten auseinander.
    - Test level13_eisgrotte (Koop-Bot, alle vier Etappen + Checkpoint-Abstände).
  - Level 14 „Leuchtgrotte“ (levels/level-14.json, Höhle Level 4 der Welt, nachts, trocken, 800 Spalten).
    Kombi-Level: Dunkelheit + Leuchtkristalle, Scheinwände, Teleporter.
    - Etappe 1 (Spalten 0–200): Kristall anschlagen und im Licht über drei Stachelgruben; der Affe greift den Haken hinauf
      zum Kristall auf dem Sims – sein Licht zeigt dem Schweinchen die Gruben, über die es segelt und Hebel 1 zieht
      (Tür 1 für den Affen, der an den Haken hinüberschwingt); das Schweinchen hält Druckplatte 2, ein Kristall über der
      Schlucht leuchtet, der Affe schwingt hinüber und zieht Hebel 3 – eine Brücke erscheint für das Schweinchen.
    - Etappe 2 (Spalten 200–390): Scheinwände (unten zum Durchlaufen; oben ein Fenster, über zwei Stege erreichbar);
      getrennte Teleporter: das blaue Tor (nur Affe) bringt ihn an einem Fels vorbei, er zieht Hebel 4 und schaltet das
      pinke Tor (nur Schweinchen) an; Schlucht: das Schweinchen segelt hinüber und schaltet mit Hebel 5 das weiße Tor für
      den Affen an; versteckter Ausgang: eine dicke Wand ist unten nur Schein, dahinter ein Tor.
    - Etappe 3 (Spalten 390–590): Stachel-Tunnel im Dunkeln (niedrige Decke, schmale Gruben, flache Hüpfer); Kammer-Kette:
      der Affe springt durch sein blaues Tor auf einen Sims und zieht Hebel 6, das pinke Tor bringt das Schweinchen in die
      Kammer darunter; es hält Druckplatte 7 (Tür 7 oben), der Affe läuft hinaus und zieht Hebel 8 (Tür 8 unten); Kamin
      hinauf über eine Felswand, Stege hinunter, dunkle Schlucht (Affe an vier Haken, Schweinchen mit zwei Aufwinden).
    - Etappe 4 (Spalten 590–800): Steg-Turm im Zickzack hinauf; getrennte Wege: einer bleibt oben auf dem Sims und zieht
      Hebel 10 (Tür 10 unten), der andere lässt sich durch die Lücke fallen und hält Druckplatte 11 (Tür 11 oben) –
      egal, wer welchen Weg nimmt; Steg-Hüpfer über die dunkle Stachelgrube zum Ziel.
    - Checkpoints höchstens 70 Spalten auseinander.
    - Test level14_leuchtgrotte (Koop-Bot, alle vier Etappen + Checkpoint-Abstände).
  - Level 15 „Förderwerk“ (levels/level-15.json, Höhle Level 5 der Welt, mittags, wechselndes Wetter, 800
    Spalten). Kombi-Level: Förderband-Kaskaden, Eis + Band, Bänder über Kreuz, Kamine.
    - Etappe 1 (Spalten 0–200): Band-Treppe (Stufen hinauf, langsames Band, über eine Grube auf ein Gegenband); Band-Kaskade
      über der Stachelgrube (kurze Bänder abwechselnd mit und gegen den Lauf); Schleuder mit Aufwind-Hebel: das Schweinchen
      segelt über die Grube, steigt im Aufwind auf den Sims und zieht Hebel 1 – das reißende Band dreht und schleudert den
      Affen hinüber; Platten-Tunnel: ein niedriger Gang mit reißendem Gegenband, das nur andersherum läuft, solange jemand
      auf einer der beiden Druckplatten 2 (vor/hinter dem Gang) steht.
    - Etappe 2 (Spalten 200–400): Eis-Anlauf zum Band-Sprung (auf dem Eis Schwung holen, das Band gibt dazu, weit über
      die Grube); zwei rutschige Druckplatten 3: eine auf einem Band, das zur Stachelgrube läuft (dagegen anlaufen), eine
      hinter Tür 3 auf Eis (genau stehen bleiben) – einer hält, der andere geht durch und hält drüben; Eis-Treppe abwärts
      (Stege hinauf, über Eis-Simse und ein Gegenband hinunter über die Stachelgrube).
    - Etappe 3 (Spalten 400–600): Bänder über Kreuz: zwei niedrige Gänge übereinander mit reißendem Gegenband – wer oben auf
      Druckplatte 6 steht, dreht das untere Band; der andere fährt unten durch und zieht Hebel 5, der das obere Band dreht;
      Gegenband mit Stachel-Höckern (im Takt springen); über das reißende Band: Steg-Inseln (Schweinchen segelt, Affe hüpft)
      oder Haken (Affe).
    - Etappe 4 (Spalten 600–800): Kamin mit Gegenband oben, Stege hinunter; Doppel-Schleuder: das Schweinchen segelt über
      Grube A und zieht Hebel 8 (das Band schleudert den Affen hinüber), der Affe schwingt an den Haken über Grube B und
      zieht Hebel 9 – das zweite Band schleudert das Schweinchen, das mit Schwung weit hinübersegelt (ohne Schwung zu
      breit); Eisbahn, schnelles Band, letzter Sprung zum Ziel.
    - Checkpoints höchstens 70 Spalten auseinander.
    - Test level15_foerderwerk (Koop-Bot, alle vier Etappen + Checkpoint-Abstände).
  - Level 16 „Tiefenschlund“ (levels/level-16.json, Höhle Level 6 der Welt, nachts, Regen, 800 Spalten).
    Meister-Level: alles kombiniert, lange Präzisions-Passagen im Dunkeln.
    - Etappe 1 (Spalten 0–200): dunkler Abstieg vom Felsvorsprung über Steg, Eis-Sims und Steg (darunter Stacheln);
      Licht und Brücke: das Schweinchen hält Druckplatte 1 (Kristall über der Schlucht leuchtet), der Affe schwingt an
      vier Haken hinüber und zieht Hebel 2 (Brücke); Eissäulen ohne Aufwind (Schweinchen segelt von Säule zu Säule und
      springt sofort weiter, Affe an den Haken); Platten-Tunnel im Dunkeln.
    - Etappe 2 (Spalten 200–400): Eis-Kamin (oben ist der Sims vereist – man rutscht sofort auf die Kante zu und muss
      rechtzeitig über die dunkle Lücke springen); Doppel-Rutsche im Dunkeln (Hebel 4 unten öffnet Tür 4 oben, Hebel 5
      oben öffnet Tür 5 unten, im Vorbeirutschen); Aufwind (Schweinchen) und Kamin (Affe) nebeneinander, oben Stege
      hinunter über Stacheln.
    - Etappe 3 (Spalten 400–600): Band ins Tor (ein Band trägt beide in ein Tor hinter die Felswand); Band-Weiche: im
      niedrigen Gang läuft ein reißendes Gegenband, das blaue Tor (nur Affe) führt vorbei, drüben zieht der Affe Hebel 6
      und das Band trägt das Schweinchen durch; Tor-Kette über die Stachelgrube (genau auf schmale Felssäulen springen,
      ins Tor laufen, weiterspringen).
    - Etappe 4 (Spalten 600–800): lange Steg-Passage im Dunkeln (schmale Stege auf wechselnder Höhe über der
      Stachelgrube); Doppel-Schleuder im Dunkeln (Schweinchen segelt über Grube A und zieht Hebel 8 – das Band schleudert
      den Affen; der Affe schwingt über Grube B und zieht Hebel 9 – das zweite Band schleudert das Schweinchen); letzte
      Eissäulen (Schweinchen segelt von Säule zu Säule, Affe an fünf Haken) – dann zum Ziel.
    - Checkpoints höchstens 70 Spalten auseinander.
    - Test level16_tiefenschlund (Koop-Bot, alle vier Etappen + Checkpoint-Abstände).

  - Level 17 „Glutpfad“ (levels/level-17.json, Vulkan Level 1 der Welt, morgens, trocken, 800 Spalten): in der
    Welt Vulkan an Platz 1. Lehr-Level: Lava-Becken, steigende Lava, Sprungpilze.
    - Etappe 1 (Spalten 0–200): zwei Lava-Gruben; Pilz mitten im Lavasee (auf die Säule springen, der Pilz schleudert
      weiter); Pilz-Stufe auf einen hohen Fels, oben über die Lava-Grube; Trittsteine im Lavasee; Pilz-Kette über den
      Lavasee (vier Pilz-Säulen).
    - Etappe 2 (Spalten 200–400): Lava-Raum (Hebel 1 öffnet oben das Tor und lässt die Lava im Raum langsam steigen –
      über vier Stege zügig hinauf; wer unten bleibt, verbrennt); Lava-Kamin (die Lava steigt, sobald beide unten im
      Kamin sind – per Wandsprung hinauf); Pilz-Flucht (sobald beide am Becken sind, steigt die Lava – über drei
      Pilz-Säulen treppauf zum Sims).
    - Etappe 3 (Spalten 400–600): Lava-Graben (die Lava steht über dem Steinweg; solange jemand auf einer der beiden
      Druckplatten 2 steht, fließt sie ab – einer hält, der andere läuft und hält drüben); nur das Schweinchen kommt über
      den zweiten Graben (segelt) und stellt sich auf Druckplatte 3 – die Lava fließt ab, der Affe läuft unten durch;
      Lava-Raum 2 (Hebel 4: Tor oben auf, Lava steigt schneller – schmale Stege und ein Pilz hinauf).
    - Etappe 4 (Spalten 600–800): Pilz-Kette über den steigenden Lavasee (sobald beide am Ufer sind, steigt der See
      langsam über die Säulen); Steg-Turm vor der Lava (im Schacht steigt die Lava durch den Boden, sobald beide drin
      sind – Stege im Zickzack hinauf); letzte Gruben und ein Pilz zum Ziel.
    - Checkpoints höchstens 70 Spalten auseinander.
    - Test level17_glutpfad (Koop-Bot, alle vier Etappen + Checkpoint-Abstände).

  - Level 18 „Aschefeld“ (levels/level-18.json, Vulkan Level 2 der Welt, mittags, heißer Regen, 800 Spalten): in der
    Welt Vulkan an Platz 2. Lehr-Level: Stachelpressen im Takt, Förderband.
    - Etappe 1 (Spalten 0–200): eine Presse (warten, dann drunter durch); Pressen-Welle (drei Pressen mit Versatz);
      Lava-Grube mit Presse direkt dahinter; Pressen-Gang (niedriger Gang, vier Pressen im 2-s-Takt, kein Segeln);
      Doppel-Presse (3 Kästchen breit, langsamer Takt).
    - Etappe 2 (Spalten 200–400): Pressen über einem Förderband (wer warten will, muss dagegen laufen); Gegenband unter
      Pressen (langsam voran, große Lücken abwarten); Schlacke-Fließband (schnelles Band unter einer breiten Presse durch
      bis an eine Lava-Grube, am Ende mit Band-Schwung springen).
    - Etappe 3 (Spalten 400–600): Platte hält die Pressen an (das Schweinchen steigt im Aufwind aufs Dach und stellt sich
      auf Druckplatte 5 – die vier Pressen im Gang darunter stehen still, der Affe läuft durch und zieht Hebel 6: Tür 6
      oben auf dem Dach öffnet für das Schweinchen); Hebel 7 öffnet Tür 7 hinter der Lava-Brücke, wirft aber die drei
      Pressen über der Brücke an (laufen nur bei Hebel an) – im Takt hinüber; Pressen-Treppe (Stufen hinauf, über jeder
      Stufe eine kleine Presse).
    - Etappe 4 (Spalten 600–800): großer Pressen-Rhythmus (niedriger Gang, sechs Pressen im Wechsel-Takt, dazwischen
      kurze Gegenbänder); Pressen über Kreuz (zwei Wege übereinander, in zwei Hälften: steht der Affe unten auf Druckplatte 8,
      stehen die ersten Pressen oben still – das Schweinchen, das per Aufwind nach oben kommt, läuft zur Mitte auf
      Druckplatte 10: die ersten Pressen unten stehen still, der Affe kommt nach auf Platte 11 (Treffpunkt, beide
      übereinander) – dann dasselbe für die zweite Hälfte bis Platte 9; je Gang 4 Pressen); letzte breite Presse, Grube, Ziel.
    - Checkpoints höchstens 70 Spalten auseinander.
    - Test level18_aschefeld (Koop-Bot, alle vier Etappen + Checkpoint-Abstände).

  - Level 19 „Magmakammer“ (levels/level-19.json, Vulkan Level 4 der Welt, abends, trocken, 800 Spalten): in der Welt
    Vulkan an Platz 4 (hinter dem alten Feuerberg). Kombi-Level: Lava-Flucht durch Kamine, Haken/Aufwind über der Lava,
    Pilz-Turm, Doppel-Schacht.
    - Etappe 1 (Spalten 0–200): Zickzack-Kamin mit Lava (sobald beide unten sind, steigt die Lava schnell – per
      Wandsprung durch zwei versetzte Schächte hinauf); Aufwind (Schweinchen) und Kamin (Affe) nebeneinander, die Lava
      steigt mit; Glutfelder (drei Lava-Gruben, die mittlere mit Pilz-Säule).
    - Etappe 2 (Spalten 200–400): über den Lavasee (Affe an vier Haken, Schweinchen mit zwei Aufwinden; sobald beide am
      Ufer sind, steigt der See langsam); der Hebel des Schweinchens (im Aufwind auf den Sims, Hebel 3 öffnet Tür 3 für
      den Affen – lässt aber die Lava über seinem Steinweg steigen: sofort los); zweiter, schnellerer See (Haken /
      Aufwinde).
    - Etappe 3 (Spalten 400–600): Pilz-Turm (vier Pilz-Säulen treppauf, jede höher – sobald beide im Becken sind, steigt
      die Lava); Kamin mit Presse am Ausgang (im Kamin steigt die Lava, oben stampft eine Presse über dem Sims); Pressen
      über dem Lavasteg.
    - Etappe 4 (Spalten 600–800): Doppel-Schacht – jeder rettet den anderen (links ein enger Kamin für den Affen, rechts
      ein Aufwind-Schacht für das Schweinchen, sobald beide drin sind steigt die Lava; im Kamin sperrt eine Klappe
      (Wechselboden 10), die nur offen ist, solange das Schweinchen im Nachbarschacht auf Druckplatte 10 steht; oben läuft
      der Affe über die Klappe 11 und zieht Hebel 11 – die Klappe über dem Aufwind öffnet, das Schweinchen fliegt
      hinaus); Finale (Pilz über die Lava-Grube, Presse, eine Grube, die steigt, sobald beide da sind).
    - Checkpoints höchstens 70 Spalten auseinander.
    - Test level19_magmakammer (Koop-Bot, alle vier Etappen + Checkpoint-Abstände).

  - Level 20 „Schlackewerk“ (levels/level-20.json, Vulkan Level 5 der Welt, mittags, wechselndes Wetter, 800 Spalten):
    in der Welt Vulkan an Platz 5. Kombi-Level: Förderbänder unter Pressen, Hebel über
    Kreuz, Flammenfallen über Bändern, großes Werk.
    - Etappe 1 (Spalten 0–200): schnelles Band unter einer Pressen-Welle (nur wer gegenläuft, kann warten);
      Gegenband-Tunnel mit drei breiten Pressen; Band zum Pilz – der Pilz schleudert über eine Presse hinweg auf einen
      hohen Sims, von dort über die Lava-Grube.
    - Etappe 2 (Spalten 200–400): Hebel über Kreuz (zwei Gänge voller Pressen, in zwei Hälften: Hebel 4 unten hält die ersten
      Pressen oben an – das Schweinchen läuft zur Mitte und zieht Hebel 11 (erste Pressen unten), der Affe kommt nach und
      zieht unten Hebel 12 (zweite Pressen oben), das Schweinchen zieht am Ende Hebel 5 (zweite Pressen unten)); Schleuder über die Lava
      mit Presse über dem Band (Schweinchen segelt hinüber, Hebel 6 dreht das reißende Band für den Affen); Pilz unter
      der Presse (nur wenn sie oben ist, schleudert er auf den Sims; dort zwei weitere Pressen).
    - Etappe 3 (Spalten 400–600): Flammen-Decke über dem Band (von der Decke stoßen Flammen im Wellen-Takt herab, das
      Band trägt nach rechts – wer gegenläuft, wartet vor der Flamme); Flammen durch die Stege (unter jedem Steg über
      der Lava eine Düse, die durch den Steg nach oben brennt – man springt der Flammen-Welle hinterher); Flammen-Vorhang
      (drei schnelle Düsen im Gang: der Affe schwingt am Haken auf den Sims und zieht Hebel 7 = Vorhang aus, das
      Schweinchen segelt im Aufwind aufs Dach und zieht Hebel 8 = Tür am Gang-Ende auf).
    - Etappe 4 (Spalten 600–800, das große Werk): Brücke über die Grube (der Affe schwingt an vier Haken über die Lava,
      Hebel 9 lässt die Wechselboden-Brücke für das Schweinchen erscheinen); reißendes Gegenband (niemand läuft dagegen
      an – das Schweinchen segelt über zwei Aufwinde und zieht Hebel 10: das Band steht still, dafür laufen zwei Pressen
      darüber an, die der Affe abpassen muss); Finale „das Werk läuft voll“ (sobald beide im Kessel sind, steigt die Lava
      schnell: Band zum Pilz, Pilz auf den Steg, über zwei Stege hinauf auf die Rampe zum Ziel).

  - Level 21 „Feuerschlund“ (levels/level-21.json, Vulkan Level 6 der Welt, nachts, trocken, 800 Spalten):
    in der Welt Vulkan an Platz 6. Kombi-/Meister-Level: dunkle Lavagänge mit
    Leuchtkristallen, Teleporter vor steigender Lava, Wechselboden über Lava, Doppel-Flucht.
    - Etappe 1 (Spalten 0–200): dunkler Lavagang (Kristall anschlagen, im Licht über drei Lava-Gruben); oben schlägt an,
      unten läuft (der Affe schwingt zum Kristall auf dem Sims, das Schweinchen segelt im Licht über die Lava-Gruben und
      zieht Hebel 1 für Tür 1, der Affe kommt an den Haken nach); Teleporter-Kammer (hinunter in die Kammer, kein Weg
      zurück – sobald beide unten sind, steigt die Lava; der Teleporter des Affen bringt ihn auf den Sims draußen, dort
      schaltet Hebel 2 den Teleporter des Schweinchens an).
    - Etappe 2 (Spalten 200–400): Wechselboden im Takt über der Lava (türkise und orange Platten wechseln alle
      2 Sekunden – man springt genau beim Wechsel); zwei Brücken im Dunkeln (das Schweinchen hält Druckplatte 3 = untere
      Brücke für den Affen, der Affe hält drüben Druckplatte 4 = obere Brücke für das Schweinchen); der Schlund (Stege
      treppauf über einem Lavasee, der schnell steigt, sobald beide am Ufer sind).
    - Etappe 3 (Spalten 400–600): Licht halten, Pilze springen (in zwei Abschnitten mit Insel in der Mitte: das Schweinchen
      hält Druckplatte 5 – der erste Kristall über dem dunklen Lavasee leuchtet, der Affe springt über zwei Pilze auf die
      Insel und zieht Hebel 12: der Teleporter holt das Schweinchen auf die Insel; dort hält es Platte 13 = zweiter
      Kristall, der Affe springt über zwei weitere Pilze und zieht Hebel 6: der zweite Teleporter holt es nach); zweite Teleporter-Kammer (die Lava steigt; der Affe hält Platte 7 = Teleporter des Schweinchens
      an, draußen hält das Schweinchen Platte 8 = Teleporter des Affen an); Klappen im Lavagang (das Schweinchen steigt
      im Aufwind auf den Sims und schaltet Hebel 9 genau dann um, wenn der Affe von Klappe zu Klappe springt).
    - Etappe 4 (Spalten 600–800): Doppel-Flucht – zwei Schächte, zwei Lavastände (Kamin für den Affen, Aufwind-Schacht
      für das Schweinchen, jeder mit eigener Lava, im Aufwind-Schacht steigt sie schneller; das Schweinchen hält Platte 10
      = Klappe im Kamin offen, der Affe zieht oben Hebel 11 = Klappe über dem Aufwind auf); Klappen im Takt über dem
      Glutsee (alle 1,5 Sekunden); Finale „der Schlund läuft voll“ (Pilz auf den Steg, über zwei Stege hinauf zum Ziel,
      die Lava steigt schnell).

  - Level 22 „Kraterherz“ (levels/level-22.json, Vulkan Level 7 der Welt, nachts, Regen, 800 Spalten): in der
    Welt Vulkan an Platz 7 (letztes Level). Meister-Level, alles kombiniert: Pressen + Pilze, Lava-Flucht mit
    Bändern und Eis, Hebel-Ketten über der Lava, Finale „der Krater läuft voll“.
    - Etappe 1 (Spalten 0–200, Pressen + Pilze): Pilz unter der Presse (nur wenn sie oben ist, schleudert er auf den
      Sims; dort zwei Pressen); Pilz-Turm vor der Lava (vier Pilz-Säulen treppauf, die Lava steigt, sobald beide im
      Becken sind; oben stampft eine breite Presse über dem Sims); Pilz-Kette über den Lavasee (der Affe springt von
      Pilz zu Pilz, das Schweinchen segelt; am Ufer eine Presse).
    - Etappe 2 (Spalten 200–400, Lava-Flucht mit Bändern und Eis): Flucht über Eis und Band (vom Block hinunter in den
      Kessel, kein Weg zurück – sobald beide unten sind, steigt die Lava; übers Eis, aufs Band, über drei Stege auf den
      Fels); Eis unter Pressen (auf dem Eis muss man früh gegensteuern, um vor einer Presse zu warten); über den Lavasee
      (der Affe schwingt an vier Haken, das Schweinchen segelt mit zwei Aufwinden, der See steigt langsam).
    - Etappe 3 (Spalten 400–600, Hebel-Ketten über der Lava): Hebel-Kette über den Lavasee (der Affe schwingt am Haken
      auf den Sims, Hebel 1 = Brücke 1; das Schweinchen zieht auf der Insel Hebel 2 = Brücke 2; drüben öffnet Hebel 3 das
      Tor, lässt aber die Lava im See und unter dem Gang dahinter steigen – zügig über die Stege nach oben); Platten-
      Staffel unter zwei schnellen Pressen (vor und hinter jeder Presse eine Druckplatte, die sie anhält: einer hält,
      der andere läuft durch und hält drüben, dann tauschen); zwei Lava-Gruben und eine breite Presse.
    - Etappe 4 (Spalten 600–800, Finale „der Krater läuft voll“): Kessel (sobald beide drin sind, steigt die Lava
      schnell – Band zum Pilz, Pilz auf den Steg, über zwei Stege auf den Kraterrand); Kraterschlucht (tief unten steigt
      die Lava; der Affe schwingt an vier Haken, das Schweinchen segelt mit zwei Aufwinden); Gipfel (zwei Pressen auf dem
      Kraterrand, dann das Ziel).
    - Test level22_kraterherz (Koop-Bot + Checkpoint-Abstände).

  - 6er-WELTEN (Nutzerwunsch: in jeder Welt 6 Level, schwer und immer schwerer; Wasser vorerst ausgenommen, Boss zählt
    nicht): Dschungel bekommt Level 5 „Dornenpfad“ und Level 6 „Wipfelsturm“ (vor Bruno), Ruinen bekommen Level 6
    „Tempelherz“. Höhle (6) und Vulkan (7) bleiben. Neue Dateien heißen wie im Editor <welt>/<nr>-<titel>.json, Namen in
    levels.json „Dschungel 5“ usw. Alle drei Level ~800 Spalten in 4 Etappen, jede Stelle braucht beide, Münzen nur
    blau/pink (gleich viele), Checkpoints höchstens ~61 Spalten auseinander (nie in getrennten Gängen oder hinter
    Türen, die nur der Hebel davor öffnet). Einstufung jeder Stelle im Balance-Bericht in WELTEN.md.
  - Level „Dornenpfad“ (levels/dschungel/05-dornenpfad.json, Dschungel Level 5, abends, Regen, 800 Spalten):
    - Etappe 1: Bröckel-Steine über Dornen (beide dicht hintereinander – wer trödelt, findet keine Steine mehr);
      Dornenfeld (Affe an vier Haken, Schweinchen per Pilz + Aufwind); Hebel über Kreuz (Hebel 1 nur per Aufwind,
      Hebel 2 nur per Haken); Stachelwand-Jagd (die Wand steckt in der Stufe, von der man in den Gang springt; Hebel 3
      öffnet Tür 3 UND lässt sie los).
    - Etappe 2: Inseln im Wechsel (vier Plattformen, zwei steigen, zwei sinken); Seilbahn + Fähre (Schweinchen lässt
      den Haken mit dem Affen fahren, Affe holt mit Hebel 5 die Fähre); hoher Kamin; Dornendecke (Hebel 6 öffnet die Tür
      am Tunnelende UND lässt die Stacheldecke sinken – über die Stufen nur flach springen, voller Sprung = Dornen).
    - Etappe 3: Takt-Steine 1,2 s; Stachel-Pendel (vier Stachelblöcke im eigenen Takt); Druckplatten-Schleuse (Platte 7
      = Tür 7, Affe über zwei Haken zu Hebel 8 = Deckel über dem Aufwind-Schacht); Pilz-Flucht vor der Stachelwand.
    - Etappe 4: Zwei-Gänge-Staffel (Affe nur durchs blaue Tor in den unteren Gang, Schweinchen nur per Aufwind in den
      oberen; Hebel 10–13 öffnen die Tür des anderen); Finale mit der schnellsten Stachelwand (Grube, Pilz über die breite
      Grube, unter der Dornendecke flach landen).
    - Test dschungel5_dornenpfad (Koop-Bot + Checkpoint-Abstände).
  - Level „Wipfelsturm“ (levels/dschungel/06-wipfelsturm.json, Dschungel Level 6, nachts, wechselnd, 800 Spalten):
    schwerstes Dschungel-Level vor Bruno.
    - Etappe 1: Luft-Tor über Dornen (Tor 1 setzt beide hoch über der Grube ab – Affe greift sofort den Haken,
      Schweinchen segelt); Brücke für die Partnerin (Affe auf Platte 2 = Brücke B, Schweinchen zu Hebel 3, Affe an zwei
      Haken nach); Takt-Treppe im 1-s-Takt; Jagd durchs Tor (am Gangende bringt Tor 2 beide durch die Felswand).
    - Etappe 2: Wippende Haken (zwei fahren hin und her) und Aufwinde; Tor-Staffel (pinkes Tor -> Hebel 5 = Tür 5 für den
      Affen, blaues Tor -> Hebel 6 = Tür 6 für das Schweinchen); Pilz-Turm über Dornen; Bröckel-Abstieg.
    - Etappe 3: Hohes Luft-Tor (drei Haken, der letzte fährt / Aufwind); Takt-Steine 1 s; Wechsel-Schleuse (Platte 7 =
      Brücke B + Wand A weg, Hebel 8 öffnet eine Klappe im Boden, darunter bringt das blaue Tor den Affen nach);
      Doppel-Jagd (Hebel 9 = Tür 9 + Stachelwand + sinkende Dornendecke).
    - Etappe 4: Wipfel-Staffel (blaues Tor auf den oberen Ast mit Haken über Dornengruben, pinkes Tor in den Gang mit
      Takt-Steinen 1,2 s; Hebel 10–13 über Kreuz); Sturm-Finale (schnellste Stachelwand 5,4; Pilz über die breite Grube,
      dann die Stege hinauf, bevor die Wand unten durchfährt; Ziel oben).
    - Test dschungel6_wipfelsturm.
  - Level „Tempelherz“ (levels/ruinen/06-tempelherz.json, Ruinen Level 6, nachts, Regen, 800 Spalten): schwerstes
    Ruinen-Level – Fels, Fallen, Licht, Teleporter und Wechselboden gleichzeitig.
    - Etappe 1: Fels unter dem Pfeilregen (Hebel 1 = Tor 1 + Fels; vier Pfeil-Fallen im 1,2-s-Takt); Schweinchen-Spiegel
      auf der Insel (nur segelnd, Licht -> Kristall -> Tür 2), Affe an zwei Haken; Affen-Spiegel am Sims (nur per Haken,
      Licht -> Kristall im Boden -> Tür 3); Fels-Flucht durch die Tore (blau/pink hinauf auf den Sims).
    - Etappe 2: Takt-Steine 1,2 s mit Fels im Nacken; Licht-Takt-Tor (ein Takt-Stein unterbricht den Strahl, Tor 8 nur
      offen, solange der Kristall leuchtet, Pfeil im Tor); Pfeilgang mit Brücke (Platte 9 = Brücke B, Hebel 10, Affe an
      zwei Haken); Flammen-Welle mit Fels im Nacken.
    - Etappe 3: Wechsel-Flucht unter Pfeilen (Hebel 12 = Tor + Fels + Boden weg, Trittsteine erscheinen); Licht-Brücke
      (Brücke steht nur, solange der Kristall leuchtet, Takt 1,5 s); Flammen-Kreuz (Affe oben per Haken über Flammen-
      Düsen, Schweinchen unten per pinkem Tor; Hebel 14/15 über Kreuz); Fels und Licht-Tor (Spiegel im Laufen drehen).
    - Etappe 4: Doppelstrahl-Tor (Affen-Spiegel per Haken -> Tür 18, Schweinchen-Spiegel auf der Insel -> Tür 19, ein
      Takt-Stein unterbricht Strahl 2 – im Fenster durch beide Türen); letzte Felsflucht (Grube, zwei Pfeil-Fallen,
      Flammen-Düse, Stege) zum Tempelherz.
    - Test ruinen6_tempelherz.
    - Test level21_feuerschlund (Koop-Bot + Checkpoint-Abstände).
    - Test level20_schlackewerk (Koop-Bot + Checkpoint-Abstände).

### 3D-Figuren (Affe und Schweinchen als 3D-Fellfiguren; js/33-figuren-3d.js)
- Affe und Schweinchen werden als echte 3D-Figuren mit Fell gezeichnet (WebGL2, eigene kleine Leinwand je Bild, als Bild an die
  Stelle der Figur gemalt). Nur Zeichnen: Physik, Kollision, Kamera, Stauchen, Schatten und Seil bleiben die des Spiels.
  Immer an (Taste 3 zum Umschalten auf die bisherigen Figuren entfernt, Nutzerwunsch). Schritte: fest „viele kleine“
  (Taste 4 und Umschalt-Knopf entfernt, Nutzerwunsch). Adresse: ?fell=0.4 (Haardichte), ?schichten=18 (Fell-Schichten).
- Posen: Stehen (dreht sich nach ~4 s Stillstand zur Kamera, danach ab und zu ein Leerlauf-Trick: Affe Salto/Radschlag/
  Kombi, Schweinchen Schraube/Pirouette/Kombi), Laufen, Sprung (Arme hoch/seitlich), Sprung-Tricks (Salto, Drehung,
  Schraube), Wandsprung-Salto, Wand-Rutschen, Haftfläche (Arme greifen abwechselnd, nie über den Rand), Seil (Hand über
  Hand), Dash (eingerollte Rolle), Schirm-Gleiten (bisheriger 2D-Schirm über der Figur).
- Haftfläche: Affe und Schweinchen haben beim Hangeln dieselbe Armlänge (Faktor 3,0, `HAFT_ARM`; Affe vorher 4,5 –
  Nutzerwunsch). Test figuren3d_haft_arme.
- Hebel: die Figur dreht sich zum Hebel ins Profil, greift mit langem Arm nach vorn und zieht herunter. Test figuren3d_hebel.
- Siegestanz: stehen beide nah beieinander, haken sie die inneren Arme ein und hüpfen im Takt, jeder 4. Takt eine
  gemeinsame Pirouette; sonst jubeln beide mit erhobenen Armen. Am Ziel-Baum (Dschungel) wie bisher: erst Tanz, dann hinein,
  Tür zu. Test figuren3d_siegestanz.
- Umkleide (js/27): die Brille sitzt als Auflage auf den 3D-Augen – von vorn beide Gläser, von der Seite ein schmales Glas
  mit Bügel. Jede Brille (auch an den bisherigen Figuren) hat vorn einen Steg über der Nase und an beiden Seiten
  einen Bügel: werden nach den Gläsern gezeichnet, setzen am Glasrand an, etwas kräftiger und mit feinem dunklem Rand (vorher
  unter großen Gläsern wie Herz/Stern verdeckt bzw. auf dem Fell kaum zu sehen; Cyber-Brille ohne Bügel). Test
  brillen_steg_und_buegel. Das Tattoo geht über die ganze Figur (Nutzerwunsch): das Muster (tattooPattern) wird einmal in eine Textur
  gerechnet, die vorn und gespiegelt hinten um die Kugel liegt, und färbt das Fell von Kopf/Körper, Armen und Ohren
  (vor und nach dem Licht, damit es kräftig bleibt) – wölbt sich mit, dreht sich mit, auch von der Seite und hinten sichtbar;
  Augen, Schnauze und Gesichtsmaske liegen darüber und bleiben frei. Früher ein flaches Bild über dem Gesicht.
  Roll-Spur, Aura, Begleiter und kreisende Objekte wie bisher um die Figur. Test figuren3d_brille_tattoo.
- Kein WebGL2 oder nur Software-Grafik (z. B. SwiftShader, wenn Chrome die Grafikkarte nicht nutzt – dort kostet eine Figur
  ~0,5 s je Bild): die bisherigen Figuren bleiben. Erzwingen zum Ausprobieren/Testen: ?d3=1 oder window.figuren3dErzwingen.
  (Der automatische Testrechner hat nur Software-Grafik: die großen Tests laufen dort mit den bisherigen Figuren, die
  3D-Tests erzwingen 3D.)
- Behoben: „3D aus“ (Taste 3) rief eine nicht vorhandene Funktion auf (Fehler bei jedem Bild, Figuren verschwanden) – die
  Taste ist inzwischen ganz entfernt.

### Neue Figuren (Affe und Schweinchen mit runden Stummelfüßen und Armen; js/10c-fuss-figuren.js)
- Die Figuren sind jetzt Kopf + Arme + Stummelfüße statt der rollenden Kugel. (Taste **B** zum Umschalten auf die alte Kugel
  entfernt, Nutzerwunsch; die Kugel-Zeichnung bleibt im Code.) Mit den 3D-Figuren (js/33) sind diese Figuren nur noch der
  Rückfall ohne WebGL2/Grafikkarte.
- Posen: Stehen, Laufen, Bremsen, Landen, Hoch/Runter, Wandrutschen (liegt an der Wand), Haften an der Decke, Seil, Dash, Schirm-Gleiten, Siegestanz.
- Sprung-Varianten: nach einem normalen Sprung kommt immer eine Variante (Vorwärtsrolle oder Salto), auf Dauer je 1/3; gilt auch für Wandsprünge.
- Seitwärtsrolle (Nutzerwunsch): vierte Sprung-Variante – die Figur dreht sich einmal um die Hochachse (Seite -> von vorn ->
  andere Seite -> von hinten -> Seite, 0,6 s). Jetzt: nach einem normalen Sprung je 1/3 Rolle, Salto oder Seitwärtsrolle; nach
  einer Variante 50 % normal, sonst eine der drei. Bricht wie die Rolle bei Schirm/Seil/Dash/Wand ab.
- Affengesicht in der Drehansicht (Seitwärtsrolle, Langeweile von vorn): EIN Gesicht, dessen Teile (Maske, Augen, Wangen,
  Nase, Mund) mit dem Blickwinkel wandern und am Kopfrand verschwinden – früher wurden Seiten- und Vorder-Gesicht übereinander
  geblendet (Zwischenbilder mit drei hellen Kreisen). Prüfbild-Helfer figurDrehungZeichnen(c, male, th).
  Bei jedem Absprung vom Boden und jedem Wandsprung wird gewürfelt (nach einer Variante 50 % normal, 25 % Rolle, 25 % Salto;
  Wandsprung nur vorwärts). Die Drehung dauert ~0,6 s (`ROLL_ZEIT`), fängt sofort an und läuft in einem Rutsch durch;
  landet die Figur mittendrin, dreht sie in 0,15 s zu Ende (vorher brach sie beim Landen schlagartig ab). Auch der erste
  Wandsprung einer Figur zählt (vorher nie). Mit Schirm, am Seil, beim Dash und an der Wand läuft sie weich aus.
  Test neue_figuren_sprung_rolle.
- Kante (Nutzerwunsch): Steht der Fuß nicht mehr auf dem Boden (unter Mitte ± `KANTE_FUSS` 4 px trägt nichts), rutscht
  eine stehende/langsame Figur mit `KANTE_RUTSCH` 1,2 px je Schritt über die Kante und fällt (`kanteAbrutschen` in
  js/32-neue-bewegung.js, Werte in 02). Vorher „schwebte“ sie bis ~14 px über dem Abgrund (die Kollisions-Box ist breiter
  als die Füße). Wer läuft, ist schneller und wird nicht beeinflusst; wer zurückläuft, rutscht nicht – Sprungweiten bleiben.
- Fast runterfallen: ist eine Figur an die Kante GELAUFEN und steht still (Mitte höchstens `KANTE_WACKEL_RAND` 8 px vor
  der Kante, `kanteRichtung`), dreht sie sich zum Abgrund, steht auf dem hinteren Fuß, der vordere hängt über der Kante,
  der Körper kippt vor und zurück und beide Arme kreisen über dem Kopf (`kantePose`, Takt `KANTE_TAKT` 0,9 s). Nicht nach
  einer Landung; wer normal läuft, fällt einfach runter. Nur Zeichnen (js/10c). Test neue_figuren_kante_wackeln.
- Langeweile / Leerlauf-Aktionen: nach 15 s ohne Eingabe (`IDLE_START`) dreht sich die Figur nach vorn und macht im Wechsel
  Unsinn – jede Figur hat ihre eigenen Aktionen (zufällig, nie zweimal dieselbe hintereinander; jede Eingabe beendet es):
  - Affe: Disco (Arme abwechselnd hoch, Füße stampfen), Hüpfen mit Armen oben, Salto, Klatschen über dem Kopf, Kopf
    kratzen, **Seilspringen mit einer Liane** (die Liane schwingt um ihn herum, vorne/hinten richtig verdeckt).
  - Schweinchen: Hin- und Herwackeln, Knicks, Tippeln von Fuß zu Fuß, Spielen mit dem Schirm und **Schirm-Böe** (ein
    Windstoß hebt sie am Schirm kurz an). Bei beiden Schirm-Aktionen ist es der **Original-Schirm** aus dem Spiel.
- Seil als **Liane** (Nutzerwunsch, `lianeZeichnen` in js/10-figuren-zeichnen.js): grüner Strang mit hellem Kern, leicht
  durchhängend, kleine Blätter; gedehnt wird sie wie bisher dünner, orange-rot und zittert (Blätter fallen dann weg).
- Greift der Affe mitten in einer Rolle/einem Salto den Haken oder dasht eine Figur, läuft die Drehung schnell aus (wie beim
  Schirm): am Seil hängt er aufrecht, beim Dash zeigt die Figur in Dash-Richtung. Test neue_figuren_drehung_seil_dash.
- Seil: das Seil endet an der Hand des Affen. Schirm: beim Gleiten ist es der **Original-Schirm**; der Griff sitzt in der Hand
  des Schweinchens, der Schirm zeigt immer senkrecht nach oben; sobald der Schirm offen ist, läuft eine Rolle/Dash-Haltung
  schnell aus und das Schweinchen hängt aufrecht darunter.
- Cosmetics im Gesicht: **Brille und Tattoo** (Packages) werden auch an den neuen Figuren gezeichnet – in der Seitenansicht
  ein Glas am sichtbaren Auge mit Bügel, in der Vorderansicht (Leerlauf) beide Gläser und das Tattoo. Test neue_figuren_brille_tattoo.
- Tests, die die alte Kugel prüfen (himmel_ohne_unsichtbare_decke, cosmetics_zeichnen_rollfest, figuren_rollen_rund), schalten
  dafür bewusst kurz auf die Kugel um (`NEUE_FIGUREN = false`, danach zurück). Test neue_figuren_zeichnen.
- Nur Aussehen: Physik, Trefferflächen und Level unverändert (Hilfswerte `_moveDir`, `_wjT` in 08 nur fürs Zeichnen).

### Computer-Partner (nur Testmodus – das normale Zwei-Spieler-Spiel bleibt unverändert)
- Im Editor-Test („▶ Testen“) steuert auf Wunsch der Computer die zweite Figur (Auswahl `#partnerWahl` neben „Testen“:
  „Partner aus“ / „Ich bin der Affe“ / „Ich bin das Schweinchen“; gemerkt in localStorage `monchichi_partner` {an, ich}).
  Im normalen Spiel ist er nie aktiv (Schalter `PARTNER_IM_HAUPTSPIEL` = false in js/02-physik-werte.js).
- Ich steuere meine Figur mit ALLEN Tasten (Affe- und Schweinchen-Tasten und beide Controller). Der Partner drückt
  dieselben Tasten wie ein Spieler (eigene „virtuelle Tasten“ im Eingabe-System, js/03) – keine Sonder-Physik.
- Folgen (js/30-partner.js): gemütlich hinter mir (ca. 2 Kästchen, auf seiner Seite), läuft nicht voraus, bleibt im
  Bild, holt auf, wenn er zurückfällt. Er rechnet seine Sprünge mit der echten Physik voraus (Laufen, Springen,
  Wandsprung/Kamin, Haken und Seil, Schirm/Segeln, Aufwind, Pilze, Stege, bewegte Böden, Bröckelboden) und plant
  Wege über mehrere Etappen (Umwege, Kamine). Reaktionszeit 9–15 Spielschritte (wie ein Mensch).
- Gefahren: Stacheln (auch mitfahrende), Lava, Wasser (meidet er), Flammen im Takt, Pfeile, Pressen, Felsen,
  Herunterfallen. Weicht der Sprung von der Vorausrechnung ab, bremst er sofort (Notbremse). Vor Stachelwänden
  (Jagd) flieht er sofort nach vorn. Er bringt MICH nie absichtlich in Gefahr: Nummern, die Felsen, steigende Lava
  oder Stachelwände auslösen, betätigt er nie; einen Wechselboden, auf dem ich stehe, schaltet er nicht weg.
- Begleiter-Aufgaben (js/31-partner-aufgaben.js): an Rätseln erledigt er seinen Teil laut Begleitdatei
  `levels/partner/<welt>/<datei>.json` (das Level-Format bleibt unverändert): Hebel, Platte halten (bis ich durch die
  Tür bin), Spiegel, Wechselboden, Tür, Haken, Segeln, „Ablauf“ (Schritte wie der Koop-Bot). Felder: zone, rolle
  (m/f/beide – passt sie nicht, ist es MEINE Aufgabe und er folgt), wann, bis, zeit, ziel, stand, stellung, text.
  Ohne Eintrag hilft er bei einfachen Fällen selbst (Auto-Aufgabe): geschlossene Tür vor mir, Hebel/Platte dazu in
  der Nähe -> er geht hin.
- Steuerung im Test: Q = „Warte hier“ / „Komm her“ · E = „Mach deine Aufgabe jetzt“ · V = Rollen tauschen (ich
  übernehme die andere Figur) · P = Partner an/aus. Controller: L1 = warten/komm, R1 = Aufgabe jetzt, Share = tauschen.
- Anzeige über dem Partner: 🤖 folgt · ✋ wartet · 🔧 Aufgabe (mit Text) · ⚠ „hängt fest – ruf mich (Q)“. Kommt er
  ca. 10 s nicht weiter, drückt er keine Tasten mehr, bis ich ihn rufe oder zu ihm komme.
- Werkzeug `tests/partner_aufgaben_pruefen.py --level <welt>/<datei> [--schreiben]` (oder `--welt <welt>`): probiert
  jede Hebel-/Platten-Nummer mit beiden Figuren aus und schreibt die Begleitdatei (mit Probe für den Test); was er
  nicht schafft, steht dort unter „offen“. Von Hand ergänzte Aufgaben („von_hand“: true) bleiben erhalten.
- Grenzen (ehrlich): Licht-/Spiegel-Labyrinthe löst der Mensch; Jagden startet er nie; manche Kamine und
  Reihenfolge-Stellen (Liste „offen“ je Level); Bosse ohne Aufgaben; Wasser meidet er; pendelnde Haken kennt seine
  Vorausrechnung nicht; Höhle/Vulkan/Wasser noch ohne Begleitdateien (dort nur Folgen + Auto-Aufgaben).
- Tests: partner_geruest, partner_nicht_im_normalen_spiel, editor_partner_wahl, partner_folgt_gemuetlich,
  partner_gefahren, partner_aufgaben_mechaniken, partner_auto_aufgaben, partner_steuerung,
  partner_aufgaben_dschungel, partner_aufgaben_ruinen, partner_koop_dschungel.

### Nacht-Ausbau: Dash, Durchbruch-Wand, Wand-Rutschen, Haftfläche, Tasten frei belegen
Harte Regel: Sprung, Wandsprung, Haken/Seil, Laufen, Schwerkraft, Segeln, Schweben, Aufwind und Pilze sind unverändert –
wer die neuen Tasten nicht benutzt, spielt Schritt für Schritt genau wie vorher (Beweis: Test `bahnen_alte_mechaniken`,
Referenz `tests/bahnen_referenz.json` vor dem Ausbau aufgezeichnet). Einzige neue Wirkung ohne neue Taste: das
Wand-Rutschen (unten). Alle Werte als Konstanten in `js/02-physik-werte.js` (DASH_*, BRUCH_*, WAND_RUTSCH_MAX_FALL,
HAFT_*); die Logik steht in `js/32-neue-bewegung.js`, die Elemente in `elemente/durchbruch.js` und `elemente/haftflaeche.js`.
- **Dash** (beide Figuren; Affe K, Schweinchen Num 3, Controller △ / Y – frei belegbar): kurzer, schneller Stoß in
  8 Richtungen (Richtung = gedrückte Richtungs-/Hoch-/Runter-Tasten; nichts gedrückt = Blickrichtung; am Seil ohne
  Richtung = Schwung-Richtung). Am Boden und in der Luft. Strecke ≈ 4,5 Kästchen gerade, ≈ 3,4 / 3,3 schräg
  (DASH_TEMPO 16 × DASH_DAUER 10 Schritte). Danach bleibt die Hälfte des Tempos (DASH_BEHALTEN), nach oben
  höchstens so viel Aufwärts-Schwung wie ein normaler Sprung. Ein Dash in der Luft (DASH_LUFT 1); Aufladen immer, auch in der Luft
  (Nutzerwunsch; früher nur mit Halt: Boden, Wand, Haken, Haftfläche, 54 Schritte) – dauert DASH_LADEZEIT 120 Schritte
  (≈ 2,0 s; Nutzer prüft die Dash-Tunnel und Verfolgungen von Hand), voll = kurzes „Pling“. Anzeige: kleiner Punkt
  über der Figur, nur solange der Dash fehlt/lädt bzw. kurz nach dem Aufladen. Tastendruck wird 5 Schritte gemerkt
  (DASH_PUFFER). Kurzer Trefferstopp (2 Schritte, ganzes Spiel), leichtes Kamera-Wackeln, Nachbilder, Staub, Ton.
  - Zusammenspiel: Dash aus dem Seil-Schwung löst das Seil; Haken greifen während des Dashs beendet ihn (Seil übernimmt);
    Schirm klappt beim Dash zu und geht danach wieder auf (Taste gehalten); Sprungpilz übernimmt (normaler Pilz-Sprung);
    Aufwind und bewegte Plattformen wirken nach dem Dash wie immer; gegen eine Wand = Stopp mit „Tock“, danach ist ein
    normaler Wandsprung möglich. Im Wasser kein Dash. Kein Durchtunneln: der Dash bewegt sich in Teilschritten ≤ 8 px.
- **Durchbruch-Wand** (Editor: Gelände → „Durchbruch“): rissige Steinkästchen, fest wie Wand/Boden – nur ein Dash
  zerbricht sie (Laufen/Springen nicht). Trefferstopp 3 Schritte, starkes Wackeln, Bruchstücke und Staub je Welt in
  passender Farbe (Höhle/Vulkan mit glühenden Rissen), 80 % des Schwungs bleiben (BRUCH_BEHALTEN), danach 14 Schritte
  lang ein Sprung in der Luft (BRUCH_FENSTER). Früher ging darin auch ein kostenloser Anschluss-Dash – raus (Nutzerwunsch:
  ein Dash, dann muss er erst wieder aufladen). Senkrecht und waagerecht baubar
  (auch Dash nach unten durch einen Bruch-Boden). Option „Nach dem Bruch“: bleibt kaputt (Standard, bis Neustart bzw.
  Tod) oder wächst nach 2/3/5/8 s nach – steht dort jemand, wartet es (blinkender Umriss), niemand wird eingeklemmt.
- **Wand-Rutschen** (automatisch, keine Taste): wer an einer Wand schneller als 4,5 herunterfällt, rutscht gebremst mit
  höchstens WAND_RUTSCH_MAX_FALL 4,5 (Rutsch-Haltung, Kratz-Staub, leises Schaben). Nicht beim Segeln, nicht am Seil,
  nicht im Dash. Der Wandsprung ist der alte (gleiche Werte, gleiche Bedingungen) – er geht auch mitten im Rutschen.
- **Haftfläche** (Editor: Gelände → „Haftfläche“): Wand-/Deckenkästchen mit Honig-Schicht NUR an der Unterseite
  (Nutzerwunsch; Band an den runden Ecken passend abgeschnitten, Tropfen darunter). Wer darunter „hoch“
  hält (Affe W, Schweinchen ↑, Controller Steuerkreuz hoch bzw. Stick hoch), hält sich von unten fest und hangelt mit
  links/rechts entlang (greifen klappt schon, wenn der Kopf in den Honig-Tropfen hängt: bis HAFT_FANG 12 px unter der
  Kante, vorher 2,5 px – Nutzerwunsch; man wird dann an die Fläche hochgezogen) – langsamer als Laufen (HAFT_TEMPO 4,2),
  mit Schwung (kein Sofort-Stopp). Am Ende der Fläche bzw. an einer Wand hält man an – NICHT mehr um die Kanten herum
  an der Seite hoch oder oben drauf (Nutzerwunsch, früher ging das). „Hoch“ loslassen = fallen. Springen = Absprung
  nach unten-vorn. Dash geht von dort (kostet einen Punkt; „hoch“ zählt an der Unterseite nicht als Dash-Richtung).
  Haken greifen = loslassen. Sonst ist eine Haftfläche eine normale Wand (Boden oben, Wandsprung an der Seite).
  Am freien Ende hält die hangelnde Figur an (Nutzerwunsch): ihre Mitte bleibt `HAFT_RAND` 8 px vor der Kante, Tempo 0, die
  Hangel-Bewegung stoppt (vorher rutschte sie jeden Schritt ein Stück weiter und „hangelte in der Luft“; `haftWeiter`).
  Gilt auch für bewegte Haftflächen. Test haft_ende_anhalten.
- **Bewegte Haftfläche** (Nutzerwunsch): im Editor lässt sich eine Haftfläche mit dem Werkzeug „Bewegung“ zum Ziel
  ziehen (wie Boden/Wand; Export als bewegtes Stück mit look 'haft', im Spiel Wand-Aussehen + `haft: true`). Wer sich
  darunter festhält, fährt mit (`updateMovingPlatforms`), kann unter ihr hangeln (bis zu ihrem Ende) und an jeder
  beliebigen Stelle loslassen. Fährt sie die Figur gegen eine Wand oder in den Boden, lässt die Figur los. Test haft_bewegt.
  Übereinander/nebeneinander gesetzte bewegte Kästchen derselben Gruppe sind EIN Block: gelbe Schicht nur ganz unten
  (`haftBewegtBelegt`, auch mit Wand-Kästchen darüber); sitzt der Block in der obersten Reihe, läuft er wie feste Flächen
  über den oberen Bildrand hinaus (nur gezeichnet, `MAT_BEWEGT_RAND`). Test haft_bewegt_aussehen.
- **Tasten belegen** (Optionen → „⌨ 🎮 Tasten belegen …“): Spieler 1 und Spieler 2 getrennt, alle Aktionen (links,
  rechts, springen, Fähigkeit, hoch, runter, Hebel, Dash), Tastatur UND Controller. Aktion anklicken bzw. mit
  Bestätigen wählen → neue Taste / neuen Knopf drücken (Controller: alle Knöpfe, Schultertasten und Trigger); Esc
  (Controller: Options) bricht ab. Gesperrt: Esc, Enter, Tab, R, F, M, C, X, P, Q, E, V, T, Z, H, Rücktaste
  (Controller: Options, Share, PS-/Xbox-Taste). Doppelte Belegung wird sofort rot markiert; das Menü lässt sich erst
  verlassen, wenn alles aufgelöst ist (oder man verwirft die Änderungen). „Auf Standard zurücksetzen“ je Spieler.
  Controller-Belegung gilt je Spieler UND je Controller-Typ (PlayStation, Xbox, anderer – erkannt am Gerätenamen);
  ein anderer Typ hat seine eigene Belegung bzw. die Standard-Belegung. Laufen/Zielen geht immer auch mit dem linken
  Stick. Gespeichert unter `monchichi.tasten` (Standard-Belegung = genau die bisherige, neu nur Dash). Die Anzeige
  oben im Spiel, die Steuerungs-Karten in den Optionen und die Spielerwahl zeigen die aktuelle Belegung. Alter
  Spielstand ohne Tasten-Eintrag -> Standard. Echte Controller sind nicht getestet, nur ein simulierter Controller.
- Testlevel `levels/test/neue-mechaniken.json` (`index.html?testlevel=neue-mechaniken`), Bahnen-Testlevel
  `levels/test/bahnen.json`. Tests: bahnen_alte_mechaniken, dash_richtungen_und_laden, durchbruch_wand, wand_rutschen,
  haftflaeche, tasten_belegen_menue, tasten_controller_je_typ, tasten_alter_spielstand, element_register.

### Nacht-Ausbau Phase 3: neue Mechaniken in den Leveln (Dschungel, Ruinen, Höhle, Vulkan)
Wasserwelt, Boss-Level und Spielwiese sind unverändert. Pflicht-Stellen (auf dem Hauptweg) nur dort, wo kein alter
Level-Test läuft; alles andere sind **optionale** Stellen mit einer Münze als Belohnung (Weg und Rätsel bleiben gleich).
- **Pflicht-Stellen:** Dschungel 3 (Lianenschlucht): zwei Haftdecken über Stachelgruben (196–207, 520–528), drei
  Durchbruch-Säulen (322, 570 mit Grube dahinter = Bruch-Fenster-Sprung, 676). Dschungel 4 (Glühwald): Haftdecke über der
  Dornengrube 272–285. Dschungel 1: sanfte Probe – Durchbruch-Wand 715 unter dem Münz-Sims (oben herum per Lift geht auch).
- **Optionale Bausteine** (jede Stelle per Bot geprüft, mit Gegenprobe ohne die neue Mechanik; Liste und Pläne in
  `tests/bausteine/stellen.py`, Tests `nacht_stellen_<welt>`):
  - **S1 Versteck:** zwei Durchbruch-Kästchen im Boden, darunter eine Mulde mit einer Münze (Dash nach unten öffnet sie,
    hinausspringen). Je 3 in fast allen Leveln (Förderwerk 1, Schlackewerk/Feuerschlund 2; keine in Dschungel 1/3,
    Leuchtgrotte, Tiefenschlund – dort ist kein Platz unter dem Boden). Übersicht je Level: NACHT-BERICHT.md.
  - **S2 Haft-Arm:** ein Felsarm mit Haftfläche ragt über einen Abgrund; die Meister-Münze hängt unter dem Arm-Ende – nur
    hängend erreichbar (hin- und zurückrollen). Auch gespiegelt (Arm nach links).
  - **S3 Haft-Insel:** schwebende Haftfläche 4 Reihen über flachem Boden (ein Sprung schafft nur 3): darunter festhalten,
    um die Ecke hinauf rollen, oben liegt die Meister-Münze.
    **Seit „Schleim nur unten, kein Hochziehen an den Seiten“ (Haftfläche) geht das nicht mehr; Nutzer-Entscheidung: die
    Regel bleibt, die 13 Meister-Münzen auf den Haft-Inseln bleiben liegen und sind nicht mehr erreichbar**
    (Stellen-Prüfung abgeschaltet: `HAFTINSELN_ERREICHBAR` in tests/bausteine/stellen.py).
  - **S4 Durchbruch-Nische:** ein Durchbruch-Kästchen in einer Wandfläche, dahinter eine Münze (Dash hinein).
  - Ab Dschungel 3 hat jedes Level mindestens 2 Haftflächen, ab Dschungel 2 mindestens 3 Durchbruch-Wände (Ausnahme
    Tiefenschlund: 2 – mehr freie Wandflächen gibt es dort nicht).
  - Optionale Bausteine zählen NICHT als Kombi-Stelle (`tests/kombi_pruefen.py` nimmt S1–S4 aus).
- **Münz-Klassen in allen Welt-Leveln** (`tests/bausteine/muenzen.py --einstufen`): Pfad (höchstens 2 Reihen über einer
  Stehfläche), Geschick (alle anderen, auch Münzen in Verstecken/Nischen), Meister (Haft-Arme, Haft-Inseln, Haftdecken
  in Dschungel 3/4 – je Level ab Dschungel 3 mindestens 2). Anzahl, Reihenfolge, Farbe und Lage der Münzen sind gleich
  geblieben (verschobene Münzen behalten ihren Platz in der Liste). Test muenz_klassen_level.
- **Checkpoints:** 11 neue Checkpoints in Lücken über 60 Spalten (Lianenschlucht 483, Sonnentempel 367, Tropfsteingang
  231/432, Eisgrotte 40, Leuchtgrotte 597, Glutpfad 371, Aschefeld 379, Magmakammer 404/755, Kraterherz 90) – nur auf
  Wegen, die die alten Bot-Tests gehen, nie in Jagden (Fels, steigende Lava, Fahrten), nie in Zwei-Wege-Staffeln, nie
  zwischen Hebel und Tür, nie in bewusst langen Rätsel-Abschnitten. Drei alte Checkpoints standen ungünstig und sind um
  1–2 Spalten verschoben: Dschungel 1 (232 -> 230, Schweinchen landete auf dem Pilz), Glühwald (177 -> 175, Teleporter),
  Tempelherz (340 -> 341, Flammenstrahl). Neuer Test checkpoints_sicher: an jedem Checkpoint jedes Welt-Levels stehen
  beide Figuren nach dem Wiedereinstieg 1 s lang sicher.
- Vom Nutzer gestaltete Level (Dschungel 2, Ruinen 1, Mondnacht) haben nur optionale Ergänzungen bekommen (Verstecke,
  Haft-Inseln, Münz-Klassen) – Checkpoints und Wege dort sind unverändert.

### Umbau aller Level an den Dash (nach dem Nacht-Ausbau; Stand und Einzelheiten: UMBAU-STATUS.md)
Mit dem Dash kommt man viel weiter (Sprung + Dash ~16 Kästchen, Schweinchen Schirm + Dash ~25). Die Level sind so
umgebaut, dass Haken, Pilz, Schirm, Aufwind und Kamine wieder gebraucht werden und Verfolgungen Spannung haben.
Wasserwelt, Boss-Level und Spielwiese sind unverändert.
- **Hilfs-Stellen dashfest:** Pilz-Gruben -> Pilz-Dash-Gruben (Landeplatz 9 Reihen hoch: nur Pilz + Dash reicht), breite
  Haken-Gruben (>= 17), Kamin-Gruben mit Landeplatz >= 17 Spalten hinter dem Kamin (alle 34 Kamin-Gruben in Ruinen/Höhle/
  Vulkan sind 17 breit mit drei Haken; einige Level dadurch bis 832 Spalten lang), Flammen-/Lava-Kamine 3 Reihen höher,
  Baumstämme zwischen Pilz-Türmen (kein Turm-zu-Turm-Sprung mehr), Rollen-Stellen so, dass die andere Figur sie auch mit
  Dash nicht allein schafft (z. B. Baumkronen fahrender Haken 13, Dornenpfad Seilbahn).
- **Abkürzungen geschlossen** (Werkzeug tests/umbau/abkuerzungen.py): Kristallhöhle (Haken-Gruben 35/200, obere Route nur
  fürs Schweinchen, Ziel mit Haken-Kette und Aufwind), Eisgrotte (Hebel 4 nur fürs Schweinchen), Fallengang (Pfeil-Galerie),
  Mondnacht (Hakenreihe, Mondspiegel mit Stachel-Decke), Feuerberg (Ziel-Plateau höher). Ruinen 1 Fähre/Insel neu (Tunnel unter Stachel-Decken, Druckplatten, Aufwinde); Kraterherz Lava-Brücken breiter.
- **Münzen** auf den echten Bahnen ihrer Figur (blau = Affe, pink = Schweinchen), per Bot eingesammelt – auch an Haken-Ketten, Pilzen, Aufwinden und Fahrten (Test muenzen_haken_ketten, Münz-Protokoll MUENZ_LOG im großen Lauf).
- **Verfolgungen schneller:** Stachelwände und rollende Felsen fahren so schnell, dass man ohne Dash eingeholt wird
  (Ruinen 1 7,4/7,2; Mondnacht Doppel-Wand 6,2/6,8; Dornenpfad 5,6/5,8/7,4; Wipfelsturm 8,4/8,0/6,6; Baumkronen 7,4/6,6; Felsenflucht bis 14; Tempelherz
  bis 14). Fluchten mit Wartestellen (Pfeile, Flammen, Takt-Steine) so schnell, wie das Warten erlaubt (6–7). Steigende
  Lava eine Stufe schneller, wo die Level-Tests es zulassen (zweite Runde: Glutpfad Lava-Raum 1 mittel, Lava-Raum 2
  schnell, Magmakammer Steinweg mittel – nur mit Dash). Feuerberg-Wand bleibt 4,5 (Pilz-Strecke).
- **Dash-Ketten (Dash-Tunnel):** niedrige Decke (3 Reihen), Stachelgruben, dazwischen Podeste – zwei bis drei Dashes kurz
  hintereinander, auf dem Podest warten, bis der Dash wieder voll ist (sofort weiter = Absturz). Wipfelsturm vor dem Ziel,
  Sonnentempel vor dem Ziel (3 Gruben), Tropfsteingang vor dem Ziel (3 Gruben), Schlackewerk vor dem Ziel, Kraterherz
  vor dem Ziel (3 Gruben). Werkzeug `tests/umbau/dash_tunnel.py`, Tests `dash_ketten_<welt>`.
- **Checkpoints frei:** keine Fahne steckt in Boden, Wand oder Tür und keine schwebt (12 Checkpoints verschoben: eine
  Spalte zur Seite bzw. auf den Boden darunter; Werkzeug tests/umbau/checkpoints_frei.py, Test checkpoints_frei).
- **Pflicht-Durchbruch** auf dem Hauptweg (Säule: unten Durchbruch, darüber Wand bis oben – nur per Dash): Baumkronen 172,
  Dornenpfad 298, Wipfelsturm 381, Ruinen 1 296, Sonnentempel 331, Felsenflucht 532, Kristallhöhle 115, Tropfsteingang 585,
  Förderwerk 392, Schlackewerk 194, Feuerschlund 589; zweite Runde: Mondnacht 342, Fallengang 356, Tempelherz 590,
  Eisgrotte 196, Leuchtgrotte 381, Tiefenschlund 511, Glutpfad 392, Aschefeld 176, Feuerberg 287, Magmakammer 7 (gleich am
  Start), Kraterherz 390 – damit hat jedes Level mindestens eine Pflicht-Stelle. Der Computer-Partner dasht
  durch Durchbruch-Wände.

### Design-Politur (nur Aussehen und ein Menü-Klang – Spielablauf, Trefferflächen, Physik und Level-Format unverändert)
- **Schärfe und Tempo:** Die Leinwand hat bis zur 4K-Breite echte Bildschirm-Pixel (`LEINWAND_MAX_BREITE` 3840, vorher
  2560). Die Dunkel-Schicht (Nacht, Höhle, Dunkelzonen) wird in halber Auflösung gezeichnet (`DUNKEL_AUFLOESUNG`) – bei
  doppelter Pixeldichte 2–4 ms statt bis 90 ms je Bild. Test leinwand_scharf_und_schnell (DPR 2, Grenze
  `ZEICHNEN_MS_GRENZE` 20 ms je Bild in allen Welten, Mittag und Nacht).
- **Zentrale Look-Tabelle** `DESIGN_LOOK` (js/10b-design-look.js) je Welt, Tageszeit und Welt+Tageszeit: dunkle Kontur
  an den freien Rändern von Boden, Wand und Holz-Plattform („klar, aber weich“), Randlicht oben, Tiefe (Schatten unter
  der Graskante, Erde nach unten dunkler), weicher Schatten unter schwebenden Stücken, Luftperspektive des Hintergrunds
  (Dunst nach Tiefe, Sättigung/Helligkeit je Welt). Nachts dunkler, aber lesbar; Tageszeiten bleiben unterscheidbar.
  Test kontrast_mindestwerte (Mindest-Kontrast Bodenkante/Hintergrund je Welt und Tageszeit: `KONTRAST_MIN`).
- **Glanz-Muster für alle Elemente** (gemeinsam: `glanzSchatten`, `glanzFunkeln`, `glanzBand`): Stacheln aus dunklem
  Stahl mit roten Spitzen und warmem Gefahren-Schein (bleiben besonders lesbar), Metallglanz am Haken, Checkpoint mit
  rundem Mast und glänzendem Knauf, Münzen und Edelsteine funkeln ab und zu, Kontaktschatten unter Hebel, Druckplatte,
  Sprungpilz, Checkpoint und Ziel, Glanzstreifen über Tür, Messingplatte und Presse, feuchter Glanz auf dem Pilzhut.
- **Details je Welt** (js/11a-welt-details.js, in die mittlere Hintergrund-Ebene gemalt): Dschungel Lianen mit
  Orchideen, Moos und Tau, Wasserfall mit Nebel, Sprühregen und (tagsüber) Regenbogen; Ruinen Säulenreste mit
  Hieroglyphen und Rissen, flackernde Fackeln, Sandstaub; Höhle Tropfsteine mit fallenden Tropfen, Leuchtpilze; Vulkan
  Felsen mit glühenden Rissen, Rauch, fallende Asche und Funken. Test welt_details_und_vordergrund. (Ein dunkler
  Vordergrund am unteren Bildrand war kurz drin und ist auf Nutzerwunsch wieder entfernt.)
- **Weltkarte neu:** gemaltes Meer im Holzrahmen mit Seil-Ecken, Kompass, Wolken, Brücken und Fußspuren auf den Pfaden;
  jede Insel mit Stimmungsfarbe, Klippe, Schaumring, Wetter (Regenwolke, Sonne, Nebel, Rauch) und Tier, sanft wippend;
  gesperrte Welten liegen im Nebel mit Schloss (nicht grau); Affe und Schweinchen wippen auf der gewählten Insel. Alle
  Funktionen wie bisher. Test weltkarte_gemalt_ohne_fehler.
- **Levelkarten gleich groß:** festes Raster, alle Karten einer Welt (auch Boss-Karte, mit/ohne Statistik) gleich breit
  und hoch; lange Titel etwas kleiner bzw. an einer Silbe in zwei Zeilen umgebrochen. Test levelkarten_gleich_breit
  (Titel-Feld unten mit etwas Platz für Unterlängen wie das „g“ in „Dschungel“ – auch bei großer Schrift nicht angeschnitten.)
  (1920×1080 und 1366×768, 4–6 Level).
- **Design-Politur 2 (Rückmeldung des Nutzers):**
  - Boden und Wand lassen sich in alle Richtungen und mehrfach übereinander bauen und sehen wie EIN Block aus: Erde in
    einer durchgehenden Farbe mit an der Welt ausgerichteten Erdschichten (keine Streifen je Reihe mehr), kräftige
    dunkle Kontur an allen freien Rändern ohne Lücken an Reihengrenzen. An freien Seitenflächen ab 3 Reihen Höhe
    (`FLAECHE_MIN_H`) wachsen Moospolster und ein bis zwei leicht schwingende Lianen (nur auf der Fläche, nie im Laufweg).
  - **Kein Regen mehr** (`REGEN_AUS`): es bleibt immer Sonne, kein Regen-Rauschen, keine Spritzer; das Level-Feld
    „wetter“ bleibt in den Daten, wirkt aber nicht mehr (Editor zeigt das an).
  - **Gemütlich und warm:** goldener Himmel zum Horizont, warmes Gegenlicht hinter den Bäumen, cremiger Nebel, sanft
    schwankende warme Lichtstrahlen, leuchtende Pollen, ein Hauch Gold über dem Hintergrund, nahe Hintergrund-Ebenen
    satter und dunkler (Tiefe), warme Vignette; abends orange-violett, nachts blau mit warmen Glühwürmchen. Höhle und
    Vulkan behalten ihren eigenen Himmel. Werte in `DESIGN_LOOK` (gegenlicht, strahlen, pollen, waerme, goldHauch,
    nahTiefe, nebel, vignette).
  - **Weltkarte unverzerrt:** die Deko (Kompass, Brücken, Fußspuren, Seil-Ecken) wird mit dem echten Seitenverhältnis
    gezeichnet; Tests prüfen Karte und Spielbild auf Verzerrung.
  - **Ruckeln behoben:** Lichtstrahl und Flammen prüfen feste Teile über ein Raster-Verzeichnis statt jedes Teil des
    Levels (vorher 15–26 ms je Spielschritt in Licht-/Fallen-Leveln, jetzt 1–4 ms; Verhalten identisch). Test
    spielschritt_schnell.
- **Feinschliff nach Design-Politur 2 (Nutzerwunsch):**
  - **Einheitliche Outline für Wand und Boden:** beide haben an jedem freien Rand dieselbe Kontur (gleiche Farbe,
    Breite, Deckkraft und runde Ecken); die Wand hat keinen eigenen hellen/dunklen Rand mehr, der Boden keine extra
    Linie unten. Die Kontur wird nach Moos, Pflanzen und Lianen gezeichnet, nichts deckt sie ab. Wo Boden an Wand grenzt
    (daneben, darauf, darunter) gibt es genau EINE Linie in derselben Breite (die Wand zeichnet sie; unter einer Wand
    wächst kein Gras). Gras/Kontur enden genau an der Kante eines aufliegenden Stücks. Test kontur_wand_boden_einheitlich.
  - **Weltkarte:** die Seil-Linien an den Nägeln sind weg; die vier Nägel sitzen genau auf den Ecken des gestrichelten
    Seils (in denselben Einheiten wie das Seil, passt bei jeder Bildschirmgröße). Test weltkarte_gemalt_ohne_fehler.
  - **Editor – Levels nach Welten:** „Levels im Projekt“ zeigt je Welt einen aufklappbaren Ordner („📁 Dschungel (8)“,
    Reihenfolge Dschungel, Ruinen, Höhle, Wasser, Vulkan, dann Archiv), darin die Level nach Nummer, Boss zuletzt; der
    Ordner des gerade geladenen Levels ist offen. Test editor_projekt_levels.
- **Menü-Klang:** kurzes, tiefes Holz-„Tock“ statt Spieluhr-Klingeln (menuTick 40 ms, menuOk 65 ms, menuStart 110 ms
  beim Level-Start), ohne Nachhall; schnelle Cursor-Schritte klappern nicht (`MENU_TICK_ABSTAND`). Spielgeräusche
  unverändert. Test menue_ton_dezent.
- **Neues Aussehen, Runde 1 (aus dem abgenommenen Aussehen-Paket; nur Optik – Physik, Logik, Level-Daten und Editor
  unverändert). Ersetzt bei Boden, Wand, Bröckelboden und Tür die Beschreibungen weiter oben (Erdschichten, Kontur
  `designKontur`, Schatten unter schwebenden Stücken, sandfarbene Bröckel-Steine, Holztor je Kästchen):**
  - **Materialien** (js/10b-design-look.js, Werte genau wie in der Vorschau): Erde „Fein“ (#533b2c, feine Körnung,
    `soilK` 'A'), Wand „Alt“ (Ziegel in warmem Braun-Orange, Muster aus der Weltlage, `wallK` 'B'), Gras „Weich“
    (Fläche #34c46c, Kante #23a257, Oberkante #5fe093), Outline „Weich“ (`outK` 'A': dünne dunkle Innenlinie, kein
    Schatten). Gleich in allen Welten. Material folgt der Ausrichtung: Wand senkrecht (Stein), Boden waagerecht (Erde mit Gras).
  - **Boden und Wand = eine zusammenhängende Schicht** (js/12-welt-zeichnen.js, `materialZeichnen`, Kachel-Aufbau wie
    `buildChunk` der Vorschau): alle Kästchen kommen in ein Raster (`Tc`), runde Ecken nur an Außenecken, keine Fugen
    zwischen Kästchen, Körnung und Ziegel laufen durch, Gras-Kappe nur auf freien Oberkanten (an Stufen läuft das Gras
    ein Stück an der höheren Fläche hoch), Outline nur um die Gesamtform (auch Treppen, L-Formen, Löcher). Leistung:
    einmal je Abschnitt (`MAT_STUECK`) zu fertigen Zeichenpfaden berechnet, pro Bild nur gefüllt; die Körnung ist ein
    kleines Muster. (Vorgezeichnete Bilder wie in der Vorschau sprengen in Chrome das Bild-Budget je Bild, das der
    Hintergrund schon fast ausschöpft.) Scheinwände nehmen das Material ihrer Umgebung an (Nutzerwunsch: mitten im Boden ein „Scheinboden“ aus Erde,
    an einer Wand Ziegel; je zusammenhängender Scheinwand zählt, ob ringsum mehr Erde oder Wand liegt) und werden, solange
    niemand darin steht, mit der Fläche zusammen gezeichnet -> keine Kanten; beim Hineingehen wie bisher durchsichtig.
  - **Am oberen Bildrand** läuft eine Fläche über den Rand hinaus weiter (oben keine runden Ecken, kein Gras, keine
    Linie), wenn sie bis in die oberste Reihe reicht (Nutzerwunsch).
  - **Bewegliche Plattformen** aus Boden/Wand: ein abgerundeter Block im gleichen Material (`pieceDraw`), ganze Gruppe
    als ein Block, wenn sie ein Rechteck bildet; Outline wie die Flächen, kein Schatten, kein Restschatten.
  - **Bröckelboden:** Erde wie der normale Boden, Klumpen und Kiesel, glatte Unterkante, Outline nur an freien Kanten –
    nebeneinander liegende Kästchen sind EINE durchgehende Fläche (kein Rahmen je Kästchen). Oben wieder das gelbe trockene
    Gras (`BROECKEL_GRAS`, durchgehende Welle; auch auf den Bruchstücken), runde Ecken an freien Ecken wie Boden/Wand (die
    Fläche wird auf die runde Form ausgeschnitten, auch der rote Warn-Schein; nichts ragt über die Outline hinaus), älter: dunkler verwittert, feine Risse, ausgewaschene Flecken, etwas
    trockenes Moos (`broeckelAlt`) – Nutzerwunsch; je Kästchen einmal gezeichnet (`broeckelKachel`). Vorwarnung: Zittern, roter
    Schein und rieselnde Krümel (keine Risse mehr); danach komplett unsichtbar (keine Uhr, kein Balken).
  - **Wand/Boden an Durchbruch-Wand:** wo Wand, Boden oder Bröckelboden an eine Durchbruch-Wand grenzt, keine runden Ecken und
    keine Linie – sie zählt als Nachbar (`Tn`, `matRaster.bruch` in 12-welt-zeichnen.js; Nutzerwunsch).
  - **Ecken der Durchbruch-Wand:** frei hängend rund wie Boden/Wand, wo sie steht oder anstößt gerade (`kachelRad`,
    gleiche Regel wie beim Bröckelboden; Nutzerwunsch).
  - **Durchbruch-Wand** (elemente/durchbruch.js): Entwurf 2 „Feucht“ – Wandmaterial, braun-grün angelaufen, Moos an
    den Fugen, vorstehende Ziegel, dunkle Tropfspuren, Glanzpunkte; keine Löcher, keine Risse; je Kachel einmal
    gezeichnet. Beim Nachwachsen füllt sich ein blasser Block. Gemeinsame Hilfen `matTile`, `matBlock`, `grasKappe`, `bruchRisse`.
  - **Wechselboden** (elemente/wechselboden.js): waagerecht normaler Boden mit Gras, senkrecht normale Wand; eine
    zusammenhängende Reihe ist ein Block (einmal zwischengespeichert). Weg: nur ein leichter weicher Schatten. Takt-Böden:
    Balken über die ganze Breite (senkrecht: Höhe), der bis zum Wechsel schrumpft. Hebel-Böden: kein Balken, Diamant
    mittig auf dunkler Platte (Gruppe A voll, Gruppe B mit dunklem Kern). Die A/B-Anzeige am Hebel entfällt.
  - **Haftfläche:** normales Wandmaterial mit Honig übergossen (welliger Rand, Glanzlichter, unten langsam tropfend).
  - **Hebel:** wie bisher, aber ohne Zahl – nur Farbe und kleiner Glanzpunkt auf der Plakette; Tasten-Blase bleibt.
  - **Tür:** zusammenhängende Tür-Kästchen derselben Nummer sind EINE Tür (auch lang, dick oder ein Block): Holzbretter,
    Eisenbänder, dunkler Rahmen (nicht farbig), Eckbeschläge bei großen Türen und genau ein Diamant in der Hebel-Farbe
    mittig auf dunkler Fassung. Sie gleitet beim Öffnen ein; offen, solange noch ein Teil offen ist.
  - **Druckplatte:** Eisenrahmen mit Messingplatte auf dem Boden, ein Diamant in der Link-Farbe, keine Zahl; sinkt ein.
  - **Teleporter:** keine Zahl, keine Buchstaben, kein Punkt oben; unten ein Diamant in der Paar-Farbe; „nur Affe /
    nur Schweinchen“ nur über die Innenfarbe.
  - **Förderband:** zusammenhängende Kästchen = ein Band ohne Nähte: Holzkörper mit Nieten, Lederband mit breiten
    weichen goldenen Pfeilen in Laufrichtung (Stillstand blass grau), Rollen nur an den beiden Enden.
  - **Lava:** keine dunklen Schollen, keine aufsteigenden Blasen, keine gestrichelte Steige-Linie mehr; warmer Glut-
    Schein, Blasen an der Oberfläche wölben sich auf, platzen und spritzen Tropfen; ruhiges Hitzeflimmern über der
    Oberfläche (verschiebt schon gezeichnete Pixel; der Ausschnitt wird je Bild einmal kopiert). Das Flimmern schaltet
    sich auf langsamen Geräten von selbst ab (einmal über `LAVA_FLIMMERN_SOFORT_MS` 8 ms oder im Mittel über
    `LAVA_FLIMMERN_MAX_MS` 1,5 ms) und lässt sich mit localStorage `monchichi.lavaFlimmern` = `aus` ausschalten.
  - **Haken:** wie bisher (Schein, Ringe, Funkeln), dazu eine dunkle Unterlage und kräftigeres Cyan-Leuchten.
  - **Fallen-Pfeil etwas auffälliger** (damit er vor der neuen Ziegelwand lesbar bleibt): Schaft 6 statt 5 px
    (`PFEIL_BILD_DICKE`), helle Flugspur kräftiger und breiter; Trefferfläche unverändert. Test pfeil_lesbarkeit.
  - **Keine Zahlen mehr im Spielbild:** Tür, Wechselboden und Portal haben keine Nummern-Plakette mehr (eigener Diamant);
    bewegliche Plattformen, bewegte Haken, Wasser-/Lava-Marken und Presse zeigen statt der Zahl einen Diamanten in der
    Hebel-Farbe auf dunkler Fassung (`verknuepfungsDiamant`, wie an der Tür; pulsierender Ring, solange aktiv), ebenso
    der Hinweis-Pfeil am Bildrand. Verknüpfungen erkennt man nur an der Farbe. Im Editor bleiben die Nummern.
  - Unverändert in dieser Runde: Sprungpilz, Checkpoint, Münzen, Leuchtkristall, Stacheln (das gewählte „Stahl“ ist der
    bisherige Stachel), Stachelpresse, Boss, rollender Fels und alle übrigen Elemente.

### Dschungel-Paket: neuer Dschungel-Look (Hintergrund mit Wind, dichte blaue Nacht, weniger Tiere)
Reine Optik/Deko – Physik, Level-Daten, Boden/Wände/Elemente und Editor unverändert. Übernommen aus Leons abgenommener
Vorschau (Farben, Zahlen, Reihenfolge wie dort), Code in `js/11b-dschungel-hintergrund.js` (Tiere: js/20-tiere.js, Vögel:
js/17-deko.js).
- **Auswahl je Welt und Tageszeit** (`HG_STIL_TABELLE`): Dschungel-Welt **Mittag (= Tag)** und **Nacht** bekommen den ganzen
  neuen Look (Hintergrund, Licht, Tier-Regeln); **Morgen und Abend** (auch das alte Thema „abend“ = Baumkronen) nur den
  neuen Hintergrund mit Wind, sonst wie bisher (alte Tiere, Abend-Farbstich `THEME.tint`, warmer Schimmer). Alle anderen
  Welten und das alte Thema „nacht“ (Mondnacht, Ruinen-Welt) bleiben genau wie bisher. Ein Look für eine andere
  Welt/Tageszeit lässt sich später als eigener Eintrag in `HG_STIL_TABELLE`/`HG_STILE` einhängen.
- **Hintergrund Tag** (hinten nach vorne): dunkler Grün-Himmel mit warmem Licht oben links, weiche Licht-Kreise (Bokeh),
  ganz ferne und ferne Palmen/Bananen im Dunst, Riesenblatt-Pflanzen, zwei große Baumstämme mit Kletterlianen und
  Farnen, Farn-Unterwuchs, hängende Wedel oben (hell/dunstig), Dunst-Schwaden, Lianen weit oben (kräftig, mit Blüten),
  Bananenblätter + Monstera, Heliconien mit roten/orangen Blüten, dunkle Wedel und Blätter oben, dunkle große Blätter
  vorne, nahe Lianen; vor dem Spielfeld feiner Lichtstaub und eine grüne Vignette. **Keine Lichtstrahlen**, keine
  Wolken, kein Wasserfall, kein Vogelschwarm (gab es in der Vorschau nicht), keine warmen Pollen und kein warmer
  Schimmer am Tag. Ebenen wiederholen sich alle 2000 Einheiten nahtlos; Parallaxe wie die bisherigen Ebenen
  (`DJ_PAR_K`: nah 0,8 -> 0,45 wie die bisherige nahe Ebene).
- **Wind:** Bananenblätter/Monstera, Heliconien und die nahen Blätter wiegen sich (einzeln leicht gedreht, `djWind`),
  die Lianen schwingen mit. Die hinteren Ebenen (ganz fern, fern, Riesenblätter, Stämme, Farn-Unterwuchs, hängende
  Wedel) sind still vorgezeichnete Kacheln (Leistung, siehe unten). Wind ist reine Deko (Zeit aus performance.now).
  Abschaltbar: localStorage `monchichi.dschungelWind` = `aus`; schaltet sich von selbst ab, wenn die Bilder im Mittel
  länger als `DJ_BILD_MAX_MS` (25 ms, über 20 Bilder) auseinanderliegen oder 4 Bilder hintereinander über 50 ms brauchen. Nicht mitgezählt werden die ersten 3 s nach jedem Levelstart (`DJ_ANLAUF_MS`, dort wird viel vorgezeichnet), einzelne Aussetzer ab 200 ms (Tab-Wechsel) sowie Menü/Pause und Tod. Ob Wind und Nacht-Licht an sind, zeigt die Leistungsanzeige (Taste F). Ohne Wind sieht alles gleich aus, nur still.
- **Nacht:** gleich dichter Dschungel, alle Ebenen beim Vorzeichnen dunkelblau eingefärbt (Farbton rgb(30,96,150),
  Kontrast 2, Helligkeit 0,58, dünner dunkelblauer Schleier) – einmal, nicht pro Bild; dahinter dunkelblauer Grund mit
  Sternen und Mond (kaum sichtbar). Riesenblätter leuchten konstant und dezent (türkis, helle Adern), hängende Wedel
  nicht. Licht im Hintergrund: drei sehr weiche Lichtschäfte, Lichtflecken, Moos-Streifen und leuchtende Baumpilze an
  den Stämmen, Bodennebel, 16 ferne unscharfe Leuchtpflanzen. Leuchtpflanzen am Boden (Pilzgruppe, Glockenstängel,
  Leuchtfarn) nur auf Oberseiten fester Erd-Flächen (Breite ≥ 60, nicht an der Decke, nicht in einer anderen Fläche),
  große Flächen 260–780 px Abstand, kleine höchstens 1–2, nie zwei gleiche nebeneinander, nicht an Hebeln/Münzen usw.
  Der Boden-Bereich wird etwas abgedunkelt, Figuren bekommen ein weiches kühles Licht; Elemente, Münzen und Figuren
  werden danach gezeichnet (bleiben hell). 6 Glühwürmchen, ~20 Lichtstaub-Punkte, kein Bokeh, nichts blinkt. Ersetzt
  die bisherige Nacht-Abdunklung (`THEME.dark`) und den Farbstich (kein Doppel-Dunkel). Nacht-Licht abschaltbar:
  localStorage `monchichi.dschungelNachtlicht` = `aus` (ohne Schäfte, Bodennebel, ferne Pflanzen); schaltet sich von
  selbst ab, wenn es trotz stillem Wind noch zu langsam ist.
- **Tiere** (Dschungel Tag/Nacht, `buildCrittersDschungel`): deutlich weniger. Boden-Tiere je 40-px-Schritt Frosch 0,018,
  Schnecke 0,03, Pilz 0,035, Knospe 0,04; zwischen zwei Boden-Tieren ≥ 650 px, Frosch/Schnecke untereinander ≥ 1400 px;
  nachts Schnecke statt Frosch. Nie in Materialien (±34 px frei, 46 px hoch, 45 px vom Flächenrand), Frosch/Schnecke
  brauchen ≥ 70 px freie Laufstrecke und halten vor Stufen/Blöcken/Pflanzen an; nicht in Farnen/großen Blättern/Blüten
  (nachts Leuchtpflanzen) – sonst rücken sie zur nächsten freien Stelle oder entfallen. Faultier (nachts Fledermaus)
  höchstens eins je 1300 px. Schmetterlinge (nachts Glühwürmchen) Anteil 0,07, ≥ 800 px Abstand, nur wo darüber frei
  ist; der goldene Schmetterling bleibt (einer je Level). Wie bisher nie an Münzen, Stacheln, Hebeln, Start usw.
- **Vögel** (Dschungel Tag/Nacht): sitzen auf Oberseiten von Boden und Wänden (nie an der Decke), je 900 px einer auf der
  höchsten Fläche, nachts Eulen; sie fliegen **nicht** weg, picken und hüpfen nur.
- **Hintergrund-Tiere** (dezent, so unscharf wie ihre Umgebung, einmal weich vorgezeichnet): Schnecken kriechen die
  Baumstämme hoch, ferne Schmetterlinge (nachts Nachtfalter), nachts Fledermäuse weit hinten oben. Keine Schlangen,
  keine Geckos.
- **Nacht-Leuchten der Tiere:** Frosch, Schnecke, Knospe, Pilz und Eulen-Augen leuchten sanft.
- **Leistung:** alle Pflanzen einmal vorgezeichnet (beim ersten Dschungel-Level ~0,2 s, Nacht-Einfärbung ~0,1 s,
  danach zwischengespeichert). Chrome zeichnet ein Bild sofort (bremsend) fertig, wenn es mehr als rund 30 MB
  verschiedene Vorlagen benutzt – darum sind die weichen Ebenen bei hoher Pixeldichte in halber Auflösung vorgezeichnet
  und nur die vorderen Ebenen im Wind einzeln gezeichnet. Bei normaler Pixeldichte werden alle stillen Ebenen 1:1 auf
  ganze Bildpunkte kopiert (ohne Grafikkarte ein Vielfaches schneller als vergrößern). Dunst, Lichtschäfte, Lichtflecken,
  Stamm-Leuchten, Bodennebel und ferne Leuchtpflanzen sind ebenfalls einmal vorgezeichnet (pro Bild nur Deckkraft/Lage).
  Gemessen auf dem Testrechner ohne Grafikkarte (echte Bilder/s, Dschungel-Level, Kamera mittendrin): Tag vorher 34,
  nachher still 35 (mit Wind 10–12 – dort schaltet sich der Wind von selbst ab); Nacht vorher 39, nachher still 35, ohne
  Nacht-Licht 38. Tests: dschungel_look_auswahl, dschungel_hintergrund_tag_nacht, dschungel_tiere_regeln,
  dschungel_leuchtpflanzen.

### Boden-Dekor-Paket: Dickicht, Gras, Blumen, Farn im Dschungel + Nachbesserung Tiere
Ergänzt das Dschungel-Paket (Vorschau level1_dschungel.html, Bilder in `boden-dekor-paket/bilder/`). Code:
`js/17a-dschungel-boden.js` (neu), Anpassungen in 11b, 12, 17, 20. Gilt Tag UND Nacht, für alle Dschungel-Auswahlen.
- **Grundeinstellung** (fest): AN – Tiere am Boden, Tiere im Hintergrund, alle Pflanzen-Ebenen (ganz fern, fern, hängende
  Wedel, Baumstamm, Riesenblätter, Heliconien, Mitte, Unterwuchs hinten/vorn, nah), Dickicht, Lianen, Nebel, Gras &
  Blumen, Vignette. AUS – Leuchtkreise (die Licht-Kreise/Bokeh am Tag, `DJ_LEUCHTKREISE`), Schwebesamen (Lichtstaub-Punkte
  vor dem Spielfeld, `DJ_SCHWEBESAMEN`), Lichtstrahlen (nachts die drei Lichtschäfte, `DJ_LICHTSTRAHLEN`), Moos an Seiten
  (Moos/Ranken an Wandseiten und Moos/Lianen an hohen Seitenflächen), Gras unten, Erd-Schatten, Bröckelrand, Filmkorn
  (die letzten vier gibt es im Spiel nicht bzw. nicht mehr). Damit gelten die Angaben „Bokeh“, „feiner Lichtstaub“ und
  „drei sehr weiche Lichtschäfte“ im Abschnitt oben nicht mehr.
- **Alle Dschungel-Auswahlen** (auch Morgen/Abend = „alter Hintergrund“) haben jetzt die neuen Tier-Regeln, Vögel, die
  sitzen bleiben, und die Hintergrund-Tiere (Schnecken am Stamm, 8 ferne Schmetterlinge, nachts Fledermäuse):
  `HG_STILE.dschungelHG.tiere = true`.
- **Boden-Dekor je 40-px-Oberseite** (echter Boden/Wand, nicht unter Scheinwänden; ersetzt im Dschungel das alte Dekor
  aus 17-deko.js – Pflanzen-Bildchen, Moos): Dickicht 3 Chancen × 80 % (22 weiche Blatt-Bilder: 14 Farnwedel + 8 Monstera,
  Fuß 10 px unter der Oberkante, ±0,15 rad schräg, wiegt im Wind mit 0,075; VOR dem Boden gezeichnet, schaut an den Kanten
  heraus), feines Gras alle 7–13 px (4–6 Halme, 5–13 px), Grasbüschel 70 % (3–5 Halme, 7–16 px), Farnbusch 7 % (Größe
  0,44–0,71), Blume 10 % (rot/orange/rosa, 17–35 px, wiegt), Pilz 6 %.
- **Reihenfolge, nichts übereinander:** zuerst große Pflanzen (Farnbusch, Blume, Pilz, nachts Leuchtpflanzen): 60 px
  Abstand untereinander, 45 px von der Kante, nicht am Start (260 px); dann Gras und Dickicht in die Lücken (nach dem
  Boden, vor Objekten/Münzen/Figuren); zuletzt Tiere (±34 px von großen Pflanzen, sonst versetzt oder gestrichen; vor dem
  Gras gezeichnet). Vögel ebenso.
- **Freihalte-Zone** um Hebel, Stacheln, Türen, Sprungpilze, Druckplatten, Haken, Checkpoints, Teleporter, Fallen und Ziel:
  60 px links/rechts, 90 px senkrecht keine Pflanze, kein Gras, kein Dickicht, kein Tier, keine Leuchtpflanze
  (`bodenSperre` = `dekoSperre` + Zone; Münzen wie bisher über `dekoSperre`).
- **Nacht:** dieselben Formen, beim Vorzeichnen eingefärbt wie die Hintergrund-Ebenen. Glühwürmchen (Boden-Tiere und die
  schwebenden vor dem Spielfeld) leuchten warm orange (Kern #ffb347, Schein 255,150,40): Punkt ~2 px, Hof ~14 px (~0,3),
  großer weicher Schein ~38 px (~0,16), läuft weich aus, pulsiert langsam (`gluehwuermchenZeichnen`). Nachtfalter im
  Hintergrund bleiben getrennt davon.
- **Leistung:** Gras als Zeichenpfade je Stück (4 Kästchen), pro Bild nur eine Wind-Scherung je Stück; Dickicht-Bilder
  einmal vorgezeichnet (nachts eingefärbt), pro Bild nur gedreht gesetzt. Ohne Wind (langsames Gerät, siehe Wind oben)
  wiegt nichts. Gemessen: Zeichenzeit je Bild mit und ohne Boden-Dekor gleich (Testrechner ~50 ms Tag/Nacht).
- Tests: boden_dekor_dschungel, boden_dekor_freihalten (deko_vogel_flattert_weg und deko_frei_von_spielobjekten prüfen
  das alte Dekor jetzt in der Ruinen-Welt).

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
    Fahrt (Nutzerwunsch, Auswahl „Fahrt“ in der Eigenschaften-Zeile von „Bewegung“): „↔ fährt hin und her“ (wie bisher,
    pendelt immer weiter) oder „→ fährt die Strecke einmal“ (`einmal: true` im Export) – bewegter Boden/Wand/Haftfläche und
    bewegter Haken fahren einmal zum Ziel und bleiben dort stehen; per Hebel/Platte startet erneutes Schalten nicht wieder.
    Neustart (R) und Tod setzen sie wie alle bewegten Teile an den Start zurück. Test bewegung_einmal.
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
    Füllen (Nutzerwunsch): bei aktivem Auswahl-Werkzeug zeigt die Eigenschaften-Zeile „▦ Auswahl mit Boden füllen“ und
    „▦ Auswahl mit Wand füllen“ – jedes Kästchen der Auswahl wird Boden bzw. Wand (vorhandene Kacheln ersetzt, Stacheln dort
    entfernt, Münzen/Hebel bleiben), ein Schritt für Strg+Z (`selFill`, editor/js/08-auswahl.js). Test editor_auswahl_fuellen.
  - Werkzeug-Gruppen (Ausbau 2, seit dem Editor-Umbau als REITER): oben eine Zeile mit Level-Info/Name/Knöpfen; darunter
    - Reiter-Zeile: Gelände (Boden, Wand, Bröckelboden, Steg, Eis, Scheinwand) · Gefahren (Stacheln, Falle, Rollender
      Fels, Lava, Lava-Marke, Stachelpresse) · Licht (Lichtquelle, Spiegel, Lichtkristall, Leuchtkristall, Dunkelzone) ·
      Schalter & Logik (Schalter, Tür, Druckplatte, Wechselboden) · Haken & Sprung (Haken, Aufwind, Sprungpilz) ·
      Bewegung (Teleporter, Förderband, Bewegung ➜) · Wasser (Wasser, Strömung, Wasserstand) · Boss (Boss, Arena,
      Boss-Platz) · Münzen & Marken (Münze, Checkpoint, Start ♂/♀, Ziel). Rechts daneben immer: „Aktiv: <Werkzeug>“,
      Radieren, Auswahl ⬚ und der Schalter „Alle Werkzeuge“. Der gewählte Reiter wird gemerkt (monchichi_editor_tab);
      ein Punkt • am Reiter zeigt, wo das aktive Werkzeug liegt. Tests editor_werkzeug_gruppen, editor_werkzeugleiste.
    - Werkzeug-Zeile: nur die Werkzeuge des gewählten Reiters; rechts „Zuletzt:“ mit den letzten 5 benutzten Werkzeugen
      (ein Klick wählt, ohne den Reiter zu wechseln; gemerkt in monchichi_editor_zuletzt).
    - Eigenschaften-Zeile: nur die Optionen des AKTIVEN Werkzeugs (Stacheln: Spitzen · Haken: Radius · Bewegung: Tempo,
      per Schalter, Entfernen · Münze: Farbe · Element-Optionen aus dem Register, z. B. Falle: Art, Richtung, Takt,
      Versatz, an/aus) und die Verknüpfungs-Nummer + Name bei allen Werkzeugen, die eine Nummer brauchen oder per Nummer
      schalten können. Ohne Optionen steht dort „keine Einstellungen“ – die Leiste springt nie in der Höhe (feste
      Zeilen; ist eine Zeile zu lang, scrollt sie seitlich statt umzubrechen).
    - Werkzeuge je Welt (Voreinstellung, keine Sperre; Tabelle editor/js/00-welt-werkzeuge.js): Grundwerkzeuge (Boden,
      Wand, Scheinwand, Stacheln, Münze, Checkpoint, Start/Ziel, Haken, Schalter, Tür, Druckplatte, Bewegung, Radieren,
      Auswahl) sind immer da; dazu die Empfehlung der Welt aus der Level-Info – Dschungel: Bröckelboden, Steg, Aufwind,
      Sprungpilz, Teleporter, Wechselboden · Ruinen: Falle, Rollender Fels, Lichtquelle, Spiegel, Lichtkristall · Höhle:
      Eis, Förderband, Dunkelzone, Leuchtkristall · Wasser: Wasser, Strömung, Wasserstand · Vulkan: Lava, Lava-Marke,
      Stachelpresse; Boss-Werkzeuge nur in Leveln mit Boss/Arena. Werkzeuge, die im Level schon vorkommen, sind immer
      sichtbar. „Alle Werkzeuge“ zeigt alles und wird gemerkt (monchichi_editor_alle). Reiter ohne sichtbares Werkzeug
      verschwinden. Test werkzeug_welten (jedes Werkzeug steht in der Tabelle).
    - Ergebnis (gemessen): Leiste bei 1920x1080 144 px statt 392 px, Kästchen 40 statt 32 px; bei 1366x768 144 statt
      473 px, Kästchen 29 statt 13 px.
  - LEVEL-ORDNER NACH WELTEN (Editor-Umbau, Teil I): levels/<welt>/<nr>-<titel>.json, Bosse <welt>/boss-<name>.json,
    alter Entwurf in levels/archiv/, Testlevel weiter in levels/test/; editor-format/ mit denselben Unterordnern;
    levels/README.md erklärt die Struktur. worlds.json/levels.json nennen die neuen Pfade. Spiel, Weltkarte und Editor
    laden daraus („Levels im Projekt“, Laden, „☁ Auf GitHub speichern“). Im Editor steht bei jedem Projekt-Level Welt
    und Nummer („Vulkan 3 · Feuerberg“ in der Liste, in der GitHub-Auswahl und oben neben der Level-Info). Ein NEUES
    Level speichert „Auf GitHub speichern“ im Ordner der Welt aus der Level-Info mit der nächsten freien Nummer dieser
    Welt und dem Titel im Namen (z. B. wasser/01-tiefsee.json); Bosse als <welt>/boss-<titel>.json. Die Nummer im
    Dateinamen bleibt beim Umsortieren (Nutzerentscheidung) – die Reihenfolge im Spiel kommt aus worlds.json, die
    angezeigte Nummer ist immer die Position in der Welt. Spielstände und der Editor-Arbeitsstand mit alten Namen
    (level-6.json …) werden beim Laden auf die neuen Pfade umgeschrieben (Tabelle js/01a-level-umzug.js, nichts geht
    verloren). Tests level_ordner_nach_welten, spielstand_umzug_welt_ordner.
  - WERKZEUG-PRÜFUNG (Editor-Umbau, Teil J): Rechtsklick und Radierer entfernen ein Element überall dort, wo es im
    Editor SICHTBAR ist – auch wenn es größer gezeichnet wird als sein Kästchen (Rollender Fels 3×3, Stachelpresse so
    breit wie eingestellt, Boss 3×3, Arena-Grenze die ganze Spalte; Angabe editor.bereich im Register). Vorher traf
    ein Rechtsklick auf den sichtbaren Fels/Boss/die Arena-Linie/den rechten Teil einer breiten Presse ins Leere.
    Dauertest editor_werkzeug_pruefung: JEDES Werkzeug (Register + Boden/Wand/Bröckelboden/Scheinwand, Haken,
    Stacheln, Münze, Checkpoint, Bewegung, Start ♂/♀, Ziel) wird gesetzt, mit geänderten Optionen gespeichert, per
    Rechtsklick (auf die sichtbare Mitte) und per Radierer entfernt, mit Strg+Z/Strg+Y zurückgeholt, nach Neuladen
    geprüft (auch im Export) und kopiert/eingefügt (Start/Ziel: mit der Auswahl verschoben, weil es sie nur einmal
    gibt). Neue Elemente prüft er automatisch mit.
  - Seitenleiste: Raster-Infos (Kästchengröße, Länge) und Zähler (Checkpoints, Münzen, Blau/Pink-Bilanz) bleiben sichtbar;
    die langen Erklärungen (Hilfe, Bewegungs-Referenz, Legende) sind eingeklappt – Knopf „Hilfe ▸“.
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
  - Auswahl neben „▶ Testen“ (`#partnerWahl`): Computer-Partner aus / ich bin der Affe / ich bin das Schweinchen –
    im Test steuert dann der Computer die andere Figur (siehe Abschnitt „Computer-Partner“ oben).
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
  - Fenster „Levels“ zeigt zusätzlich „Levels im Projekt“ (aus levels/levels.json, nach Welt-Ordnern gruppiert) und lädt sie per „Laden“
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
