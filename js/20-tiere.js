// 20-tiere.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Süße Tiere & kleine Dinge zum Entdecken (reine Deko, keine Kollision, kein Einfluss aufs Spiel) ----------
// Schmetterlinge (flattern um ihren Platz, weichen aus), Frösche (quaken, hüpfen weg), Schnecken (kriechen, ziehen
// sich ins Haus zurück), Pilze (quietschen + federn, wenn man drüberläuft), Blumenknospen (gehen auf, wenn man
// vorbeikommt), selten: Faultier unter schwebendem Boden (schläft, wacht auf und winkt) und EIN goldener Schmetterling
// pro Level (Glitzer-Ton beim Entdecken). Platziert wie die Pflanzen: nie auf/an Münzen, Stacheln, Hebeln usw.
let critFor = null;
let critters = [];
const CRIT_NEAR = 110;      // so nah muss eine Figur kommen, damit Tiere reagieren

function critNearPlayer(x, y, dx, dy){
  for(const p of [p1, p2]) if(p && Math.abs(p.x - x) < dx && Math.abs((p.y - p.h*0.5) - y) < dy) return p;
  return null;
}
function buildCritters(){
  critFor = solids; critters = [];
  if(typeof hgTierRegeln === 'function' && hgTierRegeln()){ buildCrittersDschungel(); return; }   // neuer Dschungel-Look (unten)
  const CT = THEME.critters;
  const keep = [];
  for(const c of coins) keep.push([c.x, c.y]);
  for(const sp of spikes) keep.push([sp.x, sp.y - 20]);
  // Hebel, Sprungpilze, Druckplatten: weiter Bereich ganz ohne Pflanzen/Tiere (Nutzerwunsch: nichts lenkt davon ab)
  const frei = [...switchDefs.map(sw => [sw.x, sw.y]), ...bouncers.map(b => [b.x, b.y - 20]), ...plates.map(pl => [pl.x, pl.y])];
  for(const cp of checkpointDefs) keep.push([cp.x, cp.y - 20]);
  if(goal) keep.push([goal.x, goal.y - 20]);
  for(const s of solids) if(s.type === 'door' || s.type === 'crumble' || s.type === 'moveplat') keep.push([s.x + s.w/2, s.y]);
  const blocked = (x, top)=> keep.some(([kx, ky])=> Math.abs(kx - x) < 44 && ky > top - 90 && ky < top + 30) ||
    frei.some(([kx, ky])=> Math.abs(kx - x) < DEKO_FREI_ABSTAND && ky > top - 120 && ky < top + 40);
  const nearStart = x => Math.abs(x - levelStartM.x) < 200;
  let goldDone = false, slothCount = 0, lastKind = {};
  const grounds = solids.filter(s => s.type === 'ground').sort((a, b)=> a.x - b.x || a.y - b.y);
  for(const s of grounds){
    // Oberseite: freie Kästchen sammeln
    const free = [];
    for(let cx = s.x; cx < s.x + s.w; cx += 40){
      if(decoSolidAt(cx + 20, s.y - 2) || s.y < 40 || blocked(cx + 20, s.y)) continue;
      free.push(cx);
    }
    for(const cx of free){
      const r = decoHash(cx + 5, s.y + 9), mid = cx + 20;
      const far = k => !lastKind[k] || Math.abs(lastKind[k] - mid) > 420;
      if(nearStart(mid)) continue;
      // Boden-Tiere je Level-Thema (10a-themen.js): Leiter aus [Art, Anteil]
      let acc = 0, kind = null;
      for(const [k, w] of CT.ground){ acc += w; if(r < acc){ kind = k; break; } }
      if(kind === 'frog' && far('frog')){ lastKind.frog = mid;
        critters.push({kind: 'frog', x: mid, y: s.y, home: mid, minX: s.x + 10, maxX: s.x + s.w - 10, dir: r < 0.035 ? -1 : 1, hop: null, t: Math.random()*5000, nextCroak: 3 + Math.random()*8});
      } else if(kind === 'snail' && far('snail') && s.w >= 120){ lastKind.snail = mid;
        critters.push({kind: 'snail', x: mid, y: s.y, minX: s.x + 8, maxX: s.x + s.w - 8, dir: 1, hide: 0});
      } else if(kind === 'mush' && far('mush')){ lastKind.mush = mid;
        critters.push({kind: 'mush', x: mid + (r*40 % 14) - 7, y: s.y, squish: 0, lastT: 0, big: r*7 % 1 < 0.5,
                       glowCap: CT.mushGlow ? (r*13 % 1 < 0.5 ? '#6af0ff' : '#c08aff') : null, glow: CT.mushGlow ? 60 : 0});
      } else if(kind === 'bud' && far('bud')){ lastKind.bud = mid;
        critters.push({kind: 'bud', x: mid, y: s.y, open: 0, target: 0, col: r*7 % 1 < 0.5 ? '#ff7eb0' : '#ffb347'});
      } else if(kind === 'lizard' && far('lizard') && s.w >= 120){ lastKind.lizard = mid;
        critters.push({kind: 'lizard', x: mid, y: s.y, minX: s.x + 12, maxX: s.x + s.w - 12, dir: r*11 % 1 < 0.5 ? -1 : 1, run: 0, t: Math.random()*4000,
                       col: CT.lizardCol || ['#5cc27a', '#e0a040', '#3fa7e0'][Math.floor(r*997) % 3]});
      } else if(kind === 'crystal' && far('crystal')){ lastKind.crystal = mid;
        const cols = CT.crystalCols || ['#5ee0ff', '#b48cff', '#7af0d0'];
        critters.push({kind: 'crystal', x: mid + (r*40 % 14) - 7, y: s.y, col: cols[Math.floor(r*991) % cols.length], lit: 0, glow: 70, big: r*5 % 1 < 0.5});
      }
      const rb = decoHash(cx + 77, s.y + 31);
      if(rb < 0.16 && far('fly')){ lastKind.fly = mid;
        const gold = !goldDone && rb > 0.12 && mid > levelStartM.x + 800;
        if(gold) goldDone = true;
        const air = gold ? 'butterfly' : CT.air;
        critters.push({kind: air, hx: mid, hy: s.y - 50, x: mid, y: s.y - 50, ph: r*100, flee: 0, gold, found: false,
                       glow: air === 'firefly' ? 70 : 0,
                       col: gold ? '#ffd23f' : CT.airCols[Math.floor(rb*1000) % CT.airCols.length]});
      }
    }
    // Faultier bzw. Fledermaus unter schwebendem Boden (Unterseite frei, darunter Luft)
    if(slothCount < (CT.hanging === 'bat' ? 4 : 2) && s.w >= 120 && s.y > 120 && s.y + s.h + 90 < LEVEL_H){
      const ux = s.x + s.w*0.5;
      if(!decoSolidAt(ux, s.y + s.h + 4) && !decoSolidAt(ux, s.y + s.h + 70) && decoHash(s.x, s.y) < 0.5 && !blocked(ux, s.y + s.h + 60)){
        if(CT.hanging === 'bat') critters.push({kind: 'bat', x: ux, y: s.y + s.h, hx: ux, hy: s.y + s.h, state: 'hang', t: 0, vx: 0, vy: 0, ph: Math.random()*9});
        else critters.push({kind: 'sloth', x: ux, y: s.y + s.h, awake: 0, wave: 0, found: false});
        slothCount++;
      }
    }
  }
  // Laufende/hüpfende Tiere (Frosch, Schnecke, Eidechse) nie in die freie Zone um Hebel/Pilze/Druckplatten
  for(const c of critters){
    if(c.minX === undefined) continue;
    for(const [kx, ky] of frei){
      if(ky < c.y - 120 || ky > c.y + 40) continue;
      if(kx >= c.x) c.maxX = Math.min(c.maxX, kx - DEKO_FREI_ABSTAND);
      else c.minX = Math.max(c.minX, kx + DEKO_FREI_ABSTAND);
    }
    if(c.minX > c.maxX) c.minX = c.maxX = c.x;
  }
}

