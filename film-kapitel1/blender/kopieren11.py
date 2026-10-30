# Kameras, deren Hintergrund sich nicht geändert hat: Bilder aus Vorschau 10 übernehmen; der Rest wird neu gerechnet
import os, json, shutil, numpy as np
from PIL import Image
A, B = 'film_vs10h', 'film_vs11h'; gleich = set()
for f in os.listdir(B):
    if f.startswith('hintergrund_') and not f.startswith(('hintergrund_glimm_', 'hintergrund_dunkel_')) and os.path.exists(f'{A}/{f}'):
        a = np.asarray(Image.open(f'{A}/{f}').convert('RGB'), float); b = np.asarray(Image.open(f'{B}/{f}').convert('RGB'), float)
        d = (np.abs(a - b).max(2) > 40).mean()*100; print(f, round(d, 2))
        if d < .05: gleich.add(f[12:-4])
kop = neu = 0
for f in os.listdir(A):
    if f.startswith('bild_') and f.endswith('.json'):
        J = json.load(open(f'{A}/{f}')); i = f[5:9]
        if J['kamera'] not in gleich: neu += 1; continue
        kop += 1; shutil.copy(f'{A}/{f}', f'{B}/{f}')
        for j in range(len(J['rects'])): shutil.copy(f'{A}/bild_{i}_{j}.png', f'{B}/bild_{i}_{j}.png')
for k in gleich:
    for v in ('dunkel_', 'glimm_'):
        p = f'hintergrund_{v}{k}.png'
        if os.path.exists(f'{A}/{p}') and not os.path.exists(f'{B}/{p}'): shutil.copy(f'{A}/{p}', f'{B}/{p}')
print('gleich', sorted(gleich), 'kopiert', kop, 'neu', neu)
