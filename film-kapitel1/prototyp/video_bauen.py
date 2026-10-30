# Teststück: Filmbilder + Stimmen -> MP4, dazu eine kleine Abspielseite
import base64, json, re, subprocess, os, sys
B = '/tmp/claude-0/-home-user-koopgame/f80d235d-472d-51e4-84ca-119d3eca1c23/scratchpad/blender/'
H = os.path.dirname(os.path.abspath(__file__))
s = open(H + '/src/stimmen.js').read(); A = json.loads(s[s.index('{'):s.rindex('}') + 1])
d = json.load(open(B + 'film_keks.json')); zeilen = d['zeilen']; dauer = len(d['bilder'])/24
ein = []; filt = []
for n, (z, t0) in enumerate(zeilen):
    if str(z) not in A: continue
    f = B + f'film/stimme_{z}.mp3'; open(f, 'wb').write(base64.b64decode(A[str(z)]['b64'])); ein += ['-i', f]
    filt.append(f'[{len(filt)}:a]adelay={int(t0*1000)}|{int(t0*1000)}[a{len(filt)}]')
mix = ';'.join(filt) + ';' + ''.join(f'[a{i}]' for i in range(len(filt))) + f'amix=inputs={len(filt)}:normalize=0,atrim=0:{dauer:.3f}[ton]'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + ein + ['-filter_complex', mix, '-map', '[ton]', B + 'film/ton.m4a'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', B + 'film/bild_%04d.png', '-i', B + 'film/ton.m4a',
                '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', H + '/teststueck.mp4'], check=True)
print('mp4', os.path.getsize(H + '/teststueck.mp4')//1024, 'KB')
v = base64.b64encode(open(H + '/teststueck.mp4', 'rb').read()).decode()
open(H + '/teststueck.html', 'w').write('''<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Teststück Film</title>
<style>:root{--bg:#120f1e;--fg:#f3ead8}@media (prefers-color-scheme: light){:root:not([data-theme="dark"]){--bg:#120f1e;--fg:#f3ead8}}
body{margin:0;background:var(--bg);color:var(--fg);font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px}
video{width:min(100%,1280px);aspect-ratio:16/9;border-radius:10px;background:#000}p{max-width:1280px;opacity:.8;margin:0}</style></head><body>
<video controls playsinline src="data:video/mp4;base64,''' + v + '''"></video>
<p>Teststück: alles in Blender gerendert, auch die Figuren mit Fell. 5 Sekunden, 24 Bilder pro Sekunde, mit Stimmen.</p></body></html>''')
print('seite fertig')
