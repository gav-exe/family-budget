import { useBudget, getDebtStats } from '../store';
import EditableCell from './EditableCell';
import ProgressBar from './ProgressBar';
import { Plus, Trash2, CheckCircle, Clock, Target } from 'lucide-react';

const fmt = v => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function GoalCard({ goal, dispatch }) {
  const funded = goal.originalBalance > 0 && goal.currentBalance <= 0;
  const pctFunded = goal.originalBalance > 0 ? (goal.originalBalance - goal.currentBalance) / goal.originalBalance : 0;
  const monthsLeft = goal.minPayment > 0 && goal.currentBalance > 0 ? Math.ceil(goal.currentBalance / goal.minPayment) : 0;
  const update = (field, value) => dispatch({ type: 'UPDATE_GOAL', id: goal.id, field, value });

  return (
    <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5 group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {funded ? <CheckCircle size={18} className="text-teal" /> : <Clock size={18} className="text-ink/30" />}
          <EditableCell value={goal.name} type="text" onChange={v => update('name', v)} className="font-display font-bold text-ink" />
        </div>
        <div className="flex items-center gap-2">
          {funded && <span className="text-xs bg-teal text-white px-2 py-0.5 rounded-full font-bold border-2 border-ink hard-shadow-sm">FUNDED</span>}
          <button onClick={() => dispatch({ type: 'REMOVE_GOAL', id: goal.id })} className="opacity-0 group-hover:opacity-100 text-coral hover:text-coral/70 transition-all cursor-pointer">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <span className="text-xs text-ink/40">Total Cost</span>
          <div className="text-sm text-ink/60">
            <EditableCell value={goal.originalBalance} prefix="$" onChange={v => update('originalBalance', v)} />
          </div>
        </div>
        <div>
          <span className="text-xs text-ink/40">Remaining</span>
          <div className={`text-sm font-bold ${funded ? 'text-teal' : 'text-ink'}`}>
            <EditableCell value={goal.currentBalance} prefix="$" onChange={v => update('currentBalance', v)} />
          </div>
        </div>
        <div>
          <span className="text-xs text-ink/40">Monthly</span>
          <div className="text-sm text-teal font-bold">
            <EditableCell value={goal.minPayment} prefix="$" onChange={v => update('minPayment', v)} />
          </div>
        </div>
      </div>
      <ProgressBar value={goal.originalBalance - goal.currentBalance} max={goal.originalBalance} color={funded ? 'bg-teal' : 'bg-sky'} />
      <div className="flex justify-between mt-1.5 text-xs text-ink/40">
        <span>{(pctFunded * 100).toFixed(1)}% funded</span>
        {monthsLeft > 0 && <span>~{monthsLeft} month{monthsLeft !== 1 ? 's' : ''} left</span>}
        {funded && <span className="text-teal font-bold">Complete!</span>}
      </div>
    </div>
  );
}

export default function GoalsTracker() {
  const { state, dispatch } = useBudget();
  const goals = state.goals || [];
  const stats = getDebtStats(goals);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-12 h-12 rounded-xl bg-teal border-[3px] border-ink hard-shadow-sm flex items-center justify-center shrink-0">
            <Target size={28} className="text-white" />
          </span>
          <div>
            <h2 className="text-2xl font-display font-extrabold text-ink">Savings Goals</h2>
            <p className="text-sm text-ink/60">Vacations, big purchases, payoffs. Lower the remaining amount as you save.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <span className="text-xs text-ink/40">Total Cost</span>
            <div className="text-lg font-display font-extrabold text-ink">{fmt(stats.totalOriginal)}</div>
          </div>
          <div>
            <span className="text-xs text-ink/40">Remaining</span>
            <div className="text-lg font-display font-extrabold">
              <span className="bg-mustard text-ink px-2 py-0.5 rounded-md border-2 border-ink">{fmt(stats.totalCurrent)}</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-ink/40">Saved So Far</span>
            <div className="text-lg font-display font-extrabold text-teal">{fmt(stats.totalPaid)}</div>
          </div>
          <div>
            <span className="text-xs text-ink/40">Monthly</span>
            <div className="text-lg font-display font-extrabold text-teal">{fmt(stats.totalMinPayment)}</div>
          </div>
        </div>
        <ProgressBar value={stats.totalPaid} max={stats.totalOriginal} color="bg-sky" height="h-4" />
        <div className="text-center text-sm text-teal font-bold mt-2">{(stats.pctPaid * 100).toFixed(1)}% funded</div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-display font-extrabold text-ink">Your Goals</h3>
        <button
          onClick={() => dispatch({ type: 'ADD_GOAL' })}
          className="flex items-center gap-1.5 text-sm font-bold text-ink bg-white border-2 border-ink rounded-full px-3 py-1 hard-shadow-sm press cursor-pointer"
        >
          <Plus size={16} /> Add Goal
        </button>
      </div>

      <div className="space-y-4">
        {goals.length === 0 && (
          <p className="text-sm text-ink/40 text-center py-8">
            No goals yet. Click "Add Goal" to start tracking something.
          </p>
        )}
        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} dispatch={dispatch} />
        ))}
      </div>
    </div>
  );
}
