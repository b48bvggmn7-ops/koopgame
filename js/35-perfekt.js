// 35-perfekt.js – Teil des Spiels "Monchichi Koop" (Timing-Fähigkeiten, Nutzerwunsch 08.11.).
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.
//
// Beide Figuren bekommen einen „perfekten Moment“ – dieselbe Idee, gleich viel Können:
//   - AFFE: PERFEKT-ABSPRUNG. Wer die Liane im richtigen Moment loslässt (kurz nach dem tiefsten Punkt, im Aufschwung,
//     LIANE_PERFEKT_WINKEL ± LIANE_PERFEKT_BREITE), fliegt deutlich schneller/höher; „gut“ (etwas daneben) gibt etwas
//     Schub. Nach einem Perfekt-Absprung landet er sicher: ohne Taste steht er sofort still (kein Rutschen).
//     Hinweis: die Liane glimmt golden, solange das Fenster offen ist (LIANE_PERFEKT_HINWEIS).
//   - SCHWEINCHEN: FLUG-BALKEN + PERFEKT-AUFSPANNEN. Der Schirm verbraucht beim Segeln Kraft (SCHIRM_DAUER Schritte bis
//     leer; im Aufwind nicht). Leer -> Schirm klappt zu, erst am Boden (oder mit einer Pusteblume) wieder. Pusteblumen
//     (elemente/pusteblume.js) füllen ihn in der Luft auf. PERFEKT-AUFSPANNEN (Nutzerwunsch 10.11., „Zone im Balken“):
//     beim Segeln die Schirm-Taste loslassen -> über dem Kopf läuft ein Lichtpunkt über den Bogen (SCHIRM_FANG_DAUER),
//     ein Stück leuchtet golden (SCHIRM_FANG_GOLD). Wieder aufspannen, während der Punkt im Gold ist = PERFEKT (knapp
//     daneben = GUT): Schwung nach oben, immer etwas weniger als die Fallhöhe seit dem Zuklappen (kein endloses
//     Hochschaukeln), kostet SCHIRM_FANG_KOSTEN vom Balken. Geht überall in der Luft (kein Boden nötig).
// Psychologie (Nutzerwunsch „satisfying“): Vorfreude (Liane glimmt, Schirm flattert, wenn er knapp wird), sofortige
// Belohnung (kurzer Trefferstopp, Funken, Ton, Schrift), abgestufte Rückmeldung (GUT / PERFEKT – knapp daneben lädt zum
// Nochmal ein), Serien (PERFEKT ×2, ×3 … ohne Landen: jedes Mal ein Ton höher), Pusteblumen-Ketten = kleine Melodie.
// Einklinken nur über die Haken der neuen Bewegung (js/32) und eine Bedingung in 08 (Schirm geht nicht, wenn leer).
// Alle Werte hier oben als Konstanten. Zustand an der Figur: P.schirmKraft (0…1), P.schirmLeer, P._schirmSchub,
// P._kette (Serie), P._perfektFlug ('perfekt'|'gut'|null), P._lianeGlanz (0…1, nur Anzeige).

// ---------- Werte ----------
const LIANE_PERFEKT_WINKEL = 30;     // Grad hinter dem tiefsten Punkt (in Schwungrichtung): hier ist der perfekte Moment
const LIANE_PERFEKT_BREITE = 9;      // ± Grad: perfekt (bei normalem Schwung ≈ 6 Schritte = 0,1 s)
const LIANE_GUT_BREITE = 22;         // ± Grad: gut
const LIANE_PERFEKT_MIN = 5;         // px/Schritt: darunter (kaum Schwung) gibt es keinen Perfekt-Absprung
const LIANE_PERFEKT_FAKTOR = 1.1;    // so viel schneller fliegt er nach einem Perfekt-Absprung (gut: LIANE_GUT_FAKTOR); 08.11.: vorher 1,3 – „viel zu stark“
const LIANE_GUT_FAKTOR = 1.04;
const LIANE_PERFEKT_HUB = -0.6;      // dazu ein Hub nach oben (gut: die Hälfte); vorher -1,5
const LIANE_PERFEKT_HINWEIS = true;  // Liane glimmt golden, solange das Fenster offen ist (false = ohne Hilfe)
const SCHIRM_DAUER = 60;             // Schritte Segeln (1 Spielsekunde), bis der Schirm-Balken leer ist
const SCHIRM_LADEN = 40;             // Schritte am Boden von leer bis voll
const SCHIRM_LADE_PAUSE = 5;         // so lange nach dem Landen, bevor er lädt
const SCHIRM_NEUSTART = 0.2;         // leer geflogen: ab so viel Ladung geht der Schirm wieder auf
const SCHIRM_KNAPP = 0.3;            // darunter flattert der Schirm (Warnung)
const SCHIRM_FANG_DAUER = 32;        // Schritte (gut ½ s): so lange läuft der Lichtpunkt einmal über den Bogen
const SCHIRM_FANG_GOLD = [0.62, 0.76];   // goldener Bereich auf dem Bogen (Anteil der Laufzeit) = PERFEKT
const SCHIRM_FANG_GUT = 0.09;        // so viel davor/danach = GUT
// Gezähmt (Nutzerwunsch 11.11.: „man schafft alles ohne die Puste-Hilfe vom Affen“): nur EINMAL pro Flug, wenig Höhe, eher ein
// Sprung nach vorn, danach bleibt der Schirm bis zur Landung zu – nur um irgendwo drauf zu kommen
const SCHIRM_FANG_ANTEIL = 0.25;     // Steighöhe = so viel der Fallhöhe seit dem Zuklappen (GUT: SCHIRM_GUT_ANTEIL davon); vorher 0,9
const SCHIRM_FANG_VOR = 6.5;         // px/Schritt: Schwung nach vorn (Richtungstaste, sonst Flugrichtung/Blickrichtung)
const SCHIRM_GUT_ANTEIL = 0.6;
const SCHIRM_SCHUB_MAX = 300;        // px: höchstens so hoch (7,5 Reihen)
const SCHIRM_FANG_KOSTEN = 0.15;     // so viel vom Balken kostet ein Boost
const PERFEKT_STOPP = 3;             // Trefferstopp (Schritte) bei PERFEKT
const PERFEKT_SPUR = 60;             // Schritte: so lange zieht der Affe nach einem Perfekt-Absprung eine Goldspur
const PERFEKT_TON = [1, 9/8, 5/4, 3/2, 5/3, 2, 9/4, 5/2, 3, 10/3, 4];   // Tonleiter für Serien (Pentatonik, immer schön)

