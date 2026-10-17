// tests/stelle_pruefen.js – Nacht-Ausbau Phase 2: eine Stelle im ECHTEN Level mit echter Physik prüfen (geladen von
// tests/stelle_pruefen.py). Eine Figur steht auf einer Stehfläche (Spalte c, Fläche in Reihe r = Oberkante), läuft in
// Richtung dir an (Anlauf b Kästchen hinter dem Absprung-Punkt), springt im Schritt j und macht – je nach Mittel – im
// Schritt t nach dem Absprung einen Dash (Richtungen dir / dir+hoch / hoch / dir+runter), das Schweinchen segelt
// zusätzlich (Schirm ab Schritt j+6 bzw. ohne). Erfolg = steht auf der Zielfläche (Spalten c0..c1, Oberkante Reihe rz).
// Nur diese Figur wird gerechnet (updatePlayer), die Welt steht still (bewegte Teile an ihrem Start, Türen wie
// geschlossen bzw. per links offen). Ergebnis: geschafft?, beste Kombination, Erfolgsfenster (Schritte).
window.STELLE = {
  t: 5e6,
  tasten(P, liste){
    for(const a of ['left','right','jump','hook','glide','pull','slack','use','dash','swimUp','swimDown']){
      const code = P.keys[a]; if(!code) continue;
      const an = liste.includes(a);
      if(an && !KEYS[code]) KEYS[code + '_pressed'] = true;
      if(!an && KEYS[code]) KEYS[code + '_pressed'] = false;
      KEYS[code] = an;
    }
  },
  vorbereiten(links){
    resetLevel(); menuScreen = 'pause'; deathState = null; won = false;
    for(const l of (links || [])) setLink(l, true);
    updateDoorsAndSwitches(16.6, [p1, p2]);
    for(const s of solids) if(s.type === 'door' && linkOn[s.link]){ s.open = true; s.gone = true; }
  },
  // Stacheln und Lava (sonst rechnet das Spiel sie in stepSim, hier wird nur die Figur gerechnet)
  tot(P){
    const pb = {x: P.x - P.w/2, y: P.y - P.h, w: P.w, h: P.h};
    for(const sp of spikes) if(rectsOverlap({x: sp.x - sp.w/2, y: sp.y - sp.h, w: sp.w, h: sp.h}, pb)) return true;
    if(typeof inLava === 'function' && typeof lavaBecken !== 'undefined' && lavaBecken.length)
      for(const dx of [-P.w*0.3, 0, P.w*0.3]) if(inLava(P.x + dx, P.y - LAVA_GNADE)) return true;
    return false;
  },
  // ein Versuch; Rückgabe true = auf dem Ziel gelandet
  versuch(o, b, j, t, dashDir, segeln){
    for(const k in KEYS) KEYS[k] = false; for(const k in PAD) PAD[k] = false;
    const m = o.wer === 'm';
    const P = makePlayer({x: 0, y: 0, male: m, keys: keysFor(m), spawn: {x: 0, y: 0}, umbrella: m ? undefined : 0});
    if(m) p1 = P; else p2 = P;
    // Absprung-Punkt: Mitte der Absprung-Spalte; Anlauf b Kästchen dahinter (auf der Fläche bleiben)
    P.x = o.c*40 + 20 - o.dir*b*40; P.y = o.r*40; P.facing = o.dir; P.grounded = true;
    for(const s of solids) if(s.type === 'bruch'){ s.gone = false; s.bruchT = 0; }
    neuTrefferStopp = 0;
    const lauf = o.dir > 0 ? 'right' : 'left';
    for(let i = 0; i < (o.schritte || 260); i++){
      const l = [lauf];
      if(i >= j && i < j + 12) l.push('jump');
      if(segeln && i >= (segeln === 'nach' ? j + t + 2 : j + 6)) l.push('glide');   // 'nach' = Schirm erst nach dem Dash auf (weiter!)
      if(dashDir && i >= j + t && i < j + t + 2){
        l.push('dash');
        if(dashDir.includes('hoch')) l.push('swimUp');
        if(dashDir.includes('runter')) l.push('swimDown');
        if(!dashDir.includes('vor')) l.splice(l.indexOf(lauf), 1);
      }
      this.tasten(P, l);
      if(neuTrefferStopp > 0){ neuTrefferStopp--; this.t += 1000/54; continue; }
      updatePlayer(P, this.t); this.t += 1000/54;
      if(deathState || this.tot(P)){ deathState = null; return false; }
      if(i > j + 3 && P.grounded){
        const c = Math.floor(P.x/40);
        if(Math.abs(P.y - o.rz*40) < 1 && c >= o.c0 && c <= o.c1) return true;
        if(i > j + 8 && Math.abs(P.vx) < 0.5 && !(c >= o.c0 && c <= o.c1)) return false;   // irgendwo anders gelandet und steht
      }
      if(P.y > (LEVEL_H + 200)) return false;
    }
    return false;
  },
  // Fenster eines Rasters ok[j][t]: längster Lauf entlang j (Absprung) und t (Dash) durch die beste Zelle
  fenster(ok, mitT){
    let w = 0, n = 0;
    for(let a = 0; a < ok.length; a++) for(let q = 0; q < ok[a].length; q++){
      if(!ok[a][q]) continue; n++;
      let lj = 1; for(let x = a - 1; x >= 0 && ok[x][q]; x--) lj++; for(let x = a + 1; x < ok.length && ok[x][q]; x++) lj++;
      let lt = 1; for(let x = q - 1; x >= 0 && ok[a][x]; x--) lt++; for(let x = q + 1; x < ok[a].length && ok[a][x]; x++) lt++;
      w = Math.max(w, mitT ? Math.min(lj, lt) : lj);
    }
    return {w, n};
  },
  // Mittel: 'alt' (Sprung, Schweinchen + Segeln) oder 'neu' (+ Dash). Erst grobes Raster (jeder 2. Absprung-, jeder 3.
  // Dash-Schritt) über alle Varianten, dann für die drei besten Varianten das feine Raster -> Fenster in Schritten.
  pruefen(o){
    this.vorbereiten(o.links);
    const dashs = o.mittel === 'neu' ? [null, 'vor', 'vor+hoch', 'hoch', 'vor+runter'] : [null];
    const segelns = o.wer === 'f' ? [false, true, 'nach'] : [false];
    const anlauf = o.anlauf || [0, 3, 6];
    const jmax = o.jmax || 30;
    const reihe = (von, bis, sch) => { const a = []; for(let x = von; x <= bis; x += sch) a.push(x); return a; };
    const grob = [];
    for(const d of dashs) for(const sg of segelns) for(const b of anlauf){
      const js = reihe(0, jmax, 2), ts = d ? reihe(0, 39, 3) : [0];
      const ok = js.map(j => ts.map(t => this.versuch(o, b, j, t, d, sg)));
      const f = this.fenster(ok, !!d);
      if(f.n) grob.push({d, sg, b, n: f.n});
    }
    grob.sort((x, y) => y.n - x.n);
    let best = null;
    for(const v of grob.slice(0, 3)){
      const js = reihe(0, jmax, 1), ts = v.d ? reihe(0, 40, 1) : [0];
      const ok = js.map(j => ts.map(t => this.versuch(o, v.b, j, t, v.d, v.sg)));
      const f = this.fenster(ok, !!v.d);
      if(f.n && (!best || f.w > best.fenster)) best = {dash: v.d, segeln: v.sg, anlauf: v.b, fenster: f.w, treffer: f.n};
    }
    return best;
  },
};
