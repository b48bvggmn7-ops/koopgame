# Ganze Szene Bild für Bild (24/s): Figuren, Mund, Keks, Krümel, Zettel, Decke, Stern-Licht, Wackeln + Fenster-Himmel als Bild
import asyncio, sys, json, base64, os
from playwright.async_api import async_playwright
P='/tmp/claude-0/-home-user-koopgame/f80d235d-472d-51e4-84ca-119d3eca1c23/scratchpad/prototyp'
ZIEL = sys.argv[1]; HIMMEL = sys.argv[2]; os.makedirs(HIMMEL, exist_ok=True)
INIT = '''() => { window.FILM = {dt: 1/24, sub: 4, cv: document.createElement('canvas'), hv: document.createElement('canvas')};
  FILM.cv.width = 1280; FILM.cv.height = 720; FILM.c = FILM.cv.getContext('2d'); FILM.hv.width = 960; FILM.hv.height = 540; FILM.h = FILM.hv.getContext('2d');
  FILM.len = i => { const z = DREHBUCH[i]; if(!z) return 99; return z.text ? (AUFNAHMEN[i] ? AUFNAHMEN[i].dauer : 3) + (z.luecke !== undefined ? z.luecke : .35) : (z.pause || 0) + (z.sternAbwarten ? 3 : 0); };
  FILM.ende = st.zT0 + FILM.len(st.zeile); FILM.zeilen = [[st.zeile, 0]]; FILM.b = 0; FILM.fertig = false; return 1; }'''
SCHRITT = '''(n) => { const out = []; const {dt, sub, c} = FILM;
  for(let q = 0; q < n && !FILM.fertig; q++){
    const o = {figuren: {}};
    for(const k of ['schwein', 'affe', 'prof']){ figurZeichnen(c, k, T); const f = FIG[k], a = FIG3D.ausgabe(f.art, FILM.b > 0);
      o.figuren[k] = FILM.b > 0 ? {teile: a.teile, bild: f.bild, sitz: f.sitz, hz: f.handP ? f.handP.z : 0} : Object.assign(a, {bild: f.bild, sitz: f.sitz, hz: f.handP ? f.handP.z : 0}); }
    if(st.keks && st.keksWeg){ const L = keksLage(T); o.keks = {x: L.x, y: L.y, rot: L.rot, flach: L.flach, bisse: L.bisse}; }
    o.keksWeg = st.keksWeg; o.kruemel = st.kruemel.map(k => [+k.x.toFixed(1), +k.y.toFixed(1), +k.l.toFixed(2)]);
    const Z = zettelLage(T); o.zettel = {liegt: !!Z.liegt, x: Z.x, y: Z.y, rot: Z.rot, flach: Z.flach, vor: !!Z.vor};
    const D = deckeZustand(T); o.decke = {typ: st.decke ? st.decke.typ : null, u: st.decke ? T - st.decke.t0 : 0, k: D.k || 0, ablage: !!D.ablage, ein: D.ein === undefined ? 1 : D.ein, inHand: !!D.inHand, wurf: D.wurf === undefined ? null : D.wurf,
      hand: FIG.prof.handN ? [FIG.prof.handN.x + 8, FIG.prof.handN.y - 4, FIG.prof.handN.z] : null};
    o.stern = st.stern && st.stern.a > .02 ? [st.stern.x, st.stern.y, st.stern.a] : null; o.einschlag = st.einschlag; o.nachglimmen = st.nachglimmen; o.wackeln = st.wackeln; o.t = T;
    o.zeile = st.zeile;
    // Himmel im Fenster (gemalt wie bisher, mit Sternschnuppe), Bildgröße 960x540
    const h = FILM.h; h.setTransform(1, 0, 0, 1, 0, 0); h.clearRect(0, 0, 960, 540); h.setTransform(.75, 0, 0, .75, 0, 0); fensterInhalt(h, T, st);
    o.himmel = FILM.ohneHimmel > FILM.b ? '' : FILM.hv.toDataURL('image/png');
    out.push(o); FILM.b++;
    for(let s = 0; s < sub; s++){
      T += dt/sub;
      if(T >= FILM.ende){ if(st.zeile + 1 >= DREHBUCH.length){ FILM.fertig = true; break; } zeileStarten(st.zeile + 1); FILM.zeilen.push([st.zeile, FILM.b*dt]); FILM.ende = T + FILM.len(st.zeile); }
      while(st.events.length){ const j = st.events.findIndex(e => e.t <= T); if(j < 0) break; regieAusfuehren(st.events.splice(j, 1)[0], T); }
      const z = DREHBUCH[st.zeile]; if(z && z.wer && AUFNAHMEN[st.zeile]){ const hh = AUFNAHMEN[st.zeile].huelle, tp = T - st.zT0, pg = hh[Math.floor(tp*30)] || 0; FIG[z.wer].pegel += (pg - FIG[z.wer].pegel)*.6; }
      figurenSchritt(dt/sub, T); sternSchritt(T, dt/sub);
    }
  }
  return JSON.stringify({bilder: out, fertig: FILM.fertig, zeilen: FILM.zeilen, FR: FIG3D.FR}); }'''
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--allow-file-access-from-files'])
        p = await b.new_page(viewport={'width':1312,'height':744})
        await p.goto('file://'+P+'/kapitel1_lokal.html?shot=innen&zeile=0&t=0'); await p.wait_for_function('window.fertig', timeout=180000)
        await p.evaluate(INIT); n_h = len([f for f in os.listdir(HIMMEL) if f.endswith('.png')]); await p.evaluate(f'FILM.ohneHimmel = {n_h}'); alle = []; erst = None; zeilen = None
        while True:
            r = json.loads(await p.evaluate(SCHRITT, 100))
            for o in r['bilder']:
                i = len(alle); hd = o.pop('himmel')
                if hd: open(f'{HIMMEL}/h_{i:04d}.png', 'wb').write(base64.b64decode(hd.split(',')[1]))
                if erst is None: erst = o
                alle.append(o)
            zeilen = r['zeilen']; print('bilder', len(alle), flush=True)
            json.dump({'FR': r['FR'], 'erstes': erst, 'bilder': alle, 'zeilen': zeilen}, open(ZIEL + '.teil', 'w'))
            if r['fertig'] or len(alle) > 1700: break
        json.dump({'FR': r['FR'], 'erstes': erst, 'bilder': alle, 'zeilen': zeilen}, open(ZIEL, 'w'))
        await b.close()
asyncio.run(main())