const perfektFx = [];   // Effekte (Funken, Ringe, Samen, Schrift); im Takt gerechnet, nur gezeichnet
function perfektFxDazu(o){ perfektFx.push(o); if(perfektFx.length > 400) perfektFx.splice(0, perfektFx.length - 400); }
const perfektZufall = (a, b) => a + Math.random()*(b - a);   // nur für Effekte (nie für Spielzustand)

// ---------- Affe: Perfekt-Absprung ----------
// Bewertung beim Loslassen (vor dem normalen Schub): 'perfekt' | 'gut' | null
function lianeWinkelVor(P){
  const A = P.anchor; if(!A) return null;
  const dx = P.x - A.x, dy = P.y - P.h*0.6 - A.y, s = Math.sign(P.vx);
  if(!s || dy <= 0) return null;
  return Math.atan2(dx, dy)*180/Math.PI*s;   // > 0 = schon am tiefsten Punkt vorbei, in Schwungrichtung
}
function lianePerfektBewerten(P){
  if(!P.male || (P._lianeHalten || 0) < LIANE_BOOST_HALTEN || Math.hypot(P.vx, P.vy) < LIANE_PERFEKT_MIN) return null;
  const a = lianeWinkelVor(P); if(a === null) return null;
  const d = Math.abs(a - LIANE_PERFEKT_WINKEL);
  return d <= LIANE_PERFEKT_BREITE ? 'perfekt' : d <= LIANE_GUT_BREITE ? 'gut' : null;
}
// nach dem normalen Absprung-Schub (js/32 lianeLoslassen / Springen am Seil)
function lianePerfektAnwenden(P, note){
  if(!note) return;
  const f = note === 'perfekt' ? LIANE_PERFEKT_FAKTOR : LIANE_GUT_FAKTOR;
  P.vx *= f; P.vy = P.vy*f + LIANE_PERFEKT_HUB*(note === 'perfekt' ? 1 : 0.5);
  P._perfektFlug = note; P._perfektSpur = note === 'perfekt' ? PERFEKT_SPUR : 0;
  perfektBelohnen(P, note, P.x, P.y - P.h*0.6, 'liane');
}

