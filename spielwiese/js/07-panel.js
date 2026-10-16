// 07-panel.js – Spielwiese: Live-Tuning-Panel (Taste Tab / Controller Options).
// Baut sich aus WERTE_LISTE und MECHANIKEN (02-werte.js) selbst auf. Das Spiel läuft weiter, während man dreht.

const panel = document.getElementById('panel');
const panelFelder = {};   // key -> {eingabe, anzeige}

function el(tag, attr, ...kinder){
  const e = document.createElement(tag);
  for(const k in attr || {}){
    if(k === 'text') e.textContent = attr[k];
    else if(k.startsWith('on')) e.addEventListener(k.slice(2), attr[k]);
    else e.setAttribute(k, attr[k]);
  }
  for(const k of kinder) if(k) e.appendChild(k);
  return e;
}
function zahlText(w, v){ return w.schritt >= 1 ? String(Math.round(v)) : v.toFixed(w.schritt >= 0.1 ? 1 : (w.schritt >= 0.01 ? 2 : 3)); }
let meldungFeld = null;
function meldung(t){ if(meldungFeld) meldungFeld.textContent = t; }

function panelBauen(){
  panel.innerHTML = '';
  panel.appendChild(el('h2', {text: 'Spielwiese – Einstellungen (Tab schließt)'}));

  // Figur (nur Aussehen)
  const figWahl = el('div', {class: 'schalter'}, el('span', {text: 'Figur (nur Aussehen):'}));
  for(const [id, n] of [['affe', 'Affe'], ['schwein', 'Schweinchen']]){
    const r = el('input', {type: 'radio', name: 'figur', value: id, onchange: () => { figurAussehen = id; einstellungenMerken(); }});
    if(figurAussehen === id) r.checked = true;
    figWahl.appendChild(el('label', {}, r, document.createTextNode(' ' + n)));
  }
  panel.appendChild(figWahl);

  // Teleport zu den Stationen
  panel.appendChild(el('h3', {text: 'Teleport zu Station'}));
  const tele = el('div', {class: 'knopfreihe'});
  for(const st of STATIONEN) tele.appendChild(el('button', {text: st.nr + ' ' + st.name, onclick: () => zuStation(st)}));
  panel.appendChild(tele);

  // Varianten je Mechanik
  panel.appendChild(el('h3', {text: 'Varianten (Tasten 1–4)'}));
  for(const id in MECHANIKEN){
    const m = MECHANIKEN[id];
    const sel = el('select', {onchange: e => { varianteSetzen(id, +e.target.value); aktiveMechanik = id; }});
    m.varianten.forEach((v, i) => sel.appendChild(el('option', {value: i, text: v.name})));
    sel.value = m.aktiv;
    panelFelder['variante:' + id] = {eingabe: sel};
    panel.appendChild(el('div', {class: 'schalter'}, el('span', {text: m.name + ':'}), sel));
    panel.appendChild(el('div', {class: 'hilfe', text: m.varianten.map(v => v.name + ': ' + v.hilfe).join(' · ')}));
  }

  // Werte je Gruppe
  const gruppen = [...new Set(WERTE_LISTE.map(w => w.gruppe))];
  for(const g of gruppen){
    panel.appendChild(el('h3', {}, el('span', {text: g}),
      el('button', {class: 'klein', text: 'Standard', onclick: () => { standardWerte(g); panelAktualisieren(); meldung(g + ': Standard'); }})));
    for(const w of WERTE_LISTE.filter(x => x.gruppe === g)){
      if(w.art === 'schalter'){
        const cb = el('input', {type: 'checkbox', onchange: e => { V[w.key] = e.target.checked; einstellungenMerken(); }});
        cb.checked = !!V[w.key];
        panelFelder[w.key] = {eingabe: cb};
        panel.appendChild(el('label', {class: 'schalter', title: w.hilfe || ''}, cb, document.createTextNode(w.name)));
      } else {
        const anzeige = el('span', {class: 'zahl'});
        const sl = el('input', {type: 'range', min: w.min, max: w.max, step: w.schritt,
          oninput: e => { V[w.key] = parseFloat(e.target.value); anzeige.textContent = zahlText(w, V[w.key]); einstellungenMerken(); }});
        sl.value = V[w.key]; anzeige.textContent = zahlText(w, V[w.key]);
        panelFelder[w.key] = {eingabe: sl, anzeige};
        panel.appendChild(el('div', {class: 'zeile', title: w.hilfe || ''}, el('label', {text: w.name}), sl, anzeige));
      }
      if(w.hilfe) panel.appendChild(el('div', {class: 'hilfe', text: w.hilfe}));
    }
  }

  // Voreinstellungen (eigener Schlüssel „spielwiese-voreinstellungen“)
  panel.appendChild(el('h3', {text: 'Voreinstellungen'}));
  const name = el('input', {type: 'text', placeholder: 'Name, z. B. „knackig“'});
  panel.appendChild(el('div', {class: 'schalter'}, name, el('button', {text: 'Speichern', onclick: () => {
    const n = name.value.trim(); if(!n){ meldung('Bitte einen Namen eingeben'); return; }
    const alle = speicherLesen('voreinstellungen', {}); alle[n] = einstellungenObjekt();
    speicherSchreiben('voreinstellungen', alle); name.value = ''; voreinstellungenListe(); meldung('Gespeichert: ' + n);
  }})));
  const liste = el('div', {id: 'voreinstListe'});
  panel.appendChild(liste);
  panel.appendChild(el('button', {text: 'Alles auf Standard', onclick: () => { standardWerte(null); panelAktualisieren(); meldung('Alles auf Standard'); }}));

  // Export / Import als JSON-Text
  panel.appendChild(el('h3', {text: 'Export / Import (JSON-Text)'}));
  const feld = el('textarea', {placeholder: 'Hier erscheint der Export – oder hier JSON einfügen und „Import“ drücken'});
  panel.appendChild(feld);
  panel.appendChild(el('div', {class: 'knopfreihe'},
    el('button', {text: 'Export', onclick: () => { feld.value = JSON.stringify(einstellungenObjekt(), null, 1); feld.select(); meldung('Export im Feld'); }}),
    el('button', {text: 'Kopieren', onclick: () => {
      if(!feld.value) feld.value = JSON.stringify(einstellungenObjekt(), null, 1);
      (navigator.clipboard ? navigator.clipboard.writeText(feld.value) : Promise.reject()).then(() => meldung('Kopiert'), () => { feld.select(); meldung('Bitte mit Strg+C kopieren'); });
    }}),
    el('button', {text: 'Import', onclick: () => {
      try{ if(einstellungenAnwenden(JSON.parse(feld.value))){ einstellungenMerken(); panelAktualisieren(); meldung('Importiert'); } }
      catch(err){ meldung('Das ist kein gültiger JSON-Text'); }
    }})));
  karteBereichBauen(panel);   // Mini-Editor (08-editor.js)
  meldungFeld = el('div', {class: 'meldung'});
  panel.appendChild(meldungFeld);
  voreinstellungenListe();
}

