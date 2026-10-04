// 19-wetter.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Wetter, Licht und Stimmung (reine Deko, kein Einfluss aufs Spiel) ----------
// Ablauf: Sonne (WEATHER_SUN_S) -> zieht zu -> Regenschauer (WEATHER_RAIN_S) -> klart auf mit Regenbogen -> Sonne …
// Regen: schräge Tropfen vor der Welt, kleine Spritzer auf allen Oberseiten, dunklerer Himmel (nur Hintergrund –
// das Spielfeld bleibt hell). Ton: sanftes Rauschen + Tropfen wie auf einem schrägen Dachfenster.
// Bei Sonne: warme Sonnenstrahlen, ab und zu Vogelgezwitscher. Immer: leichter warmer Schimmer + weiche Vignette.
const WEATHER_SUN_S = [70, 120];     // Sekunden Sonne (zufällig dazwischen)
const WEATHER_RAIN_S = [30, 45];     // Sekunden Regen
const WEATHER_FADE_S = 7;            // Übergang zu/auf
const RAINBOW_S = 22;                // so lange bleibt der Regenbogen nach dem Regen

const weather = {phase: 'sun', t: 0, len: 45, rain: 0, rainbow: 0, splashes: [], nextChirp: 6};
function weatherRand(a){ return a[0] + Math.random()*(a[1] - a[0]); }
// zum Ausprobieren/Testen: weatherForce('rain') oder weatherForce('sun')
function weatherForce(ph){
  weather.phase = ph; weather.t = 0;
  if(ph === 'rain'){ weather.len = weatherRand(WEATHER_RAIN_S); weather.rain = 1; }
  else { weather.len = weatherRand(WEATHER_SUN_S); weather.rain = 0; }
}
function weatherUpdate(dt){
  const w = weather;
  w.t += dt;
  if(w.t >= w.len){
    w.t = 0;
    if(w.phase === 'sun'){ w.phase = 'cloud'; w.len = WEATHER_FADE_S; }
    else if(w.phase === 'cloud'){ w.phase = 'rain'; w.len = weatherRand(WEATHER_RAIN_S); }
    else if(w.phase === 'rain'){ w.phase = 'clear'; w.len = WEATHER_FADE_S; w.rainbow = 0.001; }
    else { w.phase = 'sun'; w.len = weatherRand(WEATHER_SUN_S); }
  }
  const target = w.phase === 'rain' ? 1 : w.phase === 'cloud' ? w.t/w.len*0.35 : w.phase === 'clear' ? 0.35*(1 - w.t/w.len) : 0;
  w.rain += (target - w.rain) * Math.min(1, dt*0.8);
  if(w.rainbow > 0){ w.rainbow += dt; if(w.rainbow > RAINBOW_S) w.rainbow = 0; }
  weatherAudio(dt);
}

