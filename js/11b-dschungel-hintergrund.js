// 11b-dschungel-hintergrund.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Neuer Dschungel-Look (dschungel-paket): Hintergrund mit Wind (Tag) und dichter blauer Nacht ----------
// Übernommen aus der abgenommenen Vorschau (dschungel-paket/referenz/dschungel-hintergrund.js und nacht-look.js):
// Formen, Farben, Zahlen und Zeichen-Reihenfolge sind Absicht – nicht „verbessern“. Angepasst ist nur die Anbindung:
//  - Koordinaten: „Bild-Einheiten“ der Vorschau = Welt-Pixel des Spiels (Zoom 0,85, unten bündig, Himmel-Streifen oben).
//  - Parallaxe: die Faktoren der Vorschau (fern 0,12 … nah 0,8) werden mit DJ_PAR_K auf die Faktoren der bisherigen
//    Spiel-Ebenen gebracht (nah 0,8 -> 0,45 wie die bisherige nahe Ebene, fern 0,25 -> 0,14, Mitte 0,5 -> 0,28).
//  - Pflanzen sind EINMAL vorgezeichnete Einzelbilder (Sprites); pro Bild werden sie nur leicht gedreht gezeichnet (Wind).
//    Die Nacht-Einfärbung passiert einmal beim Vorzeichnen (eigene, eingefärbte Kopie jedes Sprites), nicht pro Bild.
//  - Wind und Nacht-Licht sind abschaltbar (schwache Geräte), wie das Hitzeflimmern der Lava.
// Welcher Look welchen Hintergrund bekommt, steht in HG_STIL_TABELLE (je Welt und Tageszeit) – andere Welten bleiben,
// wie sie sind. Ein neuer Stil für eine andere Welt/Tageszeit: Eintrag in HG_STIL_TABELLE + HG_STILE.

// ---------- Auswahl: Welt + Tageszeit -> Hintergrund-Stil ----------
// fehlt eine Welt/Tageszeit, bleibt der bisherige Hintergrund (js/11-hintergrund.js)
const HG_STIL_TABELLE = {
  dschungel: {morgen: 'dschungelHG', mittag: 'dschungelTag', abend: 'dschungelHG', nacht: 'dschungelNacht'},
};
// alte Themen-Namen (Level mit "look"), die zu einer Welt gehören: „abend“ = Baumkronen (Dschungel-Welt).
// Das alte Thema „nacht“ benutzt Mondnacht (Ruinen-Welt) – bleibt darum wie bisher.
const HG_ALTE_THEMEN = {abend: 'dschungel@abend'};
// tiere: neue Tier-/Deko-Regeln (20-tiere.js, 17-deko.js); licht: eigenes Licht statt Strahlen, Pollen, Wärme-Schimmer
// und (nachts) statt der bisherigen Abdunklung. Morgen/Abend bekommen nur den neuen Hintergrund (A+B), sonst wie bisher.
const HG_STILE = {
  dschungelHG:    {nacht: false, tiere: false, licht: false},
  dschungelTag:   {nacht: false, tiere: true,  licht: true},
  dschungelNacht: {nacht: true,  tiere: true,  licht: true},
};
function hgStilFuer(name){
  let n = String(name || '').split('~')[0];
  if(HG_ALTE_THEMEN[n]) n = HG_ALTE_THEMEN[n];
  let [welt, zeit] = n.split('@');
  const T = HG_STIL_TABELLE[welt];
  if(!T) return null;
  if(!zeit) zeit = (typeof WORLD_LOOKS !== 'undefined' && WORLD_LOOKS[welt] && WORLD_LOOKS[welt].time) || 'mittag';
  const k = T[zeit];
  return k && HG_STILE[k] ? Object.assign({name: k}, HG_STILE[k]) : null;
}
// gilt gerade ein neuer Stil mit eigenem Licht / neuen Tier-Regeln?
function hgEigenesLicht(){ return !!(BG_STIL && BG_STIL.licht); }
function hgTierRegeln(){ return !!(BG_STIL && BG_STIL.tiere); }
function hgNacht(){ return !!(BG_STIL && BG_STIL.nacht); }

// ---------- Werte aus der Vorschau ----------
const DJ_PER = 2000;          // Ebenen wiederholen sich alle so viele Einheiten
const DJ_BY = 738, DJ_TY = -137, DJ_BASE = 720;   // Fußlinie der Pflanzen, Oberkante (hängende Wedel), Boden-Unterkante
const DJ_PAR_K = 0.45/0.85/0.8;   // Vorschau-Parallaxe -> Spiel (nahe Ebene 0,8 = bisherige nahe Spiel-Ebene 0,45)
const DJ_WIND_K = 1;          // Windstärke (in der Vorschau-Datei nicht angegeben -> 1)
// Bildpunkte je Einheit beim Vorzeichnen: so fein wie die bisherigen Hintergrund-Ebenen (Spiel-Bildpunkte), weich
// gezeichnete Sprites gröber. Wichtig für die Leistung: Chrome zeichnet ein Bild sofort (bremsend) fertig, sobald es
// mehr als rund 30 MB verschiedene Vorlagen benutzt – die Ebenen hier bleiben zusammen bei etwa 20 MB.
const djSC = blur => blur >= 6 ? 0.425 : blur >= 3.5 ? 0.6375 : 0.85;
const DJ_FOG = '168,226,196', DJ_FOG_NACHT = '34,100,160';   // Dunst-Farbe Tag / Nacht (P.fog)
const DJ_GL = '255,236,160';                                 // Lichtstaub-Farbe Tag (P.gl)
const DJ_LICHTSTAUB_TAG = 90, DJ_LICHTSTAUB_NACHT = 20;      // Lichtstaub-Punkte (Nacht: kein Gewimmel)
// Abschalten auf schwachen Geräten (wie Lava-Flimmern): von Hand localStorage 'monchichi.dschungelWind' bzw.
// 'monchichi.dschungelNachtlicht' = 'aus', und von selbst, wenn die Bilder im Mittel länger als DJ_BILD_MAX_MS
// auseinanderliegen (gemessen über DJ_PROBE Bilder; unter ~40 Bildern/s) oder DJ_SOFORT_N Bilder hintereinander über DJ_SOFORT_MS: erst der Wind (dann sind alle Ebenen still
// vorgezeichnete Kacheln, viel billiger), danach – falls es immer noch zu langsam ist – das Nacht-Licht.
// Ebenen, die sich im Wind wiegen (je Pflanze einzeln gedreht); die übrigen sind still vorgezeichnete Kacheln
let DJ_WIND_EBENEN = new Set(['mid', 'stems', 'near']);
const DJ_BILD_MAX_MS = 25, DJ_PROBE = 20;
const DJ_SOFORT_MS = 50, DJ_SOFORT_N = 4;   // so viele Bilder hintereinander über DJ_SOFORT_MS -> sofort aus (sonst ruckelt es sekundenlang)
const djSchalter = {
  wind:  {an: null, n: 0, summe: 0, lang: 0, key: 'monchichi.dschungelWind', max: DJ_BILD_MAX_MS},
  licht: {an: null, n: 0, summe: 0, lang: 0, key: 'monchichi.dschungelNachtlicht', max: DJ_BILD_MAX_MS},
};
function djAn(S){
  if(S.an === null){ let aus = false; try { aus = localStorage.getItem(S.key) === 'aus'; } catch(e){} S.an = !aus; }
  return S.an;
}
// Anlaufzeit (Nutzerwunsch: Wind fehlte auch auf schnellen Laptops): direkt nach dem Levelstart werden viele Bilder
// vorgezeichnet – diese ersten DJ_ANLAUF_MS zählen nicht, ebenso Bilder in Menü/Pause und nach einem Tab-Wechsel
const DJ_ANLAUF_MS = 3000, DJ_LUECKE_MS = 200;
let djMessLevel = null, djAnlaufBis = 0;
function djMessenErlaubt(dauer){
  const jetzt = performance.now();
  if(djMessLevel !== solids){ djMessLevel = solids; djAnlaufBis = jetzt + DJ_ANLAUF_MS; }
  if(jetzt < djAnlaufBis || dauer >= DJ_LUECKE_MS) return false;
  return !(typeof menuScreen !== 'undefined' && menuScreen) && !(typeof deathState !== 'undefined' && deathState);
}
function djMessen(S, dauer){
  if(!djMessenErlaubt(dauer)){ S.lang = 0; return; }
  S.summe += dauer;
  S.lang = dauer > DJ_SOFORT_MS ? S.lang + 1 : 0;
  if(S.lang >= DJ_SOFORT_N){ S.an = false; S.lang = 0; }
  if(++S.n >= DJ_PROBE){ if(S.summe/S.n > S.max) S.an = false; S.n = 0; S.summe = 0; }
}
// Zeile für die Leistungsanzeige (Taste F, js/13-anzeige-leistung.js)
function djStatusText(){
  const txt = S => S.an === null ? '–' : S.an ? 'an' : 'aus';
  return 'Dschungel-Wind: ' + txt(djSchalter.wind) + '   Nacht-Licht: ' + txt(djSchalter.licht);
}

// ---------- kleine Helfer (Vorschau: hex, toHex, mix, glow, wind) ----------
const djHex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const djToHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const djMix = (a, b, t) => { const x = djHex(a), y = djHex(b); return djToHex(x.map((v, i) => v + (y[i] - v)*t)); };
const DJ_FOG_HEX = djToHex(DJ_FOG.split(',').map(Number));
function djGlow(q, x, y, r, rgb, a){
  q.save(); q.globalCompositeOperation = 'screen';
  const gr = q.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
  q.fillStyle = gr; q.fillRect(x - r, y - r, 2*r, 2*r); q.restore();
}
function djWind(x, t){
  const gu = Math.max(0, Math.sin(t*0.33));
  return DJ_WIND_K*(0.5*Math.sin(x*0.006 - t*1.25) + 0.3*Math.sin(x*0.017 - t*2.3 + 1.7) + 0.55*gu*gu*Math.sin(x*0.004 - t*1.6 + 0.5) + 0.18);
}
// Nacht-Einfärbung einer einzelnen Farbe (für Dinge, die pro Bild gezeichnet werden, z. B. Lianen) – rechnet genau das
// nach, was djNachtTönen mit den Bildpunkten macht: Farbton blau (color-Mischung mit rgb(30,96,150)), contrast(2)
// brightness(.58), dünner dunkelblauer Schleier (~0,3)
function djNachtFarbe(hex){
  const c = djHex(hex).map(v => v/255), lum = v => 0.3*v[0] + 0.59*v[1] + 0.11*v[2];
  const s = [30/255, 96/255, 150/255], d = lum(c) - lum(s);
  let v = s.map(x => x + d);
  const l = lum(v), mn = Math.min(...v), mx = Math.max(...v);
  if(mn < 0) v = v.map(x => l + (x - l)*l/(l - mn));
  if(mx > 1) v = v.map(x => l + (x - l)*(1 - l)/(mx - l));
  v = v.map(x => Math.max(0, Math.min(1, (x - 0.5)*2 + 0.5))*0.58);
  const o = [4/255, 22/255, 50/255];
  return djToHex(v.map((x, i) => (x*0.7 + o[i]*0.3)*255));
}

