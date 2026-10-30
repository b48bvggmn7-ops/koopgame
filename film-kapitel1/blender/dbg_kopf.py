import bpy, sys, json, os, math
from mathutils import Vector
sys.path.insert(0, os.getcwd()); import figuren as FG
bpy.ops.wm.read_factory_settings(use_empty=True); S = bpy.context.scene
def W(px, py, Y): k = (10 + Y)/10; return Vector((6.4 + (px - 640)/100*k, Y, 2.82 + (360 - py)/100*k))
def kY(Y): return (10 + Y)/10
d = json.load(open('film_voll4.json'))
B=d['bilder'][0]['figuren']['prof']; mats,cc=FG.matrizen('prof',B,d['FR'],W,kY)
for i in (0,13,19): print(i, [round(x,2) for x in mats[i][0].translation])
fp = W(950, 420, .8); print('fp', [round(x,2) for x in fp])
r=math.radians(-58); ax=Vector((math.sin(r),0,math.cos(r))); c=fp+Vector((-.35,0,.55)); print('rohr enden', [round(x,2) for x in c+ax*.8],[round(x,2) for x in c-ax*.8])
