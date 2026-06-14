import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ============================================================================
//  ⚙️  CONFIG — Remplace YOUR_TAILSCALE_IP par l'IP Tailscale de ton serveur.
// ============================================================================
const API = 'https://budgetwise-g571.onrender.com';

// ============================================================================
//  🎨  CSS — Constante unique injectée (design "Banque Privée / Institutionnel",
//      couleurs froides, sidebar fixe). Ne pas éclater dans des classes externes.
// ============================================================================
const CSS = `
  :root{
    --bg:#0d1b2a; --bg-card:#1b263b; --bg-input:#152033; --border:#2a3a55;
    --text:#e0e6f0; --muted:#8da2c0; --green:#4ade80; --red:#f87171;
    --accent:#3b6ea5; --gold:#d4af37; --font:'Segoe UI',Tahoma,sans-serif;
    --mono:'JetBrains Mono','Consolas',monospace;
  }
  *{box-sizing:border-box} body{margin:0}
  .bw-app{font-family:var(--font);background:var(--bg);color:var(--text);min-height:100vh}
  /* --- Sidebar --- */
  .bw-sidebar{position:fixed;top:0;left:0;width:240px;height:100vh;background:var(--bg-card);
    border-right:1px solid var(--border);display:flex;flex-direction:column;z-index:100}
  .bw-logo{padding:24px 20px;border-bottom:1px solid var(--border);font-weight:800;font-size:1.2rem;letter-spacing:-.02em}
  .bw-logo small{display:block;font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;font-weight:400;margin-top:2px}
  .bw-nav{flex:1;padding:14px 10px}
  .bw-nav button{display:flex;align-items:center;gap:12px;width:100%;padding:11px 14px;margin-bottom:4px;
    border:none;border-radius:8px;background:transparent;color:var(--muted);font-size:.9rem;cursor:pointer;text-align:left;border-left:3px solid transparent;transition:.15s}
  .bw-nav button:hover{background:rgba(255,255,255,.04);color:var(--text)}
  .bw-nav button.active{background:rgba(59,110,165,.18);color:var(--text);border-left-color:var(--accent);font-weight:600}
  .bw-foot{padding:16px;border-top:1px solid var(--border)}
  .bw-logout{display:flex;align-items:center;gap:10px;width:100%;padding:11px;border:1px solid var(--border);
    border-radius:8px;background:transparent;color:var(--red);font-size:.85rem;cursor:pointer;transition:.15s}
  .bw-logout:hover{background:rgba(248,113,113,.1)}
  /* --- Main --- */
  .bw-main{margin-left:240px;padding:36px 44px;max-width:1100px}
  .bw-h1{font-size:1.7rem;font-weight:800;margin:0 0 4px}
  .bw-sub{color:var(--muted);margin:0 0 28px;font-size:.9rem}
  /* --- Cards / stats --- */
  .bw-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:30px}
  .bw-card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:22px}
  .bw-stat-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:8px}
  .bw-stat-value{font-family:var(--mono);font-size:1.6rem;font-weight:700}
  /* --- Form --- */
  .bw-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px}
  .bw-input,.bw-select{background:var(--bg-input);border:1px solid var(--border);border-radius:8px;
    padding:11px 13px;color:var(--text);font-size:.9rem;font-family:var(--font)}
  .bw-input:focus,.bw-select:focus{outline:none;border-color:var(--accent)}
  .bw-btn{background:var(--accent);border:none;border-radius:8px;padding:11px 20px;color:#fff;
    font-size:.9rem;font-weight:600;cursor:pointer;transition:.15s}
  .bw-btn:hover{filter:brightness(1.12)} .bw-btn:disabled{opacity:.5;cursor:not-allowed}
  /* --- Table --- */
  .bw-table{width:100%;border-collapse:collapse}
  .bw-table th{text-align:left;font-size:.7rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);
    padding:10px 12px;border-bottom:1px solid var(--border)}
  .bw-table td{padding:13px 12px;border-bottom:1px solid var(--border);font-size:.9rem}
  .bw-badge{font-size:.7rem;padding:3px 9px;border-radius:20px;background:var(--bg-input);color:var(--muted)}
  .bw-pos{color:var(--green);font-family:var(--mono);font-weight:600}
  .bw-neg{color:var(--red);font-family:var(--mono);font-weight:600}
  /* --- Login screen --- */
  .bw-login{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 30% 20%,#13243a,#0d1b2a)}
  .bw-login-box{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:40px;width:380px;box-shadow:0 20px 60px rgba(0,0,0,.4)}
  .bw-login-box h1{font-size:1.5rem;margin:0 0 4px;text-align:center}
  .bw-login-box p{color:var(--muted);text-align:center;margin:0 0 26px;font-size:.85rem}
  .bw-field{margin-bottom:14px}
  .bw-field label{display:block;font-size:.75rem;color:var(--muted);margin-bottom:6px}
  .bw-field input{width:100%}
  .bw-err{background:rgba(248,113,113,.12);border:1px solid var(--red);color:var(--red);
    padding:9px 12px;border-radius:8px;font-size:.82rem;margin-bottom:14px}
  .bw-switch{text-align:center;margin-top:18px;font-size:.82rem;color:var(--muted)}
  .bw-switch button{background:none;border:none;color:var(--accent);cursor:pointer;font-weight:600;font-size:.82rem}
`;

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

