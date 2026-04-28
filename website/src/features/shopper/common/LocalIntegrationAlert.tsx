type LocalIntegrationAlertProps = {
  body: string;
  title: string;
};

export function LocalIntegrationAlert({
  body,
  title,
}: LocalIntegrationAlertProps) {
  return (
    <div
      className="max-w-2xl rounded-lg border border-[rgba(210,176,129,0.26)] bg-[rgba(12,10,11,0.76)] px-lg py-md backdrop-blur-sm"
      role="alert"
    >
      <p className="shopper-kicker text-accent">Connection issue</p>
      <div className="mt-sm space-y-xs">
        <p className="type-heading text-[1.05rem]">{title}</p>
        <p className="type-body text-text-secondary">{body}</p>
      </div>
    </div>
  );
}
