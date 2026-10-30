# VIDEO-ÜBERGABE – Kapitel 1 „Die Nacht, in der der Stern fiel“

Stand: 30.10.2026. Diese Datei ist für die **neue Sitzung auf dem PC des Nutzers (mit Grafikkarte)**. Die neue Sitzung sieht den alten Chat nicht. Hier steht alles, was besprochen wurde.

Alle Dateien liegen im Ordner **`film-kapitel1/`** in diesem Zweig. Was nicht hochgeladen wurde, steht mit Größe in **`film-kapitel1/NICHT-HOCHGELADEN.md`**.

---

## 0. Ganz kurz: Wo stehen wir?

- Es gibt einen **fertigen Vorschau-Film** in niedriger Qualität: `film-kapitel1/videos/vorschau13.mp4` (93 s, 480×270, 12 Bilder/s doppelt gezeigt). Mit dem Bild ist der Nutzer zufrieden („so ist erst mal gut“). Ton und Geräusche sind abgestimmt.
- Der Film benutzt aber noch den **alten Dialog** mit Platzhalter-Computerstimmen (Piper).
- Der Nutzer hat einen **neuen Dialog** abgesegnet (25 Sätze, siehe Abschnitt 4). Er spricht ihn **selbst ein**.
- **Vertonung, Stand:**
  - Fertig: alle **11 Affen-Sätze**. Sie sind bearbeitet (auf beide Ohren, komprimiert, Lautheit angeglichen) und liegen in `film-kapitel1/sounds/stimmen_fertig/`.
  - Fehlen noch: **Schwein (8 Sätze)** und **Professor (6 Sätze)**.
  - **Hier wurde die Vertonung angehalten.** Es lief kein Prozess mehr, nichts ist halbfertig.
- **Nächster großer Schritt:**
  1. Neuen Dialog und neuen Meteoriten-Ablauf in die Regie einbauen.
  2. Stimmen einbauen; die Mundbewegung folgt der Lautstärke der Aufnahme.
  3. Schnelle Vorschau zeigen.
  4. Erst nach „OK“ vom Nutzer das hochaufgelöste Rendern starten (deshalb der Umzug auf den PC mit Grafikkarte).

---

## 1. Ziel des Videos

- Zwischensequenz („Cutscene“) für das 2D-Koop-Spiel **Monchichi Koop**. Sie läuft beim Start einer neuen Geschichte, **vor Level 1**.
- Inhalt:
  1. Affe, Schwein und der Professor (ein Marienkäfer) sind abends im Baumhaus und plaudern.
  2. Plötzlich schlägt draußen ein **Meteorit** ein.
  3. Der Professor schickt alle ins Bett.
  4. Im Dunkeln schleichen sich Affe und Schwein heimlich raus, um den Meteoriten als Erste zu finden.
  5. Übergang mit dem **Blätter-Vorhang** in **Level 1 – Dschungel bei Nacht**.
- Stil: **„wie Pixar“**, süß und cool, nicht kindisch.
  - Der Nutzer legt sehr viel Wert auf **Details und Perfektionismus**.
  - Zitate: „die Liebe steckt im Detail“, „das sieht zu cheap aus“ (zur alten 2D-Fassung), „leg mehr Wert auf Perfektionismus in den Details“, „Können wir uns bitte wieder ein bisschen auf die Details konzentrieren?“
- Format: **16:9**, oben und unten **schwarze Kino-Balken** (je 62 px bei 720 Zeilen).
- Ablauf im Spiel:
  1. Hauptmenü mit „Spielen“.
  2. „Wer spielt wen“.
  3. Blätter-Vorhang mit „Kapitel 1 – Die Nacht, in der der Stern fiel“.
  4. **Video**.
  5. Blätter-Vorhang „Level 1 – Dschungel bei Nacht“.
  6. Level 1 (ist im Spiel **immer Nacht**, schon umgesetzt und auf `main`).

---

## 2. Was ist fertig?

### 2.1 Bild (Blender-3D, alles als echte 3D-Szene mit einheitlichem Licht)

**Figuren**
- Affe, Schwein und Professor mit Fell. Aus dem Browser-Prototyp übernommen und in Blender nachgebaut, siehe `figuren.py`.

**Professor (Marienkäfer)**
- dicker, großer Körper und Kopf (Nutzerwunsch: „dicker bzw. größer“, damit er zu Affe und Schwein passt)
- Lesebrille mit Goldrand
- **Bademantel**:
  - weinrot, Frottee
  - komplett geschlossen bis unter den Kopf („Er ist kein Playboy“)
  - runder Kragen, schräge Wickelkante mit Goldpaspel, Gürtel mit Knoten
- **keine Fliege, keine Brillenkette** (Nutzer wollte beides weg)
- Füße sichtbar, steht auf dem Boden (Fehler „steht halb im Boden“ behoben)

**Affe**
- Schwanz als eigene Kurve, eingerollt hinter dem Körper
  - beim Sitzen ausgeblendet, sonst steckte er im Sofa
- Arm verschwindet nicht mehr im Körper
- hat einen Mund (zeitweise fehlte er)

**Schwein**
- Hände/Pfoten liegen beim Sitzen seitlich vorn, nicht im Bauch

**Münder**
- sitzen direkt auf der Kopf-Oberfläche (Nutzer: „Mund muss wirklich anliegen“)

**Augen**
- leuchten weniger, beim Professor besonders gedämpft (Nutzerwunsch)

**Zimmer (`zimmer.py`)**
- Holz-Wohnzimmer im Baumhaus
- großes rundes Fenster:
  - **ohne Glas** (vom Nutzer so entschieden: „Ohne Glas, so wie bisher“)
  - mit Fensterkreuz
- Vorhänge rot, vor der Fensterbank (steckten vorher drin)
  - enden oben **unter dem Deckenbalken** (Nutzerwunsch: „im oberen Bereich den Vorhang weg“)
- Deckenbalken mit bunter Lichterkette
- Bücherregal, Poster, Sternkarte
- Sofa (gibt nach, wenn jemand sitzt) und Teppich
- Tischchen mit Keksteller und Tasse, Spielzeugrakete
- Stehlampe und Wandlampe
- **Fernrohr** auf Dreibein, mit Säule, Gelenk und Schelle (schwebte vorher)
- **rechte Seitenwand mit Tür**:
  - die Tür ist **geschlossen** (Nutzerwunsch)
  - kein dunkler Spalt mehr daneben oder oben (beides war ein Loch in der Wand bzw. ein zu kurzes Türblatt)
- Lichtschalter neben der Tür
- **Sessel des Professors: entfernt** (Nutzer: „Sessel vom Professor raus“)
- **Decke/Tuch: entfernt** (Nutzer: „Nimm die Decke vom Professor komplett raus“)

**Außen (`aussen.py`)**
- Baumhaus von außen bei Nacht: warm leuchtende Fenster, Laterne, Wäscheleine mit Socken, Büsche im Vordergrund, Glühwürmchen
- Tür mit Bullauge und Holzstufe. Die Tür war früher „kaputt“ und ist repariert.

**Kameras**
- feste Einstellungen mit Schnitten (Liste `SCHNITTE` in `requisiten.py`)
- Totale `tot` plus Nahaufnahmen: `prof`, `prof_links`, `prof_steh`, `kinder`, `kinder_weit`, `schwein`, `affe`, `schwein_steh`, `affe_steh`
- Der Professor ist in keiner Einstellung mehr oben und unten abgeschnitten (Fehler bei 24 s behoben).

