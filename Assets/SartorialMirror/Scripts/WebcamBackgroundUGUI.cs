using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Shows a live webcam texture behind the 3D scene using a full-screen UGUI RawImage.
/// By default it will reuse the webcam from <see cref="PoseReceiverWS"/> if present.
///
/// Important: <see cref="RenderMode.ScreenSpaceOverlay"/> always draws <b>on top of</b> the game camera,
/// which hides the garment. Use <see cref="drawVideoBehind3D"/> so the feed sits on a far plane in
/// front of the same camera — anything closer than <see cref="videoPlaneDistance"/> draws in front of the video.
/// </summary>
public sealed class WebcamBackgroundUGUI : MonoBehaviour
{
    [Header("Source")]
    public PoseReceiverWS poseReceiver;
    public bool fallbackToOwnWebcamIfMissing = true;

    [Header("Own Webcam (fallback)")]
    public int reqWidth = 1280;
    public int reqHeight = 720;
    public int reqFps = 30;

    [Header("UI vs 3D depth")]
    [Tooltip("If true, canvas uses Screen Space Camera at videoPlaneDistance so 3D content closer to the camera than that distance appears in front of the video. If false, legacy Overlay (video paints over the whole view).")]
    public bool drawVideoBehind3D = true;
    [Tooltip("Camera that draws the garment; defaults to Camera.main when null.")]
    public Camera eventCamera;
    [Tooltip("How far from the camera the video quad is placed. Must be larger than your garment depth from the camera (world units).")]
    public float videoPlaneDistance = 50f;

    [Header("UI")]
    public int canvasSortOrder = -1000;
    public bool mirrorX = true;

    private WebCamTexture ownCam;
    private Canvas canvas;
    private RawImage raw;
    private AspectRatioFitter aspect;

    void Awake()
    {
        EnsureUI();
    }

    void Start()
    {
        if (poseReceiver == null)
            poseReceiver = FindObjectOfType<PoseReceiverWS>(true);

        var tex = GetSourceTexture();
        if (tex == null && fallbackToOwnWebcamIfMissing)
        {
            ownCam = new WebCamTexture(reqWidth, reqHeight, reqFps);
            ownCam.Play();
            tex = ownCam;
        }

        if (raw != null)
            raw.texture = tex;
    }

    void Update()
    {
        if (drawVideoBehind3D)
            TryBindScreenSpaceCamera();

        var tex = GetSourceTexture() ?? (Texture)ownCam;
        if (raw != null && raw.texture != tex)
            raw.texture = tex;

        if (aspect != null && tex is WebCamTexture wct && wct.width > 16 && wct.height > 16)
            aspect.aspectRatio = (float)wct.width / wct.height;
    }

    Texture GetSourceTexture()
    {
        if (poseReceiver == null) return null;
        return poseReceiver.WebcamTexture;
    }

    void EnsureUI()
    {
        canvas = GetComponentInChildren<Canvas>(true);
        if (canvas == null)
        {
            var cgo = new GameObject("WebcamCanvas");
            cgo.transform.SetParent(transform, false);
            canvas = cgo.AddComponent<Canvas>();
            cgo.AddComponent<CanvasScaler>();
            cgo.AddComponent<GraphicRaycaster>();
        }

        ApplyCanvasRenderMode();

        raw = canvas.GetComponentInChildren<RawImage>(true);
        if (raw == null)
        {
            var rgo = new GameObject("WebcamRawImage");
            rgo.transform.SetParent(canvas.transform, false);
            raw = rgo.AddComponent<RawImage>();
            raw.raycastTarget = false;
        }

        var rt = raw.rectTransform;
        rt.anchorMin = Vector2.zero;
        rt.anchorMax = Vector2.one;
        rt.offsetMin = Vector2.zero;
        rt.offsetMax = Vector2.zero;

        if (mirrorX)
            rt.localScale = new Vector3(-1f, 1f, 1f);

        aspect = raw.GetComponent<AspectRatioFitter>();
        if (aspect == null) aspect = raw.gameObject.AddComponent<AspectRatioFitter>();
        aspect.aspectMode = AspectRatioFitter.AspectMode.EnvelopeParent;
    }

    void ApplyCanvasRenderMode()
    {
        if (canvas == null) return;

        if (!drawVideoBehind3D)
        {
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.worldCamera = null;
            canvas.sortingOrder = canvasSortOrder;
            return;
        }

        var cam = eventCamera != null ? eventCamera : Camera.main;
        if (cam == null)
            return;

        canvas.renderMode = RenderMode.ScreenSpaceCamera;
        canvas.worldCamera = cam;
        canvas.planeDistance = Mathf.Max(0.05f, videoPlaneDistance);
        canvas.sortingOrder = canvasSortOrder;
    }

    void TryBindScreenSpaceCamera()
    {
        if (!drawVideoBehind3D || canvas == null) return;
        if (canvas.renderMode == RenderMode.ScreenSpaceCamera && canvas.worldCamera != null) return;
        ApplyCanvasRenderMode();
    }

    void OnDisable()
    {
        if (ownCam != null)
        {
            if (ownCam.isPlaying) ownCam.Stop();
            ownCam = null;
        }
    }
}