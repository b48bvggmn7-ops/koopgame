// werkstatt/werkstatt.js – Werkstatt für Foto-Material (werkstatt.html), Teil von "Monchichi Koop".
// Je Textur aus FOTO_MAT_TEXTUREN (js/12c-foto-material.js): Vorlage mit Raster, Text für ChatGPT, Bild einlesen,
// auf Zielgröße bringen, Nähte glätten (nahtlos kachelbar), Vorschau, Probe im Spiel (localStorage), Herunterladen
// und „Auf GitHub speichern“ (assets/texturen/<id>.webp, Schlüssel wie im Editor: localStorage 'monchichi_github_token').

const WS_GH = {owner: 'b48bvggmn7-ops', repo: 'koopgame', branch: 'main', api: 'https://api.github.com', key: 'monchichi_github_token'};
const WS_RAND = 0.22;          // Nähte glätten: so breit (Anteil) wird an jedem Rand überblendet
const WS_KANTE_UNTEN = 0.72;   // Gras-Kante: ab hier (Anteil der Höhe) nach unten weich in die Erde ausblenden
const WS_QUALITAET = 0.88;     // WebP-Qualität beim Speichern
const WS_SPIEL_MASSSTAB = 1.275; // Vorschau: Bildpunkte je Welt-px wie im Spiel im Vollbild (1920 breit, Zoom 0,85) – die Vorschau
                                // zeigt also die Steine so groß wie im Vollbild-Spiel

const WS_TEXTE = {
  erde: 'Erstelle eine fotorealistische, NAHTLOS KACHELBARE Textur, quadratisch (1024×1024 Pixel): dunkler, feuchter Waldboden ' +
    'im Querschnitt, so wie man ihn seitlich in einer Böschung sieht – Erde mit kleinen Steinen, feinen Wurzeln und ein paar ' +
    'eingedrückten Blättern. Gerade von vorne, ohne Perspektive und ohne Horizont. Gleichmäßiges, weiches Licht ohne harte ' +
    'Schatten, keine auffälligen Einzelstücke (damit man die Wiederholung nicht erkennt). Farben gedämpft braun-grau-grün, ' +
    'passend zum angehängten Nebelwald-Bild. Die angehängte Vorlage zeigt nur die Größe (jedes Rasterkästchen = ein Spielfeld-' +
    'Kästchen, die kleine Figur = so groß sind die Spielfiguren) – Raster, Figur und Schrift NICHT ins Bild übernehmen.',
  wand: 'Erstelle eine fotorealistische, NAHTLOS KACHELBARE Textur, quadratisch (1024×1024 Pixel): eine Wand aus grauem, ' +
    'bemoostem Waldfelsen bzw. alten, verwitterten Natursteinen, gerade von vorne gesehen, ohne Perspektive. Etwas Moos und ' +
    'Flechten in den Fugen. Gleichmäßiges, weiches Licht ohne harte Schatten, keine auffälligen Einzelstücke. Farben gedämpft ' +
    'grau-grün, passend zum angehängten Nebelwald-Bild. Die angehängte Vorlage zeigt nur die Größe (jedes Rasterkästchen = ein ' +
    'Spielfeld-Kästchen, die kleine Figur = so groß sind die Spielfiguren) – Raster, Figur und Schrift NICHT ins Bild übernehmen.',
  kante: 'Erstelle einen fotorealistischen Streifen im Format 1024×256 Pixel mit DURCHSICHTIGEM HINTERGRUND (PNG), der nach ' +
    'links und rechts NAHTLOS KACHELBAR ist. Er liegt in einem 2D-Spiel oben auf jeder Bodenkante, seitlich gesehen. Die rote ' +
    'Linie in der angehängten Vorlage ist die Bodenoberfläche: DARÜBER niedriges Waldgras, Moos, ein paar kleine Farne und ' +
    'Herbstblätter, die unterschiedlich hoch bis höchstens zur gestrichelten Linie hochragen – dahinter alles durchsichtig. ' +
    'DARUNTER eine dicke Moos- und Wurzelkante, die nach unten in dunkle Erde übergeht. Gerade von der Seite, weiches Licht, ' +
    'Farben gedämpft grün-braun mit etwas Herbstgelb, passend zum angehängten Nebelwald-Bild. Raster und Schrift der Vorlage ' +
    'NICHT ins Bild übernehmen.',
};
const WS_HINWEIS = {
  erde: 'Das Innere vom Boden. Wiederholt sich in alle Richtungen.',
  wand: 'Das Innere der Wände und Säulen. Wiederholt sich in alle Richtungen.',
  kante: 'Liegt oben auf jeder freien Boden- und Wandkante. Wiederholt sich nach links und rechts.',
};

