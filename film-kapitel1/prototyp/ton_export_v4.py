# Tonspur für den Film: Regie nachspielen und Geräusche mitschreiben, dann alles (Stimmen, Geräusche, Grillen) offline in eine WAV rendern
import asyncio, sys, base64, os, json
from playwright.async_api import async_playwright
P = os.path.dirname(os.path.abspath(__file__)); ZIEL = sys.argv[1]; VORSPANN = float(sys.argv[2])
TONSRC = open(P + '/src/ton.js').read().replace('const TON = (function(){', 'window.TON2 = (function(){').replace(
    'ac = new (window.AudioContext || window.webkitAudioContext)();', 'ac = window.__AC;')
LOG = '''() => { window.__log = []; const namen = ['plumps', 'knabbern', 'sternFlug', 'sternLoop', 'sternFall', 'bumm', 'klick', 'tippel', 'schritt', 'datei'];
  for(const n of namen){ const alt = TON[n]; TON[n] = (...a) => { __log.push([n, T, a]); }; }
  const dt = 1/24, sub = 4; const len = i => { const z = DREHBUCH[i]; if(!z) return 99; return z.text ? (AUFNAHMEN[i] ? AUFNAHMEN[i].dauer : 3) + (z.luecke !== undefined ? z.luecke : .35) : (z.pause || 0) + (z.sternAbwarten ? 3 : 0); };
  const T0 = T; let ende = st.zT0 + len(st.zeile), b = 0; const zeilen = [[st.zeile, 0]]; let fertig = false;
  while(!fertig && b < 4000){ b++;
    for(let s = 0; s < sub; s++){ T += dt/sub;
      if(T >= ende){ if(st.zeile + 1 >= DREHBUCH.length){ fertig = true; break; } zeileStarten(st.zeile + 1); zeilen.push([st.zeile, b*dt]); ende = T + len(st.zeile); }
      while(st.events.length){ const j = st.events.findIndex(e => e.t <= T); if(j < 0) break; regieAusfuehren(st.events.splice(j, 1)[0], T); }
      figurenSchritt(dt/sub, T); sternSchritt(T, dt/sub); } }
  return JSON.stringify({bilder: b, zeilen, log: __log.map(([n, t, a]) => [n, t - T0, a])}); }'''
