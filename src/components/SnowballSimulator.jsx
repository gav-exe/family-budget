import { useMemo } from 'react';
import { useBudget, getPersonTotals } from '../store';
import ProgressBar from './ProgressBar';
import { Zap, CheckCircle, Calendar, TrendingDown, DollarSign } from 'lucide-react';

const fmt = v => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const COLORS = ['bg-coral', 'bg-sky', 'bg-violet', 'bg-mustard', 'bg-teal'];
const TEXT_COLORS = ['text-coral', 'text-sky', 'text-violet', 'text-ink', 'text-teal'];
const BADGE_COLORS = ['bg-coral text-white', 'bg-sky text-white', 'bg-violet text-white', 'bg-mustard text-ink', 'bg-teal text-white'];

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
      <div className="bg-teal border-[3px] border-ink hard-shadow-lg rounded-[22px] p-8 text-center">
        <CheckCircle size={48} className="text-white mx-auto mb-3" />
        <h3 className="text-xl font-display font-extrabold text-white">You're debt free!</h3>
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
      <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-12 h-12 rounded-xl bg-mustard border-[3px] border-ink hard-shadow-sm flex items-center justify-center shrink-0">
            <Zap size={28} className="text-ink" />
          </span>
          <div>
            <h2 className="text-2xl font-display font-extrabold text-ink">Snowball <span className="marker-highlight marker-teal">Payoff</span> Plan</h2>
            <p className="text-sm text-ink/60">Attack the smallest balance first, roll payments into the next</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-cream border-2 border-ink rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs text-ink/50 mb-1">
              <DollarSign size={12} /> Monthly Budget
            </div>
            <div className="text-lg font-display font-extrabold text-teal">{fmt(monthlyBudget)}</div>
            <div className="text-[10px] text-ink/40">minimums + {fmt(debtAttack)} extra</div>
          </div>
          <div className="bg-cream border-2 border-ink rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs text-ink/50 mb-1">
              <TrendingDown size={12} /> Total Debt
            </div>
            <div className="text-lg font-display font-extrabold text-coral">{fmt(totalDebt)}</div>
          </div>
          <div className="bg-cream border-2 border-ink rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs text-ink/50 mb-1">
              <Calendar size={12} /> Debt Free In
            </div>
            <div className="text-lg font-display font-extrabold text-ink">{timeStr}</div>
          </div>
          <div className="bg-cream border-2 border-ink rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs text-ink/50 mb-1">
              <CheckCircle size={12} /> Freedom Date
            </div>
            <div className="text-lg font-display font-extrabold text-teal">
              {freeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
        <h3 className="text-xl font-display font-extrabold text-ink mb-1">Payoff Timeline</h3>
        <p className="text-sm text-ink/60 mb-5">Each debt falls off, freeing up more money for the next one.</p>

        <div className="space-y-4">
          {timeline.map((event, i) => {
            const debt = activeDebts[event.idx];
            const colorIdx = i % COLORS.length;
            const monthsFromNow = event.month;
            const barWidth = (monthsFromNow / barMax) * 100;

            let rollingPayment = simulation.debtAttack + simulation.totalMinPayments;
            const prevPaidOff = timeline.slice(0, i + 1).map(t => activeDebts[t.idx].minPayment);

            return (
              <div key={i} className="rounded-2xl border-[3px] border-ink bg-white hard-shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 border-ink ${BADGE_COLORS[colorIdx]}`}>
                      {i + 1}
                    </span>
                    <div>
                      <span className={`font-bold ${TEXT_COLORS[colorIdx]}`}>{event.name}</span>
                      <span className="text-ink/40 text-sm ml-2">
                        {fmt(debt.currentBalance)} balance
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-display font-bold text-ink">
                      {event.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-xs text-ink/40">
                      {monthsFromNow} month{monthsFromNow !== 1 ? 's' : ''} from now
                    </div>
                  </div>
                </div>

                <div className="w-full bg-cream border-2 border-ink rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full progress-bar ${COLORS[colorIdx]}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {i < timeline.length - 1 && (
                  <div className="mt-2 text-xs text-ink/60">
                    Frees up <span className={`font-bold ${TEXT_COLORS[colorIdx]}`}>{fmt(debt.minPayment)}/mo</span> for the next debt
                  </div>
                )}
                {i === timeline.length - 1 && (
                  <div className="mt-2 text-xs text-teal font-bold">
                    DEBT FREE!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
        <h3 className="text-xl font-display font-extrabold text-ink mb-4">Month-by-Month Breakdown</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-1 items-end min-w-max" style={{ height: 180 }}>
            {monthlySnapshots.filter((_, i) => i > 0).map((snap, i) => {
              const height = totalDebt > 0 ? (snap.remaining / totalDebt) * 160 : 0;
              const isPaidOff = timeline.some(t => t.month === snap.month);
              return (
                <div key={i} className="flex flex-col items-center gap-1" style={{ minWidth: totalMonths > 30 ? 14 : 20 }}>
                  <div
                    className={`w-full rounded-t transition-all ${isPaidOff ? 'bg-teal' : 'bg-sky'}`}
                    style={{ height: Math.max(height, 2) }}
                    title={`Month ${snap.month}: ${fmt(snap.remaining)} remaining`}
                  />
                  {(snap.month % (totalMonths > 24 ? 6 : 3) === 0 || snap.month === totalMonths) && (
                    <span className="text-[9px] text-ink/40 -rotate-45 origin-top-left whitespace-nowrap mt-1">
                      {snap.month}mo
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-ink/50">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-sky border-2 border-ink" />
            Remaining balance
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-teal border-2 border-ink" />
            A debt was paid off this month
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
        <h3 className="text-xl font-display font-extrabold text-ink mb-3">How It Works</h3>
        <div className="space-y-2 text-sm text-ink/70">
          <p>
            <span className="text-ink font-bold">Total monthly budget:</span> {fmt(monthlyBudget)}
            ({fmt(simulation.totalMinPayments)} in minimums + {fmt(simulation.debtAttack)} debt attack from both incomes)
          </p>
          <p>
            <span className="text-ink font-bold">Strategy:</span> Pay minimums on everything, throw all extra at
            <span className="text-coral font-bold"> {activeDebts[0]?.name}</span> first (smallest balance).
          </p>
          <p>
            When it's gone, that entire payment rolls into the next debt. Your attack amount grows every time a debt falls off.
          </p>
          <p className="text-teal font-bold">
            Result: All {activeDebts.length} debts paid off by {freeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}!
          </p>
        </div>
      </div>
    </div>
  );
}
