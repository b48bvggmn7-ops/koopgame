// elemente/meteorit.js – Element „Meteorit“ (Dschungel-Neu; Punkt-Element, nur Aussehen, siehe 00-register.js).
// Die Spur der Sternschnuppe durch den Dschungel: kleine leuchtende Splitter im Boden, größere Brocken mit Brandfleck,
// und am Ende des zweiten Abschnitts der Meteorit selbst (dunkler Fels mit leuchtenden Adern, pulsierendem Schein und
// kreisenden Funken). Je näher man ihm kommt, desto mehr und größere Splitter liegen herum (so baut der Level es).
// Kein Spiel-Einfluss (nur Zeichnen, keine Kollision) – es erzählt die Geschichte (story/story.json) im Level weiter.
// Editor-Auswahl „Größe“: splitter (1 Kästchen), brocken (2 Kästchen), meteorit (4 Kästchen breit, 3 hoch).
// Im Spiel: Liste `meteoriten` {x, y (Fußpunkt Mitte), art}.
let meteoriten = [];
const METEOR_FARBE = {kern: '#b6f3ff', glut: '#63d8ff', violett: '#a98bff', fels: '#2b2738', felsHell: '#4a4360'};
const METEOR_BREITE = {splitter: 1, brocken: 2, meteorit: 4};   // Kästchen (Editor: belegter Bereich)
// feste „Zufallszahl“ 0…1 (damit die Form jedes Mal gleich ist)
function meteorZufall(k){ const v = Math.sin(k*91.37 + 12.7)*24634.6345; return v - Math.floor(v); }
// Fels mit Adern; g = Zeichen-Kontext (Spiel: ctx, Editor: Vorschau), s = Größe (Radius in px), t = Zeit (s)
function meteorFels(g, x, y, s, t, seed, glanz){
  const n = 9, pkt = [];
  for(let i = 0; i < n; i++){
    const a = Math.PI + i/(n - 1)*Math.PI, r = s*(0.78 + 0.3*meteorZufall(seed + i));
    pkt.push([x + Math.cos(a)*r*1.18, y + Math.sin(a)*r*0.92]);
  }
  // Fels (halb im Boden)
  const gr = g.createLinearGradient(x, y - s, x, y);
  gr.addColorStop(0, METEOR_FARBE.felsHell); gr.addColorStop(1, METEOR_FARBE.fels);
  g.fillStyle = gr; g.beginPath(); g.moveTo(x - s*1.25, y);
  for(const [px, py] of pkt) g.lineTo(px, py);
  g.lineTo(x + s*1.25, y); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(10,6,20,.55)'; g.lineWidth = Math.max(1, s*0.06); g.stroke();
  // leuchtende Adern (pulsieren langsam)
  const puls = 0.65 + 0.35*Math.sin(t*2.1 + seed);
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for(let k = 0; k < 4; k++){
    const sx = x + (meteorZufall(seed*3 + k) - 0.5)*s*1.3, sy = y - s*0.12;
    g.strokeStyle = `rgba(99,216,255,${0.55*puls*glanz})`; g.lineWidth = Math.max(1.2, s*0.09);
    g.beginPath(); g.moveTo(sx, sy);
    let px = sx, py = sy;
    for(let j = 1; j <= 3; j++){ px += (meteorZufall(seed + k*7 + j) - 0.5)*s*0.5; py -= s*0.22; g.lineTo(px, py); }
    g.stroke();
    g.strokeStyle = `rgba(230,250,255,${0.75*puls*glanz})`; g.lineWidth = Math.max(0.6, s*0.035); g.stroke();
  }
  g.restore();
}
// Kristall-Splitter (ragt schräg aus dem Boden)
function meteorSplitter(g, x, y, s, t, seed){
  const kipp = (meteorZufall(seed) - 0.5)*0.7, puls = 0.6 + 0.4*Math.sin(t*2.6 + seed*1.7);
  g.save(); g.translate(x, y); g.rotate(kipp);
  for(const [dx, h, w] of [[-s*0.35, s*0.9, s*0.32], [s*0.2, s*1.35, s*0.4], [s*0.55, s*0.7, s*0.26]]){
    const gr = g.createLinearGradient(dx, -h, dx, 0);
    gr.addColorStop(0, METEOR_FARBE.kern); gr.addColorStop(0.45, METEOR_FARBE.glut); gr.addColorStop(1, METEOR_FARBE.violett);
    g.fillStyle = gr; g.beginPath(); g.moveTo(dx - w/2, 0); g.lineTo(dx - w*0.15, -h); g.lineTo(dx + w*0.2, -h*0.92); g.lineTo(dx + w/2, 0); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(40,30,90,.6)'; g.lineWidth = 1; g.stroke();
    g.fillStyle = `rgba(255,255,255,${0.45*puls})`; g.beginPath(); g.moveTo(dx - w*0.2, -h*0.15); g.lineTo(dx - w*0.1, -h*0.85); g.lineTo(dx, -h*0.2); g.closePath(); g.fill();
  }
  g.restore();
}
// aufsteigende Funken: feste Bahnen, nur aus der Zeit berechnet (kein Spielzustand)
function meteorFunken(x, y, breite, hoehe, anzahl, t, seed){
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for(let i = 0; i < anzahl; i++){
    const z = meteorZufall(seed + i*13), dauer = 2.2 + z*1.8, ph = ((t + z*dauer*3)/dauer) % 1;
    const fx = x + (meteorZufall(seed + i*31) - 0.5)*breite + Math.sin(t*1.7 + i)*6, fy = y - ph*hoehe;
    ctx.globalAlpha = Math.sin(Math.PI*ph)*0.9;
    ctx.fillStyle = i % 3 ? METEOR_FARBE.glut : METEOR_FARBE.kern;
    ctx.beginPath(); ctx.arc(fx, fy, 1 + z*1.6, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
function meteorZeichnen(m, x, t){
  const y = m.y, seed = Math.round(m.x/40);
  if(m.art === 'meteorit'){
    // Krater (dunkler Rand), großer Schein, Fels mit Adern, kreisende Funken
    glanzSchatten(x, y + 2, 120, 12, 0.5);
    elementLeuchten(x, y - 50, 200, METEOR_FARBE.glut, 1.4);
    elementLeuchten(x, y - 40, 110, METEOR_FARBE.violett, 1.1);
    meteorFels(ctx, x, y, 70, t, seed, 1);
    meteorSplitter(ctx, x - 92, y, 22, t, seed + 1); meteorSplitter(ctx, x + 96, y, 18, t, seed + 2);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for(let i = 0; i < 7; i++){
      const a = t*0.8 + i*Math.PI*2/7, rx = 96 + 10*Math.sin(t + i), ry = 36;
      ctx.globalAlpha = 0.5 + 0.4*Math.sin(t*3 + i);
      ctx.fillStyle = i % 2 ? METEOR_FARBE.kern : METEOR_FARBE.violett;
      ctx.beginPath(); ctx.arc(x + Math.cos(a)*rx, y - 56 + Math.sin(a)*ry, 2.4, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
    meteorFunken(x, y - 40, 120, 150, 14, t, seed);
  } else if(m.art === 'brocken'){
    glanzSchatten(x, y + 1, 52, 7, 0.45);
    elementLeuchten(x, y - 18, 70, METEOR_FARBE.glut, 0.9);
    meteorFels(ctx, x, y, 26, t, seed, 0.9);
    meteorSplitter(ctx, x + 30, y, 10, t, seed + 5);
    meteorFunken(x, y - 16, 40, 60, 4, t, seed);
  } else {
    elementLeuchten(x, y - 10, 38, METEOR_FARBE.glut, 0.8);
    meteorSplitter(ctx, x, y, 14, t, seed);
    if(meteorZufall(seed) > 0.4) meteorFunken(x, y - 10, 16, 36, 2, t, seed);
  }
}
elementRegistrieren({
  id: 'meteorit', name: 'Meteorit', feld: 'meteoriten',
  editor: {
    werkzeug: 'meteorit', gruppe: 'marken', vor: null, art: 'punkt', ziehbar: false, farbe: '#63d8ff',
    titel: 'Meteorit (nur Aussehen, Geschichte): leuchtende Splitter als Spur, Brocken, am Ende der große Meteorit. Setzen auf den Boden (Fuß = Kästchen unten)',
    optionen: [{key: 'art', label: 'Größe', titel: 'Splitter (klein), Brocken (2 Kästchen) oder der Meteorit (groß, 4 Kästchen)',
                werte: [['splitter', 'Splitter'], ['brocken', 'Brocken'], ['meteorit', 'Meteorit (groß)']]}],
    bereich: p => {
      const b = METEOR_BREITE[p.art] || 1, h = p.art === 'meteorit' ? 3 : 1, out = [];
      for(let k = 0; k < b; k++) for(let j = 0; j < h; j++) out.push([p.c - Math.floor((b - 1)/2) + k, p.r - j]);
      return out;
    },
    zeichnen(ctx, c, r, TILE, p){
      const art = (p && p.art) || 'splitter', x = c*TILE + TILE/2, y = r*TILE + TILE;
      const s = TILE/40;
      if(art === 'meteorit') meteorFels(ctx, x, y, 66*s, 0, c, 1);
      else if(art === 'brocken') meteorFels(ctx, x, y, 26*s, 0, c, 1);
      else meteorSplitter(ctx, x, y, 14*s, 0, c);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE + TILE, ...(p.art && p.art !== 'splitter' ? {art: p.art} : {})})),
  },
  spiel: {
    laden(daten){ meteoriten = (daten.meteoriten || []).map(m => ({x: m.x, y: m.y, art: m.art || 'splitter'})); },
    zeichnenHinten(){
      if(!meteoriten.length) return;
      const t = performance.now()*0.001;
      for(const m of meteoriten){
        const x = Math.round(m.x - camX), r = m.art === 'meteorit' ? 260 : m.art === 'brocken' ? 90 : 50;
        if(x < -r || x > VW + r) continue;
        meteorZeichnen(m, x, t);
      }
    },
  },
});
