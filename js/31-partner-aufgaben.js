// 31-partner-aufgaben.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.
//
// ---------- Computer-Partner: Begleiter-Aufgaben (nur im Testmodus, siehe 30-partner.js) ----------
// An Rätsel-Stellen braucht der Partner eine Anweisung, was seine Rolle ist. Sie steht in einer Begleitdatei neben dem
// Level: levels/partner/<welt>/<datei>.json (das Level-Format selbst bleibt unverändert). Aufbau:
//   {"level": "dschungel/03-lianenschlucht.json", "aufgaben": [
//     {"id": "hebel-4", "zone": [110, 128], "rolle": "f", "aktion": "hebel", "nummer": 4, "zeit": 30}, …]}
// Felder einer Aufgabe (Spalten/Reihen wie im Editor):
//   zone   [von, bis]  Spalten: Aufgabe beginnt, sobald ich ODER der Partner darin ist (fehlt: gilt überall)
//   rolle  'm' | 'f' | 'beide'  welche Figur das macht – passt sie nicht zum Partner, ist es MEINE Aufgabe (er folgt)
//   aktion hebel · platte · spiegel · wechsel · tuer · gehe · haken · segeln · ablauf (siehe partnerAufgabeTun)
//   nummer Verknüpfungs-Nummer (Hebel, Platte, Tür, Wechselboden) · soll true/false (Hebel: an oder aus, Standard an)
//   ziel   {c, r} Hebel/Platte/Spiegel bzw. Zielplatz · stand {c, r} wo er dafür steht (Spiegel) · stellung '/' oder '\'
//   wann   Bedingung zum Start, z. B. {"ich_in": [120, 125], "ich_steht": true, "nummer_an": 3, "nummer_aus": 4}
//   bis    wie lange er hält (Platte): {"ich_vorbei": 131} (Standard: bis ich an der Tür dieser Nummer vorbei bin)
//   zeit   Sekunden, bis er aufgibt (Standard 30) · text kurze Anzeige
//   schritte (nur „ablauf“): Koop-Bot-Schritte (hold/press/frames/until/wait/use/hookWhen/swing; press dash) ab start {c, r}
// Ohne Eintrag hilft er bei einfachen Fällen selbst (Auto-Aufgabe): geschlossene Tür vor mir, Hebel oder Platte dazu
// für ihn erreichbar und höchstens PARTNER_AUTO_WEITE weg -> er geht hin und betätigt ihn / hält die Platte.
// Auto-Aufgaben nie bei Nummern, die Felsen oder steigende Lava auslösen (er soll mich nie in Gefahr bringen).

let partnerAufgaben = [];        // Aufgaben des aktuellen Levels (aus der Begleitdatei)
let partnerAufgabenDatei = null; // woher (für die Anzeige/Tests)
const PARTNER_ORDNER = 'partner/';

const pSpalteX = c => c*40 + 20, pReiheFuss = r => (r + 1)*40;
function partnerAufgabenSetzen(liste, datei){
  partnerAufgaben = Array.isArray(liste) ? liste : [];
  partnerAufgabenDatei = datei || null;
  if(partnerHirn){ partnerHirn.aufgabe = null; partnerHirn.gescheitert = new Set(); }
}
// Begleitdatei zum Projekt-Level laden (Editor-Test gibt projektDatei mit); fehlt sie: nur Auto-Aufgaben
function partnerAufgabenLaden(datei){
  partnerAufgabenSetzen([], null);
  if(!datei || typeof fetch !== 'function') return Promise.resolve(false);
  return fetch(PROJECT_LEVELS + PARTNER_ORDNER + levelPfadUrl(datei), {cache: 'no-store'})
    .then(r => r.ok ? r.json() : null)
    .then(d => { if(d && Array.isArray(d.aufgaben)){ partnerAufgabenSetzen(d.aufgaben, datei); return true; } return false; })
    .catch(() => false);
}

