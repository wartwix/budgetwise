import React, { useState, useEffect } from 'react';
import { useBudget, CATEGORIES } from '../context/BudgetContext';

const EMPTY = { type: 'depense', amount: '', category: 'alimentation', label: '', date: '', note: '' };

export default function TransactionModal({ onClose, editing = null }) {
  const { addTransaction, editTransaction } = useBudget();
  const [form, setForm] = useState(editing ? {
    type: editing.type, amount: editing.amount, category: editing.category,
    label: editing.label, date: editing.date, note: editing.note || ''
  } : { ...EMPTY, date: new Date().toISOString().slice(0, 10) });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.label || !form.amount || !form.date) return;
    const data = { ...form, amount: parseFloat(form.amount) };
    if (editing) editTransaction(editing.id, data);
    else addTransaction(data);
    onClose();
  };

  return (
    <div className="bw-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bw-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
            {editing ? '✏️ Modifier' : '➕ Nouvelle transaction'}
          </h2>
          <button onClick={onClose} className="btn-bw btn-bw-ghost" style={{ padding: '6px 12px' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type toggle */}
          <div className="form-group">
            <label className="bw-label">Type</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['revenu', 'depense'].map(t => (
                <button key={t} type="button"
                  onClick={() => set('type', t)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10,
                    border: `1px solid ${form.type === t ? (t === 'revenu' ? 'var(--green)' : 'var(--red)') : 'var(--border)'}`,
                    background: form.type === t ? (t === 'revenu' ? 'var(--green-glow)' : 'var(--red-glow)') : 'var(--bg-input)',
                    color: form.type === t ? (t === 'revenu' ? 'var(--green)' : 'var(--red)') : 'var(--text-secondary)',
                    fontFamily: 'var(--font-main)', fontWeight: 600, cursor: 'pointer', fontSize: '.875rem',
                    transition: 'all .18s',
                  }}
                >
                  {t === 'revenu' ? '↑ Revenu' : '↓ Dépense'}
                </button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div className="form-group">
            <label className="bw-label">Description</label>
            <input className="bw-input" placeholder="Ex: Courses, Loyer, Salaire…"
              value={form.label} onChange={e => set('label', e.target.value)} required />
          </div>

          {/* Amount + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="bw-label">Montant (€)</label>
              <input className="bw-input" type="number" min="0.01" step="0.01"
                placeholder="0.00" value={form.amount}
                onChange={e => set('amount', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="bw-label">Date</label>
              <input className="bw-input" type="date"
                value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="bw-label">Catégorie</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} type="button"
                  onClick={() => set('category', cat.id)}
                  title={cat.label}
                  style={{
                    padding: '8px 4px', borderRadius: 10, cursor: 'pointer',
                    border: `1px solid ${form.category === cat.id ? cat.color : 'var(--border)'}`,
                    background: form.category === cat.id ? `${cat.color}22` : 'var(--bg-input)',
                    color: form.category === cat.id ? cat.color : 'var(--text-secondary)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    fontSize: '.65rem', fontFamily: 'var(--font-main)', fontWeight: 600,
                    transition: 'all .18s',
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                  {cat.label.slice(0, 6)}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="form-group">
            <label className="bw-label">Note (optionnel)</label>
            <input className="bw-input" placeholder="Détails supplémentaires…"
              value={form.note} onChange={e => set('note', e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn-bw btn-bw-ghost" onClick={onClose} style={{ flex: 1 }}>Annuler</button>
            <button type="submit" className="btn-bw btn-bw-primary" style={{ flex: 2 }}>
              {editing ? 'Enregistrer' : 'Ajouter la transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
