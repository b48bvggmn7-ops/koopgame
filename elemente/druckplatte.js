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
        // Nutzerwunsch: die Figur soll sichtbar AUF der Platte stehen. Die Platte sitzt in einer Vertiefung im Boden und ragt
        // frei 8 px heraus; gedrückt ist ihre Oberseite genau auf Bodenhöhe (dort stehen die Füße), der Rest steckt im Boden.
        // Weiche Bewegung nur in der Anzeige (gleich schnell bei jeder Bildrate, wie die Türen)
        const ziel = pl.down ? 1 : 0;
        pl.anzeigeDruck = pl.anzeigeDruck === undefined ? ziel : pl.anzeigeDruck + (ziel - pl.anzeigeDruck)*(1 - Math.pow(0.6, frameDt/STEP));
        const a = pl.anzeigeDruck, baseY = pl.y + 20, col = linkColor(pl.link);
        const HOCH = 8, DICK = 12, top = baseY - HOCH*(1 - a), unten = baseY + DICK - HOCH;   // Plattenblock top … top+DICK
        // Auffälliger und passend zur Spielwelt (Nutzerwunsch): Messingplatte im Eisenrahmen mit Nieten und einem Edelstein
        // in der Verknüpfungs-Farbe (wie auf den Türen); leichter Schein, solange niemand draufsteht
        elementLeuchten(x, baseY - 6, 44, col, 1 - 0.5*a);
        // Vertiefung im Boden (Eisenrahmen), in die die Platte einsinkt
        ctx.fillStyle = '#2b2f35'; roundRect(x - 30, baseY - 1.5, 60, unten - baseY + 3.5, 2.5); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(x - 27, baseY, 54, unten - baseY);
        ctx.fillStyle = '#9aa3ad'; for(const rx of [x - 28, x + 28]){ ctx.beginPath(); ctx.arc(rx, baseY + 2.5, 1.3, 0, Math.PI*2); ctx.fill(); }
        // Plattenblock (unten von der Vertiefung abgeschnitten)
        ctx.save(); ctx.beginPath(); ctx.rect(x - 40, top - 2, 80, unten - top + 2); ctx.clip();
        const platte = ctx.createLinearGradient(0, top, 0, top + DICK);
        platte.addColorStop(0, a > 0.5 ? '#e0b45a' : '#ffe08a'); platte.addColorStop(1, a > 0.5 ? '#8a6a24' : '#c98f2a');
        ctx.fillStyle = platte; roundRect(x - 25, top, 50, DICK, 2.5); ctx.fill();
        ctx.strokeStyle = '#6b5410'; ctx.lineWidth = 1.2; roundRect(x - 25, top, 50, DICK, 2.5); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillRect(x - 23, top + 1, 46, 1.5);   // helle Oberkante: hier steht man
        if(a < 0.5){ ctx.save(); roundRect(x - 25, top, 50, DICK, 2.5); ctx.clip(); glanzBand(x - 25, top, 50, DICK, pl.x*0.02); ctx.restore(); }
        const gy = top + 6.5;
        ctx.fillStyle = 'rgba(30,20,10,.55)'; roundRect(x - 8, gy - 4.2, 16, 8.4, 2.5); ctx.fill();   // dunkle Fassung wie bei der Tür
        elementEdelstein(x, gy, 4.5, col);   // nur ein Diamant in der Mitte, keine Zahl
        ctx.restore();
        if(!pl.down) hinweisPfeil(x, baseY - 40, col);
      }
    },
  },
});
