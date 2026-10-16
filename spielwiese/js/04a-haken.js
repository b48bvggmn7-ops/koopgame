// 04a-haken.js – Spielwiese Teil 3: Haken wie bei Spider-Man.
// Kein sichtbarer Radius: der Haken sucht jeden Schritt den besten Anker (bzw. bei Variante B jede Fläche) in der Nähe,
// ein kleiner Ring zeigt ihn vorher. Liane fliegt sichtbar (hakenFlug Schritte), strafft sich, dann Pendeln.
// Varianten: A Automatisch (Anker) · B Decken überall · C Anker mit Magnet · D Freies Zielen (Maus / rechter Stick).

// Anker-Sorten: 'o' normal · 's' schwankend (pendelt waagerecht) · 'e' Einmal-Anker (reißt) · 'q' Schwung-Ring (kein Anker)
let anker = [];   // {x, y, bx, by, art, weg, halt, phase}
let ringe = [];   // {x, y, kuehl}
function ankerSammeln(){
  anker = []; ringe = [];
  for(let r = 0; r < KARTE_H; r++) for(let c = 0; c < KARTE_B; c++){
    const z = karte[r][c], x = c * K + K / 2, y = r * K + K / 2;
    if(z === 'o' || z === 's' || z === 'e') anker.push({x, y, bx: x, by: y, art: z, weg: 0, halt: 0, phase: c * 0.7});
    else if(z === 'q') ringe.push({x, y, kuehl: 0});
  }
}
const ankerDa = a => !(a.weg > 0);
// je Schritt: schwankende Anker bewegen, Einmal-Anker reißen/zurückkommen, Schwung-Ringe
function ankerSchritt(){
  for(const a of anker){
    if(a.art === 's') a.x = a.bx + Math.sin(schrittZaehler / 60 * Math.PI * 2 * V.schwankTempo + a.phase) * V.schwankWeite;
    if(a.art === 'e'){
      if(a.weg > 0 && --a.weg === 0){ staubWolke(a.x, a.y, 4, 0); ton('wachsen'); }
      const dran = fig.seil && fig.seil.anker === a && seilFest();
      if(dran && ++a.halt > V.einmalZeit * 60) ankerReissen(a);
      if(!dran) a.halt = 0;
    }
  }
  for(const g of ringe){
    if(g.kuehl > 0){ g.kuehl--; continue; }
    const m = figMitte(), v = Math.hypot(fig.vx, fig.vy);
    if(!fig.tot && Math.hypot(m.x - g.x, m.y - g.y) < 28 && v > 2){
      const neu = Math.min(V.ringMax, v * V.ringBoost);
      fig.vx *= neu / v; fig.vy *= neu / v; g.kuehl = 40;
      teilchenBurst(g.x, g.y, 16, '#ffd84a'); trefferStopp(1); wackeln(0.1); ton('ring');
    }
  }
}
function ankerReissen(a){
  if(fig.seil && fig.seil.anker === a) seilLoesen(true);
  a.weg = Math.round(V.einmalZurueck * 60); a.halt = 0;
  teilchenBurst(a.x, a.y, 12, '#ff9a3c'); ton('reissen');
}

