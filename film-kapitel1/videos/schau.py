import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--autoplay-policy=no-user-gesture-required'])
        p = await b.new_page(viewport={'width': 1280, 'height': 860}); fehler = []
        p.on('console', lambda m: fehler.append(m.text) if m.type == 'error' else None); p.on('pageerror', lambda e: fehler.append(str(e)))
        await p.goto('file://' + sys.argv[1]); await p.wait_for_timeout(1500); await p.screenshot(path=sys.argv[2])
        await p.click('#start'); await p.wait_for_timeout(500)
        await p.evaluate('() => { const v = document.getElementById("film"); v.pause(); v.currentTime = 20; }'); await p.wait_for_timeout(1500)
        await p.screenshot(path=sys.argv[3]); print('fehler', fehler, await p.evaluate('() => [document.getElementById("film").duration, document.getElementById("film").textTracks[0].mode, document.getElementById("film").textTracks[0].cues ? document.getElementById("film").textTracks[0].cues.length : -1]'))
        await b.close()
asyncio.run(main())
