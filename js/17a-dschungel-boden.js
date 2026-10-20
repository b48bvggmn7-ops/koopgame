// 17a-dschungel-boden.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Boden-Dekor im Dschungel (boden-dekor-paket): Dickicht, feines Gras, Grasbüschel, Farnbusch, Blumen, Pilze ----------
// Übernommen aus der Vorschau (boden-dekor-paket/referenz/boden-dekor.js): Mengen, Wahrscheinlichkeiten, Formen und Farben
// wie dort, je 40-px-Kästchen einer Oberseite (Boden und Wand, keine Scheinwand). Ersetzt im Dschungel (jede Auswahl mit
// neuem Hintergrund-Stil, BG_STIL) die alten Pflanzen/Moos aus 17-deko.js; andere Welten unverändert.
// Reihenfolge (Abschnitt 2 des Auftrags): 1. große Pflanzen (Farnbusch, Blumen, Pilze; nachts Leuchtpflanzen, 11b) mit
// 60 px Abstand untereinander und 45 px vom Rand der Fläche, 2. Gras und Dickicht in den Lücken, 3. zuletzt die Tiere
// (20-tiere.js: nur auf freie Stellen, ±34 px von großen Pflanzen weg). Um alle Spielobjekte bleibt eine Freihalte-Zone.
// Zeichnen: Dickicht HINTER dem Boden (schaut an den Kanten heraus), Gras/Büschel/Pilze als einmal vorgezeichnete Stücke
// vor dem Boden, Farnbusch und Blumen pro Bild mit Wind. Nachts dieselben Formen, eingefärbt wie der Hintergrund.
const DJB_STUECK = 800;          // Breite der vorgezeichneten Stücke (px)
const DJB_DICKICHT_N = 3, DJB_DICKICHT_P = 0.8;   // je Kästchen 3 Chancen zu 80 %
const DJB_BUESCHEL_P = 0.7, DJB_FARN_P = 0.07, DJB_BLUME_P = 0.1, DJB_PILZ_P = 0.06;
const DJB_FREI_X = 60, DJB_FREI_Y = 90;   // Freihalte-Zone um Spielobjekte (links/rechts, senkrecht)
const DJB_GROSS_ABSTAND = 60;    // zwischen zwei großen Pflanzen
const DJB_RAND = 45;             // große Pflanzen nicht so nah an die Kante der Fläche
const DJB_START = 260;           // um die Startpositionen frei
const DJB_BLUMEN = ['236,70,60', '255,160,50', '240,110,190'];

let djbFor = null, djbNachtFuer = null;
const DJB = {zellen: [], laeufe: [], stuecke: [], gross: [], agaves: [], flowers: []};

// gilt bei jeder Dschungel-Auswahl mit neuem Hintergrund-Stil (Tag, Nacht, Morgen, Abend)
function hgBodenDekor(){ return !!BG_STIL; }

// Freihalte-Zone (Vorschau: SPN): Hebel, Stacheln, Türen, Sprungpilze, Druckplatten, Haken, Checkpoints, Ziel
function djbFreihalten(){
  const L = [];
  for(const sp of spikes){ const w = sp.w || 40, h = sp.h || 40; L.push([sp.x, sp.y + h/2], [sp.x + w, sp.y + h/2]); }
  for(const sw of switchDefs) L.push([sw.x, sw.y]);
  for(const s of solids) if(s.type === 'door') for(let x = s.x; x <= s.x + s.w; x += 40) L.push([x, s.y + Math.min(s.h, 40)/2]);
  for(const b of bouncers) L.push([b.x, b.y]);
  for(const pl of plates) L.push([pl.x, pl.y]);
  for(const h of hooks) L.push([h.x, h.y]);
  for(const cp of checkpointDefs) L.push([cp.x, cp.y - 20]);
  if(goal) L.push([goal.x, goal.y - 20]);
  return (x, y, m) => L.some(([px, py]) => Math.abs(px - x) < (m || DJB_FREI_X) && Math.abs(py - y) < DJB_FREI_Y);
}
// Prüfer für alles Dekor und alle Tiere: Freihalte-Zone + bisherige Sperre (Münzen …, 17-deko.js) + Start
function djbPruefer(){
  const frei = djbFreihalten(), sperre = dekoSperre();
  const starts = [levelStartM, levelStartF].filter(Boolean);
  return (x, y, m) => frei(x, y, m) || sperre(x, y) || starts.some(s => Math.abs(x - s.x) < DJB_START && Math.abs(y - s.y) < 200);
}

