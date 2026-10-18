// tests/umbau/muenzen_hilfen.js – Umbau: Münzen an Hilfen (Haken, Pilz, Aufwind, Fahrt, Haftfläche) prüfen. Anders als
// muenzen_erreichbar.js läuft hier das GANZE Spiel (stepSim), damit Haken, Pilze, Aufwinde, Fahrten und Haftflächen echt
// wirken. Je Münze: Stehplätze in der Nähe, je Stehplatz viele Versuche (Richtung, Absprung, Haken greifen und nach t
// Schritten loslassen, Dash in Richtung Münze, Schirm). Gelenkt wird immer zur Münze hin, nach dem Treffer zurück auf
// festen Boden. Erfolg = Münze berührt (wie updateCoins) UND danach sicher stehen (nicht tot). Türen gelten als offen.
// Braucht tests/umbau/muenzen_erreichbar.js (MZ.vorbereiten für die Stehplätze).
window.MH = {
  versuch(m, sx, sy, coin, v){
    resetLevel(); menuScreen = 'pause'; deathState = null;
    for(const s of solids) if(s.type === 'door'){ s.open = true; s.gone = true; s.closing = false; }
    for(const k in KEYS) KEYS[k] = false;
    const P = m ? p1 : p2, Q = m ? p2 : p1;
    P.x = sx; P.y = sy; Q.x = sx; Q.y = sy;   // die andere Figur steht daneben (sonst hält der Bildrand fest)
    for(const F of [p1, p2]){ F.vx = 0; F.vy = 0; F.hookAttached = false; }
    camPos = Math.max(0, Math.min(LEVEL_W - VW, sx - CAM_LEFT)); camX = Math.round(camPos);
    const K = n => P.keys[n];
    let ts = -3e7, hit = false, sicherSeit = 0, angehakt = 0, gelassen = false, gedasht = false;
    for(let i = 0; i < 700; i++){
      ts += 16.6;
      for(const k in KEYS) KEYS[k] = false;
      const hold = n => { KEYS[K(n)] = true; }, press = n => { KEYS[K(n)] = true; KEYS[K(n) + '_pressed'] = true; };
      const zielX = hit ? sx : coin.x;
      const lenk = () => { if(P.x < zielX - 6) hold('right'); else if(P.x > zielX + 6) hold('left'); };
      if(i < v.j) hold(v.dir > 0 ? 'right' : 'left');
      else {
        if(i === v.j) press('jump');
        if(i < v.j + 12) hold('jump');
        if(i > v.j) lenk();
        if(!m && v.schirm && P.vy > 0) hold('glide');
        if(m && v.haken !== null && !gelassen){
          if(!P.hookAttached){ if(!angehakt && P.vy > -3) press('hook'); }
          else {
            angehakt++;
            if(angehakt <= v.zug) hold('pull');
            hold(P.vx >= 0 ? 'right' : 'left');
            if(angehakt >= v.haken){ press('jump'); gelassen = true; }
          }
        }
        if(v.dash && !gedasht && i >= v.j + v.dt && !P.hookAttached){
          press('dash'); gedasht = true;
          if(v.dash === 'hoch') { hold('swimUp'); KEYS[K('left')] = KEYS[K('right')] = false; }
          if(v.dash === 'vor+hoch') hold('swimUp');
          if(v.dash === 'runter') hold('swimDown');
        }
      }
      camPos += (cameraTarget(camPos) - camPos) * CAM_FOLLOW; camX = Math.round(camPos);
      stepSim(ts);
      for(const k in KEYS) if(k.endsWith('_pressed')) KEYS[k] = false;
      if(deathState){ deathState = null; return {hit, sicher: false}; }
      if(P.y > LEVEL_H + 100) return {hit, sicher: false};
      const cy = P.y - P.h * 0.5;
      if(Math.abs(P.x - coin.x) < 24 && Math.abs(cy - coin.y) < 26) hit = true;
      if(hit && P.grounded && !P.hookAttached){ if(++sicherSeit > 20) return {hit, sicher: true}; } else sicherSeit = 0;
      if(!hit && i > v.j + 40 && P.grounded && !P.hookAttached && Math.abs(P.vx) < 0.5 && Math.abs(P.vy) < 0.5) return {hit, sicher: false};
    }
    return {hit, sicher: false};
  },
  varianten(m){
    const out = [];
    for(const dir of [1, -1]) for(const j of [0, 6, 14]){
      if(m){
        out.push({dir, j, haken: null, zug: 0, dash: null, dt: 0});
        for(const h of [12, 24, 40, 60, 90]) for(const zug of [0, 30]) out.push({dir, j, haken: h, zug, dash: null, dt: 0});
        for(const d of ['vor', 'vor+hoch', 'hoch']) for(const dt of [8, 16]) out.push({dir, j, haken: null, zug: 0, dash: d, dt});
        for(const h of [24, 60]) for(const d of ['vor', 'vor+hoch']) out.push({dir, j, haken: h, zug: 0, dash: d, dt: 30});
      } else {
        for(const schirm of [true, false]) out.push({dir, j, schirm, dash: null, dt: 0});
        for(const d of ['vor', 'vor+hoch', 'hoch', 'runter']) for(const dt of [8, 16, 30]) out.push({dir, j, schirm: true, dash: d, dt});
      }
    }
    return out;
  },
  pruefen(coin, m){
    const cc = Math.floor(coin.x / 40), cr = Math.floor(coin.y / 40);
    const starts = MZ.steh.filter(([c, r]) => Math.abs(c - cc) <= 14 && r >= cr - 8 && r <= cr + 14)
      .sort((a, b) => Math.hypot(a[0] - cc, (a[1] - cr) * 1.5) - Math.hypot(b[0] - cc, (b[1] - cr) * 1.5)).slice(0, 10);
    const vs = this.varianten(m);
    for(const [c, r] of starts) for(const v of vs){
      const e = this.versuch(m, c * 40 + 20, r * 40, coin, v);
      if(e.hit && e.sicher) return {ok: true, start: [c, r], v};
    }
    return {ok: false};
  },
  alle(nur){
    MZ.vorbereiten();
    const out = [];
    for(let i = 0; i < coins.length; i++){
      const c = coins[i], cc = Math.floor(c.x / 40), cr = Math.floor(c.y / 40);
      if(nur && !nur.some(([nc, nr]) => nc === cc && nr === cr)) continue;
      const wer = c.color === 'blue' ? [true] : c.color === 'pink' ? [false] : [true, false];
      out.push({i, c: cc, r: cr, farbe: c.color, ergebnisse: wer.map(m => this.pruefen({x: c.x, y: c.y}, m))});
    }
    return out;
  },
};