RENDER = '''async ([daten, vorspann]) => {
  const sr = 48000, dauer = vorspann + daten.bilder/24 + 1.5, oc = new OfflineAudioContext(2, Math.ceil(sr*dauer), sr);
  let jetzt = 0; const haupt = oc.createGain(); haupt.gain.value = .55; haupt.connect(oc.destination); window.__AC = new Proxy(oc, {get(o, k){ if(k === 'currentTime') return jetzt; if(k === 'destination') return haupt; const v = o[k]; return typeof v === 'function' ? v.bind(o) : v; }});
  window.__SCHRITT = []; for(const b64 of window.__SCHRITTE){ const bin = Uint8Array.from(atob(b64), ch => ch.charCodeAt(0)); window.__SCHRITT.push(await oc.decodeAudioData(bin.buffer)); }
  TON2.start(); const um = n => { jetzt = n; };
  um(0); TON2.grillenLaut(0);   // Nachtgeräusche kommen jetzt aus den eigenen Aufnahmen (draußen/Zimmer)
  for(const [n, t, a] of daten.log){ um(vorspann + t);
    if(n === 'datei'){ const b64 = window.__DATEIEN[a[0]]; if(!b64) continue; const bin = Uint8Array.from(atob(b64), ch => ch.charCodeAt(0)), buf = await oc.decodeAudioData(bin.buffer);
      const q = oc.createBufferSource(), g = oc.createGain(); g.gain.value = ((window.__LAUT || {})[a[0]] || 1)*(a[1] !== undefined ? a[1] : 1); q.buffer = buf; q.connect(g); g.connect(haupt); q.start(vorspann + t); }
    else if(n === 'schritt' && a[1]){ TON2.tippel(a[0] === 'schwein'); }   // Schleichen: hell und kurz wie im Cartoon
    else if(n === 'schritt'){ const v = window.__SCHRITT, q = oc.createBufferSource(), g = oc.createGain(); q.buffer = v[Math.floor(Math.random()*v.length)];
      const art = {prof: [.8, 1.0], affe: [1.0, .8], schwein: [1.15, .65]}[a[0]] || [1, .8]; q.playbackRate.value = art[0]*(.95 + Math.random()*.1); g.gain.value = art[1]*(window.__LAUT.schritt || 1);
      q.connect(g); g.connect(haupt); q.start(vorspann + t); }
    else if(n === 'klick' && window.__DATEIEN.licht){ const bin = Uint8Array.from(atob(window.__DATEIEN.licht), ch => ch.charCodeAt(0)), buf = await oc.decodeAudioData(bin.buffer);
      const q = oc.createBufferSource(), g = oc.createGain(); g.gain.value = window.__LAUT.licht || 1; q.buffer = buf; q.connect(g); g.connect(haupt); q.start(vorspann + t); }
    else TON2[n](...a); }
  for(const [z, t] of daten.zeilen){ if(!AUFNAHMEN[z]) continue;
    const bin = Uint8Array.from(atob(AUFNAHMEN[z].b64), ch => ch.charCodeAt(0)), buf = await oc.decodeAudioData(bin.buffer);
    const s = oc.createBufferSource(); s.buffer = buf; s.connect(haupt); s.start(vorspann + t + .03); }
  const out = await oc.startRendering(), L = out.getChannelData(0), R = out.getChannelData(1), n = L.length;
  const buf = new ArrayBuffer(44 + n*4), d = new DataView(buf); const w = (o, s) => { for(let i = 0; i < s.length; i++) d.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); d.setUint32(4, 36 + n*4, true); w(8, 'WAVEfmt '); d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 2, true); d.setUint32(24, sr, true); d.setUint32(28, sr*4, true); d.setUint16(32, 4, true); d.setUint16(34, 16, true); w(36, 'data'); d.setUint32(40, n*4, true);
  for(let i = 0; i < n; i++){ d.setInt16(44 + i*4, Math.max(-1, Math.min(1, L[i]))*32767, true); d.setInt16(46 + i*4, Math.max(-1, Math.min(1, R[i]))*32767, true); }
  let s = ''; const u8 = new Uint8Array(buf); for(let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s); }'''
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required'])
        p = await b.new_page(viewport={'width':1312,'height':744})
        await p.goto('file://'+P+'/kapitel1_lokal.html?shot=innen&zeile=0&t=0'); await p.wait_for_function('window.fertig', timeout=180000)
        daten = json.loads(await p.evaluate(LOG)); print('bilder', daten['bilder'], 'geraeusche', [(n, round(t, 2)) for n, t, a in daten['log']])
        json.dump(daten, open(ZIEL.replace('.wav', '.json'), 'w'))
        await p.add_script_tag(content=TONSRC)
        SND = P + '/../sounds'; dateien = {n: base64.b64encode(open(f'{SND}/{f}', 'rb').read()).decode() for n, f in (('stern', 'stern.mp3'), ('tuer_auf', 'tuer_auf.wav'), ('tuer_zu', 'tuer_zu.wav'), ('licht', 'licht.wav')) if os.path.exists(f'{SND}/{f}')}
        schritte = [base64.b64encode(open(f'{SND}/schritt_spiel/schritt{i}.wav', 'rb').read()).decode() for i in range(6)]
        await p.evaluate("([d, l, s]) => { window.__DATEIEN = d; window.__LAUT = l; window.__SCHRITTE = s; }", [dateien, {'stern': 1.0, 'tuer_auf': 1.0, 'tuer_zu': 1.0, 'licht': 1.0, 'schritt': .3}, schritte])
        wav = await p.evaluate(RENDER, [daten, VORSPANN]); open(ZIEL, 'wb').write(base64.b64decode(wav)); print('wav', os.path.getsize(ZIEL)//1024, 'KB')
        await b.close()
asyncio.run(main())
