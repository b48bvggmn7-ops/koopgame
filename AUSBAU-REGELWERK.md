# AUSBAU-REGELWERK (gilt für alle Ausbau-Schritte)

Vor jedem Ausbau-Schritt lesen und befolgen, zusammen mit AUSBAU-VISION.md.

1. **Go-Regel**: Gearbeitet wird immer nur an dem Schritt, den der Nutzer gibt. Am Ende Bericht (Punkt 8), Frage
   „Go für Schritt N+1?“ und STOPP. Nie von allein den nächsten Schritt beginnen, auch nicht teilweise oder „nur
   vorbereitend“. Frei ist erst der Prompt für den nächsten Schritt. Korrekturwünsche zum aktuellen Schritt sind
   normale Nachrichten und zählen nicht als Go.
2. **Grün oder gar nicht**: Vor jedem Schritt und nach jedem Teilschritt `python tests/run_tests.py`. Nur bei grünen
   Tests nach main. Bleiben Tests nach 2 Reparaturversuchen rot, den Teilschritt per `git revert` zurücknehmen und
   berichten.
3. **Vor der Arbeit main holen** (`git fetch origin main`, auf den neuesten Stand bringen), weil der Nutzer Levels aus
   dem Editor direkt auf GitHub speichert. Nie force-pushen, nie Commits von main per `reset --hard` löschen.
4. **Kleine Commits** mit Präfix „Ausbau N:“ und deutscher Kurzbeschreibung. Nach jedem Schritt Tag `ausbau-N-fertig`
   setzen und pushen (bei Schritt 7 und 8 mit Welt, z. B. `ausbau-7-ruinen-fertig`). Einen Schritt zurückrollen heißt:
   seine Commits per `git revert` zurücknehmen, damit die Editor-Commits des Nutzers erhalten bleiben.
5. **Nichts Bestehendes verlieren**: Alles in FEATURES.md, die 6 Levels und alte Spielstände funktionieren weiter,
   außer der Nutzer entscheidet ausdrücklich anders. Kein Aufräumen nebenbei.
6. **Umfang**: Wird ein Schritt zu groß, nach einem fertigen, grünen Teilschritt aufhören, den Rest in der Statusliste
   („Noch offen“) vermerken und berichten. Lieber weniger, dafür sauber.
7. **Fragen**: Bei echten Design-Entscheidungen höchstens 3 Fragen auf einmal, jeweils mit Empfehlung. Alles andere
   selbst entscheiden und die Entscheidung im Bericht nennen.
8. **Bericht** (Deutsch, ohne Fachchinesisch): Was ist neu (2–3 Sätze) · So testest du (nummerierte Schritte mit
   Tasten und Klicks) · Bekannte Lücken · Tag · Frage „Go für Schritt N+1?“.
9. **Dokumentation**: FEATURES.md bei jeder Verhaltensänderung, CLAUDE.md-Aufbau bei neuen Dateien oder Ordnern,
   Statusliste in dieser Datei aktuell halten.
10. **Technische Leitplanken**: klassische Skripte ohne Build, feste Ladereihenfolge; fester 60-Hz-Takt (nichts ändert
    Spielzustand pro gezeichnetem Bild); Konstanten gebündelt in `js/02-physik-werte.js`; keine globalen Namen, die
    der Browser schon hat.
11. **Neue Mechanik oder neues Element** braucht immer: Spiel-Logik, Editor-Werkzeug, Zeichnen, Sound, Test,
    Mini-Testlevel in `levels/test/`, FEATURES.md-Eintrag und die Antwort auf „Welche Rolle haben Affe und
    Schweinchen?“ (keine Mechanik macht eine Figur überflüssig).