// --- Himmel: Sonnenstrahlen und Regenbogen (hinter allen Ebenen) ---
function weatherSkyFx(){
  const sunAmt = 1 - weather.rain, t = performance.now();
  if(sunAmt > 0.05){
    ctx.save(); ctx.globalAlpha = 0.22*sunAmt; ctx.translate(930, 290);
    ctx.rotate(t*0.00002);
    for(let i = 0; i < 12; i++){
      ctx.rotate(Math.PI*2/12);
      const g = ctx.createLinearGradient(0, 0, 0, -520);
      g.addColorStop(0, 'rgba(255,240,190,0.9)'); g.addColorStop(1, 'rgba(255,240,190,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-38, -520); ctx.lineTo(38, -520); ctx.lineTo(6, 0); ctx.fill();
    }
    ctx.restore();
  }
  if(weather.rainbow > 0){
    const k = weather.rainbow, a = Math.min(1, k/3) * Math.min(1, (RAINBOW_S - k)/5) * 0.45;
    ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 9;
    const cols = ['#ff5a5a', '#ffa64d', '#ffe36b', '#7be07b', '#5ab4ff', '#8a7bff', '#c77bff'];
    cols.forEach((c, i)=>{
      ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(420, 640, 470 - i*9, Math.PI*1.05, Math.PI*1.95); ctx.stroke();
    });
    ctx.restore();
  }
}
// --- Hintergrund bei Regen abdunkeln/abkühlen (nur Ebenen dahinter, nicht das Spielfeld) ---
function weatherBgTint(){
  if(weather.rain < 0.02) return;
  ctx.fillStyle = `rgba(70,95,115,${(0.32*weather.rain).toFixed(3)})`;
  ctx.fillRect(0, 0, W, H);
}

// --- Vorne: Regen, Spritzer, warmer Schimmer, Vignette ---
const VIGNETTE = (()=>{
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), r = g.createRadialGradient(W/2, H*0.45, H*0.35, W/2, H*0.45, H*1.05);
  r.addColorStop(0, 'rgba(60,30,10,0)'); r.addColorStop(1, 'rgba(60,30,10,0.28)');
  g.fillStyle = r; g.fillRect(0, 0, W, H);
  return c;
})();
function weatherTops(){
  // sichtbare Oberseiten (für Spritzer): Boden, Wand, Bröckelboden, Plattform
  const tops = [];
  for(const s of solids){
    if(s.gone || !(s.type==='ground' || s.type==='wall' || s.type==='crumble' || s.type==='platform' || s.type==='moveplat')) continue;
    const x = s.x - camX; if(x + s.w < 0 || x > VW) continue;
    tops.push(s);
  }
  return tops;
}
function weatherFront(){
  const dtS = Math.min(0.1, frameDt/1000);
  weatherUpdate(dtS);
  const r = weather.rain, t = performance.now();
  if(r > 0.02){
    // Tropfen: schräge Striche, Position rein aus der Zeit berechnet (kein Zustand nötig)
    const n = Math.round(230*r);
    ctx.save(); ctx.strokeStyle = 'rgba(215,232,255,0.62)'; ctx.lineWidth = 1.6; ctx.beginPath();
    for(let i = 0; i < n; i++){
      const sx = (i*97.13) % 1, sy = (i*61.7) % 1, speed = 0.9 + (i % 5)*0.08;
      const y = ((sy*H + t*speed) % (H + 40)) - 20;
      const x = ((sx*(W + 200) - y*0.18 - camX*0.6) % (W + 200) + W + 200) % (W + 200) - 100;
      ctx.moveTo(x, y); ctx.lineTo(x - 3.5, y + 16);
    }
    ctx.stroke(); ctx.restore();
    // Spritzer auf Oberseiten
    const tops = weatherTops();
    if(tops.length){
      const spawn = r*dtS*90, count = Math.min(6, Math.floor(spawn) + (Math.random() < spawn % 1 ? 1 : 0));
      for(let k = 0; k < count; k++){
        const s = tops[Math.floor(Math.random()*tops.length)];
        weather.splashes.push({x: s.x + Math.random()*s.w, y: s.y + 1, t0: t});
      }
    }
  }
  weather.splashes = weather.splashes.filter(sp => t - sp.t0 < 320);
  if(weather.splashes.length){
    ctx.save(); ctx.strokeStyle = 'rgba(220,235,255,0.7)'; ctx.fillStyle = 'rgba(220,235,255,0.75)'; ctx.lineWidth = 1;
    for(const sp of weather.splashes){
      const k = (t - sp.t0)/320, x = sp.x - camX;
      ctx.globalAlpha = 1 - k;
      ctx.beginPath(); ctx.ellipse(x, sp.y, 2 + k*7, 1 + k*1.6, 0, Math.PI, Math.PI*2); ctx.stroke();
      ctx.fillRect(x - 3 - k*4, sp.y - 3 - k*7 + k*k*9, 1.6, 1.6); ctx.fillRect(x + 2 + k*4, sp.y - 4 - k*8 + k*k*10, 1.6, 1.6);
    }
    ctx.restore();
  }
  // warmer Schimmer (bei Regen kühler) + weiche Vignette
  ctx.fillStyle = r > 0.5 ? `rgba(120,150,190,${(0.06*r).toFixed(3)})` : `rgba(255,190,110,${(0.06*(1 - r)).toFixed(3)})`;
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(VIGNETTE, 0, 0);
}

