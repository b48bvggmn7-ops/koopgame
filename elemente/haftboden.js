// elemente/haftboden.js – Element „Haftfläche (Boden)“ (Kachel-Element, siehe 00-register.js).
// Nutzerwunsch 06.11.: „Haftfläche im Editor einstellbar machen, ob sie aus Boden oder Wand ist, damit ich entscheiden kann,
// ob ein Wandsprung erlaubt ist“. Gleiche klebrige Unterseite wie die Haftfläche aus Wand (elemente/haftflaeche.js: Festhalten,
// Hangeln, Honig-Schicht), aber aus ERDE: Kollision und Aussehen wie Boden, daher kein Wandsprung und kein Wand-Rutschen an
// den Seiten (WANDSPRUNG_NUR_WAND, wandsprungFlaeche in js/08). Im Spiel: solids mit type 'ground' und haft: true.
// Mit „Bewegung“ fährt sie als bewegtes Stück (look 'haftb' -> Aussehen Boden, haft: true; js/01-level.js).
// Rolle wie die Haftfläche aus Wand: Wege an der Decke – nur ohne Wandsprung-Abkürzung an den Seiten.
elementRegistrieren({
  id: 'haftboden', name: 'Haftfläche (Boden)', feld: 'haftboeden',
  editor: {
    werkzeug: 'haftb', gruppe: 'gelaende', vor: 'fake', art: 'kachel', ziehbar: true,
    titel: 'Haftfläche aus Boden: wie die Haftfläche (Unterseite klebt, „Haftfläche halten“ = festhalten, hangeln), aber aus Erde – ' +
           'an den Seiten KEIN Wandsprung. Mit „Bewegung“ fahrend',
    farbe: '#c08a3e', kachelFarbe: 'rgba(192,138,62,0.6)',
    zeichnen(ctx, c, r, TILE){
      const X = c*TILE, Y = r*TILE;
      ctx.fillStyle = '#7a5434'; ctx.fillRect(X, Y, TILE, TILE);   // Erde
      ctx.fillStyle = '#e9a620'; ctx.fillRect(X, Y + TILE - 9, TILE, 9);   // Honig unten
      ctx.fillStyle = '#fff1a8'; for(let k = 0; k < 3; k++) ctx.fillRect(X + 6 + k*12, Y + TILE - 4, 5, 2);
    },
    exportieren: (zellen, TILE, mergeRects) => mergeRects(zellen),
  },
  spiel: {
    // gezeichnet wird die Honig-Schicht von der Haftfläche (haftSchichtZeichnen läuft über alle solids mit haft: true)
    laden(daten){ for(const h of (daten.haftboeden || [])) solids.push({x: h.x, y: h.y, w: h.w, h: h.h, type: 'ground', haft: true}); },
  },
});
