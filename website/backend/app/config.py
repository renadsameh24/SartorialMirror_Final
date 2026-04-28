from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True, slots=True)
class Settings:
    app_name: str = "Sartorial Mirror Middleware Backend"
    allow_origin_regex: str = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
    stable_frame_dwell_seconds: float = 0.75
    frame_timeout_seconds: float = 1.5
    log_capacity: int = 200
    recent_event_capacity: int = 100
    camera_signal_summary: str = "Waiting for a stable camera frame."
    default_measurements_cm: dict[str, float] = field(
        default_factory=lambda: {
            "chest": 98.0,
            "waist": 84.0,
            "shoulderWidth": 46.0,
            "sleeveLength": 64.0,
            "torsoLength": 71.0,
        }
    )

