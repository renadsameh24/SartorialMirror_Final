export type IsoTimestamp = string;
export type SessionId = string;
export type GarmentId = string;
export type GarmentVariantId = string;
export type CategoryId = string;
export type ColorId = string;
export type SizeCode = string;
export type MeasurementId = string;
export type LogEntryId = string;
export type CalibrationProfileId = string;

export type UiMode = 'shopper' | 'admin';
export type ShopperPhase =
  | 'idle'
  | 'detection'
  | 'catalog'
  | 'tryOn'
  | 'fitDetails'
  | 'sessionEnd';

export type DataSource = 'unity' | 'runtime' | 'catalog' | 'app';
export type AvailabilityState = 'available' | 'unavailable';
export type ShopperInputMethod = 'keyboard' | 'mouse' | 'gesture' | 'voice';
export type MeasurementUnit = 'cm';
export type SessionIdentitySource = 'frontend' | 'runtime';
