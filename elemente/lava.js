// elemente/lava.js – Elemente „Lava“ und „Lava-Marke“ (Ausbau 7, Welt Vulkan; Punkt-Elemente, siehe 00-register.js).
// Lava: glühende Kästchen (mit der Maus malbar). Zusammenhängende Kästchen bilden ein Becken; wer hineinfällt, ist tot.
//   Lava ist flüssig: die Oberfläche ist überall im Becken gleich hoch, Steine davor verdecken sie.
// Lava-Marke: über oder in ein Becken setzen. Ist sie aktiv, steigt (bzw. sinkt, wenn die Marke tiefer liegt) die Lava
//   in den Spalten des Beckens weich bis zur Oberkante der Marke (Tempo langsam / mittel / schnell, LAVA_TEMPO in 02-physik-werte.js):
//   - „per Nummer“: solange die Verknüpfung AN ist (Hebel = bleibt, Druckplatte = nur solange jemand draufsteht);
//     AUS = die Lava sinkt zurück auf den gemalten Stand.
//   - „sobald jemand kommt“: sobald eine Figur über dem Becken ist, steigt die Lava (Lava-Flucht) und sinkt erst nach
//     dem Tod / Neustart wieder.
//   Vorher sichtbar: gestrichelte Glut-Linie in Markenhöhe; beim Losgehen grollt es.
// Rolle: der Affe klettert per Wandsprung/Seil voraus und zieht oben den Hebel, das Schweinchen steigt im Aufwind und
// hält Druckplatten, die die Lava unten halten.
// Spiel-Daten: lava [{x, y, w, h}] (Rechtecke), lavaPegel [{x, y (Oberkante), tempo, start: 'nummer'|'naehe', link?}]
let lavaBecken = [];   // {spalten: Map(spaltenX -> unterkante), minX, maxX, top, surf, ziel, marken: [], bewegt}
// Becken aus den Lava-Rechtecken bilden (zusammenhängende Kästchen)
function lavaBeckenBilden(rects){
  const zellen = new Map();
  for(const r of rects) for(let x = r.x; x < r.x + r.w; x += 40) for(let y = r.y; y < r.y + r.h; y += 40) zellen.set(x + ',' + y, [x, y]);
  const gesehen = new Set(), becken = [];
  for(const [k, start] of zellen){
    if(gesehen.has(k)) continue;
    const stapel = [start], z = []; gesehen.add(k);
    while(stapel.length){
      const [x, y] = stapel.pop(); z.push([x, y]);
      for(const [dx, dy] of [[40, 0], [-40, 0], [0, 40], [0, -40]]){
        const nk = (x + dx) + ',' + (y + dy);
        if(zellen.has(nk) && !gesehen.has(nk)){ gesehen.add(nk); stapel.push(zellen.get(nk)); }
      }
    }
    const spalten = new Map();
    let top = Infinity, minX = Infinity, maxX = -Infinity;
    for(const [x, y] of z){
      spalten.set(x, Math.max(spalten.get(x) || -Infinity, y + 40));
      top = Math.min(top, y); minX = Math.min(minX, x); maxX = Math.max(maxX, x + 40);
    }
    becken.push({spalten, minX, maxX, top, surf: top, ziel: top, marken: [], bewegt: false});
  }
  return becken.sort((a, b) => a.minX - b.minX);
}
// liegt der Punkt in Lava?
function inLava(x, y){
  for(const b of lavaBecken){
    if(x < b.minX || x >= b.maxX || y < b.surf) continue;
    const unten = b.spalten.get(Math.floor(x/40)*40);
    if(unten !== undefined && y < unten) return true;
  }
  return false;
}
function lavaSchritt(players){
  for(const b of lavaBecken){
    // aktive Marken: die höchste gilt; eine Marke UNTER dem gemalten Stand lässt die Lava sinken (z. B. Druckplatte)
    let ziel = Infinity;
    for(const m of b.marken){
      if(m.start === 'naehe'){
        if(!m.ausgeloest) for(const pl of players) if(pl && pl.x >= b.minX && pl.x < b.maxX && pl.y < b.top + 4) m.ausgeloest = true;
        if(m.ausgeloest) ziel = Math.min(ziel, m.y);
      } else if(m.link && linkOn[m.link]) ziel = Math.min(ziel, m.y);
    }
    if(ziel === Infinity) ziel = b.top;
    const marke = b.marken.find(m => m.y === ziel);
    const tempo = marke ? (LAVA_TEMPO[marke.tempo] || LAVA_TEMPO.mittel) : LAVA_TEMPO.mittel;
    b.ziel = ziel;
    if(b.surf !== ziel){
      if(!b.bewegt && ziel < b.surf && b.maxX > camX - 200 && b.minX < camX + VW + 200) SFX.lavaSteigt((b.minX + b.maxX)/2);
      b.bewegt = true;
      const d = ziel - b.surf;
      b.surf += Math.abs(d) <= tempo ? d : Math.sign(d)*tempo;
    } else b.bewegt = false;
  }
  // wer mit den Füßen in der Lava steckt, verbrennt (etwas gnädig: Mitte der Figur, ein paar Pixel unter der Oberfläche)
  for(const pl of players){
    if(!pl || deathState) continue;
    for(const dx of [-pl.w*0.3, 0, pl.w*0.3]) if(inLava(pl.x + dx, pl.y - LAVA_GNADE)){ SFX.lavaZisch(pl.x); die(pl); return; }
  }
  // leises Blubbern, wenn Lava im Bild ist (ab und zu)
  if(lavaBecken.length && Math.random() < 0.012){
    const b = lavaBecken.find(b => b.maxX > camX && b.minX < camX + VW);
    if(b) SFX.lavaBlubb(camX + VW/2 + (Math.random() - 0.5)*VW*0.6);
  }
}
function lavaZuruecksetzen(){
  for(const b of lavaBecken){ b.surf = b.top; b.ziel = b.top; b.bewegt = false; for(const m of b.marken) m.ausgeloest = false; }
}
// Lichter für dunkle Level: die Lava leuchtet
function lavaLichter(L){
  for(const b of lavaBecken){
    if(b.maxX < camX - 200 || b.minX > camX + VW + 200) continue;
    for(const [x] of b.spalten) if((x/40) % 2 === 0) L.push([x + 20, b.surf + 10, 120]);
  }
}
// Lava-Bild einer Spalte (auch für den Editor): x, y (Oberfläche), w, h, t (Sekunden)
function lavaSpalteZeichnen(c, x, y, w, h, t, oben){
  if(h <= 0) return;
  const g = c.createLinearGradient(0, y, 0, y + Math.min(h, 160));
  g.addColorStop(0, '#ffe27a'); g.addColorStop(0.12, '#ff9a2a'); g.addColorStop(0.5, '#e2481a'); g.addColorStop(1, '#8a1e10');
  c.fillStyle = g; c.fillRect(x, y, w, h);
  // dunkle Schlacke-Schollen, die langsam treiben
  c.fillStyle = 'rgba(70,20,10,.35)';
  for(let i = 0; i < 2; i++){
    const sx = x + ((t*6 + i*23 + x*0.37) % w), sy = y + 14 + i*18;
    if(sy < y + h - 6){ c.beginPath(); c.ellipse(sx, sy, 7, 3, 0, 0, Math.PI*2); c.fill(); }
  }
  if(!oben) return;
  // welliger heller Rand oben + Blasen
  c.fillStyle = '#fff2b0';
  c.beginPath(); c.moveTo(x, y + 3);
  for(let k = 0; k <= 4; k++) c.lineTo(x + w*k/4, y + 1.5 + Math.sin(t*3 + (x + w*k/4)*0.05)*2);
  c.lineTo(x + w, y + 5); c.lineTo(x, y + 5); c.fill();
  const ph = (t*0.7 + x*0.013) % 1;
  if(ph < 0.6){
    const r = 2 + ph*6;
    c.strokeStyle = 'rgba(255,240,170,' + (0.8 - ph) + ')'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(x + w*0.5 + Math.sin(x)*8, y - r*0.6, r, Math.PI, Math.PI*2); c.stroke();
  }
}
function lavaZeichnen(){
  const t = performance.now()*0.001;
  for(const b of lavaBecken){
    if(b.maxX < camX - 40 || b.minX > camX + VW + 40) continue;
    // Glut-Schein über der Oberfläche
    const sg = ctx.createLinearGradient(0, b.surf - 70, 0, b.surf);
    sg.addColorStop(0, 'rgba(255,120,40,0)'); sg.addColorStop(1, 'rgba(255,120,40,0.28)');
    ctx.fillStyle = sg; ctx.fillRect(b.minX - camX, b.surf - 70, b.maxX - b.minX, 70);
    for(const [x, unten] of b.spalten) lavaSpalteZeichnen(ctx, x - camX, b.surf, 40, unten - b.surf, t, true);
    // heißer Regen (Vulkan, Wetter „regen“): Dampf steigt von der Lava auf (nur Bild)
    if(typeof weather !== 'undefined' && weather.rain > 0.05){
      for(const [x] of b.spalten){
        const ph = (t*0.5 + x*0.0071) % 1;
        ctx.fillStyle = 'rgba(235,230,225,' + (0.32*weather.rain*(1 - ph)) + ')';
        ctx.beginPath(); ctx.arc(x - camX + 20 + Math.sin(t + x)*6, b.surf - 6 - ph*70, 8 + ph*14, 0, Math.PI*2); ctx.fill();
      }
    }
  }
}
// gestrichelte Glut-Linie: bis hierhin steigt die Lava (Farbe der Nummer bzw. orange bei „sobald jemand kommt“)
function lavaMarkenZeichnen(){
  for(const b of lavaBecken) for(const m of b.marken){
    if(b.maxX < camX || b.minX > camX + VW || Math.abs(b.surf - m.y) < 1) continue;
    ctx.save(); ctx.setLineDash([10, 7]); ctx.lineDashOffset = -performance.now()*0.03;
    ctx.strokeStyle = m.link ? linkColor(m.link) : '#ff8a2a'; ctx.globalAlpha = 0.6; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(b.minX - camX, m.y); ctx.lineTo(b.maxX - camX, m.y); ctx.stroke(); ctx.restore();
  }
}
elementRegistrieren({
  id: 'lava', name: 'Lava', feld: 'lava',
  editor: {
    werkzeug: 'lava', gruppe: 'gefahren', art: 'punkt', ziehbar: true, farbe: '#ff6a1f',
    titel: 'Lava: tödliche, glühende Kästchen (mit gedrückter Maus malen). Zusammenhängende Kästchen = ein Becken; ' +
           'mit einer Lava-Marke darüber steigt die Lava',
    zeichnen(ctx, c, r, TILE){ lavaSpalteZeichnen(ctx, c*TILE, r*TILE, TILE, TILE, 0, true); },
    exportieren: (liste, TILE, mergeRects) => mergeRects(liste).map(r => ({x: r.x, y: r.y, w: r.w, h: r.h})),
  },
  spiel: {
    laden(daten){ lavaBecken = lavaBeckenBilden(daten.lava || []); },
    schritt: lavaSchritt,
    zuruecksetzen: lavaZuruecksetzen,
    zeichnenHinten(){ if(lavaBecken.length) lavaZeichnen(); },
  },
});
elementRegistrieren({
  id: 'lavapegel', name: 'Lava-Marke', feld: 'lavaPegel',
  editor: {
    werkzeug: 'lavapegel', gruppe: 'gefahren', art: 'punkt', ziehbar: false, farbe: '#ffb03a',
    titel: 'Lava-Marke: über/in ein Lava-Becken setzen. Ist sie aktiv, steigt die Lava bis zur Oberkante dieses Kästchens. ' +
           '„per Nummer“: solange die Verknüpfung an ist (Hebel bleibt, Druckplatte nur solange jemand draufsteht); ' +
           '„sobald jemand kommt“: steigt, sobald eine Figur über dem Becken ist (Lava-Flucht)',
    optionen: [
      {key: 'start', label: 'Start', werte: [['nummer', 'per Nummer'], ['naehe', 'sobald jemand kommt']]},
      {key: 'tempo', label: 'Tempo', werte: [['langsam', 'langsam'], ['mittel', 'mittel'], ['schnell', 'schnell']]},
    ],
    neu(p){
      const o = {c: p.c, r: p.r, start: p.start || 'nummer', tempo: p.tempo || 'mittel'};
      if(o.start === 'nummer') o.link = Number(linkSelect.value);
      return o;
    },
    nummerAktiv: p => p.start !== 'naehe' && !!p.link,
    mitNummer: false, nummerName: 'Lava steigt',
    zeichnen(ctx, c, r, TILE, p){
      const X = c*TILE, Y = r*TILE;
      ctx.strokeStyle = '#ff8a2a'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(X + 2, Y + 2); ctx.lineTo(X + TILE - 2, Y + 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#ff6a1f'; ctx.beginPath(); ctx.moveTo(X + 8, Y + 24); ctx.lineTo(X + 15, Y + 10); ctx.lineTo(X + 22, Y + 24); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tx = (p && p.start === 'naehe' ? '!' : String(p && p.link || '')) + ({langsam: '·', mittel: '»', schnell: '»»'}[p && p.tempo] || '');
      ctx.fillText(tx, X + 30, Y + 18);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE, tempo: p.tempo || 'mittel',
      start: p.start === 'naehe' ? 'naehe' : 'nummer', ...(p.start !== 'naehe' && p.link ? {link: p.link} : {})})),
  },
  spiel: {
    laden(daten){
      for(const p of (daten.lavaPegel || [])){
        // Becken, das an dieser Spalte liegt (bei mehreren das senkrecht nächste unter/an der Marke)
        let best = null, bd = Infinity;
        for(const b of lavaBecken){
          if(p.x < b.minX || p.x >= b.maxX) continue;
          const d = Math.abs(b.top - p.y);
          if(d < bd){ bd = d; best = b; }
        }
        if(best) best.marken.push({x: p.x, y: p.y, link: p.link || null, tempo: p.tempo || 'mittel', start: p.start === 'naehe' ? 'naehe' : 'nummer', ausgeloest: false});
      }
    },
    zeichnenVorne(){ lavaMarkenZeichnen(); },
  },
});
