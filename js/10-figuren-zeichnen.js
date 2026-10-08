// 10-figuren-zeichnen.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

function roundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

// Schleife für Spielerin 2 (lokale Koordinaten, dreht mit dem Kopf mit)
function drawBow(x, y, r){
  ctx.save();
  ctx.translate(x, y); ctx.rotate(-0.35);
  const loop = (dir)=>{
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.bezierCurveTo(dir*r*0.6, -r*0.9, dir*r*1.35, -r*0.55, dir*r*1.2, 0);
    ctx.bezierCurveTo(dir*r*1.35, r*0.55, dir*r*0.6, r*0.9, 0, 0);
    ctx.closePath();
    ctx.fillStyle = '#ff7eb0'; ctx.fill();
    ctx.strokeStyle = '#c94d82'; ctx.lineWidth = 1.2; ctx.stroke();
    // Glanz
    ctx.fillStyle = 'rgba(255,255,255,.45)';
    ctx.beginPath(); ctx.ellipse(dir*r*0.7, -r*0.25, r*0.22, r*0.12, dir*0.4, 0, Math.PI*2); ctx.fill();
  };
  loop(-1); loop(1);
  ctx.fillStyle = '#e8588f';
  ctx.beginPath(); ctx.arc(0,0,r*0.32,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#c94d82'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}

// Segelschirm: runder Stoffschirm mit Bogenkante, Streifen, Speichen, Griff; klappt weich auf und schwingt mit
function drawUmbrella(player, px, py){
  const u = player.umbrella;                  // 0 = zu, 1 = ganz offen
  const t = performance.now()*0.004;
  const tilt = Math.max(-0.4, Math.min(0.4, -player.vx*0.05)) + Math.sin(t)*0.05*u;
  const R = 36, ry = 22;                      // Radius / Höhe der Kuppel
  const handX = px + player.facing*5, handY = py - player.h*0.5 - 20;
  const stick = 30;
  ctx.save();
  ctx.translate(handX, handY);
  ctx.rotate(tilt);
  ctx.globalAlpha = Math.min(1, u*1.4);

  // Griff (Stock mit gebogenem Ende)
  ctx.strokeStyle = '#7a4a2e'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -stick); ctx.lineTo(0, 0);
  ctx.arc(-4, 0, 4, 0, Math.PI*0.9); ctx.stroke();

  ctx.translate(0, -stick);
  ctx.scale(0.3 + 0.7*u, 0.45 + 0.55*u);
  const N = 6;
  const rim = i => -R + (2*R*i)/N;
  // Kuppel mit Bogenkante unten
  const canopy = ()=>{
    ctx.beginPath();
    ctx.moveTo(-R, 0);
    ctx.ellipse(0, 0, R, ry, 0, Math.PI, 2*Math.PI);
    for(let i=N; i>0; i--){
      const x0 = rim(i), x1 = rim(i-1);
      ctx.quadraticCurveTo((x0+x1)/2, -ry*0.2, x1, 0);
    }
    ctx.closePath();
  };
  // Schatten unter dem Schirm
  ctx.fillStyle = 'rgba(40,20,30,.12)';
  ctx.beginPath(); ctx.ellipse(0, 3, R*0.95, 5, 0, 0, Math.PI*2); ctx.fill();

  ctx.save();
  canopy(); ctx.clip();
  const g = ctx.createLinearGradient(0, -ry, 0, 2);
  g.addColorStop(0, '#ffb3d0'); g.addColorStop(1, '#f06b9f');
  ctx.fillStyle = g; ctx.fillRect(-R-2, -ry-2, 2*R+4, ry+6);
  // helle Streifen jede zweite Bahn
  ctx.fillStyle = 'rgba(255,248,250,.85)';
  for(let i=0; i<N; i+=2){
    ctx.beginPath(); ctx.moveTo(0, -ry-1); ctx.lineTo(rim(i), 1); ctx.lineTo(rim(i+1), 1); ctx.closePath(); ctx.fill();
  }
  // Speichen
  ctx.strokeStyle = 'rgba(170,60,105,.45)'; ctx.lineWidth = 1;
  for(let i=1; i<N; i++){ ctx.beginPath(); ctx.moveTo(0, -ry); ctx.quadraticCurveTo(rim(i)*0.75, -ry*0.75, rim(i), 0); ctx.stroke(); }
  // Glanzlicht
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.beginPath(); ctx.ellipse(-R*0.38, -ry*0.62, R*0.28, ry*0.16, -0.35, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  canopy();
  ctx.strokeStyle = '#c94d82'; ctx.lineWidth = 1.6; ctx.stroke();
  // Speichen-Enden und Spitze
  ctx.fillStyle = '#c94d82';
  for(let i=0; i<=N; i++){ ctx.beginPath(); ctx.arc(rim(i), 0, 1.6, 0, Math.PI*2); ctx.fill(); }
  ctx.beginPath(); ctx.arc(0, -ry-2.5, 3, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

// ---------- Arme, Hände, Beine, Füße (Nutzerwunsch) ----------
const CHAR_BODY_SIZE = 38;     // Breite des Gesichts-Körpers (px)
const CHAR_LEG = 8;            // so hoch stehen die Beine unter dem Körper (px)
const IDLE_FRONT_STEPS = 300;  // 5 Spielsekunden still stehen -> nach vorn drehen und winken/tanzen
const LIMB_COL = {m: {limb:'#8a5530', end:'#f1c9a0', line:'#4a2a14'}, f: {limb:'#f7a6c2', end:'#e9739c', line:'#b84a74'}};
// Haltung: view 'side' (seitlich, in Laufrichtung) oder 'front' (zum Spieler gedreht); anim = walk/stand/air/hook/umbrella/wave/dance
function charPose(player){
  const t = performance.now();
  if(won) return {view:'front', anim:'dance', t};
  if(player.hookAttached) return {view:'side', anim:'hook', t};
  if(!player.male && player.umbrella > 0.05) return {view:'side', anim:'umbrella', t};
  if(!player.grounded) return {view:'side', anim:'air', t};
  const idle = player.idleSteps || 0;
  if(idle >= IDLE_FRONT_STEPS){
    // im Wechsel je 3 s winken und tanzen; das Schweinchen fängt mit Tanzen an
    const k = Math.floor((idle - IDLE_FRONT_STEPS) / 180) + (player.male ? 0 : 1);
    return {view:'front', anim: k % 2 ? 'dance' : 'wave', t};
  }
  if(Math.abs(player.vx) > 0.3) return {view:'side', anim:'walk', t};
  return {view:'side', anim:'stand', t};
}
// liefert die Glieder als Linien Schulter/Hüfte -> Hand/Fuß. Alle werden HINTER dem Körper gezeichnet (Arme schauen
// seitlich hervor, Füße unten); "back" = Seite weg von der Laufrichtung (etwas dunkler)
function limbLayout(player, pose, H2){
  const f = player.facing || 1, ph = player.walkPhase || 0, t = pose.t;
  const hipY = H2 - CHAR_LEG - 4, footY = H2, shY = -1, SX = 15;
  const leg = (x0, x1, lift) => ({kind:'leg', x0, y0:hipY, x1, y1:footY - (lift||0)});
  const arm = (x0, x1, y1) => ({kind:'arm', x0, y0:shY, x1, y1});
  if(pose.view === 'front'){
    const legs = [leg(-6, -8), leg(6, 8)];
    if(pose.anim === 'wave'){
      const w = Math.sin(t*0.014)*5;
      return {back: [], front: [...legs, arm(-SX, -22, 9), arm(SX, 24 + w, -22)]};   // rechte Hand winkt über dem Kopf
    }
    const a = Math.sin(t*0.009);                                                       // tanzen: Arme im Wechsel hoch
    return {back: [], front: [...legs, arm(-SX, -24, a > 0 ? -20 : 8), arm(SX, 24, a > 0 ? 8 : -20)]};
  }
  // seitlich: Beine treten in Laufrichtung, Arme schwingen gegengleich; Körper ist leicht gedreht (schmaler)
  let b = [], fr = [];
  if(pose.anim === 'walk'){
    const sn = Math.sin(ph), cs = Math.cos(ph);
    b = [leg(-f*5, -f*5 + sn*5*f, Math.max(0, -cs)*3), arm(-f*SX, -f*(SX + 6) - sn*5*f, 8)];
    fr = [leg(f*5, f*5 - sn*5*f, Math.max(0, cs)*3), arm(f*SX, f*(SX + 6) + sn*5*f, 8)];
  } else if(pose.anim === 'air'){
    const up = player.vy < 0 ? 3 : 0;
    b = [leg(-f*5, -f*7, 3 + up), arm(-f*SX, -f*24, -10)];
    fr = [leg(f*5, f*9, 2 + up), arm(f*SX, f*25, -12)];
  } else if(pose.anim === 'hook'){
    b = [leg(-f*5, -f*6, 2), arm(-f*SX, -f*21, 7)];
    fr = [leg(f*5, f*7, 3), arm(f*SX, f*13, -27)];                                   // hält das Seil über dem Kopf
  } else if(pose.anim === 'umbrella'){
    b = [leg(-f*5, -f*6, 1), arm(-f*SX, -f*21, 6)];
    fr = [leg(f*5, f*6, 2), arm(f*SX, f*9, -22)];                                    // hält den Schirm (Griff über dem Kopf)
  } else {                                                                           // stehen
    b = [leg(-f*5, -f*6), arm(-f*SX, -f*20, 9)];
    fr = [leg(f*5, f*7), arm(f*SX, f*21, 9)];
  }
  return {back: b, front: fr};
}
function drawLimb(p, player, isBack){
  const c = LIMB_COL[player.male ? 'm' : 'f'];
  ctx.save();
  if(isBack) ctx.globalAlpha = 0.85;
  ctx.lineCap = 'round';
  ctx.strokeStyle = c.line; ctx.lineWidth = p.kind === 'leg' ? 5.6 : 4.6;
  ctx.beginPath(); ctx.moveTo(p.x0, p.y0); ctx.lineTo(p.x1, p.y1); ctx.stroke();
  ctx.strokeStyle = isBack ? shadeHex(c.limb, -0.18) : c.limb; ctx.lineWidth = p.kind === 'leg' ? 3.8 : 3;
  ctx.beginPath(); ctx.moveTo(p.x0, p.y0); ctx.lineTo(p.x1, p.y1); ctx.stroke();
  ctx.fillStyle = isBack ? shadeHex(c.end, -0.15) : c.end; ctx.strokeStyle = c.line; ctx.lineWidth = 1;
  ctx.beginPath();
  if(p.kind === 'leg'){ const dir = Math.sign(p.x1 - p.x0) || (player.facing || 1); ctx.ellipse(p.x1 + dir*1.5, p.y1 - 1.6, 3.8, 2.3, 0, 0, Math.PI*2); }
  else ctx.arc(p.x1, p.y1, 2.8, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();
  ctx.restore();
}
function shadeHex(hex, k){
  const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v*(1 + k))));
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join('');
}

function drawCharacter(player, camX){
  if(deathState && player === deathState.victim) return; // verpufft
  // auf ganze Pixel runden: Figur, Boden und Kamera liegen im selben Raster -> kein Zittern gegeneinander
  const px = Math.round(player.x - camX), py = Math.round(player.y);
  // Zwinkern: kurz (ca. 0,13 s) das Bild mit geschlossenen Augen zeigen, alle paar Sekunden
  const blinking = player.blink < 130;
  const img = player.male ? (blinking ? ASSETS.monkeyBlink : ASSETS.monkey)
                          : (blinking ? ASSETS.pigBlink : ASSETS.pig); // Spielerin 2 = pinkes Schweinchen

  ctx.save();
  ctx.translate(px, py - player.h*0.5);

  // Schatten nur, wenn der Charakter auf dem Boden steht (nicht beim Springen/Segeln)
  if(player.grounded){
    ctx.fillStyle = 'rgba(20,30,15,.22)';
    ctx.beginPath(); ctx.ellipse(0, player.h*0.5+3, player.w*0.55, 5, 0,0,Math.PI*2); ctx.fill();
  }

  // sehr leichtes Stauchen/Strecken abhängig von der Vertikalgeschwindigkeit (rein optisch)
  const squashY = 1 - Math.min(0.05, Math.abs(player.vy)*0.0025);
  const squashX = 1 + (1-squashY)*0.6;
  // dazu Landen/Absprung/Atmen (21-figuren-leben.js), an den Füßen verankert
  const [lx, ly] = typeof charSquash === 'function' ? charSquash(player) : [1, 1];
  ctx.translate(0, player.h*0.5); ctx.scale(squashX*lx, squashY*ly); ctx.translate(0, -player.h*0.5);

  // Rollrotation abhängig von der zurückgelegten Strecke (wie ein rollender Ball)
  let wob = 0;
  if(deathState && deathState.phrase && player === deathState.other){
    // genervtes Kopfschütteln
    const a = (performance.now() - deathState.t0);
    wob = Math.sin(a*0.03) * 0.18 * Math.max(0.25, 1 - a/1500);
  }
  // Hebel-Animation: Figur lehnt sich kurz Richtung Hebel und "drückt" ihn
  let lean = 0;
  if(player.leverAnim){
    const k = (performance.now() - player.leverAnim.t0) / 320;
    if(k < 1){ const e = Math.sin(k*Math.PI); lean = player.leverAnim.dir * 0.45 * e; ctx.translate(player.leverAnim.dir*6*e, -3*e); }
    else player.leverAnim = null;
  }
  // Siegestanz (21-figuren-leben.js): hüpfen, wippen, drehen – nur Anzeige
  if(won && typeof danceMove === 'function'){
    const d = danceMove(player);
    ctx.translate(0, d.dy); ctx.rotate(d.rot); ctx.scale(d.sx, d.sy);
  }
  ctx.rotate(wob + lean);   // (früher rollte die Figur wie ein Ball – jetzt läuft sie auf Beinen)

  const pose = charPose(player);
  if(pose.anim === 'dance') ctx.translate(0, -Math.abs(Math.sin(pose.t*0.009))*4);   // kleine Hüpfer beim Tanzen
  const H2 = player.h*0.5;                     // Füße bei y = H2 (Boden), Mitte der Figur bei 0
  const L = limbLayout(player, pose, H2);
  for(const part of L.back) drawLimb(part, player, true);    // Arme/Beine hinter dem Körper (abgewandte Seite dunkler)
  for(const part of L.front) drawLimb(part, player, false);
  const size = CHAR_BODY_SIZE;
  if(img && img.complete && img.naturalWidth){
    // Körper = Gesicht im echten Seitenverhältnis (308 × 257), sitzt auf den Beinen; seitlich etwas schmaler (gedreht)
    const hgt = size * img.naturalHeight / img.naturalWidth;
    ctx.save();
    if(pose.view === 'side'){ ctx.translate(player.facing*1.5, 0); ctx.scale(0.9, 1); }
    ctx.drawImage(img, -size/2, H2 - CHAR_LEG - hgt, size, hgt);
    ctx.restore();
  } else {
    ctx.fillStyle = player.male ? colorOf('--p1-accent') : colorOf('--p2-accent');
    ctx.beginPath(); ctx.arc(0,0,size*0.4,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();

  if(player.male && player.hookAttached){
    // gedehntes Seil: wird dünner, färbt sich orange-rot und zittert
    const st = Math.min(1, (player.ropeStretch||0) / ROPE_SNAP_STRETCH);
    ctx.strokeStyle = st > 0.05 ? `rgb(${Math.round(60+st*172)},${Math.round(110-st*60)},${Math.round(190-st*160)})` : colorOf('--rope');
    ctx.lineWidth = 2.4 - st*1.2;
    const jit = st > 0.3 ? (Math.random()-0.5)*st*3 : 0;
    ctx.beginPath();
    ctx.moveTo(px, py-player.h*0.6);
    ctx.lineTo((px + player.anchor.x-camX)/2 + jit, (py-player.h*0.6 + player.anchor.y)/2 + jit);
    ctx.lineTo(player.anchor.x-camX, player.anchor.y);
    ctx.stroke();
  }
  if(!player.male && player.umbrella > 0.02) drawUmbrella(player, px, py);
}
