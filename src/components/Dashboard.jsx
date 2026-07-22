import { useBudget, getPersonTotals, getDebtStats } from '../store';
import StatCard from './StatCard';
import ProgressBar from './ProgressBar';
import { DollarSign, TrendingDown, TrendingUp, Wallet, CreditCard, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const fmt = v => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const COLORS = ['#12b3a4', '#3aa0ff', '#6b5be6', '#ffc531', '#ff5b57'];
const tooltipStyle = {
  background: '#ffffff',
  border: '3px solid #17140d',
  borderRadius: 12,
  boxShadow: '5px 5px 0 #17140d',
};

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
          color="bg-teal text-white"
          sub="Combined monthly"
        />
        <StatCard
          label="Total Expenses"
          value={fmt(householdExpenses)}
          icon={<Wallet size={18} />}
          color="bg-mustard text-ink"
          sub="Bills + minimums"
        />
        <StatCard
          label="Debt Attack"
          value={fmt(householdAvailable)}
          icon={<Zap size={18} />}
          color="bg-sky text-white"
          sub="Available extra"
        />
        <StatCard
          label="Total Debt"
          value={fmt(debtStats.totalCurrent)}
          icon={<CreditCard size={18} />}
          color="bg-coral text-white"
          sub={`${(debtStats.pctPaid * 100).toFixed(1)}% paid off`}
        />
      </div>

      <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
        <h3 className="text-xl font-display font-extrabold text-ink mb-3">Overall Debt Progress</h3>
        <div className="flex items-center justify-between text-sm text-ink/60 mb-2">
          <span>{fmt(debtStats.totalPaid)} paid</span>
          <span>{fmt(debtStats.totalOriginal)} total</span>
        </div>
        <ProgressBar value={debtStats.totalPaid} max={debtStats.totalOriginal} color="bg-teal" height="h-4" />
        <div className="mt-2 text-sm text-teal font-bold">
          {(debtStats.pctPaid * 100).toFixed(1)}% complete
          {paidDebts.length > 0 && ` · ${paidDebts.length} debt${paidDebts.length > 1 ? 's' : ''} paid off!`}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
          <h3 className="text-xl font-display font-extrabold text-ink mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barGap={8}>
              <XAxis dataKey="name" tick={{ fill: '#17140d', fontSize: 13 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#17140d', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: '#17140d' }}
                formatter={v => [fmt(v)]}
              />
              <Bar dataKey="income" fill="#12b3a4" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#ffc531" radius={[6, 6, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
          <h3 className="text-xl font-display font-extrabold text-ink mb-4">Debt Breakdown</h3>
          {debtChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={debtChartData} cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3} dataKey="value" stroke="#17140d" strokeWidth={2}>
                  {debtChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: '#17140d' }}
                  formatter={v => [fmt(v)]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-teal font-display font-extrabold">All debts paid off!</div>
          )}
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {debtChartData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-ink/60">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-ink" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {snowballOrder.length > 0 && (
        <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
          <h3 className="text-xl font-display font-extrabold text-ink mb-1">Snowball Attack Order</h3>
          <p className="text-sm text-ink/60 mb-4">Pay minimums on everything, throw extra at the smallest balance first.</p>
          <div className="space-y-3">
            {snowballOrder.map((d, i) => {
              const pct = d.originalBalance > 0 ? ((d.originalBalance - d.currentBalance) / d.originalBalance) : 0;
              const monthsLeft = d.minPayment > 0 ? Math.ceil(d.currentBalance / d.minPayment) : 0;
              return (
                <div key={d.id} className="flex items-center gap-4">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2 border-ink ${i === 0 ? 'bg-coral text-white hard-shadow-sm' : 'bg-white text-ink/50'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm truncate ${i === 0 ? 'font-bold text-ink' : 'font-medium text-ink/70'}`}>{d.name}</span>
                      <span className="text-sm text-ink/60">{fmt(d.currentBalance)}</span>
                    </div>
                    <ProgressBar value={d.originalBalance - d.currentBalance} max={d.originalBalance} color={i === 0 ? 'bg-coral' : 'bg-teal'} />
                  </div>
                  <span className="text-xs text-ink/40 shrink-0 w-16 text-right">~{monthsLeft} mo</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-display font-extrabold text-ink">Subscriptions</h3>
          <span className="bg-mustard text-ink font-display font-bold px-2.5 py-0.5 rounded-lg border-2 border-ink hard-shadow-sm">{fmt(subTotal)}/mo</span>
        </div>
      </div>
    </div>
  );
}
