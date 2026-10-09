// editor/js/99-start.js – Teil des Level-Editors für "Monchichi Koop".
// Alle editor/js/*.js teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags, kein Build)
// und werden in editor/index.html in fester Reihenfolge geladen.
// Start: gespeicherten Arbeitsstand laden, Tastenkürzel, Zeichnen starten.

load();
updateName();
updateLinkMarks();

window.addEventListener('keydown', e=>{
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='s'){ e.preventDefault(); document.getElementById('saveBtn').click(); }
  if(e.key==='Escape'){ closeLevels(); closeMeta(); selectMove(null); }
  if((e.key==='Delete' || e.key==='Backspace') && selMove){
    const tag = document.activeElement ? document.activeElement.tagName : '';
    if(tag!=='INPUT' && tag!=='TEXTAREA'){ e.preventDefault(); deleteSelMove(); }
  }
  // Enter = „▶ Testen“ – aber nicht beim Tippen in ein Feld und nicht, wenn ein Fenster (Levels/Export) offen ist
  if((e.key==='Enter' || e.code==='NumpadEnter') && !e.repeat){
    const el = document.activeElement, tag = el ? el.tagName : '';
    const typing = tag==='INPUT' || tag==='TEXTAREA' || tag==='SELECT' || (el && el.isContentEditable);
    const dialog = levelBox.classList.contains('show') || document.getElementById('exportBox').classList.contains('show') || metaBox.classList.contains('show');
    if(!typing && !dialog){ e.preventDefault(); document.getElementById('testBtn').click(); }
  }
});

draw();
