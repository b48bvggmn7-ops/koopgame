import asyncio, base64, sys
from playwright.async_api import async_playwright
ZIEL = sys.argv[1]
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--autoplay-policy=no-user-gesture-required'])
        p = await b.new_page()
        await p.goto('http://localhost:8765/index.html'); await p.wait_for_timeout(1500)
        await p.evaluate("sfxPrepare()")
        await p.wait_for_function("typeof sfxBank !== 'undefined' && sfxBank", timeout=60000)
        wavs = await p.evaluate('''() => sfxBank.step.map(ab => { const n = ab.length, sr = ab.sampleRate, L = ab.getChannelData(0), R = ab.getChannelData(1);
          const buf = new ArrayBuffer(44 + n*4), d = new DataView(buf); const w = (o, s) => { for(let i = 0; i < s.length; i++) d.setUint8(o + i, s.charCodeAt(i)); };
          w(0,'RIFF'); d.setUint32(4,36+n*4,true); w(8,'WAVEfmt '); d.setUint32(16,16,true); d.setUint16(20,1,true); d.setUint16(22,2,true); d.setUint32(24,sr,true); d.setUint32(28,sr*4,true); d.setUint16(32,4,true); d.setUint16(34,16,true); w(36,'data'); d.setUint32(40,n*4,true);
          for(let i = 0; i < n; i++){ d.setInt16(44+i*4, L[i]*32767, true); d.setInt16(46+i*4, R[i]*32767, true); }
          let s = ''; const u8 = new Uint8Array(buf); for(let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); })''')
        for i, w in enumerate(wavs): open(f'{ZIEL}/schritt{i}.wav', 'wb').write(base64.b64decode(w))
        print(len(wavs), 'Schritte')
        await b.close()
asyncio.run(main())
