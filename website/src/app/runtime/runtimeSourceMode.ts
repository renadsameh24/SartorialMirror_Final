export const RUNTIME_SOURCE_MODES = ['demo', 'integration'] as const;

export type RuntimeSourceMode = (typeof RUNTIME_SOURCE_MODES)[number];

export function isRuntimeSourceMode(value: unknown): value is RuntimeSourceMode {
  return (
    typeof value === 'string' &&
    RUNTIME_SOURCE_MODES.includes(value as RuntimeSourceMode)
  );
}
