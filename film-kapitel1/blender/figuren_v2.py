# Figuren aus dem Spiel (Teile mit Weltmatrix, Geometrie, Farben, Fell) als echte 3D-Modelle in Blender
import bpy, bmesh, math
from mathutils import Matrix, Vector
YD = {'schwein': 0.0, 'affe': 0.0, 'prof': 0.36}   # Tiefe der Figurenmitte (Rücken an der Lehne)
FELL_DICHTE = 1400
def _farbe(rgb): return tuple(c**2.2 for c in rgb)   # Spiel-Farben sind sRGB -> linear
_cache = {}
def _mat_fell(root, tip, name):
    key = ('f', tuple(root), tuple(tip))
    if key in _cache: return _cache[key]
    m = bpy.data.materials.new(name); m.use_nodes = True; N = m.node_tree.nodes; L = m.node_tree.links; b = N['Principled BSDF']
    b.inputs['Base Color'].default_value = (*_farbe(root), 1); b.inputs['Roughness'].default_value = .8
    b.inputs['Sheen Weight'].default_value = 1; b.inputs['Sheen Tint'].default_value = (*_farbe(tip), 1); b.inputs['Sheen Roughness'].default_value = .4
    b.inputs['Subsurface Weight'].default_value = .15; b.inputs['Subsurface Radius'].default_value = (.3, .15, .1)
    tc = N.new('ShaderNodeTexCoord'); no = N.new('ShaderNodeTexNoise'); no.inputs['Scale'].default_value = 140; no.inputs['Detail'].default_value = 4
    L.new(tc.outputs['Object'], no.inputs['Vector']); bu = N.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = .35; L.new(no.outputs['Fac'], bu.inputs['Height']); L.new(bu.outputs['Normal'], b.inputs['Normal'])
    _cache[key] = m; return m
def _mat_haar(root, tip, name):
    key = ('h', tuple(root), tuple(tip))
    if key in _cache: return _cache[key]
    m = bpy.data.materials.new(name); m.use_nodes = True; N = m.node_tree.nodes; L = m.node_tree.links
    for n in list(N):
        if n.type != 'OUTPUT_MATERIAL': N.remove(n)
    hb = N.new('ShaderNodeBsdfHairPrincipled'); hb.parametrization = 'COLOR'; hi = N.new('ShaderNodeHairInfo')
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.inputs['A'].default_value = (*_farbe(root), 1); mx.inputs['B'].default_value = (*_farbe(tip), 1)
    L.new(hi.outputs['Intercept'], mx.inputs['Factor']); L.new(mx.outputs['Result'], hb.inputs['Color'])
    hb.inputs['Roughness'].default_value = .45; hb.inputs['Radial Roughness'].default_value = .7; hb.inputs['Coat'].default_value = .1
    L.new(hb.outputs[0], N['Material Output'].inputs['Surface'])
    _cache[key] = m; return m
def _mat_glatt(col, spec, emit, alpha, name):
    key = ('g', tuple(col), spec, emit, alpha)
    if key in _cache: return _cache[key]
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*_farbe(col), 1); b.inputs['Roughness'].default_value = .15 if spec > 50 else .45 if spec > 15 else .7
    if emit > .5: b.inputs['Base Color'].default_value = (.62, .62, .64, 1); b.inputs['Emission Color'].default_value = (1, 1, 1, 1); b.inputs['Emission Strength'].default_value = float(__import__('os').environ.get('AUGEN_GLANZ', '.12'))   # Lichtpunkte in den Augen: dezent
    if alpha < 1: b.inputs['Alpha'].default_value = alpha; m.blend_method = 'BLEND'
    if spec > 50: b.inputs['Coat Weight'].default_value = .6
    _cache[key] = m; return m
