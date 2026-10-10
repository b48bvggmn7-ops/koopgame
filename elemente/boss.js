// elemente/boss.js – Endgegner-Gerüst (Ausbau 6; Elemente „Boss“, „Arena“, „Boss-Platz“, siehe 00-register.js).
// Ein Boss-Level ist ein normales Level mit einem Boss-Marker. Dann gilt:
//   - Arena: feste Kamera an der linken Arena-Grenze (Arena-Marker im Editor; ohne Marker: Levelanfang), kein Ziel.
//   - Boss = Zustandsautomat aus den Level-Daten: Phasen nacheinander (je Phase: Platz, Treffer, Angriffe, Pause,
//     Schild-Nummer), Zustände 'auftritt' -> 'warten' <-> 'angriff' -> ('wechsel' zur nächsten Phase) -> 'besiegt'.
//   - Treffer NUR durch Zusammenspiel: Der Boss trägt einen Helm (bei Bruno eine Kokosnuss-Schale). Solange die
//     Schild-Nummer der Phase AN ist (eine Figur steht auf der Druckplatte / hat den Hebel umgelegt), schwebt der Helm
//     weg – dann zählt ein Sprung auf den Kopf (die andere Figur). Mit Helm prallt man nur ab.
//   - Berührung des Boss-Körpers oder eines Angriffs = Tod. Danach starten beide am Anfang der AKTUELLEN Phase
//     (Checkpoint pro Phase); der Boss hat in dieser Phase wieder volle Treffer. R = ganzer Kampf von vorn.
//   - Lebensbalken oben in der Mitte (Name, Treffer je Phase, Phasen-Punkte).
//   - Sieg: Boss taumelt, lässt sein Zahnrad fallen; wer es einsammelt, startet die Sieges-Szene (story/story.json,
//     siegSzene) – danach „Level geschafft“, der Boss zählt als besiegt und die nächste Welt öffnet (24-startmenue.js).
// Boss-Arten (Aussehen + Angriffe) stehen in BOSS_TYPEN; die Phasen eines Levels können alles überschreiben.
// Werte (BOSS_*) in js/02-physik-werte.js. Spiel-Zustand: bossKampf (null = kein Boss im Level).
let bossKampf = null;
const BOSS_TYPEN = {
  bruno: {
    name: 'Bruno', titel: 'Kokos-Gorilla', w: 76, h: 92, siegSzene: 'boss1_sieg', startSzene: 'boss1_start',
    // Standard-Phasen (werden von den Level-Daten "boss.phasen" überschrieben)
    phasen: [
      {angriffe: ['kokos', 'stampf'], pause: 2.2, schildDauer: 0},
      {angriffe: ['kokos', 'stampf', 'kokos'], pause: 1.8, schildDauer: 0},
      {angriffe: ['kokosregen', 'stampf'], pause: 1.5, schildDauer: 5},
    ],
  },
};
const bossTyp = b => BOSS_TYPEN[b && b.typ] || BOSS_TYPEN.bruno;
// --- Aufbau aus Level-Daten ---
function bossAufbauen(daten){
  const def = (daten.boss || [])[0];
  if(!def){ bossKampf = null; kameraFest = null; return; }
  const T = bossTyp(def), plaetze = (daten.bossPlaetze || []).slice().sort((a, b) => a.phase - b.phase);
  const arenaX = (daten.bossArena || []).map(a => a.x);
  const x0 = arenaX.length ? Math.min(...arenaX) - 20 : 0;
  const datenPhasen = Array.isArray(def.phasen) ? def.phasen : [];
  const anzahl = Math.max(1, datenPhasen.length || 0, ...plaetze.map(p => p.phase || 1));
  const phasen = [];
  for(let k = 0; k < anzahl; k++){
    const std = T.phasen[Math.min(k, T.phasen.length - 1)], dp = datenPhasen[k] || {}, pl = plaetze.find(p => (p.phase || 1) === k + 1);
    phasen.push({
      treffer: dp.treffer || def.treffer || 3,
      angriffe: dp.angriffe || std.angriffe,
      pause: (dp.pause || std.pause) / (def.tempo || 1),
      schildDauer: dp.schildDauer !== undefined ? dp.schildDauer : std.schildDauer,
      ort: dp.ort ? {x: dp.ort[0], y: dp.ort[1]} : pl ? {x: pl.x, y: pl.y} : {x: def.x, y: def.y},
      schild: dp.schild !== undefined ? dp.schild : pl ? pl.link : null,
    });
  }
  bossKampf = {def, T, typ: def.typ || 'bruno', name: def.name || T.name, titel: def.titel || T.titel, tempo: def.tempo || 1,
    phasen, arena: {x0, x1: arenaX.length ? Math.max(...arenaX) + 20 : x0 + VW}, siegSzene: def.siegSzene || T.siegSzene || null,
    startSzene: def.startSzene || T.startSzene || null, x: def.x, y: def.y, phase: 0};
  bossPhaseStart(0, true);
  kameraFest = x0;   // das Ziel schaltet buildLevel (01-level.js) im Boss-Level ab
}
// Phase k (neu) beginnen: Boss an seinen Platz, volle Treffer, Angriffe von vorn
function bossPhaseStart(k, sofort){
  const B = bossKampf, P = B.phasen[k];
  B.phase = k; B.hp = P.treffer; B.angriffNr = 0; B.geschosse = []; B.wellen = []; B.unverwundbar = 0; B.schildZeit = 0;
  B.zustand = sofort ? 'auftritt' : 'wechsel'; B.t = 0; B.vonX = B.x; B.vonY = B.y; B.vy = 0; B.wut = 0; B.treffT = -99;
  if(sofort){ B.x = P.ort.x; B.y = P.ort.y; }
}
const bossKopf = B => ({x: B.x, y: B.y - B.T.h});   // Oberkante Kopf
const bossKoerper = B => ({x: B.x - B.T.w/2 + 6, y: B.y - B.T.h + 18, w: B.T.w - 12, h: B.T.h - 18});
const bossHelmAb = B => { const s = B.phasen[B.phase].schild; return !!(s && linkOn[s]); };
const figurBox = pl => ({x: pl.x - pl.w/2, y: pl.y - pl.h, w: pl.w, h: pl.h});
// --- Ablauf pro Physik-Schritt ---
function bossSchritt(players){
  const B = bossKampf; if(!B || deathState) return;
  B.t++;
  if(B.unverwundbar > 0) B.unverwundbar--;
  const P = B.phasen[B.phase];
  // Helm zurück: in manchen Phasen klappt der Hebel nach schildDauer Sekunden von selbst zurück
  if(P.schild && linkOn[P.schild] && P.schildDauer > 0){
    if(++B.schildZeit >= P.schildDauer*60){ setLink(P.schild, false); B.schildZeit = 0; SFX.helm(B.x, false); }
  } else B.schildZeit = 0;
  if(B.helmWar !== undefined && B.helmWar !== bossHelmAb(B)) SFX.helm(B.x, bossHelmAb(B));
  B.helmWar = bossHelmAb(B);
  if(B.zustand === 'auftritt'){ if(B.t > BOSS_AUFTRITT){ B.zustand = 'warten'; B.t = 0; SFX.bossBruell(B.x); } }
  else if(B.zustand === 'warten'){ if(B.t > P.pause*60){ B.zustand = 'angriff'; B.t = 0; B.angriff = P.angriffe[B.angriffNr % P.angriffe.length]; B.angriffNr++; bossAngriffStart(B, players); } }
  else if(B.zustand === 'angriff'){ if(bossAngriffSchritt(B, players)){ B.zustand = 'warten'; B.t = 0; } }
  else if(B.zustand === 'wechsel'){   // Sprung zum neuen Platz (unverwundbar)
    const k = Math.min(1, B.t/BOSS_WECHSEL), z = P.ort;
    B.x = B.vonX + (z.x - B.vonX)*k; B.y = B.vonY + (z.y - B.vonY)*k - Math.sin(k*Math.PI)*160;
    if(k >= 1){ B.x = z.x; B.y = z.y; B.zustand = 'warten'; B.t = 0; SFX.stampf(B.x); bossWellen(B); }
  }
  else if(B.zustand === 'besiegt'){ bossBesiegtSchritt(B, players); }
  bossGeschosseSchritt(B, players);
  if(B.zustand !== 'besiegt') bossBeruehrung(B, players);
}
function bossAngriffStart(B, players){
  if(B.angriff === 'kokos' || B.angriff === 'kokosregen'){
    SFX.bossBruell(B.x);
    const n = B.angriff === 'kokosregen' ? BOSS_KOKOS_REGEN : BOSS_KOKOS;
    for(let i = 0; i < n; i++){
      const ziel = players[i % 2], streu = (Math.random() - 0.5)*(B.angriff === 'kokosregen' ? 360 : 120);
      const x = Math.max(B.arena.x0 + 60, Math.min(B.arena.x1 - 60, ziel.x + streu));
      B.geschosse.push({art: 'kokos', x, y: -SKY_ROOM - 30, vy: 0, warte: BOSS_KOKOS_WARNUNG + i*12, r: 13});
    }
  }
  else if(B.angriff === 'stampf'){ B.sprungVy = -9; B.bodenY = B.y; }
}
// true = Angriff fertig
function bossAngriffSchritt(B, players){
  if(B.angriff === 'stampf'){
    if(B.t < 24) return false;                         // ausholen (Arme hoch)
    B.y += B.sprungVy; B.sprungVy += 0.9;
    if(B.y >= B.bodenY){ B.y = B.bodenY; SFX.stampf(B.x); bossWellen(B); return true; }
    return false;
  }
  return B.t > 50;   // Kokosnüsse fallen von selbst weiter
}
// Druckwelle: läuft vom Boss bzw. unter ihm am Boden nach links und rechts
function bossWellen(B){
  const boden = bossBoden(B.x);
  for(const d of [-1, 1]) B.wellen.push({x: B.x + d*30, y: boden, d, v: BOSS_WELLE_TEMPO*B.tempo});
}
// Arena-Boden an Stelle x: die UNTERSTE feste Oberfläche (dort laufen die Druckwellen, auch wenn der Boss oben im Baum sitzt)
function bossBoden(x){
  let best = null;
  for(const s of solids){ if(s.gone || s.type === 'oneway' || x < s.x || x > s.x + s.w) continue; if(best === null || s.y > best) best = s.y; }
  return best === null ? LEVEL_H : best;
}
// erste Oberfläche von oben an Stelle x (dort landet eine Kokosnuss; für den Warn-Schatten)
function bossOberflaeche(x){
  let best = null;
  for(const s of solids){ if(s.gone || s.type === 'oneway' || x < s.x || x > s.x + s.w) continue; if(best === null || s.y < best) best = s.y; }
  return best === null ? LEVEL_H : best;
}
function bossGeschosseSchritt(B, players){
  for(let i = B.geschosse.length - 1; i >= 0; i--){
    const g = B.geschosse[i];
    if(g.art === 'splitter'){ g.t++; if(g.t > 30) B.geschosse.splice(i, 1); continue; }
    if(g.warte > 0){ g.warte--; continue; }
    g.vy = Math.min(14, g.vy + 0.55); g.y += g.vy;
    for(const pl of players) if(Math.hypot(pl.x - g.x, (pl.y - pl.h/2) - g.y) < g.r + 12){ die(pl); return; }
    if(solids.some(s => !s.gone && s.type !== 'oneway' && g.x >= s.x && g.x <= s.x + s.w && g.y + g.r >= s.y && g.y < s.y + s.h)){
      B.geschosse[i] = {art: 'splitter', x: g.x, y: g.y, t: 0}; SFX.kokosKnack(g.x);
    }
  }
  for(let i = B.wellen.length - 1; i >= 0; i--){
    const w = B.wellen[i]; w.x += w.d*w.v;
    // Welle endet am Arena-Rand oder an einer Erhöhung (Wand/Podest am Boden)
    if(w.x < B.arena.x0 + 20 || w.x > B.arena.x1 - 20 || solids.some(s => !s.gone && s.type !== 'oneway' && w.x > s.x && w.x < s.x + s.w && s.y < w.y - 4 && s.y + s.h >= w.y)){ B.wellen.splice(i, 1); continue; }
    for(const pl of players) if(Math.abs(pl.x - w.x) < 14 + pl.w/2 && pl.y > w.y - BOSS_WELLE_HOEHE && pl.y <= w.y + 2){ die(pl); return; }
  }
}
// Sprung auf den Kopf (Treffer oder Abprallen am Helm) und Berührung des Körpers (Tod)
function bossBeruehrung(B, players){
  const K = bossKopf(B);
  for(const pl of players){
    if(pl.vy > 0 && Math.abs(pl.x - B.x) < B.T.w*0.42 && pl.y >= K.y - 8 && pl.y <= K.y + 22){
      pl.y = K.y - 8; pl.vy = BOSS_ABPRALL; pl.grounded = false; pl.hookAttached = false;
      if(B.zustand === 'wechsel' || B.unverwundbar > 0) continue;
      if(bossHelmAb(B)) bossTreffer(B); else SFX.helm(B.x, false, true);
      continue;
    }
    if(B.zustand !== 'wechsel' && rectsOverlap(figurBox(pl), bossKoerper(B))) die(pl);
  }
}
function bossTreffer(B){
  B.hp--; B.unverwundbar = BOSS_UNVERWUNDBAR; B.treffT = B.t; B.trefferAnim = performance.now();
  SFX.bossTreffer(B.x);
  for(let k = 0; k < 8; k++){ const a = -Math.PI/2 + (k/7 - 0.5)*2.6;
    coinFx.push({type: 'spark', x: B.x, y: B.y - B.T.h, t0: performance.now(), vx: Math.cos(a)*3, vy: Math.sin(a)*3, size: 4, star: true, col: ['#ffd34d', '#fff']}); }
  if(B.hp > 0) return;
  const P = B.phasen[B.phase];
  if(P.schild) setLink(P.schild, false);
  if(B.phase < B.phasen.length - 1){   // nächste Phase: Checkpoint
    bossPhaseStart(B.phase + 1, false);
    testJumpMsg = `Checkpoint · Phase ${B.phase + 1} von ${B.phasen.length}`; testJumpT = performance.now();
    SFX.checkpoint(B.x);
  } else {
    B.zustand = 'besiegt'; B.t = 0; B.geschosse = []; B.wellen = [];
    B.zahnrad = {x: B.x, y: B.y - B.T.h - 20, vy: -6, aufgehoben: false};
    SFX.bossBesiegt(B.x);
  }
}
function bossBesiegtSchritt(B, players){
  const Z = B.zahnrad; if(!Z || Z.aufgehoben) return;
  const boden = bossOberflaeche(Z.x) - 30;
  Z.vy = Math.min(8, Z.vy + 0.35); Z.y = Math.min(boden, Z.y + Z.vy);
  if(B.t > 40 && players.some(pl => Math.hypot(pl.x - Z.x, pl.y - pl.h/2 - Z.y) < 40)){
    Z.aufgehoben = true; SFX.coin(0, Z.x);
    bossSieg();
  }
}
// Sieg: Sieges-Szene direkt in der Arena (Figuren bleiben, wo sie sind), danach „Level geschafft“
function bossSieg(){
  const B = bossKampf;
  const weiter = () => { if(typeof winFinish === 'function') winFinish(); };
  if(B.siegSzene && typeof szeneSpielen === 'function') szeneSpielen(B.siegSzene, weiter, {buehne: false, bruno: {x: B.x, y: B.y}});
  else weiter();
}
// Tod / Neustart: Tod -> aktuelle Phase von vorn (Checkpoint pro Phase); R (Neustart) -> Phase 1
function bossZuruecksetzen(){
  const B = bossKampf; if(!B) return;
  const phase = deathState ? B.phase : 0;
  for(const P of B.phasen) if(P.schild) linkOn[P.schild] = false;
  B.x = B.phasen[phase].ort.x; B.y = B.phasen[phase].ort.y;
  bossPhaseStart(phase, true);
  kameraFest = B.arena.x0;
}
// --- Zeichnen ---
const bossRR = (c, x, y, w, h, r) => { c.beginPath(); if(c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); };
function zeichneBruno(c, x, y, B, opt){
  opt = opt || {};
  const t = performance.now(), atem = Math.sin(t*0.004)*1.5, wut = opt.wut || 0;
  const aus = opt.ausholen || 0;   // 0..1 Arme hoch
  const blitz = opt.getroffen ? Math.max(0, 1 - (t - opt.getroffen)/300) : 0;
  c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 0, 42, 8, 0, 0, Math.PI*2); c.fill();
  if(opt.taumel){ c.rotate(Math.sin(t*0.01)*0.15); }
  const fell = wut ? '#4a2c1e' : '#3b2a22', brust = '#7a5a48';
  // Beine
  c.fillStyle = fell; bossRR(c, -30, -26, 22, 26, 8); c.fill(); bossRR(c, 8, -26, 22, 26, 8); c.fill();
  // Körper
  c.beginPath(); c.ellipse(0, -48 + atem*0.5, 40, 36, 0, 0, Math.PI*2); c.fill();
  c.fillStyle = brust; c.beginPath(); c.ellipse(0, -42 + atem*0.5, 24, 22, 0, 0, Math.PI*2); c.fill();
  // Arme (lang, Fäuste am Boden; beim Ausholen hoch)
  c.fillStyle = fell;
  for(const s of [-1, 1]){
    c.save(); c.translate(s*36, -66); c.rotate(s*(0.25 + aus*2.2));
    bossRR(c, -9, 0, 18, 52, 9); c.fill();
    c.fillStyle = '#2a1c16'; c.beginPath(); c.arc(0, 54, 11, 0, Math.PI*2); c.fill(); c.fillStyle = fell;
    c.restore();
  }
  // Kopf
  const ky = -84 + atem;
  c.beginPath(); c.arc(0, ky, 24, 0, Math.PI*2); c.fill();
  c.fillStyle = '#a4826c'; c.beginPath(); c.ellipse(0, ky + 6, 16, 12, 0, 0, Math.PI*2); c.fill();   // Gesicht
  c.fillStyle = '#2a1c16'; c.fillRect(-16, ky - 8, 32, 6);                                            // Stirnwulst
  c.fillStyle = '#fff'; c.beginPath(); c.arc(-7, ky - 1, 3.6, 0, Math.PI*2); c.arc(7, ky - 1, 3.6, 0, Math.PI*2); c.fill();
  c.fillStyle = wut ? '#d22' : '#1a1a1a'; c.beginPath(); c.arc(-7, ky - 0.5, 1.9, 0, Math.PI*2); c.arc(7, ky - 0.5, 1.9, 0, Math.PI*2); c.fill();
  c.strokeStyle = '#1a1a1a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-13, ky - 9); c.lineTo(-3, ky - 5); c.moveTo(13, ky - 9); c.lineTo(3, ky - 5); c.stroke();   // böse Brauen
  c.fillStyle = '#3a2418'; c.beginPath(); c.ellipse(-3, ky + 6, 2, 1.5, 0, 0, Math.PI*2); c.ellipse(3, ky + 6, 2, 1.5, 0, 0, Math.PI*2); c.fill();
  c.strokeStyle = '#3a2418'; c.lineWidth = 2; c.beginPath(); c.arc(0, ky + 16, 6, Math.PI*1.15, Math.PI*1.85); c.stroke();
  // Kokos-Helm: sitzt auf dem Kopf oder schwebt (zitternd) darüber, solange er „ab“ ist
  if(!opt.ohneHelm){
    const ab = opt.helmAb, hy = ab ? ky - 52 + Math.sin(t*0.02)*3 : ky - 14, hx = ab ? Math.sin(t*0.03)*3 : 0;
    c.save(); c.translate(hx, hy);
    c.fillStyle = '#6b4423'; c.beginPath(); c.arc(0, 0, 26, Math.PI, 0); c.closePath(); c.fill();
    c.strokeStyle = '#4a2c14'; c.lineWidth = 2; c.stroke();
    c.strokeStyle = 'rgba(255,230,190,.35)'; c.lineWidth = 1.5;
    for(let i = -2; i <= 2; i++){ c.beginPath(); c.moveTo(i*8, -2); c.lineTo(i*6, -22); c.stroke(); }
    c.fillStyle = '#f3ead8'; c.fillRect(-26, -3, 52, 4);
    if(ab && opt.schild){ c.fillStyle = typeof linkColor === 'function' ? linkColor(opt.schild) : '#ffd34d';
      c.beginPath(); c.arc(0, -36, 8, 0, Math.PI*2); c.fill(); c.fillStyle = '#fff'; c.font = 'bold 10px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(opt.schild), 0, -35.5); }
    c.restore();
  }
  if(blitz > 0){ c.globalAlpha = blitz*0.7; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(0, -55, 46, 56, 0, 0, Math.PI*2); c.fill(); c.globalAlpha = 1; }
  if(opt.sterne){   // benommen
    for(let i = 0; i < 3; i++){ const a = t*0.006 + i*2.1; c.fillStyle = '#ffd34d'; c.font = 'bold 14px sans-serif'; c.textAlign = 'center'; c.fillText('★', Math.cos(a)*22, ky - 34 + Math.sin(a)*6); }
  }
  c.restore();
}
function bossZeichnen(){
  const B = bossKampf; if(!B) return;
  const x = Math.round(B.x - camX), P = B.phasen[B.phase];
  // Warnungen + Geschosse + Wellen
  for(const g of B.geschosse){
    const gx = g.x - camX;
    if(g.art === 'splitter'){ const k = g.t/30; ctx.globalAlpha = 1 - k; ctx.fillStyle = '#6b4423';
      for(let i = 0; i < 5; i++){ ctx.beginPath(); ctx.arc(gx + (i - 2)*8*(1 + k*3), g.y - k*20 + k*k*40, 4, 0, Math.PI*2); ctx.fill(); } ctx.globalAlpha = 1; continue; }
    if(g.warte > 0 || g.y < 0){   // Schatten-Warnung am Boden + Pfeil oben
      const b = bossOberflaeche(g.x), k = 1 - Math.max(0, g.warte)/(BOSS_KOKOS_WARNUNG + 40);
      ctx.fillStyle = `rgba(30,10,0,${0.15 + 0.35*k})`; ctx.beginPath(); ctx.ellipse(gx, b, 10 + 10*k, 4, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(255,90,60,${0.5 + 0.5*Math.sin(performance.now()*0.02)})`; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('▼', gx, -SKY_ROOM + 22);
    }
    if(g.warte <= 0){
      ctx.fillStyle = '#6b4423'; ctx.beginPath(); ctx.arc(gx, g.y, g.r, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#3a2410'; ctx.beginPath(); ctx.arc(gx - 4, g.y - 3, 2, 0, Math.PI*2); ctx.arc(gx + 3, g.y - 4, 2, 0, Math.PI*2); ctx.arc(gx, g.y + 2, 2, 0, Math.PI*2); ctx.fill();
    }
  }
  for(const w of B.wellen){
    const wx = w.x - camX;
    ctx.fillStyle = 'rgba(160,110,60,.85)';
    ctx.beginPath(); ctx.moveTo(wx - 18, w.y); ctx.quadraticCurveTo(wx - 6*w.d, w.y - BOSS_WELLE_HOEHE*1.2, wx + 18*w.d, w.y); ctx.fill();
    ctx.fillStyle = 'rgba(230,200,150,.7)'; for(let i = 0; i < 3; i++){ ctx.beginPath(); ctx.arc(wx - w.d*(8 + i*9), w.y - 6 - i*3, 3, 0, Math.PI*2); ctx.fill(); }
  }
  if(B.zustand === 'besiegt'){
    zeichneBruno(ctx, x, B.y + Math.min(30, B.t*0.6), B, {taumel: true, sterne: true, ohneHelm: true});
    const Z = B.zahnrad; if(Z && !Z.aufgehoben && typeof zeichneZahnrad === 'function'){
      const zx = Z.x - camX; ctx.fillStyle = 'rgba(255,230,120,.35)'; ctx.beginPath(); ctx.arc(zx, Z.y, 30 + Math.sin(performance.now()*0.006)*4, 0, Math.PI*2); ctx.fill();
      zeichneZahnrad(ctx, zx, Z.y, 15, performance.now()*0.003); }
    return;
  }
  const blink = B.unverwundbar > 0 && Math.floor(B.unverwundbar/4) % 2 === 0;
  if(blink) ctx.globalAlpha = 0.55;
  zeichneBruno(ctx, x, B.y, B, {helmAb: bossHelmAb(B), schild: P.schild, wut: B.phase >= 2, getroffen: B.trefferAnim,
    ausholen: B.zustand === 'angriff' && B.angriff === 'stampf' ? Math.min(1, B.t/20) : B.zustand === 'angriff' ? Math.max(0, 1 - B.t/30) : 0,
    sterne: B.unverwundbar > 0});
  ctx.globalAlpha = 1;
}
// Lebensbalken oben in der Mitte (Bildschirm-Koordinaten)
function bossBalken(){
  const B = bossKampf; if(!B || (typeof szene !== 'undefined' && szene)) return;
  const bw = 440, x0 = W/2 - bw/2, y0 = 22;
  ctx.fillStyle = 'rgba(20,24,32,.82)'; roundRect(x0 - 14, y0 - 8, bw + 28, 56, 14); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(B.name.toUpperCase(), x0, y0 + 7);
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '12px sans-serif'; ctx.fillText(B.titel, x0 + ctx.measureText(B.name.toUpperCase()).width + 30, y0 + 8);
  // Phasen-Punkte rechts
  for(let k = 0; k < B.phasen.length; k++){
    ctx.fillStyle = k < B.phase || B.zustand === 'besiegt' ? '#6c7a89' : k === B.phase ? '#ffd34d' : 'rgba(255,255,255,.25)';
    ctx.beginPath(); ctx.arc(x0 + bw - 8 - (B.phasen.length - 1 - k)*16, y0 + 7, 5, 0, Math.PI*2); ctx.fill();
  }
  // Balken: aktuelle Phase in Segmenten
  const P = B.phasen[B.phase], n = P.treffer, hp = B.zustand === 'besiegt' ? 0 : B.hp, sw = (bw - (n - 1)*4)/n;
  for(let i = 0; i < n; i++){
    ctx.fillStyle = i < hp ? (B.phase >= 2 ? '#ff5a4a' : '#ff9a3a') : 'rgba(255,255,255,.12)';
    roundRect(x0 + i*(sw + 4), y0 + 20, sw, 14, 5); ctx.fill();
  }
}
// --- Register: Boss, Arena-Grenze, Boss-Platz ---
elementRegistrieren({
  id: 'boss', name: 'Boss', feld: 'boss',
  editor: {
    werkzeug: 'boss', gruppe: 'boss', art: 'punkt', ziehbar: false, farbe: '#c0392b',
    titel: 'Boss: Startplatz des Endgegners (nur einer pro Level). Ein Level mit Boss ist ein Boss-Level: feste Kamera, ' +
           'kein Ziel, Sieg = Boss besiegt. Treffer je Phase und Tempo daneben einstellen',
    optionen: [
      {key: 'typ', label: 'Boss', werte: [['bruno', 'Bruno (Kokos-Gorilla)']]},
      {key: 'treffer', label: 'Treffer/Phase', zahl: true, werte: [['3', '3'], ['2', '2'], ['4', '4'], ['5', '5']]},
      {key: 'tempo', label: 'Tempo', zahl: true, werte: [['1', 'normal'], ['0.8', 'ruhig'], ['1.25', 'wild']]},
    ],
    neu(p, alle){ alle.splice(0); return p; },   // nur ein Boss pro Level
    zeichnen(ctx, c, r, TILE, p){
      const X = c*TILE + TILE/2, Y = r*TILE + TILE;
      if(typeof zeichneBruno === 'function'){ ctx.save(); ctx.translate(X, Y); ctx.scale(0.42, 0.42); zeichneBruno(ctx, 0, 0, null, {}); ctx.restore(); }
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(`${p.treffer || 3}×${p.tempo && p.tempo !== 1 ? ' ' + String(p.tempo).replace('.', ',') : ''}`, X, Y - 54);
    },
    // Spiel-Format: Startplatz + Name + Phasen mit ihren Angriffen (aus BOSS_TYPEN) -> der Ablauf steht in den Level-Daten
    exportieren: (liste, TILE) => liste.map(p => {
      const T = BOSS_TYPEN[p.typ] || BOSS_TYPEN.bruno, treffer = p.treffer || 3;
      return {x: p.c*TILE + TILE/2, y: p.r*TILE + TILE, typ: p.typ || 'bruno', name: T.name, treffer, tempo: p.tempo || 1,
              siegSzene: T.siegSzene, startSzene: T.startSzene, phasen: T.phasen.map(ph => ({treffer, ...ph}))};
    }),
  },
  spiel: {
    laden: bossAufbauen,
    schritt: bossSchritt,
    zuruecksetzen: bossZuruecksetzen,
    zeichnen: bossZeichnen,
    zeichnenOben: bossBalken,
  },
});
elementRegistrieren({
  id: 'bossArena', name: 'Arena-Grenze', feld: 'bossArena',
  editor: {
    werkzeug: 'arena', gruppe: 'boss', art: 'punkt', ziehbar: false, farbe: '#8e44ad',
    titel: 'Arena-Grenze: zwei Marken setzen (links und rechts). Die Kamera steht im Boss-Level fest an der linken Grenze; ' +
           'Angriffe bleiben zwischen den Grenzen',
    zeichnen(ctx, c, r, TILE){
      const X = c*TILE + TILE/2;
      ctx.strokeStyle = '#b07cff'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.moveTo(X, -3*TILE); ctx.lineTo(X, 18*TILE); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#b07cff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ARENA', X, r*TILE + TILE/2);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2})),
  },
  spiel: { laden(){} },
});
elementRegistrieren({
  id: 'bossPlatz', name: 'Boss-Platz', feld: 'bossPlaetze',
  editor: {
    werkzeug: 'bossplatz', gruppe: 'boss', art: 'punkt', ziehbar: false, farbe: '#e67e22',
    mitNummer: true, nummerName: 'Boss-Helm',
    titel: 'Boss-Platz: wo der Boss in Phase 1/2/3 steht. Die Verknüpfungs-Nummer öffnet in dieser Phase seinen Helm ' +
           '(Druckplatte/Hebel mit derselben Nummer) – nur dann trifft ein Sprung auf den Kopf',
    optionen: [{key: 'phase', label: 'Phase', zahl: true, werte: [['1', '1'], ['2', '2'], ['3', '3']]}],
    klick(p){ p.phase = (p.phase % 3) + 1; },
    zeichnen(ctx, c, r, TILE, p){
      const X = c*TILE, Y = r*TILE;
      ctx.fillStyle = 'rgba(230,126,34,.35)'; ctx.fillRect(X + 2, Y + 2, TILE - 4, TILE - 4);
      ctx.strokeStyle = '#e67e22'; ctx.lineWidth = 2; ctx.strokeRect(X + 2, Y + 2, TILE - 4, TILE - 4);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('P' + (p.phase || 1), X + TILE/2, Y + 13); ctx.fillText('⛑' + p.link, X + TILE/2, Y + 28);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE + TILE, phase: p.phase || 1, link: p.link})),
  },
  spiel: { laden(){} },
});
