// elemente/teleporter.js – Element „Teleporter“ (Ausbau 4; Punkt-Element, siehe 00-register.js).
// Immer zwei gehören zusammen (Paar-Nummer, Farbe). Wer hineinläuft/-springt, kommt sofort beim Partner heraus.
// Regeln (festgelegt in Ausbau 4):
//   - Schwung bleibt erhalten: Tempo und Richtung (seitlich und hoch/runter) sind beim Herauskommen gleich.
//   - Seil: hängt der Affe am Haken, LÖST sich das Seil (der Haken bleibt ja zurück).
//   - Schirm: bleibt offen – das Schweinchen segelt drüben einfach weiter.
//   - Abklingzeit ca. 1 s je Figur, und erst wieder, nachdem man das Tor einmal verlassen hat (kein Hin-und-her-Flackern).
//   - Ausgang zu (Boden/Tür/Wechselboden steckt darin) oder zu weit weg vom Partner (Abstandsgrenze der Kamera):
//     dann passiert nichts – nie in eine Wand oder aus dem Bild teleportieren.
//   - Optional nur für den Affen (blau) oder nur für das Schweinchen (pink), sonst für beide (weiß).
//   - Optional per Verknüpfung (Hebel/Druckplatte): an, solange die Nummer an ist; aus = grau, wirkt nicht.
// Effekt (Funken an beiden Toren) und Sound; die Kamera folgt weich (sie gleitet immer zum Ziel, 09-kamera.js).
// Rolle: Teleporter machen keine Figur überflüssig – „nur Affe/nur Schweinchen“ trennt die Wege, und per Hebel
// muss oft einer das Tor für den anderen anschalten.
// Spiel-Daten: teleporters [{x, y (Fußpunkt = Unterkante des Kästchens), paar, fuer: 'beide'|'affe'|'schwein', link?}]
const TELE_COOL_STEPS = 60;     // Abklingzeit je Figur (1 Spielsekunde)
const TELE_RAND = 8;            // so weit (px) muss die Figur ins Tor-Kästchen hinein, damit es auslöst
const TELE_FARBEN = ['#b07cff', '#3fd0c9', '#ffb84d', '#ff6fa8', '#7ad05a', '#5aa9ff', '#ff7a59', '#e0d050'];
const teleFarbe = paar => TELE_FARBEN[((paar || 1) - 1) % TELE_FARBEN.length];
let teleporters = [];   // {x, y, paar, fuer, link, partner}
function teleAktiv(t){ return !t.link || !!linkOn[t.link]; }
function teleDarf(t, pl){ return t.fuer === 'affe' ? pl.male : t.fuer === 'schwein' ? !pl.male : true; }
function teleDrin(t, pl){   // Figur steckt deutlich im Tor-Kästchen
  return Math.abs(pl.x - t.x) < 20 - TELE_RAND + pl.w/2 && pl.y > t.y - 40 + TELE_RAND && pl.y - pl.h < t.y - TELE_RAND;
}
function teleFx(t, farbe){
  const now = performance.now(), rgb = [1, 3, 5].map(i => parseInt(farbe.slice(i, i + 2), 16)).join(',');
  coinFx.push({type: 'ring', x: t.x, y: t.y - 20, t0: now, rgb});
  for(let k = 0; k < 10; k++){
    const a = k/10*Math.PI*2;
    coinFx.push({type: 'spark', x: t.x, y: t.y - 20, t0: now, vx: Math.cos(a)*2.4, vy: Math.sin(a)*2.4 - 0.6,
                 size: 3 + (k % 3), star: k % 2 === 0, col: [farbe, '#ffffff']});
  }
}
// nach dem Bewegen einer Figur (08-figur-physik-seil.js, über das Register)
function teleNachBewegung(pl){
  if(pl.teleCool > 0) pl.teleCool--;
  const drin = teleporters.find(t => teleDrin(t, pl));
  if(!drin){ pl.teleFrei = true; return; }
  if(pl.teleCool > 0 || pl.teleFrei === false) return;
  const ziel = drin.partner;
  if(!ziel || !teleAktiv(drin) || !teleDarf(drin, pl)) return;
  const andere = pl === p1 ? p2 : p1;
  if(andere && Math.abs(ziel.x - andere.x) > MAX_SEPARATION - 40) return;   // zu weit weg vom Partner
  if(!spotFree(ziel.x, ziel.y - 0.5, pl)) return;                           // Ausgang ist zu
  teleFx(drin, teleFarbe(drin.paar));
  if(pl.hookAttached){ pl.hookAttached = false; pl.ropeFling = true; }        // Seil löst sich, Schwung bleibt
  pl.x = ziel.x; pl.y = ziel.y - 0.5;   // Füße knapp über der Kästchen-Unterkante (steht dort auf Boden, falls vorhanden)
  pl._px = pl.x; pl._py = pl.y;         // nicht quer übers Bild „gezogen“ zeichnen
  pl.grounded = false; pl.standingOn = null;
  pl.teleCool = TELE_COOL_STEPS; pl.teleFrei = false;
  drin.blitz = ziel.blitz = performance.now();
  teleFx(ziel, teleFarbe(drin.paar));
  SFX.teleport(ziel.x);
}
function teleZuruecksetzen(){
  for(const pl of [p1, p2]) if(pl){ pl.teleCool = 0; pl.teleFrei = true; }
}
const TELE_INNEN = {beide: '#ffffff', affe: '#4dabf7', schwein: '#f783ac'};
function teleZeichnen(){
  const tw = performance.now();
  for(const t of teleporters){
    const x = Math.round(t.x - camX);
    if(x < -50 || x > VW + 50) continue;
    const an = teleAktiv(t) && !!t.partner, farbe = an ? teleFarbe(t.paar) : '#8a8f96', cy = t.y - 24;
    // Sockel
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x, t.y - 2, 17, 4, 0, 0, Math.PI*2); ctx.fill();
    // leuchtendes Oval
    ctx.save(); ctx.translate(x, cy);
    if(an){
      const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 25);
      g.addColorStop(0, TELE_INNEN[t.fuer] || '#fff'); g.addColorStop(0.55, farbe); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.7 + 0.15*Math.sin(tw*0.004 + t.paar);
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 17, 23, 0, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
      // wirbelnde Funken
      for(let i = 0; i < 6; i++){
        const a = tw*0.003*(i % 2 ? 1 : -1) + i*Math.PI/3, r = 9 + (i % 3)*3;
        ctx.fillStyle = i % 2 ? '#fff' : (TELE_INNEN[t.fuer] || '#fff');
        ctx.beginPath(); ctx.arc(Math.cos(a)*r*0.75, Math.sin(a)*r, 1.8, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.strokeStyle = farbe; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 17, 23, 0, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, 13, 19, 0, 0, Math.PI*2); ctx.stroke();
    if(t.blitz){ const k = (tw - t.blitz)/350; if(k < 1){ ctx.globalAlpha = 1 - k; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(0, 0, 17 + k*10, 23 + k*12, 0, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; } }
    // Paar-Nummer unten, Figuren-Zeichen (nur Affe / nur Schweinchen) oben
    ctx.fillStyle = farbe; ctx.beginPath(); ctx.arc(0, 21, 6.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(t.paar), 0, 21.5);
    if(t.fuer === 'affe' || t.fuer === 'schwein'){
      ctx.fillStyle = TELE_INNEN[t.fuer]; ctx.beginPath(); ctx.arc(0, -28, 6, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 8px sans-serif'; ctx.fillText(t.fuer === 'affe' ? 'A' : 'S', 0, -27.5);
    }
    ctx.restore();
  }
}
// (Editor) Paar-Nummer für ein neues Tor: wartet ein Tor noch auf seinen Partner, gehört das neue dazu (2. Klick)
function teleNeuesPaar(liste){
  const n = {};
  for(const p of liste) n[p.paar] = (n[p.paar] || 0) + 1;
  const offen = Object.keys(n).map(Number).filter(k => n[k] === 1).sort((a, b) => a - b)[0];
  if(offen) return {paar: offen, partner: liste.find(p => p.paar === offen)};
  let k = 1; while(n[k]) k++;
  return {paar: k, partner: null};
}
elementRegistrieren({
  id: 'teleporter', name: 'Teleporter', feld: 'teleporters',
  editor: {
    werkzeug: 'tele', gruppe: 'bewegung', vor: 'move', art: 'punkt', ziehbar: false, farbe: '#b07cff',
    titel: 'Teleporter: 1. Klick = erstes Tor, 2. Klick = sein Partner (gleiche Farbe/Nummer, Linie zeigt das Paar). ' +
           'Wer hineingeht, kommt beim Partner heraus. „per Verknüpfung“: an, solange die Nummer (Schalter & Logik) an ist',
    optionen: [
      {key: 'fuer', label: 'für', titel: 'Wer den Teleporter benutzen kann',
       werte: [['beide', 'beide'], ['affe', 'nur Affe'], ['schwein', 'nur Schweinchen']]},
      {key: 'schalter', label: 'an/aus', titel: 'Immer an – oder nur an, solange die gewählte Verknüpfungs-Nummer an ist (Hebel/Druckplatte)',
       werte: [['immer', 'immer an'], ['nummer', 'per Verknüpfung']]},
    ],
    // neues Tor: Paar-Nummer automatisch; der Partner übernimmt die Einstellungen des ersten Tors
    neu(p, alle){
      const {paar, partner} = teleNeuesPaar(alle);
      const o = {c: p.c, r: p.r, paar, fuer: p.fuer, schalter: p.schalter};
      if(partner){ o.fuer = partner.fuer; o.schalter = partner.schalter; if(partner.link) o.link = partner.link; }
      else if(p.schalter === 'nummer') o.link = Number(linkSelect.value);
      if(o.schalter !== 'nummer') delete o.link;
      return o;
    },
    // Einfügen (Strg+V): eingefügte Paare bekommen neue, freie Paar-Nummern (sonst gäbe es zwei gleiche Paare)
    einfuegen(neu, liste){
      const belegt = new Set(liste.filter(p => !neu.includes(p)).map(p => p.paar)), map = {};
      let k = 1;
      for(const p of neu){
        if(!(p.paar in map)){ while(belegt.has(k)) k++; map[p.paar] = k; belegt.add(k); }
        p.paar = map[p.paar];
      }
    },
    nummerAktiv: p => p.schalter === 'nummer' && !!p.link,
    mitNummer: false, nummerName: 'Teleporter',
    zeichnen(ctx, c, r, TILE, p){
      const X = c*TILE + TILE/2, Y = r*TILE + TILE/2, f = teleFarbe(p.paar);
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(X, Y, 13, 17, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = f; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(X, Y, 13, 17, 0, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = TELE_INNEN[p.fuer] || '#fff'; ctx.beginPath(); ctx.ellipse(X, Y, 6, 9, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3;
      const txt = String(p.paar) + (p.fuer === 'affe' ? ' A' : p.fuer === 'schwein' ? ' S' : '') + (p.link ? ' ⚡' + p.link : '');
      ctx.strokeText(txt, X, Y + TILE*0.38); ctx.fillText(txt, X, Y + TILE*0.38);
    },
    // Verbindungslinie zwischen den Toren eines Paars; Tor ohne Partner: „?“ (wartet auf den 2. Klick)
    zeichnenAlle(ctx, liste, TILE){
      const nachPaar = {};
      for(const p of liste) (nachPaar[p.paar] = nachPaar[p.paar] || []).push(p);
      for(const k in nachPaar){
        const L = nachPaar[k];
        if(L.length >= 2){
          const [a, b] = L, ax = a.c*TILE + TILE/2, ay = a.r*TILE + TILE/2, bx = b.c*TILE + TILE/2, by = b.r*TILE + TILE/2;
          ctx.save(); ctx.setLineDash([8, 6]); ctx.strokeStyle = teleFarbe(Number(k)); ctx.globalAlpha = 0.8; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(ax, ay);
          ctx.quadraticCurveTo((ax + bx)/2, Math.min(ay, by) - 60, bx, by); ctx.stroke(); ctx.restore();
        } else {
          const a = L[0];
          ctx.fillStyle = '#ffe066'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('?', a.c*TILE + TILE - 6, a.r*TILE + 8);
        }
      }
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE + TILE/2, y: p.r*TILE + TILE, paar: p.paar, fuer: p.fuer || 'beide',
      ...(p.schalter === 'nummer' && p.link ? {link: p.link} : {})})),
  },
  spiel: {
    laden(daten){
      teleporters = (daten.teleporters || []).map(t => ({x: t.x, y: t.y, paar: t.paar || 1, fuer: t.fuer || 'beide', link: t.link || null, partner: null}));
      for(const t of teleporters) t.partner = teleporters.find(o => o !== t && o.paar === t.paar) || null;
    },
    nachBewegung: teleNachBewegung,
    zuruecksetzen: teleZuruecksetzen,
    zeichnen: teleZeichnen,
  },
});
