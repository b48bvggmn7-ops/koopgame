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
// sich berührende Streifen zu Säulen zusammengefasst: {x, y, w, h (Umriss), teile:[Rechtecke]}. Zwischenspeicher je Level.
let windSaeulenCache = null, windSaeulenQuelle = null;
function windSaeulen(){
  // der Puste-Strahl des Affen (js/34-koop-aktionen.js, `puste: true`) steht auch in winds, wird aber dort gezeichnet
  const feld = winds.some(w => w.puste) ? winds.filter(w => !w.puste) : winds;
  if(windSaeulenQuelle === winds && windSaeulenCache && windSaeulenCache.n === feld.length) return windSaeulenCache.liste;
  const n = feld.length, chef = feld.map((_, i) => i);
  const wurzel = i => { while(chef[i] !== i) i = chef[i] = chef[chef[i]]; return i; };
  const beruehrt = (a, b) => a.x <= b.x + b.w && b.x <= a.x + a.w && a.y <= b.y + b.h && b.y <= a.y + a.h &&
    // nur an einer Kante (nicht bloß an einer Ecke) zusammenhängend
    (Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 0 || Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 0);
  for(let i = 0; i < n; i++) for(let j = i + 1; j < n; j++) if(beruehrt(feld[i], feld[j])) chef[wurzel(i)] = wurzel(j);
  const gruppen = new Map();
  feld.forEach((w, i) => { const r = wurzel(i); if(!gruppen.has(r)) gruppen.set(r, []); gruppen.get(r).push(w); });
  const liste = [...gruppen.values()].map(streifen => {
    // gleich breite, direkt übereinander liegende Streifen zu einem Rechteck verbinden: sonst zeichnet der
    // Zuschnitt (clip) an jeder Kästchen-Naht eine haarfeine waagerechte Linie (Zoom = halbe Pixel)
    const teile = [];
    for(const t of [...streifen].sort((u, v) => u.x - v.x || u.w - v.w || u.y - v.y)){
      const vor = teile[teile.length - 1];
      if(vor && vor.x === t.x && vor.w === t.w && Math.abs(vor.y + vor.h - t.y) < 0.5) vor.h = t.y + t.h - vor.y;
      else teile.push({x: t.x, y: t.y, w: t.w, h: t.h});
    }
    const x = Math.min(...teile.map(t => t.x)), y = Math.min(...teile.map(t => t.y));
    return {x, y, w: Math.max(...teile.map(t => t.x + t.w)) - x, h: Math.max(...teile.map(t => t.y + t.h)) - y, teile};
  });
  windSaeulenQuelle = winds; windSaeulenCache = {n, liste};
  return liste;
}
// Schein einer Säule als kleines Bild (32×128 Pixel, einmal berechnet): an allen Rändern weich auslaufend, zum unteren
// Teil heller. Je Pixel gerechnet statt aus durchsichtigen Schichten gestapelt – blasse Schichten übereinander zeichnet
// der Browser körnig (gestreute Pixel), und das flimmert, sobald sich die Helligkeit ändert.
let windScheinCache = null;
function windScheinBild(){
  if(windScheinCache) return windScheinCache;
  const B = 32, H = 128, c = document.createElement('canvas'); c.width = B; c.height = H;
  const g2 = c.getContext('2d'), bild = g2.createImageData(B, H);
  const glatt = t => t <= 0 ? 0 : t >= 1 ? 1 : t*t*(3 - 2*t);
  for(let y = 0; y < H; y++){
    const m = (y + 0.5)/H;   // 0 = oben, 1 = unten
    const senk = glatt(m/0.35)*glatt((1 - m)/0.2)*(0.75 + 0.55*m*m);
    for(let x = 0; x < B; x++){
      const q = (x + 0.5)/B, waag = glatt(Math.min(q, 1 - q)/0.32);
      const i = (y*B + x)*4;
      bild.data[i] = 232; bild.data[i + 1] = 250; bild.data[i + 2] = 255;
      bild.data[i + 3] = Math.round(255*0.55*senk*waag);
    }
  }
  g2.putImageData(bild, 0, 0);
  return windScheinCache = c;
}
// Inhalt einer Wind-Säule (Aufwind-Aussehen): Wind steigt vom unteren Rand (y0 + h) zum oberen (y0). Gemeinsam für den
// Aufwind und den Puste-Strahl des Affen (js/34-koop-aktionen.js, gedreht in Blasrichtung). seed = feste Zufallszahl-Basis,
// atem = Helligkeit (Atmen), tempo = Steig-Geschwindigkeit (Pusten: schneller), sicht = Deckkraft der Fläche (0…1).
function windInhaltZeichnen(x0, y0, w, h, tw, seed, atem, tempo, sicht = 1){
  // Fläche: an allen Rändern weich auslaufend, zum unteren Teil heller (dort „bläst“ es)
  // EIN weiches Schein-Bild (klein vorgemalt, `windScheinBild`), auf die Säule gezogen: glatt, ohne Körnung/Flimmern
  ctx.globalAlpha = atem*sicht; ctx.imageSmoothingEnabled = true;
  ctx.drawImage(windScheinBild(), x0, y0, w, h);
  ctx.globalAlpha = 1;
  // lange Luftschlieren: steigen gleichmäßig (px/s), schlängeln sich und laufen an beiden Enden aus
  ctx.lineCap = 'round';
  const spalten = Math.max(2, Math.round(w/24)), proSpalte = Math.max(1, Math.round(h/150));
  for(let i = 0; i < spalten; i++){
    for(let k = 0; k < proSpalte; k++){
      const z = windZufall(seed + i*13 + k*71), laenge = 55 + z*55, weg = h + laenge;
      const yy = y0 + h + laenge*0.5 - ((tw*(150 + z*70)*tempo + (k/proSpalte + z*0.3)*weg) % weg);
      const lx = x0 + (i + 0.5)*w/spalten + (z - 0.5)*10;
      const gl = ctx.createLinearGradient(0, yy, 0, yy - laenge);
      const al = 0.55 + z*0.3;
      gl.addColorStop(0, 'rgba(250,255,255,0)'); gl.addColorStop(0.5, `rgba(250,255,255,${al})`); gl.addColorStop(1, 'rgba(250,255,255,0)');
      ctx.globalAlpha = Math.max(0, Math.min(1, (yy - laenge*0.5 - y0)/(h*0.25 + 1), (y0 + h - yy + laenge*0.5)/(h*0.18 + 1)));
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
  const staub = Math.round(w*h/5000) + 3;
  ctx.fillStyle = '#ffffff';
  for(let i = 0; i < staub; i++){
    const z = windZufall(seed*3 + i*29), weg = h + 20;
    const ph = ((tw*(110 + z*90)*tempo + z*weg*3) % weg), py = y0 + h + 10 - ph;
    const px = x0 + windZufall(i*7 + y0)*w + Math.sin(tw*3 + i)*5;
    ctx.globalAlpha = Math.sin(Math.PI*ph/weg)*(0.6 + 0.4*Math.sin(tw*6 + i*2.3));
    ctx.beginPath(); ctx.arc(px, py, 0.9 + z*1.3, 0, Math.PI*2); ctx.fill();
  }
  // taumelnde Blättchen (wenige, drehen sich und kippen dabei um)
  const blaetter = Math.round(w*h/14000) + 1;
  for(let i = 0; i < blaetter; i++){
    const z = windZufall(seed + i*101 + 5), weg = h + 30;
    const ph = ((tw*(70 + z*40)*tempo + z*weg) % weg), py = y0 + h + 15 - ph;
    const px = x0 + (0.2 + 0.6*windZufall(i*17 + seed))*w + Math.sin(tw*1.8 + i*2)*w*0.18;
    ctx.save(); ctx.translate(px, py); ctx.rotate(tw*2.5 + i); ctx.scale(1, Math.cos(tw*3.1 + i*1.3));
    ctx.globalAlpha = Math.sin(Math.PI*ph/weg)*0.95;
    ctx.fillStyle = i % 2 ? '#8fd18a' : '#d8f0a0';
    ctx.beginPath(); ctx.moveTo(-7, 0); ctx.quadraticCurveTo(0, -4, 7, 0); ctx.quadraticCurveTo(0, 4, -7, 0); ctx.fill();
    ctx.restore();
  }
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
        windInhaltZeichnen(x0, s.y, s.w, s.h, tw, s.x, 0.88 + 0.12*Math.sin(tw*1.6 + s.x*0.01), 1);
        ctx.restore();
      }
    },
  },
});
