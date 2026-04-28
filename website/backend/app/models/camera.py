from __future__ import annotations

from typing import Annotated, Literal

from pydantic import Field, TypeAdapter

from backend.app.models.shared import EventEnvelope, StrictModel


class CameraStreamStartedPayload(StrictModel):
    frameIntervalMs: int
    mimeType: Literal["image/jpeg"]
    transport: Literal["dataUrl"]


class CameraFrameCapturedPayload(StrictModel):
    dataUrl: str
    frameId: str
    height: int
    mimeType: Literal["image/jpeg"]
    width: int


class CameraStreamStoppedPayload(StrictModel):
    reason: Literal["componentUnmounted", "streamEnded", "uplinkUnavailable"]


class CameraStreamStartedEvent(EventEnvelope):
    type: Literal["camera.stream.started"]
    source: Literal["app"] = "app"
    payload: CameraStreamStartedPayload


class CameraFrameCapturedEvent(EventEnvelope):
    type: Literal["camera.frame.captured"]
    source: Literal["app"] = "app"
    payload: CameraFrameCapturedPayload


class CameraStreamStoppedEvent(EventEnvelope):
    type: Literal["camera.stream.stopped"]
    source: Literal["app"] = "app"
    payload: CameraStreamStoppedPayload


CameraEvent = Annotated[
    CameraStreamStartedEvent | CameraFrameCapturedEvent | CameraStreamStoppedEvent,
    Field(discriminator="type"),
]


CAMERA_EVENT_ADAPTER = TypeAdapter(CameraEvent)
