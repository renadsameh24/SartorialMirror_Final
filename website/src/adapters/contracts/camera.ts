import type { IsoTimestamp, SessionId } from '@/types/shared';

type CameraOutboundEnvelope<TType extends string, TPayload> = {
  payload: TPayload;
  sessionId?: SessionId;
  source: 'app';
  timestamp: IsoTimestamp;
  type: TType;
};

export type CameraOutboundEvent =
  | CameraOutboundEnvelope<
      'camera.stream.started',
      {
        frameIntervalMs: number;
        mimeType: 'image/jpeg';
        transport: 'dataUrl';
      }
    >
  | CameraOutboundEnvelope<
      'camera.frame.captured',
      {
        dataUrl: string;
        frameId: string;
        height: number;
        mimeType: 'image/jpeg';
        width: number;
      }
    >
  | CameraOutboundEnvelope<
      'camera.stream.stopped',
      {
        reason: 'componentUnmounted' | 'streamEnded' | 'uplinkUnavailable';
      }
    >;
