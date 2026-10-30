# Szene Bild für Bild (24/s) für Blender ausgeben: Figuren-Haltungen, Mund nach der Stimme, Keks, Krümel
import asyncio, sys, json
from playwright.async_api import async_playwright
P='/tmp/claude-0/-home-user-koopgame/f80d235d-472d-51e4-84ca-119d3eca1c23/scratchpad/prototyp'
start_q, n_bilder, ziel = sys.argv[1], int(sys.argv[2]), sys.argv[3]
JS = '''(n) => { const cv = document.createElement('canvas'); cv.width = 1280; cv.height = 720; const c = cv.getContext('2d');
  const dt = 1/24, sub = 4, len = i => { const z = DREHBUCH[i]; return z.text ? (AUFNAHMEN[i] ? AUFNAHMEN[i].dauer : 3) + (z.luecke !== undefined ? z.luecke : .35) : (z.pause || 0) + (z.sternAbwarten ? 3 : 0); };
  let ende = st.zT0 + len(st.zeile); const bilder = [], zeilen = [[st.zeile, 0]];
  const ausg = erst => { const o = {figuren: {}};
    for(const k of ['schwein', 'affe', 'prof']){ figurZeichnen(c, k, T); const f = FIG[k], a = FIG3D.ausgabe(f.art, !erst);
      o.figuren[k] = erst ? Object.assign(a, {bild: f.bild, sitz: f.sitz}) : {teile: a.teile, bild: f.bild, sitz: f.sitz, hz: f.handP ? f.handP.z : 0}; }
    if(st.keks && st.keksWeg){ const L = keksLage(T); o.keks = {x: L.x, y: L.y, rot: L.rot, flach: L.flach, bisse: L.bisse, hz: FIG.affe.handP ? FIG.affe.handP.z : 0}; }
    o.keksWeg = st.keksWeg; o.kruemel = st.kruemel.map(k => [+k.x.toFixed(1), +k.y.toFixed(1), +k.l.toFixed(2)]);
    const Z = zettelLage(T); o.zettel = {liegt: !!Z.liegt, x: Z.x, y: Z.y, rot: Z.rot, flach: Z.flach};
    return o; };
  const erstes = ausg(true);
  for(let b = 0; b < n; b++){
    for(let s = 0; s < sub; s++){
      T += dt/sub;
      if(T >= ende){ zeileStarten(st.zeile + 1); zeilen.push([st.zeile, b*dt]); ende = T + len(st.zeile); }
      while(st.events.length){ const j = st.events.findIndex(e => e.t <= T); if(j < 0) break; regieAusfuehren(st.events.splice(j, 1)[0], T); }
      const z = DREHBUCH[st.zeile]; if(z && z.wer && AUFNAHMEN[st.zeile]){ const h = AUFNAHMEN[st.zeile].huelle, tp = T - st.zT0, pg = h[Math.floor(tp*30)] || 0; FIG[z.wer].pegel += (pg - FIG[z.wer].pegel)*.6; }
      figurenSchritt(dt/sub, T); sternSchritt(T, dt/sub);
    }
    bilder.push(ausg(false));
  }
  return JSON.stringify({FR: FIG3D.FR, erstes, bilder, zeilen}); }'''
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--allow-file-access-from-files'])
        p = await b.new_page(viewport={'width':1312,'height':744})
        await p.goto('file://'+P+'/kapitel1_lokal.html?'+start_q); await p.wait_for_function('window.fertig', timeout=180000)
        open(ziel, 'w').write(await p.evaluate(JS, n_bilder)); await b.close()
asyncio.run(main())
