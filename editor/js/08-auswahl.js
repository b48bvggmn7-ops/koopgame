// editor/js/08-auswahl.js – Teil des Level-Editors für "Monchichi Koop".
// Alle editor/js/*.js teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags, kein Build)
// und werden in editor/index.html in fester Reihenfolge geladen.
// Ausbau 2: Rückgängig/Wiederholen (Strg+Z / Strg+Y) und Rechteck-Auswahl mit Kopieren, Ausschneiden, Einfügen,
// Verschieben (Strg+C / Strg+X / Strg+V, Ziehen) – mit allen Objekten (Hebel, Türen, Haken, Bewegungen …).

// ---------- Rückgängig / Wiederholen ----------
// Nach jeder Änderung (save() in 01-zustand.js) wird der ganze Level-Stand gemerkt. Ein gezogener Pinselstrich
// (Maus gedrückt halten) zählt als EIN Schritt. Laden / Neues Level beginnt einen frischen Verlauf.
const HIST_MAX = 200;
const undoStack = [], redoStack = [];
let histCur = null, histMuted = false;
function histState(){ return JSON.stringify(snapshot()); }
function histReset(){ histCur = histState(); undoStack.length = 0; redoStack.length = 0; updateHistButtons(); }
function histNote(){
  if(histMuted || histCur === null || painting || moveDrag || selDrag || verschiebDrag) return;   // während Ziehen: erst beim Loslassen
  const s = histState();
  if(s === histCur) return;
  undoStack.push(histCur); if(undoStack.length > HIST_MAX) undoStack.shift();
  histCur = s; redoStack.length = 0; updateHistButtons();
}
function histGo(from, to, msg){
  histNote();
  if(!from.length){ flash(msg + ': nichts mehr da'); return false; }
  to.push(histCur); histCur = from.pop();
  histMuted = true;
  applySnapshot(JSON.parse(histCur)); selectMove(null); selRect = null;
  save();
  histMuted = false;
  updateHistButtons(); flash(msg);
  return true;
}
const undo = () => histGo(undoStack, redoStack, '↶ Rückgängig');
const redo = () => histGo(redoStack, undoStack, '↷ Wiederholt');
function updateHistButtons(){
  const u = document.getElementById('undoBtn'), r = document.getElementById('redoBtn');
  if(u) u.disabled = !undoStack.length;
  if(r) r.disabled = !redoStack.length;
}
document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);

// ---------- Rechteck-Auswahl ----------
// Werkzeug „Auswahl“: Rechteck aufziehen. Darin ziehen = Inhalt verschieben. Strg+C kopieren, Strg+X ausschneiden,
// Strg+V an der Maus einfügen (oben links = Mauskästchen), Entf löscht den Inhalt, Esc hebt die Auswahl auf.
// Start und Ziel gibt es nur einmal: sie werden beim Kopieren nicht mitgenommen, beim Verschieben aber mitbewegt.
let selRect = null;            // {c0, r0, c1, r1} (einschließlich)
let selDrag = null;            // {mode:'new', c, r} | {mode:'move', sc, sr, dc, dr}
let clipboard = null;          // kopierter Inhalt, Koordinaten relativ zur linken oberen Ecke
let hoverCell = null;          // Kästchen unter der Maus (Ziel für Strg+V)
// alle Objekt-Listen, die Kästchen-Punkte {c, r, …} enthalten (Getter, weil eraseAt die Listen neu zuweist)
const POINT_LISTS = {
  hooks: ()=>hooks,
  spikes: ()=>spikes, coins: ()=>coins, checkpoints: ()=>checkpoints,
};
const SET_LIST = {
  hooks: v=>hooks=v,
  spikes: v=>spikes=v, coins: v=>coins=v, checkpoints: v=>checkpoints=v,
};
for(const k in elementPunkte){ POINT_LISTS[k] = ()=>elementPunkte[k]; SET_LIST[k] = v=>elementPunkte[k]=v; }   // Register-Elemente
const normRect = (c0, r0, c1, r1) => ({c0: Math.min(c0, c1), r0: Math.min(r0, r1), c1: Math.max(c0, c1), r1: Math.max(r0, r1)});
const inRect = (R, c, r) => !!R && c >= R.c0 && c <= R.c1 && r >= R.r0 && r <= R.r1;
const deep = o => JSON.parse(JSON.stringify(o));

