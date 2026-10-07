// 09-kamera.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// Abstandsgrenze: die vordere Figur steht bei 75 % der Bildbreite, die hintere darf höchstens einen HALBEN
// Bildschirm links außerhalb des Bildes sein -> max. Abstand = 0,75 + 0,5 = 1,25 Bildschirmbreiten (1600 px = 40 K)
const MAX_SEPARATION = Math.round(W * 1.25);
const CAM_LEFT = 300, CAM_RIGHT = 70;
// Zoom (Nutzerwunsch): Spielwelt 15 % kleiner (erst 10 %, dann „5 % weniger“, dann „noch mal 10 % raus“) -> man sieht mehr; Bild bleibt 16:9, Boden unten bündig,
// oben wird ein Streifen Himmel/Hintergrund sichtbar.
// Passen beide nicht ins Bild, folgt die Kamera der vorderen Figur; die hintere erscheint als Pfeil am Rand.
const FRONT_MAX = 0.75;   // vordere Figur steht höchstens bei 75 % der Bildbreite -> immer Blick nach vorn
const zoom = 0.85;
// so viel Welt (px) ist über Reihe 0 sichtbar (Himmels-Streifen): dort darf man hinspringen; Wände/Türen, die bis
// ganz oben reichen, werden beim Laden bis zum Bildrand verlängert (extendToSky in 01-level.js)
const SKY_ROOM = H / zoom - H;
const VW = W / zoom;   // sichtbare Weltbreite   // (CAM_LEFT war 150 -> zu eng)   // Kamera: Abstand hintere Figur zum linken / vordere zum rechten Rand
// Ruhige Kamera (gegen Wackeln bei zwei Spielern): Totzone für die hintere Figur. Solange sie zwischen
// CAM_BACK_MIN und CAM_BACK_PUSH px vom linken Rand steht, bleibt das Bild stehen (Zappeln, Springen,
// Schaukeln am Seil bewegen nichts). Erst darüber schiebt sie das Bild nach vorn, darunter zieht sie es zurück.
const CAM_BACK_MIN = 180, CAM_BACK_PUSH = 420;
const CAM_FOLLOW = 0.08;   // wie schnell die Kamera ihrem Ziel folgt (pro Rechenschritt; vorher 0,12)
// Kamera-Ziel: so wenig wie möglich bewegen, aber beide Figuren gut im Bild halten
function cameraTarget(cur){
  const back = Math.min(p1.x, p2.x), front = Math.max(p1.x, p2.x);
  const lo = Math.max(back - CAM_BACK_PUSH, front - FRONT_MAX * VW), hi = back - CAM_BACK_MIN;
  const t = lo > hi ? lo : Math.max(lo, Math.min(hi, cur));   // zu weit auseinander: der vorderen folgen
  return Math.max(0, Math.min(LEVEL_W - VW, t));
}
// Weltkoordinaten auf den Bildschirm (für Dinge, die außerhalb von draw() in Welt-Koordinaten zeichnen)
function applyWorldZoom(){ if(zoom !== 1){ ctx.translate(0, H*(1-zoom)); ctx.scale(zoom, zoom); } }
function keepTogether(){
  const sep = p2.x - p1.x;
  if(Math.abs(sep) <= MAX_SEPARATION) return;
  const right = sep > 0 ? p2 : p1, left = sep > 0 ? p1 : p2;
  // wer gerade nach außen läuft, wird gebremst
  if(right.vx > 0 || left.vx >= 0){ right.x = left.x + MAX_SEPARATION; if(right.vx > 0) right.vx = 0; }
  else { left.x = right.x - MAX_SEPARATION; if(left.vx < 0) left.vx = 0; }
}
