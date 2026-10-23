// elemente/sprungpilz.js – Element „Sprungpilz“ (Punkt-Element; Aufbau siehe 00-register.js).
// Nur wer von oben darauf springt/fällt, wird hochgeschleudert (ca. 6 Kästchen hoch); drüberlaufen tut nichts
// (Nutzerwunsch). Rolle: beide Figuren nutzen ihn – der Affe erreicht damit hohe Haken, das Schweinchen startet
// von dort ins Segeln.
const BOUNCE_V = -17.2;
const PILZ_TREFFER = 22;   // px: so weit (plus halbe Figurenbreite) neben der Mitte zählt das Draufspringen – so breit wie der Pilzhut
                          // (vorher 14: wer auf dem Hutrand landete, sprang „ins Leere“, Nutzer-Rückmeldung)
// (Spiel) Liste der Pilze steht in `bouncers` (01-level.js): {x, y (Fußpunkt), squish}
function checkBounce(player, wasGrounded, fallVy){
  if(player.hookAttached || player.vy < 0 || wasGrounded || !(fallVy > 0)) return;
  for(const b of bouncers){
    if(Math.abs(player.x - b.x) < PILZ_TREFFER + player.w/2 && player.y > b.y - 14 && player.y <= b.y + 1){
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
        // Auffälliger und passend zur Spielwelt (Nutzerwunsch): breiter, dicker Sprungpilz in warmem Gold-Orange (hebt sich
        // vom Gras ab, sieht aber nicht aus wie die kleinen roten Deko-Pilze), cremefarbene Tupfen, weicher brauner Rand,
        // federnder Stiel; leichter Schein und Glühwürmchen darüber
        elementLeuchten(x, b.y - 20, 50, '#ffcf6b');
        ctx.save(); ctx.translate(x, b.y); ctx.scale(1 + sq, 1 - sq);
        glanzSchatten(0, -1, 24, 4.5);   // Design-Politur C: weicher Kontaktschatten statt harter Ellipse
        const stiel = ctx.createLinearGradient(-10, 0, 10, 0);
        stiel.addColorStop(0, '#e8d6b8'); stiel.addColorStop(0.5, '#fff6e6'); stiel.addColorStop(1, '#d9c3a0');
        ctx.fillStyle = '#5a3a1e'; roundRect(-11.5, -21, 23, 21, 6); ctx.fill();
        ctx.fillStyle = stiel; roundRect(-10, -20, 20, 19.5, 5); ctx.fill();
        ctx.strokeStyle = 'rgba(120,80,40,.35)'; ctx.lineWidth = 1;
        for(const yy of [-15, -9]){ ctx.beginPath(); ctx.moveTo(-8, yy); ctx.quadraticCurveTo(0, yy + 2, 8, yy); ctx.stroke(); }
        ctx.fillStyle = '#5a3a1e'; ctx.beginPath(); ctx.ellipse(0, -18, 30, 23, 0, Math.PI, Math.PI*2); ctx.closePath(); ctx.fill();
        const hut = ctx.createRadialGradient(-9, -34, 3, 0, -20, 32);
        hut.addColorStop(0, '#ffe39a'); hut.addColorStop(0.55, '#ffad3b'); hut.addColorStop(1, '#e0761f');
        ctx.fillStyle = hut; ctx.beginPath(); ctx.ellipse(0, -19, 28, 21, 0, Math.PI, Math.PI*2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(120,60,10,.35)'; ctx.fillRect(-27, -21, 54, 2.5);   // Hutkante
        ctx.fillStyle = '#fff3d6';
        for(const [dx, dy, r] of [[-15, -26, 4], [0, -34, 4.6], [14, -25, 3.6], [-5, -24, 2.6], [8, -31, 2.2]]){ ctx.beginPath(); ctx.ellipse(dx, dy, r, r*0.85, 0, 0, Math.PI*2); ctx.fill(); }
        // Design-Politur C: feuchter Glanz auf dem Hut + Funkeln
        const glanz = ctx.createRadialGradient(-10, -33, 0, -10, -33, 12);
        glanz.addColorStop(0, 'rgba(255,255,255,.55)'); glanz.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glanz; ctx.beginPath(); ctx.ellipse(-10, -33, 12, 6, -0.35, 0, Math.PI*2); ctx.fill();
        glanzFunkeln(-12, -35, 6, b.x*0.04 + b.y);
        ctx.restore();
        hinweisPfeil(x, b.y - 58, '#ffcf6b');
      }
    },
  },
});
