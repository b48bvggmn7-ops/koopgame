// 03-eingabe.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Input ----------
const KEYS = {};
// Tasten-Belegung je SPIELER (nicht je Figur): Spieler 1 = linke Tastaturhälfte + Controller 1, Spieler 2 = Pfeile/
// Nummernblock + Controller 2. Wer welche Figur steuert, wählt man im Startmenü („Wer spielt wen?“, js/24-startmenue.js).
// Nacht-Ausbau: frei belegbar im Optionen-Menü „Tasten“ (gespeichert unter TASTEN_SPEICHER). Die STANDARD-Belegung der
// alten Aktionen ist genau die bisherige; neu ist nur „dash“ (Affe/Spieler 1: K, Spieler 2: Num 3, Controller: △).
const TASTEN_STANDARD = {
  1: {left:'KeyA', right:'KeyD', jump:'Space', ability:'KeyG', pull:'KeyW', slack:'KeyS', use:'KeyJ', dash:'KeyK', spezial:'KeyH'},
  2: {left:'ArrowLeft', right:'ArrowRight', jump:'Numpad0', ability:'Numpad1', pull:'ArrowUp', slack:'ArrowDown', use:'Numpad2', dash:'Numpad3', spezial:'Numpad4'},
  // spezial (Dschungel-Neu): Affe = pusten (Wind), Schweinchen = hinlegen (Sprungpolster) – js/34-koop-aktionen.js
};
// Controller-Knöpfe (Standard-Belegung): ✕ 0, ○ 1, □ 2, △ 3, Steuerkreuz 12–15. Laufen geht immer auch mit dem Stick.
const PAD_STANDARD = {jump:0, ability:2, use:1, dash:3, pull:12, slack:13, left:14, right:15, spezial:5};   // 5 = R1 / RB
const TASTEN_AKTIONEN = ['left', 'right', 'jump', 'ability', 'pull', 'slack', 'use', 'dash', 'spezial'];
const TASTEN_SPEICHER = 'monchichi.tasten';
// Diese Tasten gehören dem Spiel selbst und sind nicht belegbar (Menü/Pause, Neustart, Leistungsanzeige, Ton, Test-Sprung)
const TASTEN_GESCHUETZT = {Escape: 'Pause/Menü', Enter: 'Menü bestätigen', Tab: 'System', KeyR: 'Neustart', KeyF: 'Leistungsanzeige',
  KeyM: 'Ton aus/an', KeyC: 'Test-Sprung', KeyX: 'Test-Sprung', KeyP: 'Partner', KeyQ: 'Partner', KeyE: 'Partner', KeyV: 'Partner',
  KeyT: 'Tageszeit (Test)', KeyZ: 'Wetter (Test)', Backspace: 'System', MetaLeft: 'System', MetaRight: 'System', ContextMenu: 'System'};
