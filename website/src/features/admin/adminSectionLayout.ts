import type { ReactNode } from 'react';

export type AdminSectionLayout = {
  commandBar: ReactNode;
  inspector: ReactNode | null;
  nav: ReactNode;
  workspace: ReactNode;
};
