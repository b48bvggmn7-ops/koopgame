# Sternenzimmer als 3D-Szene (Blender/Cycles). Koordinaten: X rechts, Y in den Raum, Z hoch.
# Kamera so eingestellt, dass auf der Figurenebene Y=0 gilt: 100 Bildpunkte = 1 Einheit, Fußlinie py=642 -> Z=0.
import bpy, math, sys, random, os
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = A[0] if A else 'test.png'; SAMPLES = int(A[1]) if len(A) > 1 else 64; RES = float(A[2]) if len(A) > 2 else 1.0
random.seed(3)
bpy.ops.wm.read_factory_settings(use_empty=True)
S = bpy.context.scene
CAM_D, CAM_Z = 10.0, 2.82
def W(px, py, Y):   # Bildpunkt (auf Tiefe Y) -> Welt
    k = (CAM_D + Y)/CAM_D
    return Vector((6.4 + (px - 640)/100*k, Y, CAM_Z + (360 - py)/100*k))
def kY(Y): return (CAM_D + Y)/CAM_D

# ---------- Materialien ----------
def node_mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']; return m, nt, b
def farbe(name, col, rough=.55, sheen=0, spec=.4, metal=0, emit=None, estr=0):
    m, nt, b = node_mat(name)
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    b.inputs['Sheen Weight'].default_value = sheen
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = estr
    return m
def holz(name, c1, c2, skala=6, maserung=(1, 0, 0), rough=.5, rauschen=4):
    m, nt, b = node_mat(name); N = nt.nodes; L = nt.links
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping')
    st = [skala*1.0, skala*1.0, skala*1.0]; ax = maserung.index(1); st[ax] = skala*.08     # entlang der Maserung gestreckt
    mp.inputs['Scale'].default_value = st; mp.inputs['Location'].default_value = (random.random()*9, random.random()*9, random.random()*9)
    L.new(tc.outputs['Object'], mp.inputs['Vector'])
    no = N.new('ShaderNodeTexNoise'); no.inputs['Scale'].default_value = 2.2; no.inputs['Detail'].default_value = 6; no.inputs['Distortion'].default_value = .6
    L.new(mp.outputs['Vector'], no.inputs['Vector'])
    # Jahresringe: sinus über die Rauschwerte -> feine parallele Linien
    m1 = N.new('ShaderNodeMath'); m1.operation = 'MULTIPLY'; m1.inputs[1].default_value = 38; L.new(no.outputs['Fac'], m1.inputs[0])
    m2 = N.new('ShaderNodeMath'); m2.operation = 'SINE'; L.new(m1.outputs['Value'], m2.inputs[0])
    m3 = N.new('ShaderNodeMath'); m3.operation = 'MULTIPLY_ADD'; m3.inputs[1].default_value = .18; m3.inputs[2].default_value = .5; L.new(m2.outputs['Value'], m3.inputs[0])
    no2 = N.new('ShaderNodeTexNoise'); no2.inputs['Scale'].default_value = .7; L.new(mp.outputs['Vector'], no2.inputs['Vector'])
    m4 = N.new('ShaderNodeMath'); m4.operation = 'MULTIPLY_ADD'; m4.inputs[1].default_value = .7; L.new(no2.outputs['Fac'], m4.inputs[0]); L.new(m3.outputs['Value'], m4.inputs[2])
    m5 = N.new('ShaderNodeMath'); m5.operation = 'SUBTRACT'; m5.inputs[1].default_value = .35; L.new(m4.outputs['Value'], m5.inputs[0])
    cr = N.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (*c1, 1); cr.color_ramp.elements[1].color = (*c2, 1); cr.color_ramp.elements[0].position = .2; cr.color_ramp.elements[1].position = .9
    L.new(m5.outputs['Value'], cr.inputs['Fac']); L.new(cr.outputs['Color'], b.inputs['Base Color'])
    bu = N.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = .12; bu.inputs['Distance'].default_value = .01; L.new(m3.outputs['Value'], bu.inputs['Height']); L.new(bu.outputs['Normal'], b.inputs['Normal'])
    rr = N.new('ShaderNodeMapRange'); rr.inputs['To Min'].default_value = rough - .12; rr.inputs['To Max'].default_value = rough + .15; L.new(m3.outputs['Value'], rr.inputs['Value']); L.new(rr.outputs['Result'], b.inputs['Roughness'])
    return m
def stoff(name, col, sheen=.6, rough=.85, skala=60):
    m, nt, b = node_mat(name); N = nt.nodes; L = nt.links
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Sheen Weight'].default_value = sheen; b.inputs['Sheen Tint'].default_value = (1, .9, .85, 1)
    tc = N.new('ShaderNodeTexCoord'); no = N.new('ShaderNodeTexNoise'); no.inputs['Scale'].default_value = skala; no.inputs['Detail'].default_value = 8
    L.new(tc.outputs['Object'], no.inputs['Vector'])
    bu = N.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = .25; bu.inputs['Distance'].default_value = .01; L.new(no.outputs['Fac'], bu.inputs['Height']); L.new(bu.outputs['Normal'], b.inputs['Normal'])
    return m

