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
const HAFT_LILA = {schicht: '#e9a620', hell: '#fff1a8', dunkel: '#9a5a08'};
function haftSchichtZeichnen(){
  const t = performance.now();
  const H = HAFT_LILA;
  for(const s of solids){
    if(!s.haft || s.gone) continue;
    const x0 = Math.round(s.x - camX);
    if(x0 + s.w < -20 || x0 > VW + 20) continue;
    for(let cx = 0; cx < s.w; cx += 40) for(let cy = 0; cy < s.h; cy += 40){
      const c = Math.floor((s.x + cx)/40), r = Math.floor((s.y + cy)/40), x = x0 + cx, y = s.y + cy;
      const frei = (dc, dr) => !festIst(c + dc, r + dr);
      const oben = frei(0,-1), unten = frei(0,1), links = frei(-1,0), rechts = frei(1,0);
      // Honigschicht: weich, leicht durchscheinend, mit welligem Rand
      ctx.fillStyle = H.schicht; ctx.globalAlpha = .93;
      if(oben){ ctx.beginPath(); ctx.moveTo(x, y + 2);
        for(let i = 0; i <= 8; i++) ctx.lineTo(x + i*5, y + 6 + 2.5*Math.sin(c*2.1 + i*1.1 + (i%2)));
        ctx.lineTo(x + 40, y); ctx.lineTo(x, y); ctx.fill(); }
      if(links) { ctx.beginPath(); ctx.moveTo(x, y); for(let i = 0; i <= 8; i++) ctx.lineTo(x + 5 + 1.8*Math.sin(r*1.9 + i*1.3), y + i*5); ctx.lineTo(x, y + 40); ctx.fill(); }
      if(rechts){ ctx.beginPath(); ctx.moveTo(x + 40, y); for(let i = 0; i <= 8; i++) ctx.lineTo(x + 35 - 1.8*Math.sin(r*1.7 + i*1.3), y + i*5); ctx.lineTo(x + 40, y + 40); ctx.fill(); }
      if(unten){
        ctx.beginPath(); ctx.moveTo(x, y + 28);
        for(let i = 0; i <= 8; i++) ctx.lineTo(x + i*5, y + 31 + 2*Math.sin(c*1.3 + i*1.5));
        ctx.lineTo(x + 40, y + 40); ctx.lineTo(x, y + 40); ctx.fill();
        // dicke Tropfen, die langsam wandern
        for(let k = 0; k < 2; k++){
          const dx = 10 + k*20 + ((c*7 + k*3) % 6), ph = t/900 + c*1.9 + k*2.7;
          const lang = 6 + 7*(0.5 + 0.5*Math.sin(ph));
          ctx.beginPath(); ctx.moveTo(x + dx - 4.5, y + 33);
          ctx.quadraticCurveTo(x + dx - 2, y + 38, x + dx - 2.6, y + 40 + lang*0.6);
          ctx.arc(x + dx, y + 40 + lang*0.6, 2.8, Math.PI, 0, true);
          ctx.quadraticCurveTo(x + dx + 2, y + 38, x + dx + 4.5, y + 33); ctx.fill();
          ctx.fillStyle = H.hell; ctx.globalAlpha = .8; ctx.beginPath(); ctx.ellipse(x + dx - 0.9, y + 41 + lang*0.5, 0.9, 1.6, 0, 0, 6.3); ctx.fill();
          ctx.fillStyle = H.schicht; ctx.globalAlpha = .93;
        }
        ctx.fillStyle = H.dunkel; ctx.globalAlpha = .35; ctx.fillRect(x, y + 31, 40, 1.2);
      }
      // Glanzlichter
      ctx.globalAlpha = .75; ctx.fillStyle = H.hell;
      if(oben){ ctx.beginPath(); ctx.ellipse(x + 12 + (c*9%14), y + 3.6, 6, 1.3, 0, 0, 6.3); ctx.fill(); }
      if(unten){ ctx.beginPath(); ctx.ellipse(x + 10 + (c*5%10), y + 33.5, 5, 1.2, 0, 0, 6.3); ctx.fill(); }
      if(links) ctx.fillRect(x + 1.8, y + 6, 1.4, 12);
      if(rechts) ctx.fillRect(x + 36.8, y + 6, 1.4, 12);
      ctx.globalAlpha = 1;
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
