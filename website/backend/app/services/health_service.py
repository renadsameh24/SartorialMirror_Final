from __future__ import annotations

from backend.app.models.runtime import HealthSignal, RuntimeHealthPayload, RuntimeHealthUpdatedEvent
from backend.app.models.shared import iso_now


class HealthService:
    def __init__(self) -> None:
        self._ready = False
        self._calibration_status = "idle"

    @property
    def ready(self) -> bool:
        return self._ready

    @property
    def calibration_status(self) -> str:
        return self._calibration_status

    def mark_ready(self) -> None:
        self._ready = True

    def mark_stopped(self) -> None:
        self._ready = False

    def set_calibration_status(self, status: str) -> None:
        self._calibration_status = status

    def build_health_event(
        self,
        *,
        active_session: bool,
        camera_connected: bool,
        session_ready: bool,
    ) -> RuntimeHealthUpdatedEvent:
        timestamp = iso_now()

        if active_session and camera_connected:
            camera_signal = HealthSignal(
                surface="camera",
                status="healthy",
                summary="Camera feed is streaming to the runtime.",
                updatedAt=timestamp,
            )
        elif active_session and session_ready:
            camera_signal = HealthSignal(
                surface="camera",
                status="healthy",
                summary="Measurements are captured and the camera uplink is idle.",
                updatedAt=timestamp,
            )
        elif active_session:
            camera_signal = HealthSignal(
                surface="camera",
                status="warning",
                summary="Waiting for a stable camera frame.",
                updatedAt=timestamp,
            )
        else:
            camera_signal = HealthSignal(
                surface="camera",
                status="healthy",
                summary="Camera is idle until a shopper session starts.",
                updatedAt=timestamp,
            )

        signals = [
            HealthSignal(
                surface="runtime",
                status="healthy",
                summary="Local runtime is available.",
                updatedAt=timestamp,
            ),
            HealthSignal(
                surface="catalog",
                status="healthy",
                summary="Local catalog snapshot is ready.",
                updatedAt=timestamp,
            ),
            camera_signal,
        ]

        return RuntimeHealthUpdatedEvent(
            type="runtime.health.updated",
            source="runtime",
            timestamp=timestamp,
            payload=RuntimeHealthPayload(signals=signals),
        )
