import { Dropdown, PRIORITY_FILTERS, STATUS_FILTERS } from './Dropdown';
import { EmptyState, LoadErrorState, LoadingState } from './TicketStates';
import { TicketRow } from './TicketRow';
import type { Ticket, TicketUpdate } from '../types';

export function TicketList({ tickets, status, priority, page, pages, total, loading, error, retryable, updatingTicket, onFilter, onRetry, onPageChange, onUpdate }: {
  tickets: Ticket[];
  status: string;
  priority: string;
  page: number;
  pages: number;
  total: number;
  loading: boolean;
  error: string;
  retryable: boolean;
  updatingTicket: number | null;
  onFilter: (status: string, priority: string) => void;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onUpdate: (id: number, update: TicketUpdate) => Promise<boolean>;
}) {
  const first = total === 0 ? 0 : (page - 1) * 10 + 1;
  const last = Math.min(page * 10, total);

  return <section className="list-section" aria-labelledby="tickets-title">
    <div className="list-heading">
      <div><h2 id="tickets-title">Tickets</h2><p>Track and update your support queue.</p></div>
      <div className="filters">
        <label className="filter"><span>Status</span><Dropdown label="Filter tickets by status" value={status} options={STATUS_FILTERS} onChange={value => onFilter(value, priority)} /></label>
        <label className="filter"><span>Priority</span><Dropdown label="Filter tickets by priority" value={priority} options={PRIORITY_FILTERS} onChange={value => onFilter(status, value)} /></label>
      </div>
    </div>
    <div className="tickets" aria-live="polite">
      {loading ? <LoadingState />
        : error && retryable && tickets.length === 0 ? <LoadErrorState message={error} onRetry={onRetry} />
          : tickets.length === 0 ? <EmptyState hasFilter={Boolean(status || priority)} onClear={() => onFilter('', '')} />
            : tickets.map(ticket => <TicketRow
              key={ticket.id}
              ticket={ticket}
              disabled={updatingTicket === ticket.id}
              onConfirm={update => onUpdate(ticket.id, update)}
            />)}
    </div>
    {total > 0 && <nav className="pagination" aria-label="Ticket pages">
      <span>Showing {first}–{last} of {total}</span>
      <div className="pagination-controls">
        <button type="button" className="page-button" disabled={loading || page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button type="button" className="page-button" disabled={loading || page >= pages} onClick={() => onPageChange(page + 1)}>Next</button>
      </div>
    </nav>}
  </section>;
}