function voreinstellungenListe(){
  const liste = document.getElementById('voreinstListe'); if(!liste) return;
  liste.innerHTML = '';
  const alle = speicherLesen('voreinstellungen', {});
  const namen = Object.keys(alle);
  if(!namen.length) liste.appendChild(el('div', {class: 'hilfe', text: 'noch keine gespeichert'}));
  for(const n of namen) liste.appendChild(el('div', {class: 'voreinst'}, el('span', {text: n}), el('span', {},
    el('button', {class: 'klein', text: 'Laden', onclick: () => { einstellungenAnwenden(alle[n]); einstellungenMerken(); panelAktualisieren(); meldung('Geladen: ' + n); }}),
    el('button', {class: 'klein', text: 'Löschen', onclick: () => { delete alle[n]; speicherSchreiben('voreinstellungen', alle); voreinstellungenListe(); }}))));
}

function panelAktualisieren(){
  for(const w of WERTE_LISTE){
    const f = panelFelder[w.key]; if(!f) continue;
    if(w.art === 'schalter') f.eingabe.checked = !!V[w.key];
    else { f.eingabe.value = V[w.key]; f.anzeige.textContent = zahlText(w, V[w.key]); }
  }
  for(const id in MECHANIKEN){ const f = panelFelder['variante:' + id]; if(f) f.eingabe.value = MECHANIKEN[id].aktiv; }
  for(const r of panel.querySelectorAll('input[name=figur]')) r.checked = r.value === figurAussehen;
}
function panelUmschalten(){ panel.classList.toggle('offen'); }

// Nach Klick/Änderung den Fokus abgeben, damit Leertaste/Pfeile wieder die Figur steuern (nicht den Regler/Knopf)
panel.addEventListener('change', e => { if(e.target.type !== 'text' && e.target.tagName !== 'TEXTAREA') e.target.blur(); });
panel.addEventListener('click', e => { if(e.target.tagName === 'BUTTON' || e.target.type === 'radio' || e.target.type === 'checkbox') e.target.blur(); });
panel.addEventListener('pointerup', e => { if(e.target.type === 'range') e.target.blur(); });