// ---------- Schweinchen: Flug-Balken ----------
function schirmTaste(P){ return !!(P.keys && P.keys.glide && isDown(P.keys.glide)); }
// Fang-Fenster: wo steht der Lichtpunkt (0…1 über den Bogen) und wie ist der Moment? 'perfekt' | 'gut' | null
function schirmFangStand(P){ return P._fang ? P._fang.t/SCHIRM_FANG_DAUER : -1; }
function schirmFangNote(q){
  const [a, b] = SCHIRM_FANG_GOLD;
  if(q >= a && q <= b) return 'perfekt';
  if(q >= a - SCHIRM_FANG_GUT && q <= b + SCHIRM_FANG_GUT) return 'gut';
  return null;
}
function schirmFangBoost(P, note, moveDir){
  const fall = Math.max(0, P.y - P._fang.y0);   // so tief ist sie seit dem Zuklappen gefallen
  let hoehe = Math.min(SCHIRM_SCHUB_MAX, fall*SCHIRM_FANG_ANTEIL);
  if(note === 'gut') hoehe *= SCHIRM_GUT_ANTEIL;
  P._fang = null;
  P._fangGenutzt = true;                 // nur einmal pro Flug
  P._schirmZuBisLanden = true;           // danach kein Segeln mehr bis zur Landung (08)
  const dir = moveDir || Math.sign(P.vx) || P.facing || 1;
  P.vx = dir*Math.max(Math.abs(P.vx), SCHIRM_FANG_VOR*(note === 'gut' ? 0.75 : 1));   // Sprung nach vorn
  P.vy = -Math.sqrt(2*GRAVITY*Math.max(4, hoehe));
  P.schirmKraft = Math.max(0, P.schirmKraft - SCHIRM_FANG_KOSTEN);
  P._schirmSchub = true; P.glideTimer = 0; P.sprungKurzMoeglich = false;
  P._pirouetteT = performance.now();   // nur Anzeige: Pirouette mit Schirm (js/33, js/10)
  perfektBelohnen(P, note, P.x, P.y - P.h - 40, 'schirm');
}
// vor dem Tempo (aus js/32): true = Tempo gesetzt (Steigen nach dem Perfekt-Aufspannen, Schirm offen)
function schirmVorher(P, moveDir){
  if(P.schirmKraft === undefined){ P.schirmKraft = 1; P.schirmLeer = false; P._schirmPause = 0; }
  const taste = schirmTaste(P), neu = taste && !P._schirmTasteWar, los = !taste && P._schirmTasteWar;
  P._schirmTasteWar = taste;
  const frei = P.grounded || P.inWater || P.haft || P.trampolin || P.dash;
  if(P.grounded || P.inWater || P.haft){ P._fangGenutzt = false; P._schirmZuBisLanden = false; }   // gelandet: wieder frei
  // Zuklappen beim Segeln: das Fang-Fenster startet (Lichtpunkt läuft los) – nur einmal pro Flug
  if(los && P.gliding && !P._schirmSchub && !frei && !P.schirmLeer && !P._fangGenutzt) P._fang = {t: 0, y0: P.y};
  if(P._fang){
    if(frei || P.schirmLeer){ P._fang = null; }
    else if(neu){ const note = schirmFangNote(schirmFangStand(P)); if(note) schirmFangBoost(P, note, moveDir); else P._fang = null; }
    else if(++P._fang.t > SCHIRM_FANG_DAUER) P._fang = null;   // Punkt ist durchgelaufen
  }
  if(!P._schirmSchub) return false;
  if(!taste || P.grounded || P.inWater || P.haft || P.vy > -1){ P._schirmSchub = false; return false; }
  // Steigen mit offenem Schirm (vom Luftpolster getragen): Luft-Steuerung wie sonst, kein Segel-Bremsen
  P.vx += moveDir*MOVE_SPEED*0.35*AIR_CONTROL;
  if(!moveDir){ P.vx *= FRICTION_AIR; if(Math.abs(P.vx) < 0.05) P.vx = 0; }
  P.vx = Math.max(-SPRINT_MAX_SPEED, Math.min(SPRINT_MAX_SPEED, P.vx));
  P.vy += GRAVITY;
  P.gliding = true; P.glideTimer = 0;
  return true;
}
// nach dem Bewegen (aus js/32): Balken leeren/laden, Fallhöhe merken
function schirmNachher(P){
  if(P.schirmKraft === undefined) return;
  const frei = P.grounded || P.inWater || P.haft;
  P._hoechsterY = frei || P._hoechsterY === undefined ? P.y : Math.min(P._hoechsterY, P.y);   // höchster Punkt seit dem Abheben
  if(P.gliding && !P._schirmSchub && !P.grounded){
    if(!(winds.length && typeof inWind === 'function' && inWind(P))){   // im Aufwind trägt der Wind – kein Verbrauch
      const vorher = P.schirmKraft;
      P.schirmKraft = Math.max(0, P.schirmKraft - 1/SCHIRM_DAUER);
      if(vorher >= SCHIRM_KNAPP && P.schirmKraft < SCHIRM_KNAPP && typeof SFX !== 'undefined' && SFX.schirmKnapp) SFX.schirmKnapp(P);
      if(schrittNr() % 6 === 0) perfektFxDazu({art: 'samen', x: P.x + perfektZufall(-26, 26), y: P.y - P.h - 40 + perfektZufall(-6, 6),
        vx: -P.vx*0.25 + perfektZufall(-0.4, 0.4), vy: perfektZufall(-0.7, -0.2), dreh: perfektZufall(0, 6), leben: 80, max: 80});
      if(P.schirmKraft <= 0){
        P.schirmLeer = true;
        if(typeof SFX !== 'undefined' && SFX.schirmLeer) SFX.schirmLeer(P);
        for(let i = 0; i < 6; i++) perfektFxDazu({art: 'samen', x: P.x + perfektZufall(-24, 24), y: P.y - P.h - 36, vx: perfektZufall(-1.2, 1.2), vy: perfektZufall(-1.4, -0.4), dreh: perfektZufall(0, 6), leben: 70, max: 70});
      }
    }
    P._schirmPause = SCHIRM_LADE_PAUSE;
  } else if(P.grounded){
    if(P._schirmPause > 0) P._schirmPause--;
    else if(P.schirmKraft < 1){
      P.schirmKraft = Math.min(1, P.schirmKraft + 1/SCHIRM_LADEN);
      if(P.schirmKraft >= 1) P._schirmVollT = performance.now();
    }
  }
  if(P.schirmLeer && P.schirmKraft >= SCHIRM_NEUSTART) P.schirmLeer = false;
}
// Pusteblume eingesammelt (elemente/pusteblume.js): Balken auffüllen, Serie = Melodie
function schirmAuffuellen(P, menge, b){
  P.schirmKraft = Math.min(1, (P.schirmKraft === undefined ? 1 : P.schirmKraft) + menge);
  if(P.schirmKraft >= SCHIRM_NEUSTART) P.schirmLeer = false;
  P._blumenKette = P.grounded ? 0 : (P._blumenKette || 0) + 1;
  P._schirmFuellT = performance.now();
  if(typeof SFX !== 'undefined' && SFX.pusteblume) SFX.pusteblume(b.x, P._blumenKette);
  for(let i = 0; i < 16; i++){
    const w = perfektZufall(0, Math.PI*2), v = perfektZufall(1.5, 3.5);
    perfektFxDazu({art: 'zug', x: b.x + Math.cos(w)*10, y: b.y + Math.sin(w)*10, vx: Math.cos(w)*v, vy: Math.sin(w)*v, ziel: P, leben: 60, max: 60, dreh: w});
  }
}

