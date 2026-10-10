// editor/js/02-werkzeuge.js – Teil des Level-Editors für "Monchichi Koop".
// Alle editor/js/*.js teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags, kein Build)
// und werden in editor/index.html in fester Reihenfolge geladen.
// Werkzeuge: Klicks/Ziehen aufs Raster, Radieren, Bewegungen setzen und nachbearbeiten, Bestätigen am Knopf.

// Werkzeug-Knöpfe der Elemente aus dem Register (elemente/) in ihre Gruppe einsortieren
for(const E of ELEMENTE){
  const ed = E.editor; if(!ed) continue;
  const box = document.querySelector(`.tgroup[data-group="${ed.gruppe}"] .tgb`) || document.getElementById('toolGroups');
  const b = document.createElement('div'); b.className = 'tool'; b.dataset.tool = ed.werkzeug; b.title = ed.titel || E.name;
  const sw = document.createElement('span'); sw.className = 'swatch'; sw.style.background = ed.farbe; b.append(sw, ed.label || E.name);
  // vor: Werkzeug-Name, oder '#id' = vor das Feld mit dieser id (z. B. „Verknüpfung“)
  const vor = !ed.vor ? null : ed.vor[0] === '#' ? (box.querySelector(ed.vor) || {}).closest && box.querySelector(ed.vor).closest('label') : box.querySelector(`.tool[data-tool="${ed.vor}"]`);
  box.insertBefore(b, vor || null);
  // eigene Einstellungen des Elements (Ausbau 4, z. B. Wechselboden: Gruppe A/B und Takt) direkt hinter dem Knopf
  for(const o of (ed.optionen || [])){
    const lab = document.createElement('label'); lab.title = o.titel || '';
    lab.style.cssText = 'font-size:12.5px; color:var(--sub); display:flex; align-items:center; gap:5px;';
    const sel = document.createElement('select'); sel.id = `opt-${ed.werkzeug}-${o.key}`;
    sel.style.cssText = 'background:var(--panel2); color:var(--text); border:1px solid var(--border); border-radius:6px; padding:3px 6px; font-size:12.5px;';
    for(const [wert, text] of o.werte){ const op = document.createElement('option'); op.value = wert; op.textContent = text; sel.appendChild(op); }
    lab.append(o.label, sel); box.insertBefore(lab, vor || null);
  }
}
// aktuell gewählte Einstellungen eines Elements (siehe optionen im Register)
function elementOptionen(E){
  const out = {};
  for(const o of (E.editor.optionen || [])){ const v = document.getElementById(`opt-${E.editor.werkzeug}-${o.key}`).value; out[o.key] = o.zahl ? Number(v) : v; }
  return out;
}
document.querySelectorAll('.tool').forEach(el=>{
  el.addEventListener('click', ()=>{
    document.querySelectorAll('.tool').forEach(x=>x.classList.remove('active'));
    el.classList.add('active');
    currentTool = el.dataset.tool;
    if(currentTool !== 'move') selectMove(null);
  });
});

// Werkzeug-Gruppen ein-/ausklappen (Ausbau 2): Klick auf den Gruppen-Namen; Zustand bleibt im Browser gemerkt
const GROUPS_KEY = 'monchichi_editor_groups';
let closedGroups = {};
try{ closedGroups = JSON.parse(localStorage.getItem(GROUPS_KEY) || '{}') || {}; }catch(e){}
document.querySelectorAll('.tgroup').forEach(g=>{
  g.classList.toggle('zu', !!closedGroups[g.dataset.group]);
  g.querySelector('.tgh').addEventListener('click', ()=>{
    const zu = !g.classList.contains('zu');
    g.classList.toggle('zu', zu); closedGroups[g.dataset.group] = zu;
    try{ localStorage.setItem(GROUPS_KEY, JSON.stringify(closedGroups)); }catch(e){}
    requestAnimationFrame(fitView);   // Kopfzeile ändert ihre Höhe -> Raster neu einpassen
  });
});

function cellFromEvent(e){
  const rect = cvs.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (cvs.width/rect.width);
  const py = (e.clientY - rect.top) * (cvs.height/rect.height);
  return {c: Math.floor(px/TILE), r: Math.floor(py/TILE) - SKY};   // Reihe 0 = alte Oberkante, darüber Himmel (negativ)
}

