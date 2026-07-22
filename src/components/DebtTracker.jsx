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
    <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5 group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {paidOff ? <CheckCircle size={18} className="text-teal" /> : <Clock size={18} className="text-ink/30" />}
          <EditableCell value={debt.name} type="text" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'name', value: v })} className="font-display font-bold text-ink" />
        </div>
        <div className="flex items-center gap-2">
          {paidOff && <span className="text-xs bg-teal text-white px-2 py-0.5 rounded-full font-bold border-2 border-ink hard-shadow-sm">PAID OFF</span>}
          <button onClick={() => dispatch({ type: 'REMOVE_DEBT', id: debt.id })} className="opacity-0 group-hover:opacity-100 text-coral hover:text-coral/70 transition-all cursor-pointer">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div>
          <span className="text-xs text-ink/40">Original</span>
          <div className="text-sm text-ink/60">
            <EditableCell value={debt.originalBalance} prefix="$" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'originalBalance', value: v })} />
          </div>
        </div>
        <div>
          <span className="text-xs text-ink/40">Current</span>
          <div className={`text-sm font-bold ${paidOff ? 'text-teal' : 'text-ink'}`}>
            <EditableCell value={debt.currentBalance} prefix="$" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'currentBalance', value: v })} />
          </div>
        </div>
        <div>
          <span className="text-xs text-ink/40">Min Payment</span>
          <div className="text-sm text-ink font-medium">
            <EditableCell value={debt.minPayment} prefix="$" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'minPayment', value: v })} />
          </div>
        </div>
        <div>
          <span className="text-xs text-ink/40">Due On</span>
          <div className="text-sm text-ink/60">
            <EditableCell value={debt.dueOn || '-'} type="text" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'dueOn', value: v })} />
          </div>
        </div>
      </div>

      <ProgressBar value={debt.originalBalance - debt.currentBalance} max={debt.originalBalance} color={paidOff ? 'bg-teal' : color} />
      <div className="flex justify-between mt-1.5 text-xs text-ink/40">
        <span>{(pctPaid * 100).toFixed(1)}% paid</span>
        {payoffDate && <span>~{monthsLeft} months (est. {payoffDate})</span>}
        {paidOff && !payoffDate && <span className="text-teal font-bold">Complete!</span>}
      </div>
    </div>
  );
}

const COLORS = ['bg-coral', 'bg-sky', 'bg-violet', 'bg-mustard', 'bg-teal'];

export default function DebtTracker() {
  const { state, dispatch } = useBudget();
  const stats = getDebtStats(state.debts);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <span className="text-xs text-ink/40">Total Original</span>
            <div className="text-lg font-display font-extrabold text-ink">{fmt(stats.totalOriginal)}</div>
          </div>
          <div>
            <span className="text-xs text-ink/40">Remaining</span>
            <div className="text-lg font-display font-extrabold text-coral">{fmt(stats.totalCurrent)}</div>
          </div>
          <div>
            <span className="text-xs text-ink/40">Total Paid</span>
            <div className="text-lg font-display font-extrabold text-teal">{fmt(stats.totalPaid)}</div>
          </div>
          <div>
            <span className="text-xs text-ink/40">Monthly Minimums</span>
            <div className="text-lg font-display font-extrabold">
              <span className="bg-mustard text-ink px-2 py-0.5 rounded-md border-2 border-ink">{fmt(stats.totalMinPayment)}</span>
            </div>
          </div>
        </div>
        <ProgressBar value={stats.totalPaid} max={stats.totalOriginal} color="bg-teal" height="h-4" />
        <div className="text-center text-sm text-teal font-bold mt-2">{(stats.pctPaid * 100).toFixed(1)}% of all debt eliminated</div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-display font-extrabold text-ink">All Debts</h3>
        <button
          onClick={() => dispatch({ type: 'ADD_DEBT' })}
          className="flex items-center gap-1.5 text-sm font-bold text-ink bg-white border-2 border-ink rounded-full px-3 py-1 hard-shadow-sm press cursor-pointer"
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