const figMitte = () => ({x: fig.x + FIG_B / 2, y: fig.y + FIG_H / 2});
// Sichtlinie: keine festen Kästchen zwischen a und b (die letzten px vor b zählen nicht – dort sitzt die Fläche selbst)
function sichtFrei(ax, ay, bx, by, rest){
  const d = Math.hypot(bx - ax, by - ay), n = Math.ceil(d / 6);
  for(let i = 1; i < n; i++){
    const t = i / n; if(d * (1 - t) < (rest || 0)) break;
    if(fest(Math.floor((ax + (bx - ax) * t) / K), Math.floor((ay + (by - ay) * t) / K))) return false;
  }
  return true;
}
// Strahl bis zur ersten festen Fläche (für B und D)
function strahl(ax, ay, dx, dy, max){
  for(let s = 8; s <= max; s += 4){
    const x = ax + dx * s, y = ay + dy * s;
    if(fest(Math.floor(x / K), Math.floor(y / K))) return {x: ax + dx * (s - 2), y: ay + dy * (s - 2), dist: s};
  }
  return null;
}
function zielRichtungLesen(){
  const r = richtungLesen(), l = Math.hypot(r.x, r.y);
  if(l > 0.3) return {x: r.x / l, y: r.y / l};
  return {x: fig.blick * 0.7071, y: -0.7071};   // ohne Richtung: schräg nach vorn oben
}
function mausWelt(){
  return {x: kam.x + ein.maus.x / ZOOM, y: kam.y + ein.maus.y / ZOOM};
}
function zielBewerten(p, aim, bonus){
  const m = figMitte(), dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy);
  if(d < 30 || d > V.hakenReichweite) return -Infinity;
  const ux = dx / d, uy = dy / d;
  if(uy > 0.25) return -Infinity;   // nie deutlich unter mir
  return V.zielRichtung * (ux * aim.x + uy * aim.y) + V.zielOben * (-uy) - V.zielNaehe * d / V.hakenReichweite + (bonus || 0);
}
// bestes Ziel suchen ({x, y, anker: bool} oder null); ohne = der aktuelle Anker (beim Hangeln)
function hakenZielSuchen(ohne){
  const m = figMitte(), v = MECHANIKEN.haken.aktiv;
  if(v === 3){   // D: freies Zielen – Maus (wenn zuletzt bewegt) oder rechter Stick
    let ax, ay;
    const st = ein.stickR, sl = Math.hypot(st.x, st.y);
    if(sl > 0.35){ ax = st.x / sl; ay = st.y / sl; }
    else if(ein.maus.da){ const w = mausWelt(); const l = Math.hypot(w.x - m.x, w.y - m.y) || 1; ax = (w.x - m.x) / l; ay = (w.y - m.y) / l; }
    else { const a = zielRichtungLesen(); ax = a.x; ay = a.y; }
    fig.zielStrahl = {x: ax, y: ay};
    const treffer = strahl(m.x, m.y, ax, ay, V.hakenReichweite);
    let best = null, bestD = treffer ? treffer.dist : V.hakenReichweite;
    for(const a of anker){   // Anker nahe am Zielstrahl (bis ~35 px daneben) haben Vorrang
      if(a === ohne || !ankerDa(a)) continue;
      const dx = a.x - m.x, dy = a.y - m.y, lang = dx * ax + dy * ay, quer = Math.abs(dx * ay - dy * ax);
      if(lang > 20 && lang <= bestD + 30 && quer < 35 && sichtFrei(m.x, m.y, a.x, a.y)){ best = {x: a.x, y: a.y, anker: a}; bestD = lang; }
    }
    if(best) return best;
    return treffer ? {x: treffer.x, y: treffer.y, anker: null} : null;
  }
  fig.zielStrahl = null;
  const aim = zielRichtungLesen();
  let best = null, bestS = -Infinity;
  for(const a of anker){
    if(a === ohne || !ankerDa(a)) continue;
    const s = zielBewerten(a, aim, v === 1 ? V.ankerBonus : 0);
    if(s > bestS && sichtFrei(m.x, m.y, a.x, a.y)){ bestS = s; best = {x: a.x, y: a.y, anker: a}; }
  }
  if(v === 1){   // B: jede Fläche über oder neben mir (Fächer von Strahlen)
    for(let w = -175; w <= -5; w += 10){
      const rad = w * Math.PI / 180, t = strahl(m.x, m.y, Math.cos(rad), Math.sin(rad), V.hakenReichweite);
      if(!t) continue;
      const s = zielBewerten(t, aim, 0);
      if(s > bestS){ bestS = s; best = {x: t.x, y: t.y, anker: null}; }
    }
  }
  return best;
}

