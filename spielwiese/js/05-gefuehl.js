// 05-gefuehl.js – Spielwiese: Spielgefühl-Hilfen, jede einzeln abschaltbar (Panel „Spielgefühl“).
// Wackeln, Trefferstopp, Staub/Partikel, Nachbilder, Dehnen/Stauchen, Töne. Alles wird im festen Takt gerechnet.

const fx = { trauma: 0, stopp: 0, teilchen: [], nachbilder: [], brocken: [] };

function wackeln(t){ if(V.fxWackeln) fx.trauma = Math.min(1, fx.trauma + t * V.wackelStaerke); }
function trefferStopp(n){ if(V.fxStopp) fx.stopp = Math.max(fx.stopp, Math.round(n * V.stoppFaktor)); }
function dehnen(f, sx, sy){
  if(!V.fxDehnen) return;
  f.sx = 1 + (sx - 1) * V.dehnStaerke; f.sy = 1 + (sy - 1) * V.dehnStaerke; f.svx = f.svy = 0;
}
function dehnenSchritt(f){   // federt zurück auf 1
  f.svx = (f.svx + (1 - f.sx) * 0.28) * 0.62; f.sx += f.svx;
  f.svy = (f.svy + (1 - f.sy) * 0.28) * 0.62; f.sy += f.svy;
}
function staubWolke(x, y, n, richtung){
  if(!V.fxStaub) return;
  n = Math.round(n * V.staubMenge);
  for(let i = 0; i < n; i++){
    const seite = richtung || (Math.random() < 0.5 ? -1 : 1);
    fx.teilchen.push({x: x + (Math.random() - 0.5) * 12, y: y - 2, vx: seite * (0.6 + Math.random() * 2.2) - (richtung ? 0 : 0),
      vy: -0.3 - Math.random() * 1.4, schwer: 0.05, leben: 18 + Math.random() * 14, max: 32, r: 3 + Math.random() * 3,
      farbe: '#e9dcc4'});
  }
}
function teilchenBurst(x, y, n, farbe){
  if(!V.fxStaub) return;
  n = Math.round(n * V.staubMenge);
  for(let i = 0; i < n; i++){
    const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 5;
    fx.teilchen.push({x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, schwer: 0.25, leben: 30 + Math.random() * 20, max: 50,
      r: 3 + Math.random() * 3, farbe});
  }
}
function bruchstuecke(x, y, dx, dy, n){   // fliegen in Dash-Richtung weg, drehen sich, fallen
  if(!V.fxStaub) return;
  for(let i = 0; i < n; i++){
    const g = 2 + Math.random() * 6;
    fx.brocken.push({x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 30,
      vx: dx * g + (Math.random() - 0.5) * 5, vy: dy * g + (Math.random() - 0.5) * 5 - 2.5,
      w: Math.random() * Math.PI, vw: (Math.random() - 0.5) * 0.5, s: 5 + Math.random() * 8, leben: 50 + Math.random() * 30});
  }
}
function nachbild(f){
  fx.nachbilder.push({x: f.x, y: f.y, sx: f.sx, sy: f.sy, blick: f.blick, leben: 12, max: 12});
}
function gefuehlSchritt(){
  fx.trauma = Math.max(0, fx.trauma - 0.045);
  for(const t of fx.teilchen){ t.x += t.vx; t.y += t.vy; t.vy += t.schwer; t.vx *= 0.94; t.leben--; }
  fx.teilchen = fx.teilchen.filter(t => t.leben > 0);
  if(fx.teilchen.length > 400) fx.teilchen.splice(0, fx.teilchen.length - 400);
  for(const b of fx.brocken){ b.x += b.vx; b.y += b.vy; b.vy += 0.45; b.vx *= 0.98; b.w += b.vw; b.leben--; }
  fx.brocken = fx.brocken.filter(b => b.leben > 0 && b.y < KARTE_H * K + 100);
  for(const n of fx.nachbilder) n.leben--;
  fx.nachbilder = fx.nachbilder.filter(n => n.leben > 0);
}

