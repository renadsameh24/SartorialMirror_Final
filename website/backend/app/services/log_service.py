from __future__ import annotations

import logging
from collections import deque
from typing import Literal
from uuid import uuid4

from backend.app.models.shared import iso_now

logger = logging.getLogger("sartorial_mirror.backend")

LogLevel = Literal["info", "warning", "error"]
LogSource = Literal["camera", "runtime", "catalog", "admin"]


class LogService:
    def __init__(self, *, capacity: int) -> None:
        self._entries: deque[dict[str, str]] = deque(maxlen=capacity)

    def record(self, *, level: LogLevel, source: LogSource, message: str) -> dict[str, str]:
        entry = {
            "id": f"log-{uuid4()}",
            "level": level,
            "source": source,
            "message": message,
            "timestamp": iso_now(),
        }
        self._entries.appendleft(entry)

        if level == "error":
            logger.error("%s: %s", source, message)
        elif level == "warning":
            logger.warning("%s: %s", source, message)
        else:
            logger.info("%s: %s", source, message)

        return entry

    def info(self, source: LogSource, message: str) -> dict[str, str]:
        return self.record(level="info", source=source, message=message)

    def warning(self, source: LogSource, message: str) -> dict[str, str]:
        return self.record(level="warning", source=source, message=message)

    def error(self, source: LogSource, message: str) -> dict[str, str]:
        return self.record(level="error", source=source, message=message)

    def recent(self) -> list[dict[str, str]]:
        return list(self._entries)

    @property
    def count(self) -> int:
        return len(self._entries)
