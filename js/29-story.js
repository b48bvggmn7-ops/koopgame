// 29-story.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Spielszenen (Ausbau 6): Intro und Zwischensequenzen ----------
// Kurze Szenen mit den Spielfiguren und Sprechblasen auf einer kleinen Bühne (Boden + Welt-Hintergrund).
// ALLE Texte und Abläufe stehen in story/story.json (Nutzer kann sie dort ändern). Eine Szene ist eine Liste von
// Schritten: {wer, text} = Sprechblase, {geh: {figur: [x, y]}} = Figuren bewegen sich (gleichzeitig), dauer = Sekunden,
// aktion = besondere Momente ('zahnraeder': Krähe klaut die Zahnräder, 'schnapp': Krähe packt den Professor,
// 'zahnrad_ab': Bruno lässt das Zahnrad fallen), ton = Geräusch, von = [x, y] Sprechblase an dieser Stelle (Sprecher
// außerhalb des Bildes). Springen (Leertaste, Num 0, Enter, ✕) = weiter, Esc / Options / ○ = ganze Szene überspringen.
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
// Szene abspielen; fertig() wird am Ende (auch beim Überspringen) genau einmal aufgerufen
async function szeneSpielen(name, fertig){
  const d = await storyLaden(), def = d[name];
  if(!def || !Array.isArray(def.schritte)){ if(fertig) fertig(); return false; }
  const st = def.start || {};
  const pos = k => st[k] ? {x: st[k][0], y: st[k][1]} : null;
  const m = pos('affe') || {x: 400, y: SZENE_BODEN}, f = pos('schwein') || {x: 450, y: SZENE_BODEN};
  buildLevel({solids: [{x: -400, y: SZENE_BODEN, w: 3000, h: 120, type: 'ground'}], startM: m, startF: f,
              goal: {x: 5000, y: SZENE_BODEN}, welt: def.welt || 'dschungel', tageszeit: def.tageszeit, wetter: 'trocken'});
  resetLevel();
  if(typeof cosResetState === 'function') cosResetState();
  const akteure = {};
  for(const k in st) if(k !== 'affe' && k !== 'schwein') akteure[k] = {x: st[k][0], y: st[k][1], dir: -1, traegt: null, hatZahnraeder: false};
  if(akteure.fernrohr) akteure.fernrohr.zahnraeder = true;
  kameraFest = 0; camPos = 0;
  szene = {def, name, i: -1, t0: 0, von: {}, nach: {}, akteure, fertig, start: performance.now()};
  if(window.GameMenu && GameMenu.hide) GameMenu.hide();   // Startmenü ausblenden
  menuScreen = 'szene';
  document.body.classList.add('szene');
  szeneSchritt(0);
  return true;
}
const szeneFigur = k => k === 'affe' ? p1 : k === 'schwein' ? p2 : szene.akteure[k];
function szeneSchritt(i){
  if(!szene) return;
  if(i >= szene.def.schritte.length){ szeneEnde(); return; }
  szene.i = i; szene.t0 = performance.now(); szene.von = {}; szene.nach = {};
  const s = szene.def.schritte[i];
  if(s.geh) for(const k in s.geh){ const a = szeneFigur(k); if(a){ szene.von[k] = {x: a.x, y: a.y}; szene.nach[k] = {x: s.geh[k][0], y: s.geh[k][1]}; } }
  if(s.ton && typeof SFX !== 'undefined'){
    if(s.ton === 'kraehe' && SFX.kraehe) SFX.kraehe(); else if(s.ton === 'klau' && SFX.klau) SFX.klau();
  }
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
  const A = szene.akteure;
  if(s.aktion === 'zahnraeder' && A.fernrohr){ A.fernrohr.zahnraeder = false; if(A.kraehe) A.kraehe.hatZahnraeder = true; }
  if(s.aktion === 'schnapp' && A.kraehe && A.professor) A.kraehe.traegt = 'professor';
  if(s.aktion === 'zahnrad_ab' && A.zahnrad) A.zahnrad.sichtbar = true;
}
function szeneWeiter(){
  if(!szene) return;
  if(performance.now() - szene.t0 < 250) return;   // Doppeldruck nicht zweimal zählen
  szeneZiele(); szeneSchritt(szene.i + 1);
}
function szeneEnde(){
  if(!szene) return;
  const fertig = szene.fertig;
  szene = null; kameraFest = null;
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
  const sp = s.von ? {x: s.von[0]} : szeneFigur(s.wer);
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
function zeichneKraehe(c, a, x, y){
  const t = performance.now(), flieg = y < SZENE_BODEN - 4, fl = flieg ? Math.sin(t*0.025) : 0.2, d = a.dir || -1;
  if(a.traegt === 'professor' && szene && szene.akteure.professor){   // Professor hängt an den Krallen
    const pr = szene.akteure.professor; pr.x = x; pr.y = y + 62; pr.dir = d;
  }
  c.save(); c.translate(x, y); c.scale(d < 0 ? -1 : 1, 1);
  if(!flieg){ c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 0, 20, 4, 0, 0, Math.PI*2); c.fill(); }
  c.translate(0, flieg ? 0 : -6);
  c.fillStyle = '#20232e';
  c.beginPath(); c.moveTo(-26, -18); c.lineTo(-42, -10); c.lineTo(-40, -22); c.closePath(); c.fill();          // Schwanz
  c.beginPath(); c.ellipse(-4, -20, 24, 15, -0.15, 0, Math.PI*2); c.fill();                                     // Körper
  c.beginPath(); c.arc(18, -32, 12, 0, Math.PI*2); c.fill();                                                     // Kopf
  c.fillStyle = '#d6c27a'; c.beginPath(); c.moveTo(28, -34); c.lineTo(42, -30); c.lineTo(28, -27); c.closePath(); c.fill();   // Schnabel
  c.fillStyle = '#111'; c.fillRect(13, -37, 16, 6); c.fillStyle = '#5a6a88'; c.fillRect(15, -36, 5, 3); c.fillRect(22, -36, 5, 3);   // Sonnenbrille
  c.fillStyle = '#d23c3c'; c.beginPath(); c.moveTo(8, -24); c.quadraticCurveTo(-6, -20 + Math.sin(t*0.012)*3, -18, -12 + Math.sin(t*0.015)*4);   // Schal
  c.lineTo(-14, -9); c.quadraticCurveTo(-4, -16, 10, -19); c.closePath(); c.fill();
  c.fillStyle = '#2c3242'; c.save(); c.translate(-6, -24); c.rotate(-0.4 - fl*0.7);   // Flügel
  c.beginPath(); c.ellipse(-4, -10, 9, 22, 0.3, 0, Math.PI*2); c.fill(); c.restore();
  c.strokeStyle = '#d6c27a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-4, -6); c.lineTo(-6, 4); c.moveTo(4, -6); c.lineTo(4, 4); c.stroke();
  if(a.hatZahnraeder){   // Beutel mit den Zahnrädern (glitzert)
    c.fillStyle = '#7a5530'; c.beginPath(); c.ellipse(-6, 12, 9, 8, 0, 0, Math.PI*2); c.fill();
    c.fillStyle = '#ffd34d'; c.globalAlpha = 0.6 + 0.4*Math.sin(t*0.01); c.beginPath(); c.arc(-3, 6, 2.2, 0, Math.PI*2); c.fill(); c.globalAlpha = 1;
  }
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
  c.translate(0, -54); c.rotate(a.zahnraeder ? -0.5 : 0.35);   // ohne Zahnräder sackt das Rohr ab
  c.fillStyle = '#c98b3a'; roundRect(-34, -9, 68, 18, 6); c.fill(); c.strokeStyle = '#7a4f1c'; c.lineWidth = 2; c.stroke();
  c.fillStyle = '#9ad8ff'; c.beginPath(); c.ellipse(34, 0, 4, 9, 0, 0, Math.PI*2); c.fill();
  if(a.zahnraeder){ const w = performance.now()*0.002; zeichneZahnrad(c, -12, -12, 7, w); zeichneZahnrad(c, 4, -14, 5.5, -w*1.3); zeichneZahnrad(c, 16, -11, 4.5, w*1.6); }
  c.restore();
}
SZENE_ZEICHNER.professor = (c, a) => zeichneProfessor(c, a, Math.round(a.x - camX), a.y);
SZENE_ZEICHNER.kraehe = (c, a) => zeichneKraehe(c, a, Math.round(a.x - camX), a.y);
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
  const farbe = {affe: '#4dabf7', schwein: '#f783ac', professor: '#e9b83a', kraehe: '#555c70', bruno: '#c77b3f'}[wer] || '#888';
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
  for(const k of ['fernrohr', 'zahnrad', 'professor', 'kraehe', 'bruno']) if(A[k] && SZENE_ZEICHNER[k] && !(k === 'professor' && A.kraehe && A.kraehe.traegt === 'professor')) SZENE_ZEICHNER[k](ctx, A[k]);
  if(A.kraehe && A.kraehe.traegt === 'professor' && A.professor){ SZENE_ZEICHNER.kraehe(ctx, A.kraehe); SZENE_ZEICHNER.professor(ctx, A.professor); }
  const s = szene.def.schritte[szene.i];
  if(s && s.wer && s.text){
    const sp = s.von ? {x: s.von[0], y: s.von[1]} : szeneFigur(s.wer);
    if(sp){
      const kopf = sp === p1 || sp === p2 ? sp.y - sp.h - 6 : s.wer === 'kraehe' ? sp.y - 50 : sp.y - 64;
      szeneBlase(s.wer, s.text, sp.x, s.von ? sp.y : kopf);
    }
  }
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
