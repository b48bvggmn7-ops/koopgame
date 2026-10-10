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
  const codes = [player.keys.use, player.keys.padUse];   // je nach Spielerwahl (03-eingabe.js)
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
// Verknüpfung ein-/ausschalten (Hebel und Druckplatte)
function setLink(link, on){
  linkOn[link] = on;
  for(const d of solids){
    if(d.type!=='door' || d.link!==link) continue;
    if(on){ d.open = true; d.gone = true; d.closing = false; }
    else d.closing = true;            // schließt in updateDoorsAndSwitches, sobald frei
  }
  for(const m of solids){
    if(m.type==='moveplat' && m.switchCtl && m.switchLink===link) m.tripActive = on;
  }
  for(const h of hooks){
    if(h.moving && h.switchCtl && h.switchLink===link) h.tripActive = on;
  }
}
function triggerSwitch(sw, player){
  const now = performance.now();
  const on = !linkOn[sw.link];
  setLink(sw.link, on);
  player.leverAnim = {t0: now, dir: Math.sign(sw.x - player.x) || player.facing || 1};
  sw.pulledT = now;
  SFX.lever(on, sw.x);   // Holz-Klack (18-sound.js)
}
// Druckplatte: Verknüpfung ist AN, solange mindestens eine Figur auf einer Platte dieser Nummer steht.
// Steigt man herunter, geht sie wieder AUS (Tür schließt, sobald niemand mehr drinsteht; Bewegung hält an).
function onPlate(player, pl){
  return player.grounded && Math.abs(player.y - (pl.y + 20)) < 3 && Math.abs(player.x - pl.x) < 20 + player.w/2 - 4;
}
function updatePlates(players){
  const want = {};
  for(const pl of plates){
    const down = players.some(p => onPlate(p, pl));
    if(down && !pl.down) SFX.lever(true, pl.x);
    pl.down = down;
    want[pl.link] = want[pl.link] || down;
  }
  for(const link in want){ if(!!linkOn[link] !== want[link]) setLink(Number(link), want[link]); }
}
// Aufwind (inWind, WIND_LIFT) und Sprungpilz (checkBounce, BOUNCE_V): jetzt in elemente/aufwind.js bzw. elemente/sprungpilz.js
function updateDoorsAndSwitches(dt, players){
  updatePlates(players);
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
    if(onTop && !carried.has(player)){
      player.x += stepX; player.y += stepY; carried.add(player);
      // nie durch feste Wände/Decken mitnehmen: wird es eng, bleibt die Figur stehen (rutscht von der Platte)
      if(stepX && playerBlocked(player, s)) player.x -= stepX;
      if(stepY && playerBlocked(player, s)) player.y -= stepY;
    }
    else if(!onTop) pushOutOfMover(player, s, stepX, stepY);
    });
  }
}
// Fährt ein bewegtes Stück in eine Figur hinein (von oben, unten oder der Seite), wird sie zur nächsten freien
// Seite hinausgeschoben – bevorzugt in Fahrtrichtung. Sonst bliebe sie im Stück stecken und die Kollision würde
// sie im nächsten Schritt plötzlich obendrauf setzen („durch die Platte“ / „auf einmal über der Wand“).
function playerBlocked(player, except){
  const b = {x:player.x-player.w/2, y:player.y-player.h, w:player.w, h:player.h};
  for(const o of solids){
    if(o === except || o.gone || o.type === 'oneway') continue;
    const ox = Math.min(b.x+b.w, o.x+o.w) - Math.max(b.x, o.x);
    const oy = Math.min(b.y+b.h, o.y+o.h) - Math.max(b.y, o.y);
    if(ox > COLLIDE_EPS && oy > COLLIDE_EPS) return true;
  }
  return false;
}
function pushOutOfMover(player, s, stepX, stepY){
  const box = {x:player.x-player.w/2, y:player.y-player.h, w:player.w, h:player.h};
  const ox = Math.min(box.x+box.w, s.x+s.w) - Math.max(box.x, s.x);
  const oy = Math.min(box.y+box.h, s.y+s.h) - Math.max(box.y, s.y);
  if(ox <= COLLIDE_EPS || oy <= COLLIDE_EPS) return;
  const above = box.y + box.h/2 < s.y + s.h/2, left = player.x < s.x + s.w/2;
  const cand = {
    up:    {x: player.x, y: s.y, d: player.y - s.y},
    down:  {x: player.x, y: s.y + s.h + player.h, d: s.y + s.h + player.h - player.y},
    left:  {x: s.x - player.w/2, y: player.y, d: player.x - (s.x - player.w/2)},
    right: {x: s.x + s.w + player.w/2, y: player.y, d: s.x + s.w + player.w/2 - player.x},
  };
  // Fahrtrichtung zuerst (seitlich fahrende Wände schieben wie bisher in Fahrtrichtung, steigende Böden
  // heben die Figur nur hoch, wenn sie knapp mit den Füßen drinsteckt), danach die kürzeste Strecke
  let first = null;
  if(Math.abs(stepX) >= Math.abs(stepY) && stepX) first = stepX > 0 ? 'right' : 'left';
  else if(stepY < 0 && (above || cand.up.d < 12)) first = 'up';
  else if(stepY > 0 && !above) first = 'down';
  // gegen die Fahrtrichtung (z. B. von einer sinkenden Platte nach OBEN) nur als allerletzter Ausweg
  const against = stepY > 0 ? 'up' : stepY < 0 ? 'down' : stepX > 0 ? 'left' : stepX < 0 ? 'right' : '';
  const order = Object.keys(cand).sort((a, b) => (cand[a].d + (a === against ? 1e4 : 0)) - (cand[b].d + (b === against ? 1e4 : 0)));
  if(first) order.unshift(first);
  let pick = null;
  for(const k of order){
    player.x = cand[k].x; player.y = cand[k].y;
    if(!playerBlocked(player, s)){ pick = k; break; }
  }
  if(!pick){ pick = first || order[0]; }
  player.x = cand[pick].x; player.y = cand[pick].y;
  if(pick === 'up'){ player.vy = 0; player.grounded = true; }
  else if(pick === 'down') player.vy = Math.max(player.vy, stepY, 0);
  else if((pick === 'right' && player.vx < 0) || (pick === 'left' && player.vx > 0)) player.vx = 0;
}

