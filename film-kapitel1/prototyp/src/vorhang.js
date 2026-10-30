// ===== Blätterwand: dieselbe wie im Spiel (js/24-startmenue.js, curtainLeaves), hier an die Bühne gebunden =====
function curtainLeaves() {
  let seed = 11;
  const R = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const grads = [['#04210f', '#0b3f22'], ['#0a3a20', '#17602f'], ['#11552c', '#2b8a3e'], ['#1d7a37', '#4fb053'], ['#2f8f3f', '#7ccf63']];
  let defs = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>';
  grads.forEach((g, k) => { defs += `<linearGradient id="lfg${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></linearGradient>`; });
  defs += '</defs></svg>';
  // Blattformen in einem Feld 0..300 × -60..60 (Spitze rechts)
  const slim = k => {
    let v = '';
    for (let a = 0.18; a < 0.9; a += 0.14) v += `M${300*a} 0L${300*(a+0.09)} ${-33*(1-a)}M${300*a} 0L${300*(a+0.09)} ${33*(1-a)}`;
    return `<path d="M0 0C75 -60 210 -48 300 0C210 48 75 60 0 0Z" fill="url(#lfg${k})" stroke="rgba(0,0,0,.25)" stroke-width="2"/>` +
           `<path d="M0 0L288 0${v}" stroke="rgba(0,20,8,.35)" stroke-width="2.2" fill="none"/>`;
  };
  const heart = k =>
    `<path d="M0 0C30 -66 255 -72 300 0C255 72 30 66 0 0Z" fill="url(#lfg${k})" stroke="rgba(0,0,0,.25)" stroke-width="2"/>` +
    `<path d="M105 -51L144 -12M186 -48L198 -9M114 51L150 12M192 47L204 8" stroke="rgba(3,30,14,.55)" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M0 0L285 0" stroke="rgba(0,20,8,.4)" stroke-width="3" fill="none"/>`;
  const palm = k => {
    let f = `<path d="M0 0Q150 -20 300 0" stroke="url(#lfg${k})" stroke-width="5" fill="none"/>`;
    for (let a = 0.08; a < 0.97; a += 0.06) {
      const x = 300*a, y = -20*4*a*(1-a), l = 70*Math.sin(Math.PI*Math.min(1, a*1.1));
      f += `<path d="M${x} ${y}Q${x + l*.5} ${y - l*.6} ${x + l*.9} ${y - l*.55}M${x} ${y}Q${x + l*.5} ${y + l*.6} ${x + l*.9} ${y + l*.65}" stroke="url(#lfg${k})" stroke-width="${7*(1.1-a)}" stroke-linecap="round" fill="none"/>`;
    }
    return f;
  };
  let html = defs;
  // drei Schichten: hinten große dunkle, Mitte, vorne kleinere helle Blätter – Raster mit Zufall, dicht überlappend
  const layers = [[0, 9, 6, 30], [1, 10, 7, 26], [2, 9, 6, 22], [3, 8, 5, 18], [4, 6, 4, 14]];
  for (const [k, cols, rows, size] of layers) {
    for (let a = 0; a < cols; a++) for (let b = 0; b < rows; b++) {
      const cx = (a + 0.5 + (R() - 0.5)*0.9) / cols * 112 - 6, cy = (b + 0.5 + (R() - 0.5)*0.9) / rows * 112 - 6;   // Mitte in %
      const len = size*(0.8 + R()*0.5);                     // Blattlänge in vw
      const rot = (cx < 50 ? 0 : 180) + (R() - 0.5)*140;    // grob zur Bildmitte zeigend
      const dx = cx - 50, dy = (cy - 50)*0.6, dl = Math.hypot(dx, dy) || 1;
      const fx = dx/dl*90, fy = dy/dl*70;                  // Anflug vom nächsten Rand (vw / vh)
      const delay = (1 - Math.min(1, dl/60))*0.32 + R()*0.08 + k*0.03;
      const kind = R(), shape = kind < 0.45 ? slim(k) : kind < 0.75 ? heart(k) : palm(k);
      html += `<div class="leaf" style="left:${(cx).toFixed(1)}%;top:${cy.toFixed(1)}%;width:calc(var(--sw) * ${(len/100).toFixed(3)});height:calc(var(--sw) * ${(len*0.4/100).toFixed(3)});` +
              `--fx:calc(var(--sw) * ${(fx/100).toFixed(2)});--fy:calc(var(--sh) * ${(fy/100).toFixed(2)});--r0:${(rot + (R() - 0.5)*160).toFixed(0)}deg;--r:${rot.toFixed(0)}deg;--d:${delay.toFixed(2)}s">` +
              `<svg viewBox="0 -60 300 120" preserveAspectRatio="none">${shape}</svg></div>`;
    }
  }
  return html;
}

(function(){
  const el = document.getElementById('leafCurtain');
  el.innerHTML = '<div class="cbg"></div>' + curtainLeaves() + '<div class="lt"><div><b class="lt-n">Kapitel 1</b><span class="lt-name">Die Nacht, in der der Stern fiel</span></div></div>';
})();
