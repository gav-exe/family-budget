export default function ProgressBar({ value, max, color = 'bg-green-500', height = 'h-2.5' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className={`w-full bg-slate-700 rounded-full ${height} overflow-hidden`}>
      <div
        className={`${color} ${height} rounded-full progress-bar`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
