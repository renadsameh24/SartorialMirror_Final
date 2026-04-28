import type { MeasurementSample } from '@/types/measurements';
import type { MeasurementsStore } from '@/stores/measurements/measurementsStore';

export function selectMeasurementStatus(state: MeasurementsStore) {
  return state.status;
}

export function selectMeasurementSnapshot(state: MeasurementsStore) {
  return state.snapshot;
}

export function selectDisplayMeasurements(
  state: MeasurementsStore,
): MeasurementSample[] {
  return state.snapshot?.samples.filter((sample) => sample.valueCm !== null) ?? [];
}

export function selectHasMeasurementData(state: MeasurementsStore) {
  return selectDisplayMeasurements(state).length > 0;
}
