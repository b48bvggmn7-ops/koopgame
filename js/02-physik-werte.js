// 02-physik-werte.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Physik-Konstanten ----------
const GRAVITY = 0.62;
const MOVE_SPEED = 4.4;
const SPRINT_MAX_SPEED = 7.2;
const SPRINT_ACCEL = 0.045;
const AIR_CONTROL = 0.85;
const FRICTION_GROUND = 0.78;
const FRICTION_AIR = 0.94;
const JUMP_V = -12.6;
// Variable Sprunghöhe (nur der normale Sprung vom Boden): lässt man die Sprungtaste während des Aufstiegs los, wird die
// Aufwärts-Geschwindigkeit sanft auf JUMP_CUT_VY gebremst – nie beschleunigt, die bisherige Höchsthöhe bleibt die Grenze.
// JUMP_CUT_VY = die Geschwindigkeit, die ein Sprung nach JUMP_FULL_STEPS Schritten ohnehin hat: wer so lange hält
// (10 Schritte ≈ 0,19 s), springt genau so hoch wie früher; kürzer = stufenlos kleiner (Antippen ≈ 1 Kästchen).
const JUMP_FULL_STEPS = 10;
const JUMP_CUT_VY = JUMP_V + GRAVITY * JUMP_FULL_STEPS;   // -6,4
const JUMP_CUT_SMOOTH = 0.3;   // je Schritt bleibt die Hälfte des Überschusses -> Bremsen über 2–3 Schritte statt Ruck
const WALL_JUMP_VX_MIN = 6.96, WALL_JUMP_VX_MAX = 12.8;
const MIN_WALLJUMP_SPEED = 1.3; // unterhalb davon: kein Wandsprung mehr (kein "aus dem Stand")
const WALL_JUMP_VY_MIN = -14.4, WALL_JUMP_VY_MAX = -16.06;
const WALL_JUMP_BUFFER = 180; // Zeitfenster nach letztem Wandkontakt, Tastatur (Verlauf: 160 -> 200 -> 130 -> 170 -> 150 -> 180)
const WALL_JUMP_BUFFER_PAD = 250; // dasselbe, wenn der Sprung vom Controller kommt
const WALL_SLIDE_MAX_FALL = 2.4;
const MAX_FALL = 15;

// ---------- Leveldesign-Richtwerte Wandsprung (GEMESSEN, Kombi-Nachschärfen) ----------
// Gemessen mit einer Simulation der echten Spiel-Physik (Kamine 1–10 Kästchen breit, Reaktionszeit 0–20 Schritte, Affe und
// Schweinchen gleich). Das Prüfwerkzeug tests/kombi_pruefen.py liest diese Werte HIER (nicht doppelt pflegen).
// Kamin = zwei gegenüberliegende Wände; Breite = freie Kästchen dazwischen.
const KAMIN_ZU_ENG = 2;                          // ≤ 2 zu eng: 1 = nur 1,5 Reihen je Sprung (hektisch), 2 = reißt ab, wer > 0,1 s zögert
const KAMIN_BEQUEM_MIN = 3, KAMIN_BEQUEM_MAX = 5; // bequem: 4–5 Reihen je Sprung, verzeiht bis 0,37 s Reaktionszeit
const KAMIN_KNAPP_MAX = 7;                       // 6–7 knapp: Kette hält nur bei schneller Reaktion (≤ 0,17 s)
const KAMIN_MAX = 8;                             // 8 Grenze; ab 9 zu weit (Kette reißt ab, man fällt)
const WANDSPRUNG_HOEHE_JE_SPRUNG = 4.5;          // Reihen Steigung je Wandsprung im bequemen Kamin (= Höhenabstand Wand zu Wand)
const WAND_MIN_HOEHE = 4;                        // Reihen: niedriger springt man normal hinauf (Sprung 3,2 Reihen) -> kein Wandsprung nötig
// Einzelwand (Abstoßen in die Gegenrichtung): Scheitel 5 Reihen über dem Absprung, 5,6 Kästchen vor der Wand
const EINZELWAND_WEITE = {3: 8.1, 2: 8.8, 1: 9.6, 0: 9.9};   // weiteste Landung (Kästchen ab Wand) je Höhe über dem Absprung (Reihen)
const EINZELWAND_BEQUEM = 0.75;                  // bequem = bis 75 % dieser Weite
const WANDSPRUNG_SEGELN_WEITE = {3: 12.1, 0: 17.1};          // Schweinchen: Wandsprung + Schirm
// Wandsprung zum Haken (Fangfenster ≥ 0,5 s): 3–8 Kästchen vor der Wand, 6–8 Reihen über dem Absprung
const WANDSPRUNG_HAKEN_ABSTAND_MIN = 3, WANDSPRUNG_HAKEN_ABSTAND_MAX = 8, WANDSPRUNG_HAKEN_HOEHE_MIN = 6, WANDSPRUNG_HAKEN_HOEHE_MAX = 8;
const KOMBI_ABSTAND = 8;                         // Spalten: so nah müssen zwei Fähigkeiten liegen, damit es eine Kombi-Stelle ist

