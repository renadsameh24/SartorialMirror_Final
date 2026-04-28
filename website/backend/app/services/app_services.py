from __future__ import annotations

from backend.app.config import Settings
from backend.app.services.analyzer import HeuristicAnalyzer
from backend.app.services.camera_hub import CameraHub
from backend.app.services.catalog_service import CatalogService
from backend.app.services.health_service import HealthService
from backend.app.services.log_service import LogService
from backend.app.services.runtime_hub import RuntimeHub
from backend.app.services.session_manager import SessionManager


class AppServices:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.log_service = LogService(capacity=settings.log_capacity)
        self.catalog_service = CatalogService()
        self.health_service = HealthService()
        self.runtime_hub = RuntimeHub(recent_event_capacity=settings.recent_event_capacity)
        self.camera_hub = CameraHub()
        self.analyzer = HeuristicAnalyzer(settings)
        self.session_manager = SessionManager(
            analyzer=self.analyzer,
            camera_hub=self.camera_hub,
            catalog_service=self.catalog_service,
            health_service=self.health_service,
            log_service=self.log_service,
            runtime_hub=self.runtime_hub,
            frame_timeout_seconds=settings.frame_timeout_seconds,
        )

    async def start(self) -> None:
        self.health_service.mark_ready()
        self.log_service.info("runtime", "Backend services started.")
        await self.session_manager._broadcast_health()

    async def shutdown(self) -> None:
        await self.session_manager.shutdown()
        self.health_service.mark_stopped()
        self.log_service.info("runtime", "Backend services stopped.")

    def healthz_payload(self) -> dict[str, object]:
        return {
            "ok": True,
            "ready": self.health_service.ready,
            "runtimeClients": self.runtime_hub.connection_count,
            "cameraClients": self.camera_hub.connection_count,
            "activeSessionCount": self.session_manager.active_session_count,
            "calibrationStatus": self.health_service.calibration_status,
            "recentLogCount": self.log_service.count,
        }

    def readyz_payload(self) -> dict[str, object]:
        return {
            "ready": self.health_service.ready and self.catalog_service.is_ready,
            "catalogLoaded": self.catalog_service.is_ready,
            "websocketServicesReady": True,
        }
