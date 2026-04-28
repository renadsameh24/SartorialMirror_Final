using UnityEngine;

/// <summary>
/// WebGL overlay helper (minimal):
/// - Optionally hides Unity's webcam background UGUI in WebGL only (WebcamBackgroundUGUI children).
/// - Forces the render camera to clear with alpha = 0 (transparent iframe embed).
/// Does NOT move/rotate/scale the garment or touch bones (keeps behavior predictable).
/// </summary>
[DefaultExecutionOrder(-500)]
public sealed class WebGLGarmentStageController : MonoBehaviour
{
    [Header("Hide Unity webcam UI (WebGL only)")]
    [Tooltip("False = keep Unity mirror feed visible. True = legacy mode when the parent web page shows the camera.")]
    public bool hideWebcamBackgroundInWebGL = false;
    public WebcamBackgroundUGUI webcamBackground;

    [Header("Transparent WebGL background")]
    public bool forceTransparentCameraClear = true;
    public Camera targetCamera;

    bool _webcamHidden;

    void Awake()
    {
        if (targetCamera == null)
            targetCamera = Camera.main;
    }

    void Start()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        TryHideWebcamBackgroundWebGL();
#endif
        ForceTransparentCamera();
    }

    void LateUpdate()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        TryHideWebcamBackgroundWebGL();
#endif
        ForceTransparentCamera();
    }

    void ForceTransparentCamera()
    {
        if (!forceTransparentCameraClear || targetCamera == null) return;

        targetCamera.clearFlags = CameraClearFlags.SolidColor;
        var c = targetCamera.backgroundColor;
        c.a = 0f;
        targetCamera.backgroundColor = c;
    }

#if UNITY_WEBGL && !UNITY_EDITOR
    void TryHideWebcamBackgroundWebGL()
    {
        if (!hideWebcamBackgroundInWebGL || _webcamHidden) return;

        if (webcamBackground == null)
            webcamBackground = FindObjectOfType<WebcamBackgroundUGUI>(true);

        if (webcamBackground == null) return;

        // Do NOT deactivate webcamBackground.gameObject — it often shares the bootstrap root with PoseReceiverWS.
        webcamBackground.enabled = false;

        var t = webcamBackground.transform;
        for (int i = 0; i < t.childCount; i++)
            t.GetChild(i).gameObject.SetActive(false);

        _webcamHidden = true;
    }
#endif
}