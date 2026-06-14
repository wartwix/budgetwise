import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';

const ICONS  = ['✈️','💻','🏠','🚗','🎓','💍','🎸','📷','🏋️','🌴','🛡️','🎯','🎁','💊','📱','🍕'];
const COLORS = ['#58a6ff','#3fb950','#e3b341','#a371f7','#f85149','#79c0ff','#ffa657','#ff7b72','#7ee787','#d2a8ff'];

export default function ProjectModal({ onClose, editing = null }) {
  const { addProject, updateProject } = useBudget();
  const [form, setForm] = useState(editing ? {
    name: editing.name, icon: editing.icon, color: editing.color,
    target: editing.target, deadline: editing.deadline || '', description: editing.description || ''
  } : { name: '', icon: '✈️', color: '#58a6ff', target: '', deadline: '', description: '' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, target: parseFloat(form.target) };
    if (editing) updateProject(editing.id, data);
    else addProject(data);
    onClose();
  };

  return (
    <div className="bw-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bw-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
            {editing ? '✏️ Modifier le projet' : '🎯 Nouveau projet'}
          </h2>
          <button onClick={onClose} className="btn-bw btn-bw-ghost" style={{ padding: '6px 12px' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Preview */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '16px', borderRadius: 12, marginBottom: 20,
            background: `${form.color}15`, border: `1px solid ${form.color}40`,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: `${form.color}30`, border: `2px solid ${form.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
            }}>{form.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {form.name || 'Nom du projet'}
              </div>
              <div style={{ color: form.color, fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '.9rem' }}>
                Objectif : {form.target ? `${parseFloat(form.target).toLocaleString('fr-FR')} €` : '— €'}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="bw-label">Nom du projet</label>
            <input className="bw-input" placeholder="Ex: Voyage au Japon, Nouvel ordi…"
              value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="bw-label">Description</label>
            <input className="bw-input" placeholder="Quelques mots sur ce projet…"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="bw-label">Objectif (€)</label>
              <input className="bw-input" type="number" min="1" step="1"
                placeholder="1500" value={form.target}
                onChange={e => set('target', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="bw-label">Date cible</label>
              <input className="bw-input" type="date"
                value={form.deadline} onChange={e => set('deadline', e.target.value)} />
            </div>
          </div>

          {/* Icon picker */}
          <div className="form-group">
            <label className="bw-label">Icône</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ICONS.map(ic => (
                <button key={ic} type="button"
                  onClick={() => set('icon', ic)}
                  style={{
                    width: 40, height: 40, borderRadius: 10, fontSize: '1.3rem',
                    border: `1px solid ${form.icon === ic ? form.color : 'var(--border)'}`,
                    background: form.icon === ic ? `${form.color}22` : 'var(--bg-input)',
                    cursor: 'pointer',
                  }}
                >{ic}</button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="form-group">
            <label className="bw-label">Couleur</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button key={c} type="button"
                  onClick={() => set('color', c)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, background: c,
                    border: form.color === c ? '3px solid white' : '2px solid transparent',
                    cursor: 'pointer', outline: form.color === c ? `2px solid ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn-bw btn-bw-ghost" onClick={onClose} style={{ flex: 1 }}>Annuler</button>
            <button type="submit" className="btn-bw btn-bw-primary" style={{ flex: 2 }}>
              {editing ? 'Enregistrer' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
