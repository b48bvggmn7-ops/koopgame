// editor/js/01-zustand.js – Teil des Level-Editors für "Monchichi Koop".
// Alle editor/js/*.js teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags, kein Build)
// und werden in editor/index.html in fester Reihenfolge geladen.
// Zustand: Raster-Größe, alle Level-Objekte, Thema, Speichern im Browser (Autosave), Verknüpfungs-Markierungen.

const TILE = 40;
const MIN_COLS = 60, ROWS = 18;
// Himmel: so viele Reihen ÜBER Reihe 0 zeigt das Spiel durch den Zoom (Reihen −1 … −3); dort darf man ganz normal bauen
const SKY = 3;
const EDGE_MARGIN = 15;   // so viele leere Spalten bleiben rechts immer frei
let COLS = MIN_COLS;
const cvs = document.getElementById('c');
const ctx = cvs.getContext('2d');
const wrap = document.getElementById('canvasWrap');

const COLORS = {
  ground:'#8a6a3a', wall:'#7a8890', platform:'#8ea86a', crumble:'#c77b3f',
  fake:'#7a8890', wind:'rgba(160,220,255,0.28)',   // Scheinwand (wie Wand, gestrichelt), Aufwind (durchsichtig)
};
const SOLID_TILES = ['ground','wall','platform','crumble'];   // nur diese können sich bewegen

let tiles = {}; // key "c,r" -> type
let hooks = []; let switches = []; let doors = [];
let startM = null, startF = null, goal = null;
let currentTool = 'ground';
let painting = false;
let eraseDrag = false;       // Rechtsklick-Radieren aktiv
let currentLevelId = null, currentLevelName = null;
let spikes = [];             // [{c,r,dir}]  dir: 0=Spitzen oben, 1=rechts, 2=unten, 3=links
let clickNotDrag = false;
let coins = [];              // [{c,r,color}]  color: 'blue' (Affe) | 'pink' (Schweinchen) | 'gold' (beide)
let checkpoints = [];        // [{c,r}]
let plates = [];             // [{c,r,link}] Druckplatte: Verknüpfung AN, solange jemand draufsteht
let bouncers = [];           // [{c,r}] Sprungpilz
const radiusInput = document.getElementById('radiusInput');
function curRadius(){ const v=Number(radiusInput.value); return v>0 ? v : 6.5; }
let movers = [];             // [{c,r,dc,dr,speed}] Anker-Kästchen + Verschiebung
let moveDrag = null;         // {c,r,tc,tr} während Pfeil gezogen wird
let selMove = null;          // ausgewählte Bewegung zum Nachbearbeiten: {mv} (Boden/Wand) oder {hook}
const speedSelect = document.getElementById('speedSelect');
const moveSwitchSelect = document.getElementById('moveSwitchSelect');
function curMoveLink(){ return moveSwitchSelect.value ? Number(moveSwitchSelect.value) : null; }

const linkSelect = document.getElementById('linkSelect');
// Level-Thema (Aussehen im Spiel: Hintergrund, Farben, Tiere – js/10a-themen.js)
const THEME_BG = {dschungel:'#13261b', abend:'#2e1c30', ruinen:'#2e2818', nacht:'#0c1428', hoehle:'#191329', vulkan:'#2e120e'};
let theme = 'dschungel';
const themeSelect = document.getElementById('themeSelect');
themeSelect.addEventListener('change', ()=>{ theme = themeSelect.value; save(); draw(); });

