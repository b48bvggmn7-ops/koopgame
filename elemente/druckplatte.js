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
    // Neustart/Tod: Platte gilt als frei – „Betreten“ (schaltbarer Spiegel) zählt danach wieder ab dem ersten Draufsteigen
    zuruecksetzen(){ for(const pl of plates) pl.down = false; },
    // Steinplatte mit Nummer, sinkt ein, solange jemand draufsteht
    zeichnen(){
      for(const pl of plates){
        const x = Math.round(pl.x - camX);
        if(x < -40 || x > VW + 40) continue;
        // Nutzerwunsch: gedrückt sinkt die Platte GANZ ein (bündig mit dem Boden, die Figur steht nicht „in“ ihr);
        // weiche Bewegung nur in der Anzeige (gleich schnell bei jeder Bildrate, wie die Türen)
        const ziel = pl.down ? 1 : 0;
        pl.anzeigeDruck = pl.anzeigeDruck === undefined ? ziel : pl.anzeigeDruck + (ziel - pl.anzeigeDruck)*(1 - Math.pow(0.6, frameDt/STEP));
        const a = pl.anzeigeDruck, baseY = pl.y + 20, col = linkColor(pl.link);
        const hR = 14 - 11.5*a, top = baseY - hR, mitte = top + hR/2;   // Rahmen: 14 px hoch, gedrückt nur noch 2,5 px
        // Auffälliger und passend zur Spielwelt (Nutzerwunsch): breite Messingplatte im Eisenrahmen mit Nieten und einem
        // Edelstein in der Verknüpfungs-Farbe (wie auf den Türen); leichter Schein, solange niemand draufsteht
        elementLeuchten(x, baseY - 8, 44, col, 1 - 0.5*a);
        glanzSchatten(x, baseY, 34, 4*(1 - a));
        ctx.fillStyle = `rgba(0,0,0,${(0.28*(1 - a)).toFixed(3)})`; roundRect(x - 29, baseY - 6, 58, 6, 2); ctx.fill();
        ctx.fillStyle = '#4a4f57'; roundRect(x - 28, top, 56, hR, Math.min(3, hR/2)); ctx.fill();
        ctx.strokeStyle = '#2b2f35'; ctx.lineWidth = 1.5; roundRect(x - 28, top, 56, hR, Math.min(3, hR/2)); ctx.stroke();
        const hP = Math.max(1.2, hR - 5), pTop = top + Math.min(2, hR*0.25);
        const platte = ctx.createLinearGradient(0, pTop, 0, pTop + hP);
        platte.addColorStop(0, a > 0.5 ? '#b08a3a' : '#ffe08a'); platte.addColorStop(1, a > 0.5 ? '#7a5c1e' : '#d9a43a');
        ctx.fillStyle = platte; roundRect(x - 24, pTop, 48, hP, Math.min(2, hP/2)); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x - 22, pTop, 44, Math.min(1.5, hP*0.5));
        if(a < 0.5){ ctx.save(); roundRect(x - 24, pTop, 48, hP, 2); ctx.clip(); glanzBand(x - 24, pTop, 48, hP, pl.x*0.02); ctx.restore(); }
        if(a < 0.6){
          ctx.fillStyle = '#9aa3ad'; for(const rx of [x - 26, x + 26]){ ctx.beginPath(); ctx.arc(rx, mitte, 1.5, 0, Math.PI*2); ctx.fill(); }
          ctx.fillStyle = 'rgba(30,20,10,.55)'; roundRect(x - 8, mitte - 4.2, 16, 8.4*(1 - a), 2.5); ctx.fill();   // dunkle Fassung wie bei der Tür
          elementEdelstein(x, mitte, 5*(1 - 0.6*a), col);   // nur ein Diamant in der Mitte, keine Zahl
        } else {   // eingesunken: flacher, leuchtender Streifen in der Verknüpfungs-Farbe zeigt „gedrückt“
          ctx.fillStyle = col; ctx.globalAlpha = 0.9; ctx.fillRect(x - 9, top + 0.4, 18, Math.max(1, hR - 0.8)); ctx.globalAlpha = 1;
        }
        if(!pl.down) hinweisPfeil(x, baseY - 40, col);
      }
    },
  },
});
