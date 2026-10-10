// 08-figur-physik-seil.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// Seilspannung: ist die Figur weiter weg als die Seillänge (weil sie festhängt), dehnt sich das Seil
// wie ein Gummi und zieht zurück. Es REISST NICHT (Nutzerwunsch) – bei sehr starker Dehnung gibt
// einfach Seil nach. Gelöst wird es nur per G, Springen oder sobald man auf etwas steht.
const ROPE_SNAP_STRETCH = 70;   // ab so viel Dehnung gibt das Seil nach (Anzeige: max. Rot)
const ROPE_MAX_STEP = 18;       // max. Bewegung pro Schritt am Seil (kleiner als eine Wanddicke)
function updateRopeTension(player){
  const ax = player.anchor.x, ay = player.anchor.y;
  const hx = player.x, hy = player.y - player.h*0.6;
  const dx = hx-ax, dy = hy-ay, dist = Math.hypot(dx,dy) || 1;
  const over = dist - player.ropeLen;
  player.ropeStretch = Math.max(0, over);
  if(over > 3){
    const k = 0.05;                                // Gummi-Zug zurück Richtung Haken
    player.vx -= dx/dist * over * k;
    player.vy -= dy/dist * over * k;
  }
  // statt zu reißen: zu viel Dehnung -> Seil gibt nach (wird länger)
  if(over > ROPE_SNAP_STRETCH){ player.ropeLen = dist - ROPE_SNAP_STRETCH; player.ropeMax = Math.max(player.ropeMax, player.ropeLen); }
}
function updateSpikes(player){
  for(const sp of spikes){
    const box = {x:sp.x-sp.w/2, y:sp.y-sp.h, w:sp.w, h:sp.h};
    const pBox = {x:player.x-player.w/2, y:player.y-player.h, w:player.w, h:player.h};
    if(rectsOverlap(box,pBox)){
      die(player);
      break;
    }
  }
}

// Loslassen vom Seil: Schwung unverändert mitnehmen (siehe ROPE_FLING_* in 02-physik-werte.js)
function ropeFling(player){
  player.ropeFling = true;
}
function touchingWall(player, side){
  const probe = {x: side<0 ? player.x-player.w/2-4 : player.x+player.w/2, y:player.y-player.h+4, w:4, h:player.h-8};
  for(const s of solids){ if(!s.gone && s.type !== 'oneway' && rectsOverlap(probe,s)) return true; }   // Steg = keine Wand
  return false;
}

function lineClear(x1,y1,x2,y2){
  const dist = Math.hypot(x2-x1,y2-y1);
  const steps = Math.max(1, Math.ceil(dist/6));
  for(let i=1;i<steps;i++){
    const t=i/steps;
    const px=x1+(x2-x1)*t, py=y1+(y2-y1)*t;
    for(const s of solids){
      if(s.gone || s.type === 'oneway') continue;   // Seil-Sicht geht durch einseitige Plattformen
      if(px>=s.x && px<=s.x+s.w && py>=s.y && py<=s.y+s.h) return false;
    }
  }
  return true;
}

function findHookTarget(player){
  const originX = player.x, originY = player.y-player.h*0.6;
  let best=null, bestD=Infinity;
  for(const h of hooks){
    const d = Math.hypot(h.x-originX, h.y-originY);
    if(d > hookRange(h)) continue;
    if(!lineClear(originX,originY,h.x,h.y)) continue;
    if(d < bestD){ best=h; bestD=d; }
  }
  return best;
}

