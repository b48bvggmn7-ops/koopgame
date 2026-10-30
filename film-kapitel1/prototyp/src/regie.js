// ===== Regie: Ablauf, Figuren, Sprechblasen, Bedienung =====
// Ablauf wie im Spiel: (Hauptmenü → Wer spielt wen →) Blätterwand mit „Kapitel 1“ → Blätter fliegen weg →
// Videosequenz mit Kino-Balken: Häuschen, schneller Zoom durchs Fenster, das Zimmer dahinter ist echt → Dialog.
const can = document.getElementById('buehne'), ctx = can.getContext('2d');
let basis = {a: 1, d: 1, e: 0, f: 0};
const innenCv = document.createElement('canvas'), innenCtx = innenCv.getContext('2d');
function groesse(){
  const dpr = Math.min(2, window.devicePixelRatio || 1), box = document.getElementById('rahmen').getBoundingClientRect();
  let w = box.width, h = w*9/16; if(h > box.height){ h = box.height; w = h*16/9; }
  for(const el of [can, document.getElementById('buehnenbox')]){ el.style.width = w + 'px'; el.style.height = h + 'px'; }
  can.width = innenCv.width = Math.round(w*dpr); can.height = innenCv.height = Math.round(h*dpr);
  basis = {a: can.width/W, d: can.height/H, e: 0, f: 0};
  const bb = document.getElementById('buehnenbox'); bb.style.setProperty('--sw', w + 'px'); bb.style.setProperty('--sh', h + 'px');
}
window.addEventListener('resize', groesse);

const QS = new URLSearchParams(location.search), SHOT = QS.get('shot');
const PHASEN = {aussen: 4.2, iris: .55};
const ZOOM = {x: 705, y: 372, s: ZOOM_S, start: 1.5};   // Zoom beginnt nach 1,5 s und dauert bis zum Ende von „aussen“
const BALKEN = 62;                                     // Kino-Balken oben und unten
const STERN = {einschlag: 1.85};   // Sekunden ab Start: gerade von links nach rechts, Einschlag passend zum Ton (sternschnuppe_boom)   // Sekunden ab Start der Sternschnuppe
const st = {phase: 'warten', t0: 0, zeile: -1, zT0: 0, fertigT: null, auto: true, stern: null, sternT0: null, einschlagT: null, einschlag: 0, nachglimmen: 0, wackeln: 0, hinweis: 1,
  stimmen: 'aufnahmen', aufn: null, events: [], keks: null, keksWeg: false, kruemel: [], staub: [], untertitel: true, decke: null, zettel: {z: 'liegt', t0: 0}, licht: 1};
let T = 0;
const jetzt = () => SHOT ? T : performance.now()/1000;

