from __future__ import annotations

import asyncio
from dataclasses import dataclass, field

from backend.app.models.runtime import MeasurementSnapshot


@dataclass(slots=True)
class LatestFramePacket:
    frame_id: str
    data_url: str
    width: int
    height: int
    captured_at: str
    received_monotonic: float


@dataclass(slots=True)
class DecodedFrame:
    width: int
    height: int
    format: str


@dataclass(slots=True)
class SessionRuntimeState:
    session_id: str
    input_method: str
    created_at: str
    active: bool = True
    stream_started: bool = False
    camera_connected: bool = False
    frame_interval_ms: int | None = None
    latest_frame: LatestFramePacket | None = None
    new_frame_event: asyncio.Event = field(default_factory=asyncio.Event)
    worker_task: asyncio.Task[None] | None = None
    selected_garment_id: str | None = None
    selected_size_code: str | None = None
    selected_color_id: str | None = None
    selected_variant_id: str | None = None
    detected: bool = False
    lost: bool = False
    ready_emitted: bool = False
    first_valid_frame_monotonic: float | None = None
    last_frame_received_monotonic: float | None = None
    measurements_snapshot: MeasurementSnapshot | None = None
