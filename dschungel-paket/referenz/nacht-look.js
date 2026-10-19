/* =====================================================================
   REFERENZ: Dschungel-NACHT (Vorschau-Code, nicht direkt einkopieren)
   =====================================================================
   Stand: von Leon abgenommen. Alles hier ist Absicht (Farben, Zahlen, Reihenfolge).
   Kürzel in diesem Code -> im Spiel anders benannt:
     g / ctx / bgX   = Zeichenfläche (im Spiel: die jeweilige Ebenen-/Haupt-Fläche)
     vt()            = Bildschirm-Koordinaten (Bild-Einheiten, Ebenen, Zoom 0,85)
     wt()            = Welt-Koordinaten (mit Kamera camX)
     S, cv, camX, BASE, VHH, VWW, PER(=2000), BY, wind(x,t), glow(x,y,r,rgb,a), MUSH, TRK, LV.solids
     P.fog / P.gl    = Dunst- und Lichtstaub-Farbe (hier nachts umgeschaltet)
   Wichtige Stellen (im Vorschau-Code über Einhak-Punkte in frame() eingebaut):
     TZ.sky         direkt nach dem Hintergrund-Verlauf (dunkler Grund hinter allen Ebenen)
     TZ.tintOn      färbt die Ebenen um (Farbton + Kontrast + Abdunkeln) – in der Vorschau pro Bild;
                    IM SPIEL BITTE EINMAL BEIM VORZEICHNEN MACHEN, nicht pro Bild (Leistung!)
     TZ.splitA      Riesenblätter: Leucht-Füllung + Adern (konstant, KEIN Pulsieren)
     TZ.bg          Lichtschäfte, Lichtflecken am Stamm, Stamm-Pilze, Bodennebel, ferne Leuchtpflanzen
     TZ.dark        Abdunklung + Leuchtpflanzen am Boden + Glühwürmchen
     TZ.figGlow     Boden/Figuren: sanftes kühles Licht um die Figuren
   NICHT übernehmen (bewusst verworfen): Mondstrahlen, blinkende/bunte Lichter, Lichterketten,
   pulsierende Blätter, Palmen-/Hügel-Silhouetten, Himmel-Streifen, Bokeh-Kreise nachts, Flechten im Boden.
   ===================================================================== */
