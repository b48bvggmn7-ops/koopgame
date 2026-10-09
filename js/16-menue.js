// 16-menue.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Hauptmenü, Levelauswahl, Pausenmenü ----------
// Solange ein Menü offen ist, steht das Spiel still (siehe loop in 14-spielschleife.js).
// Bedienung: Tastatur (↑/↓ bzw. W/S, Enter/Leertaste/Num 0, Esc/Backspace zurück),
// Controller (Steuerkreuz/Stick, ✕ bestätigen, ○ zurück, Options = Pause) und Maus.
const PROJECT_LEVELS = 'levels/';
const menuEl = document.getElementById('menu');
const menuItemsEl = document.getElementById('menuItems');
const menuTitleEl = document.getElementById('menuTitle');
let menuScreen = 'main';     // 'start' (Startmenü, 24-startmenue.js) | 'pause' | null (= Spiel läuft); früher auch 'main'/'levels'
let menuSel = 0;
let menuList = [];           // [{el, action}] – wählbare Einträge in Reihenfolge

function menuActive(){ return menuScreen !== null; }

function menuClearPressed(){
  // die Taste, mit der man im Menü gewählt hat, soll im Spiel nicht gleich springen/Haken schießen
  for(const k in KEYS) if(k.endsWith('_pressed')) KEYS[k] = false;
}
function closeMenu(){
  menuScreen = null;
  menuEl.classList.remove('show');
  menuClearPressed();
}
function menuSelect(i){
  if(!menuList.length) return;
  menuSel = (i + menuList.length) % menuList.length;
  menuList.forEach((m, j)=> m.el.classList.toggle('sel', j === menuSel));
  const el = menuList[menuSel].el;
  if(el.scrollIntoView) el.scrollIntoView({block:'nearest'});
}
function menuActivate(){ if(menuList[menuSel]){ SFX.menuOk(); menuList[menuSel].action(); } }

function menuAddItem(text, action, cls){
  const b = document.createElement('button');
  b.className = 'mItem' + (cls ? ' '+cls : ''); b.textContent = text; b.tabIndex = -1;
  const idx = menuList.length;
  b.onclick = ()=>{ menuSelect(idx); action(); };
  b.onmousemove = ()=>{ if(menuSel !== idx) menuSelect(idx); };
  menuItemsEl.appendChild(b);
  menuList.push({el:b, action});
}
function menuAddText(tag, text, cls){
  const d = document.createElement(tag); if(cls) d.className = cls; d.textContent = text;
  menuItemsEl.appendChild(d);
}
function menuBegin(screen, title){
  menuScreen = screen; menuTitleEl.textContent = title;
  menuItemsEl.innerHTML = ''; menuList = []; menuSel = 0;
  menuEl.classList.add('show');
}

function showMainMenu(){
  menuBegin('main', 'Monchichi Koop');
  menuAddItem('▶ Spielen', showLevelSelect);
  menuAddItem('✏️ Level-Editor', ()=>{ location.href = 'editor/index.html'; });
  menuAddItem('Level-Datei laden (Notlösung)', ()=> document.getElementById('loadLevelInput').click(), 'small');
  menuSelect(0);
}
function showPauseMenu(){
  menuBegin('pause', 'Pause');
  menuAddItem('▶ Weiterspielen', closeMenu);
  menuAddItem('↺ Level neu starten', ()=>{ resetLevel(); closeMenu(); });
  menuAddItem('☰ Zurück zum Menü', showMainMenu);
  menuAddItem(soundMuted ? '🔇 Ton ist aus – einschalten (M)' : '🔊 Ton ist an – ausschalten (M)', ()=>{ setMuted(!soundMuted); showPauseMenu(); menuSelect(3); });
  if(editorTestMode) menuAddItem('✏️ Zurück zum Editor (Esc)', backToEditor);
  menuSelect(0);
}

