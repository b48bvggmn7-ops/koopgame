// 32a-figuren-foto.js – Foto-Look-Figuren: das freigegebene Schweinchen (Entwurf in entwurf-figuren/) als zweite Bau-Art für js/33.
// NUR Aussehen: js/33 liefert die WebGL-Welt (gl, M, Nd), ruft buildPig() und bewegt die Teile wie bisher über dieselben Griffe
// (root, head, armN/armP, legN/legP, eyes) – alle Haltungen (Laufen, Fliegen, Dash, Schirm, Hangeln …) bleiben unverändert.
// Eigener Fell-Shader (Flaum mit Büscheln, Haut, Augen mit Iris); Teile tragen part.neu, js/33 drawNode reicht sie an teil() weiter.
// Schalter in der Adresse: ?schwein=alt = bisheriges Schweinchen. Schlägt hier etwas fehl, bleibt automatisch das bisherige.
window.figurenFotoBauen = function(env){
'use strict';
const gl=env.gl,M=env.M,Nd=env.Nd,schichten=env.schichten,tatAn=env.tat||(()=>false);
const SH=18;            // Fell-Schichten des Foto-Look-Fells (js/33 nimmt bei Ruckeln weniger: F3D_QUALI)
const DMAX=12;          // feinste Haardichte, die die kleine Figuren-Leinwand noch auflöst (Haare je Einheit)
let seed=4711;const rnd=()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296;
function prog(vs,fs){const p=gl.createProgram();for(const [t,s] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));gl.attachShader(p,sh)}
 ['aPos','aNrm','aUv','aLayer'].forEach((n,i)=>gl.bindAttribLocation(p,i,n));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p}
const VS=`#version 300 es
in vec3 aPos;in vec3 aNrm;in vec2 aUv;in float aLayer;
uniform mat4 uVP,uM;uniform mat3 uNM;uniform float uLen,uGrav,uComb,uTile,uClump,uWild,uLayerMul;uniform vec3 uGroom;uniform sampler2D uNz;
out vec2 vUv;out vec2 vUv0;out vec3 vN;out vec3 vT;out float vL;out vec3 vW;out vec3 vO;
void main(){float la=aLayer*uLayerMul;vec3 wn=normalize(uNM*aNrm);vec4 w=uM*vec4(aPos,1.);
 vec3 g=uGroom-wn*dot(uGroom,wn);
 vec2 q=vec2(textureLod(uNz,aUv*uClump*.8+.21,0.).r,textureLod(uNz,aUv*uClump*.8+.77,0.).r)-.5;
 vec3 t1=normalize(cross(wn,vec3(.31,.2,.93)));vec3 t2=cross(wn,t1);g+=(t1*q.x+t2*q.y)*uWild;
 vec3 dir=normalize(wn+g*uComb*(.3+1.2*la));
 w.xyz+=dir*uLen*la;w.y-=uGrav*la*la;
 vT=normalize(wn+g*uComb*(.3+2.4*la)-vec3(0.,uGrav*2.*la/max(uLen,.001),0.));
 vW=w.xyz;vN=wn;vUv0=aUv;vUv=aUv*uTile;vL=la;vO=aPos;gl_Position=uVP*w;}`;
