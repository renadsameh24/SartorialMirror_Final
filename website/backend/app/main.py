from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from backend.app.config import Settings
from backend.app.models.camera import (
    CAMERA_EVENT_ADAPTER,
    CameraFrameCapturedEvent,
    CameraStreamStartedEvent,
    CameraStreamStoppedEvent,
)
from backend.app.models.runtime import RUNTIME_COMMAND_ADAPTER
from backend.app.services.app_services import AppServices


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved_settings = settings or Settings()
    services = AppServices(resolved_settings)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.services = services
        await services.start()
        try:
            yield
        finally:
            await services.shutdown()

    app = FastAPI(title=resolved_settings.app_name, lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=resolved_settings.allow_origin_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/catalog/snapshot")
    async def catalog_snapshot():
        return services.catalog_service.snapshot_event().model_dump(mode="json")

    @app.get("/healthz")
    async def healthz():
        return services.healthz_payload()

    @app.get("/readyz")
    async def readyz():
        return services.readyz_payload()

    @app.websocket("/ws/runtime")
    async def runtime_socket(websocket: WebSocket):
        await services.runtime_hub.register(websocket)

        try:
            while True:
                payload = await websocket.receive_json()

                try:
                    command = RUNTIME_COMMAND_ADAPTER.validate_python(payload)
                except ValidationError:
                    services.log_service.warning("runtime", "Rejected malformed runtime command.")
                    continue

                await services.session_manager.handle_runtime_command(command)
        except WebSocketDisconnect:
            pass
        finally:
            await services.runtime_hub.unregister(websocket)

    @app.websocket("/ws/camera")
    async def camera_socket(websocket: WebSocket):
        await services.camera_hub.register(websocket)

        try:
            while True:
                payload = await websocket.receive_json()

                try:
                    event = CAMERA_EVENT_ADAPTER.validate_python(payload)
                except ValidationError:
                    services.log_service.warning("camera", "Rejected malformed camera event.")
                    continue

                services.camera_hub.remember_session(websocket, event.sessionId)

                if isinstance(event, CameraStreamStartedEvent):
                    await services.session_manager.handle_camera_started(event)
                elif isinstance(event, CameraFrameCapturedEvent):
                    await services.session_manager.handle_camera_frame(event)
                elif isinstance(event, CameraStreamStoppedEvent):
                    await services.session_manager.handle_camera_stopped(event)
        except WebSocketDisconnect:
            pass
        finally:
            session_id = services.camera_hub.unregister(websocket)
            await services.session_manager.handle_camera_disconnect(session_id)

    return app


app = create_app()
