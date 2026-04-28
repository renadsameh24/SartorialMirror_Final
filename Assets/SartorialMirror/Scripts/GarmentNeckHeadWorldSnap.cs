using UnityEngine;

/// <summary>
/// Runs after <see cref="SpheresToBones_FKDriver"/> (2500). Lerps garment transforms toward
/// detected spheres — typically the <b>upper DEF-spine</b> bone toward <c>J_neck</c> (collar ring)
/// and an optional child toward <c>J_head</c>. Class name kept for prefab compatibility.
/// </summary>
[DefaultExecutionOrder(2600)]
public sealed class GarmentNeckHeadWorldSnap : MonoBehaviour
{
    [Tooltip("Usually the upper chest / last DEF-spine.* bone (collar area) — lerped toward J_neck.")]
    public Transform garmentNeckBone;

    [Tooltip("Optional bone above the collar (e.g. child of last spine) — lerped toward J_head when set.")]
    public Transform garmentHeadBone;

    public Transform jNeckSphere;
    public Transform jHeadSphere;

    [Tooltip("Lerp garmentNeckBone toward J_neck (collar / upper spine).")]
    public bool snapNeck = true;

    [Tooltip("Lerp garmentHeadBone toward J_head when both are assigned.")]
    public bool snapHead = true;

    [Range(0f, 1f)]
    [Tooltip("1 = hard snap each frame; lower = smoother follow.")]
    public float positionLerp = 0.45f;

    void LateUpdate()
    {
        var t = Mathf.Clamp01(positionLerp);
        if (snapNeck && garmentNeckBone && jNeckSphere)
            garmentNeckBone.position = Vector3.Lerp(garmentNeckBone.position, jNeckSphere.position, t);

        if (snapHead && garmentHeadBone && jHeadSphere)
            garmentHeadBone.position = Vector3.Lerp(garmentHeadBone.position, jHeadSphere.position, t);
    }
}