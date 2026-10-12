import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Dropdown, PRIORITIES, STATUSES } from './Dropdown';
import type { Priority, Status, Ticket, TicketUpdate } from '../types';

export function TicketRow({ ticket, disabled, onConfirm }: {
  ticket: Ticket;
  disabled: boolean;
  onConfirm: (update: TicketUpdate) => Promise<boolean>;
}) {
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [status, setStatus] = useState<Status>(ticket.status);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const changed = priority !== ticket.priority || status !== ticket.status;

  useEffect(() => {
    setPriority(ticket.priority);
    setStatus(ticket.status);
  }, [ticket.priority, ticket.status]);

  useLayoutEffect(() => {
    const description = descriptionRef.current;
    if (!description || expanded) return;
    const measure = () => {
      const fullText = description.cloneNode(true) as HTMLParagraphElement;
      fullText.removeAttribute('id');
      fullText.classList.add('expanded');
      Object.assign(fullText.style, {
        position: 'fixed',
        top: '0',
        left: '-10000px',
        width: `${description.clientWidth}px`,
        height: 'auto',
        visibility: 'hidden',
        pointerEvents: 'none',
      });
      document.body.appendChild(fullText);
      const fullHeight = fullText.getBoundingClientRect().height;
      fullText.remove();
      setCanExpand(fullHeight > description.clientHeight + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(description.parentElement ?? description);
    return () => observer.disconnect();
  }, [ticket.description, expanded]);

  async function confirm() {
    const update: TicketUpdate = {};
    if (priority !== ticket.priority) update.priority = priority;
    if (status !== ticket.status) update.status = status;
    setSaving(true);
    const saved = await onConfirm(update);
    if (!saved) {
      setSaving(false);
      return;
    }
    setSaving(false);
  }

  function cancel() {
    setPriority(ticket.priority);
    setStatus(ticket.status);
  }

  return <article className="ticket">
    <div className="ticket-main">
      <div className="ticket-heading"><h3>{ticket.title}</h3><time dateTime={ticket.created_at}>Created {new Date(ticket.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time></div>
      {ticket.description && <>
        <p ref={descriptionRef} id={`ticket-description-${ticket.id}`} className={`ticket-description${expanded ? ' expanded' : ''}`}>{ticket.description}</p>
        {canExpand && <button className="description-toggle" type="button" aria-expanded={expanded} aria-controls={`ticket-description-${ticket.id}`} onClick={() => setExpanded(value => !value)}>{expanded ? 'Show less' : 'Show more'}</button>}
      </>}
    </div>
    <div className="ticket-edit">
      <label className="edit-field">Priority<Dropdown label={`Priority for ${ticket.title}`} value={priority} options={PRIORITIES} disabled={disabled || saving} onChange={value => setPriority(value as Priority)} /></label>
      <label className="edit-field">Status<Dropdown label={`Status for ${ticket.title}`} value={status} options={STATUSES} disabled={disabled || saving} onChange={value => setStatus(value as Status)} /></label>
      {changed && <div className="edit-actions">
        <button className="cancel-edit" type="button" disabled={saving} onClick={cancel}>Cancel</button>
        <button className="confirm-edit" type="button" disabled={saving || disabled} onClick={() => void confirm()}>{saving ? 'Saving…' : 'Confirm'}</button>
      </div>}
    </div>
  </article>;
}
