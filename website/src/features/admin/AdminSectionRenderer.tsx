import type { AdminSectionLayout } from '@/features/admin/adminSectionLayout';
import { createAdminAccessScreenLayout, useAdminAccessScreenModel } from '@/screens/admin/AccessScreen';
import { createAdminCalibrationScreenLayout, useAdminCalibrationScreenModel } from '@/screens/admin/CalibrationScreen';
import { createAdminCatalogScreenLayout, useAdminCatalogScreenModel } from '@/screens/admin/CatalogScreen';
import { createAdminDashboardScreenLayout, useAdminDashboardScreenModel } from '@/screens/admin/DashboardScreen';
import { createAdminLogsScreenLayout, useAdminLogsScreenModel } from '@/screens/admin/LogsScreen';
import { readAdminAccessGate } from '@/features/admin/readModels/access';
import { selectAdminState } from '@/stores/admin/selectors';
import { useAdminStore } from '@/stores/admin/adminStore';

export function AdminSectionRenderer(): AdminSectionLayout {
  const adminState = useAdminStore(selectAdminState);
  const accessGate = readAdminAccessGate();
  const accessModel = useAdminAccessScreenModel();
  const dashboardModel = useAdminDashboardScreenModel();
  const calibrationModel = useAdminCalibrationScreenModel();
  const catalogModel = useAdminCatalogScreenModel();
  const logsModel = useAdminLogsScreenModel();

  if (accessGate.state !== 'granted') {
    return createAdminAccessScreenLayout(accessModel);
  }

  switch (adminState.activeSection) {
    case 'dashboard':
      return createAdminDashboardScreenLayout(dashboardModel);
    case 'calibration':
      return createAdminCalibrationScreenLayout(calibrationModel);
    case 'logs':
      return createAdminLogsScreenLayout(logsModel);
    case 'catalog':
      return createAdminCatalogScreenLayout(catalogModel);
    default:
      return createAdminDashboardScreenLayout(dashboardModel);
  }
}
