# Häuschen von außen (Blender/Cycles), in Ebenen gerendert: fern, mitte, haus, busch, blatt (+ Nahaufnahmen fürs Hineinzoomen)
import bpy, bmesh, math, sys, random, json, os
from mathutils import Vector, Matrix
A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = A[0] if A else 'aussen.png'; SAMPLES = int(A[1]) if len(A) > 1 else 32; RES = float(A[2]) if len(A) > 2 else .5
EBENE = A[3] if len(A) > 3 else 'alles'; AUSSCHNITT = json.loads(A[4]) if len(A) > 4 else None   # [x0,y0,x1,y1] in 1280er Bildpunkten
random.seed(11)
bpy.ops.wm.read_factory_settings(use_empty=True)
S = bpy.context.scene
CAM_D, CAM_Z = 10.0, 2.82
def W(px, py, Y):
    k = (CAM_D + Y)/CAM_D
    return Vector((6.4 + (px - 640)/100*k, Y, CAM_Z + (360 - py)/100*k))
def kY(Y): return (CAM_D + Y)/CAM_D
EB = {}
def ebene(o, name):
    EB.setdefault(name, []).append(o); return o

# ---------- Materialien ----------
def node_mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']; return m, nt, b
def farbe(name, col, rough=.55, sheen=0, metal=0, emit=None, estr=0, sss=0):
    m, nt, b = node_mat(name)
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    b.inputs['Sheen Weight'].default_value = sheen
    if sss: b.inputs['Subsurface Weight'].default_value = sss; b.inputs['Subsurface Radius'].default_value = (.3, .5, .2)
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = estr
    return m
def rinde(name):
    m, nt, b = node_mat(name); N = nt.nodes; L = nt.links
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (3, 3, .35); L.new(tc.outputs['Object'], mp.inputs['Vector'])
    vo = N.new('ShaderNodeTexVoronoi'); vo.feature = 'DISTANCE_TO_EDGE'; vo.inputs['Scale'].default_value = 4; L.new(mp.outputs['Vector'], vo.inputs['Vector'])
    no = N.new('ShaderNodeTexNoise'); no.inputs['Scale'].default_value = 8; no.inputs['Detail'].default_value = 8; L.new(mp.outputs['Vector'], no.inputs['Vector'])
    cr = N.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (.05, .03, .02, 1); cr.color_ramp.elements[1].color = (.3, .2, .14, 1); cr.color_ramp.elements[1].position = .25
    L.new(vo.outputs['Distance'], cr.inputs['Fac'])
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs['Factor'].default_value = .5
    L.new(cr.outputs['Color'], mx.inputs['A']); L.new(no.outputs['Color'], mx.inputs['B']); L.new(mx.outputs['Result'], b.inputs['Base Color'])
    bu = N.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = .8; bu.inputs['Distance'].default_value = .05; L.new(vo.outputs['Distance'], bu.inputs['Height']); L.new(bu.outputs['Normal'], b.inputs['Normal'])
    b.inputs['Roughness'].default_value = .85
    return m
