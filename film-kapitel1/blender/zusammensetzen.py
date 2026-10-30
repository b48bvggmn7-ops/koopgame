# Filmbild = Hintergrund (einmal, hohe Qualität) + bewegte Ausschnitte (weich eingeblendet) + Himmel hinter dem Fenster + Wackeln
import sys, os, json, math, numpy as np
from PIL import Image
QUELLE, HIMMEL, ZIEL = sys.argv[1], sys.argv[2], sys.argv[3]; VON = int(sys.argv[4]) if len(sys.argv) > 4 else 0
os.makedirs(ZIEL, exist_ok=True); R = float(os.environ.get('MASSSTAB', '.75')); WB, HB = int(1280*R), int(720*R); FEDER = int(round(14*R/.75))
# Wackeln klingt wie im Spiel ab (1,6 pro Sekunde ab dem Einschlag); in den Aufzeichnungsdaten bleibt es stehen
_jp = os.environ.get('FILMJSON', QUELLE.rstrip('/') + '.json')
_bb = json.load(open(_jp))['bilder'] if os.path.exists(_jp) else []; _w = [B['wackeln'] for B in _bb]; _e = [B.get('einschlag', 0) for B in _bb]
_i0 = next((k for k, w in enumerate(_w) if w > 0), None)
def wackeln(i): return 0 if _i0 is None or i < _i0 else max(0, _w[_i0] - (i - _i0)/24*1.6)
_bgs = {}
def hintergrund(name):   # je Kamera (und nach dem Einschlag mit Nachglühen) ein eigener Hintergrund
    if name not in _bgs:
        p = f'{QUELLE}/hintergrund_{name}.png'
        if not os.path.exists(p): p = f'{QUELLE}/hintergrund.png'
        _bgs[name] = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)/255
    return _bgs[name]
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
        J = json.load(open(f'{QUELLE}/bild_{i:04d}.json')); bild = hintergrund(J.get('hintergrund', 'tot')).copy()
        for j, (x0, y0, x1, y1) in enumerate(J['rects']):
            c = np.asarray(Image.open(f'{QUELLE}/bild_{i:04d}_{j}.png').convert('RGBA')).astype(np.float32)/255
            px, py = int(round(x0*R)), int(round(y0*R)); h, w = c.shape[:2]; h = min(h, HB - py); w = min(w, WB - px); c = c[:h, :w]
            m = maske(h, w, px, py) if not J['voll'] else 1
            bild[py:py + h, px:px + w] = bild[py:py + h, px:px + w]*(1 - m) + c*m
        him = Image.open(f'{HIMMEL}/h_{i:04d}.png').convert('RGBA')
        if him.size != (WB, HB): him = him.resize((WB, HB), Image.LANCZOS)
        if J.get('kamera', 'tot') != 'tot':   # andere Kamera: Himmel so verschieben/skalieren, dass er hinter dem Fenster an derselben Stelle sitzt
            (cx, cy, r), (tx, ty, tr) = J['fenster'], J['fenster_tot']; k = r/tr
            him = him.transform(him.size, Image.AFFINE, (1/k, 0, tx*R - cx*R/k, 0, 1/k, ty*R - cy*R/k), Image.BICUBIC)
        sky = np.asarray(him).astype(np.float32)/255
        a = bild[..., 3:4]; rgb = bild[..., :3]*a + sky[..., :3]*sky[..., 3:4]*(1 - a)
        out = Image.fromarray((np.clip(rgb, 0, 1)*255 + .5).astype(np.uint8))
        w_ = wackeln(i)*(1 if J.get('kamera', 'tot') == 'tot' else .7)   # Einschlag rüttelt in jeder Einstellung
        bl = .65*max(0, (_e[i] - .55)/.45)**1.5 if i < len(_e) else 0   # greller Blitz beim Einschlag
        if bl > .002: a0 = np.asarray(out).astype(np.float32); out = Image.fromarray(np.clip(a0*(1 - bl) + np.array([255, 236, 200])*bl, 0, 255).astype(np.uint8))
        if w_ > .001:
            t = J['t']; dx, dy = math.sin(t*53)*7*w_*R, math.cos(t*61)*5*w_*R; s = 1.02
            out = out.transform(out.size, Image.AFFINE, (1/s, 0, (WB - WB/s)/2 - dx/s, 0, 1/s, (HB - HB/s)/2 - dy/s), Image.BICUBIC)
        a_ = np.asarray(out).copy(); bh = 0 if os.environ.get('OHNE_BALKEN') else int(round(62*R)); a_[:bh] = 0; a_[HB - bh:] = 0; out = Image.fromarray(a_)   # Kino-Balken wie im Vorspann
        out.save(ziel)
    i += 1
print('zusammengesetzt bis', i - 1, 'davon gefuellt', gefuellt)
