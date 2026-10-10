// elemente/fels.js – Element „Rollender Fels“ (Ausbau 7, Welt Ruinen; Punkt-Element mit Verknüpfungs-Nummer).
// Ein großer runder Stein (Durchmesser 2,5 Kästchen). Sobald seine Nummer AN geht (Hebel/Druckplatte), rollt er los
// (nach rechts oder links, Tempo langsam/mittel/schnell) und bleibt in Bewegung: er rollt über Boden und Stege, fällt
// über Kanten (Schwerkraft), nimmt kleine Stufen (bis 12 px) mit, tritt Bröckelboden los – und zerschellt an einer Wand,
// einer geschlossenen Tür oder einer höheren Stufe. Wer ihn berührt, stirbt. Tod/Neustart: zurück an den Start, wartet.
// Regel (FEATURES „jeder Hebel hat einen Grund“): ein Hebel, der einen Fels startet, öffnet immer auch ein Tor.
// Rolle: der Affe flieht nach oben an Haken (der Fels rollt darunter durch), das Schweinchen segelt über Gruben, in die
// der Fels fällt; oft startet einer den Fels, und beide müssen fliehen.
// Spiel-Daten: boulders [{x (Mitte), y (Unterkante = Boden), link, richtung: 'r'|'l', tempo}]
let felsen = [];   // {sx, sy, x, y (Mitte), vx, vy, dir, tempo, link, aktiv, weg, dreh, rollTon}
function felsHindernis(s){ return !s.gone && s.type !== 'oneway' && s.type !== 'fake'; }
function felsSchritt(players){
  for(const F of felsen){
    if(F.weg) continue;
    if(!F.aktiv){
      if(F.link && linkOn[F.link]){ F.aktiv = true; F.vx = F.dir*1; if(felsImBild(F)) SFX.felsStart(F.x); }
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
        if(F.vy > 6 && felsImBild(F)) SFX.felsAufprall(F.x);
        F.y = s.y - R; F.vy = 0; gelandet = true;
        if(s.type === 'crumble' && !s.triggered){ s.triggered = true; s.timer = 0; }
      }
    }
    F.dreh += F.vx/R;
    if(F.y - R > LEVEL_H + 200){ F.weg = true; continue; }
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
function felsZerschellen(F){
  F.weg = true;
  const now = performance.now();
  for(let k = 0; k < 14; k++){
    const a = k/14*Math.PI*2;
    coinFx.push({type: 'poof', x: F.x + Math.cos(a)*FELS_RADIUS*0.6, y: F.y + Math.sin(a)*FELS_RADIUS*0.6, t0: now,
                 vx: Math.cos(a)*2.2 - F.dir*1.5, vy: Math.sin(a)*2 - 1, size: 10 + (k % 4)*4});
  }
  if(felsImBild(F)) SFX.felsBruch(F.x);
}
function felsZuruecksetzen(){
  for(const F of felsen){ F.x = F.sx; F.y = F.sy; F.vx = 0; F.vy = 0; F.aktiv = false; F.weg = false; F.dreh = 0; F.rollTon = 0; }
}
// Zeichnen: grauer Sandstein mit Rissen und Moos, dreht sich beim Rollen; Staub an der Auflage
function felsBild(c, x, y, R, dreh, ruhig){
  c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, R - 2, R*0.85, 7, 0, 0, Math.PI*2); c.fill();
  c.rotate(dreh);
  const g = c.createRadialGradient(-R*0.35, -R*0.4, R*0.1, 0, 0, R);
  g.addColorStop(0, '#d8cbb0'); g.addColorStop(0.55, '#a8977a'); g.addColorStop(1, '#6e604a');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, R, 0, Math.PI*2); c.fill();
  c.strokeStyle = 'rgba(60,45,30,.55)'; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(-R*0.5, -R*0.2); c.lineTo(-R*0.1, R*0.05); c.lineTo(R*0.25, -R*0.3); c.stroke();
  c.beginPath(); c.moveTo(R*0.1, R*0.45); c.lineTo(R*0.35, R*0.2); c.lineTo(R*0.6, R*0.35); c.stroke();
  c.beginPath(); c.arc(-R*0.25, R*0.4, R*0.12, 0, Math.PI*2); c.stroke();
  c.fillStyle = 'rgba(110,140,70,.6)'; c.beginPath(); c.arc(R*0.45, -R*0.55, R*0.22, 0, Math.PI*2); c.fill();   // Moos-Fleck
  c.restore();
  if(!ruhig){ c.strokeStyle = 'rgba(40,30,20,.5)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, R, 0, Math.PI*2); c.stroke(); }
}
function felsZeichnen(){
  for(const F of felsen){
    if(F.weg) continue;
    const x = F.x - camX;
    if(x + FELS_RADIUS < -40 || x - FELS_RADIUS > VW + 40) continue;
    felsBild(ctx, x, F.y, FELS_RADIUS, F.dreh, !F.aktiv);
    if(F.aktiv && Math.abs(F.vx) > 1){   // Staubwölkchen hinter dem Fels
      const t = performance.now()*0.001;
      for(let i = 0; i < 3; i++){
        const ph = (t*2 + i/3) % 1;
        ctx.globalAlpha = (1 - ph)*0.35; ctx.fillStyle = '#d8c8a8';
        ctx.beginPath(); ctx.arc(x - F.dir*(FELS_RADIUS*0.6 + ph*30), F.y + FELS_RADIUS - 6 - ph*10, 5 + ph*8, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
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
