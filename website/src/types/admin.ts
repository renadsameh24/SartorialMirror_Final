import type {
  CalibrationProfileId,
  IsoTimestamp,
  LogEntryId,
} from '@/types/shared';
import type { SystemSurface } from '@/types/system';

export type AdminSection = 'dashboard' | 'catalog' | 'calibration' | 'logs';
export type AdminAccessState = 'hidden' | 'requested' | 'granted';
export type CalibrationStatus =
  | 'idle'
  | 'required'
  | 'inProgress'
  | 'ready'
  | 'failed';

export type CalibrationState = {
  status: CalibrationStatus;
  activeProfileId?: CalibrationProfileId;
  lastCompletedAt?: IsoTimestamp;
};

export type OperationalLogEntry = {
  id: LogEntryId;
  level: 'info' | 'warning' | 'error';
  source: SystemSurface | 'admin';
  message: string;
  timestamp: IsoTimestamp;
};

export type AdminOperationalState = {
  access: AdminAccessState;
  activeSection: AdminSection;
  calibration: CalibrationState;
  selectedLogEntryId?: LogEntryId;
};
