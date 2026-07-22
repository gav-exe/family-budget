import { useMemo } from 'react';
import { useBudget, getPersonTotals } from '../store';
import ProgressBar from './ProgressBar';
import { Zap, CheckCircle, Calendar, TrendingDown, DollarSign } from 'lucide-react';

const fmt = v => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const COLORS = ['bg-cyan-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500', 'bg-pink-500', 'bg-green-500'];
const TEXT_COLORS = ['text-cyan-600', 'text-blue-600', 'text-purple-600', 'text-amber-600', 'text-red-500', 'text-pink-600', 'text-green-600'];
const BG_COLORS = ['bg-cyan-50', 'bg-blue-50', 'bg-purple-50', 'bg-amber-50', 'bg-red-50', 'bg-pink-50', 'bg-green-50'];
const BORDER_COLORS = ['border-cyan-200', 'border-blue-200', 'border-purple-200', 'border-amber-200', 'border-red-200', 'border-pink-200', 'border-green-200'];

export default function SnowballSimulator() {
  const { state } = useBudget();
  const gavinTotals = getPersonTotals(state.gavin);
  const hazelTotals = getPersonTotals(state.hazel);
  const debtAttack = gavinTotals.available + hazelTotals.available;

  const simulation = useMemo(() => {
    const activeDebts = state.debts
      .filter(d => d.currentBalance > 0)
      .map(d => ({ ...d }))
      .sort((a, b) => a.currentBalance - b.currentBalance);

    if (activeDebts.length === 0 || debtAttack <= 0) return null;

    const totalMinPayments = activeDebts.reduce((s, d) => s + (Number(d.minPayment) || 0), 0);
    const monthlyBudget = totalMinPayments + debtAttack;

    const balances = activeDebts.map(d => Number(d.currentBalance));
    const minPayments = activeDebts.map(d => Number(d.minPayment) || 0);
    const names = activeDebts.map(d => d.name);
    const timeline = [];
    let month = 0;
    const maxMonths = 600;
    let targetIdx = 0;

    const monthlySnapshots = [{ month: 0, remaining: balances.reduce((a, b) => a + b, 0) }];

    while (targetIdx < balances.length && month < maxMonths) {
      month++;
      let available = monthlyBudget;

      for (let i = 0; i < balances.length; i++) {
        if (balances[i] <= 0) continue;
        if (i !== targetIdx) {
          const payment = Math.min(minPayments[i], balances[i]);
          balances[i] -= payment;
          available -= payment;
          if (balances[i] <= 0) {
            balances[i] = 0;
            const payoffDate = new Date();
            payoffDate.setMonth(payoffDate.getMonth() + month);
            timeline.push({ name: names[i], month, date: payoffDate, idx: i });
          }
        }
      }

      if (balances[targetIdx] > 0) {
        const payment = Math.min(available, balances[targetIdx]);
        balances[targetIdx] -= payment;
        if (balances[targetIdx] <= 0) {
          balances[targetIdx] = 0;
          const payoffDate = new Date();
          payoffDate.setMonth(payoffDate.getMonth() + month);
          timeline.push({ name: names[targetIdx], month, date: payoffDate, idx: targetIdx });
        }
      }

      while (targetIdx < balances.length && balances[targetIdx] <= 0) {
        targetIdx++;
      }

      const remaining = balances.reduce((a, b) => a + b, 0);
      monthlySnapshots.push({ month, remaining });
    }

    const totalMonths = month;
    const freeDate = new Date();
    freeDate.setMonth(freeDate.getMonth() + totalMonths);

    return {
      activeDebts,
      timeline,
      totalMonths,
      freeDate,
      monthlyBudget,
      debtAttack,
      totalMinPayments,
      monthlySnapshots,
    };
  }, [state.debts, debtAttack]);

  if (!simulation) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <CheckCircle size={48} className="text-green-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-green-600">You're debt free!</h3>
      </div>
    );
  }

  const { activeDebts, timeline, totalMonths, freeDate, monthlyBudget, monthlySnapshots } = simulation;
  const totalDebt = activeDebts.reduce((s, d) => s + Number(d.currentBalance), 0);
  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;
  const timeStr = years > 0
    ? `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`
    : `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;

  const barMax = totalMonths;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-cyan-50 to-green-50 rounded-xl p-6 border border-cyan-200">
        <div className="flex items-center gap-3 mb-4">
          <Zap size={28} className="text-cyan-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">Snowball Payoff Plan</h2>
            <p className="text-sm text-slate-500">Attack the smallest balance first, roll payments into the next</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/70 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <DollarSign size={12} /> Monthly Budget
            </div>
            <div className="text-lg font-bold text-cyan-600">{fmt(monthlyBudget)}</div>
            <div className="text-[10px] text-slate-400">minimums + {fmt(debtAttack)} extra</div>
          </div>
          <div className="bg-white/70 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <TrendingDown size={12} /> Total Debt
            </div>
            <div className="text-lg font-bold text-red-500">{fmt(totalDebt)}</div>
          </div>
          <div className="bg-white/70 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Calendar size={12} /> Debt Free In
            </div>
            <div className="text-lg font-bold text-green-600">{timeStr}</div>
          </div>
          <div className="bg-white/70 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <CheckCircle size={12} /> Freedom Date
            </div>
            <div className="text-lg font-bold text-green-600">
              {freeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="text-lg font-semibold mb-1">Payoff Timeline</h3>
        <p className="text-sm text-slate-500 mb-5">Each debt falls off, freeing up more money for the next one.</p>

        <div className="space-y-4">
          {timeline.map((event, i) => {
            const debt = activeDebts[event.idx];
            const colorIdx = i % COLORS.length;
            const monthsFromNow = event.month;
            const barWidth = (monthsFromNow / barMax) * 100;

            let rollingPayment = simulation.debtAttack + simulation.totalMinPayments;
            const prevPaidOff = timeline.slice(0, i + 1).map(t => activeDebts[t.idx].minPayment);

            return (
              <div key={i} className={`rounded-lg border ${BORDER_COLORS[colorIdx]} ${BG_COLORS[colorIdx]} p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${COLORS[colorIdx]} text-white`}>
                      {i + 1}
                    </span>
                    <div>
                      <span className={`font-semibold ${TEXT_COLORS[colorIdx]}`}>{event.name}</span>
                      <span className="text-slate-400 text-sm ml-2">
                        {fmt(debt.currentBalance)} balance
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">
                      {event.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-xs text-slate-400">
                      {monthsFromNow} month{monthsFromNow !== 1 ? 's' : ''} from now
                    </div>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full progress-bar ${COLORS[colorIdx]}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {i < timeline.length - 1 && (
                  <div className="mt-2 text-xs text-slate-500">
                    Frees up <span className={`font-semibold ${TEXT_COLORS[colorIdx]}`}>{fmt(debt.minPayment)}/mo</span> for the next debt
                  </div>
                )}
                {i === timeline.length - 1 && (
                  <div className="mt-2 text-xs text-green-600 font-semibold">
                    DEBT FREE!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="text-lg font-semibold mb-4">Month-by-Month Breakdown</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-1 items-end min-w-max" style={{ height: 180 }}>
            {monthlySnapshots.filter((_, i) => i > 0).map((snap, i) => {
              const height = totalDebt > 0 ? (snap.remaining / totalDebt) * 160 : 0;
              const isPaidOff = timeline.some(t => t.month === snap.month);
              return (
                <div key={i} className="flex flex-col items-center gap-1" style={{ minWidth: totalMonths > 30 ? 14 : 20 }}>
                  <div
                    className={`w-full rounded-t transition-all ${isPaidOff ? 'bg-green-500' : 'bg-cyan-500/60'}`}
                    style={{ height: Math.max(height, 2) }}
                    title={`Month ${snap.month}: ${fmt(snap.remaining)} remaining`}
                  />
                  {(snap.month % (totalMonths > 24 ? 6 : 3) === 0 || snap.month === totalMonths) && (
                    <span className="text-[9px] text-slate-400 -rotate-45 origin-top-left whitespace-nowrap mt-1">
                      {snap.month}mo
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500/60" />
            Remaining balance
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-500" />
            A debt was paid off this month
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="text-lg font-semibold mb-3">How It Works</h3>
        <div className="space-y-2 text-sm text-slate-500">
          <p>
            <span className="text-slate-900 font-medium">Total monthly budget:</span> {fmt(monthlyBudget)}
            ({fmt(simulation.totalMinPayments)} in minimums + {fmt(simulation.debtAttack)} debt attack from both incomes)
          </p>
          <p>
            <span className="text-slate-900 font-medium">Strategy:</span> Pay minimums on everything, throw all extra at
            <span className="text-cyan-600 font-medium"> {activeDebts[0]?.name}</span> first (smallest balance).
          </p>
          <p>
            When it's gone, that entire payment rolls into the next debt. Your attack amount grows every time a debt falls off.
          </p>
          <p className="text-green-600 font-medium">
            Result: All {activeDebts.length} debts paid off by {freeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}!
          </p>
        </div>
      </div>
    </div>
  );
}
