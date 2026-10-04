// 25-level-intro.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Ankunft der Figuren beim Levelstart (nach dem Blätter-Vorhang aus dem Startmenü) ----------
// Das Schweinchen schwebt mit offenem Schirm von oben herunter, der Affe schwingt an einer Liane herein
// (von links, sonst von rechts; ist dort kein Platz, lässt er sich an der Liane senkrecht herab).
// Läuft im festen Takt in stepSim (14-spielschleife.js); solange ruhen Eingaben, Stacheln und Abstands-Regel.
// Nur beim Start aus dem Startmenü – nicht nach Tod, Neustart (R) oder im Test aus dem Editor.
const INTRO_FRAMES = 130;       // gesamte Ankunft (~2,2 s)
const INTRO_PIG_LAND = 108;     // Schweinchen landet
const INTRO_MONKEY_FROM = 18, INTRO_MONKEY_LAND = 96;   // Affe: Schwung von … bis
const INTRO_VINE_LEN = 200;     // Länge der Liane (px)
const INTRO_SWING = 1.05;       // Startwinkel des Schwungs (Bogenmaß, ~60°)
let levelIntro = null;

function introActive(){ return !!levelIntro; }

function startLevelIntro(){
  if(typeof editorTestMode !== 'undefined' && editorTestMode) return;
  const m = {x: p1.x, y: p1.y}, f = {x: p2.x, y: p2.y};
  const R = INTRO_VINE_LEN;
  const A = {x: m.x, y: m.y - p1.h*0.6 - R};            // Aufhängepunkt der Liane genau über dem Startplatz
  const at = th => ({x: A.x + R*Math.sin(th), y: A.y + R*Math.cos(th) + p1.h*0.6});
  let side = 0;
  for(const s of [-1, 1]){                               // Schwung-Bogen frei von Boden/Wänden?
    let ok = true;
    for(let k = 1; k <= 14; k++){
      const p = at(s*INTRO_SWING*k/14);
      if(p.x < 24 || p.x > LEVEL_W - 24 || !spotFree(p.x, p.y, p1)){ ok = false; break; }
    }
    if(ok){ side = s; break; }
  }
  let top = f.y;                                         // Schweinchen: so hoch wie frei (höchstens 7 Reihen)
  for(let k = 1; k <= 56; k++){ const y = f.y - k*5; if(y < 60 || !spotFree(f.x, y, p2)) break; top = y; }
  levelIntro = {t: 0, A, R, side, m, f, top, at};
  introApply();
}

function introApply(){
  const I = levelIntro, t = I.t;
  // Schweinchen schwebt, leicht pendelnd, langsamer werdend herunter
  const u = Math.min(1, t/INTRO_PIG_LAND), e = 1 - (1 - u)*(1 - u);
  p2.x = I.f.x + Math.sin(t*0.09)*7*(1 - u);
  p2.y = I.top + (I.f.y - I.top)*e;
  p2.vx = 0; p2.vy = 0; p2.grounded = false;
  p2.umbrella = u < 1 ? 1 : p2.umbrella;
  // Affe an der Liane
  const w = Math.max(0, Math.min(1, (t - INTRO_MONKEY_FROM)/(INTRO_MONKEY_LAND - INTRO_MONKEY_FROM)));
  let pos;
  if(I.side){ pos = I.at(I.side*INTRO_SWING*Math.cos(w*Math.PI/2)); }        // Schwung: oben langsam, unten schnell
  else { const d = 1 - (1 - w)*(1 - w); pos = {x: I.m.x, y: I.A.y + 40 + p1.h*0.6 + (I.R - 40)*d}; }   // abseilen
  p1.x = pos.x; p1.y = pos.y; p1.vx = 0; p1.vy = 0; p1.grounded = false;
  p1.hookAttached = w < 1; p1.anchor = I.A; p1.introVine = w < 1; p1.ropeStretch = 0;
  if(I.side && w < 1) p1.facing = -I.side;
}

// pro Rechenschritt aus stepSim; true = Ankunft läuft noch (Figuren nicht selbst steuern)
function introStep(){
  if(!levelIntro) return false;
  levelIntro.t++;
  introApply();
  if(levelIntro.t >= INTRO_FRAMES){
    // genau auf den Startplätzen absetzen; kleines Fallen -> Landegeräusch + Staub (sfxObserve)
    p1.x = levelIntro.m.x; p1.y = levelIntro.m.y - 1; p1.vy = 4; p1.hookAttached = false; p1.introVine = false;
    p2.x = levelIntro.f.x; p2.y = levelIntro.f.y - 1; p2.vy = 4;
    levelIntro = null;
    menuClearPressed();   // während der Ankunft gedrückte Tasten nicht nachträglich auslösen
    return false;
  }
  return true;
}
