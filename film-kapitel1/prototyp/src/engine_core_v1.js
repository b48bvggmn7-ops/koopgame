let seed=777;const rnd=()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296;
const DPR=2;
// ---------- Mathe ----------
const M={id(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])},
mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o},
T(x,y,z){const m=M.id();m[12]=x;m[13]=y;m[14]=z;return m},
S(x,y,z){const m=M.id();m[0]=x;m[5]=y;m[10]=z;return m},
RX(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1])},
RY(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1])},
RZ(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1])},
ortho(l,r,b,t,n,f){return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1])},
persp(f,a,n,fa){const t=1/Math.tan(f/2);return new Float32Array([t/a,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0])},
look(e,c,u){let z=[e[0]-c[0],e[1]-c[1],e[2]-c[2]];let l=Math.hypot(...z);z=z.map(v=>v/l);
 let x=[u[1]*z[2]-u[2]*z[1],u[2]*z[0]-u[0]*z[2],u[0]*z[1]-u[1]*z[0]];l=Math.hypot(...x);x=x.map(v=>v/l);
 const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
 const d=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
 return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-d(x,e),-d(y,e),-d(z,e),1])},
nm(m){const a=(r,c)=>m[c*4+r];const cof=(r,c)=>{const rs=[0,1,2].filter(i=>i!==r),cs=[0,1,2].filter(i=>i!==c);
 return ((r+c)%2?-1:1)*(a(rs[0],cs[0])*a(rs[1],cs[1])-a(rs[0],cs[1])*a(rs[1],cs[0]))};
 const det=a(0,0)*cof(0,0)+a(0,1)*cof(0,1)+a(0,2)*cof(0,2);const o=new Float32Array(9);
 for(let r=0;r<3;r++)for(let c=0;c<3;c++)o[c*3+r]=cof(r,c)/det;return o}};
