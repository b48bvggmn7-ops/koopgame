// STACHELN „Stahl“ (spikeK = 'S'; die Varianten Busch/Beeren/Ranken/V sind verworfen, ihr Code steht nur noch zufällig mit drin).
// Vorschau-Code: Aussehen exakt übernehmen, Anbindung ans Spiel anpassen.

const THORN=(()=>{const S2=2,c=document.createElement('canvas');c.width=40*S2;c.height=40*S2;const q=c.getContext('2d');q.scale(S2,S2);
 q.fillStyle='rgba(20,12,6,.25)';q.beginPath();q.ellipse(20,38.5,19,2.4,0,0,7);q.fill();
 const th=[[6,6,-5],[15,3,3],[25,5,-3],[34,3,5]];
 th.forEach(([cx,tip,lean])=>{const hw=4.4;q.beginPath();q.moveTo(cx-hw,35);q.bezierCurveTo(cx-hw*.7,22,cx+lean*.4,12,cx+lean,tip);q.bezierCurveTo(cx+hw*.3+lean*.3,14,cx+hw*.9,24,cx+hw,35);q.closePath();
  const g2=q.createLinearGradient(cx-hw,0,cx+hw,0);g2.addColorStop(0,'#e2c496');g2.addColorStop(.5,'#9a6a42');g2.addColorStop(1,'#4e2c18');q.fillStyle=g2;q.fill();q.strokeStyle='#1e1208';q.lineWidth=1.5;q.lineJoin='round';q.stroke();
  q.fillStyle='#c4382a';q.beginPath();q.moveTo(cx+lean,tip-.3);q.quadraticCurveTo(cx+lean*.8,tip+3,cx+lean*.8-1.9,tip+6);q.lineTo(cx+lean*.8+1.9,tip+6.3);q.quadraticCurveTo(cx+lean*.9,tip+3,cx+lean,tip-.3);q.fill();
  q.fillStyle='rgba(255,246,220,.8)';q.beginPath();q.arc(cx+lean*.55-1.2,tip+9,.8,0,7);q.fill()});
 q.beginPath();q.moveTo(0,36.5);for(let x=0;x<=40;x+=4)q.lineTo(x,34.5+(x/4%2?1.6:-.4));q.lineTo(40,40);q.lineTo(0,40);q.closePath();const vg=q.createLinearGradient(0,33,0,40);vg.addColorStop(0,'#6b4a2c');vg.addColorStop(1,'#33200f');q.fillStyle=vg;q.fill();q.strokeStyle='#1e1208';q.lineWidth=1.2;q.stroke();
 q.fillStyle='rgba(255,226,170,.35)';q.fillRect(2,36.2,36,1);
 [[3,35,-.5],[13,34.5,.4],[22,35,-.4],[32,34.5,.5],[38,35.5,.2]].forEach(([x,y,r])=>{q.save();q.translate(x,y);q.rotate(r);q.fillStyle='#3fa457';q.strokeStyle='rgba(20,60,30,.8)';q.lineWidth=.8;q.beginPath();q.ellipse(0,-2.2,2.2,3.6,0,0,7);q.fill();q.stroke();q.restore()});
 return c})();
const mkSp=fn=>{const S2=4,c=document.createElement('canvas');c.width=160;c.height=160;const q=c.getContext('2d');q.scale(S2,S2);fn(q);return c};
function horn(q,cx,base,tip,hw,lean){const mid=(base+tip)/2+4;q.beginPath();q.moveTo(cx-hw,base);q.quadraticCurveTo(cx-hw*.5+lean*.2,mid,cx+lean,tip);q.quadraticCurveTo(cx+hw*.5+lean*.2,mid,cx+hw,base);q.closePath();
 const g2=q.createLinearGradient(cx-hw,0,cx+hw,0);g2.addColorStop(0,'#f2e0b4');g2.addColorStop(.5,'#c9a064');g2.addColorStop(.5001,'#8c5c34');g2.addColorStop(1,'#4c2c16');q.fillStyle=g2;q.fill();q.strokeStyle='#1b120a';q.lineWidth=1.5;q.lineJoin='round';q.stroke();
 q.fillStyle='rgba(255,255,255,.9)';q.beginPath();q.arc(cx-hw*.28+lean*.35,tip+(base-tip)*.3,.9,0,7);q.fill();
 q.fillStyle='rgba(190,30,25,.85)';q.beginPath();q.moveTo(cx+lean,tip);q.lineTo(cx+lean-2.2,tip+5);q.lineTo(cx+lean+2.2,tip+5);q.closePath();q.fill()}
const leaf=(q,x,y,r)=>{q.save();q.translate(x,y);q.rotate(r);q.fillStyle='#3fa457';q.strokeStyle='#1b120a';q.lineWidth=1;q.beginPath();q.ellipse(0,-2.4,2.3,3.8,0,0,7);q.fill();q.stroke();q.restore()};
const SP={S:SPIKE_SPRITE,
H:mkSp(q=>{q.fillStyle='rgba(20,40,16,.28)';q.beginPath();q.ellipse(20,38.8,21,2.6,0,0,7);q.fill();
 const xs=[4,12,20,28,36],hs=[7,12,6,13,8],ln=[-1.5,1,-1,1.5,-1];
 xs.forEach((cx,i)=>{const tip=hs[i]+2,l=ln[i],hw=4.4,base=33;q.beginPath();q.moveTo(cx-hw,base);q.bezierCurveTo(cx-hw*.8,base-8,cx+l-1,tip+8,cx+l*2.2,tip);q.bezierCurveTo(cx+l+1.6,tip+9,cx+hw*.8,base-8,cx+hw,base);q.closePath();
  const g2=q.createLinearGradient(cx-hw,0,cx+hw,0);g2.addColorStop(0,'#fff0c8');g2.addColorStop(.55,'#ebc486');g2.addColorStop(1,'#c58a4a');q.fillStyle=g2;q.fill();q.strokeStyle='rgba(110,60,24,.55)';q.lineWidth=.9;q.lineJoin='round';q.stroke();
  const g3=q.createLinearGradient(0,tip,0,tip+7);g3.addColorStop(0,'#e8452e');g3.addColorStop(1,'rgba(232,69,46,0)');q.fillStyle=g3;q.beginPath();q.moveTo(cx+l*2.2,tip);q.lineTo(cx+l*2.2-2.4+l*.2,tip+7);q.lineTo(cx+l*2.2+2.4+l*.2,tip+7);q.closePath();q.fill();
  q.fillStyle='rgba(255,255,255,.7)';q.beginPath();q.ellipse(cx-hw*.35+l*.3,base-9,.9,3.2,.1,0,7);q.fill()});
 q.beginPath();q.moveTo(-1,41);q.lineTo(-1,32);for(let i=0;i<=5;i++){const cx=i*8+4-4;q.arc(cx+4,32,6.6,Math.PI,0)}q.lineTo(41,41);q.closePath();
 const hg=q.createLinearGradient(0,24,0,40);hg.addColorStop(0,'#3fcf74');hg.addColorStop(.5,'#2bab5c');hg.addColorStop(1,'#1b7a40');q.fillStyle=hg;q.fill();
 q.save();q.clip();q.strokeStyle='#8df0a8';q.lineWidth=1.6;q.beginPath();for(let i=0;i<=5;i++){const cx=i*8;q.arc(cx+4,32.6,6,Math.PI*1.1,Math.PI*1.9)}q.stroke();q.fillStyle='rgba(8,50,24,.28)';q.fillRect(0,36.5,40,4);q.restore()}),
A:mkSp(q=>{q.fillStyle='rgba(30,20,10,.25)';q.beginPath();q.ellipse(20,38.5,19,2.5,0,0,7);q.fill();
 [[5,5,-2],[15,8,2],[25,5,-2],[35,8,2]].forEach(([cx,tip,l])=>horn(q,cx,34,tip,4.8,l));
 const B=q.createLinearGradient(0,33,0,40);B.addColorStop(0,'#86603a');B.addColorStop(.5,'#5e4026');B.addColorStop(1,'#3a2614');q.fillStyle=B;q.beginPath();q.roundRect(.5,33,39,6.5,3);q.fill();q.strokeStyle='#1b120a';q.lineWidth=1.3;q.stroke();
 q.fillStyle='rgba(255,226,170,.4)';q.fillRect(2.5,33.8,35,1);q.fillStyle='#b99a68';[5,15,25,35].forEach(x=>{q.beginPath();q.arc(x,36.6,1.2,0,7);q.fill()});leaf(q,2,34,-.6);leaf(q,38,34,.6)}),
B:mkSp(q=>{q.fillStyle='rgba(30,20,10,.25)';q.beginPath();q.ellipse(20,38.5,19,2.5,0,0,7);q.fill();
 [[7,5,-2.5],[17,3,0],[27,6,2],[34,10,2.5]].forEach(([cx,tip,l])=>horn(q,cx,30,tip,4.4,l));
 q.beginPath();q.arc(8,32,7.5,Math.PI,0);q.arc(20,29,9.5,Math.PI,0);q.arc(32,32,7.5,Math.PI,0);q.lineTo(39.5,39);q.lineTo(.5,39);q.closePath();
 const G=q.createLinearGradient(0,20,0,40);G.addColorStop(0,'#3fa457');G.addColorStop(1,'#1c5e32');q.fillStyle=G;q.fill();q.strokeStyle='#1b120a';q.lineWidth=1.5;q.lineJoin='round';q.stroke();
 q.fillStyle='rgba(190,255,190,.35)';[[8,27,5],[20,23,6],[32,27,5]].forEach(([x,y,r])=>{q.beginPath();q.ellipse(x-1,y,r*.7,r*.35,-.3,0,7);q.fill()});
 q.strokeStyle='rgba(10,50,24,.6)';q.lineWidth=1.1;[[8,33],[20,32],[32,33]].forEach(([x,y])=>{q.beginPath();q.moveTo(x-3,y);q.quadraticCurveTo(x,y-3,x+3,y);q.stroke()})}),
C:mkSp(q=>{q.fillStyle='rgba(30,20,10,.25)';q.beginPath();q.ellipse(20,38.5,19,2.5,0,0,7);q.fill();
 const wy=x=>31+3.6*Math.sin(x/40*Math.PI*2+.4);
 [[7,5,-2.5],[20,3,0],[33,6,2.5]].forEach(([cx,tip,l])=>horn(q,cx,wy(cx)+1,tip,5,l));
 q.lineCap='round';q.lineJoin='round';q.beginPath();for(let x=-2;x<=42;x+=2)x==-2?q.moveTo(x,wy(x)):q.lineTo(x,wy(x));
 q.strokeStyle='#1b120a';q.lineWidth=9.4;q.stroke();q.strokeStyle='#7a5632';q.lineWidth=6.2;q.stroke();q.strokeStyle='rgba(255,226,170,.4)';q.lineWidth=1.4;q.beginPath();for(let x=-2;x<=42;x+=2)x==-2?q.moveTo(x,wy(x)-1.6):q.lineTo(x,wy(x)-1.6);q.stroke();
 q.strokeStyle='rgba(30,16,8,.55)';q.lineWidth=1;[[11,0],[26,0]].forEach(([x])=>{q.beginPath();q.moveTo(x,wy(x)-2.6);q.lineTo(x+1,wy(x)+2.6);q.stroke()});leaf(q,12,wy(12)+2,2.4);leaf(q,28,wy(28)+2,2.6)})};
function bramble(seed,o){const K=4,PW=56,PH=52,c=document.createElement('canvas');c.width=PW*K;c.height=PH*K;const t1=document.createElement('canvas');t1.width=c.width;t1.height=c.height;const q=t1.getContext('2d'),r=rnd(seed*131+o.n);q.setTransform(K,0,0,K,8*K,12*K);q.lineCap='round';q.lineJoin='round';
 q.fillStyle='rgba(20,12,6,.28)';q.beginPath();q.ellipse(20,39,20,2.8,0,0,7);q.fill();
 if(o.mass){q.fillStyle='#1d6a3a';q.beginPath();q.ellipse(20,37,23,7.5,0,0,7);q.fill();for(let i=0;i<o.mass;i++){const x=-1+r()*42,y=22+r()*16,a=-Math.PI/2+(r()-.5)*1.7,L=10+r()*9,Wd=4.6+r()*3.4;q.save();q.translate(x,y);q.rotate(a+Math.PI/2);const g2=q.createLinearGradient(0,0,0,-L);g2.addColorStop(0,'#17582f');g2.addColorStop(1,i%3?'#3f9c50':'#62b95a');q.fillStyle=g2;q.strokeStyle='rgba(8,40,18,.5)';q.lineWidth=.6;q.beginPath();q.moveTo(0,0);q.quadraticCurveTo(Wd,-L*.5,0,-L);q.quadraticCurveTo(-Wd,-L*.5,0,0);q.fill();q.stroke();q.strokeStyle='rgba(190,255,170,.35)';q.lineWidth=.5;q.beginPath();q.moveTo(0,-.5);q.lineTo(0,-L*.85);q.stroke();q.restore()}}
 const canes=[];for(let i=0;i<o.n;i++){const x0=4+(i+.3+r()*.4)*(32/o.n),dir=r()<.5?-1:1,top=-5+r()*o.hv,P=[[x0,41],[x0+dir*(4+r()*9),30],[x0-dir*(2+r()*10),16],[x0+dir*(6+r()*12)+(r()-.5)*8,top]];canes.push({P,w:o.w*(.8+r()*.4),z:r()});}
 canes.sort((a,b)=>a.z-b.z);
 const bz=(P,t)=>{const u=1-t;return[u*u*u*P[0][0]+3*u*u*t*P[1][0]+3*u*t*t*P[2][0]+t*t*t*P[3][0],u*u*u*P[0][1]+3*u*u*t*P[1][1]+3*u*t*t*P[2][1]+t*t*t*P[3][1]]};
 const leaves=[];
 canes.forEach(cn=>{const pts=[];for(let t=0;t<=1.001;t+=.04)pts.push(bz(cn.P,t));
  const strip=(wm,col)=>{for(let i=1;i<pts.length;i++){const t=i/pts.length;q.strokeStyle=typeof col=='function'?col(t):col;q.lineWidth=Math.max(.7,cn.w*(1-t*.78))*wm;q.beginPath();q.moveTo(pts[i-1][0],pts[i-1][1]);q.lineTo(pts[i][0],pts[i][1]);q.stroke()}};
  // thorns first (behind stem)
  let side=r()<.5?1:-1;for(let i=3;i<pts.length-1;i+=Math.max(2,o.te+Math.floor(r()*2))){const p=pts[i],pn=pts[i+1],tx=pn[0]-p[0],ty=pn[1]-p[1],L=Math.hypot(tx,ty)||1,nx=-ty/L*side,ny=tx/L*side,len=o.tl*(.75+r()*.5)*(1-i/pts.length*.4),bw=1.5+cn.w*.2;
   const bx=p[0],by=p[1],tipx=bx+nx*len*.75+tx/L*len*.55,tipy=by+ny*len*.75+ty/L*len*.55;
   const ax=tipx-bx,ay=tipy-by,AL=Math.hypot(ax,ay)||1,px=-ay/AL,py=ax/AL,mx=bx+ax*.42,my=by+ay*.42;
   q.beginPath();q.moveTo(bx+px*bw,by+py*bw);q.quadraticCurveTo(mx+px*bw*.28,my+py*bw*.28,tipx,tipy);q.quadraticCurveTo(mx-px*bw*.28-ay/AL*.8,my-py*bw*.28+ax/AL*.8,bx-px*bw,by-py*bw);q.closePath();
   const g2=q.createLinearGradient(bx,by,tipx,tipy);g2.addColorStop(0,'#3a1410');g2.addColorStop(.55,'#7a3a2a');g2.addColorStop(1,'#ecd0a0');q.fillStyle=g2;q.fill();q.strokeStyle='rgba(30,12,8,.5)';q.lineWidth=.5;q.stroke();side=-side;
   if(r()<o.lf)leaves.push([p[0],p[1],Math.atan2(ny,nx)])}
  strip(1.55,'rgba(28,12,10,.55)');strip(1,t=>mix('#5a2a26','#8a4a38',1-t*.9));strip(.32,'rgba(255,190,150,.35)');
  if(o.fl&&r()<o.fl){const p=pts[pts.length-2];[0,1,2,3,4].forEach(k=>{q.fillStyle=k%2?'#e0526a':'#c8344f';q.beginPath();q.ellipse(p[0]+Math.cos(k*1.26)*1.8,p[1]+Math.sin(k*1.26)*1.8-1,2,1.5,k*1.26,0,7);q.fill()});q.fillStyle='#f6d36a';q.beginPath();q.arc(p[0],p[1]-1,.9,0,7);q.fill()}});
 leaves.forEach(([x,y,a])=>{q.save();q.translate(x,y);q.rotate(a+Math.PI/2);const g2=q.createLinearGradient(0,-6,0,0);g2.addColorStop(0,'#58b862');g2.addColorStop(1,'#1f6a3a');q.fillStyle=g2;q.strokeStyle='rgba(10,40,20,.5)';q.lineWidth=.5;q.beginPath();q.moveTo(0,0);q.quadraticCurveTo(3.2,-3,0,-7);q.quadraticCurveTo(-3.2,-3,0,0);q.fill();q.stroke();q.restore()});
 const o2=c.getContext('2d');o2.filter='blur(1.1px)';o2.drawImage(t1,0,0);o2.filter='none';o2.globalAlpha=.55;o2.drawImage(t1,0,0);return c}
const BRV={R1:{n:3,hv:8,w:7,tl:15,te:2,lf:.2,fl:0,mass:0},R2:{n:3,hv:8,w:6.5,tl:14,te:2,lf:.3,fl:0,mass:18},R3:{n:3,hv:8,w:6.5,tl:13,te:2,lf:.5,fl:.9,mass:12}};
const BRC={};
function vines(seed){const K=4,PW=64,PH=74,c=document.createElement('canvas');c.width=PW*K;c.height=PH*K;const q=c.getContext('2d');
 let a=seed*7919+13;const r=()=>(a=(a*16807)%2147483647)/2147483647;
 q.setTransform(K,0,0,K,12*K,34*K);
 {const b=bramble(seed,Object.assign({},BRV.R2,{n:1,w:.1,tl:0,hv:0,mass:30}));q.save();q.setTransform(1,0,0,1,0,0);q.drawImage(b,4*K,22*K);q.restore()}
 q.fillStyle='rgba(20,40,16,.28)';q.beginPath();q.ellipse(20,38.8,22,2.8,0,0,7);q.fill();
 const cols=[['#2a0e0c','#5a2418','#7a3a2a'],['#2e100e','#74301e','#a04c34'],['#341210','#8a3a26','#c0664a']];
 const layers=[[2,16,20,2],[21,16,19,1]];   // [cy, ry, rx, Tiefe 0=hinten..2=vorn] von oben nach unten
 const loops=[];
 layers.forEach(([cy,ry,rx,dp],li)=>{const sp=18+r()*4;let x=-8+r()*sp;while(x<50){loops.push({x:x+(r()-.5)*2.4,y:cy+(r()-.5)*3.5,rx:rx*(.85+r()*.3),ry:ry*(.85+r()*.3),rot:(r()-.5)*.7,dp:li});x+=sp*(.9+r()*.2)}});
 loops.sort((p,q2)=>p.dp-q2.dp);
 loops.forEach(L=>{const cl=cols[L.dp+1],w=6.4;
  const P=t=>{const ex=Math.cos(t)*L.rx,ey=Math.sin(t)*L.ry,cr=Math.cos(L.rot),sr=Math.sin(L.rot);return[L.x+ex*cr-ey*sr,L.y+ex*sr+ey*cr]};
  const arc=(t0,t1,lw,col)=>{q.beginPath();for(let k=0;k<=24;k++){const p=P(t0+(t1-t0)*k/24);k?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1])}q.lineWidth=lw;q.strokeStyle=col;q.lineCap='round';q.stroke()};
  // Rückseite (oben im Bild, dünner/dunkler), Vorderseite (unten, dick, mit Drehung)
  arc(Math.PI,Math.PI*2,w*.8+1.6,cl[0]);arc(Math.PI,Math.PI*2,w*.8,cl[1]);
  arc(0,Math.PI,w+2.2,cl[0]);arc(0,Math.PI,w,cl[1]);
  for(let k=0;k<=18;k++){const t=Math.PI*k/18,p=P(t),p2=P(t+.05),dx=p2[0]-p[0],dy=p2[1]-p[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,ux=dx/l,uy=dy/l,sg=k%2?1:-1;q.strokeStyle=sg>0?cl[2]:cl[0];q.lineWidth=1.1;q.beginPath();q.moveTo(p[0]+nx*w*.46-ux*1.3*sg,p[1]+ny*w*.46-uy*1.3*sg);q.lineTo(p[0]-nx*w*.46+ux*1.3*sg,p[1]-ny*w*.46+uy*1.3*sg);q.stroke()}
  arc(.15,Math.PI-.15,Math.max(.8,w*.16),'rgba(255,215,175,.45)');
  // Klingen/Dornen: nach außen
  [[-1.75],[-1.25],[1.3]].forEach(([t])=>{const p=P(t),p2=P(t+.04),dx=p2[0]-p[0],dy=p2[1]-p[1],l=Math.hypot(dx,dy)||1;let nx=dy/l,ny=-dx/l;const cx=L.x-p[0],cy2=L.y-p[1];if(nx*cx+ny*cy2>0){nx=-nx;ny=-ny}
   const ln=9+r()*5,bw=2.4,px=-ny,py=nx,tx=p[0]+nx*ln,ty=p[1]+ny*ln;
   q.beginPath();q.moveTo(p[0]+px*bw,p[1]+py*bw);q.lineTo(tx,ty);q.lineTo(p[0]-px*bw,p[1]-py*bw);q.closePath();
   const g=q.createLinearGradient(p[0],p[1],tx,ty);g.addColorStop(0,'#4a1a10');g.addColorStop(.5,'#c9a47a');g.addColorStop(1,'#fff3dc');q.fillStyle=g;q.fill();q.strokeStyle='rgba(30,10,8,.6)';q.lineWidth=.5;q.stroke()});
 });
 return c}
function hsh2(n){n=(n*2654435761)>>>0;n^=n>>>13;n=(n*1597334677)>>>0;return (n^(n>>>16))>>>0}
function brambleFor(k,x,y){if(k==='V'){const h=hsh2(Math.floor(x/40))%24,key='V|'+h;return BRC[key]||(BRC[key]=vines(h))}const key=k+'|'+(Math.floor(x/40)%6);return BRC[key]||(BRC[key]=bramble(Math.floor(x/40)%6,BRV[k]))}
let spikeK='S';
const RUNS=[];{const m={};LV.spikes.forEach(([x,y,d])=>{(m[d+'|'+y]=m[d+'|'+y]||[]).push(x)});Object.keys(m).forEach(k=>{const [d,y]=k.split('|').map(Number),xs=m[k].sort((a,b)=>a-b);let st=xs[0],pv=xs[0];for(let i=1;i<=xs.length;i++){if(xs[i]!==pv+40){RUNS.push({x:st,y,d,w:pv+40-st});st=xs[i]}pv=xs[i]}})}
const RC={};
function thornRun(w,seed){const S2=2,c=document.createElement('canvas');c.width=Math.ceil(w*S2);c.height=80;const q=c.getContext('2d');q.scale(S2,S2);
 const yc=28,A=7.5,k=2*Math.PI/56,items=[],rr=rnd(seed*7+w);
 q.fillStyle='rgba(20,12,6,.25)';q.beginPath();q.ellipse(w/2,38.5,w/2-1,2.4,0,0,7);q.fill();
 for(let v=0;v<2;v++){const ph=v*Math.PI;let px=2,py=null;for(let x=2;x<=w-2;x+=2){const a=k*x+ph,y=yc+A*Math.sin(a),z=Math.cos(a);if(py!==null)items.push({z,t:0,x0:px,y0:py,x1:x,y1:y});px=x;py=y}
  for(let x=5+v*7;x<w-4;x+=9+rr()*5){const a=k*x+ph,y=yc+A*Math.sin(a),z=Math.cos(a);items.push({z:z+.01,t:1,x,y,len:12+rr()*6,lean:(rr()-.5)*1.3})}}
 items.push({z:0,t:2});items.sort((a,b)=>a.z-b.z);q.lineCap='round';q.lineJoin='round';
 items.forEach(it=>{if(it.t==0){q.strokeStyle='#2a0f18';q.lineWidth=6.8;q.beginPath();q.moveTo(it.x0,it.y0);q.lineTo(it.x1,it.y1);q.stroke();q.strokeStyle=it.z>0?'#8a3a4c':'#64283a';q.lineWidth=4.4;q.stroke();if(it.z>0){q.strokeStyle='rgba(255,176,196,.35)';q.lineWidth=1.1;q.beginPath();q.moveTo(it.x0,it.y0-1.2);q.lineTo(it.x1,it.y1-1.2);q.stroke()}}
  else if(it.t==1){const{x,y,len,lean}=it,tx=x+lean*len*.9,ty=y-len;q.beginPath();q.moveTo(x-3,y+1);q.quadraticCurveTo(x-1.2+lean*len*.3,y-len*.6,tx,ty);q.quadraticCurveTo(x+1.6+lean*len*.3,y-len*.45,x+3,y+1);q.closePath();q.fillStyle=it.z>0?'#f1e5c4':'#c9bb98';q.fill();q.strokeStyle='#2a0f18';q.lineWidth=1.2;q.stroke();q.fillStyle='#c4382a';q.beginPath();q.moveTo(tx,ty-.3);q.lineTo(tx-1.2-lean*1.5,ty+3.6);q.lineTo(tx+1.4-lean*1.5,ty+3.6);q.closePath();q.fill()}
  else{q.strokeStyle='#2a1a0c';q.lineWidth=7.8;q.beginPath();q.moveTo(1.5,yc);q.lineTo(w-1.5,yc);q.stroke();q.strokeStyle='#8a6638';q.lineWidth=5.4;q.stroke();q.strokeStyle='rgba(255,226,170,.35)';q.lineWidth=1.2;q.beginPath();q.moveTo(2,yc-1.6);q.lineTo(w-2,yc-1.6);q.stroke()}});
 return c}
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

// ---- Spiel-Elemente (echter Spielcode aus elemente/) ----
let LEVEL_W=40000,deathState=null,won=false;function die(){}
function rectsOverlap(){return false}
const VH=VHH,TILE=40,STEP=1000/60;let solids=LV.solids.map(([x,y,w,h,t])=>({x,y,w,h,type:t=='g'?'ground':t=='w'?'wall':'crumble'}));
const p1={x:-99999,y:-99999,w:30,h:46,vx:0,vy:0,grounded:true,male:true,facing:1,hookAttached:false},p2={x:-99999,y:-99999,w:30,h:46,vx:0,vy:0,grounded:true,male:false,facing:1,hookAttached:false};
const __gerr={};window.__gerr=__gerr;
const COLLIDE_EPS=0.01;
const SFX=new Proxy({},{get:()=>()=>{}});function dustPuff(){}
let LEVEL_H=720;
// 02-physik-werte.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Physik-Konstanten ----------
const GRAVITY = 0.62;
const MOVE_SPEED = 4.4;
const SPRINT_MAX_SPEED = 7.2;
const SPRINT_ACCEL = 0.045;
const AIR_CONTROL = 0.85;
const FRICTION_GROUND = 0.78;
const FRICTION_AIR = 0.94;
const JUMP_V = -12.6;
// Variable Sprunghöhe (nur der normale Sprung vom Boden): lässt man die Sprungtaste während des Aufstiegs los, wird die
// Aufwärts-Geschwindigkeit sanft auf JUMP_CUT_VY gebremst – nie beschleunigt, die bisherige Höchsthöhe bleibt die Grenze.
// JUMP_CUT_VY = die Geschwindigkeit, die ein Sprung nach JUMP_FULL_STEPS Schritten ohnehin hat: wer so lange hält
// (10 Schritte ≈ 0,19 s), springt genau so hoch wie früher; kürzer = stufenlos kleiner (Antippen ≈ 1 Kästchen).
const JUMP_FULL_STEPS = 10;
const JUMP_CUT_VY = JUMP_V + GRAVITY * JUMP_FULL_STEPS;   // -6,4
const JUMP_CUT_SMOOTH = 0.3;   // je Schritt bleibt die Hälfte des Überschusses -> Bremsen über 2–3 Schritte statt Ruck
const WALL_JUMP_VX_MIN = 6.96, WALL_JUMP_VX_MAX = 12.8;
const MIN_WALLJUMP_SPEED = 1.3; // unterhalb davon: kein Wandsprung mehr (kein "aus dem Stand")
const WALL_JUMP_VY_MIN = -14.4, WALL_JUMP_VY_MAX = -16.06;
const WALL_JUMP_BUFFER = 180; // Zeitfenster nach letztem Wandkontakt, Tastatur (Verlauf: 160 -> 200 -> 130 -> 170 -> 150 -> 180)
const WALL_JUMP_BUFFER_PAD = 250; // dasselbe, wenn der Sprung vom Controller kommt
const WALL_SLIDE_MAX_FALL = 2.4;
const MAX_FALL = 15;

// ---------- Leveldesign-Richtwerte Wandsprung (GEMESSEN, Kombi-Nachschärfen) ----------
// Gemessen mit einer Simulation der echten Spiel-Physik (Kamine 1–10 Kästchen breit, Reaktionszeit 0–20 Schritte, Affe und
// Schweinchen gleich). Das Prüfwerkzeug tests/kombi_pruefen.py liest diese Werte HIER (nicht doppelt pflegen).
// Kamin = zwei gegenüberliegende Wände; Breite = freie Kästchen dazwischen.
const KAMIN_ZU_ENG = 2;                          // ≤ 2 zu eng: 1 = nur 1,5 Reihen je Sprung (hektisch), 2 = reißt ab, wer > 0,1 s zögert
const KAMIN_BEQUEM_MIN = 3, KAMIN_BEQUEM_MAX = 5; // bequem: 4–5 Reihen je Sprung, verzeiht bis 0,37 s Reaktionszeit
const KAMIN_KNAPP_MAX = 7;                       // 6–7 knapp: Kette hält nur bei schneller Reaktion (≤ 0,17 s)
const KAMIN_MAX = 8;                             // 8 Grenze; ab 9 zu weit (Kette reißt ab, man fällt)
const WANDSPRUNG_HOEHE_JE_SPRUNG = 4.5;          // Reihen Steigung je Wandsprung im bequemen Kamin (= Höhenabstand Wand zu Wand)
const WAND_MIN_HOEHE = 4;                        // Reihen: niedriger springt man normal hinauf (Sprung 3,2 Reihen) -> kein Wandsprung nötig
// Einzelwand (Abstoßen in die Gegenrichtung): Scheitel 5 Reihen über dem Absprung, 5,6 Kästchen vor der Wand
const EINZELWAND_WEITE = {3: 8.1, 2: 8.8, 1: 9.6, 0: 9.9};   // weiteste Landung (Kästchen ab Wand) je Höhe über dem Absprung (Reihen)
const EINZELWAND_BEQUEM = 0.75;                  // bequem = bis 75 % dieser Weite
const WANDSPRUNG_SEGELN_WEITE = {3: 12.1, 0: 17.1};          // Schweinchen: Wandsprung + Schirm
// Wandsprung zum Haken (Fangfenster ≥ 0,5 s): 3–8 Kästchen vor der Wand, 6–8 Reihen über dem Absprung
const WANDSPRUNG_HAKEN_ABSTAND_MIN = 3, WANDSPRUNG_HAKEN_ABSTAND_MAX = 8, WANDSPRUNG_HAKEN_HOEHE_MIN = 6, WANDSPRUNG_HAKEN_HOEHE_MAX = 8;
const KOMBI_ABSTAND = 8;                         // Spalten: so nah müssen zwei Fähigkeiten liegen, damit es eine Kombi-Stelle ist

const HOOK_MAX_RANGE = 260; // Standard, falls ein Haken keinen eigenen Radius hat
function hookRange(h){ return (h && h.radius > 0) ? h.radius : HOOK_MAX_RANGE; }
const ROPE_ADJUST_SPEED = 4.2;   // Seil geben (runterlassen)
const ROPE_PULL_SPEED = 2.4;     // ranziehen – langsamer, damit es kontrolliert wirkt
const HOOK_MIN_LEN = 46;
const HOOK_RELEASE_BOOST = -4.5;
// Schwung holen am Seil (wie beim Schaukeln): die Laufen-Taste schiebt nur, wenn man in die Richtung drückt,
// in die die Figur gerade schwingt (oder sie fast stillhängt). Vorher: immer 0,35 -> Taste halten drückte die
// Figur sofort weit zur Seite (0,5 s halten = 45°, jetzt ~26°). Größer = mehr Schwung pro Druck.
const SWING_PUSH = 0.2;
// Loslassen vom Seil (Springen oder G): Schwung bleibt erhalten ("Abflug"), bis man landet oder eine Wand berührt.
// Vorher wurde er sofort auf Laufgeschwindigkeit (7,2) gekappt und ohne Taste stark gebremst -> "bleibt auf der Stelle".
const ROPE_FLING_MAX = 15;      // so schnell darf man nach dem Loslassen höchstens fliegen (Laufen: 7,2)
const ROPE_FLING_DRAG = 0.993;  // Luftbremse ohne Taste im Abflug (normal in der Luft: 0,94)
// Kein künstlicher Schub beim Loslassen (Nutzerwunsch): Abfluggeschwindigkeit = Schwunggeschwindigkeit.

const GLIDE_RAMP_MS = 2600;
const GLIDE_START_GRAV = 0.10;
const GLIDE_MAX_FALL_START = 2.0;
const GLIDE_MAX_FALL_END = 8.5;

// ---------- Nacht-Ausbau: neue Mechaniken (js/32-neue-bewegung.js; Werte aus der Spielwiese, spielwiese/js/02-werte.js) ----------
// Alles NEUE Konstanten – keine der Konstanten oben wurde geändert (harte Regel, Test bahnen_alte_mechaniken).
// Schritte = Physik-Schritte (60 = 1 Spielsekunde).
const DASH_TEMPO = 16;            // px pro Schritt (Spielwiese „Tempo“)
const DASH_DAUER = 10;            // Schritte (Spielwiese „Dauer“) -> 160 px gerade Strecke (Variante A „fester Dash“)
const DASH_BEHALTEN = 0.5;        // so viel Tempo bleibt nach dem Dash (nach oben höchstens die Sprungkraft)
const DASH_LUFT = 1;              // Dash-Punkte (Spielwiese „Luft-Dashes“ 1)
const DASH_LADEZEIT = 54;         // Schritte (0,9 s): so lange füllt sich ein Punkt – nur mit festem Halt (Boden, Wand, Seil, Haftfläche)
const DASH_PUFFER = 5;            // zu früh gedrückt (z. B. kurz vor der Landung): zählt so viele Schritte
const DASH_PAUSE = 6;             // Pause nach einem Dash am Boden (gegen Dauer-Dashen)
const DASH_STOPP = 2;             // kurzer Trefferstopp beim Start (Schritte)
const DASH_TEILSCHRITT = 8;       // px: der Dash bewegt sich in Teilschritten (nie durch eine Wand tunneln)
const BRUCH_BEHALTEN = 0.8;       // Durchbruch: so viel Dash-Tempo bleibt je zerbrochener Wand
const BRUCH_STOPP = 3;            // Trefferstopp beim Durchbruch (Schritte)
const BRUCH_FENSTER = 14;         // so lange nach einem Durchbruch geht noch ein Dash (kostenlos) oder ein Sprung in der Luft
const BRUCH_STUECKE = 7;          // Bruchstücke je Kästchen (nur Anzeige)
const BRUCH_NACHWACHSEN_STD = 3;  // Sekunden, wenn eine Wand „wächst nach“ hat (Option am Element)
const WAND_RUTSCH_MAX_FALL = 4.5; // Wand-Rutschen: schneller fällt man an einer Wand nicht (frei: bis MAX_FALL 15)
const HAFT_TEMPO = 4.2;           // Haftfläche: Tempo beim Entlangrollen (langsamer als Laufen 4,4 / Sprint 7,2)
const HAFT_BESCHL = 0.25;         // Haftfläche: Anteil je Schritt zum Ziel-Tempo (Schwung, kein sofortiges Anhalten)
const HAFT_ABSPRUNG_Y = 3;        // Absprung von der Haftfläche nach unten
const HAFT_ABSPRUNG_X = 5;        // … und nach vorn
const HAFT_KLEB_SCHWER = 0.25;    // an senkrechten Haftflächen: Anteil der Schwerkraft (rutscht langsam)
const HAFT_FANG = 2.5;            // px: so knapp unter der Haftfläche greift man zu