var TZ={mode:(location.hash||'#tag').slice(1).split('!')[0]};
(function(){
 const R=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(11);
 const COLS=['70,225,235','70,225,235','70,225,235','100,205,255','125,150,255'];
 TZ.isN=()=>TZ.mode==='nacht';
 // Stern- und Leuchtpflanzen-Daten (einmal, feste Zufallszahlen)
 TZ.stars=[];for(let i=0;i<120;i++)TZ.stars.push([R(),R()*.5,.6+R()*1.5,R()*9]);
 TZ.pl=[];TZ.pw=[];{let lk=0;const cov=(wx0,sl)=>LV.solids.some(o=>o!==sl&&wx0>o[0]-14&&wx0<o[0]+o[2]+14&&sl[1]-6>=o[1]&&sl[1]-6<=o[1]+o[3]);(typeof LV!=='undefined'&&LV.solids||[]).forEach(sl=>{if(sl[4]!=='g'||sl[2]<60||sl[1]<=40)return;const big=sl[2]>400;let x=sl[0]+(big?40+R()*260:sl[2]*(.3+R()*.4));const lim=sl[0]+sl[2]-30;let cnt=0;while(x<lim&&cnt<(big?60:(sl[2]>260?2:1))){if(!cov(x,sl)){lk=(lk+1+Math.floor(R()*2))%3;TZ.pw.push({wx:x,wy:sl[1],k:lk,h:18+R()*30,c:COLS[Math.floor(R()*COLS.length)],ph:R()*9,sc:.95+R()*.3,n:2+Math.floor(R()*2),par:1});cnt++}x+=big?260+R()*520:200}})};
 TZ.vines=[];
 TZ.ff=[];for(let i=0;i<6;i++)TZ.ff.push({x:R()*2000,y:20+R()*560,par:.25+R()*.7,sp:.4+R()*.6,ph:R()*20,s:1.1+R()*1.3,dx:8+R()*14});
 const wrap=(x,par)=>{const w=((x-camX*par)%2000+2000)%2000-200;return w};
 const hal=(x,y,r,c,a)=>glow(x,y,r,c,a);
 TZ.apply=function(){if(TZ.isN()){P.fog='34,100,160';P.gl='170,255,220'}else{P.fog='168,226,196';P.gl='255,236,160'}};
 TZ.apply();
 // 1) Nachthimmel mit Mond und Sternen (ersetzt den Taghimmel hinter den Ebenen)
 TZ.sky=function(g){if(!TZ.isN())return;const w=cv.width,h=cv.height;g.setTransform(1,0,0,1,0,0);
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#04122e');gr.addColorStop(.45,'#082a58');gr.addColorStop(.8,'#0b4068');gr.addColorStop(1,'#0e5070');g.fillStyle=gr;g.fillRect(0,0,w,h);
  const t=performance.now()/1000;TZ.stars.forEach(([x,y,r,p])=>{g.fillStyle='rgba(235,242,255,'+(.4+.4*Math.sin(t*1.2+p))+')';g.beginPath();g.arc(x*w,y*h,r,0,7);g.fill()});
  const mx=w*.8,my=h*.15,mr=h*.045;g.globalCompositeOperation='screen';
  let q=g.createRadialGradient(mx,my,mr*.6,mx,my,mr*9);q.addColorStop(0,'rgba(170,200,255,.34)');q.addColorStop(1,'rgba(170,200,255,0)');g.fillStyle=q;g.fillRect(mx-mr*9,my-mr*9,mr*18,mr*18);
  g.globalCompositeOperation='source-over';g.fillStyle='#e9eefc';g.beginPath();g.arc(mx,my,mr,0,7);g.fill();g.fillStyle='rgba(150,170,210,.35)';[[-.3,-.2,.28],[.35,.15,.2],[-.05,.45,.16]].forEach(([a,b,c])=>{g.beginPath();g.arc(mx+a*mr,my+b*mr,c*mr,0,7);g.fill()})};
 // 2) Mondlicht-Tönung der Ebenen + Leuchtpflanzen hinten
 TZ.bg=function(g){if(!TZ.isN())return;const w=cv.width,h=cv.height;g.save();g.setTransform(1,0,0,1,0,0);
  
  g.globalCompositeOperation='screen';
  const tp=g.createLinearGradient(0,0,0,h*.6);tp.addColorStop(0,'rgba(0,0,0,0)');tp.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=tp;g.fillRect(0,0,w,h);const hz=g.createLinearGradient(0,h*.5,0,h);hz.addColorStop(0,'rgba(40,170,160,0)');hz.addColorStop(1,'rgba(40,170,160,.16)');g.fillStyle=hz;g.fillRect(0,0,w,h);g.restore();
  const t=performance.now()/1000;vt();TZ.shafts(t);TZ.patches(t);TZ.trunkGlow(t);TZ.groundMist(t);if(typeof BA!=='undefined'&&BA.B)TZ.bgPlants(t);TZ.vines.forEach(v=>TZ.vine(v,t));TZ.pl.forEach(p=>{if(p.par<.9)TZ.plant(p,t)})};
 TZ.vine=function(v,t){const x0=wrap(v.x,v.par);if(x0<-60||x0>VWW+60)return;const Y0=BASE-VHH;let px=x0,py=Y0;const n=Math.floor(v.len/20);
  g.save();g.strokeStyle='rgba(20,50,50,.45)';g.lineWidth=1.4;g.beginPath();g.moveTo(x0,Y0);const pts=[];
  for(let i=1;i<=n;i++){const y=Y0+i*20,x=x0+Math.sin(t*.7+v.ph+i*.25)*(2+i*.8)+wind(x0,t)*i*1.2;pts.push([x,y]);g.lineTo(x,y)}g.stroke();g.restore();
  pts.forEach(([x,y],i)=>{if(i%2)return;const pu=.6+.4*Math.sin(t*1.5+v.ph+i);glow(x,y,16,v.c,.5*pu);g.fillStyle='rgba('+v.c+','+(.8*pu)+')';g.beginPath();g.arc(x,y,2.2,0,7);g.fill()})};
 // Leuchtpflanzen: gleichmäßiges, ruhiges Leuchten (kein Blinken), Licht fällt auf den Boden
 var pool=(x,y,r,c,a)=>{g.save();g.translate(x,y);g.scale(1,.2);glow(0,0,r,c,a);g.restore()};
 TZ.plant=function(p,t){const x=p.wx!=null?p.wx:wrap(p.x,p.par);if(p.wx!=null?(x<camX-90||x>camX+VWW+90):(x<-90||x>VWW+90))return;const sc=p.sc,y=p.wy!=null?p.wy-2:640-(1-p.par)*55,w=wind(x,t)*8,c=p.c;
  pool(x,y+2,90*sc,c,.28);
  g.save();g.globalCompositeOperation='screen';
  if(p.k===0){for(let i=0;i<p.n+1;i++){const ox=(i-1)*15*sc,hh=(p.h*(i===1?1.2:.75))*sc,cx=x+ox+w*.2,cy=y-hh,rw=(i===1?12:8)*sc;
    g.strokeStyle='rgba('+c+',.3)';g.lineWidth=2.6*sc;g.beginPath();g.moveTo(x+ox,y);g.lineTo(cx,cy);g.stroke();
    g.fillStyle='rgba('+c+',.5)';g.beginPath();g.ellipse(cx,cy,rw,rw*.6,0,Math.PI,0);g.fill();
    g.strokeStyle='rgba(215,255,255,.7)';g.lineWidth=1.4*sc;g.beginPath();g.ellipse(cx,cy,rw,rw*.6,0,Math.PI,0);g.stroke();
    g.fillStyle='rgba('+c+',.4)';g.beginPath();g.ellipse(cx,cy+1,rw*.9,rw*.18,0,0,7);g.fill();}
   g.restore();glow(x,y-p.h*sc*.7,70*sc,c,.2);return}
  if(p.k===1){const top=p.h*sc*2.1,cx=x+w*1.5;g.strokeStyle='rgba('+c+',.35)';g.lineWidth=2*sc;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+4*sc,y-top*.6,cx,y-top);g.stroke();
   for(let i=0;i<5;i++){const f=.45+i*.14,bx=x+(cx-x)*f*f+Math.sin(i*2.3)*4*sc,by=y-top*f,s=(6-i*.5)*sc;g.strokeStyle='rgba('+c+',.3)';g.lineWidth=1.2*sc;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+3*sc,by+4*sc);g.stroke();
    g.fillStyle='rgba('+c+',.6)';g.beginPath();g.moveTo(bx+3*sc-s*.6,by+4*sc);g.quadraticCurveTo(bx+3*sc,by+4*sc+s*1.8,bx+3*sc+s*.6,by+4*sc);g.closePath();g.fill();
    g.fillStyle='rgba(225,255,255,.6)';g.beginPath();g.arc(bx+3*sc,by+4*sc+s*.9,s*.28,0,7);g.fill()}
   g.restore();glow(cx,y-top*.8,72*sc,c,.2);return}
  for(let i=0;i<5;i++){const a=-1+i*.5,len=(22+p.h*.8)*sc,ex=x+Math.sin(a)*len+w*.5,ey=y-Math.cos(a)*len*.9,mx=(x+ex)/2+Math.sin(a)*6*sc,my=(y+ey)/2-10*sc;
   g.strokeStyle='rgba('+c+',.55)';g.lineWidth=1.8*sc;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(mx,my,ex,ey);g.stroke();
   for(let j=1;j<=6;j++){const f=j/7,px=(1-f)*(1-f)*x+2*f*(1-f)*mx+f*f*ex,py=(1-f)*(1-f)*y+2*f*(1-f)*my+f*f*ey,l=(7-j)*1.5*sc*.8;g.strokeStyle='rgba('+c+',.4)';g.lineWidth=1.1*sc;g.beginPath();g.moveTo(px,py);g.lineTo(px+l,py+l*.7);g.moveTo(px,py);g.lineTo(px-l,py+l*.7);g.stroke()}}
  g.restore();glow(x,y-len_(p),65*sc,c,.16)};
 const len_=p=>(22+p.h*.8)*p.sc*.5;
 TZ.bm=[];for(let i=0;i<4;i++)TZ.bm.push({x:R()*2000,par:.45+R()*.2,w:70+R()*80,ph:R()*9});
 TZ.beams=function(t){g.save();g.globalCompositeOperation='screen';const Y0=BASE-VHH;TZ.bm.forEach(b=>{const x=wrap(b.x,b.par);if(x<-300||x>VWW+300)return;const sh=-260,a=.055+.015*Math.sin(t*.15+b.ph);
   const gr=g.createLinearGradient(0,Y0,0,640);gr.addColorStop(0,'rgba(165,195,255,'+a*1.6+')');gr.addColorStop(.7,'rgba(165,195,255,'+a*.6+')');gr.addColorStop(1,'rgba(165,195,255,0)');g.fillStyle=gr;
   g.beginPath();g.moveTo(x+b.w*.3,Y0);g.lineTo(x+b.w*.3+b.w*.5,Y0);g.lineTo(x+sh+b.w*1.2,640);g.lineTo(x+sh,640);g.closePath();g.fill();});g.restore();
  TZ.bm.forEach(b=>{const x=wrap(b.x,b.par);if(x<-300||x>VWW+300)return;pool(x-250+b.w*.6,640,b.w*.9,'150,185,255',.16)})};
 TZ.tintOn=function(c2){const cw=c2.canvas.width,ch=c2.canvas.height;if(!TZ.T||TZ.T.width!==cw||TZ.T.height!==ch){TZ.T=document.createElement('canvas');TZ.T.width=cw;TZ.T.height=ch}const tt=TZ.T.getContext('2d');tt.setTransform(1,0,0,1,0,0);tt.globalCompositeOperation='copy';tt.drawImage(c2.canvas,0,0);
  c2.save();c2.setTransform(1,0,0,1,0,0);c2.globalCompositeOperation='color';c2.fillStyle='rgb(30,96,150)';c2.fillRect(0,0,cw,ch);c2.globalCompositeOperation='destination-in';c2.drawImage(TZ.T,0,0);tt.globalCompositeOperation='copy';tt.drawImage(c2.canvas,0,0);c2.globalCompositeOperation='copy';c2.filter='contrast(2) brightness(.58) saturate(1)';c2.drawImage(TZ.T,0,0);c2.filter='none';c2.globalCompositeOperation='source-atop';const gr=c2.createLinearGradient(0,0,0,ch);gr.addColorStop(0,'rgba(4,20,56,.34)');gr.addColorStop(.6,'rgba(4,22,50,.3)');gr.addColorStop(1,'rgba(4,26,42,.3)');c2.fillStyle=gr;c2.fillRect(0,0,cw,ch);c2.restore()};
 TZ.tintL=function(g){if(!TZ.isN())return;TZ.tintOn(g);if(TZ.aFrame){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(TZ.A,0,0);ctx.restore();TZ.aFrame=false}};
 // Leuchtblatt: Blattform sanft türkis gefüllt + helle Adern (aus dem Blattbild berechnet)
 TZ.leafSprite=function(s){if(s._g)return s._g;const w=s.c.width,h=s.c.height,a=document.createElement('canvas');a.width=w;a.height=h;const x=a.getContext('2d');x.drawImage(s.c,0,0);const o=x.getImageData(0,0,w,h),b=document.createElement('canvas');b.width=w;b.height=h;const y=b.getContext('2d');y.filter='blur(9px)';y.drawImage(s.c,0,0);const bl=y.getImageData(0,0,w,h),out=x.createImageData(w,h),d=o.data,e=bl.data,q=out.data;
  for(let i=0;i<d.length;i+=4){const al=d[i+3];if(al<40)continue;const L=d[i]*.3+d[i+1]*.59+d[i+2]*.11,Lb=e[i]*.3+e[i+1]*.59+e[i+2]*.11,vein=Math.max(0,L-Lb-3)*14;q[i]=110;q[i+1]=250;q[i+2]=240;q[i+3]=Math.min(255,vein)*(al/255)}
  const r=document.createElement('canvas');r.width=w;r.height=h;const z=r.getContext('2d');
  z.drawImage(s.c,0,0);z.globalCompositeOperation='source-in';const gq=z.createLinearGradient(0,0,0,h);gq.addColorStop(0,'rgba(60,215,215,.16)');gq.addColorStop(1,'rgba(50,200,200,.08)');z.fillStyle=gq;z.fillRect(0,0,w,h);
  z.globalCompositeOperation='source-over';x.clearRect(0,0,w,h);x.putImageData(out,0,0);z.drawImage(a,0,0);s._g=r;return r};
 // Nach dem Riesenblatt-Schritt: Ebenen bis hier tönen, Blätter leuchten lassen (ungedimmt), danach weiter mit den vorderen Ebenen
 TZ.splitA=function(t){const cx=bgX.canvas;if(!TZ.A||TZ.A.width!==cx.width||TZ.A.height!==cx.height){TZ.A=document.createElement('canvas');TZ.A.width=cx.width;TZ.A.height=cx.height}
  const a2=TZ.A.getContext('2d');a2.setTransform(1,0,0,1,0,0);a2.clearRect(0,0,cx.width,cx.height);a2.drawImage(cx,0,0);TZ.tintOn(a2);
  a2.save();a2.setTransform(S,0,0,S,0,cv.height-BASE*S);a2.globalCompositeOperation='lighter';const off=camX*.3;
  MUSH.forEach(m=>{const x=((m.x-off)%PER+PER)%PER;for(const xx of [x,x-PER]){if(xx<-300||xx>VWW+300)continue;const cyc=((t+m.x*.004)%15+15)%15,dd=Math.min(cyc,15-cyc),bump=Math.exp(-dd*dd/(2*2.1*2.1));a2.globalAlpha=.3;a2.drawImage(TZ.leafSprite(m.s),xx-m.s.sx,BY-m.s.sy,m.s.w,m.s.h)}});a2.restore();
  if(typeof BA!=='undefined'&&show.hgtiere){const sv=g;g=a2;try{BA.gecko(t)}finally{g=sv}}
  const bx=bgX;bx.save();bx.setTransform(1,0,0,1,0,0);bx.clearRect(0,0,cx.width,cx.height);bx.restore();TZ.aFrame=true};
 TZ.sil=function(s){if(s._sil)return s._sil;const c=document.createElement('canvas');c.width=s.c.width;c.height=s.c.height;const z=c.getContext('2d');z.drawImage(s.c,0,0);z.globalCompositeOperation='source-in';z.fillStyle='rgba(80,215,225,.55)';z.fillRect(0,0,c.width,c.height);return s._sil=c};
 TZ.dachGlow=function(list,f,t){return;const off=camX*f;g.save();g.setTransform(S,0,0,S,0,cv.height-BASE*S);g.globalCompositeOperation='lighter';g.globalAlpha=.7;
  list.forEach(b=>{const s=b.s,a=b.rot+(wind(b.x,t)*b.amp+Math.sin(t*.7+b.ph)*.006)*b.k,x=((b.x-off)%PER+PER)%PER;for(const xx of [x,x-PER]){if(xx<-s.w||xx>VWW+s.w)continue;g.save();g.translate(xx,b.y);g.rotate(a);g.drawImage(TZ.sil(s),-s.sx,-s.sy,s.w,s.h);g.restore()}});g.restore()};

 // ---- Nacht-Details: leuchtende Baumpilze am Stamm, Bodennebel, Flechten an Erdkanten ----
 const Lw=y=>{const u=(y+170)/940;return 120+50*u+(u>.72?Math.pow((u-.72)/.28,1.5)*190:0)};
 TZ.brk=[];{const r2=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(77);let yy=50;for(let i=0;i<14;i++){yy+=28+r2()*70;const c=r2()<.35?2:1;for(let k=0;k<c;k++)TZ.brk.push({y:yy+k*13,side:r2()<.5?1:-1,s:5+r2()*9,tr:r2()<.5?0:1,ph:r2()*9})}}
 TZ.trunkGlow=function(t){const off=camX*.38,PT=2600,Y0=BASE-VHH;
  [[800,1],[1950,-1]].forEach(([x0,fl],ti)=>{const x=((x0-off)%PT+PT)%PT;for(const xx of [x,x-PT]){if(xx<-380||xx>VWW+380)continue;
   // Moos-Streifen an den Stammkanten
   for(const sd of [-1,1]){g.save();g.globalCompositeOperation='screen';const gr=g.createLinearGradient(0,Y0+60,0,640);gr.addColorStop(0,'rgba(70,225,225,0)');gr.addColorStop(.5,'rgba(70,225,225,.10)');gr.addColorStop(1,'rgba(70,225,225,0)');g.strokeStyle=gr;g.lineWidth=3;g.beginPath();for(let y=Y0+60;y<=640;y+=20){const px=xx+sd*Lw(y)*.86+Math.sin(y*.04+ti)*4;y===Y0+60?g.moveTo(px,y):g.lineTo(px,y)}g.stroke();g.restore()}
   TZ.brk.forEach(b=>{if(b.tr!==ti)return;const y=Y0+b.y*1.15,px=xx+b.side*Lw(y)*.84,s=b.s;if(y>600)return;
    g.save();g.globalCompositeOperation='screen';glow(px,y,s*4.2,'70,225,235',.13);
    g.fillStyle='rgba(70,225,235,.5)';g.beginPath();g.ellipse(px,y,s,s*.42,0,Math.PI,0);g.fill();
    g.strokeStyle='rgba(215,255,255,.6)';g.lineWidth=1;g.beginPath();g.ellipse(px,y,s,s*.42,0,Math.PI,0);g.stroke();
    g.fillStyle='rgba(70,225,235,.28)';g.beginPath();g.ellipse(px,y+1.5,s*.8,s*.14,0,0,7);g.fill();g.restore()})}})};
 TZ.mistW=[];for(let i=0;i<6;i++)TZ.mistW.push({x:R()*2400,y:560+R()*70,w:240+R()*240,sp:3+R()*5,par:.5+R()*.3,ph:R()*9});
 TZ.groundMist=function(t){g.save();g.globalCompositeOperation='screen';TZ.mistW.forEach(m=>{const x=(((m.x+t*m.sp-camX*m.par)%2400)+2400)%2400-300;if(x<-m.w||x>VWW+m.w)return;g.save();g.translate(x,m.y);g.scale(1,.18);const q=g.createRadialGradient(0,0,0,0,0,m.w);const a=.10+.04*Math.sin(t*.2+m.ph);q.addColorStop(0,'rgba(80,215,220,'+a+')');q.addColorStop(1,'rgba(80,215,220,0)');g.fillStyle=q;g.beginPath();g.arc(0,0,m.w,0,7);g.fill();g.restore()});g.restore()};
 TZ.lk=[];{const r3=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(33);(typeof LV!=='undefined'&&LV.solids||[]).forEach(sl=>{if(sl[4]!=='g'||sl[2]<50)return;const n=Math.floor(sl[2]/55);for(let i=0;i<n;i++){const x=sl[0]+14+r3()*(sl[2]-28),y=sl[1]+16+r3()*Math.min(sl[3]-24,70);if(sl[3]<28)continue;TZ.lk.push({x,y,r:.9+r3()*1.3,h:r3()<.8?'110,240,235':'130,170,255',ph:r3()*9})}})};
 TZ.lichen=function(t){TZ.lk.forEach(l=>{if(l.x<camX-20||l.x>camX+VWW+20)return;g.save();g.globalCompositeOperation='screen';glow(l.x,l.y,6+l.r*3,l.h,.2);g.fillStyle='rgba('+l.h+',.7)';g.beginPath();g.arc(l.x,l.y,l.r,0,7);g.fill();g.restore()})};

 // Ferne Dschungel-Silhouetten (statt der matschigen Ganz-fern/Fern-Ebenen): klare Wertestufen, hell = weit weg
 TZ.bandTile=function(seed,base,amp,col0,col1,rim,blur,palms,fans){const W=2000,H=760,OX=120,c=document.createElement('canvas');c.width=W+2*OX;c.height=H;const x=c.getContext('2d'),r=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(seed);
  const blobs=[];for(let px=-60;px<W+60;px+=26+r()*30){const q=2*Math.PI*px/W;blobs.push([px+OX,base+Math.sin(q*3+seed)*amp+Math.sin(q*9+seed*2)*amp*.4-(Math.sin(q*23+seed*3)*.5+.5)*amp*.6,34+(Math.sin(q*31+seed)*.5+.5)*46])};
  const gr=x.createLinearGradient(0,base-amp*1.5,0,H);gr.addColorStop(0,col0);gr.addColorStop(.55,col1);gr.addColorStop(1,col1);
  x.filter='blur('+blur+'px)';x.fillStyle=gr;x.beginPath();x.moveTo(-10,H);blobs.forEach(b=>{x.lineTo(b[0],b[1])});x.lineTo(W+2*OX+10,H);x.fill();blobs.forEach(b=>{x.beginPath();x.arc(b[0],b[1]+8,b[2],0,7);x.fill()});
  if(palms){for(let i=0;i<palms;i++){const px=OX+200+(i+.5)*(W-400)/palms+(r()-.5)*100,top=base-120-r()*160;x.strokeStyle=col1;x.lineWidth=7;x.beginPath();x.moveTo(px,H);x.quadraticCurveTo(px+14,(H+top)/2,px+4,top);x.stroke();
    for(let k=0;k<9;k++){const a=-Math.PI*.95+k*Math.PI*.115,l=70+r()*40;x.lineWidth=4;x.beginPath();x.moveTo(px+4,top);x.quadraticCurveTo(px+4+Math.cos(a)*l*.6,top+Math.sin(a)*l*.6-14,px+4+Math.cos(a)*l,top+Math.sin(a)*l+22);x.stroke()}}}
  if(fans){x.strokeStyle=col1;x.lineCap='round';for(let i=0;i<fans;i++){const px=OX+(i+.3+r()*.4)*W/fans,by=base+Math.sin(2*Math.PI*(px-OX)/W*3+seed)*amp+16,n=9+Math.floor(r()*4),L=60+r()*70;for(let k=0;k<n;k++){const a=-Math.PI*.96+k*Math.PI*.92/(n-1),l=L*(.7+r()*.4);x.lineWidth=5+r()*3;x.beginPath();x.moveTo(px,by);x.quadraticCurveTo(px+Math.cos(a)*l*.55,by+Math.sin(a)*l*.7-16,px+Math.cos(a)*l,by+Math.sin(a)*l*.8+18);x.stroke()}}}
  x.filter='none';{const e=document.createElement('canvas');e.width=c.width;e.height=c.height;const y=e.getContext('2d');y.drawImage(c,0,0);y.globalCompositeOperation='destination-out';y.drawImage(c,0,7);y.globalCompositeOperation='source-in';y.fillStyle=rim;y.fillRect(0,0,e.width,e.height);x.drawImage(e,0,0)}return c};
 TZ.farBands=function(g){if(!TZ.bt){TZ.bt=[[TZ.bandTile(5,330,36,'#164f8e','#0f3a72','rgba(120,190,235,.26)',5,5,0),.12],[TZ.bandTile(9,420,34,'#0d3566','#0a2a58','rgba(110,185,230,.22)',3,3,16),.25],[TZ.bandTile(13,500,26,'#0a2c58','#081f44','rgba(110,200,230,.22)',1.6,0,22),.4]]}
  g.save();vt();TZ.bt.forEach(([c,f])=>{const off=camX*f,x=((-off)%2000+2000)%2000;for(const xx of [x-2000,x,x+2000]){if(xx>VWW||xx+2000<0)continue;g.drawImage(c,120,0,2000,760,xx,-60,2000,760)}});g.restore()};

 // ---- Licht im Hintergrund: weiche Lichtschäfte durch das Blätterdach, Lichtflecken am Stamm, ferne Leuchtpflanzen ----
 TZ.shS=[];for(let i=0;i<3;i++){const c=document.createElement('canvas');c.width=300;c.height=760;const x=c.getContext('2d'),gr=x.createLinearGradient(0,0,300,0);gr.addColorStop(0,'rgba(150,215,255,0)');gr.addColorStop(.5,'rgba(150,215,255,1)');gr.addColorStop(1,'rgba(150,215,255,0)');x.fillStyle=gr;x.fillRect(0,0,300,760);x.globalCompositeOperation='destination-in';const vg=x.createLinearGradient(0,0,0,760);vg.addColorStop(0,'rgba(0,0,0,.95)');vg.addColorStop(.55,'rgba(0,0,0,.35)');vg.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=vg;x.fillRect(0,0,300,760);TZ.shS.push(c)}
 TZ.shafts=function(t){const Y0=BASE-VHH;g.save();g.globalCompositeOperation='screen';[[260,.3,.5,0],[900,.3,.7,3],[1560,.3,.6,6]].forEach(([x0,par,wd,ph],i)=>{const x=wrap(x0,par);if(x<-300||x>VWW+300)return;g.save();g.globalAlpha=.075+.03*Math.sin(t*.12+ph);g.translate(x,Y0);g.transform(1,0,-.3,1,0,0);g.drawImage(TZ.shS[i],-150*wd,0,300*wd,760);g.restore()});g.restore()};
 TZ.patches=function(t){const off=camX*.38,PT=2600,Y0=BASE-VHH;[[800,1],[1950,-1]].forEach(([x0,fl],ti)=>{const x=((x0-off)%PT+PT)%PT;for(const xx of [x,x-PT]){if(xx<-380||xx>VWW+380)continue;[[-20,.2,70],[24,.52,50],[-8,.78,60]].forEach(([dx,k,w],j)=>{const y=Y0+60+k*(640-Y0-60),a=.07+.025*Math.sin(t*.15+j+ti*2);g.save();g.globalCompositeOperation='screen';g.translate(xx+dx,y);g.scale(1,1.8);const q=g.createRadialGradient(0,0,0,0,0,w);q.addColorStop(0,'rgba(150,215,255,'+a+')');q.addColorStop(1,'rgba(150,215,255,0)');g.fillStyle=q;g.beginPath();g.arc(0,0,w,0,7);g.fill();g.restore()})}})};
 TZ.bgP=[];{const r4=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(91);for(let i=0;i<16;i++){const par=.4+r4()*.4;TZ.bgP.push({x:i*125+r4()*90,par,k:i%3,h:18+r4()*26,c:COLS[Math.floor(r4()*COLS.length)],sc:.55+par*.4,n:2,ph:r4()*9,wy:640-(1-par)*55-r4()*40})}}
 TZ.bgPlants=function(t){TZ.bgP.forEach(p=>{const x=wrap(p.x,p.par);if(x<-80||x>VWW+80)return;if(!p.spr){const c=document.createElement('canvas');c.width=180;c.height=150;const x2=c.getContext('2d'),sg=g,sc=camX;g=x2;camX=0;try{x2.filter='blur('+((1-p.par)*5+.8)+'px)';TZ.plant(Object.assign({},p,{wx:90,wy:132,x:0}),0)}finally{g=sg;camX=sc}p.spr=c}g.drawImage(p.spr,x-90,640-(1-p.par)*55-130,180,150)})};
 // 3) Abdunklung der ganzen Szene + Glühwürmchen + vordere Leuchtpflanzen (vor dem Spielfeld)
 TZ.dark=function(g){if(!TZ.isN())return;const t=performance.now()/1000;g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(6,16,46,.08)';g.fillRect(0,0,cv.width,cv.height);g.restore();
  wt();TZ.pw.forEach(p=>TZ.plant(p,t));vt();
  TZ.ff.forEach(f=>{const x=wrap(f.x+Math.sin(t*.3*f.sp+f.ph)*f.dx*3,f.par*.5),y=f.y+Math.sin(t*.5*f.sp+f.ph*1.3)*22-(BASE-VHH)*0;if(x<-20||x>VWW+20)return;
   glow(x,y,9+f.s*5,'170,250,255',.22);g.fillStyle='rgba(215,252,255,.7)';g.beginPath();g.arc(x,y,f.s,0,7);g.fill()});};
 TZ.figGlow=function(t){if(!TZ.isN())return;g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='multiply';const m=g.createLinearGradient(0,0,cv.width,0);m.addColorStop(0,'rgb(115,138,190)');m.addColorStop(1,'rgb(145,168,218)');g.fillStyle=m;g.fillRect(0,0,cv.width,cv.height);g.restore();wt();[LV.sm,LV.sf].forEach((p,i)=>{glow(p[0],p[1]-22,100,i?'170,225,245':'170,225,245',.11)})};
 // Auswahl
 const sel=document.createElement('select');sel.setAttribute('aria-label','Tageszeit');
 [['tag','Tag (so wie bisher)'],['nacht','Nacht']].forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l;sel.appendChild(o)});
 if(TZ.mode!=='nacht')TZ.mode='tag';sel.value=TZ.mode;sel.onchange=()=>{TZ.mode=sel.value;TZ.apply();if(typeof DK!=='undefined')DK.on=false;location.hash=sel.value};jump.after(sel);
})();
