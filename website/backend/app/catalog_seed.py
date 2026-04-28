from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from backend.app.models.catalog import (
    CatalogSnapshotPayload,
    Garment,
    GarmentCategory,
)


class SizeProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    chest: float
    waist: float
    shoulderWidth: float
    sleeveLength: float
    torsoLength: float


class InternalGarmentRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    garment: Garment
    sizeProfiles: dict[str, SizeProfile]


def _size_profile(chest: float, waist: float, shoulder: float, sleeve: float, torso: float) -> SizeProfile:
    return SizeProfile(
        chest=chest,
        waist=waist,
        shoulderWidth=shoulder,
        sleeveLength=sleeve,
        torsoLength=torso,
    )


def _garment(
    garment_id: str,
    name: str,
    category_id: str,
    status: str = "active",
    chest_bias: float = 0.0,
    waist_bias: float = 0.0,
) -> InternalGarmentRecord:
    garment = Garment.model_validate(
        {
            "id": garment_id,
            "sku": f"SKU-{garment_id.upper()}",
            "name": name,
            "categoryId": category_id,
            "silhouette": "upper-body",
            "status": status,
            "availableSizes": [
                {"code": "S", "label": "Small", "availability": "available"},
                {"code": "M", "label": "Medium", "availability": "available"},
                {"code": "L", "label": "Large", "availability": "available"},
            ],
            "availableColors": [
                {
                    "id": f"{garment_id}-navy",
                    "label": "Navy",
                    "variantId": f"{garment_id}-variant-navy",
                    "swatchHex": "#20324A",
                    "availability": "available",
                },
                {
                    "id": f"{garment_id}-stone",
                    "label": "Stone",
                    "variantId": f"{garment_id}-variant-stone",
                    "swatchHex": "#B9B1A4",
                    "availability": "unavailable" if status == "unavailable" else "available",
                },
            ],
            "defaultVariantId": f"{garment_id}-variant-navy",
        }
    )

    return InternalGarmentRecord(
        garment=garment,
        sizeProfiles={
            "S": _size_profile(94 + chest_bias, 80 + waist_bias, 44, 63, 69),
            "M": _size_profile(98 + chest_bias, 84 + waist_bias, 46, 64, 71),
            "L": _size_profile(102 + chest_bias, 88 + waist_bias, 48, 65, 73),
        },
    )


CATALOG_CATEGORIES = [
    GarmentCategory.model_validate({"id": "tops", "label": "Tops", "sortOrder": 1}),
    GarmentCategory.model_validate(
        {"id": "outerwear", "label": "Outerwear", "sortOrder": 2}
    ),
]


CATALOG_RECORDS = [
    _garment("oxford-shirt", "Oxford Shirt", "tops", chest_bias=0.5),
    _garment("linen-shirt", "Linen Shirt", "tops", chest_bias=1.0, waist_bias=0.5),
    _garment("silk-blouse", "Silk Blouse", "tops", chest_bias=-0.5),
    _garment("cashmere-knit", "Cashmere Knit", "tops", chest_bias=1.5, waist_bias=1.0),
    _garment("merino-cardigan", "Merino Cardigan", "tops", chest_bias=1.0),
    _garment("tailored-blazer", "Tailored Blazer", "outerwear", chest_bias=-0.5),
    _garment("soft-blazer", "Soft Blazer", "outerwear", chest_bias=0.5),
    _garment("cropped-jacket", "Cropped Jacket", "outerwear", waist_bias=-0.5),
    _garment("studio-coat", "Studio Coat", "outerwear", status="hidden", chest_bias=2.0),
    _garment("sample-vest", "Sample Vest", "outerwear", status="unavailable", chest_bias=-1.0),
]


def build_catalog_snapshot_payload() -> CatalogSnapshotPayload:
    return CatalogSnapshotPayload(
        status="ready",
        categories=CATALOG_CATEGORIES,
        garments=[record.garment for record in CATALOG_RECORDS],
    )
