import { useEffect, useRef } from 'react';

import { AppShell } from '@/app/shell/AppShell';
import { createAppRuntime, type AppRuntime } from '@/app/runtime/createAppRuntime';
import { resolveRuntimeConfig } from '@/app/runtime/runtimeConfig';
import { createRuntimeDependencies } from '@/app/runtime/createRuntimeDependencies';
import { selectUiMode } from '@/stores/uiMode/selectors';
import { useUiModeStore } from '@/stores/uiMode/uiModeStore';

export function App() {
  const mode = useUiModeStore(selectUiMode);
  const setMode = useUiModeStore((state) => state.setMode);
  const runtimeRef = useRef<AppRuntime | null>(null);

  if (!runtimeRef.current) {
    const runtimeConfig = resolveRuntimeConfig();

    runtimeRef.current = createAppRuntime(
      runtimeConfig,
      createRuntimeDependencies(runtimeConfig),
    );
  }

  useEffect(() => {
    const runtime = runtimeRef.current;

    if (!runtime) {
      return;
    }

    void runtime.start();

    return () => {
      void runtime.stop();
    };
  }, []);

  return <AppShell mode={mode} onModeChange={setMode} />;
}
