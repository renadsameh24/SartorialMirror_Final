import type { DataSource, SessionId } from '@/types/shared';

export type InboundEventEnvelope<
  TType extends string,
  TSource extends DataSource,
  TPayload,
> = {
  type: TType;
  source: TSource;
  timestamp: string;
  sessionId?: SessionId;
  payload: TPayload;
};

export type BaseCommand<TType extends string, TPayload> = {
  type: TType;
  sessionId?: SessionId;
  payload: TPayload;
};
