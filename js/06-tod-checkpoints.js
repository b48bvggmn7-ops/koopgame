// 06-tod-checkpoints.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Tod & gemeinsamer Neustart am Checkpoint ----------
const DEATH_PHRASES = ['Idiot!', 'Einmal mit Profis…', 'Arschloch!', 'Echt jetzt?!', 'Boah, ey!',
  'Ernsthaft?!', 'Nicht dein Ernst…', 'Na toll.', 'Hallo?!', 'Du Pappnase!', 'Ich fass es nicht…', 'Schon wieder?!'];
let lastPhrase = '';
let deathsWithoutComplaint = 0;
function die(player){
  if(deathState || won) return;
  const now = performance.now();
  let phrase; do { phrase = DEATH_PHRASES[Math.floor(Math.random()*DEATH_PHRASES.length)]; } while(phrase === lastPhrase);
  lastPhrase = phrase;
  // nicht jedes Mal meckern: etwa jedes dritte Mal, aber spätestens nach 3 stillen Toden wieder
  deathsWithoutComplaint = (deathsWithoutComplaint||0);
  const complain = deathsWithoutComplaint >= 3 || Math.random() < 0.33;
  deathsWithoutComplaint = complain ? 0 : deathsWithoutComplaint + 1;
  deathState = {victim: player, other: player===p1 ? p2 : p1, t0: now, canContinueAt: now + 600,
                phrase: complain ? phrase : null, go:false};
  player.hookAttached = false;
  // Puff-Wölkchen, wo die Figur verschwindet (beim Runterfallen am unteren Rand)
  const py = Math.min(player.y - player.h*0.5, LEVEL_H - 20);
  for(let i=0;i<9;i++){
    const a = i/9*Math.PI*2;
    coinFx.push({type:'poof', x:player.x, y:py, t0:now, vx:Math.cos(a)*1.6, vy:Math.sin(a)*1.6-0.6, size:9+Math.random()*7});
  }
  playTones([[330,0,0.12],[247,0.1,0.22]], 'triangle', 0.09);
}
function continueAfterDeath(){
  const cp = activeCp >= 0 ? checkpointDefs[activeCp] : null;
  const mPos = cp ? {x:cp.x-18, y:cp.y} : {x:levelStartM.x, y:levelStartM.y};
  const fPos = cp ? {x:cp.x+18, y:cp.y} : {x:levelStartF.x, y:levelStartF.y};
  p1 = makePlayer({x:mPos.x,y:mPos.y, male:true,
    keys:{left:'KeyA',right:'KeyD',jump:'Space',hook:'KeyG',pull:'KeyW',slack:'KeyS'}, spawn:{...mPos}});
  p2 = makePlayer({x:fPos.x,y:fPos.y, male:false,
    keys:{left:'ArrowLeft',right:'ArrowRight',jump:'Numpad0',glide:'Numpad1'}, spawn:{...fPos}, umbrella:0});
  // zerbröselter Boden und Türen kommen zurück, bewegte Teile an den Start
  for(const s of solids){ if(s.type==='crumble'){ s.triggered=false; s.gone=false; s.timer=0; s.fragments=null; s.breakElapsed=0; } }
  for(const s of solids){ if(s.type==='door'){ s.open=false; s.gone=false; s.openTimer=0; } }
  resetMovers();
  nudgeFree(p1); nudgeFree(p2);
  // die Taste zum Weitermachen soll nicht gleich springen/Haken schießen
  for(const k in KEYS) if(k.endsWith('_pressed')) KEYS[k] = false;
  deathState = null;
}
function requestContinue(){
  if(deathState && performance.now() >= deathState.canContinueAt) deathState.go = true;
}
window.addEventListener('keydown', e=>{ if(e.code!=='KeyF' && e.code!=='KeyR' && e.code!=='KeyC' && e.code!=='KeyX') requestContinue(); });

// ---------- Test-Hilfe: zu Checkpoints springen (auch ungeschafft) ----------
// Taste C = nächster Checkpoint, Taste X = vorheriger (bzw. Start). Beide Figuren landen dort,
// alle Fahnen bis dahin gelten als erreicht, die danach nicht.
let testJumpMsg = '', testJumpT = 0;
function testJump(step){
  if(!checkpointDefs.length){ testJumpMsg = 'Keine Checkpoints in diesem Level'; testJumpT = performance.now(); return; }
  const now = performance.now();
  const target = Math.max(-1, Math.min(checkpointDefs.length-1, activeCp + step));
  activeCp = target;
  checkpointDefs.forEach((cp, k)=>{
    const done = k <= target;
    cp.reachedM = done; cp.reachedF = done; cp.raiseT = done ? now - 2000 : 0;
  });
  won = false; document.getElementById('toast').classList.remove('show');
  continueAfterDeath();                       // setzt beide an den (Test-)Checkpoint, Bröckelboden/Türen/Teile zurück
  camPos = Math.max(0, Math.min(LEVEL_W-W, Math.min(p1.x,p2.x) - CAM_LEFT));   // Kamera direkt hin
  testJumpMsg = target < 0 ? 'Test: Start' : 'Test: Checkpoint ' + (target+1) + ' von ' + checkpointDefs.length;
  testJumpT = now;
}
window.addEventListener('keydown', e=>{
  if(e.repeat) return;
  if(e.code==='KeyC') testJump(+1);
  if(e.code==='KeyX') testJump(-1);
});
window.addEventListener('pointerdown', requestContinue);

// Checkpoint zählt erst, wenn BEIDE vorbei sind -> Fahne geht hoch
function updateCheckpoints(){
  const now = performance.now();
  for(let i = activeCp+1; i < checkpointDefs.length; i++){
    const cp = checkpointDefs[i];
    if(p1.x >= cp.x - 8) cp.reachedM = true;
    if(p2.x >= cp.x - 8) cp.reachedF = true;
    if(cp.reachedM && cp.reachedF){
      activeCp = i; cp.raiseT = now;
      for(let k=0;k<12;k++){
        const a = -Math.PI/2 + (k/11-0.5)*2.2;
        coinFx.push({type:'spark', x:cp.x+14, y:cp.y-66, t0:now, vx:Math.cos(a)*(2+Math.random()*2), vy:Math.sin(a)*(2+Math.random()*2),
                     size: 4+Math.random()*3, star: k%2===0});
      }
      playTones([[523,0,0.1],[659,0.09,0.1],[784,0.18,0.25]], 'square', 0.06);
    }
  }
}
function resetMovers(){
  for(const s of solids){ if(s.type==='moveplat'){ s.x=s.startX; s.y=s.startY; s.moveDir=1; s.tripActive=false; } }
  for(const h of hooks){ if(h.moving){ h.x=h.startX; h.y=h.startY; h.moveDir=1; h.tripActive=false; } }
  for(const sw of switchDefs) sw.wasPressed = false;
  syncSwitchCarriers();   // mitfahrende Hebel gleich mit zurück
  // wer noch an einem bewegten Haken hängt, lässt los (der Haken springt ja zurück)
  for(const pl of [p1,p2]) if(pl && pl.hookAttached && pl.anchor && pl.anchor.moving) pl.hookAttached = false;
}
