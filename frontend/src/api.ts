import type { NewTicket, Ticket, TicketPage, TicketUpdate } from './types';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, init);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? 'The request failed. Please try again.');
  return payload as T;
}

export async function fetchTickets(status: string, priority: string, page: number): Promise<TicketPage> {
  const params = new URLSearchParams({ page: String(page), limit: '10' });
  if (status) params.set('status', status);
  if (priority) params.set('priority', priority);
  return request<TicketPage>(`/tickets?${params}`);
}

export function createTicket(ticket: NewTicket): Promise<unknown> {
  return request<unknown>('/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticket),
  });
}

export function updateTicket(id: number, update: TicketUpdate): Promise<Ticket> {
  return request<Ticket>(`/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
}