function maxUsedCol(){
  let m = -1;
  for(const k in tiles){ const c = +k.split(',')[0]; if(c>m) m=c; }
  for(const p of [...hooks, ...switches, ...doors, ...spikes, ...coins, ...checkpoints, ...plates, ...bouncers, startM, startF, goal]) if(p && p.c>m) m=p.c;
  for(const mv of movers) if(mv.c+mv.dc>m) m=mv.c+mv.dc;
  for(const h of hooks) if(h.move && h.c+h.move.dc>m) m=h.c+h.move.dc;
  return m;
}
function setCols(n){
  n = Math.max(MIN_COLS, n);
  if(n === COLS && cvs.width === COLS*TILE) return;
  COLS = n;
  cvs.width = COLS*TILE; cvs.height = (ROWS + SKY)*TILE;
  fitView();
  document.getElementById('lenLabel').textContent = COLS + ' Spalten';
}
// Ansicht so verkleinern, dass die ganze Höhe (Himmel + 18 Reihen) ohne Scrollen ins Fenster passt (nie vergrößern)
function fitView(){
  const avail = wrap.clientHeight - 16;   // Platz für die waagerechte Scrollleiste
  const s = Math.min(1, Math.max(0.3, avail / cvs.height));
  cvs.style.width = (cvs.width * s) + 'px'; cvs.style.height = (cvs.height * s) + 'px';
}
window.addEventListener('resize', fitView);
requestAnimationFrame(fitView);   // nach dem ersten Aufbau der Seite (dann steht die Fensterhöhe fest)
function ensureRoom(c){ if(c + EDGE_MARGIN > COLS) setCols(c + EDGE_MARGIN); }
function fitCols(extra){ setCols(Math.max(extra||0, maxUsedCol() + 1 + EDGE_MARGIN)); }

// ---------- Zustand ----------
function snapshot(){
  return {
    cols: COLS,
    tiles: Object.keys(tiles).map(k=>{ const [c,r]=k.split(',').map(Number); return [c,r,tiles[k]]; }),
    hooks, switches, doors, spikes, coins, checkpoints, startM, startF, goal, movers, theme, plates, bouncers
  };
}
function applySnapshot(d){
  tiles = {};
  if(Array.isArray(d.tiles)) for(const [c,r,t] of d.tiles) tiles[c+','+r]=t;
  else if(d.tiles) tiles = {...d.tiles};
  hooks = (d.hooks||(d.hook?[d.hook]:[])).map(x=>({...x}));
  switches = (d.switches||[]).map(x=>({...x}));
  doors = (d.doors||[]).map(x=>({...x}));
  startM=d.startM||null; startF=d.startF||null; goal=d.goal||null;
  movers = (d.movers||[]).map(x=>({...x}));
  spikes = (d.spikes||[]).map(x=>({...x}));
  coins = (d.coins||[]).map(x=>({...x}));
  checkpoints = (d.checkpoints||[]).map(x=>({...x}));
  plates = (d.plates||[]).map(x=>({...x}));
  bouncers = (d.bouncers||[]).map(x=>({...x}));
  theme = THEME_BG[d.theme] ? d.theme : 'dschungel'; themeSelect.value = theme;
  fitCols(d.cols);
}

// Arbeitsstand (Entwurf) lokal im Browser
const STORAGE_KEY = 'monchichi_level_editor_v2';
let dirty = false;
// Bei „Verknüpfung“ und „per Schalter“ zeigen: welche Nummern sind schon vergeben (✓ + wofür)
function updateLinkMarks(){
  const uses = {};
  const add = (n, what)=>{ if(!n) return; (uses[n] = uses[n] || new Set()).add(what); };
  for(const s of switches) add(s.link, 'Schalter');
  for(const d of doors) add(d.link, 'Tür');
  for(const p of plates) add(p.link, 'Druckplatte');
  for(const mv of movers) add(mv.link, 'Bewegung');
  for(const h of hooks) if(h.move) add(h.move.link, 'Haken');
  for(const sel of [linkSelect, moveSwitchSelect]){
    for(const o of sel.options){
      const n = o.value || o.textContent.trim();
      if(!/^\d+$/.test(n)) continue;
      o.value = n;                                   // Wert bleibt die reine Nummer
      o.textContent = uses[n] ? `${n}  ✓ ${[...uses[n]].join(', ')}` : n;
    }
  }
}
let currentProjectFile = null;   // aus „Levels im Projekt“ geladen? dann z. B. 'level-3.json' (für „Auf GitHub speichern“)
function save(){
  updateLinkMarks();
  dirty = true;
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify({...snapshot(), currentLevelId, currentLevelName, currentProjectFile}));
  }catch(e){}
  updateName();
}
function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const d = JSON.parse(raw);
      applySnapshot(d);
      currentLevelId = d.currentLevelId||null; currentLevelName = d.currentLevelName||null;
      currentProjectFile = d.currentProjectFile||null;
      return;
    }
  }catch(e){}
  setCols(MIN_COLS);
}

function updateName(){
  document.getElementById('curName').textContent =
    (currentLevelName || 'Unbenanntes Level') + (dirty && currentLevelName ? ' •' : '');
}