function djbBauen(){
  djbFor = solids; djbNachtFuer = null;
  DJB.zellen = []; DJB.laeufe = []; DJB.stuecke = []; DJB.gross = []; DJB.agaves = []; DJB.flowers = [];
  djAufbauen();
  const gesperrt = djbPruefer();
  // Oberseiten-Kästchen (Boden und Wand; oben frei, nicht unter einer Scheinwand)
  const zellen = [];
  for(const s of solids){
    if(s.type !== 'ground' && s.type !== 'wall') continue;
    if(s.y < 40) continue;
    for(let cx = s.x; cx < s.x + s.w; cx += 40) if(!decoSolidAt(cx + 20, s.y - 2)) zellen.push({x: cx, y: s.y});
  }
  zellen.sort((a, b) => a.y - b.y || a.x - b.x);
  // zusammenhängende Oberseiten gleicher Höhe = eine Fläche (für den Rand-Abstand)
  let lauf = null;
  for(const z of zellen){
    if(!lauf || lauf.y !== z.y || z.x !== lauf.x1){ lauf = {x0: z.x, x1: z.x + 40, y: z.y}; DJB.laeufe.push(lauf); }
    else lauf.x1 = z.x + 40;
    z.lauf = lauf;
  }
  DJB.zellen = zellen;
  // Vorschläge je Kästchen in der Reihenfolge der Vorschau (gleiche Zufallszahlen-Folge je Kästchen)
  const POOL = DJ.POOL;
  for(const z of zellen){
    const r = rnd(Math.floor(decoHash(z.x, z.y)*4294967296)), xa = z.x, y = z.y;
    z.fine = []; z.tufts = []; z.thick = []; z.agave = null; z.flower = null; z.mush = null;
    for(let x = xa + 3; x < xa + 40; x += 7 + r()*6){
      const n = 4 + Math.floor(r()*3), bl = [];
      for(let i = 0; i < n; i++) bl.push({dx: (i - (n - 1)/2)*1.1, a: (i - (n - 1)/2)*0.3 + (r() - 0.5)*0.3, hf: 0.5 + r()*0.55});
      z.fine.push({x, y: y + 1, h: 5 + r()*8, ph: r()*6.28, bl, fine: 1});
    }
    if(r() < DJB_BUESCHEL_P){
      const n = 3 + Math.floor(r()*3), bl = [];
      for(let i = 0; i < n; i++) bl.push({dx: (i - (n - 1)/2)*1.7, a: (i - (n - 1)/2)*0.26 + (r() - 0.5)*0.25, hf: 0.55 + r()*0.5});
      z.tufts.push({x: xa + r()*40, y: y + 1, h: 7 + r()*9, ph: r()*6.28, bl});
    }
    if(r() < DJB_FARN_P) z.agave = {x: xa + 20, y, s: (0.8 + r()*0.5)*0.55, ph: r()*6};
    if(r() < DJB_BLUME_P) z.flower = {x: xa + r()*40, y: y + 3, h: (22 + r()*24)*0.75, ph: r()*6, c: Math.floor(r()*3)};
    if(r() < DJB_PILZ_P) z.mush = {x: xa + 10 + r()*20, y: y + 1, s: 0.7 + r()*0.4};
    for(let i = 0; i < DJB_DICKICHT_N; i++) if(r() < DJB_DICKICHT_P) z.thick.push({x: xa + r()*40, y: y + 10, s: POOL[Math.floor(r()*POOL.length)], ph: r()*6.28, k: 1, rot: (r() - 0.5)*0.3, amp: 0.075});
  }
  // 1. große Pflanzen (Farnbusch, Blume, Pilz): Freihalte-Zone, 45 px vom Rand der Fläche, 60 px untereinander
  const grossFrei = (x, y) => !DJB.gross.some(g2 => Math.abs(g2.x - x) < DJB_GROSS_ABSTAND && Math.abs(g2.y - y) < DJB_GROSS_ABSTAND);
  const amRand = (z, x) => x < z.lauf.x0 + DJB_RAND || x > z.lauf.x1 - DJB_RAND;
  for(const z of zellen){
    for(const [art, p] of [['agave', z.agave], ['flower', z.flower], ['mush', z.mush]]){
      if(!p) continue;
      if(gesperrt(p.x, z.y) || amRand(z, p.x) || !grossFrei(p.x, z.y)){ z[art] = null; continue; }
      DJB.gross.push({x: p.x, y: z.y, art});
      if(art === 'agave') DJB.agaves.push(p);
      if(art === 'flower') DJB.flowers.push(p);
    }
  }
  // 2. Gras und Dickicht in den Lücken (nichts in der Freihalte-Zone; Dickicht so weit weg, dass es nicht hineinwächst)
  for(const z of zellen){
    z.fine = z.fine.filter(f => !gesperrt(f.x, z.y));
    z.tufts = z.tufts.filter(f => !gesperrt(f.x, z.y));
    z.thick = z.thick.filter(b => !gesperrt(b.x, z.y, DJB_FREI_X + b.s.w*0.35));
  }
  // vorgezeichnete Stücke: je Fläche höchstens DJB_STUECK breit
  for(const l of DJB.laeufe){
    for(let x0 = l.x0; x0 < l.x1; x0 += DJB_STUECK){
      const x1 = Math.min(l.x1, x0 + DJB_STUECK);
      DJB.stuecke.push({x0, x1, y: l.y, zellen: zellen.filter(z => z.y === l.y && z.x >= x0 && z.x < x1), vorne: {}, hinten: {}});
    }
  }
}
function djbHolen(){ if(djbFor !== solids) djbBauen(); return DJB; }
// große Pflanzen (für die Tiere und die Leuchtpflanzen): [{x, y, art}]
function djbGrossePflanzen(){ return hgBodenDekor() ? djbHolen().gross : []; }
// Fläche (Lauf) an dieser Stelle – für den Rand-Abstand der Leuchtpflanzen
function djbLaufAn(x, y){ return djbHolen().laeufe.find(l => l.y === y && x >= l.x0 && x < l.x1) || null; }

