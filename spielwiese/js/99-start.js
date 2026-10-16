// 99-start.js – Spielwiese: Spielschleife mit festem Takt (60 Schritte pro Spielsekunde), Zeichnen dazwischen weich.

let schrittZaehler = 0, takt = 0, letzteZeit = 0;

function bedienAktionen(){
  while(sofortAktionen.length){
    const a = sofortAktionen.shift();
    if(a === 'panel') panelUmschalten();
    else if(a === 'neustart') zurueckSetzen();
    else if(a.startsWith('variante') && a !== 'varianteWeiter') varianteSetzen(aktiveMechanik, +a.slice(8) - 1);
    else if(a === 'varianteWeiter'){ const m = MECHANIKEN[aktiveMechanik]; varianteSetzen(aktiveMechanik, (m.aktiv + 1) % m.varianten.length); }
  }
}

function physikSchritt(){
  schrittZaehler++;
  eingabeSchritt();
  if(fx.stopp > 0){ fx.stopp--; kam.px = kam.x; fig.px = fig.x; fig.py = fig.y; return; }   // Trefferstopp: alles hält kurz an
  figurSchritt();
  kameraSchritt();
  gefuehlSchritt();
}

function schleife(zeit){
  const dt = letzteZeit ? Math.min(250, zeit - letzteZeit) : SCHRITT_MS;
  letzteZeit = zeit;
  padLesen();
  bedienAktionen();
  takt += dt * V.spieltempo;
  let n = 0;
  while(takt >= SCHRITT_MS && n < 6){ physikSchritt(); takt -= SCHRITT_MS; n++; }
  if(n >= 6) takt = 0;
  zeichnen(fx.stopp > 0 ? 1 : takt / SCHRITT_MS);
  requestAnimationFrame(schleife);
}

figurAufPunkt(fig.rueck);
kameraSpringen();
hinweis('Willkommen auf der Spielwiese!');
requestAnimationFrame(schleife);
