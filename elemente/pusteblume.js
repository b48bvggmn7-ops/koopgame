// elemente/pusteblume.js – Element „Pusteblume“ (Punkt-Element; Aufbau siehe 00-register.js). Nutzerwunsch 08.11.
// Eine schwebende Pusteblume im Nebel. Fliegt das Schweinchen hindurch (und sein Schirm-Balken ist nicht voll), lösen sich
// die Samen, fliegen zum Schirm und füllen den Flug-Balken auf (js/35 schirmAuffuellen: „halb“ = SCHIRM_PUSTE_HALB,
// „ganz“ = voll). Danach wächst sie in PUSTEBLUME_NACHWACHSEN Schritten nach (Samen erscheinen einer nach dem anderen).
// Mehrere in einem Flug = eine kleine Melodie (jede einen Ton höher). Der Affe streift sie nur (sie wackelt).
// Rolle: das Schweinchen fliegt mit ihnen weite Strecken – Reihen von Pusteblumen sind Flugrouten, die man treffen muss.
const PUSTEBLUME_RADIUS = 26;          // px: so nah (Mitte zu Figurmitte, plus halbe Figurbreite) sammelt das Schweinchen sie ein
const PUSTEBLUME_NACHWACHSEN = 300;    // Schritte (5 Spielsekunden)
const SCHIRM_PUSTE_HALB = 0.5;         // „halb“: so viel füllt sie auf
const PUSTEBLUME_SAMEN = 30;           // Samen am Kopf (nur Aussehen)
let pusteblumen = [];                  // {x, y (Mitte), menge, wuchs (0…1), wackel}

