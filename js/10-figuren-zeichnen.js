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
// o (optional, Dschungel-Neu: Schirm-Trampolin, js/34): {u (offen 0…1), hand: [x, y], stick, tilt, quetsch (Kuppel gibt nach 0…1)}
function drawUmbrella(player, px, py, o){
  const u = o ? o.u : player.umbrella;        // 0 = zu, 1 = ganz offen
  const t = performance.now()*0.004;
  const tilt = o ? (o.tilt || 0) : Math.max(-0.4, Math.min(0.4, -player.vx*0.05)) + Math.sin(t)*0.05*u;
  const R = 36, ry = 22*(1 - 0.35*((o && o.quetsch) || 0));   // Radius / Höhe der Kuppel (gibt beim Trampolin nach)
  const handX = o ? o.hand[0] : px + player.facing*5, handY = o ? o.hand[1] : py - player.h*0.5 - 20;
  const stick = o ? o.stick : 30;
  ctx.save();
  ctx.translate(handX, handY);
  ctx.rotate(tilt);
  ctx.globalAlpha = Math.min(1, u*1.4);

  // Griff (Stock mit gebogenem Ende)
  ctx.strokeStyle = '#7a4a2e'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -stick); ctx.lineTo(0, 0);
  if(!(o && o.haende)) ctx.arc(-4, 0, 4, 0, Math.PI*0.9);   // Trampolin: kein Haken-Griff (die Pfoten halten den Stock), Schirm bleibt mittig
  ctx.stroke();

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
  // Schatten unter dem Schirm (nicht beim Trampolin: dort sah der dunkle Streifen unter der Kuppel komisch aus – Nutzer)
  if(!(o && o.haende)){
    ctx.fillStyle = 'rgba(40,20,30,.12)';
    ctx.beginPath(); ctx.ellipse(0, 3, R*0.95, 5, 0, 0, Math.PI*2); ctx.fill();
  }

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
  if(o && o.haende) schirmHaende(handX, handY, o.haende);
}
// Schirm-Trampolin (Nutzerwunsch „mit beiden Händen halten“): zwei Ärmchen von den Kopfseiten hinauf, beide Pfoten fest am
// Stock (übereinander); h = {schulter: [dx, dy] relativ zur Hand, farbe, rand}
function schirmHaende(hx, hy, h){
  const [sx, sy] = h.schulter;
  ctx.save(); ctx.lineCap = 'round';
  for(const seite of [-1, 1]){
    const px = hx, py = hy + (seite < 0 ? 1 : -4);   // linke Pfote unten, rechte knapp darüber (kurzer Stock)
    ctx.strokeStyle = h.rand; ctx.lineWidth = 8.5;
    ctx.beginPath(); ctx.moveTo(hx + seite*sx, hy + sy); ctx.quadraticCurveTo(hx + seite*sx*1.15, py + (sy - (py - hy))*0.35, px + seite*3, py); ctx.stroke();
    ctx.strokeStyle = h.farbe; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(hx + seite*sx, hy + sy); ctx.quadraticCurveTo(hx + seite*sx*1.15, py + (sy - (py - hy))*0.35, px + seite*3, py); ctx.stroke();
  }
  for(const py of [hy + 1, hy - 4]){   // Pfoten um den Stock
    ctx.fillStyle = h.farbe; ctx.strokeStyle = h.rand; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(hx, py, 5.2, 4.2, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

// Mitte des runden Kopfes im Figurenbild (Anteil von Breite/Höhe, gemessen an assets/*.png; Ohren nicht mitgerechnet)
const HEAD_CENTER = {monkey: [153.5/308, 132/257], pig: [153.5/308, 139.5/257]};
// Oberkante des Bodens direkt unter einer Figur (für den Schatten), null = nichts darunter
function groundBelow(P){
  let best = null;
  for(const s of solids){
    if(s.gone || s.type === 'fake') continue;
    if(s.x > P.x + P.w*0.3 || s.x + s.w < P.x - P.w*0.3 || s.y < P.y - 2 || s.y > P.y + 400) continue;
    if(best === null || s.y < best) best = s.y;
  }
  return best;
}
// Liane zwischen Hand (x0,y0) und Haken (x1,y1); st = Dehnung 0..1, seed = fester Zufall (Lage der Blätter)
const LIANE_DURCHHANG = 9, LIANE_BLATT_ABSTAND = 20;
function lianeZeichnen(x0, y0, x1, y1, st, jit, seed, sagF){
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy/len, ny = dx/len;
  const sag = LIANE_DURCHHANG*(sagF ?? (1 - st))*Math.min(1, len/120);   // sagF: eigener Durchhang (Liane 2: straff)
  const cx = (x0 + x1)/2 + nx*sag*Math.sign(ny || 1) + jit, cy = (y0 + y1)/2 + Math.abs(ny)*sag + jit;   // Durchhang nach unten
  const pt = t => [(1-t)*(1-t)*x0 + 2*(1-t)*t*cx + t*t*x1, (1-t)*(1-t)*y0 + 2*(1-t)*t*cy + t*t*y1];
  const aussen = st > 0.05 ? `rgb(${Math.round(63+st*169)},${Math.round(122-st*72)},${Math.round(58-st*28)})` : '#3f7a3a';
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1);
  ctx.strokeStyle = 'rgba(18,34,12,.7)'; ctx.lineWidth = 6.4 - st*2.4; ctx.stroke();   // dunkler Rand
  ctx.strokeStyle = aussen; ctx.lineWidth = 4.6 - st*2; ctx.stroke();
  ctx.strokeStyle = st > 0.05 ? 'rgba(255,220,170,.55)' : '#6fb35a'; ctx.lineWidth = 1.6; ctx.stroke();   // heller Kern
  if(st < 0.6){   // Blätter (beim starken Dehnen nicht mehr)
    const n = Math.floor(len/LIANE_BLATT_ABSTAND);
    for(let i = 1; i <= n; i++){
      const t = i/(n + 1), [bx, by] = pt(t), [ax, ay] = pt(Math.min(1, t + 0.02)), w = Math.atan2(ay - by, ax - bx);
      const seite = (i + Math.floor(seed/40)) % 2 ? 1 : -1, r = 0.9 + 0.25*Math.sin(seed*0.1 + i*2.3);
      ctx.save(); ctx.translate(bx, by); ctx.rotate(w + seite*0.9);
      ctx.fillStyle = '#2f5f28'; ctx.beginPath(); ctx.ellipse(5*r, 0, 6.6*r, 3.3*r, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#5aa84c'; ctx.beginPath(); ctx.ellipse(5*r, 0, 5.6*r, 2.5*r, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(190,240,150,.5)'; ctx.beginPath(); ctx.ellipse(4*r, -0.8*r, 3*r, 0.9*r, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }
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
  // Cosmetics hinter der Figur (Spur, Begleiter, Aura, kreisende Objekte) – 27-kosmetik-zeichnen.js
  if(typeof cosmeticsDrawBack === 'function') cosmeticsDrawBack(player, camX);

  ctx.save();
  ctx.translate(px, py - player.h*0.5);

  // weicher Schatten auf dem Boden darunter: wird kleiner und blasser, je höher die Figur ist (auch im Sprung)
  const gy = groundBelow(player);
  if(gy !== null){
    const hgt0 = Math.max(0, gy - player.y), k = Math.max(0, 1 - hgt0/220);
    if(k > 0){
      const sy0 = gy - (py - player.h*0.5) - 1, rw = player.w*(0.45 + 0.35*k), a = 0.42*k;
      const g = ctx.createRadialGradient(0, sy0, 0, 0, sy0, rw);
      g.addColorStop(0, `rgba(10,18,8,${a})`); g.addColorStop(0.55, `rgba(10,18,8,${a*0.55})`); g.addColorStop(1, 'rgba(10,18,8,0)');
      ctx.save(); ctx.translate(0, sy0); ctx.scale(1, 0.24); ctx.translate(0, -sy0);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, sy0, rw, 0, Math.PI*2); ctx.fill(); ctx.restore();
    }
  }

  // Landen/Absprung kurz stauchen/strecken (21-figuren-leben.js), an den Füßen verankert
  let [lx, ly] = typeof charSquash === 'function' ? charSquash(player) : [1, 1];
  if(typeof neueBewegungSquash === 'function'){ const [nx, ny] = neueBewegungSquash(player); lx *= nx; ly *= ny; }   // Nacht-Ausbau: Dash/Rutschen/Haften
  if(typeof neueFigurenAn === 'function' && neueFigurenAn()){ lx = 1 + (lx-1)*0.35; ly = 1 + (ly-1)*0.35; }   // Landen: Füße federn selbst, Stauchen nur noch leicht
  ctx.translate(0, player.h*0.5); ctx.scale(lx, ly); ctx.translate(0, -player.h*0.5);

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
  if(baumTanzt() && typeof danceMove === 'function'){   // Dschungel: nur vor dem Baum, beim Hineingehen und im Baum kein Tanz (12a)
    const d = danceMove(player);
    ctx.translate(0, d.dy); ctx.rotate(d.rot); ctx.scale(d.sx, d.sy);
  }
  if(typeof neueFigurenAn === 'function' && neueFigurenAn()){ fussFigurZeichnen(player); } else {
  const rollA = (deathState && player === deathState.other ? 0 : (lean || won ? 0 : player.rollAngle)) + wob + lean;
  const size = Math.max(player.w, player.h)*1.55;
  // im echten Seitenverhältnis des Bildes (308 × 257); gedreht wird genau um die Mitte des runden Kopfes
  // (HEAD_CENTER, Ohren zählen nicht mit) – so rollt die Kugel rund statt zu eiern
  const hgt = img && img.naturalWidth ? size * img.naturalHeight / img.naturalWidth : size*0.83;
  const [fx, fy] = HEAD_CENTER[player.male ? 'monkey' : 'pig'];
  const hx = -size/2 + fx*size, hy = size/2 - hgt + fy*hgt;
  ctx.translate(hx, hy); ctx.rotate(rollA);
  const wear = typeof cosItemsOf === 'function' ? cosItemsOf(player.male ? 'm' : 'f') : null;   // Sonnenbrille/Tattoo (27)
  if(img && img.complete && img.naturalWidth){
    ctx.drawImage(img, -fx*size, -fy*hgt, size, hgt);
    if(wear) drawFaceWear(ctx, {x: -fx*size, y: -fy*hgt, w: size, h: hgt}, player.male ? 'monkey' : 'pig', wear);
  } else {
    ctx.fillStyle = player.male ? colorOf('--p1-accent') : colorOf('--p2-accent');
    ctx.beginPath(); ctx.arc(0,0,size*0.4,0,Math.PI*2); ctx.fill();
  }
  }
  ctx.restore();
  if(typeof cosmeticsDrawFront === 'function') cosmeticsDrawFront(player, camX);

  if(player.male && player.hookAttached){
    // Seil als Liane (Nutzerwunsch): grüner Strang mit hellem Kern, leicht durchhängend, kleine Blätter.
    // Gedehnt: wird dünner, färbt sich orange-rot, hängt nicht mehr durch und zittert (wie bisher)
    const st = Math.min(1, (player.ropeStretch||0) / ROPE_SNAP_STRETCH);
    // Liane 2 (js/32): das Seil ist straff, solange der Affe daran hängt – hängt nur durch, wenn es locker ist (z. B. beim Fallen)
    const neu = typeof lianeNeu === 'function' && lianeNeu(player);
    const locker = neu ? Math.max(0, Math.min(1, (player.ropeLen - Math.hypot(player.x - player.anchor.x, player.y - player.h*0.6 - player.anchor.y))/30)) : null;
    const jit = st > 0.3 ? (Math.random()-0.5)*st*3 : 0;
    let rx = px, ry = py-player.h*0.6;
    if(typeof neueFigurenAn==='function' && neueFigurenAn() && player._handDev){ const q = ctx.getTransform().inverse().transformPoint(new DOMPoint(player._handDev.x, player._handDev.y)); rx = q.x; ry = q.y; }
    lianeZeichnen(rx, ry, player.anchor.x-camX, player.anchor.y, st, jit, player.anchor.x, neu ? 0.08 + 0.9*locker : undefined);
  }
  else if(player.male && player._hakenWarten && player._wartZiel){
    // von oben gegriffen (js/32): die Liane ist schon in der Hand und hängt locker durch, bis sie sich unter dem Haken spannt
    let rx = px, ry = py-player.h*0.6;
    if(typeof neueFigurenAn==='function' && neueFigurenAn() && player._handDev){ const q = ctx.getTransform().inverse().transformPoint(new DOMPoint(player._handDev.x, player._handDev.y)); rx = q.x; ry = q.y; }
    lianeZeichnen(rx, ry, player._wartZiel.x-camX, player._wartZiel.y, 0, 0, player._wartZiel.x, 1);
  }
  if(!player.male && player.umbrella > 0.02 && !(typeof neueFigurenAn === 'function' && neueFigurenAn())) drawUmbrella(player, px, py);
}