def holz(name, c1, c2, sk=6):
    m, nt, b = node_mat(name); N = nt.nodes; L = nt.links
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (sk, sk*.08, sk); L.new(tc.outputs['Object'], mp.inputs['Vector'])
    no = N.new('ShaderNodeTexNoise'); no.inputs['Scale'].default_value = 2; no.inputs['Detail'].default_value = 6; L.new(mp.outputs['Vector'], no.inputs['Vector'])
    cr = N.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (*c1, 1); cr.color_ramp.elements[1].color = (*c2, 1); L.new(no.outputs['Fac'], cr.inputs['Fac']); L.new(cr.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = .6; return m
def blattmat(name, c1, c2):
    m, nt, b = node_mat(name); N = nt.nodes; L = nt.links
    oi = N.new('ShaderNodeObjectInfo'); cr = N.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (*c1, 1); cr.color_ramp.elements[1].color = (*c2, 1)
    L.new(oi.outputs['Random'], cr.inputs['Fac']); L.new(cr.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = .45; b.inputs['Subsurface Weight'].default_value = .25; b.inputs['Subsurface Radius'].default_value = (.2, .5, .1)
    b.inputs['Sheen Weight'].default_value = .3
    return m
M = {'rinde': rinde('rinde'), 'holz': holz('holz', (.15, .08, .04), (.35, .2, .1)), 'dunkelholz': holz('dholz', (.07, .04, .02), (.16, .09, .05)),
     'kuppel': farbe('kuppel', (.12, .32, .3), rough=.35, metal=.6), 'messing': farbe('messing', (.8, .55, .22), rough=.25, metal=1),
     'rot': farbe('rot', (.55, .04, .05), rough=.4), 'schwarz': farbe('schwarz', (.02, .02, .02), rough=.5),
     'fensterlicht': farbe('fensterlicht', (1, .7, .35), emit=(1, .62, .28), estr=6), 'eisen': farbe('eisen', (.08, .08, .09), rough=.4, metal=.8),
     'stein': farbe('stein', (.28, .27, .3), rough=.8), 'matte': farbe('matte', (.35, .2, .1), rough=.9),
     'laterne': farbe('laternenlicht', (1, .8, .45), emit=(1, .62, .25), estr=7), 'creme': farbe('creme', (.85, .78, .62), rough=.7),
     'kappe': farbe('kappe', (.6, .08, .05), rough=.4, sss=.2), 'stiel': farbe('stiel', (.88, .82, .7), rough=.6, sss=.3),
     'krone': blattmat('krone', (.06, .18, .07), (.16, .34, .1)), 'busch': blattmat('busch', (.03, .09, .04), (.07, .16, .06)),
     'kronekern': farbe('kronekern', (.03, .09, .04), rough=.8), 'fern': farbe('fern', (.13, .1, .2), rough=.9), 'mitte': farbe('mitteb', (.04, .05, .09), rough=.9),
     'gras': farbe('gras', (.05, .14, .06), rough=.6, sss=.1)}
def obj(name, me):
    o = bpy.data.objects.new(name, me); S.collection.objects.link(o); return o
def bevel(o, w=.03, seg=3):
    b = o.modifiers.new('bev', 'BEVEL'); b.width = w; b.segments = seg; b.limit_method = 'ANGLE'; return o
def box(name, c, s, mat, bev=.02, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=c, rotation=rot); o = bpy.context.object; o.name = name; o.scale = s
    bpy.ops.object.transform_apply(scale=True); o.data.materials.append(M[mat] if isinstance(mat, str) else mat)
    if bev: bevel(o, bev)
    return o
def zyl(name, c, r, h, mat, rot=(0, 0, 0), bev=.01, v=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=v, radius=r, depth=h, location=c, rotation=rot); o = bpy.context.object; o.name = name
    o.data.materials.append(M[mat] if isinstance(mat, str) else mat)
    if bev: bevel(o, bev)
    bpy.ops.object.shade_smooth(); return o
def kugel(name, c, r, mat, sc=(1, 1, 1), seg=32):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=c, segments=seg, ring_count=seg//2); o = bpy.context.object; o.name = name; o.scale = sc
    o.data.materials.append(M[mat] if isinstance(mat, str) else mat); bpy.ops.object.shade_smooth(); return o
def torus(name, c, R, r, mat, rot=(math.pi/2, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(location=c, rotation=rot, major_radius=R, minor_radius=r, major_segments=64, minor_segments=12); o = bpy.context.object; o.name = name
    o.data.materials.append(M[mat]); bpy.ops.object.shade_smooth(); return o
def linie(name, pts, r, mat):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = 3; sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts): p.co = (*q, 1)
    cu.materials.append(M[mat]); return obj(name, cu)
def blatt_mesh(name, l=1, b=.4):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); n = 10; links, rechts = [], []
    for i in range(n + 1):
        u = i/n; w = math.sin(u*math.pi)**.8*b/2; z = -(u - .5)**2*.25*l
        links.append(bm.verts.new((u*l, -w, z))); rechts.append(bm.verts.new((u*l, w, z)))
    mitte = [bm.verts.new((u/n*l, 0, -(u/n - .5)**2*.25*l + .03*l)) for u in range(n + 1)]
    for i in range(n):
        for a, c in ((links, mitte), (mitte, rechts)):
            vs = [a[i], a[i + 1], c[i + 1], c[i]]
            if len(set(vs)) == 4: bm.faces.new(vs)
    bm.to_mesh(me); bm.free(); o = obj(name, me)
    for p in me.polygons: p.use_smooth = True
    return o
def belauben(o, blatt, mat, n, groesse, rnd=.4):
    o.modifiers.new('laub', 'PARTICLE_SYSTEM'); ps = o.particle_systems[-1].settings
    ps.type = 'HAIR'; ps.count = n; ps.hair_length = 1; ps.emit_from = 'FACE'; ps.use_advanced_hair = True; ps.render_type = 'OBJECT'; ps.instance_object = blatt
    ps.particle_size = groesse; ps.size_random = rnd; ps.use_rotations = True; ps.rotation_mode = 'NOR'; ps.phase_factor_random = 2; ps.rotation_factor_random = .5
    blatt.data.materials.append(mat); blatt.hide_render = False; blatt.location = (0, 0, -100)

# ---------- Boden / Hügel ----------
Z0 = W(640, 600, 0).z
me = bpy.data.meshes.new('huegel'); bm = bmesh.new(); NX, NY = 120, 60; vs = []
for j in range(NY + 1):
    y = -9 + j/NY*16; row = []
    for i in range(NX + 1):
        x = 6.4 + (i/NX - .5)*34; dx = (x - 6.4)
        z = Z0 - max(0, abs(dx) - 3.5)**2*.035 - max(0, -y - 2)*.05 - max(0, y - 2)*.12 + .06*math.sin(x*1.3 + y)*math.cos(y*.9)
        row.append(bm.verts.new((x, y, z)))
    vs.append(row)
for j in range(NY):
    for i in range(NX): bm.faces.new((vs[j][i], vs[j][i + 1], vs[j + 1][i + 1], vs[j + 1][i]))
bm.to_mesh(me); bm.free(); huegel = obj('huegel', me); huegel.data.materials.append(farbe('erde', (.05, .07, .04), rough=.9))
for p in me.polygons: p.use_smooth = True
ebene(huegel, 'haus')
# Gras als echte Halme
huegel.modifiers.new('gras', 'PARTICLE_SYSTEM'); gs = huegel.particle_systems[-1].settings
gs.type = 'HAIR'; gs.count = 9000; gs.hair_length = .22; gs.child_type = 'INTERPOLATED'; gs.rendered_child_count = 9; gs.child_length = .9; gs.child_length_threshold = .4
gs.root_radius = .5; gs.radius_scale = .012; gs.tip_radius = 0; gs.use_advanced_hair = True; gs.brownian_factor = .03; gs.roughness_endpoint = .05; gs.material = 2
huegel.data.materials.append(M['gras'])
gs.kink = 'CURL'; gs.kink_amplitude = .02

# ---------- Stamm (hohler Baum = Häuschen) ----------
SX = 6.4; R0 = 1.25; TUER_A = math.atan2(-1.2, (6.05 - 6.4))   # Winkel, unter dem die Tür im Stamm sitzt
me = bpy.data.meshes.new('stamm'); bm = bmesh.new(); seg, rings = 72, 40; zb, zt = Z0 - .2, W(640, 248, 0).z; ring = []
for j in range(rings + 1):
    v = j/rings; z = zb + v*(zt - zb); r = R0*(1.0 - .16*v) + .9*math.exp(-v*9)
    row = []
    for i in range(seg):
        a = i/seg*2*math.pi; tuerweg = math.exp(-((math.atan2(math.sin(a - TUER_A), math.cos(a - TUER_A)))/.6)**2)
        r2 = R0*(1.0 - .16*v) + .9*math.exp(-v*9)*(1 - tuerweg)
        rr = r2*(1 + .045*math.sin(a*5 + v*4) + .03*math.sin(a*11 - v*6) + .06*math.exp(-v*7)*math.sin(a*6)*(1 - tuerweg))
        row.append(bm.verts.new((SX + math.cos(a)*rr, math.sin(a)*rr, z)))
    ring.append(row)
for j in range(rings):
    for i in range(seg): bm.faces.new((ring[j][i], ring[j][(i + 1) % seg], ring[j + 1][(i + 1) % seg], ring[j + 1][i]))
bm.faces.new(list(reversed(ring[-1])))
bm.to_mesh(me); bm.free(); stamm = obj('stamm', me); stamm.data.materials.append(M['rinde'])
for p in me.polygons: p.use_smooth = True
sub = stamm.modifiers.new('sub', 'SUBSURF'); sub.levels = 1; sub.render_levels = 2
tx = bpy.data.textures.new('rindenrillen', 'CLOUDS'); tx.noise_scale = .25
dp = stamm.modifiers.new('rillen', 'DISPLACE'); dp.texture = tx; dp.strength = .08; dp.texture_coords = 'OBJECT'
ebene(stamm, 'haus')
# Wurzeln
for a in (-2.55, -1.05, -.6, 2.2, 3.0):
    p0 = Vector((SX + math.cos(a)*R0*.9, math.sin(a)*R0*.9, Z0 + .35)); p1 = Vector((SX + math.cos(a)*(R0 + .9), math.sin(a)*(R0 + .9), Z0 - .05))
    w = linie(f'wurzel{a}', [p0, (p0 + p1)/2 + Vector((0, 0, .02)), p1], .2, 'rinde')
    for q, rr in zip(w.data.splines[0].points, (1.2, .7, .15)): q.radius = rr
    ebene(w, 'haus')
def vorne(px, py):   # Punkt auf der Stammoberfläche vor der Kamera (für Fenster, Tür ...)
    Y = -R0
    for _ in range(4):
        p = W(px, py, Y); dx = p.x - SX; z = p.z; v = clamp01((z - zb)/(zt - zb)); r = R0*(1 - .16*v) + .9*math.exp(-v*9)*(.1 if abs(px - 605) < 60 else 1) + .04
        Y = -math.sqrt(max(.01, r*r - dx*dx)) + .02
    return W(px, py, Y)
def clamp01(v): return max(0, min(1, v))
def normale(p): n = Vector((p.x - SX, p.y, 0)).normalized(); return n
def ausrichten(o, p):   # Objekt so drehen, dass seine lokale -Y-Achse aus dem Stamm herauszeigt
    n = normale(p); o.rotation_euler = (math.pi/2, 0, math.atan2(n.x, -n.y))

# ---------- Fenster (warm leuchtend; das große Fenster ist durchsichtig -> dahinter das Zimmer) ----------
FENSTER = []; GROSS = {}
def fenster(px, py, rpx, gross=False):
    p = vorne(px, py); k = kY(p.y); r = rpx/100*k
    rah = torus(f'frahmen{px}', p + normale(p)*.1, r + .05, .055, 'dunkelholz'); ausrichten(rah, p); rah.rotation_euler.x = math.pi/2; ebene(rah, 'haus')
    for i in range(8):
        a = i/8*2*math.pi; b = kugel(f'fbolz{px}{i}', p, .018, 'messing', seg=12); n = normale(p); t = Vector((n.y*-1, n.x, 0)).normalized() if False else Vector((-n.y, n.x, 0))
        b.location = p + t*math.cos(a)*(r + .05) + Vector((0, 0, math.sin(a)*(r + .05))) - n*.05*0 + n*.04; ebene(b, 'haus')
    if gross:
        s = kugel(f'loch{px}', p, r, 'schwarz', sc=(1, 1, 1)); s.is_holdout = True; s.scale = (1, 1, 1); ebene(s, 'haus')
        GROSS['p'] = p.copy(); GROSS['n'] = normale(p); GROSS['r'] = r
        bpy.ops.object.light_add(type='POINT', location=p + normale(p)*.6); L = bpy.context.object; L.data.energy = float(os.environ.get('FENSTER_AUSSENLICHT', '120')); L.data.color = (1, .65, .35); L.data.shadow_soft_size = .3; ebene(L, 'licht')
    else:
        g = zyl(f'glas{px}', p + normale(p)*.07, r + .01, .05, 'fensterlicht', bev=0); ausrichten(g, p); ebene(g, 'haus')
        n = normale(p); t = Vector((-n.y, n.x, 0))
        box(f'sh{px}', p + n*.12, (r*2, .03, .03), 'dunkelholz', bev=0).rotation_euler = (0, 0, math.atan2(n.x, -n.y)); ebene(S.objects[f'sh{px}'], 'haus')
        box(f'sv{px}', p + n*.12, (.03, .03, r*2), 'dunkelholz', bev=0).rotation_euler = (0, 0, math.atan2(n.x, -n.y)); ebene(S.objects[f'sv{px}'], 'haus')
        bpy.ops.object.light_add(type='POINT', location=p + n*.35); L = bpy.context.object; L.data.energy = 30; L.data.color = (1, .62, .3); L.data.shadow_soft_size = .2; ebene(L, 'licht')
    FENSTER.append((px, py, rpx))
fenster(705, 372, 38, True); fenster(555, 405, 17); fenster(735, 505, 19)

# ---------- Tür (Marienkäfer) ----------
tp = vorne(605, 560); k = kY(tp.y)
me = bpy.data.meshes.new('tuer'); bm = bmesh.new(); pts = []
for i in range(21): a = math.pi - i/20*math.pi; pts.append((math.cos(a)*.37*k, 0, .25*k + math.sin(a)*.37*k))
pts += [(.37*k, 0, -.38*k), (-.37*k, 0, -.38*k)]
f = bm.faces.new([bm.verts.new(p) for p in pts]); bmesh.ops.solidify(bm, geom=[f], thickness=.06)
bm.to_mesh(me); bm.free(); tuer = obj('tuer', me); tuer.data.materials.append(M['rot']); tuer.location = tp; ausrichten(tuer, tp); tuer.rotation_euler.x = 0
bevel(tuer, .015); ebene(tuer, 'haus')
n = normale(tp)
for dx, dz, r in ((-.17, .3, .08), (.17, .22, .09), (-.07, -.02, .07), (.23, -.15, .08), (-.21, -.28, .06)):
    pkt = kugel(f'tpunkt{dx}', tp + Vector((-n.y, n.x, 0))*dx*k + Vector((0, 0, dz*k)) + n*.07, r*k, 'schwarz', sc=(1, 1, .25)); pkt.rotation_euler = (math.pi/2, 0, math.atan2(n.x, -n.y)); ebene(pkt, 'haus')
ebene(box('tuerspalt', tp + n*.11 + Vector((0, 0, -.05)), (.02, .03, .62*k + .28), 'schwarz', bev=0), 'haus').rotation_euler = (0, 0, math.atan2(n.x, -n.y))
tq = Vector((-n.y, n.x, 0))
for dz in (.32, -.22):
    ebene(box(f'scharnier{dz}', tp - tq*.25*k + n*.11 + Vector((0, 0, dz*k)), (.22*k, .03, .04), 'eisen', bev=.005), 'haus').rotation_euler = (0, 0, math.atan2(n.x, -n.y))
bu = tp + tq*.12*k + n*.08 + Vector((0, 0, .38*k))
ebene(torus('tuerbullauge', bu, .075*k, .016, 'messing'), 'haus').rotation_euler = (math.pi/2, 0, math.atan2(n.x, -n.y))
g = zyl('tuerglas', bu - n*.01, .075*k, .03, 'fensterlicht', bev=0); g.rotation_euler = (math.pi/2, 0, math.atan2(n.x, -n.y)); ebene(g, 'haus')
st = box('stufe', W(605, 604, -1.45) + Vector((0, 0, -.01)), (.7, .32, .07), 'dunkelholz', bev=.02); ebene(st, 'haus')

ebene(kugel('knauf', tp + Vector((-n.y, n.x, 0))*.27*k + n*.1 + Vector((0, 0, -.02)), .035, 'messing'), 'haus')
rahmen = []
for i in range(21): a = math.pi - i/20*math.pi; rahmen.append(tp + Vector((-n.y, n.x, 0))*math.cos(a)*.41*k + Vector((0, 0, .25*k + math.sin(a)*.41*k)) + n*.03)
ebene(linie('tuerrahmen', [tp + Vector((-n.y, n.x, 0))*-.41*k + Vector((0, 0, -.38*k)) + n*.03] + rahmen + [tp + Vector((-n.y, n.x, 0))*.41*k + Vector((0, 0, -.38*k)) + n*.03], .05, 'dunkelholz'), 'haus')
ebene(box('matte', W(605, 601, -1.0) + Vector((0, 0, .02)), (.62, .3, .03), 'matte', bev=.01), 'haus')
# Laterne
lp = vorne(662, 500) + Vector((0, -.12, 0)); n = normale(lp)
ebene(box('laternehalter', lp + Vector((0, .06, .26)), (.03, .16, .03), 'eisen', bev=0), 'haus')
bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=.15, depth=.1, location=lp + Vector((0, 0, .17)), rotation=(0, 0, math.pi/4)); o = bpy.context.object; o.data.materials.append(M['eisen']); ebene(o, 'haus')
ebene(kugel('laternering', lp + Vector((0, 0, .24)), .025, 'eisen', seg=12), 'haus')
ebene(box('laterneboden', lp + Vector((0, 0, -.13)), (.17, .17, .03), 'eisen', bev=.005), 'haus')
for dx in (-.075, .075):
    for dy in (-.075, .075): ebene(box(f'lstab{dx}{dy}', lp + Vector((dx, dy, .01)), (.016, .016, .26), 'eisen', bev=0), 'haus')
glas = box('laterneglas', lp + Vector((0, 0, .01)), (.15, .15, .24), farbe('lglas', (1, .95, .85), rough=.05), bev=0); ebene(glas, 'haus')
glas.data.materials[0].node_tree.nodes['Principled BSDF'].inputs['Transmission Weight'].default_value = 1
ebene(zyl('kerze', lp + Vector((0, 0, -.06)), .03, .1, 'creme', bev=.005, v=16), 'haus')
ebene(kugel('flamme', lp + Vector((0, 0, .025)), .012, 'laterne', sc=(1, 1, 2.2), seg=12), 'haus')
bpy.ops.object.light_add(type='POINT', location=lp - n*.0 + Vector((0, -.15, 0))); L = bpy.context.object; L.data.energy = 60; L.data.color = (1, .68, .35); L.data.shadow_soft_size = .1; ebene(L, 'licht')

# ---------- Sternwarte oben ----------
zp = W(640, 246, 0).z
ebene(zyl('plattform', (SX, 0, zp), R0*1.05, .14, 'holz', bev=.02, v=64), 'haus')
for i in range(26):
    a = i/26*2*math.pi; ebene(zyl(f'pfosten{i}', (SX + math.cos(a)*R0, math.sin(a)*R0, zp + .2), .025, .32, 'dunkelholz', bev=0, v=8), 'haus')
ebene(torus('gelaender', (SX, 0, zp + .36), R0, .025, 'dunkelholz', rot=(0, 0, 0)), 'haus')
kp = kugel('kuppel', (SX, .1, zp + .05), .72, 'kuppel', sc=(1, 1, 1), seg=48); ebene(kp, 'haus')
bpy.ops.object.mode_set(mode='OBJECT')
for i in range(5):
    a = (i - 2)*.45; ebene(torus(f'naht{i}', (SX, .1, zp + .05), .725, .012, 'messing', rot=(0, 0, a)), 'haus').rotation_euler = (0, math.pi/2, a + math.pi/2)
ebene(box('kuppelboden', (SX, .1, zp - .33), (1.7, 1.7, .7), 'holz', bev=0), 'haus')   # untere Kuppelhälfte steckt in der Plattform
S.objects['kuppelboden'].hide_render = True
rohr = zyl('fernrohr', (SX + .35, -.2, zp + .6), .09, 1.1, 'messing', rot=(0, math.radians(50), 0)); ebene(rohr, 'haus')
ebene(zyl('okular', (SX - .05, -.2, zp + .27), .05, .2, 'dunkelholz', rot=(0, math.radians(50), 0)), 'haus')
ebene(zyl('fahnenstange', (SX - .3, -.1, zp + 1.0), .012, .6, 'dunkelholz', bev=0), 'haus')
bpy.ops.mesh.primitive_plane_add(size=1, location=(SX - .17, -.1, zp + 1.2), rotation=(math.pi/2, 0, 0)); fa = bpy.context.object; fa.scale = (.26, .14, 1)
fa.data.materials.append(M['rot']); sm = fa.modifiers.new('s', 'SUBSURF'); sm.subdivision_type = 'SIMPLE'; sm.levels = 4; sm.render_levels = 4
twx = fa.modifiers.new('w', 'SIMPLE_DEFORM'); twx.deform_method = 'BEND'; twx.angle = .5; ebene(fa, 'haus')
# Ofenrohr
op = vorne(760, 300) + Vector((.05, .0, 0))
ebene(zyl('ofenrohr', op + Vector((0, 0, .1)), .08, 1.0, 'eisen', bev=.005), 'haus'); ebene(zyl('ofenkappe', op + Vector((0, 0, .62)), .13, .08, 'eisen', bev=.01), 'haus')

# ---------- Ast mit Schaukel, Eule und Lichterkette ----------
a0, a1, a2 = vorne(560, 330), W(480, 300, -.6), W(395, 318, -.6)
ast = linie('ast', [a0 + Vector((.2, .3, 0)), a0, (a0 + a1)/2 + Vector((0, 0, .1)), a1, a2], .1, 'rinde'); ebene(ast, 'haus')
for dx in (-22, 22):
    o = W(430 + dx, 316, -.6); u = W(430 + dx, 465, -.6); ebene(linie(f'seil{dx}', [o, u], .012, 'creme'), 'haus')
ebene(box('schaukelbrett', W(430, 468, -.6), (.66, .2, .05), 'holz', bev=.01), 'haus')
ep = W(474, 300, -.6) + Vector((0, 0, .02))
ebene(kugel('eulenkoerper', ep + Vector((0, 0, .12)), .1, farbe('eule', (.25, .17, .1), rough=.8, sheen=.6), sc=(1, .9, 1.25)), 'haus')
ebene(kugel('eulenbauch', ep + Vector((0, -.06, .1)), .07, farbe('eulenbauch', (.5, .4, .28), rough=.8, sheen=.6), sc=(1, .6, 1.2)), 'haus')
ebene(kugel('eulenkopf', ep + Vector((0, 0, .29)), .1, bpy.data.materials['eule'], sc=(1.1, .9, .85)), 'haus')
for s in (-1, 1):
    ebene(kugel(f'eulenauge{s}', ep + Vector((s*.045, -.08, .3)), .035, farbe(f'eaw{s}', (.9, .85, .7), rough=.3)), 'haus')
    ebene(kugel(f'eulenpupille{s}', ep + Vector((s*.045, -.11, .3)), .017, 'schwarz'), 'haus')
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=.03, depth=.07, location=ep + Vector((s*.07, 0, .38)), rotation=(0, s*.4, 0)); o = bpy.context.object; o.data.materials.append(bpy.data.materials['eule']); ebene(o, 'haus')
bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=.015, depth=.04, location=ep + Vector((0, -.11, .27)), rotation=(math.pi/2, 0, 0)); o = bpy.context.object; o.data.materials.append(farbe('schnabel', (.8, .5, .1))); ebene(o, 'haus')
LK = []
for i in range(9):
    u = i/8; p = W(395 + u*165, 324 + math.sin(u*math.pi)*22, -.7); col = [(1, .62, .22), (1, .32, .3), (.5, 1, .35)][i % 3]
    ebene(kugel(f'lk{i}', p, .03, farbe(f'lkm{i}', col, emit=tuple(c**2.2 for c in col), estr=8), seg=12), 'haus'); LK.append([395 + u*165, 324 + math.sin(u*math.pi)*22, list(col)])