function copyRect(R, withMarkers){
  const out = {w: R.c1 - R.c0 + 1, h: R.r1 - R.r0 + 1, tiles: [], lists: {}, movers: [], markers: {}};
  for(const k in tiles){ const [c, r] = k.split(',').map(Number); if(inRect(R, c, r)) out.tiles.push([c - R.c0, r - R.r0, tiles[k]]); }
  for(const name in POINT_LISTS)
    out.lists[name] = POINT_LISTS[name]().filter(p => inRect(R, p.c, p.r)).map(p => ({...deep(p), c: p.c - R.c0, r: p.r - R.r0}));
  out.movers = movers.filter(m => inRect(R, m.c, m.r)).map(m => ({...deep(m), c: m.c - R.c0, r: m.r - R.r0}));
  if(withMarkers) for(const [n, v] of [['startM', startM], ['startF', startF], ['goal', goal]])
    if(v && inRect(R, v.c, v.r)) out.markers[n] = {c: v.c - R.c0, r: v.r - R.r0};
  return out;
}
function eraseRect(R, withMarkers){
  for(const k of Object.keys(tiles)){ const [c, r] = k.split(',').map(Number); if(inRect(R, c, r)) delete tiles[k]; }
  for(const name in POINT_LISTS) SET_LIST[name](POINT_LISTS[name]().filter(p => !inRect(R, p.c, p.r)));
  movers = movers.filter(m => !inRect(R, m.c, m.r));
  if(withMarkers){
    if(startM && inRect(R, startM.c, startM.r)) startM = null;
    if(startF && inRect(R, startF.c, startF.r)) startF = null;
    if(goal && inRect(R, goal.c, goal.r)) goal = null;
  }
}
// Verknüpfungs-Nummern im Level (ohne die gerade eingefügten)
function usedLinks(){
  const u = new Set();
  for(const E of punktElemente()) if(E.editor.mitNummer) for(const x of elementPunkte[E.feld]) if(x.link) u.add(x.link);   // Hebel, Tür, Druckplatte
  for(const m of movers) if(m.link) u.add(m.link);
  for(const h of hooks) if(h.move && h.move.link) u.add(h.move.link);
  return u;
}
// Einfügen mit linker oberer Ecke (c0, r0). renumber: Nummern, die es im Level schon gibt, neu vergeben
// (alle Teile mit derselben Nummer bekommen dieselbe neue – Hebel, Tür und Bewegung bleiben zusammen).
function pasteClip(clip, c0, r0, renumber){
  const map = {};
  if(renumber){
    const used = usedLinks(), want = new Set();
    for(const E of punktElemente()) if(E.editor.mitNummer) for(const x of clip.lists[E.feld] || []) if(x.link) want.add(x.link);
    for(const m of clip.movers) if(m.link) want.add(m.link);
    for(const h of clip.lists.hooks) if(h.move && h.move.link) want.add(h.move.link);
    let next = 1;
    for(const n of [...want].sort((a, b) => a - b)){
      if(!used.has(n)){ used.add(n); continue; }
      while(used.has(next) && next <= MAX_LINK) next++;
      if(next > MAX_LINK){ flash('Keine freie Verknüpfungs-Nummer mehr (höchstens ' + MAX_LINK + ')'); break; }
      map[n] = next; used.add(next);
      if(linkNames[n] && !linkNames[next]) linkNames[next] = linkNames[n];   // Name geht mit
    }
  }
  const L = n => map[n] || n;
  const ok = (c, r) => c >= 0 && r >= -SKY && r < ROWS;
  ensureRoom(c0 + clip.w);
  for(const [dc, dr, t] of clip.tiles){
    const c = c0 + dc, r = r0 + dr; if(!ok(c, r)) continue;
    tiles[c + ',' + r] = t; spikes = spikes.filter(s => !(s.c === c && s.r === r));
  }
  const eingefuegt = {};
  for(const name in clip.lists){
    eingefuegt[name] = [];
    for(const p of clip.lists[name]){
      const c = c0 + p.c, r = r0 + p.r; if(!ok(c, r)) continue;
      const q = {...deep(p), c, r};
      if(q.link) q.link = L(q.link);
      if(q.move && q.move.link) q.move.link = L(q.move.link);
      if(name === 'spikes') delete tiles[c + ',' + r];
      SET_LIST[name](POINT_LISTS[name]().filter(x => !(x.c === c && x.r === r)));   // an derselben Stelle ersetzen
      POINT_LISTS[name]().push(q); eingefuegt[name].push(q);
    }
  }
  for(const E of punktElemente()) if(E.editor.einfuegen && (eingefuegt[E.feld] || []).length) E.editor.einfuegen(eingefuegt[E.feld], elementPunkte[E.feld]);   // z. B. Teleporter: neue Paar-Nummern
  for(const m of clip.movers){
    const c = c0 + m.c, r = r0 + m.r; if(!ok(c, r)) continue;
    movers.push({...deep(m), c, r, link: m.link ? L(m.link) : m.link});
  }
  if(clip.markers.startM) startM = {c: c0 + clip.markers.startM.c, r: r0 + clip.markers.startM.r};
  if(clip.markers.startF) startF = {c: c0 + clip.markers.startF.c, r: r0 + clip.markers.startF.r};
  if(clip.markers.goal) goal = {c: c0 + clip.markers.goal.c, r: r0 + clip.markers.goal.r};
  selRect = {c0, r0, c1: c0 + clip.w - 1, r1: r0 + clip.h - 1};
  return Object.keys(map).length;
}
function selCopy(){ if(!selRect) return flash('Erst mit „Auswahl ⬚“ ein Rechteck aufziehen'); clipboard = copyRect(selRect, false); flash('Kopiert – Strg+V fügt an der Maus ein'); }
function selCut(){ if(!selRect) return flash('Erst mit „Auswahl ⬚“ ein Rechteck aufziehen'); clipboard = copyRect(selRect, false); eraseRect(selRect, false); save(); flash('Ausgeschnitten – Strg+V fügt an der Maus ein'); }
function selPaste(){
  if(!clipboard) return flash('Nichts kopiert');
  const at = hoverCell || (selRect ? {c: selRect.c0 + 1, r: selRect.r0 + 1} : {c: 1, r: 0});
  const n = pasteClip(clipboard, Math.max(0, at.c), Math.max(-SKY, Math.min(ROWS - clipboard.h, at.r)), true);
  setTool('select'); save();
  flash('Eingefügt' + (n ? ` – ${n} Verknüpfungs-Nummer${n > 1 ? 'n' : ''} neu vergeben` : ''));
}
function selDelete(){ if(!selRect) return; eraseRect(selRect, false); save(); flash('Inhalt der Auswahl gelöscht'); }
// Auswahl füllen (Nutzerwunsch): jedes Kästchen der Auswahl wird Boden bzw. Wand (wie Malen mit dem Werkzeug: vorhandene
// Kacheln werden ersetzt, Stacheln an diesen Stellen entfernt; Münzen, Hebel usw. bleiben)
function selFill(typ){
  if(!selRect) return flash('Erst mit „Auswahl ⬚“ ein Rechteck aufziehen');
  const R = selRect;
  for(let c = R.c0; c <= R.c1; c++) for(let r = R.r0; r <= R.r1; r++) tiles[c + ',' + r] = typ;
  spikes = spikes.filter(h => !inRect(R, h.c, h.r));
  save(); histNote();
  flash(`Auswahl mit ${typ === 'wall' ? 'Wand' : 'Boden'} gefüllt (${(R.c1 - R.c0 + 1)*(R.r1 - R.r0 + 1)} Kästchen)`);
}
document.getElementById('selFillGround').addEventListener('click', () => selFill('ground'));
document.getElementById('selFillWall').addEventListener('click', () => selFill('wall'));
function setTool(t){
  document.querySelectorAll('.tool').forEach(x => x.classList.toggle('active', x.dataset.tool === t));
  currentTool = t;
  if(t !== 'move') selectMove(null);
}
// Maus (aus 02-werkzeuge.js aufgerufen, wenn das Werkzeug „Auswahl“ aktiv ist)
function selMouseDown(c, r){
  if(inRect(selRect, c, r)) selDrag = {mode: 'move', sc: c, sr: r, dc: 0, dr: 0};
  else { selDrag = {mode: 'new', c, r}; selRect = {c0: c, r0: r, c1: c, r1: r}; }
}
function selMouseMove(c, r){
  if(!selDrag) return;
  r = Math.max(-SKY, Math.min(ROWS - 1, r)); c = Math.max(0, c);
  if(selDrag.mode === 'new') selRect = normRect(selDrag.c, selDrag.r, c, r);
  else { selDrag.dc = c - selDrag.sc; selDrag.dr = r - selDrag.sr; }
}
function selMouseUp(){
  if(!selDrag) return;
  const d = selDrag; selDrag = null;
  if(d.mode === 'move' && (d.dc || d.dr)){
    const clip = copyRect(selRect, true);       // verschieben: Start/Ziel kommen mit, Nummern bleiben
    eraseRect(selRect, true);
    pasteClip(clip, selRect.c0 + d.dc, selRect.r0 + d.dr, false);
    save(); flash('Verschoben');
  } else if(d.mode === 'new'){
    const R = selRect; flash(`Auswahl ${R.c1 - R.c0 + 1} × ${R.r1 - R.r0 + 1} – Strg+C kopieren, Strg+X ausschneiden, ziehen = verschieben, Entf = löschen`);
  }
}
// ---------- Werkzeug „Verschieben ✥“ (Nutzerwunsch: „Dinge auswählen und verschieben – einzelne und markierte“) ----------
// Klick in eine markierte Auswahl + ziehen = die ganze Auswahl wandert (wie Ziehen mit „Auswahl“); sonst wandert nur das EINE
// Ding unter der Maus: zuerst ein Element (Hebel, Tür, Floß … – auch an einem anderen seiner Kästchen angefasst), dann Haken,
// Münze, Stacheln, Checkpoint, Start/Ziel, zuletzt das Boden-/Wand-Kästchen (seine Bewegung geht mit). Während des Ziehens
// sieht man es schon am neuen Platz (der Stand vom Anfassen wird je neuem Kästchen wiederhergestellt und neu verschoben);
// erst beim Loslassen wird gespeichert – Rückgängig nimmt das ganze Verschieben in einem Schritt zurück.
let verschiebDrag = null;   // {start (JSON-Stand), art: 'auswahl'|'einzeln', R | ding, sc, sr, dc, dr, name}
function verschiebDingFinden(c, r){
  for(const E of punktElemente()){
    const i = elementPunkte[E.feld].findIndex(p => punktBelegt(E, p, c, r));
    if(i >= 0){ const p = elementPunkte[E.feld][i]; return {feld: E.feld, idx: i, c: p.c, r: p.r, name: E.editor.label || E.name}; }
  }
  for(const [feld, name] of [['hooks', 'Haken'], ['coins', 'Münze'], ['spikes', 'Stacheln'], ['checkpoints', 'Checkpoint']]){
    const i = POINT_LISTS[feld]().findIndex(p => p.c === c && p.r === r);
    if(i >= 0) return {feld, idx: i, c, r, name};
  }
  for(const [m, name] of [['startM', 'Start Affe'], ['startF', 'Start Schweinchen'], ['goal', 'Ziel']]){
    const v = {startM, startF, goal}[m]; if(v && v.c === c && v.r === r) return {marker: m, c, r, name};
  }
  if(tiles[c + ',' + r]) return {tile: true, c, r, name: 'Kästchen'};
  return null;
}
function verschiebAnwenden(d){
  const ok = (c, r) => c >= 0 && r >= -SKY && r < ROWS;
  if(d.art === 'auswahl'){
    const clip = copyRect(d.R, true); eraseRect(d.R, true);
    pasteClip(clip, d.R.c0 + d.dc, d.R.r0 + d.dr, false);   // setzt selRect an die neue Stelle; Nummern bleiben
    return;
  }
  const x = d.ding, c = x.c + d.dc, r = x.r + d.dr;
  if(!ok(c, r)) return;
  if(x.feld){
    const L = POINT_LISTS[x.feld](), p = L[x.idx]; if(!p) return;
    SET_LIST[x.feld](L.filter(q => q === p || !(q.c === c && q.r === r)));   // was dort schon liegt (gleiche Sorte), wird ersetzt
    p.c = c; p.r = r;
    if(x.feld === 'spikes') delete tiles[c + ',' + r];
  } else if(x.marker){
    if(x.marker === 'startM') startM = {c, r}; else if(x.marker === 'startF') startF = {c, r}; else goal = {c, r};
  } else if(x.tile){
    const t = tiles[x.c + ',' + x.r]; delete tiles[x.c + ',' + x.r]; tiles[c + ',' + r] = t;
    spikes = spikes.filter(s => !(s.c === c && s.r === r));
    for(const m of movers) if(m.c === x.c && m.r === x.r){ m.c = c; m.r = r; }   // Bewegung des Stücks geht mit
  }
  ensureRoom(c);
}
function verschiebStart(c, r){
  const R = selRect && inRect(selRect, c, r) ? {...selRect} : null;
  const ding = R ? null : verschiebDingFinden(c, r);
  if(!R && !ding){ selRect = null; flash('Verschieben: ein Ding oder eine markierte Auswahl anklicken und ziehen'); return; }
  if(!R) selRect = null;
  verschiebDrag = {start: JSON.stringify(snapshot()), art: R ? 'auswahl' : 'einzeln', R, ding, sc: c, sr: r, dc: 0, dr: 0,
                   name: R ? `Auswahl ${R.c1 - R.c0 + 1} × ${R.r1 - R.r0 + 1}` : ding.name};
  flash(`${verschiebDrag.name} – ziehen und loslassen`);
}
function verschiebZiehen(c, r){
  const d = verschiebDrag; if(!d) return;
  r = Math.max(-SKY, Math.min(ROWS - 1, r)); c = Math.max(0, c);
  const dc = c - d.sc, dr = r - d.sr;
  if(dc === d.dc && dr === d.dr) return;
  d.dc = dc; d.dr = dr;
  histMuted = true; applySnapshot(JSON.parse(d.start)); histMuted = false;   // Stand vom Anfassen …
  if(dc || dr) verschiebAnwenden(d); else if(d.R) selRect = {...d.R};       // … und neu verschoben (Live-Vorschau)
  flash(`${d.name}: ${dc >= 0 ? '+' : ''}${dc} Spalten, ${dr >= 0 ? '+' : ''}${dr} Reihen`);
}
function verschiebEnde(){
  const d = verschiebDrag; if(!d) return;
  verschiebDrag = null;
  if(d.dc || d.dr){ save(); flash(`${d.name} verschoben`); }
}
window.addEventListener('mouseup', ()=>{ selMouseUp(); verschiebEnde(); histNote(); });   // nach 02 (painting ist dann aus)
window.addEventListener('mousemove', e=>{ if(verschiebDrag){ const {c, r} = cellFromEvent(e); verschiebZiehen(c, r); } });   // auch außerhalb der Leinwand
cvs.addEventListener('mousemove', e=>{ hoverCell = cellFromEvent(e); });
// Auswahl zeichnen (aus draw() in 03-zeichnen.js; Ursprung = Reihe 0)
function drawSelection(){
  if(verschiebDrag && verschiebDrag.ding){   // einzelnes Ding beim Verschieben: gelber Rahmen am neuen Platz
    const d = verschiebDrag, x = (d.ding.c + d.dc)*TILE, y = (d.ding.r + d.dr)*TILE;
    ctx.save(); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2.5; ctx.setLineDash([5, 4]); ctx.strokeRect(x + 1.5, y + 1.5, TILE - 3, TILE - 3); ctx.restore();
  }
  if(!selRect) return;
  const R = selRect, off = selDrag && selDrag.mode === 'move' ? selDrag : {dc: 0, dr: 0};
  const x = (R.c0 + off.dc)*TILE, y = (R.r0 + off.dr)*TILE, w = (R.c1 - R.c0 + 1)*TILE, h = (R.r1 - R.r0 + 1)*TILE;
  ctx.save();
  ctx.fillStyle = 'rgba(255,210,63,.08)'; ctx.fillRect(x, y, w, h);
  ctx.setLineDash([7, 5]); ctx.lineDashOffset = -(performance.now()/40) % 12;
  ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.restore();
}
// Tasten: Strg+Z / Strg+Y (auch Strg+Umschalt+Z), Strg+C / X / V, Entf, Esc – nicht beim Tippen in ein Feld
window.addEventListener('keydown', e=>{
  const el = document.activeElement, tag = el ? el.tagName : '';
  if(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el && el.isContentEditable)) return;
  const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
  if(mod && k === 'z' && !e.shiftKey){ e.preventDefault(); undo(); }
  else if(mod && (k === 'y' || (k === 'z' && e.shiftKey))){ e.preventDefault(); redo(); }
  else if(mod && k === 'c'){ e.preventDefault(); selCopy(); }
  else if(mod && k === 'x'){ e.preventDefault(); selCut(); }
  else if(mod && k === 'v'){ e.preventDefault(); selPaste(); }
  else if((e.key === 'Delete' || e.key === 'Backspace') && selRect && !selMove){ e.preventDefault(); selDelete(); }
  else if(e.key === 'Escape') selRect = null;
});
