// 04b-haften.js – Spielwiese Teil 4: von unten halten und rollen.
// A Unterseiten-Haften (an Haftflächen '=' von unten festhalten, entlang wie ein Rail) · B Rollen (Kugel folgt Flächen,
// klebt an Haftflächen auch um innere und äußere Ecken, Rampen geben Schwung) · C Haften überall (jede Decke klebt).
// Außerdem: Rampen '/' und '\' (nur die schräge Fläche zählt) für die normale Figur.

const KUGEL_R = 15;   // Radius der Kugel (Figur ist 28,5 × 32,3)
const istRampe = z => z === RAMPE_HOCH_RECHTS || z === RAMPE_HOCH_LINKS;

// ---------- Rampen für die normale Figur ----------
// Höhe der schrägen Fläche an Stelle x in Kästchen (c, r); null = keine Rampe
function rampeOberkante(c, r, x){
  const z = zelle(c, r), x0 = c * K;
  if(z === RAMPE_HOCH_RECHTS) return (r + 1) * K - (x - x0);
  if(z === RAMPE_HOCH_LINKS) return r * K + (x - x0);
  return null;
}
// nach dem Bewegen: Füße auf die Rampe setzen (auch bergab „kleben“, wenn man gerade darauf stand)
function rampeAufsetzen(f, warBoden){
  const fx = f.x + FIG_B / 2, fuss = f.y + FIG_H, c = Math.floor(fx / K);
  for(const r of [Math.floor((fuss - 1) / K), Math.floor((fuss - 1) / K) + 1]){
    const h = rampeOberkante(c, r, fx); if(h === null) continue;
    const fang = warBoden ? 14 : 0.5;
    if(f.vy >= 0 && fuss >= h - fang && fuss <= h + K * 0.75){ f.y = h - FIG_H; f.vy = 0; return true; }
  }
  return false;
}

// ---------- A / C: an der Decke hängen ----------
function deckeKlebt(c, r){
  const z = zelle(c, r);
  return MECHANIKEN.haft.aktiv === 2 ? (z === '#' || z === '=') : z === '=';
}
function deckeUeberKopf(f){   // Reihe der klebrigen Decke direkt über dem Kopf (Kopfmitte), sonst -1
  const r = Math.floor((f.y - 1) / K), c = Math.floor((f.x + FIG_B / 2) / K);
  return Math.abs(f.y - (r + 1) * K) < 2.5 && deckeKlebt(c, r) ? r : -1;
}
function haengenStarten(r){
  fig.haengt = {r}; fig.y = (r + 1) * K; fig.vy = 0; fig.sprungAktiv = false; fig.gleit = 0;
  dashAufladen(); dehnen(fig, 1.22, 0.8); staubWolke(fig.x + FIG_B / 2, fig.y, 4, 0); ton('kleben');
}
function haengenSchritt(E, rx){
  const h = fig.haengt;
  const halten = V.haftAuto || gehalten('greifen');
  if(!halten || gehalten('runter')){ fig.haengt = null; return false; }   // loslassen / S = fallen lassen
  if(fig.puffer > 0){   // Absprung nach unten-vorn
    fig.haengt = null; fig.puffer = 0;
    fig.vy = V.haftAbsprungY; fig.vx += rx * V.haftAbsprungX;
    dehnen(fig, 0.8, 1.2); ton('sprung'); return false;
  }
  fig.vx += (rx * V.haftTempo - fig.vx) * V.haftBeschl;
  const altX = fig.x;
  fig.x += fig.vx; if(kollisionX(fig, fig.vx)) fig.vx = 0;
  fig.y = (h.r + 1) * K; fig.vy = 0;
  if(deckeUeberKopf(fig) !== h.r){   // Ende der Haftfläche
    if(V.haftKante){ fig.x = altX; fig.vx = 0; }
    else { fig.haengt = null; return true; }
  }
  if(Math.abs(fig.vx) > 1 && schrittZaehler % 5 === 0 && V.fxStaub) staubWolke(fig.x + FIG_B / 2, fig.y + 2, 1, -Math.sign(fig.vx));
  fig.amBoden = false; fig.wand = 0;
  return true;
}

