import React, { useState } from 'react';
import { useBudget, CATEGORIES } from '../context/BudgetContext';

export default function Settings() {
  const { budgets, updateBudgets, resetData } = useBudget();
  const [localBudgets, setLocalBudgets] = useState({ ...budgets });
  const [saved, setSaved] = useState(false);

  const fmt = n => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n);

  const handleSave = () => {
    updateBudgets(localBudgets);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('⚠️ Réinitialiser toutes les données ? Cette action est irréversible.')) {
      resetData();
    }
  };

  const totalBudgets = Object.values(localBudgets).reduce((s, v) => s + (parseFloat(v) || 0), 0);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Paramètres ⚙️</h1>
        <p>Configurez vos budgets limites par catégorie</p>
      </div>

      {saved && (
        <div className="bw-alert alert-success" style={{ marginBottom: 20 }}>
          <i className="bi bi-check-circle-fill" />
          <span>Paramètres enregistrés avec succès !</span>
        </div>
      )}

      {/* Budgets par catégorie */}
      <div className="bw-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>💰 Budgets mensuels par catégorie</div>
            <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>
              Définissez un plafond de dépenses pour chaque catégorie. Mettez 0 pour désactiver.
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>BUDGET TOTAL</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold)', fontSize: '1.1rem' }}>
              {fmt(totalBudgets)}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
          {CATEGORIES.map(cat => (
            <div key={cat.id} style={{
              padding: '14px', borderRadius: 12,
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
              }}>{cat.icon}</div>
              <div style={{ flex: 1 }}>
                <label className="bw-label" style={{ marginBottom: 6 }}>{cat.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    className="bw-input"
                    type="number" min="0" step="10"
                    value={localBudgets[cat.id] || 0}
                    onChange={e => setLocalBudgets(b => ({ ...b, [cat.id]: parseFloat(e.target.value) || 0 }))}
                    style={{ paddingRight: 32 }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginLeft: -30 }}>€</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <button className="btn-bw btn-bw-primary" onClick={handleSave}>
            <i className="bi bi-check-lg" /> Enregistrer les budgets
          </button>
          <button className="btn-bw btn-bw-ghost" onClick={() => setLocalBudgets({ ...budgets })}>
            Annuler les modifications
          </button>
        </div>
      </div>

      {/* À propos */}
      <div className="bw-card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 14 }}>ℹ️ À propos de BudgetWise</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            ['Version', '1.0.0'],
            ['Stockage', 'localStorage (navigateur)'],
            ['Framework', 'React 18 + React Router'],
            ['Graphiques', 'Chart.js'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 10, padding: '10px', borderRadius: 8, background: 'var(--bg-input)' }}>
              <span style={{ fontSize: '.78rem', color: 'var(--text-muted)', minWidth: 80 }}>{k}</span>
              <span style={{ fontSize: '.82rem', fontFamily: k === 'Version' ? 'var(--font-mono)' : 'inherit' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bw-card" style={{ border: '1px solid rgba(248,81,73,.3)', background: 'rgba(248,81,73,.04)' }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--red)', marginBottom: 8 }}>⚠️ Zone de danger</div>
        <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Réinitialise toutes vos données (transactions, projets, budgets) et recharge les données de démonstration. Cette action est irréversible.
        </p>
        <button className="btn-bw btn-bw-danger" onClick={handleReset}>
          <i className="bi bi-arrow-counterclockwise" /> Réinitialiser les données
        </button>
      </div>
    </div>
  );
}
