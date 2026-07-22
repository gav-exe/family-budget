export default function StatCard({ label, value, icon, color = 'text-slate-900', sub }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className={`${color}`}>{icon}</span>}
        <span className="text-slate-500 text-sm font-medium">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}
