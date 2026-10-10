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
const WALL_JUMP_VX_MIN = 6.96, WALL_JUMP_VX_MAX = 12.8;
const MIN_WALLJUMP_SPEED = 1.3; // unterhalb davon: kein Wandsprung mehr (kein "aus dem Stand")
const WALL_JUMP_VY_MIN = -14.4, WALL_JUMP_VY_MAX = -16.06;
const WALL_JUMP_BUFFER = 180; // Zeitfenster nach letztem Wandkontakt, Tastatur (Verlauf: 160 -> 200 -> 130 -> 170 -> 150 -> 180)
const WALL_JUMP_BUFFER_PAD = 250; // dasselbe, wenn der Sprung vom Controller kommt
const WALL_SLIDE_MAX_FALL = 2.4;
const MAX_FALL = 15;

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
