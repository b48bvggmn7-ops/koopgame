// 25-level-intro.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Ankunft der Figuren beim Levelstart (nach dem Blätter-Vorhang aus dem Startmenü) ----------
// Das Schweinchen schwebt mit offenem Schirm von oben herunter. Der Affe springt aus dem Blätterdach herunter,
// macht dabei einen doppelten Salto und landet mit einem kleinen Hüpfer (früher: Liane – Nutzer fand sie komisch).
// Läuft im festen Takt in stepSim (14-spielschleife.js); solange ruhen Eingaben, Stacheln und Abstands-Regel.
// Nur beim Start aus dem Startmenü – nicht nach Tod, Neustart (R) oder im Test aus dem Editor.
const INTRO_FRAMES = 130;       // gesamte Ankunft (~2,2 s)
const INTRO_PIG_LAND = 108;     // Schweinchen landet
const INTRO_MONKEY_FROM = 12, INTRO_MONKEY_LAND = 60;   // Affe: Sprung von oben … Landung
const INTRO_MONKEY_HOP = 16;    // kleiner Hüpfer nach der Landung (Bilder)
const INTRO_FLIPS = 2;          // Saltos im Fallen
let levelIntro = null;

function introActive(){ return !!levelIntro; }

// höchste freie Stelle über dem Startplatz (höchstens maxRows Reihen)
function introTop(pl, x, y, maxRows){
  let top = y;
  for(let k = 1; k <= maxRows*8; k++){ const yy = y - k*5; if(yy < 50 || !spotFree(x, yy, pl)) break; top = yy; }
  return top;
}

function startLevelIntro(){
  if(typeof editorTestMode !== 'undefined' && editorTestMode) return;
  const m = {x: p1.x, y: p1.y}, f = {x: p2.x, y: p2.y};
  levelIntro = {t: 0, m, f, topM: introTop(p1, m.x, m.y, 9), topF: introTop(p2, f.x, f.y, 7)};
  introApply();
}

function introApply(){
  const I = levelIntro, t = I.t;
  // Schweinchen schwebt, leicht pendelnd, langsamer werdend herunter
  const u = Math.min(1, t/INTRO_PIG_LAND), e = 1 - (1 - u)*(1 - u);
  p2.x = I.f.x + Math.sin(t*0.09)*7*(1 - u);
  p2.y = I.topF + (I.f.y - I.topF)*e;
  p2.vx = 0; p2.vy = 0; p2.grounded = false;
  p2.umbrella = u < 1 ? 1 : p2.umbrella;
  // Affe: fällt (immer schneller) mit Salto, landet, hüpft kurz
  const w = Math.max(0, Math.min(1, (t - INTRO_MONKEY_FROM)/(INTRO_MONKEY_LAND - INTRO_MONKEY_FROM)));
  p1.x = I.m.x; p1.vx = 0; p1.vy = 0; p1.grounded = false; p1.hookAttached = false;
  if(t < INTRO_MONKEY_LAND){
    p1.y = I.topM + (I.m.y - I.topM)*w*w;
    p1.rollAngle = w*w*INTRO_FLIPS*Math.PI*2;
  } else {
    const v = Math.min(1, (t - INTRO_MONKEY_LAND)/INTRO_MONKEY_HOP);
    p1.y = I.m.y - Math.sin(Math.PI*v)*26;
    p1.rollAngle = 0;
  }
  if(t === INTRO_MONKEY_LAND && typeof fxLand === 'function'){ fxLand(p1, 10); if(typeof SFX !== 'undefined') SFX.land(p1, 10); }
}

// pro Rechenschritt aus stepSim; true = Ankunft läuft noch (Figuren nicht selbst steuern)
function introStep(){
  if(!levelIntro) return false;
  levelIntro.t++;
  introApply();
  if(levelIntro.t >= INTRO_FRAMES){
    // genau auf den Startplätzen absetzen; kleines Fallen -> Landegeräusch + Staub (sfxObserve)
    p1.x = levelIntro.m.x; p1.y = levelIntro.m.y - 1; p1.vy = 1; p1.rollAngle = 0;
    p2.x = levelIntro.f.x; p2.y = levelIntro.f.y - 1; p2.vy = 4;
    levelIntro = null;
    menuClearPressed();   // während der Ankunft gedrückte Tasten nicht nachträglich auslösen
    return false;
  }
  return true;
}