const HOOK_MAX_RANGE = 260; // Standard, falls ein Haken keinen eigenen Radius hat
function hookRange(h){ return (h && h.radius > 0) ? h.radius : HOOK_MAX_RANGE; }
const ROPE_ADJUST_SPEED = 4.2;   // Seil geben (runterlassen)
const ROPE_PULL_SPEED = 2.4;     // ranziehen – langsamer, damit es kontrolliert wirkt
const HOOK_MIN_LEN = 46;
const HOOK_RELEASE_BOOST = -4.5;
// Schwung holen am Seil (wie beim Schaukeln): die Laufen-Taste schiebt nur, wenn man in die Richtung drückt,
// in die die Figur gerade schwingt (oder sie fast stillhängt). Vorher: immer 0,35 -> Taste halten drückte die
// Figur sofort weit zur Seite (0,5 s halten = 45°, jetzt ~26°). Größer = mehr Schwung pro Druck.
const SWING_PUSH = 0.2;
// Loslassen vom Seil (Springen oder G): Schwung bleibt erhalten ("Abflug"), bis man landet oder eine Wand berührt.
// Vorher wurde er sofort auf Laufgeschwindigkeit (7,2) gekappt und ohne Taste stark gebremst -> "bleibt auf der Stelle".
const ROPE_FLING_MAX = 15;      // so schnell darf man nach dem Loslassen höchstens fliegen (Laufen: 7,2)
const ROPE_FLING_DRAG = 0.993;  // Luftbremse ohne Taste im Abflug (normal in der Luft: 0,94)
// Kein künstlicher Schub beim Loslassen (Nutzerwunsch): Abfluggeschwindigkeit = Schwunggeschwindigkeit.

const GLIDE_RAMP_MS = 2600;
const GLIDE_START_GRAV = 0.10;
const GLIDE_MAX_FALL_START = 2.0;
const GLIDE_MAX_FALL_END = 8.5;

