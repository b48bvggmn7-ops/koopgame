import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--allow-file-access-from-files'])
        p = await b.new_page(viewport={'width':1600,'height':700})
        err=[]; p.on('pageerror', lambda e: err.append(str(e))); p.on('console', lambda m: err.append(m.text) if m.type in ('error','warning') else None)
        await p.goto('file://'+sys.argv[1]); await p.wait_for_function('window.fertig', timeout=120000)
        await p.screenshot(path=sys.argv[2]); print(err)
        await b.close()
asyncio.run(main())
