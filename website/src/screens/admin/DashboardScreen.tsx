import { useState } from 'react';

import { Badge, Button, Divider, Panel, PanelHeader } from '@/components/primitives';
import type { AdminSectionLayout } from '@/features/admin/adminSectionLayout';
import { CalibrationSummaryPanel } from '@/features/admin/dashboard/CalibrationSummaryPanel';
import { CatalogSummaryPanel } from '@/features/admin/dashboard/CatalogSummaryPanel';
import { DashboardQuickLinks } from '@/features/admin/dashboard/DashboardQuickLinks';
import { HealthSummaryPanel } from '@/features/admin/dashboard/HealthSummaryPanel';
import { LogSummaryPanel } from '@/features/admin/dashboard/LogSummaryPanel';
import { AdminSectionNav } from '@/features/admin/navigation/AdminSectionNav';
import {
  readAdminDashboardSummary,
  readCalibrationSummaryCard,
  readCatalogSummaryCard,
  readHealthSummaryCard,
  readLogSummaryCard,
} from '@/features/admin/readModels/dashboard';
import { useAdminStore } from '@/stores/admin/adminStore';
import { useUiModeStore } from '@/stores/uiMode/uiModeStore';
import type { AdminSection } from '@/types/admin';

type DashboardInspectorId = 'calibration' | 'catalog' | 'health' | 'logs' | null;

type AdminDashboardScreenModel = {
  openSection: (section: AdminSection) => void;
  refreshHealth: () => void;
  returnToShopper: () => void;
  selectCard: (card: DashboardInspectorId) => void;
  selectedCard: DashboardInspectorId;
  summary: ReturnType<typeof readAdminDashboardSummary>;
};

function DashboardInspector({
  selectedCard,
  summary,
}: {
  selectedCard: DashboardInspectorId;
  summary: ReturnType<typeof readAdminDashboardSummary>;
}) {
  const selectedSummary =
    selectedCard === 'health'
      ? readHealthSummaryCard()
      : selectedCard === 'calibration'
        ? readCalibrationSummaryCard()
        : selectedCard === 'catalog'
          ? readCatalogSummaryCard()
          : selectedCard === 'logs'
            ? readLogSummaryCard()
            : null;

  return (
    <Panel tone="subtle">
      <div className="space-y-lg">
        <PanelHeader
          action={<Badge variant="muted">Detail</Badge>}
          support={summary.inspectorNote}
          title={selectedSummary?.title ?? 'Operational detail'}
        />
        <Divider />
        {selectedSummary ? (
          <div className="space-y-sm">
            <p className="type-label text-text-primary">{selectedSummary.status}</p>
            {selectedSummary.facts.map((fact) => (
              <p key={fact} className="type-body text-text-secondary">
                {fact}
              </p>
            ))}
          </div>
        ) : (
          <div className="space-y-sm">
            <p className="type-label text-text-primary">Access state: {summary.accessState}</p>
            <p className="type-body text-text-secondary">{summary.inspectorNote}</p>
            <p className="type-body text-text-secondary">
              Most urgent note: {summary.urgentSummary}
            </p>
          </div>
        )}
      </div>
    </Panel>
  );
}

function DashboardWorkspace({
  openSection,
  selectCard,
  selectedCard,
  summary,
}: Pick<AdminDashboardScreenModel, 'openSection' | 'selectCard' | 'selectedCard' | 'summary'>) {
  const healthCard = summary.cards.find((card) => card.id === 'health') ?? readHealthSummaryCard();
  const calibrationCard =
    summary.cards.find((card) => card.id === 'calibration') ?? readCalibrationSummaryCard();
  const catalogCard =
    summary.cards.find((card) => card.id === 'catalog') ?? readCatalogSummaryCard();
  const logCard = summary.cards.find((card) => card.id === 'logs') ?? readLogSummaryCard();

  return (
    <div className="space-y-lg">
      <div className="grid gap-lg xl:grid-cols-2 2xl:grid-cols-4">
        <HealthSummaryPanel
          active={selectedCard === 'health'}
          onSelect={() => selectCard('health')}
          summary={healthCard}
        />
        <CalibrationSummaryPanel
          active={selectedCard === 'calibration'}
          onOpen={() => openSection('calibration')}
          onSelect={() => selectCard('calibration')}
          summary={calibrationCard}
        />
        <CatalogSummaryPanel
          active={selectedCard === 'catalog'}
          onOpen={() => openSection('catalog')}
          onSelect={() => selectCard('catalog')}
          summary={catalogCard}
        />
        <LogSummaryPanel
          active={selectedCard === 'logs'}
          onOpen={() => openSection('logs')}
          onSelect={() => selectCard('logs')}
          summary={logCard}
        />
      </div>
      <DashboardQuickLinks onOpenSection={openSection} />
    </div>
  );
}

export function useAdminDashboardScreenModel(): AdminDashboardScreenModel {
  const [selectedCard, setSelectedCard] = useState<DashboardInspectorId>(null);
  const setMode = useUiModeStore((state) => state.setMode);
  const requestHealthRefresh = useAdminStore((state) => state.requestHealthRefresh);
  const setAccess = useAdminStore((state) => state.setAccess);
  const setActiveSection = useAdminStore((state) => state.setActiveSection);

  return {
    openSection: (section) => setActiveSection(section),
    refreshHealth: () => requestHealthRefresh(),
    returnToShopper: () => {
      setAccess('hidden');
      setActiveSection('dashboard');
      setMode('shopper');
    },
    selectCard: (card) => setSelectedCard(card),
    selectedCard,
    summary: readAdminDashboardSummary(),
  };
}

export function createAdminDashboardScreenLayout({
  openSection,
  refreshHealth,
  returnToShopper,
  selectCard,
  selectedCard,
  summary,
}: AdminDashboardScreenModel): AdminSectionLayout {
  return {
    commandBar: (
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div className="space-y-xs">
          <div className="flex flex-wrap items-center gap-sm">
            <Badge variant="accent">Operational Mode</Badge>
            <Badge variant="operational">{summary.urgentSummary}</Badge>
          </div>
          <h1 className="type-heading">Dashboard</h1>
          <p className="type-body text-text-secondary">Local device status only.</p>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <Button onClick={refreshHealth} variant="quiet">
            Refresh Health
          </Button>
          <Button onClick={returnToShopper} variant="quiet">
            Return to Shopper
          </Button>
        </div>
      </div>
    ),
    nav: (
      <AdminSectionNav
        activeSection="dashboard"
        onSelect={(section) => openSection(section)}
      />
    ),
    workspace: (
      <DashboardWorkspace
        openSection={openSection}
        selectCard={selectCard}
        selectedCard={selectedCard}
        summary={summary}
      />
    ),
    inspector: <DashboardInspector selectedCard={selectedCard} summary={summary} />,
  };
}
