import { useBudget, getDebtStats } from '../store';
import EditableCell from './EditableCell';
import ProgressBar from './ProgressBar';
import { CheckCircle, Clock, Plane } from 'lucide-react';

const fmt = v => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CancunTracker() {
  const { state, dispatch } = useBudget();
  const stats = getDebtStats(state.cancun.debts);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-6 border border-cyan-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Plane size={28} className="text-cyan-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Cancun Trip Fund</h2>
            <p className="text-sm text-slate-400">Track your vacation savings</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <span className="text-xs text-slate-500">Total Cost</span>
            <div className="text-lg font-bold text-slate-300">{fmt(stats.totalOriginal)}</div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Remaining</span>
            <div className="text-lg font-bold text-amber-400">{fmt(stats.totalCurrent)}</div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Paid So Far</span>
            <div className="text-lg font-bold text-green-400">{fmt(stats.totalPaid)}</div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Monthly</span>
            <div className="text-lg font-bold text-cyan-400">{fmt(stats.totalMinPayment)}</div>
          </div>
        </div>
        <ProgressBar value={stats.totalPaid} max={stats.totalOriginal} color="bg-cyan-500" height="h-4" />
        <div className="text-center text-sm text-cyan-400 font-medium mt-2">{(stats.pctPaid * 100).toFixed(1)}% funded</div>
      </div>

      <div className="space-y-4">
        {state.cancun.debts.map(debt => {
          const paidOff = debt.currentBalance <= 0;
          const pctPaid = debt.originalBalance > 0 ? (debt.originalBalance - debt.currentBalance) / debt.originalBalance : 0;
          const monthsLeft = debt.minPayment > 0 && debt.currentBalance > 0 ? Math.ceil(debt.currentBalance / debt.minPayment) : 0;

          return (
            <div key={debt.id} className={`bg-slate-800 rounded-xl border ${paidOff ? 'border-green-500/30' : 'border-slate-700'} p-5`}>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  {paidOff ? <CheckCircle size={18} className="text-green-400" /> : <Clock size={18} className="text-slate-500" />}
                  <span className="font-semibold">{debt.name}</span>
                </div>
                {paidOff && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">PAID OFF</span>}
              </div>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <span className="text-xs text-slate-500">Original</span>
                  <div className="text-sm text-slate-400">{fmt(debt.originalBalance)}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Current</span>
                  <div className={`text-sm ${paidOff ? 'text-green-400' : 'text-white'}`}>
                    <EditableCell value={debt.currentBalance} prefix="$" onChange={v => dispatch({ type: 'UPDATE_CANCUN_DEBT', id: debt.id, field: 'currentBalance', value: v })} />
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Monthly</span>
                  <div className="text-sm text-cyan-400">{fmt(debt.minPayment)}</div>
                </div>
              </div>
              <ProgressBar value={debt.originalBalance - debt.currentBalance} max={debt.originalBalance} color={paidOff ? 'bg-green-500' : 'bg-cyan-500'} />
              <div className="flex justify-between mt-1.5 text-xs text-slate-500">
                <span>{(pctPaid * 100).toFixed(1)}% paid</span>
                {monthsLeft > 0 && <span>~{monthsLeft} month{monthsLeft !== 1 ? 's' : ''} left</span>}
                {paidOff && <span className="text-green-400">Complete!</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