// ---------- Bedingungen ----------
const partnerSpalte = pl => Math.floor(pl.x/40);
function partnerWann(w, M){
  if(!w) return true;
  if(w.ich_in && !(partnerSpalte(M) >= w.ich_in[0] && partnerSpalte(M) <= w.ich_in[1])) return false;
  if(w.ich_steht && !M.grounded) return false;
  if(w.ich_hoeher_als !== undefined && !(M.y <= pReiheFuss(w.ich_hoeher_als))) return false;
  if(w.nummer_an !== undefined && !linkOn[w.nummer_an]) return false;
  if(w.nummer_aus !== undefined && linkOn[w.nummer_aus]) return false;
  return true;
}
function partnerInZone(A, P, M){
  if(!A.zone) return true;
  const inZ = pl => partnerSpalte(pl) >= A.zone[0] && partnerSpalte(pl) <= A.zone[1];
  return inZ(M) || inZ(P);
}
// Türen einer Nummer (für „halten, bis ich vorbei bin“ und Auto-Aufgaben)
const partnerTueren = link => solids.filter(s => s.type === 'door' && s.link === link);
function partnerNaechster(liste, x, y){
  let best = null, bd = Infinity;
  for(const o of liste){ const d = Math.hypot(o.x - x, o.y - y); if(d < bd){ bd = d; best = o; } }
  return best;
}
function partnerHebelVon(A, P){
  const L = switchDefs.filter(sw => A.ziel ? (Math.abs(sw.x - pSpalteX(A.ziel.c)) < 30 && Math.abs(sw.y - (A.ziel.r*40 + 20)) < 30) : sw.link === A.nummer);
  return partnerNaechster(L, P.x, P.y);
}
function partnerPlatteVon(A, P){
  const L = plates.filter(pl => A.ziel ? (Math.abs(pl.x - pSpalteX(A.ziel.c)) < 30 && Math.abs(pl.y - (A.ziel.r*40 + 20)) < 30) : pl.link === A.nummer);
  return partnerNaechster(L, P.x, P.y);
}
function partnerSpiegelVon(A){
  return spiegelListe.find(s => A.ziel && Math.floor(s.x/40) === A.ziel.c && Math.floor(s.y/40) === A.ziel.r) || null;
}
// bin ich an allen Türen dieser Nummer vorbei (von der Platte aus gesehen)?
function partnerIchVorbei(A, M, ref){
  if(A.bis && A.bis.ich_vorbei !== undefined) return M.x > pSpalteX(A.bis.ich_vorbei);
  if(A.bis && A.bis.ich_in) return partnerSpalte(M) >= A.bis.ich_in[0] && partnerSpalte(M) <= A.bis.ich_in[1];
  const T = partnerTueren(A.nummer);
  if(!T.length) return false;
  return T.every(t => (t.x + t.w/2 > ref.x) ? M.x > t.x + t.w + 30 : M.x < t.x - 30);
}

// ---------- Ist die Aufgabe erledigt? ----------
function partnerAufgabeFertig(A, P, M){
  const art = partnerAufgabeArt(A);
  if(art === 'hebel') return !!linkOn[A.nummer] === (A.soll !== false);
  if(art === 'spiegel'){ const s = partnerSpiegelVon(A); return !s || (s.stellung === A.stellung && !(s.drehT > 0)); }
  if(art === 'platte'){ const pl = partnerPlatteVon(A, P); return !pl || partnerIchVorbei(A, M, pl); }
  if(art === 'ablauf'){   // fertig, wenn alle Schritte durch sind (bzw. die Nummer schon an ist, falls angegeben)
    const H = partnerHirn, lauf = H && H.aufgabe && H.aufgabe.def === A ? H.aufgabe.st : null;
    if(lauf) return lauf.los && lauf.i >= (A.schritte || []).length;
    return A.nummer !== undefined ? !!linkOn[A.nummer] : false;
  }
  if(art === 'gehe' || art === 'haken' || art === 'segeln'){
    if(!A.ziel) return true;
    return Math.abs(P.x - pSpalteX(A.ziel.c)) < 30 && Math.abs(P.y - pReiheFuss(A.ziel.r)) < 24 && P.grounded;
  }
  return true;
}
// „tuer“ und „wechsel“ sind Hebel bzw. Platte – je nachdem, was es zu dieser Nummer gibt
function partnerAufgabeArt(A){
  if(A.aktion === 'tuer' || A.aktion === 'wechsel'){
    if(A.ziel) return switchDefs.some(sw => Math.abs(sw.x - pSpalteX(A.ziel.c)) < 30) ? 'hebel' : 'platte';
    return switchDefs.some(sw => sw.link === A.nummer) ? 'hebel' : 'platte';
  }
  return A.aktion;
}
const PARTNER_AUFGABE_TEXT = {hebel: n => 'Hebel ' + n, platte: n => 'Platte ' + n + ' halten', spiegel: () => 'Spiegel drehen',
  gehe: () => 'geht hin', haken: () => 'Haken', segeln: () => 'segelt hinüber', ablauf: () => 'Kunststück'};
