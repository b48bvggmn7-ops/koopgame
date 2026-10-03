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
  ctx.scale(squashX, squashY);

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
  ctx.rotate((deathState && player === deathState.other ? 0 : (lean ? 0 : player.rollAngle)) + wob + lean);

  const size = Math.max(player.w, player.h)*1.55;
  if(img && img.complete && img.naturalWidth){
    ctx.drawImage(img, -size/2, -size/2, size, size);
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
