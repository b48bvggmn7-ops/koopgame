// elemente/trommel.js – Element „Trommel-Station“ (Rhythmus-Spiel zu zweit; Punkt-Element mit Verknüpfungs-Nummer, 00-register.js).
// Nutzerwünsche 07.11.: vier Trommeln, 7 Kästchen breit. Der Affe steht zwischen Trommel 1 und 2, das Schweinchen zwischen 3 und 4 –
// jeder spielt SEINE zwei Trommeln: links-Taste = linke Trommel, rechts-Taste = rechte Trommel.
// Ablauf: Wer in der Nähe ist, drückt die Hebel-Taste = „mitspielen“ -> die Figur läuft von selbst an ihren Platz, nimmt die
// Trommelstöcke und wartet auf den Partner (nochmal Hebel-Taste = wieder aussteigen, solange der Partner noch fehlt). Sind beide
// da: einzählen, Lied – bis zum Ende kann niemand weg (die Tasten hauen nur noch auf die Trommeln). Noten = Leuchtbeeren, die an
// moosigen Seilen herabgleiten; ist die Beere im Kranz, haut man. Blau = Affe, rosa = Schweinchen. Treffer = Bumm, daneben/zu
// spät/ohne Beere = Patzer; TROMMEL_PATZER Patzer -> Lied bricht ab. Geschafft -> Nummer umschalten (bzw. „bleibt an“).
// Steuerung und Bewegung über trommelVorher aus neueBewegungVorher (js/32); Pose (Arme, Schlag) in js/33 über `P._trommel`;
// die Stöcke werden an die echten Hände gezeichnet (P._handDev/P._hand2Dev aus js/33). Logik im festen Takt, Zeichnen ändert nichts.
// Rolle: beide gleich – Rhythmus und Absprache statt Hangeln/Segeln.
const TROMMEL_ANZAHL = 4, TROMMEL_BREITE_GES = 280;   // px (7 Kästchen)
const TROMMEL_X = [26, 106, 174, 254];                 // Trommel-Mitten ab der linken Kante
const TROMMEL_PLATZ = {m: 66, f: 214};                 // Platz der Figur ab der linken Kante (zwischen ihren zwei Trommeln)
const TROMMEL_EIGENE = {m: [0, 1], f: [2, 3]};         // welche Trommeln gehören wem (links, rechts)
const TROMMEL_HOCH = 27;           // px: Trommelfell über dem Boden (unter den Händen der sitzenden Figur, der Stock schlägt schräg von oben)
const TROMMEL_HOCKER = 17;         // px: Sitzhöhe des Baumstumpf-Hockers (Figur wird so viel höher gezeichnet)
const TROMMEL_RING = 104;          // px über dem Boden: Mitte der Kränze (über den Köpfen)
const TROMMEL_BAHN = 196;          // px: Weg der Beeren vom Balken bis zum Kranz
const trommelMitte = (S, d) => S.x + TROMMEL_X[d];
const trommelBalkenY = S => S.y - TROMMEL_RING - TROMMEL_BAHN - 24;
const TROMMEL_VORLAUF = 96;        // Schritte: so lange gleitet eine Beere bis zum Kranz
const TROMMEL_FENSTER = 8;         // Schritte (≈ 0,13 s) früher oder später zählt noch als Treffer
const TROMMEL_PATZER = 3;          // so viele Patzer, dann bricht das Lied ab
const TROMMEL_ZONE = 80;           // px: so weit neben der Station kann man „mitspielen“ drücken
const TROMMEL_ZAEHLEN = 4;         // Einzähl-Schläge vor dem Lied
const TROMMEL_LAUF = 4.2;          // px/Schritt: so schnell laufen die Figuren von selbst an ihren Platz
// Lieder: Teile mit Abstand je Feld (Schritte; 60 = 1 Spielsekunde) und Muster. A1/A2 = Affe linke/rechte Trommel,
// S1/S2 = Schweinchen linke/rechte Trommel, A1+S2 = gleichzeitig, A1+A2 = beide Hände zugleich, . = Pause.
const TROMMEL_LIEDER = {
  leicht: [
    {feld: 24, muster: 'A1 . . . S1 . . . A2 . . . S2 . . . A1 . S1 . A2 . S2 . A1+S1 . . .'},
    {feld: 18, muster: 'A1 . A2 . S1 . S2 . A1 S2 A2 S1 A1+S2 . . .'},
  ],
  mittel: [
    {feld: 20, muster: 'A1 . S2 . A2 . S1 . A1 A2 S1 S2 . . A1+S1 . . .'},
    {feld: 14, muster: 'A1 S2 A2 S1 A1 . S2 . A2+S1 . A1+S2 . . .'},
    {feld: 24, muster: 'S1 . A2 . S2 . A1 . A1+A2 . S1+S2 . . .'},
    {feld: 12, muster: 'A1 A2 S1 S2 A1 A2 S1 S2 A1+S1 . A2+S2 . . .'},
  ],
  schwer: [
    {feld: 16, muster: 'A1 S2 A2 S1 A2 S1 A1 S2 . . A1+S1 A2+S2 . .'},
    {feld: 11, muster: 'A1 A1 S2 S2 A2 S1 A2 S1 A1+S2 . A2+S1 . . .'},
    {feld: 22, muster: 'S1 . . A2 . . S2 A1 . . A1+A2+S1+S2 . . .'},
    {feld: 9,  muster: 'A1 A2 A1 A2 S1 S2 S1 S2 A1+S1 . A2+S2 . A1+S2 . A2+S1 . . .'},
  ],
};
const TROMMEL_FARBE = {m: '#5aa8f0', f: '#f07fb4'};
let trommeln = [];   // Stationen {x (linke Kante), y (Boden), link, lied, art, phase, t, noten, patzer, fertig, haut[4], blitz[], dabei{m,f}}

