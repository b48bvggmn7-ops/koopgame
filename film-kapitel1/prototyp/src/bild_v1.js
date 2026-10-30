// ===== Bilder: Häuschen von außen, Sternenzimmer innen, Blätter-Vorhang, Kapitelkarte (alles gemalt, keine Dateien) =====
const W = 1280, H = 720, ZOOM_S = 13;
function rng(seed){ let s = seed >>> 0; return () => (s = (s*1664525 + 1013904223) >>> 0)/4294967296; }
const lerp = (a, b, k) => a + (b - a)*k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const glatt = k => { k = clamp(k, 0, 1); return k*k*(3 - 2*k); };
function glow(c, x, y, r, rgb, a){ const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
const SCHRIFT_TITEL = '"Grandstander", "Comic Sans MS", "Chalkboard SE", cursive';
const SCHRIFT_TEXT = '"Fredoka", "Trebuchet MS", "Segoe UI", sans-serif';

// ---------- Himmel ----------
const STERNE = (() => { const r = rng(11), a = []; for(let i = 0; i < 190; i++) a.push({x: r()*W*1.1 - W*.05, y: r()*r()*H*.75, g: .5 + r()*1.4, ph: r()*7, sp: .6 + r()*2.2, hell: r() < .08}); return a; })();
function sterneZeichnen(c, t, dichte, xs, ys, xo, yo){
  for(const s of STERNE){
    const a = (.45 + .55*Math.sin(t*s.sp + s.ph))*dichte;
    if(a <= .02) continue;
    const x = xo + s.x*xs, y = yo + s.y*ys;
    c.globalAlpha = a; c.fillStyle = '#fff8e6'; c.beginPath(); c.arc(x, y, s.g, 0, 7); c.fill();
    if(s.hell){ c.globalAlpha = a*.5; c.fillRect(x - s.g*3, y - .5, s.g*6, 1); c.fillRect(x - .5, y - s.g*3, 1, s.g*6); }
  }
  c.globalAlpha = 1;
}
function mond(c, x, y, r){
  glow(c, x, y, r*4.5, '255,236,200', .16);
  c.fillStyle = '#fff3d6'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.fillStyle = 'rgba(214,190,150,.35)'; for(const [dx, dy, rr] of [[-.3, -.2, .18], [.25, .3, .12], [.1, -.4, .09]]){ c.beginPath(); c.arc(x + dx*r, y + dy*r, rr*r, 0, 7); c.fill(); }
}

// ---------- Blatt (für Vorhang, Krone, Vordergrund) ----------
function blatt(c, x, y, l, b, rot, farbe, ader){
  c.save(); c.translate(x, y); c.rotate(rot);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(l*.45, -b, l, 0); c.quadraticCurveTo(l*.45, b, 0, 0); c.fillStyle = farbe; c.fill();
  if(ader){ c.strokeStyle = ader; c.lineWidth = Math.max(1, l*.018); c.beginPath(); c.moveTo(l*.04, 0); c.quadraticCurveTo(l*.5, -b*.08, l*.95, 0); c.stroke();
    c.lineWidth = Math.max(.6, l*.01); for(let i = 1; i < 6; i++){ const px = l*i/6.5; c.beginPath(); c.moveTo(px, 0); c.quadraticCurveTo(px + l*.06, -b*.35, px + l*.12, -b*.55); c.moveTo(px, 0); c.quadraticCurveTo(px + l*.06, b*.35, px + l*.12, b*.55); c.stroke(); } }
  c.restore();
}

// ---------- Häuschen von außen ----------
const RINDE = (() => { const r = rng(5), a = []; for(let i = 0; i < 46; i++) a.push({x: r(), y0: .05 + r()*.4, y1: .45 + r()*.55, w: .6 + r()*1.6, d: (r() - .5)*.06}); return a; })();
const GLUEH = (() => { const r = rng(21), a = []; for(let i = 0; i < 30; i++) a.push({x: 250 + r()*800, y: 260 + r()*360, ph: r()*7, sp: .2 + r()*.5, ax: 20 + r()*50, ay: 10 + r()*30, bl: r()*7}); return a; })();
const KRONE = (() => { const r = rng(9), a = []; for(let i = 0; i < 26; i++){ const w = r()*Math.PI; a.push({x: 640 + Math.cos(w)*(150 + r()*140) * (r() < .5 ? -1 : 1), y: 215 - Math.sin(w)*60 + r()*90, r: 48 + r()*46, s: r()}); } return a; })();
const BUESCHE = (() => { const r = rng(17), a = [];
  for(const [x, y, n, s] of [[40, 690, 7, 1.2], [230, 715, 6, 1], [380, 735, 4, .8], [930, 730, 5, .9], [1090, 700, 7, 1.15], [1260, 680, 6, 1.2]]){
    const k = [], l = [];
    for(let i = 0; i < n; i++) k.push([(r() - .5)*170*s, -r()*70*s, (34 + r()*32)*s]);
    for(let i = 0; i < 5; i++) l.push([(r() - .5)*190*s, -40*s - r()*60*s, (60 + r()*50)*s, -Math.PI/2 + (r() - .5)*2.2]);
    a.push({x, y, k, l});
  }
  return a; })();
const HUEGEL_FERN = (() => { const r = rng(3), a = []; let x = -60; while(x < W + 80){ a.push([x, 470 - r()*45 - (r() < .25 ? 30 : 0)]); x += 22 + r()*30; } return a; })();
const HUEGEL_MITTE = (() => { const r = rng(4), a = []; let x = -80; while(x < W + 100){ a.push({x, h: 90 + r()*120, r: 38 + r()*44, palme: r() < .3}); x += 50 + r()*70; } return a; })();

function riesenbaum(c, x, y, s, farbe){
  c.fillStyle = farbe;
  c.beginPath(); c.moveTo(x - 7*s, y); c.quadraticCurveTo(x - 3*s, y - 120*s, x - 2*s, y - 210*s); c.lineTo(x + 2*s, y - 210*s); c.quadraticCurveTo(x + 3*s, y - 120*s, x + 7*s, y); c.fill();
  for(const [dx, dy, r] of [[0, -230, 30], [-26, -214, 22], [26, -212, 22], [-12, -250, 20], [14, -248, 18], [0, -270, 14]]){ c.beginPath(); c.arc(x + dx*s, y + dy*s, r*s, 0, 7); c.fill(); }
}

function aussenZeichnen(c, t, cam){
  if(typeof AUSSEN !== 'undefined' && AUSSEN.bereit) return aussenGerendert(c, t, cam);
  const lage = p => { const sp = 1 + (cam.s - 1)*p, cx = W/2 + (cam.x - W/2)*p, cy = H/2 + (cam.y - H/2)*p; c.setTransform(cam.basis.a*sp, 0, 0, cam.basis.d*sp, cam.basis.e + cam.basis.a*(W/2 - cx*sp), cam.basis.f + cam.basis.d*(H/2 - cy*sp)); };
  // Himmel (Dämmerung: oben Nachtblau, unten warmes Abendrot)
  lage(.04);
  let g = c.createLinearGradient(0, -80, 0, H);
  g.addColorStop(0, '#141133'); g.addColorStop(.38, '#2e2563'); g.addColorStop(.62, '#6b4a86'); g.addColorStop(.78, '#d9806b'); g.addColorStop(.9, '#f2b37a'); g.addColorStop(1, '#f6c98e');
  c.fillStyle = g; c.fillRect(-200, -200, W + 400, H + 400);
  sterneZeichnen(c, t, 1, 1, 1, 0, 0);
  lage(.07); mond(c, 1060, 112, 30);
  // Schleierwolken
  c.fillStyle = 'rgba(180,150,210,.13)';
  for(const [x, y, w] of [[260, 170, 260], [820, 230, 330], [520, 300, 220]]){ const xx = ((x + t*4) % (W + 400)) - 200; c.beginPath(); c.ellipse(xx, y, w, 16, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(xx + w*.3, y - 9, w*.5, 12, 0, 0, 7); c.fill(); }
  // ferne Hügel mit dem Riesenbaum am Horizont (dorthin fällt später der Stern)
  lage(.22);
  c.fillStyle = '#4a3a6e'; c.beginPath(); c.moveTo(-100, H); for(const [x, y] of HUEGEL_FERN) c.lineTo(x, y); c.lineTo(W + 100, H); c.fill();
  riesenbaum(c, 1150, 470, 1, '#43356a');
  glow(c, 640, 470, 520, '255,170,120', .12);
  // mittlerer Dschungel
  lage(.5);
  c.fillStyle = '#262a4e';
  for(const b of HUEGEL_MITTE){
    const by = 560;
    if(b.palme){ c.fillRect(b.x - 3, by - b.h, 6, b.h); for(let i = 0; i < 6; i++) blatt(c, b.x, by - b.h, 60, 9, -Math.PI/2 + (i - 2.5)*.55 + Math.sin(t*.8 + b.x)*.04, '#262a4e', null); }
    else { c.beginPath(); c.arc(b.x, by - b.h*.6, b.r, 0, 7); c.arc(b.x + b.r*.7, by - b.h*.5, b.r*.8, 0, 7); c.arc(b.x - b.r*.6, by - b.h*.45, b.r*.75, 0, 7); c.fill(); c.fillRect(b.x - 4, by - b.h*.5, 8, b.h*.5); }
  }
  c.fillRect(-200, 545, W + 400, 300);
  // Hügel, auf dem das Häuschen steht
  lage(1);
  g = c.createLinearGradient(0, 560, 0, H);
  g.addColorStop(0, '#2d4a3a'); g.addColorStop(1, '#152a22');
  c.fillStyle = g; c.beginPath(); c.moveTo(-300, H + 50); c.quadraticCurveTo(200, 560, 640, 585); c.quadraticCurveTo(1080, 560, 1600, H + 50); c.fill();
  hausZeichnen(c, t, cam);
  // Glühwürmchen
  for(const f of GLUEH){
    const x = f.x + Math.sin(t*f.sp + f.ph)*f.ax, y = f.y + Math.sin(t*f.sp*1.3 + f.ph*2)*f.ay, a = .35 + .65*Math.max(0, Math.sin(t*1.6 + f.bl));
    glow(c, x, y, 14, '214,255,120', .35*a); c.fillStyle = `rgba(240,255,180,${a})`; c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill();
  }
  // Vordergrund: Büsche vor dem Haus (wie die Baumbüschel im Hintergrund, nur nah und dunkel)
  lage(1.15);
  for(const b of BUESCHE){
    const sw = Math.sin(t*.8 + b.x*.01)*2.5;
    c.fillStyle = '#0d2219'; c.beginPath(); for(const [dx, dy, r] of b.k) { c.moveTo(b.x + dx + sw + r, b.y + dy); c.arc(b.x + dx + sw, b.y + dy, r, 0, 7); } c.fill();
    c.fillStyle = 'rgba(120,170,150,.13)'; c.beginPath(); for(const [dx, dy, r] of b.k) { c.moveTo(b.x + dx + sw - r*.2 + r*.6, b.y + dy - r*.35); c.arc(b.x + dx + sw - r*.2, b.y + dy - r*.35, r*.6, 0, 7); } c.fill();
    for(const l of b.l) blatt(c, b.x + l[0] + sw, b.y + l[1], l[2], l[2]*.26, l[3] + Math.sin(t*1.1 + l[0])*.04, '#12291f', 'rgba(90,140,110,.3)');
  }
  // Vordergrund: große dunkle Blätter in den Ecken
  lage(1.35);
  for(const [x, y, l, w0, s] of [[-30, 760, 330, -1.05, 1], [40, 770, 260, -.7, 1], [1320, 760, 330, -2.1, -1], [1240, 775, 250, -2.45, -1]]){
    blatt(c, x, y, l, l*.22, w0 + Math.sin(t*.9 + x)*.03, '#0f1d18', 'rgba(70,110,80,.35)');
  }
  c.setTransform(cam.basis.a, 0, 0, cam.basis.d, cam.basis.e, cam.basis.f);
}

// Gerendertes Häuschen: Himmel bleibt gemalt (Sterne funkeln), die Landschaft kommt aus Blender in Ebenen mit Tiefenwirkung
function aussenGerendert(c, t, cam){
  const lage = p => { const sp = 1 + (cam.s - 1)*p, cx = W/2 + (cam.x - W/2)*p, cy = H/2 + (cam.y - H/2)*p; c.setTransform(cam.basis.a*sp, 0, 0, cam.basis.d*sp, cam.basis.e + cam.basis.a*(W/2 - cx*sp), cam.basis.f + cam.basis.d*(H/2 - cy*sp)); };
  const A = AUSSEN, P = A.pkt;
  lage(.04);
  let g = c.createLinearGradient(0, -80, 0, H);
  g.addColorStop(0, '#141133'); g.addColorStop(.38, '#2e2563'); g.addColorStop(.62, '#6b4a86'); g.addColorStop(.78, '#d9806b'); g.addColorStop(.9, '#f2b37a'); g.addColorStop(1, '#f6c98e');
  c.fillStyle = g; c.fillRect(-200, -200, W + 400, H + 400);
  sterneZeichnen(c, t, 1, 1, 1, 0, 0);
  lage(.07); mond(c, 1060, 112, 30);
  c.fillStyle = 'rgba(180,150,210,.13)';
  for(const [x, y, w] of [[260, 170, 260], [820, 230, 330], [520, 300, 220]]){ const xx = ((x + t*4) % (W + 400)) - 200; c.beginPath(); c.ellipse(xx, y, w, 16, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(xx + w*.3, y - 9, w*.5, 12, 0, 0, 7); c.fill(); }
  lage(.22); glow(c, 640, 470, 520, '255,170,120', .12); c.drawImage(A.fern, 0, 0, W, H);
  lage(.5); c.drawImage(A.mitte, 0, 0, W, H);
  lage(1);
  // das Zimmer hinter dem großen Fenster (beim Hineinzoomen wird es zum ganzen Bild)
  // Das Zimmerbild füllt das runde Fenster ganz (etwas größer, als läge es weiter hinten); beim Hineinzoomen wird es
  // genau so groß, dass es am Ende nahtlos das ganze Bild ist.
  const [fx, fy, fr] = P.fenster[0], s = ZOOM_S, voll = clamp((cam.s - 1)/(s - 1), 0, 1), fk = lerp(2*fr/(H/s)*1.12, 1, glatt(voll));
  const innen = rr => { c.save(); c.beginPath(); c.arc(fx, fy, rr, 0, 7); c.clip();
    c.fillStyle = '#3a2416'; c.fillRect(fx - rr, fy - rr, rr*2, rr*2);
    if(cam.innen) c.drawImage(cam.innen, fx - W/(2*s)*fk, fy - H/(2*s)*fk, W/s*fk, H/s*fk); else { c.fillStyle = '#f6b25e'; c.fillRect(fx - rr, fy - rr, rr*2, rr*2); }
    const gl = Math.max(0, 1 - (cam.s - 1)/5); c.fillStyle = `rgba(255,190,110,${(.1*gl).toFixed(3)})`; c.fillRect(fx - rr, fy - rr, rr*2, rr*2); c.restore(); };
  innen(fr + 2);
  c.drawImage(A.haus, 0, 0, W, H);
  if(cam.s > 1.8){ const r = A.r_mittel; c.drawImage(A.mittel, r[0], r[1], r[2] - r[0], r[3] - r[1]); }
  if(cam.s > 4.5){ const r = A.r_nah; c.drawImage(A.nah, r[0], r[1], r[2] - r[0], r[3] - r[1]); }
  // was lebt: Fenster und Laterne flackern, Lichterkette glimmt, Rauch, Glühwürmchen
  const fl = .92 + .08*Math.sin(t*7) + .04*Math.sin(t*17);
  c.save(); c.globalCompositeOperation = 'lighter';
  for(const [x, y, r] of P.fenster) glow(c, x, y, r*2.6, '255,170,80', .16*fl);
  glow(c, P.laterne[0], P.laterne[1], 70, '255,180,90', .22*(.85 + .15*Math.sin(t*9) + .05*Math.sin(t*23)));
  P.lichterkette.forEach(([x, y, col], i) => { const a = .5 + .5*Math.sin(t*2 + i*1.7); glow(c, x, y, 14, col.map(v => Math.round(v*255)).join(','), .3*a); });
  c.restore();
  for(let i = 0; i < 7; i++){ const k = ((t*.18 + i/7) % 1), x = P.rauch[0] + k*60 + Math.sin(k*6 + i)*8, y = P.rauch[1] - 8 - k*150, r = 7 + k*22;
    c.fillStyle = `rgba(200,195,225,${(.26*(1 - k)).toFixed(3)})`; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
  for(const f of GLUEH){
    const x = f.x + Math.sin(t*f.sp + f.ph)*f.ax, y = f.y + Math.sin(t*f.sp*1.3 + f.ph*2)*f.ay, a = .35 + .65*Math.max(0, Math.sin(t*1.6 + f.bl));
    glow(c, x, y, 14, '214,255,120', .35*a); c.fillStyle = `rgba(240,255,180,${a})`; c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill(); }
  if(cam.iris) innen(cam.iris);
  lage(1.15); c.drawImage(A.busch, 0, 0, W, H);
  lage(1.35); c.drawImage(A.blatt, 0, 0, W, H);
  c.setTransform(cam.basis.a, 0, 0, cam.basis.d, cam.basis.e, cam.basis.f);
}
// kleine Eule auf dem Ast: blinzelt, dreht ab und zu den Kopf
function eule(c, x, y, t){
  const dreh = Math.sin(t*.6) > .7 ? .35 : Math.sin(t*.6) < -.8 ? -.3 : 0, zu = (t % 3.7) < .14;
  c.save(); c.translate(x, y);
  c.fillStyle = '#6b5440'; c.beginPath(); c.ellipse(0, -11, 10, 13, 0, 0, 7); c.fill();                 // Körper
  c.fillStyle = '#9a8266'; c.beginPath(); c.ellipse(0, -7, 6, 8, 0, 0, 7); c.fill();                    // Bauch
  c.fillStyle = '#e0a83a'; c.fillRect(-6, 0, 3, 3); c.fillRect(3, 0, 3, 3);                              // Krallen
  c.translate(dreh*6, -26);
  c.fillStyle = '#7a6048'; c.beginPath(); c.ellipse(0, 0, 11, 9, 0, 0, 7); c.fill();                     // Kopf
  c.beginPath(); c.moveTo(-10, -5); c.lineTo(-8, -13); c.lineTo(-4, -7); c.moveTo(10, -5); c.lineTo(8, -13); c.lineTo(4, -7); c.fill();   // Federohren
  for(const s of [-1, 1]){ c.fillStyle = '#efe4c8'; c.beginPath(); c.arc(s*4.6 + dreh*2, 0, 4, 0, 7); c.fill();
    if(zu){ c.strokeStyle = '#3a2a1e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(s*4.6 + dreh*2 - 3, 0); c.lineTo(s*4.6 + dreh*2 + 3, 0); c.stroke(); }
    else { c.fillStyle = '#1a1210'; c.beginPath(); c.arc(s*4.6 + dreh*3, .3, 2, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(s*4.6 + dreh*3 + .7, -.5, .6, 0, 7); c.fill(); } }
  c.fillStyle = '#e0a83a'; c.beginPath(); c.moveTo(dreh*3 - 1.5, 3); c.lineTo(dreh*3 + 1.5, 3); c.lineTo(dreh*3, 6.5); c.fill();
  c.restore();
}
function hausZeichnen(c, t, cam){
  // Krone hinter dem Stamm
  for(const k of KRONE){ c.fillStyle = k.s < .5 ? '#1c3a2c' : '#224634'; c.beginPath(); c.arc(k.x, k.y, k.r, 0, 7); c.fill(); }
  for(const k of KRONE){ c.fillStyle = 'rgba(110,170,120,.07)'; c.beginPath(); c.arc(k.x - k.r*.25, k.y - k.r*.3, k.r*.7, 0, 7); c.fill(); }
  // Ast mit Schaukel (links) und Lichterkette
  c.strokeStyle = '#3a2a1e'; c.lineWidth = 16; c.lineCap = 'round';
  c.beginPath(); c.moveTo(560, 330); c.quadraticCurveTo(480, 300, 395, 318); c.stroke();
  const sch = Math.sin(t*1.1)*.06;
  c.save(); c.translate(430, 316); c.rotate(sch);
  c.strokeStyle = '#c9b58e'; c.lineWidth = 2; c.beginPath(); c.moveTo(-22, 0); c.lineTo(-22, 150); c.moveTo(22, 0); c.lineTo(22, 150); c.stroke();
  c.fillStyle = '#7a5235'; c.fillRect(-32, 148, 64, 9); c.restore();
  eule(c, 474, 304, t);
  // Stamm (der hohle Baum ist das Häuschen)
  c.save();
  const sx = 640;
  c.beginPath(); c.moveTo(sx - 150, 600); c.quadraticCurveTo(sx - 120, 560, sx - 118, 470); c.quadraticCurveTo(sx - 112, 330, sx - 98, 250);
  c.lineTo(sx + 102, 250); c.quadraticCurveTo(sx + 115, 330, sx + 120, 470); c.quadraticCurveTo(sx + 124, 560, sx + 160, 600);
  c.quadraticCurveTo(sx + 60, 610, sx, 598); c.quadraticCurveTo(sx - 70, 610, sx - 150, 600); c.closePath();
  let g = c.createLinearGradient(sx - 150, 0, sx + 160, 0);
  g.addColorStop(0, '#6d5a62'); g.addColorStop(.18, '#6a4a34'); g.addColorStop(.6, '#56392a'); g.addColorStop(1, '#3a261c');
  c.fillStyle = g; c.fill(); c.clip();
  for(const r of RINDE){ c.strokeStyle = 'rgba(30,18,12,.45)'; c.lineWidth = r.w; c.beginPath(); const x = sx - 130 + r.x*260; c.moveTo(x, 250 + r.y0*350); c.quadraticCurveTo(x + r.d*300, 250 + (r.y0 + r.y1)*175, x + r.d*120, 250 + r.y1*350); c.stroke(); }
  glow(c, 705, 372, 150, '255,170,90', .22); glow(c, 600, 520, 120, '255,160,80', .2);
  c.restore();
  // Wurzeln
  c.fillStyle = '#4a3225';
  for(const [x, d] of [[-150, -1], [-60, -1], [70, 1], [160, 1]]){ c.beginPath(); c.moveTo(sx + x, 596); c.quadraticCurveTo(sx + x + d*40, 600, sx + x + d*70, 612); c.quadraticCurveTo(sx + x + d*20, 612, sx + x - d*10, 600); c.fill(); }
  // Sternwarte oben: Holzplattform, Kuppel, Fernrohr
  c.fillStyle = '#5a3e2a'; c.fillRect(sx - 120, 238, 240, 16);
  c.strokeStyle = '#4a3222'; c.lineWidth = 3; for(let i = -110; i <= 110; i += 22){ c.beginPath(); c.moveTo(sx + i, 238); c.lineTo(sx + i, 214); c.stroke(); }
  c.beginPath(); c.moveTo(sx - 116, 214); c.lineTo(sx + 116, 214); c.stroke();
  g = c.createLinearGradient(0, 160, 0, 238); g.addColorStop(0, '#4f8a86'); g.addColorStop(1, '#2d5a5a');
  c.fillStyle = g; c.beginPath(); c.arc(sx, 238, 70, Math.PI, 0); c.fill();
  c.strokeStyle = 'rgba(160,220,210,.35)'; c.lineWidth = 2; for(const a of [.35, .65]){ c.beginPath(); c.arc(sx, 238, 70, Math.PI + a*Math.PI - .02, Math.PI + a*Math.PI + .02); c.stroke(); }
  c.save(); c.translate(sx + 18, 196); c.rotate(-.75);
  g = c.createLinearGradient(0, -10, 0, 10); g.addColorStop(0, '#f2d58a'); g.addColorStop(1, '#a8782e');
  c.fillStyle = g; c.fillRect(0, -9, 92, 18); c.fillStyle = '#6b4a1e'; c.fillRect(82, -11, 12, 22); c.fillRect(30, -10, 6, 20); c.restore();
  // kleine Fahne mit Stern auf der Kuppel
  c.strokeStyle = '#2a1a10'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx - 30, 178); c.lineTo(sx - 30, 140); c.stroke();
  c.fillStyle = '#d23a3a'; c.beginPath(); c.moveTo(sx - 30, 140); c.lineTo(sx - 4, 147 + Math.sin(t*3)*2); c.lineTo(sx - 30, 154); c.fill();
  // Ofenrohr mit Rauch
  c.fillStyle = '#3b3f46'; c.save(); c.translate(760, 340); c.rotate(.08); c.fillRect(-8, -95, 16, 95); c.fillRect(-13, -103, 26, 10); c.restore();
  for(let i = 0; i < 7; i++){ const k = ((t*.18 + i/7) % 1), x = 772 + k*60 + Math.sin(k*6 + i)*8, y = 232 - k*150, r = 7 + k*22;
    c.fillStyle = `rgba(220,210,230,${(.32*(1 - k)).toFixed(3)})`; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
  // Fenster (warmes Licht)
  grossesFenster(c, 705, 372, 38, t, cam);
  fensterRund(c, 555, 405, 17, t, false);
  fensterRund(c, 735, 505, 19, t, false);
  // Tür: rund, rot mit schwarzen Punkten – wie ein Marienkäfer
  c.save(); c.beginPath(); c.moveTo(568, 598); c.lineTo(568, 535); c.arc(605, 535, 37, Math.PI, 0); c.lineTo(642, 598); c.closePath();
  c.fillStyle = '#b8262d'; c.fill(); c.clip();
  c.fillStyle = '#1b1416'; for(const [x, y, r] of [[588, 520, 8], [622, 528, 9], [598, 556, 7], [628, 572, 8], [584, 585, 6]]){ c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
  c.fillStyle = '#1b1416'; c.fillRect(603, 498, 4, 100);
  c.restore();
  c.strokeStyle = '#3a261c'; c.lineWidth = 5; c.beginPath(); c.moveTo(568, 598); c.lineTo(568, 535); c.arc(605, 535, 37, Math.PI, 0); c.lineTo(642, 598); c.stroke();
  c.fillStyle = '#f2c66a'; c.beginPath(); c.arc(632, 562, 3.5, 0, 7); c.fill();
  // Laterne neben der Tür
  const fl = .85 + .15*Math.sin(t*9) + .05*Math.sin(t*23);
  c.strokeStyle = '#2a1a10'; c.lineWidth = 2; c.beginPath(); c.moveTo(662, 470); c.lineTo(662, 488); c.stroke();
  glow(c, 662, 500, 60*fl, '255,190,100', .45);
  c.fillStyle = '#2a1a10'; c.fillRect(653, 486, 18, 4); c.fillRect(653, 512, 18, 4);
  c.fillStyle = `rgba(255,214,130,${fl})`; c.fillRect(655, 490, 14, 22);
  // Fußmatte und Steinweg
  c.fillStyle = '#8a5a3a'; c.fillRect(574, 598, 62, 7);
  c.fillStyle = '#6f6a72'; for(const [x, y, rx] of [[590, 618, 16], [560, 636, 18], [522, 656, 20], [478, 680, 22], [430, 706, 24]]){ c.beginPath(); c.ellipse(x, y, rx, rx*.38, 0, 0, 7); c.fill(); }
  // Briefkasten mit Namensschild
  c.fillStyle = '#3a2a1e'; c.fillRect(468, 560, 6, 50);
  c.fillStyle = '#b8262d'; c.beginPath(); c.roundRect(450, 540, 42, 26, [12, 12, 3, 3]); c.fill();
  c.fillStyle = '#1b1416'; for(const [x, y] of [[460, 550], [478, 556], [470, 546]]){ c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); }
  c.fillStyle = '#e8c35a'; c.fillRect(492, 538, 3, 18); c.fillRect(492, 538, 10, 6);
  c.fillStyle = '#e9dcc0'; c.fillRect(440, 578, 64, 15); c.fillStyle = '#3a2a1e'; c.font = `600 9px ${SCHRIFT_TEXT}`; c.textAlign = 'center'; c.fillText('Familie Punkt', 472, 589);
  // Wäscheleine mit drei Socken (Affe, Schweinchen, Professor)
  c.strokeStyle = '#d8ccb0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(758, 455); c.quadraticCurveTo(840, 478, 925, 458); c.stroke();
  c.fillStyle = '#3a2a1e'; c.fillRect(922, 456, 6, 150);
  [[790, '#a8743e'], [834, '#f19ab3'], [878, '#c2262e']].forEach(([x, col], i) => {
    const y = 455 + Math.sin((x - 758)/167*Math.PI)*20, w = Math.sin(t*1.4 + i)*.12;
    c.save(); c.translate(x, y); c.rotate(w); c.fillStyle = col; c.beginPath(); c.roundRect(-6, 0, 12, 22, 3); c.fill(); c.beginPath(); c.roundRect(-6, 14, 18, 9, 4); c.fill();
    if(i === 2){ c.fillStyle = '#1b1416'; c.beginPath(); c.arc(0, 8, 2.2, 0, 7); c.arc(4, 17, 2, 0, 7); c.fill(); }
    c.fillStyle = '#e8dcc6'; c.fillRect(-3, -3, 3, 6); c.restore();
  });
  // Lichterkette am Ast
  for(let i = 0; i <= 8; i++){ const k = i/8, x = 395 + k*165, y = 318 + Math.sin(k*Math.PI)*22 + (1 - k)*0, a = .55 + .45*Math.sin(t*2 + i*1.7);
    const col = ['255,200,110', '255,150,140', '190,220,140'][i % 3];
    glow(c, x, y + 6, 12, col, .5*a); c.fillStyle = `rgba(${col},${.6 + .4*a})`; c.beginPath(); c.arc(x, y + 6, 3, 0, 7); c.fill(); }
  // Pilze und Blumen am Fuß des Baums
  for(const [x, y, s, col] of [[380, 610, 1, '#e86a5a'], [398, 616, .7, '#f0a080'], [860, 606, .9, '#e86a5a']]){
    c.fillStyle = '#efe2c8'; c.fillRect(x - 3*s, y - 12*s, 6*s, 12*s);
    c.fillStyle = col; c.beginPath(); c.arc(x, y - 12*s, 11*s, Math.PI, 0); c.fill();
    c.fillStyle = '#fff4e0'; c.beginPath(); c.arc(x - 4*s, y - 17*s, 2*s, 0, 7); c.arc(x + 4*s, y - 15*s, 1.6*s, 0, 7); c.fill(); }
  for(const [x, y, col] of [[330, 625, '#f2d36b'], [345, 632, '#f29ab3'], [895, 620, '#b9a6f2'], [915, 628, '#f2d36b']]){
    c.strokeStyle = '#3d6b4a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y + 12); c.lineTo(x, y); c.stroke();
    c.fillStyle = col; for(let i = 0; i < 5; i++){ const a = i/5*7 + t*.2; c.beginPath(); c.arc(x + Math.cos(a)*3.5, y + Math.sin(a)*3.5, 2.6, 0, 7); c.fill(); }
    c.fillStyle = '#fff3c4'; c.beginPath(); c.arc(x, y, 1.8, 0, 7); c.fill(); }
}
// Das große Fenster oben: dahinter liegt das echte Zimmer (cam.innen = fertig gemaltes Zimmerbild). Beim Hineinzoomen
// füllt es am Ende genau das Bild; danach öffnet sich der Kreis (cam.iris) und die Szene geht nahtlos drinnen weiter.
function grossesFenster(c, x, y, r, t, cam){
  const fl = .92 + .08*Math.sin(t*7) + .04*Math.sin(t*17), ir = cam.iris || r, s = ZOOM_S;
  glow(c, x, y, r*3.2, '255,180,90', .3*fl);
  c.fillStyle = '#3a261c'; c.beginPath(); c.arc(x, y, r + 6, 0, 7); c.fill();
  c.save(); c.beginPath(); c.arc(x, y, ir, 0, 7); c.clip();
  if(cam.innen) c.drawImage(cam.innen, x - W/(2*s), y - H/(2*s), W/s, H/s);
  else { c.fillStyle = '#f6b25e'; c.fillRect(x - r, y - r, r*2, r*2); }
  // Glas: leichte warme Spiegelung, wird beim Näherkommen unsichtbar
  const gl = Math.max(0, 1 - (cam.s - 1)/5);
  c.fillStyle = `rgba(255,240,210,${(.18*gl).toFixed(3)})`; c.beginPath(); c.ellipse(x - r*.35, y - r*.4, r*.45, r*.16, -.6, 0, 7); c.fill();
  c.fillStyle = `rgba(255,190,110,${(.12*gl).toFixed(3)})`; c.fillRect(x - r, y - r, r*2, r*2);
  c.restore();
  if(!cam.iris){ c.strokeStyle = '#5a3a24'; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, r + 1, 0, 7); c.stroke();
    c.fillStyle = '#d8b46a'; for(let i = 0; i < 8; i++){ const a = i/8*Math.PI*2; c.beginPath(); c.arc(x + Math.cos(a)*(r + 3.5), y + Math.sin(a)*(r + 3.5), 1.1, 0, 7); c.fill(); } }
}
function fensterRund(c, x, y, r, t, gross){
  const fl = .92 + .08*Math.sin(t*7) + .04*Math.sin(t*17);
  glow(c, x, y, r*3.2, '255,180,90', .3*fl);
  c.fillStyle = '#3a261c'; c.beginPath(); c.arc(x, y, r + 6, 0, 7); c.fill();
  const g = c.createRadialGradient(x - r*.2, y - r*.2, 2, x, y, r);
  g.addColorStop(0, '#ffe6a8'); g.addColorStop(.7, '#f6b25e'); g.addColorStop(1, '#d9873e');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  if(gross){
    // drinnen: Silhouette vom Fernrohr und vom Professor (rund, mit Fühlern)
    c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip();
    c.fillStyle = 'rgba(90,45,20,.55)'; c.save(); c.translate(x + 6, y + 16); c.rotate(-.6); c.fillRect(0, -3, 26, 7); c.restore();
    c.beginPath(); c.arc(x + 14, y + 22, 13, 0, 7); c.arc(x + 14, y + 6, 10, 0, 7); c.fill();
    c.fillRect(x + 8, y - 8, 2, 7); c.fillRect(x + 18, y - 8, 2, 7);
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(x - r*.35, y - r*.35, r*.35, 0, 7); c.fill();
    c.restore();
    // Gardinen
    c.fillStyle = 'rgba(214,96,80,.8)';
    c.beginPath(); c.moveTo(x - r, y - r*.7); c.quadraticCurveTo(x - r*.5, y - r*.2, x - r*.78, y + r*.6); c.lineTo(x - r, y + r*.2); c.fill();
    c.beginPath(); c.moveTo(x + r, y - r*.7); c.quadraticCurveTo(x + r*.5, y - r*.2, x + r*.78, y + r*.6); c.lineTo(x + r, y + r*.2); c.fill();
    // Herbert, die Pflanze, auf der Fensterbank
    c.fillStyle = '#b4643a'; c.fillRect(x - r*.75, y + r*.62, 12, 9);
    c.fillStyle = '#4f8a4a'; for(const a of [-.8, -.3, .3]) blatt(c, x - r*.75 + 6, y + r*.62, 13, 4, -Math.PI/2 + a, '#5c9a54', null);
  }
  c.strokeStyle = '#3a261c'; c.lineWidth = gross ? 3 : 2; c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.moveTo(x, y - r); c.lineTo(x, y + r); c.stroke();
}

// ---------- Sternenzimmer (innen) ----------
const FENSTER = {x: 860, y: 268, r: 158}, BODEN = 572, TISCH = {x: 760, y: 598};
const BUECHER = (() => { const r = rng(31), a = []; for(let reihe = 0; reihe < 4; reihe++){ let x = 58; while(x < 205){ const w = 9 + r()*12; a.push({x, y: 214 + reihe*96, w, h: 46 + r()*24, col: ['#b8453a', '#3f6e8c', '#d9a640', '#5c8a52', '#8a4f7a', '#d97a4a', '#e8dcc0'][Math.floor(r()*7)], schief: r() < .12}); x += w + 1.5; } } return a; })();
const INNEN_STERNE = (() => { const r = rng(41), a = []; for(let i = 0; i < 60; i++) a.push({x: FENSTER.x + (r() - .5)*FENSTER.r*2, y: FENSTER.y + (r() - .7)*FENSTER.r*1.6, g: .6 + r()*1.3, ph: r()*7, sp: .8 + r()*2}); return a; })();
const STAUB = (() => { const r = rng(77), a = []; for(let i = 0; i < 26; i++) a.push({x: (r() - .5)*230, y: r()*130, v: .05 + r()*.07, ph: r(), w: .3 + r()*.5, g: .7 + r()*1.1}); return a; })();   // Staubkörnchen im Lampenlicht
function fensterInhalt(c, t, st){   // Blick durchs Fenster: Nachthimmel, Horizont, Riesenbaum, Sternschnuppe
  const F = FENSTER; let g;
  c.save(); c.beginPath(); c.arc(F.x, F.y, F.r, 0, 7); c.clip();
  g = c.createLinearGradient(0, F.y - F.r, 0, F.y + F.r);
  g.addColorStop(0, '#0e0d2b'); g.addColorStop(.55, '#25205a'); g.addColorStop(.85, '#4b3a76'); g.addColorStop(1, '#6a4a7c');
  c.fillStyle = g; c.fillRect(F.x - F.r, F.y - F.r, F.r*2, F.r*2);
  for(const s of INNEN_STERNE){ const a = .45 + .55*Math.sin(t*s.sp + s.ph); c.globalAlpha = a; c.fillStyle = '#fff8e6'; c.beginPath(); c.arc(s.x, s.y, s.g, 0, 7); c.fill(); }
  c.globalAlpha = 1;
  // Horizont mit Dschungel und dem Riesenbaum
  c.fillStyle = '#1c1b3c'; c.beginPath(); c.moveTo(F.x - F.r, F.y + F.r);
  for(let x = -F.r; x <= F.r; x += 14) c.lineTo(F.x + x, F.y + 82 - Math.abs(Math.sin(x*.07))*16 - Math.abs(Math.sin(x*.023))*14);
  c.lineTo(F.x + F.r, F.y + F.r); c.fill();
  riesenbaum(c, F.x + 72, F.y + 92, .5, '#1c1b3c');
  if(st.einschlag > 0){ const e = st.einschlag; glow(c, F.x + 72, F.y + 92 - 135*.5, 140*e + 20, '255,236,170', .9*Math.min(1, e*2)); glow(c, F.x + 72, F.y - 20, 60 + 40*e, '255,250,220', .4*e); }
  if(st.nachglimmen > 0) glow(c, F.x + 72, F.y + 92 - 135*.5, 22 + 6*Math.sin(t*3), '255,220,140', .55*st.nachglimmen);
  if(st.stern) sternZeichnen(c, st.stern, t);
  // Spiegelung auf dem Glas
  c.fillStyle = 'rgba(255,255,255,.05)'; c.beginPath(); c.ellipse(F.x - F.r*.4, F.y - F.r*.45, F.r*.5, F.r*.18, -.6, 0, 7); c.fill();
  c.restore();
}
// Gerendertes Zimmer (Blender): Bild + was sich bewegt (Himmel im Fenster, Lichterkette, Lampe, Glühwürmchen, Dampf, Kekse)
function innenGerendert(c, t, st){
  const P = ZIMMER.pkt;
  c.fillStyle = '#0e0d2b'; c.fillRect(0, 0, W, H);
  fensterInhalt(c, t, st);
  c.drawImage(ZIMMER.hinten, 0, 0, W, H);
  c.save(); c.globalCompositeOperation = 'lighter';
  P.lichterkette.forEach(([x, y, col], i) => { const a = .5 + .5*Math.sin(t*1.7 + i*1.3), rgb = col.map(v => Math.round(v*255)).join(','); glow(c, x, y, 18, rgb, .22*a); });
  const fl = .9 + .07*Math.sin(t*8) + .04*Math.sin(t*19), [lx, ly] = P.lampe;
  glow(c, lx, ly + 10, 380, '255,180,100', .06*fl); glow(c, lx, ly + 4, 30, '255,230,170', .25*fl);
  { const [gx, gy] = P.glas; for(let i = 0; i < 5; i++){ const fx = gx + Math.sin(t*1.3 + i*2)*10, fy = gy + Math.cos(t*1.1 + i*1.7)*12, a = .5 + .5*Math.sin(t*2.3 + i); glow(c, fx, fy, 12, '214,255,120', .45*a); } }
  c.restore();
  for(const d of STAUB){ const k = (t*d.v + d.ph) % 1, x = lx + d.x + Math.sin(t*d.w + d.ph*7)*14, y = ly + 20 + d.y - k*60, a = Math.sin(k*Math.PI)*clamp(1 - Math.hypot(x - lx, y - ly)/170, 0, 1);
    if(a > .02){ c.fillStyle = `rgba(255,236,190,${(.5*a).toFixed(3)})`; c.beginPath(); c.arc(x, y, d.g, 0, 7); c.fill(); } }
  { const [x, y] = P.tasse; for(let i = 0; i < 3; i++){ const k = ((t*.35 + i/3) % 1); c.strokeStyle = `rgba(255,250,240,${(.3*(1 - k)).toFixed(3)})`; c.lineWidth = 2; c.beginPath(); c.moveTo(x + Math.sin(k*8 + i)*4, y - 4 - k*36); c.quadraticCurveTo(x + 7, y - 14 - k*36, x + Math.sin(k*8 + i + 1)*5, y - 26 - k*36); c.stroke(); } }
  if(!ZIMMER.ebene) kekseAufTeller(c, st);
}
function kekseAufTeller(c, st){ const x = TISCH.x, y = TISCH.y;
  const kekse = [[-44, -10], [-28, -14], [-2, -9], [-22, -6]].filter((_, i) => !(st.keksWeg && i === KEKS_TELLER));
  for(const [dx, dy] of kekse) keksZeichnen(c, x + dx, y + dy, KEKS_R, 0, 1); }
function innenZeichnen(c, t, st){
  if(ZIMMER.bereit) return innenGerendert(c, t, st);
  // Rückwand: Innenseite des Baumstamms, gebogene Bretter
  let g = c.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, '#4a2f1f'); g.addColorStop(.25, '#7a5136'); g.addColorStop(.55, '#87593a'); g.addColorStop(.85, '#6e4830'); g.addColorStop(1, '#43291b');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.strokeStyle = 'rgba(40,22,12,.35)'; c.lineWidth = 2;
  for(let i = 0; i < 15; i++){ const x = i*92 + 20; c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x + (x - W/2)*.05, H*.5, x + (x - W/2)*.02, 600); c.stroke(); }
  c.fillStyle = 'rgba(40,22,12,.25)'; for(const [x, y] of [[300, 470], [1180, 200], [96, 90], [620, 380]]){ c.beginPath(); c.ellipse(x, y, 9, 5, .3, 0, 7); c.fill(); }
  fensterInhalt(c, t, st);
  const F = FENSTER;
  // Fensterrahmen mit Sprossen und Bolzen
  c.strokeStyle = '#3a2416'; c.lineWidth = 22; c.beginPath(); c.arc(F.x, F.y, F.r + 9, 0, 7); c.stroke();
  c.strokeStyle = '#9a6a42'; c.lineWidth = 4; c.beginPath(); c.arc(F.x, F.y, F.r + 17, 0, 7); c.stroke();
  c.strokeStyle = '#3a2416'; c.lineWidth = 5; c.beginPath(); c.moveTo(F.x - F.r, F.y); c.lineTo(F.x + F.r, F.y); c.moveTo(F.x, F.y - F.r); c.lineTo(F.x, F.y + F.r); c.stroke();
  c.fillStyle = '#d8b46a'; for(let i = 0; i < 12; i++){ const a = i/12*Math.PI*2; c.beginPath(); c.arc(F.x + Math.cos(a)*(F.r + 9), F.y + Math.sin(a)*(F.r + 9), 3, 0, 7); c.fill(); }
  // Gardinen (rot mit weißen Punkten), zur Seite gebunden
  for(const s of [-1, 1]){
    const x0 = F.x + s*(F.r + 30);
    c.fillStyle = '#b8332e'; c.beginPath(); c.moveTo(x0 - s*10, F.y - F.r - 40); c.quadraticCurveTo(x0 + s*30, F.y - 40, x0 - s*2, F.y + 30); c.quadraticCurveTo(x0 + s*24, F.y + 120, x0 + s*6, F.y + F.r + 40); c.lineTo(x0 + s*40, F.y + F.r + 40); c.quadraticCurveTo(x0 + s*58, F.y, x0 + s*40, F.y - F.r - 40); c.fill();
    c.fillStyle = 'rgba(255,240,220,.75)'; for(let i = 0; i < 9; i++){ c.beginPath(); c.arc(x0 + s*(18 + (i % 3)*8), F.y - F.r - 20 + i*36, 2.6, 0, 7); c.fill(); }
    c.fillStyle = '#e0b04a'; c.fillRect(x0 + s*6 - 10, F.y + 26, 20, 7);
  }
  c.fillStyle = '#5a3a24'; c.fillRect(F.x - F.r - 70, F.y - F.r - 52, F.r*2 + 140, 12);
  // Fensterbank mit Herbert, der Pflanze
  c.fillStyle = '#6b452c'; c.fillRect(F.x - F.r - 20, F.y + F.r + 14, F.r*2 + 40, 14);
  pflanzeHerbert(c, F.x - F.r + 30, F.y + F.r + 14, t);
  // Deckenbalken mit Lichterkette
  c.fillStyle = '#3e2718'; c.fillRect(0, 86, W, 34); c.fillStyle = 'rgba(255,220,170,.08)'; c.fillRect(0, 86, W, 4);
  for(let i = 0; i < 22; i++){ const x = 20 + i*58, y = 126 + Math.sin(i*1.1)*6, a = .6 + .4*Math.sin(t*1.7 + i*1.3), col = ['255,200,110', '255,150,140', '190,220,140', '160,190,255'][i % 4];
    glow(c, x, y, 14, col, .45*a); c.fillStyle = `rgba(${col},${.65 + .35*a})`; c.beginPath(); c.arc(x, y, 3.2, 0, 7); c.fill(); }
  c.strokeStyle = 'rgba(40,30,20,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 122); for(let i = 0; i < 22; i++) c.lineTo(20 + i*58, 126 + Math.sin(i*1.1)*6); c.stroke();
  // Bücherregal links mit Glühwürmchen-Glas, Globus und Bildchen
  c.fillStyle = '#4a2e1d'; c.fillRect(44, 170, 176, BODEN - 170); c.fillStyle = '#2e1c12'; c.fillRect(52, 178, 160, BODEN - 186);
  for(let i = 0; i < 4; i++){ c.fillStyle = '#5c3a24'; c.fillRect(48, 262 + i*96, 168, 10); }
  for(const b of BUECHER){ if(b.y > 520) continue; c.save(); c.translate(b.x, b.y + 48); if(b.schief) c.rotate(-.18); c.fillStyle = b.col; c.fillRect(0, -b.h, b.w, b.h); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(1, -b.h + 6, b.w - 2, 2); c.fillRect(1, -10, b.w - 2, 2); c.restore(); }
  // Glas mit Glühwürmchen und Globus oben auf dem Regal
  { const x = 96, y = 170; c.fillStyle = 'rgba(200,230,255,.15)'; c.beginPath(); c.roundRect(x - 22, y - 50, 44, 50, 8); c.fill(); c.fillStyle = '#8a6a4a'; c.fillRect(x - 18, y - 56, 36, 7);
    for(let i = 0; i < 5; i++){ const fx = x + Math.sin(t*1.3 + i*2)*12, fy = y - 25 + Math.cos(t*1.1 + i*1.7)*14, a = .5 + .5*Math.sin(t*2.3 + i); glow(c, fx, fy, 12, '214,255,120', .5*a); c.fillStyle = `rgba(240,255,190,${a})`; c.beginPath(); c.arc(fx, fy, 1.8, 0, 7); c.fill(); } }
  { const x = 172, y = 170; c.fillStyle = '#3c6a9a'; c.beginPath(); c.arc(x, y - 28, 22, 0, 7); c.fill(); c.fillStyle = '#6aa05a'; c.beginPath(); c.ellipse(x - 6, y - 32, 9, 12, .4, 0, 7); c.ellipse(x + 10, y - 20, 6, 8, -.3, 0, 7); c.fill(); c.strokeStyle = '#c9a24a'; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y - 28, 26, 2.2, 5.6); c.stroke(); c.fillStyle = '#5a3a24'; c.fillRect(x - 10, y - 4, 20, 4); }
  // Sternkarte und Kinderbild an der Wand
  c.save(); c.translate(400, 300); c.rotate(-.05);
  c.fillStyle = '#e9dcbf'; c.fillRect(-60, -48, 120, 96); c.strokeStyle = 'rgba(80,60,40,.5)'; c.lineWidth = 1; c.strokeRect(-56, -44, 112, 88);
  const sb = [[-36, -20], [-12, -28], [8, -10], [30, -24], [20, 14], [-20, 18]]; c.strokeStyle = 'rgba(60,70,120,.6)'; c.beginPath(); sb.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
  c.fillStyle = '#3b4a8a'; for(const [x, y] of sb){ c.beginPath(); c.arc(x, y, 2.6, 0, 7); c.fill(); }
  c.fillStyle = '#c23a3a'; c.beginPath(); c.arc(0, -48, 4, 0, 7); c.fill(); c.restore();
  c.save(); c.translate(500, 200); c.rotate(.06);
  c.fillStyle = '#fbf6ec'; c.fillRect(-46, -34, 92, 68);
  // Kinderzeichnung: Papa (rot, mit Punkten), Affe (braun), Schweinchen (rosa), Herz
  c.lineWidth = 2.2; c.lineCap = 'round';
  c.fillStyle = '#d23a3a'; c.beginPath(); c.arc(-22, 4, 13, 0, 7); c.fill(); c.fillStyle = '#222'; c.beginPath(); c.arc(-26, 0, 2, 0, 7); c.arc(-18, 8, 2, 0, 7); c.fill(); c.beginPath(); c.arc(-22, -12, 7, 0, 7); c.fill();
  c.fillStyle = '#a8743e'; c.beginPath(); c.arc(4, 10, 9, 0, 7); c.fill(); c.fillStyle = '#f19ab3'; c.beginPath(); c.arc(26, 10, 9, 0, 7); c.fill();
  c.fillStyle = '#e8405a'; c.beginPath(); c.moveTo(15, -18); c.bezierCurveTo(9, -26, 2, -18, 15, -8); c.bezierCurveTo(28, -18, 21, -26, 15, -18); c.fill();
  c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(0, -34, 3.5, 0, 7); c.fill(); c.restore();
  // Hakenbrett: zwei schon gepackte Rucksäcke (für morgen!) und Papas Schal
  { c.fillStyle = '#5c3a24'; c.fillRect(468, 372, 140, 10); c.fillStyle = '#c9a24a'; for(const hx of [490, 540, 590]){ c.beginPath(); c.arc(hx, 384, 3, 0, 7); c.fill(); }
    const sw = Math.sin(t*.9)*.03;
    // Schal (rot mit Punkten wie der Professor) hängt doppelt herunter
    c.save(); c.translate(490, 386); c.rotate(sw*.6); c.fillStyle = '#b8262d';
    c.beginPath(); c.moveTo(-8, 0); c.quadraticCurveTo(-12, 40, -9, 74); c.lineTo(1, 74); c.quadraticCurveTo(-1, 40, 4, 0); c.fill();
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(8, 34, 6, 60); c.lineTo(15, 60); c.quadraticCurveTo(15, 30, 8, 0); c.fill();
    c.fillStyle = '#2a1a1a'; for(const [px, py] of [[-5, 20], [-6, 52], [10, 28], [10, 48]]){ c.beginPath(); c.arc(px, py, 2.3, 0, 7); c.fill(); }
    c.strokeStyle = '#e8c35a'; c.lineWidth = 1.2; for(const [fx, fy] of [[-9, 74], [-6, 74], [-3, 74], [0, 74], [7, 60], [10, 60], [13, 60]]){ c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx, fy + 6); c.stroke(); }
    c.restore();
    for(const [hx, farbe, dunkel, k] of [[540, '#a8743e', '#7a5028', 0], [590, '#f19ab3', '#c96a88', 1]]){
      c.save(); c.translate(hx, 386); c.rotate(sw*(k ? -1 : 1));
      c.strokeStyle = dunkel; c.lineWidth = 3; c.beginPath(); c.moveTo(-8, 18); c.quadraticCurveTo(0, -4, 8, 18); c.stroke();          // Trageschlaufe
      c.fillStyle = farbe; c.beginPath(); c.roundRect(-17, 14, 34, 40, [12, 12, 8, 8]); c.fill();
      c.fillStyle = dunkel; c.beginPath(); c.roundRect(-17, 14, 34, 16, [12, 12, 4, 4]); c.fill();                                  // Klappe
      c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.roundRect(-11, 34, 22, 14, 5); c.fill();                                   // Vortasche
      c.fillStyle = '#e0b04a'; c.fillRect(-2.5, 26, 5, 6);
      if(k === 0){ c.fillStyle = '#ffd56a'; c.beginPath(); for(let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? 2.6 : 6; c.lineTo(Math.cos(a)*rr + 9, 44 + Math.sin(a)*rr); } c.fill(); }   // Stern-Anhänger
      else { c.fillStyle = '#e8405a'; c.beginPath(); c.moveTo(9, 46); c.bezierCurveTo(4, 42, 5, 37, 9, 40); c.bezierCurveTo(13, 37, 14, 42, 9, 46); c.fill(); }      // Herz-Anhänger
      c.restore(); }
  }
  // Boden: Fußleiste, Dielen mit Tiefe (laufen zur Bildmitte zusammen) und runder Flickenteppich
  g = c.createLinearGradient(0, BODEN, 0, H); g.addColorStop(0, '#4e3220'); g.addColorStop(.35, '#6a4429'); g.addColorStop(1, '#3a2416');
  c.fillStyle = g; c.fillRect(0, BODEN, W, H - BODEN);
  c.strokeStyle = 'rgba(30,16,8,.45)'; c.lineWidth = 1.5;
  for(let i = -12; i <= 12; i++){ c.beginPath(); c.moveTo(640 + i*58, BODEN); c.lineTo(640 + i*150, H); c.stroke(); }
  for(const y of [BODEN + 22, BODEN + 50, BODEN + 86, BODEN + 130]){ c.strokeStyle = 'rgba(30,16,8,.25)'; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  c.fillStyle = '#3a2416'; c.fillRect(0, BODEN - 12, W, 13); c.fillStyle = 'rgba(255,220,170,.12)'; c.fillRect(0, BODEN - 12, W, 2);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, BODEN + 1, W, 6);
  for(const [r, col] of [[250, '#6e3434'], [215, '#c97a4a'], [175, '#e0b25a'], [130, '#6a8a5a'], [85, '#c9605a'], [40, '#e8d2a8']]){ c.fillStyle = col; c.beginPath(); c.ellipse(470, 646, r, r*.15, 0, 0, 7); c.fill(); }
  c.strokeStyle = 'rgba(40,20,10,.25)'; c.lineWidth = 1; for(const r of [250, 215, 175, 130, 85]){ c.beginPath(); c.ellipse(470, 646, r - 6, (r - 6)*.15, 0, 0, 7); c.stroke(); }
  // Holzrakete (Spielzeug) liegt auf dem Boden – sie wollen ja irgendwohin, wo noch niemand war
  { c.save(); c.translate(856, 640); c.rotate(-.12);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(4, 11, 34, 4, 0, 0, 7); c.fill();
    c.fillStyle = '#e9dcbf'; c.beginPath(); c.moveTo(-26, -7); c.lineTo(14, -7); c.quadraticCurveTo(32, -3, 36, 0); c.quadraticCurveTo(32, 3, 14, 7); c.lineTo(-26, 7); c.closePath(); c.fill();
    c.fillStyle = '#b8332e'; c.beginPath(); c.moveTo(-26, -7); c.lineTo(-36, -15); c.lineTo(-18, -7); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-26, 7); c.lineTo(-36, 15); c.lineTo(-18, 7); c.closePath(); c.fill();
    c.fillRect(-27, -7, 5, 14); c.beginPath(); c.moveTo(20, -5.6); c.quadraticCurveTo(32, -3, 36, 0); c.quadraticCurveTo(32, 3, 20, 5.6); c.closePath(); c.fill();
    c.fillStyle = '#3c6a9a'; c.beginPath(); c.arc(2, 0, 4.2, 0, 7); c.fill(); c.strokeStyle = '#c9a24a'; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-20, -6, 30, 2); c.restore(); }
  // Fernrohr auf Dreibein (zeigt zum Fenster)
  { const bx = 950, by = BODEN + 76; c.strokeStyle = '#4a2e1d'; c.lineWidth = 7; c.lineCap = 'round';
    for(const dx of [-44, 8, 44]){ c.beginPath(); c.moveTo(bx, 422); c.lineTo(bx + dx, by + (dx === 8 ? -10 : 0)); c.stroke(); }
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(bx, by + 2, 60, 6, 0, 0, 7); c.fill();
    c.save(); c.translate(bx, 420); c.rotate(Math.PI + .55);
    g = c.createLinearGradient(0, -14, 0, 14); g.addColorStop(0, '#ffe7a0'); g.addColorStop(.5, '#d8a44a'); g.addColorStop(1, '#8a5a1e');
    c.fillStyle = g; c.beginPath(); c.roundRect(-70, -11, 150, 22, 6); c.fill(); c.beginPath(); c.roundRect(72, -15, 30, 30, 5); c.fill();
    c.fillStyle = '#6b4a1e'; c.fillRect(-20, -12, 6, 24); c.fillRect(40, -12, 5, 24); c.fillStyle = '#2a1a10'; c.beginPath(); c.roundRect(-84, -7, 16, 14, 3); c.fill();
    c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(-60, -8, 120, 3); c.restore();
    c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(bx, 420, 8, 0, 7); c.fill(); }
  // Tischchen mit Keksen und dampfendem Tee
  { const x = TISCH.x, y = TISCH.y; c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(x, y + 50, 56, 7, 0, 0, 7); c.fill();
    c.fillStyle = '#5a3a24'; c.fillRect(x - 6, y, 12, 48); c.fillRect(x - 30, y + 44, 60, 6);
    c.fillStyle = '#6b452c'; c.beginPath(); c.ellipse(x, y, 74, 14, 0, 0, 7); c.fill(); c.fillStyle = '#7d5434'; c.beginPath(); c.ellipse(x, y - 2, 70, 11, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(x - 22, y - 1, 47, 9, 0, 0, 7); c.fill(); c.fillStyle = '#f2ead8'; c.beginPath(); c.ellipse(x - 24, y - 4, 46, 9, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(160,140,110,.6)'; c.lineWidth = 1; c.beginPath(); c.ellipse(x - 24, y - 4, 34, 6, 0, 0, 7); c.stroke();
    kekseAufTeller(c, st);
    c.fillStyle = '#e8dcc8'; c.beginPath(); c.roundRect(x + 18, y - 26, 26, 22, [3, 3, 8, 8]); c.fill(); c.strokeStyle = '#e8dcc8'; c.lineWidth = 3; c.beginPath(); c.arc(x + 46, y - 16, 6, -1.4, 1.4); c.stroke();
    c.fillStyle = '#b8262d'; c.beginPath(); c.arc(x + 31, y - 15, 3, 0, 7); c.fill();
    for(let i = 0; i < 3; i++){ const k = ((t*.35 + i/3) % 1); c.strokeStyle = `rgba(255,250,240,${(.35*(1 - k)).toFixed(3)})`; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 31 + Math.sin(k*8 + i)*4, y - 30 - k*36); c.quadraticCurveTo(x + 38, y - 40 - k*36, x + 31 + Math.sin(k*8 + i + 1)*5, y - 52 - k*36); c.stroke(); } }
  // Hängelampe: warmes, leicht flackerndes Licht
  const fl = .9 + .07*Math.sin(t*8) + .04*Math.sin(t*19), pe = Math.sin(t*.7)*.035, lx = 430 + Math.sin(pe)*60, ly = 120 + Math.cos(pe)*62;
  c.save(); c.translate(430, 120); c.rotate(pe);
  c.strokeStyle = '#2a1a10'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 30); c.stroke();
  c.fillStyle = '#c9a24a'; c.beginPath(); c.moveTo(-20, 30); c.lineTo(20, 30); c.lineTo(12, 56); c.lineTo(-12, 56); c.fill();
  c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-15, 33, 4, 18); c.restore();
  glow(c, lx, ly, 420*fl, '255,190,110', .22);
  glow(c, lx, ly, 40, '255,236,180', .85*fl);
  for(const d of STAUB){ const k = (t*d.v + d.ph) % 1, x = lx + d.x + Math.sin(t*d.w + d.ph*7)*14, y = ly + 20 + d.y - k*60, a = Math.sin(k*Math.PI)*clamp(1 - Math.hypot(x - lx, y - ly)/170, 0, 1);
    if(a > .02){ c.fillStyle = `rgba(255,236,190,${(.55*a).toFixed(3)})`; c.beginPath(); c.arc(x, y, d.g, 0, 7); c.fill(); } }
}
function pflanzeHerbert(c, x, y, t){
  c.fillStyle = '#b4643a'; c.beginPath(); c.moveTo(x - 16, y); c.lineTo(x + 16, y); c.lineTo(x + 12, y - 24); c.lineTo(x - 12, y - 24); c.fill();
  c.fillStyle = '#c9744a'; c.fillRect(x - 15, y - 28, 30, 6);
  for(const [a, l] of [[-1.2, 34], [-.6, 42], [0, 46], [.55, 40], [1.15, 32]]) blatt(c, x, y - 26, l, 9, -Math.PI/2 + a + Math.sin(t*1.3 + a)*.04, '#5c9a54', 'rgba(30,70,30,.5)');
  c.fillStyle = '#f2ead8'; c.save(); c.translate(x + 16, y - 10); c.rotate(.2); c.fillRect(0, -6, 30, 12); c.fillStyle = '#3a2a1e'; c.font = `600 8px ${SCHRIFT_TEXT}`; c.textAlign = 'left'; c.fillText('Herbert', 2, 3); c.restore();
}
// Sternschnuppe: Kopf mit Funkenschweif
function sternZeichnen(c, s, t){
  const {x, y, spur, a} = s;
  c.lineCap = 'round';
  for(let i = spur.length - 1; i > 0; i--){ const k = i/spur.length; c.strokeStyle = `rgba(255,236,170,${((1 - k)*.6*a).toFixed(3)})`; c.lineWidth = 10*(1 - k) + 1; c.beginPath(); c.moveTo(spur[i - 1][0], spur[i - 1][1]); c.lineTo(spur[i][0], spur[i][1]); c.stroke(); }
  glow(c, x, y, 46, '255,240,190', .7*a); glow(c, x, y, 16, '255,255,240', a);
  c.fillStyle = `rgba(255,255,255,${a})`; c.save(); c.translate(x, y); c.rotate(t*3);
  c.beginPath(); for(let i = 0; i < 10; i++){ const r = i % 2 ? 4 : 10, w = i/10*Math.PI*2; c.lineTo(Math.cos(w)*r, Math.sin(w)*r); } c.fill(); c.restore();
  for(const f of s.funken){ c.fillStyle = `rgba(255,240,200,${(f.l*a).toFixed(3)})`; c.beginPath(); c.arc(f.x, f.y, 1.6, 0, 7); c.fill(); }
}

