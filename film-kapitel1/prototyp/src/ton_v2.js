// ===== Ton: Fantasie-Stimmen, Grillen, Uhr, Sternschnuppe (alles live erzeugt, keine Dateien) =====
const TON = (function(){
  let ac = null, master = null, an = true, rausch = null, umgebung = null, umgebungZiel = 0;
  // Stimmen: Grundton, Klangfarbe, Silben-Länge, Lautstärke
  const STIMME = {
    affe:    {f0: 370, typ: 'triangle', dauer: .068, jede: 2, g: .16, formant: 1.15, sprung: .2},    // hell, flink, hüpfend
    schwein: {f0: 290, typ: 'sine',     dauer: .088, jede: 2, g: .22, formant: .95, sprung: .1, vib: 7, nase: 1350},   // weich, rund, ein bisschen nasal
    prof:    {f0: 138, typ: 'sawtooth', dauer: .12,  jede: 3, g: .085, formant: .8, sprung: .07, tief: 1300},  // tief, gemütlich, langsam
  };
  const VOKAL = {a: 1100, e: 1750, i: 2300, o: 820, u: 650, 'ä': 1500, 'ö': 1250, 'ü': 1900};
  function start(){
    if(ac) return;
    try{ ac = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ ac = null; return; }
    master = ac.createGain(); master.gain.value = .9; master.connect(ac.destination);
    const n = ac.sampleRate*2, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
    for(let i = 0; i < n; i++) d[i] = Math.random()*2 - 1;
    rausch = b;
    umgebung = ac.createGain(); umgebung.gain.value = 0; umgebung.connect(master);
  }
  function stumm(x){ an = !x; if(master) master.gain.setTargetAtTime(an ? .9 : 0, ac.currentTime, .05); }
  const hash = s => { let h = 7; for(const c of s) h = (h*31 + c.charCodeAt(0)) & 0xffff; return h; };
  // eine Silbe sprechen
  function silbe(wer, zeichen, betont, leise, frage){
    if(!ac || !an) return;
    const v = STIMME[wer], t = ac.currentTime, l = zeichen.toLowerCase();
    const h = hash(l), stufe = ((h % 7) - 3)*.045;
    let f = v.f0*(1 + stufe + (Math.random() - .5)*v.sprung*.5)*(betont ? 1.18 : 1)*(frage ? 1.12 : 1);
    const o = ac.createOscillator(); o.type = v.typ; o.frequency.setValueAtTime(f, t);
    o.frequency.linearRampToValueAtTime(f*(1 + (Math.random() - .3)*v.sprung*.4), t + v.dauer);
    if(v.vib){ const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = v.vib; lg.gain.value = f*.025; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + v.dauer + .05); }
    const env = ac.createGain(), g = v.g*(leise ? .45 : 1);
    env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(g, t + .012);
    env.gain.setValueAtTime(g*.85, t + v.dauer*.55); env.gain.linearRampToValueAtTime(0, t + v.dauer);
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3.5; bp.frequency.value = (VOKAL[l] || 1500)*v.formant;
    const bpG = ac.createGain(); bpG.gain.value = 1.6;
    o.connect(env);
    let ziel = master;
    if(v.tief){ const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = v.tief; lp.Q.value = .7; lp.connect(master); ziel = lp; }
    if(v.nase){ const pk = ac.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = v.nase; pk.gain.value = 7; pk.Q.value = 2; pk.connect(ziel); ziel = pk; }
    env.connect(ziel); env.connect(bp); bp.connect(bpG); bpG.connect(ziel);
    o.start(t); o.stop(t + v.dauer + .02);
  }
  function rauschen(dauer, f0, f1, q, g, verz){
    if(!ac || !an) return;
    const t = ac.currentTime + (verz || 0), s = ac.createBufferSource(); s.buffer = rausch; s.loop = true;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q; bp.frequency.setValueAtTime(f0, t);
    bp.frequency.exponentialRampToValueAtTime(f1, t + dauer);
    const e = ac.createGain(); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + dauer*.3); e.gain.linearRampToValueAtTime(0, t + dauer);
    s.connect(bp); bp.connect(e); e.connect(master); s.start(t, Math.random()); s.stop(t + dauer + .05);
  }
  function ton(f, dauer, g, typ, verz, ziel){
    if(!ac || !an) return;
    const t = ac.currentTime + (verz || 0), o = ac.createOscillator(), e = ac.createGain();
    o.type = typ || 'sine'; o.frequency.setValueAtTime(f, t);
    e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + .008); e.gain.exponentialRampToValueAtTime(.0001, t + dauer);
    o.connect(e); e.connect(ziel || master); o.start(t); o.stop(t + dauer + .05);
  }
  // Grille: drei kurze hohe Zirper
  function grille(laut){ if(!ac || !an) return; const f = 4300 + Math.random()*900; for(let i = 0; i < 3; i++) ton(f, .028, .012*laut, 'sine', i*.045, umgebung); }
  function tippel(hoch){ if(!ac || !an) return; const f = hoch ? 1650 : 1250; ton(f, .045, .05, 'triangle', 0); ton(f*1.25, .035, .03, 'triangle', .045); rauschen(.03, 3800, 2600, 1.2, .015); }
  function datei(n){}   // eigene Aufnahmen (Sterne, Schritte) kommen erst in der Film-Tonspur dazu
  function klick(){ if(!ac || !an) return; ton(1800, .02, .12, 'square', 0); ton(900, .05, .08, 'square', .03); rauschen(.05, 3000, 2000, 1, .05); }
  function tick(hoch){ if(!ac || !an) return; ton(hoch ? 2600 : 2100, .03, .025, 'square', 0); }
  function glocke(){ [1046.5, 1318.5, 1568, 2093].forEach((f, i) => { ton(f, 2.2, .07, 'triangle', i*.16); ton(f*2.01, 1.2, .015, 'sine', i*.16); }); }
  function blaetter(){ rauschen(.7, 3200, 1800, 1.2, .07); }
  function sternFlug(){ rauschen(2.6, 500, 2600, 1.4, .09); for(let i = 0; i < 14; i++) ton(2200 + Math.random()*2400, .5, .02, 'sine', .3 + i*.16); }
  function sternLoop(){ for(let i = 0; i < 8; i++) ton(1500 + i*180, .4, .025, 'triangle', i*.07); }
  function sternFall(){ rauschen(1.2, 2600, 300, 1.2, .1); }
  function bumm(){ if(!ac || !an) return; const t = ac.currentTime, o = ac.createOscillator(), e = ac.createGain();
    o.frequency.setValueAtTime(75, t); o.frequency.exponentialRampToValueAtTime(22, t + 2.4); e.gain.setValueAtTime(.9, t); e.gain.exponentialRampToValueAtTime(.001, t + 2.8);
    o.connect(e); e.connect(master); o.start(t); o.stop(t + 2.9); rauschen(.35, 3000, 600, .7, .35); rauschen(2.6, 500, 60, .6, .32); rauschen(3.2, 160, 40, .9, .22, .15);   // Knall, Grollen, Nachbeben
    ton(48, 1.8, .5, 'triangle'); ton(34, 2.4, .4, 'sine', .08); }
  function plumps(){ ton(160, .25, .15, 'sine'); rauschen(.25, 900, 300, 1, .06); ton(520, .12, .05, 'triangle', .02); }
  // Sprachaufnahmen (stimmen.js): beim Start einmal entpacken, dann je Satz abspielen
  const puffer = {};
  async function aufnahmenLaden(){
    if(!ac || typeof AUFNAHMEN === 'undefined') return;
    for(const i in AUFNAHMEN){ try{ const bin = Uint8Array.from(atob(AUFNAHMEN[i].b64), ch => ch.charCodeAt(0)); puffer[i] = await ac.decodeAudioData(bin.buffer); }catch(e){} }
  }
  function aufnahme(i){
    if(!ac || !puffer[i]) return null;
    const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = puffer[i]; g.gain.value = an ? 1 : 0; s.connect(g); g.connect(master);
    const t0 = ac.currentTime + .03; s.start(t0);
    return {t0, dauer: puffer[i].duration, huelle: AUFNAHMEN[i].huelle, zeit: () => ac.currentTime - t0, stopp(){ try{ s.stop(); }catch(e){} }};
  }
  function knabbern(){ for(let i = 0; i < 4; i++) rauschen(.06, 2400 + Math.random()*1500, 1800, 2.5, .05, i*.07); }
  function grillenLaut(x){ umgebungZiel = x; if(umgebung) umgebung.gain.setTargetAtTime(x, ac.currentTime, .4); }
  return {start, aufnahmenLaden, aufnahme, knabbern, silbe, grille, tick, klick, tippel, datei, glocke, blaetter, sternFlug, sternLoop, sternFall, bumm, plumps, stumm, grillenLaut, STIMME, an: () => an, bereit: () => !!ac};
})();
