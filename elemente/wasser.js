// elemente/wasser.js – Element „Wasser“ (Ausbau 5; Kachel-Element, siehe 00-register.js).
// Wasserflächen malt man im Editor wie Aufwind. Im Spiel schwimmen beide Figuren darin frei in alle Richtungen
// (Links/Rechts, Hoch/Runter = Affe W/S bzw. Schweinchen ↑/↓ bzw. Stick; Springen = Schwimmstoß, an der Oberfläche
// = aus dem Wasser springen). Ohne Taste treibt man langsam nach oben (Auftrieb), das Wasser bremst (Widerstand).
// Unter Wasser gibt es KEINEN Haken (ein hängendes Seil löst sich beim Eintauchen) und KEINEN Schirm.
// Luft je Figur (LUFT_MAX): sinkt, solange der Kopf unter Wasser ist; Kopf über Wasser = Luft füllt sich auf;
// in den letzten LUFT_WARN Schritten Warnung (Blasen-Anzeige blinkt rot, Ticken); leer = Tod (Checkpoint).
// Werte in js/02-physik-werte.js (SWIM_*, LUFT_*). Spiel-Liste: wasserBecken (zusammenhängende Wasser-Rechtecke).
// Rolle: beide schwimmen gleich (Einzel-Fähigkeiten unter Wasser gibt es auf Nutzerwunsch erst einmal nicht);
// die Luft zwingt zu Zusammenarbeit – siehe gemeinsame Luftblase.
let wasserBecken = [];   // [{rects:[{x,y,w,h}], top, bottom, minX, maxX, surf}]
// Liegt der Punkt (x, y) im Wasser? (Wasserstand surf eines Beckens kann über/unter dem gemalten Rand liegen)
function imWasser(x, y){
  for(const b of wasserBecken){
    if(y < b.surf || x < b.minX || x >= b.maxX || y >= b.bottom) continue;
    for(const r of b.rects){
      if(x < r.x || x >= r.x + r.w || y >= r.y + r.h) continue;
      if(y >= r.y || r.y === b.top) return true;   // oberste Rechtecke wachsen mit steigendem Wasser nach oben
    }
  }
  return false;
}
// Oberkante eines Rechtecks beim aktuellen Wasserstand
const wasserOben = (b, r) => r.y === b.top ? b.surf : Math.max(r.y, b.surf);
// Wasser-Zustand einer Figur bestimmen (einmal pro Schritt vor der Bewegung)
function wasserPruefen(pl){
  const vorher = !!pl.inWater;
  pl.inWater = wasserBecken.length > 0 && imWasser(pl.x, pl.y - pl.h*0.5);
  pl.headUnder = pl.inWater && imWasser(pl.x, pl.y - pl.h*0.85);
  // Luft holen: Nase knapp über der Kopf-Linie (4 px höher) – so atmet man auch, während man an der Oberfläche leicht wippt
  pl.kannAtmen = !pl.inWater || !imWasser(pl.x, pl.y - pl.h*0.85 - 4);
  if(pl.luft === undefined) pl.luft = LUFT_MAX;
  if(pl.inWater !== vorher && Math.abs(pl.vy) > 2 && typeof SFX !== 'undefined' && SFX.platsch) SFX.platsch(pl.x, Math.abs(pl.vy));
  return pl.inWater;
}
// Schwimmen statt Laufen/Springen/Segeln (aus updatePlayer in 08-figur-physik-seil.js)
function schwimmPhysik(pl, moveDir, jumpPressed, frozen){
  pl.hookAttached = false; pl.gliding = false; pl.glideTimer = 0; pl.ropeFling = false;
  pl.onWall = 0; pl.wjInputLock = 0; pl.lastWallJumpSide = 0;
  const hoch = !frozen && isDown(pl.keys.swimUp), runter = !frozen && isDown(pl.keys.swimDown);
  // knapp unter der Oberfläche (Kopf weniger als SWIM_OBEN_ZONE tief): kräftiger nach oben, damit man ruhig mit dem
  // Kopf über Wasser treibt statt zu wippen; Kopf draußen: sanft zurück, bis er gerade herausschaut
  const nahOben = pl.headUnder && !imWasser(pl.x, pl.y - pl.h*0.85 - SWIM_OBEN_ZONE);
  let ay = !pl.headUnder ? SWIM_SURFACE_GRAV : nahOben && !runter ? -SWIM_SURFACE_GRAV : -SWIM_AUFTRIEB;
  if(hoch && pl.headUnder) ay -= SWIM_ACCEL;
  if(runter) ay += SWIM_ACCEL;
  pl.vx = (pl.vx + moveDir*SWIM_ACCEL) * SWIM_DRAG;
  pl.vy = (pl.vy + ay) * SWIM_DRAG;
  pl.vx = Math.max(-SWIM_MAX_SPEED, Math.min(SWIM_MAX_SPEED, pl.vx));
  pl.vy = Math.max(-SWIM_MAX_SPEED, Math.min(SWIM_MAX_SPEED, pl.vy));
  if((!pl.headUnder || nahOben) && !runter && !hoch) pl.vy *= 0.75;   // an der Oberfläche ruhig treiben statt wippen
  if(jumpPressed){
    if(!pl.headUnder || nahOben) pl.vy = SWIM_JUMP_OUT;     // an der Oberfläche: aus dem Wasser springen
    else { pl.vy = Math.min(pl.vy, -SWIM_KICK); pl.schwimmStoss = 1; }
  }
  if(pl.schwimmStoss > 0) pl.schwimmStoss = Math.max(0, pl.schwimmStoss - 0.06);   // nur für die Arm-/Bein-Animation
}
// Luft (aus updatePlayer, nach dem Bewegen)
function luftSchritt(pl){
  if(pl.luft === undefined) pl.luft = LUFT_MAX;
  const atmet = pl.kannAtmen !== false || (typeof luftblaseAtmet === 'function' && luftblaseAtmet(pl));
  const vorher = pl.luft;
  if(atmet) pl.luft = Math.min(LUFT_MAX, pl.luft + LUFT_AUFFUELLEN);
  else {
    pl.luft--;
    if(pl.luft === LUFT_WARN && typeof SFX !== 'undefined' && SFX.luftWarn) SFX.luftWarn(pl.x);
    else if(pl.luft < LUFT_WARN && pl.luft % 60 === 0 && pl.luft > 0 && SFX.luftWarn) SFX.luftWarn(pl.x, true);
    if(pl.luft <= 0){ pl.luft = 0; die(pl); }
  }
  if(atmet && vorher < LUFT_MAX*0.6 && pl.luft >= LUFT_MAX*0.6 && SFX.luftHolen) SFX.luftHolen(pl.x);
}
// --- Zeichnen ---
// Wasserkörper VOR den Figuren (halb durchsichtig), Oberfläche mit Wellen; nur sichtbare Teile
function wasserZeichnen(){
  const t = performance.now()*0.001;
  for(const b of wasserBecken){
    if(b.maxX < camX - 20 || b.minX > camX + VW + 20 || b.surf >= b.bottom) continue;
    for(const r of b.rects){
      const x0 = r.x - camX, oben = wasserOben(b, r), h = r.y + r.h - oben;
      if(h <= 0 || x0 + r.w < -20 || x0 > VW + 20) continue;
      const gr = ctx.createLinearGradient(0, oben, 0, oben + Math.max(h, 200));
      gr.addColorStop(0, 'rgba(70,170,215,0.38)'); gr.addColorStop(1, 'rgba(20,70,130,0.55)');
      ctx.fillStyle = gr; ctx.fillRect(x0, oben, r.w, h);
      // Oberfläche: nur wo darüber kein Wasser ist
      if(imWasser(r.x + r.w/2, oben - 3)) continue;
      ctx.beginPath(); ctx.moveTo(x0, oben + 6);
      for(let x = 0; x <= r.w; x += 10){
        const wx = r.x + x;
        ctx.lineTo(x0 + x, oben + Math.sin(wx*0.045 + t*2.2)*2.2 + Math.sin(wx*0.11 - t*3.1)*1.2);
      }
      ctx.lineTo(x0 + r.w, oben + 6); ctx.closePath();
      ctx.fillStyle = 'rgba(190,240,255,0.5)'; ctx.fill();
      ctx.strokeStyle = 'rgba(235,252,255,0.85)'; ctx.lineWidth = 2; ctx.beginPath();
      for(let x = 0; x <= r.w; x += 10){
        const wx = r.x + x, wy = oben + Math.sin(wx*0.045 + t*2.2)*2.2 + Math.sin(wx*0.11 - t*3.1)*1.2;
        if(x === 0) ctx.moveTo(x0 + x, wy); else ctx.lineTo(x0 + x, wy);
      }
      ctx.stroke();
    }
  }
}
// Luft-Anzeige: kleine Blasen über dem Kopf, sobald Luft fehlt; letzte 3 s rot blinkend
const LUFT_BLASEN = 6;
function luftAnzeigeZeichnen(){
  for(const pl of [p1, p2]){
    if(!pl || pl.luft === undefined || pl.luft >= LUFT_MAX || (deathState && deathState.victim === pl)) continue;
    const x = Math.round(pl.x - camX), y = pl.y - pl.h - 16, anteil = pl.luft / LUFT_MAX;
    const warn = pl.luft < LUFT_WARN, an = !warn || Math.floor(pl.luft/8) % 2 === 0;
    for(let i = 0; i < LUFT_BLASEN; i++){
      const voll = Math.min(1, Math.max(0, anteil*LUFT_BLASEN - i));
      const bx = x + (i - (LUFT_BLASEN - 1)/2)*9, by = y + Math.sin(performance.now()*0.004 + i)*1.2;
      ctx.beginPath(); ctx.arc(bx, by, 3.6, 0, Math.PI*2);
      ctx.fillStyle = voll <= 0 ? 'rgba(255,255,255,0.12)' : warn ? (an ? `rgba(255,90,80,${0.4 + 0.6*voll})` : 'rgba(255,180,170,0.25)')
                                                                 : `rgba(200,240,255,${0.35 + 0.6*voll})`;
      ctx.fill();
      ctx.strokeStyle = warn && an ? 'rgba(255,230,230,0.9)' : 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1; ctx.stroke();
      if(voll > 0){ ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(bx - 1.6, by - 1.8, 1.4, 1.4); }
    }
  }
}
// Rechtecke einer Spalte untereinander zusammenfassen (mergeRects fasst nur nebeneinander zusammen)
function wasserSenkrechtZusammen(rects){
  const out = rects.map(r => ({...r})).sort((a, b) => a.x - b.x || a.w - b.w || a.y - b.y);
  for(let i = 0; i < out.length; i++){
    for(let j = i + 1; j < out.length; j++){
      const a = out[i], c = out[j];
      if(c.x === a.x && c.w === a.w && c.y === a.y + a.h){ a.h += c.h; out.splice(j, 1); j--; }
    }
  }
  return out.sort((a, b) => a.y - b.y || a.x - b.x);
}
// Zusammenhängende Rechtecke (berühren sich an einer Kante) zu Becken gruppieren
function wasserBeckenBauen(rects){
  const rest = rects.map(r => ({...r})), becken = [];
  const beruehrt = (a, c) => a.x <= c.x + c.w && c.x <= a.x + a.w && a.y <= c.y + c.h && c.y <= a.y + a.h &&
    (Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x) > 0 || Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y) > 0);
  while(rest.length){
    const grp = [rest.pop()];
    for(let k = 0; k < grp.length; k++) for(let i = rest.length - 1; i >= 0; i--) if(beruehrt(grp[k], rest[i])) grp.push(rest.splice(i, 1)[0]);
    const top = Math.min(...grp.map(r => r.y));
    becken.push({rects: grp, top, bottom: Math.max(...grp.map(r => r.y + r.h)), minX: Math.min(...grp.map(r => r.x)),
                 maxX: Math.max(...grp.map(r => r.x + r.w)), surf: top, ziel: top, pegel: []});
  }
  return becken;
}
elementRegistrieren({
  id: 'wasser', name: 'Wasser', feld: 'waters',
  editor: {
    werkzeug: 'water', gruppe: 'wasser', art: 'kachel', ziehbar: true,
    titel: 'Wasser: Fläche malen – darin schwimmen beide (kein Haken, kein Schirm), Luft wird knapp; an der Oberfläche atmen',
    farbe: '#3d9be0', kachelFarbe: 'rgba(61,155,224,0.35)',
    zeichnen(ctx, c, r, TILE){   // kleine Welle
      ctx.strokeStyle = 'rgba(210,240,255,.7)'; ctx.lineWidth = 2;
      const X = c*TILE, Y = r*TILE + TILE/2;
      ctx.beginPath(); ctx.moveTo(X + 6, Y); ctx.quadraticCurveTo(X + 13, Y - 6, X + 20, Y); ctx.quadraticCurveTo(X + 27, Y + 6, X + 34, Y); ctx.stroke();
    },
    exportieren: (zellen, TILE, mergeRects) => wasserSenkrechtZusammen(mergeRects(zellen)),
  },
  spiel: {
    laden(daten){ wasserBecken = wasserBeckenBauen(daten.waters || []); },
    zuruecksetzen(){ for(const b of wasserBecken){ b.surf = b.top; b.ziel = b.top; } },
    zeichnenVorne(){ if(wasserBecken.length){ wasserZeichnen(); luftAnzeigeZeichnen(); } },
  },
});
