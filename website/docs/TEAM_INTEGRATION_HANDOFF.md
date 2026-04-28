# Team Integration Handoff

This document is the exact handoff for the backend and Unity teammates to plug into the current front-end.

## What The Front-End Already Provides

The React app already owns:

- shopper state machine
- local session reset
- garment selection UI
- fit and measurement presentation
- runtime degraded-state handling
- Unity iframe bridge
- browser camera preview
- optional browser camera uplink to backend

The front-end does **not** own:

- pose estimation
- measurement extraction
- fit computation
- Unity garment rendering logic
- Blender export or runtime rebinding

## What The Backend Team Must Expose

### 1. Catalog Snapshot

`GET http://127.0.0.1:8000/catalog/snapshot`

Response must be a JSON `catalog.snapshot.updated` envelope:

```json
{
  "type": "catalog.snapshot.updated",
  "source": "catalog",
  "timestamp": "2026-04-21T12:00:00.000Z",
  "payload": {
    "status": "ready",
    "categories": [
      { "id": "blazers", "label": "Blazers", "sortOrder": 1 }
    ],
    "garments": [
      {
        "id": "tailored-blazer",
        "sku": "TB-001",
        "name": "Tailored Blazer",
        "categoryId": "blazers",
        "silhouette": "upper-body",
        "status": "active",
        "description": "Clean structure with a refined shoulder line.",
        "availableSizes": [
          { "code": "S", "label": "Small", "availability": "available" },
          { "code": "M", "label": "Medium", "availability": "available" }
        ],
        "availableColors": [
          {
            "id": "tailored-blazer-navy",
            "label": "Navy",
            "variantId": "tailored-blazer-variant-navy",
            "availability": "available",
            "swatchHex": "#2B3954"
          }
        ],
        "defaultVariantId": "tailored-blazer-variant-navy"
      }
    ]
  }
}
```

### 2. Runtime WebSocket

`WS ws://127.0.0.1:8000/ws/runtime`

The front-end sends:

- `shopper.session.start`
- `shopper.session.end`
- `shopper.catalog.selectGarment`
- `shopper.catalog.selectSize`
- `shopper.catalog.selectColor`
- `admin.health.refresh`
- `admin.logs.refresh`
- `admin.calibration.start`
- `admin.calibration.cancel`

The backend must emit:

- `runtime.user.detected`
- `runtime.user.lost`
- `runtime.scan.completed`
- `runtime.measurements.updated`
- `runtime.fit.updated`
- `runtime.guidance.updated`
- `runtime.health.updated`

### 3. Camera Feed WebSocket

`WS ws://127.0.0.1:8000/ws/camera`

This is the answer to the camera ownership question.

If you want the **same browser camera feed** to be used for:

- the shopper preview in React
- backend pose / measurement processing

then the backend must accept `camera.*` envelopes from this endpoint.

The front-end emits:

#### `camera.stream.started`

```json
{
  "type": "camera.stream.started",
  "source": "app",
  "timestamp": "2026-04-21T12:00:00.000Z",
  "sessionId": "session-123",
  "payload": {
    "frameIntervalMs": 300,
    "mimeType": "image/jpeg",
    "transport": "dataUrl"
  }
}
```

#### `camera.frame.captured`

```json
{
  "type": "camera.frame.captured",
  "source": "app",
  "timestamp": "2026-04-21T12:00:00.300Z",
  "sessionId": "session-123",
  "payload": {
    "frameId": "frame-1",
    "mimeType": "image/jpeg",
    "width": 960,
    "height": 540,
    "dataUrl": "data:image/jpeg;base64,..."
  }
}
```

#### `camera.stream.stopped`

```json
{
  "type": "camera.stream.stopped",
  "source": "app",
  "timestamp": "2026-04-21T12:00:30.000Z",
  "sessionId": "session-123",
  "payload": {
    "reason": "componentUnmounted"
  }
}
```

### How The Backend Team Retrieves Frames

In FastAPI, they can receive and decode frames like this:

```python
from fastapi import FastAPI, WebSocket
import base64
import cv2
import numpy as np

app = FastAPI()

@app.websocket("/ws/camera")
async def camera_ws(websocket: WebSocket):
    await websocket.accept()

    while True:
        message = await websocket.receive_json()

        if message["type"] != "camera.frame.captured":
            continue

        data_url = message["payload"]["dataUrl"]
        _, encoded = data_url.split(",", 1)
        frame_bytes = base64.b64decode(encoded)
        frame_array = np.frombuffer(frame_bytes, dtype=np.uint8)
        frame = cv2.imdecode(frame_array, cv2.IMREAD_COLOR)

        # Run pose estimation / measurement logic here.
```

If the backend team does **not** want browser-owned frames, they can skip `/ws/camera`, open the device camera directly in Python, and you can set `VITE_CAMERA_UPLINK_ENABLED=false`.

## What The Unity Team Must Expose

### 1. Host The Local WebGL Build

Serve Unity at:

`http://127.0.0.1:8080/`

### 2. Accept `postMessage` Commands From React

The iframe receives JSON strings for:

- `shopper.catalog.selectGarment`
- `shopper.catalog.selectSize`
- `shopper.catalog.selectColor`
- `shopper.session.end`

### 3. Post Status Back To The Parent Window

Unity should emit:

#### `unity.render.stateUpdated`

```json
{
  "type": "unity.render.stateUpdated",
  "source": "unity",
  "timestamp": "2026-04-21T12:00:05.000Z",
  "payload": {
    "renderState": "ready",
    "activeGarmentId": "tailored-blazer",
    "activeSizeCode": "M"
  }
}
```

or:

#### `unity.frame.updated`

```json
{
  "type": "unity.frame.updated",
  "source": "unity",
  "timestamp": "2026-04-21T12:00:05.000Z",
  "payload": {
    "renderState": "rendering"
  }
}
```

## Recommended Team Setup

For the cleanest plug-and-play demo:

1. Front-end owns browser camera access.
2. Front-end previews the camera locally.
3. Front-end relays camera frames to backend through `ws://127.0.0.1:8000/ws/camera`.
4. Backend processes the frames and sends typed `runtime.*` updates through `ws://127.0.0.1:8000/ws/runtime`.
5. Unity renders the selected garment through iframe `postMessage`.

That way the same physical device camera powers both the shopper-facing preview and the backend processing path.
