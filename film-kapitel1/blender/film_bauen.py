# Fertiger Film: Vorspann (außen) + Blender-Bilder + Tonspur -> film.mp4, dazu Untertitel film.vtt
import os, re, json, subprocess, sys
import numpy as np
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); P = H + '/../prototyp'; OUT = H + '/../seite_film'; os.makedirs(OUT, exist_ok=True)
N_BILDER = len(json.load(open(H + '/film_voll2.json'))['bilder'])
subprocess.run([H + '/../bvenv/bin/python', H + '/zusammensetzen.py', H + '/film_voll2', H + '/himmel2', H + '/film_fertig2', '0', str(N_BILDER)], check=True)
alle = H + '/film_alle'; os.makedirs(alle, exist_ok=True)
for f in os.listdir(alle): os.remove(os.path.join(alle, f))
k = 0
# Vorspann: 3D-Kameraflug durchs Fenster; das Zimmer dahinter ist Filmbild 0 (ohne Kino-Balken)
os.makedirs(H + '/ohne_balken2', exist_ok=True)
subprocess.run(['env', 'OHNE_BALKEN=1', H + '/../bvenv/bin/python', H + '/zusammensetzen.py', H + '/film_voll2', H + '/himmel2', H + '/ohne_balken2', '0', '1'], check=True)
subprocess.run([H + '/../bvenv/bin/python', H + '/flug_zusammen.py', H + '/flug', H + '/himmel_aussen', H + '/ohne_balken2/f_0000.png', H + '/flug_fertig'], check=True)
vs = sorted(f for f in os.listdir(H + '/flug_fertig') if f.endswith('.png'))
for f in vs:
    im = np.asarray(Image.open(f'{H}/flug_fertig/{f}').convert('RGB')).copy(); bh = int(round(62*.75)); im[:bh] = 0; im[540 - bh:] = 0   # Kino-Balken wie im Film
    Image.fromarray(im).save(f'{alle}/a_{k:04d}.png'); k += 1
VORSPANN = k/24
n = 0
while os.path.exists(f'{H}/film_fertig2/f_{n:04d}.png'): os.symlink(f'{H}/film_fertig2/f_{n:04d}.png', f'{alle}/a_{k:04d}.png'); k += 1; n += 1
dauer = k/24; print('bilder', k, 'vorspann', len(vs), 'film', n, 'sek', round(dauer, 1))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', f'{alle}/a_%04d.png', '-i', H + '/ton_film2.wav',
    '-vf', f'fade=t=in:st=0:d=0.6,fade=t=out:st={dauer - 1.2:.2f}:d=1.2', '-af', f'volume=1.6,afade=t=out:st={dauer - 1.2:.2f}:d=1.2',
    '-c:v', 'libx264', '-crf', '19', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-t', f'{dauer:.3f}', '-movflags', '+faststart', OUT + '/film.mp4'], check=True)
print('mp4', os.path.getsize(OUT + '/film.mp4')//1024, 'KB')
# Untertitel aus dem Drehbuch, Zeiten aus der Aufzeichnung
src = open(P + '/src/skript.js').read(); src = src[src.index('const DREHBUCH = ['):]
eintraege = [z for z in src.split('\n') if re.match(r'^  \{', z)]
s = open(P + '/src/stimmen.js').read(); A = json.loads(s[s.index('{'):s.rindex('}') + 1])
NAME = {'prof': 'Professor', 'affe': 'Affe', 'schwein': 'Schweinchen'}
zeilen = json.load(open(H + '/film_voll2.json'))['zeilen']
def ts(t): return f'{int(t//3600):02d}:{int(t%3600//60):02d}:{t%60:06.3f}'
vtt = ['WEBVTT', '']
for z, t0 in zeilen:
    m = re.search(r"text: '((?:[^'\\]|\\.)*)'", eintraege[z]); w = re.search(r"wer: '(\w+)'", eintraege[z])
    if not m: continue
    a = VORSPANN + t0 + .03; b = a + (A[str(z)]['dauer'] if str(z) in A else 3)
    vtt += [ts(a) + ' --> ' + ts(b), f'<v {NAME.get(w.group(1), "")}>' + m.group(1).replace("\\'", "'"), '']
open(OUT + '/film.vtt', 'w').write('\n'.join(vtt)); print('untertitel', (len(vtt) - 2)//3)
json.dump({'dauer': dauer}, open(OUT + '/info.json', 'w'))
