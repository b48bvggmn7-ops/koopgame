import bpy, sys, json, os
from mathutils import Vector
sys.path.insert(0, os.getcwd()); import figuren as FG
def W(px, py, Y): k = (10 + Y)/10; return Vector((6.4 + (px - 640)/100*k, Y, 2.82 + (360 - py)/100*k))
def kY(Y): return (10 + Y)/10
d = json.load(open('film_voll5.json')); BB=d['bilder']
z=[B['zeile'] for B in BB]
for zl in (8,11,16,18):
    idx=[i for i,q in enumerate(z) if q==zl]; i=idx[len(idx)//2]
    for name in ('prof','schwein','affe'):
        m,cc=FG.matrizen(name,BB[i]['figuren'][name],d['FR'],W,kY); c=m[0][0].translation
        print('zeile',zl,'bild',idx[0],'-',idx[-1],name,[round(x,2) for x in c],'sitz',round(BB[i]['figuren'][name]['sitz'],2))