// ---------- Wasser und Schwimmen (Ausbau 5, elemente/wasser.js) ----------
// Alle Werte pro Physik-Schritt (60 Schritte = 1 Spielsekunde). Unter Wasser: kein Haken, kein Schirm.
const SWIM_ACCEL = 0.42;        // Schwimmen links/rechts/hoch/runter: Beschleunigung pro Schritt
const SWIM_MAX_SPEED = 3.6;     // höchstes Schwimmtempo (Laufen: 4,4)
const SWIM_DRAG = 0.9;          // Wasser-Widerstand (Tempo wird pro Schritt mit diesem Wert malgenommen)
const SWIM_AUFTRIEB = 0.07;     // ohne Taste treibt man langsam nach oben
const SWIM_KICK = 5.2;          // Schwimmstoß (Springen-Taste unter Wasser) nach oben
const SWIM_JUMP_OUT = -11.4;    // Springen an der Oberfläche: aus dem Wasser heraus (reicht auf einen Rand ~2 Kästchen höher)
const SWIM_RAUS_SCHRITTE = 6;   // so viele Schritte nach dem Aus-dem-Wasser-Springen bremst das Wasser nicht (sonst verpufft der Sprung)
const SWIM_SURFACE_GRAV = 0.25; // Kopf über Wasser: man sinkt sanft zurück, bis der Kopf gerade herausschaut
const SWIM_OBEN_ZONE = 16;      // px: so knapp unter der Oberfläche zieht es den Kopf kräftig nach oben (ruhiges Treiben)
// Luft je Figur: 12 Spielsekunden unter Wasser, Warnung (Blinken + Ticken) in den letzten 3 s, Luft leer = Tod
// (zurück zum Checkpoint). An der Oberfläche (Kopf über Wasser) ist die Luft in 1 s wieder voll.
const LUFT_MAX = 720;           // Schritte (12 s)
const LUFT_WARN = 180;          // Schritte (3 s) Vorwarnzeit
const LUFT_AUFFUELLEN = 12;     // Schritte Luft pro Schritt an der Oberfläche (leer -> voll in 1 s)
// Gemeinsame Luftblase: beide höchstens 2 Kästchen auseinander (Mitte zu Mitte) + jeder drückt seine Fähigkeitstaste
// (innerhalb von BLASE_RUF Schritten). Die Blase hält, bis sie weiter als BLASE_HALTEN auseinander schwimmen.
const BLASE_ABSTAND = 80;       // px: so nah müssen beide sein, damit die Blase entsteht
const BLASE_HALTEN = 130;       // px: weiter auseinander -> Blase platzt
const BLASE_RADIUS = 46;        // px: kleinste Größe der Blase (wächst mit dem Abstand der beiden)
const BLASE_RUF = 45;           // Schritte (0,75 s): so lange „wartet“ ein Tastendruck auf den des Partners
// Strömung (elemente/stroemung.js): Schub pro Schritt je Stärke-Stufe (schwach 1 / mittel 2 / stark 3). Mit dem
// Wasser-Widerstand ergibt das etwa: schwach -> man schwimmt gut gegenan, mittel -> nur knapp, stark -> gar nicht.
const STROEMUNG_KRAFT = 0.15;
const STROEMUNG_EXTRA = 4;      // so viel schneller als SWIM_MAX_SPEED darf eine Strömung jemanden tragen
const WASSER_PEGEL_TEMPO = 1.0; // px pro Schritt: so schnell steigt/sinkt das Wasser per Hebel/Schleuse (1 Kästchen in 0,7 s)
// Gedämpfter Ton unter Wasser (Tiefpass in Hz): ein Kopf unter Wasser etwas dumpfer, beide ganz dumpf
const WASSER_TON_EINER = 2600;
const WASSER_TON_BEIDE = 900;

// ---------- Fallen (Ausbau 7, Welt Ruinen; elemente/falle.js) – Schritte = Physik-Schritte (60 = 1 Spielsekunde) ----------
const FALLE_WARN = 45;          // so lange vorher glüht der Pfeil-Schlitz bzw. raucht die Flammen-Düse
const PFEIL_TEMPO = 8;          // px pro Schritt
const PFEIL_REICHWEITE = 1400;  // px, dann fällt der Pfeil weg (falls er nirgends stecken bleibt)
const PFEIL_STECKT = 30;        // so lange bleibt ein Pfeil nach dem Einschlag sichtbar
const FLAMME_LAENGE = 3;        // Kästchen weit speit die Flamme (Stein stoppt sie früher)
const FLAMME_BREITE = 26;       // px
const FLAMME_ANTEIL = 0.4;      // Anteil des Takts, in dem die Flamme brennt
// Pfeil-Aussehen (Ruinen-Überarbeitung; nur Anzeige – die Trefferfläche bleibt PFEIL_TREFFER × PFEIL_TREFFER um die Spitze)
const PFEIL_TREFFER = 10;       // px Kantenlänge der tödlichen Fläche um die Pfeilspitze (unverändert seit Ausbau 7)
const PFEIL_BILD_LAENGE = 52;   // px gezeichnete Länge (Spitze bis Federn), vorher 35
const PFEIL_BILD_DICKE = 5;     // px Schaft (vorher 3), dazu 2 px dunkler Umriss
const PFEIL_SCHWEIF = 46;       // px Bewegungsspur hinter einem fliegenden Pfeil
const PFEIL_LICHT = 95;         // px Lichtkreis um einen fliegenden Pfeil in dunklen Leveln (nachts lesbar; Design-Politur 2: vorher 70)
// Rollender Fels (elemente/fels.js)
const FELS_RADIUS = 50;         // px (Durchmesser 2,5 Kästchen)
const FELS_BESCHL = 0.08;       // so schnell kommt er auf sein Tempo (Anteil pro Schritt)
const FELS_STUFE = 12;          // so hohe Stufen nimmt er mit, höhere Kanten/Wände lassen ihn zerschellen
const FELS_WARN = 30;           // Ruinen-Überarbeitung: so viele Schritte (½ s) wackelt er vor dem Losrollen (fairer Start)
const FELS_ANKUENDIGUNG = 1.2;  // rollt er außerhalb des Bildes auf einen zu: Rumpeln/Staub am Bildrand ab diesem Abstand (× Bildbreite)
const FELS_PRALL = 0.25;        // Landet er aus großer Höhe (vy > 8), hüpft er mit diesem Anteil kurz zurück
const FELS_BROECKEL_BREMSE = 0.6;   // Bricht er durch eine Bröckel-Wand, behält er so viel Tempo
// Kamera-Wackeln (09-kamera.js): Stärke in px, klingt pro Schritt ab
const KAMERA_WACKELN_ABKLINGEN = 0.86;
// Licht (elemente/licht.js)
const LICHT_REICHWEITE = 80;    // so viele Kästchen läuft ein Lichtstrahl höchstens
const SPIEGEL_DREH_SCHRITTE = 18; // schaltbarer Spiegel: so lange (Physik-Schritte ≈ 0,3 s) dauert eine Drehung per Platte/Hebel
// Eis (elemente/eis.js)
const EIS_GRIFF = 0.16;         // Anteil der normalen Beschleunigung auf Eis (langsam anlaufen, langsam umdrehen)
const EIS_REIBUNG = 0.975;      // Abbremsen ohne Taste auf Eis pro Schritt (Boden: FRICTION_GROUND) – langer Rutschweg
// Förderband (elemente/foerderband.js) – Tempo kommt aus dem Level (langsam 1,6 / schnell 2,8 / reißend 8 px pro Schritt)
const BAND_NAH = 10;            // px: so knapp über dem Band nimmt es eine Figur auch in der Luft mit (Mini-Hüpfer im Tunnel)
// Leuchtkristall und Dunkelzone (elemente/leuchtkristall.js)
const LEUCHT_DAUER = 480;       // so viele Schritte (8 Spielsekunden) leuchtet ein angeschlagener Kristall
const LEUCHT_WARN = 120;        // in den letzten 2 Sekunden flackert er (Warnung)
const LEUCHT_RADIUS = 320;      // px Lichtkreis eines leuchtenden Kristalls
const LEUCHT_REICHWEITE = 70;   // so nah (px) muss eine Figur sein, um ihn anzuschlagen
const DUNKEL_STAERKE = 0.93;    // so dunkel ist eine Dunkelzone (0 … 1)
const DUNKEL_FIGUR = 95;        // px Lichtkreis um eine Figur in der Dunkelzone (sonst 230)
// Vulkan (Ausbau 7): steigende Lava (elemente/lava.js) und Stachelpresse (elemente/presse.js)
const LAVA_TEMPO = {langsam: 0.35, mittel: 0.6, schnell: 1.0};   // px pro Schritt, so schnell steigt/sinkt die Lava
const LAVA_GNADE = 6;           // so tief (px) muss eine Figur in der Lava stecken, bis sie verbrennt
const PRESSE_FALL = 14;         // px pro Schritt beim Herunterkrachen
const PRESSE_LIEGEN = 10;       // so viele Schritte bleibt die Presse unten liegen
const PRESSE_WARN = 30;         // so viele Schritte vor dem Fall zittert die Kette (Vorwarnung)

// ---------- Endgegner (Ausbau 6, elemente/boss.js) – Schritte = Physik-Schritte (60 = 1 Spielsekunde) ----------
const BOSS_AUFTRITT = 90;        // so lange steht der Boss nach Phasenstart/Tod still (Zeit zum Orientieren)
const BOSS_WECHSEL = 70;         // Sprung zum Platz der nächsten Phase
const BOSS_KOKOS = 3;            // Kokosnüsse pro Wurf
const BOSS_KOKOS_REGEN = 6;      // … beim Kokos-Regen
const BOSS_KOKOS_WARNUNG = 50;   // so lange warnt Schatten + Pfeil, bevor eine Kokosnuss fällt
const BOSS_WELLE_TEMPO = 5;      // Druckwelle am Boden (px pro Schritt) – drüberspringen
const BOSS_WELLE_HOEHE = 22;     // so hoch muss man über der Welle sein
const BOSS_ABPRALL = -10;        // Sprung auf den Kopf: so hoch prallt man ab
const BOSS_UNVERWUNDBAR = 70;    // nach einem Treffer
// ---------- Menü-Klänge (Design-Politur): Länge in ms; Cursor-Schritte höchstens alle MENU_TICK_ABSTAND ms ----------
const MENU_TON_MS = {tick: 40, ok: 65, start: 110};
const MENU_TICK_ABSTAND = 70;

// ---------- Computer-Partner (js/30-partner.js) – nur im Testmodus aus dem Editor; Schritte = Physik-Schritte ----------
const PARTNER_IM_HAUPTSPIEL = false;   // später: auch im Hauptspiel als Einzelspieler wählbar (Schalter, bewusst noch aus)
const PARTNER_REAKTION = [9, 15];      // Schritte (≈ 150–250 ms): so lange braucht er, bis er auf etwas Neues reagiert
const PARTNER_ABSTAND = 90;            // px: gemütlicher Abstand hinter mir (in Laufrichtung)
const PARTNER_ABSTAND_LOCKER = 40;     // px: innerhalb dieser Spanne um den Wunschplatz steht er einfach
const PARTNER_AUFHOLEN = 220;            // px: weiter weg -> zügig aufholen (normales Lauftempo), sonst gemütlich
const PARTNER_GEMUETLICH = 0.88;           // Anteil der Schritte mit gedrückter Lauftaste beim gemütlichen Folgen (kein Sprint)
const PARTNER_VORAUS = 64;             // Schritte, die er beim Springen vorausrechnet (Landeplatz sicher?)
const PARTNER_FEST = 540;              // Schritte (10 s) ohne Fortschritt -> „hänge fest“, wartet auf mich
const PARTNER_AUFGABE_ZEIT = 1800;     // Schritte (30 s) Standard-Zeitlimit einer Aufgabe
const PARTNER_AUTO_WEITE = 20 * 40;    // px: Auto-Aufgabe nur, wenn Hebel/Platte und Tür höchstens so weit auseinander (Bild-Regel)
const PARTNER_BUDGET = 1600;           // höchstens so viele vorausgerechnete Schritte je Spielschritt (≈ 4 ms, bleibt flüssig)
const PARTNER_BUDGET_GESAMT = 24000;   // … und je Überlegung insgesamt (verteilt auf mehrere Spielschritte: er „überlegt“ kurz)
const PARTNER_WEG_KNOTEN = 140;         // Wegsuche (Umwege, Kamine): höchstens so viele Standplätze ausprobieren …
const PARTNER_WEG_BUDGET = 120000;      // … und so viele Vorausschritte (≈ 1–2 s „überlegen“, verteilt auf viele Spielschritte)
const PARTNER_WEG_PAUSE = 300;          // Schritte: so lange keine neue Wegsuche zum selben Ziel, wenn keine gefunden wurde

