import { useState, useMemo } from 'react';
import { useBudget } from '../store';
import { Plus, X, ChevronLeft, ChevronRight, DollarSign, Trash2 } from 'lucide-react';

const fmt = v => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PERSON_COLORS = {
  gavin: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' },
  hazel: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', dot: 'bg-purple-500' },
  debt: { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-200', dot: 'bg-red-500' },
  custom: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500' },
};

function parseDueDay(dueOn) {
  if (!dueOn) return null;
  const match = dueOn.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export default function BillCalendar() {
  const { state, dispatch } = useBudget();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBill, setNewBill] = useState({ name: '', amount: '', person: 'gavin' });

  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = now.getDate();
  const isCurrentMonth = monthOffset === 0;

  const allBills = useMemo(() => {
    const bills = [];

    state.gavin.expenses.forEach(exp => {
      const day = parseDueDay(exp.dueOn);
      if (day && day <= daysInMonth) {
        bills.push({ day, name: exp.name, amount: exp.amount, source: 'gavin', type: 'expense' });
      }
    });

    state.hazel.expenses.forEach(exp => {
      const day = parseDueDay(exp.dueOn);
      if (day && day <= daysInMonth) {
        bills.push({ day, name: exp.name, amount: exp.amount, source: 'hazel', type: 'expense' });
      }
    });

    state.debts.forEach(debt => {
      if (debt.currentBalance <= 0) return;
      const day = parseDueDay(debt.dueOn);
      if (day && day <= daysInMonth) {
        bills.push({ day, name: debt.name, amount: debt.minPayment, source: 'debt', type: 'debt' });
      }
    });

    (state.calendarBills || []).forEach(bill => {
      if (bill.day <= daysInMonth) {
        bills.push({ ...bill, source: 'custom', type: 'custom' });
      }
    });

    return bills;
  }, [state, daysInMonth]);

  const billsByDay = useMemo(() => {
    const map = {};
    allBills.forEach(bill => {
      if (!map[bill.day]) map[bill.day] = [];
      map[bill.day].push(bill);
    });
    return map;
  }, [allBills]);

  const { gavinPaydays, hazelPaydays } = useMemo(() => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month, daysInMonth);

    function calcPaydays(ref) {
      const days = new Set();
      let d = new Date(ref);
      while (d > monthStart) d.setDate(d.getDate() - 14);
      while (d <= monthEnd) {
        if (d >= monthStart) days.add(d.getDate());
        d.setDate(d.getDate() + 14);
      }
      return days;
    }

    return {
      gavinPaydays: calcPaydays(new Date(2026, 5, 4)),  // every other Thu from June 4
      hazelPaydays: calcPaydays(new Date(2026, 5, 12)),  // every other Fri from June 12
    };
  }, [year, month, daysInMonth]);

  const monthTotal = allBills.reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const paidDays = isCurrentMonth ? today : 0;
  const upcomingBills = isCurrentMonth
    ? allBills.filter(b => b.day >= today).sort((a, b) => a.day - b.day)
    : allBills.sort((a, b) => a.day - b.day);

  function handleAddBill(e) {
    e.preventDefault();
    if (!newBill.name || !newBill.amount || !selectedDay) return;
    dispatch({ type: 'ADD_CALENDAR_BILL', day: selectedDay, name: newBill.name, amount: parseFloat(newBill.amount), person: newBill.person });
    setNewBill({ name: '', amount: '', person: 'gavin' });
    setShowAddForm(false);
  }

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} className="min-h-[100px]" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayBills = billsByDay[day] || [];
    const isToday = isCurrentMonth && day === today;
    const isPast = isCurrentMonth && day < today;
    const isSelected = selectedDay === day;
    const isGavinPayday = gavinPaydays.has(day);
    const isHazelPayday = hazelPaydays.has(day);
    const dayTotal = dayBills.reduce((s, b) => s + (Number(b.amount) || 0), 0);

    cells.push(
      <div
        key={day}
        onClick={() => setSelectedDay(selectedDay === day ? null : day)}
        className={`min-h-[100px] p-1.5 rounded-lg border cursor-pointer transition-all ${
          isSelected ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-200' :
          isToday ? 'border-cyan-300 bg-cyan-50' :
          isPast ? 'border-slate-200 bg-slate-50' :
          'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="flex items-center gap-1">
            <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
              isToday ? 'bg-cyan-600 text-white' : isPast ? 'text-slate-400' : 'text-slate-700'
            }`}>
              {day}
            </span>
            {isGavinPayday && <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1 rounded" title="Gavin's Payday">G💰</span>}
            {isHazelPayday && <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-1 rounded" title="Hazel's Payday">H💰</span>}
          </span>
          {dayTotal > 0 && (
            <span className="text-[10px] text-amber-600 font-medium">{fmt(dayTotal)}</span>
          )}
        </div>
        <div className="space-y-0.5">
          {dayBills.slice(0, 3).map((bill, i) => {
            const colors = PERSON_COLORS[bill.source] || PERSON_COLORS.custom;
            return (
              <div key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} truncate`}>
                {bill.name}
              </div>
            );
          })}
          {dayBills.length > 3 && (
            <div className="text-[10px] text-slate-400 pl-1">+{dayBills.length - 3} more</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMonthOffset(o => o - 1)} className="p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-xl font-bold text-slate-900 min-w-[200px] text-center">{monthName}</h2>
          <button onClick={() => setMonthOffset(o => o + 1)} className="p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
            <ChevronRight size={18} />
          </button>
          {monthOffset !== 0 && (
            <button onClick={() => setMonthOffset(0)} className="text-xs text-cyan-600 hover:text-cyan-700 transition-colors cursor-pointer">
              Today
            </button>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Monthly Bills</div>
          <div className="text-lg font-bold text-amber-600">{fmt(monthTotal)}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs">
        {Object.entries(PERSON_COLORS).map(([key, colors]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
            <span className="text-slate-500 capitalize">{key === 'debt' ? 'Debt Payments' : key === 'custom' ? 'Custom Bills' : key}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs text-slate-400 font-medium py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells}
        </div>
      </div>

      {selectedDay && (
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {viewDate.toLocaleDateString('en-US', { month: 'long' })} {selectedDay}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 text-sm text-cyan-600 hover:text-cyan-700 transition-colors cursor-pointer"
              >
                {showAddForm ? <X size={16} /> : <Plus size={16} />}
                {showAddForm ? 'Cancel' : 'Add Bill'}
              </button>
              <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddBill} className="bg-slate-50 rounded-lg p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Bill name"
                  value={newBill.name}
                  onChange={e => setNewBill({ ...newBill, name: e.target.value })}
                  className="bg-white text-slate-900 rounded-lg px-3 py-2 text-sm outline-none ring-1 ring-slate-300 focus:ring-cyan-500"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newBill.amount}
                  onChange={e => setNewBill({ ...newBill, amount: e.target.value })}
                  className="bg-white text-slate-900 rounded-lg px-3 py-2 text-sm outline-none ring-1 ring-slate-300 focus:ring-cyan-500"
                />
                <select
                  value={newBill.person}
                  onChange={e => setNewBill({ ...newBill, person: e.target.value })}
                  className="bg-white text-slate-900 rounded-lg px-3 py-2 text-sm outline-none ring-1 ring-slate-300 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="gavin">Gavin</option>
                  <option value="hazel">Hazel</option>
                </select>
              </div>
              <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer">
                Add to {viewDate.toLocaleDateString('en-US', { month: 'long' })} {selectedDay}
              </button>
            </form>
          )}

          {(billsByDay[selectedDay] || []).length > 0 ? (
            <div className="space-y-2">
              {(billsByDay[selectedDay] || []).map((bill, i) => {
                const colors = PERSON_COLORS[bill.source] || PERSON_COLORS.custom;
                return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${colors.border} ${colors.bg} group`}>
                    <div className="flex items-center gap-3">
                      <DollarSign size={16} className={colors.text} />
                      <div>
                        <span className={`font-medium text-sm ${colors.text}`}>{bill.name}</span>
                        <span className="text-xs text-slate-400 ml-2 capitalize">{bill.source === 'debt' ? 'Debt Payment' : bill.source}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-900">{fmt(bill.amount)}</span>
                      {bill.type === 'custom' && (
                        <button
                          onClick={() => dispatch({ type: 'REMOVE_CALENDAR_BILL', id: bill.id })}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="text-slate-500">Day Total</span>
                <span className="font-bold text-amber-600">
                  {fmt((billsByDay[selectedDay] || []).reduce((s, b) => s + (Number(b.amount) || 0), 0))}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No bills on this day. Click "Add Bill" to add one.</p>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="text-lg font-semibold mb-4">
          {isCurrentMonth ? 'Upcoming Bills' : 'All Bills This Month'}
        </h3>
        {upcomingBills.length > 0 ? (
          <div className="space-y-2">
            {upcomingBills.map((bill, i) => {
              const colors = PERSON_COLORS[bill.source] || PERSON_COLORS.custom;
              const isToday2 = isCurrentMonth && bill.day === today;
              return (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${isToday2 ? 'bg-cyan-50 border border-cyan-200' : 'bg-slate-50 hover:bg-slate-100'} transition-colors`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-8 text-center text-sm font-medium ${isToday2 ? 'text-cyan-600' : 'text-slate-400'}`}>
                      {bill.day}{ordinal(bill.day)}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <span className="text-sm text-slate-700">{bill.name}</span>
                  </div>
                  <span className="font-medium text-amber-600 text-sm">{fmt(bill.amount)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No upcoming bills this month.</p>
        )}
      </div>
    </div>
  );
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return (s[(v - 20) % 10] || s[v] || s[0]);
}
