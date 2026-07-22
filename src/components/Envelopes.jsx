import { useState } from 'react';
import { useBudget } from '../store';
import EditableCell from './EditableCell';
import { Plus, Trash2, RotateCcw, PiggyBank } from 'lucide-react';

const fmt = v => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtRound = v => (v < 0 ? '-$' : '$') + Math.abs(Math.round(Number(v))).toLocaleString('en-US');
const SEG_COLORS = ['bg-teal', 'bg-coral', 'bg-mustard', 'bg-violet', 'bg-sky'];
const ENVELOPE_MODE_KEY = 'cox-family-budget-envelope-mode';

const spentOf = e => (e.log || []).reduce((s, l) => s + (Number(l.amount) || 0), 0);

function RingGauge({ remaining, budget }) {
  const pctLeft = budget > 0
    ? Math.max(0, Math.min(1, remaining / budget))
    : (remaining < 0 ? 0 : 1);
  const arcColor = remaining < 0 ? '#ff5b57' : pctLeft > 0.5 ? '#12b3a4' : pctLeft >= 0.25 ? '#ffc531' : '#ff5b57';
  const size = 90;
  const trackW = 14;
  const r = (size - trackW) / 2;
  const c = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="#ffffff" stroke="#17140d" strokeWidth={trackW} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f5efe2" strokeWidth={trackW - 5} />
      {pctLeft > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={arcColor}
          strokeWidth={trackW - 5}
          strokeDasharray={`${pctLeft * c} ${c}`}
          strokeLinecap="butt"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.6s ease' }}
        />
      )}
      <text
        x={size / 2}
        y={size / 2 + 5}
        textAnchor="middle"
        fontFamily="'Bricolage Grotesque', sans-serif"
        fontWeight="800"
        fontSize="14"
        fill={remaining < 0 ? '#ff5b57' : '#17140d'}
      >
        {fmtRound(remaining)}
      </text>
    </svg>
  );
}