**Meteorit/Sternschnuppe**
- Fliegt gerade von links nach rechts, ohne Schleife.
- Einschlag nach **1,85 s** (`STERN.einschlag`), passend zum Ton `stern.mp3`.
- Großer „Rums“ beim Einschlag:
  - heller Blitz
  - Funken
  - Druckwelle
  - Kamera-Wackeln in allen Einstellungen
- Danach glüht es draußen nach.

**Ende**
- Licht aus, Mondlicht.
- Affe und Schwein schleichen im Dunkeln nach rechts raus.
- Abdunkeln (letzte 20 Bilder), dann Blätter-Vorhang mit „Level 1 – Dschungel bei Nacht“ (84 Bilder).

### 2.2 Ton (alles in `film-kapitel1/sounds/`, Aufnahmen vom Nutzer)

| Datei | Herkunft (Name beim Nutzer) | Verwendung im Film |
|---|---|---|
| `aussen.mp3` | outside_room.mp3 | Haus außen, ab Sekunde **10,5** der Datei (ruhige Stelle), **−2 dB**, endet **hart** mit dem Schnitt nach innen |
| `wind.wav` | Wind_07.wav | außen, ab Sekunde 2 der Datei, **−7 dB**, endet hart mit dem Schnitt |
| `eule.wav` | KSHMR_sok5_fx_animal_owl_hoo_D.wav | ruft **einmal** bei **0,8 s**, −20 dB, kleines Echo (weit weg im Wald). Beide „Uhus“ müssen vor dem Schnitt fertig sein. |
| `raum.wav` | room_sound.wav | drinnen durchgehend, **−13 dB** |
| `knarren_schiff.wav` | ESM_PG_cinematic_fx_ship_loop_wood_creak_friction_squeak_spaced_01.wav | drinnen **durchgehend**: etwas tiefer gestimmt (asetrate ×0,94), highpass 120 Hz, lowpass 2800 Hz, kleiner Raumhall, **−14 dB** |
| `schritte.wav` | footsteps_knarschender_baum.wav | **nur beim Laufen** (Zeiten aus der Regie): leises Holzboden-Knarzen, lowpass 3000 Hz, −13 dB (schleichen −17 dB) |
| `stern.mp3` | sternschnuppe_boom.mp3 | Sternschnuppe: Zischen bis ca. 1,7 s, Einschlag ca. 1,85 s |
| `licht.wav` | lichschalter.wav | Lichtschalter, wenn der Professor das Licht ausmacht |
| `tuer_auf.wav`, `tuer_zu.wav` | door_open.wav, door_closed.wav | **nur als Geräusch**: Professor geht raus (auf/zu). Affe öffnet beim Rausschleichen (0,8), Schwein schließt (0,7). Die Tür bleibt im **Bild immer zu**. |
| `knarren_bg.wav` | BRS_Creaks_Wood_Low_Shifting.wav | **nicht mehr benutzt** (verworfen, siehe 6.3) |
| `zimmer.mp3` | inside_room.mp3 | **nicht mehr benutzt** (verworfen) |
| `uhr.wav` | KSHMR_Clock_02 – Grandpas_Clock.wav | **nicht mehr benutzt** (verworfen) |
| `schritt_spiel/`, `pizz/` | aus dem Spiel bzw. selbst erzeugt | **nicht mehr benutzt** (verworfen) |

- **Harter Ton-Schnitt** genau beim Bildschnitt Haus → Zimmer bei **5,0 s**. Nachgemessen: kein lauter Ausschlag mehr kurz vor dem Schnitt.
- Blätterrascheln (Rauschen) beim Blätter-Vorhang am Ende.
- Gesamtlautstärke am Ende ×1,6.
- Mischung: `film-kapitel1/blender/vorschau13_bauen.py`. Die Einstellungen stehen dort im Klartext.

### 2.3 Stimmen

- Der Nutzer nimmt seine Stimmen mit der Aufnahme-Seite `film-kapitel1/sprechstudio/Sprechstudio-Kapitel1.html` auf:
  - Datei im Browser (Chrome, am Computer) öffnen.
  - Mikrofon erlauben.
  - Aufnehmen mit der Leertaste. Danach springt die Seite automatisch zum nächsten Satz.
  - Filter nach Affe, Schwein oder Professor.
  - Die Aufnahmen bleiben im Browser gespeichert.
  - „Alles herunterladen (ZIP)“ liefert `kapitel1-stimmen.zip` mit `NN_figur.webm` und `liste.txt`.
- Rohdateien Affe: `sounds/stimmen/*.webm` (11 Stück).
- Bearbeitet: `sounds/stimmen_fertig/*.wav` mit `werkzeuge/stimmen_aufbereiten.py`. Das Werkzeug:
  - nimmt den lauteren Kanal (die Aufnahmen kamen **nur links** an, rechts Stille, Nutzer: „sie sind mono, sollten aber auf beiden Ohren ausgegeben werden“) und legt ihn auf **beide Ohren**
  - filtert unter 80 Hz weg
  - kürzt die Stille am Anfang und Ende
  - **komprimiert sanft** (Nutzer: „vllt kannst du auch noch ein bisschen komprimieren“)
  - gleicht die Lautheit an: −18 LUFS normal, **−23 LUFS für die Flüster-Sätze 21–25**
- Hörprobe für den Nutzer: `videos/affe_hoerprobe.mp3` (Sätze 1, 3, 18, 23). **Eine Rückmeldung dazu steht noch aus.**
- Platzhalter-Stimmen im aktuellen Vorschau-Film: Piper TTS (`tts/erzeugen.py`, Stimmen thorsten/karlsson/kerstin). Der Nutzer fand Computerstimmen „schrecklich/elektronisch“. Sie sind nur Platzhalter, bis alle eigenen Aufnahmen da sind.

---

## 3. Wie das Video entsteht (Skripte und Befehle, in Reihenfolge)

**Wichtig vor dem ersten Lauf auf dem PC:** Viele Skripte enthalten **feste Pfade der alten Cloud-Umgebung**:
- `/tmp/claude-0/-home-user-koopgame/f80d235d-…/scratchpad/...`
- den Chromium-Pfad `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`

Diese Pfade müssen auf den PC angepasst werden. Betroffen sind (ohne die `_vN`-Sicherungskopien):
- `prototyp/`: build.py, film_export*.py, himmel_aussen_export.py, live.py, mk_*.py, probe.py, pruef_seite.py, shot*.py, ton_export.py, video_bauen.py, vorhang_bilder.py, vorspann_export.py
- `tts/erzeugen.py`
- `werkzeuge/schritt_holen.py`
- `sprechstudio/test_studio.py`
- `videos/schau.py`

Die Blender-Skripte arbeiten meist relativ zum eigenen Ordner. Die Ordnerstruktur `blender/`, `prototyp/`, `sounds/`, `seite_film/` (hier `videos/`) sollte deshalb nebeneinander erhalten bleiben. `vorschauNN_bauen.py` sucht die Sounds unter `blender/../sounds` und schreibt nach `blender/../seite_film/`.

