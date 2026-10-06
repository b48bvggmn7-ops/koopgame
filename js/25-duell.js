// 25-duell.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Duell: Affe gegen Schweinchen (Nutzerwunsch „wer stirbt öfter, wer hat mehr Münzen?“) ----------
// Zählt pro Level: Tode (deathCount, 01-level.js) und selbst gesammelte Münzen (coin.takenBy, 07-effekte-ton-muenzen.js).
// Anzeige oben rechts (#duelCard), Level-Bilanz beim Ziel-Tanz (#toast) und unter jeder geschafften Levelkarte
// (24-startmenue.js). Ändert nichts am Spiel selbst.

const DUEL_NAMES = {m: 'Affe', f: 'Schweinchen'};
const DUEL_ICON = {m: '🐒', f: '🐷'};

function levelStats(){
  const st = {m: deathCount.m, f: deathCount.f, cm: 0, cf: 0};
  for(const c of coins) if(c.taken){ if(c.takenBy === 'm') st.cm++; else if(c.takenBy === 'f') st.cf++; }
  return st;
}
// wer ist „vorne“? 'm', 'f' oder '' (Gleichstand)
function duelLead(a, b){ return a > b ? 'm' : b > a ? 'f' : ''; }

// lustige Sprüche für den, der öfter gestorben ist (n = Name, k = Tode); Auswahl fest nach Spielstand
const CLUMSY_LINES = [
  (n, k) => `${n} hat ${k}× den Boden geküsst 💋`,
  (n, k) => `${n} wollte nur mal schauen, wie es da unten aussieht 👀`,
  (n, k) => `${k} Tode – ${n} sammelt lieber Pflaster als Münzen 🩹`,
  (n, k) => `${n} bekommt das goldene Pflaster am Bande 🎖️`,
  (n, k) => `${n}: „Das war Absicht!“ (${k}×) 🙈`,
];
function clumsyLine(st){
  const who = duelLead(st.m, st.f);
  if(!who) return st.m === 0 ? 'Kein einziger Tod – ihr seid Profis! ✨' : `Gleich oft gestorben (${st.m}×) – ein Herz und eine Seele 💕`;
  const k = who === 'm' ? st.m : st.f;
  return CLUMSY_LINES[(st.m + st.f) % CLUMSY_LINES.length](DUEL_NAMES[who], k);
}

// ---------- Anzeige oben rechts ----------
let duelKey = '';
function updateDuelHUD(){
  const card = document.getElementById('duelCard'); if(!card || !p1) return;
  const st = levelStats(), key = st.m + '|' + st.f + '|' + st.cm + '|' + st.cf;
  if(key === duelKey) return;
  duelKey = key;
  document.getElementById('deathM').textContent = st.m; document.getElementById('deathF').textContent = st.f;
  document.getElementById('coinsM').textContent = st.cm; document.getElementById('coinsF').textContent = st.cf;
  const dl = duelLead(st.m, st.f), cl = duelLead(st.cm, st.cf);
  for(const w of ['m', 'f']){
    const el = card.querySelector('.duo.' + w);
    el.classList.toggle('lead', dl === w);    // öfter gestorben -> Pflaster + „Tollpatsch“
    el.classList.toggle('rich', cl === w);    // mehr Münzen -> Krone
  }
}
// kleiner Hüpfer bei einem Tod (aus die(), 06-tod-checkpoints.js)
function duelBump(who){
  const el = document.querySelector('#duelCard .duo.' + who); if(!el) return;
  el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
}

// ---------- Level-Bilanz beim Ziel-Tanz ----------
function winSummaryHTML(){
  const st = levelStats(), dl = duelLead(st.m, st.f), cl = duelLead(st.cm, st.cf);
  const side = w => `<div class="ws ${w}${dl === w ? ' lead' : ''}${cl === w ? ' rich' : ''}">
      <div class="ava"><img src="assets/${w === 'm' ? 'monkey' : 'pig'}.png" alt=""><span class="crown">👑</span><span class="band">🩹</span></div>
      <div class="nm">${DUEL_NAMES[w]}</div>
      <div class="row">💀 <b>${w === 'm' ? st.m : st.f}</b> &nbsp; 🪙 <b>${w === 'm' ? st.cm : st.cf}</b></div></div>`;
  const award = dl ? `<div class="award">🩹 Tollpatsch des Levels: <b>${DUEL_ICON[dl]} ${DUEL_NAMES[dl]}</b></div>` : '';
  return `<div class="wt">Beide im Ziel! 🎉</div>
    <div class="wsum">${side('m')}<div class="vs">VS</div>${side('f')}</div>
    ${award}<div class="line">${clumsyLine(st)}</div>`;
}
function showWinSummary(){
  const t = document.getElementById('toast');
  t.innerHTML = winSummaryHTML(); t.classList.add('show');
}

// kurze Zeile für die Levelkarte (gemerkter Stand der letzten geschafften Runde)
function levelCardStatsHTML(st){
  if(!st) return '';
  const dl = duelLead(st.m, st.f);
  return `<span class="ds">💀 🐒 ${st.m} · 🐷 ${st.f}</span>` +
         `<span class="dt">${dl ? '🩹 Tollpatsch: ' + DUEL_ICON[dl] + ' ' + DUEL_NAMES[dl] : st.m === 0 ? '✨ ohne Tod!' : '💕 Gleichstand'}</span>`;
}