// Hebel auf bewegtem Boden fahren mit: steht ein Hebel direkt auf einem bewegten Stück (Hebel-Kästchen genau
// darüber), merkt er sich seinen Abstand dazu und wird nach jedem Bewegungsschritt mitgeführt.
// Die Zuordnung passiert beim ersten Aufruf nach dem Laden (an den Startpositionen der Stücke).
// Stacheln an bewegten Teilen fahren mit (bewegliche Stachelwand, Stachel-Presse): ein Stachel-Kästchen, das
// mit seinem FUSS an einem bewegten Stück klebt (dir 0 = zeigt nach oben -> Stück darunter, 2 = nach unten ->
// Stück darüber, 1 = nach rechts -> Stück links daneben, 3 = nach links -> Stück rechts daneben), fährt mit.
// Zuordnung beim ersten Aufruf nach dem Laden (Startpositionen), wie bei den Hebeln.
function syncSpikeCarriers(){
  for(const sp of spikes){
    if(sp.carrier === undefined){
      const d = sp.dir || 0, top = sp.y - 40, L = sp.x - 20, R = sp.x + 20;
      const plat = solids.find(s => {
        if(s.type !== 'moveplat') return false;
        const sx = s.startX, sy = s.startY;
        if(d === 0) return Math.abs(sy - sp.y) < 2 && sp.x > sx && sp.x < sx + s.w;
        if(d === 2) return Math.abs(sy + s.h - top) < 2 && sp.x > sx && sp.x < sx + s.w;
        if(d === 1) return Math.abs(sx + s.w - L) < 2 && sp.y - 20 > sy && sp.y - 20 < sy + s.h;
        return Math.abs(sx - R) < 2 && sp.y - 20 > sy && sp.y - 20 < sy + s.h;
      });
      sp.carrier = plat || null;
      if(plat){ sp.offX = sp.x - plat.startX; sp.offY = sp.y - plat.startY; }
    }
    if(sp.carrier){ sp.x = sp.carrier.x + sp.offX; sp.y = sp.carrier.y + sp.offY; }
  }
}
function syncSwitchCarriers(){
  syncSpikeCarriers();
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
