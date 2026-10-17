// tests/umbau/dashprobe.js – Umbau aller Level: „Dash-Gegenprobe“ für Hilfs-Stellen (Haken, Pilz, Aufwind, Kamin …).
// Eine Figur startet an einem Punkt, läuft nach rechts, springt im Schritt j, macht im Schritt j+t einen Dash (Richtungen
// vor / vor+hoch / hoch / vor+runter), das Schweinchen segelt wahlweise. Pilze und Aufwinde sind AUS (ohne Hilfe), Haken
// werden nicht benutzt. Erfolg = steht irgendwann auf dem Boden mit Spalte >= zc und Reihe <= zr (wie die Kombi-Tests).
// Braucht tests/stelle_pruefen.js (STELLE.tasten, STELLE.tot, STELLE.fenster).
window.DASHPROBE = {
  t: 7e6,
  vorbereiten(links){
    STELLE.vorbereiten(links);
    if(!this._b){ this._b = bouncers.slice(); this._w = winds.slice(); }
    bouncers.length = 0; winds.length = 0;
  },
  versuch(o, j, t, dashDir, segeln, haltVor, bahn){
    for(const k in KEYS) KEYS[k] = false; for(const k in PAD) PAD[k] = false;
    const m = o.wer === 'm';
    const P = makePlayer({x: o.x, y: o.y, male: m, keys: keysFor(m), spawn: {x: o.x, y: o.y}, umbrella: m ? undefined : 0});
    if(m) p1 = P; else p2 = P;
    P.facing = 1; P.grounded = true;
    for(const s of solids) if(s.type === 'bruch'){ s.gone = false; s.bruchT = 0; }
    neuTrefferStopp = 0;
    for(let i = 0; i < (o.schritte || 420); i++){
      const l = [];
      if(i < j + t + 2 || haltVor) l.push('right');
      if(i >= j && i < j + 12) l.push('jump');
      if(segeln && i >= (segeln === 'nach' ? j + t + 2 : j + 6)) l.push('glide');   // 'nach' = Schirm erst nach dem Dash auf (weiter!)
      if(dashDir && i >= j + t && i < j + t + 2){
        l.push('dash');
        if(dashDir.includes('hoch')) l.push('swimUp');
        if(dashDir.includes('runter')) l.push('swimDown');
        if(!dashDir.includes('vor')){ const k = l.indexOf('right'); if(k >= 0) l.splice(k, 1); }
      }
      STELLE.tasten(P, l);
      if(neuTrefferStopp > 0){ neuTrefferStopp--; this.t += 1000/54; continue; }
      updatePlayer(P, this.t); this.t += 1000/54;
      if(bahn && i % 4 === 0) bahn.push([+(P.x/40).toFixed(1), +(P.y/40).toFixed(1), P.grounded ? 'B' : P.dash ? 'D' : P.onWall ? 'W' : '']);
      if(deathState || STELLE.tot(P)){ deathState = null; return false; }
      if(P.grounded && Math.floor(P.x/40) >= o.zc && P.y/40 - 1 <= o.zr + 0.1) return true;
      if(P.y > LEVEL_H + 200) return false;
    }
    return false;
  },
  zeigen(o, b){ this.vorbereiten(o.links); const bahn = []; const ok = this.versuch(o, b.j, b.t, b.dash, b.segeln, b.haltVor, bahn); return {ok, bahn}; },
  // grobes Raster über alle Varianten; für die beste Variante das feine Raster -> Fenster (Schritte)
  pruefen(o){
    this.vorbereiten(o.links);
    const dashs = [null, 'vor', 'vor+hoch', 'hoch', 'vor+runter'];
    const segelns = o.wer === 'f' ? [false, true, 'nach'] : [false];
    const jmax = o.jmax || 90;
    const reihe = (von, bis, sch) => { const a = []; for(let x = von; x <= bis; x += sch) a.push(x); return a; };
    const grob = [];
    for(const d of dashs) for(const sg of segelns) for(const hv of [true, false]){
      if(!d && !hv) continue;
      const js = reihe(0, jmax, 3), ts = d ? reihe(0, 39, 3) : [0];
      const ok = js.map(j => ts.map(t => this.versuch(o, j, t, d, sg, hv)));
      const f = STELLE.fenster(ok, !!d);
      if(f.n){
        let j0 = 0, t0 = 0;
        suche: for(let a = 0; a < js.length; a++) for(let q = 0; q < ts.length; q++) if(ok[a][q]){ j0 = js[a]; t0 = ts[q]; break suche; }
        grob.push({d, sg, hv, n: f.n, j0, t0});
      }
    }
    if(!grob.length) return null;
    grob.sort((x, y) => y.n - x.n);
    let best = null;
    for(const v of grob.slice(0, 2)){
      // feines Raster nur um den ersten Treffer des groben (±6 Schritte) – reicht für das Fenster, spart viel Zeit
      const js = reihe(Math.max(0, v.j0 - 6), Math.min(jmax, v.j0 + 6), 1), ts = v.d ? reihe(Math.max(0, v.t0 - 6), Math.min(40, v.t0 + 6), 1) : [0];
      const ok = js.map(j => ts.map(t => this.versuch(o, j, t, v.d, v.sg, v.hv)));
      const f = STELLE.fenster(ok, !!v.d);
      if(f.n && (!best || f.w > best.fenster)) best = {dash: v.d, segeln: v.sg, haltVor: v.hv, fenster: f.w, treffer: f.n, j: v.j0, t: v.t0};
    }
    return best;
  },
};