M = {
  'wand': holz('wand', (.17, .085, .04), (.40, .23, .12), skala=1.6, maserung=(0, 0, 1), rough=.62),
  'wand2': holz('wand2', (.21, .11, .05), (.46, .28, .15), skala=1.7, maserung=(0, 0, 1), rough=.6),
  'wand3': holz('wand3', (.15, .075, .035), (.36, .2, .1), skala=1.5, maserung=(0, 0, 1), rough=.65),
  'boden': holz('boden', (.14, .07, .03), (.38, .2, .09), skala=1.4, maserung=(0, 1, 0), rough=.32),
  'boden2': holz('boden2', (.18, .09, .04), (.44, .25, .12), skala=1.5, maserung=(0, 1, 0), rough=.3),
  'boden3': holz('boden3', (.12, .06, .025), (.33, .17, .08), skala=1.3, maserung=(0, 1, 0), rough=.36),
  'eisen': farbe('eisen', (.08, .07, .06), rough=.35, metal=.8),
  'dunkelholz': holz('dunkelholz', (.08, .04, .02), (.2, .11, .05), skala=3, maserung=(1, 0, 0), rough=.45),
  'regal': holz('regal', (.13, .06, .03), (.3, .16, .08), skala=4, maserung=(0, 0, 1), rough=.45),
  'sofa': stoff('sofa', (.42, .12, .11)), 'sofa2': stoff('sofa2', (.5, .17, .15)),
  'sessel': stoff('sessel', (.05, .19, .18), sheen=.7),
  'kissen': stoff('kissen', (.75, .5, .12)),
  'messing': farbe('messing', (.8, .55, .22), rough=.25, metal=1),
  'gold': farbe('gold', (.85, .62, .3), rough=.3, metal=1),
  'vorhang': stoff('vorhang', (.5, .05, .05), sheen=.5, skala=40),
  'papier': farbe('papier', (.85, .78, .62), rough=.9),
  'tasse': farbe('tasse', (.85, .8, .72), rough=.15),
  'teller': farbe('teller', (.9, .87, .8), rough=.12),
  'topf': farbe('topf', (.55, .22, .1), rough=.7),
  'blatt': farbe('blatt', (.08, .3, .08), rough=.5, sheen=.3),
  'lampe': farbe('lampe', (.85, .6, .25), rough=.4, metal=.6),
  'lampenlicht': farbe('lampenlicht', (1, .8, .5), emit=(1, .72, .4), estr=25),
  'schwarz': farbe('schwarz', (.02, .02, .02), rough=.4),
}

def obj(name, me):
    o = bpy.data.objects.new(name, me); S.collection.objects.link(o); return o
def mod_bevel(o, w=.03, seg=3):
    b = o.modifiers.new('bev', 'BEVEL'); b.width = w; b.segments = seg; b.limit_method = 'ANGLE'; return o
def box(name, c, s, mat, bev=.03, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=c, rotation=rot); o = bpy.context.object; o.name = name; o.scale = s
    bpy.ops.object.transform_apply(scale=True); o.data.materials.append(M[mat] if isinstance(mat, str) else mat)
    if bev: mod_bevel(o, bev)
    return o
def zyl(name, c, r, h, mat, rot=(0, 0, 0), bev=.02, v=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=v, radius=r, depth=h, location=c, rotation=rot); o = bpy.context.object; o.name = name
    o.data.materials.append(M[mat] if isinstance(mat, str) else mat)
    if bev: mod_bevel(o, bev)
    bpy.ops.object.shade_smooth(); return o
def kugel(name, c, r, mat, sc=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=c, segments=32, ring_count=16); o = bpy.context.object; o.name = name; o.scale = sc
    o.data.materials.append(M[mat] if isinstance(mat, str) else mat); bpy.ops.object.shade_smooth(); return o
def glatt(o, lv=2):
    m = o.modifiers.new('sub', 'SUBSURF'); m.levels = lv; m.render_levels = lv; return o

YW = 3.3   # Rückwand
LK = []
# ---------- Raum ----------
box('unterboden', (6.4, 0, -.1), (30, 14, .1), 'schwarz', bev=0)
for i in range(-14, 30):
    y0 = -7
    while y0 < YW:
        l = 2.5 + random.random()*3.5; l = min(l, YW - y0)
        box(f'diele{i}_{y0:.1f}', (i*.62 + .31, y0 + l/2, -.03), (.6, l - .02, .06), random.choice(['boden', 'boden2', 'boden3']), bev=.008)
        y0 += l
# Rückwand aus Brettern (leicht unterschiedlich tief und breit, minimal gebogen)
x = -3.5
while x < 17:
    w = .55 + random.random()*.25
    box(f'brett{x:.1f}', (x + w/2, YW + random.random()*.04, 5), (w - .015, .12, 10.5), random.choice(['wand', 'wand2', 'wand3']), bev=.015)
    for nz in (.45, 7.0):
        for nx in (-.18, .18): kugel(f'nagel{x:.1f}{nz}{nx}', (x + w/2 + nx*w, YW - .07, nz + random.random()*.1), .022, 'eisen', sc=(1, .4, 1))
    x += w
# rechte Seitenwand (nur in schrägen Nahaufnahmen zu sehen; schließt das Zimmer)
TUER_Y0, TUER_Y1, TUER_H = -.75, 1.45, 2.95   # Türöffnung in der rechten Wand (Professor geht auf Tiefe 0,36 hindurch)
y0 = -8.0
while y0 < YW:
    w = .55 + random.random()*.25; w = min(w, YW - y0)
    xr, mat = 14.0 + random.random()*.03, random.choice(['wand', 'wand2', 'wand3'])
    if y0 + w > TUER_Y0 and y0 < TUER_Y1: box(f'seitenbrett{y0:.1f}', (xr, y0 + w/2, (TUER_H + 10.25)/2), (.12, w - .015, 10.25 - TUER_H), mat, bev=.015)   # über der Tür
    else: box(f'seitenbrett{y0:.1f}', (xr, y0 + w/2, 5), (.12, w - .015, 10.5), mat, bev=.015)
    y0 += w