// ---------- Belohnung (beide) ----------
function perfektBelohnen(P, note, x, y, art){
  const perfekt = note === 'perfekt';
  P._kette = perfekt ? (P._kette || 0) + 1 : 0;
  const k = P._kette;
  if(typeof SFX !== 'undefined'){
    if(perfekt && SFX.perfekt) SFX.perfekt(P, k, art);
    else if(!perfekt && SFX.perfektGut) SFX.perfektGut(P, art);
  }
  if(perfekt){
    neuTrefferStopp = Math.max(neuTrefferStopp, PERFEKT_STOPP);
    if(art === 'schirm' && typeof kameraStoss === 'function') kameraStoss(1.5);
  }
  const text = perfekt ? (k >= 2 ? 'PERFEKT ×' + k : 'PERFEKT!') : 'GUT';
  // Schweinchen: Schrift fliegt über dem Schirm mit (sie steigt sonst in die Schrift hinein und verdeckt die Pirouette)
  perfektFxDazu({art: 'text', x: P.x, y: P.y - P.h - (art === 'schirm' ? 128 : 56), text, perfekt, leben: perfekt ? 66 : 46, max: perfekt ? 66 : 46, figur: P,
                 folgen: art === 'schirm' ? P.h + 104 : 0});
  const n = perfekt ? 18 : 7;
  if(art === 'liane'){
    perfektFxDazu({art: 'ring', x, y, r0: 8, r1: perfekt ? 70 : 36, leben: 20, max: 20, perfekt});
    if(perfekt) perfektFxDazu({art: 'ring', x, y, r0: 4, r1: 40, leben: 14, max: 14, perfekt});
    for(let i = 0; i < n; i++){ const w = perfektZufall(0, Math.PI*2), v = perfektZufall(1.5, perfekt ? 5 : 3);
      perfektFxDazu({art: 'funke', x, y, vx: Math.cos(w)*v + P.vx*0.3, vy: Math.sin(w)*v + P.vy*0.3, leben: 30, max: 30, perfekt}); }
  } else {
    // Luftstoß unter dem aufschnappenden Schirm: flacher Ring (weht nach unten weg), Samen fliegen vom Schirm
    perfektFxDazu({art: 'polster', x, y: y + 30, leben: 22, max: 22, perfekt});
    for(let i = 0; i < (perfekt ? 8 : 4); i++) perfektFxDazu({art: 'samen', x: x + perfektZufall(-30, 30), y: y + perfektZufall(-6, 6),
      vx: perfektZufall(-1.6, 1.6), vy: perfektZufall(0.4, 1.6), dreh: perfektZufall(0, 6), leben: 60, max: 60});
    for(let i = 0; i < n; i++){ const w = perfektZufall(-Math.PI*0.9, -Math.PI*0.1), v = perfektZufall(1.5, perfekt ? 5 : 3);
      perfektFxDazu({art: 'funke', x: P.x + Math.cos(w)*20, y: P.y - P.h - 30, vx: Math.cos(w)*v, vy: Math.sin(w)*v, leben: 30, max: 30, perfekt}); }
  }
}

