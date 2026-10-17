// tests/umbau/muenzen_erreichbar.js – Umbau aller Level: kommt die passende Figur an jede Münze (blau = Affe, pink =
// Schweinchen, gold = beide) UND überlebt sie es? Echte Figuren-Physik (updatePlayer) aus Stehplätzen in der Nähe: laufen,
// springen (kurz/lang), Schirm, Dash (vor / vor+hoch / hoch). Erfolg = Münze berührt (wie updateCoins: |dx|<24, |dy|<26)
// und danach wieder sicher auf festem Boden (nicht tot, nicht aus dem Level gefallen). Türen gelten als offen.
// Nicht geprüft werden Wege mit Haken, Pilz, Aufwind, Fahrten, Teleporter (die laufen hier nicht) – solche Münzen
// werden mit Grund gemeldet. Zusätzlich: der nächste sichere Bahnpunkt (für das Umlegen der Münze).
// Braucht tests/stelle_pruefen.js (STELLE.tasten, STELLE.tot).
window.MZ = {
  t: 9e6,
  vorbereiten(){
    STELLE.vorbereiten([]);
    for(const s of solids) if(s.type === 'door'){ s.open = true; s.gone = true; }
    const F = new Set(), steh = [];
    for(const s of solids){
      if(s.gone || s.type === 'oneway' || s.type === 'moveplat') continue;
      for(let x = s.x; x < s.x + s.w - 1; x += 40) for(let y = s.y; y < s.y + s.h - 1; y += 40) F.add(Math.floor(x/40) + ',' + Math.floor(y/40));
    }
    const gef = new Set();
    for(const sp of spikes) gef.add(Math.floor(sp.x/40) + ',' + Math.floor((sp.y - 1)/40));
    for(const k of F){
      const [c, r] = k.split(',').map(Number);
      if(F.has(c + ',' + (r - 1)) || F.has(c + ',' + (r - 2))) continue;
      if(gef.has(c + ',' + (r - 1))) continue;
      steh.push([c, r]);
    }
    this.F = F; this.steh = steh;
  },
  // ein Versuch; Rückgabe {hit, sicher, bahn}
  versuch(m, x, y, dir, j, kurz, segeln, dash, t, coin, merken){
    for(const k in KEYS) KEYS[k] = false; for(const k in PAD) PAD[k] = false;
    const P = makePlayer({x, y, male: m, keys: keysFor(m), spawn: {x, y}, umbrella: m ? undefined : 0});
    if(m) p1 = P; else p2 = P;
    P.facing = dir; P.grounded = true; neuTrefferStopp = 0;
    const lauf = dir > 0 ? 'right' : 'left';
    let hit = false; const bahn = [];
    for(let i = 0; i < 330; i++){
      const l = [lauf];
      if(j >= 0 && i >= j && i < j + (kurz ? 4 : 12)) l.push('jump');
      if(segeln && j >= 0 && i >= j + 6) l.push('glide');
      if(dash && i >= j + t && i < j + t + 2){
        l.push('dash');
        if(dash.includes('hoch')) l.push('swimUp');
        if(!dash.includes('vor')) l.splice(0, 1);
      }
      STELLE.tasten(P, l);
      if(neuTrefferStopp > 0){ neuTrefferStopp--; this.t += 1000/54; continue; }
      updatePlayer(P, this.t); this.t += 1000/54;
      if(deathState || STELLE.tot(P)){ deathState = null; return {hit, sicher: false, bahn}; }
      if(P.y > LEVEL_H + 100) return {hit, sicher: false, bahn};
      const cy = P.y - P.h*0.5;
      if(merken && i % 2 === 0) bahn.push([P.x, cy]);
      if(coin && Math.abs(P.x - coin.x) < 24 && Math.abs(cy - coin.y) < 26) hit = true;
      if(P.grounded && i > 4 && (hit || !coin) && i > (j >= 0 ? j + 6 : 0)) return {hit, sicher: true, bahn};
      if(P.grounded && !coin && i > 160) return {hit, sicher: true, bahn};
    }
    return {hit, sicher: false, bahn};
  },
  manoever(m){
    const out = [];
    for(const dir of [1, -1]){
      out.push([dir, -1, false, false, null, 0]);
      for(const j of [0, 5, 11, 18]) for(const kurz of [false, true]) for(const sg of (m ? [false] : [false, true])){
        out.push([dir, j, kurz, sg, null, 0]);
        if(!kurz) for(const d of ['vor', 'vor+hoch', 'hoch']) for(const t of [5, 12, 20]) out.push([dir, j, kurz, sg, d, t]);
      }
    }
    return out;
  },
  // eine Münze prüfen: {ok, alt (ohne Dash), start} oder Vorschlag
  pruefen(coin, m, vorschlag){
    const cc = Math.floor(coin.x/40), cr = Math.floor(coin.y/40);
    const starts = this.steh.filter(([c, r]) => Math.abs(c - cc) <= 12 && r >= cr - 6 && r <= cr + 11)
      .sort((a, b) => Math.hypot(a[0] - cc, (a[1] - cr)*1.5) - Math.hypot(b[0] - cc, (b[1] - cr)*1.5)).slice(0, 14);
    const man = this.manoever(m);
    let mitDash = null;
    for(const [c, r] of starts){
      for(const [dir, j, kurz, sg, d, t] of man){
        if(d && mitDash) continue;
        const e = this.versuch(m, c*40 + 20, r*40, dir, j, kurz, sg, d, t, coin, false);
        if(e.hit && e.sicher){
          if(!d) return {ok: true, alt: true};
          mitDash = mitDash || {ok: true, alt: false};
        }
      }
    }
    if(mitDash) return mitDash;
    if(!vorschlag) return {ok: false};
    // Vorschlag: nächster Punkt einer sicheren Bahn (ohne Dash) – höchstens 4 Kästchen entfernt, nicht in Stein
    let best = null;
    for(const [c, r] of starts.slice(0, 10)){
      for(const [dir, j, kurz, sg, d, t] of man){
        if(d) continue;
        const e = this.versuch(m, c*40 + 20, r*40, dir, j, kurz, sg, d, t, null, true);
        if(!e.sicher) continue;
        for(const [x, y] of e.bahn){
          const pc = Math.floor(x/40), pr = Math.floor(y/40);
          if(this.F.has(pc + ',' + pr)) continue;
          const dd = Math.hypot(pc - cc, pr - cr);
          if(dd <= 4 && (!best || dd < best.d)) best = {c: pc, r: pr, d: dd};
        }
      }
    }
    return {ok: false, vorschlag: best};
  },
  alle(vorschlag, nur){   // nur = [[c, r], ...]: nur diese Münzen prüfen (schnell, nach dem Verschieben)
    this.vorbereiten();
    const out = [];
    for(let i = 0; i < coins.length; i++){
      const c = coins[i];
      if(nur && !nur.some(([nc, nr]) => nc === Math.floor(c.x/40) && nr === Math.floor(c.y/40))) continue;
      const wer = c.color === 'blue' ? [true] : c.color === 'pink' ? [false] : [true, false];
      const ergebnisse = wer.map(m => this.pruefen(c, m, vorschlag));
      out.push({i, c: Math.floor(c.x/40), r: Math.floor(c.y/40), farbe: c.color, ergebnisse});
    }
    return out;
  },
};