ebene(linie('lkdraht', [W(395 + u/20*165, 320 + math.sin(u/20*math.pi)*22, -.7) for u in range(21)], .006, 'schwarz'), 'haus')

# ---------- Briefkasten, Wäscheleine, Pilze, Blumen, Steinweg ----------
bp = W(471, 560, -.9)
ebene(box('bkpfosten', bp + Vector((0, 0, -.45)), (.07, .07, .9), 'holz', bev=.01), 'haus')
bk = box('briefkasten', bp + Vector((0, 0, .06)), (.42, .3, .2), 'rot', bev=.09); ebene(bk, 'haus')
for dx, dz in ((-.1, .08), (.08, .12), (.12, -.0), (-.05, -.02)): ebene(kugel(f'bkp{dx}', bp + Vector((dx, -.16, .06 + dz)), .035, 'schwarz', sc=(1, .3, 1), seg=12), 'haus')
ebene(box('bkfahne', bp + Vector((.23, 0, .14)), (.02, .02, .2), 'messing', bev=0), 'haus'); ebene(box('bkfahne2', bp + Vector((.27, 0, .22)), (.08, .015, .05), 'messing', bev=0), 'haus')
bpy.ops.object.text_add(location=bp + Vector((0, -.17, -.2)), rotation=(math.pi/2, 0, 0)); tx = bpy.context.object; tx.data.body = 'Familie Punkt'; tx.data.align_x = 'CENTER'; tx.data.size = .085; tx.data.extrude = .004
tx.data.materials.append(M['schwarz']); ebene(tx, 'haus')
ebene(box('schild', bp + Vector((0, -.15, -.17)), (.66, .02, .16), 'creme', bev=.01), 'haus')
p0, p1 = vorne(758, 455) + Vector((.0, -.1, 0)), W(925, 458, -.6)
ebene(zyl('leinenpfosten', W(925, 530, -.6), .04, 1.5, 'holz', bev=0), 'haus')
lein = [p0.lerp(p1, u/20) + Vector((0, 0, -math.sin(u/20*math.pi)*.2)) for u in range(21)]; ebene(linie('leine', lein, .006, 'creme'), 'haus')
for i, (u, col) in enumerate(((.2, (.35, .2, .09)), (.47, (.85, .45, .55)), (.74, (.55, .04, .05)))):
    p = p0.lerp(p1, u) + Vector((0, 0, -math.sin(u*math.pi)*.2 - .14))
    sm_ = farbe(f'socke{i}', col, rough=.9, sheen=.6)
    so = linie(f'socke{i}', [p + Vector((0, 0, .1)), p + Vector((0, 0, -.06)), p + Vector((.02, 0, -.11)), p + Vector((.12, 0, -.11))], .05, 'schwarz')
    so.data.materials.clear(); so.data.materials.append(sm_); so.data.bevel_resolution = 4; ebene(so, 'haus')
    ebene(box(f'klammer{i}', p + Vector((0, 0, .13)), (.025, .03, .07), 'creme', bev=0), 'haus')
