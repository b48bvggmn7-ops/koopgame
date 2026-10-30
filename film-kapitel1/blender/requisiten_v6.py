# Requisiten und Sitz-Ebenen fürs Sternenzimmer (Blender/Cycles), aufbauend auf zimmer.py:
#  sofa_s / sofa_sa : Sofa mit Delle + Schatten (nur Schweinchen / Schweinchen + Affe)   -> volle Farbe, Ausschnitt
#  sessel_p        : Sessel mit Delle + Schatten des Professors
#  keks / buendel / zettel_liegt : einzelne Dinge als durchsichtige Ebene mit ihrem Schatten (Schattenfänger)
#  decke_<n>       : Stoff-Simulation der Decke, Bild n (durchsichtige Ebene)
#  spr_keks<b> / spr_zettel / spr_buendel : Einzelbilder (Sprites) für Dinge in der Pfote
import bpy, bmesh, json, sys, math, os, random, time
from mathutils import Matrix, Vector
A = sys.argv[sys.argv.index('--') + 1:]
OUT, MODUS, SAMPLES, RES = A[0], A[1], int(A[2]), float(A[3]); D = json.load(open(A[4])); ZS = A[5]
sys.argv = [sys.argv[0], '--', OUT, str(SAMPLES), str(RES), 'requisiten']
src = open(ZS).read().replace("bpy.ops.render.render(write_still=True)\nprint('fertig', OUT)", "")
exec(compile(src, 'zimmer.py', 'exec'))
HIER = os.path.dirname(os.path.abspath(ZS))
def bild_tex(name, datei, rough=.8, bump=None, bstark=.3):
    m, nt, b = node_mat(name); N = nt.nodes; L = nt.links
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(HIER, datei)); L.new(tx.outputs['Color'], b.inputs['Base Color'])
    if bump:
        th = N.new('ShaderNodeTexImage'); th.image = bpy.data.images.load(os.path.join(HIER, bump)); th.image.colorspace_settings.name = 'Non-Color'
        bu = N.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = bstark; L.new(th.outputs['Color'], bu.inputs['Height']); L.new(bu.outputs['Normal'], b.inputs['Normal'])
    b.inputs['Roughness'].default_value = rough; b.inputs['Sheen Weight'].default_value = .4
    return m
STRICK = bild_tex('strick', 'strick_farbe.png', .95, 'strick_hoehe.png', .6)
PAPIER = bild_tex('papierz', 'zettel_tex.png', .85)
PAPIER.node_tree.nodes['Principled BSDF'].inputs['Subsurface Weight'].default_value = .15

def anwenden(o):
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
    o.select_set(False)
def verdichten(o, lv=2):
    m = o.modifiers.new('dicht', 'SUBSURF'); m.levels = lv; m.render_levels = lv; anwenden(o)
def delle(o, cx, cy, rx, ry, tiefe, achse='z'):
    anwenden(o); verdichten(o, 1)
    mw = o.matrix_world; inv = mw.inverted()
    for v in o.data.vertices:
        w = mw @ v.co
        if achse == 'z': d = ((w.x - cx)/rx)**2 + ((w.y - cy)/ry)**2
        else: d = ((w.x - cx)/rx)**2 + ((w.z - cy)/ry)**2
        f = math.exp(-d*2.0) - .22*math.exp(-(math.sqrt(d) - 1.25)**2*5)
        if achse == 'z': w.z -= tiefe*f*max(0, min(1, (w.z - (o.location.z - .05))/.2))
        else: w.y += tiefe*f*max(0, min(1, (o.location.y + .05 - w.y)/.15))
        v.co = inv @ w
def platzhalter(fig, sichtbar=False):
    FR = D['FR']; F = D[fig]; b = F['bild']; s_px = b['w']/(FR['x1'] - FR['x0'])
    Yd = {'schwein': .3, 'affe': .3, 'prof': .4}[fig]; k = (10 + Yd)/10; cc = s_px/100*k
    Am = Matrix(((cc, 0, 0), (0, 0, -cc*.55), (0, cc, 0)))   # in der Tiefe flacher: die Figuren sind ja nur Bilder vor der Lehne
    off = Vector((6.4 + (b['x'] - FR['x0']*s_px - 640)/100*k, Yd, 2.82 + (360 - b['y'] - FR['y1']*s_px)/100*k))
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=24, ring_count=12); vor = bpy.context.object; me = vor.data; bpy.data.objects.remove(vor)
    obs = []
    for i, w in enumerate(F['teile']):
        W3 = Matrix(((w[0], w[4], w[8]), (w[1], w[5], w[9]), (w[2], w[6], w[10]))); t = Vector((w[12], w[13], w[14]))
        M3 = Am @ W3; T = Am @ t + off
        o = bpy.data.objects.new(f'platz_{fig}{i}', me); S.collection.objects.link(o)
        o.matrix_world = Matrix(((*M3[0], T.x), (*M3[1], T.y), (*M3[2], T.z), (0, 0, 0, 1)))
        o.visible_camera = sichtbar; o.visible_glossy = False; o.visible_shadow = os.environ.get('PS', '1') == '1'; obs.append(o)
    return obs
def mitte_x(fig): return W(D[fig]['bild']['x'] + D[fig]['bild']['w']/2, 500, .4).x
def ausschnitt(x0, y0, x1, y1):
    S.render.use_border = True; S.render.use_crop_to_border = True
    S.render.border_min_x = x0/1280; S.render.border_max_x = x1/1280; S.render.border_min_y = 1 - y1/720; S.render.border_max_y = 1 - y0/720
    json.dump([x0, y0, x1, y1], open(OUT.replace('.png', '.json'), 'w'))
def nur(objekte, faenger=()):   # nur diese Dinge sichtbar; faenger fangen den Schatten (im Bild durchsichtig)
    ids = set(id(o) for o in objekte); fid = set(id(o) for o in faenger)
    for o in S.objects:
        if o.type not in ('MESH', 'CURVE', 'FONT'): continue
        if id(o) in ids: continue
        if id(o) in fid: o.is_shadow_catcher = True
        else: o.visible_camera = False
def bbox_px(objs, rand=12):
    from bpy_extras.object_utils import world_to_camera_view
    bpy.context.view_layer.update(); xs, ys = [], []
    for o in objs:
        for c in o.bound_box:
            q = world_to_camera_view(S, S.camera, o.matrix_world @ Vector(c)); xs.append(q.x*1280); ys.append((1 - q.y)*720)
    return [max(0, int(min(xs)) - rand), max(0, int(min(ys)) - rand), min(1280, int(max(xs)) + rand), min(720, int(max(ys)) + rand)]

# ---------- Kekse ----------
KEKSMAT = None
def keks(name, p, r=.12, rot=(0, 0, 0), bisse=0):
    global KEKSMAT
    if KEKSMAT is None:
        m, nt, b = node_mat('keksteig'); N = nt.nodes; L = nt.links
        no = N.new('ShaderNodeTexNoise'); no.inputs['Scale'].default_value = 18; no.inputs['Detail'].default_value = 8
        cr = N.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (.42, .2, .06, 1); cr.color_ramp.elements[1].color = (.78, .5, .22, 1)
        L.new(no.outputs['Fac'], cr.inputs['Fac']); L.new(cr.outputs['Color'], b.inputs['Base Color'])
        bu = N.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = .5; L.new(no.outputs['Fac'], bu.inputs['Height']); L.new(bu.outputs['Normal'], b.inputs['Normal'])
        b.inputs['Roughness'].default_value = .75; KEKSMAT = m
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=r, depth=r*.3, location=p, rotation=rot); o = bpy.context.object; o.name = name
    o.data.materials.append(KEKSMAT); mod_bevel(o, r*.12, 4); sm = o.modifiers.new('s', 'SUBSURF'); sm.levels = 2; sm.render_levels = 2
    tx = bpy.data.textures.new(name + 'krumen', 'CLOUDS'); tx.noise_scale = .03; dp = o.modifiers.new('k', 'DISPLACE'); dp.texture = tx; dp.strength = .008
    bpy.ops.object.shade_smooth()
    schoko = farbe(name + 'schoko', (.07, .03, .015), rough=.35)
    rm = Matrix.Rotation(rot[0], 4, 'X') @ Matrix.Rotation(rot[1], 4, 'Y') @ Matrix.Rotation(rot[2], 4, 'Z') if False else o.matrix_world.to_3x3()
    teile = [o]
    for i in range(7):
        a = i*2.39; rr = r*(.25 + .55*((i*37) % 10)/10)
        q = Vector((math.cos(a)*rr, math.sin(a)*rr, r*.15))
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=r*.11, location=p + (Matrix.Rotation(rot[0], 3, 'X') @ q)); c = bpy.context.object; c.scale = (1, 1, .7); c.data.materials.append(schoko); teile.append(c)
    if bisse:
        for j, (a, br) in enumerate(((math.pi, .46), (math.pi - .85, .42), (math.pi + .8, .5))[:bisse]):
            q = Vector((math.cos(a)*r*.98, math.sin(a)*r*.98, 0)); bz = Matrix.Rotation(rot[0], 3, 'X') @ q
            bpy.ops.mesh.primitive_uv_sphere_add(radius=r*br, location=p + bz); s_ = bpy.context.object; s_.hide_render = True; s_.hide_viewport = True
            for t in teile:
                bo = t.modifiers.new(f'biss{j}', 'BOOLEAN'); bo.object = s_; bo.operation = 'DIFFERENCE'
    return teile
