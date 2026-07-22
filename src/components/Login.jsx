import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, LogIn } from 'lucide-react';

export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setNotice('Account created. If email confirmation is on, check your inbox, then sign in.');
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // On success, the auth listener in the store swaps this screen for the app.
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 mb-3">
            <Lock size={22} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-slate-900">Cox Family</span>
            <span className="text-cyan-600 ml-1.5">Budget</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === 'signup' ? 'Create your shared login' : 'Sign in to your budget'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div>
            <label className="block text-sm text-slate-500 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-cyan-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-cyan-500"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          {notice && <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{notice}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition-colors disabled:opacity-60 cursor-pointer"
          >
            <LogIn size={16} />
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>

          <div className="text-center text-sm text-slate-500">
            {mode === 'signup' ? (
              <>Already have a login?{' '}
                <button type="button" onClick={() => { setMode('signin'); setError(''); setNotice(''); }} className="text-cyan-600 hover:text-cyan-700 cursor-pointer">Sign in</button>
              </>
            ) : (
              <>Need to create the shared login?{' '}
                <button type="button" onClick={() => { setMode('signup'); setError(''); setNotice(''); }} className="text-cyan-600 hover:text-cyan-700 cursor-pointer">Create account</button>
              </>
            )}
          </div>
        </form>

        <p className="text-center text-xs text-slate-400 mt-4">
          Your data is stored securely in Supabase and only visible when signed in.
        </p>
      </div>
    </div>
  );
}
