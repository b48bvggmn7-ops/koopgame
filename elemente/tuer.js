// elemente/tuer.js – Element „Tür“ (Punkt-Element mit Verknüpfungs-Nummer, siehe 00-register.js).
// Holztor, das aufgeht, solange seine Nummer an ist (Hebel umgelegt / Druckplatte gedrückt); schließt erst, wenn
// niemand mehr darin steht. Rolle: trennt die Wege – der eine öffnet, der andere geht durch.
// Im Spiel ist die Tür eine feste Wand (solids, type 'door'); gezeichnet mit den Wänden (drawDoor in
// js/12-welt-zeichnen.js), Logik im Verknüpfungs-System (js/05-level-objekte.js: setLink, Schließen).
elementRegistrieren({
  id: 'tuer', name: 'Tür', feld: 'doors',
  editor: {
    werkzeug: 'door', gruppe: 'logik', vor: '#linkSelect', art: 'punkt', ziehbar: false,
    mitNummer: true, nummerName: 'Tür', farbe: '#9b59b6',
    titel: 'Tür: geht auf, solange ihre Verknüpfungs-Nummer an ist',
    zeichnen(ctx, c, r, TILE, p){ elementNummerZeichnen(ctx, c, r, TILE, '#9b59b6', '#5a2d69', p.link); },
    exportieren: (liste, TILE) => elementPunktMitte(liste, TILE),
  },
  spiel: {
    laden(daten){
      for(const d of (daten.doors||[])){
        // Editor liefert den Mittelpunkt des Kästchens -> in obere linke Ecke umrechnen
        const dw = d.w||40, dh = d.h||40;
        solids.push({x:d.x-dw/2, y:d.y-dh/2, w:dw, h:dh, type:'door', link:d.link, open:false});
      }
    },
  },
});
