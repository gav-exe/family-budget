import { useBudget, getDebtStats } from '../store';
import EditableCell from './EditableCell';
import ProgressBar from './ProgressBar';
import SnowballSimulator from './SnowballSimulator';
import { Plus, Trash2, CheckCircle, Clock } from 'lucide-react';

const fmt = v => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function DebtRow({ debt, dispatch, color }) {
  const paidOff = debt.currentBalance <= 0;
  const pctPaid = debt.originalBalance > 0 ? (debt.originalBalance - debt.currentBalance) / debt.originalBalance : 0;
  const monthsLeft = debt.minPayment > 0 && debt.currentBalance > 0 ? Math.ceil(debt.currentBalance / debt.minPayment) : 0;
  const payoffDate = monthsLeft > 0 ? new Date(Date.now() + monthsLeft * 30.44 * 86400000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null;

  return (
    <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5 group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {paidOff ? <CheckCircle size={18} className="text-teal" /> : <Clock size={18} className="text-ink/30" />}
          <EditableCell value={debt.name} type="text" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'name', value: v })} className="font-display font-bold text-ink" />
        </div>
        <div className="flex items-center gap-2">
          {paidOff && <span className="text-xs bg-teal text-white px-2 py-0.5 rounded-full font-bold border-2 border-ink hard-shadow-sm">PAID OFF</span>}
          <button onClick={() => dispatch({ type: 'REMOVE_DEBT', id: debt.id })} className="opacity-0 group-hover:opacity-100 text-coral hover:text-coral/70 transition-all cursor-pointer">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div>
          <span className="text-xs text-ink/40">Original</span>
          <div className="text-sm text-ink/60">
            <EditableCell value={debt.originalBalance} prefix="$" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'originalBalance', value: v })} />
          </div>
        </div>
        <div>
          <span className="text-xs text-ink/40">Current</span>
          <div className={`text-sm font-bold ${paidOff ? 'text-teal' : 'text-ink'}`}>
            <EditableCell value={debt.currentBalance} prefix="$" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'currentBalance', value: v })} />
          </div>
        </div>
        <div>
          <span className="text-xs text-ink/40">Min Payment</span>
          <div className="text-sm text-ink font-medium">
            <EditableCell value={debt.minPayment} prefix="$" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'minPayment', value: v })} />
          </div>
        </div>
        <div>
          <span className="text-xs text-ink/40">Due On</span>
          <div className="text-sm text-ink/60">
            <EditableCell value={debt.dueOn || '-'} type="text" onChange={v => dispatch({ type: 'UPDATE_DEBT', id: debt.id, field: 'dueOn', value: v })} />
          </div>
        </div>
      </div>

      <ProgressBar value={debt.originalBalance - debt.currentBalance} max={debt.originalBalance} color={paidOff ? 'bg-teal' : color} />
      <div className="flex justify-between mt-1.5 text-xs text-ink/40">
        <span>{(pctPaid * 100).toFixed(1)}% paid</span>
        {payoffDate && <span>~{monthsLeft} months (est. {payoffDate})</span>}
        {paidOff && !payoffDate && <span className="text-teal font-bold">Complete!</span>}
      </div>
    </div>
  );
}

const COLORS = ['bg-coral', 'bg-sky', 'bg-violet', 'bg-mustard', 'bg-teal'];

