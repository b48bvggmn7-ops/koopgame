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
        // Auffälliger und passend zur Spielwelt (Nutzerwunsch): breite Messingplatte im Eisenrahmen mit Nieten und einem
        // Edelstein in der Verknüpfungs-Farbe (wie auf den Türen); leichter Schein, solange niemand draufsteht Glühwürmchen
        elementLeuchten(x, baseY - 8, 44, col, pl.down ? 0.5 : 1);
        ctx.fillStyle = 'rgba(0,0,0,.28)'; roundRect(x - 29, baseY - 6, 58, 6, 2); ctx.fill();
        ctx.fillStyle = '#4a4f57'; roundRect(x - 28, baseY - 14 + d, 56, 14 - d, 3); ctx.fill();
        ctx.strokeStyle = '#2b2f35'; ctx.lineWidth = 1.5; roundRect(x - 28, baseY - 14 + d, 56, 14 - d, 3); ctx.stroke();
        const platte = ctx.createLinearGradient(0, baseY - 12 + d, 0, baseY - 3);
        platte.addColorStop(0, pl.down ? '#b08a3a' : '#ffe08a'); platte.addColorStop(1, pl.down ? '#7a5c1e' : '#d9a43a');
        ctx.fillStyle = platte; roundRect(x - 24, baseY - 12 + d, 48, 9 - d*0.5, 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x - 22, baseY - 12 + d, 44, 1.5);
        ctx.fillStyle = '#9aa3ad'; for(const rx of [x - 26, x + 26]){ ctx.beginPath(); ctx.arc(rx, baseY - 7 + d/2, 1.5, 0, Math.PI*2); ctx.fill(); }
        elementEdelstein(x - 12, baseY - 7.5 + d/2, 4.5, col); elementEdelstein(x + 12, baseY - 7.5 + d/2, 4.5, col);
        ctx.fillStyle = '#3b2f25'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(pl.link), x, baseY - 7 + d/2);
        if(!pl.down) hinweisPfeil(x, baseY - 40, col);
      }
    },
  },
});
