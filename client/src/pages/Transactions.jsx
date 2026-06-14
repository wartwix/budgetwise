import React, { useContext, useState } from 'react';
import { BudgetContext } from '../context/BudgetContext';

function Transactions() {
  const { transactions, addTransaction } = useContext(BudgetContext);
  const [formData, setFormData] = useState({ desc: '', amount: '', category: 'Alimentation', type: 'expense' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.desc || !formData.amount) return;

    addTransaction({
      id: Date.now(),
      date: new Date().toLocaleDateString('fr-FR'),
      category: formData.category,
      desc: formData.desc,
      amount: formData.type === 'expense' ? -Math.abs(formData.amount) : Math.abs(formData.amount),
      type: formData.type
    });
    setFormData({ desc: '', amount: '', category: 'Alimentation', type: 'expense' });
  };

  return (
    <div className="card p-4">
      <h3 className="text-vert-foret mb-4">Historique des transactions</h3>
      
      <form onSubmit={handleSubmit} className="row g-3 mb-4 bg-light p-3 rounded">
        <div className="col-md-3">
          <input type="text" className="form-control" placeholder="Description..." value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} required />
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control" placeholder="Montant €" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
            <option value="expense">Dépense</option>
            <option value="income">Revenu</option>
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
            <option>Alimentation</option>
            <option>Transport</option>
            <option>Loisirs</option>
            <option>Santé</option>
            <option>Logement</option>
            <option>Salaire/Revenu</option>
          </select>
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-success w-100">+ Ajouter</button>
        </div>
      </form>

      <table className="table table-hover">
        <thead className="table-light">
          <tr>
            <th>Date</th>
            <th>Catégorie</th>
            <th>Description</th>
            <th className="text-end">Montant</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td><span className={`badge ${t.type === 'income' ? 'bg-success' : 'bg-secondary'}`}>{t.category}</span></td>
              <td>{t.desc}</td>
              <td className={`text-end fw-bold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                {t.amount > 0 ? `+${t.amount}` : t.amount} €
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Transactions;