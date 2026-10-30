# Rendert die Filmbilder, sobald die Aufzeichnung sie liefert. Erst alle geraden Bilder (ganzer Film in 12 Bildern/s),
# dann die ungeraden dazwischen. Zwei Blender-Prozesse parallel; Fertiges wird übersprungen.
import os, json, time, shutil, subprocess
H = os.path.dirname(os.path.abspath(__file__)); Z = H + '/film_voll2'; ENDE = H + '/film_voll2.json'; TEIL = ENDE + '.teil'
def erstes_fehlendes(par, n):
    for i in range(par, n, 2):
        if not os.path.exists(f'{Z}/bild_{i:04d}.json'): return i
    return None
def blender(von, bis, reste):
    ps = []
    for rest in reste:
        env = dict(os.environ, FILMJSON=H + '/film_stand2.json', ZIELDIR=Z, SAMPLES='12', BG_SAMPLES='48', KINDER='5', VON=str(von), BIS=str(bis), TEILE='4', REST=str(rest), THREADS='2')
        ps.append(subprocess.Popen([H + '/../bvenv/bin/python', 'requisiten.py', '--', Z + f'/x{rest}.png', 'filmvoll', '10', '.75', H + '/platzhalter.json', H + '/zimmer.py'],
                       cwd=H, env=env, stdout=open(H + f'/render_blender{rest % 2}.txt', 'a'), stderr=subprocess.STDOUT))
    rc = [q.wait() for q in ps]; print('blender ende', reste, rc, time.strftime('%H:%M:%S'), flush=True)
    if any(rc): time.sleep(10)
while True:
    final = os.path.exists(ENDE); quelle = ENDE if final else TEIL
    if not os.path.exists(quelle): time.sleep(30); continue
    shutil.copy(quelle, H + '/film_stand2.json')
    try: n = len(json.load(open(H + '/film_stand2.json'))['bilder'])
    except Exception: time.sleep(20); continue
    g, u = erstes_fehlendes(0, n), erstes_fehlendes(1, n)
    print('stand', n, 'gerade ab', g, 'ungerade ab', u, 'final', final, time.strftime('%H:%M:%S'), flush=True)
    if g is not None and (final or n - g >= 80): blender(g, n - 1, (0, 2)); continue
    if g is None and final and u is not None: blender(u, n - 1, (1, 3)); continue
    if final and g is None and u is None: print('ALLES FERTIG', flush=True); break
    time.sleep(30)
