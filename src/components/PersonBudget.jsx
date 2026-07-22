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
          color="bg-teal text-white"
          sub="Paychecks + side hustle"
        />
        <StatCard
          label="Total Expenses"
          value={fmt(totals.totalExpenses)}
          icon={<Wallet size={18} />}
          color="bg-mustard text-ink"
          sub="Bills + card minimums"
        />
        <StatCard
          label="Debt Attack"
          value={fmt(totals.available)}
          icon={<Zap size={18} />}
          color={totals.available >= 0 ? 'bg-teal text-white' : 'bg-coral text-white'}
          sub="Available for extra payments"
        />
      </div>

      <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow overflow-hidden">
        <div className="px-5 py-4 border-b-[3px] border-ink bg-cream">
          <h3 className="text-xl font-display font-extrabold text-ink">Income</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-ink/50 text-sm">
              <th className="text-left px-5 py-3 font-medium">Source</th>
              <th className="text-right px-5 py-3 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {person.paychecks.map((pc, i) => (
              <tr key={i} className="border-t-2 border-ink/10 hover:bg-cream">
                <td className="px-5 py-3 text-ink/80">{pc.name}</td>
                <td className="px-5 py-3 text-right text-teal font-bold">
                  <EditableCell value={pc.amount} prefix="$" onChange={v => dispatch({ type: 'UPDATE_PAYCHECK', person: personKey, index: i, amount: v })} />
                </td>
              </tr>
            ))}
            {personKey === 'gavin' && (
              <tr className="border-t-2 border-ink/10 hover:bg-cream">
                <td className="px-5 py-3 text-ink/80">Side Hustle</td>
                <td className="px-5 py-3 text-right text-teal font-bold">
                  <EditableCell value={person.sideHustle} prefix="$" onChange={v => dispatch({ type: 'UPDATE_SIDE_HUSTLE', person: personKey, amount: v })} />
                </td>
              </tr>
            )}
            <tr className="border-t-[3px] border-ink bg-cream font-bold">
              <td className="px-5 py-3 text-ink">Total Income</td>
              <td className="px-5 py-3 text-right text-teal">{fmt(totals.totalIncome)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow overflow-hidden">
        <div className="px-5 py-4 border-b-[3px] border-ink bg-cream flex justify-between items-center">
          <h3 className="text-xl font-display font-extrabold text-ink">Living Expenses</h3>
          <button
            onClick={() => dispatch({ type: 'ADD_EXPENSE', person: personKey })}
            className="flex items-center gap-1.5 text-sm font-bold text-ink bg-white border-2 border-ink rounded-full px-3 py-1 hard-shadow-sm press cursor-pointer"
          >
            <Plus size={16} /> Add
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-ink/50 text-sm">
              <th className="text-left px-5 py-3 font-medium">Expense</th>
              <th className="text-right px-5 py-3 font-medium">Amount</th>
              <th className="text-right px-5 py-3 font-medium w-24">Due</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {person.expenses.map((exp, i) => (
              <tr key={i} className="border-t-2 border-ink/10 hover:bg-cream group">
                <td className="px-5 py-3">
                  <EditableCell value={exp.name} type="text" onChange={v => dispatch({ type: 'UPDATE_EXPENSE', person: personKey, index: i, field: 'name', value: v })} className="text-ink/80" />
                </td>
                <td className="px-5 py-3 text-right text-ink font-medium">
                  <EditableCell value={exp.amount} prefix="$" onChange={v => dispatch({ type: 'UPDATE_EXPENSE', person: personKey, index: i, field: 'amount', value: v })} />
                </td>
                <td className="px-5 py-3 text-right">
                  <EditableCell value={exp.dueOn || '-'} type="text" onChange={v => dispatch({ type: 'UPDATE_EXPENSE', person: personKey, index: i, field: 'dueOn', value: v })} className="text-ink/40 text-sm" />
                </td>
                <td className="px-2 py-3">
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_EXPENSE', person: personKey, index: i })}
                    className="opacity-0 group-hover:opacity-100 text-coral hover:text-coral/70 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {(person.minimumCardPayments > 0 || personKey === 'gavin') && (
              <tr className="border-t-2 border-ink/10 hover:bg-cream">
                <td className="px-5 py-3 text-ink/80">Minimum Card Payments</td>
                <td className="px-5 py-3 text-right text-ink font-medium">
                  <EditableCell value={person.minimumCardPayments} prefix="$" onChange={v => dispatch({ type: 'UPDATE_MIN_CARD_PAYMENTS', person: personKey, amount: v })} />
                </td>
                <td className="px-5 py-3"></td>
                <td></td>
              </tr>
            )}
            <tr className="border-t-[3px] border-ink bg-cream font-bold">
              <td className="px-5 py-3 text-ink">Total Expenses</td>
              <td className="px-5 py-3 text-right">
                <span className="bg-mustard text-ink px-2 py-0.5 rounded-md border-2 border-ink">{fmt(totals.totalExpenses)}</span>
              </td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={`rounded-[22px] p-5 border-[3px] border-ink hard-shadow-lg ${totals.available >= 0 ? 'bg-teal' : 'bg-coral'}`}>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-white/80 font-medium">Available for Debt Attack</span>
            <p className="text-xs text-white/60 mt-0.5">Income minus all expenses</p>
          </div>
          <span className="text-3xl font-display font-extrabold text-white">
            {fmt(totals.available)}
          </span>
        </div>
      </div>
    </div>
  );
}