function glanzBand(x, y, w, h, seed){
  const P = GLANZ.bandPeriode, t = (((performance.now() + (seed || 0)*613) % P) + P) % P / P;
  const bx = x - w*0.4 + t*w*1.8, b = Math.max(6, w*0.18);
  const g = ctx.createLinearGradient(bx - b, 0, bx + b, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${GLANZ.bandA})`); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.save(); ctx.fillStyle = g; ctx.beginPath();
  ctx.moveTo(bx - b + h*0.4, y); ctx.lineTo(bx + b + h*0.4, y); ctx.lineTo(bx + b - h*0.4, y + h); ctx.lineTo(bx - b - h*0.4, y + h); ctx.closePath();
  ctx.fill(); ctx.restore();
}
let haftZellenCache = {src: null, n: -1, zellen: new Set(), fest: new Set()};
function haftZellen(){
  if(haftZellenCache.src === solids && haftZellenCache.n === solids.length) return haftZellenCache;
  const zellen = new Set(), fest = new Set();
  for(const s of solids){
    if(s.type === 'oneway' || s.type === 'moveplat') continue;
    for(let x = s.x; x < s.x + s.w - 1; x += 40) for(let y = s.y; y < s.y + s.h - 1; y += 40){
      const k = Math.floor(x/40) + ',' + Math.floor(y/40);
      if(s.haft) zellen.add(k); else fest.add(k);
    }
  }
  haftZellenCache = {src: solids, n: solids.length, zellen, fest};
  return haftZellenCache;
}
const haftIst = (c, r) => haftZellen().zellen.has(c + ',' + r);
const festIst = (c, r) => { const H = haftZellen(); return H.zellen.has(c + ',' + r) || H.fest.has(c + ',' + r); };

function hebelInReichweite(){return false}
// elemente/00-register.js – Element-Register von "Monchichi Koop" (Ausbau 2).
// EIN Eintrag pro Spiel-Element mit allem, was dazugehört: Daten (Feld im Spiel-Format), Editor-Werkzeug
// (Knopf, Zeichnen, Export) und Spiel (Laden, Zeichnen, Logik). Die Dateien in elemente/ lädt das Spiel
// (index.html) UND der Editor (editor/index.html) – jede Seite benutzt nur ihren Teil. Klassische Skripte ohne Build.
// Beim Laden selbst darf eine Element-Datei nichts vom Spiel oder Editor benutzen (nur Funktionen definieren);
// alles andere (ctx, camX, TILE …) erst in den Funktionen, die Spiel bzw. Editor später aufrufen.
//
// Aufbau eines Eintrags (Beispiele: sprungpilz.js = Punkt-Element, aufwind.js = Kachel-Element):
//   id, name, feld          – Name im Spiel-Format (z. B. 'bouncers')
//   editor: { werkzeug      – data-tool des Knopfs
//             gruppe, vor   – Werkzeug-Gruppe = Reiter im Editor (gelaende, gefahren, licht, logik, haken, bewegung, wasser, boss, marken), vor = Werkzeug, vor dessen Knopf er steht
//             titel, farbe  – Tooltip und Farbfeld des Knopfs
//             bereich(p)    – (optional) Kästchen, die der Punkt im Editor SICHTBAR belegt (größer gezeichnet als sein
//                             Kästchen, z. B. Fels, Presse): Rechtsklick/Radierer wirken dort (Test editor_werkzeug_pruefung)
//             art           – 'punkt' (Liste {c,r} pro Kästchen) oder 'kachel' (Kästchen-Sorte im Raster)
//             ziehbar       – mit gedrückter Maus malbar
//             zeichnen(ctx, c, r, TILE)            – Editor-Bild eines Kästchens/Punkts
//             exportieren(liste, TILE, mergeRects) – Punkte bzw. Kästchen [{c,r}] -> Spiel-Format }
//   spiel:  { laden(daten)                         – Level-Daten übernehmen (setzt die Spiel-Liste)
//             zeichnen()                           – in der Welt zeichnen (12-welt-zeichnen.js)
//             nachBewegung(figur, warAmBoden, fallVy) – nach dem Bewegen einer Figur (08-figur-physik-seil.js)
//             schritt(figuren)                     – einmal pro Physik-Schritt (14-spielschleife.js, nach Hebeln/Türen)
//             zuruecksetzen()                      – Neustart/Tod, nachdem die Figuren neu aufgestellt sind
//             zeichnenVorne()                      – VOR den Figuren zeichnen (z. B. Wasser, Ausbau 5)
//             zeichnenHinten()                     – HINTER Boden und Wänden zeichnen (z. B. Lava, Ausbau 7)
//             zeichnenOben()                       – in Bildschirm-Koordinaten über allem (z. B. Boss-Lebensbalken, Ausbau 6) }
//   Editor-Extras (Ausbau 4): optionen [{key, label, titel, werte:[[wert, text]], zahl}] = eigene Auswahl-Felder neben dem
//   Knopf (neue Punkte bekommen die gewählten Werte); klick(punkt) = Klick auf einen vorhandenen Punkt;
//   neu(punkt, liste) = neuen Punkt anpassen (z. B. Teleporter-Paar); nummerAktiv(punkt) = zählt seine Nummer für die
//   ✓-Markierung?; zeichnenAlle(ctx, liste, TILE) = zusätzlich über alle Punkte zeichnen (z. B. Verbindungslinien).
//   Spiel-Teile, die sich selbst zeichnen (solids mit eigenem type), überspringt die Wand-/Boden-Zeichnung in
//   12-welt-zeichnen.js über ELEMENT_SOLID_TYPEN.
// Neue Elemente: Datei hier anlegen und in index.html + editor/index.html in die Lade-Liste eintragen
// (Checkliste in CLAUDE.md).
//   Elemente mit Verknüpfungs-Nummer (Hebel, Tür, Druckplatte): editor.mitNummer = true (Punkt bekommt link aus
//   „Verknüpfung“), editor.nummerName = Wort für die ✓-Markierung. Die SCHALT-LOGIK (was passiert, wenn eine Nummer
//   an/aus geht) steht gemeinsam im Verknüpfungs-System in js/05-level-objekte.js (setLink, updateDoorsAndSwitches),
//   weil dort Hebel, Türen, Druckplatten, bewegte Teile und Haken über die Nummern zusammenspielen.
const ELEMENTE = [];
function elementRegistrieren(def){ ELEMENTE.push(def); return def; }
const ELEMENT_SOLID_TYPEN = new Set();   // solids-Sorten, die ein Element selbst zeichnet (z. B. 'wechsel')
const elementNachWerkzeug = werkzeug => ELEMENTE.find(E => E.editor && E.editor.werkzeug === werkzeug) || null;
// (Editor) Kästchen mit Nummer zeichnen – für Hebel und Tür
function elementNummerZeichnen(ctx, c, r, TILE, color, dark, link){
  const cx = c*TILE+TILE/2, cy = r*TILE+TILE/2;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx-TILE*0.36,cy-TILE*0.36,TILE*0.72,TILE*0.72,5) : ctx.rect(cx-TILE*0.36,cy-TILE*0.36,TILE*0.72,TILE*0.72);
  ctx.fill();
  ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(link), cx, cy+1);
}
// (Editor + Spiel-Notlösung) Punkt mit Nummer ins Spiel-Format: Mitte des Kästchens
const elementPunktMitte = (liste, TILE) => liste.map(p => ({x: p.c*TILE+TILE/2, y: p.r*TILE+TILE/2, link: p.link}));

// ==== aufwind
// elemente/aufwind.js – Element „Aufwind“ (Kachel-Element; Aufbau siehe 00-register.js).
// Rechteck-Bereiche, die das Schweinchen mit offenem Schirm nach oben tragen (auch wenn sie gerade steigt);
// den Affen trägt er NICHT. Rolle: Schweinchen-Weg nach oben – der Affe braucht dort Haken/Wandsprung.
// Die Auftriebs-Rechnung selbst steht beim Segeln in 08-figur-physik-seil.js (WIND_LIFT, WIND_MAX_UP, inWind).
const WIND_LIFT = 1.15, WIND_MAX_UP = 6.5;
// (Spiel) Liste der Bereiche steht in `winds` (01-level.js): {x, y, w, h}
function inWind(player){
  const box = {x:player.x-player.w/2, y:player.y-player.h, w:player.w, h:player.h};
  return winds.some(w => rectsOverlap(box, w));
}
elementRegistrieren({
  id: 'aufwind', name: 'Aufwind', feld: 'winds',
  editor: {
    werkzeug: 'wind', gruppe: 'haken', vor: 'bounce', art: 'kachel', ziehbar: true,
    titel: 'Aufwind: trägt das Schweinchen mit offenem Schirm nach oben', farbe: '#a0dcff',
    kachelFarbe: 'rgba(160,220,255,0.28)',   // durchsichtig im Raster
    zeichnen(ctx, c, r, TILE){   // Pfeil nach oben
      ctx.strokeStyle = 'rgba(200,240,255,.75)'; ctx.lineWidth = 2;
      const X = c*TILE+TILE/2, Y = r*TILE;
      ctx.beginPath(); ctx.moveTo(X, Y+TILE-8); ctx.lineTo(X, Y+8); ctx.moveTo(X-6, Y+14); ctx.lineTo(X, Y+8); ctx.lineTo(X+6, Y+14); ctx.stroke();
    },
    exportieren: (zellen, TILE, mergeRects) => mergeRects(zellen),
  },
  spiel: {
    laden(daten){ winds = (daten.winds||[]).map(w=>({...w})); },
    // zarte, nach oben ziehende Luftschlieren und Blättchen
    zeichnen(){
      const tw = performance.now();
      for(const w of winds){
        const x0 = w.x - camX;
        if(x0 + w.w < -20 || x0 > VW + 20) continue;
        const gr = ctx.createLinearGradient(0, w.y + w.h, 0, w.y);
        gr.addColorStop(0, 'rgba(220,245,255,0.24)'); gr.addColorStop(1, 'rgba(220,245,255,0.04)');
        ctx.fillStyle = gr; ctx.fillRect(x0, w.y, w.w, w.h);
        // aufsteigende Blättchen
        for(let i = 0; i < Math.round(w.w*w.h/9000) + 2; i++){
          const ph = ((tw*0.00035 + i*0.618) % 1), lx = x0 + ((i*0.37) % 1)*w.w + Math.sin(tw*0.004 + i)*8, ly = w.y + w.h - ph*w.h;
          ctx.save(); ctx.translate(lx, ly); ctx.rotate(tw*0.006 + i); ctx.globalAlpha = Math.sin(ph*Math.PI);
          ctx.fillStyle = i % 2 ? '#8fd18a' : '#d8f0a0'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 2.4, 0, 0, Math.PI*2); ctx.fill();
          ctx.restore();
        }
        ctx.strokeStyle = 'rgba(240,252,255,0.75)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        const n = Math.max(2, Math.round(w.w/26));
        for(let i = 0; i < n; i++){
          const lx = x0 + (i + 0.5)*w.w/n;
          for(let k = 0; k < Math.ceil(w.h/90); k++){
            const ph = ((tw*0.0009 + i*0.37 + k*0.5) % 1), yy = w.y + w.h - ph*w.h;
            if(yy < w.y + 6) continue;
            ctx.globalAlpha = Math.sin(ph*Math.PI)*0.8;
            ctx.beginPath(); ctx.moveTo(lx + Math.sin(tw*0.003 + i + k)*4, yy);
            ctx.quadraticCurveTo(lx + 6, yy - 14, lx + Math.sin(tw*0.003 + i + k + 1)*4, yy - 28); ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }
    },
  },
});

// ==== durchbruch
// elemente/durchbruch.js – Element „Durchbruch-Wand“ (Nacht-Ausbau; Punkt-Element mit eigener Auswahl, siehe 00-register.js).
// Rissige Steinkästchen: fest wie Boden/Wand, aber ein DASH zerbricht sie (normales Laufen/Springen nicht – dann ist es eine
// ganz normale Wand bzw. ein normaler Boden). Trefferstopp, Kamera-Wackeln, Bruchstücke und Staub, ein Teil des
// Dash-Schwungs bleibt (BRUCH_BEHALTEN); kurz danach geht ein kostenloser Anschluss-Dash oder ein Sprung (BRUCH_FENSTER).
// Senkrecht (Wand), waagerecht (Boden, Decke) und in jeder Größe aus Kästchen baubar.
// Option „wächst nach“: nach X Sekunden ist das Kästchen wieder da – steht dort gerade jemand, wartet es (wie Türen und
// Wechselboden), niemand wird eingeklemmt. Standard: bleibt kaputt bis Neustart bzw. Tod (zurück zum Checkpoint).
// Die Bruch-Logik selbst (wann ein Dash bricht) steht in js/32-neue-bewegung.js (bruchTreffen).
// Rolle: wer dasht, bricht den Weg frei – beide Figuren können dashen; Rätsel trennen das z. B. so, dass der eine einen
// Hebel hält, während der andere die Wand im richtigen Moment durchbricht, oder der Durchbruch nur aus dem Seil-Schwung
// (Affe) bzw. aus dem Segeln (Schweinchen) erreichbar ist.
// Im Spiel: solids mit type 'bruch' {x, y, w, h, nachwachsen (s, 0 = nie), gone, bruchT, wartet}.
const BRUCH_LOOK = {
  dschungel: {hell: '#c8b08a', mitte: '#a38866', dunkel: '#5b4630', riss: '#3a2a1a', glut: null},
  ruinen:    {hell: '#e2c98f', mitte: '#c3a464', dunkel: '#7a6232', riss: '#4a3818', glut: null},
  hoehle:    {hell: '#a9b2c4', mitte: '#7f889c', dunkel: '#454b5c', riss: '#232733', glut: '#8fe3ff'},
  vulkan:    {hell: '#8a6a5a', mitte: '#664a3e', dunkel: '#382620', riss: '#1c1210', glut: '#ff8a3a'},
};
function bruchLook(){
  const w = (typeof levelLayers !== 'undefined' && levelLayers.welt) || (typeof levelTheme === 'string' ? levelTheme : 'dschungel');
  return BRUCH_LOOK[w] || BRUCH_LOOK[String(w).split('-')[0]] || BRUCH_LOOK.dschungel;
}
// feste Riss-Linien je Kästchen (aus der Lage, flackert nicht)
function bruchRisse(c, x, y, w, h, s, farbe, breite){
  let n = Math.abs(Math.floor(s*9301 + 49297)) % 233280;
  const rnd = () => (n = (n*9301 + 49297) % 233280) / 233280;
  c.save();
  if(farbe === 'erde'){
    for(let i = 0; i < (rnd() < .3 ? 1 : 2); i++){
      const px = x + 8 + rnd()*(w - 16), py = y + 14 + rnd()*(h - 22);
      for(let j = 0; j < 3; j++){ const qx = px + (rnd() - .5)*10, qy = py + (rnd() - .5)*6, r = 1.6 + rnd()*1.8;
        c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(qx + .4, qy + 1, r, r*.8, 0, 0, 7); c.fill();
        c.fillStyle = j ? 'rgba(206,176,134,.9)' : 'rgba(168,140,104,.95)'; c.beginPath(); c.ellipse(qx, qy, r, r*.8, 0, 0, 7); c.fill(); }
    }
  } else {
    // marode, modrige Wand: braune Tönung, dunklere Flecken unten, unregelmäßige Löcher und kurze Kratzer
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.fillStyle = 'rgba(78,56,30,.34)'; c.fillRect(x, y, w, h);
    const gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(34,24,12,.22)'); c.fillStyle = gr; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(96,104,48,.18)'; for(let i = 0; i < 2; i++){ c.beginPath(); c.ellipse(x + rnd()*w, y + rnd()*h, 5 + rnd()*5, 3 + rnd()*3, rnd()*3, 0, 7); c.fill(); }
    const nl = 2 + Math.floor(rnd()*2);
    for(let i = 0; i < nl; i++){
      const hx = x + 8 + rnd()*(w - 16), hy = y + 8 + rnd()*(h - 16), R = 3.2 + rnd()*3.4, pts = [];
      for(let j = 0; j < 8; j++){ const an = j/8*Math.PI*2, rr = R*(0.62 + rnd()*0.7); pts.push([hx + Math.cos(an)*rr*1.15, hy + Math.sin(an)*rr*0.85]); }
      const bahn = (dx, dy) => { c.beginPath(); pts.forEach((p, k) => k ? c.lineTo(p[0] + dx, p[1] + dy) : c.moveTo(p[0] + dx, p[1] + dy)); c.closePath(); };
      c.fillStyle = 'rgba(210,190,150,.4)'; bahn(.5, 1.3); c.fill();
      c.fillStyle = 'rgba(28,20,12,.9)'; bahn(0, 0); c.fill();
      c.fillStyle = 'rgba(0,0,0,.45)'; c.save(); c.translate(hx, hy); c.scale(.6, .6); c.translate(-hx, -hy); bahn(0, -.6); c.fill(); c.restore();
    }
    c.lineCap = 'round';
    { const bx = x + 5 + rnd()*(w - 22), by = y + 5 + rnd()*(h - 22), ang = 1.2 + rnd()*1.0;
      for(let k = 0; k < 2; k++){ const px = bx + k*3.2, py = by + rnd()*2, len = 8 + rnd()*9, ex = px + Math.cos(ang)*len, ey = py + Math.sin(ang)*len;
        c.strokeStyle = 'rgba(232,218,196,.34)'; c.lineWidth = .9; c.beginPath(); c.moveTo(px, py); c.lineTo(ex, ey); c.stroke();
        c.strokeStyle = 'rgba(10,6,4,.4)'; c.lineWidth = .8; c.beginPath(); c.moveTo(px + .8, py + .8); c.lineTo(ex + .8, ey + .8); c.stroke(); } }
  }
  c.restore();
}
// Nachwachsen (einmal pro Physik-Schritt, aus js/32-neue-bewegung.js)
function bruchNachwachsen(figuren){
  for(const s of solids){
    if(s.type !== 'bruch' || !s.gone || !(s.nachwachsen > 0)) continue;
    s.bruchT = (s.bruchT || 0) + 1;
    if(s.bruchT < s.nachwachsen*60) continue;
    if(figuren.some(p => p && rectsOverlap({x: p.x - p.w/2, y: p.y - p.h, w: p.w, h: p.h}, s))){ s.wartet = true; continue; }
    s.gone = false; s.wartet = false; s.bruchT = 0; s.neuT = 12;
    if(typeof SFX !== 'undefined' && SFX.bruchZurueck) SFX.bruchZurueck(s.x + s.w/2);
  }
}
const __matC = {};
function matTile(kind, seed){
  const key = kind + seed; if(__matC[key]) return __matC[key];
  const c = document.createElement('canvas'); c.width = c.height = 80; const q = c.getContext('2d'); q.setTransform(2,0,0,2,0,0);
  const sv = g; g = q; const r = rnd(seed);
  if(kind === 'wall') wallTile({x:0, y:0}, r, wallK);
  else { q.fillStyle = SOILBASE[soilK]; q.fillRect(0,0,40,40); grain(q, 0, 0, r); }
  g = sv; return __matC[key] = c;
}
function grasKappe(x, y, w, wx, farben, c){
  const F = farben || EA, q2 = c || ctx; q2.save(); q2.beginPath(); q2.rect(x, y - 3, w, 22); q2.clip();
  q2.beginPath(); q2.moveTo(x, y - 3); q2.lineTo(x + w, y - 3); for(let px = w; px >= 0; px -= 5) q2.lineTo(x + px, y + 12 + waveY(wx + px)); q2.closePath(); q2.fillStyle = F.grass; q2.fill();
  q2.strokeStyle = F.gd; q2.lineWidth = 2.5; q2.beginPath(); for(let px = 0; px <= w; px += 5){ px ? q2.lineTo(x + px, y + 13 + waveY(wx + px)) : q2.moveTo(x + px, y + 13 + waveY(wx + px)); } q2.stroke();
  q2.fillStyle = F.gt; q2.fillRect(x, y + 2, w, 3); q2.restore();
}
function matBlock(x, y, w, h, kind, seed, a, nachbarn){ // Kachelraster aus echtem Material
  ctx.save(); ctx.globalAlpha = a;
  for(let cx = 0; cx < w; cx += 40) for(let cy = 0; cy < h; cy += 40) ctx.drawImage(matTile(kind, seed + ((x + cx)*7 + (y + cy)*13 | 0) % 5), x + cx, y + cy, 40, 40);
  ctx.restore();
}
const __bruchT = {};
function bruchKachel(v, va){   // marode Wandkachel, drei Entwürfe (va 0/1/2), einmal gezeichnet, KEINE Löcher
  const key = va + '_' + v; if(__bruchT[key]) return __bruchT[key];
  const c = document.createElement('canvas'); c.width = c.height = 80; const q = c.getContext('2d'); q.setTransform(2,0,0,2,0,0);
  const sv = g; g = q; const r = rnd(900 + v + va*50); wallTile({x:0, y:0}, r, wallK); g = sv;
  const blobP = (cx, cy, rad, n) => { const P = []; for(let i = 0; i < n; i++){ const a = i/n*Math.PI*2, rr = rad*(0.62 + r()*0.5); P.push([cx + Math.cos(a)*rr*1.25, cy + Math.sin(a)*rr*0.85]); } return P; };
  const blob = (P) => { q.beginPath(); P.forEach((pt, i) => i ? q.lineTo(pt[0], pt[1]) : q.moveTo(pt[0], pt[1])); q.closePath(); };
  if(va === 0){
    // A: Moos & Fugen – braun-grün angelaufene Ziegel, ausgewaschene Fugen mit Moos, ein paar Ziegel ragen heraus
    q.fillStyle = 'rgba(74,66,26,.34)'; q.fillRect(0, 0, 40, 40);
    for(let j = 0; j < 4; j++){ const off = (j & 1) ? 10 : 0;
      for(let bx = off - 20; bx < 40; bx += 20){ const x0 = Math.max(0, bx + 1), x1 = Math.min(40, bx + 19), y0 = j*10 + 1;
        if(x1 - x0 < 3) continue; const u = r();
        if(u < .28){ q.fillStyle = 'rgba(70,92,34,.30)'; q.fillRect(x0, y0, x1 - x0, 8); }
        else if(u < .45){ q.fillStyle = 'rgba(34,22,10,.26)'; q.fillRect(x0, y0, x1 - x0, 8); }
        if(r() < .16){ q.fillStyle = 'rgba(12,7,3,.5)'; q.fillRect(x0 - .6, y0 + 7.2, x1 - x0 + .6, 1.8); q.fillRect(x0 - .6, y0, 1.4, 8);   // Ziegel steht etwas vor
          q.fillStyle = 'rgba(255,236,200,.22)'; q.fillRect(x0 + 1, y0, x1 - x0 - 1, 1.2); } } }
    for(let j = 0; j < 4; j++){ if(r() < .6){ const mx = 3 + r()*20, mw = 8 + r()*14, my = j*10 + (r() < .5 ? 0 : 10);
        q.fillStyle = 'rgba(88,112,40,.85)'; q.beginPath(); q.moveTo(mx, my + 1); for(let i = 0; i <= 6; i++){ q.lineTo(mx + mw*i/6, my + 1.6 + Math.sin(i*2.1 + r()*2)*1.2 + (i % 2 ? 1.2 : 0)); } q.lineTo(mx + mw, my - .8); q.lineTo(mx, my - .8); q.closePath(); q.fill();
        q.fillStyle = 'rgba(176,200,92,.55)'; q.fillRect(mx + 1, my - .4, mw*.6, .9); } }
  } else if(va === 1){
    // B: Wurzeln – Baumwurzeln wachsen senkrecht durch die Mauer (Anschlüsse an Kachelrand immer gleich, damit sie durchlaufen)
    q.fillStyle = 'rgba(70,56,30,.30)'; q.fillRect(0, 0, 40, 40);
    q.fillStyle = 'rgba(60,84,32,.22)'; for(let i = 0; i < 3; i++){ blob(blobP(r()*40, r()*40, 5, 7)); q.fill(); }
    const wurzel = (x0, wob, dick) => { const m1 = x0 + (r() - .5)*wob, m2 = x0 + (r() - .5)*wob;
      const pfad = () => { q.beginPath(); q.moveTo(x0, -1); q.bezierCurveTo(m1, 13, m2, 27, x0, 41); };
      q.lineCap = 'round'; q.strokeStyle = 'rgba(14,8,4,.55)'; q.lineWidth = dick + 2; q.save(); q.translate(1.2, .8); pfad(); q.stroke(); q.restore();
      q.strokeStyle = '#5a3f26'; q.lineWidth = dick; pfad(); q.stroke();
      q.strokeStyle = '#7b5a38'; q.lineWidth = dick*.4; q.save(); q.translate(-dick*.2, 0); pfad(); q.stroke(); q.restore();
      q.strokeStyle = 'rgba(30,18,8,.55)'; q.lineWidth = .8; for(let i = 0; i < 3; i++){ const yy = 6 + i*12 + r()*4; q.beginPath(); q.moveTo(x0 - dick*.4 + (m1 - x0)*.3, yy); q.lineTo(x0 + dick*.4 + (m1 - x0)*.3, yy + 1.2); q.stroke(); }
      const fy = 8 + r()*22, fx = x0 + (r() < .5 ? -1 : 1); q.strokeStyle = '#5a3f26'; q.lineWidth = dick*.35; q.beginPath(); q.moveTo(x0, fy); q.quadraticCurveTo(x0 + fx*5, fy + 3, x0 + fx*(8 + r()*5), fy + 3 + r()*5); q.stroke(); };
    wurzel(20, 9, 4.6); if(v % 2) wurzel(5, 4, 2.2);
  } else {
    // C: Putz – alter, kalkiger Putz blättert ab: helle Putzflächen mit Schattenkante, dazwischen liegt der Ziegel frei
    q.fillStyle = 'rgba(70,56,32,.24)'; q.fillRect(0, 0, 40, 40);
    const n = 1 + Math.floor(r()*2);
    for(let i = 0; i < n; i++){ const cx = 12 + r()*16, cy = 10 + r()*20, rad = 8 + r()*5;
      q.save(); const PP = blobP(cx, cy, rad, 9); q.translate(1.4, 1.6); q.fillStyle = 'rgba(14,8,4,.38)'; blob(PP); q.fill(); q.restore();
      blob(PP); q.fillStyle = '#c9bb98'; q.fill();
      q.fillStyle = 'rgba(255,248,224,.35)'; q.beginPath(); q.ellipse(cx - rad*.25, cy - rad*.3, rad*.6, rad*.3, -.3, 0, 7); q.fill();
      q.strokeStyle = 'rgba(60,44,24,.55)'; q.lineWidth = 1; blob(PP); q.stroke();
      q.fillStyle = 'rgba(110,92,60,.4)'; for(let k = 0; k < 6; k++){ q.fillRect(cx + (r() - .5)*rad*1.5, cy + (r() - .5)*rad, .9, .9); } }
    q.fillStyle = 'rgba(200,188,150,.5)'; for(let k = 0; k < 10; k++){ q.fillRect(r()*40, r()*40, 1, 1); }
  }
  return __bruchT[key] = c;
}
function bruchVariante(s){ const l = ((s.x - 200) % 1200 + 1200) % 1200; return l < 300 ? 0 : l < 540 ? 1 : l < 780 ? 2 : 0; }   // nur für die Vorschau: Entwurf A / B / C
function bruchZeichnen(){
  for(const s of solids){
    if(s.type !== 'bruch') continue;
    const x = Math.round(s.x - camX);
    if(x + s.w < -20 || x > VW + 20) continue;
    if(s.gone){
      if(!(s.nachwachsen > 0)) continue;
      const k = Math.min(1, (s.bruchT || 0)/(s.nachwachsen*60));
      ctx.save(); ctx.globalAlpha = (s.wartet ? 0.5 + 0.3*Math.sin(performance.now()/90) : 0.35)*.8; ctx.fillStyle = '#6b5a48';
      ctx.fillRect(x + 3, s.y + s.h - 3 - (s.h - 6)*k, s.w - 6, (s.h - 6)*k); ctx.restore(); continue;
    }
    for(let cx = 0; cx < s.w; cx += 40) for(let cy = 0; cy < s.h; cy += 40) ctx.drawImage(bruchKachel(Math.abs(((s.x + cx)*7 + (s.y + cy)*13)|0) % 6, bruchVariante(s)), x + cx, s.y + cy, 40, 40);
    { const l = ((s.x - 200) % 1200 + 1200) % 1200;
      if(s.y === 520 && (l === 80 || l === 320 || l === 560) && s.x - 200 > 0 && ((s.x - 200) % 1200) === l){ ctx.save(); ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 3; const t2 = l === 80 ? 'A  Moos & Fugen' : l === 320 ? 'B  Wurzeln' : 'C  Putz'; ctx.strokeText(t2, x, s.y - 10); ctx.fillText(t2, x, s.y - 10); ctx.restore(); } }
    if(s.neuT > 0){ s.neuT -= 0.5; ctx.globalAlpha = s.neuT/12*0.5; ctx.fillStyle = '#fff'; ctx.fillRect(x, s.y, s.w, s.h); ctx.globalAlpha = 1; }
  }
}
ELEMENT_SOLID_TYPEN.add('bruch');
elementRegistrieren({
  id: 'durchbruch', name: 'Durchbruch-Wand', feld: 'bruchWaende',
  editor: {
    werkzeug: 'bruch', gruppe: 'gelaende', vor: 'fake', art: 'punkt', ziehbar: true,
    titel: 'Durchbruch-Wand: fest wie eine Wand, aber ein Dash zerbricht sie (Laufen/Springen nicht). Senkrecht oder waagerecht bauen. ' +
           'Option: bleibt kaputt (bis Neustart/Tod) oder wächst nach X Sekunden nach (wartet, wenn jemand drin steht)',
    farbe: '#a38866',
    optionen: [
      {key: 'nachwachsen', label: 'Nach dem Bruch', zahl: true, titel: 'bleibt kaputt (bis Neustart oder Tod) oder wächst nach X Sekunden wieder nach',
       werte: [['0', 'bleibt kaputt'], ['2', 'wächst nach 2 s'], ['3', 'wächst nach 3 s'], ['5', 'wächst nach 5 s'], ['8', 'wächst nach 8 s']]},
    ],
    zeichnen(ctx, c, r, TILE, p){
      const X = c*TILE, Y = r*TILE;
      ctx.fillStyle = '#a38866'; ctx.fillRect(X + 1, Y + 1, TILE - 2, TILE - 2);
      bruchRisse(ctx, X, Y, TILE, TILE, c*13 + r*7, '#3a2a1a', 2);
      ctx.strokeStyle = '#5b4630'; ctx.lineWidth = 2; ctx.strokeRect(X + 2, Y + 2, TILE - 4, TILE - 4);
      if(p && p.nachwachsen > 0){
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('↻' + p.nachwachsen, X + TILE/2, Y + TILE/2 + 1);
      }
    },
    // Spiel-Format: je Kästchen ein Rechteck (obere linke Ecke); nachwachsen nur, wenn gesetzt (abwärtskompatibel)
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, w: TILE, h: TILE, ...(p.nachwachsen > 0 ? {nachwachsen: Number(p.nachwachsen)} : {})})),
  },
  spiel: {
    laden(daten){
      for(const b of (daten.bruchWaende || []))
        solids.push({x: b.x, y: b.y, w: b.w || 40, h: b.h || 40, type: 'bruch', nachwachsen: Number(b.nachwachsen) || 0, gone: false, bruchT: 0, wartet: false});
    },
    zuruecksetzen(){ for(const s of solids) if(s.type === 'bruch'){ s.gone = false; s.bruchT = 0; s.wartet = false; s.neuT = 0; } },
    zeichnen: bruchZeichnen,
  },
});

// ==== druckplatte
// elemente/druckplatte.js – Element „Druckplatte“ (Punkt-Element mit Verknüpfungs-Nummer, siehe 00-register.js).
// Die Nummer ist AN, solange mindestens eine Figur darauf steht. Rolle: eine Figur hält, die andere geht durch.
// Logik: updatePlates im Verknüpfungs-System (js/05-level-objekte.js).
elementRegistrieren({
  id: 'druckplatte', name: 'Druckplatte', feld: 'plates',
  editor: {
    werkzeug: 'plate', gruppe: 'logik', vor: '#linkSelect', art: 'punkt', ziehbar: false,
    mitNummer: true, nummerName: 'Druckplatte', farbe: '#c9a227',
    titel: 'Druckplatte: Tür offen / Bewegung läuft nur, solange jemand draufsteht (Verknüpfung wie beim Schalter)',
    zeichnen(ctx, c, r, TILE, p){   // flache Platte unten im Kästchen mit Nummer
      const X = c*TILE, Y = r*TILE;
      ctx.fillStyle = '#c9a227'; ctx.fillRect(X+4, Y+TILE-12, TILE-8, 10);
      ctx.strokeStyle = '#6b5410'; ctx.lineWidth = 2; ctx.strokeRect(X+4, Y+TILE-12, TILE-8, 10);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(p.link), X+TILE/2, Y+TILE/2-6);
    },
    exportieren: (liste, TILE) => elementPunktMitte(liste, TILE),
  },
  spiel: {
    laden(daten){ plates = (daten.plates||[]).map(p=>({x:p.x, y:p.y, link:p.link, down:false})); },
    // Neustart/Tod: Platte gilt als frei – „Betreten“ (schaltbarer Spiegel) zählt danach wieder ab dem ersten Draufsteigen
    zuruecksetzen(){ for(const pl of plates) pl.down = false; },
    // Steinplatte mit Nummer, sinkt ein, solange jemand draufsteht
    zeichnen(){
      for(const pl of plates){
        const x = Math.round(pl.x - camX);
        if(x < -40 || x > VW + 40) continue;
        const baseY = pl.y + 20, col = linkColor(pl.link), d = pl.down ? 4 : 0;
        // Auffälliger und passend zur Spielwelt (Nutzerwunsch): breite Messingplatte im Eisenrahmen mit Nieten und einem
        // Edelstein in der Verknüpfungs-Farbe (wie auf den Türen); leichter Schein, solange niemand draufsteht Glühwürmchen
        elementLeuchten(x, baseY - 8, 44, col, pl.down ? 0.5 : 1);
        glanzSchatten(x, baseY, 34, 4);   // Design-Politur C: Kontaktschatten
        ctx.fillStyle = 'rgba(0,0,0,.28)'; roundRect(x - 29, baseY - 6, 58, 6, 2); ctx.fill();
        ctx.fillStyle = '#4a4f57'; roundRect(x - 28, baseY - 14 + d, 56, 14 - d, 3); ctx.fill();
        ctx.strokeStyle = '#2b2f35'; ctx.lineWidth = 1.5; roundRect(x - 28, baseY - 14 + d, 56, 14 - d, 3); ctx.stroke();
        const platte = ctx.createLinearGradient(0, baseY - 12 + d, 0, baseY - 3);
        platte.addColorStop(0, pl.down ? '#b08a3a' : '#ffe08a'); platte.addColorStop(1, pl.down ? '#7a5c1e' : '#d9a43a');
        ctx.fillStyle = platte; roundRect(x - 24, baseY - 12 + d, 48, 9 - d*0.5, 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x - 22, baseY - 12 + d, 44, 1.5);
        if(!pl.down){ ctx.save(); roundRect(x - 24, baseY - 12 + d, 48, 9 - d*0.5, 2); ctx.clip(); glanzBand(x - 24, baseY - 12 + d, 48, 9, pl.x*0.02); ctx.restore(); }   // Messing glänzt
        ctx.fillStyle = '#9aa3ad'; for(const rx of [x - 26, x + 26]){ ctx.beginPath(); ctx.arc(rx, baseY - 7 + d/2, 1.5, 0, Math.PI*2); ctx.fill(); }
        elementEdelstein(x - 12, baseY - 7.5 + d/2, 4.5, col); elementEdelstein(x + 12, baseY - 7.5 + d/2, 4.5, col);
        ctx.fillStyle = '#3b2f25'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(pl.link), x, baseY - 7 + d/2);
        if(!pl.down) hinweisPfeil(x, baseY - 40, col);
      }
    },
  },
});

// ==== eis
// elemente/eis.js – Element „Eis“ (Ausbau 7, Welt Höhle; Punkt-Element, mit der Maus malbar).
// Rutschiger Boden-Block (fest wie Stein). Wer darauf steht, läuft nur langsam an, dreht langsam um und rutscht ohne
// Taste lange weiter (Werte EIS_GRIFF / EIS_REIBUNG in js/02-physik-werte.js; die Sonderregel selbst steht in der
// Figuren-Physik js/08-figur-physik-seil.js). Springt man vom Eis ab, behält man den Schwung.
// Rolle: der Affe bremst mit dem Seil (am Haken hängen stoppt jedes Rutschen), das Schweinchen landet segelnd
// punktgenau auf schmalen Eissäulen.
// Spiel-Daten: eis [{x, y, w, h}] (obere linke Ecke, je Kästchen). Im Spiel: solids mit type 'eis'.
function aufEis(player){ return !!(player.grounded && player.standingOn && player.standingOn.type === 'eis'); }
function eisBlock(c, x, y, w, h, dunkel){
  const gr = c.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, dunkel ? '#a8cde0' : '#e4f8ff'); gr.addColorStop(0.45, dunkel ? '#7fb2cf' : '#b5e2f6'); gr.addColorStop(1, dunkel ? '#5d8fb0' : '#86c1e2');
  c.fillStyle = gr; c.fillRect(x, y, w, h);
  c.strokeStyle = 'rgba(40,90,130,.55)'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, w - 2, h - 2);
  c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(x + 3, y + 2, w - 6, 3);          // Glanz oben
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5;                         // Glanzstriche
  c.beginPath(); c.moveTo(x + w*0.2, y + h*0.75); c.lineTo(x + w*0.42, y + h*0.3); c.stroke();
  c.beginPath(); c.moveTo(x + w*0.5, y + h*0.8); c.lineTo(x + w*0.62, y + h*0.55); c.stroke();
}
function eisZeichnen(){
  const dunkel = typeof THEME !== 'undefined' && THEME && THEME.dark > 0.5;
  for(const s of solids){
    if(s.type !== 'eis') continue;
    const x = Math.round(s.x - camX);
    if(x + s.w < -20 || x > VW + 20) continue;
    eisBlock(ctx, x, s.y, s.w, s.h, dunkel);
  }
}
ELEMENT_SOLID_TYPEN.add('eis');
elementRegistrieren({
  id: 'eis', name: 'Eis', feld: 'eis',
  editor: {
    werkzeug: 'eis', gruppe: 'gelaende', vor: 'fake', art: 'punkt', ziehbar: true, farbe: '#b5e2f6',
    titel: 'Eis: fester, rutschiger Boden – langsam anlaufen, langer Bremsweg. Mit gedrückter Maus malen',
    zeichnen(ctx, c, r, TILE){ eisBlock(ctx, c*TILE, r*TILE, TILE, TILE, false); },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, w: TILE, h: TILE})),
  },
  spiel: {
    laden(daten){ for(const e of (daten.eis || [])) solids.push({x: e.x, y: e.y, w: e.w || 40, h: e.h || 40, type: 'eis'}); },
    // Landen auf Eis mit Schwung: leises Schaben
    nachBewegung(player, warAmBoden){
      if(!warAmBoden && aufEis(player) && Math.abs(player.vx) > 1.5 && player.x > camX - 40 && player.x < camX + VW + 40) SFX.eisRutsch(player.x);
    },
    zeichnen(){ eisZeichnen(); },
  },
});

// ==== einseitig
// elemente/einseitig.js – Element „Einseitige Plattform“ (Ausbau 4; Kachel-Element, siehe 00-register.js).
// Holzsteg: von unten (und von der Seite) springt/läuft man hindurch, von oben kann man darauf stehen.
//   - Fest ist nur die Oberkante, und nur für Figuren, die von OBEN kommen (Füße waren vor dem Schritt darüber).
//   - Kein Wandsprung an der Seite (zählt nicht als Wand), keine Decke beim Hochspringen.
//   - Die Sicht-Linie des Seils geht hindurch (Haken über einem Steg bleiben erreichbar).
//   - Kein „Runterfallen per Taste“: wer wieder runter will, läuft über die Kante.
// Die Kollision selbst steht in collideAxis (js/04-figuren-kollision.js, type 'oneway'); Wand-/Seil-Prüfung in
// js/08-figur-physik-seil.js (touchingWall, lineClear) und spotFree/playerBlocked ignorieren den Steg.
// Rolle: beide Figuren nutzen ihn gleich – er macht Wege nach oben kurz (durchspringen) und gibt Schweinchen und
// Affe Stellen zum Landen; als Ersatz für Wände taugt er nicht (kein Wandsprung), dafür bleibt der Haken erreichbar.
const ONEWAY_DICKE = 12;   // so dick wird der Steg gezeichnet (Kollision: nur die Oberkante)
function istEinseitig(s){ return s.type === 'oneway'; }
// Landet die Figur in diesem Schritt von oben auf dem Steg? (vorher Füße über der Oberkante, jetzt darauf/darunter)
function einseitigLandung(player, s){
  if(player.vy <= 0) return false;
  const vorher = player.y - player.vy;
  if(vorher > s.y + COLLIDE_EPS || player.y < s.y) return false;
  const ox = Math.min(player.x + player.w/2, s.x + s.w) - Math.max(player.x - player.w/2, s.x);
  return ox > COLLIDE_EPS;
}
ELEMENT_SOLID_TYPEN.add('oneway');
elementRegistrieren({
  id: 'einseitig', name: 'Einseitige Plattform', feld: 'oneways',
  editor: {
    werkzeug: 'oneway', label: 'Steg (einseitig)', gruppe: 'gelaende', vor: 'fake', art: 'kachel', ziehbar: true,
    titel: 'Einseitige Plattform (Steg): von unten durchspringbar, von oben stehbar; kein Wandsprung an der Seite, Seil-Sicht geht hindurch',
    farbe: '#c8955a', kachelFarbe: 'rgba(200,149,90,0.18)',
    zeichnen(ctx, c, r, TILE){   // Brett oben im Kästchen + Pfeil nach oben
      const X = c*TILE, Y = r*TILE;
      ctx.fillStyle = '#c8955a'; ctx.fillRect(X, Y, TILE, 11);
      ctx.strokeStyle = '#6b4a22'; ctx.lineWidth = 2; ctx.strokeRect(X + 1, Y + 1, TILE - 2, 9);
      ctx.strokeStyle = 'rgba(255,235,200,.7)'; ctx.lineWidth = 2;
      const mx = X + TILE/2;
      ctx.beginPath(); ctx.moveTo(mx, Y + TILE - 6); ctx.lineTo(mx, Y + 16); ctx.moveTo(mx - 5, Y + 21); ctx.lineTo(mx, Y + 16); ctx.lineTo(mx + 5, Y + 21); ctx.stroke();
    },
    exportieren: (zellen, TILE, mergeRects) => mergeRects(zellen).map(r => ({...r, h: ONEWAY_DICKE})),
  },
  spiel: {
    laden(daten){
      for(const o of (daten.oneways || [])) solids.push({x: o.x, y: o.y, w: o.w, h: o.h || ONEWAY_DICKE, type: 'oneway'});
    },
    // Holzsteg mit Brettfugen und zwei Stützbalken je Kästchen
    zeichnen(){
      for(const s of solids){
        if(s.type !== 'oneway') continue;
        const x = Math.round(s.x - camX);
        if(x + s.w < -20 || x > VW + 20) continue;
        ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(x + 3, s.y + ONEWAY_DICKE, s.w - 6, 4);
        for(let k = 0; k < s.w; k += 40){   // Stützen
          ctx.fillStyle = '#7a5428';
          ctx.beginPath(); ctx.moveTo(x + k + 8, s.y + ONEWAY_DICKE); ctx.lineTo(x + k + 20, s.y + ONEWAY_DICKE + 9); ctx.lineTo(x + k + 32, s.y + ONEWAY_DICKE);
          ctx.lineWidth = 3; ctx.strokeStyle = '#7a5428'; ctx.stroke();
        }
        const gr = ctx.createLinearGradient(0, s.y, 0, s.y + ONEWAY_DICKE);
        gr.addColorStop(0, '#e2b47a'); gr.addColorStop(1, '#a8743c');
        ctx.fillStyle = gr; roundRect(x, s.y, s.w, ONEWAY_DICKE, 4); ctx.fill();
        ctx.strokeStyle = '#6b4a22'; ctx.lineWidth = 1.5; roundRect(x + 0.75, s.y + 0.75, s.w - 1.5, ONEWAY_DICKE - 1.5, 4); ctx.stroke();
        ctx.strokeStyle = 'rgba(80,50,20,.45)'; ctx.lineWidth = 1;   // Fugen
        for(let k = 20; k < s.w; k += 20){ ctx.beginPath(); ctx.moveTo(x + k, s.y + 2); ctx.lineTo(x + k, s.y + ONEWAY_DICKE - 2); ctx.stroke(); }
        ctx.fillStyle = 'rgba(255,240,210,.55)'; ctx.fillRect(x + 3, s.y + 1.5, s.w - 6, 1.5);
      }
    },
  },
});

// ==== falle
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

// ==== fels
// elemente/fels.js – Element „Rollender Fels“ (Ausbau 7, Welt Ruinen; Punkt-Element mit Verknüpfungs-Nummer).
// Ein großer runder Stein (Durchmesser 2,5 Kästchen). Sobald seine Nummer AN geht (Hebel/Druckplatte), rollt er los
// (nach rechts oder links, Tempo langsam/mittel/schnell) und bleibt in Bewegung: er rollt über Boden und Stege, fällt
// über Kanten (Schwerkraft), nimmt kleine Stufen (bis 12 px) mit, tritt Bröckelboden los – und zerschellt an einer Wand,
// einer geschlossenen Tür oder einer höheren Stufe. Wer ihn berührt, stirbt. Tod/Neustart: zurück an den Start, wartet.
// Regel (FEATURES „jeder Hebel hat einen Grund“): ein Hebel, der einen Fels startet, öffnet immer auch ein Tor.
// Ruinen-Überarbeitung: vor dem Losrollen wackelt er FELS_WARN Schritte (Staub, Kiesel, Rumpeln = fairer Start); rollt er
// außerhalb des Bildes auf die Figuren zu, rumpelt es und Staub steigt am Bildrand auf (Ankündigung); er bricht durch
// Bröckel-Wände (Bröckelboden-Kästchen, die ihm im Weg stehen) und rollt langsamer weiter – so räumt er einen Weg frei;
// aus großer Höhe hüpft er kurz; Aufprall und Zerschellen lassen die Kamera wackeln, an der Wand fliegen Bruchstücke.
// Rolle: der Affe flieht nach oben an Haken (der Fels rollt darunter durch), das Schweinchen segelt über Gruben, in die
// der Fels fällt; oft startet einer den Fels, und beide müssen fliehen.
// Spiel-Daten: boulders [{x (Mitte), y (Unterkante = Boden), link, richtung: 'r'|'l', tempo}]
let felsen = [];   // {sx, sy, x, y (Mitte), vx, vy, dir, tempo, link, aktiv, warn, weg, dreh, rollTon, boden, brocken}
function felsHindernis(s){ return !s.gone && s.type !== 'oneway' && s.type !== 'fake'; }
function felsSchritt(players){
  for(const F of felsen){
    if(F.weg) continue;
    if(!F.aktiv){
      // Warn-Signal: erst wackeln (Staub, Kiesel, Rumpeln), dann rollen
      if(F.warn > 0){ if(--F.warn === 0){ F.aktiv = true; F.vx = F.dir*1; } else continue; }
      else if(F.link && linkOn[F.link]){ F.warn = FELS_WARN; if(felsImBild(F)){ SFX.felsStart(F.x); kameraStoss(2); } continue; }
      else continue;
    }
    const R = FELS_RADIUS;
    // waagerecht: auf Tempo kommen, kleine Stufen hinauf, an Wand/Tür/hoher Stufe zerschellen
    F.vx += (F.dir*F.tempo - F.vx)*FELS_BESCHL;
    F.x += F.vx;
    for(const s of solids){
      if(!felsHindernis(s)) continue;
      const box = {x: F.x - R, y: F.y - R, w: 2*R, h: 2*R};
      if(!(box.x < s.x + s.w && box.x + box.w > s.x && box.y < s.y + s.h - 0.5 && box.y + box.h > s.y + 0.5)) continue;
      const stufe = F.y + R - s.y;   // so weit steckt der Fels unten in der Stufe
      if(stufe > 0 && stufe <= FELS_STUFE){ F.y = s.y - R; continue; }
      if(s.type === 'crumble' && !s.gone){   // Bröckel-Wand: bricht durch, rollt langsamer weiter
        breakCrumble(s); F.vx *= FELS_BROECKEL_BREMSE; F.durchbrochen = (F.durchbrochen || 0) + 1;
        if(felsImBild(F)){ SFX.felsAufprall(F.x); kameraStoss(5); }
        continue;
      }
      felsZerschellen(F); break;
    }
    if(F.weg) continue;
    // senkrecht: fallen, landen (auch auf Stegen von oben)
    const vorher = F.y + R;
    F.vy = Math.min(MAX_FALL, F.vy + GRAVITY);
    F.y += F.vy;
    let gelandet = false;
    for(const s of solids){
      if(s.gone || s.type === 'fake') continue;
      if(F.x + R*0.7 <= s.x || F.x - R*0.7 >= s.x + s.w) continue;   // nur der untere Teil der Kugel trägt
      if(s.type === 'oneway' && vorher > s.y + 0.5) continue;
      if(F.vy >= 0 && vorher <= s.y + 0.5 && F.y + R > s.y){
        if(F.vy > 6 && felsImBild(F)){ SFX.felsAufprall(F.x); kameraStoss(Math.min(7, F.vy*0.5)); }
        F.y = s.y - R; F.vy = F.vy > 8 ? -F.vy*FELS_PRALL : 0; gelandet = true;
        if(s.type === 'crumble' && !s.triggered){ s.triggered = true; s.timer = 0; }
      }
    }
    F.dreh += F.vx/R;
    if(F.y - R > LEVEL_H + 200){ F.weg = true; continue; }
    if(felsImBild(F)) F.boden = felsBoden(F);   // für den Schatten am Boden (nur Anzeige)
    // Ankündigung: außerhalb des Bildes, aber auf dem Weg ins Bild -> Rumpeln (leiser, je weiter weg)
    const mitte = camX + VW/2, abst = Math.abs(F.x - mitte) - VW/2;
    F.ankuendigung = !felsImBild(F) && F.dir*(mitte - F.x) > 0 && abst < VW*FELS_ANKUENDIGUNG ? 1 - Math.max(0, abst)/(VW*FELS_ANKUENDIGUNG) : 0;
    if(F.ankuendigung > 0 && simSteps % 14 === 0) SFX.felsRollen(F.x);
    // Rollgeräusch im Takt der Umdrehungen (nur sichtbar)
    if(gelandet && Math.abs(F.vx) > 1 && felsImBild(F)){ F.rollTon -= Math.abs(F.vx); if(F.rollTon <= 0){ F.rollTon = 2*Math.PI*R*0.5; SFX.felsRollen(F.x); } }
    // Berührung = Tod (Kreis gegen Figur)
    for(const pl of players){
      if(!pl || deathState) continue;
      const nx = Math.max(pl.x - pl.w/2, Math.min(F.x, pl.x + pl.w/2)), ny = Math.max(pl.y - pl.h, Math.min(F.y, pl.y));
      if(Math.hypot(F.x - nx, F.y - ny) < R - 4){ die(pl); return; }
    }
  }
}
const felsImBild = F => F.x + FELS_RADIUS > camX - 40 && F.x - FELS_RADIUS < camX + VW + 40;
// Oberkante des Bodens unter dem Fels (für den Schatten)
function felsBoden(F){
  let best = LEVEL_H + 400;
  for(const s of solids){
    if(s.gone || s.type === 'fake' || F.x < s.x || F.x > s.x + s.w || s.y < F.y + FELS_RADIUS - 2) continue;
    if(s.y < best) best = s.y;
  }
  return best;
}
function felsZerschellen(F){
  F.weg = true;
  const now = performance.now();
  // Bruchstücke: kantige Brocken fliegen von der Wand zurück und fallen (nur Anzeige, nach der Zeit berechnet)
  F.brocken = [];
  for(let k = 0; k < 9; k++){
    const a = -Math.PI/2 + (k/8 - 0.5)*Math.PI*1.4;
    F.brocken.push({x: F.x + Math.cos(a)*FELS_RADIUS*0.4, y: F.y + Math.sin(a)*FELS_RADIUS*0.4, t0: now, r: 7 + (k*5) % 11,
                    vx: -F.dir*(1.2 + (k % 3)*0.9) + Math.cos(a)*1.4, vy: -2.2 - (k % 4)*0.8, vr: (k % 2 ? 1 : -1)*(0.1 + k*0.02), ecken: 5 + k % 3});
  }
  if(felsImBild(F)) kameraStoss(8);
  for(let k = 0; k < 14; k++){
    const a = k/14*Math.PI*2;
    coinFx.push({type: 'poof', x: F.x + Math.cos(a)*FELS_RADIUS*0.6, y: F.y + Math.sin(a)*FELS_RADIUS*0.6, t0: now,
                 vx: Math.cos(a)*2.2 - F.dir*1.5, vy: Math.sin(a)*2 - 1, size: 10 + (k % 4)*4});
  }
  if(felsImBild(F)) SFX.felsBruch(F.x);
}
function felsZuruecksetzen(){
  for(const F of felsen){ F.x = F.sx; F.y = F.sy; F.vx = 0; F.vy = 0; F.aktiv = false; F.warn = 0; F.weg = false; F.dreh = 0; F.rollTon = 0;
    F.boden = null; F.brocken = null; F.durchbrochen = 0; F.ankuendigung = 0; }
  if(typeof kameraWackeln !== 'undefined') kameraWackeln = 0;
}
// Zeichnen: schwerer dunkler Granit mit dickem Umriss, Steinband und Rissen (man sieht die Drehung), Moos; Schatten liegt
// auf dem Boden darunter (kleiner, je höher er ist); beim Rollen Staub und hüpfende Kiesel; vor dem Losrollen wackelt er
function felsBild(c, x, y, R, dreh, ruhig){
  c.save(); c.translate(x, y);
  c.rotate(dreh);
  const g = c.createRadialGradient(-R*0.35, -R*0.4, R*0.1, 0, 0, R);
  g.addColorStop(0, '#b3a58c'); g.addColorStop(0.5, '#7d6f5a'); g.addColorStop(1, '#3f3529');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, R, 0, Math.PI*2); c.fill();
  // Steinband quer durch die Mitte (dreht sich sichtbar mit)
  c.save(); c.beginPath(); c.arc(0, 0, R - 1, 0, Math.PI*2); c.clip();
  c.fillStyle = 'rgba(40,30,20,.45)'; c.fillRect(-R, -R*0.16, 2*R, R*0.32);
  c.fillStyle = 'rgba(210,190,150,.35)'; c.fillRect(-R, -R*0.16, 2*R, 3);
  c.fillStyle = 'rgba(40,30,20,.6)'; for(let k = -3; k <= 3; k++) c.fillRect(k*R*0.28 - 2, -R*0.16, 4, R*0.32);
  c.restore();
  c.strokeStyle = 'rgba(35,25,15,.7)'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(-R*0.55, -R*0.5); c.lineTo(-R*0.15, -R*0.3); c.lineTo(R*0.2, -R*0.62); c.stroke();
  c.beginPath(); c.moveTo(R*0.05, R*0.4); c.lineTo(R*0.35, R*0.25); c.lineTo(R*0.62, R*0.42); c.stroke();
  c.fillStyle = 'rgba(30,22,14,.55)'; c.beginPath(); c.arc(-R*0.3, R*0.5, R*0.11, 0, Math.PI*2); c.fill();
  c.beginPath(); c.arc(R*0.5, -R*0.1, R*0.07, 0, Math.PI*2); c.fill();
  c.fillStyle = 'rgba(100,135,60,.7)'; c.beginPath(); c.arc(R*0.42, -R*0.6, R*0.2, 0, Math.PI*2); c.fill();   // Moos-Fleck
  c.restore();
  c.strokeStyle = '#21180f'; c.lineWidth = 3.5; c.beginPath(); c.arc(x, y, R - 1, 0, Math.PI*2); c.stroke();   // dicker Umriss
  c.strokeStyle = 'rgba(255,240,210,.25)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, R - 5, Math.PI*1.1, Math.PI*1.55); c.stroke();
  if(!ruhig){ c.strokeStyle = 'rgba(20,14,8,.35)'; c.lineWidth = 6; c.beginPath(); c.arc(x, y, R + 2, 0, Math.PI*2); c.stroke(); }
}
function felsSchatten(x, boden, F){
  if(boden == null || boden > LEVEL_H) return;
  const hoch = Math.max(0, boden - (F.y + FELS_RADIUS)), k = Math.max(0.25, 1 - hoch/260);
  ctx.fillStyle = `rgba(0,0,0,${0.32*k})`; ctx.beginPath(); ctx.ellipse(x, boden - 2, FELS_RADIUS*0.9*k, 8*k, 0, 0, Math.PI*2); ctx.fill();
}
function felsKiesel(x, y, n, t, dir, weit){   // kleine Steinchen, die hüpfen (nur nach der Zeit berechnet)
  ctx.fillStyle = '#4a3e30';
  for(let i = 0; i < n; i++){
    const ph = (t*1.7 + i/n) % 1, hx = x - dir*(10 + ph*weit + i*5), hy = y - Math.abs(Math.sin(ph*Math.PI*2))*(10 + i*2);
    ctx.globalAlpha = 1 - ph*0.8; ctx.beginPath(); ctx.arc(hx, hy, 2.5 + (i % 3), 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function felsZeichnen(){
  const t = performance.now()*0.001;
  for(const F of felsen){
    // Bruchstücke nach dem Zerschellen
    if(F.weg && F.brocken){
      const now = performance.now();
      for(const b of F.brocken){
        const fr = (now - b.t0)/16.7; if(fr > 75) continue;
        const bx = b.x - camX + b.vx*fr, by = b.y + b.vy*fr + 0.22*fr*fr;
        ctx.save(); ctx.translate(bx, by); ctx.rotate(b.vr*fr); ctx.globalAlpha = Math.max(0, 1 - fr/75);
        ctx.fillStyle = '#6d604c'; ctx.strokeStyle = '#21180f'; ctx.lineWidth = 2; ctx.beginPath();
        for(let e = 0; e < b.ecken; e++){ const a = e/b.ecken*Math.PI*2, rr = b.r*(0.75 + 0.25*((e*7) % 3)/2); ctx.lineTo(Math.cos(a)*rr, Math.sin(a)*rr); }
        ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
    if(F.weg) continue;
    const x = F.x - camX;
    if(x + FELS_RADIUS < -40 || x - FELS_RADIUS > VW + 40){
      if(F.aktiv) felsAnkuendigung(F, t);
      continue;
    }
    const boden = F.aktiv ? F.boden : F.y + FELS_RADIUS;
    felsSchatten(x, boden, F);
    const wackel = F.warn > 0 ? Math.sin(simSteps*1.7)*3*(1 - F.warn/FELS_WARN + 0.3) : 0;
    felsBild(ctx, x + wackel, F.y, FELS_RADIUS, F.dreh + wackel*0.03, !F.aktiv && !(F.warn > 0));
    if(F.warn > 0){   // Warn-Signal: Staub quillt unter ihm hervor, Kiesel rieseln von oben
      for(let i = 0; i < 4; i++){
        const ph = (t*2.2 + i/4) % 1;
        ctx.globalAlpha = (1 - ph)*0.5; ctx.fillStyle = '#d8c8a8';
        ctx.beginPath(); ctx.arc(x + (i - 1.5)*FELS_RADIUS*0.6, F.y + FELS_RADIUS - 4 - ph*16, 6 + ph*10, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.fillStyle = '#4a3e30';
      for(let i = 0; i < 5; i++){ const ph = (t*1.5 + i*0.21) % 1; ctx.beginPath(); ctx.arc(x - 30 + i*15, F.y - FELS_RADIUS - 40 + ph*40, 2.5, 0, Math.PI*2); ctx.fill(); }
    }
    if(F.aktiv && Math.abs(F.vx) > 1){   // Staubwolke hinter dem Fels + hüpfende Kiesel
      for(let i = 0; i < 4; i++){
        const ph = (t*2 + i/4) % 1;
        ctx.globalAlpha = (1 - ph)*0.45; ctx.fillStyle = '#d8c8a8';
        ctx.beginPath(); ctx.arc(x - F.dir*(FELS_RADIUS*0.6 + ph*40), F.y + FELS_RADIUS - 6 - ph*14, 6 + ph*11, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if(F.vy === 0) felsKiesel(x - F.dir*FELS_RADIUS*0.5, F.y + FELS_RADIUS - 3, 5, t, F.dir, 34);
    }
  }
}
// Ankündigung am Bildrand: Staub steigt auf, Kiesel rieseln, ein pulsierendes Warnzeichen – je näher, desto stärker
function felsAnkuendigung(F, t){
  const k = F.ankuendigung || 0; if(k <= 0) return;
  const mitte = camX + VW/2, rand = F.x < mitte ? 0 : VW, innen = F.x < mitte ? 1 : -1;
  const by = F.y + FELS_RADIUS;
  for(let i = 0; i < 5; i++){
    const ph = (t*1.8 + i/5) % 1;
    ctx.globalAlpha = (1 - ph)*0.55*k; ctx.fillStyle = '#d8c8a8';
    ctx.beginPath(); ctx.arc(rand + innen*(8 + ph*30 + i*6), by - 8 - ph*40, 10 + ph*16, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = k; ctx.fillStyle = '#4a3e30';
  for(let i = 0; i < 4; i++){ const ph = (t*1.3 + i*0.27) % 1; ctx.beginPath(); ctx.arc(rand + innen*(14 + i*12), by - 160 + ph*150, 3, 0, Math.PI*2); ctx.fill(); }
  // Warnzeichen: Fels-Symbol mit Ausrufezeichen, pulsiert
  const px = rand + innen*34, py = F.y, s = 1 + 0.12*Math.sin(t*12);
  ctx.globalAlpha = 0.55 + 0.45*k;
  ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(30,20,12,.8)'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#ffb03a'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#ffb03a'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 1);
  ctx.fillStyle = '#ffb03a'; ctx.beginPath(); ctx.moveTo(-innen*30, -7); ctx.lineTo(-innen*30, 7); ctx.lineTo(-innen*40, 0); ctx.fill();
  ctx.restore(); ctx.globalAlpha = 1;
}
elementRegistrieren({
  id: 'fels', name: 'Rollender Fels', feld: 'boulders',
  editor: {
    werkzeug: 'fels', gruppe: 'gefahren', art: 'punkt', ziehbar: false, farbe: '#a8977a',
    mitNummer: true, nummerName: 'Fels',
    titel: 'Rollender Fels: unteres Mittel-Kästchen setzen. Rollt los, sobald die Verknüpfung AN geht (Hebel/Druckplatte), ' +
           'fällt über Kanten und zerschellt an Wänden/Türen. Berührung = tot. Ein Hebel, der einen Fels startet, sollte auch ein Tor öffnen',
    optionen: [
      {key: 'richtung', label: 'Richtung', werte: [['r', '→ rechts'], ['l', '← links']]},
      {key: 'tempo', label: 'Tempo', zahl: true, werte: [['3.6', 'langsam'], ['4.4', 'mittel'], ['5.4', 'schnell']]},
    ],
    klick(p){ p.richtung = p.richtung === 'l' ? 'r' : 'l'; },
    // sichtbar: Fels mit Radius 1,25 Kästchen, unten auf dem gesetzten Kästchen -> 3 breit, 3 hoch
    bereich: p => [-1, 0, 1].flatMap(dc => [-2, -1, 0].map(dr => [p.c + dc, p.r + dr])),
    zeichnen(ctx, c, r, TILE, p){
      const R = TILE*1.25;
      felsBild(ctx, c*TILE + TILE/2, (r + 1)*TILE - R, R, 0, true);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3;
      const txt = (p.richtung === 'l' ? '← ' : '→ ') + p.link;
      ctx.strokeText(txt, c*TILE + TILE/2, (r + 1)*TILE - R); ctx.fillText(txt, c*TILE + TILE/2, (r + 1)*TILE - R);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: (p.r + 1)*TILE, link: p.link,
      richtung: p.richtung === 'l' ? 'l' : 'r', tempo: Number(p.tempo) || 4.4})),
  },
  spiel: {
    laden(daten){
      felsen = (daten.boulders || []).map(b => ({sx: b.x, sy: b.y - FELS_RADIUS, link: b.link || null, dir: b.richtung === 'l' ? -1 : 1,
                                                 tempo: Number(b.tempo) || 4.4}));
      felsZuruecksetzen();
    },
    schritt: felsSchritt,
    zuruecksetzen: felsZuruecksetzen,
    zeichnen(){ if(felsen.length) felsZeichnen(); },
  },
});

// ==== foerderband
// elemente/foerderband.js – Element „Förderband“ (Ausbau 7, Welt Höhle; Punkt-Element, mit der Maus malbar).
// Fester Boden-Block, der alles, was darauf steht, mitnimmt (nach rechts oder links, langsam oder schnell). Läuft man
// gegen das Band, kommt man langsamer voran; mit dem Band schneller. Springt man ab, nimmt man den Band-Schwung mit. Optional an einer Verknüpfungs-Nummer:
// „Nummer dreht um“ (solange die Nummer an ist, läuft es andersherum) oder „Nummer hält an“.
// Wer springt, segelt oder am Seil hängt, wird NICHT mitgenommen (das Band wirkt nur auf dem Boden).
// Rolle: der Affe hängt sich am Haken fest und hält gegen den Strom; das Schweinchen segelt über Bänder hinweg und
// landet genau; oft schaltet einer per Hebel das Band, auf dem der andere fährt.
// Spiel-Daten: baender [{x, y, w, h, richtung: 'r'|'l', tempo, link?, schalter: 'dreht'|'stopp'}]
// Im Spiel: solids mit type 'band'.
let bandSchritte = 0;   // nur für das Laufband-Muster (Anzeige)
// Band unter der Figur: steht sie darauf – oder schwebt sie nur knapp darüber (BAND_NAH, z. B. Mini-Hüpfer in einem
// niedrigen Tunnel), nimmt das Band sie trotzdem mit. Hohe Sprünge im Freien entkommen ihm.
function bandUnter(player){
  if(player.grounded) return player.standingOn && player.standingOn.type === 'band' ? player.standingOn : null;
  if(player.hookAttached) return null;
  for(const s of solids){
    if(s.type !== 'band' || s.gone) continue;
    const ab = s.y - player.y;   // Abstand Füße -> Band-Oberseite
    if(ab >= -0.5 && ab <= BAND_NAH && player.x + player.w/2 > s.x && player.x - player.w/2 < s.x + s.w) return s;
  }
  return null;
}
function bandTempo(s){
  if(s.link && linkOn[s.link]){
    if(s.schalter === 'stopp') return 0;
    return -s.dir*s.tempo;
  }
  return s.dir*s.tempo;
}
function bandSchritt(){
  bandSchritte++;
  // Richtungswechsel hörbar machen (nur sichtbare Bänder)
  let um = null;
  for(const s of solids){
    if(s.type !== 'band') continue;
    const t = bandTempo(s);
    if(s.letztesTempo !== undefined && t !== s.letztesTempo && s.x + s.w > camX - 40 && s.x < camX + VW + 40) um = s;
    s.letztesTempo = t;
  }
  if(um) SFX.bandUm(um.x + um.w/2);
}
function bandBild(c, x, y, w, h, t, phase){
  c.fillStyle = '#3b3446'; c.fillRect(x, y, w, h);                        // Rahmen
  c.fillStyle = '#26212f'; c.fillRect(x + 2, y + 4, w - 4, h - 8);
  // Gurt oben mit wandernden Pfeilen
  c.fillStyle = '#5c5468'; c.fillRect(x, y, w, 9);
  c.save(); c.beginPath(); c.rect(x, y, w, 9); c.clip();
  c.fillStyle = t === 0 ? 'rgba(200,200,210,.35)' : '#ffd36a';
  const dir = Math.sign(t) || 1, off = ((phase % 16) + 16) % 16;
  for(let k = -16; k < w + 16; k += 16){
    const px = x + k + (dir > 0 ? off : 16 - off);
    c.beginPath(); c.moveTo(px - 3*dir, y + 1.5); c.lineTo(px + 3*dir, y + 4.5); c.lineTo(px - 3*dir, y + 7.5); c.closePath(); c.fill();
  }
  c.restore();
  // Rollen
  c.fillStyle = '#8a8296';
  for(const rx of [x + 8, x + w - 8]){ c.beginPath(); c.arc(rx, y + h*0.62, 5, 0, Math.PI*2); c.fill(); }
  c.fillStyle = '#26212f';
  for(const rx of [x + 8, x + w - 8]){ c.beginPath(); c.arc(rx, y + h*0.62, 1.8, 0, Math.PI*2); c.fill(); }
}
function bandZeichnen(){
  for(const s of solids){
    if(s.type !== 'band') continue;
    const x = Math.round(s.x - camX);
    if(x + s.w < -20 || x > VW + 20) continue;
    bandBild(ctx, x, s.y, s.w, s.h, bandTempo(s), bandSchritte*bandTempo(s)*0.5);
  }
}
ELEMENT_SOLID_TYPEN.add('band');
elementRegistrieren({
  id: 'foerderband', name: 'Förderband', feld: 'baender',
  editor: {
    werkzeug: 'band', gruppe: 'bewegung', vor: 'move', art: 'punkt', ziehbar: true, farbe: '#ffd36a',
    titel: 'Förderband: fester Boden, der Figuren auf ihm mitnimmt (Richtung/Tempo). Optional per Verknüpfungs-Nummer ' +
           'umdrehen oder anhalten. Klick auf ein vorhandenes Kästchen = Richtung tauschen',
    optionen: [
      {key: 'richtung', label: 'Richtung', werte: [['r', '→ rechts'], ['l', '← links']]},
      {key: 'tempo', label: 'Tempo', zahl: true, werte: [['1.6', 'langsam'], ['2.8', 'schnell'], ['8', 'reißend']]},
      {key: 'schalter', label: 'Nummer', titel: 'Immer gleich – oder solange die gewählte Verknüpfungs-Nummer an ist: andersherum bzw. still',
       werte: [['immer', 'ohne'], ['dreht', 'Nummer dreht um'], ['stopp', 'Nummer hält an']]},
    ],
    neu(p){
      const o = {c: p.c, r: p.r, richtung: p.richtung, tempo: p.tempo, schalter: p.schalter};
      if(p.schalter === 'dreht' || p.schalter === 'stopp') o.link = Number(linkSelect.value);
      return o;
    },
    nummerAktiv: p => (p.schalter === 'dreht' || p.schalter === 'stopp') && !!p.link,
    mitNummer: false, nummerName: 'Förderband',
    klick(p){ p.richtung = p.richtung === 'l' ? 'r' : 'l'; },
    zeichnen(ctx, c, r, TILE, p){
      bandBild(ctx, c*TILE, r*TILE, TILE, TILE, (p.richtung === 'l' ? -1 : 1)*(Number(p.tempo) || 1.6), 0);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText((p.richtung === 'l' ? '←' : '→') + (Number(p.tempo) > 2 ? '»' : '') + (p.link ? ' ' + p.link : ''), c*TILE + TILE/2, r*TILE + TILE*0.62);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, w: TILE, h: TILE, richtung: p.richtung === 'l' ? 'l' : 'r',
      tempo: Number(p.tempo) || 1.6, ...((p.schalter === 'dreht' || p.schalter === 'stopp') && p.link ? {link: p.link, schalter: p.schalter} : {})})),
  },
  spiel: {
    laden(daten){
      for(const b of (daten.baender || [])) solids.push({x: b.x, y: b.y, w: b.w || 40, h: b.h || 40, type: 'band',
        dir: b.richtung === 'l' ? -1 : 1, tempo: Number(b.tempo) || 1.6, link: b.link || null, schalter: b.schalter === 'stopp' ? 'stopp' : 'dreht'});
      bandSchritte = 0;
    },
    // nach dem Bewegen: wer auf einem Band steht, wird mitgenommen (Wände halten ihn auf)
    // Springt man ab, nimmt man den Schwung des Bands einmal mit (Band als Schleuder; Höchsttempo wie beim Sprint)
    nachBewegung(player){
      const s = bandUnter(player);
      if(!s){
        if(!player.grounded && player.bandSchwung) player.vx += player.bandSchwung;
        player.bandSchwung = 0;
        return;
      }
      const d = bandTempo(s);
      player.bandSchwung = d;
      if(!d) return;
      const v0 = player.vx;
      player.vx = d; player.x += d; collideAxis(player, 'x');
      player.vx = v0;
    },
    schritt: bandSchritt,
    zeichnen(){ bandZeichnen(); },
  },
});

// ==== haftflaeche
// elemente/haftflaeche.js – Element „Haftfläche“ (Nacht-Ausbau; Kachel-Element, siehe 00-register.js).
// Wand-/Deckenkästchen mit klebriger lila Schicht. Wer darunter „hoch“ hält (Affe: W / Seil ranziehen, Schweinchen: ↑,
// Controller: Steuerkreuz hoch), hält sich von unten fest, rollt links/rechts entlang – langsamer als Laufen (HAFT_TEMPO),
// mit etwas Schwung, um Kanten der Haftfläche herum (auch an ihren Seiten weiter) – und fällt beim Loslassen. Springen =
// Absprung, Dash geht auch von dort. Sonst ist eine Haftfläche eine ganz normale Wand (Boden obendrauf, Wandsprung an
// der Seite). Die Bewegung selbst steht in js/32-neue-bewegung.js (haftStarten, haftSchritt, haftNachher).
// Rolle: Wege an der Decke über Gefahren – beide Figuren können sich festhalten; typisch hält einer sich oben fest und
// rollt zum Hebel, während der andere unten wartet, oder die Haftfläche ist der Anschluss nach einem Seil-Schwung bzw.
// nach dem Segeln im Aufwind.
// Im Spiel: solids mit type 'wall' und haft: true (Kollision und Aussehen wie Wand, dazu die lila Schicht).
const HAFT_LILA = {schicht: '#e9a620', hell: '#fff1a8', dunkel: '#9a5a08'};
function haftSchichtZeichnen(){
  const t = performance.now();
  const H = HAFT_LILA;
  for(const s of solids){
    if(!s.haft || s.gone) continue;
    const x0 = Math.round(s.x - camX);
    if(x0 + s.w < -20 || x0 > VW + 20) continue;
    for(let cx = 0; cx < s.w; cx += 40) for(let cy = 0; cy < s.h; cy += 40){
      const c = Math.floor((s.x + cx)/40), r = Math.floor((s.y + cy)/40), x = x0 + cx, y = s.y + cy;
      const frei = (dc, dr) => !festIst(c + dc, r + dr);
      const oben = frei(0,-1), unten = frei(0,1), links = frei(-1,0), rechts = frei(1,0);
      // Honigschicht: weich, leicht durchscheinend, mit welligem Rand
      ctx.fillStyle = H.schicht; ctx.globalAlpha = .93;
      if(oben){ ctx.beginPath(); ctx.moveTo(x, y + 2);
        for(let i = 0; i <= 8; i++) ctx.lineTo(x + i*5, y + 6 + 2.5*Math.sin(c*2.1 + i*1.1 + (i%2)));
        ctx.lineTo(x + 40, y); ctx.lineTo(x, y); ctx.fill(); }
      if(links) { ctx.beginPath(); ctx.moveTo(x, y); for(let i = 0; i <= 8; i++) ctx.lineTo(x + 5 + 1.8*Math.sin(r*1.9 + i*1.3), y + i*5); ctx.lineTo(x, y + 40); ctx.fill(); }
      if(rechts){ ctx.beginPath(); ctx.moveTo(x + 40, y); for(let i = 0; i <= 8; i++) ctx.lineTo(x + 35 - 1.8*Math.sin(r*1.7 + i*1.3), y + i*5); ctx.lineTo(x + 40, y + 40); ctx.fill(); }
      if(unten){
        ctx.beginPath(); ctx.moveTo(x, y + 28);
        for(let i = 0; i <= 8; i++) ctx.lineTo(x + i*5, y + 31 + 2*Math.sin(c*1.3 + i*1.5));
        ctx.lineTo(x + 40, y + 40); ctx.lineTo(x, y + 40); ctx.fill();
        // dicke Tropfen, die langsam wandern
        for(let k = 0; k < 2; k++){
          const dx = 10 + k*20 + ((c*7 + k*3) % 6), ph = t/900 + c*1.9 + k*2.7;
          const lang = 6 + 7*(0.5 + 0.5*Math.sin(ph));
          ctx.beginPath(); ctx.moveTo(x + dx - 4.5, y + 33);
          ctx.quadraticCurveTo(x + dx - 2, y + 38, x + dx - 2.6, y + 40 + lang*0.6);
          ctx.arc(x + dx, y + 40 + lang*0.6, 2.8, Math.PI, 0, true);
          ctx.quadraticCurveTo(x + dx + 2, y + 38, x + dx + 4.5, y + 33); ctx.fill();
          ctx.fillStyle = H.hell; ctx.globalAlpha = .8; ctx.beginPath(); ctx.ellipse(x + dx - 0.9, y + 41 + lang*0.5, 0.9, 1.6, 0, 0, 6.3); ctx.fill();
          ctx.fillStyle = H.schicht; ctx.globalAlpha = .93;
        }
        ctx.fillStyle = H.dunkel; ctx.globalAlpha = .35; ctx.fillRect(x, y + 31, 40, 1.2);
      }
      // Glanzlichter
      ctx.globalAlpha = .75; ctx.fillStyle = H.hell;
      if(oben){ ctx.beginPath(); ctx.ellipse(x + 12 + (c*9%14), y + 3.6, 6, 1.3, 0, 0, 6.3); ctx.fill(); }
      if(unten){ ctx.beginPath(); ctx.ellipse(x + 10 + (c*5%10), y + 33.5, 5, 1.2, 0, 0, 6.3); ctx.fill(); }
      if(links) ctx.fillRect(x + 1.8, y + 6, 1.4, 12);
      if(rechts) ctx.fillRect(x + 36.8, y + 6, 1.4, 12);
      ctx.globalAlpha = 1;
    }
  }
}
elementRegistrieren({
  id: 'haftflaeche', name: 'Haftfläche', feld: 'haftflaechen',
  editor: {
    werkzeug: 'haft', gruppe: 'gelaende', vor: 'fake', art: 'kachel', ziehbar: true,
    titel: 'Haftfläche: Wand/Decke mit klebriger Unterseite – „hoch“ halten = von unten festhalten, links/rechts entlangrollen ' +
           '(auch um Kanten), loslassen = fallen, Springen/Dash geht von dort. Sonst eine normale Wand',
    farbe: '#8f4fd6', kachelFarbe: 'rgba(143,79,214,0.55)',
    zeichnen(ctx, c, r, TILE){
      const X = c*TILE, Y = r*TILE;
      ctx.fillStyle = '#6b5a4a'; ctx.fillRect(X, Y, TILE, TILE);
      ctx.fillStyle = '#8f4fd6'; ctx.fillRect(X, Y + TILE - 9, TILE, 9);
      ctx.fillStyle = '#c99bff'; for(let k = 0; k < 3; k++) ctx.fillRect(X + 6 + k*12, Y + TILE - 4, 5, 2);
    },
    exportieren: (zellen, TILE, mergeRects) => mergeRects(zellen),
  },
  spiel: {
    laden(daten){ for(const h of (daten.haftflaechen || [])) solids.push({x: h.x, y: h.y, w: h.w, h: h.h, type: 'wall', haft: true}); },
    zeichnen: haftSchichtZeichnen,
  },
});

// ==== leuchtkristall
// elemente/leuchtkristall.js – Elemente „Leuchtkristall“ und „Dunkelzone“ (Ausbau 7, Welt Höhle; Punkt-Elemente).
// DUNKELZONE: In diesen Kästchen ist es fast stockdunkel (DUNKEL_STAERKE) – um die Figuren leuchtet nur ein kleiner
// Kreis (DUNKEL_FIGUR). Münzen, Haken, Hebel, Checkpoints und das Ziel glimmen schwach, damit man nie blind springt.
// LEUCHTKRISTALL: glimmt im Dunkeln schwach. Mit der Hebel-Taste (J / Num 2 / Kreis) angeschlagen leuchtet er
// LEUCHT_DAUER lang hell und weit (LEUCHT_RADIUS); in den letzten 2 Sekunden flackert er zur Warnung.
// Mit „per Nummer“ leuchtet er dauerhaft, solange seine Verknüpfungs-Nummer an ist (Hebel/Druckplatte).
// Das Anschlagen hängt im Verknüpfungs-System (js/05-level-objekte.js): Hebel-Taste ohne Hebel und ohne Spiegel in
// Reichweite -> leuchtAnschlagen(figur). Das Licht kommt in themeLights / drawThemeDarkness (js/10a-themen.js) dazu.
// Rolle: einer schlägt Kristalle an (der Affe hohe per Haken, das Schweinchen ferne segelnd), der andere läuft im
// Licht; wer vorne läuft, leuchtet dem anderen den Weg.
// Spiel-Daten: leuchtkristalle [{x, y (Mitte), link?}], dunkelzonen [{x, y, w, h}]
let leuchtKristalle = [];   // {x, y, link, t (Restschritte), schlagT}
let dunkelZonen = [];
function leuchtStaerke(k){
  if(k.link && linkOn[k.link]) return 1;
  if(k.t <= 0) return 0;
  if(k.t > LEUCHT_WARN) return Math.min(1, (LEUCHT_DAUER - k.t + 1)/8);   // kurz aufblühen
  return 0.35 + 0.65*(k.t/LEUCHT_WARN)*(0.75 + 0.25*Math.sin(k.t*0.9));   // flackern und ausgehen
}
const leuchtImBild = k => k.x > camX - 80 && k.x < camX + VW + 80;
function leuchtSchritt(){
  for(const k of leuchtKristalle){
    if(k.t > 0){ k.t--; if(k.t === LEUCHT_WARN && leuchtImBild(k)) SFX.leuchtFlacker(k.x); }
    if(k.schlagT > 0) k.schlagT--;
  }
}
// (05-level-objekte.js) Hebel-Taste ohne Hebel/Spiegel: nächsten Kristall in Reichweite anschlagen
// nächster Leuchtkristall in Reichweite der Hebel-Taste (oder null)
function leuchtInReichweite(player){
  let best = null, bd = Infinity;
  for(const k of leuchtKristalle){
    const dx = Math.abs(player.x - k.x), dy = Math.abs((player.y - player.h*0.5) - k.y);
    if(dx >= LEUCHT_REICHWEITE || dy >= LEUCHT_REICHWEITE) continue;
    if(dx < bd){ bd = dx; best = k; }
  }
  return best;
}
function leuchtAnschlagen(player){
  const best = leuchtInReichweite(player);
  if(!best) return false;
  best.t = LEUCHT_DAUER; best.schlagT = 14;
  player.leverAnim = {t0: performance.now(), dir: Math.sign(best.x - player.x) || player.facing || 1};
  SFX.leuchtAn(best.x);
  return true;
}
function leuchtZuruecksetzen(){ for(const k of leuchtKristalle){ k.t = 0; k.schlagT = 0; } }
// Lichtquellen für die normale Dunkelheit (themeLights): Glimmen + heller Kreis
function leuchtLichter(L){
  for(const k of leuchtKristalle){
    L.push([k.x, k.y, 48]);
    const s = leuchtStaerke(k);
    if(s > 0) L.push([k.x, k.y, LEUCHT_RADIUS*s]);
  }
}
const imDunkel = (x, y) => dunkelZonen.some(z => x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h);
// Dunkelzonen über die fertige Welt legen (nach der normalen Dunkelheit; Bildschirm-Koordinaten wie drawThemeDarkness)
let dunkelCanvas = null;
function dunkelZeichnen(){
  if(!dunkelZonen.length) return;
  const sx = wx => (wx - camX)*zoom, sy = wy => wy*zoom + H*(1 - zoom);
  const sicht = dunkelZonen.filter(z => sx(z.x + z.w) > -80 && sx(z.x) < W + 80);
  if(!sicht.length) return;
  const k = typeof DUNKEL_AUFLOESUNG === 'number' ? DUNKEL_AUFLOESUNG : 1;   // halbe Auflösung wie die Nacht (10a)
  if(!dunkelCanvas){ dunkelCanvas = document.createElement('canvas'); dunkelCanvas.width = Math.round(W*k); dunkelCanvas.height = Math.round(H*k); }
  const g = dunkelCanvas.getContext('2d'), F = 50*zoom;   // weicher Rand
  g.setTransform(k, 0, 0, k, 0, 0);
  g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
  const col = (a) => `rgba(3,2,10,${a})`;
  for(const z of sicht){
    const x0 = sx(z.x), x1 = sx(z.x + z.w), y0 = sy(z.y), y1 = sy(z.y + z.h);
    g.fillStyle = col(DUNKEL_STAERKE); g.fillRect(x0, y0, x1 - x0, y1 - y0);
    // weicher Übergang links/rechts nur dort, wo keine Nachbar-Zone anschließt
    if(!dunkelZonen.some(o => o !== z && Math.abs(o.x + o.w - z.x) < 1 && o.y < z.y + z.h && o.y + o.h > z.y)){
      const gr = g.createLinearGradient(x0 - F, 0, x0, 0); gr.addColorStop(0, col(0)); gr.addColorStop(1, col(DUNKEL_STAERKE));
      g.fillStyle = gr; g.fillRect(x0 - F, y0, F, y1 - y0);
    }
    if(!dunkelZonen.some(o => o !== z && Math.abs(o.x - (z.x + z.w)) < 1 && o.y < z.y + z.h && o.y + o.h > z.y)){
      const gr = g.createLinearGradient(x1, 0, x1 + F, 0); gr.addColorStop(0, col(DUNKEL_STAERKE)); gr.addColorStop(1, col(0));
      g.fillStyle = gr; g.fillRect(x1, y0, F, y1 - y0);
    }
  }
  // Licht hineinschneiden
  const L = [];
  for(const p of [p1, p2]) if(p) L.push([p.x, p.y - p.h*0.5, DUNKEL_FIGUR]);
  leuchtLichter(L);
  if(typeof lavaLichter === 'function') lavaLichter(L);   // Lava leuchtet (elemente/lava.js)
  for(const c of coins) if(!c.taken) L.push([c.x, c.y, 34]);
  for(const h of hooks) L.push([h.x, h.y, 46]);
  for(const sw of switchDefs) L.push([sw.x, sw.y, 50]);
  for(const cp of checkpointDefs) L.push([cp.x, cp.y - 30, 70]);
  if(goal) L.push([goal.x, goal.y - 30, 120]);
  g.globalCompositeOperation = 'destination-out';
  for(const [wx, wy, r] of L){
    const x = sx(wx), y = sy(wy), rr = r*zoom;
    if(x < -rr || x > W + rr) continue;
    const gr = g.createRadialGradient(x, y, 0, x, y, rr);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.65, 'rgba(0,0,0,0.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, Math.PI*2); g.fill();
  }
  g.globalCompositeOperation = 'source-over';
  ctx.drawImage(dunkelCanvas, 0, 0, W, H);
}
// Bild eines Kristalls (Spiel und Editor): violett-türkise Spitzen auf Stein, s = Leuchtstärke 0 … 1
function leuchtBild(c, x, y, s, schlag){
  c.save(); c.translate(x, y);
  if(s > 0){
    const gl = c.createRadialGradient(0, 0, 2, 0, 0, 34);
    gl.addColorStop(0, `rgba(180,250,255,${0.75*s})`); gl.addColorStop(1, 'rgba(180,250,255,0)');
    c.fillStyle = gl; c.beginPath(); c.arc(0, 0, 34, 0, Math.PI*2); c.fill();
  }
  if(schlag) c.rotate(Math.sin(schlag*1.3)*0.08);
  c.fillStyle = '#3a3150'; c.beginPath(); c.ellipse(0, 15, 16, 6, 0, 0, Math.PI*2); c.fill();   // Steinsockel
  const spitzen = [[-9, 14, -12, -6, 5], [0, 15, 0, -18, 6], [9, 14, 11, -4, 5]];
  for(const [bx, by, tx, ty, w] of spitzen){
    const gr = c.createLinearGradient(bx, by, tx, ty);
    gr.addColorStop(0, '#6a4fb0'); gr.addColorStop(1, s > 0 ? '#e8ffff' : '#8fe8f0');
    c.fillStyle = gr; c.beginPath(); c.moveTo(bx - w, by); c.lineTo(tx, ty); c.lineTo(bx + w, by); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(bx, by); c.lineTo(tx, ty); c.stroke();
  }
  c.restore();
}
function leuchtZeichnen(){
  for(const k of leuchtKristalle){
    const x = k.x - camX;
    if(x < -60 || x > VW + 60) continue;
    leuchtBild(ctx, x, k.y, Math.max(0.15, leuchtStaerke(k)), k.schlagT);
    // Tasten-Blase, wenn die Hebel-Taste gerade diesen Kristall anschlagen würde (Hebel und Spiegel haben Vorrang)
    const nah = P => !!P && !hebelInReichweite(P) && !(typeof spiegelInReichweite === 'function' && spiegelInReichweite(P)) && leuchtInReichweite(P) === k;
    if(nah(p1) || nah(p2)) aktionsHinweis(Math.round(x), k.y - 60, nah(p1), nah(p2));
  }
}
elementRegistrieren({
  id: 'leuchtkristall', name: 'Leuchtkristall', feld: 'leuchtkristalle',
  editor: {
    werkzeug: 'leucht', gruppe: 'licht', vor: '#linkSelect', art: 'punkt', ziehbar: false, farbe: '#8fe8f0',
    titel: 'Leuchtkristall: glimmt im Dunkeln; mit der Hebel-Taste angeschlagen leuchtet er 8 s hell und weit (flackert ' +
           'vorher). „per Nummer“: leuchtet, solange die Verknüpfung an ist',
    optionen: [
      {key: 'schalter', label: 'Leuchten', titel: 'Anschlagen (8 s) – oder dauerhaft, solange die gewählte Verknüpfungs-Nummer an ist',
       werte: [['anschlagen', 'anschlagen'], ['nummer', 'per Nummer']]},
    ],
    neu(p){
      const o = {c: p.c, r: p.r, schalter: p.schalter};
      if(p.schalter === 'nummer') o.link = Number(linkSelect.value);
      return o;
    },
    nummerAktiv: p => p.schalter === 'nummer' && !!p.link,
    mitNummer: false, nummerName: 'Leuchtkristall',
    zeichnen(ctx, c, r, TILE, p){
      leuchtBild(ctx, c*TILE + TILE/2, r*TILE + TILE/2, p.link ? 0.6 : 0.25, 0);
      if(p.link){ ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.strokeText(String(p.link), c*TILE + TILE - 8, r*TILE + 8); ctx.fillText(String(p.link), c*TILE + TILE - 8, r*TILE + 8); }
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE + TILE/2, ...(p.schalter === 'nummer' && p.link ? {link: p.link} : {})})),
  },
  spiel: {
    laden(daten){ leuchtKristalle = (daten.leuchtkristalle || []).map(k => ({x: k.x, y: k.y, link: k.link || null, t: 0, schlagT: 0})); },
    schritt: leuchtSchritt,
    zuruecksetzen: leuchtZuruecksetzen,
    zeichnen(){ if(leuchtKristalle.length) leuchtZeichnen(); },
  },
});
elementRegistrieren({
  id: 'dunkelzone', name: 'Dunkelzone', feld: 'dunkelzonen',
  editor: {
    werkzeug: 'dunkel', gruppe: 'licht', art: 'punkt', ziehbar: true, farbe: '#14101f',
    titel: 'Dunkelzone: hier ist es fast stockdunkel, nur ein kleiner Lichtkreis um die Figuren – Leuchtkristalle helfen. ' +
           'Mit gedrückter Maus malen',
    zeichnen(ctx, c, r, TILE){
      ctx.fillStyle = 'rgba(10,6,24,.55)'; ctx.fillRect(c*TILE, r*TILE, TILE, TILE);
      ctx.fillStyle = 'rgba(180,170,255,.6)'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('☾', c*TILE + TILE/2, r*TILE + TILE/2);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, w: TILE, h: TILE})),
  },
  spiel: {
    laden(daten){
      // Kästchen zu Reihen zusammenfassen (weniger Rechtecke, weicher Rand nur außen)
      const roh = (daten.dunkelzonen || []).map(z => ({x: z.x, y: z.y, w: z.w || 40, h: z.h || 40})).sort((a, b) => a.y - b.y || a.x - b.x);
      dunkelZonen = [];
      for(const z of roh){
        const v = dunkelZonen[dunkelZonen.length - 1];
        if(v && v.y === z.y && v.h === z.h && Math.abs(v.x + v.w - z.x) < 1) v.w += z.w; else dunkelZonen.push({...z});
      }
    },
  },
});

// ==== licht
// elemente/licht.js – Elemente „Lichtquelle“, „Spiegel“ und „Lichtkristall“ (Ausbau 7, Welt Ruinen; Punkt-Elemente).
// Eine Lichtquelle (Sonnen-Scheibe im Stein, fest wie eine Wand) schickt einen Lichtstrahl in ihre Richtung (→ ← ↑ ↓).
// Der Strahl läuft Kästchen für Kästchen, bis er auf Stein, eine geschlossene Tür, Wechselboden oder eine Falle trifft
// (Stege, Scheinwände und Figuren lässt er durch). Ein SPIEGEL ( / oder \ ) lenkt ihn um 90° um; jede Figur kann einen
// Spiegel in Reichweite mit ihrer Hebel-Taste (J / Num 2 / Kreis) umdrehen. Trifft der Strahl einen LICHTKRISTALL, ist
// dessen Verknüpfungs-Nummer AN, solange das Licht darauf fällt (wie eine Druckplatte: Türen auf, Bewegung fährt …).
// Rolle: Spiegel stehen oft dort, wo nur der Affe (per Haken) oder nur das Schweinchen (segelnd) hinkommt – einer lenkt
// das Licht, der andere geht durch die Tür, die der Kristall öffnet.
// SCHALTBARER SPIEGEL (optional „per Nummer“): dreht sich NUR, wenn jemand etwas bedient – jedes Betreten einer Druckplatte
// (nicht das Verlassen, nicht das Stehenbleiben) bzw. jede Betätigung eines Hebels seiner Nummer dreht ihn genau einmal
// (animiert, SPIEGEL_DREH_SCHRITTE ≈ 0,3 s). Kein Takt, kein Timer. Von Hand ist er dann gesperrt (Plakette + Kettenzeichen).
// Auslöser während einer Drehung werden gemerkt: einer wartet und dreht danach weiter, zwei weitere heben sich auf
// (hin und zurück) – die Endstellung passt also immer zur Zahl der Auslöser, und nichts stapelt sich auf.
// Lichtkristalle drehen keine Spiegel (sonst könnte sich Licht und Spiegel endlos gegenseitig weiterschalten).
// Spiel-Daten: lichtquellen [{x, y (linke obere Ecke), richtung}], spiegel [{x, y, stellung: '/'|'\\', link?}], kristalle [{x, y, link}]
let lichtquellen = [], spiegelListe = [], kristalle = [];
let lichtWege = [];   // je Quelle: [[x, y], …] Punkte des Strahls (Welt-Koordinaten, Kästchen-Mitten)
const LICHT_RICHTUNG = {r: [1, 0], l: [-1, 0], o: [0, -1], u: [0, 1]};
const LICHT_PFEIL = {r: '→', l: '←', o: '↑', u: '↓'};
// Spiegel: '/' lenkt (dx, dy) nach (-dy, -dx), '\' nach (dy, dx) (y wächst nach unten)
function lichtUmlenken(st, dx, dy){ return st === '/' ? [-dy, -dx] : [dy, dx]; }
// Strahl verfolgen (gemeinsam für Spiel und Editor): fest(c, r) = blockiert?, spiegelBei(c, r), kristallBei(c, r)
function lichtVerfolgen(c, r, dx, dy, fest, spiegelBei, kristallBei){
  const weg = [[c, r]], getroffen = [], besucht = new Set();
  let ende = null;   // wo der Strahl endet: {art: 'wand'|'kristall'|'dreh'|'weit', dx, dy, sp?}
  const MAX = typeof LICHT_REICHWEITE !== "undefined" ? LICHT_REICHWEITE : 80;   // Editor lädt 02-physik-werte.js nicht
  for(let i = 0; i < MAX; i++){
    c += dx; r += dy;
    const key = c + ',' + r + ',' + dx + ',' + dy;
    if(besucht.has(key)) break; besucht.add(key);   // Kreis aus Spiegeln: nie endlos
    const k = kristallBei(c, r);
    if(k){ weg.push([c, r]); getroffen.push(k); ende = {art: 'kristall', dx, dy}; break; }
    const sp = spiegelBei(c, r);
    if(sp && sp.drehS > 0){ weg.push([c, r]); ende = {art: 'dreh', dx, dy, sp}; break; }   // dreht gerade: Strahl endet am Spiegel
    if(sp){ weg.push([c, r]); [dx, dy] = lichtUmlenken(sp.stellung, dx, dy); continue; }
    if(fest(c, r)){ weg.push([c - dx*0.5, r - dy*0.5]); ende = {art: 'wand', dx, dy}; break; }
    if(i === MAX - 1){ weg.push([c, r]); ende = {art: 'weit', dx, dy}; }
  }
  return {weg, getroffen, ende};
}
// Ist das Kästchen (c, r) für das Licht fest? Feststehende Teile stehen in einem Raster-Verzeichnis (je Kästchen die
// Teile, deren Mitte es abdecken) – vorher wurde für jedes Kästchen des Strahls JEDES Teil des Levels geprüft
// (~400 Teile × 80 Kästchen × Quellen pro Spielschritt: in Licht-Leveln über 20 ms je Schritt -> Ruckeln).
// Teile, die sich bewegen können (bewegte Böden, eigene Element-Sorten), werden weiter einzeln geprüft. Gleiches Ergebnis.
const LICHT_FESTE_TYPEN = new Set(['ground', 'wall', 'crumble', 'door', 'platform']);
let lichtGitter = {src: null, n: -1, map: null, beweglich: []};
function lichtGitterHolen(){
  if(lichtGitter.src === solids && lichtGitter.n === solids.length) return lichtGitter;
  const map = new Map(), beweglich = [];
  for(const s of solids){
    if(s.type === 'oneway' || s.type === 'fake' || s.type === 'lichtquelle') continue;
    if(!LICHT_FESTE_TYPEN.has(s.type)){ beweglich.push(s); continue; }
    const c0 = Math.ceil((s.x - 20)/40), c1 = Math.ceil((s.x + s.w - 20)/40), r0 = Math.ceil((s.y - 20)/40), r1 = Math.ceil((s.y + s.h - 20)/40);
    for(let c = c0; c < c1; c++) for(let r = r0; r < r1; r++){
      const k = c + ',' + r; let l = map.get(k); if(!l) map.set(k, l = []); l.push(s);
    }
  }
  return lichtGitter = {src: solids, n: solids.length, map, beweglich};
}
function lichtFestImSpiel(c, r){
  const px = c*40 + 20, py = r*40 + 20, G = lichtGitterHolen();
  const l = G.map.get(c + ',' + r);
  if(l) for(const s of l) if(!s.gone && px >= s.x && px < s.x + s.w && py >= s.y && py < s.y + s.h) return true;
  for(const s of G.beweglich){
    if(s.gone) continue;
    if(px >= s.x && px < s.x + s.w && py >= s.y && py < s.y + s.h) return true;
  }
  return false;
}
function lichtSchritt(){
  const spIdx = new Map(spiegelListe.map(s => [s.c + ',' + s.r, s])), kIdx = new Map(kristalle.map(k => [k.c + ',' + k.r, k]));
  const vorher = kristalle.map(k => k.an);
  for(const s of spiegelListe) if(s.drehS > 0 && --s.drehS === 0){   // schaltbarer Spiegel: Drehung fertig
    s.stellung = s.stellung === '/' ? '\\' : '/';
    if(s.wartet){ s.wartet = false; spiegelDrehStart(s); }
  }
  for(const k of kristalle) k.an = false;
  lichtWege = lichtquellen.map(q => {
    if(!lichtQuelleAn(q)) return [];   // Sonnenstein „per Nummer“: aus, solange seine Nummer aus ist
    const v = lichtVerfolgen(q.c, q.r, q.dx, q.dy, lichtFestImSpiel, (c, r) => spIdx.get(c + ',' + r), (c, r) => kIdx.get(c + ',' + r));
    for(const k of v.getroffen){ k.an = true; if(k.bleibt) k.gemerkt = true; }
    v.weg.ende = v.ende;   // fürs Zeichnen (Aufprall am Ende, mitziehender Strahl beim Drehen)
    return v.weg;
  });
  kristalle.forEach((k, i) => {
    if(k.an !== vorher[i] && k.x > camX - 80 && k.x < camX + VW + 80) SFX.kristall(k.x, k.an);
    if(k.an && !vorher[i] && k.link && typeof zielHinweisMerken === 'function') zielHinweisMerken(k.link);   // Ziel außer Bild: Pfeil am Rand
    if(k.an || k.gemerkt) k.leuchtT = Math.min(1, (k.leuchtT || 0) + 0.08); else k.leuchtT = Math.max(0, (k.leuchtT || 0) - 0.05);
  });
  for(const s of spiegelListe) if(s.drehT > 0) s.drehT--;
}
// (05-level-objekte.js, updatePlates) Kristall im Licht = Nummer an, wie eine gedrückte Druckplatte
function lichtWunsch(want){ for(const k of kristalle) if(k.link) want[k.link] = want[k.link] || !!k.an || !!k.gemerkt; }
// Sonnenstein an? (Standard: immer; „per Nummer“: nur solange seine Verknüpfung an ist)
function lichtQuelleAn(q){ return !q.link || !!linkOn[q.link]; }
// (05-level-objekte.js) Hebel-Taste ohne Hebel in Reichweite: nächsten Spiegel drehen
// nächster Spiegel in Reichweite der Hebel-Taste (oder null)
function spiegelInReichweite(player){
  let best = null, bd = Infinity;
  for(const s of spiegelListe){
    if(s.link) continue;   // schaltbarer Spiegel: nur per Platte/Hebel
    if(Math.abs(player.x - (s.x + 20)) >= LEVER_RANGE_X || Math.abs((player.y - player.h*0.5) - (s.y + 20)) >= LEVER_RANGE_Y) continue;
    const d = Math.abs(player.x - (s.x + 20)); if(d < bd){ bd = d; best = s; }
  }
  return best;
}
function spiegelBedienen(player){
  const best = spiegelInReichweite(player);
  if(!best) return false;
  best.stellung = best.stellung === '/' ? '\\' : '/'; best.drehT = 12;
  player.leverAnim = {t0: performance.now(), dir: Math.sign(best.x + 20 - player.x) || player.facing || 1};
  SFX.spiegel(best.x);
  return true;
}
// schaltbarer Spiegel: Platte betreten / Hebel betätigt (05-level-objekte.js) -> alle Spiegel dieser Nummer drehen einmal
function spiegelDrehStart(s){ s.drehS = typeof SPIEGEL_DREH_SCHRITTE !== 'undefined' ? SPIEGEL_DREH_SCHRITTE : 18; }
function spiegelAusloesen(link){
  let x = null;
  for(const s of spiegelListe){
    if(!s.link || s.link !== link) continue;
    if(s.drehS > 0) s.wartet = !s.wartet;   // dreht noch: merken (zwei weitere heben sich auf)
    else { spiegelDrehStart(s); if(x === null) x = s.x; }
  }
  if(x !== null) SFX.spiegelSchalt(x);
}
function lichtZuruecksetzen(){ for(const s of spiegelListe){ s.stellung = s.start; s.drehT = 0; s.drehS = 0; s.wartet = false; } for(const k of kristalle){ k.an = false; k.gemerkt = false; k.leuchtT = 0; } }
// --- Zeichnen (nur Anzeige) ---
function lichtQuelleBild(c, x, y, dx, dy, an, link){
  // Sonnenstein (Ruinen-Überarbeitung): dunkler Basaltblock mit Goldeinlage, glühende Sonnenscheibe mit drehendem
  // Strahlenkranz und Schein, Linse auf der Seite, aus der das Licht kommt
  const t = typeof performance !== 'undefined' ? performance.now()*0.001 : 0, cx = x + 20, cy = y + 20;
  const gr = c.createLinearGradient(x, y, x + 40, y + 40); gr.addColorStop(0, '#4a3f36'); gr.addColorStop(1, '#231c17');
  c.fillStyle = gr; roundRectPfad(c, x + 1, y + 1, 38, 38, 6); c.fill();
  c.strokeStyle = '#c9963a'; c.lineWidth = 2; roundRectPfad(c, x + 3, y + 3, 34, 34, 5); c.stroke();
  c.strokeStyle = 'rgba(255,214,120,.35)'; c.lineWidth = 1; roundRectPfad(c, x + 6, y + 6, 28, 28, 4); c.stroke();
  for(const [u, v] of [[7, 7], [33, 7], [7, 33], [33, 33]]){ c.fillStyle = '#e0b04a'; c.beginPath(); c.arc(x + u, y + v, 1.6, 0, Math.PI*2); c.fill(); }
  // Schein hinter der Scheibe
  const puls = an ? 0.85 + 0.15*Math.sin(t*3) : 0.4;
  const sch = c.createRadialGradient(cx, cy, 2, cx, cy, 20);
  sch.addColorStop(0, `rgba(255,240,170,${0.9*puls})`); sch.addColorStop(0.5, `rgba(255,190,60,${0.45*puls})`); sch.addColorStop(1, 'rgba(255,160,40,0)');
  c.fillStyle = sch; c.beginPath(); c.arc(cx, cy, 20, 0, Math.PI*2); c.fill();
  // Strahlenkranz (dreht sich langsam)
  c.save(); c.translate(cx, cy); c.rotate(t*0.6);
  c.strokeStyle = an ? '#ffd76a' : '#a8843a'; c.lineWidth = 2; c.lineCap = 'round';
  for(let i = 0; i < 12; i++){ const a = i/12*Math.PI*2, r1 = 10.5, r2 = i % 2 ? 14 : 16; c.beginPath(); c.moveTo(Math.cos(a)*r1, Math.sin(a)*r1); c.lineTo(Math.cos(a)*r2, Math.sin(a)*r2); c.stroke(); }
  c.restore();
  // Scheibe
  const sd = c.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 9);
  sd.addColorStop(0, '#ffffff'); sd.addColorStop(0.4, an ? '#fff1a8' : '#e8d08a'); sd.addColorStop(1, an ? '#ffb02e' : '#b8862e');
  c.fillStyle = sd; c.beginPath(); c.arc(cx, cy, 8.5, 0, Math.PI*2); c.fill();
  c.strokeStyle = '#8a5a14'; c.lineWidth = 1.2; c.stroke();
  // Linse in Strahlrichtung
  const lx = cx + dx*16, ly = cy + dy*16;
  c.fillStyle = '#c9963a'; c.beginPath(); c.arc(lx, ly, 4.5, 0, Math.PI*2); c.fill();
  c.fillStyle = an ? '#fffbe6' : '#d8c08a'; c.beginPath(); c.arc(lx, ly, 2.8, 0, Math.PI*2); c.fill();
  if(link && typeof linkColor === 'function'){   // „per Nummer“: Plakette in der Farbe der Nummer
    c.fillStyle = linkColor(link); c.beginPath(); c.arc(x + 33, y + 7, 6, 0, Math.PI*2); c.fill();
    c.strokeStyle = 'rgba(40,22,8,.8)'; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = '#fff'; c.font = 'bold 8px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(link), x + 33, y + 7.5);
  }
}
function roundRectPfad(c, x, y, w, h, r){
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
// Halterung eines Spiegels (damit er nicht in der Luft hängt): einmal beim ersten Zeichnen aus dem Gelände bestimmt –
// Boden direkt darunter: Sockel · Boden 1–3 Kästchen tiefer: Ständer · Decke bis 8 Kästchen höher: Kette ·
// Wand daneben: Wandarm · sonst ein Ständer bis zum nächsten Boden bzw. eine Kette bis zum oberen Rand
function spiegelHalt(s, ohneWand){
  const fest = (c, r) => { const px = c*40 + 20, py = r*40 + 20;
    return solids.some(o => !o.gone && o.type !== 'fake' && o.type !== 'wechsel' && px >= o.x && px < o.x + o.w && py >= o.y && py < o.y + o.h); };
  for(let k = 1; k <= 4; k++) if(fest(s.c, s.r + k)) return {art: k === 1 ? 'sockel' : 'staender', n: k - 1};
  for(let k = 1; k <= 10; k++) if(fest(s.c, s.r - k)) return {art: 'kette', n: k - 1};
  if(!ohneWand && fest(s.c - 1, s.r)) return {art: 'wand', seite: -1};
  if(!ohneWand && fest(s.c + 1, s.r)) return {art: 'wand', seite: 1};
  for(let k = 5; k <= 18; k++) if(fest(s.c, s.r + k)) return {art: 'staender', n: k - 1};
  return {art: 'kette', n: s.r + 4};
}
function spiegelHalterungBild(c, x, y, h){
  const cx = x + 20, cy = y + 20;
  if(!h || h.art === 'sockel' || h.art === 'staender'){
    const unten = y + 40 + (h ? h.n : 0)*40;
    c.strokeStyle = '#4a3214'; c.lineWidth = 5; c.beginPath(); c.moveTo(cx, cy + 18); c.lineTo(cx, unten - 6); c.stroke();
    c.strokeStyle = '#c9963a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(cx, cy + 18); c.lineTo(cx, unten - 6); c.stroke();
    const st = c.createLinearGradient(0, unten - 9, 0, unten); st.addColorStop(0, '#b9a98c'); st.addColorStop(1, '#6d5c46');
    c.fillStyle = st; c.beginPath(); c.moveTo(cx - 12, unten); c.lineTo(cx - 8, unten - 9); c.lineTo(cx + 8, unten - 9); c.lineTo(cx + 12, unten); c.closePath(); c.fill();
    c.strokeStyle = '#3a2c1c'; c.lineWidth = 1.2; c.stroke();
  } else if(h.art === 'kette'){
    const oben = y - h.n*40;
    c.strokeStyle = '#3a2c1c'; c.lineWidth = 1.6;
    for(let yy = cy - 18; yy > oben; yy -= 7){ c.beginPath(); c.ellipse(cx, yy - 3, 2.4, 3.8, 0, 0, Math.PI*2); c.stroke(); }
    c.fillStyle = '#6b4a1e'; c.fillRect(cx - 6, oben, 12, 4);
  } else if(h.art === 'wand'){
    const wx = h.seite < 0 ? x : x + 40;
    c.strokeStyle = '#4a3214'; c.lineWidth = 5; c.beginPath(); c.moveTo(wx, cy); c.lineTo(cx + h.seite*18, cy); c.stroke();
    c.strokeStyle = '#c9963a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(wx, cy); c.lineTo(cx + h.seite*18, cy); c.stroke();
    c.fillStyle = '#6b4a1e'; c.fillRect(wx - (h.seite < 0 ? 0 : 5), cy - 7, 5, 14);
  }
}
function spiegelBild(c, x, y, stellung, dreh, halt, link){
  // Spiegel (Ruinen-Überarbeitung): Halterung (Sockel/Ständer/Kette/Wandarm), Kardanring aus Bronze mit Achse, ovaler
  // Spiegel im Goldrahmen mit hellem Glas, Glanzstreifen und Funkeln; die Schräge zeigt / bzw. \ (Lichtweg)
  const cx = x + 20, cy = y + 20, t = typeof performance !== 'undefined' ? performance.now()*0.001 : 0;
  spiegelHalterungBild(c, x, y, halt);
  c.strokeStyle = '#4a3214'; c.lineWidth = 4.5; c.beginPath(); c.arc(cx, cy, 18, 0, Math.PI*2); c.stroke();
  c.strokeStyle = '#d4a23c'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, 18, 0, Math.PI*2); c.stroke();
  // kleiner Drehpfeil am Ring (man kann ihn drehen) – nicht beim schaltbaren Spiegel (der dreht nur per Platte/Hebel)
  if(!link){ c.strokeStyle = '#fff3c8'; c.lineWidth = 1.6; c.beginPath(); c.arc(cx, cy, 18, -Math.PI*0.95, -Math.PI*0.6); c.stroke(); }
  c.save(); c.translate(cx, cy);
  c.rotate((stellung === '/' ? -Math.PI/4 : Math.PI/4) + (dreh || 0));
  c.fillStyle = '#3a2610'; c.beginPath(); c.ellipse(0, 0, 17, 8, 0, 0, Math.PI*2); c.fill();
  const rg = c.createLinearGradient(0, -8, 0, 8); rg.addColorStop(0, '#ffe08a'); rg.addColorStop(0.5, '#d4a23c'); rg.addColorStop(1, '#8a6020');
  c.fillStyle = rg; c.beginPath(); c.ellipse(0, 0, 15.5, 6.6, 0, 0, Math.PI*2); c.fill();
  const gg = c.createLinearGradient(-12, -5, 12, 5); gg.addColorStop(0, '#ffffff'); gg.addColorStop(0.45, '#cfe9f7'); gg.addColorStop(1, '#7fb3d0');
  c.fillStyle = gg; c.beginPath(); c.ellipse(0, 0, 12.5, 4.4, 0, 0, Math.PI*2); c.fill();
  c.save(); c.beginPath(); c.ellipse(0, 0, 12.5, 4.4, 0, 0, Math.PI*2); c.clip();
  c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(-8, -6, 3, 12); c.fillRect(-3.5, -6, 1.5, 12);
  c.restore();
  c.fillStyle = '#6b4a1e'; for(const ax of [-18, 18]){ c.beginPath(); c.arc(ax, 0, 2.6, 0, Math.PI*2); c.fill(); }
  c.restore();
  const fk = 0.5 + 0.5*Math.sin(t*2.4 + x*0.05);
  if(fk > 0.6){
    const fx = cx + (stellung === '/' ? 5 : -5), fy = cy - 5, r = 4.5*(fk - 0.6)/0.4 + 1.5;
    c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath();
    c.moveTo(fx, fy - r); c.lineTo(fx + r*0.25, fy - r*0.25); c.lineTo(fx + r, fy); c.lineTo(fx + r*0.25, fy + r*0.25);
    c.lineTo(fx, fy + r); c.lineTo(fx - r*0.25, fy + r*0.25); c.lineTo(fx - r, fy); c.lineTo(fx - r*0.25, fy - r*0.25); c.closePath(); c.fill();
  }
  if(link) spiegelNummerBild(c, x, y, link);
}
// schaltbarer Spiegel: Plakette in der Farbe seiner Nummer (wie Tür/Hebel) und ein kleines Kettenglied = „hängt an Platte/Hebel“
function spiegelNummerBild(c, x, y, link){
  const col = typeof linkColor === 'function' ? linkColor(link) : '#d08a2a';
  c.strokeStyle = col; c.lineWidth = 2.2; c.beginPath(); c.arc(x + 20, y + 20, 21, 0, Math.PI*2); c.stroke();   // Ring in der Nummer-Farbe
  c.fillStyle = col; c.beginPath(); c.arc(x + 35, y + 5, 7.5, 0, Math.PI*2); c.fill();
  c.strokeStyle = 'rgba(30,18,6,.85)'; c.lineWidth = 1.4; c.stroke();
  c.fillStyle = '#fff'; c.font = 'bold 9px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(link), x + 35, y + 5.5);
  c.save(); c.translate(x + 5, y + 35); c.rotate(-Math.PI/4);   // Kettenglied (zwei verschränkte Ösen)
  c.strokeStyle = 'rgba(30,18,6,.9)'; c.lineWidth = 3.4;
  c.beginPath(); c.ellipse(-3, 0, 4, 2.4, 0, 0, Math.PI*2); c.stroke(); c.beginPath(); c.ellipse(3, 0, 4, 2.4, 0, 0, Math.PI*2); c.stroke();
  c.strokeStyle = col; c.lineWidth = 1.6;
  c.beginPath(); c.ellipse(-3, 0, 4, 2.4, 0, 0, Math.PI*2); c.stroke(); c.beginPath(); c.ellipse(3, 0, 4, 2.4, 0, 0, Math.PI*2); c.stroke();
  c.restore();
}
function kristallBild(c, x, y, leucht, halt, bleibt, gemerkt){
  // Lichtkristall auf Steinsockel; leuchtet er, glüht er warm mit großem Schein. Halterung wie beim Spiegel
  // (Ständer bis zum Boden oder Kette zur Decke), damit er nicht in der Luft hängt
  const t = typeof performance !== 'undefined' ? performance.now()*0.001 : 0;
  if(halt && halt.art === 'staender'){
    const unten = y + 40 + halt.n*40;
    c.strokeStyle = '#4a3214'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 20, y + 40); c.lineTo(x + 20, unten - 6); c.stroke();
    c.strokeStyle = '#c9963a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x + 20, y + 40); c.lineTo(x + 20, unten - 6); c.stroke();
    c.fillStyle = '#6d5c46'; c.beginPath(); c.moveTo(x + 8, unten); c.lineTo(x + 12, unten - 7); c.lineTo(x + 28, unten - 7); c.lineTo(x + 32, unten); c.closePath(); c.fill();
  } else if(halt && halt.art === 'kette'){
    const oben = y - halt.n*40;
    c.strokeStyle = '#3a2c1c'; c.lineWidth = 1.6;
    for(let yy = y + 2; yy > oben; yy -= 7){ c.beginPath(); c.ellipse(x + 20, yy - 3, 2.4, 3.8, 0, 0, Math.PI*2); c.stroke(); }
    c.fillStyle = '#6b4a1e'; c.fillRect(x + 14, oben, 12, 4);
    c.strokeStyle = '#c9963a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 9, y + 15); c.lineTo(x + 20, y + 1); c.lineTo(x + 31, y + 15); c.stroke();
  }
  const st = c.createLinearGradient(0, y + 30, 0, y + 40); st.addColorStop(0, '#4a3f36'); st.addColorStop(1, '#231c17');
  c.fillStyle = st; c.beginPath(); c.moveTo(x + 7, y + 40); c.lineTo(x + 10, y + 31); c.lineTo(x + 30, y + 31); c.lineTo(x + 33, y + 40); c.closePath(); c.fill();
  c.strokeStyle = '#c9963a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 10, y + 33); c.lineTo(x + 30, y + 33); c.stroke();
  if(leucht > 0){
    const g = c.createRadialGradient(x + 20, y + 17, 2, x + 20, y + 17, 40);
    g.addColorStop(0, `rgba(255,245,190,${0.85*leucht})`); g.addColorStop(0.4, `rgba(255,200,80,${0.35*leucht})`); g.addColorStop(1, 'rgba(255,190,70,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x + 20, y + 17, 40, 0, Math.PI*2); c.fill();
  }
  const kg = c.createLinearGradient(x + 9, y + 2, x + 31, y + 33);
  if(leucht > 0.5){ kg.addColorStop(0, '#ffffff'); kg.addColorStop(0.5, '#ffe98a'); kg.addColorStop(1, '#ffae2e'); }
  else { kg.addColorStop(0, '#d8f4fb'); kg.addColorStop(0.5, '#7cc6dc'); kg.addColorStop(1, '#3a7f98'); }
  c.fillStyle = kg;
  c.beginPath(); c.moveTo(x + 20, y + 1); c.lineTo(x + 31, y + 15); c.lineTo(x + 26, y + 32); c.lineTo(x + 14, y + 32); c.lineTo(x + 9, y + 15); c.closePath(); c.fill();
  c.strokeStyle = leucht > 0.5 ? '#a8681a' : '#20495a'; c.lineWidth = 1.8; c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 20, y + 1); c.lineTo(x + 20, y + 32); c.moveTo(x + 9, y + 15); c.lineTo(x + 31, y + 15); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.moveTo(x + 20, y + 3); c.lineTo(x + 25, y + 14); c.lineTo(x + 20, y + 14); c.closePath(); c.fill();
  if(leucht <= 0.5){ c.globalAlpha = 0.5 + 0.5*Math.sin(t*2); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 15, y + 12, 1.4, 0, Math.PI*2); c.fill(); c.globalAlpha = 1; }
  if(bleibt){   // „bleibt an“: Goldring um den Sockel, eingerastet = Ring leuchtet
    c.strokeStyle = gemerkt ? '#ffe58a' : '#9a7a3a'; c.lineWidth = gemerkt ? 2.6 : 1.8;
    c.beginPath(); c.ellipse(x + 20, y + 33, 15, 4, 0, 0, Math.PI*2); c.stroke();
  }
}
// Strahl mit echtem Glow: mehrere Schichten im Modus „lighter“ (Licht addiert sich), wandernde helle Wellen, Funken,
// Aufblitzen an Spiegeln, am Kristall und dort, wo der Strahl auf Stein trifft
function lichtStrahlPfad(weg){
  ctx.beginPath(); ctx.moveTo(weg[0][0]*40 + 20 - camX, weg[0][1]*40 + 20);
  for(let i = 1; i < weg.length; i++) ctx.lineTo(weg[i][0]*40 + 20 - camX, weg[i][1]*40 + 20);
}
function lichtFleck(x, y, r, a){
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,250,220,${a})`); g.addColorStop(0.35, `rgba(255,210,100,${a*0.5})`); g.addColorStop(1, 'rgba(255,180,60,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
}
// Sackgasse: Endet der Strahl an Stein, einer Tür, einem Wechselboden oder einer Falle, sprüht dort ein Funkenregen
// zurück und ein Glutfleck glimmt an der Wand – man sieht sofort „hier geht's nicht weiter“ (nur Anzeige, aus der Zeit
// berechnet, kein Spielzustand)
function lichtSackgasse(p, E, t){
  const x = p[0]*40 + 20 - camX + E.dx*2, y = p[1]*40 + 20 + E.dy*2;
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(70,24,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y, E.dx ? 5 : 13, E.dy ? 5 : 13, 0, 0, Math.PI*2); ctx.fill();   // Brandfleck
  const g = ctx.createRadialGradient(x, y, 0, x, y, 18);
  g.addColorStop(0, 'rgba(255,255,230,.95)'); g.addColorStop(0.35, 'rgba(255,140,40,.7)'); g.addColorStop(1, 'rgba(255,80,20,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, E.dx ? 8 : 18, E.dy ? 8 : 18, 0, 0, Math.PI*2); ctx.fill();
  const zur = Math.atan2(-E.dy, -E.dx);   // Funken fliegen zurück, gefächert, mit etwas Schwerkraft
  for(let i = 0; i < 14; i++){
    const ph = (t*1.7 + i*0.137) % 1, a = zur + (((i*0.618) % 1) - 0.5)*2.4, v = 30 + (i % 3)*12;
    const fx = x + Math.cos(a)*v*ph, fy = y + Math.sin(a)*v*ph + 26*ph*ph, r = 2.6*(1 - ph) + 0.8;
    ctx.globalAlpha = 1 - ph*0.8;
    ctx.fillStyle = '#c2410c'; ctx.beginPath(); ctx.arc(fx, fy, r + 1, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = i % 2 ? '#fff6c0' : '#ffc04a'; ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
// Strahl läuft aus dem Bild: am Bildrand ein leuchtender Pfeil in Laufrichtung und ein Zeichen, was ihn draußen erwartet –
// Kristall (er trifft ihn und schaltet) oder Funken-Stern (Sackgasse). So schaltet niemand blind (Sichtbarkeits-Regel).
function lichtRandListe(weg){   // [{x, y, d (-1 links / 1 rechts), art ('kristall'|'wand'|'weit'|null = Ende im Bild)}]
  const E = weg.ende, sx = p => p[0]*40 + 20 - camX, out = [];
  const ende = weg[weg.length - 1], draussen = sx(ende) < 0 || sx(ende) > VW;
  for(let i = 0; i < weg.length - 1; i++){
    const ax = sx(weg[i]), bx = sx(weg[i + 1]);
    const kante = ax >= 0 && bx < 0 ? 0 : ax <= VW && bx > VW ? VW : null;
    if(kante !== null) out.push({x: kante, y: weg[i][1]*40 + 20, d: kante === 0 ? -1 : 1, art: draussen && E ? E.art : null});
  }
  return out;
}
function lichtRandZeichen(weg, t){
  for(const R of lichtRandListe(weg)){
    const y = R.y, d = R.d, x = R.x - d*22, puls = 0.75 + 0.25*Math.sin(t*6);
    lichtFleck(x, y, 26*puls, 0.6);
    ctx.fillStyle = `rgba(255,248,210,${0.85*puls + 0.15})`;
    for(const o of [0, 9]){ ctx.beginPath(); ctx.moveTo(x + d*(6 + o), y); ctx.lineTo(x + d*(o - 2), y - 7); ctx.lineTo(x + d*(o - 2), y + 7); ctx.closePath(); ctx.fill(); }
    if(!R.art || R.art === 'dreh') continue;   // Zeichen, was ihn draußen erwartet
    const ix = x - d*20, iy = y - 22;
    ctx.save(); ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(25,16,8,.7)'; ctx.beginPath(); ctx.arc(ix, iy, 11, 0, Math.PI*2); ctx.fill();
    if(R.art === 'kristall'){
      ctx.fillStyle = '#ffe98a'; ctx.beginPath(); ctx.moveTo(ix, iy - 8); ctx.lineTo(ix + 5, iy - 2); ctx.lineTo(ix + 3, iy + 7); ctx.lineTo(ix - 3, iy + 7); ctx.lineTo(ix - 5, iy - 2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#a8681a'; ctx.lineWidth = 1.2; ctx.stroke();
    } else {
      ctx.strokeStyle = '#ffb04a'; ctx.lineWidth = 2;
      for(let k = 0; k < 8; k++){ const a = k*Math.PI/4, r = k % 2 ? 3.5 : 8; ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ix + Math.cos(a)*r, iy + Math.sin(a)*r); ctx.stroke(); }
      ctx.fillStyle = '#fff2c0'; ctx.beginPath(); ctx.arc(ix, iy, 2.5, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
}
function lichtZeichnen(){
  const t = performance.now()*0.001;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'lighter';
  const puls = 1 + 0.08*Math.sin(t*5);
  for(const weg of lichtWege){
    if(weg.length < 2) continue;
    for(const [breit, farbe] of [[38, 'rgba(255,170,50,.07)'], [24, 'rgba(255,190,70,.12)'], [13, 'rgba(255,215,110,.28)'], [6, 'rgba(255,240,180,.6)'], [2.4, 'rgba(255,255,245,1)']]){
      ctx.strokeStyle = farbe; ctx.lineWidth = breit*(breit > 10 ? puls : 1); lichtStrahlPfad(weg); ctx.stroke();
    }
    // wandernde helle Wellen entlang des Strahls (zeigen die Richtung)
    ctx.setLineDash([10, 46]); ctx.lineDashOffset = -t*90; ctx.strokeStyle = 'rgba(255,255,230,.55)'; ctx.lineWidth = 7;
    lichtStrahlPfad(weg); ctx.stroke(); ctx.setLineDash([]);
    // Funken
    for(let i = 0; i < weg.length - 1; i++){
      const ph = (t*0.8 + i*0.37) % 1, ax = weg[i][0], ay = weg[i][1], bx = weg[i + 1][0], by = weg[i + 1][1];
      const px = (ax + (bx - ax)*ph)*40 + 20 - camX, py = (ay + (by - ay)*ph)*40 + 20, wob = Math.sin(t*7 + i)*4;
      ctx.globalAlpha = Math.sin(ph*Math.PI)*0.9; ctx.fillStyle = '#fff6c8';
      ctx.beginPath(); ctx.arc(px + (ay === by ? 0 : wob), py + (ax === bx ? 0 : wob), 2, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
    }
    // schaltbarer Spiegel dreht gerade: der umgelenkte Strahl schwenkt mit (Spiegel dreht 90°, der Strahl 180°)
    const E = weg.ende;
    if(E && E.art === 'dreh'){
      const sp = E.sp, p = 1 - sp.drehS/SPIEGEL_DREH_SCHRITTE, [ox, oy] = lichtUmlenken(sp.stellung, E.dx, E.dy);
      const a = Math.atan2(oy, ox) + (sp.stellung === '/' ? 1 : -1)*p*Math.PI, L = 100;
      const x0 = sp.x + 20 - camX, y0 = sp.y + 20, x1 = x0 + Math.cos(a)*L, y1 = y0 + Math.sin(a)*L;
      for(const [breit, farbe] of [[24, 'rgba(255,190,70,.12)'], [10, 'rgba(255,215,110,.3)'], [4, 'rgba(255,240,180,.6)'], [1.8, 'rgba(255,255,245,.9)']]){
        const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, farbe); g.addColorStop(1, 'rgba(255,200,90,0)');
        ctx.strokeStyle = g; ctx.lineWidth = breit; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }
    }
    // Aufblitzen an den Knickstellen (Spiegel) und am Ende (Stein oder Kristall)
    for(let i = 1; i < weg.length; i++){
      const x = weg[i][0]*40 + 20 - camX, y = weg[i][1]*40 + 20;
      if(i === weg.length - 1) lichtFleck(x, y, 30*puls, 0.75);
      else lichtFleck(x, y, 24*puls, 0.55);
    }
    if(E && (E.art === 'wand' || E.art === 'weit')) lichtSackgasse(weg[weg.length - 1], E, t);
  }
  for(const weg of lichtWege) if(weg.length > 1) lichtRandZeichen(weg, t);
  ctx.restore();
  for(const q of lichtquellen){ const x = q.x - camX; if(x > -60 && x < VW + 60) lichtQuelleBild(ctx, x, q.y, q.dx, q.dy, lichtQuelleAn(q), q.link); }
  for(const s of spiegelListe){
    const x = s.x - camX; if(x < -60 || x > VW + 60) continue;
    if(!s.halt) s.halt = spiegelHalt(s);   // nur Anzeige (Gelände ändert sich dafür nicht)
    const dreh = s.drehS > 0 ? (s.stellung === '/' ? 1 : -1)*(1 - s.drehS/SPIEGEL_DREH_SCHRITTE)*Math.PI/2   // per Platte/Hebel
               : s.drehT > 0 ? (s.stellung === '/' ? 1 : -1)*(s.drehT/12)*Math.PI/2 : 0;                     // von Hand
    spiegelBild(ctx, x, s.y, s.stellung, dreh, s.halt, s.link);
  }
  for(const k of kristalle){
    const x = k.x - camX; if(x < -60 || x > VW + 60) continue;
    if(!k.halt) k.halt = spiegelHalt(k, true);   // nur Anzeige
    kristallBild(ctx, x, k.y, k.leuchtT || 0, k.halt, k.bleibt, k.gemerkt);
  }
}
// Lichter in dunklen Leveln (10a drawThemeDarkness): Sonnensteine und Strahl leuchten die Dunkelheit aus
function lichtLichter(L){
  for(const q of lichtquellen) if(lichtQuelleAn(q)) L.push([q.x + 20, q.y + 20, 90]);
  for(const weg of lichtWege) for(let i = 0; i < weg.length - 1; i++){
    const [ax, ay] = weg[i], [bx, by] = weg[i + 1], n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay)/2));
    for(let k = 0; k <= n; k++) L.push([(ax + (bx - ax)*k/n)*40 + 20, (ay + (by - ay)*k/n)*40 + 20, 70]);
  }
  for(const k of kristalle) if(k.an || k.gemerkt) L.push([k.x + 20, k.y + 18, 110]);
}
ELEMENT_SOLID_TYPEN.add('lichtquelle');
// (Editor) Strahl-Vorschau über dem Raster: blockiert von festen Kästchen (nicht Steg/Schein/Aufwind), Spiegel/Kristalle
function lichtEditorVorschau(ctx, liste, TILE){
  const fest = (c, r) => { const t = typeof tiles !== 'undefined' ? tiles[c + ',' + r] : null; return !!t && !['oneway', 'fake', 'wind'].includes(t); };
  const pk = typeof elementPunkte !== 'undefined' ? elementPunkte : {};
  const sp = new Map((pk.spiegel || []).map(s => [s.c + ',' + s.r, {stellung: s.stellung || '/'}]));
  const kr = new Map((pk.kristalle || []).map(k => [k.c + ',' + k.r, k]));
  const falle = new Set((pk.traps || []).map(f => f.c + ',' + f.r)), quellen = new Set(liste.map(q => q.c + ',' + q.r));
  ctx.save(); ctx.strokeStyle = 'rgba(255,215,60,.85)'; ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
  for(const q of liste){
    const [dx, dy] = LICHT_RICHTUNG[q.richtung] || [1, 0];
    const v = lichtVerfolgen(q.c, q.r, dx, dy, (c, r) => fest(c, r) || falle.has(c + ',' + r) || quellen.has(c + ',' + r), (c, r) => sp.get(c + ',' + r), (c, r) => kr.get(c + ',' + r));
    ctx.beginPath(); ctx.moveTo(v.weg[0][0]*TILE + TILE/2, v.weg[0][1]*TILE + TILE/2);
    for(const [c, r] of v.weg.slice(1)) ctx.lineTo(c*TILE + TILE/2, r*TILE + TILE/2);
    ctx.stroke();
  }
  ctx.restore();
}
elementRegistrieren({
  id: 'lichtquelle', name: 'Lichtquelle', feld: 'lichtquellen',
  editor: {
    werkzeug: 'lichtquelle', gruppe: 'licht', vor: '#linkSelect', art: 'punkt', ziehbar: false, farbe: '#ffd24a',
    titel: 'Lichtquelle (Sonnen-Stein, fest): schickt einen Lichtstrahl in die gewählte Richtung. Spiegel lenken ihn um, ' +
           'ein Lichtkristall schaltet seine Nummer an, solange Licht darauf fällt. Gelbe Linie = Strahl. Klick = Richtung drehen',
    optionen: [{key: 'richtung', label: 'Richtung', werte: [['r', '→ rechts'], ['l', '← links'], ['o', '↑ hoch'], ['u', '↓ runter']]},
               {key: 'schalter', label: 'an/aus', titel: 'Immer an – oder nur, solange die gewählte Verknüpfungs-Nummer an ist (Hebel/Druckplatte)',
                werte: [['immer', 'immer an'], ['nummer', 'nur per Nummer']]}],
    neu(p){ const o = {c: p.c, r: p.r, richtung: p.richtung, schalter: p.schalter}; if(p.schalter === 'nummer') o.link = Number(linkSelect.value); return o; },
    nummerAktiv: p => p.schalter === 'nummer' && !!p.link,
    mitNummer: false, nummerName: 'Sonnenstein an',
    klick(p){ const o = ['r', 'u', 'l', 'o']; p.richtung = o[(o.indexOf(p.richtung || 'r') + 1) % 4]; },
    zeichnen(ctx, c, r, TILE, p){ const [dx, dy] = LICHT_RICHTUNG[p.richtung] || [1, 0]; ctx.save(); ctx.translate(c*TILE, r*TILE); ctx.scale(TILE/40, TILE/40); lichtQuelleBild(ctx, 0, 0, dx, dy, true, p.schalter === 'nummer' ? p.link : null); ctx.restore(); },
    zeichnenAlle: lichtEditorVorschau,
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, richtung: p.richtung || 'r',
      ...(p.schalter === 'nummer' && p.link ? {link: p.link} : {})})),
  },
  spiel: {
    laden(daten){
      lichtquellen = (daten.lichtquellen || []).map(q => {
        const [dx, dy] = LICHT_RICHTUNG[q.richtung] || [1, 0];
        solids.push({x: q.x, y: q.y, w: 40, h: 40, type: 'lichtquelle'});
        return {x: q.x, y: q.y, c: Math.round(q.x/40), r: Math.round(q.y/40), dx, dy, link: q.link || null};
      });
      lichtWege = [];
    },
    schritt: lichtSchritt,
    zuruecksetzen: lichtZuruecksetzen,
    zeichnen(){
      if(lichtquellen.length || spiegelListe.length || kristalle.length) lichtZeichnen();
      // Tasten-Blase über dem Spiegel, den die Hebel-Taste gerade drehen würde (Hebel haben Vorrang)
      for(const s of spiegelListe){
        const nah = P => !!P && !hebelInReichweite(P) && spiegelInReichweite(P) === s;
        if(nah(p1) || nah(p2)) aktionsHinweis(Math.round(s.x + 20 - camX), s.y - 34, nah(p1), nah(p2));
      }
    },
  },
});
elementRegistrieren({
  id: 'spiegel', name: 'Spiegel', feld: 'spiegel',
  editor: {
    werkzeug: 'spiegel', gruppe: 'licht', vor: '#linkSelect', art: 'punkt', ziehbar: false, farbe: '#bfe0f0',
    titel: 'Spiegel: lenkt den Lichtstrahl um 90° ( / oder \\ ). Im Spiel drehen ihn beide Figuren mit der Hebel-Taste. ' +
           '„per Nummer“: dreht sich nur, wenn jemand eine Druckplatte dieser Nummer betritt oder ihren Hebel umlegt (von Hand gesperrt). ' +
           'Klick auf einen vorhandenen Spiegel = Stellung wechseln',
    optionen: [{key: 'stellung', label: 'Stellung', werte: [['/', '/'], ['\\', '\\']]},
               {key: 'schalter', label: 'drehen', titel: 'Von Hand (Hebel-Taste daneben) – oder nur per Druckplatte/Hebel der gewählten Verknüpfungs-Nummer',
                werte: [['hand', 'von Hand'], ['nummer', 'per Nummer']]}],
    neu(p){ const o = {c: p.c, r: p.r, stellung: p.stellung, schalter: p.schalter}; if(p.schalter === 'nummer') o.link = Number(linkSelect.value); return o; },
    nummerAktiv: p => p.schalter === 'nummer' && !!p.link,
    mitNummer: false, nummerName: 'Spiegel dreht',
    klick(p){ p.stellung = p.stellung === '/' ? '\\' : '/'; },
    zeichnen(ctx, c, r, TILE, p){ ctx.save(); ctx.translate(c*TILE, r*TILE); ctx.scale(TILE/40, TILE/40); spiegelBild(ctx, 0, 0, p.stellung || '/', 0, null, p.schalter === 'nummer' ? p.link : null); ctx.restore(); },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, stellung: p.stellung === '\\' ? '\\' : '/',
      ...(p.schalter === 'nummer' && p.link ? {link: p.link} : {})})),
  },
  spiel: {
    laden(daten){
      spiegelListe = (daten.spiegel || []).map(s => ({x: s.x, y: s.y, c: Math.round(s.x/40), r: Math.round(s.y/40),
        stellung: s.stellung === '\\' ? '\\' : '/', start: s.stellung === '\\' ? '\\' : '/', drehT: 0, drehS: 0, wartet: false,
        link: s.link || null}));
    },
  },
});
elementRegistrieren({
  id: 'kristall', name: 'Lichtkristall', feld: 'kristalle',
  editor: {
    werkzeug: 'kristall', gruppe: 'licht', vor: '#linkSelect', art: 'punkt', ziehbar: false, farbe: '#8fd0e0',
    mitNummer: true, nummerName: 'Lichtkristall',
    titel: 'Lichtkristall: solange ein Lichtstrahl darauf fällt, ist seine Verknüpfung AN (wie eine gedrückte Druckplatte). ' +
           '„bleibt an“: einmal getroffen, bleibt er an (bis zum Neustart/Tod)',
    optionen: [{key: 'art', label: 'Kristall', titel: 'solange Licht darauf fällt – oder: einmal getroffen, bleibt er an',
                werte: [['solange', 'solange Licht'], ['bleibt', 'bleibt an']]}],
    zeichnen(ctx, c, r, TILE, p){
      ctx.save(); ctx.translate(c*TILE, r*TILE); ctx.scale(TILE/40, TILE/40); kristallBild(ctx, 0, 0, 0, null, p.art === 'bleibt', false); ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.strokeText(String(p.link), c*TILE + TILE - 8, r*TILE + 9); ctx.fillText(String(p.link), c*TILE + TILE - 8, r*TILE + 9);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, link: p.link, ...(p.art === 'bleibt' ? {bleibt: true} : {})})),
  },
  spiel: {
    laden(daten){ kristalle = (daten.kristalle || []).map(k => ({x: k.x, y: k.y, c: Math.round(k.x/40), r: Math.round(k.y/40), link: k.link, bleibt: !!k.bleibt, an: false, gemerkt: false, leuchtT: 0})); },
  },
});

