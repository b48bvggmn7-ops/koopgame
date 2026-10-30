import bpy
bpy.ops.wm.read_factory_settings(use_empty=True); S = bpy.context.scene
bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0)); k = bpy.context.object
VAR = __import__('os').environ.get('VAR', 'a')
if VAR == 'a': k.modifiers.new('koll', 'COLLISION')
else:
    bpy.context.view_layer.objects.active = k; bpy.ops.object.modifier_add(type='COLLISION')
bpy.ops.mesh.primitive_grid_add(x_subdivisions=20, y_subdivisions=20, size=3, location=(0, 0, 2)); g = bpy.context.object
if VAR == 'a': g.modifiers.new('c', 'CLOTH')
else: bpy.context.view_layer.objects.active = g; bpy.ops.object.modifier_add(type='CLOTH')
S.frame_start = 1; S.frame_end = 40
for f in range(1, 41):
    S.frame_set(f)
ev = g.evaluated_get(bpy.context.evaluated_depsgraph_get()); print('MIN', VAR, min((ev.matrix_world @ v.co).z for v in ev.data.vertices))
