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
    <div className={`bg-slate-800 rounded-xl border ${funded ? 'border-green-500/30' : 'border-slate-700'} p-5 hover:border-slate-600 transition-colors group`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {funded ? <CheckCircle size={18} className="text-green-400" /> : <Clock size={18} className="text-slate-500" />}
          <EditableCell value={goal.name} type="text" onChange={v => update('name', v)} className="font-semibold text-white" />
        </div>
        <div className="flex items-center gap-2">
          {funded && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">FUNDED</span>}
          <button onClick={() => dispatch({ type: 'REMOVE_GOAL', id: goal.id })} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all cursor-pointer">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <span className="text-xs text-slate-500">Total Cost</span>
          <div className="text-sm text-slate-400">
            <EditableCell value={goal.originalBalance} prefix="$" onChange={v => update('originalBalance', v)} />
          </div>
        </div>
        <div>
          <span className="text-xs text-slate-500">Remaining</span>
          <div className={`text-sm ${funded ? 'text-green-400' : 'text-white'}`}>
            <EditableCell value={goal.currentBalance} prefix="$" onChange={v => update('currentBalance', v)} />
          </div>
        </div>
        <div>
          <span className="text-xs text-slate-500">Monthly</span>
          <div className="text-sm text-cyan-400">
            <EditableCell value={goal.minPayment} prefix="$" onChange={v => update('minPayment', v)} />
          </div>
        </div>
      </div>
      <ProgressBar value={goal.originalBalance - goal.currentBalance} max={goal.originalBalance} color={funded ? 'bg-green-500' : 'bg-cyan-500'} />
      <div className="flex justify-between mt-1.5 text-xs text-slate-500">
        <span>{(pctFunded * 100).toFixed(1)}% funded</span>
        {monthsLeft > 0 && <span>~{monthsLeft} month{monthsLeft !== 1 ? 's' : ''} left</span>}
        {funded && <span className="text-green-400">Complete!</span>}
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
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-6 border border-cyan-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Target size={28} className="text-cyan-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Savings Goals</h2>
            <p className="text-sm text-slate-400">Vacations, big purchases, payoffs — lower the remaining amount as you save</p>
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
            <span className="text-xs text-slate-500">Saved So Far</span>
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

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Goals</h3>
        <button
          onClick={() => dispatch({ type: 'ADD_GOAL' })}
          className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add Goal
        </button>
      </div>

      <div className="space-y-4">
        {goals.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">
            No goals yet — click "Add Goal" to start tracking something.
          </p>
        )}
        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} dispatch={dispatch} />
        ))}
      </div>
    </div>
  );
}
