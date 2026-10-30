// ---------- Teilkugel (für Panzer und Kapuze) ----------
function partSphere(th0,th1,ph0,ph1,sg=40,rg=24){const pos=[],uv=[],idx=[];for(let i=0;i<=rg;i++){const v=i/rg,th=th0+v*(th1-th0);for(let j=0;j<=sg;j++){const u=j/sg,ph=ph0+u*(ph1-ph0);
 pos.push(Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph));uv.push(u,v)}}
 for(let i=0;i<rg;i++)for(let j=0;j<sg;j++){const a=i*(sg+1)+j,b=a+sg+1;idx.push(a,b,a+1,b,b+1,a+1)}return Object.assign(mkGeo(pos,pos.slice(),uv,idx,SHELLS),{schale:true})}
// flacher Fleck auf einer Kugeloberfläche (lokale z-Achse zeigt nach außen)
function fleck(par,c,sc,th,ph,r,o){const d=[Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)];
 const n=[d[0]/sc[0],d[1]/sc[1],d[2]/sc[2]],l=Math.hypot(...n),nn=n.map(v=>v/l);
 const p=[c[0]+sc[0]*d[0]-nn[0]*r*.12,c[1]+sc[1]*d[1]-nn[1]*r*.12,c[2]+sc[2]*d[2]-nn[2]*r*.12];
 return F(par,Object.assign({pos:p,sc:[r,r,r*.3],rot:[-Math.asin(nn[1]),Math.atan2(nn[0],nn[2]),0]},o))}