box('seitenleiste', (13.92, (-8.1 + TUER_Y0)/2, .12), (.1, TUER_Y0 + 8.1, .24), 'dunkelholz', bev=.02); box('seitenleiste2', (13.92, (TUER_Y1 + YW)/2, .12), (.1, YW - TUER_Y1, .24), 'dunkelholz', bev=.02)
# Tür rechts (dahin geht der Professor am Ende, nachdem er das Licht ausgemacht hat): offene Tür, dahinter dunkler Flur
for yy in (TUER_Y0 - .06, TUER_Y1 + .06): box(f'tuerpfosten{yy:.1f}', (13.93, yy, TUER_H/2), (.16, .14, TUER_H + .1), 'dunkelholz', bev=.02)
box('tuersturz', (13.93, (TUER_Y0 + TUER_Y1)/2, TUER_H + .08), (.16, TUER_Y1 - TUER_Y0 + .26, .16), 'dunkelholz', bev=.02)
box('flur', (15.2, (TUER_Y0 + TUER_Y1)/2, TUER_H/2), (2.2, TUER_Y1 - TUER_Y0 + 1, TUER_H + .3), farbe('flurdunkel', (.012, .01, .009), rough=1), bev=0)
_wb = math.radians(68); _d = Vector((-math.sin(_wb), -math.cos(_wb), 0)); _br = TUER_Y1 - TUER_Y0 - .04
tl = box('tuerblatt', Vector((13.9, TUER_Y0, TUER_H/2 - .02)) + _d*_br/2, (_br, .07, TUER_H - .06), 'dunkelholz', bev=.02, rot=(0, 0, math.atan2(_d.y, _d.x)))
for dz in (.6, 1.6, 2.4): box(f'tuerquer{dz}', Vector((13.9, TUER_Y0, dz)) + _d*_br/2 - Vector((_d.y, -_d.x, 0))*.05, (_br*.9, .03, .08), 'messing', bev=.01, rot=(0, 0, math.atan2(_d.y, _d.x)))
kugel('tuerklinke', Vector((13.9, TUER_Y0, 1.2)) + _d*(_br - .15) - Vector((_d.y, -_d.x, 0))*.07, .05, 'messing')
box('lichtschalter', (13.9, TUER_Y0 - .45, 1.45), (.04, .12, .18), 'tasse', bev=.01)
# Fußleiste
box('leiste', (6.4, YW - .1, .12), (30, .1, .24), 'dunkelholz', bev=.02)
# Deckenbalken mit Lichterkette
balken_z = W(0, 103, YW - .6).z
box('balken', (6.4, YW - .6, balken_z), (30, .5, .45), 'dunkelholz', bev=.04)
for i in range(30):
    px = 20 + i*58*0.75 - 140
    p = W(20 + i*44 - 60, 126 + math.sin(i*1.1)*6, YW - .9)
    col = [(1, .62, .22), (1, .32, .3), (.5, 1, .35), (.45, .6, 1)][i % 4]
    em = farbe(f'lk{i}', col, emit=tuple(c**2.2 for c in col), estr=5); kugel(f'birne{i}', p, .035, em, sc=(1, 1, 1.35)); LK.append((20 + i*44 - 60, 126 + math.sin(i*1.1)*6, col))
    if i % 3 == 0:
        bpy.ops.object.light_add(type='POINT', location=p - Vector((0, .1, 0))); L = bpy.context.object; L.data.energy = 3; L.data.color = col; L.data.shadow_soft_size = .05
