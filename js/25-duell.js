// 25-duell.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Tode-Duell: Affe gegen Schweinchen (Nutzerwunsch „wer stirbt öfter?“) ----------
// Zählt pro Level die Tode je Figur (deathCount, 01-level.js). Anzeige oben rechts (#duelCard), Level-Bilanz beim
// Ziel-Tanz, Statistik-Bildschirm nach dem Tanz und eine Zeile unter jeder geschafften Levelkarte
// (24-startmenue.js). Wer mehr Tode hat, wird mit jedem Tod Vorsprung größer. Ändert nichts am Spiel selbst.
// Im Spiel stehen die Münzen bewusst NICHT in der Tode-Anzeige – dafür gibt es den Münz-Zähler oben links.

const DUEL_NAMES = {m: 'Affe', f: 'Schweinchen'};
const DUEL_IMG = {m: 'assets/monkey.png', f: 'assets/pig.png'};
const DUEL_GROW_STEP = 0.12, DUEL_GROW_MAX = 0.8;   // pro Tod Vorsprung 12 % größer, höchstens +80 %

// Tode je Figur + selbst gesammelte Münzen (cm/cf) und wie viele Münzen der eigenen Farbe es gibt (tm/tf)
function levelStats(){
  const st = {m: deathCount.m, f: deathCount.f, cm: 0, cf: 0, tm: 0, tf: 0};
  for(const c of coins){
    if(c.color === 'blue') st.tm++; else if(c.color === 'pink') st.tf++;
    if(c.taken){ if(c.takenBy === 'm') st.cm++; else if(c.takenBy === 'f') st.cf++; }
  }
  return st;
}
// wer hat mehr Tode? 'm', 'f' oder '' (Gleichstand)
function duelLead(st){ return st.m > st.f ? 'm' : st.f > st.m ? 'f' : ''; }
function duelGrow(st){ return 1 + Math.min(DUEL_GROW_MAX, Math.abs(st.m - st.f)*DUEL_GROW_STEP); }

// kleiner Totenkopf als Bild (für Anzeige und Karten)
const SKULL_ICON = `<svg class="skullIcon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.9 2 3 5.6 3 10.3c0 2.7 1.3 4.6 3 5.8V19a1 1 0 0 0 1 1h1.5v-2h1.5v2h4v-2h1.5v2H17a1 1 0 0 0 1-1v-2.9c1.7-1.2 3-3.1 3-5.8C21 5.6 17.1 2 12 2zm-3.6 11.2a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4zm7.2 0a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4zM12 13.6l1.2 2.2h-2.4z"/></svg>`;

// ---------- Anzeige oben rechts ----------
let duelKey = '';
function updateDuelHUD(){
  const card = document.getElementById('duelCard'); if(!card || !p1) return;
  const st = levelStats(), key = st.m + '|' + st.f;
  if(key === duelKey) return;
  duelKey = key;
  document.getElementById('deathM').textContent = st.m; document.getElementById('deathF').textContent = st.f;
  const lead = duelLead(st), grow = duelGrow(st);
  for(const w of ['m', 'f']){
    const el = card.querySelector('.duo.' + w);
    el.classList.toggle('lead', lead === w);
    el.style.setProperty('--grow', lead === w ? grow.toFixed(2) : '1');
  }
}
// kleiner Hüpfer bei einem Tod (aus die(), 06-tod-checkpoints.js)
function duelBump(who){
  const el = document.querySelector('#duelCard .duo.' + who); if(!el) return;
  el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
}

// ---------- beim Ziel-Tanz: kurze Einblendung (die Zahlen zeigt danach der Statistik-Bildschirm, 24-startmenue.js) ----------
function showWinSummary(){
  const t = document.getElementById('toast');
  t.textContent = 'Beide im Ziel! 🎉'; t.classList.add('show');
}

// eine knappe Zeile für die Levelkarte (gemerkter Stand der letzten geschafften Runde)
function levelCardStatsHTML(st){
  if(!st) return '';
  const lead = duelLead(st);
  const part = w => `<img src="${DUEL_IMG[w]}" alt=""><b class="${lead === w ? 'lead' : ''}">${w === 'm' ? st.m : st.f}</b>`;
  return `${SKULL_ICON}${part('m')}${part('f')}`;
}