// ---------- GL ----------
const cv=document.createElement('canvas');cv.width=SPR;cv.height=SPRH;
const gl=cv.getContext('webgl2',{antialias:true,alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:false});
if(!gl)throw new Error('kein webgl2');
function prog(vs,fs){const p=gl.createProgram();for(const [t,s] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));gl.attachShader(p,sh)}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p}
const VS=`#version 300 es
in vec3 aPos;in vec3 aNrm;in vec2 aUv;in float aLayer;
uniform mat4 uVP,uM;uniform mat3 uNM;uniform vec3 uScale;uniform float uLen,uGrav;uniform vec2 uTile;
out vec2 vUv;out vec2 vUv0;out vec3 vN;out float vL;out vec3 vW;
void main(){vUv0=aUv;vec3 p=aPos+aNrm*uLen*aLayer/uScale;vec4 w=uM*vec4(p,1.);w.y-=uGrav*aLayer*aLayer;
vW=w.xyz;vN=normalize(uNM*aNrm);vUv=aUv*uTile;vL=aLayer;gl_Position=uVP*w;}`;
const FS=`#version 300 es
precision highp float;
uniform sampler2D uNoise,uTat;uniform vec3 uRoot,uTip,uCam;uniform float uFur,uSpec,uEmit,uAlpha,uTatOn;uniform vec3 uLicht;uniform float uSzene;uniform vec3 uKey,uKeyCol,uRim,uRimCol,uAmb0,uAmb1;
in vec2 vUv;in vec2 vUv0;in vec3 vN;in float vL;in vec3 vW;out vec4 o;
void main(){
 vec3 L1=normalize(vec3(0.45,0.8,0.75)),L2=normalize(vec3(-0.8,0.2,0.4)),L3=normalize(vec3(-0.2,0.5,-0.9));
 float layer=vL;vec4 t=vec4(.5,.5,0.,1.);float cov=1.;
 if(uFur>.5){t=texture(uNoise,vUv);vec4 t2=texture(uNoise,mat2(.8,.6,-.6,.8)*vUv*1.37+vec2(.31,.17));float nn=.88+.12*max(t.r,t2.r*.85);if(layer>0.001){cov=smoothstep(layer-.22,layer+.04,nn);if(cov<.04)discard;}}
 vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;
 float wrap=clamp(dot(N,L1)*.5+.5,0.,1.);wrap=smoothstep(0.,1.,wrap);
 float d2=max(dot(N,L2),0.)*.35;
 vec3 V=normalize(uCam-vW);
 float f=uFur>.5?(.4+.4*smoothstep(0.,1.,layer)):0.;
 vec3 base=pow(mix(uRoot,uTip,f),vec3(2.2));
 if(uFur>.5)base*=.997+.006*t.g;
 if(uTatOn>.5){vec4 tc=texture(uTat,vUv0);base=mix(base,pow(tc.rgb,vec3(2.2)),tc.a*.9);}   // Tattoo färbt das Fell
 float ao=uFur>.5?mix(.86,1.,layer):1.;
 vec3 col;
 if(uSzene>.5){
  // Filmlicht im Zimmer: warmes Hauptlicht von der Lampe (weicher Übergang), Umgebungslicht von oben/unten,
  // Kontaktschatten unten, warmer Saum an der Licht-Schatten-Grenze (wie Licht durch Plüsch), kühler Mond-Saum
  float k=dot(N,uKey);float diff=smoothstep(-.35,1.,k);
  float boden=mix(.5,1.,smoothstep(.0,1.4,vW.y));
  float falte=uFur>.5?mix(.72,1.,smoothstep(.0,.55,layer)):1.;
  vec3 amb=mix(uAmb0,uAmb1,N.y*.5+.5);
  float vorn=max(dot(N,V),0.);
  col=base*(amb*boden*falte+uKeyCol*diff*mix(.8,1.,boden)+uAmb1*.55*vorn*vorn*boden)*ao;
  col+=base*vec3(1.,.45,.3)*uKeyCol*smoothstep(-.35,.05,k)*(1.-smoothstep(.05,.5,k))*.35;
  float rr=pow(1.-max(dot(N,V),0.),4.)*smoothstep(0.,.7,dot(N,uRim));
  col+=uRimCol*rr*(base*.9+.05)*(uFur>.5?(.3+.7*layer):.6);
  float lum=dot(col,vec3(.3,.59,.11));col=max(mix(vec3(lum),col,1.18),0.);
 } else {
 vec3 hemi=mix(vec3(.62,.68,.56),vec3(1.,.97,.9),N.y*.5+.5);
 col=base*(hemi*.62+vec3(1.,.95,.86)*wrap*.78+d2*vec3(.7,.85,1.))*ao*1.18;
 col+=base*vec3(1.,.55,.45)*(1.-wrap)*.14; }
 if(uTatOn>.5){vec4 tc=texture(uTat,vUv0);col=mix(col,pow(tc.rgb,vec3(2.2))*(.5+.6*wrap),tc.a*.8);}   // Tattoo kräftig: auch nach dem Licht (Haarspitzen/Licht hellen es sonst auf)
 float rim=pow(1.-max(dot(N,V),0.),3.)*(dot(N,L3)*.5+.5)*(1.-uSzene);
 col+=(uFur>.5?pow(uTip,vec3(2.2))*layer*.6:vec3(.06))*rim;
 vec3 LK=uSzene>.5?uKey:L1;
 if(uFur>.5){vec3 H2=normalize(LK+V);col+=vec3(1.,.97,.9)*pow(max(dot(N,H2),0.),22.)*(.04+.2*layer)*.5;}
 if(uSpec>0.){vec3 H=normalize(LK+V);col+=vec3(1.)*pow(max(dot(N,H),0.),uSpec)*.8;}
 col=mix(col,base,uEmit);
 o=vec4(pow(col*uLicht,vec3(1./2.2)),uAlpha*cov);}`;
