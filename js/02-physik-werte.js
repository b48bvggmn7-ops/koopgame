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
const ROPE_FLING_BOOST = 1.5;   // Extra-Schub in Schwungrichtung beim Loslassen
const ROPE_FLING_MAX = 15;      // so schnell darf man nach dem Loslassen höchstens fliegen (Laufen: 7,2)
const ROPE_FLING_DRAG = 0.993;  // Luftbremse ohne Taste im Abflug (normal in der Luft: 0,94)

const GLIDE_RAMP_MS = 2600;
const GLIDE_START_GRAV = 0.10;
const GLIDE_MAX_FALL_START = 2.0;
const GLIDE_MAX_FALL_END = 8.5;
