# Figuren einer Szene-Stelle (shot=innen&zeile=..&t=..) komplett für Blender ausgeben
import asyncio, sys, json
from playwright.async_api import async_playwright
P='/tmp/claude-0/-home-user-koopgame/f80d235d-472d-51e4-84ca-119d3eca1c23/scratchpad/prototyp'
JS = '''(() => { const cv = document.createElement('canvas'); cv.width = 1280; cv.height = 720; const c = cv.getContext('2d'); const out = {FR: FIG3D.FR, figuren: {}};
  for(const k of ['schwein', 'affe', 'prof']){ figurZeichnen(c, k, T); const f = FIG[k]; out.figuren[k] = Object.assign(FIG3D.ausgabe(f.art), {bild: f.bild, sitz: f.sitz, x: f.x}); }
  return JSON.stringify(out); })()'''
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--allow-file-access-from-files'])
        p = await b.new_page(viewport={'width':1312,'height':744})
        await p.goto('file://'+P+'/kapitel1_lokal.html?'+sys.argv[1]); await p.wait_for_function('window.fertig', timeout=180000)
        open(sys.argv[2], 'w').write(await p.evaluate(JS)); await b.close()
asyncio.run(main())