PL = Vector((T.x - .24, T.y - .05, T.z + .045))
TELLER_KEKSE = [keks(f'keks{i}', PL + Vector(o), rot=(0, 0, i)) for i, o in enumerate(((-.2, .08, 0), (-.03, .15, 0), (-.12, -.07, .02)))]
k4p = W(752, 592, T.y - .1); k4p.z = PL.z + .005
KEKS4 = keks('keks4', k4p, rot=(.05, 0, .7))
# ---------- Woll-Karodecke (Material für Bündel und Schoßdecke) ----------
def karo_material():
    m, nt, b = node_mat('karodecke'); N = nt.nodes; L = nt.links
    uv = N.new('ShaderNodeTexCoord'); se = N.new('ShaderNodeSeparateXYZ'); L.new(uv.outputs['UV'], se.inputs[0])
    def band(achse, breite, ort, n=4.5):   # 1 in einem Streifen, sonst 0 (Wiederholung n pro Einheit)
        m1 = N.new('ShaderNodeMath'); m1.operation = 'MULTIPLY'; m1.inputs[1].default_value = n; L.new(se.outputs[achse], m1.inputs[0])
        fr = N.new('ShaderNodeMath'); fr.operation = 'FRACT'; L.new(m1.outputs[0], fr.inputs[0])
        sub = N.new('ShaderNodeMath'); sub.operation = 'SUBTRACT'; sub.inputs[1].default_value = ort; L.new(fr.outputs[0], sub.inputs[0])
        ab = N.new('ShaderNodeMath'); ab.operation = 'ABSOLUTE'; L.new(sub.outputs[0], ab.inputs[0])
        lt = N.new('ShaderNodeMath'); lt.operation = 'LESS_THAN'; lt.inputs[1].default_value = breite; L.new(ab.outputs[0], lt.inputs[0]); return lt
    def plus(a_, b_, mal=1):
        ad = N.new('ShaderNodeMath'); ad.operation = 'ADD'; ad.use_clamp = True; L.new(a_.outputs[0], ad.inputs[0]); L.new(b_.outputs[0], ad.inputs[1]); return ad
    breit = plus(band('X', .15, .3), band('Y', .15, .3)); fein = plus(band('X', .018, .72), band('Y', .018, .72))
    kreuz = N.new('ShaderNodeMath'); kreuz.operation = 'MULTIPLY'; L.new(band('X', .15, .3).outputs[0], kreuz.inputs[0]); L.new(band('Y', .15, .3).outputs[0], kreuz.inputs[1])
    c1 = N.new('ShaderNodeMix'); c1.data_type = 'RGBA'; c1.inputs['A'].default_value = (.03, .095, .06, 1); c1.inputs['B'].default_value = (.42, .24, .05, 1); L.new(breit.outputs[0], c1.inputs['Factor'])
    c2 = N.new('ShaderNodeMix'); c2.data_type = 'RGBA'; c2.inputs['B'].default_value = (.24, .12, .035, 1); L.new(c1.outputs['Result'], c2.inputs['A']); L.new(kreuz.outputs[0], c2.inputs['Factor'])
    c3 = N.new('ShaderNodeMix'); c3.data_type = 'RGBA'; c3.inputs['B'].default_value = (.5, .42, .3, 1); L.new(c2.outputs['Result'], c3.inputs['A']); L.new(fein.outputs[0], c3.inputs['Factor'])
    L.new(c3.outputs['Result'], b.inputs['Base Color'])
    mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (7, 7, 7); L.new(uv.outputs['UV'], mp.inputs['Vector'])
    th = N.new('ShaderNodeTexImage'); th.image = bpy.data.images.load(os.path.join(HIER, 'strick_hoehe.png')); th.image.colorspace_settings.name = 'Non-Color'; L.new(mp.outputs[0], th.inputs['Vector'])
    bu = N.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = .45; bu.inputs['Distance'].default_value = .02; L.new(th.outputs['Color'], bu.inputs['Height']); L.new(bu.outputs['Normal'], b.inputs['Normal'])
    b.inputs['Roughness'].default_value = .95; b.inputs['Sheen Weight'].default_value = .8; b.inputs['Sheen Roughness'].default_value = .4
    return m
KARO = karo_material()
def schoss_decke(koerper):   # Maße in Körper-Koordinaten (Kugel ~1, y oben, z vorn); Grundform = eingerollt am Bauch, Formschlüssel 'offen' = ausgebreitet
    NU, NV, RB, E0, E1, HANG = 44, 30, 1.17, -.02, -.6, .62
    def punkt(u, s):
        a = u*.9; e0 = E0 + .16*u - .05*u*u   # schräg gelegt: eine Ecke höher
        if s <= .5: e = e0 + (E1 - e0)*s/.5; r, y, th = RB*math.cos(e), RB*math.sin(e), 0
        else: th = (s - .5)/.5; r, y = RB*math.cos(E1) - .04*th, RB*math.sin(E1) - th*HANG*(1 - .25*abs(u)) - .07*math.sin(u*7 + 1)*th
        r += (.008 + .05*th)*math.sin(u*8.5 + 1.3) + .015*math.sin(u*19)*(.3 + th) + .03*math.sin(s*9 + u*3)*(.2 + th)   # weiche Falten, unten stärker
        a += .05*math.sin(s*7 + u*5)*th
        return Vector((r*math.sin(a), y, r*math.cos(a)))
    me = bpy.data.meshes.new('decke'); bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UV')
    vs = [[bm.verts.new(punkt(-1 + 2*i/(NU - 1), j/(NV - 1))) for i in range(NU)] for j in range(NV)]
    # umgeschlagener Saum oben (doppelt gelegt)
    sa = [bm.verts.new(punkt(-1 + 2*i/(NU - 1), 0)*1.035 + Vector((0, .02, 0))) for i in range(NU)]
    sb = [bm.verts.new(punkt(-1 + 2*i/(NU - 1), .1)*1.05) for i in range(NU)]
    def flaeche(q, uvs):
        f = bm.faces.new(q)
        for l, t in zip(f.loops, uvs): l[uvl].uv = t
    for j in range(NV - 1):
        for i in range(NU - 1): flaeche((vs[j][i], vs[j][i + 1], vs[j + 1][i + 1], vs[j + 1][i]), [(i/(NU - 1)*1.2, -j/(NV - 1)*1.0), ((i + 1)/(NU - 1)*1.2, -j/(NV - 1)*1.0), ((i + 1)/(NU - 1)*1.2, -(j + 1)/(NV - 1)*1.0), (i/(NU - 1)*1.2, -(j + 1)/(NV - 1)*1.0)])
    for i in range(NU - 1): flaeche((sa[i], sa[i + 1], sb[i + 1], sb[i]), [(i/(NU - 1)*1.2, .1), ((i + 1)/(NU - 1)*1.2, .1), ((i + 1)/(NU - 1)*1.2, 0), (i/(NU - 1)*1.2, 0)])
    bm.normal_update(); bm.to_mesh(me); bm.free()
    dk = obj('decke', me); dk.data.materials.append(KARO)
    for p_ in me.polygons: p_.use_smooth = True
    offen = [v.co.copy() for v in me.vertices]
    for j in range(NV):   # eingerollt: alles in einer dicken Rolle am oberen Rand
        for i in range(NU):
            v = me.vertices[j*NU + i]; w_ = j/(NV - 1); a_ = w_*5.5; c0 = offen[i]; n0 = Vector((c0.x, 0, c0.z)).normalized()
            v.co = c0 + n0*(.06 + .05*math.sin(a_)) + Vector((0, -.06 + .05*math.cos(a_), 0))
    dk.shape_key_add(name='Basis'); ko = dk.shape_key_add(name='offen')
    for v, c in zip(ko.data, offen + [me.vertices[k].co.copy() for k in range(NU*NV, len(me.vertices))]): v.co = c
    for k in range(NU*NV, len(me.vertices)): ko.data[k].co = me.vertices[k].co
    so = dk.modifiers.new('dick', 'SOLIDIFY'); so.thickness = .06; so.offset = 1; sm = dk.modifiers.new('glatt', 'SUBSURF'); sm.levels = 1; sm.render_levels = 2
    dk.parent = koerper; dk.matrix_parent_inverse = Matrix(); dk.hide_render = True
    return dk
