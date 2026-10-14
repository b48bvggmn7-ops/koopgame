// 30-partner.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.
//
// ---------- Computer-Partner (nur im Testmodus aus dem Editor) ----------
// Wer ein Level allein testen will, lässt die zweite Figur vom Computer steuern. Der Partner drückt dabei echte
// (virtuelle) Tasten im selben Eingabesystem wie ein Spieler (KEYS in 03-eingabe.js) – es gilt also genau dieselbe
// Physik, er kann nichts, was ein Spieler nicht kann. Ich (der Mensch) steuere meine Figur mit BEIDEN Tastaturhälften
// und beiden Controllern. Im normalen Spiel zu zweit ist der Partner aus und ändert nichts (partnerAktiv() = false).
// Werte (Reaktionszeit, Abstand …) in js/02-physik-werte.js (PARTNER_*).

const PARTNER_SPEICHER = 'monchichi_partner';   // {an, ich: 'm' | 'f'} – im Browser gemerkt (Editor-Auswahl „Allein testen“)
const PARTNER_AKTIONEN = ['left', 'right', 'jump', 'ability', 'pull', 'slack', 'use', 'padUse'];
const partnerCode = a => 'Partner_' + a;   // Tasten, die der Partner drückt
const soloCode = a => 'Solo_' + a;         // meine Tasten (beide Tastaturhälften + beide Controller zusammen)

let partner = {
  an: false,          // Schalter (Editor: „Allein testen“, im Spiel P)
  ich: 'm',           // welche Figur ICH spiele ('m' = Affe, 'f' = Schweinchen); der Partner hat die andere
  frei: false,        // auch außerhalb des Editor-Tests erlaubt (nur für die automatischen Tests; später Hauptspiel)
  modus: 'folgen',    // folgen | warten (auf meinen Ruf) | aufgabe | fest (hängt fest)
  text: '',           // was er gerade tut (Anzeige über seiner Figur)
};

function partnerEinstellungLaden(){
  try{
    const d = JSON.parse(localStorage.getItem(PARTNER_SPEICHER) || 'null');
    if(d){ partner.an = !!d.an; partner.ich = d.ich === 'f' ? 'f' : 'm'; }
  }catch(e){}
}
function partnerEinstellungMerken(){
  try{ localStorage.setItem(PARTNER_SPEICHER, JSON.stringify({an: partner.an, ich: partner.ich})); }catch(e){}
}
function partnerAktiv(){
  return partner.an && (partner.frei || PARTNER_IM_HAUPTSPIEL || (typeof editorTestMode !== 'undefined' && editorTestMode));
}
// Figur des Partners bzw. meine Figur
const partnerFigur = () => partner.ich === 'm' ? p2 : p1;
const meineFigur = () => partner.ich === 'm' ? p1 : p2;

// Tasten je Figur (aufgerufen von keysFor in 03-eingabe.js); null = wie immer (zwei Spieler)
function partnerTasten(male){
  if(!partnerAktiv()) return null;
  const istPartner = (partner.ich === 'm') !== male;
  const c = istPartner ? partnerCode : soloCode;
  return male ? {left: c('left'), right: c('right'), jump: c('jump'), hook: c('ability'), pull: c('pull'), slack: c('slack'),
                 use: c('use'), padUse: c('padUse'), swimUp: c('pull'), swimDown: c('slack')}
              : {left: c('left'), right: c('right'), jump: c('jump'), glide: c('ability'), use: c('use'), padUse: c('padUse'),
                 swimUp: c('pull'), swimDown: c('slack')};
}
function partnerTastenNeu(){
  if(typeof p1 === 'undefined' || !p1) return;
  p1.keys = keysFor(true); p2.keys = keysFor(false);
  for(const a of PARTNER_AKTIONEN){ KEYS[partnerCode(a)] = false; KEYS[partnerCode(a) + '_pressed'] = false; }
  if(typeof updateHudKeys === 'function') updateHudKeys();
}

// Ein-/Ausschalten und Rollenwechsel (Editor-Auswahl, Tasten P/V, Controller Share)
function partnerSetzen(an, ich){
  partner.an = !!an;
  if(ich === 'm' || ich === 'f') partner.ich = ich;
  partnerEinstellungMerken();
  partnerHirnNeu();
  partnerTastenNeu();
}
function partnerTauschen(){
  if(!partnerAktiv()) return;
  partner.ich = partner.ich === 'm' ? 'f' : 'm';
  partnerEinstellungMerken();
  partnerHirnNeu();
  partnerTastenNeu();
}

// ---------- „Gehirn“ (Teilschritte 2–4) ----------
let partnerHirn = null;
const partnerQuelle = {};   // letzter Stand meiner echten Tasten je Aktion (siehe partnerVorSchritt)
function partnerHirnNeu(){
  partnerHirn = {schritt: 0, naechste: 0, plan: null, zufall: 12345, festSeit: 0};
  partner.modus = 'folgen'; partner.text = '';
}