def figur_bauen(S, name, F, FR, W, kY, fell=True, bademantel=False, collection=None):
    b = F['bild']; s_px = b['w']/(FR['x1'] - FR['x0']); Yd = YD[name]; k = kY(Yd); cc = s_px/100*k
    Am = Matrix(((cc, 0, 0), (0, 0, -cc), (0, cc, 0)))
    off = Vector((6.4 + (b['x'] - FR['x0']*s_px - 640)/100*k, Yd, 2.82 + (360 - b['y'] - FR['y1']*s_px)/100*k))
    meshes = {}
    for gid, g in F['geos'].items():
        me = bpy.data.meshes.new(f'{name}_g{gid}'); pos = g['pos']; idx = g['idx']
        me.from_pydata([tuple(pos[i:i + 3]) for i in range(0, len(pos), 3)], [], [tuple(idx[i:i + 3]) for i in range(0, len(idx), 3)])
        me.validate(); 
        for p in me.polygons: p.use_smooth = True
        meshes[gid] = me
    obs = []; koerper = None
    for i, t in enumerate(F['teile']):
        w = t['m']; W3 = Matrix(((w[0], w[4], w[8]), (w[1], w[5], w[9]), (w[2], w[6], w[10]))); tt = Vector((w[12], w[13], w[14]))
        M3 = Am @ W3; T = Am @ tt + off
        o = bpy.data.objects.new(f'{name}_{i}', meshes[str(t['g'])]); (collection or S.collection).objects.link(o)
        o.matrix_world = Matrix(((*M3[0], T.x), (*M3[1], T.y), (*M3[2], T.z), (0, 0, 0, 1)))
        root, tip = t['root'], t['tip']
        if t['fur']:
            o.data = o.data.copy(); o.data.materials.append(_mat_fell(root, tip, f'{name}fell'))
            vol = abs(M3.determinant())
            if fell and vol > 1e-5:
                o.modifiers.new('fell', 'PARTICLE_SYSTEM'); ps = o.particle_systems[-1].settings
                flaeche = 4*math.pi*vol**(2/3); ps.type = 'HAIR'; ps.count = int(min(9000, max(300, flaeche*FELL_DICHTE)))
                ps.hair_length = max(.012, t['len']*cc*1.1); ps.child_type = 'INTERPOLATED'; ps.rendered_child_count = int(__import__('os').environ.get('KINDER', '10')); ps.child_radius = .03
                ps.root_radius = 1; ps.tip_radius = .1; ps.radius_scale = .0035; ps.use_advanced_hair = True
                ps.roughness_2 = .02; ps.roughness_endpoint = .004; ps.material = 2
                o.data.materials.append(_mat_haar(root, tip, f'{name}haar'))
            if koerper is None or vol > koerper[1]: koerper = (o, vol, root)
        else:
            o.data = o.data.copy(); o.data.materials.append(_mat_glatt(root, t['spec'], t['emit'], t['alpha'], f'{name}glatt'))
        obs.append(o)
    return obs, Am, off
def matrizen(name, F, FR, W, kY):   # Weltmatrizen aller Teile für ein Bild (Position aus dem Bild-Rechteck)
    b = F['bild']; s_px = b['w']/(FR['x1'] - FR['x0']); Yd = YD[name]; k = kY(Yd); cc = s_px/100*k
    Am = Matrix(((cc, 0, 0), (0, 0, -cc), (0, cc, 0)))
    off = Vector((6.4 + (b['x'] - FR['x0']*s_px - 640)/100*k, Yd, 2.82 + (360 - b['y'] - FR['y1']*s_px)/100*k))
    out = []
    for t in F['teile']:
        w = t['m']; W3 = Matrix(((w[0], w[4], w[8]), (w[1], w[5], w[9]), (w[2], w[6], w[10]))); tt = Vector((w[12], w[13], w[14]))
        M3 = Am @ W3; T = Am @ tt + off; out.append((Matrix(((*M3[0], T.x), (*M3[1], T.y), (*M3[2], T.z), (0, 0, 0, 1))), t['v']))
    return out, cc

