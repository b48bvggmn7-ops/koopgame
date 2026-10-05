// 10a-themen.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Level-Themen (Nutzerwunsch: jedes Level sieht anders aus) ----------
// Ein Thema legt fest: Himmel, Hintergrund-Ebenen, Farben von Boden/Wand/Moos, Pflanzen-Färbung, Vögel,
// welche Tiere vorkommen, Licht-Teilchen, Wetter und ob es dunkel ist (dann leuchtet es um die Figuren).
// Das Level wählt sein Thema mit "theme" (Editor: Auswahl „Thema“). Ohne Angabe: Dschungel.
// Nur Aussehen – an Physik und Spielablauf ändert ein Thema nichts.
const THEMES = {
  dschungel: {
    label: 'Dschungel (Morgen)',
    sky: [[0, '#8fcbe0'], [0.35, '#d6ecdf'], [0.58, '#ffe9bf'], [0.7, '#f8e2b0'], [1, '#d5e8cc']],
    sun: {x: 930, y: 290, r: 470, core: '255,252,230', glow: '255,232,170'},
    clouds: 'rgba(255,255,255,0.42)',
    far: {kind: 'karst', ridge: '#a9c8bd', top: '#87aca6', bottom: '#b5d0c4', light: 'rgba(255,246,214,0.22)', haze: '#d6eadc', mist: 0.75},
    back: {kind: 'waterfall', rock: ['#7e9b8c', '#93ae9d', '#7a978a'], moss: ['rgba(110,150,105,0.55)', 'rgba(140,175,120,0.45)'],
           water: ['rgba(232,246,250,0.95)', 'rgba(214,238,244,0.85)'], flow: ['rgba(255,255,255,0.75)', 'rgba(170,215,230,0.6)'],
           spray: 'rgba(255,255,255,0.85)', canopy: ['#6a9c82', '#7fb08f', '#98c49c', '#b7d9ad'], fade: ['#6f9f84', '#79a98c'], haze: '#d9ecdc'},
    mid: {kind: 'trees', trunk: '#6a8a74', trunkHi: 'rgba(255,245,210,0.18)', crown: ['#4f8467', '#66997a', '#86b98d', '#acd59f'],
          palm: ['#5f9271', '#73a682'], liana: 'rgba(80,120,90,0.8)', lianaLeaf: '#6fa27c', under: ['#4e8366', '#649879', '#80b48a', '#a3cf98'], haze: '#d4e9d6'},
    near: {kind: 'leaves', leaf: ['#4c8462', '#7fb88a'], vein: 'rgba(220,240,210,0.35)', fern: '#5a9068', haze: '#d8ecd9'},
    ground: {grassTop:'#5fe093', grass:'#34c46c', grassDark:'#23a257', dirt1:'#e19a5a', dirt2:'#c77c3d', stripe:'rgba(150,85,35,.28)', edge:'#a8662f'},
    wall: {top:'#a9b8c1', bottom:'#8796a0', mortar:'rgba(58,70,79,.42)', hi:'#cad6dc', shade:'#5d6b74', side:'rgba(70,82,90,.55)'},
    moss: {base: '#5aa35a', light: '#7cc36f', vine: '#3f8a4c', leaf: '#5aae5e'},
    plantFilter: '',
    birds: [
      {body:'#3fa7e0', belly:'#cdeeff', wing:'#2a7fb5', beak:'#ffb02e'},
      {body:'#e8574a', belly:'#ffd9c2', wing:'#b83a30', beak:'#ffcf3a'},
      {body:'#ffcc33', belly:'#fff4c8', wing:'#e09a00', beak:'#ff8c3a'},
      {body:'#5cc27a', belly:'#e2f7d0', wing:'#3a9a58', beak:'#ffb02e'},
    ],
    critters: {ground: [['frog', 0.05], ['snail', 0.08], ['mush', 0.08], ['bud', 0.09]], air: 'butterfly',
               airCols: ['#7ec8ff', '#ff9ecb', '#ffd166', '#b69cff'], hanging: 'sloth'},
    particles: {mode: 'float', col: '234,255,176', n: 18},
    ray: 'rgba(255,248,214,.28)', rain: true, rainbow: true, sunRays: true,
    dark: 0, tint: null,
  },

  abend: {
    label: 'Baumkronen im Abendrot',
    sky: [[0, '#3d3b78'], [0.3, '#8d4f86'], [0.55, '#ec7c5c'], [0.7, '#ffbe73'], [1, '#e0956a']],
    sun: {x: 700, y: 455, r: 520, core: '255,236,190', glow: '255,140,90'},
    clouds: 'rgba(255,175,185,0.45)', mistCol: '255,196,186',
    far: {kind: 'karst', ridge: '#8b6c9a', top: '#6b5888', bottom: '#a586a8', light: 'rgba(255,190,140,0.25)', haze: '#e9a39d', mist: 0.55},
    back: {kind: 'waterfall', rock: ['#76627e', '#8b7590', '#72607c'], moss: ['rgba(120,110,120,0.5)', 'rgba(150,120,120,0.4)'],
           water: ['rgba(255,226,206,0.95)', 'rgba(255,200,180,0.85)'], flow: ['rgba(255,245,230,0.75)', 'rgba(255,190,160,0.6)'],
           spray: 'rgba(255,230,210,0.85)', canopy: ['#5d5a73', '#6f6a80', '#8a7f8f', '#a8909a'], fade: ['#5f5870', '#665c72'], haze: '#e8a8a0'},
    mid: {kind: 'trees', trunk: '#4e4560', trunkHi: 'rgba(255,190,140,0.22)', crown: ['#3e4552', '#4f5560', '#6a6a6c', '#8f8170'],
          palm: ['#45495a', '#575a66'], liana: 'rgba(70,60,80,0.85)', lianaLeaf: '#5e5a6a', under: ['#3b3d4c', '#4a4a58', '#5e5a63', '#7a6a6a'], haze: '#d99a90'},
    near: {kind: 'leaves', leaf: ['#33303f', '#5a4c5c'], vein: 'rgba(255,190,150,0.25)', fern: '#463e52', haze: '#c88a86'},
    ground: {grassTop:'#e6d56a', grass:'#62ae4c', grassDark:'#3f8a3a', dirt1:'#d98650', dirt2:'#a85e35', stripe:'rgba(140,60,30,.3)', edge:'#8a4a28'},
    wall: {top:'#c8a898', bottom:'#a38676', mortar:'rgba(80,45,40,.42)', hi:'#e8cab6', shade:'#6e5248', side:'rgba(90,60,50,.55)'},
    moss: {base: '#6a9a4a', light: '#a8c060', vine: '#4f7a3c', leaf: '#7aa050'},
    plantFilter: 'sepia(0.25) saturate(1.1) hue-rotate(-12deg)',
    birds: [
      {body:'#e0362c', belly:'#ffcf3a', wing:'#2a6fd0', beak:'#f2e6d0'},   // Ara
      {body:'#2a7fd0', belly:'#ffd84a', wing:'#1d5aa0', beak:'#2b2b2b'},
      {body:'#2b2b2b', belly:'#fff4d0', wing:'#1d1d1d', beak:'#ff9a1f'},   // Tukan
    ],
    critters: {ground: [['frog', 0.04], ['snail', 0.06], ['mush', 0.06], ['bud', 0.1]], air: 'butterfly',
               airCols: ['#ff8a3d', '#ff5e7e', '#ffd166', '#c77bff'], hanging: 'sloth'},
    particles: {mode: 'firefly', col: '255,214,110', n: 16},
    ray: 'rgba(255,180,120,.25)', rain: true, rainbow: true, sunRays: true,
    dark: 0, tint: 'rgba(255,120,80,0.07)',
  },

  ruinen: {
    label: 'Tempelruinen (Mittag)',
    sky: [[0, '#79b4d8'], [0.4, '#cfe3e0'], [0.65, '#f3e2b8'], [1, '#e6cf9c']],
    sun: {x: 1030, y: 130, r: 420, core: '255,255,245', glow: '255,240,200'},
    clouds: 'rgba(255,255,250,0.5)',
    far: {kind: 'temple', ridge: '#c9b996', top: '#b3a284', bottom: '#d6c7a6', light: 'rgba(255,250,230,0.3)', haze: '#efe2c4', mist: 0.6},
    back: {kind: 'ruins', stone: ['#a89676', '#c4b28c', '#8e7d60'], canopy: ['#7f9a62', '#93ad70', '#adc286', '#c6d6a0'], fade: ['#8ea06c', '#98a874'], haze: '#ede0bf'},
    mid: {kind: 'trees', trunk: '#8a7a58', trunkHi: 'rgba(255,250,220,0.22)', crown: ['#6f8a4f', '#86a060', '#a4bb78', '#c3d496'],
          palm: ['#7a9a58', '#90ad68'], liana: 'rgba(100,120,70,0.8)', lianaLeaf: '#8aa86a', under: ['#6e8650', '#829a5e', '#9eb474', '#bccb8e'], haze: '#ebdfbf'},
    near: {kind: 'leaves', leaf: ['#6e8a50', '#a4bc78'], vein: 'rgba(255,250,220,0.35)', fern: '#7a9658', haze: '#efe3c3'},
    ground: {grassTop:'#d9da7c', grass:'#9fba4e', grassDark:'#748f36', dirt1:'#dcb57c', dirt2:'#b88c54', stripe:'rgba(130,90,40,.28)', edge:'#9a7040'},
    wall: {top:'#ddc697', bottom:'#c4a873', mortar:'rgba(110,80,40,.4)', hi:'#f2e1b8', shade:'#8f7448', side:'rgba(120,90,50,.5)'},
    moss: {base: '#8aa84c', light: '#b4c86a', vine: '#6a8a3c', leaf: '#8db05a'},
    plantFilter: 'sepia(0.35) saturate(0.9) hue-rotate(-8deg) brightness(1.05)',
    birds: [
      {body:'#b9b2a6', belly:'#ece6da', wing:'#8f877a', beak:'#e0a040'},   // Taube
      {body:'#a0703c', belly:'#f0d8b0', wing:'#7a5228', beak:'#ffb02e'},   // Spatz
      {body:'#3fa7e0', belly:'#cdeeff', wing:'#2a7fb5', beak:'#ffb02e'},
    ],
    critters: {ground: [['lizard', 0.1], ['snail', 0.05], ['bud', 0.06], ['mush', 0.03]], air: 'butterfly',
               airCols: ['#ffb347', '#ffe066', '#ff7e5f', '#7ec8ff'], hanging: 'bat'},
    particles: {mode: 'float', col: '255,240,200', n: 22},
    ray: 'rgba(255,250,225,.32)', rain: true, rainbow: true, sunRays: true,
    dark: 0, tint: 'rgba(255,220,150,0.05)',
  },

  nacht: {
    label: 'Mondnacht',
    sky: [[0, '#0a1230'], [0.45, '#1b2a5a'], [0.78, '#2d3e72'], [1, '#34466c']],
    moon: {x: 980, y: 140, r: 44, glow: 260},
    stars: 140,
    clouds: 'rgba(130,150,200,0.22)',
    far: {kind: 'karst', ridge: '#24345a', top: '#26365c', bottom: '#33456e', light: 'rgba(200,220,255,0.12)', haze: '#33457a', mist: 0.35},
    back: {kind: 'waterfall', rock: ['#2a3a58', '#34466a', '#283854'], moss: ['rgba(40,80,90,0.5)', 'rgba(60,100,110,0.4)'],
           water: ['rgba(180,210,250,0.85)', 'rgba(140,180,230,0.75)'], flow: ['rgba(230,240,255,0.7)', 'rgba(120,170,230,0.6)'],
           spray: 'rgba(200,220,255,0.6)', canopy: ['#17283a', '#1f3346', '#283f52', '#34505e'], fade: ['#18293a', '#1b2d3e'], haze: '#2c3e66'},
    mid: {kind: 'trees', trunk: '#1c2c38', trunkHi: 'rgba(170,200,255,0.12)', crown: ['#112530', '#17303a', '#204044', '#2c5250'],
          palm: ['#142a32', '#1c363e'], liana: 'rgba(30,60,60,0.85)', lianaLeaf: '#24484a', under: ['#0f222a', '#142c32', '#1c383c', '#26484a'], haze: '#22345a'},
    near: {kind: 'leaves', leaf: ['#0c1c24', '#183238'], vein: 'rgba(150,200,255,0.18)', fern: '#14282e', haze: '#1e2e50'},
    ground: {grassTop:'#6ad6a6', grass:'#2f8f6c', grassDark:'#1f6a50', dirt1:'#6a5a80', dirt2:'#463a5c', stripe:'rgba(30,20,60,.3)', edge:'#382c4c'},
    wall: {top:'#6e7c98', bottom:'#56627e', mortar:'rgba(20,25,45,.5)', hi:'#909cb8', shade:'#3a4460', side:'rgba(30,36,60,.55)'},
    moss: {base: '#2f7a64', light: '#5ac0a0', vine: '#24604e', leaf: '#3a8a70'},
    plantFilter: 'brightness(0.62) saturate(0.85) hue-rotate(25deg)',
    birds: [
      {body:'#8a6a4a', belly:'#e8d8b8', wing:'#6a4e36', beak:'#f0b030', owl: true},   // Eule
      {body:'#9a9aa8', belly:'#f0f0f6', wing:'#70707e', beak:'#f0b030', owl: true},
    ],
    critters: {ground: [['frog', 0.05], ['mush', 0.12], ['snail', 0.05], ['bud', 0.03]], air: 'firefly',
               airCols: ['#d8ff6a'], hanging: 'bat', mushGlow: true},
    particles: {mode: 'firefly', col: '210,255,120', n: 34},
    ray: 'rgba(170,200,255,.16)', rain: true, rainbow: false, sunRays: false,
    dark: 0.42, darkCol: '8,12,36', tint: null,
    crumble: {light:'#a99ab8', mid:'#8a7aa0', dark:'#665a80', edge:'#3e3456', gap:'rgba(20,15,40,.75)', moss:'#3f8f74', mossLight:'#6ac0a0', speck:'rgba(40,30,70,.55)'},
  },

  hoehle: {
    label: 'Kristallhöhle',
    sky: [[0, '#140f22'], [0.5, '#251c3a'], [1, '#1a1730']],
    clouds: null, mistCol: '70,60,120',
    far: {kind: 'cave', rock: '#2a2240', rock2: '#342a4e', glow: ['rgba(90,220,255,0.35)', 'rgba(200,110,255,0.3)'], haze: '#2a2448', mist: 0.3},
    back: {kind: 'crystals', rock: ['#30284a', '#3a3156', '#2c2444'], crystal: ['#5ee0ff', '#b48cff', '#7af0d0'],
           water: ['rgba(120,230,255,0.75)', 'rgba(90,170,230,0.65)'], flow: ['rgba(210,250,255,0.7)', 'rgba(90,200,240,0.55)'],
           spray: 'rgba(160,240,255,0.5)', canopy: ['#2a2244', '#30284e', '#382e58', '#423664'], fade: ['#221c38', '#241d3a'], haze: '#2a2448'},
    mid: {kind: 'pillars', rock: ['#3a3054', '#463a64', '#2e2644'], glowCap: ['#6af0ff', '#c08aff'], under: ['#241e38', '#2c2442', '#352c50', '#40365e'], haze: '#2a2448'},
    near: {kind: 'rocks', rock: ['#1c1830', '#2a2440'], crystal: ['#5ee0ff', '#b48cff'], haze: '#221c3a'},
    ground: {grassTop:'#9af6e6', grass:'#3cb7a8', grassDark:'#2a8a80', dirt1:'#5c4c70', dirt2:'#3e3252', stripe:'rgba(20,10,40,.32)', edge:'#30264a'},
    wall: {top:'#625a78', bottom:'#4c4564', mortar:'rgba(15,10,30,.5)', hi:'#827a9a', shade:'#2e2840', side:'rgba(25,20,40,.55)'},
    moss: {base: '#2fa898', light: '#7af0e0', vine: '#24807a', leaf: '#3ab8a8'},
    plantFilter: 'hue-rotate(115deg) saturate(1.2) brightness(0.85)',
    birds: [],
    critters: {ground: [['crystal', 0.13], ['mush', 0.1], ['snail', 0.04]], air: 'firefly',
               airCols: ['#7af0ff'], hanging: 'bat', mushGlow: true},
    particles: {mode: 'float', col: '140,240,255', n: 28},
    ray: null, rain: false, rainbow: false, sunRays: false,
    dark: 0.48, darkCol: '10,6,24', tint: null,
    crumble: {light:'#8a7ca6', mid:'#6e6290', dark:'#544872', edge:'#30284a', gap:'rgba(15,10,30,.75)', moss:'#3cb7a8', mossLight:'#8af0e0', speck:'rgba(30,20,60,.55)'},
  },

  vulkan: {
    label: 'Feuerberg',
    sky: [[0, '#26101a'], [0.38, '#5c1c1e'], [0.68, '#b8441e'], [0.82, '#e0702a'], [1, '#5a2418']],
    clouds: 'rgba(70,45,45,0.55)', mistCol: '130,60,45',
    far: {kind: 'volcano', ridge: '#3a1e1e', top: '#2e1818', bottom: '#4a2420', lava: ['#ffcc4a', '#ff6a1f'], smoke: 'rgba(60,40,40,0.5)', haze: '#7a3424', mist: 0.4},
    back: {kind: 'waterfall', rock: ['#3a2422', '#4a2e28', '#36201e'], moss: ['rgba(90,40,25,0.5)', 'rgba(120,50,30,0.4)'],
           water: ['rgba(255,190,70,0.97)', 'rgba(255,110,30,0.92)'], flow: ['rgba(255,240,150,0.85)', 'rgba(255,80,20,0.7)'],
           spray: 'rgba(255,150,60,0.6)', canopy: ['#2e2422', '#3a2c26', '#4a3529', '#5e4030'], fade: ['#2c1e1c', '#30201c'], haze: '#6a2c20'},
    mid: {kind: 'deadtrees', trunk: '#241816', trunkHi: 'rgba(255,120,60,0.2)', under: ['#22160f', '#2c1c14', '#38241a', '#462c1e'], haze: '#5a2820'},
    near: {kind: 'rocks', rock: ['#1a100e', '#2a1a16'], crystal: ['#ff7a2a', '#ffcc4a'], haze: '#4a2018'},
    ground: {grassTop:'#c4ac66', grass:'#727a3a', grassDark:'#4e5628', dirt1:'#5c3a30', dirt2:'#3a2420', stripe:'rgba(255,90,30,.3)', edge:'#2a1814'},
    wall: {top:'#4c4248', bottom:'#3a3038', mortar:'rgba(255,100,30,.5)', hi:'#6c5c64', shade:'#241c22', side:'rgba(30,20,24,.6)'},
    moss: {base: '#6a6a34', light: '#a89a50', vine: '#4e4a26', leaf: '#7a7038'},
    plantFilter: 'sepia(0.7) saturate(0.7) brightness(0.62) hue-rotate(-15deg)',
    birds: [
      {body:'#2a2a30', belly:'#4a4a52', wing:'#18181c', beak:'#5a5a60'},   // Rabe
    ],
    critters: {ground: [['lizard', 0.12], ['crystal', 0.06]], air: 'firefly',
               airCols: ['#ffa040'], hanging: 'bat', crystalCols: ['#ff7a2a', '#ffcc4a'], lizardCol: '#e2492a'},
    particles: {mode: 'ember', col: '255,140,50', n: 34},
    ray: 'rgba(255,120,60,.18)', rain: false, ash: true, rainbow: false, sunRays: false,
    dark: 0.18, darkCol: '30,6,6', tint: 'rgba(255,80,30,0.06)',
    crumble: {light:'#8a5a48', mid:'#6e4436', dark:'#4e2e24', edge:'#2a1814', gap:'rgba(255,90,30,.6)', moss:'#6f7a3a', mossLight:'#a89a50', speck:'rgba(40,20,10,.55)'},
  },
};
const THEME_ORDER = ['dschungel', 'abend', 'ruinen', 'nacht', 'hoehle', 'vulkan'];
let THEME = THEMES.dschungel, themeName = 'dschungel';