for x, y, s in ((380, 610, 1), (398, 616, .7), (860, 606, .9), (845, 610, .6)):
    p = W(x, y, -1.2); p.z = Z0 - .02
    ebene(zyl(f'stiel{x}', p + Vector((0, 0, .08*s)), .035*s, .16*s, 'stiel', bev=.01, v=16), 'haus')
    k = kugel(f'kappe{x}', p + Vector((0, 0, .17*s)), .12*s, 'kappe', sc=(1, 1, .6)); ebene(k, 'haus')
    for j in range(5): a = j*1.3; ebene(kugel(f'punkt{x}{j}', p + Vector((math.cos(a)*.07*s, math.sin(a)*.07*s - .02, .23*s)), .016*s, 'creme', seg=10), 'haus')
for x, y, col in ((330, 625, (.95, .8, .3)), (345, 632, (.95, .5, .6)), (895, 620, (.6, .55, .95)), (915, 628, (.95, .8, .3)), (300, 640, (.95, .5, .6)), (960, 640, (.6, .55, .95))):
    p = W(x, y, -1.4); p.z = Z0 - .03
    ebene(linie(f'bstiel{x}', [p, p + Vector((0, 0, .18))], .006, 'gras'), 'haus')
    for j in range(5): a = j/5*2*math.pi; ebene(kugel(f'bl{x}{j}', p + Vector((math.cos(a)*.035, math.sin(a)*.01, .19 + math.sin(a)*.035)), .025, farbe(f'bm{x}{j}', col, rough=.5, sss=.3), seg=10), 'haus')
