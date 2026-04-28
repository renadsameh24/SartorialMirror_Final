import { describe, expect, it } from 'vitest';

import { normalizeCatalogEvent } from '@/lib/runtime/normalizeCatalogEvent';
import { normalizeRuntimeEvent } from '@/lib/runtime/normalizeRuntimeEvent';
import { shouldApplyInboundEvent } from '@/lib/runtime/staleEventGuard';
import { DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT } from '@/mocks/catalog/catalogFixtures';
import { DEMO_READY_MEASUREMENT_SNAPSHOT } from '@/mocks/runtime/runtimeFixtures';

describe('staleEventGuard', () => {
  it('rejects stale session-scoped events after reset or session replacement', () => {
    const event = normalizeRuntimeEvent({
      type: 'runtime.measurements.updated',
      source: 'runtime',
      timestamp: '2026-03-24T10:00:00.000Z',
      sessionId: 'session-old',
      payload: {
        snapshot: DEMO_READY_MEASUREMENT_SNAPSHOT,
      },
    });

    expect(shouldApplyInboundEvent(event, null)).toBe(false);
    expect(shouldApplyInboundEvent(event, 'session-new')).toBe(false);
    expect(shouldApplyInboundEvent(event, 'session-old')).toBe(true);
  });

  it('allows app-scoped catalog updates to apply without an active session', () => {
    const event = normalizeCatalogEvent(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT);

    expect(shouldApplyInboundEvent(event, null)).toBe(true);
  });

  it('allows app-scoped runtime health updates after reset or restart while still rejecting stale session events', () => {
    const healthEvent = normalizeRuntimeEvent({
      type: 'runtime.health.updated',
      source: 'runtime',
      timestamp: '2026-03-24T10:05:00.000Z',
      payload: {
        signals: [],
      },
    });
    const staleMeasurementEvent = normalizeRuntimeEvent({
      type: 'runtime.measurements.updated',
      source: 'runtime',
      timestamp: '2026-03-24T10:05:00.000Z',
      sessionId: 'session-before-restart',
      payload: {
        snapshot: DEMO_READY_MEASUREMENT_SNAPSHOT,
      },
    });

    expect(shouldApplyInboundEvent(healthEvent, null)).toBe(true);
    expect(shouldApplyInboundEvent(staleMeasurementEvent, null)).toBe(false);
  });
});
