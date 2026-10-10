// 24-startmenue.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Startmenü (nach der Vorlage des Nutzers, claude.ai-Artefakt „Startscreens“) ----------
// Titel („Beliebige Taste drücken“) → Hauptmenü (Spielen · Fortfahren · Optionen · Beenden) → Spielerwahl
// („Wer spielt wen?“, 3-2-1-Los) → Levelkarten (Freischalten nacheinander, Level ab 4 = Coming soon).
// Optionen: Steuerung (Tastatur/Controller, passend zur Spielerwahl), Lautstärke Gesamt/Musik/Effekte,
// „Alle Level freischalten (zum Testen)“. Aussehen in css/startmenue.css (alles unter #sm).
// Solange das Startmenü offen ist, gilt menuScreen = 'start' (Spiel steht still). Das Pausenmenü bleibt in 16-menue.js.
// Der Level-Editor ist bewusst NICHT im Menü (Nutzerwunsch) – er läuft unter editor/ als eigene Seite.
const SM_HTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <radialGradient id="sm-gMonkey" cx=".35" cy=".28" r=".9"><stop offset="0" stop-color="#b3764a"/><stop offset="1" stop-color="#5a3219"/></radialGradient>
    <linearGradient id="sm-gFace" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde3c0"/><stop offset="1" stop-color="#e9c096"/></linearGradient>
    <radialGradient id="sm-gPig" cx=".35" cy=".28" r=".9"><stop offset="0" stop-color="#ffc2d8"/><stop offset="1" stop-color="#e2749b"/></radialGradient>
    <radialGradient id="sm-gSnout" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#ffa6c4"/><stop offset="1" stop-color="#ee7ba3"/></radialGradient>
    <radialGradient id="sm-gShade" cx=".5" cy=".5" r=".5"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>
    <linearGradient id="sm-gRim" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9ff6a" stop-opacity=".95"/><stop offset=".45" stop-color="#d9ff6a" stop-opacity="0"/></linearGradient>
  </defs>
</svg>

<div id="sm-app"><div id="sm-stage">
  <div class="bg" id="sm-bg"></div>
  <div class="particles" id="sm-particles"></div>

  <!-- 1) Titel -->
  <section class="screen" id="sm-s-title" aria-label="Titelbildschirm">
    <div class="big hero-l" style="left:-5cqw;bottom:-24cqh;width:48cqw;rotate:7deg"><div class="bob" data-char="monkey"></div></div>
    <div class="big hero-r" style="right:-5cqw;bottom:-24cqh;width:48cqw;rotate:-7deg"><div class="bob" data-char="pig"></div></div>
    <div class="t-logo"><span class="display grad" id="sm-logo"></span></div>
    <div class="prompt glass" id="sm-press">Beliebige Taste drücken</div>
  </section>

  <!-- 2) Menü -->
  <section class="screen" id="sm-s-menu" aria-label="Hauptmenü">
    <div class="big" style="right:-9cqw;bottom:-28cqh;width:44cqw;rotate:-8deg"><div class="bob" data-char="pig"></div></div>
    <div class="big" style="right:20cqw;bottom:-36cqh;width:44cqw;rotate:6deg"><div class="bob" data-char="monkey"></div></div>
    <div class="m-logo display grad" id="sm-logo-sm"></div>
    <div class="menu" id="sm-menu"></div>
  </section>

  <!-- 3) Optionen -->
  <section class="screen" id="sm-s-options" aria-label="Optionen">
    <div class="o-title display">Optionen</div>
    <div class="pan glass" style="left:6cqw;width:50cqw">
      <h4>Steuerung</h4>
      <div class="opt-row" id="sm-opt-seg"><div class="tabs">
        <button type="button" tabindex="-1" data-view="keyboard">Tastatur</button>
        <button type="button" tabindex="-1" data-view="gamepad">Controller</button>
      </div></div>
      <div class="ccols" id="sm-ctrl-cards"></div>
      <p class="tip" id="sm-ctrl-tip"></p>
    </div>
    <div class="pan glass" style="right:6cqw;width:30cqw">
      <h4>Lautstärke</h4>
      <div class="opt-row vol" id="sm-row-master"><label>Gesamt <b id="sm-v-master"></b></label><input type="range" min="0" max="100" step="5" id="sm-r-master" tabindex="-1"></div>
      <div class="opt-row vol" id="sm-row-music"><label>Musik <b id="sm-v-music"></b></label><input type="range" min="0" max="100" step="5" id="sm-r-music" tabindex="-1"></div>
      <div class="opt-row vol" id="sm-row-sfx"><label>Effekte <b id="sm-v-sfx"></b></label><input type="range" min="0" max="100" step="5" id="sm-r-sfx" tabindex="-1"></div>
      <div class="opt-row" id="sm-row-fs"><button class="btn unlock" id="sm-fs" type="button" tabindex="-1">Vollbild an / aus</button></div>
      <div class="opt-row" id="sm-row-unlock"><button class="btn unlock" id="sm-unlock" type="button" tabindex="-1">Alle Level freischalten (zum Testen)</button></div>
    </div>
    <button class="btn back" id="sm-opt-back" type="button" tabindex="-1">← Zurück</button>
  </section>

  <!-- 4) Spielerwahl -->
  <section class="screen" id="sm-s-select" aria-label="Spielerwahl">
    <div class="half l"></div><div class="half r"></div>
    <div class="big" style="left:2cqw;bottom:-22cqh;width:44cqw;rotate:4deg"><div class="bob pc" id="sm-pc-monkey" data-char="monkey"></div></div>
    <div class="big" style="right:2cqw;bottom:-22cqh;width:44cqw;rotate:-4deg"><div class="bob pc" id="sm-pc-pig" data-char="pig"></div></div>
    <div class="s-title display">Wer spielt wen?</div>
    <div class="ptag glass" id="sm-badge-L"></div>
    <div class="ptag glass" id="sm-badge-R"></div>
    <div class="swap glass">◀ ▶</div>
    <div class="cname glass" id="sm-cn-monkey" style="left:5cqw"></div>
    <div class="cname glass" id="sm-cn-pig" style="right:5cqw;text-align:right"></div>
    <div class="foot"><span class="chip glass" id="sm-pad-info"></span><button class="btn primary" id="sm-go-btn" type="button" tabindex="-1">Los geht's</button></div>
    <div class="countdown" id="sm-countdown"></div>
  </section>

  <!-- 5a) Weltkarte (Ausbau 3): je Welt eine Insel, Pfade dazwischen -->
  <section class="screen" id="sm-s-map" aria-label="Weltkarte">
    <div class="l-title display">Weltkarte</div>
    <div class="l-count" id="sm-m-count"></div>
    <div class="wm" id="sm-wm"><svg class="wm-path" id="sm-wm-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg></div>
    <div class="hint" id="sm-m-hint"></div>
  </section>

  <!-- 5b) Welt-Seite: Level der gewählten Welt + Boss-Karte -->
  <section class="screen" id="sm-s-levels" aria-label="Levelauswahl">
    <div class="l-title display" id="sm-l-title">Level wählen</div>
    <div class="l-world" id="sm-l-world"></div>
    <div class="l-count" id="sm-l-count"></div>
    <div class="cards" id="sm-cards"></div>
    <div class="lbar"><i id="sm-lbar-i"></i></div>
    <div class="hint" id="sm-l-hint"></div>
    <button class="btn l-pack glass" id="sm-l-pack" type="button" tabindex="-1"></button>
    <button class="btn l-coll glass" id="sm-l-coll" type="button" tabindex="-1"></button>
  </section>

  <!-- 6) Tschüss -->
  <section class="screen" id="sm-s-goodbye" aria-label="Auf Wiedersehen">
    <div class="big" style="left:8cqw;bottom:-22cqh;width:38cqw;rotate:6deg"><div class="bob" data-char="monkey"></div></div>
    <div class="big" style="right:8cqw;bottom:-22cqh;width:38cqw;rotate:-6deg"><div class="bob" data-char="pig"></div></div>
    <div class="s-title display">Bis bald!</div>
    <div class="bye glass">Du kannst dieses Fenster jetzt schließen.</div>
    <button class="btn byebtn" id="sm-bye-back" type="button" tabindex="-1">Doch noch eine Runde</button>
  </section>

  <!-- 7) Level geschafft: Statistik nach dem Ziel-Tanz (Münzen und Tode je Figur) -->
  <section class="screen" id="sm-s-results" aria-label="Level geschafft">
    <div class="l-title display grad">Level geschafft</div>
    <div class="r-level" id="sm-r-level"></div>
    <div class="r-conf" id="sm-r-conf"></div>
    <div class="r-card glass" id="sm-r-m"></div>
    <div class="r-card glass" id="sm-r-f"></div>
    <div class="foot"><button class="btn pack" id="sm-r-pack" type="button" tabindex="-1"></button><button class="btn primary sel" id="sm-r-go" type="button" tabindex="-1">Weiter</button></div>
  </section>

  <div class="modal" id="sm-modal" role="dialog" aria-modal="true">
    <div class="modal-box glass"><h3 id="sm-modal-title"></h3><p id="sm-modal-text"></p><div class="modal-btns" id="sm-modal-btns"></div></div>
  </div>
  <div class="toast" id="sm-toast"></div>
