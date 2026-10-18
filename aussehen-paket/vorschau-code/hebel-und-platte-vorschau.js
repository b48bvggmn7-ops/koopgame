// HEBEL (Look, OHNE Zahl/Buchstabe, nur Farbe + Glanzpunkt) und Hilfsfunktionen der Vorschau
// Vorschau-Code (Vorschau-Seite): Aussehen/Zahlen exakt übernehmen, Anbindung ans Spiel anpassen.

function roundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
const GLANZ = {
  schatten: 0.3,          // Deckkraft des Kontaktschattens in der Mitte
  funkelPeriode: 3400,    // ms zwischen zwei Funkeln desselben Elements
  funkelDauer: 0.11,      // Anteil der Periode, in dem es funkelt
  bandPeriode: 4600,      // ms für einen Durchgang des Glanzstreifens
  bandA: 0.32,            // Deckkraft des Glanzstreifens
};
function glanzSchatten(x, y, rx, ry, a){
  const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
  g.addColorStop(0, `rgba(20,14,8,${a ?? GLANZ.schatten})`); g.addColorStop(1, 'rgba(20,14,8,0)');
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry/rx); ctx.translate(-x, -y);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, Math.PI*2); ctx.fill(); ctx.restore();
}
function glanzFunkeln(x, y, r, seed){
  const P = GLANZ.funkelPeriode, t = (((performance.now() + (seed || 0)*977) % P) + P) % P / P;
  if(t > GLANZ.funkelDauer) return;
  const k = Math.sin(Math.PI*t/GLANZ.funkelDauer), s = r*(0.4 + 0.6*k);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.85*k;
  ctx.fillStyle = '#fffbea';
  ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, s*0.22, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
let hinweisPfeile=0;
function farbeMitAlpha(col, a){
  if(col[0] === '#'){
    const h = col.length === 4 ? col.slice(1).split('').map(c => c + c).join('') : col.slice(1, 7);
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
  }
  if(col.startsWith('hsl(')) return col.replace('hsl(', 'hsla(').replace(')', `,${a})`);
  return col;
}
function elementLeuchten(x, y, radius, col, staerke = 1){
  const puls = 0.7 + 0.3*Math.sin(performance.now()*0.004);
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, farbeMitAlpha(col, 0.9)); g.addColorStop(0.4, farbeMitAlpha(col, 0.45)); g.addColorStop(1, farbeMitAlpha(col, 0));
  ctx.save(); ctx.globalAlpha = 0.5*puls*staerke; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI*2); ctx.fill(); ctx.restore();
}
function hinweisPfeil(x, y, col){
  hinweisPfeile++;
  const t = performance.now()*0.0016;
  ctx.save();
  for(let i = 0; i < 3; i++){
    const a = t + i*Math.PI*2/3;
    const fx = x + Math.cos(a)*16, fy = y + Math.sin(a*2)*5 + Math.sin(a)*4;
    const blink = 0.55 + 0.45*Math.sin(performance.now()*0.006 + i*2.1);
    const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 12);
    g.addColorStop(0, farbeMitAlpha(col, 1)); g.addColorStop(1, farbeMitAlpha(col, 0));
    ctx.globalAlpha = 0.7*blink; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, 12, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = blink; ctx.fillStyle = '#fffbe8'; ctx.beginPath(); ctx.arc(fx, fy, 2.8, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
function elementEdelstein(x, y, r, col){
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r*0.9, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r*0.9, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,22,8,.7)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x - r*0.35, y - r*0.6, r*0.3, r*0.4);
}
function drawCoin3D(x, y, r, ang, pal, alpha, glow, g){
  if(r < 1) return;
  const c = g || ctx;   // g: andere Zeichenfläche (für Tests)
  const cs = Math.cos(ang), face = Math.max(0.12, Math.abs(cs)), rx = r*face;
  const thick = r*0.28*Math.sqrt(1 - face*face) + r*0.04;    // sichtbare Kante, am größten in Seitenansicht
  const side = Math.sin(ang) >= 0 ? 1 : -1;
  c.save(); c.globalAlpha = alpha; c.translate(x, y);
  if(glow){
    const gl = c.createRadialGradient(0, 0, r*0.6, 0, 0, r*1.9);
    gl.addColorStop(0, `rgba(${pal[3]},0.38)`); gl.addColorStop(1, `rgba(${pal[3]},0)`);
    c.fillStyle = gl; c.beginPath(); c.arc(0, 0, r*1.9, 0, Math.PI*2); c.fill();
    c.fillStyle = 'rgba(20,40,20,0.18)';                    // weicher Schatten nach unten rechts
    c.beginPath(); c.ellipse(2.5, 3.5, Math.max(rx, thick) + 1, r, 0, 0, Math.PI*2); c.fill();
  }
  // Kante (Rückseite + Verbindungsstück)
  c.fillStyle = pal[0];
  c.beginPath(); c.ellipse(-side*thick, 0, rx, r, 0, 0, Math.PI*2); c.fill();
  c.fillRect(Math.min(0, -side*thick), -r, thick, r*2);
  c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 1;
  for(let k = -3; k <= 3; k++){ const yy = k*r/4; c.beginPath(); c.moveTo(0, yy); c.lineTo(-side*thick, yy); c.stroke(); }
  // Vorderseite mit Lichtverlauf
  const fg = c.createLinearGradient(-rx, -r, rx, r);
  fg.addColorStop(0, pal[2]); fg.addColorStop(0.45, pal[1]); fg.addColorStop(1, pal[0]);
  c.fillStyle = fg; c.beginPath(); c.ellipse(0, 0, rx, r, 0, 0, Math.PI*2); c.fill();
  c.strokeStyle = 'rgba(40,25,0,0.45)'; c.lineWidth = 1.4; c.stroke();
  // geprägter Innenring (oben dunkel, unten hell = vertieft)
  const ir = r*0.68, irx = rx*0.68;
  if(irx > 1.2){
    c.lineWidth = Math.max(1, r*0.12);
    c.strokeStyle = pal[0]; c.beginPath(); c.ellipse(0, 0, irx, ir, 0, Math.PI, Math.PI*2); c.stroke();
    c.strokeStyle = pal[2]; c.beginPath(); c.ellipse(0, 0, irx, ir, 0, 0, Math.PI); c.stroke();
    // Stern in der Mitte
    if(face > 0.3){
      c.fillStyle = pal[2]; c.beginPath();
      for(let k = 0; k < 10; k++){
        const a = -Math.PI/2 + k*Math.PI/5, rr = (k % 2 ? 0.18 : 0.42)*r;
        c.lineTo(Math.cos(a)*rr*face, Math.sin(a)*rr);
      }
      c.closePath(); c.fill();
      c.strokeStyle = pal[0]; c.lineWidth = 0.8; c.stroke();
    }
  }
  // Glanzlicht
  c.fillStyle = 'rgba(255,255,255,0.75)';
  c.beginPath(); c.ellipse(-rx*0.42, -r*0.48, Math.max(0.6, rx*0.22), r*0.14, -0.6, 0, Math.PI*2); c.fill();
  c.restore();
}
const COIN_DRAW_R=12.5;
const COIN_PAL = {gold:['#d99a00','#ffd23f','#fff4b8','255,190,40'], blue:['#1c6fd1','#4dabf7','#d0ebff','77,171,247'],
                  pink:['#d6336c','#f783ac','#ffe3ef','247,131,172']};

