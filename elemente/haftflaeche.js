// elemente/haftflaeche.js – Element „Haftfläche“ (Nacht-Ausbau; Kachel-Element, siehe 00-register.js).
// Wand-/Deckenkästchen mit klebriger lila Schicht. Wer darunter „hoch“ hält (Affe: W / Seil ranziehen, Schweinchen: ↑,
// Controller: Steuerkreuz hoch), hält sich von unten fest, rollt links/rechts entlang – langsamer als Laufen (HAFT_TEMPO),
// mit etwas Schwung, um Kanten der Haftfläche herum (auch an ihren Seiten weiter) – und fällt beim Loslassen. Springen =
// Absprung, Dash geht auch von dort. Sonst ist eine Haftfläche eine ganz normale Wand (Boden obendrauf, Wandsprung an
// der Seite). Die Bewegung selbst steht in js/32-neue-bewegung.js (haftStarten, haftSchritt, haftNachher).
// Rolle: Wege an der Decke über Gefahren – beide Figuren können sich festhalten; typisch hält einer sich oben fest und
// rollt zum Hebel, während der andere unten wartet, oder die Haftfläche ist der Anschluss nach einem Seil-Schwung bzw.
// nach dem Segeln im Aufwind.
// Im Spiel: solids mit type 'wall' und haft: true (Kollision und Aussehen wie Wand, dazu die lila Schicht).
const HAFT_LILA = {schicht: '#8f4fd6', hell: '#c99bff', dunkel: '#5a2a96'};
function haftSchichtZeichnen(){
  for(const s of solids){
    if(!s.haft || s.gone) continue;
    const x0 = Math.round(s.x - camX);
    if(x0 + s.w < -20 || x0 > VW + 20) continue;
    const t = performance.now();
    for(let cx = 0; cx < s.w; cx += 40) for(let cy = 0; cy < s.h; cy += 40){
      const c = Math.floor((s.x + cx)/40), r = Math.floor((s.y + cy)/40), x = x0 + cx, y = s.y + cy;
      const frei = (dc, dr) => !festIst(c + dc, r + dr);
      ctx.fillStyle = HAFT_LILA.schicht;
      if(frei(0, 1)){   // Unterseite: dicke Schicht mit hängenden Tropfen (die eigentliche Haftfläche)
        ctx.fillRect(x, y + 40 - 8, 40, 8);
        for(let k = 0; k < 3; k++){
          const dx = 7 + k*13 + ((c*7 + k*5) % 5), lang = 3 + 3*(0.5 + 0.5*Math.sin(t/600 + c + k*2));
          ctx.beginPath(); ctx.ellipse(x + dx, y + 40 + lang/2 - 1, 2.6, lang/2 + 1, 0, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = HAFT_LILA.hell; for(let k = 0; k < 3; k++) ctx.fillRect(x + 6 + k*12, y + 40 - 3, 5, 2);
        ctx.fillStyle = HAFT_LILA.schicht;
      }
      if(frei(-1, 0)) ctx.fillRect(x, y, 6, 40);
      if(frei(1, 0)) ctx.fillRect(x + 40 - 6, y, 6, 40);
      if(frei(0, -1)){ ctx.globalAlpha = 0.55; ctx.fillRect(x, y, 40, 4); ctx.globalAlpha = 1; }
      ctx.strokeStyle = HAFT_LILA.dunkel; ctx.lineWidth = 1.5;
      if(frei(0, 1)){ ctx.beginPath(); ctx.moveTo(x, y + 40 - 8); ctx.lineTo(x + 40, y + 40 - 8); ctx.stroke(); }
    }
  }
}
elementRegistrieren({
  id: 'haftflaeche', name: 'Haftfläche', feld: 'haftflaechen',
  editor: {
    werkzeug: 'haft', gruppe: 'gelaende', vor: 'fake', art: 'kachel', ziehbar: true,
    titel: 'Haftfläche: Wand/Decke mit klebriger Unterseite – „hoch“ halten = von unten festhalten, links/rechts entlangrollen ' +
           '(auch um Kanten), loslassen = fallen, Springen/Dash geht von dort. Sonst eine normale Wand',
    farbe: '#8f4fd6', kachelFarbe: 'rgba(143,79,214,0.55)',
    zeichnen(ctx, c, r, TILE){
      const X = c*TILE, Y = r*TILE;
      ctx.fillStyle = '#6b5a4a'; ctx.fillRect(X, Y, TILE, TILE);
      ctx.fillStyle = '#8f4fd6'; ctx.fillRect(X, Y + TILE - 9, TILE, 9);
      ctx.fillStyle = '#c99bff'; for(let k = 0; k < 3; k++) ctx.fillRect(X + 6 + k*12, Y + TILE - 4, 5, 2);
    },
    exportieren: (zellen, TILE, mergeRects) => mergeRects(zellen),
  },
  spiel: {
    laden(daten){ for(const h of (daten.haftflaechen || [])) solids.push({x: h.x, y: h.y, w: h.w, h: h.h, type: 'wall', haft: true}); },
    zeichnen: haftSchichtZeichnen,
  },
});
