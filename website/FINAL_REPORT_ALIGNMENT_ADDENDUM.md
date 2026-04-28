# Addendum — Aligning the Implementation With the Final Report

This addendum bridges the wording and architecture described in **“The Sartorial Mirror: Intelligent Virtual Try‑On Solution for Smarter Fashion and Sustainable Retail”** (Final Report) with the **actual implementation work and repository layout** produced during development.

Use this file as the “what to adjust / what to clarify” companion to:

- `README_TRYON_PIPELINE.md` (runbook)
- `PROJECT_WORK_NARRATIVE.md` (engineering narrative)

---

## 1) What the Final Report states (summary of the relevant claims)

The Final Report describes a modular system with:

- **MediaPipe pose estimation** producing body landmarks from a camera feed.
- A **local Python FastAPI + WebSocket backend** used for runtime services and pose data transmission.
- A **Unity visualization environment** where the avatar and garments are rendered.
- A **Blender garment workflow** (fit to body, rig, weight paint, export FBX).
- A **React-based smart mirror interface** for shopper flow, catalog browsing, session control, and admin tooling.

It also explicitly calls out planned (but not fully integrated) hardware components:

- Intel RealSense D455 (depth camera)
- NVIDIA Jetson Orin Nano (edge deployment)

---

## 2) What the current implementation actually does (in this repo set)

### 2.1 Web UI (React/Vite) exists and drives the shopper flow

In `Senior-Project` we implemented the shopper flow as a state machine:

- Welcome → Detection → Catalog → Try‑On (“Mirror View”)

Key file:

- `src/features/shopper/tryOn/UnityTryOnStageWithCameraGuides.tsx`

This stage renders:

- **Website local camera preview**
- **Upper‑body alignment guides/dots**
- **Unity WebGL iframe** (garment renderer)

### 2.2 Unity is used as the garment renderer (including WebGL embedding)

Rather than only running Unity as a standalone desktop app, we adopted a **Unity WebGL embedding** approach for the “integrated website UI” requirement:

- Unity WebGL build hosted on `http://127.0.0.1:8080/`
- Embedded in the React stage as an iframe

This differs from the report’s “Unity runtime display” framing (which is accurate for the earlier prototype), but the WebGL approach still matches the report’s intent: Unity is the rendering/visualization environment.

### 2.3 Pose backend: two viable configurations

During development we validated two patterns:

1. **Report-aligned pattern (recommended long-term)**  
   MediaPipe runs in Python (FastAPI) → sends landmarks via WebSockets → Unity consumes them.

2. **WebGL-integration pattern (used for the website integration loop)**  
   Unity uses a pose server WebSocket endpoint on `ws://127.0.0.1:8000/ws`.

Both satisfy “local WebSocket pose transport”, but **they are not identical endpoints**. The report references a FastAPI runtime that also provides:

- `/ws/runtime`
- `/ws/camera`
- `/catalog/snapshot`

Whereas Unity’s pose server uses:

- `/ws`

This mismatch caused the main integration issues (403/404) until we put the web app into demo mode and disabled runtime uplinks.

---

## 3) Adjustments needed to match the Final Report (recommended edits + implementation alignment)

### A) Clarify the backend role and endpoints

**What to adjust in the report narrative (documentation alignment):**

- Add one paragraph stating that the “local backend” can be realized as:
  - a FastAPI runtime exposing `/ws/runtime` and `/ws/camera`, **or**
  - a pose-only server exposing `/ws` for Unity WebGL during the embedded integration phase.

**What to adjust in code (implementation alignment, if you want exact report architecture):**

- Standardize on **FastAPI** as the single local backend that:
  - receives camera frames on `/ws/camera`
  - emits pose/runtime envelopes on `/ws/runtime`
  - serves `/catalog/snapshot`
  - optionally proxies a Unity‑compatible stream

This would eliminate the “two backends fighting for port 8000” issue and makes the system match the report’s architecture diagram more directly.

### B) Reconcile “Unity renders avatar + garment” vs “garment-only in web integration”

In the final web experience, we commonly run **garment-only** in Unity for UI cleanliness:

- Hide SMPL mesh rendering
- Keep the `J_*` joint target pipeline alive
- Drive the garment rig from those targets

**Documentation adjustment:**

- Update the report’s Unity section to mention “garment-only render mode” as a UI option, even though the SMPL avatar remains part of the internal rigging reference.

**Implementation adjustment (Unity scene hygiene):**

- Ensure the WebGL build scene uses:
  - `GarmentOnlyPoseDirector.garmentOnly = true`
  - Classic mapping is always enabled so `J_*` does not freeze

### C) Explicitly document the garment armature strategy (Rigify/DEF bones)

The report currently describes rigging garments “to the skeleton” and weight painting. To match the final work precisely, add:

- garments are exported with an armature using a predictable naming scheme (Rigify `DEF-*` plus Unity rename variants)
- Unity uses an **auto-wiring FK driver** that maps `J_*` targets to those bones

This is the key insight that made garments move reliably and is central to the deliverable.

### D) Add Unity WebGL transparency constraints to documentation

Web embedding requires details not present in a desktop-only Unity prototype:

- Unity camera clear alpha = 0
- WebGL page config must use an alpha-enabled WebGL context
- Canvas CSS must not paint an opaque background

Add a short subsection in the report appendix or deployment section describing this.

### E) Document the “camera ownership” constraint for macOS

We observed a real operational constraint:

- On macOS, camera access in an iframe can compete with the parent page camera preview.

To align the final demo claim (“camera background behind garment”), the documentation should include:

- “one camera owner” rule (either Unity owns the camera, or the website does; if both try, background can gray out)

### F) Catalog “preview information” requirement

The report states the catalog includes preview info. In the web demo catalog we implemented:

- `heroImageUrl` for garments (demo thumbnails)

To match report wording:
a
- include a note that production thumbnails should be generated from Unity/Blender renders of each garment variant.

---

## 4) Concrete “what to change” checklist (if publishing as final deliverable)

If you want the implementation to match the report’s architecture *as-written* with minimal ambiguity:

- [ ] Make FastAPI the single backend on port 8000 with:
  - [ ] `/ws/camera` (ingest frames)
  - [ ] `/ws/runtime` (emit pose + runtime events)
  - [ ] `/catalog/snapshot`
  - [ ] optional `/ws` compatibility layer for Unity WebGL
- [ ] Ensure Unity WebGL build is transparent and garment-only for the demo scene
- [ ] Ensure the website Try‑On stage embeds Unity WebGL and shows camera background + guides
- [ ] Add a short appendix section to the report on:
  - WebGL transparency
  - iframe camera permissions / camera ownership
  - Rigify armature naming + auto-wiring in Unity

---

## 5) Where these changes live in the codebase (pointers)

### Web (Senior-Project)

- `src/features/shopper/tryOn/UnityTryOnStageWithCameraGuides.tsx`
- `src/features/shopper/tryOn/useUpperBodyAlignment.ts`
- `.env.development`

### Unity (SartorialMirror_new)

- `Assets/SMPL/Bashar Unity/PoseReceiverWS.cs`
- `Assets/SMPL/Bashar Unity/MediaPipe33_To_J17Mapper1.cs`
- `Assets/SartorialMirror/Scripts/GarmentOnlyPoseDirector.cs`
- `Assets/SartorialMirror/Scripts/GarmentRigifyFkAutofill.cs`
- `Assets/SartorialMirror/Scripts/WebcamBackgroundUGUI.cs`

