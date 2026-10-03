// 09-kamera.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// Abstandsgrenze: die vordere Figur steht bei 75 % der Bildbreite, die hintere darf höchstens einen HALBEN
// Bildschirm links außerhalb des Bildes sein -> max. Abstand = 0,75 + 0,5 = 1,25 Bildschirmbreiten (1600 px = 40 K)
const MAX_SEPARATION = Math.round(W * 1.25);
const CAM_LEFT = 300, CAM_RIGHT = 70;
// Kein Zoom (bewusst entfernt: Spielfeld bleibt immer 16:9 in gleicher Größe, passend für Vollbild).
// Passen beide nicht ins Bild, folgt die Kamera der vorderen Figur; die hintere erscheint als Pfeil am Rand.
const FRONT_MAX = 0.75;   // vordere Figur steht höchstens bei 75 % der Bildbreite -> immer Blick nach vorn
const zoom = 1;        // fest – Zoom-Code bleibt neutral
const VW = W;          // sichtbare Weltbreite   // (CAM_LEFT war 150 -> zu eng)   // Kamera: Abstand hintere Figur zum linken / vordere zum rechten Rand
function keepTogether(){
  const sep = p2.x - p1.x;
  if(Math.abs(sep) <= MAX_SEPARATION) return;
  const right = sep > 0 ? p2 : p1, left = sep > 0 ? p1 : p2;
  // wer gerade nach außen läuft, wird gebremst
  if(right.vx > 0 || left.vx >= 0){ right.x = left.x + MAX_SEPARATION; if(right.vx > 0) right.vx = 0; }
  else { left.x = right.x - MAX_SEPARATION; if(left.vx < 0) left.vx = 0; }
}
