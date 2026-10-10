// elemente/einseitig.js – Element „Einseitige Plattform“ (Ausbau 4; Kachel-Element, siehe 00-register.js).
// Holzsteg: von unten (und von der Seite) springt/läuft man hindurch, von oben kann man darauf stehen.
//   - Fest ist nur die Oberkante, und nur für Figuren, die von OBEN kommen (Füße waren vor dem Schritt darüber).
//   - Kein Wandsprung an der Seite (zählt nicht als Wand), keine Decke beim Hochspringen.
//   - Die Sicht-Linie des Seils geht hindurch (Haken über einem Steg bleiben erreichbar).
//   - Kein „Runterfallen per Taste“: wer wieder runter will, läuft über die Kante.
// Die Kollision selbst steht in collideAxis (js/04-figuren-kollision.js, type 'oneway'); Wand-/Seil-Prüfung in
// js/08-figur-physik-seil.js (touchingWall, lineClear) und spotFree/playerBlocked ignorieren den Steg.
// Rolle: beide Figuren nutzen ihn gleich – er macht Wege nach oben kurz (durchspringen) und gibt Schweinchen und
// Affe Stellen zum Landen; als Ersatz für Wände taugt er nicht (kein Wandsprung), dafür bleibt der Haken erreichbar.
const ONEWAY_DICKE = 12;   // so dick wird der Steg gezeichnet (Kollision: nur die Oberkante)
function istEinseitig(s){ return s.type === 'oneway'; }
// Landet die Figur in diesem Schritt von oben auf dem Steg? (vorher Füße über der Oberkante, jetzt darauf/darunter)
function einseitigLandung(player, s){
  if(player.vy <= 0) return false;
  const vorher = player.y - player.vy;
  if(vorher > s.y + COLLIDE_EPS || player.y < s.y) return false;
  const ox = Math.min(player.x + player.w/2, s.x + s.w) - Math.max(player.x - player.w/2, s.x);
  return ox > COLLIDE_EPS;
}
ELEMENT_SOLID_TYPEN.add('oneway');
elementRegistrieren({
  id: 'einseitig', name: 'Einseitige Plattform', feld: 'oneways',
  editor: {
    werkzeug: 'oneway', label: 'Steg (einseitig)', gruppe: 'gelaende', vor: 'fake', art: 'kachel', ziehbar: true,
    titel: 'Einseitige Plattform (Steg): von unten durchspringbar, von oben stehbar; kein Wandsprung an der Seite, Seil-Sicht geht hindurch',
    farbe: '#c8955a', kachelFarbe: 'rgba(200,149,90,0.18)',
    zeichnen(ctx, c, r, TILE){   // Brett oben im Kästchen + Pfeil nach oben
      const X = c*TILE, Y = r*TILE;
      ctx.fillStyle = '#c8955a'; ctx.fillRect(X, Y, TILE, 11);
      ctx.strokeStyle = '#6b4a22'; ctx.lineWidth = 2; ctx.strokeRect(X + 1, Y + 1, TILE - 2, 9);
      ctx.strokeStyle = 'rgba(255,235,200,.7)'; ctx.lineWidth = 2;
      const mx = X + TILE/2;
      ctx.beginPath(); ctx.moveTo(mx, Y + TILE - 6); ctx.lineTo(mx, Y + 16); ctx.moveTo(mx - 5, Y + 21); ctx.lineTo(mx, Y + 16); ctx.lineTo(mx + 5, Y + 21); ctx.stroke();
    },
    exportieren: (zellen, TILE, mergeRects) => mergeRects(zellen).map(r => ({...r, h: ONEWAY_DICKE})),
  },
  spiel: {
    laden(daten){
      for(const o of (daten.oneways || [])) solids.push({x: o.x, y: o.y, w: o.w, h: o.h || ONEWAY_DICKE, type: 'oneway'});
    },
    // Holzsteg mit Brettfugen und zwei Stützbalken je Kästchen
    zeichnen(){
      for(const s of solids){
        if(s.type !== 'oneway') continue;
        const x = Math.round(s.x - camX);
        if(x + s.w < -20 || x > VW + 20) continue;
        ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(x + 3, s.y + ONEWAY_DICKE, s.w - 6, 4);
        for(let k = 0; k < s.w; k += 40){   // Stützen
          ctx.fillStyle = '#7a5428';
          ctx.beginPath(); ctx.moveTo(x + k + 8, s.y + ONEWAY_DICKE); ctx.lineTo(x + k + 20, s.y + ONEWAY_DICKE + 9); ctx.lineTo(x + k + 32, s.y + ONEWAY_DICKE);
          ctx.lineWidth = 3; ctx.strokeStyle = '#7a5428'; ctx.stroke();
        }
        const gr = ctx.createLinearGradient(0, s.y, 0, s.y + ONEWAY_DICKE);
        gr.addColorStop(0, '#e2b47a'); gr.addColorStop(1, '#a8743c');
        ctx.fillStyle = gr; roundRect(x, s.y, s.w, ONEWAY_DICKE, 4); ctx.fill();
        ctx.strokeStyle = '#6b4a22'; ctx.lineWidth = 1.5; roundRect(x + 0.75, s.y + 0.75, s.w - 1.5, ONEWAY_DICKE - 1.5, 4); ctx.stroke();
        ctx.strokeStyle = 'rgba(80,50,20,.45)'; ctx.lineWidth = 1;   // Fugen
        for(let k = 20; k < s.w; k += 20){ ctx.beginPath(); ctx.moveTo(x + k, s.y + 2); ctx.lineTo(x + k, s.y + ONEWAY_DICKE - 2); ctx.stroke(); }
        ctx.fillStyle = 'rgba(255,240,210,.55)'; ctx.fillRect(x + 3, s.y + 1.5, s.w - 6, 1.5);
      }
    },
  },
});
