from __future__ import annotations

import asyncio
import time
from typing import cast

from backend.app.models.camera import (
    CameraFrameCapturedEvent,
    CameraStreamStartedEvent,
    CameraStreamStoppedEvent,
)
from backend.app.models.runtime import (
    AdminCalibrationCancelCommand,
    AdminCalibrationStartCommand,
    AdminHealthRefreshCommand,
    AdminLogsRefreshCommand,
    RuntimeFitPayload,
    RuntimeFitUpdatedEvent,
    RuntimeOutboundEvent,
    RuntimeCommand,
    ShopperSelectColorCommand,
    ShopperSelectGarmentCommand,
    ShopperSelectSizeCommand,
    ShopperSessionEndCommand,
    ShopperSessionStartCommand,
)
from backend.app.models.shared import iso_now
from backend.app.services.analyzer import HeuristicAnalyzer
from backend.app.services.camera_hub import CameraHub
from backend.app.services.catalog_service import CatalogService
from backend.app.services.health_service import HealthService
from backend.app.services.log_service import LogService
from backend.app.services.runtime_hub import RuntimeHub
from backend.app.services.runtime_state import LatestFramePacket, SessionRuntimeState


class SessionManager:
    def __init__(
        self,
        *,
        analyzer: HeuristicAnalyzer,
        camera_hub: CameraHub,
        catalog_service: CatalogService,
        health_service: HealthService,
        log_service: LogService,
        runtime_hub: RuntimeHub,
        frame_timeout_seconds: float,
    ) -> None:
        self._analyzer = analyzer
        self._camera_hub = camera_hub
        self._catalog_service = catalog_service
        self._health_service = health_service
        self._log_service = log_service
        self._runtime_hub = runtime_hub
        self._frame_timeout_seconds = frame_timeout_seconds
        self._active_session: SessionRuntimeState | None = None
        self._lock = asyncio.Lock()

    @property
    def active_session_count(self) -> int:
        return 1 if self._active_session is not None and self._active_session.active else 0

    @property
    def active_session(self) -> SessionRuntimeState | None:
        return self._active_session

    async def shutdown(self) -> None:
        session = await self._replace_active_session(None)
        if session is not None:
            await self._dispose_session(session)

    async def handle_runtime_command(self, command: RuntimeCommand) -> None:
        if isinstance(command, ShopperSessionStartCommand):
            await self._start_session(command)
            return

        if isinstance(command, ShopperSessionEndCommand):
            await self._end_session(command)
            return

        if isinstance(command, ShopperSelectGarmentCommand):
            await self._update_selection(
                session_id=command.sessionId,
                garment_id=command.payload.garmentId,
            )
            return

        if isinstance(command, ShopperSelectSizeCommand):
            await self._update_selection(
                session_id=command.sessionId,
                size_code=command.payload.sizeCode,
            )
            return

        if isinstance(command, ShopperSelectColorCommand):
            await self._update_selection(
                session_id=command.sessionId,
                color_id=command.payload.colorId,
                variant_id=command.payload.variantId,
            )
            return

        if isinstance(command, AdminHealthRefreshCommand):
            await self._broadcast_health()
            self._log_service.info("admin", "Health refresh requested.")
            return

        if isinstance(command, AdminLogsRefreshCommand):
            self._log_service.info("admin", "Logs refresh requested.")
            return

        if isinstance(command, AdminCalibrationStartCommand):
            self._health_service.set_calibration_status("inProgress")
            self._log_service.info(
                "admin",
                f"Calibration started for profile {command.payload.profileId or 'local-default-profile'}.",
            )
            return

        if isinstance(command, AdminCalibrationCancelCommand):
            self._health_service.set_calibration_status("idle")
            self._log_service.info("admin", "Calibration cancelled.")

    async def handle_camera_started(self, event: CameraStreamStartedEvent) -> None:
        if not event.sessionId:
            self._log_service.info("camera", "Camera stream started before a shopper session was active.")
            return

        should_broadcast = False

        async with self._lock:
            session = self._active_session

            if not session or session.session_id != event.sessionId or not session.active:
                self._log_service.warning(
                    "camera",
                    f"Ignored camera stream start for inactive session {event.sessionId}.",
                )
                return

            session.camera_connected = True
            session.stream_started = True
            session.frame_interval_ms = event.payload.frameIntervalMs
            should_broadcast = True

        self._log_service.info("camera", f"Camera stream started for session {event.sessionId}.")

        if should_broadcast:
            await self._broadcast_health()

    async def handle_camera_frame(self, event: CameraFrameCapturedEvent) -> None:
        if not event.sessionId:
            return

        async with self._lock:
            session = self._active_session

            if not session or session.session_id != event.sessionId or not session.active:
                return

            session.latest_frame = LatestFramePacket(
                frame_id=event.payload.frameId,
                data_url=event.payload.dataUrl,
                width=event.payload.width,
                height=event.payload.height,
                captured_at=event.timestamp,
                received_monotonic=time.monotonic(),
            )
            session.last_frame_received_monotonic = session.latest_frame.received_monotonic
            session.camera_connected = True
            session.stream_started = True
            session.new_frame_event.set()

    async def handle_camera_stopped(self, event: CameraStreamStoppedEvent) -> None:
        if not event.sessionId:
            self._log_service.info("camera", "Camera stream stopped before a shopper session was active.")
            return

        await self._mark_camera_disconnected(
            session_id=event.sessionId,
            message=f"Camera stream stopped for session {event.sessionId}.",
        )

    async def handle_camera_disconnect(self, session_id: str | None) -> None:
        if not session_id:
            return

        await self._mark_camera_disconnected(
            session_id=session_id,
            message=f"Camera socket disconnected for session {session_id}.",
        )

    async def _start_session(self, command: ShopperSessionStartCommand) -> None:
        if not command.sessionId:
            self._log_service.warning("runtime", "Session start ignored because sessionId is missing.")
            return

        new_session = SessionRuntimeState(
            session_id=command.sessionId,
            input_method=command.payload.input,
            created_at=iso_now(),
        )
        new_session.worker_task = asyncio.create_task(
            self._run_session_worker(new_session),
            name=f"session-worker:{command.sessionId}",
        )

        previous_session = await self._replace_active_session(new_session)

        if previous_session is not None:
            await self._dispose_session(previous_session)

        self._log_service.info("runtime", f"Session {command.sessionId} started.")
        await self._broadcast_health()

    async def _end_session(self, command: ShopperSessionEndCommand) -> None:
        session = await self._replace_active_session(None, expected_session_id=command.sessionId)

        if session is None:
            return

        await self._dispose_session(session)
        self._log_service.info(
            "runtime",
            f"Session {session.session_id} ended with reason {command.payload.reason}.",
        )
        await self._broadcast_health()

    async def _update_selection(
        self,
        *,
        session_id: str | None,
        garment_id: str | None = None,
        size_code: str | None = None,
        color_id: str | None = None,
        variant_id: str | None = None,
    ) -> None:
        fit_event: RuntimeFitUpdatedEvent | None = None

        async with self._lock:
            session = self._active_session

            if not session or not session.active or not session_id or session.session_id != session_id:
                return

            if garment_id is not None:
                session.selected_garment_id = garment_id
            if size_code is not None:
                session.selected_size_code = size_code
            if color_id is not None:
                session.selected_color_id = color_id
                session.selected_variant_id = variant_id

            if session.selected_garment_id:
                garment_record = self._catalog_service.get_record(session.selected_garment_id)
                if garment_record is None:
                    self._log_service.warning(
                        "catalog",
                        f"Selection ignored because garment {session.selected_garment_id} is unknown.",
                    )
                    return

                snapshot = session.measurements_snapshot or self._analyzer.build_measurements_snapshot(
                    timestamp=iso_now()
                )
                recommendation = self._analyzer.build_fit_recommendation(
                    garment_record=garment_record,
                    snapshot=snapshot,
                    selected_size_code=session.selected_size_code,
                    timestamp=iso_now(),
                )
                fit_event = RuntimeFitUpdatedEvent(
                    type="runtime.fit.updated",
                    source="runtime",
                    timestamp=iso_now(),
                    sessionId=session.session_id,
                    payload=RuntimeFitPayload(recommendation=recommendation),
                )

        if fit_event is not None:
            await self._runtime_hub.broadcast(cast(RuntimeOutboundEvent, fit_event))

    async def _mark_camera_disconnected(self, *, session_id: str, message: str) -> None:
        lost_events: list[RuntimeOutboundEvent] = []

        async with self._lock:
            session = self._active_session

            if not session or session.session_id != session_id or not session.active:
                return

            session.camera_connected = False
            session.stream_started = False
            if not session.ready_emitted:
                lost_events = cast(
                    list[RuntimeOutboundEvent],
                    self._analyzer.process_frame_loss(state=session, timestamp=iso_now()),
                )

        self._log_service.info("camera", message)

        for event in lost_events:
            await self._runtime_hub.broadcast(event)

        await self._broadcast_health()

    async def _broadcast_health(self) -> None:
        session = self._active_session
        event = self._health_service.build_health_event(
            active_session=session is not None and session.active,
            camera_connected=bool(session and session.camera_connected),
            session_ready=bool(session and session.ready_emitted),
        )
        await self._runtime_hub.broadcast(cast(RuntimeOutboundEvent, event))

    async def _replace_active_session(
        self,
        session: SessionRuntimeState | None,
        *,
        expected_session_id: str | None = None,
    ) -> SessionRuntimeState | None:
        async with self._lock:
            current = self._active_session

            if (
                expected_session_id is not None
                and current is not None
                and current.session_id != expected_session_id
            ):
                return None

            self._active_session = session
            return current

    async def _dispose_session(self, session: SessionRuntimeState) -> None:
        session.active = False
        session.new_frame_event.set()

        if session.worker_task is not None:
            session.worker_task.cancel()
            try:
                await session.worker_task
            except asyncio.CancelledError:
                pass

    def _is_current_session(self, session: SessionRuntimeState) -> bool:
        current = self._active_session
        return current is not None and current.session_id == session.session_id and current.active

    async def _run_session_worker(self, session: SessionRuntimeState) -> None:
        try:
            while session.active:
                try:
                    await asyncio.wait_for(
                        session.new_frame_event.wait(),
                        timeout=self._frame_timeout_seconds,
                    )
                except TimeoutError:
                    lost_events: list[RuntimeOutboundEvent] = []

                    async with self._lock:
                        if not self._is_current_session(session):
                            break
                        if not session.ready_emitted:
                            lost_events = cast(
                                list[RuntimeOutboundEvent],
                                self._analyzer.process_frame_loss(state=session, timestamp=iso_now()),
                            )

                    for event in lost_events:
                        await self._runtime_hub.broadcast(event)

                    if lost_events:
                        await self._broadcast_health()
                    continue

                async with self._lock:
                    if not self._is_current_session(session):
                        break

                    frame = session.latest_frame
                    session.latest_frame = None
                    session.new_frame_event.clear()

                if frame is None:
                    continue

                decoded_frame = await asyncio.to_thread(
                    self._analyzer.decode_frame,
                    frame.data_url,
                )

                if decoded_frame is None:
                    self._log_service.warning(
                        "camera",
                        f"Ignored malformed frame {frame.frame_id} for session {session.session_id}.",
                    )
                    continue

                outbound_events: list[RuntimeOutboundEvent] = []
                fit_event: RuntimeFitUpdatedEvent | None = None

                async with self._lock:
                    if not self._is_current_session(session):
                        break

                    outbound_events = cast(
                        list[RuntimeOutboundEvent],
                        self._analyzer.process_valid_frame(
                            state=session,
                            now_monotonic=time.monotonic(),
                            timestamp=iso_now(),
                        ),
                    )

                    if session.measurements_snapshot is not None and session.selected_garment_id:
                        garment_record = self._catalog_service.get_record(session.selected_garment_id)
                        if garment_record is not None:
                            recommendation = self._analyzer.build_fit_recommendation(
                                garment_record=garment_record,
                                snapshot=session.measurements_snapshot,
                                selected_size_code=session.selected_size_code,
                                timestamp=iso_now(),
                            )
                            fit_event = RuntimeFitUpdatedEvent(
                                type="runtime.fit.updated",
                                source="runtime",
                                timestamp=iso_now(),
                                sessionId=session.session_id,
                                payload=RuntimeFitPayload(recommendation=recommendation),
                            )

                for event in outbound_events:
                    await self._runtime_hub.broadcast(event)

                if fit_event is not None:
                    await self._runtime_hub.broadcast(cast(RuntimeOutboundEvent, fit_event))
        except asyncio.CancelledError:
            raise
