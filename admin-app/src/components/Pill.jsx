// Grayscale status pill. Emphasis (filled/outlined) carries meaning
// instead of color, per the strict black & white constraint.
const STYLES = {
  strong: 'border-ink-900 bg-ink-900 text-white',
  soft: 'border-ink-300 bg-white text-ink-600',
  outline: 'border-ink-800 bg-white text-ink-900',
};

const MAP = {
  AVAILABLE: 'strong', ACTIVE: 'strong', PAID: 'strong', ADMIN: 'strong',
  CHECKED_OUT: 'soft', EXPIRED: 'soft', PENDING: 'outline', SUSPENDED: 'outline',
  UNPAID: 'outline', FRONT_DESK: 'soft',
};

export default function Pill({ value, children }) {
  const tone = STYLES[MAP[value] || 'soft'];
  const label = children ?? (value ? value.replace(/_/g, ' ').toLowerCase() : '');
  return (
    <span className={`pill ${tone}`}>
      <span className={'inline-block h-1.5 w-1.5 rounded-full ' +
        (MAP[value] === 'strong' ? 'bg-white' : 'border border-ink-500')} />
      <span className="capitalize">{label}</span>
    </span>
  );
}
