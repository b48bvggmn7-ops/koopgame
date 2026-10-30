# Schatten der Figuren: Platzhalter (aus den echten Kugel-Teilen der 3D-Figuren) in die Zimmer-Szene stellen,
# für die Kamera unsichtbar, aber sie werfen Schatten. Rendern nur im Bereich um die Figur.
import bpy, json, sys, math
from mathutils import Matrix, Vector
A = sys.argv[sys.argv.index('--') + 1:]
OUT, FIGUR, SAMPLES, RES = A[0], A[1], int(A[2]), float(A[3])
D = json.load(open(A[4]))
sys.argv = [sys.argv[0], '--', OUT, str(SAMPLES), str(RES), 'schatten']
src = open(A[5]).read().replace("bpy.ops.render.render(write_still=True)\nprint('fertig', OUT)", "")
exec(compile(src, 'zimmer.py', 'exec'))
FR = D['FR']; F = D[FIGUR]; b = F['bild']; s_px = b['w']/(FR['x1'] - FR['x0'])
Yd = {'schwein': .35, 'affe': .35, 'prof': .45}[FIGUR]; k = (10 + Yd)/10; cc = s_px/100*k
Am = Matrix(((cc, 0, 0), (0, 0, -cc), (0, cc, 0)))
off = Vector((6.4 + (b['x'] - FR['x0']*s_px - 640)/100*k, Yd, 2.82 + (360 - b['y'] - FR['y1']*s_px)/100*k))
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=24, ring_count=12); vorlage = bpy.context.object; me = vorlage.data
bpy.data.objects.remove(vorlage)
xs, ys = [], []
for i, w in enumerate(F['teile']):
    W3 = Matrix(((w[0], w[4], w[8]), (w[1], w[5], w[9]), (w[2], w[6], w[10]))); t = Vector((w[12], w[13], w[14]))
    M3 = Am @ W3; T = Am @ t + off
    o = bpy.data.objects.new(f'platz{i}', me); S.collection.objects.link(o)
    o.matrix_world = Matrix(((*M3[0], T.x), (*M3[1], T.y), (*M3[2], T.z), (0, 0, 0, 1)))
    o.visible_camera = False; o.visible_glossy = False
    xs.append(b['x'] + (w[12] - FR['x0'])*s_px); ys.append(b['y'] + (FR['y1'] - w[13])*s_px)
x0, x1 = max(0, min(xs) - 230), min(1280, max(xs) + 260); y0, y1 = max(0, min(ys) - 140), 720
S.render.use_border = True; S.render.use_crop_to_border = False
S.render.border_min_x = x0/1280; S.render.border_max_x = x1/1280; S.render.border_min_y = 1 - y1/720; S.render.border_max_y = 1 - y0/720
json.dump([x0, y0, x1, y1], open(OUT.replace('.png', '_bereich.json'), 'w'))
bpy.ops.render.render(write_still=True)
print('fertig', OUT)
