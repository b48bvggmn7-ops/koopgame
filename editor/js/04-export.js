// editor/js/04-export.js – Teil des Level-Editors für "Monchichi Koop".
// Alle editor/js/*.js teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags, kein Build)
// und werden in editor/index.html in fester Reihenfolge geladen.
// Export ins Spiel-Format, „▶ Testen“, Herunterladen, „Ins Projekt aufnehmen“, Kopieren.

function mergeRects(cells){
  // Einfaches Zusammenfassen: gleiche Reihe, benachbarte Spalten -> ein Rechteck
  const byRow = {};
  for(const {c,r} of cells){ (byRow[r] = byRow[r]||[]).push(c); }
  const rects = [];
  for(const r in byRow){
    const cols = byRow[r].sort((a,b)=>a-b);
    let start = cols[0], prev = cols[0];
    for(let i=1;i<=cols.length;i++){
      if(cols[i] === prev+1){ prev = cols[i]; continue; }
      rects.push({x:start*TILE, y:Number(r)*TILE, w:(prev-start+1)*TILE, h:TILE});
      start = cols[i]; prev = cols[i];
    }
  }
  return rects;
}

function exportLevel(){
  const groups = moverGroups();
  const movingKeys = new Set();
  groups.forEach(x=>x.g.keys.forEach(k=>movingKeys.add(k)));
  const byType = {ground:[], wall:[], platform:[], crumble:[], fake:[], wind:[]};
  for(const key in tiles){
    if(movingKeys.has(key) || !byType[tiles[key]]) continue;
    const [c,r] = key.split(',').map(Number);
    byType[tiles[key]].push({c,r});
  }
  let solids = [];
  for(const type of ['ground','wall','platform','crumble','fake']){
    const rects = mergeRects(byType[type]);
    for(const rect of rects) solids.push({...rect, type});
  }
  const movingPlatforms = [];
  groups.forEach(({mv,g},i)=>{
    for(const rect of mergeRects(g.cells.map(([c,r])=>({c,r})))){
      movingPlatforms.push({...rect, look:g.type, group:i+1,
        targetX: rect.x+mv.dc*TILE, targetY: rect.y+mv.dr*TILE, speed: mv.speed||4.5,
        switchLink: mv.link||null});
    }
  });
  const out = {
    solids, movingPlatforms,
    hooks: hooks.map(h=>{
      const o = {x:h.c*TILE+TILE/2, y:h.r*TILE+TILE/2, radius:(h.radius||6.5)*TILE};
      if(h.move && (h.move.dc||h.move.dr)){
        o.targetX = o.x + h.move.dc*TILE; o.targetY = o.y + h.move.dr*TILE;
        o.speed = h.move.speed||4.5; o.switchLink = h.move.link||null;
      }
      return o;
    }),
    checkpoints: checkpoints.slice().sort((a,b)=>a.c-b.c).map(cp=>({x:cp.c*TILE+TILE/2, y:cp.r*TILE+TILE})),
    coins: coins.map(co=>({x:co.c*TILE+TILE/2, y:co.r*TILE+TILE/2, color:co.color||'gold'})),
    spikes: spikes.map(sp=>({x:sp.c*TILE+TILE/2, y:sp.r*TILE+TILE, w:TILE, h:TILE, dir:sp.dir||0})),
    switches: switches.map(s=>({x:s.c*TILE+TILE/2, y:s.r*TILE+TILE/2, link:s.link})),
    doors: doors.map(d=>({x:d.c*TILE+TILE/2, y:d.r*TILE+TILE/2, link:d.link})),
    startM: startM ? {x:startM.c*TILE+TILE/2, y:startM.r*TILE+TILE} : null,
    startF: startF ? {x:startF.c*TILE+TILE/2, y:startF.r*TILE+TILE} : null,
    goal: goal ? {x:goal.c*TILE+TILE/2, y:goal.r*TILE+TILE} : null,
    plates: plates.map(p=>({x:p.c*TILE+TILE/2, y:p.r*TILE+TILE/2, link:p.link})),
    bouncers: bouncers.map(b=>({x:b.c*TILE+TILE/2, y:b.r*TILE+TILE})),
    winds: mergeRects(byType.wind),
    theme,
  };
  return JSON.stringify(out, null, 2);
}

