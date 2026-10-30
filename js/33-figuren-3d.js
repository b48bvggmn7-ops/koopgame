// 33-figuren-3d.js – TEST: Affe und Schweinchen als 3D-Figuren mit Fell (statt der gezeichneten Figuren).
// Vorschau-Fassung: immer geladen, standardmäßig AN; Taste 3 oder Knopf „3D an/aus“ schaltet zurück auf die bisherigen Figuren. Ändert keine Physik und kein bestehendes Zeichnen:
// ersetzt nur window.fussFigurZeichnen (10c) durch eine Fassung, die die Figur in einer kleinen WebGL-Leinwand rendert und
// als Bild an die Stelle der alten Figur malt (Stauchen, Schatten, Seil, Kamera bleiben die des Spiels).
// Schalter in der Adresse: ?fell=0.4 (Haardichte, Standard 0.4), ?schichten=18 (Fell-Schichten, Standard 18).
// Keine globalen Namen: alles steckt in dieser Funktion. Fällt WebGL2 aus, bleibt die bisherige Figur.
(function(){
  'use strict';
  const QS = new URLSearchParams(location.search);
  const SPR = 352, FELL_DICHTE = parseFloat(QS.get('fell')) || 0.2, FELL_SCHICHTEN = parseInt(QS.get('schichten')) || 14;
  const FIGUR_HALB = 30;                           // px: halbe gezeichnete Breite der 3D-Figur mit Armen und Fell (Stoßfläche: 14,25)
  const SEIL_KOERPER_PROBEN = [10, 20, 30];       // px vom Griff am Körper entlang: so weit darf der schräge Körper frei sein
  const SEIL_KOERPER_BREITE = [-FIGUR_HALB, 0, FIGUR_HALB];   // px quer dazu (halbe gezeichnete Dicke mit Armen und Fell) (Nutzer: waagerecht am Seil ragte der Bauch in den Boden)
  const FIGUR_GROESSE = 0.9;                       // Figuren 10 % kleiner (Nutzerwunsch); Umkleide-Effekte schrumpfen mit (figur3dMass, js/27)
  const SC = 17*FIGUR_GROESSE;                     // Spielpixel je 3D-Einheit (Figur ~3 Einheiten hoch ≈ 45 px)
  const FR = {x0:-3.3, x1:3.3, y0:-0.7, y1:5.7}, SPRH = Math.round(256*(5.7 + .7)/4.8);   // Ausschnitt der Figur in 3D-Einheiten (Füße bei y = 0);
  // breiter als früher (±2,4): von der Seite war der Affen-Schwanz abgeschnitten (Nutzer-Rückmeldung); SPR wächst mit (gleiche Schärfe)
  // Leistung (Nutzer: „ruckelt“): läuft das Spiel länger als ca. 2 s unter ~45 Bildern/s, nimmt die 3D-Figur weniger Fell-Schichten
  // (14 -> 8 -> 5; das Fell bleibt gleich lang, nur weniger fein). Wird nie wieder hochgestellt (kein Hin und Her). Nur Zeichnen.
  const F3D_STUFEN = [FELL_SCHICHTEN, Math.min(FELL_SCHICHTEN, 8), Math.min(FELL_SCHICHTEN, 5)];
  const F3D_LANGSAM_MS = 22, F3D_LANGSAM_BILDER = 110;
  const F3D_QUALI = window.F3D_QUALI = {stufe: 0, ema: 16.7, langsam: 0, letzt: 0,
    schichten(){ return F3D_STUFEN[this.stufe]; },
    bild(now){   // einmal je gezeichnetem Bild (Affe) – misst den Abstand zum letzten Bild
      const dt = now - this.letzt; this.letzt = now;
      if(!(dt > 0 && dt < 200)) return;
      this.ema = this.ema*0.95 + dt*0.05;
      this.langsam = this.ema > F3D_LANGSAM_MS ? this.langsam + 1 : Math.max(0, this.langsam - 2);
      if(this.langsam > F3D_LANGSAM_BILDER && this.stufe < F3D_STUFEN.length - 1){ this.stufe++; this.langsam = 0; this.ema = 16.7; }
    }};
  if(typeof window.fussFigurZeichnen !== 'function') return;
  // ---------- 3D-Teil (eigene kleine Welt, getrennt vom Spiel) ----------
  function baue(){
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
// Nur Software-Grafik (z. B. SwiftShader, wenn Chrome die Grafikkarte nicht nutzt): eine Figur kostet dann ~0,5 s je Bild -> wie „kein WebGL2“
// behandeln, die bisherigen Figuren bleiben. Erzwingen (nur Tests/Ausprobieren): ?d3=1 oder window.figuren3dErzwingen = true vor dem Laden.
{ const dbg=gl.getExtension('WEBGL_debug_renderer_info'), ren=String(dbg?gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER));
  if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(ren) && QS.get('d3') !== '1' && !window.figuren3dErzwingen) throw new Error('nur Software-Grafik ('+ren+')');
  // Tests mit Grafikkarte (tests/run_tests.py): wie mit Software-Grafik bleiben die bisherigen Figuren, außer ein Test erzwingt 3D
  if(window.figuren3dAus && QS.get('d3') !== '1' && !window.figuren3dErzwingen) throw new Error('3D-Figuren aus (Test)'); }
function prog(vs,fs){const p=gl.createProgram();for(const [t,s] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));gl.attachShader(p,sh)}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p}
const VS=`#version 300 es
in vec3 aPos;in vec3 aNrm;in vec2 aUv;in float aLayer;
uniform mat4 uVP,uM;uniform mat3 uNM;uniform vec3 uScale;uniform float uLen,uGrav,uLayerMul;uniform vec2 uTile;
out vec2 vUv;out vec2 vUv0;out vec3 vN;out float vL;out vec3 vW;
void main(){float la=aLayer*uLayerMul;vUv0=aUv;vec3 p=aPos+aNrm*uLen*la/uScale;vec4 w=uM*vec4(p,1.);w.y-=uGrav*la*la;
vW=w.xyz;vN=normalize(uNM*aNrm);vUv=aUv*uTile;vL=la;gl_Position=uVP*w;}`;
const FS=`#version 300 es
precision highp float;
uniform sampler2D uNoise,uTat;uniform vec3 uRoot,uTip,uCam;uniform float uFur,uSpec,uEmit,uAlpha,uTatOn;
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
 vec3 hemi=mix(vec3(.62,.68,.56),vec3(1.,.97,.9),N.y*.5+.5);
 vec3 col=base*(hemi*.62+vec3(1.,.95,.86)*wrap*.78+d2*vec3(.7,.85,1.))*ao*1.18;
 col+=base*vec3(1.,.55,.45)*(1.-wrap)*.14;
 if(uTatOn>.5){vec4 tc=texture(uTat,vUv0);col=mix(col,pow(tc.rgb,vec3(2.2))*(.5+.6*wrap),tc.a*.8);}   // Tattoo kräftig: auch nach dem Licht (Haarspitzen/Licht hellen es sonst auf)
 float rim=pow(1.-max(dot(N,V),0.),3.)*(dot(N,L3)*.5+.5);
 col+=(uFur>.5?pow(uTip,vec3(2.2))*layer*.6:vec3(.06))*rim;
 if(uFur>.5){vec3 H2=normalize(L1+V);col+=vec3(1.,.97,.9)*pow(max(dot(N,H2),0.),22.)*(.04+.2*layer)*.5;}
 if(uSpec>0.){vec3 H=normalize(L1+V);col+=vec3(1.)*pow(max(dot(N,H),0.),uSpec)*.8;}
 col=mix(col,base,uEmit);
 o=vec4(pow(col,vec3(1./2.2)),uAlpha*cov);}`;
const PRG=prog(VS,FS);
const BGP=prog(`#version 300 es
out vec2 v;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);v=p;gl_Position=vec4(p*2.-1.,0.,1.);}`,
`#version 300 es
precision highp float;in vec2 v;out vec4 o;uniform vec3 uA,uB;
void main(){vec3 c=mix(uB,uA,smoothstep(0.,1.,v.y));c+=.08*(1.-length((v-vec2(.5,.45))*vec2(1.,1.2)));o=vec4(c,1.);}`);
const U={};for(const n of ['uVP','uM','uNM','uScale','uLen','uGrav','uLayerMul','uTile','uNoise','uRoot','uTip','uCam','uFur','uSpec','uEmit','uAlpha','uTat','uTatOn'])U[n]=gl.getUniformLocation(PRG,n);
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
 return {vao,n:idx.length,shells}}
