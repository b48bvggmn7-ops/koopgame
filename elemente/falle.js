// elemente/falle.js – Element „Falle“ (Ausbau 7, Welt Ruinen; Punkt-Element, siehe 00-register.js).
// Ein Stein-Kopf (fest wie eine Wand) mit Pfeil-Schlitz oder Flammen-Düse, der in eine Richtung (→ ← ↑ ↓) im TAKT feuert:
//   - Pfeil: zu Beginn jedes Takts fliegt ein Pfeil los, bis er gegen Stein/Tür/Wechselboden stößt (bleibt kurz stecken).
//   - Flamme: brennt den ersten Teil jedes Takts (FLAMME_ANTEIL) bis zu FLAMME_LAENGE Kästchen weit (Stein stoppt sie).
//   Vorwarnung (FALLE_WARN Schritte vorher): der Schlitz glüht bzw. die Düse raucht und knistert – keine Zufallstode.
//   Versatz: verschiebt den Takt (0 … ¾), damit Fallen nacheinander feuern (Rhythmus).
//   Optional „per Nummer aus“: solange die gewählte Verknüpfung AN ist (Hebel/Druckplatte), ist die Falle still.
// Takt-Uhr fallenSchritte zählt Physik-Schritte seit Levelstart/Neustart/Tod (gleicher Rhythmus nach jedem Neustart).
// Rolle: Affe wartet am Seil hängend den Takt ab bzw. schwingt durch die Lücke; das Schweinchen segelt langsam und lässt
// Pfeile unter sich durch; einer stellt per Hebel die Fallen für den anderen ab.
// Spiel-Daten: traps [{x, y (linke obere Ecke des Kästchens), art: 'pfeil'|'flamme', richtung, takt (s), versatz (0…1), link?}]
let fallen = [];        // {x, y, art, dx, dy, takt, versatz, link, flammeLen}
let fallenPfeile = [];  // {x, y, dx, dy, steckt (Schritte seit dem Einschlag, -1 = fliegt), quelle}
let fallenSchritte = 0;
const FALLE_RICHTUNG = {r: [1, 0], l: [-1, 0], o: [0, -1], u: [0, 1]};
const FALLE_PFEIL = {r: '→', l: '←', o: '↑', u: '↓'};
function falleTaktSchritte(f){ return Math.max(30, Math.round(f.takt*60)); }
function falleAktiv(f){ return !(f.link && linkOn[f.link]); }
function falleZeit(f){ const n = falleTaktSchritte(f); return (((fallenSchritte - FALLE_WARN - Math.round(f.versatz*n)) % n) + n) % n; }   // Versatz = später im Takt; nach (Neu-)Start erst Warnung, dann Schuss
// 0 … 1: Vorwarnung vor dem nächsten Schuss bzw. Zünden (0 = keine)
function falleWarnung(f){
  if(!falleAktiv(f)) return 0;
  const rest = falleTaktSchritte(f) - falleZeit(f);
  return rest <= FALLE_WARN ? 1 - rest/FALLE_WARN : 0;
}
function falleBrennt(f){ return f.art === 'flamme' && falleAktiv(f) && falleZeit(f) < falleTaktSchritte(f)*FLAMME_ANTEIL; }
// fest für Pfeile/Flammen: Stein, Wand, geschlossene Tür, Wechselboden (nicht: Stege, Scheinwände, Aufwind)
// Raster-Verzeichnis (Ruckeln behoben): je 40er-Kästchen die feststehenden Teile, die es berühren – vorher wurde bei
// jedem 4-px-Schritt einer Flamme JEDES Teil des Levels geprüft (in Fallen-Leveln über 10 ms je Spielschritt).
// Bewegliche Sorten (bewegte Böden, Element-Sorten) werden weiter einzeln geprüft. Gleiches Ergebnis.
const FALLE_FESTE_TYPEN = new Set(['ground', 'wall', 'crumble', 'door', 'platform']);
let falleGitter = {src: null, n: -1, map: null, beweglich: []};
function falleGitterHolen(){
  if(falleGitter.src === solids && falleGitter.n === solids.length) return falleGitter;
  const map = new Map(), beweglich = [];
  for(const s of solids){
    if(s.type === 'oneway' || s.type === 'fake') continue;
    if(!FALLE_FESTE_TYPEN.has(s.type)){ beweglich.push(s); continue; }
    for(let c = Math.floor(s.x/40); c <= Math.floor((s.x + s.w - 0.001)/40); c++)
      for(let r = Math.floor(s.y/40); r <= Math.floor((s.y + s.h - 0.001)/40); r++){
        const k = c + ',' + r; let l = map.get(k); if(!l) map.set(k, l = []); l.push(s);
      }
  }
  return falleGitter = {src: solids, n: solids.length, map, beweglich};
}
function falleFestBei(px, py, ausser){
  const G = falleGitter.src === solids && falleGitter.n === solids.length ? falleGitter : falleGitterHolen();
  const l = G.map.get(Math.floor(px/40) + ',' + Math.floor(py/40));
  if(l) for(const s of l){
    if(s === ausser || s.gone) continue;
    if(px >= s.x && px < s.x + s.w && py >= s.y && py < s.y + s.h) return true;
  }
  for(const s of G.beweglich){
    if(s === ausser || s.gone) continue;
    if(px >= s.x && px < s.x + s.w && py >= s.y && py < s.y + s.h) return true;
  }
  return false;
}
// Austrittspunkt an der Seite des Kopfes
function falleMund(f){ return {x: f.x + 20 + f.dx*20, y: f.y + 20 + f.dy*20}; }
// Flammen-Rechteck (Länge bis zum ersten Hindernis)
function falleFlammeBox(f){
  const m = falleMund(f), len = f.flammeLen, breit = FLAMME_BREITE;
  if(f.dx) return {x: f.dx > 0 ? m.x : m.x - len, y: m.y - breit/2, w: len, h: breit};
  return {x: m.x - breit/2, y: f.dy > 0 ? m.y : m.y - len, w: breit, h: len};
}
const falleFigurBox = pl => ({x: pl.x - pl.w/2 + 3, y: pl.y - pl.h + 3, w: pl.w - 6, h: pl.h - 5});   // etwas gnädiger als der Körper
function fallenSchritt(players){
  fallenSchritte++;
  let schuss = null, zuend = null, warn = null;
  for(const f of fallen){
    const sichtbar = f.x > camX - 80 && f.x < camX + VW + 80;
    // Flammen-Länge: bis zum ersten festen Kästchen (Türen können sich ändern)
    if(f.art === 'flamme'){
      const m = falleMund(f); let len = 0;
      while(len < FLAMME_LAENGE*40 && !falleFestBei(m.x + f.dx*(len + 4), m.y + f.dy*(len + 4), f.block)) len += 4;
      f.flammeLen = len;
    }
    if(!falleAktiv(f)) continue;
    const t = falleZeit(f), n = falleTaktSchritte(f);
    if(n - t === FALLE_WARN && sichtbar) warn = f;
    if(t === 0){
      if(f.art === 'pfeil'){ const m = falleMund(f); fallenPfeile.push({x: m.x, y: m.y, dx: f.dx, dy: f.dy, steckt: -1, weg: 0}); if(sichtbar) schuss = f; }
      else if(sichtbar) zuend = f;
    }
    if(falleBrennt(f)){
      const box = falleFlammeBox(f);
      for(const pl of players) if(pl && !deathState && rectsOverlap(falleFigurBox(pl), box)){ die(pl); return; }
    }
  }
  // Pfeile fliegen
  for(const a of fallenPfeile){
    if(a.steckt >= 0){ a.steckt++; continue; }
    for(let k = 0; k < PFEIL_TEMPO; k += 2){
      a.x += a.dx*2; a.y += a.dy*2; a.weg += 2;
      if(falleFestBei(a.x + a.dx*2, a.y + a.dy*2) || a.weg > PFEIL_REICHWEITE){ a.steckt = 0; pfeilEinschlag(a); break; }
    }
    if(a.steckt < 0){
      const tip = {x: a.x - PFEIL_TREFFER/2, y: a.y - PFEIL_TREFFER/2, w: PFEIL_TREFFER, h: PFEIL_TREFFER};
      for(const pl of players) if(pl && !deathState && rectsOverlap(falleFigurBox(pl), tip)){ die(pl); return; }
    }
  }
  fallenPfeile = fallenPfeile.filter(a => a.steckt < PFEIL_STECKT);
  if(schuss) SFX.pfeil(schuss.x);
  if(zuend) SFX.flamme(zuend.x);
  if(warn) SFX.fallenWarn(warn.x, warn.art === 'flamme');
}
// Einschlag: kleine Staubwolke und Funken an der Spitze (nur Anzeige, über coinFx wie beim Fels)
function pfeilEinschlag(a){
  if(a.x < camX - 60 || a.x > camX + VW + 60 || typeof coinFx === 'undefined') return;
  const now = performance.now(), sx = a.x + a.dx*6, sy = a.y + a.dy*6;
  for(let k = 0; k < 3; k++) coinFx.push({type: 'poof', x: sx - a.dx*4, y: sy - a.dy*4, t0: now,
    vx: -a.dx*(0.6 + k*0.3) + a.dy*(k - 1)*0.7, vy: -a.dy*(0.6 + k*0.3) + a.dx*(k - 1)*0.7 - 0.2, size: 4 + k});
  for(let k = 0; k < 4; k++) coinFx.push({type: 'spark', x: sx, y: sy, t0: now, size: 4, col: ['#ffd27a', '#fff3c0'],
    vx: -a.dx*1.6 + a.dy*(k - 1.5)*1.3, vy: -a.dy*1.6 + a.dx*(k - 1.5)*1.3 - 0.6});
}
// Lichter in dunklen Leveln (10a drawThemeDarkness): fliegende Pfeile, glühende Köpfe, Flammen
function fallenLichter(L){
  for(const a of fallenPfeile) if(a.steckt < 0) L.push([a.x, a.y, PFEIL_LICHT]);
  for(const f of fallen){
    const m = falleMund(f), w = falleWarnung(f);
    if(w > 0) L.push([m.x, m.y, 40 + 40*w]);
    if(falleBrennt(f)) L.push([m.x + f.dx*f.flammeLen/2, m.y + f.dy*f.flammeLen/2, 50 + f.flammeLen*0.6]);
  }
}
function fallenZuruecksetzen(){ fallenSchritte = 0; fallenPfeile = []; }
// --- Zeichnen (nur Anzeige) ---
function falleKopfZeichnen(c, x, y, f, warn, aus){
  // Sandstein-Block mit dunklem Rand
  const gr = c.createLinearGradient(0, y, 0, y + 40);
  // im Spiel: Farben der Wände des Levels (passt zu Tageszeit/Welt), im Editor Sandstein
  const W = (typeof THEME !== 'undefined' && THEME && THEME.wall && typeof camX !== 'undefined') ? THEME.wall : {top: '#d9c08a', bottom: '#b0935c'};
  gr.addColorStop(0, aus ? '#9a917f' : W.top); gr.addColorStop(1, aus ? '#7a7264' : W.bottom);
  c.fillStyle = gr; c.fillRect(x, y, 40, 40);
  c.strokeStyle = 'rgba(70,45,20,.6)'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, 38, 38);
  c.fillStyle = 'rgba(255,240,200,.35)'; c.fillRect(x + 3, y + 3, 34, 3);
  // Gesicht zur Schussrichtung: Augen + Mund (Schlitz/Düse)
  const cx = x + 20, cy = y + 20, mx = cx + f.dx*13, my = cy + f.dy*13;
  c.fillStyle = 'rgba(60,35,15,.75)';
  if(f.dx){ c.fillRect(cx - 9*f.dx - 3, cy - 11, 6, 4); }
  else { c.fillRect(cx - 11, cy - 9*f.dy - 2, 4, 6); c.fillRect(cx + 7, cy - 9*f.dy - 2, 4, 6); }
  const glut = aus ? 0 : warn;
  if(f.art === 'pfeil'){
    c.fillStyle = '#2a1a0e';
    if(f.dx) c.fillRect(mx - 3, my - 7, 6, 14); else c.fillRect(mx - 7, my - 3, 14, 6);
    if(glut > 0){
      // Vorwarnung: heller Schein um den Schlitz, der Schlitz glüht, die Pfeilspitze schaut schon heraus (Richtung!)
      const sch = c.createRadialGradient(mx, my, 2, mx, my, 12 + 12*glut);
      sch.addColorStop(0, `rgba(255,${glut > 0.6 ? 90 : 170},40,${0.55 + 0.4*glut})`); sch.addColorStop(1, 'rgba(255,120,40,0)');
      c.fillStyle = sch; c.beginPath(); c.arc(mx, my, 12 + 12*glut, 0, Math.PI*2); c.fill();
      c.fillStyle = glut > 0.6 ? '#ff5a2a' : '#ffb03a';
      if(f.dx) c.fillRect(mx - 2, my - 5, 4, 10); else c.fillRect(mx - 5, my - 2, 10, 4);
      c.save(); c.translate(mx + f.dx*(glut*9 - 7), my + f.dy*(glut*9 - 7)); c.rotate(Math.atan2(f.dy, f.dx));
      pfeilSpitze(c, 0, 1); c.restore();
    }
  } else {
    c.fillStyle = '#2a1a0e'; c.beginPath(); c.arc(mx, my, 6.5, 0, Math.PI*2); c.fill();
    c.fillStyle = aus ? '#555' : '#4a2a12'; c.beginPath(); c.arc(mx, my, 3.5, 0, Math.PI*2); c.fill();
    if(glut > 0){
      const sch = c.createRadialGradient(mx, my, 2, mx, my, 12 + 12*glut);
      sch.addColorStop(0, `rgba(255,140,30,${0.5 + 0.45*glut})`); sch.addColorStop(1, 'rgba(255,120,30,0)');
      c.fillStyle = sch; c.beginPath(); c.arc(mx, my, 12 + 12*glut, 0, Math.PI*2); c.fill();
      c.globalAlpha = 0.3 + 0.7*glut; c.fillStyle = '#ff7a1a'; c.beginPath(); c.arc(mx, my, 4 + 2*glut, 0, Math.PI*2); c.fill(); c.globalAlpha = 1;
      if(glut > 0.5){   // Zündflamme: kleine Zunge in Schussrichtung
        const z = (glut - 0.5)*2*10;
        c.fillStyle = 'rgba(255,200,80,.9)'; c.beginPath();
        c.moveTo(mx + f.dy*4, my + f.dx*4); c.lineTo(mx + f.dx*(6 + z), my + f.dy*(6 + z)); c.lineTo(mx - f.dy*4, my - f.dx*4); c.fill();
      }
    }
  }
}
function fallenZeichnen(){
  const t = performance.now()*0.001;
  for(const f of fallen){
    const x = Math.round(f.x - camX);
    if(x < -120 - FLAMME_LAENGE*40 || x > VW + 120 + FLAMME_LAENGE*40) continue;
    const warn = falleWarnung(f), aus = !falleAktiv(f);
    // Vorwarnung Flamme: Rauch-Wölkchen und Funken vor der Düse
    if(f.art === 'flamme' && warn > 0){
      const m = falleMund(f);
      for(let i = 0; i < 4; i++){
        const ph = (t*1.6 + i*0.25) % 1, wob = Math.sin(t*6 + i*2)*4;
        const px = m.x - camX + f.dx*ph*26 + (f.dy ? wob : 0), py = m.y + f.dy*ph*26 + (f.dx ? wob : -ph*8);
        c_rauch(px, py, 4 + ph*7, (1 - ph)*0.45*warn);
      }
    }
    if(falleBrennt(f) && f.flammeLen > 4) flammeZeichnen(f, t);
    falleKopfZeichnen(ctx, x, f.y, f, warn, aus);
  }
  // Pfeile
  for(const a of fallenPfeile){
    const x = a.x - camX; if(x < -90 || x > VW + 90) continue;
    ctx.save(); ctx.translate(x, a.y); ctx.rotate(Math.atan2(a.dy, a.dx));
    if(a.steckt >= 0){
      // steckt: Einschlag-Riss im Stein, der Pfeil zittert kurz nach und verblasst
      const k = a.steckt/PFEIL_STECKT, zit = a.steckt < 10 ? Math.sin(a.steckt*2.2)*2.2*(1 - a.steckt/10) : 0;
      ctx.globalAlpha = Math.max(0, 1 - k);
      ctx.strokeStyle = 'rgba(40,22,10,.8)'; ctx.lineWidth = 2;
      ctx.beginPath(); for(const [u, v] of [[9, -8], [12, 1], [8, 9]]){ ctx.moveTo(6, 0); ctx.lineTo(u, v); } ctx.stroke();
      ctx.rotate(zit*0.04);
      pfeilBild(ctx, 0);
    } else pfeilBild(ctx, Math.min(PFEIL_SCHWEIF, a.weg));
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
// Pfeil-Spitze (Stahl mit dunklem Umriss); Spitze bei x = 7, Trefferfläche ±PFEIL_TREFFER/2 um x = 0
function pfeilSpitze(c, x, a){
  c.globalAlpha *= a;
  c.beginPath(); c.moveTo(x + 7, 0); c.lineTo(x - 7, -7); c.lineTo(x - 4, 0); c.lineTo(x - 7, 7); c.closePath();
  c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#1a0f06'; c.stroke();
  c.fillStyle = '#eef3f6'; c.fill();
  c.fillStyle = '#9aa7b2'; c.beginPath(); c.moveTo(x + 7, 0); c.lineTo(x - 5, 1.5); c.lineTo(x - 6, 6); c.closePath(); c.fill();
}
// ganzer Pfeil in Flugrichtung (+x), Ursprung = Treffer-Mitte; schweif = Länge der Bewegungsspur (0 = keine)
function pfeilBild(c, schweif){
  const L = PFEIL_BILD_LAENGE, D = PFEIL_BILD_DICKE, hinten = 7 - L;
  if(schweif > 4){   // Bewegungsspur: heller Streifen, der nach hinten ausläuft
    const g = c.createLinearGradient(hinten, 0, hinten - schweif, 0);
    g.addColorStop(0, 'rgba(255,248,225,.75)'); g.addColorStop(1, 'rgba(255,248,225,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(hinten + 6, -3.5); c.lineTo(hinten - schweif, -1); c.lineTo(hinten - schweif, 1); c.lineTo(hinten + 6, 3.5); c.fill();
  }
  // Schaft: dunkler Umriss, helles Holz
  c.fillStyle = '#1a0f06'; c.fillRect(hinten - 1, -D/2 - 2, L - 6, D + 4);
  c.fillStyle = '#f2dcae'; c.fillRect(hinten, -D/2, L - 8, D);
  c.fillStyle = 'rgba(140,90,40,.55)'; c.fillRect(hinten, D/2 - 1.5, L - 8, 1.5);
  // Federn: rot mit dunklem Umriss
  c.beginPath(); c.moveTo(hinten + 13, -2); c.lineTo(hinten + 2, -9); c.lineTo(hinten - 3, -9); c.lineTo(hinten + 3, -2);
  c.lineTo(hinten + 3, 2); c.lineTo(hinten - 3, 9); c.lineTo(hinten + 2, 9); c.lineTo(hinten + 13, 2); c.closePath();
  c.lineJoin = 'round'; c.lineWidth = 2.5; c.strokeStyle = '#1a0f06'; c.stroke(); c.fillStyle = '#e2452f'; c.fill();
  c.fillStyle = '#ff9a7a'; c.fillRect(hinten + 1, -7, 6, 2);
  pfeilSpitze(c, 0, 1);
}
function c_rauch(x, y, r, a){
  if(a <= 0) return;
  ctx.globalAlpha = a; ctx.fillStyle = '#7a6a5a'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
}
function flammeZeichnen(f, t){
  const b = falleFlammeBox(f), x = b.x - camX;
  const lange = f.dx ? b.w : b.h, m = falleMund(f);
  const n = falleTaktSchritte(f), alt = falleZeit(f), an = Math.min(1, alt/6), ende = Math.min(1, (n*FLAMME_ANTEIL - alt)/8);
  ctx.save();
  ctx.translate(m.x - camX, m.y); ctx.rotate(Math.atan2(f.dy, f.dx));
  const L = lange*Math.min(an, 1)*(0.7 + 0.3*ende);
  // Außen ein dunkelroter Rand genau so breit wie die Trefferfläche (FLAMME_BREITE), innen heller Kern – so sieht man
  // auf hellem Sandstein und im Dunkeln, wie weit die Flamme reicht (vorher lief sie zur Spitze dünn aus, traf aber breit)
  const B = FLAMME_BREITE/2;
  for(const [farbe, breit, flack, spitz] of [['rgba(150,30,10,.55)', B + 1.5, 0.6, 0.15], ['rgba(255,90,20,.85)', B - 1, 1, 0.25],
                                             ['rgba(255,170,40,.9)', B*0.65, 0.8, 0.45], ['rgba(255,240,170,.95)', B*0.32, 0.6, 0.6]]){
    ctx.fillStyle = farbe; ctx.beginPath(); ctx.moveTo(0, -breit*0.75);
    const seg = 8;
    for(let i = 1; i <= seg; i++){ const k = i/seg; ctx.lineTo(L*k, -breit*(1 - k*spitz) + Math.sin(t*22 + i*1.7)*2.5*flack); }
    ctx.lineTo(L + 4, 0);
    for(let i = seg; i >= 1; i--){ const k = i/seg; ctx.lineTo(L*k, breit*(1 - k*spitz) + Math.sin(t*19 + i*2.3)*2.5*flack); }
    ctx.lineTo(0, breit*0.75); ctx.fill();
  }
  ctx.restore();
}
ELEMENT_SOLID_TYPEN.add('falle');
elementRegistrieren({
  id: 'falle', name: 'Falle', feld: 'traps',
  editor: {
    werkzeug: 'falle', gruppe: 'gefahren', art: 'punkt', ziehbar: false, farbe: '#c9a060',
    titel: 'Falle (Stein-Kopf, fest wie eine Wand): schießt im Takt Pfeile bzw. speit Flammen in die gewählte Richtung; ' +
           'warnt vorher (Glühen/Rauch). Versatz = später im Takt. „per Nummer aus“: still, solange die Verknüpfung an ist. ' +
           'Klick auf eine vorhandene Falle = Richtung drehen',
    optionen: [
      {key: 'art', label: 'Art', werte: [['pfeil', 'Pfeil'], ['flamme', 'Flamme']]},
      {key: 'richtung', label: 'Richtung', werte: [['r', '→ rechts'], ['l', '← links'], ['o', '↑ hoch'], ['u', '↓ runter']]},
      {key: 'takt', label: 'Takt', zahl: true, titel: 'alle X Sekunden ein Pfeil / eine Flamme',
       werte: [['1.5', '1,5 s'], ['2', '2 s'], ['2.5', '2,5 s'], ['3', '3 s'], ['4', '4 s']]},
      {key: 'versatz', label: 'Versatz', zahl: true, titel: 'Verschiebung im Takt (für Rhythmus mehrerer Fallen)',
       werte: [['0', '0'], ['0.25', '¼'], ['0.5', '½'], ['0.75', '¾']]},
      {key: 'schalter', label: 'an/aus', titel: 'Immer an – oder still, solange die gewählte Verknüpfungs-Nummer an ist',
       werte: [['immer', 'immer an'], ['nummer', 'per Nummer aus']]},
    ],
    neu(p){
      const o = {c: p.c, r: p.r, art: p.art, richtung: p.richtung, takt: p.takt, versatz: p.versatz, schalter: p.schalter};
      if(p.schalter === 'nummer') o.link = Number(linkSelect.value);
      return o;
    },
    nummerAktiv: p => p.schalter === 'nummer' && !!p.link,
    mitNummer: false, nummerName: 'Falle aus',
    klick(p){ const o = ['r', 'u', 'l', 'o']; p.richtung = o[(o.indexOf(p.richtung || 'r') + 1) % 4]; },
    zeichnen(ctx, c, r, TILE, p){
      const f = {art: p.art || 'pfeil', dx: (FALLE_RICHTUNG[p.richtung] || [1, 0])[0], dy: (FALLE_RICHTUNG[p.richtung] || [1, 0])[1]};
      ctx.save(); ctx.translate(c*TILE, r*TILE); ctx.scale(TILE/40, TILE/40);
      falleKopfZeichnen(ctx, 0, 0, f, 0, false); ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3;
      const txt = (p.art === 'flamme' ? '🔥' : '➶') + String(p.takt || 2).replace('.', ',') + (p.link ? ' ⚡' + p.link : '');
      ctx.strokeText(txt, c*TILE + TILE/2, r*TILE + TILE - 7); ctx.fillText(txt, c*TILE + TILE/2, r*TILE + TILE - 7);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, art: p.art === 'flamme' ? 'flamme' : 'pfeil',
      richtung: p.richtung || 'r', takt: Number(p.takt) || 2, versatz: Number(p.versatz) || 0,
      ...(p.schalter === 'nummer' && p.link ? {link: p.link} : {})})),
  },
  spiel: {
    laden(daten){
      fallen = (daten.traps || []).map(t => {
        const [dx, dy] = FALLE_RICHTUNG[t.richtung] || [1, 0];
        const block = {x: t.x, y: t.y, w: 40, h: 40, type: 'falle'};
        solids.push(block);
        return {x: t.x, y: t.y, art: t.art === 'flamme' ? 'flamme' : 'pfeil', dx, dy, takt: Number(t.takt) || 2,
                versatz: Number(t.versatz) || 0, link: t.link || null, flammeLen: 0, block};
      });
      fallenSchritte = 0; fallenPfeile = [];
    },
    schritt: fallenSchritt,
    zuruecksetzen: fallenZuruecksetzen,
    zeichnen(){ if(fallen.length) fallenZeichnen(); },
  },
});
