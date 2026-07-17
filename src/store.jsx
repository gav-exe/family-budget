import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { useAuth } from './auth';

const STORAGE_KEY = 'cox-family-budget';
const SAVE_DEBOUNCE_MS = 800;

const defaultState = {
  gavin: {
    name: 'Gavin',
    paychecks: [
      { name: 'Paycheck 1', amount: 2501 },
      { name: 'Paycheck 2', amount: 2501 },
    ],
    sideHustle: 500,
    expenses: [
      { name: 'Tithing', amount: 500, dueOn: '' },
      { name: 'Groceries', amount: 400, dueOn: '' },
      { name: 'Savings', amount: 400, dueOn: '' },
      { name: 'Kids', amount: 200, dueOn: '' },
      { name: 'Eating Out', amount: 200, dueOn: '' },
      { name: 'Internet', amount: 100, dueOn: '8th' },
      { name: 'Gas', amount: 85, dueOn: '' },
      { name: 'Subscriptions', amount: 137, dueOn: '20th' },
      { name: 'Car Insurance', amount: 81, dueOn: '19th' },
      { name: 'Phone', amount: 50, dueOn: '24th' },
      { name: 'Gavin Spend', amount: 150, dueOn: '' },
      { name: 'Hazel Spend', amount: 150, dueOn: '' },
      { name: 'Predicted Expenses', amount: 500, dueOn: '' },
    ],
    minimumCardPayments: 1200,
  },
  hazel: {
    name: 'Hazel',
    paychecks: [
      { name: 'Paycheck 1', amount: 580 },
      { name: 'Paycheck 2', amount: 580 },
    ],
    sideHustle: 0,
    expenses: [
      { name: 'Tithing', amount: 116, dueOn: '' },
      { name: 'Power / Gas', amount: 300, dueOn: '24th' },
      { name: 'Collections', amount: 100, dueOn: '17th' },
      { name: 'Hospital Bill', amount: 237.50, dueOn: '4th' },
      { name: 'Phone', amount: 86, dueOn: '' },
    ],
    minimumCardPayments: 0,
  },
  debts: [
    { id: 1, name: 'Credit Card (MACU)', originalBalance: 1974.14, currentBalance: 1974.14, minPayment: 49, dueOn: '31st' },
    { id: 2, name: 'Apple Card', originalBalance: 929.06, currentBalance: 0, minPayment: 0, dueOn: '30th' },
    { id: 3, name: 'CitiBank (Home Depot)', originalBalance: 929, currentBalance: 0, minPayment: 0, dueOn: '22nd' },
    { id: 4, name: 'CitiBank (Costco)', originalBalance: 4086.32, currentBalance: 4086.32, minPayment: 127.17, dueOn: '28th' },
    { id: 5, name: 'American Express', originalBalance: 6363, currentBalance: 6363, minPayment: 244.57, dueOn: '19th' },
    { id: 6, name: 'Prime Visa (Amazon)', originalBalance: 7052.39, currentBalance: 7052.39, minPayment: 212, dueOn: '26th' },
    { id: 7, name: 'Debt Loan (MACU)', originalBalance: 14625.07, currentBalance: 14625.07, minPayment: 455.40, dueOn: '27th' },
  ],
  subscriptions: [
    { id: 1, name: 'Claude AI', cost: 20, status: 'Active', notes: 'SleeperJazz' },
    { id: 2, name: 'PickFinder', cost: 20, status: 'Active', notes: 'Personal' },
    { id: 3, name: 'X Premium', cost: 11, status: 'Active', notes: 'SeahawksLead' },
    { id: 4, name: 'Google One', cost: 10, status: 'Active', notes: 'Necessary' },
    { id: 5, name: 'iCloud+', cost: 10, status: 'Active', notes: 'Necessary' },
    { id: 6, name: 'Trakt', cost: 6, status: 'Active', notes: 'Personal' },
    { id: 7, name: 'YouTube Premium', cost: 9, status: 'Active', notes: 'Personal' },
    { id: 8, name: 'Sports Reference', cost: 9, status: 'Active', notes: 'SleeperJazz' },
    { id: 9, name: 'Prime', cost: 8, status: 'Active', notes: 'Necessary' },
    { id: 10, name: 'NBA Play Database', cost: 7, status: 'Active', notes: 'SleeperJazz' },
    { id: 11, name: 'Robinhood', cost: 5, status: 'Active', notes: 'Personal' },
    { id: 12, name: 'KDTIVI', cost: 3, status: 'Active', notes: 'Personal' },
  ],
  calendarBills: [],
  cancun: {
    debts: [
      { id: 1, name: 'Flights', originalBalance: 1897.46, currentBalance: 0, minPayment: 495.59 },
      { id: 2, name: 'Resort', originalBalance: 5500, currentBalance: 870, minPayment: 1300 },
    ],
  },
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaultState;
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'UPDATE_PAYCHECK': {
      const { person, index, amount } = action;
      const p = { ...state[person] };
      p.paychecks = p.paychecks.map((pc, i) => i === index ? { ...pc, amount } : pc);
      return { ...state, [person]: p };
    }
    case 'UPDATE_SIDE_HUSTLE': {
      const { person, amount } = action;
      return { ...state, [person]: { ...state[person], sideHustle: amount } };
    }
    case 'UPDATE_EXPENSE': {
      const { person, index, field, value } = action;
      const p = { ...state[person] };
      p.expenses = p.expenses.map((e, i) => i === index ? { ...e, [field]: value } : e);
      return { ...state, [person]: p };
    }
    case 'ADD_EXPENSE': {
      const { person } = action;
      const p = { ...state[person] };
      p.expenses = [...p.expenses, { name: 'New Expense', amount: 0, dueOn: '' }];
      return { ...state, [person]: p };
    }
    case 'REMOVE_EXPENSE': {
      const { person, index } = action;
      const p = { ...state[person] };
      p.expenses = p.expenses.filter((_, i) => i !== index);
      return { ...state, [person]: p };
    }
    case 'UPDATE_MIN_CARD_PAYMENTS': {
      const { person, amount } = action;
      return { ...state, [person]: { ...state[person], minimumCardPayments: amount } };
    }
    case 'UPDATE_DEBT': {
      const { id, field, value } = action;
      return {
        ...state,
        debts: state.debts.map(d => d.id === id ? { ...d, [field]: value } : d),
      };
    }
    case 'ADD_DEBT': {
      const maxId = Math.max(0, ...state.debts.map(d => d.id));
      return {
        ...state,
        debts: [...state.debts, { id: maxId + 1, name: 'New Debt', originalBalance: 0, currentBalance: 0, minPayment: 0, dueOn: '' }],
      };
    }
    case 'REMOVE_DEBT': {
      return { ...state, debts: state.debts.filter(d => d.id !== action.id) };
    }
    case 'UPDATE_SUBSCRIPTION': {
      const { id, field, value } = action;
      return {
        ...state,
        subscriptions: state.subscriptions.map(s => s.id === id ? { ...s, [field]: value } : s),
      };
    }
    case 'ADD_SUBSCRIPTION': {
      const maxId = Math.max(0, ...state.subscriptions.map(s => s.id));
      return {
        ...state,
        subscriptions: [...state.subscriptions, { id: maxId + 1, name: 'New Sub', cost: 0, status: 'Active', notes: '' }],
      };
    }
    case 'REMOVE_SUBSCRIPTION': {
      return { ...state, subscriptions: state.subscriptions.filter(s => s.id !== action.id) };
    }
    case 'ADD_CALENDAR_BILL': {
      const { day, name, amount, person } = action;
      const maxId = Math.max(0, ...(state.calendarBills || []).map(b => b.id));
      return {
        ...state,
        calendarBills: [...(state.calendarBills || []), { id: maxId + 1, day, name, amount, person }],
      };
    }
    case 'REMOVE_CALENDAR_BILL': {
      return { ...state, calendarBills: (state.calendarBills || []).filter(b => b.id !== action.id) };
    }
    case 'UPDATE_CANCUN_DEBT': {
      const { id, field, value } = action;
      return {
        ...state,
        cancun: {
          ...state.cancun,
          debts: state.cancun.debts.map(d => d.id === id ? { ...d, [field]: value } : d),
        },
      };
    }
    case 'RESET':
      localStorage.removeItem(STORAGE_KEY);
      return defaultState;
    default:
      return state;
  }
}

