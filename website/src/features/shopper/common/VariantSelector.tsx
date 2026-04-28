type VariantOption = {
  disabled?: boolean;
  supportingLabel?: string;
  swatchHex?: string;
  value: string;
  label: string;
};

type VariantSelectorProps = {
  label: string;
  onChange: (value: string) => void;
  options: VariantOption[];
  value?: string;
};

export function VariantSelector({
  label,
  onChange,
  options,
  value,
}: VariantSelectorProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-sm">
      <div className="flex items-center justify-between gap-md">
        <p className="shopper-kicker text-text-primary">{label}</p>
        {value ? <p className="type-label text-text-secondary">{value}</p> : null}
      </div>
      <div className="flex flex-wrap gap-sm" role="group" aria-label={label}>
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <button
              aria-pressed={selected}
              className={[
                'shopper-selector-chip focus-ring inline-flex min-h-control items-center gap-sm rounded-control border px-md py-sm text-label transition-all duration-standard',
                selected
                  ? 'border-accent bg-[linear-gradient(135deg,rgba(230,217,191,0.14),rgba(230,217,191,0.05))] text-text-primary shadow-[0_14px_30px_rgba(0,0,0,0.16)]'
                  : 'border-border-subtle bg-surface-ghost text-text-secondary hover:border-border hover:bg-[rgba(255,255,255,0.03)]',
                option.disabled ? 'cursor-not-allowed opacity-50' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={option.disabled}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.swatchHex ? (
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 rounded-full border border-border-subtle"
                  style={{ backgroundColor: option.swatchHex }}
                />
              ) : null}
              <span>{option.label}</span>
              {option.supportingLabel ? (
                <span className="text-text-secondary">{option.supportingLabel}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
