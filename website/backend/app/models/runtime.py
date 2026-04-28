from __future__ import annotations

from typing import Annotated, Literal

from pydantic import Field, TypeAdapter

from backend.app.models.shared import CommandEnvelope, EventEnvelope, StrictModel


HealthStatus = Literal["healthy", "warning", "degraded", "offline"]
SystemSurface = Literal["camera", "runtime", "unity", "catalog"]
GuidanceTone = Literal["neutral", "assistive", "warning"]
GuidanceScope = Literal["detection", "tryOn", "fit", "system"]
MeasurementStatus = Literal["idle", "collecting", "partial", "ready", "unavailable"]
FitBand = Literal["bestFit", "slightlyTight", "slightlyLoose", "notRecommended"]
FitConfidenceBand = Literal["low", "medium", "high"]


class HealthSignal(StrictModel):
    surface: SystemSurface
    status: HealthStatus
    summary: str
    updatedAt: str


class GuidanceMessage(StrictModel):
    id: str
    scope: GuidanceScope
    tone: GuidanceTone
    title: str
    body: str
    actionLabel: str | None = None
    actionIntent: Literal["retry", "reposition", "continue", "dismiss"] | None = None
    createdAt: str


class MeasurementSample(StrictModel):
    id: str
    key: Literal["chest", "waist", "shoulderWidth", "sleeveLength", "torsoLength"]
    label: str
    valueCm: float | None
    unit: Literal["cm"] = "cm"
    source: Literal["runtime"] = "runtime"
    capturedAt: str


class MeasurementSnapshot(StrictModel):
    status: MeasurementStatus
    samples: list[MeasurementSample]
    lastUpdatedAt: str | None = None


class FitRecommendation(StrictModel):
    garmentId: str
    evaluatedSize: str | None = None
    recommendedSize: str | None = None
    fitBand: FitBand | None = None
    confidenceBand: FitConfidenceBand | None = None
    confidenceScore: float | None = None
    summary: str
    reasons: list[str]
    alternativeSize: str | None = None
    alternativeGarmentId: str | None = None
    updatedAt: str


class RuntimeUserDetectedPayload(StrictModel):
    detectionState: Literal["detected"] = "detected"
    guidance: list[GuidanceMessage] | None = None


class RuntimeUserLostPayload(StrictModel):
    detectionState: Literal["lost"] = "lost"
    guidance: list[GuidanceMessage] | None = None


class RuntimeScanCompletedPayload(StrictModel):
    readyForCatalog: bool


class RuntimeMeasurementsPayload(StrictModel):
    snapshot: MeasurementSnapshot


class RuntimeFitPayload(StrictModel):
    recommendation: FitRecommendation


class RuntimeGuidancePayload(StrictModel):
    messages: list[GuidanceMessage]


class RuntimeHealthPayload(StrictModel):
    signals: list[HealthSignal]


class RuntimeUserDetectedEvent(EventEnvelope):
    type: Literal["runtime.user.detected"]
    source: Literal["runtime"] = "runtime"
    payload: RuntimeUserDetectedPayload


class RuntimeUserLostEvent(EventEnvelope):
    type: Literal["runtime.user.lost"]
    source: Literal["runtime"] = "runtime"
    payload: RuntimeUserLostPayload


class RuntimeScanCompletedEvent(EventEnvelope):
    type: Literal["runtime.scan.completed"]
    source: Literal["runtime"] = "runtime"
    payload: RuntimeScanCompletedPayload


class RuntimeMeasurementsUpdatedEvent(EventEnvelope):
    type: Literal["runtime.measurements.updated"]
    source: Literal["runtime"] = "runtime"
    payload: RuntimeMeasurementsPayload


class RuntimeFitUpdatedEvent(EventEnvelope):
    type: Literal["runtime.fit.updated"]
    source: Literal["runtime"] = "runtime"
    payload: RuntimeFitPayload


class RuntimeGuidanceUpdatedEvent(EventEnvelope):
    type: Literal["runtime.guidance.updated"]
    source: Literal["runtime"] = "runtime"
    payload: RuntimeGuidancePayload


class RuntimeHealthUpdatedEvent(EventEnvelope):
    type: Literal["runtime.health.updated"]
    source: Literal["runtime"] = "runtime"
    payload: RuntimeHealthPayload


RuntimeOutboundEvent = Annotated[
    RuntimeUserDetectedEvent
    | RuntimeUserLostEvent
    | RuntimeScanCompletedEvent
    | RuntimeMeasurementsUpdatedEvent
    | RuntimeFitUpdatedEvent
    | RuntimeGuidanceUpdatedEvent
    | RuntimeHealthUpdatedEvent,
    Field(discriminator="type"),
]


class SessionStartPayload(StrictModel):
    input: Literal["keyboard", "mouse", "gesture", "voice"]


class SessionEndPayload(StrictModel):
    reason: Literal["userRequested", "timeout", "systemReset"]


class SelectGarmentPayload(StrictModel):
    garmentId: str


class SelectSizePayload(StrictModel):
    sizeCode: str


class SelectColorPayload(StrictModel):
    colorId: str
    variantId: str | None = None


class CalibrationStartPayload(StrictModel):
    profileId: str | None = None


class EmptyPayload(StrictModel):
    pass


class ShopperSessionStartCommand(CommandEnvelope):
    type: Literal["shopper.session.start"]
    payload: SessionStartPayload


class ShopperSessionEndCommand(CommandEnvelope):
    type: Literal["shopper.session.end"]
    payload: SessionEndPayload


class ShopperSelectGarmentCommand(CommandEnvelope):
    type: Literal["shopper.catalog.selectGarment"]
    payload: SelectGarmentPayload


class ShopperSelectSizeCommand(CommandEnvelope):
    type: Literal["shopper.catalog.selectSize"]
    payload: SelectSizePayload


class ShopperSelectColorCommand(CommandEnvelope):
    type: Literal["shopper.catalog.selectColor"]
    payload: SelectColorPayload


class AdminCalibrationStartCommand(CommandEnvelope):
    type: Literal["admin.calibration.start"]
    payload: CalibrationStartPayload


class AdminCalibrationCancelCommand(CommandEnvelope):
    type: Literal["admin.calibration.cancel"]
    payload: EmptyPayload


class AdminHealthRefreshCommand(CommandEnvelope):
    type: Literal["admin.health.refresh"]
    payload: EmptyPayload


class AdminLogsRefreshCommand(CommandEnvelope):
    type: Literal["admin.logs.refresh"]
    payload: EmptyPayload


RuntimeCommand = Annotated[
    ShopperSessionStartCommand
    | ShopperSessionEndCommand
    | ShopperSelectGarmentCommand
    | ShopperSelectSizeCommand
    | ShopperSelectColorCommand
    | AdminCalibrationStartCommand
    | AdminCalibrationCancelCommand
    | AdminHealthRefreshCommand
    | AdminLogsRefreshCommand,
    Field(discriminator="type"),
]


RUNTIME_COMMAND_ADAPTER = TypeAdapter(RuntimeCommand)

