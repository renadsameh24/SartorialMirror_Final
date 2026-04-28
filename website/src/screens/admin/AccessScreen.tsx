import { Badge, Button, Panel, PanelHeader } from '@/components/primitives';
import { AdminPinEntry, LOCAL_ADMIN_PIN } from '@/features/admin/access/AdminPinEntry';
import type { AdminSectionLayout } from '@/features/admin/adminSectionLayout';
import { AdminSectionNav } from '@/features/admin/navigation/AdminSectionNav';
import { readAdminAccessGate } from '@/features/admin/readModels/access';
import { useAdminStore } from '@/stores/admin/adminStore';
import { useUiModeStore } from '@/stores/uiMode/uiModeStore';

type AdminAccessScreenModel = {
  cancel: () => void;
  gate: ReturnType<typeof readAdminAccessGate>;
  unlock: (pin: string) => boolean;
};

export function useAdminAccessScreenModel(): AdminAccessScreenModel {
  const setMode = useUiModeStore((state) => state.setMode);
  const setAccess = useAdminStore((state) => state.setAccess);
  const setActiveSection = useAdminStore((state) => state.setActiveSection);

  return {
    cancel: () => {
      setAccess('hidden');
      setActiveSection('dashboard');
      setMode('shopper');
    },
    gate: readAdminAccessGate(),
    unlock: (pin) => {
      if (pin !== LOCAL_ADMIN_PIN) {
        return false;
      }

      setAccess('granted');
      setActiveSection('dashboard');
      return true;
    },
  };
}

export function createAdminAccessScreenLayout({
  cancel,
  gate,
  unlock,
}: AdminAccessScreenModel): AdminSectionLayout {
  const showPinEntry = gate.state === 'requested';

  return {
    commandBar: (
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div className="space-y-xs">
          <Badge variant="accent">Operational Mode</Badge>
          <h1 className="type-heading">Staff Access</h1>
          <p className="type-body text-text-secondary">
            Local PIN gate for operational tools only.
          </p>
        </div>
        <Button onClick={cancel} variant="quiet">
          Return to Shopper
        </Button>
      </div>
    ),
    nav: <AdminSectionNav activeSection="dashboard" disabled />,
    workspace: (
      <div className="flex min-h-full items-center justify-center">
        {showPinEntry ? (
          <AdminPinEntry onCancel={cancel} onUnlock={unlock} support={gate.support} />
        ) : (
          <Panel tone="strong" className="mx-auto max-w-3xl">
            <div className="space-y-lg">
              <PanelHeader
                action={<Badge variant="destructive">Unavailable</Badge>}
                support={gate.support}
                title="Staff access"
              />
              <p className="type-body text-text-secondary">
                Admin entry cannot overlap an active shopper session. Return to the shopper
                surface and complete the explicit end and reset flow first.
              </p>
              <div className="flex justify-end">
                <Button onClick={cancel} variant="quiet">
                  Return to Shopper
                </Button>
              </div>
            </div>
          </Panel>
        )}
      </div>
    ),
    inspector: null,
  };
}
