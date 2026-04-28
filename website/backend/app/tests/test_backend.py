from __future__ import annotations

import base64
import io
import time

from fastapi.testclient import TestClient
from PIL import Image

from backend.app.config import Settings
from backend.app.main import create_app


def build_test_client(
    *,
    stable_frame_dwell_seconds: float = 0.0,
    frame_timeout_seconds: float = 0.05,
) -> TestClient:
    app = create_app(
        Settings(
            stable_frame_dwell_seconds=stable_frame_dwell_seconds,
            frame_timeout_seconds=frame_timeout_seconds,
        )
    )
    return TestClient(app)


def make_frame_data_url() -> str:
    buffer = io.BytesIO()
    image = Image.new("RGB", (32, 24), color=(32, 48, 72))
    image.save(buffer, format="JPEG")
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"


def receive_until_types(websocket, expected_types: set[str], *, limit: int = 12):
    received: dict[str, dict] = {}

    for _ in range(limit):
        event = websocket.receive_json()
        received[event["type"]] = event
        if expected_types.issubset(received.keys()):
            return received

    raise AssertionError(f"Did not receive all expected event types: {expected_types}")


def test_catalog_snapshot_and_health_endpoints() -> None:
    with build_test_client() as client:
        snapshot_response = client.get("/catalog/snapshot")
        assert snapshot_response.status_code == 200

        snapshot = snapshot_response.json()
        assert snapshot["type"] == "catalog.snapshot.updated"
        assert snapshot["source"] == "catalog"
        assert snapshot["payload"]["status"] == "ready"
        assert [category["id"] for category in snapshot["payload"]["categories"]] == [
            "tops",
            "outerwear",
        ]
        assert "tailored-blazer" in {
            garment["id"] for garment in snapshot["payload"]["garments"]
        }

        health_response = client.get("/healthz")
        assert health_response.status_code == 200
        assert health_response.json()["ok"] is True

        readiness_response = client.get("/readyz")
        assert readiness_response.status_code == 200
        assert readiness_response.json() == {
            "ready": True,
            "catalogLoaded": True,
            "websocketServicesReady": True,
        }


def test_runtime_session_flow_emits_detected_ready_measurements_and_fit() -> None:
    with build_test_client(stable_frame_dwell_seconds=0.0) as client:
        with client.websocket_connect("/ws/runtime") as runtime_ws:
            initial_health = runtime_ws.receive_json()
            assert initial_health["type"] == "runtime.health.updated"

            with client.websocket_connect("/ws/camera") as camera_ws:
                session_id = "session-test-1"

                runtime_ws.send_json(
                    {
                        "type": "shopper.session.start",
                        "sessionId": session_id,
                        "payload": {"input": "keyboard"},
                    }
                )
                runtime_ws.receive_json()

                camera_ws.send_json(
                    {
                        "type": "camera.stream.started",
                        "source": "app",
                        "timestamp": "2026-04-21T12:00:00.000Z",
                        "sessionId": session_id,
                        "payload": {
                            "frameIntervalMs": 300,
                            "mimeType": "image/jpeg",
                            "transport": "dataUrl",
                        },
                    }
                )
                runtime_ws.receive_json()

                camera_ws.send_json(
                    {
                        "type": "camera.frame.captured",
                        "source": "app",
                        "timestamp": "2026-04-21T12:00:00.300Z",
                        "sessionId": session_id,
                        "payload": {
                            "dataUrl": make_frame_data_url(),
                            "frameId": "frame-1",
                            "height": 24,
                            "mimeType": "image/jpeg",
                            "width": 32,
                        },
                    }
                )

                runtime_events = receive_until_types(
                    runtime_ws,
                    {
                        "runtime.user.detected",
                        "runtime.scan.completed",
                        "runtime.measurements.updated",
                    },
                )
                assert runtime_events["runtime.user.detected"]["sessionId"] == session_id
                assert (
                    runtime_events["runtime.scan.completed"]["payload"]["readyForCatalog"]
                    is True
                )
                assert (
                    runtime_events["runtime.measurements.updated"]["payload"]["snapshot"]["status"]
                    == "ready"
                )

                runtime_ws.send_json(
                    {
                        "type": "shopper.catalog.selectGarment",
                        "sessionId": session_id,
                        "payload": {"garmentId": "tailored-blazer"},
                    }
                )
                runtime_ws.send_json(
                    {
                        "type": "shopper.catalog.selectSize",
                        "sessionId": session_id,
                        "payload": {"sizeCode": "M"},
                    }
                )
                runtime_ws.send_json(
                    {
                        "type": "shopper.catalog.selectColor",
                        "sessionId": session_id,
                        "payload": {
                            "colorId": "tailored-blazer-navy",
                            "variantId": "tailored-blazer-variant-navy",
                        },
                    }
                )

                fit_events = receive_until_types(runtime_ws, {"runtime.fit.updated"})
                fit_event = fit_events["runtime.fit.updated"]
                assert fit_event["sessionId"] == session_id
                assert fit_event["payload"]["recommendation"]["garmentId"] == "tailored-blazer"
                assert fit_event["payload"]["recommendation"]["confidenceBand"] in {
                    "low",
                    "medium",
                    "high",
                }


