// editor/js/09-werkzeugleiste.js – Teil des Level-Editors für "Monchichi Koop" (Editor-Umbau).
// Alle editor/js/*.js teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags, kein Build)
// und werden in editor/index.html in fester Reihenfolge geladen.
// Werkzeugleiste: Reiter (eine Gruppe sichtbar, Wahl gemerkt), „Aktiv: …“, „Zuletzt:“ (letzte 5 Werkzeuge),
// Eigenschaften-Zeile (nur die Optionen des aktiven Werkzeugs), Welt-Voreinstellung + „Alle Werkzeuge“
// (Tabelle in 00-welt-werkzeuge.js), Hilfe in der Seitenleiste ein-/ausklappen.

const TAB_KEY = 'monchichi_editor_tab', ALLE_KEY = 'monchichi_editor_alle', ZULETZT_KEY = 'monchichi_editor_zuletzt';
const ZULETZT_MAX = 5;
let aktiverReiter = 'gelaende', alleWerkzeuge = false, zuletzt = [];
try{
  aktiverReiter = localStorage.getItem(TAB_KEY) || 'gelaende';
  alleWerkzeuge = localStorage.getItem(ALLE_KEY) === '1';
  zuletzt = JSON.parse(localStorage.getItem(ZULETZT_KEY) || '[]') || [];
}catch(e){}
const alleBox = document.getElementById('alleWerkzeuge');
alleBox.checked = alleWerkzeuge;

const leisteGruppen = () => [...document.querySelectorAll('#toolGroups .tgroup')];
const werkzeugKnopf = t => document.querySelector(`#app .tool[data-tool="${t}"]`);
function werkzeugName(t){ const el = werkzeugKnopf(t); return el ? el.textContent.trim() : t; }
function werkzeugGruppe(t){ const el = werkzeugKnopf(t), g = el && el.closest('.tgroup'); return g ? g.dataset.group : null; }

// Welche Werkzeuge kommen im Level schon vor? (die bleiben immer sichtbar)
function werkzeugeImLevel(){
  const s = new Set();
  for(const k in tiles) s.add(tiles[k]);
  if(spikes.length) s.add('spike');
  if(coins.length) s.add('coin');
  if(hooks.length) s.add('hook');
  if(checkpoints.length) s.add('checkpoint');
  if(movers.length || hooks.some(h => h.move)) s.add('move');
  for(const E of punktElemente()) if((elementPunkte[E.feld] || []).length) s.add(E.editor.werkzeug);
  return s;
}
function werkzeugSichtbar(t, imLevel){
  if(alleWerkzeuge || GRUND_WERKZEUGE.includes(t) || imLevel.has(t) || t === currentTool) return true;
  if(BOSS_WERKZEUGE.includes(t)) return BOSS_WERKZEUGE.some(b => imLevel.has(b));
  return (WELT_WERKZEUGE[meta.welt] || []).includes(t);
}

// Reiter einmal bauen (aus den Gruppen in editor/index.html)
const reiterBox = document.getElementById('toolTabs');
for(const g of leisteGruppen()){
  const b = document.createElement('button'); b.type = 'button'; b.className = 'tab'; b.dataset.tab = g.dataset.group;
  b.textContent = g.dataset.name || g.dataset.group;
  b.addEventListener('click', () => reiterWaehlen(g.dataset.group));
  reiterBox.appendChild(b);
}
function reiterWaehlen(g){
  aktiverReiter = g;
  try{ localStorage.setItem(TAB_KEY, g); }catch(e){}
  leisteAktualisieren();
}

// Eigenschaften-Zeile: nur die Felder des aktiven Werkzeugs (data-for); „@nummer“ = Verknüpfungs-Nummer + Name,
// für alle Werkzeuge, die eine Nummer brauchen oder per Nummer schalten können
function brauchtNummer(t){
  const E = elementNachWerkzeug(t), ed = E && E.editor;
  return !!(ed && (ed.mitNummer || (ed.optionen || []).some(o => o.key === 'schalter' || o.key === 'start')));
}
function eigenschaftenZeigen(){
  const nummer = brauchtNummer(currentTool);
  let n = 0;
  for(const el of document.querySelectorAll('#propRow .prop')){
    const fuer = el.dataset.for.split(' ');
    const zeig = fuer.includes(currentTool) || (nummer && fuer.includes('@nummer'));
    el.classList.toggle('zeig', zeig);
    if(zeig) n++;
  }
  document.getElementById('propLeer').style.display = n ? 'none' : '';
  document.getElementById('propName').textContent = werkzeugName(currentTool) + ':';
}