# Draht der Lichterkette (durchhängend zwischen den Birnen)
pts = [W(20 + i*44 - 60, 126 + math.sin(i*1.1)*6 - 4, YW - .9) for i in range(30)]
cu = bpy.data.curves.new('draht', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = .008; sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
for p, q in zip(sp.points, pts): p.co = (*q, 1)
cu.materials.append(M['schwarz']); obj('draht', cu)

# ---------- Fenster (Loch in der Wand, dahinter durchsichtig -> 2D-Himmel) ----------
F = W(860, 268, YW); FR = 1.58*kY(YW)
loch = zyl('loch', (F.x, YW, F.z), FR, 2, 'schwarz', rot=(math.pi/2, 0, 0), bev=0, v=96)
for o in [b for b in S.objects if b.name.startswith('brett')]:
    m = o.modifiers.new('loch', 'BOOLEAN'); m.object = loch; m.operation = 'DIFFERENCE'
loch.hide_render = True; loch.hide_viewport = True
bpy.ops.mesh.primitive_torus_add(location=(F.x, YW - .08, F.z), rotation=(math.pi/2, 0, 0), major_radius=FR + .08, minor_radius=.16, major_segments=96, minor_segments=24)
rahmen = bpy.context.object; rahmen.data.materials.append(M['dunkelholz']); bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_torus_add(location=(F.x, YW - .2, F.z), rotation=(math.pi/2, 0, 0), major_radius=FR + .26, minor_radius=.05, major_segments=96, minor_segments=12)
bpy.context.object.data.materials.append(M['messing']); bpy.ops.object.shade_smooth()
for i in range(12):
    a = i/12*2*math.pi; kugel(f'bolzen{i}', (F.x + math.cos(a)*(FR + .08), YW - .25, F.z + math.sin(a)*(FR + .08)), .045, 'messing')
box('sprosse_h', (F.x, YW, F.z), (2*FR, .08, .07), 'dunkelholz', bev=.01); box('sprosse_v', (F.x, YW, F.z), (.07, .08, 2*FR), 'dunkelholz', bev=.01)
if os.environ.get('INNENGLAS', '0') == '1':   # Glasscheibe im runden Fenster: durchsichtig (Himmel kommt dahinter), spiegelt Lampe und Lichterkette
    gm = bpy.data.materials.new('zimmerglas'); gm.use_nodes = True; gb = gm.node_tree.nodes['Principled BSDF']
    gb.inputs['Base Color'].default_value = (.93, .97, 1, 1); gb.inputs['Transmission Weight'].default_value = 1; gb.inputs['IOR'].default_value = 1.18
    no = gm.node_tree.nodes.new('ShaderNodeTexNoise'); no.inputs['Scale'].default_value = 6; mr = gm.node_tree.nodes.new('ShaderNodeMapRange'); mr.inputs['To Min'].default_value = 0; mr.inputs['To Max'].default_value = .05
    gm.node_tree.links.new(no.outputs['Fac'], mr.inputs['Value']); gm.node_tree.links.new(mr.outputs['Result'], gb.inputs['Roughness'])
    bpy.ops.mesh.primitive_circle_add(vertices=96, radius=FR, fill_type='NGON', location=(F.x, YW + .06, F.z), rotation=(math.pi/2, 0, 0)); go = bpy.context.object; go.name = 'zimmerglas'; go.data.materials.append(gm)   # hauchdünn: keine Brechung am Rand
    S.cycles.film_transparent_glass = True; S.cycles.film_transparent_roughness = .2
# Fensterbank
box('bank', (F.x, YW - .25, F.z - FR - .22), (2*FR + .6, .5, .12), 'dunkelholz', bev=.02)
# Topf mit Herbert
tp = Vector((F.x - FR + .45, YW - .3, F.z - FR - .16))
zyl('topf', tp + Vector((0, 0, .17)), .17, .34, 'topf', bev=.02)
for i in range(9):
    a = -1.2 + i*.3
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=.06, depth=.6, location=tp + Vector((math.sin(a)*.18, 0, .6 + math.cos(a)*.1)), rotation=(0, a*.8, 0))
    o = bpy.context.object; o.scale = (1, .2, 1); o.data.materials.append(M['blatt']); bpy.ops.object.shade_smooth()
# Vorhänge: Faltenbahnen, oben breit, in Fensterhöhe zusammengebunden, unten wieder auseinander (vor der Fensterbank)
import bmesh
def vorhang(s):
    me = bpy.data.meshes.new(f'vorhang{s}'); bm = bmesh.new(); nu, nv = 60, 70; H = 2*FR + 1.6; top = F.z + FR + .45
    vs = []
    for j in range(nv + 1):
        v = j/nv; z = top - v*H
        raff = 1 - .62*math.exp(-((v - .55)/.16)**2)                 # Raffung beim Band
        breite = 1.15*raff; mitte = F.x + s*(FR + .2 + .35*(1 - raff))
        row = []
        for i in range(nu + 1):
            u = i/nu; x = mitte + s*(u - .5)*breite
            y = YW - .73 - (math.sin(u*math.pi*7 + v*.8)*.07 + math.sin(u*math.pi*13)*.02)*(1.5 - raff)*(1 + .5*v)
            row.append(bm.verts.new((x, y, z)))
        vs.append(row)
    for j in range(nv):
        for i in range(nu): bm.faces.new((vs[j][i], vs[j][i + 1], vs[j + 1][i + 1], vs[j + 1][i]))
    bm.to_mesh(me); bm.free(); o = obj(f'vorhang{s}', me); o.data.materials.append(M['vorhang'])
    for p in me.polygons: p.use_smooth = True
    so = o.modifiers.new('d', 'SOLIDIFY'); so.thickness = .025
    band = zyl(f'band{s}', (F.x + s*(FR + .55), YW - .78, top - .55*H), .2, .1, 'gold', bev=.02); band.scale = (1.2, .5, 1)
for s in (-1, 1): vorhang(s)
box('stange', (F.x, YW - .83, F.z + FR + .45), (2*FR + 2.4, .06, .06), 'messing', bev=.02)

# ---------- Bücherregal ----------
r0, r1 = W(44, 170, YW - .45), W(220, 572, YW - .45)
rw, rh = r1.x - r0.x, r0.z - r1.z; rc = Vector(((r0.x + r1.x)/2, YW - .45, (r0.z + r1.z)/2))
box('regal_rueck', (rc.x, YW - .2, rc.z), (rw, .05, rh), 'regal', bev=0)
for sx in (-1, 1): box(f'regal_seite{sx}', (rc.x + sx*(rw/2 - .05), rc.y, rc.z), (.1, .55, rh), 'regal')
fach = []
for i in range(5):
    z = r1.z + .05 + i*(rh - .1)/4; fach.append(z); box(f'brett_r{i}', (rc.x, rc.y, z), (rw - .05, .55, .07), 'regal', bev=.01)
