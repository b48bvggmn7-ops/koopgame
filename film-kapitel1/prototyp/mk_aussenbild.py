# Gerenderte Außen-Ebenen (Blender) als WebP in src/aussenbild.js
import base64, io, json, os
from PIL import Image, ImageFilter
B = '/tmp/claude-0/-home-user-koopgame/f80d235d-472d-51e4-84ca-119d3eca1c23/scratchpad/blender/'
def webp(datei, q, blur=0):
    im = Image.open(B + datei).convert('RGBA')
    if datei.startswith('a_haus_'):   # Nahaufnahmen: Ränder weich ausblenden, damit keine Kante zum Grundbild zu sehen ist
        import numpy as np
        ar = np.asarray(im).astype(np.float32); h, w = ar.shape[:2]; R = max(8, w//14)
        ex = np.minimum(np.arange(w), np.arange(w)[::-1]); ey = np.minimum(np.arange(h), np.arange(h)[::-1])
        fe = np.clip(np.minimum(ex[None, :], ey[:, None])/R, 0, 1); ar[..., 3] *= fe; im = Image.fromarray(ar.astype(np.uint8))
    if blur: im = im.filter(ImageFilter.GaussianBlur(blur))
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6); print(datei, im.size, len(buf.getvalue())//1024, 'KB')
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
d = {'fern': webp('a_fern.png', 80, 1.5), 'mitte': webp('a_mitte.png', 82, 1), 'haus': webp('a_haus.png', 88), 'busch': webp('a_busch.png', 84, 2.5), 'blatt': webp('a_blatt.png', 84, 4),
     'mittel': webp('a_haus_mittel.png', 86), 'nah': webp('a_haus_nah.png', 86), 'pkt': json.load(open(B + 'a_haus.json'))}
d['r_mittel'] = [505, 257, 905, 487]; d['r_nah'] = [630, 327, 780, 417]
js = '''// Gerendertes Häuschen von außen (Blender/Cycles) in Tiefen-Ebenen + scharfe Nahaufnahmen fürs Hineinzoomen
const AUSSEN = (() => { const d = %s;
  const Z = {bereit: false, pkt: d.pkt, r_mittel: d.r_mittel, r_nah: d.r_nah}; let n = 0, fertig; const namen = ['fern', 'mitte', 'haus', 'busch', 'blatt', 'mittel', 'nah'];
  Z.geladen = new Promise(r => fertig = r);
  for(const k of namen){ const im = new Image(); im.onload = () => { if(++n === namen.length){ Z.bereit = true; fertig(); } }; im.src = d[k]; Z[k] = im; }
  return Z; })();
''' % json.dumps(d)
open('src/aussenbild.js', 'w').write(js); print('aussenbild.js', len(js)//1024, 'KB')
