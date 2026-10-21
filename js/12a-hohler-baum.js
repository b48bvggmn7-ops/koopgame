// Hohler Baum als Start und Ziel (nur Dschungel-Look; andere Welten behalten das Ziel-Schild, 12-welt-zeichnen.js).
// Start: Baum zwischen den Startplätzen, Eingang leuchtet sanft. Ziel: Eingang zuerst dunkel; sind beide im Ziel (won),
// gehen die Figuren hinein, der Eingang leuchtet auf und eine Holztür fährt herunter (Ablauf über winSteps, fester Takt).
// Der Baum selbst ist ein Zwischenspeicher-Bild (klein, einmal je Tag/Nacht); Loch-Licht und Tür werden je Bild gemalt.
// Der Baum steht vor Boden/Wand/Pflanzen (Nutzerwunsch „ganz im Vordergrund“), Münzen und Figuren bleiben davor sichtbar.
const BAUM_SKALA = 0.7;            // Entwurf (scratchpad baum.html) ist 1,0 = ca. 330 px hoch -> im Spiel ca. 230 px
const BAUM_BILD_AUFLOESUNG = 3;    // Pixel je Weltpixel im Zwischenspeicher (scharf bis 4K)
const BAUM_LICHT_START = 0.6, BAUM_LICHT_ZIEL = 0.15;   // Leuchten des Eingangs (0..1) vor dem Sieg
// Ablauf nach dem Sieg (Schritte nach won, 54 = 1 s): erst tanzen beide (fröhlich, Herzchen), dann gehen sie ZUSAMMEN in
// den Baum, dann leuchtet der Eingang auf und die Tür fährt herunter; danach „Level geschafft“
const BAUM_TANZ_SCHRITTE = 135;                     // so lange tanzen beide vor dem Baum
const BAUM_HINEIN_DAUER = 55, BAUM_HINEIN_TEMPO = 1.7, BAUM_HINEIN_ABSTAND = 12;   // gemeinsam hineingehen (px/Schritt, Plätze ±12)
const BAUM_LICHT_AB = 175, BAUM_LICHT_DAUER = 50;   // Eingang leuchtet auf
const BAUM_TUER_AB = 200, BAUM_TUER_DAUER = 45;     // Tür fährt herunter
const BAUM_SIEG_ENDE = 300;                          // dann weiter wie nach dem Tanz (statt WIN_DANCE_STEPS)
const BAUM_WARTE_ABSTAND = 30, BAUM_WARTE_TEMPO = 1.5;   // wer zuerst ankommt: geht bis 30 px vor den Eingang und wartet

function baumAktiv(){ return typeof BG_STIL !== 'undefined' && !!(BG_STIL && BG_STIL.tiere); }
function baumFarben(nacht){
  return nacht ? {rinde:'#2b2a3a', rindeH:'#45465e', rindeD:'#15151f', moos:'#2f6b6a', moosH:'#4f9c95', loch:'#05060a', licht:'255,170,80', blatt:'#1f4a4a', blattH:'#2f6b66', pilz:'#6af0ff', tuer:'#4a3a32', tuerH:'#6a5444'}
               : {rinde:'#6e4a2c', rindeH:'#9a6c43', rindeD:'#3d2614', moos:'#4f8f2f', moosH:'#86c454', loch:'#140a05', licht:'255,190,90', blatt:'#2f7d32', blattH:'#5cb84c', pilz:'#e0402e', tuer:'#8a5a30', tuerH:'#b07a44'};
}
let baumLochPfad = null;
function baumLoch(){
  if(baumLochPfad) return baumLochPfad;
  const l = new Path2D(); l.moveTo(-38, 0); l.bezierCurveTo(-46, -40, -44, -70, -30, -90); l.bezierCurveTo(-20, -104, 4, -110, 16, -100);
  l.bezierCurveTo(30, -92, 44, -70, 42, -40); l.bezierCurveTo(41, -24, 44, -10, 40, 0); l.closePath();
  return baumLochPfad = l;
}

