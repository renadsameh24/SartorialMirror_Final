from __future__ import annotations

import base64
import io
from typing import Iterable

from PIL import Image, UnidentifiedImageError

from backend.app.catalog_seed import InternalGarmentRecord
from backend.app.config import Settings
from backend.app.models.runtime import (
    FitRecommendation,
    GuidanceMessage,
    MeasurementSample,
    MeasurementSnapshot,
    RuntimeMeasurementsPayload,
    RuntimeMeasurementsUpdatedEvent,
    RuntimeScanCompletedEvent,
    RuntimeScanCompletedPayload,
    RuntimeUserDetectedEvent,
    RuntimeUserDetectedPayload,
    RuntimeUserLostEvent,
    RuntimeUserLostPayload,
)
from backend.app.models.shared import iso_now
from backend.app.services.runtime_state import DecodedFrame, SessionRuntimeState


MEASUREMENT_LABELS = {
    "chest": "Chest",
    "waist": "Waist",
    "shoulderWidth": "Shoulder Width",
    "sleeveLength": "Sleeve Length",
    "torsoLength": "Torso Length",
}


class FrameAnalyzer:
    def decode_frame(self, data_url: str) -> DecodedFrame | None:  # pragma: no cover - interface
        raise NotImplementedError


class HeuristicAnalyzer(FrameAnalyzer):
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def decode_frame(self, data_url: str) -> DecodedFrame | None:
        if "," not in data_url:
            return None

        _, encoded = data_url.split(",", 1)

        try:
            raw_bytes = base64.b64decode(encoded, validate=True)
        except Exception:
            return None

        try:
            with Image.open(io.BytesIO(raw_bytes)) as image:
                image.load()
                return DecodedFrame(
                    width=image.width,
                    height=image.height,
                    format=(image.format or "UNKNOWN").upper(),
                )
        except (UnidentifiedImageError, OSError):
            return None

    def guidance_detected(self, *, timestamp: str) -> list[GuidanceMessage]:
        return [
            GuidanceMessage(
                id="guidance-detection-position",
                scope="detection",
                tone="assistive",
                title="Adjust position",
                body="Stand centered in the frame to continue.",
                actionLabel="Reposition",
                actionIntent="reposition",
                createdAt=timestamp,
            )
        ]

    def guidance_lost(self, *, timestamp: str) -> list[GuidanceMessage]:
        return [
            GuidanceMessage(
                id="guidance-detection-lost",
                scope="detection",
                tone="warning",
                title="We lost the live view",
                body="Step back into the frame so the local session can continue.",
                actionLabel="Retry",
                actionIntent="retry",
                createdAt=timestamp,
            )
        ]

    def build_measurements_snapshot(self, *, timestamp: str) -> MeasurementSnapshot:
        samples = [
            MeasurementSample(
                id=f"measurement-{key}",
                key=key,  # type: ignore[arg-type]
                label=MEASUREMENT_LABELS[key],
                valueCm=value,
                capturedAt=timestamp,
            )
            for key, value in self._settings.default_measurements_cm.items()
        ]
        return MeasurementSnapshot(
            status="ready",
            samples=samples,
            lastUpdatedAt=timestamp,
        )

    def process_valid_frame(
        self,
        *,
        state: SessionRuntimeState,
        now_monotonic: float,
        timestamp: str,
    ) -> list[object]:
        events: list[object] = []
        should_emit_detected = not state.detected or state.lost

        if should_emit_detected:
            state.detected = True
            state.lost = False
            if not state.ready_emitted:
                state.first_valid_frame_monotonic = now_monotonic

            events.append(
                RuntimeUserDetectedEvent(
                    type="runtime.user.detected",
                    source="runtime",
                    timestamp=timestamp,
                    sessionId=state.session_id,
                    payload=RuntimeUserDetectedPayload(
                        guidance=self.guidance_detected(timestamp=timestamp)
                    ),
                )
            )

        if (
            not state.ready_emitted
            and state.first_valid_frame_monotonic is not None
            and now_monotonic - state.first_valid_frame_monotonic
            >= self._settings.stable_frame_dwell_seconds
        ):
            state.ready_emitted = True
            snapshot = self.build_measurements_snapshot(timestamp=timestamp)
            state.measurements_snapshot = snapshot

            events.extend(
                [
                    RuntimeScanCompletedEvent(
                        type="runtime.scan.completed",
                        source="runtime",
                        timestamp=timestamp,
                        sessionId=state.session_id,
                        payload=RuntimeScanCompletedPayload(readyForCatalog=True),
                    ),
                    RuntimeMeasurementsUpdatedEvent(
                        type="runtime.measurements.updated",
                        source="runtime",
                        timestamp=timestamp,
                        sessionId=state.session_id,
                        payload=RuntimeMeasurementsPayload(snapshot=snapshot),
                    ),
                ]
            )

        return events

    def process_frame_loss(
        self,
        *,
        state: SessionRuntimeState,
        timestamp: str,
    ) -> list[RuntimeUserLostEvent]:
        if not state.detected or state.lost:
            return []

        state.lost = True
        return [
            RuntimeUserLostEvent(
                type="runtime.user.lost",
                source="runtime",
                timestamp=timestamp,
                sessionId=state.session_id,
                payload=RuntimeUserLostPayload(
                    guidance=self.guidance_lost(timestamp=timestamp)
                ),
            )
        ]

    def build_fit_recommendation(
        self,
        *,
        garment_record: InternalGarmentRecord,
        snapshot: MeasurementSnapshot,
        selected_size_code: str | None,
        timestamp: str,
    ) -> FitRecommendation:
        measurement_map = {
            sample.key: sample.valueCm
            for sample in snapshot.samples
            if sample.valueCm is not None
        }
        size_order = [size.code for size in garment_record.garment.availableSizes]
        size_scores: list[tuple[str, float, dict[str, float]]] = []

        for size_code, profile in garment_record.sizeProfiles.items():
            component_scores = {
                "chest": abs((measurement_map.get("chest") or profile.chest) - profile.chest),
                "waist": abs((measurement_map.get("waist") or profile.waist) - profile.waist),
                "shoulderWidth": abs(
                    (measurement_map.get("shoulderWidth") or profile.shoulderWidth)
                    - profile.shoulderWidth
                ),
                "sleeveLength": abs(
                    (measurement_map.get("sleeveLength") or profile.sleeveLength)
                    - profile.sleeveLength
                ),
                "torsoLength": abs(
                    (measurement_map.get("torsoLength") or profile.torsoLength)
                    - profile.torsoLength
                ),
            }
            weighted_score = (
                component_scores["chest"] * 1.25
                + component_scores["waist"] * 1.0
                + component_scores["shoulderWidth"] * 1.5
                + component_scores["sleeveLength"] * 0.75
                + component_scores["torsoLength"] * 0.75
            )
            size_scores.append((size_code, weighted_score, component_scores))

        size_scores.sort(key=lambda item: item[1])
        recommended_size, best_score, best_components = size_scores[0]
        evaluated_size = selected_size_code or recommended_size
        size_index = {code: index for index, code in enumerate(size_order)}
        score_ratio = max(0.0, min(1.0, 1.0 - (best_score / 18.0)))

        if score_ratio >= 0.82:
            confidence_band = "high"
        elif score_ratio >= 0.62:
            confidence_band = "medium"
        else:
            confidence_band = "low"

        evaluated_index = size_index.get(evaluated_size, size_index.get(recommended_size, 1))
        recommended_index = size_index.get(recommended_size, evaluated_index)
        delta = evaluated_index - recommended_index

        if delta == 0:
            fit_band = "bestFit"
            summary = "Current size is the best fit."
        elif abs(delta) >= 2:
            fit_band = "notRecommended"
            summary = "A different size would wear more comfortably."
        elif delta > 0:
            fit_band = "slightlyLoose"
            summary = "Current size may feel a little loose."
        else:
            fit_band = "slightlyTight"
            summary = "A slightly larger size may feel more comfortable."

        alternative_size = None
        for size_code, _, _ in size_scores[1:]:
            if size_code != recommended_size:
                alternative_size = size_code
                break

        sorted_reasons = sorted(best_components.items(), key=lambda item: item[1])
        reasons = [
            f"{MEASUREMENT_LABELS[key]} measurements align well."
            for key, _ in sorted_reasons[:2]
        ]

        if fit_band == "slightlyTight":
            reasons.append("The selected size runs a little closer through the frame.")
        elif fit_band == "slightlyLoose":
            reasons.append("The selected size leaves more room than the closest match.")
        elif fit_band == "notRecommended":
            reasons.append("A different size lands much closer to the measured baseline.")

        return FitRecommendation(
            garmentId=garment_record.garment.id,
            evaluatedSize=evaluated_size,
            recommendedSize=recommended_size,
            fitBand=fit_band,  # type: ignore[arg-type]
            confidenceBand=confidence_band,  # type: ignore[arg-type]
            confidenceScore=round(max(0.35, min(0.97, score_ratio)), 2),
            summary=summary,
            reasons=reasons,
            alternativeSize=alternative_size,
            updatedAt=timestamp,
        )
