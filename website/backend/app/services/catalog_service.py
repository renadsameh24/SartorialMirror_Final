from __future__ import annotations

from backend.app.catalog_seed import CATALOG_RECORDS, build_catalog_snapshot_payload
from backend.app.models.catalog import CatalogSnapshotUpdatedEvent
from backend.app.models.shared import iso_now


class CatalogService:
    def __init__(self) -> None:
        self._records = {record.garment.id: record for record in CATALOG_RECORDS}
        self._snapshot_payload = build_catalog_snapshot_payload()

    @property
    def is_ready(self) -> bool:
        return True

    def snapshot_event(self) -> CatalogSnapshotUpdatedEvent:
        return CatalogSnapshotUpdatedEvent(
            type="catalog.snapshot.updated",
            source="catalog",
            timestamp=iso_now(),
            payload=self._snapshot_payload,
        )

    def public_snapshot_payload(self):
        return self._snapshot_payload

    def get_record(self, garment_id: str):
        return self._records.get(garment_id)
