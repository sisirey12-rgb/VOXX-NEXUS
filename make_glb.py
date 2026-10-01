import trimesh, numpy as np, os
from trimesh.creation import box
from trimesh.util import concatenate

parts=[]
# VX logo: chunky beveled bars, each kept as a separate node by scene graph
# V: two diagonal bars
for i,(center,angle,name) in enumerate([
    ((-1.05,0,0), -0.48, 'VX_V_LEFT'),
    ((1.05,0,0), 0.48, 'VX_V_RIGHT'),
    ((-0.78,0.10,0.12), 0.48, 'VX_X_LEFT'),
    ((0.78,0.10,0.12), -0.48, 'VX_X_RIGHT'),
    ((0,-0.35,0.28), 0, 'VX_CENTER'),
    ((0,0.55,-0.18), 0, 'VX_TOP')
]):
    m=box(extents=[0.58,2.45,0.34])
    # bevel edges for premium geometry
    try: m=m.subdivide_to_size(max_edge=0.22)
    except: pass
    m.apply_transform(trimesh.transformations.rotation_matrix(angle,[0,0,1]))
    m.apply_translation(center)
    parts.append((name,m))

# Create scene with separate geometry nodes and metallic material.
scene=trimesh.Scene()
mat=trimesh.visual.material.PBRMaterial(
    baseColorFactor=[0.68,0.78,0.82,1.0], metallicFactor=0.9, roughnessFactor=0.2
)
for name,m in parts:
    m.visual.material=mat
    scene.add_geometry(m, node_name=name, geom_name=name)

out='/mnt/data/v7/assets'
os.makedirs(out,exist_ok=True)
scene.export(os.path.join(out,'voxx-vx.glb'), file_type='glb')
print('wrote', os.path.getsize(os.path.join(out,'voxx-vx.glb')))
print('nodes', [g[0] for g in parts])