// ============================================================================
//  🔐  CONTEXTE — Stocke le token JWT + l'utilisateur + les transactions.
//      C'est ici que transitent toutes les données entre l'API et l'UI.
// ============================================================================
const BudgetContext = createContext();
const useBudget = () => useContext(BudgetContext);

function BudgetProvider({ children }) {
  // On initialise le token depuis localStorage => la session survit au rafraîchissement (F5).
  const [token, setToken] = useState(() => localStorage.getItem('bw_token'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('bw_user') || 'null'));
  const [transactions, setTransactions] = useState([]);

  // Helper central : ajoute AUTOMATIQUEMENT le header "Authorization: Bearer <token>"
  // à chaque appel fetch protégé. C'est ce header que le middleware serveur vérifie.
  const authFetch = useCallback((path, options = {}) => {
    return fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  }, [token]);

  // Enregistre token + user (mémoire React + localStorage) après login/register réussi.
  const saveSession = (tok, usr) => {
    localStorage.setItem('bw_token', tok);
    localStorage.setItem('bw_user', JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  };

  // Déconnexion : on vide le token => l'app retombe sur l'écran de login.
  const logout = () => {
    localStorage.removeItem('bw_token');
    localStorage.removeItem('bw_user');
    setToken(null);
    setUser(null);
    setTransactions([]);
  };

  // Inscription : POST /api/auth/register => renvoie un token directement.
  const register = async (email, password) => {
    const r = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Erreur inscription');
    saveSession(data.token, data.user);
  };

  // Connexion : POST /api/auth/login => vérifie le mot de passe et renvoie le token.
  const login = async (email, password) => {
    const r = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Erreur connexion');
    saveSession(data.token, data.user);
  };

  // Charge les transactions de l'utilisateur connecté (route GET protégée).
  const loadTransactions = useCallback(async () => {
    const r = await authFetch('/api/transactions');
    if (r.status === 401 || r.status === 403) return logout(); // token expiré => déconnexion
    setTransactions(await r.json());
  }, [authFetch]);

  // Ajoute une transaction (route POST protégée), puis met l'état local à jour.
  const addTransaction = async (tx) => {
    const r = await authFetch('/api/transactions', { method: 'POST', body: JSON.stringify(tx) });
    const created = await r.json();
    if (r.ok) setTransactions((prev) => [created, ...prev]);
  };

  // Dès qu'un token est présent, on récupère les données.
  useEffect(() => { if (token) loadTransactions(); }, [token, loadTransactions]);

  // Totaux calculés à la volée (dérivés des transactions).
  const totalRevenu = transactions.filter(t => t.type === 'revenu').reduce((s, t) => s + t.montant, 0);
  const totalDepense = transactions.filter(t => t.type === 'depense').reduce((s, t) => s + t.montant, 0);
  const solde = totalRevenu - totalDepense;

  return (
    <BudgetContext.Provider value={{
      token, user, transactions, totalRevenu, totalDepense, solde,
      login, register, logout, addTransaction,
    }}>
      {children}
    </BudgetContext.Provider>
  );
}

// ============================================================================
//  📺  ÉCRAN DE CONNEXION / INSCRIPTION
// ============================================================================
function LoginScreen() {
  const { login, register } = useBudget();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bw-login">
      <form className="bw-login-box" onSubmit={submit}>
        <h1>💼 BudgetWise</h1>
        <p>{mode === 'login' ? 'Accès à votre espace privé' : 'Créer un nouveau compte'}</p>
        {error && <div className="bw-err">{error}</div>}
        <div className="bw-field">
          <label>Email</label>
          <input className="bw-input" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="matteo@test.com" required />
        </div>
        <div className="bw-field">
          <label>Mot de passe</label>
          <input className="bw-input" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <button className="bw-btn" style={{ width: '100%' }} disabled={loading}>
          {loading ? '...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
        </button>
        <div className="bw-switch">
          {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà inscrit ?'}{' '}
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
//  📊  TABLEAU DE BORD + TRANSACTIONS (vue principale après connexion)
// ============================================================================
function Dashboard() {
  const { transactions, solde, totalRevenu, totalDepense, addTransaction } = useBudget();
  const [form, setForm] = useState({ description: '', montant: '', type: 'depense' });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.montant) return;
    await addTransaction({
      description: form.description,
      montant: Math.abs(parseFloat(form.montant)),
      type: form.type,
      date: new Date().toISOString().slice(0, 10),
    });
    setForm({ description: '', montant: '', type: 'depense' });
  };

  return (
    <>
      <h1 className="bw-h1">Tableau de bord</h1>
      <p className="bw-sub">Synthèse de votre situation financière</p>

      <div className="bw-grid">
        <div className="bw-card"><div className="bw-stat-label">Solde disponible</div>
          <div className="bw-stat-value" style={{ color: solde >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(solde)}</div></div>
        <div className="bw-card"><div className="bw-stat-label">Total revenus</div>
          <div className="bw-stat-value" style={{ color: 'var(--green)' }}>{fmt(totalRevenu)}</div></div>
        <div className="bw-card"><div className="bw-stat-label">Total dépenses</div>
          <div className="bw-stat-value" style={{ color: 'var(--red)' }}>{fmt(totalDepense)}</div></div>
      </div>

      <div className="bw-card">
        <h2 style={{ fontSize: '1.05rem', margin: '0 0 18px' }}>Nouvelle transaction</h2>
        <form className="bw-row" onSubmit={submit}>
          <input className="bw-input" style={{ flex: 2 }} placeholder="Description"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="bw-input" style={{ flex: 1 }} type="number" step="0.01" placeholder="Montant €"
            value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} />
          <select className="bw-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="depense">Dépense</option>
            <option value="revenu">Revenu</option>
          </select>
          <button className="bw-btn">+ Ajouter</button>
        </form>

        <table className="bw-table">
          <thead><tr><th>Date</th><th>Description</th><th>Type</th><th style={{ textAlign: 'right' }}>Montant</th></tr></thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--muted)', padding: 30 }}>Aucune transaction</td></tr>
            ) : transactions.map((t) => (
              <tr key={t.id}>
                <td style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{t.date}</td>
                <td>{t.description}</td>
                <td><span className="bw-badge">{t.type}</span></td>
                <td style={{ textAlign: 'right' }} className={t.type === 'revenu' ? 'bw-pos' : 'bw-neg'}>
                  {t.type === 'revenu' ? '+' : '−'}{fmt(t.montant)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ============================================================================
//  🧭  LAYOUT CONNECTÉ — Sidebar (avec bouton Déconnexion en bas) + contenu.
// ============================================================================
function AppLayout() {
  const { user, solde, logout } = useBudget();
  return (
    <div className="bw-app">
      <aside className="bw-sidebar">
        <div className="bw-logo">💼 BudgetWise<small>Banque privée</small></div>
        <nav className="bw-nav">
          <button className="active">📊 Tableau de bord</button>
        </nav>
        <div className="bw-foot">
          <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: 4 }}>{user?.email}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '.95rem', marginBottom: 14, color: solde >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(solde)}</div>
          {/* Bouton Déconnexion : vide le token et renvoie au login */}
          <button className="bw-logout" onClick={logout}>⎋ Déconnexion</button>
        </div>
      </aside>
      <main className="bw-main"><Dashboard /></main>
    </div>
  );
}

// ============================================================================
//  🚪  PORTE D'ENTRÉE — Pas de token => Login. Sinon => l'application.
// ============================================================================
function Gate() {
  const { token } = useBudget();
  return token ? <AppLayout /> : <LoginScreen />;
}

export default function App() {
  return (
    <BudgetProvider>
      <style>{CSS}</style>
      <Gate />
    </BudgetProvider>
  );
}
