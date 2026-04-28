import { beforeEach, describe, expect, it } from 'vitest';

import { DEMO_PARTIAL_FIT_RECOMMENDATION, DEMO_READY_FIT_RECOMMENDATION } from '@/mocks/runtime/runtimeFixtures';
import { createInitialFitState, useFitStore } from '@/stores/fit/fitStore';

describe('fitStore', () => {
  beforeEach(() => {
    useFitStore.setState(createInitialFitState());
  });

  it('handles partial, ready, and unavailable state while preserving qualitative recommendation output', () => {
    expect(useFitStore.getState().status).toBe('idle');

    useFitStore.getState().setRecommendation({
      ...DEMO_PARTIAL_FIT_RECOMMENDATION,
      confidenceBand: undefined,
    });
    expect(useFitStore.getState().status).toBe('partial');
    expect(useFitStore.getState().recommendation?.summary).toBe(
      DEMO_PARTIAL_FIT_RECOMMENDATION.summary,
    );

    useFitStore.getState().setRecommendation(DEMO_READY_FIT_RECOMMENDATION);
    expect(useFitStore.getState().status).toBe('ready');

    useFitStore.getState().setStatus('unavailable');
    expect(useFitStore.getState().status).toBe('unavailable');
    expect(useFitStore.getState().recommendation).toEqual(
      DEMO_READY_FIT_RECOMMENDATION,
    );
  });

  it('ignores stale recommendations and accepts newer ones', () => {
    useFitStore.getState().setRecommendation(DEMO_READY_FIT_RECOMMENDATION);

    useFitStore.getState().setRecommendation({
      ...DEMO_PARTIAL_FIT_RECOMMENDATION,
      updatedAt: '2026-03-24T09:59:00.000Z',
      summary: 'Older fit result.',
    });

    expect(useFitStore.getState().recommendation).toEqual(
      DEMO_READY_FIT_RECOMMENDATION,
    );

    useFitStore.getState().setRecommendation({
      ...DEMO_PARTIAL_FIT_RECOMMENDATION,
      updatedAt: '2026-03-24T10:01:00.000Z',
    });

    expect(useFitStore.getState().recommendation).toEqual(
      expect.objectContaining({
        summary: DEMO_PARTIAL_FIT_RECOMMENDATION.summary,
        updatedAt: '2026-03-24T10:01:00.000Z',
      }),
    );
  });

  it('resetSessionState clears recommendation state fully', () => {
    useFitStore.getState().setRecommendation(DEMO_READY_FIT_RECOMMENDATION);

    useFitStore.getState().resetSessionState();

    expect(useFitStore.getState().recommendation).toBeNull();
    expect(useFitStore.getState().status).toBe('idle');
  });
});
