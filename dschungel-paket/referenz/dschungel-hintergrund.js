// REFERENZ (nur zum Nachbauen, NICHT einfach einkopieren): so zeichnet die Vorschau den Dschungel-Hintergrund.
// Die Vorschau ist eine eigene Seite (Canvas). Alle Werte, Farben, Formen und die Zeichen-Reihenfolge stammen von hier.
// Koordinaten: Hintergrund wird in "Bild-Einheiten" gezeichnet (vt(): Boden-Unterkante BASE=720 unten, Zoom 0,85,
// sichtbare Breite VWW=1280/0,85, Höhe VHH=720/0,85). Ebenen wiederholen sich alle PER=2000 Einheiten.
// Funktionen/Konstanten, die hier nur benutzt werden (hex, SC, S, cv, g, ctx, camX, ...), gibt es im Spiel mit anderem Namen.
const P={night:false,rimC:'255,250,190',fog:'168,226,196',gl:'255,236,160'};
const fogH=toHex(P.fog.split(',').map(Number));
const show={xfar:1,far:1,riesen:1,stamm:1,samen:0,dach:1,nebel:1,lianen:1,mid:1,stems:1,strahl:0,near:1,dick:1,deko:1,muenz:0,obj:0,fig:0,leucht:0,wolken:0,vign:1,korn:0,seiten:0,bruch:0,unten:0,dens1:1,dens2:1,spk:1};
const PER=2000,LY={dens1:[],dens2:[],xfar:[],far:[],dach1:[],mid:[],stems:[],dach2:[],near:[]},LIA=[],MUSH=[],POOL=[];let TRK=null;
const BY=738,TY=-137;
let bgC,bgL,bgX,satK=1;const BOK=[];
const SEED=[];{const sr=rnd(123);[[0,24,5],[1,12,9],[2,6,17]].forEach(([c,n,sz])=>{for(let i=0;i<n;i++)SEED.push({c,x:sr()*VWW,y:BASE-VHH+60+sr()*(VHH-220),sz:sz*(.8+sr()*.5),ph:sr()*6.28,rot:sr()*6.28,v:.5+sr()*.7})})}

