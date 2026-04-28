# The Sartorial Mirror — Final Documentation Packet

This single file combines:

1. The **uploadable runbook** (how to run + troubleshooting)
2. The **engineering narrative** (what we built and how we arrived there)
3. The **Final Report alignment addendum** (how to reconcile report wording with implementation)

---

## Part A — Uploadable Runbook

Source: `README_TRYON_PIPELINE.md`

---

<!-- BEGIN README_TRYON_PIPELINE.md -->

## Sartorial Mirror — Live Try‑On (Web + Unity WebGL) — Uploadable Runbook

This is the **handoff/runbook** for the live try‑on system. It’s written to be uploaded as a project document.

The final intended experience:

- The website shows a **live camera feed** with **upper‑body alignment guides** (shoulders emphasized; lower body ignored).
- Unity WebGL renders the **garment only** with a **transparent background** on top of the website camera.
- Garment motion is driven by the existing Unity pose pipeline (MediaPipe landmarks → joint spheres → FK garment).

### Scope and constraints

- **Upper‑body only**: shoulders are the primary anchors; lower body is not required.
- **Unity stays the renderer**: garment deformation/rig is not re‑implemented in the browser.
- **Local dev**: the standard setup uses localhost ports; do not require cloud services.

### High‑level architecture

**Components**

- **Web frontend**: Vite + React + TypeScript + Tailwind.
  - Owns the *user experience*: page flow, camera preview, alignment dots/guides, and embedding Unity WebGL.
- **Unity WebGL build**: hosted locally (simple static HTTP server).
  - Renders the garment and runs the existing Unity tracking/mapping/FK logic.
- **Unity pose server**: WebSocket server Unity connects to (or receives frames from) on port `8000`.
  - Path used by Unity: `ws://127.0.0.1:8000/ws`

**Why “Unity as render” (Option B)**

- The garment pipeline was already working in Unity (real‑time rig control).
- Web UI can focus on camera UX and guidance overlays without re‑implementing garment deformation.

### Repos + important local paths

- **Web repo**: `/Users/renadsameh/.cursor-tutor/Senior-Project`
- **Unity repo**: `/Users/renadsameh/.cursor-tutor/SartorialMirror_new`
- **Unity WebGL build output** (example): `~/Desktop/SartorialMirror_WebGL`

### Prerequisites

- **Node.js** (matches repo requirements; see `Senior-Project/package.json`)
- **Python 3** (to host Unity WebGL with `http.server`)
- **Unity** with **WebGL Build Support**
- A working **Unity pose server** that accepts frames on `ws://127.0.0.1:8000/ws`

### How to run (known‑good local setup)

Run **3 servers**:

1. Unity pose server (WS) on **8000**
2. Unity WebGL host on **8080**
3. Website (Vite) on **5174** (or next available)

**1) Pose server**

- Expect: `ws://127.0.0.1:8000/ws`

**2) Unity WebGL host**

```bash
cd ~/Desktop/SartorialMirror_WebGL
python3 -m http.server 8080
```

Open: `http://127.0.0.1:8080/`

**3) Website**

```bash
cd "/Users/renadsameh/.cursor-tutor/Senior-Project"
npm install
npm run dev
```

Open the printed “Local:” URL (example): `http://localhost:5174/`

**Navigate to Try‑On (“Mirror View”)**

- Start Session → Detection → Catalog → Try‑On
- On Catalog screen: select garment → **Enter Mirror View**

### Web configuration (ports + modes)

File: `Senior-Project/.env.development`

- `VITE_UNITY_WEBGL_URL=http://127.0.0.1:8080/`
- `VITE_UNITY_ALLOWED_ORIGIN=http://127.0.0.1:8080`
- `VITE_RUNTIME_SOURCE_MODE=demo`
- `VITE_CAMERA_UPLINK_ENABLED=false`

### Unity WebGL transparency (required)

To see the **website camera behind Unity**, Unity WebGL must be truly transparent.

**Unity (Editor)**

- Main Camera → Clear Flags: Solid Color
- Background color **Alpha (A)=0**

**WebGL build output**

`index.html` config must include:

- `backgroundColor: [0, 0, 0, 0]`
- `webglContextAttributes: { alpha: true, premultipliedAlpha: false }`

`TemplateData/style.css` must include:

- `#unity-canvas { background: transparent !important; }`
- `html, body { background: transparent !important; }`

### Key web files

- `src/features/shopper/tryOn/UnityTryOnStageWithCameraGuides.tsx`
- `src/features/shopper/tryOn/useUpperBodyAlignment.ts`
- `src/features/shopper/camera/CameraStageSurface.tsx`
- `src/styles/globals.css`
- `.env.development`

### Key Unity files

