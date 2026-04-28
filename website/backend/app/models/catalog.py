from __future__ import annotations

from typing import Literal

from pydantic import Field

from backend.app.models.shared import EventEnvelope, StrictModel


CatalogLoadStatus = Literal["idle", "loading", "ready", "partial", "unavailable"]
CatalogItemStatus = Literal["active", "hidden", "unavailable"]
AvailabilityState = Literal["available", "unavailable"]
GarmentSilhouette = Literal["upper-body"]


class GarmentCategory(StrictModel):
    id: str
    label: str
    sortOrder: int


class GarmentSizeOption(StrictModel):
    code: str
    label: str
    availability: AvailabilityState


class GarmentColorOption(StrictModel):
    id: str
    label: str
    variantId: str
    availability: AvailabilityState
    swatchHex: str | None = None


class Garment(StrictModel):
    id: str
    sku: str
    name: str
    categoryId: str
    silhouette: GarmentSilhouette
    status: CatalogItemStatus
    description: str | None = None
    heroImageUrl: str | None = None
    availableSizes: list[GarmentSizeOption]
    availableColors: list[GarmentColorOption]
    defaultVariantId: str | None = None


class CatalogSnapshotPayload(StrictModel):
    status: CatalogLoadStatus
    categories: list[GarmentCategory]
    garments: list[Garment]


class CatalogSnapshotUpdatedEvent(EventEnvelope):
    type: Literal["catalog.snapshot.updated"]
    source: Literal["catalog"] = "catalog"
    payload: CatalogSnapshotPayload


class CatalogSnapshotUnavailableEvent(EventEnvelope):
    type: Literal["catalog.snapshot.unavailable"]
    source: Literal["catalog"] = "catalog"
    payload: dict[Literal["status"], Literal["unavailable"]] = Field(
        default_factory=lambda: {"status": "unavailable"}
    )

