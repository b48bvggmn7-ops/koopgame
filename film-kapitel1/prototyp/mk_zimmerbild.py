# Gerenderte Zimmer-Ebenen (Blender) als WebP in src/zimmerbild.js packen
import base64, io, json, os, glob
from PIL import Image
B = '/tmp/claude-0/-home-user-koopgame/f80d235d-472d-51e4-84ca-119d3eca1c23/scratchpad/blender/'
def webp(datei, q, rgb=False):
    im = Image.open(B + datei).convert('RGB' if rgb else 'RGBA'); buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode(), len(buf.getvalue())//1024
gross = 0
def eb(name, q=86, rgb=False):
    global gross
    src, kb = webp(name + '.png', q, rgb); gross += kb; return {'src': src, 'r': json.load(open(B + name + '.json'))}
haupt = 'r_hinten' if os.path.exists(B + 'r_hinten.png') else 'hinten'
d = {'hinten': webp(haupt + '.png', 88)[0], 'vorne': webp('vorne.png', 90)[0], 'pkt': json.load(open(B + haupt + '.json')), 'ebene': {}}
if os.path.exists(B + 'r_sofa_s.png'):
    E = d['ebene']
    for n in ('sofa_s', 'sofa_sa', 'sessel_p'): E[n] = eb('r_' + n, 86)
    for n in ('polster_s', 'polster_sa', 'polster_p'):
        if os.path.exists(B + 'r_' + n + '.png'): E[n] = eb('r_' + n, 88)
    for n in ('keks', 'buendel', 'zettel_liegt', 'spr_keks0', 'spr_keks1', 'spr_keks2', 'spr_keks3', 'spr_zettel', 'spr_buendel'): E[n] = eb('r_' + n, 90)
    E['decke'] = []
    for f in sorted(glob.glob(B + 'r_decke_*.png')):
        n = os.path.basename(f)[:-4]; src, kb = webp(n + '.png', 86); gross += kb; E['decke'].append({'src': src, 'r': json.load(open(B + 'r_decke.json'))})
print('Ebenen', gross, 'KB')
js = '''// Gerendertes Sternenzimmer (Blender/Cycles): hinten = Zimmer (Fenster durchsichtig), vorne = Armlehnen vor den Figuren,
// ebene = Ausschnitte (Sofa/Sessel mit Delle + Schatten, Kekse, Zettel, Decke Bild für Bild) und Einzelbilder für Dinge in der Pfote
const ZIMMER = (() => { const d = %s;
  const Z = {daten: true, bereit: false, pkt: d.pkt}; let n = 0, alle = 2, fertig;
  Z.geladen = new Promise(r => fertig = r);
  const lade = src => { const im = new Image(); im.onload = () => { if(++n === alle){ Z.bereit = true; fertig(); } }; im.src = src; return im; };
  const E = d.ebene; for(const k in E) alle += Array.isArray(E[k]) ? E[k].length : 1;
  Z.hinten = lade(d.hinten); Z.vorne = lade(d.vorne);
  if(Object.keys(E).length){ Z.ebene = {}; for(const k in E) Z.ebene[k] = Array.isArray(E[k]) ? E[k].map(e => ({bild: lade(e.src), r: e.r})) : {bild: lade(E[k].src), r: E[k].r}; }
  return Z; })();
''' % json.dumps(d)
open('src/zimmerbild.js', 'w').write(js); print('zimmerbild.js', len(js)//1024, 'KB')
