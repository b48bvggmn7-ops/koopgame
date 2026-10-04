// 03-eingabe.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Input ----------
const KEYS = {};
const trackedKeys = ['KeyA','KeyD','KeyW','KeyS','Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Numpad0','Digit0','Numpad1','Digit1','Numpad2','Digit2','KeyF','Enter','KeyG','KeyH','KeyJ','KeyR'];
// Spielerin 2 springt mit der 0 vom Nummernblock; die normale 0 zählt als Ausweich (Laptops ohne Nummernblock)
const keyAlias = code => code==='Digit0' ? 'Numpad0' : code==='Digit1' ? 'Numpad1' : code==='Digit2' ? 'Numpad2' : code;
window.addEventListener('keydown', e=>{
  if(trackedKeys.includes(e.code)) e.preventDefault();
  const code = keyAlias(e.code);
  if(!KEYS[code]) KEYS[code+'_pressed'] = true;
  KEYS[code] = true;
  if(e.code === 'KeyR') resetLevel();
});
window.addEventListener('keyup', e=>{
  if(trackedKeys.includes(e.code)) e.preventDefault();
  KEYS[keyAlias(e.code)] = false;
});

// ---------- Controller (PS4/PS5/Xbox, Standard-Belegung) ----------
// Controller 1 -> Affe, Controller 2 -> Schweinchen. Er drückt dieselben "virtuellen Tasten"
// wie die Tastatur, deshalb funktioniert alles andere automatisch mit. Tastatur geht parallel weiter.
// PS4: Kreuz = springen, Viereck = Fähigkeit (Affe: Haken, Schweinchen: Schirm halten),
//      R2/R1 = Seil einholen, L2/L1 = Seil geben, Options = Pausenmenü. Laufen: linker Stick oder Steuerkreuz.
const PAD = {};              // aktueller Controller-Zustand je virtueller Taste
// Tasten-Sätze je SPIELER (nicht je Figur): Spieler 1 = linke Tastaturhälfte + Controller 1,
// Spieler 2 = Pfeile/Nummernblock + Controller 2. Wer welche Figur steuert, wählt man im Startmenü
// („Wer spielt wen?“, js/24-startmenue.js). Standard wie bisher: Spieler 1 = Affe, Spieler 2 = Schweinchen.
const KEYSETS = {
  1: {left:'KeyA', right:'KeyD', jump:'Space', ability:'KeyG', pull:'KeyW', slack:'KeyS', use:'KeyJ', padUse:'Pad1Use'},
  2: {left:'ArrowLeft', right:'ArrowRight', jump:'Numpad0', ability:'Numpad1', pull:'ArrowUp', slack:'ArrowDown', use:'Numpad2', padUse:'Pad2Use'},
};
let monkeyPlayer = 1;        // welcher Spieler (1/2) den Affen steuert
function keysFor(male){
  const s = KEYSETS[male ? monkeyPlayer : 3 - monkeyPlayer];
  return male ? {left:s.left, right:s.right, jump:s.jump, hook:s.ability, pull:s.pull, slack:s.slack, use:s.use, padUse:s.padUse}
              : {left:s.left, right:s.right, jump:s.jump, glide:s.ability, use:s.use, padUse:s.padUse};
}
function setMonkeyPlayer(n){
  monkeyPlayer = n === 2 ? 2 : 1;
  if(typeof p1 !== 'undefined' && p1) p1.keys = keysFor(true);
  if(typeof p2 !== 'undefined' && p2) p2.keys = keysFor(false);
  updateHudKeys();
}
// Anzeige oben links/rechts: welcher Spieler welche Figur mit welchen Tasten steuert
function updateHudKeys(){
  const txt = {
    1: 'A/D bewegen · Leertaste springen/Wandsprung · G {ab} · J am Hebel = Schalter',
    2: '← → bewegen · Num&nbsp;0 springen/Wandsprung · Num&nbsp;1 {ab} · Num&nbsp;2 am Hebel = Schalter'};
  const rope = {1: ' · W ranziehen · S Seil geben', 2: ' · ↑ ranziehen · ↓ Seil geben'};
  const mP = monkeyPlayer, fP = 3 - monkeyPlayer;
  const set = (id, html)=>{ const el = document.getElementById(id); if(el) el.innerHTML = html; };
  set('hudMHead', '<b>Spieler ' + mP + '</b> <span class="p1">● Affe, Haken</span>');
  set('hudMKeys', txt[mP].replace('{ab}', 'Haken schießen/lösen') + rope[mP]);
  set('hudFHead', '<b>Spieler ' + fP + '</b> <span class="p2">● Schweinchen, Schirm</span>');
  set('hudFKeys', txt[fP].replace('{ab}', 'in der Luft halten = Schirm (segeln)'));
}
const PAD_MAP = [1, 2].map(n => ({left:KEYSETS[n].left, right:KEYSETS[n].right, jump:KEYSETS[n].jump, ability:KEYSETS[n].ability,
                                   pull:KEYSETS[n].pull, slack:KEYSETS[n].slack, use:KEYSETS[n].padUse}));
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
    const m = PAD_MAP[i], gp = pads[i];
    const el = document.getElementById('pad'+(i+1));
    padConnected[i] = !!gp;
    if(!gp){
      for(const k of ['left','right','jump','ability','pull','slack','use']) setPad(m[k], false);
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
    setPad(m.left,  ax < -0.35 || b(14));
    setPad(m.right, ax >  0.35 || b(15));
    setPad(m.jump,  b(0));                 // Kreuz / A
    setPad(m.ability, b(2));               // Viereck / X
    // Seil: hoch = einholen, runter = Seil geben (Steuerkreuz oder Stick, nur wenn klar senkrecht gedrückt)
    const ay = gp.axes[1] || 0, vert = Math.abs(ay) > 0.55 && Math.abs(ay) > Math.abs(ax)*0.9;
    setPad(m.pull,  b(12) || (vert && ay < 0));
    setPad(m.slack, b(13) || (vert && ay > 0));
    setPad(m.use,   b(1));                 // Kreis / B = Schalter betätigen
    if(b(9)) restart = true;               // Options / Start
    if(el){ el.classList.add('on'); el.textContent = '🎮 Controller '+(i+1)+' verbunden'; }
  }
  // Options öffnet das Pausenmenü (mit „Level neu starten“) – siehe pollMenuPads in 16-menue.js;
  // nach einem Tod macht Options wie bisher einfach weiter
  prevRestart = restart;
}
window.addEventListener('gamepadconnected', ()=>{ padBlocked = false; });
