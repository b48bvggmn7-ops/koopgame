// elemente/stroemung.js – Elemente „Strömung“ und „Wasserstand“ (Ausbau 5; Punkt-Elemente, siehe 00-register.js).
// Strömung: Kästchen mit Richtung (→ ← ↑ ↓) und Stärke (schwach / mittel / stark); schiebt Figuren, die im Wasser darin
//   schwimmen (nur im Wasser). Schwach kann man gut gegenan schwimmen, mittel nur knapp, gegen stark kommt man nicht an.
// Wasserstand (Pegel): Marke mit Verknüpfungs-Nummer. Ist die Nummer AN (Hebel = bleibt, Druckplatte = Schleuse, nur
//   solange jemand draufsteht), steigt bzw. sinkt das Wasser des Beckens darunter/darüber weich bis zur Oberkante der
//   Marke; AUS = zurück auf den gemalten Stand. Werte: STROEMUNG_KRAFT, STROEMUNG_EXTRA, WASSER_PEGEL_TEMPO (02-physik-werte.js).
// Rolle: einer legt den Hebel um / hält die Schleuse, der andere schwimmt hindurch; Strömungen trennen oder tragen.
let stroemungen = [];   // {x, y, w, h, dx, dy, staerke}
const STROEMUNG_RICHTUNG = {r: [1, 0], l: [-1, 0], o: [0, -1], u: [0, 1]};
const STROEMUNG_PFEIL = {r: '→', l: '←', o: '↑', u: '↓'};
const STROEMUNG_FARBE = {1: '#7fd6ff', 2: '#3fa9f5', 3: '#1f6fd6'};
// Strömung an der Körpermitte einer Figur auf ihr Tempo anwenden (aus schwimmPhysik)
function stroemungAnwenden(pl){
  const m = {x: pl.x, y: pl.y - pl.h*0.5};
  for(const s of stroemungen){
    if(m.x < s.x || m.x >= s.x + s.w || m.y < s.y || m.y >= s.y + s.h) continue;
    const k = STROEMUNG_KRAFT*s.staerke, max = SWIM_MAX_SPEED + STROEMUNG_EXTRA;
    pl.vx = Math.max(-max, Math.min(max, pl.vx + s.dx*k));
    pl.vy = Math.max(-max, Math.min(max, pl.vy + s.dy*k));
    pl.inStroemung = s;
    return;
  }
  pl.inStroemung = null;
}
// fließende Striche in Strömungsrichtung (nur im Wasser sichtbar)
function stroemungZeichnen(){
  const t = performance.now()*0.001;
  ctx.lineCap = 'round';
  for(const s of stroemungen){
    const x0 = s.x - camX;
    if(x0 + s.w < -20 || x0 > VW + 20) continue;
    const n = Math.max(2, Math.round(s.w*s.h/2600)), lang = 14 + s.staerke*6;
    for(let i = 0; i < n; i++){
      const fx = (i*0.618 + 0.13) % 1, fy = (i*0.381 + 0.29) % 1;
      const ph = (t*(0.35 + s.staerke*0.25) + i*0.17) % 1;
      let px = s.x + fx*s.w, py = s.y + fy*s.h;
      if(s.dx) px = s.x + ((fx + ph*s.dx + 1) % 1)*s.w; else py = s.y + ((fy + ph*s.dy + 1) % 1)*s.h;
      if(!imWasser(px, py)) continue;
      ctx.globalAlpha = 0.35*Math.sin(ph*Math.PI) + 0.1;
      ctx.strokeStyle = '#e8f8ff'; ctx.lineWidth = 1.6 + s.staerke*0.4;
      ctx.beginPath(); ctx.moveTo(px - camX - s.dx*lang, py - s.dy*lang); ctx.lineTo(px - camX, py); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
// Wasserstand je Becken weich zum Ziel bewegen (einmal pro Schritt)
function pegelSchritt(){
  for(const b of wasserBecken){
    if(!b.pegel.length) continue;
    const an = b.pegel.find(p => linkOn[p.link]);
    b.ziel = an ? an.y : b.top;
    if(b.surf !== b.ziel){
      if(!b.bewegt && SFX.pegel && b.maxX > camX && b.minX < camX + VW) SFX.pegel((b.minX + b.maxX)/2, b.ziel < b.surf);
      b.bewegt = true;
      const d = b.ziel - b.surf;
      b.surf += Math.abs(d) <= WASSER_PEGEL_TEMPO ? d : Math.sign(d)*WASSER_PEGEL_TEMPO;
    } else b.bewegt = false;
  }
}
// (Editor) Kästchen gleicher Richtung/Stärke zu Rechtecken zusammenfassen
function stroemungExport(liste, TILE, mergeRects){
  const gruppen = {};
  for(const p of liste){ const k = (p.richtung || 'r') + ',' + (p.staerke || 1); (gruppen[k] = gruppen[k] || []).push(p); }
  const out = [];
  for(const k in gruppen){
    const [richtung, staerke] = k.split(','), [dx, dy] = STROEMUNG_RICHTUNG[richtung] || [1, 0];
    for(const r of wasserSenkrechtZusammen(mergeRects(gruppen[k]))) out.push({...r, dx, dy, staerke: Number(staerke)});
  }
  return out.sort((a, b) => a.y - b.y || a.x - b.x);
}
elementRegistrieren({
  id: 'stroemung', name: 'Strömung', feld: 'currents',
  editor: {
    werkzeug: 'current', gruppe: 'wasser', art: 'punkt', ziehbar: true, farbe: '#3fa9f5',
    titel: 'Strömung: Kästchen im Wasser mit Richtung und Stärke (schwach: man kommt gut gegenan, mittel: knapp, stark: gar nicht). ' +
           'Klick auf ein vorhandenes Kästchen = Richtung drehen',
    optionen: [
      {key: 'richtung', label: 'Richtung', werte: [['r', '→ rechts'], ['l', '← links'], ['o', '↑ hoch'], ['u', '↓ runter']]},
      {key: 'staerke', label: 'Stärke', zahl: true, werte: [['1', 'schwach'], ['2', 'mittel'], ['3', 'stark']]},
    ],
    klick(p){ const o = ['r', 'u', 'l', 'o']; p.richtung = o[(o.indexOf(p.richtung || 'r') + 1) % 4]; },
    zeichnen(ctx, c, r, TILE, p){
      const X = c*TILE + TILE/2, Y = r*TILE + TILE/2;
      ctx.fillStyle = 'rgba(63,169,245,0.18)'; ctx.fillRect(c*TILE + 2, r*TILE + 2, TILE - 4, TILE - 4);
      ctx.fillStyle = STROEMUNG_FARBE[p.staerke] || STROEMUNG_FARBE[1];
      ctx.font = `bold ${14 + (p.staerke || 1)*3}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(STROEMUNG_PFEIL[p.richtung] || '→', X, Y + 1);
    },
    exportieren: stroemungExport,
  },
  spiel: {
    laden(daten){ stroemungen = (daten.currents || []).map(s => ({x: s.x, y: s.y, w: s.w, h: s.h, dx: s.dx || 0, dy: s.dy || 0, staerke: s.staerke || 1})); },
    zeichnenVorne(){ if(stroemungen.length) stroemungZeichnen(); },
  },
});
elementRegistrieren({
  id: 'pegel', name: 'Wasserstand', feld: 'waterLevels',
  editor: {
    werkzeug: 'waterlevel', gruppe: 'wasser', art: 'punkt', ziehbar: false, farbe: '#5ec8e5',
    mitNummer: true, nummerName: 'Wasserstand',
    titel: 'Wasserstand (Schleuse): ins Becken oder darüber setzen. Ist die Verknüpfung AN (Hebel, oder Druckplatte = nur solange ' +
           'jemand draufsteht), steigt/sinkt das Wasser bis zur Oberkante dieses Kästchens; AUS = zurück',
    zeichnen(ctx, c, r, TILE, p){
      const X = c*TILE, Y = r*TILE;
      ctx.strokeStyle = '#5ec8e5'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(X + 2, Y + 2); ctx.lineTo(X + TILE - 2, Y + 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#5ec8e5'; ctx.beginPath(); ctx.moveTo(X + 10, Y + 22); ctx.lineTo(X + 16, Y + 10); ctx.lineTo(X + 22, Y + 22); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(p.link), X + 30, Y + 18);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE, link: p.link})),
  },
  spiel: {
    laden(daten){
      for(const p of (daten.waterLevels || [])){
        // Becken, das an dieser Spalte liegt (bei mehreren das senkrecht nächste)
        let best = null, bd = Infinity;
        for(const b of wasserBecken){
          if(p.x < b.minX || p.x >= b.maxX) continue;
          const d = p.y < b.top ? b.top - p.y : p.y > b.bottom ? p.y - b.bottom : 0;
          if(d < bd){ bd = d; best = b; }
        }
        if(best) best.pegel.push({x: p.x, y: p.y, link: p.link});
      }
    },
    schritt: pegelSchritt,
    // zarte gestrichelte Linie: bis hierhin steigt/sinkt das Wasser, wenn die Nummer an ist (Farbe der Nummer)
    zeichnenVorne(){
      for(const b of wasserBecken) for(const pg of b.pegel){
        if(b.maxX < camX || b.minX > camX + VW || Math.abs(b.surf - pg.y) < 1) continue;
        ctx.save(); ctx.setLineDash([8, 6]); ctx.lineDashOffset = -performance.now()*0.02;
        ctx.strokeStyle = linkColor(pg.link); ctx.globalAlpha = 0.55; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(b.minX - camX, pg.y); ctx.lineTo(b.maxX - camX, pg.y); ctx.stroke(); ctx.restore();
      }
    },
  },
});
