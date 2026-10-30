import asyncio, zipfile, io, sys
from playwright.async_api import async_playwright
P = sys.argv[1]
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(accept_downloads=True); p = await ctx.new_page(); fehler = []
        p.on('pageerror', lambda e: fehler.append(str(e)))
        await p.goto('file://' + P); await p.wait_for_timeout(800)
        await p.click('#rec-1'); await p.wait_for_timeout(1500); await p.keyboard.press('Space'); await p.wait_for_timeout(800)
        print('status1', await p.text_content('#status-1'), '| aktiv', await p.evaluate('aktiv'))
        await p.keyboard.press('Space'); await p.wait_for_timeout(1200); await p.keyboard.press('Space'); await p.wait_for_timeout(800)
        print('status2', await p.text_content('#status-2'), '|', await p.text_content('#zahl'))
        await p.click('#filter button[data-f="schwein"]'); print('sichtbar s1', await p.is_visible('#satz-1'), 's2', await p.is_visible('#satz-2'))
        await p.reload(); await p.wait_for_timeout(1000); print('nach neu laden', await p.text_content('#zahl'))
        async with p.expect_download() as d: await p.click('#zip')
        dl = await d.value; z = zipfile.ZipFile(await dl.path()); print('zip', [(i.filename, i.file_size) for i in z.infolist()]); print(z.read('liste.txt').decode()[:120])
        print('fehler', fehler); await b.close()
asyncio.run(main())
