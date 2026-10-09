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
    werkzeug: 'bounce', gruppe: 'bewegung', vor: 'move', art: 'punkt', ziehbar: false,
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
        ctx.save(); ctx.translate(x, b.y); ctx.scale(1 + sq, 1 - sq);
        ctx.fillStyle = '#f3e7d3'; roundRect(-6, -14, 12, 14, 3); ctx.fill();
        const g = ctx.createRadialGradient(-5, -22, 2, 0, -16, 20);
        g.addColorStop(0, '#b6f07a'); g.addColorStop(1, '#3fa34a');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -14, 19, 12, 0, Math.PI, Math.PI*2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#eaffd0';
        for(const [dx, dy, r] of [[-9, -18, 2.6], [2, -22, 2.3], [10, -16, 2]]){ ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI*2); ctx.fill(); }
        ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.6;   // kleiner Pfeil nach oben
        ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, -40); ctx.moveTo(-4, -36); ctx.lineTo(0, -41); ctx.lineTo(4, -36); ctx.stroke();
        ctx.restore();
      }
    },
  },
});