function updatePlayer(player, now){
  const frozen = won;   // beide im Ziel: Figuren tanzen, Eingaben ruhen
  const left = !frozen && isDown(player.keys.left), right = !frozen && isDown(player.keys.right);
  const jumpHeld = !frozen && isDown(player.keys.jump);
  const jumpPressed = !frozen && KEYS[player.keys.jump+'_pressed'];
  KEYS[player.keys.jump+'_pressed'] = false;

  let moveDir = 0;
  if(left){ moveDir = -1; player.facing = -1; }
  if(right){ moveDir = 1; player.facing = 1; }

  if(player.male){
    const hookPressed = !frozen && KEYS[player.keys.hook+'_pressed']; KEYS[player.keys.hook+'_pressed']=false;
    if(hookPressed){
      if(player.hookAttached){
        player.hookAttached = false;
        ropeFling(player);
      } else {
        const target = findHookTarget(player);
        if(target){
          player.hookAttached = true;
          player.ropeWasAirborne = false;   // erst nach dem Abheben zählt "Landen" als Lösen
          player.anchor = target;
          player.ropeLen = Math.hypot(target.x-player.x, target.y-(player.y-player.h*0.6));
          // runterlassen bis an den äußeren Rand des Reichweiten-Rings
          player.ropeMax = Math.max(player.ropeLen, hookRange(target));
        }
      }
    }
  }

  const isPulling = player.male && !frozen && isDown(player.keys.pull);
  const isSlacking = player.male && !frozen && isDown(player.keys.slack);

  if(player.male && player.hookAttached){
    player.vy += GRAVITY * 0.9;
    if(moveDir !== 0 && player.vx*moveDir > -0.3) player.vx += moveDir * SWING_PUSH;
    const lenBefore = player.ropeLen;
    if(isPulling) player.ropeLen = Math.max(HOOK_MIN_LEN, player.ropeLen - ROPE_PULL_SPEED);
    if(isSlacking) player.ropeLen = Math.min(player.ropeMax, player.ropeLen + ROPE_ADJUST_SPEED);
    player.ropePulledNow = player.ropeLen < lenBefore;

    let nx = player.x + player.vx, ny = (player.y-player.h*0.6) + player.vy;
    const dx = nx-player.anchor.x, dy = ny-player.anchor.y;
    const dist = Math.hypot(dx,dy) || 1;
    // Ist das Seil gerade gedehnt (Figur hängt fest), NICHT hart auf die Seillänge zurücksetzen –
    // das würde sie mit einem Ruck durch Wände ziehen. Dann zieht nur die Gummikraft (updateRopeTension).
    const curDist = Math.hypot(player.x-player.anchor.x, (player.y-player.h*0.6)-player.anchor.y);
    if(dist > player.ropeLen && curDist <= player.ropeLen + 4){
      const scale = player.ropeLen/dist;
      nx = player.anchor.x + dx*scale;
      ny = player.anchor.y + dy*scale;
      const nxv = dx/dist, nyv = dy/dist;
      const radial = player.vx*nxv + player.vy*nyv;
      player.vx -= radial*nxv;
      player.vy -= radial*nyv;
    }

    // Nicht mehr sofort lösen, wenn die Schwungbahn etwas berührt: die Figur bewegt sich Richtung
    // Schwungposition und wird von Wänden/Boden ganz normal aufgehalten (Kollision weiter unten).
    // Hängt sie dadurch fest, dehnt sich das Seil – und reißt erst bei zu viel Spannung.
    const feetY = ny + player.h*0.6;
    player.vx = nx - player.x;
    player.vy = feetY - player.y;
    // Schutz gegen "Durchtunneln": nie mehr als ROPE_MAX_STEP px pro Schritt
    const sp = Math.hypot(player.vx, player.vy);
    if(sp > ROPE_MAX_STEP){ player.vx *= ROPE_MAX_STEP/sp; player.vy *= ROPE_MAX_STEP/sp; }

    if(jumpPressed && player.hookAttached){
      player.hookAttached = false;
      player.vy += HOOK_RELEASE_BOOST;   // kleiner Hub nach oben; seitlich bleibt genau der Schwung
      ropeFling(player);
    }
  } else {
    const control = player.grounded ? 1 : AIR_CONTROL;
    if(player.grounded || player.onWall) player.ropeFling = false;   // Abflug endet beim Landen / an der Wand
    if(player.wjInputLock > 0){
      player.wjInputLock -= 16.6;
      player.vx *= FRICTION_AIR; // Schwung klingt natürlich ab, wird nur nicht gegengesteuert
    } else {
      const vxBefore = player.vx;
      player.vx += moveDir * MOVE_SPEED * 0.35 * control;
      // Sprint-Aufbau: am Boden weiter in dieselbe Richtung halten baut über die Basisgeschwindigkeit hinaus Tempo auf
      if(player.grounded && moveDir !== 0 && Math.abs(player.vx) >= MOVE_SPEED*0.9 && Math.sign(player.vx) === moveDir){
        player.vx += moveDir * SPRINT_ACCEL;
      }
      if(moveDir === 0){
        player.vx *= player.grounded ? FRICTION_GROUND : (player.ropeFling ? ROPE_FLING_DRAG : FRICTION_AIR);
        if(Math.abs(player.vx) < 0.05) player.vx = 0;
      }
      // Abflug vom Seil: vorhandener Schwung (bis ROPE_FLING_MAX) bleibt, aber Taste halten beschleunigt
      // nicht über die normale Höchstgeschwindigkeit hinaus
      const vmax = player.ropeFling ? Math.min(ROPE_FLING_MAX, Math.max(SPRINT_MAX_SPEED, Math.abs(vxBefore))) : SPRINT_MAX_SPEED;
      player.vx = Math.max(-vmax, Math.min(vmax, player.vx));
    }

    let gliding = false;
    // Schweinchen segelt mit eigener Taste (Num 1 halten), Springen bleibt auf Num 0
    const windy = !player.male && winds.length && inWind(player);
    if(!player.male && !frozen && isDown(player.keys.glide) && !player.grounded && (player.vy > -1 || windy)){
      gliding = true;
      player.glideTimer += 16.6;
      const t = Math.min(1, player.glideTimer/GLIDE_RAMP_MS);
      const grav = GLIDE_START_GRAV + (GRAVITY-GLIDE_START_GRAV)*t;
      const maxFall = GLIDE_MAX_FALL_START + (GLIDE_MAX_FALL_END-GLIDE_MAX_FALL_START)*t;
      player.vy += grav;
      if(player.vy > maxFall) player.vy = maxFall;
      if(windy){   // Aufwind trägt den Schirm nach oben (05-level-objekte.js)
        player.glideTimer = 0;
        player.vy = Math.max(-WIND_MAX_UP, player.vy - WIND_LIFT);
      }
    } else {
      player.vy += GRAVITY;
    }
    player.gliding = gliding;
    if(player.vy > MAX_FALL) player.vy = MAX_FALL;

    const wLeft = !player.grounded && touchingWall(player,-1);
    const wRight = !player.grounded && touchingWall(player,1);
    if(wLeft || wRight){
      const side = wLeft ? -1 : 1;
      if(player.onWall === 0){
        // frischer Kontakt: Schwung JETZT festhalten, bevor die Kollision ihn auf 0 bremst
        player.wallEntrySpeed = Math.abs(player.vx);
      }
      player.onWall = side;
      player.lastWallSide = side;   // merken, an welcher Seite die Wand war (für das Zeitfenster)
      player.lastWallTouch = now;
    } else {
      player.onWall = 0;
    }

    // Controller: Sprung darf auch kurz VOR dem Stick-Umlenken kommen (Reihenfolge egal).
    // Wurde ✕ an der Wand gedrückt, aber der Stick zeigt noch nicht weg, wartet der Sprung bis zu 150 ms.
    const padJump = !!PAD[player.keys.jump];
    if(jumpPressed && padJump && !player.grounded) player.wjPendingUntil = now + 150;
    const pendingWJ = !jumpPressed && !player.grounded && player.wjPendingUntil && now <= player.wjPendingUntil;
    if(!player.wjPendingUntil || now > player.wjPendingUntil) player.wjPendingUntil = 0;

    if(jumpPressed || pendingWJ){
      if(player.grounded && jumpPressed){
        player.vy = JUMP_V;
        player.grounded = false;
        player.glideTimer = 0;
      } else if(now - player.lastWallTouch <= ((padJump || pendingWJ) ? WALL_JUMP_BUFFER_PAD : WALL_JUMP_BUFFER)){
        let side = player.onWall || (touchingWall(player,-1) ? -1 : touchingWall(player,1) ? 1 : 0);
        // Controller: hat man sich durchs Stick-Umlenken schon von der Wand gelöst, zählt die zuletzt
        // berührte Wandseite weiter (sonst wäre das Zeitfenster am Controller praktisch wirkungslos)
        if(side === 0 && (padJump || pendingWJ)) side = player.lastWallSide || 0;
        // Richtungs-Bedingung (wieder aktiv): Richtungstaste muss VON der Wand weg zeigen
        // pro Wandseite nur einmal: erst wieder nach Wand auf der anderen Seite oder Bodenkontakt
        if(side !== 0 && moveDir === -side && side !== player.lastWallJumpSide && (player.wallEntrySpeed||0) > MIN_WALLJUMP_SPEED){
          const momentum = Math.min(1, (player.wallEntrySpeed||0) / SPRINT_MAX_SPEED); // 0 = ohne Schwung, 1 = voller Sprint-Schwung
          player.vy = WALL_JUMP_VY_MIN + (WALL_JUMP_VY_MAX-WALL_JUMP_VY_MIN)*momentum;
          const vxMag = WALL_JUMP_VX_MIN + (WALL_JUMP_VX_MAX-WALL_JUMP_VX_MIN)*momentum;
          player.vx = vxMag * moveDir; // in Richtung der gedrückten Taste (= von der Wand weg)
          player.lastWallJumpSide = side;
          player.lastWallTouch = -9999;
          player.wjPendingUntil = 0;
          player.glideTimer = 0;
          player.wjInputLock = 260;
        }
      }
    }
  }

  const wasGrounded = player.grounded, fallVy = player.vy;   // für den Sprungpilz: kam die Figur von oben angeflogen?
  player.grounded = false;
  player.standingOn = null;
  player.x += player.vx; collideAxis(player,'x');
  player.y += player.vy; collideAxis(player,'y');
  for(const E of ELEMENTE) if(E.spiel && E.spiel.nachBewegung) E.spiel.nachBewegung(player, wasGrounded, fallVy);   // z. B. Sprungpilz (elemente/)
  if(player.male && player.hookAttached){
    // LANDET man am Seil auf etwas (Boden, Wand-Oberseite, Bröckelboden, bewegter Boden …) -> Seil lösen.
    // Vom Boden aus eingehakt bleibt es dran, damit man sich mit W / Hoch zum Haken hochziehen kann.
    if(player.grounded){
      if(player.ropeWasAirborne) player.hookAttached = false;
    } else {
      player.ropeWasAirborne = true;
      updateRopeTension(player);
    }
    // Beim Ranziehen keinen Schwung Richtung Haken mitnehmen – sonst schießt der Affe oben über den
    // Haken hinaus und "hüpft". Seitlicher Schwung (Pendeln) bleibt erhalten.
    if(player.hookAttached && player.ropePulledNow){
      const hx = player.x - player.anchor.x, hy = (player.y - player.h*0.6) - player.anchor.y;
      const d = Math.hypot(hx, hy) || 1, ux = hx/d, uy = hy/d;
      const inward = -(player.vx*ux + player.vy*uy);
      if(inward > 0){ player.vx += ux*inward; player.vy += uy*inward; }
    }
  }
  if(player.grounded){ player.glideTimer = 0; player.wjInputLock = 0; player.lastWallJumpSide = 0; }

  // Decken-Grenze: oberer Bildrand (über Reihe 0 ist durch den Zoom ein Streifen Himmel sichtbar, SKY_ROOM in 09-kamera.js)
  const ceilY = -CEILING_MARGIN - SKY_ROOM;
  if(player.y - player.h < ceilY){
    player.y = player.h + ceilY;
    if(player.vy < 0) player.vy = 0;
  }

  // (Checkpoints laufen jetzt gemeinsam über updateCheckpoints() – nicht mehr pro Figur)

  if(player.y - player.h > LEVEL_H + 60){
    die(player);
  }

  player.atGoal = Math.hypot(player.x-goal.x, player.y-player.h/2-goal.y) < 60;

  player.animPhase += Math.abs(player.vx)*1.1 + (player.grounded?0:0.4);
  if(!player.male){
    // Schirm auf-/zuklappen (weich), dabei hängt sie aufrecht darunter statt zu rollen
    const target = player.gliding ? 1 : 0;
    player.umbrella += (target - player.umbrella) * (target ? 0.28 : 0.35);
    if(player.umbrella < 0.01) player.umbrella = 0;
  }
  if(!player.male && player.umbrella > 0.05){
    player.rollAngle = Math.atan2(Math.sin(player.rollAngle), Math.cos(player.rollAngle)) * 0.8;
  } else {
    player.rollAngle += player.vx / (player.w*0.5);
  }
  player.blink -= 16.6;
  if(player.blink < 0) player.blink = 2800+Math.random()*2600;
}

// Gemeinsamer Bildschirm: beide dürfen sich nicht weiter als eine Bildschirmbreite voneinander entfernen
