import type {
  GarmentId,
  IsoTimestamp,
  SizeCode,
} from '@/types/shared';

export type HealthStatus = 'healthy' | 'warning' | 'degraded' | 'offline';
export type SystemSurface = 'camera' | 'runtime' | 'unity' | 'catalog';

export type HealthSignal = {
  surface: SystemSurface;
  status: HealthStatus;
  summary: string;
  updatedAt: IsoTimestamp;
};

export type OperationalReadiness =
  | 'idle'
  | 'pending'
  | 'partial'
  | 'ready'
  | 'unavailable';

export type DetectionOperationalState = 'idle' | 'detected' | 'lost' | 'ready';

export type OperationalStatus = {
  surface: SystemSurface;
  readiness: OperationalReadiness;
  summary: string;
  updatedAt: IsoTimestamp;
  detectionState?: DetectionOperationalState;
  renderState?: UnityRenderState;
  activeGarmentId?: GarmentId;
  activeSizeCode?: SizeCode;
};

export type OperationalStatusMap = Partial<Record<SystemSurface, OperationalStatus>>;

export type GuidanceTone = 'neutral' | 'assistive' | 'warning';
export type GuidanceScope = 'detection' | 'tryOn' | 'fit' | 'system';

export type GuidanceMessage = {
  id: string;
  scope: GuidanceScope;
  tone: GuidanceTone;
  title: string;
  body: string;
  actionLabel?: string;
  actionIntent?: 'retry' | 'reposition' | 'continue' | 'dismiss';
  createdAt: IsoTimestamp;
};

export type DegradedStatus = 'clear' | 'attention' | 'degraded';

export type DegradedIssueFamily =
  | 'detection.userMissing'
  | 'detection.positioning'
  | 'runtime.disconnected'
  | 'catalog.unavailable'
  | 'unity.delayed'
  | 'unity.unavailable'
  | 'measurements.partial'
  | 'measurements.unavailable'
  | 'fit.partial'
  | 'fit.unavailable';

export type DegradedIssue = {
  id: string;
  family: DegradedIssueFamily;
  surface: SystemSurface;
  status: DegradedStatus;
  shopperVisible: boolean;
  summary: string;
  guidanceId?: string;
  detectedAt: IsoTimestamp;
  sessionScoped?: boolean;
};

export type UnityRenderState =
  | 'idle'
  | 'rendering'
  | 'delayed'
  | 'ready'
  | 'unavailable';
