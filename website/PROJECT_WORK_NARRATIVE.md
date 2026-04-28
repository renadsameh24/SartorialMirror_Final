# Project Work Narrative — Garment Motion Pipeline + Web Try‑On Integration

This document is a **narrative description** of the work completed for the Sartorial Mirror senior project. It complements the runbook/README by focusing on **what we built, how we discovered the right approach, and the key technical lessons**—especially around the garment’s armature/rig and how we adapted lessons from the SMPL pipeline without relying on SMPL mesh deformation in the final garment workflow.

---

## 1) The initial problem: “the webcam pose works, but the garment doesn’t move”

We started from a working foundation in Unity:

- A pose source (MediaPipe-style landmarks).
- A runtime sphere rig for 33 landmarks (a “landmark spheres” root).
- A mapping stage that converts those raw landmarks into a smaller set of named joints (`J_*` targets).
- A bone driver stage that uses those `J_*` joints to rotate a rig (FK).

The *symptom* was clear:

- The 33 landmark spheres were moving.
- But the garment either did not move at all or appeared to have “no bones”.

That combination almost always means: the **pose is being computed**, but the garment rig is **not being driven**—either because the rig is missing/incorrect, or because our driver cannot find the expected bones.

---

## 2) The key insight: the garment needs a real armature with predictable bone naming

We discovered an important constraint:

- A garment mesh without a usable armature (or with mismatched bone naming) cannot be driven by the same FK pipeline that drives SMPL.

### What “armature” meant in practice

For our Unity FK driver to affect the garment, the garment must have:

- A skeleton/armature with transforms that Unity can rotate at runtime.
- A stable naming scheme so scripts can find bones reliably.

We relied on **Rigify-style** bone naming (Blender), where bones commonly start with `DEF-...` (or Unity-imported variants).

This became the decision point:

- Either we generate a new “sphere rig” and custom mapping for each garment (complex and repetitive), or
- We keep one consistent joint target set (`J_*`) and ensure garments provide a compatible rig to be driven (scalable).

We chose the scalable approach: **garments must conform to a known armature scheme**.

---

## 3) Learning from the SMPL pipeline (but not using SMPL deformation)

The SMPL avatar was valuable as a **reference implementation**:

- It proved that the landmark → `J_*` → FK driver concept works.
- It established the correct joint target names (`J_l_shoulder`, `J_r_shoulder`, etc.).
- It demonstrated how “motion” should look when mapping is correct.

However, the final garment workflow did **not** need SMPL mesh deformation or SMPL’s body mesh rendering:

- We did not want to render the full SMPL body in the final mirror view.
- We only needed SMPL concepts: a stable joint target set and a proven driver strategy.

So SMPL served as a **calibration and debugging reference**, not as a dependency of the final garment rendering.

---

## 4) The “why it didn’t move” diagnosis loop (what we tried and what it taught us)

We used a repeatable diagnostic loop:

### A) Verify pose input exists

- Are the 33 landmark spheres moving?
  - If yes: pose input is alive.
  - If no: camera/pose receiver is broken upstream.

### B) Verify joint mapping stage is alive

- Are the `J_*` targets moving?
  - If no: mapping stage is disabled, mis‑wired, or targets can’t be found by name.
  - If yes: the driver stage should have something to follow.

### C) Verify garment FK wiring stage

- Does the FK driver find the garment bones?
  - If not: bone naming mismatch is the most likely cause.

This loop led to the strongest discovery: the garment must be rigged to match the driver’s expectations, or the driver must be robust to naming variants.

---

## 5) Creating the garment armature approach (Rigify → Unity)

We converged on the following:

1. In Blender, rig the garment with an armature that follows a known naming scheme (Rigify `DEF-*`).
2. Export FBX so Unity imports the bones.
3. In Unity, auto-wire FK driver segments by searching for those bone names.

### Why “auto-wire” mattered

Manual wiring of every garment bone is error‑prone and time‑consuming. To scale beyond a single garment, we needed a consistent and automatable process.

We implemented and refined an auto-fill script for this:

- `Assets/SartorialMirror/Scripts/GarmentRigifyFkAutofill.cs`

Key improvements:

- Bone name normalization (handles Unity FBX renames like underscores vs hyphens).
- Optional disabling of Mecanim animators to prevent fighting between animation and FK scripts.
- Better logging so we could see how many arm segments were actually wired (e.g., “Arm segments wired: 4/4”).

---

## 6) A major stability fix: keeping the classic `J_*` mapping running

When we introduced “garment only” mode, we initially toggled different mappers/drivers.

We discovered a subtle but critical issue:

- Disabling the classic mapper froze the `J_*` targets.
- Frozen `J_*` targets meant the FK driver had no changing inputs.
- Result: garment looked “stuck” even though raw landmarks were moving.

Fix:

- `Assets/SartorialMirror/Scripts/GarmentOnlyPoseDirector.cs`

We made the classic mapper remain enabled so the `J_*` targets never freeze.

This was one of the most important “pipeline integrity” lessons:

> Even if you hide SMPL rendering, you cannot disable the mapping components that produce the `J_*` targets unless you replace them with a fully equivalent mapping stage.

---

## 7) The torso deformation problem (and the final stance)

Once the garment started moving, we encountered the next problem:

- The garment moved, but the torso could deform unexpectedly.

We traced this to “root follow” behavior:

