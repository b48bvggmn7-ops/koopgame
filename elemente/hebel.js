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
        // Auffälliger und passend zur Spielwelt (Nutzerwunsch): Holzstange mit Eisenmanschette und einem Edelstein-Knauf
        // in der Hebel-Farbe (wie die Edelsteine auf den Türen), Steinsockel mit Eisenband; solange er aus ist, leichter
        // Schein und Glühwürmchen darüber
        if(!anyOpen) elementLeuchten(xr, baseY - 26, 44, col);
        ctx.save(); ctx.translate(xr, baseY-10); ctx.rotate(ang);
        ctx.strokeStyle = '#3b2412'; ctx.lineWidth = 8; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-25); ctx.stroke();
        const holz = ctx.createLinearGradient(-3, 0, 3, 0);
        holz.addColorStop(0, '#7a4b22'); holz.addColorStop(0.5, '#b47a40'); holz.addColorStop(1, '#6b4019');
        ctx.strokeStyle = holz; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-25); ctx.stroke();
        ctx.fillStyle = '#4a4f57'; ctx.fillRect(-4, -19, 8, 4); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-4, -19, 8, 1.2);
        ctx.fillStyle = '#3b2412'; ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(8.5, -29); ctx.lineTo(0, -21); ctx.lineTo(-8.5, -29); ctx.closePath(); ctx.fill();
        elementEdelstein(0, -29.5, 7.5, col);
        ctx.restore();
        // Steinsockel mit Eisenband, Nummer auf einer Plakette in der Hebel-Farbe
        ctx.fillStyle = 'rgba(0,0,0,.22)'; roundRect(xr-18, baseY-11, 36, 12, 4); ctx.fill();
        const stein = ctx.createLinearGradient(0, baseY-16, 0, baseY);
        stein.addColorStop(0, '#a89c8c'); stein.addColorStop(1, '#6f655a');
        ctx.fillStyle = stein; roundRect(xr-17, baseY-16, 34, 15, 4); ctx.fill();
        ctx.strokeStyle = '#3b2f25'; ctx.lineWidth = 1.5; roundRect(xr-17, baseY-16, 34, 15, 4); ctx.stroke();
        ctx.fillStyle = '#4a4f57'; ctx.fillRect(xr-17, baseY-10, 34, 4);
        ctx.fillStyle = '#9aa3ad'; for(const rx of [xr-13, xr+13]){ ctx.beginPath(); ctx.arc(rx, baseY-8, 1.4, 0, Math.PI*2); ctx.fill(); }
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(xr, baseY-8, sw.link > 9 ? 7 : 6.2, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(40,22,8,.7)'; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle='#fff'; ctx.font=(sw.link > 9 ? 'bold 8px' : 'bold 9px') + ' sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(String(sw.link), xr, baseY-7.5);
        if(typeof wechselHebelAnzeige === 'function') wechselHebelAnzeige(xr, baseY, sw.link);   // Wechselboden: welche Gruppe fest ist
        if(anyOpen){ ctx.strokeStyle = col; ctx.globalAlpha = 0.4 + 0.25*Math.sin(performance.now()*0.008); ctx.lineWidth = 2.5;
          roundRect(xr-21, baseY-20, 42, 22, 8); ctx.stroke(); ctx.globalAlpha = 1; }
        else hinweisPfeil(xr, baseY - 56, col);
        // Tasten-Hinweis, wenn jemand davor steht
        const hints = [];
        if(leverNear(p1, sw)) hints.push(padConnected[0] ? '○' : 'J');
        if(leverNear(p2, sw)) hints.push(padConnected[1] ? '○' : 'Num 2');
        if(hints.length){
          const label = [...new Set(hints)].join(' / ');
          ctx.font = 'bold 12px sans-serif';
          const tw = ctx.measureText(label).width + 14, hy = baseY - 90 + Math.sin(performance.now()*0.006)*2;
          ctx.fillStyle = 'rgba(20,28,38,.85)'; roundRect(xr - tw/2, hy, tw, 20, 6); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label, xr, hy+10.5);
        }
      }
    },
  },
});
