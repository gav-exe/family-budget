import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, LogIn } from 'lucide-react';

const loginConfetti = [
  {
    style: { top: '10%', left: '6%' }, anim: 'animate-drift',
    svg: <svg width="44" height="44" viewBox="0 0 34 34"><polygon points="17,4 30,29 4,29" fill="#ff5b57" stroke="#17140d" strokeWidth="3" strokeLinejoin="round" /></svg>,
  },
  {
    style: { top: '16%', right: '8%' }, anim: 'animate-sway',
    svg: <svg width="52" height="52" viewBox="0 0 40 40"><path d="M6 34 A28 28 0 0 1 34 6" fill="none" stroke="#17140d" strokeWidth="11" strokeLinecap="round" /><path d="M6 34 A28 28 0 0 1 34 6" fill="none" stroke="#12b3a4" strokeWidth="6" strokeLinecap="round" /></svg>,
  },
  {
    style: { top: '38%', left: '12%' }, anim: 'animate-bob',
    svg: <svg width="38" height="38" viewBox="0 0 30 30"><circle cx="15" cy="15" r="11" fill="#ffc531" stroke="#17140d" strokeWidth="3" /><circle cx="11" cy="13" r="1.8" fill="#17140d" /><circle cx="19" cy="13" r="1.8" fill="#17140d" /><circle cx="15" cy="20" r="1.8" fill="#17140d" /></svg>,
  },
  {
    style: { top: '60%', right: '10%' }, anim: 'animate-spin-slow',
    svg: <svg width="38" height="38" viewBox="0 0 30 30"><path d="M11 3h8v8h8v8h-8v8h-8v-8H3v-8h8z" fill="#6b5be6" stroke="#17140d" strokeWidth="3" strokeLinejoin="round" /></svg>,
  },
  {
    style: { top: '74%', left: '18%' }, anim: 'animate-sway',
    svg: <svg width="60" height="18" viewBox="0 0 52 16"><path d="M2 8 Q8 2 14 8 T26 8 T38 8 T50 8" fill="none" stroke="#17140d" strokeWidth="4" strokeLinecap="round" /></svg>,
  },
  {
    style: { top: '84%', right: '16%' }, anim: 'animate-drift',
    svg: <svg width="42" height="25" viewBox="0 0 34 20"><path d="M3 18 A14 14 0 0 1 31 18 Z" fill="#ffc531" stroke="#17140d" strokeWidth="3" strokeLinejoin="round" /></svg>,
  },
  {
    style: { top: '30%', right: '20%' }, anim: 'animate-bob',
    svg: <svg width="18" height="18" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#12b3a4" stroke="#17140d" strokeWidth="2.5" /></svg>,
  },
  {
    style: { top: '68%', left: '7%' }, anim: 'animate-drift',
    svg: <svg width="56" height="21" viewBox="0 0 48 18"><polyline points="2,14 10,4 18,14 26,4 34,14 42,4" fill="none" stroke="#17140d" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" /><polyline points="2,14 10,4 18,14 26,4 34,14 42,4" fill="none" stroke="#3aa0ff" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" /></svg>,
  },
  {
    style: { top: '22%', left: '22%' }, anim: 'animate-spin-slow',
    svg: <svg width="34" height="34" viewBox="0 0 30 30"><defs><clipPath id="loginStripedCircle"><circle cx="15" cy="15" r="12" /></clipPath></defs><circle cx="15" cy="15" r="12" fill="#ff5b57" /><g clipPath="url(#loginStripedCircle)" stroke="#17140d" strokeWidth="2.5"><line x1="0" y1="9" x2="30" y2="9" /><line x1="0" y1="15" x2="30" y2="15" /><line x1="0" y1="21" x2="30" y2="21" /></g><circle cx="15" cy="15" r="12" fill="none" stroke="#17140d" strokeWidth="3" /></svg>,
  },
  {
    style: { top: '50%', right: '22%' }, anim: 'animate-sway',
    svg: <svg width="26" height="26" viewBox="0 0 30 30"><path d="M11 3h8v8h8v8h-8v8h-8v-8H3v-8h8z" fill="#3aa0ff" stroke="#17140d" strokeWidth="3" strokeLinejoin="round" /></svg>,
  },
];

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
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div aria-hidden="true">
        {loginConfetti.map((shape, i) => (
          <div
            key={i}
            className={`fixed pointer-events-none -z-10 hidden md:block ${shape.anim}`}
            style={{ ...shape.style, animationDelay: `${-i * 1.7}s` }}
          >
            {shape.svg}
          </div>
        ))}
      </div>
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-mustard border-[3px] border-ink hard-shadow-sm text-ink mb-3">
            <Lock size={22} />
          </div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight text-ink">
            Cox Family <span className="marker-highlight">Budget</span>
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            {mode === 'signup' ? 'Create your shared login' : 'Sign in to your budget'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow-lg p-5 space-y-4">
          <div>
            <label className="block text-sm text-ink/70 font-medium mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border-[3px] border-ink text-ink focus:outline-none focus:ring-2 focus:ring-teal"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-ink/70 font-medium mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border-[3px] border-ink text-ink focus:outline-none focus:ring-2 focus:ring-teal"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="text-sm font-medium text-coral bg-white border-[3px] border-coral rounded-lg px-3 py-2">{error}</div>}
          {notice && <div className="text-sm font-medium text-teal bg-white border-[3px] border-teal rounded-lg px-3 py-2">{notice}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-coral text-white font-display font-bold border-[3px] border-ink hard-shadow press transition-colors disabled:opacity-60 cursor-pointer"
          >
            <LogIn size={16} />
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>

          <div className="text-center text-sm text-ink/60">
            {mode === 'signup' ? (
              <>Already have a login?{' '}
                <button type="button" onClick={() => { setMode('signin'); setError(''); setNotice(''); }} className="text-teal font-bold hover:underline cursor-pointer">Sign in</button>
              </>
            ) : (
              <>Need to create the shared login?{' '}
                <button type="button" onClick={() => { setMode('signup'); setError(''); setNotice(''); }} className="text-teal font-bold hover:underline cursor-pointer">Create account</button>
              </>
            )}
          </div>
        </form>

        <p className="text-center text-xs text-ink/40 mt-4">
          Your data is stored securely in Supabase and only visible when signed in.
        </p>
      </div>
    </div>
  );
}