// ==== lava
// elemente/lava.js – Elemente „Lava“ und „Lava-Marke“ (Ausbau 7, Welt Vulkan; Punkt-Elemente, siehe 00-register.js).
// Lava: glühende Kästchen (mit der Maus malbar). Zusammenhängende Kästchen bilden ein Becken; wer hineinfällt, ist tot.
//   Lava ist flüssig: die Oberfläche ist überall im Becken gleich hoch, Steine davor verdecken sie.
// Lava-Marke: über oder in ein Becken setzen. Ist sie aktiv, steigt (bzw. sinkt, wenn die Marke tiefer liegt) die Lava
//   in den Spalten des Beckens weich bis zur Oberkante der Marke (Tempo langsam / mittel / schnell, LAVA_TEMPO in 02-physik-werte.js):
//   - „per Nummer“: solange die Verknüpfung AN ist (Hebel = bleibt, Druckplatte = nur solange jemand draufsteht);
//     AUS = die Lava sinkt zurück auf den gemalten Stand.
//   - „sobald beide da sind“: sobald BEIDE Figuren das Becken erreicht haben (linker Rand), steigt die Lava (Lava-Flucht)
//     und sinkt erst nach dem Tod / Neustart wieder. (Nur eine Figur genügt nicht – sonst sperrt die Lava den
//     Nachzügler aus.)
//   Vorher sichtbar: gestrichelte Glut-Linie in Markenhöhe; beim Losgehen grollt es.
// Rolle: der Affe klettert per Wandsprung/Seil voraus und zieht oben den Hebel, das Schweinchen steigt im Aufwind und
// hält Druckplatten, die die Lava unten halten.
// Spiel-Daten: lava [{x, y, w, h}] (Rechtecke), lavaPegel [{x, y (Oberkante), tempo, start: 'nummer'|'naehe', link?}]
let lavaBecken = [];   // {spalten: Map(spaltenX -> unterkante), minX, maxX, top, surf, ziel, marken: [], bewegt}
// Becken aus den Lava-Rechtecken bilden (zusammenhängende Kästchen)
function lavaBeckenBilden(rects){
  const zellen = new Map();
  for(const r of rects) for(let x = r.x; x < r.x + r.w; x += 40) for(let y = r.y; y < r.y + r.h; y += 40) zellen.set(x + ',' + y, [x, y]);
  const gesehen = new Set(), becken = [];
  for(const [k, start] of zellen){
    if(gesehen.has(k)) continue;
    const stapel = [start], z = []; gesehen.add(k);
    while(stapel.length){
      const [x, y] = stapel.pop(); z.push([x, y]);
      for(const [dx, dy] of [[40, 0], [-40, 0], [0, 40], [0, -40]]){
        const nk = (x + dx) + ',' + (y + dy);
        if(zellen.has(nk) && !gesehen.has(nk)){ gesehen.add(nk); stapel.push(zellen.get(nk)); }
      }
    }
    const spalten = new Map();
    let top = Infinity, minX = Infinity, maxX = -Infinity;
    for(const [x, y] of z){
      spalten.set(x, Math.max(spalten.get(x) || -Infinity, y + 40));
      top = Math.min(top, y); minX = Math.min(minX, x); maxX = Math.max(maxX, x + 40);
    }
    becken.push({spalten, minX, maxX, top, surf: top, ziel: top, marken: [], bewegt: false});
  }
  return becken.sort((a, b) => a.minX - b.minX);
}
// liegt der Punkt in Lava?
function inLava(x, y){
  for(const b of lavaBecken){
    if(x < b.minX || x >= b.maxX || y < b.surf) continue;
    const unten = b.spalten.get(Math.floor(x/40)*40);
    if(unten !== undefined && y < unten) return true;
  }
  return false;
}
function lavaSchritt(players){
  for(const b of lavaBecken){
    // aktive Marken: die höchste gilt; eine Marke UNTER dem gemalten Stand lässt die Lava sinken (z. B. Druckplatte)
    let ziel = Infinity;
    for(const m of b.marken){
      if(m.start === 'naehe'){
        // erst, wenn BEIDE Figuren das Becken erreicht haben (sonst sperrt die Lava den Nachzügler aus)
        if(!m.ausgeloest && players.every(pl => !pl || pl.x >= b.minX - 4)) m.ausgeloest = true;
        if(m.ausgeloest) ziel = Math.min(ziel, m.y);
      } else if(m.link && linkOn[m.link]) ziel = Math.min(ziel, m.y);
    }
    if(ziel === Infinity) ziel = b.top;
    const marke = b.marken.find(m => m.y === ziel);
    const tempo = marke ? (LAVA_TEMPO[marke.tempo] || LAVA_TEMPO.mittel) : LAVA_TEMPO.mittel;
    b.ziel = ziel;
    if(b.surf !== ziel){
      if(!b.bewegt && ziel < b.surf && b.maxX > camX - 200 && b.minX < camX + VW + 200) SFX.lavaSteigt((b.minX + b.maxX)/2);
      b.bewegt = true;
      const d = ziel - b.surf;
      b.surf += Math.abs(d) <= tempo ? d : Math.sign(d)*tempo;
    } else b.bewegt = false;
  }
  // wer mit den Füßen in der Lava steckt, verbrennt (etwas gnädig: Mitte der Figur, ein paar Pixel unter der Oberfläche)
  for(const pl of players){
    if(!pl || deathState) continue;
    for(const dx of [-pl.w*0.3, 0, pl.w*0.3]) if(inLava(pl.x + dx, pl.y - LAVA_GNADE)){ SFX.lavaZisch(pl.x); die(pl); return; }
  }
  // leises Blubbern, wenn Lava im Bild ist (ab und zu)
  if(lavaBecken.length && Math.random() < 0.012){
    const b = lavaBecken.find(b => b.maxX > camX && b.minX < camX + VW);
    if(b) SFX.lavaBlubb(camX + VW/2 + (Math.random() - 0.5)*VW*0.6);
  }
}
function lavaZuruecksetzen(){
  for(const b of lavaBecken){ b.surf = b.top; b.ziel = b.top; b.bewegt = false; for(const m of b.marken) m.ausgeloest = false; }
}
// Lichter für dunkle Level: die Lava leuchtet
function lavaLichter(L){
  for(const b of lavaBecken){
    if(b.maxX < camX - 200 || b.minX > camX + VW + 200) continue;
    for(const [x] of b.spalten) if((x/40) % 2 === 0) L.push([x + 20, b.surf + 10, 120]);
  }
}
// Lava-Bild einer Spalte (auch für den Editor): x, y (Oberfläche), w, h, t (Sekunden)
function lavaSpalteZeichnen(c, x, y, w, h, t, oben){
  if(h <= 0) return;
  const g = c.createLinearGradient(0, y, 0, y + Math.min(h, 160));
  g.addColorStop(0, '#ffe27a'); g.addColorStop(0.12, '#ff9a2a'); g.addColorStop(0.5, '#e2481a'); g.addColorStop(1, '#8a1e10');
  c.fillStyle = g; c.fillRect(x, y, w, h);
  if(!oben) return;
  // welliger heller Rand oben + Blasen
  c.fillStyle = '#fff2b0';
  c.beginPath(); c.moveTo(x, y + 3);
  for(let k = 0; k <= 4; k++) c.lineTo(x + w*k/4, y + 1.5 + Math.sin(t*3 + (x + w*k/4)*0.05)*2);
  c.lineTo(x + w, y + 5); c.lineTo(x, y + 5); c.fill();
  // Blasen an der Oberfläche: wölben sich auf, platzen und spritzen kleine Tropfen
  const hx = Math.abs(Math.sin(x*12.9898)*43758.5453) % 1;
  if(hx > 0.35){
    const q = (((t*0.34 + hx*3.1) % 1) + 1) % 1, bx = x + w*(0.3 + 0.4*hx), r0 = 3 + hx*3;
    if(q < 0.55){
      const k = q/0.55, rr = r0*(0.35 + 0.65*k);
      c.fillStyle = 'rgba(255,196,96,' + (0.55 + 0.25*k) + ')'; c.beginPath(); c.arc(bx, y + 1, rr, Math.PI, Math.PI*2); c.fill();
      c.strokeStyle = 'rgba(255,244,190,.85)'; c.lineWidth = 1.2; c.beginPath(); c.arc(bx, y + 1, rr, Math.PI, Math.PI*2); c.stroke();
      c.fillStyle = 'rgba(255,255,230,.8)'; c.beginPath(); c.arc(bx - rr*0.35, y + 1 - rr*0.55, Math.max(.6, rr*0.18), 0, Math.PI*2); c.fill();
    } else {
      const k = (q - 0.55)/0.45;
      for(let i = 0; i < 4; i++){ const vx = (i - 1.5)*5.5, hh = 16 + (i % 2)*9, px = bx + vx*k, py = y - hh*4*k*(1 - k) + 1; const al = 1 - k*0.6;
        c.fillStyle = 'rgba(255,' + (150 + i*22) + ',60,' + al + ')'; c.beginPath(); c.arc(px, py, 1.9 - k*0.7, 0, Math.PI*2); c.fill(); }
      c.strokeStyle = 'rgba(255,226,150,' + (0.7*(1 - k*2 > 0 ? 1 - k*2 : 0)) + ')'; c.lineWidth = 1.2; c.beginPath(); c.arc(bx, y + 1, r0*(1 + k*0.9), Math.PI*1.1, Math.PI*1.9); c.stroke();   // Ring, der sich auflöst
    }
  }
}
// Hitzeflimmern: das schon gezeichnete Bild über der Lava wird in dünnen Streifen leicht seitlich verschoben (wie die Luft über Glut)
function lavaFlimmern(x, y, w, hoehe, t){
  const m = ctx.getTransform(), cv2 = ctx.canvas, n = Math.max(4, Math.round(hoehe/4));
  const px = m.a*x + m.e, pw = m.a*w, sh = hoehe/n;
  for(let i = 0; i < n; i++){
    const yy = y - hoehe + i*sh, k = i/n, py = m.d*yy + m.f;
    if(px < 0 || px + pw > cv2.width || py < 0 || py + m.d*sh > cv2.height) continue;
    const dx = Math.sin(t*1.3 + i*0.7 + x*0.01)*1.6*(0.3 + k);
    ctx.drawImage(cv2, px, py, pw, m.d*sh, x + dx, yy, w, sh);
  }
}
function lavaZeichnen(){
  const t = performance.now()*0.001;
  for(const b of lavaBecken){
    if(b.maxX < camX - 40 || b.minX > camX + VW + 40) continue;
    // Glut-Schein über der Oberfläche
    const sg = ctx.createLinearGradient(0, b.surf - 70, 0, b.surf);
    sg.addColorStop(0, 'rgba(255,120,40,0)'); sg.addColorStop(1, 'rgba(255,120,40,0.28)');
    ctx.fillStyle = sg; ctx.fillRect(b.minX - camX, b.surf - 70, b.maxX - b.minX, 70);
    for(const [x, unten] of b.spalten) lavaSpalteZeichnen(ctx, x - camX, b.surf, 40, unten - b.surf, t, true);
    lavaFlimmern(b.minX - camX, b.surf - 2, b.maxX - b.minX, 56, t);
    // heißer Regen (Vulkan, Wetter „regen“): Dampf steigt von der Lava auf (nur Bild)
    if(typeof weather !== 'undefined' && weather.rain > 0.05){
      for(const [x] of b.spalten){
        const ph = (t*0.5 + x*0.0071) % 1;
        ctx.fillStyle = 'rgba(235,230,225,' + (0.32*weather.rain*(1 - ph)) + ')';
        ctx.beginPath(); ctx.arc(x - camX + 20 + Math.sin(t + x)*6, b.surf - 6 - ph*70, 8 + ph*14, 0, Math.PI*2); ctx.fill();
      }
    }
  }
}
// gestrichelte Glut-Linie: bis hierhin steigt die Lava (Farbe der Nummer bzw. orange bei „sobald beide da sind“)
function lavaMarkenZeichnen(){ return;   // gestrichelte Steige-Linie entfernt
  for(const b of lavaBecken) for(const m of b.marken){
    if(b.maxX < camX || b.minX > camX + VW || Math.abs(b.surf - m.y) < 1) continue;
    ctx.save(); ctx.setLineDash([10, 7]); ctx.lineDashOffset = -performance.now()*0.03;
    ctx.strokeStyle = m.link ? linkColor(m.link) : '#ff8a2a'; ctx.globalAlpha = 0.6; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(b.minX - camX, m.y); ctx.lineTo(b.maxX - camX, m.y); ctx.stroke(); ctx.restore();
  }
}
elementRegistrieren({
  id: 'lava', name: 'Lava', feld: 'lava',
  editor: {
    werkzeug: 'lava', gruppe: 'gefahren', art: 'punkt', ziehbar: true, farbe: '#ff6a1f',
    titel: 'Lava: tödliche, glühende Kästchen (mit gedrückter Maus malen). Zusammenhängende Kästchen = ein Becken; ' +
           'mit einer Lava-Marke darüber steigt die Lava',
    zeichnen(ctx, c, r, TILE){ lavaSpalteZeichnen(ctx, c*TILE, r*TILE, TILE, TILE, 0, true); },
    exportieren: (liste, TILE, mergeRects) => mergeRects(liste).map(r => ({x: r.x, y: r.y, w: r.w, h: r.h})),
  },
  spiel: {
    laden(daten){ lavaBecken = lavaBeckenBilden(daten.lava || []); },
    schritt: lavaSchritt,
    zuruecksetzen: lavaZuruecksetzen,
    zeichnenHinten(){ if(lavaBecken.length) lavaZeichnen(); },
  },
});
elementRegistrieren({
  id: 'lavapegel', name: 'Lava-Marke', feld: 'lavaPegel',
  editor: {
    werkzeug: 'lavapegel', gruppe: 'gefahren', art: 'punkt', ziehbar: false, farbe: '#ffb03a',
    titel: 'Lava-Marke: über/in ein Lava-Becken setzen. Ist sie aktiv, steigt die Lava bis zur Oberkante dieses Kästchens. ' +
           '„per Nummer“: solange die Verknüpfung an ist (Hebel bleibt, Druckplatte nur solange jemand draufsteht); ' +
           '„sobald beide da sind“: steigt, sobald beide Figuren das Becken erreicht haben (Lava-Flucht)',
    optionen: [
      {key: 'start', label: 'Start', werte: [['nummer', 'per Nummer'], ['naehe', 'sobald beide da sind']]},
      {key: 'tempo', label: 'Tempo', werte: [['langsam', 'langsam'], ['mittel', 'mittel'], ['schnell', 'schnell']]},
    ],
    neu(p){
      const o = {c: p.c, r: p.r, start: p.start || 'nummer', tempo: p.tempo || 'mittel'};
      if(o.start === 'nummer') o.link = Number(linkSelect.value);
      return o;
    },
    nummerAktiv: p => p.start !== 'naehe' && !!p.link,
    mitNummer: false, nummerName: 'Lava steigt',
    zeichnen(ctx, c, r, TILE, p){
      const X = c*TILE, Y = r*TILE;
      ctx.strokeStyle = '#ff8a2a'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(X + 2, Y + 2); ctx.lineTo(X + TILE - 2, Y + 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#ff6a1f'; ctx.beginPath(); ctx.moveTo(X + 8, Y + 24); ctx.lineTo(X + 15, Y + 10); ctx.lineTo(X + 22, Y + 24); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tx = (p && p.start === 'naehe' ? '!' : String(p && p.link || '')) + ({langsam: '·', mittel: '»', schnell: '»»'}[p && p.tempo] || '');
      ctx.fillText(tx, X + 30, Y + 18);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE, tempo: p.tempo || 'mittel',
      start: p.start === 'naehe' ? 'naehe' : 'nummer', ...(p.start !== 'naehe' && p.link ? {link: p.link} : {})})),
  },
  spiel: {
    laden(daten){
      for(const p of (daten.lavaPegel || [])){
        // Becken, das an dieser Spalte liegt (bei mehreren das senkrecht nächste unter/an der Marke)
        let best = null, bd = Infinity;
        for(const b of lavaBecken){
          if(p.x < b.minX || p.x >= b.maxX) continue;
          const d = Math.abs(b.top - p.y);
          if(d < bd){ bd = d; best = b; }
        }
        if(best) best.marken.push({x: p.x, y: p.y, link: p.link || null, tempo: p.tempo || 'mittel', start: p.start === 'naehe' ? 'naehe' : 'nummer', ausgeloest: false});
      }
    },
    zeichnenVorne(){ lavaMarkenZeichnen(); },
  },
});