</div></div>`;
const smRoot = document.createElement('div');
smRoot.id = 'sm';
smRoot.innerHTML = SM_HTML;
document.body.appendChild(smRoot);
(() => {
'use strict';

/* =====================================================================
   EINSTELLUNGEN – hier Texte, Level und Tasten anpassen
   ===================================================================== */
const CONFIG = {
  title: 'Monchichi Koop',
  storageKey: 'monchichi',                   // Präfix für den Spielstand im Browser
  characters: {
    monkey: { name: 'Affe',        skill: 'Haken · Wandsprung' },
    pig:    { name: 'Schweinchen', skill: 'Schirm (segeln) · Wandsprung' }
  },
  levels: [],                                // Reihenfolge aus levels/worlds.json, Namen aus levels/levels.json (+ „Coming soon“ bis Level SLOTS)
  worlds: [],                                // levels/worlds.json (Welten: id, name, titel, reihenfolge, level, boss)
  slots: 6,
  tip: 'Wandsprung: an der Wand springen und dabei von der Wand weg steuern. Im Spiel: Esc / Options = Pause, M = Ton aus/an.'
};
// Tasten je Figur – hängen davon ab, wer welche Figur spielt (Spielerwahl)
function controlsData(view) {
  const mP = lastPlayers.monkey, fP = 3 - mP;
  if (view === 'gamepad') {
    return {
      monkey: [['Controller', ['Nr. ' + mP]], ['Bewegen', ['Stick']], ['Springen', ['✕']], ['Haken', ['□']], ['Seil ran / geben', ['↑', '↓']], ['Hebel', ['○']]],
      pig:    [['Controller', ['Nr. ' + fP]], ['Bewegen', ['Stick']], ['Springen', ['✕']], ['Schirm (halten)', ['□']], ['Hebel', ['○']]]
    };
  }
  const K = {
    1: { move: ['A', 'D'], jump: ['Leertaste'], ab: ['G'], rope: ['W', 'S'], use: ['J'] },
    2: { move: ['←', '→'], jump: ['Num 0'], ab: ['Num 1'], rope: ['↑', '↓'], use: ['Num 2'] }
  };
  const m = K[mP], f = K[fP];
  return {
    monkey: [['Bewegen', m.move], ['Springen', m.jump], ['Haken', m.ab], ['Seil ran / geben', m.rope], ['Hebel', m.use]],
    pig:    [['Bewegen', f.move], ['Springen', f.jump], ['Schirm (halten)', f.ab], ['Hebel', f.use]]
  };
}
const realCount = () => CONFIG.levels.filter(l => !l.soon).length || 1;
let currentLevelNo = 0;
let levelsReady = null;                     // Promise: levels.json geladen                      // gerade gespieltes Level aus der Levelauswahl (0 = anderes)

/* ===== Hilfsfunktionen ===== */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mk = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const store = {
  get(k, d) { try { const v = localStorage.getItem(CONFIG.storageKey + '.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(CONFIG.storageKey + '.' + k, JSON.stringify(v)); } catch (e) { /* ignorieren */ } }
};

/* ===== Spielstand =====
   Ab Ausbau 1 merkt sich der Spielstand Level über ihren DATEINAMEN (z. B. "level-3.json") statt über die Nummer –
   so bleibt alles richtig, wenn Level in Welten einsortiert oder umsortiert werden.
   Format (v: 2): { v, played, unlocked: [Dateien], completed: [Dateien], stats: { Datei: {m, f} } }
   Alter Spielstand (Nummern 1–6) wird beim ersten Start umgerechnet; das Original bleibt unverändert als
   Sicherungskopie unter "monchichi.save_v1_backup" im Browser. */
// Reihenfolge der Levelkarten zur Zeit des alten Spielstands (Nummer n = LEGACY_LEVEL_ORDER[n - 1])
const LEGACY_LEVEL_ORDER = ['level-1.json', 'level-2.json', 'level-3.json', 'level-4.json', 'level-5.json', 'level-6.json'];
const blankSave = () => ({ v: 2, played: false, unlocked: [], completed: [], stats: {} });
function migrateSave(raw) {
  if (!raw || typeof raw !== 'object') return blankSave();
  if (raw.v === 2) return Object.assign(blankSave(), raw);
  // alter Stand: erst unverändert sichern (nur einmal – eine vorhandene Sicherung wird nie überschrieben)
  if (store.get('save_v1_backup', null) === null) store.set('save_v1_backup', raw);
  const file = n => LEGACY_LEVEL_ORDER[n - 1];
  const out = blankSave();
  out.played = !!raw.played;
  const u = Math.max(1, Math.min(LEGACY_LEVEL_ORDER.length, Number(raw.unlocked) || 1));
  out.unlocked = LEGACY_LEVEL_ORDER.slice(0, u);
  out.completed = (Array.isArray(raw.completed) ? raw.completed : []).map(Number).filter(n => file(n)).map(file);
  out.completed = out.completed.filter((f, i) => out.completed.indexOf(f) === i);
  for (const f of out.completed) if (!out.unlocked.includes(f)) out.unlocked.push(f);
  for (const k in (raw.stats || {})) if (file(Number(k))) out.stats[file(Number(k))] = raw.stats[k];
  return out;
}
let save = migrateSave(store.get('save', null));
const persist = () => store.set('save', save);
persist();
// Abfragen je Levelkarte (Index i in CONFIG.levels): das erste Level ist immer offen
const fileOf = i => CONFIG.levels[i] && !CONFIG.levels[i].soon ? CONFIG.levels[i].datei : null;
const isUnlocked = i => {
  if (!fileOf(i)) return false;
  if (typeof mapWorlds !== 'function' || !CONFIG.levels.length) return i === 0 || save.unlocked.includes(fileOf(i));
  const w = worldOfIndex(i);
  if (!w || !worldUnlocked(w)) return false;
  return i === w.idx[0] || save.unlocked.includes(fileOf(i));        // in der Welt: Level für Level
};
const isDone = i => !!fileOf(i) && save.completed.includes(fileOf(i));
const lastUnlocked = () => { let k = 0; for (let i = 0; i < realCount(); i++) if (isUnlocked(i)) k = i; return k; };

/* ===== Welten (Ausbau 3) =====
   Die Weltkarte zeigt die Welten aus worlds.json in ihrer Reihenfolge; jede kennt ihre Level als Index in CONFIG.levels
   (idx). Level ohne Welt (oder ganz ohne worlds.json) bilden am Ende eine eigene Gruppe „Weitere Level“.
   Freischaltung: die erste Welt mit Leveln ist immer offen; die nächste öffnet, wenn alle Level (später auch der Boss)
   der vorigen Welt mit Leveln geschafft sind. Welten ohne Level („Bald“, z. B. Wasser) sind nicht anwählbar und
   werden übersprungen. Ein schon freigeschaltetes Level einer Welt (alter Spielstand, „Alle Level freischalten“)
   öffnet sie ebenfalls. In der Welt geht es wie bisher Level für Level. */
function mapWorlds() {
  const ws = (CONFIG.worlds || []).filter(w => w && w.id).slice().sort((a, b) => (a.reihenfolge || 0) - (b.reihenfolge || 0))
    .map(w => ({ id: w.id, name: w.name || w.id, titel: w.titel || w.name || w.id, boss: w.boss || null,
                 idx: CONFIG.levels.map((l, i) => i).filter(i => !CONFIG.levels[i].soon && CONFIG.levels[i].welt === w.id) }));
  const rest = CONFIG.levels.map((l, i) => i).filter(i => !CONFIG.levels[i].soon && !(CONFIG.levels[i].welt && ws.some(w => w.id === CONFIG.levels[i].welt)));
  if (rest.length) ws.push({ id: '_rest', name: ws.length ? 'Weitere Level' : 'Level', titel: ws.length ? 'Weitere Level' : 'Level', boss: null, idx: rest });
  return ws;
}
const worldById = id => mapWorlds().find(w => w.id === id) || null;
const worldOfIndex = i => mapWorlds().find(w => w.idx.includes(i)) || null;
const worldDone = w => w.idx.length > 0 && w.idx.every(isDone);   // + Boss, sobald es Bosse gibt (Ausbau 6)
function worldUnlocked(w, ws) {
  ws = ws || mapWorlds();
  if (!w || !w.idx.length) return false;                              // „Bald“: noch keine Level
  const k = ws.findIndex(x => x.id === w.id);
  const prev = ws.slice(0, k).filter(x => x.idx.length).pop();
  if (!prev) return true;                                             // erste Welt mit Leveln
  return worldDone(prev) || w.idx.some(i => save.unlocked.includes(fileOf(i)));
}
let lastPlayers = { monkey: 1, pig: 2 };

/* =====================================================================
   FIGUREN (SVG, Gradienten sind oben in <defs>)
   ===================================================================== */
function monkeySVG() {
  return `<svg class="char monkey" viewBox="0 -14 220 240" aria-hidden="true">
  <circle cx="26" cy="118" r="30" fill="url(#sm-gMonkey)"/><circle cx="26" cy="118" r="16" fill="#e9a58f"/>
  <circle cx="194" cy="118" r="30" fill="url(#sm-gMonkey)"/><circle cx="194" cy="118" r="16" fill="#e9a58f"/>
  <circle cx="110" cy="122" r="94" fill="url(#sm-gMonkey)"/>
  <path d="M104 30C92 8 118-2 126 14c4 8-4 16-12 14" fill="none" stroke="#5a3219" stroke-width="10" stroke-linecap="round"/>
  <path d="M110 76C74 52 34 84 38 126c4 42 40 72 72 72s68-30 72-72c4-42-36-74-72-50z" fill="url(#sm-gFace)"/>
  <g class="look"><g class="blink" style="transform-origin:110px 124px">
    <ellipse cx="78" cy="124" rx="12.5" ry="15" fill="#25140a"/><circle cx="82" cy="118" r="4.8" fill="#fff"/><circle cx="73" cy="131" r="2.2" fill="#fff"/>
    <ellipse cx="142" cy="124" rx="12.5" ry="15" fill="#25140a"/><circle cx="146" cy="118" r="4.8" fill="#fff"/><circle cx="137" cy="131" r="2.2" fill="#fff"/>
  </g></g>
  <path d="M62 104Q78 94 94 103M126 103Q142 94 158 104" fill="none" stroke="#4a2813" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="58" cy="152" rx="12" ry="7" fill="#ff8f8f" opacity=".4"/><ellipse cx="162" cy="152" rx="12" ry="7" fill="#ff8f8f" opacity=".4"/>
  <ellipse cx="110" cy="147" rx="7" ry="5" fill="#6b3d22"/>
  <path d="M90 160Q110 180 130 160" fill="none" stroke="#5a3219" stroke-width="5" stroke-linecap="round"/>
  <circle cx="110" cy="122" r="94" fill="url(#sm-gShade)"/>
  <circle cx="110" cy="122" r="92" fill="none" stroke="url(#sm-gRim)" stroke-width="5"/>
</svg>`;
}
function pigSVG() {
  return `<svg class="char pig" viewBox="0 -14 220 240" aria-hidden="true">
  <path d="M34 86C14 46 26 14 74 30 56 44 50 62 50 90z" fill="url(#sm-gPig)"/><path d="M44 72C34 50 40 36 62 40 54 50 52 60 52 74z" fill="#ffc0d3" opacity=".8"/>
  <path d="M186 86C206 46 194 14 146 30 164 44 170 62 170 90z" fill="url(#sm-gPig)"/><path d="M176 72C186 50 180 36 158 40 166 50 168 60 168 74z" fill="#ffc0d3" opacity=".8"/>
  <circle cx="110" cy="122" r="94" fill="url(#sm-gPig)"/>
  <g class="look"><g class="blink" style="transform-origin:110px 106px">
    <ellipse cx="72" cy="106" rx="11.5" ry="14.5" fill="#35101f"/><circle cx="76" cy="100" r="4.8" fill="#fff"/><circle cx="67" cy="113" r="2.2" fill="#fff"/>
    <ellipse cx="148" cy="106" rx="11.5" ry="14.5" fill="#35101f"/><circle cx="152" cy="100" r="4.8" fill="#fff"/><circle cx="143" cy="113" r="2.2" fill="#fff"/>
  </g></g>
  <path d="M56 86Q72 76 88 85M132 85Q148 76 164 86" fill="none" stroke="#a82f5c" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="44" cy="136" rx="13" ry="8" fill="#ff6f98" opacity=".45"/><ellipse cx="176" cy="136" rx="13" ry="8" fill="#ff6f98" opacity=".45"/>
  <ellipse cx="110" cy="152" rx="40" ry="26" fill="url(#sm-gSnout)" stroke="#e0628f" stroke-width="3"/>
  <ellipse cx="97" cy="152" rx="6" ry="9" fill="#b83a65"/><ellipse cx="123" cy="152" rx="6" ry="9" fill="#b83a65"/>
  <path d="M90 186Q110 202 130 186" fill="none" stroke="#b83a65" stroke-width="5" stroke-linecap="round"/>
  <circle cx="110" cy="122" r="94" fill="url(#sm-gShade)"/>
  <circle cx="110" cy="122" r="92" fill="none" stroke="url(#sm-gRim)" stroke-width="5"/>
