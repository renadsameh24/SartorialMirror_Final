type DetectionReadinessChecklistProps = {
  state: 'inactive' | 'waitingForUser' | 'positioning' | 'readyToAdvance';
};

const CHECKLIST_ITEMS = [
  'Step into view',
  'Square your shoulders to the display',
  'Hold position while detection settles.',
] as const;

function itemState(
  item: (typeof CHECKLIST_ITEMS)[number],
  state: DetectionReadinessChecklistProps['state'],
) {
  if (state === 'readyToAdvance') {
    return 'complete';
  }

  if (state === 'waitingForUser') {
    return item === 'Step into view' ? 'active' : 'idle';
  }

  if (state === 'positioning') {
    return item === 'Step into view' ? 'complete' : 'active';
  }

  return 'idle';
}

export function DetectionReadinessChecklist({
  state,
}: DetectionReadinessChecklistProps) {
  return (
    <ol className="space-y-md">
      {CHECKLIST_ITEMS.map((item) => {
        const status = itemState(item, state);

        return (
          <li
            className="flex items-center gap-md"
            data-state={status}
            key={item}
          >
            <span
              aria-hidden="true"
              className={[
                'inline-flex h-3 w-3 rounded-full border',
                status === 'complete'
                  ? 'border-accent bg-accent'
                  : status === 'active'
                    ? 'border-accent bg-surface-overlay'
                    : 'border-border-subtle bg-transparent',
              ]
                .filter(Boolean)
                .join(' ')}
            />
            <span className="type-body text-text-primary">{item}</span>
          </li>
        );
      })}
    </ol>
  );
}
