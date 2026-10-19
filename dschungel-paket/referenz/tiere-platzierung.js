/* =====================================================================
   REFERENZ: Tiere & Deko-Platzierung (Vorschau-Code, nicht direkt einkopieren)
   =====================================================================
   Die Zeichen-/Verhaltensfunktionen der Tiere (Frosch, Schnecke, Pilz, Knospe, Faultier, Fledermaus,
   Schmetterling, Glühwürmchen, Vögel) gibt es im Spiel schon (js/20-tiere.js, js/17-deko.js).
   Hier ist nur das NEUE: Platzierung (DK.build), Vogel-Verhalten (DK.updBirds), Nacht-Leuchten (DK.glow)
   und die dezenten Hintergrund-Tiere (BA.*: Schnecken am Stamm, ferne Schmetterlinge/Nachtfalter,
   Fledermäuse nachts). BA.B zeichnet etwas in eine kleine Zwischenfläche und blendet es weich ein,
   damit Hintergrund-Tiere genauso unscharf sind wie das, worauf sie laufen.
   Schlangen und Geckos sind bewusst NICHT dabei (verworfen).
   Tests-Hilfe der Vorschau (#tag!30 = Zeit verschieben) gehört nicht ins Spiel.
   ===================================================================== */
var BA={};
DK.build=function(){const N=TZ.isN();DK.cr=[];DK.birds=[];
 const CT={ground:[['frog',.018],['snail',.03],['mush',.035],['bud',.04]],air:N?'firefly':'butterfly',airCols:N?['#d8ff6a']:['#7ec8ff','#ff9ecb','#ffd166','#b69cff'],hanging:N?'bat':'sloth',mushGlow:N};
 const nearStart=x=>Math.abs(x-LV.sm[0])<200;const last={};let sinceBird=380,slot=0,lastG=-1e9,lastH=-1e9;const boxFree=(x,y)=>{for(const o of LV.solids){if(x+34>o[0]&&x-34<o[0]+o[2]&&y-46<o[1]+o[3]&&y-2>o[1])return false}return true};
 const gr=LV.solids.filter(s=>s[4]==='g').map(s=>({x:s[0],y:s[1],w:s[2],h:s[3]})).sort((a,b)=>a.x-b.x||a.y-b.y);
 for(const s of gr){
  for(let cx=s.x;cx<s.x+s.w;cx+=40){
   if(dkSolidAt(cx+20,s.y-2)||s.y<40)continue;const mid=cx+20,r=dkHash(cx+5,s.y+9),far=k=>!last[k]||Math.abs(last[k]-mid)>(k==='fly'?800:(k==='frog'||k==='snail')?1400:420);if(nearStart(mid))continue;
   let acc=0,kind=null;for(const [k,w] of CT.ground){acc+=w;if(r<acc){kind=k;break}}
   if(kind&&(Math.abs(mid-lastG)<650||mid<s.x+45||mid>s.x+s.w-45||!boxFree(mid,s.y)))kind=null;
   if(N&&kind==='frog')kind='snail';
   if(kind==='frog'&&far('frog')){last.frog=mid;DK.cr.push({kind:'frog',x:mid,y:s.y,home:mid,minX:s.x+10,maxX:s.x+s.w-10,dir:r<.035?-1:1,hop:null,t:Math.random()*5000,nextCroak:3+Math.random()*8})}
   else if(kind==='snail'&&far('snail')&&s.w>=120){last.snail=mid;DK.cr.push({kind:'snail',x:mid,y:s.y,minX:s.x+8,maxX:s.x+s.w-8,dir:1,hide:0})}
   else if(kind==='mush'&&far('mush')){last.mush=mid;DK.cr.push({kind:'mush',x:mid+(r*40%14)-7,y:s.y,squish:0,lastT:0,big:r*7%1<.5,glowCap:CT.mushGlow?(r*13%1<.5?'#6af0ff':'#c08aff'):null,glow:CT.mushGlow?60:0})}
   else if(kind==='bud'&&far('bud')){last.bud=mid;DK.cr.push({kind:'bud',x:mid,y:s.y,open:0,target:0,col:r*7%1<.5?'#ff7eb0':'#ffb347'})}
   if(kind&&DK.cr.length&&DK.cr[DK.cr.length-1].x!==undefined&&Math.abs(DK.cr[DK.cr.length-1].x-mid)<20){lastG=mid;DK.cr[DK.cr.length-1].pl=[s.x+45,s.x+s.w-45]}
   const rb=dkHash(cx+77,s.y+31);
   if(rb<.07&&far('fly')&&!dkSolidAt(mid,s.y-50)&&!dkSolidAt(mid-30,s.y-50)&&!dkSolidAt(mid+30,s.y-50)){last.fly=mid;DK.cr.push({kind:CT.air,hx:mid,hy:s.y-50,x:mid,y:s.y-50,ph:r*100,flee:0,gold:false,found:false,glow:CT.air==='firefly'?70:0,col:CT.airCols[Math.floor(rb*1000)%CT.airCols.length]})}
  }
  if(slot<8&&s.w>=120&&s.y>120){const ux=s.x+s.w*.5;if(Math.abs(ux-lastH)>1300&&!dkSolidAt(ux,s.y+s.h+4)&&!dkSolidAt(ux,s.y+s.h+70)&&dkHash(s.x,s.y)<.5){slot++;lastH=ux;
   DK.cr.push(CT.hanging==='bat'?{kind:'bat',x:ux,y:s.y+s.h,hx:ux,hy:s.y+s.h,state:'hang',t:0,vx:0,vy:0,ph:Math.random()*9}:{kind:'sloth',x:ux,y:s.y+s.h,awake:0,wave:0,found:false})}}
 }
 // Dekoration am Boden (Agaven, Blumen, Leuchtpflanzen): Tiere stehen nur in den Lücken dazwischen
 const decor=[];try{for(let ci=0;ci*CHK<LW+CHK;ci++){const rc=chunk(ci);(rc.agaves||[]).forEach(a=>decor.push({x:a.x,y:a.y,r:36}));(rc.flowers||[]).forEach(a=>decor.push({x:a.x,y:a.y,r:24}))}}catch(e){}
 if(N&&TZ.pw)TZ.pw.forEach(p=>decor.push({x:p.wx,y:p.wy,r:58}));
 const bad=(x,y,r0)=>decor.some(d=>Math.abs(d.x-x)<d.r+r0&&Math.abs(d.y-y)<70);
 DK.cr.forEach(c=>{if(!c.pl||!bad(c.x,c.y,16))return;let ok=false;for(let d=50;d<=450&&!ok;d+=40)for(const sd of [1,-1]){const nx=c.x+sd*d;if(nx<c.pl[0]||nx>c.pl[1]||bad(nx,c.y,16)||!boxFree(nx,c.y)||DK.cr.some(o=>o!==c&&o.pl&&Math.abs(o.x-nx)<400&&Math.abs(o.y-c.y)<80))continue;const dx=nx-c.x;c.x=nx;if(c.home!==undefined)c.home=nx;if(c.minX!==undefined){c.minX+=dx;c.maxX+=dx}ok=true;break}if(!ok)c.drop=true});
 DK.cr=DK.cr.filter(c=>!c.drop);
 // Läufer (Frosch, Schnecke) bleiben auf freier Strecke: nie durch Stufen/Blöcke laufen
 for(const c of DK.cr){if(c.minX===undefined)continue;let lo=c.x,hi=c.x;while(lo>c.minX&&!dkSolidAt(lo-8,c.y-6)&&!bad(lo-8,c.y,14))lo-=8;while(hi<c.maxX&&!dkSolidAt(hi+8,c.y-6)&&!bad(hi+8,c.y,14))hi+=8;c.minX=Math.max(c.minX,lo+6);c.maxX=Math.min(c.maxX,hi-6);if(c.minX>c.maxX)c.minX=c.maxX=c.x}
 DK.cr=DK.cr.filter(c=>!(c.minX!==undefined&&c.maxX-c.minX<70));
 // Sitzplätze für Vögel: Oberseiten aller festen Flächen (Boden und Wände), nicht an der Decke hängend
 DK.perches=[];for(const s of LV.solids){if(s[2]<48||s[1]<40)continue;for(let x=s[0]+24;x<=s[0]+s[2]-24;x+=70){if(dkSolidAt(x,s[1]-2))continue;DK.perches.push({x,y:s[1]})}}
 const pals=N?[{body:'#8a6a4a',belly:'#e8d8b8',wing:'#6a4e36',beak:'#f0b030',owl:true},{body:'#9a9aa8',belly:'#f0f0f6',wing:'#70707e',beak:'#f0b030',owl:true}]:[{body:'#3fa7e0',belly:'#cdeeff',wing:'#2a7fb5',beak:'#ffb02e'},{body:'#e8574a',belly:'#ffd9c2',wing:'#b83a30',beak:'#ffcf3a'},{body:'#ffcc33',belly:'#fff4c8',wing:'#e09a00',beak:'#ff8c3a'},{body:'#5cc27a',belly:'#e2f7d0',wing:'#3a9a58',beak:'#ffb02e'}];
 // je 560 px ein Vogel, bevorzugt auf der höchsten Fläche im Abschnitt (oberer Bereich)
 for(let x0=0,bi=0;x0<7600;x0+=900,bi++){let best=null;for(const q of DK.perches){if(q.x<x0||q.x>=x0+900||nearStart(q.x))continue;if(!best||q.y<best.y-10)best=q}
  if(best&&!DK.birds.some(b=>Math.abs(b.homeX-best.x)<40&&Math.abs(b.homeY-best.y)<10))DK.birds.push({x:best.x,y:best.y,homeX:best.x,homeY:best.y,pal:pals[bi%pals.length],dir:bi%2?-1:1,state:'sit',t:0,vx:0,vy:0,flap:0,hop:0,peck:0,tx:null})}
 DK.on=true};
