// 01-level.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Level ----------
let LEVEL_W = 2350, LEVEL_H = 720;
const CEILING_MARGIN = 0; // zurückgesetzt auf die vorherige Bildschirmgröße

let solids = [];
let switchDefs = [];
let linkOn = {};          // Hebel-Zustand je Verknüpfungs-Nummer: true = eingeschaltet (Tür offen / Bewegung läuft)
let hooks = [];
let spikes = [];
let coins = [];          // {x,y,taken,pop}
let checkpointDefs = []; // {x,y,reachedM,reachedF,raiseT} aus dem Editor, nach x sortiert
let activeCp = -1;       // Index des zuletzt von BEIDEN erreichten Checkpoints (-1 = Start)
let deathState = null;   // gesetzt, solange nach einem Tod auf "beliebige Taste" gewartet wird
let coinsNeeded = 0;     // Mindest-Münzen fürs Ziel: 0 (Pflicht auf Nutzerwunsch entfernt)
let movingPlatforms = [];
// Neue Elemente (Level 4–6): Druckplatte, Aufwind, Scheinwand, Sprungpilz
let plates = [];         // {x,y,link,down} Druckplatte: Verknüpfung ist AN, solange jemand draufsteht
let winds = [];          // {x,y,w,h} Aufwind: trägt das Schweinchen mit offenem Schirm nach oben
let fakeWalls = [];      // {x,y,w,h} Scheinwand: sieht aus wie Wand, man kann durchlaufen (versteckte Wege)
let bouncers = [];       // {x,y} Sprungpilz (Fußpunkt): schleudert hoch, wer draufkommt
let goal = {x:0, y:0};
let checkpoints = [[0,60,680]];
let levelStartM = {x:60, y:680};
let levelStartF = null;

function checkpointFor(x){
  let best = checkpoints[0];
  for(const c of checkpoints){ if(x >= c[0]) best = c; }
  return {x:best[1], y:best[2]};
}

// Die Default-Map (aktueller Teststand) - im gleichen Format, das der Editor exportiert
const DEFAULT_LEVEL = {
  solids: [
    {x:1600,y:120, w:40, h:40, type:'ground'},
    {x:0,   y:400, w:40, h:40, type:'ground'},
    {x:0,   y:480, w:40, h:40, type:'ground'},
    {x:2160,y:520, w:120,h:40, type:'ground'},
    {x:0,   y:560, w:40, h:40, type:'ground'},
    {x:0,   y:640, w:40, h:40, type:'ground'},
    {x:560, y:640, w:360,h:40, type:'ground'},
    {x:1760,y:640, w:40, h:40, type:'ground'},
    {x:0,   y:680, w:280,h:40, type:'ground'},
    {x:960,y:0,w:40,h:40,type:'wall'},{x:1800,y:0,w:40,h:40,type:'wall'},
    {x:960,y:40,w:40,h:40,type:'wall'},{x:1800,y:40,w:40,h:40,type:'wall'},
    {x:960,y:80,w:40,h:40,type:'wall'},{x:1800,y:80,w:40,h:40,type:'wall'},
    {x:960,y:120,w:40,h:40,type:'wall'},{x:1800,y:120,w:40,h:40,type:'wall'},
    {x:960,y:160,w:40,h:40,type:'wall'},{x:1240,y:160,w:120,h:40,type:'wall'},{x:1800,y:160,w:40,h:40,type:'wall'},
    {x:760,y:200,w:80,h:40,type:'wall'},{x:1800,y:200,w:40,h:40,type:'wall'},
    {x:760,y:240,w:80,h:40,type:'wall'},{x:1800,y:240,w:40,h:40,type:'wall'},
    {x:520,y:280,w:40,h:40,type:'wall'},{x:760,y:280,w:80,h:40,type:'wall'},{x:1800,y:280,w:40,h:40,type:'wall'},
    {x:0,y:320,w:40,h:40,type:'wall'},{x:520,y:320,w:40,h:40,type:'wall'},{x:760,y:320,w:80,h:40,type:'wall'},{x:1800,y:320,w:40,h:40,type:'wall'},
    {x:0,y:360,w:40,h:40,type:'wall'},{x:760,y:360,w:80,h:40,type:'wall'},{x:1800,y:360,w:40,h:40,type:'wall'},
    {x:760,y:400,w:80,h:40,type:'wall'},{x:1800,y:400,w:40,h:40,type:'wall'},
    {x:0,y:440,w:40,h:40,type:'wall'},{x:760,y:440,w:80,h:40,type:'wall'},{x:1800,y:440,w:40,h:40,type:'wall'},
    {x:760,y:480,w:80,h:40,type:'wall'},
    {x:0,y:520,w:40,h:40,type:'wall'},{x:760,y:520,w:80,h:40,type:'wall'},
    {x:760,y:560,w:80,h:40,type:'wall'},{x:1800,y:560,w:40,h:40,type:'wall'},
    {x:0,y:600,w:40,h:40,type:'wall'},{x:760,y:600,w:80,h:40,type:'wall'},{x:1800,y:600,w:40,h:40,type:'wall'},
    {x:1800,y:640,w:40,h:40,type:'wall'},
    {x:480,y:640,w:80,h:40,type:'crumble'},
    {x:920,y:640,w:80,h:40,type:'crumble'},
  ],
  hooks: [ {x:1300, y:220} ],
  switches: [],
  doors: [],
  spikes: [],
  movingPlatforms: [],
  startM: {x:60, y:680},
  startF: null,
  goal: {x:2260, y:520},
};