</svg>`;
}
const charSVG = k => (k === 'monkey' ? monkeySVG() : pigSVG());
// schlichte Linien-Icons (statt Emojis) für Packages / Umkleide
const ICON = {
  pack: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="8.5" width="17" height="12" rx="2"/><path d="M3.5 12.5h17M12 8.5v12"/><path d="M12 8.5C10.6 5.2 6.8 4.6 6.8 6.9S10.2 8.5 12 8.5zM12 8.5c1.4-3.3 5.2-3.9 5.2-1.6S13.8 8.5 12 8.5z"/></svg>',
  hanger: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 5.6a2 2 0 1 1 2 2v1.3"/><path d="M12 8.9 3.3 15.2a1.4 1.4 0 0 0 .8 2.5h15.8a1.4 1.4 0 0 0 .8-2.5L12 8.9z"/></svg>',
  // Boss (Totenkopf mit Krone) und Schloss – für Weltkarte und Boss-Karte (Ausbau 3)
  skull: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7.5 8.5 4.5 10.5 6.5 12 3.5 13.5 6.5 15.5 4.5 17 7.5"/><path d="M5.5 13a6.5 6 0 1 1 13 0c0 2-1 3-2.2 3.6V19a1 1 0 0 1-1 1H8.7a1 1 0 0 1-1-1v-2.4C6.5 16 5.5 15 5.5 13Z"/><circle cx="9.3" cy="12.6" r="1.4"/><circle cx="14.7" cy="12.6" r="1.4"/><path d="M11 20v-2M13 20v-2"/></svg>',
  lock: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><path d="M12 14.5v2.5"/></svg>'
};
// das Geschenkpaket als kleines Bild (Belohnung im Statistik-Bildschirm): oranges Papier, braunes Satinband,
// leicht schräg von vorn (wie im Packages-Bildschirm, 28-packages.js)
const giftSVG = () => `<svg class="gift" viewBox="-84 -92 176 186" aria-hidden="true">
  <ellipse cx="-4" cy="84" rx="86" ry="10" fill="rgba(0,0,0,.35)"/>
  <polygon points="-66,-16 44,-16 44,80 -66,80" fill="#f58a2c" stroke="#8a3c08" stroke-width="2.5"/>
  <polygon points="44,-16 66,-26 66,70 44,80" fill="#b8520b" stroke="#8a3c08" stroke-width="2.5"/>
  <rect x="-22" y="-16" width="22" height="96" fill="#4a2c1c"/><rect x="-66" y="24" width="110" height="16" fill="#4a2c1c"/>
  <polygon points="44,24 66,14 66,30 44,40" fill="#4a2c1c"/>
  <polygon points="-74,-42 -52,-52 74,-52 52,-42" fill="#ffb766" stroke="#8a3c08" stroke-width="2.5"/>
  <polygon points="-74,-42 52,-42 52,-14 -74,-14" fill="#ff9a3c" stroke="#8a3c08" stroke-width="2.5"/>
  <polygon points="52,-42 74,-52 74,-24 52,-14" fill="#c85a0c" stroke="#8a3c08" stroke-width="2.5"/>
  <rect x="-22" y="-42" width="22" height="28" fill="#4a2c1c"/><polygon points="-22,-42 0,-52 22,-52 0,-42" fill="#4a2c1c"/>
  <path d="M0 -47C-12 -75 -44 -77 -38 -53C-32 -43 -12 -45 0 -47ZM0 -47C12 -75 44 -77 38 -53C32 -43 12 -45 0 -47Z" fill="#6a4030" stroke="#2a160c" stroke-width="2"/>
  <ellipse cx="0" cy="-49" rx="8" ry="7" fill="#4a2c1c" stroke="#2a160c" stroke-width="2"/></svg>`;

/* =====================================================================
   DSCHUNGEL-HINTERGRUND
   ===================================================================== */
function frond(x, y, rot, len, color, op) {
  const P1 = [len * .5, -len * .42], P2 = [len, len * .12], N = 17;
  let d = '';
  for (let i = 1; i <= N; i++) {
    const t = i / N, u = 1 - t;
    const bx = 2 * u * t * P1[0] + t * t * P2[0], by = 2 * u * t * P1[1] + t * t * P2[1];
    const dx = 2 * u * P1[0] + 2 * t * (P2[0] - P1[0]), dy = 2 * u * P1[1] + 2 * t * (P2[1] - P1[1]);
    const m = Math.hypot(dx, dy), tx = dx / m, ty = dy / m, nx = -ty, ny = tx;
    const L = len * .2 * (Math.sin(Math.PI * Math.min(1, t * 1.05)) * .85 + .15);
    for (const s of [1, -1]) d += `M${bx.toFixed(1)} ${by.toFixed(1)}L${(bx + nx * L * s + tx * L * .55).toFixed(1)} ${(by + ny * L * s + ty * L * .55).toFixed(1)}`;
  }
  return `<g transform="translate(${x} ${y}) rotate(${rot})" fill="none" stroke="${color}" stroke-linecap="round" opacity="${op}">
    <path d="${d}" stroke-width="${(len * .036).toFixed(1)}"/><path d="M0 0Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}" stroke-width="${(len * .022).toFixed(1)}"/></g>`;
}
function buildBackground() {
  const trunks = [120, 330, 640, 980, 1290, 1500].map((x, i) =>
    `<rect x="${x}" y="0" width="${20 + (i % 3) * 8}" height="900" fill="#0b4631" opacity="${.35 + (i % 2) * .15}"/>`).join('');
  const vines = [210, 560, 900, 1180, 1420].map((x, i) =>
    `<path d="M${x} -10C${x + 30} 190 ${x - 34} 330 ${x + 12} ${420 + i * 40}" fill="none" stroke="#0c4a34" stroke-width="5" stroke-linecap="round" opacity=".8"/>`).join('');
  $('#sm-bg').innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="sm-bgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d4a38"/><stop offset=".55" stop-color="#06271d"/><stop offset="1" stop-color="#020d09"/></linearGradient>
      <radialGradient id="sm-bgGlow" cx=".5" cy=".48" r=".55"><stop offset="0" stop-color="#d4ff7a" stop-opacity=".34"/><stop offset="1" stop-color="#d4ff7a" stop-opacity="0"/></radialGradient>
      <linearGradient id="sm-bgFog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe0b0" stop-opacity="0"/><stop offset="1" stop-color="#7fe0b0" stop-opacity=".28"/></linearGradient>
      <radialGradient id="sm-bgVig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#sm-bgSky)"/>
    <ellipse cx="800" cy="430" rx="760" ry="420" fill="url(#sm-bgGlow)"/>
    ${trunks}
    ${frond(-40, 90, 25, 820, '#0f5a40', .5)}${frond(1640, 70, 155, 840, '#0f5a40', .5)}${frond(800, -50, 90, 620, '#0d4d37', .38)}
    ${frond(-60, 270, 8, 920, '#0b402e', .85)}${frond(1660, 310, 172, 920, '#0b402e', .85)}
    ${frond(300, -70, 62, 720, '#0a3828', .85)}${frond(1300, -70, 118, 720, '#0a3828', .85)}
    ${vines}
    <rect y="520" width="1600" height="380" fill="url(#sm-bgFog)"/>
    ${frond(-100, -50, 36, 980, '#04170f', .96)}${frond(1700, -50, 144, 980, '#04170f', .96)}
    ${frond(-80, 980, -32, 820, '#031009', 1)}${frond(1680, 990, -148, 820, '#031009', 1)}
    <rect width="1600" height="900" fill="url(#sm-bgVig)"/>
  </svg><div class="rays"><i></i><i></i><i></i></div>`;
}

/* =====================================================================
   SOUND – kleine Klänge und eine Spieluhr-Melodie, komplett erzeugt
   ===================================================================== */
const Snd = (() => {
  // Menü-Klänge kommen aus dem Spiel (18-sound.js), die Musik läuft wie im Spiel weiter;
  // die Regler steuern die Lautstärke des Spiels (VOL in 07-effekte-ton-muenzen.js)
  const vol = { get master() { return VOL.master; }, get music() { return VOL.music; }, get sfx() { return VOL.sfx; } };
  const soft = ['move', 'back', 'tick', 'locked', 'swap'];
  function play(name) {
    if (typeof SFX === 'undefined') return;
    if (soft.includes(name)) SFX.menuTick(); else SFX.menuOk();
  }
  function resume() { if (typeof sfxPrepare === 'function') sfxPrepare(); }
  function setVol(k, v) { setVolume(k, v / 100); }
  return { vol, play, start: resume, stop() {}, setVol, resume };
})();

/* =====================================================================
   SCREEN-VERWALTUNG
   ===================================================================== */
const S = {};
let cur = null, lock = 0;
function go(name, arg) {
  const next = S[name]; if (!next) return;
  if (cur) { if (cur.leave) cur.leave(); cur.el.classList.remove('active'); }
  cur = next; cur.el.classList.add('active');
  lock = performance.now() + 280;
  if (cur.enter) cur.enter(arg);
}

