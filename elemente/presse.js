// elemente/presse.js – Element „Stachelpresse“ (Ausbau 7, Welt Vulkan; Punkt-Element, siehe 00-register.js).
// Schwerer Eisenblock (1–3 Kästchen breit) mit Stacheln unten, an einer Kette. Im festen TAKT: oben warten – kurz vorher
// zittert die Kette und Staub rieselt (Vorwarnung, PRESSE_WARN) – dann kracht der Block schnell herunter bis auf den
// ersten festen Boden darunter, bleibt kurz liegen und wird langsam wieder hochgezogen. Wer den Block berührt, ist tot.
// Versatz verschiebt den Takt (Wellen aus mehreren Pressen). Optional per Nummer:
//   „hält bei Nummer an“ – solange die Verknüpfung AN ist, bleibt die Presse oben (läuft sie gerade, fährt sie erst hoch);
//   „läuft nur bei Nummer“ – nur solange die Verknüpfung AN ist, stampft sie.
// Jede Presse hat ihre eigene Takt-Uhr (Schritte seit Levelstart/Neustart/Tod) – gleicher Rhythmus nach jedem Neustart.
// Rolle: der Affe hängt am Haken über der Presse und wartet den Takt ab, das Schweinchen gleitet zwischen zwei Schlägen
// hindurch; oft hält einer per Hebel/Platte die Pressen für den anderen an.
// Spiel-Daten: pressen [{x, y (linke obere Ecke oben), breite (Kästchen), takt (s), versatz (0…1), schalter, link?}]
let pressen = [];   // {x, y0, w, hub, takt, versatz, schalter, link, t, y, unten}
const PRESSE_HOEHE = 40, PRESSE_STACHEL = 12;   // Block + Stacheln darunter (px)
function presseTaktSchritte(P){ return Math.max(60, Math.round(P.takt*60)); }
// Lage (0 = oben … 1 = unten) zur Zeit t im Takt
function presseLage(P, t){
  const n = presseTaktSchritte(P), fall = Math.max(4, Math.ceil(P.hub/PRESSE_FALL)), liegen = PRESSE_LIEGEN;
  const hoch = Math.max(10, Math.round(n*0.32)), warten = n - fall - liegen - hoch;
  if(t < warten) return 0;
  if(t < warten + fall) return (t - warten)/fall;
  if(t < warten + fall + liegen) return 1;
  return 1 - (t - warten - fall - liegen)/hoch;
}
function presseWartet(P, t){ const n = presseTaktSchritte(P), fall = Math.max(4, Math.ceil(P.hub/PRESSE_FALL)); return n - fall - PRESSE_LIEGEN - Math.max(10, Math.round(n*0.32)); }
function presseLaeuft(P){
  if(P.schalter === 'stopp') return !(P.link && linkOn[P.link]);
  if(P.schalter === 'an') return !!(P.link && linkOn[P.link]);
  return true;
}
function presseZeit(P){ const n = presseTaktSchritte(P); return (((P.t + Math.round(P.versatz*n)) % n) + n) % n; }
// 0 … 1: Vorwarnung kurz vor dem Fall
function presseWarnung(P){
  if(!presseLaeuft(P)) return 0;
  const rest = presseWartet(P) - presseZeit(P);
  return rest > 0 && rest <= PRESSE_WARN ? 1 - rest/PRESSE_WARN : 0;
}
// Fallhöhe: bis zum ersten festen Kästchen unter dem Block (Stege und Scheinwände zählen nicht)
function presseHub(P){
  const unten = P.y0 + PRESSE_HOEHE + PRESSE_STACHEL;
  let best = LEVEL_H - unten;
  for(const s of solids){
    if(s.type === 'oneway' || s.type === 'fake' || s.type === 'wind' || s === P) continue;
    if(s.x + s.w <= P.x + 2 || s.x >= P.x + P.w - 2 || s.y < unten - 1) continue;
    best = Math.min(best, s.y - unten);
  }
  return Math.max(0, best);
}
function presseBox(P){ return {x: P.x + 3, y: P.y + 2, w: P.w - 6, h: PRESSE_HOEHE + PRESSE_STACHEL - 4}; }
function pressenSchritt(players){
  for(const P of pressen){
    const t0 = presseZeit(P);
    // angehalten: nur bis ganz oben weiterfahren, dann stehen bleiben
    if(presseLaeuft(P) || presseLage(P, t0) > 0) P.t++;
    const t = presseZeit(P), lage = presseLage(P, t);
    P.y = P.y0 + lage*P.hub;
    const sichtbar = P.x + P.w > camX - 40 && P.x < camX + VW + 40;
    if(lage === 1 && !P.unten){ P.unten = true; if(sichtbar) SFX.presseStampf(P.x + P.w/2); }
    if(lage < 1) P.unten = false;
    if(sichtbar && presseLaeuft(P) && presseWartet(P) - t === PRESSE_WARN) SFX.presseKette(P.x + P.w/2);
    const box = presseBox(P);
    for(const pl of players) if(pl && !deathState && rectsOverlap(falleFigurBox(pl), box)){ die(pl); return; }
  }
}
function pressenZuruecksetzen(){ for(const P of pressen){ P.t = 0; P.y = P.y0; P.unten = false; } }
// Bild einer Presse (auch Editor): x, y = linke obere Ecke des Blocks, w = Breite, ketteBis = y des Aufhängepunkts
function presseBild(c, x, y, w, ketteBis, warn, t){
  const zx = warn > 0 ? Math.sin(t*90)*1.5*warn : 0;
  // Kette(n)
  c.strokeStyle = '#4a4246'; c.lineWidth = 3;
  for(const kx of (w > 40 ? [x + 12, x + w - 12] : [x + w/2])){
    for(let yy = ketteBis; yy < y; yy += 10){ c.beginPath(); c.ellipse(kx + zx, yy + 5, 3, 5, 0, 0, Math.PI*2); c.stroke(); }
  }
  x += zx;
  // Block: dunkles Eisen, glühende Kante, Nieten
  const g = c.createLinearGradient(0, y, 0, y + PRESSE_HOEHE);
  g.addColorStop(0, '#5a5258'); g.addColorStop(0.6, '#3a3438'); g.addColorStop(1, '#2a2428');
  c.fillStyle = g; c.fillRect(x, y, w, PRESSE_HOEHE);
  c.fillStyle = 'rgba(255,110,40,.55)'; c.fillRect(x, y + PRESSE_HOEHE - 4, w, 4);
  c.strokeStyle = '#1e1a1c'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, w - 2, PRESSE_HOEHE - 2);
  c.fillStyle = '#8a8288';
  for(let k = x + 8; k < x + w - 4; k += 16){ c.beginPath(); c.arc(k, y + 8, 2.2, 0, Math.PI*2); c.fill(); }
  // Stacheln nach unten
  for(let k = x; k < x + w - 1; k += 10){
    c.fillStyle = '#c8c0c4'; c.beginPath(); c.moveTo(k, y + PRESSE_HOEHE); c.lineTo(k + 10, y + PRESSE_HOEHE); c.lineTo(k + 5, y + PRESSE_HOEHE + PRESSE_STACHEL); c.fill();
    c.fillStyle = 'rgba(200,60,30,.8)'; c.beginPath(); c.moveTo(k + 3.5, y + PRESSE_HOEHE + PRESSE_STACHEL - 4); c.lineTo(k + 6.5, y + PRESSE_HOEHE + PRESSE_STACHEL - 4); c.lineTo(k + 5, y + PRESSE_HOEHE + PRESSE_STACHEL); c.fill();
  }
}
function pressenZeichnen(){
  const t = performance.now()*0.001;
  for(const P of pressen){
    const x = P.x - camX;
    if(x + P.w < -40 || x > VW + 40) continue;
    const warn = presseWarnung(P);
    presseBild(ctx, x, P.y, P.w, P.kette, warn, t);
    // Design-Politur C: Glanzstreifen über den Eisenblock, Funkeln an den Stacheln (gemeinsames Muster, 10b-design-look.js)
    ctx.save(); ctx.beginPath(); ctx.rect(x, P.y, P.w, PRESSE_HOEHE); ctx.clip(); glanzBand(x, P.y, P.w, PRESSE_HOEHE, P.x*0.01); ctx.restore();
    glanzFunkeln(x + 7, P.y + PRESSE_HOEHE + 3, 5, P.x*0.3);
    // Staub rieselt vor dem Fall (nur Bild)
    if(warn > 0){
      ctx.fillStyle = 'rgba(200,180,160,' + (0.6*warn) + ')';
      for(let i = 0; i < 6; i++){ const fx = x + ((i*37 + t*40) % P.w), fy = P.y + PRESSE_HOEHE + ((t*120 + i*29) % 60); ctx.fillRect(fx, fy, 2, 2); }
    }
  }
}
elementRegistrieren({
  id: 'presse', name: 'Stachelpresse', feld: 'pressen',
  editor: {
    werkzeug: 'presse', gruppe: 'gefahren', art: 'punkt', ziehbar: false, farbe: '#5a5258',
    titel: 'Stachelpresse: setzt man an die OBERE Stelle; kracht im Takt herunter bis auf den Boden darunter, bleibt kurz ' +
           'liegen, wird langsam hochgezogen. Warnt vorher (Kette zittert, Staub). Versatz = später im Takt',
    optionen: [
      {key: 'breite', label: 'Breite', zahl: true, werte: [['1', '1'], ['2', '2'], ['3', '3']]},
      {key: 'takt', label: 'Takt', zahl: true, titel: 'alle X Sekunden ein Schlag', werte: [['2', '2 s'], ['2.5', '2,5 s'], ['3', '3 s'], ['4', '4 s']]},
      {key: 'versatz', label: 'Versatz', zahl: true, titel: 'Verschiebung im Takt (für Wellen mehrerer Pressen)',
       werte: [['0', '0'], ['0.25', '¼'], ['0.5', '½'], ['0.75', '¾']]},
      {key: 'schalter', label: 'Nummer', titel: 'immer – oder hält an, solange die Nummer an ist – oder läuft nur, solange sie an ist',
       werte: [['immer', 'ohne'], ['stopp', 'hält bei Nummer an'], ['an', 'läuft nur bei Nummer']]},
    ],
    neu(p){
      const o = {c: p.c, r: p.r, breite: p.breite || 1, takt: p.takt || 3, versatz: p.versatz || 0, schalter: p.schalter || 'immer'};
      if(o.schalter !== 'immer') o.link = Number(linkSelect.value);
      return o;
    },
    nummerAktiv: p => p.schalter !== 'immer' && !!p.link,
    mitNummer: false, nummerName: 'Presse',
    // sichtbar: so breit wie die Presse (1–3 Kästchen)
    bereich: p => Array.from({length: Math.max(1, Math.min(3, Number(p.breite) || 1))}, (_, k) => [p.c + k, p.r]),
    zeichnen(ctx, c, r, TILE, p){
      const b = Math.max(1, Math.min(3, Number(p && p.breite) || 1));
      ctx.save(); ctx.translate(c*TILE, r*TILE); ctx.scale(TILE/40, TILE/40);
      presseBild(ctx, 0, 0, b*40, 0, 0, 0); ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3;
      const txt = String((p && p.takt) || 3).replace('.', ',') + 's' + (p && p.link ? ' ⚡' + p.link : '');
      ctx.strokeText(txt, c*TILE + b*TILE/2, r*TILE + TILE*0.45); ctx.fillText(txt, c*TILE + b*TILE/2, r*TILE + TILE*0.45);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, breite: Math.max(1, Math.min(3, Number(p.breite) || 1)),
      takt: Number(p.takt) || 3, versatz: Number(p.versatz) || 0, schalter: ['stopp', 'an'].includes(p.schalter) ? p.schalter : 'immer',
      ...(['stopp', 'an'].includes(p.schalter) && p.link ? {link: p.link} : {})})),
  },
  spiel: {
    laden(daten){
      pressen = (daten.pressen || []).map(p => ({x: p.x, y0: p.y, y: p.y, w: 40*Math.max(1, Math.min(3, p.breite || 1)),
        takt: Number(p.takt) || 3, versatz: Number(p.versatz) || 0, schalter: ['stopp', 'an'].includes(p.schalter) ? p.schalter : 'immer',
        link: p.link || null, t: 0, hub: 0, unten: false, kette: -140}));
      for(const P of pressen){
        P.hub = presseHub(P);
        // Kette bis zur Decke darüber (oder bis über den Bildrand)
        let k = -140;
        for(const s of solids) if(s.type !== 'oneway' && s.type !== 'fake' && s.x < P.x + P.w && s.x + s.w > P.x && s.y + s.h <= P.y0 + 1) k = Math.max(k, s.y + s.h);
        P.kette = k;
      }
    },
    schritt: pressenSchritt,
    zuruecksetzen: pressenZuruecksetzen,
    zeichnen(){ if(pressen.length) pressenZeichnen(); },
  },
});