// Tode je Figur im aktuellen Level (Anzeige oben rechts: wer stirbt öfter?) – beim Laden eines Levels wieder 0
let deathCount = {m: 0, f: 0};
function buildLevel(data){
  deathCount = {m: 0, f: 0};
  solids = (data.solids||[]).filter(s=>s.type!=='fake').map(s=>({...s}));
  fakeWalls = (data.solids||[]).filter(s=>s.type==='fake').map(s=>({...s}));
  for(const E of ELEMENTE) if(E.spiel && E.spiel.laden) E.spiel.laden(data);   // Hebel, Türen, Druckplatten, Pilze, Aufwind … (elemente/)
  hooks = (data.hooks||[]).map(h=>{
    const o = {...h};
    if(typeof h.targetX === 'number'){
      // Bewegter Haken: pendelt wie bewegter Boden, optional per Schalter
      o.moving = true; o.startX = h.x; o.startY = h.y; o.moveDir = 1; o.tripActive = false;
      o.switchLink = h.switchLink||null;
      o.switchCtl = !!(h.switchLink && ((data.switches||[]).some(sw=>sw.link===h.switchLink) || (data.plates||[]).some(p=>p.link===h.switchLink)));
    }
    return o;
  });
  spikes = (data.spikes||[]).map(s=>({...s}));
  coins = (data.coins||[]).map(c=>({x:c.x, y:c.y, color: c.color||'gold', taken:false, pop:0}));
  checkpointDefs = (data.checkpoints||[]).map(c=>({x:c.x, y:c.y, reachedM:false, reachedF:false, raiseT:0}))
                     .sort((a,b)=>a.x-b.x);
  coinsNeeded = 0;   // keine Mindest-Münzen fürs Ziel mehr (Nutzerwunsch: gemeinsame Gold-Zählung „x / 10“ entfernt)
  movingPlatforms = (data.movingPlatforms||[]).map(m=>({...m}));
  for(const mp of movingPlatforms){
    solids.push({x:mp.x, y:mp.y, w:mp.w||40, h:mp.h||40, type:'moveplat', link:mp.link,
      look: mp.look==='crumble' ? 'ground' : mp.look, group: mp.group, speed: mp.speed,
      switchLink: mp.switchLink||null,
      // Nur schaltergesteuert, wenn es im Level auch einen Schalter mit dieser Nummer gibt
      switchCtl: !!(mp.switchLink && (switchDefs.some(sw=>sw.link===mp.switchLink) || plates.some(p=>p.link===mp.switchLink))), tripActive:false,
      startX:mp.x, startY:mp.y, targetX:mp.targetX, targetY:mp.targetY, moveDir:1});
  }

  // Ziel: entweder vorgegeben, oder automatisch auf dem am weitesten rechts liegenden Boden/Plattform
  if(data.goal){
    goal = {x:data.goal.x, y:data.goal.y};
  } else {
    let best = null;
    for(const s of solids){
      if((s.type==='ground'||s.type==='platform') && (!best || s.x+s.w > best.x+best.w)) best = s;
    }
    goal = best ? {x:best.x+best.w/2, y:best.y} : {x:200, y:640};
  }

  levelStartM = data.startM ? {x:data.startM.x, y:data.startM.y} : {x:60, y:640};
  levelStartF = data.startF ? {x:data.startF.x, y:data.startF.y} : {x:levelStartM.x+44, y:levelStartM.y};

  // Checkpoints automatisch aus allen Boden-Stücken (von links nach rechts sortiert)
  const grounds = solids.filter(s=>s.type==='ground').sort((a,b)=>a.x-b.x);
  checkpoints = grounds.length
    ? grounds.map(g=>[g.x, g.x+10, g.y])
    : [[0, levelStartM.x, levelStartM.y]];

  // Levelbreite automatisch aus dem Inhalt ableiten, mit etwas Rand
  let maxX = goal.x;
  for(const s of solids) maxX = Math.max(maxX, s.x+s.w, s.type==='moveplat' ? s.targetX+s.w : 0);
  for(const h of hooks) maxX = Math.max(maxX, h.x, h.moving ? h.targetX : 0);
  LEVEL_W = maxX + 200;
  computeGroundNeighbors();
  // Aussehen des Levels (10a-themen.js): altes "theme"/"look" unverändert, sonst Welt + Tageszeit als Schichten
  levelTheme = typeof resolveLevelLook === 'function' ? resolveLevelLook(data) : (data.theme || 'dschungel');
  levelLayers = {welt: data.welt || null, tageszeit: data.tageszeit || null, wetter: data.wetter || 'wechselnd', vorschau: !!data.schichtenVorschau};
  if(typeof setTheme === 'function') setTheme(levelTheme);
  if(typeof setWeatherMode === 'function') setWeatherMode(levelLayers.wetter);   // 19-wetter.js
}
let levelTheme = 'dschungel';
let levelLayers = {welt: null, tageszeit: null, wetter: 'wechselnd', vorschau: false};   // Ausbau 1