const ws = {};   // je Textur: {quelle (Bild), ergebnis (Leinwand), el: {...}}
const $n = (tag, attr, kinder) => { const e = document.createElement(tag); Object.assign(e, attr || {}); (kinder || []).forEach(k => e.append(k)); return e; };
function wsMeldung(id, text, art){ const m = ws[id].el.meldung; m.textContent = text || ''; m.className = 'meldung' + (art ? ' ' + art : ''); }
const wsPxJeWelt = T => T.w/T.weltB;

// ---------- Vorlage (Raster in Zielgröße) ----------
function wsVorlage(id){
  const T = FOTO_MAT_TEXTUREN[id], c = $n('canvas', {width: T.w, height: T.h}), q = c.getContext('2d'), k = wsPxJeWelt(T), box = 40*k;
  q.font = 'bold ' + Math.round(T.h*0.045) + 'px system-ui, sans-serif';
  if(id === 'kante'){
    const linie = FOTO_MAT_KANTE.ueber*k;
    for(let y = 0; y < linie; y += 16) for(let x = 0; x < T.w; x += 16) { q.fillStyle = ((x + y)/16) % 2 ? '#d9d9d9' : '#f4f4f4'; q.fillRect(x, y, 16, 16); }
    const gr = q.createLinearGradient(0, linie, 0, T.h); gr.addColorStop(0, '#4f6b3c'); gr.addColorStop(0.45, '#4a3a2a'); gr.addColorStop(1, '#2e241b');
    q.fillStyle = gr; q.fillRect(0, linie, T.w, T.h - linie);
    q.strokeStyle = 'rgba(0,0,0,.35)'; q.lineWidth = 2;
    for(let x = 0; x <= T.w; x += box){ q.beginPath(); q.moveTo(x, 0); q.lineTo(x, T.h); q.stroke(); }
    q.setLineDash([14, 10]); q.strokeStyle = '#2f8a3a'; q.lineWidth = 3; q.beginPath(); q.moveTo(0, 6); q.lineTo(T.w, 6); q.stroke(); q.setLineDash([]);
    q.strokeStyle = '#e53935'; q.lineWidth = 5; q.beginPath(); q.moveTo(0, linie); q.lineTo(T.w, linie); q.stroke();
    q.fillStyle = '#1d3b22'; q.fillText('Gras / Moos ragt hoch (dahinter durchsichtig)', 20, linie - 30);
    q.fillStyle = '#f1e6d6'; q.fillText('Bodenoberfläche (rot) – darunter Moos-/Wurzelkante → Erde', 20, linie + 50);
    wsFigur(q, T.w - 3*box, linie, k);
  } else {
    q.fillStyle = id === 'erde' ? '#4a3a2c' : '#5d625c'; q.fillRect(0, 0, T.w, T.h);
    q.strokeStyle = 'rgba(255,255,255,.35)'; q.lineWidth = 2;
    for(let x = 0; x <= T.w + 1; x += box){ q.beginPath(); q.moveTo(x, 0); q.lineTo(x, T.h); q.stroke(); }
    for(let y = 0; y <= T.h + 1; y += box){ q.beginPath(); q.moveTo(0, y); q.lineTo(T.w, y); q.stroke(); }
    q.fillStyle = 'rgba(255,255,255,.85)';
    q.fillText((id === 'erde' ? 'Erde' : 'Wand') + ' – nahtlos kachelbar, ' + T.w + '×' + T.h, 24, 60);
    q.fillText('1 Kästchen = 40 Spiel-Pixel', 24, 60 + T.h*0.06);
    wsFigur(q, box*2.5, box*4, k);
  }
  return c;
}
// Größenvergleich: Spielfigur, so groß wie sie im Spiel gezeichnet wird (rund 36 × 40 Welt-px), Füße bei (x, y)
function wsFigur(q, x, y, k){
  q.fillStyle = 'rgba(255,190,120,.9)'; q.beginPath(); q.roundRect(x - 18*k, y - 40*k, 36*k, 40*k, 14*k); q.fill();
  q.fillStyle = 'rgba(255,255,255,.95)'; q.font = 'bold ' + Math.max(11, Math.round(10*k)) + 'px system-ui'; q.fillText('Figur', x - 18*k, y - 45*k);
}