farben = [(.55, .12, .1), (.12, .3, .45), (.75, .55, .15), (.2, .4, .2), (.4, .18, .35), (.7, .35, .15), (.82, .78, .65)]
for i in range(4):
    x = r0.x + .15
    while x < r1.x - .25:
        bw = .09 + random.random()*.1; bh = .45 + random.random()*.25; col = random.choice(farben)
        bm = farbe(f'buch{i}_{x:.2f}', tuple(c*(.8 + random.random()*.4) for c in col), rough=.6)
        tilt = -.2 if random.random() < .1 else 0
        box(f'buch{i}_{x:.2f}', (x + bw/2, rc.y + random.random()*.06, fach[i] + .035 + bh/2), (bw, .4, bh), bm, bev=.012, rot=(0, tilt, 0))
        x += bw + .01

# ---------- Wandbilder mit Pinnnadeln ----------
def bild(name, datei, px, py, b, h, rot):
    c = W(px, py, YW - .1); k = kY(YW - .1)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(c.x, YW - .09, c.z), rotation=(math.pi/2, rot, 0)); o = bpy.context.object; o.name = name; o.scale = (b/100*k, h/100*k, 1)
    sm = o.modifiers.new('sub', 'SUBSURF'); sm.subdivision_type = 'SIMPLE'; sm.levels = 3; sm.render_levels = 3
    m, nt, bs = node_mat(name); tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load('//' + datei if False else __import__('os').path.abspath(datei))
    nt.links.new(tex.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = .85; o.data.materials.append(m)
    so = o.modifiers.new('d', 'SOLIDIFY'); so.thickness = .006
    kugel(name + 'nadel', (c.x, YW - .14, c.z + h/200*k - .06), .04, farbe(name + 'nm', (.75, .1, .1), rough=.2))
bild('sternkarte', 'sternkarte.png', 400, 300, 120, 96, -.05)
bild('zeichnung', 'zeichnung.png', 500, 200, 92, 68, .06)
# ---------- Hakenbrett: Schal und zwei gepackte Rucksäcke ----------
hb = W(538, 377, YW - .15); k = kY(YW - .15)
box('hakenbrett', (hb.x, YW - .15, hb.z), (1.5*k, .08, .1*k), 'dunkelholz', bev=.015)
for hx in (490, 540, 590):
    hp = W(hx, 386, YW - .2); zyl(f'haken{hx}', (hp.x, YW - .25, hp.z), .025, .14, 'messing', rot=(math.pi/2, 0, 0))
def rucksack(name, px, col, dunkel):
    p = W(px, 420, YW - .35); k = kY(YW - .35)
    r = box(name, (p.x, YW - .35, p.z), (.36*k, .26*k, .42*k), stoff(name + 's', col, sheen=.4, skala=90), bev=.1); glatt(r, 2)
    kl = box(name + 'klappe', (p.x, YW - .48, p.z + .1*k), (.37*k, .06*k, .22*k), stoff(name + 'k', dunkel, sheen=.4, skala=90), bev=.03); glatt(kl, 1)
    vt = box(name + 'tasche', (p.x, YW - .5, p.z - .1*k), (.24*k, .06*k, .14*k), stoff(name + 't', col, sheen=.4, skala=90), bev=.03); glatt(vt, 1)
    zyl(name + 'schnalle', (p.x, YW - .53, p.z + .01), .03, .02, 'gold', rot=(math.pi/2, 0, 0))
rucksack('rucksack_affe', 540, (.35, .2, .09), (.22, .12, .05))
rucksack('rucksack_schwein', 590, (.85, .45, .55), (.65, .3, .4))
sp = W(490, 420, YW - .3); schal = box('schal', (sp.x, YW - .3, sp.z), (.14, .04, .75), stoff('schal', (.55, .04, .05), sheen=.6, skala=150), bev=.02); glatt(schal, 2)
schal2 = box('schal2', (sp.x + .12, YW - .32, sp.z + .07), (.14, .04, .6), M['schal'] if 'schal' in M else bpy.data.materials['schal'], bev=.02); glatt(schal2, 2)
# ---------- Holzrakete auf dem Boden ----------
rp = W(856, 640, -.3); rp.z = .1
r = zyl('rakete', rp, .1, .6, farbe('raketeholz', (.8, .7, .5), rough=.45), rot=(0, math.pi/2, .2), bev=.02)
bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=.1, depth=.25, location=rp + Vector((.42*math.cos(.2), .42*math.sin(.2), 0)), rotation=(0, math.pi/2, .2)); o = bpy.context.object; o.data.materials.append(farbe('raketerot', (.6, .06, .05), rough=.4)); bpy.ops.object.shade_smooth()
for a in (0, 2.1, 4.2):
    f = box(f'flosse{a}', rp + Vector((-.28*math.cos(.2), -.28*math.sin(.2), 0)), (.18, .02, .12), 'raketerot' if False else bpy.data.materials['raketerot'], bev=.01, rot=(a, 0, .2))
    f.location += Vector((0, math.sin(a)*.1, math.cos(a)*.1))
