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
  c.fillStyle = '#3b3446'; c.fillRect(x, y, w, h);                        // Rahmen
  c.fillStyle = '#26212f'; c.fillRect(x + 2, y + 4, w - 4, h - 8);
  // Gurt oben mit wandernden Pfeilen
  c.fillStyle = '#5c5468'; c.fillRect(x, y, w, 9);
  c.save(); c.beginPath(); c.rect(x, y, w, 9); c.clip();
  c.fillStyle = t === 0 ? 'rgba(200,200,210,.35)' : '#ffd36a';
  const dir = Math.sign(t) || 1, off = ((phase % 16) + 16) % 16;
  for(let k = -16; k < w + 16; k += 16){
    const px = x + k + (dir > 0 ? off : 16 - off);
    c.beginPath(); c.moveTo(px - 3*dir, y + 1.5); c.lineTo(px + 3*dir, y + 4.5); c.lineTo(px - 3*dir, y + 7.5); c.closePath(); c.fill();
  }
  c.restore();
  // Rollen
  c.fillStyle = '#8a8296';
  for(const rx of [x + 8, x + w - 8]){ c.beginPath(); c.arc(rx, y + h*0.62, 5, 0, Math.PI*2); c.fill(); }
  c.fillStyle = '#26212f';
  for(const rx of [x + 8, x + w - 8]){ c.beginPath(); c.arc(rx, y + h*0.62, 1.8, 0, Math.PI*2); c.fill(); }
}
function bandZeichnen(){
  for(const s of solids){
    if(s.type !== 'band') continue;
    const x = Math.round(s.x - camX);
    if(x + s.w < -20 || x > VW + 20) continue;
    bandBild(ctx, x, s.y, s.w, s.h, bandTempo(s), bandSchritte*bandTempo(s)*0.5);
  }
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