// ---------- Wasser und Schwimmen (Ausbau 5, elemente/wasser.js) ----------
// Alle Werte pro Physik-Schritt (60 Schritte = 1 Spielsekunde). Unter Wasser: kein Haken, kein Schirm.
const SWIM_ACCEL = 0.42;        // Schwimmen links/rechts/hoch/runter: Beschleunigung pro Schritt
const SWIM_MAX_SPEED = 3.6;     // höchstes Schwimmtempo (Laufen: 4,4)
const SWIM_DRAG = 0.9;          // Wasser-Widerstand (Tempo wird pro Schritt mit diesem Wert malgenommen)
const SWIM_AUFTRIEB = 0.07;     // ohne Taste treibt man langsam nach oben
const SWIM_KICK = 5.2;          // Schwimmstoß (Springen-Taste unter Wasser) nach oben
const SWIM_JUMP_OUT = -11.4;    // Springen an der Oberfläche: aus dem Wasser heraus (reicht auf einen Rand ~2 Kästchen höher)
const SWIM_RAUS_SCHRITTE = 6;   // so viele Schritte nach dem Aus-dem-Wasser-Springen bremst das Wasser nicht (sonst verpufft der Sprung)
const SWIM_SURFACE_GRAV = 0.25; // Kopf über Wasser: man sinkt sanft zurück, bis der Kopf gerade herausschaut
const SWIM_OBEN_ZONE = 16;      // px: so knapp unter der Oberfläche zieht es den Kopf kräftig nach oben (ruhiges Treiben)
// Luft je Figur: 12 Spielsekunden unter Wasser, Warnung (Blinken + Ticken) in den letzten 3 s, Luft leer = Tod
// (zurück zum Checkpoint). An der Oberfläche (Kopf über Wasser) ist die Luft in 1 s wieder voll.
const LUFT_MAX = 720;           // Schritte (12 s)
const LUFT_WARN = 180;          // Schritte (3 s) Vorwarnzeit
const LUFT_AUFFUELLEN = 12;     // Schritte Luft pro Schritt an der Oberfläche (leer -> voll in 1 s)
// Gemeinsame Luftblase: beide höchstens 2 Kästchen auseinander (Mitte zu Mitte) + jeder drückt seine Fähigkeitstaste
// (innerhalb von BLASE_RUF Schritten). Die Blase hält, bis sie weiter als BLASE_HALTEN auseinander schwimmen.
const BLASE_ABSTAND = 80;       // px: so nah müssen beide sein, damit die Blase entsteht
const BLASE_HALTEN = 130;       // px: weiter auseinander -> Blase platzt
const BLASE_RADIUS = 46;        // px: kleinste Größe der Blase (wächst mit dem Abstand der beiden)
const BLASE_RUF = 45;           // Schritte (0,75 s): so lange „wartet“ ein Tastendruck auf den des Partners
// Strömung (elemente/stroemung.js): Schub pro Schritt je Stärke-Stufe (schwach 1 / mittel 2 / stark 3). Mit dem
// Wasser-Widerstand ergibt das etwa: schwach -> man schwimmt gut gegenan, mittel -> nur knapp, stark -> gar nicht.
const STROEMUNG_KRAFT = 0.15;
const STROEMUNG_EXTRA = 4;      // so viel schneller als SWIM_MAX_SPEED darf eine Strömung jemanden tragen
const WASSER_PEGEL_TEMPO = 1.0; // px pro Schritt: so schnell steigt/sinkt das Wasser per Hebel/Schleuse (1 Kästchen in 0,7 s)
// Gedämpfter Ton unter Wasser (Tiefpass in Hz): ein Kopf unter Wasser etwas dumpfer, beide ganz dumpf
const WASSER_TON_EINER = 2600;
const WASSER_TON_BEIDE = 900;