// ---------- B: Rollen (Kugel folgt Flächen) ----------
// nächster Punkt auf einem Vieleck (Punkte im Uhrzeigersinn egal); innen = Punkt liegt im Vieleck
function vieleckNaechster(px, py, pts){
  let best = null, innen = false;
  for(let i = 0, j = pts.length - 1; i < pts.length; j = i++){
    const [ax, ay] = pts[j], [bx, by] = pts[i];
    const ex = bx - ax, ey = by - ay, l2 = ex * ex + ey * ey;
    const t = klemmen(((px - ax) * ex + (py - ay) * ey) / l2, 0, 1), qx = ax + ex * t, qy = ay + ey * t;
    const d = Math.hypot(px - qx, py - qy);
    if(!best || d < best.d) best = {qx, qy, d};
    if(((ay > py) !== (by > py)) && px < ax + (py - ay) * ex / ey) innen = !innen;
  }
  best.innen = innen;
  return best;
}
function kastenForm(c, r){
  const z = zelle(c, r), x = c * K, y = r * K;
  if(z === '#' || z === '=' || z === 'x') return [[x, y], [x + K, y], [x + K, y + K], [x, y + K]];
  if(z === RAMPE_HOCH_RECHTS) return [[x, y + K], [x + K, y], [x + K, y + K]];
  if(z === RAMPE_HOCH_LINKS) return [[x, y], [x + K, y + K], [x, y + K]];
  return null;
}
// alle Flächen nahe (cx, cy): {nx, ny, d, qx, qy, klebt}
function kugelKontakte(cx, cy, weite){
  const out = [];
  const c0 = Math.floor((cx - weite) / K), c1 = Math.floor((cx + weite) / K), r0 = Math.floor((cy - weite) / K), r1 = Math.floor((cy + weite) / K);
  for(let r = r0; r <= r1; r++) for(let c = c0; c <= c1; c++){
    const form = kastenForm(c, r); if(!form) continue;
    const q = vieleckNaechster(cx, cy, form);
    let nx, ny, d;
    if(q.innen){ d = -q.d; nx = q.qx - cx; ny = q.qy - cy; }
    else { d = q.d; nx = cx - q.qx; ny = cy - q.qy; }
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    if(d > weite) continue;
    out.push({nx, ny, d, qx: q.qx, qy: q.qy, klebt: zelle(c, r) === '='});
  }
  return out;
}
function kugelHerausschieben(b, stoesse){
  for(let k = 0; k < 4; k++){
    let bewegt = false;
    for(const t of kugelKontakte(b.cx, b.cy, KUGEL_R + 1)){
      if(t.d < KUGEL_R - 0.01){
        b.cx += t.nx * (KUGEL_R - t.d); b.cy += t.ny * (KUGEL_R - t.d); bewegt = true;
        const vn = b.vx * t.nx + b.vy * t.ny; if(vn < 0){ b.vx -= t.nx * vn; b.vy -= t.ny * vn; if(stoesse) stoesse.push({t, vn}); }
      }
    }
    if(!bewegt) break;
  }
}
// Fläche zum Entlangrollen wählen: Haftflächen immer, normale Flächen nur, wenn sie nach oben zeigen (Boden, Rampe)
function kugelAuflage(b, fang){
  // Idee 4 (rollUmlenken): normale Wände zählen auch – aber nur, solange man an ihnen hinauf rollt (Halfpipe)
  const ks = kugelKontakte(b.cx, b.cy, KUGEL_R + fang).filter(t => t.klebt || t.ny < -0.45 || (V.rollUmlenken && t.ny < 0.45 && !b.wandAb));
  if(!ks.length) return null;
  if(b.eckeN){   // nach einem Eckstoß: die gestoßene Fläche ist die neue Auflage
    ks.sort((p, q) => (q.nx * b.eckeN.nx + q.ny * b.eckeN.ny) - (p.nx * b.eckeN.nx + p.ny * b.eckeN.ny));
    return ks[0];
  }
  const dir = b.an ? {x: -b.an.ny * Math.sign(b.rollV || 1), y: b.an.nx * Math.sign(b.rollV || 1)} : {x: b.vx, y: b.vy};
  ks.sort((p, q) => (Math.abs(p.d - q.d) < 1.5 ? (p.nx * dir.x + p.ny * dir.y) - (q.nx * dir.x + q.ny * dir.y) : p.d - q.d));
  const t = ks[0];
  if(!t.klebt && t.d > KUGEL_R + 2) return null;   // normale Flächen fangen nicht (sonst klebt man an Kanten)
  return t;
}
function rollenStarten(){
  fig.ball = {cx: fig.x + FIG_B / 2, cy: fig.y + FIG_H / 2, vx: fig.vx, vy: fig.vy, an: null, rollV: 0, los: 0, taste: 0, sinn: 1};
  fig.haengt = null; dehnen(fig, 0.85, 0.85); ton('rollen');
}
function rollenBeenden(){
  const b = fig.ball;
  const x = b.cx - FIG_B / 2, y = b.cy - FIG_H / 2;
  if(!frei(x, y)) return false;   // zu eng zum Aufstehen: weiterrollen
  fig.ball = null; fig.x = x; fig.y = y; fig.vx = b.vx; fig.vy = b.vy; fig.rollWinkel = 0;
  dehnen(fig, 0.85, 1.15); return true;
}
function rollenSchritt(E, rxWert){
  const b = fig.ball, rx = Math.sign(rxWert);
  // Jetzt-Richtung der Fläche (Tangente +t: die Fläche liegt rechts von der Laufrichtung)
  if(b.los > 0) b.los--;
  if(b.wandAb > 0) b.wandAb--;
  let auf = b.los > 0 ? null : kugelAuflage(b, V.rollFang);
  const g = V.schwerkraft * V.rollSchwer;
  if(auf){
    const tx = -auf.ny, ty = auf.nx;
    if(!b.an && b.eckeN){ b.eckeN = null; }   // an der inneren Ecke: rollV bleibt (Schwung läuft um die Ecke)
    else if(!b.an){ b.rollV = b.vx * tx + b.vy * ty; if(auf.klebt){ dashAufladen(); ton('kleben'); } }
    b.an = auf;
    // Eingabe: „dieselbe Taste weiter drücken = weiter in diese Richtung“, auch um Ecken herum
    if(rx){
      if(rx !== b.taste){ b.taste = rx; b.sinn = Math.abs(tx) > 0.3 ? Math.sign(rx * tx) : (Math.sign(b.rollV) || 1); }
      const ziel = b.sinn;
      if(Math.sign(b.rollV) !== ziel || Math.abs(b.rollV) < V.rollMax) b.rollV += ziel * V.rollBeschl;
    } else b.taste = 0;
    b.rollV += g * ty * (auf.klebt ? V.rollKlebSchwer : 1);   // Schwerkraft entlang der Fläche (Rampen, Wände)
    // normale Wand (Idee 4): wer nicht mehr hinauf rollt, fällt ab (keine Klebe-Wand)
    if(!auf.klebt && auf.ny > -0.45 && ty * Math.sign(b.rollV || 1) >= 0){
      b.wandAb = 12; b.an = null; b.vx = tx * b.rollV; b.vy = ty * b.rollV; auf = null;
    } else {
      b.rollV *= V.rollReibung;
      if(fig.puffer > 0){   // Absprung weg von der Fläche
        fig.puffer = 0; b.los = 8; b.an = null;
        b.vx = tx * b.rollV + auf.nx * V.rollSprung; b.vy = ty * b.rollV + auf.ny * V.rollSprung;
        dehnen(fig, 0.8, 1.2); ton('sprung');
      } else {
        b.vx = tx * b.rollV; b.vy = ty * b.rollV;
        // an die Fläche andrücken (bleibt kleben)
        b.cx = auf.qx + auf.nx * KUGEL_R; b.cy = auf.qy + auf.ny * KUGEL_R;
      }
    }
  }
  if(!auf){
    b.an = null; b.vy = Math.min(b.vy + g, V.maxFall); b.vx *= 0.995;
    if(rx) b.vx += rx * V.luftBeschl * 0.6;
  }
  // bewegen in Teilschritten
  const n = Math.max(1, Math.ceil(Math.hypot(b.vx, b.vy) / 5)), stoesse = [], rollVor = b.rollV;
  for(let i = 0; i < n; i++){ b.cx += b.vx / n; b.cy += b.vy / n; kugelHerausschieben(b, stoesse); }
  if(b.an){   // nach dem Bewegen: Tempo entlang der Fläche aus der echten Bewegung
    const tx = -b.an.ny, ty = b.an.nx; b.rollV = b.vx * tx + b.vy * ty;
    // innere Ecke: gegen eine Haftfläche gerollt -> Schwung bleibt und läuft im nächsten Schritt an ihr weiter
    const ecke = stoesse.find(s => (s.t.klebt || s.t.ny < -0.45 || (V.rollUmlenken && s.t.ny < 0.45)) && (s.t.nx * tx + s.t.ny * ty) * Math.sign(rollVor) < -0.5);
    if(ecke){ b.rollV = rollVor; b.an = null; b.eckeN = ecke.t; }
    else if(stoesse.length && Math.abs(rollVor) > 6){ wackeln(0.08); ton('bonk'); }
  }
  fig.rollWinkel = (fig.rollWinkel || 0) + (b.an ? b.rollV : b.vx * 0.6) / KUGEL_R;
  fig.x = b.cx - FIG_B / 2; fig.y = b.cy - FIG_H / 2; fig.vx = b.vx; fig.vy = b.vy;
  fig.amBoden = false; fig.wand = 0;
  if(Math.abs(b.rollV) > 6 && b.an && V.fxStaub && schrittZaehler % 3 === 0) staubWolke(b.an.qx, b.an.qy, 1, 0);
}