// ---------- Pflanzen-Bilder (Vorschau: drawFrond, frondSprite, palmSprite, bananaSprite, monsteraSprite, heliSprite,
// mushSprite, mkTrunk) ----------
// djSprite legt die Leinwand an (Fußpunkt sx/sy in Einheiten), zeichnet scharf und zeichnet dann EINMAL weich (die Vorschau
// zeichnet jedes Blättchen einzeln weich – sieht gleich aus, kostet beim Aufbau aber ein Vielfaches)
function djSprite(cw, ch, sx, sy, blur, zeichnen){
  const sc = djSC(blur), c = document.createElement('canvas');
  c.width = Math.ceil(cw*sc); c.height = Math.ceil(ch*sc);
  const o = c.getContext('2d');
  o.setTransform(sc, 0, 0, sc, sx*sc, sy*sc);
  zeichnen(o);
  if(blur > 0.3 && 'filter' in o){
    const tmp = document.createElement('canvas'); tmp.width = c.width; tmp.height = c.height;
    tmp.getContext('2d').drawImage(c, 0, 0);
    o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, c.width, c.height);
    o.filter = 'blur(' + (blur*sc) + 'px)'; o.drawImage(tmp, 0, 0); o.filter = 'none';
  }
  return {c, sx, sy, w: cw, h: ch};
}
function djDrawFrond(o, len, curve, cA, cB, nl, droop, lw){
  const bz = t => { const u = 1 - t; return [2*u*t*curve*0.15 + t*t*curve, 2*u*t*(-len*0.62) + t*t*(-len*0.92) + t*t*droop*len*0.25]; };
  o.lineCap = 'round'; o.strokeStyle = cA; o.lineWidth = lw || 2.2; o.beginPath();
  for(let i = 0; i <= 16; i++){ const p = bz(i/16); i ? o.lineTo(p[0], p[1]) : o.moveTo(p[0], p[1]); }
  o.stroke();
  for(let i = 0; i < nl; i++){
    const t = 0.1 + 0.9*i/(nl - 1), p = bz(t), q = bz(Math.min(1, t + 0.03));
    let tx = q[0] - p[0], ty = q[1] - p[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const L = len*0.34*Math.sin(Math.PI*Math.min(1, t*0.8 + 0.12))*(1 - t*0.25), col = djMix(cA, cB, t);
    for(const sd of [-1, 1]){
      let dx = -ty*sd + tx*0.7, dy = tx*sd + ty*0.7 + 0.35; const dl = Math.hypot(dx, dy); dx /= dl; dy /= dl;
      const ex = p[0] + dx*L, ey = p[1] + dy*L, w = Math.max(1.2, L*0.17), nx = -dy, ny = dx;
      o.fillStyle = col; o.beginPath(); o.moveTo(p[0], p[1]);
      o.quadraticCurveTo(p[0] + dx*L*0.5 + nx*w, p[1] + dy*L*0.5 + ny*w, ex, ey);
      o.quadraticCurveTo(p[0] + dx*L*0.5 - nx*w, p[1] + dy*L*0.5 - ny*w, p[0], p[1]); o.fill();
    }
  }
}
function djFrondSprite(len, curve, cA, cB, blur, nl, droop){
  const pad = Math.ceil(blur*3 + 8), cw = len*1.5 + 2*pad + Math.abs(curve), ch = len*1.15 + 2*pad;
  return djSprite(cw, ch, cw/2, ch - pad, blur, o => djDrawFrond(o, len, curve, cA, cB, nl || 18, droop || 0.2));
}
function djPalmSprite(h, curve, cT, cF, blur){
  const pad = Math.ceil(blur*3 + 8), fl = h*0.42, cw = fl*2.6 + 2*pad + Math.abs(curve), ch = h + fl*0.9 + 2*pad;
  return djSprite(cw, ch, cw/2, ch - pad, blur, o => {
    o.strokeStyle = cT; o.lineCap = 'round'; o.lineWidth = Math.max(6, h*0.028);
    o.beginPath(); o.moveTo(0, 0); o.quadraticCurveTo(curve*0.1, -h*0.55, curve, -h); o.stroke();
    o.save(); o.translate(curve, -h); const r = rnd(Math.floor(h));
    for(let k = 0; k < 9; k++){ const a = -1.45 + k*0.36; o.save(); o.rotate(a*0.8); djDrawFrond(o, fl*(0.8 + r()*0.35), (a < 0 ? -1 : 1)*fl*0.55, djMix(cF, '#000000', 0.35), cF, 14, 0.5, 2); o.restore(); }
    o.restore();
  });
}
function djBananaZeichnen(o, len, W, curve, cA, cB, seed){
  const r = rnd(seed || 5), bz = t => { const u = 1 - t; return [2*u*t*curve*0.1 + t*t*curve, 2*u*t*(-len*0.7) + t*t*(-len*0.9)]; },
        hw = t => W*Math.sin(Math.PI*Math.pow(t, 0.62))*(0.55 + 0.45*(1 - t)), N = 24, L = [], R = [];
  for(let i = 0; i <= N; i++){
    const t = i/N, p = bz(t), q = bz(Math.min(1, t + 0.02)), tl = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1,
          nx = -(q[1] - p[1])/tl, ny = (q[0] - p[0])/tl, w = hw(t);
    L.push([p[0] + nx*w, p[1] + ny*w]); R.push([p[0] - nx*w, p[1] - ny*w]);
  }
  o.beginPath(); L.forEach((p, i) => i ? o.lineTo(p[0], p[1]) : o.moveTo(p[0], p[1])); for(let i = N; i >= 0; i--) o.lineTo(R[i][0], R[i][1]); o.closePath();
  const gq = o.createLinearGradient(0, 0, curve, -len); gq.addColorStop(0, cA); gq.addColorStop(1, cB); o.fillStyle = gq; o.fill(); o.save(); o.clip();
  o.strokeStyle = 'rgba(235,255,190,.16)'; o.lineWidth = 1;
  for(let i = 2; i < N; i++){ const p = bz(i/N); o.beginPath(); o.moveTo(p[0], p[1]); o.lineTo(L[i + 1][0], L[i + 1][1]); o.moveTo(p[0], p[1]); o.lineTo(R[i + 1][0], R[i + 1][1]); o.stroke(); }
  o.strokeStyle = 'rgba(235,255,190,.4)'; o.lineWidth = 2; o.beginPath();
  for(let i = 0; i <= N; i++){ const p = bz(i/N); i ? o.lineTo(p[0], p[1]) : o.moveTo(p[0], p[1]); }
  o.stroke();
  o.globalCompositeOperation = 'destination-out'; o.fillStyle = '#000';
  for(let k = 0; k < 4; k++){
    const i = 3 + Math.floor(r()*(N - 8)), sd = r() < 0.5 ? L : R, p = bz(i/N), a = sd[i], b = sd[i + 2];
    o.beginPath(); o.moveTo(a[0], a[1]); o.lineTo(b[0], b[1]); o.lineTo(p[0] + (a[0] - p[0])*0.35, p[1] + (a[1] - p[1])*0.35 + 4); o.closePath(); o.fill();
  }
  o.restore();
}
function djBananaSprite(len, W, curve, cA, cB, blur, seed){
  const pad = Math.ceil(blur*3 + 8), cw = len*1.3 + 2*pad + Math.abs(curve)*1.4 + W, ch = len*1.1 + 2*pad;
  return djSprite(cw, ch, cw/2, ch - pad, blur, o => djBananaZeichnen(o, len, W, curve, cA, cB, seed));
}
function djMonsteraSprite(R, stem, curve, cA, cB, blur, seed){
  const pad = Math.ceil(blur*3 + 8), cw = R*2.4 + 2*pad + Math.abs(curve)*2, ch = stem + R*2.1 + 2*pad;
  return djSprite(cw, ch, cw/2, ch - pad, blur, o => {
    const r = rnd(seed || 3);
    o.strokeStyle = djMix(cA, '#000000', 0.2); o.lineWidth = Math.max(3, R*0.05); o.lineCap = 'round';
    o.beginPath(); o.moveTo(0, 0); o.quadraticCurveTo(curve*0.1, -stem*0.6, curve, -stem); o.stroke();
    o.save(); o.translate(curve, -stem); o.rotate(Math.max(-0.7, Math.min(0.7, curve/Math.max(60, stem))));
    o.beginPath(); const n = 64;
    for(let i = 0; i <= n; i++){
      const a = i/n*Math.PI*2, s = Math.sin(a*6.5), f = 1 - 0.3*Math.pow(Math.max(0, s), 2)*(Math.abs(Math.cos(a)) > 0.25 ? 1 : 0.2),
            rx = R*f*(1 + 0.08*Math.cos(a)), ry = R*0.92*f, x = Math.sin(a)*rx, y = -Math.cos(a)*ry*1.0 - R*0.72;
      i ? o.lineTo(x, y) : o.moveTo(x, y);
    }
    o.closePath();
    const gq = o.createLinearGradient(-R, 0, R*0.6, -R*1.6); gq.addColorStop(0, cA); gq.addColorStop(1, cB); o.fillStyle = gq; o.fill(); o.save(); o.clip();
    o.strokeStyle = 'rgba(235,255,190,.32)'; o.lineWidth = Math.max(1.4, R*0.03); o.beginPath(); o.moveTo(0, 0); o.lineTo(0, -R*1.6); o.stroke();
    o.lineWidth = Math.max(1, R*0.016);
    for(let k = 1; k < 7; k++){ const y = -R*0.22*k; o.beginPath(); o.moveTo(0, y); o.lineTo(-R*0.95, y - R*0.34); o.moveTo(0, y); o.lineTo(R*0.95, y - R*0.34); o.stroke(); }
    o.globalCompositeOperation = 'destination-out'; o.fillStyle = '#000';
    for(let k = 0; k < 5; k++){ o.beginPath(); o.ellipse((r() - 0.5)*R*1.1, -R*(0.45 + r()*0.8), R*0.06, R*0.12, r()*3, 0, 7); o.fill(); }
    o.restore(); o.restore();
  });
}
function djHeliSprite(h, curve, col, blur, seed){
  const pad = Math.ceil(blur*3 + 14), cw = 120 + 2*pad + Math.abs(curve), ch = h + 2*pad;
  return djSprite(cw, ch, cw/2, ch - pad, blur, o => {
    const bz = t => { const u = 1 - t; return [2*u*t*curve*0.1 + t*t*curve, -h*t]; };
    o.strokeStyle = '#1c6a3a'; o.lineWidth = 4; o.lineCap = 'round'; o.beginPath();
    for(let i = 0; i <= 14; i++){ const p = bz(i/14); i ? o.lineTo(p[0], p[1]) : o.moveTo(p[0], p[1]); }
    o.stroke();
    for(let k = 0; k < 6; k++){
      const t = 0.5 + k*0.085, p = bz(t), sd = k % 2 ? 1 : -1, L = 34 - k*3.4;
      o.save(); o.translate(p[0], p[1]); o.rotate(sd*(0.9 + k*0.05));
      o.fillStyle = col[0]; o.beginPath(); o.moveTo(0, 0); o.quadraticCurveTo(L*0.45, -L*0.28, L, 0); o.quadraticCurveTo(L*0.5, L*0.38, 0, 0); o.fill();
      o.strokeStyle = col[1]; o.lineWidth = 2.2; o.beginPath(); o.moveTo(L*0.15, 0); o.quadraticCurveTo(L*0.5, -L*0.2, L, 0); o.stroke();
      o.restore();
    }
    const t0 = bz(0.12); o.save(); o.translate(t0[0], t0[1]); o.rotate(-0.5); o.fillStyle = '#1f7a44';
    o.beginPath(); o.ellipse(-26, -18, 34, 10, -0.5, 0, 7); o.fill(); o.restore();
  });
}
// Riesenblatt-Pflanze (in der Vorschau „mushrooms“): zwei Bananenblätter + Monstera, weich
function djMushSprite(w, sh, seed){
  const pad = 40, cw = w*3.4 + 2*pad, ch = sh + w*2.4 + 2*pad;
  const T = (c, f) => djMix(c, DJ_FOG_HEX, f);
  const parts = [djBananaSprite(sh*0.9, w*0.5, -w*0.9, T('#1a6a3c', 0.22), T('#6fc860', 0.3), 3, seed),
                 djBananaSprite(sh*0.8, w*0.45, w*1.0, T('#1a6a3c', 0.22), T('#6fc860', 0.3), 3, seed + 1),
                 djMonsteraSprite(w*0.95, sh*0.8, w*0.15, T('#155f36', 0.2), T('#4fb858', 0.3), 3, seed + 2)];
  return djSprite(cw, ch, cw/2, ch - pad, 0, o => { for(const p of parts) o.drawImage(p.c, -p.sx, -p.sy, p.w, p.h); });
}
// großer Baumstamm (weich, mit Kletterlianen und Farnen)
function djTrunk(){
  const wB = 170, wT = 120, top = -170, bot = 770, pad = 70, cw = 760, ch = bot - top + 2*pad, r = rnd(88);
  const L = y => { const u = (y - top)/(bot - top); return wT + (wB - wT)*u + (u > 0.72 ? Math.pow((u - 0.72)/0.28, 1.5)*190 : 0); };
  const s = djSprite(cw, ch, cw/2, pad - top, 7, q => {
    q.beginPath();
    for(let y = top; y <= bot; y += 20) q.lineTo(-L(y) + Math.sin(y*0.02)*6, y);
    for(let y = bot; y >= top; y -= 20) q.lineTo(L(y) + Math.sin(y*0.017 + 2)*6, y);
    q.closePath();
    const gq = q.createLinearGradient(-wB, 0, wB, 0);
    gq.addColorStop(0, '#9a8460'); gq.addColorStop(0.3, '#675238'); gq.addColorStop(0.7, '#3f301f'); gq.addColorStop(1, '#241a10');
    q.fillStyle = gq; q.fill(); q.save(); q.clip();
    for(let i = 0; i < 70; i++){
      const x0 = (-1 + 2*r())*wB*1.1, ph = r()*6, am = 3 + r()*9, fr = 0.004 + r()*0.008;
      q.strokeStyle = 'rgba(16,9,4,' + (0.2 + r()*0.3) + ')'; q.lineWidth = 2 + r()*6; q.beginPath();
      for(let y = top; y <= bot; y += 24){ const x = x0 + Math.sin(y*fr + ph)*am; y == top ? q.moveTo(x, y) : q.lineTo(x, y); }
      q.stroke();
      q.strokeStyle = 'rgba(206,176,128,' + (0.08 + r()*0.14) + ')'; q.lineWidth = 1.5 + r()*2; q.beginPath();
      for(let y = top; y <= bot; y += 24){ const x = x0 + 4 + Math.sin(y*fr + ph)*am; y == top ? q.moveTo(x, y) : q.lineTo(x, y); }
      q.stroke();
    }
    for(let i = 0; i < 52; i++){
      const x = -wB + r()*wB*1.2, y = top + r()*(bot - top), w = 22 + r()*64;
      const gg = q.createRadialGradient(x, y, 0, x, y, w); gg.addColorStop(0, 'rgba(70,150,60,.6)'); gg.addColorStop(1, 'rgba(70,150,60,0)');
      q.fillStyle = gg; q.beginPath(); q.ellipse(x, y, w*0.6, w, 0, 0, 7); q.fill();
    }
    // Kletterlianen um den Stamm
    for(let k = 0; k < 5; k++){
      const y0 = top + r()*500, ph = r()*6;
      q.strokeStyle = 'rgba(22,70,36,.85)'; q.lineWidth = 7 + r()*4; q.lineCap = 'round'; q.beginPath();
      for(let i = 0; i <= 30; i++){ const y = y0 + i*18, x = Math.sin(i*0.45 + ph)*wB*0.9; i ? q.lineTo(x, y) : q.moveTo(x, y); }
      q.stroke(); q.strokeStyle = 'rgba(120,200,110,.25)'; q.lineWidth = 2; q.stroke();
    }
    q.fillStyle = 'rgba(' + DJ_FOG + ',.2)'; q.fillRect(-wB*2, top, wB*4, bot - top); q.restore();
    // Farne am Stamm
    for(let i = 0; i < 7; i++){
      const y = top + 120 + r()*620, sd = r() < 0.5 ? -1 : 1;
      q.save(); q.translate(sd*L(y)*0.9, y); q.rotate(sd*(0.9 + r()*0.5)); djDrawFrond(q, 70 + r()*60, sd*30, '#14502c', '#46a050', 12, 0.4, 2.4); q.restore();
    }
  });
  return s;
}

// ---------- Ebenen aufbauen (Vorschau: makeLayers) – einmal je Sitzung ----------
const DJ = {fertig: false, LY: null, LIA: [], MUSH: [], TRK: null, nachtFertig: false, kacheln: {}, sky: null, skyNacht: null,
            vign: null, bok: [], staub: [], aufbauMs: 0};
function djAufbauen(){
  if(DJ.fertig) return;
  const t0 = performance.now();
  const LY = DJ.LY = {dens1: [], dens2: [], xfar: [], far: [], dach1: [], mid: [], stems: [], dach2: [], near: []};
  const r = rnd(21), sg = () => r() < 0.5 ? -1 : 1,
        pt = (a, x, y, k, rot, s, amp) => a.push({x, y, ph: r()*6.28, k, rot: rot || 0, s, amp}),
        span = DJ_PER, pick = a => a[Math.floor(r()*a.length)], T = (c, f) => djMix(c, DJ_FOG_HEX, f),
        mk = (n, f) => Array.from({length: n}, (_, i) => f(i)), BY = DJ_BY, TY = DJ_TY;
  // ganz fern: Palmen im Dunst
  const px = mk(6, i => djPalmSprite(420 + r()*280, sg()*(40 + r()*70), T('#1f5a44', 0.5), T('#4fa87c', 0.5), 11));
  for(let i = 0; i < 15; i++) pt(LY.xfar, i*span/15 + (r() - 0.5)*70, BY, 0.5, 0, pick(px), 0.01);
  // fern: Palmen/Bananen
  const pf = mk(5, i => djPalmSprite(360 + r()*220, sg()*(30 + r()*60), T('#17513a', 0.32), T('#3f9e66', 0.34), 8)),
        bf = mk(7, i => djBananaSprite(300 + r()*180, 60 + r()*30, sg()*(30 + r()*70), T('#14663a', 0.28), T('#6fcb68', 0.3), 8, i + 30));
  for(let i = 0; i < 10; i++) pt(LY.far, i*span/10 + (r() - 0.5)*60, BY, 0.6, 0, pick(pf), 0.014);
  for(let i = 0; i < 24; i++) pt(LY.far, i*span/24 + (r() - 0.5)*40, BY, 0.6 + r()*0.4, sg()*0.05, pick(bf), 0.02);
  // Dach: hängende Wedel und Blätter
  const dh1 = mk(8, i => djFrondSprite(220 + r()*200, sg()*(50 + r()*110), T('#1f6f48', 0.5), T('#7fd08c', 0.5), 6, 16, 0.3)),
        dh2 = mk(8, i => djBananaSprite(200 + r()*220, 46 + r()*22, sg()*(40 + r()*90), T('#185c3a', 0.3), T('#6fc65c', 0.4), 3.5, i + 60)),
        dh3 = mk(6, i => djFrondSprite(130 + r()*170, sg()*(40 + r()*90), T('#145a36', 0.25), T('#62c056', 0.3), 3, 14, 0.3));
  for(let i = 0; i < 30; i++) pt(LY.dach1, i*span/30 + (r() - 0.5)*50, TY - 100, 0.6, Math.PI + sg()*(0.05 + r()*0.14), pick(dh1), 0.014);
  for(let i = 0; i < 20; i++) pt(LY.dach2, i*span/20 + (r() - 0.5)*70, TY - 55, 1, Math.PI + sg()*(0.05 + r()*0.14), pick(i % 3 ? dh2 : dh3), 0.018);
  // Unterwuchs: Farne
  const f1 = mk(10, i => djFrondSprite(90 + r()*120, sg()*(20 + r()*60), '#1a6a3e', T('#6fd06a', 0.3), 4.5, 15, 0.35)),
        f2 = mk(10, i => djFrondSprite(70 + r()*100, sg()*(16 + r()*50), '#145a34', T('#58c050', 0.14), 3, 14, 0.35));
  for(let i = 0; i < 70; i++) pt(LY.dens1, i*span/70 + (r() - 0.5)*30, BY, 0.7 + r()*0.4, 0, pick(f1), 0.03);
  for(let i = 0; i < 64; i++) pt(LY.dens2, i*span/64 + (r() - 0.5)*30, BY, 0.8 + r()*0.4, 0, pick(f2), 0.035);
  // Mitte: Bananenblätter + Monstera
  const mb = mk(8, i => djBananaSprite(200 + r()*130, 52 + r()*20, sg()*(30 + r()*60), '#14603a', T('#6cd058', 0.08), 4, i + 90)),
        mm = mk(6, i => djMonsteraSprite(60 + r()*30, 120 + r()*110, sg()*(20 + r()*50), '#145c34', T('#58c050', 0.1), 3.6, i + 120));
  for(let i = 0; i < 30; i++) pt(LY.mid, i*span/30 + (r() - 0.5)*40, BY, 0.8 + r()*0.5, sg()*0.06, pick(mb), 0.03);
  for(let i = 0; i < 10; i++) pt(LY.mid, 60 + i*(span - 120)/10 + r()*70, BY, 0.9, sg()*0.08, pick(mm), 0.028);
  // Heliconien mit roten Blüten
  const hc = [['#e0402e', '#f4c34a'], ['#f08a2a', '#f7e26a'], ['#d8366a', '#f6c25a']],
        hs = mk(9, i => djHeliSprite(260 + r()*190, sg()*(20 + r()*40), hc[i % 3], 3, i));
  for(let i = 0; i < 18; i++) pt(LY.stems, i*span/18 + (r() - 0.5)*50, BY, 0.9 + r()*0.4, sg()*0.03, pick(hs), 0.034);
  // Vordergrund: dunkle, große Blätter
  const nb = mk(5, i => djBananaSprite(190 + r()*110, 50 + r()*18, sg()*(30 + r()*50), '#0c4a24', T('#4caa3c', 0.03), 2, i + 150)),
        nm = mk(4, i => djMonsteraSprite(55 + r()*25, 60 + r()*70, sg()*(14 + r()*30), '#0b4422', T('#3c9c38', 0.03), 1.8, i + 170)),
        nf = mk(6, i => djFrondSprite(110 + r()*90, sg()*(20 + r()*50), '#0c4a24', T('#48b03c', 0.03), 2, 14, 0.35));
  for(let i = 0; i < 22; i++) pt(LY.near, i*span/22 + (r() - 0.5)*50, BY, 0.9 + r()*0.5, 0, pick(nf), 0.04);
  for(let i = 0; i < 7; i++) pt(LY.near, 90 + i*(span - 180)/7 + r()*100, BY, 1, sg()*0.1, i % 2 ? pick(nb) : pick(nm), 0.045);
  // Dickicht an den Boden-Kanten (Vorschau: POOL) gehört zum Boden, nicht zu dieser Runde – die Zufallszahlen werden
  // trotzdem gezogen, damit die Lianen genau wie in der Vorschau liegen
  for(let i = 0; i < 14; i++){ r(); sg(); r(); r(); }
  for(let i = 0; i < 8; i++){ r(); r(); sg(); }
  // Lianen
  DJ.LIA = [];
  for(let i = 0; i < 11; i++) DJ.LIA.push({x: i*DJ_PER/11 + (r() - 0.5)*50, y: TY, len: 110 + r()*180, ph: r()*6, near: i % 3 == 1,
                                           fl: r() < 0.65 ? (r() < 0.5 ? '255,120,170' : '255,184,70') : null});
  DJ.MUSH = [[300, 150, 340], [1150, 125, 380], [1720, 160, 430]].map(([x, w, sh], i) => ({x, s: djMushSprite(w, sh, i + 7)}));
  DJ.TRK = djTrunk();
  // Himmel (Vorschau: drawBG) einmal vorzeichnen
  DJ.sky = djHimmelTag();
  // Lichtstaub-Kreise (Vorschau: BOK) und Lichtstaub-Punkte
  const rb = rnd(14), Y0 = DJ_BASE - H/zoom;
  DJ.bok = [];
  for(let i = 0; i < 22; i++) DJ.bok.push({x: rb()*VW, y: Y0 + 20 + rb()*560, q: 10 + rb()*38, a: 0.06 + rb()*0.1, ph: rb()*6.28});
  DJ.vign = djVignette();
  DJ.fertig = true;
  DJ.aufbauMs = performance.now() - t0;
}
function djHimmelTag(){   // (in Spiel-Bildpunkten wie BG_SKY: 1:1 kopieren ist ohne Grafikkarte viel billiger als vergrößern)
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const q = c.getContext('2d'), Y0 = DJ_BASE - H/zoom, VHH = H/zoom;
  q.setTransform(zoom, 0, 0, zoom, 0, H*(1 - zoom));
  const gr = q.createLinearGradient(0, Y0, 0, DJ_BASE);
  gr.addColorStop(0, '#0b4a3a'); gr.addColorStop(0.45, '#2f8a62'); gr.addColorStop(1, '#17613a');
  q.fillStyle = gr; q.fillRect(0, Y0, VW, VHH);
  djGlow(q, 210, Y0 - 20, 1000, '255,226,140', 0.75); djGlow(q, VW + 60, Y0 - 60, 640, '190,255,200', 0.25); djGlow(q, VW*0.5, DJ_BASE - 40, 900, '60,160,110', 0.4);
  return c;
}
function djVignette(){   // (ersetzt die bisherige Vignette VIGNETTE gleicher Größe)
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const q = c.getContext('2d'), VHH = H/zoom;
  q.setTransform(zoom, 0, 0, zoom, 0, 0);
  const vg = q.createRadialGradient(VW/2, VHH/2, VW*0.32, VW/2, VHH/2, VW*0.78);
  vg.addColorStop(0, 'rgba(2,36,22,0)'); vg.addColorStop(1, 'rgba(2,34,20,.5)');
  q.fillStyle = vg; q.fillRect(0, 0, VW, VHH);
  return c;
}
// Lichtstaub-Punkte (Vorschau: motes) – fliegen mit dem Wind, reine Deko (Zeit aus der Bildrate, kein Spielzustand)
function djStaubSetzen(n){
  const r = rnd(5 + n), Y0 = DJ_BASE - H/zoom;
  DJ.staub = [];
  for(let i = 0; i < n; i++) DJ.staub.push({x: r()*VW, y: Y0 + r()*H/zoom, r: 0.6 + r()*1.4, v: 0.5 + r()*0.8, ph: r()*6.28});
}

// ---------- Aufbau beim Themenwechsel (aus buildBackground, js/11-hintergrund.js) ----------
function hgStilAufbauen(stil){
  djAufbauen();
  if(stil.nacht) djNachtAufbauen();
  djStaubSetzen(stil.nacht ? DJ_LICHTSTAUB_NACHT : DJ_LICHTSTAUB_TAG);
}

// ---------- Zeichnen pro Bild ----------
// Ebene (Vorschau: band). Mit Wind: jedes Sprite einzeln, leicht gedreht (nur die Ebenen in DJ_WIND_EBENEN). Sonst: die
// ganze Ebene als eine vorgezeichnete Kachel (Ruhelage), gezeichnet auf ganze Bildpunkte -> schnelles Kopieren
function djBand(name, list, f, t, wind, nacht){
  const off = camX*f*DJ_PAR_K;
  if(!wind || !DJ_WIND_EBENEN.has(name)){
    djKachelZeichnen(djKachel(name, DJ_PER, () => list.map(b => ({s: b.s, x: b.x, y: b.y, rot: b.rot, b})), nacht), off);
    return;
  }
  const S = RS*zoom, Y = RS*H*(1 - zoom);
  for(const b of list){
    const s = nacht ? djNachtSprite(b.s, b) : b.s, a = b.rot + (djWind(b.x, t)*b.amp + Math.sin(t*0.7 + b.ph)*0.006)*b.k;
    const x = ((b.x - off) % DJ_PER + DJ_PER) % DJ_PER;
    for(const xx of [x, x - DJ_PER]){
      if(xx < -s.w || xx > VW + s.w) continue;
      const c = Math.cos(a), sn = Math.sin(a);
      ctx.setTransform(S*c, S*sn, -S*sn, S*c, S*xx, S*b.y + Y);
      ctx.drawImage(s.c, -s.sx, -s.sy, s.w, s.h);
    }
  }
}
// stille Kachel: alle Teile in Ruhelage, nahtlos über die Kachelkante (Periode per), in Spiel-Bildpunkten (wie die
// bisherigen Hintergrund-Ebenen), nur so hoch wie nötig. teile() -> [{s, x, y, rot, flip, b}]; nachts eingefärbt.
// weiche Ebenen: Kachel in halber Auflösung, aber nur bei hoher Pixeldichte (RS > 1). Bei RS = 1 werden alle Kacheln 1:1
// kopiert – ohne Grafikkarte ist das ein Vielfaches schneller als vergrößern (gemessen: 0,4 statt 4,7 ms je Ebene)
const DJ_KACHEL_HALB = new Set(['xfar', 'far', 'dach1', 'riesen', 'stamm', 'dens1']);
function djKachel(name, per, teile, nacht, extra){
  const key = name + (nacht ? '@n' : '');
  if(DJ.kacheln[key]) return DJ.kacheln[key];
  const T = teile(), Y0 = DJ_BASE - H/zoom;
  let y0 = Infinity, y1 = -Infinity;
  for(const p of T){
    const s = p.s, oben = Math.cos(p.rot) < 0, r = Math.hypot(s.w, s.h)*0.02;
    const top = oben ? p.y - (s.h - s.sy) : p.y - s.sy, bot = oben ? p.y + s.sy : p.y + (s.h - s.sy);
    y0 = Math.min(y0, top - r - 20); y1 = Math.max(y1, bot + r + 20);
  }
  y0 = Math.floor(Math.max(y0, Y0)*zoom)/zoom; y1 = Math.min(y1, DJ_BASE);
  const sc = DJ_KACHEL_HALB.has(name) && RS > 1.01 ? zoom/2 : zoom, c = document.createElement('canvas'); c.width = Math.ceil(per*sc); c.height = Math.ceil((y1 - y0)*sc);
  const q = c.getContext('2d');
  for(const p of T){
    const s = nacht ? (p.ns || djNachtSprite(p.s, p.b || p)) : p.s;
    for(const xx of [p.x, p.x - per, p.x + per]){
      const cs = Math.cos(p.rot), sn = Math.sin(p.rot), fl = p.flip || 1;
      q.setTransform(sc*cs*fl, sc*sn*fl, -sc*sn, sc*cs, sc*xx, sc*(p.y - y0));
      q.drawImage(s.c, -s.sx, -s.sy, s.w, s.h);
      if(extra) extra(q, p, s);
    }
  }
  return DJ.kacheln[key] = {c, y0, per, sc};
}
// Kachel mit Versatz off (Einheiten) zeichnen – auf ganze Spiel-Bildpunkte gerundet
function djKachelZeichnen(K, off){
  const k = zoom/K.sc, per = K.per*zoom, x0 = -Math.round((((off % K.per) + K.per) % K.per)*zoom), y = Math.round(K.y0*zoom + H*(1 - zoom));
  ctx.setTransform(RS, 0, 0, RS, 0, 0);
  for(let x = x0; x < W; x += per) ctx.drawImage(K.c, x, y, K.c.width*k, K.c.height*k);
}
function djEinheiten(){ ctx.setTransform(RS*zoom, 0, 0, RS*zoom, 0, RS*H*(1 - zoom)); }
// kleines Bild in Spiel-Bildpunkten vorzeichnen: Bereich (x0, y0, w, h) in Einheiten; zeichnen(q) in Einheiten
function djVorBild(x0, y0, w, h, zeichnen){
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w*zoom)); c.height = Math.max(1, Math.ceil(h*zoom));
  const q = c.getContext('2d'); q.setTransform(zoom, 0, 0, zoom, -x0*zoom, -y0*zoom); zeichnen(q);
  return {c, x0, y0};
}
// vorgezeichnetes Bild an (ux, uy) Einheiten setzen – auf ganze Spiel-Bildpunkte gerundet (1:1, ohne Grafikkarte billig)
function djBildSetzen(B, ux, uy){
  ctx.setTransform(RS, 0, 0, RS, 0, 0);
  ctx.drawImage(B.c, Math.round((ux + B.x0)*zoom), Math.round((uy + B.y0)*zoom + H*(1 - zoom)));
}
// Baumstämme (Vorschau: trunks, Periode 2600, zweiter Stamm gespiegelt) – still
function djStaemme(nacht){
  const K = djKachel('stamm', 2600, () => [[800, 1], [1950, -1]].map(([x, fl]) => ({s: DJ.TRK, ns: nacht ? DJ.nTRK : null, x, y: 0, rot: 0, flip: fl})), nacht);
  djKachelZeichnen(K, camX*0.38*DJ_PAR_K);
}
// Riesenblatt-Pflanzen (Vorschau: mushrooms) – still; nachts leuchten sie konstant und dezent (türkise Füllung +
// hellere Adern, lighter mit Deckkraft 0,3, kein Pulsieren) – das Leuchten ist mit in der Nacht-Kachel
function djRiesenblaetter(nacht){
  const K = djKachel('riesen', DJ_PER, () => DJ.MUSH.map(m => ({s: m.s, ns: nacht ? m.ns : null, glow: m.glow, x: m.x, y: DJ_BY, rot: 0})), nacht,
    nacht ? (q, p, s) => { q.save(); q.globalCompositeOperation = 'lighter'; q.globalAlpha = 0.3; q.drawImage(p.glow, -s.sx, -s.sy, s.w, s.h); q.restore(); } : null);
  djKachelZeichnen(K, camX*0.3*DJ_PAR_K);
}
// Lianen (Vorschau: lianas/drawLiana) – weit oben, kräftig sichtbar
function djLianen(t, near, nacht){
  djEinheiten();
  const off = camX*(near ? 0.8 : 0.35)*DJ_PAR_K;
  for(const v of DJ.LIA){
    if(!!v.near !== near) continue;
    const x = ((v.x - off) % DJ_PER + DJ_PER) % DJ_PER;
    for(const xx of [x, x - DJ_PER]){ if(xx < -60 || xx > VW + 60) continue; djLiane(v, xx, t, nacht); }
  }
}
const djLianenFarben = {};
function djLianenFarbe(hex, nacht){ if(!nacht) return hex; return djLianenFarben[hex] || (djLianenFarben[hex] = djNachtFarbe(hex)); }
function djLiane(v, vx, t, nacht){
  const near = v.near, n = 9, pts = [];
  for(let i = 0; i <= n; i++){ const k = i/n; pts.push([vx + djWind(vx, t)*(near ? 26 : 18)*k*k + Math.sin(t*1.3 + v.ph - i*0.5)*4*k, v.y + i*v.len/n]); }
  const g2 = ctx; g2.save(); g2.lineCap = 'round'; g2.lineJoin = 'round';
  const base = near ? 0.6 : 0.42, col = djLianenFarbe(near ? '#2a5e34' : djMix('#3a8a58', DJ_FOG_HEX, 0.4), nacht),
        hl = djLianenFarbe(near ? '#6fb25a' : djMix('#79c88a', DJ_FOG_HEX, 0.4), nacht);
  for(let i = 1; i <= n; i++){
    const k = i/n; g2.globalAlpha = base*Math.max(0, 1 - k*k*0.9);
    g2.strokeStyle = col; g2.lineWidth = (near ? 6.5 : 5)*(1 - k*0.4); g2.beginPath(); g2.moveTo(pts[i - 1][0], pts[i - 1][1]); g2.lineTo(pts[i][0], pts[i][1]); g2.stroke();
    g2.strokeStyle = hl; g2.lineWidth = (near ? 2.8 : 2.2)*(1 - k*0.35); g2.beginPath(); g2.moveTo(pts[i - 1][0] + 1, pts[i - 1][1]); g2.lineTo(pts[i][0] + 1, pts[i][1]); g2.stroke();
  }
  const blatt = djLianenFarbe(near ? '#3f9a4c' : djMix('#62b873', DJ_FOG_HEX, 0.3), nacht);
  pts.forEach((p, i) => {
    if(i && i % 2 == 1){
      const k = i/n; g2.save(); g2.globalAlpha = base*1.1*Math.max(0, 1 - k*k*0.9); g2.translate(p[0], p[1]);
      g2.rotate((i % 4 == 1 ? 1 : -1)*0.9 + Math.sin(t*1.8 + i + v.ph)*0.14); g2.fillStyle = blatt;
      g2.beginPath(); g2.moveTo(0, 0); g2.bezierCurveTo(6, -8, 18, -8, 22, 0); g2.bezierCurveTo(18, 8, 6, 8, 0, 0); g2.fill(); g2.restore();
    }
  });
  if(v.fl){
    const p = pts[6], k = 6/n; g2.save(); g2.globalAlpha = Math.max(0, base*1.2*(1 - k*k*0.9)); g2.translate(p[0], p[1]);
    g2.rotate(Math.sin(t*1.5 + v.ph)*0.12);
    const fc = nacht ? djLianenFarbe(djToHex(v.fl.split(',').map(Number)), true) : 'rgba(' + v.fl + ',.95)';
    for(let j = 0; j < 5; j++){ g2.save(); g2.rotate(-1.2 + j*0.6); g2.fillStyle = fc; g2.beginPath(); g2.ellipse(0, 7, 3.6, 8, 0, 0, 7); g2.fill(); g2.restore(); }
    g2.fillStyle = djLianenFarbe('#ffe27a', nacht); g2.beginPath(); g2.arc(0, 0, 2.4, 0, 7); g2.fill(); g2.restore();
  }
  g2.restore();
}
// Dunst (Vorschau: mist)
// (Schwade einmal vorgezeichnet; die Deckkraft a wechselt per globalAlpha – gleiches Ergebnis, der Verlauf ist linear in a)
const djDunstBilder = {};
function djDunst(t, y, a, col){
  const B = djDunstBilder[col] || (djDunstBilder[col] = djVorBild(-330, -99, 660, 198, q => {
    const g2 = q.createRadialGradient(0, 0, 0, 0, 0, 330); g2.addColorStop(0, 'rgba(' + col + ',1)'); g2.addColorStop(1, 'rgba(' + col + ',0)');
    q.fillStyle = g2; q.scale(1, 0.3); q.fillRect(-330, -330, 660, 660); }));
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for(let i = 0; i < 3; i++){
    const x = ((t*7 + i*700 + y) % (VW + 800)) - 400;
    ctx.globalAlpha = Math.max(0, a + 0.03*Math.sin(t*0.4 + i)); djBildSetzen(B, x, y);
  }
  ctx.restore();
}
// Hintergrund eines neuen Stils (aus drawBackground, js/11-hintergrund.js)
function hgStilZeichnen(){
  const stil = BG_STIL, nacht = stil.nacht, t = performance.now()/1000;
  const windAn = djAn(djSchalter.wind), tw = windAn ? t : 0, t0 = performance.now();
  ctx.save();
  ctx.setTransform(RS, 0, 0, RS, 0, 0);
  if(nacht) djNachtHimmel(t);
  else {
    ctx.drawImage(DJ.sky, 0, 0, W, H);
    // Lichtstaub-Kreise (Bokeh) – nachts aus
    djEinheiten();
    for(const b of DJ.bok){
      const x = b.x + Math.sin(t*0.15 + b.ph)*16, y = b.y + Math.cos(t*0.11 + b.ph*1.7)*11;
      ctx.fillStyle = 'rgba(' + DJ_GL + ',' + b.a + ')'; ctx.beginPath(); ctx.arc(x, y, b.q, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(' + DJ_GL + ',.18)'; ctx.lineWidth = 1.2; ctx.stroke();
    }
  }
  const fog = nacht ? djNachtFarbeRgb(DJ_FOG_NACHT) : DJ_FOG, LY = DJ.LY;
  // Bildabstand messen (frameDt, 14-spielschleife.js): zu langsam -> erst Wind, dann Nacht-Licht aus
  const bild = typeof frameDt === 'number' ? frameDt : 16;
  if(windAn) djMessen(djSchalter.wind, bild);
  else if(nacht && djAn(djSchalter.licht)) djMessen(djSchalter.licht, bild);
  djBand('xfar', LY.xfar, 0.12, tw, windAn, nacht);
  if(nacht && typeof djHgTiereHimmel === 'function') djHgTiereHimmel(t);   // Fledermäuse weit hinten (20-tiere.js)
  djBand('far', LY.far, 0.25, tw, windAn, nacht);
  djRiesenblaetter(nacht);
  djStaemme(nacht);
  if(typeof djHgTiereStamm === 'function') djHgTiereStamm(t, nacht);       // Schnecken am Stamm (20-tiere.js)
  djBand('dens1', LY.dens1, 0.38, tw, windAn, nacht);
  djBand('dach1', LY.dach1, 0.25, tw, windAn, nacht);
  djDunst(t, 430, 0.05, fog);
  djLianen(tw, false, nacht);
  djBand('mid', LY.mid, 0.5, tw, windAn, nacht);
  if(typeof djHgTiereFliegen === 'function') djHgTiereFliegen(t, nacht);    // ferne Schmetterlinge / Nachtfalter (20-tiere.js)
  djBand('dens2', LY.dens2, 0.56, tw, windAn, nacht);
  djBand('stems', LY.stems, 0.62, tw, windAn, nacht);
  djDunst(t, 560, 0.07, fog);
  djBand('dach2', LY.dach2, 0.5, tw, windAn, nacht);
  djBand('near', LY.near, 0.8, tw, windAn, nacht);
  djLianen(tw, true, nacht);
  ctx.setTransform(RS, 0, 0, RS, 0, 0);
  if(nacht) djNachtHintergrundLicht(t);
  ctx.restore();
  DJ.letzteMs = performance.now() - t0;
}
// Lichtstaub-Punkte vor dem Spielfeld (aus 12-welt-zeichnen.js, nach der Spielwelt) und Nacht-Abdunklung + Glühwürmchen
function hgStilVorne(){
  if(!BG_STIL) return;
  const t = performance.now()/1000, dt = Math.min(0.05, (typeof frameDt === 'number' ? frameDt : 16)/1000), windAn = djAn(djSchalter.wind);
  ctx.save();
  if(BG_STIL.nacht && BG_STIL.licht) djNachtVorne(t);
  djEinheiten();
  const Y0 = DJ_BASE - H/zoom;
  for(const m of DJ.staub){
    m.x += (8 + (windAn ? djWind(m.x, t)*24 : 0))*dt*m.v; m.y += Math.sin(t*0.8 + m.ph)*5*dt - 1.2*dt;
    if(m.x > VW + 8) m.x = -8; if(m.y < Y0 - 8) m.y = DJ_BASE + 8;
    const p = 0.5 + 0.5*Math.sin(t*1.2 + m.ph*3);
    ctx.fillStyle = 'rgba(255,252,210,' + (0.25 + 0.5*p) + ')'; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 7); ctx.fill();
  }
  ctx.restore();
}
// Vignette des neuen Looks (statt der warmen Vignette, 19-wetter.js)
function hgStilVignette(){
  if(!BG_STIL) return false;
  ctx.drawImage(DJ.vign, 0, 0, W, H);
  return true;
}

