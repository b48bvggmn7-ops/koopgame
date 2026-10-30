// elemente/blattfloss.js – Element „Blatt-Floß“ (Dschungel-Neu; Punkt-Element, siehe 00-register.js).
// Ein großes, festes Blatt (3 Kästchen breit) auf einer Ranken-Schiene nach rechts (Editor-Auswahl „Schiene“: so viele
// Kästchen weit). Nur der Seiten-Wind des Affen (js/34-koop-aktionen.js, pusteTrifft) schiebt es – in Blasrichtung, bis zum
// Ende der Schiene; ohne Wind gleitet es kurz aus und bleibt dort liegen (Neustart/Tod: zurück an den Anfang).
// Wer darauf steht, fährt mit. Rolle: der Affe pustet, das Schweinchen (oder der Affe, solange das Schweinchen ihn nicht
// braucht) fährt; oft muss der Affe erst an einen Platz, von dem aus sein Wind das Blatt trifft.
// Im Spiel: solids mit type 'blatt' {x, y, w, h, x0, x1 (Schiene), v} – zeichnet sich selbst (ELEMENT_SOLID_TYPEN).
const BLATT_BREITE = 120, BLATT_DICKE = 18;
const BLATT_SCHUB = 0.22;      // px/Schritt² bei vollem Wind
const BLATT_MAX = 3.2;         // höchstens so schnell (px/Schritt)
const BLATT_AUSLAUF = 0.9;     // ohne Wind: Tempo je Schritt mal diesem Wert
const BLATT_SCHIENE_MAX = 40;  // Kästchen: so lang darf die Schiene im Editor gezogen werden
const BLATT_RAD_TEMPO = 2;     // px/Schritt, solange jemand ein Floß-Rad dreht (elemente/flossrad.js)
let blattFloesse = [];
ELEMENT_SOLID_TYPEN.add('blatt');
// Aussehen (Nutzer: „sieht echt nicht gut aus“): ein breites, dickes Dschungelblatt, leicht von oben gesehen – Oberseite mit
// Mittelrippe und Adern, aufgebogene Spitze und Stielende, dunkle Unterseite als Dicke. Es hängt wie eine Gondel an zwei kurzen
// Lianen an einer straff gespannten Ranken-Schiene darüber; deren Enden hängen an Material darüber oder aus dem Blätterdach
// (wie die Haken, js/12b) – so schwebt nichts einfach in der Luft. Nur Aussehen.
const BLATT_SCHIENE_HOCH = 72;   // px: so hoch über der Stehfläche läuft die Schiene (über den Köpfen)
// Nutzerwahl am Bild: das alte Blatt UMGEDREHT; Nutzer: „ich will IM Blatt stehen“ -> das umgedrehte Blatt ist eine Schale von
// der Seite: die dunkle Wölbung ist die hintere Blattwand (HINTER den Figuren, teil 'hinten'), das helle Band davor der vordere
// Rand (VOR den Füßen, teil 'vorne', nur über dem Blatt selbst – wer daneben steht, steht nicht „drin“). y = Stehfläche; die
// Füße stecken BLATT_EINSINKEN px im vorderen Rand. Ohne teil: beides (Editor). BLATT_WOELBUNG staucht die Höhe etwas.
const BLATT_WOELBUNG = 0.75;
const BLATT_EINSINKEN = 2;        // px: so liegt die Mitte des vorderen Rands unter der Stehfläche (Rand ~6 px über den Füßen)
function blattBild(g, x, y, w, schwank, teil){
  g.save(); g.translate(x + w/2, y - BLATT_EINSINKEN); g.rotate(schwank || 0); g.scale(1, -BLATT_WOELBUNG);
  const L = w/2;
  if(teil !== 'vorne'){
    // hintere Blattwand (die frühere Unterseite, jetzt gewölbt hinter den Figuren)
    g.fillStyle = '#24501f';
    g.beginPath(); g.moveTo(-L - 2, -6); g.quadraticCurveTo(-L*0.55, -11, 0, -10); g.quadraticCurveTo(L*0.62, -10, L + 10, -9);
    g.quadraticCurveTo(L*0.6, 13, 0, 12); g.quadraticCurveTo(-L*0.62, 12, -L - 2, -6); g.fill();
    g.strokeStyle = 'rgba(120,190,90,.35)'; g.lineWidth = 1.2;   // feine Adern auf der Innenseite der Wand
    for(let i = -2; i <= 2; i++){ const px = i*L*0.3; g.beginPath(); g.moveTo(px, 1); g.quadraticCurveTo(px + L*0.08, 6, px + L*0.12, 10 - Math.abs(i)*0.8); g.stroke(); }
    if(teil === 'hinten'){
      g.strokeStyle = 'rgba(20,45,16,.7)'; g.lineWidth = 1.2;   // dunkle Kante der hinteren Wand (hinter den Figuren)
      g.beginPath(); g.moveTo(-L - 1, -5); g.quadraticCurveTo(-L*0.6, 12.5, 0, 12); g.quadraticCurveTo(L*0.6, 12.5, L + 10, -9); g.stroke();
      g.restore(); return;
    }
  }
  // vorderer Rand (die frühere Oberseite) – nur über dem Blatt selbst, damit Nachbarn nicht „im Blatt“ stehen
  if(teil === 'vorne'){ g.beginPath(); g.rect(-L + 3, -30, 2*L - 6, 60); g.clip(); }
  const gr = g.createLinearGradient(0, -10, 0, 6);
  gr.addColorStop(0, '#a6e47c'); gr.addColorStop(0.5, '#6fc055'); gr.addColorStop(1, '#3f8a37');
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(-L, -6); g.quadraticCurveTo(-L*0.55, -10.5, 0, -9.5); g.quadraticCurveTo(L*0.62, -9.5, L + 8, -9);
  g.quadraticCurveTo(L*0.55, 5, 0, 5); g.quadraticCurveTo(-L*0.6, 5, -L, -6); g.fill();
  // heller Rand vorne (Licht von oben) und dunkle Kante unten
  g.strokeStyle = 'rgba(225,255,190,.55)'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(-L + 2, -6.5); g.quadraticCurveTo(-L*0.55, -10.2, 0, -9.2); g.quadraticCurveTo(L*0.62, -9.2, L + 6, -8.8); g.stroke();
  if(teil !== 'vorne'){   // dunkle Kante der hinteren Wand – gehört HINTER die Figuren (Nutzer: „Outline geht durch den Affen“)
    g.strokeStyle = 'rgba(20,45,16,.7)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(-L - 1, -5); g.quadraticCurveTo(-L*0.6, 12.5, 0, 12); g.quadraticCurveTo(L*0.6, 12.5, L + 10, -9); g.stroke();
  }
  // Mittelrippe und Adern
  g.strokeStyle = 'rgba(214,240,170,.8)'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(-L + 4, -5); g.quadraticCurveTo(0, -1.5, L + 5, -8.5); g.stroke();
  g.strokeStyle = 'rgba(40,95,34,.55)'; g.lineWidth = 1;
  for(let i = -3; i <= 3; i++){
    const px = i*L*0.27, py = -3 - (i + 3)*0.35;
    g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + L*0.1, py - 3, px + L*0.18, -8.6 + Math.abs(i)*0.2);
    g.moveTo(px, py + 0.5); g.quadraticCurveTo(px + L*0.1, py + 4, px + L*0.17, 3.5 - Math.abs(i)*0.4); g.stroke();
  }
  // Stiel hinten, eingerollt
  g.strokeStyle = '#3d6f2e'; g.lineWidth = 2.6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-L, -5); g.quadraticCurveTo(-L - 9, -4, -L - 11, -11); g.quadraticCurveTo(-L - 12, -16, -L - 7, -15); g.stroke();
  // Tautropfen
  g.fillStyle = 'rgba(220,250,255,.75)'; g.beginPath(); g.ellipse(L*0.35, -4.5, 2.2, 1.6, 0, 0, Math.PI*2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(L*0.35 - 0.7, -5, 0.7, 0, Math.PI*2); g.fill();
  g.restore();
}
// Aufhänge-Höhe einer Schienen-Ende (Material darüber oder Blätterdach), je Floß einmal gemerkt
function blattSchieneEnden(s){
  if(s._enden) return s._enden;
  const y = s.y - BLATT_SCHIENE_HOCH, a = s.x0 - 8, b = s.x1 + s.w + 8;
  const hoch = x => typeof hakenAufhaengeY === 'function' ? hakenAufhaengeY(x, y) : null;
  return (s._enden = {y, a, b, ya: hoch(a), yb: hoch(b)});
}
// ---------- Seilzug (Nutzer: „mach da doch mal kleine Seilzüge“, „Hintergrund und Vordergrund dürfen sich nicht vermischen“):
// gedrehte Hanf-Taue statt beblätterter Lianen (heben sich klar vom Dschungel ab), Rollenwagen auf der Schiene, Knoten am Blatt
const TAU_DUNKEL = '#3a2410', TAU_HELL = '#b98a4e', TAU_LICHT = 'rgba(255,230,180,.55)';
// Tau von (x0,y0) nach (x1,y1) mit leichtem Durchhang (sag px nach unten); dick = Breite
function tauZeichnen(x0, y0, x1, y1, sag, dick){
  dick = dick || 3;
  const cx = (x0 + x1)/2, cy = (y0 + y1)/2 + (sag || 0);
  ctx.save(); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1);
  ctx.strokeStyle = TAU_DUNKEL; ctx.lineWidth = dick + 1.8; ctx.stroke();
  ctx.strokeStyle = TAU_HELL; ctx.lineWidth = dick; ctx.stroke();
  ctx.setLineDash([2.2, 2.6]); ctx.strokeStyle = 'rgba(90,55,20,.75)'; ctx.lineWidth = dick*0.9; ctx.stroke();   // Drehung (Litzen)
  ctx.setLineDash([]); ctx.strokeStyle = TAU_LICHT; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(x0, y0 - dick*0.25); ctx.quadraticCurveTo(cx, cy - dick*0.25, x1, y1 - dick*0.25); ctx.stroke();
  ctx.restore();
}
// Rolle (Rad mit Achse): r Radius, w Drehwinkel
function rolleZeichnen(x, y, r, w){
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#2a1a0c'; ctx.beginPath(); ctx.arc(0, 0, r + 1.2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#9a6a35'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
  ctx.rotate(w); ctx.strokeStyle = '#4a2e14'; ctx.lineWidth = 1.1;
  for(let i = 0; i < 3; i++){ ctx.rotate(Math.PI/3); ctx.beginPath(); ctx.moveTo(-r + 0.8, 0); ctx.lineTo(r - 0.8, 0); ctx.stroke(); }
  ctx.fillStyle = '#4b5563'; ctx.beginPath(); ctx.arc(0, 0, 1.4, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
// Rollenwagen auf der Schiene bei x: zwei Rollen oben auf dem Tau, Holzplatte darunter mit Öse fürs Hänge-Tau
function rollenwagenZeichnen(x, y, drehung){
  for(const dx of [-5, 5]) rolleZeichnen(x + dx, y - 4, 3.6, drehung);
  ctx.fillStyle = '#2a1a0c'; ctx.beginPath(); ctx.roundRect(x - 9, y - 1.5, 18, 6, 2); ctx.fill();
  const hz = ctx.createLinearGradient(0, y - 1, 0, y + 4); hz.addColorStop(0, '#b47a40'); hz.addColorStop(1, '#6b4019');
  ctx.fillStyle = hz; ctx.beginPath(); ctx.roundRect(x - 8, y - 0.8, 16, 4.6, 1.6); ctx.fill();
  ctx.fillStyle = '#9aa3ad'; for(const dx of [-5, 5]){ ctx.beginPath(); ctx.arc(x + dx, y + 1.5, 0.9, 0, Math.PI*2); ctx.fill(); }
  ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y + 6, 2.2, 0, Math.PI*2); ctx.stroke();   // Öse
}
// Knoten am Blatt: das Tau ist einmal um den Blattrand geschlungen
function knotenZeichnen(x, y){
  ctx.fillStyle = TAU_DUNKEL; ctx.beginPath(); ctx.ellipse(x, y, 4.2, 3.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = TAU_HELL; ctx.beginPath(); ctx.ellipse(x, y - 0.3, 3.2, 2.3, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(90,55,20,.8)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(x - 2.5, y + 1.6); ctx.lineTo(x + 2.5, y - 1.8); ctx.stroke();
  ctx.strokeStyle = TAU_HELL; ctx.lineWidth = 1.6; ctx.lineCap = 'round';   // kurzes loses Ende
  ctx.beginPath(); ctx.moveTo(x + 2, y + 2); ctx.quadraticCurveTo(x + 4, y + 5, x + 3, y + 8); ctx.stroke();
}
const BLATT_KNOTEN_X = 46, BLATT_KNOTEN_Y = -5;   // px: Knoten an der hinteren Blattwand (von der Blattmitte / Stehfläche)
// Durchhang der Tau-Schiene (nur Aussehen): sanftes Wippen, unter dem fahrenden Blatt etwas mehr
function blattSchieneDurchhang(s, t){
  const fahrt = Math.min(1, Math.abs(s.v)/BLATT_MAX);
  return 3 + Math.sin(t*1.1 + s.x0*0.003)*1.2 + fahrt*(2.5 + Math.sin(t*9)*1);
}
elementRegistrieren({
  id: 'blattfloss', name: 'Blatt-Floß', feld: 'blattFloesse',
  editor: {
    werkzeug: 'blatt', gruppe: 'bewegung', vor: 'move', art: 'punkt', ziehbar: false, farbe: '#6cbb53',
    mitNummer: true, nummerName: 'Blatt-Floß',   // Floß-Rad mit derselben Nummer zieht dieses Blatt (elemente/flossrad.js)
    titel: 'Blatt-Floß: großes Blatt (3 Kästchen) auf einer Schiene nach rechts; nur der Seiten-Wind des Affen schiebt es, ' +
           'wer darin steht, fährt mit. Setzen am linken Ende (das Blatt liegt in der Reihe, man steht auf ihrem Boden); ' +
           'Maus gedrückt halten und nach rechts ziehen = Länge der Schiene',
    optionen: [{key: 'schiene', label: 'Schiene', zahl: true, titel: 'so viele Kästchen weit kann der Wind das Blatt nach rechts schieben (oder beim Setzen ziehen)',
                werte: [['4', '4 Kästchen'], ['6', '6 Kästchen'], ['8', '8 Kästchen'], ['10', '10 Kästchen'], ['14', '14 Kästchen']]}],
    bereich: p => Array.from({length: 3 + (Number(p.schiene) || 6)}, (_, k) => [p.c + k, p.r]),   // Blatt + gezeichnete Schiene
    // Nutzerwunsch: beim Setzen gedrückt halten und ziehen bestimmt die Länge (Maus über dem Kästchen, bis zu dem das Blatt fahren soll)
    ziehen(p, c){
      if(c < p.c + 3) return null;   // noch über dem Blatt (z. B. beim Klicken leicht verrutscht): nichts ändern
      const n = Math.min(BLATT_SCHIENE_MAX, c - p.c - 2); if(n === Number(p.schiene)) return null;
      p.schiene = n; return `Blatt-Floß: Schiene ${n} Kästchen`;
    },
    zeichnen(ctx, c, r, TILE, p){
      const n = Number(p.schiene) || 6, s = TILE/40, boden = (r + 1)*TILE - 8*s;   // ganz im Kästchen (nicht auf der Linie)
      ctx.strokeStyle = 'rgba(90,160,79,.85)'; ctx.setLineDash([6, 4]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(c*TILE + 4, r*TILE + 6*s); ctx.lineTo((c + 3 + n)*TILE - 4, r*TILE + 6*s); ctx.stroke();   // Schiene
      ctx.strokeStyle = 'rgba(90,160,79,.5)'; ctx.strokeRect((c + n)*TILE + 2, r*TILE + 2, 3*TILE - 4, TILE - 4); ctx.setLineDash([]);   // Ende der Fahrt
      ctx.save(); ctx.translate(c*TILE, boden); ctx.scale(s, s); blattBild(ctx, 0, 0, 120, 0); ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.strokeText('↔' + n, (c + 3 + n)*TILE - 14, r*TILE + 18*s); ctx.fillText('↔' + n, (c + 3 + n)*TILE - 14, r*TILE + 18*s);   // Länge der Schiene
      if(p.link){   // Verknüpfungs-Nummer (fürs Floß-Rad) als farbiges Abzeichen – nicht mit der Schienen-Länge verwechseln
        ctx.fillStyle = typeof linkColor === 'function' ? linkColor(p.link) : '#ff9f43'; ctx.beginPath(); ctx.arc(c*TILE + 11, r*TILE + 10, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.strokeText(String(p.link), c*TILE + 11, r*TILE + 10.5); ctx.fillText(String(p.link), c*TILE + 11, r*TILE + 10.5);
      }
    },
    exportieren: (liste, TILE) => liste.map(p => ({x: p.c*TILE, y: p.r*TILE, schiene: Number(p.schiene) || 6, ...(p.link ? {link: p.link} : {})})),
  },
  spiel: {
    laden(daten){
      blattFloesse = (daten.blattFloesse || []).map(b => {
        // Stehfläche = Boden des Kästchens (das Blatt liegt IN seiner Reihe wie alles andere; vorher an der Oberkante)
        const s = {x: b.x, y: b.y + 40, w: BLATT_BREITE, h: BLATT_DICKE, type: 'blatt', x0: b.x, x1: b.x + (Number(b.schiene) || 6)*40, v: 0, link: b.link || 0};
        solids.push(s); return s;
      });
    },
    zuruecksetzen(){ for(const s of blattFloesse){ s.x = s.x0; s.v = 0; } },
    schritt(figuren){
      for(const s of blattFloesse){
        // Seiten-Wind schiebt; nicht das Blatt, auf dem der Pustende selbst steht
        const st = pusteStrahlJetzt, k = st && st.dir !== 'hoch' && st.von.standingOn !== s ? pusteTrifft({x: s.x, y: s.y - 6, w: s.w, h: s.h + 12}) : 0;
        if(s.radZug){ s.v = s.radZug*BLATT_RAD_TEMPO; s.radZug = 0; s.vomRad = true; }   // Floß-Rad wird gedreht (elemente/flossrad.js): gleichmäßig ziehen
        else if(s.vomRad){ s.v = 0; s.vomRad = false; }   // Rad losgelassen: sofort anhalten (kein Ausgleiten)
        else if(k > 0) s.v = Math.max(-BLATT_MAX, Math.min(BLATT_MAX, s.v + pusteSeiteVon(st.dir)*BLATT_SCHUB*k*(pusteSchraeg(st.dir) ? 0.7 : 1)));
        else { s.v *= BLATT_AUSLAUF; if(Math.abs(s.v) < 0.03) s.v = 0; }
        if(!s.v) continue;
        let nx = Math.max(s.x0, Math.min(s.x1, s.x + s.v));
        // nicht in Wände/Boden schieben (anderes festes Teil auf der Höhe des Blatts)
        const fest = solids.some(o => o !== s && !o.gone && o.type !== 'oneway' && o.type !== 'fake' && o.type !== 'door' &&
          nx < o.x + o.w && nx + s.w > o.x && s.y < o.y + o.h && s.y + s.h > o.y);
        if(fest){ s.v = 0; continue; }
        const dx = nx - s.x;
        if(nx === s.x0 || nx === s.x1) s.v = 0;
        // wer darauf steht, fährt mit (nur, wenn dort Platz ist)
        for(const P of figuren){
          if(!P || !P.grounded || Math.abs(P.y - s.y) > 2 || P.x + P.w/2 <= s.x || P.x - P.w/2 >= s.x + s.w) continue;
          if(spotFree(P.x + dx, P.y, P)) P.x += dx;
        }
        s.x = nx;
      }
    },
    // Schiene und ihre Aufhängung HINTER Boden/Wand (läuft sie durch Gelände, verschwindet sie dahinter)
    zeichnenHinten(){
      const t = performance.now()*0.001;
      for(const s of blattFloesse){
        const E = blattSchieneEnden(s), a = E.a - camX, b = E.b - camX;
        if(b < -60 || a > VW + 60) continue;
        // Nutzer: „die Lianen sollen sich ein bisschen bewegen“ – sanftes Wiegen im Wind, stärker, solange das Blatt fährt
        const fahrt = Math.min(1, Math.abs(s.v)/BLATT_MAX), wind = Math.sin(t*1.1 + s.x0*0.003);
        for(const [x, yo, wx] of [[a, E.ya, E.a], [b, E.yb, E.b]]){   // Enden: Liane nach oben bis zum Material bzw. ins Blätterdach
          const pendel = Math.sin(t*0.9 + wx*0.01)*2.2 + fahrt*Math.sin(t*6 + wx)*1.2;
          lianeZeichnen(x + Math.sin(wx*0.013)*3, yo !== null ? yo : -SKY_ROOM - 10, x, E.y - 6, 0.35, pendel, wx);
          if(yo !== null && typeof hakenHalter === 'function') hakenHalter(x, yo, HAKEN_STIL.dschungel, 'dschungel');
        }
        // Tau-Schiene: straff gespannt, hängt etwas durch und wippt (unter der Last des fahrenden Blatts mehr)
        tauZeichnen(a, E.y, b, E.y, blattSchieneDurchhang(s, t), 3.2);
        for(const x of [a, b]) rolleZeichnen(x, E.y - 1, 5.5, -s.x/5.5);   // Umlenkrollen an den Enden (drehen beim Fahren mit)
      }
    },
    zeichnen(){
      const t = performance.now()*0.001;
      for(const s of blattFloesse){
        const E = blattSchieneEnden(s);
        if(E.b - camX < -60 || E.a - camX > VW + 60) continue;
        const schwank = Math.sin(t*1.7 + s.x0*0.01)*0.015 + s.v*0.012, x = Math.round(s.x - camX), mitte = x + s.w/2;
        const sag = blattSchieneDurchhang(s, t), a = E.a - camX, b = E.b - camX;
        blattBild(ctx, x, s.y, s.w, schwank, 'hinten');   // hintere Blattwand (hinter den Figuren); kein Schatten (Nutzer)
        // zwei Seilzüge: Rollenwagen auf der Tau-Schiene, Tau hinunter, am Blatt festgeknotet (beim Fahren hängt es etwas nach)
        for(const d of [-1, 1]){
          const kx = mitte + d*BLATT_KNOTEN_X, ky = s.y + BLATT_KNOTEN_Y + d*BLATT_KNOTEN_X*Math.sin(schwank), nach = -s.v*2;
          const wx = kx - nach, u = Math.max(0, Math.min(1, (wx - a)/(b - a))), wy = E.y + 2*sag*u*(1 - u);
          tauZeichnen(wx, wy + 6, kx, ky, Math.sin(t*1.4 + kx*0.05)*0.8, 2.2);
          rollenwagenZeichnen(wx, wy, -s.x/3.6);
          knotenZeichnen(kx, ky);
        }
      }
    },
    zeichnenVorne(){   // vorderer Blattrand VOR den Figuren: wer im Blatt steht, steht drin (nur über dem Blatt selbst)
      const t = performance.now()*0.001;
      for(const s of blattFloesse){
        const x = Math.round(s.x - camX);
        if(x + s.w < -40 || x > VW + 40) continue;
        blattBild(ctx, x, s.y, s.w, Math.sin(t*1.7 + s.x0*0.01)*0.015 + s.v*0.012, 'vorne');
      }
    },
  },
});
