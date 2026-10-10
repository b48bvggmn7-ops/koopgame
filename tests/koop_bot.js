// tests/koop_bot.js – Koop-Bot für die Level-Tests (Ausbau 7): steuert BEIDE Figuren gleichzeitig nach je einem Plan
// (Schritte mit Bedingungen) und rechnet die Spielschritte selbst (stepSim), Kamera wie im Spiel weich nachgeführt.
// Wird nur von tests/run_tests.py in die Spielseite geladen – das Spiel selbst benutzt die Datei nicht.
// Plan-Schritte: {hold:[...], until:'Bedingung'} · {press:[...]} · {frames:n} · {wait:'Bedingung'} · {use:true}
//   {climb:true, until} (Kamin/Wandsprung) · {aim:[x...], jumps:[x...], until} (Pilz-Ketten)
//   {swing:true, pull, release:'Bedingung'} (am Haken schwingen, loslassen) · hookWhen:'Bedingung' (Haken greifen)
// In Bedingungen: P = diese Figur, Q = die andere, f = Bilder seit Schrittbeginn.
window.coopRun = function(o){
  resetLevel();
  menuScreen = 'pause'; deathState = null;
  for(const k in KEYS) KEYS[k] = false;
  if(o.links) for(const l of o.links) setLink(l, true);
  if(o.m){ p1.x = o.m[0]; p1.y = o.m[1]; } if(o.f){ p2.x = o.f[0]; p2.y = o.f[1]; }
  for(const P of [p1, p2]){ P.vx = 0; P.vy = 0; P.hookAttached = false; }
  camPos = Math.max(0, Math.min(LEVEL_W - VW, Math.min(p1.x, p2.x) - CAM_LEFT)); camX = Math.round(camPos);
  if(o.pre) Function(o.pre)();
  const plans = {m: o.plans.m || [], f: o.plans.f || []};
  const st = {m: {i: 0, t0: 0, ph: 0, dir: 1, att: 0, lastAnchor: null}, f: {i: 0, t0: 0, ph: 0, dir: 1, att: 0, lastAnchor: null}};
  const log = [];
  let ts = -3e7, f = 0, minY = {m: 1e9, f: 1e9}, trace = {m: [], f: []};
  const SEM = (P, n) => P.keys[n];
  for(f = 0; f < (o.maxFrames || 6000); f++){
    ts += 16.6;
    for(const k in KEYS) if(!k.endsWith('_pressed')) KEYS[k] = false;
    for(const who of ['m', 'f']){
      const P = who === 'm' ? p1 : p2, Q = who === 'm' ? p2 : p1, S = st[who];
      const step = plans[who][S.i];
      if(!step) continue;
      const ev = s => Function('P', 'Q', 'f', 'S', 'return (' + s + ')')(P, Q, f - S.t0, S);
      if(S.ph === 0){ S.t0 = f; S.ph = 1; S.att = 0; if(step.dir) S.dir = step.dir; }
      const hold = n => { KEYS[SEM(P, n)] = true; };
      const press = n => { KEYS[SEM(P, n)] = true; KEYS[SEM(P, n) + '_pressed'] = true; };
      let done = false;
      if(step.climb){
        // Kamin/Wandsprung: am Boden springen, an der Wand weg-drücken + springen, in der Luft Richtung halten
        if(f - S.t0 > 2 && ev(step.until)) done = true;
        else {
          if(P.onWall){ S.dir = -P.onWall; if(!S.kicked || f - S.kicked > 3){ press('jump'); S.kicked = f; } }
          else if(P.grounded && f - S.t0 > 1 && !step.noGroundJump && (step.jumpAtX === undefined || P.x >= step.jumpAtX)){ press('jump'); }
          hold(S.dir > 0 ? 'right' : 'left'); hold('jump');
          if(step.glide && P.vy > 0) hold('glide');
        }
      } else if(step.aim){
        // Pilz-Ketten: auf Ziel i zusteuern, nach jedem Abprallen (vy sehr negativ) das nächste Ziel
        if(S.ai === undefined || f === S.t0){ S.ai = 0; S.bnc = false; }
        if(P.vy < -15 && !S.bnc){ S.ai++; S.bnc = true; }
        if(P.vy > 0) S.bnc = false;
        if(P.grounded){ while(S.ai < step.aim.length - 1 && step.aim[S.ai] < P.x + 20) S.ai++; }
        const t = step.aim[Math.min(S.ai, step.aim.length - 1)];
        if(P.x < t - 4) hold('right'); else if(P.x > t + 4 && P.vx > 0.4) hold('left');
        for(const j of (step.jumps || [])) if(P.grounded && P.x >= j - 6 && P.x <= j + 30){ press('jump'); }
        if(!P.grounded && P.vy < 0) hold('jump');
        if(step.glide && P.vy > 0) hold('glide');
        if(ev(step.until)) done = true;
      } else if(step.swing){
        // am Haken: Schwung holen in Bewegungsrichtung, ggf. ranziehen, loslassen bei Bedingung
        if(!P.hookAttached){ done = true; }
        else {
          S.att++;
          if(S.att <= (step.pull || 0)) hold('pull');
          if(step.slack && S.att <= step.slack) hold('slack');
          hold(P.vx >= 0 ? 'right' : 'left');
          if(ev(step.release)){ S.lastAnchor = P.anchor; press('jump'); hold(step.after || 'right'); done = true; }
        }
      } else {
        for(const n of (step.hold || [])) hold(n);
        if(step.holdIf) for(const n in step.holdIf) if(ev(step.holdIf[n])) hold(n);
        if(step.pressIf) for(const n in step.pressIf) if(ev(step.pressIf[n])) press(n);
        if(f === S.t0) for(const n of (step.press || [])) press(n);
        if(step.hookWhen && !P.hookAttached && ev(step.hookWhen)){ const t = findHookTarget(P); if(t && t !== S.lastAnchor) press('hook'); }
        if(step.use && f === S.t0) press('use');
        if(step.frames !== undefined && f - S.t0 >= step.frames) done = true;
        if(step.until !== undefined && ev(step.until)) done = true;
        if(step.wait !== undefined && ev(step.wait)) done = true;
        if(step.frames === undefined && step.until === undefined && step.wait === undefined) done = true;
      }
      if(done){ log.push([who, S.i, f, +(P.x/40).toFixed(1), +(P.y/40-1).toFixed(1)]); S.i++; S.ph = 0; S.kicked = 0; }
    }
    camPos += (cameraTarget(camPos) - camPos) * CAM_FOLLOW; camX = Math.round(camPos);
    stepSim(ts);
    for(const k in KEYS) if(k.endsWith('_pressed')) KEYS[k] = false;
    minY.m = Math.min(minY.m, p1.y); minY.f = Math.min(minY.f, p2.y);
    if(o.trace && f % 4 === 0){ trace.m.push([Math.round(p1.x), Math.round(p1.y - 16)]); trace.f.push([Math.round(p2.x), Math.round(p2.y - 16)]); }
    const pos = () => ({m: [+((p1.x-20)/40).toFixed(1), +(p1.y/40-1).toFixed(1)], f: [+((p2.x-20)/40).toFixed(1), +(p2.y/40-1).toFixed(1)]});
    if(deathState) return {dead: deathState.victim === p1 ? 'm' : 'f', f, steps: [st.m.i, st.f.i], pos: pos(), log, trace};
    if(st.m.i >= plans.m.length && st.f.i >= plans.f.length && (!o.settle || f > o.settle)) return {done: true, f, pos: pos(), log, trace, top: {m: +(minY.m/40-1).toFixed(1), f: +(minY.f/40-1).toFixed(1)}};
  }
  return {timeout: true, f, steps: [st.m.i, st.f.i], pos: {m: [+((p1.x-20)/40).toFixed(1), +(p1.y/40-1).toFixed(1)], f: [+((p2.x-20)/40).toFixed(1), +(p2.y/40-1).toFixed(1)]}, log, trace};
};