// Lied -> Noten {t (Schritt ab Liedstart), d (Trommel 0–3), wer 'm'|'f', offen, aus}
function trommelNoten(lied){
  const noten = []; let t = 0;
  for(const teil of TROMMEL_LIEDER[lied] || TROMMEL_LIEDER.mittel){
    for(const feld of teil.muster.trim().split(/\s+/)){
      if(feld !== '.') for(const n of feld.split('+')){
        const wer = n[0] === 'A' ? 'm' : 'f', d = TROMMEL_EIGENE[wer][Number(n.slice(1)) - 1];
        noten.push({t, d, wer, offen: true, aus: false});
      }
      t += teil.feld;
    }
  }
  return {noten, laenge: t};
}
function trommelDran(S, P){ return !!P && Math.abs(P.y - S.y) < 30 && P.x > S.x - TROMMEL_ZONE && P.x < S.x + TROMMEL_BREITE_GES + TROMMEL_ZONE; }
const trommelSpielt = S => S.phase === 'zaehlen' || S.phase === 'lied';
const trommelWer = P => P.male ? 'm' : 'f';
function trommelHebel(P){   // Hebel-Taste gerade gedrückt? (verbraucht den Merker)
  const K = P.keys || {}; let ja = false;
  for(const c of [K.use, K.padUse]) if(c && KEYS[c + '_pressed']){ KEYS[c + '_pressed'] = false; ja = true; }
  return ja;
}
// Haken aus neueBewegungVorher (js/32): true = diese Figur gehört gerade der Trommel (Tempo gesetzt, normale Steuerung aus)
function trommelVorher(P, jumpPressed){
  if(!trommeln.length) return false;
  const k = trommelWer(P);
  const S = trommeln.find(s => s.dabei[k]);
  if(!S){
    P._trommel = null;
    if(P._trommelDy){ P._standDy = 0; P._trommelDy = false; }   // vom Hocker aufgestanden
    const W = trommeln.find(s => s.phase === 'warten' && !s.fertig && trommelDran(s, P));
    if(W && P.grounded && !P.hookAttached && trommelHebel(P)){
      W.dabei[k] = true;
      P._trommel = {S: W, hit: [0, 0], da: false};
      if(typeof SFX !== 'undefined' && SFX.trommelKlick) SFX.trommelKlick(false);
    }
    return false;
  }
  const T = P._trommel = P._trommel && P._trommel.S === S ? P._trommel : {S, hit: [0, 0], da: false};
  const ziel = S.x + TROMMEL_PLATZ[k], dx = ziel - P.x;
  T.da = Math.abs(dx) < 3;
  P.vx = T.da ? dx : Math.max(-TROMMEL_LAUF, Math.min(TROMMEL_LAUF, dx*0.4)); P.vy = GRAVITY;
  if(!T.da) P.facing = dx > 0 ? 1 : -1;
  // auf den Hocker setzen (nur Anzeige: Figur wird um TROMMEL_HOCKER höher gezeichnet, Sitz-Pose in js/33)
  T.sitz = T.da ? Math.min(1, (T.sitz || 0) + 0.12) : 0;
  P._standDy = -TROMMEL_HOCKER*T.sitz*(2 - T.sitz); P._trommelDy = true;
  const K = P.keys || {};
  const links = !!(K.left && KEYS[K.left + '_pressed']), rechts = !!(K.right && KEYS[K.right + '_pressed']);
  if(K.left) KEYS[K.left + '_pressed'] = false; if(K.right) KEYS[K.right + '_pressed'] = false;
  if(S.phase === 'warten'){
    if(trommelHebel(P)){ S.dabei[k] = false; P._trommel = null; return false; }   // aussteigen, solange der Partner noch fehlt
    const P2 = P === p1 ? p2 : p1, T2 = P2 && P2._trommel;
    if(T.da && S.dabei.m && S.dabei.f && T2 && T2.S === S && T2.da) trommelStarten(S);
  } else {
    trommelHebel(P);   // während des Spiels tut die Hebel-Taste nichts (auch keine Hebel in der Nähe)
    if(S.phase === 'lied' && T.da){
      const [dl, dr] = TROMMEL_EIGENE[k];
      if(links){ trommelHauen(S, k, dl); T.hit[0] = performance.now(); }   // Zeitpunkt nur fürs Aussehen (Pose/Stock)
      if(rechts){ trommelHauen(S, k, dr); T.hit[1] = performance.now(); }
    }
  }
  return true;
}
function trommelStarten(S){
  const L = trommelNoten(S.lied);
  S.noten = L.noten; S.laenge = L.laenge; S.patzer = 0; S.phase = 'zaehlen'; S.t = 0;
  S.zaehlFeld = (TROMMEL_LIEDER[S.lied] || TROMMEL_LIEDER.mittel)[0].feld*2;
  for(const P of [p1, p2]) if(P){ const K = P.keys || {}; for(const c of [K.left, K.right, K.jump, K.use, K.padUse]) if(c) KEYS[c + '_pressed'] = false; }
  if(typeof SFX !== 'undefined' && SFX.trommelLos) SFX.trommelLos();
}
function trommelEnde(S){ S.dabei = {m: false, f: false}; for(const P of [p1, p2]) if(P && P._trommel && P._trommel.S === S) P._trommel = null; }
function trommelHauen(S, wer, d){
  S.haut[d] = 1;
  if(typeof SFX !== 'undefined' && SFX.trommelSchlag) SFX.trommelSchlag(d, trommelMitte(S, d));
  let best = null;   // passende Beere: diese Trommel, noch offen, im Fenster – die früheste
  for(const n of S.noten){
    if(n.d !== d || !n.offen) continue;
    if(Math.abs(S.t - n.t) <= TROMMEL_FENSTER && (!best || n.t < best.t)) best = n;
  }
  if(!best){ trommelPatzer(S, d); return; }
  best.offen = false; best.aus = true; S.blitz.push({d, k: 1});
}
function trommelPatzer(S, d){
  S.patzer++; S.blitz.push({d, k: 1, rot: true});
  if(typeof SFX !== 'undefined' && SFX.trommelPatzer) SFX.trommelPatzer();
  if(S.patzer >= TROMMEL_PATZER){ S.phase = 'aus'; S.t = 0; trommelEnde(S); if(typeof SFX !== 'undefined' && SFX.trommelAus) SFX.trommelAus(); }
}
function trommelGeschafft(S){
  S.phase = 'geschafft'; S.t = 0; trommelEnde(S);
  if(typeof SFX !== 'undefined' && SFX.trommelGeschafft) SFX.trommelGeschafft();
  if(!S.link) return;
  const an = S.art === 'bleibt' ? true : !linkOn[S.link];
  if(S.art === 'bleibt') S.fertig = true;
  if(!!linkOn[S.link] !== an) setLink(S.link, an);
  if(typeof spiegelAusloesen === 'function') spiegelAusloesen(S.link);
  zielHinweisMerken(S.link);
}
function trommelSchritt(){
  for(const S of trommeln){
    for(let d = 0; d < TROMMEL_ANZAHL; d++) S.haut[d] = Math.max(0, S.haut[d] - 0.12);
    for(const b of S.blitz) b.k -= 0.05;
    S.blitz = S.blitz.filter(b => b.k > 0);
    S.t++;
    if(S.phase === 'zaehlen'){
      if(S.t % S.zaehlFeld === 1 && S.t < S.zaehlFeld*TROMMEL_ZAEHLEN && typeof SFX !== 'undefined' && SFX.trommelKlick) SFX.trommelKlick(Math.floor(S.t/S.zaehlFeld) === TROMMEL_ZAEHLEN - 1);
      if(S.t >= S.zaehlFeld*TROMMEL_ZAEHLEN){ S.phase = 'lied'; S.t = 0; }
    } else if(S.phase === 'lied'){
      for(const n of S.noten){   // Beere verpasst = Patzer
        if(n.aus || S.t <= n.t + TROMMEL_FENSTER) continue;
        n.aus = true;
        if(n.offen){ trommelPatzer(S, n.d); if(S.phase !== 'lied') break; }
      }
      if(S.phase === 'lied' && S.t > S.laenge + TROMMEL_FENSTER) trommelGeschafft(S);
    } else if(S.phase === 'aus' || S.phase === 'geschafft'){
      if(S.t > 80) S.phase = 'warten';
    }
  }
}