const PRG=prog(VS,FS);
const BGP=prog(`#version 300 es
out vec2 v;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);v=p;gl_Position=vec4(p*2.-1.,0.,1.);}`,
`#version 300 es
precision highp float;in vec2 v;out vec4 o;uniform vec3 uA,uB;
void main(){vec3 c=mix(uB,uA,smoothstep(0.,1.,v.y));c+=.08*(1.-length((v-vec2(.5,.45))*vec2(1.,1.2)));o=vec4(c,1.);}`);
const U={};for(const n of ['uVP','uM','uNM','uScale','uLen','uGrav','uTile','uNoise','uRoot','uTip','uCam','uFur','uSpec','uEmit','uAlpha','uTat','uTatOn','uLicht','uSzene','uKey','uKeyCol','uRim','uRimCol','uAmb0','uAmb1'])U[n]=gl.getUniformLocation(PRG,n);
// Haar-Textur: runde, spitz zulaufende Haare
const noise=(()=>{const cells=128,px=6,s=cells*px;const c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');const img=x.createImageData(s,s);
 const R=[];for(let i=0;i<cells*cells;i++)R.push([0.35+0.65*rnd(),rnd(),(rnd()-.5)*.3,(rnd()-.5)*.3]);
 for(let cy=0;cy<cells;cy++)for(let cx=0;cx<cells;cx++){const [r,t,jx,jy]=R[cy*cells+cx];
  for(let py=0;py<px;py++)for(let qx=0;qx<px;qx++){const dx=(qx+.5)/px-.5-jx,dy=(py+.5)/px-.5-jy;const d=Math.hypot(dx,dy)*2;
   const v=Math.max(0,r*(1-d*.85));const i=((cy*px+py)*s+cx*px+qx)*4;img.data[i]=v*255;img.data[i+1]=t*255;img.data[i+2]=0;img.data[i+3]=255}}
 x.putImageData(img,0,0);const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);return tex})();
// ---------- Geometrie ----------
function mkGeo(pos,nrm,uv,idx,shells){const vao=gl.createVertexArray();gl.bindVertexArray(vao);
 const buf=(d,loc,n,div)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,gl.FLOAT,false,0,0);if(div)gl.vertexAttribDivisor(loc,1)};
 buf(pos,0,3);buf(nrm,1,3);buf(uv,2,2);
 const ix=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ix);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(idx),gl.STATIC_DRAW);
 const L=[];for(let i=0;i<shells;i++)L.push(shells===1?0:i/(shells-1));buf(L,3,1,true);
 return {vao,n:idx.length,shells,roh:{pos,idx},id:(mkGeo.z=(mkGeo.z||0)+1)}}
function sphereData(sg=48,rg=32){const pos=[],uv=[],idx=[];for(let i=0;i<=rg;i++){const v=i/rg,th=v*Math.PI;for(let j=0;j<=sg;j++){const u=j/sg,ph=u*2*Math.PI;
 pos.push(Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph));uv.push(u,v)}}
 for(let i=0;i<rg;i++)for(let j=0;j<sg;j++){const a=i*(sg+1)+j,b=a+sg+1;idx.push(a,b,a+1,b,b+1,a+1)}return {pos,nrm:pos.slice(),uv,idx}}
const SPHD=sphereData(36,24);const sphereCache={};
function SPH(shells){return sphereCache[shells]||(sphereCache[shells]=Object.assign(mkGeo(SPHD.pos,SPHD.nrm,SPHD.uv,SPHD.idx,shells),{kugel:true}))}
function cr(p,t){const n=p.length-1;const f=Math.min(n-1e-6,Math.max(0,t*n));const i=Math.floor(f),u=f-i;const g=k=>p[Math.max(0,Math.min(n,k))];
 return [0,1,2].map(a=>{const p0=g(i-1)[a],p1=g(i)[a],p2=g(i+1)[a],p3=g(i+2)[a];return .5*((2*p1)+(-p0+p2)*u+(2*p0-5*p1+4*p2-p3)*u*u+(-p0+3*p1-3*p2+p3)*u*u*u)})}
