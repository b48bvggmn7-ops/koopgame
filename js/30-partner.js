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
const PARTNER_AKTIONEN = ['left', 'right', 'jump', 'ability', 'pull', 'slack', 'use', 'padUse', 'dash'];
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
                 use: c('use'), padUse: c('padUse'), swimUp: c('pull'), swimDown: c('slack'), dash: c('dash')}
              : {left: c('left'), right: c('right'), jump: c('jump'), glide: c('ability'), use: c('use'), padUse: c('padUse'),
                 swimUp: c('pull'), swimDown: c('slack'), dash: c('dash')};
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
  partnerPads();
  const P = partnerFigur(), M = meineFigur();
  if(!P || !M) return;
  partnerHirn.schritt++; partnerHirn.mx = M.x;
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
  const fest = partner.modus === 'fest', warten = partner.modus === 'warten', aufgabe = partner.modus === 'aufgabe';
  const txt = (fest ? '⚠ ' : warten ? '✋ ' : aufgabe ? '🔧 ' : '🤖 ') + (partner.text || 'Partner');
  ctx.save();
  ctx.font = (fest ? 'bold 13px' : 'bold 12px') + ' sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(txt).width + 14;
  const x = Math.max(tw/2 + 4, Math.min(W - tw/2 - 4, sx));   // nie aus dem Bild
  ctx.globalAlpha = fest ? 0.95 : 0.8;
  ctx.fillStyle = fest ? 'rgba(150,60,10,.9)' : aufgabe ? 'rgba(25,60,40,.8)' : 'rgba(20,28,38,.72)';
  roundRect(x - tw/2, sy - 20, tw, 18, 8); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = fest ? '#fff3d6' : '#e8f1ff'; ctx.fillText(txt, x, sy - 11);
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
  if(e.code === 'KeyQ') partnerWarteOderKomm();
  if(e.code === 'KeyE') partnerAufgabeJetzt();
});

// ---------- Befehle an den Partner (Tasten Q/E, Controller L1/R1, Share = Rollen tauschen) ----------
// Q / L1: „Warte hier“ <-> „Komm her“. Warten: er bleibt stehen und übernimmt keine Aufgaben. Komm: er folgt wieder
// (auch wenn er festhing oder eine Aufgabe nicht klappte).
function partnerWarteOderKomm(){
  if(!partnerAktiv() || !partnerHirn) return;
  const H = partnerHirn, P = partnerFigur();
  if(partner.modus === 'warten' || partner.modus === 'fest'){ partner.modus = 'folgen'; H.gerufen = true; }
  else {
    partner.modus = 'warten'; H.warteX = P.x; H.warteY = P.y; H.plan = null; H.suche = null;
    if(H.aufgabe) H.aufgabe = null;
  }
  if(partner.modus === 'folgen'){ H.gescheitert = new Set(); H.aufgabeFehler = null; H.festSeit = H.schritt; H.bestAbst = undefined; }
}
// E / R1: „Mach deine Aufgabe jetzt“ – nächste Aufgabe in der Nähe sofort beginnen (auch ohne Zone)
function partnerAufgabeJetzt(){
  if(!partnerAktiv() || !partnerHirn) return;
  const H = partnerHirn;
  partner.modus = 'folgen'; H.gerufen = true; H.sofort = true; H.gescheitert = new Set(); H.aufgabeFehler = null;
  H.festSeit = H.schritt; H.bestAbst = undefined;
}
const partnerPadVor = [{}, {}];
function partnerPads(){
  let pads = [];
  try{ pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []; }catch(err){ pads = []; }
  for(let i = 0; i < 2; i++){
    const gp = pads[i]; if(!gp){ partnerPadVor[i] = {}; continue; }
    const b = n => !!(gp.buttons[n] && (gp.buttons[n].pressed || gp.buttons[n].value > 0.4));
    const jetzt = {warte: b(4), aufgabe: b(5), tausch: b(8)}, vor = partnerPadVor[i];
    if(jetzt.warte && !vor.warte) partnerWarteOderKomm();
    if(jetzt.aufgabe && !vor.aufgabe) partnerAufgabeJetzt();
    if(jetzt.tausch && !vor.tausch) partnerTauschen();
    partnerPadVor[i] = jetzt;
  }
}

partnerEinstellungLaden();

