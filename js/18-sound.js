// 18-sound.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Geräusche (alle im Browser erzeugt, keine Tondateien) ----------
// Weiche, runde Töne statt harter Piepser. Ein "Beobachter" (sfxObserve, einmal pro Rechenschritt) erkennt
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

const SFX = {
  jump(pl){                       // weiches "Hupp" nach oben
    sfxLog('jump');
    const k = pl.male ? 1 : 1.3;
    sTone(300*k, 0, 0.14, {to: 620*k, vol: 0.055});
    sNoise(0, 0.08, {f: 1800, to: 3200, q: 0.8, vol: 0.012});
  },
  wallJump(pl){                   // Abstoßen von der Wand: kleiner Klopfer + höheres Hupp
    sfxLog('walljump');
    const k = pl.male ? 1 : 1.3;
    sNoise(0, 0.04, {f: 900, q: 3, vol: 0.05});
    sTone(380*k, 0.01, 0.15, {to: 820*k, vol: 0.05});
  },
  land(pl, speed){                // dumpfes, weiches Aufsetzen – je schneller, desto kräftiger
    sfxLog('land');
    const v = Math.min(1, (speed - 3)/10);
    sTone(150, 0, 0.1, {to: 70, vol: 0.03 + 0.06*v});
    sNoise(0, 0.07, {filter: 'lowpass', f: 700, vol: 0.02 + 0.04*v});
  },
  step(pl, n){                    // ganz leises Rascheln im Gras beim Laufen
    sNoise(0, 0.035, {filter: 'highpass', f: n % 2 ? 2600 : 3200, vol: pl.male ? 0.008 : 0.006});
  },
  hookThrow(){ sfxLog('hookthrow'); sNoise(0, 0.13, {f: 2400, to: 700, q: 1.2, vol: 0.03}); },
  hookAttach(){                   // metallisches "Tink"
    sfxLog('hook');
    sTone(1760, 0, 0.12, {type: 'triangle', vol: 0.035}); sTone(2640, 0.005, 0.09, {vol: 0.02});
  },
  hookRelease(){ sfxLog('hookrelease'); sNoise(0, 0.12, {f: 900, to: 2600, q: 0.9, vol: 0.022}); },
  umbrella(){                     // Schirm geht auf: "Fwump"
    sfxLog('umbrella');
    sNoise(0, 0.16, {filter: 'lowpass', f: 1400, to: 300, vol: 0.05});
    sTone(220, 0, 0.12, {to: 160, vol: 0.025});
  },
  death(){                        // "Plopp" + traurig abwärts gleitendes Pfeifen
    sfxLog('death');
    sNoise(0, 0.06, {filter: 'highpass', f: 1200, vol: 0.06});
    sTone(700, 0.03, 0.5, {type: 'triangle', to: 190, vol: 0.06});
    sTone(1050, 0.03, 0.35, {to: 300, vol: 0.015});
  },
  lever(on){                      // Holz-Klack + kleines Federn
    sfxLog('lever');
    sNoise(0, 0.03, {f: 1900, q: 4, vol: 0.07});
    sTone(on ? 420 : 340, 0.02, 0.12, {type: 'triangle', to: on ? 640 : 260, vol: 0.04});
  },
  door(open){                     // Holztor gleitet: Schaben + Klong am Ende
    sfxLog(open ? 'dooropen' : 'doorclose');
    sNoise(0, 0.32, {f: open ? 380 : 700, to: open ? 800 : 350, q: 2, vol: 0.035});
    sTone(open ? 110 : 90, open ? 0.28 : 0.25, 0.18, {type: 'triangle', to: 70, vol: 0.05});
  },
  crumbleWarn(){                  // Knirschen
    sfxLog('crumblewarn');
    for(let i = 0; i < 5; i++) sNoise(i*0.09 + Math.random()*0.03, 0.035, {f: 1400 + Math.random()*1200, q: 3, vol: 0.03});
  },
  crumbleBreak(){                 // Zerbröseln
    sfxLog('crumble');
    sNoise(0, 0.35, {filter: 'lowpass', f: 1600, to: 400, vol: 0.06});
    sTone(120, 0, 0.18, {to: 60, vol: 0.04});
    for(let i = 0; i < 6; i++) sNoise(0.05 + i*0.05, 0.03, {f: 2500 + Math.random()*2000, q: 4, vol: 0.015});
  },
  mushroom(){ sfxLog('mushroom'); sTone(520, 0, 0.16, {to: 860, vol: 0.04}); sTone(780, 0.06, 0.12, {to: 1200, vol: 0.02}); },
  frog(){ sfxLog('frog'); sTone(180, 0, 0.09, {type: 'square', to: 140, vol: 0.02}); sTone(170, 0.12, 0.1, {type: 'square', to: 130, vol: 0.02}); },
  discover(){                     // kleines Glitzern, wenn man etwas Besonderes entdeckt
    sfxLog('discover');
    [1319, 1568, 1976, 2637].forEach((f, i)=> sTone(f, i*0.07, 0.25, {type: 'triangle', vol: 0.025}));
  },
};

// ---------- Beobachter: erkennt Ereignisse an Zustandsänderungen (ändert selbst nichts) ----------
function sfxObserve(){
  for(const pl of [p1, p2]){
    if(!pl) continue;
    const pr = pl._snd || (pl._snd = {grounded: pl.grounded, vy: pl.vy, hook: pl.hookAttached, umb: pl.umbrella || 0, dist: 0, n: 0, wall: 0});
    if(pl.vy < -7 && pr.vy > -3 && !pl.hookAttached){
      if(pr.hook) SFX.hookRelease();
      else if(pr.wall){ SFX.wallJump(pl); if(typeof fxJump === 'function') fxJump(pl, true); }
      else { SFX.jump(pl); if(typeof fxJump === 'function') fxJump(pl, false); }
    }
    if(pl.grounded && !pr.grounded && pr.vy > 3.5){ SFX.land(pl, pr.vy); if(typeof fxLand === 'function') fxLand(pl, pr.vy); }
    if(pl.hookAttached && !pr.hook) SFX.hookAttach();
    if(!pl.male && (pl.umbrella || 0) > 0.2 && pr.umb <= 0.2) SFX.umbrella();
    if(pl.grounded && Math.abs(pl.vx) > 1){
      pr.dist += Math.abs(pl.vx);
      if(pr.dist > 46){ pr.dist = 0; SFX.step(pl, pr.n++); }
    } else pr.dist = 30;
    pr.wall = pl.onWall ? 8 : Math.max(0, pr.wall - 1);   // kurz nach Wandkontakt zählt ein Sprung als Wandsprung
    pr.grounded = pl.grounded; pr.vy = pl.vy; pr.hook = pl.hookAttached; pr.umb = pl.umbrella || 0;
  }
  for(const s of solids){
    if(s.type === 'crumble'){
      if(s.triggered && !s._sT && !s.gone) SFX.crumbleWarn();
      if(s.gone && !s._sG) SFX.crumbleBreak();
      s._sT = s.triggered; s._sG = s.gone;
    } else if(s.type === 'door'){
      if(s._sO !== undefined && s.open !== s._sO) SFX.door(s.open);
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