function tube(pts,r0,r1,shells,seg=60,rad=14){const pos=[],nrm=[],uv=[],idx=[];let prevN=null;
 for(let i=0;i<=seg;i++){const t=i/seg,c=cr(pts,t),c2=cr(pts,Math.min(1,t+.01)),c1=cr(pts,Math.max(0,t-.01));
  let tg=[c2[0]-c1[0],c2[1]-c1[1],c2[2]-c1[2]];let l=Math.hypot(...tg);tg=tg.map(v=>v/l);
  let n=prevN||(Math.abs(tg[1])<.9?[0,1,0]:[1,0,0]);const dp=n[0]*tg[0]+n[1]*tg[1]+n[2]*tg[2];n=[n[0]-dp*tg[0],n[1]-dp*tg[1],n[2]-dp*tg[2]];l=Math.hypot(...n);n=n.map(v=>v/l);prevN=n;
  const b=[tg[1]*n[2]-tg[2]*n[1],tg[2]*n[0]-tg[0]*n[2],tg[0]*n[1]-tg[1]*n[0]];const r=r0+(r1-r0)*t;
  for(let j=0;j<=rad;j++){const a=j/rad*2*Math.PI,cs=Math.cos(a),sn=Math.sin(a);const nn=[n[0]*cs+b[0]*sn,n[1]*cs+b[1]*sn,n[2]*cs+b[2]*sn];
   pos.push(c[0]+nn[0]*r,c[1]+nn[1]*r,c[2]+nn[2]*r);nrm.push(...nn);uv.push(t,j/rad)}}
 for(let i=0;i<seg;i++)for(let j=0;j<rad;j++){const a=i*(rad+1)+j,b=a+rad+1;idx.push(a,b,a+1,b,b+1,a+1)}
 return mkGeo(pos,nrm,uv,idx,shells)}
// ---------- Szenengraph ----------
const TAT={on:false};   // Tattoo der gerade gezeichneten Figur an/aus (Textur auf Einheit 1)
class Nd{constructor(o={}){this.pos=o.pos||[0,0,0];this.rot=o.rot||[0,0,0];this.sc=o.sc||[1,1,1];this.kids=[];this.part=null;this.visible=true}
 add(k){this.kids.push(k);return k}}
const h=x=>[(x>>16&255)/255,(x>>8&255)/255,(x&255)/255];
const SHELLS=FELL_SCHICHTEN;
function F(par,o){const n=par.add(new Nd(o));const r=(n.sc[0]+n.sc[1]+n.sc[2])/3;const dens=(o.dens||30)*FELL_DICHTE;
 n.part={geo:o.geo||SPH(SHELLS),fur:true,root:h(o.root),tip:h(o.tip),len:o.len||.09,grav:o.grav==null?.05:o.grav,tile:o.tile||[r*2*Math.PI*dens/128,r*Math.PI*dens/128],spec:0,emit:0,alpha:1,tat:!!o.tat};return n}
