// 04c-bruch.js – Spielwiese Teil 5: Durchbrechbares mit dem Dash.
// Kästchen 'x' (Risse) sind fest; nur ein Dash zerbricht sie (Wände seitlich, Böden von oben, Decken von unten).
// Wirkung: Trefferstopp, Wackeln, Bruchstücke, ein Teil des Tempos bleibt, kurzes Durchbruch-Fenster für Dash/Sprung.
// Varianten: A bleibt kaputt (bis R) · B wächst nach · C nur bei hohem Tempo (Dash + Schwung davor).

let kaputt = [];   // {c, r, zeit} zerbrochene Kästchen (zum Nachwachsen und für R)

function bruchErlaubt(d){
  if(MECHANIKEN.bruch.aktiv !== 2) return true;
  return V.dashTempo * (d.faktor || 1) + (d.extra || 0) >= V.bruchTempo;
}
// vor dem Bewegen im Dash: alle Risse-Kästchen, in die die Figur in diesem Schritt hineinfahren würde, zerbrechen
function bruchVorDash(){
  const d = fig.dash; if(!d) return;
  const x0 = Math.min(fig.x, fig.x + fig.vx) + 0.5, x1 = Math.max(fig.x, fig.x + fig.vx) + FIG_B - 0.5;
  const y0 = Math.min(fig.y, fig.y + fig.vy) + 0.5, y1 = Math.max(fig.y, fig.y + fig.vy) + FIG_H - 0.5;
  const treffer = [];
  for(let r = Math.floor(y0 / K); r <= Math.floor(y1 / K); r++)
    for(let c = Math.floor(x0 / K); c <= Math.floor(x1 / K); c++) if(zelle(c, r) === 'x') treffer.push([c, r]);
  if(!treffer.length) return;
  if(!bruchErlaubt(d)){ d.zuLangsam = true; return; }   // C: prallt ab (wird nach dem Bewegen behandelt)
  for(const [c, r] of treffer) kastenZerbrechen(c, r, d.dx, d.dy);
  d.faktor = (d.faktor || 1) * V.bruchBehalten;
  fig.vx = d.dx * V.dashTempo * d.faktor; fig.vy = d.dy * V.dashTempo * d.faktor;
  fig.durchbruch = V.bruchFenster;
  trefferStopp(V.bruchStopp); wackeln(V.bruchWackeln); ton('bruch');
  dehnen(fig, Math.abs(d.dx) > Math.abs(d.dy) ? 1.3 : 0.8, Math.abs(d.dx) > Math.abs(d.dy) ? 0.8 : 1.3);
}
function kastenZerbrechen(c, r, dx, dy){
  karte[r][c] = '.';
  kaputt.push({c, r, zeit: Math.round(V.nachwachsZeit * 60)});
  bruchstuecke(c * K + K / 2, r * K + K / 2, dx, dy, V.bruchStuecke);
  staubWolke(c * K + K / 2, r * K + K, 4, 0);
}
// ohne Dash (oder zu langsam in C) gegen Risse: abprallen
function bruchAbprallen(stoss, vxVor, vyVor){
  const d = fig.dash;
  if(d && !d.zuLangsam) return;
  if(stoss.stossX){
    const s = Math.sign(vxVor), c = s > 0 ? Math.floor((fig.x + FIG_B + 1) / K) : Math.floor((fig.x - 1) / K);
    const r0 = Math.floor(fig.y / K), r1 = Math.floor((fig.y + FIG_H - 1) / K);
    let risse = false; for(let r = r0; r <= r1; r++) if(zelle(c, r) === 'x') risse = true;
    if(risse && Math.abs(vxVor) > 2){
      if(d) dashBeenden(false);
      fig.vx = -s * Math.min(6, Math.abs(vxVor) * V.abprall); fig.sperre = 6;
      wackeln(0.1); ton('tock'); staubWolke(s > 0 ? fig.x + FIG_B : fig.x, fig.y + FIG_H / 2, 3, -s);
    }
  }
  if(stoss.stossY < 0 && vyVor < -2){
    const r = Math.floor((fig.y - 1) / K), c = Math.floor((fig.x + FIG_B / 2) / K);
    if(zelle(c, r) === 'x'){ if(d) dashBeenden(false); fig.vy = Math.min(4, -vyVor * V.abprall * 0.5); ton('tock'); }
  }
  if(d) d.zuLangsam = false;
}
function bruchSchritt(){
  if(fig.durchbruch > 0 && !fig.dash) fig.durchbruch--;   // das Fenster zählt ab dem Ende des Dashs
  if(MECHANIKEN.bruch.aktiv !== 1) return;
  for(const k of kaputt){
    if(k.zeit > 0) k.zeit--;
    if(k.zeit === 0 && karte[k.r][k.c] === '.'){
      const x = k.c * K, y = k.r * K;
      const drin = fig.x < x + K && fig.x + FIG_B > x && fig.y < y + K && fig.y + FIG_H > y;
      if(!drin){ karte[k.r][k.c] = 'x'; k.zeit = -1; staubWolke(x + K / 2, y + K / 2, 3, 0); ton('wachsen'); }
    }
  }
  kaputt = kaputt.filter(k => k.zeit !== -1);
}
function bruchAlleHeilen(){
  for(const k of kaputt) if(karte[k.r][k.c] === '.') karte[k.r][k.c] = 'x';
  kaputt = [];
}

// Zeichnen: Steinblock mit Rissen
function risseZeichnen(c, r){
  const x = c * K, y = r * K;
  ctx.fillStyle = '#a08a74'; ctx.fillRect(x, y, K + 0.6, K + 0.6);
  ctx.fillStyle = '#8a745f'; ctx.fillRect(x, y + K - 5, K, 5); ctx.fillRect(x, y, 4, K);
  ctx.strokeStyle = '#4b3a2b'; ctx.lineWidth = 2; ctx.beginPath();
  ctx.moveTo(x + 8, y + 4); ctx.lineTo(x + 17, y + 16); ctx.lineTo(x + 13, y + 25); ctx.lineTo(x + 22, y + 36);
  ctx.moveTo(x + 17, y + 16); ctx.lineTo(x + 31, y + 12);
  ctx.moveTo(x + 34, y + 26); ctx.lineTo(x + 24, y + 29);
  ctx.stroke();
}
