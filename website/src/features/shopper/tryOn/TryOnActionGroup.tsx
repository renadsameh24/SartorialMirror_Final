import { Button } from '@/components/primitives';

type TryOnActionGroupProps = {
  onBackToCatalog: () => void;
  onEndSession: () => void;
  onFitDetails: () => void;
};

export function TryOnActionGroup({
  onBackToCatalog,
  onEndSession,
  onFitDetails,
}: TryOnActionGroupProps) {
  return (
    <div className="flex flex-wrap gap-sm">
      <Button onClick={onFitDetails} variant="primary">
        Review Fit Notes
      </Button>
      <Button onClick={onBackToCatalog} variant="secondary">
        Return to Collection
      </Button>
      <Button onClick={onEndSession} variant="quiet">
        End Session
      </Button>
    </div>
  );
}
