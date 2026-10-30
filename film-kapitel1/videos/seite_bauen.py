import base64, json, os, io
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); B = H + '/../blender'
d = json.load(open(H + '/info.json'))['dauer']
st = io.BytesIO(); Image.open(B + '/flug_fertig/f_0000.png').convert('RGB').resize((960, 540)).save(st, 'JPEG', quality=78)
s = open(H + '/vorlage.html').read()
s = s.replace('__VIDEO__', 'data:video/mp4;base64,' + base64.b64encode(open(H + '/film.mp4', 'rb').read()).decode())
s = s.replace('__STANDBILD__', 'data:image/jpeg;base64,' + base64.b64encode(st.getvalue()).decode())
s = s.replace('__DAUER__', f'{int(d//60)}:{int(d%60):02d} Minuten').replace('__VTT__', json.dumps(open(H + '/film.vtt').read()))
open(H + '/kapitel1_film.html', 'w').write(s); print('seite', os.path.getsize(H + '/kapitel1_film.html')//1024, 'KB')
