// 18-sound.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Geräusche (alle im Browser erzeugt, keine Tondateien) ----------
// ASMR-artig: feine Materialklänge statt Piepser (Klangbibliothek unten). Ein "Beobachter" (sfxObserve, einmal pro Rechenschritt) erkennt
// Springen, Landen, Schritte, Haken, Schirm, Bröckelboden und Türen an den Zustandsänderungen – er verändert
// selbst nichts am Spiel. Taste M = Ton aus/an (wird im Browser gemerkt), auch im Pausenmenü.
const SFX_LOG = [];   // zuletzt gespielte Geräusche (für Tests)
function sfxLog(name){ SFX_LOG.push(name); if(SFX_LOG.length > 30) SFX_LOG.shift(); }

function sfxCtx(){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }catch(e){ return null; }
}
let sfxNoiseBuf = null;
function sfxNoise(){
  const a = sfxCtx(); if(!a) return null;
  if(!sfxNoiseBuf){
    sfxNoiseBuf = a.createBuffer(1, a.sampleRate*2, a.sampleRate);
    const d = sfxNoiseBuf.getChannelData(0);
    for(let i = 0; i < d.length; i++) d[i] = Math.random()*2 - 1;
  }
  return sfxNoiseBuf;
}
// ein Ton mit weicher Hüllkurve; optional gleitet die Tonhöhe (to)
function sTone(f, start, dur, o){
  o = o || {};
  const a = sfxCtx(); if(!a || soundMuted) return;
  try{
    const t = a.currentTime + start, osc = a.createOscillator(), g = a.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t);
    if(o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    const vol = (o.vol || 0.06);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (o.attack || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(audioOut());
    osc.start(t); osc.stop(t + dur + 0.03);
  }catch(e){}
}
// gefiltertes Rauschen (Wusch, Knirschen, Plätschern …)
function sNoise(start, dur, o){
  o = o || {};
  const a = sfxCtx(); if(!a || soundMuted) return;
  try{
    const t = a.currentTime + start, src = a.createBufferSource(), flt = a.createBiquadFilter(), g = a.createGain();
    src.buffer = sfxNoise(); src.playbackRate.value = o.rate || 1;
    flt.type = o.filter || 'bandpass'; flt.Q.value = o.q || 1;
    flt.frequency.setValueAtTime(o.f || 1000, t);
    if(o.to) flt.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    const vol = o.vol || 0.04;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (o.attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(flt); flt.connect(g); g.connect(audioOut());
    src.start(t, Math.random()*1.5); src.stop(t + dur + 0.03);
  }catch(e){}
}

// ---------- ASMR-Klangbibliothek ----------
// Alle Spiel-Geräusche werden einmal (im Hintergrund, in kleinen Häppchen) als kurze STEREO-Aufnahmen berechnet –
// aus vielen feinen Einzelteilen wie bei echten Materialien: Knistern (viele winzige Körnchen), Holz/Glas/Metall
// (gedämpfte Eigenschwingungen), Stoff-Wusch (gefiltertes Rauschen mit Sweep), Knarzen (Haft-Gleit-Impulse).
// Abgespielt mit kleiner Zufalls-Variation (nie zweimal exakt gleich), links/rechts je nach Ort im Bild und
// mit einem Hauch Nachhall für Wärme. Bis die Bibliothek fertig ist (~1 s nach dem ersten Tastendruck) bleibt es still.
const SFX_SR = 44100;
const SFX_VOL = {step: 0.11, land: 0.26, jump: 0.2, wall: 0.24, coin: 0.24, hookAttach: 0.3, rope: 0.15, umbrella: 0.24,
  lever: 0.2, doorOpen: 0.2, doorClose: 0.2, crumbleWarn: 0.2, crumbleBreak: 0.4, death: 0.22, checkpoint: 0.22,
  mushroom: 0.15, frog: 0.15, discover: 0.18, bud: 0.15, heart: 0.07, birdFlap: 0.15, menuTick: 0.12, menuOk: 0.14};
let sfxBank = null, sfxJob = false, sfxRev = null;

function* sfxBuild(a, out){
  const SR = a.sampleRate, R = Math.random, rnd = (x, y)=> x + R()*(y - x);
  const mk = sec => ({L: new Float32Array(Math.ceil(sec*SR)), R: new Float32Array(Math.ceil(sec*SR)), n: Math.ceil(sec*SR)});
  const gains = pan => [Math.cos((pan + 1)*Math.PI/4), Math.sin((pan + 1)*Math.PI/4)];
  // gedämpfte Eigenschwingungen (Holz, Glas, Metall, Kalimba): parts = [[Verhältnis, Lautstärke, Abklingfaktor]]
  function modal(b, t, f, parts, decay, amp, pan, click){
    const [gl, gr] = gains(pan || 0), st = Math.floor(t*SR);
    for(const [ratio, pa, dm] of parts){
      const w = 2*Math.PI*f*ratio/SR; if(w >= Math.PI) continue;
      const d = decay*(dm || 1), len = Math.min(b.n - st, Math.ceil(d*5*SR)), ef = Math.exp(-1/(d*SR)), c = 2*Math.cos(w);
      let s0 = 0, s1 = Math.sin(w)*pa*amp, env = 1;
      for(let i = 0; i < len; i++){ const v = s0*env; b.L[st + i] += v*gl; b.R[st + i] += v*gr; const nx = c*s1 - s0; s0 = s1; s1 = nx; env *= ef; }
    }
    if(click){ const len = Math.min(b.n - st, Math.ceil(0.004*SR)); let e = click*amp;
      for(let i = 0; i < len; i++){ const v = (R()*2 - 1)*e; b.L[st + i] += v*gl; b.R[st + i] += v*gr; e *= 0.93; } }
  }
  // viele winzige Körnchen (Knistern von Laub/Sand/Steinchen)
  function grains(b, t0, dur, count, fmin, fmax, dmin, dmax, amp, spread, shape){
    for(let i = 0; i < count; i++){
      let u = R(); if(shape === 'decay') u = u*u; if(shape === 'grow') u = Math.sqrt(u);
      modal(b, t0 + u*dur, rnd(fmin, fmax), [[1, 1]], rnd(dmin, dmax), amp*(0.25 + Math.pow(R(), 2)*0.75), (R()*2 - 1)*(spread || 0.5), 0.6);
    }
  }
  // gefiltertes Rauschen mit weichem An- und Abschwellen; Bandpass-Mitte gleitet von f0 nach f1 (Stoff, Luft, Wusch)
  function swish(b, t, dur, f0, f1, q, amp, pan, att){
    const [gl, gr] = gains(pan || 0), st = Math.floor(t*SR), len = Math.min(b.n - st, Math.ceil(dur*SR));
    let low = 0, band = 0;
    for(let i = 0; i < len; i++){
      const k = i/len, fc = f0*Math.pow(f1/f0, k), F = 2*Math.sin(Math.PI*Math.min(fc, SR/6)/SR);
      const x = R()*2 - 1; low += F*band; const high = x - low - band/q; band += F*high;
      const env = k < (att || 0.3) ? Math.sin(k/(att || 0.3)*Math.PI/2) : Math.pow(1 - (k - (att || 0.3))/(1 - (att || 0.3)), 2);
      const v = band*env*amp; b.L[st + i] += v*gl; b.R[st + i] += v*gr;
    }
  }
  // tiefer, weicher Plumps (Sinus mit fallender Tonhöhe)
  function thump(b, t, f0, f1, dur, amp, pan){
    const [gl, gr] = gains(pan || 0), st = Math.floor(t*SR), len = Math.min(b.n - st, Math.ceil(dur*SR));
    let ph = 0;
    for(let i = 0; i < len; i++){ const k = i/len; ph += 2*Math.PI*f0*Math.pow(f1/f0, k)/SR;
      const v = Math.sin(ph)*Math.exp(-k*5)*Math.min(1, i/(0.003*SR))*amp; b.L[st + i] += v*gl; b.R[st + i] += v*gr; }
  }
  // weiches Rauschen (Tiefpass), z. B. Puff, Rumpeln
  function puff(b, t, dur, lp, amp, pan, att){
    const [gl, gr] = gains(pan || 0), st = Math.floor(t*SR), len = Math.min(b.n - st, Math.ceil(dur*SR)), k1 = 1 - Math.exp(-2*Math.PI*lp/SR);
    let y = 0, y2 = 0;
    for(let i = 0; i < len; i++){ const k = i/len; y += (R()*2 - 1 - y)*k1; y2 += (y - y2)*k1;
      const env = k < (att || 0.08) ? k/(att || 0.08) : Math.pow(1 - k, 2.2); const v = y2*env*amp*3; b.L[st + i] += v*gl; b.R[st + i] += v*gr; }
  }
  // Knarzen: unregelmäßige Haft-Gleit-Impulse, die Holz-Resonanzen anregen
  function creak(b, t, dur, r0, r1, f, amp, pan){
    let tt = 0;
    while(tt < dur){ const k = tt/dur, rate = r0 + (r1 - r0)*k; const env = Math.sin(Math.PI*k);
      modal(b, t + tt, f*(0.95 + R()*0.1), [[1, 1], [2.3, 0.5], [3.9, 0.25]], 0.006, amp*env*(0.6 + R()*0.4), pan, 0.3);
      tt += 1/rate*(0.7 + R()*0.6); }
  }
  const glass = [[1, 1, 1], [2.76, 0.45, 0.6], [5.40, 0.25, 0.4], [8.93, 0.12, 0.3]];
  const metal = [[1, 1, 1], [1.59, 0.6, 0.8], [2.31, 0.4, 0.6], [3.17, 0.25, 0.5]];
  const wood = [[1, 1, 1], [2.7, 0.45, 0.5], [5.1, 0.2, 0.35]];
  const kalimba = [[1, 1, 1], [5.9, 0.12, 0.25], [2.0, 0.08, 0.5]];
  const musicbox = [[1, 1, 1], [3.9, 0.3, 0.35], [6.8, 0.12, 0.25]];
  const NOTE = n => 440*Math.pow(2, (n - 69)/12);
  const recipes = {
    step:      ()=>{ const b = mk(0.12); grains(b, 0, 0.07, 26, 1800, 6500, 0.0004, 0.0015, 0.5, 0.25, 'decay'); puff(b, 0, 0.06, 900, 0.25, 0, 0.1); return b; },
    land:      ()=>{ const b = mk(0.3); thump(b, 0, 130, 55, 0.18, 0.9); grains(b, 0.005, 0.12, 60, 1500, 6000, 0.0004, 0.0018, 0.55, 0.6, 'decay'); puff(b, 0, 0.14, 700, 0.5, 0, 0.05); return b; },
    jump:      ()=>{ const b = mk(0.22); swish(b, 0, 0.17, 500, 2600, 1.4, 1.0, rnd(-0.15, 0.15), 0.35); thump(b, 0, 200, 330, 0.04, 0.25); return b; },
    wall:      ()=>{ const b = mk(0.3); modal(b, 0, rnd(380, 460), wood, 0.03, 0.9, 0, 0.8); swish(b, 0.01, 0.16, 700, 2600, 1.4, 0.8, 0, 0.3); return b; },
    coin:      ()=>{ const b = mk(0.9); modal(b, 0, 1568, glass, 0.35, 0.8, -0.1, 0.4); modal(b, 0.065, 2349, glass, 0.4, 0.6, 0.12, 0.3);
                     grains(b, 0.04, 0.45, 18, 6000, 10000, 0.003, 0.012, 0.15, 0.9, 'decay'); return b; },
    hookAttach:()=>{ const b = mk(0.45); modal(b, 0, 3300, metal, 0.012, 0.8, 0, 0.9); modal(b, 0.035, 3600, metal, 0.01, 0.6, 0, 0.8); modal(b, 0.03, 1780, metal, 0.22, 0.25, 0); return b; },
    rope:      ()=>{ const b = mk(0.22); swish(b, 0, 0.18, 2400, 700, 2.2, 1.0, 0, 0.25); grains(b, 0, 0.15, 14, 3000, 7000, 0.0003, 0.0008, 0.15, 0.3); return b; },
    umbrella:  ()=>{ const b = mk(0.4); puff(b, 0, 0.09, 1200, 0.9, 0, 0.03); swish(b, 0.02, 0.28, 600, 300, 0.9, 0.6, 0, 0.15);
                     for(let i = 0; i < 6; i++) swish(b, 0.06 + i*0.035, 0.03, 1500, 900, 1.2, 0.35*(1 - i/6), 0, 0.3); return b; },
    lever:     ()=>{ const b = mk(0.4); for(let i = 0; i < 4; i++) modal(b, i*0.028, rnd(1100, 1300), wood, 0.006, 0.55, 0, 0.6); modal(b, 0.12, 190, wood, 0.06, 0.9, 0, 0.5); return b; },
    doorOpen:  ()=>{ const b = mk(0.75); creak(b, 0, 0.5, 35, 70, rnd(650, 800), 0.5, 0); for(let i = 0; i < 6; i++) modal(b, 0.05 + i*0.08, 2200, metal, 0.004, 0.25, 0, 0.4); modal(b, 0.55, 160, wood, 0.07, 0.6, 0, 0.4); return b; },
    doorClose: ()=>{ const b = mk(0.6); creak(b, 0, 0.25, 60, 30, rnd(600, 700), 0.4, 0); modal(b, 0.26, 150, wood, 0.09, 1.0, 0, 0.8); puff(b, 0.26, 0.15, 500, 0.4, 0, 0.05); return b; },
    crumbleWarn:()=>{ const b = mk(0.6); grains(b, 0, 0.5, 120, 2000, 7500, 0.0003, 0.0012, 0.35, 0.6, 'grow'); for(let i = 0; i < 5; i++) modal(b, rnd(0.05, 0.5), rnd(2000, 3200), wood, 0.004, 0.4, rnd(-0.4, 0.4), 0.5); return b; },
    crumbleBreak:()=>{ const b = mk(0.9); puff(b, 0, 0.35, 450, 0.8, 0, 0.02); thump(b, 0, 110, 50, 0.2, 0.6);
                     for(let i = 0; i < 30; i++){ const u = R(); modal(b, u*u*0.7, rnd(1000, 3600), wood, rnd(0.004, 0.012), rnd(0.25, 0.7), rnd(-0.7, 0.7), 0.5); }
                     grains(b, 0, 0.6, 150, 2500, 8000, 0.0003, 0.001, 0.25, 0.8, 'decay'); return b; },
    death:     ()=>{ const b = mk(0.8);   // niedlicher Seifenblasen-„Plopp“ + Staubwölkchen + Glitzer (nicht traurig)
                     const len = Math.ceil(0.06*SR); let ph = 0;
                     for(let i = 0; i < len; i++){ const k = i/len; ph += 2*Math.PI*(260*Math.pow(4.2, k))/SR;
                       const v = Math.sin(ph)*Math.min(1, i/(0.002*SR))*Math.pow(1 - k, 1.5)*0.9; b.L[i] += v; b.R[i] += v; }
                     thump(b, 0, 170, 85, 0.12, 0.35);
                     swish(b, 0.01, 0.26, 2600, 600, 0.9, 0.45, 0, 0.1);
                     puff(b, 0.015, 0.2, 1600, 0.35, 0, 0.05);
                     grains(b, 0.05, 0.5, 16, 6500, 11000, 0.004, 0.012, 0.18, 0.9, 'decay'); return b; },
    checkpoint:()=>{ const b = mk(1.4); [84, 88, 91, 96].forEach((n, i)=> modal(b, i*0.11, NOTE(n), musicbox, 0.5, 0.5, (i - 1.5)*0.2, 0.1)); return b; },
    mushroom:  ()=>{ const b = mk(0.35); const st = 0, len = Math.ceil(0.22*SR); let ph = 0;
                     for(let i = 0; i < len; i++){ const k = i/len, f = 260 + 300*Math.sin(Math.PI*Math.min(1, k*1.6))*Math.exp(-k*2) + Math.sin(i/SR*2*Math.PI*28)*25;
                       ph += 2*Math.PI*f/SR; const v = Math.sin(ph)*Math.exp(-k*4)*Math.min(1, i/200)*0.8; b.L[st + i] += v*0.7; b.R[st + i] += v*0.7; }
                     grains(b, 0, 0.05, 10, 1500, 4000, 0.0006, 0.002, 0.3, 0.2); return b; },
    frog:      ()=>{ const b = mk(0.45); for(const t0 of [0, 0.16]){ for(let i = 0; i < 7; i++) modal(b, t0 + i*0.016, rnd(380, 430), [[1, 1], [2.8, 0.6], [4.2, 0.3]], 0.012, 0.6, 0, 0.3); } return b; },
    discover:  ()=>{ const b = mk(1.4); [88, 91, 95, 100, 103].forEach((n, i)=> modal(b, i*0.075, NOTE(n), musicbox, 0.55, 0.4, (i - 2)*0.25, 0.05));
                     grains(b, 0.1, 0.8, 25, 7000, 11000, 0.003, 0.01, 0.12, 0.9, 'decay'); return b; },
    bud:       ()=>{ const b = mk(0.8); thump(b, 0, 500, 900, 0.03, 0.4); modal(b, 0.03, NOTE(91), musicbox, 0.4, 0.35, 0, 0.05); modal(b, 0.1, NOTE(96), musicbox, 0.4, 0.25, 0, 0.05); return b; },
    heart:     ()=>{ const b = mk(0.7); modal(b, 0, NOTE(rnd(84, 92) | 0), kalimba, 0.35, 0.5, 0, 0.1); return b; },
    birdFlap:  ()=>{ const b = mk(0.5); for(let i = 0; i < 9; i++) swish(b, i*0.045, 0.04, 900, 1800, 1.0, 0.5*(1 - i/10), rnd(-0.3, 0.3), 0.3); return b; },
    menuTick:  ()=>{ const b = mk(0.08); modal(b, 0, 2600, wood, 0.003, 0.6, 0, 0.8); return b; },
    menuOk:    ()=>{ const b = mk(0.5); thump(b, 0, 300, 520, 0.05, 0.5); modal(b, 0.02, NOTE(88), musicbox, 0.3, 0.35, 0, 0.05); return b; },
  };
  const bank = {};
  for(const name in recipes){
    bank[name] = [];
    const variants = name === 'step' ? 6 : name === 'checkpoint' || name === 'discover' || name === 'death' ? 1 : 3;
    for(let v = 0; v < variants; v++){
      const b = recipes[name]();
      let peak = 0.001; for(let i = 0; i < b.n; i++) peak = Math.max(peak, Math.abs(b.L[i]), Math.abs(b.R[i]));
      const ab = a.createBuffer(2, b.n, SR), k = 0.9/peak, L = ab.getChannelData(0), Rr = ab.getChannelData(1);
      for(let i = 0; i < b.n; i++){ L[i] = b.L[i]*k; Rr[i] = b.R[i]*k; }
      bank[name].push(ab);
      yield;
    }
  }
  // Nachhall: kurzer, warmer Raum (abklingendes, weiches Rauschen)
  const irLen = Math.ceil(1.1*SR), ir = a.createBuffer(2, irLen, SR);
  for(let ch = 0; ch < 2; ch++){ const d = ir.getChannelData(ch); let y = 0;
    for(let i = 0; i < irLen; i++){ y += (R()*2 - 1 - y)*0.35; d[i] = y*Math.exp(-i/irLen*6)*0.5; } }
  out.bank = bank; out.ir = ir;
}
function sfxPrepare(){
  if(sfxBank || sfxJob) return;
  const a = sfxCtx(); if(!a) return;
  sfxJob = true;
  const out = {}, it = sfxBuild(a, out);
  const tick = ()=>{
    const t0 = performance.now();
    while(performance.now() - t0 < 6){
      if(it.next().done){
        try{ const cv = a.createConvolver(); cv.buffer = out.ir; const send = a.createGain(); send.gain.value = 0.16;
             send.connect(cv); cv.connect(audioOut()); sfxRev = send; }catch(e){}
        sfxBank = out.bank; return;
      }
    }
    setTimeout(tick, 16);
  };
  setTimeout(tick, 50);
}
window.addEventListener('keydown', sfxPrepare, {once: true});
window.addEventListener('pointerdown', sfxPrepare, {once: true});

function sfxPan(x){ return x === undefined ? 0 : Math.max(-1, Math.min(1, (x - camX - VW/2)/(VW/2)))*0.6; }
// spielt ein Geräusch aus der Bibliothek; o = {x (Weltposition für links/rechts), rate (Tonhöhe), vol}
function sfxPlay(name, o){
  o = o || {};
  const a = sfxCtx(); if(!a || soundMuted || !sfxBank || !sfxBank[name]) return false;
  try{
    const list = sfxBank[name], src = a.createBufferSource();
    src.buffer = list[Math.floor(Math.random()*list.length)];
    src.playbackRate.value = (o.rate || 1)*(1 + (Math.random() - 0.5)*0.07);
    const g = a.createGain(); g.gain.value = (SFX_VOL[name] || 0.15)*(o.vol || 1)*(0.9 + Math.random()*0.2);
    src.connect(g);
    let outNode = g;
    if(a.createStereoPanner){ const p = a.createStereoPanner(); p.pan.value = sfxPan(o.x); g.connect(p); outNode = p; }
    outNode.connect(audioOut());
    if(sfxRev) outNode.connect(sfxRev);
    src.start();
    return true;
  }catch(e){ return false; }
}

const SFX = {
  jump(pl){ sfxLog('jump'); sfxPlay('jump', {x: pl.x, rate: pl.male ? 1 : 1.18}); },
  wallJump(pl){ sfxLog('walljump'); sfxPlay('wall', {x: pl.x, rate: pl.male ? 1 : 1.12}); },
  land(pl, speed){ sfxLog('land'); sfxPlay('land', {x: pl.x, vol: 0.45 + 0.55*Math.min(1, (speed - 3)/10), rate: pl.male ? 1 : 1.1}); },
  step(pl, n){ sfxPlay('step', {x: pl.x, vol: pl.male ? 1 : 0.8, rate: pl.male ? 1 : 1.15}); },
  hookThrow(pl){ sfxLog('hookthrow'); sfxPlay('rope', {x: pl && pl.x}); },
  hookAttach(pl){ sfxLog('hook'); sfxPlay('hookAttach', {x: pl && pl.x}); },
  hookRelease(pl){ sfxLog('hookrelease'); sfxPlay('rope', {x: pl && pl.x, rate: 1.15}); },
  umbrella(pl){ sfxLog('umbrella'); sfxPlay('umbrella', {x: pl && pl.x}); },
  death(x){ sfxLog('death'); sfxPlay('death', {x}); },
  lever(on, x){ sfxLog('lever'); sfxPlay('lever', {x, rate: on ? 1.08 : 0.92}); },
  door(open, x){ sfxLog(open ? 'dooropen' : 'doorclose'); sfxPlay(open ? 'doorOpen' : 'doorClose', {x}); },
  crumbleWarn(x){ sfxLog('crumblewarn'); sfxPlay('crumbleWarn', {x}); },
  crumbleBreak(x){ sfxLog('crumble'); sfxPlay('crumbleBreak', {x}); },
  checkpoint(x){ sfxLog('checkpoint'); sfxPlay('checkpoint', {x}); },
  coin(combo, x){ sfxLog('coin'); return sfxPlay('coin', {x, rate: Math.pow(2, combo/12)}); },
  mushroom(x){ sfxLog('mushroom'); sfxPlay('mushroom', {x}); },
  frog(x){ sfxLog('frog'); sfxPlay('frog', {x}); },
  discover(x){ sfxLog('discover'); sfxPlay('discover', {x}); },
  bud(x){ sfxLog('bud'); sfxPlay('bud', {x}); },
  heart(x){ sfxPlay('heart', {x}); },
  birdFlap(x){ sfxLog('bird'); sfxPlay('birdFlap', {x}); },
  menuTick(){ sfxPlay('menuTick'); },
  menuOk(){ sfxPlay('menuOk'); },
};

// ---------- Beobachter: erkennt Ereignisse an Zustandsänderungen (ändert selbst nichts) ----------
function sfxObserve(){
  for(const pl of [p1, p2]){
    if(!pl) continue;
    const pr = pl._snd || (pl._snd = {grounded: pl.grounded, vy: pl.vy, hook: pl.hookAttached, umb: pl.umbrella || 0, dist: 0, n: 0, wall: 0});
    if(pl.vy < -7 && pr.vy > -3 && !pl.hookAttached){
      if(pr.hook) SFX.hookRelease(pl);
      else if(pr.wall){ SFX.wallJump(pl); if(typeof fxJump === 'function') fxJump(pl, true); }
      else { SFX.jump(pl); if(typeof fxJump === 'function') fxJump(pl, false); }
    }
    if(pl.grounded && !pr.grounded && pr.vy > 3.5){ SFX.land(pl, pr.vy); if(typeof fxLand === 'function') fxLand(pl, pr.vy); }
    if(pl.hookAttached && !pr.hook) SFX.hookAttach(pl);
    if(!pl.male && (pl.umbrella || 0) > 0.2 && pr.umb <= 0.2) SFX.umbrella(pl);
    if(pl.grounded && Math.abs(pl.vx) > 1){
      pr.dist += Math.abs(pl.vx);
      if(pr.dist > 46){ pr.dist = 0; SFX.step(pl, pr.n++); }
    } else pr.dist = 30;
    pr.wall = pl.onWall ? 8 : Math.max(0, pr.wall - 1);   // kurz nach Wandkontakt zählt ein Sprung als Wandsprung
    pr.grounded = pl.grounded; pr.vy = pl.vy; pr.hook = pl.hookAttached; pr.umb = pl.umbrella || 0;
  }
  for(const s of solids){
    if(s.type === 'crumble'){
      if(s.triggered && !s._sT && !s.gone) SFX.crumbleWarn(s.x + s.w/2);
      if(s.gone && !s._sG) SFX.crumbleBreak(s.x + s.w/2);
      s._sT = s.triggered; s._sG = s.gone;
    } else if(s.type === 'door'){
      if(s._sO !== undefined && s.open !== s._sO) SFX.door(s.open, s.x + s.w/2);
      s._sO = s.open;
    }
  }
}

// ---------- Ton aus/an: Taste M und Pausenmenü ----------
function setMuted(m){
  soundMuted = m;
  try{ localStorage.setItem('monchichi_mute', m ? '1' : '0'); }catch(e){}
  if(masterGain) masterGain.gain.value = m ? 0 : 1;
  if(typeof weatherSetMuted === 'function') weatherSetMuted(m);
  testJumpMsg = m ? '🔇 Ton aus (M)' : '🔊 Ton an (M)'; testJumpT = performance.now();
}
window.addEventListener('keydown', e=>{ if(e.code === 'KeyM' && !e.repeat) setMuted(!soundMuted); });