# ---------- Decke: gefaltetes Bündel auf der Armlehne ----------
def buendel(p):
    teile = []
    for i in range(3):
        b = box(f'buendel{i}', p + Vector((0, 0, i*.085)), (.62 - i*.02, .5 - i*.02, .09), KARO, bev=.04); glatt(b, 2); teile.append(b)
    return teile
ARM = Vector((11.58 - 1.22, .45, 1.13))
BUENDEL = buendel(ARM)
# ---------- Wunschzettel ----------
def zettel(p, rot):
    me = bpy.data.meshes.new('zettel'); bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=24, y_segments=18, size=.5); bmesh.ops.scale(bm, vec=(.62, .46, 1), verts=bm.verts)
    bm.loops.layers.uv.new('UV'); uvl = bm.loops.layers.uv.active
    for f in bm.faces:
        for l in f.loops: l[uvl].uv = (l.vert.co.x/.62 + .5, l.vert.co.y/.46 + .5)
    bm.to_mesh(me); bm.free(); z = obj('zettel', me); z.data.materials.append(PAPIER)
    for v in z.data.vertices: v.co.z += (v.co.x/.31)**2*.025 + max(0, v.co.x - .2)*max(0, v.co.y - .12)*1.2   # leicht gewölbt, Ecke hochgebogen
    for p_ in z.data.polygons: p_.use_smooth = True
    z.location = p; z.rotation_euler = rot
    if os.environ.get('DBG'): print('ZDBG', tuple(round(v, 2) for v in z.location), tuple(round(v, 2) for v in z.rotation_euler), tuple(round(v, 2) for v in z.dimensions), len(z.data.vertices))
    so = z.modifiers.new('d', 'SOLIDIFY'); so.thickness = .004
    return z
ZETTEL_LIEGT = zettel(Vector((W(318, 560, .45).x, .45, .78)), (0, 0, .06))

# ---------- Modus ----------
SITZ = [o for o in S.objects if o.name.startswith(('sitzkissen', 'rueckenkissen'))]
def nur_vorderseite(objs):
    for o in objs:
        for i, m in enumerate(o.data.materials):
            m2 = m.copy(); nt = m2.node_tree; N = nt.nodes; L = nt.links; out = N['Material Output']; bs = N['Principled BSDF']
            ge = N.new('ShaderNodeNewGeometry'); se = N.new('ShaderNodeSeparateXYZ'); L.new(ge.outputs['Normal'], se.inputs[0])
            mr = N.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = -.15; mr.inputs['From Max'].default_value = -.5; L.new(se.outputs['Y'], mr.inputs['Value'])
            tr = N.new('ShaderNodeBsdfTransparent'); mx = N.new('ShaderNodeMixShader'); L.new(mr.outputs['Result'], mx.inputs['Fac'])
            L.new(tr.outputs[0], mx.inputs[1]); L.new(bs.outputs[0], mx.inputs[2]); L.new(mx.outputs[0], out.inputs['Surface']); o.data.materials[i] = m2
if MODUS == 'film':
    # Probebild: alle drei Figuren als echte 3D-Modelle im selben Licht; Delle, Decke (Stoff über dem echten Professor)
    sys.path.insert(0, HIER); import figuren as FG
    FJ = json.load(open(os.environ['FIGJSON'])); FRm = FJ['FR']
    for o in [BUENDEL[0], BUENDEL[1], BUENDEL[2]]: o.hide_render = True
    fobs = {}
    for name, F in FJ['figuren'].items():
        fobs[name], _, _ = FG.figur_bauen(S, name, F, FRm, W, kY, fell=os.environ.get('FELL', '1') == '1')
        if name == 'prof': FG.bademantel(S, fobs[name], F)
        if F['sitz'] > .5:
            x = W(F['bild']['x'] + F['bild']['w']/2, 500, FG.YD[name]).x
            for o in S.objects:
                if name != 'prof' and o.name.startswith('sitzkissen') and abs(o.location.x - x) < 1.6: delle(o, x, .45, .85, .6, .2)
                if name != 'prof' and o.name.startswith('rueckenkissen') and abs(o.location.x - x) < 1.6: delle(o, x, 1.0, .75, .5, .16, achse='y')
                if name == 'prof' and o.name == 'sessel_kissen': delle(o, x, .5, 1.0, .6, .2)
    S.render.use_border = False
    bpy.ops.render.render(write_still=True); print('fertig', OUT); raise SystemExit