12. **Level-Regeln**: je ca. 800 Spalten (600–900), gebaut in Etappen von 100–200 Spalten, pro Etappe Commit und
    Koop-Bot-Test. Jede Passage braucht beide Figuren und beide Fähigkeiten, eine Figur allein kommt nicht durch.
    Münzregeln und „jeder Hebel hat einen Grund“ aus FEATURES.md gelten weiter. Jede Stelle wird als
    komfortabel / knapp / Grenze eingestuft. Keine Zufallstode, Checkpoints alle ca. 40–60 Spalten und vor jeder
    harten Stelle, kurze Wege zurück.
    **Bild-Regel** (gilt für jedes neue und jedes geänderte Level, auch Schritt 7/8 und Wasser; vor jedem Level-Commit
    `python3 tests/bildregel_pruefen.py --level <welt>/<datei>` – der Test `bildregel_pruefung` prüft alle Level):
    - **Bild**: Bei jedem Rätsel, jeder Schalter-Stelle und jeder Zusammenarbeit müssen beide Figuren und alles, was sie
      dafür brauchen, gleichzeitig im Bild sein können. Auslöser (Hebel, Druckplatte, Licht-Kristall bzw. sein Spiegel)
      und Ziel (Tür, Wechselboden, Plattform-Start, Falle, Fels, Tor, Band, Lava, Presse, fahrender Haken …) liegen
      höchstens `BILD_MAX_SPALTEN` = **20 Spalten** auseinander (js/09-kamera.js). Herleitung: sichtbar sind
      VW ≈ 37,6 Spalten; die Kamera hält beide sicher im Bild bis 0,75·VW − 180 px ≈ 23,7 Spalten (darüber folgt sie der
      vorderen Figur), 20 lässt Luft für Laufen und Springen. Die Höhe ist immer ganz im Bild. Kein Checkpoint zwischen
      Auslöser und Ziel, wenn man danach mehr als 5 Spalten zurück müsste (nach einem Tod ist alles wieder aus).
    - **Plattform**: Bewegte Plattformen, fahrende Haken, Bänder und Ein-Figur-Tore bringen niemanden weiter als 20 Spalten
      vom Partner weg – auch mitten in der Fahrt (Partner am Einstieg bzw. am Hebel). Abhilfe: Strecke kürzen, Hebel in
      die Mitte, Strecke in Etappen teilen, Ausgang so legen, dass man nebeneinander weiterläuft.
    - **Haken** (Richtwerte aus Koop-Bot-Messungen, Reichweite 4,5 Kästchen): Abstand in einer Reihe **5–6 Spalten**
      (4–8 erlaubt; ab 8 klappt nur noch jeder 2., ab 9 jeder 3. Versuch; unter 4 greift man oft den alten Haken wieder,
      weil das Spiel immer den nächsten Haken nimmt). Höhe **6–7 Reihen** über dem Absprung-Boden (4–8 erlaubt).
      Freier Bogen: in den 3 Reihen unter einem Schwung-Haken kein Stein (±2 Spalten). Landung: mindestens 3 Stehplätze
      2–10 Spalten hinter dem letzten Haken. Größere Reichweite erlaubt etwas mehr Abstand (1,8 × Reichweite).
    - **Checkpoints** nur nach einer Leistung und vor dem nächsten schweren Stück: mindestens **25 Spalten** Abstand
      (≈ ⅔ Bildbreite bzw. 4 s Laufen – näher liegende Checkpoints sparen nichts), höchstens **70** (≈ 12 s Laufen plus
      1–2 Stellen); zwischen zwei Checkpoints mindestens eine Stelle (Rätsel, Hebel, Falle, Gegner, Grube, Haken,
      Kletterwand …). Ausnahmen: Verfolgungen und Rätsel mit zwei getrennten Wegen laufen am Stück.
    - Begründete Ausnahmen stehen in `tests/bildregel_ausnahmen.json` (Level, Regel, Spalte, Begründung).
13. **Schwierigkeitskurve** (Startwerte; „Versuche“ = wie oft zwei geübte Spieler an einer Stelle scheitern, bis es
    klappt):
    - Dschungel: Einstieg mild (1–2), steigt bis zum Boss deutlich, schwerste Stellen 3–4.
    - Ruinen: Timing, typisch 2–3, schwerste 5–6.
    - Höhle: Präzision und Koordination, typisch 3–4, schwerste ca. 8, nie unmöglich.
    - Wasser: erstes Level sanft (neue Regeln lernen), dann steil, schwerste ca. 8.
    - Vulkan: das Härteste, schwerste 10+, aber immer fair.
    - Bosse: 5–10 Versuche.
    Der Nutzer justiert nach seinem Feedback.
14. **Statusliste**: Tabelle am Ende dieser Datei mit den Schritten 0–8: Status (offen / in Arbeit / fertig, wartet
    auf Test / Go erhalten), Tag, „Noch offen“.

