export type Status = 'open' | 'in_progress' | 'closed';
export type Priority = 'low' | 'medium' | 'high';
export type Ticket = {
  id: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  created_at: string;
};
export type TicketPage = { results: Ticket[]; page: number; limit: number; total: number; pages: number };
export type DropdownOption = { label: string; value: string };
export type NewTicket = Pick<Ticket, 'title' | 'description' | 'priority'>;
export type TicketUpdate = Partial<Pick<Ticket, 'status' | 'priority'>>;
