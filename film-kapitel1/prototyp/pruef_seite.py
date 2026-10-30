import asyncio, sys
from playwright.async_api import async_playwright
P = '/tmp/claude-0/-home-user-koopgame/f80d235d-472d-51e4-84ca-119d3eca1c23/scratchpad/prototyp'
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--allow-file-access-from-files'])
        for arg in sys.argv[1:]:
            z, t = arg.split(':'); p = await b.new_page(viewport={'width':1312,'height':744}); err = []
            p.on('pageerror', lambda e: err.append(str(e)))
            await p.goto(f'file://{P}/kapitel1_lokal.html?shot=innen&zeile={z}&t={t}'); await p.wait_for_function('window.fertig', timeout=180000)
            await p.screenshot(path=f'{P}/pr_{z}_{t}.png'); print(arg, err[:2]); await p.close()
        await b.close()
asyncio.run(main())
