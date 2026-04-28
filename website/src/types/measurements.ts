import type {
  IsoTimestamp,
  MeasurementId,
  MeasurementUnit,
} from '@/types/shared';

export type MeasurementStatus =
  | 'idle'
  | 'collecting'
  | 'partial'
  | 'ready'
  | 'unavailable';

export type MeasurementKey =
  | 'chest'
  | 'waist'
  | 'shoulderWidth'
  | 'sleeveLength'
  | 'torsoLength';

export type MeasurementSample = {
  id: MeasurementId;
  key: MeasurementKey;
  label: string;
  valueCm: number | null;
  unit: MeasurementUnit;
  source: 'runtime';
  capturedAt: IsoTimestamp;
};

export type MeasurementSnapshot = {
  status: MeasurementStatus;
  samples: MeasurementSample[];
  lastUpdatedAt?: IsoTimestamp;
};