**Werkzeuge in der alten Umgebung**
- Blender 4.2 als Python-Modul (`pip install bpy` in einem venv `bvenv`, dazu numpy und Pillow)
- Render-Engine **Cycles** (bisher nur CPU, deshalb so langsam), OIDN-Entrauschen, AgX-Farblook
- Python 3.12 mit Playwright und Chromium für den Browser-Prototyp
- node, um `skript.js` auszuwerten
- ffmpeg

**Auf dem PC:** In Cycles die GPU einschalten (OptiX bzw. CUDA bei NVIDIA). In `requisiten.py` wird `S.cycles.device` bisher nicht gesetzt, das muss für die GPU ergänzt werden.

### Schritt 1 – Regie/Bewegung im Browser-Prototyp (`prototyp/`)

- `prototyp/src/` enthält:
  - `skript.js`: **DREHBUCH**, also Sätze, Gesten, Regie-Ereignisse und Pausen
  - `regie.js`: Bewegungen, Gesten, Reaktionen, Gehen/Schleichen, Licht, Stern, Tür-Geräusch-Ereignisse
  - `ton.js`: Klänge
  - `engine_*.js`: 3D-Figuren in WebGL
  - `bild.js`: Zimmer/Außen in 2D
  - `stimmen.js`: Platzhalter-Stimmen samt Lautstärke-Hülle für den Mund
- `python3 prototyp/build.py` erzeugt `kapitel1.html` und `kapitel1_lokal.html`.
- **Neue Stimmen einbauen:**
  - `stimmen.js` enthält je Satz-Index die Aufnahme als base64 und die Lautstärke-Hülle (30 Hz).
  - Der Mund folgt dieser Hülle: `AUFNAHMEN[i].huelle`, `pegel` je Bild.
  - Wie die Datei aufgebaut wird, zeigt `tts/erzeugen.py`. Für die eigenen Aufnahmen: Piper-Teil weglassen, die bearbeiteten WAVs aus `sounds/stimmen_fertig/` nehmen und die Hülle genauso berechnen.
  - **AUFNAHMEN-Index = Index im DREHBUCH**, nicht die Satznummer 1–25. Das muss zugeordnet werden.

### Schritt 2 – Bewegung Bild für Bild exportieren

```
python prototyp/film_export_voll.py blender/film_vollNN.json blender/himmelNN
```

- Spielt die Szene mit 24 Bildern/s ab und schreibt je Bild die Posen (Matrizen), Mundöffnung, Licht und Stern in die JSON.
- Schreibt außerdem den Himmel im Fenster als PNG je Bild.
- Schneller Modus `NUR_MATRIZEN`: ca. 42 s statt 2 h.
- Höchstens 4000 Bilder.
- Aktueller Stand gepackt: `blender/film_voll9.json.gz`, entpacken mit `gunzip`. Der Himmel `himmel9` muss neu erzeugt werden.

### Schritt 3 – Hintergründe je Kamera

- `requisiten.py` im Modus `filmvoll` mit `NUR_HINTERGRUND=1` rendert `hintergrund_<kamera>.png` und `hintergrund_glimm_<kamera>.png`. Die Variante `dunkel_<kamera>` (Licht aus) entsteht beim Rendern automatisch.
- Aufruf aus dem Ordner `blender/`:
  ```
  env FILMJSON=$PWD/film_vollNN.json ZIELDIR=$PWD/film_vsNNh SAMPLES=4 BG_SAMPLES=16 KINDER=2 FELL_DICHTE=400 NUR_HINTERGRUND=1 THREADS=4 \
      <bvenv>/bin/python requisiten.py -- $PWD/film_vsNNh/x0.png filmvoll 10 .375 $PWD/platzhalter.json $PWD/zimmer.py
  ```
- Die Zahl `.375` ist der Maßstab, also 480×270 für die Vorschau. Für die **Endfassung**:
  - Maßstab 1 (1280×720) oder höher
  - deutlich mehr Samples (z. B. SAMPLES 64–128, BG_SAMPLES 256)
  - KINDER (Fell-Haare je Grundhaar) und FELL_DICHTE höher
- Die Vorschau-Hintergründe der letzten Fassung liegen als Referenz in `blender/hintergruende_vorschau12/`.

### Schritt 4 – Filmbilder rendern

- `blender/render_vorschau.py` (bzw. `render_vorschauNN.py`, das sich nur im Ordner unterscheidet):
  - zwei Blender-Prozesse parallel (TEILE=4, REST 0 und 2)
  - Vorschau: **nur gerade Bilder**, also 12 Bilder/s. Für die Endfassung auch die ungeraden (REST 1 und 3) rendern.
  - fertige Bilder werden übersprungen
  - je Bild werden nur die Bereiche mit Figuren gerendert („Rechtecke“) und später über den Hintergrund gelegt
- Spart Zeit: Ändert sich nur der Hintergrund einer Kamera, reicht es, die Bilder dieser Kamera neu zu rendern. Das ist mehrfach so gemacht worden, Beispiel: `blender/kopieren11.py` (vergleicht alte und neue Hintergründe und übernimmt die Bilder unveränderter Kameras).

### Schritt 5 – Zusammensetzen

```
env MASSSTAB=.375 FILMJSON=film_vollNN.json python zusammensetzen.py film_vsNNh himmelNN film_vsNNh_fertig 0 N
```

- Hintergrund + Figuren-Ausschnitte + Himmel im Fenster + Blitz beim Einschlag + Wackeln + Kino-Balken.
- Wird von `vorschauNN_bauen.py` automatisch aufgerufen.

### Schritt 6 – Tonspur des Films

```
python prototyp/ton_export.py blender/ton_filmNN.wav 5.0
```

- Die `5.0` ist der Vorspann in Sekunden, also die Länge der Haus-Einstellung.
- Spielt die Regie ab und schreibt die Geräusch-Ereignisse mit. Dazu gehören Licht-Klick, Tür, Stern, Schritte (nur für die Zeitpunkte; Schritte und Tippeln sind **aus**) und die Stimmen.
- Rendert alles in eine WAV und schreibt eine JSON mit Zeilen-Startzeiten und Ereignissen.

### Schritt 7 – Haus-Einstellung (5 s)

```
HAUS_BILDER=120 python blender/flug_zusammen3.py flug_haus himmel_aussen flug_haus_innen himmel2/h_0000.png x haus_vs5
```

- Das Haus steht still, nur der Himmel bewegt sich.
- Der Himmel `himmel_aussen` (130 Bilder) wird mit `prototyp/himmel_aussen_export.py <ziel> <anzahl>` erzeugt.
- Für die Endfassung muss das Haus **in voller Qualität neu gerendert** werden (`aussen.py`).

### Schritt 8 – Blätter-Vorhang am Ende

```
python prototyp/vorhang_bilder.py blender/vorhang_vs 84
```

Erzeugt 84 Bilder mit dem Vorhang wie im Spiel und der Tafel „Level 1“ / „Dschungel bei Nacht“.

### Schritt 9 – Alles zum Video

```
python blender/vorschau13_bauen.py
```

- Setzt die Bilder zusammen: Haus → Film (die letzten 20 Bilder abgedunkelt) → Vorhang.
- Mischt den Ton (Abschnitt 2.2) und erzeugt mit ffmpeg `seite_film/vorschau13.mp4`.

### Schritt 10 – Vorschau zeigen

- Bisher wurde die Vorschau als claude.ai-Artifact veröffentlicht: https://claude.ai/artifact/TQ4vbV52tXpzo54K8ZLguH
  - Seite mit Video, Liste „Was neu ist“ und Bildern.
  - Bauen mit `seite_film`/`vorschau.html` (Video als base64 eingebettet).
