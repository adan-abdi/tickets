import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createTicket as postTicket, fetchTickets, updateTicket } from './api';
import { FeedbackNotice } from './components/FeedbackNotice';
import { TicketForm } from './components/TicketForm';
import { TicketList } from './components/TicketList';
import type { NewTicket, Ticket, TicketUpdate } from './types';
import './style.css';

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [retryable, setRetryable] = useState(false);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [updatingTicket, setUpdatingTicket] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const load = useCallback(async (requestedPage = page) => {
    setLoading(true);
    try {
      let result = await fetchTickets(status, priority, requestedPage);
      let actualPage = requestedPage;
      if (requestedPage > result.pages) {
        actualPage = Math.max(1, result.pages);
        result = await fetchTickets(status, priority, actualPage);
      }
      setTickets(result.results);
      setPage(actualPage);
      setPages(result.pages);
      setTotal(result.total);
      setError('');
      setRetryable(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not connect to the ticket service. Please try again.');
      setRetryable(true);
    } finally {
      setLoading(false);
    }
  }, [page, priority, status]);

  useEffect(() => { void load(page); }, [load, page]);
  useEffect(() => {
    if (createOpen && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [createOpen]);

  async function create(ticket: NewTicket): Promise<boolean> {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await postTicket(ticket);
      setSuccess('Ticket created successfully.');
      setPage(1);
      await load(1);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create ticket. Please try again.');
      setRetryable(false);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function update(id: number, changes: TicketUpdate): Promise<boolean> {
    setUpdatingTicket(id);
    setError('');
    setSuccess('');
    try {
      await updateTicket(id, changes);
      setSuccess('Ticket updated successfully.');
      await load();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update ticket. Please try again.');
      setRetryable(false);
      return false;
    } finally {
      setUpdatingTicket(null);
    }
  }

  function filter(nextStatus: string, nextPriority: string) {
    setStatus(nextStatus);
    setPriority(nextPriority);
    setPage(1);
  }

  return <main className="shell">
    <header className="page-header">
      <div>
        <h1>Ticket Tracker</h1>
        <p className="subheading">Keep customer issues moving.</p>
      </div>
      <button type="button" className="primary-button new-ticket-button" onClick={() => setCreateOpen(true)}>New ticket <span aria-hidden="true">+</span></button>
    </header>
    <FeedbackNotice
      error={error}
      success={success}
      retryable={retryable}
      ticketCount={tickets.length}
      onRetry={() => void load()}
      onDismiss={() => { setError(''); setSuccess(''); setRetryable(false); }}
    />
    <TicketList
      tickets={tickets}
      status={status}
      priority={priority}
      page={page}
      pages={pages}
      total={total}
      loading={loading}
      error={error}
      retryable={retryable}
      updatingTicket={updatingTicket}
      onFilter={filter}
      onRetry={() => void load()}
      onPageChange={nextPage => setPage(nextPage)}
      onUpdate={update}
    />
    <dialog
      ref={dialogRef}
      className="create-dialog"
      aria-labelledby="new-ticket-title"
      onClose={() => setCreateOpen(false)}
      onClick={event => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}
    >
      {createOpen && <TicketForm busy={busy} onCreate={create} onClose={() => dialogRef.current?.close()} />}
    </dialog>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