// Jeder Physik-Schritt (Anfang von stepSim in 14-spielschleife.js): meine Tasten zusammenführen, Partner-Tasten setzen
function partnerVorSchritt(){
  if(!partnerAktiv()) return;
  if(!partnerHirn){ partnerHirnNeu(); if(typeof updateHudKeys === 'function') updateHudKeys(); }
  // Meine Figur: beide Tastaturhälften und beide Controller. Ein „gerade gedrückt“ der Original-Taste wird übernommen
  // und dort gelöscht (sonst bliebe es liegen, weil keine Figur mehr auf diese Taste hört).
  // Gehalten wird nur bei einer Änderung übernommen – so kann ein Test-Skript (Koop-Bot) meine Figur auch direkt steuern.
  for(const a of PARTNER_AKTIONEN){
    const c1 = KEYSETS[1][a], c2 = KEYSETS[2][a], s = soloCode(a), q = isDown(c1) || isDown(c2);
    if(q !== !!partnerQuelle[a]){ KEYS[s] = q; partnerQuelle[a] = q; }
    if(KEYS[c1 + '_pressed'] || KEYS[c2 + '_pressed']){ KEYS[s + '_pressed'] = true; KEYS[c1 + '_pressed'] = false; KEYS[c2 + '_pressed'] = false; }
  }
  const P = partnerFigur(), M = meineFigur();
  if(!P || !M) return;
  partnerHirn.schritt++;
  const w = partnerDenken(P, M);
  const vorher = partnerHirn.tasten || (partnerHirn.tasten = {});
  for(const a of PARTNER_AKTIONEN){
    const c = partnerCode(a), jetzt = !!w.halten[a] || w.druecken.includes(a);
    if(jetzt && (!vorher[a] || w.druecken.includes(a))) KEYS[c + '_pressed'] = true;   // neu gedrückt
    if(!jetzt) KEYS[c + '_pressed'] = false;
    KEYS[c] = jetzt; vorher[a] = jetzt;
  }
}

// ---------- Anzeige: kleines Schild über dem Partner (was er gerade tut) ----------
function partnerZeichnen(){
  if(!partnerAktiv() || !p1 || !p2) return;
  const P = partnerFigur();
  const sx = (P.x - camX) * zoom, sy = (P.y - P.h - 14) * zoom + H*(1 - zoom) + CEILING_MARGIN;
  const txt = '🤖 ' + (partner.text || 'Partner');
  ctx.save();
  ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(txt).width + 14;
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = 'rgba(20,28,38,.75)'; roundRect(sx - tw/2, sy - 20, tw, 18, 8); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#e8f1ff'; ctx.fillText(txt, sx, sy - 11);
  ctx.restore();
}

// ---------- Tasten im Testmodus: P = Partner an/aus, V = Rollen tauschen ----------
window.addEventListener('keydown', e => {
  if(e.repeat || typeof menuActive !== 'function' || menuActive()) return;
  const erlaubt = partner.frei || PARTNER_IM_HAUPTSPIEL || (typeof editorTestMode !== 'undefined' && editorTestMode);
  if(!erlaubt) return;
  if(e.code === 'KeyP'){ partnerSetzen(!partner.an); return; }
  if(!partnerAktiv()) return;
  if(e.code === 'KeyV') partnerTauschen();
});

partnerEinstellungLaden();

// Anzeige oben links/rechts, wenn der Partner an ist: wer bin ich, welche Tasten (aufgerufen aus updateHudKeys)
function partnerHud(set){
  if(!partnerAktiv()) return false;
  const ichAffe = partner.ich === 'm';
  const meins = 'A/D oder ← → bewegen · Leertaste/Num&nbsp;0 springen · G/Num&nbsp;1 ' + (ichAffe ? 'Haken' : 'Schirm') +
    ' · J/Num&nbsp;2 Hebel' + (ichAffe ? ' · W/S Seil' : '');
  const seins = 'Q warten/komm · E Aufgabe jetzt · V Rollen tauschen · P Partner aus · Controller: L1 / R1 / Share';
  set(ichAffe ? 'hudMHead' : 'hudFHead', '<b>Du</b> <span class="' + (ichAffe ? 'p1">● Affe, Haken' : 'p2">● Schweinchen, Schirm') + '</span>');
  set(ichAffe ? 'hudMKeys' : 'hudFKeys', meins);
  set(ichAffe ? 'hudFHead' : 'hudMHead', '<b>🤖 Computer-Partner</b> <span class="' + (ichAffe ? 'p2">● Schweinchen' : 'p1">● Affe') + '</span>');
  set(ichAffe ? 'hudFKeys' : 'hudMKeys', seins);
  return true;
}