for i, (x, y, rx) in enumerate(((590, 618, 16), (560, 636, 18), (522, 656, 20), (478, 680, 22), (430, 706, 24))):
    p = W(x, y, -1.4 - i*.5); p.z = Z0 - .02 - i*.03
    ebene(kugel(f'stein{i}', p, rx/100*1.1, 'stein', sc=(1, .7, .18)), 'haus')

# ---------- Krone: Blätterbüschel ----------
blatt_k = blatt_mesh('blatt_krone', .5, .22)
for i in range(20):
    a = random.random()*math.pi; x = 640 + math.cos(a)*(150 + random.random()*140)*(1 if random.random() < .5 else -1); y = 215 - math.sin(a)*60 + random.random()*90; r = (48 + random.random()*46)/100*1.4
    p = W(x, y, .8 + random.random()*1.2)
    kk = kugel(f'kronenkern{i}', p, r, 'kronekern', seg=16); kk.scale = (1.1, .9, .85); ebene(kk, 'haus')
    belauben(kk, blatt_k, M['krone'], 420, .6)
ebene(blatt_k, 'haus')

# ---------- Mittlerer Dschungel (dunkle Silhouetten mit Dunst) ----------
blatt_p = blatt_mesh('blatt_palme', 1.0, .4)
TX_BUSCH = bpy.data.textures.new('buschform', 'CLOUDS'); TX_BUSCH.noise_scale = .4
M['mittelaub'] = blattmat('mittelaub', (.02, .035, .05), (.035, .06, .07))
for i in range(24):
    x = -60 + i*60 + random.random()*30; Yd = 16 + random.random()*8; k = kY(Yd); h = (110 + random.random()*130)/100*k
    b = W(x, 560, Yd); b.z = Z0 - 1.2
    ebene(zyl(f'mstamm{i}', b + Vector((0, 0, h/2)), .07*k, h, 'mitte', bev=0, v=8), 'mitte')
    for j in range(3 if i % 2 else 2):
        kk = kugel(f'mbusch{i}{j}', b + Vector(((j - 1)*.45*k, random.random()*.5, h*(.8 + .12*j))), (45 + random.random()*40)/100*k, 'mitte', seg=16); ebene(kk, 'mitte')
        belauben(kk, blatt_p, M['mittelaub'], 90, .9*k)
