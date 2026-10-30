# Schatten-Faktor je Figur = (Zimmer mit Platzhalter) / (Zimmer ohne). Im Spiel per 'multiply' unter die Figur gelegt.
import numpy as np, json, sys
from PIL import Image, ImageFilter
B = '/tmp/claude-0/-home-user-koopgame/f80d235d-472d-51e4-84ca-119d3eca1c23/scratchpad/blender/'
ohne = np.asarray(Image.open(B + 'hinten.png').convert('RGBA')).astype(np.float32)/255
SK = ohne.shape[1]/1280
for fig in sys.argv[1:]:
    mit = np.asarray(Image.open(B + f'sch_{fig}.png').convert('RGBA')).astype(np.float32)/255
    x0, y0, x1, y1 = [int(round(v*SK)) for v in json.load(open(B + f'sch_{fig}_bereich.json'))]
    r = np.ones_like(ohne[..., :3])
    a, b = mit[y0:y1, x0:x1, :3], ohne[y0:y1, x0:x1, :3]
    q = np.clip((a + .004)/(b + .004), 0, 1)
    q[(ohne[y0:y1, x0:x1, 3] < .5)] = 1
    # zum Rand des gerenderten Bereichs weich auf 1 auslaufen lassen (sonst sieht man eine Kante)
    h, w = q.shape[:2]; R = int(30*SK)
    ex = np.minimum(np.arange(w), np.arange(w)[::-1]); ey = np.minimum(np.arange(h), np.arange(h)[::-1])
    if x0 == 0: ex = np.maximum(ex, R) if False else np.where(np.arange(w) < w/2, R, ex)
    if y1 >= ohne.shape[0]: ey = np.where(np.arange(h) > h/2, R, ey)
    fe = np.clip(np.minimum(ex[None, :], ey[:, None])/R, 0, 1)[..., None]
    q = 1 - (1 - q)*fe
    r[y0:y1, x0:x1] = q
    im = Image.fromarray((r*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6*SK))
    r = np.asarray(im).astype(np.float32)/255; r[r > .975] = 1
    m = (r < .999).any(axis=2); ys, xs = np.where(m)
    cx0, cx1, cy0, cy1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    Image.fromarray((r[cy0:cy1, cx0:cx1]*255).astype(np.uint8)).save(B + f'faktor_{fig}.png')
    json.dump([cx0/SK, cy0/SK, (cx1 - cx0)/SK, (cy1 - cy0)/SK], open(B + f'faktor_{fig}.json', 'w'))
    vor = (ohne[..., :3]*r); Image.fromarray((np.clip(vor, 0, 1)*255).astype(np.uint8)).save(B + f'vorschau_{fig}.png')
    print(fig, 'Bereich', cx0, cy0, cx1, cy1, 'min', r.min().round(2))