const FS=`#version 300 es
precision highp float;
uniform sampler2D uStr,uNz,uTat;uniform vec3 uRoot,uTip,uCam;uniform int uMat;uniform float uSpec,uOcc,uVar,uSss,uGy,uClump,uThin,uCurl,uBlush,uTatOn,uHerz;uniform vec3 uRoot2,uTip2;
in vec2 vUv;in vec2 vUv0;in vec3 vN;in vec3 vT;in float vL;in vec3 vW;in vec3 vO;out vec4 o;
const vec3 LK=vec3(-.44,.70,.56);const vec3 KEYC=vec3(1.22,1.02,.76);
const vec3 SKY=vec3(.60,.63,.58);const vec3 GND=vec3(.085,.085,.06);
const vec3 LB=vec3(.47,.33,-.82);
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){
 vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 V=normalize(uCam-vW);vec3 H=normalize(LK+V);
 float gocc=mix(.42,1.,smoothstep(-.05,1.5,vW.y-uGy));
 vec3 amb=mix(GND,SKY,smoothstep(-1.,1.,N.y))*gocc;
 float alpha=1.;vec3 col;
 if(uMat==0){
  vec2 cu=(vec2(texture(uNz,vUv0*uClump*2.3+.11).r,texture(uNz,vUv0*uClump*2.3+.63).r)-.5)*vL*vL*uCurl;
  vec4 s=texture(uStr,vUv+cu);float nz=texture(uNz,vUv0*uClump).r;float nz2=texture(uNz,vUv0*uClump*3.3+.37).r;
  float h=(s.r-uThin)/(1.-uThin)*(.78+.22*nz);float l=vL;
  if(l>.001){alpha=smoothstep(l-.04,l+.06,h);if(alpha<.06)discard;}
  vec3 base=mix(uRoot,uTip,smoothstep(.15,1.,l));
  if(uHerz>.5){vec3 ph=normalize(vO);float ax=abs(ph.x);   // Affe: helles Fell in der Herz-Form des Gesichts
   float hd=min(length(vec2((ax-.36)/.47,(ph.y-.14)/.58)),length(vec2(ph.x/.8,(ph.y+.18)/.6)));
   base=mix(base,mix(uRoot2,uTip2,smoothstep(.15,1.,l)),(1.-smoothstep(.95,1.03,hd))*step(.12,ph.z));}
  base*=1.+uVar*((s.g-.5)*1.0+(nz2-.5)*.25+(nz-.5)*.12);
  {vec3 pb=normalize(vO);float bl=uBlush*smoothstep(.34,.04,length(vec2(abs(pb.x)-.62,pb.y+.26)))*step(0.,pb.z);base=mix(base,vec3(.90,.50,.50),bl*.6);}
  base=pow(max(base,0.),vec3(2.2));
  if(uTatOn>.5){vec3 pn=normalize(vO);vec2 tu=vec2(atan(pn.z,pn.x)/6.2832,acos(clamp(pn.y,-1.,1.))/3.14159);if(tu.x<0.)tu.x+=1.;vec4 tc=textureLod(uTat,tu,0.);base=mix(base,pow(tc.rgb,vec3(2.2)),tc.a*.9);}   // Tattoo (Umkleide) färbt das Fell – Textur von js/33 auf Einheit 1
  vec3 T=normalize(vT);
  float occ=mix(uOcc,1.,pow(l,.9));
  float nl=clamp((dot(N,LK)+.6)/1.6,0.,1.);nl=nl*nl*(3.-2.*nl);
  float tl=dot(T,LK);float dif=nl*mix(1.,sqrt(max(0.,1.-tl*tl)),.2);
  float th=dot(normalize(T+N*.10),H);float sp1=pow(sqrt(max(0.,1.-th*th)),90.);
  float th2=dot(normalize(T-N*.20),H);float sp2=pow(sqrt(max(0.,1.-th2*th2)),20.);
  col=base*(amb*1.15+KEYC*dif*1.0)*occ;
  col+=base*KEYC*(1.-nl)*.16*l+base*vec3(1.,.8,.6)*.10*l*nl;
  vec3 tipL=pow(uTip,vec3(2.2));
  col+=(vec3(.9)*sp1*.07+tipL*sp2*.4)*nl*smoothstep(.2,.9,l)*uSpec;
  float rim=pow(1.-max(dot(N,V),0.),2.2);
  col+=tipL*mix(SKY,vec3(1.3,1.05,.7),.65)*rim*smoothstep(.2,1.,l)*(.55+1.0*max(dot(N,LB),0.))*1.25;
 }else if(uMat==1){
  float nz=texture(uNz,vUv0*5.).r;float nz2=texture(uNz,vUv0*19.+.2).r;
  vec3 base=pow(uRoot*(1.+uVar*((nz-.5)*.9+(nz2-.5)*.5)),vec3(2.2));
  float w=clamp((dot(N,LK)+.5)/1.5,0.,1.);
  vec3 sss=vec3(.95,.22,.12)*smoothstep(0.,.45,w)*smoothstep(1.,.45,w)*.35*uSss;
  col=base*(amb*1.05+KEYC*w*.95+sss);
  float fr=pow(1.-max(dot(N,V),0.),4.);
  col+=vec3(1.)*pow(max(dot(N,H),0.),max(uSpec,1.))*.015*uSpec*(.5+nz2)+SKY*fr*.10*min(1.,uSpec/20.);
  col+=base*vec3(1.,.5,.4)*uSss*.25*pow(max(dot(V,-LB),0.),3.)*fr*3.;
 }else if(uMat==2){
  vec3 p=normalize(vO);if(p.y<-uSpec+.3*p.x*p.x||p.y>uSss-.12*p.x*p.x)discard;float r0=length(p.xy);float r=r0/max(uVar,.2)*.93;float a=atan(p.y,p.x);
  float fib=texture(uNz,vec2(a*2.1,r*.5)).r;
  vec3 ir=pow(uRoot,vec3(2.2));vec3 iris=mix(ir*.3,ir,smoothstep(.42,.8,r))*(.55+.9*fib);
  iris*=mix(.2,1.,smoothstep(.93,.74,r));
  vec3 c=mix(vec3(.002),iris,smoothstep(.46,.54,r));
  c=mix(c,vec3(.80,.76,.70)*uOcc,smoothstep(.93,.97,r));
  c*=mix(1.,.72,smoothstep(.55,1.,r0));
  vec3 Ne=normalize(vec3(p.x,p.y,p.z*.75+.35));
  float lid=smoothstep(1.,.15,p.y);
  col=c*(SKY*1.25+KEYC*.8*max(dot(Ne,LK),0.))*mix(.45,1.,lid);
  col+=vec3(1.,.98,.95)*pow(max(dot(Ne,H),0.),150.)*6.;col+=vec3(.8,.9,1.)*pow(max(dot(Ne,normalize(vec3(.45,-.25,.86))),0.),700.)*1.5;
  col+=SKY*smoothstep(.05,.75,Ne.y)*.10*lid;
  col+=vec3(.9)*smoothstep(-.78,-.9,p.y)*.05;
 }else{
  float nz=texture(uNz,vUv0*9.).r;vec3 base=pow(uRoot*(.9+.2*nz),vec3(2.2));
  float w=clamp((dot(N,LK)+.4)/1.4,0.,1.);float fr=pow(1.-max(dot(N,V),0.),3.);
  col=base*(amb+KEYC*w)+vec3(1.)*pow(max(dot(N,H),0.),uSpec)*.2*min(1.,uSpec/50.)+SKY*fr*.035;
 }
 col=mix(col,vec3(.36,.40,.39),.035);
 o=vec4(pow(aces(col*1.32),vec3(1./2.2)),alpha);}`;
