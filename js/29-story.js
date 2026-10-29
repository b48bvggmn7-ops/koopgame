// 29-story.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Spielszenen (Ausbau 6): Intro und Zwischensequenzen ----------
// Kurze Szenen mit den Spielfiguren und Sprechblasen auf einer kleinen Bühne (Boden + Welt-Hintergrund).
// ALLE Texte und Abläufe stehen in story/story.json (Nutzer kann sie dort ändern). Eine Szene ist eine Liste von
// Schritten: {wer, text} = Sprechblase, {geh: {figur: [x, y]}} = Figuren bewegen sich (gleichzeitig), dauer = Sekunden,
// aktion = besondere Momente (Dschungel-Neu: 'meteor' = Sternschnuppe fällt in den Dschungel, 'gluehen' = Leuchten
// hinter den Bäumen, 'portal' = der Meteorit öffnet ein Tor, 'sog' = das Tor zieht Affe und Schweinchen hinein),
// ton = Geräusch, von = [x, y] Sprechblase an dieser Stelle (Sprecher außerhalb des Bildes). Springen (Leertaste, Num 0, Enter, ✕) = weiter, Esc / Options / ○ = ganze Szene überspringen.
// Läuft, solange menuScreen === 'szene' (Spiel steht still); Kamera steht fest (kameraFest, 09-kamera.js).
// Nur Anzeige – die Szene ändert keinen Spielstand außer am Ende über den Rückruf.
let storyDaten = null;
let szene = null;          // {def, i, t0, von:{}, nach:{}, akteure:{}, fertig}
const SZENE_BODEN = 640;
const SZENE_ZEICHNER = {};  // weitere Figuren (z. B. 'bruno' aus elemente/boss.js): name -> (ctx, a) => …
async function storyLaden(){
  if(storyDaten) return storyDaten;
  try{
    const r = await fetch('story/story.json?v=' + Date.now(), {cache: 'no-store'});
    storyDaten = r.ok ? await r.json() : {figuren: {}};
  }catch(e){ storyDaten = {figuren: {}}; }
  return storyDaten;
}
const szeneAktiv = () => !!szene && menuScreen === 'szene';
// Szene abspielen; fertig() wird am Ende (auch beim Überspringen) genau einmal aufgerufen.
// opt.buehne === false: KEINE eigene Bühne – die Szene spielt im laufenden Level (z. B. Boss-Arena), Affe und
// Schweinchen bleiben, wo sie sind. Bei "relativ": true in story.json zählen x-Werte ab der linken Bildkante.
async function szeneSpielen(name, fertig, opt){
  opt = opt || {};
  const d = await storyLaden(), def = d[name];
  if(!def || !Array.isArray(def.schritte)){ if(fertig) fertig(); return false; }
  const st = def.start || {}, buehne = opt.buehne !== false, kameraVorher = kameraFest;
  if(buehne){
    const pos = k => st[k] ? {x: st[k][0], y: st[k][1]} : null;
    const m = pos('affe') || {x: 400, y: SZENE_BODEN}, f = pos('schwein') || {x: 450, y: SZENE_BODEN};
    buildLevel({solids: [{x: -400, y: SZENE_BODEN, w: 3000, h: 120, type: 'ground'}], startM: m, startF: f,
                goal: {x: 5000, y: SZENE_BODEN}, welt: def.welt || 'dschungel', tageszeit: def.tageszeit, wetter: 'trocken', baumAus: true});   // Bühne: kein hohler Baum (12a)
    resetLevel();
    if(typeof cosResetState === 'function') cosResetState();
    kameraFest = 0; camPos = 0;
  }
  const dx = def.relativ ? (kameraFest !== null ? kameraFest : Math.round(camPos)) : 0;
  const akteure = {};
  for(const k in st) if(k !== 'affe' && k !== 'schwein') akteure[k] = {x: st[k][0] + dx, y: st[k][1], dir: -1};
  szene = {def, name, i: -1, t0: 0, von: {}, nach: {}, akteure, fertig, start: performance.now(), dx, buehne, kameraVorher};
  if(window.GameMenu && GameMenu.hide) GameMenu.hide();   // Startmenü ausblenden
  menuScreen = 'szene';
  document.body.classList.add('szene');
  szeneSchritt(0);
  return true;
}
const szeneFigur = k => k === 'affe' ? p1 : k === 'schwein' ? p2 : szene.akteure[k] || (k === 'bruno' && typeof bossKampf !== 'undefined' && bossKampf ? bossKampf : null);
function szeneSchritt(i){
  if(!szene) return;
  if(i >= szene.def.schritte.length){ szeneEnde(); return; }
  szene.i = i; szene.t0 = performance.now(); szene.von = {}; szene.nach = {};
  const s = szene.def.schritte[i];
  if(s.geh) for(const k in s.geh){ const a = szeneFigur(k); if(a){ szene.von[k] = {x: a.x, y: a.y}; szene.nach[k] = {x: s.geh[k][0] + szene.dx, y: s.geh[k][1]}; } }
  if(s.ton && typeof SFX !== 'undefined' && typeof SFX['szene_' + s.ton] === 'function') SFX['szene_' + s.ton]();   // 18-sound.js
  if(s.wer && typeof SFX !== 'undefined' && SFX.menuTick) SFX.menuTick();
}
// Bewegungen dieses Schritts sofort ans Ziel setzen (beim Weiterblättern)
function szeneZiele(){
  for(const k in szene.nach){ const a = szeneFigur(k); if(a){ a.x = szene.nach[k].x; a.y = szene.nach[k].y; } }
  szeneAktion(szene.def.schritte[szene.i]);
}
function szeneAktion(s){
  if(!s || !s.aktion || s._erledigt === szene.start) return;
  s._erledigt = szene.start;
  const jetzt = performance.now();
  if(s.aktion === 'meteor') szene.meteorT0 = jetzt;                       // Feuerball fällt, danach Glühen am Horizont
  if(s.aktion === 'gluehen' && szene.akteure.gluehen) szene.akteure.gluehen.an = jetzt;
  if(s.aktion === 'portal' && szene.akteure.meteorit) szene.akteure.meteorit.portal = jetzt;
  if(s.aktion === 'sog') szene.sogT0 = jetzt;                             // Figuren werden kleiner und verschwinden im Tor
}
function szeneWeiter(){
  if(!szene) return;
  if(performance.now() - szene.t0 < 250) return;   // Doppeldruck nicht zweimal zählen
  szeneZiele(); szeneSchritt(szene.i + 1);
}
function szeneEnde(){
  if(!szene) return;
  const fertig = szene.fertig;
  const zurueck = szene.buehne ? null : szene.kameraVorher;
  szene = null; kameraFest = zurueck;
  document.body.classList.remove('szene');
  if(menuScreen === 'szene') menuScreen = null;
  for(const k in KEYS) if(k.endsWith('_pressed')) KEYS[k] = false;
  if(fertig) fertig();
}
// Tasten (aus dem Tastatur-Abfänger in 16-menue.js) und Controller (aus pollMenuPads)
function szeneTaste(e){
  if(e.repeat) return;
  if(e.code === 'Escape' || e.code === 'Backspace') szeneEnde();
  else if(['Space', 'Enter', 'NumpadEnter', 'Numpad0', 'Digit0'].includes(e.code)) szeneWeiter();
}
const szenePadVor = [{}, {}];
function szenePads(){
  let pads = [];
  try{ pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []; }catch(e){}
  for(let i = 0; i < 2; i++){
    const gp = pads[i]; if(!gp){ szenePadVor[i] = {}; continue; }
    const b = n => !!(gp.buttons[n] && (gp.buttons[n].pressed || gp.buttons[n].value > 0.4));
    const jetzt = {ok: b(0), weg: b(1) || b(9)}, vor = szenePadVor[i];
    if(jetzt.weg && !vor.weg) szeneEnde(); else if(jetzt.ok && !vor.ok) szeneWeiter();
    szenePadVor[i] = jetzt;
  }
}
// pro gezeichnetem Bild: Bewegungen weich (Zeit-basiert, nur Anzeige), Schritt weiter, wenn seine Zeit um ist
function szeneBewegen(){
  const s = szene.def.schritte[szene.i], t = (performance.now() - szene.t0)/1000, dauer = Math.max(0.3, s.dauer || 2);
  const k = Math.min(1, t/dauer), e = k < 0.5 ? 2*k*k : 1 - Math.pow(-2*k + 2, 2)/2;
  for(const n in szene.nach){
    const a = szeneFigur(n), v = szene.von[n], z = szene.nach[n];
    if(!a) continue;
    const nx = v.x + (z.x - v.x)*e, ny = v.y + (z.y - v.y)*e;
    if(a === p1 || a === p2){ a.rollAngle += (nx - a.x)/(a.w*0.5); a.facing = Math.sign(nx - a.x) || a.facing; a.animPhase += Math.abs(nx - a.x)*1.1; }
    else if(nx !== a.x) a.dir = Math.sign(nx - a.x);
    a.x = nx; a.y = ny;
  }
  if(k >= 0.5) szeneAktion(s);
  if(t >= dauer + (s.wer ? 0.35 : 0)) szeneSchritt(szene.i + 1);
}
// Blickrichtung: Affe und Schweinchen schauen den Sprecher an
function szeneBlicke(){
  const s = szene && szene.def.schritte[szene.i]; if(!s || !s.wer) return;
  const sp = s.von ? {x: s.von[0] + szene.dx} : szeneFigur(s.wer);
  if(!sp) return;
  for(const pl of [p1, p2]) if(pl !== sp && Math.abs(sp.x - pl.x) > 4) pl.facing = Math.sign(sp.x - pl.x);
}
// ---- Figuren der Szenen (gezeichnet in Welt-Koordinaten) ----
function zeichneProfessor(c, a, x, y){
  c.save(); c.translate(x, y);
  const wipp = Math.sin(performance.now()*0.006)*1.2;
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 0, 18, 4, 0, 0, Math.PI*2); c.fill();
  c.translate(0, wipp);
  c.fillStyle = '#f2f2ea'; c.beginPath(); c.moveTo(-17, -2); c.lineTo(17, -2); c.lineTo(13, -26); c.lineTo(-13, -26); c.closePath(); c.fill();   // Laborkittel
  c.strokeStyle = '#c9c9bd'; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = '#9b7350'; c.beginPath(); c.ellipse(0, -28, 18, 20, 0, 0, Math.PI*2); c.fill();               // Körper/Kopf
  c.fillStyle = '#d9b98c'; c.beginPath(); c.ellipse(0, -24, 11, 13, 0, 0, Math.PI*2); c.fill();               // Gesichtsfeld
  c.fillStyle = '#9b7350'; c.beginPath(); c.moveTo(-15, -42); c.lineTo(-11, -54); c.lineTo(-5, -44); c.fill();   // Federohren
  c.beginPath(); c.moveTo(15, -42); c.lineTo(11, -54); c.lineTo(5, -44); c.fill();
  for(const sx of [-6, 6]){ c.fillStyle = '#fff'; c.beginPath(); c.arc(sx, -31, 5.5, 0, Math.PI*2); c.fill();
    c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(sx + (a.dir || 0)*1.2, -31, 2.8, 0, Math.PI*2); c.fill();
    c.strokeStyle = '#3a3a44'; c.lineWidth = 1.6; c.beginPath(); c.arc(sx, -31, 6.5, 0, Math.PI*2); c.stroke(); }   // Brille
  c.beginPath(); c.moveTo(-0.5, -31); c.lineTo(0.5, -31); c.stroke();
  c.fillStyle = '#f0a020'; c.beginPath(); c.moveTo(-3, -25); c.lineTo(3, -25); c.lineTo(0, -20); c.fill();   // Schnabel
  c.restore();
}
function zahnradPfad(c, r, zaehne){
  c.beginPath();
  for(let i = 0; i < zaehne*2; i++){ const a = i/(zaehne*2)*Math.PI*2, rr = i % 2 ? r : r*1.25; c.lineTo(Math.cos(a)*rr, Math.sin(a)*rr); }
  c.closePath();
}
function zeichneZahnrad(c, x, y, r, w){
  c.save(); c.translate(x, y); c.rotate(w);
  c.fillStyle = '#e9b83a'; zahnradPfad(c, r, 8); c.fill(); c.strokeStyle = '#8a6418'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = '#8a6418'; c.beginPath(); c.arc(0, 0, r*0.35, 0, Math.PI*2); c.fill();
  c.restore();
}
function zeichneFernrohr(c, a, x, y){
  c.save(); c.translate(x, y);
  c.strokeStyle = '#6b4a2a'; c.lineWidth = 4; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, -50); c.lineTo(-18, 0); c.moveTo(0, -50); c.lineTo(18, 0); c.moveTo(0, -50); c.lineTo(0, 0); c.stroke();   // Stativ
  c.translate(0, -54); c.rotate(-0.5);   // schaut in den Himmel
  c.fillStyle = '#c98b3a'; roundRect(-34, -9, 68, 18, 6); c.fill(); c.strokeStyle = '#7a4f1c'; c.lineWidth = 2; c.stroke();
  c.fillStyle = '#9ad8ff'; c.beginPath(); c.ellipse(34, 0, 4, 9, 0, 0, Math.PI*2); c.fill();
  c.restore();
}
// ---- Dschungel-Neu: Meteorit (elemente/meteorit.js zeichnet Fels und Splitter), Feuerball, Glühen, Tor ----
function zeichneSzeneMeteorit(c, a, x, y){
  const t = performance.now()*0.001;
  if(typeof meteorZeichnen === 'function') meteorZeichnen({x: a.x, y, art: 'meteorit'}, x, t);
  if(!a.portal) return;
  // Tor: wächst über dem Meteoriten auf, Ringe drehen sich, innen Sterne
  const k = Math.min(1, (performance.now() - a.portal)/1400), e = k*k*(3 - 2*k), cy = y - 170, R = 110*e;
  if(R < 2) return;
  c.save(); c.translate(x, cy);
  const tief = c.createRadialGradient(0, 0, 0, 0, 0, R);
  tief.addColorStop(0, '#0b0730'); tief.addColorStop(0.7, '#241256'); tief.addColorStop(1, 'rgba(99,216,255,0)');
  c.fillStyle = tief; c.beginPath(); c.ellipse(0, 0, R, R*1.15, 0, 0, Math.PI*2); c.fill();
  for(let i = 0; i < 22; i++){   // Sterne im Tor
    const z = Math.sin(i*12.9898)*43758.5453 % 1, w = Math.abs(z), a2 = i*2.399 + t*0.3, r2 = R*0.85*Math.sqrt((i + 0.5)/22);
    c.globalAlpha = 0.5 + 0.5*Math.sin(t*4 + i); c.fillStyle = i % 3 ? '#ffffff' : '#9fe8ff';
    c.beginPath(); c.arc(Math.cos(a2)*r2, Math.sin(a2)*r2*1.15, 1 + w*1.6, 0, Math.PI*2); c.fill();
  }
  c.globalAlpha = 1; c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
  for(let ring = 0; ring < 3; ring++){
    c.strokeStyle = ring === 1 ? 'rgba(169,139,255,.8)' : 'rgba(99,216,255,.85)'; c.lineWidth = 5 - ring;
    const rr = R*(1 - ring*0.12), dreh = t*(1.4 + ring*0.5)*(ring % 2 ? -1 : 1);
    for(let s = 0; s < 4; s++){ c.beginPath(); c.ellipse(0, 0, rr, rr*1.15, 0, dreh + s*Math.PI/2, dreh + s*Math.PI/2 + 1.0); c.stroke(); }
  }
  c.restore();
}
function zeichneSzeneGluehen(c, a, x, y){
  if(!a.an) return;
  const k = Math.min(1, (performance.now() - a.an)/1200), puls = 0.75 + 0.25*Math.sin(performance.now()*0.0035);
  const g = c.createRadialGradient(x, y, 0, x, y, 260);
  g.addColorStop(0, `rgba(160,240,255,${0.75*k*puls})`); g.addColorStop(0.35, `rgba(99,216,255,${0.35*k*puls})`); g.addColorStop(1, 'rgba(99,216,255,0)');
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.beginPath(); c.arc(x, y, 260, 0, Math.PI*2); c.fill(); c.restore();
}
// Feuerball über den Himmel (Bildschirm-Koordinaten der Bühne), danach Lichtblitz und Glühen am Horizont
function zeichneSzeneFeuerball(){
  if(!szene || !szene.meteorT0) return;
  const t = (performance.now() - szene.meteorT0)/1000, flug = 1.5;
  const x0 = VW + 120, y0 = -SKY_ROOM - 60, x1 = 120, y1 = 470;
  if(t < flug){
    const k = t/flug, x = x0 + (x1 - x0)*k, y = y0 + (y1 - y0)*k*k;
    const dx = (x1 - x0)/flug, dy = 2*(y1 - y0)*k/flug, l = Math.hypot(dx, dy), ux = -dx/l, uy = -dy/l;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for(let i = 0; i < 4; i++){
      const lang = 260 - i*50;
      const g = ctx.createLinearGradient(x, y, x + ux*lang, y + uy*lang);
      g.addColorStop(0, i ? 'rgba(99,216,255,.7)' : 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(99,216,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 16 - i*3.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + ux*lang, y + uy*lang); ctx.stroke();
    }
    const kopf = ctx.createRadialGradient(x, y, 0, x, y, 34);
    kopf.addColorStop(0, 'rgba(255,255,255,1)'); kopf.addColorStop(0.4, 'rgba(160,240,255,.8)'); kopf.addColorStop(1, 'rgba(99,216,255,0)');
    ctx.fillStyle = kopf; ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  } else {
    const k = t - flug, blitz = Math.max(0, 1 - k*2.2);
    if(blitz > 0){ ctx.fillStyle = `rgba(220,248,255,${0.55*blitz})`; ctx.fillRect(-10, -SKY_ROOM - 10, VW + 20, H + SKY_ROOM + 20); }
    zeichneSzeneGluehen(ctx, {an: szene.meteorT0 + flug*1000}, x1, y1 + 60);
  }
}
SZENE_ZEICHNER.professor = (c, a) => zeichneProfessor(c, a, Math.round(a.x - camX), a.y);
SZENE_ZEICHNER.meteorit = (c, a) => zeichneSzeneMeteorit(c, a, Math.round(a.x - camX), a.y);
SZENE_ZEICHNER.gluehen = (c, a) => zeichneSzeneGluehen(c, a, Math.round(a.x - camX), a.y);
SZENE_ZEICHNER.splitter = (c, a) => { if(typeof meteorZeichnen === 'function') meteorZeichnen({x: a.x, y: a.y, art: 'brocken'}, Math.round(a.x - camX), performance.now()*0.001); };
SZENE_ZEICHNER.fernrohr = (c, a) => zeichneFernrohr(c, a, Math.round(a.x - camX), a.y);
SZENE_ZEICHNER.zahnrad = (c, a) => { if(a.sichtbar !== false) zeichneZahnrad(c, Math.round(a.x - camX), a.y - 30 + Math.sin(performance.now()*0.004)*4, 16, performance.now()*0.002); };
// Sprechblase mit Namen, Text umgebrochen, im Bild gehalten
function szeneBlase(wer, text, ax, ay){
  const name = ((storyDaten && storyDaten.figuren) || {})[wer] || wer;
  ctx.font = 'bold 17px sans-serif';
  const worte = String(text).split(' '), zeilen = [], maxW = 380;
  let z = '';
  for(const w of worte){ const t = z ? z + ' ' + w : w; if(ctx.measureText(t).width > maxW && z){ zeilen.push(z); z = w; } else z = t; }
  if(z) zeilen.push(z);
  const bw = Math.max(...zeilen.map(l => ctx.measureText(l).width), ctx.measureText(name).width*0.8) + 30, bh = zeilen.length*22 + 34;
  const sx = Math.round(ax - camX), cx = Math.max(bw/2 + 10, Math.min(VW - bw/2 - 10, sx)), top = Math.max(-SKY_ROOM + 8, ay - bh - 26);
  const tail = Math.max(-bw/2 + 18, Math.min(bw/2 - 18, sx - cx));
  const farbe = {affe: '#4dabf7', schwein: '#f783ac', professor: '#e9b83a', bruno: '#c77b3f', erzaehler: '#63a8c8'}[wer] || '#888';
  ctx.save(); ctx.translate(cx, top);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; roundRect(-bw/2 + 3, 4, bw, bh, 14); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#2b2b33'; ctx.lineWidth = 2.5;
  roundRect(-bw/2, 0, bw, bh, 14); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tail - 9, bh - 1); ctx.lineTo(tail - 2, bh + 16); ctx.lineTo(tail + 9, bh - 1); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(tail - 9, bh); ctx.lineTo(tail - 2, bh + 16); ctx.lineTo(tail + 9, bh); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.fillRect(tail - 8, bh - 3, 16, 4);
  ctx.fillStyle = farbe; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(name.toUpperCase(), -bw/2 + 15, 8);
  ctx.fillStyle = '#2b2b33'; ctx.font = 'bold 17px sans-serif';
  zeilen.forEach((l, i) => ctx.fillText(l, -bw/2 + 15, 26 + i*22));
  ctx.restore();
}
// Aufruf aus draw() (12-welt-zeichnen.js) in Welt-Koordinaten, nach den Figuren
function szeneZeichnen(){
  if(!szeneAktiv()) return;
  szeneBewegen();
  if(!szene) return;
  szeneBlicke();
  const A = szene.akteure;
  for(const k of ['gluehen', 'fernrohr', 'zahnrad', 'splitter', 'meteorit', 'professor', 'bruno']) if(A[k] && SZENE_ZEICHNER[k]) SZENE_ZEICHNER[k](ctx, A[k]);
  zeichneSzeneFeuerball();
  szeneSog();
  const s = szene.def.schritte[szene.i];
  if(s && s.wer && s.text){
    const sp = s.von ? {x: s.von[0] + szene.dx, y: s.von[1]} : szeneFigur(s.wer);
    if(sp){
      const kopf = sp === p1 || sp === p2 ? sp.y - sp.h - 6 : s.wer === 'bruno' ? sp.y - 112 : sp.y - 64;
      szeneBlase(s.wer, s.text, sp.x, s.von ? sp.y : kopf);
    }
  }
}
// Sog ins Tor: sind die Figuren am Tor angekommen, verschwinden sie (aus dem Bild gestellt – nur in der Szene)
function szeneSog(){
  if(!szene || !szene.sogT0 || szene.sogFertig) return;
  if(performance.now() - szene.sogT0 < 1700) return;
  szene.sogFertig = true;
  for(const pl of [p1, p2]){ pl.y = -4000; pl._py = pl.y; }
}
// Aufruf aus draw() in Bildschirm-Koordinaten: Kino-Balken, Titel, Hinweis
function szeneRahmen(){
  if(!szeneAktiv()) return;
  const t = (performance.now() - szene.start)/1000, bar = 46*Math.min(1, t*3);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
  if(t < 3.2 && szene.def.titel){
    ctx.globalAlpha = Math.min(1, t*2, (3.2 - t)*2);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(szene.def.titel, W/2, 120); ctx.globalAlpha = 1;
  }
  ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.font = '14px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText('Springen = weiter   ·   Esc / Options = überspringen', W - 24, H - 23);
}