// ---------- Wetter-Geräusche ----------
// Regen: leises Rauschen (dauerhafter Rauschquelle, Lautstärke folgt dem Regen) + einzelne Tropfen, die wie auf
// einem schrägen Glas-Dachfenster "tick"/"plink" machen; ab und zu ein dicker Tropfen von einem Blatt ("plopp").
// Sonne: ab und zu ein Vogel in der Ferne.
// Regen-Klang wie auf einem schrägen Metalldach / Dachfenster (ASMR):
// Einmal vorab berechnete, nahtlos wiederholte STEREO-Schleifen aus tausenden Einzeltropfen:
//  - Bett: weiches, warmes rosa Rauschen (tiefpass) statt Zischen
//  - Prasseln: winzige, sehr kurze Einschläge (2–7 kHz), jeder an einer anderen Stelle links/rechts
//  - Glas: feine "tick"-Tropfen mit kurzem gläsernem Nachklang
//  - Metall: vereinzelte "ping/plonk"-Tropfen mit metallischen Obertönen und längerem Nachklingen
// Live dazu: ab und zu ein satter "Plopp" aus der Dachrinne; bei leichtem Regen nur vereinzelte Tropfen.
const RAIN_LOOP_S = 6;
let rainSnd = null, rainDripAcc = 0, rainLightAcc = 0;
// Berechnung in kleinen Häppchen (Generator), damit nichts ruckelt; läuft im Hintergrund nach dem ersten Tastendruck
function* rainSynthSteps(a, out){
  const sr = a.sampleRate, n = Math.floor(sr*RAIN_LOOP_S);
  const bufs = {bed: a.createBuffer(2, n, sr), patter: a.createBuffer(2, n, sr), metal: a.createBuffer(2, n, sr)};
  // Bett: rosa Rauschen (Paul-Kellet-Filter) + Tiefpass, leicht atmende Lautstärke (ganze Perioden -> nahtlos)
  const k = 1 - Math.exp(-2*Math.PI*1100/sr), kd = 1 - Math.exp(-2*Math.PI*220/sr);   // warm + tiefes Blechdach-Brummen
  for(let ch = 0; ch < 2; ch++){
    const d = bufs.bed.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, lp = 0, drum = 0;
    for(let i = 0; i < n; i++){
      const w = Math.random()*2 - 1;
      b0 = 0.99886*b0 + w*0.0555179; b1 = 0.99332*b1 + w*0.0750759; b2 = 0.96900*b2 + w*0.1538520;
      b3 = 0.86650*b3 + w*0.3104856; b4 = 0.55000*b4 + w*0.5329522; b5 = -0.7616*b5 - w*0.0168980;
      lp += ((b0 + b1 + b2 + b3 + b4 + b5 + w*0.5362)*0.11 - lp)*k;
      drum += (lp - drum)*kd;
      d[i] = (lp + drum*1.6)*(0.85 + 0.15*Math.sin(2*Math.PI*i/n*3 + ch));
      if((i & 32767) === 0) yield;
    }
  }
  // einzelner Tropfen: gedämpfte Schwingungen (schnell per Rekursion statt sin()) + kleiner Rausch-Klick, Stereo
  function drop(buf, t0, parts, decay, amp, pan, click){
    const L = buf.getChannelData(0), R = buf.getChannelData(1);
    const gl = Math.sqrt(1 - pan)*amp, gr = Math.sqrt(pan)*amp;
    const len = Math.min(n, Math.ceil(decay*4.5*sr)), start = Math.floor(t0*sr);
    const ef = Math.exp(-1/(decay*sr)), cf = Math.exp(-4/(decay*sr));
    const osc = parts.map(([f, pa])=>{ const w = 2*Math.PI*f/sr; return {c: 2*Math.cos(w), s1: Math.sin(w)*pa, s0: 0}; });
    let env = 1, cenv = click;
    for(let i = 0; i < len; i++){
      let v = 0;
      for(const o of osc){ v += o.s0; const nx = o.c*o.s1 - o.s0; o.s0 = o.s1; o.s1 = nx; }
      v = v*env + (Math.random()*2 - 1)*cenv;
      env *= ef; cenv *= cf;
      const j = (start + i) % n;
      L[j] += v*gl; R[j] += v*gr;
    }
  }
  const rnd = (a0, a1)=> a0 + Math.random()*(a1 - a0);
  for(let i = 0; i < RAIN_LOOP_S*300; i++){            // Prasseln (dicht, gleichmäßig)
    drop(bufs.patter, rnd(0, RAIN_LOOP_S), [[rnd(2200, 7500), 1]], rnd(0.0006, 0.0024), Math.pow(Math.random(), 2.2)*0.35 + 0.03, Math.random(), 0.7);
    if(i % 250 === 0) yield;
  }
  for(let i = 0; i < RAIN_LOOP_S*24; i++){             // Glas-"tick"
    const f = rnd(3200, 5600);
    drop(bufs.patter, rnd(0, RAIN_LOOP_S), [[f, 1], [f*1.51, 0.4]], rnd(0.004, 0.009), rnd(0.06, 0.18), Math.random(), 0.3);
  }
  yield;
  for(let i = 0; i < RAIN_LOOP_S*20; i++){             // Metall-"ping/plonk"
    const f = rnd(650, 2100);
    drop(bufs.metal, rnd(0, RAIN_LOOP_S), [[f, 1], [f*2.32, 0.5], [f*3.86, 0.28], [f*5.4, 0.14]], rnd(0.025, 0.07), rnd(0.05, 0.16), Math.random(), 0.15);
    if(i % 10 === 0) yield;
  }
  for(const key of ['patter', 'metal']){               // auf gleiche Lautheit bringen
    let peak = 0.001;
    for(let ch = 0; ch < 2; ch++){ const d = bufs[key].getChannelData(ch); for(let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(d[i])); }
    for(let ch = 0; ch < 2; ch++){ const d = bufs[key].getChannelData(ch); for(let i = 0; i < n; i++) d[i] *= 0.9/peak; }
    yield;
  }
  out.bufs = bufs;
}
// komplett auf einmal (für Hörproben/Tests)
function rainSynth(a){ const out = {}; for(const _ of rainSynthSteps(a, out)){} return out.bufs; }
let rainBufs = null, rainJob = null;
function rainPrepare(){
  if(rainBufs || rainJob || !audioCtx) return;
  const out = {}, it = rainSynthSteps(audioCtx, out);
  rainJob = true;
  const tick = ()=>{
    const t0 = performance.now();
    while(performance.now() - t0 < 6){ if(it.next().done){ rainBufs = out.bufs; return; } }
    setTimeout(tick, 16);
  };
  setTimeout(tick, 500);
}
function rainStart(){
  try{
    const bufs = rainBufs, nodes = {};
    for(const key of ['bed', 'patter', 'metal']){
      const src = audioCtx.createBufferSource(); src.buffer = bufs[key]; src.loop = true;
      const g = audioCtx.createGain(); g.gain.value = 0;
      src.connect(g); g.connect(audioOut()); src.start(0, Math.random()*RAIN_LOOP_S);
      nodes[key] = g;
    }
    rainSnd = nodes;
  }catch(e){ rainSnd = false; }
}
function weatherAudio(dt){
  if(!audioCtx || audioCtx.state !== 'running' || soundMuted) return;
  const r = weather.rain;
  rainPrepare();                                   // Tropfen-Schleifen im Hintergrund vorberechnen
  const ownRain = typeof fileAudio !== 'undefined' && fileAudio.ok.rain;   // eigene Regen-Aufnahme (23-audio-dateien.js)
  if(rainSnd === null && rainBufs && r > 0.02 && !ownRain) rainStart();
  if(rainSnd){
    const now = audioCtx.currentTime, heavy = Math.max(0, (r - 0.25)/0.75), k = ownRain ? 0 : 1;
    rainSnd.bed.gain.setTargetAtTime(0.10*r*k, now, 0.5);
    rainSnd.patter.gain.setTargetAtTime(0.16*Math.pow(heavy, 1.2)*k, now, 0.5);
    rainSnd.metal.gain.setTargetAtTime(0.10*Math.min(1, r*1.4)*k, now, 0.5);
  }
  if(r > 0.04){
    // leichter Regen: einzelne Tropfen (dicht wird es über die Schleifen)
    rainLightAcc += ownRain ? 0 : dt*14*r*(1 - Math.min(1, r));
    while(rainLightAcc >= 1){
      rainLightAcc -= 1;
      const f = 2800 + Math.random()*2600;
      sTone(f, Math.random()*0.05, 0.03 + Math.random()*0.03, {to: f*0.85, vol: 0.006 + Math.random()*0.006});
    }
    // satter "Plopp" aus der Dachrinne
    rainDripAcc += dt*1.1*r;
    while(rainDripAcc >= 1){
      rainDripAcc -= 1;
      const f = 650 + Math.random()*450, w = Math.random()*0.2;
      sTone(f, w, 0.13, {to: f*0.42, vol: ownRain ? 0.015 : 0.03});
      sNoise(w, 0.06, {filter: 'lowpass', f: 1800, vol: ownRain ? 0.006 : 0.012});
    }
  }
  if(typeof musicUpdate === 'function') musicUpdate();   // Klaviermusik + Wind/Grillen/Bach (22-musik-ambiente.js)
}
