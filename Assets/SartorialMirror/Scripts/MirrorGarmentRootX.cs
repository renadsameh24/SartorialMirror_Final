using UnityEngine;

/// <summary>
/// <b>Not compatible</b> with <see cref="SpheresToBones_FKDriver"/> + world-space <c>J_*</c> spheres: negating garment
/// <c>localScale.x</c> mirrors the armature’s coordinate handedness while FK still aligns bones to <i>unmirrored</i> sphere
/// directions, which twists shoulders/elbows (looks like “deformed arms”). For left/right try-on, enable
/// <c>mirrorX</c> on <see cref="MediaPipe33_To_J17Mapper1"/> / <c>PoseLandmarksToJointSpheresFlexible</c> instead and leave this component disabled.
/// </summary>
/// <remarks>
/// This script remains for rare cases (static display mesh, no FK). <see cref="mirrorAlongX"/> defaults to <b>false</b>.
/// </remarks>
[DefaultExecutionOrder(2700)]
public sealed class MirrorGarmentRootX : MonoBehaviour
{
    [Tooltip("Root transform of the try-on garment (armature + mesh). If null, uses this GameObject’s transform.")]
    public Transform garmentRoot;

    [Tooltip(
        "OFF by default. Negative X scale breaks FK-driven Rigify shirts (arms twist). Use pose mapper mirrorX instead. " +
        "Only enable for meshes that are not driven by SpheresToBones_FKDriver + J_* spheres.")]
    public bool mirrorAlongX = false;

    [Tooltip(
        "After mirroring scale, shift the root once so the world-space center of all Renderer bounds matches the center " +
        "captured in Awake. Turn off if parented to a moving avatar.")]
    public bool retainEditorPlacement = true;

    Vector3 _scaleBaseline;
    Vector3 _pinnedWorldBoundsCenter;
    bool _havePinnedCenter;
    Vector3 _compensationWorld;
    bool _compensationApplied;
    static bool _fkMirrorWarningShown;

    void Awake()
    {
        if (garmentRoot == null)
            garmentRoot = transform;

        _scaleBaseline = garmentRoot.localScale;

        _havePinnedCenter = TryGetCombinedBoundsWorld(garmentRoot, out var b);
        if (_havePinnedCenter)
            _pinnedWorldBoundsCenter = b.center;

        WarnIfFkIncompatible();
    }

#if UNITY_EDITOR
    void OnValidate()
    {
        if (Application.isPlaying && garmentRoot != null)
            WarnIfFkIncompatible();
    }
#endif

    void WarnIfFkIncompatible()
    {
        if (!mirrorAlongX || _fkMirrorWarningShown || garmentRoot == null)
            return;
        if (!HasSpheresFkNearGarment(garmentRoot))
            return;

        _fkMirrorWarningShown = true;
        Debug.LogWarning(
            "[MirrorGarmentRootX] Mirror Along X is incompatible with SpheresToBones_FKDriver + J_* spheres: the armature " +
            "is mirrored in local space but joint targets are not, so arms deform. Turn Mirror Along X OFF here and enable " +
            "mirrorX on MediaPipe33_To_J17Mapper1 (and/or PoseLandmarksToJointSpheresFlexible / GarmentOnlyPoseDirector).",
            this);
    }

    static bool HasSpheresFkNearGarment(Transform root)
    {
        if (root.GetComponentInChildren<SpheresToBones_FKDriver>(true))
            return true;
        for (var p = root.parent; p != null; p = p.parent)
        {
            if (p.GetComponent<SpheresToBones_FKDriver>())
                return true;
        }
        return false;
    }

    void OnEnable()
    {
        _compensationWorld = Vector3.zero;
        _compensationApplied = false;
    }

    void LateUpdate()
    {
        if (garmentRoot == null)
            return;

        if (!mirrorAlongX)
        {
            garmentRoot.localScale = new Vector3(_scaleBaseline.x, _scaleBaseline.y, _scaleBaseline.z);
            if (_compensationWorld.sqrMagnitude > 1e-12f)
            {
                garmentRoot.position -= _compensationWorld;
                _compensationWorld = Vector3.zero;
            }
            _compensationApplied = false;
            return;
        }

        float x = -_scaleBaseline.x;
        garmentRoot.localScale = new Vector3(x, _scaleBaseline.y, _scaleBaseline.z);

        if (!retainEditorPlacement || !_havePinnedCenter || _compensationApplied)
            return;

        if (!TryGetCombinedBoundsWorld(garmentRoot, out var after))
            return;

        var delta = _pinnedWorldBoundsCenter - after.center;
        garmentRoot.position += delta;
        _compensationWorld += delta;
        _compensationApplied = true;
    }

    static bool TryGetCombinedBoundsWorld(Transform root, out Bounds b)
    {
        b = default;
        if (!root) return false;

        var rends = root.GetComponentsInChildren<Renderer>(true);
        if (rends.Length == 0) return false;

        b = rends[0].bounds;
        for (var i = 1; i < rends.Length; i++)
            b.Encapsulate(rends[i].bounds);
        return true;
    }

    [ContextMenu("Refresh baselines from current")]
    public void RefreshBaselineFromCurrent()
    {
        if (garmentRoot == null)
            garmentRoot = transform;
        _scaleBaseline = garmentRoot.localScale;
        _havePinnedCenter = TryGetCombinedBoundsWorld(garmentRoot, out var b);
        if (_havePinnedCenter)
            _pinnedWorldBoundsCenter = b.center;
        _compensationWorld = Vector3.zero;
        _compensationApplied = false;
    }
}