- Ältere Endfassung „Fassung 2“ in hoher Qualität (noch mit altem Inhalt): https://claude.ai/artifact/CXK8YKGRecqy9uqwkaVpdw, Video `videos/film.mp4`.
- Erster Browser-Prototyp: https://claude.ai/artifact/BvceEPZCN7onDi4BHXq1EU

**Arbeitsweise, die der Nutzer will:** immer erst eine **schnelle Vorschau in niedriger Qualität** („häufig fallen mir dabei schon Details auf“), Rückmeldung abwarten, und erst nach Freigabe in hoher Qualität rendern.

---

## 4. Der neue Dialog (vom Nutzer abgesegnet, wird so eingesprochen)

**Teil A – Plaudern über den Tag**

| Nr | Figur | Satz |
|---|---|---|
| 1 | Affe | Ich war heute auf dem höchsten Baum vom ganzen Wald! Ganz oben! |
| 2 | Schwein | Er ist runtergefallen. |
| 3 | Affe | Ich bin *gesprungen*. Das ist ein Unterschied. |
| 4 | Prof | Auf einen Ast, der zu dünn war, nehme ich an? |
| 5 | Affe | … Er sah dick aus. |
| 6 | Schwein | Und ich war am See. Ich wollte schwimmen. |
| 7 | Affe | Sie stand zwanzig Minuten mit einem Fuß im Wasser. |
| 8 | Schwein | Es war kalt! |
| 9 | Prof | Mut kommt manchmal ganz langsam, Schweinchen. Erst ein Zeh, dann ein Fuß … |
| 10 | Schwein | Dann der zweite Fuß. Morgen vielleicht. |
| 11 | Affe | Und was hast du heute gemacht, Professor? |
| 12 | Prof | Ich habe den Himmel beobachtet. Wie jede Nacht. |
| 13 | Affe | Und? Was Spannendes? |
| 14 | Prof | Ach was. Da oben passiert nie etwas Aufregendes. |

*– Zischen, Lichtstreif am Fenster, BOOM, alles wackelt –*

**Teil B – Der Meteorit**

| Nr | Figur | Satz |
|---|---|---|
| 15 | Schwein | Oh! Was war das?! |
| 16 | Affe | Da draußen! Da ist was runtergekommen! |
| 17 | Prof | … Das war keine normale Sternschnuppe. Das war ein Meteorit. |
| 18 | Affe | Wir holen ihn! |
| 19 | Prof | Morgen früh. Bei Tageslicht. Und jetzt: ab ins Bett, ihr zwei. |
| 20 | Schwein | … Gute Nacht, Meteorit. |

*– Licht aus, der Professor geht raus –*

**Teil C – Im Dunkeln (alles geflüstert, aus dem Off über dem dunklen Wohnzimmer)**

| Nr | Figur | Satz |
|---|---|---|
| 21 | Affe | Psst! Schweinchen … bist du noch wach? Komm, lass uns los. Ich halt's nicht mehr aus – wir müssen die Ersten sein! |
| 22 | Schwein | Aber … eigentlich dürfen wir das nicht. **(Dieser Satz MUSS vom Schwein bleiben, ausdrücklicher Nutzerwunsch.)** |
| 23 | Affe | Du wolltest dich doch mal was trauen. So richtig. Jetzt ist die Gelegenheit! |
| 24 | Schwein | … Na gut. Aber ganz leise. |
| 25 | Affe | Psst! Wir müssen ganz leise sein … *(beim Losschleichen)* |

**Absprachen zum Dialog**
- Die Sternschnuppe wird **NICHT angekündigt**. Der Nutzer will keinen Satz wie „Heute Nacht kommt die Sternschnuppe des Jahrhunderts“. Es ist ein **Meteorit**, der überraschend „Boom“ macht, und dann: „Oh, was war das?“
- Kleiner Witz: Der Professor sagt kurz vorher „Da oben passiert nie etwas Aufregendes“.
- **Die Wünsche fallen weg.** Gemeint sind „Wunsch aufgeschrieben, in drei Versionen“, „wo noch niemand war“ und „dass ich mich mal was trau“.
- Satz 23 („Du wolltest dich doch mal was trauen“) bezieht sich jetzt auf den See: Das Schwein stand 20 Minuten mit einem Fuß im kalten Wasser.
- **„Papa“ kommt nicht mehr vor.** Nutzer: „Nein, das sind einfach drei Freunde.“ Früher war der Professor „sozusagen der Papa“, das gilt **nicht mehr**. Der Affe sagt „Professor“.
- Der Nutzer darf beim Einsprechen vom Text abweichen. Das hat er früher ausdrücklich gefragt, die Antwort war ja.
- **Bildidee zum Meteoriten** (vorgeschlagen, vom Nutzer nicht widersprochen):
  - kürzer und schneller als bisher (bisher ca. 2 s sichtbar am Fenster)
  - alle drehen sich **erst beim Boom** zum Fenster, nicht schon vorher
  - **noch nicht umgesetzt**
- **Offene Frage an den Nutzer:** Satz 21 ist als Aufnahme 19 s lang, mit Pausen von bis zu 2 s. Vorschlag: lange Pausen auf ca. 0,5 s kürzen, dann ca. 13 s. Darauf gibt es **noch keine Antwort**.

**Zum Vergleich: der alte Dialog, der im Vorschau-Film noch läuft** (`prototyp/src/skript.js`, Index = DREHBUCH-Position)
- 1–2 Prof: „So, ihr zwei. Heute Nacht kommt die Sternschnuppe des Jahrhunderts.“ / „Und wer sie sieht, darf sich etwas wünschen.“
- 3–4 Schwein: Wunsch aufgeschrieben / in drei Versionen
- 5–6 Affe: „… wo NOCH NIEMAND war! Nicht mal du, Papa.“
- 7 Prof: „großer Wunsch für so einen kleinen Affen“
- 8 Schwein: „dass ich mich mal was trau“
- 9 Affe: „Du traust dich doch was!“
- 10 Schwein: „zwanzig Minuten … ins Wasser“
- 11 Affe: „Es war kalt.“
- 12 Stern
- 13 Prof: „Da! Da ist sie!“
- 15 Prof: „keine normale Sternschnuppe“
- 16 Affe: „Wir holen sie!“
- 17 Prof: „Morgen früh …“
- 18 Schwein: „Gute Nacht, Sternschnuppe.“
- 19 Licht aus / Prof geht
- 21–24 Flüster-Dialog wie oben, 26 „Psst! Wir müssen ganz leise sein …“

**Zeitplan im aktuellen Vorschau-Film** (Sekunden ab Videostart, Vorspann 5 s):

| Zeit | Was passiert |
|---|---|
| 0–5 | Haus außen, Eule bei 0,8 s |
| 5,0 | harter Schnitt nach innen |
| 6,6 | erster Satz |
| ca. 37 | „Es war kalt“ (Satz 11) |
| 38,7 | Stern |
| ca. 40,5 | Einschlag |
| 53,8 | „Gute Nacht“ |
| 56,1 | Kinder stehen auf, Professor geht zur Tür |
| 58,6 | Tür auf (Geräusch) |
| 59,0 | Licht aus (Klick) |
| 60,4 | Tür zu |
| 61,8–79 | Flüster-Dialog |
| 79 | Affe schleicht los, Schwein 1,4 s später |
| 85,9 | Tür auf (Geräusch) |
| 88,1 | Tür zu |
| ca. 87,5 | Abdunkeln |
| danach | Blätter-Vorhang (3,5 s) |

