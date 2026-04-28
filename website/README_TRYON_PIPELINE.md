# Sartorial Mirror — Live Try‑On (Web + Unity WebGL) — Uploadable Runbook

This is the **handoff/runbook** for the live try‑on system. It’s written to be uploaded as a project document.

The final intended experience:

- The website shows a **live camera feed** with **upper‑body alignment guides** (shoulders emphasized; lower body ignored).
- Unity WebGL renders the **garment only** with a **transparent background** on top of the website camera.
- Garment motion is driven by the existing Unity pose pipeline (MediaPipe landmarks → joint spheres → FK garment).

---

## Scope and constraints

- **Upper‑body only**: shoulders are the primary anchors; lower body is not required.
- **Unity stays the renderer**: garment deformation/rig is not re‑implemented in the browser.
- **Local dev**: the standard setup uses localhost ports; do not require cloud services.

---

## High‑level architecture

### Components

- **Web frontend**: Vite + React + TypeScript + Tailwind.
  - Owns the *user experience*: page flow, camera preview, alignment dots/guides, and embedding Unity WebGL.
- **Unity WebGL build**: hosted locally (simple static HTTP server).
  - Renders the garment and runs the existing Unity tracking/mapping/FK logic.
- **Unity pose server**: WebSocket server Unity connects to (or receives frames from) on port `8000`.
  - Path used by Unity: `ws://127.0.0.1:8000/ws`

### Why “Unity as render” (Option B)

We chose Unity WebGL as the renderer because:

- The garment pipeline was already working in Unity (real‑time rig control).
- Web UI can focus on camera UX and guidance overlays without re‑implementing garment deformation.

---

## Repos + important local paths

### Web repo (local)

- `/Users/renadsameh/.cursor-tutor/Senior-Project`

### Unity repo (local)

- `/Users/renadsameh/.cursor-tutor/SartorialMirror_new`

### Unity WebGL build output folder (example)

- `~/Desktop/SartorialMirror_WebGL`

---

## Prerequisites

- **Node.js** (matches repo requirements; see `Senior-Project/package.json`)
- **Python 3** (to host the Unity WebGL folder with `http.server`)
- **Unity** installed with the **WebGL Build Support** module
- A working **Unity pose server** that accepts frames on `ws://127.0.0.1:8000/ws`

---

## How to run (known‑good local setup)

You typically run **3 servers**:

1. **Unity pose server** (WebSocket) on **port 8000**
2. **Unity WebGL static host** on **port 8080**
3. **Website (Vite)** on **5174** (or whatever Vite chooses)

### 1) Start Unity pose server (port 8000)

Start your existing pose server the same way you already do in your Unity pipeline.

Expected URL:

- `ws://127.0.0.1:8000/ws`

### 2) Host the Unity WebGL build (port 8080)

From the build folder containing `index.html`, `Build/`, `TemplateData/`:

```bash
cd ~/Desktop/SartorialMirror_WebGL
python3 -m http.server 8080
```

Open:

- `http://127.0.0.1:8080/`

### 3) Start the website (Vite)

```bash
cd "/Users/renadsameh/.cursor-tutor/Senior-Project"
npm install
npm run dev
```

Open the exact Vite “Local:” URL it prints (example):

- `http://localhost:5174/`

### Navigate to Try‑On (“Mirror View”)

The app uses a state machine (phases). Typically:

- Start Session → Detection → Catalog → Try‑On

On the Catalog screen:

- select a garment
- click **Enter Mirror View**

---

## Web configuration (ports + modes)

Main settings live in:

- `Senior-Project/.env.development`

Important envs:

- `VITE_UNITY_WEBGL_URL=http://127.0.0.1:8080/`
- `VITE_UNITY_ALLOWED_ORIGIN=http://127.0.0.1:8080`

We used `demo` mode to avoid backend coupling/port conflicts:

- `VITE_RUNTIME_SOURCE_MODE=demo`

We disabled camera uplink to the web backend to avoid conflicts with Unity pose server:

- `VITE_CAMERA_UPLINK_ENABLED=false`

---

## Unity WebGL transparency (required)

To see the **website camera behind Unity**, Unity WebGL must be truly transparent:

- **Unity camera**: background alpha must be 0.
- **WebGL page**: the WebGL context must be created with alpha support.

### Unity (Editor)

- Select **Main Camera**
- **Clear Flags**: Solid Color
- **Background Color Alpha (A)**: `0`

### WebGL build output (`~/Desktop/SartorialMirror_WebGL`)

Edit `index.html` and ensure the Unity config includes:

- `backgroundColor: [0, 0, 0, 0]`
- `webglContextAttributes: { alpha: true, premultipliedAlpha: false }`

Edit `TemplateData/style.css` and ensure the canvas background is transparent:

- `#unity-canvas { background: transparent !important; }`
- `html, body { background: transparent !important; }`

---

## Key web files (what they do)

### Try‑On stage (Unity + camera + guides)

- `src/features/shopper/tryOn/UnityTryOnStageWithCameraGuides.tsx`

Responsibilities:

- renders the **website camera** video underlay
- embeds Unity WebGL as an iframe overlay
- draws SVG guide region + shoulder landmarks
- exposes “status badges” (camera ready / pose feed)

Notable fixes:

- Guarded optional landmarks (elbows/wrists may be missing) to prevent Try‑On crashes.
- Added iframe `allow` permissions needed for Unity WebGL in an iframe (camera / autoplay / fullscreen).

### Upper body alignment hook (MediaPipe + fallback)

- `src/features/shopper/tryOn/useUpperBodyAlignment.ts`

Responsibilities:

- in‑browser pose detection for UX guidance (not the Unity garment)
- **upper‑body only** requirements (shoulders are mandatory)
- MediaPipe Tasks Vision + TFJS MoveNet fallback
- debug fields for tracking state

### Camera preview stage used in idle/detection

- `src/features/shopper/camera/CameraStageSurface.tsx`

Responsibilities:

- shows camera preview + guide region and live dots for shoulders/arms

### Camera frame relay (web → backend) (used earlier)

- `src/adapters/camera/cameraFrameRelay.ts`
- `src/features/shopper/camera/useCameraFrameRelay.ts`

We tuned:

- smaller payloads (JPEG quality + width + interval) to avoid silent WS disconnects.

### Unity embed (shared styling)

- `src/styles/globals.css`

Notable:

- `.unity-stage-frame { background: transparent; }`

---

## Unity key files (what they do)

### Pose receiver (Unity → pose server)

- `Assets/SMPL/Bashar Unity/PoseReceiverWS.cs`

Responsibilities:

- connect to `ws://127.0.0.1:8000/ws`
- optionally capture `WebCamTexture`
- send JPEG frames to the pose server
- receive landmark messages and store latest pose

Notes:

- WebGL/WebSocket behavior differs across NativeWebSocket versions. We handled an API mismatch where `DispatchMessageQueue()` may not exist.

### Garment mode director (SMPL vs garment)

- `Assets/SartorialMirror/Scripts/GarmentOnlyPoseDirector.cs`

Responsibilities:

- toggles **SMPL avatar vs garment**
- ensures mapping/fk drivers are enabled correctly for garment mode

Critical fix:

- Keep the classic `MediaPipe33_To_J17Mapper1` enabled at all times so J_* doesn’t freeze.

### Mapper (33 → 17 target spheres)

- `Assets/SMPL/Bashar Unity/MediaPipe33_To_J17Mapper1.cs`

Responsibilities:

- maps 33 MediaPipe spheres to 17 `J_*` spheres
- includes robustness improvements for scene reload / root misassignment

### Garment FK autofill

- `Assets/SartorialMirror/Scripts/GarmentRigifyFkAutofill.cs`

Responsibilities:

- wires `SpheresToBones_FKDriver` to Rigify bones (`DEF-*` naming variants)
- disables conflicting animators by default
- helps avoid torso deformation by not forcing root follow by default