// ---------- Professor: Marienkäfer (nach dem Plüschtier des Nutzers) ----------
// cremefarbenes Gesicht und Bauch, große weiche rosa-beige Nase, kleine schwarze Knopfaugen weit oben, schwarze „Kapuze“
// über Hinterkopf mit zwei Fühler-Knubbeln, roter Panzer über Rücken und Seiten mit großen schwarzen Punkten,
// kurze schwarze Ärmchen und Füße mit cremefarbenen Spitzen
function buildLadybug(){const R=new Nd();const eyes=[];
 const CR=0xa99e8a,CT=0xe6dccb,BK=0x141418,BKT=0x3c3c46,RD=0xb5161f,RDT=0xf0464f,D=34;
 const B=R.add(new Nd({pos:[0,1.32,0]}));
 F(B,{sc:[1.4,1.24,1.3],root:CR,tip:CT,len:.07,dens:D});
 const PS=[1.47,1.3,1.38],PC=[0,.03,-.06];
 F(B,{geo:partSphere(.2*Math.PI,.9*Math.PI,Math.PI-.62,2*Math.PI+.62),pos:PC,sc:PS,root:RD,tip:RDT,len:.06,dens:D});
 const PI=Math.PI;
 for(const [th,ph,r] of [[.36,1.5,.34],[.6,1.3,.36],[.6,1.7,.36],[.82,1.5,.3],[.42,1.12,.27],[.42,1.88,.27],[.74,1.04,.24],[.74,1.96,.24],[.3,1.28,.2],[.3,1.72,.2]])
  fleck(B,PC,PS.map(v=>v+.03),th*PI,ph*PI,r*1.28,{root:BK,tip:BKT,len:.05,dens:D});
 const H=R.add(new Nd({pos:[0,3.34,.1]}));
 F(H,{sc:[1.48,1.3,1.36],root:CR,tip:CT,len:.08,dens:D});
 F(H,{geo:partSphere(0,.8*PI,PI-.5,2*PI+.5),pos:[0,.03,-.05],sc:[1.54,1.36,1.41],root:BK,tip:BKT,len:.07,dens:D});
 for(const s of [-1,1]){
  F(H,{geo:tube([[s*.37,1.05,-.25],[s*.44,1.29,-.31],[s*.52,1.48,-.31]],.085,.07,SHELLS,10,10),root:BK,tip:BKT,len:.04,tile:[.6,.2]});
  F(H,{pos:[s*.54,1.54,-.31],sc:[.21,.21,.21],root:BK,tip:BKT,len:.05,dens:D});
  { const e=K(H,{pos:[s*.44,.49,1.22],sc:[.14,.17,.08],color:0x0d0d10,spec:160}); eyes.push({n:e,g:[K(H,{pos:[s*.44+.05,.55,1.29],sc:[.05,.05,.02],color:0xffffff,emit:1})],y:.17,x:.14}); }
  K(H,{pos:[s*.81,-.15,1.06],sc:[.25,.16,.06],color:0xff8f9e,alpha:.35});
 }
 F(H,{pos:[0,0,1.38],sc:[.45,.39,.44],root:0xb07a6c,tip:0xdcae9f,len:.05,dens:D});
 // Lesebrille: zwei runde Gläser in Goldrahmen, Steg über der Nase, Bügel nach hinten zur Kapuze
 for(const s of [-1,1]){
  const ring=[];for(let i=0;i<=24;i++){const a=i/24*Math.PI*2;ring.push([s*.45+.21*Math.cos(a),.45+.19*Math.sin(a),1.34+.02*Math.sin(a)])}
  K(H,{geo:tube(ring,.028,.028,1,60,8),color:0xb8893c,spec:70});
  K(H,{pos:[s*.45,.45,1.33],sc:[.2,.18,.012],color:0xeaf4ff,alpha:.22,spec:120});
  K(H,{geo:tube([[s*.66,.5,1.3],[s*.98,.53,1.0],[s*1.22,.55,.55],[s*1.36,.52,.15]],.022,.022,1,24,6),color:0xb8893c,spec:50});
 }
 K(H,{geo:tube([[-.25,.53,1.37],[-.12,.62,1.44],[0,.64,1.46],[.12,.62,1.44],[.25,.53,1.37]],.026,.026,1,24,6),color:0xb8893c,spec:70});
 const laecheln=K(H,{geo:tube([[-.22,-.46,1.32],[-.11,-.545,1.355],[0,-.57,1.365],[.11,-.545,1.355],[.22,-.46,1.32]],.03,.03,1,30,8),color:0x5a2a26});
 const mouth=K(H,{pos:[0,-.55,1.35],sc:[.2,.001,.05],color:0x3a1416}), zunge=K(H,{pos:[0,-.58,1.37],sc:[.12,.001,.03],color:0xe0707e,spec:30});
 // Details: buschige Augenbrauen, Mittelnaht der Flügeldecken
 for(const s of [-1,1]){
  for(const [dx,dy,w] of [[-.09,0,.1],[0,.025,.11],[.09,.01,.1]]) F(H,{pos:[s*(.46+dx),.84+dy,1.06-Math.abs(dx)*.3],sc:[w,.045,.06],rot:[.3,s*.3,-s*(.12+dx)],root:0x9c8f7a,tip:0xeee4d0,len:.09,dens:D,grav:.04});
 }
 { const naht=[];for(let i=0;i<=24;i++){const th=(.2+.7*i/24)*Math.PI;naht.push([0,PC[1]+Math.cos(th)*(PS[1]+.035),PC[2]-Math.sin(th)*(PS[2]+.035)])}
   K(B,{geo:tube(naht,.03,.03,1,60,8),color:0x141418}); }
 const AP=[];for(const s of [-1,1]){const A=R.add(new Nd({pos:[s*1.33,1.98,.3]}));
  F(A,{pos:[0,-.34,0],sc:[.27,.43,.27],root:BK,tip:BKT,len:.06,dens:D});
  F(A,{pos:[0,-.8,.03],sc:[.24,.21,.24],root:CR,tip:CT,len:.06,dens:D});AP.push(A)}
 const LP=[];for(const s of [-1,1]){const L=R.add(new Nd({pos:[s*.64,.4,.25]}));
  F(L,{sc:[.42,.41,.44],root:BK,tip:BKT,len:.06,dens:D});
  F(L,{pos:[0,-.14,.32],sc:[.33,.24,.16],root:CR,tip:CT,len:.05,dens:D});LP.push(L)}
 return {root:R,head:H,armN:AP[0],armP:AP[1],legN:LP[0],legP:LP[1],eyes,mouth,zunge,laecheln,mundY:-.55,mundMax:.17,body:B}}
