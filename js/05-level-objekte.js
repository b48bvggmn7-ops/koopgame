// 05-level-objekte.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

const CRUMBLE_TRIGGER_MS = 600;
const CRUMBLE_FRAGMENT_LIFE = 400;

function updateCrumbles(dt){
  for(const s of solids){
    if(s.type!=='crumble') continue;
    if(s.triggered && !s.gone){
      s.timer += dt;
      if(s.timer >= CRUMBLE_TRIGGER_MS){
        s.gone = true; // Kollision sofort weg, Spieler fällt durch
        s.breakElapsed = 0;
        const cols=3, rows=2;
        s.fragments = [];
        for(let iy=0; iy<rows; iy++){
          for(let ix=0; ix<cols; ix++){
            s.fragments.push({
              x: s.x + (ix+0.5)*(s.w/cols),
              y: s.y + (iy+0.5)*(s.h/rows),
              w: s.w/cols - 3, h: s.h/rows - 3,
              vx: (Math.random()-0.5)*3.5,
              vy: -3 - Math.random()*2.5,
              rot: 0, vrot: (Math.random()-0.5)*0.35,
            });
          }
        }
      }
    } else if(s.gone && s.fragments && s.breakElapsed < CRUMBLE_FRAGMENT_LIFE){
      s.breakElapsed += dt;
      for(const f of s.fragments){
        f.vy += 0.55;
        f.x += f.vx; f.y += f.vy; f.rot += f.vrot;
      }
      if(s.breakElapsed >= CRUMBLE_FRAGMENT_LIFE) s.fragments = null;
    }
  }
}

const DOOR_OPEN_MS = 5000;
// ---------- Schalter = kleiner Hebel, mit Taste betätigen ----------
// Spieler 1: Tastatur J / Controller Kreis · Spielerin 2: Tastatur Num 2 / Controller Kreis
const LEVER_RANGE_X = 60, LEVER_RANGE_Y = 60;
function useKeyPressed(player){
  const codes = player===p1 ? ['KeyJ','Pad1Use'] : ['Numpad2','Pad2Use'];
  let hit = false;
  for(const c of codes){ if(KEYS[c+'_pressed']){ hit = true; KEYS[c+'_pressed'] = false; } }
  return hit;
}
function leverNear(player, sw){
  return Math.abs(player.x - sw.x) < LEVER_RANGE_X && Math.abs((player.y - player.h*0.5) - sw.y) < LEVER_RANGE_Y;
}
function triggerSwitch(sw, player){
  const now = performance.now();
  for(const d of solids){
    if(d.type==='door' && d.link===sw.link){ d.open=true; d.gone=true; d.openTimer=0; }
  }
  // Bewegter Boden/Haken: Schalter startet die Bewegung, danach fährt sie dauerhaft hin und her
  // (bis jemand stirbt -> alles zurück an den Start, Schalter muss erneut betätigt werden)
  for(const m of solids){
    if(m.type==='moveplat' && m.switchCtl && m.switchLink===sw.link && !m.tripActive){ m.tripActive = true; m.moveDir = 1; }
  }
  for(const h of hooks){
    if(h.moving && h.switchCtl && h.switchLink===sw.link && !h.tripActive){ h.tripActive = true; h.moveDir = 1; }
  }
  player.leverAnim = {t0: now, dir: Math.sign(sw.x - player.x) || player.facing || 1};
  sw.pulledT = now;
  playTones([[180,0,0.05],[260,0.05,0.07]], 'square', 0.05);   // "klack"
}
function updateDoorsAndSwitches(dt, players){
  for(const player of players){
    if(!useKeyPressed(player)) continue;
    // nächstgelegenen Hebel in Reichweite betätigen
    let best = null, bd = Infinity;
    for(const sw of switchDefs){
      if(!leverNear(player, sw)) continue;
      const d = Math.abs(player.x - sw.x);
      if(d < bd){ bd = d; best = sw; }
    }
    if(best) triggerSwitch(best, player);
  }
  for(const d of solids){
    if(d.type==='door' && d.open){
      d.openTimer += dt;
      if(d.openTimer >= DOOR_OPEN_MS){ d.open=false; d.gone=false; }
    }
  }
}

