# SartorialMirror_new

Garment Rigify baseline: `retarget_BASELINE_FINAL.blend`

## Armature: use **`rig`**, not `metarig`

- **`rig`** — generated Rigify deform rig. This is the armature you **skin to**, **export to FBX for Unity**, and **drive** from the pose/sphere pipeline.
- **`metarig`** — Rigify construction skeleton only. **Do not** ship it to Unity, **do not** parent the garment export to it, and **do not** leave the garment’s primary Armature modifier pointing at it.

In the current blend, the shirt `VR4D030312_ShirtFlannelBWWoman` may still have an extra Armature modifier targeting `metarig`. Before export, that modifier should be **removed** so only **`rig`** deforms the mesh.

## Automated export (optional)

From repo root (requires Blender 4.x+ on PATH or `BLENDER` env):

```bash
export BLEND="$(pwd)/retarget_BASELINE_FINAL.blend"
export EXPORT_FBX="$(pwd)/Exports/Garment_Rigify_Unity.fbx"
./Tools/blender_export_garment_rig_only.sh
```

See `Tools/blender_export_garment_rig_only.py` for FBX settings.