const PRG=prog(VS,FS);
const U={};for(const n of ['uVP','uM','uNM','uLen','uGrav','uComb','uTile','uGroom','uStr','uNz','uRoot','uTip','uCam','uMat','uSpec','uOcc','uVar','uSss','uGy','uClump','uThin','uCurl','uBlush','uWild','uLayerMul','uTat','uTatOn','uHerz','uRoot2','uTip2'])U[n]=gl.getUniformLocation(PRG,n);
function tex(c,rep,mip){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
 if(mip)gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,mip?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 const w=rep?gl.REPEAT:gl.CLAMP_TO_EDGE;gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,w);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,w);return t}
// Haar-Textur: je Zelle ein Haar (spitz zulaufend), R = Höhe, G = Zufall je Haar
const CELLS=256;
const strTex=(()=>{const px=4,s=CELLS*px;const c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');const img=x.createImageData(s,s);
 const D=img.data;for(let i=3;i<D.length;i+=4)D[i]=255;
 for(let n=0;n<CELLS*CELLS*1.5;n++){const mx=rnd()*s,my=rnd()*s,r=.35+.65*rnd(),t=rnd()*255,rad=px*(.42+.25*rnd());
  for(let py=Math.floor(my-rad);py<=my+rad;py++)for(let qx=Math.floor(mx-rad);qx<=mx+rad;qx++){const d=Math.hypot(qx+.5-mx,py+.5-my)/rad;if(d>=1)continue;
   const v=r*(1-d)*255,i=(((py%s+s)%s)*s+((qx%s+s)%s))*4;if(v>D[i]){D[i]=v;D[i+1]=t}}}
 x.putImageData(img,0,0);return tex(c,true,true)})();
// weiches Rauschen (Büschel, Farbflecken)
const nzTex=(()=>{const n=256,c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d');const img=x.createImageData(n,n);
 const oct=[[8,.5],[16,.3],[32,.2]].map(([g,a])=>{const v=[];for(let i=0;i<g*g;i++)v.push(rnd());return {g,a,v}});
 const sm=t=>t*t*(3-2*t);
 for(let y=0;y<n;y++)for(let xx=0;xx<n;xx++){let s=0;for(const o of oct){const fx=xx/n*o.g,fy=y/n*o.g,ix=Math.floor(fx),iy=Math.floor(fy),ux=sm(fx-ix),uy=sm(fy-iy);
  const g=(a,b)=>o.v[((b%o.g+o.g)%o.g)*o.g+((a%o.g+o.g)%o.g)];s+=o.a*((g(ix,iy)*(1-ux)+g(ix+1,iy)*ux)*(1-uy)+(g(ix,iy+1)*(1-ux)+g(ix+1,iy+1)*ux)*uy)}
  const i=(y*n+xx)*4;img.data[i]=img.data[i+1]=img.data[i+2]=Math.max(0,Math.min(255,(s-.5)*1.9*255+128));img.data[i+3]=255}
 x.putImageData(img,0,0);return tex(c,true,true)})();
function mkGeo(pos,nrm,uv,idx,shells){const vao=gl.createVertexArray();gl.bindVertexArray(vao);
 const buf=(d,loc,n,div)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,gl.FLOAT,false,0,0);if(div)gl.vertexAttribDivisor(loc,1)};
 buf(pos,0,3);buf(nrm,1,3);buf(uv,2,2);
 const ix=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ix);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(idx),gl.STATIC_DRAW);
 const L=[];for(let i=0;i<shells;i++)L.push(shells===1?0:i/(shells-1));buf(L,3,1,true);
 return {vao,n:idx.length,shells}}
