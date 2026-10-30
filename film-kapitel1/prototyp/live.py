import asyncio
from playwright.async_api import async_playwright
P='/tmp/claude-0/-home-user-koopgame/f80d235d-472d-51e4-84ca-119d3eca1c23/scratchpad/prototyp'
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required'])
        p = await b.new_page(viewport={'width':1312,'height':744})
        err=[]; p.on('pageerror', lambda e: err.append(str(e)))
        await p.goto('file://'+P+'/kapitel1_lokal.html'); await p.wait_for_timeout(1500)
        await p.keyboard.press('Space')
        for i in range(8):
            await p.wait_for_timeout(5000)
            ph = await p.evaluate("[st.phase, st.zeile, gezeigt]")
            print(i, ph)
            if i == 3: await p.screenshot(path=P+'/l_1.png')
        # schnell durchklicken
        for i in range(30):
            await p.keyboard.press('Space'); await p.wait_for_timeout(700)
        print(await p.evaluate("[st.phase, st.zeile, st.gefallen]"))
        await p.wait_for_timeout(3000); await p.screenshot(path=P+'/l_ende.png')
        print('fehler', err)
        await b.close()
asyncio.run(main())
