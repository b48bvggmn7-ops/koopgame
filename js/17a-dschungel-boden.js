// 17a-dschungel-boden.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Boden-Dekor im Dschungel (boden-dekor-paket, Vorschau level1_dschungel.html) ----------
// Gilt für alle Dschungel-Auswahlen (BG_STIL.tiere, js/11b-dschungel-hintergrund.js) und ERSETZT dort das alte Boden-Dekor
// (17-deko.js: Pflanzen-Bildchen, Moos, Ranken). Andere Welten bleiben unverändert.
// Pro 40-px-Oberseite (echter Boden/Wand, nicht unter Scheinwänden): Dickicht (3 × 80 %), feines Gras (alle 7–13 px),
// Grasbüschel (70 %), Farnbusch (7 %), Blume (10 %), Pilz (6 %).
// Reihenfolge (fest): große Pflanzen zuerst (Farnbusch, Blumen, Pilze, nachts Leuchtpflanzen; 60 px Abstand, 45 px von
// der Kante), dann Gras + Dickicht in die Lücken, zuletzt die Tiere (20-tiere.js, ±34 px von großen Pflanzen).
// Rund um alle Spielobjekte (Hebel, Stacheln, Türen, Sprungpilze, Druckplatten, Haken, Checkpoints, Ziel …) bleibt eine
// Freihalte-Zone (60 px links/rechts, 90 px senkrecht, Vorschau: SPN) zusätzlich zu dekoSperre (17-deko.js).
// Leistung: Gras als Zeichenpfade je Stück (4 Kästchen), pro Bild nur Wind als Scherung; Dickicht-Blätter EINMAL als
// Bilder vorgezeichnet (nachts eingefärbt), pro Bild nur gedreht gesetzt. Ohne Wind (langsames Gerät) wiegt nichts.
const BODEN_DICKICHT_N = 3, BODEN_DICKICHT_P = 0.8, BODEN_DICKICHT_AMP = 0.075, BODEN_DICKICHT_TIEF = 10;
const BODEN_BUESCHEL_P = 0.7, BODEN_FARN_P = 0.07, BODEN_BLUME_P = 0.1, BODEN_PILZ_P = 0.06;
const BODEN_GROSS_ABSTAND = 60;   // große Pflanzen untereinander
const BODEN_GROSS_RAND = 45;      // große Pflanzen: Abstand zur Kante der Fläche
const BODEN_FREI_X = 60, BODEN_FREI_Y = 90;   // Freihalte-Zone um Spielobjekte
const BODEN_START_FREI = 260;     // um die Startpunkte: keine großen Pflanzen, keine Tiere
const BODEN_STUECK = 4;           // Kästchen je Gras-Stück (je Stück eine Wind-Scherung)
const BODEN_WIND_SCHERUNG = 0.4;  // Gras: so stark neigt der Wind die Halme

function bodenDekorAn(){ return typeof hgTierRegeln === 'function' && hgTierRegeln(); }

// Freihalte-Zone (Vorschau SPN): Punkte aller Spielobjekte; (x, y) = Stelle am Boden
function bodenFreihaltePunkte(){
  const L = [];
  for(const sp of spikes) L.push([sp.x + (sp.w || 40)/2, sp.y + (sp.h || 40)/2]);
  for(const sw of switchDefs) L.push([sw.x, sw.y]);
  for(const s of solids) if(s.type === 'door') L.push([s.x + s.w/2, s.y + s.h/2]);
  for(const cp of checkpointDefs) L.push([cp.x, cp.y - 20]);
  for(const b of bouncers) L.push([b.x, b.y - 20]);
  for(const h of hooks) L.push([h.x, h.y]);
  for(const pl of plates) L.push([pl.x, pl.y]);
  if(typeof teleporters !== 'undefined') for(const tp of teleporters) L.push([tp.x, tp.y]);
  if(typeof fallen !== 'undefined') for(const f of fallen) L.push([f.x, f.y]);
  // Floß-Rad (Nutzer: Pflanzen vor Rad und Seil vermischen sich mit dem Hintergrund): Rad und ein Stück daneben frei halten
  if(typeof flossRaeder !== 'undefined') for(const R of flossRaeder) for(const dx of [-40, 0, 40]) L.push([R.x + dx, R.y - 20]);
  if(goal) L.push([goal.x, goal.y - 20]);
  return L;
}
// Prüf-Funktion: (x, Oberkante) gesperrt? = dekoSperre (Münzen, Stacheln, Hebel …) ODER Freihalte-Zone
function bodenSperre(){
  const alt = dekoSperre(), P = bodenFreihaltePunkte();
  return (x, y) => alt(x, y) || P.some(([px, py]) => Math.abs(px - x) < BODEN_FREI_X && Math.abs(py - y) < BODEN_FREI_Y);
}
function bodenNahStart(x){
  return Math.abs(x - levelStartM.x) < BODEN_START_FREI || (levelStartF && Math.abs(x - levelStartF.x) < BODEN_START_FREI);
}

