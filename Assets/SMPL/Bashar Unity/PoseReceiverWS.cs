using System;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using NativeWebSocket;

[Serializable]
public class PoseMsg
{
    public bool ok;
    public string error;
    public List<Lm> landmarks;
}

[Serializable]
public class Lm
{
    public float x, y, z, v;
}

public class PoseReceiverWS : MonoBehaviour
{
    [Header("WebSocket")]
    public string wsUrl = "ws://127.0.0.1:8000/ws";
    public bool logStatus = true;
    public bool logPythonErrors = true;

    [Header("Optional: Send Webcam Frames")]
    public bool sendWebcamFrames = true;
    public int reqWidth = 640;
    public int reqHeight = 480;
    public int reqFps = 30;
    public int sendFps = 15;
    [Range(20, 90)] public int jpegQuality = 60;

    // Must NOT be wrapped in UNITY_WEBGL/#if — Unity requires identical serialized layout in Editor and player builds.
    [Header("WebGL build (memory)")]
    [Tooltip("WebGL only: max longest side when JPEG-encoding frames for the pose server. Ignored on other platforms.")]
    [SerializeField] int webglMaxCaptureDimension = 640;

    public PoseMsg Latest { get; private set; }
    public bool HasPose => Latest != null && Latest.ok && Latest.landmarks != null && Latest.landmarks.Count >= 33;

    private WebSocket ws;
    private WebCamTexture cam;
    private Texture2D frameTex;
    private float sendTimer;
    private bool isSending;

    public WebCamTexture WebcamTexture => cam;

    async void Start()
    {
        if (sendWebcamFrames)
        {
            cam = new WebCamTexture(reqWidth, reqHeight, reqFps);
            cam.Play();
        }

        ws = new WebSocket(wsUrl);

        ws.OnOpen += () =>
        {
            if (logStatus) Debug.Log("WS Open: " + wsUrl);
        };

        ws.OnMessage += (bytes) =>
        {
            try
            {
                string json = Encoding.UTF8.GetString(bytes);
                Latest = JsonUtility.FromJson<PoseMsg>(json);

                if (Latest != null && !Latest.ok && logPythonErrors)
                    Debug.LogWarning("Python error: " + Latest.error);
            }
            catch (Exception e)
            {
                Debug.LogError("WS Parse error: " + e.Message);
            }
        };

        ws.OnError += (e) =>
        {
            Debug.LogError("WS Error: " + e);
        };

        ws.OnClose += (e) =>
        {
            if (logStatus) Debug.Log("WS Closed: " + e);
        };

        await ws.Connect();
    }

    void Update()
    {
        PumpMessageQueueIfSupported();
        if (!sendWebcamFrames) return;

        if (cam == null || !cam.isPlaying) return;

        if (cam.width > 16 && cam.height > 16)
            EnsureFrameTexMatchesCaptureSize();

        sendTimer += Time.deltaTime;
        float interval = 1f / Mathf.Max(1, sendFps);

        if (sendTimer >= interval)
        {
            sendTimer = 0f;
            TrySendFrame();
        }
    }

    async void TrySendFrame()
    {
        if (isSending) return;
        if (ws == null || ws.State != WebSocketState.Open) return;
        if (cam == null || !cam.didUpdateThisFrame) return;
        if (frameTex == null) return;

        isSending = true;

        try
        {
            CopyWebcamIntoFrameTex();

            byte[] jpg = frameTex.EncodeToJPG(jpegQuality);
            if (jpg != null && jpg.Length > 0)
                await ws.Send(jpg);
        }
        catch (Exception ex)
        {
            Debug.LogError("SendFrame error: " + ex.Message);
        }
        finally
        {
            isSending = false;
        }
    }

    async void OnDisable()
    {
        try
        {
            if (ws != null && ws.State == WebSocketState.Open)
                await ws.Close();
        }
        catch { }
    }

    void PumpMessageQueueIfSupported()
    {
        if (ws == null) return;
        try
        {
            // Some NativeWebSocket versions expose DispatchMessageQueue(); others don't.
            // Use reflection to avoid compile errors across package variants.
            var m = ws.GetType().GetMethod("DispatchMessageQueue");
            if (m != null) m.Invoke(ws, null);
        }
        catch
        {
            // ignore
        }
    }

    void EnsureFrameTexMatchesCaptureSize()
    {
        GetCaptureDimensions(cam.width, cam.height, out var cw, out var ch);
        if (frameTex != null && frameTex.width == cw && frameTex.height == ch) return;

        if (frameTex != null)
        {
            Destroy(frameTex);
            frameTex = null;
        }

        frameTex = new Texture2D(cw, ch, TextureFormat.RGB24, false);
    }

    void GetCaptureDimensions(int camW, int camH, out int outW, out int outH)
    {
        if (camW < 16 || camH < 16)
        {
            outW = 16;
            outH = 16;
            return;
        }

#if UNITY_WEBGL && !UNITY_EDITOR
        var maxDim = Mathf.Clamp(webglMaxCaptureDimension, 160, 1280);
        var maxSide = Mathf.Max(camW, camH);
        if (maxSide <= maxDim)
        {
            outW = camW;
            outH = camH;
            return;
        }

        var scale = maxDim / (float)maxSide;
        outW = Mathf.Max(16, Mathf.RoundToInt(camW * scale));
        outH = Mathf.Max(16, Mathf.RoundToInt(camH * scale));
#else
        outW = camW;
        outH = camH;
#endif
    }

    void CopyWebcamIntoFrameTex()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        // Avoid cam.GetPixels32() at full HD — one buffer can exceed a small WASM heap and corrupt memory.
        var temp = RenderTexture.GetTemporary(frameTex.width, frameTex.height, 0, RenderTextureFormat.ARGB32, RenderTextureReadWrite.Default);
        Graphics.Blit(cam, temp);
        var prev = RenderTexture.active;
        RenderTexture.active = temp;
        frameTex.ReadPixels(new Rect(0, 0, frameTex.width, frameTex.height), 0, 0, false);
        frameTex.Apply(false);
        RenderTexture.active = prev;
        RenderTexture.ReleaseTemporary(temp);
#else
        frameTex.SetPixels32(cam.GetPixels32());
        frameTex.Apply(false);
#endif
    }
}