// ---------- Blätter-Vorhang und Kapitelkarte ----------
const VORHANG = (() => { const r = rng(77), a = [];
  for(let gy = -1; gy <= 8; gy++) for(let gx = -1; gx <= 13; gx++){
    const tx = gx*104 + (gy % 2)*52 + (r() - .5)*30, ty = gy*92 + (r() - .5)*30;
    const dl = tx, dr = W - tx, dt = ty, db = H - ty, m = Math.min(dl, dr, dt, db);
    const von = m === dl ? [-260, ty + (r() - .5)*200] : m === dr ? [W + 260, ty + (r() - .5)*200] : m === dt ? [tx + (r() - .5)*200, -260] : [tx + (r() - .5)*200, H + 260];
    const zentrum = Math.hypot(tx - W/2, ty - H/2)/Math.hypot(W/2, H/2);
    a.push({tx, ty, von, rot: r()*7, l: 150 + r()*70, b: 40 + r()*16, col: ['#2f6b3a', '#3c7d45', '#4a8f4e', '#2a5c34', '#5a9a52'][Math.floor(r()*5)], verz: (1 - zentrum)*.45 + r()*.08, dreh: (r() - .5)*2});
  }
  return a.sort((p, q) => q.verz - p.verz); })();
// k: 0 = offen, 1 = geschlossen; raus: Blätter fliegen beim Öffnen weiter nach außen
function vorhangZeichnen(c, k, raus, t){
  if(k <= 0) return;
  for(const b of VORHANG){
    const e = glatt((k - b.verz*.9)/.55);
    if(e <= 0) continue;
    const ziel = raus ? [b.tx + (b.tx - b.von[0])*-0, b.ty] : [b.tx, b.ty];
    const x = lerp(b.von[0], ziel[0], e) + Math.sin(t*1.2 + b.tx)*2*e, y = lerp(b.von[1], ziel[1], e) + Math.cos(t*1.1 + b.ty)*2*e;
    blatt(c, x - Math.cos(b.rot)*b.l*.5, y - Math.sin(b.rot)*b.l*.5, b.l, b.b, b.rot + b.dreh*(1 - e), b.col, 'rgba(20,50,25,.45)');
  }
}
function kapitelKarte(c, a, t){
  if(a <= 0) return;
  c.save(); c.globalAlpha = a;
  const pend = Math.sin(t*1.4)*.012;
  c.translate(W/2, 120); c.rotate(pend); c.translate(-W/2, -120);
  // Seile
  c.strokeStyle = '#7a5a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(W/2 - 220, -10); c.lineTo(W/2 - 200, 232); c.moveTo(W/2 + 220, -10); c.lineTo(W/2 + 200, 232); c.stroke();
  // Papier mit unregelmäßigem Rand
  const x0 = W/2 - 330, y0 = 228, w = 660, h = 250, r = rng(5);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.roundRect(x0 + 8, y0 + 10, w, h, 18); c.fill();
  c.beginPath(); c.moveTo(x0 + 14, y0);
  for(let x = x0 + 14; x < x0 + w - 14; x += 18) c.lineTo(x, y0 + (r() - .5)*4);
  c.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + 14);
  for(let y = y0 + 14; y < y0 + h - 14; y += 18) c.lineTo(x0 + w + (r() - .5)*4, y);
  c.quadraticCurveTo(x0 + w, y0 + h, x0 + w - 14, y0 + h);
  for(let x = x0 + w - 14; x > x0 + 14; x -= 18) c.lineTo(x, y0 + h + (r() - .5)*4);
  c.quadraticCurveTo(x0, y0 + h, x0, y0 + h - 14);
  for(let y = y0 + h - 14; y > y0 + 14; y -= 18) c.lineTo(x0 + (r() - .5)*4, y);
  c.quadraticCurveTo(x0, y0, x0 + 14, y0); c.closePath();
  const g = c.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#fbf3df'); g.addColorStop(1, '#efe0bd');
  c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(140,100,60,.35)'; c.lineWidth = 2; c.stroke();
  // Sternschnuppe zieht über die Karte
  const sk = ((t*.32) % 1.6);
  if(sk < 1){ const sx = x0 + 40 + sk*(w - 80), sy = y0 + 40 + Math.sin(sk*3)*6 + sk*10;
    c.strokeStyle = 'rgba(230,170,60,.5)'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx - 70, sy - 10); c.lineTo(sx, sy); c.stroke();
    c.fillStyle = '#e8a83a'; c.save(); c.translate(sx, sy); c.rotate(t*3); c.beginPath(); for(let i = 0; i < 10; i++){ const rr = i % 2 ? 3 : 8, ww = i/10*Math.PI*2; c.lineTo(Math.cos(ww)*rr, Math.sin(ww)*rr); } c.fill(); c.restore(); }
  c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.fillStyle = '#a0522d'; c.font = `600 22px ${SCHRIFT_TEXT}`;
  c.save(); c.letterSpacing = '6px'; c.fillText('KAPITEL 1', W/2, y0 + 82); c.restore();
  c.fillStyle = '#c9a24a'; for(const dx of [-108, 108]){ c.save(); c.translate(W/2 + dx, y0 + 74); c.rotate(t*.5); c.beginPath(); for(let i = 0; i < 10; i++){ const rr = i % 2 ? 3 : 7, ww = i/10*Math.PI*2; c.lineTo(Math.cos(ww)*rr, Math.sin(ww)*rr); } c.fill(); c.restore(); }
  c.fillStyle = '#3a2416'; c.font = `700 50px ${SCHRIFT_TITEL}`;
  c.fillText('Die Nacht,', W/2, y0 + 148); c.fillText('in der der Stern fiel', W/2, y0 + 204);
  c.restore();
}

