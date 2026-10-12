// elemente/fels.js – Element „Rollender Fels“ (Ausbau 7, Welt Ruinen; Punkt-Element mit Verknüpfungs-Nummer).
// Ein großer runder Stein (Durchmesser 2,5 Kästchen). Sobald seine Nummer AN geht (Hebel/Druckplatte), rollt er los
// (nach rechts oder links, Tempo langsam/mittel/schnell) und bleibt in Bewegung: er rollt über Boden und Stege, fällt
// über Kanten (Schwerkraft), nimmt kleine Stufen (bis 12 px) mit, tritt Bröckelboden los – und zerschellt an einer Wand,
// einer geschlossenen Tür oder einer höheren Stufe. Wer ihn berührt, stirbt. Tod/Neustart: zurück an den Start, wartet.
// Regel (FEATURES „jeder Hebel hat einen Grund“): ein Hebel, der einen Fels startet, öffnet immer auch ein Tor.
// Ruinen-Überarbeitung: vor dem Losrollen wackelt er FELS_WARN Schritte (Staub, Kiesel, Rumpeln = fairer Start); rollt er
// außerhalb des Bildes auf die Figuren zu, rumpelt es und Staub steigt am Bildrand auf (Ankündigung); er bricht durch
// Bröckel-Wände (Bröckelboden-Kästchen, die ihm im Weg stehen) und rollt langsamer weiter – so räumt er einen Weg frei;
// aus großer Höhe hüpft er kurz; Aufprall und Zerschellen lassen die Kamera wackeln, an der Wand fliegen Bruchstücke.
// Rolle: der Affe flieht nach oben an Haken (der Fels rollt darunter durch), das Schweinchen segelt über Gruben, in die
// der Fels fällt; oft startet einer den Fels, und beide müssen fliehen.
// Spiel-Daten: boulders [{x (Mitte), y (Unterkante = Boden), link, richtung: 'r'|'l', tempo}]
let felsen = [];   // {sx, sy, x, y (Mitte), vx, vy, dir, tempo, link, aktiv, warn, weg, dreh, rollTon, boden, brocken}
function felsHindernis(s){ return !s.gone && s.type !== 'oneway' && s.type !== 'fake'; }
function felsSchritt(players){
  for(const F of felsen){
    if(F.weg) continue;
    if(!F.aktiv){
      // Warn-Signal: erst wackeln (Staub, Kiesel, Rumpeln), dann rollen
      if(F.warn > 0){ if(--F.warn === 0){ F.aktiv = true; F.vx = F.dir*1; } else continue; }
      else if(F.link && linkOn[F.link]){ F.warn = FELS_WARN; if(felsImBild(F)){ SFX.felsStart(F.x); kameraStoss(2); } continue; }
      else continue;
    }
    const R = FELS_RADIUS;
    // waagerecht: auf Tempo kommen, kleine Stufen hinauf, an Wand/Tür/hoher Stufe zerschellen
    F.vx += (F.dir*F.tempo - F.vx)*FELS_BESCHL;
    F.x += F.vx;
    for(const s of solids){
      if(!felsHindernis(s)) continue;
      const box = {x: F.x - R, y: F.y - R, w: 2*R, h: 2*R};
      if(!(box.x < s.x + s.w && box.x + box.w > s.x && box.y < s.y + s.h - 0.5 && box.y + box.h > s.y + 0.5)) continue;
      const stufe = F.y + R - s.y;   // so weit steckt der Fels unten in der Stufe
      if(stufe > 0 && stufe <= FELS_STUFE){ F.y = s.y - R; continue; }
      if(s.type === 'crumble' && !s.gone){   // Bröckel-Wand: bricht durch, rollt langsamer weiter
        breakCrumble(s); F.vx *= FELS_BROECKEL_BREMSE; F.durchbrochen = (F.durchbrochen || 0) + 1;
        if(felsImBild(F)){ SFX.felsAufprall(F.x); kameraStoss(5); }
        continue;
      }
      felsZerschellen(F); break;
    }
    if(F.weg) continue;
    // senkrecht: fallen, landen (auch auf Stegen von oben)
    const vorher = F.y + R;
    F.vy = Math.min(MAX_FALL, F.vy + GRAVITY);
    F.y += F.vy;
    let gelandet = false;
    for(const s of solids){
      if(s.gone || s.type === 'fake') continue;
      if(F.x + R*0.7 <= s.x || F.x - R*0.7 >= s.x + s.w) continue;   // nur der untere Teil der Kugel trägt
      if(s.type === 'oneway' && vorher > s.y + 0.5) continue;
      if(F.vy >= 0 && vorher <= s.y + 0.5 && F.y + R > s.y){
        if(F.vy > 6 && felsImBild(F)){ SFX.felsAufprall(F.x); kameraStoss(Math.min(7, F.vy*0.5)); }
        F.y = s.y - R; F.vy = F.vy > 8 ? -F.vy*FELS_PRALL : 0; gelandet = true;
        if(s.type === 'crumble' && !s.triggered){ s.triggered = true; s.timer = 0; }
      }
    }
    F.dreh += F.vx/R;
    if(F.y - R > LEVEL_H + 200){ F.weg = true; continue; }
    if(felsImBild(F)) F.boden = felsBoden(F);   // für den Schatten am Boden (nur Anzeige)
    // Ankündigung: außerhalb des Bildes, aber auf dem Weg ins Bild -> Rumpeln (leiser, je weiter weg)
    const mitte = camX + VW/2, abst = Math.abs(F.x - mitte) - VW/2;
    F.ankuendigung = !felsImBild(F) && F.dir*(mitte - F.x) > 0 && abst < VW*FELS_ANKUENDIGUNG ? 1 - Math.max(0, abst)/(VW*FELS_ANKUENDIGUNG) : 0;
    if(F.ankuendigung > 0 && simSteps % 14 === 0) SFX.felsRollen(F.x);
    // Rollgeräusch im Takt der Umdrehungen (nur sichtbar)
    if(gelandet && Math.abs(F.vx) > 1 && felsImBild(F)){ F.rollTon -= Math.abs(F.vx); if(F.rollTon <= 0){ F.rollTon = 2*Math.PI*R*0.5; SFX.felsRollen(F.x); } }
    // Berührung = Tod (Kreis gegen Figur)
    for(const pl of players){
      if(!pl || deathState) continue;
      const nx = Math.max(pl.x - pl.w/2, Math.min(F.x, pl.x + pl.w/2)), ny = Math.max(pl.y - pl.h, Math.min(F.y, pl.y));
      if(Math.hypot(F.x - nx, F.y - ny) < R - 4){ die(pl); return; }
    }
  }
}
const felsImBild = F => F.x + FELS_RADIUS > camX - 40 && F.x - FELS_RADIUS < camX + VW + 40;
// Oberkante des Bodens unter dem Fels (für den Schatten)
function felsBoden(F){
  let best = LEVEL_H + 400;
  for(const s of solids){
    if(s.gone || s.type === 'fake' || F.x < s.x || F.x > s.x + s.w || s.y < F.y + FELS_RADIUS - 2) continue;
    if(s.y < best) best = s.y;
  }
  return best;
}
function felsZerschellen(F){
  F.weg = true;
  const now = performance.now();
  // Bruchstücke: kantige Brocken fliegen von der Wand zurück und fallen (nur Anzeige, nach der Zeit berechnet)
  F.brocken = [];
  for(let k = 0; k < 9; k++){
    const a = -Math.PI/2 + (k/8 - 0.5)*Math.PI*1.4;
    F.brocken.push({x: F.x + Math.cos(a)*FELS_RADIUS*0.4, y: F.y + Math.sin(a)*FELS_RADIUS*0.4, t0: now, r: 7 + (k*5) % 11,
                    vx: -F.dir*(1.2 + (k % 3)*0.9) + Math.cos(a)*1.4, vy: -2.2 - (k % 4)*0.8, vr: (k % 2 ? 1 : -1)*(0.1 + k*0.02), ecken: 5 + k % 3});
  }
  if(felsImBild(F)) kameraStoss(8);
  for(let k = 0; k < 14; k++){
    const a = k/14*Math.PI*2;
    coinFx.push({type: 'poof', x: F.x + Math.cos(a)*FELS_RADIUS*0.6, y: F.y + Math.sin(a)*FELS_RADIUS*0.6, t0: now,
                 vx: Math.cos(a)*2.2 - F.dir*1.5, vy: Math.sin(a)*2 - 1, size: 10 + (k % 4)*4});
  }
  if(felsImBild(F)) SFX.felsBruch(F.x);
}
function felsZuruecksetzen(){
  for(const F of felsen){ F.x = F.sx; F.y = F.sy; F.vx = 0; F.vy = 0; F.aktiv = false; F.warn = 0; F.weg = false; F.dreh = 0; F.rollTon = 0;
    F.boden = null; F.brocken = null; F.durchbrochen = 0; F.ankuendigung = 0; }
  if(typeof kameraWackeln !== 'undefined') kameraWackeln = 0;
}
// Zeichnen: schwerer dunkler Granit mit dickem Umriss, Steinband und Rissen (man sieht die Drehung), Moos; Schatten liegt
// auf dem Boden darunter (kleiner, je höher er ist); beim Rollen Staub und hüpfende Kiesel; vor dem Losrollen wackelt er
function felsBild(c, x, y, R, dreh, ruhig){
  c.save(); c.translate(x, y);
  c.rotate(dreh);
  const g = c.createRadialGradient(-R*0.35, -R*0.4, R*0.1, 0, 0, R);
  g.addColorStop(0, '#b3a58c'); g.addColorStop(0.5, '#7d6f5a'); g.addColorStop(1, '#3f3529');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, R, 0, Math.PI*2); c.fill();
  // Steinband quer durch die Mitte (dreht sich sichtbar mit)
  c.save(); c.beginPath(); c.arc(0, 0, R - 1, 0, Math.PI*2); c.clip();
  c.fillStyle = 'rgba(40,30,20,.45)'; c.fillRect(-R, -R*0.16, 2*R, R*0.32);
  c.fillStyle = 'rgba(210,190,150,.35)'; c.fillRect(-R, -R*0.16, 2*R, 3);
  c.fillStyle = 'rgba(40,30,20,.6)'; for(let k = -3; k <= 3; k++) c.fillRect(k*R*0.28 - 2, -R*0.16, 4, R*0.32);
  c.restore();
  c.strokeStyle = 'rgba(35,25,15,.7)'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(-R*0.55, -R*0.5); c.lineTo(-R*0.15, -R*0.3); c.lineTo(R*0.2, -R*0.62); c.stroke();
  c.beginPath(); c.moveTo(R*0.05, R*0.4); c.lineTo(R*0.35, R*0.25); c.lineTo(R*0.62, R*0.42); c.stroke();
  c.fillStyle = 'rgba(30,22,14,.55)'; c.beginPath(); c.arc(-R*0.3, R*0.5, R*0.11, 0, Math.PI*2); c.fill();
  c.beginPath(); c.arc(R*0.5, -R*0.1, R*0.07, 0, Math.PI*2); c.fill();
  c.fillStyle = 'rgba(100,135,60,.7)'; c.beginPath(); c.arc(R*0.42, -R*0.6, R*0.2, 0, Math.PI*2); c.fill();   // Moos-Fleck
  c.restore();
  c.strokeStyle = '#21180f'; c.lineWidth = 3.5; c.beginPath(); c.arc(x, y, R - 1, 0, Math.PI*2); c.stroke();   // dicker Umriss
  c.strokeStyle = 'rgba(255,240,210,.25)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, R - 5, Math.PI*1.1, Math.PI*1.55); c.stroke();
  if(!ruhig){ c.strokeStyle = 'rgba(20,14,8,.35)'; c.lineWidth = 6; c.beginPath(); c.arc(x, y, R + 2, 0, Math.PI*2); c.stroke(); }
}
function felsSchatten(x, boden, F){
  if(boden == null || boden > LEVEL_H) return;
  const hoch = Math.max(0, boden - (F.y + FELS_RADIUS)), k = Math.max(0.25, 1 - hoch/260);
  ctx.fillStyle = `rgba(0,0,0,${0.32*k})`; ctx.beginPath(); ctx.ellipse(x, boden - 2, FELS_RADIUS*0.9*k, 8*k, 0, 0, Math.PI*2); ctx.fill();
}
function felsKiesel(x, y, n, t, dir, weit){   // kleine Steinchen, die hüpfen (nur nach der Zeit berechnet)
  ctx.fillStyle = '#4a3e30';
  for(let i = 0; i < n; i++){
    const ph = (t*1.7 + i/n) % 1, hx = x - dir*(10 + ph*weit + i*5), hy = y - Math.abs(Math.sin(ph*Math.PI*2))*(10 + i*2);
    ctx.globalAlpha = 1 - ph*0.8; ctx.beginPath(); ctx.arc(hx, hy, 2.5 + (i % 3), 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function felsZeichnen(){
  const t = performance.now()*0.001;
  for(const F of felsen){
    // Bruchstücke nach dem Zerschellen
    if(F.weg && F.brocken){
      const now = performance.now();
      for(const b of F.brocken){
        const fr = (now - b.t0)/16.7; if(fr > 75) continue;
        const bx = b.x - camX + b.vx*fr, by = b.y + b.vy*fr + 0.22*fr*fr;
        ctx.save(); ctx.translate(bx, by); ctx.rotate(b.vr*fr); ctx.globalAlpha = Math.max(0, 1 - fr/75);
        ctx.fillStyle = '#6d604c'; ctx.strokeStyle = '#21180f'; ctx.lineWidth = 2; ctx.beginPath();
        for(let e = 0; e < b.ecken; e++){ const a = e/b.ecken*Math.PI*2, rr = b.r*(0.75 + 0.25*((e*7) % 3)/2); ctx.lineTo(Math.cos(a)*rr, Math.sin(a)*rr); }
        ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
    if(F.weg) continue;
    const x = F.x - camX;
    if(x + FELS_RADIUS < -40 || x - FELS_RADIUS > VW + 40){
      if(F.aktiv) felsAnkuendigung(F, t);
      continue;
    }
    const boden = F.aktiv ? F.boden : F.y + FELS_RADIUS;
    felsSchatten(x, boden, F);
    const wackel = F.warn > 0 ? Math.sin(simSteps*1.7)*3*(1 - F.warn/FELS_WARN + 0.3) : 0;
    felsBild(ctx, x + wackel, F.y, FELS_RADIUS, F.dreh + wackel*0.03, !F.aktiv && !(F.warn > 0));
    if(F.warn > 0){   // Warn-Signal: Staub quillt unter ihm hervor, Kiesel rieseln von oben
      for(let i = 0; i < 4; i++){
        const ph = (t*2.2 + i/4) % 1;
        ctx.globalAlpha = (1 - ph)*0.5; ctx.fillStyle = '#d8c8a8';
        ctx.beginPath(); ctx.arc(x + (i - 1.5)*FELS_RADIUS*0.6, F.y + FELS_RADIUS - 4 - ph*16, 6 + ph*10, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.fillStyle = '#4a3e30';
      for(let i = 0; i < 5; i++){ const ph = (t*1.5 + i*0.21) % 1; ctx.beginPath(); ctx.arc(x - 30 + i*15, F.y - FELS_RADIUS - 40 + ph*40, 2.5, 0, Math.PI*2); ctx.fill(); }
    }
    if(F.aktiv && Math.abs(F.vx) > 1){   // Staubwolke hinter dem Fels + hüpfende Kiesel
      for(let i = 0; i < 4; i++){
        const ph = (t*2 + i/4) % 1;
        ctx.globalAlpha = (1 - ph)*0.45; ctx.fillStyle = '#d8c8a8';
        ctx.beginPath(); ctx.arc(x - F.dir*(FELS_RADIUS*0.6 + ph*40), F.y + FELS_RADIUS - 6 - ph*14, 6 + ph*11, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if(F.vy === 0) felsKiesel(x - F.dir*FELS_RADIUS*0.5, F.y + FELS_RADIUS - 3, 5, t, F.dir, 34);
    }
  }
}
// Ankündigung am Bildrand: Staub steigt auf, Kiesel rieseln, ein pulsierendes Warnzeichen – je näher, desto stärker
function felsAnkuendigung(F, t){
  const k = F.ankuendigung || 0; if(k <= 0) return;
  const mitte = camX + VW/2, rand = F.x < mitte ? 0 : VW, innen = F.x < mitte ? 1 : -1;
  const by = F.y + FELS_RADIUS;
  for(let i = 0; i < 5; i++){
    const ph = (t*1.8 + i/5) % 1;
    ctx.globalAlpha = (1 - ph)*0.55*k; ctx.fillStyle = '#d8c8a8';
    ctx.beginPath(); ctx.arc(rand + innen*(8 + ph*30 + i*6), by - 8 - ph*40, 10 + ph*16, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = k; ctx.fillStyle = '#4a3e30';
  for(let i = 0; i < 4; i++){ const ph = (t*1.3 + i*0.27) % 1; ctx.beginPath(); ctx.arc(rand + innen*(14 + i*12), by - 160 + ph*150, 3, 0, Math.PI*2); ctx.fill(); }
  // Warnzeichen: Fels-Symbol mit Ausrufezeichen, pulsiert
  const px = rand + innen*34, py = F.y, s = 1 + 0.12*Math.sin(t*12);
  ctx.globalAlpha = 0.55 + 0.45*k;
  ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(30,20,12,.8)'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#ffb03a'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#ffb03a'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 1);
  ctx.fillStyle = '#ffb03a'; ctx.beginPath(); ctx.moveTo(-innen*30, -7); ctx.lineTo(-innen*30, 7); ctx.lineTo(-innen*40, 0); ctx.fill();
  ctx.restore(); ctx.globalAlpha = 1;
}
elementRegistrieren({
  id: 'fels', name: 'Rollender Fels', feld: 'boulders',
  editor: {
    werkzeug: 'fels', gruppe: 'gefahren', art: 'punkt', ziehbar: false, farbe: '#a8977a',
    mitNummer: true, nummerName: 'Fels',
    titel: 'Rollender Fels: unteres Mittel-Kästchen setzen. Rollt los, sobald die Verknüpfung AN geht (Hebel/Druckplatte), ' +
           'fällt über Kanten und zerschellt an Wänden/Türen. Berührung = tot. Ein Hebel, der einen Fels startet, sollte auch ein Tor öffnen',
    optionen: [
      {key: 'richtung', label: 'Richtung', werte: [['r', '→ rechts'], ['l', '← links']]},
      {key: 'tempo', label: 'Tempo', zahl: true, werte: [['3.6', 'langsam'], ['4.4', 'mittel'], ['5.4', 'schnell']]},
    ],
    klick(p){ p.richtung = p.richtung === 'l' ? 'r' : 'l'; },
    // sichtbar: Fels mit Radius 1,25 Kästchen, unten auf dem gesetzten Kästchen -> 3 breit, 3 hoch
    bereich: p => [-1, 0, 1].flatMap(dc => [-2, -1, 0].map(dr => [p.c + dc, p.r + dr])),
    zeichnen(ctx, c, r, TILE, p){
      const R = TILE*1.25;
      felsBild(ctx, c*TILE + TILE/2, (r + 1)*TILE - R, R, 0, true);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3;
      const txt = (p.richtung === 'l' ? '← ' : '→ ') + p.link;
      ctx.strokeText(txt, c*TILE + TILE/2, (r + 1)*TILE - R); ctx.fillText(txt, c*TILE + TILE/2, (r + 1)*TILE - R);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: (p.r + 1)*TILE, link: p.link,
      richtung: p.richtung === 'l' ? 'l' : 'r', tempo: Number(p.tempo) || 4.4})),
  },
  spiel: {
    laden(daten){
      felsen = (daten.boulders || []).map(b => ({sx: b.x, sy: b.y - FELS_RADIUS, link: b.link || null, dir: b.richtung === 'l' ? -1 : 1,
                                                 tempo: Number(b.tempo) || 4.4}));
      felsZuruecksetzen();
    },
    schritt: felsSchritt,
    zuruecksetzen: felsZuruecksetzen,
    zeichnen(){ if(felsen.length) felsZeichnen(); },
  },
});
