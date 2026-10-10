// elemente/eis.js – Element „Eis“ (Ausbau 7, Welt Höhle; Punkt-Element, mit der Maus malbar).
// Rutschiger Boden-Block (fest wie Stein). Wer darauf steht, läuft nur langsam an, dreht langsam um und rutscht ohne
// Taste lange weiter (Werte EIS_GRIFF / EIS_REIBUNG in js/02-physik-werte.js; die Sonderregel selbst steht in der
// Figuren-Physik js/08-figur-physik-seil.js). Springt man vom Eis ab, behält man den Schwung.
// Rolle: der Affe bremst mit dem Seil (am Haken hängen stoppt jedes Rutschen), das Schweinchen landet segelnd
// punktgenau auf schmalen Eissäulen.
// Spiel-Daten: eis [{x, y, w, h}] (obere linke Ecke, je Kästchen). Im Spiel: solids mit type 'eis'.
function aufEis(player){ return !!(player.grounded && player.standingOn && player.standingOn.type === 'eis'); }
function eisBlock(c, x, y, w, h, dunkel){
  const gr = c.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, dunkel ? '#a8cde0' : '#e4f8ff'); gr.addColorStop(0.45, dunkel ? '#7fb2cf' : '#b5e2f6'); gr.addColorStop(1, dunkel ? '#5d8fb0' : '#86c1e2');
  c.fillStyle = gr; c.fillRect(x, y, w, h);
  c.strokeStyle = 'rgba(40,90,130,.55)'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, w - 2, h - 2);
  c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(x + 3, y + 2, w - 6, 3);          // Glanz oben
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5;                         // Glanzstriche
  c.beginPath(); c.moveTo(x + w*0.2, y + h*0.75); c.lineTo(x + w*0.42, y + h*0.3); c.stroke();
  c.beginPath(); c.moveTo(x + w*0.5, y + h*0.8); c.lineTo(x + w*0.62, y + h*0.55); c.stroke();
}
function eisZeichnen(){
  const dunkel = typeof THEME !== 'undefined' && THEME && THEME.dark > 0.5;
  for(const s of solids){
    if(s.type !== 'eis') continue;
    const x = Math.round(s.x - camX);
    if(x + s.w < -20 || x > VW + 20) continue;
    eisBlock(ctx, x, s.y, s.w, s.h, dunkel);
  }
}
ELEMENT_SOLID_TYPEN.add('eis');
elementRegistrieren({
  id: 'eis', name: 'Eis', feld: 'eis',
  editor: {
    werkzeug: 'eis', gruppe: 'gelaende', vor: 'fake', art: 'punkt', ziehbar: true, farbe: '#b5e2f6',
    titel: 'Eis: fester, rutschiger Boden – langsam anlaufen, langer Bremsweg. Mit gedrückter Maus malen',
    zeichnen(ctx, c, r, TILE){ eisBlock(ctx, c*TILE, r*TILE, TILE, TILE, false); },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, w: TILE, h: TILE})),
  },
  spiel: {
    laden(daten){ for(const e of (daten.eis || [])) solids.push({x: e.x, y: e.y, w: e.w || 40, h: e.h || 40, type: 'eis'}); },
    // Landen auf Eis mit Schwung: leises Schaben
    nachBewegung(player, warAmBoden){
      if(!warAmBoden && aufEis(player) && Math.abs(player.vx) > 1.5 && player.x > camX - 40 && player.x < camX + VW + 40) SFX.eisRutsch(player.x);
    },
    zeichnen(){ eisZeichnen(); },
  },
});
