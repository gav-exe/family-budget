import { useBudget, getPersonTotals } from '../store';
import EditableCell from './EditableCell';
import StatCard from './StatCard';
import { DollarSign, Wallet, Zap, Plus, Trash2 } from 'lucide-react';

const fmt = v => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PersonBudget({ personKey }) {
  const { state, dispatch } = useBudget();
  const person = state[personKey];
  const totals = getPersonTotals(person);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Income"
          value={fmt(totals.totalIncome)}
          icon={<DollarSign size={18} />}
          color="text-green-600"
          sub="Paychecks + side hustle"
        />
        <StatCard
          label="Total Expenses"
          value={fmt(totals.totalExpenses)}
          icon={<Wallet size={18} />}
          color="text-amber-600"
          sub="Bills + card minimums"
        />
        <StatCard
          label="Debt Attack"
          value={fmt(totals.available)}
          icon={<Zap size={18} />}
          color={totals.available >= 0 ? 'text-cyan-600' : 'text-red-500'}
          sub="Available for extra payments"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold">Income</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-slate-500 text-sm">
              <th className="text-left px-5 py-3 font-medium">Source</th>
              <th className="text-right px-5 py-3 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {person.paychecks.map((pc, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-700">{pc.name}</td>
                <td className="px-5 py-3 text-right text-green-600">
                  <EditableCell value={pc.amount} prefix="$" onChange={v => dispatch({ type: 'UPDATE_PAYCHECK', person: personKey, index: i, amount: v })} />
                </td>
              </tr>
            ))}
            {personKey === 'gavin' && (
              <tr className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-700">Side Hustle</td>
                <td className="px-5 py-3 text-right text-green-600">
                  <EditableCell value={person.sideHustle} prefix="$" onChange={v => dispatch({ type: 'UPDATE_SIDE_HUSTLE', person: personKey, amount: v })} />
                </td>
              </tr>
            )}
            <tr className="border-t border-slate-200 bg-slate-50 font-semibold">
              <td className="px-5 py-3">Total Income</td>
              <td className="px-5 py-3 text-right text-green-600">{fmt(totals.totalIncome)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Living Expenses</h3>
          <button
            onClick={() => dispatch({ type: 'ADD_EXPENSE', person: personKey })}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <Plus size={16} /> Add
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-slate-500 text-sm">
              <th className="text-left px-5 py-3 font-medium">Expense</th>
              <th className="text-right px-5 py-3 font-medium">Amount</th>
              <th className="text-right px-5 py-3 font-medium w-24">Due</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {person.expenses.map((exp, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 group">
                <td className="px-5 py-3">
                  <EditableCell value={exp.name} type="text" onChange={v => dispatch({ type: 'UPDATE_EXPENSE', person: personKey, index: i, field: 'name', value: v })} className="text-slate-700" />
                </td>
                <td className="px-5 py-3 text-right text-amber-600">
                  <EditableCell value={exp.amount} prefix="$" onChange={v => dispatch({ type: 'UPDATE_EXPENSE', person: personKey, index: i, field: 'amount', value: v })} />
                </td>
                <td className="px-5 py-3 text-right">
                  <EditableCell value={exp.dueOn || '-'} type="text" onChange={v => dispatch({ type: 'UPDATE_EXPENSE', person: personKey, index: i, field: 'dueOn', value: v })} className="text-slate-400 text-sm" />
                </td>
                <td className="px-2 py-3">
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_EXPENSE', person: personKey, index: i })}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {(person.minimumCardPayments > 0 || personKey === 'gavin') && (
              <tr className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-700">Minimum Card Payments</td>
                <td className="px-5 py-3 text-right text-amber-600">
                  <EditableCell value={person.minimumCardPayments} prefix="$" onChange={v => dispatch({ type: 'UPDATE_MIN_CARD_PAYMENTS', person: personKey, amount: v })} />
                </td>
                <td className="px-5 py-3"></td>
                <td></td>
              </tr>
            )}
            <tr className="border-t border-slate-200 bg-slate-50 font-semibold">
              <td className="px-5 py-3">Total Expenses</td>
              <td className="px-5 py-3 text-right text-amber-600">{fmt(totals.totalExpenses)}</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={`rounded-xl p-5 border ${totals.available >= 0 ? 'bg-cyan-50 border-cyan-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-slate-500">Available for Debt Attack</span>
            <p className="text-xs text-slate-400 mt-0.5">Income minus all expenses</p>
          </div>
          <span className={`text-3xl font-bold ${totals.available >= 0 ? 'text-cyan-600' : 'text-red-500'}`}>
            {fmt(totals.available)}
          </span>
        </div>
      </div>
    </div>
  );
}
