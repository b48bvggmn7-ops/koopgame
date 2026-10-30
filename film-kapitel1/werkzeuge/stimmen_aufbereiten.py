# Stimmen fürs Kapitel aufbereiten: aktiven Kanal nehmen (Aufnahmen kamen nur links an) -> auf beide Ohren,
# Trittschall weg, sanft komprimieren, Lautheit angleichen (Flüstern etwas leiser), Stille an den Rändern kürzen.
import os, sys, subprocess, re
QUELLE, ZIEL = sys.argv[1], sys.argv[2]; os.makedirs(ZIEL, exist_ok=True)
FLUESTERN = {21, 22, 23, 24, 25}
def kanal_pegel(p):
    out = subprocess.run(['ffmpeg', '-i', p, '-af', 'astats=metadata=0', '-f', 'null', '-'], capture_output=True, text=True).stderr
    w = [float(x) if x != '-inf' else -200 for x in re.findall(r'Channel: \d+.*?RMS level dB: (-?[\d.]+|-inf)', out, re.S)]
    return w
for f in sorted(os.listdir(QUELLE)):
    m = re.match(r'(\d+)_(\w+)\.\w+$', f)
    if not m: continue
    nr = int(m.group(1)); p = os.path.join(QUELLE, f); pg = kanal_pegel(p)
    kanal = 'c0' if len(pg) < 2 or pg[0] >= pg[1] else 'c1'
    ziel_lufs = -23 if nr in FLUESTERN else -18
    kette = (f'pan=mono|c0={kanal},highpass=f=80,'
             'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse,'
             'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.2,areverse,'
             'acompressor=threshold=-24dB:ratio=3:attack=5:release=120:makeup=4,'
             f'loudnorm=I={ziel_lufs}:TP=-2:LRA=7,aresample=48000,pan=stereo|c0=c0|c1=c0')
    aus = os.path.join(ZIEL, f'{m.group(1)}_{m.group(2)}.wav')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', p, '-af', kette, '-ar', '48000', aus], check=True)
    print(f, 'Kanal', kanal, 'Pegel', [round(x, 1) for x in pg], '->', os.path.basename(aus))
