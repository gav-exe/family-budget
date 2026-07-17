import { useState } from 'react';
import { useAuth } from '../auth';
import { Wallet } from 'lucide-react';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const fn = mode === 'signin' ? signIn : signUp;
      const { error } = await fn(email.trim(), password);
      if (error) {
        setError(error.message);
      } else if (mode === 'signup') {
        setNotice('Account created! If email confirmation is enabled, confirm via email first — then sign in.');
        setMode('signin');
        setPassword('');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 mb-4">
            <Wallet className="text-cyan-400" size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-white">Cox Family</span>
            <span className="text-cyan-400 ml-1.5">Budget</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Sign in to sync your budget across devices</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{error}</p>
          )}
          {notice && (
            <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">{notice}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-lg py-2.5 text-sm transition-colors cursor-pointer"
          >
            {busy ? 'One moment…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setNotice(''); }}
            className="w-full text-center text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {mode === 'signin' ? 'First time here? Create your account' : 'Already have an account? Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
