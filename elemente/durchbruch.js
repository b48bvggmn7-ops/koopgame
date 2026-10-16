// elemente/durchbruch.js – Element „Durchbruch-Wand“ (Nacht-Ausbau; Punkt-Element mit eigener Auswahl, siehe 00-register.js).
// Rissige Steinkästchen: fest wie Boden/Wand, aber ein DASH zerbricht sie (normales Laufen/Springen nicht – dann ist es eine
// ganz normale Wand bzw. ein normaler Boden). Trefferstopp, Kamera-Wackeln, Bruchstücke und Staub, ein Teil des
// Dash-Schwungs bleibt (BRUCH_BEHALTEN); kurz danach geht ein kostenloser Anschluss-Dash oder ein Sprung (BRUCH_FENSTER).
// Senkrecht (Wand), waagerecht (Boden, Decke) und in jeder Größe aus Kästchen baubar.
// Option „wächst nach“: nach X Sekunden ist das Kästchen wieder da – steht dort gerade jemand, wartet es (wie Türen und
// Wechselboden), niemand wird eingeklemmt. Standard: bleibt kaputt bis Neustart bzw. Tod (zurück zum Checkpoint).
// Die Bruch-Logik selbst (wann ein Dash bricht) steht in js/32-neue-bewegung.js (bruchTreffen).
// Rolle: wer dasht, bricht den Weg frei – beide Figuren können dashen; Rätsel trennen das z. B. so, dass der eine einen
// Hebel hält, während der andere die Wand im richtigen Moment durchbricht, oder der Durchbruch nur aus dem Seil-Schwung
// (Affe) bzw. aus dem Segeln (Schweinchen) erreichbar ist.
// Im Spiel: solids mit type 'bruch' {x, y, w, h, nachwachsen (s, 0 = nie), gone, bruchT, wartet}.
const BRUCH_LOOK = {
  dschungel: {hell: '#c8b08a', mitte: '#a38866', dunkel: '#5b4630', riss: '#3a2a1a', glut: null},
  ruinen:    {hell: '#e2c98f', mitte: '#c3a464', dunkel: '#7a6232', riss: '#4a3818', glut: null},
  hoehle:    {hell: '#a9b2c4', mitte: '#7f889c', dunkel: '#454b5c', riss: '#232733', glut: '#8fe3ff'},
  vulkan:    {hell: '#8a6a5a', mitte: '#664a3e', dunkel: '#382620', riss: '#1c1210', glut: '#ff8a3a'},
};
function bruchLook(){
  const w = (typeof levelLayers !== 'undefined' && levelLayers.welt) || (typeof levelTheme === 'string' ? levelTheme : 'dschungel');
  return BRUCH_LOOK[w] || BRUCH_LOOK[String(w).split('-')[0]] || BRUCH_LOOK.dschungel;
}
// feste Riss-Linien je Kästchen (aus der Lage, flackert nicht)
function bruchRisse(c, x, y, w, h, s, farbe, breite){
  c.strokeStyle = farbe; c.lineWidth = breite; c.lineCap = 'round'; c.lineJoin = 'round';
  let n = Math.abs(Math.floor(s*9301 + 49297)) % 233280;
  const rnd = () => (n = (n*9301 + 49297) % 233280) / 233280;
  for(let k = 0; k < 2; k++){
    c.beginPath();
    let px = x + w*(0.2 + rnd()*0.6), py = y + 2;
    c.moveTo(px, py);
    for(let i = 0; i < 4; i++){ px = Math.max(x + 3, Math.min(x + w - 3, px + (rnd() - 0.5)*w*0.5)); py += h/4; c.lineTo(px, py); }
    c.stroke();
  }
  c.beginPath(); c.moveTo(x + 3, y + h*0.55); c.lineTo(x + w*0.35, y + h*(0.45 + rnd()*0.2)); c.stroke();
  c.lineCap = 'butt';
}
// Nachwachsen (einmal pro Physik-Schritt, aus js/32-neue-bewegung.js)
function bruchNachwachsen(figuren){
  for(const s of solids){
    if(s.type !== 'bruch' || !s.gone || !(s.nachwachsen > 0)) continue;
    s.bruchT = (s.bruchT || 0) + 1;
    if(s.bruchT < s.nachwachsen*60) continue;
    if(figuren.some(p => p && rectsOverlap({x: p.x - p.w/2, y: p.y - p.h, w: p.w, h: p.h}, s))){ s.wartet = true; continue; }
    s.gone = false; s.wartet = false; s.bruchT = 0; s.neuT = 12;
    if(typeof SFX !== 'undefined' && SFX.bruchZurueck) SFX.bruchZurueck(s.x + s.w/2);
  }
}
function bruchZeichnen(){
  const L = bruchLook();
  for(const s of solids){
    if(s.type !== 'bruch') continue;
    const x = Math.round(s.x - camX);
    if(x + s.w < -20 || x > VW + 20) continue;
    if(s.gone){
      if(!(s.nachwachsen > 0)) continue;
      // wächst nach: blasser Umriss, füllt sich langsam (zeigt, dass es zurückkommt)
      const k = Math.min(1, (s.bruchT || 0)/(s.nachwachsen*60));
      ctx.save(); ctx.globalAlpha = s.wartet ? 0.5 + 0.3*Math.sin(performance.now()/90) : 0.35;
      ctx.setLineDash([4, 4]); ctx.strokeStyle = L.dunkel; ctx.lineWidth = 2; roundRect(x + 2, s.y + 2, s.w - 4, s.h - 4, 4); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 0.25; ctx.fillStyle = L.mitte; ctx.fillRect(x + 3, s.y + s.h - 3 - (s.h - 6)*k, s.w - 6, (s.h - 6)*k);
      ctx.restore();
      continue;
    }
    const gr = ctx.createLinearGradient(0, s.y, 0, s.y + s.h);
    gr.addColorStop(0, L.hell); gr.addColorStop(1, L.mitte);
    ctx.fillStyle = gr; roundRect(x + 1, s.y + 1, s.w - 2, s.h - 2, 4); ctx.fill();
    // Steinfugen im 40er-Raster, Risse je Kästchen
    for(let cx = 0; cx < s.w; cx += 40) for(let cy = 0; cy < s.h; cy += 40){
      if(L.glut){ ctx.save(); ctx.globalAlpha = 0.35 + 0.15*Math.sin(performance.now()/400 + s.x + cx); bruchRisse(ctx, x + cx, s.y + cy, 40, 40, s.x + cx + (s.y + cy)*7, L.glut, 4); ctx.restore(); }
      bruchRisse(ctx, x + cx, s.y + cy, 40, 40, s.x + cx + (s.y + cy)*7, L.riss, 2);
      ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1; ctx.strokeRect(x + cx + 0.5, s.y + cy + 0.5, 39, 39);
    }
    ctx.strokeStyle = L.dunkel; ctx.lineWidth = 2.5; roundRect(x + 1.5, s.y + 1.5, s.w - 3, s.h - 3, 4); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(x + 4, s.y + 3, s.w - 8, 2);
    if(s.neuT > 0){ s.neuT -= 0.5; ctx.globalAlpha = s.neuT/12*0.6; ctx.fillStyle = '#fff'; roundRect(x + 1, s.y + 1, s.w - 2, s.h - 2, 4); ctx.fill(); ctx.globalAlpha = 1; }
  }
}
ELEMENT_SOLID_TYPEN.add('bruch');
elementRegistrieren({
  id: 'durchbruch', name: 'Durchbruch-Wand', feld: 'bruchWaende',
  editor: {
    werkzeug: 'bruch', gruppe: 'gelaende', vor: 'fake', art: 'punkt', ziehbar: true,
    titel: 'Durchbruch-Wand: fest wie eine Wand, aber ein Dash zerbricht sie (Laufen/Springen nicht). Senkrecht oder waagerecht bauen. ' +
           'Option: bleibt kaputt (bis Neustart/Tod) oder wächst nach X Sekunden nach (wartet, wenn jemand drin steht)',
    farbe: '#a38866',
    optionen: [
      {key: 'nachwachsen', label: 'Nach dem Bruch', zahl: true, titel: 'bleibt kaputt (bis Neustart oder Tod) oder wächst nach X Sekunden wieder nach',
       werte: [['0', 'bleibt kaputt'], ['2', 'wächst nach 2 s'], ['3', 'wächst nach 3 s'], ['5', 'wächst nach 5 s'], ['8', 'wächst nach 8 s']]},
    ],
    zeichnen(ctx, c, r, TILE, p){
      const X = c*TILE, Y = r*TILE;
      ctx.fillStyle = '#a38866'; ctx.fillRect(X + 1, Y + 1, TILE - 2, TILE - 2);
      bruchRisse(ctx, X, Y, TILE, TILE, c*13 + r*7, '#3a2a1a', 2);
      ctx.strokeStyle = '#5b4630'; ctx.lineWidth = 2; ctx.strokeRect(X + 2, Y + 2, TILE - 4, TILE - 4);
      if(p && p.nachwachsen > 0){
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('↻' + p.nachwachsen, X + TILE/2, Y + TILE/2 + 1);
      }
    },
    // Spiel-Format: je Kästchen ein Rechteck (obere linke Ecke); nachwachsen nur, wenn gesetzt (abwärtskompatibel)
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, w: TILE, h: TILE, ...(p.nachwachsen > 0 ? {nachwachsen: Number(p.nachwachsen)} : {})})),
  },
  spiel: {
    laden(daten){
      for(const b of (daten.bruchWaende || []))
        solids.push({x: b.x, y: b.y, w: b.w || 40, h: b.h || 40, type: 'bruch', nachwachsen: Number(b.nachwachsen) || 0, gone: false, bruchT: 0, wartet: false});
    },
    zuruecksetzen(){ for(const s of solids) if(s.type === 'bruch'){ s.gone = false; s.bruchT = 0; s.wartet = false; s.neuT = 0; } },
    zeichnen: bruchZeichnen,
  },
});