zyl('bullauge', rp + Vector((0, -.09, .02)), .04, .03, 'messing', rot=(math.pi/2, 0, 0))
# ---------- Glas mit Glühwürmchen und Globus oben auf dem Regal ----------
gp = W(96, 145, YW - .45)
glas = zyl('glas', (gp.x, YW - .45, r0.z + .3), .2, .55, farbe('glasm', (.9, .95, 1), rough=.05), bev=.03)
glas.data.materials[0].node_tree.nodes['Principled BSDF'].inputs['Transmission Weight'].default_value = 1
zyl('deckel', (gp.x, YW - .45, r0.z + .6), .18, .07, 'messing')
for i in range(5):
    kugel(f'gluehw{i}', (gp.x + random.uniform(-.1, .1), YW - .45 + random.uniform(-.1, .1), r0.z + .15 + random.random()*.3), .018, farbe(f'gw{i}', (.8, 1, .4), emit=(.8, 1, .3), estr=60))
glp = W(172, 140, YW - .45)
kugel('globus', (glp.x, YW - .45, r0.z + .35), .25, farbe('globusm', (.12, .3, .55), rough=.3))
bpy.ops.mesh.primitive_torus_add(location=(glp.x, YW - .45, r0.z + .35), rotation=(math.pi/2, .4, 0), major_radius=.29, minor_radius=.012); bpy.context.object.data.materials.append(M['messing'])
zyl('globusfuss', (glp.x, YW - .45, r0.z + .06), .1, .05, 'dunkelholz')
# ---------- Sofa ----------
def sofa():
    x0, x1 = .40 + .15, 6.10 - .15; cx = (x0 + x1)/2; sw = x1 - x0
    box('sofa_sockel', (cx, .55, .3), (sw, 1.1, .32), 'sofa', bev=.08)
    for k, (a, b) in enumerate([(x0 + .3, cx - .02), (cx + .02, x1 - .3)]):
        kk = box(f'sitzkissen{k}', ((a + b)/2, .5, .58), (b - a, 1.05, .28), 'sofa2', bev=.12); glatt(kk, 1)
    lehne = box('sofa_lehne', (cx, 1.15, 1.15), (sw, .35, 1.25), 'sofa', bev=.15); glatt(lehne, 1)
    for k in range(2):
        rk = box(f'rueckenkissen{k}', (cx + (k - .5)*sw*.48, .95, 1.05), (sw*.46, .25, .75), 'sofa2', bev=.12); glatt(rk, 2)
    for s, xa in ((-1, .40), (1, 6.10)):
        arm = box(f'armlehne{s}', (xa, .5, .62), (.5, 1.25, .78), 'sofa', bev=.2); glatt(arm, 2)
        for fy in (.0, 1.0): zyl(f'fuss{s}{fy}', (xa, fy, .06), .06, .12, 'dunkelholz')
    for k in range(2):
        for bx in range(4):
            for bz in range(2): kugel(f'knopf{k}{bx}{bz}', (cx + (k - .5)*sw*.48 + (bx - 1.5)*.42, .81, .85 + bz*.38), .035, 'sofa')
    kis = box('gelbes_kissen', (x0 + .45, .75, .95), (.55, .2, .55), 'kissen', bev=.15, rot=(0, -.25, 0)); glatt(kis, 2)
sofa()
# ---------- Ohrensessel ----------
def sessel():
    cx = 11.58
    box('sessel_sockel', (cx, .6, .3), (2.7, 1.25, .36), 'sessel', bev=.08)
    k = box('sessel_kissen', (cx, .55, .6), (2.1, 1.15, .26), 'sessel', bev=.1); glatt(k, 1)
    l = box('sessel_lehne', (cx, 1.3, 1.8), (2.6, .38, 2.8), 'sessel', bev=.35); glatt(l, 2)
    for s in (-1, 1):
        a = box(f'sessel_arm{s}', (cx + s*1.22, .55, .78), (.45, 1.25, .62), 'sessel', bev=.2); glatt(a, 2)
        o = box(f'sessel_ohr{s}', (cx + s*1.22, 1.05, 2.3), (.32, .65, 1.5), 'sessel', bev=.15); glatt(o, 2)
        for fy in (.05, 1.2): zyl(f'sfuss{s}{fy}', (cx + s*1.22, fy, .06), .07, .12, 'dunkelholz')
    for bx in range(3):
        for bz in range(2): kugel(f'sknopf{bx}{bz}', (cx + (bx - 1)*.6, 1.1, 1.6 + bz*.6), .035, 'sessel')
if os.environ.get('MIT_SESSEL'): sessel()   # Sessel gibt es nicht mehr (Nutzerwunsch): der Professor läuft herum
# ---------- Stehlampe hinter dem Sessel (Leselicht für die Professor-Ecke) ----------
def stehlampe():
    sx, sy = 10.25, 2.45
    zyl('stehlampe_fuss', (sx, sy, .03), .26, .06, 'lampe', bev=.015)
    zyl('stehlampe_stab', (sx, sy, 1.65), .025, 3.2, 'lampe', bev=0, v=16)
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=.42, radius2=.28, depth=.5, location=(sx, sy, 3.3)); o = bpy.context.object; o.name = 'stehlampe_schirm'
    o.data.materials.append(farbe('schirmstoff', (.93, .8, .58), rough=.9, emit=(1, .72, .42), estr=1.2)); so = o.modifiers.new('d', 'SOLIDIFY'); so.thickness = .012; bpy.ops.object.shade_smooth()
    bpy.ops.object.light_add(type='POINT', location=(sx, sy, 3.22)); L = bpy.context.object; L.name = 'stehlampe_licht'; L.data.energy = 240; L.data.color = (1, .7, .42); L.data.shadow_soft_size = .15