ebene(blatt_p, 'mitte')
mb = box('mitteboden', W(640, 600, 20) + Vector((0, 0, -1.5)), (80, 6, 2), 'mitte', bev=0); mb.location.z = Z0 - 1.2 - 1; ebene(mb, 'mitte')

# ---------- Ferne Hügel und Riesenbaum am Horizont ----------
Yf = 70
me = bpy.data.meshes.new('fernhuegel'); bm = bmesh.new(); pts = []
for i in range(60):
    x = -100 + i*25; py = 470 - 30*abs(math.sin(i*.7)) - 20*abs(math.sin(i*.23)); pts.append(W(x, py, Yf))
unten = [W(1400, 900, Yf), W(-150, 900, Yf)]
f = bm.faces.new([bm.verts.new(p) for p in pts + unten]); bm.to_mesh(me); bm.free(); fh = obj('fernhuegel', me); fh.data.materials.append(M['fern']); ebene(fh, 'fern')
rb = W(1150, 470, Yf); k = kY(Yf)
ebene(zyl('riesenstamm', rb + Vector((0, 0, 1.05*k)), .08*k, 2.1*k, 'fern', bev=0, v=8), 'fern')
for dx, dy, r in ((0, -230, 30), (-26, -214, 22), (26, -212, 22), (-12, -250, 20), (14, -248, 18), (0, -270, 14)):
    ebene(kugel(f'riesenkrone{dx}{dy}', W(1150 + dx, 470 + dy, Yf), r/100*k, 'fern', seg=16), 'fern')

# ---------- Vordergrund: Büsche (Blätter) und große Blätter in den Ecken ----------
blatt_b = blatt_mesh('blatt_busch', .9, .32)
BUESCHE = [(40, 690, 7, 1.2), (230, 715, 6, 1), (380, 735, 4, .8), (930, 730, 5, .9), (1090, 700, 7, 1.15), (1260, 680, 6, 1.2)]
for bi, (x, y, n, s) in enumerate(BUESCHE):
    for j in range(n):
        p = W(x + (random.random() - .5)*170*s, y - random.random()*70*s, -3.0)
        kk = kugel(f'busch{bi}{j}', p, (34 + random.random()*32)*s/100*.85, 'kronekern', seg=12); ebene(kk, 'busch')
        belauben(kk, blatt_b, M['busch'], 70, .7)
ebene(blatt_b, 'busch')
gross_blatt = []
for i, (x, y, l, w0, s) in enumerate(((-30, 760, 330, -1.05, 1), (40, 770, 260, -.7, 1), (1320, 760, 330, -2.1, -1), (1240, 775, 250, -2.45, -1))):
    bo = blatt_mesh(f'eckblatt{i}', l/100*.62, l/100*.62*.32); bo.location = W(x, y, -5.2); bo.rotation_euler = (math.pi/2 - .2, 0, 0)
    bo.rotation_euler = (0, -w0 if s > 0 else -w0, 0); bo.rotation_euler = (math.pi/2, -w0, 0)
    sm = bo.modifiers.new('s', 'SUBSURF'); sm.levels = 2; sm.render_levels = 2
    bo.data.materials.append(blattmat(f'eckm{i}', (.01, .035, .02), (.02, .06, .03))); ebene(bo, 'blatt')

# ---------- Licht ----------
bpy.ops.object.light_add(type='SUN', location=(0, 0, 10)); L = bpy.context.object; L.data.energy = 2.2; L.data.color = (.6, .68, 1); L.data.angle = .08
L.rotation_euler = (math.radians(55), 0, math.radians(-150)); ebene(L, 'licht')
bpy.ops.object.light_add(type='AREA', location=(6.4, 30, 1.5)); L = bpy.context.object; L.data.energy = 9000; L.data.size = 25; L.data.color = (1, .55, .35)
L.rotation_euler = (Vector((6.4, 0, 2.5)) - L.location).to_track_quat('-Z', 'Y').to_euler(); ebene(L, 'licht')   # Abendrot hinter dem Baum: warmer Randlicht-Saum
w = bpy.data.worlds.new('welt'); S.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.09, .09, .2, 1); w.node_tree.nodes['Background'].inputs[1].default_value = 1.6
w.mist_settings.start = 12; w.mist_settings.depth = 80; w.mist_settings.falloff = 'LINEAR'

# ---------- Kamera, Ebenen, Rendern ----------
cam = bpy.data.cameras.new('cam'); cam.lens = 18/0.64; cam.sensor_width = 36; cam.sensor_fit = 'HORIZONTAL'
co = obj('cam', cam); co.location = (6.4, -CAM_D, CAM_Z); co.rotation_euler = (math.pi/2, 0, 0); S.camera = co
S.render.engine = 'CYCLES'; S.cycles.device = 'CPU'; S.cycles.samples = SAMPLES; S.cycles.use_denoising = True; S.cycles.max_bounces = 5
S.render.resolution_x = int(1280*RES); S.render.resolution_y = int(720*RES); S.render.film_transparent = True
S.view_settings.view_transform = 'AgX'; S.view_settings.look = 'AgX - Medium High Contrast'
S.render.image_settings.file_format = 'PNG'; S.render.image_settings.color_mode = 'RGBA'; S.render.filepath = OUT
S.view_layers[0].use_pass_mist = True
S.use_nodes = True; nt = S.node_tree
for nd in list(nt.nodes):
    if nd.type not in ('R_LAYERS', 'COMPOSITE'): nt.nodes.remove(nd)
rl = nt.nodes['Render Layers']; cp = nt.nodes['Composite']
mix = nt.nodes.new('CompositorNodeMixRGB'); mix.inputs[2].default_value = (.16, .13, .28, 1)
mf = nt.nodes.new('CompositorNodeMath'); mf.operation = 'MULTIPLY'; mf.inputs[1].default_value = .7
nt.links.new(rl.outputs['Mist'], mf.inputs[0]); nt.links.new(mf.outputs[0], mix.inputs[0]); nt.links.new(rl.outputs['Image'], mix.inputs[1])
gl = nt.nodes.new('CompositorNodeGlare'); gl.glare_type = 'FOG_GLOW'; gl.threshold = .8; gl.size = 7; gl.mix = -.6
sa = nt.nodes.new('CompositorNodeSetAlpha'); nt.links.new(mix.outputs[0], gl.inputs[0]); nt.links.new(gl.outputs[0], sa.inputs['Image']); nt.links.new(rl.outputs['Alpha'], sa.inputs['Alpha'])
nt.links.new(sa.outputs[0], cp.inputs['Image'])
# Ebene auswählen: alles andere nicht rendern (Lichter bleiben immer)
if EBENE != 'alles':
    drin = set(id(o) for o in EB.get(EBENE, []) + EB.get('licht', []))
    for o in S.objects:
        if o.type in ('MESH', 'CURVE', 'FONT') and id(o) not in drin: o.hide_render = True
    # Blatt-Vorlagen der Partikel müssen sichtbar bleiben, sonst verschwinden die Blätter
    for nm in ('blatt_krone', 'blatt_busch', 'blatt_palme'):
        if nm in S.objects: S.objects[nm].hide_render = False
