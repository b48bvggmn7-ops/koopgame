// editor/js/11-anwaehlen.js – Teil des Level-Editors für "Monchichi Koop".
// Alle editor/js/*.js teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags, kein Build)
// und werden in editor/index.html in fester Reihenfolge geladen.
// Werkzeug „Anwählen ✎“ (Nutzerwunsch 20.11.: „alle Gegenstände anwählen, um die Einstellungen in ihnen zu verändern – bei
// verknüpften Dingen nervig, immer alles neu zu setzen“): ein gesetztes Ding anklicken -> die Eigenschaften-Zeile zeigt SEINE
// Einstellungen (Nummer, Art, Zeit, Richtung …); jede Änderung dort gilt sofort für dieses Ding. Esc / Klick ins Leere /
// anderes Werkzeug hebt die Auswahl auf. Geht für alle Punkt-Elemente aus dem Register (Hebel, Tür, Druckplatte, Rammbalken,
// Windrad, Wechselboden …) sowie Haken (Reichweite), Stacheln (Richtung) und Münzen (Farbe, Klasse).
// Zusammenhängende Teile (Nutzer 20.11.: „jetzt muss ich jedes einzelne Item auswählen – kann er nicht zusammenhängende erkennen?“):
// ein Klick wählt alle direkt aneinander liegenden Teile derselben Sorte MIT DENSELBEN Einstellungen (z. B. alle Kästchen einer Tür,
// eine Reihe Wechselboden A – die Reihe B daneben bleibt eigenständig); Änderungen gelten für die ganze Gruppe.
// Umschalt + Klick wählt nur das eine Teil.
let gewaehlt = null;   // {art: 'element'|'hook'|'spike'|'coin', werkzeug, p, E?, gruppe: [p, …], einzeln}
function anwaehlenGleich(G, a, b){
  if(G.art === 'element') return (a.link || 0) === (b.link || 0) && (G.E.editor.optionen || []).every(o => String(a[o.key] ?? '') === String(b[o.key] ?? ''));
  if(G.art === 'spike') return (a.dir || 0) === (b.dir || 0);
  if(G.art === 'coin') return (a.color || 'gold') === (b.color || 'gold') && (a.klasse || 'pfad') === (b.klasse || 'pfad');
  return false;
}
function anwaehlenGruppe(G){
  const liste = G.art === 'element' ? elementPunkte[G.E.feld] : G.art === 'spike' ? spikes : G.art === 'coin' ? coins : null;
  if(!liste || G.einzeln) return [G.p];
  const an = new Map(); for(const q of liste) if(q === G.p || anwaehlenGleich(G, G.p, q)) an.set(q.c + ',' + q.r, q);
  const out = [G.p], seen = new Set([G.p.c + ',' + G.p.r]), stack = [G.p];
  while(stack.length){ const q = stack.pop();
    for(const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const k = (q.c + dc) + ',' + (q.r + dr), nb = an.get(k);
      if(nb && !seen.has(k)){ seen.add(k); out.push(nb); stack.push(nb); } } }
  return out;
}
function anwaehlenFinden(c, r, einzeln){ const G = anwaehlenFindenEins(c, r); if(G){ G.einzeln = !!einzeln; G.gruppe = anwaehlenGruppe(G); } return G; }
function anwaehlenFindenEins(c, r){
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
  return werkzeugName(G.werkzeug) + nr + (G.gruppe && G.gruppe.length > 1 ? ` – ${G.gruppe.length} zusammenhängende Teile` : '');
}
function anwaehlenKlick(c, r, einzeln){
  gewaehlt = anwaehlenFinden(c, r, einzeln);
  if(!gewaehlt){ leisteAktualisieren(); flash('Anwählen: auf ein gesetztes Ding klicken (Hebel, Tür, Rammbalken, Wechselboden, Haken …)'); return; }
  anwaehlenFelderFuellen(); leisteAktualisieren();
  flash(`${anwaehlenName(gewaehlt)} angewählt – Einstellungen oben ändern (Esc = fertig${gewaehlt.gruppe.length > 1 ? ', Umschalt+Klick = nur ein Teil' : ''})`);
}
function anwaehlenAufheben(){ if(gewaehlt){ gewaehlt = null; leisteAktualisieren(); } }
// eine Änderung in der Eigenschaften-Zeile -> ins angewählte Ding schreiben
function anwaehlenUebernehmen(){
  const G = gewaehlt; if(!G || currentTool !== 'anwaehlen') return;
  for(const p of (G.gruppe && G.gruppe.length ? G.gruppe : [G.p])){   // gilt für alle Teile der Gruppe
    if(G.art === 'element'){
      Object.assign(p, elementOptionen(G.E));
      if(G.E.editor.mitNummer) p.link = Number(linkSelect.value);
    } else if(G.art === 'hook') p.radius = curRadius();
    else if(G.art === 'spike') p.dir = Number(document.getElementById('spikeDir').value);
    else if(G.art === 'coin'){ p.color = document.getElementById('coinColor').value; const kl = document.getElementById('opt-coin-klasse').value; if(kl === 'pfad') delete p.klasse; else p.klasse = kl; }
  }
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
  if(G){ const n = anwaehlenFinden(G.p.c, G.p.r, G.einzeln); gewaehlt = n && n.werkzeug === G.werkzeug ? n : null; if(gewaehlt) anwaehlenFelderFuellen(); leisteAktualisieren(); }
  return r;
};
// Rahmen um das angewählte Ding (aus draw() in 03-zeichnen.js; Ursprung = Reihe 0)
function drawGewaehlt(){
  const G = gewaehlt; if(!G || currentTool !== 'anwaehlen') return;
  const zellen = []; for(const p of (G.gruppe || [G.p])) zellen.push(...(G.art === 'element' && G.E.editor.bereich ? G.E.editor.bereich(p) : [[p.c, p.r]]));
  const cs = zellen.map(z => z[0]), rs = zellen.map(z => z[1]);
  const x = Math.min(...cs)*TILE, y = Math.min(...rs)*TILE, w = (Math.max(...cs) - Math.min(...cs) + 1)*TILE, h = (Math.max(...rs) - Math.min(...rs) + 1)*TILE;
  ctx.save(); ctx.fillStyle = 'rgba(120,220,255,.16)'; for(const [zc, zr] of zellen) ctx.fillRect(zc*TILE, zr*TILE, TILE, TILE);   // jedes Teil der Gruppe
  ctx.setLineDash([6, 4]); ctx.lineDashOffset = -(performance.now()/40) % 10;
  ctx.strokeStyle = '#7fdcff'; ctx.lineWidth = 2.5; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3); ctx.restore();
}