stehlampe()
# kleine Wandlampe rechts neben dem Sessel (nur in Nahaufnahmen zu sehen), damit die Ecke nicht im Dunkeln liegt
zyl('wandlampe_halter', (13.25, YW - .12, 2.75), .05, .25, 'lampe', rot=(math.pi/2, 0, 0), bev=0, v=16)
bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=.2, radius2=.12, depth=.26, location=(13.25, YW - .3, 2.85)); o = bpy.context.object; o.name = 'wandlampe_schirm'
o.data.materials.append(S.objects['stehlampe_schirm'].data.materials[0]); so = o.modifiers.new('d', 'SOLIDIFY'); so.thickness = .01; bpy.ops.object.shade_smooth()
bpy.ops.object.light_add(type='POINT', location=(13.25, YW - .32, 2.8)); L = bpy.context.object; L.name = 'wandlampe_licht'; L.data.energy = 90; L.data.color = (1, .7, .42); L.data.shadow_soft_size = .12
# ---------- Tischchen mit Teller und Tasse ----------
T = W(760, 598, .2); T.z = max(T.z, .35)
zyl('tischplatte', (T.x, T.y, T.z - .03), .72, .06, 'dunkelholz', bev=.02, v=64)
zyl('tischbein', (T.x, T.y, T.z/2), .07, T.z, 'dunkelholz')
zyl('tischfuss', (T.x, T.y, .03), .3, .05, 'dunkelholz')
zyl('teller', (T.x - .24, T.y - .05, T.z + .015), .44, .025, 'teller', bev=.01, v=64)
tz = Vector((T.x + .31, T.y - .05, T.z + .12)); zyl('tasse', tz, .12, .22, 'tasse', bev=.03)
bpy.ops.mesh.primitive_torus_add(location=tz + Vector((.14, 0, .02)), rotation=(math.pi/2, 0, 0), major_radius=.06, minor_radius=.018); bpy.context.object.data.materials.append(M['tasse'])
# ---------- Fernrohr ----------
fp = W(950, 420, .8) + Vector((-.32, -.25, -.62))   # so tief, dass das Okular vor dem Auge des Professors ist
for dx, dy in ((-.45, -.2), (.1, .45), (.45, -.2)):
    a = Vector((fp.x, fp.y, fp.z)); b = Vector((fp.x + dx, fp.y + dy, 0)); d = b - a
    bpy.ops.mesh.primitive_cylinder_add(radius=.035, depth=d.length, location=(a + b)/2); o = bpy.context.object
    o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler(); o.data.materials.append(M['dunkelholz']); bpy.ops.object.shade_smooth()
rohr = zyl('rohr', fp, .1, 1.6, 'messing', rot=(0, math.radians(90 + 32), 0), bev=.01)
rohr.rotation_euler = (0, math.radians(-58), 0); rohr.location = fp + Vector((-.35, 0, .55))
zyl('fernrohr_saeule', (fp + rohr.location)/2, .03, (rohr.location - fp).length + .05, 'dunkelholz', rot=(0, math.atan2((rohr.location - fp).x, (rohr.location - fp).z), 0))
kugel('fernrohr_gelenk', fp, .06, 'messing'); kugel('fernrohr_schelle', rohr.location, .075, 'messing')
box('fernrohr_klemme', rohr.location, (.24, .17, .17), 'messing', bev=.02).rotation_euler = (0, math.radians(-58), 0)
# ---------- Hängelampe ----------
lp = W(430, 170, 1.2)
zyl('kabel', lp + Vector((0, 0, 1.2)), .01, 2.4, 'schwarz', bev=0)
bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=.42, radius2=.12, depth=.4, location=lp); sch = bpy.context.object
sch.data.materials.append(M['lampe']); s2 = sch.modifiers.new('d', 'SOLIDIFY'); s2.thickness = .01; bpy.ops.object.shade_smooth()
kugel('birne', lp - Vector((0, 0, .12)), .09, 'lampenlicht')
bpy.ops.object.light_add(type='POINT', location=lp - Vector((0, 0, .2))); L = bpy.context.object; L.data.energy = 650; L.data.color = (1, .66, .36); L.data.shadow_soft_size = .2
# ---------- Teppich ----------
tp = W(470, 646, 0)
ringe = [(2.5, (.35, .12, .1)), (2.15, (.65, .33, .16)), (1.75, (.75, .55, .2)), (1.3, (.28, .38, .2)), (.85, (.6, .22, .2)), (.4, (.8, .7, .5))]
for i, (r, col) in enumerate(ringe):
    zyl(f'teppich{i}', (tp.x, -.4, .005 + i*.003), r, .01, stoff(f'tep{i}', col, sheen=.3, skala=120), bev=0, v=96).scale = (1, .55, 1)

