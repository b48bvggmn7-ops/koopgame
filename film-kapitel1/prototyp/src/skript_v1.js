// ===== Das Drehbuch der Szene (hier lassen sich alle Sätze ändern) =====
// wer: prof | affe | schwein   text: der Satz   geste: wie die Figur dabei spielt   leise: flüstert   pause: Sekunden Stille
// luecke: Sekunden bis zum nächsten Satz (Standard 0,35 – kleiner = fällt ins Wort)
// aktion: stern = die Sternschnuppe saust am Fenster vorbei, dreht eine Schleife und stürzt (RUMMS) in den Wald
// regie: was nebenbei passiert (verz = Sekunden nach Beginn der Zeile): geh = laufe zu x, setzen / aufstehen,
//        decke = Decke nehmen und über die Beine legen / wegwerfen, keks = Keks nehmen (und aufessen), zettel = Zettel nehmen / ablegen
const NAMEN = {prof: 'Professor', affe: 'Affe', schwein: 'Schweinchen'};
const DREHBUCH = [
  {pause: 1.6},
  {wer: 'prof', text: 'So, ihr zwei. Heute Nacht kommt die Sternschnuppe des Jahrhunderts.', geste: 'fernrohr_weg'},
  {wer: 'prof', text: 'Und wer sie sieht, darf sich etwas wünschen.', geste: 'finger', luecke: .2,
   regie: [{verz: 1.4, wer: 'prof', geh: 1158}, {verz: 2.2, wer: 'prof', setzen: true}, {verz: 4.7, wer: 'prof', decke: true}]},
  {wer: 'schwein', text: 'Ich hab meinen Wunsch schon aufgeschrieben.', geste: 'zettel', luecke: .25, regie: [{verz: 0, zettel: 'nehmen'}]},
  {wer: 'schwein', text: 'In drei Versionen.', geste: 'zettel_stolz', luecke: .2, regie: [{verz: 1.3, zettel: 'ablegen'}]},
  {wer: 'affe', text: 'Und ich wünsch mir, dass ich mal irgendwohin komme, wo NOCH NIEMAND war!', geste: 'jubeln', luecke: .15},
  {wer: 'affe', text: 'Nicht mal du, Papa.', geste: 'frech', luecke: .3},
  {wer: 'prof', text: 'Hm-hm. Das ist ein großer Wunsch für so einen kleinen Affen.', geste: 'lachen', luecke: .6,
   regie: [{verz: 1.0, wer: 'affe', aufstehen: true}, {verz: 1.5, wer: 'affe', geh: 640}]},
  {wer: 'schwein', text: 'Und ich wünsch mir … dass ich mich mal was trau. So richtig.', geste: 'schuechtern', leise: true, luecke: .1,
   regie: [{verz: .3, keks: 'nehmen'}]},
  {wer: 'affe', text: 'Du traust dich doch was!', geste: 'mampfen', luecke: .2},
  {wer: 'schwein', text: 'Ich hab gestern zwanzig Minuten gebraucht, um ins Wasser zu gehen.', geste: 'schuechtern', luecke: .9,
   regie: [{verz: 1.9, wer: 'affe', geh: 432}, {verz: 3.35, wer: 'affe', setzen: true}]},
  {wer: 'affe', text: '… Es war kalt.', geste: 'frech', luecke: .5},
  {aktion: 'stern', pause: 1.7, regie: [{verz: .5, wer: 'prof', decke: false}, {verz: .6, wer: 'prof', aufstehen: true}]},
  {wer: 'prof', text: 'Da! Da ist sie!', geste: 'zeigen', luecke: 0},
  {pause: .9, sternAbwarten: true},
  {wer: 'prof', text: '… Das war keine normale Sternschnuppe.', geste: 'staunen', luecke: .25},
  {wer: 'affe', text: 'Wir holen sie!', geste: 'jubeln', luecke: .45},
  {wer: 'prof', text: 'Morgen früh. Bei Tageslicht. Und jetzt: ab ins Bett, ihr zwei.', geste: 'finger', luecke: .8},
  {wer: 'schwein', text: '… Gute Nacht, Sternschnuppe.', geste: 'fenster', leise: true},
  {pause: 1.6},
];
