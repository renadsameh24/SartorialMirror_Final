import type { DegradedStore } from '@/stores/degraded/degradedStore';

export function selectActiveGuidance(state: DegradedStore) {
  return state.guidance.filter(
    (message) => !state.dismissedGuidanceIds.includes(message.id),
  );
}

export function selectShopperVisibleIssues(state: DegradedStore) {
  return state.issues.filter((issue) => issue.shopperVisible);
}

export function selectHasBlockingDegradedIssue(state: DegradedStore) {
  return selectShopperVisibleIssues(state).some(
    (issue) => issue.status === 'degraded',
  );
}

export function selectDegradedSeverity(state: DegradedStore) {
  const shopperVisibleIssues = selectShopperVisibleIssues(state);

  if (shopperVisibleIssues.some((issue) => issue.status === 'degraded')) {
    return 'degraded';
  }

  if (shopperVisibleIssues.some((issue) => issue.status === 'attention')) {
    return 'attention';
  }

  return 'clear';
}

export function selectPrimaryGuidance(state: DegradedStore) {
  return selectActiveGuidance(state)[0] ?? null;
}