function sphereData(sg=48,rg=32){const pos=[],uv=[],idx=[];for(let i=0;i<=rg;i++){const v=i/rg,th=v*Math.PI;for(let j=0;j<=sg;j++){const u=j/sg,ph=u*2*Math.PI;
 pos.push(Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph));uv.push(u,v)}}
 for(let i=0;i<rg;i++)for(let j=0;j<sg;j++){const a=i*(sg+1)+j,b=a+sg+1;idx.push(a,b,a+1,b,b+1,a+1)}return {pos,nrm:pos.slice(),uv,idx}}
const SPHD=sphereData(36,24);const sphereCache={};
function SPH(shells){return sphereCache[shells]||(sphereCache[shells]=mkGeo(SPHD.pos,SPHD.nrm,SPHD.uv,SPHD.idx,shells))}
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
 if(n.cap)n.capM=w;
 if(n.part&&n.visible){const p=n.part;gl.bindVertexArray(p.geo.vao);
  gl.uniformMatrix4fv(U.uVP,false,VPm);gl.uniformMatrix4fv(U.uM,false,w);gl.uniformMatrix3fv(U.uNM,false,M.nm(w));
  gl.uniform3f(U.uScale,...n.sc);gl.uniform1f(U.uLen,p.len);gl.uniform1f(U.uGrav,p.grav);gl.uniform2f(U.uTile,...p.tile);
  gl.uniform3f(U.uRoot,...p.root);gl.uniform3f(U.uTip,...p.tip);gl.uniform3f(U.uCam,...cam);
  gl.uniform1f(U.uFur,p.fur?1:0);gl.uniform1f(U.uTatOn,p.tat&&TAT.on?1:0);gl.uniform1f(U.uSpec,p.spec);gl.uniform1f(U.uEmit,p.emit);gl.uniform1f(U.uAlpha,p.alpha);
  { const sh=p.geo.shells, nS=sh>1?Math.min(sh,F3D_QUALI.schichten()):1; gl.uniform1f(U.uLayerMul,sh>1&&nS>1?(sh-1)/(nS-1):1);
    gl.drawElementsInstanced(gl.TRIANGLES,p.geo.n,gl.UNSIGNED_INT,0,nS); }}
 if(n.visible)for(const k of n.kids)drawNode(k,parentOnly,VPm,cam)}
// ---------- Affe ----------
function glints(H,x,y,z,s){return [K(H,{geo:SPH(1),pos:[x+.07*s,y+.105,z+.085],sc:[.075,.075,.04],color:0xffffff,emit:1}),
 K(H,{geo:SPH(1),pos:[x-.06*s,y-.1,z+.08],sc:[.036,.036,.025],color:0xffffff,emit:1})]}
function buildMonkey(){const R=new Nd();const eyes=[];const ROOT=0x2e180a,TIP=0x6a3e20,GES=0xf2d3a6;
 // Affe wie der Monchichi aus dem Video (Nutzerwunsch): dunkelbraunes Fell überall, großes helles Gesicht (Herzform: zwei
 // Augen-Felder + Schnauze), große glänzende schwarze Augen, runde Ohren mit hellem Innenohr; Hände/Füße hell
 const H=R.add(new Nd({pos:[0,1.8,.05]}));H.gs=[1.25,1.25,1.25];
 F(H,{sc:[1,1,1],root:ROOT,tip:TIP,len:.05,tat:true});
 for(const s of [-1,1]){
  K(H,{pos:[s*.32,.04,.8],sc:[.47,.46,.17],color:GES,spec:30});   // helle Gesichtshälften (Herzform oben), flach: von der Seite nicht abstehend
  F(H,{pos:[s*.9,.4,-.04],sc:[.22,.24,.15],root:ROOT,tip:TIP,len:.04,tat:true});   // runde Ohren
  K(H,{pos:[s*.95,.4,.08],sc:[.13,.15,.07],color:0xe8c49a,spec:12});   // helles Innenohr
  { const e = K(H,{pos:[s*.34,.08,.96],sc:[.24,.3,.1],color:0x0d0806,spec:160}); eyes.push({n:e, g:glints(H,s*.34,.08,.96,s), y:.31}); }
  K(H,{pos:[s*.62,-.22,.8],sc:[.18,.11,.05],color:0xf2a08f,alpha:.35});
 }
 K(H,{pos:[0,-.36,.88],sc:[.56,.42,.34],color:GES,spec:34});   // Schnauze
 K(H,{pos:[0,-.28,1.185],sc:[.1,.065,.05],color:0x4b2d22,spec:60});
 const mp=[];for(let i=0;i<=10;i++){const x=-.25+i*.05;const y=-.5-.11*(1-(x/.25)**2);const q=Math.max(0,1-(x/.52)**2-((y+.42)/.38)**2);mp.push([x,y,.88+.34*Math.sqrt(q)+.012])}
 const lae=[K(H,{geo:tube(mp,.03,.03,1,30,8),color:0x5a2f25}), K(H,{pos:[0,-.585,1.14],sc:[.1,.05,.04],color:0xff7d8f,spec:40})];
 // Pusten (js/34): aufgeblasene Backen und ein runder Mund – nur sichtbar, solange er pustet (Größe in fussFigurZeichnen)
 const backen=[-1,1].map(s=>{const b=K(H,{pos:[s*.42,-.34,.86],sc:[.3,.27,.26],color:GES,spec:40});b.visible=false;b.sc0=b.sc.slice();return b});
 const mundO=K(H,{pos:[0,-.5,1.16],sc:[.1,.11,.05],color:0x3a1a12,spec:20});mundO.visible=false;mundO.sc0=mundO.sc.slice();
 const AP=[];for(const s of [-1,1]){const A=R.add(new Nd({pos:[s*1.16,1.42,.1]}));   // Arme wie beim Schwein (nicht an den Ohren)
  F(A,{pos:[0,-.3,0],sc:[.2,.4,.2],root:ROOT,tip:TIP,len:.08,tat:true});K(A,{pos:[0,-.75,.04],sc:[.19,.19,.19],color:GES,spec:30});for(const fx of [-.09,0,.09])K(A,{pos:[fx,-.9+Math.abs(fx)*.3,.1],sc:[.065,.085,.065],color:GES,spec:30});K(A,{pos:[-s*.17,-.78,.08],sc:[.06,.08,.06],color:GES,spec:30});AP.push(A)}
 const LP=[];for(const s of [-1,1]){const L=R.add(new Nd({pos:[s*.5,.7,.1]}));
  F(L,{pos:[0,-.12,0],sc:[.3,.3,.32],root:ROOT,tip:TIP,len:.08});
  K(L,{pos:[0,-.56,.1],sc:[.26,.14,.28],color:0xd9b285,spec:30});
  LP.push(L)}
 const tp=[[0,1.2,-.7],[0,.9,-1.3],[0,.9,-1.95],[0,1.4,-2.2],[0,1.95,-1.9],[0,2.1,-1.4]];
 const TL=R.add(new Nd({pos:[0,1.15,-1.0]})); TL.segs=[];   // Ansatz am Rücken (vorher z −0,7 = im Körper, Nutzer: „Schwanz abgeschnitten“)   // Schwanz aus Gliedern: kann sich ein- und ausrollen
 { let par=TL; const NS=7, SEG=.33;
   for(let i=0;i<NS;i++){ const Si=par.add(new Nd({pos:i?[0,0,-SEG]:[0,0,0]})), rd=.14-.011*i;
     F(Si,{geo:tube([[0,0,0],[0,0,-SEG/3],[0,0,-2*SEG/3],[0,0,-SEG]],rd,rd-.011,SHELLS,10,10),root:ROOT,tip:TIP,len:.06,tile:[.9,.2],grav:.02});
     F(Si,{sc:[rd,rd,rd],root:ROOT,tip:TIP,len:.06,dens:30});
     TL.segs.push(Si); par=Si; }
   F(par,{pos:[0,0,-SEG],sc:[.12,.12,.12],root:ROOT,tip:TIP,len:.05,dens:30}); }
 for(const A of AP){A.kids.forEach((q,i)=>{q.sc=i===0?[q.sc[0]*1.35,q.sc[1],q.sc[2]*1.35]:q.sc.map(v=>v*1.45)})}
 for(const L of LP){L.kids[0].visible=false;for(const q of L.kids.slice(1)){q.pos=q.pos.map(v=>v*1.98);q.sc=q.sc.map(v=>v*1.98)}L.pos[1]=.01+.7*1.98;L.base=L.pos.slice()}
 for(const k of R.kids){if(LP.includes(k))continue;if(AP.includes(k)){k.pos=[k.pos[0],k.pos[1]+.12,k.pos[2]];continue}k.pos=[k.pos[0],k.pos[1]-.22,k.pos[2]]}
 return {root:R,head:H,armN:AP[0],armP:AP[1],legN:LP[0],legP:LP[1],eyes,tail:TL,backen,mundO,lae}}
