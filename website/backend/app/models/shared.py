from __future__ import annotations

from datetime import UTC, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


SourceType = Literal["app", "runtime", "catalog"]


def iso_now() -> str:
    return datetime.now(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class EventEnvelope(StrictModel):
    type: str
    source: SourceType
    timestamp: str
    sessionId: str | None = None


class CommandEnvelope(StrictModel):
    type: str
    sessionId: str | None = None

