# Cartoon-Schleichen: gezupfte Saite (Pizzicato) per Karplus-Strong, je Figur zwei Töne im Wechsel
import numpy as np, wave, sys
SR = 48000; rng = np.random.default_rng(3)
def pizz(f, dauer=.45):
    n = int(SR*dauer); p = int(round(SR/f)); buf = rng.uniform(-1, 1, p)
    buf = np.convolve(buf, np.ones(6)/6, 'same')   # weicher Anschlag (Finger statt Plektrum)
    out = np.zeros(n); d = .996
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = d*.5*(buf[i % p] + buf[(i + 1) % p])
    # Körper: leichte Resonanz, schneller Abfall wie beim Kontrabass-Pizzicato
    t = np.arange(n)/SR; out *= np.exp(-t*7.5); out[:int(.002*SR)] *= np.linspace(0, 1, int(.002*SR))
    return out/np.abs(out).max()*.8
def schreib(name, x):
    x = np.clip(x, -1, 1); st = (np.stack([x, x], 1)*32767).astype(np.int16)
    w = wave.open(name, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes()); w.close()
TOENE = {'affe': (196.0, 293.7), 'schwein': (293.7, 440.0)}   # Affe G3/D4, Schweinchen D4/A4 (höher)
for k, fs in TOENE.items():
    for j, f in enumerate(fs): schreib(f'{sys.argv[1]}/{k}{j}.wav', pizz(f))
print('ok')