// ---------- Bild verarbeiten: Zielgröße (füllend zuschneiden), Nähte glätten, Kante unten/oben ausblenden ----------
function wsVerarbeiten(id){
  const W = ws[id], T = FOTO_MAT_TEXTUREN[id], img = W.quelle; if(!img) return;
  const c = $n('canvas', {width: T.w, height: T.h}), q = c.getContext('2d');
  const s = Math.max(T.w/img.width, T.h/img.height), sw = T.w/s, sh = T.h/s;
  q.drawImage(img, (img.width - sw)/2, (img.height - sh)/2, sw, sh, 0, 0, T.w, T.h);
  let d = q.getImageData(0, 0, T.w, T.h);
  if(W.el.glaetten.checked) d = wsNahtlos(d, T.x, T.y);
  const px = d.data;
  if(id === 'kante'){
    const oben = W.el.oben.checked, linie = FOTO_MAT_KANTE.ueber/T.weltH, u0 = WS_KANTE_UNTEN;
    for(let y = 0; y < T.h; y++){
      const v = y/T.h; let a = 1;
      if(v > u0) a *= Math.max(0, 1 - (v - u0)/(1 - u0));
      if(oben && v < linie) a *= Math.pow(v/linie, 1.6);
      if(a >= 1) continue;
      for(let x = 0; x < T.w; x++) px[(y*T.w + x)*4 + 3] *= a;
    }
  } else for(let i = 3; i < px.length; i += 4) px[i] = 255;   // Erde/Wand: ganz deckend
  q.putImageData(d, 0, 0);
  W.ergebnis = c;
  wsVorschau(id);
  ['probe', 'laden', 'github'].forEach(k => W.el[k].disabled = false);
}
// Nahtlos machen: Bild A, dazu um halbe Breite/Höhe verschoben (C: x, D: y, B: beides). Am Rand zeigen die verschobenen
// Bilder ihre Mitte – die ist über den Rand hinweg lückenlos –, innen bleibt A. Gewichte weich (Smoothstep) über WS_RAND.
function wsNahtlos(d, inX, inY){
  const w = d.width, h = d.height, A = d.data, R = new ImageData(w, h), out = R.data;
  const glatt = t => t <= 0 ? 0 : t >= 1 ? 1 : t*t*(3 - 2*t);
  const gx = new Float32Array(w), gy = new Float32Array(h);
  for(let x = 0; x < w; x++) gx[x] = inX ? glatt(Math.min(x + 0.5, w - x - 0.5)/(w*WS_RAND)) : 1;
  for(let y = 0; y < h; y++) gy[y] = inY ? glatt(Math.min(y + 0.5, h - y - 0.5)/(h*WS_RAND)) : 1;
  const hw = w >> 1, hh = h >> 1;
  for(let y = 0; y < h; y++){
    const yv = (y + hh) % h, ay = gy[y];
    for(let x = 0; x < w; x++){
      const xv = (x + hw) % w, ax = gx[x];
      const wa = ax*ay, wc = (1 - ax)*ay, wd = ax*(1 - ay), wb = (1 - ax)*(1 - ay);
      const ia = (y*w + x)*4, ic = (y*w + xv)*4, id = (yv*w + x)*4, ib = (yv*w + xv)*4, o = ia;
      for(let k = 0; k < 4; k++) out[o + k] = A[ia + k]*wa + A[ic + k]*wc + A[id + k]*wd + A[ib + k]*wb;
    }
  }
  return R;
}

