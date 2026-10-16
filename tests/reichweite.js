// tests/reichweite.js – Nacht-Ausbau Phase 2: Reichweiten-Messung mit Erfolgsfenster (geladen von tests/reichweite_messen.py).
// Eine Figur läuft mit vollem Anlauf auf eine Kante zu (Boden bis x = E) und macht eine Kombination; Absprung-Zeitpunkt k
// (Schritte VOR der Kante; negativ = schon über der Kante, Nachsprung-Zeit) und Zeitpunkt der zweiten Aktion t (Schritte
// nach dem Absprung) werden durchprobiert. Gemessen wird für jede Zielhöhe dy (Kästchen über/unter der Absprung-Höhe),
// wie weit (px ab der Kante) die Figur mit den Füßen auf/über dieser Höhe vorne hinkommt (= Lücke, die sie schafft).
// Freier Flug ohne Ziel-Block (Näherung, siehe Werkzeug-Kopf); echte Stellen prüft tests/stelle_pruefen.js.
window.RW = {
  t: 900000,
  E: 4000, BODEN: 680,
  DY: [-8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  tasten(P, liste){
    for(const a of ['left','right','jump','hook','glide','pull','slack','use','dash','swimUp','swimDown']){
      const code = P.keys[a]; if(!code) continue;
      const an = liste.includes(a);
      if(an && !KEYS[code]) KEYS[code + '_pressed'] = true;
      if(!an && KEYS[code]) KEYS[code + '_pressed'] = false;
      KEYS[code] = an;
    }
  },
  figur(wer){
    for(const k in KEYS) KEYS[k] = false; for(const k in PAD) PAD[k] = false;
    const m = wer === 'm';
    const P = makePlayer({x: this.E - 520, y: this.BODEN, male: m, keys: keysFor(m), spawn: {x: 0, y: 0}, umbrella: m ? undefined : 0});
    P.grounded = true;
    return P;
  },
  aufbauen(){
    solids.length = 0;
    solids.push({x: this.E - 2000, y: this.BODEN, w: 2000, h: 400, type: 'ground'});
    hooks.length = 0; bouncers = []; winds = [];
    haftZellenCache = {}; if(Array.isArray(wasserBecken)) wasserBecken.length = 0;
    neuTrefferStopp = 0; won = false; LEVEL_H = 4000; LEVEL_W = 12000;
  },
  // ein Versuch: plan(i) -> Liste logischer Tasten im Schritt i. Rückgabe: Reichweite je dy (px ab Kante, -1 = nie)
  versuch(wer, plan, schritte){
    const P = this.figur(wer), out = this.DY.map(() => -1);
    let absprung = -1;
    for(let i = 0; i < schritte; i++){
      this.tasten(P, plan(i, P));
      if(neuTrefferStopp > 0){ neuTrefferStopp--; this.t += 1000/54; continue; }
      updatePlayer(P, this.t); this.t += 1000/54;
      if(P.dead || deathState){ deathState = null; break; }
      const vorn = P.x + P.w/2 - this.E;
      if(vorn > 0 && !(P.grounded && P.y >= this.BODEN - 0.5 && P.x - P.w/2 < this.E)){
        for(let j = 0; j < this.DY.length; j++){
          const top = this.BODEN - this.DY[j]*40;
          if(P.y <= top + 0.5 && vorn > out[j]) out[j] = vorn;
        }
      }
      if(P.y > this.BODEN + 9*40) break;
    }
    return out;
  },
  // Schritt, in dem die Figur ohne Springen die Kante verlässt (volles Anlaufen nach rechts)
  kantenSchritt(wer){
    const P = this.figur(wer);
    for(let i = 0; i < 400; i++){
      this.tasten(P, ['right']); updatePlayer(P, this.t); this.t += 1000/54;
      if(P.x - P.w/2 > this.E) return i;
    }
    return -1;
  },
  // Kombinationen: k = Absprung (Schritte vor der Kante), t = zweite Aktion (Schritte nach dem Absprung)
  KOMBIS: {
    sprung:            {wer: 'mf', t: [0]},
    boden_dash:        {wer: 'mf', t: [0], boden: true},
    sprung_dash:       {wer: 'mf', t: 'lang', dash: ['right']},
    sprung_dash_hoch:  {wer: 'mf', t: 'lang', dash: ['right', 'swimUp']},
    sprung_dash_oben:  {wer: 'mf', t: 'lang', dash: ['swimUp']},
    sprung_segeln:     {wer: 'f',  t: 'lang', segeln: true},
    sprung_segeln_dash:{wer: 'f',  t: 'lang', segeln: true, dash: ['right'], segelnAb: 6},
    sprung_segeln_dash_hoch: {wer: 'f', t: 'lang', segeln: true, dash: ['right', 'swimUp'], segelnAb: 6},
  },
  messen(name, wer){
    this.aufbauen();
    const K = this.KOMBIS[name], fE = this.kantenSchritt(wer);
    const ks = []; for(let k = -4; k <= 16; k++) ks.push(k);
    const ts = K.t === 'lang' ? Array.from({length: 46}, (_, i) => i) : K.t;
    const gitter = [];
    for(const k of ks){
      const zeile = [];
      for(const t of ts){
        const a = fE - k;   // Schritt des Absprungs (bzw. des Boden-Dashs)
        const plan = (i) => {
          const l = ['right'];
          if(K.boden){ if(i === a) l.push('dash'); return l; }
          if(i >= a && i < a + 12) l.push('jump');
          if(K.segeln){
            const ab = a + (K.segelnAb !== undefined ? K.segelnAb : t);
            if(i >= ab && !(K.dash && i >= a + t && i < a + t + 1)) l.push('glide');
          }
          if(K.dash && i >= a + t && i < a + t + 2){ l.push('dash'); for(const d of K.dash) if(!l.includes(d)) l.push(d); if(!K.dash.includes('right')) l.splice(l.indexOf('right'), 1); }
          return l;
        };
        zeile.push(this.versuch(wer, plan, a + 260).map(v => Math.round(v)));
      }
      gitter.push(zeile);
    }
    return {name, wer, ks, ts, dy: this.DY, kante: fE, gitter};
  },
};
