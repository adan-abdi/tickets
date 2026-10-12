import { useState, type FormEvent } from 'react';
import { Dropdown, PRIORITIES } from './Dropdown';
import type { NewTicket, Priority } from '../types';

export function TicketForm({ busy, onCreate, onClose }: {
  busy: boolean;
  onCreate: (ticket: NewTicket) => Promise<boolean>;
  onClose: () => void;
}) {
  const [priority, setPriority] = useState<Priority>('medium');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const created = await onCreate({
      title: String(form.get('title') ?? ''),
      description: String(form.get('description') ?? ''),
      priority,
    });
    if (created) {
      formElement.reset();
      setPriority('medium');
      onClose();
    }
  }

  return <section className="dialog-card" aria-labelledby="new-ticket-title">
    <div className="dialog-heading">
      <div><h2 id="new-ticket-title">New ticket</h2><p>Share the issue and we’ll get it moving.</p></div>
      <button className="dialog-close" type="button" aria-label="Close dialog" onClick={onClose}>×</button>
    </div>
    <form className="ticket-form" onSubmit={submit}>
      <label className="field">Title<input name="title" required maxLength={200} placeholder="What needs attention?" autoFocus /></label>
      <label className="field">Description<textarea name="description" rows={3} placeholder="Add a few helpful details (optional)" /></label>
      <div className="form-bottom">
        <label className="field priority-field">Priority<Dropdown label="Priority" value={priority} options={PRIORITIES} onChange={value => setPriority(value as Priority)} disabled={busy} /></label>
        <button className="primary-button" disabled={busy}>
          {busy ? <><span className="spinner" aria-hidden="true" />Creating ticket</> : <>Create ticket <span aria-hidden="true">→</span></>}
        </button>
      </div>
    </form>
  </section>;
}