// ---------- Figuren ----------
const FH = 340, KE = FH/6.4;   // Höhe des Figurenbilds, Pixel je 3D-Einheit
const FIG = {
  prof:    {art: 'prof', x0: 1062, fuss: 638, kopf: 4.4},
  schwein: {art: 'schwein', x0: 205, fuss: 642, kopf: 3.0},
  affe:    {art: 'affe', x0: 432, fuss: 644, kopf: 3.0},
};
function figurenZuruecksetzen(){
  for(const k in FIG) Object.assign(FIG[k], {x: FIG[k].x0, yaw: 0, head: [0, 0, 0], armN: [0, 0, -.25], armP: [0, 0, .25], legN: [0, 0, 0], legP: [0, 0, 0], auge: 1, silbe: -9, pegel: 0,
    blink: 0, nb: 2 + Math.random()*3, hop: 0, geh: null, schritt: 0, sitz: k === 'prof' ? 0 : 1, sitzZiel: k === 'prof' ? 0 : 1, decke: 0, deckeZiel: 0, kaut: false,
    anim: null, animYaw: null, animSq: 0, animHop: 0, animKopf: null, pitch: 0, roll: 0});
  FIG.prof.yaw = -1.25; FIG.prof.head = [.2, 0, 0];
}
figurenZuruecksetzen();
const SITZ_HUB = () => FIG.prof.fuss - (SESSEL.sitz + 18);   // so weit hebt der Sessel den Professor an
const hubVon = k => k === 'prof' ? SITZ_HUB() : FIG[k].fuss - (SOFA.sitz + (ZIMMER.daten ? 23 : 12));   // im gerenderten Zimmer sinken sie ins Polster   // Sitzhöhe je Figur (Sessel / Sofa)
const sprecher = () => { const z = DREHBUCH[st.zeile]; return st.phase === 'innen' && z && z.wer ? z.wer : null; };
const kopfPunkt = k => ({x: FIG[k].x, y: FIG[k].fuss - FIG[k].kopf*KE*.78 - FIG[k].sitz*hubVon(k)});
const blickZu = (f, zielX) => clamp((zielX - f.x)/520, -.85, .85);
const sternLaeuft = t => st.sternT0 !== null && t - st.sternT0 > .35 && t - st.sternT0 < 9;
function zielPose(k, t){
  const f = FIG[k], z = st.phase === 'innen' ? DREHBUCH[st.zeile] || {} : {}, spricht = z.wer === k;
  const p = {yaw: 0, head: [0, 0, 0], armN: [0, 0, -.25], armP: [0, 0, .25], auge: 1, hop: 0, pitch: 0, roll: 0};
  const s = sprecher();
  let ziel = null;
  if(sternLaeuft(t) || (z.geste === 'fenster' && spricht)) ziel = FENSTER.x;
  else if(spricht){ const andere = Object.keys(FIG).filter(q => q !== k); ziel = andere.reduce((a, q) => a + FIG[q].x, 0)/andere.length; }
  else if(s) ziel = FIG[s].x;
  if(ziel !== null) p.yaw = blickZu(f, ziel);
  if(k === 'prof' && (st.phase !== 'innen' || st.zeile <= 0)){ p.yaw = -1.25; p.head = [.2, 0, 0]; p.armN = [-1.1, 0, -.5]; }
  if(f.sitz > .3 && k === 'prof'){ p.armN = [-.2, 0, -.95]; p.armP = [-.2, 0, .95]; }   // im Sessel: Arme auf den Lehnen
  if(f.sitz > .3 && k !== 'prof'){   // gemütlich auf dem Sofa: zurückgelehnt, Pfoten auf dem Bauch, zueinander geneigt
    p.armN = [-.5, 0, -.1]; p.armP = [-.5, 0, .1];   // Pfoten seitlich vorn (nicht im Bauch) p.pitch = -.11; p.head = [.06, 0, 0];
    const ander = FIG[k === 'schwein' ? 'affe' : 'schwein']; if(ander.sitz > .5 && !ander.geh) p.roll = k === 'schwein' ? -.08 : .07; }
  if(f.sitz > .3 && k === 'prof') p.pitch = -.1;
  // Zuhörer reagieren (Drehbuch „reaktion“), etwas verzögert; Sprecher spielen ihre Geste
  const reakt = !spricht && z.reaktion && z.reaktion[k] && t - st.zT0 > .5 ? z.reaktion[k] : null, geste = spricht ? z.geste : reakt;
  if(spricht){   // beim Sprechen: Kopf geht mit der Stimme mit, leichtes Wiegen
    p.head = [p.head[0] - .07*(f.pegel || 0) + .03*Math.sin(t*3.1 + f.x0), p.head[1], p.head[2] + .07*Math.sin(t*1.7 + f.x0)];
  } else if(s && !reakt){   // zuhören: Kopf zum Sprecher neigen, ab und zu nicken
    const seite = Math.sign(FIG[s].x - f.x), nick = Math.max(0, Math.sin((t - st.zT0)*2.2 + f.x0) - .55)*.35;
    p.head = [p.head[0] + nick, p.head[1], p.head[2] + .09*seite];
  }
  if(geste){
    const w = Math.sin(t*8);
    switch(geste){
      case 'fernrohr': p.yaw = -1.2; p.head = [.18, 0, 0]; p.armN = [-1.1, 0, -.5]; p.armP = [-.4, 0, .8]; break;
      case 'finger': p.armP = [-.35, 0, 2.3]; p.head = [0, 0, -.1]; break;
      case 'zettel': p.head = [-.05, 0, .1]; break;
      case 'zettel_stolz': p.head = [-.12, 0, .16]; p.hop = Math.abs(Math.sin(t*6))*.04; break;
      case 'jubeln': p.armN = [0, 0, -2.5 + .3*w]; p.armP = [0, 0, 2.5 - .3*w]; p.hop = Math.abs(Math.sin(t*7))*.12; break;
      case 'frech': p.head = [0, 0, .22]; p.armP = [-.4, 0, 1.0]; break;
      case 'lachen': p.hop = Math.abs(Math.sin(t*11))*.05; p.head = [-.15, 0, 0]; if(f.sitz < .3){ p.armN = [-.5, 0, -.4]; p.armP = [-.5, 0, .4]; } break;
      case 'schuechtern': p.head = [.32, 0, .08]; p.armN = [-.7, 0, .35]; p.armP = [-.7, 0, -.35]; p.yaw *= .4; break;
      case 'staunen': p.auge = 1.35; p.head = [-.15, 0, 0]; p.armN = [0, 0, -.9]; p.armP = [0, 0, .9]; break;
      case 'mampfen': p.head = [-.05, 0, .1]; p.hop = Math.abs(Math.sin(t*7))*.04; break;
      case 'zeigen': p.yaw = -1.1; p.armN = [-2.1, 0, -.2]; p.head = [-.1, 0, 0]; p.auge = 1.25; break;
      case 'fenster': p.head = [-.15, 0, 0]; p.armN = [-.6, 0, .3]; p.armP = [-.6, 0, -.3]; break;
      case 'fluestern': p.head = [.12, 0, .1]; p.armP = [-1.25, 0, -.35]; p.pitch -= .08; break;   // Pfote am Mund, vorgebeugt
      case 'neugierig': p.head = [.04, 0, .24]; p.auge = 1.15; p.pitch -= .06; break;
      case 'augenrollen': p.head = [-.28, 0, -.12]; p.auge = .92; break;
      case 'schmunzeln': p.head = [.06, 0, .13]; p.mund = .18; break;
      case 'kichern': p.hop = Math.abs(Math.sin(t*12))*.035; p.head = [-.06 + .04*Math.sin(t*12), 0, .12]; p.mund = .3 + .15*Math.abs(Math.sin(t*12)); break;
      case 'nicken': p.head = [.1 + .12*Math.sin(t*5.5), 0, .06]; break;
      case 'aufmuntern': p.armN = [-.95, 0, -.55]; p.armP = [-.95, 0, .55]; p.head = [-.06, 0, .16]; p.hop = Math.abs(Math.sin(t*6))*.05; p.auge = 1.15; break;
      case 'empoert': p.head = [-.16, 0, -.16]; p.armN = [-.25, 0, -1.05]; p.armP = [-.25, 0, 1.05]; p.auge = 1.2; break;
      case 'enttaeuscht': p.head = [.28, 0, .05]; p.armN = [0, 0, -.12]; p.armP = [0, 0, .12]; p.auge = .95; break;
      case 'gaehnen': { const g = Math.max(0, Math.sin(clamp((t - st.zT0 - .6)/1.6, 0, 1)*Math.PI)); p.head = [-.25*g, 0, .05]; p.armP = [-.3 - 1.6*g, 0, .4]; p.mund = .85*g; p.auge = 1 - .3*g; break; }
    }
    if(geste === 'lachen') p.mund = .35 + .25*Math.abs(Math.sin(t*11));
  }
  // Keks: zum Teller greifen, hochheben und anschauen, abbeißen (Pfote zum Mund, Kopf dreht sich zum Keks), kauen
  if(k === 'affe' && st.keks){ const K = keksZustand(t);
    if(K.phase === 'greifen'){ p.yaw = 0; p.head = [.3, .45, 0]; p.armP = [-.3, 0, .9]; p.schnell = true; }
    else if(K.phase !== 'fertig'){
      const halt = {yaw: -.22, head: [.12, .12, 0], armP: [-.8, 0, 0]}, biss = {yaw: -.1, head: [.05, .3, 0], armP: [-.35, 0, -.75]};
      if(K.phase === 'heben'){ halt.head = [.3, .35, 0]; p.auge = 1.2; }   // erst mal bewundern
      p.yaw = lerp(halt.yaw, biss.yaw, K.w); p.head = halt.head.map((v, i) => lerp(v, biss.head[i], K.w)); p.armP = halt.armP.map((v, i) => lerp(v, biss.armP[i], K.w));
      p.head[0] += K.nicken; p.schnell = true;
      if(spricht && K.w < .1){ p.armP = [-1.05, 0, .25]; p.head = [-.05, -.15, .1]; }   // mit vollem Mund reden, Keks zeigt zum Schweinchen
    } }
  // Wunschzettel: liegt neben ihr auf dem Sofa; sie nimmt ihn, zeigt ihn stolz hoch und legt ihn wieder hin
  if(k === 'schwein'){ const Z = st.zettel, u = t - Z.t0;
    const ablegePose = () => { p.yaw = .3; p.head = [.28, .3, 0]; p.armP = [-.6, 0, .5]; p.schnell = true; };
    const zeigePose = () => { p.yaw = .22; p.armP = [-.7, 0, 1.7 + (z.geste === 'zettel_stolz' && spricht ? .14*Math.sin(t*9) : 0)]; };
    const lesePose = () => { p.yaw = 0; p.armN = [-1.3, 0, .55]; p.armP = [-1.3, 0, -.55]; p.head = [.14, 0, 0]; p.schnell = true; };
    const zeigt = zettelLiest() ? lesePose : zeigePose;
    if(Z.z === 'nehmen'){ if(u < .75) ablegePose(); else zeigt(); }
    else if(Z.z === 'zeigen') zeigt();
    else if(Z.z === 'ablegen' && u < 1.15){ ablegePose(); if(u > .8) p.head = [.2, .1, 0]; } }
  // Decke: zur Armlehne greifen, vor den Bauch holen, über die Beine legen
  if(k === 'prof' && st.decke && st.decke.typ === 'nehmen'){ const u = t - st.decke.t0;
    if(u < .7){ p.armN = [-.15, 0, -1.55]; p.head = [.2, -.15, -.2]; p.yaw = -.35; }
    else if(u < 1.25){ p.armN = [-1.35, 0, -.35]; p.armP = [-1.35, 0, .35]; p.head = [.15, 0, 0]; }
    else if(u < 2.3){ p.armN = [-.85, 0, -.3]; p.armP = [-.85, 0, .3]; p.head = [.25, 0, 0]; } }
  // Sternschnuppe: alle schauen zum Fenster; beim Einschlag zucken alle zusammen
  if(sternLaeuft(t)){ p.auge = Math.max(p.auge, 1.28); p.head = [-.2, 0, 0];
    const vorEinschlag = st.einschlagT === null;
    if(k === 'prof' && vorEinschlag && !spricht){ p.yaw = -1.2; p.head = [.18, 0, 0]; p.armN = [-1.1, 0, -.5]; p.armP = [-.4, 0, .8]; }   // durchs Fernrohr
    else if(!(spricht && z.geste === 'zeigen')){ p.yaw = Math.sign(FENSTER.x - f.x)*2.35; p.head = [-.28, 0, 0]; if(f.sitz < .3){ p.armN = [0, 0, -.7]; p.armP = [0, 0, .7]; } } }   // umdrehen und hinausschauen
  if(st.einschlagT !== null && t - st.einschlagT < .6){ const k2 = 1 - (t - st.einschlagT)/.6; p.hop = .3*k2; p.auge = 1.5; p.armN = [0, 0, -1.6*k2 - .5]; p.armP = [0, 0, 1.6*k2 + .5]; }
  // beim Laufen: zur Seite schauen, Schritte
  if(f.geh) p.yaw = Math.sign(f.geh.nach - f.geh.von)*1.3;
  if(f.geh && f.geh.schleichen){ p.pitch = -.16; p.head = [.18, 0, 0]; p.armN = [-1.0, 0, -.9]; p.armP = [-1.0, 0, .9]; p.hop = Math.abs(Math.sin(t*9))*.05; }   // auf Zehenspitzen
  return p;
}
// Hinsetzen wie im Trickfilm: umdrehen (Rücken zum Sitz), kurz ausholen, plumpsen und dabei nach vorn drehen, nachfedern;
// Aufstehen: nach vorn lehnen, abdrücken; Aufspringen: mit einem Hopser hoch
function animStarten(f, typ, t){ f.anim = {typ, t0: t, yaw0: f.yaw}; }
function animSchritt(f, t){
  f.animYaw = null; f.animSq = 0; f.animHop = 0; f.animKopf = null;
  const A = f.anim; if(!A) return false;
  const u = t - A.t0;
  if(A.typ === 'setzen'){
    f.sitzZiel = 1;
    if(u < .6){ const a = glatt(u/.6); f.animYaw = lerp(A.yaw0, Math.PI, a); f.sitz = 0; f.animKopf = .1*a; }      // umdrehen, Blick über die Schulter
    else if(u < .82){ const a = glatt((u - .6)/.22); f.animYaw = Math.PI; f.animSq = -.08*a; f.sitz = 0; }    // in die Knie
    else if(u < 1.25){ const a = (u - .82)/.43, e = glatt(a); f.animYaw = Math.PI*(1 - e); f.sitz = e; f.animHop = .12*Math.sin(a*Math.PI); f.animSq = -.08*(1 - a) + .05*Math.sin(a*Math.PI); }   // Hopser rückwärts auf den Sitz, dreht dabei nach vorn
    else { const v = u - 1.25; f.sitz = 1; f.animSq = -.12*Math.exp(-v*4.5)*Math.cos(v*10);
      if(!A.plumps){ A.plumps = 1; TON.plumps(); staubWolke(f); } if(v > 1.1) f.anim = null; }
  } else if(A.typ === 'aufstehen'){
    f.sitzZiel = 0;
    if(u < .35){ f.animKopf = .3*glatt(u/.35); f.animSq = -.06*glatt(u/.35); }                                   // nach vorn lehnen
    else { const a = clamp((u - .35)/.4, 0, 1), e = glatt(a); f.sitz = 1 - e; f.animHop = .08*Math.sin(a*Math.PI); f.animSq = .06*Math.sin(a*Math.PI) - .06*(1 - a); f.animKopf = .3*(1 - e); if(a >= 1){ f.anim = null; f.sitz = 0; } }
  } else if(A.typ === 'schlucken'){   // Schluck: kurz zusammenziehen, Kopf hoch, zufrieden nachfedern
    f.animSq = u < .18 ? -.07*Math.sin(u/.18*Math.PI) : .04*Math.exp(-(u - .18)*6)*Math.sin((u - .18)*14); f.animKopf = -.12*Math.sin(clamp(u/.5, 0, 1)*Math.PI);
    if(u > .7) f.anim = null;
  } else if(A.typ === 'aufspringen'){
    f.sitzZiel = 0; const a = clamp(u/.25, 0, 1); f.sitz = 1 - a; f.animHop = .55*Math.sin(clamp(u/.55, 0, 1)*Math.PI); f.animSq = u < .1 ? -.15 : .1*Math.sin(clamp(u/.55, 0, 1)*Math.PI);
    if(u > .55){ f.anim = null; f.sitz = 0; }
  }
  return true;
}
function staubWolke(f){ const y = f.fuss - hubVon(Object.keys(FIG).find(k => FIG[k] === f)) + 6; for(let i = 0; i < 9; i++) st.staub.push({x: f.x + (Math.random() - .5)*120, y, vx: (Math.random() - .5)*50, vy: -10 - Math.random()*25, r: 6 + Math.random()*8, l: 1}); }
const TUER_X = {prof: 1367, affe: 1472, schwein: 1472};   // x der Türöffnung je Tiefe (Blender: Wand x 13,93)
function figurenSchritt(dt, t){
  for(const k in FIG){
    const f = FIG[k];
    const animiert = animSchritt(f, t);
    if(f.geh){ const u = clamp((t - f.geh.t0)/f.geh.d, 0, 1), xa = f.x, sa = Math.floor(f.schritt/Math.PI); f.x = lerp(f.geh.von, f.geh.nach, glatt(u)); f.schritt += Math.abs(f.x - xa)/13;
      if(f.geh.schleichen){ const n = Math.floor(t*9/Math.PI); if(f.tippelN === undefined) f.tippelN = n; if(n !== f.tippelN){ f.tippelN = n; f.tippelZ = (f.tippelZ || 0) + 1; TON.schritt(k, 1, f.tippelZ); } }   // Schleichen: Cartoon-Zupfton genau beim Aufsetzen (Hüpfer |sin(t·9)|), Töne im Wechsel
      else if(Math.floor(f.schritt/Math.PI) > sa) TON.schritt(k, 0);   // normales Gehen: Schritt-Geräusch aus dem Spiel
      const tx = TUER_X[k];   // Tür in der rechten Wand: Professor öffnet und schließt; Affe öffnet leise, Schweinchen schließt leise
      if(f.x > tx - 45 && xa <= tx - 45 && (k === 'prof' || k === 'affe')) TON.datei('tuer_auf', k === 'prof' ? 1 : .8);
      if(u >= 1 && f.x > tx && (k === 'prof' || k === 'schwein')) TON.datei('tuer_zu', k === 'prof' ? .8 : .7);
      if(u >= 1) f.geh = null; }
    const p = zielPose(k, t), schnell = p.schnell || (st.sternT0 !== null && t - st.sternT0 > .3 && t - st.sternT0 < 1.6), q = 1 - Math.exp(-dt*(schnell ? 15 : f.geh ? 12 : 7));
    f.pitch += (p.pitch*f.sitz - f.pitch)*q*.6; f.roll += (p.roll*f.sitz - f.roll)*q*.5;
    f.mundZiel = (f.mundZiel || 0) + ((p.mund || 0) - (f.mundZiel || 0))*q;
    f.yaw += (p.yaw - f.yaw)*q; if(f.animYaw !== null) f.yaw = f.animYaw; f.auge += (p.auge - f.auge)*q; f.hop += (p.hop - f.hop)*(1 - Math.exp(-dt*14));
    for(const n of ['head', 'armN', 'armP']) f[n] = f[n].map((v, i) => v + (p[n][i] - v)*q);
    if(f.animKopf !== null) f.head = [f.head[0]*.5 + f.animKopf, f.head[1], f.head[2]];
    if(!animiert) f.sitz += (f.sitzZiel - f.sitz)*(1 - Math.exp(-dt*5)); f.decke += (f.deckeZiel - f.decke)*(1 - Math.exp(-dt*2.6));
    // Schritte: Füße abwechselnd vor und zurück, der vordere hebt ab; im Sitzen ragen die Füße nach vorn
    const sw = f.geh ? Math.sin(f.schritt) : 0, s = f.sitz;
    f.fussN = [Math.max(0, sw)*.18 + .12*s, sw*.3 + .42*s]; f.fussP = [Math.max(0, -sw)*.18 + .12*s, -sw*.3 + .42*s];
    if(t > f.nb){ f.blink = t + .13; f.nb = t + 2 + Math.random()*3.5; }
  }
  // Keks: Bisse zählen (Knacken + Krümel genau im Moment des Zubeißens), am Ende schlucken
  if(st.keks){ const K = keksZustand(t);
    if(K.genommen && !st.keksWeg) st.keksWeg = true;
    if(K.bisse > st.keks.bisse){ st.keks.bisse = K.bisse; TON.knabbern();
      const m = FIG.affe.mundPkt || keksPunkt(); for(let i = 0; i < 7; i++) st.kruemel.push({x: m.x + 4 + Math.random()*10, y: m.y + 8, vx: (Math.random() - .3)*70, vy: -20 - Math.random()*50, l: 1, g: 1.5 + Math.random()*2, f: Math.random()}); }
    if(K.schlucken && !st.keks.geschluckt){ st.keks.geschluckt = true; FIG.affe.anim = {typ: 'schlucken', t0: t}; }
    if(K.phase === 'fertig') st.keks = null; }
  // Zettel: Zustände weiterschalten
  { const Z = st.zettel, u = t - Z.t0; if(Z.z === 'nehmen' && u > 1.1) st.zettel = {z: 'zeigen', t0: t}; if(Z.z === 'ablegen' && u > 1.3) st.zettel = {z: 'liegt', t0: t}; }
  for(const c of st.kruemel){ c.x += c.vx*dt; c.y += c.vy*dt; c.vy += 420*dt; if(c.y > FIG.affe.fuss + 4){ c.y = FIG.affe.fuss + 4; c.vx = 0; c.vy = 0; c.l -= dt*.25; } }
  st.kruemel = st.kruemel.filter(c => c.l > 0);
  for(const s of st.staub){ s.x += s.vx*dt; s.y += s.vy*dt; s.vx *= .96; s.r += dt*14; s.l -= dt*1.1; }
  st.staub = st.staub.filter(s => s.l > 0);
}
const keksPunkt = () => FIG.affe.handP || {x: FIG.affe.x, y: FIG.affe.fuss - KE};
// Ablauf beim Keks (Sekunden ab „nehmen“): greifen, hochheben, vier Bisse (der letzte steckt den Rest in den Mund), kauen, schlucken
const KEKS = {greifen: .5, heben: 1.05, bisse: [1.4, 2.4, 4.3, 5.1], schlucken: 6.35, ende: 6.9};
const KEKS_R = 15;   // Keks-Größe (gleich auf dem Teller und in der Pfote)
function keksZustand(t){
  const u = t - st.keks.t0, R = {phase: 'essen', w: 0, mund: 0, bisse: 0, nicken: 0, genommen: u >= KEKS.greifen, flach: 0, schlucken: u >= KEKS.schlucken};
  if(u >= KEKS.ende){ R.phase = 'fertig'; R.bisse = 4; return R; }
  if(u < KEKS.greifen){ R.phase = 'greifen'; R.flach = 1; return R; }
  if(u < KEKS.heben){ R.phase = 'heben'; R.flach = 1 - glatt((u - KEKS.greifen)/(KEKS.heben - KEKS.greifen)); return R; }
  let kauen = false;
  KEKS.bisse.forEach((B, i) => { const v = u - B; if(v < 0) return;
    if(v < .3){ const a = glatt(v/.3); R.w = Math.max(R.w, a); R.mund = Math.max(R.mund, .95*a); }                                       // Keks zum Mund, Maul weit auf
    else if(v < .38){ const a = (v - .3)/.08; R.w = 1; R.mund = Math.max(R.mund, .95*(1 - a)); R.nicken = .1*a; }                     // zubeißen
    else if(v < .75){ const a = glatt((v - .38)/.37); R.w = Math.max(R.w, 1 - a); R.nicken = Math.max(R.nicken, .1*(1 - a)); }       // abbeißen, zurückziehen
    if(v >= .34) R.bisse = i + 1;
    if(v >= .38) kauen = true; });
  if(kauen && u < KEKS.schlucken && R.mund < .05){ R.mund = .1 + .32*Math.abs(Math.sin(u*9.5)); R.nicken += .035*Math.sin(u*9.5); }
  return R;
}
// Wo der Keks gerade ist: in der Pfote, beim Abbeißen am Mund
function keksLage(t){
  const f = FIG.affe, K = keksZustand(t), h = f.handP || keksPunkt(), m = f.mundPkt || h;
  const ax = h.x - 5, ay = h.y + 12, dx = h.x - m.x, dy = h.y - m.y, dl = Math.hypot(dx, dy) || 1, mx = m.x + 4 + dx/dl*14, my = m.y + 1 + dy/dl*14;   // beim Biss: Keks zwischen Mund und Pfote
  return {x: lerp(ax, mx, K.w), y: lerp(ay, my, K.w), rot: -.3*K.w + .1, flach: K.flach, bisse: K.bisse, K};
}
// Wunschzettel: liegt auf dem Sitzkissen rechts neben dem Schweinchen oder ist in seiner rechten Pfote
const ZETTEL = {x: 318, unten: ZIMMER.daten ? 564 : SOFA.sitz - 12, s: 1.2, h: 38, flachY: .26};
function zettelLiegt(){ return {x: ZETTEL.x, y: ZETTEL.unten - ZETTEL.h*ZETTEL.s*ZETTEL.flachY/2, rot: .04, flach: 1}; }
const zettelLiest = () => st.phase === 'innen' && (DREHBUCH[st.zeile] || {}).geste === 'zettel';
function zettelInHand(){
  if(zettelLiest()){ const kp = kopfPunkt('schwein'); return {x: kp.x - 2, y: kp.y + 90, rot: .02, flach: 0, vor: 1}; }
  const h = FIG.schwein.handP; if(!h) return zettelLiegt();
  const tief = clamp((h.y - 535)/(562 - 535), 0, 1);   // 0 = hochgehalten, 1 = unten am Sitz
  return {x: h.x + lerp(-12, 12, tief), y: h.y + lerp(-22, 4, tief), rot: lerp(.12, .04, tief), flach: 0};
}
function zettelLage(t){
  const Z = st.zettel, u = t - Z.t0, mix = (a, b, k) => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), rot: lerp(a.rot, b.rot, k), flach: lerp(a.flach, b.flach, k), vor: (k > .5 ? b : a).vor});
  if(Z.z === 'liegt') return Object.assign(zettelLiegt(), {liegt: true});
  if(Z.z === 'nehmen'){ if(u < .45) return Object.assign(zettelLiegt(), {liegt: true}); return mix(zettelLiegt(), zettelInHand(), glatt((u - .45)/.3)); }
  if(Z.z === 'ablegen'){ if(u < .5) return zettelInHand(); if(u < .8) return mix(zettelInHand(), zettelLiegt(), glatt((u - .5)/.3)); return Object.assign(zettelLiegt(), {liegt: true}); }
  return zettelInHand();
}
// Schatten auf dem Dielenboden (gerendertes Zimmer): dunkler Kontakt unter den Füßen + weicher Schlagschatten,
// der von der Hängelampe weg fällt; beim Hochheben (Hinsetzen/Hüpfen) wird er heller und kleiner
function bodenSchatten(c, f, k, hub){
  const r = k === 'prof' ? 1.25 : 1, hoch = clamp(hub/40 + Math.max(0, f.hop + f.animHop)*1.5, 0, 1), y = f.fuss + 3;
  const [lx] = ZIMMER.pkt.lampe, dx = clamp((f.x - lx)/6, -70, 70);
  c.save(); c.globalCompositeOperation = 'multiply';
  const zeichne = (x, rx, ry, a) => { c.save(); c.translate(x, y); c.scale(rx, ry); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, `rgba(40,22,12,${a})`); g.addColorStop(.6, `rgba(90,60,40,${a*.45})`); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, 7); c.fill(); c.restore(); };
  zeichne(f.x + dx, (95 + Math.abs(dx)*.6)*r, 16, .55*(1 - hoch*.6));
  zeichne(f.x, 52*r*(1 - hoch*.3), 7, .9*(1 - hoch));
  c.restore();
}
// die Pfoten noch einmal über das gehaltene Ding malen (echte 3D-Pfoten, nur der sichtbare Teil)
function pfotenDrueber(c, f, welche, vorn){ if(!FIG3D.bereit() || !f.bild) return; const b = f.bild; c.drawImage(FIG3D.rendereHaende(f.art, welche, vorn), b.x, b.y, b.w, b.h); }
// Figuren an das gerenderte Zimmerlicht anpassen (warm, etwas gedämpft)
// Filmlicht je Figur: Hauptlicht kommt von der Hängelampe (je weiter weg, desto schwächer), kühler Saum vom Mondfenster
const norm3 = v => { const l = Math.hypot(...v) || 1; return v.map(q => q/l); };
function filmLicht(f, py){
  const [lx, ly] = ZIMMER.pkt.lampe, [wx, wy] = ZIMMER.pkt.fenster, cy = py - 40;
  const d = Math.hypot(lx - f.x, ly - cy)/100, I = clamp(2.2/(1 + d*d/10), .68, 1.25);
  return {Key: norm3([(lx - f.x)/100, (cy - ly)/100, .35]), KeyCol: [1.0*I, .66*I, .4*I],
          Rim: norm3([(wx - f.x)/100, (cy - wy)/100, -2.2]), RimCol: [.42, .52, .85],
          Amb0: [.12, .08, .06], Amb1: [.36, .28, .21]};
}
function mundAuf(f, t){
  const sp = Math.max(f.pegel || 0, Math.max(0, 1 - (t - f.silbe)/.12), f.mundZiel || 0);
  if(f === FIG.affe && st.keks){ const K = keksZustand(t); return Math.max(K.mund, sp*.7); }
  return sp;
}
function figurZeichnen(c, k, t){
  const f = FIG[k], mund = mundAuf(f, t), bob = Math.sin(t*2.2 + f.x0)*.022 + (f.geh ? Math.abs(Math.sin(f.schritt))*.05 : 0), hub = f.sitz*hubVon(k);
  const py = f.fuss - 2.5*KE + 5 - hub;
  if(ZIMMER.bereit){ if(hub < 40) bodenSchatten(c, f, k, hub); }
  else if(hub < 20){   // Schatten am Boden: weich + dunkler Kontakt direkt unter den Füßen
    const r = k === 'prof' ? 1.25 : 1;
    c.fillStyle = 'rgba(20,10,5,.22)'; c.beginPath(); c.ellipse(f.x, f.fuss + 2, 66*r, 11, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(20,10,5,.45)'; c.beginPath(); c.ellipse(f.x, f.fuss + 1, 40*r, 5.5, 0, 0, 7); c.fill();
  }
  const P = {yaw: f.yaw, roll: f.roll, pitch: f.pitch, pivot: .8, bob: bob + f.hop + f.animHop, head: f.head.map((v, i) => v + (i === 0 ? .06*mund : 0)), armN: f.armN, armP: f.armP, fussN: f.fussN, fussP: f.fussP, auge: f.auge, mund, blinzeln: t < f.blink, sq: Math.sin(t*2.2 + f.x0)*.012 + f.animSq};
  const w = FH*FIG3D.SPR/FIG3D.SPRH;
  const oben = py - (FIG3D.FR.y1 - 2.5)/(FIG3D.FR.y1 - FIG3D.FR.y0)*FH;
  if(FIG3D.bereit()){ FIG3D.licht(1, 1, 1); FIG3D.szene(ZIMMER.bereit ? filmLicht(f, py) : null); }
  if(FIG3D.bereit()){ c.drawImage(FIG3D.rendere(f.art, P, t), f.x - w/2, oben, w, FH);
    const h = FIG3D.haende(), sp = q => q ? {x: f.x - w/2 + q[0]*w, y: oben + q[1]*FH, z: q[2]} : null; f.handN = sp(h.N); f.handP = sp(h.P); f.mundPkt = sp(h.M); f.bild = {x: f.x - w/2, y: oben, w, h: FH}; }
  else ersatzFigur(c, k, f.x, py);
  if(!FIG3D.bereit()) return;
  if(k === 'schwein'){ const L = zettelLage(t);
    if(!L.liegt){ zettelZeichnen(c, L.x, L.y, L.rot, ZETTEL.s, L.flach); pfotenDrueber(c, f, 'P'); } }
  if(k === 'affe'){
    if(st.keks && st.keksWeg){ const L = keksLage(t);
      if(L.bisse < 4){ if(ZIMMER.bereit && ZIMMER.ebene) spriteZeichnen(c, ZIMMER.ebene['spr_keks' + L.bisse], L.x, L.y, KEKS_R*2.1, L.rot, 1 - .45*L.flach); else keksZeichnen(c, L.x, L.y, KEKS_R, L.bisse, L.flach, L.rot); if(f.handP && Math.hypot(f.handP.x - L.x, f.handP.y - L.y) < 40) pfotenDrueber(c, f, 'P', L.K.w > .3); } }
    for(const cr of st.kruemel){ c.fillStyle = `rgba(${cr.f < .5 ? '201,138,74' : '120,72,36'},${cr.l.toFixed(2)})`; c.fillRect(cr.x - cr.g/2, cr.y - cr.g/2, cr.g, cr.g); }
  }
}
// eine gerenderte Ebene an ihrer Stelle ins Zimmer legen (a = Deckkraft)
function ebeneZeichnen(c, e, a){ if(!e || a < .01) return; const r = e.r; c.globalAlpha = a; c.drawImage(e.bild, r[0], r[1], r[2] - r[0], r[3] - r[1]); c.globalAlpha = 1; }
// gerendertes Einzelbild (Sprite) mittig an x,y, auf Breite b skaliert, gedreht, senkrecht gestaucht (sy)
function spriteZeichnen(c, e, x, y, b, rot = 0, sy = 1, a = 1){ const r = e.r, w = r[2] - r[0], h = r[3] - r[1], k = b/w;
  c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.scale(k, k*sy); c.drawImage(e.bild, -w/2, -h/2, w, h); c.restore(); }
function zettelZeichnen(c, x, y, rot, s, flach = 0){   // flach: 0 = aufrecht in der Pfote, 1 = liegt auf dem Kissen
  if(ZIMMER.bereit && ZIMMER.ebene) return spriteZeichnen(c, ZIMMER.ebene.spr_zettel, x, y, 52*s, rot, 1 - (1 - ZETTEL.flachY)*flach);
  const w = 52, h = ZETTEL.h, sy = 1 - (1 - ZETTEL.flachY)*flach;
  if(flach > .5){ c.fillStyle = `rgba(60,20,20,${(.28*(flach - .5)*2).toFixed(3)})`; c.beginPath(); c.ellipse(x + 3, y + h*s*sy/2 + 1, w*s*.56, 4, 0, 0, 7); c.fill(); }
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s*sy);
  if(flach < .5){ c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-w/2 + 3, -h/2 + 4, w, h); }
  c.fillStyle = '#fffaf0'; c.beginPath(); c.moveTo(-w/2, -h/2); c.lineTo(w/2 - 9, -h/2); c.lineTo(w/2, -h/2 + 9); c.lineTo(w/2, h/2); c.quadraticCurveTo(0, h/2 + 2, -w/2, h/2); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(90,70,50,.4)'; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#e6dcc6'; c.beginPath(); c.moveTo(w/2 - 9, -h/2); c.lineTo(w/2 - 9, -h/2 + 9); c.lineTo(w/2, -h/2 + 9); c.closePath(); c.fill();   // Eselsohr
  c.strokeStyle = '#6a7ab8'; c.lineWidth = 1.5; c.lineCap = 'round';
  for(let i = 0; i < 3; i++){ c.beginPath(); c.moveTo(-w/2 + 7, -h/2 + 8 + i*7); for(let q = 1; q <= 6; q++) c.lineTo(-w/2 + 7 + q*(i === 1 ? 5 : 5.6), -h/2 + 8 + i*7 + (q % 2 ? -1 : .6)); c.stroke(); }
  c.fillStyle = '#e8405a'; c.font = `700 9px ${SCHRIFT_TEXT}`; c.textAlign = 'left'; c.fillText('1. 2. 3.', -w/2 + 6, h/2 - 5);
  c.beginPath(); const hx = w/2 - 10, hy = h/2 - 9; c.moveTo(hx, hy + 4); c.bezierCurveTo(hx - 7, hy - 1, hx - 3, hy - 6, hx, hy - 2); c.bezierCurveTo(hx + 3, hy - 6, hx + 7, hy - 1, hx, hy + 4); c.fill();   // Herzchen
  c.restore();
}
function ersatzFigur(c, k, x, py){   // ohne WebGL2: einfache gemalte Figur
  const col = {prof: '#c2262e', affe: '#b07842', schwein: '#f2a0b8'}[k];
  c.fillStyle = col; c.beginPath(); c.arc(x, py + 60, 48, 0, 7); c.fill();
  c.fillStyle = '#f3ead8'; c.beginPath(); c.arc(x, py - 10, 44, 0, 7); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(x - 14, py - 16, 5, 0, 7); c.arc(x + 14, py - 16, 5, 0, 7); c.fill();
}
// Decke im gerenderten Zimmer: Bündel auf der Armlehne (Ebene), in der Pfote (Einzelbild), Entfalten Bild für Bild
// aus der Stoff-Simulation, am Ende über dem Professor; weggeworfen fliegt sie zur Seite
function deckeGerendert(c, x, y, D){
  const E = ZIMMER.ebene;
  if(D.buendel){ if(D.ablage) ebeneZeichnen(c, E.buendel, D.ein === undefined ? 1 : D.ein); else spriteZeichnen(c, E.spr_buendel, D.buendel.x, D.buendel.y, 70); return; }
  if(D.wurf !== undefined){ const w = D.wurf, f = E.decke[E.decke.length - 1], r = f.r; c.save(); c.globalAlpha = 1 - w; c.translate(-170*w, 70*w*w); c.rotate(-.25*w);
    c.drawImage(f.bild, r[0], r[1], r[2] - r[0], r[3] - r[1]); c.restore(); return; }
  if(D.k > 0){ const i = Math.min(E.decke.length - 1, Math.floor(D.k*(E.decke.length - 1) + .5)); ebeneZeichnen(c, E.decke[i], clamp(D.k*6, 0, 1)); }
}
function deckeMalen(c, x, y, D){ if(ZIMMER.bereit && ZIMMER.ebene) deckeGerendert(c, x, y, D); else deckeZeichnen(c, x, y, D); }
function deckeZustand(t){
  const d = st.decke, ablage = ZIMMER.bereit ? {x: ZIMMER.pkt.sessel_arm_links[0] + 6, y: ZIMMER.pkt.sessel_arm_links[1] - 16} : {x: SESSEL.x - 104, y: SESSEL.sitz - 78};
  if(!d) return {k: 0, buendel: ablage, ablage: true};
  const u = t - d.t0;
  if(d.typ === 'nehmen'){
    if(u < .7) return {k: 0, buendel: ablage, ablage: true};
    if(u < 1.25) return {k: 0, inHand: true};
    return {k: glatt((u - 1.25)/1.0)};
  }
  if(u < .45) return {k: 1 - glatt(u/.45), wurf: glatt(u/.45)};   // weggeworfen
  return {k: 0, buendel: ablage, ablage: true, ein: clamp((u - .9)/.5, 0, 1)};
}
// Das ganze Zimmer (Hintergrund, Sessel, Figuren, Licht) in eine Leinwand malen – drinnen UND im Fenster beim Hineinzoomen
function zimmerMalen(c, B, t){
  const wx = Math.sin(t*53)*7*st.wackeln, wy = Math.cos(t*61)*5*st.wackeln;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, c.canvas.width, c.canvas.height);
  c.setTransform(B.a*1.02, 0, 0, B.d*1.02, B.e + B.a*(-W*.01 + wx), B.f + B.d*(-H*.01 + wy));
  innenZeichnen(c, t, st);
  sofaHinten(c); sesselHinten(c);
  // echte Schatten der sitzenden Figuren (in Blender mit Platzhaltern gerechnet), blenden mit dem Hinsetzen ein
  if(ZIMMER.bereit && ZIMMER.ebene){ const E = ZIMMER.ebene, a = k => glatt(clamp((FIG[k].sitz - .15)/.85, 0, 1));
    ebeneZeichnen(c, E.sofa_s, a('schwein')); ebeneZeichnen(c, E.sofa_sa, Math.min(a('schwein'), a('affe'))); ebeneZeichnen(c, E.sessel_p, a('prof'));
    if(!st.keksWeg) ebeneZeichnen(c, E.keks, 1); }
  else if(ZIMMER.bereit && ZIMMER.schatten){ c.save(); c.globalCompositeOperation = 'multiply';
    for(const k in ZIMMER.schatten){ const S = ZIMMER.schatten[k], a = glatt(clamp((FIG[k].sitz - .2)/.8, 0, 1)); if(a < .02) continue; c.globalAlpha = a; c.drawImage(S.bild, S.r[0], S.r[1], S.r[2], S.r[3]); }
    c.restore(); }
  { const L = zettelLage(t); if(L.liegt && ZIMMER.ebene) ebeneZeichnen(c, ZIMMER.ebene.zettel_liegt, 1); else if(L.liegt || !FIG3D.bereit()) zettelZeichnen(c, L.x, L.y, L.rot, ZETTEL.s, L.liegt ? 1 : L.flach); }
  const sitzt = k => FIG[k].sitz > .3;
  for(const k of ['schwein', 'affe']) if(sitzt(k)) figurZeichnen(c, k, t);
  // Vorderkante der Sitzkissen vor den sitzenden Figuren: sie sinken ins Polster ein
  if(ZIMMER.bereit && ZIMMER.ebene && ZIMMER.ebene.polster_s){ const E = ZIMMER.ebene;
    ebeneZeichnen(c, FIG.affe.sitz > .3 ? E.polster_sa : E.polster_s, 1); }
  sofaVorne(c);
  for(const k of ['schwein', 'affe']) if(!sitzt(k)) figurZeichnen(c, k, t);
  const D = deckeZustand(t);
  if(sitzt('prof')){ figurZeichnen(c, 'prof', t); if(ZIMMER.bereit && ZIMMER.ebene && ZIMMER.ebene.polster_p) ebeneZeichnen(c, ZIMMER.ebene.polster_p, 1); sesselVorne(c); deckeMalen(c, SESSEL.x, SESSEL.sitz - 6, D); }
  else { sesselVorne(c); deckeMalen(c, SESSEL.x, SESSEL.sitz - 6, D); figurZeichnen(c, 'prof', t); }
  if(D.inHand && FIG.prof.handN) deckeMalen(c, SESSEL.x, SESSEL.sitz - 6, {k: 0, buendel: {x: FIG.prof.handN.x + 8, y: FIG.prof.handN.y - 4}});
  for(const s of st.staub){ c.fillStyle = `rgba(230,215,190,${(s.l*.35).toFixed(3)})`; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 7); c.fill(); }
  // Licht der Sternschnuppe fällt ins Zimmer
  if(st.stern && st.stern.a > .02){ const s = st.stern, d = Math.hypot(s.x - FENSTER.x, s.y - FENSTER.y), a = s.a*clamp(1.3 - d/(FENSTER.r + 120), 0, 1);
    if(a > 0){ glow(c, s.x, s.y, 900, '255,244,210', .32*a); glow(c, FENSTER.x, FENSTER.y, 260, '255,250,230', .25*a); } }
  if(st.einschlag > 0) glow(c, FENSTER.x + 72, FENSTER.y + 25, 1100, '255,236,190', .6*st.einschlag);
  const g = c.createRadialGradient(W*.45, H*.45, H*.3, W*.5, H*.5, H*1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(20,8,2,${ZIMMER.bereit ? .3 : .55})`);
  c.fillStyle = g; c.fillRect(-40, -40, W + 80, H + 80);
  c.setTransform(B.a, 0, 0, B.d, B.e, B.f);
}


// ---------- Dialog-Ablauf ----------
const TEMPO = {prof: 21, affe: 30, schwein: 24};
function zeitplan(text, wer){   // wann welcher Buchstabe erscheint (Pausen an Satzzeichen)
  const z = []; let tt = 0, d = 1/TEMPO[wer];
  for(const ch of text){ z.push(tt); tt += d; if('.!?'.includes(ch)) tt += .28; else if(ch === ',') tt += .12; else if(ch === '…' || ch === '–') tt += .32; }
  return {z, ende: tt};
}
let plan = null, gezeigt = 0;
function regieAusfuehren(e, t){
  if(e.geh !== undefined){ const f = FIG[e.wer]; f.geh = {von: f.x, nach: e.geh, t0: t, d: Math.max(.4, Math.abs(e.geh - f.x)/(e.tempo || 150)), schleichen: !!e.schleichen}; }
  if(e.licht !== undefined){ st.licht = e.licht; TON.klick(); }   // Lichtschalter
  if(e.ton) TON.datei(e.ton);   // eigene Aufnahme (Schritte …)
  if(e.setzen) animStarten(FIG[e.wer], 'setzen', t);
  if(e.aufstehen) animStarten(FIG[e.wer], 'aufstehen', t);
  if(e.decke !== undefined) st.decke = {typ: e.decke ? 'nehmen' : 'weg', t0: t};
  if(e.zettel) st.zettel = {z: e.zettel, t0: t};
  if(e.keks === 'nehmen'){ st.keks = {t0: t, bisse: 0}; st.keksWeg = false; }
}
function zeileStarten(i){
  if(st.aufn){ st.aufn.stopp(); st.aufn = null; }
  for(const k in FIG) FIG[k].pegel = 0;
  st.zeile = i; st.zT0 = jetzt(); st.fertigT = null; gezeigt = 0;
  const z = DREHBUCH[i];
  if(!z){ st.phase = 'ende'; st.t0 = jetzt(); document.getElementById('nochmal').hidden = false; return; }
  plan = z.text ? zeitplan(z.text, z.wer) : null;
  for(const e of z.regie || []) st.events.push(Object.assign({t: jetzt() + e.verz}, e));
  if(z.aktion === 'stern'){ st.sternT0 = jetzt() + .2; st.stern = null; st.einschlagT = null; }
  if(z.text && st.stimmen === 'aufnahmen' && !SHOT) st.aufn = TON.aufnahme(i);
}
const sternAktiv = () => st.sternT0 !== null && jetzt() - st.sternT0 < STERN.einschlag + .9;
// Klick / Leertaste: aktuellen Satz überspringen
function weiter(){
  if(st.phase === 'warten'){ starten(); return; }
  if(st.phase !== 'innen') return;
  const z = DREHBUCH[st.zeile];
  if(z && z.sternAbwarten && sternAktiv()) return;
  st.hinweis = Math.max(0, st.hinweis - .5);
  zeileStarten(st.zeile + 1);
}
function dialogSchritt(t){
  const z = DREHBUCH[st.zeile]; if(!z) return;
  if(z.pause){ if(t - st.zT0 > z.pause && !(z.sternAbwarten && sternAktiv())) zeileStarten(st.zeile + 1); return; }
  if(!plan) return;
  if(st.fertigT === null){
    if(st.aufn){   // Aufnahme läuft: der Mund folgt der Lautstärke
      const tp = st.aufn.zeit(), h = st.aufn.huelle, pg = tp < 0 ? 0 : (h[Math.floor(tp*30)] || 0);
      FIG[z.wer].pegel += (pg - FIG[z.wer].pegel)*.6;
      if(tp >= st.aufn.dauer){ st.fertigT = t; FIG[z.wer].pegel = 0; st.aufn = null; }
    } else {       // Fantasiesprache
      const el = t - st.zT0;
      let n = 0; while(n < plan.z.length && plan.z[n] <= el) n++;
      const v = TON.STIMME[z.wer];
      for(let i = gezeigt; i < n; i++){ const ch = z.text[i]; if(/[a-zäöüß]/i.test(ch) && i % v.jede === 0){ TON.silbe(z.wer, ch, /[A-ZÄÖÜ]/.test(ch) && /[A-ZÄÖÜ]/.test(z.text[i + 1] || ''), z.leise, z.text.trim().endsWith('?')); FIG[z.wer].silbe = t; } }
      gezeigt = Math.max(gezeigt, n);
      if(gezeigt >= z.text.length) st.fertigT = t;
    }
  }
  // wie im Film: der nächste Satz kommt gleich, ohne Warten auf einen Klick
  if(st.fertigT !== null && st.auto && t - st.fertigT >= (z.luecke !== undefined ? z.luecke : .35)) zeileStarten(st.zeile + 1);
}
// Untertitel im unteren Kino-Balken (statt Sprechblasen)
function untertitel(t){
  const z = DREHBUCH[st.zeile];
  if(!st.untertitel || st.phase !== 'innen' || !z || !z.text) return;
  const a = clamp((t - st.zT0)/.15, 0, 1);
  ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const name = NAMEN[z.wer] + ':  ', text = z.text;
  ctx.font = `600 21px ${SCHRIFT_TEXT}`; const nw = ctx.measureText(name).width;
  ctx.font = `${z.leise ? 'italic ' : ''}500 21px ${SCHRIFT_TEXT}`; const tw = ctx.measureText(text).width;
  const x0 = W/2 - (nw + tw)/2, y = H - BALKEN/2;
  ctx.textAlign = 'left'; ctx.font = `600 21px ${SCHRIFT_TEXT}`; ctx.fillStyle = {prof: '#ff8a80', affe: '#f2c27a', schwein: '#ffa8c8'}[z.wer]; ctx.fillText(name, x0, y);
  ctx.font = `${z.leise ? 'italic ' : ''}500 21px ${SCHRIFT_TEXT}`; ctx.fillStyle = '#f4ecdc'; ctx.fillText(text, x0 + nw, y);
  ctx.globalAlpha = 1;
}

// ---------- Sternschnuppe: saust am Fenster vorbei, kommt zurück, dreht eine Schleife, stürzt in den Wald ----------
function sternSchritt(t, dt){
  if(st.sternT0 === null) return;
  const u = t - st.sternT0, F = FENSTER;
  if(u < 0) return;
  if(!st.stern){ st.stern = {x: 0, y: 0, spur: [], funken: [], a: 1, laute: 0}; TON.datei('stern'); }
  const s = st.stern, baumX = F.x + 72, baumY = F.y + 92 - 135*.5, cx = F.x + 10, cy = F.y - 62, r = 52;
  let x, y;
  if(u < STERN.einschlag){ const a = u/STERN.einschlag; x = lerp(F.x - F.r - 160, baumX, a); y = lerp(F.y - 120, baumY, a*a); }   // im Bogen von links oben herab
  else { if(s.laute < 3){ s.laute = 3; st.wackeln = 2.6; st.einschlagT = t; st.rums = Array.from({length: 120}, () => { const w = -Math.PI*(.08 + .84*Math.random()), v = 120 + 420*Math.random(); return {x: baumX, y: baumY, vx: Math.cos(w)*v, vy: Math.sin(w)*v, l: .9 + .9*Math.random(), r: 1.5 + 2.5*Math.random()}; }); for(const k of ['schwein', 'affe']) if(FIG[k].sitz > .5) animStarten(FIG[k], 'aufspringen', t); } x = baumX; y = baumY; s.a = Math.max(0, 1 - (u - STERN.einschlag)*6); }
  s.x = x; s.y = y; s.spur.unshift([x, y]); if(s.spur.length > 22) s.spur.pop();
  if(u < STERN.einschlag && Math.random() < .7) s.funken.push({x, y, vx: (Math.random() - .5)*30, vy: Math.random()*20, l: 1});
  for(const f of s.funken){ f.x += f.vx*dt; f.y += f.vy*dt; f.vy += 40*dt; f.l -= dt*1.2; }
  s.funken = s.funken.filter(f => f.l > 0);
  if(u >= STERN.einschlag){ const e = u - STERN.einschlag; st.einschlag = e < .08 ? e/.08 : Math.max(0, 1 - (e - .08)/2.2); st.nachglimmen = Math.min(1, e/1.2); }
}

// ---------- Hauptschleife ----------
let letzte = null, grilleT = 0;
function balken(t){   // Kino-Balken fahren am Anfang der Sequenz herein
  const k = st.phase === 'warten' ? 0 : glatt((t - st.start)/.7), h = BALKEN*k;
  if(h <= 0) return;
  ctx.fillStyle = '#000'; ctx.fillRect(-2, -2, W + 4, h + 2); ctx.fillRect(-2, H - h, W + 4, h + 2);
}
function bild(){
  const t = jetzt(), dt = letzte === null ? 1/60 : clamp(t - letzte, 0, .1); letzte = t;
  const pt = t - st.t0;
  if(!SHOT){
    if(st.phase === 'aussen' && pt > PHASEN.aussen){ st.phase = 'iris'; st.t0 = t; }
    else if(st.phase === 'iris' && pt > PHASEN.iris){ st.phase = 'innen'; st.t0 = t; TON.grillenLaut(.3); zeileStarten(0); }
  }
  if(TON.bereit() && t > grilleT){ TON.grille(st.phase === 'innen' ? .5 : 1); grilleT = t + .25 + Math.random()*.7; }
  while(st.events.length){ const i = st.events.findIndex(e => e.t <= t); if(i < 0) break; regieAusfuehren(st.events.splice(i, 1)[0], t); }
  figurenSchritt(dt, t); sternSchritt(t, dt);
  st.wackeln = Math.max(0, st.wackeln - dt*1.6);
  if(st.rums){ for(const f of st.rums){ f.x += f.vx*dt; f.y += f.vy*dt; f.vy += 260*dt; f.vx *= 1 - dt*.6; f.l -= dt*.75; } st.rums = st.rums.filter(f => f.l > 0); if(!st.rums.length) st.rums = null; }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, can.width, can.height);
  ctx.setTransform(basis.a, 0, 0, basis.d, basis.e, basis.f);
  if(st.phase === 'warten' || st.phase === 'aussen' || st.phase === 'iris'){
    zimmerMalen(innenCtx, basis, t);   // das Zimmer hinter dem Fenster ist echt
    let cam = {s: 1, x: W/2, y: H/2, basis, innen: innenCv};
    if(st.phase !== 'warten'){
      const k = st.phase === 'iris' ? 1 : clamp((pt - ZOOM.start)/(PHASEN.aussen - ZOOM.start), 0, 1);
      const e = k < .5 ? 4*k*k*k : 1 - Math.pow(-2*k + 2, 3)/2;
      const sZ = Math.exp(lerp(0, Math.log(ZOOM.s), e)), nah = (sZ - 1)/(ZOOM.s - 1);
      cam = {s: sZ, x: lerp(W/2, ZOOM.x, nah), y: lerp(H/2, ZOOM.y, nah), basis, innen: innenCv};
      if(st.phase === 'iris') cam.iris = lerp(38, 64, glatt(pt/PHASEN.iris));
    }
    aussenZeichnen(ctx, t, cam);
  } else {
    if(st.phase === 'innen') dialogSchritt(t);
    zimmerMalen(ctx, basis, t);
    if(st.phase === 'ende'){ const a = glatt((t - st.t0)/1.6); ctx.fillStyle = `rgba(10,6,20,${(a*.88).toFixed(3)})`; ctx.fillRect(0, 0, W, H); if(a > .3){ ctx.globalAlpha = glatt((a - .3)/.7); sterneZeichnen(ctx, t, 1, 1, 1, 0, 0); ctx.fillStyle = '#fbf3df'; ctx.font = `700 46px ${SCHRIFT_TITEL}`; ctx.textAlign = 'center'; ctx.fillText('Fortsetzung folgt …', W/2, H/2 - 10); ctx.globalAlpha = 1; } }
  }
  balken(t); untertitel(t);
  if(st.hinweis > 0 && st.phase === 'innen'){ ctx.globalAlpha = st.hinweis*.6; ctx.fillStyle = '#f6e7c8'; ctx.font = `500 13px ${SCHRIFT_TEXT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Klick: Satz überspringen', 20, BALKEN/2); ctx.globalAlpha = 1; }
}
function schleife(){ bild(); requestAnimationFrame(schleife); }

// ---------- Blätterwand (wie im Spiel, js/24-startmenue.js) ----------
const $ = id => document.getElementById(id);
const vorhang = $('leafCurtain');
function vorhangSetzen(kl){ vorhang.className = kl; }
function starten(){
  if(st.phase !== 'warten') return;
  TON.start(); TON.grillenLaut(1); TON.aufnahmenLaden();
  $('hinweisStart').hidden = true;
  vorhangSetzen('on closed');
  setTimeout(() => { vorhangSetzen('on'); TON.blaetter(); }, 300);
  setTimeout(() => vorhangSetzen(''), 1400);
  setTimeout(() => { st.phase = 'aussen'; st.t0 = st.start = jetzt(); $('leiste').hidden = false; }, 380);
}
function neuStart(){
  if(st.aufn){ st.aufn.stopp(); st.aufn = null; }
  Object.assign(st, {phase: 'warten', zeile: -1, fertigT: null, stern: null, sternT0: null, einschlagT: null, einschlag: 0, nachglimmen: 0, wackeln: 0, rums: null, licht: 1, hinweis: 1, events: [], keks: null, keksWeg: false, kruemel: [], staub: [], decke: null, zettel: {z: 'liegt', t0: 0}});
  figurenZuruecksetzen(); TON.grillenLaut(1);
  $('nochmal').hidden = true;
  vorhangSetzen('on'); void vorhang.offsetWidth; vorhangSetzen('on closed');
  setTimeout(() => { vorhangSetzen('on closed title'); TON.glocke(); }, 1050);
  setTimeout(() => starten(), 3200);
}
$('nochmal').addEventListener('click', neuStart);
$('ton').addEventListener('click', () => { const an = !TON.an(); TON.stumm(!an); $('ton').textContent = an ? 'Ton: an' : 'Ton: aus'; $('ton').setAttribute('aria-pressed', an); });
$('untertitel').addEventListener('click', () => { st.untertitel = !st.untertitel; $('untertitel').textContent = st.untertitel ? 'Untertitel: an' : 'Untertitel: aus'; });
$('stimmen').addEventListener('click', () => { st.stimmen = st.stimmen === 'aufnahmen' ? 'fantasie' : 'aufnahmen'; $('stimmen').textContent = st.stimmen === 'aufnahmen' ? 'Stimmen: echt' : 'Stimmen: Fantasie'; });
$('buehnenbox').addEventListener('pointerdown', weiter);
window.addEventListener('keydown', e => { if(e.code === 'Space' || e.code === 'Enter'){ weiter(); e.preventDefault(); } });

// ---------- Start ----------
groesse();
FIG3D.start();
if(SHOT){
  // Standbild für Fotos: ?shot=warten|aussen|iris|innen &t=Sekunden &zeile=Nummer (Regie bis dahin wird nachgespielt)
  $('leiste').hidden = true; $('hinweisStart').hidden = SHOT !== 'warten';
  vorhangSetzen(SHOT === 'warten' ? 'on closed title' : '');
  const tt = parseFloat(QS.get('t') || '0'), zeile = parseInt(QS.get('zeile') || '0');
  T = 100; st.phase = SHOT; st.t0 = T - tt; st.start = SHOT === 'aussen' ? T - tt : T - 30;
  if(SHOT === 'innen'){
    // alle Zeilen bis zur gewünschten im Schnelldurchlauf (je 6 s), damit Laufwege, Sessel und Keks stimmen
    T = 0; st.phase = 'innen'; st.auto = false; st.hinweis = 0;
    for(let i = 0; i <= zeile; i++){ zeileStarten(i); const zz = DREHBUCH[i], len = zz.text ? ((typeof AUFNAHMEN !== 'undefined' && AUFNAHMEN[i]) ? AUFNAHMEN[i].dauer : 3) + (zz.luecke !== undefined ? zz.luecke : .35) : (zz.pause || 0) + (zz.sternAbwarten ? 3 : 0); const bis = T + (i < zeile ? len : tt); while(T < bis){ T += 1/30; while(st.events.length){ const j = st.events.findIndex(e => e.t <= T); if(j < 0) break; regieAusfuehren(st.events.splice(j, 1)[0], T); } figurenSchritt(1/30, T); sternSchritt(T, 1/30); } }
  } else { for(let i = 0; i < 90; i++){ T = 100 - 1.5 + i/60; figurenSchritt(1/60, T); } T = 100; }
  const fertig = () => { letzte = null; bild(); bild(); window.fertig = true; };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => ZIMMER.geladen).then(() => typeof AUSSEN !== 'undefined' ? AUSSEN.geladen : 0).then(() => setTimeout(fertig, 1300));
} else {
  vorhangSetzen('on closed title');
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(schleife));
}