// =====================================================================================================================
// Teilschritt 2: Folgen. Der Partner plant in kleinen Stücken („Pläne“: laufen, stehen, springen, segeln, Haken) und
// rechnet jeden Plan mit denselben Physik-Werten wie das Spiel voraus (partnerSim – nur lesen, ändert nichts am Spiel).
// Ein Plan wird nur genommen, wenn die Figur dabei sicher landet (keine Grube, keine Stacheln, keine Lava, keine Flamme,
// kein Pfeil, keine Presse, kein Fels zu dem Zeitpunkt, an dem sie dort wäre). Ausgeführt wird ein Plan dann mit den
// echten Tasten; nach jeder Entscheidung wartet er eine menschliche Reaktionszeit (PARTNER_REAKTION).
// =====================================================================================================================

// kleiner fester Zufall (gleiches Verhalten bei jedem Lauf – wichtig für die Tests)
function partnerZufall(){ partnerHirn.zufall = (partnerHirn.zufall * 1103515245 + 12345) % 2147483648; return partnerHirn.zufall / 2147483648; }
function partnerReaktion(){ const [a, b] = PARTNER_REAKTION; return a + Math.floor(partnerZufall() * (b - a + 1)); }

// ---------- Umgebung (einmal je Entscheidung): feste Teile, Stege und Gefahren in der Nähe ----------
function partnerUmgebung(x){
  const x0 = x - 750, x1 = x + 750, nah = o => o.x < x1 && o.x + (o.w || 40) > x0;
  const U = {feste: [], stege: [], stacheln: [], flammen: [], pfeilFallen: [], pressenNah: [], felsenNah: []};
  for(const s of solids){
    if(s.gone || !nah(s)) continue;
    if(s.type === 'oneway') U.stege.push(s); else U.feste.push(s);
  }
  for(const sp of spikes) if(Math.abs(sp.x - x) < 1100) U.stacheln.push({x: sp.x - sp.w/2, y: sp.y - sp.h, w: sp.w, h: sp.h});
  if(typeof fallen !== 'undefined') for(const f of fallen){
    if(Math.abs(f.x - x) > 1500 || !falleAktiv(f)) continue;
    if(f.art === 'flamme') U.flammen.push(f);
    else {   // Pfeil-Bahn: vom Mund bis zum ersten festen Kästchen
      const m = falleMund(f); let L = 0;
      while(L < PFEIL_REICHWEITE && !falleFestBei(m.x + f.dx*(L + 4), m.y + f.dy*(L + 4))) L += 8;
      U.pfeilFallen.push({f, m, L});
    }
  }
  if(typeof pressen !== 'undefined') for(const P of pressen) if(Math.abs(P.x - x) < 1100) U.pressenNah.push(P);
  if(typeof felsen !== 'undefined') for(const F of felsen) if(!F.weg && (F.aktiv || F.warn > 0)) U.felsenNah.push(F);
  return U;
}
const partnerUeberlappt = (a, b, rand) => a.x < b.x + b.w + rand && a.x + a.w > b.x - rand && a.y < b.y + b.h + rand && a.y + a.h > b.y - rand;

