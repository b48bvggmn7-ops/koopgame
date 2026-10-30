# Flugbilder zusammensetzen (Fassung mit echtem Zimmer-Blick): Himmel + Zimmer (aus mitbewegter Zimmerkamera gerendert) hinter dem Fenster + Baumhaus mit Glasscheibe davor
import sys, os, json
from PIL import Image, ImageDraw, ImageFilter
FLUG, HIMMEL, INNEN, HIMMEL_INNEN, ZIEL = sys.argv[1:6]; os.makedirs(ZIEL, exist_ok=True)
i = 0
while os.path.exists(f'{FLUG}/a_{i:04d}.json') and os.path.exists(f'{INNEN}/i_{i:04d}.png'):
    J = json.load(open(f'{FLUG}/a_{i:04d}.json')); ext = Image.open(f'{FLUG}/a_{i:04d}.png').convert('RGBA'); WB, HB = ext.size; R = WB/1280
    fx, fy = J['fern'][0]*R, J['fern'][1]*R; sw, sh = int(WB*1.25), int(HB*1.25)
    him = Image.open(f'{HIMMEL}/s_{i:04d}.png').convert('RGB').resize((sw, sh), Image.LANCZOS)
    bild = Image.new('RGB', (WB, HB)); bild.paste(him, (int(round(fx - sw/2)), int(round(fy - sh/2))))
    # Zimmer aus der mitbewegten Kamera, dahinter sein eigener Himmel im runden Zimmerfenster
    inn = Image.open(f'{INNEN}/i_{i:04d}.png').convert('RGBA').resize((WB, HB), Image.LANCZOS); IJ = json.load(open(f'{INNEN}/i_{i:04d}.json'))
    hi = Image.open(HIMMEL_INNEN).convert('RGBA'); (cx, cy, r), (tx, ty, tr) = IJ['fenster'], IJ['fenster_tot']; k = r/tr; Rh = hi.size[0]/1280
    hi = hi.transform(hi.size, Image.AFFINE, (1/k, 0, tx*Rh - cx*Rh/k, 0, 1/k, ty*Rh - cy*Rh/k), Image.BICUBIC).resize((WB, HB), Image.LANCZOS)
    zimmer = Image.alpha_composite(Image.alpha_composite(Image.new('RGBA', (WB, HB), (0, 0, 0, 255)), hi), inn).convert('RGB')
    ring = J['ring']
    if ring is None or sum(z > 0 for x, y, z in ring) < len(ring)*.8: bild = zimmer   # Kamera steckt im Fenster: nur noch das Zimmer
    else:
        maske = Image.new('L', (WB, HB), 0); ImageDraw.Draw(maske).polygon([(x*R, y*R) for x, y, z in ring if z > 0], fill=255)
        bild.paste(zimmer, (0, 0), maske.filter(ImageFilter.GaussianBlur(1)))
        bild = Image.alpha_composite(bild.convert('RGBA'), ext).convert('RGB')
    bild.save(f'{ZIEL}/f_{i:04d}.png'); i += 1
print('flug zusammengesetzt', i)
