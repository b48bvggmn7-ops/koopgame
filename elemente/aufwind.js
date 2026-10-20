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
// (Spiel, nur Zeichnen) Der Editor speichert Aufwind als Reihen-Streifen (je 1 Kästchen hoch). Zum Zeichnen werden
// sich berührende Streifen zu Säulen zusammengefasst: {x, y, w, h (Umriss), teile:[Streifen]}. Zwischenspeicher je Level.
let windSaeulenCache = null, windSaeulenQuelle = null;
function windSaeulen(){
  if(windSaeulenQuelle === winds && windSaeulenCache && windSaeulenCache.n === winds.length) return windSaeulenCache.liste;
  const n = winds.length, chef = winds.map((_, i) => i);
  const wurzel = i => { while(chef[i] !== i) i = chef[i] = chef[chef[i]]; return i; };
  const beruehrt = (a, b) => a.x <= b.x + b.w && b.x <= a.x + a.w && a.y <= b.y + b.h && b.y <= a.y + a.h &&
    // nur an einer Kante (nicht bloß an einer Ecke) zusammenhängend
    (Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 0 || Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 0);
  for(let i = 0; i < n; i++) for(let j = i + 1; j < n; j++) if(beruehrt(winds[i], winds[j])) chef[wurzel(i)] = wurzel(j);
  const gruppen = new Map();
  winds.forEach((w, i) => { const r = wurzel(i); if(!gruppen.has(r)) gruppen.set(r, []); gruppen.get(r).push(w); });
  const liste = [...gruppen.values()].map(teile => {
    const x = Math.min(...teile.map(t => t.x)), y = Math.min(...teile.map(t => t.y));
    return {x, y, w: Math.max(...teile.map(t => t.x + t.w)) - x, h: Math.max(...teile.map(t => t.y + t.h)) - y, teile};
  });
  windSaeulenQuelle = winds; windSaeulenCache = {n, liste};
  return liste;
}
// feste „Zufallszahl“ 0…1 je Ziffer (damit Schlieren/Staub jedes Bild am gleichen Platz bleiben)
function windZufall(k){ const v = Math.sin(k*12.9898 + 78.233)*43758.5453; return v - Math.floor(v); }
elementRegistrieren({
  id: 'aufwind', name: 'Aufwind', feld: 'winds',
  editor: {
    werkzeug: 'wind', gruppe: 'haken', vor: 'bounce', art: 'kachel', ziehbar: true,
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
    // Eine Wind-Säule als EINE weiche Fläche (die Kästchen-Reihen aus dem Editor werden vorher zu Säulen
    // zusammengefasst, `windSaeulen`), darin lange, sanft wehende Luftschlieren, Funkel-Staub und taumelnde Blättchen.
    zeichnen(){
      const tw = performance.now()*0.001;
      for(const s of windSaeulen()){
        const x0 = s.x - camX;
        if(x0 + s.w < -30 || x0 > VW + 30) continue;
        ctx.save();
        ctx.beginPath(); for(const r of s.teile) ctx.rect(r.x - camX, r.y, r.w, r.h); ctx.clip();
        // Fläche: an den Seiten weich auslaufend, unten heller (dort „bläst“ es), nach oben verblassend
        const atem = 0.88 + 0.12*Math.sin(tw*1.6 + s.x*0.01);
        const gq = ctx.createLinearGradient(x0, 0, x0 + s.w, 0);
        gq.addColorStop(0, 'rgba(225,248,255,0)'); gq.addColorStop(0.22, `rgba(225,248,255,${0.2*atem})`);
        gq.addColorStop(0.5, `rgba(235,252,255,${0.27*atem})`); gq.addColorStop(0.78, `rgba(225,248,255,${0.2*atem})`);
        gq.addColorStop(1, 'rgba(225,248,255,0)');
        // in waagerechten Bändern mit wechselnder Deckkraft: oben weich ausblenden, unten leicht einblenden
        ctx.fillStyle = gq;
        const baender = 16;
        for(let b = 0; b < baender; b++){
          const m = (b + 0.5)/baender;   // 0 = oben, 1 = unten
          ctx.globalAlpha = Math.min(1, m/0.3, (1 - m)/0.06 + 0.45)*(0.75 + 0.55*m*m);
          const ya = Math.round(s.y + s.h*b/baender), yb = Math.round(s.y + s.h*(b + 1)/baender);
          ctx.fillRect(x0, ya, s.w, yb - ya);
        }
        ctx.globalAlpha = 1;
        // lange Luftschlieren: steigen gleichmäßig (px/s), schlängeln sich und laufen an beiden Enden aus
        ctx.lineCap = 'round';
        const spalten = Math.max(2, Math.round(s.w/24)), proSpalte = Math.max(1, Math.round(s.h/150));
        for(let i = 0; i < spalten; i++){
          for(let k = 0; k < proSpalte; k++){
            const z = windZufall(s.x + i*13 + k*71), laenge = 55 + z*55, weg = s.h + laenge;
            const yy = s.y + s.h + laenge*0.5 - ((tw*(150 + z*70) + (k/proSpalte + z*0.3)*weg) % weg);
            const lx = x0 + (i + 0.5)*s.w/spalten + (z - 0.5)*10;
            const gl = ctx.createLinearGradient(0, yy, 0, yy - laenge);
            const al = 0.55 + z*0.3;
            gl.addColorStop(0, 'rgba(250,255,255,0)'); gl.addColorStop(0.5, `rgba(250,255,255,${al})`); gl.addColorStop(1, 'rgba(250,255,255,0)');
            ctx.globalAlpha = Math.max(0, Math.min(1, (yy - laenge*0.5 - s.y)/(s.h*0.25 + 1)));
            ctx.strokeStyle = gl; ctx.lineWidth = 1.2 + z*1.2;
            ctx.beginPath();
            for(let j = 0; j <= 8; j++){
              const py = yy - laenge*j/8, px = lx + Math.sin(py*0.035 + tw*2.2 + i*1.7)*(3 + z*3);
              j ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
            }
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
        // feiner Funkel-Staub
        const staub = Math.round(s.w*s.h/5000) + 3;
        ctx.fillStyle = '#ffffff';
        for(let i = 0; i < staub; i++){
          const z = windZufall(s.x*3 + i*29), weg = s.h + 20;
          const ph = ((tw*(110 + z*90) + z*weg*3) % weg), py = s.y + s.h + 10 - ph;
          const px = x0 + windZufall(i*7 + s.y)*s.w + Math.sin(tw*3 + i)*5;
          ctx.globalAlpha = Math.sin(Math.PI*ph/weg)*(0.6 + 0.4*Math.sin(tw*6 + i*2.3));
          ctx.beginPath(); ctx.arc(px, py, 0.9 + z*1.3, 0, Math.PI*2); ctx.fill();
        }
        // taumelnde Blättchen (wenige, drehen sich und kippen dabei um)
        const blaetter = Math.round(s.w*s.h/14000) + 1;
        for(let i = 0; i < blaetter; i++){
          const z = windZufall(s.x + i*101 + 5), weg = s.h + 30;
          const ph = ((tw*(70 + z*40) + z*weg) % weg), py = s.y + s.h + 15 - ph;
          const px = x0 + (0.2 + 0.6*windZufall(i*17 + s.x))*s.w + Math.sin(tw*1.8 + i*2)*s.w*0.18;
          ctx.save(); ctx.translate(px, py); ctx.rotate(tw*2.5 + i); ctx.scale(1, Math.cos(tw*3.1 + i*1.3));
          ctx.globalAlpha = Math.sin(Math.PI*ph/weg)*0.95;
          ctx.fillStyle = i % 2 ? '#8fd18a' : '#d8f0a0';
          ctx.beginPath(); ctx.moveTo(-7, 0); ctx.quadraticCurveTo(0, -4, 7, 0); ctx.quadraticCurveTo(0, 4, -7, 0); ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }
    },
  },
});
