from __future__ import annotations

from fastapi import WebSocket


class CameraHub:
    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()
        self._session_by_connection: dict[int, str] = {}

    @property
    def connection_count(self) -> int:
        return len(self._connections)

    async def register(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.add(websocket)

    def remember_session(self, websocket: WebSocket, session_id: str | None) -> None:
        if session_id:
            self._session_by_connection[id(websocket)] = session_id

    def unregister(self, websocket: WebSocket) -> str | None:
        self._connections.discard(websocket)
        return self._session_by_connection.pop(id(websocket), None)
