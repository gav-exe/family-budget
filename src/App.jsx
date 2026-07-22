import { useState } from 'react';
import { BudgetProvider, useBudget } from './store';
import Dashboard from './components/Dashboard';
import PersonBudget from './components/PersonBudget';
import DebtTracker from './components/DebtTracker';
import Envelopes from './components/Envelopes';
import Subscriptions from './components/Subscriptions';
import GoalsTracker from './components/GoalsTracker';
import BillCalendar from './components/BillCalendar';
import Login from './components/Login';
import { LayoutDashboard, User, Users, CreditCard, Tv, Target, CalendarDays, RotateCcw, LogOut, Wallet } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'gavin', label: 'Gavin', icon: User },
  { id: 'hazel', label: 'Hazel', icon: Users },
  { id: 'envelopes', label: 'Envelopes', icon: Wallet },
  { id: 'calendar', label: 'Bill Calendar', icon: CalendarDays },
  { id: 'debts', label: 'Debt Tracker', icon: CreditCard },
  { id: 'subscriptions', label: 'Subscriptions', icon: Tv },
  { id: 'goals', label: 'Goals', icon: Target },
];

const confettiShapes = [
  {
    style: { top: '14%', left: '1.5%' }, anim: 'animate-drift',
    svg: <svg width="34" height="34" viewBox="0 0 34 34"><polygon points="17,4 30,29 4,29" fill="#ff5b57" stroke="#17140d" strokeWidth="3" strokeLinejoin="round" /></svg>,
  },
  {
    style: { top: '30%', right: '2%' }, anim: 'animate-sway',
    svg: <svg width="42" height="42" viewBox="0 0 40 40"><path d="M6 34 A28 28 0 0 1 34 6" fill="none" stroke="#17140d" strokeWidth="11" strokeLinecap="round" /><path d="M6 34 A28 28 0 0 1 34 6" fill="none" stroke="#12b3a4" strokeWidth="6" strokeLinecap="round" /></svg>,
  },
  {
    style: { top: '56%', left: '1%' }, anim: 'animate-bob',
    svg: <svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="11" fill="#ffc531" stroke="#17140d" strokeWidth="3" /><circle cx="11" cy="13" r="1.8" fill="#17140d" /><circle cx="19" cy="13" r="1.8" fill="#17140d" /><circle cx="15" cy="20" r="1.8" fill="#17140d" /></svg>,
  },
  {
    style: { top: '72%', right: '2.5%' }, anim: 'animate-spin-slow',
    svg: <svg width="30" height="30" viewBox="0 0 30 30"><path d="M11 3h8v8h8v8h-8v8h-8v-8H3v-8h8z" fill="#6b5be6" stroke="#17140d" strokeWidth="3" strokeLinejoin="round" /></svg>,
  },
  {
    style: { top: '42%', left: '2.5%' }, anim: 'animate-sway',
    svg: <svg width="52" height="16" viewBox="0 0 52 16"><path d="M2 8 Q8 2 14 8 T26 8 T38 8 T50 8" fill="none" stroke="#17140d" strokeWidth="4" strokeLinecap="round" /></svg>,
  },
  {
    style: { top: '86%', left: '4%' }, anim: 'animate-drift',
    svg: <svg width="34" height="20" viewBox="0 0 34 20"><path d="M3 18 A14 14 0 0 1 31 18 Z" fill="#ffc531" stroke="#17140d" strokeWidth="3" strokeLinejoin="round" /></svg>,
  },
  {
    style: { top: '8%', right: '4%' }, anim: 'animate-bob',
    svg: <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#12b3a4" stroke="#17140d" strokeWidth="2.5" /></svg>,
  },
  {
    style: { top: '88%', right: '5%' }, anim: 'animate-drift',
    svg: <svg width="48" height="18" viewBox="0 0 48 18"><polyline points="2,14 10,4 18,14 26,4 34,14 42,4" fill="none" stroke="#17140d" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" /><polyline points="2,14 10,4 18,14 26,4 34,14 42,4" fill="none" stroke="#3aa0ff" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" /></svg>,
  },
];

function MemphisConfetti() {
  return (
    <div aria-hidden="true">
      {confettiShapes.map((shape, i) => (
        <div
          key={i}
          className={`fixed pointer-events-none -z-10 hidden md:block ${shape.anim}`}
          style={{ ...shape.style, animationDelay: `${-i * 2.3}s` }}
        >
          {shape.svg}
        </div>
      ))}
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { session, authLoading, signOut, cloudEnabled } = useBudget();

  // When Supabase is set up, require a login before showing the budget.
  if (cloudEnabled && authLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-ink/60">
        Loading…
      </div>
    );
  }
  if (cloudEnabled && !session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-cream">
      <MemphisConfetti />
      <header className="bg-cream/90 backdrop-blur-sm border-b-[3px] border-ink sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-extrabold tracking-tight text-ink">
              Cox Family <span className="marker-highlight">Budget</span>
            </h1>
            {cloudEnabled && session && (
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 text-sm font-bold text-ink bg-white border-2 border-ink rounded-full px-3 py-1 hard-shadow-sm press cursor-pointer"
              >
                <LogOut size={16} /> Sign out
              </button>
            )}
          </div>
          <nav className="flex gap-2 mt-3 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all cursor-pointer border-[3px] ${
                    active
                      ? 'bg-coral text-white border-ink hard-shadow-sm'
                      : 'text-ink/60 border-transparent hover:text-ink hover:border-ink/40 hover:bg-white'
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
        {activeTab === 'envelopes' && <Envelopes />}
        {activeTab === 'calendar' && <BillCalendar />}
        {activeTab === 'debts' && <DebtTracker />}
        {activeTab === 'subscriptions' && <Subscriptions />}
        {activeTab === 'goals' && <GoalsTracker />}
      </main>

      <footer className="text-center text-xs text-ink/40 py-4 border-t-2 border-ink/10">
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
