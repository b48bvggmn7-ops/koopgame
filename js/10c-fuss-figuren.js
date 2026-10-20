// 10c-fuss-figuren.js – VORSCHAU: Affe und Schweinchen mit Armen und Stummelfüßen statt rollender Kugel.
// Ändert nur das Zeichnen (Physik, Hitbox und Tempo sind die echten Spielwerte). Taste B: zwischen Kugel und Füßen wechseln.
let NEUE_FIGUREN = true;
const ROLL_ZEIT = 0.6, IDLE_START = 15;   // Sekunden für die Rolle im Sprung bzw. bis zur Langeweile
const KANTE_TAKT = 0.9;   // Sekunden je Wackeln an der Kante (kantePose)
function neueFigurenAn(){ return NEUE_FIGUREN; }

(function(){
  const PI = Math.PI, U = 0.65;                       // 1 Zeicheneinheit = 0,65 Spielpixel
  const ease = x => x*x*(3-2*x), clamp = (x,a,b) => Math.max(a, Math.min(b, x));
  const A = {back:[-2,-30,-14,-26,-22,-18], backlow:[0,-30,-10,-24,-14,-16], fwd:[8,-28,22,-24,30,-32], fwdlow:[8,-28,20,-24,26,-22],
             downf:[6,-30,8,-22,8,-14], downb:[0,-30,-2,-22,-2,-14]};
  const mixArr = (a,b,f) => a.map((v,i) => v + (b[i]-v)*f);
  function mixPose(a,b,f){
    const o = {dy:a.dy+(b.dy-a.dy)*f, lean:a.lean+(b.lean-a.lean)*f, hs:mixArr(a.hs||[1,1], b.hs||[1,1], f), fs:(a.fs||1)+((b.fs||1)-(a.fs||1))*f,
      ar:(a.ar===undefined?1:a.ar)+((b.ar===undefined?1:b.ar)-(a.ar===undefined?1:a.ar))*f, lp:mixArr(a.lp||[0,-20], b.lp||[0,-20], f)};   // ar = Sichtbarkeit der Arme, lp = Drehpunkt
    ['nf','ff','na','fa'].forEach(k => o[k] = mixArr(a[k], b[k], f)); return o;
  }
  const copy = p => mixPose(p, p, 0);
  function kf(list, t){
    if(t <= list[0][0]) return copy(list[0][1]);
    for(let i=0; i<list.length-1; i++){ const t0 = list[i][0], t1 = list[i+1][0];
      if(t <= t1) return mixPose(list[i][1], list[i+1][1], ease((t-t0)/(t1-t0))); }
    return copy(list[list.length-1][1]);
  }
  // ---- Posen (Zeicheneinheiten, Boden y=0, Blick nach rechts) ----
  const SF = 1.43;
  const R8 = [
    {dy:7,nf:[20,-9,-8],ff:[-20,-15,18],na:A.back,fa:A.fwd},{dy:10,nf:[12,-9,0],ff:[-6,-22,10],na:A.backlow,fa:A.fwdlow},
    {dy:6,nf:[0,-9,0],ff:[2,-12,0],na:A.downf,fa:A.downb},{dy:2,nf:[-16,-14,15],ff:[16,-16,-5],na:A.fwdlow,fa:A.backlow},
    {dy:7,nf:[-20,-15,18],ff:[20,-9,-8],na:A.fwd,fa:A.back},{dy:10,nf:[-6,-22,10],ff:[12,-9,0],na:A.fwdlow,fa:A.backlow},
    {dy:6,nf:[2,-12,0],ff:[0,-9,0],na:A.downb,fa:A.downf},{dy:2,nf:[16,-16,-5],ff:[-16,-14,15],na:A.backlow,fa:A.fwdlow}];
  function runPose(t){
    const i = Math.floor(t)%8, j = (i+1)%8; let f = t-Math.floor(t); f = f*0.5 + 0.5*(1-Math.cos(f*PI))/2;
    const a = R8[i], b = R8[j];
    const nf = mixArr(a.nf,b.nf,f), ff = mixArr(a.ff,b.ff,f), na = mixArr(a.na,b.na,f), fa = mixArr(a.fa,b.fa,f);
    nf[0] *= SF; ff[0] *= SF; const k = 1+0.6*(SF-1); [na,fa].forEach(r => { r[2] *= k; r[4] *= k; });
    return {dy:a.dy+(b.dy-a.dy)*f, lean:5, hs:[1,1], nf, ff, na, fa};
  }
  // Stehen (nach Nutzer-Skizze): Kopf sitzt auf dem Boden, nur EIN Fuß vorn sichtbar, Hinterfuß hinter dem Kopf versteckt, keine Arme
  const idleP = t => ({dy:15+1.2*Math.sin(t*3), lean:0, ar:0, nf:[5,-8,0], ff:[2,-13,0], na:A.downf, fa:A.downb});
  const UP   = {dy:2,lean:6,nf:[-8,-20,14],ff:[10,-17,-8],na:[-2,-30,-10,-42,-14,-50],fa:[8,-30,22,-42,28,-52]};
  const DOWN = {dy:4,lean:3,nf:[6,-13,-10],ff:[-8,-15,8],na:[0,-30,-14,-32,-24,-30],fa:[8,-28,24,-32,32,-30]};
  const SKID = {dy:9,lean:-8,nf:[20,-9,-10],ff:[6,-9,0],na:[0,-30,-12,-28,-16,-22],fa:[8,-28,22,-26,30,-30]};
  const AIR  = {dy:2,lean:0,nf:[4,-18,12],ff:[-8,-16,-8],na:[8,-40,20,-60,26,-76],fa:[0,-40,-10,-58,-14,-74]};
  const L1 = {dy:12,ar:0,lean:0,hs:[0.98,1.03],nf:[12,-9,-2],ff:[-10,-9,2],na:[6,-34,16,-44,22,-54],fa:[-2,-34,-10,-44,-14,-52]};
  const L2 = {dy:17.5,ar:0,lean:1,hs:[1.05,0.93],nf:[18,-9,0],ff:[-16,-9,0],na:[8,-30,22,-30,32,-26],fa:[-4,-30,-16,-30,-26,-26]};
  const L3 = {dy:16,ar:0,lean:2,hs:[1,1.01],nf:[12,-9,0],ff:[-10,-9,0],na:A.downf,fa:A.downb};
  const WJ  = {dy:0,lean:14,nf:[-41,-38,90],ff:[-39,-18,80],na:[8,-44,26,-62,42,-76],fa:[4,-46,16,-70,28,-92]};
  const WJA = {dy:2,lean:8,nf:[6,-22,10],ff:[-6,-20,-6],na:[8,-44,26,-66,38,-84],fa:[4,-46,16,-72,26,-92]};
  const DS  = {dy:0,lean:26,nf:[-30,-30,-35],ff:[-22,-14,-30],na:[14,-44,34,-50,52,-52],fa:[10,-48,30,-58,46,-62]};
  const GLP = {dy:5,lean:-4,nf:[8,-14,14],ff:[-10,-12,-8],na:[10,-48,26,-70,24,-96],fa:[4,-50,16,-76,24,-98]};
  const RPP = {dy:2,lean:-6,nf:[2,-16,8],ff:[-10,-14,-10],na:[28,-52,36,-76,24,-96],fa:[12,-52,16,-78,20,-95]};
  // Wandrutschen (nach Nutzer-Skizze 2): Kopf ~42° nach oben gekippt, Schnauze/Gesicht zur Wand, EIN Fuß flach an der Wand,
  // ein kurzer Arm vorn nach oben zur Wand; zweiter Arm und Hinterfuß hinter dem Kopf versteckt
  function wsPose(t){ const w = 2*PI*t/1.2;
    return {dy:12+1.0*Math.sin(w*1.3), lean:-42, lp:[4,-50], nf:[29,-14.3+1.5*Math.sin(w+1),-90], ff:[12,-30,-90],
            na:[38.8,-59.6,45.5,-60.9,51.7+2*Math.sin(w),-63.5], fa:[4,-46,6,-44,8,-42]}; }
  // Fast runterfallen (Nutzerwunsch): steht die Figur an einer Kante, ruht sie auf dem hinteren Fuß, der vordere Fuß hängt
  // über dem Abgrund, der Körper kippt vor und zurück und beide Arme kreisen wie Windmühlen (Blick zum Abgrund)
  function kantePose(t){
    const w = 2*PI*t/KANTE_TAKT, sw = Math.sin(w);
    // Hand kreist über/neben dem Kopf (sonst verschwindet der Arm hinter dem großen Kopf)
    const muehle = (sx, sy, mx, my, ph, r) => { const a = w*1.7 + ph, hx = mx + r*Math.cos(a), hy = my + r*Math.sin(a);
      return [sx, sy, (sx + hx)/2 + 6, (sy + hy)/2 - 4, hx, hy]; };
    return {dy:6 + 1.5*Math.sin(w*2), lean:12 + 10*sw, nf:[42, -16 + 5*sw, -35 + 20*sw], ff:[-8, -9, 0],
            na:muehle(34, -42, 47, -62, 0, 9), fa:muehle(-22, -62, -29, -82, PI, 8)};
  }
  function hangPose(hp){
    const ph = 2*PI*hp/72.8;
    const hand = (phs,bx) => { const s = (((ph+phs)%(2*PI))+2*PI)%(2*PI);
      if(s < PI) return [bx+28-56*(s/PI), -98]; const w = (s-PI)/PI; return [bx-28+56*ease(w), -98+14*Math.sin(PI*w)]; };
    const nh = hand(0,22), fh = hand(PI,0), sn = Math.sin(ph);
    return {dy:6, lean:0, nf:[6,-14,10+8*sn], ff:[-8,-16,-8-8*sn],
            na:[26,-52,(26+nh[0])/2-4,(-52+nh[1])/2,nh[0],nh[1]], fa:[8,-52,(8+fh[0])/2-4,(-52+fh[1])/2,fh[0],fh[1]]};
  }
  // ---- Zeichnen auf die Leinwand ----
  const PM = {tail:new Path2D('M-26 -30 C-50 -26 -54 -54 -42 -62'), tailC:'#9a6340', tailW:7, farArm:'#7d5030', nearArm:'#9a6340', hand:'#f5d6b0',
              nf:{f:'#8a5636',s:'#6f4528',t:'#a87049'}, ff:{f:'#7d5030',s:'#62401f',t:'#946040'}};
  const PP = {tail:new Path2D('M-28 -26 C-38 -28 -40 -38 -32 -38 C-26 -38 -28 -30 -33 -32'), tailC:'#f7a5bf', tailW:3, farArm:'#e87ea1', nearArm:'#ee86a8', hand:'#f7a5bf',
              nf:{f:'#ee86a8',s:'#d9709a',t:'#f9b8cf'}, ff:{f:'#e87ea1',s:'#cf6a92',t:'#f4a6c2'}};
  const UMB = new Path2D('M-38 -122 Q24 -182 86 -122 Q70 -131 55 -122 Q40 -131 24 -122 Q8 -131 -7 -122 Q-22 -131 -38 -122Z');
  const MOUTH = new Path2D('M18 -36 Q26 -33 32 -38');
  function ell(c,x,y,rx,ry,fill,stroke,sw,alpha){
    c.beginPath(); c.ellipse(x,y,rx,ry,0,0,PI*2);
    if(alpha !== undefined) c.globalAlpha = alpha; c.fillStyle = fill; c.fill();
    if(stroke){ c.lineWidth = sw; c.strokeStyle = stroke; c.stroke(); } c.globalAlpha = 1;
  }
  function poly(c,pts,fill){ c.beginPath(); c.moveTo(pts[0],pts[1]); for(let i=2;i<pts.length;i+=2) c.lineTo(pts[i],pts[i+1]); c.closePath(); c.fillStyle = fill; c.fill(); }
  function arm(c,a,col,w,hand,hr){
    c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.lineWidth = w;
    c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(a[2],a[3]); c.lineTo(a[4],a[5]); c.stroke();
    ell(c,a[4],a[5],hr,hr,hand);
  }
  function foot(c,f,col,fs){
    c.save(); c.translate(f[0],f[1]); c.rotate(f[2]*PI/180); if(fs && fs !== 1) c.scale(fs,fs);
    ell(c,0,0,15,9,col.f,col.s,1.2); ell(c,0,6,11,3,col.s); ell(c,13,0,3.5,3.5,col.t); c.restore();
  }
  function head(c,male,blink){
    if(male){
      ell(c,0,-86,9,6,'#9a6340'); ell(c,4,-50,34,34,'#9a6340'); ell(c,-8,-52,10,10,'#8a5636'); ell(c,-8,-52,6,6,'#f4a8a0');
      ell(c,14,-46,20,22,'#f5d6b0'); ell(c,20,-54,5,blink?1:6.5,'#2b1d18');
      if(!blink) ell(c,21.5,-57,1.7,1.7,'#fff');
      ell(c,14,-40,6,4.5,'#f4a08c'); ell(c,31,-45,1.4,1.4,'#6b4a35');
      c.lineWidth = 1.6; c.strokeStyle = '#6b4a35'; c.lineCap = 'round'; c.stroke(MOUTH);
    } else {
      poly(c,[-6,-74,-10,-92,12,-80],'#ee86a8'); poly(c,[-3,-76,-6,-86,7,-79],'#f7a5bf');
      ell(c,4,-50,34,33,'#f7a5bf','#ee86a8',3); ell(c,37,-44,8,11,'#ee86a8'); ell(c,41,-44,2,4.5,'#b8456c');
      ell(c,22,-56,5,blink?1:5,'#2b1d18'); if(!blink) ell(c,23.5,-58,1.7,1.7,'#fff');
      ell(c,14,-40,7,5,'#f58fb0',null,0,0.7);
    }
  }
  // Cosmetics im Gesicht (Brille/Tattoo, js/27): Seitenansicht = ein Glas am sichtbaren Auge + Bügel, Vorderansicht = beide Gläser + Tattoo
  function gesichtZeug(c, male, front, a){
    const wear = typeof cosItemsOf === 'function' ? cosItemsOf(male ? 'm' : 'f') : null;
    if(!wear || (!wear.glasses && !wear.tattoo) || a <= 0.02) return;
    c.save(); c.globalAlpha = a;
    if(front){
      if(wear.tattoo && typeof drawTattoo === 'function' && typeof FACE_SPOTS !== 'undefined'){
        const face = male ? 'monkey' : 'pig', F = FACE_SPOTS[face], sx = 68/F.head[2];
        drawTattoo(c, wear.tattoo.fx.kind, face, {x: 4 - F.head[0]*sx, y: -50 - F.head[1]*sx, w: 308*sx, h: 257*sx});
      }
      if(wear.glasses && typeof drawGlasses === 'function'){ const d = male ? 8 : 12, y = male ? -54 : -56;
        drawGlasses(c, wear.glasses.fx.kind, [4-d, y], [4+d, y], male ? 6.6 : 7.4, male ? 7.6 : 7.4); }
    } else if(wear.glasses && typeof drawGlasses === 'function'){
      const ex = male ? 20 : 22, ey = male ? -54 : -56, w = 7.2, h = 7.6;
      drawGlasses(c, wear.glasses.fx.kind, [ex, ey], [ex + 0.01, ey], w, h);
    }
    c.restore();
  }
  function figure(c,male,p,blink){
    const B = male ? PM : PP, hs = p.hs || [1,1];
    foot(c,p.ff,B.ff,p.fs); // Hinterfuß: HINTER dem Körper
    c.save();
    c.translate(0,p.dy); c.translate(0,-16); c.scale(hs[0],hs[1]); c.translate(0,16);
    const lp = p.lp || [0,-20]; c.translate(lp[0],lp[1]); c.rotate(p.lean*PI/180); c.translate(-lp[0],-lp[1]);
    c.lineCap = 'round'; c.strokeStyle = B.tailC; c.lineWidth = B.tailW; c.stroke(B.tail);
    const ar = p.ar === undefined ? 1 : p.ar;
    if(ar > 0.02){ c.globalAlpha = ar; arm(c,p.fa,B.farArm,6,B.hand,4.5); c.globalAlpha = 1; }
    head(c,male,blink); gesichtZeug(c, male, false, 1);
    if(ar > 0.02){ c.globalAlpha = ar; arm(c,p.na,B.nearArm,7,B.hand,5); c.globalAlpha = 1; }
    c.restore();
    foot(c,p.nf,B.nf,p.fs);
  }
  // Original-Schirm des Spiels (wie drawUmbrella in 10-figuren-zeichnen.js): Kuppel mit Bogenkante, Streifen, Speichen, Stock mit gebogenem Griff.
  // (x,y) = Hand (Spielpixel), der Schirm bleibt immer senkrecht (nur `tilt` in Grad kippt ihn), u = Öffnung 0..1
  function schirmZeichnen(c, x, y, tilt, u, alpha){
    const R = 36, ry = 22, stick = 30, N = 6, rim = i => -R + (2*R*i)/N;
    c.save(); c.translate(x, y + 6); c.rotate(tilt*PI/180); c.globalAlpha = alpha === undefined ? 1 : alpha;   // zu: schmal zusammengefaltet, bleibt sichtbar
    c.strokeStyle = '#7a4a2e'; c.lineWidth = 2.6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -stick); c.lineTo(0, 0); c.arc(-4, 0, 4, 0, PI*0.9); c.stroke();
    c.translate(0, -stick); c.scale(0.13 + 0.87*u, 0.8 + 0.2*u);
    const canopy = () => { c.beginPath(); c.moveTo(-R, 0); c.ellipse(0, 0, R, ry, 0, PI, 2*PI);
      for(let i=N; i>0; i--){ const x0 = rim(i), x1 = rim(i-1); c.quadraticCurveTo((x0+x1)/2, -ry*0.2, x1, 0); } c.closePath(); };
    c.save(); canopy(); c.clip();
    const gr = c.createLinearGradient(0, -ry, 0, 2); gr.addColorStop(0, '#ffb3d0'); gr.addColorStop(1, '#f06b9f');
    c.fillStyle = gr; c.fillRect(-R-2, -ry-2, 2*R+4, ry+6);
    c.fillStyle = 'rgba(255,248,250,.85)';
    for(let i=0; i<N; i+=2){ c.beginPath(); c.moveTo(0, -ry-1); c.lineTo(rim(i), 1); c.lineTo(rim(i+1), 1); c.closePath(); c.fill(); }
    c.strokeStyle = 'rgba(170,60,105,.45)'; c.lineWidth = 1;
    for(let i=1; i<N; i++){ c.beginPath(); c.moveTo(0, -ry); c.quadraticCurveTo(rim(i)*0.75, -ry*0.75, rim(i), 0); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-R*0.38, -ry*0.62, R*0.28, ry*0.16, -0.35, 0, 2*PI); c.fill();
    c.restore();
    canopy(); c.strokeStyle = '#c94d82'; c.lineWidth = 1.6; c.stroke();
    c.fillStyle = '#c94d82'; for(let i=0; i<=N; i++){ c.beginPath(); c.arc(rim(i), 0, 1.6, 0, 2*PI); c.fill(); }
    c.beginPath(); c.arc(0, -ry-2.5, 3, 0, 2*PI); c.fill();
    c.restore();
  }
  // ---- Langeweile-Antics (Vorderansicht; Koordinaten wie die Pose, Kopfmitte x=4; links = nah, rechts = fern) ----
  const FX = 4, sn = Math.sin;
  const frBase = (o) => Object.assign({dy:15, lean:0, na:[FX-26,-32,FX-32,-24,FX-33,-16], fa:[FX+26,-32,FX+32,-24,FX+33,-16], nf:[FX-10,-8,0], ff:[FX+10,-8,0]}, o);
  function mixFr(a,b,f){ return {dy:a.dy+(b.dy-a.dy)*f, lean:a.lean+(b.lean-a.lean)*f, na:mixArr(a.na,b.na,f), fa:mixArr(a.fa,b.fa,f), nf:mixArr(a.nf,b.nf,f), ff:mixArr(a.ff,b.ff,f)}; }
  const ANTICS = [
    {who:'m', dur:4.2, pose:t => { const w = t*2*PI*1.6, s = sn(w);          // Disco: Arme abwechselnd hoch, Füße stampfen, Kopf wippt
      return frBase({dy:15-3*Math.abs(s), lean:8*s, na:[FX-26,-32,FX-36,-48-8*s,FX-34,-64-12*s], fa:[FX+26,-32,FX+36,-48+8*s,FX+34,-64+12*s],
        nf:[FX-10,-8-Math.max(0,s)*5,0], ff:[FX+10,-8-Math.max(0,-s)*5,0]}); }},
    {who:'m', dur:3.6, pose:t => { const h = Math.max(0,sn(t*2*PI*1.3))*14, fl = sn(t*2*PI*5)*3;   // Hüpfen mit Armen oben
      return frBase({dy:15-h, na:[FX-26,-32,FX-34,-48,FX-36,-64+fl], fa:[FX+26,-32,FX+34,-48,FX+36,-64-fl], nf:[FX-10,-8-h,0], ff:[FX+10,-8-h,0]}); }},
    {who:'f', dur:4.0, pose:t => { const w = t*2*PI*1.1, s = sn(w);            // Hin- und herwackeln
      return frBase({dy:15+1.5*Math.abs(s), lean:15*s, na:[FX-26,-32,FX-32,-24,FX-33+6*sn(w+1),-16], fa:[FX+26,-32,FX+32,-24,FX+33+6*sn(w+1),-16]}); }},
    {who:'m', dur:3.2, pose:t => { const u = clamp((t-0.4)/0.9,0,1), h = sn(PI*u)*20;                    // Salto: kurz in die Hocke, Sprung mit voller Drehung
        return frBase({dy:15-h+(t<0.4?3*sn(PI*t/0.4):0), na:[FX-26,-32,FX-34,-46,FX-32,-60], fa:[FX+26,-32,FX+34,-46,FX+32,-60], nf:[FX-10,-8-h,0], ff:[FX+10,-8-h,0]}); },
      rot:t => -2*PI*ease(clamp((t-0.4)/0.9,0,1))},
    {who:'m', dur:4.0, pose:t => { const b = 0.5+0.5*sn(t*2*PI*3.0), x = 3+14*b;                      // Affe: klatscht über dem Kopf in die Hände
      return frBase({dy:15-2*Math.abs(sn(t*2*PI*1.5)), lean:2*sn(t*2*PI*1.5), na:[FX-26,-32,FX-38,-66,FX-x,-94], fa:[FX+26,-32,FX+38,-66,FX+x,-94]}); }},
    {who:'m', dur:3.6, pose:t => { const k = sn(t*2*PI*4);                                              // Affe: kratzt sich am Kopf
      return frBase({dy:15+1.0*sn(t*3), lean:4+2*k, na:[FX-26,-32,FX-34,-62,FX-20+5*k,-84+2*k]}); }},
    {who:'f', dur:3.6, pose:t => { const d = 0.5-0.5*Math.cos(t*2*PI*0.8);                              // Schwein: Knicks, Arme zum Rock
      return frBase({dy:15+5*d, lean:3*d, na:[FX-26,-32,FX-40,-26,FX-46,-20], fa:[FX+26,-32,FX+40,-26,FX+46,-20], nf:[FX-10,-8,0], ff:[FX+10,-8,0]}); }},
    {who:'f', dur:4.0, pose:t => { const b = sn(t*2*PI*2.4);                                             // Schwein: tippelt von Fuß zu Fuß, Hände wippen
      return frBase({dy:15-1.5*Math.abs(b), lean:7*b, na:[FX-26,-32,FX-36,-34+3*b,FX-38,-24+6*b], fa:[FX+26,-32,FX+36,-34-3*b,FX+38,-24-6*b],
        nf:[FX-10,-8-Math.max(0,b)*6,0], ff:[FX+10,-8-Math.max(0,-b)*6,0]}); }},
    {who:'f', umb:true, dur:6.0, pose:t => { const b = sn(t*2*PI*0.9);                               // Schwein: spielt mit dem Schirm (dreht ihn, wippt dazu)
      return frBase({dy:15+1.2*Math.abs(b), lean:3*b, na:[FX-26,-32,FX-34,-52,FX-32,-70+2*b], fa:[FX+26,-32,FX+34,-30,FX+36,-22]}); }},
    {who:'f', umb:true, dur:7.0, pose:(t, ml, dur) => { const e = clamp((t-((dur||7)-1.6))/0.6,0,1);                                                          // Schwein: öffnet den Schirm, eine Böe hebt es fast ab, dann klappt es ihn wieder zu
      const g = Math.pow(sn(PI*clamp((t-2.0)/2.2,0,1)), 2), sw = sn(t*2*PI*0.8);
      return frBase({dy:15-19*g+0.8*sw*(1-g), lean:14*g+2*sw*(1-g), na:[FX-26,-32,FX-31+8*e,-58+30*e,FX-28+(-5)*e,-80+4*g+62*e], fa:[FX+26,-32,FX+36+6*g,-36+10*g,FX+44+8*sn(t*14)*g,-30+16*g],
        nf:[FX-10,-8-12*g,0], ff:[FX+10,-8-16*g,0]}); },
      tilt:t => { const g = Math.pow(sn(PI*clamp((t-2.0)/2.2,0,1)), 2); return 8*sn(t*2*PI*0.8)*(1-g) + 48*g; }, gust:t => Math.pow(sn(PI*clamp((t-2.0)/2.2,0,1)), 2)},
    {who:'m', rope:true, dur:6.5, pose:t => { const th = t*2*PI*1.25, h = 15*Math.pow(Math.max(0, Math.cos(th - PI + 0.5)), 3);      // Affe: Seilspringen mit einer Liane
      return frBase({dy:15-h, lean:2*sn(th), na:[FX-26,-32,FX-36,-38,FX-39,-42+2*sn(th)], fa:[FX+26,-32,FX+36,-38,FX+39,-42-2*sn(th)], nf:[FX-10,-8-h,0], ff:[FX+10,-8-h,0]}); },
      rope:t => t*2*PI*1.25},
  ];
  // ---- Seitendrehung in 3D: Drehung um die Hochachse. Der Kopf bleibt eine runde Kugel, Gesicht/Ohren/Füße/Arme wandern um sie herum ----
  function figureSpin(c,male,p,blink,th){
    const B = male ? PM : PP, hs = p.hs || [1,1], ar = p.ar === undefined ? 1 : p.ar;
    const R = 34, cx = 4, cy = -50, ct = Math.cos(th), st = Math.sin(th);
    const dd = ((th+PI/2) % (2*PI) + 3*PI) % (2*PI) - PI, fw = clamp(1-Math.abs(dd)/0.45, 0, 1), FA = 1-fw;   // fw: wie genau die Figur von vorn zu sehen ist
    const items = [], add = (k,grp,fn) => items.push({k,grp,fn});
    const sp = (x,y,zs) => { const dx = x-cx, dy = y-cy, z = zs*Math.sqrt(Math.max(0,R*R-dx*dx-dy*dy)); return [cx+dx*ct+z*st, y, -dx*st+z*ct]; };
    const ellPts = (x,y,rx,ry) => { const o = []; for(let i=0;i<20;i++){ const a = i/20*2*PI; o.push([x+rx*Math.cos(a), y+ry*Math.sin(a)]); } return o; };
    function surf(pts,zs){                                  // Punkte auf der Kugeloberfläche drehen, verdeckte an den Rand klemmen
      const q = pts.map(a => sp(a[0],a[1],zs)); if(!q.some(a => a[2] > 0.5)) return null;
      return q.map(a => { if(a[2] >= 0) return [a[0],a[1]]; const w = Math.sqrt(Math.max(0,R*R-(a[1]-cy)*(a[1]-cy))); return [cx+(a[0] >= cx ? w : -w), a[1]]; });
    }
    const poly2 = (c,q,fill,alpha) => { c.beginPath(); q.forEach((a,i) => i ? c.lineTo(a[0],a[1]) : c.moveTo(a[0],a[1])); c.closePath();
      c.globalAlpha = (alpha === undefined ? 1 : alpha)*FA; c.fillStyle = fill; c.fill(); c.globalAlpha = 1; };
    const surfEll = (k,x,y,rx,ry,fill,alpha) => [1,-1].forEach(zs => { const q = surf(ellPts(x,y,rx,ry),zs); if(q) add(k,true,c => poly2(c,q,fill,alpha)); });
    const ellG = (c,x,y,rx,ry,fill,stroke,sw,alpha) => ell(c,x,y,Math.max(0.3,rx),ry,fill,stroke,sw,alpha);
    const side = (z,k) => (z > 0 ? 200 : -100) + z*0.01 + (k||0);
    // Kopfkugel
    if(male) add(0,true,c => ell(c,4,-50,34,34,'#9a6340')); else add(0,true,c => ell(c,4,-50,34,33,'#f7a5bf','#ee86a8',3));
    if(male){
      add(-1,true,c => ellG(c,cx-4*ct,-86,9,6,'#9a6340'));
      [1,-1].forEach(zs => { const z0 = zs*31.8, x = cx-12*ct+z0*st, z = 12*st+z0*ct, k0 = Math.max(0.25,Math.abs(ct)), k = k0+(1-k0)*fw;
        add((z > 0 || fw > 0.3 ? 50 : -60)+z*0.01,true,c => { ellG(c,x,-52,10*k,10,'#8a5636'); ellG(c,x,-52,6*k,6,'#f4a8a0'); }); });
      surfEll(100,14,-46,20,22,'#f5d6b0');
      if(st < 0) add(100,true,c => ellG(c,cx+26*ct,-46,15*Math.abs(st),20,'#f5d6b0',null,0,FA));
      surfEll(102,20,-54,5,blink?1:6.5,'#2b1d18'); if(!blink) surfEll(103,21.5,-57,1.7,1.7,'#fff');
      surfEll(101,14,-40,6,4.5,'#f4a08c'); surfEll(104,31,-45,1.4,1.4,'#6b4a35');
      const mp = []; for(let i=0;i<=8;i++){ const u = i/8; mp.push([(1-u)*(1-u)*18+2*u*(1-u)*26+u*u*32, (1-u)*(1-u)*-36+2*u*(1-u)*-33+u*u*-38]); }
      [1,-1].forEach(zs => { const q = mp.map(a => sp(a[0],a[1],zs)); if(!q.some(a => a[2] > 0.5)) return;
        add(104,true,c => { c.globalAlpha = FA; c.lineWidth = 1.6; c.strokeStyle = '#6b4a35'; c.lineCap = 'round'; c.beginPath(); let on = false;
          q.forEach(a => { if(a[2] > 0.5){ on ? c.lineTo(a[0],a[1]) : c.moveTo(a[0],a[1]); on = true; } else on = false; }); c.stroke(); c.globalAlpha = 1; }); });
    } else {
      [1,-1].forEach(zs => {                               // Ohr = Dreieck im Raum: Fuß (zwei Punkte) auf dem Kopf, Spitze oben/leicht außen
        const P3 = [[-6,-74,13],[-10,-92,22],[12,-80,31]], I3 = [[-3,-76,15],[-6,-86,22],[7,-79,29]];
        const proj = q => [cx+(q[0]-cx)*ct+zs*q[2]*st, q[1], -(q[0]-cx)*st+zs*q[2]*ct];
        const o = P3.map(proj), n = I3.map(proj), zc = (o[0][2]+o[1][2]+o[2][2])/3;
        add(-50+zc*0.01,true,c => { poly(c,o.map(q => [q[0],q[1]]).flat(),'#ee86a8'); poly(c,n.map(q => [q[0],q[1]]).flat(),'#f7a5bf'); }); });
      // Augen und Wangen wandern beim Drehen weich an die Vorderansicht-Plätze (kein Überblenden -> kein Doppelbild)
      const g = ease(clamp(1-Math.abs(dd)/0.9, 0, 1));
      [1,-1].forEach(zs => {
        const e = sp(22,-56,zs), b = sp(14,-40,zs);
        if(e[2] > 0.5){ const kk = clamp(e[2]/27,0.35,1), rx = 5*(kk+(1-kk)*g), ex = e[0]+g*((cx-zs*12)-e[0]), ey = e[1]+g*(-56-e[1]);
          add(102,true,c => { ell(c,ex,ey,rx,blink?1:5,'#2b1d18'); if(!blink) ell(c,ex+1.5*kk,ey-2,1.7*(0.6+0.4*kk),1.7,'#fff'); }); }
        if(b[2] > 0.5){ const kb = clamp(b[2]/27,0.35,1), bx = b[0]+g*((cx-zs*18)-b[0]), by = b[1]+g*(-42-b[1]);
          add(101,true,c => ell(c,bx,by,7*(kb+(1-kb)*g),5,'#f58fb0',null,0,0.7)); }
      });
      const sz = -33*st;                                    // Schnauze auf der Mittellinie vorn
      if(sz > -6){ const sx0 = cx+33*ct, rx = Math.sqrt(Math.pow(8*ct,2)+Math.pow(11*st,2));
        add(110,true,c => ell(c,sx0,-44,rx,11,'#ee86a8'));
        [1,-1].forEach(zs => add(111,true,c => ell(c,cx+37*ct+zs*3.5*st,-44,2,4.5,'#b8456c'))); }
    }
    if(fw > 0.02 && male){                                  // eigene Vorderansicht (Affe) des Gesichts (sauberer als die gedrehte Seitenansicht)
      add(105,true,c => {
        if(male){
          [[-8,-52,12,11],[8,-52,12,11],[0,-40,16,14]].forEach(a => ell(c,cx+a[0],a[1],a[2],a[3],'#f5d6b0',null,0,fw));
          [-8,8].forEach(d => { ell(c,cx+d,-54,4.5,blink?1:6.2,'#2b1d18',null,0,fw); if(!blink) ell(c,cx+d+1.2,-57,1.6,1.6,'#fff',null,0,fw);
            ell(c,cx+d*1.75,-37,4.5,3.5,'#f4a08c',null,0,0.8*fw); });
          [-2.5,2.5].forEach(d => ell(c,cx+d,-44,1.3,1.3,'#6b4a35',null,0,fw));
          c.globalAlpha = fw; c.lineWidth = 1.6; c.strokeStyle = '#6b4a35'; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx-8,-36); c.quadraticCurveTo(cx,-30,cx+8,-36); c.stroke(); c.globalAlpha = 1;
        } else {
          [-12,12].forEach(d => { ell(c,cx+d,-56,5,blink?1:5,'#2b1d18',null,0,fw); if(!blink) ell(c,cx+d+1.5,-58.5,1.7,1.7,'#fff',null,0,fw);
            ell(c,cx+d*1.5,-42,6,4.5,'#f58fb0',null,0,0.7*fw); });
          ell(c,cx,-43,11,9,'#ee86a8',null,0,fw); [-4,4].forEach(d => ell(c,cx+d,-43,2,4,'#b8456c',null,0,fw));
        } });
    }
    add(120,true,c => { gesichtZeug(c, male, true, fw); gesichtZeug(c, male, false, Math.pow(FA,3)); });   // Brille/Tattoo
    // Schwanz (hinten auf der Mittellinie)
    { const tz = 34*st; add(tz > 0.5 ? 190 : -100,true,c => { c.save(); c.translate(cx,0); c.scale(ct,1); c.translate(-cx,0);
        c.lineCap = 'round'; c.strokeStyle = B.tailC; c.lineWidth = B.tailW; c.stroke(B.tail); c.restore(); }); }
    // Arme und Füße: x um die Hochachse drehen (nah = z+, fern = z-)
    const px = (x,z) => cx+(x-cx)*ct+z*st, pz = (x,z) => -(x-cx)*st+z*ct;
    if(ar > 0.02){
      [[p.fa,-22,B.farArm,6,4.5],[p.na,22,B.nearArm,7,5]].forEach(([a,z0,col,w,hr]) => {
        let pts = [[a[0],a[1]],[a[2],a[3]],[a[4],a[5]]].map(q => [px(q[0],z0),q[1]]);
        if(p.fr){ const fa = z0 < 0 ? p.fr.fa : p.fr.na, w = p.w; pts = pts.map((q,i) => [q[0]+(fa[i*2]-q[0])*w, q[1]+(fa[i*2+1]-q[1])*w]); }
        add(side(pz(a[4],z0)),true,c => { c.globalAlpha = ar; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.lineWidth = w;
          c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); c.lineTo(pts[1][0],pts[1][1]); c.lineTo(pts[2][0],pts[2][1]); c.stroke(); ell(c,pts[2][0],pts[2][1],hr,hr,B.hand); c.globalAlpha = 1; }); });
    }
    [[p.ff,-10,B.ff],[p.nf,10,B.nf]].forEach(([f,z0,col]) => {
      let x = px(f[0],z0), fy = f[1], fang = f[2]; const kx = Math.sqrt(ct*ct+0.36*st*st);
      if(p.fr){ const g = z0 < 0 ? p.fr.ff : p.fr.nf, w = p.w; x += (g[0]-x)*w; fy += (g[1]-fy)*w; fang += (g[2]-fang)*w; }
      const wf = p.fr ? p.w : 0, key = wf > 0.5 ? 205 + (z0 > 0 ? 1 : 0) : side(pz(f[0],z0));   // von vorn stehen beide Füße vor dem Körper
      add(key,false,c => { c.save(); c.translate(x,fy); c.rotate(fang*PI/180);
        if(wf < 0.98){ const a1 = 1-wf; c.save(); c.scale(kx*(p.fs||1),p.fs||1);
          ell(c,0,0,15,9,col.f,col.s,1.2,a1); ell(c,0,6,11,3,col.s,null,0,a1); ell(c,13,0,3.5,3.5,col.t,null,0,a1); c.restore(); }
        if(wf > 0.02){ ell(c,0,0,10.5,8.5,col.f,col.s,1.2,wf); ell(c,0,3.5,7,3,col.s,null,0,wf); ell(c,0,-3,5,2.5,col.t,null,0,0.7*wf); }
        c.restore(); }); });
    items.sort((a,b) => a.k-b.k);
    items.forEach(it => { c.save();
      if(it.grp){ c.translate(0,p.dy); c.translate(0,-16); c.scale(hs[0],hs[1]); c.translate(0,16);
        const lp = p.lp || [0,-20]; c.translate(lp[0],lp[1]); c.rotate(p.lean*PI/180); c.translate(-lp[0],-lp[1]); }
      it.fn(c); c.restore(); });
  }
  // ---- Pose aus dem echten Spielzustand ----
  window.fussFigurZeichnen = function(P){
    const c = ctx, now = performance.now(), male = P.male;
    let S = P._ff; if(!S) S = P._ff = {t:now, phase:0, hp:0, key:null, snap:null, k0:0, last:null, hb:0, rb:0, pv:0, skid:0};
    const dt = Math.min(0.05, Math.max(0, (now-S.t)/1000)); S.t = now;
    const sp = Math.abs(P.vx), t = now/1000;
    if(P.grounded && sp > 0.3) S.phase += 24*(sp/4.4)*dt;     // Schrittzähler: Tempo des Spiels = Tempo der Beine
    if(P.haft) S.hp += sp*54*dt;
    // Bremspose: ab Loslassen aus Lauftempo, endet sofort, sobald wieder eine Richtungstaste gedrückt wird (kein Dauer-Rutschen beim Antippen)
    if(P._moveDir || S.inSince === undefined) S.inSince = now;
    if(!P.grounded || P._moveDir || (sp < 0.8 && now > S.skidMin)) S.skidOn = false;
    else if(!S.skidOn && now - S.inSince > 50 && sp > 2.0){ S.skidOn = true; S.skidMin = now + 180; }
    S.pv = sp;
    if(!P.grounded) S.gelaufen = false; else if(P._moveDir) S.gelaufen = true;   // Wackeln an der Kante nur nach Laufen, nicht nach einer Landung
    let p, key, xoff = 0, yoff = 0, flip = P.facing < 0 ? -1 : 1, rot = 0, rotCenter = false;
    const sinceLand = now - (P._landT || -1e9), sinceWJ = now - (P._wjT || -1e9);
    if(typeof won !== 'undefined' && won && !(typeof baumGehtHinein === 'function' && baumGehtHinein())){ p = copy(AIR); p.dy = 5; key = 'cheer'; }
    else if(P.hookAttached && P.anchor){ p = copy(RPP); key = 'seil'; }
    else if(P.haft){
      if(P.haft.flaeche === 'unten'){ p = hangPose(S.hp); key = 'haft'; }
      else { p = wsPose(t); key = 'ws'; const wd = P.haft.flaeche === 'links' ? 1 : -1; flip = wd; xoff = -wd*7.2; }
    }
    else if(P.dash && !(P.gliding && !male)){ p = copy(DS); key = 'dash';
      const dx = P.dash.dx || 0, dy = P.dash.dy || 0; if(dx) flip = dx < 0 ? -1 : 1; rot = Math.atan2(dy, Math.abs(dx) || 0.0001)*flip; rotCenter = true; }
    else if(!P.grounded){
      if(P.gliding && !male){ const sw = Math.sin(t*2*PI/1.7); p = copy(GLP); p.lean += 5*sw; p.nf[2] += 12*sw; p.ff[2] -= 12*sw; key = 'segeln'; }
      else if(P.onWall && P.vy > -1){ p = wsPose(t); key = 'ws'; flip = P.onWall > 0 ? 1 : -1; xoff = -P.onWall*7.2; }
      else if(sinceWJ < 380){ const u = sinceWJ/18.5; p = kf([[0,WJ],[9,WJA],[20,AIR]], u); key = 'wj'; xoff = P.facing*18*Math.max(0,1-u/10); }
      else if(P.vy < 0){ p = copy(UP); key = 'up'; }
      else { p = copy(DOWN); key = 'down'; }
    } else {
      if(sinceLand < 260){ const kL = 0.4 + 0.6*(P._landV || 0.5); p = mixPose(idleP(t), kf([[0,L1],[0.3,L2],[0.7,L3],[1,idleP(t)]], sinceLand/260), kL); key = 'land'; }
      else if(S.skidOn){ p = copy(SKID); key = 'skid'; }
      else if(sp > 0.3){ p = runPose(S.phase%8); key = 'run'; }
      else if(S.gelaufen && kanteRichtung(P, KANTE_WACKEL_RAND)){ p = kantePose(t); key = 'kante'; flip = kanteRichtung(P, KANTE_WACKEL_RAND); }
      else { p = idleP(t); key = 'idle'; }
    }
    // Sprung-Variante bei jedem Absprung vom Boden UND bei jedem Wandsprung: 0 = normal, 1 = Vorwärtsrolle, 2 = Rückwärtssalto (Wandsprung: auch vorwärts)
    // Nach einem normalen Sprung kommt immer eine Variante (je 50 %); nach einer Variante 50 % normal -> auf Dauer je 1/3.
    const pickJump = wall => {
      const r = Math.random();
      const typ = S.lastTyp === 0 ? (r < 0.5 ? 1 : 2) : S.lastTyp === undefined ? (r < 1/3 ? 0 : r < 2/3 ? 1 : 2) : (r < 0.5 ? 0 : r < 0.75 ? 1 : 2);
      S.lastTyp = typ; S.roll = -1; S.rollSign = 0;
      if(typ > 0){ S.roll = 0;
        const mv = (wall || sp >= 1.2) ? (P.vx < 0 || (P.vx === 0 && flip < 0) ? -1 : 1) : flip;      // vorwärts = in Bewegungs-/Blickrichtung
        S.rollSign = (typ === 2 && !wall) ? -mv : mv; }
    };
    // Wandsprung-Zeitpunkt merken (null = noch keiner; vorher blieb es undefined, und der ERSTE Wandsprung zählte nie als neu)
    if(!('wjSeen' in S)) S.wjSeen = P._wjT === undefined ? null : P._wjT;
    // am Boden: Rolle beenden – außer sie läuft gerade (dann unten in 0,15 s zu Ende, vorher brach sie hier beim Landen ab)
    if(P.grounded){ if(!(S.roll > 0 && S.roll < 1)) S.roll = -1; S.wasG = true; }
    else {
      if(S.wasG){ S.wasG = false; S.roll = -1; if(P.vy < -3) pickJump(false); }
      if(P._wjT !== undefined && P._wjT !== S.wjSeen){ S.wjSeen = P._wjT; pickJump(true); }              // neuer Wandsprung
      if(key === 'ws' || key === 'haft' || key === 'segeln' || key === 'seil' || key === 'dash') S.roll = -1;   // Wand/Schirm/Seil/Dash: Reste vom letzten Sprung abbrechen (Drehung läuft unten weich aus)
      const inAir = (key === 'up' || key === 'down' || key === 'wj');
      if(S.roll >= 0 && S.roll < 1 && inAir) S.roll += dt/ROLL_ZEIT;
    }
    // Landet die Figur mitten in der Rolle, läuft sie in 0,15 s zu Ende (kein Ruck)
    if(P.grounded && S.roll > 0 && S.roll < 1) S.roll += dt/0.15;
    const flow = x => x*0.65+ease(x)*0.35;                   // fast gleichmäßig: fängt sofort an zu drehen
    if(S.roll > 0 && S.roll < 1){ rot = 2*PI*flow(S.roll)*S.rollSign; rotCenter = true; }
    // Langeweile: nach IDLE_START Sekunden ohne Eingabe dreht sich die Figur zum Spieler (Vorderansicht) und macht Unsinn (Affe: Disco, Hüpfen, Salto, Klatschen, Kratzen; Schwein: Winken, Wackeln, Knicks, Tippeln)
    S.idleT = (key === 'idle' && !P._moveDir) ? (S.idleT || 0) + dt : 0;
    const wantFront = S.idleT > IDLE_START;
    S.front = clamp((S.front || 0) + dt/(wantFront ? 0.5 : 0.2)*(wantFront ? 1 : -1), 0, 1);
    let frPose = null, frRot = 0;
    if(S.front > 0){
      if(wantFront){
        S.anticT = (S.anticT || 0) + dt;
        if(S.antic === undefined || S.anticT > S.anticDur){
          S.prevFr = S.curFr || null;
          const cand = ANTICS.map((a,i) => i).filter(i => ANTICS[i].who === (male ? 'm' : 'f') && i !== S.antic); const n = cand[Math.floor(Math.random()*cand.length)];
          S.antic = n; S.anticT = 0; S.anticDur = ANTICS[n].dur*(0.85+0.3*Math.random());
        }
      }
      const tt = S.anticT || 0, an = ANTICS[S.antic] || ANTICS[0];
      frPose = an.pose(tt, male, S.anticDur); frRot = an.rot ? an.rot(tt) : 0;
      if(S.prevFr && tt < 0.3) frPose = mixFr(S.prevFr, frPose, ease(tt/0.3));
      S.curFr = frPose; { const dur = S.anticDur || 4, hd = Math.max(1 - ease(clamp(tt/0.4,0,1)), ease(clamp((tt-(dur-1.1))/0.9,0,1)));
        S.umbHide = an.umb ? hd : 0; S.umbA = an.umb ? clamp(Math.min((tt-0.4)/0.6, 1-(tt-(dur-1.7))/0.6), 0, 1) : 0; S.umbVis = an.umb && S.umbHide < 0.98; } S.ropeOn = !!an.rope; if(an.rope){ S.ropeTh = an.rope(tt); S.ropeK = clamp(Math.min(tt/0.6, ((S.anticDur||4) - tt)/0.6), 0, 1); } S.umbT = tt; S.umbTilt = an.tilt ? an.tilt(tt) : 0; S.gust = an.gust ? an.gust(tt) : 0;
    } else { S.antic = undefined; S.anticT = 0; S.prevFr = null; S.curFr = null; S.umbA = 0; S.umbVis = false; S.ropeOn = false; }
    if(frRot){ rot += frRot*ease(S.front); rotCenter = true; }
    // Schirm offen: Drehung läuft schnell aus, die Figur hängt aufrecht darunter (kein Überkopf / keine Schräglage)
    // Genauso am Seil (aufrecht) und beim Dash (in Dash-Richtung): eine angefangene Rolle/ein Salto friert nicht schräg ein
    const rotZiel = (key === 'segeln' || key === 'seil') ? 0 : key === 'dash' ? rot : null;
    if(rotZiel !== null){ const d = (S.rotE || 0) - rotZiel, wr = Math.atan2(Math.sin(d), Math.cos(d)); S.rotE = rotZiel + wr*Math.exp(-dt*14); rot = S.rotE; rotCenter = true; }
    else S.rotE = rot;           // Salto (Antic): Drehung der ganzen Figur
    // weicher Übergang zwischen zwei Posen (0,12 s)
    if(S.key !== key){ S.snap = S.last || p; S.k0 = now; S.bt = (key === 'ws' || S.key === 'ws') ? 60 : 120; S.key = key; }   // Wand: schnell ausrichten (0,06 s)
    const w = 1 - ease(clamp((now-S.k0)/(S.bt || 120), 0, 1)); if(w > 0 && S.snap) p = mixPose(p, S.snap, w);
    const kk = 1 - Math.exp(-dt*20);
    S.hb += ((key === 'haft' ? 1 : 0) - S.hb)*kk; S.rb += ((key === 'seil' ? 1 : 0) - S.rb)*kk;
    // Ursprung = Füße; Figur hängt an der Decke bzw. am Seil
    if(S.tx === undefined) S.tx = 0; if(key === 'ws') S.tx = xoff; else S.tx += (xoff - S.tx)*kk;   // Wand-Versatz: beim Wandsprung weich auslaufen
    let tx = S.tx, ty = yoff + 3 + S.hb*27.7, rotSeil = 0;   // 3 px tiefer: Füße stehen im Gras statt darüber
    if(P.anchor && (S.rb > 0.02)){
      const cx = P.x, cy = P.y - P.h*0.6, phi = Math.atan2(P.anchor.x - cx, cy - P.anchor.y), cs = Math.cos(phi), sn = Math.sin(phi);
      const hx = 15.6*flip*U/U, hy = -62.4; const hv = [hx*cs - hy*sn, hx*sn + hy*cs];
      const ox = 0 - hv[0], oy = -P.h*0.6 - hv[1];
      tx += (ox - tx)*S.rb; ty += (oy - ty)*S.rb; rotSeil = phi*S.rb;
      if(key === 'seil'){ const th = phi*180/PI; p.lean = -6 - th*0.15*flip; p.nf[2] = 8 - th*0.6*flip; p.ff[2] = -10 - th*0.6*flip; }
    }
    S.last = p;
    const B0 = c.getTransform();
    c.save();
    c.translate(0, P.h*0.5);                          // Ursprung auf die Füße
    c.translate(tx, ty);
    if(rotSeil) c.rotate(rotSeil);
    if(rotCenter){ c.translate(0,-30); c.rotate(rot); c.translate(0,30); }
    c.scale(flip*U, U);
    // Hand-Position (Geräte-Koordinaten) der vorderen Hand, inkl. Körper-Gruppentransformation
    const Mb = c.getTransform();
    const spielSchirm = !male && S.umbVis && frPose;
    { const hq = (spielSchirm || (male && S.ropeOn && frPose)) ? Object.assign({}, p, {na: frPose.na, fa: frPose.fa, dy: frPose.dy, lean: frPose.lean}) : p;
      const hs_ = p.hs || [1,1], lp_ = p.lp || [0,-20];
      const m = new DOMMatrix(); m.translateSelf(0,hq.dy); m.translateSelf(0,-16); m.scaleSelf(hs_[0],hs_[1]); m.translateSelf(0,16);
      m.translateSelf(lp_[0],lp_[1]); m.rotateSelf(hq.lean); m.translateSelf(-lp_[0],-lp_[1]);
      const hp = Mb.multiply(m).transformPoint(new DOMPoint(hq.na[4], hq.na[5]));
      const hd = Mb.multiply(m).transformPoint(new DOMPoint(4, -50));
      P._handDev = {x:hp.x, y:hp.y, f:P._frameNo = (P._frameNo||0)+1}; P._headDev = {x:hd.x, y:hd.y};
      const h2 = Mb.multiply(m).transformPoint(new DOMPoint(hq.fa[4], hq.fa[5])); P._hand2Dev = {x:h2.x, y:h2.y}; }
    if(!male && (P.umbrella > 0.03 || spielSchirm) && P._handDev){
      const u = spielSchirm ? S.umbA : P.umbrella, tilt = spielSchirm ? S.umbTilt : clamp(-P.vx*3, -15, 15) + Math.sin(t*4)*3*u;
      c.save(); c.setTransform(B0);
      let tilt2 = 0; let hb = B0.inverse().transformPoint(new DOMPoint(P._handDev.x, P._handDev.y));
      if(spielSchirm && S.umbHide > 0){ const hh = B0.inverse().transformPoint(new DOMPoint(P._headDev.x, P._headDev.y)), q = ease(S.umbHide); tilt2 = -82*q; const ang = (tilt + tilt2)*PI/180, tx2 = hh.x - Math.sin(ang)*12, ty2 = hh.y + 6 + Math.cos(ang)*12; hb = {x: hb.x + (tx2 - hb.x)*q, y: hb.y + (ty2 - hb.y)*q}; }   // ganz hinter den Kopf schieben   // Schirm kommt von / verschwindet hinter dem Körper
      schirmZeichnen(c, hb.x, hb.y, tilt + tilt2, u, spielSchirm ? 1 : Math.min(1, u*4));
      if(spielSchirm && S.gust > 0.15){                       // Windstriche bei der Böe
        c.strokeStyle = 'rgba(255,255,255,' + (0.7*S.gust) + ')'; c.lineWidth = 1.6; c.lineCap = 'round';
        for(let k = 0; k < 4; k++){ const ph = ((S.umbT*1.6 + k*0.27) % 1), yy = hb.y - 30 + k*16, xx = hb.x - 50 + ph*110;
          c.beginPath(); c.moveTo(xx, yy); c.quadraticCurveTo(xx + 8, yy - 3, xx + 18, yy); c.stroke(); }
      }
      c.restore();
    }
    const seilSpringen = male && S.ropeOn && frPose && P._hand2Dev;
    const liane = () => {          // Liane: wird über den Kopf geschwungen (hinter dem Körper hoch, vorn runter)
      c.save(); c.setTransform(B0);
      const a = B0.inverse().transformPoint(new DOMPoint(P._handDev.x, P._handDev.y)), b = B0.inverse().transformPoint(new DOMPoint(P._hand2Dev.x, P._hand2Dev.y));
      const th = S.ropeTh, k = S.ropeK, R = 40*U*k + 0.001, top = Math.cos(th), my = (a.y + b.y)/2 - R*top*(top > 0 ? 1.9 : 1) ;
      const sag = (1 - k)*10, yy = (a.y + b.y)/2;
      const ay = yy - R*Math.cos(th)*(Math.cos(th) > 0 ? 1.9 : 1.0) + sag;
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = '#3f7a3a'; c.lineWidth = 3.2; c.beginPath(); c.moveTo(a.x, a.y);
      c.bezierCurveTo(a.x - 12*k, a.y + (ay - a.y)*1.33, b.x + 12*k, b.y + (ay - b.y)*1.33, b.x, b.y); c.stroke();
      c.strokeStyle = '#6fb35a'; c.lineWidth = 1.2; c.stroke();
      c.restore();
    };
    const lianeHinten = seilSpringen && Math.sin(S.ropeTh) < 0;
    if(lianeHinten) liane();
    const thTotal = frPose ? -PI/2*ease(S.front) : 0;
    if(thTotal){
      const pd = Object.assign({}, p);
      if(frPose){ const wf = ease(S.front); pd.fr = frPose; pd.w = wf; pd.dy = p.dy + (frPose.dy - p.dy)*wf; pd.lean = p.lean + (frPose.lean - p.lean)*wf;
        pd.ar = (p.ar === undefined ? 1 : p.ar)*(1-wf) + wf; }
      figureSpin(c, male, pd, P.blink < 130, thTotal);
    } else figure(c, male, p, P.blink < 130);
    if(seilSpringen && !lianeHinten) liane();
    c.restore();
  };
  window.addEventListener('keydown', e => {
    if(e.code === 'KeyB' && !e.repeat && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) NEUE_FIGUREN = !NEUE_FIGUREN;
  });
  window.addEventListener('DOMContentLoaded', () => {
    const lb = document.getElementById('lookBtn'), fb = document.getElementById('fsBtn');
    if(lb) lb.addEventListener('click', () => { NEUE_FIGUREN = !NEUE_FIGUREN; lb.blur(); });
    if(fb) fb.addEventListener('click', () => {
      const el = document.documentElement;
      (el.requestFullscreen ? el.requestFullscreen() : Promise.reject()).catch(() => {}); fb.blur();
    });
  });
})();
