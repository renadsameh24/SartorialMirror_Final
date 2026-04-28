import { isRuntimeSourceMode, type RuntimeSourceMode } from '@/app/runtime/runtimeSourceMode';

export type AppRuntimeManualSwitchAudience = 'dev' | 'admin';

export const DEFAULT_RUNTIME_WS_URL = 'ws://127.0.0.1:8000/ws/runtime';
export const DEFAULT_CAMERA_UPLINK_WS_URL = 'ws://127.0.0.1:8000/ws/camera';
export const DEFAULT_CATALOG_SNAPSHOT_URL =
  'http://127.0.0.1:8000/catalog/snapshot';
export const DEFAULT_UNITY_WEBGL_URL = 'http://127.0.0.1:8080/';
export const DEFAULT_UNITY_ALLOWED_ORIGIN = 'http://127.0.0.1:8080';
export const UNITY_FRAME_SELECTOR = '[data-unity-webgl-frame="true"]';

export type AppRuntimeBootstrapConfig = {
  allowManualSwitching?: boolean;
  cameraUplinkEnabled?: boolean;
  cameraUplinkWsUrl?: string;
  cameraPreviewEnabled?: boolean;
  catalogSnapshotUrl?: string;
  manualSwitchAudience?: AppRuntimeManualSwitchAudience;
  runtimeWsUrl?: string;
  sourceMode: RuntimeSourceMode;
  unityAllowedOrigin?: string;
  unityWebglUrl?: string;
};

type RuntimeConfigEnv = Partial<{
  DEV: boolean;
  MODE: string;
  VITE_CAMERA_UPLINK_ENABLED: string;
  VITE_CAMERA_UPLINK_WS_URL: string;
  VITE_CAMERA_PREVIEW_ENABLED: string;
  VITE_CATALOG_SNAPSHOT_URL: string;
  VITE_RUNTIME_SOURCE_MODE: string;
  VITE_RUNTIME_FORCE_INTEGRATION: string;
  VITE_RUNTIME_ALLOW_MANUAL_SWITCHING: string;
  VITE_RUNTIME_MANUAL_SWITCH_AUDIENCE: string;
  VITE_RUNTIME_WS_URL: string;
  VITE_UNITY_ALLOWED_ORIGIN: string;
  VITE_UNITY_WEBGL_URL: string;
}>;

function valueOrDefault(value: string | undefined, fallback: string) {
  const normalized = value?.trim();

  return normalized && normalized.length > 0 ? normalized : fallback;
}

function boolFromEnv(value: string | undefined) {
  return value === 'true';
}

export function resolveRuntimeConfig(
  env: RuntimeConfigEnv = import.meta.env,
): AppRuntimeBootstrapConfig {
  // Safety: default to demo unless integration is explicitly forced.
  // This prevents accidental backend/port coupling (e.g., Unity pose server on :8000)
  // from causing repeated /ws/runtime + /catalog calls.
  const wantsIntegration =
    env.VITE_RUNTIME_SOURCE_MODE === 'integration' &&
    env.VITE_RUNTIME_FORCE_INTEGRATION === 'true';
  const sourceMode: RuntimeSourceMode = wantsIntegration ? 'integration' : 'demo';

  const allowManualSwitching =
    env.DEV === true && env.VITE_RUNTIME_ALLOW_MANUAL_SWITCHING === 'true';

  return {
    allowManualSwitching,
    cameraUplinkEnabled: boolFromEnv(env.VITE_CAMERA_UPLINK_ENABLED),
    cameraUplinkWsUrl: valueOrDefault(
      env.VITE_CAMERA_UPLINK_WS_URL,
      DEFAULT_CAMERA_UPLINK_WS_URL,
    ),
    cameraPreviewEnabled: boolFromEnv(env.VITE_CAMERA_PREVIEW_ENABLED),
    catalogSnapshotUrl: valueOrDefault(
      env.VITE_CATALOG_SNAPSHOT_URL,
      DEFAULT_CATALOG_SNAPSHOT_URL,
    ),
    manualSwitchAudience:
      env.VITE_RUNTIME_MANUAL_SWITCH_AUDIENCE === 'admin' ? 'admin' : 'dev',
    runtimeWsUrl: valueOrDefault(env.VITE_RUNTIME_WS_URL, DEFAULT_RUNTIME_WS_URL),
    sourceMode,
    unityAllowedOrigin: valueOrDefault(
      env.VITE_UNITY_ALLOWED_ORIGIN,
      DEFAULT_UNITY_ALLOWED_ORIGIN,
    ),
    unityWebglUrl: valueOrDefault(
      env.VITE_UNITY_WEBGL_URL,
      DEFAULT_UNITY_WEBGL_URL,
    ),
  };
}