// ---------- Farben (nachts eingefärbt wie der Hintergrund, djNachtFarbe aus 11b) ----------
const djbFarbCache = {};
function djbFarbe(c, nacht){
  if(!nacht) return c;
  const key = c;
  if(djbFarbCache[key]) return djbFarbCache[key];
  let out = c;
  if(c[0] === '#') out = djNachtFarbe(c);
  else { const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    if(m){ const hx = djHex(djNachtFarbe(djToHex([+m[1], +m[2], +m[3]]))); out = 'rgba(' + hx.join(',') + ',' + (m[4] ?? 1) + ')'; } }
  return djbFarbCache[key] = out;
}

// ---------- Zeichnen der Pflanzen (Vorschau: tuftA, drawAgave, drawFlower, mush) ----------
function djbBueschel(q, f, sw, nacht){   // Grasbüschel „A“ (feines Gras schmaler)
  const k = f.fine ? 0.6 : 1, c1 = djbFarbe('rgba(40,168,92,.5)', nacht), c2 = djbFarbe('rgba(118,232,160,.55)', nacht);
  q.lineCap = 'round';
  for(const b of f.bl){
    const h = f.h*b.hf, lean = b.a*h*0.9 + sw*b.hf*b.hf, bx = f.x + b.dx;
    q.strokeStyle = c1; q.lineWidth = 3.2*k; q.beginPath(); q.moveTo(bx, f.y); q.quadraticCurveTo(bx + lean*0.3, f.y - h*0.6, bx + lean, f.y - h); q.stroke();
    q.strokeStyle = c2; q.lineWidth = 1.3*k; q.beginPath(); q.moveTo(bx + 0.4, f.y); q.quadraticCurveTo(bx + lean*0.3 + 0.4, f.y - h*0.6, bx + lean, f.y - h); q.stroke();
  }
}
function djbPilz(q, p, nacht){
  const x = p.x, y = p.y, s = p.s;
  q.fillStyle = djbFarbe('#f0e6cc', nacht); q.beginPath(); q.roundRect(x - 2.4*s, y - 12*s, 4.8*s, 12*s, 2); q.fill();
  q.fillStyle = djbFarbe('#de4038', nacht); q.beginPath(); q.moveTo(x - 9*s, y - 11*s); q.quadraticCurveTo(x, y - 27*s, x + 9*s, y - 11*s); q.quadraticCurveTo(x, y - 8*s, x - 9*s, y - 11*s); q.fill();
  q.fillStyle = djbFarbe('rgba(255,252,240,.95)', nacht);
  for(const d of [[-4, -15, 1.7], [2, -19, 1.4], [5, -14, 1.5]]){ q.beginPath(); q.arc(x + d[0]*s, y + d[1]*s, d[2]*s, 0, 7); q.fill(); }
  q.strokeStyle = 'rgba(26,18,12,.6)'; q.lineWidth = 1; q.beginPath(); q.moveTo(x - 9*s, y - 11*s); q.quadraticCurveTo(x, y - 27*s, x + 9*s, y - 11*s); q.stroke();
}
function djbFarnbusch(q, a, t, wind, nacht){   // Farnbusch (Vorschau: drawAgave)
  const sw = (wind ? djWind(a.x, t)*0.07 + Math.sin(t*1.2 + a.ph)*0.02 : 0);
  const cS = djbFarbe('#1c6a38', nacht), cA = djbFarbe('#2d8a48', nacht), cB = djbFarbe('#3da05a', nacht);
  q.lineCap = 'round';
  for(let k = 0; k < 7; k++){
    const m = k - 3, ang = -Math.PI/2 + m*0.38 + sw*(1 + Math.abs(m)*0.2), L = (54 + (3 - Math.abs(m))*10)*a.s,
          ex = a.x + Math.cos(ang)*L*0.9, ey = a.y + Math.sin(ang)*L*0.9 + L*0.12;
    q.strokeStyle = cS; q.lineWidth = 2; q.beginPath(); q.moveTo(a.x, a.y); q.quadraticCurveTo(a.x + Math.cos(ang)*L*0.6, a.y + Math.sin(ang)*L*0.7, ex, ey); q.stroke();
    for(let j = 1; j <= 9; j++){
      const u = j/10, bx = a.x*(1 - u)*(1 - u) + 2*u*(1 - u)*(a.x + Math.cos(ang)*L*0.6) + u*u*ex,
            by = a.y*(1 - u)*(1 - u) + 2*u*(1 - u)*(a.y + Math.sin(ang)*L*0.7) + u*u*ey, ll = L*0.3*Math.sin(Math.PI*(u*0.8 + 0.1));
      q.strokeStyle = j % 2 ? cA : cB; q.lineWidth = 2.4*a.s + 0.6; q.beginPath();
      q.moveTo(bx, by); q.lineTo(bx - Math.sin(ang)*ll + Math.cos(ang)*ll*0.5, by + Math.cos(ang)*ll + Math.sin(ang)*ll*0.5);
      q.moveTo(bx, by); q.lineTo(bx + Math.sin(ang)*ll + Math.cos(ang)*ll*0.5, by - Math.cos(ang)*ll + Math.sin(ang)*ll*0.5); q.stroke();
    }
  }
}
function djbBlume(q, f, t, wind, nacht){   // Blume (Vorschau: drawFlower)
  const sw = wind ? djWind(f.x, t)*8*(f.h/40) + Math.sin(t*1.7 + f.ph)*1.5 : 0, hx = f.x + sw, hy = f.y - f.h;
  q.strokeStyle = djbFarbe('#1f7a3c', nacht); q.lineWidth = 2.2; q.lineCap = 'round';
  q.beginPath(); q.moveTo(f.x, f.y); q.quadraticCurveTo(f.x + sw*0.2 + 3, f.y - f.h*0.55, hx, hy); q.stroke();
  const blatt = djbFarbe('rgba(' + DJB_BLUMEN[f.c] + ',.97)', nacht), mitte = djbFarbe('#ffe27a', nacht);
  for(let k = 0; k < 3; k++){
    const a = -1.1 + k*1.1 + (wind ? Math.sin(t*1.3 + f.ph)*0.08 : 0);
    q.save(); q.translate(hx, hy); q.rotate(a);
    q.fillStyle = blatt; q.beginPath(); q.moveTo(0, 0); q.quadraticCurveTo(4, -6, 2, -12); q.quadraticCurveTo(-4, -6, 0, 0); q.fill();
    q.fillStyle = mitte; q.beginPath(); q.arc(1, -12, 1.6, 0, 7); q.fill(); q.restore();
  }
}

