// tests/bahnen.js – Bahnen-Test der ALTEN Mechaniken (Nacht-Ausbau, Phase 0).
// Läuft im Spiel (Testlevel levels/test/bahnen.json): feste Eingabefolgen für Affe und Schweinchen, Schritt für Schritt
// über stepSim() (ohne Bildschirm-Takt), und die Bahn jeder Figur wird aufgezeichnet (x, y, vx, vy, Boden, Wand, Seil,
// Schirm). Die Referenz (tests/bahnen_referenz.json) wurde VOR dem Einbau der neuen Mechaniken (Dash, Durchbruch-Wand,
// Wand-Rutschen, Haftfläche) aufgezeichnet und darf nicht angepasst werden: Jede Abweichung = Fehler im Spiel.
// Aufzeichnen (nur einmal, vor dem Ausbau): bahnenAufzeichnen() – die Szenarien steuern dabei „wie ein Spieler“
// (reagieren auf den Zustand); gespeichert werden nur die gedrückten Tasten je Schritt. Abspielen: bahnenAbspielen(ref).

(function(){
  window.hakenTippen = true;   // Referenz wurde mit der alten Haken-Bedienung aufgezeichnet (G antippen statt halten)
  const TS0 = 100000, TS_SCHRITT = 1000 / 54;   // gleichmäßiger „Bildschirm-Takt“ für die Zeitfenster (Wandsprung)
  const ALLE = ['left', 'right', 'jump', 'hook', 'glide', 'pull', 'slack', 'use'];
  const K = 40;
  const at = (c, r) => ({x: c * K + 20, y: (r + 1) * K});   // Füße in Spalte c auf Reihe r

  function alleLos(){ for(const k in KEYS) KEYS[k] = false; for(const k in PAD) PAD[k] = false; }
  // Tasten eines Schritts setzen; „gerade gedrückt“ nur beim Übergang aus -> an (wie bei der echten Tastatur)
  function tastenSetzen(pl, liste){
    for(const a of ALLE){
      const code = pl.keys[a]; if(!code) continue;
      const an = liste.includes(a);
      if(an && !KEYS[code]) KEYS[code + '_pressed'] = true;
      if(!an && KEYS[code]) KEYS[code + '_pressed'] = false;
      KEYS[code] = an;
    }
  }
  function zustand(pl){
    return [pl.x, pl.y, pl.vx, pl.vy, pl.grounded ? 1 : 0, pl.onWall || 0, pl.hookAttached ? 1 : 0, pl.gliding ? 1 : 0,
            pl.ropeLen || 0];
  }
  function stellen(pl, p){ pl.x = p.x; pl.y = p.y; pl.vx = 0; pl.vy = 0; pl.grounded = false; pl.spawn = {x: p.x, y: p.y}; }

  // ---------- Szenarien: Startplätze + Steuerung (nur beim Aufzeichnen benutzt) ----------
  // s: Merkzettel je Szenario; i: Schritt; liefert {m:[…], f:[…]} (logische Tasten)
  const SZENARIEN = [
    {name: 'laufen_sprung', schritte: 260, m0: at(4, 17), f0: at(2, 17), steuer(i, M, F){
      const m = [], f = [];
      if(i < 120) m.push('right');                       // anlaufen bis Sprint
      if(i >= 60 && i < 80) m.push('jump');              // voller Sprung im Lauf
      if(i >= 140 && i < 143) m.push('jump');            // Antippen = kleiner Sprung (im Stand)
      if(i >= 10 && i < 70) f.push('right');
      if(i >= 30 && i < 34) f.push('jump');              // kleiner Sprung
      if(i >= 90 && i < 130){ f.push('left'); if(i < 110) f.push('jump'); }
      if(i >= 200 && i < 230){ m.push('left'); }
      return {m, f};
    }},
    {name: 'kamin_wandsprung', schritte: 420, m0: at(20, 17), f0: at(18, 17), steuer(i, M, F, s){
      // beide nacheinander in den Kamin (Spalten 25–28) und per Wandsprung hinauf, oben rechts hinaus
      const r = {m: [], f: []};
      for(const [P, k, start] of [[M, 'm', 0], [F, 'f', 150]]){
        const t = s[k] || (s[k] = {phase: 0, sprung: -99});
        const tast = r[k];
        if(i < start) continue;
        if(t.phase === 0){ tast.push('right'); if(P.x > 25 * K + 10 && P.grounded){ tast.push('jump'); t.phase = 1; t.sprung = i; } }
        else if(t.phase === 1){
          // an der Wand: weg von ihr springen (Richtung + Sprung im selben Schritt), sonst zur Wand halten
          const wand = P.onWall;
          if(wand && i - t.sprung > 3 && P.y > 10.2 * K){ tast.push(wand > 0 ? 'left' : 'right', 'jump'); t.sprung = i; t.richt = -wand; }
          else if(i - t.sprung <= 14 && t.richt) tast.push(t.richt > 0 ? 'right' : 'left');
          else tast.push(P.x < 26.9 * K ? 'left' : 'right');
          if(i - t.sprung < 10 && t.sprung > 0) tast.push('jump');
          if(P.y <= 10.2 * K && P.vy > -2){ t.phase = 2; }
        }
        else if(t.phase === 2){ tast.push('right'); if(P.grounded && P.x > 31 * K) t.phase = 3; }
      }
      return r;
    }},
    {name: 'haken_schwung', schritte: 360, m0: at(38, 17), f0: at(34, 17), steuer(i, M, F, s){
      const m = [], f = [];
      if(i < 200) f.push('right');
      if(i >= 40 && i < 52) f.push('jump');
      if(!s.ph){ s.ph = 1; }
      if(s.ph === 1){ m.push('right'); if(M.x > 41 * K){ m.push('jump'); s.ph = 2; s.t = i; } }
      else if(s.ph === 2){ m.push('right', 'jump'); if(M.vy > -3){ m.push('hook'); s.ph = 3; s.t = i; } }
      else if(s.ph === 3){   // schwingen: in Schwungrichtung drücken, Seil kurz ranziehen und wieder geben
        m.push(M.vx >= 0 ? 'right' : 'left');
        if(i - s.t > 20 && i - s.t < 34) m.push('pull');
        if(i - s.t > 50 && i - s.t < 60) m.push('slack');
        if(i - s.t > 75 && M.vx > 2 && M.vy < 0){ m.push('hook'); s.ph = 4; s.t = i; }   // loslassen im Aufschwung
      }
      else if(s.ph === 4){ if(i - s.t > 1){ m.push('right'); } if(M.hookAttached === false && i - s.t > 8 && i - s.t < 40 && M.vy > -2 && !s.zweiter){ m.push('hook'); s.zweiter = true; s.ph = 5; s.t = i; } }
      else if(s.ph === 5){ m.push(M.vx >= 0 ? 'right' : 'left'); if(i - s.t > 40 && M.hookAttached){ m.push('jump'); s.ph = 6; } }   // Springen am Seil = loslassen
      else m.push('right');
      return {m, f};
    }},
    {name: 'segeln_aufwind', schritte: 420, m0: at(60, 17), f0: at(56, 11), steuer(i, M, F, s){
      const m = [], f = [];
      if(i < 300) m.push('right');
      if(i >= 100 && i < 110) m.push('jump');
      if(i >= 5 && i < 400) f.push('right');
      if(i >= 20 && i < 30) f.push('jump');
      if(i >= 30) f.push('glide');                       // Schirm halten: segeln, im Aufwind steigen
      if(i >= 160 && i < 200) f.splice(f.indexOf('right'), 1);   // im Aufwind schweben (ohne Richtung)
      if(i >= 260 && i < 280) f.splice(f.indexOf('glide'), 1);   // Schirm kurz zu
      return {m, f};
    }},
    {name: 'pilz_kombi', schritte: 380, m0: at(83, 17), f0: at(86, 17), steuer(i, M, F, s){
      const m = [], f = [];
      // Schweinchen steht auf dem Pilz (Spalte 86): hochspringen, zurück auf den Pilz fallen -> hochgeschleudert, dann segeln
      if(i >= 10 && i < 25) f.push('jump');
      if(i >= 70) f.push('glide');
      if(i >= 75 && i < 300) f.push('right');
      // Affe: später auf den Pilz, oben den Haken (Spalte 92) greifen, schwingen, loslassen
      if(!s.ph) s.ph = 1;
      if(s.ph === 1){ if(i > 110) m.push('right'); if(M.x > 85.4 * K){ s.ph = 2; s.t = i; } }
      else if(s.ph === 2){ if(i - s.t >= 12 && i - s.t < 26) m.push('jump'); if(M.vy < -14){ s.ph = 3; } if(i - s.t > 120) s.ph = 9; }
      else if(s.ph === 3){ m.push('right'); if(M.vy > -4){ m.push('hook'); s.ph = 4; s.t = i; } }
      else if(s.ph === 4){ m.push(M.vx >= 0 ? 'right' : 'left'); if(i - s.t > 60 && M.vx < -1.5 && M.vy < 0){ m.push('hook'); s.ph = 5; } }
      else if(s.ph === 5){ m.push('left'); if(M.grounded) s.ph = 6; }
      return {m, f};
    }},
    {name: 'einzelwand_decke', schritte: 380, m0: at(92, 17), f0: at(90, 17), steuer(i, M, F, s){
      const m = [], f = [];
      // Affe: zur Einzelwand (Spalte 96) springen und per Wandsprung zurück
      if(!s.ph) s.ph = 1;
      if(s.ph === 1){ m.push('right'); if(M.x > 93.5 * K){ m.push('jump'); s.ph = 2; s.t = i; } }
      else if(s.ph === 2){ m.push('right'); if(i - s.t < 8) m.push('jump'); if(M.onWall === 1 && i - s.t > 8){ m.splice(m.indexOf('right'), 1); m.push('left', 'jump'); s.ph = 3; s.t = i; } }
      else if(s.ph === 3){ m.push('left'); if(i - s.t < 10) m.push('jump'); if(M.grounded && i - s.t > 10){ s.ph = 4; s.t = i; } }
      else if(s.ph === 4){ if(i - s.t > 20 && i - s.t < 50) m.push('right'); }
      // Schweinchen: Wandsprung an der Einzelwand, danach Schirm
      if(!s.fp) s.fp = 1;
      if(s.fp === 1){ if(i >= 120) f.push('right'); if(F.x > 93.5 * K){ f.push('jump'); s.fp = 2; s.ft = i; } }
      else if(s.fp === 2){ f.push('right'); if(i - s.ft < 8) f.push('jump'); if(F.onWall === 1 && i - s.ft > 8){ f.splice(f.indexOf('right'), 1); f.push('left', 'jump'); s.fp = 3; s.ft = i; } if(i - s.ft > 80) s.fp = 9; }
      else if(s.fp === 3){ f.push('left'); if(i - s.ft < 8) f.push('jump'); if(i - s.ft > 16) f.push('glide'); if(F.grounded && i - s.ft > 10) s.fp = 4; }
      return {m, f};
    }},
    {name: 'sprung_unter_decke', schritte: 200, m0: at(116, 17), f0: at(123, 17), steuer(i, M, F, s){
      const m = [], f = [];
      if(i < 40) m.push('right');
      if(i >= 20 && i < 40) m.push('jump');               // Kopf stößt an die Decke (Spalten 118–121, Reihe 14)
      if(i >= 60 && i < 100) m.push('left');
      if(i >= 10 && i < 50) f.push('left');
      if(i >= 25 && i < 45) f.push('jump');
      if(i >= 45 && i < 120) f.push('glide');
      return {m, f};
    }},
  ];

  function vorbereiten(sz){
    alleLos(); won = false; deathState = null;
    resetLevel();
    if(typeof baumIntroAbbrechen === 'function') baumIntroAbbrechen();   // Start-Ablauf am hohlen Baum (12a) gehört nicht zur Bahn
    stellen(p1, sz.m0); stellen(p2, sz.f0);
    p1.facing = 1; p2.facing = 1;
    for(let k = 0; k < 3; k++){ tastenSetzen(p1, []); tastenSetzen(p2, []); stepSim(TS0 - (3 - k) * TS_SCHRITT); }
  }
  function lauf(sz, tasten){
    vorbereiten(sz);
    const bahn = [], gedrueckt = [], s = {};
    for(let i = 0; i < sz.schritte; i++){
      const t = tasten ? {m: tasten[i][0], f: tasten[i][1]} : sz.steuer(i, p1, p2, s);
      tastenSetzen(p1, t.m); tastenSetzen(p2, t.f);
      gedrueckt.push([t.m.slice(), t.f.slice()]);
      stepSim(TS0 + i * TS_SCHRITT);
      bahn.push([zustand(p1), zustand(p2)]);
    }
    alleLos();
    return {name: sz.name, tasten: gedrueckt, bahn};
  }
  window.bahnenAufzeichnen = () => SZENARIEN.map(sz => lauf(sz, null));
  // Abspielen gegen die Referenz: liefert die erste Abweichung je Szenario (oder null)
  window.bahnenAbspielen = (referenz) => referenz.map(ref => {
    const sz = SZENARIEN.find(z => z.name === ref.name);
    if(!sz) return {name: ref.name, fehler: 'Szenario fehlt'};
    const neu = lauf(sz, ref.tasten);
    for(let i = 0; i < ref.bahn.length; i++){
      for(let w = 0; w < 2; w++){
        const a = ref.bahn[i][w], b = neu.bahn[i][w];
        for(let j = 0; j < a.length; j++) if(a[j] !== b[j])
          return {name: ref.name, schritt: i, figur: w ? 'Schweinchen' : 'Affe', wert: j, alt: a[j], neu: b[j]};
      }
    }
    return {name: ref.name, fehler: null, schritte: ref.bahn.length};
  });
})();