// ---------- Fallen (Ausbau 7, Welt Ruinen; elemente/falle.js) – Schritte = Physik-Schritte (60 = 1 Spielsekunde) ----------
const FALLE_WARN = 45;          // so lange vorher glüht der Pfeil-Schlitz bzw. raucht die Flammen-Düse
const PFEIL_TEMPO = 8;          // px pro Schritt
const PFEIL_REICHWEITE = 1400;  // px, dann fällt der Pfeil weg (falls er nirgends stecken bleibt)
const PFEIL_STECKT = 30;        // so lange bleibt ein Pfeil nach dem Einschlag sichtbar
const FLAMME_LAENGE = 3;        // Kästchen weit speit die Flamme (Stein stoppt sie früher)
const FLAMME_BREITE = 26;       // px
const FLAMME_ANTEIL = 0.4;      // Anteil des Takts, in dem die Flamme brennt
// Pfeil-Aussehen (Ruinen-Überarbeitung; nur Anzeige – die Trefferfläche bleibt PFEIL_TREFFER × PFEIL_TREFFER um die Spitze)
const PFEIL_TREFFER = 10;       // px Kantenlänge der tödlichen Fläche um die Pfeilspitze (unverändert seit Ausbau 7)
const PFEIL_BILD_LAENGE = 52;   // px gezeichnete Länge (Spitze bis Federn), vorher 35
const PFEIL_BILD_DICKE = 5;     // px Schaft (vorher 3), dazu 2 px dunkler Umriss
const PFEIL_SCHWEIF = 46;       // px Bewegungsspur hinter einem fliegenden Pfeil
const PFEIL_LICHT = 95;         // px Lichtkreis um einen fliegenden Pfeil in dunklen Leveln (nachts lesbar; Design-Politur 2: vorher 70)
// Rollender Fels (elemente/fels.js)
const FELS_RADIUS = 50;         // px (Durchmesser 2,5 Kästchen)
const FELS_BESCHL = 0.08;       // so schnell kommt er auf sein Tempo (Anteil pro Schritt)
const FELS_STUFE = 12;          // so hohe Stufen nimmt er mit, höhere Kanten/Wände lassen ihn zerschellen
const FELS_WARN = 30;           // Ruinen-Überarbeitung: so viele Schritte (½ s) wackelt er vor dem Losrollen (fairer Start)
const FELS_ANKUENDIGUNG = 1.2;  // rollt er außerhalb des Bildes auf einen zu: Rumpeln/Staub am Bildrand ab diesem Abstand (× Bildbreite)
const FELS_PRALL = 0.25;        // Landet er aus großer Höhe (vy > 8), hüpft er mit diesem Anteil kurz zurück
const FELS_BROECKEL_BREMSE = 0.6;   // Bricht er durch eine Bröckel-Wand, behält er so viel Tempo
// Kamera-Wackeln (09-kamera.js): Stärke in px, klingt pro Schritt ab
const KAMERA_WACKELN_ABKLINGEN = 0.86;
// Licht (elemente/licht.js)
const LICHT_REICHWEITE = 80;    // so viele Kästchen läuft ein Lichtstrahl höchstens
const SPIEGEL_DREH_SCHRITTE = 18; // schaltbarer Spiegel: so lange (Physik-Schritte ≈ 0,3 s) dauert eine Drehung per Platte/Hebel
// Eis (elemente/eis.js)
const EIS_GRIFF = 0.16;         // Anteil der normalen Beschleunigung auf Eis (langsam anlaufen, langsam umdrehen)
const EIS_REIBUNG = 0.975;      // Abbremsen ohne Taste auf Eis pro Schritt (Boden: FRICTION_GROUND) – langer Rutschweg
// Förderband (elemente/foerderband.js) – Tempo kommt aus dem Level (langsam 1,6 / schnell 2,8 / reißend 8 px pro Schritt)
const BAND_NAH = 10;            // px: so knapp über dem Band nimmt es eine Figur auch in der Luft mit (Mini-Hüpfer im Tunnel)
// Leuchtkristall und Dunkelzone (elemente/leuchtkristall.js)
const LEUCHT_DAUER = 480;       // so viele Schritte (8 Spielsekunden) leuchtet ein angeschlagener Kristall
const LEUCHT_WARN = 120;        // in den letzten 2 Sekunden flackert er (Warnung)
const LEUCHT_RADIUS = 320;      // px Lichtkreis eines leuchtenden Kristalls
const LEUCHT_REICHWEITE = 70;   // so nah (px) muss eine Figur sein, um ihn anzuschlagen
const DUNKEL_STAERKE = 0.93;    // so dunkel ist eine Dunkelzone (0 … 1)
const DUNKEL_FIGUR = 95;        // px Lichtkreis um eine Figur in der Dunkelzone (sonst 230)
// Vulkan (Ausbau 7): steigende Lava (elemente/lava.js) und Stachelpresse (elemente/presse.js)
const LAVA_TEMPO = {langsam: 0.35, mittel: 0.6, schnell: 1.0};   // px pro Schritt, so schnell steigt/sinkt die Lava
const LAVA_GNADE = 6;           // so tief (px) muss eine Figur in der Lava stecken, bis sie verbrennt
const PRESSE_FALL = 14;         // px pro Schritt beim Herunterkrachen
const PRESSE_LIEGEN = 10;       // so viele Schritte bleibt die Presse unten liegen
const PRESSE_WARN = 30;         // so viele Schritte vor dem Fall zittert die Kette (Vorwarnung)