// Würfel-Kugel: gleichmäßige Haar-Dichte, keine Pole
function cubeData(n){const pos=[],uv=[],idx=[];const FL=[[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,0,1],[0,1,0],[-1,0,0]],[[0,0,-1],[0,1,0],[1,0,0]],[[1,0,0],[0,0,-1],[0,1,0]],[[1,0,0],[0,0,1],[0,-1,0]]];
 FL.forEach(([a,b,c],f)=>{const o=pos.length/3;for(let i=0;i<=n;i++)for(let j=0;j<=n;j++){const u=Math.tan((i/n*2-1)*Math.PI/4),v=Math.tan((j/n*2-1)*Math.PI/4);
  const p=[0,1,2].map(k=>a[k]*u+b[k]*v+c[k]);const l=Math.hypot(p[0],p[1],p[2]);pos.push(p[0]/l,p[1]/l,p[2]/l);uv.push(i/n+f*.371,j/n+f*.613)}
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const q=o+i*(n+1)+j,r=q+n+1;idx.push(q,r,q+1,r,r+1,q+1)}});return {pos,nrm:pos.slice(),uv,idx}}
const CUBD=cubeData(24),gc={};function SPH(sh){return gc[sh]||(gc[sh]=mkGeo(CUBD.pos,CUBD.nrm,CUBD.uv,CUBD.idx,sh))}
function cr(p,t){const n=p.length-1;const f=Math.min(n-1e-6,Math.max(0,t*n));const i=Math.floor(f),u=f-i;const g=k=>p[Math.max(0,Math.min(n,k))];
 return [0,1,2].map(a=>{const p0=g(i-1)[a],p1=g(i)[a],p2=g(i+1)[a],p3=g(i+2)[a];return .5*((2*p1)+(-p0+p2)*u+(2*p0-5*p1+4*p2-p3)*u*u+(-p0+3*p1-3*p2+p3)*u*u*u)})}
function tube(pts,r0,r1,shells,seg,rad,uvl,uvc){seg=seg||60;rad=rad||14;uvl=uvl||1;uvc=uvc||1;const pos=[],nrm=[],uv=[],idx=[];let prevN=null;
 for(let i=0;i<=seg;i++){const t=i/seg,c=cr(pts,t),c2=cr(pts,Math.min(1,t+.01)),c1=cr(pts,Math.max(0,t-.01));
  let tg=[c2[0]-c1[0],c2[1]-c1[1],c2[2]-c1[2]];let l=Math.hypot(tg[0],tg[1],tg[2]);tg=tg.map(v=>v/l);
  let n=prevN||(Math.abs(tg[1])<.9?[0,1,0]:[1,0,0]);const dp=n[0]*tg[0]+n[1]*tg[1]+n[2]*tg[2];n=[n[0]-dp*tg[0],n[1]-dp*tg[1],n[2]-dp*tg[2]];l=Math.hypot(n[0],n[1],n[2]);n=n.map(v=>v/l);prevN=n;
  const b=[tg[1]*n[2]-tg[2]*n[1],tg[2]*n[0]-tg[0]*n[2],tg[0]*n[1]-tg[1]*n[0]];const r=r0+(r1-r0)*t;
  for(let j=0;j<=rad;j++){const a=j/rad*2*Math.PI,cs=Math.cos(a),sn=Math.sin(a);const nn=[n[0]*cs+b[0]*sn,n[1]*cs+b[1]*sn,n[2]*cs+b[2]*sn];
   pos.push(c[0]+nn[0]*r,c[1]+nn[1]*r,c[2]+nn[2]*r);nrm.push(nn[0],nn[1],nn[2]);uv.push(t*uvl,j/rad*uvc)}}
 for(let i=0;i<seg;i++)for(let j=0;j<rad;j++){const a=i*(rad+1)+j,b=a+rad+1;idx.push(a,b,a+1,b,b+1,a+1)}
 return mkGeo(pos,nrm,uv,idx,shells)}
const h=x=>[(x>>16&255)/255,(x>>8&255)/255,(x&255)/255];
// Fell: len = Haarlänge, dens = Haare je Einheit, comb = wie stark gekämmt, occ = Schatten am Haaransatz
function F(par,o){const n=par.add(new Nd(o));const r=(n.sc[0]+n.sc[1]+n.sc[2])/3;
 n.part=Object.assign({neu:true,tat:!!o.tat,herz:o.herz?[h(o.herz[0]),h(o.herz[1])]:null,mat:0,geo:o.geo||SPH(SH),root:h(o.root),tip:h(o.tip),len:.1,grav:.03,comb:.9,occ:.16,vari:.5,spec:1,sss:0,clump:2.2,thin:0,curl:.5,wild:1.4,blush:0,tile:o.tile!=null?o.tile:r*1.5708*Math.min(o.dens||46,DMAX)/CELLS},
  ['len','grav','comb','occ','vari','spec','clump','groom','thin','curl','blush','wild'].reduce((a,k)=>{if(o[k]!=null)a[k]=o[k];return a},{}));
 return n}