// ---------- Nacht (Vorschau: nacht-look.js, TZ.*) ----------
const DJ_NACHT_COLS = ['70,225,235', '70,225,235', '70,225,235', '100,205,255', '125,150,255'];
function djNachtFarbeRgb(rgb){ return djHex(djNachtFarbe(djToHex(rgb.split(',').map(Number)))).join(','); }
// eingefärbte Kopie eines Sprites (Vorschau: TZ.tintOn) – EINMAL beim Vorzeichnen; der dünne Verlauf darüber hängt von
// der Bildhöhe ab, darum wird er für die Lage des Sprites (Fußpunkt y, hängend = umgedreht) umgerechnet
function djNachtTönen(s, fussY, flip){
  const cw = s.c.width, ch = s.c.height, sc = cw/s.w;
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const q = c.getContext('2d');
  q.drawImage(s.c, 0, 0);
  q.globalCompositeOperation = 'color'; q.fillStyle = 'rgb(30,96,150)'; q.fillRect(0, 0, cw, ch);
  q.globalCompositeOperation = 'destination-in'; q.drawImage(s.c, 0, 0);
  const tmp = document.createElement('canvas'); tmp.width = cw; tmp.height = ch;
  const tq = tmp.getContext('2d'); tq.drawImage(c, 0, 0);
  q.globalCompositeOperation = 'copy'; q.filter = 'contrast(2) brightness(.58) saturate(1)'; q.drawImage(tmp, 0, 0); q.filter = 'none';
  q.globalCompositeOperation = 'source-atop';
  // Bildschirm-Höhe (Einheiten) Y0..BASE -> Zeile im Sprite
  const Y0 = DJ_BASE - H/zoom, zeile = y => (flip ? (fussY - y) + s.sy : (y - fussY) + s.sy)*sc;
  const gr = q.createLinearGradient(0, zeile(Y0), 0, zeile(DJ_BASE));
  gr.addColorStop(0, 'rgba(4,20,56,.34)'); gr.addColorStop(0.6, 'rgba(4,22,50,.3)'); gr.addColorStop(1, 'rgba(4,26,42,.3)');
  q.fillStyle = gr; q.fillRect(0, 0, cw, ch);
  return {c, sx: s.sx, sy: s.sy, w: s.w, h: s.h};
}
function djNachtSprite(s, b){
  if(s._nacht) return s._nacht;
  return s._nacht = djNachtTönen(s, b.y, Math.cos(b.rot) < 0);
}
// Leuchtblatt (Vorschau: TZ.leafSprite): Blattform sanft türkis gefüllt + helle Adern, aus dem Blattbild berechnet
function djLeuchtblatt(s){
  const w = s.c.width, h = s.c.height, a = document.createElement('canvas'); a.width = w; a.height = h;
  const x = a.getContext('2d'); x.drawImage(s.c, 0, 0);
  const o = x.getImageData(0, 0, w, h), b = document.createElement('canvas'); b.width = w; b.height = h;
  const y = b.getContext('2d'); y.filter = 'blur(9px)'; y.drawImage(s.c, 0, 0);
  const bl = y.getImageData(0, 0, w, h), out = x.createImageData(w, h), d = o.data, e = bl.data, qd = out.data;
  for(let i = 0; i < d.length; i += 4){
    const al = d[i + 3]; if(al < 40) continue;
    const L = d[i]*0.3 + d[i + 1]*0.59 + d[i + 2]*0.11, Lb = e[i]*0.3 + e[i + 1]*0.59 + e[i + 2]*0.11, vein = Math.max(0, L - Lb - 3)*14;
    qd[i] = 110; qd[i + 1] = 250; qd[i + 2] = 240; qd[i + 3] = Math.min(255, vein)*(al/255);
  }
  const r = document.createElement('canvas'); r.width = w; r.height = h;
  const z = r.getContext('2d');
  z.drawImage(s.c, 0, 0); z.globalCompositeOperation = 'source-in';
  const gq = z.createLinearGradient(0, 0, 0, h); gq.addColorStop(0, 'rgba(60,215,215,.16)'); gq.addColorStop(1, 'rgba(50,200,200,.08)');
  z.fillStyle = gq; z.fillRect(0, 0, w, h);
  z.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, w, h); x.putImageData(out, 0, 0); z.drawImage(a, 0, 0);
  return r;
}
const DJN = {};   // Nacht-Daten (einmal je Sitzung bzw. je Level)
function djNachtR(seed){ return (s => () => (s = (s*16807) % 2147483647)/2147483647)(seed); }
function djNachtAufbauen(){
  if(DJ.nachtFertig) return;
  const t0 = performance.now();
  for(const m of DJ.MUSH){ m.ns = djNachtTönen(m.s, DJ_BY, false); m.glow = djLeuchtblatt(m.s); }
  DJ.nTRK = djNachtTönen(DJ.TRK, 0, false);
  // Grund hinter den Ebenen (Vorschau: TZ.sky) ohne Sterne: Verlauf + Mond
  {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g2 = c.getContext('2d'), w = W, h = H;
    const gr = g2.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#04122e'); gr.addColorStop(0.45, '#082a58'); gr.addColorStop(0.8, '#0b4068'); gr.addColorStop(1, '#0e5070');
    g2.fillStyle = gr; g2.fillRect(0, 0, w, h);
    const mx = w*0.8, my = h*0.15, mr = h*0.045;
    g2.globalCompositeOperation = 'screen';
    const q = g2.createRadialGradient(mx, my, mr*0.6, mx, my, mr*9); q.addColorStop(0, 'rgba(170,200,255,.34)'); q.addColorStop(1, 'rgba(170,200,255,0)');
    g2.fillStyle = q; g2.fillRect(mx - mr*9, my - mr*9, mr*18, mr*18);
    g2.globalCompositeOperation = 'source-over'; g2.fillStyle = '#e9eefc'; g2.beginPath(); g2.arc(mx, my, mr, 0, 7); g2.fill();
    g2.fillStyle = 'rgba(150,170,210,.35)';
    for(const [a, b, cc] of [[-0.3, -0.2, 0.28], [0.35, 0.15, 0.2], [-0.05, 0.45, 0.16]]){ g2.beginPath(); g2.arc(mx + a*mr, my + b*mr, cc*mr, 0, 7); g2.fill(); }
    DJ.skyNacht = c;
  }
  const R = djNachtR(11);
  DJN.stars = []; for(let i = 0; i < 120; i++) DJN.stars.push([R(), R()*0.5, 0.6 + R()*1.5, R()*9]);
  DJN.ff = []; for(let i = 0; i < 6; i++) DJN.ff.push({x: R()*2000, y: 20 + R()*560, par: 0.25 + R()*0.7, sp: 0.4 + R()*0.6, ph: R()*20, s: 1.1 + R()*1.3, dx: 8 + R()*14});
  DJN.mistW = []; for(let i = 0; i < 6; i++) DJN.mistW.push({x: R()*2400, y: 560 + R()*70, w: 240 + R()*240, sp: 3 + R()*5, par: 0.5 + R()*0.3, ph: R()*9});
  // Lichtschäfte: drei weiche Streifen, einmal vorgezeichnet
  DJN.shS = [];
  for(let i = 0; i < 3; i++){
    const c = document.createElement('canvas'); c.width = 300; c.height = 760;
    const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 300, 0);
    gr.addColorStop(0, 'rgba(150,215,255,0)'); gr.addColorStop(0.5, 'rgba(150,215,255,1)'); gr.addColorStop(1, 'rgba(150,215,255,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 300, 760); x.globalCompositeOperation = 'destination-in';
    const vg = x.createLinearGradient(0, 0, 0, 760); vg.addColorStop(0, 'rgba(0,0,0,.95)'); vg.addColorStop(0.55, 'rgba(0,0,0,.35)'); vg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = vg; x.fillRect(0, 0, 300, 760); DJN.shS.push(c);
  }
  // leuchtende Baumpilze am Stamm
  DJN.brk = [];
  { const r2 = djNachtR(77); let yy = 50;
    for(let i = 0; i < 14; i++){ yy += 28 + r2()*70; const c = r2() < 0.35 ? 2 : 1; for(let k = 0; k < c; k++) DJN.brk.push({y: yy + k*13, side: r2() < 0.5 ? 1 : -1, s: 5 + r2()*9, tr: r2() < 0.5 ? 0 : 1, ph: r2()*9}); } }
  // 16 ferne, unscharfe Leuchtpflanzen (einmal vorgezeichnet und weich gemacht)
  DJN.bgP = [];
  { const r4 = djNachtR(91);
    for(let i = 0; i < 16; i++){ const par = 0.4 + r4()*0.4; DJN.bgP.push({x: i*125 + r4()*90, par, k: i % 3, h: 18 + r4()*26, c: DJ_NACHT_COLS[Math.floor(r4()*DJ_NACHT_COLS.length)], sc: 0.55 + par*0.4, n: 2, ph: r4()*9, wy: 640 - (1 - par)*55 - r4()*40}); }
    for(const p of DJN.bgP){
      // Pflanze zuerst scharf in eine Zwischenfläche, dann einmal weich (gleiches Ergebnis, ein Weichzeichner statt vieler)
      const s = djVorBild(0, 0, 180, 150, q => djPflanze(q, Object.assign({}, p, {wx: 90, wy: 132}), 90, 132, 0, false));
      p.spr = djVorBild(0, 0, 180, 150, q => { q.setTransform(1, 0, 0, 1, 0, 0); q.filter = 'blur(' + (((1 - p.par)*5 + 0.8)*zoom) + 'px)'; q.drawImage(s.c, 0, 0); q.filter = 'none'; });
    }
  }
  DJ.nachtFertig = true;
  DJ.aufbauMs += performance.now() - t0;
}
function djNachtHimmel(t){
  ctx.drawImage(DJ.skyNacht, 0, 0, W, H);
  for(const [x, y, r, p] of DJN.stars){
    ctx.fillStyle = 'rgba(235,242,255,' + (0.4 + 0.4*Math.sin(t*1.2 + p)) + ')'; ctx.beginPath(); ctx.arc(x*W, y*H, r, 0, 7); ctx.fill();
  }
}
const djWrap = (x, par) => ((x - camX*par*DJ_PAR_K) % 2000 + 2000) % 2000 - 200;
// Leuchtpflanze (Vorschau: TZ.plant): gleichmäßiges, ruhiges Leuchten (kein Blinken), Licht fällt auf den Boden.
// k = Art (0 Pilzgruppe, 1 Glockenstängel, 2 Leuchtfarn)
function djPflanze(q, p, x, y, t, windAn){
  const sc = p.sc, w = windAn ? djWind(x, t)*8 : 0, c = p.c;
  y -= 2;
  q.save(); q.translate(x, y + 2); q.scale(1, 0.2); djGlow(q, 0, 0, 90*sc, c, 0.28); q.restore();   // Lichtpfütze
  q.save(); q.globalCompositeOperation = 'screen';
  if(p.k === 0){
    for(let i = 0; i < p.n + 1; i++){
      const ox = (i - 1)*15*sc, hh = (p.h*(i === 1 ? 1.2 : 0.75))*sc, cx = x + ox + w*0.2, cy = y - hh, rw = (i === 1 ? 12 : 8)*sc;
      q.strokeStyle = 'rgba(' + c + ',.3)'; q.lineWidth = 2.6*sc; q.beginPath(); q.moveTo(x + ox, y); q.lineTo(cx, cy); q.stroke();
      q.fillStyle = 'rgba(' + c + ',.5)'; q.beginPath(); q.ellipse(cx, cy, rw, rw*0.6, 0, Math.PI, 0); q.fill();
      q.strokeStyle = 'rgba(215,255,255,.7)'; q.lineWidth = 1.4*sc; q.beginPath(); q.ellipse(cx, cy, rw, rw*0.6, 0, Math.PI, 0); q.stroke();
      q.fillStyle = 'rgba(' + c + ',.4)'; q.beginPath(); q.ellipse(cx, cy + 1, rw*0.9, rw*0.18, 0, 0, 7); q.fill();
    }
    q.restore(); djGlow(q, x, y - p.h*sc*0.7, 70*sc, c, 0.2); return;
  }
  if(p.k === 1){
    const top = p.h*sc*2.1, cx = x + w*1.5;
    q.strokeStyle = 'rgba(' + c + ',.35)'; q.lineWidth = 2*sc; q.beginPath(); q.moveTo(x, y); q.quadraticCurveTo(x + 4*sc, y - top*0.6, cx, y - top); q.stroke();
    for(let i = 0; i < 5; i++){
      const f = 0.45 + i*0.14, bx = x + (cx - x)*f*f + Math.sin(i*2.3)*4*sc, by = y - top*f, s = (6 - i*0.5)*sc;
      q.strokeStyle = 'rgba(' + c + ',.3)'; q.lineWidth = 1.2*sc; q.beginPath(); q.moveTo(bx, by); q.lineTo(bx + 3*sc, by + 4*sc); q.stroke();
      q.fillStyle = 'rgba(' + c + ',.6)'; q.beginPath(); q.moveTo(bx + 3*sc - s*0.6, by + 4*sc); q.quadraticCurveTo(bx + 3*sc, by + 4*sc + s*1.8, bx + 3*sc + s*0.6, by + 4*sc); q.closePath(); q.fill();
      q.fillStyle = 'rgba(225,255,255,.6)'; q.beginPath(); q.arc(bx + 3*sc, by + 4*sc + s*0.9, s*0.28, 0, 7); q.fill();
    }
    q.restore(); djGlow(q, cx, y - top*0.8, 72*sc, c, 0.2); return;
  }
  for(let i = 0; i < 5; i++){
    const a = -1 + i*0.5, len = (22 + p.h*0.8)*sc, ex = x + Math.sin(a)*len + w*0.5, ey = y - Math.cos(a)*len*0.9,
          mx = (x + ex)/2 + Math.sin(a)*6*sc, my = (y + ey)/2 - 10*sc;
    q.strokeStyle = 'rgba(' + c + ',.55)'; q.lineWidth = 1.8*sc; q.beginPath(); q.moveTo(x, y); q.quadraticCurveTo(mx, my, ex, ey); q.stroke();
    for(let j = 1; j <= 6; j++){
      const f = j/7, px = (1 - f)*(1 - f)*x + 2*f*(1 - f)*mx + f*f*ex, py = (1 - f)*(1 - f)*y + 2*f*(1 - f)*my + f*f*ey, l = (7 - j)*1.5*sc*0.8;
      q.strokeStyle = 'rgba(' + c + ',.4)'; q.lineWidth = 1.1*sc; q.beginPath(); q.moveTo(px, py); q.lineTo(px + l, py + l*0.7); q.moveTo(px, py); q.lineTo(px - l, py + l*0.7); q.stroke();
    }
  }
  q.restore(); djGlow(q, x, y - (22 + p.h*0.8)*p.sc*0.5, 65*sc, c, 0.16);
}
// Licht im Hintergrund (Vorschau: TZ.bg): Schimmer unten, Lichtschäfte, Lichtflecken + Moos + Baumpilze am Stamm,
// Bodennebel, ferne Leuchtpflanzen. Schäfte, Bodennebel und ferne Pflanzen lassen sich abschalten (Nacht-Licht).
function djNachtHintergrundLicht(t){
  const lichtAn = djAn(djSchalter.licht);
  if(!DJN.bilder) djNachtLichtBilder();
  const Bi = DJN.bilder;
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  ctx.setTransform(RS, 0, 0, RS, 0, 0);
  const hz = ctx.createLinearGradient(0, H*0.5, 0, H); hz.addColorStop(0, 'rgba(40,170,160,0)'); hz.addColorStop(1, 'rgba(40,170,160,.16)');
  ctx.fillStyle = hz; ctx.fillRect(0, H*0.5, W, H*0.5);   // (oberhalb H/2 ist der Verlauf durchsichtig)
  const Y0 = DJ_BASE - H/zoom;
  if(lichtAn){   // Lichtschäfte (schräg, einmal vorgezeichnet)
    [[260, 0.3, 0.5, 0], [900, 0.3, 0.7, 3], [1560, 0.3, 0.6, 6]].forEach(([x0, par, wd, ph], i) => {
      const x = djWrap(x0, par); if(x < -300 || x > VW + 300) return;
      ctx.globalAlpha = 0.075 + 0.03*Math.sin(t*0.12 + ph); djBildSetzen(Bi.schaft[i], x, Y0);
    });
  }
  // Lichtflecken am Stamm (atmen langsam), Moos-Streifen und Baumpilze (still, je Stamm vorgezeichnet)
  const off = camX*0.38*DJ_PAR_K, PT = 2600;
  [[800, 1], [1950, -1]].forEach(([x0, fl], ti) => {
    const x = ((x0 - off) % PT + PT) % PT;
    for(const xx of [x, x - PT]){
      if(xx < -380 || xx > VW + 380) continue;
      [[-20, 0.2, 70], [24, 0.52, 50], [-8, 0.78, 60]].forEach(([dx, k, w], j) => {
        const y = Y0 + 60 + k*(640 - Y0 - 60);
        ctx.globalAlpha = 0.07 + 0.025*Math.sin(t*0.15 + j + ti*2); djBildSetzen(Bi.fleck[j], xx + dx, y);
      });
      ctx.globalAlpha = 1; djBildSetzen(Bi.stamm[ti], xx, 0);
    }
  });
  if(lichtAn){
    // Bodennebel
    for(const m of DJN.mistW){
      const x = (((m.x + t*m.sp - camX*m.par*DJ_PAR_K) % 2400) + 2400) % 2400 - 300; if(x < -m.w || x > VW + m.w) continue;
      ctx.globalAlpha = 0.10 + 0.04*Math.sin(t*0.2 + m.ph); djBildSetzen(m.bild, x, m.y);
    }
    // ferne Leuchtpflanzen (vorgezeichnet)
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    for(const p of DJN.bgP){ const x = djWrap(p.x, p.par); if(x < -80 || x > VW + 80) continue; djBildSetzen(p.spr, x - 90, 640 - (1 - p.par)*55 - 130); }
  }
  ctx.restore();
}
// einmal vorzeichnen: schräge Lichtschäfte, Lichtflecken (Deckkraft 1, pro Bild globalAlpha), Moos-Streifen + Baumpilze je
// Stamm (wie in der Vorschau 'screen' übereinander), Bodennebel-Schwaden
function djNachtLichtBilder(){
  const Bi = DJN.bilder = {schaft: [], fleck: [], stamm: []}, Y0 = DJ_BASE - H/zoom;
  [0.5, 0.7, 0.6].forEach((wd, i) => {
    Bi.schaft.push(djVorBild(-150*wd - 0.3*760, 0, 300*wd + 0.3*760, 760, q => { q.transform(1, 0, -0.3, 1, 0, 0); q.drawImage(DJN.shS[i], -150*wd, 0, 300*wd, 760); }));
  });
  for(const w of [70, 50, 60]) Bi.fleck.push(djVorBild(-w, -w*1.8, 2*w, 3.6*w, q => {
    q.scale(1, 1.8); const g2 = q.createRadialGradient(0, 0, 0, 0, 0, w); g2.addColorStop(0, 'rgba(150,215,255,1)'); g2.addColorStop(1, 'rgba(150,215,255,0)');
    q.fillStyle = g2; q.beginPath(); q.arc(0, 0, w, 0, 7); q.fill(); }));
  const Lw = y => { const u = (y + 170)/940; return 120 + 50*u + (u > 0.72 ? Math.pow((u - 0.72)/0.28, 1.5)*190 : 0); };
  for(const ti of [0, 1]) Bi.stamm.push(djVorBild(-270, Y0 + 30, 540, 640 - Y0, q => {
    q.globalCompositeOperation = 'screen';
    for(const sd of [-1, 1]){
      const gr = q.createLinearGradient(0, Y0 + 60, 0, 640); gr.addColorStop(0, 'rgba(70,225,225,0)'); gr.addColorStop(0.5, 'rgba(70,225,225,.10)'); gr.addColorStop(1, 'rgba(70,225,225,0)');
      q.strokeStyle = gr; q.lineWidth = 3; q.beginPath();
      for(let y = Y0 + 60; y <= 640; y += 20){ const px = sd*Lw(y)*0.86 + Math.sin(y*0.04 + ti)*4; y === Y0 + 60 ? q.moveTo(px, y) : q.lineTo(px, y); }
      q.stroke();
    }
    for(const b of DJN.brk){
      if(b.tr !== ti) continue;
      const y = Y0 + b.y*1.15, px = b.side*Lw(y)*0.84, s = b.s; if(y > 600) continue;
      djGlow(q, px, y, s*4.2, '70,225,235', 0.13);
      q.fillStyle = 'rgba(70,225,235,.5)'; q.beginPath(); q.ellipse(px, y, s, s*0.42, 0, Math.PI, 0); q.fill();
      q.strokeStyle = 'rgba(215,255,255,.6)'; q.lineWidth = 1; q.beginPath(); q.ellipse(px, y, s, s*0.42, 0, Math.PI, 0); q.stroke();
      q.fillStyle = 'rgba(70,225,235,.28)'; q.beginPath(); q.ellipse(px, y + 1.5, s*0.8, s*0.14, 0, 0, 7); q.fill();
    }
  }));
  for(const m of DJN.mistW) m.bild = djVorBild(-m.w, -m.w*0.18, 2*m.w, 0.36*m.w, q => {
    q.scale(1, 0.18); const g2 = q.createRadialGradient(0, 0, 0, 0, 0, m.w); g2.addColorStop(0, 'rgba(80,215,220,1)'); g2.addColorStop(1, 'rgba(80,215,220,0)');
    q.fillStyle = g2; q.beginPath(); q.arc(0, 0, m.w, 0, 7); q.fill(); });
}
// Leuchtpflanzen am Boden (Vorschau: TZ.pw): nur auf Oberseiten fester Erd-Flächen (Breite >= 60, nicht an der Decke,
// nicht in einer anderen Fläche), große Flächen mit unregelmäßigen Abständen (260–780), kleine höchstens 1–2 Pflanzen,
// keine zwei gleichen Arten nebeneinander. Wie die übrige Deko nie an Münzen, Stacheln, Hebeln usw. (17-deko.js).
let djPwFor = null, djPw = [];
function djLeuchtpflanzenBauen(){
  djPwFor = solids; djPw = [];
  const R = djNachtR(11 + Math.round(LEVEL_W) % 997), statisch = s => s.type === 'ground' || s.type === 'wall' || s.type === 'platform' || s.type === 'crumble';
  const fest = solids.filter(statisch);
  const cov = (wx0, sl) => fest.some(o => o !== sl && wx0 > o.x - 14 && wx0 < o.x + o.w + 14 && sl.y - 6 >= o.y && sl.y - 6 <= o.y + o.h);
  const frei = typeof dekoFreiPruefer === 'function' ? dekoFreiPruefer() : () => true;
  let lk = 0;
  for(const sl of solids){
    if(sl.type !== 'ground' || sl.w < 60 || sl.y <= 40) continue;
    const big = sl.w > 400; let x = sl.x + (big ? 40 + R()*260 : sl.w*(0.3 + R()*0.4));
    const lim = sl.x + sl.w - 30; let cnt = 0;
    while(x < lim && cnt < (big ? 60 : (sl.w > 260 ? 2 : 1))){
      if(!cov(x, sl) && frei(x, sl.y)){
        lk = (lk + 1 + Math.floor(R()*2)) % 3;
        djPw.push({wx: x, wy: sl.y, k: lk, h: 18 + R()*30, c: DJ_NACHT_COLS[Math.floor(R()*DJ_NACHT_COLS.length)], ph: R()*9, sc: 0.95 + R()*0.3, n: 2 + Math.floor(R()*2)});
        cnt++;
      }
      x += big ? 260 + R()*520 : 200;
    }
  }
}
function hgLeuchtpflanzen(){ if(!hgNacht()) return []; if(djPwFor !== solids) djLeuchtpflanzenBauen(); return djPw; }
// Boden-Bereich (aus 12-welt-zeichnen.js, nach Boden und Boden-Deko, vor Elementen/Münzen/Figuren): nachts etwas
// abdunkeln (Vorschau: TZ.figGlow, multiply), Leuchtpflanzen am Boden, weiches kühles Licht um die Figuren
function hgBodenLicht(){
  if(!BG_STIL || !BG_STIL.nacht || !BG_STIL.licht) return;
  const t = performance.now()/1000, windAn = djAn(djSchalter.wind);
  ctx.save();
  ctx.setTransform(RS, 0, 0, RS, 0, 0); ctx.globalCompositeOperation = 'multiply';
  const m = ctx.createLinearGradient(0, 0, W, 0); m.addColorStop(0, 'rgb(115,138,190)'); m.addColorStop(1, 'rgb(145,168,218)');
  ctx.fillStyle = m; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  djEinheiten(); ctx.translate(-camX, 0);
  for(const p of hgLeuchtpflanzen()){ if(p.wx < camX - 90 || p.wx > camX + VW + 90) continue; djPflanze(ctx, p, p.wx, p.wy, t, windAn); }
  for(const p of [p1, p2]) if(p) djGlow(ctx, p.x, p.y - 22, 100, '170,225,245', 0.11);
  ctx.restore();
}
// vor dem Spielfeld (Vorschau: TZ.dark): ganz leichte Abdunklung + 6 Glühwürmchen
function djNachtVorne(t){
  ctx.setTransform(RS, 0, 0, RS, 0, 0); ctx.fillStyle = 'rgba(6,16,46,.08)'; ctx.fillRect(0, 0, W, H);
  djEinheiten();
  for(const f of DJN.ff){
    const x = djWrap(f.x + Math.sin(t*0.3*f.sp + f.ph)*f.dx*3, f.par*0.5), y = f.y + Math.sin(t*0.5*f.sp + f.ph*1.3)*22;
    if(x < -20 || x > VW + 20) continue;
    djGlow(ctx, x, y, 9 + f.s*5, '170,250,255', 0.22);
    ctx.fillStyle = 'rgba(215,252,255,.7)'; ctx.beginPath(); ctx.arc(x, y, f.s, 0, 7); ctx.fill();
  }
}

// (erster Aufbau am Ende von 11a-welt-details.js – diese Datei wird darum VOR 11a geladen)