// ---------- Dickicht-Blätter (Vorschau: POOL = 14 Farnwedel + 8 Monstera) ----------
let bodenPool = null;
function bodenPoolHolen(nacht){
  if(!bodenPool){
    const r = rnd(4711), sg = () => r() < 0.5 ? -1 : 1, P = [];
    for(let i = 0; i < 14; i++) P.push(djFrondSprite(40 + r()*60, sg()*(10 + r()*26), '#1a6a34', r() < 0.5 ? '#82e45a' : '#5ccb52', 0.8, 10, 0.3));
    for(let i = 0; i < 8; i++) P.push(djMonsteraSprite(22 + r()*10, 16 + r()*14, sg()*8, '#1a6a34', '#3fa850', 0.6, i + 210));
    bodenPool = {tag: P, nacht: null};
  }
  if(nacht && !bodenPool.nacht) bodenPool.nacht = bodenPool.tag.map(s => djNachtTönen(s, DJ_BY, false));
  return nacht ? bodenPool.nacht : bodenPool.tag;
}

// ---------- Farben (nachts einmal eingefärbt wie der Rest, djNachtFarbe aus 11b) ----------
const BODEN_FARBEN_TAG = {grasDunkel: ['40,168,92', 0.5], grasHell: ['118,232,160', 0.55], farnStiel: '#1c6a38', farnA: '#2d8a48', farnB: '#3da05a',
  blumenStiel: '#1f7a3c', blumen: ['236,70,60', '255,160,50', '240,110,190'], blumenMitte: '#ffe27a',
  pilzStiel: '#f0e6cc', pilzHut: '#de4038', pilzPunkte: 'rgba(255,252,240,.95)', pilzRand: 'rgba(26,18,12,.6)'};
let bodenFarbenNacht = null;
function bodenFarben(nacht){
  if(!nacht) return BODEN_FARBEN_TAG;
  if(!bodenFarbenNacht){
    const T = BODEN_FARBEN_TAG, h = djNachtFarbe, r = rgb => djNachtFarbeRgb(rgb);
    bodenFarbenNacht = {grasDunkel: [r(T.grasDunkel[0]), T.grasDunkel[1]], grasHell: [r(T.grasHell[0]), T.grasHell[1]],
      farnStiel: h(T.farnStiel), farnA: h(T.farnA), farnB: h(T.farnB), blumenStiel: h(T.blumenStiel), blumen: T.blumen.map(r),
      blumenMitte: h(T.blumenMitte), pilzStiel: h(T.pilzStiel), pilzHut: h(T.pilzHut), pilzPunkte: 'rgba(' + r('255,252,240') + ',.95)', pilzRand: T.pilzRand};
  }
  return bodenFarbenNacht;
}

