# Erzeugt je Satz des Drehbuchs eine Sprachaufnahme (Piper-Stimmen), verändert die Tonhöhe je Figur und schreibt stimmen.js
import re, json, subprocess, base64, sys, os
import numpy as np
D='/tmp/claude-0/-home-user-koopgame/f80d235d-472d-51e4-84ca-119d3eca1c23/scratchpad/tts'
SRC='/tmp/claude-0/-home-user-koopgame/f80d235d-472d-51e4-84ca-119d3eca1c23/scratchpad/prototyp/src'
PROFIL = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {
  'prof':    {'stimme': 'thorsten', 'tempo': 1.12, 'hoehe': .86},
  'affe':    {'stimme': 'karlsson', 'tempo': .95,  'hoehe': 1.12},
  'schwein': {'stimme': 'kerstin',  'tempo': .95,  'hoehe': 1.32},
}
skript = open(SRC + '/skript.js').read()
js = skript + '\nconsole.log(JSON.stringify(DREHBUCH));'
DB = json.loads(subprocess.run(['node', '-e', js], capture_output=True, check=True).stdout)
os.makedirs(D + '/saetze', exist_ok=True)
aus = {}
for i, e in enumerate(DB):
    if not e.get('text'): continue
    wer, text = e['wer'], e['text']
    leise = bool(e.get('leise'))
    sp = text.replace('…', ',').replace('–', ',').replace('Hm-hm.', 'Hmm, hmm.').replace('Pssst', 'Psst')
    sp = re.sub(r'\b([A-ZÄÖÜ])([A-ZÄÖÜ]+)\b', lambda x: x.group(1) + x.group(2).lower(), sp).strip(' ,')
    p = PROFIL[wer]; modell = [f for f in os.listdir(f"{D}/stimmen/voice-de-{p['stimme']}-low" if os.path.isdir(f"{D}/stimmen/voice-de-{p['stimme']}-low") else f"{D}/stimmen/voice-de-{p['stimme']}") if f.endswith('.onnx')][0]
    ordner = f"{D}/stimmen/voice-de-{p['stimme']}-low" if os.path.isdir(f"{D}/stimmen/voice-de-{p['stimme']}-low") else f"{D}/stimmen/voice-de-{p['stimme']}"
    roh = f'{D}/saetze/{i:02d}_roh.wav'; fertig = f'{D}/saetze/{i:02d}.mp3'
    subprocess.run([D + '/venv/bin/piper', '-m', f'{ordner}/{modell}', '-f', roh, '--length-scale', str(p['tempo']*(1.08 if leise else 1)), '--sentence-silence', '0.15'], input=sp.encode(), check=True, capture_output=True)
    sr = 16000; h = p['hoehe']
    filt = f"asetrate={int(sr*h)},aresample=24000,atempo={1/h:.4f},volume={0.6 if leise else 1.0},highpass=f=70,afade=t=in:d=0.02"
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', roh, '-af', filt, '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '56k', fertig], check=True)
    pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', fertig, '-ac', '1', '-ar', '6000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(pcm, dtype=np.int16).astype(np.float32)/32768
    fen = 200   # 1/30 s
    rms = [float(np.sqrt(np.mean(a[k:k+fen]**2))) for k in range(0, len(a), fen)]
    mx = max(rms) or 1
    aus[i] = {'b64': base64.b64encode(open(fertig, 'rb').read()).decode(), 'dauer': round(len(a)/6000, 3), 'huelle': [round(min(1, r/mx*1.3), 2) for r in rms]}
    print(i, wer, aus[i]['dauer'], 's', sp)
open(SRC + '/stimmen.js', 'w').write('// Sprachaufnahmen je Satz (erzeugt mit Piper-Stimmen, tts/erzeugen.py): Index = Zeile im DREHBUCH\nconst AUFNAHMEN = ' + json.dumps(aus) + ';\n')
print('kB', os.path.getsize(SRC + '/stimmen.js')//1024)
