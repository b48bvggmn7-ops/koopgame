// 04a-haken.js – Spielwiese Teil 3: Haken wie bei Spider-Man.
// Kein sichtbarer Radius: der Haken sucht jeden Schritt den besten Anker (bzw. bei Variante B jede Fläche) in der Nähe,
// ein kleiner Ring zeigt ihn vorher. Liane fliegt sichtbar (hakenFlug Schritte), strafft sich, dann Pendeln.
// Varianten: A Automatisch (Anker) · B Decken überall · C Anker mit Magnet · D Freies Zielen (Maus / rechter Stick).

let anker = [];   // {x, y} Mitte der Anker-Kästchen ('o' in der Karte)
function ankerSammeln(){
  anker = [];
  for(let r = 0; r < KARTE_H; r++) for(let c = 0; c < KARTE_B; c++) if(karte[r][c] === 'o') anker.push({x: c * K + K / 2, y: r * K + K / 2});
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
      if(a === ohne) continue;
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
    if(a === ohne) continue;
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
  fig.seil = {x: z.x, y: z.y, anker: z.anker, zustand: 'flug', t: 0, n: Math.max(1, Math.round(V.hakenFlug)),
    startX: m.x, startY: m.y, len: 0, startLen: 0};
  ton('schuss');
}
function hakenFestmachen(){
  const s = fig.seil, m = figMitte();
  s.zustand = 'fest'; s.len = Math.max(V.seilMin, Math.hypot(s.x - m.x, s.y - m.y));
  s.zielLen = Math.max(V.seilMin, Math.min(s.len, V.seilStartMax)); s.startLen = s.zielLen; s.knicke = [];
  fig.rutsch = 0; fig.sprungAktiv = false; fig.gleit = 0; fig.sperre = 0;
  dashAufladen();   // Haken-Greifen lädt den Dash auf
  trefferStopp(1); wackeln(0.08); ton('greifen');
}
function seilLoesen(mitBoost){
  const s = fig.seil; if(!s) return;
  fig.seil = null;
  if(s.zustand !== 'fest' || !mitBoost || fig.amBoden) return;
  fig.vx *= V.abwurfBoost; fig.vy = fig.vy * V.abwurfBoost - V.abwurfHoch;
  const v = Math.hypot(fig.vx, fig.vy);
  if(v > V.abwurfMax){ fig.vx *= V.abwurfMax / v; fig.vy *= V.abwurfMax / v; }
  dehnen(fig, 0.82, 1.2); ton('abwurf');
}
const seilFest = () => fig.seil && fig.seil.zustand === 'fest';

// Eingabe für den Haken – am Anfang jedes Schritts (nach den Puffern). Gibt true zurück, wenn der Sprung verbraucht wurde.
function hakenEingabe(E, rx){
  if(bau.an && !fig.seil){ fig.hakenZiel = null; return false; }   // beim Bauen ist die Maus zum Bauen da
  const halten = V.hakenHalten, gedrueckt = E.haken, gehaltenJetzt = gehalten('haken');
  if(!fig.seil || seilFest()) fig.hakenZiel = hakenZielSuchen(fig.seil ? fig.seil.anker : null);
  if(fig.fehlschuss && ++fig.fehlschuss.t > 10) fig.fehlschuss = null;

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
  const s = fig.seil; if(!s || s.zustand !== 'flug') return;
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
  if(d > s.len){
    const nx = dp.x + dx / d * s.len, ny = dp.y + dy / d * s.len;
    fig.vx = nx - m.x; fig.vy = ny - m.y;
  }
}

// ---------- Zeichnen ----------
function hakenZeichnen(alpha){
  const fx_ = mischen(fig.px, fig.x, alpha) + FIG_B / 2, fy_ = mischen(fig.py, fig.y, alpha) + FIG_H / 2;
  if(V.spielLook) for(const a of anker) lookAnker(a);   // Haken-Punkt wie im Spiel (06a-look.js)
  else for(const a of anker){   // Anker: Metallring mit Halterung
    ctx.strokeStyle = '#5b6574'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(a.x, a.y, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#c9d3df'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(a.x, a.y, 10, 0, Math.PI * 2); ctx.stroke();
  }
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
    if(s.zustand === 'flug'){ const t = Math.min(1, (s.t + alpha) / s.n); tx = mischen(fx_, s.x, t); ty = mischen(fy_, s.y, t); }
    if(s.zustand === 'fest' && s.knicke && s.knicke.length){   // geknickte Liane: Anker -> Knicke -> Figur
      let a = s; for(const q of s.knicke){ lianeZeichnen(a.x, a.y, q.x, q.y, 0); a = q; }
      lianeZeichnen(a.x, a.y, fx_, fy_, 0);
      for(const q of s.knicke){ ctx.fillStyle = '#2f5a24'; ctx.beginPath(); ctx.arc(q.x, q.y, 3.5, 0, Math.PI * 2); ctx.fill(); }
    } else lianeZeichnen(fx_, fy_, tx, ty, s.zustand === 'fest' ? 0 : 1);
    ctx.fillStyle = '#3c6b2f'; ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI * 2); ctx.fill();
  }
  if(fig.fehlschuss && !fig.tot){
    const f = fig.fehlschuss, t = f.t <= 5 ? f.t / 5 : (10 - f.t) / 5, l = 160 * t;
    lianeZeichnen(fx_, fy_, fx_ + f.x * l, fy_ + f.y * l, 1);
  }
}
function lianeZeichnen(x0, y0, x1, y1, locker){
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + locker * 18;   // im Flug noch etwas durchhängend
  ctx.strokeStyle = '#2f5a24'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke();
  ctx.strokeStyle = '#6fb04f'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke();
}
