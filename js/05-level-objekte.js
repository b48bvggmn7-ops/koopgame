// 05-level-objekte.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

const CRUMBLE_TRIGGER_MS = 600;     // so lange nach dem Betreten hält er noch (unverändert)
const CRUMBLE_FRAGMENT_LIFE = 750;  // so lange sind Brocken/Staub danach sichtbar (nur Deko)

// Zerbrechen: unregelmäßige Brocken aus einem verwackelten Gitter (passen lückenlos zusammen),
// obere Reihe mit Gras; dazu Staubwolken. Alles nur Anzeige – die Kollision ist sofort weg.
function breakCrumble(s){
  s.gone = true; // Kollision sofort weg, Spieler fällt durch
  s.breakElapsed = 0;
  const nx = Math.max(2, Math.round(s.w/20)), ny = 2;
  const pts = [];
  for(let iy = 0; iy <= ny; iy++){
    pts.push([]);
    for(let ix = 0; ix <= nx; ix++){
      const inner = ix > 0 && ix < nx && iy > 0 && iy < ny;
      const jx = (ix > 0 && ix < nx) ? (Math.random() - 0.5)*8 : 0;
      const jy = inner ? (Math.random() - 0.5)*10 : 0;
      pts[iy].push([s.x + ix*s.w/nx + jx, s.y + iy*s.h/ny + jy]);
    }
  }
  const midX = s.x + s.w/2;
  s.fragments = [];
  for(let iy = 0; iy < ny; iy++){
    for(let ix = 0; ix < nx; ix++){
      const poly = [pts[iy][ix], pts[iy][ix+1], pts[iy+1][ix+1], pts[iy+1][ix]];
      const cx = poly.reduce((a, p)=>a + p[0], 0)/4, cy = poly.reduce((a, p)=>a + p[1], 0)/4;
      s.fragments.push({
        x: cx, y: cy, pts: poly.map(([px, py])=>[px - cx, py - cy]), grassTop: iy === 0 ? s.y - cy : null,
        vx: (cx - midX)/s.w*3 + (Math.random() - 0.5)*2.2,
        vy: -2.5 - Math.random()*2.8 + iy*1.2,
        rot: 0, vrot: (Math.random() - 0.5)*0.3,
      });
    }
  }
  // kleine Steinchen
  for(let i = 0; i < Math.round(s.w/14); i++){
    const r = 2 + Math.random()*2.5;
    s.fragments.push({x: s.x + Math.random()*s.w, y: s.y + s.h*(0.3 + Math.random()*0.6),
      pts: [[-r, -r*0.7], [r*0.8, -r], [r, r*0.6], [-r*0.6, r]], grassTop: null, pebble: true,
      vx: (Math.random() - 0.5)*4, vy: -1.5 - Math.random()*3, rot: 0, vrot: (Math.random() - 0.5)*0.5});
  }
  s.dust = [];
  for(let i = 0; i < Math.round(s.w/16) + 3; i++){
    s.dust.push({x: s.x + Math.random()*s.w, y: s.y + s.h*(0.2 + Math.random()*0.8),
      vx: (Math.random() - 0.5)*1.6, vy: -0.4 - Math.random()*0.8, r: 8 + Math.random()*10});
  }
}

function updateCrumbles(dt){
  for(const s of solids){
    if(s.type!=='crumble') continue;
    if(s.triggered && !s.gone){
      s.timer += dt;
      if(s.timer >= CRUMBLE_TRIGGER_MS) breakCrumble(s);
    } else if(s.gone && s.fragments && s.breakElapsed < CRUMBLE_FRAGMENT_LIFE){
      s.breakElapsed += dt;
      for(const f of s.fragments){
        f.vy += 0.5;
        f.x += f.vx; f.y += f.vy; f.rot += f.vrot;
      }
      for(const d of (s.dust||[])){ d.x += d.vx; d.y += d.vy; d.vx *= 0.96; d.r += 0.35; }
      if(s.breakElapsed >= CRUMBLE_FRAGMENT_LIFE){ s.fragments = null; s.dust = null; }
    }
  }
}

// Türen bleiben offen, bis der Hebel nochmal betätigt wird (früher: nach 5 s automatisch zu – Nutzerwunsch geändert).
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
// Hebel = Ein/Aus-Schalter je Verknüpfungs-Nummer:
//  ein -> Türen öffnen (bleiben offen), bewegter Boden/Wand/Haken fahren los bzw. weiter
//  aus -> Türen schließen (erst wenn niemand drinsteht), Bewegungen bleiben genau dort stehen
// Bei Tod/Neustart ist alles wieder aus (Türen zu, Bewegungen am Start).
function triggerSwitch(sw, player){
  const now = performance.now();
  const on = !linkOn[sw.link];
  linkOn[sw.link] = on;
  for(const d of solids){
    if(d.type!=='door' || d.link!==sw.link) continue;
    if(on){ d.open = true; d.gone = true; d.closing = false; }
    else d.closing = true;            // schließt in updateDoorsAndSwitches, sobald frei
  }
  for(const m of solids){
    if(m.type==='moveplat' && m.switchCtl && m.switchLink===sw.link) m.tripActive = on;
  }
  for(const h of hooks){
    if(h.moving && h.switchCtl && h.switchLink===sw.link) h.tripActive = on;
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
  // Tür schließen, sobald keine Figur mehr darin steht (niemand wird eingeklemmt)
  for(const d of solids){
    if(d.type==='door' && d.closing){
      const blocked = players.some(p => rectsOverlap({x:p.x-p.w/2, y:p.y-p.h, w:p.w, h:p.h}, d));
      if(!blocked){ d.open = false; d.gone = false; d.closing = false; }
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

// Hebel auf bewegtem Boden fahren mit: steht ein Hebel direkt auf einem bewegten Stück (Hebel-Kästchen genau
// darüber), merkt er sich seinen Abstand dazu und wird nach jedem Bewegungsschritt mitgeführt.
// Die Zuordnung passiert beim ersten Aufruf nach dem Laden (an den Startpositionen der Stücke).
function syncSwitchCarriers(){
  for(const sw of switchDefs){
    if(sw.carrier === undefined){
      const foot = sw.y + 20;   // Unterkante des Hebel-Kästchens = Oberkante des Bodens
      const plat = solids.find(s => s.type==='moveplat' && Math.abs(s.startY - foot) < 2 &&
                                     sw.x >= s.startX && sw.x < s.startX + s.w);
      sw.carrier = plat || null;
      if(plat){ sw.offX = sw.x - plat.startX; sw.offY = sw.y - plat.startY; }
    }
    if(sw.carrier){ sw.x = sw.carrier.x + sw.offX; sw.y = sw.carrier.y + sw.offY; }
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
