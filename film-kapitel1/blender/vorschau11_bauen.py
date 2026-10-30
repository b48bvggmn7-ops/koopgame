# Vorschau 7: Haus (3 s) + Film; am Ende abdunkeln und den Blätter-Vorhang mit „Level 1“ einblenden
import os, json, subprocess, numpy as np
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); OUT = H + '/../seite_film/vorschau11.mp4'; WB, HB = 480, 270; BH = int(round(62*.375))
N = len(json.load(open(H + '/film_voll9.json'))['bilder'])
subprocess.run(['env', 'MASSSTAB=.375', 'FILMJSON=' + H + '/film_voll9.json', H + '/../bvenv/bin/python', H + '/zusammensetzen.py', H + '/film_vs11h', H + '/himmel9', H + '/film_vs11h_fertig', '0', str(N)], check=True)
alle = H + '/vs11_alle'; os.makedirs(alle, exist_ok=True)
for f in os.listdir(alle): os.remove(os.path.join(alle, f))
k = 0
def speichern(im):
    global k; im.save(f'{alle}/a_{k:04d}.png'); k += 1
for f in sorted(x for x in os.listdir(H + '/haus_vs4') if x.endswith('.png')):
    a = np.asarray(Image.open(f'{H}/haus_vs4/{f}').convert('RGB').resize((WB, HB))).copy(); a[:BH] = 0; a[HB - BH:] = 0; speichern(Image.fromarray(a))
VORSPANN = k/24
DUNKEL = 20   # die letzten Bilder werden schwarz
for n in range(N):
    im = Image.open(f'{H}/film_vs11h_fertig/f_{n:04d}.png').convert('RGB')
    w = (n - (N - DUNKEL))/DUNKEL
    if w > 0: im = Image.blend(im, Image.new('RGB', im.size), min(1, w))
    speichern(im)
FILM_ENDE = k/24
schwarz = Image.new('RGBA', (WB, HB), (0, 0, 0, 255))
NV = len([f for f in os.listdir(H + '/vorhang_vs') if f.startswith('v_')])
for i in range(NV): speichern(Image.alpha_composite(schwarz, Image.open(f'{H}/vorhang_vs/v_{i:04d}.png').convert('RGBA').resize((WB, HB))).convert('RGB'))
dauer = k/24
# Ton: Film, danach leises Blätterrascheln für den Vorhang
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', H + '/ton_film11.wav', '-af', f'apad=whole_dur={dauer:.3f},afade=t=out:st={FILM_ENDE - 0.8:.2f}:d=0.8', '-t', f'{dauer:.3f}', H + '/ton11_a.wav'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anoisesrc=color=pink:duration=1.4:amplitude=0.35', '-af', 'highpass=f=900,lowpass=f=6000,afade=t=in:d=0.25,afade=t=out:st=0.6:d=0.8,aformat=sample_rates=48000:channel_layouts=stereo',
    H + '/ton11_blaetter.wav'], check=True)
SND = H + '/../sounds'
# eigene Aufnahmen: draußen (Haus, 3 s), danach Zimmer-Atmosphäre; beide liegen auf derselben Zeitachse (76 s) – sehr leise aufgenommen, daher angehoben
# Hintergrund drinnen (Nutzer-Aufnahmen, alles leise): Raumklang durchgehend (Standuhr wieder raus), ab und zu Holzknarren vom Baumhaus
fmt = 'aformat=sample_rates=48000:channel_layouts=stereo'
drin = f'afade=t=in:st={VORSPANN:.2f}:d=1.0,afade=t=out:st={FILM_ENDE - 1.5:.2f}:d=1.5,atrim=0:{dauer:.2f}'
KNARZ = [(1.3, 2.3, 9), (6.3, 7.1, 27), (4.0, 4.8, 45), (1.3, 2.3, 63)]   # (von, bis in der Aufnahme, wann im Film)
knarz = ''.join(f'[4]{fmt},atrim={v}:{bi},asetpts=PTS-STARTPTS,afade=t=in:d=0.15,afade=t=out:st={bi - v - .3:.2f}:d=0.3,lowpass=f=2500,volume=-9dB,adelay={int((VORSPANN + w)*1000)}|{int((VORSPANN + w)*1000)}[k{i}];' for i, (v, bi, w) in enumerate(KNARZ))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', H + '/ton11_a.wav', '-i', H + '/ton11_blaetter.wav', '-i', SND + '/aussen.mp3',
    '-stream_loop', '-1', '-i', SND + '/raum.wav', '-i', SND + '/schritte.wav', '-filter_complex',
    f'[1]adelay={int(FILM_ENDE*1000)}|{int(FILM_ENDE*1000)}[b];'
    f'[2]{fmt},volume=25dB,afade=t=out:st={VORSPANN - .3:.2f}:d=0.6,atrim=0:{dauer:.2f}[au];'
    f'[3]{fmt},volume=-13dB,{drin}[ra];'
    + knarz +
    '[0][b][au][ra]' + ''.join(f'[k{i}]' for i in range(len(KNARZ))) + f'amix=inputs={4 + len(KNARZ)}:normalize=0', '-t', f'{dauer:.3f}', H + '/ton11_ganz.wav'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', f'{alle}/a_%04d.png', '-i', H + '/ton11_ganz.wav',
    '-vf', f'fade=t=in:st=0:d=0.6,fade=t=out:st={dauer - 0.8:.2f}:d=0.8', '-af', f'volume=1.6,afade=t=out:st={dauer - 1.0:.2f}:d=1.0',
    '-c:v', 'libx264', '-crf', '26', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-t', f'{dauer:.3f}', '-movflags', '+faststart', OUT], check=True)
print('vorschau11', k, 'bilder', round(dauer, 1), 's', os.path.getsize(OUT)//1024, 'KB')
