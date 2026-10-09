// elemente/hebel.js – Element „Hebel“ (im Editor „Schalter“; Punkt-Element mit Verknüpfungs-Nummer, siehe 00-register.js).
// Ein/Aus-Schalter je Nummer: 1× betätigen = an (Türen auf, Bewegungen fahren), nochmal = aus. Betätigt mit Taste
// (Affe J, Schweinchen Num 2, Controller ○). Rolle: wer gerade am Hebel steht, öffnet dem anderen den Weg.
// Logik: Verknüpfungs-System in js/05-level-objekte.js (toggleSwitch/updateDoorsAndSwitches, leverNear).
elementRegistrieren({
  id: 'hebel', name: 'Hebel', feld: 'switches',
  editor: {
    werkzeug: 'switch', label: 'Schalter', gruppe: 'logik', vor: '#linkSelect', art: 'punkt', ziehbar: false,
    mitNummer: true, nummerName: 'Schalter', farbe: '#ff9f43',
    titel: 'Schalter (im Spiel ein Hebel): schaltet alles mit derselben Verknüpfungs-Nummer ein/aus',
    zeichnen(ctx, c, r, TILE, p){ elementNummerZeichnen(ctx, c, r, TILE, '#ff9f43', '#8a4f14', p.link); },
    exportieren: (liste, TILE) => elementPunktMitte(liste, TILE),
  },
  spiel: {
    laden(daten){ switchDefs = (daten.switches||[]).map(s=>({...s})); },
    zeichnen(){
      for(const sw of switchDefs){
        const x=sw.x-camX;
        if(x<-30||x>VW+30) continue;
        const anyOpen = !!linkOn[sw.link];   // Hebel steht rechts, solange er eingeschaltet ist
        const col = linkColor(sw.link);
        // Hebel: Sockel am Boden, Stange mit Kugel. Aus = nach links geneigt, an = nach rechts.
        const target = anyOpen ? 1 : 0;
        sw.anim = sw.anim===undefined ? target : sw.anim + (target - sw.anim) * 0.25;
        let ang = -0.6 + sw.anim*1.2;
        if(sw.pulledT){ const k = (performance.now()-sw.pulledT)/260; if(k < 1) ang += Math.sin(k*Math.PI)*0.15; } // kleiner Nachschwung
        const baseY = sw.y + 20;                 // Kästchen-Unterkante = Boden
        const xr = Math.round(x);
        // Stange
        ctx.save(); ctx.translate(xr, baseY-9); ctx.rotate(ang);
        ctx.strokeStyle = '#6b5a4a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-26); ctx.stroke();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0,-28,7,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(-2.2,-30.5,2.3,0,Math.PI*2); ctx.fill();
        ctx.restore();
        // Sockel mit Nummer
        ctx.fillStyle = 'rgba(0,0,0,.15)'; roundRect(xr-17, baseY-12, 34, 13, 5); ctx.fill();
        ctx.fillStyle = '#8c7b69'; roundRect(xr-16, baseY-14, 32, 13, 5); ctx.fill();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(xr, baseY-8, sw.link > 9 ? 7.5 : 6.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle='#fff'; ctx.font=(sw.link > 9 ? 'bold 8px' : 'bold 9px') + ' sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(String(sw.link), xr, baseY-7.5);
        if(anyOpen){ ctx.strokeStyle = col; ctx.globalAlpha = 0.4 + 0.25*Math.sin(performance.now()*0.008); ctx.lineWidth = 2.5;
          roundRect(xr-20, baseY-18, 40, 20, 8); ctx.stroke(); ctx.globalAlpha = 1; }
        // Tasten-Hinweis, wenn jemand davor steht
        const hints = [];
        if(leverNear(p1, sw)) hints.push(padConnected[0] ? '○' : 'J');
        if(leverNear(p2, sw)) hints.push(padConnected[1] ? '○' : 'Num 2');
        if(hints.length){
          const label = [...new Set(hints)].join(' / ');
          ctx.font = 'bold 12px sans-serif';
          const tw = ctx.measureText(label).width + 14, hy = baseY - 62 + Math.sin(performance.now()*0.006)*2;
          ctx.fillStyle = 'rgba(20,28,38,.85)'; roundRect(xr - tw/2, hy, tw, 20, 6); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label, xr, hy+10.5);
        }
      }
    },
  },
});
