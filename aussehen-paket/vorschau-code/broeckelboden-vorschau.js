// BRÖCKELBODEN – Erde mit hellbraunem Gras, Klumpen/Kiesel, glatte Unterkante
// Vorschau-Code (Vorschau-Seite): Aussehen/Zahlen exakt übernehmen, Anbindung ans Spiel anpassen.

function crumbTile(k,r){const x=k.x,y=k.y;g.drawImage(matTile('soil',71+Math.floor(hsh(x,y)*5)),x,y,40,40);
 if(!k.n)grasKappe(x,y,40,x,{grass:'#bfa468',gd:'#8d7242',gt:'#dccb96'},g);
 bruchRisse(g,x,y,40,40,x*3+y*7,'erde',1);g.strokeStyle='rgba(30,22,16,.4)';g.lineWidth=1.2;g.strokeRect(x+.6,y+.6,38.8,38.8)}
