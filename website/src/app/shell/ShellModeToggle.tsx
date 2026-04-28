import { Button } from '@/components/primitives';
import {
  SHELL_MODES,
  shellModeLabel,
  type ShellMode,
} from '@/app/shell/shellMode';

type ShellModeToggleProps = {
  currentMode: ShellMode;
  onModeChange: (mode: ShellMode) => void;
};

export function ShellModeToggle({
  currentMode,
  onModeChange,
}: ShellModeToggleProps) {
  return (
    <div className="flex flex-wrap items-center gap-sm">
      <span className="type-label text-text-secondary">Shell mode</span>
      {SHELL_MODES.map((mode) => {
        const active = mode === currentMode;

        return (
          <Button
            key={mode}
            aria-pressed={active}
            onClick={() => onModeChange(mode)}
            variant={active ? 'primary' : 'secondary'}
          >
            {shellModeLabel[mode]} Mode
          </Button>
        );
      })}
    </div>
  );
}
