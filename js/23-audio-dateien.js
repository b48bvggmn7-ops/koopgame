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
// musik-nebel.mp3 (Nutzer 06.11., „Warm Analog Fog“, 3:40): Hintergrund-Musik „halbleise“ statt musik.mp3 (bleibt liegen).
//            Läuft als unhörbare Schleife: einmal von vorne (mit dem sanften Anfang), dann immer 0:48 … 2:43,96 – an diesen
//            Stellen wiederholt sich das Stück fast gleich (gemessen: Tonart-Ähnlichkeit 0,93, gleiche Lautstärke); die letzten
//            4 s vor dem Sprung werden schon in den Klang von kurz vor 0:48 übergeblendet, so gibt es keinen Ruck.
const AUDIO_FILES = {music: 'assets/audio/musik-nebel.mp3', birds: 'assets/audio/voegel.mp3',
                     rain: 'assets/audio/regen.mp3', river: 'assets/audio/fluss.mp3', atmo: 'assets/audio/hintergrund.mp3'};
// atmo seit Nutzerwunsch (06.11., Datei „untitled.mp3“, 3:30, gleichmäßig laut) hintergrund.mp3 statt wald.wav (bleibt liegen);
// nahtlose Schleife wie bisher (2,5 s überblendet). Die Datei ist rund 36× lauter abgemischt (RMS 0,108 statt 0,003) – damit
// sie so laut ist wie der Wald-Ton, FILE_VOL.atmo 2,6 -> 0,075. Eigener Regler „Hintergrund“ (VOL.atmo) unter Optionen.
// atmo: seit 06.11. wald.wav (Nutzer-Datei Splice „Forest_05“, 21 s, auf 16 Bit verkleinert) statt draussen.mp3 – gemessen
// gleich laut (RMS 0,003), daher gleiche Lautstärke; draussen.mp3 bleibt liegen.
// music 0,38 -> 0,15: die neue Musik ist kräftig abgemischt, „halbleise“ (Nutzer 06.11.); dann „3 % leiser“ -> 0,1455
const FILE_VOL = {music: 0.1455, birds: 0.6, rain: 0.8, river: 2.0, atmo: 0.075};   // Hintergrund 0,7 -> 1,6 -> 2,6 (zweimal „lauter“, 06.11.)
const ATMO_STATT_VOEGEL_FLUSS = true;   // false = alter Hintergrund (Vögel + Fluss) statt draussen.mp3
const MUSIK_AUS = false;  // Nutzer 06.11.: erst „die Akkorde können raus“, dann „Warm Analog Fog“ als Musik; das erzeugte Klavier (22) bleibt aus
const KLAVIER_AUS = true;   // das erzeugte Klavier (22) spielt nie mehr, auch nicht als Ersatz
const MUSIK_SCHLEIFE ={ab: 48.0, bis: 163.958, blende: 4};   // Sekunden: Schleifen-Anfang, -Ende, Überblenden davor
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
  // Musik: ganz geladen und dekodiert (nahtlose Schleife, siehe musikSchleifeBauen), durch Klangfilter und Lautstärke geleitet
  if(!MUSIK_AUS) try{
    fileAudio.shelf = a.createBiquadFilter(); fileAudio.shelf.type = 'highshelf'; fileAudio.shelf.frequency.value = 3500; fileAudio.shelf.gain.value = 0;
    fileAudio.muffle = a.createBiquadFilter(); fileAudio.muffle.type = 'lowpass'; fileAudio.muffle.frequency.value = 20000; fileAudio.muffle.Q.value = 0.5;
    fileAudio.gain = a.createGain(); fileAudio.gain.gain.value = 0;
    fileAudio.shelf.connect(fileAudio.muffle); fileAudio.muffle.connect(fileAudio.gain); fileAudio.gain.connect(audioOut());
    const bereit = Date.now() + MUSIC_START_DELAY*1000;
    fetch(AUDIO_FILES.music).then(r => { if(!r.ok) throw 0; return r.arrayBuffer(); })
      .then(ab => a.decodeAudioData(ab))
      .then(buf => {
        fileAudio.musikBuf = musikSchleifeBauen(a, buf);
        setTimeout(()=> fileMusicRestart(MUSIC_FADE_IN, 0), Math.max(0, bereit - Date.now()));
      }).catch(()=>{ fileAudio.ok.music = false; fileAudio.err = true; });
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
// Schleife ohne hörbare Naht: die letzten „blende“ Sekunden vor dem Schleifen-Ende werden in den Klang von kurz vor dem
// Schleifen-Anfang übergeblendet (gleiche Leistung). Springt das Abspielen dann von „bis“ nach „ab“, geht es genau dort weiter.
function musikSchleifeBauen(a, buf){
  const sr = buf.sampleRate, S = MUSIK_SCHLEIFE;
  const ab = Math.round(S.ab*sr), bis = Math.min(buf.length, Math.round(S.bis*sr)), f = Math.min(Math.round(S.blende*sr), ab);
  if(bis - ab < 2*f) return {buf, ab: 0, bis: buf.duration};
  const out = a.createBuffer(buf.numberOfChannels, bis, sr);
  for(let ch = 0; ch < buf.numberOfChannels; ch++){
    const src = buf.getChannelData(ch), dst = out.getChannelData(ch);
    dst.set(src.subarray(0, bis));
    for(let i = 0; i < f; i++){
      const k = (i/f)*Math.PI/2;
      dst[bis - f + i] = src[bis - f + i]*Math.cos(k) + src[ab - f + i]*Math.sin(k);
    }
  }
  return {buf: out, ab: ab/sr, bis: bis/sr};
}
// Zustand für die Leistungsanzeige (Taste F)
function audioStatusText(){
  if(soundMuted) return 'Ton: aus (M)';
  if(!audioCtx || audioCtx.state !== 'running') return 'Ton: wartet auf ersten Tastendruck';
  if(MUSIK_AUS) return 'Musik: aus (nur Hintergrund-Ton)';
  if(fileAudio.err) return 'Musik: Datei lädt nicht';
  const m = fileAudio.musikBuf, q = fileAudio.musikQuelle;
  if(!m) return 'Musik: lädt…';
  if(!q) return 'Musik: startet gleich';
  const t = Math.floor(musikPosition()), vol = fileAudio.gain ? fileAudio.gain.gain.value : 0;
  return 'Musik: spielt ' + Math.floor(t/60) + ':' + String(t%60).padStart(2, '0') + '  Lautst. ' + Math.round(vol*100) + '%';
}
// Stelle im Stück (Sekunden), Schleife eingerechnet
function musikPosition(){
  const m = fileAudio.musikBuf; if(!m || !fileAudio.musikQuelle) return 0;
  const t = audioCtx.currentTime - fileAudio.musikStart;
  return t < m.bis ? t : m.ab + (t - m.bis) % (m.bis - m.ab);
}
// Musik von vorne, nach "delay" Sekunden Stille über "fade" Sekunden weich einblenden
function fileMusicRestart(fade, delay){
  const g = fileAudio.gain; if(!fileAudio.musikBuf || !g) return;
  const now = audioCtx.currentTime;
  g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(g.gain.value, now);
  g.gain.linearRampToValueAtTime(0, now + 0.05);
  setTimeout(()=>{
    if(deathState) return;               // inzwischen gestorben -> Neustart kommt nach dem Weitermachen
    try{
      if(fileAudio.musikQuelle){ fileAudio.musikQuelle.stop(); fileAudio.musikQuelle.disconnect(); }
      const m = fileAudio.musikBuf, q = audioCtx.createBufferSource();
      q.buffer = m.buf; q.loop = true; q.loopStart = m.ab; q.loopEnd = m.bis;
      q.connect(fileAudio.shelf); q.start();
      fileAudio.musikQuelle = q; fileAudio.musikStart = audioCtx.currentTime; fileAudio.ok.music = true;
    }catch(e){}
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
const GERAEUSCH_DATEIEN = {knarzen: 'assets/audio/knarzen.wav', kurbel: 'assets/audio/kurbel.wav',
                           landen: 'assets/audio/landen.wav', schritt: 'assets/audio/schritte.wav',
                           schalter: 'assets/audio/schalter.wav', tuer: 'assets/audio/tuer.wav'};
// Nutzer 06.11. (Splice, auf 16 Bit Mono verkleinert): schalter.wav („RKU_DST Low Crunch“, 0,37 s) = Hebel umlegen und
// Bodenplatte drücken; tuer.wav = Tür auf/zu – erst „Creepy Game Door Mechanism Unlock Gears“, seit
// Nutzerwunsch („nimm das für die Tür“) „Steampunk Game Contraption Mech Interlock Gears Transform Wood 03“ (Holz-Zahnräder, 3,4 s);
// (Liane-Knarzen liane.wav kurz drin, auf Nutzerwunsch „Liane sound raus“ wieder entfernt.) Das Quietschen (kurbel.wav) kommt außerdem, solange sich ein Windrad dreht.
// Nutzer 06.11.: landen.wav (Splice „RockTumble1“, 0,9 s) = Landen nach einem Sprung; schritte.wav (Splice „Footstep Grass
// Walk 1“, 11 s gemütliches Gehen, ~0,58 s je Schritt) – daraus wird je Schritt im Spiel EIN Gras-Tritt gespielt, so passt es
// immer zum Lauftempo (Schritt-Takt kommt aus sfxObserve in 18, alle 46 px). Beide auf 16 Bit Mono 48 kHz verkleinert.
// kurbel.wav = das QUIETSCHEN (Nutzer-Datei „quietschen.wav“, Schuhspanner Holz/Metall). Nutzer 06.11.: „nicht das Knarzen
// lauter, sondern das Quietschen“ -> Knarzen wieder 0,34; Quietschen 0,3 -> 0,8 und jetzt auch an der Pump-Draisine
// (je Druck: „hin“ = großes Quietschen, „her“ = die kleineren, ×1,6–2 angehoben). Danach „Quietschen zu laut“ -> 0,4,
// und die Draisine knarzt wieder dazu.
const GERAEUSCH_VOL = {knarzen: 0.34, kurbel: 0.4, landen: 0.26, schritt: 1.0, schalter: 0.55, tuer: 0.32};
const GERAEUSCH_STUECKE = {   // Ausschnitte [ab s, Dauer s, Lautstärke-Faktor] (gemessen an der Hüllkurve)
  knarzen: {hin: [[1.03, .46], [2.64, .52], [4.38, .47], [6.11, .45], [7.82, .5], [9.51, .46], [11.19, .51]],
            her: [[0.1, .37], [3.42, .37], [6.8, .34], [8.51, .32], [10.22, .32]]},
  kurbel: {zug: [[0.16, .45]], klein: [[1.93, .21, 1.6]],
           hin: [[0.14, .4]], her: [[1.92, .17, 1.6], [1.24, .24, 2]]},
  landen: {ganz: [[0, .75]]},
  schalter: {ganz: [[0, .37]]},
  tuer: {ganz: [[0.05, 2.7]]},
  // je Gras-Tritt [Anfang, Dauer, Ausgleich] – Ausgleich = alle Tritte etwa gleich laut (gemessen an der Hüllkurve)
  schritt: {tritt: [[0.80, .2, 1.6], [1.47, .2, 1.6], [2.10, .2, 1], [2.62, .2, 1.9], [3.21, .2, 1.9], [3.77, .2, 1.5],
                    [4.35, .2, 1.2], [4.85, .2, 1.3], [5.38, .2, .85], [5.90, .2, 2], [6.53, .2, 1], [7.09, .2, 1],
                    [7.62, .2, .8], [8.19, .2, .45], [8.75, .2, .9], [9.37, .2, 1.1], [9.99, .2, .9]]},
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
    const src = a.createBufferSource(); src.buffer = buf; src.playbackRate.value = (o.rate || 1)*(o.festesTempo ? 1 : 1 + (Math.random() - 0.5)*0.08);
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
  if(L.birds) L.birds.gain.setTargetAtTime(FILE_VOL.birds*VOL.atmo*sun*sun*fileAudio.birdsBack*amb.voegel, now, 1.2);
  if(L.atmo) L.atmo.gain.setTargetAtTime(FILE_VOL.atmo*VOL.atmo, now, 1.5);
  if(L.rain) L.rain.gain.setTargetAtTime(FILE_VOL.rain*VOL.atmo*r, now, 0.8);
  if(L.river){
    // Wasserfall im Bild? (Hintergrund-Ebene mit Wasserfall, gleiche Rechnung wie beim Zeichnen)
    let near = 0;
    if(BG_WATERFALLS.length){
      const wf = BG_WATERFALLS[0], off = ((camX*wf.layer.par) % BG_TW + BG_TW) % BG_TW;
      for(const base of [0, BG_TW]){ const x = wf.x - off + base; near = Math.max(near, 1 - Math.min(1, Math.abs(x - VW/2)/(VW*0.7))); }
    }
    const afterRain = weather.phase === 'clear' || (weather.phase === 'sun' && weather.t < 30) ? 0.3 : 0;
    L.river.gain.setTargetAtTime(FILE_VOL.river*VOL.atmo*(0.45 + 0.35*near + 0.3*r + afterRain)*amb.fluss, now, 1.5);
  }
}
