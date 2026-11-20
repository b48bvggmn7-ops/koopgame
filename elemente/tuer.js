// elemente/tuer.js – Element „Tür“ (Punkt-Element mit Verknüpfungs-Nummer, siehe 00-register.js).
// Holztor, das aufgeht, solange seine Nummer an ist (Hebel umgelegt / Druckplatte gedrückt); schließt erst, wenn
// niemand mehr darin steht. Rolle: trennt die Wege – der eine öffnet, der andere geht durch.
// Im Spiel ist die Tür eine feste Wand (solids, type 'door'); gezeichnet als zusammenhängende Tür (drawGate in
// js/12-welt-zeichnen.js), Logik im Verknüpfungs-System (js/05-level-objekte.js: setLink, Schließen).
// Mehrere Auslöser (Nutzer 20.11.: „kann eine Tür mehrere Hebel/Rammbalken/Windräder brauchen, bis sie sich öffnet?“): die Tür kann
// bis zu zwei weitere Nummern verlangen („und Nummer“, Felder und/und2). Sie geht erst auf, wenn ALLE ihre Nummern an sind – jeder
// Auslöser (Hebel, Druckplatte, Rammbalken, Windrad …) bekommt dafür seine eigene Nummer. Auf der Tür sitzt je Nummer ein Edelstein
// in deren Farbe; er leuchtet, sobald diese Nummer an ist (so sieht man, was noch fehlt).
// so viele Nummern wie der Editor kennt (MAX_LINK aus editor/js/01-zustand.js – wird erst nach dieser Datei geladen, deshalb erst
// beim Aufbau der Auswahl gelesen; Nutzer 20.11.: „und Nummer geht nur bis 60, aber wir haben mehr Schalter“)
const tuerUndWerte = () => [['0', '–'], ...Array.from({length: typeof MAX_LINK === 'number' ? MAX_LINK : 80}, (_, i) => [String(i + 1), String(i + 1)])];
elementRegistrieren({
  id: 'tuer', name: 'Tür', feld: 'doors',
  editor: {
    werkzeug: 'door', gruppe: 'logik', vor: '#linkSelect', art: 'punkt', ziehbar: false,
    mitNummer: true, nummerName: 'Tür', farbe: '#9b59b6',
    titel: 'Tür: geht auf, solange ihre Verknüpfungs-Nummer an ist. Mit „und Nummer“ braucht sie zusätzlich eine zweite (und dritte) Nummer – sie öffnet erst, wenn ALLE an sind (jeder Auslöser bekommt seine eigene Nummer)',
    optionen: [
      {key: 'und', label: 'und Nummer', zahl: true, titel: 'zweite Nummer, die AUCH an sein muss, damit die Tür aufgeht (– = keine)', get werte(){ return tuerUndWerte(); }},
      {key: 'und2', label: 'und Nummer', zahl: true, titel: 'dritte Nummer, die AUCH an sein muss (– = keine)', get werte(){ return tuerUndWerte(); }},
    ],
    zeichnen(ctx, c, r, TILE, p){
      const mehr = [p.und, p.und2].filter(n => n > 0);
      elementNummerZeichnen(ctx, c, r, TILE, '#9b59b6', '#5a2d69', mehr.length ? '' : p.link);
      if(mehr.length){ ctx.fillStyle = '#fff'; ctx.font = `bold ${mehr.length > 1 ? 8 : 10}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText([p.link, ...mehr].join('+'), c*TILE + TILE/2, r*TILE + TILE/2 + 1); }
    },
    exportieren: (liste, TILE) => elementPunktMitte(liste, TILE).map((d, i) => ({...d, ...(liste[i].und > 0 ? {und: Number(liste[i].und)} : {}), ...(liste[i].und2 > 0 ? {und2: Number(liste[i].und2)} : {})})),
  },
  spiel: {
    laden(daten){
      for(const d of (daten.doors||[])){
        // Editor liefert den Mittelpunkt des Kästchens -> in obere linke Ecke umrechnen
        const dw = d.w||40, dh = d.h||40;
        solids.push({x:d.x-dw/2, y:d.y-dh/2, w:dw, h:dh, type:'door', link:d.link, und:Number(d.und)||0, und2:Number(d.und2)||0, open:false});
      }
    },
  },
});