const VW=1500;const linkColor=n=>LINK_COLORS[n]||'#ccc';
const linkOn={1:false,2:true,3:false,4:false};let frameDt=.016,activeCp=1,tNowCp=0;
const switchDefs=GPD.switches.map(o=>({...o})),bouncers=GPD.bouncers.map(o=>({...o,squish:0})),checkpointDefs=GPD.cps.map((o,i)=>({...o,reachedM:i>0,reachedF:i>0,raiseT:i?1:0})),coinsG=GPD.coins.map(o=>({...o}));
function gpDraw(ob,cn){g.save();g.translate(camX,0);tNowCp=performance.now();
 if(ob){
for(const sw of switchDefs){
        const x=sw.x-camX;
        if(x<-30||x>VW+30) continue;
        const anyOpen = !!linkOn[sw.link];   // Hebel steht rechts, solange er eingeschaltet ist
        const col = linkColor(sw.link);
        // Hebel: Sockel am Boden, Stange mit Kugel. Aus = nach links geneigt, an = nach rechts.
        const target = anyOpen ? 1 : 0;
        sw.anim = sw.anim===undefined ? target : sw.anim + (target - sw.anim) * 0.25;
        let ang = -0.6 + sw.anim*1.2;
        if(sw.pulledT){ const k = (performance.now()-sw.pulledT)/260; if(k < 1) ang += Math.sin(k*Math.PI)*0.15; } // kleiner Nachschwung
        const baseY = sw.y + 20;                 // Kästchen-Unterkante = Boden
        const xr = Math.round(x);
        // Auffälliger und passend zur Spielwelt (Nutzerwunsch): Holzstange mit Eisenmanschette und einem Edelstein-Knauf
        // in der Hebel-Farbe (wie die Edelsteine auf den Türen), Steinsockel mit Eisenband; solange er aus ist, leichter
        // Schein und Glühwürmchen darüber
        if(!anyOpen) elementLeuchten(xr, baseY - 26, 44, col);
        glanzSchatten(xr, baseY, 22, 4);   // Design-Politur C: Kontaktschatten
        ctx.save(); ctx.translate(xr, baseY-10); ctx.rotate(ang);
        ctx.strokeStyle = '#3b2412'; ctx.lineWidth = 8; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-25); ctx.stroke();
        const holz = ctx.createLinearGradient(-3, 0, 3, 0);
        holz.addColorStop(0, '#7a4b22'); holz.addColorStop(0.5, '#b47a40'); holz.addColorStop(1, '#6b4019');
        ctx.strokeStyle = holz; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-25); ctx.stroke();
        ctx.fillStyle = '#4a4f57'; ctx.fillRect(-4, -19, 8, 4); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-4, -19, 8, 1.2);
        ctx.fillStyle = '#3b2412'; ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(8.5, -29); ctx.lineTo(0, -21); ctx.lineTo(-8.5, -29); ctx.closePath(); ctx.fill();
        elementEdelstein(0, -29.5, 7.5, col);
        glanzFunkeln(-2.5, -32, 6, sw.x*0.05 + sw.y);   // Design-Politur C: Funkeln am Edelstein-Knauf
        ctx.restore();
        // Steinsockel mit Eisenband, Nummer auf einer Plakette in der Hebel-Farbe
        ctx.fillStyle = 'rgba(0,0,0,.22)'; roundRect(xr-18, baseY-11, 36, 12, 4); ctx.fill();
        const stein = ctx.createLinearGradient(0, baseY-16, 0, baseY);
        stein.addColorStop(0, '#a89c8c'); stein.addColorStop(1, '#6f655a');
        ctx.fillStyle = stein; roundRect(xr-17, baseY-16, 34, 15, 4); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(xr-14, baseY-15.5, 28, 1.3);   // Randlicht oben
        ctx.strokeStyle = '#3b2f25'; ctx.lineWidth = 1.5; roundRect(xr-17, baseY-16, 34, 15, 4); ctx.stroke();
        ctx.fillStyle = '#4a4f57'; ctx.fillRect(xr-17, baseY-10, 34, 4);
        ctx.fillStyle = '#9aa3ad'; for(const rx of [xr-13, xr+13]){ ctx.beginPath(); ctx.arc(rx, baseY-8, 1.4, 0, Math.PI*2); ctx.fill(); }
        const lab = sw.label || String(sw.link); ctx.fillStyle = col; ctx.beginPath(); if(lab.length > 1) ctx.roundRect(xr-11, baseY-14.4, 22, 12.8, 6.4); else ctx.arc(xr, baseY-8, sw.link > 9 ? 7 : 6.2, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(40,22,8,.7)'; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(xr-1.8, baseY-9.8, 1.7, 0, Math.PI*2); ctx.fill();   // nur noch Farbe, kleiner Glanzpunkt
        if(typeof wechselHebelAnzeige === 'function') wechselHebelAnzeige(xr, baseY, sw.link);   // Wechselboden: welche Gruppe fest ist
        if(anyOpen){ ctx.strokeStyle = col; ctx.globalAlpha = 0.4 + 0.25*Math.sin(performance.now()*0.008); ctx.lineWidth = 2.5;
          roundRect(xr-21, baseY-20, 42, 22, 8); ctx.stroke(); ctx.globalAlpha = 1; }
        else hinweisPfeil(xr, baseY - 56, col);
        // Tasten-Hinweis, wenn jemand davor steht
      }