Gesamtlänge **93 s**. Mit dem neuen Dialog ändern sich alle Zeiten.

---

## 5. Was gerade bei der Vertonung passiert (Stand beim Anhalten)

1. Der Nutzer hat die **Affen-Sätze** (1, 3, 5, 7, 11, 13, 16, 18, 21, 23, 25) als ZIP geschickt. Sie sind geprüft:
   - nicht übersteuert
   - Grundrauschen ca. −60 bis −69 dB, also sauber
   - Stille an den Rändern vorhanden
2. Bearbeitet mit `werkzeuge/stimmen_aufbereiten.py`:
   ```
   python werkzeuge/stimmen_aufbereiten.py sounds/stimmen sounds/stimmen_fertig
   ```
   Was das Werkzeug macht, steht in 2.3.
3. Hörprobe `videos/affe_hoerprobe.mp3` geschickt. **Rückmeldung offen:** passt die Kompression, mehr oder weniger?
4. **Als Nächstes:**
   - Schwein und Professor mit derselben Seite aufnehmen lassen.
   - Die neue ZIP enthält dann alle Sätze, weil die Seite die Affen-Aufnahmen noch gespeichert hat.
   - Mit demselben Werkzeug bearbeiten.
   - Danach Dialog und Regie umbauen und die Stimmen einbauen (Schritt 1 in Abschnitt 3).