function SnowballHill({ pctPaid, hasActiveDebts }) {
  const t = Math.max(0, Math.min(1, pctPaid));
  const done = t >= 1 || !hasActiveDebts;

  // Waypoints along the slope surface: top of the hill, bottom of the slope,
  // then out onto the flat ground.
  const P0 = { x: 80, y: 93 };
  const P1 = { x: 520, y: 220 };
  const P2 = { x: 660, y: 220 };
  const pos = f => {
    if (f < 0.8) {
      const u = f / 0.8;
      return { x: P0.x + (P1.x - P0.x) * u, y: P0.y + (P1.y - P0.y) * u };
    }
    const u = (f - 0.8) / 0.2;
    return { x: P1.x + (P2.x - P1.x) * u, y: P1.y + (P2.y - P1.y) * u };
  };

  const r = 32 - 23 * t; // diameter ~64px at 0% paid, ~18px at 100%
  const c = pos(t);
  const flags = [
    { pct: 0.25, color: '#12b3a4' },
    { pct: 0.5, color: '#ff5b57' },
    { pct: 0.75, color: '#6b5be6' },
  ];

  return (
    <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
      <h3 className="text-xl font-display font-extrabold text-ink mb-1">The Snowball</h3>
      <p className="text-sm text-ink/60 mb-4">It starts big at the top of the hill. Every payment rolls it further down and shrinks it.</p>
      <svg viewBox="0 0 800 260" className="w-full h-auto block rounded-xl border-2 border-ink">
        <rect x="0" y="0" width="800" height="260" fill="#f5efe2" />
        <circle cx="700" cy="48" r="26" fill="#ffc531" stroke="#17140d" strokeWidth="3" />
        <circle cx="120" cy="40" r="6" fill="#12b3a4" stroke="#17140d" strokeWidth="2.5" />
        <path d="M600 42 Q606 36 612 42 T624 42" fill="none" stroke="#17140d" strokeWidth="3" strokeLinecap="round" />
        <path d="M0 70 L520 220 L800 220 L800 260 L0 260 Z" fill="#ffffff" stroke="#17140d" strokeWidth="3" strokeLinejoin="round" />

        {flags.map(f => {
          const p = pos(f.pct);
          const lit = t >= f.pct;
          return (
            <g key={f.pct}>
              <line x1={p.x} y1={p.y} x2={p.x} y2={p.y - 30} stroke="#17140d" strokeWidth="3" />
              <polygon
                points={`${p.x},${p.y - 30} ${p.x + 18},${p.y - 24} ${p.x},${p.y - 18}`}
                fill={lit ? f.color : '#ffffff'}
                stroke="#17140d"
                strokeWidth="2.5"
                strokeLinejoin="round"
                style={{ transition: 'fill 0.6s ease' }}
              />
            </g>
          );
        })}

        <g transform={`translate(${c.x} ${c.y - r * 0.95})`} style={{ transition: 'transform 1s ease' }}>
          <circle r={r} fill="#ffffff" stroke="#17140d" strokeWidth="3" style={{ transition: 'r 1s ease' }} />
          <path d={`M ${-r * 0.6} ${-r * 0.2} Q 0 ${-r * 0.55} ${r * 0.6} ${-r * 0.2}`} fill="none" stroke="#17140d" strokeWidth="1.5" />
          <path d={`M ${-r * 0.6} ${r * 0.25} Q 0 ${r * 0.6} ${r * 0.6} ${r * 0.25}`} fill="none" stroke="#17140d" strokeWidth="1.5" />
          <text
            y={-r - 12}
            textAnchor="middle"
            fontFamily="'Bricolage Grotesque', sans-serif"
            fontWeight="800"
            fontSize="15"
            fill="#17140d"
            stroke="#f5efe2"
            strokeWidth="4"
            paintOrder="stroke"
          >
            {Math.round(t * 100)}% paid
          </text>
        </g>

        {done && (
          <g transform="rotate(-3 650 165)">
            <rect x="555" y="145" width="190" height="40" rx="10" fill="#ffc531" stroke="#17140d" strokeWidth="3" />
            <text x="650" y="171" textAnchor="middle" fontFamily="'Bricolage Grotesque', sans-serif" fontWeight="800" fontSize="20" fill="#17140d">
              DEBT FREE!
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function DebtTracker() {
  const { state, dispatch } = useBudget();
  const stats = getDebtStats(state.debts);

  return (
    <div className="space-y-6 animate-fade-in">
      <SnowballHill pctPaid={stats.pctPaid} hasActiveDebts={state.debts.some(d => d.currentBalance > 0)} />

      <div className="bg-white rounded-[22px] border-[3px] border-ink hard-shadow p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <span className="text-xs text-ink/40">Total Original</span>
            <div className="text-lg font-display font-extrabold text-ink">{fmt(stats.totalOriginal)}</div>
          </div>
          <div>
            <span className="text-xs text-ink/40">Remaining</span>
            <div className="text-lg font-display font-extrabold text-coral">{fmt(stats.totalCurrent)}</div>
          </div>
          <div>
            <span className="text-xs text-ink/40">Total Paid</span>
            <div className="text-lg font-display font-extrabold text-teal">{fmt(stats.totalPaid)}</div>
          </div>
          <div>
            <span className="text-xs text-ink/40">Monthly Minimums</span>
            <div className="text-lg font-display font-extrabold">
              <span className="bg-mustard text-ink px-2 py-0.5 rounded-md border-2 border-ink">{fmt(stats.totalMinPayment)}</span>
            </div>
          </div>
        </div>
        <ProgressBar value={stats.totalPaid} max={stats.totalOriginal} color="bg-teal" height="h-4" />
        <div className="text-center text-sm text-teal font-bold mt-2">{(stats.pctPaid * 100).toFixed(1)}% of all debt eliminated</div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-display font-extrabold text-ink">All Debts</h3>
        <button
          onClick={() => dispatch({ type: 'ADD_DEBT' })}
          className="flex items-center gap-1.5 text-sm font-bold text-ink bg-white border-2 border-ink rounded-full px-3 py-1 hard-shadow-sm press cursor-pointer"
        >
          <Plus size={16} /> Add Debt
        </button>
      </div>

      <div className="space-y-4">
        {state.debts.map((debt, i) => (
          <DebtRow key={debt.id} debt={debt} dispatch={dispatch} color={COLORS[i % COLORS.length]} />
        ))}
      </div>

      <SnowballSimulator />
    </div>
  );
}
