// elemente/licht.js – Elemente „Lichtquelle“, „Spiegel“ und „Lichtkristall“ (Ausbau 7, Welt Ruinen; Punkt-Elemente).
// Eine Lichtquelle (Sonnen-Scheibe im Stein, fest wie eine Wand) schickt einen Lichtstrahl in ihre Richtung (→ ← ↑ ↓).
// Der Strahl läuft Kästchen für Kästchen, bis er auf Stein, eine geschlossene Tür, Wechselboden oder eine Falle trifft
// (Stege, Scheinwände und Figuren lässt er durch). Ein SPIEGEL ( / oder \ ) lenkt ihn um 90° um; jede Figur kann einen
// Spiegel in Reichweite mit ihrer Hebel-Taste (J / Num 2 / Kreis) umdrehen. Trifft der Strahl einen LICHTKRISTALL, ist
// dessen Verknüpfungs-Nummer AN, solange das Licht darauf fällt (wie eine Druckplatte: Türen auf, Bewegung fährt …).
// Rolle: Spiegel stehen oft dort, wo nur der Affe (per Haken) oder nur das Schweinchen (segelnd) hinkommt – einer lenkt
// das Licht, der andere geht durch die Tür, die der Kristall öffnet.
// Spiel-Daten: lichtquellen [{x, y (linke obere Ecke), richtung}], spiegel [{x, y, stellung: '/'|'\\'}], kristalle [{x, y, link}]
let lichtquellen = [], spiegelListe = [], kristalle = [];
let lichtWege = [];   // je Quelle: [[x, y], …] Punkte des Strahls (Welt-Koordinaten, Kästchen-Mitten)
const LICHT_RICHTUNG = {r: [1, 0], l: [-1, 0], o: [0, -1], u: [0, 1]};
const LICHT_PFEIL = {r: '→', l: '←', o: '↑', u: '↓'};
// Spiegel: '/' lenkt (dx, dy) nach (-dy, -dx), '\' nach (dy, dx) (y wächst nach unten)
function lichtUmlenken(st, dx, dy){ return st === '/' ? [-dy, -dx] : [dy, dx]; }
// Strahl verfolgen (gemeinsam für Spiel und Editor): fest(c, r) = blockiert?, spiegelBei(c, r), kristallBei(c, r)
function lichtVerfolgen(c, r, dx, dy, fest, spiegelBei, kristallBei){
  const weg = [[c, r]], getroffen = [], besucht = new Set();
  const MAX = typeof LICHT_REICHWEITE !== "undefined" ? LICHT_REICHWEITE : 80;   // Editor lädt 02-physik-werte.js nicht
  for(let i = 0; i < MAX; i++){
    c += dx; r += dy;
    const key = c + ',' + r + ',' + dx + ',' + dy;
    if(besucht.has(key)) break; besucht.add(key);
    const k = kristallBei(c, r);
    if(k){ weg.push([c, r]); getroffen.push(k); break; }
    const sp = spiegelBei(c, r);
    if(sp){ weg.push([c, r]); [dx, dy] = lichtUmlenken(sp.stellung, dx, dy); continue; }
    if(fest(c, r)){ weg.push([c - dx*0.5, r - dy*0.5]); break; }
    if(i === MAX - 1) weg.push([c, r]);
  }
  return {weg, getroffen};
}
function lichtFestImSpiel(c, r){
  const px = c*40 + 20, py = r*40 + 20;
  for(const s of solids){
    if(s.gone || s.type === 'oneway' || s.type === 'fake' || s.type === 'lichtquelle') continue;
    if(px >= s.x && px < s.x + s.w && py >= s.y && py < s.y + s.h) return true;
  }
  return false;
}
function lichtSchritt(){
  const spIdx = new Map(spiegelListe.map(s => [s.c + ',' + s.r, s])), kIdx = new Map(kristalle.map(k => [k.c + ',' + k.r, k]));
  const vorher = kristalle.map(k => k.an);
  for(const k of kristalle) k.an = false;
  lichtWege = lichtquellen.map(q => {
    const v = lichtVerfolgen(q.c, q.r, q.dx, q.dy, lichtFestImSpiel, (c, r) => spIdx.get(c + ',' + r), (c, r) => kIdx.get(c + ',' + r));
    for(const k of v.getroffen) k.an = true;
    return v.weg;
  });
  kristalle.forEach((k, i) => {
    if(k.an !== vorher[i] && k.x > camX - 80 && k.x < camX + VW + 80) SFX.kristall(k.x, k.an);
    if(k.an) k.leuchtT = Math.min(1, (k.leuchtT || 0) + 0.08); else k.leuchtT = Math.max(0, (k.leuchtT || 0) - 0.05);
  });
  for(const s of spiegelListe) if(s.drehT > 0) s.drehT--;
}
// (05-level-objekte.js, updatePlates) Kristall im Licht = Nummer an, wie eine gedrückte Druckplatte
function lichtWunsch(want){ for(const k of kristalle) if(k.link) want[k.link] = want[k.link] || !!k.an; }
// (05-level-objekte.js) Hebel-Taste ohne Hebel in Reichweite: nächsten Spiegel drehen
function spiegelBedienen(player){
  let best = null, bd = Infinity;
  for(const s of spiegelListe){
    if(Math.abs(player.x - (s.x + 20)) >= LEVER_RANGE_X || Math.abs((player.y - player.h*0.5) - (s.y + 20)) >= LEVER_RANGE_Y) continue;
    const d = Math.abs(player.x - (s.x + 20)); if(d < bd){ bd = d; best = s; }
  }
  if(!best) return false;
  best.stellung = best.stellung === '/' ? '\\' : '/'; best.drehT = 12;
  player.leverAnim = {t0: performance.now(), dir: Math.sign(best.x + 20 - player.x) || player.facing || 1};
  SFX.spiegel(best.x);
  return true;
}
function lichtZuruecksetzen(){ for(const s of spiegelListe){ s.stellung = s.start; s.drehT = 0; } for(const k of kristalle){ k.an = false; k.leuchtT = 0; } }
// --- Zeichnen (nur Anzeige) ---
function lichtQuelleBild(c, x, y, dx, dy, an){
  const gr = c.createLinearGradient(0, y, 0, y + 40);
  const W = (typeof THEME !== 'undefined' && THEME && THEME.wall && typeof camX !== 'undefined') ? THEME.wall : {top: '#dcc493', bottom: '#b3965e'};
  gr.addColorStop(0, W.top); gr.addColorStop(1, W.bottom);
  c.fillStyle = gr; c.fillRect(x, y, 40, 40);
  c.strokeStyle = 'rgba(70,45,20,.6)'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, 38, 38);
  const cx = x + 20 + dx*6, cy = y + 20 + dy*6;
  c.fillStyle = an ? '#ffd24a' : '#c9a24a';
  c.beginPath(); c.arc(cx, cy, 9, 0, Math.PI*2); c.fill();
  c.strokeStyle = an ? '#fff2b0' : '#8a6a2a'; c.lineWidth = 2;
  for(let i = 0; i < 8; i++){ const a = i/8*Math.PI*2; c.beginPath(); c.moveTo(cx + Math.cos(a)*11, cy + Math.sin(a)*11); c.lineTo(cx + Math.cos(a)*15, cy + Math.sin(a)*15); c.stroke(); }
}
function spiegelBild(c, x, y, stellung, dreh){
  // Sockel + drehbarer Spiegel in Bronze-Fassung
  c.fillStyle = '#9a7c50'; c.fillRect(x + 12, y + 30, 16, 10);
  c.fillStyle = '#b8955e'; c.fillRect(x + 8, y + 36, 24, 4);
  c.save(); c.translate(x + 20, y + 20);
  const winkel = (stellung === '/' ? -Math.PI/4 : Math.PI/4) + (dreh || 0);
  c.rotate(winkel);
  c.fillStyle = '#7a5a2a'; c.fillRect(-17, -4, 34, 8);
  const g = c.createLinearGradient(0, -3, 0, 3); g.addColorStop(0, '#f4fbff'); g.addColorStop(1, '#9fc6dc');
  c.fillStyle = g; c.fillRect(-15, -2.5, 30, 5);
  c.restore();
}
function kristallBild(c, x, y, leucht){
  c.fillStyle = '#9a7c50'; c.fillRect(x + 8, y + 32, 24, 8);
  if(leucht > 0){
    const g = c.createRadialGradient(x + 20, y + 18, 2, x + 20, y + 18, 34);
    g.addColorStop(0, `rgba(255,236,140,${0.6*leucht})`); g.addColorStop(1, 'rgba(255,236,140,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x + 20, y + 18, 34, 0, Math.PI*2); c.fill();
  }
  c.fillStyle = leucht > 0.5 ? '#fff3b0' : '#8fd0e0';
  c.beginPath(); c.moveTo(x + 20, y + 2); c.lineTo(x + 31, y + 16); c.lineTo(x + 26, y + 33); c.lineTo(x + 14, y + 33); c.lineTo(x + 9, y + 16); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(40,70,90,.6)'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.moveTo(x + 20, y + 4); c.lineTo(x + 25, y + 15); c.lineTo(x + 20, y + 20); c.closePath(); c.fill();
}
function lichtZeichnen(){
  const t = performance.now()*0.001;
  // Strahlen (unter allem anderen dieses Elements)
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for(const weg of lichtWege){
    if(weg.length < 2) continue;
    for(const [breit, farbe] of [[16, 'rgba(255,220,110,.18)'], [8, 'rgba(255,230,140,.45)'], [3, 'rgba(255,252,220,.95)']]){
      ctx.strokeStyle = farbe; ctx.lineWidth = breit + (breit > 10 ? Math.sin(t*4)*2 : 0);
      ctx.beginPath(); ctx.moveTo(weg[0][0]*40 + 20 - camX, weg[0][1]*40 + 20);
      for(let i = 1; i < weg.length; i++) ctx.lineTo(weg[i][0]*40 + 20 - camX, weg[i][1]*40 + 20);
      ctx.stroke();
    }
    // Funkeln entlang des Strahls
    for(let i = 0; i < weg.length - 1; i++){
      const ph = (t*0.8 + i*0.37) % 1, ax = weg[i][0], ay = weg[i][1], bx = weg[i + 1][0], by = weg[i + 1][1];
      const px = (ax + (bx - ax)*ph)*40 + 20 - camX, py = (ay + (by - ay)*ph)*40 + 20;
      ctx.globalAlpha = Math.sin(ph*Math.PI)*0.9; ctx.fillStyle = '#fffbe0';
      ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
  for(const q of lichtquellen){ const x = q.x - camX; if(x > -60 && x < VW + 60) lichtQuelleBild(ctx, x, q.y, q.dx, q.dy, true); }
  for(const s of spiegelListe){
    const x = s.x - camX; if(x < -60 || x > VW + 60) continue;
    const dreh = s.drehT > 0 ? (s.stellung === '/' ? 1 : -1)*(s.drehT/12)*Math.PI/2 : 0;
    spiegelBild(ctx, x, s.y, s.stellung, dreh);
  }
  for(const k of kristalle){ const x = k.x - camX; if(x > -60 && x < VW + 60) kristallBild(ctx, x, k.y, k.leuchtT || 0); }
}
ELEMENT_SOLID_TYPEN.add('lichtquelle');
// (Editor) Strahl-Vorschau über dem Raster: blockiert von festen Kästchen (nicht Steg/Schein/Aufwind), Spiegel/Kristalle
function lichtEditorVorschau(ctx, liste, TILE){
  const fest = (c, r) => { const t = typeof tiles !== 'undefined' ? tiles[c + ',' + r] : null; return !!t && !['oneway', 'fake', 'wind'].includes(t); };
  const pk = typeof elementPunkte !== 'undefined' ? elementPunkte : {};
  const sp = new Map((pk.spiegel || []).map(s => [s.c + ',' + s.r, {stellung: s.stellung || '/'}]));
  const kr = new Map((pk.kristalle || []).map(k => [k.c + ',' + k.r, k]));
  const falle = new Set((pk.traps || []).map(f => f.c + ',' + f.r)), quellen = new Set(liste.map(q => q.c + ',' + q.r));
  ctx.save(); ctx.strokeStyle = 'rgba(255,215,60,.85)'; ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
  for(const q of liste){
    const [dx, dy] = LICHT_RICHTUNG[q.richtung] || [1, 0];
    const v = lichtVerfolgen(q.c, q.r, dx, dy, (c, r) => fest(c, r) || falle.has(c + ',' + r) || quellen.has(c + ',' + r), (c, r) => sp.get(c + ',' + r), (c, r) => kr.get(c + ',' + r));
    ctx.beginPath(); ctx.moveTo(v.weg[0][0]*TILE + TILE/2, v.weg[0][1]*TILE + TILE/2);
    for(const [c, r] of v.weg.slice(1)) ctx.lineTo(c*TILE + TILE/2, r*TILE + TILE/2);
    ctx.stroke();
  }
  ctx.restore();
}
elementRegistrieren({
  id: 'lichtquelle', name: 'Lichtquelle', feld: 'lichtquellen',
  editor: {
    werkzeug: 'lichtquelle', gruppe: 'logik', vor: '#linkSelect', art: 'punkt', ziehbar: false, farbe: '#ffd24a',
    titel: 'Lichtquelle (Sonnen-Stein, fest): schickt einen Lichtstrahl in die gewählte Richtung. Spiegel lenken ihn um, ' +
           'ein Lichtkristall schaltet seine Nummer an, solange Licht darauf fällt. Gelbe Linie = Strahl. Klick = Richtung drehen',
    optionen: [{key: 'richtung', label: 'Richtung', werte: [['r', '→ rechts'], ['l', '← links'], ['o', '↑ hoch'], ['u', '↓ runter']]}],
    klick(p){ const o = ['r', 'u', 'l', 'o']; p.richtung = o[(o.indexOf(p.richtung || 'r') + 1) % 4]; },
    zeichnen(ctx, c, r, TILE, p){ const [dx, dy] = LICHT_RICHTUNG[p.richtung] || [1, 0]; ctx.save(); ctx.translate(c*TILE, r*TILE); ctx.scale(TILE/40, TILE/40); lichtQuelleBild(ctx, 0, 0, dx, dy, true); ctx.restore(); },
    zeichnenAlle: lichtEditorVorschau,
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, richtung: p.richtung || 'r'})),
  },
  spiel: {
    laden(daten){
      lichtquellen = (daten.lichtquellen || []).map(q => {
        const [dx, dy] = LICHT_RICHTUNG[q.richtung] || [1, 0];
        solids.push({x: q.x, y: q.y, w: 40, h: 40, type: 'lichtquelle'});
        return {x: q.x, y: q.y, c: Math.round(q.x/40), r: Math.round(q.y/40), dx, dy};
      });
      lichtWege = [];
    },
    schritt: lichtSchritt,
    zuruecksetzen: lichtZuruecksetzen,
    zeichnen(){ if(lichtquellen.length || spiegelListe.length || kristalle.length) lichtZeichnen(); },
  },
});
elementRegistrieren({
  id: 'spiegel', name: 'Spiegel', feld: 'spiegel',
  editor: {
    werkzeug: 'spiegel', gruppe: 'logik', vor: '#linkSelect', art: 'punkt', ziehbar: false, farbe: '#bfe0f0',
    titel: 'Spiegel: lenkt den Lichtstrahl um 90° ( / oder \\ ). Im Spiel drehen ihn beide Figuren mit der Hebel-Taste. ' +
           'Klick auf einen vorhandenen Spiegel = Stellung wechseln',
    optionen: [{key: 'stellung', label: 'Stellung', werte: [['/', '/'], ['\\', '\\']]}],
    klick(p){ p.stellung = p.stellung === '/' ? '\\' : '/'; },
    zeichnen(ctx, c, r, TILE, p){ ctx.save(); ctx.translate(c*TILE, r*TILE); ctx.scale(TILE/40, TILE/40); spiegelBild(ctx, 0, 0, p.stellung || '/', 0); ctx.restore(); },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, stellung: p.stellung === '\\' ? '\\' : '/'})),
  },
  spiel: {
    laden(daten){
      spiegelListe = (daten.spiegel || []).map(s => ({x: s.x, y: s.y, c: Math.round(s.x/40), r: Math.round(s.y/40),
        stellung: s.stellung === '\\' ? '\\' : '/', start: s.stellung === '\\' ? '\\' : '/', drehT: 0}));
    },
  },
});
elementRegistrieren({
  id: 'kristall', name: 'Lichtkristall', feld: 'kristalle',
  editor: {
    werkzeug: 'kristall', gruppe: 'logik', vor: '#linkSelect', art: 'punkt', ziehbar: false, farbe: '#8fd0e0',
    mitNummer: true, nummerName: 'Lichtkristall',
    titel: 'Lichtkristall: solange ein Lichtstrahl darauf fällt, ist seine Verknüpfung AN (wie eine gedrückte Druckplatte)',
    zeichnen(ctx, c, r, TILE, p){
      ctx.save(); ctx.translate(c*TILE, r*TILE); ctx.scale(TILE/40, TILE/40); kristallBild(ctx, 0, 0, 0); ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.strokeText(String(p.link), c*TILE + TILE - 8, r*TILE + 9); ctx.fillText(String(p.link), c*TILE + TILE - 8, r*TILE + 9);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, link: p.link})),
  },
  spiel: {
    laden(daten){ kristalle = (daten.kristalle || []).map(k => ({x: k.x, y: k.y, c: Math.round(k.x/40), r: Math.round(k.y/40), link: k.link, an: false, leuchtT: 0})); },
  },
});
