import type { ShellMode } from '@/app/shell/shellMode';
import { AdminSectionRenderer } from '@/features/admin/AdminSectionRenderer';
import {
  AdminNavRail,
  InspectorRail,
  ShellBand,
  ShellFrame,
  WorkspaceCanvas,
} from '@/components/shell';

type AdminShellProps = {
  onModeChange: (mode: ShellMode) => void;
};

export function AdminShell({ onModeChange }: AdminShellProps) {
  void onModeChange;

  const layout = AdminSectionRenderer();

  return (
    <ShellFrame className="admin-shell">
      <ShellBand
        aria-label="Admin command bar"
        className="rounded-shell border border-border bg-surface-panel shadow-shell"
      >
        {layout.commandBar}
      </ShellBand>

      <div className="admin-shell-row">
        <AdminNavRail
          aria-label="Admin navigation rail"
          className="rounded-shell"
        >
          {layout.nav}
        </AdminNavRail>

        <WorkspaceCanvas
          aria-label="Admin workspace canvas"
          className="rounded-shell"
        >
          {layout.workspace}
        </WorkspaceCanvas>

        {layout.inspector ? (
          <InspectorRail
            aria-label="Admin inspector rail"
            className="rounded-shell"
          >
            {layout.inspector}
          </InspectorRail>
        ) : null}
      </div>
    </ShellFrame>
  );
}