// ---------- Vorschau: Erde/Wand 3×3 nebeneinander (Nähte sichtbar?), Kante 3× nebeneinander auf Nebelwald + Erde ----------
const wsNebel = new Image(); wsNebel.src = 'assets/hintergrund/nebelwald-1.webp';
function wsVorschau(id){
  const W = ws[id], T = FOTO_MAT_TEXTUREN[id], c = W.el.vorschau, q = c.getContext('2d'), E = W.ergebnis;
  // Leinwand so breit wie angezeigt -> 1 Bildpunkt = 1 Bildschirmpunkt, Steine so groß wie im Vollbild-Spiel
  const breit = Math.round(c.clientWidth) || 900, hoch = Math.round(id === 'kante' ? breit*0.47 : breit);
  if(c.width !== breit || c.height !== hoch){ c.width = breit; c.height = hoch; }
  if(!E){ q.fillStyle = '#111'; q.fillRect(0, 0, c.width, c.height); return; }
  if(id === 'kante'){
    const M = WS_SPIEL_MASSSTAB, bw = T.weltB*M, bh = T.weltH*M, linie = FOTO_MAT_KANTE.ueber*M, y0 = c.height*0.5;
    if(wsNebel.complete && wsNebel.naturalWidth) q.drawImage(wsNebel, 0, 0, c.width, c.height); else { q.fillStyle = '#8a9a92'; q.fillRect(0, 0, c.width, c.height); }
    const erde = ws.erde && ws.erde.ergebnis, eb = FOTO_MAT_TEXTUREN.erde.weltB*M;
    if(erde){ for(let x = 0; x < c.width; x += eb) for(let y = y0 + linie; y < c.height; y += eb) q.drawImage(erde, x, y, eb, eb); }
    else { q.fillStyle = '#3c2f24'; q.fillRect(0, y0 + linie, c.width, c.height); }
    for(let x = 0; x < c.width; x += bw) q.drawImage(E, x, y0, bw, bh);
    wsFigur(q, c.width/2, y0 + linie, M);
  } else {
    // in echter Spielgröße (Welt-px × Spiel-Zoom), mehrfach nebeneinander, mit Figur zum Vergleich
    const b = T.weltB*WS_SPIEL_MASSSTAB;
    for(let x = 0; x < c.width; x += b) for(let y = 0; y < c.height; y += b) q.drawImage(E, x, y, b, b);
    wsFigur(q, c.width/2, c.height*0.6, WS_SPIEL_MASSSTAB);
  }
}