const BudgetContext = createContext();

export function BudgetProvider({ children }) {
  const { session } = useAuth();
  const [state, dispatch] = useReducer(reducer, null, loadState);
  const hydratedRef = useRef(false);
  const stateRef = useRef(state);
  const saveTimerRef = useRef(null);
  stateRef.current = state;

  const userId = session?.user?.id ?? null;

  // On sign-in: pull the budget down from Supabase.
  // First-ever sign-in: no row exists yet, so migrate the local budget up.
  useEffect(() => {
    if (!isSupabaseConfigured || !userId) {
      hydratedRef.current = false;
      return;
    }
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('data')
        .eq('user_id', userId)
        .maybeSingle();

      if (cancelled) return;

      if (!error && data?.data && Object.keys(data.data).length > 0) {
        dispatch({ type: 'HYDRATE', state: data.data });
      } else {
        await supabase
          .from('budgets')
          .upsert({ user_id: userId, data: stateRef.current });
      }
      hydratedRef.current = true;
    })();

    return () => { cancelled = true; };
  }, [userId]);

  // Persist every change: localStorage instantly (offline cache),
  // Supabase debounced so rapid edits batch into one write.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (!isSupabaseConfigured || !userId || !hydratedRef.current) return;

    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      supabase
        .from('budgets')
        .upsert({ user_id: userId, data: stateRef.current });
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(saveTimerRef.current);
  }, [state, userId]);

  // Realtime: when this budget row changes elsewhere (phone, laptop),
  // hydrate the incoming copy — skipping echoes of our own saves.
  useEffect(() => {
    if (!isSupabaseConfigured || !userId) return;

    const channel = supabase
      .channel(`budget-sync-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${userId}` },
        payload => {
          const incoming = payload.new?.data;
          if (incoming && JSON.stringify(incoming) !== JSON.stringify(stateRef.current)) {
            dispatch({ type: 'HYDRATE', state: incoming });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return (
    <BudgetContext.Provider value={{ state, dispatch }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  return useContext(BudgetContext);
}

export function getPersonTotals(person) {
  const totalIncome = person.paychecks.reduce((s, p) => s + (Number(p.amount) || 0), 0) + (Number(person.sideHustle) || 0);
  const totalExpenses = person.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0) + (Number(person.minimumCardPayments) || 0);
  const available = totalIncome - totalExpenses;
  return { totalIncome, totalExpenses, available };
}

export function getDebtStats(debts) {
  const totalOriginal = debts.reduce((s, d) => s + (Number(d.originalBalance) || 0), 0);
  const totalCurrent = debts.reduce((s, d) => s + (Number(d.currentBalance) || 0), 0);
  const totalMinPayment = debts.reduce((s, d) => s + (Number(d.minPayment) || 0), 0);
  const totalPaid = totalOriginal - totalCurrent;
  const pctPaid = totalOriginal > 0 ? totalPaid / totalOriginal : 0;
  return { totalOriginal, totalCurrent, totalMinPayment, totalPaid, pctPaid };
}