function leisteAktualisieren(){
  const imLevel = werkzeugeImLevel();
  for(const el of document.querySelectorAll('#toolGroups .tool')) el.classList.toggle('aus', !werkzeugSichtbar(el.dataset.tool, imLevel));
  const gAktiv = werkzeugGruppe(currentTool);
  const sichtbar = g => !!g.querySelector('.tool:not(.aus)');
  const gruppen = leisteGruppen();
  if(!gruppen.some(g => g.dataset.group === aktiverReiter && sichtbar(g)))   // Reiter leer/ausgeblendet: Gruppe des Werkzeugs
    aktiverReiter = (gruppen.find(g => g.dataset.group === gAktiv && sichtbar(g)) || gruppen.find(sichtbar) || gruppen[0]).dataset.group;
  for(const g of gruppen){
    const an = g.dataset.group === aktiverReiter;
    g.classList.toggle('on', an);
    const tab = reiterBox.querySelector(`[data-tab="${g.dataset.group}"]`);
    tab.style.display = sichtbar(g) ? '' : 'none';
    tab.classList.toggle('on', an);
    tab.classList.toggle('hatAktiv', g.dataset.group === gAktiv && !an);   // Punkt: hier liegt das aktive Werkzeug
  }
  document.getElementById('aktivTool').innerHTML = 'Aktiv: <b></b>';
  document.querySelector('#aktivTool b').textContent = werkzeugName(currentTool);
  for(const b of document.querySelectorAll('#recentRow .rtool')) b.classList.toggle('active', b.dataset.recent === currentTool);
  eigenschaftenZeigen();
}

// „Zuletzt:“ – die letzten 5 Werkzeuge; ein Klick wählt das Werkzeug, ohne die Gruppe zu wechseln
function zuletztZeichnen(){
  const box = document.getElementById('recentRow');
  box.querySelectorAll('.rtool').forEach(b => b.remove());
  for(const t of zuletzt){
    const k = werkzeugKnopf(t); if(!k) continue;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'rtool'; b.dataset.recent = t;
    const sw = k.querySelector('.swatch'); if(sw) b.appendChild(sw.cloneNode(true));
    b.append(werkzeugName(t));
    b.addEventListener('click', () => werkzeugKnopf(t).click());
    box.appendChild(b);
  }
}
function zuletztMerken(t){
  zuletzt = [t, ...zuletzt.filter(x => x !== t)].slice(0, ZULETZT_MAX);
  try{ localStorage.setItem(ZULETZT_KEY, JSON.stringify(zuletzt)); }catch(e){}
  zuletztZeichnen();
}
// nach dem Klick-Handler aus 02-werkzeuge.js (der setzt currentTool)
for(const el of document.querySelectorAll('#app .tool')) el.addEventListener('click', () => { zuletztMerken(el.dataset.tool); leisteAktualisieren(); });
alleBox.addEventListener('change', () => {
  alleWerkzeuge = alleBox.checked;
  try{ localStorage.setItem(ALLE_KEY, alleWerkzeuge ? '1' : '0'); }catch(e){}
  leisteAktualisieren();
});
// Für Tests und Komfort: Werkzeug wählen, auch wenn seine Gruppe gerade zu ist (öffnet den Reiter, zeigt es notfalls)
function werkzeugZeigen(t){
  const g = werkzeugGruppe(t);
  if(g) aktiverReiter = g;
  const el = werkzeugKnopf(t);
  if(el && el.classList.contains('aus')){ alleWerkzeuge = true; alleBox.checked = true; }
  leisteAktualisieren();
}

// Leiste immer passend halten: nach jeder Änderung (save), nach dem Laden (applySnapshot), nach Level-Info (Welt)
const _saveVorLeiste = save;
save = function(){ const r = _saveVorLeiste.apply(this, arguments); leisteAktualisieren(); return r; };
const _applyVorLeiste = applySnapshot;
applySnapshot = function(){ const r = _applyVorLeiste.apply(this, arguments); leisteAktualisieren(); return r; };
const _metaVorLeiste = updateMetaUI;
updateMetaUI = function(){ const r = _metaVorLeiste.apply(this, arguments); leisteAktualisieren(); return r; };

// Seitenleiste: langer Hilfetext standardmäßig eingeklappt (Knopf „Hilfe“)
document.getElementById('hilfeBtn').addEventListener('click', () => {
  const h = document.getElementById('hilfe'), zu = h.style.display === 'none';
  h.style.display = zu ? '' : 'none';
  document.getElementById('hilfeBtn').textContent = zu ? 'Hilfe ▾' : 'Hilfe ▸';
});

zuletztZeichnen();
leisteAktualisieren();
requestAnimationFrame(fitView);   // Kopfzeile hat jetzt ihre endgültige Höhe -> Raster neu einpassen