function rnd(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const toHex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mix=(a,b,t)=>{const x=hex(a),y=hex(b);return toHex(x.map((v,i)=>v+(y[i]-v)*t))};
const lin=(x0,y0,x1,y1,st)=>{const q=g.createLinearGradient(x0,y0,x1,y1);st.forEach(s=>q.addColorStop(s[0],s[1]));return q};
function glow(x,y,r,rgb,a){g.save();g.globalCompositeOperation='screen';const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba('+rgb+','+a+')');q.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=q;g.fillRect(x-r,y-r,2*r,2*r);g.restore()}
function wind(x,t){const gu=Math.max(0,Math.sin(t*.33));return windK*(.5*Math.sin(x*.006-t*1.25)+.3*Math.sin(x*.017-t*2.3+1.7)+.55*gu*gu*Math.sin(x*.004-t*1.6+.5)+.18)}
function jc(cw,ch){const c=document.createElement('canvas');c.width=Math.ceil(cw*SC);c.height=Math.ceil(ch*SC);return c}
function drawFrond(o,len,curve,cA,cB,nl,droop,lw){
  const bz=t=>{const u=1-t;return[2*u*t*curve*.15+t*t*curve,2*u*t*(-len*.62)+t*t*(-len*.92)+t*t*droop*len*.25]};
  o.lineCap='round';o.strokeStyle=cA;o.lineWidth=lw||2.2;o.beginPath();for(let i=0;i<=16;i++){const p=bz(i/16);i?o.lineTo(p[0],p[1]):o.moveTo(p[0],p[1])}o.stroke();
  for(let i=0;i<nl;i++){const t=.1+.9*i/(nl-1),p=bz(t),q=bz(Math.min(1,t+.03));let tx=q[0]-p[0],ty=q[1]-p[1];const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;
    const L=len*.34*Math.sin(Math.PI*Math.min(1,t*.8+.12))*(1-t*.25),col=mix(cA,cB,t);
    for(const sd of[-1,1]){let dx=-ty*sd+tx*.7,dy=tx*sd+ty*.7+.35;const dl=Math.hypot(dx,dy);dx/=dl;dy/=dl;
      const ex=p[0]+dx*L,ey=p[1]+dy*L,w=Math.max(1.2,L*.17),nx=-dy,ny=dx;
      o.fillStyle=col;o.beginPath();o.moveTo(p[0],p[1]);o.quadraticCurveTo(p[0]+dx*L*.5+nx*w,p[1]+dy*L*.5+ny*w,ex,ey);o.quadraticCurveTo(p[0]+dx*L*.5-nx*w,p[1]+dy*L*.5-ny*w,p[0],p[1]);o.fill()}}}
function frondSprite(len,curve,cA,cB,blur,nl,droop){const pad=Math.ceil(blur*3+8),cw=len*1.5+2*pad+Math.abs(curve),ch=len*1.15+2*pad,c=jc(cw,ch),o=c.getContext('2d');o.setTransform(SC,0,0,SC,(cw/2)*SC,(ch-pad)*SC);if(blur>.3)o.filter='blur('+(blur*SC)+'px)';drawFrond(o,len,curve,cA,cB,nl||18,droop||.2);return{c,sx:cw/2,sy:ch-pad,w:cw,h:ch}}
function palmSprite(h,curve,cT,cF,blur){const pad=Math.ceil(blur*3+8),fl=h*.42,cw=fl*2.6+2*pad+Math.abs(curve),ch=h+fl*.9+2*pad,c=jc(cw,ch),o=c.getContext('2d');o.setTransform(SC,0,0,SC,(cw/2)*SC,(ch-pad)*SC);if(blur>.3)o.filter='blur('+(blur*SC)+'px)';
  o.strokeStyle=cT;o.lineCap='round';o.lineWidth=Math.max(6,h*.028);o.beginPath();o.moveTo(0,0);o.quadraticCurveTo(curve*.1,-h*.55,curve,-h);o.stroke();
  o.save();o.translate(curve,-h);const r=rnd(Math.floor(h));for(let k=0;k<9;k++){const a=-1.45+k*.36;o.save();o.rotate(a*.8);drawFrond(o,fl*(.8+r()*.35),(a<0?-1:1)*fl*.55,mix(cF,'#000000',.35),cF,14,.5,2);o.restore()}o.restore();
  return{c,sx:cw/2,sy:ch-pad,w:cw,h:ch}}
function bananaSprite(len,W,curve,cA,cB,blur,seed){const pad=Math.ceil(blur*3+8),cw=len*1.3+2*pad+Math.abs(curve)*1.4+W,ch=len*1.1+2*pad,c=jc(cw,ch),o=c.getContext('2d');o.setTransform(SC,0,0,SC,(cw/2)*SC,(ch-pad)*SC);if(blur>.3)o.filter='blur('+(blur*SC)+'px)';
  const r=rnd(seed||5),bz=t=>{const u=1-t;return[2*u*t*curve*.1+t*t*curve,2*u*t*(-len*.7)+t*t*(-len*.9)]},hw=t=>W*Math.sin(Math.PI*Math.pow(t,.62))*(.55+.45*(1-t)),N=24,L=[],R=[];
  for(let i=0;i<=N;i++){const t=i/N,p=bz(t),q=bz(Math.min(1,t+.02)),tl=Math.hypot(q[0]-p[0],q[1]-p[1])||1,nx=-(q[1]-p[1])/tl,ny=(q[0]-p[0])/tl,w=hw(t);L.push([p[0]+nx*w,p[1]+ny*w]);R.push([p[0]-nx*w,p[1]-ny*w])}
  o.beginPath();L.forEach((p,i)=>i?o.lineTo(p[0],p[1]):o.moveTo(p[0],p[1]));for(let i=N;i>=0;i--)o.lineTo(R[i][0],R[i][1]);o.closePath();
  const gq=o.createLinearGradient(0,0,curve,-len);gq.addColorStop(0,cA);gq.addColorStop(1,cB);o.fillStyle=gq;o.fill();o.save();o.clip();
  o.strokeStyle='rgba(235,255,190,.16)';o.lineWidth=1;for(let i=2;i<N;i++){const p=bz(i/N);o.beginPath();o.moveTo(p[0],p[1]);o.lineTo(L[i+1][0],L[i+1][1]);o.moveTo(p[0],p[1]);o.lineTo(R[i+1][0],R[i+1][1]);o.stroke()}
  o.strokeStyle='rgba(235,255,190,.4)';o.lineWidth=2;o.beginPath();for(let i=0;i<=N;i++){const p=bz(i/N);i?o.lineTo(p[0],p[1]):o.moveTo(p[0],p[1])}o.stroke();
  o.globalCompositeOperation='destination-out';o.fillStyle='#000';for(let k=0;k<4;k++){const i=3+Math.floor(r()*(N-8)),sd=r()<.5?L:R,p=bz(i/N),a=sd[i],b=sd[i+2];o.beginPath();o.moveTo(a[0],a[1]);o.lineTo(b[0],b[1]);o.lineTo(p[0]+(a[0]-p[0])*.35,p[1]+(a[1]-p[1])*.35+4);o.closePath();o.fill()}
  o.restore();return{c,sx:cw/2,sy:ch-pad,w:cw,h:ch}}
function monsteraSprite(R,stem,curve,cA,cB,blur,seed){const pad=Math.ceil(blur*3+8),cw=R*2.4+2*pad+Math.abs(curve)*2,ch=stem+R*2.1+2*pad,c=jc(cw,ch),o=c.getContext('2d');o.setTransform(SC,0,0,SC,(cw/2)*SC,(ch-pad)*SC);if(blur>.3)o.filter='blur('+(blur*SC)+'px)';
  const r=rnd(seed||3);o.strokeStyle=mix(cA,'#000000',.2);o.lineWidth=Math.max(3,R*.05);o.lineCap='round';o.beginPath();o.moveTo(0,0);o.quadraticCurveTo(curve*.1,-stem*.6,curve,-stem);o.stroke();
  o.save();o.translate(curve,-stem);o.rotate(Math.max(-.7,Math.min(.7,curve/Math.max(60,stem))));
  o.beginPath();const n=64;for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,s=Math.sin(a*6.5),f=1-.3*Math.pow(Math.max(0,s),2)*(Math.abs(Math.cos(a))>.25?1:.2),rx=R*f*(1+.08*Math.cos(a)),ry=R*.92*f;const x=Math.sin(a)*rx,y=-Math.cos(a)*ry*1.0-R*.72+(Math.cos(a)>0?0:0);i?o.lineTo(x,y):o.moveTo(x,y)}o.closePath();
  const gq=o.createLinearGradient(-R,0,R*.6,-R*1.6);gq.addColorStop(0,cA);gq.addColorStop(1,cB);o.fillStyle=gq;o.fill();o.save();o.clip();
  o.strokeStyle='rgba(235,255,190,.32)';o.lineWidth=Math.max(1.4,R*.03);o.beginPath();o.moveTo(0,0);o.lineTo(0,-R*1.6);o.stroke();o.lineWidth=Math.max(1,R*.016);for(let k=1;k<7;k++){const y=-R*.22*k;o.beginPath();o.moveTo(0,y);o.lineTo(-R*.95,y-R*.34);o.moveTo(0,y);o.lineTo(R*.95,y-R*.34);o.stroke()}
  o.globalCompositeOperation='destination-out';o.fillStyle='#000';for(let k=0;k<5;k++){o.beginPath();o.ellipse((r()-.5)*R*1.1,-R*(.45+r()*.8),R*.06,R*.12,r()*3,0,7);o.fill()}
  o.restore();o.restore();return{c,sx:cw/2,sy:ch-pad,w:cw,h:ch}}
function heliSprite(h,curve,col,blur,seed){const pad=Math.ceil(blur*3+14),cw=120+2*pad+Math.abs(curve),ch=h+2*pad,c=jc(cw,ch),o=c.getContext('2d');o.setTransform(SC,0,0,SC,(cw/2)*SC,(ch-pad)*SC);if(blur>.3)o.filter='blur('+(blur*SC)+'px)';
  const bz=t=>{const u=1-t;return[2*u*t*curve*.1+t*t*curve,-h*t]};o.strokeStyle='#1c6a3a';o.lineWidth=4;o.lineCap='round';o.beginPath();for(let i=0;i<=14;i++){const p=bz(i/14);i?o.lineTo(p[0],p[1]):o.moveTo(p[0],p[1])}o.stroke();
  for(let k=0;k<6;k++){const t=.5+k*.085,p=bz(t),sd=k%2?1:-1,L=34-k*3.4;o.save();o.translate(p[0],p[1]);o.rotate(sd*(.9+k*.05));o.fillStyle=col[0];o.beginPath();o.moveTo(0,0);o.quadraticCurveTo(L*.45,-L*.28,L,0);o.quadraticCurveTo(L*.5,L*.38,0,0);o.fill();o.strokeStyle=col[1];o.lineWidth=2.2;o.beginPath();o.moveTo(L*.15,0);o.quadraticCurveTo(L*.5,-L*.2,L,0);o.stroke();o.restore()}
  const t0=bz(.12);o.save();o.translate(t0[0],t0[1]);o.rotate(-.5);o.fillStyle='#1f7a44';o.beginPath();o.ellipse(-26,-18,34,10,-.5,0,7);o.fill();o.restore();
  return{c,sx:cw/2,sy:ch-pad,w:cw,h:ch}}
function mushSprite(w,sh,seed){ // Riesen-Pflanze statt Riesenpilz
  const pad=40,cw=w*3.4+2*pad,ch=sh+w*2.4+2*pad,c=jc(cw,ch),o=c.getContext('2d');o.setTransform(SC,0,0,SC,(cw/2)*SC,(ch-pad)*SC);const sv=g;
  const parts=[bananaSprite(sh*.9,w*.5,-w*.9,mix('#1a6a3c',fogH,.22),mix('#6fc860',fogH,.3),3,seed),bananaSprite(sh*.8,w*.45,w*1.0,mix('#1a6a3c',fogH,.22),mix('#6fc860',fogH,.3),3,seed+1),monsteraSprite(w*.95,sh*.8,w*.15,mix('#155f36',fogH,.2),mix('#4fb858',fogH,.3),3,seed+2)];
  o.filter='none';parts.forEach(p=>o.drawImage(p.c,-p.sx,-p.sy,p.w,p.h));g=sv;return{c,sx:cw/2,sy:ch-pad,w:cw,h:ch}}
function mkTrunk(){const wB=170,wT=120,top=-170,bot=770,pad=70,cw=760,ch=bot-top+2*pad,c=jc(cw,ch),o=c.getContext('2d'),t1=jc(cw,ch),q=t1.getContext('2d'),r=rnd(88);q.setTransform(SC,0,0,SC,(cw/2)*SC,(pad-top)*SC);
 const L=y=>{const u=(y-top)/(bot-top);return wT+(wB-wT)*u+(u>.72?Math.pow((u-.72)/.28,1.5)*190:0)};
 q.beginPath();for(let y=top;y<=bot;y+=20)q.lineTo(-L(y)+Math.sin(y*.02)*6,y);for(let y=bot;y>=top;y-=20)q.lineTo(L(y)+Math.sin(y*.017+2)*6,y);q.closePath();
 const gq=q.createLinearGradient(-wB,0,wB,0);gq.addColorStop(0,'#9a8460');gq.addColorStop(.3,'#675238');gq.addColorStop(.7,'#3f301f');gq.addColorStop(1,'#241a10');q.fillStyle=gq;q.fill();q.save();q.clip();
 for(let i=0;i<70;i++){const x0=(-1+2*r())*wB*1.1,ph=r()*6,am=3+r()*9,fr=.004+r()*.008;q.strokeStyle='rgba(16,9,4,'+(.2+r()*.3)+')';q.lineWidth=2+r()*6;q.beginPath();for(let y=top;y<=bot;y+=24){const x=x0+Math.sin(y*fr+ph)*am;y==top?q.moveTo(x,y):q.lineTo(x,y)}q.stroke();q.strokeStyle='rgba(206,176,128,'+(.08+r()*.14)+')';q.lineWidth=1.5+r()*2;q.beginPath();for(let y=top;y<=bot;y+=24){const x=x0+4+Math.sin(y*fr+ph)*am;y==top?q.moveTo(x,y):q.lineTo(x,y)}q.stroke()}
 for(let i=0;i<52;i++){const x=-wB+r()*wB*1.2,y=top+r()*(bot-top),w=22+r()*64;const gg=q.createRadialGradient(x,y,0,x,y,w);gg.addColorStop(0,'rgba(70,150,60,.6)');gg.addColorStop(1,'rgba(70,150,60,0)');q.fillStyle=gg;q.beginPath();q.ellipse(x,y,w*.6,w,0,0,7);q.fill()}
 // Kletterlianen um den Stamm
 for(let k=0;k<5;k++){const y0=top+r()*500,ph=r()*6;q.strokeStyle='rgba(22,70,36,.85)';q.lineWidth=7+r()*4;q.lineCap='round';q.beginPath();for(let i=0;i<=30;i++){const y=y0+i*18,x=Math.sin(i*.45+ph)*wB*.9;i?q.lineTo(x,y):q.moveTo(x,y)}q.stroke();q.strokeStyle='rgba(120,200,110,.25)';q.lineWidth=2;q.stroke()}
 q.fillStyle='rgba('+P.fog+',.2)';q.fillRect(-wB*2,top,wB*4,bot-top);q.restore();
 // Farne am Stamm
 for(let i=0;i<7;i++){const y=top+120+r()*620,sd=r()<.5?-1:1;q.save();q.translate(sd*L(y)*.9,y);q.rotate(sd*(.9+r()*.5));drawFrond(q,70+r()*60,sd*30,'#14502c','#46a050',12,.4,2.4);q.restore()}
 o.filter='blur('+(7*SC)+'px)';o.drawImage(t1,0,0);return{c,cw,ch,pad,top}}
function makeLayers(){Object.values(LY).forEach(a=>a.length=0);LIA.length=MUSH.length=POOL.length=0;const r=rnd(21),sg=()=>r()<.5?-1:1,pt=(a,x,y,k,rot,s,amp)=>a.push({x,y,ph:r()*6.28,k,rot:rot||0,s,amp}),span=PER,pick=a=>a[Math.floor(r()*a.length)],T=(c,f)=>mix(c,fogH,f),mk=(n,f)=>Array.from({length:n},(_,i)=>f(i));
 // ganz fern: Palmen im Dunst
 const px=mk(6,i=>palmSprite(420+r()*280,sg()*(40+r()*70),T('#1f5a44',.5),T('#4fa87c',.5),11));
 for(let i=0;i<15;i++)pt(LY.xfar,i*span/15+(r()-.5)*70,BY,.5,0,pick(px),.01);
 // fern: Palmen/Bananen
 const pf=mk(5,i=>palmSprite(360+r()*220,sg()*(30+r()*60),T('#17513a',.32),T('#3f9e66',.34),8)),bf=mk(7,i=>bananaSprite(300+r()*180,60+r()*30,sg()*(30+r()*70),T('#14663a',.28),T('#6fcb68',.3),8,i+30));
 for(let i=0;i<10;i++)pt(LY.far,i*span/10+(r()-.5)*60,BY,.6,0,pick(pf),.014);for(let i=0;i<24;i++)pt(LY.far,i*span/24+(r()-.5)*40,BY,.6+r()*.4,sg()*.05,pick(bf),.02);
 // Dach: hängende Wedel und Blätter
 const dh1=mk(8,i=>frondSprite(220+r()*200,sg()*(50+r()*110),T('#1f6f48',.5),T('#7fd08c',.5),6,16,.3)),dh2=mk(8,i=>bananaSprite(200+r()*220,46+r()*22,sg()*(40+r()*90),T('#185c3a',.3),T('#6fc65c',.4),3.5,i+60)),dh3=mk(6,i=>frondSprite(130+r()*170,sg()*(40+r()*90),T('#145a36',.25),T('#62c056',.3),3,14,.3));
 for(let i=0;i<30;i++)pt(LY.dach1,i*span/30+(r()-.5)*50,TY-100,.6,Math.PI+sg()*(.05+r()*.14),pick(dh1),.014);
 for(let i=0;i<20;i++)pt(LY.dach2,i*span/20+(r()-.5)*70,TY-55,1,Math.PI+sg()*(.05+r()*.14),pick(i%3?dh2:dh3),.018);
 // Unterwuchs: Farne
 const f1=mk(10,i=>frondSprite(90+r()*120,sg()*(20+r()*60),'#1a6a3e',T('#6fd06a',.3),4.5,15,.35)),f2=mk(10,i=>frondSprite(70+r()*100,sg()*(16+r()*50),'#145a34',T('#58c050',.14),3,14,.35));
 for(let i=0;i<70;i++)pt(LY.dens1,i*span/70+(r()-.5)*30,BY,.7+r()*.4,0,pick(f1),.03);for(let i=0;i<64;i++)pt(LY.dens2,i*span/64+(r()-.5)*30,BY,.8+r()*.4,0,pick(f2),.035);
 // Mitte: Bananenblätter + Monstera
 const mb=mk(8,i=>bananaSprite(200+r()*130,52+r()*20,sg()*(30+r()*60),'#14603a',T('#6cd058',.08),4,i+90)),mm=mk(6,i=>monsteraSprite(60+r()*30,120+r()*110,sg()*(20+r()*50),'#145c34',T('#58c050',.1),3.6,i+120));
 for(let i=0;i<30;i++)pt(LY.mid,i*span/30+(r()-.5)*40,BY,.8+r()*.5,sg()*.06,pick(mb),.03);for(let i=0;i<10;i++)pt(LY.mid,60+i*(span-120)/10+r()*70,BY,.9,sg()*.08,pick(mm),.028);
 // Heliconien mit roten Blüten
 const hc=[['#e0402e','#f4c34a'],['#f08a2a','#f7e26a'],['#d8366a','#f6c25a']],hs=mk(9,i=>heliSprite(260+r()*190,sg()*(20+r()*40),hc[i%3],3,i));
 for(let i=0;i<18;i++)pt(LY.stems,i*span/18+(r()-.5)*50,BY,.9+r()*.4,sg()*.03,pick(hs),.034);
 // Vordergrund: dunkle, große Blätter
 const nb=mk(5,i=>bananaSprite(190+r()*110,50+r()*18,sg()*(30+r()*50),'#0c4a24',T('#4caa3c',.03),2,i+150)),nm=mk(4,i=>monsteraSprite(55+r()*25,60+r()*70,sg()*(14+r()*30),'#0b4422',T('#3c9c38',.03),1.8,i+170)),nf=mk(6,i=>frondSprite(110+r()*90,sg()*(20+r()*50),'#0c4a24',T('#48b03c',.03),2,14,.35));
 for(let i=0;i<22;i++)pt(LY.near,i*span/22+(r()-.5)*50,BY,.9+r()*.5,0,pick(nf),.04);for(let i=0;i<7;i++)pt(LY.near,90+i*(span-180)/7+r()*100,BY,1,sg()*.1,i%2?pick(nb):pick(nm),.045);
 // Dickicht (Boden-Kanten)
 for(let i=0;i<14;i++)POOL.push(frondSprite(40+r()*60,sg()*(10+r()*26),'#1a6a34',r()<.5?'#82e45a':'#5ccb52',.8,10,.3));for(let i=0;i<8;i++)POOL.push(monsteraSprite(22+r()*10,16+r()*14,sg()*8,'#1a6a34','#3fa850',.6,i+210));
 // Lianen
 for(let i=0;i<11;i++)LIA.push({x:i*PER/11+(r()-.5)*50,y:TY,len:110+r()*180,ph:r()*6,near:i%3==1,fl:r()<.65?(r()<.5?'255,120,170':'255,184,70'):null});
 [[300,150,340],[1150,125,380],[1720,160,430]].forEach(([x,w,sh],i)=>MUSH.push({x,s:mushSprite(w,sh,i+7)}));
 TRK=mkTrunk()}
function band(list,f,t){const off=camX*f;g.setTransform(S,0,0,S,0,cv.height-BASE*S);list.forEach(b=>{const s=b.s,a=b.rot+(wind(b.x,t)*b.amp+Math.sin(t*.7+b.ph)*.006)*b.k;const x=((b.x-off)%PER+PER)%PER;for(const xx of [x,x-PER]){if(xx<-s.w||xx>VWW+s.w)continue;g.save();g.translate(xx,b.y);g.rotate(a);g.drawImage(s.c,-s.sx,-s.sy,s.w,s.h);g.restore()}})}
function vt(){g.setTransform(S,0,0,S,0,cv.height-BASE*S)}
function wt(){g.setTransform(S,0,0,S,-camX*S,cv.height-BASE*S)}
function trunks(){vt();const off=camX*.38,PT=2600;[[800,1],[1950,-1]].forEach(([x0,fl])=>{let x=((x0-off)%PT+PT)%PT;for(const xx of [x,x-PT]){if(xx<-380||xx>VWW+380)continue;g.save();g.translate(xx,0);g.scale(fl,1);g.drawImage(TRK.c,-TRK.cw/2,TRK.top-TRK.pad,TRK.cw,TRK.ch);g.restore()}})}
function mushrooms(){vt();const off=camX*.3;MUSH.forEach(m=>{const x=((m.x-off)%PER+PER)%PER;for(const xx of [x,x-PER]){if(xx<-300||xx>VWW+300)continue;g.drawImage(m.s.c,xx-m.s.sx,BY-m.s.sy,m.s.w,m.s.h)}})}
function lianas(t,near){vt();const off=camX*(near?.8:.35);LIA.forEach(v=>{if(!!v.near!==near)return;const x=((v.x-off)%PER+PER)%PER;for(const xx of [x,x-PER]){if(xx<-60||xx>VWW+60)continue;drawLiana({...v,x:xx},t)}})}
function drawLiana(v,t){if(!show.lianen)return;const near=v.near,n=9,pts=[];for(let i=0;i<=n;i++){const k=i/n;pts.push([v.x+wind(v.x,t)*(near?26:18)*k*k+Math.sin(t*1.3+v.ph-i*.5)*4*k,v.y+i*v.len/n])}
 g.save();g.lineCap='round';g.lineJoin='round';const base=near?.6:.42,col=near?'#2a5e34':mix('#3a8a58',fogH,.4),hl=near?'#6fb25a':mix('#79c88a',fogH,.4);
 for(let i=1;i<=n;i++){const k=i/n;g.globalAlpha=base*Math.max(0,1-k*k*.9);g.strokeStyle=col;g.lineWidth=(near?6.5:5)*(1-k*.4);g.beginPath();g.moveTo(pts[i-1][0],pts[i-1][1]);g.lineTo(pts[i][0],pts[i][1]);g.stroke();g.strokeStyle=hl;g.lineWidth=(near?2.8:2.2)*(1-k*.35);g.beginPath();g.moveTo(pts[i-1][0]+1,pts[i-1][1]);g.lineTo(pts[i][0]+1,pts[i][1]);g.stroke()}
 pts.forEach((p,i)=>{if(i&&i%2==1){const k=i/n;g.save();g.globalAlpha=base*1.1*Math.max(0,1-k*k*.9);g.translate(p[0],p[1]);g.rotate((i%4==1?1:-1)*.9+Math.sin(t*1.8+i+v.ph)*.14);g.fillStyle=near?'#3f9a4c':mix('#62b873',fogH,.3);g.beginPath();g.moveTo(0,0);g.bezierCurveTo(6,-8,18,-8,22,0);g.bezierCurveTo(18,8,6,8,0,0);g.fill();g.restore()}});
 if(v.fl){const p=pts[6],k=6/n;g.save();g.globalAlpha=Math.max(0,base*1.2*(1-k*k*.9));g.translate(p[0],p[1]);const sw=Math.sin(t*1.5+v.ph)*.12;g.rotate(sw);for(let j=0;j<5;j++){g.save();g.rotate(-1.2+j*.6);g.fillStyle='rgba('+v.fl+',.95)';g.beginPath();g.ellipse(0,7,3.6,8,0,0,7);g.fill();g.restore()}g.fillStyle='#ffe27a';g.beginPath();g.arc(0,0,2.4,0,7);g.fill();g.restore()}
 g.restore()}
function drawBG(){const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;bgC=c;g=c.getContext('2d');vt();const Y0=BASE-VHH;
 g.fillStyle=lin(0,Y0,0,BASE,[[0,'#0b4a3a'],[.45,'#2f8a62'],[1,'#17613a']]);g.fillRect(0,Y0,VWW,VHH);glow(210,Y0-20,1000,'255,226,140',.75);glow(VWW+60,Y0-60,640,'190,255,200',.25);glow(VWW*.5,BASE-40,900,'60,160,110',.4);
 const rb=rnd(14);BOK.length=0;for(let i=0;i<22;i++)BOK.push({x:rb()*VWW,y:Y0+20+rb()*560,q:10+rb()*38,a:.06+rb()*.1,ph:rb()*6.28});g=ctx}
function rays(t,al){vt();const SX=300,SY=BASE-VHH-40;for(let i=0;i<9;i++){const a=.38+i*.135+Math.sin(t*.1+i*1.3)*.012,wd=.013+((i*53)%7)*.008,k=al*(.4+.6*Math.max(0,Math.sin(t*.4+i*1.9))),len=2500;
 [[2.6,.26],[1.5,.5],[.6,1]].forEach(([m,f])=>{g.save();g.globalCompositeOperation='screen';g.beginPath();g.moveTo(SX,SY);g.lineTo(SX+Math.cos(a-wd*m)*len,SY+Math.sin(a-wd*m)*len);g.lineTo(SX+Math.cos(a+wd*m)*len,SY+Math.sin(a+wd*m)*len);g.closePath();const q=g.createRadialGradient(SX,SY,0,SX,SY,2100);q.addColorStop(0,'rgba(255,248,200,'+k*f+')');q.addColorStop(.55,'rgba(255,240,182,'+k*f*.55+')');q.addColorStop(1,'rgba(255,236,170,0)');g.fillStyle=q;g.fill();g.restore()})}}
function mist(t,y,a){vt();for(let i=0;i<3;i++){const x=((t*7+i*700+y)%(VWW+800))-400;g.save();g.globalCompositeOperation='screen';const q=g.createRadialGradient(x,y,0,x,y,330);q.addColorStop(0,'rgba('+P.fog+','+(a+.03*Math.sin(t*.4+i))+')');q.addColorStop(1,'rgba('+P.fog+',0)');g.fillStyle=q;g.translate(x,y);g.scale(1,.3);g.translate(-x,-y);g.fillRect(x-330,y-330,660,660);g.restore()}}
function seeds(t,c){vt();SEED.forEach(s=>{if(s.c!==c)return;s.x+=(6+wind(s.x,t)*20)*dtG*s.v*(1+c*.4);s.y+=Math.sin(t*.7+s.ph)*7*dtG-1.2*dtG*s.v;s.rot+=dtG*.25;if(s.x>VWW+30){s.x=-30;s.y=BASE-VHH+60+Math.random()*(VHH-220)}if(s.y<BASE-VHH-20)s.y=BASE-120;
  g.save();g.translate(s.x,s.y+Math.sin(t*.9+s.ph)*10);g.rotate(s.rot*.4+Math.sin(t*.6+s.ph)*.4);g.globalAlpha=c==0?.55:c==1?.75:.9;glow(0,0,s.sz*2.4,'255,255,240',c==2?.22:.14);g.strokeStyle='rgba(255,255,250,.9)';g.fillStyle='rgba(255,255,255,.95)';g.lineWidth=Math.max(.6,s.sz*.07);g.lineCap='round';
  for(let k=0;k<14;k++){const a=k*.449;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*s.sz,Math.sin(a)*s.sz);g.stroke();g.beginPath();g.arc(Math.cos(a)*s.sz,Math.sin(a)*s.sz,s.sz*.07,0,7);g.fill()}
  g.strokeStyle='rgba(210,230,190,.9)';g.beginPath();g.moveTo(0,0);g.lineTo(-s.sz*.6,s.sz*1.1);g.stroke();g.restore()})}