if MODUS == 'filmvoll':
    sys.path.insert(0, HIER); import figuren as FG
    FJ = json.load(open(os.environ['FILMJSON'])); FRm = FJ['FR']; E0 = FJ['erstes']; BB = FJ['bilder']
    ZIEL = os.environ['ZIELDIR']; os.makedirs(ZIEL, exist_ok=True)
    # Sofa/Sessel-Dellen als Formschlüssel (Stärke = wie sehr jemand sitzt)
    dicht = set()
    def delle_key(o, cx, cy, rx, ry, tiefe, achse, key):
        if o.name not in dicht:
            anwenden(o); verdichten(o, 1); o.shape_key_add(name='Basis'); dicht.add(o.name)
        kb = o.shape_key_add(name=key, from_mix=False); mw = o.matrix_world; inv = mw.inverted()
        for i, v in enumerate(o.data.vertices):
            w = mw @ v.co
            d = ((w.x - cx)/rx)**2 + (((w.y if achse == 'z' else w.z) - cy)/ry)**2
            f = math.exp(-d*2.0) - .22*math.exp(-(math.sqrt(d) - 1.25)**2*5)
            if achse == 'z': w.z -= tiefe*f*max(0, min(1, (w.z - (o.location.z - .05))/.2))
            else: w.y += tiefe*f*max(0, min(1, (o.location.y + .05 - w.y)/.15))
            kb.data[i].co = inv @ w
        return kb
    SITZE = {'schwein': [], 'affe': [], 'prof': []}; SITZ_OBS = {'schwein': [], 'affe': [], 'prof': []}
    for name, px_ in (('schwein', 205), ('affe', 432)):
        x = W(px_, 500, FG.YD[name]).x
        for o in list(S.objects):
            if o.name.startswith('sitzkissen') and abs(o.location.x - x) < 1.6: (SITZE[name].append(delle_key(o, x, .45, .85, .6, .2, 'z', 'delle_' + name)), SITZ_OBS[name].append(o))
            if o.name.startswith('rueckenkissen') and abs(o.location.x - x) < 1.6: (SITZE[name].append(delle_key(o, x, 1.0, .75, .5, .16, 'y', 'delle_' + name)), SITZ_OBS[name].append(o))
    xp = W(1158, 500, FG.YD['prof']).x
    for o in list(S.objects):
        if o.name == 'sessel_kissen': (SITZE['prof'].append(delle_key(o, xp, .5, 1.0, .6, .2, 'z', 'delle_prof')), SITZ_OBS['prof'].append(o))
        if o.name == 'sessel_lehne': (SITZE['prof'].append(delle_key(o, xp, 1.6, .8, .6, .1, 'y', 'delle_prof')), SITZ_OBS['prof'].append(o))
    # Figuren
    figs = {}; versteckt = set()
    for name, F0 in E0['figuren'].items():
        obs, _, _ = FG.figur_bauen(S, name, F0, FRm, W, kY, fell=True); figs[name] = obs
        if name == 'prof': FG.bademantel(S, obs, F0)
        versteckt |= {o.name for o in obs if o.hide_render}
    def setze_figuren(B):
        for name, obs in figs.items():
            mats, cc = FG.matrizen(name, B['figuren'][name], FRm, W, kY)
            for o, (Mw, v) in zip(obs, mats): o.matrix_world = Mw; o.hide_render = (not v) or (o.name in versteckt)
    def cc_von(name, B): return FG.matrizen(name, B['figuren'][name], FRm, W, kY)[1]
    # Decke: dicke Woll-Karodecke über dem Schoß des Professors (am Körper befestigt), rollt sich beim Nehmen nach unten ab
    i_nehmen = next((i for i, B in enumerate(BB) if B['decke']['typ'] == 'nehmen' and B['decke']['k'] > 0), None)
    dk = None
    if i_nehmen is not None: dk = schoss_decke(figs['prof'][0])
    deck = {'sim': 1, 'fest': False}
    # Bündel in der Hand (Kopie des gefalteten Bündels)
    HB = []
    for o in BUENDEL:
        k_ = o.copy(); k_.data = o.data.copy(); S.collection.objects.link(k_); HB.append(k_)
    hb_mitte = sum((o.location for o in BUENDEL), Vector()) / len(BUENDEL)
    # Zettel in der Pfote
    HZ = zettel(Vector((0, 0, -50)), (math.pi/2, 0, 0)); HZ.name = 'handzettel'
    # Keks in der Pfote (0..3 Bisse) + Krümel
    def keks_figur(b):
        bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=.14, depth=.042, location=(0, 0, -50)); o = bpy.context.object; o.name = f'handkeks{b}'
        o.data.materials.append(KEKSMAT); mod_bevel(o, .016, 4); sm = o.modifiers.new('s', 'SUBSURF'); sm.levels = 2; sm.render_levels = 2; bpy.ops.object.shade_smooth()
        sch = farbe(f'hk_schoko{b}', (.07, .03, .015), rough=.35)
        for i in range(7):
            a = i*2.39; rr = .14*(.25 + .55*((i*37) % 10)/10)
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=.016, location=(math.cos(a)*rr, math.sin(a)*rr, -50 + .022)); c_ = bpy.context.object; c_.scale = (1, 1, .7); c_.data.materials.append(sch); c_.parent = o; c_.matrix_parent_inverse = o.matrix_world.inverted()
        for j, (a, br) in enumerate(((math.pi, .46), (math.pi - .85, .42), (math.pi + .8, .5))[:b]):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=.14*br, location=(math.cos(a)*.14*.98, math.sin(a)*.14*.98, -50)); s_ = bpy.context.object; s_.hide_render = True; s_.parent = o; s_.matrix_parent_inverse = o.matrix_world.inverted()
            bo = o.modifiers.new(f'biss{j}', 'BOOLEAN'); bo.object = s_; bo.operation = 'DIFFERENCE'
        o.location = (0, 0, 0); return o
    HK = [keks_figur(b) for b in range(4)]
    KR = []
    for i in range(40):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=.011, location=(0, 0, -50)); c_ = bpy.context.object; c_.data.materials.append(KEKSMAT); c_.hide_render = True; KR.append(c_)
    # Licht der Sternschnuppe und des Einschlags (hinter dem Fenster), Lampe, Lichterkette
    bpy.ops.object.light_add(type='POINT', location=(0, 0, 0)); SL = bpy.context.object; SL.data.color = (1, .95, .82); SL.data.shadow_soft_size = .3; SL.data.energy = 0
    bpy.ops.object.light_add(type='POINT', location=W(932, 293, YW + 3)); EL = bpy.context.object; EL.data.color = (1, .85, .6); EL.data.shadow_soft_size = 1.5; EL.data.energy = 0
    lampe = max((o for o in S.objects if o.type == 'LIGHT' and o.data.type == 'POINT'), key=lambda o: o.data.energy); LAMPE_E = lampe.data.energy
    LKM = [m for m in bpy.data.materials if m.name.startswith('lk') and m.node_tree and 'Emission Strength' in m.node_tree.nodes['Principled BSDF'].inputs]
    S.cycles.samples = int(os.environ.get('SAMPLES', '16')); S.cycles.adaptive_threshold = .02; S.cycles.seed = 7; S.cycles.use_animated_seed = False
    S.cycles.max_bounces = 4; S.render.use_persistent_data = True; S.render.use_border = False
    cam = S.camera; CAM0 = (cam.location.copy(), cam.rotation_euler.copy(), cam.data.lens, cam.data.dof.focus_distance, cam.data.dof.aperture_fstop)
    if os.environ.get('THREADS'): S.render.threads_mode = 'FIXED'; S.render.threads = int(os.environ['THREADS'])
    von, bis = int(os.environ.get('VON', '0')), int(os.environ.get('BIS', '99999'))
    # ---------- Kameras und Schnittliste ----------
    # Kamera: (Ort, Blickziel, Brennweite); 'tot' = die feste Totale von vorn
    KAMERAS = {
        'prof':      ((9.8, -5.4, 1.9), (12.1, .36, 1.35), 28),
        'prof_links': ((7.6, -5.3, 1.9), (10.4, .4, 1.35), 28),
        'prof_steh': ((9.9, -5.7, 1.85), (10.75, .36, 1.4), 30),
        'schwein_steh': ((3.5, -4.7, 1.3), (2.45, -.9, 1.0), 32),
        'affe_steh': ((3.4, -4.7, 1.3), (4.5, -1.0, 1.0), 32),
        'kinder':    ((3.5, -4.6, 1.75), (3.3, 0, 1.2), 25),
        'kinder_weit': ((4.6, -5.6, 2.0), (4.4, 0, 1.25), 24),
        'schwein':   ((3.5, -3.3, 1.6), (2.05, .1, 1.3), 34),
        'affe':      ((2.8, -3.3, 1.6), (4.35, .1, 1.3), 34),
    }
    # (Zeile, Sekunden ab Zeilenbeginn, Kamera) – gilt bis zum nächsten Eintrag
    SCHNITTE = [(0, 0, 'tot'), (1, .1, 'prof_links'), (2, 0, 'tot'), (3, .15, 'schwein'), (4, 0, 'kinder'), (5, .1, 'affe'), (6, 0, 'affe'), (6, 1.0, 'prof'),
                (7, 1.0, 'tot'), (8, .3, 'schwein'), (9, 0, 'kinder_weit'), (11, 0, 'kinder'), (12, 0, 'tot'), (15, 0, 'prof_steh'), (16, 0, 'affe_steh'),
                (17, 0, 'prof_steh'), (18, 0, 'schwein_steh'), (19, .4, 'tot')]
    ZSTART = {z: t0 for z, t0 in FJ['zeilen']}
    SCHNITT_T = sorted((ZSTART[z] + v, k) for z, v, k in SCHNITTE if z in ZSTART)
    def kamera_fuer(bi):
        t = bi/24; k = 'tot'
        for t0, name in SCHNITT_T:
            if t + 1e-6 >= t0: k = name
        return k
    KAM = [kamera_fuer(i) for i in range(len(BB))]
    if os.environ.get('KAMERA_TEST'): KAM = [os.environ['KAMERA_TEST']]*len(BB)
    SEG = []   # Einstellungen: zusammenhängende Bilder mit derselben Kamera
    for i, k in enumerate(KAM):
        if not SEG or SEG[-1][2] != k: SEG.append([i, i, k])
        else: SEG[-1][1] = i
    def segment(bi): return next(s for s in SEG if s[0] <= bi <= s[1])
    def kamera_setzen(name):
        if name == 'tot': cam.location, cam.rotation_euler, cam.data.lens = CAM0[0].copy(), CAM0[1].copy(), CAM0[2]; cam.data.dof.focus_distance = CAM0[3]; cam.data.dof.aperture_fstop = CAM0[4]
        else:
            loc, ziel, lens = KAMERAS[name]; cam.location = loc; cam.rotation_euler = (Vector(ziel) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); cam.data.lens = lens
            cam.data.dof.focus_distance = (Vector(ziel) - Vector(loc)).length - .3; cam.data.dof.aperture_fstop = 2.8
        bpy.context.view_layer.update()
    from bpy_extras.object_utils import world_to_camera_view
    def projiziere(p): q = world_to_camera_view(S, cam, Vector(p)); return q.x*1280, (1 - q.y)*720
    def fenster_px():   # rundes Fenster in dieser Kamera: Mitte und Radius (für den Himmel dahinter)
        cx, cy = projiziere(F); rx = abs(projiziere(F + Vector((FR, 0, 0)))[0] - cx); ry = abs(projiziere(F + Vector((0, 0, FR)))[1] - cy); return [cx, cy, max(rx, ry)]
    kamera_setzen('tot'); FENSTER_TOT = fenster_px()
    PROF_SET = set(o for obs_ in figs.values() for o in obs_); MANTEL = [o for o in S.objects if o.parent in PROF_SET and o not in PROF_SET]   # Bademantel am Professor, Schwanz am Affen (in Hintergründen ausgeblendet)
    print('MANTEL', len(MANTEL), flush=True)
    if os.environ.get('FLUG_INNEN'):   # Blick ins Zimmer beim Anflug: Zimmerkamera so weit zurück, wie die Außenkamera vom Fenster entfernt ist (mal K)
        FD = os.environ['FLUG_INNEN']; OD = os.environ['FLUG_INNEN_ZIEL']; os.makedirs(OD, exist_ok=True); K = float(os.environ.get('FLUG_K', '10'))
        B = BB[0]; setze_figuren(B)
        for name, keys in SITZE.items():
            for kb in keys: kb.value = max(0, min(1, (B['figuren'][name]['sitz'] - .2)/.8))
        for o in MANTEL: o.hide_render = False
        D = B['decke']
        for o in BUENDEL: o.hide_render = True   # keine Decke mehr (Nutzerwunsch)
        for o in HB + [HZ] + HK + KR + ([dk] if dk is not None else []): o.hide_render = True
        for o in HK:
            for ch in o.children: ch.hide_render = True
        ZETTEL_LIEGT.hide_render = True
        for c_ in KEKS4: c_.hide_render = False
        SL.data.energy = 0; EL.data.energy = 0; S.render.use_border = False
        j = 0
        while os.path.exists(f'{FD}/a_{j:04d}.json'):
            ziel = f'{OD}/i_{j:04d}.png'
            if not os.path.exists(ziel):
                AJ = json.load(open(f'{FD}/a_{j:04d}.json')); dl = Vector(AJ['delta'])
                cam.location = CAM0[0] + dl*K; cam.rotation_euler = CAM0[1].copy(); cam.data.lens = CAM0[2]*AJ.get('linse', 1)
                cam.data.dof.focus_distance = CAM0[3] + dl.length*K; cam.data.dof.aperture_fstop = 6
                bpy.context.view_layer.update(); S.render.filepath = ziel; bpy.ops.render.render(write_still=True)
                json.dump({'fenster': fenster_px(), 'fenster_tot': FENSTER_TOT}, open(ziel.replace('.png', '.json'), 'w')); print('INNEN', j, flush=True)
            j += 1
        raise SystemExit
    # schnelle Umrisse der Figuren je Bild (ohne Szene neu auszuwerten): lokale Ecken der Teile mal Weltmatrix
    ECKEN = {}
    for name, obs in figs.items():
        ECKEN[name] = []
        for o in obs:
            vs = [v.co for v in o.data.vertices]
            if not vs: ECKEN[name].append([]); continue
            lo = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs))); hi = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
            ECKEN[name].append([Vector((x, y, z)) for x in (lo.x, hi.x) for y in (lo.y, hi.y) for z in (lo.z, hi.z)])
    def rahmen_aus(punkte, rand):
        punkte = [q for q in punkte if -60 < q[0] < 1340 and -60 < q[1] < 780]   # nur was in diesem Bild zu sehen ist
        if not punkte: return None
        xs = [p[0] for p in punkte]; ys = [p[1] for p in punkte]
        return [max(0, int(min(xs)) - rand), max(0, int(min(ys)) - rand), min(1280, int(max(xs)) + rand), min(720, int(max(ys)) + rand + 20)]
    def figur_punkte(name, B):
        mats, _ = FG.matrizen(name, B['figuren'][name], FRm, W, kY); pts = []
        for (Mw, v), ecken, o in zip(mats, ECKEN[name], figs[name]):
            if not v or o.name in versteckt: continue
            pts += [projiziere(Mw @ e) for e in ecken]
        if name == 'prof' and dk is not None:   # Schoßdecke hängt unter dem Körper heraus
            pts += [projiziere(mats[0][0] @ Vector((x_, y_, z_))) for x_ in (-1.35, 1.35) for y_ in (-1.55, .3) for z_ in (0, 1.45)]
        return pts
    def obj_punkte(obs):
        pts = []
        for o in obs:
            for c in o.bound_box: pts.append(projiziere(o.matrix_world @ Vector(c)))
        return pts
    STATISCH = {}   # je Kamera: Polster der Kinder / Sessel + Bündel (immer im Ausschnitt, damit er ruhig bleibt)
    def statisch(name):
        if name not in STATISCH:
            STATISCH[name] = (obj_punkte(SITZ_OBS['schwein'] + SITZ_OBS['affe'] + [ZETTEL_LIEGT]), obj_punkte(SITZ_OBS['prof'] + BUENDEL))
        return STATISCH[name]
    RECHTECKE = {}
    def rechtecke(bi):   # über die ganze Einstellung gleich: Vereinigung aller Bilder der Einstellung
        s0, s1, name = segment(bi)
        if s0 not in RECHTECKE:
            sa, sb = statisch(name); pa, pb = list(sa), list(sb)
            for j in range(s0, s1 + 1):
                Bj = BB[j]; pa += figur_punkte('schwein', Bj) + figur_punkte('affe', Bj); pb += figur_punkte('prof', Bj)
                Zj = Bj['zettel']
                if not Zj['liegt']: pa.append(projiziere(W(Zj['x'], Zj['y'], 0)))
                if Bj['decke']['hand']: pb.append(projiziere(W(Bj['decke']['hand'][0], Bj['decke']['hand'][1], .2)))
            rs = [r for r in (rahmen_aus(pa, 52), rahmen_aus(pb, 52)) if r]
            if len(rs) == 2 and rs[0][0] - 30 < rs[1][2] and rs[1][0] - 30 < rs[0][2] and rs[0][1] - 30 < rs[1][3] and rs[1][1] - 30 < rs[0][3]:
                rs = [[min(rs[0][0], rs[1][0]), min(rs[0][1], rs[1][1]), max(rs[0][2], rs[1][2]), max(rs[0][3], rs[1][3])]]
            RECHTECKE[s0] = [r for r in rs if r[2] - r[0] > 8 and r[3] - r[1] > 8]
        return RECHTECKE[s0]
    BG_ZUSTAND = {'zettel': True, 'keks': False, 'buendel': True}
    def hintergrund(name):
        hgp = os.path.join(ZIEL, f'hintergrund_{name}.png')
        if os.path.exists(hgp): return
        for obs in figs.values():
            for o in obs: o.hide_render = True
        for o in HB + [HZ] + HK + KR + ([dk] if dk is not None else []): o.hide_render = True
        for o in MANTEL: o.hide_render = True
        for o in HK:
            for ch in o.children: ch.hide_render = True
        ZETTEL_LIEGT.hide_render = BG_ZUSTAND['zettel']
        for c_ in KEKS4: c_.hide_render = BG_ZUSTAND['keks']
        for o in BUENDEL: o.hide_render = True
        for kbs in SITZE.values():
            for kb in kbs: kb.value = 0
        SL.data.energy = 0; EL.data.energy = 0; S.render.use_border = False
        S.cycles.samples = int(os.environ.get('BG_SAMPLES', '128')); S.render.filepath = hgp + '.tmp.png'; bpy.ops.render.render(write_still=True); os.replace(hgp + '.tmp.png', hgp)
        S.cycles.samples = int(os.environ.get('SAMPLES', '16')); print('HINTERGRUND', name, round(time.time()), flush=True)
    if os.environ.get('NUR_HINTERGRUND'):   # alle Kamera-Hintergründe vorab, normal und mit Nachglühen nach dem Einschlag
        for name in ['tot'] + list(KAMERAS):
            kamera_setzen(name); hintergrund(name)
            p_ = os.path.join(ZIEL, f'hintergrund_glimm_{name}.png')
            if not os.path.exists(p_):
                EL.data.energy = 900; S.cycles.samples = int(os.environ.get('BG_SAMPLES', '48')); S.render.filepath = p_ + '.tmp.png'; bpy.ops.render.render(write_still=True); os.replace(p_ + '.tmp.png', p_); EL.data.energy = 0
                print('HINTERGRUND glimm', name, flush=True)
        raise SystemExit
    for bi, B in enumerate(BB):
        if bi < von or bi > bis: continue
        ziel = os.path.join(ZIEL, f'bild_{bi:04d}.json'); t = B['t']
        # Decke immer bis hierher simulieren (auch wenn das Bild schon fertig ist), damit ein Neustart dieselbe Decke hat
        D = B['decke']
        if dk is not None and D['typ'] == 'nehmen': dk.data.shape_keys.key_blocks['offen'].value = max(0, min(1, D['k']))
        if dk is not None and D['typ'] == 'weg' and not deck['fest']:   # wegwerfen: von der Figur lösen und frei fliegen lassen
            setze_figuren(B); bpy.context.view_layer.update(); mw = dk.matrix_world.copy(); dk.parent = None; dk.matrix_world = mw
            dk.data.shape_keys.key_blocks['offen'].value = 1; deck['fest'] = True; deck['ort'] = dk.location.copy(); deck['rot'] = dk.rotation_euler.copy()
        if os.path.exists(ziel) or bi % int(os.environ.get('TEILE', '1')) != int(os.environ.get('REST', '0')): continue
        kname = KAM[bi]; kamera_setzen(kname); hintergrund(kname)
        setze_figuren(B)
        for o in MANTEL: o.hide_render = False
        for o in MANTEL:
            if o.name.startswith('affenschwanz') and B['figuren']['affe']['sitz'] > .3: o.hide_render = True   # sitzt er, steckt der Schwanz sonst im Sofa
        for name, keys in SITZE.items():
            for kb in keys: kb.value = max(0, min(1, (B['figuren'][name]['sitz'] - .2)/.8))
        # Decke / Bündel
        for o in BUENDEL: o.hide_render = True   # keine Decke mehr (Nutzerwunsch)
        for o in HB: o.hide_render = True
        if dk is not None: dk.hide_render = True
        if D['inHand'] and D['hand']:
            Y = FG.YD['prof'] - cc_von('prof', B)*D['hand'][2] - .1; p3 = W(D['hand'][0], D['hand'][1], Y)
            for o, o0 in zip(HB, BUENDEL): o.location = o0.location - hb_mitte + p3; o.hide_render = False
        elif dk is not None and D['typ'] == 'nehmen' and D['k'] > 0:
            dk.hide_render = False
            for o in MANTEL:
                if o.name.startswith(('guertelknoten', 'guertelende')) and D['k'] > .3: o.hide_render = True   # liegt unter der Decke
        elif dk is not None and D['wurf'] is not None and D['wurf'] < .95:
            w = D['wurf']; dk.hide_render = False; dk.location = deck['ort'] + Vector((-1.8*w, -.3*w, -.6*w*w)); dk.rotation_euler = (deck['rot'].x, deck['rot'].y + .4*w, deck['rot'].z)
        # Zettel (beim Lesen vor dem Gesicht)
        ZETTEL_LIEGT.hide_render = True; HZ.hide_render = True   # Zettel gibt es nicht mehr (Nutzerwunsch)
        if not B['zettel']['liegt']:
            Z = B['zettel']; Y = FG.YD['schwein'] - cc_von('schwein', B)*B['figuren']['schwein']['hz'] - .05
            if Z.get('vor'): Y = min(Y, FG.YD['schwein'] - float(os.environ.get('ZETTEL_VOR', '1.0')))
            HZ.location = W(Z['x'], Z['y'], Y); HZ.rotation_euler = ((1 - Z['flach'])*math.pi/2 - (.12 if Z.get('vor') else 0), Z['rot'], 0)
        # Keks liegt nur noch auf dem Teller
        for c_ in KEKS4: c_.hide_render = B['keksWeg']
        for o in HK:
            o.hide_render = True
            for ch in o.children:
                if ch.name.startswith('Ico'): ch.hide_render = True
        for c_ in KR: c_.hide_render = True
        # Licht: Sternschnuppe/Einschlag -> ganzes Bild rendern; sonst nur die (je Einstellung festen) Bereiche mit Figuren
        voll = bool(B['stern']) or B['einschlag'] > .003
        if B['stern']: sx, sy, sa = B['stern']; SL.location = W(sx, sy, YW + 2.5); SL.data.energy = 900*sa
        else: SL.data.energy = 0
        EL.data.energy = 22000*B['einschlag'] + 900*B['nachglimmen']
        if B['nachglimmen'] > .003 and not B['stern'] and B['einschlag'] <= .003:
            hg_glimm = f'glimm_{kname}'   # nach dem Einschlag leuchtet es draußen weiter: eigener Hintergrund mit diesem Licht
            if not os.path.exists(os.path.join(ZIEL, f'hintergrund_{hg_glimm}.png')):
                zw = {o.name: o.hide_render for o in S.objects}; e_alt = EL.data.energy; kv = {kb: kb.value for kbs in SITZE.values() for kb in kbs}
                hintergrund_licht = EL.data.energy
                for obs in figs.values():
                    for o in obs: o.hide_render = True
                for o in HB + [HZ] + ([dk] if dk is not None else []): o.hide_render = True
                for o in MANTEL: o.hide_render = True
                ZETTEL_LIEGT.hide_render = BG_ZUSTAND['zettel']
                for c_ in KEKS4: c_.hide_render = BG_ZUSTAND['keks']
                for o in BUENDEL: o.hide_render = True
                for kb in kv: kb.value = 0
                EL.data.energy = 900*B['nachglimmen']; S.render.use_border = False; S.cycles.samples = int(os.environ.get('BG_SAMPLES', '128'))
                p_ = os.path.join(ZIEL, f'hintergrund_{hg_glimm}.png'); S.render.filepath = p_ + '.tmp.png'; bpy.ops.render.render(write_still=True); os.replace(p_ + '.tmp.png', p_)
                S.cycles.samples = int(os.environ.get('SAMPLES', '16'))
                for o in S.objects:
                    if o.name in zw: o.hide_render = zw[o.name]
                for kb, v in kv.items(): kb.value = v
                EL.data.energy = e_alt
            hg_name = hg_glimm
        else: hg_name = kname
        rects = [[0, 0, 1280, 720]] if voll else rechtecke(bi)
        for j, (x0, y0, x1, y1) in enumerate(rects):
            S.render.use_border = True; S.render.use_crop_to_border = True
            S.render.border_min_x = x0/1280; S.render.border_max_x = x1/1280; S.render.border_min_y = 1 - y1/720; S.render.border_max_y = 1 - y0/720
            S.render.filepath = os.path.join(ZIEL, f'bild_{bi:04d}_{j}.png'); bpy.ops.render.render(write_still=True)
        json.dump({'rects': rects, 'voll': voll, 'wackeln': B['wackeln'], 't': t, 'kamera': kname, 'hintergrund': hg_name, 'fenster': fenster_px(),
                   'fenster_tot': FENSTER_TOT}, open(ziel, 'w')); print('BILD', bi, kname, len(rects), round(time.time()), flush=True)
    raise SystemExit