DK.updBirds=function(dt){for(const b of DK.birds){
  if(b.state==='sit'){b.t+=dt;if(b.hop>0)b.hop-=dt;if(b.peck>0)b.peck-=dt;
   if(b.hop<=0&&b.peck<=0&&Math.random()<.006){if(Math.random()<.5)b.peck=380;else{b.hop=280;if(Math.random()<.4)b.dir=-b.dir}}
   const p=null; // Vögel fliegen nicht weg
   if(p){const c=DK.perches.filter(q=>Math.abs(q.x-b.x)>150&&Math.abs(q.x-b.x)<800&&Math.abs(q.y-b.y)<460&&!(Math.abs(q.x-p.x)<190&&Math.abs(q.y-p.y)<150)&&!DK.birds.some(o=>o!==b&&Math.abs((o.tx!=null?o.tx:o.homeX)-q.x)<70&&Math.abs((o.tx!=null?o.ty:o.homeY)-q.y)<12));
    if(c.length){const q=c[Math.floor(Math.random()*c.length)];b.state='fly';b.sx=b.x;b.sy=b.y;b.tx=q.x;b.ty=q.y;b.k=0;b.dur=Math.max(1100,Math.hypot(q.x-b.x,q.y-b.y)*3.4);b.dir=q.x>b.x?1:-1}
    else{b.state='fly';b.tx=null;b.dir=b.x-p.x>=0?1:-1;b.vx=b.dir*(2.4+Math.random()*1.2);b.vy=-3.2-Math.random()*1.2;b.t=0}}}
  else if(b.state==='fly'){
   if(b.tx!=null){b.k+=dt/b.dur;const k=Math.min(1,b.k),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;b.flap+=.55*(1-k*.55);b.x=b.sx+(b.tx-b.sx)*e;b.y=b.sy+(b.ty-b.sy)*e-Math.sin(k*Math.PI)*Math.min(90,40+Math.abs(b.tx-b.sx)*.12);
    if(k>=1){b.state='sit';b.homeX=b.x=b.tx;b.homeY=b.y=b.ty;b.tx=null;b.t=0;b.hop=0;b.peck=0}}
   else{b.t+=dt;b.flap+=.55;b.vy=Math.max(-5.5,b.vy-.05);b.vx*=1.004;b.x+=b.vx;b.y+=b.vy+Math.sin(b.flap)*.6;if(b.y<-80||b.t>4000){b.state='gone';b.t=0}}}
  else{b.t+=dt;if(b.t>9000&&!dkNear(b.homeX,b.homeY,700,600)){b.state='sit';b.x=b.homeX;b.y=b.homeY;b.t=0}}}};
