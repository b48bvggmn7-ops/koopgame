// 15-level-laden.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

document.getElementById('resetBtn').addEventListener('click', resetLevel);
document.getElementById('loadLevelBtn').addEventListener('click', ()=>{
  document.getElementById('loadLevelInput').click();
});
const LOAD_TILE = 40;
function mergeCellsToRects(cells){
  const byRow = {};
  for(const {c,r} of cells){ (byRow[r]=byRow[r]||[]).push(c); }
  const rects=[];
  for(const r in byRow){
    const cols = byRow[r].slice().sort((a,b)=>a-b);
    let start=cols[0], prev=cols[0];
    for(let i=1;i<=cols.length;i++){
      if(cols[i]===prev+1){ prev=cols[i]; continue; }
      rects.push({x:start*LOAD_TILE, y:Number(r)*LOAD_TILE, w:(prev-start+1)*LOAD_TILE, h:LOAD_TILE});
      start=cols[i]; prev=cols[i];
    }
  }
  return rects;
}
// Wandelt das rohe Editor-"Als Datei speichern"-Format (Zellen c,r) in das Spiel-Format (Pixel x,y) um
function convertEditorSaveFormat(d){
  const byType = {};
  for(const key in (d.tiles||{})){
    const [c,r] = key.split(',').map(Number);
    const t = d.tiles[key];
    (byType[t] = byType[t]||[]).push({c,r});
  }
  let solids = [];
  for(const type in byType){
    for(const rect of mergeCellsToRects(byType[type])) solids.push({...rect, type});
  }
  const hooks = (d.hooks||[]).map(h=>{
    const o = {x:h.c*LOAD_TILE+LOAD_TILE/2, y:h.r*LOAD_TILE+LOAD_TILE/2};
    if(h.radius > 0) o.radius = h.radius*LOAD_TILE; // Editor speichert den Radius in Kästchen
    return o;
  });
  const switches = (d.switches||[]).map(s=>({x:s.c*LOAD_TILE+LOAD_TILE/2, y:s.r*LOAD_TILE+LOAD_TILE/2, link:s.link}));
  const doors = (d.doors||[]).map(dd=>({x:dd.c*LOAD_TILE+LOAD_TILE/2, y:dd.r*LOAD_TILE+LOAD_TILE/2, link:dd.link}));
  const spikes = (d.spikes||[]).map(s=>({x:s.c*LOAD_TILE+LOAD_TILE/2, y:s.r*LOAD_TILE+LOAD_TILE, w:LOAD_TILE, h:LOAD_TILE, dir:s.dir||0}));
  const movingPlatforms = (d.movePlats||[]).map(m=>{
    const target = (d.moveTargets||[]).find(t=>t.link===m.link);
    return {x:m.c*LOAD_TILE, y:m.r*LOAD_TILE, w:LOAD_TILE, h:LOAD_TILE, link:m.link,
      targetX: target?target.c*LOAD_TILE:m.c*LOAD_TILE, targetY: target?target.r*LOAD_TILE:m.r*LOAD_TILE};
  });
  return {
    solids, hooks, switches, doors, spikes, movingPlatforms,
    coins: (d.coins||[]).map(c=>({x:c.c*LOAD_TILE+LOAD_TILE/2, y:c.r*LOAD_TILE+LOAD_TILE/2, color:c.color||'gold'})),
    checkpoints: (d.checkpoints||[]).map(c=>({x:c.c*LOAD_TILE+LOAD_TILE/2, y:c.r*LOAD_TILE+LOAD_TILE})),
    startM: d.startM ? {x:d.startM.c*LOAD_TILE+LOAD_TILE/2, y:d.startM.r*LOAD_TILE+LOAD_TILE} : null,
    startF: d.startF ? {x:d.startF.c*LOAD_TILE+LOAD_TILE/2, y:d.startF.r*LOAD_TILE+LOAD_TILE} : null,
    goal: d.goal ? {x:d.goal.c*LOAD_TILE+LOAD_TILE/2, y:d.goal.r*LOAD_TILE+LOAD_TILE} : null,
  };
}

document.getElementById('loadLevelInput').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      let data = JSON.parse(reader.result);
      if(data.tiles && !data.solids) data = convertEditorSaveFormat(data);
      buildLevel(data);
      resetLevel();
    }catch(err){
      alert('Konnte die Datei nicht laden – ist es eine vom Editor exportierte JSON-Datei?');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});