function updateCritters(dt){
  const t = performance.now();
  for(const c of critters){
    if(c.kind === 'butterfly'){
      c.ph += dt*0.006;
      const near = critNearPlayer(c.x, c.y, 90, 80);
      c.flee = near ? Math.min(1, c.flee + dt*0.004) : Math.max(0, c.flee - dt*0.0008);
      const tx = c.hx + Math.sin(c.ph*0.7)*38 + (near ? Math.sign(c.x - near.x || 1)*60*c.flee : 0);
      const ty = c.hy + Math.sin(c.ph*1.3)*16 - 50*c.flee;
      c.x += (tx - c.x)*Math.min(1, dt*0.004); c.y += (ty - c.y)*Math.min(1, dt*0.004);
      if(c.gold && !c.found && near){ c.found = true; c.foundT = t; SFX.discover(c.x); }
    } else if(c.kind === 'frog'){
      c.t += dt;
      if(c.hop){
        const k = Math.min(1, (t - c.hop.t0)/420);
        c.x = c.hop.x0 + (c.hop.x1 - c.hop.x0)*k; c.jy = -Math.sin(k*Math.PI)*28;
        if(k >= 1){ c.hop = null; c.jy = 0; }
      } else {
        const near = critNearPlayer(c.x, c.y - 10, CRIT_NEAR, 70);
        if(near){
          let dir = Math.sign(c.x - near.x) || 1, x1 = c.x + dir*(60 + Math.random()*30);
          if(x1 < c.minX || x1 > c.maxX){ dir = -dir; x1 = Math.max(c.minX, Math.min(c.maxX, c.x + dir*70)); }
          c.dir = dir; c.hop = {t0: t, x0: c.x, x1}; SFX.frog(c.x);
        } else {
          c.nextCroak -= dt/1000;
          if(c.nextCroak <= 0){ c.nextCroak = 6 + Math.random()*10; c.croakT = t; if(Math.abs(c.x - camX - VW/2) < VW*0.6) SFX.frog(c.x); }
        }
      }
    } else if(c.kind === 'snail'){
      const near = critNearPlayer(c.x, c.y - 8, 70, 50);
      c.hide = near ? Math.min(1, c.hide + dt*0.006) : Math.max(0, c.hide - dt*0.0007);
      if(c.hide < 0.05){
        c.x += c.dir*dt*0.006;
        if(c.x > c.maxX){ c.x = c.maxX; c.dir = -1; } if(c.x < c.minX){ c.x = c.minX; c.dir = 1; }
      }
    } else if(c.kind === 'mush'){
      const on = critNearPlayer(c.x, c.y - 14, 18, 24);
      if(on && t - c.lastT > 600){ c.lastT = t; SFX.mushroom(c.x); }
      c.squish = on ? Math.min(1, c.squish + dt*0.02) : Math.max(0, c.squish - dt*0.006);
    } else if(c.kind === 'bud'){
      if(critNearPlayer(c.x, c.y - 12, 60, 60) && c.target === 0){ c.target = 1; c.openT = t; SFX.bud(c.x); }
      c.open += (c.target - c.open)*Math.min(1, dt*0.004);
    } else if(c.kind === 'firefly'){
      // Glühwürmchen: schwirrt um seinen Platz, blinkt, weicht aus
      c.ph += dt*0.004;
      const near = critNearPlayer(c.x, c.y, 80, 70);
      c.flee = near ? Math.min(1, c.flee + dt*0.004) : Math.max(0, c.flee - dt*0.0008);
      const tx = c.hx + Math.sin(c.ph*0.6)*45 + (near ? Math.sign(c.x - near.x || 1)*60*c.flee : 0);
      const ty = c.hy + Math.sin(c.ph*1.1)*22 - 40*c.flee;
      c.x += (tx - c.x)*Math.min(1, dt*0.003); c.y += (ty - c.y)*Math.min(1, dt*0.003);
      c.glow = 40 + 40*Math.max(0, Math.sin(c.ph*2.2));
    } else if(c.kind === 'lizard'){
      // Eidechse: sonnt sich, flitzt davon, wenn jemand kommt
      c.t += dt;
      const near = critNearPlayer(c.x, c.y - 6, 100, 60);
      if(near && c.run <= 0){ c.dir = Math.sign(c.x - near.x) || 1; c.run = 700; }
      if(c.run > 0){
        c.run -= dt; c.x += c.dir*dt*0.32;
        if(c.x > c.maxX){ c.x = c.maxX; c.dir = -1; } if(c.x < c.minX){ c.x = c.minX; c.dir = 1; }
      }
    } else if(c.kind === 'crystal'){
      const near = critNearPlayer(c.x, c.y - 12, 60, 50);
      c.lit += ((near ? 1 : 0) - c.lit)*Math.min(1, dt*0.004);
      c.glow = 60 + 60*c.lit;
    } else if(c.kind === 'bat'){
      // Fledermaus: hängt kopfüber, flattert davon, kommt später zurück
      c.t += dt; c.ph += dt*0.03;
      if(c.state === 'hang'){
        if(critNearPlayer(c.x, c.y + 30, 130, 180)){ c.state = 'fly'; c.t = 0; c.vx = (Math.random() < 0.5 ? -1 : 1)*(0.12 + Math.random()*0.06); c.vy = 0.05; SFX.birdFlap(c.x); }
      } else if(c.state === 'fly'){
        c.vy -= dt*0.00012; c.x += c.vx*dt; c.y += c.vy*dt + Math.sin(c.ph)*0.6;
        if(c.t > 3500){ c.state = 'gone'; c.t = 0; }
      } else if(c.t > 9000 && !critNearPlayer(c.hx, c.hy, 700, 600)){ c.state = 'hang'; c.x = c.hx; c.y = c.hy; c.t = 0; }
    } else if(c.kind === 'sloth'){
      const near = critNearPlayer(c.x, c.y + 40, 150, 260);
      c.awake = near ? Math.min(1, c.awake + dt*0.002) : Math.max(0, c.awake - dt*0.0004);
      if(near && !c.found && c.awake > 0.8){ c.found = true; SFX.discover(c.x); }
    }
  }
}

