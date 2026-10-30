# Vorschau 6: Haus (3 s) + Film (mit Schleich-Ende) + draußen (Tür, Rausschleichen) + Blätter-Vorhang mit „Level 1“
import os, json, subprocess, numpy as np
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); OUT = H + '/../seite_film/vorschau6.mp4'; WB, HB = 480, 270; BH = int(round(62*.375))
N = len(json.load(open(H + '/film_voll6.json'))['bilder'])
subprocess.run(['env', 'MASSSTAB=.375', 'FILMJSON=' + H + '/film_voll6.json', H + '/../bvenv/bin/python', H + '/zusammensetzen.py', H + '/film_vs6h', H + '/himmel6', H + '/film_vs6h_fertig', '0', str(N)], check=True)
alle = H + '/vs6_alle'; os.makedirs(alle, exist_ok=True)
for f in os.listdir(alle): os.remove(os.path.join(alle, f))
k = 0
def balken(im): a = np.asarray(im.convert('RGB').resize((WB, HB))).copy(); a[:BH] = 0; a[HB - BH:] = 0; return Image.fromarray(a)
def speichern(im):
    global k; im.save(f'{alle}/a_{k:04d}.png'); k += 1
for f in sorted(x for x in os.listdir(H + '/haus_vs4') if x.endswith('.png')): speichern(balken(Image.open(f'{H}/haus_vs4/{f}')))
VORSPANN = k/24
for n in range(N): os.symlink(f'{H}/film_vs6h_fertig/f_{n:04d}.png', f'{alle}/a_{k:04d}.png'); k += 1
FILM_ENDE = k/24
# draußen: Himmel (läuft weiter) + Baumhaus; ab Bild 110 der Vorhang darüber
himmel = sorted(f for f in os.listdir(H + '/himmel_aussen') if f.startswith('s_'))
fern = json.load(open(H + '/flug_vs3/a_0000.json'))['fern']
def aussen(i):
    ext = Image.open(f'{H}/ausgang_vs/a_{min(i, 149):04d}.png').convert('RGBA'); R = ext.size[0]/1280; sw, sh = int(ext.size[0]*2.2), int(ext.size[1]*2.2)
    him = Image.open(f'{H}/himmel_aussen/{himmel[min(i, len(himmel) - 1)]}').convert('RGB').resize((sw, sh))
    b = Image.new('RGB', ext.size); b.paste(him, (int(round(fern[0]*R - sw/2)), int(round(fern[1]*R - sh/2)))); return Image.alpha_composite(b.convert('RGBA'), ext).convert('RGB')
V0 = 110; NV = len([f for f in os.listdir(H + '/vorhang_vs') if f.startswith('v_')])
for i in range(V0 + NV):
    bild = balken(aussen(i)).convert('RGBA')
    if i >= V0: v = Image.open(f'{H}/vorhang_vs/v_{i - V0:04d}.png').convert('RGBA').resize((WB, HB)); bild = Image.alpha_composite(bild, v)
    speichern(bild.convert('RGB'))
dauer = k/24
# Ton: Film-Ton, danach Grillen aus der dunklen Szene als Nachtgeräusch draußen
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', H + '/ton_film6.wav', '-af', f'apad=whole_dur={FILM_ENDE:.3f}', '-t', f'{FILM_ENDE:.3f}', H + '/ton6_teil1.wav'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{FILM_ENDE - 12:.2f}', '-t', '6', '-i', H + '/ton_film6.wav', H + '/ton6_stueck.wav'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-stream_loop', '3', '-i', H + '/ton6_stueck.wav', '-af', 'afade=t=in:d=0.3', '-t', f'{dauer - FILM_ENDE:.3f}', H + '/ton6_teil2.wav'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', H + '/ton6_teil1.wav', '-i', H + '/ton6_teil2.wav', '-filter_complex', '[0][1]concat=n=2:v=0:a=1', H + '/ton6_ganz.wav'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', f'{alle}/a_%04d.png', '-i', H + '/ton6_ganz.wav',
    '-vf', f'fade=t=in:st=0:d=0.6,fade=t=out:st={dauer - 1.0:.2f}:d=1.0', '-af', f'volume=1.6,afade=t=out:st={dauer - 1.2:.2f}:d=1.2',
    '-c:v', 'libx264', '-crf', '26', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-t', f'{dauer:.3f}', '-movflags', '+faststart', OUT], check=True)
print('vorschau6', k, 'bilder', round(dauer, 1), 's', os.path.getsize(OUT)//1024, 'KB')