// Stamm mit Rinde, Moos, Efeu, Zweig, Pilzen; das Loch bleibt durchsichtig (dahinter malt baumLochZeichnen)
function baumKoerperMalen(q, nacht){
  const r = rnd(77), F = baumFarben(nacht);
  const umriss = new Path2D();
  umriss.moveTo(-124, 0);                                        // Wurzeln schmaler (Nutzerwunsch; vorher bis -162/+172)
  umriss.bezierCurveTo(-110, -2, -102, -8, -96, -16);           // linke Wurzel
  umriss.bezierCurveTo(-90, -30, -84, -46, -86, -70);
  umriss.bezierCurveTo(-80, -150, -94, -228, -76, -292);        // linke Seite
  // abgebrochene Krone: unregelmäßige Splitter
  umriss.lineTo(-70, -312); umriss.lineTo(-61, -296); umriss.lineTo(-50, -340); umriss.lineTo(-38, -305); umriss.lineTo(-29, -318);
  umriss.lineTo(-14, -300); umriss.lineTo(-4, -308); umriss.lineTo(10, -288); umriss.lineTo(24, -326); umriss.lineTo(31, -302);
  umriss.lineTo(46, -312); umriss.lineTo(58, -290); umriss.lineTo(72, -298);
  umriss.bezierCurveTo(90, -228, 74, -150, 86, -72);            // rechte Seite
  umriss.bezierCurveTo(88, -44, 94, -28, 104, -16);             // rechte Wurzel
  umriss.bezierCurveTo(112, -8, 120, -2, 132, 0);
  umriss.closePath();
  const gr = q.createLinearGradient(-100, 0, 100, 0); gr.addColorStop(0, F.rindeH); gr.addColorStop(.45, F.rinde); gr.addColorStop(1, F.rindeD);
  q.fillStyle = gr; q.fill(umriss);
  q.save(); q.clip(umriss);
  for(let i = 0; i < 16; i++){   // Rindenfurchen
    const x0 = -95 + i*12.5 + (r() - .5)*6, w = .8 + r()*1.6;
    q.beginPath(); q.moveTo(x0, 4);
    for(let y = 0; y > -340; y -= 20) q.lineTo(x0 + Math.sin(y*.03 + i)*3 + (y < -260 ? (x0 > 0 ? -1 : 1)*(-y - 260)*.12 : 0) + (y > -60 ? (x0 < 0 ? -1 : 1)*(60 + y)*.5 : 0), y);
    q.strokeStyle = 'rgba(0,0,0,.35)'; q.lineWidth = 2.4*w; q.stroke();
    q.save(); q.translate(1.6, 0); q.strokeStyle = 'rgba(255,230,190,.12)'; q.lineWidth = 1*w; q.stroke(); q.restore();
  }
  for(let i = 0; i < 40; i++){ const x = -80 + r()*160, y = -20 - r()*290, l = 4 + r()*8;   // feine Querrisse
    q.strokeStyle = 'rgba(0,0,0,.28)'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(x, y); q.quadraticCurveTo(x + l*.5, y + 1.5, x + l, y); q.stroke(); }
  for(const [x, y, s] of [[-40, -230, 9], [44, -150, 7], [-58, -110, 6]]){   // Astknoten
    q.fillStyle = F.rindeD; q.beginPath(); q.ellipse(x, y, s, s*1.4, 0, 0, 7); q.fill();
    q.strokeStyle = 'rgba(255,230,190,.18)'; q.lineWidth = 1.5; q.beginPath(); q.ellipse(x, y, s + 3, s*1.4 + 4, 0, 0, 7); q.stroke();
  }
  const sh = q.createLinearGradient(20, 0, 100, 0); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.35)');
  q.fillStyle = sh; q.fillRect(-160, -340, 330, 340);
  const bs = q.createLinearGradient(0, -40, 0, 0); bs.addColorStop(0, 'rgba(0,0,0,0)'); bs.addColorStop(1, 'rgba(0,0,0,.3)');
  q.fillStyle = bs; q.fillRect(-160, -40, 330, 40);
  q.fillStyle = F.moos;   // Moos links und an den Wurzeln
  for(let i = 0; i < 40; i++){ const y = -r()*280, x = -86 + Math.abs(y)*.02 + r()*22; q.globalAlpha = .55 + r()*.4; q.beginPath(); q.ellipse(x, y, 4 + r()*6, 3 + r()*4, r()*3, 0, 7); q.fill(); }
  for(let i = 0; i < 26; i++){ const x = -118 + r()*244, y = -r()*14; q.globalAlpha = .7; q.beginPath(); q.ellipse(x, y, 5 + r()*7, 3 + r()*3, 0, 0, 7); q.fill(); }
  q.fillStyle = F.moosH; for(let i = 0; i < 30; i++){ const y = -r()*260, x = -84 + Math.abs(y)*.02 + r()*16; q.globalAlpha = .6; q.beginPath(); q.arc(x, y, 1.5 + r()*2, 0, 7); q.fill(); }
  q.globalAlpha = 1;
  q.restore();
  // Loch ausstanzen, dann der dicke Rand aus heller Rinde
  const loch = baumLoch();
  q.save(); q.globalCompositeOperation = 'destination-out'; q.fill(loch); q.restore();
  q.save(); q.lineWidth = 9; q.strokeStyle = F.rindeD; q.stroke(loch); q.lineWidth = 3; q.strokeStyle = 'rgba(255,225,180,.28)'; q.translate(-1.5, -1.5); q.stroke(loch); q.restore();
  q.lineWidth = 3; q.strokeStyle = 'rgba(20,12,6,.75)'; q.stroke(umriss);   // Umrisslinie wie Boden/Wand
  q.strokeStyle = F.blatt; q.lineWidth = 3; q.lineCap = 'round';   // Efeu links am Stamm
  q.beginPath(); q.moveTo(-70, -300); q.bezierCurveTo(-96, -230, -60, -180, -84, -120); q.bezierCurveTo(-100, -80, -76, -50, -88, -20); q.stroke();
  for(let i = 0; i < 14; i++){ const t = i/13, y = -300 + t*280, x = -80 + Math.sin(t*9)*10;
    q.fillStyle = i % 2 ? F.blatt : F.blattH; q.save(); q.translate(x, y); q.rotate((i % 2 ? 1 : -1)*.8); q.beginPath(); q.moveTo(0, 0); q.bezierCurveTo(4, -6, 12, -6, 15, 0); q.bezierCurveTo(12, 6, 4, 6, 0, 0); q.fill(); q.restore(); }
  q.strokeStyle = F.rindeD; q.lineWidth = 5; q.beginPath(); q.moveTo(70, -250); q.quadraticCurveTo(110, -270, 130, -300); q.stroke();   // Zweig
  for(let i = 0; i < 6; i++){ q.fillStyle = i % 2 ? F.blatt : F.blattH; q.save(); q.translate(100 + i*6, -270 - i*6); q.rotate(-.6 + (i % 2)*1.2); q.beginPath(); q.ellipse(8, 0, 10, 4, 0, 0, 7); q.fill(); q.restore(); }
  for(const [x, s] of [[98, 1], [110, .7], [-100, .8]]){   // Pilze an der Wurzel
    q.fillStyle = '#efe4c8'; q.fillRect(x - 2*s, -10*s, 4*s, 10*s);
    q.fillStyle = F.pilz; q.beginPath(); q.ellipse(x, -10*s, 8*s, 5*s, 0, Math.PI, 0); q.fill();
    q.fillStyle = 'rgba(255,255,255,.85)'; q.beginPath(); q.arc(x - 3*s, -12*s, 1.4*s, 0, 7); q.arc(x + 3*s, -13*s, 1.1*s, 0, 7); q.fill();
  }
}
const baumBilder = {};
function baumBild(nacht){
  const k = nacht ? 'n' : 't';
  if(baumBilder[k]) return baumBilder[k];
  const S = BAUM_SKALA, A = BAUM_BILD_AUFLOESUNG, x0 = -170, x1 = 180, y0 = -345, y1 = 6, c = document.createElement('canvas');
  c.width = Math.ceil((x1 - x0)*S*A); c.height = Math.ceil((y1 - y0)*S*A);
  const o = c.getContext('2d'); o.setTransform(S*A, 0, 0, S*A, -x0*S*A, -y0*S*A);
  baumKoerperMalen(o, nacht);
  return baumBilder[k] = {c, x: x0*S, y: y0*S, w: (x1 - x0)*S, h: (y1 - y0)*S};
}

