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
// Editor-Umbau (Teil I): Level liegen in Welt-Ordnern (levels/<welt>/<nr>-<titel>.json) -> im Editor sichtbar als
// „Welt Nummer“, z. B. „Vulkan 3“ (Boss: „Dschungel Boss“); null für Dateien außerhalb der Welt-Ordner
const WELT_ANZEIGE = {dschungel:'Dschungel', ruinen:'Ruinen', hoehle:'Höhle', wasser:'Wasser', vulkan:'Vulkan', archiv:'Archiv'};
function levelAnzeige(datei, P){
  // Dschungel-Neu: Abschnitte (Level aus mehreren Teilen, js/15a-abschnitte.js) und ihre Teile (levels.json: teilVon/teil)
  const ab = /\/abschnitt-(\d+)-/.exec(datei || '');
  if(ab) return `Abschnitt ${Number(ab[1])}`;
  if(P && P.teilVon){ const n = /\/abschnitt-(\d+)-/.exec(P.teilVon); return `Abschnitt ${n ? Number(n[1]) : '?'} · Teil ${P.teil || '?'}`; }
  const m = /^([a-z0-9-]+)\/(?:(\d+)|boss)-/.exec(datei || '');
  if(!m) return null;
  const wn = WELT_ANZEIGE[m[1]] || m[1];
  return m[2] ? `${wn} ${Number(m[2])}` : `${wn} Boss`;
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
  // Level nach Welt-Ordnern gruppiert (aufklappbar), innerhalb eines Ordners nach Dateiname (Nummer, Boss zuletzt)
  const ordner = new Map();
  for(const P of list){
    const w = /^([a-z0-9-]+)\//.exec(P.datei || '');
    const key = w ? w[1] : '';
    if(!ordner.has(key)) ordner.set(key, []);
    ordner.get(key).push(P);
  }
  const reihe = Object.keys(WELT_ANZEIGE);
  const keys = [...ordner.keys()].sort((a,b)=>{
    const ia = reihe.indexOf(a), ib = reihe.indexOf(b);
    return (ia<0 ? 99 : ia) - (ib<0 ? 99 : ib) || a.localeCompare(b);
  });
  const offenWelt = (/^([a-z0-9-]+)\//.exec(currentProjectFile || '') || [])[1];
  for(const key of keys){
    const box=document.createElement('details'); box.className='welt-ordner'; box.dataset.welt=key;
    // Teile stehen direkt unter ihrem Abschnitt (Dschungel-Neu), Bosse zuletzt
    const reihe = P => { const f = (P.teilVon || P.datei || '').split('/').pop(); return [f.startsWith('boss-') ? 1 : 0, f, P.teilVon ? (P.teil || 1) : 0]; };
    const lv = ordner.get(key).sort((a,b)=>{
      const ra = reihe(a), rb = reihe(b);
      return ra[0] - rb[0] || ra[1].localeCompare(rb[1]) || ra[2] - rb[2];
    });
    if(key===offenWelt || keys.length===1) box.open = true;
    const sm=document.createElement('summary');
    sm.textContent = `📁 ${key ? (WELT_ANZEIGE[key] || key) : 'Sonstige'} (${lv.length})`;
    box.appendChild(sm);
    for(const P of lv) box.appendChild(projektZeile(P));
    projectList.appendChild(box);
  }
}
function projektZeile(P){
    const row=document.createElement('div'); row.className='lvl'+(P.datei===currentProjectFile?' cur':'')+(P.teilVon?' teil':'')+(P.abschnitt?' abschnitt':''); row.dataset.datei=P.datei;
    const nm=document.createElement('span'); nm.className='nm'; const anz = levelAnzeige(P.datei, P); nm.textContent = anz ? `${anz} · ${P.titel || P.name || ''}` : (P.name||P.datei);
    const dt=document.createElement('span'); dt.className='dt'; dt.textContent=P.datei;
    const ld=document.createElement('button'); ld.className='mini'; ld.textContent='Laden';
    const doLoad = async ()=>{
      try{
        const r = await fetch(PROJECT_DIR+'editor-format/'+levelPfadUrl(P.datei), {cache:'no-store'});
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
    if(P.abschnitt){   // Abschnitt: hat kein eigenes Gelände – seine Teile (darunter) einzeln laden und bearbeiten
      const hw=document.createElement('span'); hw.className='hw'; hw.textContent='besteht aus den Teilen darunter (im Spiel hintereinander)';
      row.append(nm, dt, hw);
      return row;
    }
    row.append(nm, dt, ld);
    return row;
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
    clearLevelContent();   // wirklich alles, auch Druckplatten und Sprungpilze (früher blieben die stehen)
    meta = blankMeta(); updateMetaUI();
    currentLevelId=null; currentLevelName=null; currentProjectFile=null; setCols(MIN_COLS); save(); dirty=false; updateName(); histReset();
    wrap.scrollLeft=0; closeLevels();
  };
  if(dirty) armConfirm(e.currentTarget, 'Ungespeichertes geht verloren – trotzdem?', doNew); else doNew();
});

if(window.claude && typeof window.claude.use==='function'){
  window.claude.use('db').then(x=>{ db=x; if(levelBox.classList.contains('show')) openLevels(); }).catch(()=>{});
}