function K(par,o){const n=par.add(new Nd(o));n.part={neu:true,mat:o.mat||1,geo:o.geo||SPH(1),root:h(o.color),tip:h(o.color),len:0,grav:0,comb:0,occ:o.occ==null?1:o.occ,vari:o.vari==null?.25:o.vari,spec:o.spec==null?20:o.spec,sss:o.sss||0,clump:1,curl:0,blush:o.blush||0,tile:1};return n}
const GROOM=[0,-1,-.45];
// ein Teil zeichnen (von js/33 drawNode aufgerufen; js/33 stellt danach sein eigenes Programm wieder ein)
function teil(n,p,w,VPm,cam){gl.useProgram(PRG);
 gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,strTex);gl.uniform1i(U.uStr,2);gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,nzTex);gl.uniform1i(U.uNz,3);gl.activeTexture(gl.TEXTURE0);
 gl.bindVertexArray(p.geo.vao);
 gl.uniformMatrix4fv(U.uVP,false,VPm);gl.uniformMatrix4fv(U.uM,false,w);gl.uniformMatrix3fv(U.uNM,false,M.nm(w));
 gl.uniform1f(U.uLen,p.len);gl.uniform1f(U.uGrav,p.grav);gl.uniform1f(U.uComb,p.comb);gl.uniform1f(U.uTile,p.tile);
 const g=p.groom||GROOM,gn=Math.hypot(g[0],g[1],g[2]);gl.uniform3f(U.uGroom,g[0]/gn,g[1]/gn,g[2]/gn);
 gl.uniform3f(U.uRoot,p.root[0],p.root[1],p.root[2]);gl.uniform3f(U.uTip,p.tip[0],p.tip[1],p.tip[2]);gl.uniform3f(U.uCam,cam[0],cam[1],cam[2]);gl.uniform1i(U.uMat,p.mat);
 gl.uniform1f(U.uSpec,p.spec);gl.uniform1f(U.uOcc,p.occ);gl.uniform1f(U.uVar,p.vari);gl.uniform1f(U.uSss,p.sss);gl.uniform1f(U.uGy,0);gl.uniform1f(U.uClump,p.clump);gl.uniform1f(U.uThin,p.thin||0);gl.uniform1f(U.uCurl,p.curl||0);gl.uniform1f(U.uWild,p.wild||0);gl.uniform1f(U.uBlush,p.blush||0);gl.uniform1i(U.uTat,1);gl.uniform1f(U.uTatOn,p.tat&&tatAn()?1:0);gl.uniform1f(U.uHerz,p.herz?1:0);if(p.herz){gl.uniform3fv(U.uRoot2,p.herz[0]);gl.uniform3fv(U.uTip2,p.herz[1])}
 const sh=p.geo.shells,nS=sh>1?Math.max(4,Math.min(sh,Math.round(schichten()*SH/14))):1;gl.uniform1f(U.uLayerMul,sh>1&&nS>1?(sh-1)/(nS-1):1);
 gl.drawElementsInstanced(gl.TRIANGLES,p.geo.n,gl.UNSIGNED_INT,0,nS)}
// ---------- Bausteine fürs Gesicht ----------
const P2=Math.PI;
const ohrCache={};function ohrGeo(sh){if(ohrCache[sh])return ohrCache[sh];const pos=[];
 for(let i=0;i<CUBD.pos.length;i+=3){let x=CUBD.pos[i],y=CUBD.pos[i+1],z=CUBD.pos[i+2];const o=Math.max(0,y+.25)/1.25;
  x*=1-.7*o*o;const k=Math.max(0,y-.1);z+=2.6*k*k;y-=.12*k*k;pos.push(x,y,z)}
 return ohrCache[sh]=mkGeo(pos,CUBD.nrm,CUBD.uv,CUBD.idx,sh)}
// Fläche auf einer Oberfläche zf(x,y): zwischen oberer und unterer Kurve (offener Mund, Zunge)
function lippe(zf,w,yT,yB,off){const pos=[],nrm=[],uv=[],idx=[],nx=24,ny=6;
 for(let i=0;i<=nx;i++)for(let j=0;j<=ny;j++){const x=-w+2*w*i/nx,v=j/ny,y=yT(x)+(yB(x)-yT(x))*v;pos.push(x,y,zf(x,y)+off);nrm.push(0,.15,1);uv.push(i/nx,v)}
 for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const q=i*(ny+1)+j,r=q+ny+1;idx.push(q,r,q+1,r,r+1,q+1)}return mkGeo(pos,nrm,uv,idx,1)}