// Zusammenhängendes Stück gleicher Sorte (4er-Nachbarschaft)
function groupAt(c,r){
  const type = tiles[c+','+r]; if(!type) return null;
  const seen = new Set([c+','+r]); const stack=[[c,r]]; const cells=[];
  while(stack.length){
    const [x,y]=stack.pop(); cells.push([x,y]);
    for(const [nx,ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){
      const k=nx+','+ny;
      if(!seen.has(k) && tiles[k]===type){ seen.add(k); stack.push([nx,ny]); }
    }
  }
  return {type, cells, keys:seen};
}
// Aktive Bewegungen: jedes Stück höchstens einmal, verwaiste Pfeile fallen weg
function moverGroups(){
  const used = new Set(); const out=[];
  for(const mv of movers){
    const g = groupAt(mv.c,mv.r);
    if(!g) continue;
    const k0 = mv.c+','+mv.r;
    if(used.has(k0)) continue;
    g.keys.forEach(k=>used.add(k));
    out.push({mv, g});
  }
  return out;
}
function moverForCell(c,r){
  for(const x of moverGroups()) if(x.g.keys.has(c+','+r)) return x;
  return null;
}

function eraseAt(c,r){
  // Ist das Kästchen der Anker eines Pfeils, Anker auf ein anderes Kästchen des Stücks verlegen
  for(const mv of movers){
    if(mv.c===c && mv.r===r){
      const g = groupAt(c,r);
      const other = g && g.cells.find(([x,y])=>!(x===c&&y===r));
      if(other){ mv.c=other[0]; mv.r=other[1]; } else mv.dead=true;
    }
  }
  movers = movers.filter(m=>!m.dead);
  delete tiles[c+','+r];
  hooks = hooks.filter(h=>!(h.c===c&&h.r===r));
  spikes = spikes.filter(h=>!(h.c===c&&h.r===r));
  coins = coins.filter(h=>!(h.c===c&&h.r===r));
  checkpoints = checkpoints.filter(h=>!(h.c===c&&h.r===r));
  for(const k in elementPunkte) elementPunkte[k] = elementPunkte[k].filter(h=>!(h.c===c&&h.r===r));
  if(startM && startM.c===c && startM.r===r) startM=null;
  if(startF && startF.c===c && startF.r===r) startF=null;
  if(goal && goal.c===c && goal.r===r) goal=null;
}

function applyTool(c,r,forceErase){
  if(c<0||r<-SKY||c>=COLS||r>=ROWS) return;
  const key = c+','+r;
  const tool = forceErase ? 'erase' : currentTool;
  if(tool==='erase'){ eraseAt(c,r); save(); return; }
  ensureRoom(c);
  if(tool==='hook'){
    const ex = hooks.find(h=>h.c===c&&h.r===r);
    if(ex) ex.radius = curRadius(); else hooks.push({c,r,radius:curRadius()});
  } else if(tool==='checkpoint'){
    if(!checkpoints.some(h=>h.c===c&&h.r===r)) checkpoints.push({c,r});
  } else if(tool==='coin'){
    const ex = coins.find(h=>h.c===c&&h.r===r);
    const order = ['blue','pink','gold'];
    if(ex){ if(clickNotDrag) ex.color = order[(order.indexOf(ex.color||'gold')+1) % 3]; }   // Klick = Farbe wechseln
    else coins.push({c, r, color: document.getElementById('coinColor').value});
  } else if(tool==='spike'){
    delete tiles[key];
    const ex = spikes.find(h=>h.c===c&&h.r===r);
    if(ex){ if(clickNotDrag) ex.dir = ((ex.dir||0) + 1) % 4; }   // Klick auf vorhandene Stacheln = drehen
    else spikes.push({c, r, dir:Number(document.getElementById('spikeDir').value)});
  } else if(elementNachWerkzeug(tool) && elementNachWerkzeug(tool).editor.art === 'punkt'){   // Hebel, Tür, Druckplatte, Sprungpilz … (elemente/)
    const E = elementNachWerkzeug(tool), L = elementPunkte[E.feld], ex = L.find(d=>d.c===c&&d.r===r);
    if(ex){ if(clickNotDrag && E.editor.klick) E.editor.klick(ex); }   // Klick auf vorhandenen Punkt (z. B. Wechselboden A/B tauschen)
    else {
      let p = E.editor.mitNummer ? {c, r, link: Number(linkSelect.value)} : {c,r};   // Hebel/Tür/Druckplatte: mit Nummer
      Object.assign(p, elementOptionen(E));
      if(E.editor.neu) p = E.editor.neu(p, L);   // z. B. Teleporter: Paar-Nummer
      L.push(p);
    }
  }
  else if(tool==='startM'){ startM = {c,r}; }
  else if(tool==='startF'){ startF = {c,r}; }
  else if(tool==='goal'){ goal = {c,r}; }
  else { tiles[key] = tool; spikes = spikes.filter(h=>!(h.c===c&&h.r===r)); }
  save();
}

const DRAG_TOOLS = ['ground','wall','platform','crumble','spike','coin','erase','fake',
  ...ELEMENTE.filter(E => E.editor && E.editor.ziehbar).map(E => E.editor.werkzeug)];   // + z. B. Aufwind
cvs.addEventListener('contextmenu', e=> e.preventDefault());
cvs.addEventListener('mousedown', e=>{
  if(e.button!==0 && e.button!==2) return;
  e.preventDefault();
  painting = true;
  eraseDrag = (e.button===2);
  const {c,r} = cellFromEvent(e);
  if(!eraseDrag && currentTool==='select'){ painting=false; selMouseDown(c,r); return; }   // Rechteck-Auswahl (08-auswahl.js)
  if(!eraseDrag && currentTool==='move'){
    painting=false;
    const hk = hooks.find(h=>h.c===c&&h.r===r);
    if(hk) moveDrag = {c,r,tc:c,tr:r,hook:hk};
    else if(SOLID_TILES.includes(tiles[c+','+r])) moveDrag = {c,r,tc:c,tr:r};
    else { selectMove(null); flash('Bewegung: auf einen Haken oder ein Boden-/Wand-Kästchen klicken und zum Ziel ziehen'); }
    return;
  }
  clickNotDrag = true;
  applyTool(c,r,eraseDrag);
  clickNotDrag = false;
});
function finishMoveDrag(){
  if(!moveDrag) return;
  const {c,r,tc,tr,hook} = moveDrag; moveDrag=null;
  if(hook){
    // Bewegter Haken: Bewegung hängt direkt am Haken
    if(tc===c && tr===r){   // nur geklickt: Bewegung zum Bearbeiten auswählen
      if(hook.move) selectMove({hook}); else { selectMove(null); flash('Dieser Haken bewegt sich noch nicht – zum Ziel ziehen'); }
      return;
    }
    hook.move = {dc:tc-c, dr:tr-r, speed:Number(speedSelect.value), link:curMoveLink()};
    ensureRoom(tc); save(); selectMove({hook}); return;
  }
  const existing = moverForCell(c,r);
  if(tc===c && tr===r){
    if(existing) selectMove({mv: existing.mv});
    else { selectMove(null); flash('Dieses Stück bewegt sich noch nicht – zum Ziel ziehen'); }
    return;
  }
  if(existing) movers = movers.filter(m=>m!==existing.mv);
  const mv = {c, r, dc:tc-c, dr:tr-r, speed:Number(speedSelect.value), link:curMoveLink()};
  movers.push(mv);
  ensureRoom(tc); save(); selectMove({mv});
}
// ---------- Bewegung nachträglich bearbeiten ----------
// Auswahl per Klick (Werkzeug „Bewegung“); dann zeigen Tempo/„per Schalter“ deren Werte, Änderungen gelten sofort.
// Entfernen per Knopf „✕ Bewegung entfernen“ oder Entf/Backspace; Esc oder Klick ins Leere hebt die Auswahl auf.
const moveDelBtn = document.getElementById('moveDelBtn');
function selData(){ return !selMove ? null : selMove.hook ? selMove.hook.move : selMove.mv; }
function selectMove(sel){
  selMove = sel;
  const d = selData();
  if(!d){ selMove = null; moveDelBtn.style.display = 'none'; return; }
  const sp = String(d.speed || 4.5);
  if([...speedSelect.options].some(o=>o.value===sp)) speedSelect.value = sp;
  moveSwitchSelect.value = d.link ? String(d.link) : '';
  moveDelBtn.style.display = '';
  flash('Bewegung ausgewählt – Tempo/Schalter oben ändern, ziehen = neues Ziel, Entf = entfernen');
}
function deleteSelMove(){
  if(!selMove) return;
  if(selMove.hook) delete selMove.hook.move; else movers = movers.filter(m=>m!==selMove.mv);
  selectMove(null); save(); flash('Bewegung entfernt');
}
speedSelect.addEventListener('change', ()=>{ const d = selData(); if(d){ d.speed = Number(speedSelect.value); save(); } });
moveSwitchSelect.addEventListener('change', ()=>{ const d = selData(); if(d){ d.link = curMoveLink(); save(); } });
moveDelBtn.addEventListener('click', deleteSelMove);
window.addEventListener('mouseup', ()=>{ painting=false; eraseDrag=false; finishMoveDrag(); });
let flashT=0, flashMsg='';
function flash(m){ flashMsg=m; flashT=performance.now(); document.getElementById('coordLabel').textContent=m; }
cvs.addEventListener('mousemove', e=>{
  const {c,r} = cellFromEvent(e);
  if(moveDrag){ moveDrag.tc=Math.max(0,c); moveDrag.tr=Math.max(-SKY,Math.min(ROWS-1,r)); ensureRoom(moveDrag.tc); }
  if(selDrag) selMouseMove(c,r);
  if(performance.now()-flashT > 2500)
    document.getElementById('coordLabel').textContent = moveDrag
      ? `Bewegung: ${moveDrag.tc-moveDrag.c} Kästchen seitlich, ${moveDrag.tr-moveDrag.r} Kästchen hoch/runter`
      : `Spalte ${c}, Reihe ${r}  (x=${c*TILE}, y=${r*TILE})`;
  if(painting && (eraseDrag || DRAG_TOOLS.includes(currentTool))) applyTool(c,r,eraseDrag);
});
// Mausrad scrollt seitlich (vertikal passt das Level meist aufs Bild)
wrap.addEventListener('wheel', e=>{
  if(e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  if(wrap.scrollHeight <= wrap.clientHeight + 1){
    wrap.scrollLeft += e.deltaY; e.preventDefault();
  }
}, {passive:false});
// Touch support
cvs.addEventListener('touchstart', e=>{ e.preventDefault(); const t=e.touches[0]; const {c,r}=cellFromEvent(t);
  if(currentTool==='move'){ const hk=hooks.find(h=>h.c===c&&h.r===r);
    if(hk) moveDrag={c,r,tc:c,tr:r,hook:hk}; else if(tiles[c+','+r]) moveDrag={c,r,tc:c,tr:r}; return; }
  painting=true; applyTool(c,r); }, {passive:false});
cvs.addEventListener('touchmove', e=>{ e.preventDefault(); const t=e.touches[0]; const {c,r}=cellFromEvent(t);
  if(moveDrag){ moveDrag.tc=Math.max(0,c); moveDrag.tr=Math.max(-SKY,Math.min(ROWS-1,r)); ensureRoom(moveDrag.tc); return; }
  if(DRAG_TOOLS.includes(currentTool)) applyTool(c,r); }, {passive:false});
cvs.addEventListener('touchend', ()=>{ painting=false; finishMoveDrag(); });

document.getElementById('extendBtn').addEventListener('click', ()=>{
  setCols(COLS + 20); save();
  wrap.scrollTo({left: cvs.width, behavior:'smooth'});
});

// Bestätigung direkt am Button (1. Klick: "Wirklich …?", 2. Klick innerhalb 3 s: ausführen).
// Browser-Fenster wie confirm() sind in der veröffentlichten Artifact-Seite blockiert und
// liefern dort still "Nein" – deshalb haben Löschen & Co. vorher nichts getan.
function armConfirm(btn, label, action){
  if(btn.dataset.armed === '1'){
    clearTimeout(btn._armT); btn.dataset.armed = ''; btn.classList.remove('armed');
    btn.textContent = btn.dataset.orig; action(); return;
  }
  btn.dataset.orig = btn.textContent; btn.dataset.armed = '1';
  btn.textContent = label; btn.classList.add('armed');
  btn._armT = setTimeout(()=>{ btn.dataset.armed=''; btn.classList.remove('armed'); btn.textContent = btn.dataset.orig; }, 3000);
}
document.getElementById('clearBtn').addEventListener('click', e=>{
  armConfirm(e.currentTarget, 'Wirklich alles löschen?', ()=>{
    clearLevelContent();   // wirklich alles, auch Druckplatten und Sprungpilze (früher blieben die stehen)
    setCols(MIN_COLS); save();
  });
});
