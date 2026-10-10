// 22-musik-ambiente.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Hintergrundmusik (ruhiges Klavier) + Sonnen-Ambiente (Wind, Grillen, Bach) ----------
// Alles im Browser erzeugt, keine Aufnahmen. Einmal im Hintergrund (kleine Häppchen) vorberechnet:
//  - Klavier-Töne (3 Grundtöne, aus Obertönen mit leichter Saiten-Unschärfe, Hammer-Anschlag, zwei leicht
//    verstimmte Saiten = warmes Schweben); andere Tonhöhen über Abspielgeschwindigkeit
//  - Wind in den Blättern, Grillen, plätschernder Bach als nahtlose Stereo-Schleifen
// Die Musik wird live komponiert: warme Akkordfolgen in F-Dur (langsam, ~64 Schläge/min), gebrochene Akkorde
// links, einfache Melodie-Motive rechts (wiederholt + leicht verändert). Beim Regenbogen dieselbe Musik heller
// (Melodie eine Oktave höher + funkelnde Doppelung). Bei Regen etwas leiser. Ton aus mit M gilt auch hier.
const MUSIC_VOL = 0.55;          // Gesamtlautstärke Musik
const MUSIC_BPM = 64;
const AMB_VOL = {wind: 0.11, crickets: 0.05, brook: 0.08};

let mus = {ready: false, job: false, piano: null, amb: null, rev: null, bus: null, ambNodes: null,
           nextT: 0, bar: 0, prog: 0, motif: null, log: []};

