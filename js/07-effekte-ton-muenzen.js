// 07-effekte-ton-muenzen.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

// ---------- Münz-Aufsammel-Effekt ----------
// Münze schnellt hoch, dreht sich schnell, wird kurz größer und verpufft; dazu Funkelsterne,
// ein Lichtring, "+1" und ein kleiner Ton. Mehrere Münzen kurz hintereinander klingen jeweils höher.
let coinFx = [];              // {type, x, y, t0, ...}
let coinCombo = 0, lastCoinT = 0;
let audioCtx = null;
// Gesamtlautstärke (Ton aus/an mit M, siehe 18-sound.js) – alle Geräusche laufen hier durch
const MASTER_VOL = 0.7;   // Gesamtlautstärke aller Geräusche, Musik und Umgebung (1 = voll)
// Lautstärke-Regler aus dem Menü „Optionen“ (0–1, 1 = wie bisher), im Browser gemerkt:
// master = alles, music = Musik (Akkorde/Klavier), sfx = Geräusche und Umgebung (Vögel, Regen, Fluss)
const VOL = {master: 1, music: 1, sfx: 1};
try{ Object.assign(VOL, JSON.parse(localStorage.getItem('monchichi_vol') || '{}')); }catch(e){}
function masterLevel(){ return soundMuted ? 0 : MASTER_VOL*VOL.master; }
function setVolume(k, v){
  VOL[k] = Math.max(0, Math.min(1, v));
  try{ localStorage.setItem('monchichi_vol', JSON.stringify(VOL)); }catch(e){}
  if(masterGain) masterGain.gain.value = masterLevel();
}
let masterGain = null, soundMuted = false;
let unterwasserFilter = null;   // Tiefpass hinter allem (Ausbau 5): unter Wasser klingt alles gedämpft (elemente/wasser.js)
try{ soundMuted = localStorage.getItem('monchichi_mute') === '1'; }catch(e){}
function audioOut(){
  if(!masterGain){
    masterGain = audioCtx.createGain(); masterGain.gain.value = masterLevel();
    try{
      unterwasserFilter = audioCtx.createBiquadFilter(); unterwasserFilter.type = 'lowpass';
      unterwasserFilter.frequency.value = 20000; unterwasserFilter.Q.value = 0.7;
      masterGain.connect(unterwasserFilter); unterwasserFilter.connect(audioCtx.destination);
    }catch(e){ masterGain.connect(audioCtx.destination); }
  }
  return masterGain;
}
function coinPickupFx(c){
  const now = performance.now();
  c.takenAt = now;
  coinCombo = (now - lastCoinT < 900) ? Math.min(coinCombo+1, 8) : 0;
  lastCoinT = now;
  const pal = COIN_PAL[c.color] || COIN_PAL.gold;
  coinFx.push({type:'ring', x:c.x, y:c.y, t0:now, rgb:pal[3]});
  coinFx.push({type:'text', x:c.x, y:c.y-18, t0:now, txt:'+1'});
  for(let i=0;i<10;i++){
    const a = (i/10)*Math.PI*2 + Math.random()*0.4;
    const sp = 2.2 + Math.random()*2.2;
    coinFx.push({type:'spark', x:c.x, y:c.y, t0:now, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp - 1.2,
                 size: 4 + Math.random()*3.5, star: i%2===0, col: c.color==='gold' ? null : pal});
  }
  if(!(typeof SFX !== 'undefined' && SFX.coin(coinCombo, c.x))) playCoinSound(coinCombo);   // gläsernes Klirren (18-sound.js), sonst alter Ton
  const cc = document.querySelector('#coinCard .cc.' + (c.color === 'pink' ? 'f' : 'm'));   // Spalte der Münzfarbe hüpft
  if(cc){ cc.classList.remove('bump'); void cc.offsetWidth; cc.classList.add('bump'); }
}
// Tonausgabe schon beim ersten Tastendruck/Klick starten (nicht mitten im Spielbild -> kein Ruckler)
function warmAudio(){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
  }catch(e){}
}
window.addEventListener('keydown', warmAudio, {once:true});
window.addEventListener('pointerdown', warmAudio, {once:true});
function playTones(notes, type, vol){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const t = audioCtx.currentTime;
    for(const [f, start, dur] of notes){
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t+start);
      g.gain.exponentialRampToValueAtTime(vol, t+start+0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t+start+dur);
      o.connect(g); g.connect(audioOut());
      o.start(t+start); o.stop(t+start+dur+0.02);
    }
  }catch(e){}
}
function playCoinSound(combo){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const t = audioCtx.currentTime;
    const base = 988 * Math.pow(2, combo/12);     // B5, pro Combo-Münze einen Halbton höher
    for(const [f, start, dur] of [[base, 0, 0.09], [base*1.335, 0.07, 0.22]]){  // zwei Töne: "bling"
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t+start);
      g.gain.exponentialRampToValueAtTime(0.07, t+start+0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t+start+dur);
      o.connect(g); g.connect(audioOut());
      o.start(t+start); o.stop(t+start+dur+0.02);
    }
  }catch(e){}
}
let tNowCp = 0;
function drawDeathBubble(){
  const o = deathState.other, now = performance.now(), age = now - deathState.t0;
  const d = 150; if(age < d) return;                       // kurz nach dem Puff erscheint die Blase
  const k = Math.min(1, (age-d)/220);
  const sc = k < 1 ? (1 - Math.pow(1-k,3))*1.12 - (k>0.8 ? (k-0.8)*0.6 : 0) : 1;   // kleines Aufploppen
  const txt = deathState.phrase;
  ctx.font = 'bold 16px sans-serif';
  const tw = ctx.measureText(txt).width, bw = tw + 26, bh = 34;
  const sx = Math.round(o.x - camX), top = Math.round(o.y - o.h - 70);
  // Blase im Bild halten, Zipfel zeigt trotzdem auf die Figur
  const cx = Math.max(bw/2 + 8, Math.min(VW - bw/2 - 8, sx));
  const tail = Math.max(-bw/2 + 16, Math.min(bw/2 - 16, sx - cx));
  ctx.save();
  ctx.translate(cx, top + bh);
  ctx.scale(sc, sc);
  // Blase
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#2b2b33'; ctx.lineWidth = 2.5;
  roundRect(-bw/2, -bh, bw, bh, 14); ctx.fill(); ctx.stroke();
  // Zipfel zum Sprecher
  ctx.beginPath(); ctx.moveTo(tail-8, -1); ctx.lineTo(tail-2, 14); ctx.lineTo(tail+8, -1); ctx.closePath();
  ctx.fill(); ctx.beginPath(); ctx.moveTo(tail-8, 0); ctx.lineTo(tail-2, 14); ctx.lineTo(tail+8, 0); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(tail-7, -3, 14, 4);
  // Text
  ctx.fillStyle = '#2b2b33'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(txt, 0, -bh/2 + 1);
  // Ärger-Zeichen oben rechts
  ctx.strokeStyle = '#e8434f'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  const ax = bw/2 - 4, ay = -bh - 2;
  for(const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){
    ctx.beginPath(); ctx.moveTo(ax+dx*3, ay+dy*7); ctx.quadraticCurveTo(ax+dx*3, ay+dy*3, ax+dx*7, ay+dy*3); ctx.stroke();
  }
  ctx.restore();
}
// Figur außerhalb des Bildes (nur möglich bei maximalem Zoom): Pfeil mit Gesicht am Bildrand, auf ihrer Höhe
function drawOffscreenArrows(){
  for(const pl of [p1, p2]){
    if(deathState && pl === deathState.victim) continue;
    const sx = (pl.x - camX) * zoom;
    const sy = (pl.y - pl.h*0.5) * zoom + H*(1-zoom);
    let side = 0;
    if(sx < -6) side = -1; else if(sx > W + 6) side = 1;
    if(!side) continue;
    const y = Math.max(70, Math.min(H - 50, sy));
    const x = side < 0 ? 40 : W - 40;
    const bob = Math.sin(performance.now()*0.008) * 3 * side;
    ctx.save();
    ctx.translate(x + bob, y);
    // Pfeilspitze zum Rand
    ctx.fillStyle = 'rgba(20,28,38,.85)';
    ctx.beginPath(); ctx.moveTo(side*34, 0); ctx.lineTo(side*20, -11); ctx.lineTo(side*20, 11); ctx.closePath(); ctx.fill();
    // runder Rahmen mit Gesicht
    ctx.beginPath(); ctx.arc(0, 0, 21, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = pl.male ? '#c58b5a' : '#f6a9c1';
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI*2); ctx.fill();
    const img = pl.male ? ASSETS.monkey : ASSETS.pig;
    if(img && img.complete && img.naturalWidth){ const ih = 32*img.naturalHeight/img.naturalWidth; ctx.drawImage(img, -16, -ih/2, 32, ih); }   // ohne Verzerren
    // Abstand in Kästchen
    const dist = Math.round(Math.abs(side < 0 ? (camX - pl.x) : (pl.x - (camX + VW))) / 40);
    ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(20,28,38,.85)'; roundRect(-16, 24, 32, 15, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillText(dist + ' K', 0, 26);
    ctx.restore();
  }
}
function drawContinuePrompt(){
  if(!deathState || performance.now() < deathState.canContinueAt) return;
  const a = 0.75 + 0.25*Math.sin(performance.now()*0.006);
  const msg = 'Beliebige Taste (Tastatur oder Controller) drücken, um weiterzumachen';
  ctx.font = 'bold 18px sans-serif';
  const tw = ctx.measureText(msg).width + 36;
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(20,28,38,.85)'; roundRect(W/2 - tw/2, H/2 - 24, tw, 48, 14); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(msg, W/2, H/2 + 1);
  ctx.globalAlpha = 1;
}
function drawCoinFx(camX){
  const now = performance.now();
  coinFx = coinFx.filter(f => now - f.t0 < 800);
  for(const f of coinFx){
    const age = now - f.t0;
    if(f.type==='ring'){
      const k = Math.min(1, age/350); if(k>=1) continue;
      ctx.strokeStyle = `rgba(${f.rgb||'255,190,40'},${(1-k)*0.95})`; ctx.lineWidth = 5*(1-k)+1.5;
      ctx.beginPath(); ctx.arc(f.x-camX, f.y, 8 + k*30, 0, Math.PI*2); ctx.stroke();
    } else if(f.type==='spark'){
      const k = Math.min(1, age/550); if(k>=1) continue;
      const fr = age/16.7;
      const x = f.x - camX + f.vx*fr*0.9, y = f.y + f.vy*fr*0.9 + 0.06*fr*fr;
      const sz = f.size*(1-k*0.7);
      ctx.globalAlpha = 1-k;
      ctx.fillStyle = f.col ? (f.star ? f.col[1] : f.col[0]) : (f.star ? '#ffcf1f' : '#ff9f1c');
      if(f.star){
        ctx.beginPath();
        for(let i=0;i<8;i++){ const r = i%2 ? sz*0.4 : sz*1.4, a = i*Math.PI/4 + fr*0.1;
          ctx.lineTo(x+Math.cos(a)*r, y+Math.sin(a)*r); }
        ctx.closePath(); ctx.fill();
      } else { ctx.beginPath(); ctx.arc(x, y, sz*0.6, 0, Math.PI*2); ctx.fill(); }
      ctx.globalAlpha = 1;
    } else if(f.type==='poof'){
      const k = Math.min(1, age/600); if(k>=1) continue;
      const fr = age/16.7;
      ctx.globalAlpha = (1-k)*0.8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(f.x-camX + f.vx*fr, f.y + f.vy*fr, f.size*(0.6+k*0.8), 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    } else if(f.type==='text'){
      const k = Math.min(1, age/800); if(k>=1) continue;
      const rise = 34 * (1 - Math.pow(1-k, 3));
      const sc = k < 0.15 ? 0.6 + k/0.15*0.6 : 1.2 - Math.min(0.2, (k-0.15)*0.6);
      ctx.save(); ctx.translate(f.x-camX, f.y - rise); ctx.scale(sc, sc);
      ctx.globalAlpha = k < 0.6 ? 1 : 1-(k-0.6)/0.4;
      ctx.font = 'bold 18px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(120,70,0,.8)'; ctx.strokeText(f.txt, 0, 0);
      ctx.fillStyle = '#ffe36b'; ctx.fillText(f.txt, 0, 0);
      ctx.restore();
    }
  }
}

function coinsCollected(){ let n=0; for(const c of coins) if(c.taken) n++; return n; }
// Münzfarben: blau = nur der Affe, pink = nur das Schweinchen, gold = beide
const COIN_PAL = {gold:['#d99a00','#ffd23f','#fff4b8','255,190,40'], blue:['#1c6fd1','#4dabf7','#d0ebff','77,171,247'],
                  pink:['#d6336c','#f783ac','#ffe3ef','247,131,172']};
function canCollect(pl, c){ return c.color==='gold' || (c.color==='blue' && pl.male) || (c.color==='pink' && !pl.male); }
function updateCoins(players){
  const now = performance.now();
  for(const c of coins){
    if(c.taken){ if(c.pop < 1) c.pop = Math.min(1, c.pop + 0.05); continue; }
    for(const pl of players){
      const cx = pl.x, cy = pl.y - pl.h*0.5;
      if(Math.abs(cx - c.x) < 24 && Math.abs(cy - c.y) < 26){
        if(canCollect(pl, c)){ c.taken = true; c.takenBy = pl === p1 ? 'm' : 'f'; c.pop = 0; coinPickupFx(c); break; }
        else if(!c.nudgeT || now - c.nudgeT > 500) c.nudgeT = now;   // falsche Figur: Münze wackelt nur
      }
    }
  }
}
