// 03-karte.js – Spielwiese: die Test-Arena (feste Karte im Code) mit Stationen und Schildern.
// Zeichen je Kästchen: '.' frei · '#' Boden/Wand · '^' Stacheln (später: Anker, Haftflächen, brechbare Wände).
// Boden-Oberkante = Reihe 18 (Füße bei y = 18 · 40). Sichtbar sind ca. 21 Reihen.

const KARTE_B = 300, KARTE_H = 21, BODEN_R = 18;
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
const fest = (c, r) => zelle(c, r) === '#';

// Stationen: von/bis = Spalten; start = Rücksetzpunkt (Füße auf Reihe r); mech = welche Mechanik die Tasten 1–4 umschalten
const STATIONEN = [
  {nr: 1, name: 'Grundlagen', von: 0, bis: 51, start: {c: 4, r: BODEN_R}, mech: 'sprung'},
  {nr: 2, name: 'Dash', von: 52, bis: 99, start: {c: 55, r: BODEN_R}, mech: 'dash'},
  {nr: 3, name: 'Haken', von: 100, bis: 149, start: {c: 103, r: BODEN_R}, mech: null},
  {nr: 4, name: 'Unterseite', von: 150, bis: 189, start: {c: 153, r: BODEN_R}, mech: null},
  {nr: 5, name: 'Durchbruch', von: 190, bis: 224, start: {c: 193, r: BODEN_R}, mech: null},
  {nr: 6, name: 'Kombi', von: 225, bis: 254, start: {c: 228, r: BODEN_R}, mech: null},
  {nr: 7, name: 'Freie Fläche', von: 255, bis: 299, start: {c: 258, r: BODEN_R}, mech: null},
];
// Schilder: Text im Bild (Spalte, Reihe der Füße des Pfostens, Zeilen)
let SCHILDER = [];

function arenaBauen(){
  karteLeer();
  SCHILDER = [];
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

  // ----- Stationen 3–6: Platzhalter, werden in Teil 2–6 gebaut -----
  const platzhalter = [[3, 101, 'Haken', 'Teil 3'], [4, 151, 'Unterseite', 'Teil 4'],
                       [5, 191, 'Durchbruch', 'Teil 5'], [6, 226, 'Kombi', 'Teil 6']];
  for(const [nr, c, n, teil] of platzhalter){
    SCHILDER.push({c, r: BODEN_R, zeilen: ['Station ' + nr + ': ' + n, 'wird in ' + teil + ' gebaut']});
    setze(c - 2, 17, c - 2, 17, '#');   // kleiner Grenzstein
  }

  // ----- Station 7: freie Spielfläche -----
  SCHILDER.push({c: 256, r: BODEN_R, zeilen: ['Station 7: Freie Fläche', 'einfach herumtoben']});
  setze(262, 14, 265, 14, '#');
  setze(268, 11, 270, 11, '#');
  setze(274, 8, 277, 8, '#');
  setze(281, 12, 283, 12, '#');
  setze(286, 8, 286, 15, '#');                       // zweiter Kamin (4 breit)
  setze(291, 4, 291, 17, '#');
  setze(291, 4, 294, 4, '#');
  setze(295, 17, 296, 17, '^');
}
arenaBauen();

function stationBei(x){
  const c = Math.floor(x / K);
  let s = STATIONEN[0];
  for(const st of STATIONEN) if(c >= st.von) s = st;
  return s;
}