# ---------- Bademantel für den Professor ----------
def bademantel(S, obs, F, name='prof'):
    teile = F['teile']; koerper = obs[0]; KM = koerper.matrix_world.copy(); inv = KM.inverted()
    RD, BK = (0xb5/255, 0x16/255, 0x1f/255), (0x14/255, 0x14/255, 0x18/255)
    nah = lambda a, b: all(abs(x - y) < .02 for x, y in zip(a, b))
    frottee = bpy.data.materials.new('frottee'); frottee.use_nodes = True; N = frottee.node_tree.nodes; L = frottee.node_tree.links; b = N['Principled BSDF']
    b.inputs['Base Color'].default_value = (.32, .035, .05, 1); b.inputs['Roughness'].default_value = .9; b.inputs['Sheen Weight'].default_value = .8; b.inputs['Sheen Tint'].default_value = (1, .7, .7, 1)
    tc = N.new('ShaderNodeTexCoord'); vo = N.new('ShaderNodeTexVoronoi'); vo.inputs['Scale'].default_value = 260; L.new(tc.outputs['Object'], vo.inputs['Vector'])
    no = N.new('ShaderNodeTexNoise'); no.inputs['Scale'].default_value = 30; L.new(tc.outputs['Object'], no.inputs['Vector'])
    bu = N.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = .6; L.new(vo.outputs['Distance'], bu.inputs['Height']); L.new(bu.outputs['Normal'], b.inputs['Normal'])
    rand = frottee.copy(); rand.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (.42, .06, .07, 1)
    for o, t in zip(obs, teile):
        c = inv @ o.matrix_world.translation
        if c.length < 1.25 and (nah(t['root'], RD) or (nah(t['root'], BK) and min(o.matrix_world.to_scale()) < .06) or (not t['fur'] and nah(t['root'], BK))): o.hide_render = True; o.hide_viewport = True
        sc = o.matrix_world.to_3x3() @ Vector((0, 1, 0))
        if t['fur'] and nah(t['root'], BK) and c.length < 1.6 and c.y > .1 and sc.length > 1.35*(o.matrix_world.to_3x3() @ Vector((1, 0, 0))).length:   # Oberarm -> Ärmel
            o.data.materials.clear(); o.data.materials.append(frottee)
            for m in list(o.modifiers): o.modifiers.remove(m)
    # Mantel: Hülle um den Körper, oben offen (Hals) und vorn ein V (cremefarbene Brust schaut heraus)
    me = bpy.data.meshes.new('mantel'); bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=72, v_segments=40, radius=1)
    weg = [f for f in bm.faces if any(v.co.z > .6 or (v.co.y < -.45 and abs(v.co.x) < .36*(v.co.z + .45) and v.co.z > -.25) for v in f.verts)]
    bmesh.ops.delete(bm, geom=weg, context='FACES')
    # Blender-Kugel: z = oben, -y = vorn  -> in Spiel-Körperkoordinaten umstellen (y oben, z vorn)
    R = Matrix(((1, 0, 0), (0, 0, 1), (0, -1, 0))).to_4x4()
    bm.to_mesh(me); bm.free(); mt = bpy.data.objects.new('bademantel', me); S.collection.objects.link(mt)
    mt.matrix_world = KM @ Matrix.Scale(1.075, 4) @ R
    for p in me.polygons: p.use_smooth = True
    me.materials.append(frottee); so = mt.modifiers.new('d', 'SOLIDIFY'); so.thickness = .035; so.offset = 1; sm = mt.modifiers.new('s', 'SUBSURF'); sm.levels = 1; sm.render_levels = 2
    welle = bpy.data.textures.new('mantelfalten', 'CLOUDS'); welle.noise_scale = .35; dp = mt.modifiers.new('f', 'DISPLACE'); dp.texture = welle; dp.strength = .03
    # Schalkragen entlang des V und um den Nacken, Gürtel mit Knoten und Enden, aufgesetzte Tasche
    def P(x, y, z, r=1.12): v = Vector((x, y, z)); v = v/v.length*r; return KM @ v
    kr = []
    for i in range(13): y = .55 - i/12*.75; x = -.36*(y + .45); kr.append(P(x, y, math.sqrt(max(0, 1 - x*x - y*y))))
    for i in range(1, 13): y = -.2 + i/12*.75; x = .36*(y + .45); kr.append(P(x, y, math.sqrt(max(0, 1 - x*x - y*y))))
    for i in range(1, 16): a = i/16*math.pi; kr.append(P(math.cos(a)*.62*1, .6, -math.sin(a)*.75 + .05))
    cu = bpy.data.curves.new('kragen', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = .075; cu.bevel_resolution = 4; sp = cu.splines.new('NURBS'); sp.points.add(len(kr) - 1)
    for q, v in zip(sp.points, kr): q.co = (*v, 1)
    sp.order_u = 4; sp.use_endpoint_u = True; cu.materials.append(rand); S.collection.objects.link(bpy.data.objects.new('kragen', cu))
    gp = [P(math.cos(a)*.99, -.2, math.sin(a)*.99, 1.13) for a in [i/40*2*math.pi for i in range(41)]]
    cu = bpy.data.curves.new('guertel', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = .03; cu.bevel_resolution = 3; sp = cu.splines.new('POLY'); sp.points.add(len(gp) - 1)
    for q, v in zip(sp.points, gp): q.co = (*v, 1)
    cu.materials.append(rand); S.collection.objects.link(bpy.data.objects.new('guertel', cu))
    kn = P(.25, -.2, .96, 1.16)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=.06, location=kn); k_ = bpy.context.object; k_.name = 'guertelknoten'; k_.scale = (1.3, .8, 1); k_.data.materials.append(rand); bpy.ops.object.shade_smooth()
    for dx in (-.08, .1):
        e0 = kn; e1 = kn + Vector((dx, -.05, -.42)); cu = bpy.data.curves.new('ende', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = .026; sp = cu.splines.new('POLY'); sp.points.add(2)
        for q, v in zip(sp.points, (e0, (e0 + e1)/2 + Vector((dx*.3, -.03, 0)), e1)): q.co = (*v, 1)
        cu.materials.append(rand); S.collection.objects.link(bpy.data.objects.new('guertelende', cu))
    tp = P(-.48, -.42, .75, 1.13)
    bpy.ops.mesh.primitive_cube_add(size=1, location=tp); ta = bpy.context.object; ta.name = 'manteltasche'; ta.scale = (.3, .05, .26); ta.data.materials.append(rand)
    n = (tp - KM.translation).normalized(); ta.rotation_euler = n.to_track_quat('Y', 'Z').to_euler()
    bv = ta.modifiers.new('b', 'BEVEL'); bv.width = .03; bv.segments = 3
    neu = [mt] + [o for o in S.objects if o.name.startswith(('kragen', 'guertel', 'manteltasche')) and o.parent is None and o not in obs]
    for o in neu: o.parent = koerper; o.matrix_parent_inverse = koerper.matrix_world.inverted()
    return mt