// Pflanzen-Bilder in den Farben des Themas (einmal je Thema vorberechnet)
const themedSpriteCache = {};
function themedSprites(list){
  const f = THEME.plantFilter;
  if(!f) return list;
  const key = themeName + ':' + list.length;
  if(themedSpriteCache[key]) return themedSpriteCache[key];
  const out = list.map(img => {
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d');
    try{ g.filter = f; }catch(e){}
    g.drawImage(img, 0, 0);
    return c;
  });
  themedSpriteCache[key] = out;
  return out;
}
// Holz-Plattform-Textur im Thema eingefärbt
const themedImgCache = {};
function themedImg(img){
  const f = THEME.plantFilter;
  if(!f || !img || !img.complete || !img.naturalWidth) return img;
  const key = themeName + ':' + img.src;
  if(themedImgCache[key]) return themedImgCache[key];
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext('2d');
  try{ g.filter = f.replace(/brightness\(([\d.]+)\)/, (m, v)=> 'brightness(' + Math.min(1, Number(v) + 0.2) + ')'); }catch(e){}
  g.drawImage(img, 0, 0);
  themedImgCache[key] = c;
  return c;
}

function setTheme(name){
  if(!THEMES[name]) name = 'dschungel';
  const changed = name !== themeName || !BG_LAYERS.length;
  themeName = name; THEME = THEMES[name];
  if(changed) buildBackground();
  Object.assign(CRUMBLE_PAL, CRUMBLE_PAL_DEFAULT, THEME.crumble || {});
  // Partikel neu einfärben/verteilen; Deko und Tiere werden beim nächsten Zeichnen neu aufgebaut
  if(typeof initParticles === 'function') initParticles();
  decoFor = null; critFor = null;
  if(!THEME.rain && typeof weatherForce === 'function') weatherForce('sun');
}

