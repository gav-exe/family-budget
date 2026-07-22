import { useState } from 'react';
import { BudgetProvider, useBudget } from './store';
import Dashboard from './components/Dashboard';
import PersonBudget from './components/PersonBudget';
import DebtTracker from './components/DebtTracker';
import Subscriptions from './components/Subscriptions';
import GoalsTracker from './components/GoalsTracker';
import BillCalendar from './components/BillCalendar';
import Login from './components/Login';
import { LayoutDashboard, User, Users, CreditCard, Tv, Target, CalendarDays, RotateCcw, LogOut } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'gavin', label: 'Gavin', icon: User },
  { id: 'hazel', label: 'Hazel', icon: Users },
  { id: 'calendar', label: 'Bill Calendar', icon: CalendarDays },
  { id: 'debts', label: 'Debt Tracker', icon: CreditCard },
  { id: 'subscriptions', label: 'Subscriptions', icon: Tv },
  { id: 'goals', label: 'Goals', icon: Target },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { session, authLoading, signOut, cloudEnabled } = useBudget();

  // When Supabase is set up, require a login before showing the budget.
  if (cloudEnabled && authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }
  if (cloudEnabled && !session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-slate-900">Cox Family</span>
              <span className="text-cyan-600 ml-1.5">Budget</span>
            </h1>
            {cloudEnabled && session && (
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <LogOut size={16} /> Sign out
              </button>
            )}
          </div>
          <nav className="flex gap-1 mt-3 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'gavin' && <PersonBudget personKey="gavin" />}
        {activeTab === 'hazel' && <PersonBudget personKey="hazel" />}
        {activeTab === 'calendar' && <BillCalendar />}
        {activeTab === 'debts' && <DebtTracker />}
        {activeTab === 'subscriptions' && <Subscriptions />}
        {activeTab === 'goals' && <GoalsTracker />}
      </main>

      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200">
        Saved to your shared cloud budget. Click any value to edit.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BudgetProvider>
      <AppContent />
    </BudgetProvider>
  );
}