function lachen(H,zf,w,y0,dT,dB,zt){zt=zt||.012;const u=x=>1-(x/w)**2;const L=[];   // gibt die Teile zurück (js/33 blendet sie beim Erschrecken aus)
 L.push(K(H,{geo:lippe(zf,w,x=>y0-dT*u(x),x=>y0-dB*u(x),.006),color:0x5c1f1c,spec:2,vari:0}));                       // Mund innen
 L.push(K(H,{geo:lippe(zf,w*.6,x=>y0-dB*u(x)+(dB-dT)*.6*(1-(x/(w*.6))**2),x=>y0-dB*u(x)*.97,zt),color:0xe58a92,spec:20,sss:1,vari:0}));   // Zunge
 const kurve=(d,n)=>{n=n||16;const p=[];for(let i=0;i<=n;i++){const x=-w*1.08+2.16*w*i/n,y=y0-d*(1-(x/(w*1.08))**2)+.012*(Math.abs(x)/w)**3;p.push([x,y,zf(x,y)+.012])}return p};
 L.push(K(H,{geo:tube(kurve(dT),.011,.011,1,30,8),color:0x8a4438,spec:2,vari:0}));return L}                                   // Oberlippe, Mundwinkel leicht hoch
// Auge: Lidrand (Haut), Augapfel mit Iris/Pupille/Glanz, Lidstrich, Wimpern; gibt den Augapfel zurück (js/33 lässt ihn blinzeln)
function auge(H,x,y,z,sx,sy,iris,lid,s,wimper,ohneWimper){
 K(H,{pos:[x,y,z-.022],sc:[sx*1.1,sy*1.1,.08],color:lid,spec:5,vari:.04});
 const ball=K(H,{pos:[x,y,z],sc:[sx,sy,.085],color:iris,mat:2,vari:.93,sss:.86,spec:.8,occ:1});
 const bogen=[];for(let i=0;i<=12;i++){const a=(18+144*i/12)*P2/180;bogen.push([x+sx*1.04*Math.cos(a),y+sy*1.04*Math.sin(a),z+.045-.05*Math.abs(Math.cos(a))])}
 K(H,{geo:tube(bogen,.009,.009,1,24,6),color:wimper,spec:2,vari:0});          // Lidstrich
 if(!ohneWimper){ const a=(s>0?180-158:158)*P2/180,c=Math.cos(a),sn=Math.sin(a);              // Wimper außen
  K(H,{geo:tube([[x+sx*1.02*c,y+sy*1.02*sn,z+.01],[x+sx*1.3*c,y+sy*1.34*sn,z-.01],[x+sx*1.48*c,y+sy*1.62*sn,z-.04]],.008,.003,1,10,6),color:wimper,spec:2,vari:0}); }
 return ball}
function braue(H,x,y,z,w,s,farbe){const p=[];for(let i=0;i<=8;i++){const u=i/8*2-1;p.push([x+u*w,y+.05*(1-u*u)+s*u*.035,z-.035*u*u])}   // freundlich: hoch, weich gebogen
 K(H,{geo:tube(p,.02,.02,1,20,8),color:farbe,spec:2,vari:0});}
