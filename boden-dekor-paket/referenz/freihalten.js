// Freihalte-Zone (Vorschau): Punkte aller Spielobjekte, Abstandsprüfung links/rechts m px, senkrecht 90 px.
// In der Vorschau: Objekt-Listen LV.spikes/switches/doors (linke obere Ecke einer 40-px-Zelle -> +20), cps/bounce/hooks/goal (Mitte).
// Im Spiel bitte dieselben Objekte aus den Spiel-Listen nehmen (coins nicht nötig, die hat dekoSperre schon).
function SPN(x,y,m){if(!SPN.L){const L=[];const A=(a,dx)=>(a||[]).forEach(o=>L.push([o[0]+dx,o[1]]));A(LV.spikes,20);A(LV.switches,20);A(LV.doors,20);A(LV.cps,0);A(LV.bounce,0);A(LV.hooks,0);if(LV.goal)L.push([LV.goal[0],LV.goal[1]]);SPN.L=L}return SPN.L.some(p=>Math.abs(p[0]-x)<(m||60)&&Math.abs(p[1]+20-y)<90)}
// Benutzt an: Pflanzen/Gras/Blumen (underSp), Tier-Platz (boxFree), Tier-Versetzen (bad), Leuchtpflanzen nachts (cov).