// Ist die Figur (Körper b) k Schritte in der Zukunft an dieser Stelle in Gefahr? (mit etwas Sicherheitsabstand)
function partnerGefahr(U, b, k){
  if(b.y - b.h > LEVEL_H + 10) return 'grube';
  const box = {x: b.x - b.w/2, y: b.y - b.h, w: b.w, h: b.h};
  for(const sp of U.stacheln) if(partnerUeberlappt(box, sp, 5)) return 'stacheln';
  if(typeof lavaBecken !== 'undefined' && lavaBecken.length){
    for(const dx of [-b.w*0.45, 0, b.w*0.45]) if(inLava(b.x + dx, b.y - LAVA_GNADE + 6)) return 'lava';
  }
  if(typeof wasserBecken !== 'undefined' && wasserBecken.length && imWasser(b.x, b.y - 4)) return 'wasser';   // Wasser meidet er (zu unsicher)
  for(const f of U.flammen){
    const n = falleTaktSchritte(f), brenn = n*FLAMME_ANTEIL;
    const t = (((fallenSchritte + k - FALLE_WARN - Math.round(f.versatz*n)) % n) + n) % n;
    if((t < brenn + 8 || t > n - 8) && partnerUeberlappt(box, falleFlammeBox(f), 8)) return 'flamme';
  }
  for(const {f, m, L} of U.pfeilFallen){
    const n = falleTaktSchritte(f), tNow = falleZeit(f);
    // nächste Schüsse in den kommenden k Schritten (und einer davor, der noch fliegt)
    for(let s0 = (n - tNow) % n - n; s0 <= k; s0 += n){
      const weg = PFEIL_TEMPO*(k - s0);
      if(weg < -PFEIL_TEMPO*3 || weg > L + 20) continue;
      const ax = m.x + f.dx*weg, ay = m.y + f.dy*weg;
      // Pfeil-Spitze samt ein paar Schritten davor/danach (gnädig gerechnet: lieber warten)
      const spur = {x: Math.min(ax, ax - f.dx*PFEIL_TEMPO*4) - 8, y: Math.min(ay, ay - f.dy*PFEIL_TEMPO*4) - 8,
                    w: Math.abs(f.dx)*PFEIL_TEMPO*4 + 16, h: Math.abs(f.dy)*PFEIL_TEMPO*4 + 16};
      if(partnerUeberlappt(box, spur, 2)) return 'pfeil';
    }
  }
  for(const a of (typeof fallenPfeile !== 'undefined' ? fallenPfeile : [])){
    if(a.steckt >= 0) continue;
    const ax = a.x + a.dx*PFEIL_TEMPO*k, ay = a.y + a.dy*PFEIL_TEMPO*k;
    if(partnerUeberlappt(box, {x: ax - 10, y: ay - 10, w: 20, h: 20}, 4)) return 'pfeil';
  }
  for(const P of U.pressenNah){
    const n = presseTaktSchritte(P), laeuft = presseLaeuft(P);
    let lage = presseLage(P, presseZeit(P));
    if(laeuft){ lage = 0; for(const dk of [-8, 0, 8]){ const tt = (((P.t + k + dk + Math.round(P.versatz*n)) % n) + n) % n; lage = Math.max(lage, presseLage(P, tt)); } }
    const y = P.y0 + lage*P.hub;
    if(partnerUeberlappt(box, {x: P.x + 3, y: y + 2, w: P.w - 6, h: PRESSE_HOEHE + PRESSE_STACHEL - 4}, 6)) return 'presse';
  }
  for(const F of U.felsenNah){
    const fx = F.x + (F.aktiv ? F.vx : 0)*k + (F.aktiv ? 0 : F.dir*0);
    if(Math.hypot(fx - b.x, F.y - (b.y - b.h/2)) < FELS_RADIUS + 40) return 'fels';
  }
  return null;
}

