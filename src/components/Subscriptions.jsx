import { useBudget } from '../store';
import EditableCell from './EditableCell';
import { Plus, Trash2 } from 'lucide-react';

const fmt = v => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Subscriptions() {
  const { state, dispatch } = useBudget();
  const active = state.subscriptions.filter(s => s.status === 'Active');
  const paused = state.subscriptions.filter(s => s.status !== 'Active');
  const totalCost = active.reduce((s, sub) => s + (Number(sub.cost) || 0), 0);

  function SubRow({ sub }) {
    return (
      <tr className="border-t-2 border-ink/10 hover:bg-cream group">
        <td className="px-5 py-3">
          <EditableCell value={sub.name} type="text" onChange={v => dispatch({ type: 'UPDATE_SUBSCRIPTION', id: sub.id, field: 'name', value: v })} className="text-ink/80" />
        </td>
        <td className="px-5 py-3 text-right text-ink font-medium">
          <EditableCell value={sub.cost} prefix="$" onChange={v => dispatch({ type: 'UPDATE_SUBSCRIPTION', id: sub.id, field: 'cost', value: v })} />
        </td>
        <td className="px-5 py-3 text-center">
          <button
            onClick={() => dispatch({ type: 'UPDATE_SUBSCRIPTION', id: sub.id, field: 'status', value: sub.status === 'Active' ? 'Paused' : 'Active' })}
            className={`text-xs px-2.5 py-1 rounded-full font-bold cursor-pointer transition-colors border-2 ${sub.status === 'Active' ? 'bg-teal text-white border-ink hard-shadow-sm' : 'bg-white text-ink/50 border-ink/40 hover:border-ink'}`}
          >
            {sub.status}
          </button>
        </td>
        <td className="px-5 py-3">
          <EditableCell value={sub.notes || ''} type="text" onChange={v => dispatch({ type: 'UPDATE_SUBSCRIPTION', id: sub.id, field: 'notes', value: v })} className="text-ink/40 text-sm" />
        </td>
        <td className="px-2 py-3">
          <button onClick={() => dispatch({ type: 'REMOVE_SUBSCRIPTION', id: sub.id })} className="opacity-0 group-hover:opacity-100 text-coral hover:text-coral/70 transition-all cursor-pointer">
            <Trash2 size={14} />
          </button>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
          <span className="text-sm text-ink/60 font-medium">Monthly Total</span>
          <div className="text-2xl font-display font-extrabold mt-1">
            <span className="bg-mustard text-ink px-2 py-0.5 rounded-lg border-2 border-ink">{fmt(totalCost)}</span>
          </div>
        </div>
        <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
          <span className="text-sm text-ink/60 font-medium">Active</span>
          <div className="text-2xl font-display font-extrabold text-teal mt-1">{active.length}</div>
        </div>
        <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
          <span className="text-sm text-ink/60 font-medium">Yearly Cost</span>
          <div className="text-2xl font-display font-extrabold text-coral mt-1">{fmt(totalCost * 12)}</div>
        </div>
      </div>

      <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow overflow-hidden">
        <div className="px-5 py-4 border-b-[3px] border-ink bg-cream flex justify-between items-center">
          <h3 className="text-xl font-display font-extrabold text-ink">Subscriptions</h3>
          <button
            onClick={() => dispatch({ type: 'ADD_SUBSCRIPTION' })}
            className="flex items-center gap-1.5 text-sm font-bold text-ink bg-white border-2 border-ink rounded-full px-3 py-1 hard-shadow-sm press cursor-pointer"
          >
            <Plus size={16} /> Add
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-ink/50 text-sm">
              <th className="text-left px-5 py-3 font-medium">Service</th>
              <th className="text-right px-5 py-3 font-medium">Cost</th>
              <th className="text-center px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Notes</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {active.map(sub => <SubRow key={sub.id} sub={sub} />)}
            {paused.map(sub => <SubRow key={sub.id} sub={sub} />)}
          </tbody>
          <tfoot>
            <tr className="border-t-[3px] border-ink bg-cream font-bold">
              <td className="px-5 py-3 text-ink">Total (Active)</td>
              <td className="px-5 py-3 text-right">
                <span className="bg-mustard text-ink px-2 py-0.5 rounded-md border-2 border-ink">{fmt(totalCost)}</span>
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