function EnvelopeCard({ env, dispatch, perPaycheck }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [person, setPerson] = useState('gavin');

  const budget = Number(env.budget) || 0;
  const spent = spentOf(env);
  const remaining = budget - spent;

  function handleSpend(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    dispatch({ type: 'LOG_SPEND', envelopeId: env.id, amount: amt, note: note.trim(), person });
    setAmount('');
    setNote('');
  }

  return (
    <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5 group">
      <div className="flex justify-between items-start mb-3">
        <EditableCell
          value={env.name}
          type="text"
          onChange={v => dispatch({ type: 'UPDATE_ENVELOPE', id: env.id, field: 'name', value: v })}
          className="font-display font-bold text-ink"
        />
        <button
          onClick={() => dispatch({ type: 'REMOVE_ENVELOPE', id: env.id })}
          className="opacity-0 group-hover:opacity-100 text-coral hover:text-coral/70 transition-all cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <RingGauge remaining={remaining} budget={budget} />
          <div className="text-xs text-ink/50 mt-1">of {fmtRound(budget)} left</div>
          <div className="text-[10px] text-ink/40">{fmt(spent)} spent</div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs text-ink/40">{perPaycheck ? 'Allowance / paycheck' : 'Monthly budget'}</span>
          {perPaycheck ? (
            <>
              <div className="font-display font-bold text-ink text-lg">{fmt(budget / 2)}</div>
              <div className="text-xs text-ink/40">
                <EditableCell
                  value={env.budget}
                  prefix="$"
                  onChange={v => dispatch({ type: 'UPDATE_ENVELOPE', id: env.id, field: 'budget', value: v })}
                  className="text-ink/40 text-xs"
                />/mo
              </div>
            </>
          ) : (
            <div className="font-display font-bold text-ink text-lg">
              <EditableCell
                value={env.budget}
                prefix="$"
                onChange={v => dispatch({ type: 'UPDATE_ENVELOPE', id: env.id, field: 'budget', value: v })}
              />
            </div>
          )}
          {remaining < 0 && (
            <span className="inline-block mt-1 text-xs bg-coral text-white px-2 py-0.5 rounded-full font-bold border-2 border-ink hard-shadow-sm">
              OVER BY {fmtRound(Math.abs(remaining))}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSpend} className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="$0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-24 bg-white text-ink rounded-lg px-3 py-2 text-sm outline-none border-[3px] border-ink focus:ring-2 focus:ring-teal"
        />
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          className="flex-1 min-w-[100px] bg-white text-ink rounded-lg px-3 py-2 text-sm outline-none border-[3px] border-ink focus:ring-2 focus:ring-teal"
        />
        <div className="flex rounded-full border-2 border-ink overflow-hidden shrink-0">
          <button
            type="button"
            onClick={() => setPerson('gavin')}
            className={`px-3 py-2 text-xs font-bold cursor-pointer transition-colors ${person === 'gavin' ? 'bg-sky text-white' : 'bg-white text-ink/50 hover:text-ink'}`}
          >
            Gavin
          </button>
          <button
            type="button"
            onClick={() => setPerson('hazel')}
            className={`px-3 py-2 text-xs font-bold cursor-pointer transition-colors ${person === 'hazel' ? 'bg-violet text-white' : 'bg-white text-ink/50 hover:text-ink'}`}
          >
            Hazel
          </button>
        </div>
        <button
          type="submit"
          className="bg-coral text-white text-sm font-bold px-4 py-2 rounded-full border-[3px] border-ink hard-shadow-sm press cursor-pointer"
        >
          Spend
        </button>
      </form>
    </div>
  );
}

export default function Envelopes() {
  const { state, dispatch } = useBudget();
  const envelopes = state.envelopes || [];

  // 'Monthly' (default) vs 'Per Paycheck' reframes allowance figures only;
  // spent/remaining always show real monthly-truth numbers. Persisted so the
  // choice survives reloads; fails soft if storage is unavailable.
  const [perPaycheck, setPerPaycheck] = useState(() => {
    try { return localStorage.getItem(ENVELOPE_MODE_KEY) === 'paycheck'; } catch { return false; }
  });
  function setMode(pp) {
    setPerPaycheck(pp);
    try { localStorage.setItem(ENVELOPE_MODE_KEY, pp ? 'paycheck' : 'monthly'); } catch {}
  }

  const totalAllowance = envelopes.reduce((s, e) => s + (Number(e.budget) || 0), 0);
  const totalSpent = envelopes.reduce((s, e) => s + spentOf(e), 0);
  const totalRemaining = totalAllowance - totalSpent;

  const recent = envelopes
    .flatMap(e => (e.log || []).map(l => ({ ...l, envelopeId: e.id, envelopeName: e.name })))
    .sort((a, b) => new Date(b.ts) - new Date(a.ts))
    .slice(0, 10);

  function handleNewMonth() {
    if (window.confirm('Refill all envelopes for a new month? This clears every spending entry.')) {
      dispatch({ type: 'RESET_ENVELOPES' });
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-violet border-[3px] border-ink hard-shadow-sm flex items-center justify-center shrink-0">
              <PiggyBank size={28} className="text-white" />
            </span>
            <div>
              <h2 className="text-2xl font-display font-extrabold text-ink">Envelopes</h2>
              <p className="text-sm text-ink/60">Cash-style budgeting. Log it when you spend it.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 rounded-full border-2 border-ink bg-white p-1">
              <button
                onClick={() => setMode(false)}
                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${!perPaycheck ? 'bg-teal text-white border-2 border-ink hard-shadow-sm' : 'text-ink/50 hover:text-ink border-2 border-transparent'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setMode(true)}
                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${perPaycheck ? 'bg-teal text-white border-2 border-ink hard-shadow-sm' : 'text-ink/50 hover:text-ink border-2 border-transparent'}`}
              >
                Per Paycheck
              </button>
            </div>
            <button
              onClick={handleNewMonth}
              className="flex items-center gap-1.5 text-sm font-bold text-ink bg-mustard border-[3px] border-ink rounded-full px-4 py-2 hard-shadow-sm press cursor-pointer"
            >
              <RotateCcw size={16} /> Start New Month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <span className="text-xs text-ink/40">{perPaycheck ? 'Allowance / Paycheck' : 'Total Allowance'}</span>
            <div className="text-lg font-display font-extrabold text-ink">{fmt(perPaycheck ? totalAllowance / 2 : totalAllowance)}</div>
          </div>
          <div>
            <span className="text-xs text-ink/40">Total Spent</span>
            <div className="text-lg font-display font-extrabold text-coral">{fmt(totalSpent)}</div>
          </div>
          <div>
            <span className="text-xs text-ink/40">Remaining</span>
            <div className={`text-lg font-display font-extrabold ${totalRemaining < 0 ? 'text-coral' : 'text-teal'}`}>{fmt(totalRemaining)}</div>
          </div>
        </div>

        <div className="w-full h-5 bg-white border-[3px] border-ink rounded-full overflow-hidden flex">
          {envelopes.map((e, i) => {
            const w = totalAllowance > 0 ? (spentOf(e) / totalAllowance) * 100 : 0;
            if (w <= 0) return null;
            return (
              <div
                key={e.id}
                className={`h-full ${SEG_COLORS[i % SEG_COLORS.length]} border-r-2 border-ink last:border-r-0`}
                style={{ width: `${w}%`, transition: 'width 0.6s ease' }}
                title={`${e.name}: ${fmt(spentOf(e))}`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {envelopes.map((e, i) => (
            <div key={e.id} className="flex items-center gap-1.5 text-xs text-ink/60">
              <span className={`w-2.5 h-2.5 rounded-full border-2 border-ink ${SEG_COLORS[i % SEG_COLORS.length]}`} />
              {e.name}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-display font-extrabold text-ink">Your Envelopes</h3>
        <button
          onClick={() => dispatch({ type: 'ADD_ENVELOPE' })}
          className="flex items-center gap-1.5 text-sm font-bold text-ink bg-white border-2 border-ink rounded-full px-3 py-1 hard-shadow-sm press cursor-pointer"
        >
          <Plus size={16} /> Add Envelope
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {envelopes.map(env => (
          <EnvelopeCard key={env.id} env={env} dispatch={dispatch} perPaycheck={perPaycheck} />
        ))}
      </div>
      {envelopes.length === 0 && (
        <p className="text-sm text-ink/40 text-center py-8">
          No envelopes yet. Click "Add Envelope" to create one.
        </p>
      )}

      <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
        <h3 className="text-xl font-display font-extrabold text-ink mb-4">Recent Activity</h3>
        {recent.length > 0 ? (
          <div className="space-y-2">
            {recent.map(l => (
              <div key={`${l.envelopeId}-${l.id}`} className="flex items-center justify-between p-3 rounded-xl border-2 border-ink/15 bg-white hover:border-ink/60 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border-2 border-ink capitalize shrink-0 ${l.person === 'gavin' ? 'bg-sky text-white' : 'bg-violet text-white'}`}>
                    {l.person}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm text-ink font-medium truncate block">{l.note || l.envelopeName}</span>
                    <span className="text-xs text-ink/40">
                      {l.envelopeName} · {new Date(l.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-display font-bold text-ink">{fmt(l.amount)}</span>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_SPEND', envelopeId: l.envelopeId, logId: l.id })}
                    className="opacity-0 group-hover:opacity-100 text-coral hover:text-coral/70 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink/40 text-sm">No spending logged yet. Use any envelope's quick form to add the first entry.</p>
        )}
      </div>
    </div>
  );
}