if MODUS == 'filmclip':
    # Film: Szene einmal aufbauen, dann Bild für Bild die Haltungen setzen und rendern
    sys.path.insert(0, HIER); import figuren as FG
    FJ = json.load(open(os.environ['FILMJSON'])); FRm = FJ['FR']; E0 = FJ['erstes']
    for o in BUENDEL: o.hide_render = True
    # Himmel hinter dem Fenster
    him = bild_tex('himmel', 'himmel.png', 1); hb = him.node_tree.nodes['Principled BSDF']; hb.inputs['Emission Strength'].default_value = 1
    him.node_tree.links.new(him.node_tree.nodes['Image Texture'].outputs['Color'], hb.inputs['Emission Color']); hb.inputs['Base Color'].default_value = (0, 0, 0, 1)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(F.x, YW + 1.2, F.z - .3), rotation=(math.pi/2, 0, 0)); hp = bpy.context.object; hp.scale = (6.5, 4.6, 1); hp.data.materials.append(him)
    hp.visible_shadow = False; hp.visible_diffuse = False; hp.visible_glossy = False
    figs = {}; versteckt = set()
    for name, F0 in E0['figuren'].items():
        obs, _, _ = FG.figur_bauen(S, name, F0, FRm, W, kY, fell=True); figs[name] = obs
        if name == 'prof': FG.bademantel(S, obs, F0)
        versteckt |= {o.name for o in obs if o.hide_render}
        if F0['sitz'] > .5:
            x = W(F0['bild']['x'] + F0['bild']['w']/2, 500, FG.YD[name]).x
            for o in S.objects:
                if name != 'prof' and o.name.startswith('sitzkissen') and abs(o.location.x - x) < 1.6: delle(o, x, .45, .85, .6, .2)
                if name != 'prof' and o.name.startswith('rueckenkissen') and abs(o.location.x - x) < 1.6: delle(o, x, 1.0, .75, .5, .16, achse='y')
                if name == 'prof' and o.name == 'sessel_kissen': delle(o, x, .5, 1.0, .6, .2)
    # Decke als Stoff über dem echten Professor (Kollision: seine Teile + Sessel)
    kop = []
    for o in figs['prof'] + [o for o in S.objects if o.name.startswith(('sessel_kissen', 'sessel_arm', 'sessel_lehne', 'sessel_sockel', 'bademantel'))]:
        if o.type != 'MESH' or o.hide_render: continue
        k_ = o.copy(); k_.data = o.data.copy(); S.collection.objects.link(k_); k_.modifiers.clear(); k_.parent = None; k_.matrix_world = o.matrix_world.copy(); kop.append(k_)
    bpy.ops.object.select_all(action='DESELECT')
    for k_ in kop: k_.select_set(True)
    bpy.context.view_layer.objects.active = kop[0]; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True); bpy.ops.object.join()
    koll = bpy.context.object; koll.name = 'kollision'; koll.hide_render = True; koll.modifiers.new('koll', 'COLLISION'); koll.collision.thickness_outer = .025; koll.collision.cloth_friction = 10
    px = W(E0['figuren']['prof']['bild']['x'] + 127, 500, FG.YD['prof']).x
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=46, y_subdivisions=36, size=1, location=(px - .05, -.88, 1.1), rotation=(math.radians(52), 0, 0)); dk = bpy.context.object; dk.name = 'decke'
    dk.scale = (2.0, 1.55, 1); bpy.ops.object.transform_apply(location=False, rotation=True, scale=True); dk.data.materials.append(STRICK)
    ztop = max(v.co.z for v in dk.data.vertices); vg = dk.vertex_groups.new(name='halt'); vg.add([v.index for v in dk.data.vertices if v.co.z > ztop - .03 and abs(v.co.x) < .75], 1.0, 'REPLACE')
    cl = dk.modifiers.new('stoff', 'CLOTH'); cs = cl.settings; cs.vertex_group_mass = 'halt'; cs.pin_stiffness = 1; cs.quality = 8; cs.mass = .4; cs.bending_stiffness = .8
    so = dk.modifiers.new('dick', 'SOLIDIFY'); so.thickness = .025; sm = dk.modifiers.new('glatt', 'SUBSURF'); sm.levels = 1; sm.render_levels = 2
    S.frame_start = 1; S.frame_end = 60; bpy.context.view_layer.update()
    for f in range(1, 56): S.frame_set(f)
    bpy.context.view_layer.objects.active = dk; dk.select_set(True); bpy.ops.object.modifier_apply(modifier='stoff'); S.frame_set(1)
    # Keks in der Pfote: 4 Varianten (0..3 Bisse), Schokostückchen und Bissformen hängen am Keks
    def keks_figur(b):
        bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=.14, depth=.042, location=(0, 0, -50)); o = bpy.context.object; o.name = f'handkeks{b}'
        o.data.materials.append(KEKSMAT); mod_bevel(o, .016, 4); sm = o.modifiers.new('s', 'SUBSURF'); sm.levels = 2; sm.render_levels = 2; bpy.ops.object.shade_smooth()
        sch = farbe(f'hk_schoko{b}', (.07, .03, .015), rough=.35)
        for i in range(7):
            a = i*2.39; rr = .14*(.25 + .55*((i*37) % 10)/10)
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=.016, location=(math.cos(a)*rr, math.sin(a)*rr, -50 + .022)); c_ = bpy.context.object; c_.scale = (1, 1, .7); c_.data.materials.append(sch); c_.parent = o; c_.matrix_parent_inverse = o.matrix_world.inverted()
        for j, (a, br) in enumerate(((math.pi, .46), (math.pi - .85, .42), (math.pi + .8, .5))[:b]):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=.14*br, location=(math.cos(a)*.14*.98, math.sin(a)*.14*.98, -50)); s_ = bpy.context.object; s_.hide_render = True; s_.parent = o; s_.matrix_parent_inverse = o.matrix_world.inverted()
            bo = o.modifiers.new(f'biss{j}', 'BOOLEAN'); bo.object = s_; bo.operation = 'DIFFERENCE'
        o.location = (0, 0, 0); return o
    HK = [keks_figur(b) for b in range(4)]
    for o in HK: o.hide_render = True
    kmat = KEKSMAT; KR = []
    for i in range(40):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=.011, location=(0, 0, -50)); c_ = bpy.context.object; c_.data.materials.append(kmat); c_.hide_render = True; KR.append(c_)
    def schirm3d(px_, py_, Y): return W(px_, py_, Y)
    S.cycles.samples = int(os.environ.get('SAMPLES', '24')); S.cycles.max_bounces = 4; S.render.use_persistent_data = True; S.render.use_border = False
    von, bis = int(os.environ.get('VON', '0')), int(os.environ.get('BIS', '9999'))
    for bi, B in enumerate(FJ['bilder']):
        if bi < von or bi > bis: continue
        for name, obs in figs.items():
            mats, cc = FG.matrizen(name, B['figuren'][name], FRm, W, kY)
            for o, (Mw, v) in zip(obs, mats): o.matrix_world = Mw; o.hide_render = (not v) or (o.name in versteckt)
        KEKS4[0].hide_render = B['keksWeg']
        for c_ in KEKS4[1:]: c_.hide_render = B['keksWeg']
        for o in HK: o.hide_render = True
        if B.get('keks') and B['keks']['bisse'] < 4:
            K = B['keks']; cc = FG.matrizen('affe', B['figuren']['affe'], FRm, W, kY)[1]; Y = FG.YD['affe'] - cc*K['hz'] - .06
            o = HK[min(3, K['bisse'])]; o.hide_render = False
            o.location = schirm3d(K['x'], K['y'], Y); o.rotation_euler = ((1 - K['flach'])*math.pi/2, -K['rot'], 0)
        for i, c_ in enumerate(KR):
            if i < len(B['kruemel']) and B['kruemel'][i][2] > .05 and B['kruemel'][i][1] < 640: x_, y_, l_ = B['kruemel'][i]; c_.location = schirm3d(x_, y_, -.25); c_.hide_render = False
            else: c_.hide_render = True
        S.render.filepath = os.path.join(os.path.dirname(OUT), f'bild_{bi:04d}.png'); bpy.ops.render.render(write_still=True); print('BILD', bi, round(time.time()), flush=True)
    raise SystemExit
