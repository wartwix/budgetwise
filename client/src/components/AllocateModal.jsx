import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';

export default function AllocateModal({ project, onClose }) {
  const { solde, allocateFunds } = useBudget();
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState(false);

  const remaining = project.target - project.allocated;
  const maxAlloc  = Math.min(solde, remaining);

  const fmt = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0 || val > maxAlloc) return;
    allocateFunds(project.id, val);
    setDone(true);
  };

  if (done) {
    return (
      <div className="bw-modal-overlay">
        <div className="bw-modal" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 8 }}>Fonds alloués !</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '.9rem' }}>
            <strong style={{ color: project.color, fontFamily: 'var(--font-mono)' }}>{fmt(parseFloat(amount))}</strong> ont été ajoutés à <strong>{project.name}</strong>.
          </p>
          <button className="btn-bw btn-bw-primary" style={{ width: '100%' }} onClick={onClose}>Fermer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bw-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bw-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>💸 Allouer des fonds</h2>
          <button onClick={onClose} className="btn-bw btn-bw-ghost" style={{ padding: '6px 12px' }}>✕</button>
        </div>

        {/* Project recap */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
          borderRadius: 12, marginBottom: 20,
          background: `${project.color}12`, border: `1px solid ${project.color}40`,
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: `${project.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem',
          }}>{project.icon}</div>
          <div>
            <div style={{ fontWeight: 700 }}>{project.name}</div>
            <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>
              {fmt(project.allocated)} / {fmt(project.target)} — reste {fmt(remaining)}
            </div>
          </div>
        </div>

        {/* Barre progression actuelle */}
        <div style={{ marginBottom: 20 }}>
          <div className="bw-progress">
            <div className="bw-progress-bar" style={{
              width: `${Math.min(100, (project.allocated / project.target) * 100)}%`,
              background: project.color,
            }} />
          </div>
        </div>

        {/* Infos solde */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20,
        }}>
          <div style={{ padding: '12px', borderRadius: 10, background: 'var(--green-glow)', border: '1px solid rgba(63,185,80,.3)' }}>
            <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>SOLDE DISPONIBLE</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green)', fontSize: '1.1rem' }}>{fmt(solde)}</div>
          </div>
          <div style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>RESTE À ATTEINDRE</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: project.color, fontSize: '1.1rem' }}>{fmt(remaining)}</div>
          </div>
        </div>

        {maxAlloc <= 0 ? (
          <div className="bw-alert alert-warning">
            <i className="bi bi-exclamation-triangle-fill" />
            <span>Solde insuffisant ou objectif déjà atteint.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="bw-label">Montant à allouer (€)</label>
              <input className="bw-input" type="number" min="1" step="1"
                max={maxAlloc} placeholder={`Max : ${fmt(maxAlloc)}`}
                value={amount} onChange={e => setAmount(e.target.value)} required autoFocus />
            </div>

            {/* Raccourcis rapides */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {[25, 50, 100, Math.floor(maxAlloc)].filter((v, i, a) => a.indexOf(v) === i && v > 0).map(v => (
                <button key={v} type="button"
                  className="btn-bw btn-bw-ghost"
                  style={{ padding: '5px 12px', fontSize: '.8rem' }}
                  onClick={() => setAmount(v)}
                >{v === Math.floor(maxAlloc) ? 'Max' : `${v} €`}</button>
              ))}
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="bw-alert alert-success" style={{ marginBottom: 16 }}>
                <i className="bi bi-check-circle-fill" />
                <span>
                  Après allocation : <strong style={{ fontFamily: 'var(--font-mono)' }}>
                    {fmt(project.allocated + parseFloat(amount))} / {fmt(project.target)}
                  </strong>
                  {' '}({Math.min(100, Math.round(((project.allocated + parseFloat(amount)) / project.target) * 100))}%)
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn-bw btn-bw-ghost" onClick={onClose} style={{ flex: 1 }}>Annuler</button>
              <button type="submit" className="btn-bw btn-bw-primary" style={{ flex: 2 }}>
                <i className="bi bi-send-fill" /> Allouer les fonds
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