// ---------- vorgezeichnete Stücke ----------
// vorne: feines Gras, Grasbüschel und Pilze (still); hinten: Dickicht in Ruhelage (wenn das Wiegen aus ist)
function djbStueckBild(st, art, nacht, still){   // still: Farnbüsche und Blumen gleich mit vorzeichnen (ohne Wind)
  const cache = st[art], key = (nacht ? 'n' : 't') + (still ? 's' : '');
  if(cache[key]) return cache[key];
  const vorne = art === 'vorne', x0 = st.x0 - (vorne ? (still ? 80 : 30) : 140), x1 = st.x1 + (vorne ? (still ? 80 : 30) : 140);
  const y0 = st.y - (vorne ? (still ? 90 : 45) : 170), y1 = st.y + (vorne ? 8 : 40);
  const sc = vorne ? zoom*Math.min(Math.max(RS, 1), 2) : zoom;
  const c = document.createElement('canvas'); c.width = Math.ceil((x1 - x0)*sc); c.height = Math.ceil((y1 - y0)*sc);
  const q = c.getContext('2d'); q.setTransform(sc, 0, 0, sc, -x0*sc, -y0*sc);
  if(vorne){
    for(const z of st.zellen) if(z.mush) djbPilz(q, z.mush, nacht);
    for(const z of st.zellen) for(const f of z.fine) djbBueschel(q, f, 0, nacht);
    for(const z of st.zellen) for(const f of z.tufts) djbBueschel(q, f, 0, nacht);
    if(still){ for(const z of st.zellen) if(z.agave) djbFarnbusch(q, z.agave, 0, false, nacht);
               for(const z of st.zellen) if(z.flower) djbBlume(q, z.flower, 0, false, nacht); }
  } else {
    for(const z of st.zellen) for(const b of z.thick){
      const s = nacht ? djbNachtDickicht(b.s) : b.s;
      q.save(); q.translate(b.x, b.y); q.rotate(b.rot); q.drawImage(s.c, -s.sx, -s.sy, s.w, s.h); q.restore();
    }
  }
  return cache[key] = {c, x0, y0, w: x1 - x0, h: y1 - y0, sc};
}
// vorgezeichnetes Stück setzen: passt seine Auflösung genau zum Bild, 1:1 auf ganze Bildpunkte (ohne Grafikkarte viel billiger)
function djbSetzen(B){
  const m = ctx.getTransform(), k = m.a/B.sc;
  if(Math.abs(k - 1) > 0.01 || m.b || m.c){ ctx.drawImage(B.c, B.x0 - camX, B.y0, B.w, B.h); return; }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(B.c, Math.round(m.a*(B.x0 - camX) + m.e), Math.round(m.d*B.y0 + m.f)); ctx.restore();
}
function djbNachtDickicht(s){ return s._nacht || (s._nacht = djNachtTönen(s, 640, false)); }
function djbSichtbar(st, rand){ return st.x1 + rand > camX && st.x0 - rand < camX + VW; }

