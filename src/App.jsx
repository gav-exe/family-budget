import { useState } from 'react';
import { AuthProvider, useAuth } from './auth';
import { BudgetProvider } from './store';
import { isSupabaseConfigured } from './lib/supabase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PersonBudget from './components/PersonBudget';
import DebtTracker from './components/DebtTracker';
import Subscriptions from './components/Subscriptions';
import CancunTracker from './components/CancunTracker';
import BillCalendar from './components/BillCalendar';
import { LayoutDashboard, User, Users, CreditCard, Tv, Plane, CalendarDays, LogOut, CloudOff } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'gavin', label: 'Gavin', icon: User },
  { id: 'hazel', label: 'Hazel', icon: Users },
  { id: 'calendar', label: 'Bill Calendar', icon: CalendarDays },
  { id: 'debts', label: 'Debt Tracker', icon: CreditCard },
  { id: 'subscriptions', label: 'Subscriptions', icon: Tv },
  { id: 'cancun', label: 'Cancun', icon: Plane },
];

function MissingConfig() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md text-center bg-slate-800/80 border border-slate-700 rounded-2xl p-8">
        <CloudOff className="mx-auto text-amber-400 mb-4" size={36} />
        <h2 className="text-lg font-semibold text-white mb-2">Supabase isn't configured yet</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Set <code className="text-cyan-400">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-cyan-400">VITE_SUPABASE_ANON_KEY</code> in a{' '}
          <code className="text-cyan-400">.env</code> file for local dev, or in the
          repository's GitHub Actions secrets for the deployed site, then rebuild.
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { session, loading, signOut } = useAuth();

  if (!isSupabaseConfigured) return <MissingConfig />;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-white">Cox Family</span>
              <span className="text-cyan-400 ml-1.5">Budget</span>
            </h1>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut size={14} />
              Sign out
            </button>
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
        Synced securely with Supabase across your devices. Click any value to edit.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BudgetProvider>
        <AppContent />
      </BudgetProvider>
    </AuthProvider>
  );
}
