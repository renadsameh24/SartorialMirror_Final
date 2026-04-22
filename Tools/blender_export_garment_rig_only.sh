#!/usr/bin/env bash
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

export BLEND="${BLEND:-$REPO/retarget_BASELINE_FINAL.blend}"
export EXPORT_FBX="${EXPORT_FBX:-$REPO/Exports/Garment_Rigify_Unity.fbx}"
export RIG_NAME="${RIG_NAME:-rig}"
export META_NAME="${META_NAME:-metarig}"

BLENDER_CMD="${BLENDER:-}"
if [[ -z "$BLENDER_CMD" ]]; then
  if command -v blender &>/dev/null; then
    BLENDER_CMD="$(command -v blender)"
  elif [[ -x "/Applications/Blender.app/Contents/MacOS/Blender" ]]; then
    BLENDER_CMD="/Applications/Blender.app/Contents/MacOS/Blender"
  else
    echo "Set BLENDER=/path/to/blender or install Blender." >&2
    exit 1
  fi
fi

mkdir -p "$(dirname "$EXPORT_FBX")"
echo "BLEND=$BLEND"
echo "EXPORT_FBX=$EXPORT_FBX"
echo "Using armature: $RIG_NAME (not $META_NAME)"
exec "$BLENDER_CMD" --background --python "$REPO/Tools/blender_export_garment_rig_only.py"