// Keks (mit Bissen: biss 0..1 – je mehr, desto kleiner, mit runden Bissspuren)
// Keks: flach = 0 von vorn (in der Pfote), 1 = liegt auf dem Teller; bisse 0..3 = Bissspuren auf der linken (dem Mund zugewandten) Seite
const KEKS_TELLER = 2;   // dieser Keks (ganz rechts) wird vom Affen genommen
function keksZeichnen(c, x, y, r, bisse = 0, flach = 1, rot = 0){
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(1, 1 - .45*flach);
  if(bisse > 0){ c.beginPath(); c.rect(-r*2, -r*2, r*4, r*4);
    for(const [a, br] of [[Math.PI, .46], [Math.PI - .85, .42], [Math.PI + .8, .5]].slice(0, bisse)){
      const bx = Math.cos(a)*r*.98, by = Math.sin(a)*r*.98, rr = r*br; c.moveTo(bx + rr, by); c.arc(bx, by, rr, 0, 7);
      for(let z = 0; z < 4; z++){ const za = a + Math.PI + (z - 1.5)*.42, zx = bx + Math.cos(za)*rr, zy = by + Math.sin(za)*rr; c.moveTo(zx + r*.09, zy); c.arc(zx, zy, r*.09, 0, 7); } }   // Zahnabdrücke
    c.clip('evenodd'); }
  c.fillStyle = '#a8692f'; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();                                   // Rand
  const g = c.createRadialGradient(-r*.3, -r*.35, r*.1, 0, 0, r); g.addColorStop(0, '#e9b56e'); g.addColorStop(1, '#c98a4a');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, r*.9, 0, 7); c.fill();
  c.fillStyle = 'rgba(120,70,30,.35)'; for(const [dx, dy] of [[-.5, .1], [.1, -.55], [.45, .35], [-.15, .55], [.6, -.2]]){ c.beginPath(); c.arc(dx*r, dy*r, r*.05, 0, 7); c.fill(); }
  for(const [dx, dy, s] of [[.3, -.15, .17], [-.35, -.35, .14], [-.1, .4, .16], [.45, .45, .12], [-.55, .2, .11]]){
    c.fillStyle = '#4a2812'; c.beginPath(); c.arc(dx*r, dy*r, s*r, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,220,180,.35)'; c.beginPath(); c.arc(dx*r - s*r*.3, dy*r - s*r*.3, s*r*.35, 0, 7); c.fill(); }
  c.restore();
}
// Ohrensessel des Professors (hinten: Lehne, Sitz; vorne: Armlehnen) und die Decke
const SESSEL = {x: 1158, sitz: ZIMMER.daten ? 544 : BODEN + 8};
function sesselHinten(c){
  if(ZIMMER.bereit) return;
  const x = SESSEL.x, b = BODEN + 68;
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x, b + 2, 130, 10, 0, 0, 7); c.fill();
  c.fillStyle = '#4a2e1d'; for(const dx of [-96, 96]) c.fillRect(x + dx - 6, b - 16, 12, 18);
  let g = c.createLinearGradient(x - 120, 0, x + 120, 0); g.addColorStop(0, '#23514f'); g.addColorStop(.5, '#2f6a66'); g.addColorStop(1, '#1d4442');
  c.fillStyle = g; c.beginPath(); c.moveTo(x - 112, b - 20); c.lineTo(x - 118, SESSEL.sitz - 150); c.quadraticCurveTo(x - 120, SESSEL.sitz - 230, x - 60, SESSEL.sitz - 236); c.quadraticCurveTo(x, SESSEL.sitz - 250, x + 60, SESSEL.sitz - 236); c.quadraticCurveTo(x + 120, SESSEL.sitz - 230, x + 118, SESSEL.sitz - 150); c.lineTo(x + 112, b - 20); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.ellipse(x - 40, SESSEL.sitz - 180, 40, 60, -.2, 0, 7); c.fill();
  c.fillStyle = '#d8b46a'; for(const [dx, dy] of [[-50, -190], [0, -200], [50, -190], [-25, -150], [25, -150], [-50, -110], [0, -115], [50, -110]]){ c.beginPath(); c.arc(x + dx, SESSEL.sitz + dy, 3, 0, 7); c.fill(); }
  c.fillStyle = '#285c59'; c.beginPath(); c.roundRect(x - 104, SESSEL.sitz - 8, 208, 40, 14); c.fill();
  c.fillStyle = '#3b7b76'; c.beginPath(); c.roundRect(x - 100, SESSEL.sitz - 14, 200, 22, 11); c.fill();
  c.fillStyle = '#1d4442'; c.fillRect(x - 108, SESSEL.sitz + 28, 216, b - 20 - SESSEL.sitz - 28);
}
function sesselVorne(c){
  if(ZIMMER.bereit){ c.save(); c.beginPath(); c.rect(760, 0, W - 760, H); c.clip(); c.drawImage(ZIMMER.vorne, 0, 0, W, H); c.restore(); return; }
  const x = SESSEL.x;
  for(const s of [-1, 1]){ c.fillStyle = s < 0 ? '#2b605d' : '#214a48'; c.beginPath(); c.roundRect(x + s*104 - 22, SESSEL.sitz - 64, 44, 120, 18); c.fill();
    c.fillStyle = '#3b7b76'; c.beginPath(); c.ellipse(x + s*104, SESSEL.sitz - 62, 24, 12, 0, 0, 7); c.fill(); }
}
// Gestrickte Wolldecke: liegt gefaltet auf der Armlehne (k = 0) oder ist über den Schoß gezogen (k = 1) –
// fällt über die Sitzkante mit weichen Falten, Zopfmuster, rote Streifen und Fransen
function deckeZeichnen(c, x, y, D){
  if(D.buendel){   // zusammengelegt (auf der Armlehne oder in der Hand)
    const ax = D.buendel.x, ay = D.buendel.y;
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.roundRect(ax - 30, ay + 6, 60, 22, 7); c.fill();
    for(let i = 0; i < 3; i++){ c.fillStyle = i % 2 ? '#e8dcbf' : '#f3ead4'; c.beginPath(); c.roundRect(ax - 30, ay - i*8, 60, 12, 6); c.fill(); c.fillStyle = '#c0392b'; c.fillRect(ax - 30, ay - i*8 + 4, 60, 2.5); }
  }
  const k = D.k || 0;
  if(k <= .01) return;
  c.save();
  if(D.wurf){ c.globalAlpha = 1 - D.wurf; c.translate(-90*D.wurf, -50*D.wurf); }
  const L = x - 104, R = x + 104, oben = y - 58, mitte = y - 30, saum = y + 64;
  const form = () => { c.beginPath();
    c.moveTo(L + 8, mitte); c.bezierCurveTo(L + 30, oben - 6, R - 30, oben - 6, R - 8, mitte);
    c.bezierCurveTo(R + 6, mitte + 20, R + 10, saum - 30, R + 6, saum);
    for(let i = 0; i <= 8; i++){ const fx = R + 6 - i*(R - L + 12)/8; c.quadraticCurveTo(fx + 7, saum + (i % 2 ? 9 : -2), fx, saum + (i % 2 ? 2 : 6)); }
    c.bezierCurveTo(L - 10, saum - 30, L - 6, mitte + 20, L + 8, mitte); c.closePath(); };
  // Grundfarbe mit Licht von links oben
  let g = c.createLinearGradient(L, oben, R, saum); g.addColorStop(0, '#fbf3e0'); g.addColorStop(.55, '#ecdfc2'); g.addColorStop(1, '#c9b892');
  c.beginPath(); c.rect(L - 40, oben - 20, R - L + 80, (saum + 30 - oben + 20)*glatt(k)); c.clip();
  form(); c.fillStyle = g; c.fill();
  c.save(); form(); c.clip();
  // Zopfmuster: Reihen kleiner Maschen (V), leicht gewellt mit der Decke
  c.strokeStyle = 'rgba(150,120,80,.35)'; c.lineWidth = 1.2;
  for(let r = 0; r < 14; r++){ const yy = oben + 4 + r*9; for(let i = 0; i < 26; i++){ const xx = L - 8 + i*9, w = Math.sin(i*.7 + r)*1.5; c.beginPath(); c.moveTo(xx, yy + w); c.lineTo(xx + 4.5, yy + 5 + w); c.lineTo(xx + 9, yy + w); c.stroke(); } }
  // Zöpfe (senkrechte Flechtstränge)
  c.strokeStyle = 'rgba(140,110,70,.45)'; c.lineWidth = 2.2;
  for(const zx of [x - 52, x, x + 52]) for(let r = 0; r < 7; r++){ const yy = oben + 10 + r*16; c.beginPath(); c.moveTo(zx - 7, yy); c.quadraticCurveTo(zx, yy + 8, zx + 7, yy + 16); c.moveTo(zx + 7, yy); c.quadraticCurveTo(zx, yy + 8, zx - 7, yy + 16); c.stroke(); }
  // zwei rote Streifen unten
  for(const sy of [saum - 26, saum - 14]){ c.fillStyle = '#c0392b'; c.beginPath(); c.moveTo(L - 20, sy); for(let i = 0; i <= 12; i++) c.lineTo(L - 20 + i*20, sy + Math.sin(i*.9)*2); c.lineTo(R + 20, sy + 6); c.lineTo(L - 20, sy + 6); c.fill(); }
  // Falten: weiche Schatten von oben nach unten
  for(const [fx, b] of [[x - 70, .2], [x - 25, .14], [x + 30, .18], [x + 78, .22]]){ g = c.createLinearGradient(fx - 14, 0, fx + 14, 0); g.addColorStop(0, 'rgba(90,60,30,0)'); g.addColorStop(.5, `rgba(90,60,30,${b})`); g.addColorStop(1, 'rgba(90,60,30,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(fx - 4, mitte); c.quadraticCurveTo(fx + 8, saum - 30, fx - 2, saum + 8); c.lineTo(fx + 16, saum + 8); c.quadraticCurveTo(fx + 20, saum - 30, fx + 8, mitte); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(x - 30, oben + 16, 60, 10, -.08, 0, 7); c.fill();
  c.restore();
  form(); c.strokeStyle = 'rgba(120,90,55,.6)'; c.lineWidth = 1.5; c.stroke();
  // Fransen am Saum
  c.strokeStyle = '#efe3c8'; c.lineWidth = 2.2; c.lineCap = 'round';
  for(let i = 0; i < 30; i++){ const fx = L + 2 + i*(R - L - 4)/29, fy = saum + 3 + (Math.floor(i/3.6) % 2 ? 5 : 1); c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx + Math.sin(i*1.3)*1.5, fy + 9); c.stroke(); }
  c.restore();
}
// Sofa für Affe und Schweinchen (altrosa Samt, Knöpfe, Kissen, ein gehäkeltes Deckchen über der Lehne)
const SOFA = {x: 318, sitz: ZIMMER.daten ? 553 : 604, l: 82, r: 554};
function sofaHinten(c){
  if(ZIMMER.bereit) return;
  const {x, sitz, l, r} = SOFA, b = BODEN + 70;
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x, b + 2, 250, 10, 0, 0, 7); c.fill();
  c.fillStyle = '#4a2e1d'; for(const fx of [l + 12, r - 12, x]) c.fillRect(fx - 5, b - 14, 10, 16);
  let g = c.createLinearGradient(0, sitz - 140, 0, sitz); g.addColorStop(0, '#c4706a'); g.addColorStop(1, '#9c4f4b');
  c.fillStyle = g; c.beginPath(); c.moveTo(l + 10, sitz + 10); c.lineTo(l + 14, sitz - 110); c.quadraticCurveTo(l + 20, sitz - 146, l + 60, sitz - 146); c.lineTo(r - 60, sitz - 146); c.quadraticCurveTo(r - 20, sitz - 146, r - 14, sitz - 110); c.lineTo(r - 10, sitz + 10); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(80,30,30,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, sitz - 140); c.lineTo(x, sitz - 8); c.stroke();
  c.fillStyle = '#e8c35a'; for(const [dx, dy] of [[-120, -100], [-60, -110], [60, -110], [120, -100], [-90, -55], [-30, -60], [30, -60], [90, -55]]){ c.beginPath(); c.arc(x + dx, sitz + dy, 3, 0, 7); c.fill(); }
  // gehäkeltes Deckchen über der Lehne
  c.fillStyle = 'rgba(250,244,230,.9)'; c.beginPath(); c.moveTo(x + 40, sitz - 146); c.lineTo(x + 110, sitz - 146); c.lineTo(x + 100, sitz - 112); c.lineTo(x + 75, sitz - 100); c.lineTo(x + 50, sitz - 112); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(200,180,150,.8)'; c.lineWidth = 1; for(let i = 0; i < 5; i++){ c.beginPath(); c.arc(x + 75, sitz - 140, 6 + i*7, .4, 2.7); c.stroke(); }
  // Sitzkissen
  for(const [cx, w] of [[l + 125, 220], [r - 125, 220]]){ g = c.createLinearGradient(0, sitz - 16, 0, sitz + 26); g.addColorStop(0, '#d3837b'); g.addColorStop(1, '#a8564f');
    c.fillStyle = g; c.beginPath(); c.roundRect(cx - w/2, sitz - 16, w, 42, 14); c.fill(); c.strokeStyle = 'rgba(90,30,30,.3)'; c.lineWidth = 1.5; c.stroke(); }
  c.fillStyle = '#8c4642'; c.fillRect(l + 12, sitz + 24, r - l - 24, b - 14 - sitz - 24);
  // gelbes Kissen in der Ecke
  c.save(); c.translate(l + 36, sitz - 38); c.rotate(-.25); c.fillStyle = '#e8b84a'; c.beginPath(); c.roundRect(-26, -24, 52, 48, 14); c.fill(); c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.arc(-6, -8, 9, 0, 7); c.fill(); c.restore();
}
function sofaVorne(c){
  if(ZIMMER.bereit){ c.save(); c.beginPath(); c.rect(0, 0, 760, H); c.clip(); c.drawImage(ZIMMER.vorne, 0, 0, W, H); c.restore(); return; }
  const {sitz, l, r} = SOFA;
  for(const [ax, s] of [[l, -1], [r, 1]]){ const g = c.createLinearGradient(ax - 26, 0, ax + 26, 0); g.addColorStop(0, s < 0 ? '#c4706a' : '#a85a55'); g.addColorStop(1, s < 0 ? '#a85a55' : '#8c4642');
    c.fillStyle = g; c.beginPath(); c.roundRect(ax - 26, sitz - 58, 52, 116, 20); c.fill();
    c.fillStyle = '#d3837b'; c.beginPath(); c.ellipse(ax, sitz - 56, 26, 14, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(90,30,30,.35)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(ax, sitz - 56, 15, 8, 0, 0, 7); c.stroke(); }
}