function* musicBuild(a, out){
  const SR = a.sampleRate, R = Math.random;
  // --- Klavier-Ton ---
  function* pianoNote(midi, store){
    const f0 = 440*Math.pow(2, (midi - 69)/12), dur = 3.8, n = Math.ceil(dur*SR);
    const buf = a.createBuffer(2, n, SR), L = buf.getChannelData(0), Rr = buf.getChannelData(1);
    const B = 0.00035, slow = 3.2*Math.pow(261.6/f0, 0.35);
    for(let k = 1; k <= 10; k++){
      const fk = k*f0*Math.sqrt(1 + B*k*k); if(fk > SR/2.3) break;
      const amp = Math.pow(1/k, 1.25)*(k === 1 ? 1 : 0.8)*Math.exp(-k*0.12);
      const dSlow = slow/(1 + 0.32*(k - 1)), dFast = 0.22/(1 + 0.2*(k - 1));
      for(const [det, pan] of [[-0.0004, -0.25], [0.0004, 0.25]]){
        const w = 2*Math.PI*fk*(1 + det)/SR, c = 2*Math.cos(w);
        let s0 = 0, s1 = Math.sin(w), eF = 1, eS = 1;
        const fF = Math.exp(-1/(dFast*SR)), fS = Math.exp(-1/(dSlow*SR));
        const gl = Math.cos((pan + 1)*Math.PI/4)*amp*0.5, gr = Math.sin((pan + 1)*Math.PI/4)*amp*0.5;
        for(let i = 0; i < n; i++){
          const env = 0.55*eF + 0.45*eS, v = s0*env;
          L[i] += v*gl; Rr[i] += v*gr;
          const nx = c*s1 - s0; s0 = s1; s1 = nx; eF *= fF; eS *= fS;
        }
        yield;   // nach jeder Saite eine Pause -> kein Ruckeln
      }
    }
    // Hammer-Anschlag (weich) + sanftes Einschwingen
    let y = 0; const hl = Math.ceil(0.012*SR);
    for(let i = 0; i < hl; i++){ y += (R()*2 - 1 - y)*0.25; const e = (1 - i/hl)*0.05; L[i] += y*e; Rr[i] += y*e; }
    const at = Math.ceil(0.004*SR);
    for(let i = 0; i < at; i++){ L[i] *= i/at; Rr[i] *= i/at; }
    let peak = 0.001; for(let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(Rr[i]));
    yield;
    for(let i = 0; i < n; i++){ L[i] *= 0.9/peak; Rr[i] *= 0.9/peak; }
    store[midi] = buf;
  }
  out.piano = {};
  for(const m of [48, 60, 72, 84]){ yield* pianoNote(m, out.piano); yield; }
  // --- Raumhall für die Musik (weich, ~2,8 s) ---
  const irLen = Math.ceil(2.8*SR), ir = a.createBuffer(2, irLen, SR);
  for(let ch = 0; ch < 2; ch++){ const d = ir.getChannelData(ch); let y = 0;
    for(let i = 0; i < irLen; i++){ y += (R()*2 - 1 - y)*0.18; d[i] = y*Math.exp(-i/irLen*5)*0.6; }
    yield; }
  out.ir = ir; yield;
  // --- Ambiente-Schleifen ---
  const loop = (sec)=>{ const n = Math.ceil(sec*SR); return {n, buf: a.createBuffer(2, n, SR)}; };
  // Wind in den Blättern: rosa Rauschen, Tiefpass, langsame Böen (ganze Perioden -> nahtlos), Blätter-Rascheln in Böen
  {
    const {n, buf} = loop(12);
    for(let ch = 0; ch < 2; ch++){
      const d = buf.getChannelData(ch); let b0 = 0, b1 = 0, b2 = 0, lp = 0, lp2 = 0;
      for(let i = 0; i < n; i++){
        const w = R()*2 - 1; b0 = 0.997*b0 + w*0.03; b1 = 0.985*b1 + w*0.06; b2 = 0.95*b2 + w*0.12;
        const x = (b0 + b1 + b2 + w*0.2);
        const gust = 0.45 + 0.3*Math.sin(2*Math.PI*i/n*2 + ch*0.7) + 0.25*Math.sin(2*Math.PI*i/n*5 + 1.3 + ch);
        const k = 1 - Math.exp(-2*Math.PI*(350 + 900*gust)/SR);
        lp += (x - lp)*k; lp2 += (lp - lp2)*k;
        let v = lp2*gust;
        if(R() < 0.004*gust*gust) v += (R()*2 - 1)*0.25*gust;   // Blätter-Knistern
        d[i] = v;
        if((i & 16383) === 0) yield;
      }
    }
    out.wind = buf;
  }
  // Grillen: kurze Zirp-Pulse (~4,4 kHz) in Gruppen, 3 Grillen an verschiedenen Orten
  {
    const {n, buf} = loop(8), L = buf.getChannelData(0), Rr = buf.getChannelData(1);
    for(let c = 0; c < 3; c++){
      const f = 4100 + c*260 + R()*120, pan = [-0.7, 0.1, 0.75][c], gl = Math.cos((pan + 1)*Math.PI/4), gr = Math.sin((pan + 1)*Math.PI/4);
      const period = 0.75 + R()*0.5; let t = R()*period;
      while(t < 8){
        for(let p = 0; p < 4; p++){
          const st = Math.floor((t + p*0.032)*SR), len = Math.ceil(0.018*SR), w = 2*Math.PI*f/SR;
          for(let i = 0; i < len; i++){ const e = Math.sin(Math.PI*i/len)*0.3; const v = Math.sin(w*i)*e; const j = (st + i) % n; L[j] += v*gl; Rr[j] += v*gr; }
        }
        t += period*(0.85 + R()*0.3) + (R() < 0.15 ? 1.2 : 0);
      }
      yield;
    }
    out.crickets = buf;
  }
  // Bach: viele kleine "Bläschen" (Tonhöhe gleitet nach oben) + leises Wasserrauschen
  {
    const {n, buf} = loop(8), L = buf.getChannelData(0), Rr = buf.getChannelData(1);
    for(let ch = 0; ch < 2; ch++){ const d = ch ? Rr : L; let lp = 0;   // leises Wasserrauschen
      for(let i = 0; i < n; i++){ lp += (R()*2 - 1 - lp)*0.25; d[i] += lp*0.08; if((i & 65535) === 0) yield; } }
    for(let b = 0; b < 8*55; b++){
      const st = Math.floor(R()*n), f0 = 450 + R()*1300, up = 1.4 + R()*1.4, len = Math.ceil((0.012 + R()*0.03)*SR);
      const pan = R()*1.6 - 0.8, gl = Math.cos((pan + 1)*Math.PI/4), gr = Math.sin((pan + 1)*Math.PI/4), amp = 0.08 + R()*0.22;
      let ph = 0;
      for(let i = 0; i < len; i++){ const k = i/len; ph += 2*Math.PI*f0*Math.pow(up, k)/SR; const v = Math.sin(ph)*Math.sin(Math.PI*k)*amp; const j = (st + i) % n; L[j] += v*gl; Rr[j] += v*gr; }
      if(b % 60 === 0) yield;
    }
    out.brook = buf;
  }
  for(const key of ['wind', 'crickets', 'brook']){
    const b = out[key]; let peak = 0.001;
    for(let ch = 0; ch < 2; ch++){ const d = b.getChannelData(ch); for(let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i])); yield; }
    for(let ch = 0; ch < 2; ch++){ const d = b.getChannelData(ch); for(let i = 0; i < d.length; i++) d[i] *= 0.9/peak; yield; }
  }
}
function musicPrepare(){
  if(mus.ready || mus.job || !audioCtx) return;
  mus.job = true;
  const out = {}, it = musicBuild(audioCtx, out);
  const tick = ()=>{
    const t0 = performance.now();
    while(performance.now() - t0 < 6){
      if(it.next().done){ musicStart(out); return; }
    }
    setTimeout(tick, 16);
  };
  setTimeout(tick, 1500);   // nach der Geräusch-Bibliothek
}
function musicStart(out){
  const a = audioCtx;
  try{
    mus.piano = out.piano;
    mus.bus = a.createGain(); mus.bus.gain.value = 0;
    const cv = a.createConvolver(); cv.buffer = out.ir;
    const wet = a.createGain(); wet.gain.value = 0.45;
    mus.bus.connect(audioOut()); mus.bus.connect(wet); wet.connect(cv); cv.connect(audioOut());
    mus.ambNodes = {};
    for(const key of ['wind', 'crickets', 'brook']){
      const src = a.createBufferSource(); src.buffer = out[key]; src.loop = true;
      const g = a.createGain(); g.gain.value = 0; src.connect(g); g.connect(audioOut()); src.start(0, Math.random()*4);
      mus.ambNodes[key] = g;
    }
    mus.nextT = a.currentTime + 0.5; mus.ready = true;
  }catch(e){}
}

