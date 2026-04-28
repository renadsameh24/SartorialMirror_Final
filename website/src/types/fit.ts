import type { GarmentId, IsoTimestamp, SizeCode } from '@/types/shared';

export type FitStatus = 'idle' | 'pending' | 'partial' | 'ready' | 'unavailable';
export type FitBand =
  | 'bestFit'
  | 'slightlyTight'
  | 'slightlyLoose'
  | 'notRecommended';
export type FitConfidenceBand = 'low' | 'medium' | 'high';

export type FitRecommendation = {
  garmentId: GarmentId;
  evaluatedSize?: SizeCode;
  recommendedSize?: SizeCode;
  fitBand?: FitBand;
  confidenceBand?: FitConfidenceBand;
  confidenceScore?: number;
  summary: string;
  reasons: string[];
  alternativeSize?: SizeCode;
  alternativeGarmentId?: GarmentId;
  updatedAt: IsoTimestamp;
};

export type UiFitRecommendation = Omit<FitRecommendation, 'confidenceScore'>;
