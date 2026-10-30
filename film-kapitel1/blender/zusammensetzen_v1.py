# Filmbild = Hintergrund (einmal, hohe Qualität) + bewegte Ausschnitte (weich eingeblendet) + Himmel hinter dem Fenster + Wackeln
import sys, os, json, math, numpy as np
from PIL import Image
QUELLE, HIMMEL, ZIEL = sys.argv[1], sys.argv[2], sys.argv[3]; VON = int(sys.argv[4]) if len(sys.argv) > 4 else 0
os.makedirs(ZIEL, exist_ok=True); R = .75; WB, HB = 960, 540; FEDER = 14
# Wackeln klingt wie im Spiel ab (1,6 pro Sekunde ab dem Einschlag); in den Aufzeichnungsdaten bleibt es stehen
_w = [B['wackeln'] for B in json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'film_voll.json')))['bilder']]
_i0 = next((k for k, w in enumerate(_w) if w > 0), None)
def wackeln(i): return 0 if _i0 is None or i < _i0 else max(0, _w[_i0] - (i - _i0)/24*1.6)
bg = np.asarray(Image.open(f'{QUELLE}/hintergrund.png').convert('RGBA')).astype(np.float32)/255
def maske(h, w, x0, y0):
    yy = np.arange(h)[:, None]; xx = np.arange(w)[None, :]
    def rand(a, n, am_rand): return np.ones_like(a, np.float32) if am_rand else np.clip((a + .5)/FEDER, 0, 1)
    mx = np.minimum(rand(xx, w, x0 == 0), rand(w - 1 - xx, w, x0 + w >= WB)); my = np.minimum(rand(yy, h, y0 == 0), rand(h - 1 - yy, h, y0 + h >= HB))
    m = np.minimum(mx, my); return (m*m*(3 - 2*m))[..., None]
N = int(sys.argv[5]) if len(sys.argv) > 5 else None   # mit N: Lücken (noch nicht gerenderte Bilder) mit dem Vorgänger füllen
import shutil
i = VON; gefuellt = 0
while (i < N) if N else os.path.exists(f'{QUELLE}/bild_{i:04d}.json'):
    ziel = f'{ZIEL}/f_{i:04d}.png'
    if N and not os.path.exists(f'{QUELLE}/bild_{i:04d}.json'):
        if os.path.exists(ziel): os.remove(ziel)
        shutil.copy(f'{ZIEL}/f_{i - 1:04d}.png', ziel); open(ziel + '.luecke', 'w').close(); gefuellt += 1; i += 1; continue
    if N and os.path.exists(ziel + '.luecke'): os.remove(ziel); os.remove(ziel + '.luecke')
    if not os.path.exists(ziel):
        J = json.load(open(f'{QUELLE}/bild_{i:04d}.json')); bild = bg.copy()
        for j, (x0, y0, x1, y1) in enumerate(J['rects']):
            c = np.asarray(Image.open(f'{QUELLE}/bild_{i:04d}_{j}.png').convert('RGBA')).astype(np.float32)/255
            px, py = int(round(x0*R)), int(round(y0*R)); h, w = c.shape[:2]; h = min(h, HB - py); w = min(w, WB - px); c = c[:h, :w]
            m = maske(h, w, px, py) if not J['voll'] else 1
            bild[py:py + h, px:px + w] = bild[py:py + h, px:px + w]*(1 - m) + c*m
        sky = np.asarray(Image.open(f'{HIMMEL}/h_{i:04d}.png').convert('RGBA')).astype(np.float32)/255
        a = bild[..., 3:4]; rgb = bild[..., :3]*a + sky[..., :3]*sky[..., 3:4]*(1 - a)
        out = Image.fromarray((np.clip(rgb, 0, 1)*255 + .5).astype(np.uint8))
        w_ = wackeln(i)
        if w_ > .001:
            t = J['t']; dx, dy = math.sin(t*53)*7*w_*R, math.cos(t*61)*5*w_*R; s = 1.02
            out = out.transform(out.size, Image.AFFINE, (1/s, 0, (WB - WB/s)/2 - dx/s, 0, 1/s, (HB - HB/s)/2 - dy/s), Image.BICUBIC)
        a_ = np.asarray(out).copy(); bh = 0 if os.environ.get('OHNE_BALKEN') else int(round(62*R)); a_[:bh] = 0; a_[HB - bh:] = 0; out = Image.fromarray(a_)   # Kino-Balken wie im Vorspann
        out.save(ziel)
    i += 1
print('zusammengesetzt bis', i - 1, 'davon gefuellt', gefuellt)