/* ---- Dialog ---- */
let modal = null;
function showModal({ title, text, buttons }) {
  $('#sm-modal-title').textContent = title;
  $('#sm-modal-text').textContent = text;
  const box = $('#sm-modal-btns'); box.innerHTML = '';
  buttons.forEach((b, i) => {
    const btn = mk(`<button class="btn" type="button" tabindex="-1">${b.label}</button>`);
    btn.addEventListener('click', () => { modal.idx = i; chooseModal(); });
    box.appendChild(btn);
  });
  const p = buttons.findIndex(b => b.primary);
  modal = { buttons, idx: p >= 0 ? p : 0 };
  $('#sm-modal').classList.add('on'); paintModal();
  lock = performance.now() + 250;
}
function paintModal() { $$('#sm-modal-btns .btn').forEach((b, i) => b.classList.toggle('sel', i === modal.idx)); }
function closeModal() { $('#sm-modal').classList.remove('on'); modal = null; lock = performance.now() + 200; }
function chooseModal() { const b = modal.buttons[modal.idx]; Snd.play('ok'); closeModal(); if (b.onClick) b.onClick(); }
function modalAct(type) {
  const n = modal.buttons.length;
  if (type === 'left' || type === 'up') { modal.idx = (modal.idx + n - 1) % n; paintModal(); Snd.play('move'); }
  else if (type === 'right' || type === 'down') { modal.idx = (modal.idx + 1) % n; paintModal(); Snd.play('move'); }
  else if (type === 'confirm') chooseModal();
  else if (type === 'back') { const c = modal.buttons.findIndex(b => b.cancel); if (c >= 0) { modal.idx = c; chooseModal(); } }
}
function toast(msg) {
  const t = $('#sm-toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2200);
}
function dispatch(type, src) {
  if (!active()) return;
  if (performance.now() < lock) return;
  if (modal) { modalAct(type); return; }
  if (cur && cur.act) cur.act(type, src);
}

/* ---- Spiel-Anbindung ---- */
async function playLevel(i) {
  await levelsReady;                          // Levelliste evtl. noch unterwegs
  const lvl = CONFIG.levels[i];
  if (!lvl || lvl.soon) return;
  Snd.play('start');
  save.played = true; persist();
  let data = null, why = '';
  // Level-Datei holen: bis zu 3 Versuche (kurze Netz-Aussetzer), danach Fehler mit Grund anzeigen
  for (let tryNo = 0; tryNo < 3 && !data; tryNo++) {
    try {
      const r = await fetch(PROJECT_LEVELS + encodeURIComponent(lvl.datei) + (tryNo ? '?t=' + Date.now() : ''), { cache: 'no-store' });
      if (!r.ok) { why = 'Datei nicht erreichbar (HTTP ' + r.status + ')'; await wait(300); continue; }
      data = JSON.parse(await r.text());
    } catch (e) { why = (e && e.message) || String(e); await wait(300); }
  }
  if (!data) { levelLoadFailed(lvl, why); return; }
  try {
    await curtainIntoLevel(i + 1, lvl.name, () => {
      setMonkeyPlayer(lastPlayers.monkey);
      currentLevelNo = i + 1;
      hideMenu();
      startLevel(data);                      // 16-menue.js: Level aufbauen
      menuScreen = 'curtain';                // Spiel steht still, bis die Blätter auf sind (Figuren stehen am Start)
    });
  } catch (e) {
    levelLoadFailed(lvl, (e && e.message) || String(e));
  }
}
// Level ließ sich nicht starten: zurück zur Levelauswahl und den Grund anzeigen (statt still zurückzuspringen)
function levelLoadFailed(lvl, why) {
  console.error('Level konnte nicht geladen werden:', lvl && lvl.datei, why);
  curtainEl.className = ''; currentLevelNo = 0;
  showMenuScreen('levels', 'keep');
  showModal({ title: 'Level konnte nicht starten', text: (lvl ? lvl.name + ': ' : '') + why + ' – bitte Seite neu laden (Strg + F5) und nochmal versuchen.',
              buttons: [{ label: 'OK', primary: true, cancel: true }] });
}
/* ---- Blätter-Vorhang mit Titeltafel: Menü -> Level ---- */
const wait = ms => new Promise(res => setTimeout(res, ms));
// Vorhang aus EINZELNEN Blättern: jedes Blatt fliegt vom nächsten Bildrand an seinen Platz (außen zuerst,
// zur Mitte hin später), bis das Bild ganz voller Blätter ist; beim Öffnen fliegen sie wieder hinaus.
// Fester Zufall, damit es immer gleich aussieht.
function curtainLeaves() {
  let seed = 11;
  const R = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const grads = [['#04210f', '#0b3f22'], ['#0a3a20', '#17602f'], ['#11552c', '#2b8a3e'], ['#1d7a37', '#4fb053'], ['#2f8f3f', '#7ccf63']];
  let defs = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>';
  grads.forEach((g, k) => { defs += `<linearGradient id="lfg${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></linearGradient>`; });
  defs += '</defs></svg>';
  // Blattformen in einem Feld 0..300 × -60..60 (Spitze rechts)
  const slim = k => {
    let v = '';
    for (let a = 0.18; a < 0.9; a += 0.14) v += `M${300*a} 0L${300*(a+0.09)} ${-33*(1-a)}M${300*a} 0L${300*(a+0.09)} ${33*(1-a)}`;
    return `<path d="M0 0C75 -60 210 -48 300 0C210 48 75 60 0 0Z" fill="url(#lfg${k})" stroke="rgba(0,0,0,.25)" stroke-width="2"/>` +
           `<path d="M0 0L288 0${v}" stroke="rgba(0,20,8,.35)" stroke-width="2.2" fill="none"/>`;
  };
  const heart = k =>
    `<path d="M0 0C30 -66 255 -72 300 0C255 72 30 66 0 0Z" fill="url(#lfg${k})" stroke="rgba(0,0,0,.25)" stroke-width="2"/>` +
    `<path d="M105 -51L144 -12M186 -48L198 -9M114 51L150 12M192 47L204 8" stroke="rgba(3,30,14,.55)" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M0 0L285 0" stroke="rgba(0,20,8,.4)" stroke-width="3" fill="none"/>`;
  const palm = k => {
    let f = `<path d="M0 0Q150 -20 300 0" stroke="url(#lfg${k})" stroke-width="5" fill="none"/>`;
    for (let a = 0.08; a < 0.97; a += 0.06) {
      const x = 300*a, y = -20*4*a*(1-a), l = 70*Math.sin(Math.PI*Math.min(1, a*1.1));
      f += `<path d="M${x} ${y}Q${x + l*.5} ${y - l*.6} ${x + l*.9} ${y - l*.55}M${x} ${y}Q${x + l*.5} ${y + l*.6} ${x + l*.9} ${y + l*.65}" stroke="url(#lfg${k})" stroke-width="${7*(1.1-a)}" stroke-linecap="round" fill="none"/>`;
    }
    return f;
  };
  let html = defs;
  // drei Schichten: hinten große dunkle, Mitte, vorne kleinere helle Blätter – Raster mit Zufall, dicht überlappend
  const layers = [[0, 9, 6, 30], [1, 10, 7, 26], [2, 9, 6, 22], [3, 8, 5, 18], [4, 6, 4, 14]];
  for (const [k, cols, rows, size] of layers) {
    for (let a = 0; a < cols; a++) for (let b = 0; b < rows; b++) {
      const cx = (a + 0.5 + (R() - 0.5)*0.9) / cols * 112 - 6, cy = (b + 0.5 + (R() - 0.5)*0.9) / rows * 112 - 6;   // Mitte in %
      const len = size*(0.8 + R()*0.5);                     // Blattlänge in vw
      const rot = (cx < 50 ? 0 : 180) + (R() - 0.5)*140;    // grob zur Bildmitte zeigend
      const dx = cx - 50, dy = (cy - 50)*0.6, dl = Math.hypot(dx, dy) || 1;
      const fx = dx/dl*90, fy = dy/dl*70;                  // Anflug vom nächsten Rand (vw / vh)
      const delay = (1 - Math.min(1, dl/60))*0.32 + R()*0.08 + k*0.03;
      const kind = R(), shape = kind < 0.45 ? slim(k) : kind < 0.75 ? heart(k) : palm(k);
      html += `<div class="leaf" style="left:${(cx).toFixed(1)}%;top:${cy.toFixed(1)}%;width:${len.toFixed(1)}vw;height:${(len*0.4).toFixed(1)}vw;` +
              `--fx:${fx.toFixed(0)}vw;--fy:${fy.toFixed(0)}vh;--r0:${(rot + (R() - 0.5)*160).toFixed(0)}deg;--r:${rot.toFixed(0)}deg;--d:${delay.toFixed(2)}s">` +
              `<svg viewBox="0 -60 300 120" preserveAspectRatio="none">${shape}</svg></div>`;
    }
  }
  return html;
}
const curtainEl = document.createElement('div');
curtainEl.id = 'leafCurtain';
curtainEl.innerHTML = '<div class="cbg"></div>' + curtainLeaves() + `<div class="lt"><div><b class="lt-n"></b><span class="lt-name"></span></div></div>`;
document.body.appendChild(curtainEl);
async function curtainIntoLevel(no, name, build) {
  menuScreen = 'curtain';
  curtainEl.querySelector('.lt-n').textContent = 'Level ' + no;
  curtainEl.querySelector('.lt-name').textContent = name;
  curtainEl.className = 'on'; void curtainEl.offsetWidth;
  curtainEl.className = 'on closed';               // Blätter fliegen zusammen
  await wait(1050);
  build();                                         // hinter den Blättern: Level aufbauen, Figuren bereit
  curtainEl.className = 'on closed title';         // Titeltafel
  await wait(1400);
  curtainEl.className = 'on closed';
  await wait(250);
  curtainEl.className = 'on';                      // Blätter fliegen wieder hinaus
  await wait(1050);
  curtainEl.className = '';
  menuScreen = null; menuClearPressed();           // jetzt läuft das Spiel (zuerst die Ankunft)
}
// Level n (Nummer der Levelkarte, 1 …) geschafft: merken und das nächste Level DIESER Welt freischalten.
// Ist damit die ganze Welt geschafft, öffnet die nächste Welt mit Leveln (ihr erstes Level wird freigeschaltet);
// deren id steht dann in lastFreshWorld (für die Freischalt-Animation auf der Weltkarte).
let lastFreshWorld = null;
function completeLevel(n, quiet) {
  const i = n - 1, f = fileOf(i);
  const ws = mapWorlds(), w = ws.find(x => x.idx.includes(i));
  const wasOpen = ws.map(x => worldUnlocked(x, ws));
  if (f && !save.completed.includes(f)) save.completed.push(f);
  if (f && !save.unlocked.includes(f)) save.unlocked.push(f);
  lastFreshWorld = null;
  let next = null;
  if (w) {
    const pos = w.idx.indexOf(i);
    if (pos < w.idx.length - 1) next = w.idx[pos + 1];                 // nächstes Level der Welt
    else {                                                            // letztes Level: nächste Welt mit Leveln
      const k = ws.indexOf(w), nw = ws.slice(k + 1).find(x => x.idx.length);
      if (nw && !wasOpen[ws.indexOf(nw)] && worldUnlocked(nw, ws)) { lastFreshWorld = nw.id; next = nw.idx[0]; }
    }
  } else if (n < realCount()) next = i + 1;
  const fresh = next !== null && !!fileOf(next) && !save.unlocked.includes(fileOf(next));
  if (fresh) save.unlocked.push(fileOf(next));
  persist();
  if (!quiet) toast(lastFreshWorld ? `Welt ${(worldById(lastFreshWorld) || {}).name} freigeschaltet!` : fresh ? `Level ${next + 1} freigeschaltet!` : `Level ${n} geschafft!`);
  return fresh ? next + 1 : 0;   // neu freigeschaltetes Level (0 = keins)
}
// Neues Spiel: ALLES von vorn – freigeschaltete Level, Statistik, Packages, Items/Skins (angelegt + besessen), Münz-Konto
function resetSave() {
  save = blankSave(); persist();
  if (typeof cosmeticsReset === 'function') cosmeticsReset();      // 26-kosmetik-daten.js
  if (typeof cosResetState === 'function') cosResetState();
}

/* =====================================================================
   1) TITEL
   ===================================================================== */
S.title = {
  el: $('#sm-s-title'), done: false,
  enter() { this.done = false; },
  act(type, src) {
    if (this.done) return; this.done = true;
    if (src !== 'pad0' && src !== 'pad1') goFullscreen();   // Controller dürfen kein Vollbild auslösen (Browser)
    Snd.start(); Snd.play('hop');
    $$('.bob', this.el).forEach(h => { h.style.animation = 'hop .5s cubic-bezier(.3,1.6,.5,1)'; });
    setTimeout(() => { $$('.bob', this.el).forEach(h => { h.style.animation = ''; }); go('menu'); }, 450);
  }
};
S.title.el.addEventListener('pointerdown', () => { Snd.resume(); dispatch('any', 'ptr'); });

/* =====================================================================
   2) MENÜ
   ===================================================================== */
const nod = () => $$('#sm-s-menu .bob').forEach(d => {
  d.classList.remove('nod'); void d.offsetWidth; d.classList.add('nod');
  setTimeout(() => d.classList.remove('nod'), 520);
});
S.menu = {
  el: $('#sm-s-menu'), idx: 0, items: [],
  enter() {
    this.items = [
      { id: 'play', label: 'Spielen' },
      save.played && { id: 'continue', label: 'Fortfahren' },
      { id: 'options', label: 'Optionen' },
      { id: 'quit', label: 'Beenden' }
    ].filter(Boolean);
    this.idx = clamp(this.idx, 0, this.items.length - 1);
    const box = $('#sm-menu'); box.innerHTML = '';
    this.items.forEach((it, i) => {
      const b = mk(`<button class="mi" type="button" tabindex="-1">${it.label}</button>`);
      b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') this.sel(i); });
      b.addEventListener('click', () => { this.sel(i); this.activate(); });
      box.appendChild(b);
    });
    this.paint();
  },
  paint() { $$('#sm-menu .mi').forEach((b, i) => b.classList.toggle('sel', i === this.idx)); },
  sel(i) { if (i === this.idx) return; this.idx = i; this.paint(); Snd.play('move'); nod(); },
  act(type) {
    const n = this.items.length;
    if (type === 'up') this.sel((this.idx + n - 1) % n);
    else if (type === 'down') this.sel((this.idx + 1) % n);
    else if (type === 'confirm') this.activate();
  },
  activate() {
    const id = this.items[this.idx].id;
    Snd.play('ok');
    if (id === 'play') {
      if (save.played) {
        showModal({
          title: 'Neues Spiel starten?',
          text: 'Dein kompletter Spielstand wird gelöscht: freigeschaltete Level, Packages, Items/Skins und Münzen. Ihr fangt ganz von vorne an.',
          buttons: [
            { label: 'Abbrechen', cancel: true, primary: true },
            { label: 'Neues Spiel', onClick: () => go('select', 'new') }
          ]
        });
      } else go('select', 'new');
    }
    else if (id === 'continue') go('map');              // Fortfahren: Weltkarte -> Welt -> Level -> Spielerwahl
    else if (id === 'options') go('options');
    else if (id === 'quit') quitGame();
  }
};
function quitGame() {
  try { window.close(); } catch (e) { /* ignorieren */ }
  setTimeout(() => go('goodbye'), 200);
}

/* =====================================================================
   3) OPTIONEN
   ===================================================================== */
S.options = {
  el: $('#sm-s-options'), idx: 0, view: 'keyboard', rows: [],
  enter() {
    this.rows = [$('#sm-opt-seg'), $('#sm-row-master'), $('#sm-row-music'), $('#sm-row-sfx'), $('#sm-row-fs'), $('#sm-row-unlock'), $('#sm-opt-back')];
    this.idx = 0; this.drawControls(); this.syncVol(); this.paint();
  },
  paint() { this.rows.forEach((r, i) => r.classList.toggle('sel', i === this.idx)); },
  syncVol() {
    ['master', 'music', 'sfx'].forEach(k => {
      const r = $('#sm-r-' + k), v = Math.round(Snd.vol[k] * 100);
      r.value = v; r.style.setProperty('--p', v + '%'); $('#sm-v-' + k).textContent = v + ' %';
    });
  },
  setView(v) { this.view = v; this.drawControls(); },
  drawControls() {
    $$('#sm-opt-seg button').forEach(b => b.classList.toggle('on', b.dataset.view === this.view));
    const data = controlsData(this.view), box = $('#sm-ctrl-cards'); box.innerHTML = '';
    ['monkey', 'pig'].forEach(k => {
      const lines = data[k].map(([l, keys]) => `<div class="cl"><span>${l}</span><span class="keys">${keys.map(x => `<span class="key">${x}</span>`).join('')}</span></div>`).join('');
      box.appendChild(mk(`<div class="cc"><h5><span class="mini">${charSVG(k)}</span>${CONFIG.characters[k].name}</h5>${lines}</div>`));
    });
    $('#sm-ctrl-tip').textContent = CONFIG.tip;
  },
  toggleView() { this.setView(this.view === 'keyboard' ? 'gamepad' : 'keyboard'); Snd.play('swap'); },
  act(type) {
    const n = this.rows.length;
    if (type === 'up') { this.idx = (this.idx + n - 1) % n; this.paint(); Snd.play('move'); }
    else if (type === 'down') { this.idx = (this.idx + 1) % n; this.paint(); Snd.play('move'); }
    else if (type === 'left' || type === 'right') {
      if (this.idx === 0) this.toggleView();
      else if (this.idx <= 3) {
        const k = ['master', 'music', 'sfx'][this.idx - 1], r = $('#sm-r-' + k);
        r.value = clamp(+r.value + (type === 'left' ? -10 : 10), 0, 100);
        r.dispatchEvent(new Event('input'));
      }
    }
    else if (type === 'confirm') {
      if (this.idx === 0) this.toggleView();
      else if (this.idx === 4) toggleFullscreen();
      else if (this.idx === 5) unlockAll();
      else if (this.idx === 6) { Snd.play('back'); go('menu'); }
    }
    else if (type === 'back') { Snd.play('back'); go('menu'); }
  }
};
$$('#sm-opt-seg button').forEach(b => b.addEventListener('click', () => { S.options.idx = 0; S.options.paint(); S.options.setView(b.dataset.view); Snd.play('swap'); }));
['master', 'music', 'sfx'].forEach((k, i) => {
  const r = $('#sm-r-' + k);
  r.addEventListener('input', () => {
    Snd.setVol(k, +r.value);
    r.style.setProperty('--p', r.value + '%'); $('#sm-v-' + k).textContent = r.value + ' %';
    if (k !== 'music') Snd.play('move');
  });
  $('#sm-row-' + k).addEventListener('pointerdown', () => { S.options.idx = i + 1; S.options.paint(); });
});
$('#sm-opt-back').addEventListener('click', () => { Snd.play('back'); go('menu'); });
// zum Testen: alle fertigen Level sofort spielbar
function unlockAll() {
  for (let i = 0; i < realCount(); i++) if (fileOf(i) && !save.unlocked.includes(fileOf(i))) save.unlocked.push(fileOf(i));
  save.played = true; persist();
  Snd.play('ok'); toast('Alle Level freigeschaltet');
}
$('#sm-unlock').addEventListener('click', () => { S.options.idx = 5; S.options.paint(); unlockAll(); });
$('#sm-fs').addEventListener('click', () => { S.options.idx = 4; S.options.paint(); toggleFullscreen(); });
// Vollbild: geht nur nach einem Tastendruck/Klick (Browser-Regel) – deshalb beim ersten Tastendruck im Titelbild
function goFullscreen() {
  const el = document.documentElement;
  if (document.fullscreenElement || !el.requestFullscreen) return;
  try { const pr = el.requestFullscreen(); if (pr && pr.catch) pr.catch(() => {}); } catch (e) { /* nicht erlaubt */ }
}
// Im Vollbild Esc fürs Spiel behalten (Pause), statt das Vollbild zu verlassen: Tastatur-Sperre (Chrome/Edge).
// Dann beendet erst LANGES Halten von Esc das Vollbild (Hinweis zeigt der Browser). Andere Browser: Esc = raus.
function lockEscape() {
  const kb = navigator.keyboard;
  if (document.fullscreenElement && kb && kb.lock) { try { const pr = kb.lock(['Escape']); if (pr && pr.catch) pr.catch(() => {}); } catch (e) {} }
  else if (!document.fullscreenElement && kb && kb.unlock) { try { kb.unlock(); } catch (e) {} }
}
document.addEventListener('fullscreenchange', lockEscape);
function toggleFullscreen() {
  Snd.play('ok');
  if (document.fullscreenElement) { try { const pr = document.exitFullscreen(); if (pr && pr.catch) pr.catch(() => {}); } catch (e) {} }
  else goFullscreen();
}

/* =====================================================================
   4) SPIELERWAHL
   ===================================================================== */
const srcPlayer = s => ({ kbd1: 1, pad0: 1, kbd2: 2, pad1: 2 }[s] || 0);
const PKEYS = { 1: ['A', 'D', 'Leertaste'], 2: ['←', '→', 'Num 0'] };
S.select = {
  el: $('#sm-s-select'), mode: 'new', side: { 1: 'L', 2: 'R' }, ready: { 1: false, 2: false }, busy: false, timer: null, poll: null,
  enter(mode) {
    // mode: 'new' (Neues Spiel -> Level 1) oder {level: i} (aus der Levelauswahl)
    this.mode = mode || this.mode;
    this.side = { 1: 'L', 2: 'R' }; this.ready = { 1: false, 2: false }; this.busy = false;
    this.render(); this.padInfo(); this.poll = setInterval(() => this.padInfo(), 700);
  },
  leave() { clearInterval(this.poll); clearTimeout(this.timer); $('#sm-countdown').classList.remove('on'); },
  padInfo() {
    const n = (navigator.getGamepads ? Array.from(navigator.getGamepads()) : []).filter(p => p && p.connected !== false).length;
    $('#sm-pad-info').textContent = n === 0 ? '⌨ Tastatur' : n === 1 ? '🎮 Controller = Spieler 1' : '🎮 2 Controller';
  },
  playerOn(s) { return this.side[1] === s ? 1 : 2; },
  render() {
    const pl = this.playerOn('L'), pr = this.playerOn('R');
    this.el.style.setProperty('--cl', pl === 1 ? 'var(--cyan)' : 'var(--amber)');
    this.el.style.setProperty('--cr', pr === 1 ? 'var(--cyan)' : 'var(--amber)');
    [['L', pl], ['R', pr]].forEach(([s, p]) => {
      const r = this.ready[p], b = $('#sm-badge-' + s);
      b.className = `ptag glass ${s} pl${p}`;
      b.innerHTML = `<b>Spieler ${p}</b><span class="keys">${PKEYS[p].map(k => `<span class="key">${k}</span>`).join('')}</span><span class="ready ${r ? 'on' : 'off'}">${r ? 'Bereit ✓' : 'Springen drücken'}</span>`;
    });
    $('#sm-pc-monkey').classList.toggle('happy', this.ready[pl]);
    $('#sm-pc-pig').classList.toggle('happy', this.ready[pr]);
    ['monkey', 'pig'].forEach(k => { $('#sm-cn-' + k).innerHTML = `${CONFIG.characters[k].name}<small>${CONFIG.characters[k].skill}</small>`; });
  },
  unready() { this.ready = { 1: false, 2: false }; },
  act(type, src) {
    const p = srcPlayer(src);
    if (this.busy) { if (type === 'back') this.cancel(); return; }
    if (type === 'left' || type === 'right') {
      if (!p) return;
      const want = type === 'left' ? 'L' : 'R';
      if (this.side[p] !== want) {
        this.side[p] = want; this.side[3 - p] = want === 'L' ? 'R' : 'L';
        this.unready(); Snd.play('swap'); this.render();
      }
    }
    else if (type === 'confirm') {
      if (!p) return;
      this.ready[p] = !this.ready[p];
      Snd.play(this.ready[p] ? 'ready' : 'back'); this.render();
      if (this.ready[1] && this.ready[2]) this.countdown();
    }
    else if (type === 'back') {
      Snd.play('back');
      if (this.ready[1] || this.ready[2]) { this.unready(); this.render(); }
      else go(this.mode === 'new' ? 'menu' : 'levels', 'keep');
    }
  },
  countdown() {
    this.busy = true;
    const cd = $('#sm-countdown'), seq = ['3', '2', '1', 'Los!']; let i = 0;
    const tick = () => {
      cd.textContent = seq[i]; cd.classList.remove('on'); void cd.offsetWidth; cd.classList.add('on');
      Snd.play(i < 3 ? 'tick' : 'go'); i++;
      this.timer = setTimeout(i < seq.length ? tick : () => this.finish(), i < seq.length ? 750 : 700);
    };
    this.timer = setTimeout(tick, 350);
  },
  cancel() {
    clearTimeout(this.timer); this.busy = false;
    $('#sm-countdown').classList.remove('on'); this.unready(); this.render(); Snd.play('back');
  },
  finish() {
    lastPlayers = { monkey: this.playerOn('L'), pig: this.playerOn('R') };
    this.busy = false;
    if (this.mode === 'new') { resetSave(); playLevel(0); }
    else playLevel(this.mode.level);
  }
};
$('#sm-pc-monkey').addEventListener('click', () => S.select.act('left', 'kbd1'));
$('#sm-pc-pig').addEventListener('click', () => S.select.act('right', 'kbd1'));
$('#sm-go-btn').addEventListener('click', () => {
  const s = S.select; if (s.busy) return;
  s.ready = { 1: true, 2: true }; s.render(); Snd.play('ready'); s.countdown();
});

/* =====================================================================
   5) LEVEL-AUSWAHL
   ===================================================================== */
S.levels = {
  // Welt-Seite (Ausbau 3): die Level-Karten der gewählten Welt (this.list = Indizes in CONFIG.levels) + Boss-Karte.
  // this.idx = gewählte Karte in dieser Seite (this.list.length = Boss-Karte).
  el: $('#sm-s-levels'), idx: 0, world: null, list: [],
  enter(arg) {
    const unlock = arg && typeof arg === 'object' && arg.unlock >= 0 ? arg.unlock : -1;   // nach „Level geschafft“
    if (arg && typeof arg === 'object' && arg.world) this.world = arg.world;
    else if (unlock >= 0) this.world = (worldOfIndex(unlock) || {}).id;
    else if (arg !== 'keep' || !worldById(this.world)) this.world = (worldOfIndex(lastUnlocked()) || mapWorlds()[0] || {}).id;
    const w = worldById(this.world) || { id: null, name: 'Level', titel: 'Level', idx: [], boss: null };
    this.list = w.idx.slice();
    if (arg !== 'keep') {   // zurück aus der Spielerwahl: Auswahl behalten, sonst das letzte offene Level der Welt
      let k = 0; this.list.forEach((i, j) => { if (isUnlocked(i)) k = j; }); this.idx = k;
    }
    this.idx = clamp(this.idx, 0, this.list.length);
    this.top = '';
    $('#sm-l-title').textContent = w.name;
    $('#sm-l-world').textContent = w.titel && w.titel !== w.name ? w.titel : '';
    const box = $('#sm-cards'); box.innerHTML = '';
    this.list.forEach((i, j) => {
      const b = mk('<button class="lc" type="button" tabindex="-1"></button>');
      b.addEventListener('click', () => { if (this.idx === j) this.act('confirm'); else this.select(j); });
      box.appendChild(b);
    });
    const bc = mk('<button class="lc boss" type="button" tabindex="-1"></button>');   // Boss (kommt mit Ausbau 6)
    bc.addEventListener('click', () => { if (this.idx === this.list.length) this.act('confirm'); else this.select(this.list.length); });
    box.appendChild(bc);
    box.appendChild(mk(`<div class="pair nt" id="sm-pair">${monkeySVG()}${pigSVG()}</div>`));
    const done = this.list.filter(isDone).length, n = this.list.length || 1;
    $('#sm-l-count').innerHTML = `Fortschritt<b>${done} / ${this.list.length}</b>`;
    $('#sm-lbar-i').style.width = (done / n * 100) + '%';
    this.paint(true); this.paintColl();
    const uj = this.list.indexOf(unlock);
    if (uj >= 0 && $$('#sm-cards .lc')[uj]) { this.idx = uj; this.paint(true); unlockAnimation($$('#sm-cards .lc')[uj], `Level ${unlock + 1} freigeschaltet!`); }
  },
  isBoss(j) { return j === this.list.length; },
  paint(instant) {
    const cards = $$('#sm-cards .lc');
    cards.forEach((b, j) => {
      const sel = j === this.idx && !this.top;
      if (this.isBoss(j)) {
        b.className = 'lc boss lock' + (sel ? ' sel' : '');
        b.innerHTML = `<div class="n">${ICON.skull}</div><div><span class="nm">Boss</span><span class="st">Bald verfügbar</span></div>`;
        return;
      }
      const i = this.list[j];
      const locked = !isUnlocked(i), done = isDone(i);
      b.className = 'lc' + (locked ? ' lock' : '') + (sel ? ' sel' : '');
      const extra = sel ? (locked ? '<span class="st">Gesperrt</span>' : '<span class="go">Start</span>')
                        : `<span class="st">${done ? '✓ Geschafft' : locked ? 'Gesperrt' : 'Bereit'}</span>`;
      const st = save.stats[fileOf(i)];
      const duel = done && st && typeof levelCardStatsHTML === 'function'
        ? `<span class="duel">${levelCardStatsHTML(st)}</span>` : '';   // Tode der letzten geschafften Runde
      b.innerHTML = `<div class="n">${i + 1}</div><div><span class="nm">${CONFIG.levels[i].name}</span>${duel}${extra}</div>`;
    });
    const sel = cards[this.idx], pair = $('#sm-pair');
    if (sel && pair) {
      if (instant) pair.classList.add('nt');
      pair.style.left = (sel.offsetLeft + sel.offsetWidth / 2) + 'px';
      pair.style.top = sel.offsetTop + 'px';
      if (instant) requestAnimationFrame(() => requestAnimationFrame(() => pair.classList.remove('nt')));
    }
    const i = this.list[this.idx];
    $('#sm-l-hint').textContent = this.isBoss(this.idx) ? 'Boss – kommt bald · Esc zurück zur Weltkarte'
      : !isUnlocked(i) ? `Gesperrt – schafft erst Level ${this.list[this.idx - 1] + 1}`
      : '◀ ▶ wählen · Springen starten · ▲ Packages/Umkleide · Esc Karte';
    if (this.top) $('#sm-l-hint').textContent = `◀ ▶ wählen · Springen: ${this.top === 'pack' ? 'Packages öffnen' : 'Umkleide öffnen'} · ▼ zurück zu den Leveln`;
  },
  // Menüpunkte oben rechts (28-packages.js): „Packages öffnen“ und „Umkleide“ (nur Ausrüsten, auch gesperrte zu sehen).
  // ▲ springt in diese Reihe (zuerst Packages), ◀ ▶ wechselt, Springen öffnet, ▼ zurück zu den Levelkarten.
  // Direkt: E / Num 1 / □ / △ = Umkleide; Klick geht auch.
  paintColl() {
    const b = $('#sm-l-coll'), pb = $('#sm-l-pack');
    if (typeof cosmeticsSave === 'undefined') { b.style.display = pb.style.display = 'none'; return; }
    const n = cosmeticsSave.pending.m + cosmeticsSave.pending.f;
    const have = collectionCount('m') + collectionCount('f'), all = COSMETICS.length*2;
    b.classList.toggle('sel', this.top === 'coll'); pb.classList.toggle('sel', this.top === 'pack');
    pb.innerHTML = `<span class="ic">${ICON.pack}${n ? `<i class="num">${n}</i>` : ''}</span><span class="tx"><b>${n ? 'Packages öffnen' : 'Packages'}</b><small>${n
      ? `Affe ${cosmeticsSave.pending.m} · Schweinchen ${cosmeticsSave.pending.f}` : `Kaufen für ${PACKAGE_PRICE} Münzen`}</small></span>`;
    b.innerHTML = `<span class="ic">${ICON.hanger}</span><span class="tx"><b>Umkleide</b><small>${have} / ${all} Items gesammelt</small></span>`;
  },
  openColl() { if (!S.collection) return; this.top = ''; Snd.play('ok'); go('collection', { ret: ['levels', 'keep'] }); },
  openPacks() {   // immer offen: ohne Packages kann man dort welche mit Münzen kaufen
    if (!S.packs) return;
    this.top = ''; Snd.play('ok'); go('packs', { ret: ['levels', 'keep'] });
  },
  setTop(t) { this.top = t; this.paintColl(); this.paint(); Snd.play('move'); },
  select(j) {
    if (j === this.idx) return;
    this.idx = j; this.paint(); Snd.play('move');
  },
  back() { Snd.play('back'); go('map', { sel: this.world }); },
  act(type) {
    const n = this.list.length + 1;   // + Boss-Karte
    if (this.top) {   // obere Reihe (Packages / Umkleide) ausgewählt
      if (type === 'confirm') { if (this.top === 'pack') this.openPacks(); else this.openColl(); }
      else if (type === 'swap') this.openColl();
      else if (type === 'back') this.back();
      else if (type === 'left' || type === 'right') this.setTop(this.top === 'pack' ? 'coll' : 'pack');
      else if (type === 'down') this.setTop('');
      return;
    }
    if (type === 'up' && S.collection) this.setTop('pack');
    else if (type === 'open') this.openColl();
    else if (type === 'left') this.select(clamp(this.idx - 1, 0, n - 1));
    else if (type === 'right' || type === 'down') this.select(clamp(this.idx + 1, 0, n - 1));
    else if (type === 'confirm') {
      const i = this.list[this.idx];
      if (this.isBoss(this.idx) || !isUnlocked(i)) {
        Snd.play('locked');
        const b = $$('#sm-cards .lc')[this.idx]; b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      } else { Snd.play('ok'); go('select', { level: i }); }
    }
    else if (type === 'back') this.back();
    else if (type === 'swap' && S.collection) this.openColl();
  }
};

/* =====================================================================
   5a) WELTKARTE (Ausbau 3) – je Welt eine Insel in der Reihenfolge aus worlds.json, Pfade dazwischen
   ===================================================================== */
const WORLD_LOOK = {   // Farben + Zeichen je Welt (unbekannte Welten: Dschungel-Grün)
  dschungel: { land: '#5fae4a', dark: '#2f6b2c', sand: '#e9d39a', icon: 'palm' },
  ruinen:    { land: '#c9ad6e', dark: '#7d6435', sand: '#efdcab', icon: 'column' },
  hoehle:    { land: '#7a6a9c', dark: '#3f3460', sand: '#d8cfe8', icon: 'crystal' },
  wasser:    { land: '#4aa3c9', dark: '#1f5f80', sand: '#cfeaf2', icon: 'wave' },
  vulkan:    { land: '#a8503a', dark: '#4e2018', sand: '#e7b48e', icon: 'volcano' },
};
function islandSVG(look) {
  const ic = {
    palm: `<path d="M50 62 Q49 44 52 30" stroke="#6b4423" stroke-width="3.5" fill="none" stroke-linecap="round"/>
           <path d="M52 30 Q40 22 30 30 M52 30 Q64 20 74 28 M52 30 Q46 18 38 16 M52 30 Q60 16 68 14" stroke="#2f7a32" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    column: `<rect x="40" y="30" width="7" height="30" fill="#f3e6c2" stroke="#7d6435" stroke-width="1.5"/><rect x="55" y="36" width="7" height="24" fill="#f3e6c2" stroke="#7d6435" stroke-width="1.5"/>
             <rect x="37" y="27" width="28" height="5" fill="#f3e6c2" stroke="#7d6435" stroke-width="1.5"/>`,
    crystal: `<path d="M42 60 L46 36 L52 60 Z M50 60 L57 28 L63 60 Z" fill="#9fe8ff" stroke="#3f3460" stroke-width="1.5"/>`,
    wave: `<path d="M32 46 Q38 40 44 46 T56 46 T68 46 M34 54 Q40 48 46 54 T58 54 T70 54" stroke="#e8fbff" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    volcano: `<path d="M34 60 L46 32 L56 32 L68 60 Z" fill="#5a2a1e" stroke="#2e120e" stroke-width="1.5"/><path d="M46 32 Q51 22 56 32" fill="#ff8a2a"/>
              <path d="M49 33 L47 46 M53 33 L56 44" stroke="#ffb03a" stroke-width="2"/>`,
  }[look.icon] || '';
  return `<svg viewBox="0 0 100 80" aria-hidden="true">
    <ellipse cx="50" cy="62" rx="46" ry="14" fill="rgba(70,120,140,.25)"/>
    <path d="M10 60 Q12 44 30 42 Q38 30 56 34 Q74 30 84 44 Q94 50 90 60 Q70 70 50 68 Q24 70 10 60 Z" fill="${look.sand}" stroke="${look.dark}" stroke-width="1.2"/>
    <path d="M16 58 Q18 48 32 46 Q40 36 56 39 Q72 36 80 47 Q88 52 84 58 Q66 64 50 62 Q28 64 16 58 Z" fill="${look.land}"/>
    ${ic}</svg>`;
}
S.map = {
  el: $('#sm-s-map'), idx: 0, worlds: [],
  enter(arg) {
    this.worlds = mapWorlds();
    const want = arg && typeof arg === 'object' ? (arg.unlockWorld || arg.sel) : null;
    let k = this.worlds.findIndex(w => w.id === want);
    if (k < 0) { k = 0; this.worlds.forEach((w, j) => { if (worldUnlocked(w, this.worlds)) k = j; }); }   // letzte offene Welt
    this.idx = k;
    const box = $('#sm-wm');
    $$('.isl, .pair', box).forEach(e => e.remove());
    const n = this.worlds.length, pts = [];
    this.worlds.forEach((w, j) => {
      // Inseln von links nach rechts im Zickzack verteilt (Werte in % der Karte)
      const x = n > 1 ? 11 + 78 * j / (n - 1) : 50, y = j % 2 ? 66 : 38;
      pts.push([x, y]);
      const look = WORLD_LOOK[w.id] || WORLD_LOOK.dschungel;
      const b = mk(`<button class="isl" type="button" tabindex="-1" style="left:${x}%;top:${y}%"></button>`);
      b.innerHTML = `<div class="isl-art">${islandSVG(look)}</div><div class="isl-lab"><b></b><small></small><span class="boss"></span></div>`;
      b.addEventListener('click', () => { if (this.idx === j) this.act('confirm'); else this.select(j); });
      box.appendChild(b);
    });
    // gestrichelte Pfade zwischen den Inseln (geschwungen)
    let d = '';
    for (let j = 1; j < pts.length; j++) {
      const [x0, y0] = pts[j - 1], [x1, y1] = pts[j], mx = (x0 + x1) / 2;
      d += `M${x0} ${y0} C${mx} ${y0} ${mx} ${y1} ${x1} ${y1} `;
    }
    $('#sm-wm-path').innerHTML = `<path d="${d}" class="road"/>`;
    box.appendChild(mk(`<div class="pair nt" id="sm-m-pair">${monkeySVG()}${pigSVG()}</div>`));
    const open = this.worlds.filter(w => worldUnlocked(w, this.worlds)).length, all = this.worlds.filter(w => w.idx.length).length;
    $('#sm-m-count').innerHTML = `Welten<b>${open} / ${all}</b>`;
    this.paint(true);
    if (arg && arg.unlockWorld) {
      const isl = $$('#sm-wm .isl')[this.idx];
      if (isl) { isl.classList.add('pre'); setTimeout(() => isl.classList.remove('pre'), 1250);
                 unlockAnimation(isl, `Welt ${this.worlds[this.idx].name} freigeschaltet!`); }
    }
  },
  paint(instant) {
    const isl = $$('#sm-wm .isl');
    isl.forEach((b, j) => {
      const w = this.worlds[j], soon = !w.idx.length, open = worldUnlocked(w, this.worlds);
      const done = w.idx.filter(isDone).length;
      b.className = 'isl' + (soon ? ' soon lock' : open ? '' : ' lock') + (worldDone(w) ? ' done' : '') + (j === this.idx ? ' sel' : '') + (b.classList.contains('pre') ? ' pre' : '');
      $('b', b).textContent = w.name;
      $('small', b).textContent = soon ? 'Bald' : `${done} / ${w.idx.length} Level`;
      $('.boss', b).innerHTML = soon ? '' : `${ICON.skull}<i>${w.boss ? (worldDone(w) ? '✓' : '') : 'bald'}</i>`;
      $('.boss', b).title = w.boss ? 'Boss' : 'Boss – kommt bald';
      if (!open && !$('.lk', b)) b.appendChild(mk(`<span class="lk">${ICON.lock}</span>`));
      if (open) { const lk = $('.lk', b); if (lk) lk.remove(); }
    });
    const sel = isl[this.idx], pair = $('#sm-m-pair');
    if (sel && pair) {
      if (instant) pair.classList.add('nt');
      pair.style.left = sel.style.left; pair.style.top = `calc(${sel.style.top} - 7cqh)`;
      if (instant) requestAnimationFrame(() => requestAnimationFrame(() => pair.classList.remove('nt')));
    }
    const w = this.worlds[this.idx];
    const prev = w ? this.worlds.slice(0, this.idx).filter(x => x.idx.length).pop() : null;
    $('#sm-m-hint').textContent = !w ? '' : !w.idx.length ? `${w.name} – kommt bald`
      : !worldUnlocked(w, this.worlds) ? `Gesperrt – schafft erst alle Level in ${prev ? prev.name : 'der Welt davor'}`
      : '◀ ▶ Welt wählen · Springen öffnen · Esc zurück';
  },
  select(j) { if (j === this.idx) return; this.idx = j; this.paint(); Snd.play('move'); },
  act(type) {
    const n = this.worlds.length;
    if (type === 'left' || type === 'up') this.select(clamp(this.idx - 1, 0, n - 1));
    else if (type === 'right' || type === 'down') this.select(clamp(this.idx + 1, 0, n - 1));
    else if (type === 'confirm') {
      const w = this.worlds[this.idx];
      if (!w || !worldUnlocked(w, this.worlds)) {
        Snd.play('locked');
        const b = $$('#sm-wm .isl')[this.idx]; if (b) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); }
      } else { Snd.play('ok'); go('levels', { world: w.id }); }
    }
    else if (type === 'back') { Snd.play('back'); go('menu'); }
  }
};
$('#sm-l-coll').addEventListener('click', () => S.levels.openColl());
$('#sm-l-pack').addEventListener('click', () => S.levels.openPacks());

