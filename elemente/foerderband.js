// elemente/foerderband.js – Element „Förderband“ (Ausbau 7, Welt Höhle; Punkt-Element, mit der Maus malbar).
// Fester Boden-Block, der alles, was darauf steht, mitnimmt (nach rechts oder links, langsam oder schnell). Läuft man
// gegen das Band, kommt man langsamer voran; mit dem Band schneller. Springt man ab, nimmt man den Band-Schwung mit. Optional an einer Verknüpfungs-Nummer:
// „Nummer dreht um“ (solange die Nummer an ist, läuft es andersherum) oder „Nummer hält an“.
// Wer springt, segelt oder am Seil hängt, wird NICHT mitgenommen (das Band wirkt nur auf dem Boden).
// Rolle: der Affe hängt sich am Haken fest und hält gegen den Strom; das Schweinchen segelt über Bänder hinweg und
// landet genau; oft schaltet einer per Hebel das Band, auf dem der andere fährt.
// Spiel-Daten: baender [{x, y, w, h, richtung: 'r'|'l', tempo, link?, schalter: 'dreht'|'stopp'}]
// Im Spiel: solids mit type 'band'.
let bandSchritte = 0;   // nur für das Laufband-Muster (Anzeige)
// Band unter der Figur: steht sie darauf – oder schwebt sie nur knapp darüber (BAND_NAH, z. B. Mini-Hüpfer in einem
// niedrigen Tunnel), nimmt das Band sie trotzdem mit. Hohe Sprünge im Freien entkommen ihm.
function bandUnter(player){
  if(player.grounded) return player.standingOn && player.standingOn.type === 'band' ? player.standingOn : null;
  if(player.hookAttached) return null;
  for(const s of solids){
    if(s.type !== 'band' || s.gone) continue;
    const ab = s.y - player.y;   // Abstand Füße -> Band-Oberseite
    if(ab >= -0.5 && ab <= BAND_NAH && player.x + player.w/2 > s.x && player.x - player.w/2 < s.x + s.w) return s;
  }
  return null;
}
function bandTempo(s){
  if(s.link && linkOn[s.link]){
    if(s.schalter === 'stopp') return 0;
    return -s.dir*s.tempo;
  }
  return s.dir*s.tempo;
}
function bandSchritt(){
  bandSchritte++;
  // Richtungswechsel hörbar machen (nur sichtbare Bänder)
  let um = null;
  for(const s of solids){
    if(s.type !== 'band') continue;
    const t = bandTempo(s);
    if(s.letztesTempo !== undefined && t !== s.letztesTempo && s.x + s.w > camX - 40 && s.x < camX + VW + 40) um = s;
    s.letztesTempo = t;
  }
  if(um) SFX.bandUm(um.x + um.w/2);
}
function bandBild(c, x, y, w, h, t, phase){
  // ein zusammenhängender Lauf (auch ein einzelnes Kästchen) wird als EIN Band gezeichnet: Lederband mit Holzkörper,
  // breite weiche Pfeile, nur an den beiden Enden Rollen – keine Nahtstellen zwischen den Kästchen
  const rr = (X, Y, W, H, R) => { c.beginPath(); c.roundRect ? c.roundRect(X, Y, W, H, R) : c.rect(X, Y, W, H); };
  // Körper aus Holz
  rr(x, y + 5, w, h - 5, 7); c.fillStyle = '#5a4130'; c.fill();
  c.save(); rr(x, y + 5, w, h - 5, 7); c.clip();
  c.fillStyle = 'rgba(20,12,6,.35)'; c.fillRect(x, y + h - 14, w, 14);
  c.fillStyle = 'rgba(255,230,190,.10)'; for(let k = 0; k < w; k += 40){ c.fillRect(x + k, y + 15, 40, 1.2); }
  c.fillStyle = '#b8a070'; for(let k = 20; k < w; k += 40){ c.beginPath(); c.arc(x + k, y + h - 8, 1.4, 0, 7); c.fill(); }   // Nieten
  c.restore();
  c.strokeStyle = 'rgba(25,15,8,.65)'; c.lineWidth = 1.4; rr(x + .7, y + 5.7, w - 1.4, h - 6.4, 6.5); c.stroke();
  // Gurt oben: Leder mit wandernden Pfeilen
  rr(x, y, w, 12, 6); c.fillStyle = '#3d2c1f'; c.fill();
  c.save(); rr(x, y, w, 12, 6); c.clip();
  const dir = Math.sign(t) || 1, P = 24, off = ((phase % P) + P) % P;
  c.strokeStyle = t === 0 ? 'rgba(220,210,190,.35)' : 'rgba(246,204,112,.92)'; c.lineWidth = 2.6; c.lineCap = 'round'; c.lineJoin = 'round';
  for(let k = -P; k < w + P; k += P){
    const px = x + k + (dir > 0 ? off : P - off);
    c.beginPath(); c.moveTo(px - 3.2*dir, y + 2.6); c.lineTo(px + 2.6*dir, y + 6); c.lineTo(px - 3.2*dir, y + 9.4); c.stroke();
  }
  c.fillStyle = 'rgba(255,235,190,.22)'; c.fillRect(x + 4, y + 1, w - 8, 1.2);
  c.restore();
  c.strokeStyle = 'rgba(20,12,6,.7)'; c.lineWidth = 1.2; rr(x + .6, y + .6, w - 1.2, 10.8, 5.4); c.stroke();
  // Rollen nur an den Enden
  for(const rx of [x + 10, x + w - 10]){
    c.fillStyle = '#b89a58'; c.beginPath(); c.arc(rx, y + 25, 6.2, 0, 7); c.fill();
    c.strokeStyle = 'rgba(40,26,10,.6)'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#3a2a1a'; c.beginPath(); c.arc(rx, y + 25, 2.2, 0, 7); c.fill();
  }
}
function bandZeichnen(){
  const liste = solids.filter(s => s.type === 'band').sort((a, b) => a.y - b.y || a.x - b.x);
  let lauf = null;
  const fertig = () => { if(!lauf) return; const x = Math.round(lauf.x - camX);
    if(!(x + lauf.w < -20 || x > VW + 20)) bandBild(ctx, x, lauf.y, lauf.w, lauf.h, lauf.t, bandSchritte*lauf.t*0.5); lauf = null; };
  for(const s of liste){
    const t = bandTempo(s);
    if(lauf && lauf.y === s.y && lauf.x + lauf.w === s.x && lauf.t === t && lauf.h === s.h) lauf.w += s.w;
    else { fertig(); lauf = {x: s.x, y: s.y, w: s.w, h: s.h, t}; }
  }
  fertig();
}
ELEMENT_SOLID_TYPEN.add('band');
elementRegistrieren({
  id: 'foerderband', name: 'Förderband', feld: 'baender',
  editor: {
    werkzeug: 'band', gruppe: 'bewegung', vor: 'move', art: 'punkt', ziehbar: true, farbe: '#ffd36a',
    titel: 'Förderband: fester Boden, der Figuren auf ihm mitnimmt (Richtung/Tempo). Optional per Verknüpfungs-Nummer ' +
           'umdrehen oder anhalten. Klick auf ein vorhandenes Kästchen = Richtung tauschen',
    optionen: [
      {key: 'richtung', label: 'Richtung', werte: [['r', '→ rechts'], ['l', '← links']]},
      {key: 'tempo', label: 'Tempo', zahl: true, werte: [['1.6', 'langsam'], ['2.8', 'schnell'], ['8', 'reißend']]},
      {key: 'schalter', label: 'Nummer', titel: 'Immer gleich – oder solange die gewählte Verknüpfungs-Nummer an ist: andersherum bzw. still',
       werte: [['immer', 'ohne'], ['dreht', 'Nummer dreht um'], ['stopp', 'Nummer hält an']]},
    ],
    neu(p){
      const o = {c: p.c, r: p.r, richtung: p.richtung, tempo: p.tempo, schalter: p.schalter};
      if(p.schalter === 'dreht' || p.schalter === 'stopp') o.link = Number(linkSelect.value);
      return o;
    },
    nummerAktiv: p => (p.schalter === 'dreht' || p.schalter === 'stopp') && !!p.link,
    mitNummer: false, nummerName: 'Förderband',
    klick(p){ p.richtung = p.richtung === 'l' ? 'r' : 'l'; },
    zeichnen(ctx, c, r, TILE, p){
      bandBild(ctx, c*TILE, r*TILE, TILE, TILE, (p.richtung === 'l' ? -1 : 1)*(Number(p.tempo) || 1.6), 0);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText((p.richtung === 'l' ? '←' : '→') + (Number(p.tempo) > 2 ? '»' : '') + (p.link ? ' ' + p.link : ''), c*TILE + TILE/2, r*TILE + TILE*0.62);
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, w: TILE, h: TILE, richtung: p.richtung === 'l' ? 'l' : 'r',
      tempo: Number(p.tempo) || 1.6, ...((p.schalter === 'dreht' || p.schalter === 'stopp') && p.link ? {link: p.link, schalter: p.schalter} : {})})),
  },
  spiel: {
    laden(daten){
      for(const b of (daten.baender || [])) solids.push({x: b.x, y: b.y, w: b.w || 40, h: b.h || 40, type: 'band',
        dir: b.richtung === 'l' ? -1 : 1, tempo: Number(b.tempo) || 1.6, link: b.link || null, schalter: b.schalter === 'stopp' ? 'stopp' : 'dreht'});
      bandSchritte = 0;
    },
    // nach dem Bewegen: wer auf einem Band steht, wird mitgenommen (Wände halten ihn auf)
    // Springt man ab, nimmt man den Schwung des Bands einmal mit (Band als Schleuder; Höchsttempo wie beim Sprint)
    nachBewegung(player){
      const s = bandUnter(player);
      if(!s){
        if(!player.grounded && player.bandSchwung) player.vx += player.bandSchwung;
        player.bandSchwung = 0;
        return;
      }
      const d = bandTempo(s);
      player.bandSchwung = d;
      if(!d) return;
      const v0 = player.vx;
      player.vx = d; player.x += d; collideAxis(player, 'x');
      player.vx = v0;
    },
    schritt: bandSchritt,
    zeichnen(){ bandZeichnen(); },
  },
});
