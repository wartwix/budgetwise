import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Charts from './pages/Charts';
import Projects from './pages/Projects';
import Settings from './pages/Settings';

function LoginScreen() {
  const { login, register } = useBudget();
  const [mode, setMode]     = useState('login');
  const [email, setEmail]   = useState('');
  const [password, setPass] = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoad]  = useState(false);

  const CSS = `
    :root{--bg:#0d1117;--bg-card:#161b22;--bg-input:#0d1117;--border:#30363d;
    --text:#e6edf3;--muted:#8b949e;--green:#3fb950;--red:#f85149;
    --accent:#238636;--font-main:'Sora','Segoe UI',sans-serif;--font-mono:'JetBrains Mono','Consolas',monospace;}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:var(--font-main);background:var(--bg);color:var(--text)}
    .bw-login{min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:radial-gradient(circle at 30% 20%,#0d2137,#0d1117)}
    .bw-login-box{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;
      padding:40px;width:380px;box-shadow:0 20px 60px rgba(0,0,0,.5)}
    .bw-login-box h1{font-size:1.5rem;margin:0 0 4px;text-align:center;font-weight:800}
    .bw-login-box p{color:var(--muted);text-align:center;margin:0 0 26px;font-size:.85rem}
    .bw-field{margin-bottom:14px}
    .bw-field label{display:block;font-size:.75rem;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em}
    .bw-field input{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;
      padding:11px 13px;color:var(--text);font-size:.9rem;font-family:var(--font-main)}
    .bw-field input:focus{outline:none;border-color:var(--accent)}
    .bw-err{background:rgba(248,81,73,.12);border:1px solid var(--red);color:var(--red);
      padding:9px 12px;border-radius:8px;font-size:.82rem;margin-bottom:14px}
    .bw-btn-submit{width:100%;padding:12px;background:var(--accent);border:none;border-radius:8px;
      color:#fff;font-size:.95rem;font-weight:700;cursor:pointer;font-family:var(--font-main);transition:.15s}
    .bw-btn-submit:hover{filter:brightness(1.15)} .bw-btn-submit:disabled{opacity:.5;cursor:not-allowed}
    .bw-switch{text-align:center;margin-top:18px;font-size:.82rem;color:var(--muted)}
    .bw-switch button{background:none;border:none;color:#58a6ff;cursor:pointer;font-weight:600;font-size:.82rem}
  `;

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoad(true);
    try { if (mode === 'login') await login(email, password); else await register(email, password); }
    catch (err) { setError(err.message); }
    finally { setLoad(false); }
  };

  return (
    <div className="bw-login">
      <style>{CSS}</style>
      <form className="bw-login-box" onSubmit={submit}>
        <h1>💼 BudgetWise</h1>
        <p>{mode === 'login' ? 'Accès à votre espace privé' : 'Créer un nouveau compte'}</p>
        {error && <div className="bw-err">{error}</div>}
        <div className="bw-field">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
        </div>
        <div className="bw-field">
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
        </div>
        <button className="bw-btn-submit" disabled={loading}>{loading ? '...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}</button>
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

function AppShell() {
  const { token, logout, user } = useBudget();
  if (!token) return <LoginScreen />;
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ marginLeft: 240, padding: '36px 44px', flex: 1, maxWidth: 1200 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 8, gap: 12 }}>
          <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{user?.email}</span>
          <button onClick={logout} style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--red)', padding: '5px 12px', cursor: 'pointer', fontSize: '.78rem',
            fontFamily: 'var(--font-main)',
          }}>⎋ Déconnexion</button>
        </div>
        <Routes>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/graphiques"  element={<Charts />} />
          <Route path="/projets"     element={<Projects />} />
          <Route path="/parametres"  element={<Settings />} />
          <Route path="*"            element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BudgetProvider>
      <AppShell />
    </BudgetProvider>
  );
}