### WebGL overlay helper (Unity)

- `Assets/SartorialMirror/Scripts/WebGLGarmentStageController.cs`

Responsibilities:

- hide Unity webcam background UI (so the website owns the background)
- force main camera alpha to 0 for transparent WebGL overlay

Important constraint:

- It must **never disable the runtime root** (otherwise the pose pipeline can stop).

---

## What we struggled with (and what worked)

### 1) Port conflicts (`8000`)

Symptom:

- `403` on `/ws/runtime` or `/ws/camera`
- backend failing to start: “Address already in use”

Cause:

- multiple processes trying to use port `8000` (web backend + Unity pose server)

Fix:

- Use Unity pose server on `8000/ws`
- Keep the web app in `demo` mode and disable web backend uplinks when Unity owns pose.

### 2) MediaPipe “hangs” / “Loading pose tracker…”

Fixes:

- load MediaPipe WASM/models from `public/mediapipe/…` instead of CDNs
- add error states + HEAD checks to surface missing assets
- implement TFJS MoveNet fallback

### 3) “Tracker says camera ready but shows grey”

Cause:

- camera permission/competition between an iframe and the parent page (macOS quirks)

Fix approach:

- Decide *one owner* of the webcam and ensure the other side doesn’t request it.

### 4) Unity WebGL transparency

Must‑have:

- Unity camera background alpha = 0
- WebGL `index.html` config includes transparent background
- Canvas CSS background transparent

### 5) Garment stopped moving in WebGL but works in Editor Play

Common causes:

- WebGL websocket message pumping differences (NativeWebSocket version mismatch)
- Unity iframe permission restrictions (camera not allowed)
- runtime objects being disabled accidentally (e.g., disabling parent object containing pose receiver)

---

## Troubleshooting checklist

### Website shows camera but no garment

- Is Unity WebGL URL reachable? Open `http://127.0.0.1:8080/`
- In the website Try‑On stage, does the “Unity ready” badge show?

### Garment shows but doesn’t move

- Is the pose server running on `ws://127.0.0.1:8000/ws`?
- Does Unity log “WS Open”?
- Is Unity able to access camera (if Unity owns camera capture)?

### Website camera turns grey when Unity loads

- Camera is being competed for (iframe vs parent).
- Ensure only one component is requesting the webcam.

### Website shows garment motion but no visible camera behind it

- Unity WebGL is still opaque.
- Verify `index.html` has both:
  - `backgroundColor: [0,0,0,0]`
  - `webglContextAttributes: { alpha: true, premultipliedAlpha: false }`
- Verify `TemplateData/style.css` makes `#unity-canvas` transparent.

### Unity is a black / opaque rectangle

- Unity camera alpha must be 0
- WebGL config must use transparent background and an alpha context
- CSS must not paint an opaque canvas background

---

## Deliverables (what was built)

- Web UI with:
  - local camera preview
  - upper‑body guidance and alignment overlay
  - Unity WebGL embedding within the Try‑On stage
- Unity code improvements for:
  - stable mapping pipeline (33 → J_*)
  - garment FK wiring robustness
  - optional WebGL overlay support (hide Unity camera background UI + transparent clear)

---

## Notes / next improvements

- Add a dedicated “kiosk build” Unity scene optimized for WebGL overlay (no extra UI, only garment render).
- Add a proper garment thumbnail pipeline (render FBX thumbnails to PNG for the web catalog).
- If camera competition persists on macOS, use the “single camera owner” strategy:
  - website owns camera background
  - website streams frames to pose server
  - Unity receives pose results and renders garment only

---

## Final verification checklist (demo)

- [ ] Unity pose server is running on `ws://127.0.0.1:8000/ws`
- [ ] Unity WebGL host is running on `http://127.0.0.1:8080/`
- [ ] Website is running (Vite prints a Local URL)
- [ ] In website: Start Session → Choose garment → Enter Mirror View
- [ ] Website shows **live camera background**
- [ ] Shoulder dots/guides are visible and stable
- [ ] Garment appears and moves in real time

