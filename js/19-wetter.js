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
let rainNodes = null, rainDropAcc = 0;
function weatherAudio(dt){
  if(!audioCtx || audioCtx.state !== 'running' || soundMuted) { if(rainNodes) rainNodes.g.gain.value = 0; return; }
  const r = weather.rain;
  if(!rainNodes && r > 0.02){
    try{
      const src = audioCtx.createBufferSource(); src.buffer = sfxNoise(); src.loop = true;
      const hp = audioCtx.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 2400; hp.Q.value = 0.5;
      const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6000;
      const g = audioCtx.createGain(); g.gain.value = 0;
      src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(audioOut()); src.start();
      rainNodes = {src, g};
    }catch(e){}
  }
  if(rainNodes){
    const target = 0.035*r*r;
    rainNodes.g.gain.setTargetAtTime(target, audioCtx.currentTime, 0.4);
  }
  if(r > 0.15){
    rainDropAcc += dt*r*26;                         // Tropfen pro Sekunde
    while(rainDropAcc >= 1){
      rainDropAcc -= 1;
      const when = Math.random()*0.05, glass = Math.random() < 0.75;
      if(glass){                                    // helles "tick" auf der Scheibe
        const f = 2600 + Math.random()*2600;
        sTone(f, when, 0.035 + Math.random()*0.03, {to: f*0.82, vol: 0.006 + Math.random()*0.008});
      } else {                                      // dicker Tropfen: "plink"
        const f = 900 + Math.random()*700;
        sTone(f, when, 0.09, {to: f*0.6, vol: 0.012});
      }
    }
  } else if(weather.phase === 'sun' && weather.rain < 0.05){
    weather.nextChirp -= dt;
    if(weather.nextChirp <= 0){
      weather.nextChirp = 5 + Math.random()*9;
      const base = 2200 + Math.random()*1400, n = 2 + Math.floor(Math.random()*4);
      for(let i = 0; i < n; i++) sTone(base*(1 + (i%2)*0.12), i*0.11, 0.07, {to: base*(1.15 + (i%2)*0.1), vol: 0.008});
    }
  }
}