if AUSSCHNITT:
    x0, y0, x1, y1 = AUSSCHNITT; S.render.use_border = True; S.render.use_crop_to_border = True
    S.render.border_min_x = x0/1280; S.render.border_max_x = x1/1280; S.render.border_min_y = 1 - y1/720; S.render.border_max_y = 1 - y0/720
if os.environ.get('FLUG'):
    # Kameraflug: von der Totale aufs große runde Fenster zu und bis in die Fensteröffnung.
    # Je Bild: Bild mit Alpha (Fenster und Himmel durchsichtig) + Lage des Fensters und der gedachten Zimmer-Ebene dahinter.
    from bpy_extras.object_utils import world_to_camera_view
    from mathutils import Quaternion
    ZIEL = os.environ['FLUG']; os.makedirs(ZIEL, exist_ok=True)
    N_BILD = int(os.environ.get('FLUG_BILDER', '120')); HALT = int(os.environ.get('FLUG_HALT', '24'))
    S.cycles.seed = 5; S.render.use_persistent_data = True
    if os.environ.get('THREADS'): S.render.threads_mode = 'FIXED'; S.render.threads = int(os.environ['THREADS'])
    p, n, r = GROSS['p'], GROSS['n'], GROSS['r']
    from mathutils import Matrix
    t_ = Vector((-n.y, n.x, 0)).normalized(); up = Vector((0, 0, 1)); ROT = Matrix((t_, up, n)).transposed().to_4x4()   # lokale Z-Achse = aus dem Stamm heraus
    def setze(o, mitte): o.matrix_world = Matrix.Translation(mitte) @ ROT; return o
    S.objects['loch705'].hide_render = True; [o for o in S.objects if o.type == 'LIGHT' and (o.location - (p + n*.6)).length < .01][0].data.energy = 30   # statt Kugel-Loch: echtes Fenster mit Laibung
    TIEF, RL = .5, r*.99
    # Stammrinde im Fensterkreis durchsichtig (Loch für die Laibung)
    mh = M['rinde'].copy(); stamm.data.materials[0] = mh; N_ = mh.node_tree.nodes; L_ = mh.node_tree.links; out = N_['Material Output']; bsdf = out.inputs['Surface'].links[0].from_node
    ge = N_.new('ShaderNodeNewGeometry'); d_ = N_.new('ShaderNodeVectorMath'); d_.operation = 'SUBTRACT'; d_.inputs[1].default_value = p; L_.new(ge.outputs['Position'], d_.inputs[0])
    al = N_.new('ShaderNodeVectorMath'); al.operation = 'DOT_PRODUCT'; al.inputs[1].default_value = n; L_.new(d_.outputs[0], al.inputs[0])
    sc = N_.new('ShaderNodeVectorMath'); sc.operation = 'SCALE'; sc.inputs[0].default_value = n; L_.new(al.outputs['Value'], sc.inputs['Scale'])
    pe = N_.new('ShaderNodeVectorMath'); pe.operation = 'SUBTRACT'; L_.new(d_.outputs[0], pe.inputs[0]); L_.new(sc.outputs[0], pe.inputs[1])
    ln = N_.new('ShaderNodeVectorMath'); ln.operation = 'LENGTH'; L_.new(pe.outputs[0], ln.inputs[0])
    m1 = N_.new('ShaderNodeMath'); m1.operation = 'LESS_THAN'; m1.inputs[1].default_value = RL; L_.new(ln.outputs['Value'], m1.inputs[0])
    m2 = N_.new('ShaderNodeMath'); m2.operation = 'GREATER_THAN'; m2.inputs[1].default_value = -1.5; L_.new(al.outputs['Value'], m2.inputs[0])
    mm = N_.new('ShaderNodeMath'); mm.operation = 'MULTIPLY'; L_.new(m1.outputs[0], mm.inputs[0]); L_.new(m2.outputs[0], mm.inputs[1])
    tr = N_.new('ShaderNodeBsdfTransparent'); mx = N_.new('ShaderNodeMixShader'); L_.new(mm.outputs[0], mx.inputs['Fac']); L_.new(bsdf.outputs[0], mx.inputs[1]); L_.new(tr.outputs[0], mx.inputs[2]); L_.new(mx.outputs[0], out.inputs['Surface'])
    # Laibung: Röhre aus hellem Holz in den Stamm hinein
    import bmesh as _bm
    me = bpy.data.meshes.new('laibung'); bm = _bm.new(); NS = 64
    ringe = [[bm.verts.new(Vector((math.cos(a)*RL, math.sin(a)*RL, z))) for a in [k/NS*2*math.pi for k in range(NS)]] for z in (.14, -TIEF)]
    for k in range(NS): bm.faces.new((ringe[0][k], ringe[1][k], ringe[1][(k + 1) % NS], ringe[0][(k + 1) % NS]))
    bm.to_mesh(me); bm.free(); lai = obj('laibung', me); lai.data.materials.append(holz('laibholz', (.3, .17, .08), (.5, .32, .16), sk=10)); setze(lai, p)
    for pg in me.polygons: pg.use_smooth = True
    ebene(lai, 'haus')
    # hinten: Öffnung ins Zimmer (wird beim Zusammensetzen mit dem Zimmer gefüllt), mit innerem Rahmen
    bpy.ops.mesh.primitive_circle_add(vertices=64, radius=RL*1.01, fill_type='NGON'); hd = bpy.context.object; hd.name = 'zimmeroeffnung'; hd.is_holdout = True; setze(hd, p - n*(TIEF - .02)); ebene(hd, 'haus')
    bpy.ops.mesh.primitive_torus_add(major_radius=RL - .01, minor_radius=.035, major_segments=64, minor_segments=12); ir = bpy.context.object; ir.name = 'innenrahmen'; ir.data.materials.append(M['dunkelholz']); bpy.ops.object.shade_smooth(); setze(ir, p - n*(TIEF - .06)); ebene(ir, 'haus')
    # Fensterkreuz + Glasleiste (wie im Zimmer) und Scheibe
    GT = .16
    for nm, dims in (('sprosse_h', (2*RL, .055, .05)), ('sprosse_v', (.055, 2*RL, .05))):
        bpy.ops.mesh.primitive_cube_add(size=1); b_ = bpy.context.object; b_.name = nm; b_.scale = dims; bpy.ops.object.transform_apply(scale=True); b_.data.materials.append(M['dunkelholz']); bevel(b_, .012); setze(b_, p - n*GT); ebene(b_, 'haus')
    bpy.ops.mesh.primitive_torus_add(major_radius=RL - .015, minor_radius=.028, major_segments=64, minor_segments=12); gl = bpy.context.object; gl.name = 'glasleiste'; gl.data.materials.append(M['messing']); bpy.ops.object.shade_smooth(); setze(gl, p - n*GT); ebene(gl, 'haus')
    gm = bpy.data.materials.new('fensterglas'); gm.use_nodes = True; G = gm.node_tree.nodes; GL = gm.node_tree.links
    for x_ in list(G): G.remove(x_)
    go = G.new('ShaderNodeOutputMaterial'); gt = G.new('ShaderNodeBsdfTransparent'); gg = G.new('ShaderNodeBsdfGlossy'); gg.inputs['Color'].default_value = (.9, .95, 1, 1)
    no = G.new('ShaderNodeTexNoise'); no.inputs['Scale'].default_value = 6; no.inputs['Detail'].default_value = 4
    mr = G.new('ShaderNodeMapRange'); mr.inputs['To Min'].default_value = .02; mr.inputs['To Max'].default_value = .12; GL.new(no.outputs['Fac'], mr.inputs['Value']); GL.new(mr.outputs['Result'], gg.inputs['Roughness'])   # leichte Schlieren
    lw = G.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = .35
    fa = G.new('ShaderNodeMath'); fa.operation = 'MULTIPLY_ADD'; fa.inputs[1].default_value = .55; fa.inputs[2].default_value = .16; fa.use_clamp = True; GL.new(lw.outputs['Fresnel'], fa.inputs[0])
    gx = G.new('ShaderNodeMixShader'); GL.new(fa.outputs[0], gx.inputs['Fac']); GL.new(gt.outputs[0], gx.inputs[1]); GL.new(gg.outputs[0], gx.inputs[2]); GL.new(gx.outputs[0], go.inputs['Surface'])
    bpy.ops.mesh.primitive_circle_add(vertices=64, radius=RL, fill_type='NGON'); glas = bpy.context.object; glas.name = 'fensterglas'; glas.data.materials.append(gm); setze(glas, p - n*(GT + .005)); ebene(glas, 'haus')
    # warmes Zimmerlicht in der Laibung (beleuchtet Holz und Kreuz von hinten)
    bpy.ops.object.light_add(type='POINT', location=p - n*(TIEF - .1)); LZ = bpy.context.object; LZ.data.energy = 18; LZ.data.color = (1, .62, .32); LZ.data.shadow_soft_size = .25; ebene(LZ, 'licht')
    # weicher Himmels-Schimmer: leuchtende Fläche hinter der Kamera, nur in Spiegelungen sichtbar
    bpy.ops.mesh.primitive_plane_add(size=1, location=(p.x - 1.5, p.y - 6, p.z + 1.8), rotation=(math.pi/2 - .3, 0, 0)); karte = bpy.context.object; karte.scale = (10, 7, 1)
    km = bpy.data.materials.new('schimmer'); km.use_nodes = True; kn = km.node_tree.nodes; kb = kn['Principled BSDF']; kb.inputs['Base Color'].default_value = (0, 0, 0, 1)
    tc = kn.new('ShaderNodeTexCoord'); gr = kn.new('ShaderNodeTexGradient'); km.node_tree.links.new(tc.outputs['Generated'], gr.inputs['Vector'])
    cr = kn.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (.04, .05, .14, 1); cr.color_ramp.elements[1].color = (.5, .56, .9, 1)
    km.node_tree.links.new(gr.outputs['Fac'], cr.inputs['Fac']); km.node_tree.links.new(cr.outputs['Color'], kb.inputs['Emission Color']); kb.inputs['Emission Strength'].default_value = 1.2
    karte.data.materials.append(km); karte.visible_camera = False; karte.visible_diffuse = False; karte.visible_shadow = False; karte.visible_transmission = False
    # Kamerafahrt: gerade aufs Fenster zu, bis es das Bild fast füllt; danach (Überblendung ins Zimmer) noch etwas langsam weiter
    c0 = co.location.copy(); q0 = co.rotation_euler.to_quaternion(); tanv = 18/cam.lens*9/16
    DEND = (RL + .13)/(.92*596/720*tanv); c_end = p + n*DEND; vorn = -n; q1 = vorn.to_track_quat('-Z', 'Y'); rechts = Vector((vorn.y, -vorn.x, 0)).normalized(); N_UEB = int(os.environ.get('FLUG_UEBERBLENDEN', '16'))
    D = 4.0; tanh = 18/cam.lens; WP = 2*D*tanh*1.5; HP = WP*9/16; ex = Vector((1, 0, 0))
    mitte = c_end + vorn*D; ecken = [mitte - ex*WP/2 + up*HP/2, mitte + ex*WP/2 + up*HP/2, mitte + ex*WP/2 - up*HP/2, mitte - ex*WP/2 - up*HP/2]
    fern0 = c0 + Vector((0, 1, 0))*1000
    oeff = [p - n*(TIEF - .02) + (t_*math.cos(a) + up*math.sin(a))*RL*1.01 for a in [k/96*2*math.pi for k in range(96)]]
    LW = float(os.environ.get('FLUG_LINSE', '.6'))   # Zimmerkamera beim Anflug weitwinklig (ganzes Zimmer im Fenster), in der Überblendung zurück auf die Totale
    von, bis = int(os.environ.get('VON', '0')), int(os.environ.get('BIS', '99999'))
    for i in range(N_BILD + N_UEB):
        if i < von or i > bis: continue
        u = (i - HALT)/(N_BILD - 1 - HALT)
        if u <= 0: e = 0
        elif u <= 1: e = .75*u*u*u*(u*(u*6 - 15) + 10) + .25*u*u*(2 - u)   # sanft an, am Ende noch leicht in Fahrt
        else: e = 1 + .25*(u - 1)
        co.location = c0.lerp(c_end, e); co.rotation_euler = q0.slerp(q1, min(1, max(0, e))).to_euler(); bpy.context.view_layer.update()
        def pr(v): q = world_to_camera_view(S, co, Vector(v)); return [q.x*1280, (1 - q.y)*720, q.z]
        d_ = co.location - c_end; dl = Vector((d_.dot(rechts), -d_.dot(n), d_.dot(up))) if i < N_BILD else Vector((0, 0, 0))   # in Zimmer-Achsen (rechts, vorwärts, oben)
        info = {'ecken': [pr(v) for v in ecken], 'oeffnung': [pr(v) for v in oeff], 'fern': pr(fern0), 'u': u, 'delta': list(dl),
                'ueberblendung': max(0, (i - N_BILD + 1)/N_UEB), 'linse': LW + (1 - LW)*(lambda w: w*w*(3 - 2*w))(max(0, (i - N_BILD + 1)/N_UEB))}
        ziel = f'{ZIEL}/a_{i:04d}.png'
        if not os.path.exists(ziel):
            S.render.filepath = ziel; bpy.ops.render.render(write_still=True)
        json.dump(info, open(f'{ZIEL}/a_{i:04d}.json', 'w')); print('FLUG', i, flush=True)
    raise SystemExit
from bpy_extras.object_utils import world_to_camera_view
bpy.context.view_layer.update()
def bp(v): q = world_to_camera_view(S, co, Vector(v)); return [round(q.x*1280, 1), round((1 - q.y)*720, 1)]
json.dump({'lichterkette': LK, 'laterne': bp(lp), 'fenster': FENSTER, 'rauch': bp(op + Vector((0, 0, .68)))}, open(OUT.replace('.png', '.json'), 'w'))
bpy.ops.render.render(write_still=True)
print('fertig', OUT)
