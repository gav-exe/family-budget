export default function StatCard({ label, value, icon, color = 'bg-teal text-white', sub }) {
  return (
    <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
      <div className="flex items-center gap-2 mb-2">
        {icon && (
          <span className={`w-8 h-8 rounded-lg border-2 border-ink hard-shadow-sm flex items-center justify-center shrink-0 ${color}`}>
            {icon}
          </span>
        )}
        <span className="text-ink/60 text-sm font-medium">{label}</span>
      </div>
      <div className="text-2xl font-display font-extrabold text-ink">{value}</div>
      {sub && <div className="text-xs text-ink/40 mt-1">{sub}</div>}
    </div>
  );
}