// Inneres des Lochs (dunkel + warmes Licht von innen, Stärke licht 0..1) – HINTER dem Stamm-Bild
function baumLochZeichnen(x, y, licht, F){
  ctx.save(); ctx.translate(x, y); ctx.scale(BAUM_SKALA, BAUM_SKALA);
  const loch = baumLoch();
  ctx.fillStyle = F.loch; ctx.fill(loch);
  ctx.clip(loch);
  const lg = ctx.createRadialGradient(0, -24, 4, 0, -30, 90);
  lg.addColorStop(0, 'rgba(' + F.licht + ',' + (.9*licht) + ')'); lg.addColorStop(.5, 'rgba(' + F.licht + ',' + (.35*licht) + ')'); lg.addColorStop(1, 'rgba(' + F.licht + ',0)');
  ctx.fillStyle = lg; ctx.fillRect(-50, -110, 100, 110);
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(0, -100, 60, 22, 0, 0, 7); ctx.fill();   // Tiefe oben im Loch
  ctx.restore();
}
// Boden/Wand, die höher als der Fuß des Baums in seinen Bereich ragen (z. B. eine Wand neben dem Start): dort wird der Baum
// weggeschnitten – er steht ganz vorne, darf aber nicht über Boden/Wand liegen (Nutzerwunsch). Einmal je Baum-Platz berechnet.
const BAUM_BREITE_HALB = 95, BAUM_HOEHE = 245;   // Spielpixel (Wurzeln ±132·0,7, Krone 340·0,7)
const baumSperrMerk = new Map();
function baumSperrFlaechen(x, y){
  const k = solids.length + ':' + x + ':' + y;
  if(!baumSperrMerk.has(k)){
    if(baumSperrMerk.size > 8) baumSperrMerk.clear();
    baumSperrMerk.set(k, solids.filter(s => s.type !== 'oneway' && s.type !== 'moveplat' && s.y < y - 2 &&
      s.x < x + BAUM_BREITE_HALB && s.x + s.w > x - BAUM_BREITE_HALB && s.y + s.h > y - BAUM_HOEHE));
  }
  return baumSperrMerk.get(k);
}
function baumZeichnen(x, y, licht){
  if(x < camX - 160 || x > camX + VW + 160) return;
  const nacht = typeof hgNacht === 'function' && hgNacht(), F = baumFarben(nacht), B = baumBild(nacht), sx = x - camX;
  const sperr = baumSperrFlaechen(x, y);
  ctx.save();
  for(const s of sperr){   // je Fläche einmal ausschneiden (mehrere Ausschnitte schneiden sich -> auch bei Überlappung richtig)
    const p = new Path2D(); p.rect(sx - BAUM_BREITE_HALB - 10, y - BAUM_HOEHE - 10, 2*BAUM_BREITE_HALB + 20, BAUM_HOEHE + 30);
    p.rect(s.x - camX, s.y, s.w, s.h); ctx.clip(p, 'evenodd');
  }
  baumZeichnenInnen(sx, y, licht, F, B);
  ctx.restore();
}
function baumZeichnenInnen(sx, y, licht, F, B){
  baumLochZeichnen(sx, y, licht, F);
  ctx.drawImage(B.c, sx + B.x, y + B.y, B.w, B.h);
  if(licht > 0.05){   // Licht fällt aus dem Loch auf den Boden
    ctx.save(); ctx.translate(sx, y); ctx.scale(BAUM_SKALA, BAUM_SKALA*0.3);
    const bl = ctx.createRadialGradient(0, 0, 4, 0, 0, 70); bl.addColorStop(0, 'rgba(' + F.licht + ',' + (.45*licht) + ')'); bl.addColorStop(1, 'rgba(' + F.licht + ',0)');
    ctx.fillStyle = bl; ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.fill(); ctx.restore();
  }
}
// Start-Baum: etwas links hinter den Startplätzen (BAUM_START_LINKS vor dem linken Platz), damit beide beim Start sichtbar
// herauslaufen; stünde er vor einer Wand (würde sie verdecken), rückt er zur Seite (höchstens BAUM_START_VERSATZ)
const BAUM_START_LINKS = 60, BAUM_START_VERSATZ = 160, BAUM_STAMM_HALB = 64, BAUM_STAMM_HOEHE = 150;
let baumStartMerk = null;
// Nur wo im Editor Start bzw. Ziel gesetzt ist, steht ein Baum (Nutzerwunsch). Beim Testen ab einer Stelle (testStart) zählen die
// echten Startplätze (startEchtM/F, vom Editor mitgegeben) – dort steht der Baum, ein Start-Ablauf gibt es dann nicht.
let baumStartDaten = null, baumZielGesetzt = false, baumTestStart = false;
function baumLevelMerken(data){
  const m = data.testStart ? data.startEchtM : data.startM, f = data.testStart ? data.startEchtF : data.startF;
  baumStartDaten = (m || f) && !data.baumAus ? {m: m || f, f: f || m} : null;   // baumAus: Bühne der Spielszenen (29)
  baumZielGesetzt = !!data.goal && !data.baumAus; baumTestStart = !!data.testStart; baumStartMerk = null;
}
function baumStartAktiv(){ return baumAktiv() && !!baumStartDaten; }
function baumZielAktiv(){ return baumAktiv() && baumZielGesetzt && !(typeof bossKampf !== 'undefined' && bossKampf); }
function baumStartPunkt(){
  const m = baumStartDaten.m, f = baumStartDaten.f;
  if(baumStartMerk && baumStartMerk.m === m && baumStartMerk.f === f) return baumStartMerk.p;
  const x0 = Math.min(m.x, f.x) - BAUM_START_LINKS, y = Math.max(m.y, f.y);
  const frei = x => x >= BAUM_STAMM_HALB && !solids.some(s => s.type !== 'oneway' && s.x < x + BAUM_STAMM_HALB && s.x + s.w > x - BAUM_STAMM_HALB &&
                                      s.y < y - 2 && s.y + s.h > y - BAUM_STAMM_HOEHE);
  let x = x0;
  for(let d = 0; d <= BAUM_START_VERSATZ; d += 4){
    if(frei(x0 + d)){ x = x0 + d; break; }
    if(frei(x0 - d)){ x = x0 - d; break; }
  }
  baumStartMerk = {m, f, p: {x, y}};
  return baumStartMerk.p;
}
// Fortschritt des Sieg-Ablaufs (0..1) aus den Spielschritten
function baumSiegAnteil(ab, dauer){ return won ? Math.max(0, Math.min(1, (winSteps - ab)/dauer)) : 0; }
function baumZielLicht(){ const k = baumSiegAnteil(BAUM_LICHT_AB, BAUM_LICHT_DAUER); return BAUM_LICHT_ZIEL + (1 - BAUM_LICHT_ZIEL)*k*k*(3 - 2*k); }
function baumTuerAnteil(){ const k = baumSiegAnteil(BAUM_TUER_AB, BAUM_TUER_DAUER); return k < 1 ? k*k : 1; }   // fällt schneller werdend zu

