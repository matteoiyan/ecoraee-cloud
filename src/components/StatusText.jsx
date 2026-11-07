import { pretty, statusClass } from '../utils/format.js';

export default function StatusText({ value, tone = 'neutral' }) {
  const color = tone === 'auto' ? statusClass(value) : tone;
  return <span className={`status-text ${color}`}>{pretty(value)}</span>;
}