// ---------- Komponieren ----------
// Akkorde als MIDI-Töne (F-Dur): Grundton tief + Akkordtöne; mehrere Folgen, die sich abwechseln
const MUSIC_PROGS = [
  [[41, 53, 57, 60, 64], [45, 52, 57, 60, 64], [46, 53, 57, 62, 65], [48, 55, 60, 64, 67]],   // Fmaj7  Am7  Bbmaj7  C
  [[38, 50, 53, 57, 60], [46, 53, 57, 62, 65], [41, 53, 57, 60, 64], [43, 50, 55, 58, 62]],   // Dm7  Bbmaj7  Fmaj7  Gm7
  [[46, 53, 58, 62, 65], [48, 55, 60, 64, 67], [45, 52, 57, 60, 64], [38, 50, 53, 57, 62]],   // Bb  C  Am7  Dm
];
const MUSIC_SCALE = [0, 2, 4, 5, 7, 9, 10];   // Töne von F-Dur (C D E F G A B♭), als Rest von 12
function musicCompose(bar, bright){
  // liefert die Noten eines Takts: [{beat, midi, vel, len}]
  const prog = MUSIC_PROGS[Math.floor(bar/8) % MUSIC_PROGS.length];
  const chord = prog[Math.floor(bar/2) % 4];
  const ev = [];
  // links: gebrochener Akkord in Achteln (Grundton, Quinte, Oktave+Terz, Quinte …), sanft
  const lh = [chord[0], chord[1], chord[2], chord[1], chord[3], chord[2], chord[1], chord[2]];
  lh.forEach((m, i)=> ev.push({beat: i*0.5, midi: m, vel: i === 0 ? 0.5 : 0.3 + Math.random()*0.06, len: 2}));
  // rechts: Motiv aus Akkord-/Tonleitertönen, alle 2 Takte neu, dazwischen wiederholt mit kleiner Änderung
  if(!mus.motif || bar % 4 === 0){
    const rhythms = [[0, 1, 1.5, 2.5], [0, 1.5, 2, 3], [0.5, 1, 2], [0, 2, 3, 3.5], [1, 1.5, 2, 3]];
    const rh = rhythms[Math.floor(Math.random()*rhythms.length)];
    let m = chord[4] + (Math.random() < 0.5 ? 0 : 2);
    mus.motif = rh.map(b => { const step = [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random()*7)]; m = musicNearestScale(m + step); return {beat: b, midi: m}; });
  }
  const rest = (bar % 8 === 7) || Math.random() < 0.15;   // Atempause
  if(!rest){
    for(const n of mus.motif){
      const midi = (bar % 2 === 1 && Math.random() < 0.4) ? musicNearestScale(n.midi + (Math.random() < 0.5 ? 2 : -1)) : n.midi;
      ev.push({beat: n.beat, midi: midi + (bright ? 12 : 0), vel: 0.42 + Math.random()*0.1, len: 1.5});
      if(bright) ev.push({beat: n.beat, midi: midi + 24, vel: 0.16, len: 1.2, sparkle: true});
    }
  }
  return ev;
}
function musicNearestScale(m){
  for(let d = 0; d < 3; d++){ for(const s of [m - d, m + d]){ if(MUSIC_SCALE.includes(((s % 12) + 12) % 12)) return Math.max(60, Math.min(84, s)); } }
  return m;
}
function musicPlayNote(t, midi, vel){
  const base = [48, 60, 72, 84].reduce((b, x)=> Math.abs(x - midi) < Math.abs(b - midi) ? x : b, 60);
  const src = audioCtx.createBufferSource(); src.buffer = mus.piano[base];
  src.playbackRate.value = Math.pow(2, (midi - base)/12);
  const g = audioCtx.createGain(); g.gain.value = 0.11*vel;
  src.connect(g); g.connect(mus.bus); src.start(t);
  mus.log.push(midi); if(mus.log.length > 64) mus.log.shift();
}
function musicSchedule(){
  const a = audioCtx, beat = 60/MUSIC_BPM;
  while(mus.nextT < a.currentTime + 0.6){
    const bright = weather.rainbow > 0;
    for(const e of musicCompose(mus.bar, bright)){
      const swing = (Math.random() - 0.5)*0.02;   // ein bisschen menschlich
      musicPlayNote(mus.nextT + e.beat*beat + swing, e.midi, e.vel);
    }
    mus.nextT += 4*beat; mus.bar++;
  }
}
// jedes Bild aus dem Wetter aufgerufen
function musicUpdate(){
  if(!audioCtx || audioCtx.state !== 'running') return;
  // eigene Aufnahmen (23-audio-dateien.js) haben Vorrang; was davon läuft, ersetzt den erzeugten Klang
  const own = typeof fileAudio !== 'undefined' ? (fileAudioUpdate(), fileAudio.ok) : {};
  musicPrepare();
  if(!mus.ready) return;
  if(mus.nextT < audioCtx.currentTime) mus.nextT = audioCtx.currentTime + 0.1;   // nach Pause/Tab-Wechsel nicht nachholen
  if(!own.music) musicSchedule();
  const now = audioCtx.currentTime, sun = 1 - weather.rain;
  mus.bus.gain.setTargetAtTime(own.music ? 0 : MUSIC_VOL*VOL.music*(1 - 0.4*weather.rain), now, 1.5);
  mus.ambNodes.wind.gain.setTargetAtTime(AMB_VOL.wind*VOL.sfx*(0.35 + 0.65*sun)*(own.birds ? 0.5 : 1), now, 1);
  // Grillen: mit eigenen Aufnahmen sonst aus; Welt + Tageszeit (THEME.ambiente, Ausbau 7) holen sie z. B. nachts dazu
  const amb = typeof THEME !== 'undefined' && THEME && THEME.ambiente;
  const grillen = own.birds ? (amb ? amb.grillen : 0) : 1;
  mus.ambNodes.crickets.gain.setTargetAtTime(AMB_VOL.crickets*VOL.sfx*sun*grillen, now, 1);
  mus.ambNodes.brook.gain.setTargetAtTime(own.river ? 0 : AMB_VOL.brook*VOL.sfx*(0.5 + 0.5*sun), now, 1);
}
