# Vorschau-Video (niedrige Qualität, 480x270): Fensterflug + Film (gerade Bilder, dazwischen verdoppelt) + Ton
import os, json, subprocess, numpy as np
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); OUT = H + '/../seite_film/vorschau5.mp4'
N = len(json.load(open(H + '/film_voll5.json'))['bilder'])
subprocess.run(['env', 'MASSSTAB=.375', 'FILMJSON=' + H + '/film_voll5.json', H + '/../bvenv/bin/python', H + '/zusammensetzen.py', H + '/film_vs5h', H + '/himmel5', H + '/film_vs5h_fertig', '0', str(N)], check=True)
alle = H + '/vs5_alle'; os.makedirs(alle, exist_ok=True)
for f in os.listdir(alle): os.remove(os.path.join(alle, f))
k = 0
for f in sorted(x for x in os.listdir(H + '/haus_vs4') if x.endswith('.png')):
    im = np.asarray(Image.open(f'{H}/haus_vs4/{f}').convert('RGB').resize((480, 270))).copy(); bh = int(round(62*.375)); im[:bh] = 0; im[270 - bh:] = 0
    Image.fromarray(im).save(f'{alle}/a_{k:04d}.png'); k += 1
for n in range(N): os.symlink(f'{H}/film_vs5h_fertig/f_{n:04d}.png', f'{alle}/a_{k:04d}.png'); k += 1
dauer = k/24
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', f'{alle}/a_%04d.png', '-i', H + '/ton_film5.wav',
    '-vf', f'fade=t=in:st=0:d=0.6,fade=t=out:st={dauer - 1.2:.2f}:d=1.2', '-af', f'volume=1.6,afade=t=out:st={dauer - 1.2:.2f}:d=1.2',
    '-c:v', 'libx264', '-crf', '26', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-t', f'{dauer:.3f}', '-movflags', '+faststart', OUT], check=True)
print('vorschau', k, 'bilder', round(dauer, 1), 's', os.path.getsize(OUT)//1024, 'KB')