// Levels aus dem Projekt (levels/levels.json). „Meine Levels“ (Browser-Speicher) bewusst entfernt (Nutzerwunsch).
function startLevel(data){
  buildLevel(data);
  resetLevel();
  closeMenu();
}
async function showLevelSelect(){
  menuBegin('levels', 'Level wählen');
  menuAddText('h2', 'Levels');
  const projectSlot = document.createElement('div');
  projectSlot.className = 'mHint'; projectSlot.textContent = 'Lade …';
  menuItemsEl.appendChild(projectSlot);
  menuAddItem('← Zurück', showMainMenu, 'small');
  menuSelect(0);

  // Projekt-Levels nachladen und oben einsortieren
  let list = null;
  try{
    const r = await fetch(PROJECT_LEVELS + 'levels.json', {cache:'no-store'});
    if(r.ok) list = await r.json();
  }catch(e){ list = null; }
  if(menuScreen !== 'levels' || !projectSlot.isConnected) return;   // inzwischen woanders hin
  if(!Array.isArray(list)){
    projectSlot.textContent = 'Nicht erreichbar – das Spiel über die Webseite öffnen (nicht als Datei).';
    return;
  }
  if(!list.length){ projectSlot.textContent = 'Keine Levels im Projekt.'; return; }
  const selIdx = menuSel, selEl = menuList[menuSel] && menuList[menuSel].el;
  const added = [];
  for(const P of list){
    const b = document.createElement('button');
    b.className = 'mItem'; b.textContent = P.name || P.datei; b.tabIndex = -1;
    const action = async ()=>{
      try{
        const r = await fetch(PROJECT_LEVELS + encodeURIComponent(P.datei), {cache:'no-store'});
        if(!r.ok) throw 0;
        startLevel(await r.json());
      }catch(e){ b.textContent = (P.name || P.datei) + ' – konnte nicht geladen werden'; }
    };
    menuItemsEl.insertBefore(b, projectSlot);
    added.push({el:b, action});
  }
  projectSlot.remove();
  menuList = added.concat(menuList);
  menuList.forEach((m, idx)=>{
    m.el.onclick = ()=>{ menuSelect(idx); m.action(); };
    m.el.onmousemove = ()=>{ if(menuSel !== idx) menuSelect(idx); };
  });
  // hat man schon etwas anderes gewählt, bleibt das gewählt – sonst das erste Projekt-Level
  menuSelect(selIdx > 0 ? menuList.findIndex(m => m.el === selEl) : 0);
}
function menuBack(){
  if(menuScreen === 'levels') showMainMenu();
  else if(menuScreen === 'pause') closeMenu();
}