// ---------- Vorausrechnen eines Körpers (gleiche Werte wie updatePlayer in 08-figur-physik-seil.js) ----------
function partnerKoerper(P){
  return {x: P.x, y: P.y, vx: P.vx, vy: P.vy, w: P.w, h: P.h, male: P.male, grounded: P.grounded, glideTimer: P.glideTimer || 0,
          kurz: !!P.sprungKurzMoeglich, los: !!P.sprungLosgelassen, fling: !!P.ropeFling, standingOn: P.standingOn,
          hook: P.male && P.hookAttached ? {anchor: P.anchor, len: P.ropeLen} : null, lastAnchor: null, inWater: !!P.inWater};
}
function partnerKollision(U, b, achse){
  const box = {x: b.x - b.w/2, y: b.y - b.h, w: b.w, h: b.h};
  if(achse === 'y' && b.vy > 0){
    for(const s of U.stege){
      const vorher = b.y - b.vy, ox = Math.min(b.x + b.w/2, s.x + s.w) - Math.max(b.x - b.w/2, s.x);
      if(vorher <= s.y + COLLIDE_EPS && b.y >= s.y && ox > COLLIDE_EPS){ b.y = s.y; b.vy = 0; b.grounded = true; b.standingOn = s; }
    }
  }
  for(const s of U.feste){
    if(s.gone) continue;
    const bx = {x: b.x - b.w/2, y: b.y - b.h, w: b.w, h: b.h};
    const ox = Math.min(bx.x + bx.w, s.x + s.w) - Math.max(bx.x, s.x);
    const oy = Math.min(bx.y + bx.h, s.y + s.h) - Math.max(bx.y, s.y);
    if(ox <= COLLIDE_EPS || oy <= COLLIDE_EPS) continue;
    if(achse === 'x'){
      let nx = b.x;
      if(b.vx > 0) nx = s.x - b.w/2; else if(b.vx < 0) nx = s.x + s.w + b.w/2;
      if(Math.abs(nx - b.x) > b.w && oy < 12){ if(bx.y + bx.h/2 < s.y + s.h/2) b.y = s.y; else b.y = s.y + s.h + b.h; continue; }
      b.x = nx; b.vx = 0; b.wand = true;
    } else {
      if(b.vy > 0){ b.y = s.y; b.grounded = true; b.standingOn = s; }
      else if(b.vy < 0) b.y = s.y + s.h + b.h;
      b.vy = 0;
    }
  }
  void box;
}
function partnerHakenZiel(b){
  const ox = b.x, oy = b.y - b.h*0.6; let best = null, bd = Infinity;
  for(const h of hooks){
    const d = Math.hypot(h.x - ox, h.y - oy);
    if(d > hookRange(h) || d >= bd || !lineClear(ox, oy, h.x, h.y)) continue;
    best = h; bd = d;
  }
  return best;
}
// ein Schritt: e = {dir, springen (neu drücken), sprungHalten, gleiten, haken (neu drücken), loslassen}
let partnerSimZaehler = 0;   // gerechnete Vorausschritte (Budget je Entscheidung: PARTNER_BUDGET)
function partnerSimSchritt(U, b, e){
  partnerSimZaehler++;
  const dir = e.dir || 0;
  if(b.male && e.haken && !b.hook){
    const t = partnerHakenZiel(b);
    if(t){ b.hook = {anchor: t, len: Math.hypot(t.x - b.x, t.y - (b.y - b.h*0.6))}; b.luft = false; }
  }
  if(b.hook){
    b.vy += GRAVITY*0.9;
    if(dir !== 0 && b.vx*dir > -0.3) b.vx += dir*SWING_PUSH;
    const A = b.hook.anchor;
    let nx = b.x + b.vx, ny = (b.y - b.h*0.6) + b.vy;
    const dx = nx - A.x, dy = ny - A.y, dist = Math.hypot(dx, dy) || 1;
    const cur = Math.hypot(b.x - A.x, (b.y - b.h*0.6) - A.y);
    if(dist > b.hook.len && cur <= b.hook.len + 4){
      const sc = b.hook.len/dist; nx = A.x + dx*sc; ny = A.y + dy*sc;
      const ux = dx/dist, uy = dy/dist, rad = b.vx*ux + b.vy*uy; b.vx -= rad*ux; b.vy -= rad*uy;
    }
    b.vx = nx - b.x; b.vy = ny + b.h*0.6 - b.y;
    const sp = Math.hypot(b.vx, b.vy); if(sp > ROPE_MAX_STEP){ b.vx *= ROPE_MAX_STEP/sp; b.vy *= ROPE_MAX_STEP/sp; }
    if(e.loslassen){ b.lastAnchor = b.hook.anchor; b.hook = null; b.vy += HOOK_RELEASE_BOOST; b.fling = true; }
  } else {
    const control = b.grounded ? 1 : AIR_CONTROL;
    if(b.grounded) b.fling = false;
    const vxVor = b.vx;
    b.vx += dir*MOVE_SPEED*0.35*control;
    if(b.grounded && dir !== 0 && Math.abs(b.vx) >= MOVE_SPEED*0.9 && Math.sign(b.vx) === dir) b.vx += dir*SPRINT_ACCEL;
    if(dir === 0){ b.vx *= b.grounded ? FRICTION_GROUND : (b.fling ? ROPE_FLING_DRAG : FRICTION_AIR); if(Math.abs(b.vx) < 0.05) b.vx = 0; }
    const vmax = b.fling ? Math.min(ROPE_FLING_MAX, Math.max(SPRINT_MAX_SPEED, Math.abs(vxVor))) : SPRINT_MAX_SPEED;
    b.vx = Math.max(-vmax, Math.min(vmax, b.vx));
    const windig = !b.male && winds.length && inWind(b);
    const gleitet = !b.male && e.gleiten && !b.grounded && (b.vy > -1 || windig);
    if(gleitet){
      b.glideTimer += 16.6;
      const t = Math.min(1, b.glideTimer/GLIDE_RAMP_MS);
      b.vy += GLIDE_START_GRAV + (GRAVITY - GLIDE_START_GRAV)*t;
      b.vy = Math.min(b.vy, GLIDE_MAX_FALL_START + (GLIDE_MAX_FALL_END - GLIDE_MAX_FALL_START)*t);
      if(windig){ b.glideTimer = 0; b.vy = Math.max(-WIND_MAX_UP, b.vy - WIND_LIFT); }
    } else b.vy += GRAVITY;
    if(b.vy > MAX_FALL) b.vy = MAX_FALL;
    if(e.springen && b.grounded){ b.vy = JUMP_V; b.grounded = false; b.glideTimer = 0; b.kurz = true; b.los = false; }
    if(b.kurz){
      if(b.vy >= 0 || gleitet) b.kurz = false;
      else { if(!e.sprungHalten) b.los = true; if(b.los && b.vy < JUMP_CUT_VY) b.vy = JUMP_CUT_VY + (b.vy - JUMP_CUT_VY)*JUMP_CUT_SMOOTH; }
    }
  }
  const warBoden = b.grounded, fallVy = b.vy;
  b.grounded = false; b.standingOn = null; b.wand = false;
  b.x += b.vx; partnerKollision(U, b, 'x');
  b.y += b.vy; partnerKollision(U, b, 'y');
  if(!b.hook && !warBoden && fallVy > 0 && b.vy >= 0){   // Sprungpilz (elemente/sprungpilz.js)
    for(const p of bouncers) if(Math.abs(b.x - p.x) < 14 + b.w/2 && b.y > p.y - 14 && b.y <= p.y + 1){ b.vy = BOUNCE_V; b.grounded = false; b.glideTimer = 0; break; }
  }
  if(b.hook){ if(b.grounded && b.luft) b.hook = null; else if(!b.grounded) b.luft = true; }
  if(b.grounded){ b.glideTimer = 0; }
  const decke = -CEILING_MARGIN - SKY_ROOM;
  if(b.y - b.h < decke){ b.y = b.h + decke; if(b.vy < 0) b.vy = 0; }
}