// ---------- Einklinken (aus js/32-neue-bewegung.js) ----------
function perfektVorher(P, moveDir){
  if(P.male) return false;
  return schirmVorher(P, moveDir);
}
function perfektNachher(P){
  if(!P.male){ schirmNachher(P); }
  else {
    // Liane-Hinweis (nur Anzeige): wie nah ist der perfekte Moment?
    let ziel = 0;
    if(LIANE_PERFEKT_HINWEIS && P.hookAttached && !P.grounded && typeof lianeNeu === 'function' && lianeNeu(P) &&
       (P._lianeHalten || 0) >= LIANE_BOOST_HALTEN && Math.hypot(P.vx, P.vy) >= LIANE_PERFEKT_MIN){
      const a = lianeWinkelVor(P);
      if(a !== null){ const d = Math.abs(a - LIANE_PERFEKT_WINKEL); ziel = d <= LIANE_PERFEKT_BREITE ? 1 : d <= LIANE_GUT_BREITE ? 0.4*(1 - (d - LIANE_PERFEKT_BREITE)/(LIANE_GUT_BREITE - LIANE_PERFEKT_BREITE)) + 0.15 : 0; }
    }
    P._lianeGlanz = (P._lianeGlanz || 0) + (ziel - (P._lianeGlanz || 0))*0.45;
    if(P._lianeGlanz < 0.01) P._lianeGlanz = 0;
  }
  // Flug nach einem Perfekt-Moment: Goldspur, sicheres Landen
  if(P._perfektSpur > 0){
    P._perfektSpur--;
    if(schrittNr() % 2 === 0) perfektFxDazu({art: 'spur', x: P.x + perfektZufall(-5, 5), y: P.y - P.h*0.5 + perfektZufall(-6, 6), leben: 26, max: 26});
  }
  if(P.grounded || P.inWater || P.hookAttached){
    if(P.grounded && P._perfektFlug && P.male){
      if(!P._moveDir){ P.vx = 0; }   // Perfekt stehen: kein Rutschen
      if(P._perfektFlug === 'perfekt'){
        if(typeof SFX !== 'undefined' && SFX.perfektLanden) SFX.perfektLanden(P);
        perfektFxDazu({art: 'polster', x: P.x, y: P.y, leben: 18, max: 18, perfekt: true, klein: true});
        for(let i = 0; i < 8; i++){ const w = perfektZufall(-Math.PI, 0), v = perfektZufall(1, 2.6);
          perfektFxDazu({art: 'funke', x: P.x + Math.cos(w)*8, y: P.y - 4, vx: Math.cos(w)*v, vy: Math.sin(w)*v*0.6, leben: 24, max: 24, perfekt: true}); }
      }
    }
    if(P.grounded || P.inWater){ P._kette = 0; P._blumenKette = 0; P._perfektSpur = 0; }
    P._perfektFlug = null;
  }
}
// einmal pro Physik-Schritt (aus js/32 neueBewegungSchritt): Effekte weiterrechnen
function perfektSchritt(){
  for(const f of perfektFx){
    f.leben--;
    if(f.art === 'funke'){ f.x += f.vx; f.y += f.vy; f.vx *= 0.92; f.vy = f.vy*0.92 + 0.08; }
    else if(f.art === 'staub'){ f.x += f.vx; f.y += f.vy; f.vx *= 0.9; f.vy *= 0.9; }
    else if(f.art === 'samen'){ f.dreh += 0.05; f.x += f.vx + Math.sin(f.dreh)*0.35; f.y += f.vy; f.vy = f.vy*0.99 - 0.004; f.vx *= 0.985; }
    else if(f.art === 'zug'){   // Samen der Pusteblume fliegen zum Schirm
      const Z = f.ziel, zx = Z.x, zy = Z.y - Z.h - 36, dx = zx - f.x, dy = zy - f.y, d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, (f.max - f.leben)/18);
      f.vx = f.vx*(0.9 - 0.1*k) + dx/d*1.6*k; f.vy = f.vy*(0.9 - 0.1*k) + dy/d*1.6*k;
      f.x += f.vx; f.y += f.vy; f.dreh += 0.2;
      if(d < 14 && k >= 1){ f.leben = 0; perfektFxDazu({art: 'funke', x: f.x, y: f.y, vx: perfektZufall(-1, 1), vy: perfektZufall(-1.5, -0.3), leben: 16, max: 16, perfekt: false, hell: true}); }
    }
  }
  for(let i = perfektFx.length - 1; i >= 0; i--) if(perfektFx[i].leben <= 0) perfektFx.splice(i, 1);
}
function perfektZuruecksetzen(){
  perfektFx.length = 0;
  for(const P of [p1, p2]) if(P){ P.schirmKraft = 1; P.schirmLeer = false; P._schirmPause = 0; P._schirmSchub = false; P._kette = 0;
    P._blumenKette = 0; P._perfektFlug = null; P._perfektSpur = 0; P._lianeGlanz = 0; P._hoechsterY = undefined; P._fang = null;
    P._fangGenutzt = false; P._schirmZuBisLanden = false; }
}

