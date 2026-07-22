export default function ProgressBar({ value, max, color = 'bg-teal', height = 'h-2.5' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className={`w-full bg-white border-2 border-ink rounded-full ${height} overflow-hidden`}>
      <div
        className={`${color} h-full rounded-full progress-bar`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