/* =====================================================================
   6) TSCHÜSS
   ===================================================================== */
/* =====================================================================
   7) LEVEL GESCHAFFT – Statistik (Münzen, Tode) nach dem Ziel-Tanz, dann Levelauswahl mit Schloss-Animation
   ===================================================================== */
S.results = {
  el: $('#sm-s-results'), arg: null,
  enter(arg) {
    this.arg = arg || {};
    const st = this.arg.st || { m: 0, f: 0, cm: 0, cf: 0, tm: 0, tf: 0 }, lv = CONFIG.levels[(this.arg.n || 1) - 1];
    $('#sm-r-level').textContent = lv ? `Level ${this.arg.n} · ${lv.name}` : '';
    const moreDeaths = st.m > st.f ? 'm' : st.f > st.m ? 'f' : '', moreCoins = st.cm > st.cf ? 'm' : st.cf > st.cm ? 'f' : '';
    for (const w of ['m', 'f']) {
      const c = w === 'm' ? st.cm : st.cf, t = w === 'm' ? st.tm : st.tf, d = w === 'm' ? st.m : st.f;
      const badges = (moreCoins === w ? '<span class="rb coin">Mehr Münzen</span>' : '') + (moreDeaths === w ? '<span class="rb death">Mehr Tode</span>' : '');
      $('#sm-r-' + w).innerHTML = `<div class="r-face">${charSVG(w === 'm' ? 'monkey' : 'pig')}</div>
        <div class="r-name">${w === 'm' ? CONFIG.characters.monkey.name : CONFIG.characters.pig.name}</div>
        <div class="r-badges">${badges}</div>
        <div class="r-row"><span>Münzen</span><b class="coin" data-to="${c}">0</b>${t ? `<small>/ ${t}</small>` : ''}</div>
        <div class="r-row"><span>Tode</span><b class="death" data-to="${d}">0</b></div>
        ${this.arg.packs ? `<div class="r-row r-pack"><span>Packages<em>${this.arg.packs > 1 ? 'Ziel + alle Münzen' : 'Ziel geschafft'}</em></span>
          <span class="r-giftbox"><i class="rays"></i>${giftSVG()}</span><b class="pack">0</b></div>` : ''}`;
    }
    // Gewinner-Animation: nach dem Hochzählen fallen die Geschenkpakete in die Karten, der Package-Zähler zählt einzeln hoch
    this.el.classList.remove('win'); clearTimeout(this.winT); (this.popT || []).forEach(clearTimeout); this.popT = [];
    if (this.arg.packs) this.winT = setTimeout(() => this.reward(this.arg.packs), 1500);
    // Zahlen hochzählen
    const t0 = performance.now(), nums = $$('#sm-s-results b[data-to]');
    clearInterval(this.cnt);
    this.sel = 1; this.paintBtns();   // „Weiter“ vorausgewählt – Packages öffnen ist freiwillig
    this.cnt = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0 - 450) / 900);
      nums.forEach(b => { b.textContent = Math.round(Math.max(0, k) * Number(b.dataset.to)); });
      if (k >= 1) clearInterval(this.cnt);
    }, 30);
  },
  leave() { clearInterval(this.cnt); clearTimeout(this.winT); (this.popT || []).forEach(clearTimeout); this.el.classList.remove('win'); },
  reward(n) {
    const conf = $('#sm-r-conf');
    conf.innerHTML = Array.from({ length: 46 }, (_, i) => `<i style="--x:${(i*37) % 100}cqw;--d:${1.6 + (i % 7)*0.18}s;--dl:${(i % 9)*0.06}s;--r:${(i*53) % 360}deg;--c:${['#ffb52e', '#ffe28a', '#c6ff3d', '#ff86b4', '#f6a93b', '#ffffff'][i % 6]}"></i>`).join('');
    this.el.classList.add('win');
    if (typeof sTone === 'function') { sTone(523, 0, 0.2, { type: 'triangle', vol: 0.06*VOL.sfx }); sTone(784, 0.08, 0.3, { type: 'triangle', vol: 0.06*VOL.sfx }); }
    for (let i = 1; i <= n; i++) this.popT.push(setTimeout(() => {
      $$('#sm-s-results .r-pack b.pack').forEach(b => { b.textContent = i; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); });
      $$('#sm-s-results .r-giftbox').forEach(x => { x.classList.remove('hit'); void x.offsetWidth; x.classList.add('hit'); });
      if (typeof sTone === 'function') { const f = 660*Math.pow(2, (i - 1)*4/12); sTone(f, 0, 0.25, { type: 'triangle', vol: 0.07*VOL.sfx }); sTone(f*2, 0.03, 0.2, { vol: 0.03*VOL.sfx }); }
      if (typeof sfxLog === 'function') sfxLog('packCount');
    }, 500 + (i - 1)*600));
  },
  // Packages (28-packages.js): Knopf „Packages öffnen“ neben „Weiter“ – freiwillig, ungeöffnete bleiben im Inventar
  packsPending() { return typeof cosmeticsSave === 'undefined' ? 0 : cosmeticsSave.pending.m + cosmeticsSave.pending.f; },
  paintBtns() {
    const n = this.packsPending(), pb = $('#sm-r-pack');
    pb.style.display = n ? '' : 'none';
    if (!n) this.sel = 1;
    pb.innerHTML = `${ICON.pack}Packages öffnen <span class="cnt">${n}</span>`;
    pb.classList.toggle('sel', this.sel === 0); $('#sm-r-go').classList.toggle('sel', this.sel === 1);
  },
  act(type) {
    if ((type === 'left' || type === 'right' || type === 'up' || type === 'down') && this.packsPending()) {
      this.sel = 1 - this.sel; this.paintBtns(); Snd.play('move');
    }
    else if (type === 'confirm') { if (this.sel === 0 && this.packsPending()) this.packs(); else this.next(); }
    else if (type === 'back') this.next();
  },
  // wohin nach „Weiter“: neue Welt frei -> Weltkarte mit Freischalt-Animation, sonst Welt-Seite dieses Levels
  // (neu freigeschaltetes Level mit Schloss-Animation)
  ret() {
    const a = this.arg || {};
    if (a.freshWorld) return ['map', { unlockWorld: a.freshWorld }];
    if (a.fresh) return ['levels', { unlock: a.fresh - 1 }];
    const w = a.n ? worldOfIndex(a.n - 1) : null;
    return ['levels', w ? { world: w.id } : undefined];
  },
  next() {
    Snd.play('ok');
    go(...this.ret());
  },
  packs() { Snd.play('ok'); go('packs', { ret: this.ret() }); }
};
$('#sm-r-go').addEventListener('click', () => S.results.next());
$('#sm-r-pack').addEventListener('click', () => S.results.packs());

