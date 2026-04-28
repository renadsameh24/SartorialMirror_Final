import { describe, expect, it } from 'vitest';

import { deriveDegradedState } from '@/lib/runtime/degradedDerivation';

describe('deriveDegradedState', () => {
  it('derives the locked issue taxonomy from normalized operational inputs', () => {
    const derived = deriveDegradedState({
      catalogStatus: 'unavailable',
      fitStatus: 'partial',
      measurementsStatus: 'partial',
      operationalStatuses: {
        camera: {
          surface: 'camera',
          readiness: 'partial',
          summary: 'Shopper lost.',
          updatedAt: '2026-03-24T10:00:00.000Z',
          detectionState: 'lost',
        },
        runtime: {
          surface: 'runtime',
          readiness: 'unavailable',
          summary: 'Runtime unavailable.',
          updatedAt: '2026-03-24T10:00:00.000Z',
        },
        unity: {
          surface: 'unity',
          readiness: 'partial',
          summary: 'Render delayed.',
          updatedAt: '2026-03-24T10:00:00.000Z',
          renderState: 'delayed',
        },
      },
      phase: 'detection',
    });

    expect(derived.issues.map((issue) => issue.family)).toEqual(
      expect.arrayContaining([
        'detection.userMissing',
        'runtime.disconnected',
        'catalog.unavailable',
        'unity.delayed',
        'measurements.partial',
        'fit.partial',
      ]),
    );
    expect(derived.guidance[0]?.body).not.toMatch(/stack trace|confidence score|websocket/i);
  });

  it('prefers runtime-provided guidance when available', () => {
    const derived = deriveDegradedState({
      catalogStatus: 'ready',
      fitStatus: 'ready',
      measurementsStatus: 'ready',
      operationalStatuses: {},
      phase: 'tryOn',
      runtimeGuidance: [
        {
          id: 'guidance-runtime',
          scope: 'system',
          tone: 'neutral',
          title: 'Runtime notice',
          body: 'Hold position while the view refreshes.',
          createdAt: '2026-03-24T10:00:00.000Z',
        },
      ],
    });

    expect(derived.guidance).toEqual([
      expect.objectContaining({ id: 'guidance-runtime' }),
    ]);
  });

  it('clears catalog, unity, measurement, and fit issues when those surfaces recover', () => {
    const recovered = deriveDegradedState({
      catalogStatus: 'ready',
      fitStatus: 'ready',
      measurementsStatus: 'ready',
      operationalStatuses: {
        camera: {
          surface: 'camera',
          readiness: 'ready',
          summary: 'Detection ready.',
          updatedAt: '2026-03-24T10:01:00.000Z',
          detectionState: 'ready',
        },
        runtime: {
          surface: 'runtime',
          readiness: 'ready',
          summary: 'Runtime connected.',
          updatedAt: '2026-03-24T10:01:00.000Z',
        },
        unity: {
          surface: 'unity',
          readiness: 'ready',
          summary: 'Render ready.',
          updatedAt: '2026-03-24T10:01:00.000Z',
          renderState: 'ready',
        },
        catalog: {
          surface: 'catalog',
          readiness: 'ready',
          summary: 'Catalog ready.',
          updatedAt: '2026-03-24T10:01:00.000Z',
        },
      },
      phase: 'tryOn',
    });

    expect(recovered.issues).toEqual([]);
    expect(recovered.guidance).toEqual([]);
  });
});
