# Vorspann: Häuschen außen + Zoom aufs Fenster + Iris, 24 Bilder/s als PNG
import asyncio, sys, base64, os
from playwright.async_api import async_playwright
P = os.path.dirname(os.path.abspath(__file__)); ZIEL = sys.argv[1]; os.makedirs(ZIEL, exist_ok=True)
JS = '''(k) => { const tt = k/24; T = 100 + tt;
  if(tt < PHASEN.aussen){ st.phase = 'aussen'; st.t0 = st.start = 100; } else { st.phase = 'iris'; st.t0 = 100 + PHASEN.aussen; st.start = 100; }
  bild(); return document.getElementById('buehne').toDataURL('image/png'); }'''
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--allow-file-access-from-files'])
        p = await b.new_page(viewport={'width':1312,'height':744})
        await p.goto('file://'+P+'/kapitel1_lokal.html?shot=aussen&t=0'); await p.wait_for_function('window.fertig', timeout=180000)
        import base64 as b6; bild0 = 'data:image/png;base64,' + b6.b64encode(open(sys.argv[2], 'rb').read()).decode()
        await p.evaluate('''(u) => new Promise(ok => { const im = new Image(); im.onload = () => { window.__ZIMMER = im; ok(1); }; im.src = u; })''', bild0)
        await p.evaluate('''() => { window.zimmerMalen = (c, b) => { c.setTransform(b.a, 0, 0, b.d, b.e, b.f); c.drawImage(__ZIMMER, 0, 0, W, H); }; }''')
        n = int(round((await p.evaluate('PHASEN.aussen + PHASEN.iris'))*24))
        print('groesse', await p.evaluate("[document.getElementById('buehne').width, document.getElementById('buehne').height]"))
        for k in range(n + 1):
            d = await p.evaluate(JS, k); open(f'{ZIEL}/v_{k:04d}.png', 'wb').write(base64.b64decode(d.split(',')[1]))
        print('vorspann', n + 1); await b.close()
asyncio.run(main())