// Plan k Schritte vorausrechnen. plan(k, b) liefert die Eingaben, plan.fertig(k, b) beendet ihn.
// Ergebnis: {tod (Grund), k, b (Endzustand), boden (steht am Ende), weg (Punkte)}
function partnerSim(U, P, plan, n){
  const b = partnerKoerper(P), st = {};
  for(let k = 1; k <= n; k++){
    const e = plan.eingabe(k, b, st);
    partnerSimSchritt(U, b, e);
    const g = partnerGefahr(U, b, k);
    if(g) return {tod: g, k, b};
    if(plan.fertig && plan.fertig(k, b, st)){ n = k; break; }
  }
  // nach dem Plan: noch kurz stehen bleiben – steht man dann sicher?
  const ende = {x: b.x, y: b.y, boden: b.grounded};
  for(let k = n + 1; k <= n + 24; k++){
    partnerSimSchritt(U, b, {});
    const g = partnerGefahr(U, b, k);
    if(g) return {tod: g, k, b};
  }
  return {k: n, b, x: ende.x, y: ende.y, boden: ende.boden && b.grounded};
}

// ---------- Pläne (gleiche Funktion für Vorausrechnung UND echte Ausführung) ----------
const partnerAnker = b => b.hook ? b.hook.anchor : (b.hookAttached ? b.anchor : null);
function planStehen(n){
  return {art: 'stehen', eingabe: () => ({}), fertig: k => k >= n};
}
function planLauf(d, zielX, gemuetlich){
  return {art: 'lauf', d, zielX,
    eingabe(k, b){
      const weiter = (b.x - zielX)*d < -6;
      const puls = !gemuetlich || (k % 25) < 25*PARTNER_GEMUETLICH;   // kurz lupfen: kein Sprint-Tempo
      return {dir: weiter && puls ? d : 0};
    },
    fertig: (k, b) => ((b.x - zielX)*d >= -6 && Math.abs(b.vx) < 0.6 && b.grounded) || k > 240};
}
// springen bei x = jx (Richtung d), Sprungtaste halt Schritte halten, in der Luft bis stopX lenken, Schweinchen: segeln
function planSprung(d, jx, halt, stopX, gleit){
  return {art: gleit ? 'segeln' : 'sprung', d,
    eingabe(k, b, st){
      if(!st.ab){
        if(b.grounded && (b.x - jx)*d >= 0){ st.ab = true; st.k0 = k; return {dir: d, springen: true, sprungHalten: true}; }
        return {dir: (b.x - jx)*d < 0 ? d : 0};
      }
      const lenken = (b.x - stopX)*d < 0 ? d : 0;
      return {dir: lenken, sprungHalten: k - st.k0 < halt, gleiten: gleit && b.vy > 0};
    },
    fertig: (k, b, st) => (st.ab && k - st.k0 > 3 && b.grounded) || k > 400 || (!st.ab && k > 200)};
}
// Affe: springen bei jx, Haken greifen, schwingen, loslassen hinter dem Haken; weitere Haken möglich
function planHaken(d, jx, stopX){
  return {art: 'haken', d,
    eingabe(k, b, st){
      if(!st.ab){
        if(b.grounded && (b.x - jx)*d >= 0){ st.ab = true; st.k0 = k; return {dir: d, springen: true, sprungHalten: true}; }
        return {dir: (b.x - jx)*d < 0 ? d : 0};
      }
      const A = partnerAnker(b);
      if(A){
        if((b.x - A.x)*d > 20 && b.vy < 0 && b.vx*d > 1){ st.letzter = A; return {dir: d, loslassen: true}; }
        return {dir: d};
      }
      const e = {dir: (b.x - stopX)*d < 0 ? d : 0, sprungHalten: k - st.k0 < 10};
      if(b.vy > -4 && !b.grounded && (!st.gegriffenK || k - st.gegriffenK > 6)){
        const t = partnerHakenZiel(b);
        if(t && t !== st.letzter && (t.x - b.x)*d > -10){ e.haken = true; st.gegriffenK = k; }
      }
      return e;
    },
    fertig: (k, b, st) => (st.ab && k - st.k0 > 3 && b.grounded && !partnerAnker(b)) || k > 500 || (!st.ab && k > 200)};
}
// in der Luft ohne Plan (z. B. nach einem Stoß): nur lenken und ggf. segeln
function planLuft(dir, gleit){
  return {art: 'luft', eingabe: (k, b) => ({dir, gleiten: gleit && b.vy > 0}), fertig: (k, b) => b.grounded || k > 300};
}