function pusteblumeBild(c, x, y, wuchs, wackel, t, nah, gr){
  gr = gr || 1;
  c.save(); c.translate(x, y); c.scale(gr, gr);
  // dunkler weicher Grund (hebt die weißen Samen vom hellen Nebel ab) + warmer Schein (heller, wenn das Schweinchen sie
  // gebrauchen kann)
  const dg = c.createRadialGradient(0, 0, 4, 0, 0, 27);
  dg.addColorStop(0, `rgba(28,44,34,${0.42*(0.4 + 0.6*wuchs)})`); dg.addColorStop(1, 'rgba(28,44,34,0)');
  c.fillStyle = dg; c.beginPath(); c.arc(0, 0, 27, 0, Math.PI*2); c.fill();
  const hr = 40 + 10*nah, sg = c.createRadialGradient(0, 0, 0, 0, 0, hr);
  sg.addColorStop(0, `rgba(255,236,170,${(0.28 + 0.3*nah)*(0.3 + 0.7*wuchs)})`); sg.addColorStop(0.4, `rgba(255,240,200,${(0.1 + 0.14*nah)*wuchs})`); sg.addColorStop(1, 'rgba(255,240,200,0)');
  c.fillStyle = sg; c.beginPath(); c.arc(0, 0, hr, 0, Math.PI*2); c.fill();
  // Stiel (abgebrochen, schwebt) mit kleinem Blatt
  c.strokeStyle = '#3f5a32'; c.lineWidth = 2.4; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, 4); c.quadraticCurveTo(3 + wackel*2, 18, -3, 32); c.stroke();
  c.fillStyle = '#5f8448'; c.beginPath(); c.ellipse(-1, 22, 6, 2.4, -0.7, 0, Math.PI*2); c.fill();
  // Samen: feine Fäden mit Schirmchen, im Kreis; beim Nachwachsen erscheinen sie einer nach dem anderen
  const n = Math.floor(PUSTEBLUME_SAMEN*wuchs + 0.001);
  if(wuchs > 0.05){   // flauschige Kugel (durchscheinend), wächst mit
    const kr = 6 + 13*wuchs, kg = c.createRadialGradient(-2, -3, 1, 0, 0, kr);
    kg.addColorStop(0, 'rgba(255,255,255,.5)'); kg.addColorStop(0.7, 'rgba(250,252,255,.22)'); kg.addColorStop(1, 'rgba(250,252,255,0)');
    c.fillStyle = kg; c.beginPath(); c.arc(0, 0, kr, 0, Math.PI*2); c.fill();
  }
  c.lineWidth = 0.8;
  for(let i = 0; i < n; i++){
    const w = i/PUSTEBLUME_SAMEN*Math.PI*2 + Math.sin(i*7.3)*0.08 + Math.sin(t*3 + i)*0.03*(1 + wackel*6);
    const l = 15 + Math.sin(i*3.1)*1.5, cx = Math.cos(w), sx = Math.sin(w);
    c.strokeStyle = 'rgba(255,255,255,.75)';
    c.beginPath(); c.moveTo(cx*4, sx*4); c.lineTo(cx*l, sx*l); c.stroke();
    c.fillStyle = '#ffffff'; c.strokeStyle = 'rgba(50,60,50,.4)'; c.lineWidth = 0.7;
    c.beginPath(); c.arc(cx*l, sx*l, 2, 0, Math.PI*2); c.fill(); c.stroke(); c.lineWidth = 0.8;
  }
  // Mitte
  c.fillStyle = '#8c7a45'; c.beginPath(); c.arc(0, 0, 4.4, 0, Math.PI*2); c.fill();
  c.fillStyle = 'rgba(255,248,220,.6)'; c.beginPath(); c.arc(-1.2, -1.3, 1.6, 0, Math.PI*2); c.fill();
  c.restore();
}
function pusteblumenSchritt(figuren){
  for(const b of pusteblumen){
    if(b.wuchs < 1){ b.wuchs = Math.min(1, b.wuchs + 1/PUSTEBLUME_NACHWACHSEN); if(b.wuchs >= 1) b._fertigT = performance.now(); }
    b.wackel *= 0.93;
    for(const P of figuren){
      if(!P || (deathState && deathState.victim === P)) continue;
      const d = Math.hypot(P.x - b.x, P.y - P.h/2 - b.y);
      if(d > PUSTEBLUME_RADIUS + P.w/2) continue;
      if(!P.male && b.wuchs >= 1 && P.schirmKraft !== undefined && P.schirmKraft < 0.999 && typeof schirmAuffuellen === 'function'){
        b.wuchs = 0; b.wackel = 1;
        schirmAuffuellen(P, b.menge === 'voll' ? 1 : SCHIRM_PUSTE_HALB, b);
      } else b.wackel = Math.max(b.wackel, 0.6);   // nur gestreift (Affe / Schirm voll)
    }
  }
}
elementRegistrieren({
  id: 'pusteblume', name: 'Pusteblume', feld: 'pusteblumen',
  editor: {
    werkzeug: 'pusteblume', gruppe: 'haken', vor: 'bounce', art: 'punkt', ziehbar: false, farbe: '#e8f6ff',
    titel: 'Pusteblume: schwebt; das Schweinchen fliegt hindurch und füllt seinen Schirm-Balken auf (halb oder ganz), wächst nach 5 s nach',
    optionen: [{key: 'menge', label: 'Füllt', titel: 'wie viel vom Schirm-Balken die Pusteblume auffüllt', werte: [['halb', 'halb'], ['voll', 'ganz']]}],
    zeichnen(ctx, c, r, TILE, p){
      pusteblumeBild(ctx, c*TILE + TILE/2, r*TILE + TILE/2 - 4, 1, 0, 0, 0, TILE/40*0.8);
      if(p && p.menge === 'voll'){ ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.strokeText('×2', c*TILE + TILE - 8, r*TILE + 8); ctx.fillText('×2', c*TILE + TILE - 8, r*TILE + 8); }
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE + TILE/2, ...(p.menge === 'voll' ? {menge: 'voll'} : {})})),
  },
  spiel: {
    laden(daten){ pusteblumen = (daten.pusteblumen || []).map(b => ({x: b.x, y: b.y, menge: b.menge === 'voll' ? 'voll' : 'halb', wuchs: 1, wackel: 0})); },
    zuruecksetzen(){ for(const b of pusteblumen){ b.wuchs = 1; b.wackel = 0; } },
    schritt(figuren){ if(pusteblumen.length) pusteblumenSchritt(figuren); },
    zeichnen(){
      if(!pusteblumen.length) return;
      const t = performance.now()*0.001, S = [p1, p2].find(P => P && !P.male);
      for(const b of pusteblumen){
        const x = b.x - camX; if(x < -60 || x > VW + 60) continue;
        const nah = S && S.schirmKraft < 0.999 && b.wuchs >= 1 ? Math.max(0, 1 - Math.hypot(S.x - b.x, S.y - b.y)/220) : 0;
        const bob = Math.sin(t*1.6 + b.x*0.013)*3;
        pusteblumeBild(ctx, x, b.y + bob, b.wuchs, b.wackel, t, nah, 1);
        if(b._fertigT && performance.now() - b._fertigT < 500){   // wieder da: kurzes Funkeln
          const q = (performance.now() - b._fertigT)/500;
          ctx.strokeStyle = `rgba(255,255,255,${1 - q})`; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(x, b.y + bob, 18 + q*14, 0, Math.PI*2); ctx.stroke();
        }
      }
    },
  },
});
