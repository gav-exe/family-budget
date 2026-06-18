import { useState } from 'react';
import { BudgetProvider } from './store';
import Dashboard from './components/Dashboard';
import PersonBudget from './components/PersonBudget';
import DebtTracker from './components/DebtTracker';
import Subscriptions from './components/Subscriptions';
import CancunTracker from './components/CancunTracker';
import BillCalendar from './components/BillCalendar';
import { LayoutDashboard, User, Users, CreditCard, Tv, Plane, CalendarDays, RotateCcw } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'gavin', label: 'Gavin', icon: User },
  { id: 'hazel', label: 'Hazel', icon: Users },
  { id: 'calendar', label: 'Bill Calendar', icon: CalendarDays },
  { id: 'debts', label: 'Debt Tracker', icon: CreditCard },
  { id: 'subscriptions', label: 'Subscriptions', icon: Tv },
  { id: 'cancun', label: 'Cancun', icon: Plane },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-white">Cox Family</span>
              <span className="text-cyan-400 ml-1.5">Budget</span>
            </h1>
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
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 border border-transparent'
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
        {activeTab === 'cancun' && <CancunTracker />}
      </main>

      <footer className="text-center text-xs text-slate-600 py-4 border-t border-slate-800">
        Data saved locally in your browser. Click any value to edit.
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
