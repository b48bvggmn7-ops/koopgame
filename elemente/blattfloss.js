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
// Aussehen (Nutzer: „sieht echt nicht gut aus“): ein breites, dickes Dschungelblatt, leicht von oben gesehen – Oberseite mit
// Mittelrippe und Adern, aufgebogene Spitze und Stielende, dunkle Unterseite als Dicke. Es hängt wie eine Gondel an zwei kurzen
// Lianen an einer straff gespannten Ranken-Schiene darüber; deren Enden hängen an Material darüber oder aus dem Blätterdach
// (wie die Haken, js/12b) – so schwebt nichts einfach in der Luft. Nur Aussehen.
const BLATT_SCHIENE_HOCH = 72;   // px: so hoch über der Stehfläche läuft die Schiene (über den Köpfen)
const BLATT_HAENGER = 14;        // px: Abstand der beiden Hänge-Lianen von den Blatt-Enden
function blattBild(g, x, y, w, schwank){
  g.save(); g.translate(x + w/2, y + 4); g.rotate(schwank || 0);
  const L = w/2;
  // Unterseite / Dicke (dunkel), Spitze vorn und Stielende hinten leicht hochgebogen
  g.fillStyle = '#24501f';
  g.beginPath(); g.moveTo(-L - 2, -6); g.quadraticCurveTo(-L*0.55, -11, 0, -10); g.quadraticCurveTo(L*0.62, -10, L + 10, -9);
  g.quadraticCurveTo(L*0.6, 13, 0, 12); g.quadraticCurveTo(-L*0.62, 12, -L - 2, -6); g.fill();
  // Oberseite (die Stehfläche liegt oben am Rand)
  const gr = g.createLinearGradient(0, -10, 0, 6);
  gr.addColorStop(0, '#a6e47c'); gr.addColorStop(0.5, '#6fc055'); gr.addColorStop(1, '#3f8a37');
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(-L, -6); g.quadraticCurveTo(-L*0.55, -10.5, 0, -9.5); g.quadraticCurveTo(L*0.62, -9.5, L + 8, -9);
  g.quadraticCurveTo(L*0.55, 5, 0, 5); g.quadraticCurveTo(-L*0.6, 5, -L, -6); g.fill();
  // heller Rand vorne (Licht von oben) und dunkle Kante unten
  g.strokeStyle = 'rgba(225,255,190,.55)'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(-L + 2, -6.5); g.quadraticCurveTo(-L*0.55, -10.2, 0, -9.2); g.quadraticCurveTo(L*0.62, -9.2, L + 6, -8.8); g.stroke();
  g.strokeStyle = 'rgba(20,45,16,.7)'; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(-L - 1, -5); g.quadraticCurveTo(-L*0.6, 12.5, 0, 12); g.quadraticCurveTo(L*0.6, 12.5, L + 10, -9); g.stroke();
  // Mittelrippe und Adern
  g.strokeStyle = 'rgba(214,240,170,.8)'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(-L + 4, -5); g.quadraticCurveTo(0, -1.5, L + 5, -8.5); g.stroke();
  g.strokeStyle = 'rgba(40,95,34,.55)'; g.lineWidth = 1;
  for(let i = -3; i <= 3; i++){
    const px = i*L*0.27, py = -3 - (i + 3)*0.35;
    g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + L*0.1, py - 3, px + L*0.18, -8.6 + Math.abs(i)*0.2);
    g.moveTo(px, py + 0.5); g.quadraticCurveTo(px + L*0.1, py + 4, px + L*0.17, 3.5 - Math.abs(i)*0.4); g.stroke();
  }
  // Stiel hinten, eingerollt
  g.strokeStyle = '#3d6f2e'; g.lineWidth = 2.6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-L, -5); g.quadraticCurveTo(-L - 9, -4, -L - 11, -11); g.quadraticCurveTo(-L - 12, -16, -L - 7, -15); g.stroke();
  // Tautropfen
  g.fillStyle = 'rgba(220,250,255,.75)'; g.beginPath(); g.ellipse(L*0.35, -4.5, 2.2, 1.6, 0, 0, Math.PI*2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(L*0.35 - 0.7, -5, 0.7, 0, Math.PI*2); g.fill();
  g.restore();
}
// Aufhänge-Höhe einer Schienen-Ende (Material darüber oder Blätterdach), je Floß einmal gemerkt
function blattSchieneEnden(s){
  if(s._enden) return s._enden;
  const y = s.y - BLATT_SCHIENE_HOCH, a = s.x0 - 8, b = s.x1 + s.w + 8;
  const hoch = x => typeof hakenAufhaengeY === 'function' ? hakenAufhaengeY(x, y) : null;
  return (s._enden = {y, a, b, ya: hoch(a), yb: hoch(b)});
}
function blattRingZeichnen(x, y){
  ctx.strokeStyle = 'rgba(20,12,6,.6)'; ctx.lineWidth = 4.2; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI*2); ctx.stroke();
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 2.6; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,220,160,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 4.6, Math.PI*1.1, Math.PI*1.7); ctx.stroke();
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
        if(k > 0) s.v = Math.max(-BLATT_MAX, Math.min(BLATT_MAX, s.v + pusteSeiteVon(st.dir)*BLATT_SCHUB*k*(pusteSchraeg(st.dir) ? 0.7 : 1)));
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
    // Schiene und ihre Aufhängung HINTER Boden/Wand (läuft sie durch Gelände, verschwindet sie dahinter)
    zeichnenHinten(){
      for(const s of blattFloesse){
        const E = blattSchieneEnden(s), a = E.a - camX, b = E.b - camX;
        if(b < -60 || a > VW + 60) continue;
        for(const [x, yo, wx] of [[a, E.ya, E.a], [b, E.yb, E.b]]){   // Enden: Liane nach oben bis zum Material bzw. ins Blätterdach
          lianeZeichnen(x + Math.sin(wx*0.013)*3, yo !== null ? yo : -SKY_ROOM - 10, x, E.y, 0.35, 0, wx);
          if(yo !== null && typeof hakenHalter === 'function') hakenHalter(x, yo, HAKEN_STIL.dschungel, 'dschungel');
        }
        lianeZeichnen(a, E.y, b, E.y, 0, 0, s.x0, 0);   // straff gespannte Ranken-Schiene
        for(const x of [a, b]){ ctx.fillStyle = '#3b2412'; ctx.beginPath(); ctx.ellipse(x, E.y, 5, 4, 0, 0, Math.PI*2); ctx.fill(); }   // Knoten
      }
    },
    zeichnen(){
      const t = performance.now()*0.001;
      for(const s of blattFloesse){
        const E = blattSchieneEnden(s);
        if(E.b - camX < -60 || E.a - camX > VW + 60) continue;
        const schwank = Math.sin(t*1.7 + s.x0*0.01)*0.015 + s.v*0.012, x = Math.round(s.x - camX);
        // zwei kurze Hänge-Lianen mit Ringen an der Schiene (schwingen leicht mit)
        for(const hx of [x + BLATT_HAENGER, x + s.w - BLATT_HAENGER]){
          const dy = (hx - (x + s.w/2))*Math.sin(schwank);
          lianeZeichnen(hx, E.y + 4, hx, s.y - 2 + dy, 0, 0, s.x0 + hx, 0);
          blattRingZeichnen(hx, E.y);
        }
        glanzSchatten(x + s.w/2, s.y + 30, s.w*0.38, 3);
        blattBild(ctx, x, s.y, s.w, schwank);
      }
    },
  },
});