// ---------- Weiche: übernimmt Haften/Rollen diesen Schritt? (true = Bewegung erledigt) ----------
function haftSchritt(E, rx){
  const v = MECHANIKEN.haft.aktiv;
  if(v === 1){
    fig.haengt = null;
    const willRollen = V.rollUmschalten ? (E.greifen ? !fig.ball : !!fig.ball) : gehalten('greifen');
    if(willRollen && !fig.ball) rollenStarten();
    if(!willRollen && fig.ball && rollenBeenden()) return false;
    if(fig.ball){ rollenSchritt(E, rx); return true; }
    return false;
  }
  if(fig.ball) rollenBeenden();
  if(fig.haengt) return haengenSchritt(E, rx);
  if(!fig.amBoden && fig.vy <= 2 && (V.haftAuto || gehalten('greifen'))){
    const r = deckeUeberKopf(fig);
    if(r >= 0){ haengenStarten(r); return haengenSchritt(E, rx); }
  }
  return false;
}

// ---------- Zeichnen: Rampen und Haftflächen ----------
function rampeZeichnen(c, r, z){
  const x = c * K, y = r * K;
  ctx.fillStyle = FARBE.erde; ctx.beginPath();
  if(z === RAMPE_HOCH_RECHTS){ ctx.moveTo(x, y + K); ctx.lineTo(x + K, y); ctx.lineTo(x + K, y + K); }
  else { ctx.moveTo(x, y); ctx.lineTo(x + K, y + K); ctx.lineTo(x, y + K); }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = FARBE.gras; ctx.lineWidth = 7; ctx.beginPath();
  if(z === RAMPE_HOCH_RECHTS){ ctx.moveTo(x, y + K); ctx.lineTo(x + K, y); } else { ctx.moveTo(x, y); ctx.lineTo(x + K, y + K); }
  ctx.stroke();
}
function haftflaecheZeichnen(c, r){   // lila Haftschicht an allen freien Seiten
  const x = c * K, y = r * K;
  ctx.fillStyle = '#8f4fd6';
  if(!fest(c, r + 1)) ctx.fillRect(x, y + K - 7, K, 7);
  if(!fest(c, r - 1)) ctx.fillRect(x, y, K, 7);
  if(!fest(c - 1, r)) ctx.fillRect(x, y, 7, K);
  if(!fest(c + 1, r)) ctx.fillRect(x + K - 7, y, 7, K);
  ctx.fillStyle = '#c99bff';
  if(!fest(c, r + 1)) for(let i = 0; i < 3; i++) ctx.fillRect(x + 6 + i * 12, y + K - 3, 5, 3);   // Glanz-Tupfer unten
}
