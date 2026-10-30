// elemente/flossrad.js – Element „Floß-Rad“ (Dschungel-Neu; Punkt-Element mit Verknüpfungs-Nummer, siehe 00-register.js).
// Nutzerwunsch: „ein Rad, das ich auf die andere Seite stellen kann, damit ich den Affen als Schwein rüberholen kann“ – im
// Editor unter „Schalter“, mit derselben Nummer wie sein Blatt-Floß verknüpft (ohne Nummer: das nächste Floß in
// FLOSSRAD_REICHWEITE, so wie es zuerst war). Ein Kurbelrad auf einem Pfahl, eine Liane führt zum Ende der Floß-Schiene.
// Bedienung (Nutzer: „cooler, wenn ich in eine Richtung drücke“): vor dem Rad die Hebel-Taste halten (Affe J, Schweinchen
// Num 2, Controller ○) und dazu links/rechts drücken -> das Blatt fährt in diese Richtung, solange beides gehalten wird; die
// Figur bleibt dabei stehen, schaut zum Rad und kurbelt (Arm-Bewegung über leverAnim, Rad und Liane drehen/schwingen mit).
// Rolle: wer auf der anderen Seite steht, schickt das Blatt hinüber und holt den Partner zurück.
// Logik: flossradVorher (aus neueBewegungVorher, js/32 – Figur steht, kurbelt) und spiel.schritt (Rad dreht);
// das Blatt bewegt sich in elemente/blattfloss.js (Feld radZug).
const FLOSSRAD_REICHWEITE = 10*40;   // px: ohne Nummer darf das Rad so weit vom Ende einer Schiene stehen
const FLOSSRAD_GRIFF_X = 38, FLOSSRAD_GRIFF_Y = 40;   // px: so nah muss die Figur am Rad stehen
const FLOSSRAD_HOEHE = 30;           // px: Nabe über dem Boden
const FLOSSRAD_KURBEL_TAKT = 16;     // Schritte je Arm-Zug beim Kurbeln
const FLOSSRAD_DREH = 0.13;          // Drehung des Rads je Schritt (Bogenmaß), solange gekurbelt wird
const FLOSSRAD_STAND = 28;           // px: so weit neben der Radmitte steht, wer kurbelt
let flossRaeder = [];                // {x, y (Fußpunkt), link, winkel, dreh (Tempo fürs Auslaufen), floss, kurbler}
// zugehöriges Blatt-Floß (je Rad einmal): gleiche Nummer – sonst das nächste Schienen-Ende in Reichweite, etwa gleiche Höhe
function flossradFloss(R){
  if(R.floss !== undefined) return R.floss;
  const alle = typeof blattFloesse !== 'undefined' ? blattFloesse : [];
  let best = R.link ? alle.find(s => s.link === R.link) || null : null;
  if(!best && !R.link){
    let bd = Infinity;
    for(const s of alle){
      if(Math.abs(s.y - R.y) > 4*40) continue;
      const d = Math.min(Math.abs(R.x - s.x0), Math.abs(R.x - (s.x1 + s.w)));
      if(d <= FLOSSRAD_REICHWEITE && d < bd){ bd = d; best = s; }
    }
  }
  return (R.floss = best);
}
const flossradNah = (P, R) => !!P && Math.abs(P.x - R.x) <= FLOSSRAD_GRIFF_X && Math.abs(P.y - R.y) <= FLOSSRAD_GRIFF_Y;
const flossradTaste = P => [P.keys.use, P.keys.padUse].some(k => k && KEYS[k]);
// Haken aus neueBewegungVorher (js/32): hält die Figur am Rad die Hebel-Taste, steht sie still und kurbelt (true = Tempo
// gesetzt, normale Physik aus). Mit links/rechts zieht sie das Blatt in diese Richtung.
function flossradVorher(P, moveDir){
  if(!P.grounded || P.hookAttached || !flossradTaste(P)) return false;
  const R = flossRaeder.find(R => flossradNah(P, R) && flossradFloss(R));
  if(!R) return false;
  // tritt neben das Rad (sonst verdeckt die Figur Rad und Kurbel) und bleibt dort stehen; etwas Schwerkraft, damit sie sicher
  // auf dem Boden bleibt
  const platz = R.x + (P.x >= R.x ? FLOSSRAD_STAND : -FLOSSRAD_STAND);
  P.vx = Math.max(-1.5, Math.min(1.5, (platz - P.x)*0.3)); P.vy = GRAVITY;
  P.facing = Math.sign(R.x - P.x) || P.facing;
  if(moveDir){
    const s = flossradFloss(R), amEnde = (moveDir > 0 && s.x >= s.x1) || (moveDir < 0 && s.x <= s.x0);
    s.radZug = moveDir;
    R.kurbler = P; R.richtung = moveDir; R.amEnde = amEnde;
    P._kurbelT = (P._kurbelT || 0) + 1;
    if(P._kurbelT % FLOSSRAD_KURBEL_TAKT === 1){   // Arm-Zug (dieselbe Bewegung wie beim Hebel, js/33 bzw. 10)
      P.leverAnim = {t0: performance.now(), dir: P.facing};
      if(!amEnde && typeof SFX !== 'undefined' && SFX.lever) SFX.lever(moveDir > 0, R.x);
    }
  } else P._kurbelT = 0;
  return true;
}
// Bild: Pfahl mit Ranke, Holzrad mit Speichen und Griff (dreht sich), Nabe mit Edelstein in der Nummernfarbe
function flossradBild(g, x, y, winkel, s, farbe){
  s = s || 1;
  g.save(); g.translate(x, y); g.scale(s, s);
  const H = FLOSSRAD_HOEHE;
  const holz = g.createLinearGradient(-4, 0, 4, 0); holz.addColorStop(0, '#6b4019'); holz.addColorStop(0.5, '#a86f3a'); holz.addColorStop(1, '#5e3814');
  g.fillStyle = '#3b2412'; g.fillRect(-4.5, -H - 1, 9, H + 1);
  g.fillStyle = holz; g.fillRect(-3.2, -H, 6.4, H);
  g.strokeStyle = '#5aa04f'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(-3, -2); g.quadraticCurveTo(5, -9, -3, -17); g.stroke();
  g.fillStyle = '#7cc36b'; g.beginPath(); g.ellipse(3, -9, 3, 1.7, 0.5, 0, Math.PI*2); g.fill();
  g.translate(0, -H); g.rotate(winkel || 0);
  g.lineCap = 'round';
  g.strokeStyle = '#3b2412'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 15, 0, Math.PI*2); g.stroke();
  g.strokeStyle = '#a86f3a'; g.lineWidth = 3.6; g.stroke();
  for(let i = 0; i < 6; i++){ const a = i*Math.PI/3; g.strokeStyle = '#3b2412'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a)*14, Math.sin(a)*14); g.stroke();
    g.strokeStyle = '#8a5a2b'; g.lineWidth = 1.8; g.stroke(); }
  g.strokeStyle = '#3b2412'; g.lineWidth = 5; g.beginPath(); g.moveTo(15, 0); g.lineTo(21, 0); g.stroke();   // Griff
  g.fillStyle = '#6b4019'; g.beginPath(); g.arc(22, 0, 3.6, 0, Math.PI*2); g.fill();
  g.rotate(-(winkel || 0));   // Lichtkante bleibt oben
  g.strokeStyle = 'rgba(255,225,170,.45)'; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, 15.5, Math.PI*1.1, Math.PI*1.6); g.stroke();
  g.fillStyle = '#3b2412'; g.beginPath(); g.arc(0, 0, 5.4, 0, Math.PI*2); g.fill();
  if(typeof elementEdelstein === 'function' && g === ctx && farbe) elementEdelstein(0, 0, 4.4, farbe);
  else { g.fillStyle = farbe || '#aab8c8'; g.beginPath(); g.arc(0, 0, 3.8, 0, Math.PI*2); g.fill(); }
  g.restore();
}
elementRegistrieren({
  id: 'flossrad', name: 'Floß-Rad', feld: 'flossRaeder',
  editor: {
    werkzeug: 'flossrad', gruppe: 'logik', vor: '#linkSelect', art: 'punkt', ziehbar: false, farbe: '#a86f3a',
    mitNummer: true, nummerName: 'Floß-Rad',
    titel: 'Floß-Rad: zieht das Blatt-Floß mit derselben Verknüpfungs-Nummer. Im Spiel davor die Hebel-Taste halten und ' +
           'links/rechts drücken – das Blatt fährt in diese Richtung (z. B. den Partner herüberholen)',
    zeichnen(ctx, c, r, TILE, p){
      flossradBild(ctx, c*TILE + TILE/2, (r + 1)*TILE, 0.4, TILE/40*0.8, typeof linkColor === 'function' ? linkColor(p.link) : '#ff9f43');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.strokeText(String(p.link), c*TILE + TILE - 8, r*TILE + 9); ctx.fillText(String(p.link), c*TILE + TILE - 8, r*TILE + 9);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE + TILE, link: p.link})),
  },
  spiel: {
    laden(daten){ flossRaeder = (daten.flossRaeder || []).map(R => ({x: R.x, y: R.y, link: R.link || 0, winkel: 0, dreh: 0, floss: undefined, kurbler: null, richtung: 0, amEnde: false})); },
    zuruecksetzen(){ for(const R of flossRaeder){ R.kurbler = null; R.dreh = 0; } },
    schritt(){
      for(const R of flossRaeder){
        // dreht, solange in diesem Schritt gekurbelt wurde (flossradVorher), sonst kurz auslaufen
        const ziel = R.kurbler && !R.amEnde ? R.richtung*FLOSSRAD_DREH : 0;
        R.dreh += (ziel - R.dreh)*(ziel ? 0.35 : 0.12);
        if(Math.abs(R.dreh) < 0.002) R.dreh = 0;
        R.winkel = (R.winkel + R.dreh) % (Math.PI*2);
        R.kurbler = null;
      }
    },
    zeichnen(){
      const t = performance.now()*0.001;
      for(const R of flossRaeder){
        const x = Math.round(R.x - camX);
        if(x < -80 || x > VW + 80) continue;
        const s = flossradFloss(R), col = R.link ? linkColor(R.link) : '#c9d3dd';
        // Liane vom Rad zum Ende der Schiene: hängt locker durch und schwingt leicht; beim Kurbeln strafft sie sich und zittert
        if(s && typeof blattSchieneEnden === 'function'){
          const E = blattSchieneEnden(s), ex = (Math.abs(R.x - E.b) < Math.abs(R.x - E.a) ? E.b : E.a) - camX;
          const zug = Math.min(1, Math.abs(R.dreh)/FLOSSRAD_DREH), wackel = Math.sin(t*1.6 + R.x*0.01)*1.5 + zug*Math.sin(t*23)*0.8;
          lianeZeichnen(x, R.y - FLOSSRAD_HOEHE, ex, E.y, 0, wackel, R.x, 1.4 - zug*1.1);
        }
        flossradBild(ctx, x, R.y, R.winkel, 1, col);
        aktionsHinweis(x, R.y - FLOSSRAD_HOEHE - 62, flossradNah(p1, R), flossradNah(p2, R));   // Tasten-Blase wie am Hebel
      }
    },
  },
});
