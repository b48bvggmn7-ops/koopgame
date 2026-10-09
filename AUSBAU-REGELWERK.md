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
| 2 | Editor ausbauen | fertig, wartet auf Test | ausbau-2-fertig | Tag nur lokal (GitHub lehnt Tags ab) |
| 3 | Weltkarte und Welt-Seite | offen | – | – |
| 4 | Neue Mechaniken (Wechselboden, Teleporter, einseitige Plattformen) | offen | – | – |
| 5 | Wasser und Schwimmen | offen | – | – |
| 6 | Story-Intro und Boss-Gerüst mit Boss 1 | offen | – | – |
| 7 | Neue Level für eine Welt (pro Welt) | offen | – | – |
| 8 | Boss und Abschluss für eine Welt (pro Welt) | offen | – | – |
