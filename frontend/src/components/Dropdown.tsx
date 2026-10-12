import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { DropdownOption } from '../types';

export const STATUS_FILTERS: DropdownOption[] = [
  { label: 'All statuses', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Closed', value: 'closed' },
];
export const STATUSES = STATUS_FILTERS.slice(1);
export const PRIORITIES: DropdownOption[] = [
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
  { label: 'High', value: 'high' },
];
export const PRIORITY_FILTERS: DropdownOption[] = [
  { label: 'All priorities', value: '' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export function Dropdown({ label, value, options, onChange, disabled = false }: {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = options.find(option => option.value === value) ?? options[0];

  useEffect(() => {
    function closeOutside(event: MouseEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      triggerRef.current?.focus();
    }
    if (open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      const options = rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
      if (!options?.length) return;
      const index = Array.from(options).indexOf(document.activeElement as HTMLButtonElement);
      const next = event.key === 'ArrowDown' ? (index + 1) % options.length : (index <= 0 ? options.length - 1 : index - 1);
      options[next].focus();
    }
  }

  return <div className="dropdown" ref={rootRef} onKeyDown={handleKeyDown}>
    <button
      ref={triggerRef}
      className="flex h-9 w-full items-center justify-between gap-3 rounded-[8px] border-[1.5px] border-[#d9d6d2] bg-white px-[10px] text-left text-[12px] font-medium text-[#35423d] transition hover:border-[#f7a286] hover:bg-[#fffaf7] focus-visible:border-[#F8531F] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#fff0e9] disabled:cursor-wait disabled:bg-[#f8faf9] disabled:text-[#87938e]"
      type="button"
      aria-label={label}
      aria-haspopup="listbox"
      aria-expanded={open}
      disabled={disabled}
      onClick={() => setOpen(value => !value)}
      onKeyDown={event => {
        if (!open && (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          setOpen(true);
        }
      }}
    >
      <span>{current.label}</span>
      <svg className={`size-[14px] shrink-0 fill-none stroke-[#78867f] stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round] transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
    </button>
    {open && <div className="dropdown-menu-in absolute left-0 right-0 top-[calc(100%+5px)] z-50 rounded-[8px] border-[1.5px] border-[#d9d6d2] bg-white p-1 shadow-[0_9px_24px_#23372f18]" role="listbox" aria-label={label}>
      {options.map(option => <button
        key={option.value}
        type="button"
        role="option"
        aria-selected={option.value === value}
        className="flex min-h-[33px] w-full items-center justify-between gap-[10px] rounded-[8px] border-[1.5px] border-transparent bg-transparent px-2 text-left text-[12px] text-[#4c5a54] hover:bg-[#fff3ed] focus-visible:bg-[#fff3ed] focus-visible:outline-none aria-selected:font-semibold aria-selected:text-[#D94316]"
        onClick={() => { onChange(option.value); setOpen(false); triggerRef.current?.focus(); }}
      >
        <span>{option.label}</span>
        {option.value === value && <svg className="size-[14px] shrink-0 fill-none stroke-[#F8531F] stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7" /></svg>}
      </button>)}
    </div>}
  </div>;
}
