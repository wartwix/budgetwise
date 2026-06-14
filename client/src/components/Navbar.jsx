import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';

const NAV_ITEMS = [
  { to: '/',             icon: 'bi-grid-1x2-fill',     label: 'Tableau de bord' },
  { to: '/transactions', icon: 'bi-arrow-left-right',  label: 'Transactions'    },
  { to: '/graphiques',   icon: 'bi-bar-chart-line-fill',label: 'Graphiques'     },
  { to: '/projets',      icon: 'bi-bullseye',          label: 'Mes Projets'     },
  { to: '/parametres',   icon: 'bi-gear-fill',         label: 'Paramètres'      },
];

export default function Navbar() {
  const { solde, totalRevenu, totalDepense } = useBudget();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="mobile-nav-toggle d-md-none"
        onClick={() => setMobileOpen(o => !o)}
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 200,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text-primary)', borderRadius: 10,
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 18,
        }}
      >
        <i className={`bi bi-${mobileOpen ? 'x' : 'list'}`} />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:149 }} />
      )}

      <nav style={{
        position: 'fixed', top: 0, left: 0,
        width: 240, height: '100vh',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        zIndex: 150,
        transform: mobileOpen ? 'translateX(0)' : undefined,
        transition: 'transform .25s',
      }}
      className="sidebar"
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg,#238636,#3fb950)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>💰</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-.01em' }}>BudgetWise</div>
              <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Gestion financière</div>
            </div>
          </div>
        </div>

        {/* Solde rapide */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Solde disponible</div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.4rem',
            color: solde >= 0 ? 'var(--green)' : 'var(--red)',
          }}>
            {fmt(solde)}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <div style={{ fontSize: '.72rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--green)' }}>↑</span> {fmt(totalRevenu)}
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--red)' }}>↓</span> {fmt(totalDepense)}
            </div>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.1em', padding: '8px 10px', marginBottom: 4 }}>Navigation</div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10,
                marginBottom: 2,
                textDecoration: 'none',
                fontSize: '.875rem', fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(255,255,255,.06)' : 'transparent',
                transition: 'all .18s',
                borderLeft: isActive ? '3px solid var(--green)' : '3px solid transparent',
              })}
            >
              <i className={`bi ${item.icon}`} style={{ fontSize: '1rem', width: 18, textAlign: 'center' }} />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', fontSize: '.72rem', color: 'var(--text-muted)' }}>
          <div style={{ marginBottom: 2 }}>💡 Données stockées localement</div>
          <div>BudgetWise v1.0 — 2026</div>
        </div>
      </nav>
    </>
  );
}
