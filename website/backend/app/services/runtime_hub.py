from __future__ import annotations

from collections import deque

from fastapi import WebSocket

from backend.app.models.runtime import RuntimeHealthUpdatedEvent, RuntimeOutboundEvent


class RuntimeHub:
    def __init__(self, *, recent_event_capacity: int) -> None:
        self._connections: set[WebSocket] = set()
        self._latest_health_event: RuntimeHealthUpdatedEvent | None = None
        self._recent_events: deque[dict[str, str | None]] = deque(maxlen=recent_event_capacity)

    @property
    def connection_count(self) -> int:
        return len(self._connections)

    @property
    def latest_health_event(self) -> RuntimeHealthUpdatedEvent | None:
        return self._latest_health_event

    def recent_events(self) -> list[dict[str, str | None]]:
        return list(self._recent_events)

    async def register(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.add(websocket)

        if self._latest_health_event is not None:
            await websocket.send_json(self._latest_health_event.model_dump(mode="json"))

    async def unregister(self, websocket: WebSocket) -> None:
        self._connections.discard(websocket)

    async def broadcast(self, event: RuntimeOutboundEvent) -> None:
        if isinstance(event, RuntimeHealthUpdatedEvent):
            self._latest_health_event = event

        self._recent_events.appendleft(
            {
                "type": event.type,
                "sessionId": event.sessionId,
                "timestamp": event.timestamp,
            }
        )

        stale_connections: list[WebSocket] = []
        payload = event.model_dump(mode="json")

        for websocket in self._connections:
            try:
                await websocket.send_json(payload)
            except Exception:
                stale_connections.append(websocket)

        for websocket in stale_connections:
            self._connections.discard(websocket)