// Anzeige oben links/rechts, wenn der Partner an ist: wer bin ich, welche Tasten (aufgerufen aus updateHudKeys)
function partnerHud(set){
  if(!partnerAktiv()) return false;
  const ichAffe = partner.ich === 'm';
  // aktuelle Belegung beider Spieler (Optionen → Tasten belegen), z. B. „A/D oder ←/→“
  const t = a => [1, 2].map(n => tasteName(KEYSETS[n][a]).replace(/ /g, '&nbsp;')).join(' oder ');
  const zwei = (a, b) => [1, 2].map(n => tasteName(KEYSETS[n][a]).replace(/ /g, '&nbsp;') + '/' + tasteName(KEYSETS[n][b]).replace(/ /g, '&nbsp;')).join(' oder ');
  const meins = zwei('left', 'right') + ' bewegen · ' + t('jump') + ' springen · ' + t('ability') + ' ' + (ichAffe ? 'Haken' : 'Schirm') +
    ' · ' + t('use') + ' Hebel · ' + t('dash') + ' Dash' + (ichAffe ? ' · ' + zwei('pull', 'slack') + ' Seil' : '');
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
  U.mover = []; U.broeckel = []; U.stachelnMit = [];
  const moverVon = new Map();
  for(const s of solids){
    if(s.gone || !nah(s)) continue;
    if(s.type === 'oneway') U.stege.push(s);
    else if(s.type === 'moveplat'){   // bewegter Boden: als Stellvertreter, der in der Vorausrechnung mitfährt
      const v = {x: s.x, y: s.y, w: s.w, h: s.h, type: 'moveplat', orig: s};
      U.mover.push(v); U.feste.push(v); moverVon.set(s, v);
    }
    else if(s.type === 'crumble'){   // Bröckelboden: hält nach dem Betreten nur CRUMBLE_TRIGGER_MS (Stellvertreter mit Bruch-Zeitpunkt)
      const v = {x: s.x, y: s.y, w: s.w, h: s.h, type: 'crumble', orig: s, broeckel: true};
      U.broeckel.push(v); U.feste.push(v);
    }
    else U.feste.push(s);
  }
  for(const sp of spikes){
    // mitfahrende Stacheln (z. B. Stachelwand einer Jagd): fahren in der Vorausrechnung mit ihrem Boden mit
    if(sp.carrier && moverVon.has(sp.carrier)){ U.stachelnMit.push({v: moverVon.get(sp.carrier), dx: sp.x - sp.w/2 - sp.carrier.x, dy: sp.y - sp.h - sp.carrier.y, w: sp.w, h: sp.h}); continue; }
    if(Math.abs(sp.x - x) < 1100) U.stacheln.push({x: sp.x - sp.w/2, y: sp.y - sp.h, w: sp.w, h: sp.h});
  }
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
  for(const m of U.stachelnMit) if(partnerUeberlappt(box, {x: m.v.x + m.dx, y: m.v.y + m.dy, w: m.w, h: m.h}, 10)) return 'stacheln';
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
          onWall: P.onWall || 0, wallEntrySpeed: P.wallEntrySpeed || 0, lastWallJumpSide: P.lastWallJumpSide || 0, wjLock: P.wjInputLock || 0,
          t: 0, lastWallTouch: P.lastWallTouch !== undefined && P.lastWallTouch > -9000 ? -1e9 : -1e9,
          kurz: !!P.sprungKurzMoeglich, los: !!P.sprungLosgelassen, fling: !!P.ropeFling, standingOn: P.standingOn,
          hook: P.male && P.hookAttached ? {anchor: P.anchor, len: P.ropeLen, ziel: P.lianeZiel ?? P.ropeLen, max: P.ropeMax ?? P.ropeLen, dehn: P._dehn || 0, frei: P._lianeFrei} : null, lastAnchor: null, inWater: !!P.inWater,
          dashPunkte: P.dashPunkte || 0, dash: P.dash ? P.dash.zeit : 0, dashDx: P.dash ? P.dash.dx : 0};
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
function partnerWandBeruehrt(U, b, side){
  const px = side < 0 ? b.x - b.w/2 - 4 : b.x + b.w/2, py = b.y - b.h + 4, ph = b.h - 8;
  for(const s of U.feste) if(!s.gone && px < s.x + s.w && px + 4 > s.x && py < s.y + s.h && py + ph > s.y) return true;
  return false;
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
// Kante: Fuß nicht mehr auf dem Boden -> abrutschen (gleiche Regel wie kanteAbrutschen in js/32-neue-bewegung.js)
function partnerKanteAbrutschen(U, b, dir){
  const traegt = x => U.feste.some(s => !s.gone && s.y >= b.y - 2 && s.y <= b.y + 3 && x >= s.x && x <= s.x + s.w) ||
                      U.stege.some(s => s.y >= b.y - 2 && s.y <= b.y + 3 && x >= s.x && x <= s.x + s.w);
  if(traegt(b.x - KANTE_FUSS) || traegt(b.x + KANTE_FUSS)) return;
  const halb = b.w/2 - 0.5, k = traegt(b.x - halb) ? 1 : traegt(b.x + halb) ? -1 : 0;
  if(!k || dir === -k) return;
  if(Math.sign(b.vx) === k && Math.abs(b.vx) >= KANTE_RUTSCH) return;
  const nx = b.x + k*KANTE_RUTSCH, box = {x: nx - b.w/2, y: b.y - b.h, w: b.w, h: b.h};
  if(!U.feste.some(s => !s.gone && box.x < s.x + s.w && box.x + box.w > s.x && box.y < s.y + s.h && box.y + box.h > s.y)) b.x = nx;
}
// rechnet das Spiel den Affen am Haken mit Liane 2 (js/32 lianeNeu)? Dann rechnet die Vorausschau genauso
const partnerLiane2 = () => LIANE_HALTEN && !window.hakenTippen && !window.liane2Aus && !window.partnerSimAlt;   // partnerSimAlt: nur zum Vergleichen (Tests)
// ein Schritt: e = {dir, springen (neu drücken), sprungHalten, gleiten, haken (neu drücken), loslassen}
let partnerSimZaehler = 0;   // gerechnete Vorausschritte (Budget je Entscheidung: PARTNER_BUDGET)
function partnerSimSchritt(U, b, e){
  partnerSimZaehler++;
  const dir = e.dir || 0;
  if(b.male && e.haken && !b.hook){
    const t = partnerHakenZiel(b);
    if(t && partnerLiane2() && !b.grounded && lianeUeberHaken(b, t)){ /* über dem Haken: das Spiel greift erst später (js/32) */ }
    else if(t){ b.hook = {anchor: t, len: Math.hypot(t.x - b.x, t.y - (b.y - b.h*0.6))}; b.luft = false;
      if(partnerLiane2()){   // wie lianeGriffPruefen (js/32): in der Luft gibt die Liane bis zur Reichweite nach (höchstens bis über Boden/Gefahr)
        const d = b.hook.len; b.hook.max = Math.max(d, hookRange(t)); b.hook.dehn = 0;
        if(b.grounded) b.hook.ziel = b.hook.len = d;
        else { const frei = lianeFreiUnten(t, b); b.hook.ziel = Math.max(HOOK_MIN_LEN, Math.min(b.hook.max, frei)); b.hook.len = Math.max(d, b.hook.ziel); b.hook.frei = frei + LIANE2_FANG_MAX; }
      } }
  }
  const liane2 = b.hook && !b.grounded && partnerLiane2();
  // Dash (js/32 dashStarten/dashSchritt): nur waagerecht, feste Strecke ohne Schwerkraft, danach halbes Tempo
  if(e.dash && !b.hook && !b.dash && b.dashPunkte > 0 && !b.inWater){ b.dashPunkte--; b.dash = DASH_DAUER; b.dashDx = dir || Math.sign(b.vx) || 1; b.kurz = false; }
  if(b.dash){
    b.vx = b.dashDx*DASH_TEMPO; b.vy = 0;
  } else if(liane2){   // Liane 2 (js/32 lianeKern): festes Pendel wie im Spiel
    const S = {hx: b.x, hy: b.y - b.h*0.6, vx: b.vx, vy: b.vy, len: b.hook.len, ziel: b.hook.ziel, max: b.hook.max, dehn: b.hook.dehn, frei: b.hook.frei};
    lianeKern(S, b.hook.anchor, dir, !!e.pull, false);
    b.vx = S.vx; b.vy = S.vy; b.hook.len = S.len; b.hook.ziel = S.ziel; b.hook.dehn = S.dehn; b.gezogen = false;
    if(e.loslassen){ b.lastAnchor = b.hook.anchor; b.hook = null; b.vy += HOOK_RELEASE_BOOST; b.fling = true; }
  } else if(b.hook){
    b.vy += GRAVITY*0.9;
    if(dir !== 0 && b.vx*dir > -0.3) b.vx += dir*SWING_PUSH;
    const lenVor = b.hook.len;
    if(e.pull) b.hook.len = Math.max(HOOK_MIN_LEN, b.hook.len - ROPE_PULL_SPEED);
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
    b.gezogen = b.hook.len < lenVor;
    if(e.loslassen){ b.lastAnchor = b.hook.anchor; b.hook = null; b.vy += HOOK_RELEASE_BOOST; b.fling = true; }
  } else {
    const control = b.grounded ? 1 : AIR_CONTROL;
    if(b.grounded || b.onWall) b.fling = false;
    if(b.wjLock > 0){ b.wjLock -= 16.6; b.vx *= FRICTION_AIR; }   // nach dem Wandsprung kurz keine Lenkung (wie im Spiel)
    else {
      const vxVor = b.vx;
      b.vx += dir*MOVE_SPEED*0.35*control;
      if(b.grounded && dir !== 0 && Math.abs(b.vx) >= MOVE_SPEED*0.9 && Math.sign(b.vx) === dir) b.vx += dir*SPRINT_ACCEL;
      if(dir === 0){ b.vx *= b.grounded ? FRICTION_GROUND : (b.fling ? ROPE_FLING_DRAG : FRICTION_AIR); if(Math.abs(b.vx) < 0.05) b.vx = 0; }
      const vmax = b.fling ? Math.min(ROPE_FLING_MAX, Math.max(SPRINT_MAX_SPEED, Math.abs(vxVor))) : SPRINT_MAX_SPEED;
      b.vx = Math.max(-vmax, Math.min(vmax, b.vx));
    }
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
    // Wand berühren / Wandsprung (gleiche Regeln wie updatePlayer)
    b.t = (b.t || 0) + 16.6;
    const wl = !b.grounded && partnerWandBeruehrt(U, b, -1), wr = !b.grounded && partnerWandBeruehrt(U, b, 1);
    if(wl || wr){ const side = wl ? -1 : 1; if(!b.onWall) b.wallEntrySpeed = Math.abs(b.vx); b.onWall = side; b.lastWallTouch = b.t; }
    else b.onWall = 0;
    if(e.springen && !b.grounded && b.t - (b.lastWallTouch === undefined ? -1e9 : b.lastWallTouch) <= WALL_JUMP_BUFFER){
      const side = b.onWall || (partnerWandBeruehrt(U, b, -1) ? -1 : partnerWandBeruehrt(U, b, 1) ? 1 : 0);
      if(side !== 0 && dir === -side && side !== b.lastWallJumpSide && (b.wallEntrySpeed || 0) > MIN_WALLJUMP_SPEED){
        const mom = Math.min(1, (b.wallEntrySpeed || 0)/SPRINT_MAX_SPEED);
        b.vy = WALL_JUMP_VY_MIN + (WALL_JUMP_VY_MAX - WALL_JUMP_VY_MIN)*mom;
        b.vx = (WALL_JUMP_VX_MIN + (WALL_JUMP_VX_MAX - WALL_JUMP_VX_MIN)*mom)*dir;
        b.lastWallJumpSide = side; b.lastWallTouch = -1e9; b.glideTimer = 0; b.wjLock = 260; b.kurz = false;
      }
    }
    if(e.springen && b.grounded){ b.vy = JUMP_V; b.grounded = false; b.glideTimer = 0; b.kurz = true; b.los = false; }
    if(b.kurz){
      if(b.vy >= 0 || gleitet) b.kurz = false;
      else { if(!e.sprungHalten) b.los = true; if(b.los && b.vy < JUMP_CUT_VY) b.vy = JUMP_CUT_VY + (b.vy - JUMP_CUT_VY)*JUMP_CUT_SMOOTH; }
    }
  }
  if(U.mover.length) partnerMoverSchritt(U, b);   // (im Spiel fahren die Böden nach der Figur – Unterschied ≤ 1 Schritt)
  U.simK = (U.simK || 0) + 1;
  for(const v of U.broeckel) if(!v.gone && v.bricht <= U.simK) v.gone = true;

  const warBoden = b.grounded, fallVy = b.vy;
  b.grounded = false; b.standingOn = null; b.wand = false;
  b.x += b.vx; partnerKollision(U, b, 'x');
  b.y += b.vy; partnerKollision(U, b, 'y');
  if(b.dash && --b.dash === 0){ b.vx *= DASH_BEHALTEN; b.vy *= DASH_BEHALTEN; }
  if(b.standingOn && b.standingOn.broeckel && b.standingOn.bricht === Infinity) b.standingOn.bricht = U.simK + CRUMBLE_TRIGGER_MS/16.6;
  if(!b.hook && !warBoden && fallVy > 0 && b.vy >= 0){   // Sprungpilz (elemente/sprungpilz.js)
    for(const p of bouncers) if(Math.abs(b.x - p.x) < 14 + b.w/2 && b.y > p.y - 14 && b.y <= p.y + 1){ b.vy = BOUNCE_V; b.grounded = false; b.glideTimer = 0; break; }
  }
  if(b.hook){ if(b.grounded && b.luft) b.hook = null; else if(!b.grounded) b.luft = true; }
  if(b.hook && !b.grounded && !partnerLiane2()){   // Seilspannung wie updateRopeTension (Gummi-Zug, gibt bei starker Dehnung nach)
    const A = b.hook.anchor, dx = b.x - A.x, dy = (b.y - b.h*0.6) - A.y, dist = Math.hypot(dx, dy) || 1, over = dist - b.hook.len;
    if(over > 3){ b.vx -= dx/dist*over*0.05; b.vy -= dy/dist*over*0.05; }
    if(over > ROPE_SNAP_STRETCH) b.hook.len = dist - ROPE_SNAP_STRETCH;
  }
  if(b.hook && b.gezogen){   // beim Ranziehen kein Schwung Richtung Haken (wie im Spiel)
    const hx = b.x - b.hook.anchor.x, hy = (b.y - b.h*0.6) - b.hook.anchor.y, dd = Math.hypot(hx, hy) || 1, ux = hx/dd, uy = hy/dd;
    const innen = -(b.vx*ux + b.vy*uy); if(innen > 0){ b.vx += ux*innen; b.vy += uy*innen; }
  }
  if(b.grounded && !b.hook) partnerKanteAbrutschen(U, b, dir);   // wie kanteAbrutschen (js/32-neue-bewegung.js)
  if(b.grounded){ b.glideTimer = 0; b.wjLock = 0; b.lastWallJumpSide = 0; }
  // „gemeinsamer Bildschirm“ (keepTogether in 09-kamera.js): höchstens MAX_SEPARATION von mir weg (ich stehe still gedacht)
  if(partnerHirn && partnerHirn.mx !== undefined){
    const mx = partnerHirn.mx;
    if(b.x > mx + MAX_SEPARATION){ b.x = mx + MAX_SEPARATION; if(b.vx > 0) b.vx = 0; }
    if(b.x < mx - MAX_SEPARATION){ b.x = mx - MAX_SEPARATION; if(b.vx < 0) b.vx = 0; }
  }
  const decke = -CEILING_MARGIN - SKY_ROOM;
  if(b.y - b.h < decke){ b.y = b.h + decke; if(b.vy < 0) b.vy = 0; }
}

// Plan k Schritte vorausrechnen. plan(k, b) liefert die Eingaben, plan.fertig(k, b) beendet ihn.
// Ergebnis: {tod (Grund), k, b (Endzustand), boden (steht am Ende), weg (Punkte)}
// bewegte Böden für eine Vorausrechnung auf ihren jetzigen Stand setzen (und ggf. vorspulen)
function partnerMoverStart(U, vor){
  for(const v of U.mover){ const s = v.orig; v.x = s.x; v.y = s.y; v.dir = s.moveDir; v.aktiv = !!s.tripActive; }
  for(const v of U.broeckel){ const s = v.orig; v.bricht = s.triggered ? (CRUMBLE_TRIGGER_MS - s.timer)/16.6 - (vor || 0) : Infinity; v.gone = v.bricht <= 0; }
  U.simK = 0;
  for(let i = 0; i < (vor || 0); i++) partnerMoverSchritt(U, null);
}
// ein Schritt wie updateMovingPlatforms; nimmt den Körper b mit, wenn er darauf steht
function partnerMoverSchritt(U, b){
  for(const v of U.mover){
    if(!v.aktiv) continue;
    const s = v.orig, sp = s.speed || MOVE_PLAT_SPEED;
    const tx = v.dir === 1 ? s.targetX : s.startX, ty = v.dir === 1 ? s.targetY : s.startY;
    const dx = tx - v.x, dy = ty - v.y, dist = Math.hypot(dx, dy);
    let sx, sy;
    if(dist <= sp){ sx = dx; sy = dy; if(s.einmal) v.aktiv = false; else v.dir *= -1; } else { sx = dx/dist*sp; sy = dy/dist*sp; }
    const drauf = b && b.grounded && b.standingOn === v;
    v.x += sx; v.y += sy;
    if(drauf){ b.x += sx; b.y += sy; }
  }
}
function partnerSim(U, P, plan, n, kStart, stStart, vor){
  const b = partnerKoerper(P), st = stStart ? Object.assign({}, stStart) : {};
  partnerMoverStart(U, vor);
  if(P.onWall) b.lastWallTouch = 0;
  for(let k = (kStart || 0) + 1; k <= n; k++){
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
      const weiter = (b.x - zielX)*d < -(4 + Math.abs(b.vx)*FRICTION_GROUND/(1 - FRICTION_GROUND));   // rechtzeitig loslassen (Ausrollen)
      const puls = !gemuetlich || (k % 25) < 25*PARTNER_GEMUETLICH;   // kurz lupfen: kein Sprint-Tempo
      return {dir: weiter && puls ? d : 0};
    },
    fertig: (k, b) => ((b.x - zielX)*d >= -(6 + Math.abs(b.vx)*4) && Math.abs(b.vx) < 0.6 && b.grounded) || k > 240};
}
// springen bei x = jx (Richtung d), Sprungtaste halt Schritte halten, in der Luft bis stopX lenken, Schweinchen: segeln
// zurueckX (optional): erst bis dorthin zurücklaufen (Anlauf), dann vorwärts
function planAnlauf(d, zurueckX, b, st){
  if(zurueckX === undefined || st.anlauf) return null;
  if((b.x - zurueckX)*d > 4) return {dir: -d};
  st.anlauf = true; return null;
}
function planSprung(d, jx, halt, stopX, gleit, zurueckX){
  return {art: gleit ? 'segeln' : 'sprung', d,
    eingabe(k, b, st){
      const a = planAnlauf(d, zurueckX, b, st); if(a) return a;
      if(!st.ab){
        if(b.grounded && (b.x - jx)*d >= 0){ st.ab = true; st.k0 = k; return {dir: d, springen: true, sprungHalten: true}; }
        return {dir: (b.x - jx)*d < 0 ? d : 0};
      }
      const lenken = (b.x - stopX)*d < 0 ? d : 0;
      return {dir: lenken, sprungHalten: k - st.k0 < halt, gleiten: gleit && b.vy > 0};
    },
    fertig: (k, b, st) => (st.ab && k - st.k0 > 3 && b.grounded) || k > 400 || (!st.ab && k > 200)};
}
// Sprung + Luft-Dash über eine breite Grube (ohne Haken): abspringen bei jx, dashen, sobald vy > dashVy
function planSprungDash(d, jx, dashVy, zurueckX){
  return {art: 'sprung', d,
    eingabe(k, b, st){
      const a = planAnlauf(d, zurueckX, b, st); if(a) return a;
      if(!st.ab){
        if(b.grounded && (b.x - jx)*d >= 0){ st.ab = true; st.k0 = k; return {dir: d, springen: true, sprungHalten: true}; }
        return {dir: (b.x - jx)*d < 0 ? d : 0};
      }
      if(!st.dash && !b.grounded && b.vy > dashVy){ st.dash = true; return {dir: d, dash: true}; }
      return {dir: d, sprungHalten: k - st.k0 < 10};
    },
    fertig: (k, b, st) => (st.ab && k - st.k0 > 3 && b.grounded && !b.dash) || k > 400 || (!st.ab && k > 200)};
}
const partnerDashDa = b => (b.dashPunkte || 0) > 0 && typeof dashKannStarten === 'function' && !(typeof dashAusHier === 'function' && dashAusHier());
// Affe: springen bei jx, Haken greifen, schwingen, loslassen hinter dem Haken; weitere Haken möglich
function planHaken(d, jx, stopX, ziehen, zurueckX){
  return {art: 'haken', d,
    eingabe(k, b, st){
      const a = planAnlauf(d, zurueckX, b, st); if(a) return a;
      if(!st.ab){
        if(b.grounded && (b.x - jx)*d >= 0){ st.ab = true; st.k0 = k; return {dir: d, springen: true, sprungHalten: true}; }
        return {dir: (b.x - jx)*d < 0 ? d : 0};
      }
      const A = partnerAnker(b);
      if(A){
        if(st.anK === undefined || st.anAnker !== A){ st.anK = k; st.anAnker = A; }
        const zieht = k - st.anK < (ziehen || 0);   // erst ein Stück ranziehen (hohe Simse)
        if(!zieht && (b.x - A.x)*d > 20 && b.vy < 0 && b.vx*d > 1){ st.letzter = A; return {dir: d, loslassen: true}; }
        return {dir: d, pull: zieht};
      }
      const e = {dir: (b.x - stopX)*d < 0 ? d : 0, sprungHalten: k - st.k0 < 10};
      if(b.vy > -4 && !b.grounded && (!st.gegriffenK || k - st.gegriffenK > 6)){
        const t = partnerHakenZiel(b);
        if(t && t !== st.letzter && (t.x - b.x)*d > -120){ e.haken = true; st.gegriffenK = k; }
      }
      return e;
    },
    fertig: (k, b, st) => (st.ab && k - st.k0 > 3 && b.grounded && !partnerAnker(b)) || k > 500 || (!st.ab && k > 200)};
}
// Kamin / Wand hinauf: abspringen, an der Wand jeweils weg-drücken + springen (wie der Koop-Bot), nach `kicks`
// Wandsprüngen in Richtung `aus` aussteigen (Schweinchen segelt beim Fallen)
function planKamin(d0, kicks, aus){
  return {art: 'kamin', d: aus,
    eingabe(k, b, st){
      if(st.n === undefined){ st.n = 0; st.dir = d0; }
      if(!st.ab){
        if(b.grounded && k > 1){ st.ab = true; st.k0 = k; return {dir: st.dir, springen: true, sprungHalten: true}; }
        return {dir: st.dir};
      }
      if(st.n >= kicks) return {dir: aus, gleiten: !b.male && b.vy > 0};
      if(b.onWall){
        st.dir = -b.onWall;
        if(!st.kick || k - st.kick > 3){ st.kick = k; st.n++; return {dir: st.dir, springen: true, sprungHalten: true}; }
      }
      return {dir: st.dir, sprungHalten: true};
    },
    fertig: (k, b, st) => (st.ab && k - st.k0 > 5 && b.grounded) || k > 600};
}
// Affe in der Luft: nächsten Haken greifen, (ranziehen,) schwingen, in Richtung dir loslassen
function planLuftHaken(dir, ziehen){
  return {art: 'haken', d: dir,
    eingabe(k, b, st){
      const A = partnerAnker(b);
      if(A){
        if(st.anK === undefined){ st.anK = k; }
        const zieht = k - st.anK < (ziehen || 0);
        if(!zieht && (b.x - A.x)*dir > 20 && b.vy < 0 && b.vx*dir > 1){ st.los = true; return {dir, loslassen: true}; }
        return {dir, pull: zieht};
      }
      if(!st.gegriffen && !b.grounded && partnerHakenZiel(b)){ st.gegriffen = true; return {dir, haken: true}; }
      return {dir};
    },
    fertig: (k, b, st) => (b.grounded && !partnerAnker(b) && k > 2) || k > 500};
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
const partnerAbstand = (x, y, Z) => Z.id === 'flucht' ? Math.abs(x - Z.x) : Math.abs(x - Z.x) + 1.6*Math.max(0, y - Z.y) + 0.6*Math.max(0, Z.y - y);

// ---------- Entscheiden: alle sinnvollen Pläne vorausrechnen, den sichersten mit dem meisten Fortschritt nehmen ----------
// Als Generator: rechnet je Spielschritt höchstens PARTNER_BUDGET Vorausschritte und macht im nächsten Schritt weiter
// (er „überlegt“ dann ein paar Schritte lang – wie ein Mensch); insgesamt höchstens PARTNER_BUDGET_GESAMT.
function* partnerSuche(P, Z){
  const H = partnerHirn;
  let U = partnerUmgebung(P.x);
  const jetzt = partnerAbstand(P.x, P.y, Z), d = Math.sign(Z.x - P.x) || 1;
  const gemuetlich = Math.abs(Z.x - P.x) < PARTNER_AUFHOLEN;
  const kandidaten = [], gruende = new Set();
  let gesamt = 0;
  // ein Plan wird geprüft; ist das Schritt-Budget aufgebraucht, geht es im nächsten Spielschritt weiter
  function* pruefe(plan, n, extra){
    if(gesamt + partnerSimZaehler > PARTNER_BUDGET_GESAMT) return;
    if(partnerSimZaehler > PARTNER_BUDGET){ gesamt += partnerSimZaehler; yield; partnerSimZaehler = 0; U = partnerUmgebung(P.x); }
    const r = partnerSim(U, P, plan, n);
    if(r.tod){ gruende.add(r.tod); return; }
    if(!r.boden) return;
    kandidaten.push({plan, wert: partnerAbstand(r.x, r.y, Z) + (extra || 0)});
  }
  const gut = () => kandidaten.some(c => c.wert < PARTNER_ABSTAND_LOCKER + 30);
  if(P.grounded || P.inWater){
    // laufen: bis zum Ziel oder ein Stück (bis vor eine Kante)
    for(const zx of [Z.x, P.x + d*40, P.x + d*80, P.x + d*130, P.x + d*200]){
      if((zx - P.x)*d <= 0 || (zx - Z.x)*d > 0) continue;
      yield* pruefe(planLauf(d, zx, gemuetlich), 240);
    }
    const bestLauf = kandidaten.reduce((m, c) => Math.min(m, c.wert), Infinity);
    // springen / segeln / Haken nur, wenn Laufen nicht (fast) bis zum Ziel bringt – stufenweise, damit es schnell bleibt
    if(bestLauf > PARTNER_ABSTAND_LOCKER + 10){
      yield* pruefe(planSprung(d, P.x, 10, P.x + d*20, false), 200, 15);   // Stufe direkt vor mir
      for(let i = 0; i <= 8; i++) for(const halt of [10, 4]) for(const stopX of [d*Infinity, Z.x])
        yield* pruefe(planSprung(d, P.x + d*i*16, halt, stopX, false), 200, 15);
      if(!gut() && !P.male) for(let i = 0; i <= 8; i++) for(const stopX of [d*Infinity, Z.x])
        yield* pruefe(planSprung(d, P.x + d*i*16, 10, stopX, true), 360, 25);
      const hakenNah = P.male && hooks.some(h => Math.abs(h.x - P.x) < 700);
      if(!gut() && hakenNah) for(const ziehen of [0, 30]) for(let i = 0; i <= 8; i += 2) for(const stopX of [d*Infinity, Z.x])
        yield* pruefe(planHaken(d, P.x + d*i*16, stopX, ziehen), 420, 40);
      if(!gut() && partnerDashDa(P)) for(const i of [0, 4, 8]) yield* pruefe(planSprungDash(d, P.x + d*i*16, 1), 300, 30);
      // mit Anlauf (z. B. direkt vor einer Wand stehend)
      for(const z of [100, 200]){
        if(gut()) break;
        const zx = P.x - d*z;
        for(let i = 2; i <= z/16 + 2; i += 2){
          const jx = zx + d*i*16;
          if(hakenNah) for(const ziehen of [30, 0]) yield* pruefe(planHaken(d, jx, d*Infinity, ziehen, zx), 460, 45);
          yield* pruefe(planSprung(d, jx, 10, d*Infinity, false, zx), 260, 20);
          if(!P.male) yield* pruefe(planSprung(d, jx, 10, d*Infinity, true, zx), 400, 30);
        }
      }
    }
  } else {
    for(const dir of [d, 0, -d]) for(const gl of (P.male ? [false] : [false, true])) yield* pruefe(planLuft(dir, gl), 300, dir === d ? 0 : 5);
  }
  // Stehen bleiben ist immer eine Möglichkeit (wenn es sicher ist)
  const stehen = partnerSim(U, P, planStehen(30), 30);
  H.maxSim = Math.max(H.maxSim || 0, gesamt + partnerSimZaehler);
  kandidaten.sort((a, b) => a.wert - b.wert);
  const best = kandidaten[0];
  H.wartetAufLuecke = [...gruende].some(g => g === 'flamme' || g === 'pfeil' || g === 'presse' || g === 'fels');
  if(stehen.tod && best) return best.plan;   // hier stehen bleiben wäre gefährlich -> irgendein sicherer Plan
  if(best && best.wert < jetzt - 12) return best.plan;
  if(stehen.tod){   // hier ist es gleich gefährlich: ausweichen bzw. fliehen (auch an mir vorbei, z. B. vor einer Stachelwand)
    for(const w of [60, 120, 180, 320, 560]) for(const dd of [-d, d]){
      const r = partnerSim(U, P, planLauf(dd, P.x + dd*w, false), 240);
      if(!r.tod && r.boden) return planLauf(dd, P.x + dd*w, false);
    }
    for(const dd of [d, -d]) for(let i = 0; i <= 8; i += 2) for(const gl of (P.male ? [false] : [false, true])){
      const plan = planSprung(dd, P.x + dd*i*20, 10, dd*Infinity, gl);
      const r = partnerSim(U, P, plan, 300);
      if(!r.tod && r.boden) return plan;
    }
  }
  return null;
}

// ---------- Wegsuche über mehrere Etappen (Umwege, Kamine, erst zurück und dann hinauf) ----------
// Bestensuche über Standplätze: von jedem Platz aus werden Pläne in BEIDE Richtungen vorausgerechnet (laufen, springen,
// segeln, Haken, Kamin); jeder sichere Landeplatz ist ein neuer Platz. Gefahren im Takt zählen mit der Zeit, zu der er
// dort wäre. Ergebnis: Liste von Plänen, die nacheinander ausgeführt werden. Wie partnerSuche über mehrere Spielschritte.
function partnerPlatz(x, y, P, t){ return {x, y, vx: 0, vy: 0, w: P.w, h: P.h, male: P.male, grounded: true, glideTimer: 0, t, dashPunkte: P.dashPunkte || 0}; }
function partnerMakroPlaene(platz, U){
  const L = [], x = platz.x;
  for(const d of [1, -1]){
    for(const w of [60, 140, 260, 420]) L.push([planLauf(d, x + d*w, false), 260]);
    for(let i = 0; i <= 6; i++) for(const halt of [10, 4]) L.push([planSprung(d, x + d*i*20, halt, d*Infinity, false), 200]);
    L.push([planSprung(d, x, 10, x + d*30, false), 200]);
    if(!platz.male) for(let i = 0; i <= 6; i += 2) L.push([planSprung(d, x + d*i*20, 10, d*Infinity, true), 380]);
    if(partnerDashDa(platz)) for(const i of [0, 4]) L.push([planSprungDash(d, x + d*i*20, 1), 300]);   // wenige Varianten: Suche bleibt schnell
    if(platz.male && hooks.some(h => Math.abs(h.x - x) < 500)) for(let i = 0; i <= 6; i += 2) for(const z of [0, 30]) L.push([planHaken(d, x + d*i*20, d*Infinity, z), 460]);
    // Kamin/Wand: nur wenn in dieser Richtung eine Wand nah ist
    const probe = {x: x + d*60, y: platz.y - 40, w: 4, h: 4};
    if(U.feste.some(s => !s.gone && probe.x < s.x + s.w + 80 && probe.x + 4 > s.x - 80 && s.y < platz.y - 40 && s.y + s.h > platz.y - 120))
      for(const kicks of [1, 2, 3, 4, 6]) for(const aus of [d, -d]) L.push([planKamin(d, kicks, aus), 520]);
  }
  return L;
}
function* partnerWegSuche(P, Z){
  const H = partnerHirn;
  const start = partnerPlatz(P.x, P.y, P, 0);
  const schluessel = (x, y) => Math.round(x/24) + ',' + Math.round(y/20);
  const gesehen = new Set([schluessel(start.x, start.y)]);
  const offen = [{platz: start, kosten: 0, plaene: []}];
  const ziel = (x, y) => Math.abs(x - Z.x) <= Math.max(24, Z.tol || 0) && Math.abs(y - Z.y) <= 30;
  const schaetz = (x, y) => (Math.abs(x - Z.x) + 2*Math.abs(y - Z.y))/MOVE_SPEED;
  let gesamt = 0, expandiert = 0, bestes = null;
  while(offen.length && expandiert < PARTNER_WEG_KNOTEN && gesamt + partnerSimZaehler < PARTNER_WEG_BUDGET){
    offen.sort((a, b) => (a.kosten + schaetz(a.platz.x, a.platz.y)) - (b.kosten + schaetz(b.platz.x, b.platz.y)));
    const n = offen.shift(); expandiert++;
    if(ziel(n.platz.x, n.platz.y)){ bestes = n; break; }
    const U = partnerUmgebung(n.platz.x);
    for(const [plan, steps] of partnerMakroPlaene(n.platz, U)){
      if(partnerSimZaehler > PARTNER_BUDGET){ gesamt += partnerSimZaehler; yield; partnerSimZaehler = 0; }
      const r = partnerSimZeit(U, n.platz, plan, steps, n.platz.t);
      if(r.tod || !r.boden) continue;
      const kx = r.x, ky = r.y, key = schluessel(kx, ky);
      if(gesehen.has(key)) continue;
      gesehen.add(key);
      const kind = {platz: partnerPlatz(kx, ky, P, n.platz.t + r.k), kosten: n.kosten + r.k + 20, plaene: n.plaene.concat([{plan, x: kx, y: ky}])};
      if(ziel(kx, ky)){ bestes = kind; offen.length = 0; break; }
      offen.push(kind);
    }
  }
  H.wegStat = {expandiert, gesamt: gesamt + partnerSimZaehler, gefunden: !!bestes};
  return bestes ? bestes.plaene : null;
}
// Vorausrechnen ab einem Platz, Gefahren-Zeit ab t0 Schritten in der Zukunft
function partnerSimZeit(U, platz, plan, n, t0){
  if(!t0) return partnerSim(U, platz, plan, n);
  const alt = partnerGefahr;
  partnerGefahr = (U2, b, k) => alt(U2, b, k + t0);
  try{ return partnerSim(U, platz, plan, n, 0, null, t0); } finally { partnerGefahr = alt; }
}

// beim Überlegen stehen bleiben – aber nur, wenn die Stelle sicher bleibt (Bröckelboden, Falle, Presse …)
function partnerStehSicher(P, Z){
  const H = partnerHirn;
  if(H.schritt % 4) return {};
  const U = partnerUmgebung(P.x);
  if(!partnerSim(U, P, planStehen(45), 45).tod) return {};
  const n = partnerNotfall(U, P, Z);
  H.suche = null; H.wegSuche = null; H.weg = null;
  if(n){ H.plan = n; H.planK = 0; H.planSt = {}; }
  return {};
}
// sicherer Ausweich-Plan, wenn der laufende Plan gefährlich wird (in der Luft: lenken/segeln/Haken; am Boden: stehen)
function partnerNotfall(U, P, Z){
  const d = Math.sign(Z.x - P.x) || 1, liste = [];
  if(P.grounded) liste.push(planStehen(20), planLauf(-d, P.x - d*60, false), planLauf(d, P.x + d*40, false));
  for(const dir of [d, 0, -d]){ liste.push(planLuft(dir, false)); if(!P.male) liste.push(planLuft(dir, true)); }
  if(P.male && !P.grounded) for(const dir of [d, -d]) for(const z of [0, 30]) liste.push(planLuftHaken(dir, z));
  let best = null, bw = Infinity;
  for(const plan of liste){
    const r = partnerSim(U, P, plan, 300);
    if(r.tod || !r.boden) continue;
    const w = partnerAbstand(r.x, r.y, Z);
    if(w < bw){ bw = w; best = plan; }
  }
  return best;
}

// ---------- Jeder Schritt: Plan ausführen, nach der Reaktionszeit neu entscheiden ----------
// Zu einem Ziel Z = {x, y, nah, id} kommen (Folgen oder Aufgabe). Liefert die Eingaben dieses Schritts; merkt, wenn er
// PARTNER_FEST Schritte lang nicht näher kommt (dann „hänge fest“ und warten).
function partnerNavi(P, Z, folgeText){
  const H = partnerHirn;
  // weit weg gesprungen (Tod/Checkpoint/Teleporter): sofort neu überlegen
  if(H.letztX !== undefined && Math.hypot(P.x - H.letztX, P.y - H.letztY) > 60){ H.plan = null; H.naechste = H.schritt; }
  H.letztX = P.x; H.letztY = P.y;
  // neues Ziel (z. B. Aufgabe beginnt/endet): sobald der laufende Sprung vorbei ist, neu entscheiden
  if(H.zielId !== Z.id){ H.zielId = Z.id; H.naechste = Math.min(H.naechste, H.schritt + partnerReaktion()); H.bestAbst = undefined; }
  // Fortschritt messen (hängt er fest?)
  const abst = partnerAbstand(P.x, P.y, Z);
  if(Z.nah || H.bestAbst === undefined || abst < H.bestAbst - 20){ H.bestAbst = abst; H.festSeit = H.schritt; }
  if(partner.modus === 'fest'){
    // wartet, bis ich ihn rufe (Q), tausche (V) oder selbst zu ihm komme
    if(Z.nah && Z.id === 'folgen' || H.gerufen){ partner.modus = 'folgen'; H.festSeit = H.schritt; H.bestAbst = abst; H.aufgabeFehler = null; H.gerufen = false; }
    else { partner.text = partnerFestText(); return {}; }
  }
  if(!Z.nah && H.schritt - H.festSeit > PARTNER_FEST && (P.grounded || P.inWater)){
    partner.modus = 'fest'; H.festZielX = Z.x; H.festZielY = Z.y; H.plan = null;
    if(typeof partnerAufgabeAbbrechen === 'function') partnerAufgabeAbbrechen();
    partner.text = partnerFestText(); return {};
  }
  // Weg über mehrere Etappen (partnerWegSuche): Etappe für Etappe ausführen; ist er vom Kurs ab, neu überlegen
  if(H.weg && (Z.nah || H.weg.zielId !== Z.id || Math.hypot(Z.x - H.weg.zx, Z.y - H.weg.zy) > 120)) H.weg = null;
  if(H.weg && !H.plan){
    const seg = H.weg.plaene[H.weg.i - 1];
    if(seg && (Math.abs(P.x - seg.x) > 40 || Math.abs(P.y - seg.y) > 30)) H.weg = null;
    else if(H.weg.i >= H.weg.plaene.length) H.weg = null;
    else { H.plan = H.weg.plaene[H.weg.i++].plan; H.planK = 0; H.planSt = {}; H.festSeit = H.schritt; }
  }
  if(H.wegSuche){
    if(H.wegSuche.zielId !== Z.id || Z.nah){ H.wegSuche = null; }
    else {
      const tE = performance.now();
      partnerSimZaehler = 0;
      const r = H.wegSuche.gen.next();
      H.maxMs = Math.max(H.maxMs || 0, performance.now() - tE);
      if(r.done){
        const zs = H.wegSuche; H.wegSuche = null;
        if(r.value && r.value.length){ H.weg = {plaene: r.value, i: 0, zielId: Z.id, zx: Z.x, zy: Z.y}; H.festSeit = H.schritt; return {}; }
        H.wegFehl = {x: zs.zx, y: zs.zy, t: H.schritt};
      } else { partner.text = 'sucht einen Weg …'; return partnerStehSicher(P, Z); }
    }
  }
  // laufender Plan: Sprünge/Haken werden nicht unterbrochen, Laufen/Stehen nach der Reaktionszeit neu bewertet
  const p = H.plan;
  const unterbrechbar = !H.weg && (!p || p.art === 'lauf' || p.art === 'stehen');
  if(H.schritt >= H.naechste && unterbrechbar && !H.suche){
    H.naechste = H.schritt + partnerReaktion();
    if(Z.nah){ H.plan = null; }
    else { H.suche = partnerSuche(P, Z); H.sucheZiel = Z.id; }
  }
  if(H.suche){
    if(H.sucheZiel !== Z.id){ H.suche = null; }   // Ziel gewechselt: Überlegung verwerfen
    else {
      const tE = performance.now();
      partnerSimZaehler = 0;
      const r = H.suche.next();
      H.maxMs = Math.max(H.maxMs || 0, performance.now() - tE);
      if(r.done){
        H.suche = null; H.plan = r.value; H.planK = 0; H.planSt = {};
        // vor Ort geht nichts voran: Wegsuche über mehrere Etappen (nicht ständig dasselbe vergeblich versuchen)
        const neulich = H.wegFehl && Math.abs(H.wegFehl.x - Z.x) < 80 && Math.abs(H.wegFehl.y - Z.y) < 60 && H.schritt - H.wegFehl.t < PARTNER_WEG_PAUSE;
        if(!r.value && !Z.nah && (P.grounded || P.inWater) && !neulich){
          H.wegSuche = {gen: partnerWegSuche(P, Z), zielId: Z.id, zx: Z.x, zy: Z.y};
          partner.text = 'sucht einen Weg …'; return {};
        }
      }
      else if(!H.plan){ partner.text = 'überlegt …'; return partnerStehSicher(P, Z); }   // ein laufender Plan geht derweil weiter
    }
  }
  if(!H.plan){
    partner.text = Z.nah ? folgeText : (H.wartetAufLuecke ? 'wartet auf eine Lücke' : 'überlegt …');
    return {};
  }
  // Notbremse: weicht das echte Spiel von der Vorausrechnung ab (Bröckelboden, bewegte Teile …), alle paar Schritte den
  // Rest des Plans neu durchrechnen; droht Gefahr, Plan abbrechen und sicher ausweichen
  if(H.plan.art !== 'stehen' && H.schritt % (P.grounded ? 5 : 2) === 0){
    const U = partnerUmgebung(P.x);
    const r = partnerSim(U, P, H.plan, H.planK + 160, H.planK, H.planSt);
    if(r.tod){
      const notfall = partnerNotfall(U, P, Z);
      H.plan = notfall; H.planK = 0; H.planSt = {}; H.weg = null;
      if(!notfall){ partner.text = 'bremst'; return {}; }
    }
  }
  H.planK++;
  const e = H.plan.eingabe(H.planK, P, H.planSt);
  if(H.plan.fertig && H.plan.fertig(H.planK, P, H.planSt)){ H.plan = null; if(H.naechste > H.schritt + 3) H.naechste = H.schritt + partnerReaktion(); }
  const art = H.plan ? H.plan.art : 'stehen';
  partner.text = art === 'haken' ? 'Haken' : art === 'segeln' ? 'segelt' : art === 'sprung' ? 'springt' : art === 'kamin' ? 'klettert' :
                 H.weg ? 'nimmt einen Umweg' :
                 Z.id === 'folgen' && Math.abs(Z.x - P.x) >= PARTNER_AUFHOLEN ? 'holt auf' : folgeText;
  return e;
}
function partnerFestText(){
  const f = partnerHirn.aufgabeFehler;
  return f ? '„' + f + '“ klappt nicht – ruf mich (Q) oder tausch (V)' : 'hänge fest – ruf mich (Q) oder tausch (V)';
}
// „Warte hier“: an der Stelle bleiben (weicht nur aus, wenn es dort gefährlich wird)
function partnerWarten(P){
  const H = partnerHirn;
  const Z = {x: H.warteX, y: H.warteY, id: 'warten', nah: Math.abs(P.x - H.warteX) < 40 && Math.abs(P.y - H.warteY) < 40};
  const e = partnerNavi(P, Z, 'wartet hier (Q = komm)');
  if(partner.modus === 'fest') partner.modus = 'warten';
  partner.text = 'wartet hier (Q = komm)';
  return e;
}
// Jagd: rollt eine Stachelwand (Stacheln auf einem fahrenden Boden) hinter ihm her, rennt er bis hinter ihr Fahrtende
function partnerFluchtZiel(P){
  let ziel = null;
  for(const sp of spikes){
    const m = sp.carrier;
    if(!m || !m.tripActive) continue;
    const ende = m.moveDir === 1 ? m.targetX : m.startX, dir = Math.sign(ende - m.x);
    if(!dir) continue;
    const hinten = (P.x - (m.x + m.w/2))*dir;   // > 0: Figur liegt in Fahrtrichtung vor der Wand
    if(hinten < -20 || hinten > 900) continue;
    const x = dir > 0 ? ende + m.w + 120 : ende - 120;
    if(!ziel || (x - ziel.x)*dir > 0) ziel = {x, dir};
  }
  return ziel;
}
// Dash nach vorn möglich und sicher? Steht, Dash voll, die nächsten PARTNER_DASH_BODEN Kästchen fester Boden ohne
// Stacheln und frei (kein Hindernis in Kopf-/Fußhöhe)
function partnerDashFrei(P, dir){
  if(!P.grounded || typeof dashKannStarten !== 'function' || !dashKannStarten(P)) return false;
  return partnerBodenFrei(P, dir, PARTNER_DASH_BODEN);
}
function partnerBodenFrei(P, dir, n){
  const c = Math.floor(P.x/40), r = Math.floor((P.y - 1)/40);
  // feste Teile in der Nähe (offene Türen, Bröckel im Zerfall und Fahrten zählen nicht)
  const x0 = Math.min(c, c + dir*n)*40 - 40, x1 = Math.max(c, c + dir*n)*40 + 80;
  const nah = solids.filter(s => !s.gone && !s.open && s.type !== 'oneway' && s.type !== 'moveplat' && s.x < x1 && s.x + s.w > x0);
  const fest = (cc, rr) => nah.some(s => s.x < cc*40 + 39 && s.x + s.w > cc*40 + 1 && s.y < rr*40 + 39 && s.y + s.h > rr*40 + 1);
  for(let i = 1; i <= n; i++){
    const cc = c + dir*i;
    if(!fest(cc, r + 1) || fest(cc, r) || fest(cc, r - 1)) return false;
    if(spikes.some(sp => Math.abs(sp.x - (cc*40 + 20)) < 30 && Math.abs(sp.y - (r + 1)*40) < 30)) return false;
  }
  return true;
}
function partnerFolgen(P, M){
  if(partner.modus === 'aufgabe') partner.modus = 'folgen';
  const F = partnerFluchtZiel(P);
  if(F && (F.x - P.x)*F.dir > 0){
    const H = partnerHirn;
    if(H.zielId !== 'flucht'){ H.suche = null; H.wegSuche = null; H.weg = null; H.naechste = H.schritt; if(P.grounded) H.plan = null; }   // Schreck: sofort los
    const Z = {x: F.x, y: P.y, id: 'flucht', tol: 40, nah: false};
    if(partner.modus !== 'fest') partner.text = 'flieht!';
    // Umbau: Verfolger sind schneller als Laufen – liegt vor ihm freier, fester Boden, rennt er sofort los (ohne erst
    // den Weg zu planen) und dasht nach vorn, sobald der Dash voll ist; sonst plant er den Weg wie bisher
    if(P.grounded && partnerBodenFrei(P, F.dir, 3)){
      const e = {dir: F.dir};
      if(partnerDashFrei(P, F.dir)) e.dash = true;
      return e;
    }
    const e = partnerNavi(P, Z, 'flieht!');
    if(partner.modus !== 'fest') partner.text = 'flieht!';
    // noch kein Weg geplant (er überlegt), die Wand ist aber schneller: einfach nach vorn springen statt stehen zu bleiben
    if(!e || (!e.dir && !e.springen && !e.sprungHalten)){
      const kante = P.grounded && !partnerBodenFrei(P, F.dir, 1);   // erst an der Kante abspringen
      return {dir: F.dir, springen: kante, sprungHalten: !P.grounded};
    }
    if(e.dir === F.dir && !e.springen && partnerDashFrei(P, F.dir)) e.dash = true;
    return e;
  }
  const Z = partnerFolgeZiel(P, M); Z.id = 'folgen';
  return partnerNavi(P, Z, 'folgt dir');
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
  if(P.male && P.hookAttached) halten.ability = true;
  if(e.use) druecken.push('use');
  if(e.pull) halten.pull = true;
  if(e.slack) halten.slack = true;
  if(e.dash) druecken.push('dash');
  return {halten, druecken};
}
// Umbau: steht direkt vor ihm eine Durchbruch-Wand (in Laufrichtung, in Körperhöhe), bricht er sie mit einem Dash auf
function partnerBruchVorn(P, dir){
  if(!dir) return false;
  const x0 = dir > 0 ? P.x + P.w/2 : P.x - P.w/2 - PARTNER_BRUCH_NAH, x1 = x0 + PARTNER_BRUCH_NAH;
  return solids.some(s => s.type === 'bruch' && !s.gone && s.x < x1 && s.x + s.w > x0 && s.y < P.y - 2 && s.y + s.h > P.y - P.h + 2);
}
function partnerDenken(P, M){
  if(typeof deathState !== 'undefined' && deathState) return {halten: {}, druecken: []};
  if(partner.modus === 'warten') return partnerTastenAus(P, partnerWarten(P));
  // Aufgaben (31-partner-aufgaben.js) haben Vorrang; sonst folgen
  const e = (typeof partnerAufgabeSchritt === 'function' && partnerAufgabeSchritt(P, M)) || partnerFolgen(P, M);
  if(e && P.grounded && typeof dashKannStarten === 'function' && dashKannStarten(P) && partnerBruchVorn(P, e.dir)) e.dash = true;
  return partnerTastenAus(P, e);
}
