// editor.js – Level-Editor für "Monchichi Koop".
// Speichert Levels in der Artifact-Datenbank, falls vorhanden, sonst im Browser (localStorage).
(function(){
  const TILE = 40;
  const MIN_COLS = 60, ROWS = 18;
  const EDGE_MARGIN = 15;   // so viele leere Spalten bleiben rechts immer frei
  let COLS = MIN_COLS;
  const cvs = document.getElementById('c');
  const ctx = cvs.getContext('2d');
  const wrap = document.getElementById('canvasWrap');

  const COLORS = {
    ground:'#8a6a3a', wall:'#7a8890', platform:'#8ea86a', crumble:'#c77b3f',
  };

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
  const radiusInput = document.getElementById('radiusInput');
  function curRadius(){ const v=Number(radiusInput.value); return v>0 ? v : 6.5; }
  let movers = [];             // [{c,r,dc,dr,speed}] Anker-Kästchen + Verschiebung
  let moveDrag = null;         // {c,r,tc,tr} während Pfeil gezogen wird
  const speedSelect = document.getElementById('speedSelect');
  const moveSwitchSelect = document.getElementById('moveSwitchSelect');
  function curMoveLink(){ return moveSwitchSelect.value ? Number(moveSwitchSelect.value) : null; }

  const linkSelect = document.getElementById('linkSelect');

  function maxUsedCol(){
    let m = -1;
    for(const k in tiles){ const c = +k.split(',')[0]; if(c>m) m=c; }
    for(const p of [...hooks, ...switches, ...doors, ...spikes, ...coins, ...checkpoints, startM, startF, goal]) if(p && p.c>m) m=p.c;
    for(const mv of movers) if(mv.c+mv.dc>m) m=mv.c+mv.dc;
    for(const h of hooks) if(h.move && h.c+h.move.dc>m) m=h.c+h.move.dc;
    return m;
  }
  function setCols(n){
    n = Math.max(MIN_COLS, n);
    if(n === COLS && cvs.width === COLS*TILE) return;
    COLS = n;
    cvs.width = COLS*TILE; cvs.height = ROWS*TILE;
    document.getElementById('lenLabel').textContent = COLS + ' Spalten';
  }
  function ensureRoom(c){ if(c + EDGE_MARGIN > COLS) setCols(c + EDGE_MARGIN); }
  function fitCols(extra){ setCols(Math.max(extra||0, maxUsedCol() + 1 + EDGE_MARGIN)); }

  // ---------- Zustand ----------
  function snapshot(){
    return {
      cols: COLS,
      tiles: Object.keys(tiles).map(k=>{ const [c,r]=k.split(',').map(Number); return [c,r,tiles[k]]; }),
      hooks, switches, doors, spikes, coins, checkpoints, startM, startF, goal, movers
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
    fitCols(d.cols);
  }

  // Arbeitsstand (Entwurf) lokal im Browser
  const STORAGE_KEY = 'monchichi_level_editor_v2';
  let dirty = false;
  function save(){
    dirty = true;
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify({...snapshot(), currentLevelId, currentLevelName}));
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
        return;
      }
    }catch(e){}
    setCols(MIN_COLS);
  }
  load();

  function updateName(){
    document.getElementById('curName').textContent =
      (currentLevelName || 'Unbenanntes Level') + (dirty && currentLevelName ? ' •' : '');
  }
  updateName();

  document.querySelectorAll('.tool').forEach(el=>{
    el.addEventListener('click', ()=>{
      document.querySelectorAll('.tool').forEach(x=>x.classList.remove('active'));
      el.classList.add('active');
      currentTool = el.dataset.tool;
    });
  });

  function cellFromEvent(e){
    const rect = cvs.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (cvs.width/rect.width);
    const py = (e.clientY - rect.top) * (cvs.height/rect.height);
    return {c: Math.floor(px/TILE), r: Math.floor(py/TILE)};
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
    switches = switches.filter(s=>!(s.c===c&&s.r===r));
    doors = doors.filter(d=>!(d.c===c&&d.r===r));
    if(startM && startM.c===c && startM.r===r) startM=null;
    if(startF && startF.c===c && startF.r===r) startF=null;
    if(goal && goal.c===c && goal.r===r) goal=null;
  }

  function applyTool(c,r,forceErase){
    if(c<0||r<0||c>=COLS||r>=ROWS) return;
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
    } else if(tool==='switch'){
      const link = Number(linkSelect.value);
      if(!switches.some(s=>s.c===c&&s.r===r)) switches.push({c,r,link});
    } else if(tool==='door'){
      const link = Number(linkSelect.value);
      if(!doors.some(d=>d.c===c&&d.r===r)) doors.push({c,r,link});
    }
    else if(tool==='startM'){ startM = {c,r}; }
    else if(tool==='startF'){ startF = {c,r}; }
    else if(tool==='goal'){ goal = {c,r}; }
    else { tiles[key] = tool; spikes = spikes.filter(h=>!(h.c===c&&h.r===r)); }
    save();
  }

  const DRAG_TOOLS = ['ground','wall','platform','crumble','spike','coin','erase'];
  cvs.addEventListener('contextmenu', e=> e.preventDefault());
  cvs.addEventListener('mousedown', e=>{
    if(e.button!==0 && e.button!==2) return;
    e.preventDefault();
    painting = true;
    eraseDrag = (e.button===2);
    const {c,r} = cellFromEvent(e);
    if(!eraseDrag && currentTool==='move'){
      painting=false;
      const hk = hooks.find(h=>h.c===c&&h.r===r);
      if(hk) moveDrag = {c,r,tc:c,tr:r,hook:hk};
      else if(tiles[c+','+r]) moveDrag = {c,r,tc:c,tr:r};
      else flash('Bewegung: auf einen Haken oder ein Boden-/Wand-Kästchen klicken und zum Ziel ziehen');
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
      if(tc===c && tr===r){ if(hook.move){ delete hook.move; save(); flash('Haken-Bewegung entfernt'); } return; }
      hook.move = {dc:tc-c, dr:tr-r, speed:Number(speedSelect.value), link:curMoveLink()};
      ensureRoom(tc); save(); return;
    }
    const existing = moverForCell(c,r);
    if(tc===c && tr===r){
      if(existing){ movers = movers.filter(m=>m!==existing.mv); save(); flash('Pfeil entfernt'); }
      return;
    }
    if(existing) movers = movers.filter(m=>m!==existing.mv);
    movers.push({c, r, dc:tc-c, dr:tr-r, speed:Number(speedSelect.value), link:curMoveLink()});
    ensureRoom(tc); save();
  }
  window.addEventListener('mouseup', ()=>{ painting=false; eraseDrag=false; finishMoveDrag(); });
  let flashT=0, flashMsg='';
  function flash(m){ flashMsg=m; flashT=performance.now(); document.getElementById('coordLabel').textContent=m; }
  cvs.addEventListener('mousemove', e=>{
    const {c,r} = cellFromEvent(e);
    if(moveDrag){ moveDrag.tc=Math.max(0,c); moveDrag.tr=Math.max(0,Math.min(ROWS-1,r)); ensureRoom(moveDrag.tc); }
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
    if(moveDrag){ moveDrag.tc=Math.max(0,c); moveDrag.tr=Math.max(0,Math.min(ROWS-1,r)); ensureRoom(moveDrag.tc); return; }
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
      tiles={}; hooks=[]; switches=[]; doors=[]; startM=null; startF=null; goal=null; movers=[]; spikes=[]; coins=[]; checkpoints=[];
      setCols(MIN_COLS); save();
    });
  });

  // ---------- Levels speichern / laden ----------
  const levelBox = document.getElementById('levelBox');
  const levelList = document.getElementById('levelList');
  const statusEl = document.getElementById('status');
  const nameInput = document.getElementById('levelName');
  let db = null, levelsCache = [];
  const LOCAL_LEVELS = 'monchichi_saved_levels_v1';

  function setStatus(t, err){ statusEl.textContent = t||''; statusEl.style.color = err ? '#ff8a80' : 'var(--sub)'; }
  function slug(n){
    return (n.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g,'').trim().replace(/[\s_]+/g,'-').replace(/-+/g,'-').slice(0,60)) || ('level-'+Date.now());
  }
  function localLevels(){ try{ return JSON.parse(localStorage.getItem(LOCAL_LEVELS)||'{}'); }catch(e){ return {}; } }
  function writeLocalLevels(o){ try{ localStorage.setItem(LOCAL_LEVELS, JSON.stringify(o)); }catch(e){} }

  function renderList(){
    levelList.innerHTML = '';
    if(!levelsCache.length){
      const d=document.createElement('div'); d.className='hint'; d.textContent='Noch keine Levels gespeichert.';
      levelList.appendChild(d); return;
    }
    for(const L of levelsCache){
      const row=document.createElement('div'); row.className='lvl'+(L.id===currentLevelId?' cur':'');
      const nm=document.createElement('span'); nm.className='nm'; nm.textContent=L.name;
      const dt=document.createElement('span'); dt.className='dt';
      dt.textContent = L.updatedAt ? new Date(L.updatedAt).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '';
      const ld=document.createElement('button'); ld.className='mini'; ld.textContent='Laden';
      const doLoad = ()=>{
        applySnapshot(L.data||{}); currentLevelId=L.id; currentLevelName=L.name;
        save(); dirty=false; updateName(); wrap.scrollLeft=0; closeLevels();
      };
      ld.onclick=()=>{
        if(dirty && L.id!==currentLevelId) armConfirm(ld, 'Ungespeichertes geht verloren – laden?', doLoad);
        else doLoad();
      };
      const del=document.createElement('button'); del.className='mini del'; del.textContent='Löschen';
      del.onclick=()=> armConfirm(del, 'Wirklich löschen?', async()=>{
        try{
          if(db) await db.doc('levels/'+L.id).delete();
          else { const o=localLevels(); delete o[L.id]; writeLocalLevels(o); }
          if(L.id===currentLevelId){ currentLevelId=null; currentLevelName=null; updateName(); }
          setStatus(`Gelöscht: „${L.name}“`);
          await refreshList();
        }catch(e){ setStatus('Löschen fehlgeschlagen.', true); }
      });
      row.append(nm, dt, ld, del); levelList.appendChild(row);
    }
  }
  async function refreshList(){
    try{
      if(db){
        const q = await db.collection('levels').orderBy('updatedAt','desc').limit(200).get();
        levelsCache = q.docs.map(d=>({id:d.id, ...d.data()}));
      } else {
        levelsCache = Object.entries(localLevels()).map(([id,v])=>({id,...v})).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
      }
    }catch(e){ setStatus('Liste konnte nicht geladen werden.', true); }
    renderList();
  }
  let pendingOverwrite = null;
  async function saveLevel(name){
    name = (name||'').trim();
    if(!name){ setStatus('Bitte einen Namen eingeben.', true); nameInput.focus(); return false; }
    const id = (name===currentLevelName && currentLevelId) ? currentLevelId : slug(name);
    const existing = levelsCache.find(l=>l.id===id);
    // gibt es den Namen schon (und ist es nicht das aktuelle Level): erst beim zweiten Speichern überschreiben
    if(existing && id!==currentLevelId && pendingOverwrite!==id){
      pendingOverwrite = id;
      setStatus(`„${existing.name}“ gibt es schon – nochmal „Speichern“ klicken zum Überschreiben.`, true);
      return false;
    }
    pendingOverwrite = null;
    const doc = {name, updatedAt: Date.now(), data: snapshot()};
    try{
      if(db) await db.doc('levels/'+id).set(doc);
      else { const o=localLevels(); o[id]=doc; writeLocalLevels(o); }
      currentLevelId=id; currentLevelName=name; dirty=false; save(); dirty=false; updateName();
      setStatus(`Gespeichert: „${name}“`);
      await refreshList();
      return true;
    }catch(e){
      setStatus(e && e.code==='quota_exceeded' ? 'Speicher voll – bitte alte Levels löschen.' : 'Speichern fehlgeschlagen.', true);
      return false;
    }
  }
  // Levels aus dem Projekt (levels/levels.json + levels/editor-format/…) – nur lesen
  const projectList = document.getElementById('projectList');
  const PROJECT_DIR = '../levels/';
  function projectHint(t){
    projectList.innerHTML = '';
    const d=document.createElement('div'); d.className='hint'; d.textContent=t; projectList.appendChild(d);
  }
  async function refreshProjectList(){
    let list;
    try{
      const r = await fetch(PROJECT_DIR+'levels.json', {cache:'no-store'});
      if(!r.ok) throw 0;
      list = await r.json();
    }catch(e){ projectHint('Projekt-Levels hier nicht erreichbar (nur wenn der Editor über die Webseite geöffnet ist).'); return; }
    if(!Array.isArray(list) || !list.length){ projectHint('Keine Levels im Projekt.'); return; }
    projectList.innerHTML = '';
    for(const P of list){
      const row=document.createElement('div'); row.className='lvl';
      const nm=document.createElement('span'); nm.className='nm'; nm.textContent=P.name||P.datei;
      const dt=document.createElement('span'); dt.className='dt'; dt.textContent=P.datei;
      const ld=document.createElement('button'); ld.className='mini'; ld.textContent='Laden';
      const doLoad = async ()=>{
        try{
          const r = await fetch(PROJECT_DIR+'editor-format/'+encodeURIComponent(P.datei), {cache:'no-store'});
          if(!r.ok) throw 0;
          const d = await r.json();
          applySnapshot(d); currentLevelId=null; currentLevelName=P.name||d.name||null;
          save(); dirty=false; updateName(); wrap.scrollLeft=0; closeLevels();
        }catch(e){ setStatus(`„${P.name||P.datei}“ konnte nicht geladen werden.`, true); }
      };
      ld.onclick=()=>{
        if(dirty) armConfirm(ld, 'Ungespeichertes geht verloren – laden?', doLoad);
        else doLoad();
      };
      row.append(nm, dt, ld); projectList.appendChild(row);
    }
  }
  function openLevels(){
    nameInput.value = currentLevelName || '';
    setStatus(db ? '' : 'Levels werden in diesem Browser gespeichert.');
    levelBox.classList.add('show'); refreshList(); refreshProjectList();
  }
  function closeLevels(){ levelBox.classList.remove('show'); }

  document.getElementById('levelsBtn').addEventListener('click', openLevels);
  // ✕ oben rechts: zurück zum Spiel (Hauptmenü); der Arbeitsstand ist schon im Browser gesichert
  document.getElementById('closeEditorBtn').addEventListener('click', ()=>{ location.href = '../index.html'; });
  document.getElementById('closeLevels').addEventListener('click', closeLevels);
  document.getElementById('saveAsBtn').addEventListener('click', ()=> saveLevel(nameInput.value));
  nameInput.addEventListener('keydown', e=>{ if(e.key==='Enter') saveLevel(nameInput.value); });
  document.getElementById('saveBtn').addEventListener('click', async ()=>{
    if(currentLevelName){
      const ok = await saveLevel(currentLevelName);
      const b=document.getElementById('saveBtn');
      if(ok){ b.textContent='✓ Gespeichert'; setTimeout(()=>b.textContent='💾 Speichern',1400); }
      else openLevels();
    } else openLevels();
  });
  document.getElementById('newLevelBtn').addEventListener('click', e=>{
    const doNew = ()=>{
      tiles={}; hooks=[]; switches=[]; doors=[]; startM=null; startF=null; goal=null; movers=[]; spikes=[]; coins=[]; checkpoints=[];
      currentLevelId=null; currentLevelName=null; setCols(MIN_COLS); save(); dirty=false; updateName();
      wrap.scrollLeft=0; closeLevels();
    };
    if(dirty) armConfirm(e.currentTarget, 'Ungespeichertes geht verloren – trotzdem?', doNew); else doNew();
  });
  window.addEventListener('keydown', e=>{
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='s'){ e.preventDefault(); document.getElementById('saveBtn').click(); }
    if(e.key==='Escape') closeLevels();
  });

  if(window.claude && typeof window.claude.use==='function'){
    window.claude.use('db').then(x=>{ db=x; if(levelBox.classList.contains('show')) openLevels(); }).catch(()=>{});
  }

  function draw(){
    ctx.clearRect(0,0,cvs.width,cvs.height);
    // Grid
    ctx.lineWidth = 1; ctx.strokeStyle = '#25323f';
    for(let c=0;c<=COLS;c++){ ctx.beginPath(); ctx.moveTo(c*TILE,0); ctx.lineTo(c*TILE,ROWS*TILE); ctx.stroke(); }
    for(let r=0;r<=ROWS;r++){ ctx.beginPath(); ctx.moveTo(0,r*TILE); ctx.lineTo(COLS*TILE,r*TILE); ctx.stroke(); }
    // stärkere Linie alle 5 Kästchen
    ctx.strokeStyle = '#33465a';
    for(let c=0;c<=COLS;c+=5){ ctx.beginPath(); ctx.moveTo(c*TILE,0); ctx.lineTo(c*TILE,ROWS*TILE); ctx.stroke(); }
    for(let r=0;r<=ROWS;r+=5){ ctx.beginPath(); ctx.moveTo(0,r*TILE); ctx.lineTo(COLS*TILE,r*TILE); ctx.stroke(); }

    for(const key in tiles){
      const [c,r] = key.split(',').map(Number);
      ctx.fillStyle = COLORS[tiles[key]];
      ctx.fillRect(c*TILE+1, r*TILE+1, TILE-2, TILE-2);
    }
    for(const cp of checkpoints){
      const X=cp.c*TILE, Y=cp.r*TILE;
      ctx.fillStyle='#d9d2c5'; ctx.fillRect(X+TILE*0.3, Y+4, 3, TILE-4);
      ctx.fillStyle='#ff7a59'; ctx.beginPath(); ctx.moveTo(X+TILE*0.3+3, Y+5); ctx.lineTo(X+TILE*0.85, Y+12); ctx.lineTo(X+TILE*0.3+3, Y+19); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(255,122,89,.18)'; ctx.fillRect(X+1, Y+1, TILE-2, TILE-2);
    }
    { const el=document.getElementById('cpCount'); if(el) el.textContent = checkpoints.length + ' gesetzt'; }
    const COIN_COL = {gold:['#e0a100','#ffd24a','#fff3b0'], blue:['#1c6fd1','#4dabf7','#d0ebff'], pink:['#d6336c','#f783ac','#ffe3ef']};
    for(const co of coins){
      const X=co.c*TILE+TILE/2, Y=co.r*TILE+TILE/2, col = COIN_COL[co.color||'gold'];
      ctx.fillStyle=col[0]; ctx.beginPath(); ctx.arc(X,Y,TILE*0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=col[1]; ctx.beginPath(); ctx.arc(X,Y,TILE*0.23,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=col[2]; ctx.fillRect(X-2, Y-TILE*0.13, 4, TILE*0.26);
    }
    { const el=document.getElementById('coinCount');
      const nB = coins.filter(c=>c.color==='blue').length, nP = coins.filter(c=>c.color==='pink').length;
      const nG = coins.length - nB - nP, n = coins.length;
      if(el){ el.textContent = n + ' gesetzt' + (n>0 && n<10 ? ' (Ziel braucht dann alle '+n+')' : ''); }
      const bal = document.getElementById('coinBalance');
      if(bal){
        const key = nB+'|'+nP+'|'+nG;
        if(bal.dataset.key !== key){            // nur bei Änderung neu schreiben
          bal.dataset.key = key;
          bal.textContent = '';
          const line1 = document.createElement('div');
          line1.textContent = `🔵 Blau (Affe): ${nB}   🩷 Pink (Schweinchen): ${nP}   🟡 Gold: ${nG}`;
          const line2 = document.createElement('div'); line2.style.fontWeight = '700';
          if(nB === nP){ line2.textContent = nB ? '✓ Blau und Pink sind ausgeglichen' : 'Noch keine blauen/pinken Münzen'; line2.style.color = nB ? '#63e6be' : 'var(--sub)'; }
          else { const d = Math.abs(nB-nP); line2.textContent = `⚠ ${d} ${nB>nP ? 'Blau' : 'Pink'} mehr – nicht ausgeglichen`; line2.style.color = '#ffa94d'; }
          bal.append(line1, line2);
        }
      }
    }
    for(const sp of spikes){
      ctx.save();
      ctx.translate(sp.c*TILE+TILE/2, sp.r*TILE+TILE/2);
      ctx.rotate((sp.dir||0)*Math.PI/2);
      ctx.fillStyle='#b23a3a';
      for(const off of [-0.3,0,0.3]){
        ctx.beginPath(); ctx.moveTo(TILE*(off-0.15),TILE/2-3); ctx.lineTo(TILE*off,-TILE/2+6); ctx.lineTo(TILE*(off+0.15),TILE/2-3); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    for(const h of hooks){
      const rad=(h.radius||6.5)*TILE, hx=h.c*TILE+TILE/2, hy=h.r*TILE+TILE/2;
      ctx.save(); ctx.setLineDash([5,5]); ctx.strokeStyle='rgba(255,209,102,0.45)'; ctx.lineWidth=1.5;
      ctx.fillStyle='rgba(255,209,102,0.05)';
      ctx.beginPath(); ctx.arc(hx,hy,rad,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.fillStyle='rgba(255,209,102,0.9)'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText((h.radius||6.5)+' K', hx, hy+TILE*0.34);
      ctx.fillStyle='#ffd166';
      ctx.beginPath(); ctx.arc(h.c*TILE+TILE/2, h.r*TILE+TILE/2, TILE*0.3, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='#8a6a1a'; ctx.lineWidth=2; ctx.stroke();
    }
    for(const s of switches) drawLinked(s, '#ff9f43', '#8a4f14');
    for(const d of doors) drawLinked(d, '#9b59b6', '#5a2d69');
    if(startM) drawMarker(startM,'#3a7bd5','♂');
    if(startF) drawMarker(startF,'#e0669e','♀');
    if(goal) drawMarker(goal,'#5fc98f','⚑');

    // Bewegte Stücke: Umriss, Geister-Ziel, Pfeil
    const groups = moverGroups();
    if(moveDrag){
      const g = groupAt(moveDrag.c, moveDrag.r);
      if(g){
        const ex = groups.findIndex(x=>x.g.keys.has(moveDrag.c+','+moveDrag.r));
        if(ex>=0) groups.splice(ex,1);
        groups.push({mv:{c:moveDrag.c,r:moveDrag.r,dc:moveDrag.tc-moveDrag.c,dr:moveDrag.tr-moveDrag.r,speed:Number(speedSelect.value), link:curMoveLink()}, g, preview:true});
      }
    }
    for(const {mv,g} of groups){
      // Geist am Zielpunkt
      ctx.globalAlpha = 0.28;
      for(const [x,y] of g.cells){ ctx.fillStyle=COLORS[g.type]; ctx.fillRect((x+mv.dc)*TILE+1,(y+mv.dr)*TILE+1,TILE-2,TILE-2); }
      ctx.globalAlpha = 1;
      // Umriss am Start (gestrichelt)
      ctx.save(); ctx.setLineDash([6,4]); ctx.strokeStyle='#4fc3f7'; ctx.lineWidth=2;
      for(const [x,y] of g.cells){
        const k=(a,b)=>g.keys.has(a+','+b);
        const X=x*TILE, Y=y*TILE;
        ctx.beginPath();
        if(!k(x,y-1)){ ctx.moveTo(X,Y); ctx.lineTo(X+TILE,Y); }
        if(!k(x,y+1)){ ctx.moveTo(X,Y+TILE); ctx.lineTo(X+TILE,Y+TILE); }
        if(!k(x-1,y)){ ctx.moveTo(X,Y); ctx.lineTo(X,Y+TILE); }
        if(!k(x+1,y)){ ctx.moveTo(X+TILE,Y); ctx.lineTo(X+TILE,Y+TILE); }
        ctx.stroke();
      }
      ctx.restore();
      drawMoveArrow(mv);
    }

    // Bewegte Haken: Geister-Haken am Ziel + Pfeil
    const hookMoves = hooks.filter(h=>h.move).map(h=>({h, mv:{c:h.c, r:h.r, ...h.move}}));
    if(moveDrag && moveDrag.hook){
      const i = hookMoves.findIndex(x=>x.h===moveDrag.hook); if(i>=0) hookMoves.splice(i,1);
      hookMoves.push({h:moveDrag.hook, mv:{c:moveDrag.c, r:moveDrag.r, dc:moveDrag.tc-moveDrag.c, dr:moveDrag.tr-moveDrag.r,
        speed:Number(speedSelect.value), link:curMoveLink()}});
    }
    for(const {h, mv} of hookMoves){
      const gx=(mv.c+mv.dc)*TILE+TILE/2, gy=(mv.r+mv.dr)*TILE+TILE/2;
      ctx.globalAlpha=0.35; ctx.fillStyle='#ffd166';
      ctx.beginPath(); ctx.arc(gx,gy,TILE*0.28,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
      ctx.save(); ctx.setLineDash([4,4]); ctx.strokeStyle='#4fc3f7'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(h.c*TILE+TILE/2, h.r*TILE+TILE/2, TILE*0.42, 0, Math.PI*2); ctx.stroke(); ctx.restore();
      if(mv.dc!==0 || mv.dr!==0) drawMoveArrow(mv);
    }

    function drawMoveArrow(mv){
      if(mv.dc===0 && mv.dr===0) return;
      // Pfeil vom Anker zum Ziel
      const x1=mv.c*TILE+TILE/2, y1=mv.r*TILE+TILE/2, x2=(mv.c+mv.dc)*TILE+TILE/2, y2=(mv.r+mv.dr)*TILE+TILE/2;
      const ang=Math.atan2(y2-y1,x2-x1);
      ctx.strokeStyle='#4fc3f7'; ctx.fillStyle='#4fc3f7'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2-Math.cos(ang)*10,y2-Math.sin(ang)*10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x2,y2);
      ctx.lineTo(x2-Math.cos(ang-0.45)*16, y2-Math.sin(ang-0.45)*16);
      ctx.lineTo(x2-Math.cos(ang+0.45)*16, y2-Math.sin(ang+0.45)*16); ctx.closePath(); ctx.fill();
      // Rück-Pfeilspitze am Start (hin und zurück)
      ctx.beginPath(); ctx.moveTo(x1,y1);
      ctx.lineTo(x1+Math.cos(ang-0.45)*14, y1+Math.sin(ang-0.45)*14);
      ctx.lineTo(x1+Math.cos(ang+0.45)*14, y1+Math.sin(ang+0.45)*14); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(x1,y1,5,0,Math.PI*2); ctx.fill();
      const lbl = mv.speed>=4.5?'schnell':mv.speed>=3?'mittel':'langsam';
      ctx.font='bold 11px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
      let txt = '⇄ '+lbl;
      if(mv.link){
        const hasSw = switches.some(sw=>sw.link===mv.link);
        txt += hasSw ? ` · Schalter ${mv.link}` : ` · Schalter ${mv.link} fehlt → fährt immer`;
      }
      ctx.fillStyle = (mv.link && !switches.some(sw=>sw.link===mv.link)) ? '#ffb3a7' : '#e6f7ff';
      ctx.fillText(txt, (x1+x2)/2, (y1+y2)/2-6);
        }

    function drawMarker(p,color,label){
      ctx.fillStyle=color;
      ctx.beginPath(); ctx.arc(p.c*TILE+TILE/2, p.r*TILE+TILE/2, TILE*0.38, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(label, p.c*TILE+TILE/2, p.r*TILE+TILE/2+1);
    }
    function drawLinked(p, color, dark){
      const cx=p.c*TILE+TILE/2, cy=p.r*TILE+TILE/2;
      ctx.fillStyle=color;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx-TILE*0.36,cy-TILE*0.36,TILE*0.72,TILE*0.72,5) : ctx.rect(cx-TILE*0.36,cy-TILE*0.36,TILE*0.72,TILE*0.72);
      ctx.fill();
      ctx.strokeStyle=dark; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle='#fff'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(String(p.link), cx, cy+1);
    }

    requestAnimationFrame(draw);
  }
  draw();

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
    const byType = {ground:[], wall:[], platform:[], crumble:[]};
    for(const key in tiles){
      if(movingKeys.has(key)) continue;
      const [c,r] = key.split(',').map(Number);
      byType[tiles[key]].push({c,r});
    }
    let solids = [];
    for(const type of ['ground','wall','platform','crumble']){
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
    };
    return JSON.stringify(out, null, 2);
  }

  // „▶ Testen“: aktuelles Level im Browser ablegen und das Spiel damit öffnen (16-menue.js: startEditorTest).
  // Der Arbeitsstand ist ohnehin schon im Browser gesichert; „Zurück zum Editor“ im Pausenmenü führt hierher zurück.
  document.getElementById('testBtn').addEventListener('click', ()=>{
    try{ localStorage.setItem('monchichi_test_level', exportLevel()); }
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
})();
