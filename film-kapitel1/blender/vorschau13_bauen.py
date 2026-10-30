# Vorschau 7: Haus (3 s) + Film; am Ende abdunkeln und den Blätter-Vorhang mit „Level 1“ einblenden
import os, json, subprocess, numpy as np
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); OUT = H + '/../seite_film/vorschau13.mp4'; WB, HB = 480, 270; BH = int(round(62*.375))
N = len(json.load(open(H + '/film_voll9.json'))['bilder'])
subprocess.run(['env', 'MASSSTAB=.375', 'FILMJSON=' + H + '/film_voll9.json', H + '/../bvenv/bin/python', H + '/zusammensetzen.py', H + '/film_vs12h', H + '/himmel9', H + '/film_vs12h_fertig', '0', str(N)], check=True)
alle = H + '/vs13_alle'; os.makedirs(alle, exist_ok=True)
for f in os.listdir(alle): os.remove(os.path.join(alle, f))
k = 0
def speichern(im):
    global k; im.save(f'{alle}/a_{k:04d}.png'); k += 1
for f in sorted(x for x in os.listdir(H + '/haus_vs5') if x.endswith('.png')):
    a = np.asarray(Image.open(f'{H}/haus_vs5/{f}').convert('RGB').resize((WB, HB))).copy(); a[:BH] = 0; a[HB - BH:] = 0; speichern(Image.fromarray(a))
VORSPANN = k/24
DUNKEL = 20   # die letzten Bilder werden schwarz
for n in range(N):
    im = Image.open(f'{H}/film_vs12h_fertig/f_{n:04d}.png').convert('RGB')
    w = (n - (N - DUNKEL))/DUNKEL
    if w > 0: im = Image.blend(im, Image.new('RGB', im.size), min(1, w))
    speichern(im)
FILM_ENDE = k/24
schwarz = Image.new('RGBA', (WB, HB), (0, 0, 0, 255))
NV = len([f for f in os.listdir(H + '/vorhang_vs') if f.startswith('v_')])
for i in range(NV): speichern(Image.alpha_composite(schwarz, Image.open(f'{H}/vorhang_vs/v_{i:04d}.png').convert('RGBA').resize((WB, HB))).convert('RGB'))
dauer = k/24
# Ton: Film, danach leises Blätterrascheln für den Vorhang
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', H + '/ton_film13.wav', '-af', f'apad=whole_dur={dauer:.3f},afade=t=out:st={FILM_ENDE - 0.8:.2f}:d=0.8', '-t', f'{dauer:.3f}', H + '/ton13_a.wav'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anoisesrc=color=pink:duration=1.4:amplitude=0.35', '-af', 'highpass=f=900,lowpass=f=6000,afade=t=in:d=0.25,afade=t=out:st=0.6:d=0.8,aformat=sample_rates=48000:channel_layouts=stereo',
    H + '/ton13_blaetter.wav'], check=True)
SND = H + '/../sounds'
# Ton-Mischung (Runde 12): draußen leiser + einmal die Eule; drinnen leiser Raumklang + durchgehend leises Holzknarren (BRS-Aufnahme);
# beim Laufen (Zeiten aus der Regie: Schritt-Ereignisse) leise das knarzende Holz aus der Schritte-Aufnahme
fmt = 'aformat=sample_rates=48000:channel_layouts=stereo'
drin = f'afade=t=in:st={VORSPANN:.2f}:d=0.03,afade=t=out:st={FILM_ENDE - 1.5:.2f}:d=1.5,atrim=0:{dauer:.2f}'
log = json.load(open(H + '/ton_film13.json'))['log']; LAUF = []   # Laufstrecken [von, bis, schleichen] in Filmzeit
for n_, t_, a_ in log:
    if n_ != 'schritt': continue
    if LAUF and t_ - LAUF[-1][1] < .7: LAUF[-1][1] = t_
    else: LAUF.append([t_, t_, bool(a_[1])])