// ==== presse
// elemente/presse.js – Element „Stachelpresse“ (Ausbau 7, Welt Vulkan; Punkt-Element, siehe 00-register.js).
// Schwerer Eisenblock (1–3 Kästchen breit) mit Stacheln unten, an einer Kette. Im festen TAKT: oben warten – kurz vorher
// zittert die Kette und Staub rieselt (Vorwarnung, PRESSE_WARN) – dann kracht der Block schnell herunter bis auf den
// ersten festen Boden darunter, bleibt kurz liegen und wird langsam wieder hochgezogen. Wer den Block berührt, ist tot.
// Versatz verschiebt den Takt (Wellen aus mehreren Pressen). Optional per Nummer:
//   „hält bei Nummer an“ – solange die Verknüpfung AN ist, bleibt die Presse oben (läuft sie gerade, fährt sie erst hoch);
//   „läuft nur bei Nummer“ – nur solange die Verknüpfung AN ist, stampft sie.
// Jede Presse hat ihre eigene Takt-Uhr (Schritte seit Levelstart/Neustart/Tod) – gleicher Rhythmus nach jedem Neustart.
// Rolle: der Affe hängt am Haken über der Presse und wartet den Takt ab, das Schweinchen gleitet zwischen zwei Schlägen
// hindurch; oft hält einer per Hebel/Platte die Pressen für den anderen an.
// Spiel-Daten: pressen [{x, y (linke obere Ecke oben), breite (Kästchen), takt (s), versatz (0…1), schalter, link?}]
let pressen = [];   // {x, y0, w, hub, takt, versatz, schalter, link, t, y, unten}
const PRESSE_HOEHE = 40, PRESSE_STACHEL = 12;   // Block + Stacheln darunter (px)
function presseTaktSchritte(P){ return Math.max(60, Math.round(P.takt*60)); }
// Lage (0 = oben … 1 = unten) zur Zeit t im Takt
function presseLage(P, t){
  const n = presseTaktSchritte(P), fall = Math.max(4, Math.ceil(P.hub/PRESSE_FALL)), liegen = PRESSE_LIEGEN;
  const hoch = Math.max(10, Math.round(n*0.32)), warten = n - fall - liegen - hoch;
  if(t < warten) return 0;
  if(t < warten + fall) return (t - warten)/fall;
  if(t < warten + fall + liegen) return 1;
  return 1 - (t - warten - fall - liegen)/hoch;
}
function presseWartet(P, t){ const n = presseTaktSchritte(P), fall = Math.max(4, Math.ceil(P.hub/PRESSE_FALL)); return n - fall - PRESSE_LIEGEN - Math.max(10, Math.round(n*0.32)); }
function presseLaeuft(P){
  if(P.schalter === 'stopp') return !(P.link && linkOn[P.link]);
  if(P.schalter === 'an') return !!(P.link && linkOn[P.link]);
  return true;
}
function presseZeit(P){ const n = presseTaktSchritte(P); return (((P.t + Math.round(P.versatz*n)) % n) + n) % n; }
// 0 … 1: Vorwarnung kurz vor dem Fall
function presseWarnung(P){
  if(!presseLaeuft(P)) return 0;
  const rest = presseWartet(P) - presseZeit(P);
  return rest > 0 && rest <= PRESSE_WARN ? 1 - rest/PRESSE_WARN : 0;
}
// Fallhöhe: bis zum ersten festen Kästchen unter dem Block (Stege und Scheinwände zählen nicht)
function presseHub(P){
  const unten = P.y0 + PRESSE_HOEHE + PRESSE_STACHEL;
  let best = LEVEL_H - unten;
  for(const s of solids){
    if(s.type === 'oneway' || s.type === 'fake' || s.type === 'wind' || s === P) continue;
    if(s.x + s.w <= P.x + 2 || s.x >= P.x + P.w - 2 || s.y < unten - 1) continue;
    best = Math.min(best, s.y - unten);
  }
  return Math.max(0, best);
}
function presseBox(P){ return {x: P.x + 3, y: P.y + 2, w: P.w - 6, h: PRESSE_HOEHE + PRESSE_STACHEL - 4}; }
function pressenSchritt(players){
  for(const P of pressen){
    const t0 = presseZeit(P);
    // angehalten: nur bis ganz oben weiterfahren, dann stehen bleiben
    if(presseLaeuft(P) || presseLage(P, t0) > 0) P.t++;
    const t = presseZeit(P), lage = presseLage(P, t);
    P.y = P.y0 + lage*P.hub;
    const sichtbar = P.x + P.w > camX - 40 && P.x < camX + VW + 40;
    if(lage === 1 && !P.unten){ P.unten = true; if(sichtbar) SFX.presseStampf(P.x + P.w/2); }
    if(lage < 1) P.unten = false;
    if(sichtbar && presseLaeuft(P) && presseWartet(P) - t === PRESSE_WARN) SFX.presseKette(P.x + P.w/2);
    const box = presseBox(P);
    for(const pl of players) if(pl && !deathState && rectsOverlap(falleFigurBox(pl), box)){ die(pl); return; }
  }
}
function pressenZuruecksetzen(){ for(const P of pressen){ P.t = 0; P.y = P.y0; P.unten = false; } }
// Bild einer Presse (auch Editor): x, y = linke obere Ecke des Blocks, w = Breite, ketteBis = y des Aufhängepunkts
function presseBild(c, x, y, w, ketteBis, warn, t){
  const zx = warn > 0 ? Math.sin(t*90)*1.5*warn : 0;
  // Kette(n)
  c.strokeStyle = '#4a4246'; c.lineWidth = 3;
  for(const kx of (w > 40 ? [x + 12, x + w - 12] : [x + w/2])){
    for(let yy = ketteBis; yy < y; yy += 10){ c.beginPath(); c.ellipse(kx + zx, yy + 5, 3, 5, 0, 0, Math.PI*2); c.stroke(); }
  }
  x += zx;
  // Block: dunkles Eisen, glühende Kante, Nieten
  const g = c.createLinearGradient(0, y, 0, y + PRESSE_HOEHE);
  g.addColorStop(0, '#5a5258'); g.addColorStop(0.6, '#3a3438'); g.addColorStop(1, '#2a2428');
  c.fillStyle = g; c.fillRect(x, y, w, PRESSE_HOEHE);
  c.fillStyle = 'rgba(255,110,40,.55)'; c.fillRect(x, y + PRESSE_HOEHE - 4, w, 4);
  c.strokeStyle = '#1e1a1c'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, w - 2, PRESSE_HOEHE - 2);
  c.fillStyle = '#8a8288';
  for(let k = x + 8; k < x + w - 4; k += 16){ c.beginPath(); c.arc(k, y + 8, 2.2, 0, Math.PI*2); c.fill(); }
  // Stacheln nach unten
  for(let k = x; k < x + w - 1; k += 10){
    c.fillStyle = '#c8c0c4'; c.beginPath(); c.moveTo(k, y + PRESSE_HOEHE); c.lineTo(k + 10, y + PRESSE_HOEHE); c.lineTo(k + 5, y + PRESSE_HOEHE + PRESSE_STACHEL); c.fill();
    c.fillStyle = 'rgba(200,60,30,.8)'; c.beginPath(); c.moveTo(k + 3.5, y + PRESSE_HOEHE + PRESSE_STACHEL - 4); c.lineTo(k + 6.5, y + PRESSE_HOEHE + PRESSE_STACHEL - 4); c.lineTo(k + 5, y + PRESSE_HOEHE + PRESSE_STACHEL); c.fill();
  }
}
function pressenZeichnen(){
  const t = performance.now()*0.001;
  for(const P of pressen){
    const x = P.x - camX;
    if(x + P.w < -40 || x > VW + 40) continue;
    const warn = presseWarnung(P);
    presseBild(ctx, x, P.y, P.w, P.kette, warn, t);
    // Design-Politur C: Glanzstreifen über den Eisenblock, Funkeln an den Stacheln (gemeinsames Muster, 10b-design-look.js)
    ctx.save(); ctx.beginPath(); ctx.rect(x, P.y, P.w, PRESSE_HOEHE); ctx.clip(); glanzBand(x, P.y, P.w, PRESSE_HOEHE, P.x*0.01); ctx.restore();
    glanzFunkeln(x + 7, P.y + PRESSE_HOEHE + 3, 5, P.x*0.3);
    // Staub rieselt vor dem Fall (nur Bild)
    if(warn > 0){
      ctx.fillStyle = 'rgba(200,180,160,' + (0.6*warn) + ')';
      for(let i = 0; i < 6; i++){ const fx = x + ((i*37 + t*40) % P.w), fy = P.y + PRESSE_HOEHE + ((t*120 + i*29) % 60); ctx.fillRect(fx, fy, 2, 2); }
    }
  }
}
elementRegistrieren({
  id: 'presse', name: 'Stachelpresse', feld: 'pressen',
  editor: {
    werkzeug: 'presse', gruppe: 'gefahren', art: 'punkt', ziehbar: false, farbe: '#5a5258',
    titel: 'Stachelpresse: setzt man an die OBERE Stelle; kracht im Takt herunter bis auf den Boden darunter, bleibt kurz ' +
           'liegen, wird langsam hochgezogen. Warnt vorher (Kette zittert, Staub). Versatz = später im Takt',
    optionen: [
      {key: 'breite', label: 'Breite', zahl: true, werte: [['1', '1'], ['2', '2'], ['3', '3']]},
      {key: 'takt', label: 'Takt', zahl: true, titel: 'alle X Sekunden ein Schlag', werte: [['2', '2 s'], ['2.5', '2,5 s'], ['3', '3 s'], ['4', '4 s']]},
      {key: 'versatz', label: 'Versatz', zahl: true, titel: 'Verschiebung im Takt (für Wellen mehrerer Pressen)',
       werte: [['0', '0'], ['0.25', '¼'], ['0.5', '½'], ['0.75', '¾']]},
      {key: 'schalter', label: 'Nummer', titel: 'immer – oder hält an, solange die Nummer an ist – oder läuft nur, solange sie an ist',
       werte: [['immer', 'ohne'], ['stopp', 'hält bei Nummer an'], ['an', 'läuft nur bei Nummer']]},
    ],
    neu(p){
      const o = {c: p.c, r: p.r, breite: p.breite || 1, takt: p.takt || 3, versatz: p.versatz || 0, schalter: p.schalter || 'immer'};
      if(o.schalter !== 'immer') o.link = Number(linkSelect.value);
      return o;
    },
    nummerAktiv: p => p.schalter !== 'immer' && !!p.link,
    mitNummer: false, nummerName: 'Presse',
    // sichtbar: so breit wie die Presse (1–3 Kästchen)
    bereich: p => Array.from({length: Math.max(1, Math.min(3, Number(p.breite) || 1))}, (_, k) => [p.c + k, p.r]),
    zeichnen(ctx, c, r, TILE, p){
      const b = Math.max(1, Math.min(3, Number(p && p.breite) || 1));
      ctx.save(); ctx.translate(c*TILE, r*TILE); ctx.scale(TILE/40, TILE/40);
      presseBild(ctx, 0, 0, b*40, 0, 0, 0); ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3;
      const txt = String((p && p.takt) || 3).replace('.', ',') + 's' + (p && p.link ? ' ⚡' + p.link : '');
      ctx.strokeText(txt, c*TILE + b*TILE/2, r*TILE + TILE*0.45); ctx.fillText(txt, c*TILE + b*TILE/2, r*TILE + TILE*0.45);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, breite: Math.max(1, Math.min(3, Number(p.breite) || 1)),
      takt: Number(p.takt) || 3, versatz: Number(p.versatz) || 0, schalter: ['stopp', 'an'].includes(p.schalter) ? p.schalter : 'immer',
      ...(['stopp', 'an'].includes(p.schalter) && p.link ? {link: p.link} : {})})),
  },
  spiel: {
    laden(daten){
      pressen = (daten.pressen || []).map(p => ({x: p.x, y0: p.y, y: p.y, w: 40*Math.max(1, Math.min(3, p.breite || 1)),
        takt: Number(p.takt) || 3, versatz: Number(p.versatz) || 0, schalter: ['stopp', 'an'].includes(p.schalter) ? p.schalter : 'immer',
        link: p.link || null, t: 0, hub: 0, unten: false, kette: -140}));
      for(const P of pressen){
        P.hub = presseHub(P);
        // Kette bis zur Decke darüber (oder bis über den Bildrand)
        let k = -140;
        for(const s of solids) if(s.type !== 'oneway' && s.type !== 'fake' && s.x < P.x + P.w && s.x + s.w > P.x && s.y + s.h <= P.y0 + 1) k = Math.max(k, s.y + s.h);
        P.kette = k;
      }
    },
    schritt: pressenSchritt,
    zuruecksetzen: pressenZuruecksetzen,
    zeichnen(){ if(pressen.length) pressenZeichnen(); },
  },
});