// ---------- Seil: schießen, straffen, lösen ----------
function hakenSchiessen(z){
  if(fig.ball && !rollenBeenden()) return;
  fig.haengt = null;
  const m = figMitte();
  const kette = V.ketteAn && fig.kette > 0;   // nahtlose Kette: kurz nach dem Loslassen sitzt die Liane sofort
  fig.seil = {x: z.x, y: z.y, anker: z.anker, zustand: 'flug', t: 0, n: kette ? 1 : Math.max(1, Math.round(V.hakenFlug)),
    startX: m.x, startY: m.y, len: 0, startLen: 0};
  if(kette){ fig.kette = 0; ton('kette'); teilchenBurst(m.x, m.y, 6, '#bff27a'); } else ton('schuss');
}
function hakenFestmachen(){
  const s = fig.seil, m = figMitte();
  s.zustand = 'fest'; s.len = Math.max(V.seilMin, Math.hypot(s.x - m.x, s.y - m.y));
  s.zielLen = Math.max(V.seilMin, Math.min(s.len, V.seilStartMax)); s.startLen = s.zielLen; s.knicke = [];
  fig.rutsch = 0; fig.sprungAktiv = false; fig.gleit = 0; fig.sperre = 0;
  dashAufladen();   // Haken-Greifen lädt den Dash auf
  trefferStopp(1); wackeln(0.08); ton('greifen');
}
// Perfektes Loslassen: vorn im Aufschwung, Winkel zum Drehpunkt im Fenster (0° = genau darunter)
function perfektFenster(){
  const s = fig.seil; if(!V.perfektAn || !s || s.zustand !== 'fest' || fig.amBoden) return false;
  const p = seilDrehpunkt(s), m = figMitte(), dx = m.x - p.x, dy = m.y - p.y;
  const w = Math.atan2(Math.abs(dx), dy) * 180 / Math.PI;
  return fig.vy < 0 && Math.sign(fig.vx) === Math.sign(dx) && Math.abs(fig.vx) > 2 && w >= V.perfektVon && w <= V.perfektBis;
}
function seilLoesen(mitBoost){
  const s = fig.seil; if(!s) return;
  const perfekt = mitBoost && perfektFenster();
  fig.seil = null;
  if(s.anker && s.anker.art === 'e' && s.zustand === 'fest' && ankerDa(s.anker)) ankerReissen(s.anker);   // Einmal-Anker: nach einem Schwung weg
  if(s.zustand !== 'fest' || !mitBoost || fig.amBoden) return;
  fig.kette = V.kettenFenster;   // ab jetzt kurz: neues K = nahtlose Kette
  fig.vx *= V.abwurfBoost; fig.vy = fig.vy * V.abwurfBoost - V.abwurfHoch;
  let max = V.abwurfMax;
  if(perfekt){
    fig.vx *= V.perfektBoost; fig.vy *= V.perfektBoost; max *= 1.15;
    const m = figMitte(); teilchenBurst(m.x, m.y, 14, '#ffd84a'); trefferStopp(2); wackeln(0.12); ton('perfekt');
    fx.texte.push({x: m.x, y: m.y - 30, text: 'Perfekt!', leben: 40});
  }
  const v = Math.hypot(fig.vx, fig.vy);
  if(v > max){ fig.vx *= max / v; fig.vy *= max / v; }
  dehnen(fig, 0.82, 1.2); ton('abwurf');
}
const seilFest = () => fig.seil && fig.seil.zustand === 'fest';

// Eingabe für den Haken – am Anfang jedes Schritts (nach den Puffern). Gibt true zurück, wenn der Sprung verbraucht wurde.
function hakenEingabe(E, rx){
  if(bau.an && !fig.seil){ fig.hakenZiel = null; return false; }   // beim Bauen ist die Maus zum Bauen da
  const halten = V.hakenHalten, gedrueckt = E.haken, gehaltenJetzt = gehalten('haken');
  if(!fig.seil || seilFest()) fig.hakenZiel = hakenZielSuchen(fig.seil ? fig.seil.anker : null);
  if(fig.fehlschuss && ++fig.fehlschuss.t > 10) fig.fehlschuss = null;
  if(fig.kette > 0) fig.kette--;

  if(fig.seil){
    if(halten && !gehaltenJetzt){ seilLoesen(true); return false; }
    if(!halten && gedrueckt){   // drücken-Modus: nochmal drücken = zum nächsten Anker hangeln, sonst los
      const z = fig.hakenZiel;
      if(seilFest() && z && z.anker){ seilLoesen(false); hakenSchiessen(z); }
      else seilLoesen(true);
      return false;
    }
    if(seilFest() && fig.puffer > 0){   // Springen am Seil: loslassen + Hüpfer, an der Wand: Wandsprung
      fig.puffer = 0;
      if(fig.wandZeit > 0 && !fig.amBoden){ seilLoesen(false); wandSpringen(); }
      else if(fig.amBoden){ seilLoesen(false); springen(); }
      else { seilLoesen(true); fig.vy = Math.min(fig.vy, fig.vy - V.seilSprung * 0.5, -V.seilSprung); ton('sprung'); }
      return true;
    }
    return false;
  }
  if(gedrueckt) fig.hakenPuffer = V.hakenPuffer + 1;
  if(fig.hakenPuffer > 0 && halten && !gehaltenJetzt) fig.hakenPuffer = 0;   // halten-Modus: losgelassen = nicht mehr greifen
  if(fig.hakenPuffer > 0){
    const z = fig.hakenZiel;
    if(z){ fig.hakenPuffer = 0; if(fig.dash) dashBeenden(false); hakenSchiessen(z); }
    else if(gedrueckt){   // nichts in Reichweite: keine Liane (Schalter: kurz ins Leere)
      if(V.fehlschussZeigen){ const a = fig.zielStrahl || zielRichtungLesen(); fig.fehlschuss = {x: a.x, y: a.y, t: 0}; }
      ton('fehlschuss');
    }
    if(fig.hakenPuffer > 0) fig.hakenPuffer--;
  }
  return false;
}