function K(par,o){const n=par.add(new Nd(o));n.part={geo:o.geo||SPH(1),fur:false,root:h(o.color),tip:h(o.color),len:0,grav:0,tile:[1,1],spec:o.spec||0,emit:o.emit||0,alpha:o.alpha==null?1:o.alpha};return n}
function drawNode(n,pm,VPm,cam){const loc=M.mul(M.mul(M.mul(M.T(...n.pos),M.RZ(n.rot[2])),M.mul(M.RY(n.rot[1]),M.RX(n.rot[0]))),M.S(...n.sc));
 let parentOnly=M.mul(pm,M.mul(M.mul(M.T(...n.pos),M.RZ(n.rot[2])),M.mul(M.RY(n.rot[1]),M.RX(n.rot[0]))));if(n.gs)parentOnly=M.mul(parentOnly,M.S(...n.gs));const w=M.mul(pm,loc);
 if(n.cap)n.capM=w;if(n.part)n.wM=w;
 if(n.part&&n.visible){const p=n.part;gl.bindVertexArray(p.geo.vao);
  gl.uniformMatrix4fv(U.uVP,false,VPm);gl.uniformMatrix4fv(U.uM,false,w);gl.uniformMatrix3fv(U.uNM,false,M.nm(w));
  gl.uniform3f(U.uScale,...n.sc);gl.uniform1f(U.uLen,p.len);gl.uniform1f(U.uGrav,p.grav);gl.uniform2f(U.uTile,...p.tile);
  gl.uniform3f(U.uRoot,...p.root);gl.uniform3f(U.uTip,...p.tip);gl.uniform3f(U.uCam,...cam);
  gl.uniform1f(U.uFur,p.fur?1:0);gl.uniform1f(U.uTatOn,p.tat&&TAT.on?1:0);gl.uniform1f(U.uSpec,p.spec);gl.uniform1f(U.uEmit,p.emit);gl.uniform1f(U.uAlpha,p.alpha);
  gl.drawElementsInstanced(gl.TRIANGLES,p.geo.n,gl.UNSIGNED_INT,0,p.geo.shells)}
 if(n.visible)for(const k of n.kids)drawNode(k,parentOnly,VPm,cam)}
// ---------- Affe ----------
function glints(H,x,y,z,s){return [K(H,{geo:SPH(1),pos:[x+.07*s,y+.105,z+.085],sc:[.075,.075,.04],color:0xffffff,emit:1}),
 K(H,{geo:SPH(1),pos:[x-.06*s,y-.1,z+.08],sc:[.036,.036,.025],color:0xffffff,emit:1})]}
