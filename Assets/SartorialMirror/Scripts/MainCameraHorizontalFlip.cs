using UnityEngine;
using UnityEngine.Rendering;

/// <summary>
/// Horizontal mirror for try-on. Uses <see cref="OnRenderImage"/> + Unity’s built-in <c>Unlit/Texture</c> material
/// (UV scale −1) so no custom .shader file is required. Built-in RP only for the blit path.
/// Optional projection-matrix flip is legacy and can make garments look like their back side.
/// </summary>
[DisallowMultipleComponent]
[RequireComponent(typeof(Camera))]
public sealed class MainCameraHorizontalFlip : MonoBehaviour
{
    [Tooltip("Mirrors the camera output left↔right after rendering (Built-in pipeline). Uses built-in Unlit/Texture + UV flip.")]
    public bool flipDisplayWithBlit = true;

    [Tooltip(
        "When enabled, patches projectionMatrix each frame. Can flip triangle winding (garment looks like its back). " +
        "Leave off if Blit mirroring is enough.")]
    public bool flipCameraProjectionMatrix = false;

    static readonly int MainTexId = Shader.PropertyToID("_MainTex");

    Camera _cam;
    bool _useSrpHook;
    Material _blitMat;

    void Awake()
    {
        _cam = GetComponent<Camera>();
        _useSrpHook = GraphicsSettings.defaultRenderPipeline != null;
    }

    void OnEnable()
    {
        if (_cam == null)
            _cam = GetComponent<Camera>();
        _useSrpHook = GraphicsSettings.defaultRenderPipeline != null;

        if (_useSrpHook)
            RenderPipelineManager.beginCameraRendering += OnBeginCameraRendering;
    }

    void OnDisable()
    {
        if (_useSrpHook)
            RenderPipelineManager.beginCameraRendering -= OnBeginCameraRendering;

        if (_cam != null)
            _cam.ResetProjectionMatrix();

        if (_blitMat != null)
        {
            if (Application.isPlaying)
                Destroy(_blitMat);
            else
                DestroyImmediate(_blitMat);
            _blitMat = null;
        }
    }

#if UNITY_EDITOR
    void OnValidate()
    {
        if (flipCameraProjectionMatrix && flipDisplayWithBlit)
            flipDisplayWithBlit = false;
    }
#endif

    void OnPreCull()
    {
        if (_useSrpHook || _cam == null || !flipCameraProjectionMatrix)
            return;

        PatchProjection();
    }

    void OnBeginCameraRendering(ScriptableRenderContext context, Camera camera)
    {
        if (camera != _cam || !flipCameraProjectionMatrix)
            return;

        PatchProjection();
    }

    void PatchProjection()
    {
        if (_cam == null || !_cam.enabled)
            return;

        _cam.ResetProjectionMatrix();

        Matrix4x4 p = _cam.projectionMatrix;
        p.m00 *= -1f;
        _cam.projectionMatrix = p;
    }

    void EnsureBlitMaterial()
    {
        if (_blitMat != null)
            return;

        var sh = Shader.Find("Unlit/Texture")
                 ?? Shader.Find("Mobile/Unlit/Texture")
                 ?? Shader.Find("Sprites/Default");

        if (sh == null)
        {
            Debug.LogError("[MainCameraHorizontalFlip] No suitable built-in shader found (Unlit/Texture). Cannot blit-flip.", this);
            return;
        }

        _blitMat = new Material(sh);
        _blitMat.SetTextureScale(MainTexId, new Vector2(-1f, 1f));
        _blitMat.SetTextureOffset(MainTexId, new Vector2(1f, 0f));
    }

    void OnRenderImage(RenderTexture src, RenderTexture dest)
    {
        if (_useSrpHook || flipCameraProjectionMatrix || !flipDisplayWithBlit)
        {
            Graphics.Blit(src, dest);
            return;
        }

        EnsureBlitMaterial();
        if (_blitMat == null)
        {
            Graphics.Blit(src, dest);
            return;
        }

        Graphics.Blit(src, dest, _blitMat);
    }
}