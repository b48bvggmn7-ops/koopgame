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
function wechselZeichnen(){
  for(const s of solids){
    if(s.type !== 'wechsel') continue;
    const x = Math.round(s.x - camX);
    if(x + s.w < -20 || x > VW + 20) continue;
    const L = WECHSEL_LOOK[s.gruppe] || WECHSEL_LOOK.A, warn = wechselWarnung(s);
    // Blinken: schneller, je näher der Wechsel ist (nur Anzeige, aus der Takt-Uhr berechnet)
    const blink = warn > 0 ? (Math.floor(wechselSchritte / (warn > 0.6 ? 4 : 8)) % 2 === 0) : false;
    const seit = wechselSchritte - (s.wechselT || -999), frisch = Math.max(0, 1 - seit/12);
    if(!s.gone){
      ctx.globalAlpha = blink ? 0.45 : 1;
      const gr = ctx.createLinearGradient(0, s.y, 0, s.y + s.h);
      gr.addColorStop(0, L.hell); gr.addColorStop(1, L.mitte);
      ctx.fillStyle = gr; roundRect(x + 1, s.y + 1, s.w - 2, s.h - 2, 5); ctx.fill();
      wechselMuster(ctx, x + 1, s.y + 1, s.w - 2, s.h - 2, s.gruppe, 'rgba(255,255,255,.28)');
      ctx.strokeStyle = L.dunkel; ctx.lineWidth = 2.5; roundRect(x + 1.5, s.y + 1.5, s.w - 3, s.h - 3, 5); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(x + 5, s.y + 3, s.w - 10, 2);
      if(frisch > 0){ ctx.globalAlpha = frisch*0.7; ctx.fillStyle = '#fff'; roundRect(x + 1, s.y + 1, s.w - 2, s.h - 2, 5); ctx.fill(); }
      ctx.globalAlpha = 1;
    } else {
      // weg: nur ein gestrichelter Umriss mit zartem Muster („Geist“) – man sieht, wo der Boden wieder erscheint
      const a = s.wartet ? 0.6 + 0.35*Math.sin(wechselSchritte*0.5) : (blink ? 0.95 : 0.55);
      ctx.globalAlpha = a*0.5;
      wechselMuster(ctx, x + 3, s.y + 3, s.w - 6, s.h - 6, s.gruppe, L.hell);
      ctx.globalAlpha = a;
      ctx.save(); ctx.setLineDash([5, 4]); ctx.lineWidth = 2.5;
      ctx.strokeStyle = L.dunkel; roundRect(x + 2, s.y + 2, s.w - 4, s.h - 4, 5); ctx.stroke();
      ctx.lineDashOffset = 4.5; ctx.strokeStyle = L.hell; roundRect(x + 2, s.y + 2, s.w - 4, s.h - 4, 5); ctx.stroke(); ctx.restore();
      if(frisch > 0){   // gerade verschwunden: kleiner Funken-Ring
        ctx.globalAlpha = frisch*0.6; ctx.strokeStyle = L.hell; ctx.lineWidth = 3;
        roundRect(x - 3*(1 - frisch), s.y - 3*(1 - frisch), s.w + 6*(1 - frisch), s.h + 6*(1 - frisch), 6); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // Takt-Kästchen: kleine Uhr am Anfang einer Reihe
    if(s.takt > 0 && s.reiheStart){
      const cx = x + 10, cy = s.y + 10;
      ctx.fillStyle = 'rgba(20,28,38,.75)'; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
      const ang = (wechselSchritte % wechselTaktSchritte(s)) / wechselTaktSchritte(s) * Math.PI*2 - Math.PI/2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang)*5, cy + Math.sin(ang)*5); ctx.stroke();
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
    },
    schritt: wechselSchritt,
    zuruecksetzen: wechselZuruecksetzen,
    zeichnen: wechselZeichnen,
  },
});
