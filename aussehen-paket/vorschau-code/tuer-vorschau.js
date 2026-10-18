// TÜR – zusammenhängende Türen = EINE Tür, ein Diamant (drawGate)
// Vorschau-Code (Vorschau-Seite): Aussehen/Zahlen exakt übernehmen, Anbindung ans Spiel anpassen.

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
