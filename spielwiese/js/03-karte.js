// 03-karte.js – Spielwiese: die Test-Arena (feste Karte im Code) mit Stationen und Schildern.
// Zeichen je Kästchen: '.' frei · '#' Boden/Wand · '^' Stacheln (später: Anker, Haftflächen, brechbare Wände).
// Boden-Oberkante = Reihe 18 (Füße bei y = 18 · 40). Sichtbar sind ca. 21 Reihen.

let KARTE_B = 680;   // Breite (eigene Karten aus dem Mini-Editor dürfen anders breit sein)
const KARTE_H = 21, BODEN_R = 18;
let karte = [];   // karte[r][c]

function karteLeer(){
  karte = [];
  for(let r = 0; r < KARTE_H; r++) karte.push(new Array(KARTE_B).fill(r >= BODEN_R ? '#' : '.'));
}
function setze(c0, r0, c1, r1, z){   // Rechteck von (c0, r0) bis (c1, r1) einschließlich
  for(let r = Math.max(0, r0); r <= Math.min(KARTE_H - 1, r1); r++)
    for(let c = Math.max(0, c0); c <= Math.min(KARTE_B - 1, c1); c++) karte[r][c] = z;
}
function grube(c0, c1){ setze(c0, BODEN_R, c1, BODEN_R + 1, '.'); setze(c0, BODEN_R + 1, c1, BODEN_R + 1, '^'); }
function zelle(c, r){
  if(c < 0 || c >= KARTE_B) return '#';   // Rand links/rechts = Wand
  if(r < 0 || r >= KARTE_H) return '.';
  return karte[r][c];
}
const fest = (c, r) => { const z = zelle(c, r); return z === '#' || z === '=' || z === 'x'; };   // '=' Haftfläche, 'x' brechbar
const RAMPE_HOCH_RECHTS = '/', RAMPE_HOCH_LINKS = '\\';   // Rampen: nur ihre schräge Fläche zählt (Laufen + Rollen)

// Stationen: von/bis = Spalten; start = Rücksetzpunkt (Füße auf Reihe r); mech = welche Mechanik die Tasten 1–4 umschalten
const STATIONEN = [
  {nr: 1, name: 'Grundlagen', von: 0, bis: 51, start: {c: 4, r: BODEN_R}, mech: 'sprung'},
  {nr: 2, name: 'Dash', von: 52, bis: 99, start: {c: 55, r: BODEN_R}, mech: 'dash'},
  {nr: 3, name: 'Haken', von: 100, bis: 149, start: {c: 102, r: BODEN_R}, mech: 'haken'},
  {nr: 4, name: 'Unterseite', von: 150, bis: 189, start: {c: 152, r: BODEN_R}, mech: 'haft'},
  {nr: 5, name: 'Durchbruch', von: 190, bis: 239, start: {c: 192, r: BODEN_R}, mech: 'bruch'},
  {nr: 6, name: 'Kombi', von: 240, bis: 289, start: {c: 242, r: BODEN_R}, mech: null},
  {nr: 7, name: 'Freie Fläche', von: 290, bis: 399, start: {c: 292, r: BODEN_R}, mech: null},
  {nr: 8, name: 'Spaß-Level', von: 400, bis: 479, start: {c: 402, r: BODEN_R}, mech: null},
  {nr: 9, name: 'Anker-Spielplatz', von: 480, bis: 539, start: {c: 482, r: BODEN_R}, mech: 'haken'},
  {nr: 10, name: 'Anker-Parcours', von: 540, bis: 599, start: {c: 542, r: BODEN_R}, mech: 'haken'},
  {nr: 11, name: 'Schirm-Anker', von: 600, bis: 679, start: {c: 602, r: BODEN_R}, mech: 'haken', schwein: true},
];
// Schilder: Text im Bild (Spalte, Reihe der Füße des Pfostens, Zeilen)
let SCHILDER = [];
// Zwischenpunkte (Fähnchen): wer darauf steht, startet nach dem Sterben dort (Kombi-Station)
let ZWISCHENPUNKTE = [];

