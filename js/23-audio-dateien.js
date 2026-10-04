// 23-audio-dateien.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Eigene Aufnahmen des Nutzers (FL Studio) in assets/audio/ ----------
// musik.mp3  (20 min Akkorde): wird gestreamt (kein Warten auf 24 MB), startet erst nach einer Pause und blendet
//            langsam ein. Stirbt jemand: sanft aus; geht es weiter: nach kurzer Pause von vorne, weich einblenden.
//            Pausenmenü: gedämpft (wie hinter einer Tür). Regenbogen: heller/strahlender. Regen: etwas leiser.
// voegel.mp3 bei Sonne (verstummen im Regen, kommen danach langsam zurück)
// regen.mp3  mit dem Schauer ein-/ausgeblendet (ersetzt den erzeugten Regen; nur die "Plopps" bleiben leise dazu)
// fluss.mp3  immer leise; nach Regen mehr Wasser, lauter wenn der Wasserfall im Hintergrund ins Bild kommt
// Kurze Dateien laufen als nahtlose Schleife (Ende und Anfang weich ineinander geblendet).
// Lädt eine Datei nicht (z. B. Spiel als Datei geöffnet), bleibt der erzeugte Klang aus 19/22 aktiv.
const AUDIO_FILES = {music: 'assets/audio/musik.mp3', birds: 'assets/audio/voegel.mp3',
                     rain: 'assets/audio/regen.mp3', river: 'assets/audio/fluss.mp3'};
const FILE_VOL = {music: 0.38, birds: 0.6, rain: 0.8, river: 2.0};   // Musik vorne, Vögel/Fluss dezent dahinter (Fluss-Aufnahme ist sehr leise)
const MUSIC_START_DELAY = 2.5;   // Sekunden Stille, bevor die Musik einsetzt
const MUSIC_FADE_IN = 7;         // Sekunden Einblenden
const MUSIC_RESTART_DELAY = 1.5; // nach dem Weitermachen (Tod) erst kurz still, dann von vorne
const MUSIC_RESTART_FADE = 5;

const fileAudio = {started: false, ok: {}, el: null, gain: null, shelf: null, muffle: null, loops: {},
                   musicHold: 0, wasDead: false, birdsBack: 1};

// macht aus einer kurzen Aufnahme eine nahtlose Schleife: die letzte Sekunde wird in den Anfang hineingeblendet
function fileLoopBuffer(a, buf, fade){
  const sr = buf.sampleRate, f = Math.min(Math.floor(fade*sr), Math.floor(buf.length/3));
  // Stille am Anfang/Ende (MP3-Polster) abschneiden
  const d0 = buf.getChannelData(0);
  let s = 0, e = buf.length - 1;
  while(s < buf.length/4 && Math.abs(d0[s]) < 0.0008) s++;
  while(e > buf.length*0.75 && Math.abs(d0[e]) < 0.0008) e--;
  const len = (e - s + 1) - f;
  const out = a.createBuffer(buf.numberOfChannels, len, sr);
  for(let ch = 0; ch < buf.numberOfChannels; ch++){
    const src = buf.getChannelData(ch), dst = out.getChannelData(ch);
    for(let i = 0; i < len; i++) dst[i] = src[s + i];
    for(let i = 0; i < f; i++){            // Anfang = Ende ausblenden + Anfang einblenden (gleiche Leistung)
      const k = i/f;
      dst[i] = src[s + i]*Math.sin(k*Math.PI/2) + src[s + len + i]*Math.cos(k*Math.PI/2);
    }
  }
  return out;
}
function fileAudioStart(){
  if(fileAudio.started || !audioCtx || audioCtx.state !== 'running') return;
  fileAudio.started = true;
  const a = audioCtx;
  // Musik: gestreamt über ein <audio>-Element, durch Klangfilter und Lautstärke geleitet
  try{
    const el = new Audio(); el.src = AUDIO_FILES.music; el.loop = true; el.preload = 'auto';
    const node = a.createMediaElementSource(el);
    fileAudio.shelf = a.createBiquadFilter(); fileAudio.shelf.type = 'highshelf'; fileAudio.shelf.frequency.value = 3500; fileAudio.shelf.gain.value = 0;
    fileAudio.muffle = a.createBiquadFilter(); fileAudio.muffle.type = 'lowpass'; fileAudio.muffle.frequency.value = 20000; fileAudio.muffle.Q.value = 0.5;
    fileAudio.gain = a.createGain(); fileAudio.gain.gain.value = 0;
    node.connect(fileAudio.shelf); fileAudio.shelf.connect(fileAudio.muffle); fileAudio.muffle.connect(fileAudio.gain); fileAudio.gain.connect(audioOut());
    fileAudio.el = el;
    el.addEventListener('playing', ()=>{ fileAudio.ok.music = true; fileAudio.blocked = false; });
    el.addEventListener('error', ()=>{ fileAudio.ok.music = false; fileAudio.err = true; });
    setTimeout(()=> fileMusicRestart(MUSIC_FADE_IN, 0), MUSIC_START_DELAY*1000);
  }catch(e){}
  // kurze Schleifen: laden, dekodieren, nahtlos machen
  for(const key of ['birds', 'rain', 'river']){
    fetch(AUDIO_FILES[key]).then(r => { if(!r.ok) throw 0; return r.arrayBuffer(); })
      .then(ab => a.decodeAudioData(ab))
      .then(buf => {
        const src = a.createBufferSource(); src.buffer = fileLoopBuffer(a, buf, 1.0); src.loop = true;
        const g = a.createGain(); g.gain.value = 0;
        src.connect(g); g.connect(audioOut()); src.start(0, Math.random()*src.buffer.duration*0.5);
        fileAudio.loops[key] = g; fileAudio.ok[key] = true;
      }).catch(()=>{ fileAudio.ok[key] = false; });
  }
}
// Abspielen; blockiert der Browser das (Autoplay-Regeln), klappt es beim nächsten Tastendruck/Klick
function fileMusicPlay(){
  const el = fileAudio.el; if(!el) return;
  const p = el.play();
  if(p && p.catch) p.catch(()=>{ fileAudio.blocked = true; });
}
function fileMusicUnblock(){ if(fileAudio.el && fileAudio.blocked && fileAudio.el.paused) fileMusicPlay(); }
window.addEventListener('keydown', fileMusicUnblock);
window.addEventListener('pointerdown', fileMusicUnblock);
// Zustand für die Leistungsanzeige (Taste F)
function audioStatusText(){
  if(soundMuted) return 'Ton: aus (M)';
  if(!audioCtx || audioCtx.state !== 'running') return 'Ton: wartet auf ersten Tastendruck';
  const el = fileAudio.el;
  if(!el) return 'Musik: startet gleich';
  if(fileAudio.err) return 'Musik: Datei lädt nicht';
  if(fileAudio.blocked) return 'Musik: vom Browser blockiert – Taste drücken';
  if(el.paused) return 'Musik: Pause';
  const t = Math.floor(el.currentTime), vol = fileAudio.gain ? fileAudio.gain.gain.value : 0;
  return 'Musik: spielt ' + Math.floor(t/60) + ':' + String(t%60).padStart(2, '0') + '  Lautst. ' + Math.round(vol*100) + '%' +
         (el.readyState < 3 ? ' (lädt…)' : '');
}
// Musik von vorne, nach "delay" Sekunden Stille über "fade" Sekunden weich einblenden
function fileMusicRestart(fade, delay){
  const el = fileAudio.el, g = fileAudio.gain; if(!el || !g) return;
  const now = audioCtx.currentTime;
  g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(g.gain.value, now);
  g.gain.linearRampToValueAtTime(0, now + 0.05);
  setTimeout(()=>{
    if(deathState) return;               // inzwischen gestorben -> Neustart kommt nach dem Weitermachen
    try{ el.currentTime = 0; fileMusicPlay(); }catch(e){}
    const t = audioCtx.currentTime;
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(fileMusicTarget(), t + fade);
    fileAudio.musicHold = t + fade;      // bis dahin regelt fileAudioUpdate die Lautstärke nicht nach
  }, (delay || 0)*1000);
  fileAudio.musicHold = now + 9999;
}
function fileMusicTarget(){ return FILE_VOL.music*VOL.music*(1 - 0.3*weather.rain); }