// Start- und Ziel-Baum: ganz vorne in der Welt (vor Boden, Wänden, Pflanzen; Nutzerwunsch), hinter Münzen und Figuren
function baumZeichnenAlle(){
  if(baumStartAktiv()){ const s = baumStartPunkt(); baumZeichnen(s.x, s.y, BAUM_LICHT_START); }
  if(baumZielAktiv()) baumZeichnen(goal.x, goal.y, baumZielLicht());
}
// VOR den Figuren: Tür und Lichtschein – am Ziel beim Sieg, am Start während des Start-Ablaufs
function baumVorneZeichnen(){
  if(baumIntro && baumStartAktiv()){ const s = baumStartPunkt(); baumTuerZeichnen(s.x, s.y, baumStartTuer(), 1); }
  if(won && baumZielAktiv()) baumTuerZeichnen(goal.x, goal.y, baumTuerAnteil(), baumZielLicht());
}
// Tür im Eingang: k = 1 zu, 0 offen (fährt nach oben weg); L = Stärke des Lichtscheins
function baumTuerZeichnen(x, y, k, L){
  const sx = x - camX;
  if(sx < -160 || sx > VW + 160) return;
  const F = baumFarben(typeof hgNacht === 'function' && hgNacht());
  ctx.save(); ctx.translate(sx, y); ctx.scale(BAUM_SKALA, BAUM_SKALA);
  // warmer Schein rund um den Eingang
  const hof = ctx.createRadialGradient(0, -50, 20, 0, -50, 130); hof.addColorStop(0, 'rgba(' + F.licht + ',' + (.32*L) + ')'); hof.addColorStop(1, 'rgba(' + F.licht + ',0)');
  ctx.fillStyle = hof; ctx.beginPath(); ctx.arc(0, -50, 130, 0, 7); ctx.fill();
  if(k > 0){
    ctx.save(); ctx.clip(baumLoch());
    ctx.translate(0, -(1 - k)*115);   // Tür fährt von oben herunter
    for(let i = 0; i < 4; i++){   // Bretter
      const bx = -48 + i*24;
      ctx.fillStyle = i % 2 ? F.tuer : F.tuerH; ctx.fillRect(bx, -115, 24, 117);
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(bx + 18, -115, 6, 117);
      ctx.strokeStyle = 'rgba(' + F.licht + ',' + (.8*k) + ')'; ctx.lineWidth = 1.5;   // Licht scheint durch die Ritzen
      ctx.beginPath(); ctx.moveTo(bx, -115); ctx.lineTo(bx, 2); ctx.stroke();
    }
    ctx.fillStyle = '#2b2b2b';   // Eisenbänder mit Nieten
    for(const by of [-82, -28]){ ctx.fillRect(-48, by, 96, 7); ctx.fillStyle = '#9a9a9a'; for(const nx of [-38, -14, 10, 34]){ ctx.beginPath(); ctx.arc(nx, by + 3.5, 1.8, 0, 7); ctx.fill(); } ctx.fillStyle = '#2b2b2b'; }
    const fg = ctx.createRadialGradient(0, -58, 1, 0, -58, 11); fg.addColorStop(0, 'rgba(255,240,190,1)'); fg.addColorStop(1, 'rgba(' + F.licht + ',.9)');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(0, -58, 9, 0, 7); ctx.fill();   // rundes Fenster, hell erleuchtet
    ctx.strokeStyle = '#2b2b2b'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-9, -58); ctx.lineTo(9, -58); ctx.moveTo(0, -67); ctx.lineTo(0, -49); ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#d8b04a'; ctx.beginPath(); ctx.arc(24, -42, 3.5, 0, 7); ctx.fill();   // Türknauf
    ctx.restore();
  }
  ctx.restore();
}
// Wer den Baum erreicht, ist angekommen: keine Steuerung mehr (P.zielWartet -> 08: frozen), geht bis vor den Eingang,
// schaut zum Partner und wartet. Gilt nur im Dschungel-Look; Tod/Neustart (weit weg vom Ziel) hebt es auf.
function baumVorSchritt(){
  baumIntroSchritt();
  for(const P of [p1, p2]){
    if(!baumZielAktiv() || deathState || Math.abs(P.x - goal.x) > 100){ P.zielWartet = false; continue; }
    if(won || (P.atGoal && P.grounded && !P.hookAttached && coinsCollected() >= coinsNeeded)) P.zielWartet = true;   // beim Sieg beide
    if(!P.zielWartet) continue;
    const Q = P === p1 ? p2 : p1, ziel = baumZielPlatz(P);
    const dx = ziel - P.x, tempo = baumGehtHinein() ? BAUM_HINEIN_TEMPO : BAUM_WARTE_TEMPO;
    if(Math.abs(dx) > 1.5 && (!won || baumGehtHinein())){ P.vx = Math.max(-tempo, Math.min(tempo, dx*0.3)); P.facing = Math.sign(dx); }
    else if(!won) P.facing = Math.sign(Q.x - P.x) || P.facing;   // wartet und schaut zum Partner
  }
}
// Platz der Figur: beim Warten 30 px vor dem Eingang (auf ihrer Seite), beim Hineingehen links/rechts der Mitte
function baumZielPlatz(P){
  const Q = P === p1 ? p2 : p1;
  if(baumGehtHinein() || (won && winSteps > BAUM_TANZ_SCHRITTE)){
    const links = P.x < Q.x || (P.x === Q.x && P === p1);
    return goal.x + (links ? -1 : 1)*BAUM_HINEIN_ABSTAND;
  }
  return goal.x + (P.x < goal.x ? -1 : 1)*BAUM_WARTE_ABSTAND;
}
function baumGehtHinein(){ return won && baumZielAktiv() && winSteps > BAUM_TANZ_SCHRITTE && winSteps <= BAUM_TANZ_SCHRITTE + BAUM_HINEIN_DAUER; }
// Siegestanz anzeigen (10/10c, Herzchen 21): im Dschungel nur VOR dem Hineingehen – im Baum stehen beide still (passen hinter die Tür)
function baumTanzt(){ return won && (!baumZielAktiv() || winSteps <= BAUM_TANZ_SCHRITTE); }
// Tür ganz zu: die Figuren sind im Baum und werden nicht mehr gezeichnet (12-welt-zeichnen.js) – am Ziel nach dem Sieg,
// am Start, solange die Tür noch geschlossen ist
function baumFigurenVersteckt(){ return (won && baumZielAktiv() && baumTuerAnteil() >= 1) || (!!baumIntro && baumStartTuer() >= 1); }
// Solange eine Tür im Eingang ist (geht am Start auf / am Ziel zu), stehen die Figuren IM Baum: nur im Eingang sichtbar
function baumFigurenClip(){
  if(baumIntro && baumStartTuer() > 0) return baumStartPunkt();
  if(won && baumZielAktiv() && baumTuerAnteil() > 0) return goal;
  return null;
}
function baumClipAnwenden(B){
  const sx = B.x - camX;
  ctx.translate(sx, B.y); ctx.scale(BAUM_SKALA, BAUM_SKALA); ctx.clip(baumLoch());
  ctx.scale(1/BAUM_SKALA, 1/BAUM_SKALA); ctx.translate(-sx, -B.y);
}
function winEndeSchritte(){ return baumZielAktiv() ? BAUM_SIEG_ENDE : WIN_DANCE_STEPS; }

