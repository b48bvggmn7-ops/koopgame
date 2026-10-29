// elemente/blattfloss.js – Element „Blatt-Floß“ (Dschungel-Neu; Punkt-Element, siehe 00-register.js).
// Ein großes, festes Blatt (3 Kästchen breit) auf einer Ranken-Schiene nach rechts (Editor-Auswahl „Schiene“: so viele
// Kästchen weit). Nur der Seiten-Wind des Affen (js/34-koop-aktionen.js, pusteTrifft) schiebt es – in Blasrichtung, bis zum
// Ende der Schiene; ohne Wind gleitet es kurz aus und bleibt dort liegen (Neustart/Tod: zurück an den Anfang).
// Wer darauf steht, fährt mit. Rolle: der Affe pustet, das Schweinchen (oder der Affe, solange das Schweinchen ihn nicht
// braucht) fährt; oft muss der Affe erst an einen Platz, von dem aus sein Wind das Blatt trifft.
// Im Spiel: solids mit type 'blatt' {x, y, w, h, x0, x1 (Schiene), v} – zeichnet sich selbst (ELEMENT_SOLID_TYPEN).
const BLATT_BREITE = 120, BLATT_DICKE = 18;
const BLATT_SCHUB = 0.22;      // px/Schritt² bei vollem Wind
const BLATT_MAX = 3.2;         // höchstens so schnell (px/Schritt)
const BLATT_AUSLAUF = 0.9;     // ohne Wind: Tempo je Schritt mal diesem Wert
let blattFloesse = [];
ELEMENT_SOLID_TYPEN.add('blatt');
function blattBild(g, x, y, w, schwank){
  g.save(); g.translate(x + w/2, y + 6); g.rotate(schwank || 0);
  const L = w/2 + 4;
  g.fillStyle = '#2f6b2a';
  g.beginPath(); g.moveTo(-L, 0); g.quadraticCurveTo(-L*0.4, -15, L*0.2, -11); g.quadraticCurveTo(L*0.85, -7, L + 6, 2);
  g.quadraticCurveTo(L*0.6, 13, 0, 12); g.quadraticCurveTo(-L*0.6, 11, -L, 0); g.fill();
  const gr = g.createLinearGradient(0, -12, 0, 12);
  gr.addColorStop(0, '#9fe07a'); gr.addColorStop(0.55, '#6cbb53'); gr.addColorStop(1, '#3f8a37');
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(-L + 3, 0); g.quadraticCurveTo(-L*0.4, -12.5, L*0.2, -9); g.quadraticCurveTo(L*0.82, -5.5, L + 2, 2);
  g.quadraticCurveTo(L*0.6, 10.5, 0, 9.5); g.quadraticCurveTo(-L*0.6, 9, -L + 3, 0); g.fill();
  g.strokeStyle = 'rgba(40,90,35,.75)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-L + 6, 0.5); g.quadraticCurveTo(0, -2, L, 2); g.stroke();
  g.lineWidth = 1;
  for(let i = -3; i <= 3; i++){ const px = i*L*0.26; g.beginPath(); g.moveTo(px, -0.8 + i*0.1); g.lineTo(px + L*0.13, -7 + Math.abs(i)*0.6); g.moveTo(px, -0.4); g.lineTo(px + L*0.12, 6.5 - Math.abs(i)*0.5); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.ellipse(-L*0.35, -6, L*0.28, 2, -0.12, 0, Math.PI*2); g.fill();
  g.restore();
}
elementRegistrieren({
  id: 'blattfloss', name: 'Blatt-Floß', feld: 'blattFloesse',
  editor: {
    werkzeug: 'blatt', gruppe: 'bewegung', vor: 'move', art: 'punkt', ziehbar: false, farbe: '#6cbb53',
    titel: 'Blatt-Floß: großes Blatt (3 Kästchen) auf einer Schiene nach rechts; nur der Seiten-Wind des Affen schiebt es, ' +
           'wer darauf steht, fährt mit. Setzen am linken Ende (oberste Reihe = Stehfläche)',
    optionen: [{key: 'schiene', label: 'Schiene', zahl: true, titel: 'so viele Kästchen weit kann der Wind das Blatt nach rechts schieben',
                werte: [['4', '4 Kästchen'], ['6', '6 Kästchen'], ['8', '8 Kästchen'], ['10', '10 Kästchen'], ['14', '14 Kästchen']]}],
    bereich: p => Array.from({length: 3 + (Number(p.schiene) || 6)}, (_, k) => [p.c + k, p.r]),   // Blatt + gezeichnete Schiene
    zeichnen(ctx, c, r, TILE, p){
      const n = Number(p.schiene) || 6;
      ctx.strokeStyle = 'rgba(90,160,79,.8)'; ctx.setLineDash([6, 4]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(c*TILE, r*TILE + 6); ctx.lineTo((c + 3 + n)*TILE, r*TILE + 6); ctx.stroke(); ctx.setLineDash([]);
      blattBild(ctx, c*TILE, r*TILE, 3*TILE, 0);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('→' + n, (c + 3 + n)*TILE - 10, r*TILE + 20);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, schiene: Number(p.schiene) || 6})),
  },
  spiel: {
    laden(daten){
      blattFloesse = (daten.blattFloesse || []).map(b => {
        const s = {x: b.x, y: b.y, w: BLATT_BREITE, h: BLATT_DICKE, type: 'blatt', x0: b.x, x1: b.x + (Number(b.schiene) || 6)*40, v: 0};
        solids.push(s); return s;
      });
    },
    zuruecksetzen(){ for(const s of blattFloesse){ s.x = s.x0; s.v = 0; } },
    schritt(figuren){
      for(const s of blattFloesse){
        // Seiten-Wind schiebt; nicht das Blatt, auf dem der Pustende selbst steht
        const st = pusteStrahlJetzt, k = st && st.dir !== 'hoch' && st.von.standingOn !== s ? pusteTrifft({x: s.x, y: s.y - 6, w: s.w, h: s.h + 12}) : 0;
        if(k > 0) s.v = Math.max(-BLATT_MAX, Math.min(BLATT_MAX, s.v + st.dir*BLATT_SCHUB*k));
        else { s.v *= BLATT_AUSLAUF; if(Math.abs(s.v) < 0.03) s.v = 0; }
        if(!s.v) continue;
        let nx = Math.max(s.x0, Math.min(s.x1, s.x + s.v));
        // nicht in Wände/Boden schieben (anderes festes Teil auf der Höhe des Blatts)
        const fest = solids.some(o => o !== s && !o.gone && o.type !== 'oneway' && o.type !== 'fake' && o.type !== 'door' &&
          nx < o.x + o.w && nx + s.w > o.x && s.y < o.y + o.h && s.y + s.h > o.y);
        if(fest){ s.v = 0; continue; }
        const dx = nx - s.x;
        if(nx === s.x0 || nx === s.x1) s.v = 0;
        // wer darauf steht, fährt mit (nur, wenn dort Platz ist)
        for(const P of figuren){
          if(!P || !P.grounded || Math.abs(P.y - s.y) > 2 || P.x + P.w/2 <= s.x || P.x - P.w/2 >= s.x + s.w) continue;
          if(spotFree(P.x + dx, P.y, P)) P.x += dx;
        }
        s.x = nx;
      }
    },
    zeichnen(){
      const t = performance.now()*0.001;
      for(const s of blattFloesse){
        const x0 = s.x0 - camX, x1 = s.x1 + s.w - camX;
        if(x1 < -40 || x0 > VW + 40) continue;
        // Ranken-Schiene mit kleinen Knoten
        ctx.strokeStyle = 'rgba(60,110,50,.65)'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(x0, s.y + 6); for(let x = x0; x <= x1; x += 20) ctx.lineTo(x, s.y + 6 + Math.sin(x*0.08)*1.5); ctx.stroke();
        ctx.fillStyle = '#4f8f3f'; for(const x of [x0, x1]){ ctx.beginPath(); ctx.arc(x, s.y + 6, 4, 0, Math.PI*2); ctx.fill(); }
        const schwank = Math.sin(t*1.7 + s.x0*0.01)*0.015 + s.v*0.012;
        glanzSchatten(s.x - camX + s.w/2, s.y + 26, s.w*0.4, 3);
        blattBild(ctx, Math.round(s.x - camX), s.y, s.w, schwank);
      }
    },
  },
});