// ---------- Zeichnen (nur Anzeige) ----------
const PERFEKT_GOLD = ['#fff6c4', '#ffd45a', '#f0a020'];
// Liane glimmt golden, solange das Perfekt-Fenster offen ist: weicher Schein + Lichtpunkte, die zur Hand laufen
function lianeGlanzZeichnen(P){
  const g = P._lianeGlanz || 0, A = P.anchor;
  if(g < 0.02 || !A || !P.hookAttached) return;
  const t = performance.now()*0.001, ax = A.x - camX, ay = A.y;
  let hx = P.x - camX, hy = P.y - P.h*0.6;
  if(P._handDev && P._handDev.f === P._frameNo){   // die Liane endet an der echten Hand der 3D-Figur (js/33)
    const h = ctx.getTransform().inverse().transformPoint(new DOMPoint(P._handDev.x, P._handDev.y)); hx = h.x; hy = h.y;
  }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(255,190,70,${0.28*g})`; ctx.lineWidth = 14;
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.strokeStyle = `rgba(255,226,140,${0.5*g})`; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.strokeStyle = `rgba(255,250,225,${0.7*g})`; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(hx, hy); ctx.stroke();
  for(let i = 0; i < 5; i++){   // Lichtpunkte wandern zur Hand
    const q = (t*1.8 + i/5) % 1, x = ax + (hx - ax)*q, y = ay + (hy - ay)*q;
    ctx.fillStyle = `rgba(255,248,215,${g*Math.sin(q*Math.PI)})`; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill();
  }
  if(g > 0.6){   // am Griff ein kleiner Stern: JETZT
    const r = 7 + 4*g + Math.sin(t*20)*1.5;
    const sg = ctx.createRadialGradient(hx, hy, 0, hx, hy, r*2.2);
    sg.addColorStop(0, `rgba(255,246,200,${0.9*g})`); sg.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(hx, hy, r*2.2, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = `rgba(255,252,230,${g})`; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(hx - r, hy); ctx.lineTo(hx + r, hy); ctx.moveTo(hx, hy - r); ctx.lineTo(hx, hy + r); ctx.stroke();
  }
  ctx.restore();
}
// Schirm-Balken: Bogen über der Kuppel (folgt dem Schirm, Matrix aus drawUmbrella), sonst klein über dem Kopf
function schirmBalkenBogen(cx, cy, rx, ry, k, dicke, farbeVoll, leer, fuell){
  const a0 = Math.PI + 0.18, a1 = Math.PI*2 - 0.18, am = a0 + (a1 - a0)*Math.max(0, Math.min(1, k));
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(38,22,40,.55)'; ctx.lineWidth = dicke + 3;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, a0, a1); ctx.stroke();
  ctx.strokeStyle = leer ? 'rgba(150,140,150,.55)' : 'rgba(255,230,240,.18)'; ctx.lineWidth = dicke;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, a0, a1); ctx.stroke();
  if(k > 0.005){
    const gr = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
    gr.addColorStop(0, farbeVoll[0]); gr.addColorStop(1, farbeVoll[1]);
    ctx.strokeStyle = gr; ctx.lineWidth = dicke;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, a0, am); ctx.stroke();
    // heller Kopf am Ende der Füllung (dort lösen sich die Samen)
    const ex = cx + Math.cos(am)*rx, ey = cy + Math.sin(am)*ry;
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(ex, ey, dicke*0.45, 0, Math.PI*2); ctx.fill();
  }
  if(fuell > 0){   // gerade aufgefüllt: heller Schein über den ganzen Bogen
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(255,255,230,${0.7*fuell})`; ctx.lineWidth = dicke + 5;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, a0, am); ctx.stroke(); ctx.restore();
  }
  // Viertel-Kerben
  ctx.strokeStyle = 'rgba(38,22,40,.5)'; ctx.lineWidth = 1.2;
  for(const q of [0.25, 0.5, 0.75]){ const a = a0 + (a1 - a0)*q, c = Math.cos(a), s = Math.sin(a);
    ctx.beginPath(); ctx.moveTo(cx + c*(rx - dicke*0.6), cy + s*(ry - dicke*0.6)); ctx.lineTo(cx + c*(rx + dicke*0.6), cy + s*(ry + dicke*0.6)); ctx.stroke(); }
}
function schirmBalkenZeichnen(P){
  if(P.schirmKraft === undefined || P.male) return;
  const jetzt = performance.now(), k = P.schirmKraft;
  const frischVoll = P._schirmVollT && jetzt - P._schirmVollT < 500;
  const fuell = P._schirmFuellT ? Math.max(0, 1 - (jetzt - P._schirmFuellT)/450) : 0;
  const knapp = k < SCHIRM_KNAPP && !P.schirmLeer;
  const puls = knapp ? 0.5 + 0.5*Math.sin(jetzt*0.025) : 0;
  const farbe = P.schirmLeer || P._schirmZuBisLanden ? ['#b9b0b8', '#d8d0d6'] : knapp ? [`rgb(255,${Math.round(120 + 60*puls)},${Math.round(90 + 40*puls)})`, '#ff6f61'] : ['#fff3cf', '#ff8fc0'];
  const offen = P.umbrella > 0.25 && P._schirmMat && jetzt - P._schirmMatT < 60;
  if(offen){
    ctx.save(); ctx.setTransform(P._schirmMat);
    const u = P.umbrella; ctx.scale(0.3 + 0.7*u, 0.45 + 0.55*u);
    schirmBalkenBogen(0, 0, 45, 31, k, 4.5, farbe, P.schirmLeer, fuell);
    if(knapp){   // Schirmkante flattert (Warnung)
      ctx.strokeStyle = `rgba(255,255,255,${0.35 + 0.4*puls})`; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
      for(const s of [-1, 1]){ const w = Math.sin(jetzt*0.04 + s)*3;
        ctx.beginPath(); ctx.moveTo(s*38, 2); ctx.quadraticCurveTo(s*44, 6 + w, s*48, 3 - w); ctx.stroke(); }
    }
    ctx.restore();
    return;
  }
  const px = P.x - camX, py = P.y + (P._standDy || 0);
  if(P._fang){ schirmFangZeichnen(P, px, py - P.h - 18, k, farbe); return; }
  if(k >= 1 && !frischVoll && !fuell) return;   // voll und ruhig: nichts anzeigen
  ctx.save();
  ctx.globalAlpha = k >= 1 ? Math.max(0, 1 - (jetzt - (P._schirmVollT || 0))/500) : 1;
  schirmBalkenBogen(px, py - P.h - 8, 15, 11, k, 3.2, farbe, P.schirmLeer, fuell);
  if(frischVoll){ const q = (jetzt - P._schirmVollT)/500; ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#fff6d8'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(px, py - P.h - 8, 15 + q*10, 11 + q*7, 0, Math.PI, Math.PI*2); ctx.stroke(); }
  ctx.restore();
}
// Fang-Fenster (Schirm zu): großer Bogen über dem Kopf (so groß wie die Schirmkuppel) – darauf der Flug-Balken (gedämpft),
// das goldene Stück (PERFEKT) mit silbernen Rändern (GUT) und der laufende Lichtpunkt mit Schweif. Ist der Punkt im Gold,
// leuchtet das Gold auf (jetzt!).
function schirmFangZeichnen(P, cx, cy, k, farbe){
  const rx = 40, ry = 28, a0 = Math.PI + 0.18, a1 = Math.PI*2 - 0.18, w = q => a0 + (a1 - a0)*Math.max(0, Math.min(1, q));
  const q = schirmFangStand(P), note = schirmFangNote(q), [g0, g1] = SCHIRM_FANG_GOLD, t = performance.now();
  const ein = Math.min(1, P._fang.t/4);   // weich einblenden
  ctx.save(); ctx.globalAlpha = 0.6*ein;
  schirmBalkenBogen(cx, cy, rx, ry, k, 3.5, farbe, P.schirmLeer, 0);
  ctx.globalAlpha = ein; ctx.lineCap = 'round';
  const bogen = (qa, qb, breite, farbe2) => { ctx.strokeStyle = farbe2; ctx.lineWidth = breite; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, w(qa), w(qb)); ctx.stroke(); };
  bogen(g0 - SCHIRM_FANG_GUT, g0, 4, 'rgba(225,240,255,.75)');   // GUT davor/danach
  bogen(g1, g1 + SCHIRM_FANG_GUT, 4, 'rgba(225,240,255,.75)');
  const jetztGold = note === 'perfekt', glanz = jetztGold ? 0.75 + 0.25*Math.sin(t*0.03) : 0.35;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  bogen(g0, g1, jetztGold ? 16 : 11, `rgba(255,190,60,${0.35*glanz})`);
  ctx.restore();
  bogen(g0, g1, 6, '#5a3a10');                                   // dunkler Rand: Gold hebt sich vom Nebel ab
  bogen(g0, g1, 4.5, jetztGold ? '#fff2a8' : '#ffd24a');
  // Schweif + Lichtpunkt
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for(let i = 1; i <= 6; i++){ const qq = q - i*0.025; if(qq < 0) break;
    const a = w(qq); ctx.fillStyle = `rgba(255,250,230,${0.45*(1 - i/7)})`;
    ctx.beginPath(); ctx.arc(cx + Math.cos(a)*rx, cy + Math.sin(a)*ry, 4.5 - i*0.5, 0, Math.PI*2); ctx.fill(); }
  const a = w(q), dx = cx + Math.cos(a)*rx, dy = cy + Math.sin(a)*ry;
  const sg = ctx.createRadialGradient(dx, dy, 0, dx, dy, 14);
  sg.addColorStop(0, 'rgba(255,255,240,.95)'); sg.addColorStop(1, 'rgba(255,230,160,0)');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(dx, dy, 14, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgba(60,40,20,.7)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(dx, dy, 4.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.restore();
}
// Pusteblumen-Samen (fliegen weg bzw. zum Schirm): feiner Stiel + Schirmchen
function samenZeichnen(x, y, dreh, a, gr){
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(dreh)*0.5); ctx.globalAlpha = a;
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 6*gr); ctx.stroke();
  for(let i = -2; i <= 2; i++){ ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(i*1.6*gr, -3*gr + Math.abs(i)*0.6*gr); ctx.stroke(); }
  ctx.fillStyle = 'rgba(180,160,110,.9)'; ctx.beginPath(); ctx.arc(0, 6*gr, 0.9*gr, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
function perfektTextZeichnen(f){
  const q = 1 - f.leben/f.max;
  const pop = q < 0.12 ? 0.55 + q/0.12*0.7 : 1.25 - Math.min(0.25, (q - 0.12)*1.6);   // springt auf, setzt sich
  const a = q > 0.65 ? 1 - (q - 0.65)/0.35 : 1;
  const y0 = f.folgen ? f.figur.y - f.folgen : f.y, x0 = f.folgen ? f.figur.x : f.x;
  const y = y0 - 30*(1 - Math.pow(1 - Math.min(1, q*1.5), 3));
  const x = x0 - camX, gr = f.perfekt ? 36 : 24;
  ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop); ctx.globalAlpha = a;
  ctx.font = `900 ${gr}px "Big Shoulders Display", "Manrope", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if(f.perfekt){
    const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, gr*2.4);
    sg.addColorStop(0, 'rgba(255,200,90,.28)'); sg.addColorStop(1, 'rgba(255,180,60,0)');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, gr*2.4, 0, Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.lineJoin = 'round'; ctx.strokeStyle = f.perfekt ? '#4a2a10' : '#23384a'; ctx.lineWidth = 6; ctx.strokeText(f.text, 0, 0);
  const g = ctx.createLinearGradient(0, -gr/2, 0, gr/2);
  if(f.perfekt){ g.addColorStop(0, '#fffbe0'); g.addColorStop(0.5, '#ffd24a'); g.addColorStop(1, '#f39a1e'); }
  else { g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#bfe3f2'); }
  ctx.fillStyle = g; ctx.fillText(f.text, 0, 0);
  if(f.perfekt && q < 0.5){   // Glitzer am Wort
    const w = ctx.measureText(f.text).width/2;
    ctx.fillStyle = `rgba(255,255,255,${1 - q*2})`;
    for(const [sx, sy] of [[-w - 4, -gr*0.45], [w + 3, -gr*0.2], [w*0.3, -gr*0.7]]){ ctx.beginPath(); ctx.arc(sx, sy, 1.8, 0, Math.PI*2); ctx.fill(); }
  }
  ctx.restore();
}
function perfektZeichnen(){
  for(const P of [p1, p2]) if(P && P.male && !(deathState && deathState.victim === P)) lianeGlanzZeichnen(P);
  for(const f of perfektFx){
    const k = f.leben/f.max, x = f.x - camX;
    if(x < -80 || x > VW + 80) continue;
    if(f.art === 'funke'){
      const c = f.hell ? '#ffffff' : f.perfekt ? PERFEKT_GOLD[1] : '#d8f0ff';
      ctx.globalAlpha = Math.min(1, k*1.5); ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(x, f.y, 1.2 + 2*k, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    } else if(f.art === 'ring'){
      const q = 1 - k, r = f.r0 + (f.r1 - f.r0)*(1 - Math.pow(1 - q, 3));
      ctx.strokeStyle = f.perfekt ? `rgba(255,214,100,${k})` : `rgba(220,240,255,${k*0.8})`; ctx.lineWidth = 3*k + 0.5;
      ctx.beginPath(); ctx.arc(x, f.y, r, 0, Math.PI*2); ctx.stroke();
    } else if(f.art === 'polster'){
      const q = 1 - k, rx = (f.klein ? 14 : 22) + q*(f.klein ? 22 : 46), ry = (f.klein ? 3 : 5) + q*(f.klein ? 3 : 7);
      ctx.strokeStyle = f.perfekt ? `rgba(255,236,180,${k*0.9})` : `rgba(230,245,255,${k*0.7})`; ctx.lineWidth = 2.5*k + 0.5;
      ctx.beginPath(); ctx.ellipse(x, f.y - 2, rx, ry, 0, 0, Math.PI*2); ctx.stroke();
      if(!f.klein){ ctx.strokeStyle = `rgba(255,255,255,${k*0.5})`; ctx.lineWidth = 1.5;
        for(const s of [-1, 1]){ ctx.beginPath(); ctx.moveTo(x + s*rx*0.4, f.y - 6 - q*10); ctx.lineTo(x + s*rx*0.5, f.y - 22 - q*26); ctx.stroke(); } }
    } else if(f.art === 'staub'){
      ctx.globalAlpha = 0.5*k; ctx.fillStyle = '#efe6d4';
      ctx.beginPath(); ctx.arc(x, f.y, f.r*(1.5 - k*0.5), 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
    } else if(f.art === 'samen'){
      samenZeichnen(x, f.y, f.dreh, Math.min(1, k*1.6)*0.9, 1.1);
    } else if(f.art === 'zug'){
      samenZeichnen(x, f.y, f.dreh, 0.95, 1);
    } else if(f.art === 'spur'){
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const r = 2 + 4*k, sg = ctx.createRadialGradient(x, f.y, 0, x, f.y, r*2);
      sg.addColorStop(0, `rgba(255,236,160,${0.7*k})`); sg.addColorStop(1, 'rgba(255,190,70,0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(x, f.y, r*2, 0, Math.PI*2); ctx.fill(); ctx.restore();
    }
  }
  for(const P of [p1, p2]) if(P && !(deathState && deathState.victim === P)) schirmBalkenZeichnen(P);
  for(const f of perfektFx) if(f.art === 'text') perfektTextZeichnen(f);
}