function buildMonkey(){const R=new Nd();const eyes=[];const ROOT=0x95592e,TIP=0xe3ab6b;
 const H=R.add(new Nd({pos:[0,1.8,.05]}));H.gs=[1.25,1.25,1.25];
 F(H,{sc:[1.08,1,1],root:ROOT,tip:TIP,len:.11,tat:true});
 F(H,{pos:[0,.95,.3],sc:[.3,.22,.3],root:0x9a6234,tip:0xe0aa6c,len:.13});
 F(H,{pos:[.16,.93,.25],sc:[.16,.16,.2],rot:[0,0,-.4],root:0x9a6234,tip:0xe0aa6c,len:.1});
 for(const s of [-1,1]){
  K(H,{pos:[s*.34,-.02,.92],sc:[.42,.38,.18],color:0xffe2c2,spec:30});
  F(H,{pos:[s*1.0,.12,-.05],sc:[.14,.36,.36],root:ROOT,tip:0x9a6a3c,len:.05,tat:true});
  K(H,{pos:[s*1.1,.12,0],sc:[.07,.25,.25],color:0xe9a38f,spec:10});
  { const e = K(H,{pos:[s*.36,.16,1.07],sc:[.23,.28,.11],color:0x1a0f0b,spec:140}); eyes.push({n:e, g:glints(H,s*.36,.16,1.07,s), y:.26}); }
  K(H,{pos:[s*.66,-.2,.78],sc:[.22,.14,.06],color:0xff8f9a,alpha:.65});
  F(H,{pos:[s*.36,.5,.86],sc:[.22,.07,.09],rot:[0,0,-s*.25],root:0x6a4020,tip:0xa8703c,len:.05,grav:.01});
}
 K(H,{pos:[0,-.42,.88],sc:[.52,.38,.34],color:0xffeacb,spec:34});
 K(H,{pos:[0,-.28,1.185],sc:[.1,.065,.05],color:0x4b2d22,spec:60});
 const mp=[];for(let i=0;i<=10;i++){const x=-.25+i*.05;const y=-.5-.11*(1-(x/.25)**2);const q=Math.max(0,1-(x/.52)**2-((y+.42)/.38)**2);mp.push([x,y,.88+.34*Math.sqrt(q)+.012])}
 K(H,{geo:tube(mp,.03,.03,1,30,8),color:0x5a2f25});
 K(H,{pos:[0,-.585,1.14],sc:[.1,.05,.04],color:0xff7d8f,spec:40});
 const AP=[];for(const s of [-1,1]){const A=R.add(new Nd({pos:[s*1.3,1.5,.1]}));
  F(A,{pos:[0,-.3,0],sc:[.2,.4,.2],root:ROOT,tip:TIP,len:.08,tat:true});K(A,{pos:[0,-.75,.04],sc:[.19,.19,.19],color:0xffe2c2,spec:30});for(const fx of [-.09,0,.09])K(A,{pos:[fx,-.9+Math.abs(fx)*.3,.1],sc:[.065,.085,.065],color:0xffe2c2,spec:30});K(A,{pos:[-s*.17,-.78,.08],sc:[.06,.08,.06],color:0xffe2c2,spec:30});AP.push(A)}
 const LP=[];for(const s of [-1,1]){const L=R.add(new Nd({pos:[s*.5,.7,.1]}));
  F(L,{pos:[0,-.12,0],sc:[.3,.3,.32],root:ROOT,tip:TIP,len:.08});
  K(L,{pos:[0,-.56,.1],sc:[.26,.14,.28],color:0xe3a869,spec:30});
  LP.push(L)}
 const tp=[[0,1.2,-.7],[0,.9,-1.3],[0,.9,-1.95],[0,1.4,-2.2],[0,1.95,-1.9],[0,2.1,-1.4]];
 const TL=R.add(new Nd({pos:[0,1.2,-.7]})); TL.segs=[];   // Schwanz aus Gliedern: kann sich ein- und ausrollen
 { let par=TL; const NS=7, SEG=.33;
   for(let i=0;i<NS;i++){ const Si=par.add(new Nd({pos:i?[0,0,-SEG]:[0,0,0]})), rd=.14-.011*i;
     F(Si,{geo:tube([[0,0,0],[0,0,-SEG/3],[0,0,-2*SEG/3],[0,0,-SEG]],rd,rd-.011,SHELLS,10,10),root:ROOT,tip:0x9a6a3c,len:.06,tile:[.9,.2],grav:.02});
     F(Si,{sc:[rd,rd,rd],root:ROOT,tip:0x9a6a3c,len:.06,dens:30});
     TL.segs.push(Si); par=Si; }
   F(par,{pos:[0,0,-SEG],sc:[.12,.12,.12],root:0x7b5530,tip:0xf0cd96,len:.05,dens:30}); }
 for(const A of AP){A.kids.forEach((q,i)=>{q.sc=i===0?[q.sc[0]*1.35,q.sc[1],q.sc[2]*1.35]:q.sc.map(v=>v*1.45)})}
 for(const L of LP){L.kids[0].visible=false;for(const q of L.kids.slice(1)){q.pos=q.pos.map(v=>v*1.98);q.sc=q.sc.map(v=>v*1.98)}L.pos[1]=.01+.7*1.98;L.base=L.pos.slice()}
 for(const k of R.kids){if(LP.includes(k))continue;if(AP.includes(k)){k.pos=[k.pos[0],k.pos[1]+.12,k.pos[2]];continue}k.pos=[k.pos[0],k.pos[1]-.22,k.pos[2]]}
 return {root:R,head:H,armN:AP[0],armP:AP[1],legN:LP[0],legP:LP[1],eyes,tail:TL}}
