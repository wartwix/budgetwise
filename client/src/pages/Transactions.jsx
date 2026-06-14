import React, { useState } from 'react';
import { useBudget, CATEGORIES } from '../context/BudgetContext';
import TransactionModal from '../components/TransactionModal';

export default function Transactions() {
  const { transactions, deleteTransaction } = useBudget();
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterCat, setFilterCat]   = useState('all');
  const [search, setSearch]         = useState('');

  const fmt = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCat !== 'all' && t.category !== filterCat) return false;
    if (search && !t.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openEdit = (tx) => { setEditing(tx); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  return (
    <div className="animate-in">
      {showModal && <TransactionModal onClose={closeModal} editing={editing} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Transactions 💳</h1>
          <p>Historique complet de vos mouvements</p>
        </div>
        <button className="btn-bw btn-bw-primary" onClick={() => setShowModal(true)}>
          + Ajouter
        </button>
      </div>

      {/* Filtres */}
      <div className="bw-card" style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="bw-input" placeholder="🔍 Rechercher..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
        <select className="bw-input bw-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Tous les types</option>
          <option value="revenu">Revenus</option>
          <option value="depense">Dépenses</option>
        </select>
        <select className="bw-input bw-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
      </div>

      <div className="bw-card">
        {filtered.length === 0 ? (
          <div className="empty-state"><p>Aucune transaction trouvée</p></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Date', 'Description', 'Catégorie', 'Type', 'Montant', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: '.7rem', textTransform: 'uppercase',
                    letterSpacing: '.06em', color: 'var(--text-muted)', padding: '10px 12px',
                    borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const cat = CATEGORIES.find(c => c.id === t.category);
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(48,54,61,.4)' }}>
                    <td style={{ padding: '12px', fontSize: '.82rem', color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)' }}>
                      {new Date(t.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, fontSize: '.88rem' }}>{t.label}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: `${cat?.color || '#8b949e'}20`, color: cat?.color || '#8b949e',
                        padding: '3px 10px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600 }}>
                        {cat?.icon} {cat?.label || t.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontSize: '.75rem', padding: '3px 10px', borderRadius: 20,
                        background: t.type === 'revenu' ? 'var(--green-glow)' : 'var(--red-glow)',
                        color: t.type === 'revenu' ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                      className={t.type === 'revenu' ? 'amount-positive' : 'amount-negative'}>
                      {t.type === 'revenu' ? '+' : '-'}{fmt(t.amount)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(t)} className="btn-bw btn-bw-ghost"
                          style={{ padding: '4px 10px', fontSize: '.75rem' }}>✏️</button>
                        <button onClick={() => deleteTransaction(t.id)} className="btn-bw btn-bw-danger"
                          style={{ padding: '4px 10px', fontSize: '.75rem' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
