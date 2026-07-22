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
      <tr className="border-t border-slate-100 hover:bg-slate-50 group">
        <td className="px-5 py-3">
          <EditableCell value={sub.name} type="text" onChange={v => dispatch({ type: 'UPDATE_SUBSCRIPTION', id: sub.id, field: 'name', value: v })} className="text-slate-700" />
        </td>
        <td className="px-5 py-3 text-right text-amber-600">
          <EditableCell value={sub.cost} prefix="$" onChange={v => dispatch({ type: 'UPDATE_SUBSCRIPTION', id: sub.id, field: 'cost', value: v })} />
        </td>
        <td className="px-5 py-3 text-center">
          <button
            onClick={() => dispatch({ type: 'UPDATE_SUBSCRIPTION', id: sub.id, field: 'status', value: sub.status === 'Active' ? 'Paused' : 'Active' })}
            className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer transition-colors ${sub.status === 'Active' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            {sub.status}
          </button>
        </td>
        <td className="px-5 py-3">
          <EditableCell value={sub.notes || ''} type="text" onChange={v => dispatch({ type: 'UPDATE_SUBSCRIPTION', id: sub.id, field: 'notes', value: v })} className="text-slate-400 text-sm" />
        </td>
        <td className="px-2 py-3">
          <button onClick={() => dispatch({ type: 'REMOVE_SUBSCRIPTION', id: sub.id })} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all cursor-pointer">
            <Trash2 size={14} />
          </button>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
          <span className="text-sm text-slate-500">Monthly Total</span>
          <div className="text-2xl font-bold text-amber-600">{fmt(totalCost)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
          <span className="text-sm text-slate-500">Active</span>
          <div className="text-2xl font-bold text-green-600">{active.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
          <span className="text-sm text-slate-500">Yearly Cost</span>
          <div className="text-2xl font-bold text-red-500">{fmt(totalCost * 12)}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Subscriptions</h3>
          <button
            onClick={() => dispatch({ type: 'ADD_SUBSCRIPTION' })}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <Plus size={16} /> Add
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-slate-500 text-sm">
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
            <tr className="border-t border-slate-200 bg-slate-50 font-semibold">
              <td className="px-5 py-3">Total (Active)</td>
              <td className="px-5 py-3 text-right text-amber-600">{fmt(totalCost)}</td>
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
