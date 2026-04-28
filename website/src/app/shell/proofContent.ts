import type { ShellMode } from '@/app/shell/shellMode';

type ShopperProofContent = {
  bandEyebrow: string;
  bandHeading: string;
  bandBody: string;
  stageHeading: string;
  stageBody: string;
  contextLabel: string;
  contextBody: string;
  topOverlay: string;
  bottomOverlay: string;
  privacyBadge: string;
};

type AdminProofContent = {
  bandEyebrow: string;
  bandHeading: string;
  bandBody: string;
  navLabel: string;
  navBody: string;
  workspaceHeading: string;
  workspaceBody: string;
  inspectorLabel: string;
  inspectorBody: string;
  commandBadge: string;
};

export const shopperProofContent: ShopperProofContent = {
  bandEyebrow: 'Shopper Shell',
  bandHeading: 'Protected kiosk frame.',
  bandBody:
    'Shell and layout only. Live try-on content arrives in later phases.',
  stageHeading: 'Stage Reserved',
  stageBody:
    'Shell and layout only. Live try-on content arrives in later phases.',
  contextLabel: 'Context Rail',
  contextBody:
    'Secondary context and future support surfaces stay at the edge.',
  topOverlay: 'Top Overlay Lane',
  bottomOverlay: 'Bottom Overlay Lane',
  privacyBadge: 'Local Processing',
};

export const adminProofContent: AdminProofContent = {
  bandEyebrow: 'Admin Shell',
  bandHeading: 'Operational shell frame.',
  bandBody:
    'Operational layout only. Tools and system workflows arrive in later phases.',
  navLabel: 'Navigation Rail',
  navBody: 'Structural orientation only.',
  workspaceHeading: 'Admin Shell',
  workspaceBody:
    'Operational layout only. Tools and system workflows arrive in later phases.',
  inspectorLabel: 'Inspector Rail',
  inspectorBody:
    'Secondary operational detail stays separate from the workspace.',
  commandBadge: 'Operational Mode',
};

export const destructiveShellDemoConfirmation =
  'Reset Preview: Clears shell demo selections only.';

export function getProofContent(mode: ShellMode) {
  return mode === 'shopper' ? shopperProofContent : adminProofContent;
}
