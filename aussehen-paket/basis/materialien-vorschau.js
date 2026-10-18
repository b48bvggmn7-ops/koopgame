// ============================================================================
// BASIS-MATERIALIEN des neuen Aussehens – so, wie sie in der Vorschau-Vorschau-Seite laufen.
// Das ist Vorschau-Code (eigene Seite, eigene Globals). NICHT 1:1 einkopieren, sondern ins Spiel übersetzen:
//   Aussehen, Farben, Zahlen, Reihenfolge der Zeichenschritte bleiben EXAKT gleich; nur die Anbindung (Kamera, Kachel-Daten,
//   Zwischenspeicher) richtet sich nach dem Spiel (js/12-welt-zeichnen.js, js/10b-design-look.js).
// Gewählte Standardwerte: wallK = 'B' („Alt“, Ziegel), soilK = 'A' („Fein“, #533b2c), Gras „Weich“, outK = 'A' („Weich“).
// ============================================================================

let wallK = 'B', soilK = 'A', outK = 'A';   // Standardwerte
let g;   // Zeichen-Kontext der Vorschau (im Spiel: der jeweilige ctx)

// ---- rnd ----
function rnd(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

// ---- hsh ----
const hsh = (i, j) => { const v = Math.sin(i*127.1 + j*311.7)*43758.5453; return v - Math.floor(v); };   // fester Pseudo-Zufall pro Kachel

// ---- EA ----
const EA={gd:'#23a257',gt:'#5fe093',grass:'#34c46c',edge:'26,18,12'};

// ---- SOILBASE ----
const SOILBASE={A:'#533b2c',B:'#533b2c',C:'#4c3628'};

// ---- wallTile ----
function wallTile(k,r,st){const x=k.x,y=k.y;g.save();g.beginPath();g.rect(x,y,40,40);g.clip();
 if(st=='A'){g.fillStyle='#4f5b64';g.fillRect(x,y,40,40);const h1=12+Math.floor(r()*16);
  [[0,h1],[h1,40]].forEach(([a,b])=>{let sx=0;while(sx<38){let w=9+r()*17;if(40-sx-w<9)w=40-sx;const cl=['#a9b6bf','#97a5af','#b6c2ca','#8a98a3','#a3b0a6'][Math.floor(r()*5)];
   g.beginPath();g.roundRect(x+sx+1,y+a+1,w-2,b-a-2,4);g.fillStyle=cl;g.fill();
   g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.roundRect(x+sx+2.5,y+a+2,Math.max(1,w-5),2.2,1);g.fill();
   g.fillStyle='rgba(30,40,48,.22)';g.beginPath();g.roundRect(x+sx+2,y+b-4.5,Math.max(1,w-4),2.5,1);g.fill();
   if(r()<.18){g.fillStyle='rgba(88,150,76,.55)';g.beginPath();g.ellipse(x+sx+w*(.3+r()*.4),y+a+3,w*.28,2.6,0,0,7);g.fill()}
   sx+=w}})}
 else if(st=='B'){g.fillStyle='#7d7062';g.fillRect(x,y,40,40);
  for(let j=0;j<4;j++){const row=Math.round(y/10)+j,off=(row&1)?10:0;
   for(let bx=off-20;bx<40;bx+=20){if(bx+20<=0)continue;const ci=Math.floor((x+bx)/20),hv=hsh(ci,row),by=y+j*10;
    g.fillStyle=['#b98a66','#a97b5a','#c49872','#9b6f50','#b08868'][Math.floor(hv*5)];g.beginPath();g.roundRect(x+bx+1,by+1,18,8,1.5);g.fill();
    g.fillStyle='rgba(255,235,200,.25)';g.fillRect(x+bx+2,by+1,16,1.5);g.fillStyle='rgba(40,20,10,.25)';g.fillRect(x+bx+2,by+7,16,2);
    if(hsh(ci*3+1,row)<.22){g.fillStyle='rgba(92,150,70,.65)';g.beginPath();g.ellipse(x+bx+6+hsh(ci,row+9)*8,by+8,5,2.4,0,0,7);g.fill()}
    if(hsh(ci*5+2,row)<.1){g.strokeStyle='rgba(40,22,12,.5)';g.lineWidth=1;g.beginPath();g.moveTo(x+bx+8,by+1);g.lineTo(x+bx+11,by+5);g.lineTo(x+bx+9,by+9);g.stroke()}}}}
 else{g.fillStyle='#434d55';g.fillRect(x,y,40,40);const hv=hsh(x/40,y/40),gq=g.createLinearGradient(x,y,x+40,y+40);gq.addColorStop(0,hv<.5?'#a3b0b8':'#98a6ae');gq.addColorStop(1,hv<.5?'#7a8892':'#6f7d88');
  g.beginPath();g.roundRect(x+1.5,y+1.5,37,37,6);g.fillStyle=gq;g.fill();
  g.lineWidth=1.6;g.lineCap='round';g.strokeStyle='rgba(255,255,255,.38)';g.beginPath();g.moveTo(x+3.5,y+35);g.lineTo(x+3.5,y+8);g.quadraticCurveTo(x+3.5,y+3.5,x+8,y+3.5);g.lineTo(x+35,y+3.5);g.stroke();
  g.strokeStyle='rgba(20,28,34,.35)';g.beginPath();g.moveTo(x+36.5,y+6);g.lineTo(x+36.5,y+32);g.quadraticCurveTo(x+36.5,y+36.5,x+32,y+36.5);g.lineTo(x+6,y+36.5);g.stroke();
  if(r()<.45){g.strokeStyle='rgba(30,40,48,.5)';g.lineWidth=1.2;g.beginPath();const cx=x+10+r()*20;g.moveTo(cx,y+4);g.lineTo(cx-4,y+14);g.lineTo(cx+3,y+22);g.lineTo(cx-2,y+32);g.stroke()}
  g.strokeStyle='rgba(30,40,48,.2)';g.lineWidth=1;for(let i=0;i<3;i++){const px=x+8+r()*24,py=y+9+r()*22;g.beginPath();g.moveTo(px,py);g.lineTo(px+4,py-1.5);g.stroke()}
  if(r()<.35){for(let i=0;i<5;i++){g.fillStyle='rgba(150,172,108,'+(.35+r()*.3)+')';g.beginPath();g.arc(x+8+r()*24,y+8+r()*24,1+r()*2,0,7);g.fill()}}}
 g.restore()}

// ---- grain ----
function grain(q,x,y,r){const k=soilK;
 q.save();const area=1600;
 if(k=='A'){for(let i=0;i<area/4.5;i++){const px=x+r()*40,py=y+r()*40,v=r(),sz=.45+r()*.75;q.fillStyle=v<.4?'rgba(214,184,148,'+(.2+r()*.3)+')':v<.85?'rgba(28,16,8,'+(.25+r()*.3)+')':'rgba(168,128,92,'+(.3+r()*.3)+')';q.fillRect(px,py,sz,sz)}}
 else if(k=='B'){for(let i=0;i<area/10;i++){const px=x+r()*40,py=y+r()*40,v=r(),sz=.8+r()*1.5;q.fillStyle=v<.4?'rgba(214,184,148,'+(.22+r()*.3)+')':v<.85?'rgba(28,16,8,'+(.28+r()*.3)+')':'rgba(168,128,92,'+(.3+r()*.3)+')';q.fillRect(px,py,sz,sz)}}
 else{for(let i=0;i<area/16;i++){const px=x+r()*40,py=y+r()*40,sz=1.3+r()*r()*4.2,e=sz*(.65+.35*r()),ro=r()*3;
   q.fillStyle='rgba(12,6,2,.45)';q.beginPath();q.ellipse(px+sz*.25,py+sz*.35,sz*.95,e*.9,ro,0,7);q.fill();
   q.fillStyle=['#4a3427','#56402f','#3d2a1f','#604636','#33231a'][Math.floor(r()*5)];q.beginPath();q.ellipse(px,py,sz,e,ro,0,7);q.fill();
   q.fillStyle='rgba(206,166,126,'+(.18+r()*.3)+')';q.beginPath();q.ellipse(px-sz*.28,py-sz*.34,sz*.5,e*.28,ro,0,7);q.fill()}}
 q.restore()}

// ---- outlineDraw ----
function outlineDraw(q,edge,clipP,st,sc){if(st=='O')return;
 if(st=='B'||st=='C'){q.save();q.globalCompositeOperation='destination-over';q.filter='blur('+(4*sc)+'px)';q.translate(0,1.5);q.strokeStyle='rgba(4,20,8,.3)';q.lineWidth=9;q.lineJoin='round';q.stroke(edge);q.restore()}
 if(st=='A'||st=='C'){q.save();q.lineJoin='round';q.lineCap='round';q.clip(clipP);q.strokeStyle='rgba(40,25,14,.5)';q.lineWidth=3.5;q.stroke(edge);q.restore()}}

// ---- roughEdge ----
function roughEdge(q,cells){const colOf=t=>t==1?SOILBASE[soilK]:t==3?'#c9a874':({O:'#98a8b2',A:'#97a5af',B:'#a97b5a',C:'#7a8892'})[wallK];
 cells.forEach(k=>{const col=colOf(k.t),segs=[];if(!k.wl)segs.push({v:1,px:k.x,o:-1});if(!k.e)segs.push({v:1,px:k.x+40,o:1});if(!k.s)segs.push({v:0,py:k.y+40,o:1});
  segs.forEach(sg=>{for(let u=7;u<34;u+=5){const X=sg.v?sg.px:k.x+u,Y=sg.v?k.y+u:sg.py,h=hsh(X*.37+1,Y*.53+2),h2=hsh(X*.91+7,Y*.29+3),ox=sg.v?sg.o:0,oy=sg.v?0:sg.o;
   if(h<.3){const rr=1.6+h2*3;q.save();q.globalCompositeOperation='destination-out';q.beginPath();q.ellipse(X-ox*rr*.35,Y-oy*rr*.35,rr,rr*.9,0,0,7);q.fill();q.restore()}
   else if(h>.85){const rr=1.4+h2*2.4;q.fillStyle=col;q.beginPath();q.ellipse(X+ox*rr*.4,Y+oy*rr*.4,rr,rr*.85,0,0,7);q.fill()}}})})}

// ---- buildChunk ----
function buildChunk(ci){const x0=ci*CHK,w=Math.ceil((CHK+8)*S),h=Math.ceil((YB-YT)*S),c=document.createElement('canvas');c.width=w;c.height=h;const q=c.getContext('2d');const sv=g;g=q;q.setTransform(S,0,0,S,-(x0-4)*S,-YT*S);
 const r=rnd(ci*7919+13),c0=Math.floor((x0-4)/40)-1,c1=Math.floor((x0+CHK+4)/40)+1,PG=new Path2D(),PW=new Path2D(),PC=new Path2D(),PA=new Path2D(),edge=new Path2D(),cells=[];
 for(let cc=c0;cc<=c1;cc++)for(let rr=-5;rr<=17;rr++){const t=Tc(cc,rr);if(!t)continue;const n=Tc(cc,rr-1)>0,s=Tc(cc,rr+1)>0,wl=Tc(cc-1,rr)>0,e=Tc(cc+1,rr)>0,rad=[(!n&&!wl)?9:0,(!n&&!e)?9:0,(!s&&!e)?9:0,(!s&&!wl)?9:0],x=cc*40,y=rr*40;
  (t==1?PG:t==2?PW:PC).roundRect(x,y,40,40,rad);PA.roundRect(x,y,40,40,rad);cells.push({t,x,y,n,s,wl,e,rad,cc,rr,nG:Tc(cc,rr-1)==1});
  if(!n){edge.moveTo(x+rad[0],y);edge.lineTo(x+40-rad[1],y)}if(!e){edge.moveTo(x+40,y+rad[1]);edge.lineTo(x+40,y+40-rad[2])}if(!s){edge.moveTo(x+40-rad[2],y+40);edge.lineTo(x+rad[3],y+40)}if(!wl){edge.moveTo(x,y+40-rad[3]);edge.lineTo(x,y+rad[0])}
  if(rad[0]){edge.moveTo(x,y+rad[0]);edge.arc(x+rad[0],y+rad[0],rad[0],Math.PI,1.5*Math.PI)}if(rad[1]){edge.moveTo(x+40-rad[1],y);edge.arc(x+40-rad[1],y+rad[1],rad[1],1.5*Math.PI,2*Math.PI)}if(rad[2]){edge.moveTo(x+40,y+40-rad[2]);edge.arc(x+40-rad[2],y+40-rad[2],rad[2],0,.5*Math.PI)}if(rad[3]){edge.moveTo(x+rad[3],y+40);edge.arc(x+rad[3],y+40-rad[3],rad[3],.5*Math.PI,Math.PI)}}
 const CG=cells.filter(k=>k.t==1),CW=cells.filter(k=>k.t==2),CC=cells.filter(k=>k.t==3);
 // Erde
 if(CG.length){g.fillStyle=SOILBASE[soilK];g.fill(PG);g.save();g.clip(PG);
  CG.forEach(k=>{
   if(show.wolken&&r()<.35){const bx=k.x+r()*40,by=k.y+r()*40,bw=14+r()*22,bq=g.createRadialGradient(bx,by,0,bx,by,bw);bq.addColorStop(0,r()<.5?'rgba(140,100,70,.1)':'rgba(20,10,5,.12)');bq.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=bq;g.beginPath();g.ellipse(bx,by,bw,bw*.6,0,0,7);g.fill()}
   grain(q,k.x,k.y,r)});
  // Gras: Kappe auf freien Oberseiten
  CG.forEach(k=>{if(k.nG)return;const xa=k.x,xb=k.x+40,y=k.y;const sg=g.createLinearGradient(0,y+12,0,y+26);sg.addColorStop(0,'rgba('+EA.edge+',.24)');sg.addColorStop(1,'rgba('+EA.edge+',0)');g.fillStyle=sg;g.fillRect(xa,y+12,40,14);
   g.beginPath();g.moveTo(xa,y-3);g.lineTo(xb+.5,y-3);for(let px=xb+.5;px>=xa;px-=5)g.lineTo(px,y+12+waveY(px));g.lineTo(xa,y+12+waveY(xa));g.closePath();g.fillStyle=EA.grass;g.fill();
   g.strokeStyle=EA.gd;g.lineWidth=2.5;g.beginPath();for(let px=xa;px<=xb+.5;px+=5){const yy=y+13+waveY(px);px==xa?g.moveTo(px,yy):g.lineTo(px,yy)}g.stroke();g.fillStyle=EA.gt;g.fillRect(xa,y+2,40.5,3)});
  if(show.seiten)CG.forEach(k=>{[[!k.wl,-1],[!k.e,1]].forEach(([ex,dir])=>{if(!ex)return;const xe=dir<0?k.x:k.x+40,ya=k.n?k.y:k.y-3;let yb=k.y+40;if(k.s&&Tc(k.cc+dir,k.rr+1)>0)yb+=12;
   const inn=py=>xe-dir*(12+waveY(py));g.beginPath();g.moveTo(xe+dir*3,ya);g.lineTo(xe+dir*3,yb);for(let py=yb;py>=ya;py-=5)g.lineTo(inn(py),py);g.closePath();g.fillStyle=EA.grass;g.fill();
   g.strokeStyle=EA.gd;g.lineWidth=2.5;g.beginPath();for(let py=ya;py<=yb;py+=5){const xx=inn(py)-dir*1;py==ya?g.moveTo(xx,py):g.lineTo(xx,py)}g.stroke();g.fillStyle=EA.gt;g.fillRect(dir<0?xe+2:xe-5,ya,3,yb-ya)})});
  if(show.unten)CG.forEach(k=>{if(k.s)return;const xa=k.x,xb=k.x+40,yb=k.y+40;g.beginPath();g.moveTo(xa,yb+3);g.lineTo(xb+.5,yb+3);for(let px=xb+.5;px>=xa;px-=5)g.lineTo(px,yb-12+waveY(px+9));g.lineTo(xa,yb-12+waveY(xa+9));g.closePath();g.fillStyle=EA.grass;g.fill();
   g.strokeStyle=EA.gd;g.lineWidth=2.5;g.beginPath();for(let px=xa;px<=xb+.5;px+=5){const yy=yb-13+waveY(px+9);px==xa?g.moveTo(px,yy):g.lineTo(px,yy)}g.stroke();g.fillStyle=EA.gt;g.fillRect(xa,yb-5,40.5,3)});
  g.restore()
  CG.forEach(k=>{if(k.n)return;[[1,k.x+40],[-1,k.x]].forEach(([dir,xw])=>{const nb=dir>0?k.e:k.wl;if(!nb||Tc(k.cc+dir,k.rr-1)<=0)return;const y=k.y;
   g.beginPath();g.moveTo(xw,y+12+waveY(xw));g.lineTo(xw,y-14);g.quadraticCurveTo(xw-dir*3,y-9,xw-dir*17,y+1);g.lineTo(xw-dir*17,y+14);g.closePath();g.fillStyle=EA.grass;g.fill();
   g.strokeStyle=EA.gd;g.lineWidth=2;g.beginPath();g.moveTo(xw-dir*1,y-14);g.quadraticCurveTo(xw-dir*4,y-9,xw-dir*17,y+1.5);g.stroke();
   g.strokeStyle=EA.gt;g.lineWidth=1.6;g.beginPath();g.moveTo(xw-dir*1.5,y-11);g.quadraticCurveTo(xw-dir*3.5,y-6,xw-dir*12,y-.5);g.stroke()})})}
 // Bröckelblöcke
 if(CC.length){CC.forEach(k=>crumbTile(k,r))}
 // Ziegelwand
 if(CW.length){g.fillStyle='#98a8b2';g.fill(PW);g.save();g.clip(PW);CW.forEach(k=>{if(wallK!='O'){wallTile(k,r,wallK)}else{const gq=g.createLinearGradient(0,k.y,0,k.y+40);gq.addColorStop(0,'#a9b8c1');gq.addColorStop(.5,'#8796a0');gq.addColorStop(1,'#a2b1ba');g.fillStyle=gq;g.fillRect(k.x,k.y,40,40);
   for(let j=0;j<2;j++){const yy=k.y+j*20,v=r(),v2=r();g.fillStyle=v>.5?'rgba(255,255,255,'+((v-.5)*.16)+')':'rgba(30,40,48,'+((.5-v)*.14)+')';g.fillRect(k.x+1,yy+1,38,18);g.fillStyle='rgba(58,70,79,.42)';g.fillRect(k.x,yy-1,40,2);g.fillRect(k.x+(j?20:0)-1,yy,2,20)}}
   if(!k.n){g.fillStyle='rgba(255,255,255,.3)';g.fillRect(k.x+2,k.y+1.5,36,1.5);g.fillStyle='#5aa35a';g.beginPath();g.moveTo(k.x,k.y-2);g.lineTo(k.x+40,k.y-2);for(let px=k.x+40;px>=k.x;px-=5)g.lineTo(px,k.y+6+waveY(px)*.8);g.closePath();g.fill();g.fillStyle='#7cc36f';g.fillRect(k.x,k.y,40,2)}
   if(!k.wl&&r()<.5){g.fillStyle='rgba(90,163,90,.55)';g.beginPath();g.ellipse(k.x+3,k.y+10+r()*20,5+r()*4,4,0,0,7);g.fill()}});g.restore()}
 if(show.bruch)roughEdge(g,cells);outlineDraw(g,edge,PA,outK,SC);
 // Deko
 const rec={c,x0,tufts:[],fine:[],agaves:[],flowers:[],thick:[]};
 if(show.unten)CG.forEach(k=>{if(k.s)return;const xa=k.x;for(let x=xa+4;x<xa+40;x+=8+r()*6){const n=3+Math.floor(r()*2),bl=[];for(let i=0;i<n;i++)bl.push({dx:(i-(n-1)/2)*1.2,a:(i-(n-1)/2)*.3+(r()-.5)*.3,hf:.5+r()*.55});rec.fine.push({x,y:k.y+40-1,h:5+r()*7,ph:r()*6.28,bl,fine:1,dn:1})}});
 CG.forEach(k=>{if(k.n)return;const xa=k.x,y=k.y;
  for(let x=xa+3;x<xa+40;x+=7+r()*6){const n=4+Math.floor(r()*3),bl=[];for(let i=0;i<n;i++)bl.push({dx:(i-(n-1)/2)*1.1,a:(i-(n-1)/2)*.3+(r()-.5)*.3,hf:.5+r()*.55});rec.fine.push({x,y:y+1,h:5+r()*8,ph:r()*6.28,bl,fine:1})}
  if(r()<.7){const n=3+Math.floor(r()*3),bl=[];for(let i=0;i<n;i++)bl.push({dx:(i-(n-1)/2)*1.7,a:(i-(n-1)/2)*.26+(r()-.5)*.25,hf:.55+r()*.5});rec.tufts.push({x:xa+r()*40,y:y+1,h:7+r()*9,ph:r()*6.28,bl})}
  if(r()<.07)rec.agaves.push({x:xa+20,y,s:(.8+r()*.5)*.55,ph:r()*6});if(r()<.1)rec.flowers.push({x:xa+r()*40,y:y+3,h:(22+r()*24)*.75,ph:r()*6,c:Math.floor(r()*3)});if(r()<.06)mush(xa+10+r()*20,y+1,.7+r()*.4);
  for(let i=0;i<3;i++){if(r()<.8)rec.thick.push({x:xa+r()*40,y:y+10,s:POOL[Math.floor(r()*POOL.length)],ph:r()*6.28,k:1,rot:(r()-.5)*.3,amp:.075})}});
 g=sv;return rec}

// ---- pieceDraw ----
function pieceDraw(p){const [x,y,w,h,look]=p.m,q=p.c.getContext('2d');q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,p.c.width,p.c.height);q.setTransform(2,0,0,2,24*2,24*2);const sv=g;g=q;const r=rnd(w*7+h);const path=()=>{q.beginPath();q.roundRect(0,0,w,h,9)};
 if(look=='wall'&&wallK!='O'){path();q.fillStyle='#98a8b2';q.fill();q.save();path();q.clip();for(let cx=0;cx<w;cx+=40)for(let cy=0;cy<h;cy+=40)wallTile({x:cx,y:cy},r,wallK);q.restore()}
 else if(look=='wall'){path();q.fillStyle='#98a8b2';q.fill();q.save();path();q.clip();for(let cy=0;cy<h;cy+=20)for(let cx=-((cy/20&1)?20:0);cx<w;cx+=40){q.fillStyle='rgba(58,70,79,.42)';q.fillRect(cx-1,cy,2,20);q.fillRect(0,cy-1,w,2);const v=r();q.fillStyle=v>.5?'rgba(255,255,255,'+((v-.5)*.16)+')':'rgba(30,40,48,'+((.5-v)*.14)+')';q.fillRect(cx+1,cy+1,38,18)}q.fillStyle='rgba(255,255,255,.3)';q.fillRect(3,1.5,w-6,1.5);q.restore()}
 else{path();q.fillStyle=SOILBASE[soilK];q.fill();q.save();path();q.clip();for(let cx=0;cx<w;cx+=40)for(let cy=0;cy<h;cy+=40)grain(q,cx,cy,r);q.beginPath();q.moveTo(0,-3);q.lineTo(w,-3);for(let px=w;px>=0;px-=5)q.lineTo(px,12+waveY(px));q.closePath();q.fillStyle=EA.grass;q.fill();q.strokeStyle=EA.gd;q.lineWidth=2.5;q.beginPath();for(let px=0;px<=w;px+=5){px?q.lineTo(px,13+waveY(px)):q.moveTo(px,13+waveY(px))}q.stroke();q.fillStyle=EA.gt;q.fillRect(0,2,w,3);if(show.unten){q.beginPath();q.moveTo(0,h+3);q.lineTo(w,h+3);for(let px=w;px>=0;px-=5)q.lineTo(px,h-12+waveY(px+9));q.closePath();q.fillStyle=EA.grass;q.fill();q.strokeStyle=EA.gd;q.lineWidth=2.5;q.beginPath();for(let px=0;px<=w;px+=5){px?q.lineTo(px,h-13+waveY(px+9)):q.moveTo(px,h-13+waveY(px+9))}q.stroke();q.fillStyle=EA.gt;q.fillRect(0,h-5,w,3)}q.restore()}
 {const pp=new Path2D();pp.roundRect(0,0,w,h,9);outlineDraw(q,pp,pp,outK,2)}g=sv;p.done=1}
