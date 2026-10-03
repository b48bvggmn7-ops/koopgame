// 14-spielschleife.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Spielschleife mit festem Takt ----------
// Die Spielphysik rechnet IMMER mit genau 60 Schritten pro Sekunde – egal ob der Bildschirm
// 60, 120 oder 144 Bilder zeigt. Sonst wäre das Spiel auf schnellen Bildschirmen doppelt so schnell.
// Zwischen zwei Rechenschritten wird für die Anzeige weich überblendet (Interpolation).
const STEP = 1000/60;
let simAcc = 0, lastFrameTs = 0, frameDt = STEP;
function stepSim(ts){
  activateVisibleMovers();
  updatePlayer(p1, ts);
  updatePlayer(p2, ts);
  keepTogether();   // vordere Figur darf höchstens 1,25 Bildschirmbreiten vor der hinteren sein
  updateMovingHooks();
  updateCoins([p1, p2]);
  updateCheckpoints();
  updateCrumbles(16.6);
  updateDoorsAndSwitches(16.6, [p1, p2]);
  updateMovingPlatforms(16.6, [p1, p2]);
  updateSpikes(p1);
  updateSpikes(p2);
  if(!won && p1.atGoal && p2.atGoal && coinsCollected() >= coinsNeeded){
    won = true;
    document.getElementById('toast').classList.add('show');
  }
}
// alles, was sich bewegt: Position vor dem Rechenschritt merken
function movingThings(){
  const list = [p1, p2];
  for(const s of solids) if(s.type==='moveplat') list.push(s);
  for(const h of hooks) if(h.moving) list.push(h);
  return list;
}
function rememberPrev(){
  for(const o of movingThings()){ o._px = o.x; o._py = o.y; o._pr = o.rollAngle; }
}
// für die Anzeige kurz auf die überblendete Position setzen, danach zurück
function drawInterpolated(alpha){
  const list = movingThings(), saved = [];
  for(const o of list){
    saved.push([o, o.x, o.y, o.rollAngle]);
    if(o._px !== undefined){
      o.x = o._px + (o.x - o._px)*alpha;
      o.y = o._py + (o.y - o._py)*alpha;
      if(o.rollAngle !== undefined && o._pr !== undefined) o.rollAngle = o._pr + (o.rollAngle - o._pr)*alpha;
    }
  }
  draw();
  for(const [o,x,y,r] of saved){ o.x = x; o.y = y; if(r !== undefined) o.rollAngle = r; }
}
function loop(ts){
  const tStart = performance.now();
  if(!lastFrameTs) lastFrameTs = ts;
  frameDt = Math.min(250, Math.max(0, ts - lastFrameTs));   // nach Tab-Wechsel nicht aufholen
  lastFrameTs = ts;
  pollGamepads();
  if(deathState){
    if(deathState.go){ continueAfterDeath(); rememberPrev(); }
    simAcc = 0;
    const tAU = performance.now();
    drawInterpolated(1); updateHUD();
    perfFrame(ts, tStart, tAU, performance.now());
    requestAnimationFrame(loop);
    return;
  }
  simAcc += frameDt;
  let steps = 0;
  while(simAcc >= STEP && steps < 5){
    rememberPrev();
    stepSim(ts);
    simAcc -= STEP; steps++;
    if(deathState) { simAcc = 0; break; }
  }
  if(steps >= 5) simAcc = 0;
  const tAfterUpdate = performance.now();
  drawInterpolated(deathState ? 1 : simAcc / STEP);
  updateHUD();
  perfFrame(ts, tStart, tAfterUpdate, performance.now());
  requestAnimationFrame(loop);
}
