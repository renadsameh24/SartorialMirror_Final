import type { CatalogPort, RuntimePort, UnityPort } from '@/adapters/contracts/ports';
import { createDemoCatalogPort } from '@/adapters/catalog/createDemoCatalogPort';
import { createIntegrationCatalogPort } from '@/adapters/catalog/createIntegrationCatalogPort';
import { createDemoRuntimePort } from '@/adapters/runtime/createDemoRuntimePort';
import { createIntegrationRuntimePort } from '@/adapters/runtime/createIntegrationRuntimePort';
import { createDemoUnityPort } from '@/adapters/unity/createDemoUnityPort';
import { createIntegrationUnityPort } from '@/adapters/unity/createIntegrationUnityPort';
import { type RuntimeSourceMode } from '@/app/runtime/runtimeSourceMode';
import {
  DEFAULT_CATALOG_SNAPSHOT_URL,
  DEFAULT_RUNTIME_WS_URL,
  DEFAULT_UNITY_ALLOWED_ORIGIN,
  resolveRuntimeConfig,
  UNITY_FRAME_SELECTOR,
  type AppRuntimeBootstrapConfig,
} from '@/app/runtime/runtimeConfig';
import { createDemoScenarioDriver } from '@/mocks/runtime/demoScenarioDriver';

export type AppRuntimeDependencies = {
  catalogPort: CatalogPort;
  runtimePort: RuntimePort;
  unityPort: UnityPort;
};

function configFor(
  configOrMode: AppRuntimeBootstrapConfig | RuntimeSourceMode,
): AppRuntimeBootstrapConfig {
  return typeof configOrMode === 'string'
    ? resolveRuntimeConfig({ VITE_RUNTIME_SOURCE_MODE: configOrMode })
    : configOrMode;
}

export function createRuntimeDependencies(
  configOrMode: AppRuntimeBootstrapConfig | RuntimeSourceMode,
): AppRuntimeDependencies {
  const config = configFor(configOrMode);

  if (config.sourceMode === 'demo') {
    const driver = createDemoScenarioDriver();

    return {
      catalogPort: createDemoCatalogPort(),
      runtimePort: createDemoRuntimePort({ driver }),
      unityPort: createDemoUnityPort({ driver }),
    };
  }

  return {
    catalogPort: createIntegrationCatalogPort({
      snapshotUrl: config.catalogSnapshotUrl ?? DEFAULT_CATALOG_SNAPSHOT_URL,
    }),
    runtimePort: createIntegrationRuntimePort({
      url: config.runtimeWsUrl ?? DEFAULT_RUNTIME_WS_URL,
    }),
    unityPort: createIntegrationUnityPort({
      allowedOrigin: config.unityAllowedOrigin ?? DEFAULT_UNITY_ALLOWED_ORIGIN,
      frameSelector: UNITY_FRAME_SELECTOR,
    }),
  };
}