// Dunkle Themen (Nacht, Höhle): alles etwas dunkler, um die Figuren und leuchtende Dinge bleibt es hell.
const darkCanvas = document.createElement('canvas'); darkCanvas.width = W; darkCanvas.height = H;
const darkCtx = darkCanvas.getContext('2d');
function themeLights(){
  // Lichtquellen in Welt-Koordinaten: [x, y, Radius]
  const L = [];
  for(const p of [p1, p2]) if(p) L.push([p.x, p.y - p.h*0.5, 230]);
  for(const c of coins) if(!c.taken && !hidden(c.x, c.y)) L.push([c.x, c.y, 46]);
  for(const cp of checkpointDefs) L.push([cp.x, cp.y - 30, 90]);
  if(goal) L.push([goal.x, goal.y - 30, 140]);
  for(const h of hooks) L.push([h.x, h.y, 60]);
  const hidden = (x, y)=> fakeWalls.some(f => x > f.x && x < f.x + f.w && y > f.y && y < f.y + f.h);
  for(const sw of switchDefs) if(!hidden(sw.x, sw.y)) L.push([sw.x, sw.y, 60]);   // versteckte Hebel nicht verraten
  for(const pl of plates) L.push([pl.x, pl.y + 10, 50]);
  if(typeof critters !== 'undefined') for(const c of critters) if(c.glow) L.push([c.x, c.y - (c.kind === 'crystal' ? 12 : 0), c.glow]);
  return L;
}
function drawThemeDarkness(){
  const a = THEME.dark;
  if(!a) return;
  const g = darkCtx;
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, W, H);
  g.fillStyle = `rgba(${THEME.darkCol},${a})`; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'destination-out';
  for(const [wx, wy, r] of themeLights()){
    const sx = (wx - camX)*zoom, sy = wy*zoom + H*(1 - zoom), rr = r*zoom;
    if(sx < -rr || sx > W + rr || sy < -rr || sy > H + rr) continue;
    const gr = g.createRadialGradient(sx, sy, 0, sx, sy, rr);
    gr.addColorStop(0, 'rgba(0,0,0,0.95)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(sx, sy, rr, 0, Math.PI*2); g.fill();
  }
  g.globalCompositeOperation = 'source-over';
  ctx.drawImage(darkCanvas, 0, 0);
}