// Für schön gezeichneten Boden: welche Seiten eines Bodenstücks grenzen an ein gleichartiges Stück?
// (dort keine runden Ecken und kein Gras, sondern nahtloser Übergang)
function groundFamily(s){
  if(s.type==='ground') return 'g';
  if(s.type==='crumble') return 'c';
  if(s.type==='wall' || s.type==='fake') return 'w';   // Scheinwand geht nahtlos in echte Wand über
  if(s.type==='moveplat' && s.look==='ground') return 'm'+s.group;
  if(s.type==='moveplat' && s.look==='wall') return 'mw'+s.group;
  return null;
}
function computeGroundNeighbors(){
  const list = solids.concat(fakeWalls).filter(groundFamily);
  for(const s of list){
    const fam = groundFamily(s);
    const sx = s.type==='moveplat' ? s.startX : s.x, sy = s.type==='moveplat' ? s.startY : s.y;
    const nb = {l:false, r:false, b:false, above:[], below:[]};
    for(const o of list){
      if(o===s || groundFamily(o)!==fam) continue;
      const ox = o.type==='moveplat' ? o.startX : o.x, oy = o.type==='moveplat' ? o.startY : o.y;
      const vOver = oy < sy+s.h && oy+o.h > sy, hOver = ox < sx+s.w && ox+o.w > sx;
      if(vOver && Math.abs(ox+o.w - sx) < 1) nb.l = true;
      if(vOver && Math.abs(sx+s.w - ox) < 1) nb.r = true;
      if(hOver && Math.abs(sy+s.h - oy) < 1) nb.b = true;
      if(hOver && Math.abs(oy+o.h - sy) < 1) nb.above.push([Math.max(ox,sx)-sx, Math.min(ox+o.w,sx+s.w)-sx]);
      if(hOver && Math.abs(sy+s.h - oy) < 1) nb.below.push([Math.max(ox,sx)-sx, Math.min(ox+o.w,sx+s.w)-sx]);
    }
    s.nb = nb;
  }
}

buildLevel(DEFAULT_LEVEL);