# ---------- Licht ----------
# Mondlicht durchs Fenster (kühl), warmer Fülllicht-Schein von vorn, sehr schwaches Himmelslicht
bpy.ops.object.light_add(type='AREA', location=(F.x + 1.5, YW + 3, F.z + 1.5)); L = bpy.context.object; L.data.energy = 550; L.data.size = 3; L.data.color = (.55, .65, 1)
L.rotation_euler = (Vector((F.x - 1, 0, 0.5)) - L.location).to_track_quat('-Z', 'Y').to_euler()
bpy.ops.object.light_add(type='AREA', location=(4, -6, 5)); L = bpy.context.object; L.data.energy = 110; L.data.size = 8; L.data.color = (1, .78, .55)
L.rotation_euler = (Vector((6, 2, 1.5)) - L.location).to_track_quat('-Z', 'Y').to_euler()
# weiches Fülllicht für den Professor im Sessel (von vorn links, unsichtbar)
bpy.ops.object.light_add(type='AREA', location=(8.6, -3.2, 3.4)); L = bpy.context.object; L.name = 'prof_fuell'; L.data.energy = 140; L.data.size = 2.5; L.data.color = (1, .8, .62)
L.rotation_euler = (Vector((11.4, .4, 2.0)) - L.location).to_track_quat('-Z', 'Y').to_euler()
w = bpy.data.worlds.new('welt'); S.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.02, .025, .06, 1); w.node_tree.nodes['Background'].inputs[1].default_value = .6

# ---------- Zimmer nach vorn geschlossen (nur beim Anflug von außen zu sehen, in den Filmeinstellungen unsichtbar) ----------
_r = random.Random(77)   # eigener Zufall, damit das übrige Zimmer unverändert bleibt
box('boden_vorn', (6.4, -19, -.03), (40, 24, .06), 'boden', bev=0)
for x0, nm in ((-1.0, 'links'), (14.0, 'rechts')):
    y0 = -31.0 if nm == 'links' else -31.0
    ende = -4.0 if nm == 'links' else -8.0
    while y0 < ende:
        w = .55 + _r.random()*.25; w = min(w, ende - y0)
        box(f'vornwand_{nm}{y0:.1f}', (x0, y0 + w/2, 5), (.12, w - .015, 10.5), _r.choice(['wand', 'wand2', 'wand3']), bev=.015); y0 += w
box('decke_vorn', (6.4, -17, 6.3), (16, 29, .2), 'dunkelholz', bev=0)
# ---------- Kamera / Render ----------
cam = bpy.data.cameras.new('cam'); cam.lens = 18/0.64; cam.sensor_width = 36; cam.sensor_fit = 'HORIZONTAL'
co = obj('cam', cam); co.location = (6.4, -CAM_D, CAM_Z); co.rotation_euler = (math.pi/2, 0, 0); S.camera = co
S.render.engine = 'CYCLES'; S.cycles.device = 'CPU'; S.cycles.samples = SAMPLES; S.cycles.use_denoising = True
S.render.resolution_x = int(1280*RES); S.render.resolution_y = int(720*RES); S.render.film_transparent = True
S.view_settings.view_transform = 'AgX'; S.view_settings.look = 'AgX - Medium High Contrast'
S.cycles.max_bounces = 6; S.render.use_compositing = True; S.render.image_settings.file_format = 'PNG'; S.render.image_settings.color_mode = 'RGBA'
S.render.filepath = OUT
cam.dof.use_dof = True; cam.dof.focus_distance = CAM_D + .4; cam.dof.aperture_fstop = 1.4
S.use_nodes = True; nt = S.node_tree
for n in list(nt.nodes):
    if n.type not in ('R_LAYERS', 'COMPOSITE'): nt.nodes.remove(n)
rl = nt.nodes['Render Layers']; cp = nt.nodes['Composite']; gl = nt.nodes.new('CompositorNodeGlare'); gl.glare_type = 'FOG_GLOW'; gl.threshold = .7; gl.size = 7; gl.mix = -.6
nt.links.new(rl.outputs['Image'], gl.inputs['Image']); nt.links.new(gl.outputs['Image'], cp.inputs['Image'])
import json
from bpy_extras.object_utils import world_to_camera_view
bpy.context.view_layer.update()
def bp(v): q = world_to_camera_view(S, co, Vector(v)); return [round(q.x*1280, 1), round((1 - q.y)*720, 1)]
PKT = {'lichterkette': [[*bp(W(x, y, YW - .9)), list(c)] for x, y, c in LK], 'lampe': bp(lp - Vector((0, 0, .12))),
       'glas': bp((gp.x, YW - .45, r0.z + .3)), 'tasse': bp(tz + Vector((0, 0, .12))), 'teller': bp((T.x - .24, T.y - .05, T.z + .03)),
       'fenster': [*bp((F.x, YW, F.z)), round(bp((F.x + FR, YW, F.z))[0] - bp((F.x, YW, F.z))[0], 1)],
       'sofa_sitz': bp((3.2, .2, .72)), 'sessel_sitz': bp((11.58, .2, .73)), 'sessel_arm_links': bp((11.58 - 1.22, .0, 1.1))}
json.dump(PKT, open(OUT.replace('.png', '.json'), 'w'))
print('PUNKTE', json.dumps(PKT))
if (A[3] if len(A) > 3 else '') == 'punkte': raise SystemExit
# Ebenen: 'hinten' = alles; 'vorne' = nur die Armlehnen (verdecken die sitzenden Figuren)
EBENE = A[3] if len(A) > 3 else 'hinten'
VORNE = ('armlehne', 'sessel_arm', 'sfuss', 'fuss')
if EBENE == 'vorne':
    for o in S.objects:
        if o.type == 'MESH' and not o.name.startswith(VORNE): o.is_holdout = True
bpy.ops.render.render(write_still=True)
print('fertig', OUT)
