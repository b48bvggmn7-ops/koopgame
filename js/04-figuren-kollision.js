// 04-figuren-kollision.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

function makePlayer(opts){
  return Object.assign({
    x:0,y:0,vx:0,vy:0,w:28.5,h:32.3,
    grounded:false, onWall:0, lastWallTouch:-9999, wjInputLock:0, wallEntrySpeed:0,
    facing:1, glideTimer:0, hookAttached:false, anchor:null, ropeLen:0, ropeMax:0,
    spawn:{x:0,y:0}, animPhase:0, blink:3000+Math.random()*2000, rollAngle:0,
  }, opts);
}

let p1, p2, won=false, winSteps=0, winT0=0;

function resetLevel(){
  p1 = makePlayer({x:levelStartM.x,y:levelStartM.y, male:true,
    keys:keysFor(true), spawn:{x:levelStartM.x,y:levelStartM.y}});
  p2 = makePlayer({x:levelStartF.x,y:levelStartF.y, male:false,
    keys:keysFor(false), spawn:{x:levelStartF.x,y:levelStartF.y}, umbrella:0});
  for(const s of solids){ if(s.type==='crumble'){ s.triggered=false; s.gone=false; s.timer=0; s.fragments=null; s.breakElapsed=0; } }
  for(const s of solids){ if(s.type==='door'){ s.open=false; s.gone=false; s.closing=false; } }
  linkOn = {};   // alle Hebel wieder aus
  for(const s of solids){ if(s.type==='moveplat'){ s.x=s.startX; s.y=s.startY; s.moveDir=1; s.tripActive=false; } }
  for(const sw of switchDefs) sw.wasPressed = false;
  if(typeof syncSwitchCarriers === 'function') syncSwitchCarriers();   // mitfahrende Hebel zurück an den Start
  for(const c of coins){ c.taken = false; c.pop = 0; c.takenAt = 0; }
  coinFx = []; // Neustart: Münzen wieder da (beim Sterben bleiben sie gesammelt)
  for(const h of hooks){ if(h.moving){ h.x=h.startX; h.y=h.startY; h.moveDir=1; h.tripActive=false; } }
  activeCp = -1; deathState = null;
  for(const cp of checkpointDefs){ cp.reachedM = false; cp.reachedF = false; cp.raiseT = 0; }
  for(const E of ELEMENTE) if(E.spiel && E.spiel.zuruecksetzen) E.spiel.zuruecksetzen();   // z. B. Wechselboden (elemente/)
  nudgeFree(p1); nudgeFree(p2);
  won = false;
  if(typeof cosResetState === 'function') cosResetState();   // Cosmetics-Spuren/Begleiter neu (27)
  document.getElementById('toast').classList.remove('show');
}

// Steht eine Figur an (x,y) (Füße) frei, ohne in Boden/Wand/Tür zu stecken?
function spotFree(x, y, pl){
  const box = {x:x-pl.w/2, y:y-pl.h, w:pl.w, h:pl.h};
  for(const s of solids){ if(!s.gone && rectsOverlap(box, s)) return false; }
  return true;
}
function safeSpawnOn(g, pl){
  for(let x = g.x + pl.w/2 + 4; x <= g.x + g.w - pl.w/2 - 2; x += 4){
    if(spotFree(x, g.y, pl)) return {x, y:g.y};
  }
  return null;
}
// Startpunkt steckt in etwas? Dann nach rechts, notfalls links und nach oben die nächste freie Stelle suchen
function nudgeFree(pl){
  if(spotFree(pl.x, pl.y, pl)) return;
  for(let d = 4; d <= 400; d += 4){
    for(const [dx,dy] of [[d,0],[-d,0],[0,-d]]){
      if(spotFree(pl.x+dx, pl.y+dy, pl)){ pl.x += dx; pl.y += dy; pl.spawn = {x:pl.x, y:pl.y}; return; }
    }
  }
}

function rectsOverlap(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}

// Überlappungen unter COLLIDE_EPS sind Rundungsfehler (z. B. Kopf bei 479,99999999999994 statt 480)
// und werden ignoriert. Früher schob die seitliche Prüfung die Figur deswegen ans Ende eines Decken-
// bzw. Bodenstreifens ("Teleport" beim Springen unter einer Decke).
const COLLIDE_EPS = 0.01;
function collideAxis(player, axis){
  for(const s of solids){
    if(s.gone) continue;
    const box = {x:player.x-player.w/2, y:player.y-player.h, w:player.w, h:player.h};
    const ox = Math.min(box.x+box.w, s.x+s.w) - Math.max(box.x, s.x);
    const oy = Math.min(box.y+box.h, s.y+s.h) - Math.max(box.y, s.y);
    if(ox <= COLLIDE_EPS || oy <= COLLIDE_EPS) continue;
    if(axis === 'x'){
      let nx = player.x;
      if(player.vx > 0) nx = s.x - player.w/2;
      else if(player.vx < 0) nx = s.x + s.w + player.w/2;
      // Sicherheitsnetz: steckt die Figur nur knapp oben/unten drin, aber seitlich müsste sie weiter als
      // ihre eigene Breite versetzt werden -> stattdessen senkrecht herausschieben (nie quer teleportieren)
      if(Math.abs(nx - player.x) > player.w && oy < 12){
        if(box.y + box.h/2 < s.y + s.h/2) player.y = s.y;               // steckt mit den Füßen im Boden
        else player.y = s.y + s.h + player.h;                            // steckt mit dem Kopf in der Decke
        continue;
      }
      player.x = nx;
      player.vx = 0;
    } else {
      if(player.vy > 0){
        player.y = s.y; player.grounded = true; player.standingOn = s;
        if(s.type==='crumble' && !s.triggered){ s.triggered = true; s.timer = 0; }
      }
      else if(player.vy < 0){ player.y = s.y + s.h + player.h; }
      player.vy = 0;
    }
  }
}
