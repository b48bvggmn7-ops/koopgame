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
        // Auffälliger (Nutzerwunsch): größer, Lichtschein in der Hebel-Farbe; solange er noch aus ist, ein hüpfender Pfeil
        if(!anyOpen) elementLeuchten(xr, baseY - 26, 58, col);
        // Stange
        ctx.save(); ctx.translate(xr, baseY-11); ctx.rotate(ang);
        ctx.strokeStyle = 'rgba(20,28,38,.7)'; ctx.lineWidth = 9; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-34); ctx.stroke();
        ctx.strokeStyle = '#c9b08a'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-34); ctx.stroke();
        ctx.fillStyle = 'rgba(20,28,38,.8)'; ctx.beginPath(); ctx.arc(0,-37,11.5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0,-37,10,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(-3,-40.5,3,0,Math.PI*2); ctx.fill();
        ctx.restore();
        // Sockel mit Nummer
        ctx.fillStyle = 'rgba(0,0,0,.2)'; roundRect(xr-21, baseY-14, 42, 15, 6); ctx.fill();
        ctx.fillStyle = '#8c7b69'; roundRect(xr-20, baseY-16, 40, 15, 6); ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 2; roundRect(xr-20, baseY-16, 40, 15, 6); ctx.stroke();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(xr, baseY-9, sw.link > 9 ? 8 : 7, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle='#fff'; ctx.font=(sw.link > 9 ? 'bold 9px' : 'bold 10px') + ' sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(String(sw.link), xr, baseY-8.5);
        if(anyOpen){ ctx.strokeStyle = col; ctx.globalAlpha = 0.4 + 0.25*Math.sin(performance.now()*0.008); ctx.lineWidth = 2.5;
          roundRect(xr-24, baseY-20, 48, 22, 8); ctx.stroke(); ctx.globalAlpha = 1; }
        else hinweisPfeil(xr, baseY - 72, col);
        // Tasten-Hinweis, wenn jemand davor steht
        const hints = [];
        if(leverNear(p1, sw)) hints.push(padConnected[0] ? '○' : 'J');
        if(leverNear(p2, sw)) hints.push(padConnected[1] ? '○' : 'Num 2');
        if(hints.length){
          const label = [...new Set(hints)].join(' / ');
          ctx.font = 'bold 12px sans-serif';
          const tw = ctx.measureText(label).width + 14, hy = baseY - 104 + Math.sin(performance.now()*0.006)*2;
          ctx.fillStyle = 'rgba(20,28,38,.85)'; roundRect(xr - tw/2, hy, tw, 20, 6); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label, xr, hy+10.5);
        }
      }
    },
  },
});