// „▶ Testen“: aktuelles Level im Browser ablegen und das Spiel damit öffnen (16-menue.js: startEditorTest).
// Der Arbeitsstand ist ohnehin schon im Browser gesichert; „Zurück zum Editor“ im Pausenmenü führt hierher zurück.
// Startplatz für den Test: dort, wo man gerade baut (sichtbarer Ausschnitt, etwa 1/3 von links).
// Gesucht wird ein freies Kästchen direkt über festem Boden/Wand – nicht auf Bröckelboden, bewegten Teilen
// oder Stacheln. Bei mehreren Ebenen die unterste. Spielerin 2 möglichst ein Kästchen links daneben.
function testSpot(){
  const k = cvs.width / cvs.getBoundingClientRect().width;            // Bildschirm-px -> Editor-px
  const c0 = Math.floor(wrap.scrollLeft * k / TILE);
  const c1 = Math.ceil((wrap.scrollLeft + wrap.clientWidth) * k / TILE);
  if(c0 <= 2) return null;                                              // ganz links: normaler Start
  const target = c0 + Math.round((c1 - c0) / 3);
  const solidAt = (c, r)=>{ const t = tiles[c+','+r]; return (t==='ground' || t==='wall' || t==='platform') && !moverForCell(c, r); };
  const spikeAt = (c, r)=> spikes.some(sp=> sp.c===c && sp.r===r);
  const standable = (c, r)=> r > -SKY && !tiles[c+','+r] && !spikeAt(c, r) && solidAt(c, r+1);
  const cols = [];
  for(let c = c0; c <= c1; c++) cols.push(c);
  cols.sort((a, b)=> Math.abs(a - target) - Math.abs(b - target));
  for(const c of cols){
    for(let r = ROWS - 2; r > -SKY; r--){
      if(!standable(c, r)) continue;
      const cF = standable(c - 1, r) ? c - 1 : standable(c + 1, r) ? c + 1 : c;
      return {m: {c, r}, f: {c: cF, r}};
    }
  }
  return null;
}
// Rückkehr aus dem Test (index.html -> editor/index.html?from=test): dorthin scrollen, wo die Figuren zuletzt
// standen (so, dass „Testen“ wieder genau dort startet: Figuren bei 1/3 der Ansicht); sonst an die alte Stelle
if(/[?&]from=test\b/.test(location.search)){
  let px = NaN, focus = NaN;
  try{ px = Number(localStorage.getItem('monchichi_editor_scroll')); }catch(e){}
  try{ focus = Number(localStorage.getItem('monchichi_editor_focus') ?? NaN); localStorage.removeItem('monchichi_editor_focus'); }catch(e){}
  requestAnimationFrame(()=>{
    const k = cvs.width / cvs.getBoundingClientRect().width;   // Editor-px pro Bildschirm-px
    if(focus > 0) wrap.scrollLeft = Math.max(0, (focus - wrap.clientWidth * k / 3) / k);
    else if(px > 0) wrap.scrollLeft = px / k;
  });
  try{ history.replaceState(null, '', location.pathname); }catch(e){}
}
document.getElementById('testBtn').addEventListener('click', ()=>{
  const data = JSON.parse(exportLevel());
  const spot = testSpot();
  if(spot){
    data.startM = {x: spot.m.c*TILE + TILE/2, y: spot.m.r*TILE + TILE};
    data.startF = {x: spot.f.c*TILE + TILE/2, y: spot.f.r*TILE + TILE};
    data.testStart = true;
  }
  // Stelle merken (in Editor-Pixeln, unabhängig von der Fenstergröße), damit es nach dem Test dort weitergeht
  try{ localStorage.setItem('monchichi_editor_scroll', String(wrap.scrollLeft * cvs.width / cvs.getBoundingClientRect().width)); }catch(e){}
  try{ localStorage.setItem('monchichi_test_level', JSON.stringify(data)); }
  catch(e){ flash('Testen geht nicht: Browser-Speicher voll/gesperrt'); return; }
  location.href = '../index.html?test=1';
});
document.getElementById('exportBtn').addEventListener('click', ()=>{
  document.getElementById('exportText').value = exportLevel();
  document.getElementById('exportBox').classList.add('show');
});
document.getElementById('closeExport').addEventListener('click', ()=>{
  document.getElementById('exportBox').classList.remove('show');
});
let downloads = null;
const dlBtn = document.getElementById('downloadBtn');
dlBtn.addEventListener('click', async ()=>{
  if(!downloads) return;
  const base = (currentLevelName ? slug(currentLevelName) : 'monchichi-level');
  try{
    await downloads.save({filename: base+'.json', data: new Blob([exportLevel()], {type:'application/json'})});
  }catch(e){
    if(e && (e.code==='unavailable'||e.code==='not_granted'||e.code==='capability_disabled')) dlBtn.style.display='none';
  }
});
if(window.claude && typeof window.claude.use==='function'){
  window.claude.use('downloads').then(x=>{ downloads=x; if(x) dlBtn.style.display=''; }).catch(()=>{});
} else {
  // außerhalb der Artifact-Umgebung (GitHub Pages, lokal): ganz normaler Browser-Download
  dlBtn.style.display = '';
  downloads = { save: async ({filename, data}) => {
    const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], {type:'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url), 1000);
  }};
}
// „Ins Projekt aufnehmen“: zwei Dateien herunterladen – Spiel-Format (gehört nach levels/)
// und Editor-Format (gehört nach levels/editor-format/, dort ohne „.editor“ im Namen)
document.getElementById('projectBtn').addEventListener('click', async ()=>{
  if(!downloads){ setStatus('Herunterladen ist hier nicht möglich.', true); return; }
  const base = (currentLevelName ? slug(currentLevelName) : 'monchichi-level');
  const editorData = JSON.stringify({name: currentLevelName || 'Unbenanntes Level', ...snapshot()});
  try{
    await downloads.save({filename: base+'.json', data: new Blob([exportLevel()], {type:'application/json'})});
    await downloads.save({filename: base+'.editor.json', data: new Blob([editorData], {type:'application/json'})});
    setStatus(`Heruntergeladen: ${base}.json (Spiel-Format → levels/) und ${base}.editor.json (Editor-Format → levels/editor-format/ als ${base}.json).`);
  }catch(e){ setStatus('Herunterladen fehlgeschlagen.', true); }
});

document.getElementById('copyBtn').addEventListener('click', ()=>{
  const ta = document.getElementById('exportText');
  ta.select();
  try{ document.execCommand('copy'); }catch(e){}
  if(navigator.clipboard) navigator.clipboard.writeText(ta.value).catch(()=>{});
});
