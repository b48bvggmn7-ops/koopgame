// editor/js/05-levelliste.js – Teil des Level-Editors für "Monchichi Koop".
// Alle editor/js/*.js teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags, kein Build)
// und werden in editor/index.html in fester Reihenfolge geladen.
// Fenster „Levels“: eigene Levels speichern/laden/löschen, „Levels im Projekt“, Neues Level.

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
      applySnapshot(L.data||{}); currentLevelId=L.id; currentLevelName=L.name; currentProjectFile=null;
      save(); dirty=false; updateName(); wrap.scrollLeft=0; closeLevels(); histReset();
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
        applySnapshot(d); currentLevelId=null; currentLevelName=P.name||d.name||null; currentProjectFile=P.datei;
        await applyProjectMeta(P.datei);   // Welt/Position aus worlds.json, Titel aus levels.json (07-level-info.js)
        save(); dirty=false; updateName(); wrap.scrollLeft=0; closeLevels(); histReset();
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
    meta = blankMeta(); updateMetaUI();
    currentLevelId=null; currentLevelName=null; currentProjectFile=null; setCols(MIN_COLS); save(); dirty=false; updateName(); histReset();
    wrap.scrollLeft=0; closeLevels();
  };
  if(dirty) armConfirm(e.currentTarget, 'Ungespeichertes geht verloren – trotzdem?', doNew); else doNew();
});

if(window.claude && typeof window.claude.use==='function'){
  window.claude.use('db').then(x=>{ db=x; if(levelBox.classList.contains('show')) openLevels(); }).catch(()=>{});
}