// Mund für Affe und Schwein (dunkles Oval, öffnet sich beim Sprechen)
function mitMund(ch,kind){
 const farbe=kind==='affe'?0x5a2f25:0x9a3c58, z=kind==='affe'?1.215:.9, y=kind==='affe'?-.58:-.7;
 ch.laecheln=ch.head.kids.find(n=>n.part&&n.part.geo&&n.part.geo.shells===1&&Math.abs(n.part.root[0]-((farbe>>16&255)/255))<.01&&Math.abs(n.part.root[1]-((farbe>>8&255)/255))<.01);
 ch.mouth=K(ch.head,{pos:[0,y,z],sc:[kind==='affe'?.15:.17,.001,.05],color:0x3a1416}); ch.mundMax=.13;
 ch.zunge=K(ch.head,{pos:[0,y-.03,z+.02],sc:[.08,.001,.03],color:0xe0707e,spec:30}); ch.mundY=y;
 ch.eyes.forEach(e=>{e.x=e.n.sc[0];});return ch}
  return {gl, PRG, U, M, Nd, buildMonkey, buildPig, buildLadybug, mitMund, drawNode, cv, noise, TAT};
  }
  const halter = {};
  function holen(kind){
    if(halter[kind]) return halter[kind];
    const ch = kind === 'affe' ? E.mitMund(E.buildMonkey(), 'affe') : kind === 'schwein' ? E.mitMund(E.buildPig(), 'schwein') : E.buildLadybug();
    const wrap = new E.Nd(), yawN = wrap.add(new E.Nd()); yawN.kids.push(ch.root);
    ch.armN.cap = true; ch.armP.cap = true; if(ch.mouth) ch.mouth.cap = true;
    return halter[kind] = {ch, wrap, yawN, tp: 0};
  }
  const GS = {affe:[1.13,1.05], schwein:[1.14,1], prof:[1.08,1.06]};
  // Figur in ihrer Pose rendern; Rückgabe: die WebGL-Leinwand (sofort weiterzeichnen!)
  function rendere(kind, P, t){
    const {gl, PRG, U, M, drawNode, cv, noise, TAT} = E, H = holen(kind), ch = H.ch;
    const z = v => v || [0,0,0];
    ch.head.rot = z(P.head); ch.armN.rot = z(P.armN); ch.armP.rot = z(P.armP); ch.legN.rot = [0,0,0]; ch.legP.rot = [0,0,0];
    for(const [L, o] of [[ch.legN, P.fussN], [ch.legP, P.fussP]]){ if(!L.base) L.base = L.pos.slice(); const d = o || [0, 0]; L.pos = [L.base[0], L.base[1] + d[0], L.base[2] + d[1]]; }
    for(const e of ch.eyes){ const s = P.auge || 1; e.n.sc = [e.x*s, P.blinzeln ? e.y*.14 : e.y*s, e.n.sc[2]]; for(const g of e.g) g.visible = !P.blinzeln; }
    if(ch.mouth){ const m = Math.max(0, Math.min(1, P.mund || 0)), hy = .002 + (ch.mundMax || .1)*m;
      ch.mouth.sc = [ch.mouth.sc[0], hy, ch.mouth.sc[2]]; ch.mouth.pos = [0, ch.mundY - hy*.35, ch.mouth.pos[2]];
      if(ch.zunge){ ch.zunge.sc = [ch.zunge.sc[0], .001 + hy*.45, ch.zunge.sc[2]]; ch.zunge.pos = [0, ch.mundY - hy*.75, ch.zunge.pos[2]]; ch.zunge.visible = m > .08; }
      if(ch.laecheln) ch.laecheln.visible = m < .12; }
    if(ch.tail){ H.tp += .03; const k = .35 + .65*(.5 - .5*Math.cos(t*.9)), n = ch.tail.segs.length;
      ch.tail.segs.forEach((sg, i) => { sg.rot = [(i === 0 ? -.35 : .1) + (i === 0 ? 0 : .72)*k + Math.sin(t*5 - i*.9)*.07*(i ? 1 : 0), 0, Math.sin(t*3 - i*.7)*(.1)*(i ? 1 : 0)]; }); }
    const piv = P.pivot == null ? 1.6 : P.pivot, g = GS[kind], sq = P.sq || 0;
    H.wrap.pos = [0, piv + (P.bob || 0), 0]; H.wrap.rot = [P.pitch || 0, 0, P.roll || 0]; H.yawN.pos = [0, -piv, 0]; H.yawN.rot = [0, P.yaw || 0, 0];
    H.yawN.gs = [(1 - sq*.5)*g[0], (1 + sq)*g[1], (1 - sq*.5)*g[0]];
    gl.viewport(0, 0, SPR, SPRH); gl.disable(gl.SCISSOR_TEST); gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST);
    gl.useProgram(PRG); gl.uniform3f(U.uLicht, ...LICHT); gl.uniform1f(U.uSzene, SZENE ? 1 : 0);
    if(SZENE) for(const n of ['Key', 'KeyCol', 'Rim', 'RimCol', 'Amb0', 'Amb1']) gl.uniform3f(U['u' + n], ...SZENE[n]); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, noise); gl.uniform1i(U.uNoise, 0);
    TAT.on = false;
    gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    drawNode(H.wrap, M.id(), M.ortho(FR.x0, FR.x1, FR.y0, FR.y1, -20, 20), [0, 1.8, 30]);
    // wo die Hände gerade sind (Anteil des Bildes, 0..1 von links bzw. oben; z > 0 = vor dem Körper)
    const HAND = {affe: [0, -.82, .08], schwein: [0, -.68, .06], prof: [0, -.82, .06]}[kind];
    const pkt = n => { const m = n.capM; if(!m) return null; const [x, y, z] = HAND;
      const X = m[0]*x + m[4]*y + m[8]*z + m[12], Y = m[1]*x + m[5]*y + m[9]*z + m[13], Z = m[2]*x + m[6]*y + m[10]*z + m[14];
      return [(X - FR.x0)/(FR.x1 - FR.x0), (FR.y1 - Y)/(FR.y1 - FR.y0), Z]; };
    const mm = ch.mouth && ch.mouth.capM;
    haende = {N: pkt(ch.armN), P: pkt(ch.armP), M: mm ? [(mm[12] - FR.x0)/(FR.x1 - FR.x0), (FR.y1 - mm[13])/(FR.y1 - FR.y0), mm[14]] : null};
    return cv;
  }
  // Nur die Pfoten noch einmal (sofort nach rendere derselben Figur): so liegen sie VOR einem gehaltenen Zettel/Keks.
  // Der Tiefenpuffer bleibt erhalten -> nur die Teile der Pfote, die man wirklich sieht.
  function rendereHaende(kind, welche, vorn){   // vorn: Pfote ganz zeigen (sie hält etwas VOR dem Gesicht)
    const {gl, M, drawNode, cv} = E, ch = holen(kind).ch;
    gl.clear(vorn ? gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT : gl.COLOR_BUFFER_BIT); gl.depthFunc(gl.LEQUAL);
    const VP = M.ortho(FR.x0, FR.x1, FR.y0, FR.y1, -20, 20);
    for(const A of welche === 'N' ? [ch.armN] : welche === 'P' ? [ch.armP] : [ch.armN, ch.armP])
      if(A.capM) for(const q of A.kids.slice(1)) if(q.visible) drawNode(q, A.capM, VP, [0, 1.8, 30]);
    gl.depthFunc(gl.LESS); return cv;
  }
  let haende = {N: null, P: null}; const LICHT = [1, 1, 1]; let SZENE = null;   // SZENE: Filmlicht {Key, KeyCol, Rim, RimCol, Amb0, Amb1} oder null   // Lichtfarbe der Umgebung (multipliziert, linear)
  function start(){ if(E) return true; try { E = baue(); return true; } catch(e){ console.warn('3D nicht verfügbar', e); E = null; return false; } }
  // Platzhalter für Blender-Schatten: alle Kugel-Teile der zuletzt gerenderten Pose als Weltmatrizen (Bildanteile wie haende)
  function platzhalter(kind){ const out = [], geh = n => { if(!n.visible) return; if(n.part && n.wM && (n.part.geo.kugel || n.part.geo.schale)) out.push(Array.from(n.wM)); n.kids.forEach(geh); }; geh(holen(kind).wrap); return out; }
  // Ganze Figur für Blender: alle sichtbaren Teile (Weltmatrix, Geometrie-Nummer, Farben, Fell) + die Geometrien selbst
  function ausgabe(kind, nurBewegung){ const teile = [], geos = {}, geh = (n, sicht) => { sicht = sicht && n.visible;
      if(n.part && n.wM){ const p = n.part;
        if(nurBewegung) teile.push({m: Array.from(n.wM, v => +v.toFixed(5)), v: sicht ? 1 : 0});
        else { geos[p.geo.id] = geos[p.geo.id] || {pos: Array.from(p.geo.roh.pos, v => +v.toFixed(4)), idx: Array.from(p.geo.roh.idx)};
          teile.push({g: p.geo.id, m: Array.from(n.wM, v => +v.toFixed(5)), v: sicht ? 1 : 0, fur: p.fur, root: p.root, tip: p.tip, len: p.len, alpha: p.alpha, spec: p.spec, emit: p.emit}); } }
      n.kids.forEach(q => geh(q, sicht)); };
    geh(holen(kind).wrap, true); return {teile, geos}; }
  return {start, rendere, rendereHaende, platzhalter, ausgabe, licht: (r, g, b) => { LICHT[0] = r; LICHT[1] = g; LICHT[2] = b; }, szene: s => { SZENE = s; }, FR, SPR, SPRH, bereit: () => !!E, haende: () => haende};
})();