for(const b of bouncers){
        const x = Math.round(b.x - camX);
        if(x < -40 || x > VW + 40) continue;
        b.squish = Math.max(0, b.squish - frameDt*0.004);
        const sq = Math.sin(b.squish*Math.PI)*0.35;
        // Auffälliger und passend zur Spielwelt (Nutzerwunsch): breiter, dicker Sprungpilz in warmem Gold-Orange (hebt sich
        // vom Gras ab, sieht aber nicht aus wie die kleinen roten Deko-Pilze), cremefarbene Tupfen, weicher brauner Rand,
        // federnder Stiel; leichter Schein und Glühwürmchen darüber
        elementLeuchten(x, b.y - 20, 50, '#ffcf6b');
        ctx.save(); ctx.translate(x, b.y); ctx.scale(1 + sq, 1 - sq);
        glanzSchatten(0, -1, 24, 4.5);   // Design-Politur C: weicher Kontaktschatten statt harter Ellipse
        const stiel = ctx.createLinearGradient(-10, 0, 10, 0);
        stiel.addColorStop(0, '#e8d6b8'); stiel.addColorStop(0.5, '#fff6e6'); stiel.addColorStop(1, '#d9c3a0');
        ctx.fillStyle = '#5a3a1e'; roundRect(-11.5, -21, 23, 21, 6); ctx.fill();
        ctx.fillStyle = stiel; roundRect(-10, -20, 20, 19.5, 5); ctx.fill();
        ctx.strokeStyle = 'rgba(120,80,40,.35)'; ctx.lineWidth = 1;
        for(const yy of [-15, -9]){ ctx.beginPath(); ctx.moveTo(-8, yy); ctx.quadraticCurveTo(0, yy + 2, 8, yy); ctx.stroke(); }
        ctx.fillStyle = '#5a3a1e'; ctx.beginPath(); ctx.ellipse(0, -18, 30, 23, 0, Math.PI, Math.PI*2); ctx.closePath(); ctx.fill();
        const hut = ctx.createRadialGradient(-9, -34, 3, 0, -20, 32);
        hut.addColorStop(0, '#ffe39a'); hut.addColorStop(0.55, '#ffad3b'); hut.addColorStop(1, '#e0761f');
        ctx.fillStyle = hut; ctx.beginPath(); ctx.ellipse(0, -19, 28, 21, 0, Math.PI, Math.PI*2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(120,60,10,.35)'; ctx.fillRect(-27, -21, 54, 2.5);   // Hutkante
        ctx.fillStyle = '#fff3d6';
        for(const [dx, dy, r] of [[-15, -26, 4], [0, -34, 4.6], [14, -25, 3.6], [-5, -24, 2.6], [8, -31, 2.2]]){ ctx.beginPath(); ctx.ellipse(dx, dy, r, r*0.85, 0, 0, Math.PI*2); ctx.fill(); }
        // Design-Politur C: feuchter Glanz auf dem Hut + Funkeln
        const glanz = ctx.createRadialGradient(-10, -33, 0, -10, -33, 12);
        glanz.addColorStop(0, 'rgba(255,255,255,.55)'); glanz.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glanz; ctx.beginPath(); ctx.ellipse(-10, -33, 12, 6, -0.35, 0, Math.PI*2); ctx.fill();
        glanzFunkeln(-12, -35, 6, b.x*0.04 + b.y);
        ctx.restore();
        hinweisPfeil(x, b.y - 58, '#ffcf6b');
      }

  // Checkpoint-Fahnen
  for(let i=0;i<checkpointDefs.length;i++){
    const cp = checkpointDefs[i];
    const x = Math.round(cp.x - camX), base = cp.y;
    if(x < -40 || x > VW+60) continue;
    const poleH = 66;
    // Mast + Fuß (Design-Politur C: Kontaktschatten, runder Mast, glänzender Knauf)
    glanzSchatten(x, base, 15, 3.5);
    ctx.fillStyle = '#8a7a66'; roundRect(x-7, base-5, 14, 5, 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(x-6, base-5, 12, 1.2);
    const mast = ctx.createLinearGradient(x-2, 0, x+2, 0); mast.addColorStop(0, '#fffaf0'); mast.addColorStop(1, '#b9ad98');
    ctx.fillStyle = mast; ctx.fillRect(x-2, base-poleH, 4, poleH);
    const knauf = ctx.createRadialGradient(x-1.5, base-poleH-3.5, 0.5, x, base-poleH-2, 4.5);
    knauf.addColorStop(0, '#fff6c8'); knauf.addColorStop(0.5, '#ffcf4d'); knauf.addColorStop(1, '#c48a12');
    ctx.fillStyle = knauf; ctx.beginPath(); ctx.arc(x, base-poleH-2, 4, 0, Math.PI*2); ctx.fill();
    glanzFunkeln(x - 1.5, base-poleH-3.5, 5, cp.x*0.07);
    // Fahne: unten grau, geht hoch, sobald beide vorbei sind
    const raised = i <= activeCp && cp.raiseT;
    let k = raised ? Math.min(1, (tNowCp - (tNowCp-2000))/700) : 0;
    k = 1 - Math.pow(1-k, 3);
    const fy = base - 20 - k*(poleH-22);
    const wave = Math.sin(tNowCp*0.006 + i)*3*(raised?1:0.3);
    ctx.fillStyle = raised ? '#ff7a59' : '#c9c3b8';
    ctx.beginPath();
    ctx.moveTo(x+2, fy);
    ctx.quadraticCurveTo(x+16, fy-3+wave, x+28, fy+7+wave*0.5);
    ctx.quadraticCurveTo(x+16, fy+13+wave, x+2, fy+16);
    ctx.closePath(); ctx.fill();
    if(raised){ ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(x+12, fy+7+wave*0.4, 3, 0, Math.PI*2); ctx.fill(); }
    // Punkte: wer ist schon vorbei (braun = Affe, rosa = Schweinchen)
    if(!raised){
      ctx.fillStyle = cp.reachedM ? '#9b6340' : 'rgba(0,0,0,.15)';
      ctx.beginPath(); ctx.arc(x-8, base-11, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = cp.reachedF ? '#f48cab' : 'rgba(0,0,0,.15)';
      ctx.beginPath(); ctx.arc(x+8, base-11, 3.5, 0, Math.PI*2); ctx.fill();
    }
  }


 }
 if(cn){const coins=coinsG;
  // Münzen: drehen sich (Breite pulsiert), eingesammelte hüpfen hoch und blenden aus
  const tNow = performance.now();
  for(const c of coins){
    let x = c.x-camX;
    if(x<-30||x>VW+30) continue;
    if(c.nudgeT && !c.taken){ const a = tNow - c.nudgeT; if(a < 380) x += Math.sin(a*0.07) * 4 * (1 - a/380); }
    const pal = COIN_PAL[c.color] || COIN_PAL.gold;
    let lift, alpha = 1, scale = 1, ang;
    if(c.taken){
      const k = Math.min(1, (tNow - (c.takenAt||tNow)) / 420);
      if(k >= 1) continue;
      lift = 46 * (1 - Math.pow(1-k, 3));                 // schnellt hoch, bremst ab
      scale = k < 0.35 ? 1 + k/0.35*0.5 : 1.5 * (1 - (k-0.35)/0.65);  // wächst kurz, schrumpft weg
      alpha = k < 0.6 ? 1 : 1 - (k-0.6)/0.4;
      ang = tNow*0.03 + c.x;                               // schnelle Drehung
    } else {
      lift = Math.sin(tNow*0.003 + c.x*0.02)*2.5;
      ang = tNow*0.004 + c.x*0.013;
    }
    drawCoin3D(x, c.y - lift, COIN_DRAW_R*scale, ang, pal, alpha, !c.taken);
    if(!c.taken) glanzFunkeln(x - 4, c.y - lift - 5, 6, c.x*0.13 + c.y*0.07);   // Design-Politur C
    if(!c.taken && c.klasse === 'meister') muenzeMeisterZeichnen(x, c.y - lift, tNow, c.x);   // Nacht-Ausbau: Meister-Münze funkelt
  }


 }
 g.restore()}
