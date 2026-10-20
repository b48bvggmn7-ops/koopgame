// tests/neue_mechaniken.js – Nacht-Ausbau: Prüf-Szenarien für Dash, Durchbruch-Wand, Wand-Rutschen und Haftfläche.
// Läuft im Testlevel levels/test/neue-mechaniken.json; steuert die Figuren Schritt für Schritt (wie tests/bahnen.js)
// und gibt Messwerte zurück, die tests/run_tests.py prüft. Wird per page.evaluate geladen.
window.NM = {
  t: 300000,
  alleLos(){ for(const k in KEYS) KEYS[k] = false; for(const k in PAD) PAD[k] = false; },
  tasten(pl, liste){
    for(const a of ['left','right','jump','hook','glide','pull','slack','use','dash','swimUp','swimDown']){
      const code = pl.keys[a]; if(!code) continue;
      const an = liste.includes(a);
      if(an && !KEYS[code]) KEYS[code + '_pressed'] = true;
      if(!an && KEYS[code]) KEYS[code + '_pressed'] = false;
      KEYS[code] = an;
    }
  },
  stellen(pl, c, r){ pl.x = c*40 + 20; pl.y = (r + 1)*40; pl.vx = 0; pl.vy = 0; pl.grounded = false; },
  start(){ this.alleLos(); won = false; deathState = null; resetLevel(); },
  schritt(m, f){ this.tasten(p1, m || []); this.tasten(p2, f || []); stepSim(this.t); this.t += 1000/54; },
  n(k, m, f){ for(let i = 0; i < k; i++) this.schritt(m, f); },
  weg(){ return solids.filter(s => s.type === 'bruch' && s.gone).length; },

  dash(){
    const S = this, out = {richtung: {}};
    const richt = {r:['right'], l:['left'], o:['swimUp'], u:['swimDown'], ro:['right','swimUp'], lo:['left','swimUp'], ru:['right','swimDown'], lu:['left','swimDown']};
    for(const wer of ['m', 'f']){
      const mit = l => wer === 'm' ? [l, []] : [[], l];
      let P, Q;   // resetLevel legt neue Figuren an -> nach jedem start() neu holen
      const fig = () => { P = wer === 'm' ? p1 : p2; Q = wer === 'm' ? p2 : p1; };
      for(const k in richt){
        S.start(); fig(); S.stellen(P, 110, 8); S.stellen(Q, 112, 17); S.n(3);
        const x0 = P.x, y0 = P.y;
        S.schritt(...mit(richt[k].concat(['dash']))); S.n(14, ...mit(richt[k]));
        out.richtung[wer + k] = [+((P.x - x0)/40).toFixed(2), +((P.y - y0)/40).toFixed(2), P.dashPunkte];
      }
      // am Boden: Dash nach rechts
      S.start(); fig(); S.stellen(P, 104, 17); S.stellen(Q, 100, 17); S.n(5);
      const xb = P.x; S.schritt(...mit(['right','dash'])); S.n(12, ...mit([]));
      out[wer + 'Boden'] = +((P.x - xb)/40).toFixed(2);
    }
    // nur ein Luft-Dash, Aufladen am Boden (DASH_LADEZEIT Schritte), nach Landung voll
    S.start(); S.stellen(p1, 110, 8); S.stellen(p2, 112, 17); S.n(3);
    S.schritt(['right','dash']); S.n(12);
    const x1 = p1.x; S.schritt(['right','dash']); S.n(5, ['right']);
    out.zweiterLuftDash = Math.abs(p1.x - x1) > 60;
    let n = 0; while(!p1.grounded && n < 200){ S.schritt(); n++; }
    out.ladungInLuft = p1.dashLadung > 0 || p1.dashPunkte > 0;   // neue Regel: lädt auch in der Luft
    let lade = 0; while(p1.dashPunkte < 1 && lade < 200){ S.schritt(); lade++; }
    out.ladeSchritte = 12 + 1 + 5 + n + lade;   // Schritte seit dem zweiten Dash-Versuch bzw. ab dem ersten Dash
    // Aufladen an der Wand (Spalte 90): in der Luft dashen, dann an die Wand -> lädt dort
    S.start(); S.stellen(p1, 86, 10); S.stellen(p2, 84, 17); S.n(2);
    S.schritt(['swimUp','dash']); S.n(12, ['right']);
    const vorWand = p1.dashPunkte; let wand = 0; while(p1.dashPunkte < 1 && wand < 120){ S.schritt(['right']); wand++; }
    out.wandLaden = {vorher: vorWand, schritte: wand, anWand: !!p1.onWall};
    // Aufladen am Haken (Haken Spalte 110, Reihe 4 im Testlevel)
    out.hakenLaden = null;
    if(hooks.length){
      const h = hooks[0];
      S.start(); p1.x = h.x - 60; p1.y = h.y + 150; S.stellen(p2, Math.floor(h.x/40) + 2, 17);
      S.schritt(['dash','swimUp']); S.n(10);
      const vorHaken = p1.dashPunkte;
      S.schritt(['hook']); S.schritt([]);
      let hs = 0; while(p1.hookAttached && p1.dashPunkte < 1 && hs < 120){ S.schritt([]); hs++; }
      out.hakenLaden = {vorher: vorHaken, haken: !!p1.hookAttached, punkte: p1.dashPunkte};
    }
    // kein Tunneln: Dash gegen Wand Spalte 90 aus kurzer Distanz, auch diagonal
    S.start(); S.stellen(p1, 88, 17); S.stellen(p2, 85, 17); S.n(3);
    S.schritt(['right','dash']); S.n(15, ['right']);
    out.keinTunnel = +(p1.x/40).toFixed(2);
    S.start(); S.stellen(p1, 88, 12); S.stellen(p2, 85, 17); S.n(1);
    S.schritt(['right','swimUp','dash']); S.n(15, ['right']);
    out.keinTunnelSchraeg = +(p1.x/40).toFixed(2);
    return out;
  },

  bruch(){
    const S = this, out = {};
    // laufen und springen gegen die Durchbruch-Wand (Spalte 20): nichts passiert
    S.start(); S.stellen(p1, 16, 17); S.stellen(p2, 12, 17); S.n(40, ['right']);
    S.n(20, ['right','jump']); S.n(30, ['right']);
    out.laufen = {c: +(p1.x/40).toFixed(2), weg: S.weg()};
    // Dash: bricht, Figur dahinter, Trefferstopp
    S.start(); S.stellen(p1, 16, 17); S.stellen(p2, 12, 17); S.n(10, ['right']);
    const s0 = simSteps; S.schritt(['right','dash']); let stopp = 0; for(let i = 0; i < 20; i++){ S.schritt(['right']); if(neuTrefferStopp > 0) stopp++; }
    out.dash = {c: +(p1.x/40).toFixed(2), weg: S.weg(), stopp, schritte: simSteps - s0};
    // Schweinchen bricht auch
    S.start(); S.stellen(p2, 16, 17); S.stellen(p1, 12, 17); S.n(10, [], ['right']);
    S.schritt([], ['right','dash']); S.n(20, [], ['right']);
    out.schwein = {c: +(p2.x/40).toFixed(2), weg: S.weg()};
    // nach unten durch den Bruch-Boden (Spalten 30–31, Reihe 14)
    S.start(); S.stellen(p1, 30, 13); S.stellen(p2, 26, 17); S.n(5);
    S.schritt(['swimDown','dash']); S.n(30);
    out.unten = {r: +(p1.y/40).toFixed(2), weg: S.weg()};
    // bleibt kaputt (Standard), Neustart stellt wieder her
    S.n(300);
    out.bleibt = S.weg();
    resetLevel(); out.nachNeustart = S.weg();
    // wächst nach (Spalte 40, 2 s) – wartet, solange eine Figur drin steht
    S.start(); S.stellen(p1, 37, 17); S.stellen(p2, 35, 17); S.n(3);
    const w = solids.filter(s => s.type === 'bruch' && s.nachwachsen > 0);
    S.schritt(['right','dash']); S.n(14);
    const wegNachDash = w.filter(s => s.gone).length;
    p1.x = 40*40 + 20; p1.y = 18*40; p1.vx = 0; p1.vy = 0;
    S.n(140);
    out.wachsen = {wegNachDash, wartet: w.some(s => s.wartet), wegMitFigur: w.filter(s => s.gone).length, frei: spotFree(p1.x, p1.y, p1)};
    S.n(30, ['right']); S.n(5);
    out.wachsen.wegOhneFigur = w.filter(s => s.gone).length;
    return out;
  },

  rutschen(){
    const S = this, out = {};
    // ohne Richtungstaste an der hohen Wand (Spalte 90) herunterfallen: bremst auf WAND_RUTSCH_MAX_FALL
    S.start(); S.stellen(p2, 84, 17);
    p1.x = 88*40; p1.y = 6*40; p1.vx = 6; p1.vy = 0; p1.grounded = false;
    S.n(4, ['right']);
    let maxVy = 0, rutschte = 0;
    for(let i = 0; i < 36; i++){ S.schritt([]); if(p1.onWall) maxVy = Math.max(maxVy, p1.vy); if(p1.rutscht) rutschte++; }
    out.ohneTaste = {maxVy: +maxVy.toFixed(2), rutschte, anWand: p1.onWall};
    // Wandsprung mitten im Rutschen: gleiche Werte wie der normale Wandsprung
    S.schritt(['left']); S.schritt(['left','jump']);
    out.wandsprung = {vx: +p1.vx.toFixed(2), vy: +p1.vy.toFixed(2)};
    // Schweinchen rutscht ebenso; mit Schirm segelt es (kein Rutschen)
    S.start(); S.stellen(p1, 84, 17);
    p2.x = 90*40 - p2.w/2 - 1; p2.y = 6*40; p2.vx = 0; p2.vy = 0; p2.grounded = false;
    let maxF = 0; for(let i = 0; i < 40; i++){ S.schritt([], []); maxF = Math.max(maxF, p2.vy); }
    out.schwein = +maxF.toFixed(2);
    return out;
  },

  // Figur fliegt von unten auf die Haftdecke (Spalten 50–58, Unterkante y 440) zu und hält „hoch“ (Schweinchen: wer='f')
  anDecke(wer, tasten){
    const S = this; S.start();
    const P = wer === 'f' ? p2 : p1, Q = wer === 'f' ? p1 : p2;
    S.stellen(Q, 47, 17); P.x = 52*40 + 20; P.y = 440 + P.h + 30; P.vx = 0; P.vy = -8; P.grounded = false;
    let ok = false;
    for(let i = 0; i < 30 && !ok; i++){ wer === 'f' ? S.schritt([], tasten) : S.schritt(tasten); ok = !!P.haft; }
    return ok;
  },
  // Nutzerwunsch: Kopf schon in den Honig-Tropfen (knapp unter der Haftdecke, höchster Punkt des Sprungs) -> festhalten geht;
  // deutlich tiefer nicht. abstand = px zwischen Kopf und Unterkante der Haftdecke (y 440)
  haftTropfen(){
    const S = this, out = {};
    for(const abstand of [2, 9, 11, 20]){
      S.start(); S.stellen(p2, 47, 17);
      p1.x = 52*40 + 20; p1.y = 440 + p1.h + abstand; p1.vx = 0; p1.vy = 0; p1.grounded = false;
      let ok = false; for(let i = 0; i < 3 && !ok; i++){ S.schritt(['swimUp']); ok = !!p1.haft; }
      out[abstand] = ok;
    }
    return out;
  },
  haft(){
    const S = this, out = {};
    // greifen: unter der Haftdecke (Spalten 50–58, Reihe 10) hochspringen und hoch halten
    out.greifen = S.anDecke('m', ['swimUp']);
    // rollen nach rechts: langsamer als Laufen, mit Schwung (nicht sofort volle Geschwindigkeit)
    const v1 = []; for(let i = 0; i < 20; i++){ S.schritt(['right','swimUp']); v1.push(Math.abs(p1.vx)); }
    out.rollen = {anfang: +v1[0].toFixed(2), max: +Math.max(...v1).toFixed(2), haft: !!p1.haft};
    // kein Sofort-Stopp: Richtung loslassen -> rollt noch etwas weiter
    const xs = p1.x; S.n(4, ['swimUp']); out.auslaufen = +(p1.x - xs).toFixed(2);
    // Nutzerwunsch: nicht mehr um die Ecke / an der Seite hoch – weiter nach rechts hangeln hält an der Seitenwand
    // (Spalte 59) an, man hängt weiter unten an der Decke
    const flaechen = new Set(); for(let i = 0; i < 200 && p1.haft; i++){ S.schritt(['right','swimUp']); if(p1.haft) flaechen.add(p1.haft.flaeche); }
    out.ecken = [...flaechen].sort(); out.amEnde = {haft: !!p1.haft, x: +p1.x.toFixed(1), kopf: +(p1.y - p1.h).toFixed(1)};
    // loslassen = fallen
    S.anDecke('m', ['swimUp']);
    S.n(5, ['swimUp']); S.n(3, []);
    out.loslassen = {haft: !!p1.haft, vy: +p1.vy.toFixed(2)};
    // Absprung (Springen an der Unterseite)
    S.anDecke('m', ['swimUp']);
    S.n(10, ['swimUp']); S.schritt(['swimUp','right']); S.schritt(['jump','swimUp','right']);
    out.absprung = {haft: !!p1.haft, vx: +p1.vx.toFixed(2), vy: +p1.vy.toFixed(2)};
    // Dash von der Haftfläche
    S.anDecke('m', ['swimUp']);
    S.n(60, ['swimUp']);
    const pk = p1.dashPunkte; S.schritt(['swimUp','right','dash']);
    out.dashVonHaft = {vorher: pk, dash: !!p1.dash, haft: !!p1.haft, vx: +p1.vx.toFixed(1)};
    // Schweinchen kann sich auch festhalten
    out.schwein = S.anDecke('f', ['swimUp']);
    // ohne „hoch“ kein Festhalten (gegen die Decke springen = normale Decke)
    out.ohneHoch = S.anDecke('m', []);
    return out;
  },
};