// goldenes Schloss auf der Karte des neu freigeschalteten Levels: wackelt, platzt in Splitter, Karte leuchtet auf
function unlockAnimation(card, msg) {
  const shards = Array.from({ length: 10 }, (_, i) => `<i style="--a:${i * 36 + 8}deg;--d:${9 + (i % 3) * 3}cqw"></i>`).join('');
  const ov = mk(`<div class="ulock"><svg class="lock" viewBox="0 0 64 76" aria-hidden="true">
      <defs><linearGradient id="sm-gGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".45" stop-color="#ffc83a"/><stop offset="1" stop-color="#c47a00"/></linearGradient></defs>
      <path class="shackle" d="M16 34V22a16 16 0 0 1 32 0v12" fill="none" stroke="url(#sm-gGold)" stroke-width="8" stroke-linecap="round"/>
      <rect x="6" y="32" width="52" height="40" rx="9" fill="url(#sm-gGold)" stroke="#8a5300" stroke-width="2"/>
      <circle cx="32" cy="48" r="6" fill="#6b3f00"/><rect x="29" y="50" width="6" height="12" rx="3" fill="#6b3f00"/>
    </svg><div class="shards">${shards}</div></div>`);
  card.appendChild(ov);
  setTimeout(() => ov.classList.add('shake'), 350);
  setTimeout(() => { ov.classList.add('burst'); card.classList.add('flash'); Snd.play('go'); }, 1250);
  setTimeout(() => { ov.remove(); card.classList.remove('flash'); toast(msg); }, 2100);
}

