import { useBudget, getPersonTotals, getDebtStats } from '../store';
import StatCard from './StatCard';
import ProgressBar from './ProgressBar';
import { DollarSign, TrendingDown, TrendingUp, Wallet, CreditCard, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const fmt = v => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function Dashboard() {
  const { state } = useBudget();
  const gavinTotals = getPersonTotals(state.gavin);
  const hazelTotals = getPersonTotals(state.hazel);
  const debtStats = getDebtStats(state.debts);
  const subTotal = state.subscriptions.filter(s => s.status === 'Active').reduce((s, sub) => s + (Number(sub.cost) || 0), 0);

  const householdIncome = gavinTotals.totalIncome + hazelTotals.totalIncome;
  const householdExpenses = gavinTotals.totalExpenses + hazelTotals.totalExpenses;
  const householdAvailable = gavinTotals.available + hazelTotals.available;

  const activeDebts = state.debts.filter(d => d.currentBalance > 0);
  const paidDebts = state.debts.filter(d => d.currentBalance <= 0);

  const debtChartData = activeDebts.map(d => ({ name: d.name, value: d.currentBalance }));

  const barData = [
    { name: 'Gavin', income: gavinTotals.totalIncome, expenses: gavinTotals.totalExpenses },
    { name: 'Hazel', income: hazelTotals.totalIncome, expenses: hazelTotals.totalExpenses },
  ];

  const snowballOrder = [...activeDebts].sort((a, b) => a.currentBalance - b.currentBalance);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Household Income"
          value={fmt(householdIncome)}
          icon={<DollarSign size={18} />}
          color="text-green-600"
          sub="Combined monthly"
        />
        <StatCard
          label="Total Expenses"
          value={fmt(householdExpenses)}
          icon={<Wallet size={18} />}
          color="text-amber-600"
          sub="Bills + minimums"
        />
        <StatCard
          label="Debt Attack"
          value={fmt(householdAvailable)}
          icon={<Zap size={18} />}
          color="text-cyan-600"
          sub="Available extra"
        />
        <StatCard
          label="Total Debt"
          value={fmt(debtStats.totalCurrent)}
          icon={<CreditCard size={18} />}
          color="text-red-500"
          sub={`${(debtStats.pctPaid * 100).toFixed(1)}% paid off`}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
        <h3 className="text-lg font-semibold mb-3">Overall Debt Progress</h3>
        <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
          <span>{fmt(debtStats.totalPaid)} paid</span>
          <span>{fmt(debtStats.totalOriginal)} total</span>
        </div>
        <ProgressBar value={debtStats.totalPaid} max={debtStats.totalOriginal} color="bg-green-500" height="h-4" />
        <div className="mt-2 text-sm text-green-600 font-medium">
          {(debtStats.pctPaid * 100).toFixed(1)}% complete
          {paidDebts.length > 0 && ` · ${paidDebts.length} debt${paidDebts.length > 1 ? 's' : ''} paid off!`}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barGap={8}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 13 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}
                labelStyle={{ color: '#0f172a' }}
                formatter={v => [fmt(v)]}
              />
              <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Debt Breakdown</h3>
          {debtChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={debtChartData} cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3} dataKey="value">
                  {debtChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}
                  formatter={v => [fmt(v)]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-green-600 font-semibold">All debts paid off!</div>
          )}
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {debtChartData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {snowballOrder.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
          <h3 className="text-lg font-semibold mb-1">Snowball Attack Order</h3>
          <p className="text-sm text-slate-500 mb-4">Pay minimums on everything, throw extra at the smallest balance first.</p>
          <div className="space-y-3">
            {snowballOrder.map((d, i) => {
              const pct = d.originalBalance > 0 ? ((d.originalBalance - d.currentBalance) / d.originalBalance) : 0;
              const monthsLeft = d.minPayment > 0 ? Math.ceil(d.currentBalance / d.minPayment) : 0;
              return (
                <div key={d.id} className="flex items-center gap-4">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${i === 0 ? 'bg-cyan-50 text-cyan-700 ring-2 ring-cyan-500' : 'bg-slate-100 text-slate-500'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-medium truncate ${i === 0 ? 'text-cyan-600' : 'text-slate-700'}`}>{d.name}</span>
                      <span className="text-sm text-slate-500">{fmt(d.currentBalance)}</span>
                    </div>
                    <ProgressBar value={d.originalBalance - d.currentBalance} max={d.originalBalance} color={i === 0 ? 'bg-cyan-500' : 'bg-slate-500'} />
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 w-16 text-right">~{monthsLeft} mo</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Subscriptions</h3>
          <span className="text-amber-600 font-bold">{fmt(subTotal)}/mo</span>
        </div>
      </div>
    </div>
  );
}