- Some rigs treat `DEF-spine` differently than SMPL expects.
- Translating or rotating a non-root bone as if it were a root can collapse the torso.

We changed the garment autofill logic to make root follow **opt‑in** and safer by default:

- Default: no aggressive root follow.
- Optional: only enable follow if the garment rig provides a proper root/hips bone.

File:

- `Assets/SartorialMirror/Scripts/GarmentRigifyFkAutofill.cs`

---

## 8) Transitioning to the web integration (Unity WebGL as renderer)

After we stabilized the garment movement in Unity, we integrated it into the web repo:

- `Senior-Project` (Vite + React)

The web side provided:

- Live camera preview (local to the browser).
- Alignment guides and landmark dots (upper body only).
- A stage component that embeds Unity WebGL as a transparent overlay.

File highlights:

- `Senior-Project/src/features/shopper/tryOn/UnityTryOnStageWithCameraGuides.tsx`
- `Senior-Project/src/features/shopper/tryOn/useUpperBodyAlignment.ts`

The biggest integration problems were operational rather than conceptual:

- Port conflicts (multiple services trying to use `8000`).
- WebSocket endpoint mismatch (`/ws/runtime` vs Unity’s `/ws`).
- WebGL transparency and iframe permissions for camera.

---

## 9) What “worked” in the end (the stable model)

**Stable garment motion pipeline** (Unity):

1. Pose input arrives (camera → receiver).
2. Landmark spheres update (33 points).
3. Mapping produces `J_*` targets reliably.
4. FK driver rotates garment bones.

**Stable web integration**:

- Website owns the camera UX and upper‑body guidance.
- Unity WebGL renders garment with transparency on top.
- The experience feels integrated, not like separate demos.

---

## 9.1) Alignment with the Final Report (what to clarify / adjust)

Our Final Report describes a modular architecture using **MediaPipe**, a **local Python FastAPI + WebSocket backend**, **Unity visualization**, **Blender garment preparation**, and a **React smart mirror interface**. That description matches the project’s intent and the direction of the implementation.

During the final integration, we also introduced a practical website-facing configuration: **Unity WebGL embedded inside the React Try‑On stage**. To keep the report perfectly consistent with the final system as demonstrated, the key clarifications/adjustments are:

- **Backend endpoints**: explicitly state that the “local backend” can be implemented as a full FastAPI runtime (`/ws/runtime`, `/ws/camera`, `/catalog/snapshot`) or as a pose-only endpoint (`/ws`) used by Unity WebGL during embedded integration. If aligning strictly with the report diagram, standardize to a single FastAPI runtime and provide a Unity-compatible WS bridge.
- **Unity role**: clarify that Unity can run as a desktop runtime (early prototype) *or* as Unity WebGL embedded in the website (final UI integration). Both still satisfy “Unity renders avatar/garment.”
- **Garment rigging detail**: add the missing implementation detail that garments were made movable by exporting a Rigify-style armature (e.g., `DEF-*` naming) and auto-wiring FK drivers in Unity; SMPL served as a reference pipeline, not the final visible body mesh.
- **WebGL transparency**: include a short note that web embedding requires an alpha-enabled WebGL context + transparent canvas/background settings to allow the website camera to show behind Unity.
- **Camera ownership constraint (macOS)**: document that iframe camera access and parent-page camera preview can conflict; the robust pattern is “one camera owner” and passing pose data across modules.

For a full checklist and code pointers that map the report text to the repo, see:

- `FINAL_REPORT_ALIGNMENT_ADDENDUM.md`

---

## 10) Key lessons learned (engineering takeaways)

1. **Motion pipelines need stable intermediate representations**  
   The `J_*` targets were the “contract” between pose input and garment motion.

2. **Rig naming conventions are a real API**  
   Bone naming mismatches are equivalent to breaking an interface: the driver can’t “call” the bones it expects.

3. **Debugging needs visibility at each stage**  
   33 spheres moving ≠ garment moving. We needed instrumentation at landmarks, mapping, and FK driver wiring.

4. **WebGL introduces unique constraints**  
   Transparency, camera permission in iframes, and WebSocket behavior can differ from Editor Play Mode.

---

## Appendix: Key file list (high signal)

### Unity (SartorialMirror_new)

- `Assets/SMPL/Bashar Unity/PoseReceiverWS.cs`
- `Assets/SMPL/Bashar Unity/MediaPipe33_To_J17Mapper1.cs`
- `Assets/SMPL/Scripts/SpheresToBones_FKDriver.cs`
- `Assets/SartorialMirror/Scripts/GarmentOnlyPoseDirector.cs`
- `Assets/SartorialMirror/Scripts/GarmentRigifyFkAutofill.cs`
- `Assets/SartorialMirror/Scripts/WebcamBackgroundUGUI.cs`
- `Assets/SartorialMirror/Scripts/WebGLGarmentStageController.cs` (overlay helper)

### Web (Senior-Project)

- `src/features/shopper/tryOn/UnityTryOnStageWithCameraGuides.tsx`
- `src/features/shopper/tryOn/useUpperBodyAlignment.ts`
- `src/features/shopper/camera/CameraStageSurface.tsx`
- `src/styles/globals.css`
- `.env.development`

---

If you need this narrative to be converted into a formal “Project Report” format (abstract, methods, results, evaluation, limitations, future work), it can be extended without changing the technical runbook.

