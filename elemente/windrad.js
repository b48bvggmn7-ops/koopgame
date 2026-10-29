// elemente/windrad.js – Element „Windrad“ (Dschungel-Neu; Punkt-Element mit Verknüpfungs-Nummer, siehe 00-register.js).
// Ein Blätter-Windrad auf einem Holzpfahl. Nur der Puste-Wind des Affen (js/34-koop-aktionen.js, pusteTrifft) dreht es –
// es läuft an, dreht sich kräftig und läuft langsam aus. Zwei Arten (Editor-Auswahl „Windrad“):
//   umschalten – jedes Anpusten (dreht sich voll) schaltet seine Nummer einmal um, wie ein Hebel (Standard)
//   solange    – die Nummer ist AN, solange es sich dreht (wie eine Druckplatte; läuft es aus, geht sie wieder AUS)
// Rolle: nur der Affe kann es schalten (pusten) – oft von einem Platz aus, an den ihn das Schweinchen bringt (Schirm-Trampolin),
// während das Schweinchen den Weg nutzt, den es öffnet. Logik pro Schritt in spiel.schritt; „solange“ über windradWunsch
// in updatePlates (js/05-level-objekte.js), damit es sich mit Druckplatten derselben Nummer verträgt.
const WINDRAD_ANLAUF = 0.06;      // so viel Drehung je Schritt bei vollem Wind (bis 1 = volle Fahrt)
const WINDRAD_AUSLAUF = 0.975;    // ohne Wind: Drehung je Schritt mal diesem Wert (läuft gut 2 s nach)
const WINDRAD_AN = 0.55;          // ab dieser Drehung gilt es als „angepustet“ (umschalten) bzw. als „dreht“ (solange)
const WINDRAD_RUHE = 0.12;        // darunter steht es wieder (danach zählt das nächste Anpusten neu)
let windraeder = [];              // {x, y (Fußpunkt), link, art, dreh (0…1), winkel, gezaehlt}
const WINDRAD_HOEHE = 34;         // px: Nabe über dem Boden (auf Mundhöhe des Affen – sein Puste-Wind zur Seite trifft die Blätter)
const windradRotor = w => ({x: w.x - 22, y: w.y - WINDRAD_HOEHE - 22, w: 44, h: 44});   // Trefferfläche des Windes (Rotor oben am Pfahl)
function windradWunsch(want){
  for(const w of windraeder) if(w.art === 'solange' && w.link){ want[w.link] = want[w.link] || w.dreh >= WINDRAD_AN; }
}
// Bild eines Windrads (Spiel und Editor): Pfahl, vier Blätter in Dschungel-Grün um eine Nabe mit Edelstein in der Nummernfarbe
function windradBild(g, x, y, winkel, farbe, dreh, s){
  s = s || 1;
  g.save(); g.translate(x, y); g.scale(s, s);
  // Pfahl mit Ranke
  const holz = g.createLinearGradient(-4, 0, 4, 0);
  holz.addColorStop(0, '#6b4019'); holz.addColorStop(0.5, '#a86f3a'); holz.addColorStop(1, '#5e3814');
  const H = WINDRAD_HOEHE;
  g.fillStyle = '#3b2412'; g.fillRect(-4.5, -H - 1, 9, H + 1);
  g.fillStyle = holz; g.fillRect(-3.2, -H, 6.4, H);
  g.strokeStyle = '#5aa04f'; g.lineWidth = 2; g.beginPath(); g.moveTo(-3, -4); g.quadraticCurveTo(5, -12, -3, -20); g.quadraticCurveTo(4, -26, -2, -30); g.stroke();
  g.fillStyle = '#7cc36b'; for(const [lx, ly] of [[3, -11], [-3, -21]]){ g.beginPath(); g.ellipse(lx, ly, 3.2, 1.8, 0.5, 0, Math.PI*2); g.fill(); }
  // Rotor
  g.translate(0, -H); g.rotate(winkel);
  for(let i = 0; i < 4; i++){
    g.save(); g.rotate(i*Math.PI/2);
    g.fillStyle = '#2f6b2a'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(14, -6, 22, 0); g.quadraticCurveTo(13, 5, 0, 0); g.fill();
    const bl = g.createLinearGradient(0, -5, 22, 3);
    bl.addColorStop(0, '#9fe07a'); bl.addColorStop(1, i % 2 ? '#5fb24f' : '#79c95b');
    g.fillStyle = bl; g.beginPath(); g.moveTo(1, -0.5); g.quadraticCurveTo(13, -5, 20, -0.5); g.quadraticCurveTo(12, 3.5, 1, 0.5); g.fill();
    g.strokeStyle = 'rgba(30,70,25,.55)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(2, 0); g.lineTo(18, -0.6); g.stroke();
    g.restore();
  }
  // Bewegungsunschärfe beim schnellen Drehen
  if(dreh > 0.3){ g.globalAlpha = Math.min(0.35, (dreh - 0.3)*0.6); g.fillStyle = '#cfeec0'; g.beginPath(); g.arc(0, 0, 21, 0, Math.PI*2); g.fill(); g.globalAlpha = 1; }
  g.fillStyle = '#3b2412'; g.beginPath(); g.arc(0, 0, 6.5, 0, Math.PI*2); g.fill();
  if(typeof elementEdelstein === 'function' && g === ctx) elementEdelstein(0, 0, 5, farbe);
  else { g.fillStyle = farbe; g.beginPath(); g.arc(0, 0, 4.5, 0, Math.PI*2); g.fill(); }
  g.restore();
}
elementRegistrieren({
  id: 'windrad', name: 'Windrad', feld: 'windraeder',
  editor: {
    werkzeug: 'windrad', gruppe: 'logik', vor: '#linkSelect', art: 'punkt', ziehbar: false, farbe: '#79c95b',
    mitNummer: true, nummerName: 'Windrad',
    titel: 'Windrad: nur der Puste-Wind des Affen dreht es. „umschalten“: jedes Anpusten schaltet die Nummer um (wie ein Hebel); ' +
           '„solange“: AN, solange es sich dreht (wie eine Druckplatte)',
    optionen: [{key: 'art', label: 'Windrad', titel: 'jedes Anpusten schaltet um – oder: an, solange es sich dreht',
                werte: [['umschalten', 'umschalten'], ['solange', 'solange es dreht']]}],
    zeichnen(ctx, c, r, TILE, p){
      const col = typeof linkColor === 'function' ? linkColor(p.link) : '#ff9f43';
      windradBild(ctx, c*TILE + TILE/2, r*TILE + TILE, 0.3, col, 0, TILE/40*0.72);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; const t = (p.art === 'solange' ? '~' : '') + String(p.link);
      ctx.strokeText(t, c*TILE + TILE - 8, r*TILE + 9); ctx.fillText(t, c*TILE + TILE - 8, r*TILE + 9);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE + TILE, link: p.link, ...(p.art === 'solange' ? {art: 'solange'} : {})})),
  },
  spiel: {
    laden(daten){ windraeder = (daten.windraeder || []).map(w => ({x: w.x, y: w.y, link: w.link, art: w.art === 'solange' ? 'solange' : 'umschalten', dreh: 0, winkel: 0, gezaehlt: false})); },
    zuruecksetzen(){ for(const w of windraeder){ w.dreh = 0; w.gezaehlt = false; } },
    schritt(){
      for(const w of windraeder){
        const k = typeof pusteTrifft === 'function' ? pusteTrifft(windradRotor(w)) : 0;
        const vorher = w.dreh;
        w.dreh = k > 0 ? Math.min(1, w.dreh + WINDRAD_ANLAUF*k) : w.dreh*WINDRAD_AUSLAUF;
        if(w.dreh < 0.01) w.dreh = 0;
        w.winkel = (w.winkel + w.dreh*0.42) % (Math.PI*2);
        if(vorher < WINDRAD_AN && w.dreh >= WINDRAD_AN){
          if(typeof SFX !== 'undefined' && SFX.windrad) SFX.windrad(w.x);
          if(w.art === 'umschalten' && !w.gezaehlt && w.link){
            w.gezaehlt = true;
            const an = !linkOn[w.link];
            setLink(w.link, an);
            if(typeof spiegelAusloesen === 'function') spiegelAusloesen(w.link);
            zielHinweisMerken(w.link);
            if(typeof SFX !== 'undefined') SFX.lever(an, w.x);
          }
        }
        if(w.dreh < WINDRAD_RUHE) w.gezaehlt = false;
      }
    },
    zeichnen(){
      for(const w of windraeder){
        const x = Math.round(w.x - camX);
        if(x < -50 || x > VW + 50) continue;
        const col = linkColor(w.link), an = !!linkOn[w.link];
        if(!an && w.dreh < 0.05) elementLeuchten(x, w.y - WINDRAD_HOEHE, 46, col);
        glanzSchatten(x, w.y, 14, 3.5);
        windradBild(ctx, x, w.y, w.winkel, col, w.dreh, 1);
        if(an){ ctx.strokeStyle = col; ctx.globalAlpha = 0.35 + 0.25*Math.sin(performance.now()*0.008); ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(x, w.y - WINDRAD_HOEHE, 27, 0, Math.PI*2); ctx.stroke(); ctx.globalAlpha = 1; }
        else if(w.dreh < 0.05) hinweisPfeil(x, w.y - WINDRAD_HOEHE - 46, col);
      }
    },
  },
});