function drawCritters(){
  if(critFor !== solids) buildCritters();
  updateCritters(Math.min(100, frameDt));
  const t = performance.now();
  for(const c of critters){
    const x = Math.round(c.x - camX);
    if(x < -60 || x > VW + 60) continue;
    ctx.save();
    if(c.kind === 'butterfly') drawButterfly(c, x, t);
    else if(c.kind === 'frog') drawFrog(c, x, t);
    else if(c.kind === 'snail') drawSnail(c, x, t);
    else if(c.kind === 'mush') drawMushroom(c, x);
    else if(c.kind === 'bud') drawBud(c, x, t);
    else if(c.kind === 'sloth') drawSloth(c, x, t);
    else if(c.kind === 'firefly') drawFirefly(c, x, t);
    else if(c.kind === 'lizard') drawLizard(c, x, t);
    else if(c.kind === 'crystal') drawCrystalCrit(c, x, t);
    else if(c.kind === 'bat'){ if(c.state !== 'gone') drawBat(c, x, t); }
    ctx.restore();
  }
}

function drawButterfly(c, x, t){
  const flap = Math.abs(Math.sin(t*0.02 + c.ph)), y = c.y;
  ctx.translate(x, y); ctx.rotate(Math.sin(t*0.003 + c.ph)*0.25); ctx.scale(1.3, 1.3);
  if(c.gold){
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
    g.addColorStop(0, 'rgba(255,230,120,0.55)'); g.addColorStop(1, 'rgba(255,230,120,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI*2); ctx.fill();
    for(let i = 0; i < 3; i++){
      const a = t*0.004 + i*2.1, rr = 12 + Math.sin(t*0.006 + i)*4;
      ctx.fillStyle = 'rgba(255,250,200,0.9)'; ctx.fillRect(Math.cos(a)*rr - 1, Math.sin(a)*rr - 1, 2, 2);
    }
  }
  for(const side of [-1, 1]){
    ctx.save(); ctx.scale(side*(0.25 + 0.75*flap), 1);
    ctx.fillStyle = c.col; ctx.strokeStyle = 'rgba(60,40,60,.5)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(5, -3, 6, 4.5, -0.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(4, 3.5, 4, 3, 0.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(6, -4, 1.4, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#3b2b2b'; ctx.beginPath(); ctx.ellipse(0, 0, 1.3, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#3b2b2b'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(-2, -8); ctx.moveTo(0, -4); ctx.lineTo(2, -8); ctx.stroke();
}
function drawFrog(c, x, t){
  const y = c.y + (c.jy || 0), croak = c.croakT && t - c.croakT < 500 ? Math.sin((t - c.croakT)/500*Math.PI) : 0;
  const breath = Math.sin(t*0.004 + c.home)*0.5;
  ctx.translate(x, y); ctx.scale(c.dir*1.35, 1.35);
  if(!c.jy){ ctx.fillStyle = 'rgba(20,40,20,.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 10, 2.5, 0, 0, Math.PI*2); ctx.fill(); }
  // Hinterbein
  ctx.fillStyle = '#4fa64a'; ctx.beginPath(); ctx.ellipse(-5, -3, 6, 4, 0, 0, Math.PI*2); ctx.fill();
  // Körper
  ctx.fillStyle = '#62c25a'; ctx.beginPath(); ctx.ellipse(0, -7 - breath*0.3, 9, 7 + breath*0.3, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#d9f5b8'; ctx.beginPath(); ctx.ellipse(2, -4 + croak, 5 + croak*2, 3.5 + croak*3, 0, 0, Math.PI*2); ctx.fill();   // Kehle (bläht sich beim Quaken)
  // Augen
  for(const ex of [-2, 5]){
    ctx.fillStyle = '#62c25a'; ctx.beginPath(); ctx.arc(ex, -13, 3.6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + 0.5, -13.5, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1d1d1d'; ctx.beginPath(); ctx.arc(ex + 1, -13.5, 1.4, 0, Math.PI*2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,120,140,.5)'; ctx.beginPath(); ctx.arc(7, -8, 1.6, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#2e6b2a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(5, -8, 2.5, 0.2, Math.PI - 0.6); ctx.stroke();
}
function drawSnail(c, x, t){
  const y = c.y, h = c.hide, stretch = Math.sin(t*0.004 + c.minX)*0.08;
  ctx.translate(x, y); ctx.scale(c.dir*1.25, 1.25);
  // Körper (zieht sich beim Verstecken ein)
  const bl = 14*(1 - h) + 4;
  ctx.fillStyle = '#e6c9a8'; ctx.beginPath(); ctx.ellipse(bl*0.3*(1 + stretch), -2.5, bl*0.75, 3, 0, 0, Math.PI*2); ctx.fill();
  if(h < 0.6){
    ctx.strokeStyle = '#d7b48e'; ctx.lineWidth = 1.4;
    for(const [ax, ay] of [[bl*0.8, -9], [bl*0.6, -8]]){ ctx.beginPath(); ctx.moveTo(bl*0.65, -3); ctx.lineTo(ax, ay*(1 - h)); ctx.stroke();
      ctx.fillStyle = '#4a3b30'; ctx.beginPath(); ctx.arc(ax, ay*(1 - h), 1.4, 0, Math.PI*2); ctx.fill(); }
  }
  // Haus mit Spirale
  ctx.fillStyle = '#c9845a'; ctx.beginPath(); ctx.arc(-1, -8, 7.5, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#8a5236'; ctx.lineWidth = 1.3; ctx.beginPath();
  for(let a = 0; a < Math.PI*4; a += 0.3){ const rr = 1 + a*0.5; ctx.lineTo(-1 + Math.cos(a)*rr, -8 + Math.sin(a)*rr); }
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(-3, -12, 2, 0, Math.PI*2); ctx.fill();
}
function drawMushroom(c, x){
  const s = c.big ? 1.25 : 1, sq = c.squish;
  ctx.translate(x, c.y + 1); ctx.scale(s*(1 + sq*0.35), s*(1 - sq*0.4));
  ctx.fillStyle = '#f3e7d3'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-3, -11, 6, 11, 2) : ctx.rect(-3, -11, 6, 11); ctx.fill();
  if(c.glowCap){   // Leuchtpilz (Nacht/Höhle)
    ctx.fillStyle = c.glowCap + '44'; ctx.beginPath(); ctx.arc(0, -12, 18, 0, Math.PI*2); ctx.fill();
  }
  const g = ctx.createRadialGradient(-3, -16, 1, 0, -12, 11);
  if(c.glowCap){ g.addColorStop(0, '#ffffff'); g.addColorStop(1, c.glowCap); }
  else { g.addColorStop(0, '#ff7a6b'); g.addColorStop(1, '#d63c3c'); }
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -11, 10, 7, 0, Math.PI, Math.PI*2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff';
  for(const [dx, dy, r] of [[-5, -13, 1.8], [1, -16, 1.6], [5, -12, 1.4], [-1, -12, 1.1]]){ ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI*2); ctx.fill(); }
}
function drawBud(c, x, t){
  const o = c.open, sway = Math.sin(t*0.002 + c.x)*0.06;
  ctx.translate(x, c.y + 1); ctx.rotate(sway);
  ctx.strokeStyle = '#3f8a4c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-2, -10, 0, -20); ctx.stroke();
  ctx.fillStyle = '#4f9b55'; ctx.beginPath(); ctx.ellipse(-5, -8, 5, 2, -0.5, 0, Math.PI*2); ctx.fill();
  ctx.translate(0, -22);
  const n = 6;
  for(let i = 0; i < n; i++){
    ctx.save(); ctx.rotate(i/n*Math.PI*2 + o*0.3);
    ctx.fillStyle = c.col; ctx.beginPath(); ctx.ellipse(0, -2 - 4*o, 2.5 + 2*o, 3 + 3*o, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = o > 0.3 ? '#ffe066' : '#5aa35a'; ctx.beginPath(); ctx.arc(0, 0, 2.5 + o, 0, Math.PI*2); ctx.fill();
  if(c.openT && t - c.openT < 700){
    const k = (t - c.openT)/700;
    ctx.globalAlpha = 1 - k; ctx.fillStyle = '#fff6c4';
    for(let i = 0; i < 5; i++){ const a = i*1.26; ctx.fillRect(Math.cos(a)*(6 + k*14) - 1, Math.sin(a)*(6 + k*14) - 1, 2, 2); }
  }
}
function drawSloth(c, x, t){
  const a = c.awake, y = c.y, swing = Math.sin(t*0.0015)*0.05;
  ctx.translate(x, y); ctx.rotate(swing); ctx.scale(1.35, 1.35);
  // Arme halten sich oben fest
  ctx.strokeStyle = '#8a6a4a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-9, 2); ctx.lineTo(-7, 18); ctx.moveTo(9, 2); ctx.lineTo(7, 18); ctx.stroke();
  // Körper
  ctx.fillStyle = '#9c7a57'; ctx.beginPath(); ctx.ellipse(0, 30, 13, 15, 0, 0, Math.PI*2); ctx.fill();
  // Gesicht
  ctx.fillStyle = '#e9d6b8'; ctx.beginPath(); ctx.ellipse(0, 34, 9, 7.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#5a3f2a';
  for(const ex of [-4, 4]){ ctx.beginPath(); ctx.ellipse(ex, 33, 3, 2, ex < 0 ? 0.4 : -0.4, 0, Math.PI*2); ctx.fill(); }
  if(a > 0.5){ ctx.fillStyle = '#fff'; for(const ex of [-4, 4]){ ctx.beginPath(); ctx.arc(ex, 33, 1.2, 0, Math.PI*2); ctx.fill(); } }
  else { ctx.strokeStyle = '#2b1d12'; ctx.lineWidth = 1; for(const ex of [-4, 4]){ ctx.beginPath(); ctx.arc(ex, 32.5, 1.6, 0.2, Math.PI - 0.2); ctx.stroke(); } }
  ctx.fillStyle = '#2b1d12'; ctx.beginPath(); ctx.ellipse(0, 36, 1.6, 1.1, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#2b1d12'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 37, 2.5, 0.3, Math.PI - 0.3); ctx.stroke();
  if(a > 0.7){   // winkt mit einem Arm
    const w = Math.sin(t*0.012)*0.6;
    ctx.save(); ctx.translate(11, 28); ctx.rotate(-1.2 + w);
    ctx.strokeStyle = '#8a6a4a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(12, 0); ctx.stroke(); ctx.restore();
  } else if(a < 0.3){  // Zzz
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = 'bold 10px sans-serif';
    const k = (t*0.0006) % 1;
    ctx.globalAlpha = 1 - k; ctx.fillText('z', 14 + k*8, 22 - k*16); ctx.globalAlpha = Math.max(0, 0.7 - k); ctx.fillText('z', 20 + k*6, 14 - k*14);
  }
}

function drawFirefly(c, x, t){
  const k = c.glow/80;
  const g = ctx.createRadialGradient(x, c.y, 0, x, c.y, 14);
  g.addColorStop(0, c.col); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.35 + 0.65*k; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, c.y, 14, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1; ctx.fillStyle = '#fffbe0'; ctx.beginPath(); ctx.arc(x, c.y, 2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.5)';
  const f = Math.abs(Math.sin(t*0.03 + c.ph));
  ctx.beginPath(); ctx.ellipse(x - 2, c.y - 2, 2.5, 1 + f, -0.5, 0, Math.PI*2); ctx.ellipse(x + 2, c.y - 2, 2.5, 1 + f, 0.5, 0, Math.PI*2); ctx.fill();
}
function drawLizard(c, x, t){
  const run = c.run > 0, wig = run ? Math.sin(t*0.05)*0.35 : Math.sin(t*0.003 + c.minX)*0.05;
  ctx.translate(x, c.y); ctx.scale(c.dir*1.2, 1.2);
  ctx.fillStyle = 'rgba(20,20,10,.18)'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 2, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = c.col; ctx.lineCap = 'round';
  // Schwanz (geschwungen)
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, -3); ctx.quadraticCurveTo(-14, -3 + wig*10, -20, 0 - wig*6); ctx.stroke();
  // Beine
  ctx.lineWidth = 2;
  for(const [lx, s] of [[-4, 1], [5, -1]]){ ctx.beginPath(); ctx.moveTo(lx, -3); ctx.lineTo(lx + s*wig*6 - 2, 0); ctx.moveTo(lx, -3); ctx.lineTo(lx - s*wig*6 + 2, 0); ctx.stroke(); }
  // Körper + Kopf
  ctx.fillStyle = c.col; ctx.beginPath(); ctx.ellipse(0, -4, 8, 3.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(9, -5, 4.5, 3, 0.15, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(1, -5.5, 5, 1, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(10.5, -6.5, 1.6, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#1d1d1d'; ctx.beginPath(); ctx.arc(11, -6.5, 0.9, 0, Math.PI*2); ctx.fill();
}
function drawCrystalCrit(c, x, t){
  const s = (c.big ? 1.1 : 0.8), l = c.lit;
  ctx.translate(x, c.y + 1);
  const g = ctx.createRadialGradient(0, -12, 0, 0, -12, 26 + 10*l);
  g.addColorStop(0, c.col + (l > 0.5 ? 'aa' : '66')); g.addColorStop(1, c.col + '00');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -12, 26 + 10*l, 0, Math.PI*2); ctx.fill();
  for(const [dx, a, len, w] of [[-5, -0.35, 16, 4], [0, 0, 24, 5], [6, 0.4, 14, 3.5]]){
    ctx.save(); ctx.translate(dx*s, 0); ctx.rotate(a); ctx.scale(s, s);
    ctx.fillStyle = c.col; ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(-w, -len*0.75); ctx.lineTo(0, -len); ctx.lineTo(w, -len*0.75); ctx.lineTo(w, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${(0.35 + 0.3*l + 0.1*Math.sin(t*0.004 + dx)).toFixed(2)})`;
    ctx.beginPath(); ctx.moveTo(-w*0.2, 0); ctx.lineTo(-w*0.2, -len*0.75); ctx.lineTo(0, -len); ctx.lineTo(w*0.5, -len*0.75); ctx.lineTo(w*0.5, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
function drawBat(c, x, t){
  ctx.translate(x, c.y);
  if(c.state === 'hang'){
    // kopfüber, Flügel eingewickelt, schaukelt leicht
    ctx.rotate(Math.sin(t*0.002 + c.ph)*0.08);
    ctx.strokeStyle = '#2a2230'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(-2, 4); ctx.moveTo(2, 0); ctx.lineTo(2, 4); ctx.stroke();
    ctx.fillStyle = '#4a3c58'; ctx.beginPath(); ctx.ellipse(0, 13, 7, 10, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#5c4c6c'; ctx.beginPath(); ctx.arc(0, 23, 5.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-4, 26); ctx.lineTo(-6, 31); ctx.lineTo(-2, 27); ctx.moveTo(4, 26); ctx.lineTo(6, 31); ctx.lineTo(2, 27); ctx.fill();
    ctx.fillStyle = '#ffd23f'; for(const ex of [-2, 2]){ ctx.beginPath(); ctx.arc(ex, 22, 1.2, 0, Math.PI*2); ctx.fill(); }
  } else {
    const f = Math.sin(t*0.035 + c.ph);
    ctx.fillStyle = '#4a3c58';
    for(const sd of [-1, 1]){
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(sd*8, -10*f, sd*16, -4*f); ctx.lineTo(sd*12, 3); ctx.lineTo(sd*8, 1); ctx.lineTo(sd*5, 4); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#5c4c6c'; ctx.beginPath(); ctx.ellipse(0, 1, 4.5, 5.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffd23f'; for(const ex of [-1.7, 1.7]){ ctx.beginPath(); ctx.arc(ex, -0.5, 1.1, 0, Math.PI*2); ctx.fill(); }
  }
}

// ---------- Dschungel-Paket D: neue Tier-Regeln (Dschungel Tag und Nacht, js/11b-dschungel-hintergrund.js) ----------
// Übernommen aus der Vorschau (dschungel-paket/referenz/tiere-platzierung.js, DK.build): deutlich weniger Tiere, nie in
// Materialien, nie in Pflanzen. Zusätzlich gelten wie bisher die Spiel-Regeln (nicht an Münzen, Stacheln, Hebeln …).
const DJT_BODEN = [['frog', 0.018], ['snail', 0.03], ['mush', 0.035], ['bud', 0.04]];   // Anteil je 40-px-Schritt
const DJT_ABSTAND_BODEN = 650;      // zwischen zwei Boden-Tieren
const DJT_ABSTAND_LAEUFER = 1400;   // Frosch zu Frosch, Schnecke zu Schnecke
const DJT_ABSTAND_FLIEGER = 800;    // Schmetterling/Glühwürmchen
const DJT_ABSTAND_SONST = 420;      // Pilz zu Pilz, Knospe zu Knospe
const DJT_FLIEGER_P = 0.07;
const DJT_ABSTAND_HAENGER = 1300;   // höchstens ein Faultier/eine Fledermaus je so viele px
const DJT_RAND = 45;                // Abstand zum Rand der Fläche
const DJT_FREI_X = 34, DJT_FREI_H = 46;   // um das Tier herum kein Block, keine Stufe
const DJT_LAUF_MIN = 70;            // Frosch/Schnecke brauchen so viel freie Laufstrecke
function buildCrittersDschungel(){
  const N = hgNacht();
  const CT = {air: N ? 'firefly' : 'butterfly', airCols: N ? ['#d8ff6a'] : ['#7ec8ff', '#ff9ecb', '#ffd166', '#b69cff'], hanging: N ? 'bat' : 'sloth', mushGlow: N};
  if(decoFor !== solids) buildDeco();   // Pflanzen zuerst (Tiere stehen in den Lücken)
  const blocked = dekoSperre();
  const frei = [...switchDefs.map(sw => [sw.x, sw.y]), ...bouncers.map(b => [b.x, b.y - 20]), ...plates.map(pl => [pl.x, pl.y])];
  const nearStart = x => Math.abs(x - levelStartM.x) < 200;
  const last = {}; let slot = 0, lastG = -1e9, lastH = -1e9, goldDone = false;
  const fest = solids.filter(o => !o.gone && o.type !== 'oneway');
  const boxFree = (x, y) => { for(const o of fest){ if(x + DJT_FREI_X > o.x && x - DJT_FREI_X < o.x + o.w && y - DJT_FREI_H < o.y + o.h && y - 2 > o.y) return false; } return true; };
  const grounds = solids.filter(s => s.type === 'ground').sort((a, b) => a.x - b.x || a.y - b.y);
  for(const s of grounds){
    for(let cx = s.x; cx < s.x + s.w; cx += 40){
      if(decoSolidAt(cx + 20, s.y - 2) || s.y < 40) continue;
      const mid = cx + 20, r = decoHash(cx + 5, s.y + 9);
      const far = k => !last[k] || Math.abs(last[k] - mid) > (k === 'fly' ? DJT_ABSTAND_FLIEGER : (k === 'frog' || k === 'snail') ? DJT_ABSTAND_LAEUFER : DJT_ABSTAND_SONST);
      if(nearStart(mid) || blocked(mid, s.y)) continue;
      let acc = 0, kind = null;
      for(const [k, w] of DJT_BODEN){ acc += w; if(r < acc){ kind = k; break; } }
      if(kind && (Math.abs(mid - lastG) < DJT_ABSTAND_BODEN || mid < s.x + DJT_RAND || mid > s.x + s.w - DJT_RAND || !boxFree(mid, s.y))) kind = null;
      if(N && kind === 'frog') kind = 'snail';   // nachts Schnecke statt Frosch
      let c = null;
      if(kind === 'frog' && far('frog')){ last.frog = mid;
        c = {kind: 'frog', x: mid, y: s.y, home: mid, minX: s.x + 10, maxX: s.x + s.w - 10, dir: r < 0.035 ? -1 : 1, hop: null, t: Math.random()*5000, nextCroak: 3 + Math.random()*8};
      } else if(kind === 'snail' && far('snail') && s.w >= 120){ last.snail = mid;
        c = {kind: 'snail', x: mid, y: s.y, minX: s.x + 8, maxX: s.x + s.w - 8, dir: 1, hide: 0};
      } else if(kind === 'mush' && far('mush')){ last.mush = mid;
        c = {kind: 'mush', x: mid + (r*40 % 14) - 7, y: s.y, squish: 0, lastT: 0, big: r*7 % 1 < 0.5,
             glowCap: CT.mushGlow ? (r*13 % 1 < 0.5 ? '#6af0ff' : '#c08aff') : null, glow: CT.mushGlow ? 60 : 0};
      } else if(kind === 'bud' && far('bud')){ last.bud = mid;
        c = {kind: 'bud', x: mid, y: s.y, open: 0, target: 0, col: r*7 % 1 < 0.5 ? '#ff7eb0' : '#ffb347'};
      }
      if(c){ critters.push(c); lastG = mid; c.pl = [s.x + DJT_RAND, s.x + s.w - DJT_RAND]; }
      // Schmetterling (nachts Glühwürmchen): selten, nur wo darüber nichts im Weg ist; wie bisher EIN goldener je Level
      const rb = decoHash(cx + 77, s.y + 31);
      if(rb < DJT_FLIEGER_P && far('fly') && !decoSolidAt(mid, s.y - 50) && !decoSolidAt(mid - 30, s.y - 50) && !decoSolidAt(mid + 30, s.y - 50)){
        last.fly = mid;
        const gold = !goldDone && rb > 0.05 && mid > levelStartM.x + 800;
        if(gold) goldDone = true;
        const air = gold ? 'butterfly' : CT.air;
        critters.push({kind: air, hx: mid, hy: s.y - 50, x: mid, y: s.y - 50, ph: r*100, flee: 0, gold, found: false,
                       glow: air === 'firefly' ? 70 : 0, col: gold ? '#ffd23f' : CT.airCols[Math.floor(rb*1000) % CT.airCols.length]});
      }
    }
    // Faultier bzw. Fledermaus unter schwebendem Boden: höchstens eins je DJT_ABSTAND_HAENGER px
    if(slot < 8 && s.w >= 120 && s.y > 120 && s.y + s.h + 90 < LEVEL_H){
      const ux = s.x + s.w*0.5;
      if(Math.abs(ux - lastH) > DJT_ABSTAND_HAENGER && !decoSolidAt(ux, s.y + s.h + 4) && !decoSolidAt(ux, s.y + s.h + 70) && decoHash(s.x, s.y) < 0.5 && !blocked(ux, s.y + s.h + 60)){
        slot++; lastH = ux;
        critters.push(CT.hanging === 'bat' ? {kind: 'bat', x: ux, y: s.y + s.h, hx: ux, hy: s.y + s.h, state: 'hang', t: 0, vx: 0, vy: 0, ph: Math.random()*9}
                                          : {kind: 'sloth', x: ux, y: s.y + s.h, awake: 0, wave: 0, found: false});
      }
    }
  }
  // Pflanzen am Boden (Farn/großes Blatt wie die Agaven der Vorschau, Blüten, nachts Leuchtpflanzen): Tiere nur in den
  // Lücken; steht eins ungünstig, rückt es zur nächsten freien Stelle derselben Fläche, sonst entfällt es. Gras zählt nicht.
  const decor = [];
  for(const pl of decoPlants){ if(pl.kind === 0 || pl.kind === 4) decor.push({x: pl.x, y: pl.y - 7, r: 36}); else if(pl.kind === 2 || pl.kind === 3) decor.push({x: pl.x, y: pl.y - 7, r: 24}); }
  if(N) for(const p of hgLeuchtpflanzen()) decor.push({x: p.wx, y: p.wy, r: 58});
  const bad = (x, y, r0) => decor.some(d => Math.abs(d.x - x) < d.r + r0 && Math.abs(d.y - y) < 70);
  for(const c of critters){
    if(!c.pl || !bad(c.x, c.y, 16)) continue;
    let ok = false;
    for(let d = 50; d <= 450 && !ok; d += 40) for(const sd of [1, -1]){
      const nx = c.x + sd*d;
      if(nx < c.pl[0] || nx > c.pl[1] || bad(nx, c.y, 16) || !boxFree(nx, c.y) || blocked(nx, c.y) || critters.some(o => o !== c && o.pl && Math.abs(o.x - nx) < 400 && Math.abs(o.y - c.y) < 80)) continue;
      const dx = nx - c.x; c.x = nx; if(c.home !== undefined) c.home = nx; if(c.minX !== undefined){ c.minX += dx; c.maxX += dx; }
      ok = true; break;
    }
    if(!ok) c.drop = true;
  }
  critters = critters.filter(c => !c.drop);
  // Läufer (Frosch, Schnecke) bleiben auf freier Strecke: nie durch Stufen/Blöcke oder Pflanzen, nie in die freie Zone
  // um Hebel/Pilze/Druckplatten (wie bisher)
  for(const c of critters){
    if(c.minX === undefined) continue;
    let lo = c.x, hi = c.x;
    while(lo > c.minX && !decoSolidAt(lo - 8, c.y - 6) && !bad(lo - 8, c.y, 14)) lo -= 8;
    while(hi < c.maxX && !decoSolidAt(hi + 8, c.y - 6) && !bad(hi + 8, c.y, 14)) hi += 8;
    c.minX = Math.max(c.minX, lo + 6); c.maxX = Math.min(c.maxX, hi - 6);
    for(const [kx, ky] of frei){
      if(ky < c.y - 120 || ky > c.y + 40) continue;
      if(kx >= c.x) c.maxX = Math.min(c.maxX, kx - DEKO_FREI_ABSTAND); else c.minX = Math.max(c.minX, kx + DEKO_FREI_ABSTAND);
    }
    if(c.minX > c.maxX) c.minX = c.maxX = c.x;
  }
  critters = critters.filter(c => !(c.minX !== undefined && c.maxX - c.minX < DJT_LAUF_MIN));
}
// Nacht: Frosch, Schnecke, Knospe, Pilz und Eulen-Augen leuchten sanft (Vorschau: DK.glow) – nach den Tieren gezeichnet
function tierLeuchtenNacht(){
  if(typeof hgNacht !== 'function' || !hgNacht() || !hgTierRegeln()) return;
  const g2 = ctx; g2.save(); g2.globalCompositeOperation = 'lighter';
  const halo = (x, y, r, col, a) => { const q = g2.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, 'rgba(' + col + ',' + a + ')'); q.addColorStop(1, 'rgba(' + col + ',0)'); g2.fillStyle = q; g2.fillRect(x - r, y - r, 2*r, 2*r); };
  const dot = (x, y, r, col, a) => { g2.fillStyle = 'rgba(' + col + ',' + a + ')'; g2.beginPath(); g2.arc(x, y, r, 0, 7); g2.fill(); };
  for(const c of critters){
    const x = Math.round(c.x - camX);
    if(x < -60 || x > VW + 60) continue;
    if(c.kind === 'frog'){ const s = 1.35*c.dir, y = c.y + (c.jy || 0); halo(x, y - 8, 22, '110,255,230', 0.16); [[-3, -11], [1, -13], [4, -10], [-6, -8]].forEach(([a, b]) => dot(x + a*s, y + b*1.35, 1.5, '140,255,235', 0.8)); }
    else if(c.kind === 'snail'){
      const s = 1.25*c.dir; halo(x - 1*s, c.y - 10, 18, '110,230,255', 0.2);
      g2.strokeStyle = 'rgba(160,250,255,.6)'; g2.lineWidth = 1.1; g2.beginPath();
      for(let a = 0; a < Math.PI*4; a += 0.3){ const rr = 1 + a*0.5; g2.lineTo(x + (-1 + Math.cos(a)*rr)*s, c.y + (-8 + Math.sin(a)*rr)*1.25); }
      g2.stroke();
    }
    else if(c.kind === 'bud') halo(x, c.y - 22, 24, c.col.replace('#', '').match(/../g).map(h => parseInt(h, 16)).join(','), 0.22);
    else if(c.kind === 'mush' && c.glowCap) halo(x, c.y - 12, 42, c.glowCap === '#6af0ff' ? '106,240,255' : '192,138,255', 0.2);
  }
  for(const b of birds){
    if(b.state === 'gone' || !b.pal.owl) continue;
    const x = b.x - camX; if(x < -40 || x > VW + 40) continue;
    halo(x + 6*b.dir, b.y - 16, 10, '255,215,90', 0.18);
  }
  g2.restore();
}

// ---------- Dezente Tiere im Hintergrund (Vorschau: BA.*) – unscharf wie ihre Umgebung ----------
// Schnecken klettern den Baumstamm hoch, ferne Schmetterlinge (nachts Nachtfalter), nachts Fledermäuse weit hinten oben.
// Keine Schlangen, keine Geckos. Die Vorschau zeichnet jedes Tier pro Bild in eine kleine Fläche und blendet es weich
// ein (Weichzeichner pro Bild); hier sind die Bilder EINMAL weich vorgezeichnet (Flügelschlag in Stufen) und werden pro
// Bild nur noch gesetzt (Weichzeichner sparsam, Nutzerwunsch).
const DJT_HG = {};
const DJT_FLUEGEL_STUFEN = 8;
// Bild w×h (Einheiten) mit Mittelpunkt in der Mitte: scharf zeichnen, einmal weich machen
function djtWeich(w, h, blur, zeichnen){
  const k = 0.85, pad = Math.ceil(blur*3), cw = Math.ceil((w + 2*pad)*k), ch = Math.ceil((h + 2*pad)*k);
  const a = document.createElement('canvas'); a.width = cw; a.height = ch;
  const q = a.getContext('2d'); q.setTransform(k, 0, 0, k, cw/2, ch/2); zeichnen(q);
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const z = c.getContext('2d'); if('filter' in z) z.filter = 'blur(' + (blur*k) + 'px)'; z.drawImage(a, 0, 0);
  return {c, w: cw/k, h: ch/k};
}
function djtSchneckeBild(N){
  const key = 'schnecke' + (N ? 'N' : '');
  if(DJT_HG[key]) return DJT_HG[key];
  return DJT_HG[key] = djtWeich(64, 64, 3.5, g => {
    g.rotate(-Math.PI/2); g.scale(1.7, 1.7);
    g.fillStyle = N ? 'rgba(24,76,84,.95)' : 'rgba(190,160,126,.9)'; g.beginPath(); g.ellipse(3, -2.5, 11, 3, 0, 0, 7); g.fill();
    g.strokeStyle = g.fillStyle; g.lineWidth = 1.2;
    for(const [ax, ay] of [[12, -9], [9, -8]]){ g.beginPath(); g.moveTo(9, -3); g.lineTo(ax, ay); g.stroke(); }
    g.fillStyle = N ? 'rgba(30,96,108,.95)' : 'rgba(168,96,58,.92)'; g.beginPath(); g.arc(-1, -8, 7.5, 0, 7); g.fill();
    g.strokeStyle = N ? 'rgba(140,250,255,.8)' : 'rgba(110,64,40,.8)'; g.lineWidth = 1.1; g.beginPath();
    for(let a = 0; a < Math.PI*4; a += 0.3){ const rr = 1 + a*0.5; g.lineTo(-1 + Math.cos(a)*rr, -8 + Math.sin(a)*rr); }
    g.stroke();
    if(N){ g.globalCompositeOperation = 'lighter'; const q = g.createRadialGradient(-1, -8, 0, -1, -8, 22); q.addColorStop(0, 'rgba(110,235,255,.3)'); q.addColorStop(1, 'rgba(110,235,255,0)'); g.fillStyle = q; g.fillRect(-24, -30, 48, 44); }
  });
}
function djtFalterBild(N, farbe, stufe){
  const key = 'falter' + (N ? 'N' : farbe) + ':' + stufe;
  if(DJT_HG[key]) return DJT_HG[key];
  const fl = stufe/(DJT_FLUEGEL_STUFEN - 1);
  return DJT_HG[key] = djtWeich(60, 60, 1.4, g => {
    if(N){ g.globalCompositeOperation = 'lighter'; const q = g.createRadialGradient(0, 0, 0, 0, 0, 26); q.addColorStop(0, 'rgba(170,250,255,.22)'); q.addColorStop(1, 'rgba(170,250,255,0)'); g.fillStyle = q; g.fillRect(-26, -26, 52, 52); g.globalCompositeOperation = 'source-over'; }
    g.globalAlpha = N ? 0.8 : 0.7;
    for(const sd of [-1, 1]){
      g.save(); g.scale(sd*(0.25 + 0.75*fl), 1); g.fillStyle = N ? 'rgba(200,250,255,.9)' : farbe;
      g.beginPath(); g.ellipse(4, -2, 5, 3.4, -0.5, 0, 7); g.fill(); g.beginPath(); g.ellipse(3, 2.5, 3.2, 2.4, 0.5, 0, 7); g.fill(); g.restore();
    }
    g.fillStyle = N ? 'rgba(230,255,255,.9)' : 'rgba(60,45,45,.8)'; g.beginPath(); g.ellipse(0, 0, 1, 3.6, 0, 0, 7); g.fill();
  });
}
function djtFledermausBild(stufe){
  const key = 'fledermaus:' + stufe;
  if(DJT_HG[key]) return DJT_HG[key];
  const f = -1 + 2*stufe/(DJT_FLUEGEL_STUFEN - 1);
  return DJT_HG[key] = djtWeich(60, 52, 2.4, g => {
    g.scale(1.3, 1.3); g.fillStyle = 'rgba(8,20,48,.9)';
    for(const sd of [-1, 1]){ g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(sd*8, -9*f - 2, sd*17, -3*f); g.lineTo(sd*12, 3); g.lineTo(sd*8, 1); g.lineTo(sd*5, 4); g.closePath(); g.fill(); }
    g.beginPath(); g.ellipse(0, 1, 4, 5, 0, 0, 7); g.fill();
    g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,215,90,.9)'; g.beginPath(); g.arc(-1.6, -0.5, 1, 0, 7); g.arc(1.6, -0.5, 1, 0, 7); g.fill();
  });
}
function djtSetzen(B, x, y, rot){
  if(rot){ ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(B.c, -B.w/2, -B.h/2, B.w, B.h); ctx.restore(); }
  else ctx.drawImage(B.c, x - B.w/2, y - B.h/2, B.w, B.h);
}
// Schnecken kriechen senkrecht den Stamm hoch (Start knapp über dem Boden) – nach den Stämmen gezeichnet
function djHgTiereStamm(t, N){
  if(!hgTierRegeln()) return;
  djEinheiten();
  const off = camX*0.38*DJ_PAR_K, PT = 2600, B = djtSchneckeBild(N);
  for(const [x0, fl, per, so, dx] of [[800, 1, 90, 0, 60], [800, 1, 120, 50, -70], [1950, -1, 100, 20, 50]]){
    const u = ((t + so) % per)/per; if(u > 0.8) continue;
    const y = 618 - (u/0.8)*560, x = ((x0 - off) % PT + PT) % PT;
    for(const xx of [x, x - PT]){ if(xx < -300 || xx > VW + 300) continue; djtSetzen(B, xx + dx*fl + Math.sin(y*0.03)*5, y, 0); }
  }
}
// ferne Schmetterlinge (nachts Nachtfalter) – nach der mittleren Ebene
function djHgTiereFliegen(t, N){
  if(!hgTierRegeln()) return;
  djEinheiten();
  const off = camX*0.45*DJ_PAR_K, cols = ['#ffd166', '#ff9ecb', '#7ec8ff', '#b69cff'];
  for(let i = 0; i < 8; i++){
    const ph = i*1.9, bx = i*DJ_PER/8 + 120, x = (((bx - off) + Math.sin(t*0.22 + ph)*150) % DJ_PER + DJ_PER) % DJ_PER,
          y = -50 + ((i*97) % 520) + Math.sin(t*0.5 + ph)*46, fl = Math.abs(Math.sin(t*(N ? 7 : 9) + ph));
    const B = djtFalterBild(N, cols[i % 4], Math.round(fl*(DJT_FLUEGEL_STUFEN - 1)));
    for(const xx of [x, x - DJ_PER]){ if(xx < -30 || xx > VW + 30) continue; djtSetzen(B, xx, y, Math.sin(t*0.8 + ph)*0.3); }
  }
}
// nachts Fledermäuse weit hinten im oberen Bereich – nach der fernsten Ebene
function djHgTiereHimmel(t){
  if(!hgTierRegeln()) return;
  djEinheiten();
  const Y0 = DJ_BASE - H/zoom, off = camX*0.12*DJ_PAR_K;
  for(let i = 0; i < 5; i++){
    const sp = 20 + i*6, y = Y0 + 50 + ((i*83) % 230) + Math.sin(t*0.6 + i)*10, xb = (((i*DJ_PER/5 + t*sp) - off) % DJ_PER + DJ_PER) % DJ_PER - 60,
          f = Math.sin(t*9 + i*2.3), B = djtFledermausBild(Math.round((f + 1)/2*(DJT_FLUEGEL_STUFEN - 1)));
    for(const xx of [xb, xb - DJ_PER]){ if(xx < -60 || xx > VW + 60) continue; djtSetzen(B, xx, y, 0); }
  }
}