const MOVE_PLAT_SPEED = 4.5; // Standard, falls im Level kein Tempo angegeben ist
function updateMovingPlatforms(dt, players){
  const carried = new Set(); // jeden Spieler pro Frame höchstens einmal mitnehmen (mehrteilige Stücke)
  for(const s of solids){
    if(s.type!=='moveplat') continue;
    if(!s.tripActive) continue; // wartet auf Schalter bzw. bis es ins Bild kommt
    const speed = s.speed || MOVE_PLAT_SPEED;
    const tx = s.moveDir===1 ? s.targetX : s.startX;
    const ty = s.moveDir===1 ? s.targetY : s.startY;
    const dx = tx-s.x, dy = ty-s.y;
    const dist = Math.hypot(dx,dy);
    let stepX=0, stepY=0;
    if(dist <= speed){
      stepX=dx; stepY=dy;
      s.moveDir*=-1; // immer weiter hin und her (auch nach Schalter-Start)
    }
    else { stepX = dx/dist*speed; stepY = dy/dist*speed; }
    const onTopList = players.map(player => player.grounded && Math.abs(player.y - s.y) < 2 &&
      player.x+player.w/2 > s.x && player.x-player.w/2 < s.x+s.w);
    s.x += stepX; s.y += stepY;
    players.forEach((player, i)=>{
    const onTop = onTopList[i];
    if(onTop && !carried.has(player)){ player.x += stepX; player.y += stepY; carried.add(player); }
    else if(!onTop){
      // Seitlich gegen den Spieler fahren: Spieler wegschieben statt einklemmen
      const box = {x:player.x-player.w/2, y:player.y-player.h, w:player.w, h:player.h};
      if(rectsOverlap(box, s)){
        if(stepY < 0 && player.y - s.y < 12){ player.y = s.y; player.vy = 0; player.grounded = true; }
        else if(stepX > 0) player.x = s.x + s.w + player.w/2;
        else if(stepX < 0) player.x = s.x - player.w/2;
      }
    }
    });
  }
}

// Bewegte Teile OHNE Schalter fahren erst los, wenn ihr Fahrweg ins Bild kommt – so sieht man sie
// von Anfang an fahren, statt mitten in eine Bewegung hineinzulaufen. Mehrteiliger Boden startet gemeinsam.
const MOVER_VIEW_MARGIN = 40;   // so weit (px) muss der Fahrweg schon im Bild sein
function pathVisible(x1, x2, w){
  const minX = Math.min(x1, x2), maxX = Math.max(x1, x2) + w;
  return maxX > camX && minX < camX + VW - MOVER_VIEW_MARGIN;
}
function activateVisibleMovers(){
  const groups = new Set();
  for(const s of solids){
    if(s.type!=='moveplat' || s.switchCtl || s.tripActive) continue;
    if(pathVisible(s.startX, s.targetX, s.w)) groups.add(s.group===undefined ? s : s.group);
  }
  if(groups.size){
    for(const s of solids){
      if(s.type==='moveplat' && !s.switchCtl && !s.tripActive && (groups.has(s) || groups.has(s.group))){ s.tripActive = true; }
    }
  }
  for(const h of hooks){
    if(h.moving && !h.switchCtl && !h.tripActive && pathVisible(h.startX, h.targetX, 0)) h.tripActive = true;
  }
}

// Bewegte Haken: gleiche Logik wie bewegter Boden. Hängt Spieler 1 dran, zieht das Seil ihn automatisch mit.
function updateMovingHooks(){
  for(const h of hooks){
    if(!h.moving) continue;
    if(!h.tripActive) continue;
    const speed = h.speed || MOVE_PLAT_SPEED;
    const tx = h.moveDir===1 ? h.targetX : h.startX, ty = h.moveDir===1 ? h.targetY : h.startY;
    const dx = tx-h.x, dy = ty-h.y, dist = Math.hypot(dx,dy);
    if(dist <= speed){
      h.x = tx; h.y = ty;
      h.moveDir *= -1;
    } else { h.x += dx/dist*speed; h.y += dy/dist*speed; }
  }
}

// Jemand stirbt (Stacheln oder runtergefallen): Spieler zum Checkpoint, und ALLE bewegten
// Böden/Haken zurück an ihren Start. Ohne Schalter fahren sie sofort wieder los,
// mit Schalter warten sie, bis der Schalter erneut betätigt wird.