function partnerAufgabeText(A){
  if(A.text) return A.text;
  const f = PARTNER_AUFGABE_TEXT[partnerAufgabeArt(A)];
  return f ? f(A.nummer) : A.aktion;
}

// ---------- Auto-Aufgabe: geschlossene Tür vor mir, Hebel/Platte dazu in Reichweite ----------
function partnerAutoAufgabe(P, M){
  for(const d of solids){
    if(d.type !== 'door' || d.gone || d.open || !d.link || linkOn[d.link]) continue;
    // Tür direkt vor mir (in Laufrichtung rechts, auf meiner Höhe), höchstens 6 Kästchen weg
    if(!(d.x > M.x && d.x - M.x < 240 && M.y > d.y - 10 && M.y <= d.y + d.h + 50)) continue;
    const link = d.link;
    if(typeof felsen !== 'undefined' && felsen.some(F => F.link === link)) continue;   // nie Felsen auslösen
    if(typeof lavaBecken !== 'undefined' && lavaBecken.some(b => b.marken.some(m => m.link === link))) continue;   // nie Lava steigen lassen
    if(spikes.some(sp => sp.carrier && sp.carrier.switchLink === link)) continue;   // nie eine Stachelwand (Jagd) starten
    const sw = switchDefs.filter(s => s.link === link && Math.hypot(s.x - d.x, s.y - d.y) < PARTNER_AUTO_WEITE && Math.abs(s.x - P.x) < 700);
    const pl = plates.filter(q => q.link === link && Math.hypot(q.x - d.x, q.y - d.y) < PARTNER_AUTO_WEITE && Math.abs(q.x - P.x) < 700);
    if(sw.length) return {id: 'auto-hebel-' + link, aktion: 'hebel', nummer: link, rolle: 'beide', zeit: 20, auto: true};
    if(pl.length) return {id: 'auto-platte-' + link, aktion: 'platte', nummer: link, rolle: 'beide', zeit: 25, auto: true};
  }
  return null;
}

// ---------- Welche Aufgabe gilt jetzt? ----------
function partnerMeineRolle(A){ return !A.rolle || A.rolle === 'beide' || A.rolle === (partner.ich === 'm' ? 'f' : 'm'); }
function partnerAufgabeWaehlen(P, M){
  const H = partnerHirn;
  if(!H.gescheitert) H.gescheitert = new Set();
  if(H.aufgabe){
    const A = H.aufgabe.def;
    if(partnerAufgabeFertig(A, P, M)){ H.aufgabe = null; }
    else if(H.schritt - H.aufgabe.start > (A.zeit || PARTNER_AUFGABE_ZEIT/60)*60){
      H.gescheitert.add(A.id); H.aufgabe = null;
      partner.modus = 'fest'; H.festZielX = P.x; H.festZielY = P.y; H.plan = null; H.aufgabeFehler = partnerAufgabeText(A);
      return null;
    } else return H.aufgabe;
  }
  if(partner.modus === 'warten' || partner.modus === 'fest') return null;
  const jetzt = H.sofort;   // „Mach deine Aufgabe jetzt“ (E): nächste passende Aufgabe ohne Zone
  for(const A of partnerAufgaben){
    if(!partnerMeineRolle(A) || H.gescheitert.has(A.id)) continue;
    if(!jetzt && (!partnerInZone(A, P, M) || !partnerWann(A.wann, M))) continue;
    if(jetzt && A.zone && Math.abs(pSpalteX((A.zone[0] + A.zone[1])/2) - M.x) > 30*40) continue;
    if(partnerAufgabeFertig(A, P, M)) continue;
    H.sofort = false;
    return (H.aufgabe = {def: A, start: H.schritt, st: {}});
  }
  H.sofort = false;
  const auto = partnerAutoAufgabe(P, M);
  if(auto && !H.gescheitert.has(auto.id) && !partnerAufgabeFertig(auto, P, M)) return (H.aufgabe = {def: auto, start: H.schritt, st: {}});
  return null;
}

