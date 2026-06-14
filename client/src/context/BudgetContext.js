import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const API = 'https://budgetwise-g571.onrender.com';

export const CATEGORIES = [
  { id: 'alimentation',  label: 'Alimentation',  icon: '🛒', color: '#3fb950' },
  { id: 'logement',      label: 'Logement',       icon: '🏠', color: '#58a6ff' },
  { id: 'transport',     label: 'Transport',      icon: '🚗', color: '#e3b341' },
  { id: 'sante',         label: 'Santé',          icon: '💊', color: '#f85149' },
  { id: 'loisirs',       label: 'Loisirs',        icon: '🎮', color: '#a371f7' },
  { id: 'education',     label: 'Éducation',      icon: '📚', color: '#79c0ff' },
  { id: 'projets',       label: 'Projets',        icon: '🎯', color: '#ffa657' },
  { id: 'revenu',        label: 'Revenu',         icon: '💰', color: '#7ee787' },
  { id: 'autre',         label: 'Autre',          icon: '📦', color: '#8b949e' },
];

const BudgetContext = createContext();
export const useBudget = () => useContext(BudgetContext);
export { BudgetContext };

export function BudgetProvider({ children }) {
  const [token, setToken]           = useState(() => localStorage.getItem('bw_token'));
  const [user, setUser]             = useState(() => JSON.parse(localStorage.getItem('bw_user') || 'null'));
  const [transactions, setTx]       = useState([]);
  const [projects, setProjects]     = useState([]);
  const [budgets, setBudgets]       = useState({});
  const [loading, setLoading]       = useState(false);

  const authFetch = useCallback((path, options = {}) =>
    fetch(`${API}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    }), [token]);

  const saveSession = (tok, usr) => {
    localStorage.setItem('bw_token', tok);
    localStorage.setItem('bw_user', JSON.stringify(usr));
    setToken(tok); setUser(usr);
  };

  const logout = () => {
    localStorage.removeItem('bw_token'); localStorage.removeItem('bw_user');
    setToken(null); setUser(null); setTx([]); setProjects([]); setBudgets({});
  };

  const login = async (email, password) => {
    const r = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Erreur connexion');
    saveSession(data.token, data.user);
  };

  const register = async (email, password) => {
    const r = await fetch(`${API}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Erreur inscription');
    saveSession(data.token, data.user);
  };

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [txRes, prRes, buRes] = await Promise.all([
        authFetch('/api/transactions'),
        authFetch('/api/projects'),
        authFetch('/api/budgets'),
      ]);
      if (txRes.status === 401 || txRes.status === 403) { logout(); return; }
      setTx(await txRes.json());
      setProjects(await prRes.json());
      setBudgets(await buRes.json());
    } finally {
      setLoading(false);
    }
  }, [token, authFetch]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Transactions ────────────────────────────────────────────────────────────
  const addTransaction = async (tx) => {
    const r = await authFetch('/api/transactions', { method: 'POST', body: JSON.stringify(tx) });
    const created = await r.json();
    if (r.ok) setTx(prev => [created, ...prev]);
  };

  const editTransaction = async (id, tx) => {
    const r = await authFetch(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(tx) });
    const updated = await r.json();
    if (r.ok) setTx(prev => prev.map(t => t.id === id ? updated : t));
  };

  const deleteTransaction = async (id) => {
    await authFetch(`/api/transactions/${id}`, { method: 'DELETE' });
    setTx(prev => prev.filter(t => t.id !== id));
  };

  // ── Projects ────────────────────────────────────────────────────────────────
  const addProject = async (proj) => {
    const r = await authFetch('/api/projects', { method: 'POST', body: JSON.stringify(proj) });
    const created = await r.json();
    if (r.ok) setProjects(prev => [...prev, created]);
  };

  const updateProject = async (id, proj) => {
    const r = await authFetch(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(proj) });
    const updated = await r.json();
    if (r.ok) setProjects(prev => prev.map(p => p.id === id ? updated : p));
  };

  const allocateFunds = async (id, amount) => {
    const r = await authFetch(`/api/projects/${id}/allocate`, { method: 'POST', body: JSON.stringify({ amount }) });
    const updated = await r.json();
    if (r.ok) {
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
      await loadAll(); // refresh transactions too
    }
  };

  const deleteProject = async (id) => {
    await authFetch(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // ── Budgets ─────────────────────────────────────────────────────────────────
  const updateBudgets = async (newBudgets) => {
    await authFetch('/api/budgets', { method: 'PUT', body: JSON.stringify(newBudgets) });
    setBudgets(newBudgets);
  };

  // ── Reset ────────────────────────────────────────────────────────────────────
  const resetData = async () => {
    await authFetch('/api/reset', { method: 'DELETE' });
    setTx([]); setProjects([]); setBudgets({});
  };

  // ── Computed ─────────────────────────────────────────────────────────────────
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTx = transactions.filter(t => t.date && t.date.slice(0, 7) === currentMonth);

  const totalRevenu  = useMemo(() => monthTx.filter(t => t.type === 'revenu').reduce((s, t) => s + parseFloat(t.amount), 0), [monthTx]);
  const totalDepense = useMemo(() => monthTx.filter(t => t.type === 'depense').reduce((s, t) => s + parseFloat(t.amount), 0), [monthTx]);
  const solde        = totalRevenu - totalDepense;
  const totalAllocated = useMemo(() => projects.reduce((s, p) => s + parseFloat(p.allocated || 0), 0), [projects]);

  const depensesByCategory = useMemo(() => {
    const map = {};
    CATEGORIES.forEach(c => { map[c.id] = 0; });
    monthTx.filter(t => t.type === 'depense').forEach(t => {
      if (map[t.category] !== undefined) map[t.category] += parseFloat(t.amount);
      else map['autre'] = (map['autre'] || 0) + parseFloat(t.amount);
    });
    return map;
  }, [monthTx]);

  const alerts = useMemo(() => {
    return CATEGORIES.filter(cat => (budgets[cat.id] || 0) > 0 && (depensesByCategory[cat.id] || 0) >= (budgets[cat.id] || 0) * 0.8)
      .map(cat => ({
        id: cat.id, label: cat.label, icon: cat.icon,
        spent: depensesByCategory[cat.id] || 0,
        limit: budgets[cat.id],
        ratio: (depensesByCategory[cat.id] || 0) / budgets[cat.id],
      }));
  }, [budgets, depensesByCategory]);

  return (
    <BudgetContext.Provider value={{
      token, user, loading,
      login, register, logout,
      transactions, addTransaction, editTransaction, deleteTransaction,
      projects, addProject, updateProject, allocateFunds, deleteProject,
      budgets, updateBudgets,
      resetData,
      solde, totalRevenu, totalDepense, totalAllocated,
      depensesByCategory, alerts,
    }}>
      {children}
    </BudgetContext.Provider>
  );
}
