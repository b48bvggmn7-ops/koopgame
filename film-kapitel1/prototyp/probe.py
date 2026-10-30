import asyncio, sys, json
from playwright.async_api import async_playwright
P='/tmp/claude-0/-home-user-koopgame/f80d235d-472d-51e4-84ca-119d3eca1c23/scratchpad/prototyp'
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--allow-file-access-from-files'])
        p = await b.new_page(viewport={'width':1312,'height':744})
        err=[]; p.on('pageerror', lambda e: err.append(str(e)))
        await p.goto('file://'+P+'/kapitel1_lokal.html?shot=innen&zeile=1&t=0'); await p.wait_for_function('window.fertig', timeout=180000)
        r = await p.evaluate(open(sys.argv[1]).read())
        print(json.dumps(r))
        print('fehler', err)
        await b.close()
asyncio.run(main())