S.goodbye = {
  el: $('#sm-s-goodbye'),
  enter() { Snd.stop(); },
  act(type) { if (type === 'confirm' || type === 'back') this.back(); },
  back() { Snd.start(); Snd.play('ok'); go('menu'); }
};
$('#sm-bye-back').addEventListener('click', () => S.goodbye.back());

/* =====================================================================
   EINGABE: Tastatur, Controller
   ===================================================================== */
const KEYMAP = {
  ArrowLeft: ['left', 'kbd2'], ArrowRight: ['right', 'kbd2'], ArrowUp: ['up', 'kbd2'], ArrowDown: ['down', 'kbd2'],
  KeyA: ['left', 'kbd1'], KeyD: ['right', 'kbd1'], KeyW: ['up', 'kbd1'], KeyS: ['down', 'kbd1'],
  Enter: ['confirm', 'kbd2'], NumpadEnter: ['confirm', 'kbd2'], Numpad0: ['confirm', 'kbd2'],
  Space: ['confirm', 'kbd1'], KeyG: ['confirm', 'kbd1'],
  KeyE: ['swap', 'kbd1'], Numpad1: ['swap', 'kbd2'], Digit1: ['swap', 'kbd2'],   // Sammlung / Figur wechseln (28-packages.js)
  Escape: ['back', 'kbd'], Backspace: ['back', 'kbd']
};
const IGNORE = ['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight', 'CapsLock', 'Tab'];
window.smKeyDown = e => {
  if (e.ctrlKey || e.metaKey || e.altKey || IGNORE.includes(e.code) || /^F\d+$/.test(e.code)) return;
  Snd.resume();
  const m = KEYMAP[e.code];
  if (m) {
    e.preventDefault();
    if (e.repeat && (m[0] === 'confirm' || m[0] === 'back')) return;
    dispatch(m[0], m[1]);
  } else if (!e.repeat) dispatch('any', 'kbd');
};
document.addEventListener('click', () => { const a = document.activeElement; if (a && a !== document.body && a.blur) a.blur(); });