// ---------- Aufgabe ausführen: hingehen, dann die Taste wie ein Spieler drücken ----------
function partnerAufgabeSchritt(P, M){
  const H = partnerHirn;
  const auf = partnerAufgabeWaehlen(P, M);
  if(!auf) return null;
  const A = auf.def, art = partnerAufgabeArt(A), st = auf.st, text = 'Aufgabe: ' + partnerAufgabeText(A);
  partner.modus = 'aufgabe';
  const geh = (x, y, nahX, nahY) => {
    const Z = {x, y, id: 'aufgabe:' + A.id, nah: Math.abs(P.x - x) <= nahX && Math.abs(P.y - y) <= nahY && (P.grounded || P.inWater)};
    const e = partnerNavi(P, Z, text);
    if(!partner.text.startsWith('Aufgabe') && partner.modus !== 'fest') partner.text = text + ' – ' + partner.text;
    return {Z, e};
  };
  if(art === 'hebel'){
    const sw = partnerHebelVon(A, P); if(!sw){ H.aufgabe = null; return null; }
    const {Z, e} = geh(sw.x, sw.y + 20, 22, 40);
    if(Z.nah && leverNear(P, sw)){
      partner.text = text;
      if(!partnerHebelSicher(sw.link, M)){ partner.text = text + ' – wartet, bis du sicher stehst'; return {}; }
      if(!st.gedrueckt || H.schritt - st.gedrueckt > 24){ st.gedrueckt = H.schritt; return {use: true}; }
      return {};
    }
    return e;
  }
  if(art === 'platte'){
    const pl = partnerPlatteVon(A, P); if(!pl){ H.aufgabe = null; return null; }
    const {Z, e} = geh(pl.x, pl.y + 20, 10, 30);
    if(Z.nah){ partner.text = text; return {}; }   // draufstehen bleiben
    return e;
  }
  if(art === 'spiegel'){
    const s = partnerSpiegelVon(A); if(!s){ H.aufgabe = null; return null; }
    const sx = A.stand ? pSpalteX(A.stand.c) : s.x + 20, sy = A.stand ? pReiheFuss(A.stand.r) : s.y + 40;
    const {Z, e} = geh(sx, sy, 24, 30);
    if(Z.nah && spiegelInReichweite(P) === s){
      partner.text = text;
      if(s.stellung !== A.stellung && !(s.drehT > 0) && (!st.gedrueckt || H.schritt - st.gedrueckt > 24)){ st.gedrueckt = H.schritt; return {use: true}; }
      return {};
    }
    return e;
  }
  if(art === 'gehe' || art === 'haken' || art === 'segeln'){
    if(!A.ziel){ H.aufgabe = null; return null; }
    return geh(pSpalteX(A.ziel.c), pReiheFuss(A.ziel.r), 20, 20).e;
  }
  if(art === 'ablauf') return partnerAblauf(P, M, A, st, text, geh);
  H.aufgabe = null;
  return null;
}

