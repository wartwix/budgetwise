import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import ProjectModal from '../components/ProjectModal';
import AllocateModal from '../components/AllocateModal';

export default function Projects() {
  const { projects, deleteProject } = useBudget();
  const [showProject, setShowProject]   = useState(false);
  const [showAllocate, setShowAllocate] = useState(null);
  const [editing, setEditing]           = useState(null);

  const fmt = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  const openEdit = (p) => { setEditing(p); setShowProject(true); };
  const closeProject = () => { setShowProject(false); setEditing(null); };

  return (
    <div className="animate-in">
      {showProject && <ProjectModal onClose={closeProject} editing={editing} />}
      {showAllocate && <AllocateModal project={showAllocate} onClose={() => setShowAllocate(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Mes Projets 🎯</h1>
          <p>Gérez vos objectifs d'épargne</p>
        </div>
        <button className="btn-bw btn-bw-primary" onClick={() => setShowProject(true)}>+ Nouveau projet</button>
      </div>

      {projects.length === 0 ? (
        <div className="bw-card"><div className="empty-state"><p>Aucun projet. Créez-en un !</p></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 20 }}>
          {projects.map(p => {
            const pct = Math.min(100, Math.round((parseFloat(p.allocated) / parseFloat(p.target)) * 100));
            const done = pct >= 100;
            return (
              <div key={p.id} className="bw-card" style={{ border: `1px solid ${p.color}30` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${p.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                      {p.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{p.name}</div>
                      {p.deadline && <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                        Objectif : {new Date(p.deadline).toLocaleDateString('fr-FR')}
                      </div>}
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: p.color, fontSize: '1rem' }}>
                    {pct}%
                  </span>
                </div>

                <div className="bw-progress" style={{ marginBottom: 8 }}>
                  <div className="bw-progress-bar" style={{ width: `${pct}%`, background: p.color }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  <span>{fmt(p.allocated)}</span>
                  <span>{fmt(p.target)}</span>
                </div>

                {p.description && (
                  <p style={{ fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: 14 }}>{p.description}</p>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  {!done && (
                    <button className="btn-bw btn-bw-primary" style={{ flex: 1, fontSize: '.82rem' }}
                      onClick={() => setShowAllocate(p)}>💸 Allouer</button>
                  )}
                  {done && (
                    <div style={{ flex: 1, textAlign: 'center', color: 'var(--green)', fontWeight: 700, fontSize: '.85rem' }}>
                      ✅ Objectif atteint !
                    </div>
                  )}
                  <button className="btn-bw btn-bw-ghost" style={{ padding: '8px 12px' }} onClick={() => openEdit(p)}>✏️</button>
                  <button className="btn-bw btn-bw-danger" style={{ padding: '8px 12px' }} onClick={() => deleteProject(p.id)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
