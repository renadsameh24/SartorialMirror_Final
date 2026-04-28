import type { ReactNode } from 'react';

export type ShopperPhaseLayout = {
  band: ReactNode;
  stage: ReactNode;
  rail: ReactNode;
  overlayTop: ReactNode | null;
  overlayBottom: ReactNode | null;
};
