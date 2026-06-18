import { useBudget, getDebtStats } from '../store';
import EditableCell from './EditableCell';
import ProgressBar from './ProgressBar';
import SnowballSimulator from './SnowballSimulator';
import { Plus, Trash2, CheckCircle, Clock } from 'lucide-react';

const fmt = v => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function DebtRow({ debt, dispatch, color }) {
  const paidOff = debt.currentBalance <= 0;
  const pctPaid = debt.originalBalance > 0 ? (debt.originalBalance - debt.currentBalance) / debt.originalBalance : 0;
  const monthsLeft = debt.minPayment > 0 && debt.currentBalance > 0 ? Math.ceil(debt.currentBalance / debt.minPayment) : 0;
  const payoffDate = monthsLeft > 0 ? new Date(Date.now() + monthsLeft * 30.44 * 86400000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null;

  return (
    <div className={`bg-slate-800 rounded-xl border ${paidOff ? 'border-green-500/30' : 'border-slate-700'} p-5 hover:border-slate-600 transition-colors group`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {paidOff ? <CheckCircle size={18} className="text-green-400" /> : <Clock size={18} className="text-slate-500" />}
          <EditableCell value={debt.name} type="text" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'name', value: v })} className="font-semibold text-white" />
        </div>
        <div className="flex items-center gap-2">
          {paidOff && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">PAID OFF</span>}
          <button onClick={() => dispatch({ type: 'REMOVE_DEBT', id: debt.id })} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all cursor-pointer">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div>
          <span className="text-xs text-slate-500">Original</span>
          <div className="text-sm text-slate-400">
            <EditableCell value={debt.originalBalance} prefix="$" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'originalBalance', value: v })} />
          </div>
        </div>
        <div>
          <span className="text-xs text-slate-500">Current</span>
          <div className={`text-sm ${paidOff ? 'text-green-400' : 'text-white'}`}>
            <EditableCell value={debt.currentBalance} prefix="$" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'currentBalance', value: v })} />
          </div>
        </div>
        <div>
          <span className="text-xs text-slate-500">Min Payment</span>
          <div className="text-sm text-amber-400">
            <EditableCell value={debt.minPayment} prefix="$" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'minPayment', value: v })} />
          </div>
        </div>
        <div>
          <span className="text-xs text-slate-500">Due On</span>
          <div className="text-sm text-slate-400">
            <EditableCell value={debt.dueOn || '-'} type="text" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'dueOn', value: v })} />
          </div>
        </div>
      </div>

      <ProgressBar value={debt.originalBalance - debt.currentBalance} max={debt.originalBalance} color={paidOff ? 'bg-green-500' : color} />
      <div className="flex justify-between mt-1.5 text-xs text-slate-500">
        <span>{(pctPaid * 100).toFixed(1)}% paid</span>
        {payoffDate && <span>~{monthsLeft} months (est. {payoffDate})</span>}
        {paidOff && !payoffDate && <span className="text-green-400">Complete!</span>}
      </div>
    </div>
  );
}

const COLORS = ['bg-cyan-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500', 'bg-pink-500', 'bg-green-500'];

export default function DebtTracker() {
  const { state, dispatch } = useBudget();
  const stats = getDebtStats(state.debts);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <span className="text-xs text-slate-500">Total Original</span>
            <div className="text-lg font-bold text-slate-300">{fmt(stats.totalOriginal)}</div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Remaining</span>
            <div className="text-lg font-bold text-red-400">{fmt(stats.totalCurrent)}</div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Total Paid</span>
            <div className="text-lg font-bold text-green-400">{fmt(stats.totalPaid)}</div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Monthly Minimums</span>
            <div className="text-lg font-bold text-amber-400">{fmt(stats.totalMinPayment)}</div>
          </div>
        </div>
        <ProgressBar value={stats.totalPaid} max={stats.totalOriginal} color="bg-green-500" height="h-4" />
        <div className="text-center text-sm text-green-400 font-medium mt-2">{(stats.pctPaid * 100).toFixed(1)}% of all debt eliminated</div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">All Debts</h3>
        <button
          onClick={() => dispatch({ type: 'ADD_DEBT' })}
          className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add Debt
        </button>
      </div>

      <div className="space-y-4">
        {state.debts.map((debt, i) => (
          <DebtRow key={debt.id} debt={debt} dispatch={dispatch} color={COLORS[i % COLORS.length]} />
        ))}
      </div>

      <SnowballSimulator />
    </div>
  );
}