const PAD_GESCHUETZT = {8: 'Share/Ansicht', 9: 'Options/Menü (Pause)', 16: 'PS/Xbox-Taste'};
// Controller-Belegung je Spieler UND je Controller-Typ (Xbox, PlayStation, andere): wer einen anderen Controller ansteckt,
// bekommt dessen eigene gespeicherte Belegung bzw. die Standard-Belegung als Rückfall. Laufen/Zielen: linker Stick (fest).
const PAD_TYPEN = ['playstation', 'xbox', 'andere'];
function padTyp(id){
  const t = String(id || '').toLowerCase();
  if(/xbox|xinput|045e/.test(t)) return 'xbox';
  if(/playstation|dualshock|dualsense|054c|wireless controller|ps4|ps5/.test(t)) return 'playstation';
  return 'andere';
}
const padTypAktuell = ['playstation', 'playstation'];   // zuletzt gesehener Typ je Controller-Platz (für Anzeige/Menü)
const KEYSETS = {1: {}, 2: {}};
const PADSETS = {1: {}, 2: {}};   // PADSETS[spieler][typ][aktion] = Knopf-Nummer
function tastenLaden(){
  let gespeichert = null;
  try{ gespeichert = JSON.parse(localStorage.getItem(TASTEN_SPEICHER) || 'null'); }catch(e){ gespeichert = null; }
  for(const n of [1, 2]){
    const k = Object.assign({}, TASTEN_STANDARD[n], gespeichert && gespeichert.tastatur && gespeichert.tastatur[n] || {});
    for(const a of TASTEN_AKTIONEN) KEYSETS[n][a] = k[a];
    for(const typ of PAD_TYPEN){
      const p = Object.assign({}, PAD_STANDARD, gespeichert && gespeichert.pad && gespeichert.pad[n] && gespeichert.pad[n][typ] || {});
      PADSETS[n][typ] = {}; for(const a of TASTEN_AKTIONEN) PADSETS[n][typ][a] = p[a];
    }
    KEYSETS[n].padUse = 'Pad' + n + 'Use';   // Controller-Schalter (Kreis) meldet sich unter eigenem Namen
  }
}
function tastenSpeichern(){
  const daten = {version: 1, tastatur: {}, pad: {}};
  for(const n of [1, 2]){
    daten.tastatur[n] = {}; daten.pad[n] = {};
    for(const a of TASTEN_AKTIONEN) daten.tastatur[n][a] = KEYSETS[n][a];
    for(const typ of PAD_TYPEN){ daten.pad[n][typ] = {}; for(const a of TASTEN_AKTIONEN) daten.pad[n][typ][a] = PADSETS[n][typ][a]; }
  }
  try{ localStorage.setItem(TASTEN_SPEICHER, JSON.stringify(daten)); }catch(e){ /* privat/voll: dann nur für diese Sitzung */ }
}
// nach jeder Änderung der Belegung: Figuren, Anzeige und Controller-Zuordnung neu
function tastenAnwenden(){
  if(typeof p1 !== 'undefined' && p1) p1.keys = keysFor(true);
  if(typeof p2 !== 'undefined' && p2) p2.keys = keysFor(false);
  if(typeof updateHudKeys === 'function') updateHudKeys();
}
tastenLaden();
const trackedKeysFest = ['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyF','Enter','KeyR'];
function istSpielTaste(code){
  if(trackedKeysFest.includes(code)) return true;
  for(const n of [1, 2]) for(const a of TASTEN_AKTIONEN) if(KEYSETS[n][a] === code) return true;
  return ['Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(code) && keyAlias(code) !== code;
}
// Spielerin 2 springt mit der 0 vom Nummernblock; die normale 0 (1, 2, 3) zählt als Ausweich (Laptops ohne Nummernblock) –
// aber nur, solange die Ziffer nicht selbst irgendwo belegt ist
function keyAlias(code){
  const ersatz = {Digit0: 'Numpad0', Digit1: 'Numpad1', Digit2: 'Numpad2', Digit3: 'Numpad3', Digit4: 'Numpad4'}[code];
  if(!ersatz) return code;
  for(const n of [1, 2]) for(const a of TASTEN_AKTIONEN) if(KEYSETS[n][a] === code) return code;
  return ersatz;
}
window.addEventListener('keydown', e=>{
  if(istSpielTaste(e.code)) e.preventDefault();
  const code = keyAlias(e.code);
  if(!KEYS[code]) KEYS[code+'_pressed'] = true;
  KEYS[code] = true;
  if(e.code === 'KeyR'){ resetLevel(); if(typeof baumIntroStarten === 'function') baumIntroStarten(); }   // Neustart; Dschungel: Start-Ablauf am Baum (12a)
});
window.addEventListener('keyup', e=>{
  if(istSpielTaste(e.code)) e.preventDefault();
  KEYS[keyAlias(e.code)] = false;
});

// ---------- Controller (PS4/PS5/Xbox, Standard-Belegung) ----------
// Controller 1 -> Affe, Controller 2 -> Schweinchen. Er drückt dieselben "virtuellen Tasten"
// wie die Tastatur, deshalb funktioniert alles andere automatisch mit. Tastatur geht parallel weiter.
// PS4: Kreuz = springen, Viereck = Fähigkeit (Affe: Haken, Schweinchen: Schirm halten),
//      R2/R1 = Seil einholen, L2/L1 = Seil geben, Options = Pausenmenü. Laufen: linker Stick oder Steuerkreuz.
const PAD = {};              // aktueller Controller-Zustand je virtueller Taste
let monkeyPlayer = 1;        // welcher Spieler (1/2) den Affen steuert
function keysFor(male){
  // Computer-Partner (js/30-partner.js, nur Testmodus): eine Figur hört auf „meine“ Tasten (beide Tastaturhälften und
  // beide Controller), die andere auf die Partner-Tasten, die der Partner selbst drückt
  if(typeof partnerTasten === 'function'){ const t = partnerTasten(male); if(t) return t; }
  const s = KEYSETS[male ? monkeyPlayer : 3 - monkeyPlayer];
  // swimUp/swimDown: Hoch/Runter beim Schwimmen (Ausbau 5) – dieselben Tasten wie Seil ranziehen/geben
  // dash (Nacht-Ausbau): Dash-Taste; hoch/runter für die Dash-Richtung und zum Festhalten an Haftflächen = swimUp/swimDown
  // pusten (Affe) / liegen (Schweinchen): die Spezial-Taste des Spielers (js/34-koop-aktionen.js)
  return male ? {left:s.left, right:s.right, jump:s.jump, hook:s.ability, pull:s.pull, slack:s.slack, use:s.use, padUse:s.padUse, swimUp:s.pull, swimDown:s.slack, dash:s.dash, pusten:s.spezial}
              : {left:s.left, right:s.right, jump:s.jump, glide:s.ability, use:s.use, padUse:s.padUse, swimUp:s.pull, swimDown:s.slack, dash:s.dash, liegen:s.spezial};
}
function setMonkeyPlayer(n){
  monkeyPlayer = n === 2 ? 2 : 1;
  if(typeof p1 !== 'undefined' && p1) p1.keys = keysFor(true);
  if(typeof p2 !== 'undefined' && p2) p2.keys = keysFor(false);
  updateHudKeys();
}
// lesbarer Name einer Taste (Anzeige im Spiel, in den Optionen und in der Hilfe)
function tasteName(code){
  if(!code) return '–';
  const fest = {Space: 'Leertaste', ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', ShiftLeft: 'Shift links',
    ShiftRight: 'Shift rechts', ControlLeft: 'Strg links', ControlRight: 'Strg rechts', AltLeft: 'Alt', AltRight: 'Alt Gr',
    CapsLock: 'Feststell', Comma: ',', Period: '.', Minus: 'ß', Slash: '-', Semicolon: 'Ö', Quote: 'Ä', BracketLeft: 'Ü',
    BracketRight: '+', Backslash: '#', IntlBackslash: '<', Backquote: '^', Equal: '´', NumpadAdd: 'Num +', NumpadSubtract: 'Num −',
    NumpadMultiply: 'Num ×', NumpadDivide: 'Num ÷', NumpadDecimal: 'Num ,', NumpadEnter: 'Num Enter', Insert: 'Einfg',
    Delete: 'Entf', Home: 'Pos1', End: 'Ende', PageUp: 'Bild ↑', PageDown: 'Bild ↓'};
  if(fest[code]) return fest[code];
  if(/^Key[A-Z]$/.test(code)) return code.slice(3);
  if(/^Digit\d$/.test(code)) return code.slice(5);
  if(/^Numpad\d$/.test(code)) return 'Num ' + code.slice(6);
  return code;
}
const PAD_NAMEN = {
  playstation: {0: '✕', 1: '○', 2: '□', 3: '△', 4: 'L1', 5: 'R1', 6: 'L2', 7: 'R2', 10: 'L3', 11: 'R3'},
  xbox:        {0: 'A', 1: 'B', 2: 'X', 3: 'Y', 4: 'LB', 5: 'RB', 6: 'LT', 7: 'RT', 10: 'LS', 11: 'RS'},
  andere:      {0: 'Knopf 1', 1: 'Knopf 2', 2: 'Knopf 3', 3: 'Knopf 4', 4: 'Schulter L', 5: 'Schulter R', 6: 'Trigger L', 7: 'Trigger R', 10: 'Stick L', 11: 'Stick R'},
};
const PAD_KREUZ = {12: 'Kreuz ▲', 13: 'Kreuz ▼', 14: 'Kreuz ◀', 15: 'Kreuz ▶'};
function padName(n, typ){ return n === undefined || n === null ? '–' : (PAD_KREUZ[n] || (PAD_NAMEN[typ || 'playstation'] || {})[n] || 'Knopf ' + (n + 1)); }
// Anzeige oben links/rechts: welcher Spieler welche Figur mit welchen Tasten steuert (aktuelle Belegung)
function updateHudKeys(){
  const mP = monkeyPlayer, fP = 3 - monkeyPlayer, T = n => a => tasteName(KEYSETS[n][a]).replace(/ /g, '&nbsp;');
  const zeile = (n, ab) => { const t = T(n);
    return t('left') + '/' + t('right') + ' bewegen · ' + t('jump') + ' springen/Wandsprung · ' + t('ability') + ' ' + ab +
           ' · ' + t('use') + ' am Hebel = Schalter · ' + t('dash') + ' Dash'; };
  const m = T(mP);
  const set = (id, html)=>{ const el = document.getElementById(id); if(el) el.innerHTML = html; };
  if(typeof partnerHud === 'function' && partnerHud(set)) return;   // Computer-Partner an (30-partner.js)
  set('hudMHead', '<b>Spieler ' + mP + '</b> <span class="p1">● Affe, Haken</span>');
  set('hudMKeys', zeile(mP, 'Haken schießen/lösen') + ' · ' + m('pull') + ' ranziehen · ' + m('slack') + ' Seil geben');
  set('hudFHead', '<b>Spieler ' + fP + '</b> <span class="p2">● Schweinchen, Schirm</span>');
  set('hudFKeys', zeile(fP, 'in der Luft halten = Schirm (segeln)'));
}
// Controller i (0/1) drückt die „virtuellen Tasten“ von Spieler i+1 (Belegung PADSETS, Stick geht immer zusätzlich)
function padMap(i){
  const n = i + 1, K = KEYSETS[n];
  return {left:K.left, right:K.right, jump:K.jump, ability:K.ability, pull:K.pull, slack:K.slack, use:K.padUse, dash:K.dash, spezial:K.spezial};
}
let padBlocked = false;
function isDown(code){ return !!(KEYS[code] || PAD[code]); }
function setPad(code, val){
  if(!code) return;
  if(val && !PAD[code] && !KEYS[code]) KEYS[code+'_pressed'] = true; // "gerade gedrückt" wie bei der Tastatur
  PAD[code] = val;
}
let prevRestart = false;
const padConnected = [false, false];
const prevAnyPad = [false, false];
function pollGamepads(){
  let pads = [];
  try { pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []; }
  catch(e){ padBlocked = true; pads = []; }
  let restart = false;
  for(let i=0; i<2; i++){
    const m = padMap(i), gp = pads[i];
    if(gp) padTypAktuell[i] = padTyp(gp.id);
    const P = PADSETS[i + 1][padTypAktuell[i]];
    const el = document.getElementById('pad'+(i+1));
    padConnected[i] = !!gp;
    if(!gp){
      for(const k of ['left','right','jump','ability','pull','slack','use','dash','spezial']) setPad(m[k], false);
      if(el){ el.classList.remove('on');
        el.textContent = padBlocked ? '🎮 Controller hier blockiert – Spiel im eigenen Tab öffnen'
                                    : '🎮 Controller '+(i+1)+': nicht verbunden (Taste drücken)'; }
      continue;
    }
    const b = n => !!(gp.buttons[n] && (gp.buttons[n].pressed || gp.buttons[n].value > 0.4));
    // "beliebige Taste" am Controller: jede Taste (auch Options) oder den Stick kräftig bewegen
    const anyNow = gp.buttons.some(bt=> bt && (bt.pressed || bt.value > 0.4)) ||
                   Math.abs(gp.axes[0]||0) > 0.6 || Math.abs(gp.axes[1]||0) > 0.6;
    if(anyNow && !prevAnyPad[i]) requestContinue();
    prevAnyPad[i] = anyNow;
    const ax = gp.axes[0] || 0;
    setPad(m.left,  ax < -0.35 || b(P.left));
    setPad(m.right, ax >  0.35 || b(P.right));
    setPad(m.jump,  b(P.jump));            // Standard: Kreuz / A
    setPad(m.ability, b(P.ability));       // Standard: Viereck / X
    // Seil: hoch = einholen, runter = Seil geben (Steuerkreuz oder Stick, nur wenn klar senkrecht gedrückt)
    const ay = gp.axes[1] || 0, vert = Math.abs(ay) > 0.55 && Math.abs(ay) > Math.abs(ax)*0.9;
    setPad(m.pull,  b(P.pull) || (vert && ay < 0));
    setPad(m.slack, b(P.slack) || (vert && ay > 0));
    setPad(m.use,   b(P.use));             // Standard: Kreis / B = Schalter betätigen
    setPad(m.dash,  b(P.dash));            // Standard: Dreieck / Y = Dash (Nacht-Ausbau)
    setPad(m.spezial, b(P.spezial));       // Standard: R1 / RB = pusten (Affe) bzw. hinlegen (Schweinchen)
    if(b(9)) restart = true;               // Options / Start
    if(el){ el.classList.add('on'); el.textContent = '🎮 Controller '+(i+1)+' verbunden'; }
  }
  // Options öffnet das Pausenmenü (mit „Level neu starten“) – siehe pollMenuPads in 16-menue.js;
  // nach einem Tod macht Options wie bisher einfach weiter
  prevRestart = restart;
}
window.addEventListener('gamepadconnected', ()=>{ padBlocked = false; });