// ---------- „ablauf“: Koop-Bot-Schritte (für Kunststücke, die der Planer nicht selbst findet) ----------
// Erst zum Startplatz, dann Schritt für Schritt wie im Koop-Bot (tests/koop_bot.js): hold, holdIf, press, frames, until,
// wait, use, hookWhen, swing {pull, release}. In Bedingungen: P = Partner, Q = ich, f = Schritte seit Schrittbeginn.
function partnerAblauf(P, M, A, st, text, geh){
  if(!st.los){
    if(!A.start){ st.los = true; }
    else {
      const {Z, e} = geh(pSpalteX(A.start.c), pReiheFuss(A.start.r), 8, 20);
      if(!Z.nah) return e;
      st.los = true;
    }
    st.i = 0; st.t0 = partnerHirn.schritt;
  }
  partner.text = text;
  const schritte = A.schritte || [], H = partnerHirn;
  const S = schritte[st.i];
  if(!S){ return {}; }
  const f = H.schritt - st.t0;
  const ev = c => { try{ return !!Function('P', 'Q', 'f', 'return (' + c + ')')(P, M, f); }catch(err){ return true; } };
  const e = {dir: 0};
  const halte = n => { if(n === 'right') e.dir = 1; else if(n === 'left') e.dir = -1; else if(n === 'jump') e.sprungHalten = true;
    else if(n === 'glide') e.gleiten = true; else if(n === 'pull') e.pull = true; else if(n === 'slack') e.slack = true; };
  const druecke = n => { if(n === 'jump') e.springen = true; else if(n === 'hook') e.haken = true; else if(n === 'use') e.use = true;
    else if(n === 'dash') e.dash = true; else halte(n); };   // dash + hold pull = Dash nach oben (pull = „hoch“-Taste)
  let fertig = false;
  if(S.swing){
    if(!partnerAnker(P) && f > 2) fertig = true;
    else {
      if(f <= (S.pull || 0)) e.pull = true;
      e.dir = P.vx >= 0 ? 1 : -1;
      if(S.release && ev(S.release)){ e.loslassen = true; fertig = true; }
    }
  } else {
    for(const n of (S.hold || [])) halte(n);
    if(S.holdIf) for(const n in S.holdIf) if(ev(S.holdIf[n])) halte(n);
    if(f === 0) for(const n of (S.press || [])) druecke(n);
    if(S.pressIf) for(const n in S.pressIf) if(ev(S.pressIf[n])) druecke(n);
    if(S.use && f === 0) e.use = true;
    if(S.hookWhen && !partnerAnker(P) && ev(S.hookWhen) && (!st.hakenK || H.schritt - st.hakenK > 6)){ e.haken = true; st.hakenK = H.schritt; }
    if(S.frames !== undefined && f >= S.frames) fertig = true;
    if(S.until !== undefined && ev(S.until)) fertig = true;
    if(S.wait !== undefined && ev(S.wait)) fertig = true;
    if(S.frames === undefined && S.until === undefined && S.wait === undefined) fertig = true;
  }
  if(fertig){ st.i++; st.t0 = H.schritt + 1; }
  return e;
}
// hängt er bei einer Aufgabe fest: Aufgabe merken als gescheitert (bis ich ihn rufe oder E drücke)
function partnerAufgabeAbbrechen(){
  const H = partnerHirn;
  if(!H || !H.aufgabe) return;
  if(!H.gescheitert) H.gescheitert = new Set();
  H.gescheitert.add(H.aufgabe.def.id); H.aufgabeFehler = partnerAufgabeText(H.aufgabe.def); H.aufgabe = null;
}

// Nie unfair: schaltet der Hebel einen Wechselboden, auf (oder knapp über) dem ich gerade stehe und der dadurch
// verschwindet, wartet er lieber (ich soll nicht durch seinen Hebel abstürzen)
function partnerHebelSicher(link, M){
  if(typeof wechselNummern === 'undefined' || !wechselNummern[link]) return true;
  const box = {x: M.x - M.w/2 - 6, y: M.y - 4, w: M.w + 12, h: 90};   // unter meinen Füßen
  for(const s of solids){
    if(s.type !== 'wechsel' || s.link !== link || s.gone) continue;   // nur Boden, der jetzt da ist (und gleich verschwindet)
    if(rectsOverlap(box, s)) return false;
  }
  return true;
}
