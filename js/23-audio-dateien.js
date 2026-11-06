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
// draussen.mp3 (Nutzer 06.11., „outside_room“): DER allgemeine Hintergrund-Ton – ersetzt Vögel und Fluss (beide nicht mehr
//            geladen, Dateien bleiben liegen) und den erzeugten Wind/Grillen/Bach; läuft gleichmäßig als Schleife.
// Kurze Dateien laufen als nahtlose Schleife (Ende und Anfang weich ineinander geblendet).
// Lädt eine Datei nicht (z. B. Spiel als Datei geöffnet), bleibt der erzeugte Klang aus 19/22 aktiv.
const AUDIO_FILES = {music: 'assets/audio/musik.mp3', birds: 'assets/audio/voegel.mp3',
                     rain: 'assets/audio/regen.mp3', river: 'assets/audio/fluss.mp3', atmo: 'assets/audio/wald.wav'};
// atmo: seit 06.11. wald.wav (Nutzer-Datei Splice „Forest_05“, 21 s, auf 16 Bit verkleinert) statt draussen.mp3 – gemessen
// gleich laut (RMS 0,003), daher gleiche Lautstärke; draussen.mp3 bleibt liegen.
const FILE_VOL = {music: 0.38, birds: 0.6, rain: 0.8, river: 2.0, atmo: 2.6};   // Hintergrund 0,7 -> 1,6 -> 2,6 (zweimal „lauter“, 06.11.)
const ATMO_STATT_VOEGEL_FLUSS = true;   // false = alter Hintergrund (Vögel + Fluss) statt draussen.mp3
const MUSIK_AUS = true;   // Nutzer 06.11.: „die Akkorde können raus“ – weder musik.mp3 noch das erzeugte Klavier (22)
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
  geraeuscheLaden();   // Knarzen/Kurbel (unten)
  // Musik: gestreamt über ein <audio>-Element, durch Klangfilter und Lautstärke geleitet
  if(!MUSIK_AUS) try{
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
  for(const key of ATMO_STATT_VOEGEL_FLUSS ? ['atmo', 'rain'] : ['birds', 'rain', 'river']){
    fetch(AUDIO_FILES[key]).then(r => { if(!r.ok) throw 0; return r.arrayBuffer(); })
      .then(ab => a.decodeAudioData(ab))
      .then(buf => {
        const src = a.createBufferSource(); src.buffer = fileLoopBuffer(a, buf, key === 'atmo' ? 2.5 : 1.0); src.loop = true;
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
  if(MUSIK_AUS) return 'Musik: aus (nur Hintergrund-Ton)';
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

// ---------- Geräusch-Aufnahmen (Nutzer 06.11.: Knarzen für Pump-Draisine/Floß, Kurbel-Reiben fürs Floß-Rad) ----------
// assets/audio/knarzen.wav (Schaukelstuhl, 12,8 s, 16 einzelne Knarzer) und kurbel.wav (Holz/Metall-Reiben, 2,7 s), vorher
// auf 16 Bit Mono 22 kHz verkleinert. Gespielt wird je Aufruf EIN Laut (Ausschnitt mit kurzem Ein-/Ausblenden): „hin“ =
// die kräftigen Knarzer, „her“ = die leiseren (Hebel hin und her), sonst zufällig. Lautstärke GERAEUSCH_VOL × Ton-Regler,
// links/rechts nach Ort. Lädt eine Datei nicht, bleibt der erzeugte Klang aus 18-sound.js.
const GERAEUSCH_DATEIEN = {knarzen: 'assets/audio/knarzen.wav', kurbel: 'assets/audio/kurbel.wav'};
// kurbel.wav = das QUIETSCHEN (Nutzer-Datei „quietschen.wav“, Schuhspanner Holz/Metall). Nutzer 06.11.: „nicht das Knarzen
// lauter, sondern das Quietschen“ -> Knarzen wieder 0,34; Quietschen 0,3 -> 0,8 und jetzt auch an der Pump-Draisine
// (je Druck: „hin“ = großes Quietschen, „her“ = die kleineren, ×1,6–2 angehoben). Danach „Quietschen zu laut“ -> 0,4,
// und die Draisine knarzt wieder dazu.
const GERAEUSCH_VOL = {knarzen: 0.34, kurbel: 0.4};
const GERAEUSCH_STUECKE = {   // Ausschnitte [ab s, Dauer s, Lautstärke-Faktor] (gemessen an der Hüllkurve)
  knarzen: {hin: [[1.03, .46], [2.64, .52], [4.38, .47], [6.11, .45], [7.82, .5], [9.51, .46], [11.19, .51]],
            her: [[0.1, .37], [3.42, .37], [6.8, .34], [8.51, .32], [10.22, .32]]},
  kurbel: {zug: [[0.16, .45]], klein: [[1.93, .21, 1.6]],
           hin: [[0.14, .4]], her: [[1.92, .17, 1.6], [1.24, .24, 2]]},
};
const geraeusche = {buf: {}, laedt: false};
function geraeuscheLaden(){
  if(geraeusche.laedt || !audioCtx) return;
  geraeusche.laedt = true;
  for(const [name, pfad] of Object.entries(GERAEUSCH_DATEIEN))
    fetch(pfad).then(r => { if(!r.ok) throw 0; return r.arrayBuffer(); }).then(ab => audioCtx.decodeAudioData(ab))
      .then(buf => { geraeusche.buf[name] = buf; }).catch(() => {});
}
// spielt einen Laut; o = {x (Weltposition), stueck ('hin'/'her'/'zug'/…), vol, rate}; true = gespielt
function geraeuschSpielen(name, o){
  o = o || {};
  const a = typeof sfxCtx === 'function' ? sfxCtx() : null;
  if(a) geraeuscheLaden();
  const buf = geraeusche.buf[name];
  if(!a || soundMuted || !buf) return false;
  try{
    const S = GERAEUSCH_STUECKE[name] || {}, gruppen = Object.values(S);
    const liste = (o.stueck && S[o.stueck]) || gruppen[Math.floor(Math.random()*gruppen.length)] || [[0, buf.duration]];
    const [ab, dauer, faktor] = liste[Math.floor(Math.random()*liste.length)];
    const src = a.createBufferSource(); src.buffer = buf; src.playbackRate.value = (o.rate || 1)*(1 + (Math.random() - 0.5)*0.08);
    const g = a.createGain(), t = a.currentTime, vol = (GERAEUSCH_VOL[name] || 0.3)*(faktor || 1)*(o.vol || 1)*VOL.sfx;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.setValueAtTime(vol, t + Math.max(0.02, dauer - 0.06)); g.gain.linearRampToValueAtTime(0.0001, t + dauer);
    src.connect(g);
    let aus = g;
    if(a.createStereoPanner){ const p = a.createStereoPanner(); p.pan.value = typeof sfxPan === 'function' ? sfxPan(o.x) : 0; g.connect(p); aus = p; }
    aus.connect(audioOut());
    src.start(t, ab, dauer + 0.02);
    if(typeof sfxLog === 'function') sfxLog(name);
    return true;
  }catch(e){ return false; }
}
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
  // Ausbau 7: Welt + Tageszeit regeln Vögel/Fluss mit (THEME.ambiente, 10a-themen.js) – z. B. nachts keine Vögel
  const amb = (typeof THEME !== 'undefined' && THEME && THEME.ambiente) || {voegel: 1, fluss: 1};
  if(L.birds) L.birds.gain.setTargetAtTime(FILE_VOL.birds*VOL.sfx*sun*sun*fileAudio.birdsBack*amb.voegel, now, 1.2);
  if(L.atmo) L.atmo.gain.setTargetAtTime(FILE_VOL.atmo*VOL.sfx, now, 1.5);
  if(L.rain) L.rain.gain.setTargetAtTime(FILE_VOL.rain*VOL.sfx*r, now, 0.8);
  if(L.river){
    // Wasserfall im Bild? (Hintergrund-Ebene mit Wasserfall, gleiche Rechnung wie beim Zeichnen)
    let near = 0;
    if(BG_WATERFALLS.length){
      const wf = BG_WATERFALLS[0], off = ((camX*wf.layer.par) % BG_TW + BG_TW) % BG_TW;
      for(const base of [0, BG_TW]){ const x = wf.x - off + base; near = Math.max(near, 1 - Math.min(1, Math.abs(x - VW/2)/(VW*0.7))); }
    }
    const afterRain = weather.phase === 'clear' || (weather.phase === 'sun' && weather.t < 30) ? 0.3 : 0;
    L.river.gain.setTargetAtTime(FILE_VOL.river*VOL.sfx*(0.45 + 0.35*near + 0.3*r + afterRain)*amb.fluss, now, 1.5);
  }
}
