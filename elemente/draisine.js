// elemente/draisine.js – Element „Pump-Draisine“ (Handhebel-Draisine; Punkt-Element, siehe 00-register.js).
// Nutzerwunsch: wie eine Hand-Draisine auf Schienen, bei der zwei Leute sich gegenüberstehen und einen Hebel auf und ab
// drücken. Hier HÄNGT sie wie das Blatt-Floß (elemente/blattfloss.js) an einer Tau-Schiene über einer Grube: eine breite
// Holzplattform (4 Kästchen) an zwei Seilzügen, in der Mitte ein Pump-Hebel (Wippe auf einem Pfosten).
// Bedienung: BEIDE stehen darauf, jede Figur HÄLT die Griff-Taste (Affe Q, Schweinchen Num 7, Controller L1) und DRÜCKT
// dabei immer wieder ihre Sprung-Taste (= pumpen; Affe Leertaste, Schweinchen Num 0, Controller ✕). Nur wenn beide halten
// und beide pumpen, fährt sie – pumpt nur eine Figur, rollt sie langsam aus. Griff halten heißt nur „Hebel festhalten“:
// Laufen und Springen gehen dann nicht; loslassen = sofort wieder normal steuern.
// Richtung: von allein zum Ende der Schiene, das weiter weg ist (wie das Floß-Rad); die Richtung bleibt bis zur Ankunft
// (kurz verschnaufen und weiterpumpen fährt weiter). Am Ende hält sie an; nach einer kurzen Pause schickt neues Pumpen sie
// zurück. Tempo: je schneller BEIDE pumpen (zählt die langsamere Figur), desto schneller, höchstens DRAISINE_MAX.
// Rolle: beide gleich – reines Koop-Timing (Regelwerk Punkt 11: keine Figur ist überflüssig, allein fährt nichts).
// Im Spiel: solids mit type 'draisine' {x, y (Stehfläche), w, h, x0, x1 (Schiene), v, tempo, richtung, kraft[2], …},
// zeichnet sich selbst (ELEMENT_SOLID_TYPEN). Logik: draisineVorher (aus neueBewegungVorher, js/32 – Figur hält den Hebel,
// pumpt) und spiel.schritt (Kraft, Tempo, fahren, Mitfahrer).
const DRAISINE_BREITE = 160, DRAISINE_DICKE = 14;
const DRAISINE_SCHIENE_HOCH = 84;   // px: so hoch über der Stehfläche läuft die Tau-Schiene (über Köpfen und Hebel)
const DRAISINE_SCHIENE_MAX = 40;    // Kästchen: so lang darf die Schiene im Editor gezogen werden
const DRAISINE_MAX = 3;             // px/Schritt: höchstens so schnell (Blatt-Floß 3,2)
// Takt-Pumpen (Nutzerwunsch 06.11.: „der User muss immer im richtigen Moment eine Taste drücken“): wie eine echte Hand-
// Draisine ist der Hebel eine WIPPE – die beiden drücken ABWECHSELND ihre Seite herunter. Nach einem Stoß kippt der Hebel in
// DRAISINE_TAKT_WEG Schritten herüber; dann ist der Griff des Partners oben und SEIN Moment kommt: ein Leuchtring zieht sich
// um seinen Griff zusammen und trifft ihn DRAISINE_BEST Schritte nach dem Ankommen = perfekt (± DRAISINE_PERFEKT). Drücken
// davor (Hebel noch unterwegs) oder obwohl man nicht dran ist = „Klack“, Schwung weg; verpasst er das Fenster
// (DRAISINE_FENSTER_NACH), kippt der Hebel zurück in die Mitte und jeder darf wieder anfangen. Schritte = Physik-Schritte.
const DRAISINE_TAKT_WEG = 14;        // Schritte: so lange kippt der Hebel nach einem Stoß herüber
const DRAISINE_FENSTER_VOR = 3;      // Schritte vor dem Ankommen zählt ein Druck schon (Gnade)
const DRAISINE_BEST = 6;             // Schritte nach dem Ankommen: Ring trifft den Griff = perfekter Moment
const DRAISINE_PERFEKT = 4;          // ± Schritte um den besten Moment = perfekt
const DRAISINE_FENSTER_NACH = 28;    // Schritte nach dem Ankommen: danach ist der Takt verpasst
const DRAISINE_STOSS = 0.26;         // Pump-Kraft je gutem Stoß
const DRAISINE_STOSS_PERFEKT = 0.42; // … je perfektem Stoß
const DRAISINE_FEHL = 0.15;          // so viel Kraft kostet ein Druck im falschen Moment
const DRAISINE_ABKLINGEN = 0.99;     // Pump-Kraft je Schritt mal diesem Wert (ohne Pumpen fällt sie ab)
const DRAISINE_KRAFT_MAX = 1.3;      // höchstens so viel Pump-Kraft sammelt eine Figur (perfekter Takt ≈ 1,2 -> fast Höchsttempo)
const DRAISINE_TEMPO_JE_KRAFT = 2.6; // Ziel-Tempo = kleinere Kraft der beiden × diesem Wert
const DRAISINE_ANFAHREN = 0.05;     // Anteil je Schritt, mit dem das Tempo zum Ziel-Tempo wächst (weich anfahren)
const DRAISINE_BREMSEN = 0.035;     // … bzw. abnimmt (weich ausrollen)
const DRAISINE_ENDE_PAUSE = 30;     // Schritte nach der Ankunft, in denen Pumpen nichts tut (sonst fährt sie gleich zurück)
const DRAISINE_STAND = 50;          // px: so weit neben der Mitte steht, wer den Hebel hält (Hände am T-Griff; vorher 44 – zu weit weg)
const DRAISINE_PFOSTEN = 30;        // px: Drehpunkt des Hebels über der Stehfläche
const DRAISINE_ARM = 36;            // px: halbe Länge des Hebels (Griffe an beiden Enden)
const DRAISINE_HEBEL_WINKEL = 0.36; // Bogenmaß: so weit kippt der Hebel bei einem Pump-Stoß
const DRAISINE_HAENGER_X = 70;      // px: Seilzüge so weit neben der Mitte (außerhalb der Stehplätze – nichts vor den Figuren)
let draisinen = [];
ELEMENT_SOLID_TYPEN.add('draisine');
const draisineGriffTaste = P => !!(P && P.keys && P.keys.griff && isDown(P.keys.griff));
const draisineDrauf = (P, s) => !!P && P.grounded && Math.abs(P.y - s.y) <= 2 && P.x + P.w/2 > s.x && P.x - P.w/2 < s.x + s.w;
// steht gerade irgendeine Figur auf einer Draisine? (dann gehört Q dem Griff, nicht „Partner holen“ im Editor-Test, js/06/30)
function draisineJemandDrauf(){
  if(!draisinen.length || typeof p1 === 'undefined' || !p1) return false;
  return draisinen.some(s => draisineDrauf(p1, s) || draisineDrauf(p2, s));
}
// Haken aus neueBewegungVorher (js/32): hält die Figur auf der Draisine die Griff-Taste, steht sie an ihrem Griff (links
// oder rechts vom Hebel) und pumpt mit der Sprung-Taste (true = Tempo gesetzt, normale Physik aus – kein Laufen/Springen)
function draisineVorher(P, jumpPressed){
  if(!draisinen.length || P.hookAttached || !draisineGriffTaste(P)) { P._draisineSeite = 0; return false; }
  const s = draisinen.find(s => draisineDrauf(P, s));
  if(!s){ P._draisineSeite = 0; return false; }
  const i = P.male ? 0 : 1, mitte = s.x + s.w/2, A = i ? p1 : p2;
  // Seite wählen (beim Zugreifen): wo die Figur steht; hält der Partner dort schon, die andere Seite
  if(!P._draisineSeite || P._draisineS !== s){
    let seite = P.x < mitte ? -1 : 1;
    if(A && A._draisineS === s && A._draisineSeite === seite) seite = -seite;
    P._draisineSeite = seite; P._draisineS = s;
  }
  const platz = mitte + P._draisineSeite*DRAISINE_STAND;
  P.vx = Math.max(-1.5, Math.min(1.5, (platz - P.x)*0.3)); P.vy = GRAVITY;
  P.facing = -P._draisineSeite;   // schaut zum Hebel
  s.greift[i] = true;
  if(jumpPressed && s.pause <= 0) draisineDruck(s, P, i);
  return true;
}
// Ein Druck auf die Sprung-Taste (Takt-Pumpen, s. o.): im richtigen Moment = Stoß, sonst Klack
function draisineDruck(s, P, i){
  const T = s.takt, seite = P._draisineSeite, rel = T.t - DRAISINE_TAKT_WEG;
  let art;
  if(!T.dran) art = 'gut';                                       // Takt beginnt: wer zuerst drückt, fängt an
  else if(T.dran !== seite || rel < -DRAISINE_FENSTER_VOR) art = 'fehl';   // nicht dran oder Hebel noch unterwegs
  else art = Math.abs(rel - DRAISINE_BEST) <= DRAISINE_PERFEKT ? 'perfekt' : 'gut';
  s.fx = {art, seite, t: 0};
  if(art === 'fehl'){
    s.kraft[i] = Math.max(0, s.kraft[i] - DRAISINE_FEHL);
    if(typeof SFX !== 'undefined' && SFX.draisineFehl) SFX.draisineFehl(s.x + s.w/2);
    return;
  }
  // Stoß: diese Seite geht nach unten, der Griff des Partners kommt hoch – jetzt ist er dran
  s.kraft[i] = Math.min(DRAISINE_KRAFT_MAX, s.kraft[i] + (art === 'perfekt' ? DRAISINE_STOSS_PERFEKT : DRAISINE_STOSS));
  T.dran = -seite; T.t = 0; s.hebelVon = s.hebel; s.hebelZiel = seite*DRAISINE_HEBEL_WINKEL;
  if(typeof seilStoss === 'function') seilStoss(s, art === 'perfekt' ? 1.1 : 0.8);   // Plattform federt im Seil
  s.pendV = (s.pendV || 0) + seite*0.15;
  const knarz = typeof geraeuschSpielen === 'function' && geraeuschSpielen('knarzen', {x: s.x + s.w/2, stueck: seite > 0 ? 'hin' : 'her', vol: art === 'perfekt' ? 1 : 0.8});
  if(!knarz && typeof SFX !== 'undefined' && SFX.draisinePumpe) SFX.draisinePumpe(s.x + s.w/2, seite > 0);
  else if(typeof sfxLog === 'function') sfxLog('draisine');
  if(art === 'perfekt' && typeof SFX !== 'undefined' && SFX.draisinePerfekt) SFX.draisinePerfekt(s.x + s.w/2);
}
// Wie hoch ist der Griff dieser Seite? 0 = ganz unten, 1 = ganz oben (für die Pose der Figur, js/33)
function draisineGriffHoehe(s, seite){ return Math.max(0, Math.min(1, 0.5 - seite*(s.hebel || 0)/(2*DRAISINE_HEBEL_WINKEL))); }
// ---------- Aussehen ----------
// Aufhänge-Höhe der Schienen-Enden (Material darüber oder Blätterdach), je Draisine einmal gemerkt (wie blattSchieneEnden)
function draisineSchieneEnden(s){
  if(s._enden) return s._enden;
  const y = s.y - DRAISINE_SCHIENE_HOCH, a = s.x0 - 8, b = s.x1 + s.w + 8;
  const hoch = x => typeof hakenAufhaengeY === 'function' ? hakenAufhaengeY(x, y) : null;
  return (s._enden = {y, a, b, ya: hoch(a), yb: hoch(b)});
}
function draisineDurchhang(s, t){
  const fahrt = Math.min(1, Math.abs(s.v || 0)/DRAISINE_MAX);
  return 4 + Math.sin(t*1.1 + s.x0*0.003)*1.2 + fahrt*(3 + Math.sin(t*9)*1.2) + (s.wipp || 0)*1.4;   // unter Last/Stoß hängt sie mehr durch
}
// Plattform (Seitenansicht): dicke Bohlen-Lauffläche, zwei Querbalken darunter, Eisenwinkel an den Ecken, Pfosten in der
// Mitte mit dem Pump-Hebel (Wippe, T-Griffe an beiden Enden). y = Stehfläche, alles liegt UNTER den Füßen bzw. zwischen
// den Figuren (Pfosten/Hebel in der Mitte) – nichts verdeckt sie. kraft = [Affe, Schweinchen] für die kleinen Lämpchen.
function draisineBild(g, x, y, w, winkel, kraft, schwank){
  const foto = g === ctx && typeof fotoLookAktiv === 'function' && fotoLookAktiv();
  const F = typeof tauFarben === 'function' ? tauFarben() : {holzA: '#b47a40', holzB: '#6b4019', rolleDunkel: '#2a1a0c'};
  const L = w/2;
  g.save(); g.translate(x + w/2, y); g.rotate(schwank || 0);
  // Querbalken (Stirnseiten) unter der Lauffläche
  for(const d of [-1, 1]){
    const bx = d*(L - 22) - 6;
    g.fillStyle = F.rolleDunkel; g.fillRect(bx - 1, 5, 14, 10);
    g.fillStyle = foto ? '#5a4b3a' : '#7a4b22'; g.fillRect(bx, 6, 12, 8);
    g.strokeStyle = foto ? 'rgba(30,24,18,.7)' : 'rgba(60,32,12,.6)'; g.lineWidth = 0.7;
    for(let k = 1; k <= 3; k++){ g.beginPath(); g.ellipse(bx + 6, 10, 1.6*k, 1.2*k, 0, 0, 7); g.stroke(); }
  }
  // Lauffläche: Bohle mit dunkler Kante
  g.fillStyle = F.rolleDunkel; g.beginPath(); g.roundRect(-L - 1, -1, w + 2, 9, 2.5); g.fill();
  if(foto && typeof fotoHolzMuster === 'function'){ g.fillStyle = fotoHolzMuster(g, true, -L, 0); g.fillRect(-L, 0, w, 7); }
  else {
    const hz = g.createLinearGradient(0, 0, 0, 7); hz.addColorStop(0, F.holzA); hz.addColorStop(1, F.holzB);
    g.fillStyle = hz; g.beginPath(); g.roundRect(-L, 0, w, 7, 2); g.fill();
    g.strokeStyle = 'rgba(70,38,14,.55)'; g.lineWidth = 0.9;   // Bretter-Fugen
    for(let k = 1; k < 5; k++){ const fx = -L + k*w/5; g.beginPath(); g.moveTo(fx, 0.8); g.lineTo(fx, 6.2); g.stroke(); }
  }
  g.fillStyle = foto ? 'rgba(255,240,210,.16)' : 'rgba(255,225,170,.45)'; g.fillRect(-L + 1, 0, w - 2, 1.2);   // Licht von oben
  // Eisenwinkel an den Ecken (dort hängen die Seilzüge)
  for(const d of [-1, 1]){
    const ex = d*DRAISINE_HAENGER_X - 6;
    if(foto && typeof fotoEisenBand === 'function') fotoEisenBand(g, ex, 0.5, 12, 6, 6);
    else { g.fillStyle = '#4b5563'; g.fillRect(ex, 0.5, 12, 6); g.fillStyle = '#9aa3ad'; for(const nx of [3, 9]){ g.beginPath(); g.arc(ex + nx, 3.5, 1, 0, 7); g.fill(); } }
  }
  // Pfosten in der Mitte (vom Boden bis zum Drehpunkt), unten mit Eisenfuß
  const H = DRAISINE_PFOSTEN;
  g.fillStyle = F.rolleDunkel; g.fillRect(-4.5, -H - 1, 9, H + 1.5);
  if(foto && typeof fotoHolzMuster === 'function') g.fillStyle = fotoHolzMuster(g, false, -3.2, 0);
  else { const ph = g.createLinearGradient(-3, 0, 3, 0); ph.addColorStop(0, F.holzB); ph.addColorStop(0.5, F.holzA); ph.addColorStop(1, F.holzB); g.fillStyle = ph; }
  g.fillRect(-3.2, -H, 6.4, H);
  if(foto && typeof fotoEisenBand === 'function') fotoEisenBand(g, -7, -5, 14, 5, 0);
  else { g.fillStyle = '#4b5563'; g.fillRect(-7, -5, 14, 5); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(-7, -5, 14, 1); }
  // zwei Pump-Lämpchen am Pfosten (oben Affe gelb, darunter Schweinchen rosa): leuchten, solange die Figur pumpt
  if(kraft) for(let i = 0; i < 2; i++){
    const k = Math.min(1, kraft[i]), lx = 0, ly = -H*0.62 + i*8;
    g.fillStyle = 'rgba(20,14,8,.8)'; g.beginPath(); g.arc(lx, ly, 2.6, 0, 7); g.fill();
    g.fillStyle = k > 0.02 ? `rgba(${i ? '255,150,200' : '255,205,90'},${0.35 + 0.65*k})` : 'rgba(90,80,70,.8)';
    g.beginPath(); g.arc(lx, ly, 1.8, 0, 7); g.fill();
  }
  // Hebel (Wippe) am Drehpunkt
  g.translate(0, -H); g.rotate(winkel || 0);
  g.lineCap = 'round';
  g.strokeStyle = F.rolleDunkel; g.lineWidth = 6.5; g.beginPath(); g.moveTo(-DRAISINE_ARM, 0); g.lineTo(DRAISINE_ARM, 0); g.stroke();
  g.strokeStyle = foto ? '#6e5f4a' : F.holzA; g.lineWidth = 4; g.stroke();
  g.strokeStyle = foto ? 'rgba(230,220,200,.25)' : 'rgba(255,225,170,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-DRAISINE_ARM + 2, -1.2); g.lineTo(DRAISINE_ARM - 2, -1.2); g.stroke();
  for(const d of [-1, 1]){   // T-Griffe (Querholz) an den Enden – hier halten die Hände
    g.strokeStyle = F.rolleDunkel; g.lineWidth = 5; g.beginPath(); g.moveTo(d*DRAISINE_ARM, -4.5); g.lineTo(d*DRAISINE_ARM, 4.5); g.stroke();
    g.strokeStyle = foto ? '#4a3d2e' : F.holzB; g.lineWidth = 3; g.stroke();
  }
  g.fillStyle = foto ? '#2a2420' : '#4b5563'; g.beginPath(); g.arc(0, 0, 3.6, 0, 7); g.fill();   // Achse
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(-0.8, -0.9, 1.1, 0, 7); g.fill();
  g.restore();
}
// Takt-Anzeige (nur Anzeige): Wer dran ist, an dessen Griff zieht sich ein Leuchtring zusammen – trifft er den Griff, ist der
// perfekte Moment (danach verblasst er rötlich bis zum Ende des Fensters). Farbe der Figur auf der Seite (Affe gelb,
// Schweinchen rosa). Nach dem Druck: perfekt = grüner Funkenkranz, gut = kurzer weißer Ring, falsch = rotes Kreuz.
const DRAISINE_RING = {start: 30, ende: 7, fx: 40};
function draisineGriffPunkt(s, seite, mitte, y, schwank){
  const a = s.hebel || 0, gx = seite*DRAISINE_ARM*Math.cos(a), gy = -DRAISINE_PFOSTEN + seite*DRAISINE_ARM*Math.sin(a);
  return [mitte + gx*Math.cos(schwank) - gy*Math.sin(schwank), y + gx*Math.sin(schwank) + gy*Math.cos(schwank)];
}
function draisineSeitenFarbe(seite){
  for(const P of [p1, p2]) if(P && P._draisineSeite === seite) return P.male ? '255,205,90' : '255,150,200';
  return '255,240,210';
}
function draisineTaktZeichnen(s, mitte, y, schwank){
  const T = s.takt, R = DRAISINE_RING, g = ctx;
  g.save();
  if(T.dran && s.hielt[0] && s.hielt[1]){
    const rel = T.t - DRAISINE_TAKT_WEG, [gx, gy] = draisineGriffPunkt(s, T.dran, mitte, y, schwank), farbe = draisineSeitenFarbe(T.dran);
    const vor = DRAISINE_TAKT_WEG + DRAISINE_BEST;   // Schritte vom Stoß bis zum perfekten Moment
    if(rel <= DRAISINE_BEST){   // Ring zieht sich zusammen auf den feinen Zielkreis am Griff
      const k = Math.max(0, Math.min(1, T.t/vor)), r = R.start + (R.ende - R.start)*k*k, a = 0.45 + 0.55*k;
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.2; g.beginPath(); g.arc(gx, gy, R.ende, 0, 7); g.stroke();   // Ziel
      g.strokeStyle = 'rgba(20,14,8,.45)'; g.lineWidth = 5 + 1.5*k; g.beginPath(); g.arc(gx, gy, r, 0, 7); g.stroke();       // dunkler Rand: auch im hellen Nebel sichtbar
      g.strokeStyle = `rgba(${farbe},${a})`; g.lineWidth = 3 + 1.5*k; g.beginPath(); g.arc(gx, gy, r, 0, 7); g.stroke();
      if(Math.abs(rel - DRAISINE_BEST) <= DRAISINE_PERFEKT){   // perfektes Fenster: der Griff leuchtet kräftig
        const q = g.createRadialGradient(gx, gy, 0, gx, gy, 22); q.addColorStop(0, `rgba(${farbe},.95)`); q.addColorStop(0.5, `rgba(${farbe},.45)`); q.addColorStop(1, `rgba(${farbe},0)`);
        g.fillStyle = q; g.beginPath(); g.arc(gx, gy, 22, 0, 7); g.fill();
      }
    } else {   // nach dem besten Moment: Ring liegt am Griff, verblasst rötlich – jetzt aber schnell
      const k = Math.min(1, (rel - DRAISINE_BEST)/(DRAISINE_FENSTER_NACH - DRAISINE_BEST));
      g.strokeStyle = `rgba(${Math.round(255)},${Math.round(200 - 120*k)},${Math.round(150 - 110*k)},${0.9 - 0.7*k})`;
      g.lineWidth = 3.4; g.beginPath(); g.arc(gx, gy, R.ende + 2*Math.sin(rel*0.9), 0, 7); g.stroke();
      if(Math.abs(rel - DRAISINE_BEST) <= DRAISINE_PERFEKT){
        const q = g.createRadialGradient(gx, gy, 0, gx, gy, 22); q.addColorStop(0, `rgba(${farbe},.85)`); q.addColorStop(0.5, `rgba(${farbe},.35)`); q.addColorStop(1, `rgba(${farbe},0)`);
        g.fillStyle = q; g.beginPath(); g.arc(gx, gy, 22, 0, 7); g.fill();
      }
    }
  }
  const F = s.fx;
  if(F){   // Rückmeldung zum letzten Druck am eigenen Griff
    const [gx, gy] = draisineGriffPunkt(s, F.seite, mitte, y, schwank), k = F.t/R.fx;
    if(F.art === 'perfekt'){
      g.strokeStyle = `rgba(140,255,150,${1 - k})`; g.lineWidth = 2;
      for(let i = 0; i < 8; i++){ const w = i*Math.PI/4 + 0.3, r0 = 8 + 14*k, r1 = r0 + 6*(1 - k);
        g.beginPath(); g.moveTo(gx + Math.cos(w)*r0, gy + Math.sin(w)*r0); g.lineTo(gx + Math.cos(w)*r1, gy + Math.sin(w)*r1); g.stroke(); }
    } else if(F.art === 'gut'){
      g.strokeStyle = `rgba(255,255,255,${0.7*(1 - k)})`; g.lineWidth = 1.6; g.beginPath(); g.arc(gx, gy, 8 + 12*k, 0, 7); g.stroke();
    } else {
      g.strokeStyle = `rgba(255,80,60,${1 - k})`; g.lineWidth = 2.6; const r = 6;
      g.beginPath(); g.moveTo(gx - r, gy - r - 10*k); g.lineTo(gx + r, gy + r - 10*k); g.moveTo(gx + r, gy - r - 10*k); g.lineTo(gx - r, gy + r - 10*k); g.stroke();
    }
  }
  g.restore();
}
// Tasten-Blase über dem Hebel: welche Tasten jede Figur halten bzw. drücken muss (wie aktionsHinweis am Hebel). Nur Anzeige.
function draisineTastenText(P){
  const n = P.male ? monkeyPlayer : 3 - monkeyPlayer, pad = typeof padConnected !== 'undefined' && padConnected[n - 1];
  const name = P.male ? 'Affe' : 'Schwein';
  if(pad){ const typ = padTypAktuell[n - 1], S = PADSETS[n][typ] || {}; return `${name}: ${padName(S.griff, typ)} halten + ${padName(S.jump, typ)} im Takt`; }
  return `${name}: ${tasteName(P.keys.griff)} halten + ${tasteName(P.keys.jump)} im Takt`;
}
function draisineHinweis(xr, y, s){
  const nah = P => !!P && Math.abs(P.y - s.y) < 60 && P.x > s.x - 40 && P.x < s.x + s.w + 40;
  const zeilen = [];
  for(const [P, i] of [[p1, 0], [p2, 1]]) if(nah(P) && !(s.hielt && s.hielt[i] && s.kraft[i] > 0.3)) zeilen.push(draisineTastenText(P));
  if(!zeilen.length) return;
  if(zeilen.length === 1 && !(nah(p1) && nah(p2))) zeilen.push('nur zu zweit!');
  else if(zeilen.length) zeilen.push('abwechselnd: drücken, wenn der Ring den Griff trifft');
  ctx.save(); ctx.font = 'bold 12px sans-serif';
  const tw = Math.max(...zeilen.map(z => ctx.measureText(z).width)) + 14, hh = zeilen.length*16 + 6;
  const hy = y - hh + Math.sin(performance.now()*0.006)*2;
  ctx.fillStyle = 'rgba(20,28,38,.85)'; roundRect(xr - tw/2, hy, tw, hh, 6); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  zeilen.forEach((z, k) => ctx.fillText(z, xr, hy + 11.5 + k*16));
  ctx.restore();
}
elementRegistrieren({
  id: 'draisine', name: 'Pump-Draisine', feld: 'draisinen',
  editor: {
    werkzeug: 'draisine', gruppe: 'bewegung', vor: 'move', art: 'punkt', ziehbar: false, farbe: '#b47a40',
    titel: 'Pump-Draisine: Holzplattform (4 Kästchen) mit Pump-Hebel, hängt an einer Tau-Schiene nach rechts. Beide Figuren ' +
           'stehen darauf, halten die Griff-Taste und drücken immer wieder Springen – nur zusammen fährt sie (zum weiter ' +
           'entfernten Ende der Schiene). Setzen am linken Ende; Maus gedrückt halten und nach rechts ziehen = Länge der Schiene',
    optionen: [{key: 'schiene', label: 'Schiene', zahl: true, titel: 'so viele Kästchen weit fährt die Draisine nach rechts (oder beim Setzen ziehen)',
                werte: [['4', '4 Kästchen'], ['6', '6 Kästchen'], ['8', '8 Kästchen'], ['10', '10 Kästchen'], ['14', '14 Kästchen']]}],
    bereich: p => Array.from({length: 4 + (Number(p.schiene) || 8)}, (_, k) => [p.c + k, p.r]),   // Plattform + gezeichnete Schiene
    ziehen(p, c){   // gedrückt halten und ziehen bestimmt die Länge (wie beim Blatt-Floß)
      if(c < p.c + 4) return null;
      const n = Math.min(DRAISINE_SCHIENE_MAX, c - p.c - 3); if(n === Number(p.schiene)) return null;
      p.schiene = n; return `Pump-Draisine: Schiene ${n} Kästchen`;
    },
    zeichnen(ctx, c, r, TILE, p){
      const n = Number(p.schiene) || 8, s = TILE/40, boden = (r + 1)*TILE - 8*s;
      ctx.strokeStyle = 'rgba(180,122,64,.9)'; ctx.setLineDash([6, 4]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(c*TILE + 4, r*TILE + 6*s); ctx.lineTo((c + 4 + n)*TILE - 4, r*TILE + 6*s); ctx.stroke();   // Schiene
      ctx.strokeStyle = 'rgba(180,122,64,.5)'; ctx.strokeRect((c + n)*TILE + 2, r*TILE + 2, 4*TILE - 4, TILE - 4); ctx.setLineDash([]);   // Ende der Fahrt
      ctx.save(); ctx.translate(c*TILE, boden); ctx.scale(s, s); draisineBild(ctx, 0, 0, DRAISINE_BREITE, 0.25, null, 0); ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.strokeText('↔' + n, (c + 4 + n)*TILE - 14, r*TILE + 18*s); ctx.fillText('↔' + n, (c + 4 + n)*TILE - 14, r*TILE + 18*s);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, schiene: Number(p.schiene) || 8})),
  },
  spiel: {
    laden(daten){
      draisinen = (daten.draisinen || []).map(d => {
        // Stehfläche = Boden des Kästchens (liegt IN seiner Reihe, wie das Blatt-Floß)
        const s = {x: d.x, y: d.y + 40, w: DRAISINE_BREITE, h: DRAISINE_DICKE, type: 'draisine', x0: d.x, x1: d.x + (Number(d.schiene) || 8)*40,
          v: 0, tempo: 0, richtung: 0, pause: 0, kraft: [0, 0], greift: [false, false], hielt: [false, false], hebel: 0, hebelZiel: 0,
          hebelVon: 0, takt: {dran: 0, t: 99}, fx: null};
        solids.push(s); return s;
      });
    },
    zuruecksetzen(){
      for(const s of draisinen){ s.x = s.x0; s._px = s.x; s._py = s.y; s.v = s.tempo = 0; s.richtung = 0; s.pause = 0; s.kraft = [0, 0];
        s.hebel = s.hebelZiel = s.hebelVon = 0; s.takt = {dran: 0, t: 99}; s.fx = null; if(typeof seilNachgebenZurueck === 'function') seilNachgebenZurueck(s); }
      for(const P of [p1, p2]) if(P) P._draisineSeite = 0;
    },
    schritt(figuren){
      for(const s of draisinen){
        if(typeof seilNachgebenSchritt === 'function') seilNachgebenSchritt(s, figuren);   // Seile geben nach (elemente/blattfloss.js)
        // Pump-Kraft: klingt ab; wer den Griff nicht hält, hat keine
        for(let i = 0; i < 2; i++) s.kraft[i] = s.greift[i] ? s.kraft[i]*DRAISINE_ABKLINGEN : 0;
        const beide = s.greift[0] && s.greift[1];
        s.hielt = s.greift; s.greift = [false, false];   // hielt: fürs Zeichnen (Tasten-Blase)
        if(s.pause > 0) s.pause--;
        // Takt: Hebel kippt nach dem Stoß in DRAISINE_TAKT_WEG Schritten herüber (weich); Fenster verpasst -> zurück in die Mitte
        const T = s.takt; T.t++;
        if(T.dran && T.t > DRAISINE_TAKT_WEG + DRAISINE_FENSTER_NACH){ T.dran = 0; s.hebelVon = s.hebel; s.hebelZiel = 0; }
        if(!(s.hielt[0] || s.hielt[1])){ T.dran = 0; s.hebelZiel = 0; }   // keiner hält: Takt vorbei
        if(T.dran && T.t <= DRAISINE_TAKT_WEG){ const k = T.t/DRAISINE_TAKT_WEG, e = k*k*(3 - 2*k); s.hebel = s.hebelVon + (s.hebelZiel - s.hebelVon)*e; }
        else s.hebel += (s.hebelZiel - s.hebel)*(T.dran ? 0.3 : 0.06);
        if(s.fx && ++s.fx.t > 40) s.fx = null;
        const ziel = beide && s.pause <= 0 ? Math.min(DRAISINE_MAX, Math.min(s.kraft[0], s.kraft[1])*DRAISINE_TEMPO_JE_KRAFT) : 0;
        if(ziel > 0.05 && !s.richtung) s.richtung = (s.x - s.x0) <= (s.x1 - s.x) ? 1 : -1;   // zum weiter entfernten Ende
        s.tempo += (ziel - s.tempo)*(ziel > s.tempo ? DRAISINE_ANFAHREN : DRAISINE_BREMSEN);
        if(s.tempo < 0.03 && ziel <= 0.05){ s.tempo = 0; }
        s.v = s.richtung*s.tempo;
        if(!s.v) continue;
        let nx = Math.max(s.x0, Math.min(s.x1, s.x + s.v));
        // nicht in Wände/Boden schieben (wie beim Blatt-Floß)
        const fest = solids.some(o => o !== s && !o.gone && o.type !== 'oneway' && o.type !== 'fake' && o.type !== 'door' &&
          nx < o.x + o.w && nx + s.w > o.x && s.y < o.y + o.h && s.y + s.h > o.y);
        if(fest){ s.tempo = 0; s.v = 0; continue; }
        const dx = nx - s.x;
        for(const P of figuren){   // wer darauf steht, fährt mit (nur, wenn dort Platz ist)
          if(!draisineDrauf(P, s)) continue;
          if(spotFree(P.x + dx, P.y, P)) P.x += dx;
        }
        s.x = nx;
        if((s.richtung > 0 && nx >= s.x1) || (s.richtung < 0 && nx <= s.x0)){   // angekommen: anhalten, kurz Pause
          s.tempo = 0; s.v = 0; s.richtung = 0; s.pause = DRAISINE_ENDE_PAUSE; s.kraft = [0, 0];
          if(typeof SFX !== 'undefined' && SFX.lever) SFX.lever(false, s.x + s.w/2);
        }
      }
    },
    // Schiene und ihre Aufhängung HINTER Boden/Wand (wie beim Blatt-Floß)
    zeichnenHinten(){
      const t = performance.now()*0.001;
      for(const s of draisinen){
        const E = draisineSchieneEnden(s), a = E.a - camX, b = E.b - camX;
        if(b < -60 || a > VW + 60) continue;
        const fahrt = Math.min(1, Math.abs(s.v)/DRAISINE_MAX);
        for(const [x, yo, wx] of [[a, E.ya, E.a], [b, E.yb, E.b]]){   // Enden: Liane nach oben bis zum Material bzw. ins Blätterdach
          const pendel = Math.sin(t*0.9 + wx*0.01)*2.2 + fahrt*Math.sin(t*6 + wx)*1.2;
          if(typeof fotoLookAktiv === 'function' && fotoLookAktiv() && typeof fotoLiane === 'function')   // Foto-Look: echte Liane (12e)
            fotoLiane(ctx, x + Math.sin(wx*0.013)*3 + pendel, yo !== null ? yo : -SKY_ROOM - 10, x, E.y - 6, wx, 4.6);
          else lianeZeichnen(x + Math.sin(wx*0.013)*3, yo !== null ? yo : -SKY_ROOM - 10, x, E.y - 6, 0.35, pendel, wx);
          if(yo !== null && typeof hakenHalter === 'function') hakenHalter(x, yo, HAKEN_STIL.dschungel, 'dschungel');
        }
        tauZeichnen(a, E.y, b, E.y, draisineDurchhang(s, t), 3.4);
        for(const x of [a, b]) rolleZeichnen(x, E.y - 1, 5.5, -s.x/5.5);   // Umlenkrollen an den Enden
      }
    },
    zeichnen(){
      const t = performance.now()*0.001;
      for(const s of draisinen){
        const E = draisineSchieneEnden(s);
        if(E.b - camX < -60 || E.a - camX > VW + 60) continue;
        const x = Math.round(s.x - camX), mitte = x + s.w/2, a = E.a - camX, b = E.b - camX, sag = draisineDurchhang(s, t);
        const dy = s.wipp || 0;
        // Schräglage: leichtes Wiegen + Pendeln (Seile geben nach) + Gewicht zur Seite + der Pump-Stoß drückt eine Seite
        const schwank = Math.sin(t*1.5 + s.x0*0.01)*0.006 - (s.pend || 0)*0.004 + (s.neig || 0) + (s.hebel || 0)*0.02;
        // zwei Seilzüge: Rollenwagen auf der Tau-Schiene, Tau hinunter zum Eisenwinkel; die Wagen laufen voraus bzw. hinterher,
        // solange die Plattform nachschwingt (s.pend)
        for(const d of [-1, 1]){
          const kx = mitte + d*DRAISINE_HAENGER_X, ky = s.y + dy + 1 + d*DRAISINE_HAENGER_X*Math.sin(schwank);
          const wx = kx - (s.pend || 0), u = Math.max(0, Math.min(1, (wx - a)/(b - a))), wy = E.y + 2*sag*u*(1 - u);
          tauZeichnen(wx, wy + 6, kx, ky - 2, Math.sin(t*1.4 + kx*0.05)*0.8 + Math.abs(s.pend || 0)*0.08, 2.4);
          rollenwagenZeichnen(wx, wy, -s.x/3.6);
          knotenZeichnen(kx, ky - 3);
        }
        draisineBild(ctx, x, s.y + dy, s.w, s.hebel, s.kraft, schwank);   // kein Schatten (hängt in der Luft)
        draisineHinweis(mitte, E.y - 14, s);
      }
    },
    zeichnenVorne(){   // Takt-Ring und Rückmeldung VOR den Figuren (sonst verdeckt die Figur ihren eigenen Griff)
      const t = performance.now()*0.001;
      for(const s of draisinen){
        const x = Math.round(s.x - camX); if(x + s.w < -60 || x > VW + 60) continue;
        const schwank = Math.sin(t*1.5 + s.x0*0.01)*0.006 - (s.pend || 0)*0.004 + (s.neig || 0) + (s.hebel || 0)*0.02;
        draisineTaktZeichnen(s, x + s.w/2, s.y + (s.wipp || 0), schwank);
      }
    },
  },
});
