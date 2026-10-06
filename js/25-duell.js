// 25-duell.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Tode-Duell: Affe gegen Schweinchen (Nutzerwunsch „wer stirbt öfter?“) ----------
// Zählt pro Level die Tode je Figur (deathCount, 01-level.js). Anzeige oben rechts (#duelCard), Level-Bilanz beim
// Ziel-Tanz (#toast), eine Zeile unter jeder geschafften Levelkarte und die Totenkopf-Maske im Hauptmenü
// (24-startmenue.js). Wer mehr Tode hat, wird mit jedem Tod Vorsprung größer. Ändert nichts am Spiel selbst.
// Münzen stehen bewusst NICHT hier – dafür gibt es den Münz-Zähler oben links.

const DUEL_NAMES = {m: 'Affe', f: 'Schweinchen'};
const DUEL_IMG = {m: 'assets/monkey.png', f: 'assets/pig.png'};
const DUEL_GROW_STEP = 0.12, DUEL_GROW_MAX = 0.8;   // pro Tod Vorsprung 12 % größer, höchstens +80 %

function levelStats(){ return {m: deathCount.m, f: deathCount.f}; }
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

// ---------- Level-Bilanz beim Ziel-Tanz ----------
function winSummaryHTML(){
  const st = levelStats(), lead = duelLead(st), grow = duelGrow(st);
  const side = w => `<div class="ws ${w}${lead === w ? ' lead' : ''}" style="--grow:${lead === w ? grow.toFixed(2) : 1}">
      <img class="ava" src="${DUEL_IMG[w]}" alt="${DUEL_NAMES[w]}"><b>${w === 'm' ? st.m : st.f}</b></div>`;
  const note = lead ? `Meiste Tode: <b>${DUEL_NAMES[lead]}</b>` : st.m === 0 ? 'Ohne einen einzigen Tod' : 'Gleich oft gestorben';
  return `<div class="wt">Beide im Ziel</div>
    <div class="wsum">${side('m')}<div class="mid">${SKULL_ICON}</div>${side('f')}</div>
    <div class="note">${note}</div>`;
}
function showWinSummary(){
  const t = document.getElementById('toast');
  t.innerHTML = winSummaryHTML(); t.classList.add('show');
}

// eine knappe Zeile für die Levelkarte (gemerkter Stand der letzten geschafften Runde)
function levelCardStatsHTML(st){
  if(!st) return '';
  const lead = duelLead(st);
  const part = w => `<img src="${DUEL_IMG[w]}" alt=""><b class="${lead === w ? 'lead' : ''}">${w === 'm' ? st.m : st.f}</b>`;
  return `${SKULL_ICON}${part('m')}${part('f')}`;
}

// ---------- Hauptmenü: Totenkopf-Maske für den, der insgesamt mehr Tode hat ----------
// Summe über alle geschafften Levels (je letzte geschaffte Runde, Spielstand save.stats aus 24-startmenue.js)
function totalDeaths(stats){
  const t = {m: 0, f: 0};
  for(const k in (stats || {})){ const s = stats[k]; if(s){ t.m += s.m || 0; t.f += s.f || 0; } }
  return t;
}
// Maske im selben Koordinatensystem wie die Figuren-Bilder des Startmenüs (viewBox 0 -14 220 240, Gesicht um 110/122)
function skullMaskSVG(){
  return `<svg class="skullmask" viewBox="0 -14 220 240" aria-hidden="true">
  <defs><linearGradient id="sm-gBone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf8ef"/><stop offset="1" stop-color="#cfc8b6"/></linearGradient></defs>
  <path d="M14 112Q110 92 206 112" fill="none" stroke="#1d1a1f" stroke-width="9" stroke-linecap="round" opacity=".9"/>
  <path d="M110 30C58 30 32 68 34 112c1 28 14 42 26 50l2 18c2 14 18 22 48 22s46-8 48-22l2-18c12-8 25-22 26-50 2-44-24-82-76-82z"
        fill="url(#sm-gBone)" stroke="#1d1a1f" stroke-width="4"/>
  <path d="M120 40l-6 14 8 8-5 12" fill="none" stroke="#8a826f" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M52 118c0-20 12-32 28-32s26 12 26 30-12 30-28 30-26-10-26-28zM114 116c0-18 10-30 26-30s28 12 28 32-10 28-26 28-28-12-28-30z" fill="#1d1a1f"/>
  <circle cx="82" cy="112" r="4.5" fill="#ff5c6c"/><circle cx="138" cy="112" r="4.5" fill="#ff5c6c"/>
  <path d="M110 140l-10 20q10-4 20 0z" fill="#1d1a1f"/>
  <path d="M74 172h72v14q-36 10-72 0z" fill="#efe9da" stroke="#1d1a1f" stroke-width="3"/>
  <path d="M86 172v15M98 172v17M110 172v18M122 172v17M134 172v15" stroke="#1d1a1f" stroke-width="2.5"/>
</svg>`;
}
// setzt/entfernt die Maske an den Figuren im Hauptmenü (#sm-s-menu); gibt zurück, wer sie trägt ('' = niemand)
function applySkullMask(stats){
  const t = totalDeaths(stats), lead = duelLead(t);
  document.querySelectorAll('#sm-s-menu .bob[data-char]').forEach(b => {
    const who = b.dataset.char === 'monkey' ? 'm' : 'f';
    let mask = b.querySelector('.skullmask');
    if(who === lead && !mask){ b.insertAdjacentHTML('beforeend', skullMaskSVG()); }
    else if(who !== lead && mask) mask.remove();
  });
  return lead;
}
