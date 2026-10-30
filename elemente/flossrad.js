// elemente/flossrad.js – Element „Floß-Rad“ (Dschungel-Neu; Punkt-Element, siehe 00-register.js).
// Nutzerwunsch: „ein Rad, das ich auf die andere Seite stellen kann, damit ich den Affen als Schwein rüberholen kann“.
// Ein Kurbelrad auf einem kurzen Holzpfahl, mit einer Liane zum nächsten Ende einer Blatt-Floß-Schiene verbunden (das
// nächste Blatt-Floß in FLOSSRAD_REICHWEITE). Wer davorsteht und die Hebel-Taste GEDRÜCKT HÄLT, dreht es: das Blatt fährt wie
// eine Fähre zum anderen Ende – liegt es beim Rad, fährt es weg, sonst wird es herangezogen (Richtung je neuem Drücken).
// Loslassen = anhalten. Rolle: wer auf der anderen Seite steht (oft das Schweinchen), schickt das Blatt hinüber und holt
// den Partner zurück; der Affe kann weiter pusten. Logik in spiel.schritt; das Blatt bewegt sich in elemente/blattfloss.js
// (Feld radZug: so zieht ein Rad in diesem Schritt).
const FLOSSRAD_REICHWEITE = 10*40;   // px: so weit darf das Rad (waagerecht) vom Ende einer Schiene entfernt stehen
const FLOSSRAD_GRIFF_X = 34, FLOSSRAD_GRIFF_Y = 40;   // px: so nah muss die Figur am Rad stehen
const FLOSSRAD_HOEHE = 30;           // px: Nabe über dem Boden
let flossRaeder = [];                // {x, y (Fußpunkt), winkel, halter, richtung, floss}
// zugehöriges Blatt-Floß (je Rad einmal): nächstes Schienen-Ende in Reichweite, ungefähr auf derselben Höhe
function flossradFloss(R){
  if(R.floss !== undefined) return R.floss;
  let best = null, bd = Infinity;
  for(const s of (typeof blattFloesse !== 'undefined' ? blattFloesse : [])){
    if(Math.abs(s.y - R.y) > 4*40) continue;
    const d = Math.min(Math.abs(R.x - s.x0), Math.abs(R.x - (s.x1 + s.w)));
    if(d <= FLOSSRAD_REICHWEITE && d < bd){ bd = d; best = s; }
  }
  return (R.floss = best);
}
function flossradHaelt(P, R){
  if(!P || !P.grounded || Math.abs(P.x - R.x) > FLOSSRAD_GRIFF_X || Math.abs(P.y - R.y) > FLOSSRAD_GRIFF_Y) return false;
  return [P.keys.use, P.keys.padUse].some(k => k && KEYS[k]);
}
// Bild: Pfahl, Holzrad mit Speichen und Griff (dreht sich), Nabe in Eisen
function flossradBild(g, x, y, winkel, s){
  s = s || 1;
  g.save(); g.translate(x, y); g.scale(s, s);
  const H = FLOSSRAD_HOEHE;
  const holz = g.createLinearGradient(-4, 0, 4, 0); holz.addColorStop(0, '#6b4019'); holz.addColorStop(0.5, '#a86f3a'); holz.addColorStop(1, '#5e3814');
  g.fillStyle = '#3b2412'; g.fillRect(-4.5, -H - 1, 9, H + 1);
  g.fillStyle = holz; g.fillRect(-3.2, -H, 6.4, H);
  g.translate(0, -H); g.rotate(winkel || 0);
  g.lineCap = 'round';
  g.strokeStyle = '#3b2412'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 15, 0, Math.PI*2); g.stroke();
  g.strokeStyle = '#a86f3a'; g.lineWidth = 3.6; g.stroke();
  g.strokeStyle = 'rgba(255,225,170,.45)'; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, 15.5, Math.PI*1.1, Math.PI*1.6); g.stroke();
  for(let i = 0; i < 6; i++){ const a = i*Math.PI/3; g.strokeStyle = '#3b2412'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a)*14, Math.sin(a)*14); g.stroke();
    g.strokeStyle = '#8a5a2b'; g.lineWidth = 1.8; g.stroke(); }
  // Griff außen am Rad
  g.strokeStyle = '#3b2412'; g.lineWidth = 5; g.beginPath(); g.moveTo(15, 0); g.lineTo(21, 0); g.stroke();
  g.fillStyle = '#6b4019'; g.beginPath(); g.arc(22, 0, 3.6, 0, Math.PI*2); g.fill();
  g.fillStyle = '#4b5563'; g.beginPath(); g.arc(0, 0, 4.2, 0, Math.PI*2); g.fill();
  g.fillStyle = '#aab8c8'; g.beginPath(); g.arc(-1, -1, 1.4, 0, Math.PI*2); g.fill();
  g.restore();
}
elementRegistrieren({
  id: 'flossrad', name: 'Floß-Rad', feld: 'flossRaeder',
  editor: {
    werkzeug: 'flossrad', gruppe: 'bewegung', vor: 'move', art: 'punkt', ziehbar: false, farbe: '#a86f3a',
    titel: 'Floß-Rad: neben das Ende einer Blatt-Floß-Schiene stellen (höchstens 10 Kästchen weit). Hebel-Taste gedrückt halten ' +
           '= das Blatt fährt zum anderen Ende (liegt es beim Rad: weg, sonst her) – z. B. den Partner herüberholen',
    zeichnen(ctx, c, r, TILE, p){ flossradBild(ctx, c*TILE + TILE/2, (r + 1)*TILE, 0.4, TILE/40*0.8); },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE + TILE})),
  },
  spiel: {
    laden(daten){ flossRaeder = (daten.flossRaeder || []).map(R => ({x: R.x, y: R.y, winkel: 0, halter: null, richtung: 0, floss: undefined})); },
    zuruecksetzen(){ for(const R of flossRaeder){ R.halter = null; R.richtung = 0; } },
    schritt(figuren){
      for(const R of flossRaeder){
        const s = flossradFloss(R);
        const P = figuren.find(P => flossradHaelt(P, R)) || null;
        if(!s || !P){ R.halter = null; continue; }
        if(R.halter !== P){   // neu gedrückt: Richtung festlegen – zum Ende, an dem das Blatt gerade NICHT ist
          R.halter = P;
          const radRechts = Math.abs(R.x - (s.x1 + s.w)) < Math.abs(R.x - s.x0);
          const beimRad = radRechts ? s.x > (s.x0 + s.x1)/2 : s.x < (s.x0 + s.x1)/2;
          R.richtung = (radRechts ? 1 : -1)*(beimRad ? -1 : 1);
          if(typeof SFX !== 'undefined' && SFX.lever) SFX.lever(true, R.x);
        }
        s.radZug = R.richtung;
        const amEnde = (R.richtung > 0 && s.x >= s.x1) || (R.richtung < 0 && s.x <= s.x0);
        if(!amEnde) R.winkel = (R.winkel + R.richtung*0.12) % (Math.PI*2);
      }
    },
    zeichnen(){
      for(const R of flossRaeder){
        const x = Math.round(R.x - camX);
        if(x < -60 || x > VW + 60) continue;
        // Liane vom Rad zum Ende der Schiene (zeigt, welches Blatt es zieht)
        const s = flossradFloss(R);
        if(s && typeof blattSchieneEnden === 'function'){
          const E = blattSchieneEnden(s), ex = (Math.abs(R.x - E.b) < Math.abs(R.x - E.a) ? E.b : E.a) - camX;
          lianeZeichnen(x, R.y - FLOSSRAD_HOEHE, ex, E.y, 0, 0, R.x, 0.6);
        }
        flossradBild(ctx, x, R.y, R.winkel, 1);
      }
    },
  },
});