- `Assets/SMPL/Bashar Unity/PoseReceiverWS.cs`
- `Assets/SMPL/Bashar Unity/MediaPipe33_To_J17Mapper1.cs`
- `Assets/SartorialMirror/Scripts/GarmentOnlyPoseDirector.cs`
- `Assets/SartorialMirror/Scripts/GarmentRigifyFkAutofill.cs`
- `Assets/SartorialMirror/Scripts/WebcamBackgroundUGUI.cs`
- `Assets/SartorialMirror/Scripts/WebGLGarmentStageController.cs`

### Troubleshooting checklist (high signal)

- **Port conflicts on 8000**: ensure only one service owns port 8000.
- **403/404 on /ws/runtime**: web backend endpoints differ from Unity pose server; use demo mode or unify backends.
- **Garment not moving**: check pose server is running, Unity connects, and `J_*` targets update.
- **Website camera turns grey when Unity loads**: camera competition (iframe vs page); enforce single camera ownership strategy.
- **Unity opaque rectangle**: verify alpha-enabled WebGL context + transparent canvas CSS.

### Final verification checklist (demo)

- [ ] Pose server on `ws://127.0.0.1:8000/ws`
- [ ] Unity WebGL on `http://127.0.0.1:8080/`
- [ ] Website on Vite Local URL
- [ ] Mirror View shows live camera background + upper-body guides
- [ ] Garment appears and moves in real time

<!-- END README_TRYON_PIPELINE.md -->

---

## Part B — Engineering Work Narrative

Source: `PROJECT_WORK_NARRATIVE.md`

---

<!-- BEGIN PROJECT_WORK_NARRATIVE.md -->

## Project Work Narrative — Garment Motion Pipeline + Web Try‑On Integration

This section describes what we built and how we discovered the correct garment armature strategy.

### The core discovery: garments must have a usable armature

We proved that “33 landmarks moving” does not imply “garment moves.” We needed a reliable intermediate joint target contract (`J_*`) and a garment rig that Unity can drive.

Key steps:

- Verified pose input: 33 landmark spheres update.
- Verified mapping stage: `J_*` targets update.
- Verified driver stage: garment bones must exist and be discoverable.

We learned from the SMPL pipeline’s joint naming and driving strategy but did **not** rely on SMPL deformation for the final garment rendering. SMPL served as a reference for correctness.

### Armature workflow (Blender → Unity)

- Rig garment in Blender with Rigify-style bones (`DEF-*`).
- Export FBX and import into Unity.
- Auto-wire FK driver segments in Unity by searching for expected bone names (including Unity rename variants).

Key Unity file:

- `Assets/SartorialMirror/Scripts/GarmentRigifyFkAutofill.cs`

### Stability fix: keep classic J_* mapping always enabled

When toggling garment-only rendering, disabling the classic mapper froze `J_*` targets and stopped garment motion. We fixed this by ensuring the classic mapper remains enabled.

Key Unity file:

- `Assets/SartorialMirror/Scripts/GarmentOnlyPoseDirector.cs`

### Web integration outcome

- React UI provides camera + alignment guides.
- Unity WebGL renders the garment on top (transparent).
- Biggest issues: ports, endpoint mismatch, WebGL transparency, iframe camera permissions.

### Alignment with the Final Report

We added explicit clarifications on backend endpoints, Unity role (desktop vs WebGL), rigging details, WebGL transparency requirements, and camera ownership constraints.

See: `FINAL_REPORT_ALIGNMENT_ADDENDUM.md`.

<!-- END PROJECT_WORK_NARRATIVE.md -->

---

## Part C — Final Report Alignment Addendum

Source: `FINAL_REPORT_ALIGNMENT_ADDENDUM.md`

---

<!-- BEGIN FINAL_REPORT_ALIGNMENT_ADDENDUM.md -->

## Addendum — Aligning the Implementation With the Final Report

### What the report claims

- MediaPipe pose estimation
- Local Python FastAPI + WebSocket backend
- Unity visualization environment
- Blender garment workflow
- React smart mirror UI

### What the implementation currently does

- Web UI: state machine + Try‑On stage embedding Unity WebGL
- Unity: garment-only option while keeping `J_*` pipeline alive
- Two backend endpoint patterns were encountered (`/ws/runtime` vs `/ws`)

### Adjustments to match the report precisely

- Standardize to one FastAPI backend on port 8000 (optional Unity WS bridge).
- Clarify Unity desktop vs Unity WebGL embedding.
- Add explicit Rigify/armature naming + auto-wiring description.
- Add WebGL transparency + alpha context requirement to documentation.
- Document camera ownership constraint on macOS (iframe vs page).

<!-- END FINAL_REPORT_ALIGNMENT_ADDENDUM.md -->

---

## Export to PDF

This file is designed to be converted to PDF.

If you have `pandoc` installed:

```bash
pandoc MASTER_DOCUMENT.md -o MASTER_DOCUMENT.pdf
```

If you don’t have `pandoc`, open `MASTER_DOCUMENT.md` in any Markdown editor (or GitHub) and “Print to PDF”.