## Statusliste
| Schritt | Inhalt | Status | Tag | Noch offen |
|---|---|---|---|---|
| 0 | Briefing und Regelwerk | Go erhalten | ausbau-0-fertig | Tag nur lokal (GitHub lehnt Tags ab) |
| 1 | Fundament (Welten-Datenmodell, Tageszeit/Wetter, Spielstand) | Go erhalten | ausbau-1-fertig | Tag nur lokal (GitHub lehnt Tags ab) |
| 2 | Editor ausbauen | Go erhalten | ausbau-2-fertig | Tag nur lokal (GitHub lehnt Tags ab) |
| 3 | Weltkarte und Welt-Seite | Go erhalten | ausbau-3-fertig | Boss-Karte nur Platzhalter (Ausbau 6); Tag nur lokal |
| 4 | Neue Mechaniken (Wechselboden, Teleporter, einseitige Plattformen) | Go erhalten | ausbau-4-fertig | Tag nur lokal (GitHub lehnt Tags ab) |
| 5 | Wasser und Schwimmen | Go erhalten | ausbau-5-fertig | Einzel-Fähigkeiten unter Wasser bewusst weggelassen (Nutzerwunsch); Tag nur lokal |
| 6 | Story-Intro und Boss-Gerüst mit Boss 1 | Go erhalten | ausbau-6-fertig | Schwierigkeit von Bruno nach Probespielen justieren; Tag nur lokal |
| 7 | Neue Level für eine Welt (pro Welt) – Dschungel | fertig, wartet auf Test | ausbau-7-dschungel-fertig | Dschungel: Level 7 „Lianenschlucht“ + Level 8 „Glühwald“ (700 Spalten) neu, Balance in WELTEN.md; Schwierigkeit nach Probespielen justieren; weitere Welten offen; Tag nur lokal |
| 7 | Neue Level für eine Welt (pro Welt) – Ruinen | fertig, wartet auf Test | ausbau-7-ruinen-fertig | Ruinen: neue Elemente Falle (Pfeil/Flamme), Rollender Fels, Licht (Quelle/Spiegel/Kristall); Level 9 „Fallengang“, 10 „Sonnentempel“, 11 „Felsenflucht“ (je ~800 Spalten) neu, Balance in WELTEN.md; Schwierigkeit nach Probespielen justieren; Höhle/Wasser/Vulkan offen; Tag nur lokal |
| 7 | Neue Level für eine Welt (pro Welt) – Höhle | fertig, wartet auf Test | ausbau-7-hoehle-fertig | Höhle: neue Elemente Eis, Förderband, Leuchtkristall + Dunkelzone; Level 12 „Tropfsteingang“, 13 „Eisgrotte“, 14 „Leuchtgrotte“, 15 „Förderwerk“, 16 „Tiefenschlund“ (je 800 Spalten) neu, Balance in WELTEN.md; Schwierigkeit nach Probespielen justieren; Wasser/Vulkan offen; Tag nur lokal |
| 7 | Neue Level für eine Welt (pro Welt) – Vulkan | fertig, wartet auf Test | ausbau-7-vulkan-fertig | Vulkan: neue Elemente Lava (+ Lava-Marke, steigt per Nummer oder sobald beide da sind) und Stachelpresse; Welt-Look mit Feuer-Tageszeiten und heißem Regen; Level 17 „Glutpfad“, 18 „Aschefeld“, 19 „Magmakammer“, 20 „Schlackewerk“, 21 „Feuerschlund“, 22 „Kraterherz“ (je 800 Spalten) neu, mit Feuerberg 7 Level; Balance in WELTEN.md; Schwierigkeit nach Probespielen justieren; Wasser offen; Tag nur lokal |
| 7 | Level-Erweiterung: 6 Level je Welt (Nutzerwunsch, Wasser ausgenommen) | fertig, wartet auf Test | ausbau-6er-welten-fertig | Dschungel 5 „Dornenpfad“ + 6 „Wipfelsturm“, Ruinen 6 „Tempelherz“ (je 800 Spalten) neu; Ruinen/Höhle nach Schwierigkeit umsortiert; Balance in WELTEN.md; Schwierigkeit nach Probespielen justieren; Tag nur lokal |
| 8 | Boss und Abschluss für eine Welt (pro Welt) | offen | – | – |
| – | Editor-Umbau (Werkzeugleiste als Reiter, Level-Ordner nach Welten, Werkzeug-Prüfung) | fertig, wartet auf Test | ausbau-editor-umbau-fertig | Teil A–H (Werkzeugleiste), I (Level-Ordner nach Welten) und J (Werkzeug-Prüfung) fertig; Tag nur lokal |
| – | Bild-Regel + Leveldesign-Regeln (Haken-Abstände, Checkpoints) in allen Leveln | fertig, wartet auf Test | ausbau-bildregel-fertig | Alle 26 Level geprüft und umgebaut; die 8 Stellen „BRAUCHT ENTSCHEIDUNG“ mit Zwischenstationen umgebaut (Ruinen 1/2/4, Vulkan 2/5/6, Dschungel 3, Checkpoint-Tests auf 70); Ruinen nachschärfen offen; Tag nur lokal |
