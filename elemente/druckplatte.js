// elemente/druckplatte.js – Element „Druckplatte“ (Punkt-Element mit Verknüpfungs-Nummer, siehe 00-register.js).
// Die Nummer ist AN, solange mindestens eine Figur darauf steht. Rolle: eine Figur hält, die andere geht durch.
// Logik: updatePlates im Verknüpfungs-System (js/05-level-objekte.js).
elementRegistrieren({
  id: 'druckplatte', name: 'Druckplatte', feld: 'plates',
  editor: {
    werkzeug: 'plate', gruppe: 'logik', vor: '#linkSelect', art: 'punkt', ziehbar: false,
    mitNummer: true, nummerName: 'Druckplatte', farbe: '#c9a227',
    titel: 'Druckplatte: Tür offen / Bewegung läuft nur, solange jemand draufsteht (Verknüpfung wie beim Schalter)',
    zeichnen(ctx, c, r, TILE, p){   // flache Platte unten im Kästchen mit Nummer
      const X = c*TILE, Y = r*TILE;
      ctx.fillStyle = '#c9a227'; ctx.fillRect(X+4, Y+TILE-12, TILE-8, 10);
      ctx.strokeStyle = '#6b5410'; ctx.lineWidth = 2; ctx.strokeRect(X+4, Y+TILE-12, TILE-8, 10);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(p.link), X+TILE/2, Y+TILE/2-6);
    },
    exportieren: (liste, TILE) => elementPunktMitte(liste, TILE),
  },
  spiel: {
    laden(daten){ plates = (daten.plates||[]).map(p=>({x:p.x, y:p.y, link:p.link, down:false})); },
    // Steinplatte mit Nummer, sinkt ein, solange jemand draufsteht
    zeichnen(){
      for(const pl of plates){
        const x = Math.round(pl.x - camX);
        if(x < -40 || x > VW + 40) continue;
        const baseY = pl.y + 20, col = linkColor(pl.link), d = pl.down ? 4 : 0;
        // Auffälliger (Nutzerwunsch): so breit wie der Bereich, der wirklich drückt, höher, Rand in der Verknüpfungs-Farbe, Lichtschein; solange niemand
        // draufsteht, zeigt ein hüpfender Pfeil auf die Platte
        elementLeuchten(x, baseY - 10, 52, col, pl.down ? 0.6 : 1);
        ctx.fillStyle = 'rgba(0,0,0,.3)'; roundRect(x - 29, baseY - 7, 58, 7, 2); ctx.fill();
        ctx.fillStyle = '#4a3a0c'; roundRect(x - 28, baseY - 15 + d, 56, 15 - d, 4); ctx.fill();
        ctx.fillStyle = pl.down ? col : '#ffd75e'; roundRect(x - 26, baseY - 14 + d, 52, 11 - d*0.5, 4); ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 2.5; roundRect(x - 28, baseY - 15 + d, 56, 15 - d, 4); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(x - 23, baseY - 13 + d, 46, 2);
        ctx.fillStyle = pl.down ? '#fff' : col; ctx.beginPath(); ctx.arc(x, baseY - 7 + d/2, 7.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = pl.down ? col : '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(pl.link), x, baseY - 6.5 + d/2);
        if(!pl.down) hinweisPfeil(x, baseY - 48, col);
      }
    },
  },
});
