// elemente/sprungpilz.js – Element „Sprungpilz“ (Punkt-Element; Aufbau siehe 00-register.js).
// Nur wer von oben darauf springt/fällt, wird hochgeschleudert (ca. 6 Kästchen hoch); drüberlaufen tut nichts
// (Nutzerwunsch). Rolle: beide Figuren nutzen ihn – der Affe erreicht damit hohe Haken, das Schweinchen startet
// von dort ins Segeln.
const BOUNCE_V = -17.2;
// (Spiel) Liste der Pilze steht in `bouncers` (01-level.js): {x, y (Fußpunkt), squish}
function checkBounce(player, wasGrounded, fallVy){
  if(player.hookAttached || player.vy < 0 || wasGrounded || !(fallVy > 0)) return;
  for(const b of bouncers){
    if(Math.abs(player.x - b.x) < 14 + player.w/2 && player.y > b.y - 14 && player.y <= b.y + 1){
      player.vy = BOUNCE_V; player.grounded = false; player.glideTimer = 0; player.lastWallJumpSide = 0;
      b.squish = 1; SFX.mushroom(b.x);
      return;
    }
  }
}
elementRegistrieren({
  id: 'sprungpilz', name: 'Sprungpilz', feld: 'bouncers',
  editor: {
    werkzeug: 'bounce', gruppe: 'haken', vor: 'move', art: 'punkt', ziehbar: false,
    titel: 'Sprungpilz: schleudert ca. 6 Kästchen hoch', farbe: '#4fbf5a',
    zeichnen(ctx, c, r, TILE){
      const X = c*TILE+TILE/2, Y = r*TILE+TILE;
      ctx.fillStyle = '#f3e7d3'; ctx.fillRect(X-4, Y-12, 8, 12);
      ctx.fillStyle = '#4fbf5a'; ctx.beginPath(); ctx.ellipse(X, Y-12, 16, 11, 0, Math.PI, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#eaffd0'; ctx.beginPath(); ctx.arc(X-6, Y-16, 2.5, 0, Math.PI*2); ctx.arc(X+5, Y-18, 2, 0, Math.PI*2); ctx.fill();
    },
    exportieren: (liste, TILE) => liste.map(b => ({x: b.c*TILE+TILE/2, y: b.r*TILE+TILE})),
  },
  spiel: {
    laden(daten){ bouncers = (daten.bouncers||[]).map(b=>({x:b.x, y:b.y, squish:0})); },
    nachBewegung(player, wasGrounded, fallVy){ if(bouncers.length) checkBounce(player, wasGrounded, fallVy); },
    // großer federnder Pilz, staucht sich beim Abspringen
    zeichnen(){
      for(const b of bouncers){
        const x = Math.round(b.x - camX);
        if(x < -40 || x > VW + 40) continue;
        b.squish = Math.max(0, b.squish - frameDt*0.004);
        const sq = Math.sin(b.squish*Math.PI)*0.35;
        // Auffälliger (Nutzerwunsch: dicker, kein Leuchten): so breit wie der Bereich, der wirklich federt, dicker Hut und
        // Stiel, kräftig violett mit weißen Punkten (grün ging im Gras unter, rot sähe aus wie die Deko-Pilze), dunkle
        // Kontur; ein hüpfender Pfeil nach oben
        ctx.save(); ctx.translate(x, b.y); ctx.scale(1 + sq, 1 - sq);
        ctx.fillStyle = 'rgba(20,28,38,.75)'; roundRect(-12, -22, 24, 22, 6); ctx.fill();
        ctx.fillStyle = '#fff3df'; roundRect(-10, -21, 20, 21, 5); ctx.fill();
        const g = ctx.createRadialGradient(-8, -34, 2, 0, -22, 32);
        g.addColorStop(0, '#e2b6ff'); g.addColorStop(1, '#7b2fd6');
        ctx.fillStyle = 'rgba(20,28,38,.85)'; ctx.beginPath(); ctx.ellipse(0, -18, 30.5, 24, 0, Math.PI, Math.PI*2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -19, 28, 22, 0, Math.PI, Math.PI*2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffffff';
        for(const [dx, dy, r] of [[-14, -27, 4], [0, -35, 4.5], [13, -26, 3.6], [-4, -24, 2.6]]){ ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI*2); ctx.fill(); }
        ctx.restore();
        hinweisPfeil(x, b.y - 66, '#c77dff', true);
        ctx.restore();
      }
    },
  },
});
