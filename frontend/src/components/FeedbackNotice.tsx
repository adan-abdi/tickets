import { useEffect } from 'react';

export function FeedbackNotice({ error, success, retryable, ticketCount, onRetry, onDismiss }: {
  error: string;
  success: string;
  retryable: boolean;
  ticketCount: number;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const message = error || success;
  useEffect(() => {
    if (!message || (error && retryable && ticketCount === 0)) return;
    const timer = window.setTimeout(onDismiss, error ? 6000 : 4000);
    return () => window.clearTimeout(timer);
  }, [message, error, retryable, ticketCount, onDismiss]);

  if (!message || (error && retryable && ticketCount === 0)) return null;

  return <div className={`notice ${error ? 'notice-error' : 'notice-success'}`} role={error ? 'alert' : 'status'}>
    <span className="notice-icon" aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="none" focusable="false">
        <circle cx="10" cy="10" r="7.25" />
        {error ? <path d="M10 6v4.5m0 3h.01" /> : <path d="m6.4 10.1 2.35 2.35 4.9-5" />}
      </svg>
    </span>
    <span>{message}</span>
    {error && retryable && <button className="notice-action" type="button" onClick={onRetry}>Retry</button>}
    <button className="notice-close" type="button" aria-label="Dismiss message" onClick={onDismiss}>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8m0-8-8 8" /></svg>
    </button>
  </div>;
}
