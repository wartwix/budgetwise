import React, { useMemo, useState } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Filler,
} from 'chart.js';
import { useBudget, CATEGORIES } from '../context/BudgetContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Filler);

const CHART_OPTIONS_BASE = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#8b949e', font: { family: 'Sora', size: 12 } } },
    tooltip: {
      backgroundColor: '#161b22', borderColor: '#30363d', borderWidth: 1,
      titleColor: '#e6edf3', bodyColor: '#8b949e',
      callbacks: { label: ctx => ` ${new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(ctx.parsed.y ?? ctx.parsed)}` }
    }
  },
  scales: {
    x: { ticks: { color: '#8b949e' }, grid: { color: 'rgba(48,54,61,.5)' } },
    y: { ticks: { color: '#8b949e', callback: v => `${v}€` }, grid: { color: 'rgba(48,54,61,.5)' } }
  }
};

export default function Charts() {
  const { transactions, depensesByCategory } = useBudget();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0,7));

  const fmt = n => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n);

  const months = useMemo(() => {
    const s = new Set(transactions.map(t => t.date.slice(0,7)));
    return [...s].sort().reverse();
  }, [transactions]);

  // Donut dépenses par catégorie
  const donutData = useMemo(() => {
    const cats = CATEGORIES.filter(c => depensesByCategory[c.id] > 0);
    return {
      labels: cats.map(c => `${c.icon} ${c.label}`),
      datasets: [{ data: cats.map(c => depensesByCategory[c.id]),
        backgroundColor: cats.map(c => `${c.color}cc`),
        borderColor: cats.map(c => c.color),
        borderWidth: 2, hoverOffset: 8 }],
    };
  }, [depensesByCategory]);

  // Bar chart : 6 derniers mois revenus vs dépenses
  const barData = useMemo(() => {
    const last6 = [...new Set(transactions.map(t => t.date.slice(0,7)))].sort().slice(-6);
    return {
      labels: last6.map(m => new Date(m+'-01').toLocaleDateString('fr-FR',{month:'short',year:'2-digit'})),
      datasets: [
        { label: 'Revenus', data: last6.map(m => transactions.filter(t => t.date.startsWith(m) && t.type==='revenu').reduce((s,t)=>s+t.amount,0)),
          backgroundColor: 'rgba(63,185,80,.7)', borderColor: '#3fb950', borderWidth: 1, borderRadius: 6 },
        { label: 'Dépenses', data: last6.map(m => transactions.filter(t => t.date.startsWith(m) && t.type==='depense').reduce((s,t)=>s+t.amount,0)),
          backgroundColor: 'rgba(248,81,73,.7)', borderColor: '#f85149', borderWidth: 1, borderRadius: 6 },
      ],
    };
  }, [transactions]);

  // Line chart : évolution solde cumulatif
  const lineData = useMemo(() => {
    const txMonth = transactions.filter(t => t.date.startsWith(selectedMonth))
      .sort((a,b) => a.date.localeCompare(b.date));
    let running = 0;
    const points = txMonth.map(t => {
      running += t.type === 'revenu' ? t.amount : -t.amount;
      return { x: new Date(t.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}), y: running };
    });
    return {
      labels: points.map(p => p.x),
      datasets: [{ label: 'Solde cumulatif', data: points.map(p => p.y),
        borderColor: '#58a6ff', backgroundColor: 'rgba(88,166,255,.1)',
        pointBackgroundColor: '#58a6ff', pointRadius: 4, tension: .4, fill: true }],
    };
  }, [transactions, selectedMonth]);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Graphiques 📈</h1>
        <p>Visualisez vos finances en un coup d'œil</p>
      </div>

      <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
        {/* Donut */}
        <div className="bw-card">
          <div className="section-title">Répartition des dépenses du mois</div>
          {Object.values(depensesByCategory).every(v => v === 0) ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <i className="bi bi-pie-chart" />
              <p>Aucune dépense ce mois-ci</p>
            </div>
          ) : (
            <div style={{ height: 280, position: 'relative' }}>
              <Doughnut data={donutData} options={{
                ...CHART_OPTIONS_BASE,
                scales: {},
                plugins: {
                  ...CHART_OPTIONS_BASE.plugins,
                  legend: { position: 'right', labels: { color: '#8b949e', font: { family: 'Sora', size: 11 }, boxWidth: 12 } }
                }
              }} />
            </div>
          )}
        </div>

        {/* Bar */}
        <div className="bw-card">
          <div className="section-title">Revenus vs Dépenses (6 mois)</div>
          <div style={{ height: 280 }}>
            <Bar data={barData} options={CHART_OPTIONS_BASE} />
          </div>
        </div>
      </div>

      {/* Line */}
      <div className="bw-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="section-title" style={{ margin: 0 }}>Évolution du solde cumulatif</div>
          <select className="bw-input bw-select" style={{ width: 'auto' }}
            value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
            {months.map(m => <option key={m} value={m}>{new Date(m+'-01').toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</option>)}
          </select>
        </div>
        {lineData.labels.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <i className="bi bi-graph-up" />
            <p>Aucune donnée pour ce mois</p>
          </div>
        ) : (
          <div style={{ height: 260 }}>
            <Line data={lineData} options={{
              ...CHART_OPTIONS_BASE,
              plugins: { ...CHART_OPTIONS_BASE.plugins,
                tooltip: { ...CHART_OPTIONS_BASE.plugins.tooltip,
                  callbacks: { label: ctx => ` Solde : ${fmt(ctx.parsed.y)}` }
                }
              }
            }} />
          </div>
        )}
      </div>

      {/* Stats rapides */}
      <div className="grid-4" style={{ marginTop: 24 }}>
        {CATEGORIES.filter(c => depensesByCategory[c.id] > 0).map(cat => (
          <div key={cat.id} className="bw-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
            }}>{cat.icon}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: cat.color, fontSize: '.95rem' }}>
                {fmt(depensesByCategory[cat.id])}
              </div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{cat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
