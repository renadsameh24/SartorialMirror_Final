import type { UiFitRecommendation } from '@/types/fit';
import type { FitStore } from '@/stores/fit/fitStore';

function toUiFitRecommendation(
  recommendation: FitStore['recommendation'],
): UiFitRecommendation | null {
  if (!recommendation) {
    return null;
  }

  const uiRecommendation: UiFitRecommendation = {
    alternativeGarmentId: recommendation.alternativeGarmentId,
    alternativeSize: recommendation.alternativeSize,
    confidenceBand: recommendation.confidenceBand,
    evaluatedSize: recommendation.evaluatedSize,
    fitBand: recommendation.fitBand,
    garmentId: recommendation.garmentId,
    reasons: recommendation.reasons,
    recommendedSize: recommendation.recommendedSize,
    summary: recommendation.summary,
    updatedAt: recommendation.updatedAt,
  };

  return uiRecommendation;
}

export function selectFitStatus(state: FitStore) {
  return state.status;
}

export function selectCurrentRecommendation(
  state: FitStore,
): UiFitRecommendation | null {
  return toUiFitRecommendation(state.recommendation);
}

export function selectFitSummary(state: FitStore) {
  return selectCurrentRecommendation(state)?.summary ?? null;
}

export function selectAlternativeSize(state: FitStore) {
  return selectCurrentRecommendation(state)?.alternativeSize ?? null;
}

export function selectHasFitRecommendation(state: FitStore) {
  return selectCurrentRecommendation(state) !== null;
}
