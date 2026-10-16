// 04d-kristall.js – Spielwiese (Idee 1): Dash-Kristalle. Kästchen 'k' (nicht fest): wer ihn in der Luft berührt,
// bekommt die Luft-Dashes zurück; der Kristall verschwindet für ein paar Sekunden (Wert „Dash-Kristall“ im Panel).

let kristallPause = {};   // "c,r" -> Schritte bis er wieder da ist

function kristallDa(c, r){ return zelle(c, r) === 'k' && !(kristallPause[c + ',' + r] > 0); }
function kristallSchritt(){
  for(const k in kristallPause) if(kristallPause[k] > 0 && --kristallPause[k] === 0){
    const [c, r] = k.split(',').map(Number); staubWolke(c * K + K / 2, r * K + K / 2, 3, 0); ton('wachsen');
  }
  if(fig.tot) return;
  const mx = fig.x + FIG_B / 2, my = fig.y + FIG_H / 2;   // großzügig: Berührung im Umkreis der Raute zählt
  for(let r = Math.floor(my / K) - 1; r <= Math.floor(my / K) + 1; r++) for(let c = Math.floor(mx / K) - 1; c <= Math.floor(mx / K) + 1; c++){
    if(!kristallDa(c, r) || Math.abs(c * K + K / 2 - mx) > 28 || Math.abs(r * K + K / 2 - my) > 30) continue;
    const voll = fig.luftDashes >= luftDashMax();
    if(V.kristallNurLeer && voll) continue;
    fig.luftDashes = luftDashMax(); fig.blitz = 10;
    kristallPause[c + ',' + r] = Math.round(V.kristallZeit * 60);
    teilchenBurst(c * K + K / 2, r * K + K / 2, 14, '#7dffb0'); trefferStopp(1); ton('kristall');
  }
}
function kristallAlleZurueck(){ kristallPause = {}; }
function kristallZeichnen(c, r){
  const x = c * K + K / 2, y = r * K + K / 2 + Math.sin(performance.now() / 300 + c) * 3;
  const da = kristallDa(c, r);
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(11, 0); ctx.lineTo(0, 15); ctx.lineTo(-11, 0); ctx.closePath();
  if(da){
    ctx.fillStyle = '#5fe39a'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#1f6b45'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.moveTo(-3, -9); ctx.lineTo(3, -4); ctx.lineTo(-3, 2); ctx.fill();
  } else { ctx.setLineDash([3, 4]); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(31,107,69,0.5)'; ctx.stroke(); ctx.setLineDash([]); }
  ctx.restore();
}