// ---------- Schwein ----------
function buildPig(){const R=new Nd();const eyes=[];const ROOT=0xf08fab,TIP=0xffdde8,D=40;
 const H=R.add(new Nd({pos:[0,1.8,.05]}));H.gs=[1.25,1.25,1.25];
 F(H,{sc:[1,1,1],root:ROOT,tip:TIP,len:.045,dens:D,tat:true});
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
 for(const s of [-1,1]){const A=R.add(new Nd({pos:[s*1.14,1.45,.1]}));
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

  return {gl, PRG, U, M, Nd, buildMonkey, buildPig, drawNode, cv, noise, TAT};
  }
  let E;
  try { E = baue(); } catch(e){ console.warn('3D-Figuren nicht verfügbar:', e); return; }
  const {gl, PRG, U, M, Nd, buildMonkey, buildPig, drawNode, cv, noise, TAT} = E;
  window.figur3dMass = FIGUR_GROESSE;   // nur wenn die 3D-Figuren wirklich zeichnen (sonst bleibt die Umkleide im alten Maß)
  // ---------- Tattoo als Fell-Textur (Umkleide, Muster aus js/27 tattooPattern) ----------
  // Das Muster (für die Gesichtsscheibe gemacht, Einheitskreis) wird von vorn auf die vordere Kugelhälfte gelegt und gespiegelt
  // auf die hintere – so geht es rund um die ganze Figur, wölbt sich mit und dreht sich mit (Kopf/Körper, Arme, Ohren).
  const TAT_TEX = {};
  function tattooTextur(kind){
    if(TAT_TEX[kind]) return TAT_TEX[kind];
    if(typeof tattooPattern !== 'function') return null;
    const N = 256, P = document.createElement('canvas'); P.width = P.height = N;
    const pc = P.getContext('2d'); pc.translate(N/2, N/2); pc.scale(N/2*.96, N/2*.96); pc.lineJoin = 'round'; pc.lineCap = 'round';
    try { tattooPattern(pc, kind); } catch(e){ return null; }
    const pd = pc.getImageData(0, 0, N, N).data, TW = 512, TH = 256;
    const T = document.createElement('canvas'); T.width = TW; T.height = TH;
    const tc = T.getContext('2d'), img = tc.createImageData(TW, TH), d = img.data;
    for(let j = 0; j < TH; j++){ const th = (j + .5)/TH*Math.PI, sy = Math.cos(th), r = Math.sin(th);
      for(let i = 0; i < TW; i++){ const ph = (i + .5)/TW*2*Math.PI, x = r*Math.cos(ph), z = r*Math.sin(ph);
        const ux = z >= 0 ? x : -x, px = Math.min(N - 1, Math.max(0, Math.round(N/2 + ux*N/2*.98))), py = Math.min(N - 1, Math.max(0, Math.round(N/2 - sy*N/2*.98)));
        const a = (py*N + px)*4, b = (j*TW + i)*4; d[b] = pd[a]; d[b+1] = pd[a+1]; d[b+2] = pd[a+2]; d[b+3] = pd[a+3]; } }
    tc.putImageData(img, 0, 0);
    const tex = gl.createTexture(); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, T);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.activeTexture(gl.TEXTURE0);
    return TAT_TEX[kind] = tex;
  }
  // ---------- Figuren-Halter ----------
  const halter = {};
  function holen(male){
    if(halter[male]) return halter[male];
    const ch = male ? buildMonkey() : buildPig();
    const wrap = new Nd(), yawN = wrap.add(new Nd()); yawN.kids.push(ch.root);
    ch.armN.cap = true; ch.armP.cap = true; ch.head.cap = true; ch.eyes.forEach(e => { e.n.cap = true; });
    if(ch.mundO) ch.mundO.cap = true;   // Mund: Startpunkt des Puste-Winds (js/34)
    return halter[male] = {ch, wrap, yawN};
  }
  const lerpA = (a,b,t) => a.map((v,i) => v + (b[i]-v)*t);
  const ease = x => x*x*(3-2*x);
  const TUCK = {head:[.55,0,0], armN:[-1.75,0,.25], armP:[-1.75,0,-.25], legN:[-1.45,0,.1], legP:[-1.45,0,-.1]};
  const TANZ_ARM = .75, TANZ_ABSTAND = 44;   // Siegestanz: Verlängerung des Einhak-Arms, Abstand der beiden Figuren (px)
  const HAFT_ARM = 3.0;   // Armlänge (Faktor) beim Hangeln an der Haftfläche – Affe wie Schwein
  const WJ_ZEIT = 480;   // ms: Salto nach dem Wandsprung
  // wie tief die Figur beim Hangeln unter der Fläche hängt: die Hand-Spitze (Arm mit Faktor al) soll genau die Unterkante der Fläche (Oberkante der Hitbox) berühren
  function hangSenke(ch, al, ph, voll){
    const a = ch.armN; if(!a.k0) return 0;
    let top = 0; a.k0.forEach((b, i) => { top = Math.max(top, i === 0 ? (Math.abs(b.p[1]) + b.s[1])*al : Math.abs(b.p[1])*al + b.s[1]); });
    const tip = (a.pos[1] + top)*SC*.98;
    return Math.max(0, tip - 4 - ph - 2)*Math.min(1, (al - 1)/(voll - 1));
  }
  const wandRichtung = P => P.onWall || (P.haft ? (P.haft.flaeche === 'links' ? 1 : (P.haft.flaeche === 'rechts' ? -1 : 0)) : 0);
  // Siegestanz zu zweit: stehen beide nah beieinander, haken sie die inneren Arme ein und hüpfen im Takt; sonst jubeln beide mit erhobenen Armen
  function tanzInfo(P){
    const o = P === p1 ? p2 : p1, near = !!o && Math.abs(o.x - P.x) < 150 && Math.abs(o.y - P.y) < 70;
    const left = o ? (P.x < o.x || (P.x === o.x && P.male)) : true;
    return {o, near, side: left ? 1 : -1};   // side: auf welcher Seite der Partner steht (1 = rechts)
  }
  function tanzPose(P, S){
    const ti = S.tz = tanzInfo(P), bt = (performance.now() - winT0)/DANCE_BEAT, ph = bt % 1, side = ti.side;
    const kick = Math.floor(bt) % 2 ? 1 : -1, kk = Math.sin(ph*Math.PI)*.8;
    const legs = {legN:[kick > 0 ? -kk : 0,0,0], legP:[kick < 0 ? -kk : 0,0,0]};
    if(!ti.near){ const j = 2.6 + Math.sin(bt*Math.PI*2)*.25; return Object.assign({head:[-.1,0,Math.sin(bt*Math.PI)*.12], armN:[0,0,-j], armP:[0,0,j]}, legs); }
    const aussen = 2.55 + Math.sin(bt*Math.PI*2)*.3, innen = 1.5 + Math.sin(bt*Math.PI*2)*.08;
    const arm = {head:[-.08,0,Math.sin(bt*Math.PI)*.14]};
    if(side > 0){ arm.armP = [0,0,innen]; arm.armN = [0,0,-aussen]; } else { arm.armN = [0,0,-innen]; arm.armP = [0,0,aussen]; }
    return Object.assign(arm, legs);
  }
  // Schirm-Trampolin-Ablauf (a = 0…1), wie ein Mensch einen Schirm nimmt (Nutzer: „hol ihn von der Seite, überleg dir, wie eine
  // menschliche Bewegung aussieht“): 1) die rechte Pfote zieht den zugeklappten Schirm seitlich hinter der Hüfte hervor (hinter der
  // Figur gezeichnet), 2) schwingt ihn in einem Bogen vor dem Körper hoch, bis er senkrecht steht (schwingt kurz über und pendelt
  // sich ein), dabei greifen beide Pfoten den Stock vor dem Bauch, 3) aufklappen mit kurzem Nachfedern. Rückwärts = wegstecken.
  const schirmUeber = q => q < 1 ? 1 + 2.7*Math.pow(q - 1, 3) + 1.7*Math.pow(q - 1, 2) : 1;   // weich mit kleinem Überschwingen
  function schirmAblauf(a){
    const P1 = SCHIRM_HOLEN, P2 = SCHIRM_HOLEN + SCHIRM_GREIFEN;
    if(a < P1) return {hinten: true, phase: 1, q: a/P1, klapp: 0, pfoten: 0};
    if(a < P2){ const q = (a - P1)/(P2 - P1); return {hinten: q < SCHIRM_VORNE_AB, phase: 2, q, klapp: 0}; }   // erst vor den Körper, wenn er seitlich hochkommt
    return {hinten: false, phase: 3, q: 1, pfoten: 1, klapp: schirmUeber((a - P2)/(1 - P2))};
  }
  function zielPose(P, S, t, flip, sinceWJ){
    const sp = S.spG, male = P.male, s = Math.sin(S.phase), w = Math.min(1, sp/4.4);
    if(typeof baumTanzt === 'function' && baumTanzt()) return {p: tanzPose(P, S), key:'tanz'};   // gemeinsamer Siegestanz
    // Dschungel-Neu (js/34): Schweinchen hält den offenen Schirm mit beiden Armen über den Kopf (Trampolin), Affe pustet
    if(!male && (P.trampolin || (S.trA || 0) > 0)){   // Schirm-Trampolin (auch beim Wegstecken): 3D-Arme eng am Körper, die Pfoten vor dem Bauch malt drawUmbrella;
      const ziehen = (S.trA || 0) < SCHIRM_HOLEN;   // beim Hervorziehen greift der rechte Arm seitlich nach unten zur Hüfte
      return {p: {head:[-.22,0,0], armN:[-1.0,0,.4], armP: ziehen ? [-.2,0,1.0] : [-1.0,0,-.4], legN:[-.2,0,-.18], legP:[-.2,0,.18]}, key:'trampolin'}; }
    if(male && P.pusteAn){
      const luft = Math.min(1, (performance.now() - (P._pusteStartT || 0))/200), zit = Math.sin(t*38)*.04*luft;   // erst Luft holen, dann kräftig
      if(P.pusteRichtung === 'hoch') return {p: {head:[-1.3*luft + .2*(1 - luft) + zit,0,0], armN:[.25,0,-1.15], armP:[.25,0,1.15], legN:[-.25,0,-.12], legP:[-.25,0,.12]}, key:'pusten'};
      if(typeof pusteSchraeg === 'function' && pusteSchraeg(P.pusteRichtung))   // schräg nach oben: Kopf halb in den Nacken
        return {p: {head:[-.75*luft + .2*(1 - luft) + zit,0,0], armN:[.8*luft,0,-.6], armP:[.8*luft,0,.6], legN:[-.4,0,0], legP:[.35,0,0]}, key:'pusten'};
      return {p: {head:[-.12*luft + .25*(1 - luft) + zit,0,0], armN:[1.15*luft,0,-.45], armP:[1.15*luft,0,.45], legN:[-.5,0,0], legP:[.45,0,0]}, key:'pusten'};
    }
    if(P.dash) return {p: TUCK, key:'dash'};
    if(sinceWJ < WJ_ZEIT){ const k = sinceWJ/WJ_ZEIT, tk = Math.sin(Math.min(1,k*1.15)*Math.PI);   // Salto: erst einrollen, am Ende strecken
      return {p: {head:[.35*tk,0,0], armN:[-1.75*tk,0,.25+.8*(1-tk)], armP:[-1.75*tk,0,-.25-.8*(1-tk)], legN:[-1.45*tk-.2,0,.1], legP:[-1.45*tk-.2,0,-.1]}, key:'wj'}; }
    if(P.leverAnim){ const k = (performance.now() - P.leverAnim.t0)/320;   // Hebel ziehen: der Arm greift nach vorn und zieht herunter
      if(k >= 0 && k < 1){ const e = Math.sin(k*Math.PI); return {p:{head:[.18*e,0,0], armN:[-1.45*e,0,-.2], armP:[-1.3*e,0,.2], legN:[-.15*e,0,0], legP:[.15*e,0,0]}, key:'hebel'}; } }
    if(male && ((P.hookAttached && P.anchor) || (P._hakenWarten && P._wartZiel))) return {p:{head:[0,0,0], armN:[0,0,-3.58], armP:[0,0,3.58], legN:[-.3,0,0], legP:[.25,0,0]}, key:'seil'};
    if(!male && P.gliding) return {p:{head:[-.1,0,0], armN:[0,0,-2.5], armP:[0,0,2.5], legN:[-.15+Math.sin(t*2.2)*.1,0,0], legP:[.2-Math.sin(t*2.2)*.1,0,0]}, key:'segeln'};
    if(P.haft && P.haft.flaeche === 'unten'){   // Haftfläche (Decke): erst greift der eine Arm nach vorn, dann der andere – im Stand bleiben die Arme still
      const ph = (S.hp||0)/72.8, A = .6, ea = x => x*x*(3 - 2*x);
      const f0 = u => { u = ((u % 1) + 1) % 1; return u < .5 ? A*(1 - 4*u) : -A + 2*A*ea((u - .5)*2); };   // + = Arm hinten, − = Arm vorn
      // Ende der Fläche: die Hände dürfen nicht über den Rand hinaus greifen -> Ausschlag nach vorn/hinten schrumpft zum Rand hin auf 0
      const rd = dir => { try{ for(let d = 0; d <= 36; d += 3) if(!haftWeiter(P, P.x + dir*d)) return d; }catch(e){} return 99; };
      const dv = rd(flip), dh = rd(-flip), lim = d => Math.max(0, Math.min(1, (d - 8)/24));
      const f = u => { const v = f0(u); return v < 0 ? v*lim(dv) : v*lim(dh); };
      return {p:{head:[-.12,0,0], armN:[-f(ph),0,-2.95], armP:[-f(ph + .5),0,2.95], legN:[-.1,0,0], legP:[-.1,0,0]}, key:'haft'}; }
    if(wandRichtung(P)){ const sh = Math.sin(t*16)*.07;   // an der Wand: Arme hoch an die Wand, ein Bein angezogen, leichtes Rutschen
      return {p:{head:[-.18,0,0], armN:[-2.75+sh,0,.18], armP:[-2.6-sh,0,-.18], legN:[-1.1+sh,0,0], legP:[-.35-sh,0,0]}, key:'ws'}; }
    if(!P.grounded){ const up = P.vy < 0;   // Sprung: nach oben Arme jubelnd hoch, beim Fallen Arme seitlich
      return {p:{head:[up?-.15:.12,0,Math.sin(t*3)*.03], armN:[0,0,up?-2.6:-1.35], armP:[0,0,up?2.6:1.35], legN:[up?-1.1:-.45,0,0], legP:[up?-.35:-.85,0,0]}, key:up?'up':'down'}; }
    if(sp > 0.8) return {p:{head:[Math.abs(s)*.012,0,Math.sin(S.phase)*.015], armN:[-s*1.9*w*(vieleSchritte?.35:1),0,-.2], armP:[s*1.9*w*(vieleSchritte?.35:1),0,.2], legN:[0,0,0], legP:[0,0,0]}, key:'lauf'};
    const b = Math.sin(t*2.4);
    return {p:{head:[0,0,Math.sin(t*1.1)*.06], armN:[0,0,-.55-b*.05], armP:[0,0,.55+b*.05], legN:[0,0,0], legP:[0,0,0]}, key:'idle'};
  }
  const handPunkt = (n, hx, hy, hz) => { const w = n.capM; return w ? [w[0]*hx + w[4]*hy + w[8]*hz + w[12], w[1]*hx + w[5]*hy + w[9]*hz + w[13]] : [0, 2]; };
  // (Taste 3 / Knopf zum Umschalten auf die bisherigen Figuren entfernt – Nutzerwunsch; ohne WebGL2 oder nur mit Software-Grafik
  //  bleiben die bisherigen Figuren automatisch, siehe baue())
  const vieleSchritte = true;   // festgelegt (Nutzerwunsch): ganz viele kleine Schritte, im Spiel nicht umschaltbar
  window.fussFigurZeichnen = function(P){
    const c = ctx, now = performance.now(), male = P.male;
    if(male) F3D_QUALI.bild(now);
    let S = P._f3; if(!S) S = P._f3 = {t:now, phase:0, yaw:.8, rollA:0, cur:null, nb:now + 1500, bl:0, lean:0};
    const dt = Math.min(.05, Math.max(0, (now - S.t)/1000)); S.t = now;
    const t = now/1000, sp = Math.abs(P.vx), flip = P.facing < 0 ? -1 : 1;
    S.spG = S.spG == null ? sp : S.spG + (sp - S.spG)*(1 - Math.exp(-dt*8));   // geglättetes Tempo: gleichmäßige Bewegungen
    if(P.haft){ if(sp < .05) S.spG *= Math.exp(-dt*25); S.hp = (S.hp||0) + S.spG*54*dt; }
    if(P.grounded && sp > 0.3) S.phase += (vieleSchritte ? (male?19:21) : (male?6.5:7.5))*(S.spG/4.4)*dt;
    const sinceWJ = now - (P._wjT || -1e9);
    // Sprung-Tricks: beim Absprung vom Boden zufällig Salto, Drehung oder Schraube (nur Anzeige)
    if(P.grounded){ S.trick = null; S.wasG = true; }
    else if(S.wasG){ S.wasG = false; if(P.vy < -1 && sinceWJ > WJ_ZEIT && !P.dash){ const r = Math.random(); S.trick = r < .4 ? null : {typ: r < .65 ? 'salto' : (r < .85 ? 'dreh' : 'schraube'), t0: now}; } }
    let z = zielPose(P, S, t, flip, sinceWJ);
    const tk = S.trick ? Math.min(1, (now - S.trick.t0)/(S.trick.typ === 'dreh' ? 520 : 650)) : 1, tke = ease(tk);
    if(S.trick && (S.trick.typ === 'salto' || S.trick.typ === 'schraube') && (z.key === 'up' || z.key === 'down')) z = {p: TUCK, key: z.key};
    // Siegestanz: die Vorgabe des Spiels (hüpfen/drehen der ganzen Figur) wird hier selbst gemacht -> erst herausrechnen
    if(z.key === 'tanz' && typeof danceMove === 'function'){ const d = danceMove(P); c.scale(1/d.sx, 1/d.sy); c.rotate(-d.rot); c.translate(0, -d.dy); }
    { const tt = z.key === 'tanz' && S.tz && S.tz.near ? 1 : 0; S.ti = (S.ti||0) + (tt - (S.ti||0))*(1 - Math.exp(-dt*5));
      let dxT = 0; if(tt){ const o = S.tz.o; dxT = (P.x + o.x)/2 - S.tz.side*TANZ_ABSTAND/2 - P.x; }
      S.dxs = (S.dxs||0) + (dxT - (S.dxs||0))*(1 - Math.exp(-dt*(tt ? 6 : 10))); if(Math.abs(S.dxs) > .05) c.translate(S.dxs, 0); }
    const k = 1 - Math.exp(-dt*(z.key === 'lauf' ? 30 : (z.key === 'haft' ? 9 : 22)));
    if(!S.cur) S.cur = JSON.parse(JSON.stringify(z.p));
    for(const n in z.p) S.cur[n] = lerpA(S.cur[n], z.p[n], k);
    const bewegt = sp > 0.8 || !P.grounded;
    if(bewegt || S.is == null){ S.is = now; S.lf = flip; }
    const langw = Math.min(1, Math.max(0, ((now - S.is)/1000 - 4)/2.5)), langw2 = langw*langw*(3 - 2*langw);   // nach ~4 s Stillstand dreht sie sich langsam zur Kamera
    // Leerlauf-Tricks: schaut sie lange in die Kamera (niemand spielt), macht sie ab und zu einen Trick (nur Anzeige, bricht sofort ab, sobald man sich bewegt)
    const ITDUR = {kombi:2600, salto:1100, radschlag:1000, schraube:1100, pirouette:800};
    const IT = {roll:0, yaw:0, hop:0, pose:null, env:0, tail:0};
    if(z.key !== 'idle' || bewegt){ S.it = null; S.itNext = null; }
    else if(langw2 > .95){
      if(S.itNext == null) S.itNext = now + 700 + Math.random()*1200;
      if(!S.it && now > S.itNext){
        const liste = male ? ['salto','radschlag','kombi'] : ['schraube','pirouette','kombi'];
        let typ; do { typ = liste[Math.floor(Math.random()*liste.length)]; } while(typ === S.itLast && liste.length > 1);
        S.itLast = typ; S.it = {typ, t0: now, dur: ITDUR[typ]};
      }
      if(S.it){
        let u = (now - S.it.t0)/S.it.dur;
        if(u >= 1){ S.it = null; S.itNext = now + 3500 + Math.random()*3500; }
        else {
          const env = Math.min(1, u/.12, (1 - u)/.12), e = ease(u), ph = u*Math.PI*2*4, ty0 = S.it.typ;
          IT.env = Math.max(0, env);
          const par = x => 4*x*(1 - x), lin = x => Math.max(0, Math.min(1, x));   // par: Sprungbogen 0..1..0
          const JUB = {armN:[0,0,-2.1], armP:[0,0,2.1], legN:[-.5,0,0], legP:[-.5,0,0], head:[-.1,0,0]};
          const KNIE = {armN:[0,0,-.9], armP:[0,0,.9], legN:[-.75,0,0], legP:[-.75,0,0], head:[.3,0,0]};
          const LAND = {armN:[0,0,-1.5], armP:[0,0,1.5], legN:[-.5,0,0], legP:[-.5,0,0], head:[.1,0,0]};
          const salto = (a, b, dreh, hoch, runden) => {   // Anlauf a (Ducken), Flug a..b, Landung b..1
            if(u < a){ const k2 = u/a; IT.hop = -.16*Math.sin(Math.PI*k2); IT.pose = KNIE; }
            else if(u < b){ const k2 = (u - a)/(b - a); IT.hop = par(k2)*hoch; IT.roll = -flip*Math.PI*2*runden*lin(k2*1.05); IT.yaw = dreh ? Math.PI*2*dreh*lin(k2) : 0; IT.pose = k2 < .88 ? TUCK : JUB; }
            else { const k2 = (u - b)/(1 - b); IT.hop = -.1*Math.sin(Math.PI*k2); IT.pose = k2 < .5 ? LAND : KNIE; }
          };
          if(ty0 === 'salto') salto(.16, .78, 0, 1.15, 2);
          else if(ty0 === 'schraube') salto(.18, .8, 1, 1.15, 1);
          else if(ty0 === 'pirouette'){ const k2 = lin((u - .08)/.84); IT.yaw = Math.PI*2*3*ease(k2); IT.hop = par(k2)*.4; IT.pose = k2 > 0 && k2 < 1 ? {armN:[0,0,-1.5], armP:[0,0,1.5], legN:[-.3,0,0], legP:[-.3,0,0], head:[0,0,0]} : JUB; }
          else if(ty0 === 'radschlag'){ const k2 = lin((u - .1)/.8); IT.roll = -flip*Math.PI*2*k2; IT.hop = par(k2)*.5; IT.pose = {armN:[0,0,-2.2], armP:[0,0,2.2], legN:[0,0,-.5], legP:[0,0,.5], head:[0,0,0]}; }
          else if(ty0 === 'kombi'){   // 3 Hüpfer mit Jubel, dann Salto
            if(u < .45){ const k2 = u/.45; IT.hop = Math.abs(Math.sin(k2*Math.PI*3))*.75; IT.roll = Math.sin(k2*Math.PI*3)*.12; IT.pose = JUB; }
            else { const u0 = u; u = (u0 - .45)/.55; salto(.12, .72, male ? 0 : 1, 1.15, 1); u = u0; }
          }
        }
      }
    }
    if(z.key === 'tanz'){   // im Takt hüpfen, gemeinsam wippen, jeden 4. Takt eine Pirouette (beide zusammen)
      const bt = (now - winT0)/DANCE_BEAT, ph = bt % 1, bar = Math.floor(bt) % 4;
      IT.hop = Math.sin(ph*Math.PI)*.55; IT.roll = Math.sin(bt*Math.PI)*.12;
      if(bar === 3) IT.yaw = Math.PI*2*ease(ph);
    }
    if(typeof deathState !== 'undefined' && deathState && deathState.phrase && P === deathState.other){   // Kopfschütteln des Mitspielers
      const a = now - deathState.t0; IT.yaw += Math.sin(a*.03)*.5*Math.max(.25, 1 - a/1500); }
    let ty = bewegt ? flip*1.5 : S.lf*1.35*(1 - langw2) + Math.sin(t*.7)*.12*langw2;   // laufen: im Profil nach rechts/links, Ruhe: in die Kamera
    if(z.key === 'dash' || z.key === 'wj') ty = flip*1.42;
    if(z.key === 'ws') ty = (wandRichtung(P) > 0 ? 1 : -1)*1.2;
    if(z.key === 'haft') ty = flip*1.2;   // Profil: man sieht, wie die Arme abwechselnd nach vorn greifen
    if(z.key === 'seil') ty = flip*1.57;   // am Seil: ganz von der Seite   // fast von vorn: beide Arme sichtbar          // zur Wand gedreht
    if(z.key === 'tanz') ty = S.tz && S.tz.near ? S.tz.side*.3 : 0;   // zur Kamera, leicht zum Partner
    if(z.key === 'trampolin') ty = 0;   // hält den Schirm zur Kamera hin
    if(z.key === 'pusten') ty = P.pusteRichtung === 'hoch' ? .25*flip : pusteSeiteVon(P.pusteRichtung)*(pusteSchraeg(P.pusteRichtung) ? 1.1 : 1.42);   // nach oben: fast von vorn, sonst im Profil zur Blasrichtung
    if(z.key === 'hebel') ty = (P.leverAnim && P.leverAnim.dir < 0 ? -1 : 1)*1.4;   // zum Hebel hin im Profil
    if(P._yawTest != null) ty = P._yawTest;   // nur fuer Tests
    S.yaw += (ty - S.yaw)*(1 - Math.exp(-dt*14));
    // Drehung: Dash = Rolle, Wandsprung = ganzer Salto weg von der Wand
    let rollA = 0;
    if(z.key === 'dash'){ S.rollA += -flip*dt*16; rollA = S.rollA; }
    else { S.rollA = 0; if(z.key === 'wj') rollA = -flip*ease(Math.min(1, sinceWJ/WJ_ZEIT))*Math.PI*2; }
    // leichte Neigung: beim Laufen nach vorn, an der Wand weg von der Wand
    const pusteLehne = z.key === 'pusten' && P.pusteRichtung !== 'hoch' ? (Math.min(1, (performance.now() - (P._pusteStartT || 0))/200) < 1 ? .1 : -.16)*pusteSeiteVon(P.pusteRichtung) : 0;   // erst zurück (Luft holen), dann in den Wind
    const leanZiel = z.key === 'lauf' ? 0 : (z.key === 'ws' ? (wandRichtung(P) > 0 ? .1 : -.1) : pusteLehne);
    S.lean += (leanZiel - S.lean)*(1 - Math.exp(-dt*12)); rollA += S.lean;
    rollA += IT.roll;
    if(S.trick && (S.trick.typ === 'salto' || S.trick.typ === 'schraube') && !z.key.startsWith('w')) rollA += -flip*2*Math.PI*tke;
    const H = holen(male), ch = H.ch;
    // Hangeln: lange Arme (Hände kleben oben an der Haftfläche), sonst normale Arme
    S.al = (S.al||1) + ((z.key === 'haft' ? HAFT_ARM : 1) - (S.al||1))*(1 - Math.exp(-dt*14));
    S.as = (S.as||1) + ((z.key === 'seil' ? 4.0 : (z.key === 'hebel' ? 2.4 : 1)) - (S.as||1))*(1 - Math.exp(-dt*12));
    // Seil hochklettern/herablassen (W/S): Hand über Hand – ein Arm zieht, der andere greift nach
    if(z.key === 'seil' && P.ropeLen != null){ const d = S.rl == null ? 0 : Math.abs(P.ropeLen - S.rl); S.rl = P.ropeLen; S.cp = (S.cp||0) + d; S.cs = (S.cs||0) + (d - (S.cs||0))*.3; } else { S.rl = null; S.cs = 0; }
    const klet = Math.sin(2*Math.PI*(S.cp||0)/46)*Math.min(1, (S.cs||0)/.6);
    for(const a of [ch.armN, ch.armP]){
      if(!a.k0) a.k0 = a.kids.map(q => ({p:q.pos.slice(), s:q.sc.slice()}));
      let al = S.al;
      if(z.key !== 'haft') al = S.as;   // am Seil/Haken: langer Greif-Arm (der andere etwas länger)
      if(z.key === 'seil') al *= 1 + (a === ch.armN ? 1 : -1)*.16*klet;
      if(z.key === 'tanz' && S.tz && S.tz.near && a === (S.tz.side > 0 ? ch.armP : ch.armN)) al = 1 + TANZ_ARM*S.ti;   // eingehakter Arm etwas länger, damit die Hände sich treffen
      a.alF = al;
      a.kids.forEach((q,i) => { if(i > 0) q.visible = z.key !== 'seil'; });   // am Seil: keine Hand-Knubbel oben, die Hände sind im Seil
      a.kids.forEach((q,i) => { const b = a.k0[i]; q.pos = [b.p[0], b.p[1]*al, b.p[2]]; if(i === 0) q.sc = [b.s[0], b.s[1]*al, b.s[2]]; });
    }
    if(ch.tail){   // Affen-Schwanz: rollt sich langsam ein und wieder aus, wedelt dabei; beim Laufen etwas schneller
      const wv = Math.min(1, S.spG/4.4); S.tp = (S.tp||0) + dt*(.8 + 1.4*wv + IT.tail*IT.env);
      const k = .15 + .55*(.5 - .5*Math.cos(S.tp)), n = ch.tail.segs.length;   // 0 = ausgerollt, 1 = eingerollt (nie ganz eingerollt: bleibt sichtbar)
      ch.tail.segs.forEach((sg, i) => { sg.rot = [(i === 0 ? -.55 : .05) + (i === 0 ? 0 : .6)*k + Math.sin(t*5 - i*.9)*.07*(i ? 1 : 0), 0, Math.sin(t*3 - i*.7)*(.14 - .07*k)*(i ? 1 : 0)]; });
    }
    ch.head.rot = S.cur.head; ch.armN.rot = S.cur.armN; ch.armP.rot = S.cur.armP; ch.legN.rot = S.cur.legN; ch.legP.rot = S.cur.legP;
    if(IT.pose){ for(const nm of ['head','armN','armP','legN','legP']) if(IT.pose[nm]) ch[nm].rot = lerpA(S.cur[nm], IT.pose[nm], IT.env); }
    // Fuesse: grosse Schritte (nur Fuesse, keine Beine) – Schritt nach vorn/hinten + Anheben
    S.lw = (S.lw||0) + ((z.key === 'lauf' ? 1 : 0) - (S.lw||0))*(1 - Math.exp(-dt*18));
    for(const [L,off] of [[ch.legN,0],[ch.legP,Math.PI]]){
      const bobF = (z.key === 'lauf') ? Math.abs(Math.cos(S.phase))*.015 : (z.key === 'idle' ? Math.sin(t*2.4)*.03 : 0);
      // einzelne Schritte: Fuß hebt ab (40 % des Zyklus), setzt klar auf und bleibt dann am Boden, bis er wieder dran ist
      const u = (((S.phase + off)/(2*Math.PI)) % 1 + 1) % 1, A = (male ? 1.0 : .75)*(vieleSchritte ? .38 : 1), SW = vieleSchritte ? .5 : .4;
      let sw, lift;
      if(u < SW){ const k = u/SW, e = k*k*(3 - 2*k); sw = (-A + 2*A*e)*S.lw; lift = Math.sin(k*Math.PI)*(male?1.1:1)*(vieleSchritte ? .45 : 1)*S.lw; }
      else { const k = (u - SW)/(1 - SW); sw = (A - 2*A*k)*S.lw; lift = 0; }
      L.pos = [L.base[0], L.base[1] + lift - bobF, L.base[2] + sw];
    }
    // Federn beim Laufen, sanftes Atmen im Stehen
    const lauf = z.key === 'lauf', bob = lauf ? Math.abs(Math.cos(S.phase))*.015 : (z.key === 'idle' ? Math.sin(t*2.4)*.03 : 0);
    const sq = z.key === 'haft' ? 0 : lauf ? Math.cos(S.phase*2)*.01 : (z.key === 'idle' ? Math.sin(t*2.4)*.015 : 0);
    // Blinzeln
    if(now > S.nb){ S.bl = now + 130; S.nb = now + 2200 + Math.random()*2800; }
    const zu = now < S.bl;
    for(const e of ch.eyes){ e.n.sc = [e.n.sc[0], zu ? e.y*.16 : e.y, e.n.sc[2]]; for(const g of e.g) g.visible = !zu; }
    // Pusten: Backen blasen sich auf (pulsieren leicht), runder Mund statt Lächeln; Augen beim kräftigen Pusten zusammengekniffen
    S.pu = (S.pu || 0) + ((z.key === 'pusten' ? 1 : 0) - (S.pu || 0))*(1 - Math.exp(-dt*14));
    if(ch.backen){ const pu = S.pu, puls = 1 + Math.sin(t*20)*.05*pu;
      for(const b of ch.backen){ b.visible = pu > .04; b.sc = b.sc0.map(v => v*(.45 + .65*pu)*puls); }
      ch.mundO.visible = pu > .3; ch.mundO.sc = ch.mundO.sc0.map(v => v*(.6 + .5*pu));
      for(const q of ch.lae) q.visible = pu <= .3;
      if(pu > .5 && !zu) for(const e of ch.eyes) e.n.sc = [e.n.sc[0], e.y*(1 - .45*pu), e.n.sc[2]]; }
    // Schirm-Trampolin: federt der Affe ab, geht das Schweinchen kurz in die Knie (und wippt nach)
    let lgX = 1, lgY = 1, trQ = 0;
    if(P.trampolin && P._trampolinSprungT){ const q = (now - P._trampolinSprungT)/380; if(q < 1){ trQ = Math.sin(q*Math.PI*2)*(1 - q); const a = Math.max(0, trQ)*.2; lgY = 1 - a; lgX = 1 + a*.45; } }
    H.wrap.pos = [0, 1.6 + bob, 0]; H.wrap.rot = [0, 0, rollA]; H.yawN.pos = [0, -1.6, 0]; H.yawN.rot = [0, S.yaw + IT.yaw + (S.trick && S.trick.typ !== 'salto' ? flip*2*Math.PI*tke*(S.trick.typ === 'schraube' ? 2 : 1) : 0), 0]; H.yawN.gs = [(1 - sq*.5)*1.14*lgX, (1 + sq)*lgY, (1 - sq*.5)*1.14*lgX];   // Affe und Schwein gleich groß (lgX/lgY: Liegen)
    // in die kleine Leinwand zeichnen
    gl.viewport(0, 0, SPR, SPRH); gl.disable(gl.SCISSOR_TEST); gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST);
    gl.useProgram(PRG); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, noise); gl.uniform1i(U.uNoise, 0);
    { const wear = typeof cosItemsOf === 'function' ? cosItemsOf(male ? 'm' : 'f') : null, kind = wear && wear.tattoo ? wear.tattoo.fx.kind : null;
      const tex = kind ? tattooTextur(kind) : null; TAT.on = !!tex; S.tat = tex ? kind : null;
      if(tex){ gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(U.uTat, 1); gl.activeTexture(gl.TEXTURE0); } }
    gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    drawNode(H.wrap, M.id(), M.ortho(FR.x0, FR.x1, FR.y0, FR.y1, -20, 20), [0, 1.8, 30]);
    const fy = P.h*0.5 + 4 + hangSenke(ch, S.al||1, P.h, HAFT_ARM);   // 4 px tiefer: die Figur steht im Gras
    // Am Seil schwingt die ganze Figur mit (Körper hängt entlang des Seils, Drehpunkt = Hände) – wie im 2D-Spiel
    let rs = 0; if(z.key === 'seil' && P.hookAttached && P.anchor){   // von oben gegriffen (Liane locker): Körper bleibt aufrecht
      const cx = P.x, cy = P.y - P.h*.6; rs = Math.atan2(P.anchor.x - cx, cy - P.anchor.y);
      // Nutzer: „ich schwinge durch Boden/Wand“ – der gezeichnete Körper hängt am Seil schräg, die Kollisionsbox bleibt aufrecht;
      // ragte der schräge Körper in Boden/Wand, wird er so weit aufgerichtet, bis er frei ist (nur Zeichnen, Raster festIst aus 32)
      if(rs && typeof festIst === 'function') for(let k = 0; k < 8; k++){
        let stoss = false;
        for(const d of SEIL_KOERPER_PROBEN) for(const q of SEIL_KOERPER_BREITE){   // entlang des Körpers UND quer (dicker Körper mit Fell)
          const bx = cx - Math.sin(rs)*d + Math.cos(rs)*q, by = cy + Math.cos(rs)*d + Math.sin(rs)*q;
          if(festIst(Math.floor(bx/40), Math.floor(by/40))){ stoss = true; break; } }
        if(!stoss) break; rs *= 0.7;
      } }
    S.rs = (S.rs||0) + (rs - (S.rs||0))*(1 - Math.exp(-dt*18));
    c.save();
    // An Wänden: die 3D-Figur ist breiter gezeichnet als ihre Stoßfläche – liegt Boden/Wand im gezeichneten Rand, wird sie
    // um diesen Unterschied davon weggeschoben (nur Zeichnen; Nutzer: „schwinge durch Boden/Wand“)
    { let ziel = 0;
      if(typeof festIst === 'function'){
        const by = Math.floor((P.y - P.h*.55)/40), rand = FIGUR_HALB - P.w/2;
        const rechts = P.x + FIGUR_HALB, links = P.x - FIGUR_HALB;
        if(festIst(Math.floor(rechts/40), by) && !festIst(Math.floor((P.x + P.w/2 - 1)/40), by)) ziel = -Math.min(rand, rechts - Math.floor(rechts/40)*40);
        else if(festIst(Math.floor(links/40), by) && !festIst(Math.floor((P.x - P.w/2 + 1)/40), by)) ziel = Math.min(rand, Math.floor(links/40)*40 + 40 - links);
      }
      S.wn = (S.wn || 0) + (ziel - (S.wn || 0))*(1 - Math.exp(-dt*25));
      if(Math.abs(S.wn) > .05) c.translate(S.wn, 0); }
    if(Math.abs(S.rs) > .001){ const a0 = ch.armP, tipPx = (() => { let top = 0; (a0.k0||[]).forEach((b, i) => { top = Math.max(top, i === 0 ? (Math.abs(b.p[1]) + b.s[1])*(a0.alF||1) : Math.abs(b.p[1])*(a0.alF||1) + b.s[1]); }); return (a0.pos[1] + top)*SC*.98; })(), py = fy - tipPx; c.translate(0, py); c.rotate(S.rs); c.translate(0, -py); }
    const Tm = c.getTransform();
    const dev = (x, y) => Tm.transformPoint(new DOMPoint(x*SC, fy - y*SC));
    const hp = handPunkt(ch.armP, 0, -.75*(ch.armP.alF||1), .04), h2 = handPunkt(ch.armN, 0, -.75*(ch.armN.alF||1), .04), hd = dev(0, 2.4);
    const a = dev(hp[0], hp[1]), b = dev(h2[0], h2[1]);
    P._handDev = {x: a.x, y: a.y, f: P._frameNo = (P._frameNo||0) + 1}; P._hand2Dev = {x: b.x, y: b.y}; P._headDev = {x: hd.x, y: hd.y};
    { const fu = dev(0, 0); P._fussDev = {x: fu.x, y: fu.y, skala: Math.hypot(Tm.a, Tm.b)}; }
    if(ch.mundO && ch.mundO.capM){ const w = ch.mundO.capM;   // Mund in Weltkoordinaten (nur Anzeige: dort beginnt der Puste-Wind, js/34)
      P._mund = {x: P.x + w[12]*SC, y: P.y - P.h*0.5 + fy - w[13]*SC - IT.hop*42, t: now}; }   // für Tests: Fußpunkt und Maßstab (Gerätepixel je Spielpixel)
    // Schirm-Trampolin: Ablauf-Zeit (gleichmäßig in SCHIRM_AUF_ZEIT auf, in SCHIRM_ZU_ZEIT rückwärts wieder zu); in der ersten
    // Phase holt das Schweinchen den zugeklappten Schirm hinter dem Rücken hervor -> dann wird er VOR dem Figurenbild gezeichnet
    S.trA = P.trampolin ? Math.min(1, (S.trA || 0) + dt/SCHIRM_AUF_ZEIT) : Math.max(0, (S.trA || 0) - dt/SCHIRM_ZU_ZEIT);
    const schirm = hinten => {
      if(male || !(S.trA > 0) || typeof drawUmbrella !== 'function') return;
      const A = schirmAblauf(S.trA); if(A.hinten !== hinten) return;
      const kopf = fy - (2.4 + .55)*SC*lgY - IT.hop*42;   // Kopf-Oberkante
      const hy = fy - (fy - kopf)*0.35 + 4*Math.max(0, trQ);   // Pfoten vor dem Bauch, Schirm tief auf dem Kopf (Nutzerwunsch)
      const stickF = Math.max(4, TRAMPOLIN_HOEHE - (fy - hy) - 22);
      const o = {u: 1, klapp: A.klapp, tilt: 0, quetsch: Math.max(0, trQ), haende: {schulter: [.8*SC, -2], farbe: '#f7aac4', rand: '#cf7d9b'}, pfoten: A.pfoten};
      const glatt = q => q*q*(3 - 2*q), w = SCHIRM_HUEFT_WINKEL, h0 = [SCHIRM_HAND_SEITE + 20, fy - 14], h1 = [h0[0] + SCHIRM_ZIEH_WEG, h0[1]];
      if(A.phase === 1){   // seitlich hinter der Hüfte hervorziehen: liegt fast waagerecht (Spitze nach links hinter dem Körper)
        const z = glatt(A.q);
        Object.assign(o, {hand: [h0[0] + (h1[0] - h0[0])*z, h0[1] - 3*Math.sin(z*Math.PI)], stick: 6, tilt: -w, haende: null}); }   // Griff mit Haken sichtbar
      else if(A.phase === 2){   // im Bogen vor dem Körper hochschwingen, pendelt sich senkrecht ein; die Pfoten greifen den Stock
        const z = glatt(A.q), d = schirmUeber(A.q), ende = [SCHIRM_HAND_SEITE, hy];
        Object.assign(o, {hand: [h1[0] + (ende[0] - h1[0])*z, h1[1] + (ende[1] - h1[1])*z - Math.sin(z*Math.PI)*10], stick: 6 + (stickF - 6)*z,
                          tilt: -w*(1 - d), pfoten: Math.max(0, (A.q - .35)/.65)});
        if(o.pfoten <= 0) o.haende = null; }
      else Object.assign(o, {hand: [SCHIRM_HAND_SEITE, hy], stick: stickF});   // aufklappen über dem Kopf, Pfoten vor dem Bauch
      drawUmbrella(P, 0, fy, o);
    };
    schirm(true);
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.shadowColor = 'rgba(46,28,14,.8)'; c.shadowBlur = Math.max(1, Math.min(5, 1.5*Math.hypot(Tm.a, Tm.b))); c.shadowOffsetX = 0; c.shadowOffsetY = 0;   // weiche dunkle Kontur
    c.drawImage(cv, FR.x0*SC, fy - FR.y1*SC - IT.hop*42, (FR.x1 - FR.x0)*SC, (FR.y1 - FR.y0)*SC);
    // Brille/Tattoo (Umkleide, js/27): als 2D-Auflage auf die projizierten Augen der 3D-Figur – von vorn beide Gläser, von der Seite ein Glas
    try{
      const wear = typeof cosItemsOf === 'function' ? cosItemsOf(male ? 'm' : 'f') : null;
      if(wear && wear.glasses && ch.eyes.length >= 2 && ch.eyes[0].n.capM && ch.head.capM){
        const cm = n => n.capM, pt = n => { const w = cm(n); return [w[12], w[13], w[14]]; };
        const e0 = pt(ch.eyes[0].n), e1 = pt(ch.eyes[1].n), hc = pt(ch.head), hopPx = IT.hop*42;
        const lo = q => [q[0]*SC, fy - q[1]*SC - hopPx];
        // Brille als flache Platte VOR den Augen, die sich mit dem Kopf mitdreht (Nutzerwunsch: „3D“ statt Umschalten
        // zwischen Vorder- und Seitenansicht): x-Achse = Auge→Auge, y-Achse = Kopf-oben, beide in die Bildebene projiziert –
        // dreht sich der Kopf, werden die Gläser stetig schmaler; der Bügel läuft vom äußeren Glasrand nach hinten zum Ohr
        // (nur auf der Seite, die man sieht).
        const nrm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0]/l, v[1]/l, v[2]/l]; };
        const hm = cm(ch.head), ex = nrm([e1[0] - e0[0], e1[1] - e0[1], e1[2] - e0[2]]), up = nrm([hm[4], hm[5], hm[6]]), fw = nrm([hm[8], hm[9], hm[10]]);
        const dE3 = Math.hypot(e1[0]-e0[0], e1[1]-e0[1], e1[2]-e0[2])*SC, w = dE3*(male ? .33 : .27), h = w*1.12, kind = wear.glasses.fx.kind;
        const VOR = .07, m3 = [(e0[0] + e1[0])/2 + fw[0]*VOR, (e0[1] + e1[1])/2 + fw[1]*VOR, (e0[2] + e1[2])/2 + fw[2]*VOR], M0 = lo(m3);
        const sicht = Math.max(0, Math.min(1, (fw[2] + .15)/.3));   // von hinten nicht zu sehen
        if(sicht > .02 && typeof drawGlasses === 'function'){
          c.save(); c.shadowColor = 'transparent'; c.shadowBlur = 0; c.globalAlpha = sicht;
          // Platte: lokales x (px) -> Bild (ex.x, -ex.y), lokales y (px, nach unten) -> Bild (-up.x, up.y)
          c.save(); c.transform(ex[0], -ex[1], -up[0], up[1], M0[0], M0[1]);
          drawGlasses(c, kind, [-dE3/2, 0], [dE3/2, 0], w, h); c.restore();
          // Bügel der sichtbaren Seite (die zur Kamera zeigt), Länge in 3D: projiziert nach hinten
          const seite = ex[2] >= 0 ? 1 : -1, zeig = Math.min(1, Math.abs(ex[2])*3);
          if(zeig > .02){
            const BUEGEL = {classic:'#111', round:'#c9a24a', aviator:'#d8b660', shutter:'#fff', heart:'#d6336c', '3d':'#e8e8e8', star:'#e0a800', cyber:'#7fe0ff', bling:'#ffd23f'};
            const laenge = (male ? 1.3 : 1.2)*SC, rand = seite*(dE3/2 + w*.95);
            const q0 = [M0[0] + ex[0]*rand + up[0]*h*.3, M0[1] - ex[1]*rand - up[1]*h*.3];   // äußerer Glasrand, etwas über der Mitte
            const q1 = [q0[0] - fw[0]*laenge - up[0]*h*.25, q0[1] + fw[1]*laenge + up[1]*h*.25];   // nach hinten, leicht abfallend zum Ohr
            const bw = Math.max(1.3, w*.26); c.lineCap = 'round'; c.globalAlpha = sicht*zeig;
            c.beginPath(); c.moveTo(q0[0], q0[1]); c.lineTo(q1[0], q1[1]);
            c.strokeStyle = 'rgba(45,28,22,.85)'; c.lineWidth = bw + 1.6; c.stroke();   // dunkler Rand: helle Bügel (Jalousie, 3D) auch auf heller Haut sichtbar
            c.strokeStyle = BUEGEL[kind] || '#222'; c.lineWidth = bw; c.stroke();
            { const T = c.getTransform(), d0 = T.transformPoint(new DOMPoint(q0[0], q0[1])), d1 = T.transformPoint(new DOMPoint(q1[0], q1[1]));   // für Tests: Bügel in Gerätepixeln
              P._buegelDev = {x0: d0.x, y0: d0.y, x1: d1.x, y1: d1.y, laenge, f: P._frameNo}; }
          }
          c.restore();
        }
      }
    }catch(e){}
    c.restore();
    c.restore();
    if(!male && P.umbrella > 0.03 && typeof drawUmbrella === 'function') drawUmbrella(P, 0, fy);   // bisheriger Schirm (2D), 3D-Schirm folgt ggf.
    schirm(false);   // Schirm-Trampolin (js/34): vor der Figur (ab dem Griff zum Stock), die Kuppel gibt nach, wenn der Affe abfedert
    // Puste-Wind des Affen (js/34) direkt im Bild der Figur zeichnen: beginnt genau an ihrem Mund
    if(male && P.pusteAn && ch.mundO && ch.mundO.capM && typeof pusteAmMundZeichnen === 'function'){
      const w = ch.mundO.capM; pusteAmMundZeichnen(P, w[12]*SC, fy - w[13]*SC - IT.hop*42);
    }
  };
  { const roh = window.fussFigurZeichnen;   // Zeit für die 3D-Figuren messen (Leistungs-Anzeige, Taste F)
    window.fussFigurZeichnen = function(P){ const t = performance.now(); try { return roh(P); } finally { F3D_QUALI.zeit = (F3D_QUALI.zeit || 0) + performance.now() - t; } }; }
})();