// ==== stroemung
// elemente/stroemung.js – Elemente „Strömung“ und „Wasserstand“ (Ausbau 5; Punkt-Elemente, siehe 00-register.js).
// Strömung: Kästchen mit Richtung (→ ← ↑ ↓) und Stärke (schwach / mittel / stark); schiebt Figuren, die im Wasser darin
//   schwimmen (nur im Wasser). Schwach kann man gut gegenan schwimmen, mittel nur knapp, gegen stark kommt man nicht an.
// Wasserstand (Pegel): Marke mit Verknüpfungs-Nummer. Ist die Nummer AN (Hebel = bleibt, Druckplatte = Schleuse, nur
//   solange jemand draufsteht), steigt bzw. sinkt das Wasser des Beckens darunter/darüber weich bis zur Oberkante der
//   Marke; AUS = zurück auf den gemalten Stand. Werte: STROEMUNG_KRAFT, STROEMUNG_EXTRA, WASSER_PEGEL_TEMPO (02-physik-werte.js).
// Rolle: einer legt den Hebel um / hält die Schleuse, der andere schwimmt hindurch; Strömungen trennen oder tragen.
let stroemungen = [];   // {x, y, w, h, dx, dy, staerke}
const STROEMUNG_RICHTUNG = {r: [1, 0], l: [-1, 0], o: [0, -1], u: [0, 1]};
const STROEMUNG_PFEIL = {r: '→', l: '←', o: '↑', u: '↓'};
const STROEMUNG_FARBE = {1: '#7fd6ff', 2: '#3fa9f5', 3: '#1f6fd6'};
// Strömung an der Körpermitte einer Figur auf ihr Tempo anwenden (aus schwimmPhysik)
function stroemungAnwenden(pl){
  const m = {x: pl.x, y: pl.y - pl.h*0.5};
  for(const s of stroemungen){
    if(m.x < s.x || m.x >= s.x + s.w || m.y < s.y || m.y >= s.y + s.h) continue;
    const k = STROEMUNG_KRAFT*s.staerke, max = SWIM_MAX_SPEED + STROEMUNG_EXTRA;
    pl.vx = Math.max(-max, Math.min(max, pl.vx + s.dx*k));
    pl.vy = Math.max(-max, Math.min(max, pl.vy + s.dy*k));
    pl.inStroemung = s;
    return;
  }
  pl.inStroemung = null;
}
// fließende Striche in Strömungsrichtung (nur im Wasser sichtbar)
function stroemungZeichnen(){
  const t = performance.now()*0.001;
  ctx.lineCap = 'round';
  for(const s of stroemungen){
    const x0 = s.x - camX;
    if(x0 + s.w < -20 || x0 > VW + 20) continue;
    const n = Math.max(2, Math.round(s.w*s.h/2600)), lang = 14 + s.staerke*6;
    for(let i = 0; i < n; i++){
      const fx = (i*0.618 + 0.13) % 1, fy = (i*0.381 + 0.29) % 1;
      const ph = (t*(0.35 + s.staerke*0.25) + i*0.17) % 1;
      let px = s.x + fx*s.w, py = s.y + fy*s.h;
      if(s.dx) px = s.x + ((fx + ph*s.dx + 1) % 1)*s.w; else py = s.y + ((fy + ph*s.dy + 1) % 1)*s.h;
      if(!imWasser(px, py)) continue;
      ctx.globalAlpha = 0.35*Math.sin(ph*Math.PI) + 0.1;
      ctx.strokeStyle = '#e8f8ff'; ctx.lineWidth = 1.6 + s.staerke*0.4;
      ctx.beginPath(); ctx.moveTo(px - camX - s.dx*lang, py - s.dy*lang); ctx.lineTo(px - camX, py); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
// Wasserstand je Becken weich zum Ziel bewegen (einmal pro Schritt)
function pegelSchritt(){
  for(const b of wasserBecken){
    if(!b.pegel.length) continue;
    const an = b.pegel.find(p => linkOn[p.link]);
    b.ziel = an ? an.y : b.top;
    if(b.surf !== b.ziel){
      if(!b.bewegt && SFX.pegel && b.maxX > camX && b.minX < camX + VW) SFX.pegel((b.minX + b.maxX)/2, b.ziel < b.surf);
      b.bewegt = true;
      const d = b.ziel - b.surf;
      b.surf += Math.abs(d) <= WASSER_PEGEL_TEMPO ? d : Math.sign(d)*WASSER_PEGEL_TEMPO;
    } else b.bewegt = false;
  }
}
// (Editor) Kästchen gleicher Richtung/Stärke zu Rechtecken zusammenfassen
function stroemungExport(liste, TILE, mergeRects){
  const gruppen = {};
  for(const p of liste){ const k = (p.richtung || 'r') + ',' + (p.staerke || 1); (gruppen[k] = gruppen[k] || []).push(p); }
  const out = [];
  for(const k in gruppen){
    const [richtung, staerke] = k.split(','), [dx, dy] = STROEMUNG_RICHTUNG[richtung] || [1, 0];
    for(const r of wasserSenkrechtZusammen(mergeRects(gruppen[k]))) out.push({...r, dx, dy, staerke: Number(staerke)});
  }
  return out.sort((a, b) => a.y - b.y || a.x - b.x);
}
elementRegistrieren({
  id: 'stroemung', name: 'Strömung', feld: 'currents',
  editor: {
    werkzeug: 'current', gruppe: 'wasser', art: 'punkt', ziehbar: true, farbe: '#3fa9f5',
    titel: 'Strömung: Kästchen im Wasser mit Richtung und Stärke (schwach: man kommt gut gegenan, mittel: knapp, stark: gar nicht). ' +
           'Klick auf ein vorhandenes Kästchen = Richtung drehen',
    optionen: [
      {key: 'richtung', label: 'Richtung', werte: [['r', '→ rechts'], ['l', '← links'], ['o', '↑ hoch'], ['u', '↓ runter']]},
      {key: 'staerke', label: 'Stärke', zahl: true, werte: [['1', 'schwach'], ['2', 'mittel'], ['3', 'stark']]},
    ],
    klick(p){ const o = ['r', 'u', 'l', 'o']; p.richtung = o[(o.indexOf(p.richtung || 'r') + 1) % 4]; },
    zeichnen(ctx, c, r, TILE, p){
      const X = c*TILE + TILE/2, Y = r*TILE + TILE/2;
      ctx.fillStyle = 'rgba(63,169,245,0.18)'; ctx.fillRect(c*TILE + 2, r*TILE + 2, TILE - 4, TILE - 4);
      ctx.fillStyle = STROEMUNG_FARBE[p.staerke] || STROEMUNG_FARBE[1];
      ctx.font = `bold ${14 + (p.staerke || 1)*3}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(STROEMUNG_PFEIL[p.richtung] || '→', X, Y + 1);
    },
    exportieren: stroemungExport,
  },
  spiel: {
    laden(daten){ stroemungen = (daten.currents || []).map(s => ({x: s.x, y: s.y, w: s.w, h: s.h, dx: s.dx || 0, dy: s.dy || 0, staerke: s.staerke || 1})); },
    zeichnenVorne(){ if(stroemungen.length) stroemungZeichnen(); },
  },
});
elementRegistrieren({
  id: 'pegel', name: 'Wasserstand', feld: 'waterLevels',
  editor: {
    werkzeug: 'waterlevel', gruppe: 'wasser', art: 'punkt', ziehbar: false, farbe: '#5ec8e5',
    mitNummer: true, nummerName: 'Wasserstand',
    titel: 'Wasserstand (Schleuse): ins Becken oder darüber setzen. Ist die Verknüpfung AN (Hebel, oder Druckplatte = nur solange ' +
           'jemand draufsteht), steigt/sinkt das Wasser bis zur Oberkante dieses Kästchens; AUS = zurück',
    zeichnen(ctx, c, r, TILE, p){
      const X = c*TILE, Y = r*TILE;
      ctx.strokeStyle = '#5ec8e5'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(X + 2, Y + 2); ctx.lineTo(X + TILE - 2, Y + 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#5ec8e5'; ctx.beginPath(); ctx.moveTo(X + 10, Y + 22); ctx.lineTo(X + 16, Y + 10); ctx.lineTo(X + 22, Y + 22); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(p.link), X + 30, Y + 18);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE, link: p.link})),
  },
  spiel: {
    laden(daten){
      for(const p of (daten.waterLevels || [])){
        // Becken, das an dieser Spalte liegt (bei mehreren das senkrecht nächste)
        let best = null, bd = Infinity;
        for(const b of wasserBecken){
          if(p.x < b.minX || p.x >= b.maxX) continue;
          const d = p.y < b.top ? b.top - p.y : p.y > b.bottom ? p.y - b.bottom : 0;
          if(d < bd){ bd = d; best = b; }
        }
        if(best) best.pegel.push({x: p.x, y: p.y, link: p.link});
      }
    },
    schritt: pegelSchritt,
    // zarte gestrichelte Linie: bis hierhin steigt/sinkt das Wasser, wenn die Nummer an ist (Farbe der Nummer)
    zeichnenVorne(){
      for(const b of wasserBecken) for(const pg of b.pegel){
        if(b.maxX < camX || b.minX > camX + VW || Math.abs(b.surf - pg.y) < 1) continue;
        ctx.save(); ctx.setLineDash([8, 6]); ctx.lineDashOffset = -performance.now()*0.02;
        ctx.strokeStyle = linkColor(pg.link); ctx.globalAlpha = 0.55; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(b.minX - camX, pg.y); ctx.lineTo(b.maxX - camX, pg.y); ctx.stroke(); ctx.restore();
      }
    },
  },
});

// ==== teleporter
// elemente/teleporter.js – Element „Teleporter“ (Ausbau 4; Punkt-Element, siehe 00-register.js).
// Immer zwei gehören zusammen (Paar-Nummer, Farbe). Wer hineinläuft/-springt, kommt sofort beim Partner heraus.
// Regeln (festgelegt in Ausbau 4):
//   - Schwung bleibt erhalten: Tempo und Richtung (seitlich und hoch/runter) sind beim Herauskommen gleich.
//   - Seil: hängt der Affe am Haken, LÖST sich das Seil (der Haken bleibt ja zurück).
//   - Schirm: bleibt offen – das Schweinchen segelt drüben einfach weiter.
//   - Abklingzeit ca. 1 s je Figur, und erst wieder, nachdem man das Tor einmal verlassen hat (kein Hin-und-her-Flackern).
//   - Ausgang zu (Boden/Tür/Wechselboden steckt darin) oder zu weit weg vom Partner (Abstandsgrenze der Kamera):
//     dann passiert nichts – nie in eine Wand oder aus dem Bild teleportieren.
//   - Optional nur für den Affen (blau) oder nur für das Schweinchen (pink), sonst für beide (weiß).
//   - Optional per Verknüpfung (Hebel/Druckplatte): an, solange die Nummer an ist; aus = grau, wirkt nicht.
// Effekt (Funken an beiden Toren) und Sound; die Kamera folgt weich (sie gleitet immer zum Ziel, 09-kamera.js).
// Rolle: Teleporter machen keine Figur überflüssig – „nur Affe/nur Schweinchen“ trennt die Wege, und per Hebel
// muss oft einer das Tor für den anderen anschalten.
// Spiel-Daten: teleporters [{x, y (Fußpunkt = Unterkante des Kästchens), paar, fuer: 'beide'|'affe'|'schwein', link?}]
const TELE_COOL_STEPS = 60;     // Abklingzeit je Figur (1 Spielsekunde)
const TELE_RAND = 8;            // so weit (px) muss die Figur ins Tor-Kästchen hinein, damit es auslöst
const TELE_FARBEN = ['#b07cff', '#3fd0c9', '#ffb84d', '#ff6fa8', '#7ad05a', '#5aa9ff', '#ff7a59', '#e0d050'];
const teleFarbe = paar => TELE_FARBEN[((paar || 1) - 1) % TELE_FARBEN.length];
let teleporters = [];   // {x, y, paar, fuer, link, partner}
function teleAktiv(t){ return !t.link || !!linkOn[t.link]; }
function teleDarf(t, pl){ return t.fuer === 'affe' ? pl.male : t.fuer === 'schwein' ? !pl.male : true; }
function teleDrin(t, pl){   // Figur steckt deutlich im Tor-Kästchen
  return Math.abs(pl.x - t.x) < 20 - TELE_RAND + pl.w/2 && pl.y > t.y - 40 + TELE_RAND && pl.y - pl.h < t.y - TELE_RAND;
}
function teleFx(t, farbe){
  const now = performance.now(), rgb = [1, 3, 5].map(i => parseInt(farbe.slice(i, i + 2), 16)).join(',');
  coinFx.push({type: 'ring', x: t.x, y: t.y - 20, t0: now, rgb});
  for(let k = 0; k < 10; k++){
    const a = k/10*Math.PI*2;
    coinFx.push({type: 'spark', x: t.x, y: t.y - 20, t0: now, vx: Math.cos(a)*2.4, vy: Math.sin(a)*2.4 - 0.6,
                 size: 3 + (k % 3), star: k % 2 === 0, col: [farbe, '#ffffff']});
  }
}
// nach dem Bewegen einer Figur (08-figur-physik-seil.js, über das Register)
function teleNachBewegung(pl){
  if(pl.teleCool > 0) pl.teleCool--;
  const drin = teleporters.find(t => teleDrin(t, pl));
  if(!drin){ pl.teleFrei = true; return; }
  if(pl.teleCool > 0 || pl.teleFrei === false) return;
  const ziel = drin.partner;
  if(!ziel || !teleAktiv(drin) || !teleDarf(drin, pl)) return;
  const andere = pl === p1 ? p2 : p1;
  if(andere && Math.abs(ziel.x - andere.x) > MAX_SEPARATION - 40) return;   // zu weit weg vom Partner
  if(!spotFree(ziel.x, ziel.y - 0.5, pl)) return;                           // Ausgang ist zu
  teleFx(drin, teleFarbe(drin.paar));
  if(pl.hookAttached){ pl.hookAttached = false; pl.ropeFling = true; }        // Seil löst sich, Schwung bleibt
  pl.x = ziel.x; pl.y = ziel.y - 0.5;   // Füße knapp über der Kästchen-Unterkante (steht dort auf Boden, falls vorhanden)
  pl._px = pl.x; pl._py = pl.y;         // nicht quer übers Bild „gezogen“ zeichnen
  pl.grounded = false; pl.standingOn = null;
  pl.teleCool = TELE_COOL_STEPS; pl.teleFrei = false;
  drin.blitz = ziel.blitz = performance.now();
  teleFx(ziel, teleFarbe(drin.paar));
  SFX.teleport(ziel.x);
}
function teleZuruecksetzen(){
  for(const pl of [p1, p2]) if(pl){ pl.teleCool = 0; pl.teleFrei = true; }
}
const TELE_INNEN = {beide: '#ffffff', affe: '#4dabf7', schwein: '#f783ac'};
function teleZeichnen(){
  const tw = performance.now();
  for(const t of teleporters){
    const x = Math.round(t.x - camX);
    if(x < -50 || x > VW + 50) continue;
    const an = teleAktiv(t) && !!t.partner, farbe = an ? teleFarbe(t.paar) : '#8a8f96', cy = t.y - 24;
    // Sockel
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x, t.y - 2, 17, 4, 0, 0, Math.PI*2); ctx.fill();
    // leuchtendes Oval
    ctx.save(); ctx.translate(x, cy);
    if(an){
      const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 25);
      g.addColorStop(0, TELE_INNEN[t.fuer] || '#fff'); g.addColorStop(0.55, farbe); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.7 + 0.15*Math.sin(tw*0.004 + t.paar);
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 17, 23, 0, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
      // wirbelnde Funken
      for(let i = 0; i < 6; i++){
        const a = tw*0.003*(i % 2 ? 1 : -1) + i*Math.PI/3, r = 9 + (i % 3)*3;
        ctx.fillStyle = i % 2 ? '#fff' : (TELE_INNEN[t.fuer] || '#fff');
        ctx.beginPath(); ctx.arc(Math.cos(a)*r*0.75, Math.sin(a)*r, 1.8, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.strokeStyle = farbe; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 17, 23, 0, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, 13, 19, 0, 0, Math.PI*2); ctx.stroke();
    if(t.blitz){ const k = (tw - t.blitz)/350; if(k < 1){ ctx.globalAlpha = 1 - k; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(0, 0, 17 + k*10, 23 + k*12, 0, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; } }
    // Paar-Nummer unten, Figuren-Zeichen (nur Affe / nur Schweinchen) oben
    ctx.fillStyle = farbe; ctx.beginPath(); ctx.arc(0, 21, 6.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(t.paar), 0, 21.5);
    if(t.fuer === 'affe' || t.fuer === 'schwein'){
      ctx.fillStyle = TELE_INNEN[t.fuer]; ctx.beginPath(); ctx.arc(0, -28, 6, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 8px sans-serif'; ctx.fillText(t.fuer === 'affe' ? 'A' : 'S', 0, -27.5);
    }
    ctx.restore();
  }
}
// (Editor) Paar-Nummer für ein neues Tor: wartet ein Tor noch auf seinen Partner, gehört das neue dazu (2. Klick)
function teleNeuesPaar(liste){
  const n = {};
  for(const p of liste) n[p.paar] = (n[p.paar] || 0) + 1;
  const offen = Object.keys(n).map(Number).filter(k => n[k] === 1).sort((a, b) => a - b)[0];
  if(offen) return {paar: offen, partner: liste.find(p => p.paar === offen)};
  let k = 1; while(n[k]) k++;
  return {paar: k, partner: null};
}
elementRegistrieren({
  id: 'teleporter', name: 'Teleporter', feld: 'teleporters',
  editor: {
    werkzeug: 'tele', gruppe: 'bewegung', vor: 'move', art: 'punkt', ziehbar: false, farbe: '#b07cff',
    titel: 'Teleporter: 1. Klick = erstes Tor, 2. Klick = sein Partner (gleiche Farbe/Nummer, Linie zeigt das Paar). ' +
           'Wer hineingeht, kommt beim Partner heraus. „per Verknüpfung“: an, solange die Nummer (Schalter & Logik) an ist',
    optionen: [
      {key: 'fuer', label: 'für', titel: 'Wer den Teleporter benutzen kann',
       werte: [['beide', 'beide'], ['affe', 'nur Affe'], ['schwein', 'nur Schweinchen']]},
      {key: 'schalter', label: 'an/aus', titel: 'Immer an – oder nur an, solange die gewählte Verknüpfungs-Nummer an ist (Hebel/Druckplatte)',
       werte: [['immer', 'immer an'], ['nummer', 'per Verknüpfung']]},
    ],
    // neues Tor: Paar-Nummer automatisch; der Partner übernimmt die Einstellungen des ersten Tors
    neu(p, alle){
      const {paar, partner} = teleNeuesPaar(alle);
      const o = {c: p.c, r: p.r, paar, fuer: p.fuer, schalter: p.schalter};
      if(partner){ o.fuer = partner.fuer; o.schalter = partner.schalter; if(partner.link) o.link = partner.link; }
      else if(p.schalter === 'nummer') o.link = Number(linkSelect.value);
      if(o.schalter !== 'nummer') delete o.link;
      return o;
    },
    // Einfügen (Strg+V): eingefügte Paare bekommen neue, freie Paar-Nummern (sonst gäbe es zwei gleiche Paare)
    einfuegen(neu, liste){
      const belegt = new Set(liste.filter(p => !neu.includes(p)).map(p => p.paar)), map = {};
      let k = 1;
      for(const p of neu){
        if(!(p.paar in map)){ while(belegt.has(k)) k++; map[p.paar] = k; belegt.add(k); }
        p.paar = map[p.paar];
      }
    },
    nummerAktiv: p => p.schalter === 'nummer' && !!p.link,
    mitNummer: false, nummerName: 'Teleporter',
    zeichnen(ctx, c, r, TILE, p){
      const X = c*TILE + TILE/2, Y = r*TILE + TILE/2, f = teleFarbe(p.paar);
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(X, Y, 13, 17, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = f; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(X, Y, 13, 17, 0, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = TELE_INNEN[p.fuer] || '#fff'; ctx.beginPath(); ctx.ellipse(X, Y, 6, 9, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3;
      const txt = String(p.paar) + (p.fuer === 'affe' ? ' A' : p.fuer === 'schwein' ? ' S' : '') + (p.link ? ' ⚡' + p.link : '');
      ctx.strokeText(txt, X, Y + TILE*0.38); ctx.fillText(txt, X, Y + TILE*0.38);
    },
    // Verbindungslinie zwischen den Toren eines Paars; Tor ohne Partner: „?“ (wartet auf den 2. Klick)
    zeichnenAlle(ctx, liste, TILE){
      const nachPaar = {};
      for(const p of liste) (nachPaar[p.paar] = nachPaar[p.paar] || []).push(p);
      for(const k in nachPaar){
        const L = nachPaar[k];
        if(L.length >= 2){
          const [a, b] = L, ax = a.c*TILE + TILE/2, ay = a.r*TILE + TILE/2, bx = b.c*TILE + TILE/2, by = b.r*TILE + TILE/2;
          ctx.save(); ctx.setLineDash([8, 6]); ctx.strokeStyle = teleFarbe(Number(k)); ctx.globalAlpha = 0.8; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(ax, ay);
          ctx.quadraticCurveTo((ax + bx)/2, Math.min(ay, by) - 60, bx, by); ctx.stroke(); ctx.restore();
        } else {
          const a = L[0];
          ctx.fillStyle = '#ffe066'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('?', a.c*TILE + TILE - 6, a.r*TILE + 8);
        }
      }
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE + TILE, paar: p.paar, fuer: p.fuer || 'beide',
      ...(p.schalter === 'nummer' && p.link ? {link: p.link} : {})})),
  },
  spiel: {
    laden(daten){
      teleporters = (daten.teleporters || []).map(t => ({x: t.x, y: t.y, paar: t.paar || 1, fuer: t.fuer || 'beide', link: t.link || null, partner: null}));
      for(const t of teleporters) t.partner = teleporters.find(o => o !== t && o.paar === t.paar) || null;
    },
    nachBewegung: teleNachBewegung,
    zuruecksetzen: teleZuruecksetzen,
    zeichnen: teleZeichnen,
  },
});

// ==== wasser
// elemente/wasser.js – Element „Wasser“ (Ausbau 5; Kachel-Element, siehe 00-register.js).
// Wasserflächen malt man im Editor wie Aufwind. Im Spiel schwimmen beide Figuren darin frei in alle Richtungen
// (Links/Rechts, Hoch/Runter = Affe W/S bzw. Schweinchen ↑/↓ bzw. Stick; Springen = Schwimmstoß, an der Oberfläche
// = aus dem Wasser springen). Ohne Taste treibt man langsam nach oben (Auftrieb), das Wasser bremst (Widerstand).
// Unter Wasser gibt es KEINEN Haken (ein hängendes Seil löst sich beim Eintauchen) und KEINEN Schirm.
// Luft je Figur (LUFT_MAX): sinkt, solange der Kopf unter Wasser ist; Kopf über Wasser = Luft füllt sich auf;
// in den letzten LUFT_WARN Schritten Warnung (Blasen-Anzeige blinkt rot, Ticken); leer = Tod (Checkpoint).
// Werte in js/02-physik-werte.js (SWIM_*, LUFT_*). Spiel-Liste: wasserBecken (zusammenhängende Wasser-Rechtecke).
// Rolle: beide schwimmen gleich (Einzel-Fähigkeiten unter Wasser gibt es auf Nutzerwunsch erst einmal nicht);
// die Luft zwingt zu Zusammenarbeit – gemeinsame Luftblase (beide zusammen + Fähigkeitstaste, siehe unten).
let wasserBecken = [];   // [{rects:[{x,y,w,h}], top, bottom, minX, maxX, surf}]
// Liegt der Punkt (x, y) im Wasser? (Wasserstand surf eines Beckens kann über/unter dem gemalten Rand liegen)
function imWasser(x, y){
  for(const b of wasserBecken){
    if(y < b.surf || x < b.minX || x >= b.maxX || y >= b.bottom) continue;
    for(const r of b.rects){
      if(x < r.x || x >= r.x + r.w || y >= r.y + r.h) continue;
      if(y >= r.y || r.y === b.top) return true;   // oberste Rechtecke wachsen mit steigendem Wasser nach oben
    }
  }
  return false;
}
// Oberkante eines Rechtecks beim aktuellen Wasserstand
const wasserOben = (b, r) => r.y === b.top ? b.surf : Math.max(r.y, b.surf);
// Wasser-Zustand einer Figur bestimmen (einmal pro Schritt vor der Bewegung)
function wasserPruefen(pl){
  const vorher = !!pl.inWater;
  pl.inWater = wasserBecken.length > 0 && imWasser(pl.x, pl.y - pl.h*0.5);
  pl.headUnder = pl.inWater && imWasser(pl.x, pl.y - pl.h*0.85);
  // Luft holen: Nase knapp über der Kopf-Linie (4 px höher) – so atmet man auch, während man an der Oberfläche leicht wippt
  pl.kannAtmen = !pl.inWater || !imWasser(pl.x, pl.y - pl.h*0.85 - 4);
  if(pl.luft === undefined) pl.luft = LUFT_MAX;
  // Fähigkeitstaste fürs Luftblasen-Rufen merken (auch ganz kurze Tastendrücke zwischen zwei Schritten)
  const druck = (pl.male ? pl.keys.hook : pl.keys.glide) + '_pressed';
  if(pl.inWater){ if(KEYS[druck]){ pl.blaseDruck = true; KEYS[druck] = false; } }
  else if(!pl.male) KEYS[druck] = false;   // Schirm-Taste an Land: alten Druck vergessen
  if(pl.inWater !== vorher && Math.abs(pl.vy) > 2 && typeof SFX !== 'undefined' && SFX.platsch) SFX.platsch(pl.x, Math.abs(pl.vy));
  return pl.inWater;
}
// Schwimmen statt Laufen/Springen/Segeln (aus updatePlayer in 08-figur-physik-seil.js)
function schwimmPhysik(pl, moveDir, jumpPressed, frozen){
  pl.hookAttached = false; pl.gliding = false; pl.glideTimer = 0; pl.ropeFling = false;
  pl.onWall = 0; pl.wjInputLock = 0; pl.lastWallJumpSide = 0;
  // gerade aus dem Wasser gesprungen: ein paar Schritte nicht bremsen (sonst schluckt der Widerstand den Sprung, wenn der
  // Kopf beim Absprung noch knapp unter Wasser war)
  if(pl.rausSprung > 0 && pl.vy < 0){ pl.rausSprung--; pl.vy += GRAVITY; return; }
  pl.rausSprung = 0;
  const hoch = !frozen && isDown(pl.keys.swimUp), runter = !frozen && isDown(pl.keys.swimDown);
  // knapp unter der Oberfläche (Kopf weniger als SWIM_OBEN_ZONE tief): kräftiger nach oben, damit man ruhig mit dem
  // Kopf über Wasser treibt statt zu wippen; Kopf draußen: sanft zurück, bis er gerade herausschaut
  const nahOben = pl.headUnder && !imWasser(pl.x, pl.y - pl.h*0.85 - SWIM_OBEN_ZONE);
  let ay = !pl.headUnder ? SWIM_SURFACE_GRAV : nahOben && !runter ? -SWIM_SURFACE_GRAV : -SWIM_AUFTRIEB;
  if(hoch && pl.headUnder) ay -= SWIM_ACCEL;
  if(runter) ay += SWIM_ACCEL;
  pl.vx = (pl.vx + moveDir*SWIM_ACCEL) * SWIM_DRAG;
  pl.vy = (pl.vy + ay) * SWIM_DRAG;
  pl.vx = Math.max(-SWIM_MAX_SPEED, Math.min(SWIM_MAX_SPEED, pl.vx));
  pl.vy = Math.max(-SWIM_MAX_SPEED, Math.min(SWIM_MAX_SPEED, pl.vy));
  if((!pl.headUnder || nahOben) && !runter && !hoch) pl.vy *= 0.75;   // an der Oberfläche ruhig treiben statt wippen
  if(typeof stroemungen !== 'undefined' && stroemungen.length) stroemungAnwenden(pl);   // elemente/stroemung.js
  if(jumpPressed){
    if(!pl.headUnder || nahOben){ pl.vy = SWIM_JUMP_OUT; pl.rausSprung = SWIM_RAUS_SCHRITTE; }   // an der Oberfläche: aus dem Wasser springen
    else { pl.vy = Math.min(pl.vy, -SWIM_KICK); pl.schwimmStoss = 1; if(SFX.schwimmzug) SFX.schwimmzug(pl.x); }
  }
  if(pl.schwimmStoss > 0) pl.schwimmStoss = Math.max(0, pl.schwimmStoss - 0.06);   // nur für die Arm-/Bein-Animation
}
// Luft (aus updatePlayer, nach dem Bewegen)
function luftSchritt(pl){
  if(pl.luft === undefined) pl.luft = LUFT_MAX;
  const atmet = pl.kannAtmen !== false || (typeof luftblaseAtmet === 'function' && luftblaseAtmet(pl));
  const vorher = pl.luft;
  if(atmet) pl.luft = Math.min(LUFT_MAX, pl.luft + LUFT_AUFFUELLEN);
  else {
    pl.luft--;
    if(pl.luft === LUFT_WARN && typeof SFX !== 'undefined' && SFX.luftWarn) SFX.luftWarn(pl.x);
    else if(pl.luft < LUFT_WARN && pl.luft % 60 === 0 && pl.luft > 0 && SFX.luftWarn) SFX.luftWarn(pl.x, true);
    if(pl.luft <= 0){ pl.luft = 0; die(pl); }
  }
  if(atmet && vorher < LUFT_MAX*0.6 && pl.luft >= LUFT_MAX*0.6 && SFX.luftHolen) SFX.luftHolen(pl.x);
}
// --- Gemeinsame Luftblase (Ausbau 5, Nutzerwunsch: gemeinsame Fähigkeit statt Einzel-Fähigkeiten) ---
// Beide schwimmen dicht zusammen (Mitte zu Mitte höchstens BLASE_ABSTAND) und drücken ihre Fähigkeitstaste
// (Affe G, Schweinchen Num 1, Controller □) – nicht genau gleichzeitig nötig: ein Druck „ruft“ BLASE_RUF Schritte lang
// (kleine Blase über dem Kopf). Dann wächst um beide eine Luftblase, in der sie atmen (Luft füllt sich wie an der
// Oberfläche). Sie hält, solange beide im Wasser und höchstens BLASE_HALTEN auseinander sind, sonst platzt sie.
let luftblase = null;   // {x, y, r, t (Schritte seit Entstehen), pop (Schritte seit Platzen oder -1)}
const figurMitte = pl => ({x: pl.x, y: pl.y - pl.h*0.5});
function luftblaseAtmet(pl){
  if(!luftblase || luftblase.pop >= 0 || luftblase.t < 8) return false;
  const m = figurMitte(pl);
  return Math.hypot(m.x - luftblase.x, m.y - luftblase.y) <= luftblase.r + 8;
}
function luftblaseSchritt(){
  if(!wasserBecken.length){ luftblase = null; return; }
  for(const pl of [p1, p2]){
    const frisch = !!pl.blaseDruck; pl.blaseDruck = false;   // gesetzt in wasserPruefen
    if(frisch && pl.inWater && !won){ pl.blasenRuf = BLASE_RUF; if(SFX.blaseRuf) SFX.blaseRuf(pl.x); }
    else if(pl.blasenRuf > 0) pl.blasenRuf--;
  }
  const a = figurMitte(p1), b = figurMitte(p2), abstand = Math.hypot(a.x - b.x, a.y - b.y);
  const mx = (a.x + b.x)/2, my = (a.y + b.y)/2;
  if(luftblase && luftblase.pop >= 0){ if(++luftblase.pop > 24) luftblase = null; return; }
  if(!luftblase){
    if(p1.blasenRuf > 0 && p2.blasenRuf > 0 && p1.inWater && p2.inWater && abstand <= BLASE_ABSTAND && !deathState){
      luftblase = {x: mx, y: my, r: 0, t: 0, pop: -1};
      p1.blasenRuf = p2.blasenRuf = 0;
      SFX.blaseAuf(mx);
      for(let k = 0; k < 8; k++){   // Herzchen-Funken
        const ang = -Math.PI/2 + (k/7 - 0.5)*2.4;
        coinFx.push({type: 'spark', x: mx, y: my - 10, t0: performance.now(), vx: Math.cos(ang)*2.2, vy: Math.sin(ang)*2.2,
                     size: 3 + (k % 3), star: k % 2 === 0, col: ['#ff9ec7', '#ffffff']});
      }
    }
    return;
  }
  luftblase.t++;
  luftblase.x += (mx - luftblase.x)*0.25; luftblase.y += (my - luftblase.y)*0.25;
  const ziel = Math.max(BLASE_RADIUS, abstand/2 + 26);
  luftblase.r += (ziel - luftblase.r)*0.18;
  if(abstand > BLASE_HALTEN || !p1.inWater || !p2.inWater || deathState){
    luftblase.pop = 0; SFX.blasePlatzt(luftblase.x);
  }
}
function luftblaseZeichnen(){
  const now = performance.now();
  // „Ruf“-Bläschen über dem Kopf, solange eine Figur auf die andere wartet
  for(const pl of [p1, p2]){
    if(!(pl.blasenRuf > 0) || luftblase) continue;
    const x = Math.round(pl.x - camX) + (pl.male ? -12 : 12), y = pl.y - pl.h - 30 + Math.sin(now*0.01)*2;
    const s = 0.8 + 0.2*Math.sin(now*0.02);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(210,245,255,0.55)'; ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff7eb3'; ctx.beginPath();   // kleines Herz
    ctx.moveTo(0, 3); ctx.bezierCurveTo(-5, -1, -3, -5, 0, -2.5); ctx.bezierCurveTo(3, -5, 5, -1, 0, 3); ctx.fill();
    ctx.restore();
  }
  if(!luftblase) return;
  const L = luftblase, x = L.x - camX;
  if(L.pop >= 0){   // Platzen: Ring und Tröpfchen
    const k = L.pop/24;
    ctx.globalAlpha = 1 - k; ctx.strokeStyle = 'rgba(235,252,255,0.9)'; ctx.lineWidth = 3*(1 - k) + 0.5;
    ctx.beginPath(); ctx.arc(x, L.y, L.r*(1 + k*0.5), 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = 'rgba(235,252,255,0.9)';
    for(let i = 0; i < 12; i++){ const a = i/12*Math.PI*2; ctx.beginPath(); ctx.arc(x + Math.cos(a)*L.r*(1 + k), L.y + Math.sin(a)*L.r*(1 + k) + k*k*20, 2.4*(1 - k) + 0.5, 0, Math.PI*2); ctx.fill(); }
    ctx.globalAlpha = 1; return;
  }
  // Wachsen mit kleinem Nachfedern, dann weiches Wabbeln
  const g = Math.min(1, L.t/14), feder = g < 1 ? 1 - Math.pow(1 - g, 3) + Math.sin(g*Math.PI)*0.12 : 1;
  const R = L.r*feder, tw = now*0.003;
  ctx.save(); ctx.translate(x, L.y);
  ctx.beginPath();
  for(let i = 0; i <= 40; i++){
    const a = i/40*Math.PI*2, rr = R*(1 + 0.035*Math.sin(a*3 + tw*2) + 0.025*Math.sin(a*5 - tw*3));
    if(i === 0) ctx.moveTo(Math.cos(a)*rr, Math.sin(a)*rr); else ctx.lineTo(Math.cos(a)*rr, Math.sin(a)*rr);
  }
  ctx.closePath();
  const gr = ctx.createRadialGradient(-R*0.3, -R*0.35, R*0.1, 0, 0, R);
  gr.addColorStop(0, 'rgba(255,255,255,0.42)'); gr.addColorStop(0.65, 'rgba(225,248,255,0.26)'); gr.addColorStop(1, 'rgba(180,235,255,0.55)');
  ctx.fillStyle = gr; ctx.fill();
  ctx.strokeStyle = 'rgba(200,240,255,0.35)'; ctx.lineWidth = 9; ctx.stroke();       // weicher Schein außen
  ctx.strokeStyle = 'rgba(245,254,255,0.95)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = `hsla(${(now*0.05) % 360},90%,80%,0.55)`; ctx.lineWidth = 1.4; ctx.stroke();   // Regenbogen-Schimmer
  // Glanz oben links
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, R*0.78, Math.PI*1.12, Math.PI*1.38); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(-R*0.5, -R*0.62, 2.6, 0, Math.PI*2); ctx.fill();
  // kreisende Glitzer und aufsteigende Mini-Bläschen
  for(let i = 0; i < 5; i++){
    const a = tw*(i % 2 ? 0.8 : -0.6) + i*1.256, rr = R*(0.55 + 0.12*(i % 3));
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.9)' : 'rgba(255,170,215,0.85)';
    ctx.beginPath(); ctx.arc(Math.cos(a)*rr, Math.sin(a)*rr, 1.6, 0, Math.PI*2); ctx.fill();
  }
  for(let i = 0; i < 3; i++){   // kleine Herzchen steigen aus der Blase
    const ph = (now*0.0004 + i/3) % 1, hx = (i - 1)*R*0.35 + Math.sin(now*0.002 + i*2)*5, hy = -R*0.2 - ph*R*1.4, s = 0.6 + 0.5*Math.sin(ph*Math.PI);
    ctx.globalAlpha = Math.sin(ph*Math.PI)*0.9; ctx.fillStyle = '#ff8ec4';
    ctx.beginPath(); ctx.moveTo(hx, hy + 4*s); ctx.bezierCurveTo(hx - 6*s, hy - 1*s, hx - 3.5*s, hy - 6*s, hx, hy - 3*s);
    ctx.bezierCurveTo(hx + 3.5*s, hy - 6*s, hx + 6*s, hy - 1*s, hx, hy + 4*s); ctx.fill(); ctx.globalAlpha = 1;
  }
  for(let i = 0; i < 4; i++){
    const ph = (now*0.0006 + i*0.25) % 1;
    ctx.strokeStyle = `rgba(255,255,255,${0.6*Math.sin(ph*Math.PI)})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc((i - 1.5)*R*0.3 + Math.sin(now*0.003 + i)*3, R*0.6 - ph*R*1.3, 2 + i % 2, 0, Math.PI*2); ctx.stroke();
  }
  ctx.restore();
}
// --- Zeichnen ---
// Wasserkörper VOR den Figuren (halb durchsichtig), Oberfläche mit Wellen; nur sichtbare Teile
function wasserZeichnen(){
  const t = performance.now()*0.001;
  for(const b of wasserBecken){
    if(b.maxX < camX - 20 || b.minX > camX + VW + 20 || b.surf >= b.bottom) continue;
    for(const r of b.rects){
      const x0 = r.x - camX, oben = wasserOben(b, r), h = r.y + r.h - oben;
      if(h <= 0 || x0 + r.w < -20 || x0 > VW + 20) continue;
      const gr = ctx.createLinearGradient(0, oben, 0, oben + Math.max(h, 200));
      gr.addColorStop(0, 'rgba(70,170,215,0.38)'); gr.addColorStop(1, 'rgba(20,70,130,0.55)');
      ctx.fillStyle = gr; ctx.fillRect(x0, oben, r.w, h);
      // Oberfläche: nur wo darüber kein Wasser ist
      if(imWasser(r.x + r.w/2, oben - 3)) continue;
      ctx.beginPath(); ctx.moveTo(x0, oben + 6);
      for(let x = 0; x <= r.w; x += 10){
        const wx = r.x + x;
        ctx.lineTo(x0 + x, oben + Math.sin(wx*0.045 + t*2.2)*2.2 + Math.sin(wx*0.11 - t*3.1)*1.2);
      }
      ctx.lineTo(x0 + r.w, oben + 6); ctx.closePath();
      ctx.fillStyle = 'rgba(190,240,255,0.5)'; ctx.fill();
      ctx.strokeStyle = 'rgba(235,252,255,0.85)'; ctx.lineWidth = 2; ctx.beginPath();
      for(let x = 0; x <= r.w; x += 10){
        const wx = r.x + x, wy = oben + Math.sin(wx*0.045 + t*2.2)*2.2 + Math.sin(wx*0.11 - t*3.1)*1.2;
        if(x === 0) ctx.moveTo(x0 + x, wy); else ctx.lineTo(x0 + x, wy);
      }
      ctx.stroke();
    }
  }
}
// Luft-Anzeige: kleine Blasen über dem Kopf, sobald Luft fehlt; letzte 3 s rot blinkend
const LUFT_BLASEN = 6;
function luftAnzeigeZeichnen(){
  for(const pl of [p1, p2]){
    if(!pl || pl.luft === undefined || pl.luft >= LUFT_MAX || (deathState && deathState.victim === pl)) continue;
    const x = Math.round(pl.x - camX), y = pl.y - pl.h - 16, anteil = pl.luft / LUFT_MAX;
    const warn = pl.luft < LUFT_WARN, an = !warn || Math.floor(pl.luft/8) % 2 === 0;
    for(let i = 0; i < LUFT_BLASEN; i++){
      const voll = Math.min(1, Math.max(0, anteil*LUFT_BLASEN - i));
      const bx = x + (i - (LUFT_BLASEN - 1)/2)*9, by = y + Math.sin(performance.now()*0.004 + i)*1.2;
      ctx.beginPath(); ctx.arc(bx, by, 3.6, 0, Math.PI*2);
      ctx.fillStyle = voll <= 0 ? 'rgba(255,255,255,0.12)' : warn ? (an ? `rgba(255,90,80,${0.4 + 0.6*voll})` : 'rgba(255,180,170,0.25)')
                                                                 : `rgba(200,240,255,${0.35 + 0.6*voll})`;
      ctx.fill();
      ctx.strokeStyle = warn && an ? 'rgba(255,230,230,0.9)' : 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1; ctx.stroke();
      if(voll > 0){ ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(bx - 1.6, by - 1.8, 1.4, 1.4); }
    }
  }
}
// --- Optik unter Wasser: Lichtstrahlen, aufsteigende Bläschen, Atem-Bläschen der Figuren (nur Zeichnen) ---
// Leistung: nur sichtbare Becken, je Rechteck höchstens WASSER_STRAHLEN Strahlen und WASSER_BLAESCHEN Bläschen.
const WASSER_STRAHLEN = 3, WASSER_BLAESCHEN = 10;
function wasserHash(a, b){ const s = Math.sin(a*12.9898 + b*78.233)*43758.5453; return s - Math.floor(s); }
function wasserLichtUndBlasen(){
  const t = performance.now()*0.001;
  for(const b of wasserBecken){
    if(b.maxX < camX - 20 || b.minX > camX + VW + 20 || b.surf >= b.bottom) continue;
    for(const r of b.rects){
      const oben = wasserOben(b, r), h = r.y + r.h - oben, x0 = r.x - camX;
      if(h <= 4 || x0 + r.w < -20 || x0 > VW + 20) continue;
      ctx.save(); ctx.beginPath(); ctx.rect(x0, oben, r.w, h); ctx.clip();
      // Lichtstrahlen von der Oberfläche schräg nach unten, sanft wandernd
      const n = Math.min(WASSER_STRAHLEN, Math.max(1, Math.round(r.w/220)));
      for(let i = 0; i < n; i++){
        const sx = x0 + ((i + 0.5)/n)*r.w + Math.sin(t*0.4 + i*2.1 + r.x*0.01)*30, len = Math.min(h, 320);
        const g = ctx.createLinearGradient(0, oben, 0, oben + len);
        g.addColorStop(0, 'rgba(255,255,230,0.22)'); g.addColorStop(1, 'rgba(255,255,230,0)');
        ctx.fillStyle = g; ctx.globalAlpha = 0.6 + 0.4*Math.sin(t*0.9 + i*1.7);
        ctx.beginPath(); ctx.moveTo(sx - 14, oben); ctx.lineTo(sx + 14, oben); ctx.lineTo(sx + 14 + len*0.35, oben + len); ctx.lineTo(sx - 34 + len*0.35, oben + len); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // aufsteigende Bläschen (feste Startpunkte, steigen in einer Schleife)
      const m = Math.min(WASSER_BLAESCHEN, Math.max(2, Math.round(r.w*h/16000)));
      ctx.strokeStyle = 'rgba(235,252,255,0.7)'; ctx.lineWidth = 1;
      for(let i = 0; i < m; i++){
        const hx = wasserHash(r.x + i, r.y), sp = 0.08 + 0.12*wasserHash(i, r.x), ph = (t*sp + hx) % 1;
        const bx = x0 + hx*r.w + Math.sin(t*2 + i)*3, by = r.y + r.h - ph*h, rad = 1.5 + 2*wasserHash(i, r.y);
        ctx.globalAlpha = Math.min(1, (1 - ph)*3)*0.8;
        ctx.beginPath(); ctx.arc(bx, by, rad, 0, Math.PI*2); ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.restore();
    }
  }
  // Atem-Bläschen über dem Kopf von Figuren unter Wasser
  for(const pl of [p1, p2]){
    if(!pl || !pl.headUnder || (deathState && deathState.victim === pl)) continue;
    for(let i = 0; i < 3; i++){
      const ph = (t*0.9 + i/3 + (pl.male ? 0 : 0.5)) % 1, bx = pl.x - camX + pl.facing*6 + Math.sin(t*5 + i*2)*3;
      const by = pl.y - pl.h*0.75 - ph*36;
      if(!imWasser(bx + camX, by)) continue;
      ctx.globalAlpha = (1 - ph)*0.85; ctx.strokeStyle = '#f0fbff'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(bx, by, 1.6 + i*0.7, 0, Math.PI*2); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
// --- Gedämpfter Ton unter Wasser: Tiefpass vor dem Lautsprecher (js/07 audioOut), je nach Zahl der Köpfe unter Wasser ---
let wasserDaempfungZiel = 20000;   // Hz (für Tests lesbar)
// Ton wieder klar (neues Level, Neustart, Startmenü)
function wasserTonReset(){
  wasserDaempfungZiel = 20000;
  if(typeof unterwasserFilter !== 'undefined' && unterwasserFilter && audioCtx){ try{ unterwasserFilter.frequency.setTargetAtTime(20000, audioCtx.currentTime, 0.05); }catch(e){} }
}
function wasserTonSchritt(){
  const n = [p1, p2].filter(pl => pl && pl.headUnder && !(deathState && deathState.victim === pl)).length;
  const ziel = n === 2 ? WASSER_TON_BEIDE : n === 1 ? WASSER_TON_EINER : 20000;
  if(ziel === wasserDaempfungZiel) return;
  wasserDaempfungZiel = ziel;
  if(typeof unterwasserFilter !== 'undefined' && unterwasserFilter && audioCtx){
    try{ unterwasserFilter.frequency.setTargetAtTime(ziel, audioCtx.currentTime, 0.12); }catch(e){}
  }
}
// Rechtecke einer Spalte untereinander zusammenfassen (mergeRects fasst nur nebeneinander zusammen)
function wasserSenkrechtZusammen(rects){
  const out = rects.map(r => ({...r})).sort((a, b) => a.x - b.x || a.w - b.w || a.y - b.y);
  for(let i = 0; i < out.length; i++){
    for(let j = i + 1; j < out.length; j++){
      const a = out[i], c = out[j];
      if(c.x === a.x && c.w === a.w && c.y === a.y + a.h){ a.h += c.h; out.splice(j, 1); j--; }
    }
  }
  return out.sort((a, b) => a.y - b.y || a.x - b.x);
}
// Zusammenhängende Rechtecke (berühren sich an einer Kante) zu Becken gruppieren
function wasserBeckenBauen(rects){
  const rest = rects.map(r => ({...r})), becken = [];
  const beruehrt = (a, c) => a.x <= c.x + c.w && c.x <= a.x + a.w && a.y <= c.y + c.h && c.y <= a.y + a.h &&
    (Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x) > 0 || Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y) > 0);
  while(rest.length){
    const grp = [rest.pop()];
    for(let k = 0; k < grp.length; k++) for(let i = rest.length - 1; i >= 0; i--) if(beruehrt(grp[k], rest[i])) grp.push(rest.splice(i, 1)[0]);
    const top = Math.min(...grp.map(r => r.y));
    becken.push({rects: grp, top, bottom: Math.max(...grp.map(r => r.y + r.h)), minX: Math.min(...grp.map(r => r.x)),
                 maxX: Math.max(...grp.map(r => r.x + r.w)), surf: top, ziel: top, pegel: []});
  }
  return becken;
}
elementRegistrieren({
  id: 'wasser', name: 'Wasser', feld: 'waters',
  editor: {
    werkzeug: 'water', gruppe: 'wasser', art: 'kachel', ziehbar: true,
    titel: 'Wasser: Fläche malen – darin schwimmen beide (kein Haken, kein Schirm), Luft wird knapp; an der Oberfläche atmen',
    farbe: '#3d9be0', kachelFarbe: 'rgba(61,155,224,0.35)',
    zeichnen(ctx, c, r, TILE){   // kleine Welle
      ctx.strokeStyle = 'rgba(210,240,255,.7)'; ctx.lineWidth = 2;
      const X = c*TILE, Y = r*TILE + TILE/2;
      ctx.beginPath(); ctx.moveTo(X + 6, Y); ctx.quadraticCurveTo(X + 13, Y - 6, X + 20, Y); ctx.quadraticCurveTo(X + 27, Y + 6, X + 34, Y); ctx.stroke();
    },
    exportieren: (zellen, TILE, mergeRects) => wasserSenkrechtZusammen(mergeRects(zellen)),
  },
  spiel: {
    laden(daten){ wasserBecken = wasserBeckenBauen(daten.waters || []); wasserTonReset(); },
    schritt(){ luftblaseSchritt(); wasserTonSchritt(); },
    zuruecksetzen(){ for(const b of wasserBecken){ b.surf = b.top; b.ziel = b.top; } luftblase = null; wasserTonReset(); },
    zeichnenVorne(){ if(wasserBecken.length){ wasserZeichnen(); wasserLichtUndBlasen(); luftblaseZeichnen(); luftAnzeigeZeichnen(); } },
  },
});

// ==== wechselboden
// elemente/wechselboden.js – Element „Wechselboden“ (Ausbau 4; Punkt-Element mit Verknüpfungs-Nummer, siehe 00-register.js).
// Boden-Kästchen in zwei Gruppen, die sich gegenläufig ein- und ausblenden:
//   Gruppe A (türkis, Streifen) ist fest, solange ihre Nummer AUS ist; Gruppe B (orange, Punkte) ist fest, solange sie AN ist.
//   Geschaltet per Hebel oder Druckplatte mit derselben Nummer (Verknüpfungs-System, js/05-level-objekte.js).
//   Takt-Variante: wechselt von selbst alle X Sekunden (A und B abwechselnd), 1 Sekunde vorher blinkt sie zur Warnung.
// Unterscheidung nicht nur über die Farbe, sondern auch über das Muster (Streifen / Punkte) und den Buchstaben im Editor.
// SICHERHEIT: Steht eine Figur dort, wo der Boden gerade fest werden soll, wartet dieses Kästchen (wie eine Tür, die
// erst schließt, wenn niemand darin steht) – niemand wird eingeklemmt oder durch den Boden geschoben. Verschwinden
// darf der Boden sofort (dann fällt man eben, wie beim Bröckelboden).
// Rolle: Hebel/Druckplatte – einer schaltet, der andere läuft. Takt – das Schweinchen „wartet“ mit dem Schirm in der
// Luft, bis der Boden wieder da ist, der Affe wartet am Haken hängend.
// Im Spiel: solids mit type 'wechsel' {x, y, w, h, gruppe, link | takt, gone, wartet}.
const WECHSEL_WARN_STEPS = 60;   // so viele Physik-Schritte (1 Spielsekunde) vor dem Takt-Wechsel blinkt der Boden
const WECHSEL_LOOK = {
  A: {hell: '#5fd0dd', mitte: '#2fa3b5', dunkel: '#17606d'},   // türkis, Streifen
  B: {hell: '#ffb066', mitte: '#e07b2c', dunkel: '#86400f'},   // orange, Punkte
};
let wechselSchritte = 0;   // Takt-Uhr (Physik-Schritte seit Levelstart / Neustart / Checkpoint)
let wechselNummern = {};   // Ruinen-Überarbeitung: Nummer -> {A, B} – welche Gruppen hängen an dieser Nummer (für die Hebel-Anzeige)
// Welche Gruppe ist bei dieser Nummer gerade fest? 'A' / 'B' / null (keine Wechselböden an der Nummer)
function wechselAktiveGruppe(link){ return wechselNummern[link] ? (linkOn[link] ? 'B' : 'A') : null; }
// Anzeige am Hebel (elemente/hebel.js): zwei kleine Kacheln A ▨ und B ⠿ neben dem Sockel; die gerade feste Gruppe ist
// kräftig und groß, die andere nur ein blasser gestrichelter Umriss (wie die Geisteranzeige am Boden)
function wechselHebelAnzeige(xr, baseY, link){ return;
  const aktiv = wechselAktiveGruppe(link); if(!aktiv) return;
  const hat = wechselNummern[link];
  for(const [gr, dx] of [['A', -30], ['B', 30]]){
    if(!hat[gr]) continue;
    const L = WECHSEL_LOOK[gr], an = gr === aktiv, g = an ? 16 : 12, x = xr + dx - g/2, y = baseY - 20 - g;
    if(an){
      ctx.fillStyle = L.mitte; roundRect(x, y, g, g, 3); ctx.fill();
      wechselMuster(ctx, x, y, g, g, gr, 'rgba(255,255,255,.45)');
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; roundRect(x, y, g, g, 3); ctx.stroke();
      ctx.strokeStyle = L.dunkel; ctx.lineWidth = 1; roundRect(x - 1.5, y - 1.5, g + 3, g + 3, 4); ctx.stroke();
    } else {
      ctx.save(); ctx.globalAlpha = 0.75; ctx.setLineDash([3, 2]); ctx.strokeStyle = L.dunkel; ctx.lineWidth = 2;
      roundRect(x, y, g, g, 3); ctx.stroke(); ctx.restore();
    }
    ctx.fillStyle = an ? '#fff' : L.dunkel; ctx.font = 'bold ' + (an ? 10 : 8) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(gr, x + g/2, y + g/2 + 0.5);
  }
}
function wechselTaktSchritte(s){ return Math.max(30, Math.round(s.takt*60)); }
// Soll dieses Kästchen gerade fest sein?
function wechselSoll(s){
  if(s.takt > 0){
    const phase = Math.floor(wechselSchritte / wechselTaktSchritte(s)) % 2;
    return s.gruppe === 'B' ? phase === 1 : phase === 0;
  }
  const an = !!linkOn[s.link];
  return s.gruppe === 'B' ? an : !an;
}
// 0 … 1: wie weit die Vorwarnung vor dem nächsten Takt-Wechsel ist (0 = keine Warnung)
function wechselWarnung(s){
  if(!(s.takt > 0)) return 0;
  const n = wechselTaktSchritte(s), rest = n - (wechselSchritte % n);
  return rest <= WECHSEL_WARN_STEPS ? 1 - rest/WECHSEL_WARN_STEPS : 0;
}
function wechselFigurDrin(p, s){
  const ox = Math.min(p.x + p.w/2, s.x + s.w) - Math.max(p.x - p.w/2, s.x);
  const oy = Math.min(p.y, s.y + s.h) - Math.max(p.y - p.h, s.y);
  return ox > COLLIDE_EPS && oy > COLLIDE_EPS;
}
const wechselImBild = s => s.x + s.w > camX - 40 && s.x < camX + VW + 40;
// einmal pro Physik-Schritt (stepSim): Zustand an Nummer bzw. Takt anpassen – sicher, siehe oben
function wechselSchritt(players){
  wechselSchritte++;
  let an = null, weg = null, warn = null;
  for(const s of solids){
    if(s.type !== 'wechsel') continue;
    if(s.takt > 0 && wechselImBild(s) && (wechselTaktSchritte(s) - wechselSchritte % wechselTaktSchritte(s)) === WECHSEL_WARN_STEPS) warn = s;
    const soll = wechselSoll(s);
    if(soll === !s.gone){ s.wartet = false; continue; }
    if(!soll){ s.gone = true; s.wartet = false; s.wechselT = wechselSchritte; if(wechselImBild(s)) weg = s; }
    else if(players.some(p => p && wechselFigurDrin(p, s))) s.wartet = true;   // jemand steht drin: warten
    else { s.gone = false; s.wartet = false; s.wechselT = wechselSchritte; if(wechselImBild(s)) an = s; }
  }
  if(an) SFX.wechsel(true, an.x + an.w/2);
  if(weg) SFX.wechsel(false, weg.x + weg.w/2);
  if(warn) SFX.wechselWarn(warn.x + warn.w/2);
}
// Neustart / Tod: Uhr auf 0, alles in den Grundzustand (nach dem Aufstellen der Figuren aufgerufen)
function wechselZuruecksetzen(){
  wechselSchritte = 0;
  for(const s of solids){
    if(s.type !== 'wechsel') continue;
    const soll = wechselSoll(s), drin = soll && [p1, p2].some(p => p && wechselFigurDrin(p, s));
    s.gone = !soll || drin; s.wartet = drin; s.wechselT = -999;   // steht jemand drin: warten (wie im Spiel)
  }
}
// Muster: A = schräge Streifen, B = Punkte (auch ohne Farben unterscheidbar)
function wechselMuster(c, x, y, w, h, gruppe, farbe){
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = farbe; c.strokeStyle = farbe;
  if(gruppe === 'B'){
    for(let yy = y + 7; yy < y + h; yy += 13) for(let xx = x + ((yy - y) % 26 ? 13 : 6.5); xx < x + w; xx += 13){
      c.beginPath(); c.arc(xx, yy, 3, 0, Math.PI*2); c.fill();
    }
  } else {
    c.lineWidth = 4;
    for(let k = -h; k < w; k += 12){ c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + h, y); c.stroke(); }
  }
  c.restore();
}
function wechselEdelstein(cx, cy, s, a){   // wie auf den Türen: dunkle Platte mit Edelstein in der Hebel-Farbe; B = mit dunklem Kern
  const col = linkColor(s.link); ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = '#3a3f46'; ctx.beginPath(); ctx.roundRect(cx - 12, cy - 12, 24, 24, 5); ctx.fill(); ctx.strokeStyle = '#15171a'; ctx.lineWidth = 1; ctx.stroke();
  elementEdelstein(cx, cy, 8.5, col);
  if(s.gruppe === 'B'){ ctx.fillStyle = 'rgba(30,18,10,.85)'; ctx.beginPath(); ctx.moveTo(cx, cy - 3.6); ctx.lineTo(cx + 3.2, cy); ctx.lineTo(cx, cy + 3.6); ctx.lineTo(cx - 3.2, cy); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
let __wReihen = null, __wKey = '';
function wechselReihen(){
  const key = outK + wallK + soilK + solids.length;
  if(__wReihen && __wKey === key) return __wReihen;
  __wKey = key; const alle = solids.filter(o => o.type === 'wechsel'), gesehen = new Set(), reihen = [];
  const gleich = (a, b) => a.gruppe === b.gruppe && a.takt === b.takt && a.link === b.link;
  const find = (s, dx, dy) => alle.find(o => o !== s && gleich(o, s) && Math.abs(o.x - (s.x + dx)) < 1 && Math.abs(o.y - (s.y + dy)) < 1);
  for(const s of alle){
    if(gesehen.has(s)) continue;
    const senkrecht = !(find(s, s.w, 0) || find(s, -s.w, 0)) && !!(find(s, 0, s.h) || find(s, 0, -s.h));
    // Anfang der Reihe suchen, dann entlanglaufen
    let a = s; for(let k = 0; k < 200; k++){ const v = senkrecht ? find(a, 0, -a.h) : find(a, -a.w, 0); if(!v) break; a = v; }
    const teile = [a]; gesehen.add(a);
    for(let k = 0; k < 200; k++){ const l = teile[teile.length - 1], n = senkrecht ? find(l, 0, l.h) : find(l, l.w, 0); if(!n || gesehen.has(n)) break; teile.push(n); gesehen.add(n); }
    const w = senkrecht ? a.w : teile.reduce((z, o) => z + o.w, 0), h = senkrecht ? teile.reduce((z, o) => z + o.h, 0) : a.h;
    const c = document.createElement('canvas'); c.width = Math.ceil((w + 48)*2); c.height = Math.ceil((h + 48)*2);
    const piece = {m: [0, 0, w, h, senkrecht ? 'wall' : 'soil'], c, done: 0}; pieceDraw(piece);   // gleiche Zeichnung wie die beweglichen Plattformen: Gras-Kappe, Erde bzw. Wand, Outline
    reihen.push({teile, x: a.x, y: a.y, w, h, senkrecht, c});
  }
  return __wReihen = reihen;
}
function wechselZeichnen(){
  for(const R of wechselReihen()){
    const s = R.teile[0], x = Math.round(R.x - camX);
    if(x + R.w < -20 || x > VW + 20) continue;
    const gone = R.teile.every(o => o.gone);
    if(gone){   // weg: nur ein leichter, weicher Schatten; bei Hebel-Böden bleibt der Edelstein
      ctx.fillStyle = 'rgba(12,24,14,.15)'; ctx.beginPath(); ctx.roundRect(x + 1, R.y + 1, R.w - 2, R.h - 2, 7); ctx.fill();
      if(!(s.takt > 0) && s.link) wechselEdelstein(x + R.w/2, R.y + R.h/2, s, .5);
      continue;
    }
    ctx.drawImage(R.c, x - 24, R.y - 24, R.w + 48, R.h + 48);
    if(!(s.takt > 0) && s.link) wechselEdelstein(x + R.w/2, R.y + R.h/2, s, 1);
    if(s.takt > 0){   // Takt: ein Balken über die ganze Reihe, schrumpft bis zum Wechsel
      const rest = 1 - (wechselSchritte % wechselTaktSchritte(s)) / wechselTaktSchritte(s);
      const bx = R.senkrecht ? x + R.w/2 : x + 2, by = R.senkrecht ? R.y + 2 : R.y + R.h - 6, len = (R.senkrecht ? R.h : R.w) - 4;
      const ex = R.senkrecht ? 0 : 1, ey = R.senkrecht ? 1 : 0;
      ctx.save(); ctx.lineCap = 'butt';
      ctx.globalAlpha = .6; ctx.strokeStyle = '#2a2018'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + ex*len, by + ey*len); ctx.stroke();
      ctx.globalAlpha = 1; ctx.strokeStyle = '#fff2b8'; ctx.lineWidth = 3.6; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + ex*len*rest, by + ey*len*rest); ctx.stroke();
      ctx.restore();
    }
  }
}
ELEMENT_SOLID_TYPEN.add('wechsel');
elementRegistrieren({
  id: 'wechselboden', name: 'Wechselboden', feld: 'switchFloors',
  editor: {
    werkzeug: 'wechsel', gruppe: 'logik', vor: '#linkSelect', art: 'punkt', ziehbar: true,
    mitNummer: true, nummerName: 'Wechselboden', farbe: '#2fa3b5',
    nummerAktiv: p => !(p.takt > 0),   // Takt-Boden hängt an keiner Nummer
    titel: 'Wechselboden: Gruppe A ist fest, solange die Verknüpfung AUS ist, Gruppe B, solange sie AN ist (Hebel/Druckplatte). ' +
           'Oder im Takt: wechselt alle X Sekunden von selbst. Klick auf ein vorhandenes Kästchen = A/B tauschen',
    // eigene Einstellungen neben dem Knopf; neue Kästchen bekommen die gerade gewählten Werte
    optionen: [
      {key: 'gruppe', label: 'Gruppe', titel: 'A = fest, solange die Nummer aus ist (Streifen) · B = fest, solange sie an ist (Punkte)',
       werte: [['A', 'A ▨ türkis'], ['B', 'B ⠿ orange']]},
      {key: 'takt', label: 'Takt', zahl: true, titel: 'per Nummer (Hebel/Druckplatte) oder von selbst alle X Sekunden',
       werte: [['0', 'per Nummer'], ['1.5', 'alle 1,5 s'], ['2', 'alle 2 s'], ['3', 'alle 3 s'], ['4', 'alle 4 s'], ['6', 'alle 6 s']]},
    ],
    klick(p){ p.gruppe = p.gruppe === 'B' ? 'A' : 'B'; },   // Klick auf vorhandenes Kästchen
    zeichnen(ctx, c, r, TILE, p){
      const L = WECHSEL_LOOK[p.gruppe] || WECHSEL_LOOK.A, X = c*TILE, Y = r*TILE;
      ctx.fillStyle = L.mitte; ctx.fillRect(X + 1, Y + 1, TILE - 2, TILE - 2);
      wechselMuster(ctx, X + 1, Y + 1, TILE - 2, TILE - 2, p.gruppe, 'rgba(255,255,255,.3)');
      ctx.strokeStyle = L.dunkel; ctx.lineWidth = 2; ctx.strokeRect(X + 2, Y + 2, TILE - 4, TILE - 4);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText((p.gruppe || 'A') + (p.takt > 0 ? ' ⏱' + String(p.takt).replace('.', ',') : ' ' + p.link), X + TILE/2, Y + TILE/2 + 1);
    },
    // Spiel-Format: je Kästchen ein Rechteck (obere linke Ecke), Gruppe und Nummer bzw. Takt in Sekunden
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, w: TILE, h: TILE, gruppe: p.gruppe === 'B' ? 'B' : 'A',
      ...(p.takt > 0 ? {takt: p.takt} : {link: p.link})})),
  },
  spiel: {
    laden(daten){
      const liste = (daten.switchFloors || []).map(f => ({x: f.x, y: f.y, w: f.w || 40, h: f.h || 40, type: 'wechsel',
        gruppe: f.gruppe === 'B' ? 'B' : 'A', link: f.link, takt: Number(f.takt) || 0, wartet: false, wechselT: -999}));
      const gleich = (a, b) => a.gruppe === b.gruppe && a.link === b.link && a.takt === b.takt;
      for(const s of liste){
        s.reiheStart = !liste.some(o => gleich(o, s) && Math.abs(o.x + o.w - s.x) < 1 && Math.abs(o.y - s.y) < 1);
        // Länge der Reihe (für die Plakette mit der Nummer in der Mitte)
        let n = 1; while(liste.some(o => gleich(o, s) && Math.abs(o.x - (s.x + n*40)) < 1 && Math.abs(o.y - s.y) < 1)) n++;
        s.reiheBreite = n*40;
        s.gone = s.gruppe === 'B';   // Grundzustand: A fest, B weg (Neustart stellt es genau ein)
        solids.push(s);
      }
      wechselSchritte = 0;
      wechselNummern = {};
      for(const s of liste) if(!(s.takt > 0) && s.link){ (wechselNummern[s.link] = wechselNummern[s.link] || {})[s.gruppe] = true; }
    },
    schritt: wechselSchritt,
    zuruecksetzen: wechselZuruecksetzen,
    zeichnen: wechselZeichnen,
  },
});

ELEMENTE.forEach(E=>{if(E.spiel&&E.spiel.laden){try{E.spiel.laden(GAME2)}catch(e){__gerr[E.id+'.laden']=e.message}}});
function gEl(stage){g.save();g.translate(camX,0);frameDt=16;ELEMENTE.forEach(E=>{const f=E.spiel&&E.spiel[stage];if(f){try{f.call(E.spiel,[p1,p2])}catch(e){__gerr[E.id+'.'+stage]=e.message}}});g.restore()}

const DOORR=(()=>{const cells={};LV.doors.forEach(([x,y,l])=>{cells[l+'|'+x+'|'+y]=1});const used={},out=[];
 Object.keys(cells).map(k=>k.split('|').map(Number)).sort((a,b)=>a[2]-b[2]||a[1]-b[1]).forEach(([l,x,y])=>{const k0=l+'|'+x+'|'+y;if(used[k0])return;let w=1;while(cells[l+'|'+(x+40*w)+'|'+y]&&!used[l+'|'+(x+40*w)+'|'+y])w++;let h=1;ok:while(true){for(let i=0;i<w;i++){const kk=l+'|'+(x+40*i)+'|'+(y+40*h);if(!cells[kk]||used[kk])break ok}h++}
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)used[l+'|'+(x+40*i)+'|'+(y+40*j)]=1;out.push({x,y,w:w*40,h:h*40,l})});return out})();
const gateAnim={};
function drawGate(d,open,t){const x=d.x,y=d.y,w=d.w,h=d.h,col=LINK_COLORS[d.l]||'#ccc',key=d.l+'|'+x+'|'+y;
 const tg=open?1:0;gateAnim[key]=gateAnim[key]===undefined?tg:gateAnim[key]+(tg-gateAnim[key])*.12;const an=gateAnim[key];
 g.save();
 const rr=(a,b,c,e,r)=>{g.beginPath();g.roundRect(a,b,c,e,r)};
 // Nische
 rr(x+1,y+1,w-2,h-2,6);g.fillStyle='rgba(28,16,8,.55)';g.fill();
 const vert=h>=w,ix=x+4,iy=y+4,iw=w-8,ih=h-8;
 const vis=vert?ih*(1-an*.88):ih,vw=vert?iw:iw*(1-an*.88);
 if(vis>1&&vw>1){g.save();g.beginPath();g.rect(ix,iy,vert?iw:vw,vert?vis:ih);g.clip();
  const off=vert?-(ih-vis):0,offx=vert?0:-(iw-vw);
  g.translate(offx,off);
  // Bretter entlang der langen Achse
  const cross=vert?iw:ih,np=Math.max(2,Math.round(cross/13)),pw=cross/np;
  for(let i=0;i<np;i++){const bx=vert?ix+i*pw:ix,by=vert?iy:iy+i*pw,bw=vert?pw:iw,bh=vert?ih:pw;
   const gr=vert?g.createLinearGradient(bx,0,bx+bw,0):g.createLinearGradient(0,by,0,by+bh);const sh=hsh(x+i*7,y)*.12;
   gr.addColorStop(0,'#9a6330');gr.addColorStop(.5,'#b7773c');gr.addColorStop(1,'#80501f');g.fillStyle=gr;g.fillRect(bx,by,bw,bh);
   g.fillStyle='rgba(255,230,170,'+(.08+sh)+')';g.fillRect(bx,by,vert?2:bw,vert?bh:2);
   g.strokeStyle='rgba(46,26,10,.65)';g.lineWidth=1;g.strokeRect(bx+.5,by+.5,bw-1,bh-1);
   // Maserung
   g.strokeStyle='rgba(70,40,14,.3)';g.beginPath();
   if(vert){const m=bx+bw*(.3+hsh(i,y)*.4);g.moveTo(m,by+5);g.quadraticCurveTo(m+3,by+bh*.5,m-1,by+bh-5)}else{const m=by+bh*(.3+hsh(i,x)*.4);g.moveTo(bx+5,m);g.quadraticCurveTo(bx+bw*.5,m+3,bx+bw-5,m-1)}g.stroke();
   if(hsh(x+i,y+3)<.35){const kx=vert?bx+bw/2:bx+bw*(.2+hsh(i,y)*.6),ky=vert?by+bh*(.15+hsh(i,x)*.7):by+bh/2;g.fillStyle='rgba(60,34,12,.5)';g.beginPath();g.ellipse(kx,ky,2.4,3.2,0,0,7);g.fill()}}
  // Eisenbänder quer zur langen Achse
  const L=vert?ih:iw,ns=Math.max(1,Math.round(L/56));
  for(let i=0;i<ns;i++){const p=(i+.5)/ns*L,bx=vert?ix:ix+p-3.5,by=vert?iy+p-3.5:iy,bw=vert?iw:7,bh=vert?7:ih;
   const gr=vert?g.createLinearGradient(0,by,0,by+bh):g.createLinearGradient(bx,0,bx+bw,0);gr.addColorStop(0,'#6b727c');gr.addColorStop(.5,'#4a5059');gr.addColorStop(1,'#2c3036');g.fillStyle=gr;g.fillRect(bx,by,bw,bh);
   g.fillStyle='rgba(255,255,255,.3)';g.fillRect(bx,by,vert?bw:1.3,vert?1.3:bh);g.strokeStyle='rgba(18,20,24,.8)';g.lineWidth=1;g.strokeRect(bx+.5,by+.5,bw-1,bh-1);
   g.fillStyle='#b8c0c9';const n=Math.max(2,Math.round((vert?bw:bh)/16));for(let k=0;k<n;k++){const q=((k+.5)/n)*(vert?bw:bh);g.beginPath();g.arc(vert?bx+q:bx+bw/2,vert?by+bh/2:by+q,1.4,0,7);g.fill()}}
  // Edelstein-Platten, je ~120 px einer, mittig
  const ng=1;
  for(let i=0;i<ng;i++){const p=(i+.5)/ng*L,cx=vert?ix+iw/2:ix+p,cy=vert?iy+p:iy+ih/2;
   g.fillStyle='#3a3f46';g.beginPath();g.roundRect(cx-12,cy-12,24,24,5);g.fill();g.strokeStyle='#15171a';g.lineWidth=1;g.stroke();
   g.fillStyle=col;g.beginPath();g.moveTo(cx,cy-10);g.lineTo(cx+9,cy);g.lineTo(cx,cy+10);g.lineTo(cx-9,cy);g.closePath();g.fill();g.strokeStyle='rgba(0,0,0,.5)';g.stroke();
   g.fillStyle='rgba(255,255,255,.75)';g.fillRect(cx-3.5,cy-6,3,4);glanzFunkeln(cx-2,cy-3,5,x*.03+y+i*5)}
  // Weiche Tiefe: Licht von oben links
  const sg=g.createLinearGradient(ix,iy,ix+iw*.6,iy+ih*.6);sg.addColorStop(0,'rgba(255,240,200,.16)');sg.addColorStop(1,'rgba(20,10,0,.12)');g.fillStyle=sg;g.fillRect(ix,iy,iw,ih);
  g.restore()}
 // Rahmen in Verknüpfungs-Farbe, durchgehend um die ganze Tür
 rr(x+1.5,y+1.5,w-3,h-3,6);g.strokeStyle='rgba(34,20,8,.85)';g.lineWidth=3;g.stroke();
 // Eckbeschläge bei größeren Türen
 if(w>=80||h>=80){g.fillStyle='#4a5059';[[x+2,y+2],[x+w-12,y+2],[x+2,y+h-12],[x+w-12,y+h-12]].forEach(([a,b])=>{g.beginPath();g.roundRect(a,b,10,10,2);g.fill();g.strokeStyle='#15171a';g.lineWidth=.8;g.stroke();g.fillStyle='#b8c0c9';g.beginPath();g.arc(a+5,b+5,1.3,0,7);g.fill();g.fillStyle='#4a5059'})}
 if(an>.85){g.fillStyle='rgba(255,255,255,.0)'}
 g.restore()}