# Holzknarren nur ab und zu (Nutzerwunsch): (von, bis in der Aufnahme, wann im Zimmer, Lautstärke dB)
EULE = 0.8   # Eule ruft früh, damit beide „Uhus“ samt Nachklang vor dem Schnitt (5 s) fertig sind
lauf = ''
for i, (v, bi, sch) in enumerate(LAUF):
    d = bi - v + .5; st = (i*2.3) % max(.1, 7.0 - d); ms = int((VORSPANN + v)*1000)
    lauf += f'[{5 + i}]{fmt},atrim={st:.2f}:{st + d:.2f},asetpts=PTS-STARTPTS,afade=t=in:d=0.2,afade=t=out:st={max(0, d - .4):.2f}:d=0.4,lowpass=f=3000,volume={-17 if sch else -13}dB,adelay={ms}|{ms}[l{i}];'
ein = []
for _ in LAUF: ein += ['-stream_loop', '-1', '-i', SND + '/schritte.wav']
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', H + '/ton13_a.wav', '-i', H + '/ton13_blaetter.wav', '-i', SND + '/aussen.mp3',
    '-stream_loop', '-1', '-i', SND + '/raum.wav', '-stream_loop', '-1', '-i', SND + '/knarren_schiff.wav'] + ein + ['-i', SND + '/eule.wav', '-i', SND + '/wind.wav', '-filter_complex',
    f'[1]adelay={int(FILM_ENDE*1000)}|{int(FILM_ENDE*1000)}[b];'
    f'[2]{fmt},atrim=10.5:{10.5 + VORSPANN:.3f},asetpts=PTS-STARTPTS,volume=-2dB,afade=t=in:d=0.3,atrim=0:{VORSPANN:.3f},afade=t=out:st={VORSPANN - .03:.3f}:d=0.03,apad=whole_dur={dauer:.2f}[au];'   # harter Schnitt beim Bildwechsel nach innen
    f'[3]{fmt},volume=-13dB,{drin}[ra];'
    + f'[4]{fmt},asetrate=45120,aresample=48000,highpass=f=120,lowpass=f=2800,aecho=0.8:0.5:40|75:0.25|0.15,volume=-14dB,{drin}[kn];'   # Holzknarren durchgehend (Schiffs-Knarzen, Runde 13): etwas tiefer (größeres Holzhaus), gedämpft wie durch die Wände, kleiner Raumhall
    + lauf +
    f'[{5 + len(LAUF)}]{fmt},volume=-20dB,aecho=0.8:0.6:180:0.25,adelay={int(EULE*1000)}|{int(EULE*1000)},atrim=0:{VORSPANN:.3f},afade=t=out:st={VORSPANN - .03:.3f}:d=0.03,apad=whole_dur={dauer:.2f}[eu];'
    f'[{6 + len(LAUF)}]{fmt},atrim=2:{2 + VORSPANN:.3f},asetpts=PTS-STARTPTS,volume=-7dB,afade=t=in:d=0.3,afade=t=out:st={VORSPANN - .03:.3f}:d=0.03,apad=whole_dur={dauer:.2f}[wi];'   # Wind draußen, endet hart mit dem Schnitt
    '[0][b][au][ra][eu][kn][wi]' + ''.join(f'[l{i}]' for i in range(len(LAUF))) + f'amix=inputs={7 + len(LAUF)}:normalize=0', '-t', f'{dauer:.3f}', H + '/ton13_ganz.wav'], check=True)
print('laufen', [(round(v, 1), round(b, 1), s) for v, b, s in LAUF])
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', f'{alle}/a_%04d.png', '-i', H + '/ton13_ganz.wav',
    '-vf', f'fade=t=in:st=0:d=0.6,fade=t=out:st={dauer - 0.8:.2f}:d=0.8', '-af', f'volume=1.6,afade=t=out:st={dauer - 1.0:.2f}:d=1.0',
    '-c:v', 'libx264', '-crf', '26', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-t', f'{dauer:.3f}', '-movflags', '+faststart', OUT], check=True)
print('vorschau13', k, 'bilder', round(dauer, 1), 's', os.path.getsize(OUT)//1024, 'KB')