function frame(now){const t=(now-T0)/1000*(reduce?.3:1),dt=Math.min(.05,(now-last)/1000||0);last=now;dtG=dt;g=ctx;
 if(auto){camX+=dt*230;if(camX>LW-VWW-40)camX=0;posEl.value=Math.round(camX/(LW-VWW)*1000)}
 const c0=Math.floor(camX/CHK),c1=Math.floor((camX+VWW)/CHK);let built=0;const vis=[];
 for(let ci=c0;ci<=c1;ci++)vis.push(chunk(ci));for(const ci of [c0-1,c1+1]){if(!built&&ci>=0&&!CH_.has(ci)){chunk(ci);built=1}}
 g=ctx;g.setTransform(1,0,0,1,0,0);g.drawImage(bgC,0,0);vt();BOK.forEach(b=>{const x=b.x+Math.sin(t*.15+b.ph)*16,y=b.y+Math.cos(t*.11+b.ph*1.7)*11;g.fillStyle='rgba('+P.gl+','+b.a+')';g.beginPath();g.arc(x,y,b.q,0,7);g.fill();g.strokeStyle='rgba('+P.gl+',.18)';g.lineWidth=1.2;g.stroke()});g=bgX;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,bgL.width,bgL.height);
 if(show.xfar)band(LY.xfar,.12,t);if(show.far)band(LY.far,.25,t);if(show.strahl)rays(t,.2);if(show.riesen)mushrooms();if(show.stamm)trunks();if(show.dens1)band(LY.dens1,.38,t);if(show.samen)seeds(t,0);if(show.dach)band(LY.dach1,.25,t);if(show.nebel)mist(t,430,.05);if(show.lianen)lianas(t,false);if(show.mid)band(LY.mid,.5,t);if(show.dens2)band(LY.dens2,.56,t);if(show.stems)band(LY.stems,.62,t);if(show.nebel)mist(t,560,.07);if(show.samen)seeds(t,1);if(show.dach)band(LY.dach2,.5,t);if(show.near)band(LY.near,.8,t);if(show.lianen)lianas(t,true);
  wt();if(show.dick)vis.forEach(k=>k.thick.forEach(b=>{if(b.x<camX-80||b.x>camX+VWW+80)return;const s=b.s,a=b.rot+(wind(b.x,t)*b.amp+Math.sin(t*.9+b.ph)*.008);g.save();g.translate(b.x,b.y);g.rotate(a);g.drawImage(s.c,-s.sx,-s.sy,s.w,s.h);g.restore()}));
 g=ctx;g.setTransform(1,0,0,1,0,0);g.globalAlpha=satK;g.drawImage(bgL,0,0);g.globalAlpha=1;wt();
 vis.forEach(k=>g.drawImage(k.c,k.x0-4,YT,CHK+8,YB-YT));
 movers(t);
 if(show.deko)vis.forEach(k=>{const ok=f=>!(f&&f.x!=null&&f.y!=null&&underSp(f.x,f.y));k.fine.filter(ok).forEach(f=>drawTuft(f,t));k.tufts.filter(ok).forEach(f=>drawTuft(f,t));k.agaves.filter(ok).forEach(a=>drawAgave(a,t));k.flowers.filter(ok).forEach(f=>drawFlower(f,t))});
 if(show.obj||show.spk||show.muenz)objects(t,show.muenz,show.obj,show.spk);
 if(show.fig){fig('monkey',LV.sm[0],LV.sm[1],46,t,0);fig('pig',LV.sf[0],LV.sf[1],46,t,1.5)}
 if(show.samen)seeds(t,2);vt();motes.forEach(m=>{m.x+=(8+wind(m.x,t)*24)*dt*m.v;m.y+=Math.sin(t*.8+m.ph)*5*dt-1.2*dt;if(m.x>VWW+8)m.x=-8;if(m.y<BASE-VHH-8)m.y=BASE+8;const p=.5+.5*Math.sin(t*1.2+m.ph*3);if(m.b){if(show.leucht)glow(m.x,m.y,26+m.r*6,P.gl,.16+.1*p)}else{g.fillStyle='rgba(255,252,210,'+(.25+.5*p)+')';g.beginPath();g.arc(m.x,m.y,m.r,0,7);g.fill()}});
 if(show.vign){g.setTransform(S,0,0,S,0,0);const vg=g.createRadialGradient(VWW/2,VHH/2,VWW*.32,VWW/2,VHH/2,VWW*.78);vg.addColorStop(0,'rgba(2,36,22,0)');vg.addColorStop(1,'rgba(2,34,20,.5)');g.fillStyle=vg;g.fillRect(0,0,VWW,VHH)}
 if(show.korn){g.save();g.globalCompositeOperation='overlay';g.globalAlpha=.08;g.setTransform(1,0,0,1,0,0);const pat=g.createPattern(grainP,'repeat');g.translate(Math.floor(Math.random()*100),Math.floor(Math.random()*100));g.fillStyle=pat;g.fillRect(-100,-100,cv.width+100,cv.height+100);g.restore()}
 if(CH_.size>9){const mid=Math.floor((camX+VWW/2)/CHK);[...CH_.keys()].forEach(k=>{if(Math.abs(k-mid)>4)CH_.delete(k)})}
 requestAnimationFrame(frame)}
