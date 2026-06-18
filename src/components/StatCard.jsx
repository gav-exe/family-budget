export default function StatCard({ label, value, icon, color = 'text-white', sub }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className={`${color}`}>{icon}</span>}
        <span className="text-slate-400 text-sm font-medium">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}
