// editor/js/03-zeichnen.js – Teil des Level-Editors für "Monchichi Koop".
// Alle editor/js/*.js teilen sich einen gemeinsamen Gültigkeitsbereich (klassische <script>-Tags, kein Build)
// und werden in editor/index.html in fester Reihenfolge geladen.
// Zeichnen der Editor-Fläche (jedes Bild neu).

function draw(){
  ctx.clearRect(0,0,cvs.width,cvs.height);
  ctx.fillStyle = THEME_BG[theme] || THEME_BG.dschungel; ctx.fillRect(0, 0, cvs.width, cvs.height);
  ctx.save(); ctx.translate(0, SKY*TILE);   // ab hier: Reihe 0 bei y = 0, Himmel-Reihen negativ
  // Grid
  ctx.lineWidth = 1; ctx.strokeStyle = '#25323f';
  for(let c=0;c<=COLS;c++){ ctx.beginPath(); ctx.moveTo(c*TILE,-SKY*TILE); ctx.lineTo(c*TILE,ROWS*TILE); ctx.stroke(); }
  for(let r=-SKY;r<=ROWS;r++){ ctx.beginPath(); ctx.moveTo(0,r*TILE); ctx.lineTo(COLS*TILE,r*TILE); ctx.stroke(); }
  // stärkere Linie alle 5 Kästchen
  ctx.strokeStyle = '#33465a';
  for(let c=0;c<=COLS;c+=5){ ctx.beginPath(); ctx.moveTo(c*TILE,-SKY*TILE); ctx.lineTo(c*TILE,ROWS*TILE); ctx.stroke(); }
  for(let r=0;r<=ROWS;r+=5){ ctx.beginPath(); ctx.moveTo(0,r*TILE); ctx.lineTo(COLS*TILE,r*TILE); ctx.stroke(); }

  for(const key in tiles){
    const [c,r] = key.split(',').map(Number), t = tiles[key];
    ctx.fillStyle = COLORS[t];
    ctx.fillRect(c*TILE+1, r*TILE+1, TILE-2, TILE-2);
    if(t === 'fake'){   // Scheinwand: gestrichelter Rand + „?“
      ctx.save(); ctx.setLineDash([4,3]); ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 1.5;
      ctx.strokeRect(c*TILE+3, r*TILE+3, TILE-6, TILE-6); ctx.restore();
      ctx.fillStyle = 'rgba(255,224,102,.8)'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', c*TILE+TILE/2, r*TILE+TILE/2+1);
    } else if(t === 'wind'){   // Aufwind: Pfeil nach oben
      ctx.strokeStyle = 'rgba(200,240,255,.75)'; ctx.lineWidth = 2;
      const X = c*TILE+TILE/2, Y = r*TILE;
      ctx.beginPath(); ctx.moveTo(X, Y+TILE-8); ctx.lineTo(X, Y+8); ctx.moveTo(X-6, Y+14); ctx.lineTo(X, Y+8); ctx.lineTo(X+6, Y+14); ctx.stroke();
    }
  }
  for(const cp of checkpoints){
    const X=cp.c*TILE, Y=cp.r*TILE;
    ctx.fillStyle='#d9d2c5'; ctx.fillRect(X+TILE*0.3, Y+4, 3, TILE-4);
    ctx.fillStyle='#ff7a59'; ctx.beginPath(); ctx.moveTo(X+TILE*0.3+3, Y+5); ctx.lineTo(X+TILE*0.85, Y+12); ctx.lineTo(X+TILE*0.3+3, Y+19); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,122,89,.18)'; ctx.fillRect(X+1, Y+1, TILE-2, TILE-2);
  }
  { const el=document.getElementById('cpCount'); if(el) el.textContent = checkpoints.length + ' gesetzt'; }
  const COIN_COL = {gold:['#e0a100','#ffd24a','#fff3b0'], blue:['#1c6fd1','#4dabf7','#d0ebff'], pink:['#d6336c','#f783ac','#ffe3ef']};
  for(const co of coins){
    const X=co.c*TILE+TILE/2, Y=co.r*TILE+TILE/2, col = COIN_COL[co.color||'gold'];
    ctx.fillStyle=col[0]; ctx.beginPath(); ctx.arc(X,Y,TILE*0.3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=col[1]; ctx.beginPath(); ctx.arc(X,Y,TILE*0.23,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=col[2]; ctx.fillRect(X-2, Y-TILE*0.13, 4, TILE*0.26);
  }
  { const el=document.getElementById('coinCount');
    const nB = coins.filter(c=>c.color==='blue').length, nP = coins.filter(c=>c.color==='pink').length;
    const nG = coins.length - nB - nP, n = coins.length;
    if(el){ el.textContent = n + ' gesetzt' + (n>0 && n<10 ? ' (Ziel braucht dann alle '+n+')' : ''); }
    const bal = document.getElementById('coinBalance');
    if(bal){
      const key = nB+'|'+nP+'|'+nG;
      if(bal.dataset.key !== key){            // nur bei Änderung neu schreiben
        bal.dataset.key = key;
        bal.textContent = '';
        const line1 = document.createElement('div');
        line1.textContent = `🔵 Blau (Affe): ${nB}   🩷 Pink (Schweinchen): ${nP}   🟡 Gold: ${nG}`;
        const line2 = document.createElement('div'); line2.style.fontWeight = '700';
        if(nB === nP){ line2.textContent = nB ? '✓ Blau und Pink sind ausgeglichen' : 'Noch keine blauen/pinken Münzen'; line2.style.color = nB ? '#63e6be' : 'var(--sub)'; }
        else { const d = Math.abs(nB-nP); line2.textContent = `⚠ ${d} ${nB>nP ? 'Blau' : 'Pink'} mehr – nicht ausgeglichen`; line2.style.color = '#ffa94d'; }
        bal.append(line1, line2);
      }
    }
  }
  for(const sp of spikes){
    ctx.save();
    ctx.translate(sp.c*TILE+TILE/2, sp.r*TILE+TILE/2);
    ctx.rotate((sp.dir||0)*Math.PI/2);
    ctx.fillStyle='#b23a3a';
    for(const off of [-0.3,0,0.3]){
      ctx.beginPath(); ctx.moveTo(TILE*(off-0.15),TILE/2-3); ctx.lineTo(TILE*off,-TILE/2+6); ctx.lineTo(TILE*(off+0.15),TILE/2-3); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  for(const h of hooks){
    const rad=(h.radius||6.5)*TILE, hx=h.c*TILE+TILE/2, hy=h.r*TILE+TILE/2;
    ctx.save(); ctx.setLineDash([5,5]); ctx.strokeStyle='rgba(255,209,102,0.45)'; ctx.lineWidth=1.5;
    ctx.fillStyle='rgba(255,209,102,0.05)';
    ctx.beginPath(); ctx.arc(hx,hy,rad,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.fillStyle='rgba(255,209,102,0.9)'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText((h.radius||6.5)+' K', hx, hy+TILE*0.34);
    ctx.fillStyle='#ffd166';
    ctx.beginPath(); ctx.arc(h.c*TILE+TILE/2, h.r*TILE+TILE/2, TILE*0.3, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle='#8a6a1a'; ctx.lineWidth=2; ctx.stroke();
  }
  for(const s of switches) drawLinked(s, '#ff9f43', '#8a4f14');
  for(const d of doors) drawLinked(d, '#9b59b6', '#5a2d69');
  for(const p of plates){   // Druckplatte: flache Platte unten im Kästchen mit Nummer
    const X = p.c*TILE, Y = p.r*TILE;
    ctx.fillStyle = '#c9a227'; ctx.fillRect(X+4, Y+TILE-12, TILE-8, 10);
    ctx.strokeStyle = '#6b5410'; ctx.lineWidth = 2; ctx.strokeRect(X+4, Y+TILE-12, TILE-8, 10);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(p.link), X+TILE/2, Y+TILE/2-6);
  }
  for(const b of bouncers){   // Sprungpilz
    const X = b.c*TILE+TILE/2, Y = b.r*TILE+TILE;
    ctx.fillStyle = '#f3e7d3'; ctx.fillRect(X-4, Y-12, 8, 12);
    ctx.fillStyle = '#4fbf5a'; ctx.beginPath(); ctx.ellipse(X, Y-12, 16, 11, 0, Math.PI, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#eaffd0'; ctx.beginPath(); ctx.arc(X-6, Y-16, 2.5, 0, Math.PI*2); ctx.arc(X+5, Y-18, 2, 0, Math.PI*2); ctx.fill();
  }
  if(startM) drawMarker(startM,'#3a7bd5','♂');
  if(startF) drawMarker(startF,'#e0669e','♀');
  if(goal) drawMarker(goal,'#5fc98f','⚑');

  // Bewegte Stücke: Umriss, Geister-Ziel, Pfeil
  const groups = moverGroups();
  if(moveDrag){
    const g = groupAt(moveDrag.c, moveDrag.r);
    if(g){
      const ex = groups.findIndex(x=>x.g.keys.has(moveDrag.c+','+moveDrag.r));
      if(ex>=0) groups.splice(ex,1);
      groups.push({mv:{c:moveDrag.c,r:moveDrag.r,dc:moveDrag.tc-moveDrag.c,dr:moveDrag.tr-moveDrag.r,speed:Number(speedSelect.value), link:curMoveLink()}, g, preview:true});
    }
  }
  for(const {mv,g} of groups){
    // Geist am Zielpunkt
    ctx.globalAlpha = 0.28;
    for(const [x,y] of g.cells){ ctx.fillStyle=COLORS[g.type]; ctx.fillRect((x+mv.dc)*TILE+1,(y+mv.dr)*TILE+1,TILE-2,TILE-2); }
    ctx.globalAlpha = 1;
    // Umriss am Start (gestrichelt)
    ctx.save(); ctx.setLineDash([6,4]); ctx.strokeStyle='#4fc3f7'; ctx.lineWidth=2;
    for(const [x,y] of g.cells){
      const k=(a,b)=>g.keys.has(a+','+b);
      const X=x*TILE, Y=y*TILE;
      ctx.beginPath();
      if(!k(x,y-1)){ ctx.moveTo(X,Y); ctx.lineTo(X+TILE,Y); }
      if(!k(x,y+1)){ ctx.moveTo(X,Y+TILE); ctx.lineTo(X+TILE,Y+TILE); }
      if(!k(x-1,y)){ ctx.moveTo(X,Y); ctx.lineTo(X,Y+TILE); }
      if(!k(x+1,y)){ ctx.moveTo(X+TILE,Y); ctx.lineTo(X+TILE,Y+TILE); }
      ctx.stroke();
    }
    ctx.restore();
    drawMoveArrow(mv);
  }

  // Bewegte Haken: Geister-Haken am Ziel + Pfeil
  const hookMoves = hooks.filter(h=>h.move).map(h=>({h, mv:{c:h.c, r:h.r, ...h.move}}));
  if(moveDrag && moveDrag.hook){
    const i = hookMoves.findIndex(x=>x.h===moveDrag.hook); if(i>=0) hookMoves.splice(i,1);
    hookMoves.push({h:moveDrag.hook, mv:{c:moveDrag.c, r:moveDrag.r, dc:moveDrag.tc-moveDrag.c, dr:moveDrag.tr-moveDrag.r,
      speed:Number(speedSelect.value), link:curMoveLink()}});
  }
  for(const {h, mv} of hookMoves){
    const gx=(mv.c+mv.dc)*TILE+TILE/2, gy=(mv.r+mv.dr)*TILE+TILE/2;
    ctx.globalAlpha=0.35; ctx.fillStyle='#ffd166';
    ctx.beginPath(); ctx.arc(gx,gy,TILE*0.28,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
    ctx.save(); ctx.setLineDash([4,4]); ctx.strokeStyle='#4fc3f7'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(h.c*TILE+TILE/2, h.r*TILE+TILE/2, TILE*0.42, 0, Math.PI*2); ctx.stroke(); ctx.restore();
    if(mv.dc!==0 || mv.dr!==0) drawMoveArrow(mv);
  }

  // ausgewählte Bewegung gelb hervorheben (verschwindet, wenn das Stück inzwischen gelöscht wurde)
  if(selMove){
    if(selMove.hook ? !(hooks.includes(selMove.hook) && selMove.hook.move) : !moverGroups().some(x=>x.mv===selMove.mv)) selectMove(null);
  }
  if(selMove){
    ctx.save(); ctx.strokeStyle='#ffd23f'; ctx.lineWidth=3; ctx.shadowColor='rgba(255,210,63,.8)'; ctx.shadowBlur=8;
    if(selMove.hook){
      const h = selMove.hook; ctx.beginPath(); ctx.arc(h.c*TILE+TILE/2, h.r*TILE+TILE/2, TILE*0.5, 0, Math.PI*2); ctx.stroke();
    } else {
      const x = moverGroups().find(x=>x.mv===selMove.mv);
      if(x) for(const [cx,cy] of x.g.cells){
        const k=(a,b)=>x.g.keys.has(a+','+b), X=cx*TILE, Y=cy*TILE;
        ctx.beginPath();
        if(!k(cx,cy-1)){ ctx.moveTo(X,Y); ctx.lineTo(X+TILE,Y); }
        if(!k(cx,cy+1)){ ctx.moveTo(X,Y+TILE); ctx.lineTo(X+TILE,Y+TILE); }
        if(!k(cx-1,cy)){ ctx.moveTo(X,Y); ctx.lineTo(X,Y+TILE); }
        if(!k(cx+1,cy)){ ctx.moveTo(X+TILE,Y); ctx.lineTo(X+TILE,Y+TILE); }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawMoveArrow(mv){
    if(mv.dc===0 && mv.dr===0) return;
    // Pfeil vom Anker zum Ziel
    const x1=mv.c*TILE+TILE/2, y1=mv.r*TILE+TILE/2, x2=(mv.c+mv.dc)*TILE+TILE/2, y2=(mv.r+mv.dr)*TILE+TILE/2;
    const ang=Math.atan2(y2-y1,x2-x1);
    ctx.strokeStyle='#4fc3f7'; ctx.fillStyle='#4fc3f7'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2-Math.cos(ang)*10,y2-Math.sin(ang)*10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2,y2);
    ctx.lineTo(x2-Math.cos(ang-0.45)*16, y2-Math.sin(ang-0.45)*16);
    ctx.lineTo(x2-Math.cos(ang+0.45)*16, y2-Math.sin(ang+0.45)*16); ctx.closePath(); ctx.fill();
    // Rück-Pfeilspitze am Start (hin und zurück)
    ctx.beginPath(); ctx.moveTo(x1,y1);
    ctx.lineTo(x1+Math.cos(ang-0.45)*14, y1+Math.sin(ang-0.45)*14);
    ctx.lineTo(x1+Math.cos(ang+0.45)*14, y1+Math.sin(ang+0.45)*14); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x1,y1,5,0,Math.PI*2); ctx.fill();
    const lbl = mv.speed>=4.5?'schnell':mv.speed>=3?'mittel':'langsam';
    ctx.font='bold 11px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
    let txt = '⇄ '+lbl;
    if(mv.link){
      const hasSw = switches.some(sw=>sw.link===mv.link);
      txt += hasSw ? ` · Schalter ${mv.link}` : ` · Schalter ${mv.link} fehlt → fährt immer`;
    }
    ctx.fillStyle = (mv.link && !switches.some(sw=>sw.link===mv.link)) ? '#ffb3a7' : '#e6f7ff';
    ctx.fillText(txt, (x1+x2)/2, (y1+y2)/2-6);
      }

  function drawMarker(p,color,label){
    ctx.fillStyle=color;
    ctx.beginPath(); ctx.arc(p.c*TILE+TILE/2, p.r*TILE+TILE/2, TILE*0.38, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(label, p.c*TILE+TILE/2, p.r*TILE+TILE/2+1);
  }
  function drawLinked(p, color, dark){
    const cx=p.c*TILE+TILE/2, cy=p.r*TILE+TILE/2;
    ctx.fillStyle=color;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx-TILE*0.36,cy-TILE*0.36,TILE*0.72,TILE*0.72,5) : ctx.rect(cx-TILE*0.36,cy-TILE*0.36,TILE*0.72,TILE*0.72);
    ctx.fill();
    ctx.strokeStyle=dark; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(String(p.link), cx, cy+1);
  }

  ctx.restore();   // Verschiebung um die Himmel-Reihen
  requestAnimationFrame(draw);
}
