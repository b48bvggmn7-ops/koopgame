// elemente/aufwind.js – Element „Aufwind“ (Kachel-Element; Aufbau siehe 00-register.js).
// Rechteck-Bereiche, die das Schweinchen mit offenem Schirm nach oben tragen (auch wenn sie gerade steigt);
// den Affen trägt er NICHT. Rolle: Schweinchen-Weg nach oben – der Affe braucht dort Haken/Wandsprung.
// Die Auftriebs-Rechnung selbst steht beim Segeln in 08-figur-physik-seil.js (WIND_LIFT, WIND_MAX_UP, inWind).
const WIND_LIFT = 1.15, WIND_MAX_UP = 6.5;
// (Spiel) Liste der Bereiche steht in `winds` (01-level.js): {x, y, w, h}
function inWind(player){
  const box = {x:player.x-player.w/2, y:player.y-player.h, w:player.w, h:player.h};
  return winds.some(w => rectsOverlap(box, w));
}
elementRegistrieren({
  id: 'aufwind', name: 'Aufwind', feld: 'winds',
  editor: {
    werkzeug: 'wind', gruppe: 'bewegung', vor: 'bounce', art: 'kachel', ziehbar: true,
    titel: 'Aufwind: trägt das Schweinchen mit offenem Schirm nach oben', farbe: '#a0dcff',
    kachelFarbe: 'rgba(160,220,255,0.28)',   // durchsichtig im Raster
    zeichnen(ctx, c, r, TILE){   // Pfeil nach oben
      ctx.strokeStyle = 'rgba(200,240,255,.75)'; ctx.lineWidth = 2;
      const X = c*TILE+TILE/2, Y = r*TILE;
      ctx.beginPath(); ctx.moveTo(X, Y+TILE-8); ctx.lineTo(X, Y+8); ctx.moveTo(X-6, Y+14); ctx.lineTo(X, Y+8); ctx.lineTo(X+6, Y+14); ctx.stroke();
    },
    exportieren: (zellen, TILE, mergeRects) => mergeRects(zellen),
  },
  spiel: {
    laden(daten){ winds = (daten.winds||[]).map(w=>({...w})); },
    // zarte, nach oben ziehende Luftschlieren und Blättchen
    zeichnen(){
      const tw = performance.now();
      for(const w of winds){
        const x0 = w.x - camX;
        if(x0 + w.w < -20 || x0 > VW + 20) continue;
        const gr = ctx.createLinearGradient(0, w.y + w.h, 0, w.y);
        gr.addColorStop(0, 'rgba(220,245,255,0.24)'); gr.addColorStop(1, 'rgba(220,245,255,0.04)');
        ctx.fillStyle = gr; ctx.fillRect(x0, w.y, w.w, w.h);
        // aufsteigende Blättchen
        for(let i = 0; i < Math.round(w.w*w.h/9000) + 2; i++){
          const ph = ((tw*0.00035 + i*0.618) % 1), lx = x0 + ((i*0.37) % 1)*w.w + Math.sin(tw*0.004 + i)*8, ly = w.y + w.h - ph*w.h;
          ctx.save(); ctx.translate(lx, ly); ctx.rotate(tw*0.006 + i); ctx.globalAlpha = Math.sin(ph*Math.PI);
          ctx.fillStyle = i % 2 ? '#8fd18a' : '#d8f0a0'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 2.4, 0, 0, Math.PI*2); ctx.fill();
          ctx.restore();
        }
        ctx.strokeStyle = 'rgba(240,252,255,0.75)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        const n = Math.max(2, Math.round(w.w/26));
        for(let i = 0; i < n; i++){
          const lx = x0 + (i + 0.5)*w.w/n;
          for(let k = 0; k < Math.ceil(w.h/90); k++){
            const ph = ((tw*0.0009 + i*0.37 + k*0.5) % 1), yy = w.y + w.h - ph*w.h;
            if(yy < w.y + 6) continue;
            ctx.globalAlpha = Math.sin(ph*Math.PI)*0.8;
            ctx.beginPath(); ctx.moveTo(lx + Math.sin(tw*0.003 + i + k)*4, yy);
            ctx.quadraticCurveTo(lx + 6, yy - 14, lx + Math.sin(tw*0.003 + i + k + 1)*4, yy - 28); ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }
    },
  },
});