// ---------- Schweinchen (wie freigegeben: entwurf-figuren/schweinchen-freigegeben.png) ----------
function buildPig(){const R=new Nd();const eyes=[];
 const flaum={root:0xe3998f,tip:0xfdeae4,len:.12,grav:.01,comb:1.1,occ:.58,vari:.09,spec:.5,dens:64,curl:.15,wild:.35,clump:2.2,thin:.3};
 const H=R.add(new Nd({pos:[0,1.58,.05]}));H.gs=[1.25,1.25,1.25];
 F(H,Object.assign({sc:[1,1,1],blush:1.2,groom:[0,-1,.1],tat:true},flaum));
 F(H,Object.assign({},flaum,{pos:[0,.7,0],sc:[.42,.34,.5],len:.16,comb:.5,tip:0xfff6ee,groom:[.3,.6,-.6]}));   // kleiner frecher Schopf
 const zH=(x,y)=>Math.sqrt(Math.max(0,1-x*x-y*y));
 for(const s of [-1,1]){
  F(H,Object.assign({},flaum,{geo:ohrGeo(SH),pos:[s*.9,.52,.02],sc:[.34,.5,.075],rot:[.2,0,-s*1.22],len:.05,root:0xd89088,comb:.6}));   // spitze Schlappohren
  K(H,{geo:ohrGeo(1),pos:[s*.9,.515,.055],sc:[.25,.41,.05],rot:[.2,0,-s*1.22],color:0xe5958c,spec:8,sss:3.0,vari:.05});
  eyes.push({n:auge(H,s*.41,.22,.925,.16,.185,0x5c3216,0xe8a79b,s,0x3a2019),g:[],y:.185});
  braue(H,s*.41,.5,zH(s*.41,.5)+.075,.12,-s,0xb9806f);
 }
 K(H,{pos:[0,-.2,.9],sc:[.5,.4,.3],color:0xe5a094,spec:10,sss:1.8,vari:.04});
 K(H,{pos:[0,-.2,.98],sc:[.42,.32,.3],color:0xeeaa9f,spec:34,sss:1.8,vari:.05});
 for(const s of [-1,1])K(H,{pos:[s*.14,-.2,1.262],sc:[.05,.08,.03],color:0x8f4848,spec:4,vari:.04});
 const lae=lachen(H,(x,y)=>zH(x,y)+.075,.2,-.62,.02,.14);
 // Erschrecken an der Kante (js/33, Pose „kante“): runder offener Mund statt Lächeln
 const angstMund=K(H,{pos:[0,-.68,zH(0,-.68)+.07],sc:[.085,.11,.04],color:0x4a1716,spec:8,vari:0});angstMund.visible=false;angstMund.sc0=angstMund.sc.slice();
 for(const s of [-1,1]){const A=R.add(new Nd({pos:[s*1.14,1.57,.1]}));   // Stellung der Arme gibt js/33 vor (Haltungen)
  F(A,Object.assign({},flaum,{pos:[0,-.26,0],sc:[.26,.36,.26],tat:true}));
  for(const hx of [-.075,.075])K(A,{pos:[hx,-.64,.03],sc:[.08,.12,.11],color:0x5a4238,spec:3,vari:.05});R['a'+s]=A}
 for(const s of [-1,1]){const L=R.add(new Nd({pos:[s*.5,1.396,.1]}));
  F(L,Object.assign({},flaum,{pos:[0,-.92,.08],sc:[.36,.26,.4]}));
  for(const hx of [-.12,.12])K(L,{pos:[hx,-1.2,.22],sc:[.12,.13,.25],color:0x5a4238,spec:3,vari:.05});L.base=L.pos.slice();R['l'+s]=L}
 const tp=[];for(let i=0;i<=40;i++){const t=i/40;tp.push([.2*Math.sin(t*10),.78+.2*Math.cos(t*10)+t*.15,-.85-.85*t])}
 K(R,{geo:tube(tp,.06,.03,1,80,10,6,1),color:0xe5a094,spec:10,sss:1.6,vari:.04});
 // Schirm-Stiel fürs Schirm-Trampolin (js/33 blendet ihn ein, Nutzer 19.11.: „Hände auf den Schirmstängel legen“): ein echter Holzstab VOR dem
 // Bauch mit gebogenem Griff – weil er Teil der Figur ist, greifen die Hufe wirklich von vorn darüber. Das obere Stück (stielOben) streckt js/33 bis zur Kuppel.
 const ST=R.add(new Nd({pos:[0,0,1.8]}));ST.visible=false;const HOLZ=0xb9824a;
 K(ST,{geo:tube([[0,1.32,0],[0,1.0,0],[0,.82,0],[-.03,.68,0],[-.13,.57,0],[-.26,.56,0],[-.36,.65,0],[-.39,.78,0]],.125,.125,1,40,10),color:HOLZ,mat:3,spec:28,vari:.3});
 const STO=K(ST,{geo:tube([[0,0,0],[0,.34,0],[0,.67,0],[0,1,0]],.125,.125,1,8,10),pos:[0,1.3,0],color:HOLZ,mat:3,spec:28,vari:.3});
 return {root:R,head:H,armN:R['a-1'],armP:R['a1'],legN:R['l-1'],legP:R['l1'],eyes,stiel:ST,stielOben:STO,lae,angstMund}}
