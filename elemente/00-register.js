// elemente/00-register.js – Element-Register von "Monchichi Koop" (Ausbau 2).
// EIN Eintrag pro Spiel-Element mit allem, was dazugehört: Daten (Feld im Spiel-Format), Editor-Werkzeug
// (Knopf, Zeichnen, Export) und Spiel (Laden, Zeichnen, Logik). Die Dateien in elemente/ lädt das Spiel
// (index.html) UND der Editor (editor/index.html) – jede Seite benutzt nur ihren Teil. Klassische Skripte ohne Build.
// Beim Laden selbst darf eine Element-Datei nichts vom Spiel oder Editor benutzen (nur Funktionen definieren);
// alles andere (ctx, camX, TILE …) erst in den Funktionen, die Spiel bzw. Editor später aufrufen.
//
// Aufbau eines Eintrags (Beispiele: sprungpilz.js = Punkt-Element, aufwind.js = Kachel-Element):
//   id, name, feld          – Name im Spiel-Format (z. B. 'bouncers')
//   editor: { werkzeug      – data-tool des Knopfs
//             gruppe, vor   – Werkzeug-Gruppe (gelaende, gefahren, logik, bewegung, sammeln, marken), Knopf davor einsortieren
//             titel, farbe  – Tooltip und Farbfeld des Knopfs
//             art           – 'punkt' (Liste {c,r} pro Kästchen) oder 'kachel' (Kästchen-Sorte im Raster)
//             ziehbar       – mit gedrückter Maus malbar
//             zeichnen(ctx, c, r, TILE)            – Editor-Bild eines Kästchens/Punkts
//             exportieren(liste, TILE, mergeRects) – Punkte bzw. Kästchen [{c,r}] -> Spiel-Format }
//   spiel:  { laden(daten)                         – Level-Daten übernehmen (setzt die Spiel-Liste)
//             zeichnen()                           – in der Welt zeichnen (12-welt-zeichnen.js)
//             nachBewegung(figur, warAmBoden, fallVy) – nach dem Bewegen einer Figur (08-figur-physik-seil.js) }
// Neue Elemente: Datei hier anlegen und in index.html + editor/index.html in die Lade-Liste eintragen
// (Checkliste in CLAUDE.md).
//   Elemente mit Verknüpfungs-Nummer (Hebel, Tür, Druckplatte): editor.mitNummer = true (Punkt bekommt link aus
//   „Verknüpfung“), editor.nummerName = Wort für die ✓-Markierung. Die SCHALT-LOGIK (was passiert, wenn eine Nummer
//   an/aus geht) steht gemeinsam im Verknüpfungs-System in js/05-level-objekte.js (setLink, updateDoorsAndSwitches),
//   weil dort Hebel, Türen, Druckplatten, bewegte Teile und Haken über die Nummern zusammenspielen.
const ELEMENTE = [];
function elementRegistrieren(def){ ELEMENTE.push(def); return def; }
const elementNachWerkzeug = werkzeug => ELEMENTE.find(E => E.editor && E.editor.werkzeug === werkzeug) || null;
// (Editor) Kästchen mit Nummer zeichnen – für Hebel und Tür
function elementNummerZeichnen(ctx, c, r, TILE, color, dark, link){
  const cx = c*TILE+TILE/2, cy = r*TILE+TILE/2;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx-TILE*0.36,cy-TILE*0.36,TILE*0.72,TILE*0.72,5) : ctx.rect(cx-TILE*0.36,cy-TILE*0.36,TILE*0.72,TILE*0.72);
  ctx.fill();
  ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(link), cx, cy+1);
}
// (Editor + Spiel-Notlösung) Punkt mit Nummer ins Spiel-Format: Mitte des Kästchens
const elementPunktMitte = (liste, TILE) => liste.map(p => ({x: p.c*TILE+TILE/2, y: p.r*TILE+TILE/2, link: p.link}));