function arenaBauen(){
  karteLeer();
  SCHILDER = []; ZWISCHENPUNKTE = [];
  setze(0, 0, 0, KARTE_H - 1, '#');                 // linker Rand
  setze(KARTE_B - 1, 0, KARTE_B - 1, KARTE_H - 1, '#');   // rechter Rand

  // ----- Station 1: Grundlagen (Laufen, Springen, Coyote-Time, Puffer, Wandsprung) -----
  SCHILDER.push({c: 2, r: BODEN_R, zeilen: ['Station 1: Grundlagen', 'Laufen · Springen · Wandsprung', 'Tasten 1–4: Sprung-Varianten']});
  setze(10, 17, 10, 17, '#');                        // Stufe 1 hoch
  setze(12, 16, 13, 17, '#');                        // Stufe 2 hoch
  setze(15, 15, 18, 17, '#');                        // Stufe 3 hoch (fast die volle Sprunghöhe)
  grube(21, 23);                                     // kleine Stachelgrube
  SCHILDER.push({c: 25, r: BODEN_R, zeilen: ['Spät abspringen?', 'Coyote-Time hilft']});
  setze(28, 15, 31, 17, '#');                        // Absatz
  grube(32, 34);                                     // Lücke zwischen zwei Absätzen
  setze(35, 15, 38, 17, '#');
  SCHILDER.push({c: 40, r: BODEN_R, zeilen: ['Kamin:', 'hin und her springen']});
  setze(42, 6, 42, 15, '#');                         // linke Kaminwand (unten offen zum Hineinlaufen)
  setze(46, 6, 46, 17, '#');                         // rechte Kaminwand, oben drauf geht es weiter
  setze(46, 6, 49, 6, '#');
  SCHILDER.push({c: 47, r: 6, zeilen: ['Geschafft!']});

  // ----- Station 2: Dash -----
  setze(51, 17, 51, 17, '#');                        // Grenzstein
  SCHILDER.push({c: 53, r: BODEN_R, zeilen: ['Station 2: Dash (J)', 'Richtung + J · 8 Richtungen', 'Tasten 1–4: Dash-Varianten']});
  grube(60, 67);                                     // 8 Kästchen: mit Sprung allein (bei diesem Anlauf ~4,5) nicht zu schaffen
  SCHILDER.push({c: 58, r: BODEN_R, zeilen: ['Springen + Dash']});
  SCHILDER.push({c: 70, r: BODEN_R, zeilen: ['Slalom: Wand berühren', '= Dash wieder voll']});
  grube(73, 88);                                     // Slalom über Stacheln
  setze(76, 12, 76, 19, '#');                        // Säule von unten (drüber)
  setze(80, 0, 80, 14, '#');                         // Säule von oben (drunter durch)
  setze(84, 11, 84, 19, '#');                        // Säule von unten (drüber)
  setze(89, 17, 90, 17, '#');                        // kleine Stufe nach dem Slalom
  SCHILDER.push({c: 92, r: BODEN_R, zeilen: ['An der Wand hoch:', 'springen, dann Dash nach oben']});
  setze(95, 11, 98, 17, '#');                        // Wand 7 Reihen: Sprung (3) + Dash nach oben (4)
  SCHILDER.push({c: 97, r: 11, zeilen: ['Oben!']});

  // ----- Station 3: Haken -----
  setze(99, 17, 99, 17, '#');                        // Grenzstein
  SCHILDER.push({c: 101, r: BODEN_R, zeilen: ['Station 3: Haken (K halten)', 'von Anker zu Anker · W/S Seil', 'Tasten 1–4: Haken-Varianten']});
  grube(106, 125);                                   // Anker-Reihe über Stacheln, verschiedene Abstände
  for(const c of [108, 113, 119, 123]) setze(c, 9, c, 9, 'o');
  SCHILDER.push({c: 127, r: BODEN_R, zeilen: ['Hohe Decke:', 'Variante B greift überall']});
  setze(129, 0, 139, 3, '#');                        // hohe Decke
  grube(130, 138);
  setze(134, 4, 134, 4, 'o');                        // ein Anker unter der Decke (damit A auch geht)
  SCHILDER.push({c: 140, r: BODEN_R, zeilen: ['Der große Bogen']});
  grube(141, 147);                                   // ein Anker hoch über einer langen Grube
  setze(144, 5, 144, 5, 'o');

  // ----- Station 4: Unterseite (Haften und Rollen) -----
  setze(149, 17, 149, 17, '#');                      // Grenzstein
  SCHILDER.push({c: 151, r: BODEN_R, zeilen: ['Station 4: Unterseite (L)', 'A haften · B rollen · C überall', 'Tasten 1–3: Varianten']});
  setze(152, 14, 167, 14, '=');                      // Gang: Haftfläche an der Decke über Stacheln (beginnt schon über dem Boden)
  grube(155, 166);
  SCHILDER.push({c: 169, r: 16, zeilen: ['Rollen (B):', 'L halten, rechts halten']});
  setze(168, 16, 170, 17, '#');                      // Podest
  setze(171, 16, 171, 16, RAMPE_HOCH_LINKS); setze(171, 17, 171, 17, '#');   // Rampe hinunter
  setze(172, 17, 172, 17, RAMPE_HOCH_LINKS);
  setze(173, 18, 180, 18, '=');                      // klebriger Boden
  setze(181, 10, 181, 17, '=');                      // Wand hoch (innere Ecke)
  setze(175, 10, 181, 10, '=');                      // Decke zurück (innere Ecke), außen herum (äußere Ecken)
  grube(184, 186);                                   // Absprung am Ende
  setze(183, 17, 183, 17, RAMPE_HOCH_RECHTS);        // kleine Schanze

  // ----- Station 5: Durchbruch (brechbare Wände 'x' nur mit Dash) -----
  setze(189, 17, 189, 17, '#');                      // Grenzstein
  SCHILDER.push({c: 191, r: BODEN_R, zeilen: ['Station 5: Durchbruch', 'Risse = nur mit Dash (J)', 'Tasten 1–3: Varianten']});
  setze(195, 14, 206, 14, '#');                      // Raum: Decke
  setze(195, 15, 195, 17, 'x');                      // linke Wand (seitlich durch)
  setze(199, 14, 202, 14, 'x');                      // Decke (Dash nach oben)
  setze(206, 15, 206, 17, 'x');                      // rechte Wand
  SCHILDER.push({c: 198, r: BODEN_R, zeilen: ['Raum: rein, raus,', 'oder nach oben']});
  setze(209, 18, 211, 18, 'x');                      // Boden von oben (Dash nach unten)
  setze(209, 19, 211, 19, '.');
  SCHILDER.push({c: 208, r: BODEN_R, zeilen: ['Dash nach unten']});
  setze(214, 13, 226, 13, '#');                      // Kette: Decke drüber, damit man nicht drüberspringt
  for(const c of [216, 218, 220, 222, 224]) setze(c, 14, c, 17, 'x');
  SCHILDER.push({c: 213, r: BODEN_R, zeilen: ['Kette: nach dem Bruch', 'gleich nochmal dashen']});
  setze(229, 9, 229, 17, 'x');                       // hohe Wand, dahinter Grube mit Anker: Dash durch, dann Haken
  grube(230, 236);
  setze(233, 8, 233, 8, 'o');
  SCHILDER.push({c: 227, r: BODEN_R, zeilen: ['Durch die Wand', 'in den Haken (K)']});

  // ----- Station 6: Kombi – alles hintereinander -----
  setze(239, 17, 239, 17, '#');                      // Grenzstein
  SCHILDER.push({c: 241, r: BODEN_R, zeilen: ['Station 6: Kombi', 'Kamin · Decke · Durchbruch', 'Haken · Dash ins Ziel']});
  setze(244, 8, 244, 15, '#');                       // 1) Kamin (3 breit): unten offen zum Hineinlaufen
  setze(248, 8, 251, 17, '#');                       //    rechts: Wand + Podest oben
  ZWISCHENPUNKTE.push({c: 249, r: 8});
  setze(249, 4, 258, 4, '=');                        // 2) Haftdecke über der Grube (beginnt über dem Podest)
  grube(252, 259);
  setze(260, 0, 260, 2, '#'); setze(260, 3, 260, 17, 'x');   // 3) Risswand: vom Hängen aus durchdashen
  grube(261, 276);                                   // 4) Haken-Schwünge über Stacheln
  setze(265, 3, 265, 3, 'o'); setze(271, 3, 271, 3, 'o');
  setze(277, 12, 283, 17, '#');                      // Landeplatz bis an die Zielwand (der Schwung trägt weit)
  ZWISCHENPUNKTE.push({c: 279, r: 12});
  setze(284, 6, 288, 17, '#');                       // 5) Zielwand: Sprung + Dash nach oben (oder Dash an die Wand, Wand lädt, Dash hoch)
  SCHILDER.push({c: 286, r: 6, zeilen: ['Ziel!', 'Kombi geschafft']});

  // ----- Station 7: freie Spielfläche -----
  const F = 290;   // Anfang der freien Fläche
  setze(F - 1, 17, F - 1, 17, '#');
  SCHILDER.push({c: F + 1, r: BODEN_R, zeilen: ['Station 7: Freie Fläche', 'herumtoben · B = selbst bauen']});
  setze(F + 6, 14, F + 9, 14, '#');
  setze(F + 12, 11, F + 14, 11, '#');
  setze(F + 18, 8, F + 21, 8, '#');
  setze(F + 25, 12, F + 27, 12, '#');
  setze(F + 30, 8, F + 30, 15, '#');                 // zweiter Kamin (4 breit)
  setze(F + 35, 4, F + 35, 17, '#');
  setze(F + 35, 4, F + 38, 4, '#');
  setze(F + 39, 17, F + 40, 17, '^');
  for(const c of [F + 46, F + 52, F + 58]) setze(c, 7, c, 7, 'o');   // ein paar Anker zum Schwingen
  setze(F + 44, 13, F + 47, 13, '=');
  setze(F + 50, 9, F + 51, 10, '#');                 // Knick-Block: Liane wickelt sich darum (Schalter „Liane knickt an Ecken“)
  SCHILDER.push({c: F + 62, r: BODEN_R, zeilen: ['Halfpipe (Rollen B +', '„Schwung umlenken“)']});
  setze(F + 64, 12, F + 64, 17, '#'); setze(F + 76, 12, F + 76, 17, '#');   // Halfpipe aus normalen Wänden
  setze(F + 65, 17, F + 65, 17, RAMPE_HOCH_LINKS); setze(F + 75, 17, F + 75, 17, RAMPE_HOCH_RECHTS);
  SCHILDER.push({c: F + 79, r: BODEN_R, zeilen: ['Kristalle (grün):', 'laden den Dash in der Luft']});
  grube(F + 82, F + 102);                            // Kristall-Strecke: Sprung + Dash, Kristall, Dash, Kristall …
  for(const c of [F + 87, F + 92, F + 97]) setze(c, 14, c, 14, 'k');   // auf Höhe eines flachen Dashes nach dem Sprung

  // ----- Station 8: Spaß-Level – jede Mechanik einmal, von links nach rechts -----
  setze(399, 17, 399, 17, '#');
  SCHILDER.push({c: 401, r: BODEN_R, zeilen: ['Station 8: Spaß-Level', 'alles einmal – viel Spaß!']});
  setze(405, 17, 405, 17, RAMPE_HOCH_RECHTS); setze(406, 17, 407, 17, '#'); setze(408, 17, 408, 17, RAMPE_HOCH_LINKS);   // Hügel
  grube(410, 411);                                   // kleiner Sprung
  setze(415, 10, 415, 15, '#');                      // Kamin (Wandsprung)
  setze(419, 10, 422, 17, '#');
  ZWISCHENPUNKTE.push({c: 420, r: 10});
  setze(420, 6, 430, 6, '=');                        // Haftdecke (L halten) über Stacheln
  grube(423, 430);
  setze(435, 12, 437, 12, '#'); setze(436, 13, 436, 17, 'x');   // Risswand unter einem Dach: Dash (J) durch
  ZWISCHENPUNKTE.push({c: 438, r: BODEN_R});
  grube(440, 450);                                   // Kristalle: Sprung + Dash, Kristall, Dash …
  setze(444, 14, 444, 14, 'k'); setze(449, 14, 449, 14, 'k');
  ZWISCHENPUNKTE.push({c: 454, r: BODEN_R});   // breiter Landeplatz 451–456
  grube(457, 468);                                   // Haken-Schwünge (K halten)
  setze(460, 8, 460, 8, 'o'); setze(466, 8, 466, 8, 'o');
  setze(476, 14, 478, 17, '#');                      // Ziel-Podest: Sprung + Dash nach oben
  SCHILDER.push({c: 477, r: 14, zeilen: ['Ziel!', 'Geschafft :)']});

  // ----- Station 9: Anker-Spielplatz – schwankende Anker, Einmal-Anker, Schwung-Ringe -----
  setze(479, 17, 479, 17, '#');
  SCHILDER.push({c: 481, r: BODEN_R, zeilen: ['Station 9: Anker-Spielplatz', 'schwankt · reißt · Ring beschleunigt', 'golden = jetzt loslassen!']});
  grube(486, 532);
  setze(490, 8, 490, 8, 's');                        // schwankender Anker
  setze(500, 7, 500, 7, 'e');                        // Einmal-Anker (reißt)
  setze(507, 8, 507, 8, 's');
  setze(515, 7, 515, 7, 'e');
  setze(521, 8, 521, 8, 'o');                        // normaler Anker
  setze(529, 7, 529, 7, 'o');
  for(const c of [490, 515, 529]) setze(c, 13, c, 13, 'q');   // Schwung-Ringe im Tiefpunkt der Schwünge (gemessen)
  ZWISCHENPUNKTE.push({c: 535, r: BODEN_R});
  SCHILDER.push({c: 536, r: BODEN_R, zeilen: ['Geschafft!']});

  // ----- Station 10: Anker-Parcours – alle Anker-Sorten gemischt, Insel zum Durchatmen -----
  setze(539, 17, 539, 17, '#');
  SCHILDER.push({c: 541, r: BODEN_R, zeilen: ['Station 10: Anker-Parcours', 'nicht trödeln: orange reißt!', 'golden = loslassen']});
  grube(545, 593);
  setze(549, 7, 549, 7, 's');                        // Teil 1: schwankend -> zwei Einmal-Anker hintereinander
  setze(555, 6, 555, 6, 'e');
  setze(561, 7, 561, 7, 'e');
  setze(567, 6, 567, 6, 's');
  setze(573, 5, 573, 5, 'o');
  for(const [c, r] of [[550, 14], [568, 11], [590, 11]]) setze(c, r, c, r, 'q');   // Schwung-Ringe auf gemessener Flughöhe
  setze(577, 12, 580, 17, '#');                      // Insel
  ZWISCHENPUNKTE.push({c: 578, r: 12});
  setze(584, 6, 584, 6, 'e');                        // Teil 2: von der Insel weg
  setze(589, 7, 589, 7, 's');
  SCHILDER.push({c: 596, r: BODEN_R, zeilen: ['Ziel!', 'Anker-Profi :)']});

  // ----- Station 11: Schirm-Anker – keine Anker über der Grube: der Affe hängt sich an den Schirm des Schweinchens -----
  setze(599, 17, 599, 17, '#');
  SCHILDER.push({c: 603, r: BODEN_R, zeilen: ['Station 11: Schirm-Anker', 'Schweinchen: hoch, Schirm auf (Num 1)', 'Affe: Haken an den Schirm (K/G)']});
  setze(606, 15, 607, 17, '#'); setze(609, 12, 610, 17, '#'); setze(612, 9, 614, 17, '#');   // Treppe für das Schweinchen
  grube(615, 632);                                   // 18 breit, kein Anker: nur mit Schirm (gemessen: sie gleitet ~25, mit Affe dran ~22)
  ZWISCHENPUNKTE.push({c: 637, r: BODEN_R});
  setze(640, 15, 640, 17, '#'); setze(642, 12, 643, 17, '#');
  grube(644, 662);                                   // Teil 2: Schirm, dann umgreifen auf den Anker
  setze(654, 6, 654, 6, 'o');
  SCHILDER.push({c: 672, r: BODEN_R, zeilen: ['Ziel!', 'Team-Flug :)']});
}
arenaBauen();

function stationBei(x){
  const c = Math.floor(x / K);
  let s = STATIONEN[0];
  for(const st of STATIONEN) if(c >= st.von) s = st;
  return s;
}
