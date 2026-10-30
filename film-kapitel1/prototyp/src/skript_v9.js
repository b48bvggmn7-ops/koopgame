// ===== Das Drehbuch der Szene (hier lassen sich alle Sätze ändern) =====
// wer: prof | affe | schwein   text: der Satz   geste: wie die Figur dabei spielt   leise: flüstert   pause: Sekunden Stille
// luecke: Sekunden bis zum nächsten Satz (Standard 0,35 – kleiner = fällt ins Wort)
// aktion: stern = die Sternschnuppe saust am Fenster vorbei, dreht eine Schleife und stürzt (RUMMS) in den Wald
// regie: was nebenbei passiert (verz = Sekunden nach Beginn der Zeile): geh = laufe zu x, setzen / aufstehen,
//        decke = Decke nehmen und über die Beine legen / wegwerfen, zettel = Zettel nehmen / ablegen
// reaktion: wie die Zuhörer reagieren ({affe: 'lachen'} …, ab 0,5 s nach Zeilenbeginn; gleiche Gesten wie oben)
const NAMEN = {prof: 'Professor', affe: 'Affe', schwein: 'Schweinchen'};
const DREHBUCH = [
  {pause: 1.6},
  {wer: 'prof', text: 'So, ihr zwei. Heute Nacht kommt die Sternschnuppe des Jahrhunderts.', geste: 'fernrohr_weg'},
  {wer: 'prof', text: 'Und wer sie sieht, darf sich etwas wünschen.', geste: 'finger', luecke: .2,
   regie: []},
  {wer: 'schwein', text: 'Ich hab meinen Wunsch schon aufgeschrieben.', geste: 'zettel_stolz', luecke: .25, reaktion: {affe: 'neugierig', prof: 'fernrohr'}},
  {wer: 'schwein', text: 'In drei Versionen.', geste: 'kichern', luecke: .2, reaktion: {affe: 'augenrollen', prof: 'schmunzeln'}},
  {wer: 'affe', text: 'Und ich wünsch mir, dass ich mal irgendwohin komme, wo NOCH NIEMAND war!', geste: 'jubeln', luecke: .15, reaktion: {schwein: 'staunen', prof: 'schmunzeln'}},
  {wer: 'affe', text: 'Nicht mal du, Papa.', geste: 'frech', luecke: .3, reaktion: {prof: 'lachen', schwein: 'kichern'}},
  {wer: 'prof', text: 'Hm-hm. Das ist ein großer Wunsch für so einen kleinen Affen.', geste: 'lachen', luecke: .6,
   regie: [{verz: 1.0, wer: 'affe', aufstehen: true}, {verz: 1.5, wer: 'affe', geh: 640}]},
  {wer: 'schwein', text: 'Und ich wünsch mir … dass ich mich mal was trau. So richtig.', geste: 'schuechtern', leise: true, luecke: .1,
   regie: [{verz: .2, wer: 'affe', geh: 700}, {verz: 2.2, wer: 'affe', geh: 575}], reaktion: {prof: 'nicken'}},
  {wer: 'affe', text: 'Du traust dich doch was!', geste: 'aufmuntern', luecke: .2, reaktion: {schwein: 'schuechtern', prof: 'nicken'}},
  {wer: 'schwein', text: 'Ich hab gestern zwanzig Minuten gebraucht, um ins Wasser zu gehen.', geste: 'schuechtern', luecke: .9,
   regie: [{verz: 1.9, wer: 'affe', geh: 432}, {verz: 3.35, wer: 'affe', setzen: true}], reaktion: {prof: 'schmunzeln'}},
  {wer: 'affe', text: '… Es war kalt.', geste: 'frech', luecke: .5, reaktion: {schwein: 'empoert', prof: 'lachen'}},
  {aktion: 'stern', pause: .3, regie: []},
  {wer: 'prof', text: 'Da! Da ist sie!', geste: 'zeigen', luecke: 0},
  {pause: .9, sternAbwarten: true},
  {wer: 'prof', text: '… Das war keine normale Sternschnuppe.', geste: 'staunen', luecke: .25, reaktion: {affe: 'staunen', schwein: 'staunen'}},
  {wer: 'affe', text: 'Wir holen sie!', geste: 'jubeln', luecke: .45, reaktion: {schwein: 'nicken'}},
  {wer: 'prof', text: 'Morgen früh. Bei Tageslicht. Und jetzt: ab ins Bett, ihr zwei.', geste: 'finger', luecke: .8, reaktion: {affe: 'enttaeuscht', schwein: 'gaehnen'}},
  {wer: 'schwein', text: '… Gute Nacht, Sternschnuppe.', geste: 'fenster', leise: true},
  // Ins Bett, Licht aus – und dann schleichen sich die beiden heimlich raus
  {pause: 4.4, regie: [{verz: .3, wer: 'schwein', geh: -230}, {verz: .55, wer: 'affe', geh: -230}, {verz: .9, wer: 'prof', geh: 1335}, {verz: 2.95, licht: 0}, {verz: 3.2, wer: 'prof', geh: 1500}]},
  // dunkles Zimmer, die beiden flüstern aus dem Off (sie liegen links im Bett) …
  {pause: 1.3},
  {wer: 'affe', text: 'Psst! Schweinchen … bist du noch wach? Komm, lass uns los. Ich halt\'s nicht mehr aus – wir müssen die Ersten sein!', geste: 'fluestern', leise: true, luecke: .35},
  {wer: 'schwein', text: 'Aber … eigentlich dürfen wir das nicht.', geste: 'fluestern', leise: true, luecke: .35},
  {wer: 'affe', text: 'Du wolltest dich doch mal was trauen. So richtig. Jetzt ist die Gelegenheit!', geste: 'fluestern', leise: true, luecke: .4},
  {wer: 'schwein', text: '… Na gut. Aber ganz leise.', geste: 'fluestern', leise: true, luecke: .3},
  // … dann auf Zehenspitzen quer durchs Zimmer und rechts hinaus (hintereinander, mit Abstand)
  {pause: 1.0, regie: [{verz: 0, wer: 'affe', geh: 1480, schleichen: true, tempo: 220}, {verz: 0, ton: 'schritte'}, {verz: 1.4, wer: 'schwein', geh: 1480, schleichen: true, tempo: 220}]},
  {wer: 'affe', text: 'Psst! Wir müssen ganz leise sein …', geste: 'fluestern', leise: true, luecke: .2},
  {pause: 6.2},
  {pause: .4},
];
