// Availability shown WITHOUT color: a filled black dot = available,
// a hollow/outlined dot = checked out. Satisfies the B&W constraint
// while staying legible (WCAG-friendly even in grayscale).
export default function AvailabilityBadge({ status, availableCopies, size = 'md' }) {
  const available = status === 'AVAILABLE' || availableCopies > 0;
  const pad = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';
  return (
    <span
      className={
        `inline-flex items-center gap-2 rounded-full border font-medium uppercase tracking-wide ${pad} ` +
        (available
          ? 'border-ink-800 bg-ink-900 text-paper-pure'
          : 'border-ink-300 bg-paper-card text-ink-500')
      }
    >
      <span
        className={
          'inline-block h-2 w-2 rounded-full ' +
          (available ? 'bg-paper-pure' : 'border border-ink-400')
        }
        aria-hidden="true"
      />
      {available ? 'Available' : 'Checked out'}
    </span>
  );
}
