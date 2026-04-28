export const SHELL_MODES = ['shopper', 'admin'] as const;

export type ShellMode = (typeof SHELL_MODES)[number];

export const shellModeLabel: Record<ShellMode, string> = {
  shopper: 'Shopper',
  admin: 'Admin',
};
