// elemente/wechselboden.js – Element „Wechselboden“ (Ausbau 4; Punkt-Element mit Verknüpfungs-Nummer, siehe 00-register.js).
// Boden-Kästchen in zwei Gruppen, die sich gegenläufig ein- und ausblenden:
//   Gruppe A (türkis, Streifen) ist fest, solange ihre Nummer AUS ist; Gruppe B (orange, Punkte) ist fest, solange sie AN ist.
//   Geschaltet per Hebel oder Druckplatte mit derselben Nummer (Verknüpfungs-System, js/05-level-objekte.js).
//   Takt-Variante: wechselt von selbst alle X Sekunden (A und B abwechselnd), 1 Sekunde vorher blinkt sie zur Warnung.
// Unterscheidung nicht nur über die Farbe, sondern auch über das Muster (Streifen / Punkte) und den Buchstaben im Editor.
// SICHERHEIT: Steht eine Figur dort, wo der Boden gerade fest werden soll, wartet dieses Kästchen (wie eine Tür, die
// erst schließt, wenn niemand darin steht) – niemand wird eingeklemmt oder durch den Boden geschoben. Verschwinden
// darf der Boden sofort (dann fällt man eben, wie beim Bröckelboden).
// Rolle: Hebel/Druckplatte – einer schaltet, der andere läuft. Takt – das Schweinchen „wartet“ mit dem Schirm in der
// Luft, bis der Boden wieder da ist, der Affe wartet am Haken hängend.
// Im Spiel: solids mit type 'wechsel' {x, y, w, h, gruppe, link | takt, gone, wartet}.
const WECHSEL_WARN_STEPS = 60;   // so viele Physik-Schritte (1 Spielsekunde) vor dem Takt-Wechsel blinkt der Boden
const WECHSEL_LOOK = {
  A: {hell: '#5fd0dd', mitte: '#2fa3b5', dunkel: '#17606d'},   // türkis, Streifen
  B: {hell: '#ffb066', mitte: '#e07b2c', dunkel: '#86400f'},   // orange, Punkte
};
let wechselSchritte = 0;   // Takt-Uhr (Physik-Schritte seit Levelstart / Neustart / Checkpoint)
let wechselNummern = {};   // Ruinen-Überarbeitung: Nummer -> {A, B} – welche Gruppen hängen an dieser Nummer (für die Hebel-Anzeige)
// Welche Gruppe ist bei dieser Nummer gerade fest? 'A' / 'B' / null (keine Wechselböden an der Nummer)
function wechselAktiveGruppe(link){ return wechselNummern[link] ? (linkOn[link] ? 'B' : 'A') : null; }
// Anzeige am Hebel (elemente/hebel.js): zwei kleine Kacheln A ▨ und B ⠿ neben dem Sockel; die gerade feste Gruppe ist
// kräftig und groß, die andere nur ein blasser gestrichelter Umriss (wie die Geisteranzeige am Boden)
function wechselHebelAnzeige(xr, baseY, link){ return;
  const aktiv = wechselAktiveGruppe(link); if(!aktiv) return;
  const hat = wechselNummern[link];
  for(const [gr, dx] of [['A', -30], ['B', 30]]){
    if(!hat[gr]) continue;
    const L = WECHSEL_LOOK[gr], an = gr === aktiv, g = an ? 16 : 12, x = xr + dx - g/2, y = baseY - 20 - g;
    if(an){
      ctx.fillStyle = L.mitte; roundRect(x, y, g, g, 3); ctx.fill();
      wechselMuster(ctx, x, y, g, g, gr, 'rgba(255,255,255,.45)');
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; roundRect(x, y, g, g, 3); ctx.stroke();
      ctx.strokeStyle = L.dunkel; ctx.lineWidth = 1; roundRect(x - 1.5, y - 1.5, g + 3, g + 3, 4); ctx.stroke();
    } else {
      ctx.save(); ctx.globalAlpha = 0.75; ctx.setLineDash([3, 2]); ctx.strokeStyle = L.dunkel; ctx.lineWidth = 2;
      roundRect(x, y, g, g, 3); ctx.stroke(); ctx.restore();
    }
    ctx.fillStyle = an ? '#fff' : L.dunkel; ctx.font = 'bold ' + (an ? 10 : 8) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(gr, x + g/2, y + g/2 + 0.5);
  }
}
function wechselTaktSchritte(s){ return Math.max(30, Math.round(s.takt*60)); }
// Soll dieses Kästchen gerade fest sein?
function wechselSoll(s){
  if(s.takt > 0){
    const phase = Math.floor(wechselSchritte / wechselTaktSchritte(s)) % 2;
    return s.gruppe === 'B' ? phase === 1 : phase === 0;
  }
  const an = !!linkOn[s.link];
  return s.gruppe === 'B' ? an : !an;
}
// 0 … 1: wie weit die Vorwarnung vor dem nächsten Takt-Wechsel ist (0 = keine Warnung)
function wechselWarnung(s){
  if(!(s.takt > 0)) return 0;
  const n = wechselTaktSchritte(s), rest = n - (wechselSchritte % n);
  return rest <= WECHSEL_WARN_STEPS ? 1 - rest/WECHSEL_WARN_STEPS : 0;
}
function wechselFigurDrin(p, s){
  const ox = Math.min(p.x + p.w/2, s.x + s.w) - Math.max(p.x - p.w/2, s.x);
  const oy = Math.min(p.y, s.y + s.h) - Math.max(p.y - p.h, s.y);
  return ox > COLLIDE_EPS && oy > COLLIDE_EPS;
}
const wechselImBild = s => s.x + s.w > camX - 40 && s.x < camX + VW + 40;
// einmal pro Physik-Schritt (stepSim): Zustand an Nummer bzw. Takt anpassen – sicher, siehe oben
function wechselSchritt(players){
  wechselSchritte++;
  let an = null, weg = null, warn = null;
  for(const s of solids){
    if(s.type !== 'wechsel') continue;
    if(s.takt > 0 && wechselImBild(s) && (wechselTaktSchritte(s) - wechselSchritte % wechselTaktSchritte(s)) === WECHSEL_WARN_STEPS) warn = s;
    const soll = wechselSoll(s);
    if(soll === !s.gone){ s.wartet = false; continue; }
    if(!soll){ s.gone = true; s.wartet = false; s.wechselT = wechselSchritte; if(wechselImBild(s)) weg = s; }
    else if(players.some(p => p && wechselFigurDrin(p, s))) s.wartet = true;   // jemand steht drin: warten
    else { s.gone = false; s.wartet = false; s.wechselT = wechselSchritte; if(wechselImBild(s)) an = s; }
  }
  if(an) SFX.wechsel(true, an.x + an.w/2);
  if(weg) SFX.wechsel(false, weg.x + weg.w/2);
  if(warn) SFX.wechselWarn(warn.x + warn.w/2);
}
// Neustart / Tod: Uhr auf 0, alles in den Grundzustand (nach dem Aufstellen der Figuren aufgerufen)
function wechselZuruecksetzen(){
  wechselSchritte = 0;
  for(const s of solids){
    if(s.type !== 'wechsel') continue;
    const soll = wechselSoll(s), drin = soll && [p1, p2].some(p => p && wechselFigurDrin(p, s));
    s.gone = !soll || drin; s.wartet = drin; s.wechselT = -999;   // steht jemand drin: warten (wie im Spiel)
  }
}
// Muster: A = schräge Streifen, B = Punkte (auch ohne Farben unterscheidbar)
function wechselMuster(c, x, y, w, h, gruppe, farbe){
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = farbe; c.strokeStyle = farbe;
  if(gruppe === 'B'){
    for(let yy = y + 7; yy < y + h; yy += 13) for(let xx = x + ((yy - y) % 26 ? 13 : 6.5); xx < x + w; xx += 13){
      c.beginPath(); c.arc(xx, yy, 3, 0, Math.PI*2); c.fill();
    }
  } else {
    c.lineWidth = 4;
    for(let k = -h; k < w; k += 12){ c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + h, y); c.stroke(); }
  }
  c.restore();
}
function wechselEdelstein(cx, cy, s, a){   // wie auf den Türen: dunkle Platte mit Edelstein in der Hebel-Farbe; B = mit dunklem Kern
  const col = linkColor(s.link); ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = '#3a3f46'; ctx.beginPath(); ctx.roundRect(cx - 12, cy - 12, 24, 24, 5); ctx.fill(); ctx.strokeStyle = '#15171a'; ctx.lineWidth = 1; ctx.stroke();
  elementEdelstein(cx, cy, 8.5, col);
  if(s.gruppe === 'B'){ ctx.fillStyle = 'rgba(30,18,10,.85)'; ctx.beginPath(); ctx.moveTo(cx, cy - 3.6); ctx.lineTo(cx + 3.2, cy); ctx.lineTo(cx, cy + 3.6); ctx.lineTo(cx - 3.2, cy); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
let __wReihen = null, __wKey = '';
function wechselReihen(){
  const key = outK + wallK + soilK + solids.length;
  if(__wReihen && __wKey === key) return __wReihen;
  __wKey = key; const alle = solids.filter(o => o.type === 'wechsel'), gesehen = new Set(), reihen = [];
  const gleich = (a, b) => a.gruppe === b.gruppe && a.takt === b.takt && a.link === b.link;
  const find = (s, dx, dy) => alle.find(o => o !== s && gleich(o, s) && Math.abs(o.x - (s.x + dx)) < 1 && Math.abs(o.y - (s.y + dy)) < 1);
  // Nutzerwunsch („muss ein Block sein“): zusammenhängende Kästchen gleicher Gruppe/Nummer, die ein volles Rechteck bilden
  // (z. B. zwei Reihen übereinander), sind EIN Block mit einem Edelstein; andere Formen weiter Reihe für Reihe
  for(const s of alle){
    if(gesehen.has(s)) continue;
    const flaeche = [s], stapel = [s], drin = new Set([s]);
    while(stapel.length){
      const o = stapel.pop();
      for(const [dx, dy] of [[o.w, 0], [-o.w, 0], [0, o.h], [0, -o.h]]){ const n = find(o, dx, dy); if(n && !drin.has(n)){ drin.add(n); flaeche.push(n); stapel.push(n); } }
    }
    if(flaeche.length < 2) continue;
    const x0 = Math.min(...flaeche.map(o => o.x)), y0 = Math.min(...flaeche.map(o => o.y));
    const w = Math.max(...flaeche.map(o => o.x + o.w)) - x0, h = Math.max(...flaeche.map(o => o.y + o.h)) - y0;
    if(Math.abs(flaeche.reduce((z, o) => z + o.w*o.h, 0) - w*h) > 1 || w < 41 || h < 41) continue;   // kein Rechteck / nur eine Reihe: unten
    for(const o of flaeche) gesehen.add(o);
    const teile = flaeche.sort((a, b) => a.y - b.y || a.x - b.x);
    const c = document.createElement('canvas'); c.width = Math.ceil((w + 48)*2); c.height = Math.ceil((h + 48)*2);
    const piece = {m: [0, 0, w, h, 'soil'], c, done: 0}; pieceDraw(piece);
    reihen.push({teile, x: x0, y: y0, w, h, senkrecht: false, c});
  }
  for(const s of alle){
    if(gesehen.has(s)) continue;
    const senkrecht = !(find(s, s.w, 0) || find(s, -s.w, 0)) && !!(find(s, 0, s.h) || find(s, 0, -s.h));
    // Anfang der Reihe suchen, dann entlanglaufen
    let a = s; for(let k = 0; k < 200; k++){ const v = senkrecht ? find(a, 0, -a.h) : find(a, -a.w, 0); if(!v) break; a = v; }
    const teile = [a]; gesehen.add(a);
    for(let k = 0; k < 200; k++){ const l = teile[teile.length - 1], n = senkrecht ? find(l, 0, l.h) : find(l, l.w, 0); if(!n || gesehen.has(n)) break; teile.push(n); gesehen.add(n); }
    const w = senkrecht ? a.w : teile.reduce((z, o) => z + o.w, 0), h = senkrecht ? teile.reduce((z, o) => z + o.h, 0) : a.h;
    const c = document.createElement('canvas'); c.width = Math.ceil((w + 48)*2); c.height = Math.ceil((h + 48)*2);
    const piece = {m: [0, 0, w, h, senkrecht ? 'wall' : 'soil'], c, done: 0}; pieceDraw(piece);   // gleiche Zeichnung wie die beweglichen Plattformen: Gras-Kappe, Erde bzw. Wand, Outline
    reihen.push({teile, x: a.x, y: a.y, w, h, senkrecht, c});
  }
  return __wReihen = reihen;
}
function wechselZeichnen(){
  for(const R of wechselReihen()){
    const s = R.teile[0], x = Math.round(R.x - camX);
    if(x + R.w < -20 || x > VW + 20) continue;
    const gone = R.teile.every(o => o.gone);
    if(gone){   // weg: nur ein leichter, weicher Schatten; bei Hebel-Böden bleibt der Edelstein
      ctx.fillStyle = 'rgba(12,24,14,.15)'; ctx.beginPath(); ctx.roundRect(x + 1, R.y + 1, R.w - 2, R.h - 2, 7); ctx.fill();
      if(!(s.takt > 0) && s.link) wechselEdelstein(x + R.w/2, R.y + R.h/2, s, .5);
      continue;
    }
    ctx.drawImage(R.c, x - 24, R.y - 24, R.w + 48, R.h + 48);
    if(!(s.takt > 0) && s.link) wechselEdelstein(x + R.w/2, R.y + R.h/2, s, 1);
    if(s.takt > 0){   // Takt: ein Balken über die ganze Reihe, schrumpft bis zum Wechsel
      const rest = 1 - (wechselSchritte % wechselTaktSchritte(s)) / wechselTaktSchritte(s);
      const bx = R.senkrecht ? x + R.w/2 : x + 2, by = R.senkrecht ? R.y + 2 : R.y + R.h - 6, len = (R.senkrecht ? R.h : R.w) - 4;
      const ex = R.senkrecht ? 0 : 1, ey = R.senkrecht ? 1 : 0;
      ctx.save(); ctx.lineCap = 'butt';
      ctx.globalAlpha = .6; ctx.strokeStyle = '#2a2018'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + ex*len, by + ey*len); ctx.stroke();
      ctx.globalAlpha = 1; ctx.strokeStyle = '#fff2b8'; ctx.lineWidth = 3.6; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + ex*len*rest, by + ey*len*rest); ctx.stroke();
      ctx.restore();
    }
  }
}
ELEMENT_SOLID_TYPEN.add('wechsel');
elementRegistrieren({
  id: 'wechselboden', name: 'Wechselboden', feld: 'switchFloors',
  editor: {
    werkzeug: 'wechsel', gruppe: 'logik', vor: '#linkSelect', art: 'punkt', ziehbar: true,
    mitNummer: true, nummerName: 'Wechselboden', farbe: '#2fa3b5',
    nummerAktiv: p => !(p.takt > 0),   // Takt-Boden hängt an keiner Nummer
    titel: 'Wechselboden: Gruppe A ist fest, solange die Verknüpfung AUS ist, Gruppe B, solange sie AN ist (Hebel/Druckplatte). ' +
           'Oder im Takt: wechselt alle X Sekunden von selbst. Klick auf ein vorhandenes Kästchen = A/B tauschen',
    // eigene Einstellungen neben dem Knopf; neue Kästchen bekommen die gerade gewählten Werte
    optionen: [
      {key: 'gruppe', label: 'Gruppe', titel: 'A = fest, solange die Nummer aus ist (Streifen) · B = fest, solange sie an ist (Punkte)',
       werte: [['A', 'A ▨ türkis'], ['B', 'B ⠿ orange']]},
      {key: 'takt', label: 'Takt', zahl: true, titel: 'per Nummer (Hebel/Druckplatte) oder von selbst alle X Sekunden',
       werte: [['0', 'per Nummer'], ['1.5', 'alle 1,5 s'], ['2', 'alle 2 s'], ['3', 'alle 3 s'], ['4', 'alle 4 s'], ['6', 'alle 6 s']]},
    ],
    klick(p){ p.gruppe = p.gruppe === 'B' ? 'A' : 'B'; },   // Klick auf vorhandenes Kästchen
    zeichnen(ctx, c, r, TILE, p){
      const L = WECHSEL_LOOK[p.gruppe] || WECHSEL_LOOK.A, X = c*TILE, Y = r*TILE;
      ctx.fillStyle = L.mitte; ctx.fillRect(X + 1, Y + 1, TILE - 2, TILE - 2);
      wechselMuster(ctx, X + 1, Y + 1, TILE - 2, TILE - 2, p.gruppe, 'rgba(255,255,255,.3)');
      ctx.strokeStyle = L.dunkel; ctx.lineWidth = 2; ctx.strokeRect(X + 2, Y + 2, TILE - 4, TILE - 4);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText((p.gruppe || 'A') + (p.takt > 0 ? ' ⏱' + String(p.takt).replace('.', ',') : ' ' + p.link), X + TILE/2, Y + TILE/2 + 1);
    },
    // Spiel-Format: je Kästchen ein Rechteck (obere linke Ecke), Gruppe und Nummer bzw. Takt in Sekunden
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, w: TILE, h: TILE, gruppe: p.gruppe === 'B' ? 'B' : 'A',
      ...(p.takt > 0 ? {takt: p.takt} : {link: p.link})})),
  },
  spiel: {
    laden(daten){
      const liste = (daten.switchFloors || []).map(f => ({x: f.x, y: f.y, w: f.w || 40, h: f.h || 40, type: 'wechsel',
        gruppe: f.gruppe === 'B' ? 'B' : 'A', link: f.link, takt: Number(f.takt) || 0, wartet: false, wechselT: -999}));
      const gleich = (a, b) => a.gruppe === b.gruppe && a.link === b.link && a.takt === b.takt;
      for(const s of liste){
        s.reiheStart = !liste.some(o => gleich(o, s) && Math.abs(o.x + o.w - s.x) < 1 && Math.abs(o.y - s.y) < 1);
        // Länge der Reihe (für die Plakette mit der Nummer in der Mitte)
        let n = 1; while(liste.some(o => gleich(o, s) && Math.abs(o.x - (s.x + n*40)) < 1 && Math.abs(o.y - s.y) < 1)) n++;
        s.reiheBreite = n*40;
        s.gone = s.gruppe === 'B';   // Grundzustand: A fest, B weg (Neustart stellt es genau ein)
        solids.push(s);
      }
      wechselSchritte = 0;
      wechselNummern = {};
      for(const s of liste) if(!(s.takt > 0) && s.link){ (wechselNummern[s.link] = wechselNummern[s.link] || {})[s.gruppe] = true; }
    },
    schritt: wechselSchritt,
    zuruecksetzen: wechselZuruecksetzen,
    zeichnen: wechselZeichnen,
  },
});