// ---------- Schwein ----------
function buildPig(){const R=new Nd();const eyes=[];const ROOT=0xf08fab,TIP=0xffdde8,D=40;
 const H=R.add(new Nd({pos:[0,1.8,.05]}));H.gs=[1.25,1.25,1.25];
 F(H,{sc:[1.12,1,1.02],root:ROOT,tip:TIP,len:.045,dens:D,tat:true});
 for(const s of [-1,1]){
  F(H,{pos:[s*.62,.86,.14],sc:[.36,.3,.12],rot:[.55,0,-s*.7],root:0xd0607f,tip:0xffb5c9,len:.04,dens:D,tat:true});
  { const e = K(H,{pos:[s*.43,.22,.9],sc:[.17,.22,.11],color:0x1a0d12,spec:140}); eyes.push({n:e, g:glints(H,s*.43,.22,.9,s), y:.22}); }
  K(H,{pos:[s*.7,-.08,.74],sc:[.26,.18,.07],color:0xff6f8f,alpha:.55});
  K(H,{pos:[s*.15,-.2,1.245],sc:[.075,.115,.05],color:0xa84465,spec:30});
  K(H,{pos:[s*.62,.86,.14+.0],sc:[.26,.2,.06],rot:[.55,0,-s*.7],color:0xf59ab3,spec:12});
  F(H,{pos:[s*.43,.42,.86],sc:[.17,.05,.08],rot:[0,0,-s*.25],root:0xb8506f,tip:0xffb5c9,len:.03,dens:D,grav:.01});}
 K(H,{pos:[0,-.2,.93],sc:[.47,.37,.28],color:0xe27c9b,spec:20});
 K(H,{pos:[0,-.2,.98],sc:[.44,.34,.3],color:0xf79ab4,spec:35});
 K(H,{geo:tube([[0,.98,.3],[.07,1.14,.3],[.02,1.28,.3],[-.1,1.24,.3],[-.1,1.14,.3]],.04,.02,1,30,8),color:0xf590ac,spec:20});
 K(H,{geo:tube([[-.24,-.6,.85],[-.12,-.7,.9],[0,-.73,.92],[.12,-.7,.9],[.24,-.6,.85]],.03,.03,1,30,8),color:0x9a3c58});
 for(const s of [-1,1]){const A=R.add(new Nd({pos:[s*1.35,1.45,.1]}));
  F(A,{pos:[0,-.26,0],sc:[.2,.35,.2],root:ROOT,tip:TIP,len:.04,dens:D,tat:true});K(A,{pos:[0,-.66,.03],sc:[.17,.17,.17],color:0xf590ac,spec:20});R['a'+s]=A}
 for(const s of [-1,1]){const L=R.add(new Nd({pos:[s*.5,.7,.1]}));
  F(L,{pos:[0,-.2,0],sc:[.3,.32,.32],root:ROOT,tip:TIP,len:.04,dens:D});
  for(const hx of [-.1,.1])K(L,{pos:[hx,-.56,.1],sc:[.14,.14,.28],color:0xf590ac,spec:30});R['l'+s]=L}
 const tp=[];for(let i=0;i<=40;i++){const t=i/40;tp.push([.2*Math.sin(t*10),1.0+.2*Math.cos(t*10)+t*.15,-.85-.85*t])}
 K(R,{geo:tube(tp,.06,.04,1,80,10),color:0xf590ac,spec:25});
 for(const A of [R['a-1'],R['a1']]){A.kids.forEach((q,i)=>{q.sc=i===0?[q.sc[0]*1.35,q.sc[1],q.sc[2]*1.35]:q.sc.map(v=>v*1.45)})}
 for(const L of [R['l-1'],R['l1']]){L.kids[0].visible=false;for(const q of L.kids.slice(1)){q.pos=q.pos.map(v=>v*1.98);q.sc=q.sc.map(v=>v*1.98)}L.pos[1]=.01+.7*1.98;L.base=L.pos.slice()}
 for(const k of R.kids){if(k===R['l-1']||k===R['l1'])continue;if(k===R['a-1']||k===R['a1']){k.pos=[k.pos[0],k.pos[1]+.12,k.pos[2]];continue}k.pos=[k.pos[0],k.pos[1]-.22,k.pos[2]]}
 return {root:R,head:H,armN:R['a-1'],armP:R['a1'],legN:R['l-1'],legP:R['l1'],eyes}}