DK.draw=function(t){if(!show.tiere)return;if(!DK.on)DK.build();wt();const dt=Math.min(100,(dtG||.016)*1000);dkUpdate(dt);DK.updBirds(dt);const tm=performance.now();
  for(const c of DK.cr){const x=c.x;if(x<camX-60||x>camX+VWW+60)continue;ctx.save();
   if(c.kind==='butterfly')dkDrawButterfly(c,x,tm);else if(c.kind==='frog')dkDrawFrog(c,x,tm);else if(c.kind==='snail')dkDrawSnail(c,x,tm);else if(c.kind==='mush')dkDrawMushroom(c,x);else if(c.kind==='bud')dkDrawBud(c,x,tm);else if(c.kind==='sloth')dkDrawSloth(c,x,tm);else if(c.kind==='firefly')dkDrawFirefly(c,x,tm);else if(c.kind==='lizard')dkDrawLizard(c,x,tm);else if(c.kind==='bat'){if(c.state!=='gone')dkDrawBat(c,x,tm)}
   ctx.restore()}
  dkDrawBirds()};
// Nacht: leuchtende Tiere (nach der Abdunklung)
DK.glow=function(t){if(!show.tiere||!TZ.isN()||!DK.on)return;wt();const g2=ctx;g2.save();g2.globalCompositeOperation='lighter';
  const halo=(x,y,r,col,a)=>{const q=g2.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba('+col+','+a+')');q.addColorStop(1,'rgba('+col+',0)');g2.fillStyle=q;g2.fillRect(x-r,y-r,2*r,2*r)};
  const dot=(x,y,r,col,a)=>{g2.fillStyle='rgba('+col+','+a+')';g2.beginPath();g2.arc(x,y,r,0,7);g2.fill()};
  for(const c of DK.cr){const x=c.x;if(x<camX-60||x>camX+VWW+60)continue;
   if(c.kind==='frog'){const s=1.35*c.dir,y=c.y+(c.jy||0);halo(x,y-8,22,'110,255,230',.16);[[-3,-11],[1,-13],[4,-10],[-6,-8]].forEach(([a,b])=>dot(x+a*s,y+b*1.35,1.5,'140,255,235',.8))}
   else if(c.kind==='snail'){const s=1.25*c.dir;halo(x-1*s,c.y-10,18,'110,230,255',.2);g2.strokeStyle='rgba(160,250,255,.6)';g2.lineWidth=1.1;g2.beginPath();for(let a=0;a<Math.PI*4;a+=.3){const rr=1+a*.5;g2.lineTo(x+(-1+Math.cos(a)*rr)*s,c.y+(-8+Math.sin(a)*rr)*1.25)}g2.stroke()}
   else if(c.kind==='bud'){halo(x,c.y-22,24,c.col.replace('#','').match(/../g).map(h=>parseInt(h,16)).join(','),.22)}
   else if(c.kind==='mush'&&c.glowCap){const k=c.glowCap==='#6af0ff'?'106,240,255':'192,138,255';halo(x,c.y-12,42,k,.2)}}
  for(const b of DK.birds){if(b.state==='gone'||!b.pal.owl)continue;if(b.x<camX-40||b.x>camX+VWW+40)continue;halo(b.x+6*b.dir,b.y-16,10,'255,215,90',.18)}
  g2.restore()};
// ---- dezente Tiere im Hintergrund ----
BA.B=function(bx,by,w,h,blur,fn){const cw=Math.ceil(w*S),ch=Math.ceil(h*S);let c=BA._c;if(!c)c=BA._c=document.createElement('canvas');if(c.width<cw||c.height<ch){c.width=Math.max(c.width,cw);c.height=Math.max(c.height,ch)}
 const c2=c.getContext('2d');c2.setTransform(1,0,0,1,0,0);c2.clearRect(0,0,c.width,c.height);c2.setTransform(S,0,0,S,-bx*S,-by*S);const sv=g;g=c2;try{fn()}finally{g=sv}
 sv.save();sv.setTransform(1,0,0,1,0,0);sv.filter='blur('+(blur*S)+'px)';sv.drawImage(c,0,0,cw,ch,bx*S,by*S+cv.height-BASE*S,cw,ch);sv.restore()};
// Schnecken klettern senkrecht den Stamm hoch
BA.snailT=function(t){if(typeof TRK==='undefined'||!TRK)return;const N=TZ.isN(),off=camX*.38,PT=2600;
 [[800,1,90,0,60],[800,1,120,50,-70],[1950,-1,100,20,50]].forEach(([x0,fl,per,so,dx])=>{const u=((t+so)%per)/per;if(u>.8)return;const y=618-(u/.8)*560,x=((x0-off)%PT+PT)%PT;
  for(const xx of [x,x-PT]){if(xx<-300||xx>VWW+300)continue;const px=xx+dx*fl+Math.sin(y*.03)*5;
   BA.B(px-32,y-32,64,64,3.5,()=>{g.save();g.translate(px,y);g.rotate(-Math.PI/2);g.scale(1.7,1.7);
    g.fillStyle=N?'rgba(24,76,84,.95)':'rgba(190,160,126,.9)';g.beginPath();g.ellipse(3,-2.5,11,3,0,0,7);g.fill();
    g.strokeStyle=g.fillStyle;g.lineWidth=1.2;for(const [ax,ay] of [[12,-9],[9,-8]]){g.beginPath();g.moveTo(9,-3);g.lineTo(ax,ay);g.stroke()}
    g.fillStyle=N?'rgba(30,96,108,.95)':'rgba(168,96,58,.92)';g.beginPath();g.arc(-1,-8,7.5,0,7);g.fill();
    g.strokeStyle=N?'rgba(140,250,255,.8)':'rgba(110,64,40,.8)';g.lineWidth=1.1;g.beginPath();for(let a=0;a<Math.PI*4;a+=.3){const rr=1+a*.5;g.lineTo(-1+Math.cos(a)*rr,-8+Math.sin(a)*rr)}g.stroke();
    if(N){g.globalCompositeOperation='lighter';const q=g.createRadialGradient(-1,-8,0,-1,-8,22);q.addColorStop(0,'rgba(110,235,255,.3)');q.addColorStop(1,'rgba(110,235,255,0)');g.fillStyle=q;g.fillRect(-24,-30,48,44)}
    g.restore()})}})};
// Vögel (Tag) bzw. Fledermäuse (Nacht) im oberen Bereich, weit hinten
BA.sky=function(t){const N=TZ.isN();if(!N)return;const Y0=BASE-VHH,off=camX*.12;
 for(let i=0;i<5;i++){const sp=20+i*6,y=Y0+50+((i*83)%230)+Math.sin(t*.6+i)*10,xb=(((i*PER/5+t*sp)-off)%PER+PER)%PER-60,ph=i*2.3,f=Math.sin(t*(N?9:6)+ph);
  for(const xx of [xb,xb-PER]){if(xx<-60||xx>VWW+60)continue;
   BA.B(xx-30,y-26,60,52,2.4,()=>{g.save();g.translate(xx,y);g.scale(1.3,1.3);
    if(N){g.fillStyle='rgba(8,20,48,.9)';for(const sd of [-1,1]){g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(sd*8,-9*f-2,sd*17,-3*f);g.lineTo(sd*12,3);g.lineTo(sd*8,1);g.lineTo(sd*5,4);g.closePath();g.fill()}
     g.beginPath();g.ellipse(0,1,4,5,0,0,7);g.fill();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,215,90,.9)';g.beginPath();g.arc(-1.6,-.5,1,0,7);g.arc(1.6,-.5,1,0,7);g.fill()}
    else{g.fillStyle='rgba(38,86,70,.8)';g.beginPath();g.ellipse(0,0,6,3.4,0,0,7);g.fill();g.beginPath();g.arc(6,-1.5,2.6,0,7);g.fill();g.fillStyle='rgba(255,200,80,.85)';g.beginPath();g.moveTo(8.4,-1.8);g.lineTo(11,-1);g.lineTo(8.4,-.2);g.fill();
     g.fillStyle='rgba(38,86,70,.8)';g.beginPath();g.moveTo(-1,-1);g.quadraticCurveTo(-3,-9*f-3,-11,-7*f-2);g.quadraticCurveTo(-5,-1,-1,1);g.fill();g.beginPath();g.moveTo(-6,0);g.lineTo(-13,-1);g.lineTo(-12,2);g.fill()}
    g.restore()})}}};
BA.fly=function(t){const N=TZ.isN(),off=camX*.45,cols=['#ffd166','#ff9ecb','#7ec8ff','#b69cff'];
 for(let i=0;i<8;i++){const ph=i*1.9,bx=i*PER/8+120,x=(((bx-off)+Math.sin(t*.22+ph)*150)%PER+PER)%PER,y=-50+((i*97)%520)+Math.sin(t*.5+ph)*46,fl=Math.abs(Math.sin(t*(N?7:9)+ph));
  for(const xx of [x,x-PER]){if(xx<-30||xx>VWW+30)continue;BA.B(xx-30,y-30,60,60,1.4,()=>{g.save();g.translate(xx,y);g.rotate(Math.sin(t*.8+ph)*.3);
   if(N){g.globalCompositeOperation='lighter';const q=g.createRadialGradient(0,0,0,0,0,26);q.addColorStop(0,'rgba(170,250,255,.22)');q.addColorStop(1,'rgba(170,250,255,0)');g.fillStyle=q;g.fillRect(-26,-26,52,52)}
   g.globalAlpha=N?.8:.7;for(const sd of [-1,1]){g.save();g.scale(sd*(.25+.75*fl),1);g.fillStyle=N?'rgba(200,250,255,.9)':cols[i%4];g.beginPath();g.ellipse(4,-2,5,3.4,-.5,0,7);g.fill();g.beginPath();g.ellipse(3,2.5,3.2,2.4,.5,0,7);g.fill();g.restore()}
   g.fillStyle=N?'rgba(230,255,255,.9)':'rgba(60,45,45,.8)';g.beginPath();g.ellipse(0,0,1,3.6,0,0,7);g.fill();g.restore()})}}};
// Schlangen und Geckos vorerst abgeschaltet