// ---------- Aufbau (einmal je Level) ----------
let bodenFor = null, bodenNachtFor = null;
const BODEN = {gross: [], stuecke: [], dickicht: [], zellen: []};
// Oberseiten-Kästchen: fester Boden/Wand, darüber frei (Scheinwände zählen als belegt -> versteckte Wege bleiben versteckt)
function bodenOberseiten(){
  const Z = [];
  for(const s of solids){
    if(s.type !== 'ground' && s.type !== 'wall') continue;
    if(s.y < 40) continue;
    for(let cx = s.x; cx < s.x + s.w; cx += 40) if(!decoSolidAt(cx + 20, s.y - 2)) Z.push({x: cx, y: s.y});
  }
  Z.sort((a, b) => a.y - b.y || a.x - b.x);
  // zusammenhängende Strecken (für den Kanten-Abstand der großen Pflanzen)
  let lauf = null;
  for(const z of Z){
    if(!lauf || lauf.y !== z.y || lauf.x1 !== z.x){ lauf = {y: z.y, x0: z.x, x1: z.x + 40}; }
    else lauf.x1 = z.x + 40;
    z.lauf = lauf;
  }
  return Z;
}
function bodenAufbauen(){
  bodenFor = solids; bodenNachtFor = hgNacht();
  const r = rnd(9001 + Math.round(LEVEL_W) % 997), Z = bodenOberseiten(), gesperrt = bodenSperre();
  BODEN.zellen = Z; BODEN.gross = []; BODEN.stuecke = []; BODEN.dickicht = [];
  // 1. große Pflanzen (nachts zählen die Leuchtpflanzen mit)
  const gross = BODEN.gross, belegt = [];
  if(hgNacht()) for(const p of hgLeuchtpflanzen()) belegt.push(p.wx);
  const grossOk = (x, z) => !gesperrt(x, z.y) && !bodenNahStart(x) && x - z.lauf.x0 >= BODEN_GROSS_RAND && z.lauf.x1 - x >= BODEN_GROSS_RAND &&
                            !belegt.some(bx => Math.abs(bx - x) < BODEN_GROSS_ABSTAND) &&
                            !gross.some(g => Math.abs(g.x - x) < BODEN_GROSS_ABSTAND && Math.abs(g.y - z.y) < 60);
  for(const z of Z){
    const pf = r(), pb = r(), pp = r(), xb = z.x + r()*40, hb = (22 + r()*24)*0.75, cb = Math.floor(r()*3), xp = z.x + 10 + r()*20, sp = 0.7 + r()*0.4,
          sf = (0.8 + r()*0.5)*0.55, ph = r()*6;
    if(pf < BODEN_FARN_P && grossOk(z.x + 20, z)) gross.push({art: 'farn', x: z.x + 20, y: z.y, s: sf, ph});
    if(pb < BODEN_BLUME_P && grossOk(xb, z)) gross.push({art: 'blume', x: xb, y: z.y + 3, boden: z.y, h: hb, c: cb, ph});
    if(pp < BODEN_PILZ_P && grossOk(xp, z)) gross.push({art: 'pilz', x: xp, y: z.y + 1, boden: z.y, s: sp});
  }
  // 2. Gras (feines Gras + Büschel) als Zeichenpfade je Stück, Dickicht in die Lücken
  const stuecke = new Map();
  for(const z of Z){
    const sx = Math.floor(z.x/(40*BODEN_STUECK))*40*BODEN_STUECK, key = sx + ',' + z.y;
    let S = stuecke.get(key);
    if(!S){ S = {x0: sx, y: z.y, feinD: new Path2D(), feinH: new Path2D(), buschD: new Path2D(), buschH: new Path2D(), n: 0}; stuecke.set(key, S); }
    const halm = (dD, dH, x, h, bl) => {   // ein Büschel (Vorschau: tuftA) in Stück-Koordinaten (Ursprung x0 / Oberkante)
      for(const b of bl){
        const hh = h*b.hf, lean = b.a*hh*0.9, bx = x - S.x0 + b.dx;
        dD.moveTo(bx, 1); dD.quadraticCurveTo(bx + lean*0.3, 1 - hh*0.6, bx + lean, 1 - hh);
        dH.moveTo(bx + 0.4, 1); dH.quadraticCurveTo(bx + lean*0.3 + 0.4, 1 - hh*0.6, bx + lean, 1 - hh);
      }
    };
    for(let x = z.x + 3; x < z.x + 40; x += 7 + r()*6){
      const n = 4 + Math.floor(r()*3), bl = [];
      for(let i = 0; i < n; i++) bl.push({dx: (i - (n - 1)/2)*1.1, a: (i - (n - 1)/2)*0.3 + (r() - 0.5)*0.3, hf: 0.5 + r()*0.55});
      const h = 5 + r()*8;
      if(!gesperrt(x, z.y)){ halm(S.feinD, S.feinH, x, h, bl); S.n++; }
    }
    if(r() < BODEN_BUESCHEL_P){
      const n = 3 + Math.floor(r()*3), bl = [];
      for(let i = 0; i < n; i++) bl.push({dx: (i - (n - 1)/2)*1.7, a: (i - (n - 1)/2)*0.26 + (r() - 0.5)*0.25, hf: 0.55 + r()*0.5});
      const x = z.x + r()*40, h = 7 + r()*9;
      if(!gesperrt(x, z.y)){ halm(S.buschD, S.buschH, x, h, bl); S.n++; }
    }
    for(let i = 0; i < BODEN_DICKICHT_N; i++){
      if(r() < BODEN_DICKICHT_P){
        const x = z.x + r()*40, k = Math.floor(r()*22), ph = r()*6.28, rot = (r() - 0.5)*0.3;
        if(!gesperrt(x, z.y)) BODEN.dickicht.push({x, y: z.y + BODEN_DICKICHT_TIEF, k, ph, rot});
      }
    }
  }
  BODEN.stuecke = [...stuecke.values()].filter(S => S.n > 0).sort((a, b) => a.x0 - b.x0);
  BODEN.dickicht.sort((a, b) => a.x - b.x);
}
function bodenBereit(){ if(bodenFor !== solids || bodenNachtFor !== hgNacht()) bodenAufbauen(); }
// große Pflanzen (für die Tiere in 20-tiere.js: dort hält jedes Tier ±34 px Abstand)
function bodenGrossePflanzen(){ if(!bodenDekorAn()) return []; bodenBereit(); return BODEN.gross; }

