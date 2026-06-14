import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudget, CATEGORIES } from '../context/BudgetContext';
import TransactionModal from '../components/TransactionModal';

export default function Dashboard() {
  const { solde, totalRevenu, totalDepense, totalAllocated,
          transactions, projects, alerts, depensesByCategory, budgets } = useBudget();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fmt = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const recentTx = transactions.filter(t => t.date.startsWith(currentMonth)).slice(0, 5);
  const activeProjects = projects.filter(p => p.status === 'active').slice(0, 3);

  return (
    <div className="animate-in">
      {showModal && <TransactionModal onClose={() => setShowModal(false)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Tableau de bord 📊</h1>
          <p>Bienvenue sur BudgetWise — {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button className="btn-bw btn-bw-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg" /> Ajouter
        </button>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {alerts.map(a => (
            <div key={a.id} className={`bw-alert ${a.ratio >= 1 ? 'alert-danger' : 'alert-warning'}`}>
              <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
              <div>
                <strong>{a.ratio >= 1 ? '⚠️ Budget dépassé' : '🔔 Budget presque atteint'}</strong>
                {' '}— {a.label} : <span style={{ fontFamily: 'var(--font-mono)' }}>{fmt(a.spent)}</span> / {fmt(a.limit)}
                {' '}({Math.round(a.ratio * 100)}%)
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: solde >= 0 ? 'var(--green)' : 'var(--red)' }} />
          <div className="stat-icon" style={{ background: 'var(--green-glow)' }}>💰</div>
          <div className="stat-value" style={{ color: solde >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(solde)}</div>
          <div className="stat-label">Solde disponible</div>
        </div>

        <div className="stat-card">
          <div className="stat-glow" style={{ background: 'var(--green)' }} />
          <div className="stat-icon" style={{ background: 'var(--green-glow)' }}>↑</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{fmt(totalRevenu)}</div>
          <div className="stat-label">Revenus du mois</div>
        </div>

        <div className="stat-card">
          <div className="stat-glow" style={{ background: 'var(--red)' }} />
          <div className="stat-icon" style={{ background: 'var(--red-glow)' }}>↓</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{fmt(totalDepense)}</div>
          <div className="stat-label">Dépenses du mois</div>
        </div>

        <div className="stat-card">
          <div className="stat-glow" style={{ background: 'var(--purple)' }} />
          <div className="stat-icon" style={{ background: 'var(--purple-glow)' }}>🎯</div>
          <div className="stat-value" style={{ color: 'var(--purple)' }}>{fmt(totalAllocated)}</div>
          <div className="stat-label">Alloués aux projets</div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid-2" style={{ gap: 24 }}>
        {/* Transactions récentes */}
        <div className="bw-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ margin: 0 }}>Transactions récentes</div>
            <button className="btn-bw btn-bw-ghost" style={{ padding: '4px 12px', fontSize: '.78rem' }}
              onClick={() => navigate('/transactions')}>Tout voir →</button>
          </div>
          {recentTx.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-receipt" />
              <p>Aucune transaction ce mois-ci</p>
            </div>
          ) : (
            recentTx.map(tx => {
              const cat = CATEGORIES.find(c => c.id === tx.category);
              return (
                <div key={tx.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid rgba(48,54,61,.5)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: `${cat?.color || '#8b949e'}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                    }}>{cat?.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{tx.label}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{new Date(tx.date).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>
                  <div className={tx.type === 'revenu' ? 'amount-positive' : 'amount-negative'} style={{ fontSize: '.9rem' }}>
                    {tx.type === 'revenu' ? '+' : '-'}{fmt(tx.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Projets actifs */}
        <div className="bw-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ margin: 0 }}>Projets en cours</div>
            <button className="btn-bw btn-bw-ghost" style={{ padding: '4px 12px', fontSize: '.78rem' }}
              onClick={() => navigate('/projets')}>Tout voir →</button>
          </div>
          {activeProjects.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-bullseye" />
              <p>Aucun projet actif</p>
            </div>
          ) : (
            activeProjects.map(proj => {
              const pct = Math.min(100, Math.round((proj.allocated / proj.target) * 100));
              return (
                <div key={proj.id} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.1rem' }}>{proj.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: '.88rem' }}>{proj.name}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem', color: proj.color, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div className="bw-progress">
                    <div className="bw-progress-bar" style={{ width: `${pct}%`, background: proj.color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '.72rem', color: 'var(--text-muted)' }}>
                    <span>{fmt(proj.allocated)}</span>
                    <span>{fmt(proj.target)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Budget par catégorie */}
        <div className="bw-card" style={{ gridColumn: '1 / -1' }}>
          <div className="section-title">Budget par catégorie</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 12 }}>
            {CATEGORIES.filter(cat => budgets[cat.id] > 0).map(cat => {
              const spent = depensesByCategory[cat.id] || 0;
              const limit = budgets[cat.id];
              const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
              const color = pct >= 100 ? 'var(--red)' : pct >= 80 ? 'var(--gold)' : cat.color;
              return (
                <div key={cat.id} style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', fontWeight: 600 }}>
                      <span>{cat.icon}</span> {cat.label}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', color }}>{pct}%</span>
                  </div>
                  <div className="bw-progress" style={{ height: 5 }}>
                    <div className="bw-progress-bar" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginTop: 5 }}>
                    {fmt(spent)} / {fmt(limit)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
