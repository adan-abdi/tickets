export function LoadingState() {
  return <div className="loading-state" role="status" aria-label="Loading tickets">
    <div className="loading-indicator">
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7.5" /><path d="M10 2.5a7.5 7.5 0 0 1 7.5 7.5" /></svg>
      <span>Loading tickets</span>
    </div>
    <div className="loading-list">
      {[0, 1, 2].map(item => <div className="skeleton-ticket" key={item}>
        <div className="skeleton-copy"><span className="skeleton skeleton-title" /><span className="skeleton skeleton-description" /><span className="skeleton skeleton-date" /></div>
        <span className="skeleton skeleton-status" />
      </div>)}
    </div>
  </div>;
}

export function LoadErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="load-error" role="alert">
    <span className="load-error-icon" aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.25" /><path d="M10 6v4.5m0 3h.01" /></svg>
    </span>
    <h3>Tickets didn’t load</h3>
    <p>{message}</p>
    <button className="secondary-button" type="button" onClick={onRetry}>Try again</button>
  </div>;
}

export function EmptyState({ hasFilter, onClear }: { hasFilter: boolean; onClear: () => void }) {
  return <div className="empty-state">
    <span className="empty-icon" aria-hidden="true">
      <svg viewBox="0 0 40 40"><path d="M8 12.5h24v19H8zM13 12.5V9h14v3.5M14 19h12M14 24h8" /></svg>
    </span>
    <h3>{hasFilter ? 'No tickets match these filters' : 'Your queue is clear'}</h3>
    <p>{hasFilter ? 'Try changing a filter or show every ticket.' : 'New support requests will show up here once they’re created.'}</p>
    {hasFilter && <button className="secondary-button" type="button" onClick={onClear}>Show all tickets</button>}
  </div>;
}
