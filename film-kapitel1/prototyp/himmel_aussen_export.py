# Himmel für den Kameraflug (Verlauf, Sterne, Mond, Wolkenschleier, Abendglühen), 1600x900 mit Rand; Bildmitte = 1280x720-Ausschnitt ab (160, 90)
import asyncio, sys, base64, os
from playwright.async_api import async_playwright
P = os.path.dirname(os.path.abspath(__file__)); ZIEL = sys.argv[1]; N = int(sys.argv[2]); os.makedirs(ZIEL, exist_ok=True)
JS = '''(t) => { const cv = window.__HC || (window.__HC = document.createElement('canvas')); cv.width = 1600; cv.height = 900; const c = cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 160, 90);
  let g = c.createLinearGradient(0, -80, 0, H); g.addColorStop(0, '#141133'); g.addColorStop(.38, '#2e2563'); g.addColorStop(.62, '#6b4a86'); g.addColorStop(.78, '#d9806b'); g.addColorStop(.9, '#f2b37a'); g.addColorStop(1, '#f6c98e');
  c.fillStyle = g; c.fillRect(-200, -200, W + 400, H + 400);
  sterneZeichnen(c, t, 1, 1, 1, 0, 0); c.save(); c.translate(-160, 0); sterneZeichnen(c, t + 3, 1, 1, 1, 0, 0); c.restore(); c.save(); c.translate(160, 0); sterneZeichnen(c, t + 7, 1, 1, 1, 0, 0); c.restore();
  mond(c, 1060, 112, 30);
  c.fillStyle = 'rgba(180,150,210,.13)';
  for(const [x, y, w] of [[260, 170, 260], [820, 230, 330], [520, 300, 220]]){ const xx = ((x + t*4) % (W + 400)) - 200; c.beginPath(); c.ellipse(xx, y, w, 16, 0, 0, 7); c.fill(); }
  glow(c, 640, 470, 520, '255,170,120', .12);
  return cv.toDataURL('image/png'); }'''
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--allow-file-access-from-files'])
        p = await b.new_page(viewport={'width': 1312, 'height': 744})
        await p.goto('file://' + P + '/kapitel1_lokal.html?shot=aussen&t=0'); await p.wait_for_function('window.fertig', timeout=180000)
        for i in range(N):
            d = await p.evaluate(JS, i/24); open(f'{ZIEL}/s_{i:04d}.png', 'wb').write(base64.b64decode(d.split(',')[1]))
        print('himmel', N); await b.close()
asyncio.run(main())
