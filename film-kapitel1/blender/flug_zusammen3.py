# Flugbilder zusammensetzen (Fassung 3: echtes Fenster mit Laibung, Kreuz und Scheibe):
# Himmel + Zimmer (mitbewegte Zimmerkamera) in der Fensteröffnung + Baumhaus davor; am Schluss Überblendung ins erste Filmbild
import sys, os, json
from PIL import Image, ImageDraw, ImageFilter
FLUG, HIMMEL, INNEN, HIMMEL_INNEN, FILM0, ZIEL = sys.argv[1:7]; os.makedirs(ZIEL, exist_ok=True)
i = 0; film0 = None; HAUS = int(os.environ.get('HAUS_BILDER', '0'))   # HAUS_BILDER=n: nur das stehende Haus (Bild 0) n Bilder lang, Himmel läuft weiter
while (i < HAUS) if HAUS else (os.path.exists(f'{FLUG}/a_{i:04d}.json') and os.path.exists(f'{INNEN}/i_{i:04d}.png')):
    q = 0 if HAUS else i
    J = json.load(open(f'{FLUG}/a_{q:04d}.json')); ext = Image.open(f'{FLUG}/a_{q:04d}.png').convert('RGBA'); WB, HB = ext.size; R = WB/1280
    fx, fy = J['fern'][0]*R, J['fern'][1]*R; sw, sh = int(WB*2.2), int(HB*2.2)
    hp = f'{HIMMEL}/s_{i:04d}.png'
    if not os.path.exists(hp): hp = sorted(f'{HIMMEL}/{f}' for f in os.listdir(HIMMEL) if f.startswith('s_'))[-1]
    him = Image.open(hp).convert('RGB').resize((sw, sh), Image.LANCZOS)
    bild = Image.new('RGB', (WB, HB)); bild.paste(him, (int(round(fx - sw/2)), int(round(fy - sh/2))))
    inn = Image.open(f'{INNEN}/i_{q:04d}.png').convert('RGBA').resize((WB, HB), Image.LANCZOS); IJ = json.load(open(f'{INNEN}/i_{q:04d}.json'))
    hi = Image.open(HIMMEL_INNEN).convert('RGBA'); (cx, cy, r), (tx, ty, tr) = IJ['fenster'], IJ['fenster_tot']; k = r/tr; Rh = hi.size[0]/1280
    hi = hi.transform(hi.size, Image.AFFINE, (1/k, 0, tx*Rh - cx*Rh/k, 0, 1/k, ty*Rh - cy*Rh/k), Image.BICUBIC).resize((WB, HB), Image.LANCZOS)
    zimmer = Image.alpha_composite(Image.alpha_composite(Image.new('RGBA', (WB, HB), (0, 0, 0, 255)), hi), inn).convert('RGB')
    oe = [(x*R, y*R) for x, y, z in J['oeffnung'] if z > 0]
    maske = Image.new('L', (WB, HB), 0); ImageDraw.Draw(maske).polygon(oe, fill=255); maske = maske.filter(ImageFilter.MaxFilter(3))
    bild.paste(zimmer, (0, 0), maske)
    bild = Image.alpha_composite(bild.convert('RGBA'), ext).convert('RGB')
    w = J.get('ueberblendung', 0)
    if w > 0: w = w*w*(3 - 2*w); bild = Image.blend(bild, zimmer, w)   # Baumhaus blendet aus, das Zimmer zoomt dabei auf die Totale (= erstes Filmbild)
    bild.save(f'{ZIEL}/f_{i:04d}.png'); i += 1
print('flug zusammengesetzt', i)
