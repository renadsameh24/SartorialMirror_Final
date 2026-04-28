import { useEffect, useMemo, useRef, useState } from 'react';

import { Badge, Button, Panel, PanelHeader } from '@/components/primitives';

export const ADMIN_PIN_LENGTH = 6;
export const LOCAL_ADMIN_PIN = '246810';

type AdminPinEntryProps = {
  blocked?: boolean;
  onCancel: () => void;
  onUnlock: (pin: string) => boolean;
  support: string;
};

function maskCell(value?: string) {
  return value ? '•' : '';
}

export function AdminPinEntry({
  blocked = false,
  onCancel,
  onUnlock,
  support,
}: AdminPinEntryProps) {
  const [digits, setDigits] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!blocked) {
      inputRef.current?.focus();
    }
  }, [blocked]);

  const cells = useMemo(
    () =>
      Array.from({ length: ADMIN_PIN_LENGTH }, (_, index) => ({
        id: `pin-cell-${index + 1}`,
        value: maskCell(digits[index]),
      })),
    [digits],
  );

  function sanitize(value: string) {
    return value.replace(/\D/g, '').slice(0, ADMIN_PIN_LENGTH);
  }

  function submit() {
    if (blocked || digits.length !== ADMIN_PIN_LENGTH) {
      return;
    }

    const recognized = onUnlock(digits);

    if (!recognized) {
      setDigits('');
      setErrorMessage('PIN not recognized. Try again or return to shopper mode.');
      inputRef.current?.focus();
      return;
    }

    setErrorMessage(null);
  }

  function appendDigit(nextDigit: string) {
    if (blocked) {
      return;
    }

    setErrorMessage(null);
    setDigits((current) => sanitize(`${current}${nextDigit}`));
  }

  function removeDigit() {
    if (blocked) {
      return;
    }

    setErrorMessage(null);
    setDigits((current) => current.slice(0, -1));
  }

  return (
    <Panel tone="strong" className="mx-auto max-w-3xl">
      <form
        className="space-y-xl"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="space-y-md">
          <PanelHeader
            action={<Badge variant={blocked ? 'destructive' : 'accent'}>Staff Access</Badge>}
            support={support}
            title="Staff access"
          />
          {errorMessage ? (
            <p className="type-body text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <input
          ref={inputRef}
          aria-label="Admin PIN"
          autoComplete="off"
          className="sr-only"
          disabled={blocked}
          inputMode="numeric"
          maxLength={ADMIN_PIN_LENGTH}
          onChange={(event) => {
            setErrorMessage(null);
            setDigits(sanitize(event.target.value));
          }}
          onBlur={() => {
            setInputFocused(false);
          }}
          onFocus={() => {
            setInputFocused(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submit();
            }
          }}
          type="password"
          value={digits}
        />

        <div
          aria-label="PIN cells"
          className={[
            'grid grid-cols-6 gap-sm rounded-panel',
            inputFocused ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface-canvas' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {cells.map((cell, index) => (
            <div
              key={cell.id}
              className="flex min-h-[72px] items-center justify-center rounded-panel border border-border-strong bg-surface-overlay text-[32px] text-text-primary"
            >
              <span aria-hidden="true">{cell.value}</span>
              <span className="sr-only">
                {digits[index] ? `Digit ${index + 1} entered` : `Digit ${index + 1} empty`}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-sm" aria-label="Numeric keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((digit) => (
            <Button
              key={digit}
              disabled={blocked || digits.length >= ADMIN_PIN_LENGTH}
              onClick={() => appendDigit(digit)}
              type="button"
              variant="secondary"
            >
              {digit}
            </Button>
          ))}
          <Button
            disabled={blocked || digits.length === 0}
            onClick={removeDigit}
            type="button"
            variant="quiet"
          >
            Backspace
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-sm">
          <Button onClick={onCancel} type="button" variant="quiet">
            Cancel
          </Button>
          <Button
            disabled={blocked || digits.length !== ADMIN_PIN_LENGTH}
            type="submit"
            variant="primary"
          >
            Unlock Admin
          </Button>
        </div>
      </form>
    </Panel>
  );
}