if MODUS.startswith('polster'):
    for o in KEKS4 + BUENDEL + [ZETTEL_LIEGT]: o.hide_render = True
    if MODUS == 'polster_p':
        x = mitte_x('prof'); kis = [o for o in S.objects if o.name == 'sessel_kissen']
        for o in kis: delle(o, x, .5, 1.0, .6, .2)
        nur_vorderseite(kis); nur(kis); ausschnitt(960, 260, 1280, 720)
    else:
        figs = ['schwein'] + (['affe'] if MODUS == 'polster_sa' else []); kis = [o for o in S.objects if o.name.startswith('sitzkissen')]
        for fig in figs:
            x = mitte_x(fig)
            for o in kis:
                if abs(o.location.x - x) < 1.6: delle(o, x, .45, .85, .6, .2)
        nur_vorderseite(kis); nur(kis); ausschnitt(0, 380, 700, 720)
    bpy.ops.render.render(write_still=True); print('fertig', OUT); raise SystemExit
if MODUS in ('sofa_s', 'sofa_sa', 'sessel_p') or MODUS.startswith('decke'):
    for o in KEKS4 + BUENDEL + [ZETTEL_LIEGT]: o.hide_render = True
if MODUS in ('sofa_s', 'sofa_sa'):
    figs = ['schwein'] + (['affe'] if MODUS == 'sofa_sa' else [])
    for fig in figs:
        x = mitte_x(fig); platzhalter(fig)
        for o in SITZ:
            if o.name.startswith('sitzkissen') and abs(o.location.x - x) < 1.6: delle(o, x, .45, .85, .6, .2)
            if o.name.startswith('rueckenkissen') and abs(o.location.x - x) < 1.6: delle(o, x, 1.0, .75, .5, .16, achse='y')
    ausschnitt(0, 380, 700, 720)
