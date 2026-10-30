# Flugbilder zusammensetzen: Himmel (mitgedreht) + Zimmer hinter dem runden Fenster (perspektivisch richtig) + Baumhaus darüber
import sys, os, json, numpy as np
from PIL import Image, ImageDraw
FLUG, HIMMEL, ZIMMER, ZIEL = sys.argv[1:5]; os.makedirs(ZIEL, exist_ok=True); R = .75; WB, HB = 960, 540
from PIL import ImageFilter
z0 = np.asarray(Image.open(ZIMMER).convert('RGB').resize((WB, HB), Image.LANCZOS)); px, py = WB//4, HB//4   # Zimmerbild 1,5-mal so groß: Ränder aus den Kanten fortgesetzt und weich
pad = Image.fromarray(np.pad(z0, ((py, py), (px, px), (0, 0)), mode='edge')).filter(ImageFilter.GaussianBlur(18)); pad.paste(Image.fromarray(z0), (px, py))
zimmer = pad; ZW, ZH = zimmer.size
def perspektive(src_pts, dst_pts):   # Koeffizienten für PIL: Ziel -> Quelle
    A = []; b = []
    for (x, y), (u, v) in zip(dst_pts, src_pts):
        A.append([x, y, 1, 0, 0, 0, -u*x, -u*y]); b.append(u); A.append([0, 0, 0, x, y, 1, -v*x, -v*y]); b.append(v)
    return np.linalg.solve(np.array(A, float), np.array(b, float)).tolist()
i = 0
while os.path.exists(f'{FLUG}/a_{i:04d}.json'):
    J = json.load(open(f'{FLUG}/a_{i:04d}.json')); ext = Image.open(f'{FLUG}/a_{i:04d}.png').convert('RGBA')
    # Himmel: der weit entfernte Punkt geradeaus wandert mit der Kameradrehung
    fx, fy = J['fern'][0]*R, J['fern'][1]*R; him = Image.open(f'{HIMMEL}/s_{i:04d}.png').convert('RGB').resize((1200, 675), Image.LANCZOS)
    bild = Image.new('RGB', (WB, HB)); bild.paste(him, (int(round(fx - WB/2 - 120)), int(round(fy - HB/2 - 67.5))))
    # Zimmer durchs Fenster: Ecken der gedachten Zimmer-Ebene hinter dem Fenster
    ecken = [(x*R, y*R) for x, y, z in J['ecken']]
    if all(z > 0 for x, y, z in J['ecken']):
        k = perspektive([(0, 0), (ZW, 0), (ZW, ZH), (0, ZH)], ecken)
        zw = zimmer.transform((WB, HB), Image.PERSPECTIVE, k, Image.BICUBIC)
        ring = J['ring']; maske = Image.new('L', (WB, HB), 0)
        if ring is None or sum(z > 0 for x, y, z in ring) < len(ring)*.8: maske = Image.new('L', (WB, HB), 255)   # Kamera steckt schon im Fenster
        else: ImageDraw.Draw(maske).polygon([(x*R, y*R) for x, y, z in ring if z > 0], fill=255); maske = maske.filter(ImageFilter.GaussianBlur(1))
        bild.paste(zw, (0, 0), maske)
    if J['ring'] is not None: bild = Image.alpha_composite(bild.convert('RGBA'), ext).convert('RGB')   # in der Öffnung: nur noch das Zimmer
    bild.save(f'{ZIEL}/f_{i:04d}.png'); i += 1
print('flug zusammengesetzt', i)
