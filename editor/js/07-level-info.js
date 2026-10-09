// editor/js/07-level-info.js – Teil des Level-Editors für "Monchichi Koop".
// Alle editor/js/*.js teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags, kein Build)
// und werden in editor/index.html in fester Reihenfolge geladen.
// Fenster „Level-Info“ (Ausbau 2): Welt (aus levels/worlds.json), Position in der Welt, Titel, Tageszeit, Wetter,
// look-Override (altes Thema). Werte stehen in `meta` (01-zustand.js), gehen in Autosave, Export und GitHub-Speichern.

const WELT_FALLBACK = [
  {id:'dschungel', name:'Dschungel', level:[]}, {id:'ruinen', name:'Ruinen', level:[]}, {id:'hoehle', name:'Höhle', level:[]},
  {id:'wasser', name:'Wasser', level:[]}, {id:'vulkan', name:'Vulkan', level:[]},
];
const TAGESZEIT_NAMEN = {'':'Standard der Welt', morgen:'Morgen', mittag:'Mittag', abend:'Abend', nacht:'Nacht'};
const WETTER_NAMEN = {wechselnd:'Wechselnd (Sonne/Regen)', trocken:'Trocken (nie Regen)', regen:'Regen (dauernd)'};
const LOOK_NAMEN = {'':'– keiner (Welt + Tageszeit) –', dschungel:'🌿 Dschungel (Morgen)', abend:'🌅 Abendrot', ruinen:'🏛️ Tempelruinen',
                    nacht:'🌙 Mondnacht', hoehle:'💎 Kristallhöhle', vulkan:'🌋 Feuerberg'};
let projectWorlds = null, projectLevelList = null;   // levels/worlds.json und levels/levels.json (falls erreichbar)
async function loadProjectInfo(){
  const get = async f => { try{ const r = await fetch(PROJECT_DIR + f, {cache:'no-store'}); return r.ok ? await r.json() : null; }catch(e){ return null; } };
  const [w, l] = await Promise.all([get('worlds.json'), get('levels.json')]);
  if(w && Array.isArray(w.welten)) projectWorlds = w;
  if(Array.isArray(l)) projectLevelList = l;
  updateMetaUI();
}
function worldList(){
  const ws = projectWorlds ? projectWorlds.welten.slice().sort((a, b)=>(a.reihenfolge||0) - (b.reihenfolge||0)) : WELT_FALLBACK;
  return ws.filter(w => w && w.id);
}
// Level der gewählten Welt ohne das gerade bearbeitete (für die Positions-Auswahl)
function worldOthers(weltId){
  const w = worldList().find(x => x.id === weltId);
  return (w && Array.isArray(w.level) ? w.level : []).filter(d => d !== currentProjectFile);
}
const metaBox = document.getElementById('metaBox');
const metaEl = id => document.getElementById(id);
function fillSelect(sel, entries, value){
  sel.innerHTML = '';
  for(const [v, t] of entries){ const o = document.createElement('option'); o.value = v; o.textContent = t; sel.appendChild(o); }
  sel.value = value;
}
function updateMetaUI(){
  if(!metaEl('metaWelt')) return;
  fillSelect(metaEl('metaWelt'), worldList().map(w => [w.id, w.name || w.id]), meta.welt);
  const others = worldOthers(meta.welt);
  const pos = [['0', 'ans Ende (' + (others.length + 1) + '.)']];
  for(let i = 1; i <= others.length + 1; i++) pos.push([String(i), i + '. Level' + (others[i - 1] ? ' (vor ' + others[i - 1] + ')' : '')]);
  fillSelect(metaEl('metaPos'), pos, String(meta.position || 0));
  if(document.activeElement !== metaEl('metaTitel')) metaEl('metaTitel').value = meta.titel || '';
  fillSelect(metaEl('metaZeit'), Object.entries(TAGESZEIT_NAMEN), meta.tageszeit || '');
  fillSelect(metaEl('metaWetter'), Object.entries(WETTER_NAMEN), meta.wetter || 'wechselnd');
  fillSelect(metaEl('metaLook'), Object.entries(LOOK_NAMEN), meta.look || '');
  metaEl('metaZeit').disabled = !!meta.look;   // look-Override bestimmt das ganze Aussehen
  const wn = (worldList().find(w => w.id === meta.welt) || {}).name || meta.welt;
  metaEl('metaBtn').textContent = '🗺 ' + wn + (meta.titel ? ' · ' + meta.titel : '') + (meta.look ? ' · Look: ' + LOOK_NAMEN[meta.look].replace(/^\S+\s/, '') : '');
}
// aus „Levels im Projekt“ geladen: Welt + Position aus worlds.json, Titel aus levels.json übernehmen
async function applyProjectMeta(datei){
  if(!projectWorlds || !projectLevelList) await loadProjectInfo();
  for(const w of worldList()){
    const i = (w.level || []).indexOf(datei);
    if(i >= 0){ meta.welt = w.id; meta.position = i + 1; }
  }
  const L = (projectLevelList || []).find(x => x.datei === datei);
  if(L && L.titel) meta.titel = L.titel;
  updateMetaUI();
}
function openMeta(){ updateMetaUI(); metaBox.classList.add('show'); if(!projectWorlds) loadProjectInfo(); }
function closeMeta(){ metaBox.classList.remove('show'); }
metaEl('metaBtn').addEventListener('click', openMeta);
metaEl('metaClose').addEventListener('click', closeMeta);
const metaChange = (id, key, num) => metaEl(id).addEventListener(id === 'metaTitel' ? 'input' : 'change', ()=>{
  meta[key] = num ? Number(metaEl(id).value) : metaEl(id).value;
  if(key === 'welt') meta.position = 0;   // neue Welt: erst mal ans Ende
  save(); updateMetaUI();
});
metaChange('metaWelt', 'welt'); metaChange('metaPos', 'position', true); metaChange('metaTitel', 'titel');
metaChange('metaZeit', 'tageszeit'); metaChange('metaWetter', 'wetter'); metaChange('metaLook', 'look');
loadProjectInfo();