5. **Nicht direkt in claude.ai aufnehmbar:** Die Aufnahme-Seite als claude.ai-Artifact (https://claude.ai/artifact/9eHuXdRy3YLDJxMMF3FCHr) funktioniert **nicht mit Mikrofon**, weil claude.ai das sperrt. Der Nutzer wollte direkt einsprechen, deshalb die **Datei-Lösung** (Möglichkeit 2).
   - Verworfen wurde Möglichkeit 1: Aufnahme-Seite auf der Spiel-Webseite mit „Auf GitHub speichern“. Grund: Der Nutzer wollte sofort loslegen, und dafür wäre vorher der große Test (ca. 45 min) für `main` nötig gewesen.
   - Ebenso verworfen: Handy-Sprachmemo und Upload je Satz („sehr umständlich“).

---

## 6. Alle Absprachen aus dem Gespräch (chronologisch, so vollständig wie möglich)

### 6.1 Hintergrund und Story (vor dem Video)

- Ausgangsfrage des Nutzers:
  - das Spiel vielleicht neu erfinden, eventuell mehr Richtung 3D, Brainstorming
  - **„Ich möchte nicht, dass du irgendeinen Zweig baust …“**, deshalb lag das Video bisher nur in der Arbeitsumgebung
  - **Dieser Zweig ist die erste Ausnahme, ausdrücklich gewünscht.**
- Die Physik des Spiels (Springen, Dash, Hangeln) muss weiter funktionieren.
- Wunsch nach einer **Geschichte wie „Split Fiction“**: Story-Line, sprechende Figuren, die einem Ziel folgen, wechselnde Welten (Fantasy/Science-Fiction). Aber **nicht Split Fiction nachbauen**.
- **Wunschsplitter:**
  - am Ende jeder Welt ein Wunschsplitter
  - zuerst gehen Affe und Schwein entspannt durch den Wald (die ersten 6 Level, Dschungel, Arbeitsname „Verwalt“)
  - am Ende von Level 6 ein Wunschsplitter, mit dem man sich eine von 4 Welten wünschen kann
  - Idee: Affe-Wunsch oder Schwein-Wunsch wählbar, die nicht gewählte Welt kommt später
  - Gamebook-Idee mit verschiedenen Enden; der Nutzer fand sie interessant, aber sehr aufwendig
- Bücher als Inspiration wurden gesucht.
- **Verworfen:** Bananenwelt (Affe) und Schlammwelt (Schwein). Grund: Das ist alles Dschungel/Garten, also immer dieselbe Welt.
  - Gewünscht: **sehr unterschiedliche Welten**, z. B. Weltraum, „als Bakterie auf einem Menschen“ (bildlich gemeint)
  - Die Welten müssen in **2D umsetzbar** sein. Das Spiel bleibt 2D.
- Es soll das **Zuhause von Schwein und Affe** geben.
- Erst einmal **nur die allererste Sequenz im Detail** (nicht Akt 3–6). Es geht darum, was am Anfang passiert und was am Ende des Dschungels.
- Frage „Story-Teile in 3D animiert?“ → ja, das wird jetzt gemacht.

### 6.2 Entstehung des Videos (Runden 1 bis 8, Oktober 23.–25.)

**Start**
- Der Professor ist ein **Marienkäfer-Plüschtier** (Fotos vom Nutzer) und sollte in 3D nachgebaut werden.
- Startbildschirm „Kapitel 1 – Die Nacht, in der der Stern fiel“, dann gehen die Blätter weg, dann das Häuschen, dann der Blick durchs Fenster, dann der Dialog.
- Details: warm leuchtendes Fenster, Glühwürmchen. Musik vielleicht Klavier, **Musik noch offen** („muss ich mir später noch überlegen“).

**Proportionen**
- Körper und Kopf des Professors „dicker/größer“, damit er zu Schwein und Affe passt.

**Bestehende Spiel-Bildschirme**
- Blätterwand, „Wer spielt wen“ und Hauptmenü gibt es schon. Das Video startet nach dem Blätter-Vorhang mit „Kapitel 1“.

**Anweisungen damals**
- Haus mit **schwarzen Balken oben/unten**, ohne Button und Schrift.
- **Baumbüschel auch im Vordergrund** (nur im Hintergrund sah es komisch aus).
- Der Zoom ins Fenster sollte **schnell** kommen, und man sollte **von außen ins Fenster** hineinsehen können (nicht nur ein Bild).
- Der Affe hing an der Decke, das sah komisch aus. Beide sollten unten links stehen.
- Stimmen: **Schwein ganz helle Stimme, Affe normal, Professor dunkel**. „Oder soll ich das einsprechen?“
- **Professor mit Lesebrille.**

**Weitere Rückmeldungen**
- Die **tickende Wanduhr im Hintergrund war „nicht schön“** und wurde entfernt.
- Die Figuren **schwebten**. Gewünscht: mehr Bewegung (Keks holen und essen, Professor setzt sich in den Sessel mit Decke), nicht auf der Stelle stehen.
- „Die Stimmen klingen schrecklich“, „sehr elektronisch“. Erst Browser-Stimmen, dann Piper. Beides gefiel nicht. Andere Sprachdienste waren in der Umgebung gesperrt.
- Professor ohne Mund → Mund eingebaut. Mund bei Schwein/Affe stimmte nicht.
- **„Mehr wie Pixar“.** Couch für die beiden, **aufspringen, wenn die Sternschnuppe landet**.
- Der Dialog sollte **wie im Film** fließen, nicht abgehackt.
- **Keine Sprechblasen**, wenn sie miteinander sprechen.
- Eine richtige Decke, nicht ein kariertes Viereck.
- „Die Sternschnuppe muss vor dem Fenster herfliegen und alle müssen dann schauen. Oder es macht Rums und dann schauen alle.“
- „Hier überdeckt der Affe das Schwein“ → behoben.
- Füße steckten im Kopf, danach waren sie zu lang → behoben.
- Natürliche, normal schnelle Bewegungen gewünscht. Der Professor „springt random auf den Stuhl“ → behoben.
- Keks und Wunschzettel hingen in der Luft → behoben, später ganz entfernt (siehe unten).
- „Mir geht es eher um Details, die es foto- bzw. Pixar-realistischer machen. Das sieht zu cheap aus.“ → Umstieg auf **Blender-3D**.
- „Das Ergebnis ist toll.“ Danach sollte das Häuschen außen auch so werden.
  - Figuren müssen „wie Pixar“ werden: nicht schweben, Schatten passend, Schwein nicht in der Couch.
- Decke, Zettel und Kekse in Blender. Die Couch soll **nachgeben**, wenn die beiden darauf sitzen.
- Die Tür außen war kaputt.
- Der Blick ins Fenster war nur ein Rechteck.
- Die beiden sollen **richtig gemütlich** auf der Couch sitzen.
- Professor mit mehr Details.
- „Macht es nicht Sinn, alles 3D zu modellieren und dann das Licht auszurichten?“ (Schatten und Couch wirkten wie aus einer anderen Welt) → alles in Blender.
- **Fliege und Brillenkette weg, dafür Bademantel.**
- Der Nutzer hat „**Erst Teststück**“ gewählt. Danach: „Mach bitte das ganze Video über die Nacht“, um 10:00 Uhr anschauen → **Fassung 1** über Nacht gerendert.

**„Wow sehr gut!!!“, Rückmeldung zu Fassung 1**
- Affe und Schwein flimmerten im Licht → behoben.
- Ecke des Professors zu dunkel → mehr Licht.
- Augen leuchten zu stark → gedämpft.
- Der Affe braucht keinen Keks mehr zu holen. Entscheidung des Nutzers: „Affe steht auf, läuft hin und her, aber holt sich keinen Keks und isst den nicht. Das ist zu schwer zu animieren.“
- Der Zettel des Schweins sollte mehr vors Gesicht → später ganz entfernt.
- Der Zoom vom Haus ins Fenster war nicht schön → „Echter 3D-Kameraflug“ gewählt, **später wieder verworfen** (siehe Runde 4).
- Der Dialog sollte lebendiger werden → **„Kamera-Schnitte + Mimik“** gewählt.
- **Fassung 2** war das Ergebnis (hohe Qualität, https://claude.ai/artifact/CXK8YKGRecqy9uqwkaVpdw).

**Weitere Punkte**
- Glas im Fenster: Der Blick ins Fenster passte noch nicht, und es sah nicht aus, als wäre Glas drin.
- Der Nutzer wollte ab dann **immer erst eine Vorschau in niedriger Qualität**.

**Runde 3**
- **Zettel komplett weglassen.**
- Affen-Schwanz halb abgeschnitten → neuer Schwanz.
- Professor stand im Stuhl.
- „Das Tuch sieht nicht gut aus.“
- Der Bademantel braucht einen **Kragen**.
- Das Außenfenster beim Reinzoomen sah aus wie „ein Loch mit einem JPG dahinter“ → Fenster mit Laibung, Kreuz und Glas neu gebaut.

**Runde 4**
1. **Decke vom Professor komplett raus.**
2. Bei 24 s war der Professor oben und unten abgeschnitten → behoben.
3. Bademantel **komplett zu** („kein Playboy“).
4. Bademantel **bis unter den Kopf**.
5. **Kamerafahrt am Anfang raus.** Das Haus **3 Sekunden** zeigen, dann **harter Schnitt** ins Wohnzimmer, ohne Kamerafahrt. (Später auf **5 s** verlängert, siehe Runde 12.)
6. Explosion **krasser**, „ein richtiger Rums“.
7. Der Nutzer wollte die Dialoge selbst einsprechen und durfte vom Text abweichen. „Setz gerne schon mal alles um.“

**Schwein-Stimme**
- „Das Schwein bekommt eine **sehr helle, schrille Stimme** und zieht die Worte **sehr lang**.“
- Die Mundbewegung kommt automatisch aus der Lautstärke der Audiodatei. Der Nutzer muss nichts weiter liefern.

**Arbeitsweise**
- Der Nutzer fragte, ob man das Rechnen auf mehrere Agenten aufteilen kann, um schneller zu werden → „Ja bitte“ (Export von 2 h auf 42 s beschleunigt, Vorschau-Rendern ca. 30–40 min).

**Runde 5**
1. **Sessel vom Professor raus.** Er soll im rechten Bereich herumlaufen und zwischendurch ins **Fernrohr** schauen, und es soll gut aussehen.
2. Schwein bei „Gute Nacht Sternschnuppe“ war abgeschnitten → behoben.
3. Affen-Schwanz hing im Sofa → beim Sitzen ausgeblendet.
4. Affen-Arm verschwand im Körper → behoben.
5. **Alle schauen raus**, wenn die Sternschnuppe kommt und aufschlägt.

**Runde 6: neues Ende**
- „Affe und Schwein schleichen sich nachts heimlich raus“, dann Übergang zu Level 1, und **Level 1 ist bei Nacht**.
- Antworten des Nutzers:
  - **„Licht aus, dann schleichen“**
  - **„Außen + Blätter-Vorhang“** (später geändert, siehe Runde 7)
  - **„Ja, immer Nacht“** für Level 1. Im Spiel schon umgesetzt: Level 1 ist fest auf Nacht, auf `main`.
- Der Nutzer wollte das Video vorher sehen.

**Runde 7**
1. Schwein und Affe liefen ineinander → behoben (Abstand beim Gehen).
2. „Beim Laufen sollen sie auch so süße Tippel-Geräusche machen“ → eingebaut, **später wieder entfernt**.
3. „Der ganze Dialog ist unnötig“ (gemeint war der damalige Dialog am Ende) → entfernt.
4. **Nicht vor dem Haus zeigen**, wenn sie rechts rauslaufen: **Bild abdunkeln, Blätter einblenden**, dann geht es weiter mit Level 1.

**Runde 8 (mit Sounds vom Nutzer)**
1. Der **Mund muss wirklich am Körper anliegen** → auf die Kopf-Oberfläche gesetzt.
2. Die **Hände des Schweins** steckten im Körper → behoben.
3. Der **Vorhang im Hintergrund steckte in der Fensterbank** → nach vorn versetzt.
4. „Man checkt als Zuschauer nicht, dass die beiden sich auf den Weg machen wollen.“ Deshalb ein **Mini-Dialog aus dem Off über dem dunklen Wohnzimmer**:
   - Affe: „komm, lass uns los, ich halte es nicht aus, wir müssen die Ersten sein“
   - Schwein: „**aber eigentlich dürfen wir das nicht**“ (muss bleiben)
   - Affe überzeugt: „Du musst dich einmal was trauen“
   - beim Losgehen: „Psst, wir müssen leise sein“
   - Ausschmücken war erlaubt.
5. Sounds eingebaut: outside_room, inside_room, sternschnuppe_boom, footsteps_knarschender_baum.
6. Die Sternschnuppe fliegt **passend zum Sound von links nach rechts** und schlägt auf, **ohne extra Drehung bzw. Schleife**.

### 6.3 Runden 9 bis 13 (25.10.)

**Runde 9**
1. Der Affe hatte keinen Mund → behoben.
2. Dem Professor fehlten die Füße, er stand halb im Boden → behoben.
3. Zwischen Fernrohr und Ständer fehlte ein Teil, das Fernrohr schwebte → Säule, Gelenk und Schelle eingebaut.
4. Der Professor lief bei **Sekunde 11** „random nach rechts“ und drehte sich wieder um (ein Überbleibsel vom Sessel) → **Bewegung entfernt**, er bleibt am Fernrohr.
5. Rechts fehlte eine Tür. Er ging am Ende „durch die Wand“ → **Tür in die rechte Wand** eingebaut.

**Ton drinnen**
- „Kannst du bitte die Geräusche drinnen entfernen? Das ist sonst komisch.“ → Die Zimmer-Atmosphäre `zimmer.mp3` wurde entfernt.
- Vorschläge für andere Geräusche: Uhr, Holzknarren, Grillen von draußen, Lampe, Stille.
- Der Nutzer: Die **tickende Wanduhr** fand er gut, das Holzknarren hatte er schon geschickt.

**Runde 10 (mit Sounds: Tür auf, Tür zu, Lichtschalter, Standuhr)**
- Holzknarren **allgemein im Hintergrund**, nicht fürs Laufen.
- Fürs Laufen die **Schritt-Geräusche aus dem Spiel**.
- Die Uhr **sehr leise**, „will nicht, dass es nervt“.
- Dann mit room_sound.wav: „auch leise im Hintergrund verwenden“.
- Damals stand die Tür im Bild halb offen (68°) und bewegte sich nicht, Tür-Geräusche gab es trotzdem → gefiel nicht (siehe nächste Runde).

**Runde 11**
- **Uhr wieder raus.**
- **Tür vom Professor zu machen**, also im Bild geschlossen.
- Schritte leiser und kontrollierter. Beim Schleichen „ganz hell und kurz wie im Cartoon“, beide sollen tippeln.
- **Tür auf/zu-Geräusche auch, wenn Schwein und Affe rausgehen, nur als Geräusch.**

**Runde 12**
- „Was ist denn hier mit dem Schatten von der Tür los?“ Der dunkle Streifen war ein Loch in der Wand → geschlossen. Dazu ein Spalt oben → geschlossen.
- „Können wir uns bitte wieder ein bisschen auf die Details konzentrieren?“
- **Vorhang im oberen Bereich weg** → Vorhänge enden unter dem Balken.
- Das Tippeln „hört sich komisch an“. „Kannst du das nicht wie in gängigen Cartoons machen?“ → Pizzicato-Zupftöne gebaut.
- Dann: „**Okay, nimm den Sound für Schritte und Tippeln komplett raus.**“ → **Schritte und Tippeln sind KOMPLETT AUS.** Nicht wieder einbauen, ohne zu fragen.

**Runde 13 (mit Sounds: BRS Creaks, footsteps_knarschender_baum, Eule)**
1. Der Ton am Haus war „super laut“ → leiser.
2. **Haus länger zeigen** (jetzt 5 s) und die **Eule einmal rufen lassen**. Die Datei war sehr laut und wurde stark gedämpft.
3. „Warum flackern die Charaktere so?“
   - Antwort: Die Vorschau rechnet nur jedes 2. Bild (12/s, doppelt gezeigt), dazu kommt Rauschen wegen sehr niedriger Qualität.
   - Die Endfassung rechnet alle 24 Bilder/s in hoher Qualität.
   - Angebot: vorher ein paar Sekunden in voller Qualität zur Probe. **Darauf gibt es noch keine Antwort.**
4. Mehr **Holzknarren im Hintergrund**: BRS_Creaks dauerhaft, footsteps_knarschender_baum **beim Laufen**.

**Feinschliff in den Folgerunden**
- Außen „gerne noch leiser“. **Beim Bildwechsel nach innen den Ton hart schneiden.**
- Das durchgehende Knarren hörte man „gar nicht“ → lauter.
- „Das Knarren ist zu laut“ → etwas leiser.
- „Und weniger, immer mal so ein bisschen einspielen“ → nur ab und zu.
- „Jetzt ist der **zweite Uhuh von der Eule abgeschnitten**, das klingt komisch.“ Und: „Es muss auch **ganz genau mit dem Cut** der Sound wechseln.“
  - Lösung: Die Eule ruft jetzt früh bei 0,8 s.
  - Ursache für den scheinbar zu frühen Wechsel war ein lauter Ausschlag in der Außen-Aufnahme bei 4,8 s. Jetzt wird eine ruhige Stelle ab 10,5 s benutzt.
- „Das Knarren klingt echt komisch. Es sollte halt **durchgehend** knarren, nicht nur wenn jemand läuft.“
- Neue Sounds: **Schiffs-Knarzen** (ESM ship loop) = „super, um den durchspielen zu lassen“, darf bearbeitet werden, damit es echter wirkt. Dazu **Wind** für draußen. Außen-Ton noch leiser.
- Ergebnis: **„So ist erst mal gut.“** Der Ton ist damit vorerst abgenommen.

**Verworfene Ton-Ideen (nicht wieder einbauen)**
- tickende Wanduhr, auch ganz leise
- Zimmer-Atmosphäre `zimmer.mp3`
- Spiel-Schritte
- Cartoon-Piepser-Tippeln
- Pizzicato-Tippeln
- BRS-Creaks als Dauerknarren
- nur gelegentliche Knarz-Einwürfe (jetzt das Schiffs-Knarzen durchgehend)

### 6.4 Nach dem Ton: Dialog, Aufnahme, Glas

- Der Nutzer will **erst Dialog und Sprachnachrichten** liefern, **dann** das hochaufgelöste Rendern (Reihenfolge so abgesprochen).
- **Rundes Zimmerfenster: ohne Glas**, so wie bisher (entschieden).
- Dialog: Am Anfang sollen sie „einfach random über den Tag sprechen“. Dann kommt der Meteorit, dann der alte Dialog im Prinzip. Ausgearbeitet in Abschnitt 4.
  - **Teil B in der ersten Fassung (mit Ankündigung der Sternschnuppe und Wünschen) gefiel nicht** → als Überraschung umgebaut.
- „Drei Freunde“, kein Papa.
- Aufnahme:
  - Hier im Chat kann der Nutzer keine Sprachnachricht aufnehmen.
  - Die Aufnahme-Seite als Artifact hatte ein gesperrtes Mikrofon.
  - Der Nutzer will **direkt einsprechen**, deshalb die HTML-Datei für den Browser (Möglichkeit 2).
  - **Filter nach Affe/Schwein/Professor** ausdrücklich gewünscht und eingebaut.
- Affen-Stimmen geliefert. Wunsch: beide Ohren + etwas komprimieren → erledigt.
- **Umzug auf den PC des Nutzers (Grafikkarte).** Alles kommt auf einen eigenen Zweig, **nicht nach `main`**.

### 6.5 Allgemeine Regeln des Nutzers (gelten weiter)

- Antworten auf **Deutsch, kurz, ohne Fachchinesisch**. Der Nutzer ist kein Programmierer.
- **Details sind wichtig.**
  - Vor dem Zeigen jede Vorschau selbst prüfen: Standbilder in **voller Vorschau-Größe** ansehen, nicht nur kleine Übersichten.
  - Bei Ton **messen** (Pegel, Schnittzeitpunkt). Hören kann Claude nicht, deshalb immer sagen, dass nur gemessen wurde.
- Immer erst **Vorschau in niedriger Qualität**, Rückmeldung abwarten, dann Endfassung.
- Nach jeder Änderung kurz sagen, was sich ändert und wie man es prüft.
- **Nichts nach `main`**, was das Video betrifft, außer der Nutzer will es.
  - Für Spiel-Änderungen gilt CLAUDE.md: großer Testlauf vor `main`.

---

## 7. Was noch offen ist

### 7.1 Vertonung und Dialog

- [ ] **Schwein** (Sätze 2, 6, 8, 10, 15, 20, 22, 24) und **Professor** (4, 9, 12, 14, 17, 19) aufnehmen lassen und mit `stimmen_aufbereiten.py` bearbeiten.
- [ ] Rückmeldung zur Affen-Hörprobe: Kompression in Ordnung?
- [ ] Satz 21: lange Pausen kürzen? (Frage offen)
- [ ] **Neues DREHBUCH** in `skript.js`. Dabei die Zuordnung DREHBUCH-Index ↔ Satznummer 1–25 anlegen. Nötig sind:
  - Plaudern ohne Ankündigung
  - Meteorit als Überraschung mitten im Plaudern, nach Satz 14
  - Teil B
  - Licht aus
  - Flüster-Teil, danach Rausschleichen
- [ ] `stimmen.js` aus den echten Aufnahmen bauen, mit Lautstärke-Hülle für den Mund.

### 7.2 Mundbewegung

- [ ] Der Mund folgt der **Lautstärke** der Aufnahme. Das System dafür gibt es schon (Hülle 30 Hz → `pegel` → Mundöffnung). Mit den echten Stimmen neu exportieren und prüfen:
  - Geht der Mund beim Flüstern genug auf?
  - Bleibt er bei Stille zu?
  - Beim langgezogenen Schwein: Bewegt er sich nicht zu wenig?
- [ ] Wer gerade **nicht** spricht, hat den Mund zu bzw. nur Mimik (Reaktionen wie nicken, schmunzeln usw. gibt es in `regie.js`).

### 7.3 Schnitt und Kamera

- [ ] Die `SCHNITTE`-Liste in `requisiten.py` hängt an **DREHBUCH-Zeilen**. Bei einem neuen Dialog müssen alle Schnitte neu verteilt werden. Faustregel aus den bisherigen Runden:
  - wer spricht, ist im Bild
  - Totale bei Ereignissen (Stern, Licht aus)
  - keine abgeschnittenen Figuren
- [ ] Meteorit: kürzer und schneller als bisher. Alle drehen sich **erst beim Boom** zum Fenster (vorgeschlagen, nicht umgesetzt).
- [ ] Haus außen 5 s + Eule + harter Schnitt bleiben so.

### 7.4 Bewegungen

- [ ] Im neuen Plauder-Teil lebendige Bewegung, wie bei den Gesten und Reaktionen bisher. Mögliche Bezüge:
  - Affe macht vielleicht eine Sprung-Geste bei „gesprungen“.
  - Schwein zeigt „ein Fuß“.
- [ ] Der Professor steht im rechten Bereich und schaut zwischendurch ins Fernrohr. Kein unnötiges Herumlaufen (siehe Sekunde-11-Fehler).
- [ ] Nach „Gute Nacht“: Kinder stehen auf, Professor geht zur Tür, Licht aus, Professor geht raus (Tür im Bild zu, Tür-Geräusche).
- [ ] Rausschleichen: hintereinander, nicht ineinander, auf Zehenspitzen (Schleich-Pose gibt es). **Keine** Schritt- oder Tippel-Geräusche, nur leises Holzknarzen beim Laufen.

### 7.5 Endfassung

- [ ] Nach Freigabe der neuen Vorschau: **hochaufgelöstes Rendern auf der Grafikkarte**:
  - alle 24 Bilder/s
  - 1280×720 oder höher
  - viele Samples
  - Fell dichter
  - Haus außen in voller Qualität neu
  - Hintergründe neu
- [ ] Optional: ein paar Sekunden Probe in voller Qualität, um das „Flackern“ auszuschließen (wurde angeboten).
- [ ] Musik: noch offen. Früher war Klavier im Gespräch, entschieden ist nichts.
- [ ] Einbau ins Spiel (`js/29-spielszenen.js` + `story/story.json`, „Spielszenen“) ist **nicht besprochen und nicht gemacht**. Erst fragen.

---

## 8. Dateien in diesem Zweig (`film-kapitel1/`)

| Ordner | Inhalt |
|---|---|
| `blender/` | alle Blender-Skripte inkl. Sicherungskopien `_vN`, kleine Daten/Bilder (Kameras, Platzhalter, Außen-Ebenen), `film_voll9.json.gz` (Bewegung der aktuellen Vorschau), `ton_film13.*` (Tonspur ohne Hintergrund), `ton13_ganz.wav` (fertige Mischung), `flug_haus*/` (Haus-Einzelbild), `himmel2/h_0000.png`, `hintergruende_vorschau12/` |
| `prototyp/` | `src/` (Browser-Prototyp: Drehbuch, Regie, Ton, Figuren) und alle Python-Skripte (Export, Ton, Vorhang) |
| `sounds/` | alle Ton-Dateien des Nutzers (Abschnitt 2.2) + `stimmen/` (roh) + `stimmen_fertig/` (bearbeitet) |
| `sprechstudio/` | `Sprechstudio-Kapitel1.html` (Aufnahme-Seite zum Öffnen im Browser), `sprechstudio.html` (Artifact-Version, Mikrofon gesperrt), Test |
| `tts/` | Platzhalter-Stimmen-Skript + erzeugte Sätze (alter Dialog) |
| `videos/` | `vorschau3…13.mp4` (Vorschau-Verlauf, **13 = aktuell**), `film.mp4` (Fassung 2, hohe Qualität, alter Inhalt), Hörproben |
| `werkzeuge/` | `stimmen_aufbereiten.py`, `uebergabe_kopieren.py` (hat diesen Ordner erstellt) u. a. |
| `NICHT-HOCHGELADEN.md` | alles, was zu groß oder neu erzeugbar ist, mit Größe |

**Nicht hochgeladen (Kurzfassung, Details in `NICHT-HOCHGELADEN.md`)**
- gerenderte Einzelbilder aller Vorschau-Fassungen, z. B. `film_vs12h` 129 MB, `film_vs12h_fertig` 241 MB, `vs13_alle` 272 MB
- die Endfassungs-Bilder `film_voll`/`film_voll2` (603/655 MB) und `film_fertig*` (je ca. 570 MB)
- ältere Bewegungsdaten `film_voll1–8.json` (je 27–40 MB)
- Fenster-Himmel-Bilder `himmel2…9` (je 44–72 MB) und `himmel_aussen` (94 MB)
- Vorhang-Bilder `vorhang_vs` (77 MB) und Kameraflug-Bilder
- Render-Protokolle bis 933 MB
- Piper-Stimmenmodelle und venv (ca. 560 MB, aus dem Internet ladbar)
- Bildschirmfotos aus der Entwicklung

Insgesamt rund **12 GB**. Alles davon lässt sich mit den Skripten neu erzeugen. Die Endfassung muss ohnehin neu gerendert werden.