// Editor-Speicherformat (Kästchen-Raster, wie im Editor-„Levels“-Fenster) -> Spiel-Format.
// Gleiche Umrechnung wie der Export im Editor (editor.js: exportLevel).
function convertEditorSnapshot(d){
  const T = LOAD_TILE;
  const tiles = {};
  if(Array.isArray(d.tiles)) for(const [c, r, t] of d.tiles) tiles[c+','+r] = t;
  else if(d.tiles) Object.assign(tiles, d.tiles);
  function groupAt(c, r){
    const type = tiles[c+','+r]; if(!type) return null;
    const seen = new Set([c+','+r]); const stack = [[c, r]]; const cells = [];
    while(stack.length){
      const [x, y] = stack.pop(); cells.push([x, y]);
      for(const [nx, ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){
        const k = nx+','+ny;
        if(!seen.has(k) && tiles[k] === type){ seen.add(k); stack.push([nx, ny]); }
      }
    }
    return {type, cells, keys:seen};
  }
  const groups = [], used = new Set();
  for(const mv of (d.movers||[])){
    const g = groupAt(mv.c, mv.r);
    if(!g || used.has(mv.c+','+mv.r)) continue;
    g.keys.forEach(k => used.add(k));
    groups.push({mv, g});
  }
  const byType = {ground:[], wall:[], platform:[], crumble:[], fake:[]};
  for(const E of ELEMENTE) if(E.editor && E.editor.art === 'kachel') byType[E.editor.werkzeug] = [];   // z. B. Aufwind
  for(const key in tiles){
    if(used.has(key) || !byType[tiles[key]]) continue;
    const [c, r] = key.split(',').map(Number);
    byType[tiles[key]].push({c, r});
  }
  const solids = [];
  for(const type of ['ground','wall','platform','crumble','fake'])
    for(const rect of mergeCellsToRects(byType[type])) solids.push({...rect, type});
  const movingPlatforms = [];
  groups.forEach(({mv, g}, i)=>{
    for(const rect of mergeCellsToRects(g.cells.map(([c, r])=>({c, r})))){
      movingPlatforms.push({...rect, look:g.type, group:i+1,
        targetX: rect.x+mv.dc*T, targetY: rect.y+mv.dr*T, speed: mv.speed||4.5, switchLink: mv.link||null});
    }
  });
  const foot = p => p ? {x:p.c*T+T/2, y:p.r*T+T} : null;
  return {
    solids, movingPlatforms,
    hooks: (d.hooks||[]).map(h=>{
      const o = {x:h.c*T+T/2, y:h.r*T+T/2, radius:(h.radius||6.5)*T};
      if(h.move && (h.move.dc || h.move.dr)){
        o.targetX = o.x + h.move.dc*T; o.targetY = o.y + h.move.dr*T;
        o.speed = h.move.speed||4.5; o.switchLink = h.move.link||null;
      }
      return o;
    }),
    checkpoints: (d.checkpoints||[]).slice().sort((a, b)=> a.c-b.c).map(foot),
    coins: (d.coins||[]).map(co=>({x:co.c*T+T/2, y:co.r*T+T/2, color:co.color||'gold'})),
    spikes: (d.spikes||[]).map(sp=>({x:sp.c*T+T/2, y:sp.r*T+T, w:T, h:T, dir:sp.dir||0})),
    switches: (d.switches||[]).map(s=>({x:s.c*T+T/2, y:s.r*T+T/2, link:s.link})),
    doors: (d.doors||[]).map(dd=>({x:dd.c*T+T/2, y:dd.r*T+T/2, link:dd.link})),
    startM: foot(d.startM), startF: foot(d.startF), goal: foot(d.goal),
    plates: (d.plates||[]).map(p=>({x:p.c*T+T/2, y:p.r*T+T/2, link:p.link})),
    ...Object.fromEntries(ELEMENTE.filter(E => E.editor).map(E => [E.feld,   // Sprungpilz, Aufwind … (elemente/)
      E.editor.exportieren(E.editor.art === 'kachel' ? byType[E.editor.werkzeug] : (d[E.feld]||[]), T, mergeCellsToRects)])),
    theme: d.theme || undefined,
    // Level-Info (Ausbau 2): im Editor-Format ist "theme" der look-Override
    look: d.theme || undefined, welt: d.welt || undefined, tageszeit: d.tageszeit || undefined, wetter: d.wetter || undefined,
  };
}

// ---------- Tastatur ----------
// Läuft vor den Spiel-Tasten (capture auf document): solange ein Menü offen ist, sieht das Spiel
// keine Tastendrücke. Losgelassene Tasten (keyup) kommen weiter an, damit nichts "hängen" bleibt.
document.addEventListener('keydown', e=>{
  // Startmenü (24-startmenue.js) bedient sich selbst
  if(menuScreen === 'start'){ e.stopPropagation(); if(typeof smKeyDown === 'function') smKeyDown(e); return; }
  if(menuScreen === 'curtain'){ e.preventDefault(); e.stopPropagation(); return; }   // Blätter-Vorhang beim Levelstart
  if(!menuActive()){
    // Testmodus aus dem Editor: Esc beendet den Test sofort (auch auf dem Tod-Bildschirm) -> zurück zum Editor
    if(e.code === 'Escape' && editorTestMode){ e.preventDefault(); e.stopPropagation(); backToEditor(); return; }
    if(e.code === 'Escape' && !deathState){ e.preventDefault(); e.stopPropagation(); showPauseMenu(); }
    return;
  }
  e.preventDefault(); e.stopPropagation();
  if(e.repeat && !['ArrowUp','ArrowDown','KeyW','KeyS'].includes(e.code)) return;
  if(e.code === 'ArrowUp' || e.code === 'KeyW'){ menuSelect(menuSel - 1); SFX.menuTick(); }
  else if(e.code === 'ArrowDown' || e.code === 'KeyS'){ menuSelect(menuSel + 1); SFX.menuTick(); }
  else if(['Enter','NumpadEnter','Space','Numpad0'].includes(e.code)) menuActivate();
  else if(e.code === 'Escape' || e.code === 'Backspace') menuBack();
}, true);

// Knopf „☰ Menü“ unten links im Spiel öffnet das Pausenmenü (wie Esc / Options)
document.getElementById('menuBtn').addEventListener('click', e=>{
  e.currentTarget.blur();   // sonst löst die Leertaste später den Knopf erneut aus
  if(!menuActive()) showPauseMenu();
});

// Level aus Datei laden (Notlösung, Button im Spiel und im Menü) schließt das Menü
document.getElementById('loadLevelInput').addEventListener('change', ()=>{ if(menuActive()) closeMenu(); });

// ---------- Controller ----------
// Wird jedes Bild aus der Spielschleife aufgerufen. Options öffnet/schließt die Pause
// (nach einem Tod macht Options wie bisher einfach weiter).
const menuPadPrev = [{}, {}];
function pollMenuPads(){
  if(menuScreen === 'start' || menuScreen === 'curtain'){ menuClearPressed(); return; }   // Startmenü liest die Controller selbst
  let pads = [];
  try{ pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []; }catch(e){ pads = []; }
  for(let i = 0; i < 2; i++){
    const gp = pads[i], prev = menuPadPrev[i];
    if(!gp){ menuPadPrev[i] = {}; continue; }
    const b = n => !!(gp.buttons[n] && (gp.buttons[n].pressed || gp.buttons[n].value > 0.4));
    const ay = gp.axes[1] || 0;
    const now = {up: b(12) || ay < -0.6, down: b(13) || ay > 0.6, ok: b(0), back: b(1), opt: b(9)};
    const edge = k => now[k] && !prev[k];
    if(edge('opt')){
      if(menuScreen === 'pause') closeMenu();
      else if(!menuActive() && !deathState) showPauseMenu();
    } else if(menuActive()){
      if(edge('up')){ menuSelect(menuSel - 1); SFX.menuTick(); }
      else if(edge('down')){ menuSelect(menuSel + 1); SFX.menuTick(); }
      else if(edge('ok')) menuActivate();
      else if(edge('back')) menuBack();
    }
    menuPadPrev[i] = now;
  }
  if(!menuActive()) return;
  menuClearPressed();
}

// ---------- Test aus dem Editor ----------
// Der Editor-Knopf „▶ Testen“ legt das aktuelle Level (Spiel-Format) im Browser ab und öffnet index.html?test=1.
// Dann startet das Spiel sofort mit diesem Level (ohne Hauptmenü), beide Figuren dort, wo man im Editor gerade
// gebaut hat (der Editor setzt dafür startM/startF); im Pausenmenü gibt es „Zurück zum Editor“.
const EDITOR_TEST_KEY = 'monchichi_test_level';
let editorTestMode = false;
// zurück in den Editor – der zeigt dann die Stelle, an der die Figuren gerade stehen (hintere Figur, in Welt-Pixeln),
// damit man direkt dort weiterbauen und mit Enter wieder von dort testen kann
function backToEditor(){
  try{ localStorage.setItem('monchichi_editor_focus', String(Math.round(Math.min(p1.x, p2.x)))); }catch(e){}
  location.href = 'editor/index.html?from=test';
}
function startEditorTest(){
  if(!/[?&]test=1\b/.test(location.search)) return false;
  let data = null;
  try{ data = JSON.parse(localStorage.getItem(EDITOR_TEST_KEY) || 'null'); }catch(e){ data = null; }
  if(!data || !Array.isArray(data.solids)) return false;
  editorTestMode = true;
  startLevel(data);
  // Kamera gleich an die Startstelle setzen (sonst fährt sie erst vom Levelanfang dorthin)
  camPos = Math.max(0, Math.min(LEVEL_W - VW, Math.min(p1.x, p2.x) - CAM_LEFT));
  return true;
}

// ---------- Testlevel direkt öffnen (Ausbau 1) ----------
// index.html?testlevel=<name> lädt levels/test/<name>.json sofort (ohne Hauptmenü). Hat das Level
// "schichtenVorschau": true, wechselt T die Tageszeit und Z das Wetter (Beweis: Welt + Tageszeit + Wetter als Schichten).
function startTestLevelFromUrl(){
  const m = /[?&]testlevel=([\w-]+)/.exec(location.search);
  if(!m) return false;
  fetch(PROJECT_LEVELS + 'test/' + m[1] + '.json', {cache:'no-store'})
    .then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
    .then(data => { startLevel(data); if(levelLayers.vorschau) layerPreviewMsg(); })
    .catch(e => { console.error('Testlevel lädt nicht:', e); showTitleScreen(); });
  return true;
}
function layerPreviewMsg(){
  testJumpMsg = 'Tageszeit: ' + (levelLayers.tageszeit || 'morgen') + ' (T)  ·  Wetter: ' + levelLayers.wetter + ' (Z)';
  testJumpT = performance.now() + 2500;   // etwas länger sichtbar
}
window.addEventListener('keydown', e=>{
  if(e.repeat || !levelLayers.vorschau || menuScreen) return;
  if(e.code === 'KeyT'){
    const i = TAGESZEITEN.indexOf(levelLayers.tageszeit || 'morgen');
    levelLayers.tageszeit = TAGESZEITEN[(i + 1) % TAGESZEITEN.length];
    levelTheme = composeLook(levelLayers.welt || 'dschungel', levelLayers.tageszeit); setTheme(levelTheme);
    if(levelLayers.wetter === 'regen') weatherForce('rain');
    layerPreviewMsg();
  }
  if(e.code === 'KeyZ' || e.code === 'KeyY'){   // Z (bei englischer Tastenbelegung Y)
    levelLayers.wetter = WETTER_ARTEN[(WETTER_ARTEN.indexOf(levelLayers.wetter) + 1) % WETTER_ARTEN.length];
    setWeatherMode(levelLayers.wetter); layerPreviewMsg();
  }
});

// Start: Editor-Test oder Titelbild des Startmenüs – siehe 99-start.js