// ---------- Affe (wie freigegeben: entwurf-figuren/affe-modell-*.png, hier mit demselben Schichten-Fell wie das Schweinchen) ----------
// Gleiche Griffe wie buildMonkey in js/33 (Haltungen bleiben dort): root, head, armN/armP (kids[0] = Fell-Arm, danach Hand), legN/legP,
// eyes, tail (Glieder segs), backen + mundO (Pusten), lae (Lächeln).
function buildMonkey(){const R=new Nd();const eyes=[];
 const HAUT=0xe8a77e,BR_W=0x7a4e2c,BR_S=0xc08c58,HE_W=0xe2bc98,HE_S=0xfff4e6;
 const fell={root:BR_W,tip:BR_S,len:.12,grav:.01,comb:1.1,occ:.5,vari:.16,spec:.5,dens:64,curl:.2,wild:.45,clump:2.2,thin:.3};
 const H=R.add(new Nd({pos:[0,1.58,.05]}));H.gs=[1.25,1.25,1.25];
 F(H,Object.assign({sc:[1,1,1],groom:[0,-1,.1],tat:true,herz:[HE_W,HE_S]},fell));      // braunes Fell, helles Herz-Gesicht (Farbe im Shader)
 F(H,Object.assign({},fell,{pos:[0,.88,.06],sc:[.34,.22,.52],len:.11}));                    // leichter Irokese: schmaler Kamm aus demselben Fell
 const zH=(x,y)=>Math.sqrt(Math.max(0,1-x*x-y*y));
 for(const s of [-1,1]){
  K(H,{pos:[s*1.0,.14,-.02],sc:[.3,.3,.085],rot:[0,s*.75,0],color:0xe59a78,spec:8,sss:2.6,vari:.05});    // Ohr: glatt und rosa
  K(H,{pos:[s*1.03,.14,.05],sc:[.21,.22,.05],rot:[0,s*.75,0],color:0xd9756c,spec:4,sss:2.2,vari:.05});  // Ohrmuschel
  eyes.push({n:auge(H,s*.345,.05,.945,.2,.215,0x4a2a14,0xd9ad82,s,0x2a160b,true),g:[],y:.215});          // dunkelbraune Augen, nur Lidstrich oben
  braue(H,s*.365,.42,zH(s*.365,.42)+.1,.14,-s,0x4a2c16);
 }
 K(H,{pos:[0,-.37,.84],sc:[.36,.27,.3],color:0xe9a882,spec:14,sss:1.6,vari:.04});                           // glattes Schnäuzchen
 K(H,{pos:[0,-.25,1.12],sc:[.06,.042,.04],color:0xdf8f7c,spec:22,sss:1.6,vari:0});                          // Nase
 for(const s of [-1,1])K(H,{pos:[s*.022,-.262,1.152],sc:[.012,.009,.008],color:0x4e241a,spec:2,vari:0});
 const zS=(x,y)=>.84+.3*Math.sqrt(Math.max(0,1-(x/.36)**2-((y+.37)/.27)**2));
 const mp=[];for(let i=0;i<=12;i++){const x=-.2+.4*i/12,y=-.5+.075*(x/.2)**2;mp.push([x,y,zS(x,y)+.008])}
 const lae=[K(H,{geo:tube(mp,.012,.012,1,30,8),color:0x55261a,spec:2,vari:0}),                              // Lächeln
  K(H,{geo:tube([[0,-.3,zS(0,-.3)+.006],[0,-.37,zS(0,-.37)+.006],[0,-.44,zS(0,-.44)+.006]],.006,.006,1,10,6),color:0xb9785c,spec:2,vari:0})];   // Rinne unter der Nase
 // Pusten (js/34): aufgeblasene Backen und runder Mund – js/33 blendet sie ein
 const backen=[-1,1].map(s=>{const b=K(H,{pos:[s*.3,-.36,.9],sc:[.24,.22,.22],color:0xe9a882,spec:14,sss:1.6,vari:.04});b.visible=false;b.sc0=b.sc.slice();return b});
 const mundO=K(H,{pos:[0,-.5,1.13],sc:[.07,.08,.04],color:0x3a1a12,spec:10,vari:0});mundO.visible=false;mundO.sc0=mundO.sc.slice();
 const AP=[];for(const s of [-1,1]){const A=R.add(new Nd({pos:[s*1.16,1.54,.1]}));
  F(A,Object.assign({},fell,{pos:[0,-.3,0],sc:[.25,.4,.25],len:.09,tat:true}));
  K(A,{pos:[0,-.74,.04],sc:[.17,.16,.13],color:HAUT,spec:10,sss:.8,vari:.06});
  for(const fx of [-.1,0,.1])K(A,{pos:[fx,-.9+Math.abs(fx)*.25,.07],sc:[.055,.08,.055],color:HAUT,spec:10,sss:.8,vari:.06});
  K(A,{pos:[-s*.17,-.76,.08],sc:[.055,.075,.055],color:HAUT,spec:10,sss:.8,vari:.06});AP.push(A)}
 const LP=[];for(const s of [-1,1]){const L=R.add(new Nd({pos:[s*.5,1.396,.1]}));
  F(L,Object.assign({},fell,{pos:[0,-.92,.06],sc:[.36,.26,.38],len:.09}));
  K(L,{pos:[0,-1.21,.16],sc:[.27,.15,.31],color:HAUT,spec:10,sss:1,vari:.06});
  for(let i=0;i<4;i++)K(L,{pos:[(i-1.5)*.12,-1.25,.42],sc:[.062,.068,.085],color:HAUT,spec:10,sss:1,vari:.06});
  L.base=L.pos.slice();LP.push(L)}
 const TL=R.add(new Nd({pos:[0,.93,-1.0]}));TL.segs=[];   // Schwanz aus Gliedern: rollt sich wie bisher ein und aus
 { let par=TL;const NS=7,SEG=.33;
   for(let i=0;i<NS;i++){const Si=par.add(new Nd({pos:i?[0,0,-SEG]:[0,0,0]})),rd=.13-.01*i;
    F(Si,Object.assign({},fell,{pos:[0,0,-SEG/2],sc:[rd,rd,SEG*.68],len:.07,occ:.2,groom:[0,-.3,-1]}));   // ein Glied = ein längliches Fell-Stück, überlappend (keine Ringe)
    TL.segs.push(Si);par=Si}
   F(par,Object.assign({},fell,{pos:[0,0,-SEG],sc:[.11,.11,.11],len:.06})); }
 return {root:R,head:H,armN:AP[0],armP:AP[1],legN:LP[0],legP:LP[1],eyes,tail:TL,backen,mundO,lae,angstMund:mundO}}
return {buildPig,buildMonkey,teil};
};
