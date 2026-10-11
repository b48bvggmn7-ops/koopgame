// elemente/leuchtkristall.js – Elemente „Leuchtkristall“ und „Dunkelzone“ (Ausbau 7, Welt Höhle; Punkt-Elemente).
// DUNKELZONE: In diesen Kästchen ist es fast stockdunkel (DUNKEL_STAERKE) – um die Figuren leuchtet nur ein kleiner
// Kreis (DUNKEL_FIGUR). Münzen, Haken, Hebel, Checkpoints und das Ziel glimmen schwach, damit man nie blind springt.
// LEUCHTKRISTALL: glimmt im Dunkeln schwach. Mit der Hebel-Taste (J / Num 2 / Kreis) angeschlagen leuchtet er
// LEUCHT_DAUER lang hell und weit (LEUCHT_RADIUS); in den letzten 2 Sekunden flackert er zur Warnung.
// Mit „per Nummer“ leuchtet er dauerhaft, solange seine Verknüpfungs-Nummer an ist (Hebel/Druckplatte).
// Das Anschlagen hängt im Verknüpfungs-System (js/05-level-objekte.js): Hebel-Taste ohne Hebel und ohne Spiegel in
// Reichweite -> leuchtAnschlagen(figur). Das Licht kommt in themeLights / drawThemeDarkness (js/10a-themen.js) dazu.
// Rolle: einer schlägt Kristalle an (der Affe hohe per Haken, das Schweinchen ferne segelnd), der andere läuft im
// Licht; wer vorne läuft, leuchtet dem anderen den Weg.
// Spiel-Daten: leuchtkristalle [{x, y (Mitte), link?}], dunkelzonen [{x, y, w, h}]
let leuchtKristalle = [];   // {x, y, link, t (Restschritte), schlagT}
let dunkelZonen = [];
function leuchtStaerke(k){
  if(k.link && linkOn[k.link]) return 1;
  if(k.t <= 0) return 0;
  if(k.t > LEUCHT_WARN) return Math.min(1, (LEUCHT_DAUER - k.t + 1)/8);   // kurz aufblühen
  return 0.35 + 0.65*(k.t/LEUCHT_WARN)*(0.75 + 0.25*Math.sin(k.t*0.9));   // flackern und ausgehen
}
const leuchtImBild = k => k.x > camX - 80 && k.x < camX + VW + 80;
function leuchtSchritt(){
  for(const k of leuchtKristalle){
    if(k.t > 0){ k.t--; if(k.t === LEUCHT_WARN && leuchtImBild(k)) SFX.leuchtFlacker(k.x); }
    if(k.schlagT > 0) k.schlagT--;
  }
}
// (05-level-objekte.js) Hebel-Taste ohne Hebel/Spiegel: nächsten Kristall in Reichweite anschlagen
function leuchtAnschlagen(player){
  let best = null, bd = Infinity;
  for(const k of leuchtKristalle){
    const dx = Math.abs(player.x - k.x), dy = Math.abs((player.y - player.h*0.5) - k.y);
    if(dx >= LEUCHT_REICHWEITE || dy >= LEUCHT_REICHWEITE) continue;
    if(dx < bd){ bd = dx; best = k; }
  }
  if(!best) return false;
  best.t = LEUCHT_DAUER; best.schlagT = 14;
  player.leverAnim = {t0: performance.now(), dir: Math.sign(best.x - player.x) || player.facing || 1};
  SFX.leuchtAn(best.x);
  return true;
}
function leuchtZuruecksetzen(){ for(const k of leuchtKristalle){ k.t = 0; k.schlagT = 0; } }
// Lichtquellen für die normale Dunkelheit (themeLights): Glimmen + heller Kreis
function leuchtLichter(L){
  for(const k of leuchtKristalle){
    L.push([k.x, k.y, 48]);
    const s = leuchtStaerke(k);
    if(s > 0) L.push([k.x, k.y, LEUCHT_RADIUS*s]);
  }
}
const imDunkel = (x, y) => dunkelZonen.some(z => x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h);
// Dunkelzonen über die fertige Welt legen (nach der normalen Dunkelheit; Bildschirm-Koordinaten wie drawThemeDarkness)
let dunkelCanvas = null;
function dunkelZeichnen(){
  if(!dunkelZonen.length) return;
  const sx = wx => (wx - camX)*zoom, sy = wy => wy*zoom + H*(1 - zoom);
  const sicht = dunkelZonen.filter(z => sx(z.x + z.w) > -80 && sx(z.x) < W + 80);
  if(!sicht.length) return;
  if(!dunkelCanvas){ dunkelCanvas = document.createElement('canvas'); dunkelCanvas.width = W; dunkelCanvas.height = H; }
  const g = dunkelCanvas.getContext('2d'), F = 50*zoom;   // weicher Rand
  g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
  const col = (a) => `rgba(3,2,10,${a})`;
  for(const z of sicht){
    const x0 = sx(z.x), x1 = sx(z.x + z.w), y0 = sy(z.y), y1 = sy(z.y + z.h);
    g.fillStyle = col(DUNKEL_STAERKE); g.fillRect(x0, y0, x1 - x0, y1 - y0);
    // weicher Übergang links/rechts nur dort, wo keine Nachbar-Zone anschließt
    if(!dunkelZonen.some(o => o !== z && Math.abs(o.x + o.w - z.x) < 1 && o.y < z.y + z.h && o.y + o.h > z.y)){
      const gr = g.createLinearGradient(x0 - F, 0, x0, 0); gr.addColorStop(0, col(0)); gr.addColorStop(1, col(DUNKEL_STAERKE));
      g.fillStyle = gr; g.fillRect(x0 - F, y0, F, y1 - y0);
    }
    if(!dunkelZonen.some(o => o !== z && Math.abs(o.x - (z.x + z.w)) < 1 && o.y < z.y + z.h && o.y + o.h > z.y)){
      const gr = g.createLinearGradient(x1, 0, x1 + F, 0); gr.addColorStop(0, col(DUNKEL_STAERKE)); gr.addColorStop(1, col(0));
      g.fillStyle = gr; g.fillRect(x1, y0, F, y1 - y0);
    }
  }
  // Licht hineinschneiden
  const L = [];
  for(const p of [p1, p2]) if(p) L.push([p.x, p.y - p.h*0.5, DUNKEL_FIGUR]);
  leuchtLichter(L);
  if(typeof lavaLichter === 'function') lavaLichter(L);   // Lava leuchtet (elemente/lava.js)
  for(const c of coins) if(!c.taken) L.push([c.x, c.y, 34]);
  for(const h of hooks) L.push([h.x, h.y, 46]);
  for(const sw of switchDefs) L.push([sw.x, sw.y, 50]);
  for(const cp of checkpointDefs) L.push([cp.x, cp.y - 30, 70]);
  if(goal) L.push([goal.x, goal.y - 30, 120]);
  g.globalCompositeOperation = 'destination-out';
  for(const [wx, wy, r] of L){
    const x = sx(wx), y = sy(wy), rr = r*zoom;
    if(x < -rr || x > W + rr) continue;
    const gr = g.createRadialGradient(x, y, 0, x, y, rr);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.65, 'rgba(0,0,0,0.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, Math.PI*2); g.fill();
  }
  g.globalCompositeOperation = 'source-over';
  ctx.drawImage(dunkelCanvas, 0, 0);
}
// Bild eines Kristalls (Spiel und Editor): violett-türkise Spitzen auf Stein, s = Leuchtstärke 0 … 1
function leuchtBild(c, x, y, s, schlag){
  c.save(); c.translate(x, y);
  if(s > 0){
    const gl = c.createRadialGradient(0, 0, 2, 0, 0, 34);
    gl.addColorStop(0, `rgba(180,250,255,${0.75*s})`); gl.addColorStop(1, 'rgba(180,250,255,0)');
    c.fillStyle = gl; c.beginPath(); c.arc(0, 0, 34, 0, Math.PI*2); c.fill();
  }
  if(schlag) c.rotate(Math.sin(schlag*1.3)*0.08);
  c.fillStyle = '#3a3150'; c.beginPath(); c.ellipse(0, 15, 16, 6, 0, 0, Math.PI*2); c.fill();   // Steinsockel
  const spitzen = [[-9, 14, -12, -6, 5], [0, 15, 0, -18, 6], [9, 14, 11, -4, 5]];
  for(const [bx, by, tx, ty, w] of spitzen){
    const gr = c.createLinearGradient(bx, by, tx, ty);
    gr.addColorStop(0, '#6a4fb0'); gr.addColorStop(1, s > 0 ? '#e8ffff' : '#8fe8f0');
    c.fillStyle = gr; c.beginPath(); c.moveTo(bx - w, by); c.lineTo(tx, ty); c.lineTo(bx + w, by); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(bx, by); c.lineTo(tx, ty); c.stroke();
  }
  c.restore();
}
function leuchtZeichnen(){
  for(const k of leuchtKristalle){
    const x = k.x - camX;
    if(x < -60 || x > VW + 60) continue;
    leuchtBild(ctx, x, k.y, Math.max(0.15, leuchtStaerke(k)), k.schlagT);
  }
}
elementRegistrieren({
  id: 'leuchtkristall', name: 'Leuchtkristall', feld: 'leuchtkristalle',
  editor: {
    werkzeug: 'leucht', gruppe: 'logik', vor: '#linkSelect', art: 'punkt', ziehbar: false, farbe: '#8fe8f0',
    titel: 'Leuchtkristall: glimmt im Dunkeln; mit der Hebel-Taste angeschlagen leuchtet er 8 s hell und weit (flackert ' +
           'vorher). „per Nummer“: leuchtet, solange die Verknüpfung an ist',
    optionen: [
      {key: 'schalter', label: 'Leuchten', titel: 'Anschlagen (8 s) – oder dauerhaft, solange die gewählte Verknüpfungs-Nummer an ist',
       werte: [['anschlagen', 'anschlagen'], ['nummer', 'per Nummer']]},
    ],
    neu(p){
      const o = {c: p.c, r: p.r, schalter: p.schalter};
      if(p.schalter === 'nummer') o.link = Number(linkSelect.value);
      return o;
    },
    nummerAktiv: p => p.schalter === 'nummer' && !!p.link,
    mitNummer: false, nummerName: 'Leuchtkristall',
    zeichnen(ctx, c, r, TILE, p){
      leuchtBild(ctx, c*TILE + TILE/2, r*TILE + TILE/2, p.link ? 0.6 : 0.25, 0);
      if(p.link){ ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.strokeText(String(p.link), c*TILE + TILE - 8, r*TILE + 8); ctx.fillText(String(p.link), c*TILE + TILE - 8, r*TILE + 8); }
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE + TILE/2, ...(p.schalter === 'nummer' && p.link ? {link: p.link} : {})})),
  },
  spiel: {
    laden(daten){ leuchtKristalle = (daten.leuchtkristalle || []).map(k => ({x: k.x, y: k.y, link: k.link || null, t: 0, schlagT: 0})); },
    schritt: leuchtSchritt,
    zuruecksetzen: leuchtZuruecksetzen,
    zeichnen(){ if(leuchtKristalle.length) leuchtZeichnen(); },
  },
});
elementRegistrieren({
  id: 'dunkelzone', name: 'Dunkelzone', feld: 'dunkelzonen',
  editor: {
    werkzeug: 'dunkel', gruppe: 'gelaende', vor: 'fake', art: 'punkt', ziehbar: true, farbe: '#14101f',
    titel: 'Dunkelzone: hier ist es fast stockdunkel, nur ein kleiner Lichtkreis um die Figuren – Leuchtkristalle helfen. ' +
           'Mit gedrückter Maus malen',
    zeichnen(ctx, c, r, TILE){
      ctx.fillStyle = 'rgba(10,6,24,.55)'; ctx.fillRect(c*TILE, r*TILE, TILE, TILE);
      ctx.fillStyle = 'rgba(180,170,255,.6)'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('☾', c*TILE + TILE/2, r*TILE + TILE/2);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, w: TILE, h: TILE})),
  },
  spiel: {
    laden(daten){
      // Kästchen zu Reihen zusammenfassen (weniger Rechtecke, weicher Rand nur außen)
      const roh = (daten.dunkelzonen || []).map(z => ({x: z.x, y: z.y, w: z.w || 40, h: z.h || 40})).sort((a, b) => a.y - b.y || a.x - b.x);
      dunkelZonen = [];
      for(const z of roh){
        const v = dunkelZonen[dunkelZonen.length - 1];
        if(v && v.y === z.y && v.h === z.h && Math.abs(v.x + v.w - z.x) < 1) v.w += z.w; else dunkelZonen.push({...z});
      }
    },
  },
});
