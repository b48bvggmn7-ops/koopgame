# Einzelne Figur aus einem Filmbild ansehen (von mehreren Seiten), schnell und grob
import bpy, sys, json, math, os
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import figuren as FG
A = sys.argv[sys.argv.index('--') + 1:]; JS, BI, NAME, OUT = A[0], int(A[1]), A[2], A[3]
bpy.ops.wm.read_factory_settings(use_empty=True); S = bpy.context.scene
CAM_D, CAM_Z = 10.0, 2.82
def W(px, py, Y): k = (CAM_D + Y)/CAM_D; return Vector((6.4 + (px - 640)/100*k, Y, CAM_Z + (360 - py)/100*k))
def kY(Y): return (CAM_D + Y)/CAM_D
d = json.load(open(JS)); E = d['erstes']['figuren'][NAME]; B = d['bilder'][BI]['figuren'][NAME]
obs, _, _ = FG.figur_bauen(S, NAME, E, d['FR'], W, kY, fell=os.environ.get('FELL', '0') == '1')
if NAME == 'prof' and os.environ.get('MANTEL', '1') == '1': FG.bademantel(S, obs, E)
vers = {o.name for o in obs if o.hide_render}
mats, cc = FG.matrizen(NAME, B, d['FR'], W, kY)
for o, (M, v) in zip(obs, mats): o.matrix_world = M; o.hide_render = (not v) or o.name in vers
bpy.context.view_layer.update()
pts = [o.matrix_world @ Vector(c) for o in obs if not o.hide_render for c in o.bound_box]
mitte = sum(pts, Vector())/len(pts); gr = max((p - mitte).length for p in pts)
w = bpy.data.worlds.new('w'); S.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.35, .35, .4, 1)
bpy.ops.object.light_add(type='SUN'); bpy.context.object.rotation_euler = (.8, .2, .6); bpy.context.object.data.energy = 3
cam = bpy.data.cameras.new('c'); cam.lens = 50; co = bpy.data.objects.new('c', cam); S.collection.objects.link(co); S.camera = co
S.render.engine = 'CYCLES'; S.cycles.samples = 16; S.cycles.use_denoising = True; S.render.resolution_x = 480; S.render.resolution_y = 480
for i, a in enumerate([float(x) for x in os.environ.get('WINKEL', '0,90,180,270').split(',')]):
    r = math.radians(a); co.location = mitte + Vector((math.sin(r), -math.cos(r), .25))*gr*3.2
    co.rotation_euler = (mitte - co.location).to_track_quat('-Z', 'Y').to_euler(); S.render.filepath = f'{OUT}_{i}.png'; bpy.ops.render.render(write_still=True)
print('fertig')
