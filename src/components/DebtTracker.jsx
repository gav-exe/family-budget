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
    <div className={`bg-white rounded-xl shadow-sm border ${paidOff ? 'border-green-200' : 'border-slate-200'} p-5 hover:border-slate-300 transition-colors group`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {paidOff ? <CheckCircle size={18} className="text-green-600" /> : <Clock size={18} className="text-slate-400" />}
          <EditableCell value={debt.name} type="text" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'name', value: v })} className="font-semibold text-slate-900" />
        </div>
        <div className="flex items-center gap-2">
          {paidOff && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">PAID OFF</span>}
          <button onClick={() => dispatch({ type: 'REMOVE_DEBT', id: debt.id })} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all cursor-pointer">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div>
          <span className="text-xs text-slate-400">Original</span>
          <div className="text-sm text-slate-500">
            <EditableCell value={debt.originalBalance} prefix="$" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'originalBalance', value: v })} />
          </div>
        </div>
        <div>
          <span className="text-xs text-slate-400">Current</span>
          <div className={`text-sm ${paidOff ? 'text-green-600' : 'text-slate-900'}`}>
            <EditableCell value={debt.currentBalance} prefix="$" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'currentBalance', value: v })} />
          </div>
        </div>
        <div>
          <span className="text-xs text-slate-400">Min Payment</span>
          <div className="text-sm text-amber-600">
            <EditableCell value={debt.minPayment} prefix="$" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'minPayment', value: v })} />
          </div>
        </div>
        <div>
          <span className="text-xs text-slate-400">Due On</span>
          <div className="text-sm text-slate-500">
            <EditableCell value={debt.dueOn || '-'} type="text" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'dueOn', value: v })} />
          </div>
        </div>
      </div>

      <ProgressBar value={debt.originalBalance - debt.currentBalance} max={debt.originalBalance} color={paidOff ? 'bg-green-500' : color} />
      <div className="flex justify-between mt-1.5 text-xs text-slate-400">
        <span>{(pctPaid * 100).toFixed(1)}% paid</span>
        {payoffDate && <span>~{monthsLeft} months (est. {payoffDate})</span>}
        {paidOff && !payoffDate && <span className="text-green-600">Complete!</span>}
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
      <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <span className="text-xs text-slate-400">Total Original</span>
            <div className="text-lg font-bold text-slate-700">{fmt(stats.totalOriginal)}</div>
          </div>
          <div>
            <span className="text-xs text-slate-400">Remaining</span>
            <div className="text-lg font-bold text-red-500">{fmt(stats.totalCurrent)}</div>
          </div>
          <div>
            <span className="text-xs text-slate-400">Total Paid</span>
            <div className="text-lg font-bold text-green-600">{fmt(stats.totalPaid)}</div>
          </div>
          <div>
            <span className="text-xs text-slate-400">Monthly Minimums</span>
            <div className="text-lg font-bold text-amber-600">{fmt(stats.totalMinPayment)}</div>
          </div>
        </div>
        <ProgressBar value={stats.totalPaid} max={stats.totalOriginal} color="bg-green-500" height="h-4" />
        <div className="text-center text-sm text-green-600 font-medium mt-2">{(stats.pctPaid * 100).toFixed(1)}% of all debt eliminated</div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">All Debts</h3>
        <button
          onClick={() => dispatch({ type: 'ADD_DEBT' })}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
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