// ---------- Aussehen (Nebelwald) ----------
// Nutzer 07.11.: „mehr Liebe zum Detail, UI muss passen … wir sind jetzt im Nebelwald, nicht mehr im Dschungel; wäre cool, wenn das
// einen Hintergrund hätte“. Alles gehört zur Welt: zwei alte, bemooste Holzpfosten mit einem knorrigen Ast als Balken, dahinter eine
// geflochtene Weidenwand (Flechtwerk) mit Moos, unten leuchtende Pilze, Glühwürmchen; vom Ast hängen vier moosige Seile, an denen
// Leuchtbeeren (Noten) herabgleiten; geflochtene Kränze = Trefferstellen; drei Lampions = Patzer-Leben; Knospen auf dem Ast blühen
// mit dem Fortschritt auf; ein Holzschild an Seilen zeigt „mitspielen“, wartet, zählt ein, „Geschafft!“ / „Nochmal!“.
// Trommeln und Figuren stehen auf demselben Boden nebeneinander: Trommel – Affe – Trommel · Trommel – Schweinchen – Trommel.
const TROMMEL_BAENDER = ['#9b4b36', '#4f7f6a', '#b0813a', '#6b5f99'];   // bemalte Bänder, je Trommel eine Farbe
const TROMMEL_GROESSE = [1.0, 0.92, 1.0, 0.92];
const TROMMEL_KIPP = [0.11, -0.11, 0.11, -0.11];   // jede Trommel ist leicht zur Figur gekippt, das Fell zeigt zu ihr hin
// Eine Handtrommel (Nebelwald, Nutzer: „mehr Liebe zum Detail, bessere Kontraste, gut ausgerichtet“): schlanker Holzkörper mit
// Taille (wie eine Conga), geschnitzter Fuß, Maserung und Ast-Auge, bemaltes Zackenband, Seilspannung im V-Muster zwischen zwei
// Seilringen, Lederrand mit Messingnägeln, helles Fell mit Fransen; Glanzkante links, kühles Randlicht rechts (hebt sich von der
// dunklen Wand ab). kipp = Neigung zur Figur, haut = Anschlag 0–1 (Fell federt, Ringe laufen).
function trommelBild(g, x, y, groesse, haut, farbeBand, kipp){
  const H = TROMMEL_HOCH, R = 13.5*groesse, yT = -H + 4, yW = -H*0.44, yB = -7;
  g.save(); g.translate(x, y);
  // Fuß: geschnitzter Holzring mit Kerben (steht gerade auf dem Boden)
  g.fillStyle = '#1c1209'; g.beginPath(); g.moveTo(-R*0.92, 0.5); g.lineTo(-R*0.82, yB - 1); g.lineTo(R*0.82, yB - 1); g.lineTo(R*0.92, 0.5); g.closePath(); g.fill();
  const fuss = g.createLinearGradient(-R, 0, R, 0); fuss.addColorStop(0, '#3a2414'); fuss.addColorStop(0.4, '#7a5030'); fuss.addColorStop(1, '#2a180c');
  g.fillStyle = fuss; g.beginPath(); g.moveTo(-R*0.86, -0.5); g.lineTo(-R*0.78, yB); g.lineTo(R*0.78, yB); g.lineTo(R*0.86, -0.5); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(20,10,4,.7)'; g.lineWidth = 1; for(let i = -3; i <= 3; i++){ g.beginPath(); g.moveTo(i*R*0.24, -1); g.lineTo(i*R*0.22, yB + 1); g.stroke(); }
  g.rotate(kipp || 0);
  // Körper mit Taille
  const koerper = d => { g.beginPath(); g.moveTo(-R - d, yT); g.bezierCurveTo(-R - d, yT + 8, -R*0.7 - d, yW - 4, -R*0.7 - d, yW);
    g.bezierCurveTo(-R*0.7 - d, yW + 6, -R*0.82 - d, yB - 2, -R*0.8 - d, yB + d); g.lineTo(R*0.8 + d, yB + d);
    g.bezierCurveTo(R*0.82 + d, yB - 2, R*0.7 + d, yW + 6, R*0.7 + d, yW); g.bezierCurveTo(R*0.7 + d, yW - 4, R + d, yT + 8, R + d, yT); g.closePath(); };
  g.fillStyle = '#140c06'; koerper(1.5); g.fill();
  const holz = g.createLinearGradient(-R, 0, R, 0);
  holz.addColorStop(0, '#3a2213'); holz.addColorStop(0.22, '#7c4f2c'); holz.addColorStop(0.36, '#b98352'); holz.addColorStop(0.5, '#93633a');
  holz.addColorStop(0.8, '#5a3920'); holz.addColorStop(1, '#2c190c');
  g.fillStyle = holz; koerper(0); g.fill();
  g.save(); koerper(0); g.clip();
  // Maserung + Ast-Auge
  g.lineWidth = 0.7;
  for(let i = 0; i < 9; i++){ const k = -0.95 + i*0.24; g.strokeStyle = i % 2 ? 'rgba(40,20,8,.35)' : 'rgba(255,220,170,.12)';
    g.beginPath(); g.moveTo(k*R, yT); g.bezierCurveTo(k*R, yT + 8, k*R*0.7, yW - 4, k*R*0.7, yW); g.bezierCurveTo(k*R*0.7, yW + 6, k*R*0.82, yB, k*R*0.8, yB); g.stroke(); }
  g.strokeStyle = 'rgba(40,20,8,.55)'; g.lineWidth = 0.8; g.beginPath(); g.ellipse(R*0.32, yW + 9, 2.4, 3.6, 0.2, 0, Math.PI*2); g.stroke();
  g.beginPath(); g.ellipse(R*0.32, yW + 9, 1, 1.8, 0.2, 0, Math.PI*2); g.stroke();
  // bemaltes Zackenband unter der Taille
  const zb = yW + 3;
  g.fillStyle = '#20140a'; g.fillRect(-R, zb - 0.8, 2*R, 7.6);
  for(let i = 0; i < 7; i++){ const xx = -R*0.85 + i*R*0.283; g.fillStyle = i % 2 ? farbeBand : '#e8dcc0';
    g.beginPath(); g.moveTo(xx - R*0.14, zb + 6.5); g.lineTo(xx, zb); g.lineTo(xx + R*0.14, zb + 6.5); g.closePath(); g.fill(); }
  // Glanzkante links, kühles Randlicht rechts
  const gl = g.createLinearGradient(-R, 0, R, 0); gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(0.3, 'rgba(255,236,205,.22)');
  gl.addColorStop(0.38, 'rgba(255,236,205,0)'); gl.addColorStop(0.9, 'rgba(170,200,220,0)'); gl.addColorStop(0.97, 'rgba(170,200,220,.35)'); gl.addColorStop(1, 'rgba(170,200,220,0)');
  g.fillStyle = gl; g.fillRect(-R - 2, yT, 2*R + 4, yB - yT);
  g.restore();
  // Seilspannung: unterer Seilring an der Taille, V-Seile zum Rand
  const seil = (x1, y1, x2, y2) => { g.strokeStyle = '#2a1a0c'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.strokeStyle = '#e6d6ae'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
  for(let i = 0; i < 6; i++){ const a = -R*0.85 + i*R*0.34, b = -R*0.62 + i*R*0.248; seil(a, yT + 5, b + R*0.06, yW - 1); seil(a + R*0.17, yT + 5, b + R*0.06, yW - 1); }
  g.strokeStyle = '#2a1a0c'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(-R*0.74, yW - 1); g.lineTo(R*0.74, yW - 1); g.stroke();
  g.strokeStyle = '#d4c094'; g.lineWidth = 1.8; g.setLineDash([2.4, 1.6]); g.beginPath(); g.moveTo(-R*0.74, yW - 1); g.lineTo(R*0.74, yW - 1); g.stroke(); g.setLineDash([]);
  // Lederrand mit Messingnägeln
  g.fillStyle = '#2a1608'; g.beginPath(); g.ellipse(0, yT + 3, R + 1.6, 6.5, 0, 0, Math.PI); g.lineTo(-R - 1.6, yT); g.ellipse(0, yT, R + 1.6, 6, 0, Math.PI, 0); g.closePath(); g.fill();
  g.fillStyle = '#5a3418'; g.fillRect(-R - 0.6, yT, 2*R + 1.2, 3.4);
  g.fillStyle = '#e8c870'; for(let i = 0; i < 7; i++){ const a = Math.PI*(0.12 + i*0.127); g.beginPath(); g.arc(-Math.cos(a)*(R + 0.4), yT + 2.4 + Math.sin(a)*3.4, 0.9, 0, Math.PI*2); g.fill(); }
  // Fell: hell, federt beim Anschlag, Fransen am Rand
  const dip = haut*2.4;
  g.fillStyle = '#1a0f06'; g.beginPath(); g.ellipse(0, yT, R + 0.8, 5.6, 0, 0, Math.PI*2); g.fill();
  const fell = g.createRadialGradient(-R*0.3, yT - 1.5, 1, 0, yT, R);
  fell.addColorStop(0, '#fffaf0'); fell.addColorStop(0.6, '#efe0c0'); fell.addColorStop(1, '#c9ad80');
  g.fillStyle = fell; g.beginPath(); g.ellipse(0, yT + dip*0.3, R - 0.6, 4.4 + dip*0.25, 0, 0, Math.PI*2); g.fill();
  g.strokeStyle = 'rgba(140,105,60,.4)'; g.lineWidth = 0.7; g.beginPath(); g.ellipse(-R*0.1, yT + dip*0.3, R*0.45, 1.8, 0, 0, Math.PI*2); g.stroke();   // Schlagfleck
  g.strokeStyle = 'rgba(220,200,160,.9)'; g.lineWidth = 0.8;
  for(let i = 0; i < 14; i++){ const a = Math.PI*(0.06 + i*0.068), fx = -Math.cos(a)*(R + 0.4), fy = yT + Math.sin(a)*4.8;
    g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + Math.sin(i*1.7)*0.8, fy + 2.6 + (i % 3)*0.6); g.stroke(); }
  if(haut > 0){
    g.globalAlpha = haut*0.85; g.strokeStyle = '#ffffff'; g.lineWidth = 1.1;
    g.beginPath(); g.ellipse(0, yT + dip*0.3, (R - 1.5)*(1.15 - haut*0.75), (4 + dip*0.25)*(1.15 - haut*0.75), 0, 0, Math.PI*2); g.stroke();
    g.globalAlpha = haut*0.5; g.fillStyle = '#fff6d0'; g.beginPath(); g.ellipse(0, yT + dip*0.3, R - 0.6, 4.4 + dip*0.25, 0, 0, Math.PI*2); g.fill(); g.globalAlpha = 1;
  }
  g.restore();
}
// Punkt des Fells (Welt), auf den ein Stock zielt: Mitte des Fells, etwas zur Figur hin
function trommelFellPunkt(S, d){
  const kipp = TROMMEL_KIPP[d], yT = -TROMMEL_HOCH + 4;
  return [S.x + TROMMEL_X[d] - Math.sin(kipp)*yT + (kipp > 0 ? 3 : -3), S.y + Math.cos(kipp)*yT];
}
function trommelStationBild(g, x, y, S){
  for(let d = 0; d < TROMMEL_ANZAHL; d++) trommelBild(g, x + TROMMEL_X[d], y, TROMMEL_GROESSE[d], S ? S.haut[d] : 0, TROMMEL_BAENDER[d], TROMMEL_KIPP[d]);
}
// Hocker: Baumscheibe mit Rinde, Jahresringen, Moos und einem kleinen Pilz (die Figur sitzt darauf)
function trommelHocker(x, y){
  const h = TROMMEL_HOCKER, r = 13;
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x, y, r + 5, 3.5, 0, 0, Math.PI*2); ctx.fill();
  const rinde = ctx.createLinearGradient(x - r, 0, x + r, 0);
  rinde.addColorStop(0, '#2a1d12'); rinde.addColorStop(0.35, '#6a5038'); rinde.addColorStop(0.7, '#4a3725'); rinde.addColorStop(1, '#22170e');
  ctx.fillStyle = '#140d07'; ctx.beginPath(); ctx.moveTo(x - r - 1, y - h); ctx.lineTo(x - r - 2.5, y); ctx.lineTo(x + r + 2.5, y); ctx.lineTo(x + r + 1, y - h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rinde; ctx.beginPath(); ctx.moveTo(x - r, y - h); ctx.lineTo(x - r - 1.5, y - 0.5); ctx.lineTo(x + r + 1.5, y - 0.5); ctx.lineTo(x + r, y - h); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(15,8,3,.6)'; ctx.lineWidth = 1; for(const k of [-0.7, -0.3, 0.1, 0.45, 0.8]){ ctx.beginPath(); ctx.moveTo(x + k*r, y - h + 2); ctx.lineTo(x + k*r*1.08, y - 1); ctx.stroke(); }
  // Sitzfläche: Jahresringe
  ctx.fillStyle = '#2a1d12'; ctx.beginPath(); ctx.ellipse(x, y - h, r + 0.8, 4.4, 0, 0, Math.PI*2); ctx.fill();
  const holz = ctx.createRadialGradient(x - 3, y - h - 1, 1, x, y - h, r); holz.addColorStop(0, '#e2c497'); holz.addColorStop(1, '#a87c4e');
  ctx.fillStyle = holz; ctx.beginPath(); ctx.ellipse(x, y - h, r - 0.6, 3.6, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(110,70,35,.45)'; ctx.lineWidth = 0.6; for(const f of [0.3, 0.55, 0.8]){ ctx.beginPath(); ctx.ellipse(x - 1, y - h, (r - 1)*f, 3.4*f, 0, 0, Math.PI*2); ctx.stroke(); }
  // Moos am Fuß + Pilz
  ctx.fillStyle = '#4f6a34'; ctx.beginPath(); ctx.ellipse(x - 6, y - 1, 9, 3, 0, Math.PI, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#6d8a45'; for(const k of [-11, -6, -1]){ ctx.beginPath(); ctx.ellipse(x + k, y - 2.5, 2.6, 1.6, 0, 0, Math.PI*2); ctx.fill(); }
  ctx.fillStyle = '#e8dcc6'; ctx.fillRect(x + r - 2, y - 6, 1.6, 5); ctx.fillStyle = '#c6643c'; ctx.beginPath(); ctx.ellipse(x + r - 1.2, y - 6, 3.2, 2, 0, Math.PI, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#f2e6d0'; ctx.beginPath(); ctx.arc(x + r - 2.2, y - 7, 0.6, 0, Math.PI*2); ctx.fill();
}
// alter Holzpfosten: verwittertes, helleres Holz mit Rissen, Randlicht und Moos (hebt sich von der Wand ab)
function trommelPfosten(x, y0, y1, r){
  const gr = ctx.createLinearGradient(x - r, 0, x + r, 0);
  gr.addColorStop(0, '#2c241c'); gr.addColorStop(0.3, '#7d6b58'); gr.addColorStop(0.55, '#665645'); gr.addColorStop(0.88, '#3e342a'); gr.addColorStop(1, '#8fa0a8');
  ctx.fillStyle = '#120d08'; ctx.fillRect(x - r - 1.2, y0, 2*r + 2.4, y1 - y0);
  ctx.fillStyle = gr; ctx.fillRect(x - r, y0, 2*r, y1 - y0);
  ctx.strokeStyle = 'rgba(20,12,6,.6)'; ctx.lineWidth = 1;
  for(const k of [-0.45, 0.05, 0.45]){ ctx.beginPath(); ctx.moveTo(x + k*r, y0 + 4); for(let y = y0 + 4; y < y1; y += 18) ctx.lineTo(x + k*r + Math.sin(y*0.08 + k*9)*1.1, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(230,215,190,.18)'; ctx.lineWidth = 0.8;
  for(const k of [-0.2, 0.25]){ ctx.beginPath(); ctx.moveTo(x + k*r, y0 + 10); for(let y = y0 + 10; y < y1; y += 18) ctx.lineTo(x + k*r + Math.sin(y*0.06 + k*7)*1, y); ctx.stroke(); }
  for(let i = 0; i < 3; i++){ const my = y0 + 40 + i*((y1 - y0 - 60)/3) + (i % 2)*16, s = i % 2 ? 1 : -1;   // Moos-Polster aus kleinen Bällchen
    for(let j = 0; j < 4; j++){ ctx.fillStyle = j % 2 ? '#56723a' : '#7a9a4c'; ctx.beginPath(); ctx.arc(x + s*r*0.55 + (j - 1.5)*2, my + Math.sin(j*2 + i)*2.5, 2.4, 0, Math.PI*2); ctx.fill(); } }
  ctx.fillStyle = '#4f6a34'; ctx.beginPath(); ctx.ellipse(x, y1 - 1, r + 5, 4, 0, Math.PI, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#6d8a45'; for(let j = -2; j <= 2; j++){ ctx.beginPath(); ctx.arc(x + j*3.6, y1 - 3 - Math.abs(j)*-0.3, 2, 0, Math.PI*2); ctx.fill(); }
}
// knorriger Ast als Querbalken (heller als die Wand, mit Licht oben)
function trommelAst(x0, x1, y, r){
  ctx.save(); ctx.lineCap = 'round';
  const w = x => y + Math.sin(x*0.021)*3 + Math.sin(x*0.007 + 1)*2;
  const zug = (dy, breite, farbe) => { ctx.strokeStyle = farbe; ctx.lineWidth = breite; ctx.beginPath(); for(let x = x0; x <= x1; x += 8) ctx.lineTo(x, w(x) + dy); ctx.stroke(); };
  zug(0, 2*r + 2.5, '#120d08'); zug(0, 2*r, '#5e4e3e'); zug(r*0.35, r*0.9, 'rgba(30,20,12,.5)'); zug(-r*0.45, 1.6, 'rgba(210,195,170,.45)');
  ctx.strokeStyle = 'rgba(25,15,8,.55)'; ctx.lineWidth = 0.8; for(let x = x0 + 10; x < x1; x += 23){ ctx.beginPath(); ctx.moveTo(x, w(x) - r*0.4); ctx.lineTo(x + 9, w(x + 9) + r*0.3); ctx.stroke(); }
  for(let x = x0 + 12; x < x1; x += 34){ for(let j = 0; j < 4; j++){ ctx.fillStyle = j % 2 ? '#56723a' : '#7a9a4c'; ctx.beginPath(); ctx.arc(x + (j - 1.5)*3, w(x) - r + 1 - (j % 2), 2.4, 0, Math.PI*2); ctx.fill(); } }
  ctx.strokeStyle = '#4a3c30'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x1 - 14, w(x1 - 14)); ctx.lineTo(x1 + 6, w(x1) - 12); ctx.stroke();
  ctx.restore();
  return w;
}
// geflochtene Weidenwand (Hintergrund): Stäbe, Ruten mit Licht oben und Schatten unten, Zwischenräume dunkel; warmes Licht der
// Lampions fällt darauf; oben läuft sie in den Nebel aus
function trommelFlechtwand(x0, x1, yOben, yUnten, t, lichter){
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, yOben, x1 - x0, yUnten - yOben); ctx.clip();
  const grund = ctx.createLinearGradient(0, yOben, 0, yUnten);
  grund.addColorStop(0, 'rgba(22,18,14,0)'); grund.addColorStop(0.16, 'rgba(22,18,14,.85)'); grund.addColorStop(1, 'rgba(18,14,10,.96)');
  ctx.fillStyle = grund; ctx.fillRect(x0, yOben, x1 - x0, yUnten - yOben);
  const sichtbar = y => Math.min(1, Math.max(0, (y - yOben)/((yUnten - yOben)*0.2)));
  for(let x = x0 + 18; x < x1; x += 36){ ctx.globalAlpha = 1; ctx.fillStyle = '#2e251b'; ctx.fillRect(x - 3, yOben, 6, yUnten - yOben); ctx.fillStyle = 'rgba(160,140,110,.25)'; ctx.fillRect(x - 2.5, yOben, 1, yUnten - yOben); }
  for(let r = 0, y = yOben + 6; y < yUnten; r++, y += 9){
    ctx.globalAlpha = sichtbar(y);
    for(let s = 0; s < (x1 - x0)/36 + 1; s++){   // jedes Rutenstück zwischen zwei Stäben einzeln: vor/hinter dem Stab im Wechsel
      const a = x0 + s*36 - 18, b = a + 36, vorn = (s + r) % 2, mid = (a + b)/2, bog = vorn ? -1.8 : 1.8;
      const c = r % 3 === 0 ? ['#6b5843', '#8f7a5e'] : r % 3 === 1 ? ['#5e4c3a', '#82705a'] : ['#735f48', '#988266'];
      ctx.strokeStyle = '#17110b'; ctx.lineWidth = 7.4; ctx.beginPath(); ctx.moveTo(a, y); ctx.quadraticCurveTo(mid, y + bog, b, y); ctx.stroke();
      ctx.strokeStyle = c[0]; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(a, y); ctx.quadraticCurveTo(mid, y + bog, b, y); ctx.stroke();
      ctx.strokeStyle = c[1]; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(a + 3, y - 2); ctx.quadraticCurveTo(mid, y + bog - 2, b - 3, y - 2); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  // warmes Licht der Lampions auf dem Geflecht
  for(const [lx, ly] of lichter){ const gl = ctx.createRadialGradient(lx, ly, 4, lx, ly, 70); gl.addColorStop(0, 'rgba(255,190,110,.32)'); gl.addColorStop(1, 'rgba(255,190,110,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(lx, ly, 70, 0, Math.PI*2); ctx.fill(); }
  for(let i = 0; i < 6; i++){   // Moos-Polster und kleine Farne auf dem Geflecht
    const mx = x0 + 24 + ((i*97) % (x1 - x0 - 48)), my = yUnten - 26 - ((i*53) % ((yUnten - yOben)*0.55));
    for(let j = 0; j < 6; j++){ ctx.fillStyle = j % 2 ? '#56723a' : '#7a9a4c'; ctx.beginPath(); ctx.arc(mx + (j - 2.5)*3.2, my + Math.sin(j*2.1 + i)*2, 2.6, 0, Math.PI*2); ctx.fill(); }
  }
  // Boden-Schatten am Fuß der Wand
  const fuss = ctx.createLinearGradient(0, yUnten - 30, 0, yUnten); fuss.addColorStop(0, 'rgba(0,0,0,0)'); fuss.addColorStop(1, 'rgba(0,0,0,.45)');
  ctx.fillStyle = fuss; ctx.fillRect(x0, yUnten - 30, x1 - x0, 30);
  ctx.restore();
}
// Leuchtpilze am Fuß der Wand (Nebelwald), pulsieren sanft
function trommelLeuchtpilze(x0, y, t){
  for(const [dx, s] of [[48, 1], [58, 0.7], [140, 0.85], [150, 1.1], [232, 0.75], [244, 1]]){
    const x = x0 + dx, p = 0.75 + 0.25*Math.sin(t*1.7 + dx), h = 9*s;
    const gl = ctx.createRadialGradient(x, y - h, 1, x, y - h, 16*s); gl.addColorStop(0, `rgba(150,230,220,${0.4*p})`); gl.addColorStop(1, 'rgba(150,230,220,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y - h, 16*s, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#d8e6dc'; ctx.fillRect(x - 1.2*s, y - h, 2.4*s, h);
    ctx.fillStyle = `rgba(140,225,215,${0.85*p + 0.15})`; ctx.beginPath(); ctx.ellipse(x, y - h, 5*s, 3.2*s, 0, Math.PI, Math.PI*2); ctx.fill();
  }
}
// moosiges Seil, an dem die Beeren gleiten; glut = leuchtet nach einem Schlag
function trommelSeil(x, y0, y1, t, glut, phase){
  const steps = Math.ceil((y1 - y0)/14), sw = Math.sin(t*1.1 + phase)*1.6;
  const px = i => x + Math.sin(i*0.5 + t + phase)*0.9 + sw*(i/steps);
  if(glut > 0){ ctx.strokeStyle = `rgba(210,240,200,${0.2 + glut*0.5})`; ctx.lineWidth = 6; ctx.beginPath(); for(let i = 0; i <= steps; i++) ctx.lineTo(px(i), y0 + i*14); ctx.stroke(); }
  ctx.strokeStyle = '#2b241c'; ctx.lineWidth = 2.6; ctx.beginPath(); for(let i = 0; i <= steps; i++) ctx.lineTo(px(i), y0 + i*14); ctx.stroke();
  ctx.strokeStyle = '#8a7a62'; ctx.lineWidth = 1.1; ctx.setLineDash([3, 3]); ctx.beginPath(); for(let i = 0; i <= steps; i++) ctx.lineTo(px(i), y0 + i*14); ctx.stroke(); ctx.setLineDash([]);
  for(let i = 1; i < steps; i += 2){ const bx = px(i), by = y0 + i*14, s = i % 4 === 1 ? 1 : -1;   // Bartflechte/Moos-Fasern
    ctx.strokeStyle = i % 3 ? 'rgba(140,160,120,.8)' : 'rgba(110,135,90,.8)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + s*4, by + 5, bx + s*2, by + 11); ctx.stroke(); }
}
// geflochtener Kranz (Trefferstelle); warm = Beere kommt gleich / gerade getroffen
function trommelKranz(x, y, warm, farbe){
  if(warm > 0){ const gl = ctx.createRadialGradient(x, y, 4, x, y, 30); gl.addColorStop(0, `rgba(255,236,190,${0.45*warm})`); gl.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI*2); ctx.fill(); }
  ctx.strokeStyle = '#1e170f'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI*2); ctx.stroke();
  ctx.strokeStyle = '#7a6a52'; ctx.lineWidth = 2.1; for(let i = 0; i < 2; i++){ ctx.beginPath();
    for(let a = 0; a <= Math.PI*2 + 0.01; a += Math.PI/16) ctx.lineTo(x + Math.cos(a)*(18 + Math.sin(a*6 + i*Math.PI)*1.6), y + Math.sin(a)*(18 + Math.sin(a*6 + i*Math.PI)*1.6)); ctx.stroke(); }
  for(let i = 0; i < 8; i++){ const a = i/8*Math.PI*2 + 0.2; ctx.fillStyle = i % 2 ? '#56723a' : '#6b8746';
    ctx.beginPath(); ctx.ellipse(x + Math.cos(a)*19, y + Math.sin(a)*19, 4.2, 2, a + Math.PI/2, 0, Math.PI*2); ctx.fill(); }
  ctx.fillStyle = farbe; ctx.beginPath(); ctx.arc(x, y + 19, 2.4, 0, Math.PI*2); ctx.fill();
}
// Tasten-Name dieser Figur für ihre linke (0) bzw. rechte (1) Trommel
function trommelTasteName(P, seite){
  if(!P) return '';
  const n = P.male ? monkeyPlayer : 3 - monkeyPlayer, pad = typeof padConnected !== 'undefined' && padConnected[n - 1];
  if(pad){ const typ = padTypAktuell[n - 1]; return padName(seite ? 15 : 14, typ).replace('Kreuz ', ''); }
  const K = P.keys || {}; return tasteName(seite ? K.right : K.left);
}
function trommelBeere(x, y, wer, d, k){
  const col = TROMMEL_FARBE[wer], r = 14;
  ctx.save(); ctx.globalAlpha = k;
  const sch = ctx.createLinearGradient(0, y - 46, 0, y); sch.addColorStop(0, 'rgba(255,255,255,0)'); sch.addColorStop(1, col);
  ctx.globalAlpha = k*0.32; ctx.fillStyle = sch; ctx.beginPath(); ctx.moveTo(x - 5, y - 46); ctx.lineTo(x + 5, y - 46); ctx.lineTo(x + r*0.8, y); ctx.lineTo(x - r*0.8, y); ctx.fill();
  const gl = ctx.createRadialGradient(x, y, 2, x, y, r*2.2); gl.addColorStop(0, col); gl.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = k*0.45; ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, r*2.2, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = k;
  ctx.strokeStyle = '#3a3020'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y - r + 1); ctx.quadraticCurveTo(x + 2, y - r - 5, x + 1, y - r - 8); ctx.stroke();
  ctx.fillStyle = '#6b8746'; ctx.beginPath(); ctx.ellipse(x + 6, y - r - 4, 5.5, 2.4, -0.5, 0, Math.PI*2); ctx.fill();
  const kg = ctx.createRadialGradient(x - 4.5, y - 5, 1, x, y, r); kg.addColorStop(0, '#ffffff'); kg.addColorStop(0.3, col); kg.addColorStop(1, 'rgba(25,20,40,.95)');
  ctx.fillStyle = kg; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.ellipse(x - 5, y - 6, 3.2, 1.8, -0.6, 0, Math.PI*2); ctx.fill();
  const P = wer === 'f' ? koopSchweinchen() : koopAffe();
  const txt = trommelTasteName(P, TROMMEL_EIGENE[wer].indexOf(d));
  ctx.font = `bold ${txt.length > 3 ? 9 : 12}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 2.6; ctx.strokeText(txt, x, y + 1); ctx.fillStyle = '#fff'; ctx.fillText(txt, x, y + 1);
  ctx.restore();
}
// Holzschild an zwei Seilen unter dem Ast; pendelt leicht
function trommelSchild(xm, yAst, zeilen, farbe, t){
  ctx.save();
  const breit = Math.max(70, ...zeilen.map(z => { ctx.font = `bold ${z.gross ? 30 : 13}px sans-serif`; return ctx.measureText(z.text).width + 28; }));
  const hoch = 14 + zeilen.reduce((s, z) => s + (z.gross ? 34 : 17), 0), y = yAst + 32;
  ctx.translate(xm, yAst + 6); ctx.rotate(Math.sin(t*1.6)*0.03); ctx.translate(-xm, -(yAst + 6));
  ctx.strokeStyle = '#8a7a62'; ctx.lineWidth = 1.6;
  for(const s of [-1, 1]){ ctx.beginPath(); ctx.moveTo(xm + s*breit*0.32, yAst + 6); ctx.lineTo(xm + s*breit*0.36, y); ctx.stroke(); }
  const holz = ctx.createLinearGradient(0, y, 0, y + hoch); holz.addColorStop(0, '#7a6450'); holz.addColorStop(1, '#4e3f31');
  ctx.fillStyle = '#16100b'; roundRect(xm - breit/2 - 2, y - 2, breit + 4, hoch + 4, 6); ctx.fill();
  ctx.fillStyle = holz; roundRect(xm - breit/2, y, breit, hoch, 5); ctx.fill();
  ctx.strokeStyle = 'rgba(25,15,8,.35)'; ctx.lineWidth = 0.8; for(let i = 1; i < 4; i++){ ctx.beginPath(); ctx.moveTo(xm - breit/2 + 4, y + i*hoch/4); ctx.lineTo(xm + breit/2 - 4, y + i*hoch/4 + Math.sin(i)*2); ctx.stroke(); }
  ctx.fillStyle = 'rgba(107,135,70,.85)'; ctx.beginPath(); ctx.ellipse(xm - breit/2 + 10, y + 2, 12, 4, 0, 0, Math.PI*2); ctx.fill();   // Moos an der Ecke
  ctx.fillStyle = '#2a2018'; for(const s of [-1, 1]){ ctx.beginPath(); ctx.arc(xm + s*(breit/2 - 6), y + 7, 1.8, 0, Math.PI*2); ctx.fill(); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; let yy = y + 7;
  for(const z of zeilen){ const h = z.gross ? 34 : 17; ctx.font = `bold ${z.gross ? 30 : 13}px sans-serif`;
    ctx.fillStyle = 'rgba(20,12,5,.55)'; ctx.fillText(z.text, xm + 1, yy + h/2 + 1);
    ctx.fillStyle = z.farbe || farbe; ctx.fillText(z.text, xm, yy + h/2); yy += h; }
  ctx.restore();
}
// HINTER den Figuren: Flechtwand, Pfosten, Ast, Seile, Lampions, Knospen, Leuchtpilze, Glühwürmchen
function trommelHintenZeichnen(S, x0, t){
  const yA = trommelBalkenY(S), ring = S.y - TROMMEL_RING, W = TROMMEL_BREITE_GES;
  trommelFlechtwand(x0 - 4, x0 + W + 4, yA - 40, S.y, t, [66, 140, 214].map(dx => [x0 + dx, yA + 30]));
  // warmes Gegenlicht hinter den Spielplätzen: Figuren und Trommeln heben sich von der dunklen Wand ab
  for(const dx of [TROMMEL_PLATZ.m, TROMMEL_PLATZ.f]){ const gl = ctx.createRadialGradient(x0 + dx, S.y - 34, 6, x0 + dx, S.y - 30, 78);
    gl.addColorStop(0, 'rgba(255,214,150,.42)'); gl.addColorStop(0.5, 'rgba(255,200,130,.16)'); gl.addColorStop(1, 'rgba(255,200,130,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x0 + dx, S.y - 30, 78, 0, Math.PI*2); ctx.fill(); }
  trommelLeuchtpilze(x0, S.y, t);
  trommelHocker(x0 + TROMMEL_PLATZ.m, S.y); trommelHocker(x0 + TROMMEL_PLATZ.f, S.y);
  trommelPfosten(x0 - 10, yA - 8, S.y, 7); trommelPfosten(x0 + W + 10, yA - 8, S.y, 7);
  const w = trommelAst(x0 - 30, x0 + W + 30, yA, 7);
  for(let d = 0; d < TROMMEL_ANZAHL; d++){ const sx = x0 + TROMMEL_X[d]; trommelSeil(sx, w(sx) + 5, ring - 20, t, S.haut[d], d*1.7); }
  // Bartflechte am Ast
  for(let i = 0; i < 9; i++){ const bx = x0 - 12 + i*36 + (i % 2)*9, by = w(bx) + 5, len = 14 + (i*7 % 11);
    ctx.strokeStyle = i % 2 ? 'rgba(150,168,130,.75)' : 'rgba(120,140,100,.75)'; ctx.lineWidth = 1;
    for(let k = -1; k <= 1; k++){ ctx.beginPath(); ctx.moveTo(bx + k*2, by); ctx.quadraticCurveTo(bx + k*3 + Math.sin(t + i)*1.5, by + len*0.6, bx + k*2.5, by + len); ctx.stroke(); } }
  // Knospen auf dem Ast = Fortschritt
  const spielt = trommelSpielt(S);
  const auf = S.phase === 'lied' ? Math.min(1, S.t/S.laenge) : (S.phase === 'geschafft' || S.fertig ? 1 : 0);
  for(let i = 0; i < 11; i++){ const bx = x0 - 4 + i*28.8, by = w(bx) - 8, offen = auf*11 > i;
    ctx.fillStyle = '#56723a'; ctx.beginPath(); ctx.ellipse(bx - 4, by + 2, 4, 1.8, -0.4, 0, Math.PI*2); ctx.fill();
    if(offen){ for(let k = 0; k < 5; k++){ const a = k/5*Math.PI*2 + t*0.3; ctx.fillStyle = i % 3 ? '#e8c8dc' : '#f0e2a8';
        ctx.beginPath(); ctx.ellipse(bx + Math.cos(a)*3.2, by - 2 + Math.sin(a)*3.2, 2.6, 1.6, a, 0, Math.PI*2); ctx.fill(); }
      ctx.fillStyle = '#fff3a0'; ctx.beginPath(); ctx.arc(bx, by - 2, 1.4, 0, Math.PI*2); ctx.fill(); }
    else { ctx.fillStyle = '#6d8a45'; ctx.beginPath(); ctx.ellipse(bx, by - 2, 2, 3, 0, 0, Math.PI*2); ctx.fill(); } }
  // Lampions zwischen den Seilen = Patzer-Leben
  for(let i = 0; i < TROMMEL_PATZER; i++){
    const lx = x0 + [66, 140, 214][i], an = i < TROMMEL_PATZER - (spielt || S.phase === 'aus' ? S.patzer : 0), pend = Math.sin(t*2 + i)*(an ? 1.5 : 4), ly = w(lx) + 28;
    ctx.strokeStyle = '#8a7a62'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx, w(lx) + 5); ctx.lineTo(lx + pend, ly - 9); ctx.stroke();
    if(an){ const gl = ctx.createRadialGradient(lx + pend, ly, 1, lx + pend, ly, 22); gl.addColorStop(0, 'rgba(255,196,120,.55)'); gl.addColorStop(1, 'rgba(255,196,120,0)');
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(lx + pend, ly, 22, 0, Math.PI*2); ctx.fill(); }
    ctx.fillStyle = an ? '#f0a85a' : '#4a4038'; ctx.beginPath(); ctx.ellipse(lx + pend, ly, 6, 8.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = an ? '#b0652a' : '#2e2620'; ctx.lineWidth = 1; for(const s of [-3, 0, 3]){ ctx.beginPath(); ctx.ellipse(lx + pend, ly, Math.abs(s) + 1, 8.5, 0, 0, Math.PI*2); ctx.stroke(); }
    ctx.fillStyle = '#2a2018'; ctx.fillRect(lx + pend - 3, ly - 10, 6, 2.5); ctx.fillRect(lx + pend - 2.5, ly + 8, 5, 2);
  }
  // Glühwürmchen
  for(let i = 0; i < 6; i++){ const fx = x0 + 20 + ((i*83 + t*14*(i % 2 ? 1 : -1)) % (W - 40) + (W - 40)) % (W - 40), fy = yA + 50 + ((i*61) % 150) + Math.sin(t*1.3 + i*2)*10;
    const p = 0.5 + 0.5*Math.sin(t*3 + i*1.7); ctx.fillStyle = `rgba(230,255,170,${0.25 + 0.6*p})`; ctx.beginPath(); ctx.arc(fx, fy, 1.6 + p, 0, Math.PI*2); ctx.fill(); }
  if(typeof elementEdelstein === 'function') elementEdelstein(x0 + W/2, w(x0 + W/2), 4.5, linkColor(S.link));
}
// Schlag-Verlauf fürs Aussehen: 0 -> 1 (Stock auf der Haut nach 0,06 s) -> 0 in 0,19 s
function trommelHauKurve(t0){ const k = (performance.now() - t0)/190; return k >= 0 && k < 1 ? (k < .3 ? Math.sin(k/.3*Math.PI/2) : Math.cos((k - .3)/.7*Math.PI/2)) : 0; }
// Trommelstöcke in den echten Händen der Figur (Geräte-Pixel aus js/33, Nutzer: „die Stöcke müssen wirklich in der Hand liegen
// und ausgerichtet sein“): der Stock geht von der Hand genau zum Fell seiner Trommel – in Ruhe schwebt der Filzkopf eine
// Handbreit über dem Fell, beim Schlag landet er auf dem Fell. Griff mit Lederwicklung, Stock verjüngt sich, Filzkopf in der
// Spielerfarbe; die Pfote liegt über dem Griff.
const TROMMEL_PFOTE = {m: ['#6a3f22', '#3e2412'], f: ['#f7aac4', '#cf7d9b']};
function trommelStoecke(S, P, x0){
  const T = P._trommel, h1 = P._handDev, h2 = P._hand2Dev;
  if(!T || !T.da || !h1 || !h2) return;
  const W = ctx.getTransform(), sk = Math.hypot(W.a, W.b);
  const [L, R] = h1.x < h2.x ? [h1, h2] : [h2, h1];
  const eigene = TROMMEL_EIGENE[trommelWer(P)], pf = TROMMEL_PFOTE[trommelWer(P)];
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.lineCap = 'round';
  for(const [H, seite] of [[L, 0], [R, 1]]){
    const [fx, fy] = trommelFellPunkt(S, eigene[seite]), hau = trommelHauKurve(T.hit[seite]);
    const schweben = 13 + Math.sin(performance.now()*0.007 + seite*1.3)*1.5;   // Ruhe: Kopf über dem Fell, wippt im Takt
    const z = W.transformPoint(new DOMPoint(fx - camX, fy - 4.5 - schweben*(1 - hau)));
    let dx = z.x - H.x, dy = z.y - H.y; const lang = Math.max(14*sk, Math.hypot(dx, dy)); const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
    const ex = H.x + dx*lang, ey = H.y + dy*lang, bx = H.x - dx*5*sk, by = H.y - dy*5*sk, qx = -dy, qy = dx;
    const stock = (b0, b1, farbe) => { ctx.fillStyle = farbe; ctx.beginPath();
      ctx.moveTo(bx + qx*b0, by + qy*b0); ctx.lineTo(ex + qx*b1, ey + qy*b1); ctx.lineTo(ex - qx*b1, ey - qy*b1); ctx.lineTo(bx - qx*b0, by - qy*b0); ctx.closePath(); ctx.fill(); };
    stock(2.4*sk, 1.6*sk, '#1e1208'); stock(1.6*sk, 0.95*sk, '#c8995f');
    ctx.strokeStyle = 'rgba(255,235,200,.55)'; ctx.lineWidth = 0.6*sk; ctx.beginPath(); ctx.moveTo(bx + qx*0.7*sk, by + qy*0.7*sk); ctx.lineTo(ex + qx*0.4*sk, ey + qy*0.4*sk); ctx.stroke();
    for(let i = 0; i < 3; i++){ const gx = bx + dx*(1.5 + i*2.2)*sk, gy = by + dy*(1.5 + i*2.2)*sk;   // Lederwicklung am Griff
      ctx.strokeStyle = '#4a2a14'; ctx.lineWidth = 1.2*sk; ctx.beginPath(); ctx.moveTo(gx + qx*1.9*sk, gy + qy*1.9*sk); ctx.lineTo(gx - qx*1.9*sk + dx*sk, gy - qy*1.9*sk + dy*sk); ctx.stroke(); }
    // Filzkopf (leicht oval in Stockrichtung) mit Glanz
    const ang = Math.atan2(dy, dx);
    ctx.fillStyle = '#1e1208'; ctx.beginPath(); ctx.ellipse(ex, ey, 4.9*sk, 4.3*sk, ang, 0, Math.PI*2); ctx.fill();
    const kopf = ctx.createRadialGradient(ex - 1.4*sk, ey - 1.4*sk, 0.5, ex, ey, 4.2*sk);
    kopf.addColorStop(0, '#ffffff'); kopf.addColorStop(0.35, P.male ? '#9ccaf6' : '#f8b2d2'); kopf.addColorStop(1, P.male ? '#3f78b4' : '#b8507e');
    ctx.fillStyle = kopf; ctx.beginPath(); ctx.ellipse(ex, ey, 4*sk, 3.5*sk, ang, 0, Math.PI*2); ctx.fill();
    // Pfote über dem Griff
    ctx.fillStyle = pf[1]; ctx.beginPath(); ctx.arc(H.x, H.y, 3.4*sk, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = pf[0]; ctx.beginPath(); ctx.arc(H.x - 0.4*sk, H.y - 0.4*sk, 2.7*sk, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
// VOR den Figuren: Trommeln, Stöcke, Kränze, Beeren, Treffer, Schild
function trommelVorneZeichnen(){
  const t = performance.now()/1000;
  for(const S of trommeln){
    const x0 = Math.round(S.x - camX);
    if(x0 < -320 || x0 > VW + 320) continue;
    const yA = trommelBalkenY(S), ring = S.y - TROMMEL_RING, spielt = trommelSpielt(S), xm = x0 + TROMMEL_BREITE_GES/2;
    for(let d = 0; d < TROMMEL_ANZAHL; d++) glanzSchatten(x0 + TROMMEL_X[d], S.y, 24, 4);
    trommelStationBild(ctx, x0, S.y, S);
    for(const P of [p1, p2]) if(P && P._trommel && P._trommel.S === S) trommelStoecke(S, P, x0);
    for(let d = 0; d < TROMMEL_ANZAHL; d++){
      let warm = S.haut[d];
      if(S.phase === 'lied') for(const n of S.noten){ if(n.aus || n.d !== d) continue; const r = n.t - S.t; if(r > 24) break; if(r >= -TROMMEL_FENSTER) warm = Math.max(warm, 1 - Math.abs(r)/24); }
      trommelKranz(x0 + TROMMEL_X[d], ring, warm, TROMMEL_FARBE[d < 2 ? 'm' : 'f']);
    }
    if(S.phase === 'lied') for(const n of S.noten){
      if(n.aus) continue;
      const rest = n.t - S.t;
      if(rest > TROMMEL_VORLAUF) break;
      const y = ring - Math.max(-TROMMEL_FENSTER, rest)/TROMMEL_VORLAUF*(ring - yA - 24);
      trommelBeere(x0 + TROMMEL_X[n.d], y, n.wer, n.d, Math.min(1, (TROMMEL_VORLAUF - rest)/14));
    }
    for(const b of S.blitz){
      const bx = x0 + TROMMEL_X[b.d], k = b.k, u = 1 - k;
      ctx.save(); ctx.globalAlpha = k;
      if(b.rot){ ctx.strokeStyle = '#ff5a48'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(bx, ring, 18 + u*6, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = '#7a6a52'; ctx.beginPath(); ctx.ellipse(bx + Math.sin(u*9)*8, ring + 20 + u*40, 5, 2.4, u*5, 0, Math.PI*2); ctx.fill(); }
      else { ctx.strokeStyle = '#fff3c4'; ctx.lineWidth = 3*k + 1; ctx.beginPath(); ctx.arc(bx, ring, 18 + u*20, 0, Math.PI*2); ctx.stroke();
        for(let i = 0; i < 8; i++){ const a = i/8*Math.PI*2 + b.d; ctx.fillStyle = i % 2 ? '#fff3c4' : '#ffffff';
          ctx.beginPath(); ctx.arc(bx + Math.cos(a)*(14 + u*30), ring + Math.sin(a)*(14 + u*30), 2.4*k + 0.5, 0, Math.PI*2); ctx.fill(); }
        ctx.fillStyle = 'rgba(220,205,170,.7)'; for(let i = 0; i < 5; i++){ ctx.beginPath(); ctx.arc(bx - 14 + i*7, S.y - TROMMEL_HOCH - u*14 - (i % 2)*4, 2*k, 0, Math.PI*2); ctx.fill(); } }
      ctx.restore();
    }
    if(S.phase === 'zaehlen'){
      trommelSchild(xm, yA, [{text: String(Math.max(1, TROMMEL_ZAEHLEN - Math.floor(S.t/S.zaehlFeld))), gross: true}, {text: 'Achtung …'}], '#f2e4c0', t);
    } else if(S.phase === 'geschafft'){
      trommelSchild(xm, yA, [{text: 'Geschafft!', gross: true}], '#f0dc98', t);
      for(let i = 0; i < 16; i++){ const px = x0 + ((i*61) % TROMMEL_BREITE_GES), py = yA + ((S.t*2.2 + i*43) % (S.y - yA - 20)), a = S.t*0.08 + i;
        ctx.fillStyle = i % 3 ? '#e8c8dc' : '#f0e2a8'; ctx.beginPath(); ctx.ellipse(px + Math.sin(a)*8, py, 3.2, 1.8, a, 0, Math.PI*2); ctx.fill(); }
    } else if(S.phase === 'aus'){
      trommelSchild(xm, yA, [{text: 'Nochmal!', gross: true}, {text: 'Hebel-Taste = mitspielen'}], '#f0b0a0', t);
    } else if(S.phase === 'warten' && !S.fertig){
      const A = koopAffe(), F = koopSchweinchen(), nah = trommelDran(S, A) || trommelDran(S, F) || S.dabei.m || S.dabei.f;
      if(nah){
        const zeile = (P, k) => S.dabei[k] ? {text: (k === 'm' ? 'Affe' : 'Schwein') + ': bereit ✓', farbe: k === 'm' ? '#a8d4ff' : '#ffc2dc'}
                                           : {text: (k === 'm' ? 'Affe' : 'Schwein') + ': Hebel-Taste = mitspielen', farbe: k === 'm' ? '#a8d4ff' : '#ffc2dc'};
        trommelSchild(xm, yA, [{text: '♪ Trommeln zu zweit ♪'}, zeile(A, 'm'), zeile(F, 'f'),
                               {text: `${trommelTasteName(A, 0)}/${trommelTasteName(A, 1)} · ${trommelTasteName(F, 0)}/${trommelTasteName(F, 1)} = linke/rechte Trommel`, farbe: '#e8dcc0'}], '#f2e4c0', t);
      }
    }
  }
}
elementRegistrieren({
  id: 'trommel', name: 'Trommel-Station', feld: 'trommeln',
  editor: {
    werkzeug: 'trommel', gruppe: 'logik', vor: '#linkSelect', art: 'punkt', ziehbar: false, farbe: '#6e5440',
    mitNummer: true, nummerName: 'Trommel',
    titel: 'Trommel-Station (7 Kästchen breit, ab dem geklickten Kästchen nach rechts): beide drücken daneben die Hebel-Taste = mitspielen. ' +
           'Affe spielt Trommel 1+2, Schweinchen 3+4 (links/rechts-Taste) – Lied geschafft schaltet die Nummer um',
    optionen: [
      {key: 'lied', label: 'Lied', titel: 'leicht ≈ 15 s, mittel ≈ 20 s mit Tempowechseln, schwer ≈ 20 s schnell',
       werte: [['mittel', 'mittel'], ['leicht', 'leicht'], ['schwer', 'schwer']]},
      {key: 'art', label: 'geschafft', titel: 'Nummer umschalten (nochmal spielen = zurück) – oder einmal an und bleibt an',
       werte: [['umschalten', 'umschalten'], ['bleibt', 'bleibt an']]},
    ],
    bereich: p => [0, 1, 2, 3, 4, 5, 6].flatMap(k => [[p.c + k, p.r], [p.c + k, p.r - 1]]),
    zeichnen(ctx, c, r, TILE, p){
      ctx.save(); ctx.translate(c*TILE, r*TILE + TILE); ctx.scale(TILE/40, TILE/40);
      trommelStationBild(ctx, 0, 0, null); ctx.restore();
      const col = typeof linkColor === 'function' ? linkColor(p.link) : '#ff9f43';
      ctx.fillStyle = col; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 3; ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const t = p.link + ' ♪ ' + (p.lied || 'mittel') + (p.art === 'bleibt' ? ' · bleibt' : '');
      ctx.strokeText(t, c*TILE + 2, r*TILE - 8); ctx.fillText(t, c*TILE + 2, r*TILE - 8);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE + TILE, link: p.link,
      ...(p.lied && p.lied !== 'mittel' ? {lied: p.lied} : {}), ...(p.art === 'bleibt' ? {art: 'bleibt'} : {})})),
  },
  spiel: {
    laden(daten){
      trommeln = (daten.trommeln || []).map(t => ({x: t.x, y: t.y, link: t.link, lied: TROMMEL_LIEDER[t.lied] ? t.lied : 'mittel',
        art: t.art === 'bleibt' ? 'bleibt' : 'umschalten', phase: 'warten', t: 0, noten: [], laenge: 0, patzer: 0, fertig: false,
        haut: [0, 0, 0, 0], blitz: [], zaehlFeld: 40, dabei: {m: false, f: false}}));
    },
    zuruecksetzen(){
      for(const P of [p1, p2]) if(P){ P._trommel = null; if(P._trommelDy){ P._standDy = 0; P._trommelDy = false; } }
      for(const S of trommeln){ S.phase = 'warten'; S.t = 0; S.patzer = 0; S.fertig = false; S.noten = []; S.blitz = []; S.haut = [0, 0, 0, 0]; S.dabei = {m: false, f: false}; }
    },
    schritt(){ if(trommeln.length) trommelSchritt(); },
    zeichnen(){   // hinter den Figuren: Hintergrund-Wand, Pfosten, Ast, Seile, Lampions …
      const t = performance.now()/1000;
      for(const S of trommeln){
        const x0 = Math.round(S.x - camX);
        if(x0 < -320 || x0 > VW + 320) continue;
        trommelHintenZeichnen(S, x0, t);
        if(!S.fertig && !trommelSpielt(S)) elementLeuchten(x0 + TROMMEL_BREITE_GES/2, S.y - 30, 110, linkColor(S.link));
      }
    },
    zeichnenVorne(){ if(trommeln.length) trommelVorneZeichnen(); },
  },
});