// ---------- Wohin? Gemütlich hinter mir, auf meiner Seite, nie vorlaufen ----------
function partnerFolgeZiel(P, M){
  const H = partnerHirn;
  if(M.grounded || M.inWater || !H.mFuss) H.mFuss = {x: M.x, y: M.y};
  const f = H.mFuss;
  const seite = Math.sign(P.x - f.x) || -1;
  const x = Math.max(20, Math.min(LEVEL_W - 20, f.x + seite*PARTNER_ABSTAND));
  // zufrieden, solange er auf meiner Höhe höchstens Abstand + Spielraum von mir weg steht (wartet, wenn ich stehe)
  const nah = Math.abs(P.y - f.y) < 60 && Math.abs(P.x - f.x) <= PARTNER_ABSTAND + PARTNER_ABSTAND_LOCKER;
  return {x, y: f.y, nah};
}
const partnerAbstand = (x, y, Z) => Math.abs(x - Z.x) + 1.6*Math.max(0, y - Z.y) + 0.6*Math.max(0, Z.y - y);

// ---------- Entscheiden: alle sinnvollen Pläne vorausrechnen, den sichersten mit dem meisten Fortschritt nehmen ----------
function partnerEntscheiden(P, Z){
  const U = partnerUmgebung(P.x), H = partnerHirn;
  const jetzt = partnerAbstand(P.x, P.y, Z), d = Math.sign(Z.x - P.x) || 1;
  const gemuetlich = Math.abs(Z.x - P.x) < PARTNER_AUFHOLEN;
  const kandidaten = [], gruende = new Set();
  partnerSimZaehler = 0;
  const pruefe = (plan, n, extra) => {
    if(partnerSimZaehler > PARTNER_BUDGET) return;   // genug gerechnet (bleibt flüssig); das Beste bisher zählt
    const r = partnerSim(U, P, plan, n);
    if(r.tod){ gruende.add(r.tod); return; }
    if(!r.boden) return;
    kandidaten.push({plan, wert: partnerAbstand(r.x, r.y, Z) + (extra || 0)});
  };
  if(P.grounded || P.inWater){
    // laufen: bis zum Ziel oder ein Stück (bis vor eine Kante)
    for(const zx of [Z.x, P.x + d*40, P.x + d*80, P.x + d*130, P.x + d*200]){
      if((zx - P.x)*d <= 0 || (zx - Z.x)*d > 0) continue;
      pruefe(planLauf(d, zx, gemuetlich), 240);
    }
    const bestLauf = kandidaten.reduce((m, c) => Math.min(m, c.wert), Infinity);
    // springen / segeln / Haken nur, wenn Laufen nicht (fast) bis zum Ziel bringt
    // (Stufenweise, damit es schnell bleibt: erst normale Sprünge, nur wenn die nicht reichen Segeln bzw. Haken)
    const gut = () => kandidaten.some(c => c.wert < PARTNER_ABSTAND_LOCKER + 30);
    if(bestLauf > PARTNER_ABSTAND_LOCKER + 10){
      pruefe(planSprung(d, P.x, 10, P.x + d*20, false), 200, 15);   // Stufe direkt vor mir
      for(let i = 0; i <= 8; i++) for(const halt of [10, 4]) for(const stopX of [d*Infinity, Z.x])
        pruefe(planSprung(d, P.x + d*i*16, halt, stopX, false), 200, 15);
      if(!gut() && !P.male) for(let i = 0; i <= 8; i++) for(const stopX of [d*Infinity, Z.x])
        pruefe(planSprung(d, P.x + d*i*16, 10, stopX, true), 360, 25);
      if(!gut() && P.male && hooks.some(h => Math.abs(h.x - P.x) < 700)) for(let i = 0; i <= 8; i += 2) for(const stopX of [d*Infinity, Z.x])
        pruefe(planHaken(d, P.x + d*i*16, stopX), 420, 40);
    }
  } else {
    for(const dir of [d, 0, -d]) for(const gl of (P.male ? [false] : [false, true])) pruefe(planLuft(dir, gl), 300, dir === d ? 0 : 5);
  }
  // Stehen bleiben ist immer eine Möglichkeit (wenn es sicher ist)
  const stehen = partnerSim(U, P, planStehen(30), 30);
  H.maxSim = Math.max(H.maxSim || 0, partnerSimZaehler);
  kandidaten.sort((a, b) => a.wert - b.wert);
  const best = kandidaten[0];
  H.wartetAufLuecke = [...gruende].some(g => g === 'flamme' || g === 'pfeil' || g === 'presse' || g === 'fels');
  if(stehen.tod && best) return best.plan;   // hier stehen bleiben wäre gefährlich -> irgendein sicherer Plan
  if(best && best.wert < jetzt - 12) return best.plan;
  if(stehen.tod){   // hier ist es gleich gefährlich: zurückweichen
    for(const dd of [-d, d]) for(const w of [60, 120, 180]){
      const r = partnerSim(U, P, planLauf(dd, P.x + dd*w, false), 240);
      if(!r.tod && r.boden) return planLauf(dd, P.x + dd*w, false);
    }
  }
  return null;
}

