// 13-anzeige-leistung.js – Teil des Spiels "Monchichi Koop".
// Alle js/*.js-Dateien teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags,
// keine Module) und werden in index.html in fester Reihenfolge geladen.

function updateHUD(){
  document.getElementById('p1w').classList.toggle('on', !!p1.onWall);
  document.getElementById('p1g').classList.toggle('on', p1.grounded);
  document.getElementById('p1h').classList.toggle('on', p1.hookAttached);
  document.getElementById('p2w').classList.toggle('on', !!p2.onWall);
  document.getElementById('p2g').classList.toggle('on', p2.grounded);
  document.getElementById('p2s').classList.toggle('on', p2.umbrella > 0.5);
  // Münzen oben links: je Figur gesammelt / vorhanden + Balken (Affe blau, Schweinchen pink)
  const cc = document.getElementById('coinCard');
  if(coins.length){
    cc.style.display = '';
    const cnt = col => { let a = 0, b = 0; for(const c of coins) if(c.color === col){ b++; if(c.taken) a++; } return [a, b]; };
    for(const [w, col] of [['M', 'blue'], ['F', 'pink']]){
      const [a, t] = cnt(col), key = a + '/' + t, el = document.getElementById('coin' + w);
      if(el.dataset.key === key) continue;
      el.dataset.key = key; el.textContent = a;
      document.getElementById('coin' + w + 'T').textContent = '/ ' + t;
      document.getElementById('coin' + w + 'Bar').style.width = (t ? a/t*100 : 0) + '%';
      el.closest('.cc').classList.toggle('full', t > 0 && a >= t);
    }
  } else cc.style.display = 'none';
  if(typeof updateDuelHUD === 'function') updateDuelHUD();   // Duell-Tafel oben rechts (25-duell.js)
}

// ---------- Leistungs-Anzeige (Taste F ein/aus) ----------
// Trennt zwei Ursachen: Braucht UNSER Code zu lange pro Bild ("Arbeit")? Oder liefert der
// Browser/Rechner einfach zu wenig Bilder, obwohl unser Code schnell fertig ist?
const perf = {last:0, n:0, sumDt:0, maxDt:0, long:0, sumWork:0, maxWork:0, sumUpd:0, sumDraw:0, since:0, show:false};   // ausgeblendet; Taste F zeigt sie
window.addEventListener('keydown', e=>{ if(e.code==='KeyF'){ perf.show=!perf.show; document.getElementById('perf').style.display = perf.show?'':'none'; } });
function perfFrame(ts, tStart, tAfterUpdate, tEnd){
  if(perf.last){
    const dt = ts - perf.last;
    perf.n++; perf.sumDt += dt; if(dt > perf.maxDt) perf.maxDt = dt; if(dt > 25) perf.long++;
    // Takt: Bilder, die deutlich zu früh oder zu spät kommen (bei 60 Hz ideal ~16,7 ms).
    // Viele davon = ungleichmäßiges Bild, obwohl der Durchschnitt 60 FPS zeigt.
    // gleitender Mittelwert = Takt des Bildschirms (Ausreißer wie Tab-Wechsel zählen nicht mit)
    if(!perf.avgDt) perf.avgDt = 16.7;
    if(dt > 4 && dt < 40) perf.avgDt = perf.avgDt*0.9 + dt*0.1;
    if(Math.abs(dt - perf.avgDt) > 4) perf.uneven = (perf.uneven||0) + 1;
  }
  perf.last = ts;
  const work = tEnd - tStart;
  perf.sumWork += work; if(work > perf.maxWork) perf.maxWork = work;
  perf.sumUpd += tAfterUpdate - tStart; perf.sumDraw += tEnd - tAfterUpdate;
  if(!perf.since) perf.since = ts;
  if(ts - perf.since >= 1000 && perf.n > 0){
    const fps = perf.n * 1000 / (ts - perf.since);
    const avgWork = perf.sumWork / perf.n, maxWork = perf.maxWork;
    const cls = (v, good, mid) => v <= good ? 'ok' : v <= mid ? 'warn' : 'bad';
    let verdict, vcls;
    if(avgWork > 10 || maxWork > 25){ verdict = 'Spiel-Code braucht zu lange\n→ Problem bei uns, bitte melden'; vcls='bad'; }
    else if(fps < 55 || perf.long > 2 || (perf.uneven||0) > 5){ verdict = 'Code ist schnell fertig, aber der\nBrowser liefert zu wenig Bilder\n→ Rechner/Browser/Umgebung'; vcls='warn'; }
    else if(fps > 70){ verdict = 'Alles flüssig ('+Math.round(fps)+' Hz Bildschirm,\nSpiel rechnet fest mit 60/s)'; vcls='ok'; }
    else { verdict = 'Alles flüssig'; vcls='ok'; }
    if(perf.show){
      document.getElementById('perf').innerHTML =
        'Bilder/Sek.:   <span class="v '+cls(-fps,-58,-45)+'">'+fps.toFixed(0)+'</span>\n'+
        'Ruckler (>25ms): <span class="v '+cls(perf.long,0,2)+'">'+perf.long+'</span>   längstes: '+perf.maxDt.toFixed(0)+' ms\n'+
        'Takt-Aussetzer: <span class="v '+cls(perf.uneven||0,1,5)+'">'+(perf.uneven||0)+'</span> (Bilder >4 ms daneben)\n'+
        'Arbeit/Bild:  <span class="v '+cls(avgWork,5,10)+'">'+avgWork.toFixed(1)+' ms</span>  (max '+maxWork.toFixed(1)+')\n'+
        '  davon Logik '+(perf.sumUpd/perf.n).toFixed(1)+' ms, Zeichnen '+(perf.sumDraw/perf.n).toFixed(1)+' ms\n'+
        '<span class="v '+vcls+'">'+verdict+'</span>\n'+
        (typeof audioStatusText === 'function' ? audioStatusText() + '\n' : '') +
        '<span style="opacity:.6">F = Anzeige aus/an</span>';
    }
    perf.uneven=0; perf.n=0; perf.sumDt=0; perf.maxDt=0; perf.long=0; perf.sumWork=0; perf.maxWork=0; perf.sumUpd=0; perf.sumDraw=0; perf.since=ts;
  }
}
