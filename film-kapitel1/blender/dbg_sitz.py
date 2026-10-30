import bpy, sys, json, os
from mathutils import Vector
sys.path.insert(0, os.getcwd()); import figuren as FG
bpy.ops.wm.read_factory_settings(use_empty=True); S = bpy.context.scene
CAM_D=10.0
def W(px, py, Y): k = (CAM_D + Y)/CAM_D; return Vector((6.4 + (px - 640)/100*k, Y, 2.82 + (360 - py)/100*k))
def kY(Y): return (CAM_D + Y)/CAM_D
d = json.load(open('film_voll2.json')); E = d['erstes']['figuren']['prof']
obs,_,_ = FG.figur_bauen(S,'prof',E,d['FR'],W,kY,fell=False)
mt=FG.bademantel(S,obs,E)
for BI in (0,420,900):
    mats,cc=FG.matrizen('prof',d['bilder'][BI]['figuren']['prof'],d['FR'],W,kY)
    for o,(M,v) in zip(obs,mats): o.matrix_world=M
    bpy.context.view_layer.update()
    for nm,ob in (('koerper',obs[0]),('mantel',mt)):
        ps=[ob.matrix_world@Vector(c) for c in ob.bound_box]
        print(BI,nm,[round(min(p[i] for p in ps),2) for i in range(3)],[round(max(p[i] for p in ps),2) for i in range(3)])
    ps=[o.matrix_world@Vector(c) for o in obs if not o.hide_render for c in o.bound_box]
    print(BI,'alle',[round(min(p[i] for p in ps),2) for i in range(3)],[round(max(p[i] for p in ps),2) for i in range(3)])
print('SERIE')
for BI in range(0,len(d['bilder']),40):
    mats,cc=FG.matrizen('prof',d['bilder'][BI]['figuren']['prof'],d['FR'],W,kY)
    obs[0].matrix_world=mats[0][0]; bpy.context.view_layer.update()
    ps=[obs[0].matrix_world@Vector(c) for c in obs[0].bound_box]
    print('S',BI,round(min(p[2] for p in ps),2),round(min(p[0] for p in ps),2),round(max(p[0] for p in ps),2),round(max(p[1] for p in ps),2))