// Liane im Flug: Spitze wandert zum Ziel; angekommen -> fest
function seilFlugSchritt(){
  const s = fig.seil; if(!s) return;
  if(s.anker){ s.x = s.anker.x; s.y = s.anker.y; if(!ankerDa(s.anker)){ seilLoesen(true); return; } }   // bewegter Anker: Liane folgt
  if(s.zustand !== 'flug') return;
  if(++s.t >= s.n) hakenFestmachen();
}

// Am Seil (fest): Schwung holen, W/S, Magnet, Dämpfung und das Seil als Grenze (Tempo wird aufs Seil umgelenkt)
function seilSchwungEingabe(rx){
  if(!fig.amBoden) fig.vx += rx * V.schwungKraft;
}
// Idee 3 – Liane knickt an Ecken: verdeckt eine Ecke die Sicht vom Drehpunkt zur Figur, wird die Ecke der neue Drehpunkt
// (das Seil wird um das Stück kürzer); schwingt man zurück, wickelt es sich wieder ab.
const seilDrehpunkt = s => (s.knicke && s.knicke.length) ? s.knicke[s.knicke.length - 1] : s;
const kreuz = (ax, ay, bx, by) => ax * by - ay * bx;
function knickSuchen(p, m){
  const d = Math.hypot(m.x - p.x, m.y - p.y), n = Math.ceil(d / 4);
  for(let i = 2; i < n; i++){
    const x = p.x + (m.x - p.x) * i / n, y = p.y + (m.y - p.y) * i / n, c = Math.floor(x / K), r = Math.floor(y / K);
    if(!fest(c, r)) continue;
    let best = null, bestK = Infinity;
    for(const [ex, ey] of [[0, 0], [1, 0], [0, 1], [1, 1]]){
      const q = {x: (c + ex) * K + (ex ? 1.5 : -1.5), y: (r + ey) * K + (ey ? 1.5 : -1.5)};
      if(fest(Math.floor(q.x / K), Math.floor(q.y / K))) continue;
      if(!sichtFrei(p.x, p.y, q.x, q.y, 2) || !sichtFrei(q.x, q.y, m.x, m.y, 2)) continue;
      const kosten = Math.hypot(q.x - p.x, q.y - p.y) + Math.hypot(m.x - q.x, m.y - q.y);
      if(kosten < bestK){ bestK = kosten; best = q; }
    }
    return best;
  }
  return null;
}
function seilKnickSchritt(s, m){
  if(!V.seilKnick){ s.knicke = []; return; }
  // abwickeln: liegt die Figur wieder auf der anderen Seite des letzten Knicks?
  while(s.knicke.length){
    const q = s.knicke[s.knicke.length - 1], p = s.knicke.length > 1 ? s.knicke[s.knicke.length - 2] : s;
    const sinn = Math.sign(kreuz(q.x - p.x, q.y - p.y, m.x - q.x, m.y - q.y));
    if(sinn && sinn !== q.sinn){ s.knicke.pop(); s.len += q.stueck; s.zielLen += q.stueck; } else break;
  }
  // aufwickeln: Ecke zwischen Drehpunkt und Figur?
  const p = seilDrehpunkt(s);
  if(s.knicke.length < 8 && !sichtFrei(p.x, p.y, m.x, m.y, 2)){
    const q = knickSuchen(p, m);
    if(q){
      q.stueck = Math.hypot(q.x - p.x, q.y - p.y);
      q.sinn = Math.sign(kreuz(q.x - p.x, q.y - p.y, m.x - q.x, m.y - q.y)) || 1;
      s.knicke.push(q);
      s.len = Math.max(V.seilMin * 0.5, s.len - q.stueck); s.zielLen = Math.max(V.seilMin * 0.5, s.zielLen - q.stueck);
      ton('knick');
    }
  }
}
function seilNachSchwerkraft(){
  const s = fig.seil, m = figMitte();
  seilKnickSchritt(s, m);
  if(s.len > s.zielLen) s.len = Math.max(s.zielLen, s.len - V.straffTempo);   // Liane strafft sich
  // W = ranziehen, S = geben (immer schneller = Rutschen)
  if(gehalten('hoch') && !gehalten('runter')){ s.len = Math.max(V.seilMin, s.len - V.seilRan); s.zielLen = Math.min(s.zielLen, s.len); fig.rutsch = 0; }
  else if(gehalten('runter')){
    fig.rutsch = Math.min(V.rutschMax, Math.max(V.seilGeben, (fig.rutsch || 0) + V.rutschBeschl));
    s.len = Math.min(V.hakenReichweite, s.len + fig.rutsch); s.zielLen = Math.max(s.zielLen, s.len);
  } else fig.rutsch = 0;
  if(MECHANIKEN.haken.aktiv === 2 && !s.knicke.length){   // C: Magnet zieht heran
    const ziel = s.startLen * V.magnetAnteil;
    if(s.len > ziel) s.len = Math.max(ziel, s.len - V.magnetZug);
    s.zielLen = Math.min(s.zielLen, s.len);
  }
  if(!fig.amBoden){ fig.vx *= V.seilDaempfung; fig.vy *= V.seilDaempfung; }
  // Grenze: wo wäre ich nach diesem Schritt? Liegt das außerhalb des Seils -> zurück auf den Kreis, Tempo entsprechend
  const dp = seilDrehpunkt(s);
  const px = m.x + fig.vx, py = m.y + fig.vy, dx = px - dp.x, dy = py - dp.y, d = Math.hypot(dx, dy);
  s.dehnung = 0;
  if(V.gummiLiane && d > s.len){   // Gummi-Liane: zieht wie eine Feder zurück, federt nach, höchstens gummiMax gedehnt
    const ux = dx / d, uy = dy / d, zug = (d - s.len) * V.gummiHaerte;
    fig.vx -= ux * zug; fig.vy -= uy * zug;
    const vr = fig.vx * ux + fig.vy * uy; if(vr > 0){ fig.vx -= ux * vr * (1 - V.gummiDaempfung); fig.vy -= uy * vr * (1 - V.gummiDaempfung); }
    const grenze = s.len * (1 + V.gummiMax), px2 = m.x + fig.vx, py2 = m.y + fig.vy, d2 = Math.hypot(px2 - dp.x, py2 - dp.y);
    if(d2 > grenze){ fig.vx = dp.x + (px2 - dp.x) / d2 * grenze - m.x; fig.vy = dp.y + (py2 - dp.y) / d2 * grenze - m.y; }
    s.dehnung = Math.max(0, Math.min(d2, grenze) / s.len - 1);
  } else if(d > s.len){
    const nx = dp.x + dx / d * s.len, ny = dp.y + dy / d * s.len;
    fig.vx = nx - m.x; fig.vy = ny - m.y;
  }
}