// ---------- Endgegner (Ausbau 6, elemente/boss.js) – Schritte = Physik-Schritte (60 = 1 Spielsekunde) ----------
const BOSS_AUFTRITT = 90;        // so lange steht der Boss nach Phasenstart/Tod still (Zeit zum Orientieren)
const BOSS_WECHSEL = 70;         // Sprung zum Platz der nächsten Phase
const BOSS_KOKOS = 3;            // Kokosnüsse pro Wurf
const BOSS_KOKOS_REGEN = 6;      // … beim Kokos-Regen
const BOSS_KOKOS_WARNUNG = 50;   // so lange warnt Schatten + Pfeil, bevor eine Kokosnuss fällt
const BOSS_WELLE_TEMPO = 5;      // Druckwelle am Boden (px pro Schritt) – drüberspringen
const BOSS_WELLE_HOEHE = 22;     // so hoch muss man über der Welle sein
const BOSS_ABPRALL = -10;        // Sprung auf den Kopf: so hoch prallt man ab
const BOSS_UNVERWUNDBAR = 70;    // nach einem Treffer
// ---------- Menü-Klänge (Design-Politur): Länge in ms; Cursor-Schritte höchstens alle MENU_TICK_ABSTAND ms ----------
const MENU_TON_MS = {tick: 40, ok: 65, start: 110};
const MENU_TICK_ABSTAND = 70;

// ---------- Computer-Partner (js/30-partner.js) – nur im Testmodus aus dem Editor; Schritte = Physik-Schritte ----------
const PARTNER_IM_HAUPTSPIEL = false;   // später: auch im Hauptspiel als Einzelspieler wählbar (Schalter, bewusst noch aus)
const PARTNER_REAKTION = [9, 15];      // Schritte (≈ 150–250 ms): so lange braucht er, bis er auf etwas Neues reagiert
const PARTNER_ABSTAND = 90;            // px: gemütlicher Abstand hinter mir (in Laufrichtung)
const PARTNER_ABSTAND_LOCKER = 40;     // px: innerhalb dieser Spanne um den Wunschplatz steht er einfach
const PARTNER_AUFHOLEN = 220;            // px: weiter weg -> zügig aufholen (normales Lauftempo), sonst gemütlich
const PARTNER_GEMUETLICH = 0.88;           // Anteil der Schritte mit gedrückter Lauftaste beim gemütlichen Folgen (kein Sprint)
const PARTNER_VORAUS = 64;             // Schritte, die er beim Springen vorausrechnet (Landeplatz sicher?)
const PARTNER_FEST = 540;              // Schritte (10 s) ohne Fortschritt -> „hänge fest“, wartet auf mich
const PARTNER_AUFGABE_ZEIT = 1800;     // Schritte (30 s) Standard-Zeitlimit einer Aufgabe
const PARTNER_AUTO_WEITE = 20 * 40;    // px: Auto-Aufgabe nur, wenn Hebel/Platte und Tür höchstens so weit auseinander (Bild-Regel)
const PARTNER_BUDGET = 1600;           // höchstens so viele vorausgerechnete Schritte je Spielschritt (≈ 4 ms, bleibt flüssig)
const PARTNER_BUDGET_GESAMT = 24000;   // … und je Überlegung insgesamt (verteilt auf mehrere Spielschritte: er „überlegt“ kurz)
const PARTNER_WEG_KNOTEN = 140;         // Wegsuche (Umwege, Kamine): höchstens so viele Standplätze ausprobieren …
const PARTNER_WEG_BUDGET = 120000;      // … und so viele Vorausschritte (≈ 1–2 s „überlegen“, verteilt auf viele Spielschritte)
const PARTNER_WEG_PAUSE = 300;          // Schritte: so lange keine neue Wegsuche zum selben Ziel, wenn keine gefunden wurde