// ---------- Töne (WebAudio, leise, kurz, ohne Nachhall) ----------
let audio = null, tonAusgang = null;
function tonEntsperren(){
  if(audio){ if(audio.state === 'suspended') audio.resume(); return; }
  try{
    audio = new (window.AudioContext || window.webkitAudioContext)();
    tonAusgang = audio.createGain(); tonAusgang.connect(audio.destination);
  }catch(err){ audio = null; }
}
function tonHuelle(g, t0, laut, dauer){
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(laut, t0 + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dauer);
}
function piep(f0, f1, dauer, laut, form){
  const t0 = audio.currentTime, o = audio.createOscillator(), g = audio.createGain();
  o.type = form || 'triangle';
  o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + dauer);
  tonHuelle(g, t0, laut, dauer); o.connect(g); g.connect(tonAusgang); o.start(t0); o.stop(t0 + dauer + 0.02);
}
function rauschen(dauer, laut, tiefpass){
  const t0 = audio.currentTime, n = Math.floor(audio.sampleRate * dauer);
  const puffer = audio.createBuffer(1, n, audio.sampleRate), d = puffer.getChannelData(0);
  for(let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const q = audio.createBufferSource(); q.buffer = puffer;
  const f = audio.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = tiefpass;
  const g = audio.createGain(); tonHuelle(g, t0, laut, dauer);
  q.connect(f); f.connect(g); g.connect(tonAusgang); q.start(t0);
}
function ton(art, staerke){
  if(!V.fxTon || !audio || audio.state !== 'running') return;
  tonAusgang.gain.value = V.lautstaerke * 0.5;
  const s = staerke === undefined ? 1 : staerke;
  if(art === 'sprung') piep(300, 520, 0.09, 0.12);
  else if(art === 'wand') piep(240, 430, 0.09, 0.13);
  else if(art === 'land'){ if(s > 0.15) rauschen(0.06 + 0.06 * s, 0.08 + 0.18 * Math.min(1, s), 380 + 300 * s); }
  else if(art === 'tod'){ piep(420, 110, 0.28, 0.14, 'sine'); rauschen(0.18, 0.15, 600); }
  else if(art === 'teleport') piep(480, 820, 0.12, 0.08, 'sine');
  else if(art === 'dash'){ rauschen(0.16, 0.16, 1400); piep(260, 620, 0.1, 0.07, 'sawtooth'); }
  else if(art === 'hyper'){ rauschen(0.2, 0.15, 1800); piep(330, 880, 0.14, 0.1); }
  else if(art === 'abbruch') piep(500, 340, 0.06, 0.08);
  else if(art === 'bonk'){ rauschen(0.07, 0.14, 500); piep(180, 120, 0.06, 0.08, 'square'); }
  else if(art === 'aufladen'){ piep(880, 1320, 0.07, 0.06, 'sine'); }
  else if(art === 'schuss') rauschen(0.07, 0.07, 2600);
  else if(art === 'greifen'){ piep(520, 390, 0.05, 0.09, 'square'); rauschen(0.04, 0.08, 900); }
  else if(art === 'abwurf'){ rauschen(0.14, 0.1, 1600); piep(420, 700, 0.08, 0.05); }
  else if(art === 'fehlschuss') piep(300, 220, 0.06, 0.04, 'sine');
  else if(art === 'kleben'){ piep(200, 150, 0.07, 0.1, 'sine'); rauschen(0.05, 0.06, 500); }
  else if(art === 'rollen') piep(240, 320, 0.06, 0.06, 'sine');
  else if(art === 'bruch'){ rauschen(0.25, 0.22, 900); piep(160, 70, 0.18, 0.12, 'square'); }
  else if(art === 'tock'){ piep(330, 260, 0.05, 0.08, 'square'); rauschen(0.04, 0.06, 700); }
  else if(art === 'wachsen') piep(300, 450, 0.08, 0.04, 'sine');
  else if(art === 'klick') piep(900, 700, 0.035, 0.06, 'sine');
}