// Dickicht – HINTER dem Boden (12-welt-zeichnen.js vor materialZeichnen): schaut an den Kanten heraus.
// Mit Dickicht-Wiegen jedes Blatt einzeln leicht gedreht, sonst das vorgezeichnete Stück.
function djbDickichtZeichnen(){
  if(!hgBodenDekor()) return;
  const D = djbHolen(), nacht = hgNacht(), t = performance.now()/1000;
  const wiegen = djAn(djSchalter.dickicht) && djAn(djSchalter.wind);
  for(const st of D.stuecke){
    if(!djbSichtbar(st, 150)) continue;
    if(!wiegen){ djbSetzen(djbStueckBild(st, 'hinten', nacht)); continue; }
    for(const z of st.zellen) for(const b of z.thick){
      if(b.x < camX - 80 || b.x > camX + VW + 80) continue;
      const s = nacht ? djbNachtDickicht(b.s) : b.s, a = b.rot + (djWind(b.x, t)*b.amp + Math.sin(t*0.9 + b.ph)*0.008);
      ctx.save(); ctx.translate(b.x - camX, b.y); ctx.rotate(a); ctx.drawImage(s.c, -s.sx, -s.sy, s.w, s.h); ctx.restore();
    }
  }
}
// Gras, Büschel, Pilze (vorgezeichnet), Farnbüsche und Blumen (mit Wind) – statt der alten Pflanzen (17-deko.js)
function djbVorneZeichnen(){
  const D = djbHolen(), nacht = hgNacht(), t = performance.now()/1000, wind = djAn(djSchalter.wind);
  for(const st of D.stuecke){
    if(!djbSichtbar(st, 40)) continue;
    djbSetzen(djbStueckBild(st, 'vorne', nacht, !wind));
  }
  if(!wind) return;   // ohne Wind sind Farnbüsche und Blumen im vorgezeichneten Stück
  ctx.save(); ctx.translate(-camX, 0);
  for(const a of D.agaves) if(a.x > camX - 80 && a.x < camX + VW + 80) djbFarnbusch(ctx, a, t, wind, nacht);
  for(const f of D.flowers) if(f.x > camX - 40 && f.x < camX + VW + 40) djbBlume(ctx, f, t, wind, nacht);
  ctx.restore();
}