def test_late_frames_are_ignored_after_session_end() -> None:
    with build_test_client(stable_frame_dwell_seconds=0.0) as client:
        with client.websocket_connect("/ws/runtime") as runtime_ws:
            runtime_ws.receive_json()

            with client.websocket_connect("/ws/camera") as camera_ws:
                session_id = "session-test-2"

                runtime_ws.send_json(
                    {
                        "type": "shopper.session.start",
                        "sessionId": session_id,
                        "payload": {"input": "keyboard"},
                    }
                )
                runtime_ws.receive_json()

                camera_ws.send_json(
                    {
                        "type": "camera.stream.started",
                        "source": "app",
                        "timestamp": "2026-04-21T12:00:00.000Z",
                        "sessionId": session_id,
                        "payload": {
                            "frameIntervalMs": 300,
                            "mimeType": "image/jpeg",
                            "transport": "dataUrl",
                        },
                    }
                )
                runtime_ws.receive_json()

                camera_ws.send_json(
                    {
                        "type": "camera.frame.captured",
                        "source": "app",
                        "timestamp": "2026-04-21T12:00:00.300Z",
                        "sessionId": session_id,
                        "payload": {
                            "dataUrl": make_frame_data_url(),
                            "frameId": "frame-1",
                            "height": 24,
                            "mimeType": "image/jpeg",
                            "width": 32,
                        },
                    }
                )
                receive_until_types(
                    runtime_ws,
                    {"runtime.user.detected", "runtime.scan.completed"},
                )

                runtime_ws.send_json(
                    {
                        "type": "shopper.session.end",
                        "sessionId": session_id,
                        "payload": {"reason": "userRequested"},
                    }
                )
                runtime_ws.receive_json()
                time.sleep(0.05)

                service_count = len(client.app.state.services.runtime_hub.recent_events())

                camera_ws.send_json(
                    {
                        "type": "camera.frame.captured",
                        "source": "app",
                        "timestamp": "2026-04-21T12:00:00.600Z",
                        "sessionId": session_id,
                        "payload": {
                            "dataUrl": make_frame_data_url(),
                            "frameId": "frame-late",
                            "height": 24,
                            "mimeType": "image/jpeg",
                            "width": 32,
                        },
                    }
                )

                time.sleep(0.05)

                assert client.app.state.services.session_manager.active_session_count == 0
                assert len(client.app.state.services.runtime_hub.recent_events()) == service_count


def test_malformed_camera_frame_is_ignored_without_killing_runtime() -> None:
    with build_test_client(stable_frame_dwell_seconds=0.0) as client:
        with client.websocket_connect("/ws/runtime") as runtime_ws:
            runtime_ws.receive_json()

            with client.websocket_connect("/ws/camera") as camera_ws:
                session_id = "session-test-3"

                runtime_ws.send_json(
                    {
                        "type": "shopper.session.start",
                        "sessionId": session_id,
                        "payload": {"input": "keyboard"},
                    }
                )
                runtime_ws.receive_json()

                camera_ws.send_json(
                    {
                        "type": "camera.stream.started",
                        "source": "app",
                        "timestamp": "2026-04-21T12:00:00.000Z",
                        "sessionId": session_id,
                        "payload": {
                            "frameIntervalMs": 300,
                            "mimeType": "image/jpeg",
                            "transport": "dataUrl",
                        },
                    }
                )
                runtime_ws.receive_json()

                camera_ws.send_json(
                    {
                        "type": "camera.frame.captured",
                        "source": "app",
                        "timestamp": "2026-04-21T12:00:00.150Z",
                        "sessionId": session_id,
                        "payload": {
                            "dataUrl": "data:image/jpeg;base64,not-valid",
                            "frameId": "frame-bad",
                            "height": 24,
                            "mimeType": "image/jpeg",
                            "width": 32,
                        },
                    }
                )

                time.sleep(0.05)

                camera_ws.send_json(
                    {
                        "type": "camera.frame.captured",
                        "source": "app",
                        "timestamp": "2026-04-21T12:00:00.300Z",
                        "sessionId": session_id,
                        "payload": {
                            "dataUrl": make_frame_data_url(),
                            "frameId": "frame-good",
                            "height": 24,
                            "mimeType": "image/jpeg",
                            "width": 32,
                        },
                    }
                )

                runtime_events = receive_until_types(
                    runtime_ws,
                    {"runtime.user.detected", "runtime.measurements.updated"},
                )
                assert runtime_events["runtime.user.detected"]["sessionId"] == session_id
                assert client.app.state.services.log_service.count >= 1


def test_stalled_detection_emits_runtime_user_lost_before_ready() -> None:
    with build_test_client(stable_frame_dwell_seconds=10.0, frame_timeout_seconds=0.05) as client:
        with client.websocket_connect("/ws/runtime") as runtime_ws:
            runtime_ws.receive_json()

            with client.websocket_connect("/ws/camera") as camera_ws:
                session_id = "session-test-4"

                runtime_ws.send_json(
                    {
                        "type": "shopper.session.start",
                        "sessionId": session_id,
                        "payload": {"input": "keyboard"},
                    }
                )
                runtime_ws.receive_json()

                camera_ws.send_json(
                    {
                        "type": "camera.stream.started",
                        "source": "app",
                        "timestamp": "2026-04-21T12:00:00.000Z",
                        "sessionId": session_id,
                        "payload": {
                            "frameIntervalMs": 300,
                            "mimeType": "image/jpeg",
                            "transport": "dataUrl",
                        },
                    }
                )
                runtime_ws.receive_json()

                camera_ws.send_json(
                    {
                        "type": "camera.frame.captured",
                        "source": "app",
                        "timestamp": "2026-04-21T12:00:00.010Z",
                        "sessionId": session_id,
                        "payload": {
                            "dataUrl": make_frame_data_url(),
                            "frameId": "frame-1",
                            "height": 24,
                            "mimeType": "image/jpeg",
                            "width": 32,
                        },
                    }
                )

                initial_events = receive_until_types(runtime_ws, {"runtime.user.detected"})
                assert initial_events["runtime.user.detected"]["sessionId"] == session_id

                stalled_events = receive_until_types(runtime_ws, {"runtime.user.lost"})
                assert stalled_events["runtime.user.lost"]["sessionId"] == session_id
