import { AdminShell } from '@/app/shell/AdminShell';
import { ShopperShell } from '@/app/shell/ShopperShell';
import type { ShellMode } from '@/app/shell/shellMode';

type AppShellProps = {
  mode: ShellMode;
  onModeChange: (mode: ShellMode) => void;
};

export function AppShell({ mode, onModeChange }: AppShellProps) {
  return (
    <div
      className="min-h-screen bg-surface-canvas text-text-primary"
      data-shell-mode={mode}
      data-testid="app-shell"
    >
      <div className="shell-backdrop min-h-screen">
        {mode === 'shopper' ? (
          <ShopperShell onModeChange={onModeChange} />
        ) : (
          <AdminShell onModeChange={onModeChange} />
        )}
      </div>
    </div>
  );
}
