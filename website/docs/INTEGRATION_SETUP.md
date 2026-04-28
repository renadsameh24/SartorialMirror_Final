# Sartorial Mirror Integration Setup

This front-end can run in demo mode without local services, or in integration mode against local FastAPI and Unity WebGL surfaces.

## Environment

Copy `.env.example` to `.env.local` for local integration work:

```env
VITE_CAMERA_UPLINK_ENABLED=true
VITE_CAMERA_UPLINK_WS_URL=ws://127.0.0.1:8000/ws/camera
VITE_RUNTIME_SOURCE_MODE=integration
VITE_RUNTIME_WS_URL=ws://127.0.0.1:8000/ws/runtime
VITE_CATALOG_SNAPSHOT_URL=http://127.0.0.1:8000/catalog/snapshot
VITE_UNITY_WEBGL_URL=http://127.0.0.1:8080/
VITE_UNITY_ALLOWED_ORIGIN=http://127.0.0.1:8080
VITE_CAMERA_PREVIEW_ENABLED=true
```

Leave `VITE_RUNTIME_SOURCE_MODE` unset or set it to `demo` when backend, Unity, or camera access is not available.

## Backend Contract

The local backend is expected to accept and emit the existing typed front-end envelopes.

- `GET /catalog/snapshot` returns a `catalog.snapshot.updated` envelope with local garment categories and garments.
- `WS /ws/runtime` receives runtime commands such as `shopper.session.start`, `shopper.session.end`, `shopper.catalog.selectGarment`, `shopper.catalog.selectSize`, and `shopper.catalog.selectColor`.
- `WS /ws/runtime` emits `runtime.*` envelopes for user detection, scan completion, measurements, fit recommendations, guidance, and health.

Runtime events that belong to a shopper session should include `sessionId`. App-scoped health events may omit it.

## Local Backend Service

This repo now includes the local FastAPI middleware backend under [`backend/`](/Users/shaa/Desktop/Senior%20Project/backend).

From the repo root:

```bash
npm run backend:setup
npm run backend:dev
```

Or run the service tests directly:

```bash
npm run backend:test
```

## Unity WebGL Contract

Host the Unity WebGL build locally at `VITE_UNITY_WEBGL_URL`.

The React iframe bridge sends existing Unity commands with `window.postMessage` to `VITE_UNITY_ALLOWED_ORIGIN`. Unity should post `unity.render.stateUpdated` or `unity.frame.updated` envelopes back to the parent window from the same origin.

The React UI owns session flow and controls. Unity owns rendering only.

## Camera Preview

The browser camera preview uses `navigator.mediaDevices.getUserMedia({ video: true, audio: false })` for local reflection in the shopper stage.

The front-end still does not run pose estimation in React. When camera uplink is enabled, React relays captured JPEG frames to the backend, while pose estimation remains owned by backend or Unity runtime services.

Camera tracks are stopped when the preview unmounts, when the session leaves camera-backed screens, or when access fails.

## Camera Feed Handoff

This repo now supports a browser-owned camera uplink for the local backend.

- When `VITE_CAMERA_UPLINK_ENABLED=true`, the same `getUserMedia` camera stream used for the local preview is also relayed to `VITE_CAMERA_UPLINK_WS_URL`.
- The relay sends JSON envelopes:
  - `camera.stream.started`
  - `camera.frame.captured`
  - `camera.stream.stopped`
- Each `camera.frame.captured` message contains a JPEG `dataUrl` plus width, height, and frame id.

If the backend team prefers to own the camera directly from Python/OpenCV instead of receiving browser frames, set `VITE_CAMERA_UPLINK_ENABLED=false` and let the backend open the camera device itself.

The browser-owned uplink is the cleanest option when the team wants the exact same camera feed to power both the local UI preview and backend processing.

## Local Startup Checklist

1. Start the FastAPI backend with `npm run backend:dev` and confirm `http://127.0.0.1:8000/catalog/snapshot` returns a catalog envelope.
2. Confirm `ws://127.0.0.1:8000/ws/runtime` accepts command envelopes and emits runtime envelopes.
3. If browser-owned camera uplink is enabled, confirm `ws://127.0.0.1:8000/ws/camera` accepts `camera.*` envelopes.
4. Serve the Unity WebGL build at `http://127.0.0.1:8080/`.
5. Start the front-end with `npm run dev`.
6. Open the app, allow camera access if enabled, start a shopper session, select a garment, and confirm camera preview, camera uplink, Unity, and fit events all update without stale data after session reset.