// ---------- Start-Ablauf (Nutzerwunsch): Tür zu -> Tür geht auf -> beide kommen heraus -> los ----------
// Läuft bei jedem Level-Start (startLevel, Datei laden) und Neustart (R, Pausenmenü) – nicht nach einem Tod, nicht beim
// Testen ab einer Stelle und nicht bei resetLevel() allein (Tests, Spielszenen).
// Während des Ablaufs keine Steuerung (P.baumIntro -> 08: frozen); fester Takt (Schritte).
const BAUM_INTRO_ZU = 30, BAUM_INTRO_AUF = 45, BAUM_INTRO_RAUS_MAX = 150, BAUM_INTRO_TEMPO = 1.7;
const BAUM_RAUS_ABSTAND = 50, BAUM_RAUS_LUECKE = 40;   // px rechts vom Eingang / Abstand zwischen beiden
let baumIntro = null;   // {n: Schritte seit Start}
function baumIntroStarten(){
  baumIntroEnde();
  if(!baumStartAktiv() || baumTestStart || !p1 || !p2 || window.baumIntroAus) return;   // baumIntroAus: Testlevel-Adresse / automatische Tests
  const s = baumStartPunkt();
  // Ziel nach dem Herauskommen: der eigene Startplatz, aber mindestens BAUM_RAUS_ABSTAND rechts vom Eingang (steht der Baum
  // wegen einer Wand auf den Startplätzen, laufen beide ein Stück weiter heraus)
  const reihe = [p1, p2].sort((a, b) => a.x - b.x);
  baumIntro = {n: 0, vor: new Map([p1, p2].map(P => [P, {x: P.x, y: P.y}])),   // Platz nach resetLevel (ohne Ablauf)
               ziel: new Map(reihe.map((P, i) => [P, Math.max(P.x, s.x + BAUM_RAUS_ABSTAND + i*BAUM_RAUS_LUECKE)]))};
  for(const P of [p1, p2]){   // beide stehen im Baum (hinter der geschlossenen Tür)
    P.baumIntro = true; P.x = P._px = s.x + (P === p1 ? -1 : 1)*BAUM_HINEIN_ABSTAND; P.y = P._py = s.y; P.vx = P.vy = 0;
    P.facing = Math.sign(P.spawn.x - P.x) || 1;
  }
}
function baumIntroEnde(){
  baumIntro = null;
  for(const P of [p1, p2]) if(P) P.baumIntro = false;
}
// sofort fertig: beide stehen wieder genau dort, wo resetLevel sie hingestellt hat (z. B. für Tests)
function baumIntroAbbrechen(){
  if(!baumIntro) return;
  for(const P of [p1, p2]){ const v = baumIntro.vor.get(P); P.x = P._px = v.x; P.y = P._py = v.y; P.vx = P.vy = 0; }
  baumIntroEnde();
}
function baumStartTuer(){
  if(!baumIntro) return 0;
  const n = baumIntro.n;
  if(n <= BAUM_INTRO_ZU) return 1;
  const k = Math.min(1, (n - BAUM_INTRO_ZU)/BAUM_INTRO_AUF);
  return 1 - k*k*(3 - 2*k);   // fährt weich nach oben auf
}
function baumIntroSchritt(){
  if(!baumIntro) return;
  if(deathState || won){ baumIntroEnde(); return; }
  const n = ++baumIntro.n;
  if(n <= BAUM_INTRO_ZU + BAUM_INTRO_AUF) return;
  let fertig = true;
  for(const P of [p1, p2]){   // herauskommen und zu den Startplätzen gehen
    const dx = baumIntro.ziel.get(P) - P.x;
    if(Math.abs(dx) > 2){ fertig = false; P.vx = Math.max(-BAUM_INTRO_TEMPO, Math.min(BAUM_INTRO_TEMPO, dx*0.3)); P.facing = Math.sign(dx); }
  }
  if(fertig || n > BAUM_INTRO_ZU + BAUM_INTRO_AUF + BAUM_INTRO_RAUS_MAX) baumIntroEnde();
}
