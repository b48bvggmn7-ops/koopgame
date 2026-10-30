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
const BLATT_SCHIENE_MAX = 40;  // Kästchen: so lang darf die Schiene im Editor gezogen werden
let blattFloesse = [];
ELEMENT_SOLID_TYPEN.add('blatt');
// Aussehen (Nutzer: „sieht echt nicht gut aus“): ein breites, dickes Dschungelblatt, leicht von oben gesehen – Oberseite mit
// Mittelrippe und Adern, aufgebogene Spitze und Stielende, dunkle Unterseite als Dicke. Es hängt wie eine Gondel an zwei kurzen
// Lianen an einer straff gespannten Ranken-Schiene darüber; deren Enden hängen an Material darüber oder aus dem Blätterdach
// (wie die Haken, js/12b) – so schwebt nichts einfach in der Luft. Nur Aussehen.
const BLATT_SCHIENE_HOCH = 72;   // px: so hoch über der Stehfläche läuft die Schiene (über den Köpfen)
const BLATT_HAENGER = 14;        // px: Abstand der beiden Hänge-Lianen von den Blatt-Enden
// Nutzer: „kann das Schwein IM Blatt-Floß stehen – mach das andersherum“: das Blatt ist eine Mulde (Spitze und Stielende hoch-
// gebogen); y = Stehfläche (Boden der Mulde). teil 'hinten' = Innenseite (hinter den Figuren), 'vorne' = vorderer Rand und
// Unterseite (vor den Figuren, verdeckt die Füße ein wenig – man steht drin), ohne teil = beides (Editor).
const BLATT_RAND_VORNE = 4.5;    // px: so weit reicht der vordere Rand in der Mitte über die Stehfläche
function blattBild(g, x, y, w, schwank, teil){
  g.save(); g.translate(x + w/2, y); g.rotate(schwank || 0);
  const L = w/2, lx = -L - 2, ly = -17, rx = L + 10, ry = -20;   // Stielende links, Spitze rechts (hochgebogen)
  const vorneRand = p => { p.moveTo(lx, ly); p.quadraticCurveTo(0, 8 - 2*BLATT_RAND_VORNE, rx, ry); };   // Mitte bei -BLATT_RAND_VORNE
  if(teil !== 'vorne'){
    // Innenseite: zwischen hinterem Rand (höher) und vorderem Rand, hell, mit Mittelrippe und Adern
    const gr = g.createLinearGradient(0, -16, 0, 0);
    gr.addColorStop(0, '#4f9a3e'); gr.addColorStop(0.6, '#7cc85e'); gr.addColorStop(1, '#a9e27f');
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(lx, ly); g.quadraticCurveTo(-L*0.1, -21, rx, ry); g.quadraticCurveTo(0, 8 - 2*BLATT_RAND_VORNE, lx, ly); g.fill();
    g.strokeStyle = 'rgba(30,70,25,.55)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(lx, ly); g.quadraticCurveTo(-L*0.1, -21, rx, ry); g.stroke();   // hinterer Rand
    g.strokeStyle = 'rgba(214,240,170,.75)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(lx + 6, ly + 4); g.quadraticCurveTo(0, -7, rx - 6, ry + 4); g.stroke();   // Mittelrippe
    g.strokeStyle = 'rgba(40,95,34,.4)'; g.lineWidth = 1;
    for(let i = -3; i <= 3; i++){ const px = i*L*0.26, py = -8.5 + Math.abs(i)*0.9; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + L*0.08, py - 3.5, px + L*0.16, py - 5 + Math.abs(i)*0.3); g.stroke(); }
  }
  if(teil !== 'hinten'){
    // vorderer Rand und Außenseite (dunkler), mit Adern außen
    const ga = g.createLinearGradient(0, -6, 0, 10);
    ga.addColorStop(0, '#5fae4a'); ga.addColorStop(0.5, '#3d7f32'); ga.addColorStop(1, '#24501f');
    g.fillStyle = ga;
    g.beginPath(); vorneRand(g); g.quadraticCurveTo(L*0.15, 28, lx, ly); g.fill();
    g.strokeStyle = 'rgba(20,45,16,.75)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(rx, ry); g.quadraticCurveTo(L*0.15, 28, lx, ly); g.stroke();
    g.strokeStyle = 'rgba(225,255,190,.7)'; g.lineWidth = 1.5; g.beginPath(); vorneRand(g); g.stroke();   // Licht auf dem Rand
    g.strokeStyle = 'rgba(20,50,16,.45)'; g.lineWidth = 1;
    for(let i = -3; i <= 3; i++){ const px = i*L*0.25; g.beginPath(); g.moveTo(px, 6.5 - Math.abs(i)*0.9); g.quadraticCurveTo(px + L*0.06, 1, px + L*0.13, -3.5 + Math.abs(i)*0.2); g.stroke(); }
    // Stiel am hinteren Ende, eingerollt
    g.strokeStyle = '#3d6f2e'; g.lineWidth = 2.6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(lx, ly); g.quadraticCurveTo(lx - 8, ly - 1, lx - 9, ly - 8); g.quadraticCurveTo(lx - 9, ly - 13, lx - 4, ly - 12); g.stroke();
    // Tautropfen auf dem Rand
    g.fillStyle = 'rgba(220,250,255,.8)'; g.beginPath(); g.ellipse(L*0.45, -6.5, 2.2, 1.6, 0, 0, Math.PI*2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.arc(L*0.45 - 0.7, -7, 0.7, 0, Math.PI*2); g.fill();
  }
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
           'wer darin steht, fährt mit. Setzen am linken Ende (das Blatt liegt in der Reihe, man steht auf ihrem Boden); ' +
           'Maus gedrückt halten und nach rechts ziehen = Länge der Schiene',
    optionen: [{key: 'schiene', label: 'Schiene', zahl: true, titel: 'so viele Kästchen weit kann der Wind das Blatt nach rechts schieben (oder beim Setzen ziehen)',
                werte: [['4', '4 Kästchen'], ['6', '6 Kästchen'], ['8', '8 Kästchen'], ['10', '10 Kästchen'], ['14', '14 Kästchen']]}],
    bereich: p => Array.from({length: 3 + (Number(p.schiene) || 6)}, (_, k) => [p.c + k, p.r]),   // Blatt + gezeichnete Schiene
    // Nutzerwunsch: beim Setzen gedrückt halten und ziehen bestimmt die Länge (Maus über dem Kästchen, bis zu dem das Blatt fahren soll)
    ziehen(p, c){
      if(c < p.c + 3) return null;   // noch über dem Blatt (z. B. beim Klicken leicht verrutscht): nichts ändern
      const n = Math.min(BLATT_SCHIENE_MAX, c - p.c - 2); if(n === Number(p.schiene)) return null;
      p.schiene = n; return `Blatt-Floß: Schiene ${n} Kästchen`;
    },
    zeichnen(ctx, c, r, TILE, p){
      const n = Number(p.schiene) || 6, s = TILE/40, boden = (r + 1)*TILE - 8*s;   // im Kästchen (nicht auf der Linie)
      ctx.strokeStyle = 'rgba(90,160,79,.85)'; ctx.setLineDash([6, 4]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(c*TILE + 4, r*TILE + 6*s); ctx.lineTo((c + 3 + n)*TILE - 4, r*TILE + 6*s); ctx.stroke();   // Schiene
      ctx.strokeStyle = 'rgba(90,160,79,.5)'; ctx.strokeRect((c + n)*TILE + 2, r*TILE + 2, 3*TILE - 4, TILE - 4); ctx.setLineDash([]);   // Ende der Fahrt
      ctx.save(); ctx.translate(c*TILE, boden); ctx.scale(s, s); blattBild(ctx, 0, 0, 120, 0); ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.strokeText('→' + n, (c + 3 + n)*TILE - 12, r*TILE + 18*s); ctx.fillText('→' + n, (c + 3 + n)*TILE - 12, r*TILE + 18*s);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, schiene: Number(p.schiene) || 6})),
  },
  spiel: {
    laden(daten){
      blattFloesse = (daten.blattFloesse || []).map(b => {
        // Stehfläche = Boden des Kästchens (das Blatt liegt IN seiner Reihe wie alles andere; vorher an der Oberkante)
        const s = {x: b.x, y: b.y + 40, w: BLATT_BREITE, h: BLATT_DICKE, type: 'blatt', x0: b.x, x1: b.x + (Number(b.schiene) || 6)*40, v: 0};
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
        for(const hx of [x + BLATT_HAENGER, x + s.w - BLATT_HAENGER]){   // am hinteren, hochgebogenen Rand eingehängt
          const dy = (hx - (x + s.w/2))*Math.sin(schwank);
          lianeZeichnen(hx, E.y + 4, hx, s.y - 15 + dy, 0, 0, s.x0 + hx, 0);
          blattRingZeichnen(hx, E.y);
        }
        blattBild(ctx, x, s.y, s.w, schwank, 'hinten');   // (kein Schatten mehr – Nutzer: „macht keinen Sinn“, es hängt in der Luft)
      }
    },
    zeichnenVorne(){   // vorderer Rand vor den Figuren: wer im Blatt steht, steht drin
      const t = performance.now()*0.001;
      for(const s of blattFloesse){
        const x = Math.round(s.x - camX);
        if(x + s.w < -40 || x > VW + 40) continue;
        blattBild(ctx, x, s.y, s.w, Math.sin(t*1.7 + s.x0*0.01)*0.015 + s.v*0.012, 'vorne');
      }
    },
  },
});