// ---------- Probe im Spiel, Herunterladen, GitHub ----------
const wsDaten = id => ws[id].ergebnis.toDataURL('image/webp', WS_QUALITAET);
function wsProbe(id){
  try { localStorage.setItem('monchichi.werkstatt.' + id, wsDaten(id)); }
  catch(e){ wsMeldung(id, 'Probe zu groß für den Browser-Speicher – bitte erst eine andere Probe entfernen.', 'fehler'); return; }
  wsStatus(id);
  wsMeldung(id, 'Probe gespeichert. Das Probe-Level öffnet sich in einem neuen Tab (dort mit B zwischen Foto- und Comic-Look wechseln).', 'ok');
  window.open('index.html?testlevel=werkstatt', '_blank');
}
function wsProbeWeg(id){ try { localStorage.removeItem('monchichi.werkstatt.' + id); } catch(e){} wsStatus(id); wsMeldung(id, 'Probe entfernt – das Spiel nimmt wieder die gespeicherte Datei (falls vorhanden).', 'ok'); }
function wsLaden(id){ const a = $n('a', {href: wsDaten(id), download: id + '.webp'}); document.body.append(a); a.click(); a.remove(); }
async function wsGithub(id){
  let token = ''; try { token = localStorage.getItem(WS_GH.key) || ''; } catch(e){}
  if(!token){ wsMeldung(id, 'Kein GitHub-Schlüssel: bitte einmal im Editor unter „☁ Auf GitHub speichern“ eintragen (gilt dann auch hier).', 'fehler'); return; }
  const pfad = 'assets/texturen/' + id + '.webp', url = WS_GH.api + '/repos/' + WS_GH.owner + '/' + WS_GH.repo + '/contents/' + pfad;
  const kopf = {'Accept': 'application/vnd.github+json', 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'};
  wsMeldung(id, 'Speichere auf GitHub …');
  try {
    let sha; const alt = await fetch(url + '?ref=' + WS_GH.branch, {headers: kopf, cache: 'no-store'});
    if(alt.ok) sha = (await alt.json()).sha; else if(alt.status !== 404) throw new Error('HTTP ' + alt.status);
    const r = await fetch(url, {method: 'PUT', headers: kopf, cache: 'no-store', body: JSON.stringify({
      message: 'Werkstatt: ' + FOTO_MAT_TEXTUREN[id].name + ' (' + pfad + ')', branch: WS_GH.branch, content: wsDaten(id).split(',')[1], sha})});
    if(!r.ok){ let m = ''; try { m = (await r.json()).message || ''; } catch(e){} throw new Error('HTTP ' + r.status + (m ? ': ' + m : '')); }
    wsMeldung(id, 'Gespeichert! In 1–2 Minuten ist es online im Spiel (Strg+F5). Tipp: danach „Probe entfernen“.', 'ok');
    wsStatus(id);
  } catch(e){ wsMeldung(id, 'Speichern ging nicht: ' + e.message, 'fehler'); }
}
// Status: gibt es die Datei schon, ist eine Probe aktiv?
async function wsStatus(id){
  let probe = false; try { probe = !!localStorage.getItem('monchichi.werkstatt.' + id); } catch(e){}
  let datei = false; try { datei = (await fetch('assets/texturen/' + id + '.webp', {method: 'HEAD', cache: 'no-store'})).ok; } catch(e){}
  ws[id].el.status.textContent = (datei ? 'Im Spiel: eigene Datei ✓' : 'Im Spiel: noch alter Look') + (probe ? ' · Probe in diesem Browser aktiv' : '');
  ws[id].el.probeWeg.disabled = !probe;
}

// ---------- Aufbau der Karten ----------
function wsKarte(id){
  const T = FOTO_MAT_TEXTUREN[id], W = ws[id] = {quelle: null, ergebnis: null, el: {}}, el = W.el;
  const vorlage = wsVorlage(id); vorlage.className = 'bild';
  el.status = $n('span', {className: 'status'});
  el.meldung = $n('div', {className: 'meldung'});
  const text = $n('textarea', {readOnly: true, value: WS_TEXTE[id]});
  const datei = $n('input', {type: 'file', accept: 'image/*', hidden: true});
  const ablage = $n('div', {className: 'ablage', textContent: 'Fertiges Bild hier hineinziehen oder klicken zum Auswählen'});
  el.glaetten = $n('input', {type: 'checkbox', checked: true});
  el.oben = $n('input', {type: 'checkbox', checked: false});
  el.vorschau = $n('canvas', {className: 'bild', width: 900, height: id === 'kante' ? 420 : 900});
  const knopf = (t, f, haupt) => { const b = $n('button', {textContent: t, type: 'button'}); if(haupt) b.className = 'haupt'; b.onclick = f; return b; };
  el.probe = knopf('▶ Im Spiel ausprobieren', () => wsProbe(id), true);
  el.probeWeg = knopf('Probe entfernen', () => wsProbeWeg(id));
  el.laden = knopf('⬇ Herunterladen', () => wsLaden(id));
  el.github = knopf('☁ Auf GitHub speichern', () => wsGithub(id));
  ['probe', 'laden', 'github'].forEach(k => el[k].disabled = true);
  const lesen = f => {
    if(!f || !/^image\//.test(f.type)) return;
    const img = new Image();
    img.onload = () => {
      W.quelle = img;
      if(id === 'kante'){   // ohne durchsichtigen Hintergrund: oben weich ausblenden
        const c = $n('canvas', {width: 64, height: 16}), q = c.getContext('2d'); q.drawImage(img, 0, 0, img.width, img.height*0.3, 0, 0, 64, 16);
        const px = q.getImageData(0, 0, 64, 16).data; let durch = false; for(let i = 3; i < px.length; i += 4) if(px[i] < 200){ durch = true; break; }
        el.oben.checked = !durch;
      }
      wsVerarbeiten(id); wsMeldung(id, 'Bild eingelesen (' + img.width + '×' + img.height + ' → ' + T.w + '×' + T.h + ').', 'ok');
    };
    img.onerror = () => wsMeldung(id, 'Bild konnte nicht gelesen werden.', 'fehler');
    img.src = URL.createObjectURL(f);
  };
  ablage.onclick = () => datei.click();
  datei.onchange = () => lesen(datei.files[0]);
  ablage.ondragover = e => { e.preventDefault(); ablage.classList.add('drueber'); };
  ablage.ondragleave = () => ablage.classList.remove('drueber');
  ablage.ondrop = e => { e.preventDefault(); ablage.classList.remove('drueber'); lesen(e.dataTransfer.files[0]); };
  el.glaetten.onchange = el.oben.onchange = () => wsVerarbeiten(id);
  const schalter = [$n('label', {className: 'schalter'}, [el.glaetten, 'Nähte glätten'])];
  if(id === 'kante') schalter.push($n('label', {className: 'schalter'}, [el.oben, 'oben weich ausblenden (wenn der Hintergrund nicht durchsichtig ist)']));
  const karte = $n('section', {className: 'karte'}, [
    $n('div', {className: 'kopf'}, [$n('h2', {textContent: T.name}), el.status]),
    $n('p', {textContent: WS_HINWEIS[id]}),
    $n('div', {className: 'reihe'}, [
      $n('div', {className: 'feld'}, [$n('h3', {textContent: '1 · Vorlage'}), vorlage,
        knopf('⬇ Vorlage herunterladen', () => { const a = $n('a', {href: vorlage.toDataURL('image/png'), download: 'vorlage-' + id + '.png'}); document.body.append(a); a.click(); a.remove(); })]),
      $n('div', {className: 'feld'}, [$n('h3', {textContent: '2 · Text für ChatGPT'}), text,
        knopf('📋 Text kopieren', async () => { try { await navigator.clipboard.writeText(text.value); wsMeldung(id, 'Text kopiert.', 'ok'); } catch(e){ text.select(); } })]),
    ]),
    $n('div', {className: 'reihe'}, [
      $n('div', {className: 'feld'}, [$n('h3', {textContent: '3 · Bild einlesen'}), ablage, datei, ...schalter]),
      $n('div', {className: 'feld'}, [$n('h3', {textContent: '4 · Vorschau in Spielgröße (Figur zum Vergleich – sieht man Nähte?)'}), el.vorschau,
        el.probe, el.probeWeg, el.laden, el.github, el.meldung]),
    ]),
  ]);
  document.getElementById('karten').append(karte);
  wsVorschau(id); wsStatus(id);
}
Object.keys(FOTO_MAT_TEXTUREN).forEach(wsKarte);