const padState = {};
function poll(t) {
  const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
  let slot = 0;
  for (const p of pads) {
    if (!p || p.connected === false) continue;
    if (slot > 1) break;
    const src = 'pad' + slot, st = padState[src] || (padState[src] = {});
    const b = i => !!(p.buttons[i] && p.buttons[i].pressed);
    const dirs = {
      left: p.axes[0] < -.6 || b(14), right: p.axes[0] > .6 || b(15),
      up: p.axes[1] < -.6 || b(12), down: p.axes[1] > .6 || b(13)
    };
    for (const d in dirs) {
      if (dirs[d]) {
        if (!st['h' + d]) { st['h' + d] = 1; st['n' + d] = t + 380; Snd.resume(); dispatch(d, src); }
        else if (t >= st['n' + d]) { st['n' + d] = t + 140; dispatch(d, src); }
      } else st['h' + d] = 0;
    }
    const btn = (i, type) => { const on = b(i); if (on && !st['b' + i]) { Snd.resume(); dispatch(type, src); } st['b' + i] = on; };
    btn(0, 'confirm'); btn(9, 'confirm'); btn(1, 'back'); btn(8, 'back');
    btn(2, 'swap'); btn(3, 'swap');   // □ / △: Sammlung öffnen, Figur wechseln (Titel: wie jede Taste)
    [4, 5, 6, 7, 10, 11].forEach(i => btn(i, 'any'));
    slot++;
  }
  requestAnimationFrame(poll);
}
requestAnimationFrame(poll);

/* Augen folgen dem Mauszeiger */
let pm = null, raf = 0;
addEventListener('pointermove', e => { pm = e; if (!raf) raf = requestAnimationFrame(updateEyes); });
function updateEyes() {
  raf = 0; if (!pm) return;
  $$('.screen.active .char').forEach(c => {
    const r = c.getBoundingClientRect(); if (!r.width) return;
    const dx = pm.clientX - (r.left + r.width / 2), dy = pm.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / r.width);
    c.style.setProperty('--ex', (dx / d * 7 * k).toFixed(2));
    c.style.setProperty('--ey', (dy / d * 6 * k).toFixed(2));
  });
}

/* =====================================================================
   AUFBAU
   ===================================================================== */
(function init() {
  $('#sm-logo').textContent = CONFIG.title; $('#sm-logo-sm').textContent = CONFIG.title;
  if (matchMedia('(pointer:coarse)').matches) $('#sm-press').textContent = 'Tippe zum Starten';
  $$('[data-char]').forEach(e => { e.innerHTML = charSVG(e.dataset.char); });
  buildBackground();
  const pc = $('#sm-particles');
  for (let i = 0; i < 22; i++) {
    const s = document.createElement('span'), z = .3 + Math.random() * .6;
    s.style.cssText = `left:${Math.random() * 100}%;width:${z}cqw;height:${z}cqw;--d:${9 + Math.random() * 12}s;--dl:-${Math.random() * 20}s;--x:${(Math.random() - .5) * 14}cqw`;
    pc.appendChild(s);
  }
  levelsReady = loadLevelList();
})();

/* =====================================================================
   ANBINDUNG AN DAS SPIEL
   ===================================================================== */
function active() { return typeof menuScreen !== 'undefined' && menuScreen === 'start'; }
function showMenuScreen(name, arg) {
  menuScreen = 'start';
  if (typeof wasserTonReset === 'function') wasserTonReset();   // Ton nicht mehr „unter Wasser“ (elemente/wasser.js)                       // Spiel steht still, Spiel-Tasten ruhen (16-menue.js)
  menuEl.classList.remove('show');            // altes Menü (nur noch für die Pause) ausblenden
  smRoot.classList.add('on');
  Snd.resume();
  go(name, arg);
}
function hideMenu() { smRoot.classList.remove('on'); if (cur && cur.leave) cur.leave(); }
// Levelliste: Reihenfolge aus levels/worlds.json (Welten in ihrer Reihenfolge, darin die Level), Namen aus
// levels/levels.json. Fehlt worlds.json oder ist sie kaputt, gilt wie früher die Reihenfolge aus levels.json.
// Level aus levels.json, die in keiner Welt stehen (und nicht versteckt sind), kommen hinten dran – nichts geht verloren.
async function fetchJSON(file) {
  try { const r = await fetch(PROJECT_LEVELS + file, { cache: 'no-store' }); return r.ok ? await r.json() : null; }
  catch (e) { return null; }
}
function buildLevelOrder(list, worlds) {
  list = Array.isArray(list) ? list : [];
  const byFile = {}; for (const l of list) if (l && l.datei) byFile[l.datei] = l;
  const entry = (datei, welt) => { const l = byFile[datei] || {}; return { name: l.titel || l.name || datei, datei, welt: welt || null }; };
  const ws = worlds && Array.isArray(worlds.welten) ? worlds.welten.filter(w => w && w.id && Array.isArray(w.level)) : null;
  if (!ws) return list.filter(l => l && l.datei && !l.versteckt).map(l => entry(l.datei, null));
  const out = [], seen = new Set();
  for (const w of ws.slice().sort((a, b) => (a.reihenfolge || 0) - (b.reihenfolge || 0)))
    for (const d of w.level) if (!seen.has(d)) { seen.add(d); out.push(entry(d, w.id)); }
  for (const l of list) if (l && l.datei && !l.versteckt && !seen.has(l.datei)) { seen.add(l.datei); out.push(entry(l.datei, null)); }
  return out;
}
async function loadLevelList() {
  const [list, worlds] = await Promise.all([fetchJSON('levels.json'), fetchJSON('worlds.json')]);
  CONFIG.worlds = worlds && Array.isArray(worlds.welten) ? worlds.welten : [];
  const lv = buildLevelOrder(list, worlds);
  while (lv.length < CONFIG.slots) lv.push({ name: 'Coming soon', soon: true });
  CONFIG.levels = lv;
  if (cur === S.levels && active()) S.levels.enter();
}
// Level geschafft (nach dem Tanz, 21-figuren-leben.js): Fortschritt merken, zurück zur Levelauswahl
window.startMenuLevelWon = () => {
  const n = currentLevelNo; currentLevelNo = 0;
  const st = typeof levelStats === 'function' ? levelStats() : null;   // Münzen/Tode dieser Runde (25-duell.js)
  if (n && st && fileOf(n - 1)) { save.stats[fileOf(n - 1)] = { m: st.m, f: st.f }; }   // für die Levelkarte merken
  // Packages: 1 fürs Schaffen, +1 wenn alle Münzen gesammelt – für beide Figuren (26-kosmetik-daten.js)
  const packs = n && typeof awardPackages === 'function' ? awardPackages(typeof coins !== 'undefined' && coins.every(c => c.taken)) : 0;
  if (n && st && typeof addCoins === 'function') addCoins(st.cm, st.cf);   // selbst gesammelte Münzen aufs Konto (Pakete kaufen)
  if (n) { const fresh = completeLevel(n, true); showMenuScreen('results', { n, st, fresh, packs, freshWorld: lastFreshWorld }); }
  else showMenuScreen('menu');
};
window.showTitleScreen = () => showMenuScreen('title');
window.startMenuShow = showMenuScreen;
showMainMenu = () => showMenuScreen('menu');          // ersetzt die alten Menüs aus 16-menue.js
showLevelSelect = () => showMenuScreen('levels');
document.getElementById('loadLevelInput').addEventListener('change', () => { currentLevelNo = 0; hideMenu(); });
window.GameMenu = { config: CONFIG, completeLevel, resetSave, unlockAll, getSave: () => JSON.parse(JSON.stringify(save)),
                    migrateSave, buildLevelOrder, mapWorlds, worldUnlocked: id => worldUnlocked(worldById(id)),
                    levelUnlocked: i => isUnlocked(i), lastFreshWorld: () => lastFreshWorld,
                    show: showMenuScreen, levelsReady: () => CONFIG.levels.length > 0,
                    // für weitere Menü-Bildschirme (28-packages.js)
                    ui: { S, go, toast, mk, $, $$, Snd, charSVG, ICON, giftSVG, config: CONFIG,
                          whoOf: src => { const p = srcPlayer(src); return !p ? null : p === lastPlayers.monkey ? 'm' : 'f'; },
                          playerOf: who => who === 'm' ? lastPlayers.monkey : lastPlayers.pig } };
})();
