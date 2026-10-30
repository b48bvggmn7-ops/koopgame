# Blätter-Vorhang (wie im Spiel) Bild für Bild mit durchsichtigem Hintergrund: schließt sich, dann Tafel „Level 1“
import asyncio, sys, os
from playwright.async_api import async_playwright
P = os.path.dirname(os.path.abspath(__file__)); ZIEL = sys.argv[1]; N = int(sys.argv[2]) if len(sys.argv) > 2 else 84; os.makedirs(ZIEL, exist_ok=True)
seite = open(P + '/src/seite.html').read(); css = seite[seite.index('#leafCurtain{'):seite.index('#hinweisStart')]
js = open(P + '/src/vorhang.js').read()
html = f'''<!doctype html><html><head><meta charset="utf-8"><style>:root{{--laub:#062814}} html,body{{margin:0;background:transparent}}
#stage{{position:relative;width:1280px;height:720px;--sw:1280px;--sh:720px;overflow:hidden}} {css}
#leafCurtain.title .lt{{transition-delay:1.15s}}</style></head><body><div id="stage"><div id="leafCurtain"></div></div>
<script>{js}
const el = document.getElementById('leafCurtain'); el.querySelector('.lt-n').textContent = 'Level 1'; el.querySelector('.lt-name').textContent = 'Dschungel bei Nacht';
</script></body></html>'''
open(ZIEL + '/vorhang.html', 'w').write(html)
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        p = await b.new_page(viewport={'width': 1280, 'height': 720})
        await p.goto('file://' + ZIEL + '/vorhang.html'); await p.wait_for_timeout(500)
        await p.evaluate("() => { const el = document.getElementById('leafCurtain'); el.classList.add('on'); el.getBoundingClientRect(); el.classList.add('closed', 'title'); }")
        await p.evaluate("() => document.getAnimations().forEach(a => a.pause())")
        for f in range(N):
            await p.evaluate(f"() => document.getAnimations().forEach(a => a.currentTime = {f*1000/24})")
            await p.locator('#stage').screenshot(path=f'{ZIEL}/v_{f:04d}.png', omit_background=True)
        await b.close()
asyncio.run(main())
print('vorhang', N)