// jedes Bild (aus musicUpdate) – nur Lautstärken/Filter, nichts am Spiel
function fileAudioUpdate(){
  fileAudioStart();
  if(!fileAudio.started) return;
  const now = audioCtx.currentTime, r = weather.rain, sun = 1 - r;
  // Tod: Musik sanft aus; danach (weiter geht's) von vorne einblenden
  const dead = !!deathState;
  if(dead && !fileAudio.wasDead && fileAudio.gain){
    fileAudio.gain.gain.cancelScheduledValues(now);
    fileAudio.gain.gain.setTargetAtTime(0, now, 0.4);
    fileAudio.musicHold = now + 9999;
  }
  if(!dead && fileAudio.wasDead) fileMusicRestart(MUSIC_RESTART_FADE, MUSIC_RESTART_DELAY);
  fileAudio.wasDead = dead;
  if(fileAudio.gain && now > fileAudio.musicHold) fileAudio.gain.gain.setTargetAtTime(fileMusicTarget(), now, 1.5);
  // Pausenmenü: gedämpft wie hinter einer Tür; Regenbogen: heller
  if(fileAudio.muffle){
    const paused = typeof menuScreen !== 'undefined' && menuScreen === 'pause';
    fileAudio.muffle.frequency.setTargetAtTime(paused ? 700 : 20000, now, 0.25);
    fileAudio.shelf.gain.setTargetAtTime(weather.rainbow > 0 ? 6 : 0, now, 2);
  }
  // Vögel: verstummen im Regen, kommen danach langsam zurück
  fileAudio.birdsBack = r > 0.3 ? 0 : Math.min(1, fileAudio.birdsBack + 0.0015);
  const L = fileAudio.loops;
  if(L.birds) L.birds.gain.setTargetAtTime(FILE_VOL.birds*VOL.sfx*sun*sun*fileAudio.birdsBack, now, 1.2);
  if(L.rain) L.rain.gain.setTargetAtTime(FILE_VOL.rain*VOL.sfx*r, now, 0.8);
  if(L.river){
    // Wasserfall im Bild? (Hintergrund-Ebene mit Wasserfall, gleiche Rechnung wie beim Zeichnen)
    let near = 0;
    if(BG_WATERFALLS.length){
      const wf = BG_WATERFALLS[0], off = ((camX*wf.layer.par) % BG_TW + BG_TW) % BG_TW;
      for(const base of [0, BG_TW]){ const x = wf.x - off + base; near = Math.max(near, 1 - Math.min(1, Math.abs(x - VW/2)/(VW*0.7))); }
    }
    const afterRain = weather.phase === 'clear' || (weather.phase === 'sun' && weather.t < 30) ? 0.3 : 0;
    L.river.gain.setTargetAtTime(FILE_VOL.river*VOL.sfx*(0.45 + 0.35*near + 0.3*r + afterRain), now, 1.5);
  }
}