elif MODUS == 'sessel_p' or MODUS.startswith('decke'):
    x = mitte_x('prof'); pr = platzhalter('prof')
    for o in S.objects:
        if o.name == 'sessel_kissen': delle(o, x, .5, 1.0, .6, .2)
        if o.name == 'sessel_lehne': delle(o, x, 1.6, .8, .6, .1, achse='y')
    if MODUS == 'sessel_p': ausschnitt(960, 260, 1280, 720)
    else:
        # Stoff-Simulation: die Decke fällt über den Professor (Platzhalter + Sessel sind Kollisionskörper)
        BILDER = [int(v) for v in MODUS.split('_')[1:]]; n = max(BILDER)
        # ein sauberer Kollisionskörper: Kopien der Platzhalter + Sessel, Transformationen angewandt, zusammengefügt
        kopien = []
        for o in pr + [o for o in S.objects if o.name.startswith(('sessel_kissen', 'sessel_arm', 'sessel_lehne', 'sessel_sockel'))]:
            k_ = o.copy(); k_.data = o.data.copy(); S.collection.objects.link(k_); k_.modifiers.clear(); kopien.append(k_)
        bpy.ops.object.select_all(action='DESELECT')
        for k_ in kopien: k_.select_set(True)
        bpy.context.view_layer.objects.active = kopien[0]; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True); bpy.ops.object.join()
        koll = bpy.context.object; koll.name = 'kollision'; koll.hide_render = True
        if os.environ.get('DBG'):
            vs = [koll.matrix_world @ v.co for v in koll.data.vertices]; print('KOLL', [round(min(getattr(v, c) for v in vs), 2) for c in 'xyz'], [round(max(getattr(v, c) for v in vs), 2) for c in 'xyz'], 'x', round(x, 2))
        koll.modifiers.new('koll', 'COLLISION'); koll.collision.thickness_outer = .025; koll.collision.cloth_friction = 10
        if os.environ.get('DBG2'):
            bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0, .9)); fl = bpy.context.object; fl.scale = (4, 4, .2); fl.modifiers.new('koll', 'COLLISION')
        # Decke: oben an der Brust gehalten (festgepinnt), sie schwingt nach unten und legt sich über Bauch und Beine
        bpy.ops.mesh.primitive_grid_add(x_subdivisions=46, y_subdivisions=36, size=1, location=(x - .05, -.42, 1.02), rotation=(math.radians(52), 0, 0)); dk = bpy.context.object; dk.name = 'decke'
        dk.scale = (2.0, 1.55, 1); bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        dk.data.materials.append(STRICK)
        zs = [v.co.z for v in dk.data.vertices]; ztop = max(zs)
        vg = dk.vertex_groups.new(name='halt'); vg.add([v.index for v in dk.data.vertices if v.co.z > ztop - .03 and abs(v.co.x) < .75], 1.0, 'REPLACE')
        cl = dk.modifiers.new('stoff', 'CLOTH'); cs = cl.settings; cs.vertex_group_mass = 'halt'; cs.pin_stiffness = 1; cs.quality = 8; cs.mass = .4; cs.bending_stiffness = .8; cs.tension_stiffness = 12; cs.compression_stiffness = 12
        cl.collision_settings.use_self_collision = False; cl.collision_settings.distance_min = .012
        so = dk.modifiers.new('dick', 'SOLIDIFY'); so.thickness = .025; sm = dk.modifiers.new('glatt', 'SUBSURF'); sm.levels = 1; sm.render_levels = 2
        S.frame_start = 1; S.frame_end = 60
        nur([dk])
        for o in S.objects:
            if o.name.startswith('sessel_arm'): o.is_holdout = True; o.visible_camera = True
        ausschnitt(960, 260, 1280, 720)
        basis = OUT
        bpy.context.view_layer.update(); bpy.context.evaluated_depsgraph_get().update(); S.frame_set(1)
        for f in range(1, n + 1):
            S.frame_set(f)
            if os.environ.get('DBG'):
                ev = dk.evaluated_get(bpy.context.evaluated_depsgraph_get()); zs = [ (ev.matrix_world @ v.co).z for v in ev.data.vertices ]; print('DBG', f, round(min(zs), 2), round(max(zs), 2), len([o for o in S.objects if any(m.type == 'COLLISION' for m in o.modifiers)]))
                continue
            if f in BILDER: S.render.filepath = basis.replace('.png', f'_{f:02d}.png'); bpy.ops.render.render(write_still=True); print('bild', f)
        raise SystemExit
elif MODUS == 'keks':
    nur(KEKS4); ausschnitt(*bbox_px(KEKS4, 18))
elif MODUS == 'buendel':
    nur(BUENDEL); ausschnitt(*bbox_px(BUENDEL, 22))
elif MODUS == 'zettel_liegt':
    nur([ZETTEL_LIEGT]); ausschnitt(*bbox_px([ZETTEL_LIEGT], 16))
elif MODUS.startswith('spr_'):
    for o in KEKS4 + BUENDEL + [ZETTEL_LIEGT]: o.hide_render = True
    if MODUS.startswith('spr_keks'):
        b = int(MODUS[-1]); sp = keks('spritekeks', W(690, 585, -.6), rot=(math.pi/2, 0, 0), bisse=b)
    elif MODUS == 'spr_zettel': sp = [zettel(W(330, 505, -.4), (math.pi/2, 0, 0))]
    else: sp = buendel(W(1080, 470, -.4))
    nur(sp); ausschnitt(*bbox_px(sp, 6))
else:
    for o in KEKS4 + BUENDEL + [ZETTEL_LIEGT]: o.hide_render = True    # 'hinten': Grundbild ohne bewegliche Dinge
bpy.ops.render.render(write_still=True)
print('fertig', OUT)