// ---------- Zeichnen ----------
function ankerZeichnen(a){
  if(!ankerDa(a)){   // gerissener Einmal-Anker: nur ein gestrichelter Umriss, bis er wieder da ist
    ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(255,140,60,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(a.x, a.y, 11, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); return;
  }
  if(a.art === 's'){   // schwankend: feine Bahn zeigt, wo er hin und her pendelt
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([2, 6]);
    ctx.beginPath(); ctx.moveTo(a.bx - V.schwankWeite, a.by); ctx.lineTo(a.bx + V.schwankWeite, a.by); ctx.stroke(); ctx.setLineDash([]);
  }
  if(V.spielLook) lookAnker(a);
  else {
    ctx.strokeStyle = '#5b6574'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(a.x, a.y, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#c9d3df'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(a.x, a.y, 10, 0, Math.PI * 2); ctx.stroke();
  }
  if(a.art === 'e'){   // Einmal-Anker: oranger Ring mit Rissen, blinkt, wenn er gleich reißt
    const rest = 1 - a.halt / (V.einmalZeit * 60), blink = rest < 0.35 && Math.floor(performance.now() / 90) % 2;
    ctx.strokeStyle = blink ? '#ffffff' : '#ff8a2a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(a.x, a.y, 16, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#7a3a10'; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(a.x - 14, a.y - 6); ctx.lineTo(a.x - 9, a.y - 2); ctx.moveTo(a.x + 12, a.y + 8); ctx.lineTo(a.x + 8, a.y + 4); ctx.stroke();
  }
}
function ringZeichnen(g){
  const p = 1 + Math.sin(performance.now() / 200 + g.x) * 0.06, r = 24 * p;
  ctx.lineWidth = 7; ctx.strokeStyle = g.kuehl > 0 ? 'rgba(255,216,74,0.35)' : 'rgba(150,100,10,0.7)';
  ctx.beginPath(); ctx.arc(g.x, g.y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 3.5; ctx.strokeStyle = g.kuehl > 0 ? 'rgba(255,240,170,0.5)' : '#ffd84a';
  ctx.beginPath(); ctx.arc(g.x, g.y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(g.x - r * 0.6, g.y - r * 0.6, 2.5, 0, Math.PI * 2); ctx.fill();
}
function hakenZeichnen(alpha){
  const fx_ = mischen(fig.px, fig.x, alpha) + FIG_B / 2, fy_ = mischen(fig.py, fig.y, alpha) + FIG_H / 2;
  for(const g of ringe) ringZeichnen(g);
  for(const a of anker) ankerZeichnen(a);
  // Zielring (dezent, pulsierend) – nur wenn frei bzw. beim Hangeln
  const z = fig.hakenZiel;
  if(V.zielRing && z && !fig.tot && (!fig.seil || seilFest())){
    const p = 1 + Math.sin(performance.now() / 140) * 0.12;
    ctx.lineWidth = 4.5; ctx.strokeStyle = 'rgba(20,30,50,0.45)';
    ctx.beginPath(); ctx.arc(z.x, z.y, 17 * p, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 2.2; ctx.strokeStyle = fig.seil ? 'rgba(255,225,110,0.9)' : 'rgba(255,255,255,0.95)';
    ctx.beginPath(); ctx.arc(z.x, z.y, 17 * p, 0, Math.PI * 2); ctx.stroke();
  }
  if(fig.zielStrahl && !fig.seil && MECHANIKEN.haken.aktiv === 3 && !fig.tot){   // D: feine Ziellinie
    ctx.setLineDash([4, 8]); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(fx_, fy_); ctx.lineTo(fx_ + fig.zielStrahl.x * 120, fy_ + fig.zielStrahl.y * 120); ctx.stroke(); ctx.setLineDash([]);
  }
  const s = fig.seil;
  if(s && !fig.tot){
    let tx = s.x, ty = s.y;
    const gold = perfektFenster(), dehnung = s.dehnung || 0;
    if(s.zustand === 'flug'){
      const t = Math.min(1, (s.t + alpha) / s.n); tx = mischen(fx_, s.x, t); ty = mischen(fy_, s.y, t);
      lianeZeichnen(fx_, fy_, tx, ty, {flug: 1 - t});
    } else {
      // Durchhang: hat die Liane mehr Länge als Abstand (z. B. kurz nach dem Greifen), hängt sie durch
      let a = s;
      const stuecke = [];
      for(const q of (s.knicke || [])){ stuecke.push([a.x, a.y, q.x, q.y]); a = q; }
      stuecke.push([a.x, a.y, fx_, fy_]);
      const letzt = stuecke[stuecke.length - 1], abst = Math.hypot(letzt[2] - letzt[0], letzt[3] - letzt[1]);
      stuecke.forEach((st, i) => lianeZeichnen(st[0], st[1], st[2], st[3], {gold, dehnung,
        durchhang: i === stuecke.length - 1 ? Math.min(70, Math.max(0, s.len - abst) * 0.6) : 0}));
      for(const q of (s.knicke || [])){ ctx.fillStyle = '#2b4a1e'; ctx.beginPath(); ctx.arc(q.x, q.y, 4, 0, Math.PI * 2); ctx.fill(); }
    }
    blattBuschel(tx, ty);
  }
  if(fig.fehlschuss && !fig.tot){
    const f = fig.fehlschuss, t = f.t <= 5 ? f.t / 5 : (10 - f.t) / 5, l = 160 * t;
    lianeZeichnen(fx_, fy_, fx_ + f.x * l, fy_ + f.y * l, {flug: 0.6});
  }
}
// Liane: gedrehte, grüne Ranke mit dunkler Kontur, hellen Windungen und kleinen Blättern; hängt durch, wenn locker;
// im Flug schlängelt sie; golden leuchtend im Perfekt-Fenster; dünner, wenn die Gummi-Liane gedehnt ist
function lianeZeichnen(x0, y0, x1, y1, o){
  o = o || {};
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const zeit = performance.now() / 90;
  const sag = (o.durchhang || 0) + (o.flug ? 14 * o.flug : 0);
  const cx = (x0 + x1) / 2 + (ny < 0 ? -nx : nx) * 0 , cy = (y0 + y1) / 2 + sag;   // Durchhang nach unten
  const punkt = t => {   // Punkt auf der Kurve (+ Schlängeln im Flug)
    const u = 1 - t, x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1;
    const w = o.flug ? Math.sin(t * 14 - zeit) * 5 * o.flug * Math.sin(t * Math.PI) : 0;
    return [x + nx * w, y + ny * w];
  };
  const n = Math.max(6, Math.ceil(l / 12)), pts = [];
  for(let i = 0; i <= n; i++) pts.push(punkt(i / n));
  const spur = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for(let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); };
  const dick = 1 / (1 + (o.dehnung || 0) * 1.5);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if(o.gold){   // Perfekt-Fenster: kräftiges goldenes Leuchten (pulsiert)
    const p = 0.7 + Math.sin(performance.now() / 60) * 0.3;
    spur(); ctx.strokeStyle = `rgba(255,200,40,${0.35 * p})`; ctx.lineWidth = 20; ctx.stroke();
    spur(); ctx.strokeStyle = `rgba(255,225,90,${0.75 * p})`; ctx.lineWidth = 11; ctx.stroke();
  }
  spur(); ctx.strokeStyle = '#22401a'; ctx.lineWidth = 6.5 * dick; ctx.stroke();
  spur(); ctx.strokeStyle = o.gold ? '#d6c636' : '#4e8a35'; ctx.lineWidth = 4.5 * dick; ctx.stroke();
  spur(); ctx.setLineDash([5, 7]); ctx.lineDashOffset = -l * 0.1; ctx.strokeStyle = 'rgba(170,220,120,0.8)'; ctx.lineWidth = 1.6 * dick; ctx.stroke(); ctx.setLineDash([]);
  // Blätter entlang der Ranke (abwechselnd links/rechts)
  const blaetter = Math.floor(l / 30);
  for(let i = 1; i <= blaetter; i++){
    const t = i / (blaetter + 1), [bx, by] = punkt(t), [ax, ay] = punkt(Math.max(0, t - 0.02));
    const w = Math.atan2(by - ay, bx - ax) + (i % 2 ? 0.9 : -0.9) + Math.sin(zeit * 0.3 + i) * 0.15;
    blatt(bx, by, w, i % 3 === 0 ? 8 : 6.5);
  }
  ctx.lineCap = 'butt';
}
function blatt(x, y, w, gr){
  ctx.save(); ctx.translate(x, y); ctx.rotate(w);
  ctx.fillStyle = '#4f9a45'; ctx.beginPath(); ctx.ellipse(gr * 0.9, 0, gr, gr * 0.45, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2b5a24'; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = 'rgba(190,235,150,0.8)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(gr * 1.6, 0); ctx.stroke();
  ctx.restore();
}
function blattBuschel(x, y){   // Blätterbüschel, wo die Liane festhält
  for(let i = 0; i < 4; i++) blatt(x, y, i * Math.PI / 2 + 0.4, 6);
  ctx.fillStyle = '#3c6b2f'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
}
