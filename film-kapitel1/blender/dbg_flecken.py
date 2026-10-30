import bpy, sys, json, os
from mathutils import Vector
sys.path.insert(0, os.getcwd()); import figuren as FG
bpy.ops.wm.read_factory_settings(use_empty=True); S = bpy.context.scene
CAM_D=10.0
def W(px, py, Y): k = (CAM_D + Y)/CAM_D; return Vector((6.4 + (px - 640)/100*k, Y, 2.82 + (360 - py)/100*k))
def kY(Y): return (CAM_D + Y)/CAM_D
d = json.load(open('film_voll2.json')); E = d['erstes']['figuren']['prof']
obs,_,_ = FG.figur_bauen(S,'prof',E,d['FR'],W,kY,fell=False)
FG.bademantel(S,obs,E)
KM=obs[0].matrix_world; inv=KM.inverted()
for i,(o,t) in enumerate(zip(obs,E['teile'])):
    c=inv@o.matrix_world.translation
    if not o.hide_render and max(t['root'][:3])<.3: print(i,o.name,[round(x,2) for x in t['root'][:3]],t['fur'],round(c.length,2),[round(x,2) for x in c],[round(x,3) for x in o.matrix_world.to_scale()])