// ---------- Zeichnen ----------
const bodenWindZeit = () => (typeof djAn === 'function' && djAn(djSchalter.wind)) ? performance.now()/1000 : null;
// Dickicht: VOR den Bodenkacheln (hinter Boden, Figuren und Objekten), schaut an den Kanten heraus
function bodenDickichtZeichnen(){
  if(!bodenDekorAn()) return;
  bodenBereit();
  const P = bodenPoolHolen(hgNacht()), t = bodenWindZeit(), x0 = camX - 80, x1 = camX + VW + 80;
  const T = ctx.getTransform();
  for(const b of BODEN.dickicht){
    if(b.x < x0) continue; if(b.x > x1) break;
    const s = P[b.k % P.length], a = b.rot + (t === null ? 0 : djWind(b.x, t)*BODEN_DICKICHT_AMP + Math.sin(t*0.9 + b.ph)*0.008);
    ctx.setTransform(T); ctx.translate(b.x - camX, b.y); ctx.rotate(a);
    ctx.drawImage(s.c, -s.sx, -s.sy, s.w, s.h);
  }
  ctx.setTransform(T);
}
// Gras, Farnbüsche, Blumen, Pilze: nach dem Boden, vor Objekten/Münzen/Figuren (aus drawGroundDeco, 17-deko.js)
function bodenDekorZeichnen(){
  bodenBereit();
  const nacht = hgNacht(), F = bodenFarben(nacht), t = bodenWindZeit(), tt = t === null ? 0 : t, x0 = camX - 80, x1 = camX + VW + 80;
  const T = ctx.getTransform();
  ctx.lineCap = 'round';
  const dunkel = 'rgba(' + F.grasDunkel[0] + ',' + F.grasDunkel[1] + ')', hell = 'rgba(' + F.grasHell[0] + ',' + F.grasHell[1] + ')';
  for(const S of BODEN.stuecke){
    if(S.x0 + 40*BODEN_STUECK < x0) continue; if(S.x0 > x1) break;
    const sk = t === null ? 0 : -BODEN_WIND_SCHERUNG*djWind(S.x0 + 80, t);
    ctx.setTransform(T); ctx.translate(S.x0 - camX, S.y); if(sk) ctx.transform(1, 0, sk, 1, 0, 0);
    ctx.strokeStyle = dunkel; ctx.lineWidth = 3.2*0.6; ctx.stroke(S.feinD);
    ctx.strokeStyle = hell;   ctx.lineWidth = 1.3*0.6; ctx.stroke(S.feinH);
    ctx.strokeStyle = dunkel; ctx.lineWidth = 3.2;     ctx.stroke(S.buschD);
    ctx.strokeStyle = hell;   ctx.lineWidth = 1.3;     ctx.stroke(S.buschH);
  }
  ctx.setTransform(T);
  for(const g of BODEN.gross){
    if(g.x < x0 || g.x > x1) continue;
    if(g.art === 'farn') bodenFarn(g, tt, F, t !== null);
    else if(g.art === 'blume') bodenBlume(g, tt, F, t !== null);
    else bodenPilz(g, F);
  }
  ctx.setTransform(T);
}
// Farnbusch (Vorschau: drawAgave)
function bodenFarn(a, t, F, wind){
  const sw = wind ? djWind(a.x, t)*0.07 + Math.sin(t*1.2 + a.ph)*0.02 : 0, X = a.x - camX, Y = a.y;
  for(let k = 0; k < 7; k++){
    const m = k - 3, ang = -Math.PI/2 + m*0.38 + sw*(1 + Math.abs(m)*0.2), L = (54 + (3 - Math.abs(m))*10)*a.s,
          cx = X + Math.cos(ang)*L*0.6, cy = Y + Math.sin(ang)*L*0.7, ex = X + Math.cos(ang)*L*0.9, ey = Y + Math.sin(ang)*L*0.9 + L*0.12;
    ctx.strokeStyle = F.farnStiel; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X, Y); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.stroke();
    for(let j = 1; j <= 9; j++){
      const u = j/10, bx = X*(1 - u)*(1 - u) + 2*u*(1 - u)*cx + u*u*ex, by = Y*(1 - u)*(1 - u) + 2*u*(1 - u)*cy + u*u*ey,
            ll = L*0.3*Math.sin(Math.PI*(u*0.8 + 0.1)), s = Math.sin(ang), c = Math.cos(ang);
      ctx.strokeStyle = j % 2 ? F.farnA : F.farnB; ctx.lineWidth = 2.4*a.s + 0.6; ctx.beginPath();
      ctx.moveTo(bx, by); ctx.lineTo(bx - s*ll + c*ll*0.5, by + c*ll + s*ll*0.5);
      ctx.moveTo(bx, by); ctx.lineTo(bx + s*ll + c*ll*0.5, by - c*ll + s*ll*0.5); ctx.stroke();
    }
  }
}
// Blume (Vorschau: drawFlower), wiegt im Wind
function bodenBlume(f, t, F, wind){
  const sw = wind ? djWind(f.x, t)*8*(f.h/40) + Math.sin(t*1.7 + f.ph)*1.5 : 0, X = f.x - camX, hx = X + sw, hy = f.y - f.h;
  ctx.strokeStyle = F.blumenStiel; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(X, f.y); ctx.quadraticCurveTo(X + sw*0.2 + 3, f.y - f.h*0.55, hx, hy); ctx.stroke();
  const T = ctx.getTransform();
  for(let k = 0; k < 3; k++){
    const a = -1.1 + k*1.1 + (wind ? Math.sin(t*1.3 + f.ph)*0.08 : 0);
    ctx.setTransform(T); ctx.translate(hx, hy); ctx.rotate(a);
    ctx.fillStyle = 'rgba(' + F.blumen[f.c] + ',.97)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(4, -6, 2, -12); ctx.quadraticCurveTo(-4, -6, 0, 0); ctx.fill();
    ctx.fillStyle = F.blumenMitte; ctx.beginPath(); ctx.arc(1, -12, 1.6, 0, 7); ctx.fill();
  }
  ctx.setTransform(T);
}
// Pilz (Vorschau: mush)
function bodenPilz(p, F){
  const x = p.x - camX, y = p.y, s = p.s;
  ctx.fillStyle = F.pilzStiel; ctx.beginPath(); ctx.roundRect(x - 2.4*s, y - 12*s, 4.8*s, 12*s, 2); ctx.fill();
  ctx.fillStyle = F.pilzHut; ctx.beginPath(); ctx.moveTo(x - 9*s, y - 11*s); ctx.quadraticCurveTo(x, y - 27*s, x + 9*s, y - 11*s); ctx.quadraticCurveTo(x, y - 8*s, x - 9*s, y - 11*s); ctx.fill();
  ctx.fillStyle = F.pilzPunkte;
  for(const d of [[-4, -15, 1.7], [2, -19, 1.4], [5, -14, 1.5]]){ ctx.beginPath(); ctx.arc(x + d[0]*s, y + d[1]*s, d[2]*s, 0, 7); ctx.fill(); }
  ctx.strokeStyle = F.pilzRand; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 9*s, y - 11*s); ctx.quadraticCurveTo(x, y - 27*s, x + 9*s, y - 11*s); ctx.stroke();
}
