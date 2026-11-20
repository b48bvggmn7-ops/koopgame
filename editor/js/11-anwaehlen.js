// editor/js/11-anwaehlen.js – Teil des Level-Editors für "Monchichi Koop".
// Alle editor/js/*.js teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags, kein Build)
// und werden in editor/index.html in fester Reihenfolge geladen.
// Werkzeug „Anwählen ✎“ (Nutzerwunsch 20.11.: „alle Gegenstände anwählen, um die Einstellungen in ihnen zu verändern – bei
// verknüpften Dingen nervig, immer alles neu zu setzen“): ein gesetztes Ding anklicken -> die Eigenschaften-Zeile zeigt SEINE
// Einstellungen (Nummer, Art, Zeit, Richtung …); jede Änderung dort gilt sofort für dieses Ding. Esc / Klick ins Leere /
// anderes Werkzeug hebt die Auswahl auf. Geht für alle Punkt-Elemente aus dem Register (Hebel, Tür, Druckplatte, Rammbalken,
// Windrad, Wechselboden …) sowie Haken (Reichweite), Stacheln (Richtung) und Münzen (Farbe, Klasse).
let gewaehlt = null;   // {art: 'element'|'hook'|'spike'|'coin', werkzeug, p, E?}
function anwaehlenFinden(c, r){
  const P = punktElemente();
  for(const E of P){ const p = elementPunkte[E.feld].find(d => d.c === c && d.r === r); if(p) return {art: 'element', E, p, werkzeug: E.editor.werkzeug}; }
  for(const E of P){ const p = elementPunkte[E.feld].find(d => punktBelegt(E, d, c, r)); if(p) return {art: 'element', E, p, werkzeug: E.editor.werkzeug}; }   // größer gezeichnete (bereich)
  const hk = hooks.find(h => h.c === c && h.r === r); if(hk) return {art: 'hook', p: hk, werkzeug: 'hook'};
  const sp = spikes.find(h => h.c === c && h.r === r); if(sp) return {art: 'spike', p: sp, werkzeug: 'spike'};
  const co = coins.find(h => h.c === c && h.r === r); if(co) return {art: 'coin', p: co, werkzeug: 'coin'};
  return null;
}
const wahlSetzen = (el, v) => { if(el && v !== undefined && v !== null && [...el.options].some(o => o.value === String(v))) el.value = String(v); else if(el && el.options.length) el.selectedIndex = 0; };
// die Felder oben auf die Werte des angewählten Dings stellen
function anwaehlenFelderFuellen(){
  const G = gewaehlt; if(!G) return;
  if(G.art === 'element'){
    if(G.p.link) { wahlSetzen(linkSelect, G.p.link); showLinkName(); }
    for(const o of (G.E.editor.optionen || [])) wahlSetzen(document.getElementById(`opt-${G.werkzeug}-${o.key}`), G.p[o.key]);
  } else if(G.art === 'hook') radiusInput.value = G.p.radius;
  else if(G.art === 'spike') wahlSetzen(document.getElementById('spikeDir'), G.p.dir || 0);
  else if(G.art === 'coin'){ wahlSetzen(document.getElementById('coinColor'), G.p.color || 'gold'); wahlSetzen(document.getElementById('opt-coin-klasse'), G.p.klasse || 'pfad'); }
}
function anwaehlenName(G){
  const nr = G.art === 'element' && G.p.link && !(G.E.editor.nummerAktiv && !G.E.editor.nummerAktiv(G.p)) ? ` (Nummer ${G.p.link})` : '';
  return werkzeugName(G.werkzeug) + nr;
}
function anwaehlenKlick(c, r){
  gewaehlt = anwaehlenFinden(c, r);
  if(!gewaehlt){ leisteAktualisieren(); flash('Anwählen: auf ein gesetztes Ding klicken (Hebel, Tür, Rammbalken, Wechselboden, Haken …)'); return; }
  anwaehlenFelderFuellen(); leisteAktualisieren();
  flash(`${anwaehlenName(gewaehlt)} angewählt – Einstellungen oben ändern (Esc = fertig)`);
}
function anwaehlenAufheben(){ if(gewaehlt){ gewaehlt = null; leisteAktualisieren(); } }
// eine Änderung in der Eigenschaften-Zeile -> ins angewählte Ding schreiben
function anwaehlenUebernehmen(){
  const G = gewaehlt; if(!G || currentTool !== 'anwaehlen') return;
  if(G.art === 'element'){
    Object.assign(G.p, elementOptionen(G.E));
    if(G.E.editor.mitNummer) G.p.link = Number(linkSelect.value);
  } else if(G.art === 'hook') G.p.radius = curRadius();
  else if(G.art === 'spike') G.p.dir = Number(document.getElementById('spikeDir').value);
  else if(G.art === 'coin'){ G.p.color = document.getElementById('coinColor').value; const kl = document.getElementById('opt-coin-klasse').value; if(kl === 'pfad') delete G.p.klasse; else G.p.klasse = kl; }
  save(); flash(`${anwaehlenName(G)} geändert`);
}
for(const el of [linkSelect, radiusInput, document.getElementById('spikeDir'), document.getElementById('coinColor'), document.getElementById('opt-coin-klasse'),
                 ...document.querySelectorAll('#elementOpts select')])
  if(el) el.addEventListener('change', anwaehlenUebernehmen);
radiusInput.addEventListener('input', anwaehlenUebernehmen);
// anderes Werkzeug gewählt / Esc: Auswahl weg
for(const el of document.querySelectorAll('#app .tool')) el.addEventListener('click', () => { if(el.dataset.tool !== 'anwaehlen') gewaehlt = null; leisteAktualisieren(); });
window.addEventListener('keydown', e => { if(e.key === 'Escape') anwaehlenAufheben(); });
// nach Rückgängig/Laden sind die Dinge neue Objekte: dasselbe Ding am selben Platz wiederfinden (sonst Auswahl weg)
const _applyVorAnwaehlen = applySnapshot;
applySnapshot = function(){
  const G = gewaehlt, r = _applyVorAnwaehlen.apply(this, arguments);
  if(G){ const n = anwaehlenFinden(G.p.c, G.p.r); gewaehlt = n && n.werkzeug === G.werkzeug ? n : null; if(gewaehlt) anwaehlenFelderFuellen(); leisteAktualisieren(); }
  return r;
};
// Rahmen um das angewählte Ding (aus draw() in 03-zeichnen.js; Ursprung = Reihe 0)
function drawGewaehlt(){
  const G = gewaehlt; if(!G || currentTool !== 'anwaehlen') return;
  const zellen = G.art === 'element' && G.E.editor.bereich ? G.E.editor.bereich(G.p) : [[G.p.c, G.p.r]];
  const cs = zellen.map(z => z[0]), rs = zellen.map(z => z[1]);
  const x = Math.min(...cs)*TILE, y = Math.min(...rs)*TILE, w = (Math.max(...cs) - Math.min(...cs) + 1)*TILE, h = (Math.max(...rs) - Math.min(...rs) + 1)*TILE;
  ctx.save(); ctx.fillStyle = 'rgba(120,220,255,.12)'; ctx.fillRect(x, y, w, h);
  ctx.setLineDash([6, 4]); ctx.lineDashOffset = -(performance.now()/40) % 10;
  ctx.strokeStyle = '#7fdcff'; ctx.lineWidth = 2.5; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3); ctx.restore();
}