// ---------- Jeder Schritt: Plan ausführen, nach der Reaktionszeit neu entscheiden ----------
function partnerFolgen(P, M){
  const H = partnerHirn, Z = partnerFolgeZiel(P, M);
  // weit weg gesprungen (Tod/Checkpoint/Teleporter): sofort neu überlegen
  if(H.letztX !== undefined && Math.hypot(P.x - H.letztX, P.y - H.letztY) > 60){ H.plan = null; H.naechste = H.schritt; }
  H.letztX = P.x; H.letztY = P.y;
  // Fortschritt messen (hängt er fest?)
  const abst = partnerAbstand(P.x, P.y, Z);
  if(Z.nah || abst < H.bestAbst - 20 || H.bestAbst === undefined){ H.bestAbst = Z.nah ? Infinity : abst; H.festSeit = H.schritt; }
  if(H.bestAbst === Infinity) H.bestAbst = abst;
  if(partner.modus === 'fest'){
    if(Z.nah || Math.abs(Z.x - H.festZielX) > 200 || Math.abs(Z.y - H.festZielY) > 80){ partner.modus = 'folgen'; H.festSeit = H.schritt; H.bestAbst = abst; }
    else { partner.text = 'hänge fest – ruf mich (Q) oder tausch (V)'; return {}; }
  }
  if(!Z.nah && H.schritt - H.festSeit > PARTNER_FEST && P.grounded){
    partner.modus = 'fest'; H.festZielX = Z.x; H.festZielY = Z.y; H.plan = null;
    partner.text = 'hänge fest – ruf mich (Q) oder tausch (V)'; return {};
  }
  // laufender Plan: Sprünge/Haken werden nicht unterbrochen, Laufen/Stehen nach der Reaktionszeit neu bewertet
  const p = H.plan;
  const unterbrechbar = !p || p.art === 'lauf' || p.art === 'stehen';
  if(H.schritt >= H.naechste && unterbrechbar){
    H.naechste = H.schritt + partnerReaktion();
    const tE = performance.now();
    const neu = Z.nah ? null : partnerEntscheiden(P, Z);
    H.maxMs = Math.max(H.maxMs || 0, performance.now() - tE);
    H.plan = neu; H.planK = 0; H.planSt = {};
  }
  if(!H.plan){
    partner.text = Z.nah ? 'folgt dir' : (H.wartetAufLuecke ? 'wartet auf eine Lücke' : 'überlegt …');
    return {};
  }
  H.planK++;
  const e = H.plan.eingabe(H.planK, P, H.planSt);
  if(H.plan.fertig && H.plan.fertig(H.planK, P, H.planSt)){ H.plan = null; if(H.naechste > H.schritt + 3) H.naechste = H.schritt + partnerReaktion(); }
  const art = H.plan ? H.plan.art : 'stehen';
  partner.text = art === 'haken' ? 'Haken' : art === 'segeln' ? 'segelt' : art === 'sprung' ? 'springt' :
                 Math.abs(Z.x - P.x) >= PARTNER_AUFHOLEN ? 'holt auf' : 'folgt dir';
  return e;
}

// Plan-Eingaben -> echte Tasten
function partnerTastenAus(P, e){
  const halten = {}, druecken = [];
  if(e.dir < 0) halten.left = true;
  if(e.dir > 0) halten.right = true;
  if(e.springen || e.loslassen) druecken.push('jump');
  if(e.sprungHalten) halten.jump = true;
  if(!P.male && e.gleiten) halten.ability = true;
  if(P.male && e.haken) druecken.push('ability');
  if(e.use) druecken.push('use');
  if(e.pull) halten.pull = true;
  return {halten, druecken};
}
function partnerDenken(P, M){
  if(typeof deathState !== 'undefined' && deathState) return {halten: {}, druecken: []};
  return partnerTastenAus(P, partnerFolgen(P, M));
}
